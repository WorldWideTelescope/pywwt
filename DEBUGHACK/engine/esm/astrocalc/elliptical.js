// Originally `AAELLIPTICAL.CPP`
// "Purpose: Implementation for the algorithms for an elliptical orbit"
// Last update of original: PJN / 05-06-2006
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
import { C3D, CT } from "./coordinate_transformation.js";
import { CAAEarth } from "./earth.js";
import { CAAFK5 } from "./fk5.js";
import { CAANutation } from "./nutation.js";
import { CAASun } from "./sun.js";
import { CAAMercury } from "./mercury.js";
import { CAAVenus } from "./venus.js";
import { CAAMars } from "./mars.js";
import { CAAJupiter } from "./jupiter.js";
import { CAASaturn } from "./saturn.js";
import { CAAUranus } from "./uranus.js";
import { CAANeptune } from "./neptune.js";
import { CAAPluto } from "./pluto.js";
import { ABR } from "./aberration.js";
import { CAAKepler } from "./kepler.js";
import { Vector3d } from "../double3d.js";


// EOE - was CAAEllipticalObjectElements

export function EOE() {
    this.a = 0;
    this.e = 0;
    this.i = 0;
    this.w = 0;
    this.omega = 0;
    this.jdEquinox = 0;
    this.t = 0;
    this.n = 0;
    this.meanAnnomolyOut = 0;
    this.a = 0;
    this.e = 0;
    this.i = 0;
    this.w = 0;
    this.omega = 0;
    this.jdEquinox = 0;
    this.t = 0;
}

EOE._create = function (br) {
    var tmp = new EOE();
    tmp.a = br.readSingle();
    tmp.e = br.readSingle();
    tmp.i = br.readSingle();
    tmp.w = br.readSingle();
    tmp.omega = br.readSingle();
    tmp.jdEquinox = br.readSingle();
    tmp.t = br.readSingle();
    return tmp;
};

var EOE$ = {};

registerType("EOE", [EOE, EOE$, null]);


// EPD - was CAAEllipticalPlanetaryDetails

export function EPD() {
    this.apparentGeocentricLongitude = 0;
    this.apparentGeocentricLatitude = 0;
    this.apparentGeocentricDistance = 0;
    this.apparentLightTime = 0;
    this.apparentGeocentricRA = 0;
    this.apparentGeocentricDeclination = 0;
    this.apparentGeocentricLongitude = 0;
    this.apparentGeocentricLatitude = 0;
    this.apparentGeocentricDistance = 0;
    this.apparentLightTime = 0;
    this.apparentGeocentricRA = 0;
    this.apparentGeocentricDeclination = 0;
}

var EPD$ = {};

registerType("EPD", [EPD, EPD$, null]);


// EOD - was CAAEllipticalObjectDetails

export function EOD() {
    this.heliocentricRectangularEquatorial = new C3D();
    this.heliocentricRectangularEcliptical = new C3D();
    this.heliocentricEclipticLongitude = 0;
    this.heliocentricEclipticLatitude = 0;
    this.trueGeocentricRA = 0;
    this.trueGeocentricDeclination = 0;
    this.trueGeocentricDistance = 0;
    this.trueGeocentricLightTime = 0;
    this.astrometricGeocenticRA = 0;
    this.astrometricGeocentricDeclination = 0;
    this.astrometricGeocentricDistance = 0;
    this.astrometricGeocentricLightTime = 0;
    this.elongation = 0;
    this.phaseAngle = 0;
    this.heliocentricEclipticLongitude = 0;
    this.heliocentricEclipticLatitude = 0;
    this.trueGeocentricRA = 0;
    this.trueGeocentricDeclination = 0;
    this.trueGeocentricDistance = 0;
    this.trueGeocentricLightTime = 0;
    this.astrometricGeocenticRA = 0;
    this.astrometricGeocentricDeclination = 0;
    this.astrometricGeocentricDistance = 0;
    this.astrometricGeocentricLightTime = 0;
    this.elongation = 0;
    this.phaseAngle = 0;
}

