// Originally `AASATURNRINGS.CPP`
// "Purpose: Implementation for the algorithms which calculate various parameters related to the Rings of Saturn"
// Last update of original: PJN / 08-01-2004
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
import { CAAFK5 } from "./fk5.js";
import { ELL } from "./elliptical.js";
import { CAANutation } from "./nutation.js";
import { CAAEarth } from "./earth.js";
import { CAASaturn } from "./saturn.js";

// CAASaturnRingDetails

export function CAASaturnRingDetails() {
    this.b = 0;
    this.bdash = 0;
    this.p = 0;
    this.a = 0;
    this.b = 0;
    this.deltaU = 0;
    this.b = 0;
    this.bdash = 0;
    this.p = 0;
    this.a = 0;
    this.b = 0;
    this.deltaU = 0;
}

var CAASaturnRingDetails$ = {};

registerType("CAASaturnRingDetails", [CAASaturnRingDetails, CAASaturnRingDetails$, null]);


// CAASaturnRings

export function CAASaturnRings() { }

CAASaturnRings.calculate = function (JD) {
    var details = new CAASaturnRingDetails();
    var T = (JD - 2451545) / 36525;
    var T2 = T * T;
    var i = 28.075216 - 0.012998 * T + 4E-06 * T2;
    var irad = CT.d2R(i);
    var omega = 169.50847 + 1.394681 * T + 0.000412 * T2;
    var omegarad = CT.d2R(omega);
    var l0 = CAAEarth.eclipticLongitude(JD);
    var b0 = CAAEarth.eclipticLatitude(JD);
    l0 += CAAFK5.correctionInLongitude(l0, b0, JD);
    var l0rad = CT.d2R(l0);
    b0 += CAAFK5.correctionInLatitude(l0, JD);
    var b0rad = CT.d2R(b0);
    var R = CAAEarth.radiusVector(JD);
    var DELTA = 9;
    var PreviousEarthLightTravelTime = 0;
    var EarthLightTravelTime = ELL.distanceToLightTime(DELTA);
    var JD1 = JD - EarthLightTravelTime;
    var bIterate = true;
    var x = 0;
    var y = 0;
    var z = 0;
    var l = 0;
    var b = 0;
    var r = 0;
    while (bIterate) {
        l = CAASaturn.eclipticLongitude(JD1);
        b = CAASaturn.eclipticLatitude(JD1);
        l += CAAFK5.correctionInLongitude(l, b, JD1);
        b += CAAFK5.correctionInLatitude(l, JD1);
        var lrad = CT.d2R(l);
        var brad = CT.d2R(b);
        r = CAASaturn.radiusVector(JD1);
        x = r * Math.cos(brad) * Math.cos(lrad) - R * Math.cos(l0rad);
        y = r * Math.cos(brad) * Math.sin(lrad) - R * Math.sin(l0rad);
        z = r * Math.sin(brad) - R * Math.sin(b0rad);
        DELTA = Math.sqrt(x * x + y * y + z * z);
        EarthLightTravelTime = ELL.distanceToLightTime(DELTA);
        bIterate = (Math.abs(EarthLightTravelTime - PreviousEarthLightTravelTime) > 2E-06);
        if (bIterate) {
            JD1 = JD - EarthLightTravelTime;
            PreviousEarthLightTravelTime = EarthLightTravelTime;
        }
    }
    var lambda = Math.atan2(y, x);
    var beta = Math.atan2(z, Math.sqrt(x * x + y * y));
    details.b = Math.asin(Math.sin(irad) * Math.cos(beta) * Math.sin(lambda - omegarad) - Math.cos(irad) * Math.sin(beta));
    details.a = 375.35 / DELTA;
    details.b = details.a * Math.sin(Math.abs(details.b));
    details.b = CT.r2D(details.b);
    var N = 113.6655 + 0.8771 * T;
    var Nrad = CT.d2R(N);
    var ldash = l - 0.01759 / r;
    var ldashrad = CT.d2R(ldash);
    var bdash = b - 0.000764 * Math.cos(ldashrad - Nrad) / r;
    var bdashrad = CT.d2R(bdash);
    details.bdash = CT.r2D(Math.asin(Math.sin(irad) * Math.cos(bdashrad) * Math.sin(ldashrad - omegarad) - Math.cos(irad) * Math.sin(bdashrad)));
    var U1 = Math.atan2(Math.sin(irad) * Math.sin(bdashrad) + Math.cos(irad) * Math.cos(bdashrad) * Math.sin(ldashrad - omegarad), Math.cos(bdashrad) * Math.cos(ldashrad - omegarad));
    var U2 = Math.atan2(Math.sin(irad) * Math.sin(beta) + Math.cos(irad) * Math.cos(beta) * Math.sin(lambda - omegarad), Math.cos(beta) * Math.cos(lambda - omegarad));
    details.deltaU = CT.r2D(Math.abs(U1 - U2));
    var Obliquity = CAANutation.trueObliquityOfEcliptic(JD);
    var NutationInLongitude = CAANutation.nutationInLongitude(JD);
    var lambda0 = omega - 90;
    var beta0 = 90 - i;
    lambda += CT.d2R(0.005693 * Math.cos(l0rad - lambda) / Math.cos(beta));
    beta += CT.d2R(0.005693 * Math.sin(l0rad - lambda) * Math.sin(beta));
    lambda = CT.r2D(lambda);
    lambda += NutationInLongitude / 3600;
    lambda = CT.m360(lambda);
    lambda0 += NutationInLongitude / 3600;
    lambda0 = CT.m360(lambda0);
    beta = CT.r2D(beta);
    var GeocentricEclipticSaturn = CT.ec2Eq(lambda, beta, Obliquity);
    var alpha = CT.h2R(GeocentricEclipticSaturn.x);
    var delta = CT.d2R(GeocentricEclipticSaturn.y);
    var GeocentricEclipticNorthPole = CT.ec2Eq(lambda0, beta0, Obliquity);
    var alpha0 = CT.h2R(GeocentricEclipticNorthPole.x);
    var delta0 = CT.d2R(GeocentricEclipticNorthPole.y);
    details.p = CT.r2D(Math.atan2(Math.cos(delta0) * Math.sin(alpha0 - alpha), Math.sin(delta0) * Math.cos(delta) - Math.cos(delta0) * Math.sin(delta) * Math.cos(alpha0 - alpha)));
    return details;
};

var CAASaturnRings$ = {};

registerType("CAASaturnRings", [CAASaturnRings, CAASaturnRings$, null]);
