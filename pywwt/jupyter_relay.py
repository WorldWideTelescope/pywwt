# Copyright 2021 the .NET Foundation
# Licensed under the three-clause BSD License

"""
pywwt client support for the WWT Jupyter Kernel Data Relay.

Say that you're running pywwt inside JupyterLab, and you want to use it to view
a large FITS file. That file needs to be broken into tiles in order for it to be
viewable: it's both unpleasant and impractical to require the your web browser
to download a gigabyte of data in order to render it with WebGL. That's why we
have tools like ``toasty`` to automate our data processing.

But this exposes a data flow problem. The WWT viewer is running in your web
browser. It's talking to a Jupyter HTTP server, possibly across the internet,
which is in turn talking to a Python kernel which in turn may be running on yet
another machine, quite possibly one that's not accessible on the open internet.
In order to view your data, we need to make data files on the pywwt machine
"visible" on the open internet so that WWT, running in your web browser, can
retrieve them.

The only reliable way to do this is through the Jupyter server. Unfortunately we
know of no built-in way for kernels to plug data into the server. Therefore we
have created the ``wwt_kernel_data_relay`` Python package, a Jupyter server
extension that makes it possible for kernels to request to publish data through
the Jupyter server. This publication is done using extensions to the ZMQ-based
messaging framework that Jupyter servers use to control Jupyter kernels.

This module implements the kernel side of the Kernel Data Relay (KDR) protocol
for pywwt. The ultimate interface is that other code can request that individual
files or directory trees be made available for service. This module returns a
partial URL that can then be forwarded to the Jupyter frontend (the JS layer,
not the server) or the user (e.g. by printing it out).
"""

import contextlib
from hashlib import md5
import mimetypes
import os.path
from urllib.parse import quote as urlquote

from ipykernel.kernelbase import Kernel

__all__ = [
    "get_relay_hub",
    "JupyterRelayHub",
]

FIXED_HTTP_RESPONSE_HEADERS = [
    ("Access-Control-Allow-Origin", "*"),
    ("Access-Control-Allow-Methods", "GET,HEAD"),
    (
        "Access-Control-Allow-Headers",
        "Content-Disposition,Content-Encoding,Content-Length,Content-Type",
    ),
]

STATIC_DIR = os.path.join(os.path.dirname(__file__), "web_static")


class HTTPExposedError(Exception):
    """
    Quick exception class for service errors that should be exposed to the user
    as specific HTTP error codes.
    """

    def __init__(self, http_status, message):
        self.http_status = http_status
        self.message = str(message)


def default_path_key(path):
    """
    Generate a default KDR key for filesystem path data.

    This is trickier than you might think. We want keys to be stable: if you
    restart your kernel and rerun your code, the KDR key should be the same, so
    that the WWT frontend can still retrieve data from the same URLs. But keys
    have to be uniquified somehow: if you're running pywwt in two different
    notebooks, with two different kernels, they need to be using different keys
    as much as we can manage.

    Our solution for path-based data is to just hash the path. It will be
    stable, and the only way that we should get two kernels claiming the same
    key is if they're trying to serve the same data.
    """

    return md5(path.encode("utf-8")).hexdigest()


