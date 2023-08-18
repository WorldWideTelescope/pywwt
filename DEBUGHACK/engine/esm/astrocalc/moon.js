// Originally `AAABERRATION.CPP`
// "Purpose: Implementation for the algorithms which obtain the position of the Moon"
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
import { CAAEarth } from "./earth.js";
import { CAANutation } from "./nutation.js";


// MoonCoefficient1

export function MoonCoefficient1(d, m, mdash, f) {
    this.d = 0;
    this.m = 0;
    this.mdash = 0;
    this.f = 0;
    this.d = d;
    this.m = m;
    this.mdash = mdash;
    this.f = f;
}

var MoonCoefficient1$ = {};

registerType("MoonCoefficient1", [MoonCoefficient1, MoonCoefficient1$, null]);


// MoonCoefficient2

export function MoonCoefficient2(a, b) {
    this.a = 0;
    this.b = 0;
    this.a = a;
    this.b = b;
}

var MoonCoefficient2$ = {};

registerType("MoonCoefficient2", [MoonCoefficient2, MoonCoefficient2$, null]);


// Constants

const g_MoonCoefficients1 = [new MoonCoefficient1(0, 0, 1, 0), new MoonCoefficient1(2, 0, -1, 0), new MoonCoefficient1(2, 0, 0, 0), new MoonCoefficient1(0, 0, 2, 0), new MoonCoefficient1(0, 1, 0, 0), new MoonCoefficient1(0, 0, 0, 2), new MoonCoefficient1(2, 0, -2, 0), new MoonCoefficient1(2, -1, -1, 0), new MoonCoefficient1(2, 0, 1, 0), new MoonCoefficient1(2, -1, 0, 0), new MoonCoefficient1(0, 1, -1, 0), new MoonCoefficient1(1, 0, 0, 0), new MoonCoefficient1(0, 1, 1, 0), new MoonCoefficient1(2, 0, 0, -2), new MoonCoefficient1(0, 0, 1, 2), new MoonCoefficient1(0, 0, 1, -2), new MoonCoefficient1(4, 0, -1, 0), new MoonCoefficient1(0, 0, 3, 0), new MoonCoefficient1(4, 0, -2, 0), new MoonCoefficient1(2, 1, -1, 0), new MoonCoefficient1(2, 1, 0, 0), new MoonCoefficient1(1, 0, -1, 0), new MoonCoefficient1(1, 1, 0, 0), new MoonCoefficient1(2, -1, 1, 0), new MoonCoefficient1(2, 0, 2, 0), new MoonCoefficient1(4, 0, 0, 0), new MoonCoefficient1(2, 0, -3, 0), new MoonCoefficient1(0, 1, -2, 0), new MoonCoefficient1(2, 0, -1, 2), new MoonCoefficient1(2, -1, -2, 0), new MoonCoefficient1(1, 0, 1, 0), new MoonCoefficient1(2, -2, 0, 0), new MoonCoefficient1(0, 1, 2, 0), new MoonCoefficient1(0, 2, 0, 0), new MoonCoefficient1(2, -2, -1, 0), new MoonCoefficient1(2, 0, 1, -2), new MoonCoefficient1(2, 0, 0, 2), new MoonCoefficient1(4, -1, -1, 0), new MoonCoefficient1(0, 0, 2, 2), new MoonCoefficient1(3, 0, -1, 0), new MoonCoefficient1(2, 1, 1, 0), new MoonCoefficient1(4, -1, -2, 0), new MoonCoefficient1(0, 2, -1, 0), new MoonCoefficient1(2, 2, -1, 0), new MoonCoefficient1(2, 1, -2, 0), new MoonCoefficient1(2, -1, 0, -2), new MoonCoefficient1(4, 0, 1, 0), new MoonCoefficient1(0, 0, 4, 0), new MoonCoefficient1(4, -1, 0, 0), new MoonCoefficient1(1, 0, -2, 0), new MoonCoefficient1(2, 1, 0, -2), new MoonCoefficient1(0, 0, 2, -2), new MoonCoefficient1(1, 1, 1, 0), new MoonCoefficient1(3, 0, -2, 0), new MoonCoefficient1(4, 0, -3, 0), new MoonCoefficient1(2, -1, 2, 0), new MoonCoefficient1(0, 2, 1, 0), new MoonCoefficient1(1, 1, -1, 0), new MoonCoefficient1(2, 0, 3, 0), new MoonCoefficient1(2, 0, -1, -2)];
const g_MoonCoefficients2 = [new MoonCoefficient2(6288774, -20905355), new MoonCoefficient2(1274027, -3699111), new MoonCoefficient2(658314, -2955968), new MoonCoefficient2(213618, -569925), new MoonCoefficient2(-185116, 48888), new MoonCoefficient2(-114332, -3149), new MoonCoefficient2(58793, 246158), new MoonCoefficient2(57066, -152138), new MoonCoefficient2(53322, -170733), new MoonCoefficient2(45758, -204586), new MoonCoefficient2(-40923, -129620), new MoonCoefficient2(-34720, 108743), new MoonCoefficient2(-30383, 104755), new MoonCoefficient2(15327, 10321), new MoonCoefficient2(-12528, 0), new MoonCoefficient2(10980, 79661), new MoonCoefficient2(10675, -34782), new MoonCoefficient2(10034, -23210), new MoonCoefficient2(8548, -21636), new MoonCoefficient2(-7888, 24208), new MoonCoefficient2(-6766, 30824), new MoonCoefficient2(-5163, -8379), new MoonCoefficient2(4987, -16675), new MoonCoefficient2(4036, -12831), new MoonCoefficient2(3994, -10445), new MoonCoefficient2(3861, -11650), new MoonCoefficient2(3665, 14403), new MoonCoefficient2(-2689, -7003), new MoonCoefficient2(-2602, 0), new MoonCoefficient2(2390, 10056), new MoonCoefficient2(-2348, 6322), new MoonCoefficient2(2236, -9884), new MoonCoefficient2(-2120, 5751), new MoonCoefficient2(-2069, 0), new MoonCoefficient2(2048, -4950), new MoonCoefficient2(-1773, 4130), new MoonCoefficient2(-1595, 0), new MoonCoefficient2(1215, -3958), new MoonCoefficient2(-1110, 0), new MoonCoefficient2(-892, 3258), new MoonCoefficient2(-810, 2616), new MoonCoefficient2(759, -1897), new MoonCoefficient2(-713, -2117), new MoonCoefficient2(-700, 2354), new MoonCoefficient2(691, 0), new MoonCoefficient2(596, 0), new MoonCoefficient2(549, -1423), new MoonCoefficient2(537, -1117), new MoonCoefficient2(520, -1571), new MoonCoefficient2(-487, -1739), new MoonCoefficient2(-399, 0), new MoonCoefficient2(-381, -4421), new MoonCoefficient2(351, 0), new MoonCoefficient2(-340, 0), new MoonCoefficient2(330, 0), new MoonCoefficient2(327, 0), new MoonCoefficient2(-323, 1165), new MoonCoefficient2(299, 0), new MoonCoefficient2(294, 0), new MoonCoefficient2(0, 8752)];
const g_MoonCoefficients3 = [new MoonCoefficient1(0, 0, 0, 1), new MoonCoefficient1(0, 0, 1, 1), new MoonCoefficient1(0, 0, 1, -1), new MoonCoefficient1(2, 0, 0, -1), new MoonCoefficient1(2, 0, -1, 1), new MoonCoefficient1(2, 0, -1, -1), new MoonCoefficient1(2, 0, 0, 1), new MoonCoefficient1(0, 0, 2, 1), new MoonCoefficient1(2, 0, 1, -1), new MoonCoefficient1(0, 0, 2, -1), new MoonCoefficient1(2, -1, 0, -1), new MoonCoefficient1(2, 0, -2, -1), new MoonCoefficient1(2, 0, 1, 1), new MoonCoefficient1(2, 1, 0, -1), new MoonCoefficient1(2, -1, -1, 1), new MoonCoefficient1(2, -1, 0, 1), new MoonCoefficient1(2, -1, -1, -1), new MoonCoefficient1(0, 1, -1, -1), new MoonCoefficient1(4, 0, -1, -1), new MoonCoefficient1(0, 1, 0, 1), new MoonCoefficient1(0, 0, 0, 3), new MoonCoefficient1(0, 1, -1, 1), new MoonCoefficient1(1, 0, 0, 1), new MoonCoefficient1(0, 1, 1, 1), new MoonCoefficient1(0, 1, 1, -1), new MoonCoefficient1(0, 1, 0, -1), new MoonCoefficient1(1, 0, 0, -1), new MoonCoefficient1(0, 0, 3, 1), new MoonCoefficient1(4, 0, 0, -1), new MoonCoefficient1(4, 0, -1, 1), new MoonCoefficient1(0, 0, 1, -3), new MoonCoefficient1(4, 0, -2, 1), new MoonCoefficient1(2, 0, 0, -3), new MoonCoefficient1(2, 0, 2, -1), new MoonCoefficient1(2, -1, 1, -1), new MoonCoefficient1(2, 0, -2, 1), new MoonCoefficient1(0, 0, 3, -1), new MoonCoefficient1(2, 0, 2, 1), new MoonCoefficient1(2, 0, -3, -1), new MoonCoefficient1(2, 1, -1, 1), new MoonCoefficient1(2, 1, 0, 1), new MoonCoefficient1(4, 0, 0, 1), new MoonCoefficient1(2, -1, 1, 1), new MoonCoefficient1(2, -2, 0, -1), new MoonCoefficient1(0, 0, 1, 3), new MoonCoefficient1(2, 1, 1, -1), new MoonCoefficient1(1, 1, 0, -1), new MoonCoefficient1(1, 1, 0, 1), new MoonCoefficient1(0, 1, -2, -1), new MoonCoefficient1(2, 1, -1, -1), new MoonCoefficient1(1, 0, 1, 1), new MoonCoefficient1(2, -1, -2, -1), new MoonCoefficient1(0, 1, 2, 1), new MoonCoefficient1(4, 0, -2, -1), new MoonCoefficient1(4, -1, -1, -1), new MoonCoefficient1(1, 0, 1, -1), new MoonCoefficient1(4, 0, 1, -1), new MoonCoefficient1(1, 0, -1, -1), new MoonCoefficient1(4, -1, 0, -1), new MoonCoefficient1(2, -2, 0, 1)];
const g_MoonCoefficients4 = [5128122, 280602, 277693, 173237, 55413, 46271, 32573, 17198, 9266, 8822, 8216, 4324, 4200, -3359, 2463, 2211, 2065, -1870, 1828, -1794, -1749, -1565, -1491, -1475, -1410, -1344, -1335, 1107, 1021, 833, 777, 671, 607, 596, 491, -451, 439, 422, 421, -366, -351, 331, 315, 302, -283, -229, 223, 223, -220, -220, -185, 181, -177, 176, 166, -164, 132, -119, 115, 107];


