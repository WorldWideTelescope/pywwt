# Copyright 2021 the .NET Foundation
# Licensed under the three-clause BSD License

"""
An internal HTTP server for sending data to WWT when running outside of Jupyter.

You do not need to use this module unless you are a pywwt developer.
"""

import asyncio
from hashlib import md5
import logging
import mimetypes
import os.path
import socket
from threading import Thread
import time

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
    from tornado.web import RequestHandler, Application, StaticFileHandler
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

        def serve_file(self, filename, extension=''):
            with open(filename, 'rb') as f:
                content = f.read()

            hash = md5(content).hexdigest() + extension
            self._files[hash] = os.path.abspath(filename)
            return 'http://' + self.host + ':' + str(self.port) + '/data/' + hash

        def static_url(self, rest):
            return 'http://' + self.host + ':' + str(self.port) + '/static/' + rest

        def get_file_contents(self, hash):
            with open(self._files[hash], 'rb') as f:
                return f.read()

    mimetypes.add_type('image/fits', '.fits')
    mimetypes.add_type('image/fits', '.fts')
    mimetypes.add_type('image/fits', '.fit')

    ds = DataServer()

    class DataHandler(RequestHandler):
        async def get(self, hash):
            # Do our best to set an appropriate Content-Type.
            filename = ds._files[hash]
            content_type = mimetypes.guess_type(filename)[0]
            if content_type is None:
                content_type = 'application/binary'
            self.set_header('Content-Type', content_type)

            # Add wide-open CORS headers to allow external WWT apps to access
            # data. This isn't needed in the default case, but comes in handy
            # when testing updates to the research app with an alternative
            # localhost port. Note that a hostile actor can just ignore these
            # settings, and our default stance is that data are globally
            # accessible, so this really shouldn't affect the level of security
            # we provide.
            self.set_header('Access-Control-Allow-Origin', '*')
            self.set_header('Access-Control-Allow-Methods', 'GET,HEAD')
            self.set_header('Access-Control-Allow-Headers', 'Content-Disposition,Content-Encoding,Content-Length,Content-Type')

            self.write(ds.get_file_contents(hash))

    app = WebServer([
        (PathMatches(r'/data/(?P<hash>\S+)'), DataHandler),
        (r'/static/(.*)', StaticFileHandler, {
            'path': os.path.join(os.path.dirname(__file__), 'web_static'),
            'default_filename': 'index.html',
        }),
    ])

    ds.start(app)

    _data_server = ds

    return ds
