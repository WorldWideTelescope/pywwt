import sys
import uuid
import tempfile
from os import path
import shutil
import asyncio

import nest_asyncio
from pathlib import Path

import re

if sys.version_info[0] == 2:  # noqa
    from io import BytesIO as StringIO
else:
    from io import StringIO

import warnings
from base64 import b64encode
from collections import OrderedDict

import numpy as np
from astropy.io import fits
from matplotlib.pyplot import cm
from matplotlib.colors import Colormap
from astropy import units as u
import astropy.units.imperial  # noqa: F401
from astropy.table import Column
from astropy.table import Table
from astropy.time import Time
from datetime import datetime
import toasty
from toasty import TilingMethod

from traitlets import HasTraits, validate, observe
from .traits import Color, Bool, Float, Unicode, AstropyQuantity, Any, to_hex
from .utils import sanitize_image, validate_traits, ensure_utc

__all__ = [
    "CatalogHipsLayer",
    "ImageLayer",
    "LayerManager",
    "TableLayer",
]

VALID_FRAMES = [
    "sky",
    "ecliptic",
    "galactic",
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "moon",
    "io",
    "europa",
    "ganymede",
    "callisto",
]

VALID_LON_UNITS = {u.deg: "degrees", u.hour: "hours", u.hourangle: "hours"}

# NOTE: for cartesian coordinates, we can also allow custom units
VALID_ALT_UNITS = {
    u.m: "meters",
    u.imperial.foot: "feet",
    u.imperial.inch: "inches",
    u.imperial.mile: "miles",
    u.km: "kilometers",
    u.au: "astronomicalUnits",
    u.lyr: "lightYears",
    u.pc: "parsecs",
    u.Mpc: "megaParsecs",
}

VALID_ALT_TYPES = ["depth", "altitude", "distance", "seaLevel", "terrain"]

VALID_MARKER_TYPES = ["gaussian", "point", "circle", "square", "pushpin"]

VALID_MARKER_SCALES = ["screen", "world"]

VALID_STRETCHES = ["linear", "log", "power", "sqrt", "histeq"]

VALID_COLORMAPS = [
    "viridis",
    "plasma",
    "inferno",
    "magma",
    "cividis",
    "Greys",
    "gray",
    "Purples",
    "Blues",
    "Greens",
    "Oranges",
    "Reds",
    "RdYlBu",
]

UI_COLORMAPS = OrderedDict(
    [
        ("Viridis", "viridis"),
        ("Plasma", "plasma"),
        ("Black to white", "gray"),
        ("White to black", "Greys"),
        ("Inferno", "inferno"),
        ("Magma", "magma"),
        ("Cividis", "cividis"),
        ("Red-Yellow-Blue", "RdYlBu"),
        ("Purples", "Purples"),
        ("Blues", "Blues"),
        ("Greens", "Greens"),
        ("Oranges", "Oranges"),
        ("Reds", "Reds"),
    ]
)

# Save string types for validating ISOT strings in time series tables
if sys.version_info[0] == 2:
    STR_TYPE = basestring  # noqa
    NP_STR_TYPE = np.string_
else:
    STR_TYPE = str
    NP_STR_TYPE = np.unicode_

# The following are columns that we add dynamically and internally, so we need
# to make sure they have unique names that won't clash with existing columns
SIZE_COLUMN_NAME = str(uuid.uuid4())
CMAP_COLUMN_NAME = str(uuid.uuid4())
TIME_COLUMN_NAME = str(uuid.uuid4())


def guess_lon_lat_columns(colnames):
    """
    Given column names in a table, return the columns to use for lon/lat, or
    None/None if no high confidence possibilities.
    """

    # Do all the checks in lowercase
    colnames_lower = [colname.lower() for colname in colnames]

    for lon, lat in [("ra", "dec"), ("lon", "lat"), ("lng", "lat")]:

        # Check first for exact matches

        lon_match = [colname == lon for colname in colnames_lower]
        lat_match = [colname == lat for colname in colnames_lower]

        if sum(lon_match) == 1 and sum(lat_match) == 1:
            return colnames[lon_match.index(True)], colnames[lat_match.index(True)]

        # Next check for columns that start with specified names

        lon_match = [colname.startswith(lon) for colname in colnames_lower]
        lat_match = [colname.startswith(lat) for colname in colnames_lower]

        if sum(lon_match) == 1 and sum(lat_match) == 1:
            return colnames[lon_match.index(True)], colnames[lat_match.index(True)]

        # We don't check for cases where lon/lat are inside the name but not at
        # the start since that might be e.g. for proper motions (pm_ra) or
        # errors (dlat).

    return None, None


def guess_xyz_columns(colnames):
    """
    Given column names in a table, return the columns to use for x/y/z, or
    None/None/None if no high confidence possibilities.
    """

    # Do all the checks in lowercase
    colnames_lower = [colname.lower() for colname in colnames]

    for x, y, z in [("x", "y", "z")]:

        # Check first for exact matches

        x_match = [colname == x for colname in colnames_lower]
        y_match = [colname == y for colname in colnames_lower]
        z_match = [colname == z for colname in colnames_lower]

        if sum(x_match) == 1 and sum(y_match) == 1 and sum(z_match) == 1:
            return (
                colnames[x_match.index(True)],
                colnames[y_match.index(True)],
                colnames[z_match.index(True)],
            )

        # Next check for columns that start with specified names

        x_match = [colname.startswith(x) for colname in colnames_lower]
        y_match = [colname.startswith(y) for colname in colnames_lower]
        z_match = [colname.startswith(z) for colname in colnames_lower]

        if sum(x_match) == 1 and sum(y_match) == 1 and sum(z_match) == 1:
            return (
                colnames[x_match.index(True)],
                colnames[y_match.index(True)],
                colnames[z_match.index(True)],
            )

    return None, None, None