// CAAMoon

export function CAAMoon() { }

CAAMoon.meanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(218.3164477 + 481267.88123421 * T - 0.0015786 * Tsquared + Tcubed / 538841 - T4 / 65194000);
};

CAAMoon.meanElongation = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(297.8501921 + 445267.1114034 * T - 0.0018819 * Tsquared + Tcubed / 545868 - T4 / 113065000);
};

CAAMoon.meanAnomaly = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(134.9633964 + 477198.8675055 * T + 0.0087414 * Tsquared + Tcubed / 69699 - T4 / 14712000);
};

CAAMoon.argumentOfLatitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(93.272095 + 483202.0175233 * T - 0.0036539 * Tsquared - Tcubed / 3526000 + T4 / 863310000);
};

CAAMoon.meanLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(125.0445479 - 1934.1362891 * T + 0.0020754 * Tsquared + Tcubed / 467441 - T4 / 60616000);
};

CAAMoon.meanLongitudePerigee = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    return CT.m360(83.3532465 + 4069.0137287 * T - 0.01032 * Tsquared - Tcubed / 80053 + T4 / 18999000);
};

CAAMoon.trueLongitudeAscendingNode = function (JD) {
    var TrueAscendingNode = CAAMoon.meanLongitudeAscendingNode(JD);
    var D = CAAMoon.meanElongation(JD);
    D = CT.d2R(D);
    var M = CAAEarth.sunMeanAnomaly(JD);
    M = CT.d2R(M);
    var Mdash = CAAMoon.meanAnomaly(JD);
    Mdash = CT.d2R(Mdash);
    var F = CAAMoon.argumentOfLatitude(JD);
    F = CT.d2R(F);
    TrueAscendingNode -= 1.4979 * Math.sin(2 * (D - F));
    TrueAscendingNode -= 0.15 * Math.sin(M);
    TrueAscendingNode -= 0.1226 * Math.sin(2 * D);
    TrueAscendingNode += 0.1176 * Math.sin(2 * F);
    TrueAscendingNode -= 0.0801 * Math.sin(2 * (Mdash - F));
    return CT.m360(TrueAscendingNode);
};

