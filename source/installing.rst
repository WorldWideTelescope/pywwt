Installing ``pywwt``
----------------

``pywwt`` requires the following packages:

- `NumPy <http://www.numpy.org>`_
- `Matplotlib <http://matplotlib.org>`_
- `AstroPy <http://www.astropy.org>`_
- `Beautiful Soup 4 <http://www.crummy.com/software/BeautifulSoup>`_
- `Requests <http://docs.python-requests.org/en/latest/>`_
- `Dateutil <http://labix.org/python-dateutil>`_

To install the library system-wide

.. code-block:: bash

    [~]$ python setup.py install

Or, to install locally, use

.. code-block:: bash

    [~]$ python setup.py install --prefix=/path/to/location/

Then make sure your ``PYTHONPATH`` points to this location.

On the WWT side, to control the client from a remote host, remote
hosts must be enabled under ``Settings --> Remote Access Control...``
