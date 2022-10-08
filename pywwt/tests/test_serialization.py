import pytest

from ..core import BaseWWTWidget
from ..layers import SIZE_COLUMN_NAME, CMAP_COLUMN_NAME

import numpy as np
import os
import tempfile

from astropy.wcs import WCS
from astropy.table import Table
from astropy import units as u
from astropy.coordinates import SkyCoord

DEGREES_TO_HOURS = 1. / 15.
STARDARD_WWT_SETTINGS = ['actualPlanetScale', 'showAltAzGrid', 'showConstellationBoundries', 'constellationBoundryColor',
                         'constellationFigureColor', 'showConstellationFigures', 'showConstellationSelection',
                         'constellationSelectionColor', 'showCrosshairs', 'crosshairsColor', 'showEcliptic',
                         'showEclipticGrid', 'showGalacticGrid', 'galacticMode', 'showGrid', 'localHorizonMode',
                         'locationAltitude', 'locationLat', 'locationLng']


class MockWWTWidget(BaseWWTWidget):
    """
    Mock class so that we test serialization without instantiating an actual widget
    """

    def quick_serialize(self):
        return self._serialize_state(None, None, None)

    def _get_view_data(self, field):
        mock_vals = {'ra': 5. * DEGREES_TO_HOURS, 'dec': 10., 'fov': 15.}
        return mock_vals[field]

    def _serve_file(self, filename, extension=''):
        return filename

    def smoketest_bundling(self):
        dest = tempfile.NamedTemporaryFile(suffix='.zip', delete=False)
        dest.close()
        self.save_as_html_bundle(dest.name)
        os.unlink(dest.name)


def test_basic_serialization():
    widget = MockWWTWidget()
    test_state = widget._serialize_state('Title', 100, 200)
    assert test_state

    assert 'wwt_settings' in test_state

    assert 'html_settings' in test_state
    page_settings = test_state['html_settings']
    assert page_settings['title'] == 'Title'
    assert page_settings['max_width'] == 100
    assert page_settings['max_height'] == 200

    assert 'view_settings' in test_state
    view_settings = test_state['view_settings']
    assert view_settings['mode'] == 'sky'
    assert view_settings['ra'] == pytest.approx(5.)  # Behind the scenes unit conversion
    assert view_settings['dec'] == 10.
    assert view_settings['fov'] == 15.

    assert 'foreground_settings' in test_state
    foreground_settings = test_state['foreground_settings']
    assert 'foreground' in foreground_settings
    assert 'background' in foreground_settings
    assert 'foreground_alpha' in foreground_settings

    assert 'layers' in test_state
    assert test_state['layers'] == []

    assert 'annotations' in test_state
    assert test_state['annotations'] == []

    widget.smoketest_bundling()


def test_widget_settings_serialization():
    widget = MockWWTWidget()
    widget.actual_planet_scale = True
    widget.alt_az_grid = False
    widget.constellation_boundaries = True
    widget.constellation_boundary_color = 'red'
    widget.constellation_figure_color = '#24680b'
    widget.constellation_figures = False
    widget.constellation_selection = True
    widget.constellation_selection_color = 'c'  # cyan
    widget.crosshairs = True
    widget.crosshairs_color = (128./255., 64./255., 16./255.)
    widget.ecliptic = False
    widget.ecliptic_grid = True
    widget.galactic_grid = False
    widget.galactic_mode = True
    widget.grid = False
    widget.local_horizon_mode = True
    widget.location_altitude = 7*u.m
    widget.location_latitude = 12*u.deg
    widget.location_longitude = -18*u.deg
    expected_settings = {'actualPlanetScale': True,
                         'showAltAzGrid': False,
                         'showConstellationBoundries': True,
                         'constellationBoundryColor': '#ff0000',
                         'constellationFigureColor': '#24680b',
                         'showConstellationFigures': False,
                         'showConstellationSelection': True,
                         'constellationSelectionColor': '#00bfbf',
                         'showCrosshairs': True,
                         'crosshairsColor': '#804010',
                         'showEcliptic': False,
                         'showEclipticGrid': True,
                         'showGalacticGrid': False,
                         'galacticMode': True,
                         'showGrid': False,
                         'localHorizonMode': True,
                         'locationAltitude': 7,
                         'locationLat': 12.,
                         'locationLng': -18.}
    state = widget.quick_serialize()
    assert state['wwt_settings'] == expected_settings

    widget.smoketest_bundling()


