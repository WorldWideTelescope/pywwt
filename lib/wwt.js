var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var WWTModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {

        _model_name : 'WWTModel',
        _model_module : 'pywwt',
        _model_module_version : '0.6.0',

        _view_name : 'WWTView',
        _view_module : 'pywwt',
        _view_module_version : '0.6.0',

        _ra : 0.0,
        _dec : 0.0,
        _fov : 60.0,

    })
});

var WWTView = widgets.DOMWidgetView.extend({

    initialize : function() {

        // We use an iframe to show WorldWideTelescope, because it does not
        // otherwise support having multiple instances running on the same
        // page. We use the same HTML file as for the Qt client.
        var div = document.createElement("div");

        // NOTE: we deliberately call the following twice to make sure that it
        // is properly set - not completely sure why this is.
        this.wwt_base_url = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();
        this.wwt_base_url = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();

        div.innerHTML = "<iframe width='100%' height='400' style='border: none;' src='" + this.wwt_base_url + "wwt/wwt.html'></iframe>"

        this.el.appendChild(div);

        WWTView.__super__.initialize.apply(this, arguments);

        var self = this;
        setInterval(function () { self.update_view_data(); }, 100);
    },

    _try_init_wwt_window : function() {
        iframe = this.el.getElementsByTagName('iframe')[0];
        if (iframe != null) {
            this.wwt_window = iframe.contentWindow;
            return true;
        } else {
            return false; // Not ready yet
        }
    },

    render: function() {
        // We pass all messages via msg:custom rather than look for trait events
        // because we just want to use the same JSON messaging interface for
        // the Qt widget and the Jupyter widget.
        this.model.on('msg:custom', this.handle_custom_message, this);
    },

    processPhosphorMessage: function(msg) {
        // We listen for phosphor resize events so that when Jupyter Lab is
        // used, we adjust the canvas size to the tab/panel in Jupyter Lab.
        // See relayout for more details.
        WWTView.__super__.processPhosphorMessage.apply(this, arguments);
        switch (msg.type) {
        case 'resize':
        case 'after-show':
            this.relayout();
            break;
        }
    },

    relayout: function() {

      // Only do resizing if we are not in the notebook context but in a split
      // panel context. We find this out by checking that the fourth parent
      // of the current element has the jp-MainAreaWidget class.
      parent = this.el.parentNode.parentNode.parentNode.parentNode

      if (parent.classList.contains("jp-MainAreaWidget")) {

        // Note that the approach below assumes that the WWT widget is the only
        // output in the split panel, but if not, then we might end up with a
        // size that is too large, so this should be fixed in future.

        // We now check whether the iframe is actually present inside this element
        iframe = this.el.getElementsByTagName('iframe')[0];

        if (iframe != null) {

          // The height of the widget element defaults to 400 pixels, but here
          // we change it to simply be 100% of the available vertical space.
          // However, we also need to do this for the element two levels up
          // otherwise it defaults to a tighter layout. Note that this is
          // essentially a hack since there is no guarantee the DOM will remain
          // constant in future inside Jupyter, so this should be fixed at the
          // Jupyter level ideally.
          this.el.style.setProperty('height', '100%', '');
          this.el.parentNode.parentNode.style.setProperty('height', '100%')

          // Once we do this, the current element will expand to the full size
          // of the panel. We then use offsetWidth and offsetHeight to get the
          // real size of the current element.
          width = this.el.offsetWidth;
          height = this.el.offsetHeight;

          // Finally we set the size of the iframe - however we subtract a
          // little to account for the fact that there is a margin in the
          // Jupyter panel. Again this is not ideal to have hard-coded so we
          // need to find a better solution in the long term.
          iframe.width = width - 10;
          iframe.height = height - 10;

        }

      }

    },

    handle_custom_message: function(msg) {

      if (this.wwt_window == null && !this._try_init_wwt_window()) {
        return;
      }

      if (msg['url'] != null && msg['url'].slice(4) == '/wwt') {
        msg['url'] = this.wwt_base_url + msg['url'];
      }

      this.wwt_window.wwt_apply_json_message(this.wwt_window.wwt, msg);

      if (msg['event'] === 'center_on_coordinates') {
          this.update_view_data();
      }
    },

    update_view_data: function () {
        if ((this.wwt_window == null && !this._try_init_wwt_window()) || !this.wwt_window.wwt) {
            return;
        }

        var needUpdate = false;

        if (this.model.get('_ra') != this.wwt_window.wwt.getRA()) {
          this.model.set({ '_ra': this.wwt_window.wwt.getRA() });
          needUpdate = true;
        }

        if (this.model.get('_dec') != this.wwt_window.wwt.getDec()) {
          this.model.set({ '_dec': this.wwt_window.wwt.getDec() });
          needUpdate = true;
        }

        if (this.model.get('_fov') != this.wwt_window.wwt.get_fov()) {
          this.model.set({ '_fov': this.wwt_window.wwt.get_fov() });
          needUpdate = true;
        }

        if (needUpdate) {
          this.touch();
        }
    }

});


module.exports = {
    WWTModel : WWTModel,
    WWTView : WWTView
};
