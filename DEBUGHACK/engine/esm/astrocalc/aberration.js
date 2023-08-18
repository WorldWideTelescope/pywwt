// Originally `AAABERRATION.CPP`
// "Purpose: Implementation for the algorithms for Aberration"
// Last update of original: PJN / 21-04-2005
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
import { C3D, COR, CT } from "./coordinate_transformation.js";
import { CAASun } from "./sun.js";


// ACFT

export function ACFT(L2, L3, L4, L5, L6, L7, L8, Ldash, D, Mdash, F, xsin, xsint, xcos, xcost, ysin, ysint, ycos, ycost, zsin, zsint, zcos, zcost) {
    this.l2 = 0;
    this.l3 = 0;
    this.l4 = 0;
    this.l5 = 0;
    this.l6 = 0;
    this.l7 = 0;
    this.l8 = 0;
    this.ldash = 0;
    this.d = 0;
    this.mdash = 0;
    this.f = 0;
    this.xsin = 0;
    this.xsint = 0;
    this.xcos = 0;
    this.xcost = 0;
    this.ysin = 0;
    this.ysint = 0;
    this.ycos = 0;
    this.ycost = 0;
    this.zsin = 0;
    this.zsint = 0;
    this.zcos = 0;
    this.zcost = 0;
    this.l2 = L2;
    this.l3 = L3;
    this.l4 = L4;
    this.l5 = L5;
    this.l6 = L6;
    this.l7 = L7;
    this.l8 = L8;
    this.ldash = Ldash;
    this.d = D;
    this.mdash = Mdash;
    this.f = F;
    this.xsin = xsin;
    this.xsint = xsint;
    this.xcos = xcos;
    this.xcost = xcost;
    this.ysin = ysin;
    this.ysint = ysint;
    this.ycos = ycos;
    this.ycost = ycost;
    this.zsin = zsin;
    this.zsint = zsint;
    this.zcos = zcos;
    this.zcost = zcost;
}

var ACFT$ = {};

registerType("ACFT", [ACFT, ACFT$, null]);


// Coefficients

const g_ACft = [new ACFT(0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1719914, -2, -25, 0, 25, -13, 1578089, 156, 10, 32, 684185, -358), new ACFT(0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6434, 141, 28007, -107, 25697, -95, -5904, -130, 11141, -48, -2559, -55), new ACFT(0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 715, 0, 0, 0, 6, 0, -657, 0, -15, 0, -282, 0), new ACFT(0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 715, 0, 0, 0, 0, 0, -656, 0, 0, 0, -285, 0), new ACFT(0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 486, -5, -236, -4, -216, -4, -446, 5, -94, 0, -193, 0), new ACFT(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 159, 0, 0, 0, 2, 0, -147, 0, -6, 0, -61, 0), new ACFT(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, -59, 0), new ACFT(0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 39, 0, 0, 0, 0, 0, -36, 0, 0, 0, -16, 0), new ACFT(0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 33, 0, -10, 0, -9, 0, -30, 0, -5, 0, -13, 0), new ACFT(0, 2, 0, -1, 0, 0, 0, 0, 0, 0, 0, 31, 0, 1, 0, 1, 0, -28, 0, 0, 0, -12, 0), new ACFT(0, 3, -8, 3, 0, 0, 0, 0, 0, 0, 0, 8, 0, -28, 0, 25, 0, 8, 0, 11, 0, 3, 0), new ACFT(0, 5, -8, 3, 0, 0, 0, 0, 0, 0, 0, 8, 0, -28, 0, -25, 0, -8, 0, -11, 0, -3, 0), new ACFT(2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, -19, 0, 0, 0, -8, 0), new ACFT(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -19, 0, 0, 0, 0, 0, 17, 0, 0, 0, 8, 0), new ACFT(0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 17, 0, 0, 0, 0, 0, -16, 0, 0, 0, -7, 0), new ACFT(0, 1, 0, -2, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 1, 0, 7, 0), new ACFT(0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 16, 0, 0, 0, 1, 0, -15, 0, -3, 0, -6, 0), new ACFT(0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 11, 0, -1, 0, -1, 0, -10, 0, -1, 0, -5, 0), new ACFT(2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -11, 0, -10, 0, 0, 0, -4, 0, 0, 0), new ACFT(0, 1, 0, -1, 0, 0, 0, 0, 0, 0, 0, -11, 0, -2, 0, -2, 0, 9, 0, -1, 0, 4, 0), new ACFT(0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, -7, 0, -8, 0, -8, 0, 6, 0, -3, 0, 3, 0), new ACFT(0, 3, 0, -2, 0, 0, 0, 0, 0, 0, 0, -10, 0, 0, 0, 0, 0, 9, 0, 0, 0, 4, 0), new ACFT(1, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, -9, 0, 0, 0, 0, 0, -9, 0, 0, 0, -4, 0), new ACFT(2, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, -9, 0, 0, 0, 0, 0, -8, 0, 0, 0, -4, 0), new ACFT(0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, -9, 0, -8, 0, 0, 0, -3, 0, 0, 0), new ACFT(2, -4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -9, 0, 8, 0, 0, 0, 3, 0, 0, 0), new ACFT(0, 3, -2, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, -8, 0, 0, 0, -3, 0), new ACFT(0, 0, 0, 0, 0, 0, 0, 1, 2, -1, 0, 8, 0, 0, 0, 0, 0, -7, 0, 0, 0, -3, 0), new ACFT(8, -12, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 0, -7, 0, -6, 0, 4, 0, -3, 0, 2, 0), new ACFT(8, -14, 0, 0, 0, 0, 0, 0, 0, 0, 0, -4, 0, -7, 0, 6, 0, -4, 0, 3, 0, -2, 0), new ACFT(0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, -6, 0, -5, 0, -4, 0, 5, 0, -2, 0, 2, 0), new ACFT(3, -4, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, -1, 0, -2, 0, -7, 0, 1, 0, -4, 0), new ACFT(0, 2, 0, -2, 0, 0, 0, 0, 0, 0, 0, 4, 0, -6, 0, -5, 0, -4, 0, -2, 0, -2, 0), new ACFT(3, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -7, 0, -6, 0, 0, 0, -3, 0, 0, 0), new ACFT(0, 2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, -5, 0, -4, 0, -5, 0, -2, 0, -2, 0), new ACFT(0, 0, 0, 0, 0, 0, 0, 1, -2, 0, 0, 5, 0, 0, 0, 0, 0, -5, 0, 0, 0, -2, 0)];


