// Originally `AAMARS.CPP`
// "Purpose: Implementation for the algorithms which obtain the heliocentric position of Uranus [sic]"
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

const g_L0MarsCoefficients = [new VSC(620347712, 0, 0), new VSC(18656368, 5.050371, 3340.6124267), new VSC(1108217, 5.4009984, 6681.2248534), new VSC(91798, 5.75479, 10021.83728), new VSC(27745, 5.9705, 3.52312), new VSC(12316, 0.84956, 2810.92146), new VSC(10610, 2.93959, 2281.2305), new VSC(8927, 4.157, 0.0173), new VSC(8716, 6.1101, 13362.4497), new VSC(7775, 3.3397, 5621.8429), new VSC(6798, 0.3646, 398.149), new VSC(4161, 0.2281, 2942.4634), new VSC(3575, 1.6619, 2544.3144), new VSC(3075, 0.857, 191.4483), new VSC(2938, 6.0789, 0.0673), new VSC(2628, 0.6481, 3337.0893), new VSC(2580, 0.03, 3344.1355), new VSC(2389, 5.039, 796.298), new VSC(1799, 0.6563, 529.691), new VSC(1546, 2.9158, 1751.5395), new VSC(1528, 1.1498, 6151.5339), new VSC(1286, 3.068, 2146.1654), new VSC(1264, 3.6228, 5092.152), new VSC(1025, 3.6933, 8962.4553), new VSC(892, 0.183, 16703.062), new VSC(859, 2.401, 2914.014), new VSC(833, 4.495, 3340.63), new VSC(833, 2.464, 3340.595), new VSC(749, 3.822, 155.42), new VSC(724, 0.675, 3738.761), new VSC(713, 3.663, 1059.382), new VSC(655, 0.489, 3127.313), new VSC(636, 2.922, 8432.764), new VSC(553, 4.475, 1748.016), new VSC(550, 3.81, 0.98), new VSC(472, 3.625, 1194.447), new VSC(426, 0.554, 6283.076), new VSC(415, 0.497, 213.299), new VSC(312, 0.999, 6677.702), new VSC(307, 0.381, 6684.748), new VSC(302, 4.486, 3532.061), new VSC(299, 2.783, 6254.627), new VSC(293, 4.221, 20.775), new VSC(284, 5.769, 3149.164), new VSC(281, 5.882, 1349.867), new VSC(274, 0.542, 3340.545), new VSC(274, 0.134, 3340.68), new VSC(239, 5.372, 4136.91), new VSC(236, 5.755, 3333.499), new VSC(231, 1.282, 3870.303), new VSC(221, 3.505, 382.897), new VSC(204, 2.821, 1221.849), new VSC(193, 3.357, 3.59), new VSC(189, 1.491, 9492.146), new VSC(179, 1.006, 951.718), new VSC(174, 2.414, 553.569), new VSC(172, 0.439, 5486.778), new VSC(160, 3.949, 4562.461), new VSC(144, 1.419, 135.065), new VSC(140, 3.326, 2700.715), new VSC(138, 4.301, 7.114), new VSC(131, 4.045, 12303.068), new VSC(128, 2.208, 1592.596), new VSC(128, 1.807, 5088.629), new VSC(117, 3.128, 7903.073), new VSC(113, 3.701, 1589.073), new VSC(110, 1.052, 242.729), new VSC(105, 0.785, 8827.39), new VSC(100, 3.243, 11773.377)];
const g_L1MarsCoefficients = [new VSC(334085627474, 0, 0), new VSC(1458227, 3.6042605, 3340.6124267), new VSC(164901, 3.926313, 6681.224853), new VSC(19963, 4.26594, 10021.83728), new VSC(3452, 4.7321, 3.5231), new VSC(2485, 4.6128, 13362.4497), new VSC(842, 4.459, 2281.23), new VSC(538, 5.016, 398.149), new VSC(521, 4.994, 3344.136), new VSC(433, 2.561, 191.448), new VSC(430, 5.316, 155.42), new VSC(382, 3.539, 796.298), new VSC(314, 4.963, 16703.062), new VSC(283, 3.16, 2544.314), new VSC(206, 4.569, 2146.165), new VSC(169, 1.329, 3337.089), new VSC(158, 4.185, 1751.54), new VSC(134, 2.233, 0.98), new VSC(134, 5.974, 1748.016), new VSC(118, 6.024, 6151.534), new VSC(117, 2.213, 1059.382), new VSC(114, 2.129, 1194.447), new VSC(114, 5.428, 3738.761), new VSC(91, 1.1, 1349.87), new VSC(85, 3.91, 553.57), new VSC(83, 5.3, 6684.75), new VSC(81, 4.43, 529.69), new VSC(80, 2.25, 8962.46), new VSC(73, 2.5, 951.72), new VSC(73, 5.84, 242.73), new VSC(71, 3.86, 2914.01), new VSC(68, 5.02, 382.9), new VSC(65, 1.02, 3340.6), new VSC(65, 3.05, 3340.63), new VSC(62, 4.15, 3149.16), new VSC(57, 3.89, 4136.91), new VSC(48, 4.87, 213.3), new VSC(48, 1.18, 3333.5), new VSC(47, 1.31, 3185.19), new VSC(41, 0.71, 1592.6), new VSC(40, 2.73, 7.11), new VSC(40, 5.32, 20043.67), new VSC(33, 5.41, 6283.08), new VSC(28, 0.05, 9492.15), new VSC(27, 3.89, 1221.85), new VSC(27, 5.11, 2700.72)];
const g_L2MarsCoefficients = [new VSC(58016, 2.04979, 3340.61243), new VSC(54188, 0, 0), new VSC(13908, 2.45742, 6681.22485), new VSC(2465, 2.8, 10021.8373), new VSC(398, 3.141, 13362.45), new VSC(222, 3.194, 3.523), new VSC(121, 0.543, 155.42), new VSC(62, 3.49, 16703.06), new VSC(54, 3.54, 3344.14), new VSC(34, 6, 2281.23), new VSC(32, 4.14, 191.45), new VSC(30, 2, 796.3), new VSC(23, 4.33, 242.73), new VSC(22, 3.45, 398.15), new VSC(20, 5.42, 553.57), new VSC(16, 0.66, 0.98), new VSC(16, 6.11, 2146.17), new VSC(16, 1.22, 1748.02), new VSC(15, 6.1, 3185.19), new VSC(14, 4.02, 951.72), new VSC(14, 2.62, 1349.87), new VSC(13, 0.6, 1194.45), new VSC(12, 3.86, 6684.75), new VSC(11, 4.72, 2544.31), new VSC(10, 0.25, 382.9), new VSC(9, 0.68, 1059.38), new VSC(9, 3.83, 20043.67), new VSC(9, 3.88, 3738.76), new VSC(8, 5.46, 1751.54), new VSC(7, 2.58, 3149.16), new VSC(7, 2.38, 4136.91), new VSC(6, 5.48, 1592.6), new VSC(6, 2.34, 3097.88)];
const g_L3MarsCoefficients = [new VSC(1482, 0.4443, 3340.6124), new VSC(662, 0.885, 6681.225), new VSC(188, 1.288, 10021.837), new VSC(41, 1.65, 13362.45), new VSC(26, 0, 0), new VSC(23, 2.05, 155.42), new VSC(10, 1.58, 3.52), new VSC(8, 2, 16703.06), new VSC(5, 2.82, 242.73), new VSC(4, 2.02, 3344.14), new VSC(3, 4.59, 3185.19), new VSC(3, 0.65, 553.57)];
const g_L4MarsCoefficients = [new VSC(114, 3.1416, 0), new VSC(29, 5.64, 6681.22), new VSC(24, 5.14, 3340.61), new VSC(11, 6.03, 10021.84), new VSC(3, 0.13, 13362.45), new VSC(3, 3.56, 155.42), new VSC(1, 0.49, 16703.06), new VSC(1, 1.32, 242.73)];
const g_L5MarsCoefficients = [new VSC(1, 3.14, 0), new VSC(1, 4.04, 6681.22)];
const g_B0MarsCoefficients = [new VSC(3197135, 3.7683204, 3340.6124267), new VSC(298033, 4.10617, 6681.224853), new VSC(289105, 0, 0), new VSC(31366, 4.44651, 10021.83728), new VSC(3484, 4.7881, 13362.4497), new VSC(443, 5.026, 3344.136), new VSC(443, 5.652, 3337.089), new VSC(399, 5.131, 16703.062), new VSC(293, 3.793, 2281.23), new VSC(182, 6.136, 6151.534), new VSC(163, 4.264, 529.691), new VSC(160, 2.232, 1059.382), new VSC(149, 2.165, 5621.843), new VSC(143, 1.182, 3340.595), new VSC(143, 3.213, 3340.63), new VSC(139, 2.418, 8962.455)];
const g_B1MarsCoefficients = [new VSC(350069, 5.368478, 3340.612427), new VSC(14116, 3.14159, 0), new VSC(9671, 5.4788, 6681.2249), new VSC(1472, 3.2021, 10021.8373), new VSC(426, 3.408, 13362.45), new VSC(102, 0.776, 3337.089), new VSC(79, 3.72, 16703.06), new VSC(33, 3.46, 5621.84), new VSC(26, 2.48, 2281.23)];
const g_B2MarsCoefficients = [new VSC(16727, 0.60221, 3340.61243), new VSC(4987, 4.1416, 0), new VSC(302, 3.559, 6681.225), new VSC(26, 1.9, 13362.45), new VSC(21, 0.92, 10021.84), new VSC(12, 2.24, 3337.09), new VSC(8, 2.25, 16703.06)];
const g_B3MarsCoefficients = [new VSC(607, 1.981, 3340.612), new VSC(43, 0, 0), new VSC(14, 1.8, 6681.22), new VSC(3, 3.45, 10021.84)];
const g_B4MarsCoefficients = [new VSC(13, 0, 0), new VSC(11, 3.46, 3340.61), new VSC(1, 0.5, 6681.22)];
const g_R0MarsCoefficients = [new VSC(153033488, 0, 0), new VSC(14184953, 3.47971284, 3340.6124267), new VSC(660776, 3.817834, 6681.224853), new VSC(46179, 4.15595, 10021.83728), new VSC(8110, 5.5596, 2810.9215), new VSC(7485, 1.7724, 5621.8429), new VSC(5523, 1.3644, 2281.2305), new VSC(3825, 4.4941, 13362.4497), new VSC(2484, 4.9255, 2942.4634), new VSC(2307, 0.0908, 2544.3144), new VSC(1999, 5.3606, 3337.0893), new VSC(1960, 4.7425, 3344.1355), new VSC(1167, 2.1126, 5092.152), new VSC(1103, 5.0091, 398.149), new VSC(992, 5.839, 6151.534), new VSC(899, 4.408, 529.691), new VSC(807, 2.102, 1059.382), new VSC(798, 3.448, 796.298), new VSC(741, 1.499, 2146.165), new VSC(726, 1.245, 8432.764), new VSC(692, 2.134, 8962.455), new VSC(633, 0.894, 3340.595), new VSC(633, 2.924, 3340.63), new VSC(630, 1.287, 1751.54), new VSC(574, 0.829, 2914.014), new VSC(526, 5.383, 3738.761), new VSC(473, 5.199, 3127.313), new VSC(348, 4.832, 16703.062), new VSC(284, 2.907, 3532.061), new VSC(280, 5.257, 6283.076), new VSC(276, 1.218, 6254.627), new VSC(275, 2.908, 1748.016), new VSC(270, 3.764, 5884.927), new VSC(239, 2.037, 1194.447), new VSC(234, 5.105, 5486.778), new VSC(228, 3.255, 6872.673), new VSC(223, 4.199, 3149.164), new VSC(219, 5.583, 191.448), new VSC(208, 5.255, 3340.545), new VSC(208, 4.846, 3340.68), new VSC(186, 5.699, 6677.702), new VSC(183, 5.081, 6684.748), new VSC(179, 4.184, 3333.499), new VSC(176, 5.953, 3870.303), new VSC(164, 3.799, 4136.91)];
const g_R1MarsCoefficients = [new VSC(1107433, 2.0325052, 3340.6124267), new VSC(103176, 2.370718, 6681.224853), new VSC(12877, 0, 0), new VSC(10816, 2.70888, 10021.83728), new VSC(1195, 3.047, 13362.4497), new VSC(439, 2.888, 2281.23), new VSC(396, 3.423, 3344.136), new VSC(183, 1.584, 2544.314), new VSC(136, 3.385, 16703.062), new VSC(128, 6.043, 3337.089), new VSC(128, 0.63, 1059.382), new VSC(127, 1.954, 796.298), new VSC(118, 2.998, 2146.165), new VSC(88, 3.42, 398.15), new VSC(83, 3.86, 3738.76), new VSC(76, 4.45, 6151.53), new VSC(72, 2.76, 529.69), new VSC(67, 2.55, 1751.54), new VSC(66, 4.41, 1748.02), new VSC(58, 0.54, 1194.45), new VSC(54, 0.68, 8962.46), new VSC(51, 3.73, 6684.75), new VSC(49, 5.73, 3340.6), new VSC(49, 1.48, 3340.63), new VSC(48, 2.58, 3149.16), new VSC(48, 2.29, 2914.01), new VSC(39, 2.32, 4136.91)];
const g_R2MarsCoefficients = [new VSC(44242, 0.47931, 3340.61243), new VSC(8138, 0.87, 6681.2249), new VSC(1275, 1.2259, 10021.8373), new VSC(187, 1.573, 13362.45), new VSC(52, 3.14, 0), new VSC(41, 1.97, 3344.14), new VSC(27, 1.92, 16703.06), new VSC(18, 4.43, 2281.23), new VSC(12, 4.53, 3185.19), new VSC(10, 5.39, 1059.38), new VSC(10, 0.42, 796.3)];
const g_R3MarsCoefficients = [new VSC(1113, 5.1499, 3340.6124), new VSC(424, 5.613, 6681.225), new VSC(100, 5.997, 10021.837), new VSC(20, 0.08, 13362.45), new VSC(5, 3.14, 0), new VSC(3, 0.43, 16703.06)];
const g_R4MarsCoefficients = [new VSC(20, 3.58, 3340.61), new VSC(16, 4.05, 6681.22), new VSC(6, 4.46, 10021.84), new VSC(2, 4.84, 13362.45)];