var EOD$ = {};

registerType("EOD", [EOD, EOD$, null]);


// EO - was EllipticalObject

export var EO = {
    SUN: 0,
    MERCURY: 1,
    VENUS: 2,
    MARS: 3,
    JUPITER: 4,
    SATURN: 5,
    URANUS: 6,
    NEPTUNE: 7,
    PLUTO: 8
};

registerType("EO", EO);


// ELL - was CAAElliptical

export function ELL() { }

ELL.distanceToLightTime = function (Distance) {
    return Distance * 0.0057755183;
};

ELL.calculate = function (JD, oobject) {
    var details = new EPD();
    var JD0 = JD;
    var L0 = 0;
    var B0 = 0;
    var R0 = 0;
    var cosB0 = 0;
    if (!!oobject) {
        L0 = CAAEarth.eclipticLongitude(JD0);
        B0 = CAAEarth.eclipticLatitude(JD0);
        R0 = CAAEarth.radiusVector(JD0);
        L0 = CT.d2R(L0);
        B0 = CT.d2R(B0);
        cosB0 = Math.cos(B0);
    }
    var L = 0;
    var B = 0;
    var R = 0;
    var Lrad;
    var Brad;
    var cosB;
    var cosL;
    var x;
    var y;
    var z;
    var bRecalc = true;
    var bFirstRecalc = true;
    var LPrevious = 0;
    var BPrevious = 0;
    var RPrevious = 0;
    while (bRecalc) {
        switch (oobject) {
            case 0:
                L = CAASun.geometricEclipticLongitude(JD0);
                B = CAASun.geometricEclipticLatitude(JD0);
                R = CAAEarth.radiusVector(JD0);
                break;
            case 1:
                L = CAAMercury.eclipticLongitude(JD0);
                B = CAAMercury.eclipticLatitude(JD0);
                R = CAAMercury.radiusVector(JD0);
                break;
            case 2:
                L = CAAVenus.eclipticLongitude(JD0);
                B = CAAVenus.eclipticLatitude(JD0);
                R = CAAVenus.radiusVector(JD0);
                break;
            case 3:
                L = CAAMars.eclipticLongitude(JD0);
                B = CAAMars.eclipticLatitude(JD0);
                R = CAAMars.radiusVector(JD0);
                break;
            case 4:
                L = CAAJupiter.eclipticLongitude(JD0);
                B = CAAJupiter.eclipticLatitude(JD0);
                R = CAAJupiter.radiusVector(JD0);
                break;
            case 5:
                L = CAASaturn.eclipticLongitude(JD0);
                B = CAASaturn.eclipticLatitude(JD0);
                R = CAASaturn.radiusVector(JD0);
                break;
            case 6:
                L = CAAUranus.eclipticLongitude(JD0);
                B = CAAUranus.eclipticLatitude(JD0);
                R = CAAUranus.radiusVector(JD0);
                break;
            case 7:
                L = CAANeptune.eclipticLongitude(JD0);
                B = CAANeptune.eclipticLatitude(JD0);
                R = CAANeptune.radiusVector(JD0);
                break;
            case 8:
                L = CAAPluto.eclipticLongitude(JD0);
                B = CAAPluto.eclipticLatitude(JD0);
                R = CAAPluto.radiusVector(JD0);
                break;
            default:
                console.assert(false);
                break;
        }
        if (!bFirstRecalc) {
            bRecalc = ((Math.abs(L - LPrevious) > 1E-05) || (Math.abs(B - BPrevious) > 1E-05) || (Math.abs(R - RPrevious) > 1E-06));
            LPrevious = L;
            BPrevious = B;
            RPrevious = R;
        }
        else {
            bFirstRecalc = false;
        }
        if (bRecalc) {
            var distance = 0;
            if (!!oobject) {
                Lrad = CT.d2R(L);
                Brad = CT.d2R(B);
                cosB = Math.cos(Brad);
                cosL = Math.cos(Lrad);
                x = R * cosB * cosL - R0 * cosB0 * Math.cos(L0);
                y = R * cosB * Math.sin(Lrad) - R0 * cosB0 * Math.sin(L0);
                z = R * Math.sin(Brad) - R0 * Math.sin(B0);
                distance = Math.sqrt(x * x + y * y + z * z);
            }
            else {
                distance = R;
            }
            JD0 = JD - ELL.distanceToLightTime(distance);
        }
    }
    Lrad = CT.d2R(L);
    Brad = CT.d2R(B);
    cosB = Math.cos(Brad);
    cosL = Math.cos(Lrad);
    x = R * cosB * cosL - R0 * cosB0 * Math.cos(L0);
    y = R * cosB * Math.sin(Lrad) - R0 * cosB0 * Math.sin(L0);
    z = R * Math.sin(Brad) - R0 * Math.sin(B0);
    var x2 = x * x;
    var y2 = y * y;
    details.apparentGeocentricLatitude = CT.r2D(Math.atan2(z, Math.sqrt(x2 + y2)));
    details.apparentGeocentricDistance = Math.sqrt(x2 + y2 + z * z);
    details.apparentGeocentricLongitude = CT.m360(CT.r2D(Math.atan2(y, x)));
    details.apparentLightTime = ELL.distanceToLightTime(details.apparentGeocentricDistance);
    var Aberration = ABR.eclipticAberration(details.apparentGeocentricLongitude, details.apparentGeocentricLatitude, JD);
    details.apparentGeocentricLongitude += Aberration.x;
    details.apparentGeocentricLatitude += Aberration.y;
    var DeltaLong = CAAFK5.correctionInLongitude(details.apparentGeocentricLongitude, details.apparentGeocentricLatitude, JD);
    details.apparentGeocentricLatitude += CAAFK5.correctionInLatitude(details.apparentGeocentricLongitude, JD);
    details.apparentGeocentricLongitude += DeltaLong;
    var NutationInLongitude = CAANutation.nutationInLongitude(JD);
    var Epsilon = CAANutation.trueObliquityOfEcliptic(JD);
    details.apparentGeocentricLongitude += CT.dmS2D(0, 0, NutationInLongitude);
    var ApparentEqu = CT.ec2Eq(details.apparentGeocentricLongitude, details.apparentGeocentricLatitude, Epsilon);
    details.apparentGeocentricRA = ApparentEqu.x;
    details.apparentGeocentricDeclination = ApparentEqu.y;
    return details;
};

