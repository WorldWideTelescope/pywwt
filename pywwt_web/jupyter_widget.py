# This file contains the defintion of the Python part of the WWT Jupyter
# widget. Note that we don't tag each trait from BaseWWTWidget as sync=True
# because we instead use JSON messages to transmit any changes between the
# Python and Javascript parts so that we can re-use this for the Qt client.

import ipywidgets as widgets
from traitlets import Unicode, default

from .core import BaseWWTWidget

__all__ = ['WWTJupyterWidget']


@widgets.register
class WWTJupyterWidget(widgets.DOMWidget, BaseWWTWidget):

    _view_name = Unicode('WWTView').tag(sync=True)
    _model_name = Unicode('WWTModel').tag(sync=True)
    _view_module = Unicode('pywwt_web').tag(sync=True)
    _model_module = Unicode('pywwt_web').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    @default('layout')
    def _default_layout(self):
        return widgets.Layout(height='480px', align_self='stretch')

    def _send_msg(self, **kwargs):
        self.send(kwargs)
