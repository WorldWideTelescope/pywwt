Modifying WorldWide Telescope settings
======================================

Once a Jupyter or Qt widget has been created, the programmatic user interface is 
the same. The widget objects include many modifiable properties and callable 
functions that fall into a few categories:

Visual settings
---------------

If the widget has been initialized as ``wwt``, then you can toggle several 
visual settings on and off. For example,

.. code-block:: python

    In [1]: wwt.constellation_boundaries = True

separates the view into the formally defined regions for each constellation. 
Show the constellations themselves by changing another setting:

.. code-block:: python

    In [2]: wwt.constellation_figures = True

Numerical settings all take astropy Quantities, which are floats with associated 
units. To demonstrate, say you'd like to simulate the celestial view from the 
top of the tallest building in Santiago, Chile. You would enter:

.. code-block:: python

    In [3]: wwt.local_horizon_mode = True

    In [4]: wwt.location_latitude = -33.4172 * u.deg

    In [5]: wwt.location_longitude = -70.604 * u.deg

    In [6]: wwt.location_altitude = 300 * u.meter

The preceding results in the following view:

[run code, include gif of viewer?]

.. Mention wwt.render to get screenshots of the current view
Many other visual settings are available...

Foreground/background layers
-----------------------------

Up to two layers can be used (...) typical use is to load a all-sky survey in 
the background and a study with decreased opacity as the foreground layer. 
(There is `a list <https://`create annotations <https://link-to-annotations.rst>`_>`_ 
of default layers with surveys of several wavelengths, (...), and levels of 
notoriety). If you want to see a (light) version of the (what?) superimposed 
on the cosmic microwave background, you would follow these steps:

.. code-block:: python

    In [7]: wwt.background = 'Planck CMB'
    
    In [8]: wwt.foreground =
    
    In [9]: wwt.foreground_opacity = .4

There are different folders of layers that can be accessed through
``wwt.load_image_collection`` (need code block)

Centering on coordinates
------------------------

It's also possible to go directly to a particular object or region of the sky, 
given a certain set of coordinates in the form of an astropy ``SkyCoord`` object 
[and a field of view] for the viewer.

If you have an object in mind but don't have its coordinates on hand, pywwt can 
interface with astropy's ``SkyCoord`` class to retrieve the needed data. For the 
star Alpha Centauri, the process looks like this:

.. code-block:: python

    In [10]: from astropy.coordinates import SkyCoord

    In [11]: from astropy import units as u

    In [12]: coord = SkyCoord.from_name('Alpha Centauri')

    In [13]: widget.center_on_coordinates(coord)
    
(``center_on_coordinates`` also has a default argument in astropy pixel units 
that can change the scale of the viewer.)

Running tours
------------------------

The widget has methods that allow you to load, stop, and resume tours from 
the WWT website. Once a tour is loaded:

.. code-block:: python

    In [14]: wwt.load_tour()

it plays automatically. It can be stopped and resumed through similar methods. 
While the tour is stopped, it's still possible to drag the viewer, (maybe?) 
`create annotations <https://link-to-annotations.rst>`_, and resume the tour 
without missing a step.