pywwt Documentation
=================================

``pywwt`` is a Python interface for the Microsoft `World Wide Telescope <http://www.worldwidetelescope.org>`_
(WWT) Windows client, using the
`Layer Control API (LCAPI) <http://www.worldwidetelescope.org/Developers/?LayerControlAPI#load>`_.
The LCAPI provides an interface to WWT's Layer Manager by sending data and information in the form of
strings over HTTP. ``pywwt`` simply provides a Python interface to make these
calls, enabling the control of WWT from scripts or an IPython notebook. Most importantly, it
enables the passing of data created within a Python environment to WWT.

The current version of ``pywwt`` is 0.2.0.

New in version 0.2.0:

- Compatibility with Python 2.7 and 3.4
- All commands now return case-sensitive results
- Fixed a bug where the color parameter was not being passed correctly when creating a new layer
- Attempting to use the ``WWTClient.load`` method when controlling WWT over a network now raises an error. 

Outstanding Issues in version 0.2.0:

- The ``WWTClient.ui_settings`` method does not change anything in the WWT client, apparently due to a bug on the WWT side.

Contents:

.. toctree::
   :maxdepth: 2

   installing
   users_guide
   pywwt_example
   api/pywwt

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

