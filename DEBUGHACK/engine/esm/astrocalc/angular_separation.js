// Originally `AAANGULARSEPARATION.CPP`
// "Purpose: Implementation for the algorithms which obtain various separation distances between celestial objects"
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
import { CT } from "./coordinate_transformation.js";


// ASEP - was CAAAngularSeparation

export function ASEP() { }

ASEP.separation = function (Alpha1, Delta1, Alpha2, Delta2) {
    Delta1 = CT.d2R(Delta1);
    Delta2 = CT.d2R(Delta2);
    Alpha1 = CT.h2R(Alpha1);
    Alpha2 = CT.h2R(Alpha2);
    var x = Math.cos(Delta1) * Math.sin(Delta2) - Math.sin(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var y = Math.cos(Delta2) * Math.sin(Alpha2 - Alpha1);
    var z = Math.sin(Delta1) * Math.sin(Delta2) + Math.cos(Delta1) * Math.cos(Delta2) * Math.cos(Alpha2 - Alpha1);
    var vvalue = Math.atan2(Math.sqrt(x * x + y * y), z);
    vvalue = CT.r2D(vvalue);
    if (vvalue < 0) {
        vvalue += 180;
    }
    return vvalue;
};

ASEP.positionAngle = function (alpha1, delta1, alpha2, delta2) {
    var Alpha1;
    var Delta1;
    var Alpha2;
    var Delta2;
    Delta1 = CT.d2R(delta1);
    Delta2 = CT.d2R(delta2);
    Alpha1 = CT.h2R(alpha1);
    Alpha2 = CT.h2R(alpha2);
    var DeltaAlpha = Alpha1 - Alpha2;
    var demoninator = Math.cos(Delta2) * Math.tan(Delta1) - Math.sin(Delta2) * Math.cos(DeltaAlpha);
    var numerator = Math.sin(DeltaAlpha);
    var vvalue = Math.atan2(numerator, demoninator);
    vvalue = CT.r2D(vvalue);
    return vvalue;
};

ASEP.distanceFromGreatArc = function (Alpha1, Delta1, Alpha2, Delta2, Alpha3, Delta3) {
    Delta1 = CT.d2R(Delta1);
    Delta2 = CT.d2R(Delta2);
    Delta3 = CT.d2R(Delta3);
    Alpha1 = CT.h2R(Alpha1);
    Alpha2 = CT.h2R(Alpha2);
    Alpha3 = CT.h2R(Alpha3);
    var X1 = Math.cos(Delta1) * Math.cos(Alpha1);
    var X2 = Math.cos(Delta2) * Math.cos(Alpha2);
    var Y1 = Math.cos(Delta1) * Math.sin(Alpha1);
    var Y2 = Math.cos(Delta2) * Math.sin(Alpha2);
    var Z1 = Math.sin(Delta1);
    var Z2 = Math.sin(Delta2);
    var A = Y1 * Z2 - Z1 * Y2;
    var B = Z1 * X2 - X1 * Z2;
    var C = X1 * Y2 - Y1 * X2;
    var m = Math.tan(Alpha3);
    var n = Math.tan(Delta3) / Math.cos(Alpha3);
    var vvalue = Math.asin((A + B * m + C * n) / (Math.sqrt(A * A + B * B + C * C) * Math.sqrt(1 + m * m + n * n)));
    vvalue = CT.r2D(vvalue);
    if (vvalue < 0) {
        vvalue = Math.abs(vvalue);
    }
    return vvalue;
};

var ASEP$ = {};

registerType("ASEP", [ASEP, ASEP$, null]);