class JupyterRelayHub(object):
    """
    pywwt's WWT Kernel Data Relay client.

    This is a singleton, per-process object, because Jupyter kernel-server
    connections are per-process.
    """

    def __init__(self, kernel=None, key_prefix="pywwt_"):
        if kernel is None:
            kernel = Kernel.instance()

        self._kernel = kernel
        self._key_prefix = key_prefix
        self._key_to_resource = {}
        self._base_url = get_notebook_server_base_url()
        self._static_files_url = None
        self._ident_to_next_seqnum = {}

        kernel.shell_handlers["wwtkdr_resource_request"] = self._handle_resource_request

    def get_static_files_url(self):
        """
        Get a partial URL where static files bundled with pywwt can be obtained.

        Returns
        -------
        url : :class:`str`
            A partial URL.

        Notes
        -----
        The returned URL will not be an absolute URL. It will end with a
        trailing slash. In order to be turned into a retrievable URL, it must be
        combined with the public-facing URL of the running Jupyter server in the
        JavaScript frontend -- the kernel does not have that information.

        The static files are stored in the ``pywwt/web_static`` subdirectory of
        the distributed pywwt package.

        Unlike user data, the static files are served with a predictable KDR key
        based on the version of pywwt, since identical versions should be
        serving identical data.
        """

        if self._static_files_url is None:
            from . import version_info

            vcode = ".".join(str(x) for x in version_info)
            self._static_files_url = self.serve_tree(STATIC_DIR, key="static" + vcode)

        return self._static_files_url

    def _claim_key(self, prefixed_key, resource):
        """
        Claim a "key" used by the Kernel Data Relay to map URLs onto running
        kernels. One kernel (i.e., our process) can claim numerous keys.

        Returns the partial URL associated with the key, ending in a trailing
        slash.
        """
        self._key_to_resource[prefixed_key] = resource

        self._kernel.session.send(
            self._kernel.iopub_socket,
            "wwtkdr_claim_key",
            {"key": prefixed_key},
            parent=self._kernel.get_parent("shell"),
            ident=self._kernel._topic("wwtkdr_claim_key"),
        )

        return "{}wwtkdr/{}/".format(self._base_url, urlquote(prefixed_key, safe=""))

    def serve_tree(self, path, key=None):
        """
        Request that a directory tree of files be published.

        Parameters
        ----------
        path : :class:`str`
            A local filesystem path, pointing at a directory
        key : :class:`str` or ``None`` (the default)
            An optional "key" to uniquify the resulting service URL

        Returns
        -------
        url : :class:`str`
            A partial URL, ending in a trailing slash, below which the file data
            will be made accessible.

        Notes
        -----
        The returned URL will not be an absolute URL. It will end with a
        trailing slash. In order to be turned into a retrievable URL, it must be
        combined with the public-facing URL of the running Jupyter server in the
        JavaScript frontend -- the kernel does not have that information.

        If *key* is unspecified, a stable-but-opaque KDR key is used. Currently
        it's a cryptographic hash of the input path.
        """

        if key is None:
            key = default_path_key(path)

        prefixed_key = self._key_prefix + key
        return self._claim_key(prefixed_key, FileTreeResource(path, public=True))

    def serve_file(self, path, extension="", key=None):
        """
        Request that a single specific file be published.

        Parameters
        ----------
        path : :class:`str`
            A local filesystem path, pointing at a non-directory
        extension : :class:`str`, defaults to ``""``
            A file extension to append to the exposed URL
        key : :class:`str` or ``None`` (the default)
            An optional "key" to uniquify the resulting service URL

        Returns
        -------
        url : :class:`str`
            A partial URL where the file will be published
        """
        """
        Notes
        -----
        The returned URL will not be an absolute URL. It will have a structure
        resembling: ``{stuff...}/{key}/{basename(path)}{extension}``. In order
        to be turned into a retrievable URL, it must be combined with the
        public-facing URL of the running Jupyter server in the JavaScript
        frontend -- the kernel does not have that information.

        The *extension* argument is used when the actual filesystem path of the
        data has a filename extension that is missing or misleading for the
        actual data.

        If *key* is unspecified, a stable-but-opaque KDR key is used. Currently
        it's a cryptographic hash of the input path.
        """

        if key is None:
            key = default_path_key(path)

        basename = os.path.basename(path) + extension
        sfr = SingleFileResource(path, basename, public=True)

        prefixed_key = self._key_prefix + key
        url = self._claim_key(prefixed_key, sfr)
        return url + urlquote(basename)

    def _handle_resource_request(self, stream, ident, message):
        """
        This callback is invoked when a ``wwtkdr_resource_request`` message
        arrives on the kernel's "shell" ZMQ stream. It wraps the real
        implementation in some high-level exception handling.
        """

        try:
            self._handle_resource_request_inner(stream, ident, message)
        except HTTPExposedError as e:
            # Some browsers can't "see" cross-origin 404 errors unless the CORS
            # headers are present, so add them here. Note that this can
            # therefore leak some info about the kernel.
            content = {
                "status": "ok",  # this is the correct semantics
                "more": False,
                "http_status": e.http_status,
                "http_headers": [
                    ("Content-Type", "text/plain; charset=utf-8"),
                ]
                + FIXED_HTTP_RESPONSE_HEADERS,
            }

            buffers = [
                memoryview(e.message.encode("utf-8")),
            ]

            self._send_resource_reply(stream, content, message, ident, buffers)
        except Exception as e:
            content = {
                "status": "error",
                "evalue": str(e),
            }

            self._send_resource_reply(stream, content, message, ident, None)
        finally:
            try:
                key = b"".join(ident)
                del self._ident_to_next_seqnum[key]
            except KeyError:
                pass

    def _handle_resource_request_inner(self, stream, ident, message):
        """
        Handling of KDR resource-request messages.

        This is basically equivalent to an HTTP GET request that we have to
        dispatch.
        """

        content = message["content"]

        method = content.get("method", "unspecified")
        if method != "GET":
            raise HTTPExposedError(400, f"unexpected request method {method}")

        key = content.get("key")
        if key is None:
            raise HTTPExposedError(500, "no key in request")

        resource = self._key_to_resource.get(str(key))
        if resource is None:
            raise HTTPExposedError(404, "no such resource registered with kernel")

        # Note that on the server side, Tornado does some normalizations on the
        # input URL before it reaches the KDR handler; for instance,
        # `foo/../bar` is turned into `bar`. But other potentially-sketchy
        # constructs aren't normalized, and the KDR itself applies no
        # validation, so we should still treat `entry` cautiously.
        entry = content.get("entry")
        if entry is None:
            raise HTTPExposedError(500, "no entry in request")

        # The URL experiences the same normalizations that apply to `entry`.
        url = content.get("url")
        if url is None:
            raise HTTPExposedError(500, "no url in request")

        authenticated = content.get("authenticated", False)

        # OK, we've got everything we need from the request. Delegate to the
        # resource.
        handle, headers = resource.entry_to_handle(authenticated, str(entry), str(url))

        with contextlib.closing(handle) as handle:
            first = True
            keep_going = True

            while keep_going:
                # There is some kind of message limit (max 2000 at the same time) on the receiving end.
                # So we want so send as few messages as possible to never reach that limit.
                # Even if the messages are sent correctly, only the first 2000 are received by KDR.
                # We cannot just make sure that every single request consists of less than 2000 messages,
                # since other requests seem to be fighting for the same 2000 spots.
                # So I felt like it is safest to up the chunk size to something very, very high.
                # At least until the root issue is found and resolved.
                chunk = handle.read(8388608)  # 8MB

                if len(chunk):
                    buffers = [chunk]
                else:
                    keep_going = False
                    buffers = []

                content = {
                    "status": "ok",
                    "more": keep_going,
                }

                if first:
                    content["http_status"] = 200
                    content["http_headers"] = headers
                    first = False

                self._send_resource_reply(stream, content, message, ident, buffers)

    def _send_resource_reply(self, stream, content, parent, ident, buffers):
        """
        Send a resource reply message. We centralize this in order to make sure
        that we always send an appropriate sequence number for each message, in
        the face of exceptions that can crop up at surprising times.
        """
        key = b"".join(ident)
        seqnum = self._ident_to_next_seqnum.get(key, 0)
        content["seq"] = seqnum
        self._ident_to_next_seqnum[key] = seqnum + 1

        self._kernel.session.send(
            stream,
            "wwtkdr_resource_reply",
            content=content,
            parent=parent,
            ident=ident,
            buffers=buffers,
        )


