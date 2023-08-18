// Originally `AASIDEREAL.CPP`
// "Purpose: Implementation for the algorithms which obtain sidereal time"
// Last update of original: PJN / 28-01-2007
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
import { ss } from "../ss.js";
import { DT } from "./date.js";
import { CT } from "./coordinate_transformation.js";
import { CAANutation } from "./nutation.js";


// CAASidereal

export function CAASidereal() { }

CAASidereal.meanGreenwichSiderealTime = function (JD) {
    var date = new DT();
    date.setJD(JD, DT.afterPapalReformJD(JD));
    var D = date.get();
    var Year = ss.truncate(D[0]);
    var Month = ss.truncate(D[1]);
    var Day = ss.truncate(D[2]);
    var Hour = ss.truncate(D[3]);
    var Minute = ss.truncate(D[4]);
    var Second = D[5];
    date.set(Year, Month, Day, 0, 0, 0, date.inGregorianCalendar());
    var JDMidnight = date.julian();
    var T = (JDMidnight - 2451545) / 36525;
    var TSquared = T * T;
    var TCubed = TSquared * T;
    var Value = 100.46061837 + (36000.770053608 * T) + (0.000387933 * TSquared) - (TCubed / 38710000);
    Value += (((Hour * 15) + (Minute * 0.25) + (Second * 0.00416666666666667)) * 1.00273790935);
    Value = CT.d2H(Value);
    return CT.m24(Value);
};

CAASidereal.apparentGreenwichSiderealTime = function (JD) {
    var MeanObliquity = CAANutation.meanObliquityOfEcliptic(JD);
    var TrueObliquity = MeanObliquity + CAANutation.nutationInObliquity(JD) / 3600;
    var NutationInLongitude = CAANutation.nutationInLongitude(JD);
    var Value = CAASidereal.meanGreenwichSiderealTime(JD) + (NutationInLongitude * Math.cos(CT.d2R(TrueObliquity)) / 54000);
    return CT.m24(Value);
};

var CAASidereal$ = {};

registerType("CAASidereal", [CAASidereal, CAASidereal$, null]);
