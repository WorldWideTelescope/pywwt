// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Various GL primitives.

import { registerType, registerEnum } from "../typesystem.js";
import { ss } from "../ss.js";
import { Matrix3d, Vector3d, PositionColored } from "../double3d.js";
import { Color } from "../color.js";
import { URLHelpers } from "../url_helpers.js";
import { WEBGL } from "./webgl_constants.js";
import {
    PositionVertexBuffer,
    PositionColoredVertexBuffer,
    TimeSeriesLineVertexBuffer,
    TimeSeriesPointVertexBuffer,
} from "./gl_buffers.js";
import { Texture } from "./texture.js";
import {
    SimpleLineShader,
    SimpleLineShader2D,
    OrbitLineShader,
    LineShaderNormalDates,
    TimeSeriesPointSpriteShader,
} from "./shaders.js";


// wwtlib.CullMode

export var CullMode = {
    none: 0,
    counterClockwise: 2,
    clockwise: 1
};

registerType("CullMode", CullMode);
registerEnum("CullMode", CullMode);


// wwtlib.PointScaleTypes

export var PointScaleTypes = {
    linear: 0,
    power: 1,
    log: 2,
    constant: 3,
    stellarMagnitude: 4
};

registerType("PointScaleTypes", PointScaleTypes);
registerEnum("PointScaleTypes", PointScaleTypes);


// wwtlib.DataItem
//
// This type was originally defined in VizLayer.cs, but it's quite simple
// and is used here.

export function DataItem() {
    this.size = 0;
}

var DataItem$ = {
    getColor: function () {
        return 'Red';
    }
};

registerType("DataItem", [DataItem, DataItem$, null]);


// wwtlib.Dates

export function Dates(start, end) {
    this.startDate = 0;
    this.endDate = 0;
    this.startDate = start;
    this.endDate = end;
}

Dates.empty = function () {
    return new Dates(0, 0);
};

var Dates$ = {
    copy: function () {
        return new Dates(this.startDate, this.endDate);
    }
};

registerType("Dates", [Dates, Dates$, null]);


// wwtlib.SimpleLineList

export function SimpleLineList() {
    this._zBuffer = true;
    this._linePoints = [];
    this._usingLocalCenter = false;
    this.sky = true;
    this.aaFix = true;
    this.pure2D = false;
    this.viewTransform = Matrix3d.get_identity();
    this._lineBuffers = [];
    this._lineBufferCounts = [];
    this.useLocalCenters = false;
}

