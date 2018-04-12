import os
from traitlets import HasTraits, observe, validate, TraitError
from astropy import units as u
from astropy.time import Time
from astropy.coordinates import SkyCoord

# We import the trait classes from .traits since we do various customizations
from .traits import (Color, ColorWithOpacity, Bool,
                     Float, Int, Unicode, AstropyQuantity)

from .annotation import Circle, Polygon, Line, CircleCollection
from .imagery import get_imagery_layers
from .layers import ImageryLayers

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

DEFAULT_SURVEYS_URL = 'https://WorldWideTelescope.github.io/pywwt/surveys.xml'

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
        self.imagery = ImageryLayers(self._available_layers)
        self._available_modes = ['sky', 'planet', 'solar_system',
                                 'milky_way', 'universe', 'panorama']
        self.current_mode = 'sky'
        
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
    # check wwt.html for comments on settings that are disabled below

    constellation_boundary_color = Color('blue',
                                         help='The color of the constellation '
                                         'boundaries (`str` or '
                                         '`tuple`)').tag(wwt='constellationBoundryColor')
    constellation_figure_color = Color('red',
                                       help='The color of the constellation '
                                            'figure (`str` or '
                                            '`tuple`)').tag(wwt='constellationFigureColor')
    constellation_selection_color = Color('yellow',
                                          help='The color of the constellation '
                                               'selection (`str` or '
                                               '`tuple`)').tag(wwt='constellationSelectionColor')

    constellation_boundaries = Bool(False,
                                    help='Whether to show boundaries for the '
                                         'selected constellations '
                                         '(`bool`)').tag(wwt='showConstellationBoundries')
    constellation_figures = Bool(False,
                                 help='Whether to show the constellations '
                                      '(`bool`)').tag(wwt='showConstellationFigures')
    constellation_selection = Bool(False,
                                   help='Whether to only show boundaries for '
                                        'the selected constellation '
                                        '(`bool`)').tag(wwt='showConstellationSelection')
    #constellation_pictures = Bool(False, help='Whether to show pictures of the constellations\' mythological representations (`bool`)').tag(wwt='showConstellationPictures')
    #constellation_labels = Bool(False, help='Whether to show labelss for constellations (`bool`)').tag(wwt='showConstellationLabels')

    crosshairs = Bool(True, help='Whether to show crosshairs at the center of '
                                 'the field (`bool`)').tag(wwt='showCrosshairs')
    crosshairs_color = Color('white',
                             help='The color of the crosshairs '
                                  '(`str` or `tuple`)').tag(wwt='crosshairsColor')
    grid = Bool(False, help='Whether to show the equatorial grid '
                            '(`bool`)').tag(wwt='showGrid')
    ecliptic = Bool(False, help='Whether to show the path of the ecliptic '
                                '(`bool`)').tag(wwt='showEcliptic')
    ecliptic_grid = Bool(False, help='Whether to show a grid relative to the '
                                     'ecliptic plane (`bool`)').tag(wwt='showEclipticGrid')

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
            Whether the view changes instantly or smoothly scrolls to the
            desired location.
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
            The current time, either as a `datetime.datetime` object or an
            astropy :class:`astropy.time.Time` object.
        """
        if isinstance(dt, Time):
            dt = dt.datetime
        self._send_msg(event='set_datetime',
                       year=dt.year, month=dt.month, day=dt.day,
                       hour=dt.hour, minute=dt.minute, second=dt.second,
                       millisecond=int(dt.microsecond / 1000.))

    galactic_mode = Bool(False,
                         help='Whether the galactic plane should be horizontal '
                              'in the viewer (`bool`)').tag(wwt='galacticMode')
    galactic_grid = Bool(False, help='Whether to show a grid relative to the '
                                     'galactic plane (`bool`)').tag(wwt='showGalacticGrid')
    #galactic_text = Bool(False, help='Whether to show labels for the galactic grid\'s text (`bool`)').tag(wwt='showGalacticGridText')
    alt_az_grid = Bool(False, help='Whether to show an altitude-azimuth grid '
                                   '(`bool`)').tag(wwt='showAltAzGrid')
    #alt_az_text = Bool(False, help='Whether to show labels for the altitude-azimuth grid\'s text (`bool`)').tag(wwt='showAltAzGridText')

    local_horizon_mode = Bool(False, help='Whether the view should be that of '
                                          'a local latitude, longitude, and '
                                          'altitude (`bool`)').tag(wwt='localHorizonMode')
    location_altitude = AstropyQuantity(0 * u.m,
                                        help='The altitude of the viewing '
                                             'location in local horizon mode '
                                             '(:class:`~astropy.units.Quantity`)').tag(wwt='locationAltitude')
    location_latitude = AstropyQuantity(47.633 * u.deg,
                                        help='The latitude of the viewing '
                                              'location in local horizon mode '
                                              '(:class:`~astropy.units.Quantity`)').tag(wwt='locationLat')
    location_longitude = AstropyQuantity(122.133333 * u.deg,
                                         help='The longitude of the viewing '
                                              'location in local horizon mode '
                                              '(:class:`~astropy.units.Quantity`)').tag(wwt='locationLng')

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

    #ss_cmb = Bool(False, help='Whether to show the cosmic microwave background in solar system mode (`bool`)').tag(wwt='solarSystemCMB') ###
    #ss_cosmos = Bool(False, help='Whether to show data from the SDSS Cosmos data set (`bool`)').tag(wwt='solarSystemCosmos') ###
    #ss_display = Bool(False, help='Whether to show the solar system while in solar system mode (`bool`)').tag(wwt='solarSystemOverlays') ###
    #ss_lighting = Bool(False, help='Whether to show the lighting effect of the Sun on the solar system (`bool`)').tag(wwt='solarSystemLighting') ###
    ss_milky_way = Bool(True,
                        help='Whether to show the galactic bulge in the '
                             'background in solar system mode '
                             '(`bool`)').tag(wwt='solarSystemMilkyWay')
    #ss_multi_res = Bool(False, help='Whether to show the multi-resolution textures for planets where available (`bool`)').tag(wwt='solarSystemMultiRes') ###
    #ss_minor_orbits = Bool(False, help='Whether to show the orbits of minor planets in solar system mode (`bool`)').tag(wwt='solarSystemMinorOrbits') ###
    #ss_minor_planets = Bool(False, help='Whether to show minor planets in solar system mode (`bool`)').tag(wwt='solarSystemMinorPlanets') ###
    ss_orbits = Bool(True,
                     help='Whether to show orbit paths when the solar system '
                          'is displayed (`bool`)').tag(wwt='solarSystemOrbits')
    ss_objects = Bool(True,
                      help='Whether to show the objects of the solar system in '
                           'solar system mode (`bool`)').tag(wwt='solarSystemPlanets')
    ss_scale = Int(1, help='Specifies how to scale objects\' size in solar '
                           'system mode, with 1 as actual size and 100 as the '
                           'maximum (`int`)').tag(wwt='solarSystemScale')
    #ss_stars = Bool(False, help='Whether to show background stars in solar system mode (`bool`)').tag(wwt='solarSystemStars') ###

    @validate('ss_scale')
    def _validate_scale(self, proposal):
        if 1 <= proposal['value'] <= 100:
            return str(proposal['value'])
        else:
            raise ValueError('ss_scale takes integers from 1-100')

    def track_object(self, obj):
        """
        Focus the viewer on a particular object while in solar system mode.
        Available objects include the Sun, the planets, the Moon, Jupiter's
        Galilean moons, and Pluto.

        Parameters
        ----------
        obj : `str`
            The desired solar system object.
        """
        obj = obj.lower()
        mappings = {'sun': 0, 'mercury': 1, 'venus': 2, 'mars': 3, 'jupiter': 4,
                    'saturn': 5, 'uranus': 6, 'neptune': 7, 'pluto': 8,
                    'moon': 9, 'io': 10, 'europa': 11, 'ganymede': 12,
                    'callisto': 13, 'ioshadow': 14, 'europashadow': 15,
                    'ganymedeshadow': 16, 'callistoshadow': 17,
                    'suneclipsed': 18, 'earth': 19}

        if obj in mappings:
            self._send_msg(event='track_object', code=mappings[obj])
        else:
            raise ValueError('the given object cannot be tracked')

    def set_view(self, mode):
        """
        Change the view mode. Options include the default sky mode, a 3D
        universe mode with different viewing levels (the solar system, the
        Milky Way, and the observed universe), individual views of major
        solar system objects, and panoramas from lunar missions and NASA's
        Mars rovers.

        Parameters
        ----------
        mode : `str`
            The desired view mode. (default: 'sky')
        """
        mode = mode.lower()
        available = ['sky', 'sun', 'mercury', 'venus', 'earth', 'moon', 'mars',
                     'jupiter', 'callisto', 'europa', 'ganymede', 'io',
                     'saturn', 'uranus', 'neptune', 'pluto',
                     'panorama']
        ss_levels = ['solar_system', 'milky_way', 'universe']
        ss_mode = '3D Solar System View'

        if mode in available:
            self._send_msg(event='set_viewer_mode', mode=mode)
            if mode == 'sky' or mode == 'panorama':
                self.current_mode = mode
            else:
                self.current_mode = 'planet'
        elif mode in ss_levels:
            self._send_msg(event='set_viewer_mode', mode=ss_mode)
            self.current_mode = mode
        else:
            raise ValueError('the given mode does not exist')

        self.reset_view()

    def reset_view(self):
        """
        Reset the current view mode's coordinates and field of view to
        their original states.
        """
        if self.current_mode == 'sky':
            self.center_on_coordinates(SkyCoord(0., 0., unit=u.deg),
                                      fov=60*u.deg, instant=False)
        if self.current_mode == 'planet':
            self.center_on_coordinates(SkyCoord(35.55, 11.43, unit=u.deg),
                                      fov=40*u.deg, instant=False)
        if self.current_mode == 'solar_system':
            self.center_on_coordinates(SkyCoord(0., 0., unit=u.deg),
                                      fov=50*u.deg, instant=False)
        if self.current_mode == 'milky_way':
            self.center_on_coordinates(SkyCoord(114.85, -29.52, unit=u.deg),
                                      fov=6e9*u.deg, instant=False)
        if self.current_mode == 'universe':
            self.center_on_coordinates(SkyCoord(16.67, 37.72, unit=u.deg),
                                      fov=1e14*u.deg, instant=False)
        if self.current_mode == 'panorama':
            pass

    @property
    def available_modes(self):
        """
        A list of the modes that are currently available in the viewer.
        """
        return sorted(self._available_modes)        

    def load_image_collection(self, url):
        """
        Load a collection of layers for possible use in the viewer.

        Parameters
        ----------
        url : `str`
            The URL of the desired image collection.
        """
        self._available_layers.update(get_imagery_layers(url))
        self._send_msg(event='load_image_collection', url=url)

    @property
    def available_layers(self):
        """
        A list of the layers that are currently available in the viewer.
        """
        return sorted(self._available_layers)

    foreground = Unicode('Digitized Sky Survey (Color)',
                         help='The layer to show in the foreground (`str`)')

    @observe('foreground')
    def _on_foreground_change(self, changed):
        self._send_msg(event='set_foreground_by_name', name=changed['new'])
        # Changing a layer resets the opacity, so we re-trigger the opacity setting
        self._send_msg(event='set_foreground_opacity',
                       value=self.foreground_opacity * 100)

    @validate('foreground')
    def _validate_foreground(self, proposal):
        if proposal['value'] in self.available_layers:
            return proposal['value']
        else:
            raise TraitError('foreground is not one of the available layers')

    background = Unicode('Hydrogen Alpha Full Sky Map',
                         help='The layer to show in the background (`str`)')

    @observe('background')
    def _on_background_change(self, changed):
        self._send_msg(event='set_background_by_name', name=changed['new'])
        # Changing a layer resets the opacity, so we re-trigger the opacity setting
        self._send_msg(event='set_foreground_opacity',
                       value=self.foreground_opacity * 100)

    @validate('background')
    def _validate_background(self, proposal):
        if proposal['value'] in self.available_layers:
            return proposal['value']
        else:
            raise TraitError('background is not one of the available layers')

    foreground_opacity = Float(0.8, help='The opacity of the foreground layer '
                                         '(`float`)')

    @observe('foreground_opacity')
    def _on_foreground_opacity_change(self, changed):
        self._send_msg(event='set_foreground_opacity',
                       value=changed['new'] * 100)

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

    def add_collection(self, points, **kwargs):
        """
        Add a CircleCollection to the current view.

        Parameters
        ----------
        points : `~astropy.units.Quantity`
            The desired points that will serve as the centers of the
            circles that make up the collection. Requires at least two
            sets of coordinates for initialization.
        kwargs
            Optional arguments that allow corresponding Circle or
            Annotation attributes to be set upon shape initialization.
        """
        collection = CircleCollection(self, points, **kwargs)
        return collection

    def _validate_fits_data(self, filename):
        if not os.path.exists(filename):
            raise Exception("File {0} does not exist".format(filename))
        from astropy.wcs import WCS
        wcs = WCS(filename)
        projection = wcs.celestial.wcs.ctype[0][4:]
        if projection != '-TAN':
            raise ValueError("Only -TAN FITS files are supported at the moment")