CAAMoon.eclipticLongitude = function (JD) {
    var Ldash = CAAMoon.meanLongitude(JD);
    var LdashDegrees = Ldash;
    Ldash = CT.d2R(Ldash);
    var D = CAAMoon.meanElongation(JD);
    D = CT.d2R(D);
    var M = CAAEarth.sunMeanAnomaly(JD);
    M = CT.d2R(M);
    var Mdash = CAAMoon.meanAnomaly(JD);
    Mdash = CT.d2R(Mdash);
    var F = CAAMoon.argumentOfLatitude(JD);
    F = CT.d2R(F);
    var E = CAAEarth.eccentricity(JD);
    var T = (JD - 2451545) / 36525;
    var A1 = CT.m360(119.75 + 131.849 * T);
    A1 = CT.d2R(A1);
    var A2 = CT.m360(53.09 + 479264.29 * T);
    A2 = CT.d2R(A2);
    var A3 = CT.m360(313.45 + 481266.484 * T);
    A3 = CT.d2R(A3);
    var nLCoefficients = g_MoonCoefficients1.length;
    console.assert(g_MoonCoefficients2.length === nLCoefficients);
    var SigmaL = 0;
    for (var i = 0; i < nLCoefficients; i++) {
        var ThisSigma = g_MoonCoefficients2[i].a * Math.sin(g_MoonCoefficients1[i].d * D + g_MoonCoefficients1[i].m * M + g_MoonCoefficients1[i].mdash * Mdash + g_MoonCoefficients1[i].f * F);
        if (!!g_MoonCoefficients1[i].m) {
            ThisSigma *= E;
        }
        SigmaL += ThisSigma;
    }
    SigmaL += 3958 * Math.sin(A1);
    SigmaL += 1962 * Math.sin(Ldash - F);
    SigmaL += 318 * Math.sin(A2);
    var NutationInLong = CAANutation.nutationInLongitude(JD);
    return CT.m360(LdashDegrees + SigmaL / 1000000 + NutationInLong / 3600);
};