var SimpleLineList$ = {
    get_depthBuffered: function () {
        return this._zBuffer;
    },

    set_depthBuffered: function (value) {
        this._zBuffer = value;
        return value;
    },

    addLine: function (v1, v2) {
        this._linePoints.push(v1);
        this._linePoints.push(v2);
        this._emptyLineBuffer();
    },

    clear: function () {
        this._linePoints.length = 0;
        this._emptyLineBuffer();
    },

    drawLines: function (renderContext, opacity, color) {
        if (this._linePoints.length < 2) {
            return;
        }
        this._initLineBuffer(renderContext);
        var count = this._linePoints.length;
        if (renderContext.gl == null) {
            var viewPoint = Vector3d._transformCoordinate(renderContext.get_viewPoint(), this.viewTransform);
            var ctx = renderContext.device;
            ctx.save();
            ctx.strokeStyle = color.toString();
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.25;
            var firstPoint = new Vector3d();
            var secondPoint = new Vector3d();
            for (var i = 0; i < count; i += 2) {
                firstPoint = renderContext.WVP.transform(this._linePoints[i]);
                secondPoint = renderContext.WVP.transform(this._linePoints[i + 1]);
                if (Vector3d.dot(this._linePoints[i], viewPoint) > 0.6) {
                    ctx.beginPath();
                    ctx.moveTo(firstPoint.x, firstPoint.y);
                    ctx.lineTo(secondPoint.x, secondPoint.y);
                    ctx.stroke();
                }
            }
            ctx.restore();
        } else {
            var $enum1 = ss.enumerate(this._lineBuffers);
            while ($enum1.moveNext()) {
                var lineBuffer = $enum1.current;
                if (this.pure2D) {
                    SimpleLineShader2D.use(renderContext, lineBuffer.vertexBuffer, color, this._zBuffer);
                }
                else {
                    SimpleLineShader.use(renderContext, lineBuffer.vertexBuffer, color, this._zBuffer);
                }
                renderContext.gl.drawArrays(WEBGL.LINES, 0, lineBuffer.count);
            }
        }
    },

    _initLineBuffer: function (renderContext) {
        if (renderContext.gl != null) {
            if (!this._lineBuffers.length) {
                var count = this._linePoints.length;
                var lineBuffer = null;
                var linePointList = null;
                this._localCenter = new Vector3d();
                if (this.get_depthBuffered()) {
                    var $enum1 = ss.enumerate(this._linePoints);

                    // compute the local center
                    while ($enum1.moveNext()) {
                        var point = $enum1.current;
                        this._localCenter.add(point);
                    }
                    this._localCenter.x /= count;
                    this._localCenter.y /= count;
                    this._localCenter.z /= count;
                }
                var countLeft = count;
                var index = 0;
                var counter = 0;
                var temp;
                var $enum2 = ss.enumerate(this._linePoints);
                while ($enum2.moveNext()) {
                    var point = $enum2.current;
                    if (counter >= 100000 || linePointList == null) {
                        if (lineBuffer != null) {
                            lineBuffer.unlock();
                        }
                        var thisCount = Math.min(100000, countLeft);
                        countLeft -= thisCount;
                        lineBuffer = new PositionVertexBuffer(thisCount);
                        linePointList = lineBuffer.lock(); // Lock the buffer (which will return our structs)
                        this._lineBuffers.push(lineBuffer);
                        this._lineBufferCounts.push(thisCount);
                        counter = 0;
                    }
                    if (this.useLocalCenters) {
                        temp = Vector3d.subtractVectors(point, this._localCenter);
                        linePointList[counter] = temp;
                    }
                    else {
                        linePointList[counter] = point;
                    }
                    index++;
                    counter++;
                }
                if (lineBuffer != null) {
                    lineBuffer.unlock();
                }
            }
        }
    },

    _emptyLineBuffer: function () { }
};

registerType("SimpleLineList", [SimpleLineList, SimpleLineList$, null]);


// wwtlib.OrbitLineList

export function OrbitLineList() {
    this._zBuffer = true;
    this._linePoints = [];
    this._lineColors = [];
    this.sky = true;
    this.aaFix = true;
    this.viewTransform = Matrix3d.get_identity();
    this._lineBuffers = [];
    this._lineBufferCounts = [];
    this.useLocalCenters = false;
}

