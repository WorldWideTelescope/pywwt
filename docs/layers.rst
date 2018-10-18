.. _layers:

Adding data layers
==================

While annotations (see :ref:`annotations`) can be used to show specific points
of interest on the sky, data layers are a more general and efficient way of
showing point-based data anywhere in 3D space, including but not limited to
positions on the sky and on/around celestial bodies.

The main layer type at the moment is :class:`~pywwt.layers.TableLayer`. This
layer type can be created using an astropy :class:`~astropy.table.Table` as
well as a coordinate frame, which can be e.g. ``Sky`` or the name of one
of the planets or satellites.

.. TODO: give a more exhaustive list of what can be used as a frame

Points on the sky
