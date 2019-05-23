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
from .jupyter_server import serve_file

__all__ = ['WWTJupyterWidget']

if not PY2:
    dom_listener = DOMListener()


@widgets.register
class WWTJupyterWidget(widgets.DOMWidget, BaseWWTWidget):
    """
    A WorldWide Telescope Jupyter widget.
    """

    _view_name = Unicode('WWTView').tag(sync=True)
    _model_name = Unicode('WWTModel').tag(sync=True)
    _view_module = Unicode('pywwt').tag(sync=True)
    _model_module = Unicode('pywwt').tag(sync=True)
    _view_module_version = Unicode('0.6.0').tag(sync=True)
    _model_module_version = Unicode('0.6.0').tag(sync=True)
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
