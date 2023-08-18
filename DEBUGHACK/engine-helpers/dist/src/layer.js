// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __values } from "tslib";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling generic layers settings. */
import { isBaseLayerSetting, } from "@wwtelescope/engine-types";
import { Color, } from "@wwtelescope/engine";
/** A list of the names of the available settings for generic layers. */
export var layerSettingNames = [
    "astronomical",
    "color",
    "enabled",
    "fadeSpan",
    "name",
    "opacity",
    "opened",
    "referenceFrame",
    "version",
];
var layerSettingTypeInfo = {
    "color/Color": true,
};
/** Type guard function for `LayerSetting`. */
export function isLayerSetting(obj) {
    var typekey = typeof obj[1];
    if (obj[1] instanceof Color) {
        typekey = "Color";
    }
    var key = obj[0] + "/" + typekey;
    return (key in layerSettingTypeInfo) || isBaseLayerSetting(obj);
}
/** Apply a setting to a generic `Layer` or equivalent. */
export function applyLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    layer[funcName](value);
}
/** Extract all of the current settings of a `Layer` or equivalent. */
export function extractLayerSettings(layer) {
    var e_1, _a;
    var s = [];
    try {
        for (var layerSettingNames_1 = __values(layerSettingNames), layerSettingNames_1_1 = layerSettingNames_1.next(); !layerSettingNames_1_1.done; layerSettingNames_1_1 = layerSettingNames_1.next()) {
            var n = layerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (layerSettingNames_1_1 && !layerSettingNames_1_1.done && (_a = layerSettingNames_1.return)) _a.call(layerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `Layer`, or equivalent, to another. */
export function copyLayerSettings(source, dest) {
    var e_2, _a;
    try {
        for (var layerSettingNames_2 = __values(layerSettingNames), layerSettingNames_2_1 = layerSettingNames_2.next(); !layerSettingNames_2_1.done; layerSettingNames_2_1 = layerSettingNames_2.next()) {
            var n = layerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (layerSettingNames_2_1 && !layerSettingNames_2_1.done && (_a = layerSettingNames_2.return)) _a.call(layerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `LayerSettingsInterface`. */
var LayerState = /** @class */ (function () {
    // Maybe possible to use remapped keys to create this type?:
    // https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
    // Don't think we can implement functions, though, and we're currently (Aug
    // 2021) on TypeScript 3.9, while the above requires 4.1.
    function LayerState(source) {
        copyLayerSettings(source, this);
    }
    LayerState.prototype.get_astronomical = function () {
        return this.astronomical;
    };
    LayerState.prototype.set_astronomical = function (v) {
        this.astronomical = v;
        return v;
    };
    LayerState.prototype.get_color = function () {
        return this.color;
    };
    LayerState.prototype.set_color = function (v) {
        this.color = v;
        return v;
    };
    LayerState.prototype.get_enabled = function () {
        return this.enabled;
    };
    LayerState.prototype.set_enabled = function (v) {
        this.enabled = v;
        return v;
    };
    LayerState.prototype.get_endTime = function () {
        return this.endTime;
    };
    LayerState.prototype.set_endTime = function (v) {
        this.endTime = v;
        return v;
    };
    LayerState.prototype.get_fadeSpan = function () {
        return this.fadeSpan;
    };
    LayerState.prototype.set_fadeSpan = function (v) {
        this.fadeSpan = v;
        return v;
    };
    LayerState.prototype.get_fadeType = function () {
        return this.fadeType;
    };
    LayerState.prototype.set_fadeType = function (v) {
        this.fadeType = v;
        return v;
    };
    LayerState.prototype.get_name = function () {
        return this.name;
    };
    LayerState.prototype.set_name = function (v) {
        this.name = v;
        return v;
    };
    LayerState.prototype.get_opacity = function () {
        return this.opacity;
    };
    LayerState.prototype.set_opacity = function (v) {
        this.opacity = v;
        return v;
    };
    LayerState.prototype.get_opened = function () {
        return this.opened;
    };
    LayerState.prototype.set_opened = function (v) {
        this.opened = v;
        return v;
    };
    LayerState.prototype.get_referenceFrame = function () {
        return this.referenceFrame;
    };
    LayerState.prototype.set_referenceFrame = function (v) {
        this.referenceFrame = v;
        return v;
    };
    LayerState.prototype.get_startTime = function () {
        return this.startTime;
    };
    LayerState.prototype.set_startTime = function (v) {
        this.startTime = v;
        return v;
    };
    LayerState.prototype.get_version = function () {
        return this.version;
    };
    LayerState.prototype.set_version = function (v) {
        this.version = v;
        return v;
    };
    return LayerState;
}());
export { LayerState };
//# sourceMappingURL=layer.js.map