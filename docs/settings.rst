Modifying WorldWide Telescope settings
======================================

Once a Jupyter or Qt widget has been created, the programmatic user interface is the same. The widget objects include many modifiable properties and callable functions that fall into a few categories:

Visual settings
---------------

If the widget has been initialized as ``wwt``, then you can toggle several visual settings on and off. For example,

.. code-block:: python

    In [1]: wwt.constellation_boundaries = True

separates the view into the formally defined regions for each constellation. Show the constellations themselves by changing another setting:

.. code-block:: python

    In [2]: wwt.constellation_figures = True

Numerical settings all take astropy Quantities, which are floats with associated units. To demonstrate, say you'd like to simulate the celestial view from from the top of the tallest building in Santiago, Chile. You would enter:

.. code-block:: python

    In [3]: wwt.local_horizon_mode = True

    In [4]: wwt.location_latitude = -33.4172 * u.deg

    In [5]: wwt.location_longitude = -70.604 * u.deg

    In [6]: wwt.location_altitude = 300 * u.meter

The preceding results in the following view:

[run code, include gif of viewer?]

Many other visual settings are available...

.. here we should describe the settings accessible via traits, e.g.
.. whether or not to show constellations, etc. We don't need to list them
.. exhaustively, just show a few examples.

Foreground/background layers
-----------------------------

.. We can have a dedicated section to show how to set the foreground/background
.. and how to list available layers. Also we can show how to load a new
.. image collection URL

Centering on coordinates
------------------------

It's also possible to go directly to a particular object or region of the sky, given a certain set of coordinates in the form of an astropy ``SkyCoord`` object [and a field of view] for the viewer.

If you have an object in mind but don't have its coordinates on hand, pywwt can interface with astropy's ``SkyCoord`` class to retrieve the needed data. For the star Alpha Centauri, the process looks like this:

.. code-block:: python

    In [7]: from astropy.coordinates import SkyCoord

    In [8]: from astropy import units as u

    In [9]: coord = SkyCoord.from_name('Alpha Centauri')

    In [10]: widget.center_on_coordinates(coord, fov=10 * u.deg)

Running tours
------------------------

The widget has methods that allow for users to load, stop, and play tours from the WWT website. Once a tour is loaded:

.. code-block:: python

    In [11]: wwt.load_tour()

it plays automatically. It can be stopped and resumed through similar methods. While the tour is stopped, it's still possible to drag the viewer, (maybe?) `create annotations <https://link-to-annotations.rst>`_, and resume the tour without missing a step.
