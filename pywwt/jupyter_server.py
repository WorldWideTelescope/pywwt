import os
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

__all__ = ['load_jupyter_server_extension']


STATIC_DIR = os.path.join(os.path.dirname(__file__), 'nbextension', 'static')


class WWTHTMLHandler(IPythonHandler):
    def get(self):
        with open(os.path.join(STATIC_DIR, 'wwt.html')) as f:
            content = f.read()
        self.finish(content)


class WWTJSHandler(IPythonHandler):
    def get(self):
        with open(os.path.join(STATIC_DIR, 'wwt_json_api.js')) as f:
            content = f.read()
        self.finish(content)


def load_jupyter_server_extension(nb_server_app):

    web_app = nb_server_app.web_app
    host_pattern = '.*$'

    route_pattern = url_path_join(web_app.settings['base_url'], '/wwt.html')
    web_app.add_handlers(host_pattern, [(route_pattern, WWTHTMLHandler)])

    route_pattern = url_path_join(web_app.settings['base_url'], '/wwt_json_api.js')
    web_app.add_handlers(host_pattern, [(route_pattern, WWTJSHandler)])
