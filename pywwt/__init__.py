from ._version import version_info, __version__  # noqa
from .core import *  # noqa
from .annotation import *  # noqa


def _jupyter_nbextension_paths():
    return [{'section': 'notebook',
             'src': 'static',
             'dest': 'pywwt',
             'require': 'pywwt/extension'}]
