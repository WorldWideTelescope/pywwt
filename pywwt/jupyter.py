# This file contains the definition of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

import ipywidgets as widgets
import numpy as np
from traitlets import Unicode, default, link, directional_link

from ipyevents import Event as DOMListener
from ipykernel.comm import Comm

from .core import BaseWWTWidget, DataPublishingNotAvailableError
from .layers import ImageLayer
from .logger import logger
from .jupyter_relay import get_relay_hub

__all__ = ["WWTJupyterWidget", "WWTLabApplication", "connect_to_app"]

_npm_version = "^1.3.2"  # cranko internal-req npm:pywwt
VIEW_MODULE_VERSION = _npm_version
MODEL_MODULE_VERSION = _npm_version

R2D = 180 / np.pi
R2H = 12 / np.pi

dom_listener = DOMListener()


@widgets.register
class WWTJupyterWidget(widgets.DOMWidget, BaseWWTWidget):
    """
    An AAS WorldWide Telescope Jupyter widget.

    Parameters
    ----------

    hide_all_chrome : optional `bool`
        Configures the WWT frontend to hide all user-interface "chrome".
    app_url : optional `str`
        The URL from which to load the WWT "research app" web application. By
        default, this points to a copy of the application bundled with pywwt and
        made available through the WWT Kernel Data Relay system. If you know
        that your Jupyter notebook server definitely has pywwt installed as a
        server extension, you can specify ``"/wwtstatic/research/"`` here to get
        a version loaded directly from the server, which will be somewhat more
        reliable if you're doing tricky things with widgets and restarting your
        kernels a lot. You can also specify an absolute URL, such as
        ``"https://web.wwtassets.org/research/latest/"``, which is the canonical
        location for the WWT-hosted version of the app — although at the moment
        we can't think of any good reason to use it here. If the URL given here
        does not contain a protocol (``https://...``), it will be combined with
        the Jupyter server's "base URL".
    """

    _view_name = Unicode("WWTView").tag(sync=True)
    _model_name = Unicode("WWTModel").tag(sync=True)
    _view_module = Unicode("pywwt").tag(sync=True)
    _model_module = Unicode("pywwt").tag(sync=True)
    _view_module_version = Unicode(VIEW_MODULE_VERSION).tag(sync=True)
    _model_module_version = Unicode(MODEL_MODULE_VERSION).tag(sync=True)

    _appUrl = Unicode("").tag(sync=True)

    def __init__(self, hide_all_chrome=False, app_url=None):
        # Set up Kernel Data Relay expedited message processing.
        _maybe_perpetrate_mega_kernel_hack()

        # Serve the bundled app by default. Regardless of whether we're using
        # that or a user-specified value, the JS frontend will automagically
        # prepend the Jupyter base URL if needed so that the client always gets
        # an absolute URL.
        if app_url is None:
            hub = get_relay_hub()
            app_url = hub.get_static_files_url() + "research/"
        self._appUrl = app_url

        widgets.DOMWidget.__init__(self)
        dom_listener.source = self
        dom_listener.prevent_default_action = True
        dom_listener.watched_events = ["wheel"]

        self._controls = None

        self.on_msg(self._on_ipywidgets_message)

        BaseWWTWidget.__init__(self, hide_all_chrome=hide_all_chrome)

    def _on_ipywidgets_message(self, widget, content, buffers):
        """
        Called when we receive a "custom" ipywidgets message.

        NOTE: because this code is run asynchronously in Jupyter's comms
        architecture, exceptions and printouts don't get reported to the user --
        they just disappear. I don't know if there's a "right" way to address
        that.
        """

        # Special message from the ipywidgets bridge to indicate
        # when the first widget view is ready to accept messages.
        if content.get("type") == "wwt_jupyter_widget_status":
            self._on_app_status_change(alive=content["alive"])

        self._on_app_message_received(content)

    def _actually_send_msg(self, payload):
        """
        Send a message to the app. In ipywidgets this is easy.
        """
        self.send(payload)

    @default("layout")
    def _default_layout(self):
        return widgets.Layout(height="400px", align_self="stretch")

    def _serve_file(self, filename, extension=""):
        return get_relay_hub().serve_file(filename, extension=extension)

    def _create_image_layer(self, **kwargs):
        """Returns a specialized subclass of ImageLayer that has some extra hooks for
        creating UI control points.

        """
        return JupyterImageLayer(parent=self, **kwargs)

    @property
    def layer_controls(self):
        if self._controls is None:
            opacity_slider = widgets.FloatSlider(
                value=self.foreground_opacity, min=0, max=1, readout=False
            )
            foreground_menu = widgets.Dropdown(
                options=self.available_layers, value=self.foreground
            )
            background_menu = widgets.Dropdown(
                options=self.available_layers, value=self.background
            )
            link((opacity_slider, "value"), (self, "foreground_opacity"))
            link((foreground_menu, "value"), (self, "foreground"))
            link((background_menu, "value"), (self, "background"))
            self._controls = widgets.HBox(
                [background_menu, opacity_slider, foreground_menu]
            )
        return self._controls


