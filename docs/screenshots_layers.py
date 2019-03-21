from pywwt.qt import WWTQtClient
from astropy import units as u
from astropy.coordinates import concatenate, SkyCoord

from astropy.table import Table

wwt = WWTQtClient(size=(600,400), block_until_ready=True)

OEC = 'https://worldwidetelescope.github.io/pywwt/data/open_exoplanet_catalogue.csv'
table = Table.read(OEC, delimiter=',', format='ascii.basic')

layer = wwt.layers.add_table_layer(table=table, frame='Sky',
                                  lon_att='ra', lat_att='dec', lon_unit='deg')

layer.size_scale = 50

kepler = SkyCoord(76.532562, 13.289502, unit='deg', frame='galactic')
wwt.center_on_coordinates(kepler, fov=40 * u.deg)

wwt.wait(3)

wwt.render('images/data_layers_kepler.png')

layer.remove()

wwt.set_view('solar system')

wwt.wait(5)

wwt.solar_system.track_object('Earth')

wwt.wait(10)


EARTHQUAKES = 'https://worldwidetelescope.github.io/pywwt/data/earthquakes_2010.csv'
table = Table.read(EARTHQUAKES, delimiter=',', format='ascii.basic')

layer = wwt.layers.add_table_layer(table=table, frame='Earth',
                                  lon_att='longitude', lat_att='latitude')

wwt.wait(3)

wwt.render('images/data_layers_earthquakes.png')

wwt.wait()

# layer.lon_att = 'longitude'
#
# layer.alt_att = 'depth'
