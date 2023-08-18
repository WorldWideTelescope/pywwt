// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Miscellaneous utilities.

import * as uuid from "uuid";

import { registerType, registerEnum } from "./typesystem.js";
import { ss } from "./ss.js";
export { Util } from "./baseutil.js";
import { Color } from "./color.js";
import { Vector2d, Vector3d } from "./double3d.js";


// wwtlib.Rectangle

export function Rectangle() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

Rectangle.create = function (x, y, width, height) {
    var temp = new Rectangle();
    temp.x = x;
    temp.y = y;
    temp.width = width;
    temp.height = height;
    return temp;
};

var Rectangle$ = {
    get_left: function () {
        return this.x;
    },

    get_right: function () {
        return this.x + this.width;
    },

    get_top: function () {
        return this.y;
    },

    get_bottom: function () {
        return this.y + this.height;
    },

    contains: function (point) {
        return (this._between(point.x, this.x, this.x + this.width) && this._between(point.y, this.y, this.y + this.height));
    },

    _between: function (n, n1, n2) {
        if (n1 > n2) {
            return !(n > n1) && !(n < n2);
        }
        else {
            return !(n < n1) && !(n > n2);
        }
    },

    copy: function () {
        var temp = new Rectangle();
        temp.x = this.x;
        temp.y = this.y;
        temp.width = this.width;
        temp.height = this.height;
        return temp;
    }
};

registerType("Rectangle", [Rectangle, Rectangle$, null]);


// wwtlib.Guid

export function Guid() {
    this._guid = Guid.create();
}

Guid.newGuid = function () {
    return new Guid();
};

Guid.fromString = function (id) {
    var temp = new Guid();
    temp._guid = ss.trim(id);
    return temp;
};

Guid.create = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
};

// The value 1420736a-a637-40a7-813a-ba692e72204e is a UUID (generated using the uuid CLI)
// that serves as a 'namespace' for our GUIDs
// The key property here is that this function always yields the same result for a given input
// See for example https://www.sohamkamani.com/uuid-versions-explained/
Guid.createFrom = function (value) {
    var str = uuid.v5(value, '1420736a-a637-40a7-813a-ba692e72204e');
    return Guid.fromString(str);
};

var Guid$ = {
    toString: function () {
        return this._guid;
    }
};

registerType("Guid", [Guid, Guid$, null]);


// The "Enums" typed lived here in the C#, but is now in `typesystem.js`.

// wwtlib.Mouse

export function Mouse() { }

Mouse.offsetX = function (canvas, e) {
    var x = 0;
    var element = canvas;
    var me = e;
    if (element.offsetParent != null) {
        do {
            x += element.offsetLeft;
        } while ((element = element.offsetParent) != null);
    }
    return me.pageX - x;
};

Mouse.offsetY = function (canvas, e) {
    var y = 0;
    var element = canvas;
    var me = e;
    if (element.offsetParent != null) {
        do {
            y += element.offsetTop;
        } while ((element = element.offsetParent) != null);
    }
    return me.pageY - y;
};

registerType("Mouse", [Mouse, null, null]);


// wwtlib.Language

export function Language() { }

Language.getLocalizedText = function (id, text) {
    return text;
};

var Language$ = {};

registerType("Language", [Language, Language$, null]);


// wwtlib.Cursor

export function Cursor() { }

Cursor.get_position = function () {
    return new Vector2d();
};

Cursor.get_current = function () {
    return document.body.style.cursor;
};

Cursor.set_current = function (value) {
    document.body.style.cursor = value;
    return value;
};

var Cursor$ = {};

registerType("Cursor", [Cursor, Cursor$, null]);


// wwtlib.Cursors

export function Cursors() { }

Cursors.get_arrow = function () {
    return 'default';
};

Cursors.get_cross = function () {
    return 'crosshair';
};

Cursors.get_defaultV = function () {
    return 'default';
};

Cursors.get_hand = function () {
    return 'grab';
};

Cursors.get_help = function () {
    return 'help';
};

Cursors.get_hSplit = function () {
    return 'row-resize';
};

Cursors.get_iBeam = function () {
    return 'text';
};

Cursors.get_no = function () {
    return 'not-allowed';
};

Cursors.get_sizeAll = function () {
    return 'help';
};