// CAAMars

export function CAAMars() { }

CAAMars.eclipticLongitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var nL0Coefficients = g_L0MarsCoefficients.length;
    var L0 = 0;
    var i;
    for (i = 0; i < nL0Coefficients; i++) {
        L0 += g_L0MarsCoefficients[i].a * Math.cos(g_L0MarsCoefficients[i].b + g_L0MarsCoefficients[i].c * rho);
    }
    var nL1Coefficients = g_L1MarsCoefficients.length;
    var L1 = 0;
    for (i = 0; i < nL1Coefficients; i++) {
        L1 += g_L1MarsCoefficients[i].a * Math.cos(g_L1MarsCoefficients[i].b + g_L1MarsCoefficients[i].c * rho);
    }
    var nL2Coefficients = g_L2MarsCoefficients.length;
    var L2 = 0;
    for (i = 0; i < nL2Coefficients; i++) {
        L2 += g_L2MarsCoefficients[i].a * Math.cos(g_L2MarsCoefficients[i].b + g_L2MarsCoefficients[i].c * rho);
    }
    var nL3Coefficients = g_L3MarsCoefficients.length;
    var L3 = 0;
    for (i = 0; i < nL3Coefficients; i++) {
        L3 += g_L3MarsCoefficients[i].a * Math.cos(g_L3MarsCoefficients[i].b + g_L3MarsCoefficients[i].c * rho);
    }
    var nL4Coefficients = g_L4MarsCoefficients.length;
    var L4 = 0;
    for (i = 0; i < nL4Coefficients; i++) {
        L4 += g_L4MarsCoefficients[i].a * Math.cos(g_L4MarsCoefficients[i].b + g_L4MarsCoefficients[i].c * rho);
    }
    var nL5Coefficients = g_L5MarsCoefficients.length;
    var L5 = 0;
    for (i = 0; i < nL5Coefficients; i++) {
        L5 += g_L5MarsCoefficients[i].a * Math.cos(g_L5MarsCoefficients[i].b + g_L5MarsCoefficients[i].c * rho);
    }
    var vvalue = (L0 + L1 * rho + L2 * rhosquared + L3 * rhocubed + L4 * rho4 + L5 * rho5) / 100000000;
    vvalue = CT.m360(CT.r2D(vvalue));
    return vvalue;
};

