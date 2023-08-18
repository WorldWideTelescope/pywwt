// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The basic GL texture type.

import { registerType } from "../typesystem.js";
import { ss } from "../ss.js";
import { tilePrepDevice } from "../render_globals.js";
import { URLHelpers } from "../url_helpers.js";
import { WEBGL } from "./webgl_constants.js";


// wwtlib.Texture

export function Texture() {
    this.imageElement = null;
    this.texture2d = null;
    this._downloading = false;
    this._ready = false;
    this._errored = false;
    this.URL = '';
}

Texture.empty = null;

Texture.getEmpty = function () {
    if (Texture.empty == null) {
        Texture.empty = tilePrepDevice.createTexture();
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, Texture.empty);
        tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.RGBA, 1, 1, 0, WEBGL.RGBA, WEBGL.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, null);
    }
    return Texture.empty;
};

Texture.fromUrl = function (url) {
    var tex = new Texture();
    tex.load(url);
    return tex;
};

Texture.isPowerOfTwo = function (val) {
    return !(val & (val - 1));
};

Texture.fitPowerOfTwo = function (val) {
    val--;
    for (var i = 1; i < 32; i <<= 1) {
        val = val | val >> i;
    }
    return val + 1;
};

var Texture$ = {
    cleanUp: function () {
        this.imageElement = null;
        tilePrepDevice.deleteTexture(this.texture2d);
    },

    dispose: function () {
        this.cleanUp();
    },

    load: function (url) {
        var $this = this;

        this.URL = url;
        if (typeof document === "undefined") { return; }
        if (!this._downloading) {
            this._downloading = true;
            this.imageElement = document.createElement('img');
            var xdomimg = this.imageElement;
            this.imageElement.addEventListener('load', function (e) {
                $this._ready = true;
                $this._downloading = false;
                $this._errored = false;
                $this.makeTexture();
            }, false);
            this.imageElement.addEventListener('error', function (e) {
                if (!$this.imageElement.hasAttribute('proxyattempt')) {
                    $this.imageElement.setAttribute('proxyattempt', true);
                    var new_url = URLHelpers.singleton.activateProxy($this.URL);
                    if (new_url != null) {  // null => don't bother: we know that the proxy won't help
                        $this.imageElement.src = new_url;
                        return;
                    }
                }
                $this._downloading = false;
                $this._ready = false;
                $this._errored = true;
            }, false);
            xdomimg.crossOrigin = 'anonymous';
            this.imageElement.src = this.URL;
        }
    },

    makeTexture: function () {
        if (tilePrepDevice != null) {
            try {
                this.texture2d = tilePrepDevice.createTexture();
                tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, this.texture2d);
                var image = this.imageElement;

                // Before we bind resize to a power of two if nessesary so we can MIPMAP
                if ((!Texture.isPowerOfTwo(this.imageElement.height) | !Texture.isPowerOfTwo(this.imageElement.width)) === 1) {
                    var temp = document.createElement('canvas');
                    temp.height = Texture.fitPowerOfTwo(image.height);
                    temp.width = Texture.fitPowerOfTwo(image.width);
                    var ctx = temp.getContext('2d');
                    ctx.drawImage(image, 0, 0, temp.width, temp.height);
                    //Substitute the resized image
                    image = temp;
                }

                tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_S, WEBGL.CLAMP_TO_EDGE);
                tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_T, WEBGL.CLAMP_TO_EDGE);
                tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.RGBA, WEBGL.RGBA, WEBGL.UNSIGNED_BYTE, image);
                tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MIN_FILTER, WEBGL.LINEAR_MIPMAP_NEAREST);
                tilePrepDevice.generateMipmap(WEBGL.TEXTURE_2D);
                tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, null);
            } catch ($e1) {
                this._errored = true;
            }
        }
    }
};

registerType("Texture", [Texture, Texture$, null, ss.IDisposable]);