CAAMoon.eclipticLatitude = function (JD) {
    var Ldash = CAAMoon.meanLongitude(JD);
    Ldash = CT.d2R(Ldash);
    var D = CAAMoon.meanElongation(JD);
    D = CT.d2R(D);
    var M = CAAEarth.sunMeanAnomaly(JD);
    M = CT.d2R(M);
    var Mdash = CAAMoon.meanAnomaly(JD);
    Mdash = CT.d2R(Mdash);
    var F = CAAMoon.argumentOfLatitude(JD);
    F = CT.d2R(F);
    var E = CAAEarth.eccentricity(JD);
    var T = (JD - 2451545) / 36525;
    var A1 = CT.m360(119.75 + 131.849 * T);
    A1 = CT.d2R(A1);
    var A2 = CT.m360(53.09 + 479264.29 * T);
    A2 = CT.d2R(A2);
    var A3 = CT.m360(313.45 + 481266.484 * T);
    A3 = CT.d2R(A3);
    var nBCoefficients = g_MoonCoefficients3.length;
    console.assert(g_MoonCoefficients4.length === nBCoefficients);
    var SigmaB = 0;
    for (var i = 0; i < nBCoefficients; i++) {
        var ThisSigma = g_MoonCoefficients4[i] * Math.sin(g_MoonCoefficients3[i].d * D + g_MoonCoefficients3[i].m * M + g_MoonCoefficients3[i].mdash * Mdash + g_MoonCoefficients3[i].f * F);
        if (!!g_MoonCoefficients3[i].m) {
            ThisSigma *= E;
        }
        SigmaB += ThisSigma;
    }
    SigmaB -= 2235 * Math.sin(Ldash);
    SigmaB += 382 * Math.sin(A3);
    SigmaB += 175 * Math.sin(A1 - F);
    SigmaB += 175 * Math.sin(A1 + F);
    SigmaB += 127 * Math.sin(Ldash - Mdash);
    SigmaB -= 115 * Math.sin(Ldash + Mdash);
    return SigmaB / 1000000;
};

