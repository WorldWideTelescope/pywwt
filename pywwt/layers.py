import sys
import uuid
import tempfile
from os import path
import shutil

import re

if sys.version_info[0] == 2:  # noqa
    from io import BytesIO as StringIO
else:
    from io import StringIO

import warnings
from base64 import b64encode

import numpy as np
from astropy.io import fits
from matplotlib.pyplot import cm
from matplotlib.colors import Colormap
from astropy import units as u
from astropy.table import Column
from astropy.time import Time, TimeDelta

from datetime import datetime

from traitlets import HasTraits, validate, observe
from .traits import Color, Bool, Float, Unicode, AstropyQuantity, Any, to_hex
from .utils import sanitize_image

__all__ = ['LayerManager', 'TableLayer', 'ImageLayer']

VALID_FRAMES = ['sky', 'ecliptic', 'galactic', 'sun', 'mercury', 'venus',
                'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
                'pluto', 'moon', 'io', 'europa', 'ganymede', 'callisto']

VALID_LON_UNITS = {u.deg: 'degrees',
                   u.hour: 'hours',
                   u.hourangle: 'hours'}

# NOTE: for cartesian coordinates, we can also allow custom units
VALID_ALT_UNITS = {u.m: 'meters',
                   u.imperial.foot: 'feet',
                   u.imperial.inch: 'inches',
                   u.imperial.mile: 'miles',
                   u.km: 'kilometers',
                   u.au: 'astronomicalUnits',
                   u.lyr: 'lightYears',
                   u.pc: 'parsecs',
                   u.Mpc: 'megaParsecs'}

VALID_ALT_TYPES = ['depth', 'altitude', 'distance', 'seaLevel', 'terrain']

VALID_MARKER_TYPES = ['gaussian', 'point', 'circle', 'square', 'pushpin']

VALID_MARKER_SCALES = ['screen', 'world']

VALID_STRETCHES = ['linear', 'log', 'power', 'sqrt', 'histeq']

# Create regex test to validate ISOT strings in time series tables
if sys.version_info[0] == 2:
    STR_TYPE = basestring
    NP_STR_TYPE = np.string_
else:
    STR_TYPE = str
    NP_STR_TYPE = np.unicode_

VALID_ISOT_FORMAT = (r'^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-'
                     + r'(3[01]|0[1-9]|[12][0-9])T'
                     + r'(2[0-3]|[01][0-9]):([0-5][0-9]):'
                     + r'([0-5][0-9])'
                     + r'(\.[0-9]+)?(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])?$')
iso_test = re.compile(VALID_ISOT_FORMAT)

# The following are columns that we add dynamically and internally, so we need
# to make sure they have unique names that won't clash with existing columns
SIZE_COLUMN_NAME = str(uuid.uuid4())
CMAP_COLUMN_NAME = str(uuid.uuid4())


def guess_lon_lat_columns(colnames):
    """
    Given column names in a table, return the columns to use for lon/lat, or
    None/None if no high confidence possibilities.
    """

    # Do all the checks in lowercase
    colnames_lower = [colname.lower() for colname in colnames]

    for lon, lat in [('ra', 'dec'), ('lon', 'lat'), ('lng', 'lat')]:

        # Check first for exact matches
        if colnames_lower.count(lon) == 1 and colnames_lower.count(lat) == 1:
            return lon, lat

        # Next check for columns that start with specified names

        lon_match = [colname.startswith(lon) for colname in colnames_lower]
        lat_match = [colname.startswith(lat) for colname in colnames_lower]

        if sum(lon_match) == 1 and sum(lat_match) == 1:
            return colnames[lon_match.index(True)], colnames[lat_match.index(True)]

        # We don't check for cases where lon/lat are inside the name but not at
        # the start since that might be e.g. for proper motions (pm_ra) or
        # errors (dlat).

    return None, None


