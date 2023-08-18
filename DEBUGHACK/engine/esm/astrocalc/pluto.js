// Originally `AAPLUTO.CPP`
// "Purpose: Implementation for the algorithms which obtain the heliocentric position of Pluto"
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


// PlutoCoefficient1

export function PlutoCoefficient1(j, s, p) {
    this.j = 0;
    this.s = 0;
    this.p = 0;
    this.j = j;
    this.s = s;
    this.p = p;
}

var PlutoCoefficient1$ = {};

registerType("PlutoCoefficient1", [PlutoCoefficient1, PlutoCoefficient1$, null]);


// PlutoCoefficient2

export function PlutoCoefficient2(a, b) {
    this.a = 0;
    this.b = 0;
    this.a = a;
    this.b = b;
}

var PlutoCoefficient2$ = {};

registerType("PlutoCoefficient2", [PlutoCoefficient2, PlutoCoefficient2$, null]);


// Coefficients

const g_PlutoArgumentCoefficients = [new PlutoCoefficient1(0, 0, 1), new PlutoCoefficient1(0, 0, 2), new PlutoCoefficient1(0, 0, 3), new PlutoCoefficient1(0, 0, 4), new PlutoCoefficient1(0, 0, 5), new PlutoCoefficient1(0, 0, 6), new PlutoCoefficient1(0, 1, -1), new PlutoCoefficient1(0, 1, 0), new PlutoCoefficient1(0, 1, 1), new PlutoCoefficient1(0, 1, 2), new PlutoCoefficient1(0, 1, 3), new PlutoCoefficient1(0, 2, -2), new PlutoCoefficient1(0, 2, -1), new PlutoCoefficient1(0, 2, 0), new PlutoCoefficient1(1, -1, 0), new PlutoCoefficient1(1, -1, 1), new PlutoCoefficient1(1, 0, -3), new PlutoCoefficient1(1, 0, -2), new PlutoCoefficient1(1, 0, -1), new PlutoCoefficient1(1, 0, 0), new PlutoCoefficient1(1, 0, 1), new PlutoCoefficient1(1, 0, 2), new PlutoCoefficient1(1, 0, 3), new PlutoCoefficient1(1, 0, 4), new PlutoCoefficient1(1, 1, -3), new PlutoCoefficient1(1, 1, -2), new PlutoCoefficient1(1, 1, -1), new PlutoCoefficient1(1, 1, 0), new PlutoCoefficient1(1, 1, 1), new PlutoCoefficient1(1, 1, 3), new PlutoCoefficient1(2, 0, -6), new PlutoCoefficient1(2, 0, -5), new PlutoCoefficient1(2, 0, -4), new PlutoCoefficient1(2, 0, -3), new PlutoCoefficient1(2, 0, -2), new PlutoCoefficient1(2, 0, -1), new PlutoCoefficient1(2, 0, 0), new PlutoCoefficient1(2, 0, 1), new PlutoCoefficient1(2, 0, 2), new PlutoCoefficient1(2, 0, 3), new PlutoCoefficient1(3, 0, -2), new PlutoCoefficient1(3, 0, -1), new PlutoCoefficient1(3, 0, 0)];
const g_PlutoLongitudeCoefficients = [new PlutoCoefficient2(-19799805, 19850055), new PlutoCoefficient2(897144, -4954829), new PlutoCoefficient2(611149, 1211027), new PlutoCoefficient2(-341243, -189585), new PlutoCoefficient2(129287, -34992), new PlutoCoefficient2(-38164, 30893), new PlutoCoefficient2(20442, -9987), new PlutoCoefficient2(-4063, -5071), new PlutoCoefficient2(-6016, -3336), new PlutoCoefficient2(-3956, 3039), new PlutoCoefficient2(-667, 3572), new PlutoCoefficient2(1276, 501), new PlutoCoefficient2(1152, -917), new PlutoCoefficient2(630, -1277), new PlutoCoefficient2(2571, -459), new PlutoCoefficient2(899, -1449), new PlutoCoefficient2(-1016, 1043), new PlutoCoefficient2(-2343, -1012), new PlutoCoefficient2(7042, 788), new PlutoCoefficient2(1199, -338), new PlutoCoefficient2(418, -67), new PlutoCoefficient2(120, -274), new PlutoCoefficient2(-60, -159), new PlutoCoefficient2(-82, -29), new PlutoCoefficient2(-36, -29), new PlutoCoefficient2(-40, 7), new PlutoCoefficient2(-14, 22), new PlutoCoefficient2(4, 13), new PlutoCoefficient2(5, 2), new PlutoCoefficient2(-1, 0), new PlutoCoefficient2(2, 0), new PlutoCoefficient2(-4, 5), new PlutoCoefficient2(4, -7), new PlutoCoefficient2(14, 24), new PlutoCoefficient2(-49, -34), new PlutoCoefficient2(163, -48), new PlutoCoefficient2(9, -24), new PlutoCoefficient2(-4, 1), new PlutoCoefficient2(-3, 1), new PlutoCoefficient2(1, 3), new PlutoCoefficient2(-3, -1), new PlutoCoefficient2(5, -3), new PlutoCoefficient2(0, 0)];
const g_PlutoLatitudeCoefficients = [new PlutoCoefficient2(-5452852, -14974862), new PlutoCoefficient2(3527812, 1672790), new PlutoCoefficient2(-1050748, 327647), new PlutoCoefficient2(178690, -292153), new PlutoCoefficient2(18650, 100340), new PlutoCoefficient2(-30697, -25823), new PlutoCoefficient2(4878, 11248), new PlutoCoefficient2(226, -64), new PlutoCoefficient2(2030, -836), new PlutoCoefficient2(69, -604), new PlutoCoefficient2(-247, -567), new PlutoCoefficient2(-57, 1), new PlutoCoefficient2(-122, 175), new PlutoCoefficient2(-49, -164), new PlutoCoefficient2(-197, 199), new PlutoCoefficient2(-25, 217), new PlutoCoefficient2(589, -248), new PlutoCoefficient2(-269, 711), new PlutoCoefficient2(185, 193), new PlutoCoefficient2(315, 807), new PlutoCoefficient2(-130, -43), new PlutoCoefficient2(5, 3), new PlutoCoefficient2(2, 17), new PlutoCoefficient2(2, 5), new PlutoCoefficient2(2, 3), new PlutoCoefficient2(3, 1), new PlutoCoefficient2(2, -1), new PlutoCoefficient2(1, -1), new PlutoCoefficient2(0, -1), new PlutoCoefficient2(0, 0), new PlutoCoefficient2(0, -2), new PlutoCoefficient2(2, 2), new PlutoCoefficient2(-7, 0), new PlutoCoefficient2(10, -8), new PlutoCoefficient2(-3, 20), new PlutoCoefficient2(6, 5), new PlutoCoefficient2(14, 17), new PlutoCoefficient2(-2, 0), new PlutoCoefficient2(0, 0), new PlutoCoefficient2(0, 0), new PlutoCoefficient2(0, 1), new PlutoCoefficient2(0, 0), new PlutoCoefficient2(1, 0)];
const g_PlutoRadiusCoefficients = [new PlutoCoefficient2(66865439, 68951812), new PlutoCoefficient2(-11827535, -332538), new PlutoCoefficient2(1593179, -1438890), new PlutoCoefficient2(-18444, 483220), new PlutoCoefficient2(-65977, -85431), new PlutoCoefficient2(31174, -6032), new PlutoCoefficient2(-5794, 22161), new PlutoCoefficient2(4601, 4032), new PlutoCoefficient2(-1729, 234), new PlutoCoefficient2(-415, 702), new PlutoCoefficient2(239, 723), new PlutoCoefficient2(67, -67), new PlutoCoefficient2(1034, -451), new PlutoCoefficient2(-129, 504), new PlutoCoefficient2(480, -231), new PlutoCoefficient2(2, -441), new PlutoCoefficient2(-3359, 265), new PlutoCoefficient2(7856, -7832), new PlutoCoefficient2(36, 45763), new PlutoCoefficient2(8663, 8547), new PlutoCoefficient2(-809, -769), new PlutoCoefficient2(263, -144), new PlutoCoefficient2(-126, 32), new PlutoCoefficient2(-35, -16), new PlutoCoefficient2(-19, -4), new PlutoCoefficient2(-15, 8), new PlutoCoefficient2(-4, 12), new PlutoCoefficient2(5, 6), new PlutoCoefficient2(3, 1), new PlutoCoefficient2(6, -2), new PlutoCoefficient2(2, 2), new PlutoCoefficient2(-2, -2), new PlutoCoefficient2(14, 13), new PlutoCoefficient2(-63, 13), new PlutoCoefficient2(136, -236), new PlutoCoefficient2(273, 1065), new PlutoCoefficient2(251, 149), new PlutoCoefficient2(-25, -9), new PlutoCoefficient2(9, -2), new PlutoCoefficient2(-8, 7), new PlutoCoefficient2(2, -10), new PlutoCoefficient2(19, 35), new PlutoCoefficient2(10, 3)];


