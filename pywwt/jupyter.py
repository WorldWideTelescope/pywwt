# This file contains the defintion of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

import sys
PY2 = sys.version_info[0] == 2

import ipywidgets as widgets
from traitlets import Unicode, default, link

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
    _view_module_version = Unicode('0.5.3').tag(sync=True)
    _model_module_version = Unicode('0.5.3').tag(sync=True)

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

    def load_fits_data(self, filename):
        """
        Load a FITS file.

        Parameters
        ----------
        filename : str
            The filename of the FITS file to display.
        """
        self._validate_fits_data(filename)
        url = serve_file(filename, extension='.fits')
        self._send_msg(event='load_fits', url=url)

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
