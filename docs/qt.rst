Using the Qt widget
===================

IPython
-------

To use the Qt viewer from an IPython session, do::

    In [1]: from pywwt.qt import WWTQtClient

    In [2]: %gui qt

    In [3]: wwt = WWTQtClient()

Note that the order is important - for now :class:`pywwt.qt.WWTQtClient` has to 
be imported before ``%gui qt`` is run. Once the AAS WorldWide Telescope viewer is
visible, you can start to interact with the ``wwt`` object in the next cell of
the notebook. You can find out more about interacting with this object in
:doc:`settings` and :doc:`annotations`.

.. note:: The :class:`pywwt.qt.WWTQtClient` class is not the Qt widget itself 
          but an object that opens the widget and allows you to control the WWT
          settings. If you need access to the underlying widget, see the
          `Embedding`_ section.

Script
------

You can also start the widget from a script, in which case the ``%gui qt`` is
not necessary::

    from pywwt.qt import WWTQtClient
    wwt = WWTQtClient()

The :class:`pywwt.qt.WWTQtClient` class takes a ``block_until_ready`` argument
which can be used to tell Python to wait for AAS WorldWide Telescope to be open
before proceeding with the rest of the script::

    wwt = WWTQtClient(block_until_ready=True)

Furthermore, by default WorldWide Telescope will close once Python reaches the
end of the script. If you want to prevent this from happening, add the following
extra line at the end of your script::

    wwt.wait()

This will cause the script to pause until the WorldWide Telescope window is
closed. You can find out more about interacting with the ``wwt`` object in
:doc:`settings` and :doc:`annotations`.

Embedding
---------

If you are developing a Qt Application, you can embed the AAS WorldWide Telescope
Qt widget by creating an instance of the :class:`pywwt.qt.WWTQtClient` class, 
then accessing the underlying Qt widget using the ``widget`` attribute::

    from pywwt.qt import WWTQtClient
    wwt_client = WWTQtClient()
    wwt_client.widget  # refers to the Qt widget

The Qt widget can then be added to any layout in your application.
