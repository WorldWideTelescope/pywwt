.. _shortcuts:

Keyboard shortcuts
==================

In both the Qt and Jupyter widgets for WWT, viewer navigation with the mouse
follows typical conventions -- click and drag up or down to move vertically;
click and drag left or right to move horizontally; mouse wheel or
pinch/two-finger scroll on a touchpad to zoom.

In the Qt widget (and the Jupyter widget in some browsers), it is also possible
to navigate the viewer via keyboard shortcuts that are further explained below.
 

Basic movements
---------------

Imagining that the viewer's movements correspond with `an aircraft's principal
axes of rotation <https://en.wikipedia.org/wiki/Aircraft_principal_axes>`_, you
can perform two of the basic movements with the following keys:

.. list-table::
   :widths: auto

   * - ``j`` or ``l``
     - yaw
   * - ``i`` or ``k``
     - pitch

To zoom, use:

.. list-table::
   :widths: auto

   * - ``z``
     - zoom in
   * - ``x``
     - zoom out

Modified movements
------------------

Use ``alt`` in combination with the directional keys to unlock more axes of
movement:

.. list-table::
   :widths: auto

   * - ``alt`` + ``j`` or ``l``
     - roll
   * - ``alt`` + ``i`` or ``k``
     - tilt vertically (individual planet modes only)

Finally, adding ``shift`` to any of the above keys or combinations acts as a
fine adjustment switch, performing the original action more slowly. For example,
``shift`` + ``z`` zooms in at a slower pace, and ``shift`` + ``alt`` + ``j``
gives you a slower roll motion.
