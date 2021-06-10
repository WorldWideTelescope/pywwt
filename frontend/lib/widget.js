// The main WWT ipywidgets implementation.
//
// The most important thing to remember about this implementation is that
// IPywidgets has a model/view breakdown: on the JavaScript/browser side, you
// can have multiple "views" of one underlying "model", which in turn
// synchronizes its state with a Python kernel using Jupyter's comms.
//
// In most cases, there will be only one view per model, but there is at least
// one important exception: in JupyterLab, you can create a WWT viewer in a
// Python notebook, then right-click and "Create a new view" of it to pop it
// open into a new JupyterLab frame. This is great for usability since it
// prevents the WWT view from scrolling off the page as you work in your
// notebook.
//
// The problem is that due to the (current) WWT architecture, all of the widget
// state is necessarily stored in the widget view, inside the WWT <iframe>. So
// if you create a new view of an existing widget, we can't realistically ensure
// that they stay in sync. This is especially tricky since we want the user to
// be able to, say, get the current RA/dec of the WWT widget, which is simply
// not a well-defined quantity if there are two different views active.
//
// My initial thought was that we could create one <iframe> and "warp" it
// between views, but that turns out not to work because iframes are reloaded
// when they're reparented in the DOM, destroying the WWT state.
//
// Given these constraints, our current approach is:
//
// - The model has an idea of the "current" view, which is currently simply the
//   one that was most recently created that still exists.
//
// - Queries for parameters such as the current RA/dec are understood to refer
//   to the current view.
//
// - New views are understood to be created as "clean slates" compared to
//   preexisting views. We could try to inherit properties of the current view,
//   but don't right now.

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
        _viewConnected : false,
    }),

    initialize: function() {
        WWTModel.__super__.initialize.apply(this, arguments);

        // NOTE: we deliberately call the following twice to make sure that it
        // is properly set, due to a caching bug in some versions of JupyterLab.
        this.wwtBaseUrl = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();
        this.wwtBaseUrl = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();

        this.wwtViewDivs = [];
        this.currentViewWindowId = 0;
        this.nextViewWindowId = 1;

        // Monitor the view data so that we can transmit updates. We handle the
        // clock specially so as not to be sending updates continually.
        this.lastClockUpdate = 0;
        var self = this;
        setInterval(function () { self.updateViewData(); }, 150);
        this.on('msg:custom', this.handleCustomMessage, this);
    },

    // This function is called very frequently, so we must make sure to not send
    // updates unless something has changed. (If you're viewing a notebook
    // running on a remote server, that's constant cross-internet traffic!)
    // Ideally we'd be triggered on updates rather than polling, but we're not
    // well set up to do that right now, especially given the possible presence
    // of multiple views.
    updateViewData: function () {
        var needUpdate = false;
        var window = this.getCurrentWindow();
        var viewConnected = (window !== null);

        if (this.get('_viewConnected') != viewConnected) {
            this.set({ '_viewConnected': viewConnected });
            needUpdate = true;
        }

        if (window === null) {
            if (needUpdate) {
                this.save_changes();
            }

            return;
        }

        if (this.get('_ra') != window.wwt.getRA()) {
            this.set({ '_ra': window.wwt.getRA() });
            needUpdate = true;
        }

        if (this.get('_dec') != window.wwt.getDec()) {
            this.set({ '_dec': window.wwt.getDec() });
            needUpdate = true;
        }

        if (this.get('_fov') != window.wwt.get_fov()) {
            this.set({ '_fov': window.wwt.get_fov() });
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
            var stc = window.wwtlib.SpaceTimeController;
            var rate = stc.get_timeRate();

            if (!stc.get_syncToClock()) {
                // When time is paused by setting syncToClock to false, the WWT
                // "rate" remains unchanged, but as far as the Python layer is
                // concerned, the rate should be 0.
                rate = 0.0;
            }

            this.set({
                '_datetime': stc.get_now().toISOString(),
                '_systemDatetime': (new Date()).toISOString(),
                '_timeRate': rate,
            });

            this.lastClockUpdate = nowUnixMs;
            needUpdate = true;
        }

        if (needUpdate) {
            this.save_changes();
        }
    },

    // Make sure that we fully sync up our state with the current view. At the
    // moment, all we need to do is ensure that the clock is resynced.
    // Everything else is stateless.
    forceViewDataUpdate: function() {
        this.lastClockUpdate = 0;
    },

    // The views do all of the real work in message processing, but we do keep
    // an eye out to know when to force a clock update.
    handleCustomMessage: function(msg) {
        switch(msg['event']) {
            case 'load_tour':
            case 'resume_tour':
            case 'pause_tour':
            case 'resume_time':
            case 'pause_time':
            case 'set_datetime':
                this.forceViewDataUpdate();
                break;
        }
    },

    // There is a `views` attribute that is a dict of promises to known views,
    // but for our purposes it's easiest to DIY, since there is a lot of
    // unpredictable timing having to do with iframe creation and destruction.
    registerViewDiv: function(div) {
        this.wwtViewDivs.splice(0, 0, div);

        // An update should be forced by getCurrentWindow() noticing that we're
        // looking at a new div, but it doesn't hurt to double-force.
        this.forceViewDataUpdate();
    },

    // Note that this will still work if multiple views are created and
    // destroyed. It is hard to imagine that the list of divs will ever get long
    // enough to be an issue. Famous last words?
    getCurrentWindow: function() {
        for (var i = 0; i < this.wwtViewDivs.length; i++) {
            var iframe = this.wwtViewDivs[i].getElementsByTagName('iframe')[0];
            if (!iframe)
                continue;

            var window = iframe.contentWindow;
            if (!window)
                continue;

            if (!window.wwt)
                continue;

            // OK, we have our winner! If it is a different view than before,
            // make sure to force-update the model values. Hiding and re-showing
            // the same div reloads the WWT iframe, which causes the engine
            // state to be reset. So even if the active div hasn't changed, we
            // might still need a force.

            if (window.wwtWidgetModelId === undefined) {
                window.wwtWidgetModelId = this.nextViewWindowId;
                this.nextViewWindowId += 1;
            }

            if (window.wwtWidgetModelId != this.currentViewWindowId) {
                this.currentViewWindowId = window.wwtWidgetModelId;
                this.forceViewDataUpdate();
            }

            return window;
        }

        return null;
    },
});

