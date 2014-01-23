Installing ``pywwt``
--------------------

``pywwt`` requires the following packages:

- `NumPy <http://www.numpy.org>`_
- `Matplotlib <http://matplotlib.org>`_
- `AstroPy <http://www.astropy.org>`_
- `Beautiful Soup 4 <http://www.crummy.com/software/BeautifulSoup>`_
- `Requests <http://docs.python-requests.org/en/latest/>`_
- `Dateutil <http://labix.org/python-dateutil>`_

``pywwt`` can be installed from pip:

.. code-block:: bash

    [~]$ pip install pywwt

Or, to install the library system-wide from `source <http://github.com/jzuhone/pywwt>`_:

.. code-block:: bash

    [~]$ python setup.py install

Or, to install locally, use:

.. code-block:: bash

    [~]$ python setup.py install --prefix=/path/to/location/

Then make sure your ``PYTHONPATH`` points to this location.

On the WWT side, to control the client from a remote host, remote
hosts must be enabled under ``Settings --> Remote Access Control...``
