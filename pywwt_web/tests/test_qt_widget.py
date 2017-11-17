import time

from astropy.coordinates import SkyCoord
from astropy import units as u

from qtpy.QtWidgets import QApplication

from ..qt_widget import WWTQtWidget

M42 = SkyCoord.from_name('M42')


def wait_and_check_output(seconds, capsys):

    # TODO: would be nice to find a way to do this that doesn't
    # rely on waiting a fixed number of seconds

    app = QApplication.instance()

    time1 = time.time()
    while time.time() - time1 < seconds:
        app.processEvents()

    out, err = capsys.readouterr()
    assert out.strip() == ""
    assert err.strip() == ""


def test_init(capsys):
    WWTQtWidget(block_until_ready=True)
    wait_and_check_output(1, capsys)


class TestWWTWidget:

    def setup_class(self):
        self.widget = WWTQtWidget(block_until_ready=True)

    def test_settings(self, capsys):
        self.widget.constellation_figures = True
        self.widget.constellation_figures = False
        wait_and_check_output(1, capsys)

    def test_methods(self, capsys):
        self.widget.center_on_coordinates(M42, fov=10 * u.deg)
        wait_and_check_output(1, capsys)

    def test_annotations(self, capsys):
        circle = self.widget.create_circle()
        circle.opacity = 0.8
        circle.set_center(M42)
        wait_and_check_output(1, capsys)
