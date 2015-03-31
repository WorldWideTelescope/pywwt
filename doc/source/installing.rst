Installing ``pywwt``
--------------------

``pywwt`` is compatible with Python 2.7 or 3.4, and requires the following Python packages:

- `NumPy <http://www.numpy.org>`_
- `Matplotlib <http://matplotlib.org>`_
- `AstroPy <http://www.astropy.org>`_
- `Beautiful Soup 4 <http://www.crummy.com/software/BeautifulSoup>`_
- `Requests <http://docs.python-requests.org/en/latest/>`_
- `Dateutil <http://labix.org/python-dateutil>`_
- `lxml <http://lxml.de>`_

``pywwt`` can be installed using pip. pip will attempt to download the dependencies and 
 install them, if they are not already installed in your Python distribution. For an easy
 installation of the dependencies, using a Python package distribution is recommended. For
 example, using the `Anaconda Python Distribution <https://store.continuum.io/cshop/anaconda/>`_:
  
.. code-block:: bash

    [~]$ conda install setuptools numpy matplotlib astropy beautiful-soup requests dateutil lxml

Once you have all of the dependencies, install ``pywwt`` using pip:

.. code-block:: bash

    [~]$ pip install pywwt

Or, to install into your Python distribution from `source <http://github.com/jzuhone/pywwt>`_:

.. code-block:: bash

    [~]$ python setup.py install

Or, to install to a local directory, use:

.. code-block:: bash

    [~]$ python setup.py install --prefix=/path/to/location/

Then make sure your ``PYTHONPATH`` points to this location.

On the WWT side, to control the client from a remote host, remote
hosts must be enabled under ``Settings --> Remote Access Control...``
