var wwt = require('./index');

var base = require('@jupyter-widgets/base');

/**
 * The widget manager provider.
 */
module.exports = {
  id: 'pywwt_web',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'pywwt_web',
          version: wwt.version,
          exports: wwt
      });
    },
  autoStart: true
};