Cursors.get_sizeNESW = function () {
    return 'nwse-resize';
};

Cursors.get_sizeNS = function () {
    return 'ns-resize';
};

Cursors.get_sizeNWSE = function () {
    return 'nwse-resize';
};

Cursors.get_sizeWE = function () {
    return 'ew-resize';
};

Cursors.get_upArrow = function () {
    return 'help';
};

Cursors.get_vSplit = function () {
    return 'col-resize';
};

Cursors.get_waitCursor = function () {
    return 'wait';
};

var Cursors$ = {};

registerType("Cursors", [Cursors, Cursors$, null]);


// wwtlib.Keys

export var Keys = {
    modifiers: -65536,
    none: 0,
    lButton: 1,
    rButton: 2,
    cancel: 3,
    mButton: 4,
    xButton1: 5,
    xButton2: 6,
    back: 8,
    tab: 9,
    lineFeed: 10,
    clearKey: 12,
    returnKey: 13,
    enter: 13,
    shiftKey: 16,
    controlKey: 17,
    menu: 18,
    pause: 19,
    capital: 20,
    capsLock: 20,
    kanaMode: 21,
    hanguelMode: 21,
    hangulMode: 21,
    junjaMode: 23,
    finalMode: 24,
    hanjaMode: 25,
    kanjiMode: 25,
    escape: 27,
    imeConvert: 28,
    imeNonconvert: 29,
    imeAccept: 30,
    imeAceept: 30,
    imeModeChange: 31,
    space: 32,
    prior: 33,
    pageUp: 33,
    next: 34,
    pageDown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    select: 41,
    print: 42,
    execute: 43,
    snapshot: 44,
    printScreen: 44,
    insertKey: 45,
    deleteKey: 46,
    help: 47,
    d0: 48,
    d1: 49,
    d2: 50,
    d3: 51,
    d4: 52,
    d5: 53,
    d6: 54,
    d7: 55,
    d8: 56,
    d9: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    lWin: 91,
    rWin: 92,
    apps: 93,
    sleep: 95,
    numPad0: 96,
    numPad1: 97,
    numPad2: 98,
    numPad3: 99,
    numPad4: 100,
    numPad5: 101,
    numPad6: 102,
    numPad7: 103,
    numPad8: 104,
    numPad9: 105,
    multiply: 106,
    add: 107,
    separator: 108,
    subtract: 109,
    decimal: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    f13: 124,
    f14: 125,
    f15: 126,
    f16: 127,
    f17: 128,
    f18: 129,
    f19: 130,
    f20: 131,
    f21: 132,
    f22: 133,
    f23: 134,
    f24: 135,
    numLock: 144,
    scroll: 145,
    lShiftKey: 160,
    rShiftKey: 161,
    lControlKey: 162,
    rControlKey: 163,
    lMenu: 164,
    rMenu: 165,
    browserBack: 166,
    browserForward: 167,
    browserRefresh: 168,
    browserStop: 169,
    browserSearch: 170,
    browserFavorites: 171,
    browserHome: 172,
    volumeMute: 173,
    volumeDown: 174,
    volumeUp: 175,
    mediaNextTrack: 176,
    mediaPreviousTrack: 177,
    mediaStop: 178,
    mediaPlayPause: 179,
    launchMail: 180,
    selectMedia: 181,
    launchApplication1: 182,
    launchApplication2: 183,
    oemSemicolon: 186,
    oem1: 186,
    oemplus: 187,
    oemcomma: 188,
    oemMinus: 189,
    oemPeriod: 190,
    oemQuestion: 191,
    oem2: 191,
    oemtilde: 192,
    oem3: 192,
    oemOpenBrackets: 219,
    oem4: 219,
    oemPipe: 220,
    oem5: 220,
    oemCloseBrackets: 221,
    oem6: 221,
    oemQuotes: 222,
    oem7: 222,
    oem8: 223,
    oemBackslash: 226,
    oem102: 226,
    processKey: 229,
    packet: 231,
    attn: 246,
    crsel: 247,
    exsel: 248,
    eraseEof: 249,
    play: 250,
    zoom: 251,
    noName: 252,
    pa1: 253,
    oemClear: 254,
    keyCode: 65535,
    shift: 65536,
    control: 131072,
    alt: 262144
};

