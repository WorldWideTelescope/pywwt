Running tours
=============

Also present are methods that allow you to load, pause, and resume tours from
the WWT website. To load and play a tour, use the
:meth:`~pywwt.BaseWWTWidget.load_tour` method::

    >>> wwt.load_tour('http://www.worldwidetelescope.org/docs/wtml/tourone.wtt')

You can pause and resume it using the
:meth:`~pywwt.BaseWWTWidget.pause_tour` and
:meth:`~pywwt.BaseWWTWidget.resume_tour` methods.
