// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A triangle that is part of a tile pyramid render.

import { registerType } from "./typesystem.js";
import { Vector2d, Vector3d, PositionTexture } from "./double3d.js";


// wwtlib.RenderTriangle

export function RenderTriangle() {
    this.a = new PositionTexture();
    this.b = new PositionTexture();
    this.c = new PositionTexture();
    this.normal = new Vector3d();
    this.opacity = 1;
    this.expansionInPixels = 0.6;
    this.tileLevel = 0;
    this._ta = new Vector3d();
    this._tb = new Vector3d();
    this._tc = new Vector3d();
    this._expandedS0 = new Vector2d();
    this._expandedS1 = new Vector2d();
    this._expandedS2 = new Vector2d();
    this.lighting = 1;
}

RenderTriangle.width = 1024;
RenderTriangle.height = 768;
RenderTriangle._contractionInPixels = -0.5;
RenderTriangle.trianglesRendered = 0;
RenderTriangle.trianglesCulled = 0;
RenderTriangle.renderingOn = true;
RenderTriangle._factor = 1;
RenderTriangle.cullInside = true;
RenderTriangle._hw = 0;
RenderTriangle._qw = 0;
RenderTriangle._hh = 0;
RenderTriangle._qh = 0;

RenderTriangle.create = function (a, b, c, img, level) {
    var temp = new RenderTriangle();
    temp.a = a.copy();
    temp.b = b.copy();
    temp.c = c.copy();
    temp._texture = img;
    temp.tileLevel = level;
    temp.makeNormal();
    return temp;
};

RenderTriangle.createWithMiter = function (a, b, c, img, level, expansion) {
    var temp = new RenderTriangle();
    temp.expansionInPixels = expansion;
    temp.a = a.copy();
    temp.b = b.copy();
    temp.c = c.copy();
    temp._texture = img;
    temp.tileLevel = level;
    temp.makeNormal();
    return temp;
};

RenderTriangle._getMiterPoint = function (p1, p2, p3, edgeOffset) {
    var edge1 = Vector2d.subtract(p2, p1);
    var edge2 = Vector2d.subtract(p3, p1);
    edge1.normalize();
    edge2.normalize();
    var dir = Vector2d.create(edge1.x + edge2.x, edge1.y + edge2.y);
    dir.normalize();
    var delta = Vector2d.create(edge1.x - edge2.x, edge1.y - edge2.y);
    var sineHalfAngle = delta.get_length() / 2;
    var net = Math.min(2, edgeOffset / sineHalfAngle);
    dir.extend(net);
    return Vector2d.create(p1.x - dir.x, p1.y - dir.y);
};

RenderTriangle._miterPoint = function (p1x, p1y, p2x, p2y, p3x, p3y, ExpansionInPixels) {
    var e1x = p2x - p1x;
    var e1y = p2y - p1y;
    var e2x = p3x - p1x;
    var e2y = p3y - p1y;
    var length = Math.sqrt(e1x * e1x + e1y * e1y);
    if (!!length) {
        e1x /= length;
        e1y /= length;
    }
    length = Math.sqrt(e2x * e2x + e2y * e2y);
    if (!!length) {
        e2x /= length;
        e2y /= length;
    }
    var dx = e1x + e2x;
    var dy = e1y + e2y;
    length = Math.sqrt(dx * dx + dy * dy);
    if (!!length) {
        dx /= length;
        dy /= length;
    }
    var deltax = e1x - e2x;
    var deltay = e1y - e2y;
    length = Math.sqrt(deltax * deltax + deltay * deltay);
    var sineHalfAngle = length / 2;
    var net = Math.min(2, ExpansionInPixels / sineHalfAngle);
    dx *= net;
    dy *= net;
    return Vector2d.create(p1x - dx, p1y - dy);
};

RenderTriangle._miterPointOut = function (pntOut, p1x, p1y, p2x, p2y, p3x, p3y, ExpansionInPixels) {
    var e1x = p2x - p1x;
    var e1y = p2y - p1y;
    var e2x = p3x - p1x;
    var e2y = p3y - p1y;
    var length = Math.sqrt(e1x * e1x + e1y * e1y);
    if (!!length) {
        e1x /= length;
        e1y /= length;
    }
    length = Math.sqrt(e2x * e2x + e2y * e2y);
    if (!!length) {
        e2x /= length;
        e2y /= length;
    }
    var dx = e1x + e2x;
    var dy = e1y + e2y;
    length = Math.sqrt(dx * dx + dy * dy);
    if (!!length) {
        dx /= length;
        dy /= length;
    }
    var deltax = e1x - e2x;
    var deltay = e1y - e2y;
    length = Math.sqrt(deltax * deltax + deltay * deltay);
    var sineHalfAngle = length / 2;
    var net = Math.min(2, ExpansionInPixels / sineHalfAngle);
    dx *= net;
    dy *= net;
    pntOut.x = p1x - dx;
    pntOut.y = p1y - dy;
};

