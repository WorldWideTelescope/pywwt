# Copyright 2021 the .NET Foundation
# Licensed under a 3-clause BSD style license - see LICENSE.rst

"""
A simple helper to make it possible to run `python -m pywwt.tests` to analyze
the image-test corpus -- see README.md.
"""

import sys
from . import analyze_test_image_corpus
analyze_test_image_corpus(sys.argv[1:])
