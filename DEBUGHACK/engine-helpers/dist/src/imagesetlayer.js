// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling imageset layer settings. */
import { isBaseImageSetLayerSetting, } from "@wwtelescope/engine-types";
import { copyLayerSettings, extractLayerSettings, isLayerSetting, layerSettingNames, LayerState, } from "./layer";
var justImageSetLayerSettingNames = [
    "colorMapperName",
    "overrideDefaultLayer",
];
/** A list of the names of the available settings for `ImageSetLayer`
 * instances and their equivalents (things implementing
 * [[ImageSetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export var imageSetLayerSettingNames = layerSettingNames.concat(justImageSetLayerSettingNames);
/** Type guard function for `ImageSetLayerSetting`. */
export function isImageSetLayerSetting(obj) {
    // No special settings specific to non-base ImageSetLayerSetting.
    return isLayerSetting(obj) || isBaseImageSetLayerSetting(obj);
}
/** Apply a setting to a `ImageSetLayer` or equivalent. */
export function applyImageSetLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    layer[funcName](value);
}
/** Extract all of the current settings of a `ImageSetLayer` or equivalent. */
export function extractImageSetLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justImageSetLayerSettingNames_1 = __values(justImageSetLayerSettingNames), justImageSetLayerSettingNames_1_1 = justImageSetLayerSettingNames_1.next(); !justImageSetLayerSettingNames_1_1.done; justImageSetLayerSettingNames_1_1 = justImageSetLayerSettingNames_1.next()) {
            var n = justImageSetLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justImageSetLayerSettingNames_1_1 && !justImageSetLayerSettingNames_1_1.done && (_a = justImageSetLayerSettingNames_1.return)) _a.call(justImageSetLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `ImageSetLayer`, or equivalent, to another. */
export function copyImageSetLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justImageSetLayerSettingNames_2 = __values(justImageSetLayerSettingNames), justImageSetLayerSettingNames_2_1 = justImageSetLayerSettingNames_2.next(); !justImageSetLayerSettingNames_2_1.done; justImageSetLayerSettingNames_2_1 = justImageSetLayerSettingNames_2.next()) {
            var n = justImageSetLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justImageSetLayerSettingNames_2_1 && !justImageSetLayerSettingNames_2_1.done && (_a = justImageSetLayerSettingNames_2.return)) _a.call(justImageSetLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `ImageSetLayerSettingsInterface`. */
var ImageSetLayerState = /** @class */ (function (_super) {
    __extends(ImageSetLayerState, _super);
    function ImageSetLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copyImageSetLayerSettings(source, _this);
        return _this;
    }
    ImageSetLayerState.prototype.get_colorMapperName = function () {
        return this.colorMapperName;
    };
    ImageSetLayerState.prototype.set_colorMapperName = function (v) {
        this.colorMapperName = v;
        return v;
    };
    ImageSetLayerState.prototype.get_overrideDefaultLayer = function () {
        return this.overrideDefaultLayer;
    };
    ImageSetLayerState.prototype.set_overrideDefaultLayer = function (v) {
        this.overrideDefaultLayer = v;
        return v;
    };
    return ImageSetLayerState;
}(LayerState));
export { ImageSetLayerState };
//# sourceMappingURL=imagesetlayer.js.map