CAAMars.eclipticLatitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nB0Coefficients = g_B0MarsCoefficients.length;
    var B0 = 0;
    var i;
    for (i = 0; i < nB0Coefficients; i++) {
        B0 += g_B0MarsCoefficients[i].a * Math.cos(g_B0MarsCoefficients[i].b + g_B0MarsCoefficients[i].c * rho);
    }
    var nB1Coefficients = g_B1MarsCoefficients.length;
    var B1 = 0;
    for (i = 0; i < nB1Coefficients; i++) {
        B1 += g_B1MarsCoefficients[i].a * Math.cos(g_B1MarsCoefficients[i].b + g_B1MarsCoefficients[i].c * rho);
    }
    var nB2Coefficients = g_B2MarsCoefficients.length;
    var B2 = 0;
    for (i = 0; i < nB2Coefficients; i++) {
        B2 += g_B2MarsCoefficients[i].a * Math.cos(g_B2MarsCoefficients[i].b + g_B2MarsCoefficients[i].c * rho);
    }
    var nB3Coefficients = g_B3MarsCoefficients.length;
    var B3 = 0;
    for (i = 0; i < nB3Coefficients; i++) {
        B3 += g_B3MarsCoefficients[i].a * Math.cos(g_B3MarsCoefficients[i].b + g_B3MarsCoefficients[i].c * rho);
    }
    var nB4Coefficients = g_B4MarsCoefficients.length;
    var B4 = 0;
    for (i = 0; i < nB4Coefficients; i++) {
        B4 += g_B4MarsCoefficients[i].a * Math.cos(g_B4MarsCoefficients[i].b + g_B4MarsCoefficients[i].c * rho);
    }
    var vvalue = (B0 + B1 * rho + B2 * rhosquared + B3 * rhocubed + B4 * rho4) / 100000000;
    vvalue = CT.r2D(vvalue);
    return vvalue;
};

