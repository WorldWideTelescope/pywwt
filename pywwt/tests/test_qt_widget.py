import os
import sys
from datetime import datetime

import pytest

from astropy.coordinates import SkyCoord
from astropy import units as u

from qtpy.QtWebEngineWidgets import WEBENGINE

from matplotlib.testing.compare import compare_images

from ..qt import WWTQtClient

M42 = SkyCoord.from_name('M42')

DATA = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))

REFERENCE_TIME = datetime(2017, 1, 1, 0, 0, 0, 0)


def check_silent_output(capsys):
    out, err = capsys.readouterr()
    assert out.strip() == ""
    assert err.strip() == ""


def test_init(capsys):
    wwt = WWTQtClient(block_until_ready=True)
    wwt.wait(1)


class TestWWTWidget:

    def setup_class(self):
        self.widget = WWTQtClient(block_until_ready=True)

    def test_settings(self, capsys):
        self.widget.constellation_figures = True
        self.widget.constellation_figures = False
        self.widget.wait(1)
        check_silent_output(capsys)

    def test_methods(self, capsys):
        self.widget.center_on_coordinates(M42, fov=10 * u.deg)
        self.widget.wait(1)
        check_silent_output(capsys)

    def test_coordinates(self, capsys):
        self.widget.center_on_coordinates(M42, fov=10 * u.deg)
        assert M42.separation(self.widget.get_center()).arcsec < 1.e-6
        self.widget.wait(1)
        check_silent_output(capsys)

    def test_annotations(self, capsys):
        circle = self.widget.add_circle()
        circle.opacity = 0.8
        circle.set_center(M42)
        self.widget.wait(1)
        check_silent_output(capsys)


# The following is a template for a script that will allow developers who see
# a failure in CI to re-create the files that were generated in the
# continuous integration easily.
REPRODUCABILITY_SCRIPT = """
################################################################################
# Export the images that were generated in the continuous integration for pywwt.
# Just copy and paste all the code between here and '# End of script' into a
# local file and run it with Python. You can then check if the differences
# make sense, and if so, update the expected images.

import base64

expected = base64.b64decode('{expected}')

with open('expected.png', 'wb') as f:
    f.write(expected)

actual = base64.b64decode('{actual}')

with open('actual.png', 'wb') as f:
    f.write(actual)

# End of script
################################################################################
"""


def assert_widget_image(tmpdir, widget, filename):
    actual = tmpdir.join(filename).strpath
    widget.render(actual)
    framework = 'webengine' if WEBENGINE else 'webkit'
    if sys.platform.startswith('win') and not WEBENGINE:
        framework += '_win'
    elif sys.platform.startswith('darwin'):
        framework += '_osx'
    expected = os.path.join(DATA, framework, filename)
    msg = compare_images(expected, actual, tol=1.5)
    if msg is not None:

        from base64 import b64encode

        with open(expected, 'rb') as f:
            expected = b64encode(f.read()).decode()

        with open(actual, 'rb') as f:
            actual = b64encode(f.read()).decode()

        if os.environ.get('CI', 'false').lower() == 'true':
            print(REPRODUCABILITY_SCRIPT.format(actual=actual, expected=expected))

        pytest.fail(msg, pytrace=False)


def test_full(tmpdir, capsys):

    # Test a whole session, with image comparison along the way.

    wwt = WWTQtClient(block_until_ready=True, size=(400, 400))
    wwt.set_current_time(REFERENCE_TIME)
    wwt.foreground_opacity = 1.

    # The crosshairs are currently broken on Mac/Linux but work on Windows.
    # For consistency, we turn it off here so that the results are the same
    # on all platforms.
    wwt.crosshairs = False

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step0.png')

    gc = SkyCoord(0, 0, unit=('deg', 'deg'), frame='galactic')
    wwt.center_on_coordinates(gc, 60 * u.deg)

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step1.png')

    wwt.constellation_boundary_color = 'red'
    wwt.constellation_figure_color = 'green'
    wwt.constellation_selection_color = 'blue'

    wwt.constellation_boundaries = True
    wwt.constellation_figures = True

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step2.png')

    wwt.constellation_selection = True

    wwt.crosshairs = False
    wwt.ecliptic = True
    wwt.grid = True

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step3.png')

    wwt.foreground = 'SFD Dust Map (Infrared)'

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step4.png')

    wwt.foreground = "Black Sky Background"
    wwt.background = "Black Sky Background"
    wwt.foreground_opacity = 0

    wwt.center_on_coordinates(gc, 30 * u.deg)

    coord = SkyCoord(5, 0.5, unit=('deg', 'deg'), frame='galactic')

    circle1 = wwt.add_circle()
    circle1.set_center(coord)
    circle1.radius = 10 * u.pixel
    circle1.line_width = 5 * u.pixel
    circle1.line_color = 'green'
    circle1.fill = False
    circle1.opacity = 0.5

    coord = SkyCoord(-5, -0.5, unit=('deg', 'deg'), frame='galactic')

    circle2 = wwt.add_circle()
    circle2.set_center(coord)
    circle2.radius = 2 * u.degree
    circle2.line_width = 5 * u.pixel
    circle2.line_color = 'green'
    circle2.fill = True
    circle2.fill_color = 'orange'
    circle2.opacity = 1

    coord = SkyCoord([1, 4, 0], [0, 0, -5], unit=('deg', 'deg'), frame='galactic')

    poly = wwt.add_polygon()
    poly.add_point(coord[0])
    poly.add_point(coord[1])
    poly.add_point(coord[2])
    poly.fill = True
    poly.line_color = 'red'
    poly.fill_color = 'yellow'
    poly.line_width = 2 * u.pixel

    coord = SkyCoord([10, 5, 2], [5, 2, 2], unit=('deg', 'deg'), frame='galactic')

    polyline = wwt.add_line()
    polyline.add_point(coord[0])
    polyline.add_point(coord[1])
    polyline.add_point(coord[2])
    polyline.color = 'green'
    polyline.width = 3 * u.pixel

    wwt.wait(4)

    assert_widget_image(tmpdir, wwt, 'test_full_step5.png')
