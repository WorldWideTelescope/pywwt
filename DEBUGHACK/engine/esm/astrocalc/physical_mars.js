// Originally `AAPHYSICALMARS.CPP`
// "Purpose: Implementation for the algorithms which obtain the physical parameters of Mars"
// Last update of original: PJN / 04-01-2004
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
import { CAAEarth } from "./earth.js";
import { CAAMars } from "./mars.js";
import { ELL } from "./elliptical.js";
import { IFR } from "./illuminated_fraction.js";
import { MIFR } from "./moon_illuminated_fraction.js";

// CAAPhysicalMarsDetails

export function CAAPhysicalMarsDetails() {
    this.DE = 0;
    this.DS = 0;
    this.w = 0;
    this.p = 0;
    this.x = 0;
    this.k = 0;
    this.q = 0;
    this.d = 0;
    this.DE = 0;
    this.DS = 0;
    this.w = 0;
    this.p = 0;
    this.x = 0;
    this.k = 0;
    this.q = 0;
    this.d = 0;
}

var CAAPhysicalMarsDetails$ = {};

registerType("CAAPhysicalMarsDetails", [CAAPhysicalMarsDetails, CAAPhysicalMarsDetails$, null]);


// CAAPhysicalMars

export function CAAPhysicalMars() { }

CAAPhysicalMars.calculate = function (JD) {
    var details = new CAAPhysicalMarsDetails();
    var T = (JD - 2451545) / 36525;
    var Lambda0 = 352.9065 + 1.1733 * T;
    var Lambda0rad = CT.d2R(Lambda0);
    var Beta0 = 63.2818 - 0.00394 * T;
    var Beta0rad = CT.d2R(Beta0);
    var l0 = CAAEarth.eclipticLongitude(JD);
    var l0rad = CT.d2R(l0);
    var b0 = CAAEarth.eclipticLatitude(JD);
    var b0rad = CT.d2R(b0);
    var R = CAAEarth.radiusVector(JD);
    var PreviousLightTravelTime = 0;
    var LightTravelTime = 0;
    var x = 0;
    var y = 0;
    var z = 0;
    var bIterate = true;
    var DELTA = 0;
    var l = 0;
    var lrad = 0;
    var b = 0;
    var brad = 0;
    var r = 0;
    while (bIterate) {
        var JD2 = JD - LightTravelTime;
        l = CAAMars.eclipticLongitude(JD2);
        lrad = CT.d2R(l);
        b = CAAMars.eclipticLatitude(JD2);
        brad = CT.d2R(b);
        r = CAAMars.radiusVector(JD2);
        x = r * Math.cos(brad) * Math.cos(lrad) - R * Math.cos(l0rad);
        y = r * Math.cos(brad) * Math.sin(lrad) - R * Math.sin(l0rad);
        z = r * Math.sin(brad) - R * Math.sin(b0rad);
        DELTA = Math.sqrt(x * x + y * y + z * z);
        LightTravelTime = ELL.distanceToLightTime(DELTA);
        bIterate = (Math.abs(LightTravelTime - PreviousLightTravelTime) > 2E-06);
        if (bIterate) {
            PreviousLightTravelTime = LightTravelTime;
        }
    }
    var lambdarad = Math.atan2(y, x);
    var lambda = CT.r2D(lambdarad);
    var betarad = Math.atan2(z, Math.sqrt(x * x + y * y));
    var beta = CT.r2D(betarad);
    details.DE = CT.r2D(Math.asin(-Math.sin(Beta0rad) * Math.sin(betarad) - Math.cos(Beta0rad) * Math.cos(betarad) * Math.cos(Lambda0rad - lambdarad)));
    var N = 49.5581 + 0.7721 * T;
    var Nrad = CT.d2R(N);
    var ldash = l - 0.00697 / r;
    var ldashrad = CT.d2R(ldash);
    var bdash = b - 0.000225 * (Math.cos(lrad - Nrad) / r);
    var bdashrad = CT.d2R(bdash);
    details.DS = CT.r2D(Math.asin(-Math.sin(Beta0rad) * Math.sin(bdashrad) - Math.cos(Beta0rad) * Math.cos(bdashrad) * Math.cos(Lambda0rad - ldashrad)));
    var W = CT.m360(11.504 + 350.89200025 * (JD - LightTravelTime - 2433282.5));
    var e0 = CAANutation.meanObliquityOfEcliptic(JD);
    var e0rad = CT.d2R(e0);
    var PoleEquatorial = CT.ec2Eq(Lambda0, Beta0, e0);
    var alpha0rad = CT.h2R(PoleEquatorial.x);
    var delta0rad = CT.d2R(PoleEquatorial.y);
    var u = y * Math.cos(e0rad) - z * Math.sin(e0rad);
    var v = y * Math.sin(e0rad) + z * Math.cos(e0rad);
    var alpharad = Math.atan2(u, x);
    var alpha = CT.r2H(alpharad);
    var deltarad = Math.atan2(v, Math.sqrt(x * x + u * u));
    var delta = CT.r2D(deltarad);
    var xi = Math.atan2(Math.sin(delta0rad) * Math.cos(deltarad) * Math.cos(alpha0rad - alpharad) - Math.sin(deltarad) * Math.cos(delta0rad), Math.cos(deltarad) * Math.sin(alpha0rad - alpharad));
    details.w = CT.m360(W - CT.r2D(xi));
    var NutationInLongitude = CAANutation.nutationInLongitude(JD);
    var NutationInObliquity = CAANutation.nutationInObliquity(JD);
    lambda += 0.005693 * Math.cos(l0rad - lambdarad) / Math.cos(betarad);
    beta += 0.005693 * Math.sin(l0rad - lambdarad) * Math.sin(betarad);
    Lambda0 += NutationInLongitude / 3600;
    Lambda0rad = CT.d2R(Lambda0);
    lambda += NutationInLongitude / 3600;
    lambdarad = CT.d2R(lambda);
    e0 += NutationInObliquity / 3600;
    e0rad = CT.d2R(e0rad);
    var ApparentPoleEquatorial = CT.ec2Eq(Lambda0, Beta0, e0);
    var alpha0dash = CT.h2R(ApparentPoleEquatorial.x);
    var delta0dash = CT.d2R(ApparentPoleEquatorial.y);
    var ApparentMars = CT.ec2Eq(lambda, beta, e0);
    var alphadash = CT.h2R(ApparentMars.x);
    var deltadash = CT.d2R(ApparentMars.y);
    details.p = CT.m360(CT.r2D(Math.atan2(Math.cos(delta0dash) * Math.sin(alpha0dash - alphadash), Math.sin(delta0dash) * Math.cos(deltadash) - Math.cos(delta0dash) * Math.sin(deltadash) * Math.cos(alpha0dash - alphadash))));
    var SunLambda = CAASun.geometricEclipticLongitude(JD);
    var SunBeta = CAASun.geometricEclipticLatitude(JD);
    var SunEquatorial = CT.ec2Eq(SunLambda, SunBeta, e0);
    details.x = MIFR.positionAngle(SunEquatorial.x, SunEquatorial.y, alpha, delta);
    details.d = 9.36 / DELTA;
    details.k = IFR.illuminatedFraction2(r, R, DELTA);
    details.q = (1 - details.k) * details.d;
    return details;
};

var CAAPhysicalMars$ = {};

registerType("CAAPhysicalMars", [CAAPhysicalMars, CAAPhysicalMars$, null]);
