// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
import { annotationSettingNames, AnnotationState, copyAnnotationSettings, extractAnnotationSettings, isAnnotationSetting, } from './annotation';
var justPolyAnnotationSettingNames = [
    "fill",
    "fillColor",
    "lineColor",
    "lineWidth",
];
/** A list of the names of the available settings for `PolyAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export var polyAnnotationSettingNames = annotationSettingNames.concat(justPolyAnnotationSettingNames);
var polyAnnotationSettingTypeInfo = {
    "fill/boolean": true,
    "fillColor/string": true,
    "lineColor/string": true,
    "lineWidth/number": true,
};
/** Type guard function for `PolyAnnotationSetting`. */
export function isPolyAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in polyAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `PolyAnnotation` or equivalent. */
export function applyPolyAnnotationSetting(poly, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    poly[funcName](value);
}
/** Extract all of the current settings of a `PolyAnnotation` or equivalent. */
export function extractPolyAnnotationSettings(poly) {
    var e_1, _a;
    var s = extractAnnotationSettings(poly);
    try {
        for (var justPolyAnnotationSettingNames_1 = __values(justPolyAnnotationSettingNames), justPolyAnnotationSettingNames_1_1 = justPolyAnnotationSettingNames_1.next(); !justPolyAnnotationSettingNames_1_1.done; justPolyAnnotationSettingNames_1_1 = justPolyAnnotationSettingNames_1.next()) {
            var n = justPolyAnnotationSettingNames_1_1.value;
            s.push([n, poly["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justPolyAnnotationSettingNames_1_1 && !justPolyAnnotationSettingNames_1_1.done && (_a = justPolyAnnotationSettingNames_1.return)) _a.call(justPolyAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `PolyAnnotation`, or equivalent, to another. */
export function copyPolyAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justPolyAnnotationSettingNames_2 = __values(justPolyAnnotationSettingNames), justPolyAnnotationSettingNames_2_1 = justPolyAnnotationSettingNames_2.next(); !justPolyAnnotationSettingNames_2_1.done; justPolyAnnotationSettingNames_2_1 = justPolyAnnotationSettingNames_2.next()) {
            var n = justPolyAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justPolyAnnotationSettingNames_2_1 && !justPolyAnnotationSettingNames_2_1.done && (_a = justPolyAnnotationSettingNames_2.return)) _a.call(justPolyAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `PolyAnnotationSettingsInterface`. */
var PolyAnnotationState = /** @class */ (function (_super) {
    __extends(PolyAnnotationState, _super);
    function PolyAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyPolyAnnotationSettings(source, _this);
        return _this;
    }
    PolyAnnotationState.prototype.get_fill = function () {
        return this.fill;
    };
    PolyAnnotationState.prototype.set_fill = function (v) {
        this.fill = v;
        return v;
    };
    PolyAnnotationState.prototype.get_fillColor = function () {
        return this.fillColor;
    };
    PolyAnnotationState.prototype.set_fillColor = function (v) {
        this.fillColor = v;
        return v;
    };
    PolyAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    PolyAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    PolyAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    PolyAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    return PolyAnnotationState;
}(AnnotationState));
export { PolyAnnotationState };
//# sourceMappingURL=polyannotation.js.map