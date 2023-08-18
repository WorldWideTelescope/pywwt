// Originally `AARISETRANSITSET.CPP`
// "Purpose: Implementation for the algorithms which obtain the Rise, Transit and Set times"
// Last update of original: PJN / 15-10-2004
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
import { DYT } from "./dynamical_time.js";
import { INTP } from "./interpolate.js";
import { CAASidereal } from "./sidereal.js";


// CAARiseTransitSetDetails

export function CAARiseTransitSetDetails() {
    this.bValid = false;
    this.rise = 0;
    this.transit = 0;
    this.set = 0;
    this.bValid = false;
    this.rise = 0;
    this.transit = 0;
    this.set = 0;
}

var CAARiseTransitSetDetails$ = {};

registerType("CAARiseTransitSetDetails", [CAARiseTransitSetDetails, CAARiseTransitSetDetails$, null]);


// CAARiseTransitSet

export function CAARiseTransitSet() { }

CAARiseTransitSet.rise = function (JD, Alpha1, Delta1, Alpha2, Delta2, Alpha3, Delta3, Longitude, Latitude, h0) {
    var details = new CAARiseTransitSetDetails();
    details.bValid = false;
    var theta0 = CAASidereal.apparentGreenwichSiderealTime(JD);
    theta0 *= 15;
    var deltaT = DYT.deltaT(JD);
    var Delta2Rad = CT.d2R(Delta2);
    var LatitudeRad = CT.d2R(Latitude);
    var h0Rad = CT.d2R(h0);
    var cosH0 = (Math.sin(h0Rad) - Math.sin(LatitudeRad) * Math.sin(Delta2Rad)) / (Math.cos(LatitudeRad) * Math.cos(Delta2Rad));
    if ((cosH0 > 1) || (cosH0 < -1)) {
        return details;
    }
    var H0 = Math.acos(cosH0);
    H0 = CT.r2D(H0);
    var M0 = (Alpha2 * 15 + Longitude - theta0) / 360;
    var M1 = M0 - H0 / 360;
    var M2 = M0 + H0 / 360;
    if (M0 > 1) {
        M0 -= 1;
    }
    else if (M0 < 0) {
        M0 += 1;
    }
    if (M1 > 1) {
        M1 -= 1;
    }
    else if (M1 < 0) {
        M1 += 1;
    }
    if (M2 > 1) {
        M2 -= 1;
    }
    else if (M2 < 0) {
        M2 += 1;
    }
    for (var i = 0; i < 2; i++) {
        var theta1 = theta0 + 360.985647 * M1;
        theta1 = CT.m360(theta1);
        var n = M1 + deltaT / 86400;
        var Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
        var Delta = INTP.interpolate(n, Delta1, Delta2, Delta3);
        var H = theta1 - Longitude - Alpha * 15;
        var Horizontal = CT.eq2H(H / 15, Delta, Latitude);
        var DeltaM = (Horizontal.y - h0) / (360 * Math.cos(CT.d2R(Delta)) * Math.cos(LatitudeRad) * Math.sin(CT.d2R(H)));
        M1 += DeltaM;
        theta1 = theta0 + 360.985647 * M0;
        theta1 = CT.m360(theta1);
        n = M0 + deltaT / 86400;
        Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
        H = theta1 - Longitude - Alpha * 15;
        if (H < -180) {
            H += 360;
        }
        DeltaM = -H / 360;
        M0 += DeltaM;
        theta1 = theta0 + 360.985647 * M2;
        theta1 = CT.m360(theta1);
        n = M2 + deltaT / 86400;
        Alpha = INTP.interpolate(n, Alpha1, Alpha2, Alpha3);
        Delta = INTP.interpolate(n, Delta1, Delta2, Delta3);
        H = theta1 - Longitude - Alpha * 15;
        Horizontal = CT.eq2H(H / 15, Delta, Latitude);
        DeltaM = (Horizontal.y - h0) / (360 * Math.cos(CT.d2R(Delta)) * Math.cos(LatitudeRad) * Math.sin(CT.d2R(H)));
        M2 += DeltaM;
    }
    details.bValid = true;
    details.rise = M1 * 24;
    details.set = M2 * 24;
    details.transit = M0 * 24;
    return details;
};

var CAARiseTransitSet$ = {};

registerType("CAARiseTransitSet", [CAARiseTransitSet, CAARiseTransitSet$, null]);