registerType("Keys", Keys);


// wwtlib.SelectLink

export function SelectLink(id) {
    this._return = false;
    this._next = true;
    this._linkSlide = false;
    this._slide = null;
    this._ok = false;
    if (id != null) {
        this.set_id(id);
    }
    else {
        this.set_next(true);
    }
}

var SelectLink$ = {
    get_returnCaller: function () {
        return this._return;
    },

    set_returnCaller: function (value) {
        if (value) {
            this._slide = 'Return';
        }
        this._return = value;
        return value;
    },

    get_next: function () {
        return this._next;
    },

    set_next: function (value) {
        if (value) {
            this._slide = 'Next';
        }
        this._next = value;
        return value;
    },

    get_linkToSlide: function () {
        return this._linkSlide;
    },

    set_linkToSlide: function (value) {
        if (value) {
            this._slide = 'Next';
        }
        this._linkSlide = value;
        return value;
    },

    get_id: function () {
        return this._slide;
    },

    set_id: function (value) {
        this._return = false;
        this._next = false;
        this._linkSlide = true;
        this._slide = value;
        return value;
    },

    get_OK: function () {
        return this._ok;
    },

    set_OK: function (value) {
        this._ok = value;
        return value;
    }
};

registerType("SelectLink", [SelectLink, SelectLink$, null]);


// wwtlib.PopupVolume

export function PopupVolume() {
    this.volume = 0;
}

var PopupVolume$ = {
    showDialog: function () {
        return 1;
    }
};

registerType("PopupVolume", [PopupVolume, PopupVolume$, null]);


// wwtlib.PopupColorPicker

export function PopupColorPicker() {
    this.volume = 0;
    this.location = new Vector2d();
    this.color = new Color();
}

var PopupColorPicker$ = {
    showDialog: function () {
        return 1;
    }
};

registerType("PopupColorPicker", [PopupColorPicker, PopupColorPicker$, null]);


// wwtlib.OverlayProperties

export function OverlayProperties() {
    this.volume = 0;
    this.location = new Vector2d();
    this.overlay = null;
}

var OverlayProperties$ = {
    showDialog: function () {
        return 1;
    }
};

registerType("OverlayProperties", [OverlayProperties, OverlayProperties$, null]);


// This used to be Imageset.getTileKey, but to break
// circular dependencies, we move it here.

export function getTileKey(imageset, level, x, y, parent) {
    if (imageset.get_projection() === 7 && parent != null) {
        var ipix = (parent).ipix * 4 + y * 2 + x;
        return imageset.get_imageSetID().toString() + '\\' + level.toString() + '\\' + ipix.toString();
    }

    return imageset.get_imageSetID().toString() + '\\' + level.toString() + '\\' + y.toString() + '_' + x.toString();
}


// wwtlib.DistanceCalc
//
// This was originally defined in ToastTile.cs but we moved it to sort out the
// dependency graph.

export function DistanceCalc() { }

DistanceCalc.lineToPoint = function (l0, l1, p) {
    var v = Vector3d.subtractVectors(l1, l0);
    var w = Vector3d.subtractVectors(p, l0);
    var dist = Vector3d.cross(w, v).length() / v.length();
    return dist;
};

DistanceCalc.getUVFromInnerPoint = function (ul, ur, ll, lr, pnt) {
    ul.normalize();
    ur.normalize();
    ll.normalize();
    lr.normalize();
    pnt.normalize();
    var dUpper = DistanceCalc.lineToPoint(ul, ur, pnt);
    var dLower = DistanceCalc.lineToPoint(ll, lr, pnt);
    var dVert = dUpper + dLower;
    var dRight = DistanceCalc.lineToPoint(ur, lr, pnt);
    var dLeft = DistanceCalc.lineToPoint(ul, ll, pnt);
    var dHoriz = dRight + dLeft;
    return Vector2d.create(dLeft / dHoriz, dUpper / dVert);
};

var DistanceCalc$ = {};

registerType("DistanceCalc", [DistanceCalc, DistanceCalc$, null]);


// wwtlib.DialogResult

export var DialogResult = {
    OK: 1
};

registerType("DialogResult", DialogResult);
registerEnum("DialogResult", DialogResult);
