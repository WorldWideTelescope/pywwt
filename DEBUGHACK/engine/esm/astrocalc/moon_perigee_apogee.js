// Originally `AAMOONPERIGEEAPOGEE.CPP`
// "Purpose: Implementation for the algorithms which obtain the dates of Lunar Apogee and Perigee"
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


// MPAC - was MoonPerigeeApogeeCoefficient

export function MPAC(D, M, F, C, T) {
    this.d = 0;
    this.m = 0;
    this.f = 0;
    this.c = 0;
    this.t = 0;
    this.d = D;
    this.m = M;
    this.f = F;
    this.c = C;
    this.t = T;
}

var MPAC$ = {};

registerType("MPAC", [MPAC, MPAC$, null]);


// Constants

const g_MoonPerigeeApogeeCoefficients1 = [new MPAC(2, 0, 0, -1.6769, 0), new MPAC(4, 0, 0, 0.4589, 0), new MPAC(6, 0, 0, -0.1856, 0), new MPAC(8, 0, 0, 0.0883, 0), new MPAC(2, -1, 0, -0.0773, 0.00019), new MPAC(0, 1, 0, 0.0502, -0.00013), new MPAC(10, 0, 0, -0.046, 0), new MPAC(4, -1, 0, 0.0422, -0.00011), new MPAC(6, -1, 0, -0.0256, 0), new MPAC(12, 0, 0, 0.0253, 0), new MPAC(1, 0, 0, 0.0237, 0), new MPAC(8, -1, 0, 0.0162, 0), new MPAC(14, 0, 0, -0.0145, 0), new MPAC(0, 0, 2, 0.0129, 0), new MPAC(3, 0, 0, -0.0112, 0), new MPAC(10, -1, 0, -0.0104, 0), new MPAC(16, 0, 0, 0.0086, 0), new MPAC(12, -1, 0, 0.0069, 0), new MPAC(5, 0, 0, 0.0066, 0), new MPAC(2, 0, 2, -0.0053, 0), new MPAC(18, 0, 0, -0.0052, 0), new MPAC(14, -1, 0, -0.0046, 0), new MPAC(7, 0, 0, -0.0041, 0), new MPAC(2, 1, 0, 0.004, 0), new MPAC(20, 0, 0, 0.0032, 0), new MPAC(1, 1, 0, -0.0032, 0), new MPAC(16, -1, 0, 0.0031, 0), new MPAC(4, 1, 0, -0.0029, 0), new MPAC(9, 0, 0, 0.0027, 0), new MPAC(4, 0, 2, 0.0027, 0), new MPAC(2, -2, 0, -0.0027, 0), new MPAC(4, -2, 0, 0.0024, 0), new MPAC(6, -2, 0, -0.0021, 0), new MPAC(22, 0, 0, -0.0021, 0), new MPAC(18, -1, 0, -0.0021, 0), new MPAC(6, 1, 0, 0.0019, 0), new MPAC(11, 0, 0, -0.0018, 0), new MPAC(8, 1, 0, -0.0014, 0), new MPAC(4, 0, -2, -0.0014, 0), new MPAC(6, 0, 2, -0.0014, 0), new MPAC(3, 1, 0, 0.0014, 0), new MPAC(5, 1, 0, -0.0014, 0), new MPAC(13, 0, 0, 0.0013, 0), new MPAC(20, -1, 0, 0.0013, 0), new MPAC(3, 2, 0, 0.0011, 0), new MPAC(4, -2, 2, -0.0011, 0), new MPAC(1, 2, 0, -0.0011, 0), new MPAC(22, -1, 0, -0.0009, 0), new MPAC(0, 0, 4, -0.0008, 0), new MPAC(6, 0, -2, 0.0008, 0), new MPAC(2, 1, -2, 0.0008, 0), new MPAC(0, 2, 0, 0.0007, 0), new MPAC(0, -1, 2, 0.0007, 0), new MPAC(2, 0, 4, 0.0007, 0), new MPAC(0, -2, 2, -0.0006, 0), new MPAC(2, 2, -2, -0.0006, 0), new MPAC(24, 0, 0, 0.0006, 0), new MPAC(4, 0, -4, 0.0005, 0), new MPAC(2, 2, 0, 0.0005, 0), new MPAC(1, -1, 0, -0.0004, 0)];
const g_MoonPerigeeApogeeCoefficients2 = [new MPAC(2, 0, 0, 0.4392, 0), new MPAC(4, 0, 0, 0.0684, 0), new MPAC(0, 1, 0, 0.0456, -0.00011), new MPAC(2, -1, 0, 0.0426, -0.00011), new MPAC(0, 0, 2, 0.0212, 0), new MPAC(1, 0, 0, -0.0189, 0), new MPAC(6, 0, 0, 0.0144, 0), new MPAC(4, -1, 0, 0.0113, 0), new MPAC(2, 0, 2, 0.0047, 0), new MPAC(1, 1, 0, 0.0036, 0), new MPAC(8, 0, 0, 0.0035, 0), new MPAC(6, -1, 0, 0.0034, 0), new MPAC(2, 0, -2, -0.0034, 0), new MPAC(2, -2, 0, 0.0022, 0), new MPAC(3, 0, 0, -0.0017, 0), new MPAC(4, 0, 2, 0.0013, 0), new MPAC(8, -1, 0, 0.0011, 0), new MPAC(4, -2, 0, 0.001, 0), new MPAC(10, 0, 0, 0.0009, 0), new MPAC(3, 1, 0, 0.0007, 0), new MPAC(0, 2, 0, 0.0006, 0), new MPAC(2, 1, 0, 0.0005, 0), new MPAC(2, 2, 0, 0.0005, 0), new MPAC(6, 0, 2, 0.0004, 0), new MPAC(6, -2, 0, 0.0004, 0), new MPAC(10, -1, 0, 0.0004, 0), new MPAC(5, 0, 0, -0.0004, 0), new MPAC(4, 0, -2, -0.0004, 0), new MPAC(0, 1, 2, 0.0003, 0), new MPAC(12, 0, 0, 0.0003, 0), new MPAC(2, -1, 2, 0.0003, 0), new MPAC(1, -1, 0, -0.0003, 0)];
const g_MoonPerigeeApogeeCoefficients3 = [new MPAC(2, 0, 0, 63.224, 0), new MPAC(4, 0, 0, -6.99, 0), new MPAC(2, -1, 0, 2.834, 0), new MPAC(2, -1, 0, 0, -0.0071), new MPAC(6, 0, 0, 1.927, 0), new MPAC(1, 0, 0, -1.263, 0), new MPAC(8, 0, 0, -0.702, 0), new MPAC(0, 1, 0, 0.696, 0), new MPAC(0, 1, 0, 0, -0.0017), new MPAC(0, 0, 2, -0.69, 0), new MPAC(4, -1, 0, -0.629, 0), new MPAC(4, -1, 0, 0, 0.0016), new MPAC(2, 0, -2, -0.392, 0), new MPAC(10, 0, 0, 0.297, 0), new MPAC(6, -1, 0, 0.26, 0), new MPAC(3, 0, 0, 0.201, 0), new MPAC(2, 1, 0, -0.161, 0), new MPAC(1, 1, 0, 0.157, 0), new MPAC(12, 0, 0, -0.138, 0), new MPAC(8, -1, 0, -0.127, 0), new MPAC(2, 0, 2, 0.104, 0), new MPAC(2, -2, 0, 0.104, 0), new MPAC(5, 0, 0, -0.079, 0), new MPAC(14, 0, 0, 0.068, 0), new MPAC(10, -1, 0, 0.067, 0), new MPAC(4, 1, 0, 0.054, 0), new MPAC(12, -1, 0, -0.038, 0), new MPAC(4, -2, 0, -0.038, 0), new MPAC(7, 0, 0, 0.037, 0), new MPAC(4, 0, 2, -0.037, 0), new MPAC(16, 0, 0, -0.035, 0), new MPAC(3, 1, 0, -0.03, 0), new MPAC(1, -1, 0, 0.029, 0), new MPAC(6, 1, 0, -0.025, 0), new MPAC(0, 2, 0, 0.023, 0), new MPAC(14, -1, 0, 0.023, 0), new MPAC(2, 2, 0, -0.023, 0), new MPAC(6, -2, 0, 0.022, 0), new MPAC(2, -1, -2, -0.021, 0), new MPAC(9, 0, 0, -0.02, 0), new MPAC(18, 0, 0, 0.019, 0), new MPAC(6, 0, 2, 0.017, 0), new MPAC(0, -1, 2, 0.014, 0), new MPAC(16, -1, 0, -0.014, 0), new MPAC(4, 0, -20, 0.013, 0), new MPAC(8, 1, 0, 0.012, 0), new MPAC(11, 0, 0, 0.011, 0), new MPAC(5, 1, 0, 0.01, 0), new MPAC(20, 0, 0, -0.01, 0)];
const g_MoonPerigeeApogeeCoefficients4 = [new MPAC(2, 0, 0, -9.147, 0), new MPAC(1, 0, 0, -0.841, 0), new MPAC(0, 0, 2, 0.697, 0), new MPAC(0, 1, 0, -0.656, 0.0016), new MPAC(4, 0, 0, 0.355, 0), new MPAC(2, -1, 0, 0.159, 0), new MPAC(1, 1, 0, 0.127, 0), new MPAC(4, -1, 0, 0.065, 0), new MPAC(6, 0, 0, 0.052, 0), new MPAC(2, 1, 0, 0.043, 0), new MPAC(2, 0, 2, 0.031, 0), new MPAC(2, 0, -2, -0.023, 0), new MPAC(2, -2, 0, 0.022, 0), new MPAC(2, 2, 0, 0.019, 0), new MPAC(0, 2, 0, -0.016, 0), new MPAC(6, -1, 0, 0.014, 0), new MPAC(8, 0, 0, 0.01, 0)];


