pywwt: WorldWide Telescope from Python
======================================

About
-----

`WorldWide Telescope <http://worldwidetelescope.org/home>`_ is a free and
powerful visualization engine developed by the `American Astronomical Society
<https://aas.org>`_ that can display astronomical and planetary data. The two
main versions of WorldWide Telescope are the cross-platform HTML/WebGL-based
“web client”, and a Windows desktop application. Both versions can access a
large (multi-terabyte) collection of astronomical survey data stored in the
cloud. WorldWide Telescope is designed to be useful to a wide audience,
including researchers, educators, and the general public.

The pywwt package allows you to embed the WorldWide Telescope interface in a
`Jupyter <https://jupyter.org>`_ notebook, control it, and display arbitrary
astronomical and planetary data sets in it. It also provides:

* A standalone Qt viewer/widget
* A client for the Windows version of the WorldWide Telescope application

.. figure:: images/data_layers_kepler.png
   :align: center
   :alt: A WWT screenshot showing exoplanets in the Kepler field overlaid on a background sky map.

   A map of exoplanets in the Kepler field rendered over background imagery by pywwt.

This package is still under development and functionality is still being added.
Please do let us know if you try it out and run into any issues (see `Getting
help`_).

Quick start
-----------

The quickest way to see what the pywwt can do is to run some of our example
Jupyter notebooks in the cloud: open them up `at mybinder.org
<https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?filepath=basic.ipynb>`_.

User guide
----------

.. toctree::
   :maxdepth: 1

   installation
   jupyter
   qt
   settings
   views
   annotations
   layers
   fov
   shortcuts
   tours
   windows
   api

Getting help
------------

If you run into any issues when using pywwt, please open an issue
`on its GitHub repository <https://github.com/WorldWideTelescope/pywwt/issues>`_.

Acknowledgments
---------------

Work on pywwt is funded through the `American Astronomical Society`_ WorldWide
Telescope project.
