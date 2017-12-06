Using the Qt widget
===================

To use the Qt widget, start up an IPython session and do:

.. code-block:: python

    In [1]: from pywwt.qt_widget import WWTQtWidget

    In [2]: %gui qt

    In [3]: wwt = WWTQtWidget()

(note that the order is important - for now ``WWTQtWidget`` has to be imported before ``%gui qt`` is run).
