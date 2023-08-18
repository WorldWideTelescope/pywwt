// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A manually-built HTML based input dialog.

import { registerType } from "../typesystem.js";
import { ss } from "../ss.js";


// wwtlib.SimpleInput

export function SimpleInput(title, label, text, v3) {
    this.title = 'Tile';
    this.label = 'Enter Text Below';
    this.text = '';
    this._textElement = null;
    this._ignoreNextClick = false;
    this.title = title;
    this.label = label;
    this.text = text;
}

var SimpleInput$ = {
    showDialog: function () {
        return 1;
    },

    nonMenuClick: function (e) {
        if (!this._ignoreNextClick) {
            this._close();
        }
        this._ignoreNextClick = false;
    },

    show: function (position, callback) {
        var simpleInputElement = document.getElementById('simpleinput');
        var modalElement = document.getElementById('simplemodal');
        modalElement.style.display = 'block';
        simpleInputElement.style.display = 'block';
        simpleInputElement.style.marginLeft = position.x.toString() + 'px';
        simpleInputElement.style.marginTop = position.y.toString() + 'px';
        this._textElement = document.getElementById('inputtext');
        this._textElement.value = this.text;
        var titleDiv = document.getElementById('simpletitle');
        var labelDiv = document.getElementById('inputlabel');
        titleDiv.innerText = this.title;
        labelDiv.innerText = this.label;
        this._textElement.addEventListener('change', ss.bind('textChanged', this), false);
        this._textElement.addEventListener('click', ss.bind('ignoreMe', this), true);
        var okButton = document.getElementById('simpleinputok');
        var cancelButton = document.getElementById('simpleinputcancel');
        okButton.addEventListener('click', ss.bind('okClicked', this), false);
        cancelButton.addEventListener('click', ss.bind('cancelClicked', this), false);
        this._okCallback = callback;
    },

    okClicked: function (e) {
        this._close();
        if (this._okCallback != null) {
            this._okCallback();
        }
    },

    cancelClicked: function (e) {
        this._close();
    },

    _close: function () {
        var simpleInputElement = document.getElementById('simplemodal');
        simpleInputElement.style.display = 'none';
        this._textElement.removeEventListener('change', ss.bind('textChanged', this), false);
        var okButton = document.getElementById('simpleinputok');
        var cancelButton = document.getElementById('simpleinputcancel');
        okButton.removeEventListener('click', ss.bind('okClicked', this), false);
        cancelButton.removeEventListener('click', ss.bind('cancelClicked', this), false);
    },

    ignoreMe: function (e) {
        this._ignoreNextClick = true;
    },

    textChanged: function (e) {
        this.text = this._textElement.value;
        this._ignoreNextClick = true;
    }
};

registerType("SimpleInput", [SimpleInput, SimpleInput$, null]);
