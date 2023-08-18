// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tessellator algorithm.

import { registerType } from "../typesystem.js";
import { Vector3d } from "../double3d.js";


// wwtlib.Tessellator

export function Tessellator() { }

Tessellator.tesselateSimplePoly = function (inputList) {
    var results = [];
    var tess = new Tessellator();
    tess.process(inputList, results);
    return results;
};

var Tessellator$ = {
    _isLeftOfHalfSpace: function (pntA, pntB, pntTest) {
        pntA.normalize();
        pntB.normalize();
        var cross = Vector3d.cross(pntA, pntB);
        var dot = Vector3d.dot(cross, pntTest);
        return dot > 0;
    },

    _insideTriangle: function (pntA, pntB, pntC, pntTest) {
        if (!this._isLeftOfHalfSpace(pntA, pntB, pntTest)) {
            return false;
        }
        if (!this._isLeftOfHalfSpace(pntB, pntC, pntTest)) {
            return false;
        }
        if (!this._isLeftOfHalfSpace(pntC, pntA, pntTest)) {
            return false;
        }
        return true;
    },

    _canClipEar: function (poly, u, v, w, n, verts) {
        var p;
        var a = poly[verts[u]].copy();
        var b = poly[verts[v]].copy();
        var c = poly[verts[w]].copy();
        var P;
        var d = Vector3d.subtractVectors(b, a);
        d.normalize();
        var e = Vector3d.subtractVectors(b, c);
        e.normalize();
        var g = Vector3d.cross(d, e);
        var bn = b.copy();
        bn.normalize();

        // Determine if convex edge
        if (Vector3d.dot(g, bn) > 0) {
            return false;
        }

        // Check for any intersecting vertices that would invalidate this ear
        for (p = 0; p < n; p++) {
            if ((p === u) || (p === v) || (p === w)) {
                continue;
            }
            P = poly[verts[p]].copy();

            // don't clip earth if other intersecting vertex
            if (this._insideTriangle(a, b, c, P)) {
                return false;
            }
        }
        return true;
    },

    process: function (poly, result) {
        var n = poly.length;
        if (poly.length < 3) {
            return false;
        }
        var verts = new Array(poly.length);
        for (var i = 0; i < n; i++) {
            verts[i] = i;
        }
        var nv = n;
        var count = 2 * nv;
        for (var m = 0, v = nv - 1; nv > 2;) {
            if (0 >= (count--)) {
                // not enough ears to clip. Non-Simple Polygon
                return false;
            }
            var u = v;
            if (nv <= u) {
                u = 0;
            }
            v = u + 1;
            if (nv <= v) {
                v = 0;
            }
            var w = v + 1;
            if (nv <= w) {
                w = 0;
            }
            if (this._canClipEar(poly, u, v, w, nv, verts)) {
                var s, t;
                result.push(verts[u]);
                result.push(verts[v]);
                result.push(verts[w]);
                m++;

                // remove clipped ear
                for (s = v, t = v + 1; t < nv; s++, t++) {
                    verts[s] = verts[t];
                }
                nv--;
                count = 2 * nv;
            }
        }
        return true;
    }
};

registerType("Tessellator", [Tessellator, Tessellator$, null]);
