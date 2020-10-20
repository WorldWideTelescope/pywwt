// This file implements the JupyterLab extension, as linked up through this
// module's `package.json` file (`jupyerlab.extension` keyword).

var wwt = require('./index');

var base = require('@jupyter-widgets/base');

/**
 * The widget manager provider.
 */
module.exports = {
  id: 'pywwt',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'pywwt',
          version: wwt.version,
          exports: wwt
      });
    },
  autoStart: true
};
