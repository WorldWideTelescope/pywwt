// Originally `AAKEPLER.CPP`
// "Purpose: Implementation for the algorithms which solve Kepler's equation"
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
import { ss } from "../ss.js";
import { CT } from "./coordinate_transformation.js";


// CAAKepler

export function CAAKepler() { }

CAAKepler.calculate = function (M, e) {
    return CAAKepler.calculateIter(M, e, 53);
};

CAAKepler.calculateIter = function (M, e, nIterations) {
    M = CT.d2R(M);
    var PI = CT.PI();
    var F = 1;
    if (M < 0) {
        F = -1;
    }
    M = Math.abs(M) / (2 * PI);
    M = (M - ss.truncate(M)) * 2 * PI * F;
    if (M < 0) {
        M += 2 * PI;
    }
    F = 1;
    if (M > PI) {
        F = -1;
    }
    if (M > PI) {
        M = 2 * PI - M;
    }
    var E = PI / 2;
    var scale = PI / 4;
    for (var i = 0; i < nIterations; i++) {
        var R = E - e * Math.sin(E);
        if (M > R) {
            E += scale;
        }
        else {
            E -= scale;
        }
        scale /= 2;
    }
    return CT.r2D(E) * F;
};

var CAAKepler$ = {};

registerType("CAAKepler", [CAAKepler, CAAKepler$, null]);
