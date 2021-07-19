# This file contains the definition of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

import ipywidgets as widgets
import numpy as np
from traitlets import Unicode, default, link, directional_link

from ipyevents import Event as DOMListener
from ipykernel.comm import Comm

from .core import AppBasedWWTWidget
from .layers import ImageLayer
from .jupyter_server import serve_file

__all__ = ['WWTJupyterWidget', 'WWTLabApplication', 'connect_to_app']

_npm_version = '0.0.0-dev.0'  # cranko internal-req npm:pywwt
VIEW_MODULE_VERSION = _npm_version
MODEL_MODULE_VERSION = _npm_version

R2D = 180 / np.pi
R2H = 12 / np.pi

dom_listener = DOMListener()


@widgets.register
class WWTJupyterWidget(widgets.DOMWidget, AppBasedWWTWidget):
    """
    An AAS WorldWide Telescope Jupyter widget.
    """

    _view_name = Unicode('WWTView').tag(sync=True)
    _model_name = Unicode('WWTModel').tag(sync=True)
    _view_module = Unicode('pywwt').tag(sync=True)
    _model_module = Unicode('pywwt').tag(sync=True)
    _view_module_version = Unicode(VIEW_MODULE_VERSION).tag(sync=True)
    _model_module_version = Unicode(MODEL_MODULE_VERSION).tag(sync=True)

    _appUrl = Unicode('').tag(sync=True)

    def __init__(self):
        # In the future we might want to make it possible to use the WWT-hosted
        # app instead of the bundled version.
        #
        # The JS frontend will automagically prepend the Jupyter base URL if
        # needed and turn this into an absolute URL.

        self._appUrl = '/wwt/research/'

        widgets.DOMWidget.__init__(self)
        dom_listener.source = self
        dom_listener.prevent_default_action = True
        dom_listener.watched_events = ['wheel']

        self._controls = None

        self.on_msg(self._on_ipywidgets_message)

        AppBasedWWTWidget.__init__(self)

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
        if content.get('type') == 'wwt_jupyter_widget_status':
            self._on_app_status_change(alive=content['alive'])

        self._on_app_message_received(content)

    def _actually_send_msg(self, payload):
        """
        Send a message to the app. In ipywidgets this is easy.
        """
        self.send(payload)

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='400px', align_self='stretch')

    def _serve_file(self, filename, extension=''):
        return serve_file(filename, extension=extension)

    def _create_image_layer(self, **kwargs):
        """Returns a specialized subclass of ImageLayer that has some extra hooks for
        creating UI control points.

        """
        return JupyterImageLayer(parent=self, **kwargs)

    @property
    def layer_controls(self):
        if self._controls is None:
            opacity_slider = widgets.FloatSlider(value=self.foreground_opacity,
                                                 min=0, max=1, readout=False)
            foreground_menu = widgets.Dropdown(options=self.available_layers,
                                               value=self.foreground)
            background_menu = widgets.Dropdown(options=self.available_layers,
                                               value=self.background)
            link((opacity_slider, 'value'), (self, 'foreground_opacity'))
            link((foreground_menu, 'value'), (self, 'foreground'))
            link((background_menu, 'value'), (self, 'background'))
            self._controls = widgets.HBox([background_menu, opacity_slider, foreground_menu])
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
            description='Opacity:',
            value=self.opacity,
            min=0,
            max=1,
            readout=False,
            step=0.01,
            layout={'width': '200px'}
        )
        link((self, 'opacity'), (opacity, 'value'))

        stretch = widgets.Dropdown(
            description='Stretch:',
            options=VALID_STRETCHES,
            value=self.stretch,
            layout={'width': '200px'}
        )
        link((self, 'stretch'), (stretch, 'value'))

        # NB, this will crash if `self.cmap` is not one of our allowed values
        reverse_ui_colormaps = dict((kv[1], kv[0]) for kv in UI_COLORMAPS.items())
        colormap = widgets.Dropdown(
            description='Colormap:',
            options=UI_COLORMAPS.keys(),
            value=reverse_ui_colormaps[self.cmap.name],
            layout={'width': '200px'}
        )
        directional_link((colormap, 'label'), (self, 'cmap'), lambda x: UI_COLORMAPS[x])
        directional_link((self, 'cmap'), (colormap, 'label'), lambda x: reverse_ui_colormaps[x.name])

        vrange = widgets.FloatRangeSlider(
            description='Fine min/max:',
            value=[self.vmin, self.vmax],
            min=self._data_min,
            max=self._data_max,
            readout=True,
            layout={'width': '600px'},
            step=(self.vmax - self.vmin) / 100,
            format='.3g'
        )

        # Linkage must be manual since vrange uses a pair of values whereas we
        # have two separate traitlets.
        vrange.observe(self._vrange_slider_updated, names=['value'])

        def update_vrange(change):
            # Note: when this function is called, these values are indeed updated.
            vrange.value = (self.vmin, self.vmax)

        self.observe(update_vrange, names=['vmin', 'vmax'])

        def update_step(change):
            vrange.step = (vrange.max - vrange.min) / 100

        vrange.observe(update_step, names=['min', 'max'])

        coarse_min = widgets.FloatText(
            description='Coarse min:',
            value=self._data_min,
            layout={'width': '300px'}
        )
        link((coarse_min, 'value'), (vrange, 'min'))

        coarse_max = widgets.FloatText(
            description='Coarse max:',
            value=self._data_max,
            layout={'width': '300px'}
        )
        link((coarse_max, 'value'), (vrange, 'max'))

        self._controls = widgets.VBox([
            widgets.HBox([colormap, stretch, opacity]),
            widgets.HBox([coarse_min, coarse_max]),
            vrange,
        ])
        return self._controls

    def _vrange_slider_updated(self, change):
        self.vmin, self.vmax = change['new']