CAAMars.radiusVector = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var nR0Coefficients = g_R0MarsCoefficients.length;
    var R0 = 0;
    var i;
    for (i = 0; i < nR0Coefficients; i++) {
        R0 += g_R0MarsCoefficients[i].a * Math.cos(g_R0MarsCoefficients[i].b + g_R0MarsCoefficients[i].c * rho);
    }
    var nR1Coefficients = g_R1MarsCoefficients.length;
    var R1 = 0;
    for (i = 0; i < nR1Coefficients; i++) {
        R1 += g_R1MarsCoefficients[i].a * Math.cos(g_R1MarsCoefficients[i].b + g_R1MarsCoefficients[i].c * rho);
    }
    var nR2Coefficients = g_R2MarsCoefficients.length;
    var R2 = 0;
    for (i = 0; i < nR2Coefficients; i++) {
        R2 += g_R2MarsCoefficients[i].a * Math.cos(g_R2MarsCoefficients[i].b + g_R2MarsCoefficients[i].c * rho);
    }
    var nR3Coefficients = g_R3MarsCoefficients.length;
    var R3 = 0;
    for (i = 0; i < nR3Coefficients; i++) {
        R3 += g_R3MarsCoefficients[i].a * Math.cos(g_R3MarsCoefficients[i].b + g_R3MarsCoefficients[i].c * rho);
    }
    var nR4Coefficients = g_R4MarsCoefficients.length;
    var R4 = 0;
    for (i = 0; i < nR4Coefficients; i++) {
        R4 += g_R4MarsCoefficients[i].a * Math.cos(g_R4MarsCoefficients[i].b + g_R4MarsCoefficients[i].c * rho);
    }
    return (R0 + R1 * rho + R2 * rhosquared + R3 * rhocubed + R4 * rho4) / 100000000;
};

var CAAMars$ = {};

registerType("CAAMars", [CAAMars, CAAMars$, null]);
