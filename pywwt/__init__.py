# Copyright 2021 the .NET Foundation
# Licensed under the three-clause BSD License

"""
The toplevel pywwt package contains only a few miscellaneous types.

Almost all usage of pywwt goes through a variable, conventionally named ``wwt``,
that refers to a subclass of the `BaseWWTWidget` class exported by this module.
The way that you obtain this variable depends on the context in which you're
running your Python code:

- In a JupyterLab environment (most recommended), use
  `pywwt.jupyter.connect_to_app`
- In a plain Jupyter notebook, create an instance of
  `pywwt.jupyter.WWTJupyterWidget`
- In a Qt desktop application, create an instance of `pywwt.qt.WWTQtClient`
- To control an instance of the WWT Windows application, use the unmaintained
  `pywwt.windows` module.

"""

# I don't love all of these imports, but they happened historically through
# asterisk imports so we need to keep them. And Sphinx complains if we don't
# put these types in __all__ up here.
from ._version import version_info, __version__  # noqa
from .core import BaseWWTWidget, DataPublishingNotAvailableError, ViewerNotAvailableError  # noqa
from .annotation import Annotation, Circle, FieldOfView, Line, Polygon  # noqa
from .jupyter_server import load_jupyter_server_extension  # noqa


__all__ = [
    "__version__",
    "Annotation",
    "BaseWWTWidget",
    "Circle",
    "DataPublishingNotAvailableError",
    "FieldOfView",
    "Line",
    "Polygon",
    "ViewerNotAvailableError",
    "load_jupyter_server_extension",
    "version_info",
]


def _jupyter_nbextension_paths():
    return [{'section': 'notebook',
             'src': 'nbextension/static',
             'dest': 'pywwt',
             'require': 'pywwt/extension'}]


def _jupyter_server_extension_paths():
    return [{"module": "pywwt"}]
