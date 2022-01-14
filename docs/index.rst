pywwt Reference Documentation
=============================

pywwt is the official toolkit for accessing AAS_ `WorldWide Telescope`_ (WWT)
from Python. WWT is a tool for showcasing astronomical data and knowledge
brought to you by the non-profit `American Astronomical Society`_ (AAS), the
major organization of professional astronomers in North America. To learn more
about WWT, visit `the WWT homepage`_ or `the WWT documentation hub`_.

Here's a **live, interactive** copy of the WWT research app that lets you
explore `a 25-gigabyte mosaic of the Andromeda galaxy
<https://archive.stsci.edu/prepds/phat/>`__ atop the `Pan-STARRS 3pi dataset
<https://panstarrs.stsci.edu/>`__ with sources from the `Gaia DR2 catalog
<https://www.cosmos.esa.int/web/gaia/data-release-2>`__ overlaid:

.. _AAS: https://aas.org/
.. _American Astronomical Society: https://aas.org/
.. _WorldWide Telescope: https://worldwidetelescope.org/home
.. _the WWT homepage: https://worldwidetelescope.org/home
.. _the WWT documentation hub: https://docs.worldwidetelescope.org/

.. raw:: html

    <iframe src="https://web.wwtassets.org/research/latest/?script=eyJldmVudCI6ImNlbnRlcl9vbl9jb29yZGluYXRlcyIsInJhIjoxMS4yODM0MzQ5NTIzMTIwNTMsImRlYyI6NDEuNzQ1NzMyODUzMzU1MTgsImZvdiI6MC44NzM2NzcxMDAwMzQ4ODY5LCJyb2xsIjotNjYuMDYyMDMzNzc4NTgzODcsImluc3RhbnQiOnRydWV9%2CeyJldmVudCI6InNldF9iYWNrZ3JvdW5kX2J5X25hbWUiLCJuYW1lIjoiUGFuU1RBUlJTMSAzcGkifQ%3D%3D%2CeyJldmVudCI6ImxheWVyX2hpcHNjYXRfbG9hZCIsInRocmVhZElkIjoiNGI0NjAxNzEtZWQ3MC00Nzk3LWJhOGMtZmFiNjdkYTllMmFiIiwidGFibGVJZCI6IkdhaWEgRFIyIChHYWlhIENvbGxhYm9yYXRpb24sIDIwMTgpIChnYWlhMikiLCJuYW1lIjoiR2FpYSBEUjIgKEdhaWEgQ29sbGFib3JhdGlvbiwgMjAxOCkgKGdhaWEyKSJ9%2CeyJldmVudCI6InRhYmxlX2xheWVyX3NldF9tdWx0aSIsImlkIjoiR2FpYSBEUjIgKEdhaWEgQ29sbGFib3JhdGlvbiwgMjAxOCkgKGdhaWEyKSIsInNldHRpbmdzIjpbImFzdHJvbm9taWNhbCIsImNvbG9yIiwiZW5hYmxlZCIsImZhZGVTcGFuIiwibmFtZSIsIm9wYWNpdHkiLCJvcGVuZWQiLCJyZWZlcmVuY2VGcmFtZSIsInZlcnNpb24iLCJhbHRDb2x1bW4iLCJhbHRUeXBlIiwiYWx0VW5pdCIsImJhckNoYXJ0Qml0bWFzayIsImJlZ2luUmFuZ2UiLCJjYXJ0ZXNpYW5DdXN0b21TY2FsZSIsImNhcnRlc2lhblNjYWxlIiwiY29sb3JNYXBDb2x1bW4iLCJjb2xvck1hcHBlck5hbWUiLCJjb29yZGluYXRlc1R5cGUiLCJkZWNheSIsImR5bmFtaWNDb2xvciIsImR5bmFtaWNEYXRhIiwiZW5kRGF0ZUNvbHVtbiIsImVuZFJhbmdlIiwiZ2VvbWV0cnlDb2x1bW4iLCJoeXBlcmxpbmtDb2x1bW4iLCJoeXBlcmxpbmtGb3JtYXQiLCJsYXRDb2x1bW4iLCJsbmdDb2x1bW4iLCJtYXJrZXJDb2x1bW4iLCJtYXJrZXJJbmRleCIsIm1hcmtlclNjYWxlIiwibmFtZUNvbHVtbiIsIm5vcm1hbGl6ZUNvbG9yTWFwIiwibm9ybWFsaXplQ29sb3JNYXBNYXgiLCJub3JtYWxpemVDb2xvck1hcE1pbiIsIm5vcm1hbGl6ZVNpemUiLCJub3JtYWxpemVTaXplQ2xpcCIsIm5vcm1hbGl6ZVNpemVNYXgiLCJub3JtYWxpemVTaXplTWluIiwicGxvdFR5cGUiLCJwb2ludFNjYWxlVHlwZSIsInJhVW5pdHMiLCJzY2FsZUZhY3RvciIsInNob3dGYXJTaWRlIiwic2l6ZUNvbHVtbiIsInN0YXJ0RGF0ZUNvbHVtbiIsInRpbWVTZXJpZXMiLCJ4QXhpc0NvbHVtbiIsInhBeGlzUmV2ZXJzZSIsInlBeGlzQ29sdW1uIiwieUF4aXNSZXZlcnNlIiwiekF4aXNDb2x1bW4iLCJ6QXhpc1JldmVyc2UiXSwidmFsdWVzIjpbdHJ1ZSwiIzc1RkYzRiIsdHJ1ZSwwLCJHYWlhIERSMiAoR2FpYSBDb2xsYWJvcmF0aW9uLCAyMDE4KSAoZ2FpYTIpIiwxLGZhbHNlLCJTa3kiLDIsLTEsInNlYUxldmVsIiwibWV0ZXJzIiwwLCIyMTAwLTAxLTAxVDA1OjAwOjAwLjAwMFoiLDEsIm1ldGVycyIsLTEsIkdyZXlzIiwic3BoZXJpY2FsIiwxNixmYWxzZSxmYWxzZSwtMSwiMTgwMC0wMS0wMVQwNDo1NjowMi4wMDBaIiwtMSwtMSwiIiwxLDAsLTEsMCwid29ybGQiLDAsZmFsc2UsMSwwLGZhbHNlLGZhbHNlLDEsMCwiY2lyY2xlIiw0LCJkZWdyZWVzIiwxLGZhbHNlLDE5LC0xLGZhbHNlLC0xLGZhbHNlLC0xLGZhbHNlLC0xLGZhbHNlXX0%3D%2CeyJldmVudCI6ImxvYWRfaW1hZ2VfY29sbGVjdGlvbiIsInVybCI6Imh0dHA6Ly9kYXRhMS53d3Rhc3NldHMub3JnL3BhY2thZ2VzLzIwMjEvMDlfcGhhdF9maXRzL2luZGV4Lnd0bWwiLCJsb2FkQ2hpbGRGb2xkZXJzIjp0cnVlfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX2NyZWF0ZSIsImlkIjoiUEhBVC1mNDc1dyIsInVybCI6Imh0dHA6Ly9kYXRhMS53d3Rhc3NldHMub3JnL3BhY2thZ2VzLzIwMjEvMDlfcGhhdF9maXRzL2Y0NzV3L3sxfS97M30vezN9X3syfS5maXRzIiwibW9kZSI6InByZWxvYWRlZCIsImdvdG8iOmZhbHNlfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX3NldF9tdWx0aSIsImlkIjoiUEhBVC1mNDc1dyIsInNldHRpbmdzIjpbImFzdHJvbm9taWNhbCIsImNvbG9yIiwiZW5hYmxlZCIsImZhZGVTcGFuIiwibmFtZSIsIm9wYWNpdHkiLCJvcGVuZWQiLCJyZWZlcmVuY2VGcmFtZSIsInZlcnNpb24iLCJjb2xvck1hcHBlck5hbWUiLCJvdmVycmlkZURlZmF1bHRMYXllciJdLCJ2YWx1ZXMiOlt0cnVlLHsiYSI6MjU1LCJiIjoyNTUsImciOjI1NSwiciI6MjU1LCJuYW1lIjoiIn0sdHJ1ZSwwLCJQSEFULWY0NzV3IiwxLGZhbHNlLCJTa3kiLDIsInBsYXNtYSIsZmFsc2VdfQ%3D%3D%2CeyJldmVudCI6ImltYWdlX2xheWVyX3N0cmV0Y2giLCJpZCI6IlBIQVQtZjQ3NXciLCJ2ZXJzaW9uIjoxLCJzdHJldGNoIjoxLCJ2bWluIjowLjAzOTA2MjA3OTA0MjE5NjI3LCJ2bWF4IjozLjc0OTQ0Njk0OTkwODUxOTJ9" height="400px" width="100%"></iframe>

