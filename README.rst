.. To preview locally, install Sphinx and run: rst2html.py README.rst README.html

.. image:: https://travis-ci.org/WorldWideTelescope/pywwt.svg?branch=tests
    :target: https://travis-ci.org/WorldWideTelescope/pywwt

.. image:: https://ci.appveyor.com/api/projects/status/yweuddwyxy97d8go/branch/master?svg=true
    :target: https://ci.appveyor.com/project/astrofrog/pywwt/branch/master

.. image:: https://readthedocs.org/projects/pywwt/badge/?version=latest
   :target: http://pywwt.readthedocs.io/en/latest/?badge=latest
   :alt: Documentation Status

pywwt: The AAS WorldWide Telescope from Python/Jupyter
======================================================

About
-----

The pywwt_ package is the official toolkit for accessing the AAS_ `WorldWide
Telescope`_ (WWT) from Python. WWT is a free, open-source tool for visually
exploring humanity’s scientific understanding of the Universe. It includes a
sophisticated 4D WebGL rendering engine and a cloud-based web service for
sharing and visualizing terabytes of astronomical data.

.. figure:: docs/images/data_layers_kepler.png
   :align: center
   :alt: A WWT screenshot showing exoplanets in the Kepler field overlaid on a background sky map.

   *Known exoplanets in the Kepler field rendered over background imagery by pywwt.*

With pywwt_ you can:

.. _pywwt: https://pywwt.readthedocs.io/
.. _AAS: https://aas.org/
.. _WorldWide Telescope: http://www.worldwidetelescope.org/home

* Visualize and explore astronomical data interactively in the `Jupyter and
  JupyterLab`_ environments through an HTML widget
* Do the same in standalone applications with a Qt_ widget
* Load data from common astronomical data formats (e.g. `AstroPy tables`_)
  into WWT
* Control a running instance of the WWT Windows application

.. _Jupyter and JupyterLab: https://jupyter.org/
.. _Qt: https://www.qt.io/
.. _AstroPy tables: https://docs.astropy.org/en/stable/table/

The full documentation, including installation instructions, can be found at
http://pywwt.readthedocs.io/.


Reporting issues
----------------

If you run into any issues, please open an issue `here
<https://github.com/WorldWideTelescope/pywwt/issues>`_.


Acknowledgments
---------------

Work on pywwt and the WorldWide Telescope is supported by the `American
Astronomical Society`_ (AAS). Some work on pywwt has been supported by NSF
grant 1642446_.

.. _American Astronomical Society: https://aas.org/
.. _1642446: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1642446
