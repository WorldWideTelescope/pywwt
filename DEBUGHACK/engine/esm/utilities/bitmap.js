// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A basic bitmap class.

import { registerType } from "../typesystem.js";
import { tilePrepDevice } from "../render_globals.js";
import { WEBGL } from "../graphics/webgl_constants.js";
import { Texture } from "../graphics/texture.js";


// wwtlib.Bitmap

export function Bitmap() {
    this.width = 0;
    this.height = 0;
}

Bitmap.create = function (width, height) {
    height = Texture.fitPowerOfTwo(height);
    width = Texture.fitPowerOfTwo(width);
    var bmp = new Bitmap();
    bmp.height = height;
    bmp.width = width;
    bmp._buffer = new Uint8Array(width * height * 4);
    return bmp;
};

var Bitmap$ = {
    setPixel: function (x, y, r, g, b, a) {
        var index = (x + y * this.width) * 4;
        this._buffer[index++] = r;
        this._buffer[index++] = g;
        this._buffer[index++] = b;
        this._buffer[index++] = a;
    },

    getTexture: function () {
        var tex = tilePrepDevice.createTexture();
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, tex);
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_S, WEBGL.CLAMP_TO_EDGE);
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_T, WEBGL.CLAMP_TO_EDGE);
        tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.RGBA, this.width, this.height, 0, WEBGL.RGBA, WEBGL.UNSIGNED_BYTE, this._buffer);
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MIN_FILTER, WEBGL.LINEAR_MIPMAP_NEAREST);
        tilePrepDevice.generateMipmap(WEBGL.TEXTURE_2D);
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, null);
        return tex;
    }
};

registerType("Bitmap", [Bitmap, Bitmap$, null]);