pywwt enables you to include this app in `Jupyter notebooks`_ and control it
programmatically from Python, overlaying your own imagery and catalogs. pywwt
also lets you build desktop Qt_ applications using the same interfaces, control
running instances of the WWT Windows application, and more!

.. _Jupyter notebooks: https://jupyter.org/
.. _Qt: https://www.qt.io/


Quick start
-----------

The quickest way to see what the pywwt can do is to try it out live, which you
can do straight in your browser with our cloud-based Jupyter notebooks. Here
are some examples:

* `Visualize Tabular Data from the NASA Exoplanet Archive
  <https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/NASA%20Exoplanet%20Archive.ipynb>`__
* `Visualize Imagery of W5 and SN2011fe
  <https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Visualizing%20Imagery.ipynb>`__

To browse the complete collection of live example notebooks, go to `the index
page
<https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Start%20Here.ipynb>`__.

*Note: it is usually fast to launch these notebooks, but if the code has been
recently updated, you may have to wait a few minutes for the backing software
images to be rebuilt.*

To browse the Python commands that can be used to control WWT once you've opened
it up, see the documentation of the :class:`~pywwt.core.BaseWWTWidget` class.


Table of Contents
-----------------

.. toctree::
   :maxdepth: 2

   installation
   opening
   controlling


