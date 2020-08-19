pywwt: The AAS WorldWide Telescope from Python
==============================================

The pywwt package is the official toolkit for accessing the AAS_ `WorldWide
Telescope`_ (WWT) from Python. WWT is a free, open-source tool for visually
exploring humanity’s scientific understanding of the Universe. It includes a
sophisticated 4D WebGL rendering engine and a cloud-based web service for
sharing and visualizing terabytes of astronomical data. WWT is brought to you
by the non-profit `American Astronomical Society`_ (AAS), the major
organization of professional astronomers in North America, and the `.NET
Foundation`_.

.. _AAS: https://aas.org/
.. _American Astronomical Society: https://aas.org/
.. _WorldWide Telescope: http://www.worldwidetelescope.org/home
.. _.NET Foundation: https://dotnetfoundation.org/

With pywwt you can:

* Visualize and explore astronomical data interactively in the `Jupyter and
  JupyterLab`_ environments through an HTML widget
* Do the same in standalone applications with a Qt_ widget
* Load data from common astronomical data formats (e.g. `AstroPy tables`_)
  into WWT
* Control a running instance of the WWT Windows application

.. _Jupyter and JupyterLab: https://jupyter.org/
.. _Qt: https://www.qt.io/
.. _AstroPy tables: https://docs.astropy.org/en/stable/table/

.. figure:: images/data_layers_kepler.png
   :align: center
   :alt: A WWT screenshot showing exoplanets in the Kepler field overlaid on a background sky map.

   A map of exoplanets in the Kepler field rendered over background imagery by pywwt.

This package is under active development. If you run into any issues or would
like to see a new feature added, please ask! See the `Getting
help`_ section below.


Quick start
-----------

The quickest way to see what the pywwt can do is to try it out live, which you
can do straight in your browser with our cloud-based Jupyter notebooks. Here
are some examples:

* `Visualize Tabular Data from the NASA Exoplanet Archive
  <https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/NASA%20Exoplanet%20Archive.ipynb>`__
* `Visualize Imagery of W5 and SN2011fe
  <https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Visualizing%20Imagery.ipynb>`__

To browse our complete collection of live example notebooks, go to `our index
page
<https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Start%20Here.ipynb>`__.

*Note: it is usually fast to launch these notebooks, but if the code has been
recently updated, you may have to wait a few minutes for the backing software
images to be rebuilt.*

`This YouTube video <https://www.youtube.com/watch?v=gi2oC4AYrWU>`__
demonstrates the process and shows how you can run upload and run your own
notebooks as well. (Note that while it shows an older version of these
materials, the general procedure still holds.)

Contributed tutorial notebooks are welcome! Visit the `pywwt-notebooks
repository`_ on GitHub to suggest one.

.. _pywwt-notebooks repository: https://github.com/WorldWideTelescope/pywwt-notebooks


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

If you run into any issues when using pywwt, please open an issue `in the
pywwt repository <https://github.com/WorldWideTelescope/pywwt/issues>`_ on
GitHub. We also encourage you to consider asking a question on `the WWT
discussion forum`_ site.

.. _the WWT discussion forum: https://wwt-forum.org/


Acknowledgments
---------------

The AAS WorldWide Telescope (WWT) system, including pywwt, is a `.NET
Foundation`_ project. Work on WWT and pywwt has been supported by the
`American Astronomical Society`_ (AAS), the US `National Science Foundation`_
(grants 1550701_ and 1642446_), the `Gordon and Betty Moore Foundation`_, and
`Microsoft`_.

.. _National Science Foundation: https://www.nsf.gov/
.. _1550701: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1550701
.. _1642446: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1642446
.. _Gordon and Betty Moore Foundation: https://www.moore.org/
.. _Microsoft: https://microsoft.com/
