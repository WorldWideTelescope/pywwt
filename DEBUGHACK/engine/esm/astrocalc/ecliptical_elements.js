// Originally `AAECLIPTICALELEMENTS.CPP`
// "Purpose: Implementation for the algorithms which map the ecliptical elements from one equinox to another"
// Last update of original: PJN / 29-11-2006
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


// CAAEclipticalElementDetails

export function CAAEclipticalElementDetails() {
    this.i = 0;
    this.w = 0;
    this.omega = 0;
    this.i = 0;
    this.w = 0;
    this.omega = 0;
}

var CAAEclipticalElementDetails$ = {};

registerType("CAAEclipticalElementDetails", [CAAEclipticalElementDetails, CAAEclipticalElementDetails$, null]);


// CAAEclipticalElements

export function CAAEclipticalElements() { }

CAAEclipticalElements.calculate = function (i0, w0, omega0, JD0, JD) {
    var T = (JD0 - 2451545) / 36525;
    var Tsquared = T * T;
    var t = (JD - JD0) / 36525;
    var tsquared = t * t;
    var tcubed = tsquared * t;
    var i0rad = CT.d2R(i0);
    var omega0rad = CT.d2R(omega0);
    var eta = (47.0029 - 0.06603 * T + 0.000598 * Tsquared) * t + (-0.03302 + 0.000598 * T) * tsquared + 6E-05 * tcubed;
    eta = CT.d2R(CT.dmS2D(0, 0, eta));
    var pi = 174.876384 * 3600 + 3289.4789 * T + 0.60622 * Tsquared - (869.8089 + 0.50491 * T) * t + 0.03536 * tsquared;
    pi = CT.d2R(CT.dmS2D(0, 0, pi));
    var p = (5029.0966 + 2.22226 * T - 4.2E-05 * Tsquared) * t + (1.11113 - 4.2E-05 * T) * tsquared - 6E-06 * tcubed;
    p = CT.d2R(CT.dmS2D(0, 0, p));
    var sini0rad = Math.sin(i0rad);
    var cosi0rad = Math.cos(i0rad);
    var sinomega0rad_pi = Math.sin(omega0rad - pi);
    var cosomega0rad_pi = Math.cos(omega0rad - pi);
    var sineta = Math.sin(eta);
    var coseta = Math.cos(eta);
    var A = sini0rad * sinomega0rad_pi;
    var B = -sineta * cosi0rad + coseta * sini0rad * cosomega0rad_pi;
    var irad = Math.asin(Math.sqrt(A * A + B * B));
    var details = new CAAEclipticalElementDetails();
    details.i = CT.r2D(irad);
    var cosi = cosi0rad * coseta + sini0rad * sineta * cosomega0rad_pi;
    if (cosi < 0) {
        details.i = 180 - details.i;
    }
    var phi = pi + p;
    details.omega = CT.m360(CT.r2D(Math.atan2(A, B) + phi));
    A = -sineta * sinomega0rad_pi;
    B = sini0rad * coseta - cosi0rad * sineta * cosomega0rad_pi;
    var deltaw = CT.r2D(Math.atan2(A, B));
    details.w = CT.m360(w0 + deltaw);
    return details;
};

CAAEclipticalElements.fK4B1950ToFK5J2000 = function (i0, w0, omega0) {
    var L = CT.d2R(5.19856209);
    var J = CT.d2R(0.00651966);
    var i0rad = CT.d2R(i0);
    var omega0rad = CT.d2R(omega0);
    var sini0rad = Math.sin(i0rad);
    var cosi0rad = Math.cos(i0rad);
    var cosJ = Math.cos(J);
    var sinJ = Math.sin(J);
    var W = L + omega0rad;
    var cosW = Math.cos(W);
    var sinW = Math.sin(W);
    var A = sinJ * sinW;
    var B = sini0rad * cosJ + cosi0rad * sinJ * cosW;
    var details = new CAAEclipticalElementDetails();
    details.i = CT.r2D(Math.asin(Math.sqrt(A * A + B * B)));
    var cosi = cosi0rad * cosJ - sini0rad * sinJ * cosW;
    if (cosi < 0) {
        details.i = 180 - details.i;
    }
    details.w = CT.m360(w0 + CT.r2D(Math.atan2(A, B)));
    details.omega = CT.m360(CT.r2D(Math.atan2(sini0rad * sinW, cosi0rad * sinJ + sini0rad * cosJ * cosW)) - 4.50001688);
    return details;
};

var CAAEclipticalElements$ = {};

registerType("CAAEclipticalElements", [CAAEclipticalElements, CAAEclipticalElements$, null]);