// CAAPluto

export function CAAPluto() { }

CAAPluto.eclipticLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var J = 34.35 + 3034.9057 * T;
    var S = 50.08 + 1222.1138 * T;
    var P = 238.96 + 144.96 * T;
    var L = 0;
    var nPlutoCoefficients = g_PlutoArgumentCoefficients.length;
    for (var i = 0; i < nPlutoCoefficients; i++) {
        var Alpha = g_PlutoArgumentCoefficients[i].j * J + g_PlutoArgumentCoefficients[i].s * S + g_PlutoArgumentCoefficients[i].p * P;
        Alpha = CT.d2R(Alpha);
        L += ((g_PlutoLongitudeCoefficients[i].a * Math.sin(Alpha)) + (g_PlutoLongitudeCoefficients[i].b * Math.cos(Alpha)));
    }
    L = L / 1000000;
    L += (238.958116 + 144.96 * T);
    L = CT.m360(L);
    return L;
};

CAAPluto.eclipticLatitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var J = 34.35 + 3034.9057 * T;
    var S = 50.08 + 1222.1138 * T;
    var P = 238.96 + 144.96 * T;
    var L = 0;
    var nPlutoCoefficients = g_PlutoArgumentCoefficients.length;
    for (var i = 0; i < nPlutoCoefficients; i++) {
        var Alpha = g_PlutoArgumentCoefficients[i].j * J + g_PlutoArgumentCoefficients[i].s * S + g_PlutoArgumentCoefficients[i].p * P;
        Alpha = CT.d2R(Alpha);
        L += ((g_PlutoLatitudeCoefficients[i].a * Math.sin(Alpha)) + (g_PlutoLatitudeCoefficients[i].b * Math.cos(Alpha)));
    }
    L = L / 1000000;
    L += -3.908239;
    return L;
};

CAAPluto.radiusVector = function (JD) {
    var T = (JD - 2451545) / 36525;
    var J = 34.35 + 3034.9057 * T;
    var S = 50.08 + 1222.1138 * T;
    var P = 238.96 + 144.96 * T;
    var R = 0;
    var nPlutoCoefficients = g_PlutoArgumentCoefficients.length;
    for (var i = 0; i < nPlutoCoefficients; i++) {
        var Alpha = g_PlutoArgumentCoefficients[i].j * J + g_PlutoArgumentCoefficients[i].s * S + g_PlutoArgumentCoefficients[i].p * P;
        Alpha = CT.d2R(Alpha);
        R += ((g_PlutoRadiusCoefficients[i].a * Math.sin(Alpha)) + (g_PlutoRadiusCoefficients[i].b * Math.cos(Alpha)));
    }
    R = R / 10000000;
    R += 40.7241346;
    return R;
};

var CAAPluto$ = {};

registerType("CAAPluto", [CAAPluto, CAAPluto$, null]);
