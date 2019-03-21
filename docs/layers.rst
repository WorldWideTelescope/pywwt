.. _layers:

Adding data layers
==================

While annotations (see :ref:`annotations`) can be used to show specific points
of interest on the sky, data layers are a more general and efficient way of
showing point-based data anywhere in 3D space, including but not limited to
positions on the sky and on/around celestial bodies. In addition, layers can be
used to show image-based data on the celestial sphere.

The main layer type for point-data at the moment is
:class:`~pywwt.layers.TableLayer`. This layer type can be created using an
`astropy <http://docs.astropy.org/en/stable/table/index.html>`_
:class:`~astropy.table.Table` as well as a coordinate frame, which can be e.g.
``'Sky'`` or the name of one of the planets or satellites. The main layer type
for images is :class:`~pywwt.layers.ImageLayer`.

.. TODO: give a more exhaustive list of what can be used as a frame

Loading point data
------------------

To start off, let's look at how to show a simple set positions on the sky. We'll
use the `Open Exoplanet Catalogue <http://openexoplanetcatalogue.com>`_ as a
first example. We start off by using `astropy.table
<http://docs.astropy.org/en/stable/table/index.html>`_ to read in a
comma-separated values (CSV) file of the data::

    >>> from astropy.table import Table
    >>> OEC = 'https://worldwidetelescope.github.io/pywwt/data/open_exoplanet_catalogue.csv'
    >>> table = Table.read(OEC, delimiter=',', format='ascii.basic')

Assuming that you already have either the Qt or Jupyter version of pywwt open
as the ``wwt`` variable, you can then do::

    >>> wwt.layers.add_table_layer(table=table, frame='Sky',
    ...                            lon_att='ra', lat_att='dec')

.. image:: images/data_layers_kepler.png
   :align: center

Note that we have specified which columns to use for the right ascension and
declination (in the ``Sky`` frame, ``lon`` refers to right ascension, and
``lat`` to declination).

Let's now look at how to load data in the frame of reference of a celestial
body. Let's first change the camera settings so that we are looking at the
Earth (see :ref:`views` for more details)::

    >>> wwt.set_view('solar system')
    >>> wwt.solar_system.track_object('Earth')

Be sure to zoom in so that you can see the Earth properly. Next, we use a
dataset that includes all recorded earthquakes in 2010::

    >>> from astropy.table import Table
    >>> EARTHQUAKES = 'https://worldwidetelescope.github.io/pywwt/data/earthquakes_2010.csv'
    >>> table = Table.read(EARTHQUAKES, delimiter=',', format='ascii.basic')

We can then add the data layer using::

    >>> layer = wwt.layers.add_table_layer(table=table, frame='Earth',
    ...                                    lon_att='longitude', lat_att='latitude')

.. image:: images/data_layers_earthquakes.png
   :align: center

Note that ``lon_att`` and ``lat_att`` don't need to be specified in
:class:`~pywwt.layers.LayerManager.add_table_layer` - they can also be set
afterwards using e.g.::

    >>> layer.lon_att = 'longitude'

In some cases, datasets provide a third dimension that can be used as an
altitude or a radius. This can be provided using the ``alt_att`` column::

    >>> layer.alt_att = 'depth'

Data settings
-------------

There are several settings that can be used to fine-tune the interpretation of
the data. First, we can set how to interpret the 'altitude'::

    >>> layer.alt_type = 'distance'

The valid options are ``'distance'`` (distance from the origin), ``altitude``
(outward distance from the planetary surface), ``depth`` (inward distance from
the planetary surface), and ``sealevel`` (reset altitude to be at sea level).

.. TODO: figure out what 'terrain' does.

It is also possible to specify the units to use for the altitude::

    >>> from astropy import units as u
    >>> layer.alt_unit = u.km

This should be astropy :class:`~astropy.units.Unit` and should be one of
``u.m``, ``u.km``, ``u.au``, ``u.lyr``, ``u.pc``, ``u.Mpc``,
``u.imperial.foot``, or ``u.imperial.mile``. It is also possible to pass a
string provided that when passed to :class:`~astropy.units.Unit` this returns
one of the valid units.

Finally, it is possible to set the units for the longitude::

    >>> layer.lon_unit = u.hourangle

The valid values are ``u.degree`` and ``u.hourangle`` (or simply ``u.hour``) or
their string equivalents.

Visual attributes
-----------------

There are a number of settings to control the visual appearance of a layer.
First off, the points can be made larger or smaller by changing::

    >>> layer.size_scale = 10.

It is also possible to make the size of the points depend on one of the columns
in the table. This can be done by making use of the ``size_att`` attribute::

    >>> layer.size_att = 'mag'

then using ``layer.size_vmin`` and ``layer.size_vmax`` to control the values
that should be used for the smallest to largest point size respectively.

Similarly, the color of the points can either be set as a uniform color::

    >>> layer.color = 'red'

or it can be set to be dependent on one of the columns with::

    >>> layer.cmap_att = 'depth'

then using ``layer.cmap_vmin`` and ``layer.cmap_vmax`` to control the values
that should be used for the colors on each end of the colormap. By default
the colormap is set to the Matplotlib 'viridis' colormap but this can be changed
using the following attribute, which should be given the name of a `Matplotlib
colormap <https://matplotlib.org/examples/color/colormaps_reference.html>`_
or a colormap object::

    >>> layer.cmap = 'plasma'

By default, the marker size stays constant relative to the screen, but this can
be changed with::

    >>> layer.marker_scale = 'world'

To change it back to be relative to the screen, you can do::

    >>> layer.marker_scale = 'screen'

Finally, if you want to show all markers even if they are on the far side of
a celestial object, you can use::

    >>> layer.far_side_visible = True

Image layers
------------

Image layers are added in a similar way to point data, using
:class:`~pywwt.layers.LayerManager.add_image_layer`::

    >>> layer = wwt.layers.add_image_layer(image='my_image.fits')

Here, the ``image`` input can be either a filename, an
:class:`~astropy.io.fits.ImageHDU` object, or a tuple of the form
``(array, wcs)`` where ``array`` is a 2-d Numpy array, and ``wcs`` is an
astropy :class:`~astropy.wcs.WCS` object. Once the image has loaded,
you can modify the limits, stretch, and opacity using::

    >>> layer.vmin = -10
    >>> layer.vmax = 20
    >>> layer.stretch = 'log'
    >>> layer.opacity = 0.5

Listing layers and removing layers
----------------------------------

You can list the layers present in the visualization by doing::

    >>> wwt.layers
    Layer manager with 1 layers:

      [0]: TableLayer with 1616 markers

You can remove a layer by either doing::

    >>> layer.remove()

or::

    >>> wwt.layers.remove(layer)

If you don't have a reference to the layer, you can always do::

    >>> wwt.layers.remove(wwt.layers[0])