CAAMoon.radiusVector = function (JD) {
    var Ldash = CAAMoon.meanLongitude(JD);
    Ldash = CT.d2R(Ldash);
    var D = CAAMoon.meanElongation(JD);
    D = CT.d2R(D);
    var M = CAAEarth.sunMeanAnomaly(JD);
    M = CT.d2R(M);
    var Mdash = CAAMoon.meanAnomaly(JD);
    Mdash = CT.d2R(Mdash);
    var F = CAAMoon.argumentOfLatitude(JD);
    F = CT.d2R(F);
    var E = CAAEarth.eccentricity(JD);
    var T = (JD - 2451545) / 36525;
    var A1 = CT.m360(119.75 + 131.849 * T);
    A1 = CT.d2R(A1);
    var A2 = CT.m360(53.09 + 479264.29 * T);
    A2 = CT.d2R(A2);
    var A3 = CT.m360(313.45 + 481266.484 * T);
    A3 = CT.d2R(A3);
    var nRCoefficients = g_MoonCoefficients1.length;
    console.assert(g_MoonCoefficients2.length === nRCoefficients);
    var SigmaR = 0;
    for (var i = 0; i < nRCoefficients; i++) {
        var ThisSigma = g_MoonCoefficients2[i].b * Math.cos(g_MoonCoefficients1[i].d * D + g_MoonCoefficients1[i].m * M + g_MoonCoefficients1[i].mdash * Mdash + g_MoonCoefficients1[i].f * F);
        if (!!g_MoonCoefficients1[i].m) {
            ThisSigma *= E;
        }
        SigmaR += ThisSigma;
    }
    return 385000.56 + SigmaR / 1000;
};

CAAMoon.radiusVectorToHorizontalParallax = function (RadiusVector) {
    return CT.r2D(Math.asin(6378.14 / RadiusVector));
};

CAAMoon.horizontalParallaxToRadiusVector = function (Parallax) {
    return 6378.14 / Math.sin(CT.d2R(Parallax));
};

var CAAMoon$ = {};

registerType("CAAMoon", [CAAMoon, CAAMoon$, null]);
