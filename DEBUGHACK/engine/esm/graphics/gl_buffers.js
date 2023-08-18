// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// WebGL buffer types.

import { registerType } from "../typesystem.js";
import { ss } from "../ss.js";
import { tilePrepDevice } from "../render_globals.js";
import { WEBGL } from "./webgl_constants.js";


// wwtlib.ShortIndexBuffer

export function ShortIndexBuffer(indexes) {
    this.buffer = tilePrepDevice.createBuffer();
    tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, this.buffer);
    tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, indexes, WEBGL.STATIC_DRAW);
}

var ShortIndexBuffer$ = {};

registerType("ShortIndexBuffer", [ShortIndexBuffer, ShortIndexBuffer$, null]);


// wwtlib.IndexBuffer

export function IndexBuffer(indexes) {
    this.buffer = tilePrepDevice.createBuffer();
    tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, this.buffer);
    tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, indexes, WEBGL.STATIC_DRAW);
}

var IndexBuffer$ = {
    dispose: function () {
        tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        tilePrepDevice.deleteBuffer(this.buffer);
        this.buffer = null;
    }
};

registerType("IndexBuffer", [IndexBuffer, IndexBuffer$, null, ss.IDisposable]);


// wwtlib.VertexBufferBase

export function VertexBufferBase() { }

var VertexBufferBase$ = {
    dispose: function () {
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, null);
        tilePrepDevice.deleteBuffer(this.vertexBuffer);
        this.vertexBuffer = null;
    }
};

registerType("VertexBufferBase", [VertexBufferBase, VertexBufferBase$, null, ss.IDisposable]);


// wwtlib.PositionVertexBuffer

export function PositionVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

var PositionVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 3);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.x;
            buffer[index++] = pt.y;
            buffer[index++] = pt.z;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionVertexBuffer", [PositionVertexBuffer, PositionVertexBuffer$, VertexBufferBase]);


// wwtlib.PositionTextureVertexBuffer

export function PositionTextureVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

PositionTextureVertexBuffer.create = function (data) {
    var buffer = new PositionTextureVertexBuffer(data.length);
    buffer._verts$1 = data;
    buffer.unlock();
    return buffer;
};

var PositionTextureVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 5);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionTextureVertexBuffer", [PositionTextureVertexBuffer, PositionTextureVertexBuffer$, VertexBufferBase]);


// wwtlib.PositionNormalTexturedVertexBuffer

export function PositionNormalTexturedVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

PositionNormalTexturedVertexBuffer.create = function (data) {
    var buffer = new PositionNormalTexturedVertexBuffer(data.length);
    buffer._verts$1 = data;
    buffer.unlock();
    return buffer;
};

var PositionNormalTexturedVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 8);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.x;
            buffer[index++] = pt.y;
            buffer[index++] = pt.z;
            buffer[index++] = pt.nx;
            buffer[index++] = pt.ny;
            buffer[index++] = pt.nz;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionNormalTexturedVertexBuffer", [PositionNormalTexturedVertexBuffer, PositionNormalTexturedVertexBuffer$, VertexBufferBase]);


// wwtlib.PositionNormalTexturedTangentVertexBuffer

export function PositionNormalTexturedTangentVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

PositionNormalTexturedTangentVertexBuffer.create = function (data) {
    var buffer = new PositionNormalTexturedTangentVertexBuffer(data.length);
    buffer._verts$1 = data;
    buffer.unlock();
    return buffer;
};

var PositionNormalTexturedTangentVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 11);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.x;
            buffer[index++] = pt.y;
            buffer[index++] = pt.z;
            buffer[index++] = pt.nx;
            buffer[index++] = pt.ny;
            buffer[index++] = pt.nz;
            buffer[index++] = pt.tanx;
            buffer[index++] = pt.tany;
            buffer[index++] = pt.tanz;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionNormalTexturedTangentVertexBuffer", [PositionNormalTexturedTangentVertexBuffer, PositionNormalTexturedTangentVertexBuffer$, VertexBufferBase]);


// wwtlib.KeplerVertexBuffer

export function KeplerVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

KeplerVertexBuffer.create = function (items) {
    var tmp = new KeplerVertexBuffer(items.length);
    tmp._verts$1 = items;
    return tmp;
};

var KeplerVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 19);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.ABC.x;
            buffer[index++] = pt.ABC.y;
            buffer[index++] = pt.ABC.z;
            buffer[index++] = pt.abc1.x;
            buffer[index++] = pt.abc1.y;
            buffer[index++] = pt.abc1.z;
            buffer[index++] = pt.pointSize;
            buffer[index++] = pt.color.r / 255;
            buffer[index++] = pt.color.g / 255;
            buffer[index++] = pt.color.b / 255;
            buffer[index++] = pt.color.a / 255;
            buffer[index++] = pt.w;
            buffer[index++] = pt.e;
            buffer[index++] = pt.n;
            buffer[index++] = pt.t;
            buffer[index++] = pt.a;
            buffer[index++] = pt.z;
            buffer[index++] = pt.orbitPos;
            buffer[index++] = pt.orbits;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("KeplerVertexBuffer", [KeplerVertexBuffer, KeplerVertexBuffer$, VertexBufferBase]);


// wwtlib.TimeSeriesLineVertexBuffer

export function TimeSeriesLineVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

var TimeSeriesLineVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 9);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.get_color().r / 255;
            buffer[index++] = pt.get_color().g / 255;
            buffer[index++] = pt.get_color().b / 255;
            buffer[index++] = pt.get_color().a / 255;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("TimeSeriesLineVertexBuffer", [TimeSeriesLineVertexBuffer, TimeSeriesLineVertexBuffer$, VertexBufferBase]);


// wwtlib.TimeSeriesPointVertexBuffer

export function TimeSeriesPointVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

var TimeSeriesPointVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 10);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.get_color().r / 255;
            buffer[index++] = pt.get_color().g / 255;
            buffer[index++] = pt.get_color().b / 255;
            buffer[index++] = pt.get_color().a / 255;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
            buffer[index++] = pt.pointSize;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    },

    dispose: function () {
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, null);
        tilePrepDevice.deleteBuffer(this.vertexBuffer);
        this.vertexBuffer = null;
    }
};

registerType("TimeSeriesPointVertexBuffer", [TimeSeriesPointVertexBuffer, TimeSeriesPointVertexBuffer$, VertexBufferBase]);


// wwtlib.PositionColoredVertexBuffer

export function PositionColoredVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

var PositionColoredVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 7);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.color.r / 255;
            buffer[index++] = pt.color.g / 255;
            buffer[index++] = pt.color.b / 255;
            buffer[index++] = pt.color.a / 255;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionColoredVertexBuffer", [PositionColoredVertexBuffer, PositionColoredVertexBuffer$, VertexBufferBase]);


// wwtlib.PositionColoredTexturedVertexBuffer

export function PositionColoredTexturedVertexBuffer(count) {
    this.count = 0;
    this._verts$1 = null;
    VertexBufferBase.call(this);
    this.count = count;
}

var PositionColoredTexturedVertexBuffer$ = {
    lock: function () {
        this._verts$1 = new Array(this.count);
        return this._verts$1;
    },

    unlock: function () {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(this.count * 9);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(this._verts$1);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.color.r / 255;
            buffer[index++] = pt.color.g / 255;
            buffer[index++] = pt.color.b / 255;
            buffer[index++] = pt.color.a / 255;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
    }
};

registerType("PositionColoredTexturedVertexBuffer", [PositionColoredTexturedVertexBuffer, PositionColoredTexturedVertexBuffer$, VertexBufferBase]);
