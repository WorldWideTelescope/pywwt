# Copyright 2018-2021 the .NET Foundation
# Licensed under the BSD license

"""
Some basic tests.
"""

import pytest
from traitlets import TraitError

from ..core import BaseWWTWidget


def test_initial_surveys_url():
    surveys_url = "https://worldwidetelescope.github.io/pywwt/test_surveys.xml"
    widget = BaseWWTWidget(surveys_url=surveys_url)

    layers_data = {
            "Digitized Sky Survey (Color)": "http://www.worldwidetelescope.org/thumbnails/DSS.png",
            "EGRET Hard (Gamma)": "http://www.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=egretmap",
            "Planck CMB": "http://www.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=planck",
    }
    assert widget.available_layers == sorted(list(layers_data.keys()))
    assert dir(widget.imagery.gamma) == ["egret"]
    assert dir(widget.imagery.other) == ["digitized"]
    assert dir(widget.imagery.micro) == ["planck"]

    # Check that these are allowed
    widget.foreground = "Planck CMB"
    widget.background = "EGRET Hard (Gamma)"

    # Check that these aren't
    # (Imageset names come from the default pywwt surveys XML)
    with pytest.raises(TraitError) as exc:
        widget.foreground = "Tycho (Synthetic, Optical)"
    assert exc.value.args[0] == "foreground is not one of the available layers"
    with pytest.raises(TraitError) as exc:
        widget.background = "Fermi LAT 8-year (gamma)"
    assert exc.value.args[0] == "background is not one of the available layers"


def test_color_validation():
    widget = BaseWWTWidget()

    widget.constellation_figure_color = 'red'
    assert widget.constellation_figure_color == '#ff0000'

    widget.constellation_figure_color = '#ff0000'
    assert widget.constellation_figure_color == '#ff0000'

    widget.constellation_figure_color = (1, 0, 0)
    assert widget.constellation_figure_color == '#ff0000'

    with pytest.raises(TraitError) as exc:
        widget.constellation_figure_color = (1, 0, 0, 2)
    assert exc.value.args[0] == ('This attribute\'s color must be a string '
                                 '(a recognized matplotlib color name or hex '
                                 'code) or an RGB tuple of 3 floats')
