// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Blend state.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";


// wwtlib.BlendState

export function BlendState() {
    this._switchedTime = new Date(1990, 0, 0, 0, 0, 0, 0);
    this._state = false;
    this._targetState = this._state;
    this._delayTime = 1000;
}

BlendState.create = function (initialState, delayTime) {
    var temp = new BlendState();
    temp._state = initialState;
    temp._targetState = initialState;
    temp._delayTime = delayTime;
    return temp;
};

var BlendState$ = {
    get_state: function () {
        if (this._targetState !== this._state) {
            var ts = ss.now() - this._switchedTime;
            if (ts > this._delayTime) {
                this._state = this._targetState;
            }
            return true;
        }
        return this._state;
    },

    set_state: function (value) {
        this._switchedTime = new Date(1990, 0, 0, 0, 0, 0, 0);
        this._state = value;
        this._targetState = this._state;
        return value;
    },

    get_targetState: function () {
        return this._targetState;
    },

    set_targetState: function (value) {
        if (this._targetState !== value) {
            this._switchedTime = ss.now();
            this._targetState = value;
        }
        return value;
    },

    get_opacity: function () {
        if (this._targetState !== this._state) {
            var ts = ss.now() - this._switchedTime;
            if (ts > this._delayTime) {
                this._state = this._targetState;
            }
            else {
                var opacity = (ts / this._delayTime);
                return (this._targetState) ? opacity : 1 - opacity;
            }
        }
        return (this._state) ? 1 : 0;
    },

    get_delayTime: function () {
        return this._delayTime;
    },

    set_delayTime: function (value) {
        this._delayTime = value;
        return value;
    }
};

registerType("BlendState", [BlendState, BlendState$, null]);
