var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var WWTModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {

        _model_name : 'WWTModel',
        _model_module : 'pywwt',
        _model_module_version : '0.4.0',

        _view_name : 'WWTView',
        _view_module : 'pywwt',
        _view_module_version : '0.4.0',

    })
});

var WWTView = widgets.DOMWidgetView.extend({

    initialize : function() {

        // We use an iframe to show WorldWideTelescope, because it does not
        // otherwise support having multiple instances running on the same
        // page. We use the same HTML file as for the Qt client.
        var div = document.createElement("div");
        div.innerHTML = "<iframe width='100%' height='480' style='border: none;' src='wwt.html'></iframe>"
        this.el.appendChild(div);

        WWTView.__super__.initialize.apply(this, arguments);

    },

    render: function() {
        // We pass all messages via msg:custom rather than look for trait events
        // because we just want to use the same JSON messaging interface for
        // the Qt widget and the Jupyter widget.
        this.model.on('msg:custom', this.handle_custom_message, this);
    },

    handle_custom_message: function(msg) {

      if (this.wwt_window == null) {
        iframe = this.el.getElementsByTagName('iframe')[0];
        if (iframe != null) {
          this.wwt_window = iframe.contentWindow;
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
