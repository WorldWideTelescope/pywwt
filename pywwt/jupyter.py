# This file contains the defintion of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

import sys
PY2 = sys.version_info[0] == 2

import ipywidgets as widgets
from traitlets import Unicode, Float, default, link

if not PY2:
    from ipyevents import Event as DOMListener

from .core import BaseWWTWidget
from .layers import ImageLayer
from .jupyter_server import serve_file

__all__ = ['WWTJupyterWidget']

if not PY2:
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
    _view_module_version = Unicode('0.7.0').tag(sync=True)
    _model_module_version = Unicode('0.7.0').tag(sync=True)
    _ra = Float(0.0).tag(sync=True)
    _dec = Float(0.0).tag(sync=True)
    _fov = Float(60.0).tag(sync=True)

    def __init__(self):
        widgets.DOMWidget.__init__(self)
        BaseWWTWidget.__init__(self)
        if not PY2:
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
        else:
            raise ValueError("'field' should be one of: 'ra', 'dec', or 'fov'")

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
        from .layers import VALID_STRETCHES

        if self._controls is not None:
            return self._controls

        opacity = widgets.FloatSlider(
            description = 'Opacity:',
            value = self.opacity,
            min = 0,
            max = 1,
            readout = False,
        )
        link((opacity, 'value'), (self, 'opacity'))

        stretch = widgets.Dropdown(
            description = 'Stretch:',
            options = VALID_STRETCHES,
            value = self.stretch,
        )
        link((stretch, 'value'), (self, 'stretch'))

        double_width = widgets.Layout(width='600px')

        vrange = widgets.FloatRangeSlider(
            description = 'Fine min/max:',
            value = [self.vmin, self.vmax],
            min = self._data_min,
            max = self._data_max,
            readout = True,
            layout = double_width,
        )

        # Linkage must be manual since vrange uses a pair of values whereas we
        # have two separate traitlets.
        vrange.observe(self._vrange_slider_updated, names=['value'])
        def update_vrange(change):
            # Note: when this function is called, these values are indeed updated.
            vrange.value = (self.vmin, self.vmax)
        self.observe(update_vrange, names=['vmin', 'vmax'])

        coarse_min = widgets.FloatText(
            description = 'Coarse min:',
            value = self._data_min,
        )
        link((coarse_min, 'value'), (vrange, 'min'))

        coarse_max = widgets.FloatText(
            description = 'Coarse max:',
            value = self._data_max,
        )
        link((coarse_max, 'value'), (vrange, 'max'))

        self._controls = widgets.VBox([
            widgets.HBox([opacity, stretch]),
            widgets.HBox([coarse_min, coarse_max]),
            vrange,
        ])
        return self._controls

    def _vrange_slider_updated(self, change):
        self.vmin, self.vmax = change['new']
