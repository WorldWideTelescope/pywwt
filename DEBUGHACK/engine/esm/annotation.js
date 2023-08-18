// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Web GL support for annotations.
//
// Annotations all share a set of supporting primitives. Each time any
// annotation changes the primitives, they must be regenerated if they have been
// drawn already. It is best to do updates in large batches.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { Vector3d } from "./double3d.js";
import { Dates, LineList, TriangleList, TriangleFanList, PointList } from "./graphics/primitives3d.js";
import { Tessellator } from "./graphics/tessellator.js";
import { Color, Colors } from "./color.js";
import { Coordinates } from "./coordinates.js";


// wwtlib.Annotation

export function Annotation() {
    this.addedToPrimitives = false;
    this.annotationDirty = true;
    this._opacity = 1;
    this._showHoverLabel = false;
}

Annotation.pointList = null;
Annotation.lineList = null;
Annotation.triangleFanPointList = null;
Annotation.triangleList = null;
Annotation.batchDirty = true;

Annotation.prepBatch = function (renderContext) {
    if (Annotation.pointList == null || Annotation.batchDirty) {
        Annotation.pointList = new PointList(renderContext);
        Annotation.lineList = new LineList();
        Annotation.triangleFanPointList = new TriangleFanList();
        Annotation.triangleList = new TriangleList();
        Annotation.lineList.set_depthBuffered(false);
        Annotation.triangleList.depthBuffered = false;
    }
};

Annotation.drawBatch = function (renderContext) {
    Annotation.batchDirty = false;
    if (renderContext.gl == null) {
        return;
    }
    if (Annotation.pointList != null) {
        Annotation.pointList.draw(renderContext, 1, false);
    }
    if (Annotation.lineList != null) {
        Annotation.lineList.drawLines(renderContext, 1);
    }
    if (Annotation.triangleFanPointList != null) {
        Annotation.triangleFanPointList.draw(renderContext, 1);
    }
    if (Annotation.triangleList != null) {
        Annotation.triangleList.draw(renderContext, 1, 0);
    }
};

