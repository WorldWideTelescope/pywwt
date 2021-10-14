// The main WWT ipywidgets (Jupyter widget) implementation.
//
// This used to use a hand-coded interface to the WWT engine, but now uses the
// "research app" and its standardized messaging framework. This package is
// needed to bridge the research app and ipywidgets. Our recommended way to use
// WWT in Jupyter is now to use the app extension, not this widget, but needs
// might vary.
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
// when they're reparented in the DOM, destroying the WWT state. For the same
// reason, the WWT state can also be destroyed if you hide and un-hide a single
// widget view in JupyterLab, unfortunately.
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
//
// Communication between the WWT app and the kernel (presumably Python/pywwt,
// but in principle other backends could be added) is done using JSON-compatible
// messages, documented as [@wwtelescope/research-app-messages]. The ipywidgets
// implementation is particularly gnarly because (1) each "widget" might
// actually talk to multiple apps, due to the model-view architecture of
// ipywidgets, and (2) each widget will receive messages from other widgets, due
// to the way that the Web messaging spec works. This layer has to do a lot of
// work to pretend to the kernel that it's only talking to one app.
//
// [@wwtelescope/research-app-messages]: https://docs.worldwidetelescope.org/webgl-reference/latest/apiref/research-app-messages/modules/classicpywwt.html

var widgets = require('@jupyter-widgets/base');
var _ = require("underscore");

var version = require('./index').version;

