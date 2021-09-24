# pywwt: AAS WorldWide Telescope from Python/Jupyter

🚀🚀 [Click here to try out pywwt in the cloud!][go-cloud] 🚀🚀

[go-cloud]: https://mybinder.org/v2/gh/WorldWideTelescope/pywwt-notebooks/master?urlpath=lab/tree/Start%20Here.ipynb

*Note: our cloud servers usually start up quickly, but if they were recently
updated you may have to wait a few minutes for the backing software images to be
rebuilt.*

## About

The [pywwt] package is the official toolkit for visualizing astronomical data in
Python using [AAS][aas] [WorldWide Telescope][wwt] (WWT). WWT is a free,
open-source tool for visually exploring humanity’s scientific understanding of
the Universe. It includes a sophisticated 4D WebGL rendering engine and a
cloud-based web service for sharing and visualizing terabytes of astronomical
data. WWT is brought to you by the non-profit [American Astronomical Society][aas]
(AAS), the major organization of professional astronomers in North America, and
the [.NET Foundation][dnf].

[pywwt]: https://pywwt.readthedocs.io/
[aas]: https://aas.org/
[wwt]: http://www.worldwidetelescope.org/home
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

The full documentation, including installation instructions, can be found at
<http://pywwt.readthedocs.io/>.


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


## Reporting issues

If you run into any issues, please open an issue [here](https://github.com/WorldWideTelescope/pywwt/issues).


## Acknowledgments

The AAS WorldWide Telescope (WWT) system, including pywwt, is a [.NET
Foundation][dnf] project. Work on WWT and pywwt has been supported by the
[American Astronomical Society][aas] (AAS), the US [National Science Foundation][nsf]
(grants [1550701], [1642446], and [2004840]), the [Gordon and Betty Moore Foundation][moore], and
[Microsoft][msft].

[nsf]: https://www.nsf.gov/
[1550701]: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1550701
[1642446]: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1642446
[2004840]: https://www.nsf.gov/awardsearch/showAward?AWD_ID=2004840
[moore]: https://www.moore.org/
[msft]: https://microsoft.com/
