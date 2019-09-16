from astropy.table import Table, Column
from astropy.time import Time, TimeDelta
import numpy as np
from io import StringIO
from base64 import b64encode

# download earthquake table
EARTHQUAKES = 'https://worldwidetelescope.github.io/pywwt/data/earthquakes_2010.csv'
q_table = Table.read(EARTHQUAKES, delimiter=',', format='ascii.basic')

# slice earthquake times to include only those in January, 
# then compress times so they all happen in a ten second period
jan =  q_table[np.where(Time(q_table['time']).jd < Time('2010-01-15', format='iso').jd)]
factor = 20/(31*24*60*60)
start = Time('2010-01-01', format='iso')
for i, val in enumerate(jan['time']):
    new = start.jd + (Time(val) - start).jd * factor
    jan['time'][i] = Time(new, format='jd').iso

# slice locations to the area around japan
lons = np.intersect1d(np.where(jan['longitude'] > 135)[0], np.where(jan['longitude'] < 165)[0])
lats = np.intersect1d(np.where(jan['latitude'] > 15)[0], np.where(jan['latitude'] < 45)[0])
japan = jan[np.intersect1d(lons, lats)]
japan.remove_column('place') # causes parsing issues in Qt

'''
# translate table to b64 for use in JS when working directly with the SDK
s = StringIO()
japan.write(s, format='ascii.basic', delimiter=',', comment=False)
s.seek(0)
csv = s.read().replace('\n','\r\n')
enc = b64encode(csv.encode('ascii', errors='replace')).decode('ascii')
'''
