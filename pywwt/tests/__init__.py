# Copyright 2018-2021 the .NET Foundation
# Licensed under a 3-clause BSD style license - see LICENSE.rst

"""
This package contains the pywwt tests. This particular module contains some
infrastructure to help with the image-output tests, which can be pretty finicky.
"""

__all__ = ['assert_widget_image', 'wait_for_test']

from glob import glob
import os.path
import sys

from matplotlib.testing.compare import compare_images  # noqa
import pytest

DATA = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data'))
IMAGE_OUTPUT_DIR = os.environ.get('PYWWT_TEST_IMAGE_DIR')
IMAGE_COMPARISON_TOLERANCE = 1.6


def assert_widget_image(tmpdir, widget, filename, fail_now=True):
    """
    Render an image from the given WWT widget and assert that it matches an
    expected version. The expected version might vary depending on the platform
    and/or OpenGL renderer, so we allow for multiple references and just check
    if *any* of them matches well enough.

    We used to have specific test images identified for each platform, but the
    bookkeeping for that gets very finicky.
    """

    # If requested, save the "actual" images in another directory that will be
    # preserved beyond the test run.

    if IMAGE_OUTPUT_DIR:
        actual = os.path.join(IMAGE_OUTPUT_DIR, filename)
    else:
        actual = tmpdir.join(filename).strpath

    widget.render(actual)

    # Compare to the references

    refdir = os.path.join(DATA, 'refimg_' + os.path.splitext(filename)[0])
    results = []

    for refbase in sorted(os.listdir(refdir)):
        refname = os.path.splitext(refbase)[0]
        expected = os.path.join(refdir, refbase)
        rv = compare_images(
            expected,
            actual,
            tol=IMAGE_COMPARISON_TOLERANCE,
            in_decorator=True
        )

        if rv is None:
            # Success! Clean up any fail images (mostly for the IMAGE_OUTPUT_DIR mode)
            for p in glob(actual.replace('.png', '_vs_*.png')):
                os.unlink(p)
            return None

        failpath = actual.replace('.png', '-failed-diff.png')
        newfailpath = actual.replace('.png', '_vs_%s.png' % refname)
        os.rename(failpath, newfailpath)
        results.append((refname, rv['rms']))

    # Nothing was good enough :-(
    #
    # We used to have machinery here to emit a "reproduction script" that
    # printed out Python code to recreate the image files using big
    # BASE64-encoded strings, but now we can just use Azure Pipelines artifacts.
    # Consult the Git history if the reproduction script stuff is needed again.

    msg = (
        'observed image %s did not match any references to required RMS tolerance of '
        '%.2f; results were: %s'
    ) % (actual, IMAGE_COMPARISON_TOLERANCE, ', '.join('%s=%.2f' % t for t in results))

    if fail_now:
        pytest.fail(msg, pytrace=False)

    return '{}: {}'.format(filename, msg)


def wait_for_test(wwt, timeout, for_render=False):
    """
    On macOS with software OpenGL, every so often a single call to
    `app.processEvents()` will take 15-30 seconds to execute. In order for the
    tests like `test_full` to properly update the WWT rendering, it seems that
    *several* such "long" iterations have to occur -- something happens during
    those iterations that doesn't happen during the short ones. So, this
    function hacks MacOS to ensure that we iterate for a *long* time and that we
    execute a nontrivial number of event loop iterations. Note that `wwt.wait()`
    will not necessarily run many mainloop iterations, if one of them takes a
    long time.

    It would be nice to know why this is happening and fix the root cause!
    Preliminary investigation does not yield any clues.

    """
    from time import time
    from ..app import get_qapp
    MIN_ITERS = 128

    if for_render and sys.platform.startswith('darwin'):
        timeout = 90

    app = get_qapp()
    t0 = time()

    # Iterate for *at least* MIN_ITERS and *at least* `timeout` seconds.

    for _ in range(MIN_ITERS):
        app.processEvents()

    while time() - t0 < timeout:
        app.processEvents()