class WWTLabApplication(AppBasedWWTWidget):
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

    def __init__(self):
        self._comm = Comm(target_name='@wwtelescope/jupyterlab:research', data={})
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
        payload = msg['content']['data']

        # Special message from the hub indicating app liveness status
        if payload.get('type') == 'wwt_jupyter_viewer_status':
            self._on_app_status_change(alive=payload['alive'])
            # don't return -- maybe someone downstream can use this, and message
            # processing needs to handle all sorts of unexpected messages anyway

        self._on_app_message_received(payload)

    def _actually_send_msg(self, payload):
        self._comm.send(payload)

    def _serve_file(self, filename, extension=''):
        return serve_file(filename, extension=extension)

    def _create_image_layer(self, **kwargs):
        """Returns a specialized subclass of ImageLayer that has some extra hooks for
        creating UI control points.

        """
        return JupyterImageLayer(parent=self, **kwargs)

    @property
    def layer_controls(self):
        if self._controls is None:
            opacity_slider = widgets.FloatSlider(value=self.foreground_opacity,
                                                 min=0, max=1, readout=False)
            foreground_menu = widgets.Dropdown(options=self.available_layers,
                                               value=self.foreground)
            background_menu = widgets.Dropdown(options=self.available_layers,
                                               value=self.background)
            link((opacity_slider, 'value'), (self, 'foreground_opacity'))
            link((foreground_menu, 'value'), (self, 'foreground'))
            link((background_menu, 'value'), (self, 'background'))
            self._controls = widgets.HBox([background_menu, opacity_slider, foreground_menu])
        return self._controls


def connect_to_app():
    """
    Connect to a WWT application running inside a JupyterLab computational
    environment.

    For the time being, you must have opened the AAS WorldWide Telescope app
    inside JupyterLab. You can do this by clicking the large WWT icon in the
    JupyterLab launcher, or by invoking the "AAS WorldWide Telescope" command.
    You can open the JupyterLab command palette by typing
    Control/Command-Shift-C.

    Returns
    -------
    app : :class:`~pywwt.jupyter.WWTLabApplication`
        A connection to the WWT application running in JupyterLab.

    """
    # This function just exists because it seems nicer from a UX standpoint to
    # have the user call a function with this name, than to create a "connection
    # object".
    return WWTLabApplication()
