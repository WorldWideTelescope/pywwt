var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var WWTModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'WWTModel',
        _view_name : 'WWTView',
        _model_module : 'pywwt_web',
        _view_module : 'pywwt_web',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    })
});

var WWTView = widgets.DOMWidgetView.extend({

    initialize : function() {

        // We use an iframe to show WorldWideTelescope, because it does not
        // otherwise support having multiple instances running on the same
        // page. We use the same HTML file as for the Qt client.
        var div = document.createElement("div");
        div.setAttribute("id", "Frame");
        div.innerHTML = "<iframe width='100%' height='480' style='border: none;' src='/nbextensions/pywwt_web/wwt.html'></iframe>"
        this.el.appendChild(div);

        WWTView.__super__.initialize.apply(this, arguments);

    },


    wwtReady: function() {
      this.loadImageCollection('http://www.worldwidetelescope.org/wwtweb/catalog.aspx?W=surveys');
      this.settings.set_showConstellationBoundries(false);
      this.settings.set_showConstellationFigures(false);
      this.setForegroundImageByName('Digitized Sky Survey (Color)');
      this.setBackgroundImageByName('SFD Dust Map (Infrared)');
      this.setForegroundOpacity(0.5);
    },

    render: function() {
        this.model.on('msg:custom', this.handle_custom_message, this);
    },

    handle_custom_message: function(msg) {
      if (this.wwt_window == null) {
        iframe = this.el.getElementsByTagName('iframe')[0];
        if (iframe != null) {
          this.wwt_window = iframe.contentWindow
          this.wwt_window.wwt.add_ready(this.wwtReady);
        } else {
          return  // Not ready yet
        }
      }
      this.wwt_window.wwt_apply_json_message(this.wwt_window.wwt, msg);
    }

});


module.exports = {
    WWTModel : WWTModel,
    WWTView : WWTView
};
