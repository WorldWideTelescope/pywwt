var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var version = require('./index').version;

var WWTModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {

        _model_name : 'WWTModel',
        _model_module : 'pywwt',
        _model_module_version : version,

        _view_name : 'WWTView',
        _view_module : 'pywwt',
        _view_module_version : version,

        _ra : 0.0,
        _dec : 0.0,
        _fov : 60.0,
        _datetime : '2017-03-09T16:30:00',

    })
});

var WWTView = widgets.DOMWidgetView.extend({

    initialize: function() {

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

        // Monitor the view data so that we can transmit updates. We handle the
        // clock specially so as not to be sending updates continually.
        this.lastClockUpdate = 0;
        var self = this;
        setInterval(function () { self.update_view_data(); }, 150);
    },

    _try_init_wwt_window: function() {
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

    // Note: processPhosphorMessage is needed for Jupyter Lab <2 and
    // processLuminoMessage is needed for Jupyter Lab 2.0+

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

    processLuminoMessage: function(msg) {
        // We listen for lumino resize events so that when Jupyter Lab is
        // used, we adjust the canvas size to the tab/panel in Jupyter Lab.
        // See relayout for more details.
        WWTView.__super__.processLuminoMessage.apply(this, arguments);
        switch (msg.type) {
        case 'resize':
        case 'after-show':
            this.relayout();
            break;
        }
    },

    relayout: function() {
        // Only do resizing if we are not in the notebook context but in a
        // split panel context. We find this out by checking if one of the
        // parents of the current element has the jp-MainAreaWidget class --
        // either the fourth or the third, depending on which version of
        // JupyterLab is being used.
        parent = this.el.parentNode.parentNode.parentNode;

        if (!parent.classList.contains("jp-MainAreaWidget")) {
            parent = parent.parentNode;

            if (!parent.classList.contains("jp-MainAreaWidget")) {
                // OK, neither has the class; looks like we're not in the Lab.
                // Nothing to do here.
                return;
            }
        }

        // Note that the approach below assumes that the WWT widget is the
        // only output in the split panel, but if not, then we might end up
        // with a size that is too large, so this should be fixed in future.
        //
        // We now check whether the iframe is actually present inside this
        // element. If not, there's no view to monkey with.
        iframe = this.el.getElementsByTagName('iframe')[0];
        if (iframe == null)
            return;

        // The height of the widget element defaults to 400 pixels, but here
        // we change it to simply be 100% of the available vertical space.
        // However, we also need to do this for the element two levels up
        // otherwise it defaults to a tighter layout. Note that this is
        // essentially a hack since there is no guarantee the DOM will remain
        // constant in future inside Jupyter, so this should be fixed at the
        // Jupyter level ideally.
        this.el.style.setProperty('height', '100%', '');
        this.el.parentNode.parentNode.style.setProperty('height', '100%');

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
    },

    handle_custom_message: function(msg) {
        if (this.wwt_window == null && !this._try_init_wwt_window()) {
            return;
        }

        if (msg['url'] != null && msg['url'].slice(4) == '/wwt') {
            msg['url'] = this.wwt_base_url + msg['url'];
        }

        // If the user has created a view for our widget and then hidden it, our
        // iframe gets removed and all sorts of things stop working (e.g.,
        // Chrome will refuse to send XMLHttpRequests anymore, and Firefox won't
        // set timeouts). If we let exceptions from these operations bubble up,
        // they break the code that applies widget events to *all* views, which
        // then breaks the JupyterLab use case of (1) setting up a WWT widget,
        // (2) creating a view of it in a separate tab, and then (3) hiding the
        // view in the original notebook, because the second view will never
        // receive any messages. We should handle things better when widgets get
        // hidden, but in the meantime, try to keep things limping along by
        // swallowing exceptions here. Note that this approach will mean that
        // the two views will get out of sync regarding, e.g., image layers that
        // have been loaded.

        try {
            this.wwt_window.wwt_apply_json_message(this.wwt_window.wwt, msg);

            switch(msg['event']) {
                case 'load_tour':
                case 'resume_tour':
                case 'pause_tour':
                case 'resume_time':
                case 'pause_time':
                case 'set_datetime':
                    this.lastClockUpdate = 0;
                    break;
            }
        } catch (e) {
            console.log('failed to process custom_message for a pyWWT Jupyter widget view:');
            console.log(msg);
            (console.error || console.log).call(console, e.stack || e);
        }
    },

    // This function is called very frequently, so we make sure to not send
    // updates unless something has changed. Ideally we'd be triggered on
    // updates rather than polling, but we're not well set up to do that right
    // now.
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

        // By default, the clock is always ticking. We throttle updates by having
        // the listener extrapolate the clock itself given reference times and the
        // "time rate".
        //
        // For compatibility reasons, the engine's time must be exposed using a
        // trait named `_datetime`. If any of the time-related parameters are
        // changed discontinuously, set lastClockUpdate to 0 to force an update.
        var nowUnixMs = Date.now();
        var updateTimeParams = (nowUnixMs - this.lastClockUpdate) > 60000;

        if (updateTimeParams) {
            var stc = this.wwt_window.wwtlib.SpaceTimeController;
            var rate = stc.get_timeRate();

            if (!stc.get_syncToClock()) {
                // When time is paused by setting syncToClock to false, the WWT
                // "rate" remains unchanged, but as far as the Python layer is
                // concerned, the rate should be 0.
                rate = 0.0;
            }

            this.model.set({
                '_datetime': stc.get_now().toISOString(),
                '_systemDatetime': (new Date()).toISOString(),
                '_timeRate': rate
            });

            this.lastClockUpdate = nowUnixMs;
            needUpdate = true;
        }

        if (needUpdate) {
            this.touch();
        }
    }
});

module.exports = {
    WWTModel: WWTModel,
    WWTView: WWTView
};
