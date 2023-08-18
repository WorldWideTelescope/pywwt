// Originally `AAVENUS.CPP`
// "Purpose: Implementation for the algorithms which obtain the heliocentric position of Venus"
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
import { VSC } from "./earth.js";


// Coefficients

const g_L0VenusCoefficients = [new VSC(317614667, 0, 0), new VSC(1353968, 5.5931332, 10213.2855462), new VSC(89892, 5.3065, 20426.57109), new VSC(5477, 4.4163, 7860.4194), new VSC(3456, 2.6996, 11790.6291), new VSC(2372, 2.9938, 3930.2097), new VSC(1664, 4.2502, 1577.3435), new VSC(1438, 4.1575, 9683.5946), new VSC(1317, 5.1867, 26.2983), new VSC(1201, 6.1536, 30639.8566), new VSC(769, 0.816, 9437.763), new VSC(761, 1.95, 529.691), new VSC(708, 1.065, 775.523), new VSC(585, 3.998, 191.448), new VSC(500, 4.123, 15720.839), new VSC(429, 3.586, 19367.189), new VSC(327, 5.677, 5507.553), new VSC(326, 4.591, 10404.734), new VSC(232, 3.163, 9153.904), new VSC(180, 4.653, 1109.379), new VSC(155, 5.57, 19651.048), new VSC(128, 4.226, 20.775), new VSC(128, 0.962, 5661.332), new VSC(106, 1.537, 801.821)];
const g_L1VenusCoefficients = [new VSC(1021352943053, 0, 0), new VSC(95708, 2.46424, 10213.28555), new VSC(14445, 0.51625, 20426.57109), new VSC(213, 1.795, 30639.857), new VSC(174, 2.655, 26.298), new VSC(152, 6.106, 1577.344), new VSC(82, 5.7, 191.45), new VSC(70, 2.68, 9437.76), new VSC(52, 3.6, 775.52), new VSC(38, 1.03, 529.69), new VSC(30, 1.25, 5507.55), new VSC(25, 6.11, 10404.73)];
const g_L2VenusCoefficients = [new VSC(54127, 0, 0), new VSC(3891, 0.3451, 10213.2855), new VSC(1338, 2.0201, 20426.5711), new VSC(24, 2.05, 26.3), new VSC(19, 3.54, 30639.86), new VSC(10, 3.97, 775.52), new VSC(7, 1.52, 1577.34), new VSC(6, 1, 191.45)];
const g_L3VenusCoefficients = [new VSC(136, 4.804, 10213.286), new VSC(78, 3.67, 20426.57), new VSC(26, 0, 0)];
const g_L4VenusCoefficients = [new VSC(114, 3.1416, 0), new VSC(3, 5.21, 20426.57), new VSC(2, 2.51, 10213.29)];
const g_L5VenusCoefficients = [new VSC(1, 3.14, 0)];
const g_B0VenusCoefficients = [new VSC(5923638, 0.2670278, 10213.2855462), new VSC(40108, 1.14737, 20426.57109), new VSC(32815, 3.14737, 0), new VSC(1011, 1.0895, 30639.8566), new VSC(149, 6.254, 18073.705), new VSC(138, 0.86, 1577.344), new VSC(130, 3.672, 9437.763), new VSC(120, 3.705, 2352.866), new VSC(108, 4.539, 22003.915)];
const g_B1VenusCoefficients = [new VSC(513348, 1.803643, 10213.285546), new VSC(4380, 3.3862, 20426.5711), new VSC(199, 0, 0), new VSC(197, 2.53, 30639.857)];
const g_B2VenusCoefficients = [new VSC(22378, 3.38509, 10213.28555), new VSC(282, 0, 0), new VSC(173, 5.256, 20426.571), new VSC(27, 3.87, 30639.86)];
const g_B3VenusCoefficients = [new VSC(647, 4.992, 10213.286), new VSC(20, 3.14, 0), new VSC(6, 0.77, 20426.57), new VSC(3, 5.44, 30639.86)];
const g_B4VenusCoefficients = [new VSC(14, 0.32, 10213.29)];
const g_R0VenusCoefficients = [new VSC(72334821, 0, 0), new VSC(489824, 4.021518, 10213.285546), new VSC(1658, 4.9021, 20426.5711), new VSC(1632, 2.8455, 7860.4194), new VSC(1378, 1.1285, 11790.6291), new VSC(498, 2.587, 9683.595), new VSC(374, 1.423, 3930.21), new VSC(264, 5.529, 9437.763), new VSC(237, 2.551, 15720.839), new VSC(222, 2.013, 19367.189), new VSC(126, 2.728, 1577.344), new VSC(119, 3.02, 10404.734)];
const g_R1VenusCoefficients = [new VSC(34551, 0.89199, 10213.28555), new VSC(234, 1.772, 20426.571), new VSC(234, 3.142, 0)];
const g_R2VenusCoefficients = [new VSC(1407, 5.0637, 10213.2855), new VSC(16, 5.47, 20426.57), new VSC(13, 0, 0)];
const g_R3VenusCoefficients = [new VSC(50, 3.22, 10213.29)];
const g_R4VenusCoefficients = [new VSC(1, 0.92, 10213.29)];


// CAAVenus

export function CAAVenus() { }

