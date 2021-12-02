WWT's JupyterLab application
============================

To use WWT in an interactive Python environment, we *strongly* recommend
combining it with `JupyterLab <https://jupyterlab.readthedocs.io/>`_ using WWT's
"research app". It’s worth noting that the JupyterLab web application is a
separate thing than just “Jupyter,” the lower-level system upon which it is
built. `Learn how to set up pywwt's JupyerLab integration JupyterLab here
<installation>`_.

Once the ingration is set up, then the next time you start up JupyterLab the
“Launcher” display should now contain an AAS WorldWide Telescope icon:

.. image:: images/jlab-launcher.jpg
   :scale: 50%
   :alt: Screenshot of JupyterLab launcher with WWT icon
   :align: center

Clicking on this icon should open up the `WWT research app
<https://docs.worldwidetelescope.org/research-app/latest/>`_, which you can then
control using pywwt, via :func:`pywwt.jupyter.connect_to_app`.
