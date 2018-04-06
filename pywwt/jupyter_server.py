import os
import json
from hashlib import md5
from tornado import web
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler

__all__ = ['load_jupyter_server_extension']


STATIC_DIR = os.path.join(os.path.dirname(__file__), 'nbextension', 'static')
CONFIG = os.path.expanduser('~/.pywwt')


class WWTFileHandler(IPythonHandler):

    def get(self, filename):

        filename = os.path.basename(filename)

        # First we check if this is a standard file in the static directory
        if os.path.exists(os.path.join(STATIC_DIR, filename)):
            path = os.path.join(STATIC_DIR, filename)
        else:
            # If not, we open the config file which should contain a JSON
            # dictionary with filenames and paths.
            if not os.path.exists(CONFIG):
                raise web.HTTPError(404)
            with open(CONFIG) as f:
                config = json.load(f)
            if filename in config['paths']:
                path = config['paths'][filename]
            else:
                raise web.HTTPError(404)

        with open(path, 'rb') as f:
            content = f.read()

        self.finish(content)


def serve_file(path, extension=''):

    if not os.path.exists(path):
        raise ValueError("Path {0} does not exist".format(path))

    hash = md5(path.encode('utf-8')).hexdigest() + extension

    with open(CONFIG) as f:
        config = json.load(f)

    if hash not in config['paths']:

        config['paths'][hash] = os.path.abspath(path)

        with open(CONFIG, 'w') as f:
            json.dump(config, f)

    return '/wwt/' + hash


def load_jupyter_server_extension(nb_server_app):

    web_app = nb_server_app.web_app
    host_pattern = '.*$'

    if not os.path.exists(CONFIG):
        config = {'paths': {}}
        with open(CONFIG, 'w') as f:
            json.dump(config, f)

    route_pattern = url_path_join(web_app.settings['base_url'], '/wwt/(.*)')
    web_app.add_handlers(host_pattern, [(route_pattern, WWTFileHandler)])
