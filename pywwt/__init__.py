from ._version import version_info, __version__  # noqa
from .core import *  # noqa
from .annotation import *  # noqa
from .jupyter_server import load_jupyter_server_extension  # noqa


def _jupyter_nbextension_paths():
    return [{'section': 'notebook',
             'src': 'nbextension/static',
             'dest': 'pywwt',
             'require': 'pywwt/extension'}]


def _jupyter_server_extension_paths():
    return [{"module": "pywwt"}]
