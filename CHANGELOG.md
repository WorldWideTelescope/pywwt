# pypa:pywwt 0.16.0 (2022-10-08)

This release improves the support for viewing arbitrarily-sized FITS files in
pywwt, taking advantage of the new support in the [Toasty] library for all-sky
datasets! Version 0.18 of Toasty, or newer, is now required.

[Toasty]: https://toasty.readthedocs.io/

Another cool new change is that pywwt releases are now automatically deposited
with [Zenodo] and assigned DOIs in the process. This makes it possible to cite
the pywwt software, indicating exactly which version you were using, in
scholarly contexts!

[Zenodo]: https://zenodo.org/

- Handle all-sky FITS files with TOAST rather than hipsgen, using the
  newest Toasty features (#335, @imbasimba).
- Allow toggling whether or not a table layer is selectable (#334, @Carifio24).
- Allow the `time_decay` attribute of layers to be serialized (#332, @Carifio24).
- Make it possible to customize the app URL used by the Jupter widget (#331,
  @pkgw).
- Implement automated Zenodo deposit with DOI registration (@pkgw)

The DOI of this release is [10.5281/zenodo.7164148][vdoi].

[vdoi]: https://doi/org/10.5281/zenodo.7164148


# pypa:pywwt 0.15.2 (2022-01-19)

- Update the bundled version of the research app to 0.9.2, to ensure we have
  support for naming imageset layers (#326, @pkgw)


# pypa:pywwt 0.15.1 (2022-01-17)

- Fix installation on Python 3.10 (#325, @pkgw)
- Fix a small logic error with imageset naming that prevented some imagesets
  from loading in the app (#325, @pkgw)


# pypa:pywwt 0.15.0 (2022-01-14)

This release adds support for viewing arbitrarily-sized FITS files in pywwt,
with automatic tiling provided by the [Toasty] library!

[Toasty]: https://toasty.readthedocs.io/

- Extend the existing FITS viewing support to automatically tile FITS images if
  needed, using either Toasty or CDS' hipsgen depending on the angular size of
  the image (#316, @imbasimba). While the Python interfaces don't look any
  different, there is now a lot more machinery under the hood so that pywwt can
  perform well whether your FITS file is a megabyte or a gigabyte in size.
- Use the new [WWT Kernel Data Relay][kdr] (KDR) for serving up kernel-side data
  in Jupyter (#316, @pkgw, @imbasimba). You will now need to install the Python
  package `wwt_kernel_data_relay` as a Jupyter Server extension for FITS viewing
  to work in pywwt. This extension is necessary for pywwt to be able to send
  FITS data to the WWT web app on-demand, as you navigate an image. The KDR
  extension should be useful for other similar visualization tools as well.
- Lots of other under-the-hood work to get asynchronous tiling and data service
  working smoothly.
- Automatically use better default names and data cuts when viewing FITS files
  (#323, @imbasimba).
- Substantially clean up and (hopefully) improve the documentation (#318, #324,
  @pkgw). This includes a new documentation theme based on the Astropy docs.

[kdr]: https://github.com/WorldWideTelescope/wwt_kernel_data_relay/#readme


# pypa:pywwt 0.14.0 (2021-11-01)

- When pywwt is installed as a Jupyter server extension, have it provide its
  static resource files, most notably the bundled copy of the research app, from
  the additional URL path `$jupyterBaseUrl/wwtstatic/...`. Coupled with the
  recent releases of the WWT JupyterLab extension to make the app URL
  configurable, this should give us a future-proof way to make the WWT
  JupyterLab experience fully functional even in Jupyter(Lab) installations that
  reject all cross-origin data requests (#315, @pkgw).


# pypa:pywwt 0.13.1 (2021-10-14)

- Update the Jupyter(Lab) frontend code to fix a dumb bug that broke the widget
  when the "baseUrl" was non-trivial (#314, @pkgw).


# pypa:pywwt 0.13.0 (2021-09-24)

This is an important release, updating all variations of the pywwt UI — the Qt
widget, the ipywidgets widget, and the JupyterLab integration — to use the WWT
“research app”, instead of the old hand-coded HTML/JS wrapper that was specific
to pywwt. This enables us to take advantage of the app's much more sophisticated
UI and robust development framework, and to provide a homogeneous user interface
across these different variations. (#301, #302, @pkgw)

- This release bundles version 0.7.1 of the research app, which includes support
  for many new features, including catalog HiPS datasets, tiled FITS rendering,
  and more.
- Building in the capabilities of this new framework, the WWT widget has gained
  `most_recent_source` and `selected_sources` properties that allow code to
  interact with user selections of sources in the UI. Python code can be
  notified of selection actions by using the `set_selection_change_callback()`
  method. (#311, @Carifio24)
- Also building on the new framework, the WWT widget now knows about HiPS
  progressive catalogs (#308, @imbasimba, @pkgw). You can query available
  catalogs (via the `available_hips_catalog_names`) property, add them to the UI
  programmatically with `wwt.layers.add_hips_catalog_layer`, and obtain the data
  currently visible in the WWT view with the `layer.refresh()` method.
- To support the above, pywwt has started adding asynchronous processing support
  (#308, @pkgw). When pywwt is used inside a Jupyter kernel, the internals of
  the kernel message queue processing are modified to allow "expedited" message
  handling, which is needed to properly support certain pywwt interactive
  functionalities. This hack is relatively self-contained so hopefully it won't
  be too fragile, but time will have to tell.
- The `wwt.load_image_collection()` method now has a `recursive` for nested WTML
  files (#308, @imbasimba).
- The WWT widget constructors have a new `hide_all_chrome` option that hides all
  of the research app’s “chrome” (UI features), to enable a user experience that
  looks similar to the old pre-app style. This mode is the default in the Qt
  widget, so as to preserve the UX of the Glue app.
- Fix pywwt to be able to parse ImageSet XML data even when the `ThumbnailUrl`
  attribute is missing (#312, @Carifio24).
- Fixes for Astropy 4.3 (#310, @pkgw).
- The type of the `wwt.solar_system.scale` setting was corrected.
- The Jupyter server was failing to serve files with unguessable content-types;
  this is now fixed.
- Yet more improvements to the CI, test suite, and API documentation.

Tutorial and how-to documentation for all of this new functionality hasn't been
prepared ... yet.


# pypa:pywwt 0.12.0 (2021-06-14)

- A variety of internal cleanups relating to the HTML and JS files that are
  bundled with pywwt. These shouldn't affect anything user-visible, yet,
  but we want to publish the cleaned-up code to validate that everything is
  still working correctly.
- Some improvements to the documentation and test suite.


# pypa:pywwt 0.11.3 (2021-06-09)

- Another attempt to get ReadTheDocs to update the "stable" version of the
  documentation. We need to automate updating of the `stable` Git branch.


# pypa:pywwt 0.11.2 (2021-06-09)

- Tidy up and modernize the installation instructions. Our ReadTheDocs defaults
  to the "stable" version of the docs, so we need to make a release to get them
  to show up for most folks.


# pypa:pywwt 0.11.1 (2021-06-03)

- Add compatibility with the change in how the engine handles the
  transparentBlack setting for FITS datasets. The code is written to maintain
  compatibility with older versions of the engine as well (@imbasimba).
- Update some test-suite images to account for the changes in the new
  WebGL-based fits rendering (@pkgw).
- Temporarily disable checking of outgoing links in the docs, since
  Matplotlib currently has a problem that causes the check to fail (@pkgw).


# pypa:pywwt 0.11.0 (2021-02-09)

- First-draft support for the JupyterLab application. Rather then providing the
  WWT view as a widget tied to a specific notebook cell, the application
  provides it as a freestanding window that can exist separately from any one
  notebook or cell. This app is developed independently as a Vue app, so it's a
  lot easier to add native UI to it, as compared to the HTML widget that we have
  to provide in our plugin here.


# pypa:pywwt 0.10.4 (2021-01-27)

- Fix the sizing of circle annotations upon creation
- Include the latest bundled version of the JavaScript frontend, which should
  hopefully fix the widget in JupyterLab 3.x.


# pypa:pywwt 0.10.3 (2021-01-25)

- Attempt to fix the Qt widget on macOS computers. It appears that a recent
  update to our HTML introduced some JavaScript syntax that the Qt framework
  doesn't allow.


# pypa:pywwt 0.10.2 (2021-01-08)

- Fix URL identification for JupyterLab 3
- CI fixes


# pypa:pywwt 0.10.1 (2020-10-22)

- Update the bundled NPM package to fix various corner cases with multiple
  and/or evolving views of the Jupyter widget.
- Set the initial widget view to the Galactic Center, so that it's more obvious
  that everything is working when you start up the widget.


# pypa:pywwt 0.10.0 (2020-10-21)

- Fix build for traitlets >= 5.0 and in fact start requiring it.
- Update minimum Python version to 3.7, as required by traitlets 5.
- Require version 1.0 of the NPM package, so that we extrapolate clock
  information from data provided by the JavaScript layer. This dramatically
  reduces the level of traffic between the JS and Python layers.
- Adopt Cranko for release automation, and revamp the continuous integration
  infrastructure to implement such automation.


# pywwt 0.9.0 (2020-08-29)

- pywwt now obtains the WWT WebGL SDK code from web.wwtassets.org, rather than
  a private copy hosted on the pywwt GitHub Pages instance.
- Live notebook links now point to mybinder.org rather than the old private WWT
  instance of BinderHub, because HTTPS support is now working!
- Fix Jupyter server plumbing when operating in the JupyterHub single-user
  environment.


# pywwt 0.8.0 (2020-04-03)

- Improve performance when changing size parameters for tabular layers. In these
  cases, the performance is e.g. more than 1000x better for a 50,000 row
  dataset. [#224]
- Improve performance when changing colormap parameters for tabular
  layers, for a subset of colormaps. In these cases, the performance
  is e.g. more than 1000x better for a 50,000 row dataset. [#223]
- Added a `cmap` parameter on image layers to control the colormap. [#244]
- Incorporate time series behavior for data layers; add method that
  returns current time in the viewer. [#187]
- Drop support for Python 2.7 and now require at least Python 3.6. [#259]
- Fix compatibility with Jupyter 2.0. [#260]


# pywwt 0.7.0 (2019-09-20)

- You can now save your WWT views as interactive figures to be used in journal
  articles! (Actually, they're just standalone web pages, so they can be used
  anywhere you've got a web server.) This feature is new so it will still have
  some rough edges — keep your eyes open for improvements. And the docs haven't
  been written yet :-( [#215, #227]
- Relatedly, there is new first-draft support for interactive controls for
  image layers through the `image.controls` meta-property. This will also
  evolve over the next few releases. [#217]
- Initial support for data layers with Cartesian (XYZ) rather than spherical
  (lat, lon, alt) coordinates. [#190]
- Fix compatibility with the JupyterLab 1.0.x series. [#216, #219, #221]
- Expose all available imagery layers. [#220]
- Validate coordinate frame names used with tabular data layers. [#195]
- Fix the widget `reset` method . [#212]
- Various improvements to CI infrastructure, docs, landing pages, etc. [#218,
  #225, #228, #229, #230]


# pywwt 0.6.1 (2019-06-10)

- Fixed issues when calling `reset()`. [#212]
- Fixed resizing issues in Jupyter Lab. [#216]
- Fixed server URL when using Jupyter Lab. [#219]


# pywwt 0.6.0 (2019-05-29)

- Implement support for color-coding and scaling points in layers according
  to table attributes. [#183]
- Removed `load_fits_data` and added `layers.add_image_layer` instead,
  which provides control over the image stretch, and renamed
  `layers.add_data_layer` to `layers.add_table_layer`. [#188, #201]
- Added support for drag and drop events in Qt widget. [#202]
- Added support for `get_center` for the Jupyter widget, and add a new
  `get_fov` method to get the current field of view. [#206]
- Fixed compatibility with notebook>=5.7.6 which requires mime
  types for served files to be correct. [#192, #208]
- Fixed display of table layers on Windows. [#207]


# pywwt 0.5.3 (2019-01-16)

- Exposed option to turn off large-scale SDSS data in 3D mode, improving
  performance. [#176]
- Make sure default altitude type is set correctly. [#176]


# pywwt 0.5.2 (2019-01-08)

- Added instructions for using Jupyter Lab. [#170]
- Fixed `set_view('Mars')`. [#171]
- Fixed issue with layers not appearing under certain circumstances. [#173]


# pywwt 0.5.1 (2019-01-04)

- Fixed a bug that caused layers to not immediately update when updating
  data. [#167]
- Fixed a bug that caused some columns to be pre-assigned to e.g. size_att
  based on column name. [#167]


# pywwt 0.5.0 (2019-01-04)

- Fixed issues with zooming using trackpad/scroll wheel. [#166]
- Added support for customizing the layer marker type (`marker_type`), the
  option to specify whether the marker size is absolute or relative to the
  screen (`marker_scale`), and the option to show points on the far side of
  an object (`far_side_visible`). [#165]
- Fixed a bug that caused issues with the distance/altitude of points when not
  centered on the Earth. [#165]


# pywwt 0.4.1 (2018-12-23)

- Work around an issue with getting base URLs on e.g. mybinder.
- Improvements to documentation. [#160, #164]


# pywwt 0.4.0 (2018-12-20)

- Added keyboard shortcuts for movement in-viewer. [#81]
- Disable crosshairs by default. [#157]
- Added `pause_time` and `play_time` for controlling time and make it
  possible to control the rate of passage of time. [#146, #152]
- Added support for displaying fields of view for common telescope. [#102]
- Added `minor_orbits` and `stars` attributes to control the visibility
  of minor orbits and stars in solar system mode. [#145]
- Added support for showing tables of data using layers. [#122, #136, #139, #140, #143, #147, #150]
- Added `load_fits_data` method for Qt and Jupyter clients. [#78]
- Added support for non-sky modes (e.g. solar system mode). [#74, #83, #95, #98]
- Added GUI controls for imagery layers using the `layer_controls` attribute. [#64]
- Added support for exploring available imagery layers. [#71]
- Added support for showing circle collections with annotations. [#54]
- Switch to use OpenGL API. [#73]
- Fixed compatibility with Jupyter Lab. [#63, #65]
- Fixed compatibility with older versions of Qt. [#133]
- Fixed compatibility with unicode strings for colors on Python 2. [#105]
- Improved documentation. [#60, #70, #84, #101, #109]


# pywwt 0.3.0 (2017-12-20)

- Initial version with changelog
