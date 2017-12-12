Showing annotations in WorldWide Telescope
==========================================

Annotation objects are shapes that can be manually added to the viewer in 
order to add another dimension of adaptability for use in tours, 
presentations, and the like. It's possible to generate several annotations at once, 
and you can choose from circles, polygons, and lines.

Annotations must first be instantiated, then, in the cases of lines and 
polygons, extended point by point. You can use these principles to create a line 
that traces the Big Dipper with help from astropy's ``SkyCoord`` class in 
providing coordinates for each star in the constellation:

.. code-block:: python

    In [1]: line = wwt.add_line()

    In [2]: line.add_point(SkyCoord.from_name('Alkaid')) # stars in Big Dipper
       ...: line.add_point(SkyCoord.from_name('Mizar'))
       ...: line.add_point(SkyCoord.from_name('Alioth'))
       ...: # (and so on...)

The color and width of the line are also adjustable. Line width is specified in 
pixels, while the color .. takes any type of value allowable through 
``matplotlib.color.to_hex``, as shown below:

.. code-block:: python

    In [3]: line.line_color = '#C4D600' # hex strings
       ...: # line.line_color = 'g' # matplotlib default colors
       ...: # line.line_color = 'azure' # extended html colors
       ...: # line.line_color = (.07, .15, ,.31, .5) # rgb tuples with opacity

An additional adjustment to the line width results in:

[picture generated from commented code at bottom of file]

.. Only circle fills, polygon fills, and lines have opacities; the lines for
.. circles and polygons do not.

Polygons are made in the same way as lines, though the viewer will automatically 
connect the last point added to the first in order to form a closed shape. This 
leads to the availability of a fill color (which can be toggled on and off) as 
well as an ample variety of possible shapes.

[picture of nice-looking polygon]

Circles are similar in that their fill and line options are also changeable, but 
instead of adding points, you must specify a center coordinate with a 
``SkyCoord`` value:

.. code-block:: python

    In [4]: wwt.center_on_coordinates(SkyCoord(188, -57, unit=u.deg))

    In [5]: circle = wwt.create_circle()

    In [6]: circle.set_center(SkyCoord(188, -57, unit=u.deg))

Radii can be assigned in pixels or arcseconds as preferred.

Once an annotation is no longer needed, it can be removed via its 
``remove_annotation`` method. If there are multiple annotations and you want 
them all gone at once, you can call on the widget's ``clear_annotations`` 
method.


.. code for big dipper example:
.. line.add_point(SkyCoord.from_name('Alkaid'))
.. line.add_point(SkyCoord.from_name('Mizar'))
.. line.add_point(SkyCoord.from_name('Alioth'))
.. line.add_point(SkyCoord.from_name('Megrez'))
.. line.add_point(SkyCoord.from_name('Phecda'))
.. line.add_point(SkyCoord.from_name('Merak'))
.. line.add_point(SkyCoord.from_name('Dubhe'))
.. line.add_point(SkyCoord.from_name('Megrez'))
.. line.line_color = '#C4D600'
.. line.line_width = 13 * u.pixel
