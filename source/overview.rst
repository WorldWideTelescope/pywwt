Overview
--------

``pywwt`` is a Python interface for the Microsoft World Wide Telescope
(WWT) Windows client, using the Layer Control API.


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