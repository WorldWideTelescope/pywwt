// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// UI for viewing and manipulating a data histogram.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Vector2d } from "../double3d.js";
import { useGlVersion2, tileCacheGetTile } from "../render_globals.js";
import { Mouse } from "../util.js";
import { FitsImageJs } from "../layers/fits_image_js.js";


// wwtlib.Histogram

export function Histogram() {
    this.image = null;
    this.layer = null;
    this.tile = null;
    this._dropDown = null;
    this._downPosition = 0;
    this._lowPosition = 0;
    this._highPosition = 255;
    this._center = 127;
    this._ignoreNextClick = false;
    this._dragType = 4;
    this._updated = false;
    this.selectedCurveStyle = 0;
}

Histogram.updateImage = function (isl, z) {
    if (!useGlVersion2) {
        var image = ss.safeCast(isl.get_imageSet().get_wcsImage(), FitsImageJs);
        var Tile = tileCacheGetTile(0, 0, 0, isl.get_imageSet(), null);
        Tile.texture2d = image.getBitmap().getTexture();
    }
};

Histogram.updateScale = function (isl, scale, low, hi) {
    isl.get_imageSet().get_fitsProperties().scaleType = scale;
    isl.get_imageSet().get_fitsProperties().lowerCut = low;
    isl.get_imageSet().get_fitsProperties().upperCut = hi;
    if (!useGlVersion2) {
        var image = ss.safeCast(isl.get_imageSet().get_wcsImage(), FitsImageJs);
        var Tile = tileCacheGetTile(0, 0, 0, isl.get_imageSet(), null);
        Tile.texture2d = image.getBitmap().getTexture();
    }
};

Histogram.updateColorMapper = function (isl, colorMapperName) {
    isl.get_imageSet().get_fitsProperties().colorMapName = colorMapperName;
    if (!useGlVersion2) {
        var image = ss.safeCast(isl.get_imageSet().get_wcsImage(), FitsImageJs);
        var Tile = tileCacheGetTile(0, 0, 0, isl.get_imageSet(), null);
        Tile.texture2d = image.getBitmap().getTexture();
    }
};

