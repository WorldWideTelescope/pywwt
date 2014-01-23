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

Installation
------------

pywwt requires the following packages:

- [NumPy](http://www.numpy.org)
- [Matplotlib](http://matplotlib.org)
- [AstroPy](http://www.astropy.org)
- [Beautiful Soup 4](http://www.crummy.com/software/BeautifulSoup)
- [Requests](http://docs.python-requests.org/en/latest/)
- [Dateutil](http://labix.org/python-dateutil)

To install the library system-wide

    [~]$ python setup.py install

Or, to install locally, use

    [~]$ python setup.py install --prefix=/path/to/location/

Then make sure your Python path points to this location.

On the WWT side, to control the client from a remote host, remote
hosts must be enabled under Settings --> Remote Access Control...

Documentation
-------------

The documentation for pywwt can be found at http://www.jzuhone.com/pywwt.