// CAAMoonPerigeeApogee

export function CAAMoonPerigeeApogee() { }

CAAMoonPerigeeApogee.k = function (Year) {
    return 13.2555 * (Year - 1999.97);
};

CAAMoonPerigeeApogee.meanPerigee = function (k) {
    var T = k / 1325.55;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return 2451534.6698 + 27.55454989 * k - 0.0006691 * Tsquared - 1.098E-06 * Tcubed + 5.2E-09 * T4;
};

CAAMoonPerigeeApogee.meanApogee = function (k) {
    return CAAMoonPerigeeApogee.meanPerigee(k);
};

CAAMoonPerigeeApogee.truePerigee = function (k) {
    var MeanJD = CAAMoonPerigeeApogee.meanPerigee(k);
    var T = k / 1325.55;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    var D = CT.m360(171.9179 + 335.9106046 * k - 0.0100383 * Tsquared - 1.156E-05 * Tcubed + 5.5E-08 * T4);
    D = CT.d2R(D);
    var M = CT.m360(347.3477 + 27.1577721 * k - 0.000813 * Tsquared - 1E-06 * Tcubed);
    M = CT.d2R(M);
    var F = CT.m360(316.6109 + 364.5287911 * k - 0.0125053 * Tsquared - 1.48E-05 * Tcubed);
    F = CT.d2R(F);
    var nPerigeeCoefficients = g_MoonPerigeeApogeeCoefficients1.length;
    var Sigma = 0;
    for (var i = 0; i < nPerigeeCoefficients; i++) {
        Sigma += g_MoonPerigeeApogeeCoefficients1[i].c * Math.sin(D * g_MoonPerigeeApogeeCoefficients1[i].d + M * g_MoonPerigeeApogeeCoefficients1[i].m + F * g_MoonPerigeeApogeeCoefficients1[i].f + T * g_MoonPerigeeApogeeCoefficients1[i].t);
    }
    return MeanJD + Sigma;
};