def test_mode_serialization():
    view_mode_map = {'sky': 'sky',
                     'Sun': 'sun',
                     'Mercury': 'mercury',
                     'venus': 'venus',
                     'Earth': 'Bing Maps Aerial',
                     'moon': 'moon',
                     'mars': 'Visible Imagery',
                     'jupiter': 'jupiter',
                     'callisto': 'callisto',
                     'europa': 'europa',
                     'ganymede': 'ganymede',
                     'Io': 'io',
                     'saturn': 'saturn',
                     'Uranus': 'uranus',
                     'neptune': 'neptune',
                     'Pluto': 'pluto',
                     'panorama': 'panorama',
                     'Solar System': '3D Solar System View',
                     'milky way': '3D Solar System View',
                     'universe': '3D Solar System View'}

    widget = MockWWTWidget()
    for in_mode, out_mode in view_mode_map.items():
        widget.set_view(in_mode)
        assert widget.quick_serialize()['view_settings']['mode'] == out_mode, \
            'Mismatch for requested mode: {0}'.format(in_mode)

    widget.smoketest_bundling()


def test_3d_serialization():
    widget = MockWWTWidget()
    widget.set_view('milky way')
    widget.solar_system.cosmos = True
    widget.solar_system.lighting = False
    widget.solar_system.milky_way = True
    widget.solar_system.minor_orbits = False
    widget.solar_system.orbits = True
    widget.solar_system.objects = False
    widget.solar_system.scale = 8
    widget.solar_system.stars = True

    expected_3d_settings = {'solarSystemCosmos': True,
                            'solarSystemLighting': False,
                            'solarSystemMilkyWay': True,
                            'solarSystemMinorOrbits': False,
                            'solarSystemOrbits': True,
                            'solarSystemPlanets': False,
                            'solarSystemScale': 8,
                            'solarSystemStars': True}

    init_state = widget.quick_serialize()
    settings = init_state['wwt_settings']
    assert len(settings) == len(STARDARD_WWT_SETTINGS) + len(expected_3d_settings)
    for name, value in expected_3d_settings.items():
        assert name in settings
        assert value == settings[name], 'Mismatch for setting {0}'.format(name)

    assert 'tracked_object_id' in init_state['view_settings']
    assert init_state['view_settings']['tracked_object_id'] == 0

    track_id_map = {'sun': 0,
                    'mercury': 1,
                    'venus': 2,
                    'mars': 3,
                    'jupiter': 4,
                    'saturn': 5,
                    'uranus': 6,
                    'neptune': 7,
                    'pluto': 8,
                    'moon': 9,
                    'io': 10,
                    'europa': 11,
                    'ganymede': 12,
                    'callisto': 13,
                    'ioshadow': 14,
                    'europashadow': 15,
                    'ganymedeshadow': 16,
                    'callistoshadow': 17,
                    'suneclipsed': 18,
                    'earth': 19}

    for obj_name, obj_id in track_id_map.items():
        widget.solar_system.track_object(obj_name)
        assert widget.quick_serialize()['view_settings']['tracked_object_id'] == obj_id, \
            "ID mismatch for {0}".format(obj_name)

    widget.smoketest_bundling()


def test_add_remove_annotation_serialization():
    widget = MockWWTWidget()
    circ = widget.add_circle()
    poly = widget.add_polygon()
    line = widget.add_line()
    state = widget.quick_serialize()
    assert len(state['annotations']) == 3
    for annotation in state['annotations']:
        assert annotation['id'] in [circ.id, poly.id, line.id]

    circ.remove()
    state = widget.quick_serialize()
    assert len(state['annotations']) == 2
    for annotation in state['annotations']:
        assert annotation['id'] in [poly.id, line.id]

    widget.clear_annotations()
    state = widget.quick_serialize()
    assert len(state['annotations']) == 0

    widget.smoketest_bundling()


def test_circle_annotation_serialization():
    widget = MockWWTWidget()
    circ = widget.add_circle(fill_color='#012345', radius=0.3*u.deg)
    circ.set_center(SkyCoord(0.1 * u.deg, 0.2 * u.deg))
    circ.fill = True
    circ.tag = 'Test Circ Tag'
    circ.line_color = 'orange'
    circ.line_width = 5*u.pix
    circ.opacity = 0.7
    circ.label = 'Test Circ Label'
    circ.hover_label = True
    expected_settings = {'radius': 0.3,
                         'fill': True,
                         'tag': 'Test Circ Tag',
                         'fillColor': '#012345',
                         'lineColor': '#ffa500',
                         'lineWidth': 5,
                         'opacity': 0.7,
                         'label': 'Test Circ Label',
                         'showHoverLabel': True,
                         'skyRelative': True}

    annot_state = widget.quick_serialize()['annotations'][0]

    assert annot_state['id'] == circ.id
    assert annot_state['shape'] == 'circle'

    assert 'center' in annot_state
    assert annot_state['center']['ra'] == pytest.approx(0.1)
    assert annot_state['center']['dec'] == pytest.approx(0.2)

    assert 'settings' in annot_state
    assert annot_state['settings'] == expected_settings

    circ.radius = 7*u.pix
    circ.fill_color = 'g'
    expected_settings['radius'] = 7
    expected_settings['skyRelative'] = False
    expected_settings['fillColor'] = '#008000'
    annot_state = widget.quick_serialize()['annotations'][0]
    assert annot_state['settings'] == expected_settings

    # Check circle annotation with no specified center
    circ.remove()
    circ2 = widget.add_circle()
    center = widget.quick_serialize()['annotations'][0]['center']
    assert center['ra'] == pytest.approx(5.)
    assert center['dec'] == 10.

    # Circle annotation with center in constructor
    circ2.remove()
    widget.add_circle(center=SkyCoord(15 * u.deg, 16 * u.deg))
    center = widget.quick_serialize()['annotations'][0]['center']
    assert center['ra'] == 15
    assert center['dec'] == 16

    widget.smoketest_bundling()


