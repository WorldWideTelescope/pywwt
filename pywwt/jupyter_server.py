"""Routines for the pywwt notebook server extension.

In order to make files available to the WWT engine, we need to serve them over
HTTP. Here we extend the Notebook server to be able to server both static
pywwt HTML/JS assets and custom local files specified by the user.

The tricky part is that the Notebook server and the kernel are in separate
processes, and there is no super convenient way for them to communicate. Here,
we assume that they share a home directory, and enable communications by
writing JSON to a file in $HOME.

The recently added code in :func:`_compute_notebook_server_base_url`
demonstrates how the kernel can figure out a URL by which to communicate with
the server. So, in principle, we could replace this local-file communication
with REST API calls. I'm not aware of any better way for the kernel and server
to talk to each other. (Note that the notebook "comms" API is for the kernel
to talk to the JavaScript frontend, not the notebook server.)

"""
import os
import json
import mimetypes
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

        # Do our best to set an appropriate Content-Type.
        self.set_header('Content-Type', mimetypes.guess_type(filename)[0])

        with open(path, 'rb') as f:
            content = f.read()

        self.finish(content)


def _compute_notebook_server_base_url():
    """Figure out the base_url of the current Jupyter notebook server.

    Copied from
    https://github.com/jupyter/notebook/issues/3156#issuecomment-401119433
    with miniscule changes. This is gross, but appears to be the best
    available option right now.

    """
    import ipykernel
    import json
    from notebook.notebookapp import list_running_servers
    import re
    import requests

    # First, find our ID.
    kernel_id = re.search(
        'kernel-(.*).json',
        ipykernel.connect.get_connection_file()
    ).group(1)

    # Now, check all of the running servers known on this machine. We have to
    # talk to each server to figure out if it's ours or somebody else's.
    for s in list_running_servers():
        response = requests.get(
            requests.compat.urljoin(s['url'], 'api/sessions'),
            params = {'token': s.get('token', '')}
        )

        for n in json.loads(response.text):
            if n['kernel']['id'] == kernel_id:
                return s['base_url']  # Found it!

    raise Exception('cannot locate our notebook server; is this code running in a Jupyter kernel?')


_server_base_url = None

def get_notebook_server_base_url():
    """Get the "base_url" of the current Jupyter notebook server.

    """
    global _server_base_url
    if _server_base_url is None:
        _server_base_url = _compute_notebook_server_base_url()
    return _server_base_url


def serve_file(path, extension=''):
    """Given a path to a file on local disk, instruct the notebook server
    to serve it up over HTTP. Returns a relative URL that can be used to
    access the file.

    """
    if not os.path.exists(path):
        raise ValueError("Path {0} does not exist".format(path))

    hash = md5(path.encode('utf-8')).hexdigest() + extension

    with open(CONFIG) as f:
        config = json.load(f)

    if hash not in config['paths']:

        config['paths'][hash] = os.path.abspath(path)

        with open(CONFIG, 'w') as f:
            json.dump(config, f)

    return url_path_join(get_notebook_server_base_url(), '/wwt/' + hash)


def load_jupyter_server_extension(nb_server_app):

    web_app = nb_server_app.web_app
    host_pattern = '.*$'

    if not os.path.exists(CONFIG):
        config = {'paths': {}}
        with open(CONFIG, 'w') as f:
            json.dump(config, f)

    mimetypes.add_type('image/fits','.fits')
    mimetypes.add_type('image/fits','.fts')
    mimetypes.add_type('image/fits','.fit')

    route_pattern = url_path_join(web_app.settings['base_url'], '/wwt/(.*)')
    web_app.add_handlers(host_pattern, [(route_pattern, WWTFileHandler)])