CAAMoonPerigeeApogee.trueApogee = function (k) {
    var MeanJD = CAAMoonPerigeeApogee.meanApogee(k);
    var T = k / 1325.55;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    var D = CT.m360(171.9179 + 335.9106046 * k - 0.0100383 * Tsquared - 1.156E-05 * Tcubed + 5.5E-08 * T4);
    D = CT.d2R(D);
    var M = CT.m360(347.3477 + 27.1577721 * k - 0.000813 * Tsquared - 1E-06 * Tcubed);
    M = CT.d2R(M);
    var F = CT.m360(316.6109 + 364.5287911 * k - 0.0125053 * Tsquared - 1.48E-05 * Tcubed);
    F = CT.d2R(F);
    var nApogeeCoefficients = g_MoonPerigeeApogeeCoefficients2.length;
    var Sigma = 0;
    for (var i = 0; i < nApogeeCoefficients; i++) {
        Sigma += (g_MoonPerigeeApogeeCoefficients2[i].c + T * g_MoonPerigeeApogeeCoefficients2[i].t) * Math.sin(D * g_MoonPerigeeApogeeCoefficients2[i].d + M * g_MoonPerigeeApogeeCoefficients2[i].m + F * g_MoonPerigeeApogeeCoefficients2[i].f);
    }
    return MeanJD + Sigma;
};

