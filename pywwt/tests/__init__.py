# Licensed under a 3-clause BSD style license - see LICENSE.rst
"""
This package contains the pywwt tests. This particular module contains some
infrastructure to help with the image-output tests, which can be pretty finicky.
"""

__all__ = ['assert_widget_image', 'wait_for_test']

from base64 import b64encode
import os.path
import sys
from traceback import print_exc

from matplotlib.testing.compare import compare_images  # noqa
import pytest


# Figure out which reference images we'll use.

FRAMEWORK = 'none'
FRAMEWORK_VARIANT = None

from ..conftest import _cached_opengl_renderer, RUNNING_ON_CI, QT_INSTALLED  # noqa

if QT_INSTALLED:
    from qtpy.QtWebEngineWidgets import WEBENGINE

    FRAMEWORK = 'webengine' if WEBENGINE else 'webkit'
    if sys.platform.startswith('win') and not WEBENGINE and 'GDI' in _cached_opengl_renderer:
        FRAMEWORK += '_win'
    elif sys.platform.startswith('darwin'):
        FRAMEWORK += '_osx'

    if 'Mesa' in _cached_opengl_renderer:
        FRAMEWORK_VARIANT = '_mesa'
    elif 'llvmpipe' in _cached_opengl_renderer:
        FRAMEWORK_VARIANT = '_llvmpipe'


# Reproduction helper

REPRODUCIBILITY_SCRIPT = """
################################################################################
# pywwt reproduction script for test image `{filename}`
#
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

DATA = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))

IMAGE_OUTPUT_DIR = os.environ.get('PYWWT_TEST_IMAGE_DIR')


def assert_widget_image(tmpdir, widget, filename, fail_now=True):
    """
    Render an image from the given WWT widget and assert that it matches an
    expected version. The expected version might vary depending on the platform
    and/or OpenGL renderer.
    """
    # If requested, save the "actual" images in another directory that will be
    # preserved beyond the test run.

    if IMAGE_OUTPUT_DIR:
        actual = os.path.join(IMAGE_OUTPUT_DIR, filename)
    else:
        actual = tmpdir.join(filename).strpath

    widget.render(actual)

    # Get the path to the "expected" image. There are can be a variety of
    # versions, unfortunately, due to differences between different OpenGL
    # renderers.

    expected = None

    if FRAMEWORK_VARIANT is not None:
        p = os.path.join(DATA, FRAMEWORK + FRAMEWORK_VARIANT, filename)
        if os.path.exists(p):
            expected = p

    if expected is None:
        expected = os.path.join(DATA, FRAMEWORK, filename)

    # Do the actual comparison.

    try:
        msg = compare_images(expected, actual, tol=1.6)
    except Exception as e:
        msg = 'Image comparison failed with exception: {}'.format(e)
        print_exc()

    if msg is None:
        return  # success!

    # If we're on a CI environment, output a script to regenerate the images.

    if RUNNING_ON_CI:
        with open(expected, 'rb') as f:
            expected = b64encode(f.read()).decode()

        with open(actual, 'rb') as f:
            actual = b64encode(f.read()).decode()

        print(REPRODUCIBILITY_SCRIPT.format(
            actual=actual,
            expected=expected,
            filename=filename,
        ))

    if fail_now:
        pytest.fail(msg, pytrace=False)

    return '{}: {}'.format(filename, msg)


def wait_for_test(wwt, timeout):
    """
    On at least macOS, a single call to `app.processEvents()` can take many
    seconds on when the WWT widget is being initialized. This means that
    sometimes we only process a single event, while it is necessary to run the
    event loop for many iterations in order to process all events. This function
    works around this problem.

    In principle we should maybe iterate the event loop until we know that all
    events have been processed, but the documentation seems to suggest that
    `hasPendingEvents()` should not be used.

    """
    wwt.wait(0.01)
    wwt.wait(timeout)