class JupyterImageLayer(ImageLayer):
    def __init__(self, **kwargs):
        self._controls = None
        super(JupyterImageLayer, self).__init__(**kwargs)

    @property
    def controls(self):
        from .layers import VALID_STRETCHES, UI_COLORMAPS

        if self._controls is not None:
            return self._controls

        opacity = widgets.FloatSlider(
            description="Opacity:",
            value=self.opacity,
            min=0,
            max=1,
            readout=False,
            step=0.01,
            layout={"width": "200px"},
        )
        link((self, "opacity"), (opacity, "value"))

        stretch = widgets.Dropdown(
            description="Stretch:",
            options=VALID_STRETCHES,
            value=self.stretch,
            layout={"width": "200px"},
        )
        link((self, "stretch"), (stretch, "value"))

        # NB, this will crash if `self.cmap` is not one of our allowed values
        reverse_ui_colormaps = dict((kv[1], kv[0]) for kv in UI_COLORMAPS.items())
        colormap = widgets.Dropdown(
            description="Colormap:",
            options=UI_COLORMAPS.keys(),
            value=reverse_ui_colormaps[self.cmap.name],
            layout={"width": "200px"},
        )
        directional_link((colormap, "label"), (self, "cmap"), lambda x: UI_COLORMAPS[x])
        directional_link(
            (self, "cmap"), (colormap, "label"), lambda x: reverse_ui_colormaps[x.name]
        )

        vrange = widgets.FloatRangeSlider(
            description="Fine min/max:",
            value=[self.vmin, self.vmax],
            min=self._data_min,
            max=self._data_max,
            readout=True,
            layout={"width": "600px"},
            step=(self.vmax - self.vmin) / 100,
            format=".3g",
        )

        # Linkage must be manual since vrange uses a pair of values whereas we
        # have two separate traitlets.
        vrange.observe(self._vrange_slider_updated, names=["value"])

        def update_vrange(change):
            # Note: when this function is called, these values are indeed updated.
            vrange.value = (self.vmin, self.vmax)

        self.observe(update_vrange, names=["vmin", "vmax"])

        def update_step(change):
            vrange.step = (vrange.max - vrange.min) / 100

        vrange.observe(update_step, names=["min", "max"])

        coarse_min = widgets.FloatText(
            description="Coarse min:", value=self._data_min, layout={"width": "300px"}
        )
        link((coarse_min, "value"), (vrange, "min"))

        coarse_max = widgets.FloatText(
            description="Coarse max:", value=self._data_max, layout={"width": "300px"}
        )
        link((coarse_max, "value"), (vrange, "max"))

        self._controls = widgets.VBox(
            [
                widgets.HBox([colormap, stretch, opacity]),
                widgets.HBox([coarse_min, coarse_max]),
                vrange,
            ]
        )
        return self._controls

    def _vrange_slider_updated(self, change):
        self.vmin, self.vmax = change["new"]


