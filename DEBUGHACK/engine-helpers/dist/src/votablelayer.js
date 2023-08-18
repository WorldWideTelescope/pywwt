// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling "spreadsheet" layer settings. */
import { isBaseVoTableLayerSetting, } from "@wwtelescope/engine-types";
import { copyLayerSettings, extractLayerSettings, isLayerSetting, layerSettingNames, LayerState, } from "./layer";
var justVoTableLayerSettingNames = [
    "altColumn",
    "altType",
    "altUnit",
    "autoUpdate",
    "beginRange",
    "cartesianCustomScale",
    "cartesianScale",
    "colorMapColumn",
    "coordinatesType",
    "dataSourceUrl",
    "decay",
    "dynamicData",
    "endDateColumn",
    "endRange",
    "hyperlinkColumn",
    "hyperlinkFormat",
    "latColumn",
    "lngColumn",
    "markerColumn",
    "markerIndex",
    "markerScale",
    "nameColumn",
    "plotType",
    "pointScaleType",
    "raUnits",
    "scaleFactor",
    "showFarSide",
    "sizeColumn",
    "startDateColumn",
    "timeSeries",
    "xAxisColumn",
    "xAxisReverse",
    "yAxisColumn",
    "yAxisReverse",
    "zAxisColumn",
    "zAxisReverse",
];
/** A list of the names of the available settings for `VoTableLayer`
 * instances and their equivalents (things implementing
 * [[VoTableLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export var voTableLayerSettingNames = layerSettingNames.concat(justVoTableLayerSettingNames);
/** Type guard function for `VoTableLayerSetting`. */
export function isVoTableLayerSetting(obj) {
    // No special settings specific to non-base VoTableLayerSetting.
    return isLayerSetting(obj) || isBaseVoTableLayerSetting(obj);
}
/** Apply a setting to a `VoTableLayer` or equivalent. */
export function applyVoTableLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
    layer[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
}
/** Extract all of the current settings of a `VoTableLayer` or equivalent. */
export function extractVoTableLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justVoTableLayerSettingNames_1 = __values(justVoTableLayerSettingNames), justVoTableLayerSettingNames_1_1 = justVoTableLayerSettingNames_1.next(); !justVoTableLayerSettingNames_1_1.done; justVoTableLayerSettingNames_1_1 = justVoTableLayerSettingNames_1.next()) {
            var n = justVoTableLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justVoTableLayerSettingNames_1_1 && !justVoTableLayerSettingNames_1_1.done && (_a = justVoTableLayerSettingNames_1.return)) _a.call(justVoTableLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `VoTableLayer`, or equivalent, to another. */
export function copyVoTableLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justVoTableLayerSettingNames_2 = __values(justVoTableLayerSettingNames), justVoTableLayerSettingNames_2_1 = justVoTableLayerSettingNames_2.next(); !justVoTableLayerSettingNames_2_1.done; justVoTableLayerSettingNames_2_1 = justVoTableLayerSettingNames_2.next()) {
            var n = justVoTableLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justVoTableLayerSettingNames_2_1 && !justVoTableLayerSettingNames_2_1.done && (_a = justVoTableLayerSettingNames_2.return)) _a.call(justVoTableLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `VoTableLayerSettingsInterface`. */
var VoTableLayerState = /** @class */ (function (_super) {
    __extends(VoTableLayerState, _super);
    function VoTableLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copyVoTableLayerSettings(source, _this);
        return _this;
    }
    VoTableLayerState.prototype.get_altColumn = function () {
        return this.altColumn;
    };
    VoTableLayerState.prototype.set_altColumn = function (v) {
        this.altColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_altType = function () {
        return this.altType;
    };
    VoTableLayerState.prototype.set_altType = function (v) {
        this.altType = v;
        return v;
    };
    VoTableLayerState.prototype.get_altUnit = function () {
        return this.altUnit;
    };
    VoTableLayerState.prototype.set_altUnit = function (v) {
        this.altUnit = v;
        return v;
    };
    VoTableLayerState.prototype.get_autoUpdate = function () {
        return this.autoUpdate;
    };
    VoTableLayerState.prototype.set_autoUpdate = function (v) {
        this.autoUpdate = v;
        return v;
    };
    VoTableLayerState.prototype.get_beginRange = function () {
        return this.beginRange;
    };
    VoTableLayerState.prototype.set_beginRange = function (v) {
        this.beginRange = v;
        return v;
    };
    VoTableLayerState.prototype.get_cartesianCustomScale = function () {
        return this.cartesianCustomScale;
    };
    VoTableLayerState.prototype.set_cartesianCustomScale = function (v) {
        this.cartesianCustomScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_cartesianScale = function () {
        return this.cartesianScale;
    };
    VoTableLayerState.prototype.set_cartesianScale = function (v) {
        this.cartesianScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_colorMapColumn = function () {
        return this.colorMapColumn;
    };
    VoTableLayerState.prototype.set_colorMapColumn = function (v) {
        this.colorMapColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_coordinatesType = function () {
        return this.coordinatesType;
    };
    VoTableLayerState.prototype.set_coordinatesType = function (v) {
        this.coordinatesType = v;
        return v;
    };
    VoTableLayerState.prototype.get_dataSourceUrl = function () {
        return this.dataSourceUrl;
    };
    VoTableLayerState.prototype.set_dataSourceUrl = function (v) {
        this.dataSourceUrl = v;
        return v;
    };
    VoTableLayerState.prototype.get_decay = function () {
        return this.decay;
    };
    VoTableLayerState.prototype.set_decay = function (v) {
        this.decay = v;
        return v;
    };
    VoTableLayerState.prototype.get_dynamicData = function () {
        return this.dynamicData;
    };
    VoTableLayerState.prototype.set_dynamicData = function (v) {
        this.dynamicData = v;
        return v;
    };
    VoTableLayerState.prototype.get_endDateColumn = function () {
        return this.endDateColumn;
    };
    VoTableLayerState.prototype.set_endDateColumn = function (v) {
        this.endDateColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_endRange = function () {
        return this.endRange;
    };
    VoTableLayerState.prototype.set_endRange = function (v) {
        this.endRange = v;
        return v;
    };
    VoTableLayerState.prototype.get_hyperlinkColumn = function () {
        return this.hyperlinkColumn;
    };
    VoTableLayerState.prototype.set_hyperlinkColumn = function (v) {
        this.hyperlinkColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_hyperlinkFormat = function () {
        return this.hyperlinkFormat;
    };
    VoTableLayerState.prototype.set_hyperlinkFormat = function (v) {
        this.hyperlinkFormat = v;
        return v;
    };
    VoTableLayerState.prototype.get_latColumn = function () {
        return this.latColumn;
    };
    VoTableLayerState.prototype.set_latColumn = function (v) {
        this.latColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_lngColumn = function () {
        return this.lngColumn;
    };
    VoTableLayerState.prototype.set_lngColumn = function (v) {
        this.lngColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerColumn = function () {
        return this.markerColumn;
    };
    VoTableLayerState.prototype.set_markerColumn = function (v) {
        this.markerColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerIndex = function () {
        return this.markerIndex;
    };
    VoTableLayerState.prototype.set_markerIndex = function (v) {
        this.markerIndex = v;
        return v;
    };
    VoTableLayerState.prototype.get_markerScale = function () {
        return this.markerScale;
    };
    VoTableLayerState.prototype.set_markerScale = function (v) {
        this.markerScale = v;
        return v;
    };
    VoTableLayerState.prototype.get_nameColumn = function () {
        return this.nameColumn;
    };
    VoTableLayerState.prototype.set_nameColumn = function (v) {
        this.nameColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_plotType = function () {
        return this.plotType;
    };
    VoTableLayerState.prototype.set_plotType = function (v) {
        this.plotType = v;
        return v;
    };
    VoTableLayerState.prototype.get_pointScaleType = function () {
        return this.pointScaleType;
    };
    VoTableLayerState.prototype.set_pointScaleType = function (v) {
        this.pointScaleType = v;
        return v;
    };
    VoTableLayerState.prototype.get_raUnits = function () {
        return this.raUnits;
    };
    VoTableLayerState.prototype.set_raUnits = function (v) {
        this.raUnits = v;
        return v;
    };
    VoTableLayerState.prototype.get_scaleFactor = function () {
        return this.scaleFactor;
    };
    VoTableLayerState.prototype.set_scaleFactor = function (v) {
        this.scaleFactor = v;
        return v;
    };
    VoTableLayerState.prototype.get_showFarSide = function () {
        return this.showFarSide;
    };
    VoTableLayerState.prototype.set_showFarSide = function (v) {
        this.showFarSide = v;
        return v;
    };
    VoTableLayerState.prototype.get_sizeColumn = function () {
        return this.sizeColumn;
    };
    VoTableLayerState.prototype.set_sizeColumn = function (v) {
        this.sizeColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_startDateColumn = function () {
        return this.startDateColumn;
    };
    VoTableLayerState.prototype.set_startDateColumn = function (v) {
        this.startDateColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_timeSeries = function () {
        return this.timeSeries;
    };
    VoTableLayerState.prototype.set_timeSeries = function (v) {
        this.timeSeries = v;
        return v;
    };
    VoTableLayerState.prototype.get_xAxisColumn = function () {
        return this.xAxisColumn;
    };
    VoTableLayerState.prototype.set_xAxisColumn = function (v) {
        this.xAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_xAxisReverse = function () {
        return this.xAxisReverse;
    };
    VoTableLayerState.prototype.set_xAxisReverse = function (v) {
        this.xAxisReverse = v;
        return v;
    };
    VoTableLayerState.prototype.get_yAxisColumn = function () {
        return this.yAxisColumn;
    };
    VoTableLayerState.prototype.set_yAxisColumn = function (v) {
        this.yAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_yAxisReverse = function () {
        return this.yAxisReverse;
    };
    VoTableLayerState.prototype.set_yAxisReverse = function (v) {
        this.yAxisReverse = v;
        return v;
    };
    VoTableLayerState.prototype.get_zAxisColumn = function () {
        return this.zAxisColumn;
    };
    VoTableLayerState.prototype.set_zAxisColumn = function (v) {
        this.zAxisColumn = v;
        return v;
    };
    VoTableLayerState.prototype.get_zAxisReverse = function () {
        return this.zAxisReverse;
    };
    VoTableLayerState.prototype.set_zAxisReverse = function (v) {
        this.zAxisReverse = v;
        return v;
    };
    return VoTableLayerState;
}(LayerState));
export { VoTableLayerState };
//# sourceMappingURL=votablelayer.js.map