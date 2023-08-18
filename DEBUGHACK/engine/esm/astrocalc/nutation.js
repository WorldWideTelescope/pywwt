// Originally `AANUTATION.CPP`
// "Purpose: Implementation for the algorithms for Nutation"
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
import { C3D, CT } from "./coordinate_transformation.js";
import { CAAEarth } from "./earth.js";


// NUC - was NutationCoefficient

export function NUC(D, M, Mprime, F, omega, sincoeff1, sincoeff2, coscoeff1, coscoeff2) {
    this.d = 0;
    this.m = 0;
    this.mprime = 0;
    this.f = 0;
    this.omega = 0;
    this.sincoeff1 = 0;
    this.sincoeff2 = 0;
    this.coscoeff1 = 0;
    this.coscoeff2 = 0;
    this.d = D;
    this.m = M;
    this.mprime = Mprime;
    this.f = F;
    this.omega = omega;
    this.sincoeff1 = sincoeff1;
    this.sincoeff2 = sincoeff2;
    this.coscoeff1 = coscoeff1;
    this.coscoeff2 = coscoeff2;
}

var NUC$ = {};

registerType("NUC", [NUC, NUC$, null]);


// Coefficients

const g_NuC = [new NUC(0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9), new NUC(-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1), new NUC(0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5), new NUC(0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5), new NUC(0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1), new NUC(0, 0, 1, 0, 0, 712, 0.1, -7, 0), new NUC(-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6), new NUC(0, 0, 0, 2, 1, -386, -0.4, 200, 0), new NUC(0, 0, 1, 2, 2, -301, 0, 129, -0.1), new NUC(-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3), new NUC(-2, 0, 1, 0, 0, -158, 0, 0, 0), new NUC(-2, 0, 0, 2, 1, 129, 0.1, -70, 0), new NUC(0, 0, -1, 2, 2, 123, 0, -53, 0), new NUC(2, 0, 0, 0, 0, 63, 0, 0, 0), new NUC(0, 0, 1, 0, 1, 63, 0.1, -33, 0), new NUC(2, 0, -1, 2, 2, -59, 0, 26, 0), new NUC(0, 0, -1, 0, 1, -58, -0.1, 32, 0), new NUC(0, 0, 1, 2, 1, -51, 0, 27, 0), new NUC(-2, 0, 2, 0, 0, 48, 0, 0, 0), new NUC(0, 0, -2, 2, 1, 46, 0, -24, 0), new NUC(2, 0, 0, 2, 2, -38, 0, 16, 0), new NUC(0, 0, 2, 2, 2, -31, 0, 13, 0), new NUC(0, 0, 2, 0, 0, 29, 0, 0, 0), new NUC(-2, 0, 1, 2, 2, 29, 0, -12, 0), new NUC(0, 0, 0, 2, 0, 26, 0, 0, 0), new NUC(-2, 0, 0, 2, 0, -22, 0, 0, 0), new NUC(0, 0, -1, 2, 1, 21, 0, -10, 0), new NUC(0, 2, 0, 0, 0, 17, -0.1, 0, 0), new NUC(2, 0, -1, 0, 1, 16, 0, -8, 0), new NUC(-2, 2, 0, 2, 2, -16, 0.1, 7, 0), new NUC(0, 1, 0, 0, 1, -15, 0, 9, 0), new NUC(-2, 0, 1, 0, 1, -13, 0, 7, 0), new NUC(0, -1, 0, 0, 1, -12, 0, 6, 0), new NUC(0, 0, 2, -2, 0, 11, 0, 0, 0), new NUC(2, 0, -1, 2, 1, -10, 0, 5, 0), new NUC(2, 0, 1, 2, 2, -8, 0, 3, 0), new NUC(0, 1, 0, 2, 2, 7, 0, -3, 0), new NUC(-2, 1, 1, 0, 0, -7, 0, 0, 0), new NUC(0, -1, 0, 2, 2, -7, 0, 3, 0), new NUC(2, 0, 0, 2, 1, -7, 0, 3, 0), new NUC(2, 0, 1, 0, 0, 6, 0, 0, 0), new NUC(-2, 0, 2, 2, 2, 6, 0, -3, 0), new NUC(-2, 0, 1, 2, 1, 6, 0, -3, 0), new NUC(2, 0, -2, 0, 1, -6, 0, 3, 0), new NUC(2, 0, 0, 0, 1, -6, 0, 3, 0), new NUC(0, -1, 1, 0, 0, 5, 0, 0, 0), new NUC(-2, -1, 0, 2, 1, -5, 0, 3, 0), new NUC(-2, 0, 0, 0, 1, -5, 0, 3, 0), new NUC(0, 0, 2, 2, 1, -5, 0, 3, 0), new NUC(-2, 0, 2, 0, 1, 4, 0, 0, 0), new NUC(-2, 1, 0, 2, 1, 4, 0, 0, 0), new NUC(0, 0, 1, -2, 0, 4, 0, 0, 0), new NUC(-1, 0, 1, 0, 0, -4, 0, 0, 0), new NUC(-2, 1, 0, 0, 0, -4, 0, 0, 0), new NUC(1, 0, 0, 0, 0, -4, 0, 0, 0), new NUC(0, 0, 1, 2, 0, 3, 0, 0, 0), new NUC(0, 0, -2, 2, 2, -3, 0, 0, 0), new NUC(-1, -1, 1, 0, 0, -3, 0, 0, 0), new NUC(0, 1, 1, 0, 0, -3, 0, 0, 0), new NUC(0, -1, 1, 2, 2, -3, 0, 0, 0), new NUC(2, -1, -1, 2, 2, -3, 0, 0, 0), new NUC(0, 0, 3, 2, 2, -3, 0, 0, 0), new NUC(2, -1, 0, 2, 2, -3, 0, 0, 0)];


