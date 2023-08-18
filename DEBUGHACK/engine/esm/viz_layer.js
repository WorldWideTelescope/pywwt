// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer displaying catalog data? This type is unused in the WWT engine, but
// we preserve it because it is exported in the API.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { DataItem } from "./graphics/primitives3d.js";
import { URLHelpers } from "./url_helpers.js";
import { Coordinates } from "./coordinates.js";


// wwtlib.VizLayer

export function VizLayer() {
    this.table = [];
    this.items = [];
    this._imageReady = false;
    this._dateColumn = 0;
    this._latColumn = 1;
    this._lngColumn = 2;
    this._depthColumn = 3;
    this._magColumn = 4;
}

VizLayer.earthRadius = 6371000;

var VizLayer$ = {
    load: function (data) {
        var $this = this;

        var lines = data.split('\r\n');
        this._starProfile = document.createElement('img');
        this._starProfile.addEventListener('load', function (e) {
            $this._imageReady = true;
        }, false);
        this._starProfile.src = URLHelpers.singleton.engineAssetUrl('StarProfileAlpha.png');
        var gotHeader = false;
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var line = $enum1.current;
            if (gotHeader) {
                this.table.push(line.split('\t'));
            }
            else {
                this.header = line.split('\t');
                gotHeader = true;
            }
        }
    },

    prepare: function () {
        this._worldList = new Array(this.table.length);
        this._transformedList = new Array(this.table.length);
        var index = 0;
        var $enum1 = ss.enumerate(this.table);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            var item = new DataItem();
            item.eventTime = ss.date(row[this._dateColumn]);
            var radius = (6371000 - parseFloat(row[this._depthColumn]) * 1000) / 6371000;
            item.location = Coordinates.geoTo3dRad(parseFloat(row[this._latColumn]), parseFloat(row[this._lngColumn]) + 180, radius);
            item.tranformed = new Vector3d();
            item.size = Math.pow(2, parseFloat(row[this._magColumn])) / 50;
            this._worldList[index] = item.location;
            this._transformedList[index] = item.tranformed;
            this.items.push(item);
            index++;
        }
    },

    draw: function (renderContext) {
        if (!this._imageReady) {
            return;
        }
        renderContext.device.save();
        renderContext.WVP.projectArrayToScreen(this._worldList, this._transformedList);
        var ctx = renderContext.device;
        ctx.globalAlpha = 0.4;
        var width = renderContext.width;
        var height = renderContext.height;
        var viewPoint = Vector3d.makeCopy(renderContext.get_viewPoint());
        var scaleFactor = renderContext.get_fovScale() / 100;
        var $enum1 = ss.enumerate(this.items);
        while ($enum1.moveNext()) {
            var item = $enum1.current;
            if (item.tranformed.z < 1) {
                var x = item.tranformed.x;
                var y = item.tranformed.y;
                var size = 4 * item.size / scaleFactor;
                var half = size / 2;
                if (x > -half && x < width + half && y > -half && y < height + half) {
                    ctx.drawImage(this._starProfile, x - size / 2, y - size / 2, size, size);
                }
            }
        }
        renderContext.device.restore();
    }
};

registerType("VizLayer", [VizLayer, VizLayer$, null]);