// Note that a view can be hidden, e.g. by clicking to the left of its
// containing cell. This removes the view element from the DOM but does not
// destroy the element. However, re-adding an iframe to the DOM causes it to
// reload, so hiding and re-showing a WWT view causes its internal state to be
// reset :-(
var WWTView = widgets.DOMWidgetView.extend({
    initialize: function() {
        // TODO: I this could just be put in render now?
        var div = document.createElement("div");
        div.innerHTML = "<iframe width='100%' height='400' style='border: none;' src='" + this.model.wwtBaseUrl + "wwt/wwt.html'></iframe>"
        this.el.appendChild(div);
        this.model.registerViewDiv(div);

        WWTView.__super__.initialize.apply(this, arguments);
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

    // Get the WWT window, if it is actually fully initialized. Note that
    // if this widget view is hidden and then re-shown, the iframe will reload,
    // and the contentWindow will acquire a new value. So we can't cache too
    // aggressively.
    tryGetWindow: function() {
        var iframe = this.el.getElementsByTagName('iframe')[0];
        if (!iframe)
            return null;

        var window = iframe.contentWindow;
        if (!window)
            return null;

        if (!window.wwt)
            return null; // not fully initialized yet

        return window;
    },

    handle_custom_message: function(msg) {
        var window = this.tryGetWindow();
        if (!window) {
            // TODO? we could queue up messages and replay them once the window
            // is ready. But if we've been hidden, that might take a long time
            // to happen. And it's not clear how we'd find out *when* the window
            // is ready anyway.
            return;
        }

        if (msg['url'] != null && msg['url'].slice(4) == '/wwt') {
            msg['url'] = this.model.wwtBaseUrl + msg['url'];
        }

        // If the user has created a view for our widget and then hidden it, our
        // iframe gets removed and all sorts of things stop working (e.g.,
        // Chrome will refuse to send XMLHttpRequests anymore, and Firefox won't
        // set timeouts). If we let exceptions from these operations bubble up,
        // they break the code that applies widget events to *all* views We
        // should handle things better when widgets get hidden, but in the
        // meantime, try to keep things limping along by swallowing exceptions
        // here.

        try {
            window.wwt_apply_json_message(window.wwt, msg);
        } catch (e) {
            console.log('failed to process custom_message for a pyWWT Jupyter widget view:');
            console.log(msg);
            (console.error || console.log).call(console, e.stack || e);
        }
    },
});

module.exports = {
    WWTModel: WWTModel,
    WWTView: WWTView,
};
