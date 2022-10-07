"""
Routines for the pywwt notebook server extension.

Most users of pywwt can ignore this module.

In order to make files available to the WWT engine, we need to serve them over
HTTP. Most of this is now done using the ``wwt_kernel_data_relay`` server
extension, but we also provide a separate server extension that provides a
static copy of the WWT research app, for environments where security cookies
prevent an externally-hosted version of the app (i.e., wwtassets.org) from
accessing data served up by the kernel.
"""

import os
import mimetypes
from tornado import web

# `load_jupyter_server_extension` has to be made available in the root module,
# so let's try to fail gracefully if Jupyter modules are missing. `tornado` is a
# hard requirement appearing in setup.py.
try:
    from notebook.utils import url_path_join
    from notebook.base.handlers import IPythonHandler

    HAVE_NOTEBOOK = True
except ImportError:
    IPythonHandler = object
    HAVE_NOTEBOOK = False

__all__ = [
    "load_jupyter_server_extension",
]


STATIC_DIR = os.path.join(os.path.dirname(__file__), "web_static")


class WWTStaticFileHandler(IPythonHandler):
    def get(self, filename):
        static_path = os.path.join(STATIC_DIR, filename)

        if os.path.isdir(static_path):
            path = os.path.join(static_path, "index.html")
            filename = "index.html"  # for mime-type guess below
        else:
            path = static_path

        # Do our best to set an appropriate Content-Type.
        content_type = mimetypes.guess_type(filename)[0]
        if content_type is None:
            content_type = "application/binary"
        self.set_header("Content-Type", content_type)

        # Add wide-open CORS headers to allow external WWT apps to access data.
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Methods", "GET,HEAD")
        self.set_header(
            "Access-Control-Allow-Headers",
            "Content-Disposition,Content-Encoding,Content-Length,Content-Type",
        )

        try:
            with open(path, "rb") as f:
                content = f.read()
        except FileNotFoundError:
            raise web.HTTPError(404)

        self.finish(content)


if HAVE_NOTEBOOK:

    def load_jupyter_server_extension(nb_server_app):
        """
        A support function used to integrate pywwt with Jupyter.
        """
        web_app = nb_server_app.web_app
        host_pattern = ".*$"

        mimetypes.add_type("image/fits", ".fits")
        mimetypes.add_type("image/fits", ".fts")
        mimetypes.add_type("image/fits", ".fit")

        route_pattern = url_path_join(web_app.settings["base_url"], "/wwtstatic/(.*)")
        web_app.add_handlers(host_pattern, [(route_pattern, WWTStaticFileHandler)])

else:

    def load_jupyter_server_extension(_nb_server_app):
        raise NotImplementedError()
