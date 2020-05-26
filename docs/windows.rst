Using the Windows client
========================

About
-----

The **pywwt.windows** sub-package includes a Python interface for the AAS
`WorldWide Telescope <http://www.worldwidetelescope.org/home>`_
(WWT) Windows client, using the
`Layer Control API (LCAPI) <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#load>`_.
The LCAPI provides an interface to WWT's Layer Manager by sending data and
information in the form of strings over HTTP. ``pywwt`` simply provides a Python
interface to make these calls, enabling the control of WWT from scripts or an
IPython notebook. Most importantly, it enables the passing of data created
within a Python environment to WWT.

.. note:: The **pywwt** package was originally developed as a client for
          the Windows WorldWide Telescope application. For now, the API for
          the Windows is identical to that in previous versions, with the
          exception that imports of the ``WWTClient`` class should be
          changed from::

               from pywwt import WWTClient

          to::

               from pywwt.windows import WWTWindowsClient

          For now, the API remains identical to previous versions, and is
          different from the API for the Jupyter and Qt widgets. In future,
          we will align the API of the Windows client on the Jupyter and Qt
          widgets.

Using the Windows client
------------------------

The Windows client is imported using::

    from pywwt.windows import WWTWindowsClient

Connecting to the WWT application
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Connecting to a running WWT application on the current host is as simple as
creating a :class:`~pywwt.windows.WWTWindowsClient` instance::

    wwt = WWTWindowsClient()

If WWT is running on a separate host, and you have enabled access from
remote hosts, you can connect to it by specifying the hostname or IP address::

    wwt = WWTWindowsClient(host="192.168.1.3")

If the WWT client has not been started on the host you are attempting to connect
to, or if you have not enabled remote access, or if the firewall is blocking
port ``5050`` on the host, you may get one of the following error messages::

    WWTException: WorldWide Telescope has not been started on this host or is
    otherwise unreachable.

    WWTException: Error - IP Not Authorized by Client

If the version of WWT is not the required version, you will get this error
message::

    WWTException: WorldWide Telescope is not the required version (>= 2.8)

.. note::

    Some tasks require loading files from disk. These will currently only work
    if the current :class:`~pywwt.windows.WWTWindowsClient` instance and the WWT
    client itself are running on the same host.

Creating New Layers
~~~~~~~~~~~~~~~~~~~

The heart of :class:`~pywwt.windows.WWTWindowsClient` (and the LCAPI) is the
interaction with WWT's Layer Manager. Layers contain data in WWT. There are
three ways to create new layers from a :class:`~pywwt.windows.WWTWindowsClient`
instance.

load
++++

You can use the :meth:`~pywwt.windows.WWTWindowsClient.load` method to generate a new layer with data uploaded from a file::

    layer = wwt.load("particles.csv", "Sun", "Vulcan")

where the file in this case is a CSV file with values separated by commas or
tabs. The second two arguments are the ``frame`` to load the data into, and the
``name`` for the new layer. In addition to CSV files, the
:meth:`~pywwt.windows.WWTWindowsClient.load` command shape files (.shp), 3D
model files (.3ds), and `WTML files containing ImageSet references
<https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/>`_.

:meth:`~pywwt.windows.WWTWindowsClient.load` takes a number of keyword
arguments, which may be used to customize the data in the layer. These include
options to control the color, the start and end date of the events, and options
to control the fading in and out of data::

    layer = wwt.load("particles.csv", "Sun", "Vulcan", color="FFFFFFFF",
                           start_date="1/11/2009 12:00 AM", end_date="12/31/2010 5:00 PM",
                           fade_type="In", fade_range=2)

:meth:`~pywwt.windows.WWTWindowsClient.load` returns a
:class:`~pywwt.windows.WWTLayer` instance.

`LCAPI Reference: Load <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#load>`_

new_layer
+++++++++

To create a new layer without loading data from a file, use the
:meth:`~pywwt.windows.WWTWindowsClient.new_layer` method::

    new_layer = wwt.new_layer("Sky", "My Star", ["RA","DEC","ALT","color"])

where the first two arguments are the ``frame`` to create the layer and the
``name`` of the new layer. The last argument is a list of ``fields`` that are
the names of the data arrays that will be loaded into the
:class:`~pywwt.windows.WWTLayer` instance using an
:meth:`~pywwt.windows.WWTLayer.update` call.
:meth:`~pywwt.windows.WWTWindowsClient.new_layer` also takes the same keyword
arguments as :meth:`~pywwt.windows.WWTWindowsClient.load`.

