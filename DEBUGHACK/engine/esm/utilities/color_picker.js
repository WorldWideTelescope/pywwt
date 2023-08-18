// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A color picker UI.

import { registerType } from "../typesystem.js";
import { Color, Colors } from "../color.js";
import { globalScriptInterface } from "../data_globals.js";


// wwtlib.ColorPicker

export function ColorPicker() {
    this.callBack = null;
    this.color = Colors.get_white();
}

var ColorPicker$ = {
    nonMenuClick: function (e) { },

    show: function (e) {
        globalScriptInterface.showColorPicker(this, e);
    },

    getColorFromClick: function (e) {
        var image = document.getElementById('colorhex');
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        var pixels = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
        this.color = Color.fromArgb(pixels[3], pixels[0], pixels[1], pixels[2]);
        return this.color;
    },

    pickColor: function (e) {
        this.callBack(this.color);
    }
};

registerType("ColorPicker", [ColorPicker, ColorPicker$, null]);
