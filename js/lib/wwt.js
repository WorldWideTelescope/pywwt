var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var wwtmodule = require('./wwtsdk.js');
var wwtjson = require('./wwt_json_api.js');

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

        var div = document.createElement("div");
        div.setAttribute("id", "WWTCanvas");
        div.setAttribute("style", "width: 640px; height: 480px; border-style: none; border-width: 0px;")
        this.el.appendChild(div);

        WWTView.__super__.initialize.apply(this, arguments);

        this.wwt = wwtlib.WWTControl.initControl(div);
        this.wwt.add_ready(this.wwtReady);

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
      console.log(msg);
      wwt_apply_json_message(this.wwt, msg)
    }

});


module.exports = {
    WWTModel : WWTModel,
    WWTView : WWTView
};
