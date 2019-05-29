0.6.0 (2019-05-29)
------------------

- Implement support for color-coding and scaling points in layers according
  to table attributes. [#183]

- Removed ``load_fits_data`` and added ``layers.add_image_layer`` instead,
  which provides control over the image stretch, and renamed
  ``layers.add_data_layer`` to ``layers.add_table_layer``. [#188, #201]

- Added support for drag and drop events in Qt widget. [#202]

- Added support for ``get_center`` for the Jupyter widget, and add a new
  ``get_fov`` method to get the current field of view. [#206]

- Fixed compatibility with notebook>=5.7.6 which requires mime
  types for served files to be correct. [#192, #208]

- Fixed display of table layers on Windows. [#207]

0.5.3 (2019-01-16)
------------------

- Exposed option to turn off large-scale SDSS data in 3D mode, improving
  performance. [#176]

- Make sure default altitude type is set correctly. [#176]

0.5.2 (2019-01-08)
------------------

- Added instructions for using Jupyter Lab. [#170]

- Fixed ``set_view('Mars')``. [#171]

- Fixed issue with layers not appearing under certain circumstances. [#173]

0.5.1 (2019-01-04)
------------------

- Fixed a bug that caused layers to not immediately update when updating
  data. [#167]

- Fixed a bug that caused some columns to be pre-assigned to e.g. size_att
  based on column name. [#167]

0.5.0 (2019-01-04)
------------------

- Fixed issues with zooming using trackpad/scroll wheel. [#166]

- Added support for customizing the layer marker type (``marker_type``), the
  option to specify whether the marker size is absolute or relative to the
  screen (``marker_scale``), and the option to show points on the far side of
  an object (``far_side_visible``). [#165]

- Fixed a bug that caused issues with the distance/altitude of points when not
  centered on the Earth. [#165]

0.4.1 (2018-12-23)
------------------

- Work around an issue with getting base URLs on e.g. mybinder.

- Improvements to documentation. [#160, #164]

0.4.0 (2018-12-20)
------------------

- Added keyboard shortcuts for movement in-viewer. [#81]

- Disable crosshairs by default. [#157]

- Added ``pause_time`` and ``play_time`` for controlling time and make it
  possible to control the rate of passage of time. [#146, #152]

- Added support for displaying fields of view for common telescope. [#102]

- Added ``minor_orbits`` and ``stars`` attributes to control the visibility
  of minor orbits and stars in solar system mode. [#145]

- Added support for showing tables of data using layers. [#122, #136, #139, #140, #143, #147, #150]

- Added ``load_fits_data`` method for Qt and Jupyter clients. [#78]

- Added support for non-sky modes (e.g. solar system mode). [#74, #83, #95, #98]

- Added GUI controls for imagery layers using the ``layer_controls`` attribute. [#64]

- Added support for exploring available imagery layers. [#71]

- Added support for showing circle collections with annotations. [#54]

- Switch to use OpenGL API. [#73]

- Fixed compatibility with Jupyter Lab. [#63, #65]

- Fixed compatibility with older versions of Qt. [#133]

- Fixed compatibility with unicode strings for colors on Python 2. [#105]

- Improved documentation. [#60, #70, #84, #101, #109]

0.3.0 (2017-12-20)
------------------

- Initial version with changelog
