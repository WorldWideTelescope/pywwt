// Originally `AAGLOBE.CPP`
// "Purpose: Implementation for the algorithms for the Earth's Globe"
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
import { CT } from "./coordinate_transformation.js";


// CAAGlobe

export function CAAGlobe() { }

CAAGlobe.rhoSinThetaPrime = function (GeographicalLatitude, Height) {
    GeographicalLatitude = CT.d2R(GeographicalLatitude);
    var U = Math.atan(0.99664719 * Math.tan(GeographicalLatitude));
    return 0.99664719 * Math.sin(U) + (Height / 6378149 * Math.sin(GeographicalLatitude));
};

CAAGlobe.rhoCosThetaPrime = function (GeographicalLatitude, Height) {
    GeographicalLatitude = CT.d2R(GeographicalLatitude);
    var U = Math.atan(0.99664719 * Math.tan(GeographicalLatitude));
    return Math.cos(U) + (Height / 6378149 * Math.cos(GeographicalLatitude));
};

CAAGlobe.radiusOfParallelOfLatitude = function (GeographicalLatitude) {
    GeographicalLatitude = CT.d2R(GeographicalLatitude);
    var sinGeo = Math.sin(GeographicalLatitude);
    return (6378.14 * Math.cos(GeographicalLatitude)) / Math.sqrt(1 - 0.0066943847614084 * sinGeo * sinGeo);
};

CAAGlobe.radiusOfCurvature = function (GeographicalLatitude) {
    GeographicalLatitude = CT.d2R(GeographicalLatitude);
    var sinGeo = Math.sin(GeographicalLatitude);
    return (6378.14 * (1 - 0.0066943847614084)) / Math.pow((1 - 0.0066943847614084 * sinGeo * sinGeo), 1.5);
};

CAAGlobe.distanceBetweenPoints = function (GeographicalLatitude1, GeographicalLongitude1, GeographicalLatitude2, GeographicalLongitude2) {
    GeographicalLatitude1 = CT.d2R(GeographicalLatitude1);
    GeographicalLatitude2 = CT.d2R(GeographicalLatitude2);
    GeographicalLongitude1 = CT.d2R(GeographicalLongitude1);
    GeographicalLongitude2 = CT.d2R(GeographicalLongitude2);
    var F = (GeographicalLatitude1 + GeographicalLatitude2) / 2;
    var G = (GeographicalLatitude1 - GeographicalLatitude2) / 2;
    var lambda = (GeographicalLongitude1 - GeographicalLongitude2) / 2;
    var sinG = Math.sin(G);
    var cosG = Math.cos(G);
    var cosF = Math.cos(F);
    var sinF = Math.sin(F);
    var sinLambda = Math.sin(lambda);
    var cosLambda = Math.cos(lambda);
    var S = (sinG * sinG * cosLambda * cosLambda) + (cosF * cosF * sinLambda * sinLambda);
    var C = (cosG * cosG * cosLambda * cosLambda) + (sinF * sinF * sinLambda * sinLambda);
    var w = Math.atan(Math.sqrt(S / C));
    var R = Math.sqrt(S * C) / w;
    var D = 2 * w * 6378.14;
    var Hprime = (3 * R - 1) / (2 * C);
    var Hprime2 = (3 * R + 1) / (2 * S);
    var f = 0.00335281317789691;
    return D * (1 + (f * Hprime * sinF * sinF * cosG * cosG) - (f * Hprime2 * cosF * cosF * sinG * sinG));
};

var CAAGlobe$ = {};

registerType("CAAGlobe", [CAAGlobe, CAAGlobe$, null]);
