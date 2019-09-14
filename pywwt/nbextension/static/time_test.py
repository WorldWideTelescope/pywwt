# copy/paste each in segments up to each comment
# make sure you're in the 'static' directory before beginning

# import and set up pywwt the way I usually do
from pywwt.qt import WWTQtClient
from astropy.coordinates import SkyCoord, concatenate
from astropy import units as u
from astropy.table import Table, Column
from astropy.time import Time, TimeDelta
import numpy as np
%gui qt
wwt = WWTQtClient()
wwt.background = wwt.imagery.visible.tycho
wwt.foreground_opacity = 0

# get the table of earthquakes that we'll work with ('japan')
# and the time at which they begin ('start')
%run to_test.py

# whip up some test tables
j2 = japan.copy(); j3 = japan.copy()
j2['time'] = Time(japan['time']).datetime # datetime objs
j3['time'] = [t.isoformat() for t in j2['time']] # iso strings

# change to solar system mode
wwt.set_view('solar system')

# center on Earth after shifting to proper scale
wwt.center_on_coordinates(SkyCoord(0,0,unit=u.deg), fov=.0001 * u.deg)
wwt.solar_system.track_object('Earth')

# add the earthquake layer
jp_lay = wwt.layers.add_table_layer(table=j3, frame='Earth', lon_att='longitude', lat_att='latitude', size_scale=50, color='#ce1141', far_side_visible=True, time_series=True, time_att='time', time_decay=3*u.day)

# rewind time to when the earthquakes took place
wwt.set_current_time(start)# - TimeDelta(1 * u.hr))

# ideally, the points would begin to pop up now

'''
# (addendum, not necessary to copy/paste this section)
# it's also possible to add attributes one at a time if it's useful. e.g.:
jp_lay.lat_att = 'latitude'; jp_lay.time_series=True # etc., etc.
'''
