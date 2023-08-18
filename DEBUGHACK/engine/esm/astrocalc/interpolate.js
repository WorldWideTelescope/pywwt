// Originally `AAINTERPOLATE.CPP`
// "Purpose: Implementation for the algorithms for Interpolation"
// Last update of original: PJN / 29-12-2003
//
// Translated into C# and released by Microsoft, then transpiled into JavaScript
// by ScriptSharp, for the WorldWide Telescope project.
//
// The legal notices in the original code are as follows:
//
// Copyright (c) 2003 - 2007 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)
//
// All rights reserved.
//
// Copyright / Usage Details:
//
// You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise)
// when your product is released in binary form. You are allowed to modify the source code in any way you want
// except you cannot modify the copyright details at the top of each module. If you want to distribute source
// code with your application, then you are only allowed to distribute versions released by the author. This is
// to maintain a single distribution point for the source code.

import { registerType } from "../typesystem.js";


// INTP - was CAAInterpoate

export function INTP() { }

INTP.interpolate = function (n, Y1, Y2, Y3) {
    var a = Y2 - Y1;
    var b = Y3 - Y2;
    var c = Y1 + Y3 - 2 * Y2;
    return Y2 + n / 2 * (a + b + n * c);
};

INTP.interpolate2 = function (n, Y1, Y2, Y3, Y4, Y5) {
    var A = Y2 - Y1;
    var B = Y3 - Y2;
    var C = Y4 - Y3;
    var D = Y5 - Y4;
    var E = B - A;
    var F = C - B;
    var G = D - C;
    var H = F - E;
    var J = G - F;
    var K = J - H;
    var N2 = n * n;
    var N3 = N2 * n;
    var N4 = N3 * n;
    return Y3 + n * ((B + C) / 2 - (H + J) / 12) + N2 * (F / 2 - K / 24) + N3 * ((H + J) / 12) + N4 * (K / 24);
};

INTP.interpolateToHalves = function (Y1, Y2, Y3, Y4) {
    return (9 * (Y2 + Y3) - Y1 - Y4) / 16;
};

INTP.lagrangeInterpolate = function (X, n, pX, pY) {
    var V = 0;
    for (var i = 1; i <= n; i++) {
        var C = 1;
        for (var j = 1; j <= n; j++) {
            if (j !== i) {
                C = C * (X - pX[j - 1]) / (pX[i - 1] - pX[j - 1]);
            }
        }
        V += C * pY[i - 1];
    }
    return V;
};

INTP.zero = function (Y1, Y2, Y3) {
    var a = Y2 - Y1;
    var b = Y3 - Y2;
    var c = Y1 + Y3 - 2 * Y2;
    var bRecalc = true;
    var n0prev = 0;
    var n0 = n0prev;
    while (bRecalc) {
        n0 = -2 * Y2 / (a + b + c * n0prev);
        bRecalc = (Math.abs(n0 - n0prev) > 1E-12);
        if (bRecalc) {
            n0prev = n0;
        }
    }
    return n0;
};

INTP.zeroB = function (Y1, Y2, Y3, Y4, Y5) {
    var A = Y2 - Y1;
    var B = Y3 - Y2;
    var C = Y4 - Y3;
    var D = Y5 - Y4;
    var E = B - A;
    var F = C - B;
    var G = D - C;
    var H = F - E;
    var J = G - F;
    var K = J - H;
    var bRecalc = true;
    var n0prev = 0;
    var n0 = n0prev;
    while (bRecalc) {
        var n0prev2 = n0prev * n0prev;
        var n0prev3 = n0prev2 * n0prev;
        var n0prev4 = n0prev3 * n0prev;
        n0 = (-24 * Y3 + n0prev2 * (K - 12 * F) - 2 * n0prev3 * (H + J) - n0prev4 * K) / (2 * (6 * B + 6 * C - H - J));
        bRecalc = (Math.abs(n0 - n0prev) > 1E-12);
        if (bRecalc) {
            n0prev = n0;
        }
    }
    return n0;
};

INTP.zero2 = function (Y1, Y2, Y3) {
    var a = Y2 - Y1;
    var b = Y3 - Y2;
    var c = Y1 + Y3 - 2 * Y2;
    var bRecalc = true;
    var n0prev = 0;
    var n0 = n0prev;
    while (bRecalc) {
        var deltan0 = -(2 * Y2 + n0prev * (a + b + c * n0prev)) / (a + b + 2 * c * n0prev);
        n0 = n0prev + deltan0;
        bRecalc = (Math.abs(deltan0) > 1E-12);
        if (bRecalc) {
            n0prev = n0;
        }
    }
    return n0;
};

INTP.zero2B = function (Y1, Y2, Y3, Y4, Y5) {
    var A = Y2 - Y1;
    var B = Y3 - Y2;
    var C = Y4 - Y3;
    var D = Y5 - Y4;
    var E = B - A;
    var F = C - B;
    var G = D - C;
    var H = F - E;
    var J = G - F;
    var K = J - H;
    var M = K / 24;
    var N = (H + J) / 12;
    var P = F / 2 - M;
    var Q = (B + C) / 2 - N;
    var bRecalc = true;
    var n0prev = 0;
    var n0 = n0prev;
    while (bRecalc) {
        var n0prev2 = n0prev * n0prev;
        var n0prev3 = n0prev2 * n0prev;
        var n0prev4 = n0prev3 * n0prev;
        var deltan0 = -(M * n0prev4 + N * n0prev3 + P * n0prev2 + Q * n0prev + Y3) / (4 * M * n0prev3 + 3 * N * n0prev2 + 2 * P * n0prev + Q);
        n0 = n0prev + deltan0;
        bRecalc = (Math.abs(deltan0) > 1E-12);
        if (bRecalc) {
            n0prev = n0;
        }
    }
    return n0;
};

var INTP$ = {};

registerType("INTP", [INTP, INTP$, null]);