Annotation.separation = function (Alpha1, Delta1, Alpha2, Delta2) {
    Delta1 = Delta1 / 180 * Math.PI;
    Delta2 = Delta2 / 180 * Math.PI;
    Alpha1 = Alpha1 / 12 * Math.PI;
    Alpha2 = Alpha2 / 12 * Math.PI;
    var x = Math.cos(Delta1) * Math.sin(Delta2) - Math.sin(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var y = Math.cos(Delta2) * Math.sin(Alpha2 - Alpha1);
    var z = Math.sin(Delta1) * Math.sin(Delta2) + Math.cos(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var vvalue = Math.atan2(Math.sqrt(x * x + y * y), z);
    vvalue = vvalue / Math.PI * 180;
    if (vvalue < 0) {
        vvalue += 180;
    }
    return vvalue;
};

Annotation.colorToUint = function (col) {
    return (col.a) << 24 | (col.r << 16) | (col.g) << 8 | col.b;
};

Annotation.colorToUintAlpha = function (col, opacity) {
    return opacity << 24 | col.r << 16 | col.g << 8 | col.b;
};

var Annotation$ = {
    draw: function (renderContext) { },

    get_opacity: function () {
        return this._opacity;
    },

    set_opacity: function (value) {
        Annotation.batchDirty = true;
        this._opacity = value;
        return value;
    },

    get_id: function () {
        return this._id;
    },

    set_id: function (value) {
        this._id = value;
        return value;
    },

    get_tag: function () {
        return this._tag;
    },

    set_tag: function (value) {
        this._tag = value;
        return value;
    },

    get_label: function () {
        return this._label;
    },

    set_label: function (value) {
        this._label = value;
        return value;
    },

    get_showHoverLabel: function () {
        return this._showHoverLabel;
    },

    set_showHoverLabel: function (value) {
        this._showHoverLabel = value;
        return value;
    },

    hitTest: function (renderContext, RA, dec, x, y) {
        return false;
    },

    get_center: function () {
        return this.center;
    },

    set_center: function (value) {
        this.center = value;
        return value;
    }
};

registerType("Annotation", [Annotation, Annotation$, null]);


// wwtlib.Circle

export function Circle() {
    this._fill$1 = false;
    this._skyRelative$1 = false;
    this._strokeWidth$1 = 1;
    this._radius$1 = 10;
    this._lineColor$1 = Colors.get_white();
    this._fillColor$1 = Colors.get_white();
    this._ra$1 = 0;
    this._dec$1 = 0;
    Annotation.call(this);
}

var Circle$ = {
    get_fill: function () {
        return this._fill$1;
    },

    set_fill: function (value) {
        Annotation.batchDirty = true;
        this._fill$1 = value;
        return value;
    },

    get_skyRelative: function () {
        return this._skyRelative$1;
    },

    set_skyRelative: function (value) {
        Annotation.batchDirty = true;
        this._skyRelative$1 = value;
        return value;
    },

    get_lineWidth: function () {
        return this._strokeWidth$1;
    },

    set_lineWidth: function (value) {
        Annotation.batchDirty = true;
        this._strokeWidth$1 = value;
        return value;
    },

    get_radius: function () {
        return this._radius$1;
    },

    set_radius: function (value) {
        Annotation.batchDirty = true;
        this._radius$1 = value;
        return value;
    },

    get_lineColor: function () {
        return this._lineColor$1.toString();
    },

    set_lineColor: function (value) {
        Annotation.batchDirty = true;
        this._lineColor$1 = Color.load(value);
        return value;
    },

    get_fillColor: function () {
        return this._fillColor$1.toString();
    },

    set_fillColor: function (value) {
        Annotation.batchDirty = true;
        this._fillColor$1 = Color.fromName(value);
        return value;
    },

    setCenter: function (ra, dec) {
        Annotation.batchDirty = true;
        this._ra$1 = ra / 15;
        this._dec$1 = dec;
        this.center = Coordinates.raDecTo3d(this._ra$1, this._dec$1);
    },

    draw: function (renderContext) {
        var onScreen = true;
        var rad = this._radius$1;
        if (this._skyRelative$1) {
            rad /= renderContext.get_fovScale() / 3600;
        }
        var screenSpacePnt = renderContext.WVP.transform(this.center);
        if (screenSpacePnt.z < 0) {
            onScreen = false;
        }
        if (Vector3d.dot(renderContext.get_viewPoint(), this.center) < 0.55) {
            onScreen = false;
        }
        if (renderContext.gl != null) {
            if (Annotation.batchDirty || this.annotationDirty) {
                var up = Vector3d.create(0, 1, 0);
                var xNormal = Vector3d.cross(this.center, up);
                var yNormal = Vector3d.cross(this.center, xNormal);
                var r = this._radius$1 / 44;
                var segments = 72;
                var radiansPerSegment = Math.PI * 2 / segments;
                var vertexList = [];
                for (var j = 0; j <= segments; j++) {
                    var x = Math.cos(j * radiansPerSegment) * r;
                    var y = Math.sin(j * radiansPerSegment) * r;
                    vertexList.push(Vector3d.create(this.center.x + x * xNormal.x + y * yNormal.x, this.center.y + x * xNormal.y + y * yNormal.y, this.center.z + x * xNormal.z + y * yNormal.z));
                }
                if (this._strokeWidth$1 > 0 && vertexList.length > 1) {
                    var lineColorWithOpacity = this._lineColor$1._clone();
                    lineColorWithOpacity.a = Math.round(lineColorWithOpacity.a * this.get_opacity());
                    for (var i = 0; i < (vertexList.length - 1); i++) {
                        Annotation.lineList.addLine(vertexList[i], vertexList[i + 1], lineColorWithOpacity, new Dates(0, 1));
                    }
                }
                if (this._fill$1) {
                    var fillColorWithOpacity = this._fillColor$1._clone();
                    fillColorWithOpacity.a = Math.round(fillColorWithOpacity.a * this.get_opacity());
                    var pos = Vector3d.create(this.center.x, this.center.y, this.center.z);
                    vertexList.splice(0, 0, pos);
                    Annotation.triangleFanPointList.addShape(vertexList, fillColorWithOpacity, new Dates(0, 1));
                }
                this.annotationDirty = false;
            }
        } else {
            if (onScreen) {
                var ctx = renderContext.device;
                ctx.save();
                ctx.globalAlpha = this.get_opacity();
                ctx.beginPath();
                ctx.arc(screenSpacePnt.x, screenSpacePnt.y, rad, 0, Math.PI * 2, true);
                ctx.lineWidth = this._strokeWidth$1;
                ctx.fillStyle = this._fillColor$1.toString();
                if (this._fill$1) {
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
                ctx.strokeStyle = this._lineColor$1.toString();
                ctx.stroke();
                ctx.restore();
            }
        }
    },

    hitTest: function (renderContext, RA, dec, x, y) {
        if (ss.emptyString(this.get_id())) {
            return false;
        }
        var rad = this._radius$1;
        if (!this._skyRelative$1) {
            rad *= renderContext.get_fovScale() / 3600;
        }
        return Annotation.separation(RA, dec, this._ra$1, this._dec$1) < rad;
    }
};

registerType("Circle", [Circle, Circle$, Annotation]);


// wwtlib.Poly

export function Poly() {
    this._points$1 = [];
    this._fill$1 = false;
    this._strokeWidth$1 = 1;
    this._lineColor$1 = Colors.get_white();
    this._fillColor$1 = Colors.get_white();
    Annotation.call(this);
}

var Poly$ = {
    addPoint: function (x, y) {
        Annotation.batchDirty = true;
        this._points$1.push(Coordinates.raDecTo3d(x / 15, y));
    },

    get_fill: function () {
        return this._fill$1;
    },

    set_fill: function (value) {
        Annotation.batchDirty = true;
        this._fill$1 = value;
        return value;
    },

    get_lineWidth: function () {
        return this._strokeWidth$1;
    },

    set_lineWidth: function (value) {
        Annotation.batchDirty = true;
        this._strokeWidth$1 = value;
        return value;
    },

    get_lineColor: function () {
        return this._lineColor$1.toString();
    },

    set_lineColor: function (value) {
        Annotation.batchDirty = true;
        this._lineColor$1 = Color.fromName(value);
        return value;
    },

    get_fillColor: function () {
        return this._fillColor$1.toString();
    },

    set_fillColor: function (value) {
        Annotation.batchDirty = true;
        this._fillColor$1 = Color.fromName(value);
        return value;
    },

    draw: function (renderContext) {
        if (renderContext.gl != null) {
            if (Annotation.batchDirty || this.annotationDirty) {
                //todo can we save this work for later?
                var vertexList = this._points$1;

                if (this._strokeWidth$1 > 0 && this._points$1.length > 1) {
                    var lineColorWithOpacity = this._lineColor$1._clone();
                    lineColorWithOpacity.a = Math.round(lineColorWithOpacity.a * this.get_opacity());
                    for (var i = 0; i < (this._points$1.length - 1); i++) {
                        Annotation.lineList.addLine(vertexList[i], vertexList[i + 1], lineColorWithOpacity, new Dates(0, 1));
                    }
                    Annotation.lineList.addLine(vertexList[this._points$1.length - 1], vertexList[0], lineColorWithOpacity, new Dates(0, 1));
                }
                if (this._fill$1) {
                    var fillColorWithOpacity = this._fillColor$1._clone();
                    fillColorWithOpacity.a = Math.round(fillColorWithOpacity.a * this.get_opacity());
                    var indexes = Tessellator.tesselateSimplePoly(vertexList);
                    for (var i = 0; i < indexes.length; i += 3) {
                        Annotation.triangleList.addSubdividedTriangles(vertexList[indexes[i]], vertexList[indexes[i + 1]], vertexList[indexes[i + 2]], fillColorWithOpacity, new Dates(0, 1), 2);
                    }
                }
                this.annotationDirty = false;
            }
        } else {
            var ctx = renderContext.device;
            ctx.save();
            ctx.globalAlpha = this.get_opacity();
            ctx.beginPath();
            var first = true;
            var $enum1 = ss.enumerate(this._points$1);
            while ($enum1.moveNext()) {
                var pnt = $enum1.current;
                var screenSpacePnt = renderContext.WVP.transform(pnt);
                if (screenSpacePnt.z < 0) {
                    ctx.restore();
                    return;
                }
                if (Vector3d.dot(renderContext.get_viewPoint(), pnt) < 0.75) {
                    ctx.restore();
                    return;
                }
                if (first) {
                    first = false;
                    ctx.moveTo(screenSpacePnt.x, screenSpacePnt.y);
                }
                else {
                    ctx.lineTo(screenSpacePnt.x, screenSpacePnt.y);
                }
            }
            ctx.closePath();
            ctx.lineWidth = this._strokeWidth$1;
            if (this._fill$1) {
                ctx.fillStyle = this._fillColor$1.toString();
                ctx.fill();
            }
            ctx.strokeStyle = this._lineColor$1.toString();
            ctx.globalAlpha = 1;
            ctx.stroke();
            ctx.restore();
        }
    }
};

registerType("Poly", [Poly, Poly$, Annotation]);


// wwtlib.PolyLine

export function PolyLine() {
    this._points$1 = [];
    this._strokeWidth$1 = 1;
    this._lineColor$1 = Colors.get_white();
    Annotation.call(this);
}

var PolyLine$ = {
    addPoint: function (x, y) {
        Annotation.batchDirty = true;
        this._points$1.push(Coordinates.raDecTo3d(x / 15, y));
    },

    get_lineWidth: function () {
        return this._strokeWidth$1;
    },

    set_lineWidth: function (value) {
        Annotation.batchDirty = true;
        this._strokeWidth$1 = value;
        return value;
    },

    get_lineColor: function () {
        return this._lineColor$1.toString();
    },

    set_lineColor: function (value) {
        Annotation.batchDirty = true;
        this._lineColor$1 = Color.fromName(value);
        return value;
    },

    draw: function (renderContext) {
        if (renderContext.gl != null) {
            if (Annotation.batchDirty || this.annotationDirty) {
                //todo can we save this work for later?
                var vertexList = this._points$1;
                if (this._strokeWidth$1 > 0) {
                    var lineColorWithOpacity = this._lineColor$1._clone();
                    lineColorWithOpacity.a = Math.round(lineColorWithOpacity.a * this.get_opacity());
                    for (var i = 0; i < (this._points$1.length - 1); i++) {
                        Annotation.lineList.addLine(vertexList[i], vertexList[i + 1], lineColorWithOpacity, new Dates(0, 1));
                    }
                }
                this.annotationDirty = false;
            }
        } else {
            var ctx = renderContext.device;
            ctx.save();
            ctx.globalAlpha = this.get_opacity();
            var first = true;
            var $enum1 = ss.enumerate(this._points$1);
            while ($enum1.moveNext()) {
                var pnt = $enum1.current;
                var screenSpacePnt = renderContext.WVP.transform(pnt);
                if (screenSpacePnt.z < 0) {
                    ctx.restore();
                    return;
                }
                if (Vector3d.dot(renderContext.get_viewPoint(), pnt) < 0.75) {
                    ctx.restore();
                    return;
                }
                if (first) {
                    first = false;
                    ctx.beginPath();
                    ctx.moveTo(screenSpacePnt.x, screenSpacePnt.y);
                }
                else {
                    ctx.lineTo(screenSpacePnt.x, screenSpacePnt.y);
                }
            }
            ctx.lineWidth = this._strokeWidth$1;
            ctx.strokeStyle = this._lineColor$1.toString();
            ctx.stroke();
            ctx.restore();
        }
    }
};

registerType("PolyLine", [PolyLine, PolyLine$, Annotation]);
