pywwt: Python Interface to World Wide Telescope
================================================

- Author: John ZuHone <jzuhone@gmail.com>
- License: BSD 3-clause

pywwt provides an interface to the
[Microsoft World Wide Telescope](http://www.worldwidetelescope.org)
(WWT) client for Windows, using the
[Layer Control API](http://www.worldwidetelescope.org/Developers/?LayerControlAPI).
It enables control of the view, layers, and settings of WWT from Python, whether
running on the same host or from another host. Event data can be passed to
layers in the WWT client directly from memory or by loading from a file. It also
provides a set of tools to facilitate importing data into WWT.

New in version 0.2.0:

- Compatibility with Python 2.7 and 3.4
- All commands now return case-sensitive results
- Fixed a bug where the color parameter was not being passed correctly when creating a new layer
- Attempting to use the ``WWTClient.load`` method when controlling WWT over a network now raises an error.

Outstanding Issues in version 0.2.0:

- The ``WWTClient.ui_settings`` method does not change anything in the WWT client, apparently due to a bug on the WWT side.

Installation
------------

pywwt is compatible with Python 2.7 or 3.4, and requires the following Python packages:

- [NumPy](http://www.numpy.org)
- [Matplotlib](http://matplotlib.org)
- [AstroPy](http://www.astropy.org)
- [Beautiful Soup 4](http://www.crummy.com/software/BeautifulSoup)
- [Requests](http://docs.python-requests.org/en/latest/)
- [Dateutil](http://labix.org/python-dateutil)
- [lxml](http://lxml.de)

pywwt can be installed using pip. pip will attempt to download the dependencies and
install them, if they are not already installed in your Python distribution. For an easy
installation of the dependencies, using a Python package distribution is recommended. For
example, using the [Anaconda Python Distribution](https://store.continuum.io/cshop/anaconda):

    [~]$ conda install setuptools numpy matplotlib astropy beautiful-soup requests dateutil lxml

Once you have all of the dependencies, install ``pywwt`` using pip:

    [~]$ pip install pywwt

Or, to install into your Python distribution from source:

    [~]$ python setup.py install

Or, to install to a local directory, use:

    [~]$ python setup.py install --prefix=/path/to/location/

Then make sure your `PYTHONPATH` points to this location.

On the WWT side, to control the client from a remote host, remote
hosts must be enabled under `Settings --> Remote Access Control...`

Documentation
-------------

The documentation for pywwt can be found at http://hea-www.cfa.harvard.edu/~jzuhone/pywwt.