def pick_unit_if_available(unit, valid_units):
    # Check for equality rather than just identity
    for valid_unit in valid_units:
        if unit == valid_unit:
            return valid_unit
    return unit

def csv_table_win_newline(table):
    '''
    Helper function to get Astropy tables as ASCII CSV with Windows line
    endings
    '''
    s = StringIO()
    table.write(s, format='ascii.basic', delimiter=',', comment=False)
    s.seek(0)
    #Replace single \r or \n characters with \r\n
    return re.sub(r"(?<![\r\n])(\r|\n)(?![\r\n])", "\r\n", s.read())


class LayerManager(object):
    """
    A simple container for layers.
    """

    def __init__(self, parent=None):
        self._layers = []
        self._parent = parent

    def add_image_layer(self, image=None, **kwargs):
        """
        Add an image layer to the current view

        Parameters
        ----------
        image : str or :class:`~astropy.io.fits.ImageHDU` or tuple
            The image to show, which should be given either as a filename,
            an :class:`~astropy.io.fits.ImageHDU` object, or a tuple of the
            form ``(array, wcs)`` where ``array`` is a Numpy array and ``wcs``
            is an astropy :class:`~astropy.wcs.WCS` object
        kwargs
            Additional keyword arguments can be used to set properties on the
            image layer.

        Returns
        -------
        layer : :class:`~pywwt.layers.ImageLayer` or a subclass thereof
        """
        layer = self._parent._create_image_layer(image=image, **kwargs)
        self._add_layer(layer)
        return layer

    def add_table_layer(self, table=None, frame='Sky', **kwargs):
        """
        Add a data layer to the current view

        Parameters
        ----------
        table : :class:`~astropy.table.Table`
            The table containing the data to show.
        frame : str
            The reference frame to use for the data. This should be either
            ``'Sky'``, ``'Ecliptic'``, ``Galactic``, or the name of a planet
            or a natural satellite in the solar system.
        kwargs
            Additional keyword arguments can be used to set properties on the
            table layer.

        Returns
        -------
        layer : :class:`~pywwt.layers.TableLayer`
        """

        # Validate frame
        if frame.lower() not in VALID_FRAMES:
            raise ValueError('frame should be one of {0}'.format('/'.join(sorted(str(x) for x in VALID_FRAMES))))
        frame = frame.capitalize()

        if table is not None:
            layer = TableLayer(self._parent, table=table,
                               frame=frame, **kwargs)
        else:
            # NOTE: in future we may allow different arguments such as e.g.
            # orbit=, hence why we haven't made this a positional argument.
            raise ValueError("The table argument is required")
        self._add_layer(layer)
        return layer

    def add_data_layer(self, *args, **kwargs):
        """
        Deprecated, use ``add_table_layer`` instead.
        """
        warnings.warn('add_data_layer has been deprecated, use '
                      'add_table_layer instead', DeprecationWarning)
        return self.add_table_layer(*args, **kwargs)

    def _add_layer(self, layer):
        if layer in self._layers:
            raise ValueError("layer already exists in layer manager")
        self._layers.append(layer)
        layer._manager = self

    def remove_layer(self, layer):
        if layer not in self._layers:
            raise ValueError("layer not in layer manager")
        layer.remove()
        # By this point, the call to remove() above may already have resulted
        # in the layer getting removed, so we check first if it's still present.
        if layer in self._layers:
            self._layers.remove(layer)

    def __len__(self):
        return len(self._layers)

    def __iter__(self):
        for layer in self._layers:
            yield layer

    def __getitem__(self, item):
        return self._layers[item]

    def __str__(self):
        if len(self) == 0:
            return 'Layer manager with no layers'
        else:
            s = 'Layer manager with {0} layers:\n\n'.format(len(self))
            for ilayer, layer in enumerate(self._layers):
                s += '  [{0}]: {1}\n'.format(ilayer, layer)
            return s

    __repr__ = __str__

    def _serialize_state(self):
        layer_states = []
        for layer in self._layers:
            layer_states.append(layer._serialize_state())

        return layer_states

    def _save_all_data_for_serialization (self, dir):
        for layer in self._layers:
            layer._save_data_for_serialization(dir)


