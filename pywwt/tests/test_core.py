# Copyright 2018-2021 the .NET Foundation
# Licensed under the BSD license

"""
Some basic tests.
"""

import pytest
from traitlets import TraitError

from ..core import BaseWWTWidget


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
