// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Top-level information about a tour.

import pako from "pako";

import { ss } from "../ss.js";
import { registerType, registerEnum } from "../typesystem.js";
import { Util } from "../baseutil.js";
import { Color, Colors } from "../color.js";
import { IUiController } from "../interfaces.js";
import { Guid } from "../util.js";


// wwtlib.AltUnits

export var AltUnits = {
    meters: 1,
    feet: 2,
    inches: 3,
    miles: 4,
    kilometers: 5,
    astronomicalUnits: 6,
    lightYears: 7,
    parsecs: 8,
    megaParsecs: 9,
    custom: 10
};

registerType("AltUnits", AltUnits);
registerEnum("AltUnits", AltUnits);


// wwtlib.FadeType

export var FadeType = {
    fadeIn: 1,
    fadeOut: 2,
    both: 3,
    none: 4
};

registerType("FadeType", FadeType);
registerEnum("FadeType", FadeType);


// wwtlib.DomainValue

export function DomainValue(text, markerIndex) {
    this.markerIndex = 4;
    this.customMarker = null;
    this.text = text;
    this.markerIndex = markerIndex;
}

var DomainValue$ = {};

registerType("DomainValue", [DomainValue, DomainValue$, null]);


// wwtlib.Layer

export function Layer() {
    this.id = Guid.newGuid();
    this.loadedFromTour = false;
    this.tourDocument = null;
    this.opacity = 1;
    this.opened = false;
    this._startTime = ss.date('01/01/1900');
    this._endTime = ss.date('01/01/2100');
    this._fadeSpan = 0;
    this._fadeType = 4;
    this.version = 0;
    this.color = Colors.get_white();
    this.enabled = true;
    this.astronomical = false;
}

