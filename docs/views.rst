Switching views
===============

New in release 0.4.0 is the ability to toggle between modes in the same manner 
as in the WorldWide Telescope Web Client by using the ``set_view`` method. 
Available modes include sky, planet, solar system, Milky Way, universe, and 
panorama. The rest of the documentation is based on the default sky mode, so 
here we discuss what makes the others different.

Planet view
-----------
Use this mode to get individual views of most of the major objects in the solar 
system -- the Sun, the planets, Pluto, Earth's Moon, and Jupiter's Galilean 
satellites. To use this mode, enter the name of your desired object as the 
argument for ``set_view``::

    >>> wwt.set_view('Moon')
    
Once you've done that, your view should resemble the following:

.. image:: images/moon_view.png

Solar system, Milky Way, and Universe views
-------------------------------------------

These three views come from the same mode at different field-of-view levels.

**Solar system**
This mode displays all objects that orbit the Sun. To access it, enter::

    >>> wwt.set_view('solar_system')

All attributes and methods of solar system mode are housed within the widget's 
``solar_system`` object so they're easier to find. Like the sky view, it's 
possible to edit this view to your liking. For example, orbit paths are shown 
by default, but if you would like to turn them off, use the ``orbits`` 
attribute::

    >> wwt.solar_system.orbits = False
    
The objects themselves can also be hidden using a similar technique. Another 
useful attribute, ``scale``, enables you to change the size of the major 
objects on a scale from 1 (actual size) to 100. We plan to reveal more options
soon to match those currently present in the Web Client.

This mode also comes with its own method, ``track_object``, that centers the 
viewer on a major solar system object of your choice as it both rotates and 
follows its orbital path::
    
    >> wwt.solar_system.track_object('Jupiter')

.. note::   ``track_object`` is similar in spirit and syntax to planet view, 
            but they are not the same. The former exists within the context of 
            the whole solar system, so if you choose to track Jupiter as above, 
            you'll see its moons in orbit, the Sun in the distance, and the 
            stars and Milky Way as the backdrop. Planet view displays the 
            object in question and nothing else.

**Milky Way**
The Milky Way view changes the scale of the view such that all of the galaxy is 
visible:

.. image:: images/milky_way.png

It can be used as a base point for exploration of galaxies. Access it by 
entering::

    >>> wwt.set_view('Moon')

**Universe**
The Universe view zooms all the way out to the extent of the observed universe:

.. image:: images/universe.png

.. note:: If you're ever lost inside a mode, the ``reset_view`` method 
          backtracks to the mode's initial state and allows you to start your
          exploration over again.

Panorama view
-------------
**Keep or no?**
Finally, this view provides 360-degree panoramas taken during various NASA 
missions to Mars and the Moon. (...)