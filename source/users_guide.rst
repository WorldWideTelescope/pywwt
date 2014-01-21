User's Guide
------------

``pywwt`` is a Python interface for the Microsoft `World Wide Telescope <http://www.worldwidetelescope.org>`_
(WWT) Windows client, using the
`Layer Control API (LCAPI) <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#load>`_


To use ``pywwt`` from Python, first import its modules:

.. code-block:: python

    from pywwt.mods import *

Connecting to a WWT Client
~~~~~~~~~~~~~~~~~~~~~~~~~~

Connecting to a running WWT client on the current host is as simple as:

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

    Some tasks require loading files from disk. In this case, if the current ``WWTClient``
    instance and the WWT client itself are not running on the same host, they must have
    access to a common filesystem from which the files may be loaded.

Working with Layers
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The heart of ``pywwt`` (and the LCAPI) is the interaction with WWT's Layer Manager. There
are three ways to create new layers from a ``WWTClient`` instance.

You can use the ``load`` method to generate a new layer with data uploaded from a file:

.. code-block:: python

    my_layer = WWTClient.load("particles.csv")

where the file in this case is a CSV file with values separated by commas or tabs.

`LCAPI Reference: Load <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#load>`_

Other Commands
~~~~~~~~~~~~~~

Standard Keyword Arguments
~~~~~~~~~~~~~~~~~~~~~~~~~~

Many of the ``pywwt`` methods take a standard set of keyword arguments that may be applied
along with that method's particular arguments.


`LCAPI Reference: General Parameters <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#general_parameters>`_