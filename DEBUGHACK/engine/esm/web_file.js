// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Files downloaded over the web.

import { ss } from "./ss.js";
import { registerType, registerEnum } from "./typesystem.js";
import { URLHelpers } from "./url_helpers.js";


// wwtlib.StateType

export var StateType = {
    pending: 0,
    received: 1,
    error: 2
};

registerType("StateType", StateType);
registerEnum("StateType", StateType);


// wwtlib.WebFile

export function WebFile(url) {
    this._state = 0;
    this.responseType = '';
    this._triedOnce = false;
    this._url = url;
}

var WebFile$ = {
    send: function () {
        // There used to be code here to work with IE 8/9, but we're not
        // worrying about those anymore.
        if (typeof navigator === "undefined") { return; }
        this._CORS();
        this.set_state(StateType.pending);
    },

    get_message: function () {
        return this._message;
    },

    get_state: function () {
        return this._state;
    },

    set_state: function (value) {
        this._state = value;
        if (this.onStateChange != null) {
            this.onStateChange();
        }
        return value;
    },

    _loadData: function (textReceived) {
        // received data, set the state vars and send statechange
        this._data = textReceived;
        this.set_state(StateType.received);
    },

    _loadBlob: function (blob) {
        // received data, set the state vars and send statechange
        this._blobdata = blob;
        this.set_state(StateType.received);
    },

    _error: function () {
        this._message = ss.format('Error encountered loading {0}', this._url);
        this.set_state(StateType.error);
    },

    _timeOut: function () {
        this._message = ss.format('Timeout encountered loading {0}', this._url);
        this.set_state(StateType.error);
    },

    _CORS: function () {
        var $this = this;

        this._xhr = new XMLHttpRequest();
        try {
            this._xhr.open('GET', this._url);
            if (this.responseType != null) {
                this._xhr.responseType = this.responseType;
            }
            this._xhr.onreadystatechange = function () {
                if ($this._xhr.readyState === 4) {
                    if (!$this._xhr.status) {
                        if (!$this._triedOnce) {
                            $this._triedOnce = true;
                            $this._xhr.onreadystatechange = null;
                            var new_url = URLHelpers.singleton.activateProxy($this._url);

                            // null => don't bother: we know that the proxy won't help
                            if (new_url !== null) {
                                $this._url = new_url;
                                $this._CORS();
                            } else {
                                $this._message = $this._xhr.statusText;
                                $this.set_state(StateType.error);
                            }
                        }
                    } else {
                        if ($this._xhr.status >= 400) {
                            $this._message = $this._xhr.statusText;
                            $this.set_state(StateType.error);
                        } else {
                            if (!$this.responseType) {
                                $this._loadData($this._xhr.responseText);
                            } else {
                                $this._loadBlob($this._xhr.response);
                            }
                        }
                    }
                }
            };
            this._xhr.send();
        } catch (err) {
            this._message = err.message;
            this.set_state(StateType.error);
            throw err;
        }
    },

    getText: function () {
        return this._data;
    },

    getBlob: function () {
        return this._blobdata;
    },

    getXml: function () {
        var xParser = new DOMParser();
        return xParser.parseFromString(this._data, 'text/xml');
    }
};

registerType("WebFile", [WebFile, WebFile$, null]);