API Reference
-------------

.. toctree::
   :maxdepth: 1

   api/pywwt
   api/pywwt.annotation_
   api/pywwt.app
   api/pywwt.core
   api/pywwt.data_server
   api/pywwt.imagery
   api/pywwt.instruments
   api/pywwt.jupyter
   api/pywwt.jupyter_relay
   api/pywwt.jupyter_server
   api/pywwt.layers
   api/pywwt.logger
   api/pywwt.qt
   api/pywwt.solar_system
   api/pywwt.traits
   api/pywwt.utils
   api/pywwt.windows
   api/pywwt.windows.client
   api/pywwt.windows.layer
   api/pywwt.windows.misc
   api/pywwt.windows.mods
   api/pywwt.windows.utils


Getting help
------------

If you run into any issues when using pywwt, please open an issue `in the
pywwt repository <https://github.com/WorldWideTelescope/pywwt/issues>`_ on
GitHub. We also encourage you to consider asking a question on `the WWT
discussion forum`_ site.

.. _the WWT discussion forum: https://wwt-forum.org/


Acknowledgments
---------------

pywwt is part of the AAS WorldWide Telescope system, a `.NET Foundation`_
project managed by the non-profit `American Astronomical Society`_ (AAS). Work
on WWT has been supported by the AAS, the US `National Science Foundation`_, and
other partners. See `the WWT user website`_ for details.

.. _.NET Foundation: https://dotnetfoundation.org/
.. _National Science Foundation: https://www.nsf.gov/
.. _the WWT user website: https://worldwidetelescope.org/about/acknowledgments/
