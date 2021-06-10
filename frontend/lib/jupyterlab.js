// This file implements the JupyterLab extension, as linked up through this
// module's `package.json` file (`jupyerlab.extension` keyword).

var main_module = require('./index');
var base = require('@jupyter-widgets/base');

/**
 * The widget manager provider.
 */
module.exports = {
  id: 'pywwt',
  requires: [base.IJupyterWidgetRegistry],
  activate: function (app, widgets) {
    widgets.registerWidget({
      name: 'pywwt',
      version: main_module.version,
      exports: main_module
    });
  },
  autoStart: true
};
