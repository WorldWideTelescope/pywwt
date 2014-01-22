User's Guide
------------

.. _WWTClient: api/pywwt.client.html
.. _load: api/pywwt.client.html#pywwt.client.WWTClient.load
.. _new_layer: api/pywwt.client.html#pywwt.client.WWTClient.new_layer
.. _new_layer_group: api/pywwt.client.html#pywwt.client.WWTClient.new_layer_group
.. _get_existing_layer: api/pywwt.client.html#pywwt.client.WWTClient.get_existing_layer
.. _change_mode: api/pywwt.client.html#pywwt.client.WWTClient.change_mode
.. _get_frame_list: api/pywwt.client.html#pywwt.client.WWTClient.get_frame_list
.. _get_layer_list: api/pywwt.client.html#pywwt.client.WWTClient.get_layer_list
.. _get_state: api/pywwt.client.html#pywwt.client.WWTClient.get_state
.. _move_view: api/pywwt.client.html#pywwt.client.WWTClient.move_view
.. _ui_settings: api/pywwt.client.html#pywwt.client.WWTClient.ui_settings

.. _WWTLayer: api/pywwt.layer.html
.. _update: api/pywwt.layer.html#pywwt.layer.WWTLayer.update

.. _convert_xyz_to_spherical: api/pywwt.utils.html#pywwt.utils.convert_xyz_to_spherical
.. _generate_utc_times: api/pywwt.utils.html#pywwt.utils.generate_utc_times
.. _map_array_to_colors: api/pywwt.utils.html#pywwt.utils.map_array_to_colors
.. _write_data_to_csv: api/pywwt.utils.html#pywwt.utils.write_data_to_csv

``pywwt`` is a Python interface for the Microsoft `World Wide Telescope <http://www.worldwidetelescope.org>`_
(WWT) Windows client, using the
`Layer Control API (LCAPI) <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#load>`_.
The LCAPI provides an interface to WWT's Layer Manager by sending data and information in the form of
strings over HTTP. ``pywwt`` simply provides a Python interface to make these
calls, enabling the control of WWT from scripts or an IPython notebook. Most importantly, it
enables the passing of data created within a Python environment to WWT.

To use ``pywwt`` from Python, first import its modules:

.. code-block:: python

    from pywwt.mods import *

Connecting to a WWT Client
~~~~~~~~~~~~~~~~~~~~~~~~~~

Connecting to a running WWT client on the current host is as simple as creating
a WWTClient_ instance:

.. code-block:: python

    my_wwt = WWTClient()

If WWT is running on a separate host, and you have enabled access from
remote hosts, you can connect to it by specifying the hostname or IP address:

.. code-block:: python

    my_wwt = WWTClient(host="192.168.1.3")

If the WWT client has not been started on the host you are attempting to connect
to, or if you have not enabled remote access, or if the firewall is blocking port
``5050`` on the host, you may get one of the following error messages:

.. code-block:: none

    WWTException: World Wide Telescope has not been started on this host or is
    otherwise unreachable.

.. code-block:: none

    WWTException: Error - IP Not Authorized by Client

If the version of WWT is not the required version, you will get this error message:

.. code-block:: none

    WWTException: World Wide Telescope is not the required version (>= 2.8)

.. note::

    Some tasks require loading files from disk. In this case, if the current WWTClient_
    instance and the WWT client itself are not running on the same host, they must have
    access to a common filesystem from which the files may be loaded.

Creating New Layers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The heart of ``pywwt`` (and the LCAPI) is the interaction with WWT's Layer Manager. Layers contain
data in WWT. There are three ways to create new layers from a WWTClient_ instance.

load
++++

You can use the load_ method to generate a new layer with data uploaded from a file:

.. code-block:: python

    my_layer = my_wwt.load("particles.csv", "Sun", "Vulcan")

where the file in this case is a CSV file with values separated by commas or tabs. The
second two arguments are the ``frame`` to load the data into, and the ``name`` for the new layer.
In addition to CSV files, the load_ command shape files (.shp), 3D model files (.3ds), and `WTML
files containing ImageSet references
<http://www.worldwidetelescope.org/Docs/WorldWideTelescopeDataFilesReference.html>`_.

load_ takes a number of keyword arguments, which may be used to customize the data in the layer.
These include options to control the color, the start and end date of the events, and options to
control the fading in and out of data.

.. code-block:: python

    my_layer = my_wwt.load("particles.csv", "Sun", "Vulcan", color="FFFFFFFF",
                           start_date="1/11/2009 12:00 AM", end_date="12/31/2010 5:00 PM",
                           fade_type="In", fade_range=2)

load_ returns a WWTLayer_ instance.

`LCAPI Reference: Load <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#load>`_