ELL.semiMajorAxisFromPerihelionDistance = function (q, e) {
    return q / (1 - e);
};

ELL.meanMotionFromSemiMajorAxis = function (a) {
    return 0.9856076686 / (a * Math.sqrt(a));
};

ELL.calculateRectangularJD = function (JD, elements) {
    var JD0 = JD;
    var omega = CT.d2R(elements.omega);
    var w = CT.d2R(elements.w);
    var i = CT.d2R(elements.i);
    var sinEpsilon = 0;
    var cosEpsilon = 1;
    var sinOmega = Math.sin(omega);
    var cosOmega = Math.cos(omega);
    var cosi = Math.cos(i);
    var sini = Math.sin(i);
    var F = cosOmega;
    var G = sinOmega * cosEpsilon;
    var H = sinOmega * sinEpsilon;
    var P = -sinOmega * cosi;
    var Q = cosOmega * cosi * cosEpsilon - sini * sinEpsilon;
    var R = cosOmega * cosi * sinEpsilon + sini * cosEpsilon;
    var a = Math.sqrt(F * F + P * P);
    var b = Math.sqrt(G * G + Q * Q);
    var c = Math.sqrt(H * H + R * R);
    var A = Math.atan2(F, P);
    var B = Math.atan2(G, Q);
    var C = Math.atan2(H, R);
    var M = elements.n * (JD0 - elements.t);
    elements.meanAnnomolyOut = M;
    var E = CAAKepler.calculate(M, elements.e);
    E = CT.d2R(E);
    var v = 2 * Math.atan(Math.sqrt((1 + elements.e) / (1 - elements.e)) * Math.tan(E / 2));
    var r = elements.a * (1 - elements.e * Math.cos(E));
    var x = r * a * Math.sin(A + w + v);
    var y = r * b * Math.sin(B + w + v);
    var z = r * c * Math.sin(C + w + v);
    return Vector3d.create(x, z, y);
};

