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
import tempfile

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
    ALWAYS_EXTRA_LONG = sys.platform.startswith('darwin')

    if for_render and ALWAYS_EXTRA_LONG:
        timeout = 90

    app = get_qapp()
    t0 = time()
    iters = 0

    # Iterate for *at least* MIN_ITERS and *at least* `timeout` seconds.

    for _ in range(MIN_ITERS):
        iters += 1
        app.processEvents()

    while time() - t0 < timeout:
        iters += 1
        app.processEvents()

    dt = time() - t0

    if for_render:
        print(f'wait_for_test: iters={iters} dt={dt} timeout={timeout} always={ALWAYS_EXTRA_LONG}')


def analyze_test_image_corpus(args):
    """
    This function analyzes the corpus of test images to ultimately report
    whether references images need to be added or removed.

    The arguments to the function should be sets of imagery that should pass the
    test suite. Each argument should be a path to either (1) a Zip file
    downloaded from the Azure Pipelines test suite artifacts or (2) a directory
    containing images output from the test suite (saved by setting the
    $PYWWT_TEST_IMAGE_DIR). The latter mode is useful because local developers'
    machines don't always generate imagery that fully matches with what's
    created in the CI system, and we want the test suite to pass for them, so we
    shouldn't restrict ourselves to *only* outputs created by the CI.

    Update the toplevel README.md appropriately if the behavior here is changed.
    """

    # First: index the existing corpus

    name_to_refs = {}

    for refdir in glob(os.path.join(DATA, 'refimg_*')):
        name = os.path.basename(refdir).replace('refimg_', '')
        refs = {}

        for p in os.listdir(refdir):
            if not p.endswith('.png'):
                continue

            refs[p.replace('.png', '')] = set()

        name_to_refs[name] = refs

    # Now trawl the samples and see which refimgs we hit

    def directory_to_paths(dir_path):
        for filename in os.listdir(dir_path):
            name = filename.replace('.png', '')
            if name in name_to_refs:
                yield name, os.path.join(dir_path, filename)

    def zip_to_paths(zip_path):
        from zipfile import ZipFile

        with tempfile.TemporaryDirectory() as tmpdir, ZipFile(zip_path) as zip:
            for zipname in zip.namelist():
                zip.extract(zipname, tmpdir)
                name = os.path.basename(zipname).replace('.png', '')
                if name in name_to_refs:
                    yield name, os.path.join(tmpdir, zipname)

    for path in args:
        if os.path.isdir(path):
            paths = directory_to_paths(path)
            sampname = os.path.basename(path)
        elif path.endswith('.zip'):
            paths = zip_to_paths(path)
            sampname = os.path.basename(path).replace('.zip', '')
        else:
            raise Exception(f'don\'t know how to handle input path `{path}`')

        for name, imgpath in paths:
            refs = name_to_refs[name]
            refnames = sorted(refs.keys())
            found_it = False
            results = []

            for refname in refnames:
                refpath = os.path.join(DATA, 'refimg_' + name, refname + '.png')
                rv = compare_images(
                    refpath,
                    imgpath,
                    tol=IMAGE_COMPARISON_TOLERANCE,
                    in_decorator=True
                )

                if rv is None:
                    refs[refname].add(sampname)
                    found_it = True
                    break

                failpath = imgpath.replace('.png', '-failed-diff.png')
                os.unlink(failpath)
                results.append((refname, rv['rms']))

            if not found_it:
                print(f'no refimg found for {sampname}::{name}:', ', '.join('%s=%.2f' % t for t in results))

    # Now report

    print()
    print('Report:')
    any_reports = False

    for name in sorted(name_to_refs.keys()):
        refs = name_to_refs[name]

        for refname in sorted(refs.keys()):
            refdata = refs[refname]

            if not refdata:
                print(f'- no hits to {name}::{refname}')
                any_reports = True

    if not any_reports:
        print('- no suggested modifications')
