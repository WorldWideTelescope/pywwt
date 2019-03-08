import os
import time
import socket
import logging
from hashlib import md5
from threading import Thread

__all__ = ['get_data_server']

_data_server = None


def get_data_server(verbose=True):
    """
    This starts up a flask server and returns a handle to a DataServer
    object which can be used to register files to serve.
    """

    global _data_server

    if _data_server is not None:
        return _data_server

    from flask import Flask
    from flask_cors import CORS

    class FlaskWrapper(Flask):

        port = None
        host = None

        def run(self, *args, **kwargs):
            self.host = kwargs.get('host', None)
            self.port = kwargs.get('port', None)
            try:
                super(FlaskWrapper, self).run(*args, **kwargs)
            finally:
                self.host = None
                self.port = None

    app = FlaskWrapper('DataServer')
    CORS(app)
    if verbose:
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.ERROR)

    class DataServer(object):

        def __init__(self):
            self._files = {}
            self._thread = Thread(target=self.start_app)
            self._thread.daemon = True
            self._thread.start()
            self._app = app
            while self._app.host is None and self._app.port is None:
                time.sleep(0.1)

        @property
        def port(self):
            return self._app.port

        @property
        def host(self):
            return self._app.host

        def start_app(self):
            host = socket.gethostbyname('localhost')
            for port in range(8000, 9000):
                try:
                    return app.run(host=host, port=port)
                except Exception:
                    pass
            raise Exception("Could not start up data server")

        def serve_file(self, filename, real_name=False, extension=''):
            with open(filename, 'rb') as f:
                content = f.read()
            if real_name:
                hash = os.path.basename(filename)
            else:
                hash = md5(content).hexdigest() + extension
            self._files[hash] = os.path.abspath(filename)
            return 'http://' + self.host + ':' + str(self.port) + '/data/' + hash

        def get_file_contents(self, hash):
            with open(self._files[hash], 'rb') as f:
                return f.read()

    ds = DataServer()

    @app.route("/data/<hash>")
    def data(hash):
        return ds.get_file_contents(hash)

    _data_server = ds

    return ds
