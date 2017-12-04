from traitlets import HasTraits, observe, validate, TraitError
from astropy import units as u

# We import the trait classes from .traits since we do various customizations
from .traits import Bool, Float, Unicode, AstropyQuantity

from .annotation import Circle, Poly, PolyLine
from .imagery import get_imagery_layers

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

DEFAULT_SURVEYS_URL = 'http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys'

__all__ = ['BaseWWTWidget']


class BaseWWTWidget(HasTraits):

    def __init__(self):
        super(BaseWWTWidget, self).__init__()
        self.observe(self._on_trait_change, type='change')
        self._available_layers = []
        self.load_image_collection(DEFAULT_SURVEYS_URL)
        for name in self.trait_names():
            self._on_trait_change({'name': name, 'new': getattr(self, name), 'type': 'change'})

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
    # many settings are listed as 'not yet implemented' in the documentation. still true?

    constellation_boundary_color = Unicode('blue', help='The color of the constellation boundaries (:class:`str`)').tag(wwt='constellationBoundryColor', sync=True)
    constellation_figure_color = Unicode('red', help='The color of the constellation figure (:class:`str`)').tag(wwt='constellationFigureColor', sync=True)
    constellation_selection_color = Unicode('yellow', help='The color of the constellation selection (:class:`str`)').tag(wwt='constellationSelectionColor', sync=True)

    constellation_boundaries = Bool(False, help='Whether to show boundaries for the selected constellations (:class:`bool`)').tag(wwt='showConstellationBoundries', sync=True)
    constellation_figures = Bool(False, help='Whether to show the constellations (:class:`bool`)').tag(wwt='showConstellationFigures', sync=True)
    constellation_selection = Bool(False, help='Whether to only show boundaries for the selected constellation (:class:`bool`)').tag(wwt='showConstellationSelection', sync=True)

    crosshairs = Bool(True, help='Whether to show crosshairs at the center of the field (:class:`bool`)').tag(wwt='showCrosshairs', sync=True)
    ecliptic = Bool(False, help='Whether to show the path of the ecliptic').tag(wwt='showEcliptic', sync=True)
    grid = Bool(False, help='Whether to show the equatorial grid (:class:`bool`)').tag(wwt='showGrid', sync=True)

    # TODO: need to add more methods here.

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

    def play_tour(self):
        """
        Play a stopped tour.
        """
        self._send_msg(event='play_tour')

    def center_on_coordinates(self, coord, fov, instant=True):
        coord_icrs = coord.icrs
        self._send_msg(event='center_on_coordinates',
                       ra=coord_icrs.ra.deg,
                       dec=coord_icrs.dec.deg,
                       fov=fov.to(u.deg).value,
                       instant=instant)

    local_horizon_mode = Bool(False, help='Whether the view should be that of a local latitude, longitude, and altitude (:class:`bool`)').tag(wwt='localHorizonMode', sync=True)
    location_altitude = AstropyQuantity(0 * u.m, help='The altitude of the viewing location (:class:`~astropy.units.Quantity`)').tag(wwt='locationAltitude', sync=True)
    location_latitude = AstropyQuantity(47.633 * u.deg, help='The latitude of the viewing location  (:class:`~astropy.units.Quantity`)').tag(wwt='locationLat', sync=True)
    location_longitude = AstropyQuantity(122.133333 * u.deg, help='The longitude of the viewing location (:class:`~astropy.units.Quantity`)').tag(wwt='locationLng', sync=True)

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

    background = Unicode('SFD Dust Map (Infrared)', help='The layer to show in the background (:class:`str`)')

    @observe('background')
    def _on_background_change(self, changed):
        self._send_msg(event='set_background_by_name', name=changed['new'])

    @validate('background')
    def _validate_background(self, proposal):
        if proposal['value'] in self.available_layers:
            return proposal['value']
        else:
            raise TraitError('background is not one of the available layers')

    foreground_opacity = Float(0.5, help='The opacity of the foreground layer (float)')

    @observe('foreground_opacity')
    def _on_foreground_opacity_change(self, changed):
        self._send_msg(event='set_opacity', value=changed['new'])

    @validate('foreground_opacity')
    def _validate_foreground_opacity(self, proposal):
        if 0 <= proposal['value'] <= 1:
            return proposal['value']
        else:
            raise TraitError('foreground_opacity should be between 0 and 1')

    # TODO: need to implement more annotation types

    def create_circle(self):
        # TODO: could buffer JS call here
        return Circle(self)

    def add_polygon(self):
        # same TODO as above
        return Poly(self)

    def add_polyline(self):
        # same TODO as above
        return PolyLine(self)
