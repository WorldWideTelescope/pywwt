[![pywwt on PyPI](https://badge.fury.io/py/pywwt.svg)](https://badge.fury.io/py/pywwt)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7164147.svg)](https://doi.org/10.5281/zenodo.7164147)
[![Build Status](https://dev.azure.com/aasworldwidetelescope/WWT/_apis/build/status/WorldWideTelescope.pywwt?branchName=master)](https://dev.azure.com/aasworldwidetelescope/WWT/_build/latest?definitionId=2&branchName=master)

# pywwt: WorldWide Telescope from Python/Jupyter

🚀🚀 [Click here to try out pywwt in the cloud!][go-cloud] 🚀🚀

[go-cloud]: https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Start%20Here.ipynb

*Note: the cloud servers usually start up quickly, but if they were recently
updated you may have to wait a few minutes for the backing software images to be
rebuilt.*


## About

The [pywwt] package is the official toolkit for visualizing astronomical data in
Python using [WorldWide Telescope][wwt] (WWT), a free, open-source astronomy
visualization system. WWT includes a sophisticated 4D WebGL rendering engine and
a cloud-based web service for sharing and visualizing terabytes of astronomical
data.

[pywwt]: https://pywwt.readthedocs.io/
[wwt]: https://worldwidetelescope.org/home
[dnf]: https://dotnetfoundation.org/

![A WWT screenshot showing exoplanets in the Kepler field overlaid on a background sky map.](docs/images/data_layers_kepler.png "Kepler exoplanets in pywwt")

With [pywwt] you can:

* Visualize and explore astronomical data interactively in the [Jupyter and
  JupyterLab][jupyter] environments through an HTML widget
* Do the same in standalone applications with a [Qt][qt] widget
* Load data from common astronomical data formats (e.g. [AstroPy
  tables][tables]) into WWT
* Control a running instance of the WWT Windows application

[jupyter]: https://jupyter.org/
[qt]: https://www.qt.io/
[tables]: https://docs.astropy.org/en/stable/table/

[//]: # (numfocus-fiscal-sponsor-attribution)

The WorldWide Telescope project uses an [open governance
model](https://worldwidetelescope.org/about/governance/) and is fiscally
sponsored by [NumFOCUS](https://numfocus.org/). Consider making a
[tax-deductible donation](https://numfocus.org/donate-for-worldwide-telescope)
to help the project pay for developer time, professional services, travel,
workshops, and a variety of other needs.

<div align="center">
  <a href="https://numfocus.org/donate-for-worldwide-telescope">
    <img height="60px"
         src="https://raw.githubusercontent.com/numfocus/templates/master/images/numfocus-logo.png">
  </a>
</div>


## Installation

The full pywwt documentation, including installation instructions, can be found
at <https://pywwt.readthedocs.io/>.


## Reporting issues

If you run into any issues, please open an issue [here](https://github.com/WorldWideTelescope/pywwt/issues).


## For Developers: Testing

To test your pywwt checkout, use the `pytest` command.

The pywwt test suite includes a set of image tests that generate imagery using
the WWT Qt widget and compare the results to a set of reference images. This
component of the test suite can be finicky, even when everything is working
properly, because the details of the rendering are dependent upon your operating
system and OpenGL implementation. If your setup is yielding visually correct
results, but the test suite is not passing for you, you can fix that as
described below.

For a bit more context, each “image test” generates a WWT visual and compares it
to multiple reference images. If *any* of those images is sufficiently close to
the WWT result, the test passes. So if you’re running the test suite and the
comparisons are failing, you need add appropriate new images to the corpus.

For a test like `image_layer_equ`, the reference images are stored in the
subdirectory `pywwt/tests/data/refimg_image_layer_equ`. The filenames of the
reference images within that directory don't matter, and are intentionally
uninformative since the same reference image might match a wide variety of
rendering platforms.

If you run the test suite with the environment variable `$PYWWT_TEST_IMAGE_DIR`
set to a non-empty value, the WWT visuals generated during the test run will be
saved in the named directory. For any images that fail tests, difference images
with names resembling `image_layer_equ_vs_a.png` will also be saved. So to
update the image corpus so that the test suite passes for you, run the test
suite in this mode, then copy the failing images to the appropriate reference
image data directories. Don't forget to `git add` the new files! And you should
also verify that your new images do in fact look “reasonable” compared to what’s
expected for the test.

You can also run `python -m pywwt.tests $imgdir1 $imgdir2 ...`, where `$imgdirN`
are paths to directories or Zip files containing images generated during one or
more test runs. This will compare those images to the current corpus of
reference images, and indicate whether there are images in the reference corpus
that could potentially be removed. **Note**, however, that this is only safe if
your collection of `$imgdirN` spans *all* pywwt rendering platforms of interest.
If there’s a developer that runs the test suite on MacOS 10.10 and your
collection doesn't include those samples, you run the risk of breaking the test
suite for that person if you remove the reference files that they need. That
being said, it is quite possible for reference images to get out-of-date as the
rendering code and test suite evolve. On the third hand, deleting files from
the Git repository doesn't actually make it smaller, so removing old reference
images only helps a bit with housekeeping.


## Continuous Integration and Deployment

This repository uses [Cranko] to automate release workflows. This automation is
essential to the smooth and reproducible deployment of the WWT web services.

[Cranko]: https://pkgw.github.io/cranko/


## Getting involved

We love it when people get involved in the WWT community! You can get started
by [participating in our user forum] or by
[signing up for our low-traffic newsletter]. If you would like to help make
WWT better, our [Contributor Hub] aims to be your one-stop shop for
information about how to contribute to the project, with the
[Contributors’ Guide] being the first thing you should read. Here on GitHub we
operate with a standard [fork-and-pull] model.

[participating in our user forum]: https://wwt-forum.org/
[signing up for our low-traffic newsletter]: https://bit.ly/wwt-signup
[Contributor Hub]: https://worldwidetelescope.github.io/
[Contributors’ Guide]: https://worldwidetelescope.github.io/contributing/
[fork-and-pull]: https://help.github.com/en/articles/about-collaborative-development-models

All participation in WWT communities is conditioned on your adherence to the
[WWT Code of Conduct], which basically says that you should not be a jerk.

[WWT Code of Conduct]: https://worldwidetelescope.github.io/code-of-conduct/


## Acknowledgments

Work on the WorldWide Telescope system has been supported by the [American
Astronomical Society] (AAS), the [.NET Foundation], and other partners. See [the
WWT user website][acks] for details.

[American Astronomical Society]: https://aas.org/
[.NET Foundation]: https://dotnetfoundation.org/
[acks]: https://worldwidetelescope.org/about/acknowledgments/


## Legalities

The WWT code is licensed under the [MIT License]. The copyright to the code is
owned by the [.NET Foundation].

[MIT License]: https://opensource.org/licenses/MIT