// ABR - was CAAAberration

export function ABR() { }

ABR.earthVelocity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var L2 = 3.1761467 + 1021.3285546 * T;
    var L3 = 1.7534703 + 628.3075849 * T;
    var L4 = 6.2034809 + 334.0612431 * T;
    var L5 = 0.5995465 + 52.9690965 * T;
    var L6 = 0.8740168 + 21.3299095 * T;
    var L7 = 5.4812939 + 7.4781599 * T;
    var L8 = 5.3118863 + 3.8133036 * T;
    var Ldash = 3.8103444 + 8399.6847337 * T;
    var D = 5.1984667 + 7771.3771486 * T;
    var Mdash = 2.3555559 + 8328.6914289 * T;
    var F = 1.6279052 + 8433.4661601 * T;
    var velocity = new C3D();
    var nAberrationCoefficients = g_ACft.length;
    for (var i = 0; i < nAberrationCoefficients; i++) {
        var Argument = g_ACft[i].l2 * L2 + g_ACft[i].l3 * L3 + g_ACft[i].l4 * L4 + g_ACft[i].l5 * L5 + g_ACft[i].l6 * L6 + g_ACft[i].l7 * L7 + g_ACft[i].l8 * L8 + g_ACft[i].ldash * Ldash + g_ACft[i].d * D + g_ACft[i].mdash * Mdash + g_ACft[i].f * F;
        velocity.x += (g_ACft[i].xsin + g_ACft[i].xsint * T) * Math.sin(Argument);
        velocity.x += (g_ACft[i].xcos + g_ACft[i].xcost * T) * Math.cos(Argument);
        velocity.y += (g_ACft[i].ysin + g_ACft[i].ysint * T) * Math.sin(Argument);
        velocity.y += (g_ACft[i].ycos + g_ACft[i].ycost * T) * Math.cos(Argument);
        velocity.z += (g_ACft[i].zsin + g_ACft[i].zsint * T) * Math.sin(Argument);
        velocity.z += (g_ACft[i].zcos + g_ACft[i].zcost * T) * Math.cos(Argument);
    }
    return velocity;
};

ABR.eclipticAberration = function (Lambda, Beta, JD) {
    var aberration = new COR();
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var e = 0.016708634 - 4.2037E-05 * T - 1.267E-07 * Tsquared;
    var pi = 102.93735 + 1.71946 * T + 0.00046 * Tsquared;
    var k = 20.49552;
    var SunLongitude = CAASun.geometricEclipticLongitude(JD);
    pi = CT.d2R(pi);
    Lambda = CT.d2R(Lambda);
    Beta = CT.d2R(Beta);
    SunLongitude = CT.d2R(SunLongitude);
    aberration.x = (-k * Math.cos(SunLongitude - Lambda) + e * k * Math.cos(pi - Lambda)) / Math.cos(Beta) / 3600;
    aberration.y = -k * Math.sin(Beta) * (Math.sin(SunLongitude - Lambda) - e * Math.sin(pi - Lambda)) / 3600;
    return aberration;
};

ABR.equatorialAberration = function (Alpha, Delta, JD) {
    Alpha = CT.d2R(Alpha * 15);
    Delta = CT.d2R(Delta);
    var cosAlpha = Math.cos(Alpha);
    var sinAlpha = Math.sin(Alpha);
    var cosDelta = Math.cos(Delta);
    var sinDelta = Math.sin(Delta);
    var velocity = ABR.earthVelocity(JD);
    var aberration = new COR();
    aberration.x = CT.r2H((velocity.y * cosAlpha - velocity.x * sinAlpha) / (17314463350 * cosDelta));
    aberration.y = CT.r2D(-(((velocity.x * cosAlpha + velocity.y * sinAlpha) * sinDelta - velocity.z * cosDelta) / 17314463350));
    return aberration;
};

var ABR$ = {};

registerType("ABR", [ABR, ABR$, null]);
