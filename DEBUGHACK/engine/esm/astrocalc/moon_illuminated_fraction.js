// Originally `AAMOONILLUMINATEDFRACTION.CPP`
// "Purpose: Implementation for the algorithms for the Moon's Elongation, Phase Angle and Illuminated Fraction"
// Last update of original: PJN / 26-01-2007
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


// MIFR

export function MIFR() {
}

MIFR.geocentricElongation = function (ObjectAlpha, ObjectDelta, SunAlpha, SunDelta) {
    ObjectAlpha = CT.d2R(ObjectAlpha * 15);
    SunAlpha = CT.d2R(SunAlpha * 15);
    ObjectDelta = CT.d2R(ObjectDelta);
    SunDelta = CT.d2R(SunDelta);
    return CT.r2D(Math.acos(Math.sin(SunDelta) * Math.sin(ObjectDelta) + Math.cos(SunDelta) * Math.cos(ObjectDelta) * Math.cos(SunAlpha - ObjectAlpha)));
};

MIFR.phaseAngle = function (GeocentricElongation, EarthObjectDistance, EarthSunDistance) {
    GeocentricElongation = CT.d2R(GeocentricElongation);
    return CT.m360(CT.r2D(Math.atan2(EarthSunDistance * Math.sin(GeocentricElongation), EarthObjectDistance - EarthSunDistance * Math.cos(GeocentricElongation))));
};

MIFR.illuminatedFraction = function (PhaseAngle) {
    PhaseAngle = CT.d2R(PhaseAngle);
    return (1 + Math.cos(PhaseAngle)) / 2;
};

MIFR.positionAngle = function (Alpha0, Delta0, Alpha, Delta) {
    Alpha0 = CT.h2R(Alpha0);
    Alpha = CT.h2R(Alpha);
    Delta0 = CT.d2R(Delta0);
    Delta = CT.d2R(Delta);
    return CT.m360(CT.r2D(Math.atan2(Math.cos(Delta0) * Math.sin(Alpha0 - Alpha), Math.sin(Delta0) * Math.cos(Delta) - Math.cos(Delta0) * Math.sin(Delta) * Math.cos(Alpha0 - Alpha))));
};

var MIFR$ = {};

registerType("MIFR", [MIFR, MIFR$, null]);
