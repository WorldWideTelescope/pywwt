Installation
============

conda
-----

If you normally use conda and just want to try out the latest developer version,
you can do this with::

    conda install -c conda-forge -c astrofrog/label/dev pywwt

This will install a version built in the last 24 hours so may not strictly be
the absolute latest version.

pip
---

If you don't use conda and/or want to use the very latest version, you can clone
this repository and install the package manually (note that this requires `npm
<https://www.npmjs.com>`_ to be installed)::

    git clone https://github.com/WorldWideTelescope/pywwt.git
    cd pywwt
    pip install -e .

If you want to use the Jupyter widget, you will also need to run::

    jupyter nbextension install --py --symlink --sys-prefix pywwt
    jupyter nbextension enable --py --sys-prefix pywwt