var RenderTriangle$ = {
    makeNormal: function () {
        var a = this.a.position.copy();
        var b = this.b.position.copy();
        var c = this.c.position.copy();
        a.normalize();
        b.normalize();
        c.normalize();
        var x = a.x + b.x + c.x;
        var y = a.y + b.y + c.y;
        var z = a.z + b.z + c.z;
        this.normal = Vector3d.create(x / 3, y / 3, z / 3);
        this.normal.normalize();
    },

    _checkBackface: function () {
        var ab = Vector3d.subtractVectors(this._ta, this._tb);
        var ac = Vector3d.subtractVectors(this._ta, this._tc);
        var cp = Vector3d.cross(ab, ac);
        cp.normalize();
        return cp.z >= 0;
    },

    draw: function (ctx, wvp) {
        if (ctx == null) {
            return;
        }
        wvp._transformTo(this.a.position, this._ta);
        wvp._transformTo(this.b.position, this._tb);
        wvp._transformTo(this.c.position, this._tc);
        if (this._checkBackface() === RenderTriangle.cullInside) {
            RenderTriangle.trianglesCulled++;
            return;
        }
        this._drawTriangle(ctx, this._texture, this._ta.x, this._ta.y, this._tb.x, this._tb.y, this._tc.x, this._tc.y, this.a.tu, this.a.tv, this.b.tu, this.b.tv, this.c.tu, this.c.tv);
    },

    _drawTriangle: function (ctx, im, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2) {
        if (!this.intersects(0, RenderTriangle.width, 0, RenderTriangle.height, x0, y0, x1, y1, x2, y2)) {
            return false;
        }
        RenderTriangle._miterPointOut(this._expandedS0, x0, y0, x1, y1, x2, y2, this.expansionInPixels);
        RenderTriangle._miterPointOut(this._expandedS1, x1, y1, x0, y0, x2, y2, this.expansionInPixels);
        RenderTriangle._miterPointOut(this._expandedS2, x2, y2, x1, y1, x0, y0, this.expansionInPixels);
        x0 = this._expandedS0.x;
        y0 = this._expandedS0.y;
        x1 = this._expandedS1.x;
        y1 = this._expandedS1.y;
        x2 = this._expandedS2.x;
        y2 = this._expandedS2.y;
        ctx.save();
        if (RenderTriangle.renderingOn) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.clip();
        }
        var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
        //if (denom == 0)
        //{
        //    ctx.Restore();
        //    return false;
        //}

        var m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
        var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
        var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
        var m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
        var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
        var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;
        ctx.transform(m11, m12, m21, m22, dx, dy);
        if (RenderTriangle.renderingOn) {
            ctx.globalAlpha = this.opacity;
            if (this.lighting < 1) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = 'Black';
                ctx.fillRect(0, 0, RenderTriangle.width, RenderTriangle.height);
                ctx.globalAlpha = this.lighting * this.opacity;
            }
            ctx.drawImage(im, 0, 0);
        }
        ctx.restore();
        return true;
    },

    intersects: function (l, r, t, b, x0, y0, x1, y1, x2, y2) {
        if (x0 > l && x0 < r && y0 > t && y0 < b) {
            return true;
        }
        if (x1 > l && x1 < r && y1 > t && y1 < b) {
            return true;
        }
        if (x2 > l && x2 < r && y2 > t && y2 < b) {
            return true;
        }
        var h4 = RenderTriangle.height * 4;
        if (this.tileLevel < 4 && ((Math.abs(x0 - x1) > h4) || (Math.abs(y0 - y1) > h4) || (Math.abs(x2 - x1) > h4) || (Math.abs(y2 - y1) > h4) || (Math.abs(x0 - x2) > h4) || (Math.abs(y0 - y2) > h4))) {
            return false;
        }
        return this.lineRectangleIntersect(l, r, t, b, x0, y0, x1, y1) || this.lineRectangleIntersect(l, r, t, b, x1, y1, x2, y2) || this.lineRectangleIntersect(l, r, t, b, x2, y2, x0, y0);
    },

    lineRectangleIntersect: function (l, r, t, b, x0, y0, x1, y1) {
        var top_intersection;
        var bottom_intersection;
        var toptrianglepoint;
        var bottomtrianglepoint;
        var m;
        var c;

        // Calculate m and c for the equation for the line (y = mx+c)
        m = (y1 - y0) / (x1 - x0);
        c = y0 - (m * x0);

        // if the line is going up from right to left then the top intersect point is on the left
        if (m > 0) {
            top_intersection = (m * l + c);
            bottom_intersection = (m * r + c);
        } else {
            // otherwise it's on the right
            top_intersection = (m * r + c);
            bottom_intersection = (m * l + c);
        }

        // work out the top and bottom extents for the triangle
        if (y0 < y1) {
            toptrianglepoint = y0;
            bottomtrianglepoint = y1;
        } else {
            toptrianglepoint = y1;
            bottomtrianglepoint = y0;
        }

        // and calculate the overlap between those two bounds
        var topoverlap;
        var botoverlap;
        topoverlap = (top_intersection > toptrianglepoint) ? top_intersection : toptrianglepoint;
        botoverlap = (bottom_intersection < bottomtrianglepoint) ? bottom_intersection : bottomtrianglepoint;

        // (topoverlap<botoverlap) :
        // if the intersection isn't the right way up then we have no overlap

        // (!((botoverlap<t) || (topoverlap>b)) :
        // If the bottom overlap is higher than the top of the rectangle or the top overlap is
        // lower than the bottom of the rectangle we don't have intersection. So return the negative
        // of that. Much faster than checking each of the points is within the bounds of the rectangle.
        return (topoverlap < botoverlap) && (!((botoverlap < t) || (topoverlap > b)));
    }
};

registerType("RenderTriangle", [RenderTriangle, RenderTriangle$, null]);
