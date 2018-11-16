import os
import time
from datetime import datetime

import pytest

from astropy.coordinates import SkyCoord
from astropy import units as u
from astropy.table import Table

from qtpy.QtWidgets import QApplication
from qtpy.QtWebEngineWidgets import WEBENGINE

from matplotlib.testing.compare import compare_images

from ..qt import WWTQtClient
from .test_qt_widget import check_silent_output

class TestLayers:

    def setup_class(self):
        self.widget = WWTQtClient(block_until_ready=True)
        self.table = Table()
        self.table['ra'] = [1, 2, 3]
        self.table['dec'] = [4, 5, 6]
        self.table['flux'] = [2, 3, 4]

    def test_add_and_remove_layer(self, capsys):

        assert len(self.widget.layers) == 0
        assert str(self.widget.layers) == 'Layer manager with no layers'
        layer1 = self.widget.layers.add_data_layer(table=self.table)
        assert len(self.widget.layers) == 1
        assert str(self.widget.layers) == ('Layer manager with 1 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n')

        layer2 = self.widget.layers.add_data_layer(table=self.table)

        assert len(self.widget.layers) == 2
        assert str(self.widget.layers) == ('Layer manager with 2 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n'
                                           '  [1]: TableLayer with 3 markers\n')

        assert self.widget.layers[0] is layer1
        assert self.widget.layers[1] is layer2

        layer1.remove()

        assert len(self.widget.layers) == 1
        assert str(self.widget.layers) == ('Layer manager with 1 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n')

        self.widget.layers.remove_layer(layer2)

        assert len(self.widget.layers) == 0
        assert str(self.widget.layers) == 'Layer manager with no layers'

        self.widget.wait(1)
        check_silent_output(capsys)