def pick_unit_if_available(unit, valid_units):
    # Check for equality rather than just identity
    for valid_unit in valid_units:
        if unit == valid_unit:
            return valid_unit
    return unit


def csv_table_win_newline(table):
    """
    Helper function to get Astropy tables as ASCII CSV with Windows line
    endings
    """
    s = StringIO()
    table.write(s, format="ascii.basic", delimiter=",", comment=False)
    s.seek(0)
    # Replace single \r or \n characters with \r\n
    return re.sub(r"(?<![\r\n])(\r|\n)(?![\r\n])", "\r\n", s.read())


class LayerManager(object):
    """
    A simple container for layers.
    """

    def __init__(self, parent=None):
        self._layers = []
        self._parent = parent

    def add_image_layer(
        self,
        image=None,
        hdu_index=None,
        verbose=True,
        name=None,
        tiling_method=TilingMethod.AUTO_DETECT,
        **kwargs
    ):
        """
        Add an image layer to the current view. This method can display any
        image data or FITS or list of FITS from the local environment. In case
        of a large FITS (> 20 MB), the file is preprocessed into tiles using
        the `toasty` library for smooth & fast visualization. You can also use
        this method to combine multiple FITS files into a single image set.

        Parameters
        ----------
        image : str or list of str or :class:`~astropy.io.fits.ImageHDU` or tuple
            The image to show, which should be given either as a filename,
            a list of FITS file paths, an :class:`~astropy.io.fits.ImageHDU`
            object, or a tuple of the form ``(array, wcs)`` where ``array`` is
            a Numpy array and ``wcs`` is an astropy :class:`~astropy.wcs.WCS`
            object
        hdu_index : optional int or list of int, defaults to None
            Use this parameter to specify which HDU to tile. If the *image*
            input is a list of FITS, you can specify the hdu_index of each FITS
            by using a list of integers like this: [0, 2, 1]. If hdu_index is
            not set, toasty will use the first HDU with tilable content in each
            FITS.
        verbose : optional boolean, defaults True
            If true, progress messages will be printed as the FITS files are
            being processed.
        name : optional str, defaults to None
            Use this parameter to set a display name for the image set.
            If not set, pywwt will set a name based on the file name of the
            provided image.
        tiling_method : optional :class:`~toasty.TilingMethod`
            Can be used to force a specific tiling method, i.e. tiled
            tangential projection, TOAST, HiPS, or even untiled. Defaults
            to auto-detection, which choses the most appropriate method.
        kwargs
            Additional keyword arguments can be used to set properties on the
            image layer or settings for the `toasty` tiling process. Common
            toasty settings include ``out_dir``, ``override``, ``blankval``,
            and ``start``.
            See `toasty.tile_fits`.

        Returns
        -------
        layer : :class:`~pywwt.layers.ImageLayer` or a subclass thereof
        """

        if isinstance(image, tuple):
            image, wcs = image
            image = astropy.io.fits.PrimaryHDU(image, wcs.to_header())
        if (
            isinstance(image, astropy.io.fits.ImageHDU)
            or isinstance(image, astropy.io.fits.PrimaryHDU)
            or isinstance(image, astropy.io.fits.HDUList)
        ):
            # Creating a stable filename to allow caching. The caching is
            # primarily useful to skip expensive processing inside Toasty
            # in case this image has previously been processed.
            from hashlib import md5

            m = md5()
            m.update(image.data[:65536])
            m.update(image.header.tostring().encode("utf-8"))
            hex_string = m.hexdigest()  # returns digest as a hex-encoded string
            filename = "fits_input_{}".format(hex_string)
            if not Path(filename).is_file():
                image.writeto(filename)
            image = filename
        if isinstance(image, str):
            image = [image]
        if (
            tiling_method == TilingMethod.TOAST
            or tiling_method == TilingMethod.HIPS
            or tiling_method == TilingMethod.TAN
        ) or (
            tiling_method == TilingMethod.AUTO_DETECT
            and (len(image) > 1 or Path(image[0]).stat().st_size > 20e6)
        ):  # 20 MB
            nest_asyncio.apply()
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(
                self._tile_and_serve(
                    fits_list=image,
                    hdu_index=hdu_index,
                    cli_progress=verbose,
                    display_name=name,
                    tiling_method=tiling_method,
                    **kwargs
                )
            )
        else:
            return self._create_and_add_image_layer(
                image=image[0], hdu_index=hdu_index, name=name, **kwargs
            )

    def _create_and_add_image_layer(self, image, **kwargs):
        kwargs = self._remove_toasty_keywords(**kwargs)
        layer = self._parent._create_image_layer(image=image, **kwargs)
        self._add_layer(layer)
        return layer

    def add_preloaded_image_layer(self, url=None, **kwargs):
        """
        Add an image layer to the current view, based on its data URL.

        Parameters
        ----------
        url : str
            The URL of the image, as registered with the WWT frontend.
        kwargs
            Additional keyword arguments can be used to set properties on the
            image layer.

        Returns
        -------
        layer : :class:`~pywwt.layers.ImageLayer` or a subclass thereof
        """
        layer = self._parent._create_image_layer(url=url, **kwargs)
        self._add_layer(layer)
        return layer

    # TODO this is not future proof
    def _remove_toasty_keywords(self, **kwargs):
        kwargs.pop("blankval", None)
        kwargs.pop("override", None)
        kwargs.pop("out_dir", None)
        kwargs.pop("start", None)
        return kwargs

    async def _tile_and_serve(
        self,
        fits_list,
        hdu_index=None,
        cli_progress=True,
        display_name=None,
        tiling_method=TilingMethod.AUTO_DETECT,
        **kwargs
    ):
        with warnings.catch_warnings():
            # Avoid annoying AstroPy FITS-fixed warnings
            warnings.simplefilter("ignore")
            out_dir, builder = toasty.tile_fits(
                fits_list,
                hdu_index=hdu_index,
                cli_progress=cli_progress,
                tiling_method=tiling_method,
                **kwargs
            )

        kwargs = self._remove_toasty_keywords(**kwargs)
        url = self._parent._serve_tree(path=out_dir)

        self._parent.load_image_collection(url=url + "index.wtml", remote_only=True)

        if display_name is None:
            display_name = builder.imgset.name

        image_layer = self.add_preloaded_image_layer(
            url + builder.imgset.url, name=display_name, **kwargs
        )
        if builder.imgset.pixel_cut_low > 0 or builder.imgset.pixel_cut_low < 0:
            image_layer.vmin = builder.imgset.pixel_cut_low
            image_layer.vmax = builder.imgset.pixel_cut_high
            image_layer._data_min = builder.imgset.data_min
            image_layer._data_max = builder.imgset.data_max

        return image_layer

    def add_table_layer(self, table=None, frame="Sky", **kwargs):
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
            raise ValueError(
                "frame should be one of {0}".format(
                    "/".join(sorted(str(x) for x in VALID_FRAMES))
                )
            )
        frame = frame.capitalize()

        if table is not None:
            layer = TableLayer(self._parent, table=table, frame=frame, **kwargs)
        else:
            # NOTE: in future we may allow different arguments such as e.g.
            # orbit=, hence why we haven't made this a positional argument.
            raise ValueError("The table argument is required")
        self._add_layer(layer)
        return layer

    async def add_hips_catalog_layer(self, name, **kwargs):
        """
        Add a HiPS catalog layer to the current view.

        Parameters
        ----------
        name : str
            Name of the HiPS catalog to display. You can list them using the widget's
            :attr:`~pywwt.BaseWWTWidget.available_hips_catalog_names` attribute
        **kwargs
            Additional keyword arguments can be used to set properties on the
            catalog HiPS layer.

        Returns
        -------
        layer : :class:`~pywwt.layers.CatalogHipsLayer`

        Notes
        -----
        This function is asynchronous because the engine needs to download the
        information about the catalog and return its metadata to the Python code.
        """

        name = self._validate_hips_catalog_name(name)
        model_id = str(uuid.uuid4())

        fut = self._parent._send_into_future(
            event="layer_hipscat_load",
            name=name,
            tableId=model_id,
        )
        reply = await fut

        layer = CatalogHipsLayer(self._parent, model_id, reply)
        self._add_layer(layer)

        with layer.hold_trait_notifications():
            for key, value in kwargs.items():
                if not layer.has_trait(key):
                    raise TypeError("unexpected keyword argument '{}'".format(key))
                setattr(layer, key, value)

        return layer

    def _validate_hips_catalog_name(self, name):
        if name not in self._parent.available_hips_catalog_names:
            raise ValueError(
                "name should be one of {0}".format(
                    " /// ".join(
                        sorted(
                            str(x) for x in self._parent.available_hips_catalog_names
                        )
                    )
                )
            )
        return name

    def add_data_layer(self, *args, **kwargs):
        """
        Deprecated, use ``add_table_layer`` instead.
        """
        warnings.warn(
            "add_data_layer has been deprecated, use add_table_layer instead",
            DeprecationWarning,
        )
        return self.add_table_layer(*args, **kwargs)

    def _add_layer(self, layer):
        if layer in self._layers:
            raise ValueError("layer already exists in layer manager")
        self._layers.append(layer)
        layer._manager = self

    def remove_layer(self, layer):
        """
        Remove a layer from the view.

        Parameters
        ----------
        layer : :class:`TableLayer` or :class:`ImageLayer`
            The layer to remove.
        """

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
            return "Layer manager with no layers"
        else:
            s = "Layer manager with {0} layers:\n\n".format(len(self))
            for ilayer, layer in enumerate(self._layers):
                s += "  [{0}]: {1}\n".format(ilayer, layer)
            return s

    __repr__ = __str__

    def _serialize_state(self):
        layer_states = []
        for layer in self._layers:
            layer_states.append(layer._serialize_state())

        return layer_states

    def _save_all_data_for_serialization(self, dir):
        for layer in self._layers:
            layer._save_data_for_serialization(dir)