var OrbitLineList$ = {
    get_depthBuffered: function () {
        return this._zBuffer;
    },

    set_depthBuffered: function (value) {
        this._zBuffer = value;
        return value;
    },

    addLine: function (v1, v2, c1, c2) {
        this._linePoints.push(v1);
        this._lineColors.push(c1);
        this._linePoints.push(v2);
        this._lineColors.push(c2);
        this._emptyLineBuffer();
    },

    clear: function () {
        this._linePoints.length = 0;
        this._emptyLineBuffer();
    },

    drawLines: function (renderContext, opacity, color) {
        if (this._linePoints.length < 2) {
            return;
        }
        this._initLineBuffer(renderContext);
        var count = this._linePoints.length;
        var $enum1 = ss.enumerate(this._lineBuffers);
        while ($enum1.moveNext()) {
            var lineBuffer = $enum1.current;
            OrbitLineShader.use(renderContext, lineBuffer.vertexBuffer, color);
            renderContext.gl.drawArrays(WEBGL.LINES, 0, lineBuffer.count);
        }
    },

    _initLineBuffer: function (renderContext) {
        if (renderContext.gl != null) {
            if (!this._lineBuffers.length) {
                var count = this._linePoints.length;
                var lineBuffer = null;
                var linePointList = null;
                this._localCenter = new Vector3d();
                if (this.get_depthBuffered()) {
                    var $enum1 = ss.enumerate(this._linePoints);

                    // compute the local center
                    while ($enum1.moveNext()) {
                        var point = $enum1.current;
                        this._localCenter.add(point);
                    }
                    this._localCenter.x /= count;
                    this._localCenter.y /= count;
                    this._localCenter.z /= count;
                }
                var countLeft = count;
                var index = 0;
                var counter = 0;
                var temp;
                var $enum2 = ss.enumerate(this._linePoints);
                while ($enum2.moveNext()) {
                    var point = $enum2.current;
                    if (counter >= 100000 || linePointList == null) {
                        if (lineBuffer != null) {
                            lineBuffer.unlock();
                        }
                        var thisCount = Math.min(100000, countLeft);
                        countLeft -= thisCount;
                        lineBuffer = new PositionColoredVertexBuffer(thisCount);
                        linePointList = lineBuffer.lock(); // Lock the buffer (which will return our structs)
                        this._lineBuffers.push(lineBuffer);
                        this._lineBufferCounts.push(thisCount);
                        counter = 0;
                    }
                    if (this.useLocalCenters) {
                        temp = Vector3d.subtractVectors(point, this._localCenter);
                        linePointList[counter] = new PositionColored(temp, this._lineColors[index]);
                    }
                    else {
                        linePointList[counter] = new PositionColored(point, this._lineColors[index]);
                    }
                    index++;
                    counter++;
                }
                if (lineBuffer != null) {
                    lineBuffer.unlock();
                }
            }
        }
    },

    _emptyLineBuffer: function () {
        var $enum1 = ss.enumerate(this._lineBuffers);
        while ($enum1.moveNext()) {
            var lineBuffer = $enum1.current;
            lineBuffer.dispose();
        }
        this._lineBuffers.length = 0;
    }
};

registerType("OrbitLineList", [OrbitLineList, OrbitLineList$, null]);


// wwtlib.LineList

export function LineList() {
    this._zBuffer = true;
    this.timeSeries = false;
    this.showFarSide = true;
    this.sky = false;
    this.decay = 0;
    this.useNonRotatingFrame = false;
    this.jNow = 0;
    this._linePoints = [];
    this._lineColors = [];
    this._lineDates = [];
    this._usingLocalCenter = true;
    this._lineBuffers = [];
    this._lineBufferCounts = [];
}

var LineList$ = {
    get_depthBuffered: function () {
        return this._zBuffer;
    },

    set_depthBuffered: function (value) {
        this._zBuffer = value;
        return value;
    },

    addLine: function (v1, v2, color, date) {
        this._linePoints.push(v1);
        this._linePoints.push(v2);
        this._lineColors.push(color);
        this._lineDates.push(date);
        this._emptyLineBuffer();
    },

    addLineNoDate: function (v1, v2, color) {
        this._linePoints.push(v1);
        this._linePoints.push(v2);
        this._lineColors.push(color);
        this._lineDates.push(new Dates(0, 0));
        this._emptyLineBuffer();
    },

    clear: function () {
        this._linePoints.length = 0;
        this._lineColors.length = 0;
        this._lineDates.length = 0;
    },

    drawLines: function (renderContext, opacity) {
        if (this._linePoints.length < 2 || opacity <= 0) {
            return;
        }
        if (renderContext.gl == null) {
            //todo draw with HTML5
        } else {
            this._initLineBuffer();
            var $enum1 = ss.enumerate(this._lineBuffers);
            while ($enum1.moveNext()) {
                var lineBuffer = $enum1.current;
                LineShaderNormalDates.use(renderContext, lineBuffer.vertexBuffer, Color.fromArgb(255, 255, 255, 255), this._zBuffer, this.jNow, (this.timeSeries) ? this.decay : 0);
                renderContext.gl.drawArrays(WEBGL.LINES, 0, lineBuffer.count);
            }
        }
    },

    _initLineBuffer: function () {
        if (!this._lineBuffers.length) {
            var count = this._linePoints.length;
            var lineBuffer = null;
            var linePointList = null;
            var countLeft = count;
            var index = 0;
            var counter = 0;
            var temp;
            var $enum1 = ss.enumerate(this._linePoints);
            while ($enum1.moveNext()) {
                var point = $enum1.current;
                if (counter >= 100000 || linePointList == null) {
                    if (lineBuffer != null) {
                        lineBuffer.unlock();
                    }
                    var thisCount = Math.min(100000, countLeft);
                    countLeft -= thisCount;
                    lineBuffer = new TimeSeriesLineVertexBuffer(thisCount);
                    linePointList = lineBuffer.lock(); // Lock the buffer (which will return our structs)
                    this._lineBuffers.push(lineBuffer);
                    this._lineBufferCounts.push(thisCount);
                    counter = 0;
                }
                var div2 = ss.truncate((index / 2));
                temp = point;  // -localCenter;
                linePointList[counter] = new TimeSeriesLineVertex();
                linePointList[counter].position = temp;
                linePointList[counter].normal = point;
                linePointList[counter].tu = this._lineDates[div2].startDate;
                linePointList[counter].tv = this._lineDates[div2].endDate;
                linePointList[counter].set_color(this._lineColors[div2]);
                index++;
                counter++;
            }
            if (lineBuffer != null) {
                lineBuffer.unlock();
            }
        }
    },

    _emptyLineBuffer: function () { }
};

