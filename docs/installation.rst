Installing pywwt
================

Try without installing
----------------------

You can try out the pywwt Jupyter widget without installing anything locally by
using one of our example notebooks, served from the cloud! `Click here
<https://bit.ly/pywwt-notebooks>`_ to launch our examples using the great
`MyBinder <https://mybinder.org/>`_ service. These notebooks are defined in `the
pywwt-notebooks repository`_ on GitHub, which has further links and information
about these samples.

.. _the pywwt-notebooks repository: https://github.com/WorldWideTelescope/pywwt-notebooks#readme


Install pywwt with conda-forge (recommended)
--------------------------------------------

The recommended way to install pywwt is using the `conda`_ package manager and
packages provided by the `conda-forge`_ project. If you’re already using a
conda-based Python environment, you can install the latest release of pywwt with:

.. code-block:: sh

    conda install -c conda-forge pywwt

.. _conda: https://conda.io/

.. _conda-forge: https://conda-forge.org/

This will install pywwt, its `dependencies`_, and the Jupyter extension. **If
you want to use pywwt inside JupyterLab** — which we heartily recommend — see
`Set Up pywwt’s JupyterLab Integration`_ below.

We recommend that you `permanently enable conda-forge`_ in your Python
environment to ensure that your packages are self-consistent and get the latest
updates. Be advised that activating conda-forge may update a whole bunch of your
software at once, which might be something to avoid right before a proposal
deadline.

.. _permanently enable conda-forge: https://conda-forge.org/docs/user/introduction.html#how-can-i-install-packages-from-conda-forge

If you aren’t using a conda-based Python environment, it’s easy to set one up.
The `Anaconda Distribution <https://www.anaconda.com/products/individual>`_ is
popular and widely supported, or you can use `Miniforge
<https://github.com/conda-forge/miniforge#user-content-install>`_ or `Miniconda
<https://docs.conda.io/en/latest/miniconda.html>`_ for a smaller download. These
environments install in a fully self-contained manner, so you can try them out
without modifying your computer’s existing Python installation(s).


Install pywwt with pip
----------------------

You can also install the latest release of pywwt using `pip
<https://pip.pypa.io/en/stable/>`_:

.. code-block:: sh

    pip install pywwt

While ``pip`` will automatically install most dependencies as needed, to use the
Qt widget you will need to install `PyQt
<https://riverbankcomputing.com/software/pyqt/intro>`_ and `PyQtWebEngine
<https://riverbankcomputing.com/software/pyqtwebengine/intro>`_, or `PySide
<https://wiki.qt.io/PySide>`_ separately. See the full list of dependencies
below.

.. _setup-jupyterlab:

Set Up pywwt’s JupyterLab Integration
-------------------------------------

To use pywwt in an interactive computing environment, we recommend combining it
with `JupyterLab <https://jupyterlab.readthedocs.io/>`_. It’s worth noting that
the JupyterLab web application is a separate thing than just “Jupyter,” the
lower-level system upon which it is built. `Learn how to install JupyterLab here
<https://jupyterlab.readthedocs.io/en/stable/getting_started/installation.html>`_.

Once you’ve installed JupyterLab, you need to install a couple of other
supporting components beyond pywwt to get the best experience: the `WWT Kernel
Data Relay`_ (KDR) extension, the `WWT JupyterLab Extension`_, and the
`JupyterLab widget manager extension`_. The following commands should ensure
that everything is set up:

.. _WWT Kernel Data Relay: https://github.com/WorldWideTelescope/wwt_kernel_data_relay/#readme
.. _WWT JupyterLab Extension: https://github.com/WorldWideTelescope/wwt-jupyterlab#readme
.. _JupyterLab widget manager extension: https://www.npmjs.com/package/@jupyter-widgets/jupyterlab-manager

.. code-block:: sh

    pip install wwt-kernel-data-relay  # or use conda
    jupyter labextension install --no-build @jupyter-widgets/jupyterlab-manager
    jupyter labextension install --no-build @wwtelescope/jupyterlab
    jupyter lab build

If the installation is successful, then the next time you start up JupyterLab
the “Launcher” display should now contain an AAS WorldWide Telescope icon:

.. image:: images/jlab-launcher.jpg
   :scale: 50%
   :alt: Screenshot of JupyterLab launcher with WWT icon
   :align: center

Clicking on this icon should open up the `WWT research app
<https://docs.worldwidetelescope.org/research-app/latest/>`_, which you can then
control using pywwt, via :func:`pywwt.jupyter.connect_to_app`.

.. _setup-jupyter-widget:

Set up the pywwt Jupyter Widget
-------------------------------

If you are using a Jupyter notebook, either within JupyterLab or in “vanilla
“Jupyter, you may also wish to set up pywwt’s “Jupyter widget” support. This
integration *should* be set up automatically if you install pywwt through one of
the standard methods, but it can be somewhat finicky. As with the JupyterLab support,
you should install the `WWT Kernel Data Relay`_ (KDR) extension:

.. code-block:: sh

    pip install wwt-kernel-data-relay  # or use conda

To check whether the widget is working, run the following Python commands inside
of a Jupyter notebook::

    from pywwt.jupyter import WWTJupyterWidget
    wwt = WWTJupyterWidget()
    wwt  # just "print" this variable on its own line

If everything is working, you should see a WWT window open up inside your
notebook, like so:

.. image:: images/jupyter.jpg
   :scale: 25%
   :alt: Screenshot of Jupyter notebook with WWT widget
   :align: center

If you get any other result, some troubleshooting may be necessary.

Troubleshooting the Jupyter Integration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The first thing to check is the “notebook extension”. Run:

.. code-block:: sh

    jupyter nbextension install --py --sys-prefix pywwt
    jupyter nbextension enable --py --sys-prefix pywwt
    jupyter nbextension list

These commands should not report any error messages, and should indicate at the
end that the ``pywwt`` extension is installed, enabled, and validated. The
``ipyevents`` extension should also be available. Unfortunately, if there is a
problem at this stage, there might be a lot of possible reasons. For help, try
`filing an issue on our GitHub
<https://github.com/WorldWideTelescope/pywwt/issues/new>`_ with a copy-paste of
the output from the commands above.

Next are the Jupyter “server extension”s, which are controlled similarly:

.. code-block:: sh

    jupyter serverextension enable --py --sys-prefix pywwt
    jupyter serverextension list

Here too, the commands should report that the ``pywwt`` and
``wwt_kernel_data_relay`` extensions are installed and enabled, without any
apparent errors.

The recommended way to use pywwt inside of JupyterLab (not vanilla Jupyter) is
with the help of the separate `WWT JupyterLab Extension`_:

.. code-block:: sh

    jupyter labextension install --no-build @wwtelescope/jupyterlab
    jupyter labextension list

Finally, if you wish to use the specific combination of the pywwt *widget* (not
app) inside of JupyterLab (not vanilla Jupyter), you may also need to ensure
that pywwt is installed as its own, different, “lab extension”, along with
additional helpers:

.. code-block:: sh

    jupyter labextension install --no-build @jupyter-widgets/jupyterlab-manager
    jupyter labextension install --no-build ipyevents
    jupyter labextension install --no-build pywwt
    jupyter labextension list

If the above commands seem to be OK but report that a “build” is needed, that is
OK:

.. code-block:: sh

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

Besides ``pywwt``, the `WWT Kernel Data Relay`_ server extension and the `WWT
JupyterLab extension`_ are both strongly recommended, but not technically
necessary. If you want to use pywwt as a widget in JupyterLab, the
``@jupyter-widgets/jupyterlab-manager`` and ``ipyevents`` lab-extensions must be
installed and enabled.