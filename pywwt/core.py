from traitlets import HasTraits, observe, validate, TraitError
from astropy import units as u
from astropy.time import Time
from astropy.coordinates import SkyCoord
from datetime import datetime

# We import the trait classes from .traits since we do various customizations
from .traits import Color, Bool, Float, Unicode, AstropyQuantity

from .annotation import Circle, Polygon, Line
from .imagery import get_imagery_layers

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

DEFAULT_SURVEYS_URL = 'http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys'

__all__ = ['BaseWWTWidget']


class BaseWWTWidget(HasTraits):
    """
    The core class in common to the Qt and Jupyter widgets.

    This class provides a common interface to modify settings and interact with
    WorldWide Telescope.
    """
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

    constellation_boundary_color = Color('blue', help='The color of the constellation boundaries (:class:`str` or `tuple`)').tag(wwt='constellationBoundryColor')
    constellation_figure_color = Color('red', help='The color of the constellation figure (:class:`str` or `tuple`)').tag(wwt='constellationFigureColor')
    constellation_selection_color = Color('yellow', help='The color of the constellation selection (:class:`str` or `tuple`)').tag(wwt='constellationSelectionColor')

    constellation_boundaries = Bool(False, help='Whether to show boundaries for the selected constellations (:class:`bool`)').tag(wwt='showConstellationBoundries')
    constellation_figures = Bool(False, help='Whether to show the constellations (:class:`bool`)').tag(wwt='showConstellationFigures')
    constellation_selection = Bool(False, help='Whether to only show boundaries for the selected constellation (:class:`bool`)').tag(wwt='showConstellationSelection')

    crosshairs = Bool(True, help='Whether to show crosshairs at the center of the field (:class:`bool`)').tag(wwt='showCrosshairs')
    ecliptic = Bool(False, help='Whether to show the path of the ecliptic (:class:`bool`)').tag(wwt='showEcliptic')
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
        url : `str`
            The URL of the chosen tour -- must be a .wtt file.
        """
        # throw error if url doesn't end in .wtt
        if url[-4:] == '.wtt':
            self._send_msg(event='load_tour', url=url)
        else:
            raise ValueError('url must end in \'.wwt\'')

    def pause_tour(self):
        """
        Pause a loaded tour.
        """
        self._send_msg(event='pause_tour')

    def resume_tour(self):
        """
        Resume a paused tour.
        """
        self._send_msg(event='resume_tour')

    def center_on_coordinates(self, coord, fov=60 * u.deg, instant=True):
        """
        Center the view on a particular object or point in the sky.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The set of coordinates the view should center on.

        fov : `~astropy.units.Quantity`, optional
            The desired field of view.

        instant : `bool`, optional
            Whether the view changes instantly or scrolls to the desired
            location.
        """
        coord_icrs = coord.icrs
        self._send_msg(event='center_on_coordinates',
                       ra=coord_icrs.ra.deg,
                       dec=coord_icrs.dec.deg,
                       fov=fov.to(u.deg).value,
                       instant=instant)

    def set_current_time(self, dt):
        """
        Set the viewer time to match the real-world time.

        Parameters
        ----------
        dt : `~datetime.datetime` or `~astropy.time.Time`
            The current time, either as a `datetime.datetime` object or an astropy
            :class:`astropy.time.Time` object.
        """
        if isinstance(dt, Time):
            dt = dt.datetime
        self._send_msg(event='set_datetime',
                       year=dt.year, month=dt.month, day=dt.day,
                       hour=dt.hour, minute=dt.minute, second=dt.second,
                       millisecond=int(dt.microsecond / 1000.))

    galactic_mode = Bool(False, help='Whether the galactic plane should be horizontal in the viewer (:class:`bool`)').tag(wwt='galacticMode')
    local_horizon_mode = Bool(False, help='Whether the view should be that of a local latitude, longitude, and altitude (:class:`bool`)').tag(wwt='localHorizonMode')
    location_altitude = AstropyQuantity(0 * u.m, help='The altitude of the viewing location in local horizon mode(:class:`~astropy.units.Quantity`)').tag(wwt='locationAltitude')
    location_latitude = AstropyQuantity(47.633 * u.deg, help='The latitude of the viewing location in local horizon mode (:class:`~astropy.units.Quantity`)').tag(wwt='locationLat')
    location_longitude = AstropyQuantity(122.133333 * u.deg, help='The longitude of the viewing location in local horizon mode (:class:`~astropy.units.Quantity`)').tag(wwt='locationLng')

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
        """
        Load a collection of layers for possible use in the viewer.

        Parameters
        ----------
        url : `str`
            The URL of the desired image collection (default: 'http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys').
        """
        self._available_layers += get_imagery_layers(url)
        self._send_msg(event='load_image_collection', url=url)

    @property
    def available_layers(self):
        """
        A list of currently available layers for the viewer
        """
        return sorted(self._available_layers)

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

    foreground_opacity = Float(0.8, help='The opacity of the foreground layer ((:class:`float`)')

    @observe('foreground_opacity')
    def _on_foreground_opacity_change(self, changed):
        self._send_msg(event='set_foreground_opacity', value=changed['new'] * 100)

    @validate('foreground_opacity')
    def _validate_foreground_opacity(self, proposal):
        if 0 <= proposal['value'] <= 1:
            return proposal['value']
        else:
            raise TraitError('foreground_opacity should be between 0 and 1')

    def add_circle(self, center=None, **kwargs):
        """
        Add a circle annotation to the current view.

        Parameters
        ----------
        center : `~astropy.units.Quantity`
            The coordinates of desired center of the circle. If blank,
            defaults to the center of the current view.
        kwargs
            Optional arguments that allow corresponding Circle or Annotation
            attributes to be set upon shape initialization.
        """
        # TODO: could buffer JS call here
        circle = Circle(parent=self, **kwargs)
        if center:
            circle.set_center(center)
        return circle

    def add_polygon(self, points=None, **kwargs):
        """
        Add a polygon annotation to the current view.

        Parameters
        ----------
        points : `~astropy.units.Quantity`
            The desired points that make up the polygon. If blank or just
            one point, the annotation will be initialized but will not be
            visible until more points are added.
        kwargs
            Optional arguments that allow corresponding Polygon or
            Annotation attributes to be set upon shape initialization.
        """
        # same TODO as above
        polygon = Polygon(parent=self, **kwargs)
        if points:
            polygon.add_point(points)
        return polygon

    def add_line(self, points=None, **kwargs):
        """
        Add a line annotation to the current view.

        Parameters
        ----------
        points : `~astropy.units.Quantity`
            The desired points that make up the line. If blank or just one
            point, the annotation will be initialized but will not be
            visible until more points are added.
        kwargs
            Optional arguments that allow corresponding Line or Annotation
            attributes to be set upon shape initialization.
        """
        # same TODO as above
        line = Line(parent=self, **kwargs)
        if points:
            line.add_point(points)
        return line