registerType("LineList", [LineList, LineList$, null]);


// wwtlib.TriangleList

export function TriangleList() {
    this._trianglePoints = [];
    this._triangleColors = [];
    this._triangleDates = [];
    this.timeSeries = false;
    this.showFarSide = false;
    this.sky = false;
    this.depthBuffered = true;
    this.writeZbuffer = false;
    this.decay = 0;
    this.autoTime = true;
    this.jNow = 0;
    this._dataToDraw = false;
    this._triangleBuffers = [];
    this._triangleBufferCounts = [];
}

var TriangleList$ = {
    addTriangle: function (v1, v2, v3, color, date) {
        this._trianglePoints.push(v1);
        this._trianglePoints.push(v2);
        this._trianglePoints.push(v3);
        this._triangleColors.push(color);
        this._triangleDates.push(date);
        this._emptyTriangleBuffer();
    },

    addSubdividedTriangles: function (v1, v2, v3, color, date, subdivisions) {
        subdivisions--;
        if (subdivisions < 0) {
            this.addTriangle(v1, v2, v3, color, date);
        } else {
            var v12;
            var v23;
            var v31;
            v12 = Vector3d.midPointByLength(v1, v2);
            v23 = Vector3d.midPointByLength(v2, v3);
            v31 = Vector3d.midPointByLength(v3, v1);
            this.addSubdividedTriangles(v1, v12, v31, color, date, subdivisions);
            this.addSubdividedTriangles(v12, v23, v31, color, date, subdivisions);
            this.addSubdividedTriangles(v12, v2, v23, color, date, subdivisions);
            this.addSubdividedTriangles(v23, v3, v31, color, date, subdivisions);
        }
    },

    addQuad: function (v1, v2, v3, v4, color, date) {
        this._trianglePoints.push(v1);
        this._trianglePoints.push(v3);
        this._trianglePoints.push(v2);
        this._trianglePoints.push(v2);
        this._trianglePoints.push(v3);
        this._trianglePoints.push(v4);
        this._triangleColors.push(color);
        this._triangleDates.push(date);
        this._triangleColors.push(color);
        this._triangleDates.push(date);
        this._emptyTriangleBuffer();
    },

    clear: function () {
        this._triangleColors.length = 0;
        this._trianglePoints.length = 0;
        this._triangleDates.length = 0;
        this._emptyTriangleBuffer();
    },

    _emptyTriangleBuffer: function () { },

    _initTriangleBuffer: function () {
        if (!this._triangleBuffers.length) {
            var count = this._trianglePoints.length;
            var triangleBuffer = null;
            var triPointList = null;
            var countLeft = count;
            var index = 0;
            var counter = 0;
            var $enum1 = ss.enumerate(this._trianglePoints);
            while ($enum1.moveNext()) {
                var point = $enum1.current;
                if (counter >= 90000 || triangleBuffer == null) {
                    if (triangleBuffer != null) {
                        triangleBuffer.unlock();
                    }
                    var thisCount = Math.min(90000, countLeft);
                    countLeft -= thisCount;
                    triangleBuffer = new TimeSeriesLineVertexBuffer(thisCount);
                    this._triangleBuffers.push(triangleBuffer);
                    this._triangleBufferCounts.push(thisCount);
                    triPointList = triangleBuffer.lock(); // Lock the buffer (which will return our structs)
                    counter = 0;
                }
                triPointList[counter] = new TimeSeriesLineVertex();
                triPointList[counter].position = point;
                triPointList[counter].normal = point;
                var div3 = ss.truncate((index / 3));
                triPointList[counter].set_color(this._triangleColors[div3]);
                triPointList[counter].tu = this._triangleDates[div3].startDate;
                triPointList[counter].tv = this._triangleDates[div3].endDate;
                index++;
                counter++;
            }
            if (triangleBuffer != null) {
                triangleBuffer.unlock();
            }
            this._triangleColors.length = 0;
            this._triangleDates.length = 0;
            this._trianglePoints.length = 0;
            this._dataToDraw = true;
        }
    },

    draw: function (renderContext, opacity, cull) {
        if (this._trianglePoints.length < 1 && !this._dataToDraw) {
            return;
        }
        if (renderContext.gl == null) {
            //todo implement HTML5 version
        } else {
            this._initTriangleBuffer();
            var $enum1 = ss.enumerate(this._triangleBuffers);
            while ($enum1.moveNext()) {
                var triBuffer = $enum1.current;
                LineShaderNormalDates.use(renderContext, triBuffer.vertexBuffer, Color.fromArgb(255, 255, 255, 255), this.depthBuffered, this.jNow, (this.timeSeries) ? this.decay : 0);
                renderContext.gl.drawArrays(WEBGL.TRIANGLES, 0, triBuffer.count);
            }
        }
    }
};