class TableLayer(HasTraits):
    """
    A layer where the data is stored in an :class:`~astropy.table.Table`
    """

    lon_att = Unicode(help='The column to use for the longitude '
                      '(`str`)').tag(wwt='lngColumn')
    lon_unit = Any(help='The units to use for longitude '
                   '(:class:`~astropy.units.Unit`)').tag(wwt='raUnits')
    lat_att = Unicode(help='The column to use for the latitude '
                      '(`str`)').tag(wwt='latColumn')

    alt_att = Unicode(help='The column to use for the altitude '
                      '(`str`)').tag(wwt='altColumn')
    alt_unit = Any(help='The units to use for the altitude '
                   '(:class:`~astropy.units.Unit`)').tag(wwt='altUnit')
    alt_type = Unicode(help='The type of altitude (`str`)').tag(wwt='altType')

    size_scale = Float(10, help='The factor by which to scale the size '
                       'of the points (`float`)').tag(wwt='scaleFactor')

    # NOTE: we deliberately don't link size_att to sizeColumn because we need
    # to compute the sizes ourselves based on the min/max and then use the
    # resulting column.
    size_att = Unicode(help='The column to use for the marker size '
                       '(`str`)').tag(wwt=None)
    size_vmin = Float(None, help='The minimum point size. '
                      'Found automagically once size_att is set '
                      '(`float`)', allow_none=True).tag(wwt=None)
    size_vmax = Float(None, help='The maximum point size. '
                      'Found automagically once size_att is set '
                      '(`float`)', allow_none=True).tag(wwt=None)

    # NOTE: we deliberately don't link cmap_att to colorMapColumn because we
    # need to compute the colors ourselves based on the min/max and then use
    # the resulting column.
    cmap_att = Unicode(help='The column to use for the colormap '
                       '(`str`)').tag(wwt=None)
    cmap_vmin = Float(None, help='The minimum level of the colormap. Found '
                      'automagically once cmap_att is set (`float`)',
                      allow_none=True).tag(wwt=None)
    cmap_vmax = Float(None, help='The maximum level of the colormap. Found '
                      'automagically once cmap_att is set (`float`)',
                      allow_none=True).tag(wwt=None)
    cmap = Any(cm.magma, help='The Matplotlib colormap '
               '(:class:`matplotlib.colors.ListedColormap`)').tag(wwt=None)

    color = Color('white', help='The color of the markers '
                  '(`str` or `tuple`)').tag(wwt='color')
    opacity = Float(1, help='The opacity of the markers '
                    '(`str`)').tag(wwt='opacity')

    marker_type = Unicode('gaussian', help='The type of marker '
                          '(`str`)').tag(wwt='plotType')
    marker_scale = Unicode('screen', help='Whether the scale is '
                           'defined in world or pixel coordinates '
                           '(`str`)').tag(wwt='markerScale')

    far_side_visible = Bool(False, help='Whether markers on the far side '
                            'of a 3D object are visible '
                            '(`bool`)').tag(wwt='showFarSide')

    # NOTE: we deliberately don't link time_att to startDateColumn here
    # because we need to compute a new times column based on time_att before
    # passing the result on to WWT
    time_att = Unicode(help='The column to use for time (`str`)').tag(wwt=None)
    time_series = Bool(False, help='Whether the layer contains time series '
                       'elements (`bool`)').tag(wwt='timeSeries')
    decay = AstropyQuantity(16 * u.day, help='How long a time series point '
                            'takes to fade away after appearing (0 if never) '
                            '(:class:`~astropy.units.Quantity`)').tag(wwt='decay')

    # TODO: support:
    # xAxisColumn
    # yAxisColumn
    # zAxisColumn
    # xAxisReverse
    # yAxisReverse
    # zAxisReverse

    def __init__(self, parent=None, table=None, frame=None, **kwargs):

        # TODO: need to validate reference frame
        self.table = table
        self.frame = frame

        # ISSUE: For some reason, WWT seems to prefer the that time column
        # be 0th-10th/12th column in the table.
        ### (varies with placement of latitude and longitude columns,
        ###  which also need to be 0th-12th)
        # So the current proposition is to limit table's max number of columns
        ### (the max will change depending on how time_att is implemented)
        max_cols = 13
        if len(self.table.colnames) > max_cols:
            raise ValueError('Table must have fewer than {} '.format(max_cols)
                             + 'columns to ensure predictable behavior')

        self.parent = parent
        self.id = str(uuid.uuid4())

        # Attribute to keep track of the manager, so that we can notify the
        # manager if a layer is removed.
        self._manager = None
        self._removed = False

        self._initialize_layer()

        # Force defaults
        self._on_trait_change({'name': 'alt_type', 'new': self.alt_type})
        self._on_trait_change({'name': 'size_scale', 'new': self.size_scale})
        self._on_trait_change({'name': 'color', 'new': self.color})
        self._on_trait_change({'name': 'opacity', 'new': self.opacity})
        self._on_trait_change({'name': 'marker_type', 'new': self.marker_type})
        self._on_trait_change({'name': 'marker_scale',
                               'new': self.marker_scale})
        self._on_trait_change({'name': 'far_side_visible',
                               'new': self.far_side_visible})
        self._on_trait_change({'name': 'size_att', 'new': self.size_att})
        self._on_trait_change({'name': 'cmap_att', 'new': self.cmap_att})
        self._on_trait_change({'name': 'time_att', 'new': self.time_att})
        self._on_trait_change({'name': 'time_series', 'new': self.time_series})
        self._on_trait_change({'name': 'decay', 'new': self.decay})

        self.observe(self._on_trait_change, type='change')

        if any(key not in self.trait_names() for key in kwargs):
            raise KeyError('a key doesn\'t match any layer trait name')

        super(TableLayer, self).__init__(**kwargs)

        lon_guess, lat_guess = guess_lon_lat_columns(self.table.colnames)

        if 'lon_att' not in kwargs:
            self.lon_att = lon_guess or self.table.colnames[0]

        if 'lat_att' not in kwargs:
            self.lat_att = lat_guess or self.table.colnames[1]

    @validate('lon_unit')
    def _check_lon_unit(self, proposal):
        # Pass the proposal to Unit - this allows us to validate the unit,
        # and allows strings to be passed.
        unit = u.Unit(proposal['value'])
        unit = pick_unit_if_available(unit, VALID_LON_UNITS)
        if unit in VALID_LON_UNITS:
            return unit
        else:
            raise ValueError('lon_unit should be one of {0}'.format('/'.join(sorted(str(x) for x in VALID_LON_UNITS))))

    @validate('alt_unit')
    def _check_alt_unit(self, proposal):
        # Pass the proposal to Unit - this allows us to validate the unit,
        # and allows strings to be passed.
        with u.imperial.enable():
            unit = u.Unit(proposal['value'])
        unit = pick_unit_if_available(unit, VALID_ALT_UNITS)
        if unit in VALID_ALT_UNITS:
            return unit
        else:
            raise ValueError('alt_unit should be one of {0}'.format('/'.join(sorted(str(x) for x in VALID_ALT_UNITS))))

    @validate('alt_type')
    def _check_alt_type(self, proposal):
        if proposal['value'] in VALID_ALT_TYPES:
            return proposal['value']
        else:
            raise ValueError('alt_type should be one of {0}'.format('/'.join(str(x) for x in VALID_ALT_TYPES)))

    @validate('marker_type')
    def _check_marker_type(self, proposal):
        if proposal['value'] in VALID_MARKER_TYPES:
            return proposal['value']
        else:
            raise ValueError('marker_type should be one of {0}'.format('/'.join(str(x) for x in VALID_MARKER_TYPES)))

    @validate('marker_scale')
    def _check_marker_scale(self, proposal):
        if proposal['value'] in VALID_MARKER_SCALES:
            return proposal['value']
        else:
            raise ValueError('marker_scale should be one of {0}'.format('/'.join(str(x) for x in VALID_MARKER_SCALES)))

    @validate('cmap')
    def _check_cmap(self, proposal):
        if isinstance(proposal['value'], str):
            return cm.get_cmap(proposal['value'])
        elif not isinstance(proposal['value'], Colormap):
            raise TypeError('cmap should be set to a Matplotlib colormap')
        else:
            return proposal['value']

    @validate('time_att')
    def _check_time_att(self, proposal):
        # Parse the time_att column and make sure it's in the proper format
        # (string in isot format, astropy Time, or datetime)
        col = self.table[proposal['value']]

        if (isinstance(col, STR_TYPE)
            or np.issubdtype(col.dtype, NP_STR_TYPE)):

            col_list = col.tolist()
            is_iso = all(iso_test.match(t) for t in col_list)

            if is_iso:
                return proposal['value']
            else:
                raise ValueError('String times must conform to the ISOT'
                                 'standard (YYYY-MM-DD`T`HH:MM:SS:MS)')

        elif isinstance(col, (datetime, Time)):
            return proposal['value']
        else:
            raise ValueError('A time column must have string, '
                             'datetime.datetime, or astropy Time values')

    @validate('decay')
    def _check_decay(self, proposal):
        if proposal['value'].unit.physical_type == 'time':
            return proposal['value']
        else:
            raise ValueError('decay should be in units of time')

    @observe('alt_att')
    def _on_alt_att_change(self, *value):
        # Check if we can set the unit of the altitude automatically
        if len(self.alt_att) == 0:
            return
        column = self.table[self.alt_att]
        unit = pick_unit_if_available(column.unit, VALID_ALT_UNITS)
        if unit in VALID_ALT_UNITS:
            self.alt_unit = unit
        elif unit is not None:
            warnings.warn('Column {0} has units of {1} but this is not a valid'
                          ' unit of altitude - set the unit directly with'
                          ' alt_unit'.format(self.alt_att, unit), UserWarning)

    @observe('lon_att')
    def _on_lon_att_change(self, *value):
        # Check if we can set the unit of the altitude automatically
        if len(self.lon_att) == 0:
            return
        column = self.table[self.lon_att]
        unit = pick_unit_if_available(column.unit, VALID_LON_UNITS)
        if unit in VALID_LON_UNITS:
            self.lon_unit = unit
        elif unit is not None:
            warnings.warn('Column {0} has units of {1} but this is not a valid '
                          'unit of longitude - set the unit directly with '
                          'lon_unit'.format(self.lon_att, unit), UserWarning)

    @observe('size_att')
    def _on_size_att_change(self, *value):

        # Set the min/max levels automatically based on the min/max values

        if len(self.size_att) == 0:
            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='sizeColumn', value=-1)
            return

        self.size_vmin = None
        self.size_vmax = None

        column = self.table[self.size_att]

        self.size_vmin = np.nanmin(column)
        self.size_vmax = np.nanmax(column)

    @observe('size_vmin', 'size_vmax')
    def _on_size_vmin_vmax_change(self, *value):

        # Update the size column in the table

        if self._uniform_size():
            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='sizeColumn', value=-1)
            return

        column = self.table[self.size_att]

        size = (column - self.size_vmin) / (self.size_vmax - self.size_vmin) * 10

        self.table[SIZE_COLUMN_NAME] = size

        self.parent._send_msg(event='table_layer_update', id=self.id,
                              table=self._table_b64)

        self.parent._send_msg(event='table_layer_set', id=self.id,
                              setting='pointScaleType', value=0)

        self.parent._send_msg(event='table_layer_set', id=self.id,
                              setting='sizeColumn', value=SIZE_COLUMN_NAME)

    @observe('cmap_att')
    def _on_cmap_att_change(self, *value):

        # Set the min/max levels automatically based on the min/max values

        if len(self.cmap_att) == 0:

            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='colorMapColumn', value=-1)

            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='_colorMap', value=0)

            return

        self.cmap_vmin = None
        self.cmap_vmax = None

        column = self.table[self.cmap_att]

        self.cmap_vmin = np.nanmin(column)
        self.cmap_vmax = np.nanmax(column)

    @observe('cmap_vmin', 'cmap_vmax', 'cmap')
    def _on_cmap_vmin_vmax_change(self, *value):

        # Update the cmap column in the table

        if self._uniform_color():

            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='colorMapColumn', value=-1)

            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='_colorMap', value=0)

            return

        column = self.table[self.cmap_att]

        values = (column - self.cmap_vmin) / (self.cmap_vmax - self.cmap_vmin)

        # PERF: vectorize the calculation of the hex strings
        rgb = self.cmap(values)[:, :-1]
        hex_values = [to_hex(x) for x in rgb]

        self.table[CMAP_COLUMN_NAME] = hex_values

        self.parent._send_msg(event='table_layer_update', id=self.id,
                              table=self._table_b64)

        self.parent._send_msg(event='table_layer_set', id=self.id,
                              setting='_colorMap', value=3)

        self.parent._send_msg(event='table_layer_set', id=self.id,
                              setting='colorMapColumn', value=CMAP_COLUMN_NAME)


    @observe('time_att')
    def _on_time_att_change(self, *value):
        # Convert time column to UTC so WWT displays points at expected times
        ### ISSUE: Currently not robust to changes in DST.
        # Needs GMT instead of UTC?

        # The conversion only seems needed in Qt, so check the widget version
        if type(self.parent).__name__.find('Qt') < 0:
            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='startDateColumn',
                                  value=self.time_att)
            return

        if len(self.time_att) == 0 or self.time_series == False:
            self.parent._send_msg(event='table_layer_set', id=self.id,
                                  setting='startDateColumn', value=-1)
            return

        col = self.table[self.time_att]

        if isinstance(col, datetime):
            wwt_times = Column([t.isoformat() for t in col])
        elif isinstance(col, Time):
            wwt_times = Column([t.isot for t in col])
        else:
            col_list = col.tolist()
            wwt_times = Column(col_list)

        # Find the difference between user's curent local time and UTC
        # (rounding should also be robust for UTC+X:15, +X:30 time zones)
        now = datetime.now()
        utc_now = datetime.utcnow()

        now_diff = (utc_now - now).total_seconds() / 3600
        offset = (np.round(now_diff * 4) / 4) * u.hour

        # Add time offset to column so WWT will read values as UTC
        wwt_times = (Time(wwt_times) + TimeDelta(offset)).isot

        # Update the table passed to WWT with the new, modified time column
        ### ISSUE: better to create a new column (like cmap_att/size_att)
        ### or replace the entries in the original time_att column?
        ### given the column limit discussed earlier, creating new columns
        ### further limits the number of columns a user can provide
        self.table[self.time_att] = wwt_times
        #self.table[TIME_COLUMN_NAME] = wwt_times

        self.parent._send_msg(event='table_layer_update', id=self.id,
                              table=self._table_b64)

        self.parent._send_msg(event='table_layer_set', id=self.id,
                              setting='startDateColumn',
                              value=self.time_att)#,
                              #value=TIME_COLUMN_NAME)

    @property
    def _table_b64(self):

        # TODO: We need to make sure that the table has ra/dec columns since
        # WWT absolutely needs that upon creation.

        csv = csv_table_win_newline(self.table)

        return b64encode(csv.encode('ascii', errors='replace')).decode('ascii')

    def _uniform_color(self):
        return not self.cmap_att or self.cmap_vmin is None or self.cmap_vmax is None

    def _uniform_size(self):
        return not self.size_att or self.size_vmin is None or self.size_vmax is None

    def _initialize_layer(self):
        self.parent._send_msg(event='table_layer_create',
                              id=self.id, table=self._table_b64, frame=self.frame)

    def update_data(self, table=None):
        """
        Update the underlying data.
        """
        self.table = table.copy(copy_data=False)
        self.parent._send_msg(event='table_layer_update', id=self.id, table=self._table_b64)

        if len(self.alt_att) > 0:
            if self.alt_att in self.table.colnames:
                self._on_alt_att_change()
            else:
                self.alt_att = ''

        lon_guess, lat_guess = guess_lon_lat_columns(self.table.colnames)

        if self.lon_att in self.table.colnames:
            self._on_lon_att_change()
        else:
            self.lon_att = lon_guess or self.table.colnames[0]

        if self.lat_att not in self.table.colnames:
            self.lat_att = lat_guess or self.table.colnames[1]

    def remove(self):
        """
        Remove the layer.
        """
        if self._removed:
            return
        self.parent._send_msg(event='table_layer_remove', id=self.id)
        self._removed = True
        if self._manager is not None:
            self._manager.remove_layer(self)

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this
        # class gets inherited by the Jupyter widgets class which adds some
        # traits of its own, we only want to react to changes in traits
        # that have the wwt metadata attribute (which indicates the name of
        # the corresponding WWT setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            value = changed['new']
            if changed['name'] == 'alt_unit':
                value = VALID_ALT_UNITS[self._check_alt_unit({'value': value})]
            elif changed['name'] == 'lon_unit':
                value = VALID_LON_UNITS[self._check_lon_unit({'value': value})]
            elif changed['name'] == 'decay':
                value = value.to(u.day).value
            self.parent._send_msg(event='table_layer_set',
                                  id=self.id,
                                  setting=wwt_name,
                                  value=value)

    def _serialize_state(self):
        state = {'id': self.id,
                 'layer_type': 'table',
                 'frame': self.frame,
                 'settings': {}}

        for trait in self.traits().values():
            wwt_name = trait.metadata.get('wwt')
            if wwt_name:
                value = trait.get(self)
                if wwt_name == 'raUnits' and value is not None:
                    value = VALID_LON_UNITS[value]
                elif wwt_name == 'altUnit' and value is not None:
                    value = VALID_ALT_UNITS[value]
                state['settings'][wwt_name] = value

        if self._uniform_color():
            state['settings']['_colorMap'] = 0
            state['settings']['colorMapColumn'] = -1
        else:
            state['settings']['_colorMap'] = 3
            state['settings']['colorMapColumn'] = CMAP_COLUMN_NAME

        if self._uniform_size():
            state['settings']['sizeColumn'] = -1
        else:
            state['settings']['sizeColumn'] = SIZE_COLUMN_NAME
            state['settings']['pointScaleType'] = 0

        return state

    def _save_data_for_serialization(self, dir):
        file_path = path.join(dir,"{0}.csv".format(self.id))
        table_str = csv_table_win_newline(self.table)
        with open(file_path, 'wb') as file: # binary mode to preserve windows line endings
            file.write(table_str.encode('ascii', errors='replace'))

    def __str__(self):
        return 'TableLayer with {0} markers'.format(len(self.table))

    def __repr__(self):
        return '<{0}>'.format(str(self))


