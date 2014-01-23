A Worked ``pywwt`` Example
--------------------------

This is a worked example of how to get a particle dataset into ``pywwt``. To run it yourself,
you'll need the following:

- `This IPython notebook <files/pywwt_example.ipynb>`_
- `This data file <files/radio_halo_1kpc_hdf5_part_0200_reduced.h5>`_

You may need to change things in this notebook like the ``host`` address, etc.

First, we'll import the ``pywwt`` modules, as well as ``numpy`` and
``h5py``, which we'll need for this example. We also define a conversion
between centimeters and megaparsecs, ``cm_per_mpc``.

.. code:: python

    from pywwt.mods import *
    import numpy as np
    import h5py
    cm_per_mpc = 3.0856e24

Next, we'll connect to a WWT client. This one happens to be running on a
separate machine on my network, so I'll specify the IPv4 address of that
machine as the host.

.. code:: python

    my_wwt = WWTClient(host="192.168.1.3")

Now, we'll create a layer which we'll put data in later. Since this is
tracer particle data from a radio minihalo simulation of a galaxy
cluster core, we'll put the layer in the ``"Sky"`` frame and name it
``"minihalo"``. We also need to specify the fields that will go into the
layer, which in this case are just the spherical coordinates of the
points and the color of the point.

.. code:: python

    my_layer = my_wwt.new_layer("Sky","minihalo",["RA","DEC","ALT","color"])

We need to set the properties of this layer as well. We will construct a
``props_dict`` to hold the layer properties we want. A summary:

-  The coordinates are spherical.
-  The size of the point is relative to the screen.
-  The points have all the same scale.
-  The scale of the points is 16.
-  The points are lit on all sides.
-  This is not a time series dataset.
-  The "altitude" coordinate (or radius) is in megaparsecs.
-  The units of the RA coordinate are in degrees.


.. code:: python

    props_dict = {"CoordinatesType":"Spherical",
                  "MarkerScale":"Screen",
                  "PointScaleType":"Constant",
                  "ScaleFactor":"16",
                  "ShowFarSide":"True",
                  "TimeSeries":"False",
                  "AltUnit":"MegaParsecs",
                  "RaUnits":"Degrees"}
    my_layer.set_properties(props_dict)

Though it probably already is, this call activates the layer in the
view:

.. code:: python

    my_layer.activate()

Now we have to do some work to get the data out of the HDF5 file it's
contained in. The data consists of a set of points, with cartesian
coordinates in centimeters, and radio emissivity in cgs units. We'll map
the radio emissivity to a color map from Matplotlib, and convert the
coordinates to spherical. We'll put all of this in a dict, ``data``.

.. code:: python

    fn = "radio_halo_1kpc_hdf5_part_0200_reduced.h5"
    f = h5py.File(fn, "r")
    x = f["x"][:]/cm_per_mpc # The coordinates in the file are in cm, this converts them to Mpc
    y = f["y"][:]/cm_per_mpc
    z = f["z"][:]/cm_per_mpc
    c = f["radio"][:]
    color = map_array_to_colors(c, "spectral", scale="log", vmin=1.0e-40, vmax=4.0e-23)
    data = convert_xyz_to_spherical(x, y, z)
    data["color"] = color
    f.close()

Now we add this data in. We set ``purge_all=True`` to eliminate the data
already in the layer (though it was empty so it's superfluous), and we
set the ``fly_to`` parameter to fly to a particular location and zoom
setting relative to the ``"Sky"`` frame:

-  Latitude: 48 degrees
-  Longitude: -12 degress
-  Zoom: :math:`6 \times 10^{11}`
-  Rotation: 0 radians
-  Angle: 0 radians

.. code:: python

    my_layer.update(data=data, purge_all=True, fly_to=[48.,-12.,6.0e11,0.,0.])

Just as a check, we can get the state of the current view (after the
fly-to stops) and see that it matches up with the coordinates of our
``fly_to`` parameter:

.. code:: python

    my_wwt.get_state()

.. parsed-literal::

    {'angle': '0',
     'lat': '48',
     'lng': '-12',
     'lookat': 'SolarSystem',
     'referenceframe': 'Sun',
     'rotation': '0',
     'time': '1/22/2014 11:05:32 PM',
     'timerate': '1',
     'viewtoken': 'GK484GJ28CH2E59766142GGGGIC8427AA1468BBD2D453FB0A22FA365486C3F21FB521FD2E8683FGGG',
     'zoom': '600000000000',
     'zoomtext': '1.2 Mpc'}



If this all worked correctly, the view should look like this:

.. image:: images/minihalo.png


    