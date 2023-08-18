// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __extends, __values } from "tslib";
import { annotationSettingNames, AnnotationState, copyAnnotationSettings, extractAnnotationSettings, isAnnotationSetting, } from './annotation';
var justCircleAnnotationSettingNames = [
    "fill",
    "fillColor",
    "lineColor",
    "lineWidth",
    "radius",
    "skyRelative",
];
/** A list of the names of the available settings for `CircleAnnotation`
 * instances and their equivalents (things implementing
 * [[CircleAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export var circleAnnotationSettingNames = annotationSettingNames.concat(justCircleAnnotationSettingNames);
var circleAnnotationSettingTypeInfo = {
    "fill/boolean": true,
    "fillColor/string": true,
    "lineColor/string": true,
    "lineWidth/number": true,
    "radius/number": true,
    "skyRelative/boolean": true,
};
/** Type guard function for `CircleAnnotationSetting`. */
export function isCircleAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return (key in circleAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}
/** Apply a setting to a generic `CircleAnnotation` or equivalent. */
export function applyCircleAnnotationSetting(circle, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    circle[funcName](value);
}
/** Extract all of the current settings of a `CircleAnnotation` or equivalent. */
export function extractCircleAnnotationSettings(circle) {
    var e_1, _a;
    var s = extractAnnotationSettings(circle);
    try {
        for (var justCircleAnnotationSettingNames_1 = __values(justCircleAnnotationSettingNames), justCircleAnnotationSettingNames_1_1 = justCircleAnnotationSettingNames_1.next(); !justCircleAnnotationSettingNames_1_1.done; justCircleAnnotationSettingNames_1_1 = justCircleAnnotationSettingNames_1.next()) {
            var n = justCircleAnnotationSettingNames_1_1.value;
            s.push([n, circle["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (justCircleAnnotationSettingNames_1_1 && !justCircleAnnotationSettingNames_1_1.done && (_a = justCircleAnnotationSettingNames_1.return)) _a.call(justCircleAnnotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `CircleAnnotation`, or equivalent, to another. */
export function copyCircleAnnotationSettings(source, dest) {
    var e_2, _a;
    copyAnnotationSettings(source, dest);
    try {
        for (var justCircleAnnotationSettingNames_2 = __values(justCircleAnnotationSettingNames), justCircleAnnotationSettingNames_2_1 = justCircleAnnotationSettingNames_2.next(); !justCircleAnnotationSettingNames_2_1.done; justCircleAnnotationSettingNames_2_1 = justCircleAnnotationSettingNames_2.next()) {
            var n = justCircleAnnotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (justCircleAnnotationSettingNames_2_1 && !justCircleAnnotationSettingNames_2_1.done && (_a = justCircleAnnotationSettingNames_2.return)) _a.call(justCircleAnnotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `CircleAnnotationSettingsInterface`. */
var CircleAnnotationState = /** @class */ (function (_super) {
    __extends(CircleAnnotationState, _super);
    function CircleAnnotationState(source) {
        var _this = _super.call(this, source) || this;
        copyCircleAnnotationSettings(source, _this);
        return _this;
    }
    CircleAnnotationState.prototype.get_fill = function () {
        return this.fill;
    };
    CircleAnnotationState.prototype.set_fill = function (v) {
        this.fill = v;
        return v;
    };
    CircleAnnotationState.prototype.get_fillColor = function () {
        return this.fillColor;
    };
    CircleAnnotationState.prototype.set_fillColor = function (v) {
        this.fillColor = v;
        return v;
    };
    CircleAnnotationState.prototype.get_lineColor = function () {
        return this.lineColor;
    };
    CircleAnnotationState.prototype.set_lineColor = function (v) {
        this.lineColor = v;
        return v;
    };
    CircleAnnotationState.prototype.get_lineWidth = function () {
        return this.lineWidth;
    };
    CircleAnnotationState.prototype.set_lineWidth = function (v) {
        this.lineWidth = v;
        return v;
    };
    CircleAnnotationState.prototype.get_radius = function () {
        return this.radius;
    };
    CircleAnnotationState.prototype.set_radius = function (v) {
        this.radius = v;
        return v;
    };
    CircleAnnotationState.prototype.get_skyRelative = function () {
        return this.skyRelative;
    };
    CircleAnnotationState.prototype.set_skyRelative = function (v) {
        this.skyRelative = v;
        return v;
    };
    return CircleAnnotationState;
}(AnnotationState));
export { CircleAnnotationState };
//# sourceMappingURL=circleannotation.js.map