// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __values } from "tslib";
/** A list of the names of the available settings for annotations. */
export var annotationSettingNames = [
    "id",
    "label",
    "opacity",
    "showHoverLabel",
    "tag",
];
var annotationSettingTypeInfo = {
    "id/string": true,
    "label/string": true,
    "opacity/number": true,
    "showHoverLabel/boolean": true,
    "tag/string": true,
};
/** Type guard function for `AnnotationSetting`. */
export function isAnnotationSetting(obj) {
    var key = obj[0] + "/" + typeof obj[1];
    return key in annotationSettingTypeInfo;
}
/** Apply a setting to a generic `Annotation` or equivalent. */
export function applyAnnotationSetting(annotation, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    annotation[funcName](value);
}
/** Extract all of the current settings of a `Annotation` or equivalent. */
export function extractAnnotationSettings(annotation) {
    var e_1, _a;
    var s = [];
    try {
        for (var annotationSettingNames_1 = __values(annotationSettingNames), annotationSettingNames_1_1 = annotationSettingNames_1.next(); !annotationSettingNames_1_1.done; annotationSettingNames_1_1 = annotationSettingNames_1.next()) {
            var n = annotationSettingNames_1_1.value;
            s.push([n, annotation["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (annotationSettingNames_1_1 && !annotationSettingNames_1_1.done && (_a = annotationSettingNames_1.return)) _a.call(annotationSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from one `Annotation`, or equivalent, to another. */
export function copyAnnotationSettings(source, dest) {
    var e_2, _a;
    try {
        for (var annotationSettingNames_2 = __values(annotationSettingNames), annotationSettingNames_2_1 = annotationSettingNames_2.next(); !annotationSettingNames_2_1.done; annotationSettingNames_2_1 = annotationSettingNames_2.next()) {
            var n = annotationSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (annotationSettingNames_2_1 && !annotationSettingNames_2_1.done && (_a = annotationSettingNames_2.return)) _a.call(annotationSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `AnnotationSettingsInterface`. */
var AnnotationState = /** @class */ (function () {
    function AnnotationState(source) {
        copyAnnotationSettings(source, this);
    }
    AnnotationState.prototype.get_id = function () {
        return this.id;
    };
    AnnotationState.prototype.set_id = function (v) {
        this.id = v;
        return v;
    };
    AnnotationState.prototype.get_label = function () {
        return this.label;
    };
    AnnotationState.prototype.set_label = function (v) {
        this.label = v;
        return v;
    };
    AnnotationState.prototype.get_opacity = function () {
        return this.opacity;
    };
    AnnotationState.prototype.set_opacity = function (v) {
        this.opacity = v;
        return v;
    };
    AnnotationState.prototype.get_showHoverLabel = function () {
        return this.showHoverLabel;
    };
    AnnotationState.prototype.set_showHoverLabel = function (v) {
        this.showHoverLabel = v;
        return v;
    };
    AnnotationState.prototype.get_tag = function () {
        return this.tag;
    };
    AnnotationState.prototype.set_tag = function (v) {
        this.tag = v;
        return v;
    };
    return AnnotationState;
}());
export { AnnotationState };
//# sourceMappingURL=annotation.js.map