// The widget model class.
//
// For each ipywidget widget, there is one model in JS that synchronizes its
// state with a Python model over Jupyter's comms. Since WWT's state is actually
// in the view, the model is mostly concerned about relaying messages correctly.
// Which is a hairy busines, because not only does our one widget potentially
// have multiple views, but there are also potentially multiple active widgets,
// and we'll see all of their messages.
var WWTModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: 'WWTModel',
        _model_module: 'pywwt',
        _model_module_version: version,

        _view_name: 'WWTView',
        _view_module: 'pywwt',
        _view_module_version: version,

        _appUrl: ''
    }),

    initialize: function () {
        WWTModel.__super__.initialize.apply(this, arguments);

        // NOTE: we deliberately call the following twice to make sure that it
        // is properly set, due to a caching bug in some versions of JupyterLab.
        this.wwtBaseUrl = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();
        this.wwtBaseUrl = require('@jupyterlab/coreutils').PageConfig.getBaseUrl();

        // Management of our multiple views
        this._currentView = null;
        this._nextViewSeqNumber = 0;
        this._kernelThinksWidgetIsAlive = false;

        // We're not going to even try to honor updates to this property.
        const appUrl = this.canonicalizeUrl(this.get('_appUrl'));
        this._appOrigin = new URL(appUrl).origin;

        // Listen for events emerging from the kernel, via ipywidgets's "custom"
        // message API.
        this.on('msg:custom', this.processIpyWidgetsMessage, this);

        // Listen for events emerging from the apps. Note that this function will
        // receive messages from *all* views of *all* instantiated widgets, so
        // it needs to be picky about which events it pays attention to.

        const self = this;

        window.addEventListener(
            'message',
            function (event) { self.processDomWindowMessage(event); },
            false
        );
    },

    // The kernel can generate partial URLs, but doesn't (and can't) know the
    // full URL where data are ultimately exposed. So in various places we need
    // to edit URLs emerging from the client to make them complete.
    canonicalizeUrl: function (url) {
        // Sketchy heuristic to deal with the Jupyter "base URL", which still
        // isn't an absolute URL. It's a URL path used by multi-user Jupyter
        // servers and the like. The Python kernel code can determine the base
        // URL on its own, but it requires some super hackery (reading various
        // magical JSON config files and making API calls).
        if (url.slice(0, 4) == '/wwt') {
            if (this.wwtBaseUrl.slice(-1) == '/') {
                url = this.wwtBaseUrl.slice(0, -1) + url;
            } else {
                url = this.wwtBaseUrl + url;
            }
        }

        return new URL(url, location.toString()).toString();
    },

    // Get a unique ID and sequence number for distinguishing views. Note that
    // while each model might have multiple views, there might also be multiple
    // widget models too, and we have to distinguish them all.
    mintViewIds: function() {
        var seq = this._nextViewSeqNumber;
        this._nextViewSeqNumber++;
        return [this.model_id + "v" + seq, seq];
    },

    // Called by a widget view when the "liveness" state of its app changes.
    onViewStatusChange: function(view, alive) {
        if (alive) {
            // Should this view become the current view?
            //
            // TODO: if the current view changes, we should signal to the kernel
            // that its idea of the current view settings, preferences, layers,
            // etc. have all been invalidated. We don't currently have a
            // mechanism to do that.

            if (this._currentView === null || this._currentView.seqNumber < view.seqNumber) {
                this._currentView = view;
            }

            // Does the kernel need to be notified about the overall liveness?

            if (!this._kernelThinksWidgetIsAlive) {
                this._kernelThinksWidgetIsAlive = true;
                this.send({
                    _pywwtExpedite: true,
                    type: 'wwt_jupyter_widget_status',
                    alive: true
                });
            }
        } else {
            // Here we only care if we just lost the *current* view. If that
            // happened, we could imagine selecting a new current view from
            // among the other ones that are alive, but that raises a ton of
            // invalidation issues and doesn't really make sense within the
            // ipywidgets UX that we can offer. So, just clear out everything.

            if (this._currentView !== null && this._currentView.seqNumber == view.seqNumber) {
                this._currentView = null;

                if (this._kernelThinksWidgetIsAlive) {
                    this._kernelThinksWidgetIsAlive = false;
                    this.send({
                        _pywwtExpedite: true,
                        type: 'wwt_jupyter_widget_status',
                        alive: false
                    });
                }
            }
        }
    },

    // Relay a message from the kernel to the active view. In order to keep
    // things tractable, we only route messages to the "current" view. For
    // instance, if the client were to issue a data-request message and we
    // routed it to multiple views, we'd get multiple responses, with no
    // sensible way to know which to prefer.
    processIpyWidgetsMessage: function (msg) {
        if (this._currentView === null) {
            // We could queue up messages here. The kernel "shouldn't" send us
            // any messages until a view is ready, but it's always possible that
            // all of our views will go away after startup anyway.
            console.warn("pywwt jupyter widget: dropping message on floor", msg);
            return;
        }

        // The "official" implementation here is in
        // @wwtelescope/research-app-messages in
        // classic_pywwt.applyBaseUrlIfApplicable.
        if (msg['url']) {
            msg['url'] = this.canonicalizeUrl(msg['url']);
        }

        // If there are multiple active widgets (models+views), our listener
        // will get messages from all of them. In order to be able to
        // disambiguate, we need to make sure that threadIds are uniquified by
        // widget.
        //
        // On the other hand, we don't want to tag messages by *view*
        // unique-ids: if we send a message to one view, then another view
        // becomes active, then we get a reply to the earlier message, we should
        // still honor that reply.
        if (msg['threadId']) {
            msg['threadId'] = this.model_id + "|" + msg['threadId'];
        }

        this._currentView.relayIpyWidgetsMessage(msg);
    },

    // Process messages from the WWT apps, potentially relaying them to the
    // kernel.
    //
    // This is annoying because we're going to receive messages for all views
    // associated with all widgets. We need to pay attention to the right ones.
    //
    // The message is relayed to the kernel using ipywidgets "custom" messages,
    // which is basically trivial once we've dealt with the above.
    processDomWindowMessage: function (event) {
        var payload = event.data;

        if (event.origin !== this._appOrigin)
            return;

        // Unsolicited messages will be tagged with a sessionId. These should
        // match the sessionId associated with the "current" view -- the only
        // way that we can sensibly work in the ipywidgets framework is to
        // pretend non-current views don't exist.
        //
        // The ping-pong messages triggered by the views while waiting for the
        // apps to get ready will have sessionIds that don't match this scheme,
        // but that's OK because this function doesn't need to handle those
        // messages.
        if (payload['sessionId']) {
            if (!this._currentView || payload['sessionId'] != this._currentView.wwtId) {
                return;
            }
        }

        // Reply messages will be tagged with a threadId. We should make sure that
        // these are relevant to our widget (model ID) and un-munge our disambiguator.
        if (payload['threadId']) {
            const pieces = payload['threadId'].split('|');

            if (pieces[0] != this.model_id) {
                return;
            }

            payload['threadId'] = pieces.slice(1).join('|');
        }

        payload['_pywwtExpedite'] = true;
        this.send(payload);
    }
});

