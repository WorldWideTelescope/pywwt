# npm:pywwt 1.8.0 (2024-05-21)

- Require version 0.17 of the research app, which adds an API for refreshing
  the tile cache (#375, @Carifio24).


# npm:pywwt 1.7.0 (2023-11-28)

- Update the Jupyter widget implementation to use ES6 class syntax (#368,
  @Carifio24). This should fix up compatibility with the 8.x series of
  `ipywidgets`.


# npm:pywwt 1.6.0 (2023-09-15)

- Require the new ESM-based engine through the 0.16.x series of the research app
  (#366, @pkgw). This shouldn't lead to any user-visible changes (or even
  developer-visible ones), but in an effort to smoke out any oversights, we take
  this step to ensure that we're using the new code. This change also brings in
  a few sponsorship branding updates.


# npm:pywwt 1.5.3 (2023-07-06)

- Require the version 0.15.0 of the research app, to get new settings for
  various grid colors (#355, @Carifio24).


# npm:pywwt 1.5.2 (2023-05-30)

- Require the version 0.14.3 of the research app, to get a fix for communicating
  information about catalog sources (#353, @pkgw; pulls in
  WorldWideTelescope/wwt-webgl-engine#251, @Carifio24).


# npm:pywwt 1.5.1 (2023-05-26)

- Require the version 0.14.2 of the research app, to get a fix for HiPS
  catalogs loaded in HTTPS contexts (#352, @pkgw).


# npm:pywwt 1.5.0 (2023-03-08)

- Require version 0.14 of the research app, to get messages allowing the roll
  state of the WWT camera to be read and written (#349, @Carifio24).


# npm:pywwt 1.4.0 (2022-12-01)

- Require version 0.12 of the research app, to get the latest improvements
  including the Vue 3 update (#342, @pkgw).


# npm:pywwt 1.3.3 (2022-01-19)

- Require version 0.9.2 of the research app, to ensure we have support for
  naming imageset layers (#326, @pkgw)


# npm:pywwt 1.3.2 (2022-01-14)

- Fix up license annotations
- Require the latest research-app, version 0.9


# npm:pywwt 1.3.1 (2021-10-14)

- Fix a dumb string-processing bug in the URL canonicalization code that broke
  the widget in Jupyter environments where the "base URL" is nontrivial (#314,
  @pkgw).


# npm:pywwt 1.3.0 (2021-09-24)

- Bundle the research app in the pywwt distribution; currently requiring version
  0.7.1 (#301, #313, @pkgw). Compared to the previous release of this package,
  this includes a ton of new features: HiPS catalogs with data retrieval, tiled
  FITS, and lots of UI polish!
- Port the ipywidgets frontend to use the research app
- Modify the internal APIs to allow the app to come and go, not just become
  ready once


# npm:pywwt 1.2.0 (2021-06-14)

- New release to track internal cleanups in the pywwt Python code; the built-in
  widget HTML is now served from `$baseurl/wwt/widget/`, instead of
  `$baseurl/wwt/wwt.html`.
- Internal cleanups.


# npm:pywwt 1.1.1 (2021-01-27)

- Proclaim compatibility with the 4.x series of @jupyter-widgets/base. This
  should get the widget to work in the JupyterLab 3.x series.


# npm:pywwt 1.1.0 (2020-10-22)

- The Jupyter widget has reworked multi-view management to behave much better
  when there are multiple views for the same widget model, or when views are
  hidden and recreated.
- The Jupyter widget now exposes a _viewConnected trait to indicate the case
  when the widget has been created, but there are no active views presented to
  the user. This isn't wired up to the Python layer, but it could be useful
  later.


# npm:pywwt 1.0.0 (2020-10-21)

- Address #258 by transmitting WWT clock information using a reference point and
  a rate, rather than constantly transmitting the current time. Dramatically
  reduces JS <=> Python traffic.
- Tidy up the JavaScript files.


# npm:pywwt 0.9.1 (2020-10-18)

- First release with version number decoupled from the pywwt Python package.
- No code chages, but internal reorganizations including the use of Cranko for
  release automation.