class ImageLayer(HasTraits):
    """
    An image layer.
    """

    vmin = Float(None, allow_none=True)
    vmax = Float(None, allow_none=True)
    stretch = Unicode('linear')
    opacity = Float(1, help='The opacity of the image').tag(wwt='opacity')

    def __init__(self, parent=None, image=None, **kwargs):

        self._image = image

        self.parent = parent
        self.id = str(uuid.uuid4())

        # Attribute to keep track of the manager, so that we can notify the
        # manager if a layer is removed.
        self._manager = None
        self._removed = False

        # Transform the image so that it is always acceptable to WWT
        # (Equatorial, TAN projection, double values) and write out to a
        # temporary file
        self._sanitized_image = tempfile.mktemp()
        sanitize_image(image, self._sanitized_image)

        # The first thing we need to do is make sure the image is being served.
        # For now we assume that image is a filename, but we could do more
        # detailed checks and reproject on-the-fly for example.

        self._image_url = self.parent._serve_file(self._sanitized_image,
                                                  extension='.fits')

        # Default the image rendering parameters. Because of the way the image
        # loading works in WWT, we may end up with messages being applied out
        # of order (see notes in image_layer_stretch in wwt_json_api.js)
        self._stretch_version = 0

        data = fits.getdata(self._sanitized_image)
        self._data_min, self.vmin, self.vmax, self._data_max = \
            np.nanpercentile(data, [0, 0.5, 99.5, 100])

        self._initialize_layer()

        if any(key not in self.trait_names() for key in kwargs):
            raise KeyError('a key doesn\'t match any layer trait name')

        super(ImageLayer, self).__init__(**kwargs)

        # Apply settings (that the user may have overridden) and track changes
        # automagically going forward.
        self._on_trait_change({'name': 'vmin', 'new': self.vmin})
        self._on_trait_change({'name': 'opacity', 'new': self.opacity})
        self.observe(self._on_trait_change, type='change')


    @validate('stretch')
    def _check_stretch(self, proposal):
        if proposal['value'] in VALID_STRETCHES:
            return proposal['value']
        else:
            raise ValueError('stretch should be one of {0}'.format('/'.join(str(x) for x in VALID_STRETCHES)))

    def _initialize_layer(self):
        self.parent._send_msg(event='image_layer_create',
                              id=self.id, url=self._image_url)

    def remove(self):
        """
        Remove the layer.
        """
        if self._removed:
            return
        self.parent._send_msg(event='image_layer_remove', id=self.id)
        self._removed = True
        if self._manager is not None:
            self._manager.remove_layer(self)

    def _on_trait_change(self, changed):

        if changed['name'] in ('stretch', 'vmin', 'vmax'):
            if self.vmin is not None and self.vmax is not None:
                stretch_id = VALID_STRETCHES.index(self.stretch)
                self._stretch_version += 1
                self.parent._send_msg(event='image_layer_stretch', id=self.id,
                                      stretch=stretch_id,
                                      vmin=self.vmin, vmax=self.vmax,
                                      version=self._stretch_version)

        # This method gets called anytime a trait gets changed. Since this
        # class gets inherited by the Jupyter widgets class which adds some
        # traits of its own, we only want to react to changes in traits
        # that have the wwt metadata attribute (which indicates the name of
        # the corresponding WWT setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            self.parent._send_msg(event='image_layer_set',
                                  id=self.id,
                                  setting=wwt_name,
                                  value=changed['new'])

    def _serialize_state(self):
        state = {'id': self.id,
                 'layer_type': 'image',
                 'settings': {}
                 }

        #A bit overkill for just the opacity, but more future-proof in case we add more wwt traits
        for trait in self.traits().values():
            wwt_name = trait.metadata.get('wwt')
            if wwt_name:
                state['settings'][wwt_name] = trait.get(self)

        if self.vmin is not None and self.vmax is not None:
            state['stretch_info'] = {'vmin': self.vmin,
                                     'vmax': self.vmax,
                                     'stretch':VALID_STRETCHES.index(self.stretch)}

        return state

    def _save_data_for_serialization(self, dir):
        file_path = path.join(dir,"{0}.fits".format(self.id))
        shutil.copyfile(self._sanitized_image,file_path)

    def __str__(self):
        return 'ImageLayer'

    def __repr__(self):
        return '<{0}>'.format(str(self))