registerType("TriangleList", [TriangleList, TriangleList$, null]);


// wwtlib.TriangleFanList

export function TriangleFanList() {
    this._zBuffer = true;
    this.timeSeries = false;
    this.decay = 0;
    this.jNow = 0;
    this._shapes = [];
    this._colors = [];
    this._dates = [];
    this._buffers = [];
    this._bufferCounts = [];
}

var TriangleFanList$ = {
    get_depthBuffered: function () {
        return this._zBuffer;
    },

    set_depthBuffered: function (value) {
        this._zBuffer = value;
        return value;
    },

    addShape: function (shapePoints, color, date) {
        this._shapes.push(shapePoints);
        this._colors.push(color);
        this._dates.push(date);
    },

    draw: function (renderContext, opacity) {
        if (opacity <= 0) {
            return;
        }
        if (renderContext.gl != null) {
            this._initBuffer();
            var $enum1 = ss.enumerate(this._buffers);
            while ($enum1.moveNext()) {
                var buffer = $enum1.current;
                LineShaderNormalDates.use(renderContext, buffer.vertexBuffer, Color.fromArgb(255, 255, 255, 255), this._zBuffer, this.jNow, (this.timeSeries) ? this.decay : 0);
                renderContext.gl.drawArrays(WEBGL.TRIANGLE_FAN, 0, buffer.count);
            }
        }
    },

    _initBuffer: function () {
        if (this._buffers.length !== this._shapes.length) {
            this._buffers.length = 0;
            var index = 0;
            var $enum1 = ss.enumerate(this._shapes);
            while ($enum1.moveNext()) {
                var shape = $enum1.current;
                var buffer = new TimeSeriesLineVertexBuffer(shape.length);
                var pointList = buffer.lock();  // Lock the buffer (which will return our structs)
                this._buffers.push(buffer);
                this._bufferCounts.push(shape.length);
                var counter = 0;
                var $enum2 = ss.enumerate(shape);
                while ($enum2.moveNext()) {
                    var point = $enum2.current;
                    pointList[counter] = new TimeSeriesLineVertex();
                    pointList[counter].position = point;
                    pointList[counter].tu = this._dates[index].startDate;
                    pointList[counter].tv = this._dates[index].endDate;
                    pointList[counter].set_color(this._colors[index]);
                    counter++;
                }
                index++;
                if (buffer != null) {
                    buffer.unlock();
                }
            }
        }
    }
};