def test_poly_annotation_setting():
    widget = MockWWTWidget()
    poly = widget.add_polygon(fill=True, tag='Test Poly Tag')
    poly.fill_color = '#123456'
    poly.line_color = 'antiquewhite'
    poly.line_width = 9*u.pix
    poly.opacity = 0.9
    poly.label = 'Test Poly Label'
    poly.hover_label = False
    poly.add_point(SkyCoord([1, 2, 3]*u.deg, [5, 6, 7]*u.deg))
    poly.add_point(SkyCoord(4 * u.deg, 8 * u.deg))
    expected_settings = {'fill': True,
                         'tag': 'Test Poly Tag',
                         'fillColor': '#123456',
                         'lineColor': '#faebd7',
                         'lineWidth': 9,
                         'opacity': 0.9,
                         'label': 'Test Poly Label',
                         'showHoverLabel': False}

    annot_state = widget.quick_serialize()['annotations'][0]

    assert annot_state['id'] == poly.id
    assert annot_state['shape'] == 'polygon'

    expected_ras = [1, 2, 3, 4]
    expected_decs = [5, 6, 7, 8]
    assert 'points' in annot_state
    pts = annot_state['points']
    assert len(pts) == 4
    for i in range(len(pts)):
        assert pts[i]['ra'] == expected_ras[i], 'RA mismatch for point {0}'.format(i)
        assert pts[i]['dec'] == expected_decs[i], 'Dec mismatch for point {0}'.format(i)

    assert 'settings' in annot_state
    assert annot_state['settings'] == expected_settings

    widget.smoketest_bundling()


def test_line_annotation_setting():
    widget = MockWWTWidget()
    line = widget.add_line(color='#abcde0')
    line.tag = 'Test Line Tag'
    line.width = 11*u.pix
    line.opacity = 0.2
    line.label = 'Test Line Label'
    line.hover_label = True
    line.add_point(SkyCoord([2, 4, 6] * u.deg, [10, 12, 14] * u.deg))
    line.add_point(SkyCoord(8 * u.deg, 16 * u.deg))
    expected_settings = {'tag': 'Test Line Tag',
                         'lineColor': '#abcde0',
                         'lineWidth': 11,
                         'opacity': 0.2,
                         'label': 'Test Line Label',
                         'showHoverLabel': True}

    annot_state = widget.quick_serialize()['annotations'][0]

    assert annot_state['id'] == line.id
    assert annot_state['shape'] == 'line'

    expected_ras = [2, 4, 6, 8]
    expected_decs = [10, 12, 14, 16]
    assert 'points' in annot_state
    pts = annot_state['points']
    assert len(pts) == 4
    for i in range(len(pts)):
        assert pts[i]['ra'] == expected_ras[i], 'RA mismatch for point {0}'.format(i)
        assert pts[i]['dec'] == expected_decs[i], 'Dec mismatch for point {0}'.format(i)

    assert 'settings' in annot_state
    assert annot_state['settings'] == expected_settings

    widget.smoketest_bundling()