var Layer$ = {
    getPrimaryUI: function () {
        return null;
    },

    getFileStreamUrl: function (filename) {
        if (this.tourDocument != null) {
            return this.tourDocument.getFileStream(filename);
        }
        return null;
    },

    get_opacity: function () {
        return this.opacity;
    },

    set_opacity: function (value) {
        if (this.opacity !== value) {
            this.version++;
            this.opacity = value;
        }
        return value;
    },

    get_opened: function () {
        return this.opened;
    },

    set_opened: function (value) {
        if (this.opened !== value) {
            this.version++;
            this.opened = value;
        }
        return value;
    },

    get_startTime: function () {
        return this._startTime;
    },

    set_startTime: function (value) {
        if (!ss.compareDates(this._startTime, value)) {
            this.version++;
            this._startTime = value;
        }
        return value;
    },

    get_endTime: function () {
        return this._endTime;
    },

    set_endTime: function (value) {
        if (!ss.compareDates(this._endTime, value)) {
            this.version++;
            this._endTime = value;
        }
        return value;
    },

    get_fadeSpan: function () {
        return this._fadeSpan;
    },

    set_fadeSpan: function (value) {
        this.version++;
        this._fadeSpan = value;
        return value;
    },

    get_fadeType: function () {
        return this._fadeType;
    },

    set_fadeType: function (value) {
        if (this._fadeType !== value) {
            this.set_version(this.get_version() + 1) - 1;
            this._fadeType = value;
        }
        return value;
    },

    get_version: function () {
        return this.version;
    },

    set_version: function (value) {
        this.version = value;
        return value;
    },

    findClosest: function (target, distance, closestPlace, astronomical) {
        return closestPlace;
    },

    hoverCheckScreenSpace: function (cursor) {
        return false;
    },

    clickCheckScreenSpace: function (cursor) {
        return false;
    },

    draw: function (renderContext, opacity, flat) {
        return true;
    },

    preDraw: function (renderContext, opacity) {
        return true;
    },

    updateData: function (data, purgeOld, purgeAll, hasHeader) {
        return true;
    },

    // "updateData" used to be named this. We add this function as a
    // compatibility shim just in case there's some JavaScript out there
    // still using the old name.
    upadteData: function (data, purgeOld, purgeAll, hasHeader) {
        return this.updateData(data, purgeOld, purgeAll, hasHeader);
    },

    canCopyToClipboard: function () {
        return false;
    },

    copyToClipboard: function () {
        return;
    },

    getParams: function () {
        var paramList = new Array(5);
        paramList[0] = this.color.r / 255;
        paramList[1] = this.color.g / 255;
        paramList[2] = this.color.b / 255;
        paramList[3] = this.color.a / 255;
        paramList[4] = this.opacity;
        return paramList;
    },

    setParams: function (paramList) {
        if (paramList.length === 5) {
            this.opacity = paramList[4];
            this.color = Color.fromArgb((paramList[3] * 255), (paramList[0] * 255), (paramList[1] * 255), (paramList[2] * 255));
        }
    },

    getParamNames: function () {
        return ['Color.Red', 'Color.Green', 'Color.Blue', 'Color.Alpha', 'Opacity'];
    },

    getEditUI: function () {
        return ss.safeCast(this, IUiController);
    },

    cleanUp: function () { },

    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        if (this._name !== value) {
            this.version++;
            this._name = value;
        }
        return value;
    },

    toString: function () {
        return this._name;
    },

    get_referenceFrame: function () {
        return this.referenceFrame;
    },

    set_referenceFrame: function (value) {
        this.referenceFrame = value;
        return value;
    },

    getProps: function () {
        return '';
    },

    get_color: function () {
        return this.color;
    },

    set_color: function (value) {
        if (this.color !== value) {
            this.color = value;
            this.version++;
        }
        return value;
    },

    colorChanged: function () { },

    get_colorValue: function () {
        return this.get_color().toString();
    },

    set_colorValue: function (value) {
        this.set_color(Color.fromName(value));
        return value;
    },

    // These named accessor functions were added so that we can support
    // `enabled` as a "setting" in our TypeScript framework, without breaking
    // anything that might rely on `this.enabled` being a genuine bool.
    get_enabled: function () {
        return this.enabled;
    },

    set_enabled: function (value) {
        this.enabled = value;
        return value;
    },

    get_astronomical: function () {
        return this.astronomical;
    },

    set_astronomical: function (value) {
        if (this.astronomical !== value) {
            this.version++;
            this.astronomical = value;
        }
        return value;
    },

    getTypeName: function () {
        return 'TerraViewer.Layer';
    },

    saveToXml: function (xmlWriter) {
        xmlWriter._writeStartElement('Layer');
        xmlWriter._writeAttributeString('Id', this.id.toString());
        xmlWriter._writeAttributeString('Type', this.getTypeName());
        xmlWriter._writeAttributeString('Name', this.get_name());
        xmlWriter._writeAttributeString('ReferenceFrame', this.referenceFrame);
        xmlWriter._writeAttributeString('Color', this.color.save());
        xmlWriter._writeAttributeString('Opacity', this.opacity.toString());
        xmlWriter._writeAttributeString('StartTime', Util.xmlDate(this.get_startTime()));
        xmlWriter._writeAttributeString('EndTime', Util.xmlDate(this.get_endTime()));
        xmlWriter._writeAttributeString('FadeSpan', this.get_fadeSpan().toString());
        xmlWriter._writeAttributeString('FadeType', this.get_fadeType().toString());
        this.writeLayerProperties(xmlWriter);
        xmlWriter._writeEndElement();
    },

    writeLayerProperties: function (xmlWriter) {
        return;
    },

    initializeFromXml: function (node) { },

    initFromXml: function (node) {
        this.id = Guid.fromString(node.attributes.getNamedItem('Id').nodeValue);
        this.set_name(node.attributes.getNamedItem('Name').nodeValue);
        this.referenceFrame = node.attributes.getNamedItem('ReferenceFrame').nodeValue;
        this.color = Color.load(node.attributes.getNamedItem('Color').nodeValue);
        this.opacity = parseFloat(node.attributes.getNamedItem('Opacity').nodeValue);
        if (node.attributes.getNamedItem('StartTime') != null) {
            this.set_startTime(new Date(node.attributes.getNamedItem('StartTime').nodeValue));
        }
        if (node.attributes.getNamedItem('EndTime') != null) {
            this.set_endTime(new Date(node.attributes.getNamedItem('EndTime').nodeValue));
        }
        if (node.attributes.getNamedItem('FadeSpan') != null) {
            this.set_fadeSpan(Util.parseTimeSpan(node.attributes.getNamedItem('FadeSpan').nodeValue));
        }
        if (node.attributes.getNamedItem('FadeType') != null) {
            switch (node.attributes.getNamedItem('FadeType').nodeValue) {
                case 'In':
                    this.set_fadeType(1);
                    break;
                case 'Out':
                    this.set_fadeType(2);
                    break;
                case 'Both':
                    this.set_fadeType(3);
                    break;
                case 'None':
                    this.set_fadeType(4);
                    break;
                default:
                    break;
            }
        }
        this.initializeFromXml(node);
    },

    loadData: function (doc, filename) {
        return;
    },

    addFilesToCabinet: function (fc) {
        return;
    },

    // This method decompresses a blob into a string, and if the string cannot be decompressed
    // due to an invalid header, we assume the blob is not compressed and return the string
    // as-is.
    getStringFromGzipBlob: function (blob, dataReady) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
            var result = '';
            try {
                result = pako.inflate(e.target.result, { to: 'string' });
            }
            catch (err) {
                var errString = err.toString();
                if (errString === 'incorrect header check' || errString === 'unknown compression method') {
                    result = String.fromCharCode.apply(null, new Uint8Array(e.target.result));
                }
                else {
                    throw err;
                }
            }
            dataReady(result);
        };
        reader.readAsArrayBuffer(blob);
    }
};

registerType("Layer", [Layer, Layer$, null]);


// wwtlib.LayerCollection

export function LayerCollection() {
    Layer.call(this);
}

var LayerCollection$ = {
    draw: function (renderContext, opacity, flat) {
        return Layer.prototype.draw.call(this, renderContext, opacity, false);
    }
};

registerType("LayerCollection", [LayerCollection, LayerCollection$, Layer]);
