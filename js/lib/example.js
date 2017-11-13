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

    // initialize : function() {
    //
    //     console.log("INITIALIZING");
    //
    //     this.div1 = document.createElement("div");
    //     this.div1.setAttribute("id", "WorldWideTelescopeControlHost")
    //
    //     this.div2 = document.createElement("div");
    //     this.div2.setAttribute("id", "UI")
    //
    //     this.div3 = document.createElement("div");
    //     this.div3.setAttribute("id", "WWTCanvas")
    //
    //     WWTView.__super__.initialize.apply(this, arguments);
    //
    // },

    render: function() {
        this.model.on('msg:custom', this.handle_custom_message, this);
    },

    handle_custom_message: function(msg) {
      console.log(msg);
    }


});


module.exports = {
    WWTModel : WWTModel,
    WWTView : WWTView
};
