// Originally `AAPARALLAX.CPP`
// "Purpose: Implementation for the algorithms which convert a geocentric set of coordinates to their topocentric equivalent"
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
import { COR, CT } from "./coordinate_transformation.js";
import { CAAGlobe } from "./globe.js";
import { CAASidereal } from "./sidereal.js";


// CAATopocentricEclipticDetails

export function CAATopocentricEclipticDetails() {
    this.lambda = 0;
    this.beta = 0;
    this.semidiameter = 0;
    this.lambda = 0;
    this.beta = 0;
    this.semidiameter = 0;
}

var CAATopocentricEclipticDetails$ = {};

registerType("CAATopocentricEclipticDetails", [CAATopocentricEclipticDetails, CAATopocentricEclipticDetails$, null]);


// Constants

const g_AAParallax_C1 = Math.sin(CT.d2R(CT.dmS2D(0, 0, 8.794)));


// CAAParallax

export function CAAParallax() { }

CAAParallax.equatorial2TopocentricDelta = function (Alpha, Delta, Distance, Longitude, Latitude, Height, JD) {
    var RhoSinThetaPrime = CAAGlobe.rhoSinThetaPrime(Latitude, Height);
    var RhoCosThetaPrime = CAAGlobe.rhoCosThetaPrime(Latitude, Height);
    var theta = CAASidereal.apparentGreenwichSiderealTime(JD);
    Delta = CT.d2R(Delta);
    var cosDelta = Math.cos(Delta);
    var pi = Math.asin(g_AAParallax_C1 / Distance);
    var H = CT.h2R(theta - Longitude / 15 - Alpha);
    var cosH = Math.cos(H);
    var sinH = Math.sin(H);
    var DeltaTopocentric = new COR();
    DeltaTopocentric.x = CT.r2H(-pi * RhoCosThetaPrime * sinH / cosDelta);
    DeltaTopocentric.y = CT.r2D(-pi * (RhoSinThetaPrime * cosDelta - RhoCosThetaPrime * cosH * Math.sin(Delta)));
    return DeltaTopocentric;
};

CAAParallax.equatorial2Topocentric = function (Alpha, Delta, Distance, Longitude, Latitude, Height, JD) {
    var RhoSinThetaPrime = CAAGlobe.rhoSinThetaPrime(Latitude, Height);
    var RhoCosThetaPrime = CAAGlobe.rhoCosThetaPrime(Latitude, Height);
    var theta = CAASidereal.apparentGreenwichSiderealTime(JD);
    Delta = CT.d2R(Delta);
    var cosDelta = Math.cos(Delta);
    var pi = Math.asin(g_AAParallax_C1 / Distance);
    var sinpi = Math.sin(pi);
    var H = CT.h2R(theta - Longitude / 15 - Alpha);
    var cosH = Math.cos(H);
    var sinH = Math.sin(H);
    var DeltaAlpha = Math.atan2(-RhoCosThetaPrime * sinpi * sinH, cosDelta - RhoCosThetaPrime * sinpi * cosH);
    var Topocentric = new COR();
    Topocentric.x = CT.m24(Alpha + CT.r2H(DeltaAlpha));
    Topocentric.y = CT.r2D(Math.atan2((Math.sin(Delta) - RhoSinThetaPrime * sinpi) * Math.cos(DeltaAlpha), cosDelta - RhoCosThetaPrime * sinpi * cosH));
    return Topocentric;
};

CAAParallax.ecliptic2Topocentric = function (Lambda, Beta, Semidiameter, Distance, Epsilon, Longitude, Latitude, Height, JD) {
    var S = CAAGlobe.rhoSinThetaPrime(Latitude, Height);
    var C = CAAGlobe.rhoCosThetaPrime(Latitude, Height);
    Lambda = CT.d2R(Lambda);
    Beta = CT.d2R(Beta);
    Epsilon = CT.d2R(Epsilon);
    Longitude = CT.d2R(Longitude);
    Latitude = CT.d2R(Latitude);
    Semidiameter = CT.d2R(Semidiameter);
    var sine = Math.sin(Epsilon);
    var cose = Math.cos(Epsilon);
    var cosBeta = Math.cos(Beta);
    var sinBeta = Math.sin(Beta);
    var theta = CAASidereal.apparentGreenwichSiderealTime(JD);
    theta = CT.h2R(theta);
    var sintheta = Math.sin(theta);
    var pi = Math.asin(g_AAParallax_C1 / Distance);
    var sinpi = Math.sin(pi);
    var N = Math.cos(Lambda) * cosBeta - C * sinpi * Math.cos(theta);
    var Topocentric = new CAATopocentricEclipticDetails();
    Topocentric.lambda = Math.atan2(Math.sin(Lambda) * cosBeta - sinpi * (S * sine + C * cose * sintheta), N);
    var cosTopocentricLambda = Math.cos(Topocentric.lambda);
    Topocentric.beta = Math.atan(cosTopocentricLambda * (sinBeta - sinpi * (S * cose - C * sine * sintheta)) / N);
    Topocentric.semidiameter = Math.asin(cosTopocentricLambda * Math.cos(Topocentric.beta) * Math.sin(Semidiameter) / N);
    Topocentric.semidiameter = CT.r2D(Topocentric.semidiameter);
    Topocentric.lambda = CT.m360(CT.r2D(Topocentric.lambda));
    Topocentric.beta = CT.r2D(Topocentric.beta);
    return Topocentric;
};

CAAParallax.parallaxToDistance = function (Parallax) {
    return g_AAParallax_C1 / Math.sin(CT.d2R(Parallax));
};

CAAParallax.distanceToParallax = function (Distance) {
    var pi = Math.asin(g_AAParallax_C1 / Distance);
    return CT.r2D(pi);
};

var CAAParallax$ = {};

registerType("CAAParallax", [CAAParallax, CAAParallax$, null]);