def _open_file_resource(path, path_for_mime=None):
    """
    Core implementation of serving up filesystem files.

    The main wrinkles here are mapping ENOENT into 404 errors, and
    determining a Content-Type header.
    """

    # TODO: don't give full CORS headers if resource is not public

    try:
        handle = open(path, "rb")
    except FileNotFoundError:
        raise HTTPExposedError(404, "file not found")

    # Note that the "encoding" here is something like "gzip", not "UTF-8" --
    # it's about the file stream, not text.
    if path_for_mime is None:
        path_for_mime = path

    content_type, _content_encoding = mimetypes.guess_type(path_for_mime)
    if content_type is None:
        content_type = "application/octet-stream"

    headers = FIXED_HTTP_RESPONSE_HEADERS + [
        ("Content-Type", content_type),
    ]
    return handle, headers


def _generate_absolute_wtml(rel_wtml_path, url):
    """
    Generate WTML with absolute URLs on the fly.

    This is about the only piece of this module that's WWT-specific. The same as
    ``wwtdatatool serve``, when making tiled data available through a WTML file,
    we need to fill in the WTML with absolute URLs on the fly, since the tiling
    code can't (reasonably) know what final URL the data will be served at.
    """

    from io import BytesIO
    from wwt_data_formats.folder import Folder, make_absolutizing_url_mutator

    f = Folder.from_file(rel_wtml_path)
    f.mutate_urls(make_absolutizing_url_mutator(url))
    resp = f.to_xml_string().encode("utf-8")
    handle = BytesIO(resp)

    headers = FIXED_HTTP_RESPONSE_HEADERS + [
        ("Content-Type", "application/x-wtml"),
    ]
    return handle, headers


class FileTreeResource(object):
    """
    Internal helper class for serving up a directory tree of files, such as you
    might get after tiling a large image.
    """

    def __init__(self, root, public=False):
        self._root = root
        self._public = public
        assert public, "non-public resources not implemented"

    def entry_to_handle(self, authenticated, entry, url):
        # Lame-brained indexing support:
        if entry.endswith("/"):
            entry += "index.html"

        items = entry.split("/")

        if any(e == ".." or e.startswith("/") or not e for e in items):
            raise HTTPExposedError(400, "illegal kernel data tree path component")

        # Special handling for `index_rel.wtml` files that make tiled data
        # available to the WWT frontend. We need to source `index.wtml` on the
        # fly in order to fill the file with absolute URL data, which the WWT
        # engine requires.
        if entry.endswith(".wtml"):
            rel_path = os.path.join(self._root, *items)[:-5] + "_rel.wtml"
            if os.path.exists(rel_path):
                return _generate_absolute_wtml(rel_path, url)

        return _open_file_resource(os.path.join(self._root, *items))