ELL.calculateRectangular = function (elements, meanAnomoly) {
    var omega = CT.d2R(elements.omega);
    var w = CT.d2R(elements.w);
    var i = CT.d2R(elements.i);
    var sinEpsilon = 0;
    var cosEpsilon = 1;
    var sinOmega = Math.sin(omega);
    var cosOmega = Math.cos(omega);
    var cosi = Math.cos(i);
    var sini = Math.sin(i);
    var F = cosOmega;
    var G = sinOmega * cosEpsilon;
    var H = sinOmega * sinEpsilon;
    var P = -sinOmega * cosi;
    var Q = cosOmega * cosi * cosEpsilon - sini * sinEpsilon;
    var R = cosOmega * cosi * sinEpsilon + sini * cosEpsilon;
    var a = Math.sqrt(F * F + P * P);
    var b = Math.sqrt(G * G + Q * Q);
    var c = Math.sqrt(H * H + R * R);
    var A = Math.atan2(F, P);
    var B = Math.atan2(G, Q);
    var C = Math.atan2(H, R);
    var n = elements.n;
    var M = meanAnomoly;
    var E = CAAKepler.calculate(M, elements.e);
    E = CT.d2R(E);
    var v = 2 * Math.atan(Math.sqrt((1 + elements.e) / (1 - elements.e)) * Math.tan(E / 2));
    var r = elements.a * (1 - elements.e * Math.cos(E));
    var x = r * a * Math.sin(A + w + v);
    var y = r * b * Math.sin(B + w + v);
    var z = r * c * Math.sin(C + w + v);
    return Vector3d.create(x, z, y);
};

