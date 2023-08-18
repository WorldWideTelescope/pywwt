// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Writing XML.

import { registerType, registerEnum } from "../typesystem.js";
import { ss } from "../ss.js";


// wwtlib.Formatting

export var Formatting = {
    indented: 1
};

registerType("Formatting", Formatting);
registerEnum("Formatting", Formatting);


// wwtlib.XmlTextWriter

export function XmlTextWriter() {
    this.body = "<?xml version='1.0' encoding='UTF-8'?>\r\n";
    this.formatting = 1;
    this._elementStack = new ss.Stack();
    this._pending = false;
    this._currentName = '';
    this._attributes = {};
    this._value = '';
}

var XmlTextWriter$ = {
    _pushNewElement: function (name) {
        //write pending element and attributes
        this._writePending(false);

        //Push new attribute on to stack
        this._elementStack.push(name);

        //setup pending structures
        this._pending = true;
        this._currentName = name;
    },

    _writePending: function (fullClose) {
        var closed = true;
        if (this._pending) {
            for (var i = 1; i < this._elementStack.count; i++) {
                this.body += '  ';
            }
            this.body += '<' + this._currentName;
            if (ss.keyCount(this._attributes) > 0) {
                var $enum1 = ss.enumerate(ss.keys(this._attributes));
                while ($enum1.moveNext()) {
                    var key = $enum1.current;
                    this.body += ss.format(' {0}="{1}"', key, this._attributes[key]);
                }
            }
            if (!ss.emptyString(this._value)) {
                this.body += '>';
                closed = false;
                if (!ss.emptyString(this._value)) {
                    this.body += this._value;
                }
            }
            else {
                if (fullClose) {
                    this.body += ' />\r\n';
                    closed = true;
                }
                else {
                    this.body += '>\r\n';
                }
            }
            this._pending = false;
            this._currentName = '';
            this._value = '';
            this._attributes = {};
            return closed;
        }
        return false;
    },

    _writeProcessingInstruction: function (v1, v2) { },

    _writeStartElement: function (name) {
        this._pushNewElement(name);
    },

    _writeAttributeString: function (key, value) {
        if (value != null) {
            this._attributes[key] = ss.replaceString(value.toString(), '&', '&amp;');
        } else {
            this._attributes[key] = '';
        }
    },

    _writeEndElement: function () {
        if (!this._writePending(true)) {
            for (var i = 1; i < this._elementStack.count; i++) {
                this.body += '  ';
            }
            this.body += ss.format('</{0}>\r\n', this._elementStack.pop());
        } else {
            this._elementStack.pop();
        }
    },

    _writeString: function (text) {
        this._value = ss.replaceString(text, '&', '&amp;');
    },

    _writeFullEndElement: function () {
        this._writePending(false);
        for (var i = 1; i < this._elementStack.count; i++) {
            this.body += '  ';
        }
        this.body += ss.format('</{0}>\r\n', this._elementStack.pop());
    },

    _close: function () { },

    _writeElementString: function (name, value) {
        this._writeStartElement(name);
        this._writeValue(ss.replaceString(value, '&', '&amp;'));
        this._writeEndElement();
    },

    _writeValue: function (val) {
        this._value = ss.replaceString(val, '&', '&amp;');
    },

    _writeCData: function (htmlDescription) {
        this._value = ss.format('<![CDATA[{0}]]>', htmlDescription);
    }
};

registerType("XmlTextWriter", [XmlTextWriter, XmlTextWriter$, null]);