var Histogram$ = {
    close: function (e) {
        var menu = document.getElementById('histogram');
        var closeBtn = document.getElementById('histogramClose');
        menu.style.display = 'none';
        window.removeEventListener('click', ss.bind('close', this), true);
        var image = document.getElementById('graph');
        image.removeEventListener('mousedown', ss.bind('onPointerDown', this), false);
        image.removeEventListener('mousemove', ss.bind('onPointerMove', this), false);
        image.removeEventListener('mouseup', ss.bind('onPointerUp', this), false);
        this._dropDown.removeEventListener('change', ss.bind('curveStyleSelected', this), false);
        this._dropDown.removeEventListener('click', ss.bind('ignoreMe', this), true);
    },

    show: function (position) {
        this.tile = tileCacheGetTile(0, 0, 0, this.layer.get_imageSet(), null);
        var picker = document.getElementById('histogram');
        var closeBtn = document.getElementById('histogramClose');
        picker.style.display = 'block';
        picker.style.left = position.x.toString() + 'px';
        picker.style.top = position.y.toString() + 'px';
        this.selectedCurveStyle = this.layer.get_imageSet().get_fitsProperties().scaleType;
        this._dropDown = document.getElementById('ScaleTypePicker');
        this._dropDown.addEventListener('change', ss.bind('curveStyleSelected', this), false);
        this._dropDown.addEventListener('click', ss.bind('ignoreMe', this), true);
        var canvas = document.getElementById('graph');
        canvas.addEventListener('pointerdown', ss.bind('onPointerDown', this), false);
        canvas.addEventListener('pointermove', ss.bind('onPointerMove', this), false);
        canvas.addEventListener('pointerup', ss.bind('onPointerUp', this), false);
        closeBtn.addEventListener('click', ss.bind('close', this), true);
        this.draw();
    },

    ignoreMe: function (e) {
        this._ignoreNextClick = true;
    },

    curveStyleSelected: function (e) {
        this.selectedCurveStyle = this._dropDown.selectedIndex;
        this.setUpdateTimer();
        this.layer.get_imageSet().get_fitsProperties().scaleType = this.selectedCurveStyle;
        this.draw();
        this._ignoreNextClick = true;
    },

    onPointerDown: function (e) {
        var canvas = document.getElementById('graph');
        var x = Mouse.offsetX(canvas, e);
        var y = Mouse.offsetY(canvas, e);
        canvas.setPointerCapture(e.pointerId);
        if ((Math.abs(x - this._center) < 10) && Math.abs(y - 75) < 10) {
            this._dragType = 3;
        } else if (Math.abs(x - this._lowPosition) < 10) {
            this._dragType = 0;
        } else if (Math.abs(x - this._highPosition) < 10) {
            this._dragType = 1;
        } else {
            this._dragType = 2;
            this._downPosition = Math.min(255, Math.max(0, x));
            this.draw();
        }
        e.cancelBubble = true;
    },

    onPointerMove: function (e) {
        var canvas = document.getElementById('graph');
        var x = Mouse.offsetX(canvas, e);
        var y = Mouse.offsetY(canvas, e);
        switch (this._dragType) {
            case 0:
                this._lowPosition = Math.min(255, Math.max(0, x));
                break;
            case 1:
                this._highPosition = Math.min(255, Math.max(0, x));
                break;
            case 2:
                this._lowPosition = this._downPosition;
                this._highPosition = Math.min(255, Math.max(0, x));
                break;
            case 3:
                var hWidth = Math.abs(this._highPosition - this._lowPosition) / 2;
                var adCenter = Math.min(255 - hWidth, Math.max(hWidth, x));
                var moved = this._center - adCenter;
                this._lowPosition -= moved;
                this._highPosition -= moved;
                break;
            case 4:
                return;
            default:
                break;
        }
        this._center = (this._lowPosition + this._highPosition) / 2;
        this.draw();
        var factor = (this.layer.get_imageSet().get_fitsProperties().maxVal - this.layer.get_imageSet().get_fitsProperties().minVal) / 256;
        var low = this.layer.get_imageSet().get_fitsProperties().minVal + (this._lowPosition * factor);
        var hi = this.layer.get_imageSet().get_fitsProperties().minVal + (this._highPosition * factor);
        this.setUpdateTimer();
        this.layer.get_imageSet().get_fitsProperties().upperCut = hi;
        this.layer.get_imageSet().get_fitsProperties().lowerCut = low;
        this.layer.get_imageSet().get_fitsProperties().scaleType = this.selectedCurveStyle;
        e.cancelBubble = true;
    },

    onPointerUp: function (e) {
        e.srcElement.releasePointerCapture(e.pointerId);
        if (this._dragType !== 4) {
            this._dragType = 4;
            this.setUpdateTimer();
            this._ignoreNextClick = true;
        }
        e.cancelBubble = true;
    },

    setUpdateTimer: function () {
        var $this = this;

        if (!useGlVersion2) {
            setTimeout(function () {
                $this.update();
            }, 500);
            this._updated = false;
        }
    },

    update: function () {
        if (this._updated) {
            return;
        }
        if (ss.canCast(this.image, FitsImageJs)) {
            var factor = (this.layer.get_imageSet().get_fitsProperties().maxVal - this.layer.get_imageSet().get_fitsProperties().minVal) / 256;
            var low = this.layer.get_imageSet().get_fitsProperties().minVal + (this._lowPosition * factor);
            var hi = this.layer.get_imageSet().get_fitsProperties().minVal + (this._highPosition * factor);
            this.tile.texture2d = (this.image).getScaledBitmap(low, hi, this.selectedCurveStyle, 0, null).getTexture();
        }
        this._updated = true;
    },

    draw: function () {
        var canvas = document.getElementById('graph');
        var ctx = canvas.getContext('2d');
        if (this.image != null) {
            this.image.drawHistogram(ctx);
        }
        var red = 'rgba(255,0,0,255)';
        var green = 'rgba(0,255,0,255)';
        var blue = 'rgba(0,0,255,255)';
        ctx.strokeStyle = red;
        ctx.beginPath();
        ctx.moveTo(this._lowPosition, 0);
        ctx.lineTo(this._lowPosition, 150);
        ctx.stroke();
        ctx.strokeStyle = green;
        ctx.beginPath();
        ctx.moveTo(this._highPosition, 0);
        ctx.lineTo(this._highPosition, 150);
        ctx.stroke();
        ctx.strokeStyle = blue;
        ctx.beginPath();
        ctx.arc(this._center, 75, 10, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        var Curve = [];
        switch (this.selectedCurveStyle) {
            case 0: // linear
                Curve.length = 0;
                Curve.push(Vector2d.create(this._lowPosition, 150));
                Curve.push(Vector2d.create(this._highPosition, 0));
                break;
            case 1: // log
                Curve.length = 0;
                var factor = 150 / Math.log(255);
                var diff = (this._highPosition - this._lowPosition);
                var jump = (diff < 0) ? -1 : 1;
                var step = Math.abs(256 / ((!diff) ? 1E-06 : diff));
                var val = 1E-06;
                for (var i = this._lowPosition; i !== this._highPosition; i += jump) {
                    Curve.push(Vector2d.create(i, (150 - (Math.log(val) * factor))));
                    val += step;
                }
                break;
            case 2: // power 2
                Curve.length = 0;
                var factor = 150 / Math.pow(255, 2);
                var diff = (this._highPosition - this._lowPosition);
                var jump = (diff < 0) ? -1 : 1;
                var step = Math.abs(256 / ((!diff) ? 1E-06 : diff));
                var val = 1E-06;
                for (var i = this._lowPosition; i !== this._highPosition; i += jump) {
                    Curve.push(Vector2d.create(i, (150 - (Math.pow(val, 2) * factor))));
                    val += step;
                }
                break;
            case 3: // square root
                Curve.length = 0;
                var factor = 150 / Math.sqrt(255);
                var diff = (this._highPosition - this._lowPosition);
                var jump = (diff < 0) ? -1 : 1;
                var step = Math.abs(256 / ((!diff) ? 1E-06 : diff));
                var val = 1E-06;
                for (var i = this._lowPosition; i !== this._highPosition; i += jump) {
                    Curve.push(Vector2d.create(i, (150 - (Math.sqrt(val) * factor))));
                    val += step;
                }
                break;
        }
        if (Curve.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = blue;
            ctx.moveTo(Curve[0].x, Curve[0].y);
            for (var i = 1; i < Curve.length; i++) {
                ctx.lineTo(Curve[i].x, Curve[i].y);
            }
            ctx.stroke();
        }
    }
};

registerType("Histogram", [Histogram, Histogram$, null]);