`LCAPI Reference: New <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#new>`_

new_layer_group
+++++++++++++++

:meth:`~pywwt.windows.WWTWindowsClient.new_layer_group` creates a new layer
group, which is an organizational aid when using the layer manager. The user
will be able to collapse and expand groups in the Layer Manager, and have groups
that are sub-sets of other groups::

    wwt.new_layer_group("Sun", "my asteroids")

The first argument is the reference ``frame`` for the group and the second is
the ``name`` of the group.

`LCAPI Reference: Group <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#group>`_

get_existing_layer
++++++++++++++++++

Finally, to retrieve an already existing layer as a
:class:`~pywwt.windows.WWTLayer` object, call
:meth:`~pywwt.windows.WWTWindowsClient.get_existing_layer`::

    minihalo_layer = wwt.get_existing_layer("minihalo")

Working With Layers
~~~~~~~~~~~~~~~~~~~

Once a :class:`~pywwt.windows.WWTLayer` object has been created, there are a
number of options for setting the parameters of the layer and working with its
data.

update
++++++

:meth:`~pywwt.windows.WWTLayer.update` adds data to layers, removes data, and
changes other aspects of the layer. The ``data`` to be added is a dict of NumPy
arrays or lists::

    data = {}
    data["RA"] = ra_coord
    data["DEC"] = dec_coord
    data["ALT"] = alt_coord
    data["color"] = colors
    layer.update(data=data, purge_all=True, no_purge=False, show=True)

Where the keys of the dict must correspond to the names of the ``fields``
specified in the :meth:`~pywwt.windows.WWTWindowsClient.new_layer` call that
created this layer. ``purge_all`` controls whether or not all existing data will
be cleared from the layer. Setting ``no_purge`` to `True` will prevent data
that has already occurred from being deleted from the layer, which would happen
by default. ``show`` controls whether the layer is shown or hidden.

`LCAPI Reference: Update <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#update>`_

activate
++++++++

The :meth:`~pywwt.windows.WWTLayer.activate` method highlights the selected
layer in the layer manager::

    layer.activate()

`LCAPI Reference: Activate <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#activate>`_

There are a number of properties associated with each layer, and there are
methods for getting and setting these properties. There is a `list of properties
<https://docs.worldwidetelescope.org/lcapi-guide/1/properties/>`_
for layers at the WWT website.

get_property
++++++++++++

:meth:`~pywwt.windows.WWTLayer.get_property` returns the value of a property
given its ``property_name``::

    prop = layer.get_property("CoordinatesType")

`LCAPI Reference: Getprop <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#getprop>`_

get_properties
++++++++++++++

:meth:`~pywwt.windows.WWTLayer.get_properties` returns all of the properties for
a layer in a Python dict::

    prop_dict = layer.get_properties()

`LCAPI Reference: Getprops <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#getprops>`_

set_property
++++++++++++

:meth:`~pywwt.windows.WWTLayer.set_property` sets a property with
``property_name`` to ``property_value``::

    layer.set_property("AltUnit", "MegaParsecs")

The ``property_name`` and ``property_value`` must both be strings.

`LCAPI Reference: Setprop <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#setprop>`_

set_properties
++++++++++++++

:meth:`~pywwt.windows.WWTLayer.set_properties` sets a number of properties which
have been organized into a dict of {``property_name``,``property_value``}
pairs::

    props_dict = {"CoordinatesType":"Spherical",
                  "MarkerScale":"Screen",
                  "PointScaleType":"Constant",
                  "ScaleFactor":"16",
                  "ShowFarSide":"True",
                  "TimeSeries":"False",
                  "AltUnit":"MegaParsecs",
                  "RaUnits":"Degrees"}
    layer.set_properties(props_dict)

Each name and value must be a string.

`LCAPI Reference: Setprops <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#setprops>`_

delete
++++++

:meth:`~pywwt.windows.WWTLayer.delete` deletes the layer from the Layer
Manager::

    layer.delete()

If you try to call a method on the associated layer, you will get an error
message::

    WWTException: This layer has been deleted!

`LCAPI Reference: Delete <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#delete>`_

Other Commands
~~~~~~~~~~~~~~

There are several remaining methods for :class:`~pywwt.windows.WWTWindowsClient`
that may be used to control the appearance of the WWT client and the layers.