ELL.calculateElements = function (JD, elements) {
    var Epsilon = CAANutation.meanObliquityOfEcliptic(elements.jdEquinox);
    var JD0 = JD;
    var details = new EOD();
    Epsilon = CT.d2R(Epsilon);
    var omega = CT.d2R(elements.omega);
    var w = CT.d2R(elements.w);
    var i = CT.d2R(elements.i);
    var sinEpsilon = Math.sin(Epsilon);
    var cosEpsilon = Math.cos(Epsilon);
    var sinOmega = Math.sin(omega);
    var cosOmega = Math.cos(omega);
    var cosi = Math.cos(i);
    var sini = Math.sin(i);
    var F = cosOmega;
    var G = sinOmega * cosEpsilon;
    var H = sinOmega * sinEpsilon;
    var P = -sinOmega * cosi;
    var Q = cosOmega * cosi * cosEpsilon - sini * sinEpsilon;
    var R = cosOmega * cosi * sinEpsilon + sini * cosEpsilon;
    var a = Math.sqrt(F * F + P * P);
    var b = Math.sqrt(G * G + Q * Q);
    var c = Math.sqrt(H * H + R * R);
    var A = Math.atan2(F, P);
    var B = Math.atan2(G, Q);
    var C = Math.atan2(H, R);
    var n = ELL.meanMotionFromSemiMajorAxis(elements.a);
    var SunCoord = CAASun.equatorialRectangularCoordinatesAnyEquinox(JD, elements.jdEquinox);
    for (var j = 0; j < 2; j++) {
        var M = n * (JD0 - elements.t);
        var E = CAAKepler.calculate(M, elements.e);
        E = CT.d2R(E);
        var v = 2 * Math.atan(Math.sqrt((1 + elements.e) / (1 - elements.e)) * Math.tan(E / 2));
        var r = elements.a * (1 - elements.e * Math.cos(E));
        var x = r * a * Math.sin(A + w + v);
        var y = r * b * Math.sin(B + w + v);
        var z = r * c * Math.sin(C + w + v);
        if (!j) {
            details.heliocentricRectangularEquatorial.x = x;
            details.heliocentricRectangularEquatorial.y = y;
            details.heliocentricRectangularEquatorial.z = z;
            var u = omega + v;
            var cosu = Math.cos(u);
            var sinu = Math.sin(u);
            details.heliocentricRectangularEcliptical.x = r * (cosOmega * cosu - sinOmega * sinu * cosi);
            details.heliocentricRectangularEcliptical.y = r * (sinOmega * cosu + cosOmega * sinu * cosi);
            details.heliocentricRectangularEcliptical.z = r * sini * sinu;
            details.heliocentricEclipticLongitude = Math.atan2(y, x);
            details.heliocentricEclipticLongitude = CT.m24(CT.r2D(details.heliocentricEclipticLongitude) / 15);
            details.heliocentricEclipticLatitude = Math.asin(z / r);
            details.heliocentricEclipticLatitude = CT.r2D(details.heliocentricEclipticLatitude);
        }
        var psi = SunCoord.x + x;
        var nu = SunCoord.y + y;
        var sigma = SunCoord.z + z;
        var Alpha = Math.atan2(nu, psi);
        Alpha = CT.r2D(Alpha);
        var Delta = Math.atan2(sigma, Math.sqrt(psi * psi + nu * nu));
        Delta = CT.r2D(Delta);
        var Distance = Math.sqrt(psi * psi + nu * nu + sigma * sigma);
        if (!j) {
            details.trueGeocentricRA = CT.m24(Alpha / 15);
            details.trueGeocentricDeclination = Delta;
            details.trueGeocentricDistance = Distance;
            details.trueGeocentricLightTime = ELL.distanceToLightTime(Distance);
        }
        else {
            details.astrometricGeocenticRA = CT.m24(Alpha / 15);
            details.astrometricGeocentricDeclination = Delta;
            details.astrometricGeocentricDistance = Distance;
            details.astrometricGeocentricLightTime = ELL.distanceToLightTime(Distance);
            var RES = Math.sqrt(SunCoord.x * SunCoord.x + SunCoord.y * SunCoord.y + SunCoord.z * SunCoord.z);
            details.elongation = Math.acos((RES * RES + Distance * Distance - r * r) / (2 * RES * Distance));
            details.elongation = CT.r2D(details.elongation);
            details.phaseAngle = Math.acos((r * r + Distance * Distance - RES * RES) / (2 * r * Distance));
            details.phaseAngle = CT.r2D(details.phaseAngle);
        }
        if (!j) {
            JD0 = JD - details.trueGeocentricLightTime;
        }
    }
    return details;
};

ELL.instantaneousVelocity = function (r, a) {
    return 42.1219 * Math.sqrt((1 / r) - (1 / (2 * a)));
};

ELL.velocityAtPerihelion = function (e, a) {
    return 29.7847 / Math.sqrt(a) * Math.sqrt((1 + e) / (1 - e));
};

ELL.velocityAtAphelion = function (e, a) {
    return 29.7847 / Math.sqrt(a) * Math.sqrt((1 - e) / (1 + e));
};

ELL.lengthOfEllipse = function (e, a) {
    var b = a * Math.sqrt(1 - e * e);
    return CT.PI() * (3 * (a + b) - Math.sqrt((a + 3 * b) * (3 * a + b)));
};

ELL.cometMagnitude = function (g, delta, k, r) {
    return g + 5 * Util.log10(delta) + k * Util.log10(r);
};

ELL.minorPlanetMagnitude = function (H, delta, G, r, PhaseAngle) {
    PhaseAngle = CT.d2R(PhaseAngle);
    var phi1 = Math.exp(-3.33 * Math.pow(Math.tan(PhaseAngle / 2), 0.63));
    var phi2 = Math.exp(-1.87 * Math.pow(Math.tan(PhaseAngle / 2), 1.22));
    return H + 5 * Util.log10(r * delta) - 2.5 * Util.log10((1 - G) * phi1 + G * phi2);
};

var ELL$ = {};

registerType("ELL", [ELL, ELL$, null]);