new_layer
+++++++++

To create a new layer without loading data from a file, use the new_layer_ method:

.. code-block:: python

    new_layer = my_wwt.new_layer("Sky", "My Star", ["RA","DEC","ALT","color"])

where the first two arguments are the ``frame`` to create the layer and the ``name`` of the
new layer. The last argument is a list of ``fields`` that are the names of the data arrays
that will be loaded into the WWTLayer_ instance using an update_ call. new_layer_ also takes
the same keyword arguments as load_.

`LCAPI Reference: New <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#new>`_

new_layer_group
+++++++++++++++

.. code-block:: python

    my_wwt.new_layer_group("Sun", "my asteroids")

get_existing_layer
++++++++++++++++++

Finally, to retrieve an already existing layer as a WWTLayer_ object, call get_existing_layer_:

.. code-block:: python

    minihalo_layer = my_wwt.get_existing_layer("minihalo")

Working With Layers
~~~~~~~~~~~~~~~~~~~

Once a WWTLayer_ object has been created, there are a number of options for setting the parameters
of the layer and working with its data.

update
++++++

`LCAPI Reference: Update <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#update>`_

Other Commands
~~~~~~~~~~~~~~

There are several remaining methods for WWTClient_ that may be used to control the appearance of the WWT client
and the layers.

change_mode
+++++++++++

change_mode_ changes the view to one of: Earth, Planet, Sky, Panorama, SolarSystem.

.. code-block:: python

    my_wwt.change_mode("SolarSystem")

get_frame_list
++++++++++++++

get_layer_list
++++++++++++++

get_state
+++++++++

move_view
+++++++++

ui_settings
+++++++++++

Standard Keyword Arguments
~~~~~~~~~~~~~~~~~~~~~~~~~~

Many of the ``pywwt`` methods take a standard set of keyword arguments that may be applied
along with that method's particular arguments.

`LCAPI Reference: General Parameters <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#general_parameters>`_

Data Utilities
~~~~~~~~~~~~~~

``pywwt`` provides general utilities for generating and transforming data into formats suitable
for WWT.

convert_xyz_to_spherical
++++++++++++++++++++++++

convert_xyz_to_spherical_ takes a set of Cartesian coordinates and returns a dictionary of NumPy arrays
containing the coordinates converted to spherical coordinates:

.. code-block:: python

    sp_crd = convert_xyz_to_spherical(x, y, z, is_astro=True, ra_units="degrees")

where ``x``, ``y``, and ``z`` are NumPy arrays corresponding to the Cartesian coordinates, assumed to have
an origin at (0,0,0). From this call, ``sp_crd`` will have ``"RA"``, ``"DEC"``, and ``"ALT"`` as fields. If
``is_astro`` is set to ``False``, the fields will be ``"LAT"``, ``"LON"``, and ``"ALT"``. ``ra_units`` controls
whether the ``"RA"`` coordinate will be in degrees or hours.

generate_utc_times
++++++++++++++++++

For data that does not have a time component, generate_utc_times_ will generate a list of times that may be
used by WWT:

.. code-block:: python

    num_steps = 100
    step_size = {"days":5, "hours":12, "minutes":5}
    start_time = "1/1/2013 12:00 AM"
    my_times = generate_utc_times(num_steps, step_size, start_time=start_time)

The first two arguments, ``num_steps`` and ``step_size``, set the number of times and the step between the times.
``start_time`` is a keyword argument that defaults to the current system time if it is not specified. ``my_times``
will be a list of time strings.

map_array_to_colors
+++++++++++++++++++

map_array_to_colors_ takes a NumPy array of floats, and a Matplotlib colormap, and converts the floating-point
values to colors, which may be used as colors for event data in WWT:

.. code-block:: python

    colors = map_array_to_colors(temperature, "spectral", scale="log", vmin=1., vmax=7.)

where the first two arguments are the NumPy array ``arr`` to be converted, and a string ``cmap`` representing the
Matplotlib colormap. The ``scale`` of the color map may be set to ``"linear"`` or ``"log"``, and the maximum and minimum
values of the data may be set by ``vmin`` and ``vmax``. If they are not set, they are set to the minimum and maximum
values of the array ``arr`` by default.

write_data_to_csv
+++++++++++++++++

write_data_to_csv_ takes a dict of NumPy arrays or lists of data and writes them to a file in CSV format, which may be
read in by load_:

.. code-block:: python

    particles = {}
    particles["x"] = x
    particles["y"] = y
    particles["z"] = z
    particles["color"] = colors
    write_data_to_csv(particles, "my_particles.csv", mode="new")

The keyword argument ``mode`` may be set to ``"new"`` or ``"append"``.