class WWTLabApplication(BaseWWTWidget):
    """
    A handle the WWT JupyterLab application.

    While other parts of pywwt create "widgets", bound to variables running
    inside Python notebooks, this class represents a connection to the
    standalone "application", which exists in JupyterLab independently of any
    one specific notebook. The Python API is the same, it's just that the JSON
    messages we send are routed to the separate application rather than our own
    iframe.
    """

    _comm = None
    _controls = None
    _relayAvailable = False

    def __init__(self):
        _maybe_perpetrate_mega_kernel_hack()

        self._comm = Comm(target_name="@wwtelescope/jupyterlab:research", data={})
        self._comm.on_msg(self._on_comm_message_received)
        self._comm.open()

        super(WWTLabApplication, self).__init__()

    def _on_comm_message_received(self, msg):
        """
        Called when we receive a comms message.

        NOTE: because this code is run asynchronously in Jupyter's comms
        architecture, exceptions and printouts don't get reported to the user --
        they just disappear. I don't know if there's a "right" way to address
        that.
        """
        payload = msg["content"]["data"]
        ptype = payload.get("type")

        # Special message from the hub indicating app liveness status
        if ptype == "wwt_jupyter_viewer_status":
            self._on_app_status_change(alive=payload["alive"])
            # don't return -- maybe someone downstream can use this, and message
            # processing needs to handle all sorts of unexpected messages anyway
        elif ptype == "wwt_jupyter_startup_info":
            self._relayAvailable = payload.get("dataRelayConfirmedAvailable", False)
            return

        self._on_app_message_received(payload)

    def _actually_send_msg(self, payload):
        self._comm.send(payload)

    def _serve_file(self, filename, extension=""):
        if not self._relayAvailable:
            raise DataPublishingNotAvailableError(
                "Unable to complete this operation because it relies on "
                "data relay services that are not available. Ensure that "
                "your Jupyter server has the `wwt_kernel_data_relay` package "
                "installed."
            )
        return get_relay_hub().serve_file(filename, extension=extension)

    def _serve_tree(self, path):
        if not self._relayAvailable:
            raise DataPublishingNotAvailableError(
                "Unable to complete this operation because it relies on "
                "data relay services that are not available. Ensure that "
                "your Jupyter server has the `wwt_kernel_data_relay` package "
                "installed."
            )
        return get_relay_hub().serve_tree(path)

    def _create_image_layer(self, **kwargs):
        """Returns a specialized subclass of ImageLayer that has some extra hooks for
        creating UI control points.

        """
        return JupyterImageLayer(parent=self, **kwargs)

    @property
    def layer_controls(self):
        if self._controls is None:
            opacity_slider = widgets.FloatSlider(
                value=self.foreground_opacity, min=0, max=1, readout=False
            )
            foreground_menu = widgets.Dropdown(
                options=self.available_layers, value=self.foreground
            )
            background_menu = widgets.Dropdown(
                options=self.available_layers, value=self.background
            )
            link((opacity_slider, "value"), (self, "foreground_opacity"))
            link((foreground_menu, "value"), (self, "foreground"))
            link((background_menu, "value"), (self, "background"))
            self._controls = widgets.HBox(
                [background_menu, opacity_slider, foreground_menu]
            )
        return self._controls


def connect_to_app():
    """
    Connect to a WWT application running inside a JupyterLab computational
    environment. This is your preferred gateway to using WWT in JupyterLab.

    For the time being, you must have opened the AAS WorldWide Telescope app
    inside JupyterLab. You can do this by clicking the large WWT icon in the
    JupyterLab launcher, or by invoking the "AAS WorldWide Telescope" command.
    You can open the JupyterLab command palette by typing
    Control/Command-Shift-C.

    The traditional way to use WWT in a JupyterLab notebook is with the
    following commands in their own cell::

        from pywwt.jupyter import connect_to_app
        wwt = await connect_to_app().becomes_ready()

    Once you have this *wwt* variable, you can control WWT using all of the
    commands defined on the :class:`~pywwt.jupyter.WWTLabApplication` class.

    Returns
    -------
    app : :class:`~pywwt.jupyter.WWTLabApplication`
        A connection to the WWT application running in JupyterLab.

    """
    # This function just exists because it seems nicer from a UX standpoint to
    # have the user call a function with this name, than to create a "connection
    # object".
    return WWTLabApplication()


