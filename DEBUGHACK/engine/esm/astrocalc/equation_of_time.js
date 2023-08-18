// Originally `AAEQUATIONOFTIME.CPP`
// "Purpose: Implementation for the algorithms to calculate the "Equation of Time""
// Last update of original: PJN / 05-07-2005
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
import { CAANutation } from "./nutation.js";
import { CAASun } from "./sun.js";


// EOT

export function EOT() { }

EOT.calculate = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var L0 = CT.m360(280.4664567 + 360007.6982779 * rho + 0.03032028 * rhosquared + rhocubed / 49931 - rho4 / 15300 - rho5 / 2000000);
    var SunLong = CAASun.apparentEclipticLongitude(JD);
    var SunLat = CAASun.apparentEclipticLatitude(JD);
    var epsilon = CAANutation.trueObliquityOfEcliptic(JD);
    var Equatorial = CT.ec2Eq(SunLong, SunLat, epsilon);
    epsilon = CT.d2R(epsilon);
    var E = L0 - 0.0057183 - Equatorial.x * 15 + CT.dmS2D(0, 0, CAANutation.nutationInLongitude(JD)) * Math.cos(epsilon);
    if (E > 180) {
        E = -(360 - E);
    }
    E *= 4;
    return E;
};

var EOT$ = {};

registerType("EOT", [EOT, EOT$, null]);
