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