registerType("TriangleFanList", [TriangleFanList, TriangleFanList$, null]);


// wwtlib.PointList

export function PointList(device) {
    this._points = [];
    this._colors = [];
    this._dates = [];
    this._sizes = [];
    this.timeSeries = false;
    this.showFarSide = false;
    this.sky = false;
    this.depthBuffered = true;
    this.decay = 0;
    this.scale = 1;
    this.autoTime = true;
    this.jNow = 0;
    this._dataToDraw = false;
    this.items = [];
    this._imageReady = false;
    this._init = false;
    this.minSize = 2;
    this._pointBuffers = [];
    this._pointBufferCounts = [];
    this._device = device;
}

PointList.starTexture = null;

var PointList$ = {
    addPoint: function (v1, color, date, size) {
        this._points.push(v1);
        this._colors.push(color._clone());
        this._dates.push(date);
        this._sizes.push(size);
        this._emptyPointBuffer();
    },

    clear: function () {
        this._colors.length = 0;
        this._points.length = 0;
        this._dates.length = 0;
        this._sizes.length = 0;
        this._emptyPointBuffer();
    },

    _emptyPointBuffer: function () {
        var $enum1 = ss.enumerate(this._pointBuffers);
        while ($enum1.moveNext()) {
            var pointBuffer = $enum1.current;
            pointBuffer.dispose();
        }
        this._pointBuffers.length = 0;
        this._init = false;
    },

    _initBuffer: function (renderContext) {
        var $this = this;

        if (!this._init) {
            if (renderContext.gl == null) {
                this._starProfile = document.createElement('img');
                this._starProfile.addEventListener('load', function (e) {
                    $this._imageReady = true;
                }, false);
                this._starProfile.src = URLHelpers.singleton.engineAssetUrl('StarProfileAlpha.png');
                this._worldList = new Array(this._points.length);
                this._transformedList = new Array(this._points.length);
                var index = 0;
                var $enum1 = ss.enumerate(this._points);
                while ($enum1.moveNext()) {
                    // todo filter by date
                    var pnt = $enum1.current;
                    var item = new DataItem();
                    item.location = pnt;
                    item.tranformed = new Vector3d();
                    item.size = this._sizes[index];
                    item.color = this._colors[index];
                    this._worldList[index] = item.location;
                    this._transformedList[index] = item.tranformed;
                    this.items.push(item);
                    index++;
                }
            } else {
                if (!this._pointBuffers.length) {
                    if (PointList.starTexture == null) {
                        PointList.starTexture = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('StarProfileAlpha.png'));
                    }
                    var count = this._points.length;
                    var pointBuffer = null;
                    var pointList = null;
                    var countLeft = count;
                    var index = 0;
                    var counter = 0;
                    var $enum2 = ss.enumerate(this._points);
                    while ($enum2.moveNext()) {
                        var point = $enum2.current;
                        if (counter >= 100000 || pointList == null) {
                            if (pointBuffer != null) {
                                pointBuffer.unlock();
                            }
                            var thisCount = Math.min(100000, countLeft);
                            countLeft -= thisCount;
                            pointBuffer = new TimeSeriesPointVertexBuffer(thisCount);
                            pointList = pointBuffer.lock(); // Lock the buffer (which will return our structs)
                            this._pointBuffers.push(pointBuffer);
                            this._pointBufferCounts.push(thisCount);
                            counter = 0;
                        }
                        pointList[counter] = new TimeSeriesPointVertex();
                        pointList[counter].position = point;
                        pointList[counter].pointSize = this._sizes[index];
                        pointList[counter].tu = this._dates[index].startDate;
                        pointList[counter].tv = this._dates[index].endDate;
                        pointList[counter].set_color(this._colors[index]);
                        index++;
                        counter++;
                    }
                    if (pointBuffer != null) {
                        pointBuffer.unlock();
                    }
                }
            }
            this._init = true;
        }
    },

    draw: function (renderContext, opacity, cull) {
        this._initBuffer(renderContext);
        if (renderContext.gl == null) {
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
                // todo filter by date
                var item = $enum1.current;
                if (item.tranformed.z < 1) {
                    var x = item.tranformed.x;
                    var y = item.tranformed.y;
                    var size = 0.1 * item.size / scaleFactor;
                    var half = size / 2;
                    if (x > -half && x < width + half && y > -half && y < height + half) {
                        ctx.beginPath();
                        ctx.fillStyle = item.color.toFormat();
                        ctx.arc(x, y, size, 0, Math.PI * 2, true);
                        ctx.fill();
                    }
                }
            }
            renderContext.device.restore();
        } else {
            var zero = new Vector3d();
            var matInv = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
            matInv.invert();
            var cam = Vector3d._transformCoordinate(zero, matInv);
            var $enum2 = ss.enumerate(this._pointBuffers);
            while ($enum2.moveNext()) {
                var pointBuffer = $enum2.current;
                TimeSeriesPointSpriteShader.use(renderContext, pointBuffer.vertexBuffer, PointList.starTexture.texture2d, Color.fromArgb(255 * opacity, 255, 255, 255), this.depthBuffered, this.jNow, (this.timeSeries) ? this.decay : 0, cam, (this.scale * (renderContext.height / 960)), this.minSize, this.showFarSide, this.sky);
                renderContext.gl.drawArrays(WEBGL.POINTS, 0, pointBuffer.count);
            }
        }
    },

    drawTextured: function (renderContext, texture, opacity) {
        this._initBuffer(renderContext);
        var zero = new Vector3d();
        var matInv = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        matInv.invert();
        var cam = Vector3d._transformCoordinate(zero, matInv);
        var $enum1 = ss.enumerate(this._pointBuffers);
        while ($enum1.moveNext()) {
            var pointBuffer = $enum1.current;
            TimeSeriesPointSpriteShader.use(renderContext, pointBuffer.vertexBuffer, texture, Color.fromArgb(255 * opacity, 255, 255, 255), this.depthBuffered, this.jNow, this.decay, cam, (this.scale * (renderContext.height / 960)), this.minSize, this.showFarSide, this.sky);
            renderContext.gl.drawArrays(WEBGL.POINTS, 0, pointBuffer.count);
        }
    }
};

