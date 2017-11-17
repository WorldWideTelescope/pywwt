WorldWideTelescope from Python/Jupyter
======================================

This is a package currently under development which aims to make it easy to use
WorldWideTelescope from Python, including from the Jupyter notebook. Only a very
small subset of functionality is implemented for now, and we will be adding
functionality over the coming weeks.

Installation
------------

conda
^^^^^

If you normally use conda and
just want to try out the latest developer version, you can do this with::

    conda install -c astrofrog/label/dev pywwt-web

This will install a version built in the last 24 hours so may not strictly be
the absolute latest version.

pip
^^^

If you don't use conda and/or want to use the very latest version, you can clone
this repository and install the package manually (note that this requires
`npm <https://www.npmjs.com>`_ to be installed)::

    git clone https://github.com/astrofrog/pywwt-web.git
    cd pywwt-web
    pip install -e .

If you want to use the Jupyter widget, you will also need to run::

    jupyter nbextension install --py --symlink --sys-prefix ipyvolume
    jupyter nbextension enable --py --sys-prefix ipyvolume

(this is not needed if you install the conda package).

Using
-----

Jupyter widget
^^^^^^^^^^^^^^

The Jupyter widget can be used as follows in the Jupyter notebook::

    In [1]: from pywwt_web.jupyter_widget import WWTJupyterWidget

    In [2]: wwt = WWTJupyterWidget()
       ...: wwt

This will then look like:

.. image:: jupyter.png

Reporting issues
----------------

If you run into any issues, please open an issue `here
<https://github.com/astrofrog/pywwt-web/issues>`_
