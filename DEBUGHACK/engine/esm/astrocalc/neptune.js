// Originally `AANEPTUNE.CPP`
// "Purpose: Implementation for the algorithms which obtain the heliocentric position of Neptune"
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

const g_L0NC = [new VSC(531188633, 0, 0), new VSC(1798476, 2.9010127, 38.1330356), new VSC(1019728, 0.4858092, 1.4844727), new VSC(124532, 4.830081, 36.648563), new VSC(42064, 5.41055, 2.96895), new VSC(37715, 6.09222, 35.16409), new VSC(33785, 1.24489, 76.26607), new VSC(16483, 8E-05, 491.55793), new VSC(9199, 4.9375, 39.6175), new VSC(8994, 0.2746, 175.1661), new VSC(4216, 1.9871, 73.2971), new VSC(3365, 1.0359, 33.6796), new VSC(2285, 4.2061, 4.4534), new VSC(1434, 2.7834, 74.7816), new VSC(900, 2.076, 109.946), new VSC(745, 3.19, 71.813), new VSC(506, 5.748, 114.399), new VSC(400, 0.35, 1021.249), new VSC(345, 3.462, 41.102), new VSC(340, 3.304, 77.751), new VSC(323, 2.248, 32.195), new VSC(306, 0.497, 0.521), new VSC(287, 4.505, 0.048), new VSC(282, 2.246, 146.594), new VSC(267, 4.889, 0.963), new VSC(252, 5.782, 388.465), new VSC(245, 1.247, 9.561), new VSC(233, 2.505, 137.033), new VSC(227, 1.797, 453.425), new VSC(170, 3.324, 108.461), new VSC(151, 2.192, 33.94), new VSC(150, 2.997, 5.938), new VSC(148, 0.859, 111.43), new VSC(119, 3.677, 2.448), new VSC(109, 2.416, 183.243), new VSC(103, 0.041, 0.261), new VSC(103, 4.404, 70.328), new VSC(102, 5.705, 0.112)];
const g_L1NC = [new VSC(3837687717, 0, 0), new VSC(16604, 4.86319, 1.48447), new VSC(15807, 2.27923, 38.13304), new VSC(3335, 3.682, 76.2661), new VSC(1306, 3.6732, 2.9689), new VSC(605, 1.505, 35.164), new VSC(179, 3.453, 39.618), new VSC(107, 2.451, 4.453), new VSC(106, 2.755, 33.68), new VSC(73, 5.49, 36.65), new VSC(57, 1.86, 114.4), new VSC(57, 5.22, 0.52), new VSC(35, 4.52, 74.78), new VSC(32, 5.9, 77.75), new VSC(30, 3.67, 388.47), new VSC(29, 5.17, 9.56), new VSC(29, 5.17, 2.45), new VSC(26, 5.25, 168.05)];
const g_L2NC = [new VSC(53893, 0, 0), new VSC(296, 1.855, 1.484), new VSC(281, 1.191, 38.133), new VSC(270, 5.721, 76.266), new VSC(23, 1.21, 2.97), new VSC(9, 4.43, 35.16), new VSC(7, 0.54, 2.45)];
const g_L3NC = [new VSC(31, 0, 0), new VSC(15, 1.35, 76.27), new VSC(12, 6.04, 1.48), new VSC(12, 6.11, 38.13)];
const g_L4NC = [new VSC(114, 3.142, 0)];
const g_B0NC = [new VSC(3088623, 1.4410437, 38.1330356), new VSC(27789, 5.91272, 76.26607), new VSC(27624, 0, 0), new VSC(15448, 3.50877, 39.61751), new VSC(15355, 2.52124, 36.64856), new VSC(2000, 1.51, 74.7816), new VSC(1968, 4.3778, 1.4845), new VSC(1015, 3.2156, 35.1641), new VSC(606, 2.802, 73.297), new VSC(595, 2.129, 41.102), new VSC(589, 3.187, 2.969), new VSC(402, 4.169, 114.399), new VSC(280, 1.682, 77.751), new VSC(262, 3.767, 213.299), new VSC(254, 3.271, 453.425), new VSC(206, 4.257, 529.691), new VSC(140, 3.53, 137.033)];
const g_B1NC = [new VSC(227279, 3.807931, 38.133036), new VSC(1803, 1.9758, 76.2661), new VSC(1433, 3.1416, 0), new VSC(1386, 4.8256, 36.6486), new VSC(1073, 6.0805, 39.6175), new VSC(148, 3.858, 74.782), new VSC(136, 0.478, 1.484), new VSC(70, 6.19, 35.16), new VSC(52, 5.05, 73.3), new VSC(43, 0.31, 114.4), new VSC(37, 4.89, 41.1), new VSC(37, 5.76, 2.97), new VSC(26, 5.22, 213.3)];
const g_B2NC = [new VSC(9691, 5.5712, 38.133), new VSC(79, 3.63, 76.27), new VSC(72, 0.45, 36.65), new VSC(59, 3.14, 0), new VSC(30, 1.61, 39.62), new VSC(6, 5.61, 74.78)];
const g_B3NC = [new VSC(273, 1.017, 38.133), new VSC(2, 0, 0), new VSC(2, 2.37, 36.65), new VSC(2, 5.33, 76.27)];
const g_B4NC = [new VSC(6, 2.67, 38.13)];
const g_R0NC = [new VSC(3007013206, 0, 0), new VSC(27062259, 1.32999459, 38.13303564), new VSC(1691764, 3.2518614, 36.6485629), new VSC(807831, 5.185928, 1.484473), new VSC(537761, 4.521139, 35.16409), new VSC(495726, 1.571057, 491.557929), new VSC(274572, 1.845523, 175.16606), new VSC(135134, 3.372206, 39.617508), new VSC(121802, 5.797544, 76.266071), new VSC(100895, 0.377027, 73.297126), new VSC(69792, 3.79617, 2.96895), new VSC(46688, 5.74938, 33.67962), new VSC(24594, 0.50802, 109.94569), new VSC(16939, 1.59422, 71.81265), new VSC(14230, 1.07786, 74.7816), new VSC(12012, 1.92062, 1021.24889), new VSC(8395, 0.6782, 146.5943), new VSC(7572, 1.0715, 388.4652), new VSC(5721, 2.5906, 4.4534), new VSC(4840, 1.9069, 41.102), new VSC(4483, 2.9057, 529.691), new VSC(4421, 1.7499, 108.4612), new VSC(4354, 0.6799, 32.1951), new VSC(4270, 3.4134, 453.4249), new VSC(3381, 0.8481, 183.2428), new VSC(2881, 1.986, 137.033), new VSC(2879, 3.6742, 350.3321), new VSC(2636, 3.0976, 213.2991), new VSC(2530, 5.7984, 490.0735), new VSC(2523, 0.4863, 493.0424), new VSC(2306, 2.8096, 70.3282), new VSC(2087, 0.6186, 33.9402)];
const g_R1NC = [new VSC(236339, 0.70498, 38.133036), new VSC(13220, 3.32015, 1.48447), new VSC(8622, 6.2163, 35.1641), new VSC(2702, 1.8814, 39.6175), new VSC(2155, 2.0943, 2.9689), new VSC(2153, 5.1687, 76.2661), new VSC(1603, 0, 0), new VSC(1464, 1.1842, 33.6796), new VSC(1136, 3.9189, 36.6486), new VSC(898, 5.241, 388.465), new VSC(790, 0.533, 168.053), new VSC(760, 0.021, 182.28), new VSC(607, 1.077, 1021.249), new VSC(572, 3.401, 484.444), new VSC(561, 2.887, 498.671)];
const g_R2NC = [new VSC(4247, 5.8991, 38.133), new VSC(218, 0.346, 1.484), new VSC(163, 2.239, 168.053), new VSC(156, 4.594, 182.28), new VSC(127, 2.848, 35.164)];
const g_R3NC = [new VSC(166, 4.552, 38.133)];


