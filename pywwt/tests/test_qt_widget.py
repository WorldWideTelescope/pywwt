from astropy.coordinates import SkyCoord
from astropy import units as u
import pytest

from . import assert_widget_image, wait_for_test
from ..conftest import RUNNING_ON_CI


WAIT_TIME = 10 if RUNNING_ON_CI else 1
M42 = SkyCoord.from_name('M42')


def check_silent_output(capsys):
    out, err = capsys.readouterr()
    assert out.strip() == ""
    assert err.strip() == ""


class TestWWTWidget:

    def test_settings(self, capsys, wwt_qt_client):
        wwt_qt_client.constellation_figures = True
        wwt_qt_client.constellation_figures = False
        wait_for_test(wwt_qt_client, WAIT_TIME)
        check_silent_output(capsys)

    def test_methods(self, capsys, wwt_qt_client):
        wwt_qt_client.center_on_coordinates(M42, fov=10 * u.deg)
        wait_for_test(wwt_qt_client, WAIT_TIME)
        check_silent_output(capsys)

    def test_coordinates(self, capsys, wwt_qt_client):
        wwt_qt_client.center_on_coordinates(M42, fov=10 * u.deg)
        wait_for_test(wwt_qt_client, WAIT_TIME)
        assert M42.separation(wwt_qt_client.get_center()).arcsec < 1.e-6
        wait_for_test(wwt_qt_client, WAIT_TIME)
        check_silent_output(capsys)

    def test_roll(self, capsys, wwt_qt_client):
        wwt_qt_client.center_on_coordinates(M42, fov=10 * u.deg, roll=15 * u.deg)
        wait_for_test(wwt_qt_client, WAIT_TIME)
        assert u.isclose(wwt_qt_client.get_roll(), 15 * u.deg)
        # Check that passing no roll argument leaves the roll angle unchanged
        wwt_qt_client.center_on_coordinates(SkyCoord(0, 0, unit=u.deg), fov=20 * u.deg)
        wait_for_test(wwt_qt_client, WAIT_TIME)
        assert u.isclose(wwt_qt_client.get_roll(), 15 * u.deg)
        check_silent_output(capsys)

    def test_annotations(self, capsys, wwt_qt_client):
        circle = wwt_qt_client.add_circle()
        circle.opacity = 0.8
        circle.set_center(M42)
        wait_for_test(wwt_qt_client, WAIT_TIME)
        check_silent_output(capsys)


def test_full(tmpdir, wwt_qt_client_isolated):
    """
    Test a whole Qt session, with image comparison along the way. We don't
    immediately fail if the images disagree, to allow building up a full
    database of disagreeing images to help understand what's going on.
    """

    failures = []
    wwt = wwt_qt_client_isolated

    # Step 0

    wwt.foreground_opacity = 1.
    gc = SkyCoord(0, 0, unit=('deg', 'deg'), frame='icrs')
    wwt.center_on_coordinates(gc, 60 * u.deg)
    wwt.crosshairs = False

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step0.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 1

    gc = SkyCoord(0, 0, unit=('deg', 'deg'), frame='galactic')
    wwt.center_on_coordinates(gc, 60 * u.deg)

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step1.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 2

    wwt.constellation_boundary_color = 'red'
    wwt.constellation_figure_color = 'green'
    wwt.constellation_selection_color = 'blue'
    wwt.constellation_boundaries = True
    wwt.constellation_figures = True

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step2.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 3

    wwt.constellation_selection = True
    wwt.ecliptic = True
    wwt.grid = True

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step3.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 4

    wwt.foreground = 'SFD Dust Map (Infrared)'

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step4.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 5

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

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step5.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 6

    wwt.center_on_coordinates(wwt.get_center(), fov=wwt.get_fov(), roll=37 * u.deg)

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step6.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 7

    wwt.clear_annotations()
    wwt.grid = False
    wwt.constellation_labels = True
    wwt.constellation_figures = True
    wwt.constellation_pictures = True
    wwt.constellation_boundaries = True
    wwt.constellation_boundary_color = "pink"
    wwt.constellation_selection_color = "blue"
    wwt.constellation_figure_color = "teal"

    wwt.center_on_coordinates(wwt.get_center(), fov=60 * u.deg)

    # The constellation images take some time to load
    wait_for_test(wwt, 10 * WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step7.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 8

    wwt.constellation_labels = False
    wwt.constellation_figures = False
    wwt.constellation_pictures = False
    wwt.constellation_boundaries = False
    wwt.grid = True
    wwt.grid_text = True
    wwt.alt_az_grid = True
    wwt.alt_az_text = True
    wwt.ecliptic_grid = True
    wwt.ecliptic_text = True
    wwt.galactic_grid = True
    wwt.galactic_text = True

    wwt.center_on_coordinates(wwt.get_center(), fov=20 * u.deg)

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step8.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 9

    wwt.ecliptic = True
    wwt.ecliptic_color = "#55AAEE"
    wwt.grid_color = "#964B00"
    wwt.alt_az_grid_color = (0, 1, 1)
    wwt.ecliptic_grid_color = "orange"
    wwt.galactic_grid_color = "red"

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step9.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Step 10
    wwt.ecliptic = False
    wwt.ecliptic_grid = False
    wwt.alt_az_grid = False
    wwt.grid = False
    wwt.galactic_grid = False
    wwt.precession_chart = True
    wwt.precession_chart_color = (1, 0, 0)

    coord = SkyCoord(100, 65, unit=('deg', 'deg'))
    wwt.center_on_coordinates(coord, fov=60 * u.deg)

    wait_for_test(wwt, WAIT_TIME, for_render=True)

    msg = assert_widget_image(tmpdir, wwt, 'qt_full_step10.png', fail_now=False)
    if msg:
        failures.append(msg)

    # Summarize

    if failures:
        pytest.fail('\n'.join(failures), pytrace=False)