CAAMoonPerigeeApogee.perigeeParallax = function (k) {
    var T = k / 1325.55;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    var D = CT.m360(171.9179 + 335.9106046 * k - 0.0100383 * Tsquared - 1.156E-05 * Tcubed + 5.5E-08 * T4);
    D = CT.d2R(D);
    var M = CT.m360(347.3477 + 27.1577721 * k - 0.000813 * Tsquared - 1E-06 * Tcubed);
    M = CT.d2R(M);
    var F = CT.m360(316.6109 + 364.5287911 * k - 0.0125053 * Tsquared - 1.48E-05 * Tcubed);
    F = CT.d2R(F);
    var nPerigeeCoefficients = g_MoonPerigeeApogeeCoefficients3.length;
    var Parallax = 3629.215;
    for (var i = 0; i < nPerigeeCoefficients; i++) {
        Parallax += (g_MoonPerigeeApogeeCoefficients3[i].c + T * g_MoonPerigeeApogeeCoefficients3[i].t) * Math.cos(D * g_MoonPerigeeApogeeCoefficients3[i].d + M * g_MoonPerigeeApogeeCoefficients3[i].m + F * g_MoonPerigeeApogeeCoefficients3[i].f);
    }
    return Parallax / 3600;
};

CAAMoonPerigeeApogee.apogeeParallax = function (k) {
    var T = k / 1325.55;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    var D = CT.m360(171.9179 + 335.9106046 * k - 0.0100383 * Tsquared - 1.156E-05 * Tcubed + 5.5E-08 * T4);
    D = CT.d2R(D);
    var M = CT.m360(347.3477 + 27.1577721 * k - 0.000813 * Tsquared - 1E-06 * Tcubed);
    M = CT.d2R(M);
    var F = CT.m360(316.6109 + 364.5287911 * k - 0.0125053 * Tsquared - 1.48E-05 * Tcubed);
    F = CT.d2R(F);
    var nApogeeCoefficients = g_MoonPerigeeApogeeCoefficients4.length;
    var Parallax = 3245.251;
    for (var i = 0; i < nApogeeCoefficients; i++) {
        Parallax += (g_MoonPerigeeApogeeCoefficients4[i].c + T * g_MoonPerigeeApogeeCoefficients4[i].t) * Math.cos(D * g_MoonPerigeeApogeeCoefficients4[i].d + M * g_MoonPerigeeApogeeCoefficients4[i].m + F * g_MoonPerigeeApogeeCoefficients4[i].f);
    }
    return Parallax / 3600;
};

var CAAMoonPerigeeApogee$ = {};

registerType("CAAMoonPerigeeApogee", [CAAMoonPerigeeApogee, CAAMoonPerigeeApogee$, null]);
