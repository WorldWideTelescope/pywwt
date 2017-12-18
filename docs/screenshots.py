from astropy.coordinates import concatenate, SkyCoord

# open widget, render at end of each section
wwt = WWTQtClient(size=(600,400))

# big_dipper.png
bd = concatenate((SkyCoord.from_name('Alkaid'), SkyCoord.from_name('Mizar'),
                  SkyCoord.from_name('Alioth'), SkyCoord.from_name('Megrez'),
                  SkyCoord.from_name('Phecda'), SkyCoord.from_name('Merak'),
                  SkyCoord.from_name('Dubhe')))
wwt.center_on_coordinates(SkyCoord.from_name('Megrez'))
       
line = wwt.add_line(bd, width=3 * u.pixel)
wwt.render('big_dipper.png')

# big_dipper2.png
line.add_point(SkyCoord.from_name('Megrez'))
line.color = 'salmon'
wwt.render('big_dipper2.png')

# polygon.png
wwt.center_on_coordinates(SkyCoord.from_name('eta orion'))

body = concatenate((SkyCoord.from_name('zeta orion'),SkyCoord.from_name('betelgeuse'),SkyCoord.from_name('bellatrix'),SkyCoord.from_name('delta orion')))
club = concatenate((SkyCoord.from_name('xi orionis'),SkyCoord.from_name('chi2 orionis'),SkyCoord.from_name('chi1 orionis'),SkyCoord.from_name('67 orionis')))
head = concatenate((SkyCoord.from_name('betelgeuse'),SkyCoord.from_name('lambda orion'),SkyCoord.from_name('bellatrix')))
bow = concatenate((SkyCoord.from_name('omicron2 orionis'),SkyCoord.from_name('pi2 orionis'),SkyCoord.from_name('pi3 orionis'),SkyCoord.from_name('pi4 orionis'),SkyCoord.from_name('pi5 orionis')))

a1 = concatenate((SkyCoord.from_name('betelgeuse'),
                  SkyCoord.from_name('xi orionis')))
a2 = concatenate((SkyCoord.from_name('bellatrix'),
                  SkyCoord.from_name('pi3 orionis')))
l1 = concatenate((SkyCoord.from_name('zeta orionis'),
                  SkyCoord.from_name('kappa orionis')))
l2 = concatenate((SkyCoord.from_name('delta orionis'),SkyCoord.from_name('eta orionis'),SkyCoord.from_name('rigel')))
blt = concatenate((SkyCoord.from_name('zeta orionis'),
                    SkyCoord.from_name('delta orionis')))
string = concatenate((SkyCoord.from_name('omicron2 orionis'),
                      SkyCoord.from_name('pi5 orionis')))

orb = wwt.add_polygon(body, fill=True, fill_color='lightslategray',
                      line_color='lightslategray', line_width=3*u.pixel)
orc = wwt.add_polygon(club, fill=True, fill_color='saddlebrown',
                      line_color ='saddlebrown', line_width=3 * u.pixel)
orh = wwt.add_polygon(head, fill=True, fill_color='rosybrown',
                      line_color='lightslategray', line_width=2*u.pixel)
orw = wwt.add_polygon(bow, line_width=2*u.pixel, line_color='saddlebrown')

ora1 = wwt.add_line(a1, color='lightslategray')
ora2 = wwt.add_line(a2, color='lightslategray')
orl1 = wwt.add_line(l1, color='lightslategray', width=2*u.pixel)
orl2 = wwt.add_line(l2, color='lightslategray', width=2*u.pixel)
orblt = wwt.add_line(blt, color='azure', width=8*u.pixel)
orstr = wwt.add_line(string, color='azure')

wwt.render('polygon.png')

# circles.png
wwt.center_on_coordinates(SkyCoord(190, -55, unit=u.deg))
crc1 = wwt.add_circle(SkyCoord(188, -57, unit=u.deg), radius=10 * u.degree,
                      fill=True, fill_color='#008CA8')
crc2 = wwt.add_circle(radius=10 * u.pixel, opacity=.4,
                      fill=True, fill_color='#C4D600')
wwt.render('circles.png')

# stgo_view.png
wwt.constellation_boundaries = True
wwt.constellation_figures = True
wwt.constellation_boundary_color = 'azure'
wwt.constellation_figure_color = '#D3BC8D'
wwt.constellation_selection_color = (1, 0, 1)
wwt.local_horizon_mode = True
wwt.location_latitude = -33.4172 * u.deg
wwt.location_longitude = -70.604 * u.deg
wwt.location_altitude = 300 * u.meter
wwt.render('stgo_view.png')

# dust_on_gamma.png
wwt.clear_annotations()
wwt.constellation_boundaries = False
wwt.constellation_figures = False
wwt.local_horizon_mode = False
wwt.crosshairs = False

wwt.center_on_coordinates(SkyCoord(144.545, -68.5, unit=u.deg))
wwt.background = 'Fermi LAT 8-year (gamma)'
wwt.foreground = 'Planck Dust & Gas'
wwt.foreground_opacity = .75
wwt.render('dust_on_gamma.png')
