// Originally `AAPHYSICALSUN.CPP`
// "Purpose: Implementation for the algorithms which obtain the physical parameters of the Sun"
// Last update of original: PJN / 16-06-2004
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
import { CAAEarth } from "./earth.js";


// CAAPhysicalSunDetails

export function CAAPhysicalSunDetails() {
    this.p = 0;
    this.b0 = 0;
    this.l0 = 0;
    this.p = 0;
    this.b0 = 0;
    this.l0 = 0;
}

var CAAPhysicalSunDetails$ = {};

registerType("CAAPhysicalSunDetails", [CAAPhysicalSunDetails, CAAPhysicalSunDetails$, null]);


// CAAPhysicalSun

export function CAAPhysicalSun() { }

CAAPhysicalSun.calculate = function (JD) {
    var theta = CT.m360((JD - 2398220) * 360 / 25.38);
    var I = 7.25;
    var K = 73.6667 + 1.3958333 * (JD - 2396758) / 36525;
    var L = CAAEarth.eclipticLongitude(JD);
    var R = CAAEarth.radiusVector(JD);
    var SunLong = L + 180 - CT.dmS2D(0, 0, 20.4898 / R);
    var SunLongDash = SunLong + CT.dmS2D(0, 0, CAANutation.nutationInLongitude(JD));
    var epsilon = CAANutation.trueObliquityOfEcliptic(JD);
    epsilon = CT.d2R(epsilon);
    SunLong = CT.d2R(SunLong);
    SunLongDash = CT.d2R(SunLongDash);
    K = CT.d2R(K);
    I = CT.d2R(I);
    theta = CT.d2R(theta);
    var x = Math.atan(-Math.cos(SunLong) * Math.tan(epsilon));
    var y = Math.atan(-Math.cos(SunLong - K) * Math.tan(I));
    var details = new CAAPhysicalSunDetails();
    details.p = CT.r2D(x + y);
    details.b0 = CT.r2D(Math.asin(Math.sin(SunLong - K) * Math.sin(I)));
    var eta = Math.atan(Math.tan(SunLong - K) * Math.cos(I));
    details.l0 = CT.m360(CT.r2D(eta - theta));
    return details;
};

CAAPhysicalSun.timeOfStartOfRotation = function (C) {
    var JED = 2398140.227 + 27.2752316 * C;
    var M = CT.m360(281.96 + 26.882476 * C);
    M = CT.d2R(M);
    JED += (0.1454 * Math.sin(M) - 0.0085 * Math.sin(2 * M) - 0.0141 * Math.cos(2 * M));
    return JED;
};

var CAAPhysicalSun$ = {};

registerType("CAAPhysicalSun", [CAAPhysicalSun, CAAPhysicalSun$, null]);