// The pywwt ipywidget view implementation.
//
// The views are the things that are actually connected to DOM elements. There
// may be multiple views for one JS model.
//
// Note that a view can be hidden, e.g. by clicking to the left of its
// containing cell. This removes the view element from the DOM but does not
// destroy the element. However, re-adding an iframe to the DOM causes it to
// reload, so hiding and re-showing a WWT view causes its internal state to be
// reset :-(
var WWTView = widgets.DOMWidgetView.extend({
    render: function () {
        this._appUrl = this.model.canonicalizeUrl(this.model.get('_appUrl'));
        this._appOrigin = new URL(this._appUrl).origin;

        const ids = this.model.mintViewIds();
        this.wwtId = ids[0];
        this.seqNumber = ids[1];

        var iframe = document.createElement('iframe');
        // Pass our origin so that the iframe can validate the provenance of the
        // messages that are posted to it. This isn't acceptable for real XSS
        // prevention, but so long as the research app can't do anything on behalf
        // of the user (which it can't right now because we don't even have
        // "users"), that's OK.
        iframe.src = this._appUrl + '?origin=' + encodeURIComponent(location.origin);
        iframe.style.setProperty('height', '400px', '');
        iframe.style.setProperty('width', '100%', '');
        iframe.style.setProperty('border', 'none', '');

        // 2021 June: Is this wrapper div still necessary?
        var div = document.createElement('div');
        div.appendChild(iframe);

        this.el.appendChild(div);

        // We need to ping the app to find out whether it's handling messages,
        // especially during the startup phase. While the model handles most of
        // the messaging stuff, it's a lot easier to handle the ready polling
        // here in the view.

        this._alive = false;
        this._lastPongTimestamp = 0;
        const self = this;

        window.addEventListener(
            'message',
            function (event) { self.processDomWindowMessage(event); },
            false
        );

        setInterval(function () { self.checkApp(); }, 1000);
    },

    checkApp: function() {
        // Send our next ping ...

        var window = this.tryGetWindow();
        if (window) {
            window.postMessage({
                type: "wwt_ping_pong",
                threadId: "" + Date.now(),
                sessionId: this.wwtId,
            }, this._appUrl);
        }

        // Has there been a recent pong?

        var alive = (Date.now() - this._lastPongTimestamp) < 2500;

        if (this._alive != alive) {
            this._alive = alive;
            this.model.onViewStatusChange(this, alive);
        }
    },

    // Process a message sent to the browser window. This function's only job is
    // to look for responses to our pings. It will be called for messages from
    // all views of all widgets, though, so it needs to be careful about which
    // messages to process.
    processDomWindowMessage: function (event) {
        var payload = event.data;

        if (event.origin !== this._appOrigin)
            return;

        if (payload.type == "wwt_ping_pong" && payload.sessionId == this.wwtId) {
            var ts = +payload.threadId;

            if (!isNaN(ts)) {
                this._lastPongTimestamp = ts;
            }
        }
    },

    // Called by the model when there's a message from the kernel that should go
    // to this view. The model "shouldn't" give us any messages if/when our
    // window is nonfunctional, but the window might always die underneath us.
    relayIpyWidgetsMessage: function (msg) {
        var window = this.tryGetWindow();
        if (!window) {
            // TODO? Tell the model that we failed?
            return;
        }

        window.postMessage(msg, this._appUrl);
    },

    // Note: processPhosphorMessage is needed for Jupyter Lab <2 and
    // processLuminoMessage is needed for Jupyter Lab 2.0+

    processPhosphorMessage: function (msg) {
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

    processLuminoMessage: function (msg) {
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

    relayout: function () {
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

    // Get the WWT window, if it is actually fully initialized. Note that in
    // JupyterLab if this widget view is hidden and then re-shown, the iframe
    // will reload, and the contentWindow will acquire a new value. So we can't
    // cache too aggressively.
    tryGetWindow: function () {
        var iframe = this.el.getElementsByTagName('iframe')[0];
        if (!iframe)
            return null;

        var window = iframe.contentWindow;
        if (!window)
            return null;

        return window;
    }
});

module.exports = {
    WWTModel: WWTModel,
    WWTView: WWTView,
};