registerType("PointList", [PointList, PointList$, null]);


// wwtlib.TimeSeriesLineVertex

export function TimeSeriesLineVertex() {
    this.position = new Vector3d();
    this.normal = new Vector3d();
    this.tu = 0;
    this.tv = 0;
}

TimeSeriesLineVertex.create = function (position, normal, time, color) {
    var temp = new TimeSeriesLineVertex();
    temp.position = position;
    temp.normal = normal;
    temp.tu = time;
    temp.tv = 0;
    temp.color = color;
    return temp;
};

var TimeSeriesLineVertex$ = {
    get_color: function () {
        return this.color;
    },

    set_color: function (value) {
        this.color = value;
        return value;
    }
};

registerType("TimeSeriesLineVertex", [TimeSeriesLineVertex, TimeSeriesLineVertex$, null]);


// wwtlib.TimeSeriesPointVertex

export function TimeSeriesPointVertex() {
    this.pointSize = 0;
    this.tu = 0;
    this.tv = 0;
}

TimeSeriesPointVertex.create = function (position, size, time, color) {
    var tmp = new TimeSeriesPointVertex();
    tmp.position = position;
    tmp.pointSize = size;
    tmp.tu = time;
    tmp.tv = 0;
    tmp.color = color;
    return tmp;
};

var TimeSeriesPointVertex$ = {
    get_color: function () {
        return this.color;
    },

    set_color: function (value) {
        this.color = value;
        return value;
    }
};

registerType("TimeSeriesPointVertex", [TimeSeriesPointVertex, TimeSeriesPointVertex$, null]);
