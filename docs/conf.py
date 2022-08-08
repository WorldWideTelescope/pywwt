#!/usr/bin/env python3
# -*- coding: utf-8 -*-

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.doctest",
    "sphinx.ext.intersphinx",
    "sphinx.ext.mathjax",
    "sphinx.ext.viewcode",
    "sphinx_automodapi.automodapi",
    "sphinx_automodapi.smart_resolver",
    "numpydoc",
]

templates_path = ["_templates"]

source_suffix = ".rst"

master_doc = "index"

project = "pywwt"
author = "AAS WorldWide Telescope team, John ZuHone"
copyright = "2017-2021, " + author

# The short X.Y version.
from pywwt import __version__ as version

# The full version, including alpha/beta/rc tags.
release = version

language = "en"

exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

pygments_style = "sphinx"

todo_include_todos = False

html_theme = "bootstrap-astropy"
html_theme_options = {
    "logotext1": "pywwt",
    "logotext2": "",
    "logotext3": ":docs",
    "astropy_project_menubar": False,
}
html_static_path = ["_static"]
html_sidebars = {"**": ["localtoc.html", "searchbox.html"]}

htmlhelp_basename = "pywwtdoc"

intersphinx_mapping = {
    "astropy": ("https://docs.astropy.org/en/stable/", None),
    "matplotlib": (
        "https://matplotlib.org/",
        (None, "https://matplotlib.org/objects.inv"),
    ),
    "numpy": (
        "https://docs.scipy.org/doc/numpy/",
        (None, "https://numpy.org/doc/stable/objects.inv"),
    ),
    "python": (
        "https://docs.python.org/3/",
        (None, "http://data.astropy.org/intersphinx/python3.inv"),
    ),
    "scipy": (
        "https://docs.scipy.org/doc/scipy/reference/",
        (None, "http://data.astropy.org/intersphinx/scipy.inv"),
    ),
    "toasty": (
        "https://toasty.readthedocs.io/en/latest/",
        (None, "https://toasty.readthedocs.io/en/latest/objects.inv"),
    ),
    "traitlets": (
        "https://traitlets.readthedocs.io/en/latest/",
        (None, "https://traitlets.readthedocs.io/en/latest/objects.inv"),
    ),
}

numpydoc_show_class_members = False

nitpicky = True
nitpick_ignore = [("py:class", "ipywidgets.widgets.domwidget.DOMWidget")]

default_role = "obj"

html_logo = "images/logo.png"

linkcheck_retries = 5
linkcheck_timeout = 10
linkcheck_ignore = ["https://en.wikipedia.org/wiki/Aircraft_principal_axes"]