change_mode
+++++++++++

:meth:`~pywwt.windows.WWTWindowsClient.change_mode` changes the view to one of:
Earth, Planet, Sky, Panorama, SolarSystem::

    wwt.change_mode("SolarSystem")

`LCAPI Reference: Mode <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#mode>`_

get_frame_list
++++++++++++++

:meth:`~pywwt.windows.WWTWindowsClient.get_frame_list` returns a dictionary of
the WWT client's reference frames::

    frame_list = wwt.get_frame_list()

returns something like::

    {'Adrastea': {'Enabled': 'True'},
     'Aegir': {'Enabled': 'True'},
     'Aitne': {'Enabled': 'True'},
     'Albiorix': {'Enabled': 'True'},
     ...
     'Umbriel': {'Enabled': 'True'},
     'Uranus': {'Enabled': 'True'},
     'Venus': {'Enabled': 'True'},
     'Ymir': {'Enabled': 'True'}}

`LCAPI Reference: LayerList <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#layerlist>`_

get_layer_list
++++++++++++++

:meth:`~pywwt.windows.WWTWindowsClient.get_layer_list` returns a dictionary of
the WWT client's layers::

    layer_list = wwt.get_layer_list()

returns something like::

    {'2D Sky': {'Enabled': 'True',
      'ID': 'fffe96fc-b485-44bb-8f78-538e0f2348d4',
      'Type': 'SkyOverlays',
      'Version': '3'},
     '3d Solar System': {'Enabled': 'True',
      'ID': 'cb87eaec-534d-4490-b3d9-4d9013574895',
      'Type': 'SkyOverlays',
      'Version': '3'},
     'ISS Model  (Toshiyuki Takahei)': {'Enabled': 'False',
      'ID': '00000001-0002-0003-0405-060708090a0b',
      'Type': 'ISSLayer',
      'Version': '2'},
     'Overlays': {'Enabled': 'True',
      'ID': '531f48c6-f8f5-44db-bce5-b81301a25b60',
      'Type': 'SkyOverlays',
      'Version': '2'}}

`LCAPI Reference: LayerList <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#layerlist>`_

get_state
+++++++++

:meth:`~pywwt.windows.WWTWindowsClient.get_state` returns a dict of some of the
details of the current view::

    wwt.get_state()

returns something along the lines of::

   {'ReferenceFrame': 'Sun',
    'ViewToken': 'GK484GJ28CH2E59766142GGGGIC8427AA1468BBD2D453FB0A22FA365486C3F21FB521FD2E8683FGGG',
    'ZoomText': '1.2 Mpc',
    'angle': '0',
    'lat': '48',
    'lng': '-12',
    'lookat': 'SolarSystem',
    'rotation': '0',
    'time': '4/1/2015 2:38:13 PM',
    'timerate': '1',
    'zoom': '600000000000'}

`LCAPI Reference: State <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#state>`_

move_view
+++++++++

:meth:`~pywwt.windows.WWTWindowsClient.move_view` changes the view depending on
the supplied parameter::

    wwt.move_view("ZoomIn")

where the parameter may be one of:

- ``"ZoomIn"``: Zoom in on the current view.
- ``"ZoomOut"``: Zoom out of the current view.
- ``"Up"``: Move the current view up.
- ``"Down"``: Move the current view down.
- ``"Left"``: Move the current view left.
- ``"Right"``: Move the current view right.
- ``"Clockwise"``: Rotate the view clockwise 0.2 of one radian.
- ``"CounterClockwise"``: Rotate the view counterclockwise 0.2 of one radian.
- ``"TiltUp"``: Angle the view up 0.2 of one radian.
- ``"TiltDown"``: Angle the view down 0.2 of one radian.
- ``"Finder"``: Currently unimplemented.

`LCAPI Reference: Move <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#move>`_

ui_settings
+++++++++++

.. note:: At the moment this does not work properly due to issues on the WWT side

:meth:`~pywwt.windows.WWTWindowsClient.ui_settings` changes user interface
settings without altering the layer data::

    wwt.ui_settings("ShowConstellationBoundries", "True")

To see the list of possible settings see the `LCAPI section on uisettings
<https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#uisettings>`_.

Standard Keyword Arguments
~~~~~~~~~~~~~~~~~~~~~~~~~~

Many of the ``pywwt`` methods take a standard set of keyword arguments that may
be applied along with that method's particular arguments.