class TableLayer(HasTraits):
    """
    A layer where the data is stored in an :class:`~astropy.table.Table`
    """

    coord_type = Unicode(
        "spherical",
        help="Whether to give the coordinates "
        "in spherical or rectangular coordinates",
    ).tag(wwt="coordinatesType")

    # Attributes for spherical coordinates

    lon_att = Unicode(help="The column to use for the longitude (`str`)").tag(
        wwt="lngColumn"
    )
    lon_unit = Any(
        help="The units to use for longitude (:class:`~astropy.units.Unit`)"
    ).tag(wwt="raUnits")
    lat_att = Unicode(help="The column to use for the latitude (`str`)").tag(
        wwt="latColumn"
    )

    alt_att = Unicode(help="The column to use for the altitude (`str`)").tag(
        wwt="altColumn"
    )
    alt_unit = Any(
        help="The units to use for the altitude (:class:`~astropy.units.Unit`)"
    ).tag(wwt="altUnit")
    alt_type = Unicode(help="The type of altitude (`str`)").tag(wwt="altType")

    # Attributes for cartesian coordinates

    x_att = Unicode(help="The column to use for the x coordinate").tag(
        wwt="xAxisColumn"
    )
    y_att = Unicode(help="The column to use for the y coordinate").tag(
        wwt="yAxisColumn"
    )
    z_att = Unicode(help="The column to use for the z coordinate").tag(
        wwt="zAxisColumn"
    )
    xyz_unit = Any(help="The units to use for the x/y/z positions").tag(
        wwt="cartesianScale"
    )

    # NOTE: we deliberately don't link size_att to sizeColumn because we need
    # to compute the sizes ourselves based on the min/max and then use the
    # resulting column.
    size_att = Unicode(help="The column to use for the marker size (`str`)").tag(
        wwt=None
    )
    size_vmin = Float(
        None,
        help="The minimum point size. "
        "Found automagically once size_att is set "
        "(`float`)",
        allow_none=True,
    ).tag(wwt=None)
    size_vmax = Float(
        None,
        help="The maximum point size. "
        "Found automagically once size_att is set "
        "(`float`)",
        allow_none=True,
    ).tag(wwt=None)

    cmap_att = Unicode(help="The column to use for the colormap (`str`)").tag(wwt=None)
    cmap_vmin = Float(
        None,
        help="The minimum level of the colormap. Found "
        "automagically once cmap_att is set (`float`)",
        allow_none=True,
    ).tag(wwt=None)
    cmap_vmax = Float(
        None,
        help="The maximum level of the colormap. Found "
        "automagically once cmap_att is set (`float`)",
        allow_none=True,
    ).tag(wwt=None)
    cmap = Any(
        cm.viridis,
        help="The Matplotlib colormap (:class:`matplotlib.colors.ListedColormap`)",
    ).tag(wwt=None)

    # Visual attributes

    size_scale = Float(
        10, help="The factor by which to scale the size of the points (`float`)"
    ).tag(wwt="scaleFactor")
    color = Color("white", help="The color of the markers (`str` or `tuple`)").tag(
        wwt="color"
    )
    opacity = Float(1, help="The opacity of the markers (`str`)").tag(wwt="opacity")

    marker_type = Unicode("gaussian", help="The type of marker (`str`)").tag(
        wwt="plotType"
    )
    marker_scale = Unicode(
        "screen",
        help="Whether the scale is defined in world or pixel coordinates (`str`)",
    ).tag(wwt="markerScale")

    far_side_visible = Bool(
        False,
        help="Whether markers on the far side "
        "of a 3D object are visible "
        "(`bool`)",
    ).tag(wwt="showFarSide")

    # NOTE: we deliberately don't link time_att to startDateColumn here
    # because we need to compute a new times column based on time_att before
    # passing the result on to WWT
    time_att = Unicode(help="The column to use for time (`str`)").tag(wwt=None)
    time_series = Bool(
        False, help="Whether the layer contains time series elements (`bool`)"
    ).tag(wwt="timeSeries")
    time_decay = AstropyQuantity(
        16 * u.day,
        help="How long a time series "
        "point takes to fade away after appearing (0 "
        "if never) "
        "(:class:`~astropy.units.Quantity`)",
    ).tag(wwt="decay")

    selectable = Bool(
        True, help="Whether sources in the layer are selectable (`bool`)"
    ).tag(wwt=None)

    # TODO: support:
    # xAxisColumn
    # yAxisColumn
    # zAxisColumn
    # xAxisReverse
    # yAxisReverse
    # zAxisReverse

    def __init__(
        self,
        parent=None,
        table=None,
        frame=None,
        table_from_wwt_engine=False,
        id=None,
        **kwargs
    ):
        self.table = table
        self.notify_changes = True

        # Validate frame
        if frame.lower() not in VALID_FRAMES:
            raise ValueError(
                "frame should be one of {0}".format(
                    "/".join(sorted(str(x) for x in VALID_FRAMES))
                )
            )
        self.frame = frame.capitalize()

        self.parent = parent

        if id is None:
            id = str(uuid.uuid4())
        self.id = id

        # Attribute to keep track of the manager, so that we can notify the
        # manager if a layer is removed.
        self._manager = None
        self._removed = False

        if not table_from_wwt_engine:
            self._initialize_layer()

            # Force defaults
            self._on_trait_change({"name": "alt_type", "new": self.alt_type})
            self._on_trait_change({"name": "size_scale", "new": self.size_scale})
            self._on_trait_change({"name": "color", "new": self.color})
            self._on_trait_change({"name": "opacity", "new": self.opacity})
            self._on_trait_change({"name": "marker_type", "new": self.marker_type})
            self._on_trait_change({"name": "marker_scale", "new": self.marker_scale})
            self._on_trait_change(
                {"name": "far_side_visible", "new": self.far_side_visible}
            )
            self._on_trait_change({"name": "size_att", "new": self.size_att})
            self._on_trait_change({"name": "cmap_att", "new": self.cmap_att})
            self._on_trait_change({"name": "time_att", "new": self.time_att})
            self._on_trait_change({"name": "time_series", "new": self.time_series})
            self._on_trait_change({"name": "time_decay", "new": self.time_decay})

            self._on_trait_change({"name": "cmap", "new": self.cmap})

        self.observe(self._on_trait_change, type="change")

        # Check that all kwargs are valid -- throws error if not
        validate_traits(self, kwargs)

        super(TableLayer, self).__init__(**kwargs)

        if not table_from_wwt_engine:
            if kwargs.get("coord_type") == "rectangular":

                x_guess, y_guess, z_guess = guess_xyz_columns(self.table.colnames)

                if "x_att" not in kwargs:
                    self.x_att = x_guess or self.table.colnames[0]

                if "y_att" not in kwargs:
                    self.y_att = y_guess or self.table.colnames[1]

                if "z_att" not in kwargs:
                    self.z_att = z_guess or self.table.colnames[2]

            else:

                lon_guess, lat_guess = guess_lon_lat_columns(self.table.colnames)

                if "lon_att" not in kwargs:
                    self.lon_att = lon_guess or self.table.colnames[0]

                if "lat_att" not in kwargs:
                    self.lat_att = lat_guess or self.table.colnames[1]

    @validate("coord_type")
    def _check_coord_type(self, proposal):
        if proposal["value"] in ("spherical", "rectangular"):
            return proposal["value"]
        else:
            raise ValueError("coord_type should be spherical or rectangular")

    # Attributes for spherical coordinates

    @validate("lon_unit")
    def _check_lon_unit(self, proposal):
        # Pass the proposal to Unit - this allows us to validate the unit,
        # and allows strings to be passed.
        unit = u.Unit(proposal["value"])
        unit = pick_unit_if_available(unit, VALID_LON_UNITS)
        if unit in VALID_LON_UNITS:
            return unit
        else:
            raise ValueError(
                "lon_unit should be one of {0}".format(
                    "/".join(sorted(str(x) for x in VALID_LON_UNITS))
                )
            )

    @validate("alt_unit")
    def _check_alt_unit(self, proposal):
        # Pass the proposal to Unit - this allows us to validate the unit,
        # and allows strings to be passed.
        with u.imperial.enable():
            unit = u.Unit(proposal["value"])
        unit = pick_unit_if_available(unit, VALID_ALT_UNITS)
        if unit in VALID_ALT_UNITS:
            return unit
        else:
            raise ValueError(
                "alt_unit should be one of {0}".format(
                    "/".join(sorted(str(x) for x in VALID_ALT_UNITS))
                )
            )

    @validate("alt_type")
    def _check_alt_type(self, proposal):
        if proposal["value"] in VALID_ALT_TYPES:
            return proposal["value"]
        else:
            raise ValueError(
                "alt_type should be one of {0}".format(
                    "/".join(str(x) for x in VALID_ALT_TYPES)
                )
            )

    @validate("time_att")
    def _check_time_att(self, proposal):
        # Parse the time_att column and make sure it's in the proper format
        # (string in isot format, astropy Time, or datetime)
        col = self._get_table()[proposal["value"]]

        if all(isinstance(t, datetime) for t in col) or all(
            isinstance(t, Time) for t in col
        ):
            return proposal["value"]

        elif isinstance(col, STR_TYPE) or np.issubdtype(col.dtype, NP_STR_TYPE):

            try:
                Time(col, format="isot")
                return proposal["value"]
            except ValueError:
                raise ValueError(
                    "String times must conform to the ISOT"
                    "standard (YYYY-MM-DD`T`HH:MM:SS:MS)"
                )

        else:
            raise ValueError(
                "A time column must only have string, "
                "datetime.datetime, or astropy Time values"
            )

    @validate("time_decay")
    def _check_decay(self, proposal):
        if proposal["value"].unit.physical_type == "time":
            return proposal["value"]
        else:
            raise ValueError("time_decay should be in units of time")

    @observe("alt_att")
    def _on_alt_att_change(self, *value):
        # Check if we can set the unit of the altitude automatically
        if not self.notify_changes or len(self.alt_att) == 0:
            return
        column = self._get_table()[self.alt_att]
        unit = pick_unit_if_available(column.unit, VALID_ALT_UNITS)
        if unit in VALID_ALT_UNITS:
            self.alt_unit = unit
        elif unit is not None:
            warnings.warn(
                "Column {0} has units of {1} but this is not a valid"
                " unit of altitude - set the unit directly with"
                " alt_unit".format(self.alt_att, unit),
                UserWarning,
            )

    @observe("lon_att")
    def _on_lon_att_change(self, *value):
        # Check if we can set the unit of the longitude automatically
        if not self.notify_changes or len(self.lon_att) == 0:
            return
        column = self._get_table()[self.lon_att]
        unit = pick_unit_if_available(column.unit, VALID_LON_UNITS)
        if unit in VALID_LON_UNITS:
            self.lon_unit = unit
        elif unit is not None:
            warnings.warn(
                "Column {0} has units of {1} but this is not a valid "
                "unit of longitude - set the unit directly with "
                "lon_unit".format(self.lon_att, unit),
                UserWarning,
            )

    # Attributes for cartesian coordinates

    @observe("x_att", "y_att", "z_att")
    def _on_xyz_att_change(self, *value):
        # Check if we can set the unit of the x/y/z positions automatically
        if not self.notify_changes:
            return
        for att in (self.x_att, self.y_att, self.z_att):
            if len(att) == 0:
                continue
            column = self._get_table()[att]
            unit = pick_unit_if_available(column.unit, VALID_ALT_UNITS)
            if unit in VALID_ALT_UNITS:
                self.xyz_unit = unit
                return
            elif unit is not None:
                warnings.warn(
                    "Column {0} has units of {1} but this is not a valid "
                    "unit of distance - set the unit directly with "
                    "xyz_unit".format(self.alt_att, unit),
                    UserWarning,
                )

    @validate("xyz_unit")
    def _check_xyz_unit(self, proposal):
        # Pass the proposal to Unit - this allows us to validate the unit,
        # and allows strings to be passed.
        unit = u.Unit(proposal["value"])
        unit = pick_unit_if_available(unit, VALID_ALT_UNITS)
        if unit in VALID_ALT_UNITS:
            return unit
        else:
            raise ValueError(
                "xyz_unit should be one of {0}".format(
                    "/".join(sorted(str(x) for x in VALID_ALT_UNITS))
                )
            )

    # Visual attributes

    @validate("marker_type")
    def _check_marker_type(self, proposal):
        if proposal["value"] in VALID_MARKER_TYPES:
            return proposal["value"]
        else:
            raise ValueError(
                "marker_type should be one of {0}".format(
                    "/".join(str(x) for x in VALID_MARKER_TYPES)
                )
            )

    @validate("marker_scale")
    def _check_marker_scale(self, proposal):
        if proposal["value"] in VALID_MARKER_SCALES:
            return proposal["value"]
        else:
            raise ValueError(
                "marker_scale should be one of {0}".format(
                    "/".join(str(x) for x in VALID_MARKER_SCALES)
                )
            )

    @validate("cmap")
    def _check_cmap(self, proposal):
        if isinstance(proposal["value"], str):
            return cm.get_cmap(proposal["value"])
        elif not isinstance(proposal["value"], Colormap):
            raise TypeError("cmap should be set to a Matplotlib colormap")
        else:
            return proposal["value"]

    @observe("size_att")
    def _on_size_att_change(self, *value):
        # Set the min/max levels automatically based on the min/max values
        if not self.notify_changes:
            return
        if len(self.size_att) == 0:
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="sizeColumn", value=-1
            )
            return

        self.size_vmin = None
        self.size_vmax = None

        column = self._get_table()[self.size_att]

        self.size_vmin = np.nanmin(column)
        self.size_vmax = np.nanmax(column)

    @observe("size_vmin", "size_vmax")
    def _on_size_vmin_vmax_change(self, *value):
        # Update the size column in the table
        if not self.notify_changes:
            return

        if self._uniform_size():
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="sizeColumn", value=-1
            )
        else:
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="pointScaleType", value=0
            )

            self.parent._send_msg(
                event="table_layer_set",
                id=self.id,
                setting="sizeColumn",
                value=self.size_att,
            )

            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="normalizeSize", value=True
            )

            self.parent._send_msg(
                event="table_layer_set",
                id=self.id,
                setting="normalizeSizeClip",
                value=True,
            )

            self.parent._send_msg(
                event="table_layer_set",
                id=self.id,
                setting="normalizeSizeMin",
                value=self.size_vmin,
            )

            self.parent._send_msg(
                event="table_layer_set",
                id=self.id,
                setting="normalizeSizeMax",
                value=self.size_vmax,
            )

    @observe("cmap_att")
    def _on_cmap_att_change(self, *value):

        # Set the min/max levels automatically based on the min/max values

        if not self.notify_changes:
            return

        if len(self.cmap_att) == 0:
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="colorMapColumn", value=-1
            )

            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="colorMap", value=0
            )

            return

        self.cmap_vmin = None
        self.cmap_vmax = None

        column = self._get_table()[self.cmap_att]

        self.cmap_vmin = np.nanmin(column)
        self.cmap_vmax = np.nanmax(column)

    @observe("cmap_vmin", "cmap_vmax", "cmap")
    def _on_cmap_vmin_vmax_change(self, *value):

        # Update the cmap column in the table

        if not self.notify_changes:
            return

        if self._uniform_color():

            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="colorMapColumn", value=-1
            )

            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="colorMap", value=0
            )

        else:

            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="colorMap", value=3
            )

            if self.cmap.name.lower() in VALID_COLORMAPS:

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="colorMapColumn",
                    value=self.cmap_att,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="colorMapperName",
                    value=self.cmap.name,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="dynamicColor",
                    value=True,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="normalizeColorMap",
                    value=True,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="normalizeColorMapMin",
                    value=self.cmap_vmin,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="normalizeColorMapMax",
                    value=self.cmap_vmax,
                )

            else:
                table = self._get_table()
                column = table[self.cmap_att]

                values = (column - self.cmap_vmin) / (self.cmap_vmax - self.cmap_vmin)

                # PERF: vectorize the calculation of the hex strings
                rgb = self.cmap(values)[:, :-1]
                hex_values = [to_hex(x) for x in rgb]

                table[CMAP_COLUMN_NAME] = hex_values

                self.parent._send_msg(
                    event="table_layer_update", id=self.id, table=self._table_b64
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="dynamicColor",
                    value=False,
                )

                self.parent._send_msg(
                    event="table_layer_set",
                    id=self.id,
                    setting="colorMapColumn",
                    value=CMAP_COLUMN_NAME,
                )

    @observe("time_att")
    def _on_time_att_change(self, *value):

        if (
            not self.notify_changes
            or len(self.time_att) == 0
            or self.time_series is False
        ):
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting="startDateColumn", value=-1
            )
            return

        wwt_times = Column(self._get_table()[self.time_att].copy()).tolist()
        # must specify Column so we can use tolist() on astropy Time columns

        # Convert time column to UTC so WWT displays points at expected times
        for i, tm in enumerate(wwt_times):
            wwt_times[i] = ensure_utc(tm, str_allowed=True)

        # Update the table passed to WWT with the new, modified time column
        self._get_table()[TIME_COLUMN_NAME] = Column(wwt_times)

        self.parent._send_msg(
            event="table_layer_update", id=self.id, table=self._table_b64
        )

        self.parent._send_msg(
            event="table_layer_set",
            id=self.id,
            setting="startDateColumn",
            value=TIME_COLUMN_NAME,
        )

    @observe("selectable")
    def _on_selectable_change(self, changed):
        if not self.notify_changes:
            return

        self.parent._send_msg(
            type="modify_selectability", id=self.id, selectable=changed["new"]
        )

    def _get_table(self):
        return self.table

    @property
    def _table_b64(self):

        # TODO: We need to make sure that the table has ra/dec columns since
        # WWT absolutely needs that upon creation.

        csv = csv_table_win_newline(self._get_table())

        return b64encode(csv.encode("ascii", errors="replace")).decode("ascii")

    def _uniform_color(self):
        return not self.cmap_att or self.cmap_vmin is None or self.cmap_vmax is None

    def _uniform_size(self):
        return not self.size_att or self.size_vmin is None or self.size_vmax is None

    def _initialize_layer(self):
        self.parent._send_msg(
            event="table_layer_create",
            id=self.id,
            table=self._table_b64,
            frame=self.frame,
        )

    def update_data(self, table=None):
        """
        Update the underlying data.
        """
        self.table = table.copy(copy_data=False)
        self.parent._send_msg(
            event="table_layer_update", id=self.id, table=self._table_b64
        )

        if len(self.alt_att) > 0:
            if self.alt_att in self.table.colnames:
                self._on_alt_att_change()
            else:
                self.alt_att = ""

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
        self.parent._send_msg(event="table_layer_remove", id=self.id)
        self._removed = True
        if self._manager is not None:
            self._manager.remove_layer(self)

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this
        # class gets inherited by the Jupyter widgets class which adds some
        # traits of its own, we only want to react to changes in traits
        # that have the wwt metadata attribute (which indicates the name of
        # the corresponding WWT setting).
        if not self.notify_changes:
            return

        wwt_name = self.trait_metadata(changed["name"], "wwt")
        if wwt_name is not None:
            value = changed["new"]
            if changed["name"] == "alt_unit":
                value = VALID_ALT_UNITS[self._check_alt_unit({"value": value})]
            elif changed["name"] == "lon_unit":
                value = VALID_LON_UNITS[self._check_lon_unit({"value": value})]
            elif changed["name"] == "xyz_unit":
                value = VALID_ALT_UNITS[self._check_xyz_unit({"value": value})]
            elif changed["name"] == "time_decay":
                value = value.to(u.day).value
            self.parent._send_msg(
                event="table_layer_set", id=self.id, setting=wwt_name, value=value
            )

    def _serialize_state(self):
        state = {
            "id": self.id,
            "layer_type": "table",
            "frame": self.frame,
            "settings": {},
        }

        for trait in self.traits().values():
            wwt_name = trait.metadata.get("wwt")
            if wwt_name:
                value = trait.get(self)
                if wwt_name == "decay" and value is not None:
                    value = value.to(u.day).value
                if wwt_name == "raUnits" and value is not None:
                    value = VALID_LON_UNITS[value]
                elif wwt_name == "altUnit" and value is not None:
                    value = VALID_ALT_UNITS[value]
                state["settings"][wwt_name] = value

        if self._uniform_color():
            state["settings"]["_colorMap"] = 0
            state["settings"]["colorMapColumn"] = -1
        else:
            state["settings"]["_colorMap"] = 3
            state["settings"]["colorMapColumn"] = CMAP_COLUMN_NAME

        if self._uniform_size():
            state["settings"]["sizeColumn"] = -1
        else:
            state["settings"]["sizeColumn"] = SIZE_COLUMN_NAME
            state["settings"]["pointScaleType"] = 0

        return state

    def _save_data_for_serialization(self, dir):
        file_path = path.join(dir, "{0}.csv".format(self.id))
        table_str = csv_table_win_newline(self.table)
        with open(
            file_path, "wb"
        ) as file:  # binary mode to preserve windows line endings
            file.write(table_str.encode("ascii", errors="replace"))

    def __str__(self):
        return "TableLayer with {0} markers".format(len(self.table))

    def __repr__(self):
        return "<{0}>".format(str(self))