def _maybe_perpetrate_mega_kernel_hack():
    """
    OK. So.

    The Python code running in this process is communicating with the WWT
    JavaScript frontend, which is running in another process that is possibly on
    the other side of the internet. Various WWT operations such as loading
    imagery need that frontend to perform web requests and the like. So much of
    what we want to do is just inherently asynchronous.

    Which is OK! We require sufficiently new Python that we can rely on
    async/await being available, and the Jupyter infrastructure is extremely
    async-friendly.

    Except that we have a problem. When our process is running inside Jupyter,
    all code executions are inherently triggered by "shell messages" telling the
    kernel to run some code. Shell messages are also used for Jupyter's "comms"
    infrastructure, which is how kernels get updates from the WWT frontend(s)
    about things that are going on. The problem is that the Python Jupyter
    kernels only process shell messages *sequentially*: while message evaluation
    can be asynchronous, they can't be evaluated simultaneously. So if we've got
    asynchronous user code that's attempting to do stuff with pywwt, we can't
    receive any updates from WWT while that code is running. This fundamentally
    breaks our ability to allow users to write code that interacts with WWT
    asynchronously.

    Our mega-hack solution is to allow some shell messages to be marked for
    "expedited" processing. We hack the kernel so that such messages can be
    processed even while another shell message -- such as an execution request
    -- is being dealt with. This breaks the logjam.

    Expedited messages have the following structure:

    {
        'content': {
            '_pywwtExpedite': true
        }
    }

    This allows ipywidgets custom messages to be marked for expedited
    processing, which we need for our ipywidget support.

    To amp up the debugging spew so that you can see what's going on inside
    the kernel (which is captured in the Jupyter Server output), run:

    ```
    import ipykernel.kernelbase
    ipykernel.kernelbase.Kernel.instance().log.setLevel('DEBUG')
    ```

    Please forgive me.
    """

    try:
        _maybe_perpetrate_mega_kernel_hack_inner()
    except Exception:
        logger.exception("failed to set up Jupyter kernel async hack")


def _maybe_perpetrate_mega_kernel_hack_inner():
    import asyncio
    import inspect
    import ipykernel.kernelbase

    kernel = ipykernel.kernelbase.Kernel.instance()
    orig_schedule_dispatch = kernel.schedule_dispatch

    if getattr(kernel, "_pywwt_mega_hack_installed", False):
        return

    # If asyncio doesn't think that there's a running event loop, we don't seem
    # to be running as a client of a full-on Jupyter server. In which case, play
    # it safe and don't do anything.

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return

    # OK, it looks like we should try to do this ...

    async def dispatch_one_expedited_shell_message(idents, msg):
        """
        A bastardized version of `kernel.dispatch_shell`. Our arguments will be
        the result of `kernel.session.feed_identities`.

        Expedited shell messages have to be processed as straightforwardly as
        possible since their processing can happen while other shell message
        processing is happening. The kernel code is *not* build to handle the
        recursive-y, race-y things that can happen in this situation. So we
        avoid all function calls that we can possible get away with skipping.
        No set_parent, no should_handle, etc.
        """

        try:
            msg = kernel.session.deserialize(msg, content=True, copy=False)
        except Exception:
            kernel.log.error("Invalid Expedited Message (pywwt)", exc_info=True)
            return

        msg_type = msg["header"]["msg_type"]
        handler = kernel.shell_handlers.get(msg_type, None)

        if handler is None:
            kernel.log.warning("Unknown expedited message type (pywwt): %r", msg_type)
        else:
            kernel.log.debug("expedited (pywwt) %s: %s", msg_type, msg)

            try:
                result = handler(kernel.shell_stream, idents, msg)
                if inspect.isawaitable(result):
                    kernel.log.error(
                        "Expedited message (pywwt) produce an awaitable result"
                    )
            except Exception:
                kernel.log.error(
                    "Exception in expedited message handler (pywwt):", exc_info=True
                )

    def pywwt_schedule_shell_dispatch_with_expedite(*args):
        """
        A replacement of `kernel.schedule_dispatch` for shell messages.

        This peeks inside the message and triggers expedited processing if
        called for. If there are any issues, we fall back to regular processing.

        """
        expedited_it = False

        try:
            (msg,) = args
            idents, msg = kernel.session.feed_identities(msg, copy=False)
            # We can't deserialize() here: each message can only be deserialized once
            # due to the replay prevention framework.
            peek_content = kernel.session.unpack(msg[4].bytes)
            expedite_flag = (
                peek_content.get("data", {}).get("content", {}).get("_pywwtExpedite")
            )

            if expedite_flag:
                kernel.io_loop.add_callback(
                    dispatch_one_expedited_shell_message, idents, msg
                )
                expedited_it = True
        finally:
            if not expedited_it:
                orig_schedule_dispatch(kernel.dispatch_shell, *args)

    kernel.shell_stream.on_recv(pywwt_schedule_shell_dispatch_with_expedite, copy=False)
    kernel._pywwt_mega_hack_installed = True
    logger.debug("installed Jupyter kernel message expedite hack")
