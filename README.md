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


## Reporting issues

If you run into any issues, please open an issue [here](https://github.com/WorldWideTelescope/pywwt/issues).


## Acknowledgments

The AAS WorldWide Telescope (WWT) system, including pywwt, is a [.NET
Foundation][dnf] project. Work on WWT and pywwt has been supported by the
[American Astronomical Society][aas] (AAS), the US [National Science Foundation][nsf]
(grants [1550701] and [1642446]), the [Gordon and Betty Moore Foundation][moore], and
[Microsoft][msft].

[nsf]: https://www.nsf.gov/
[1550701]: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1550701
[1642446]: https://www.nsf.gov/awardsearch/showAward?AWD_ID=1642446
[moore]: https://www.moore.org/
[msft]: https://microsoft.com/
