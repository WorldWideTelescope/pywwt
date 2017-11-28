from traitlets import Bool, HasTraits, Float, Unicode
from astropy import units as u

from .annotation import Circle, Poly, PolyLine

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/


class BaseWWTWidget(HasTraits):

    def __init__(self):
        super(BaseWWTWidget, self).__init__()
        self.observe(self._on_trait_change, type='change')

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            self._send_msg(event='setting_set',
                           setting=wwt_name,
                           value=changed['new'])

    def _send_msg(self, **kwargs):
        # This method should be overridden and should send the message to WWT
        raise NotImplementedError()

    # TODO: need to add all settings as traits
    # many settings are listed as 'not yet implemented' in the documentation. still true?

    constellation_boundary_color  = Unicode('blue', help='Sets color for constellation boundary').tag(wwt='constellationBoundryColor', sync=True)
    constellation_figure_color    = Unicode('red', help='Sets color for constellation figure').tag(wwt='constellationFigureColor', sync=True)
    constellation_selection_color = Unicode('yellow', help='Sets color for constellation selection').tag(wwt='constellationSelectionColor', sync=True)

    local_horizon_mode = Bool(False, help='Whether the view should be that of a local latitude, longitude, and altitude').tag(wwt='localHorizonMode', sync=True)
    location_altitude  = Float(0, help='Assigns altitude (in meters) for view location').tag(wwt='locationAltitude', sync=True)
    location_latitude  = Float(47.633, help='Assigns latitude for view location').tag(wwt='locationLat', sync=True)
    location_longitude = Float(122.133333, help='Assigns longitude for view location').tag(wwt='locationLng', sync=True)

    constellation_boundaries = Bool(False, help='Whether to show boundaries for the selected constellations').tag(wwt='showConstellationBoundries', sync=True)
    constellation_figures    = Bool(False, help='Whether to show the constellations').tag(wwt='showConstellationFigures', sync=True)
    constellation_selection  = Bool(False, help='Whether to only show boundaries for the selected constellation').tag(wwt='showConstellationSelection', sync=True)

    crosshairs = Bool(True, help='Whether to show cross-hairs').tag(wwt='showCrosshairs', sync=True)
    ecliptic   = Bool(False, help='Whether to show the path of the Sun').tag(wwt='showEcliptic', sync=True)
    grid       = Bool(False, help='Whether to show the equatorial grid').tag(wwt='showGrid', sync=True)

    # TODO: need to add more methods here.

    def center_on_coordinates(self, coord, fov, instant=True):
        coord_icrs = coord.icrs
        self._send_msg(event='center_on_coordinates',
                       ra=coord_icrs.ra.deg,
                       dec=coord_icrs.dec.deg,
                       fov=fov.to(u.deg).value,
                       instant=instant)

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
