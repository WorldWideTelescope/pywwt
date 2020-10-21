# This file contains the defintion of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

from astropy.time import Time
import ipywidgets as widgets
from traitlets import Unicode, Float, default, link, directional_link

from ipyevents import Event as DOMListener

from .core import BaseWWTWidget
from .layers import ImageLayer
from .jupyter_server import serve_file

__all__ = ['WWTJupyterWidget']

_npm_version = '^1.0.0'  # cranko internal-req npm:pywwt
VIEW_MODULE_VERSION = _npm_version
MODEL_MODULE_VERSION = _npm_version

dom_listener = DOMListener()


@widgets.register
class WWTJupyterWidget(widgets.DOMWidget, BaseWWTWidget):
    """
    An AAS WorldWide Telescope Jupyter widget.
    """

    _view_name = Unicode('WWTView').tag(sync=True)
    _model_name = Unicode('WWTModel').tag(sync=True)
    _view_module = Unicode('pywwt').tag(sync=True)
    _model_module = Unicode('pywwt').tag(sync=True)
    _view_module_version = Unicode(VIEW_MODULE_VERSION).tag(sync=True)
    _model_module_version = Unicode(MODEL_MODULE_VERSION).tag(sync=True)

    # wwt=None tag needed to avoid linkage to 'wwt.settings.set_' type traits
    # (see _on_trait_change() in core.py)
    _ra = Float(0.0).tag(sync=True, wwt=None)
    _dec = Float(0.0).tag(sync=True, wwt=None)
    _fov = Float(60.0).tag(sync=True, wwt=None)
    # this is the WWT engine's clock at last check-in:
    _datetime = Unicode('2017-03-09T12:30:00').tag(sync=True, wwt=None)
    # this is system clock at last check-in:
    _systemDatetime = Unicode('2017-03-09T12:30:00').tag(sync=True, wwt=None)
    # this is the rate at which the WWT engine clock proceeds relative to the system clock:
    _timeRate = Float(1.0).tag(sync=True, wwt=None)

    def __init__(self):
        widgets.DOMWidget.__init__(self)
        BaseWWTWidget.__init__(self)
        dom_listener.source = self
        dom_listener.prevent_default_action = True
        dom_listener.watched_events = ['wheel']
        self._controls = None

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='400px', align_self='stretch')

    def _send_msg(self, **kwargs):
        self.send(kwargs)

    def _serve_file(self, filename, extension=''):
        return serve_file(filename, extension=extension)

    def _get_view_data(self, field):
        if field == 'ra':
            return self._ra
        elif field == 'dec':
            return self._dec
        elif field == 'fov':
            return self._fov
        elif field == 'datetime':
            engine_time = Time(self._datetime, format='isot')
            system_time = Time(self._systemDatetime, format='isot')
            engine_delta = self._timeRate * (Time.now() - system_time)
            return engine_time + engine_delta
        else:
            raise ValueError("'field' should be one of: 'ra', 'dec', "
                             "'fov', or 'datetime'")

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
