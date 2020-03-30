import os
import time
import asyncio
import socket
import logging
from hashlib import md5
from threading import Thread

__all__ = ['get_data_server']

_data_server = None


def get_data_server(verbose=True):
    """
    This starts up a tornado server and returns a handle to a DataServer
    object which can be used to register files to serve.
    """

    global _data_server

    if _data_server is not None:
        return _data_server

    from tornado.ioloop import IOLoop
    from tornado.web import RequestHandler, Application
    from tornado.routing import PathMatches

    class WebServer(Application):

        host = None
        port = None

        def run(self, host=None, port=8886):
            self.host = host
            self.port = port
            try:
                self.listen(port)
                IOLoop.instance().start()
            finally:
                self.host = None
                self.port = None

    class DataServer(object):

        def start(self, app):
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

            asyncio.set_event_loop(asyncio.new_event_loop())

            host = socket.gethostbyname('localhost')

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('localhost', 0))
            port = sock.getsockname()[1]
            sock.close()

            access_log = logging.getLogger("tornado.access")
            access_log.setLevel('ERROR')

            self._app.run(host=host, port=port)

        def serve_file(self, filename, real_name=True, extension=''):
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

    class DataHandler(RequestHandler):
        async def get(self, hash):
            self.write(ds.get_file_contents(hash))

    app = WebServer([(PathMatches(r"/data/(?P<hash>\S+)"), DataHandler)])

    ds.start(app)

    _data_server = ds

    return ds
