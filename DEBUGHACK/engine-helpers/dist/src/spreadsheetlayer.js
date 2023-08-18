// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling "spreadsheet" layer settings. */
import { isBaseSpreadSheetLayerSetting, } from "@wwtelescope/engine-types";
import { copyLayerSettings, extractLayerSettings, isLayerSetting, layerSettingNames, LayerState, } from "./layer";
var justSpreadSheetLayerSettingNames = [
    "altColumn",
    "altType",
    "altUnit",
    "barChartBitmask",
    "beginRange",
    "cartesianCustomScale",
    "cartesianScale",
    "colorMapColumn",
    "colorMapperName",
    "coordinatesType",
    "decay",
    "dynamicColor",
    "dynamicData",
    "endDateColumn",
    "endRange",
    "geometryColumn",
    "hyperlinkColumn",
    "hyperlinkFormat",
    "latColumn",
    "lngColumn",
    "markerColumn",
    "markerIndex",
    "markerScale",
    "nameColumn",
    "normalizeColorMap",
    "normalizeColorMapMax",
    "normalizeColorMapMin",
    "normalizeSize",
    "normalizeSizeClip",
    "normalizeSizeMax",
    "normalizeSizeMin",
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
/** A list of the names of the available settings for `SpreadSheetLayer`
 * instances and their equivalents (things implementing
 * [[SpreadSheetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export var spreadSheetLayerSettingNames = layerSettingNames.concat(justSpreadSheetLayerSettingNames);
/** Type guard function for `SpreadSheetLayerSetting`. */
export function isSpreadSheetLayerSetting(obj) {
    // No special settings specific to non-base SpreadSheetLayerSetting.
    return isLayerSetting(obj) || isBaseSpreadSheetLayerSetting(obj);
}
/** Apply a setting to a `SpreadSheetLayer` or equivalent. */
export function applySpreadSheetLayerSetting(layer, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
    layer[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
}
/** Extract all of the current settings of a `SpreadSheetLayer` or equivalent. */
export function extractSpreadSheetLayerSettings(layer) {
    var e_1, _a;
    var s = extractLayerSettings(layer);
    try {
        for (var justSpreadSheetLayerSettingNames_1 = __values(justSpreadSheetLayerSettingNames), justSpreadSheetLayerSettingNames_1_1 = justSpreadSheetLayerSettingNames_1.next(); !justSpreadSheetLayerSettingNames_1_1.done; justSpreadSheetLayerSettingNames_1_1 = justSpreadSheetLayerSettingNames_1.next()) {
            var n = justSpreadSheetLayerSettingNames_1_1.value;
            s.push([n, layer["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justSpreadSheetLayerSettingNames_1_1 && !justSpreadSheetLayerSettingNames_1_1.done && (_a = justSpreadSheetLayerSettingNames_1.return)) _a.call(justSpreadSheetLayerSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `SpreadSheetLayer`, or equivalent, to another. */
export function copySpreadSheetLayerSettings(source, dest) {
    var e_2, _a;
    copyLayerSettings(source, dest);
    try {
        for (var justSpreadSheetLayerSettingNames_2 = __values(justSpreadSheetLayerSettingNames), justSpreadSheetLayerSettingNames_2_1 = justSpreadSheetLayerSettingNames_2.next(); !justSpreadSheetLayerSettingNames_2_1.done; justSpreadSheetLayerSettingNames_2_1 = justSpreadSheetLayerSettingNames_2.next()) {
            var n = justSpreadSheetLayerSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justSpreadSheetLayerSettingNames_2_1 && !justSpreadSheetLayerSettingNames_2_1.done && (_a = justSpreadSheetLayerSettingNames_2.return)) _a.call(justSpreadSheetLayerSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `SpreadSheetLayerSettingsInterface`. */
var SpreadSheetLayerState = /** @class */ (function (_super) {
    __extends(SpreadSheetLayerState, _super);
    function SpreadSheetLayerState(source) {
        var _this = 
        // Here we redundantly copy the generic Layer settings, but TypeScript
        // requires the super() call. Oh well.
        _super.call(this, source) || this;
        copySpreadSheetLayerSettings(source, _this);
        return _this;
    }
    SpreadSheetLayerState.prototype.get_altColumn = function () {
        return this.altColumn;
    };
    SpreadSheetLayerState.prototype.set_altColumn = function (v) {
        this.altColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_altType = function () {
        return this.altType;
    };
    SpreadSheetLayerState.prototype.set_altType = function (v) {
        this.altType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_altUnit = function () {
        return this.altUnit;
    };
    SpreadSheetLayerState.prototype.set_altUnit = function (v) {
        this.altUnit = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_barChartBitmask = function () {
        return this.barChartBitmask;
    };
    SpreadSheetLayerState.prototype.set_barChartBitmask = function (v) {
        this.barChartBitmask = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_beginRange = function () {
        return this.beginRange;
    };
    SpreadSheetLayerState.prototype.set_beginRange = function (v) {
        this.beginRange = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_cartesianCustomScale = function () {
        return this.cartesianCustomScale;
    };
    SpreadSheetLayerState.prototype.set_cartesianCustomScale = function (v) {
        this.cartesianCustomScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_cartesianScale = function () {
        return this.cartesianScale;
    };
    SpreadSheetLayerState.prototype.set_cartesianScale = function (v) {
        this.cartesianScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_colorMapColumn = function () {
        return this.colorMapColumn;
    };
    SpreadSheetLayerState.prototype.set_colorMapColumn = function (v) {
        this.colorMapColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_colorMapperName = function () {
        return this.colorMapperName;
    };
    SpreadSheetLayerState.prototype.set_colorMapperName = function (v) {
        this.colorMapperName = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_coordinatesType = function () {
        return this.coordinatesType;
    };
    SpreadSheetLayerState.prototype.set_coordinatesType = function (v) {
        this.coordinatesType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_decay = function () {
        return this.decay;
    };
    SpreadSheetLayerState.prototype.set_decay = function (v) {
        this.decay = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_dynamicColor = function () {
        return this.dynamicColor;
    };
    SpreadSheetLayerState.prototype.set_dynamicColor = function (v) {
        this.dynamicColor = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_dynamicData = function () {
        return this.dynamicData;
    };
    SpreadSheetLayerState.prototype.set_dynamicData = function (v) {
        this.dynamicData = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_endDateColumn = function () {
        return this.endDateColumn;
    };
    SpreadSheetLayerState.prototype.set_endDateColumn = function (v) {
        this.endDateColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_endRange = function () {
        return this.endRange;
    };
    SpreadSheetLayerState.prototype.set_endRange = function (v) {
        this.endRange = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_geometryColumn = function () {
        return this.geometryColumn;
    };
    SpreadSheetLayerState.prototype.set_geometryColumn = function (v) {
        this.geometryColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_hyperlinkColumn = function () {
        return this.hyperlinkColumn;
    };
    SpreadSheetLayerState.prototype.set_hyperlinkColumn = function (v) {
        this.hyperlinkColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_hyperlinkFormat = function () {
        return this.hyperlinkFormat;
    };
    SpreadSheetLayerState.prototype.set_hyperlinkFormat = function (v) {
        this.hyperlinkFormat = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_latColumn = function () {
        return this.latColumn;
    };
    SpreadSheetLayerState.prototype.set_latColumn = function (v) {
        this.latColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_lngColumn = function () {
        return this.lngColumn;
    };
    SpreadSheetLayerState.prototype.set_lngColumn = function (v) {
        this.lngColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerColumn = function () {
        return this.markerColumn;
    };
    SpreadSheetLayerState.prototype.set_markerColumn = function (v) {
        this.markerColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerIndex = function () {
        return this.markerIndex;
    };
    SpreadSheetLayerState.prototype.set_markerIndex = function (v) {
        this.markerIndex = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_markerScale = function () {
        return this.markerScale;
    };
    SpreadSheetLayerState.prototype.set_markerScale = function (v) {
        this.markerScale = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_nameColumn = function () {
        return this.nameColumn;
    };
    SpreadSheetLayerState.prototype.set_nameColumn = function (v) {
        this.nameColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMap = function () {
        return this.normalizeColorMap;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMap = function (v) {
        this.normalizeColorMap = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMapMax = function () {
        return this.normalizeColorMapMax;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMapMax = function (v) {
        this.normalizeColorMapMax = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeColorMapMin = function () {
        return this.normalizeColorMapMin;
    };
    SpreadSheetLayerState.prototype.set_normalizeColorMapMin = function (v) {
        this.normalizeColorMapMin = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSize = function () {
        return this.normalizeSize;
    };
    SpreadSheetLayerState.prototype.set_normalizeSize = function (v) {
        this.normalizeSize = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeClip = function () {
        return this.normalizeSizeClip;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeClip = function (v) {
        this.normalizeSizeClip = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeMax = function () {
        return this.normalizeSizeMax;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeMax = function (v) {
        this.normalizeSizeMax = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_normalizeSizeMin = function () {
        return this.normalizeSizeMin;
    };
    SpreadSheetLayerState.prototype.set_normalizeSizeMin = function (v) {
        this.normalizeSizeMin = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_plotType = function () {
        return this.plotType;
    };
    SpreadSheetLayerState.prototype.set_plotType = function (v) {
        this.plotType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_pointScaleType = function () {
        return this.pointScaleType;
    };
    SpreadSheetLayerState.prototype.set_pointScaleType = function (v) {
        this.pointScaleType = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_raUnits = function () {
        return this.raUnits;
    };
    SpreadSheetLayerState.prototype.set_raUnits = function (v) {
        this.raUnits = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_scaleFactor = function () {
        return this.scaleFactor;
    };
    SpreadSheetLayerState.prototype.set_scaleFactor = function (v) {
        this.scaleFactor = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_showFarSide = function () {
        return this.showFarSide;
    };
    SpreadSheetLayerState.prototype.set_showFarSide = function (v) {
        this.showFarSide = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_sizeColumn = function () {
        return this.sizeColumn;
    };
    SpreadSheetLayerState.prototype.set_sizeColumn = function (v) {
        this.sizeColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_startDateColumn = function () {
        return this.startDateColumn;
    };
    SpreadSheetLayerState.prototype.set_startDateColumn = function (v) {
        this.startDateColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_timeSeries = function () {
        return this.timeSeries;
    };
    SpreadSheetLayerState.prototype.set_timeSeries = function (v) {
        this.timeSeries = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_xAxisColumn = function () {
        return this.xAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_xAxisColumn = function (v) {
        this.xAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_xAxisReverse = function () {
        return this.xAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_xAxisReverse = function (v) {
        this.xAxisReverse = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_yAxisColumn = function () {
        return this.yAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_yAxisColumn = function (v) {
        this.yAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_yAxisReverse = function () {
        return this.yAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_yAxisReverse = function (v) {
        this.yAxisReverse = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_zAxisColumn = function () {
        return this.zAxisColumn;
    };
    SpreadSheetLayerState.prototype.set_zAxisColumn = function (v) {
        this.zAxisColumn = v;
        return v;
    };
    SpreadSheetLayerState.prototype.get_zAxisReverse = function () {
        return this.zAxisReverse;
    };
    SpreadSheetLayerState.prototype.set_zAxisReverse = function (v) {
        this.zAxisReverse = v;
        return v;
    };
    return SpreadSheetLayerState;
}(LayerState));
export { SpreadSheetLayerState };
//# sourceMappingURL=spreadsheetlayer.js.map