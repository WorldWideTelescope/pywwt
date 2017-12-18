Using the Jupyter widget
===========================

The Jupyter widget can be used as follows in the Jupyter notebook::

    In [1]: from pywwt.jupyter import WWTJupyterWidget

    In [2]: wwt = WWTJupyterWidget()
       ...: wwt

This will then look like:

.. image:: ../jupyter.png

Once the WorldWide Telescope widget is visible, you can start to interact
with the ``wwt`` object in the next cell of the notebook. You can find out more
about interacting with this object in :doc:`settings` and :doc:`annotations`.
