pywwt Reference Documentation
=============================

pywwt is the official toolkit for accessing AAS_ `WorldWide Telescope`_ (WWT)
from Python. WWT is a tool for showcasing astronomical data and knowledge
brought to you by the non-profit `American Astronomical Society`_ (AAS), the
major organization of professional astronomers in North America. To learn
more about WWT, visit `the WWT homepage`_ or `the WWT documentation hub`_.

.. _AAS: https://aas.org/
.. _American Astronomical Society: https://aas.org/
.. _WorldWide Telescope: https://worldwidetelescope.org/home
.. _the WWT homepage: https://worldwidetelescope.org/home
.. _the WWT documentation hub: https://docs.worldwidetelescope.org/

Most pywwt users use it to visualize astronomical data in `Jupyter
notebooks`_ using the `WWT JupyterLab application`_. But you can also use pywwt
to build desktop Qt_ applications, control running instances of the WWT
Windows application, or whatever else you can dream up!

.. _Jupyter notebooks: https://jupyter.org/
.. _WWT JupyterLab application: https://docs.worldwidetelescope.org/research-app/latest/
.. _Qt: https://www.qt.io/

.. figure:: images/data_layers_kepler.png
   :align: center
   :alt: A WWT screenshot showing exoplanets in the Kepler field overlaid on a background sky map.

   A map of exoplanets in the Kepler field rendered over background imagery by pywwt.


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
   api/pywwt.annotation
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
