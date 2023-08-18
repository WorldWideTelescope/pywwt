// Originally `AACOORDINATETRANSFORMATION.CPP`
// "Purpose: Implementation for the algorithms which convert between the various celestial coordinate systems"
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


// COR - was CAA2DCoordinate

export function COR() {
    this.x = 0;
    this.y = 0;
    this.x = 0;
    this.y = 0;
}

COR.create = function (x, y) {
    var item = new COR();
    item.x = x;
    item.y = y;
    return item;
};

var COR$ = {};

registerType("COR", [COR, COR$, null]);


// C3D - was CAA3DCoordinate

export function C3D() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
}

C3D.create = function (x, y, z) {
    var item = new C3D();
    item.x = x;
    item.y = y;
    item.z = z;
    return item;
};

var C3D$ = {};

registerType("C3D", [C3D, C3D$, null]);


// CT - was CAACoordinateTransformation

export function CT() {
}

CT.eq2Ec = function (Alpha, Delta, Epsilon) {
    Alpha = CT.h2R(Alpha);
    Delta = CT.d2R(Delta);
    Epsilon = CT.d2R(Epsilon);
    var Ecliptic = new COR();
    Ecliptic.x = CT.r2D(Math.atan2(Math.sin(Alpha) * Math.cos(Epsilon) + Math.tan(Delta) * Math.sin(Epsilon), Math.cos(Alpha)));
    if (Ecliptic.x < 0) {
        Ecliptic.x += 360;
    }
    Ecliptic.y = CT.r2D(Math.asin(Math.sin(Delta) * Math.cos(Epsilon) - Math.cos(Delta) * Math.sin(Epsilon) * Math.sin(Alpha)));
    return Ecliptic;
};

CT.ec2Eq = function (Lambda, Beta, Epsilon) {
    Lambda = CT.d2R(Lambda);
    Beta = CT.d2R(Beta);
    Epsilon = CT.d2R(Epsilon);
    var Equatorial = new COR();
    Equatorial.x = CT.r2H(Math.atan2(Math.sin(Lambda) * Math.cos(Epsilon) - Math.tan(Beta) * Math.sin(Epsilon), Math.cos(Lambda)));
    if (Equatorial.x < 0) {
        Equatorial.x += 24;
    }
    Equatorial.y = CT.r2D(Math.asin(Math.sin(Beta) * Math.cos(Epsilon) + Math.cos(Beta) * Math.sin(Epsilon) * Math.sin(Lambda)));
    return Equatorial;
};

CT.eq2H = function (LocalHourAngle, Delta, Latitude) {
    LocalHourAngle = CT.h2R(LocalHourAngle);
    Delta = CT.d2R(Delta);
    Latitude = CT.d2R(Latitude);
    var Horizontal = new COR();
    Horizontal.x = CT.r2D(Math.atan2(Math.sin(LocalHourAngle), Math.cos(LocalHourAngle) * Math.sin(Latitude) - Math.tan(Delta) * Math.cos(Latitude)));
    if (Horizontal.x < 0) {
        Horizontal.x += 360;
    }
    Horizontal.y = CT.r2D(Math.asin(Math.sin(Latitude) * Math.sin(Delta) + Math.cos(Latitude) * Math.cos(Delta) * Math.cos(LocalHourAngle)));
    return Horizontal;
};

CT.h2Eq = function (Azimuth, Altitude, Latitude) {
    Azimuth = CT.d2R(Azimuth);
    Altitude = CT.d2R(Altitude);
    Latitude = CT.d2R(Latitude);
    var Equatorial = new COR();
    Equatorial.x = CT.r2H(Math.atan2(Math.sin(Azimuth), Math.cos(Azimuth) * Math.sin(Latitude) + Math.tan(Altitude) * Math.cos(Latitude)));
    if (Equatorial.x < 0) {
        Equatorial.x += 24;
    }
    Equatorial.y = CT.r2D(Math.asin(Math.sin(Latitude) * Math.sin(Altitude) - Math.cos(Latitude) * Math.cos(Altitude) * Math.cos(Azimuth)));
    return Equatorial;
};

CT.eq2G = function (Alpha, Delta) {
    Alpha = 192.25 - CT.h2D(Alpha);
    Alpha = CT.d2R(Alpha);
    Delta = CT.d2R(Delta);
    var Galactic = new COR();
    Galactic.x = CT.r2D(Math.atan2(Math.sin(Alpha), Math.cos(Alpha) * Math.sin(CT.d2R(27.4)) - Math.tan(Delta) * Math.cos(CT.d2R(27.4))));
    Galactic.x = 303 - Galactic.x;
    if (Galactic.x >= 360) {
        Galactic.x -= 360;
    }
    Galactic.y = CT.r2D(Math.asin(Math.sin(Delta) * Math.sin(CT.d2R(27.4)) + Math.cos(Delta) * Math.cos(CT.d2R(27.4)) * Math.cos(Alpha)));
    return Galactic;
};

CT.g2Eq = function (l, b) {
    l -= 123;
    l = CT.d2R(l);
    b = CT.d2R(b);
    var Equatorial = new COR();
    Equatorial.x = CT.r2D(Math.atan2(Math.sin(l), Math.cos(l) * Math.sin(CT.d2R(27.4)) - Math.tan(b) * Math.cos(CT.d2R(27.4))));
    Equatorial.x += 12.25;
    if (Equatorial.x < 0) {
        Equatorial.x += 360;
    }
    Equatorial.x = CT.d2H(Equatorial.x);
    Equatorial.y = CT.r2D(Math.asin(Math.sin(b) * Math.sin(CT.d2R(27.4)) + Math.cos(b) * Math.cos(CT.d2R(27.4)) * Math.cos(l)));
    return Equatorial;
};

CT.d2R = function (Degrees) {
    return Degrees * 0.0174532925199433;
};

CT.r2D = function (Radians) {
    return Radians * 57.2957795130823;
};

CT.r2H = function (Radians) {
    return Radians * 3.81971863420549;
};

CT.h2R = function (Hours) {
    return Hours * 0.261799387799149;
};

CT.h2D = function (Hours) {
    return Hours * 15;
};

CT.d2H = function (Degrees) {
    return Degrees / 15;
};

CT.PI = function () {
    return 3.14159265358979;
};

CT.m360 = function (Degrees) {
    return Degrees - Math.floor(Degrees / 360) * 360;
};

CT.m24 = function (HourAngle) {
    return HourAngle - Math.floor(HourAngle / 24) * 24;
};

CT.dmS2D = function (Degrees, Minutes, Seconds) {
    return CT.dmS2Dp(Degrees, Minutes, Seconds, true);
};

CT.dmS2Dp = function (Degrees, Minutes, Seconds, bPositive) {
    if (!bPositive) {
        console.assert(Degrees >= 0);
        console.assert(Minutes >= 0);
        console.assert(Seconds >= 0);
    }
    if (bPositive) {
        return Degrees + Minutes / 60 + Seconds / 3600;
    }
    else {
        return -Degrees - Minutes / 60 - Seconds / 3600;
    }
};

var CT$ = {};

registerType("CT", [CT, CT$, null]);