class SingleFileResource(object):
    """
    Internal helper class for serving up a single specific file.
    """

    def __init__(self, path, url_basename, public=False):
        self._path = path
        self._url_basename = url_basename
        self._public = public
        assert public, "non-public resources not implemented"

    def entry_to_handle(self, authenticated, entry, _url):
        # TODO: handle non-public resources!!!

        if entry != self._url_basename:
            raise HTTPExposedError(404, "file not found")

        # Use the URL basename here in case the `extension` argument was used
        # (e.g. the extension of the actual filesystem path is missing or
        # misleading).
        return _open_file_resource(self._path, path_for_mime=self._url_basename)


_global_relay_hub = None


def get_relay_hub(kernel=None):
    """
    Get the global singleton Kernel Data Relay (KDR) client.

    Returns
    -------
    hub : :class:`JupyterRelayHub`
    """

    global _global_relay_hub

    if _global_relay_hub is None:
        # This is a bit out-of-place, but whatever
        mimetypes.add_type("image/fits", ".fits")
        mimetypes.add_type("image/fits", ".fts")
        mimetypes.add_type("image/fits", ".fit")
        mimetypes.add_type("application/x-wtml", ".wtml")

        _global_relay_hub = JupyterRelayHub(kernel=kernel)

    return _global_relay_hub


# January 2021: Derived from notebook.notebookapp.list_running_servers, with a
# fix for JupyterLab 3.x (or something recent??), where the JSON files start
# with `jpserver` not `nbserver`. This function is part of the infrastructure
# needed to get the notebook server base url.
def _list_running_servers_jl3():
    import io
    import json
    from notebook.utils import check_pid
    from jupyter_core.paths import jupyter_runtime_dir
    import os.path
    import re

    runtime_dir = jupyter_runtime_dir()

    if not os.path.isdir(runtime_dir):
        return

    for file_name in os.listdir(runtime_dir):
        # here is the fix:
        if re.match("nbserver-(.+).json", file_name) or re.match(
            "jpserver-(.+).json", file_name
        ):
            with io.open(os.path.join(runtime_dir, file_name), encoding="utf-8") as f:
                info = json.load(f)

            if ("pid" in info) and check_pid(info["pid"]):
                yield info
            else:
                try:
                    os.unlink(os.path.join(runtime_dir, file_name))
                except OSError:
                    pass


def _compute_notebook_server_base_url():
    """
    Figure out the base_url of the current Jupyter notebook server.

    Copied from
    https://github.com/jupyter/notebook/issues/3156#issuecomment-401119433
    with miniscule changes. This is gross, but appears to be the best
    available option right now.

    """
    import ipykernel
    import json
    import re
    import requests

    # First, find our ID.
    kernel_id = re.search(
        "kernel-(.*).json", ipykernel.connect.get_connection_file()
    ).group(1)

    # Now, check all of the running servers known on this machine. We have to
    # talk to each server to figure out if it's ours or somebody else's.
    running_server_info = list(_list_running_servers_jl3())

    for s in running_server_info:
        # We need an API token that in most cases is provided in the runtime
        # JSON files. In (recent versions of?) the JupyterHub single-user
        # server, it seems that the token is instead obtained from an
        # environment variable. Cf.
        # https://github.com/jupyterhub/jupyterhub/blob/master/jupyterhub/singleuser/mixins.py
        token = s.get("token", "")
        if not token:
            token = os.environ.get("JUPYTERHUB_API_TOKEN", "")
        if not token:
            token = os.environ.get("JPY_API_TOKEN", "")  # deprecated as of 0.7.2

        # Request/response paranoia due to "fun" figuring out how to fix the
        # JupyterHub single-user problem - the API call would fail due to auth
        # issues and break pywwt, even though there was only one running server
        # so we actually didn't even need the API call. In case something breaks
        # in the future, add a fallback mode.
        try:
            response = requests.get(
                requests.compat.urljoin(s["url"], "api/sessions"),
                params={"token": token},
            )

            for n in json.loads(response.text):
                if n["kernel"]["id"] == kernel_id:
                    return s["base_url"]  # Found it!
        except Exception:
            pass

    # If we got here, we might have auth issues with the api/sessions request.
    # If there's only one server, just give it a try.
    if len(running_server_info) == 1:
        return running_server_info[0]["base_url"]

    raise Exception(
        "cannot locate our notebook server; is this code running in a Jupyter kernel?"
    )


_server_base_url = None


def get_notebook_server_base_url():
    """
    Get the "base_url" of the current Jupyter notebook server.

    """
    global _server_base_url

    if _server_base_url is None:
        _server_base_url = _compute_notebook_server_base_url()
        if not _server_base_url.endswith("/"):
            _server_base_url = _server_base_url + "/"

    return _server_base_url