- ``date_time`` (string): Sets the viewing clock to the given date and time, in
  UTC format, for example: "1/1/2000 12:02:46 AM"

- ``time_rate`` (float): The accelerated time to render the visualization, as
  a multiple of 10.

- ``fly_to`` (list of floats): Sets the position of the view camera. Requires
  five floating point numbers, in this order:

 1. Latitude is in decimal degrees, positive to the North.
 2. Longitude is in decimal degrees, positive to the East.
 3. Zoom level varies from 360 (the most distant view) to 0.00023 (the closest view).
 4. Rotation is in radians, positive moves the camera to the left.
 5. Angle is in radians, positive moves the camera forward.
 6. (optional) The name of the frame to change the view to.

- ``instant`` (boolean): Used with the ``fly_to`` parameter, set this to `True`
  to specify that the camera should jump to the location, or `False` that the
  camera should smoothly pan and zoom to the location. Default
- ``autoloop`` (boolean): True sets the layer manager to auto loop.

The API documentation for :class:`~pywwt.windows.WWTWindowsClient` and
:class:`~pywwt.windows.WWTLayer` lists for each method all the possible keyword
arguments.

An example call::

    wwt.move_view("Clockwise", date_time="1/1/2000", time_rate=100.)

which would rotate the view clockwise, set the current date and time to 1/1/2000
at 12:00:00 AM UTC, and increase the rate of the passage of time by a factor of
100.

`LCAPI Reference: General Parameters <https://docs.worldwidetelescope.org/lcapi-guide/1/lcapicommands/#general-parameters>`_

Data Utilities
~~~~~~~~~~~~~~

``pywwt`` provides general utilities for generating and transforming data into
formats suitable for WWT.

convert_xyz_to_spherical
++++++++++++++++++++++++

:func:`~pywwt.windows.convert_xyz_to_spherical` takes a set of Cartesian
coordinates and returns a dictionary of NumPy arrays containing the coordinates
converted to spherical coordinates::

    sp_crd = convert_xyz_to_spherical(x, y, z, is_astro=True, ra_units="degrees")

where ``x``, ``y``, and ``z`` are NumPy arrays corresponding to the Cartesian
coordinates, assumed to have an origin at (0,0,0). From this call, ``sp_crd``
will have ``"RA"``, ``"DEC"``, and ``"ALT"`` as fields. If ``is_astro`` is set
to `False`, the fields will be ``"LAT"``, ``"LON"``, and ``"ALT"``.
``ra_units`` controls whether the ``"RA"`` coordinate will be in degrees or
hours.

generate_utc_times
++++++++++++++++++

For data that does not have a time component,
:func:`~pywwt.windows.generate_utc_times` will generate a list of times that may
be used by WWT::

    num_steps = 100
    step_size = {"days":5, "hours":12, "minutes":5}
    start_time = "1/1/2013 12:00 AM"
    my_times = generate_utc_times(num_steps, step_size, start_time=start_time)

The first two arguments, ``num_steps`` and ``step_size``, set the number of
times and the step between the times. ``start_time`` is a keyword argument that
defaults to the current system time if it is not specified. ``my_times`` will be
a list of time strings.

map_array_to_colors
+++++++++++++++++++

:func:`~pywwt.windows.map_array_to_colors` takes a NumPy array of floats, and a
Matplotlib colormap, and converts the floating-point values to colors, which may
be used as colors for event data in WWT::


    colors = map_array_to_colors(temperature, "spectral", scale="log", vmin=1., vmax=7.)

where the first two arguments are the NumPy array ``arr`` to be converted, and a
string ``cmap`` representing the Matplotlib colormap. The ``scale`` of the color
map may be set to ``"linear"`` or ``"log"``, and the maximum and minimum values
of the data may be set by ``vmin`` and ``vmax``. If they are not set, they are
set to the minimum and maximum values of the array ``arr`` by default.

write_data_to_csv
+++++++++++++++++

:func:`~pywwt.windows.write_data_to_csv` takes a dict of NumPy arrays or lists
of data and writes them to a file in CSV format, which may be read in by
:meth:`~pywwt.windows.WWTWindowsClient.load`::

    particles = {}
    particles["x"] = x
    particles["y"] = y
    particles["z"] = z
    particles["color"] = colors
    write_data_to_csv(particles, "my_particles.csv", mode="new")

The keyword argument ``mode`` may be set to ``"new"`` or ``"append"``.
