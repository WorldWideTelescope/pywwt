// Originally `AASUN.CPP`
// "Purpose: Implementation for the algorithms which calculate the position of Earth"
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
import { C3D, CT } from "./coordinate_transformation.js";
import { CAAEarth } from "./earth.js";
import { CAAFK5 } from "./fk5.js";
import { CAANutation } from "./nutation.js";

// CAASun

export function CAASun() { }

CAASun.geometricEclipticLongitude = function (JD) {
    return CT.m360(CAAEarth.eclipticLongitude(JD) + 180);
};

CAASun.geometricEclipticLatitude = function (JD) {
    return -CAAEarth.eclipticLatitude(JD);
};

CAASun.geometricEclipticLongitudeJ2000 = function (JD) {
    return CT.m360(CAAEarth.eclipticLongitudeJ2000(JD) + 180);
};

CAASun.geometricEclipticLatitudeJ2000 = function (JD) {
    return -CAAEarth.eclipticLatitudeJ2000(JD);
};

CAASun.geometricFK5EclipticLongitude = function (JD) {
    var Longitude = CAASun.geometricEclipticLongitude(JD);
    var Latitude = CAASun.geometricEclipticLatitude(JD);
    Longitude += CAAFK5.correctionInLongitude(Longitude, Latitude, JD);
    return Longitude;
};

CAASun.geometricFK5EclipticLatitude = function (JD) {
    var Longitude = CAASun.geometricEclipticLongitude(JD);
    var Latitude = CAASun.geometricEclipticLatitude(JD);
    var SunLatCorrection = CAAFK5.correctionInLatitude(Longitude, JD);
    Latitude += SunLatCorrection;
    return Latitude;
};

CAASun.apparentEclipticLongitude = function (JD) {
    var Longitude = CAASun.geometricFK5EclipticLongitude(JD);
    Longitude += CT.dmS2D(0, 0, CAANutation.nutationInLongitude(JD));
    var R = CAAEarth.radiusVector(JD);
    Longitude -= CT.dmS2D(0, 0, 20.4898 / R);
    return Longitude;
};

CAASun.apparentEclipticLatitude = function (JD) {
    return CAASun.geometricFK5EclipticLatitude(JD);
};

CAASun.eclipticRectangularCoordinatesMeanEquinox = function (JD) {
    var Longitude = CT.d2R(CAASun.geometricFK5EclipticLongitude(JD));
    var Latitude = CT.d2R(CAASun.geometricFK5EclipticLatitude(JD));
    var R = CAAEarth.radiusVector(JD);
    var epsilon = CT.d2R(CAANutation.meanObliquityOfEcliptic(JD));
    var vvalue = new C3D();
    vvalue.x = R * Math.cos(Latitude) * Math.cos(Longitude);
    vvalue.y = R * (Math.cos(Latitude) * Math.sin(Longitude) * Math.cos(epsilon) - Math.sin(Latitude) * Math.sin(epsilon));
    vvalue.z = R * (Math.cos(Latitude) * Math.sin(Longitude) * Math.sin(epsilon) + Math.sin(Latitude) * Math.cos(epsilon));
    return vvalue;
};

CAASun.eclipticRectangularCoordinatesJ2000 = function (JD) {
    var Longitude = CAASun.geometricEclipticLongitudeJ2000(JD);
    Longitude = CT.d2R(Longitude);
    var Latitude = CAASun.geometricEclipticLatitudeJ2000(JD);
    Latitude = CT.d2R(Latitude);
    var R = CAAEarth.radiusVector(JD);
    var vvalue = new C3D();
    var coslatitude = Math.cos(Latitude);
    vvalue.x = R * coslatitude * Math.cos(Longitude);
    vvalue.y = R * coslatitude * Math.sin(Longitude);
    vvalue.z = R * Math.sin(Latitude);
    return vvalue;
};

CAASun.equatorialRectangularCoordinatesJ2000 = function (JD) {
    var vvalue = CAASun.eclipticRectangularCoordinatesJ2000(JD);
    vvalue = CAAFK5.convertVSOPToFK5J2000(vvalue);
    return vvalue;
};

CAASun.equatorialRectangularCoordinatesB1950 = function (JD) {
    var vvalue = CAASun.eclipticRectangularCoordinatesJ2000(JD);
    vvalue = CAAFK5.convertVSOPToFK5B1950(vvalue);
    return vvalue;
};

CAASun.equatorialRectangularCoordinatesAnyEquinox = function (JD, JDEquinox) {
    var vvalue = CAASun.equatorialRectangularCoordinatesJ2000(JD);
    vvalue = CAAFK5.convertVSOPToFK5AnyEquinox(vvalue, JDEquinox);
    return vvalue;
};

var CAASun$ = {};

registerType("CAASun", [CAASun, CAASun$, null]);
