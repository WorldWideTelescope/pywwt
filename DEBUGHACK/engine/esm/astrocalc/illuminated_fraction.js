// Originally `AAILLUMINATEDFRACTION.CPP`
// "Purpose: Implementation for the algorithms for a planet's Phase Angle, Illuminated Fraction and Magnitude"
// Last update of original: PJN / 21-01-2005
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
import { Util } from "../baseutil.js";
import { CT } from "./coordinate_transformation.js";


// IFR

export function IFR() { }

IFR.phaseAngle = function (r, R, Delta) {
    return CT.m360(CT.r2D(Math.acos((r * r + Delta * Delta - R * R) / (2 * r * Delta))));
};

IFR.phaseAngle2 = function (R, R0, B, L, L0, Delta) {
    B = CT.d2R(B);
    L = CT.d2R(L);
    L0 = CT.d2R(L0);
    return CT.m360(CT.r2D(Math.acos((R - R0 * Math.cos(B) * Math.cos(L - L0)) / Delta)));
};

IFR.phaseAngleRectangular = function (x, y, z, B, L, Delta) {
    B = CT.d2R(B);
    L = CT.d2R(L);
    var cosB = Math.cos(B);
    return CT.m360(CT.r2D(Math.acos((x * cosB * Math.cos(L) + y * cosB * Math.sin(L) + z * Math.sin(B)) / Delta)));
};

IFR.illuminatedFraction = function (PhaseAngle) {
    PhaseAngle = CT.d2R(PhaseAngle);
    return (1 + Math.cos(PhaseAngle)) / 2;
};

IFR.illuminatedFraction2 = function (r, R, Delta) {
    return (((r + Delta) * (r + Delta) - R * R) / (4 * r * Delta));
};

IFR.mercuryMagnitudeMuller = function (r, Delta, i) {
    var I_50 = i - 50;
    return 1.16 + 5 * Util.log10(r * Delta) + 0.02838 * I_50 + 0.0001023 * I_50 * I_50;
};

IFR.venusMagnitudeMuller = function (r, Delta, i) {
    return -4 + 5 * Util.log10(r * Delta) + 0.01322 * i + 4.247E-07 * i * i * i;
};

IFR.marsMagnitudeMuller = function (r, Delta, i) {
    return -1.3 + 5 * Util.log10(r * Delta) + 0.01486 * i;
};

IFR.jupiterMagnitudeMuller = function (r, Delta) {
    return -8.93 + 5 * Util.log10(r * Delta);
};

IFR.saturnMagnitudeMuller = function (r, Delta, DeltaU, B) {
    B = CT.d2R(B);
    var sinB = Math.sin(B);
    return -8.68 + 5 * Util.log10(r * Delta) + 0.044 * Math.abs(DeltaU) - 2.6 * Math.sin(Math.abs(B)) + 1.25 * sinB * sinB;
};

IFR.uranusMagnitudeMuller = function (r, Delta) {
    return -6.85 + 5 * Util.log10(r * Delta);
};

IFR.neptuneMagnitudeMuller = function (r, Delta) {
    return -7.05 + 5 * Util.log10(r * Delta);
};

IFR.mercuryMagnitudeAA = function (r, Delta, i) {
    var i2 = i * i;
    var i3 = i2 * i;
    return -0.42 + 5 * Util.log10(r * Delta) + 0.038 * i - 0.000273 * i2 + 2E-06 * i3;
};

IFR.venusMagnitudeAA = function (r, Delta, i) {
    var i2 = i * i;
    var i3 = i2 * i;
    return -4.4 + 5 * Util.log10(r * Delta) + 0.0009 * i + 0.000239 * i2 - 6.5E-07 * i3;
};

IFR.marsMagnitudeAA = function (r, Delta, i) {
    return -1.52 + 5 * Util.log10(r * Delta) + 0.016 * i;
};

IFR.jupiterMagnitudeAA = function (r, Delta, i) {
    return -9.4 + 5 * Util.log10(r * Delta) + 0.005 * i;
};

IFR.saturnMagnitudeAA = function (r, Delta, DeltaU, B) {
    B = CT.d2R(B);
    var sinB = Math.sin(B);
    return -8.88 + 5 * Util.log10(r * Delta) + 0.044 * Math.abs(DeltaU) - 2.6 * Math.sin(Math.abs(B)) + 1.25 * sinB * sinB;
};

IFR.uranusMagnitudeAA = function (r, Delta) {
    return -7.19 + 5 * Util.log10(r * Delta);
};

IFR.neptuneMagnitudeAA = function (r, Delta) {
    return -6.87 + 5 * Util.log10(r * Delta);
};

IFR.plutoMagnitudeAA = function (r, Delta) {
    return -1 + 5 * Util.log10(r * Delta);
};

var IFR$ = {};

registerType("IFR", [IFR, IFR$, null]);
