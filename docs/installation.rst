Installation
============

Try without installing
----------------------

You can try out the pywwt Jupyter widget without installing anything locally
by using one of our example notebooks, served from the cloud! Visit `the
pywwt-notebooks repository`_ on GitHub for quick links to the latest examples.

.. _the pywwt-notebooks repository: https://github.com/WorldWideTelescope/pywwt-notebooks#readme


Installing pywwt with conda (recommended)
-----------------------------------------

If you use the `Anaconda Distribution <https://www.anaconda.com/products/individual>`_
(or `Miniconda <https://docs.conda.io/en/latest/miniconda.html>`_), you can install the latest
release of pywwt using::

    conda install -c wwt pywwt

This will automatically install pywwt, its `dependencies`_, and
will enable the Jupyter extension.

If you want to use WWT inside Jupyter Lab, see `Using Jupyter Lab`_.

Installing pywwt with pip
-------------------------

You can also install the latest release of pywwt using `pip
<https://pip.pypa.io/en/stable/>`_::

    pip install pywwt

If you want to use the Qt widget, you will need to install `PyQt
<https://riverbankcomputing.com/software/pyqt/intro>`_ and `PyQtWebEngine
<https://riverbankcomputing.com/software/pyqtwebengine/intro>`_, or
`PySide <https://wiki.qt.io/PySide>`_ separately.

If you want to use WWT inside Jupyter Lab, see `Using Jupyter Lab`_.

Using Jupyter Lab
-----------------

If you want to use the PyWWT widget inside Jupyter Lab, and you haven't used it
or other widgets before in Jupyter Lab, you may need to also run::

    jupyter labextension install @jupyter-widgets/jupyterlab-manager

In addition, while Jupyter Lab should offer to do a re-build when it detects
a new version of PyWWT, you can also do a build manually with::

    jupyter lab build

Dependencies
------------

If you install pywwt using pip or conda as described above, any required
dependencies will get installed automatically (with the exception of PyQt/PySide
if using pip). For the record, these dependencies are as follows:

* `Python <https://www.python.org>`_ 3.7 or later
* `NumPy <https://numpy.org>`_ 1.9 or later
* `Matplotlib <https://matplotlib.org>`_ 1.5 or later
* `Astropy <https://www.astropy.org>`_ 1.0 or later
* `Requests <https://requests.kennethreitz.org/en/master/>`_
* `Beautiful Soup 4 <https://www.crummy.com/software/BeautifulSoup>`_
* `Dateutil <http://labix.org/python-dateutil>`_
* `lxml <https://lxml.de>`_
* `ipywidgets <https://ipywidgets.readthedocs.io>`_ 7.0.0 or later
* `ipyevents <https://github.com/mwcraig/ipyevents>`_
* `traitlets <https://traitlets.readthedocs.io>`_
* `reproject <https://reproject.readthedocs.io/>`_
* `pytz <https://pythonhosted.org/pytz>`_

In addition, if you want to use the Qt widget, you will need:

* `PySide <https://wiki.qt.io/PySide>`__ or `PyQt
  <https://riverbankcomputing.com/software/pyqt/intro>`__ and `PyQtWebEngine
  <https://riverbankcomputing.com/software/pyqtwebengine/intro>`__ (both PyQt4
  and PyQt5 are supported)
* `QtPy <https://pypi.org/project/QtPy/>`__ 1.2 or later
* `tornado <https://www.tornadoweb.org/en/stable/>`_

For the Jupyter widget, you will need:

* `Jupyter <https://jupyter.org/>`__ 1.0.0 or later
* `notebook <https://jupyter-notebook.readthedocs.io/en/stable/>`__ 5.0.0 or later

Installing the developer version
--------------------------------

If you want to use the very latest developer version version, you can clone
this repository and install the package manually (note that this requires `npm
<https://www.npmjs.com>`_ to be installed)::

    git clone https://github.com/WorldWideTelescope/pywwt.git
    cd pywwt
    pip install -e .

If you want to use the Jupyter widget, you will also need to run::

    jupyter nbextension install --py --symlink --sys-prefix pywwt
    jupyter nbextension enable --py --sys-prefix pywwt
    jupyter nbextension list  # check that the output shows pywwt as enabled and OK
    jupyter serverextension enable --py --sys-prefix pywwt
    jupyter serverextension list  # check that the output shows pywwt as enabled and OK

And if you additionally want to use the widget in JupyterLab, run::

    jupyter labextension install frontend
    jupyter labextension list  # check that the output shows pywwt as enabled and OK

Besides ``pywwt``, the ``@jupyter-widgets/jupyterlab-manager`` and
``ipyevents`` lab-extensions must be installed and enabled.

If you use conda, you can alternatively install a recent developer version
using::

    conda install -c conda-forge -c wwt/label/dev pywwt

This will install a version built in the last 24 hours so may not strictly be
the absolute latest version in some cases.