CAAVenus.eclipticLongitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var nL0Coefficients = g_L0VenusCoefficients.length;
    var L0 = 0;
    var i;
    for (i = 0; i < nL0Coefficients; i++) {
        L0 += g_L0VenusCoefficients[i].a * Math.cos(g_L0VenusCoefficients[i].b + g_L0VenusCoefficients[i].c * rho);
    }
    var nL1Coefficients = g_L1VenusCoefficients.length;
    var L1 = 0;
    for (i = 0; i < nL1Coefficients; i++) {
        L1 += g_L1VenusCoefficients[i].a * Math.cos(g_L1VenusCoefficients[i].b + g_L1VenusCoefficients[i].c * rho);
    }
    var nL2Coefficients = g_L2VenusCoefficients.length;
    var L2 = 0;
    for (i = 0; i < nL2Coefficients; i++) {
        L2 += g_L2VenusCoefficients[i].a * Math.cos(g_L2VenusCoefficients[i].b + g_L2VenusCoefficients[i].c * rho);
    }
    var nL3Coefficients = g_L3VenusCoefficients.length;
    var L3 = 0;
    for (i = 0; i < nL3Coefficients; i++) {
        L3 += g_L3VenusCoefficients[i].a * Math.cos(g_L3VenusCoefficients[i].b + g_L3VenusCoefficients[i].c * rho);
    }
    var nL4Coefficients = g_L4VenusCoefficients.length;
    var L4 = 0;
    for (i = 0; i < nL4Coefficients; i++) {
        L4 += g_L4VenusCoefficients[i].a * Math.cos(g_L4VenusCoefficients[i].b + g_L4VenusCoefficients[i].c * rho);
    }
    var nL5Coefficients = g_L5VenusCoefficients.length;
    var L5 = 0;
    for (i = 0; i < nL5Coefficients; i++) {
        L5 += g_L5VenusCoefficients[i].a * Math.cos(g_L5VenusCoefficients[i].b + g_L5VenusCoefficients[i].c * rho);
    }
    var vvalue = (L0 + L1 * rho + L2 * rhosquared + L3 * rhocubed + L4 * rho4 + L5 * rho5) / 100000000;
    vvalue = CT.m360(CT.r2D(vvalue));
    return vvalue;
};

CAAVenus.eclipticLatitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nB0Coefficients = g_B0VenusCoefficients.length;
    var B0 = 0;
    var i;
    for (i = 0; i < nB0Coefficients; i++) {
        B0 += g_B0VenusCoefficients[i].a * Math.cos(g_B0VenusCoefficients[i].b + g_B0VenusCoefficients[i].c * rho);
    }
    var nB1Coefficients = g_B1VenusCoefficients.length;
    var B1 = 0;
    for (i = 0; i < nB1Coefficients; i++) {
        B1 += g_B1VenusCoefficients[i].a * Math.cos(g_B1VenusCoefficients[i].b + g_B1VenusCoefficients[i].c * rho);
    }
    var nB2Coefficients = g_B2VenusCoefficients.length;
    var B2 = 0;
    for (i = 0; i < nB2Coefficients; i++) {
        B2 += g_B2VenusCoefficients[i].a * Math.cos(g_B2VenusCoefficients[i].b + g_B2VenusCoefficients[i].c * rho);
    }
    var nB3Coefficients = g_B3VenusCoefficients.length;
    var B3 = 0;
    for (i = 0; i < nB3Coefficients; i++) {
        B3 += g_B3VenusCoefficients[i].a * Math.cos(g_B3VenusCoefficients[i].b + g_B3VenusCoefficients[i].c * rho);
    }
    var nB4Coefficients = g_B4VenusCoefficients.length;
    var B4 = 0;
    for (i = 0; i < nB4Coefficients; i++) {
        B4 += g_B4VenusCoefficients[i].a * Math.cos(g_B4VenusCoefficients[i].b + g_B4VenusCoefficients[i].c * rho);
    }
    var vvalue = (B0 + B1 * rho + B2 * rhosquared + B3 * rhocubed + B4 * rho4) / 100000000;
    vvalue = CT.r2D(vvalue);
    return vvalue;
};

CAAVenus.radiusVector = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nR0Coefficients = g_R0VenusCoefficients.length;
    var R0 = 0;
    var i;
    for (i = 0; i < nR0Coefficients; i++) {
        R0 += g_R0VenusCoefficients[i].a * Math.cos(g_R0VenusCoefficients[i].b + g_R0VenusCoefficients[i].c * rho);
    }
    var nR1Coefficients = g_R1VenusCoefficients.length;
    var R1 = 0;
    for (i = 0; i < nR1Coefficients; i++) {
        R1 += g_R1VenusCoefficients[i].a * Math.cos(g_R1VenusCoefficients[i].b + g_R1VenusCoefficients[i].c * rho);
    }
    var nR2Coefficients = g_R2VenusCoefficients.length;
    var R2 = 0;
    for (i = 0; i < nR2Coefficients; i++) {
        R2 += g_R2VenusCoefficients[i].a * Math.cos(g_R2VenusCoefficients[i].b + g_R2VenusCoefficients[i].c * rho);
    }
    var nR3Coefficients = g_R3VenusCoefficients.length;
    var R3 = 0;
    for (i = 0; i < nR3Coefficients; i++) {
        R3 += g_R3VenusCoefficients[i].a * Math.cos(g_R3VenusCoefficients[i].b + g_R3VenusCoefficients[i].c * rho);
    }
    var nR4Coefficients = g_R4VenusCoefficients.length;
    var R4 = 0;
    for (i = 0; i < nR4Coefficients; i++) {
        R4 += g_R4VenusCoefficients[i].a * Math.cos(g_R4VenusCoefficients[i].b + g_R4VenusCoefficients[i].c * rho);
    }
    return (R0 + R1 * rho + R2 * rhosquared + R3 * rhocubed + R4 * rho4) / 100000000;
};

var CAAVenus$ = {};

registerType("CAAVenus", [CAAVenus, CAAVenus$, null]);