class CatalogHipsLayer(TableLayer):
    # Reversing the hack in the baseline TableLayer -- here the sizing is
    # entirely controlled by the engine, so just respect it.

    size_att = Unicode(help="The column to use for the marker size (`str`)").tag(
        wwt="sizeColumn"
    )

    size_vmin = Float(
        None,
        help="The minimum point size. Found automagically once size_att is set (`float`)",
        allow_none=True,
    ).tag(wwt="normalizeSizeMin")

    size_vmax = Float(
        None,
        help="The maximum point size. Found automagically once size_att is set (`float`)",
        allow_none=True,
    ).tag(wwt="normalizeSizeMax")

    _settingsReverseMap = {}
    "Intentional class-wide dict - reverse-maps WWT names to pywwt names"

    def __init__(self, parent, id, app_msg):
        self.parent = parent
        self.id = id

        # Set up the settings reverse map if needed.

        if not self._settingsReverseMap:
            for tname, trait in self.traits().items():
                wwt_name = trait.metadata.get("wwt")

                if wwt_name is not None:
                    self._settingsReverseMap[wwt_name] = tname

        # Synchronize Python state with what the app has told us. One day, pywwt
        # should be able to learn about existing non-HiPS table layers in
        # similar fashion, and do the same thing.

        self.notify_changes = False

        # skeleton table so that we can reverse-map column names:
        self.table = Table(names=app_msg["spreadsheetInfo"]["header"])

        settings = app_msg["spreadsheetInfo"]["settings"]

        def mapCol(x):
            if x == -1:
                return None
            return self.table.colnames[x]

        for wwt_name, val in settings:
            pyname = self._settingsReverseMap.get(wwt_name)
            if pyname is None:
                continue

            if "_att" in pyname:
                val = mapCol(val)
                if val is None:
                    continue
            elif pyname in ("alt_unit", "xyz_unit"):
                for pyunit, wwtunit in VALID_ALT_UNITS.items():
                    if val == wwtunit:
                        val = pyunit
                        break
            elif pyname == "lon_unit":
                for pyunit, wwtunit in VALID_LON_UNITS.items():
                    if val == wwtunit:
                        val = pyunit
                        break
            elif pyname == "time_decay":
                val = val * u.day

            setattr(self, pyname, val)

        # Regular init, except that we don't override the settings.
        super().__init__(
            parent=parent,
            table=self.table,
            frame="Sky",
            id=id,
            table_from_wwt_engine=True,
        )

        # Finally, honor any future settings changes.
        self.notify_changes = True

    def _get_table(self):
        if not len(self.table):
            raise Exception(
                "HiPS catalog table must be refreshed asynchronously: `await table.refresh()`"
            )
        return self.table

    async def refresh(self, timeout=60):
        """
        Update the Python table with the data that are currently visible in the
        WWT viewer.

        Returns
        -------
        table : :class:`~astropy.table.Table`
        """

        fut = self.parent._send_into_future(
            timeout=timeout,
            event="layer_hipscat_datainview",
            tableId=self.id,
            limit=True,
        )

        reply = await fut
        self.table = Table.read(reply["data"], format="ascii.tab")
        return self.table

    def update_data(self, table=None):
        raise Exception(
            "HiPS catalogs data can only be updated by changing the field of view"
        )

    def __str__(self):
        return "Catalog HiPS Layer: {0}".format(self.id)


