# Copyright 2018-2021 the .NET Foundation
# Licensed under the three-clause BSD license

"""
The core WWT widget class.

The most important definition provided in this module is the `BaseWWTWidget`
type, which defines the generic interface for controlling WWT viewers across the
different backends supported by pywwt.
"""

import asyncio
import json
import os
import shutil
import tempfile

from astropy import units as u
from astropy.time import Time
from astropy.coordinates import SkyCoord
import numpy as np
from traitlets import HasTraits, observe, validate, TraitError
import nest_asyncio

from .annotation import Circle, Polygon, Line, FieldOfView, CircleCollection
from .imagery import get_imagery_layers, ImageryLayers
from .instruments import Instruments
from .layers import LayerManager
from .logger import logger
from .solar_system import SolarSystem
from .traits import Color, Bool, Float, Unicode, AstropyQuantity
from .utils import ensure_utc

__all__ = [
    "BaseWWTWidget",
    "DataPublishingNotAvailableError",
    "ViewerNotAvailableError",
]

DEFAULT_SURVEYS_URL = "https://worldwidetelescope.github.io/pywwt/surveys.xml"

VIEW_MODES_2D = [
    "sky",
    "sun",
    "mercury",
    "venus",
    "earth",
    "moon",
    "mars",
    "jupiter",
    "callisto",
    "europa",
    "ganymede",
    "io",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "panorama",
]

VIEW_MODES_3D = [
    "solar system",
    "milky way",
    "universe",
]

R2D = 180 / np.pi
R2H = 12 / np.pi


class DataPublishingNotAvailableError(Exception):
    """
    Raised if data need to be published, but publishing service isn't available.
    """

    def __init__(self, msg=None):
        if msg is None:
            msg = "there is no mechanism available for pywwt to publish data to the WWT frontend"
        super(DataPublishingNotAvailableError, self).__init__(msg)


class ViewerNotAvailableError(Exception):
    """
    Raised if an operation needs to communicate with the WWT viewer (app), but
    the app doesn't seem to be responding to messages.
    """

    def __init__(self, msg=None):
        if msg is None:
            msg = (
                "cannot complete the operation because the WWT viewer isn't responding"
            )
        super(ViewerNotAvailableError, self).__init__(msg)


