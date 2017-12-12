from traitlets import HasTraits, observe, validate, TraitError
from astropy import units as u
from astropy.coordinates import SkyCoord
from matplotlib import colors

# We import the trait classes from .traits since we do various customizations
from .traits import Any, Bool, Float, Unicode, AstropyQuantity

from .annotation import Circle, Polygon, Line
from .imagery import get_imagery_layers

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

DEFAULT_SURVEYS_URL = 'http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys'

__all__ = ['BaseWWTWidget']


class BaseWWTWidget(HasTraits):

    def __init__(self, **kwargs):
        super(BaseWWTWidget, self).__init__()
        self.observe(self._on_trait_change, type='change')
        self._available_layers = get_imagery_layers(DEFAULT_SURVEYS_URL)

        # NOTE: we deliberately don't force _on_trait_change to be called here
        # for the WWT settings, as the default values are hard-coded in wwt.html
        # This is done because there is otherwise no reliable way of making sure
        # that we would call _on_trait_change once WWT is ready to receive
        # commands. There is a test in test_core.py that ensures that the
        # defaults here are in sync with the defaults in wwt.html

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        new_value = changed['new']
        if wwt_name is not None:
            if isinstance(new_value, u.Quantity):
                new_value = new_value.value

            self._send_msg(event='setting_set',
                           setting=wwt_name,
                           value=new_value)

    def _send_msg(self, **kwargs):
        # This method should be overridden and should send the message to WWT
        raise NotImplementedError()

    # TODO: need to add all settings as traits

    constellation_boundary_color = Any('blue', help='The color of the constellation boundaries (:class:`str` or `tuple`)').tag(wwt='constellationBoundryColor')
    constellation_figure_color = Any('red', help='The color of the constellation figure (:class:`str` or `tuple`)').tag(wwt='constellationFigureColor')
    constellation_selection_color = Any('yellow', help='The color of the constellation selection (:class:`str` or `tuple`)').tag(wwt='constellationSelectionColor')

    @validate('constellation_boundary_color')
    def _validate_boundarycolor(self, proposal):
        if isinstance(proposal['value'],str):
            return colors.to_hex(proposal['value'])
        if isinstance(proposal['value'],tuple):
            if len(proposal['value']) == 3:
                return colors.to_hex(proposal['value'])
        raise TraitError('constellation boundary color must be a string or a tuple of 3 floats')

    @validate('constellation_figure_color')
    def _validate_figurecolor(self, proposal):
        if isinstance(proposal['value'],str):
            return colors.to_hex(proposal['value'])
        if isinstance(proposal['value'],tuple):
            if len(proposal['value']) == 3:
                return colors.to_hex(proposal['value'])
        raise TraitError('constellation figure color must be a string or a tuple of 3 floats')

    @validate('constellation_selection_color')
    def _validate_selectioncolor(self, proposal):
        if isinstance(proposal['value'],str):
            return colors.to_hex(proposal['value'])
        if isinstance(proposal['value'],tuple):
            if len(proposal['value']) == 3:
                return colors.to_hex(proposal['value'])
        raise TraitError('constellation selection color must be a string or a tuple of 3 floats')

    constellation_boundaries = Bool(False, help='Whether to show boundaries for the selected constellations (:class:`bool`)').tag(wwt='showConstellationBoundries')
    constellation_figures = Bool(False, help='Whether to show the constellations (:class:`bool`)').tag(wwt='showConstellationFigures')
    constellation_selection = Bool(False, help='Whether to only show boundaries for the selected constellation (:class:`bool`)').tag(wwt='showConstellationSelection')

    crosshairs = Bool(True, help='Whether to show crosshairs at the center of the field (:class:`bool`)').tag(wwt='showCrosshairs')
    ecliptic = Bool(False, help='Whether to show the path of the ecliptic').tag(wwt='showEcliptic')
    grid = Bool(False, help='Whether to show the equatorial grid (:class:`bool`)').tag(wwt='showGrid')

    # TODO: need to add more methods here.

    def clear_annotations(self):
        """
        Clears all annotations from the current view.
        """
        return self._send_msg(event='clear_annotations')

    def get_center(self):
        """
        Return the view's current right ascension and declination in degrees.
        """
        return SkyCoord(self._send_msg(event='get_ra', async=False),
                        self._send_msg(event='get_dec', async=False),
                        unit=(u.hourangle, u.deg))

    def load_tour(self, url):
        """
        Load and begin playing a tour based on the URL to a .wtt file from
        the WorldWideTelescope website.

        Parameters
        ----------
        url : str
            The URL of the chosen tour (a .wtt file)
        """
        # throw error if url doesn't end in .wtt
        if url[-4:] == '.wtt':
            self._send_msg(event='load_tour', url=url)
        else:
            raise ValueError('url must end in \'.wwt\'')

    def stop_tour(self):
        """
        Stop a loaded tour.
        """
        self._send_msg(event='stop_tour')

    def resume_tour(self):
        """
        Resume a stopped tour.
        """
        self._send_msg(event='resume_tour')

    def center_on_coordinates(self, coord, fov=60*u.deg, instant=True):
        coord_icrs = coord.icrs
        self._send_msg(event='center_on_coordinates',
                       ra=coord_icrs.ra.deg,
                       dec=coord_icrs.dec.deg,
                       fov=fov.to(u.deg).value,
                       instant=instant)

    def set_current_time(self, dt):
        self._send_msg(event='set_datetime',
                       year=dt.year, month=dt.month, day=dt.day,
                       hour=dt.hour, minute=dt.minute, second=dt.second,
                       millisecond=int(dt.microsecond / 1000.))

    def plot_table(self, col, **kwargs):
        col_icrs = col.icrs
        for point in col_icrs:
            test = self.create_circle(center=point,**kwargs)

    galactic_mode = Bool(False, help='Whether the galactic plane should be horizontal in the viewer (:class:`bool`)').tag(wwt='galacticMode')
    local_horizon_mode = Bool(False, help='Whether the view should be that of a local latitude, longitude, and altitude (:class:`bool`)').tag(wwt='localHorizonMode')
    location_altitude = AstropyQuantity(0 * u.m, help='The altitude of the viewing location (:class:`~astropy.units.Quantity`)').tag(wwt='locationAltitude')
    location_latitude = AstropyQuantity(47.633 * u.deg, help='The latitude of the viewing location  (:class:`~astropy.units.Quantity`)').tag(wwt='locationLat')
    location_longitude = AstropyQuantity(122.133333 * u.deg, help='The longitude of the viewing location (:class:`~astropy.units.Quantity`)').tag(wwt='locationLng')

    @validate('location_altitude')
    def _validate_altitude(self, proposal):
        if proposal['value'].unit.physical_type == 'length':
            return proposal['value'].to(u.meter)
        else:
            raise TraitError('location_altitude not in units of length')

    @validate('location_latitude')
    def _validate_latitude(self, proposal):
        if proposal['value'].unit.physical_type == 'angle':
            return proposal['value'].to(u.degree)
        else:
            raise TraitError('location_latitude not in angle units')

    @validate('location_longitude')
    def _validate_longitude(self, proposal):
        if proposal['value'].unit.physical_type == 'angle':
            return proposal['value'].to(u.degree)
        else:
            raise TraitError('location_longitude not in angle units')

    def load_image_collection(self, url):
        self._available_layers += get_imagery_layers(url)
        self._send_msg(event='load_image_collection', url=url)

    @property
    def available_layers(self):
        return self._available_layers

    foreground = Unicode('Digitized Sky Survey (Color)', help='The layer to show in the foreground (:class:`str`)')

    @observe('foreground')
    def _on_foreground_change(self, changed):
        self._send_msg(event='set_foreground_by_name', name=changed['new'])

    @validate('foreground')
    def _validate_foreground(self, proposal):
        if proposal['value'] in self.available_layers:
            return proposal['value']
        else:
            raise TraitError('foreground is not one of the available layers')

    background = Unicode('Hydrogen Alpha Full Sky Map', help='The layer to show in the background (:class:`str`)')

    @observe('background')
    def _on_background_change(self, changed):
        self._send_msg(event='set_background_by_name', name=changed['new'])

    @validate('background')
    def _validate_background(self, proposal):
        if proposal['value'] in self.available_layers:
            return proposal['value']
        else:
            raise TraitError('background is not one of the available layers')

    foreground_opacity = Float(0.8, help='The opacity of the foreground layer (float)')

    @observe('foreground_opacity')
    def _on_foreground_opacity_change(self, changed):
        self._send_msg(event='set_foreground_opacity', value=changed['new'] * 100)

    @validate('foreground_opacity')
    def _validate_foreground_opacity(self, proposal):
        if 0 <= proposal['value'] <= 1:
            return proposal['value']
        else:
            raise TraitError('foreground_opacity should be between 0 and 1')

    def create_circle(self, center=None, **kwargs):
        # TODO: could buffer JS call here
        circle = Circle(parent=self, **kwargs)
        if center:
            circle.set_center(center)
        return circle

    def add_polygon(self, points=None, **kwargs):
        # same TODO as above
        polygon = Polygon(parent=self, **kwargs)
        if points:
            polygon.add_point(points)
        return polygon

    def add_line(self, points=None, **kwargs):
        # same TODO as above
        line = Line(parent=self, **kwargs)
        if points:
            line.add_point(points)
        return line
