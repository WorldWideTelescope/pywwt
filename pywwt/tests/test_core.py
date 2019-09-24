import os

import pytest
from traitlets import TraitError

from ..core import BaseWWTWidget, DEFAULT_SURVEYS_URL

WWT_HTML_FILE = os.path.join(os.path.dirname(__file__), '..', 'nbextension', 'static', 'wwt.html')

with open(WWT_HTML_FILE) as f:
    WWT_HTML = f.read()


def test_settings_in_html():

    # Test to make sure that the initial settings listed in wwt.html match
    # the defaults for the traits.

    widget = BaseWWTWidget()
    for trait_name in sorted(widget.trait_names()):
        wwt_name = widget.trait_metadata(trait_name, 'wwt')
        if wwt_name is not None:
            value = getattr(widget, trait_name)
            if hasattr(value, 'unit'):
                cmd = 'wwt.settings.set_{0}({1!r})'.format(wwt_name, value.value)
            elif isinstance(value, bool):
                cmd = 'wwt.settings.set_{0}({1})'.format(wwt_name, str(value).lower())
            else:
                cmd = 'wwt.settings.set_{0}({1!r})'.format(wwt_name, str(value))
            assert cmd in WWT_HTML

    # Check traits that are connected to methods

    cmd = 'wwt.setForegroundImageByName({0!r})'.format(str(widget.foreground))
    assert cmd in WWT_HTML

    cmd = 'wwt.setBackgroundImageByName({0!r})'.format(str(widget.background))
    assert cmd in WWT_HTML

    cmd = 'wwt.setForegroundOpacity({0!r})'.format(widget.foreground_opacity * 100)
    assert cmd in WWT_HTML

    cmd = 'wwt.loadImageCollection({0!r})'.format(DEFAULT_SURVEYS_URL)
    assert cmd in WWT_HTML


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