// CAANeptune

export function CAANeptune() { }

CAANeptune.eclipticLongitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nL0Coefficients = g_L0NC.length;
    var L0 = 0;
    var i;
    for (i = 0; i < nL0Coefficients; i++) {
        L0 += g_L0NC[i].a * Math.cos(g_L0NC[i].b + g_L0NC[i].c * rho);
    }
    var nL1Coefficients = g_L1NC.length;
    var L1 = 0;
    for (i = 0; i < nL1Coefficients; i++) {
        L1 += g_L1NC[i].a * Math.cos(g_L1NC[i].b + g_L1NC[i].c * rho);
    }
    var nL2Coefficients = g_L2NC.length;
    var L2 = 0;
    for (i = 0; i < nL2Coefficients; i++) {
        L2 += g_L2NC[i].a * Math.cos(g_L2NC[i].b + g_L2NC[i].c * rho);
    }
    var nL3Coefficients = g_L3NC.length;
    var L3 = 0;
    for (i = 0; i < nL3Coefficients; i++) {
        L3 += g_L3NC[i].a * Math.cos(g_L3NC[i].b + g_L3NC[i].c * rho);
    }
    var nL4Coefficients = g_L4NC.length;
    var L4 = 0;
    for (i = 0; i < nL4Coefficients; i++) {
        L4 += g_L4NC[i].a * Math.cos(g_L4NC[i].b + g_L4NC[i].c * rho);
    }
    var vvalue = (L0 + L1 * rho + L2 * rhosquared + L3 * rhocubed + L4 * rho4) / 100000000;
    vvalue = CT.m360(CT.r2D(vvalue));
    return vvalue;
};