// CAANutation

export function CAANutation() { }

CAANutation.nutationInLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var D = 297.85036 + 445267.11148 * T - 0.0019142 * Tsquared + Tcubed / 189474;
    D = CT.m360(D);
    var M = 357.52772 + 35999.05034 * T - 0.0001603 * Tsquared - Tcubed / 300000;
    M = CT.m360(M);
    var Mprime = 134.96298 + 477198.867398 * T + 0.0086972 * Tsquared + Tcubed / 56250;
    Mprime = CT.m360(Mprime);
    var F = 93.27191 + 483202.017538 * T - 0.0036825 * Tsquared + Tcubed / 327270;
    F = CT.m360(F);
    var omega = 125.04452 - 1934.136261 * T + 0.0020708 * Tsquared + Tcubed / 450000;
    omega = CT.m360(omega);
    var nCoefficients = g_NuC.length;
    var vvalue = 0;
    for (var i = 0; i < nCoefficients; i++) {
        var argument = g_NuC[i].d * D + g_NuC[i].m * M + g_NuC[i].mprime * Mprime + g_NuC[i].f * F + g_NuC[i].omega * omega;
        var radargument = CT.d2R(argument);
        vvalue += (g_NuC[i].sincoeff1 + g_NuC[i].sincoeff2 * T) * Math.sin(radargument) * 0.0001;
    }
    return vvalue;
};

CAANutation.nutationInObliquity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var D = 297.85036 + 445267.11148 * T - 0.0019142 * Tsquared + Tcubed / 189474;
    D = CT.m360(D);
    var M = 357.52772 + 35999.05034 * T - 0.0001603 * Tsquared - Tcubed / 300000;
    M = CT.m360(M);
    var Mprime = 134.96298 + 477198.867398 * T + 0.0086972 * Tsquared + Tcubed / 56250;
    Mprime = CT.m360(Mprime);
    var F = 93.27191 + 483202.017538 * T - 0.0036825 * Tsquared + Tcubed / 327270;
    F = CT.m360(F);
    var omega = 125.04452 - 1934.136261 * T + 0.0020708 * Tsquared + Tcubed / 450000;
    omega = CT.m360(omega);
    var nCoefficients = g_NuC.length;
    var vvalue = 0;
    for (var i = 0; i < nCoefficients; i++) {
        var argument = g_NuC[i].d * D + g_NuC[i].m * M + g_NuC[i].mprime * Mprime + g_NuC[i].f * F + g_NuC[i].omega * omega;
        var radargument = CT.d2R(argument);
        vvalue += (g_NuC[i].coscoeff1 + g_NuC[i].coscoeff2 * T) * Math.cos(radargument) * 0.0001;
    }
    return vvalue;
};

CAANutation.nutationInRightAscension = function (Alpha, Delta, Obliquity, NutationInLongitude, NutationInObliquity) {
    Alpha = CT.h2R(Alpha);
    Delta = CT.d2R(Delta);
    Obliquity = CT.d2R(Obliquity);
    return (Math.cos(Obliquity) + Math.sin(Obliquity) * Math.sin(Alpha) * Math.tan(Delta)) * NutationInLongitude - Math.cos(Alpha) * Math.tan(Delta) * NutationInObliquity;
};

CAANutation.nutationInDeclination = function (Alpha, Delta, Obliquity, NutationInLongitude, NutationInObliquity) {
    Alpha = CT.h2R(Alpha);
    Delta = CT.d2R(Delta);
    Obliquity = CT.d2R(Obliquity);
    return Math.sin(Obliquity) * Math.cos(Alpha) * NutationInLongitude + Math.sin(Alpha) * NutationInObliquity;
};

CAANutation.meanObliquityOfEcliptic = function (JD) {
    var U = (JD - 2451545) / 3652500;
    var Usquared = U * U;
    var Ucubed = Usquared * U;
    var U4 = Ucubed * U;
    var U5 = U4 * U;
    var U6 = U5 * U;
    var U7 = U6 * U;
    var U8 = U7 * U;
    var U9 = U8 * U;
    var U10 = U9 * U;
    return CT.dmS2D(23, 26, 21.448) - CT.dmS2D(0, 0, 4680.93) * U - CT.dmS2D(0, 0, 1.55) * Usquared + CT.dmS2D(0, 0, 1999.25) * Ucubed - CT.dmS2D(0, 0, 51.38) * U4 - CT.dmS2D(0, 0, 249.67) * U5 - CT.dmS2D(0, 0, 39.05) * U6 + CT.dmS2D(0, 0, 7.12) * U7 + CT.dmS2D(0, 0, 27.87) * U8 + CT.dmS2D(0, 0, 5.79) * U9 + CT.dmS2D(0, 0, 2.45) * U10;
};

CAANutation.trueObliquityOfEcliptic = function (JD) {
    return CAANutation.meanObliquityOfEcliptic(JD) + CT.dmS2D(0, 0, CAANutation.nutationInObliquity(JD));
};

var CAANutation$ = {};

registerType("CAANutation", [CAANutation, CAANutation$, null]);