class ImageLayer(HasTraits):
    """
    An image layer.
    """

    vmin = Float(None, allow_none=True)
    vmax = Float(None, allow_none=True)
    stretch = Unicode("linear")
    opacity = Float(1, help="The opacity of the image").tag(wwt="opacity")
    cmap = Any(
        cm.viridis,
        help="The Matplotlib colormap (:class:`matplotlib.colors.ListedColormap`)",
    ).tag(wwt=None)

    def __init__(self, parent=None, image=None, url=None, **kwargs):
        self.parent = parent
        self.id = str(uuid.uuid4())

        # Attribute to keep track of the manager, so that we can notify the
        # manager if a layer is removed.
        self._manager = None
        self._removed = False

        self._stretch_version = 0
        self._cmap_version = 0

        if image is not None:
            self.name = kwargs.pop("name", None)

            if not self.name:
                if isinstance(image, str):
                    file_name = path.basename(image).split(".gz")[0]
                    self.name = file_name[: file_name.rfind(".")]
                else:
                    self.name = self.id

            # "Classic" mode, processing a single FITS-like input. Transform the
            # image so that it is always acceptable to WWT (Equatorial, TAN
            # projection, double values) and write out to a temporary file.
            self._sanitized_image = tempfile.mktemp()
            sanitize_image(image, self._sanitized_image, **kwargs)
            kwargs.pop("hdu_index", None)

            # The first thing we need to do is make sure the image is being served.
            # For now we assume that image is a filename, but we could do more
            # detailed checks and reproject on-the-fly for example.

            self._image_url = self.parent._serve_file(
                self._sanitized_image, extension=".fits"
            )

            data = fits.getdata(self._sanitized_image)
            self.vmin, self.vmax = np.nanpercentile(data, [0.5, 99.5])
            self._data_min = np.nanmin(data)
            self._data_max = np.nanmax(data)

            self.parent._send_msg(
                event="image_layer_create",
                id=self.id,
                url=self._image_url,
                mode="fits",
                name=self.name,
            )
        elif url is not None:
            # Loading image by URL.
            self._sanitized_image = None
            self._image_url = url

            self.name = kwargs.pop("name", None)
            if not self.name:
                self.name = url

            self.parent._send_msg(
                event="image_layer_create",
                id=self.id,
                url=self._image_url,
                mode="preloaded",
                name=self.name,
            )

        # Check that all kwargs are valid -- throws error if not
        validate_traits(self, kwargs)

        super(ImageLayer, self).__init__(**kwargs)

        # Apply settings (that the user may have overridden) and track changes
        # automagically going forward.
        self._on_trait_change({"name": "vmin", "new": self.vmin})
        self._on_trait_change({"name": "opacity", "new": self.opacity})
        self._on_cmap_change()

        self.observe(self._on_trait_change, type="change")

    @validate("stretch")
    def _check_stretch(self, proposal):
        if proposal["value"] in VALID_STRETCHES:
            return proposal["value"]
        else:
            raise ValueError(
                "stretch should be one of {0}".format(
                    "/".join(str(x) for x in VALID_STRETCHES)
                )
            )

    @validate("cmap")
    def _check_cmap(self, proposal):
        if isinstance(proposal["value"], str):
            if proposal["value"] not in VALID_COLORMAPS:
                raise ValueError(
                    "Colormap should be one of "
                    + "/".join(VALID_COLORMAPS)
                    + " (got {0})".format(proposal["value"])
                )
            return cm.get_cmap(proposal["value"])
        elif not isinstance(proposal["value"], Colormap):
            raise TypeError("cmap should be set to a Matplotlib colormap")
        else:
            if proposal["value"].name not in VALID_COLORMAPS:
                raise ValueError(
                    "Colormap should be one of "
                    + ", ".join(VALID_COLORMAPS)
                    + " (got {0})".format(proposal["value"].name)
                )
            return proposal["value"]

    def remove(self):
        """
        Remove the layer.
        """
        if self._removed:
            return
        self.parent._send_msg(event="image_layer_remove", id=self.id)
        self._removed = True
        if self._manager is not None:
            self._manager.remove_layer(self)

    @observe("cmap")
    def _on_cmap_change(self, *value):
        self._cmap_version += 1
        self.parent._send_msg(
            event="image_layer_cmap",
            id=self.id,
            setting="colorMapperName",
            cmap=self.cmap.name,
            version=self._cmap_version,
        )

    def _on_trait_change(self, changed):
        if changed["name"] in ("stretch", "vmin", "vmax"):
            if self.vmin is not None and self.vmax is not None:
                stretch_id = VALID_STRETCHES.index(self.stretch)
                self._stretch_version += 1
                self.parent._send_msg(
                    event="image_layer_stretch",
                    id=self.id,
                    stretch=stretch_id,
                    vmin=self.vmin,
                    vmax=self.vmax,
                    version=self._stretch_version,
                )

        # This method gets called anytime a trait gets changed. Since this
        # class gets inherited by the Jupyter widgets class which adds some
        # traits of its own, we only want to react to changes in traits
        # that have the wwt metadata attribute (which indicates the name of
        # the corresponding WWT setting).
        wwt_name = self.trait_metadata(changed["name"], "wwt")
        if wwt_name is not None:
            self.parent._send_msg(
                event="image_layer_set",
                id=self.id,
                setting=wwt_name,
                value=changed["new"],
            )

    def _serialize_state(self):
        state = {"id": self.id, "layer_type": "image", "settings": {}}

        # A bit overkill for just the opacity, but more future-proof in case
        # we add more wwt traits
        for trait in self.traits().values():
            wwt_name = trait.metadata.get("wwt")
            if wwt_name:
                state["settings"][wwt_name] = trait.get(self)

        if self.vmin is not None and self.vmax is not None:
            state["stretch_info"] = {
                "vmin": self.vmin,
                "vmax": self.vmax,
                "stretch": VALID_STRETCHES.index(self.stretch),
                "cmap": self.cmap.name,
            }

        return state

    def _save_data_for_serialization(self, dir):
        if self._sanitized_image is None:
            raise Exception("cannot serialize non-local imagery")

        file_path = path.join(dir, "{0}.fits".format(self.id))
        shutil.copyfile(self._sanitized_image, file_path)

    def __str__(self):
        return "ImageLayer"

    def __repr__(self):
        return "<{0}>".format(str(self))