class BaseWWTWidget(HasTraits):
    """
    A class that can control a WWT viewer from Python.

    You should not create instances of this class directly. Instead, you should
    obtain obtain an instance through one of the following mechanisms, depending
    on the environment in which you're running Python and WWT:

    - In JupyterLab (the recommended approach), use
      :func:`pywwt.jupyter.connect_to_app`. This requires that you have
      :ref:`set up the WWT JupyterLab extension <setup-jupyterlab>`.
    - In plain Jupyter, or if you want to use WWT in its widget mode, create an
      instance of :class:`pywwt.jupyter.WWTJupyterWidget`. This requires that
      you have :ref:`set up the pywwt Jupyter widget <setup-jupyter-widget>`.
    - If using Qt, create an instance of :class:`pywwt.qt.WWTQtClient`.
    - If you want to control the WWT Windows application, see the
      :mod:`pywwt.windows` module.

    **Attributes:**

    If you modify most of the attributes listed below, your changes will
    automatically be reflected in the WWT view. However, there are a few special
    attributes that collect important pieces of WWT functionality:

    - :attr:`layers` (:class:`pywwt.layers.LayerManager`) allows you to add new
      data layers to the view.
    - :attr:`solar_system` (:class:`pywwt.solar_system.SolarSystem`) provides
      controls related to WWT's 3D "solar system" mode (which can display much
      more than just the solar system!)

    The following attributes collect information about data and modes that are
    available in the connected WWT viewer:

    - :attr:`available_layers` (list of ``str``) lists available image sets in a
      flat array
    - :attr:`available_views` (list of ``str``) lists available view modes
      (``"solar system"``, ``"jupiter"``, etc.) in a flat array
    - :attr:`imagery` (:class:`pywwt.imagery.ImageryLayers`) lists available
      imagery
    - :attr:`instruments` (:class:`pywwt.instruments.Instruments`) lists available
      instrument FOVs
    """

    _startupMessageQueue = None
    _appAlive = False
    _readyFuture = None
    _readinessAchieved = False

    # View state that the frontend sends to us:
    _raRad = 0.0
    _decRad = 0.0
    _fovDeg = 60.0
    _engineTime = Time("2017-03-09T12:30:00", format="isot")
    _systemTime = Time("2017-03-09T12:30:00", format="isot")
    _timeRate = 1.0

    def __init__(self, hide_all_chrome=False):
        """
        (Note that this docstring is not exposed in the API docs. It is aimed at
        developers.)

        Parameters
        ----------
        hide_all_chrome : optional `bool`
            Configures the WWT frontend to hide all user-interface "chrome".
            Defaults to true to maintain compatibility with the historical
            pywwt user experience.

        Notes
        -----

        This class communicates with the WWT "research application"
        (@wwtelescope/research-app), which has a standardized control interface
        (@wwtelescope/research-app-messages). This client is fundamentally
        concerned with communicating using that messaging interface.

        Subclasses need to set up some kind of mechanism that will call
        ``_on_app_status_change`` when the app is ready to receive messages (at
        a minimum), and ``_on_app_message_received`` when a message from the
        frontend app is received. They need to implement ``_actually_send_msg``
        which will deliver a message to the app.
        """

        super(BaseWWTWidget, self).__init__()

        self.observe(self._on_trait_change, type="change")

        self._startupMessageQueue = []
        self._seqNum = 0
        self._futures = {}

        self._available_layers = get_imagery_layers(DEFAULT_SURVEYS_URL)
        self._available_hips_catalog_names = []
        self.imagery = ImageryLayers(self._available_layers)
        self.solar_system = SolarSystem(self)
        self._instruments = Instruments()
        self.current_mode = "sky"
        self._paused = False
        self._last_sent_view_mode = "sky"
        self.layers = LayerManager(parent=self)
        self._annotation_set = set()
        self._callbacks = {}

        if hide_all_chrome:
            self._send_msg(
                event="modify_settings",
                target="app",
                settings=[
                    ("hideAllChrome", True),
                ],
            )

        # pywwt's surveys.xml has slightly different contents than
        # builtin-image-sets.wtml (for the time being), so we want to make sure
        # that the frontend agrees with us about which named imagesets are
        # available.
        self._send_msg(
            event="load_image_collection",
            url=DEFAULT_SURVEYS_URL,
            threadId=self._next_seq(),
        )

        # Forcibly set up the app's configuration to match the pywwt default.
        # Most things align, but not everything. Note that fg/bg imageset names
        # can't rely on items that are unique to DEFAULT_SURVEYS_URL since it
        # won't necessarily have loaded by the time these messages reach the
        # app.
        #
        # Note that this implementation is bad because every time you create
        # a new client, you'll forcible modify the app's state. We need to
        # move to a system where this initializer can reliably sync its state
        # to the app's.
        self._send_msg(
            event="set_background_by_name",
            name=self.background,
        )

        self._send_msg(
            event="set_foreground_by_name",
            name=self.foreground,
        )

        self._send_msg(
            event="set_foreground_opacity",
            value=self.foreground_opacity * 100,
        )

        SETTINGS = [
            "actual_planet_scale",
            "constellation_boundary_color",
            "constellation_figure_color",
            "constellation_selection_color",
        ]

        for s in SETTINGS:
            wwt_name = self.trait_metadata(s, "wwt")
            self._send_msg(
                event="setting_set",
                setting=wwt_name,
                value=getattr(self, s),
            )

        # NOTE: we deliberately don't force _on_trait_change to be called here
        # for the WWT settings, as the default values are hard-coded in the
        # widget HTML. This is done because there is otherwise no reliable way
        # of making sure that we would call _on_trait_change once WWT is ready
        # to receive commands. There is a test in test_core.py that ensures that
        # the defaults here are in sync with the defaults in the widget HTML.

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed["name"], "wwt")
        new_value = changed["new"]

        if wwt_name is not None:
            if isinstance(new_value, u.Quantity):
                new_value = new_value.value

            self._send_msg(event="setting_set", setting=wwt_name, value=new_value)

    def _next_seq(self):
        """
        When we send requests to the app, we have to be mindful that replies
        will arrive asynchronously. This means that we need to have some kind of
        unique identifier for each "conversation" helping us understand their
        individual progression. This field is called the "threadId" in the
        research app messaging API.

        To generate these unique IDs, we use a simple sequence number as needed.
        The underlying message transport implementation should further uniquify
        these IDs if needed -- this will depend on the message transport
        mechanism.
        """
        self._seqNum += 1
        return str(self._seqNum)

    def _send_msg(self, **kwargs):
        if self._startupMessageQueue is not None:
            self._startupMessageQueue.append(kwargs)
        elif self._appAlive:
            self._actually_send_msg(kwargs)
        else:
            raise ViewerNotAvailableError()

    def _send_into_future(self, timeout=30, **kwargs):
        """
        Send a message and return an asyncio Future that will resolve when the
        message receives a reply from the app. The value of the future will be
        the full JSON message received.

        This interface leverages the WWT messaging convention that messages
        which receive replies will have a field named `threadId` that will be
        reproduced in the reply. The message handler looks for this threadId and
        resolves the future if/when the reply is seen.

        By default, the future will timeout eventually. The timeout parameter is
        measured in seconds. If it's ``None``, no timeout will be applied.
        """

        seq = self._next_seq()
        loop = asyncio.get_running_loop()
        fut = loop.create_future()

        self._futures[seq] = fut
        self._send_msg(threadId=seq, **kwargs)

        if timeout is not None:

            def maybe_time_it_out():
                if not fut.done():
                    fut.set_exception(asyncio.TimeoutError())
                    del self._futures[seq]

            loop.call_later(timeout, maybe_time_it_out)

        return fut

    def _on_app_status_change(self, alive=None):
        """
        Extensibility API: if a keyword is None, that means no change in status.

        This function should be prepared to handle redundant "status change"
        updates because that's the just kind of thing that's going to happen in
        this asynchronous messaging environment.
        """

        if alive is not None:
            self._appAlive = alive

            if alive and self._readyFuture and not self._readinessAchieved:
                # See becomes_ready()
                self._readyFuture.set_result(self)
                self._readinessAchieved = True

            if alive and self._startupMessageQueue:
                queue = self._startupMessageQueue
                self._startupMessageQueue = None

                for msg in queue:
                    self._actually_send_msg(msg)

    def _on_app_message_received(self, payload):
        """
        Call this function when a message is received from the research app.
        This will generally happen in some kind of asynchronous event handler,
        so there is no guarantee that exceptions raised here will be exposed to
        the user.
        """

        ptype = payload.get("type")
        # some events don't have type but do have: pevent = payload.get('event')

        updated_fields = []

        if ptype == "wwt_view_state":
            try:
                self._raRad = float(payload["raRad"])
                self._decRad = float(payload["decRad"])
                self._fovDeg = float(payload["fovDeg"])
                self._engineTime = Time(payload["engineClockISOT"], format="isot")
                self._systemTime = Time(payload["systemClockISOT"], format="isot")
                self._timeRate = float(payload["engineClockRateFactor"])
            except ValueError:
                pass  # report a warning somehow?
        elif ptype == "wwt_application_state":
            hipscat = payload.get("hipsCatalogNames")

            if hipscat is not None:
                self._available_hips_catalog_names = hipscat

        elif ptype == "wwt_selection_state":
            most_recent = payload.get("mostRecentSource")
            sources = payload.get("selectedSources")

            if most_recent is not None:
                self._most_recent_source = most_recent
                updated_fields.append("most_recent_source")

            if sources is not None:
                self._selected_sources = sources
                updated_fields.append("selected_sources")

        # Any relevant async future to resolve?

        tid = payload.get("threadId")

        if tid is not None:
            try:
                fut = self._futures.pop(tid)
            except KeyError:
                pass
            else:
                fut.set_result(payload)

        # Any client-side callbacks to execute?

        callback = self._callbacks.get(ptype)
        if callback:
            try:
                callback(self, updated_fields)
            except:  # noqa: E722
                logger.exception("unhandled Python exception during a callback")

    def _set_message_type_callback(self, ptype, callback):
        """
        Set a callback function that will be executed when the widget receives a message with the given type.

        Parameters
        ----------
        ptype: str
            The string that identifies the message type
        callback: `BaseWWTWidget`
            A callable object which takes two arguments: the WWT widget instance, and a list of updated properties.
        """
        self._callbacks[ptype] = callback

    def set_selection_change_callback(self, callback):
        """
        Set a callback function that will be executed when the widget receives a selection change message.

        Parameters
        ----------
        callback:
            A callable object which takes two arguments: the WWT widget instance, and a list of updated properties.
        """
        self._set_message_type_callback("wwt_selection_state", callback)

    def _get_view_data(self, field):
        if not self._appAlive:
            raise ViewerNotAvailableError()

        if field == "ra":
            return self._raRad * R2H
        elif field == "dec":
            return self._decRad * R2D
        elif field == "fov":
            return self._fovDeg
        elif field == "datetime":
            engine_delta = self._timeRate * (Time.now() - self._systemTime)
            return self._engineTime + engine_delta
        else:
            raise ValueError('internal problem: unexpected "field" value')

    # Support methods that can/should be overridden by subclasses:

    def _actually_send_msg(self, payload):
        """
        Note that the API here is different than ``_send_msg``: we take a dict,
        not ``**kwargs``.
        """
        raise NotImplementedError()

    def _serve_file(self, filename, extension=""):
        """
        Publish a single file in a web server, for use by the WWT frontend.

        Parameters
        ----------
        filename : :class:`str`
            The filesystem path of the data file
        extension : optional :class:`str`, default ``""``
            A custom filename extension to be included in the published URL.

        Returns
        -------
        url : :class:`str`
            A URL, possibly incomplete, at which the file is available.

        Raises
        ------
        :exc:`DataPublishingNotAvailableError`
            Raised if no data publishing service is available.

        Notes
        -----
        Because the WWT engine is a web application, the only way to get data
        into it is to make those data available over HTTP. This method provides
        user Python code with a consistent interface for doing so. The actual
        mechanism will depend on which backend (Qt, Jupyter) is being used.

        The returned URL may be incomplete -- in Jupyter, it is not possible for
        the kernel to know the ultimate URL at which its server is accessible.
        Frontend code has to join these URLs with the server origin in order to
        obtain an actually retrievable URL.

        Data publishing may not be available -- in Jupyter, it requires a server
        extension, which may not be installed.

        The *extension* parameter is basically a hack to deal with some pywwt
        temporary files that are created on-disk without the "right" extension.
        """

        raise DataPublishingNotAvailableError()

    def _create_image_layer(self, **kwargs):
        """This method can be overridden to return specialized subclasses of
        :class:`~pywwt.layers.ImageLayer`. In particular, the Jupyter version
        of the viewer extends ``ImageLayer`` to add methods that add
        interactive UI controls for the layer parameters.

        """
        from .layers import ImageLayer

        return ImageLayer(self, **kwargs)

    # Startup

    async def becomes_ready(self, timeout=30):
        """
        An async function that finishes when the WWT app becomes ready.

        Returns
        -------
        self

        Notes
        -----

        The web browser running WWT needs to initialize the application and
        download some initial data files, which can take an indeterminate amount
        of time. This async function will complete once the WWT app has
        initialized and is ready to respond to control messages from pywwt.
        After this has happened the first time, this function will complete
        instantly.
        """

        if self._readinessAchieved:
            return self

        if self._readyFuture is None:
            loop = asyncio.get_running_loop()
            self._readyFuture = fut = loop.create_future()

            def maybe_time_it_out():
                if not fut.done():
                    self._readyFuture = None
                    fut.set_exception(asyncio.TimeoutError())

            loop.call_later(timeout, maybe_time_it_out)

        await self._readyFuture
        return self

    # Main attributes

    current_mode = None
    "The current rendering mode of the engine"

    imagery = None
    "Access to the engine's available imagesets"

    def _serve_tree(self, path):
        raise DataPublishingNotAvailableError()

    @property
    def instruments(self):
        """
        A list of instruments available for use in `add_fov`.
        """
        return self._instruments

    layers = None
    "Access to the active rendering layers"

    solar_system = None
    "Access to solar-system settings and data"

    # Settings.
    #
    # TODO: implement the remaining ones that haven't been wired up yet.

    actual_planet_scale = Bool(
        False,
        help="Whether to show planets to scale or as "
        "points with a fixed size "
        "(`bool`)",
    ).tag(wwt="actualPlanetScale", wwt_reset=True)

    alt_az_grid = Bool(
        False, help="Whether to show an altitude-azimuth grid " "(`bool`)"
    ).tag(wwt="showAltAzGrid", wwt_reset=True)

    # alt_az_text = Bool(False,
    #                    help='Whether to show labels for the altitude-azimuth grid\'s text '
    #                         '(`bool`)').tag(wwt='showAltAzGridText', wwt_reset=True)

    background = Unicode(
        "Hydrogen Alpha Full Sky Map",
        help="The layer to show in the background (`str`)",
    ).tag(wwt=None, wwt_reset=True)

    constellation_boundary_color = Color(
        "blue",
        help="The color of the constellation " "boundaries (`str` or " "`tuple`)",
    ).tag(wwt="constellationBoundryColor", wwt_reset=True)

    constellation_figure_color = Color(
        "red", help="The color of the constellation " "figure (`str` or " "`tuple`)"
    ).tag(wwt="constellationFigureColor", wwt_reset=True)

    constellation_selection_color = Color(
        "yellow",
        help="The color of the constellation " "selection (`str` or " "`tuple`)",
    ).tag(wwt="constellationSelectionColor", wwt_reset=True)

    constellation_boundaries = Bool(
        False,
        help="Whether to show boundaries for the "
        "selected constellations "
        "(`bool`)",
    ).tag(wwt="showConstellationBoundries", wwt_reset=True)

    constellation_figures = Bool(
        False, help="Whether to show the constellations " "(`bool`)"
    ).tag(wwt="showConstellationFigures", wwt_reset=True)

    constellation_selection = Bool(
        False,
        help="Whether to only show boundaries for "
        "the selected constellation "
        "(`bool`)",
    ).tag(wwt="showConstellationSelection", wwt_reset=True)

    # constellation_pictures = Bool(False,
    #                               help='Whether to show pictures of the constellations\' '
    #                                    'mythological representations '
    #                                    '(`bool`)').tag(wwt='showConstellationPictures', wwt_reset=True)

    # constellation_labels = Bool(False,
    #                             help='Whether to show labelss for constellations '
    #                                  '(`bool`)').tag(wwt='showConstellationLabels', wwt_reset=True)

    crosshairs = Bool(
        False, help="Whether to show crosshairs at the center of " "the field (`bool`)"
    ).tag(wwt="showCrosshairs", wwt_reset=True)

    crosshairs_color = Color(
        "white", help="The color of the crosshairs " "(`str` or `tuple`)"
    ).tag(wwt="crosshairsColor", wwt_reset=True)

    ecliptic = Bool(
        False, help="Whether to show the path of the ecliptic " "(`bool`)"
    ).tag(wwt="showEcliptic", wwt_reset=True)

    ecliptic_grid = Bool(
        False, help="Whether to show a grid relative to the " "ecliptic plane (`bool`)"
    ).tag(wwt="showEclipticGrid", wwt_reset=True)

    foreground = Unicode(
        "Digitized Sky Survey (Color)",
        help="The layer to show in the foreground (`str`)",
    ).tag(wwt=None, wwt_reset=True)

    foreground_opacity = Float(
        0.8, help="The opacity of the foreground layer " "(`float`)"
    ).tag(wwt=None, wwt_reset=True)

    galactic_mode = Bool(
        False,
        help="Whether the galactic plane should be horizontal "
        "in the viewer (`bool`)",
    ).tag(wwt="galacticMode", wwt_reset=True)

    galactic_grid = Bool(
        False, help="Whether to show a grid relative to the " "galactic plane (`bool`)"
    ).tag(wwt="showGalacticGrid", wwt_reset=True)

    # galactic_text = Bool(False,
    #                      help='Whether to show labels for the galactic grid\'s text '
    #                           '(`bool`)').tag(wwt='showGalacticGridText', wwt_reset=True)

    grid = Bool(False, help="Whether to show the equatorial grid " "(`bool`)").tag(
        wwt="showGrid", wwt_reset=True
    )

    local_horizon_mode = Bool(
        False,
        help="Whether the view should be that of "
        "a local latitude, longitude, and "
        "altitude (`bool`)",
    ).tag(wwt="localHorizonMode", wwt_reset=True)

    location_altitude = AstropyQuantity(
        0 * u.m,
        help="The altitude of the viewing "
        "location in local horizon mode "
        "(:class:`~astropy.units.Quantity`)",
    ).tag(wwt="locationAltitude", wwt_reset=True)

    location_latitude = AstropyQuantity(
        47.633 * u.deg,
        help="The latitude of the viewing "
        "location in local horizon mode "
        "(:class:`~astropy.units.Quantity`)",
    ).tag(wwt="locationLat", wwt_reset=True)

    location_longitude = AstropyQuantity(
        122.133333 * u.deg,
        help="The longitude of the viewing "
        "location in local horizon mode "
        "(:class:`~astropy.units.Quantity`)",
    ).tag(wwt="locationLng", wwt_reset=True)

    # Validators / observers for the settings above that need custom support.

    @observe("background")
    def _on_background_change(self, changed):
        self._send_msg(event="set_background_by_name", name=changed["new"])
        # Changing a layer resets the opacity, so we re-trigger the opacity setting
        self._send_msg(
            event="set_foreground_opacity", value=self.foreground_opacity * 100
        )

    @validate("background")
    def _validate_background(self, proposal):
        if proposal["value"] in self.available_layers:
            return proposal["value"]
        else:
            raise TraitError("background is not one of the available layers")

    @observe("foreground")
    def _on_foreground_change(self, changed):
        self._send_msg(event="set_foreground_by_name", name=changed["new"])
        # Changing a layer resets the opacity, so we re-trigger the opacity setting
        self._send_msg(
            event="set_foreground_opacity", value=self.foreground_opacity * 100
        )

    @validate("foreground")
    def _validate_foreground(self, proposal):
        if proposal["value"] in self.available_layers:
            return proposal["value"]
        else:
            raise TraitError("foreground is not one of the available layers")

    @observe("foreground_opacity")
    def _on_foreground_opacity_change(self, changed):
        self._send_msg(event="set_foreground_opacity", value=changed["new"] * 100)

    @validate("foreground_opacity")
    def _validate_foreground_opacity(self, proposal):
        if 0 <= proposal["value"] <= 1:
            return proposal["value"]
        else:
            raise TraitError("foreground_opacity should be between 0 and 1")

    @validate("location_altitude")
    def _validate_altitude(self, proposal):
        if proposal["value"].unit.physical_type == "length":
            return proposal["value"].to(u.meter)
        else:
            raise TraitError("location_altitude not in units of length")

    @validate("location_latitude")
    def _validate_latitude(self, proposal):
        if proposal["value"].unit.physical_type == "angle":
            return proposal["value"].to(u.degree)
        else:
            raise TraitError("location_latitude not in angle units")

    @validate("location_longitude")
    def _validate_longitude(self, proposal):
        if proposal["value"].unit.physical_type == "angle":
            return proposal["value"].to(u.degree)
        else:
            raise TraitError("location_longitude not in angle units")

    # Basic view controls

    def get_center(self):
        """
        Return the view's current right ascension and declination in degrees.
        """
        return SkyCoord(
            self._get_view_data("ra"),
            self._get_view_data("dec"),
            unit=(u.hourangle, u.deg),
        )

    def get_fov(self):
        """
        Return the view's current field of view in degrees.
        """
        return self._get_view_data("fov") * u.deg

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
        self._send_msg(
            event="center_on_coordinates",
            ra=coord_icrs.ra.deg,
            dec=coord_icrs.dec.deg,
            fov=fov.to(u.deg).value,
            instant=instant,
        )

    def set_view(self, mode):
        """
        Change the view mode.

        Valid options include the default sky mode, a 3D universe mode with
        different viewing levels (the solar system, the Milky Way, and the
        observed universe), individual views of major solar system objects, and
        panoramas from lunar missions and NASA's Mars rovers.

        To find the list of available views, use the
        :attr:`~pywwt.BaseWWTWidget.available_views`.

        Parameters
        ----------
        mode : `str`
            The desired view mode. (default: 'sky')
        """

        mode = mode.lower()

        solar_system_mode = "3D Solar System View"

        if mode in VIEW_MODES_2D:
            if mode == "earth":
                # Switch to a daytime view of the earth
                mode = "Bing Maps Aerial"
            elif mode == "mars":
                mode = "Visible Imagery"
            self._send_msg(event="set_viewer_mode", mode=mode)
            self._last_sent_view_mode = mode
            if mode == "sky" or mode == "panorama":
                self.current_mode = mode
            else:
                self.current_mode = "planet"
        elif mode in VIEW_MODES_3D:
            self._send_msg(event="set_viewer_mode", mode=solar_system_mode)
            self.current_mode = mode
            self._last_sent_view_mode = solar_system_mode
        else:
            raise ValueError(
                "mode should be one of {0}".format(
                    "/".join(VIEW_MODES_2D + VIEW_MODES_3D)
                )
            )

        self.reset_view()

    def reset_view(self):
        """
        Reset the current view mode's coordinates and field of view to
        their original states.
        """
        if self.current_mode == "sky":
            self.center_on_coordinates(
                SkyCoord(0.0, 0.0, unit=u.deg), fov=60 * u.deg, instant=False
            )
        if self.current_mode == "planet":
            self.center_on_coordinates(
                SkyCoord(35.55, 11.43, unit=u.deg), fov=40 * u.deg, instant=False
            )
        if self.current_mode == "solar system":
            self.center_on_coordinates(
                SkyCoord(0.0, 0.0, unit=u.deg), fov=50 * u.deg, instant=False
            )
        if self.current_mode == "milky way":
            self.center_on_coordinates(
                SkyCoord(114.85, -29.52, unit=u.deg), fov=6e9 * u.deg, instant=False
            )
        if self.current_mode == "universe":
            self.center_on_coordinates(
                SkyCoord(16.67, 37.72, unit=u.deg), fov=1e14 * u.deg, instant=False
            )
        if self.current_mode == "panorama":
            pass

    @property
    def available_views(self):
        """
        A list of the modes that are currently available in the viewer.
        """
        return sorted(VIEW_MODES_2D + VIEW_MODES_3D)

    def reset(self):
        """
        Reset WWT to initial state.
        """

        # Remove any existing layers (not using a for loop since we're removing elements)
        while len(self.layers) > 0:
            self.layers[0].remove()

        # Reset coordinates to initial view
        gc = SkyCoord(0, 0, unit=("deg", "deg"), frame="icrs")
        self.center_on_coordinates(gc, 60 * u.deg)

        # Reset only traits with the wwt_reset tag
        for trait_name, trait in self.traits().items():
            if trait.metadata.get("wwt_reset"):
                setattr(self, trait_name, trait.default_value)

    # Clock controls

    def pause_time(self):
        """
        Pause the progression of time in the viewer.
        """
        self._send_msg(event="pause_time")

    def play_time(self, rate=1):
        """
        Resume the progression of time in the viewer.

        Parameters
        ----------
        rate : int or float
            The rate at which time passes (1 meaning real-time)
        """
        self._send_msg(event="resume_time", rate=rate)

    def get_current_time(self):
        """
        Return the viewer's current time as an `~astropy.time.Time` object.
        """
        return Time(self._get_view_data("datetime"), format="isot")

    def set_current_time(self, dt=None):
        """
        Set WWT's internal clock.

        Parameters
        ----------
        dt : `~datetime.datetime` or `~astropy.time.Time`
            A time, either as a `datetime.datetime` object or an
            astropy :class:`astropy.time.Time` object. If not specified, this
            uses the current time.

        Notes
        -----
        If you call this function and then immediately call
        :meth:`get_current_time`, the results will not necessarily agree. This
        is because this function has to send a command to WWT to tell it to
        update its internal clock, and in some environments this operation is
        not instantaneous.
        """
        # Ensure the object received is a datetime or Time; convert it to UTC
        utc_tm = ensure_utc(dt, str_allowed=False)
        self._send_msg(event="set_datetime", isot=utc_tm)

    # Data loading

    def load_image_collection(self, url, recursive=False, remote_only=False):
        """
        Load a collection of layers for possible use in the viewer.

        Parameters
        ----------
        url : `str`
            The URL of the desired image collection.

        recursive : optional `bool`
            If true, will also load any child folders referenced in the
            specified WTML file. The default behavior is only to load the
            single file and *not* recurse into subfolders. Recursive loading
            can potentially be very time-consuming.

        remote_only : optional `bool`
            ADASS hack! If true, will only send the load request to the app,
            and not attempt to open the URL locally.


        Notes
        -----
        The request to load the image collection must be relayed to the WWT
        JavaScript code, which will then issue a web request and process the
        response that it gets. Therefore, you can't rely on this function to
        take immediate effect; to use an image in a collection that you've
        loaded, you'll need to pause and give WWT time to receive and process
        your request.
        """
        # TODO: this isn't the right approach. We should get knowledge about
        # available layers from the app, since it might be instructed to load up
        # WTMLs by other clients that we don't even know about. Also, this
        # doesn't work for URLs that we serve ourselves, which may only be
        # fragments when we're running in the Jupyter context.
        if not remote_only:
            self._available_layers.update(get_imagery_layers(url))

        nest_asyncio.apply()
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self._send_into_future(
            event="load_image_collection",
            url=url,
            loadChildFolders=recursive
        ))

    @property
    def available_layers(self):
        """
        A list of the layers that are currently available in the viewer.
        """
        return sorted(self._available_layers)

    # HiPS catalog support

    _available_hips_catalog_names = None

    @property
    def available_hips_catalog_names(self):
        """
        A list of the names of HiPS catalog layers that are currently available
        in the viewer.
        """
        return sorted(self._available_hips_catalog_names)

    # Support for source and HiPS catalog selection

    _most_recent_source = None

    @property
    def most_recent_source(self):
        """
        The most recent source selected in the viewer, represented as a dictionary.
        The items of this dictionary match the entries of the Source object detailed
        `here <https://docs.worldwidetelescope.org/webgl-reference/latest/apiref/research-app-messages/interfaces/selections.source.html>`_.
        """
        return self._most_recent_source

    _selected_sources = []

    @property
    def selected_sources(self):
        """
        A list of the selected sources, with each source represented as a dictionary.
        The items of these dictionaries match the entries of the Source object detailed
        `here <https://docs.worldwidetelescope.org/webgl-reference/latest/apiref/research-app-messages/interfaces/selections.source.html>`_.
        """
        return self._selected_sources

    # Annotations

    def clear_annotations(self):
        """
        Clears all annotations from the current view.
        """
        self._annotation_set.clear()
        return self._send_msg(event="clear_annotations")

    def add_circle(self, center=None, **kwargs):
        """
        Add a circle annotation to the current view.

        Parameters
        ----------
        center : `~astropy.units.Quantity`, optional
            The coordinates of desired center of the circle. If blank,
            defaults to the center of the current view.
        kwargs
            Optional arguments that allow corresponding Circle or Annotation
            attributes to be set upon shape initialization.
        """
        # TODO: could buffer JS call here
        circle = Circle(parent=self, center=center, **kwargs)
        return circle

    def add_polygon(self, points=None, **kwargs):
        """
        Add a polygon annotation to the current view.

        Parameters
        ----------
        points : `~astropy.units.Quantity`, optional
            The desired points that make up the polygon. If blank or just
            one point, the annotation will be initialized but will not be
            visible until more points are added. Note that the points should
            be specified in counter-clockwise order on the sky if you intend
            to fill the polygon.
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
        points : `~astropy.units.Quantity`, optional
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

    # Tours

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
        if url[-4:] == ".wtt":
            self._send_msg(event="load_tour", url=url)
        else:
            raise ValueError("url must end in '.wwt'")

    def pause_tour(self):
        """
        Pause a loaded tour.
        """
        self._send_msg(event="pause_tour")

    def resume_tour(self):
        """
        Resume a paused tour.
        """
        self._send_msg(event="resume_tour")

    # Instrumental FOV support (built on the annotation support)

    def add_fov(self, telescope, center=None, rotate=0 * u.rad, **kwargs):
        """
        Add a telescope's field of view (FOV) to the current view.

        Parameters
        ----------
        telescope : `str`
            The telescope whose field of view will be displayed. Be sure to use
            the ``instruments`` attribute to see and select from the preset list
            of instruments available in pyWWT.
        center : `~astropy.units.Quantity`, optional
            The coordinates of desired center of the FOV. If blank,
            defaults to the center of the current view.
        rotate : `~astropy.units.Quantity`, optional
            The amount to rotate the FOV. Both radians and degrees are
            accepted. If blank, defaults to 0 radians (no rotation).
        kwargs
            Optional arguments that allow corresponding Polygon or
            Annotation attributes to be set upon shape initialization.
        """
        return FieldOfView(self, telescope, center, rotate, **kwargs)

    # HTML (interactive figure) export

    def save_as_html_bundle(self, dest, title=None, max_width=None, max_height=None):
        """
        Save the current view as a web page with supporting files.

        This feature is currently under development, so not all
        settings/features that can be set in pyWWT will be saved

        Parameters
        ----------
        dest : `str`
            The path to output the bundle to. The path must represent a
            directory (which will be created if it does not exist) or a zip file.
        title : `str`, optional
            The desired title for the HTML page. If blank, a generic title will be used.
        max_width : `int`, optional
            The maximum width of the WWT viewport on the exported HTML page in pixels.
            If left blank, the WWT viewport will fill the enitre width of the browser.
        max_height : `int`, optional
            The maximum height of the WWT viewport on the exported HTML page in pixels.
            If left blank, the WWT viewport will fill the enitre height of the browser.
        """
        dest_root, dest_extension = os.path.splitext(dest)
        if dest_extension and dest_extension != ".zip":
            raise ValueError("'dest' must be either a directory or a .zip file")

        is_compressed = dest_extension == ".zip"
        if is_compressed:
            figure_dir = tempfile.mkdtemp()
        else:
            if not os.path.exists(dest):
                os.makedirs(os.path.abspath(dest))
            figure_dir = dest

        fig_src_dir = os.path.join(os.path.dirname(__file__), "interactive_figure")
        shutil.copy(os.path.join(fig_src_dir, "index.html"), figure_dir)
        script_dir = os.path.join(figure_dir, "scripts")
        if not os.path.exists(script_dir):
            os.mkdir(script_dir)
        shutil.copy(os.path.join(fig_src_dir, "interactive_figure.js"), script_dir)
        shutil.copy(os.path.join(fig_src_dir, "wwt_json_api.js"), script_dir)

        self._serialize_to_json(
            os.path.join(figure_dir, "wwt_figure.json"), title, max_width, max_height
        )

        if len(self.layers) > 0:
            data_dir = os.path.join(figure_dir, "data")
            if not os.path.exists(data_dir):
                os.mkdir(data_dir)
            self._save_added_data(data_dir)

        if is_compressed:
            zip_parent_dir = os.path.abspath(os.path.dirname(dest_root))
            if not os.path.exists(zip_parent_dir):
                os.makedirs(zip_parent_dir)
            shutil.make_archive(dest_root, "zip", root_dir=figure_dir)

    def _serialize_state(self, title, max_width, max_height):
        state = dict()
        state["html_settings"] = {
            "title": title,
            "max_width": max_width,
            "max_height": max_height,
        }

        state["wwt_settings"] = {}
        for trait in self.traits().values():
            wwt_name = trait.metadata.get("wwt")
            if wwt_name:
                trait_val = trait.get(self)
                if isinstance(trait_val, u.Quantity):
                    trait_val = trait_val.value
                state["wwt_settings"][wwt_name] = trait_val

        center = self.get_center()
        fov = self.get_fov()
        state["view_settings"] = {
            "mode": self._last_sent_view_mode,
            "ra": center.icrs.ra.deg,
            "dec": center.icrs.dec.deg,
            "fov": fov.to_value(u.deg),
        }

        state["foreground_settings"] = {
            "foreground": self.foreground,
            "background": self.background,
            "foreground_alpha": self.foreground_opacity * 100,
        }

        state["layers"] = self.layers._serialize_state()

        if self.current_mode in VIEW_MODES_3D:
            self.solar_system._add_settings_to_serialization(state)

        state["annotations"] = []
        for annot in self._annotation_set:
            state["annotations"].append(annot._serialize_state())
        return state

    def _serialize_to_json(self, file, title, max_width, max_height):
        state = self._serialize_state(title, max_width, max_height)
        with open(file, "w") as file_obj:
            json.dump(state, file_obj)

    def _save_added_data(self, dir):
        self.layers._save_all_data_for_serialization(dir)
