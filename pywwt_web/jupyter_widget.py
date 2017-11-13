import ipywidgets as widgets
from traitlets import Unicode

from .model import WWTModel


@widgets.register
class JupyterWWTWidget(widgets.DOMWidget, WWTModel):

    _view_name = Unicode('WWTView').tag(sync=True)
    _model_name = Unicode('WWTModel').tag(sync=True)
    _view_module = Unicode('pywwt_web').tag(sync=True)
    _model_module = Unicode('pywwt_web').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    def send_msg(self, **kwargs):
        print("SEND", kwargs)
        self.send(kwargs)
