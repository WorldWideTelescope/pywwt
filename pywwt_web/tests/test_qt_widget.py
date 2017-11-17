from astropy.coordinates import SkyCoord
from astropy import units as u

from ..qt_widget import WWTQtWidget

M42 = SkyCoord.from_name('M42')


def test_init(self):
    WWTQtWidget(block_until_ready=True)


class TestWWTWidget:

    def setup_class(self):
        self.widget = WWTQtWidget(block_until_ready=True)

    def test_settings(self):
        self.widget.constellation_figures = True
        self.widget.constellation_figures = False

    def test_methods(self):
        self.widget.center_on_coordinates(M42, fov=10 * u.deg)

    def test_annotations(self):
        circle = self.widget.create_circle()
        circle.opacity = 0.8
        circle.set_center(M42)