CAANeptune.eclipticLatitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nB0Coefficients = g_B0NC.length;
    var B0 = 0;
    var i;
    for (i = 0; i < nB0Coefficients; i++) {
        B0 += g_B0NC[i].a * Math.cos(g_B0NC[i].b + g_B0NC[i].c * rho);
    }
    var nB1Coefficients = g_B1NC.length;
    var B1 = 0;
    for (i = 0; i < nB1Coefficients; i++) {
        B1 += g_B1NC[i].a * Math.cos(g_B1NC[i].b + g_B1NC[i].c * rho);
    }
    var nB2Coefficients = g_B2NC.length;
    var B2 = 0;
    for (i = 0; i < nB2Coefficients; i++) {
        B2 += g_B2NC[i].a * Math.cos(g_B2NC[i].b + g_B2NC[i].c * rho);
    }
    var nB3Coefficients = g_B3NC.length;
    var B3 = 0;
    for (i = 0; i < nB3Coefficients; i++) {
        B3 += g_B3NC[i].a * Math.cos(g_B3NC[i].b + g_B3NC[i].c * rho);
    }
    var nB4Coefficients = g_B4NC.length;
    var B4 = 0;
    for (i = 0; i < nB4Coefficients; i++) {
        B4 += g_B4NC[i].a * Math.cos(g_B4NC[i].b + g_B4NC[i].c * rho);
    }
    var vvalue = (B0 + B1 * rho + B2 * rhosquared + B3 * rhocubed + B4 * rho4) / 100000000;
    vvalue = CT.r2D(vvalue);
    return vvalue;
};

CAANeptune.radiusVector = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var nR0Coefficients = g_R0NC.length;
    var R0 = 0;
    var i;
    for (i = 0; i < nR0Coefficients; i++) {
        R0 += g_R0NC[i].a * Math.cos(g_R0NC[i].b + g_R0NC[i].c * rho);
    }
    var nR1Coefficients = g_R1NC.length;
    var R1 = 0;
    for (i = 0; i < nR1Coefficients; i++) {
        R1 += g_R1NC[i].a * Math.cos(g_R1NC[i].b + g_R1NC[i].c * rho);
    }
    var nR2Coefficients = g_R2NC.length;
    var R2 = 0;
    for (i = 0; i < nR2Coefficients; i++) {
        R2 += g_R2NC[i].a * Math.cos(g_R2NC[i].b + g_R2NC[i].c * rho);
    }
    var nR3Coefficients = g_R3NC.length;
    var R3 = 0;
    for (i = 0; i < nR3Coefficients; i++) {
        R3 += g_R3NC[i].a * Math.cos(g_R3NC[i].b + g_R3NC[i].c * rho);
    }
    return (R0 + R1 * rho + R2 * rhosquared + R3 * rhocubed) / 100000000;
};

var CAANeptune$ = {};

registerType("CAANeptune", [CAANeptune, CAANeptune$, null]);
