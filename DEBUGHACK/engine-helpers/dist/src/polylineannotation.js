// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
import { annotationSettingNames, AnnotationState, copyAnnotationSettings, extractAnnotationSettings, isAnnotationSetting, } from './annotation';
var justPolyLineAnnotationSettingNames = [
    "lineColor",
    "lineWidth",
];
/** A list of the names of the available settings for `PolyLineAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyLineAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export var polyLineAnnotationSettingNames = annotationSettingNames.concat(justPolyLineAnnotationSettingNames);
var polyLineAnnotationSettingTypeInfo = {
    "lineColor/string": true,
    "lineWidth/number": true,
};
/** Type guard function for `PolyLineAnnotationSetting`. */
export function isPolyLineAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in polyLineAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `PolyLineAnnotation` or equivalent. */
export function applyPolyLineAnnotationSetting(poly, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    poly[funcName](value);
}
/** Extract all of the current settings of a `PolyLineAnnotation` or equivalent. */
export function extractPolyLineAnnotationSettings(poly) {
    var e_1, _a;
    var s = extractAnnotationSettings(poly);
    try {
        for (var justPolyLineAnnotationSettingNames_1 = __values(justPolyLineAnnotationSettingNames), justPolyLineAnnotationSettingNames_1_1 = justPolyLineAnnotationSettingNames_1.next(); !justPolyLineAnnotationSettingNames_1_1.done; justPolyLineAnnotationSettingNames_1_1 = justPolyLineAnnotationSettingNames_1.next()) {
            var n = justPolyLineAnnotationSettingNames_1_1.value;
            s.push([n, poly["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justPolyLineAnnotationSettingNames_1_1 && !justPolyLineAnnotationSettingNames_1_1.done && (_a = justPolyLineAnnotationSettingNames_1.return)) _a.call(justPolyLineAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `PolyLineAnnotation`, or equivalent, to another. */
export function copyPolyLineAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justPolyLineAnnotationSettingNames_2 = __values(justPolyLineAnnotationSettingNames), justPolyLineAnnotationSettingNames_2_1 = justPolyLineAnnotationSettingNames_2.next(); !justPolyLineAnnotationSettingNames_2_1.done; justPolyLineAnnotationSettingNames_2_1 = justPolyLineAnnotationSettingNames_2.next()) {
            var n = justPolyLineAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justPolyLineAnnotationSettingNames_2_1 && !justPolyLineAnnotationSettingNames_2_1.done && (_a = justPolyLineAnnotationSettingNames_2.return)) _a.call(justPolyLineAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `PolyLineAnnotationSettingsInterface`. */
var PolyLineAnnotationState = /** @class */ (function (_super) {
    __extends(PolyLineAnnotationState, _super);
    function PolyLineAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyPolyLineAnnotationSettings(source, _this);
        return _this;
    }
    PolyLineAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    PolyLineAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    PolyLineAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    PolyLineAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    return PolyLineAnnotationState;
}(AnnotationState));
export { PolyLineAnnotationState };
//# sourceMappingURL=polylineannotation.js.map