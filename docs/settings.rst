Modifying WorldWide Telescope settings
======================================

Once a Jupyter or Qt widget has been created, the programmatic user interface 
is the same. The widget objects include many modifiable properties and callable 
functions that are listed in the ``trait_names()`` method. They can be divided 
into a few categories that are explained in more depth in the sections that 
follow.

Visual settings
---------------

Once the widget has been initialized -- here we assign it to the variable name 
``wwt`` -- you can toggle several visual settings on and off. For example,

.. code-block:: python

    In [1]: wwt.constellation_boundaries = True

separates the view into the formally defined regions for each constellation. 
Show the constellations themselves by changing another setting:

.. code-block:: python

    In [2]: wwt.constellation_figures = True
    
These two settings and ``constellation_selection`` also have complementary 
settings that change their colors. These settings take either rgb tuples or 
strings hex codes or color names recognized by the ``to_hex`` method from 
``matplotlib.colors``.

.. code-block:: python

    In [3]: wwt.constellation_boundary_color = 'azure'

    In [4]: wwt.constellation_figure_color = '#D3BC8D'

    In [5]: wwt.constellation_selection_color = (1, 0, 1)

Numerical settings all take values of the astropy ``Quantity`` type, which are 
floats with associated units. To demonstrate, say you'd like to simulate the 
celestial view from the top of the tallest building in Santiago, Chile. You 
would enter:

.. code-block:: python

    In [6]: wwt.local_horizon_mode = True

    In [7]: wwt.location_latitude = -33.4172 * u.deg

    In [8]: wwt.location_longitude = -70.604 * u.deg

    In [9]: wwt.location_altitude = 300 * u.meter

All of the preceding code results in the following view:

.. image:: stgo_view.png

Screenshots like the one above are saved through a widget method that takes 
your desired file name its argument.

.. code-block:: python

    In [10]: wwt.render('stgo_view.png')
    
Centering on coordinates
------------------------

It's also possible to go directly to a particular object or region of the sky, 
given a certain set of coordinates in the form of an astropy ``SkyCoord`` 
object and a field of view (zoom level in astropy pixel units) for the viewer.

If you have an object in mind but don't have its coordinates on hand, pywwt can 
interface with astropy's ``SkyCoord`` class to retrieve the needed data. For 
the star Alpha Centauri, the process looks like this:

.. code-block:: python

    In [11]: from astropy.coordinates import SkyCoord

    In [12]: coord = SkyCoord.from_name('Alpha Centauri')

    In [13]: wwt.center_on_coordinates(coord, fov=10 * u.deg)

Foreground/background layers
-----------------------------

Up to two layers can be used to set the background of the viewer. The viewer's 
ability to display multiple layers allows users to visually compare large 
all-sky surveys and smaller studies. As the example below shows, they also add 
a good amount of aesthetic value for tours or general use.

.. code-block:: python

    In [14]: wwt.background = 'Fermi LAT 8-year (gamma)'
    
    In [15]: wwt.foreground = 'Planck Dust & Gas'
    
    In [16]: wwt.foreground_opacity = .75
    
The code above superimposes a dust and gas map on an all-sky gamma ray 
intensity survey and allows for pictures like this:

.. image:: dust_on_gamma.png

You can currently choose from about 20 layers of different wavelengths, scopes, 
and eras; list them using the widget's ``available_layers`` method.

.. How does ``wwt.load_image_collection`` work? Are they the other folders in 
.. http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys ?

Running tours
------------------------

Also present are methods that allow you to load, pause, and resume tours from 
the WWT website. Once a tour is loaded,

.. code-block:: python

    In [17]: wwt.load_tour()

it plays automatically. You can pause and resume it through similar methods. 
While the tour is stopped, it's still possible to drag the viewer, (maybe?) 
`create annotations <https://link-to-annotations.rst>`_, and resume the tour 
without missing a step.

.. How do you exit a tour and go back to the original view?