# copy/paste each in segments up to each comment
# make sure you're in the 'static' directory before beginning

# import and set up pywwt the way I usually do
from pywwt.qt import WWTQtClient
from astropy.coordinates import SkyCoord, concatenate
from astropy import units as u
from astropy.table import Table, Column
from astropy.time import Time, TimeDelta
from datetime import datetime
import numpy as np
import pytz
%gui qt
wwt = WWTQtClient()
wwt.background = wwt.imagery.visible.tycho
wwt.foreground_opacity = 0

# get the table of earthquakes that we'll work with ('japan')
# and the time at which they begin ('start')
%run to_test.py

# whip up some test tables
j1 = japan.copy(); j20 = japan.copy(); j21 = japan.copy()
j22 = japan.copy(); j3 = japan.copy()

j1['time'] = Time(japan['time']) # astropy Times
j20['time'] = [t.datetime for t in j1['time']] # unaware datetimes
j21['time'] = [pytz.utc.localize(t) for t in j20['time']] # UTC datetimes
j22['time'] = [t.astimezone(pytz.timezone('America/Santiago'))
               for t in j21['time']] # non-UTC datetimes
j3['time'] = [t.isoformat() for t in j20['time']] # iso strings

# change to solar system mode
wwt.set_view('solar system')

# center on Earth after shifting to proper scale
wwt.center_on_coordinates(SkyCoord(0,0,unit=u.deg), fov=.0001 * u.deg)
wwt.solar_system.track_object('Earth')

# add the earthquake layer
jp_lay = wwt.layers.add_table_layer(table=j3, frame='Earth', lon_att='longitude', lat_att='latitude', size_scale=50, color='#ce1141', far_side_visible=True, time_series=True, time_att='time', time_decay=3*u.second)

# rewind time to when the earthquakes took place
wwt.set_current_time(start)

# ideally, the points would begin to pop up now.
# if successful, remove jp_lay and test with the other jX test tables

'''
# (addendum, not necessary to copy/paste this section)
# it's also possible to add attributes one at a time if it's useful. e.g.:
jp_lay.lat_att = 'latitude'; jp_lay.time_series=True # etc., etc.
'''