def test_add_remove_layer_serialization():
    widget = MockWWTWidget()

    table = Table()
    table['flux'] = [2, 3, 4, 5, 6]
    table['dec'] = [84, 85, 86, 87, 88]
    table['ra'] = [250, 260, 270, 280, 290] * u.deg

    table1 = widget.layers.add_table_layer(table=table)
    table2 = widget.layers.add_table_layer(table, color='#ff00ff')

    array = np.arange(100).reshape((10, 10))
    wcs = WCS()
    wcs.wcs.ctype = 'GLON-CAR', 'GLAT-CAR'
    wcs.wcs.crpix = 50.5, 50.5
    wcs.wcs.cdelt = -0.03, 0.03
    wcs.wcs.crval = 33, 43
    img1 = widget.layers.add_image_layer(image=(array, wcs))
    wcs.wcs.crval = 33, 45
    img2 = widget.layers.add_image_layer((array, wcs))

    state = widget.quick_serialize()

    assert len(state['layers']) == 4
    layer_ids = [table1.id, table2.id, img1.id, img2.id]
    for layer in state['layers']:
        assert layer['id'] in layer_ids
        layer_ids.remove(layer['id'])

    table2.remove()
    widget.layers.remove_layer(img2)
    state = widget.quick_serialize()

    layer_ids = [table1.id, img1.id]
    assert len(state['layers']) == 2
    for layer in state['layers']:
        assert layer['id'] in layer_ids
        layer_ids.remove(layer['id'])

    widget.reset()
    state = widget.quick_serialize()
    assert len(state['layers']) == 0

    widget.smoketest_bundling()


def test_table_setting_serialization():
    widget = MockWWTWidget()

    table = Table()
    table['flux'] = [2, 3, 4, 5, 6]
    table['dec'] = [84, 85, 86, 87, 88]
    table['ra'] = [250, 260, 270, 280, 290]*u.deg

    layer = widget.layers.add_table_layer(table, frame='earth', alt_att='flux', far_side_visible=True)
    layer.alt_type = 'distance'
    layer.color = '#aacc00'
    layer.size_scale = 14
    layer.opacity = 0.75
    layer.marker_type = 'square'
    layer.marker_scale = 'world'

    layer_state = widget.quick_serialize()['layers'][0]
    assert layer_state['id'] == layer.id
    assert layer_state['layer_type'] == 'table'
    assert layer_state['frame'] == 'Earth'

    assert 'settings' in layer_state
    expected_settings = {'lngColumn': 'ra',
                         'raUnits': 'degrees',
                         'latColumn': 'dec',
                         'altColumn': 'flux',
                         'timeSeries': False,
                         'decay': 16,
                         'altUnit': None,
                         'altType': 'distance',
                         'color': '#aacc00',
                         'scaleFactor': 14,
                         'opacity': 0.75,
                         'plotType': 'square',
                         'markerScale': 'world',
                         'showFarSide': True,
                         'sizeColumn': -1,
                         '_colorMap': 0,
                         'colorMapColumn': -1,
                         'xAxisColumn': '',
                         'yAxisColumn': '',
                         'zAxisColumn': '',
                         'cartesianScale': None,
                         'coordinatesType': 'spherical'}
    assert layer_state['settings'] == expected_settings

    # Check when we have colormap and scaling
    layer.cmap_att = 'flux'
    layer.size_att = 'dec'
    layer.alt_unit = u.Mpc

    expected_settings['sizeColumn'] = SIZE_COLUMN_NAME
    expected_settings['pointScaleType'] = 0
    expected_settings['colorMapColumn'] = CMAP_COLUMN_NAME
    expected_settings['_colorMap'] = 3
    expected_settings['altUnit'] = 'megaParsecs'

    assert widget.quick_serialize()['layers'][0]['settings'] == expected_settings

    # Broken! We're trying to serialize a Quantity here.
    # widget.smoketest_bundling()


def test_image_setting_serialization():
    widget = MockWWTWidget()

    array = np.arange(100).reshape((10, 10))
    wcs = WCS()
    wcs.wcs.ctype = 'GLON-CAR', 'GLAT-CAR'
    wcs.wcs.crpix = 50.5, 50.5
    wcs.wcs.cdelt = -0.03, 0.03
    wcs.wcs.crval = 33, 43
    layer = widget.layers.add_image_layer(image=(array, wcs))

    layer.opacity = 0.3
    layer.vmin = -1
    layer.vmax = 1
    layer.cmap = 'plasma'
    layer_state = widget.quick_serialize()['layers'][0]

    assert layer_state['id'] == layer.id
    assert layer_state['layer_type'] == 'image'
    assert 'stretch_info' in layer_state
    assert layer_state['stretch_info']['vmin'] == -1
    assert layer_state['stretch_info']['vmax'] == 1
    assert layer_state['stretch_info']['stretch'] == 0
    assert layer_state['stretch_info']['cmap'] == 'plasma'

    assert 'settings' in layer_state
    settings = layer_state['settings']
    assert settings == {'opacity': 0.3}

    stretches = {'linear': 0, 'log': 1, 'power': 2, 'sqrt': 3, 'histeq': 4}
    for stretch_name, stretch_id in stretches.items():
        layer.stretch = stretch_name
        assert widget.quick_serialize()['layers'][0]['stretch_info']['stretch'] == stretch_id, \
            "Stretch id mismatch for: {0}".format(stretch_name)

    widget.smoketest_bundling()
