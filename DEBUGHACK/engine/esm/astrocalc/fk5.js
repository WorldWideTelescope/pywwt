// Originally `AAFK5.CPP`
// "Purpose: Implementation for the algorithms to convert to the FK5 standard reference frame"
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


// CAAFK5

export function CAAFK5() { }

CAAFK5.correctionInLongitude = function (Longitude, Latitude, JD) {
    var T = (JD - 2451545) / 36525;
    var Ldash = Longitude - 1.397 * T - 0.00031 * T * T;
    Ldash = CT.d2R(Ldash);
    Longitude = CT.d2R(Longitude);
    Latitude = CT.d2R(Latitude);
    var vvalue = -0.09033 + 0.03916 * (Math.cos(Ldash) + Math.sin(Ldash)) * Math.tan(Latitude);
    return CT.dmS2D(0, 0, vvalue);
};

CAAFK5.correctionInLatitude = function (Longitude, JD) {
    var T = (JD - 2451545) / 36525;
    var Ldash = Longitude - 1.397 * T - 0.00031 * T * T;
    Ldash = CT.d2R(Ldash);
    Longitude = CT.d2R(Longitude);
    var vvalue = 0.03916 * (Math.cos(Ldash) - Math.sin(Ldash));
    return CT.dmS2D(0, 0, vvalue);
};

CAAFK5.convertVSOPToFK5J2000 = function (vvalue) {
    var result = new C3D();
    result.x = vvalue.x + 4.4036E-07 * vvalue.y - 1.90919E-07 * vvalue.z;
    result.y = -4.79966E-07 * vvalue.x + 0.917482137087 * vvalue.y - 0.397776982902 * vvalue.z;
    result.z = 0.397776982902 * vvalue.y + 0.917482137087 * vvalue.z;
    return result;
};

CAAFK5.convertVSOPToFK5B1950 = function (vvalue) {
    var result = new C3D();
    result.x = 0.999925702634 * vvalue.x + 0.012189716217 * vvalue.y + 1.1134016E-05 * vvalue.z;
    result.y = -0.011179418036 * vvalue.x + 0.917413998946 * vvalue.y - 0.397777041885 * vvalue.z;
    result.z = -0.004859003787 * vvalue.x + 0.397747363646 * vvalue.y + 0.917482111428 * vvalue.z;
    return result;
};

CAAFK5.convertVSOPToFK5AnyEquinox = function (vvalue, JDEquinox) {
    var t = (JDEquinox - 2451545) / 36525;
    var tsquared = t * t;
    var tcubed = tsquared * t;
    var sigma = 2306.2181 * t + 0.30188 * tsquared + 0.017988 * tcubed;
    sigma = CT.d2R(CT.dmS2D(0, 0, sigma));
    var zeta = 2306.2181 * t + 1.09468 * tsquared + 0.018203 * tcubed;
    zeta = CT.d2R(CT.dmS2D(0, 0, zeta));
    var phi = 2004.3109 * t - 0.42665 * tsquared - 0.041833 * tcubed;
    phi = CT.d2R(CT.dmS2D(0, 0, phi));
    var cossigma = Math.cos(sigma);
    var coszeta = Math.cos(zeta);
    var cosphi = Math.cos(phi);
    var sinsigma = Math.sin(sigma);
    var sinzeta = Math.sin(zeta);
    var sinphi = Math.sin(phi);
    var xx = cossigma * coszeta * cosphi - sinsigma * sinzeta;
    var xy = sinsigma * coszeta + cossigma * sinzeta * cosphi;
    var xz = cossigma * sinphi;
    var yx = -cossigma * sinzeta - sinsigma * coszeta * cosphi;
    var yy = cossigma * coszeta - sinsigma * sinzeta * cosphi;
    var yz = -sinsigma * sinphi;
    var zx = -coszeta * sinphi;
    var zy = -sinzeta * sinphi;
    var zz = cosphi;
    var result = new C3D();
    result.x = xx * vvalue.x + yx * vvalue.y + zx * vvalue.z;
    result.y = xy * vvalue.x + yy * vvalue.y + zy * vvalue.z;
    result.z = xz * vvalue.x + yz * vvalue.y + zz * vvalue.z;
    return result;
};

var CAAFK5$ = {};

registerType("CAAFK5", [CAAFK5, CAAFK5$, null]);
