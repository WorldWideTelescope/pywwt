// Originally `AAGALILEANMOONS.CPP`
// "Purpose: Implementation for the algorithms which obtain the positions of the 4 great moons of Jupiter"
// Last update of original: PJN / 06-01-2004
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
import { CAASun } from "./sun.js";
import { CAAEarth } from "./earth.js";
import { CAAJupiter } from "./jupiter.js";
import { ELL } from "./elliptical.js";
import { EPO } from "./elements_planetary_orbit.js";


// GMD - was CAAGalileanMoonDetail

export function GMD() {
    this.meanLongitude = 0;
    this.trueLongitude = 0;
    this.tropicalLongitude = 0;
    this.equatorialLatitude = 0;
    this.r = 0;
    this.eclipticRectangularCoordinates = new C3D();
    this.trueRectangularCoordinates = new C3D();
    this.apparentRectangularCoordinates = new C3D();
    this.bInTransit = false;
    this.bInOccultation = false;
    this.bInEclipse = false;
    this.bInShadowTransit = false;
    this.apparentShadowRectangularCoordinates = new C3D();
    this.meanLongitude = 0;
    this.trueLongitude = 0;
    this.tropicalLongitude = 0;
    this.equatorialLatitude = 0;
    this.r = 0;
    this.bInTransit = false;
    this.bInOccultation = false;
    this.bInEclipse = false;
    this.bInShadowTransit = false;
}

var GMD$ = {};

registerType("GMD", [GMD, GMD$, null]);


// GMDS - was CAAGalileanMoonsDetails

export function GMDS() {
    this.satellite1 = new GMD();
    this.satellite2 = new GMD();
    this.satellite3 = new GMD();
    this.satellite4 = new GMD();
}

var GMDS$ = {};

registerType("GMDS", [GMDS, GMDS$, null]);


// GM - was CAAGalileanMoons

export function GM() { }

GM.calculate = function (JD) {
    var sunlong = CAASun.geometricEclipticLongitude(JD);
    var sunlongrad = CT.d2R(sunlong);
    var beta = CAASun.geometricEclipticLatitude(JD);
    var betarad = CT.d2R(beta);
    var R = CAAEarth.radiusVector(JD);
    var DELTA = 5;
    var PreviousEarthLightTravelTime = 0;
    var EarthLightTravelTime = ELL.distanceToLightTime(DELTA);
    var JD1 = JD - EarthLightTravelTime;
    var bIterate = true;
    var x = 0;
    var y = 0;
    var z = 0;
    var l = 0;
    var lrad = 0;
    var b = 0;
    var brad = 0;
    var r = 0;
    while (bIterate) {
        l = CAAJupiter.eclipticLongitude(JD1);
        lrad = CT.d2R(l);
        b = CAAJupiter.eclipticLatitude(JD1);
        brad = CT.d2R(b);
        r = CAAJupiter.radiusVector(JD1);
        x = r * Math.cos(brad) * Math.cos(lrad) + R * Math.cos(sunlongrad);
        y = r * Math.cos(brad) * Math.sin(lrad) + R * Math.sin(sunlongrad);
        z = r * Math.sin(brad) + R * Math.sin(betarad);
        DELTA = Math.sqrt(x * x + y * y + z * z);
        EarthLightTravelTime = ELL.distanceToLightTime(DELTA);
        bIterate = (Math.abs(EarthLightTravelTime - PreviousEarthLightTravelTime) > 2E-06);
        if (bIterate) {
            JD1 = JD - EarthLightTravelTime;
            PreviousEarthLightTravelTime = EarthLightTravelTime;
        }
    }
    var details1 = GM.calculateHelper(JD, sunlongrad, betarad, R);
    GM.fillInPhenomenaDetails(details1.satellite1);
    GM.fillInPhenomenaDetails(details1.satellite2);
    GM.fillInPhenomenaDetails(details1.satellite3);
    GM.fillInPhenomenaDetails(details1.satellite4);
    JD1 = JD - EarthLightTravelTime;
    l = CAAJupiter.eclipticLongitude(JD1);
    lrad = CT.d2R(l);
    b = CAAJupiter.eclipticLatitude(JD1);
    brad = CT.d2R(b);
    r = CAAJupiter.radiusVector(JD1);
    x = r * Math.cos(brad) * Math.cos(lrad);
    y = r * Math.cos(brad) * Math.sin(lrad);
    z = r * Math.sin(brad);
    DELTA = Math.sqrt(x * x + y * y + z * z);
    var SunLightTravelTime = ELL.distanceToLightTime(DELTA);
    var details2 = GM.calculateHelper(JD + SunLightTravelTime - EarthLightTravelTime, sunlongrad, betarad, 0);
    GM.fillInPhenomenaDetails(details2.satellite1);
    GM.fillInPhenomenaDetails(details2.satellite2);
    GM.fillInPhenomenaDetails(details2.satellite3);
    GM.fillInPhenomenaDetails(details2.satellite4);
    details1.satellite1.bInEclipse = details2.satellite1.bInOccultation;
    details1.satellite2.bInEclipse = details2.satellite2.bInOccultation;
    details1.satellite3.bInEclipse = details2.satellite3.bInOccultation;
    details1.satellite4.bInEclipse = details2.satellite4.bInOccultation;
    details1.satellite1.bInShadowTransit = details2.satellite1.bInTransit;
    details1.satellite2.bInShadowTransit = details2.satellite2.bInTransit;
    details1.satellite3.bInShadowTransit = details2.satellite3.bInTransit;
    details1.satellite4.bInShadowTransit = details2.satellite4.bInTransit;
    details1.satellite1.apparentShadowRectangularCoordinates = details2.satellite1.apparentRectangularCoordinates;
    details1.satellite2.apparentShadowRectangularCoordinates = details2.satellite2.apparentRectangularCoordinates;
    details1.satellite3.apparentShadowRectangularCoordinates = details2.satellite3.apparentRectangularCoordinates;
    details1.satellite4.apparentShadowRectangularCoordinates = details2.satellite4.apparentRectangularCoordinates;
    return details1;
};

GM.calculateHelper = function (JD, sunlongrad, betarad, R) {
    var details = new GMDS();
    var DELTA = 5;
    var PreviousLightTravelTime = 0;
    var LightTravelTime = ELL.distanceToLightTime(DELTA);
    var x = 0;
    var y = 0;
    var z = 0;
    var l = 0;
    var lrad = 0;
    var b = 0;
    var brad = 0;
    var r = 0;
    var JD1 = JD - LightTravelTime;
    var bIterate = true;
    while (bIterate) {
        l = CAAJupiter.eclipticLongitude(JD1);
        lrad = CT.d2R(l);
        b = CAAJupiter.eclipticLatitude(JD1);
        brad = CT.d2R(b);
        r = CAAJupiter.radiusVector(JD1);
        x = r * Math.cos(brad) * Math.cos(lrad) + R * Math.cos(sunlongrad);
        y = r * Math.cos(brad) * Math.sin(lrad) + R * Math.sin(sunlongrad);
        z = r * Math.sin(brad) + R * Math.sin(betarad);
        DELTA = Math.sqrt(x * x + y * y + z * z);
        LightTravelTime = ELL.distanceToLightTime(DELTA);
        bIterate = (Math.abs(LightTravelTime - PreviousLightTravelTime) > 2E-06);
        if (bIterate) {
            JD1 = JD - LightTravelTime;
            PreviousLightTravelTime = LightTravelTime;
        }
    }
    var lambda0 = Math.atan2(y, x);
    var beta0 = Math.atan(z / Math.sqrt(x * x + y * y));
    var t = JD - 2443000.5 - LightTravelTime;
    var l1 = 106.07719 + 203.48895579 * t;
    var l1rad = CT.d2R(l1);
    var l2 = 175.73161 + 101.374724735 * t;
    var l2rad = CT.d2R(l2);
    var l3 = 120.55883 + 50.317609207 * t;
    var l3rad = CT.d2R(l3);
    var l4 = 84.44459 + 21.571071177 * t;
    var l4rad = CT.d2R(l4);
    var pi1 = CT.d2R(CT.m360(97.0881 + 0.16138586 * t));
    var pi2 = CT.d2R(CT.m360(154.8663 + 0.04726307 * t));
    var pi3 = CT.d2R(CT.m360(188.184 + 0.00712734 * t));
    var pi4 = CT.d2R(CT.m360(335.2868 + 0.00184 * t));
    var w1 = 312.3346 - 0.13279386 * t;
    var w1rad = CT.d2R(w1);
    var w2 = 100.4411 - 0.03263064 * t;
    var w2rad = CT.d2R(w2);
    var w3 = 119.1942 - 0.00717703 * t;
    var w3rad = CT.d2R(w3);
    var w4 = 322.6186 - 0.00175934 * t;
    var w4rad = CT.d2R(w4);
    var GAMMA = 0.33033 * Math.sin(CT.d2R(163.679 + 0.0010512 * t)) + 0.03439 * Math.sin(CT.d2R(34.486 - 0.0161731 * t));
    var philambda = CT.d2R(199.6766 + 0.1737919 * t);
    var psi = CT.d2R(316.5182 - 2.08E-06 * t);
    var G = CT.d2R(30.23756 + 0.0830925701 * t + GAMMA);
    var Gdash = CT.d2R(31.97853 + 0.0334597339 * t);
    var PI = CT.d2R(13.469942);
    var Sigma1 = 0.47259 * Math.sin(2 * (l1rad - l2rad)) + -0.03478 * Math.sin(pi3 - pi4) + 0.01081 * Math.sin(l2rad - 2 * l3rad + pi3) + 0.00738 * Math.sin(philambda) + 0.00713 * Math.sin(l2rad - 2 * l3rad + pi2) + -0.00674 * Math.sin(pi1 + pi3 - 2 * PI - 2 * G) + 0.00666 * Math.sin(l2rad - 2 * l3rad + pi4) + 0.00445 * Math.sin(l1rad - pi3) + -0.00354 * Math.sin(l1rad - l2rad) + -0.00317 * Math.sin(2 * psi - 2 * PI) + 0.00265 * Math.sin(l1rad - pi4) + -0.00186 * Math.sin(G) + 0.00162 * Math.sin(pi2 - pi3) + 0.00158 * Math.sin(4 * (l1rad - l2rad)) + -0.00155 * Math.sin(l1rad - l3rad) + -0.00138 * Math.sin(psi + w3rad - 2 * PI - 2 * G) + -0.00115 * Math.sin(2 * (l1rad - 2 * l2rad + w2rad)) + 0.00089 * Math.sin(pi2 - pi4) + 0.00085 * Math.sin(l1rad + pi3 - 2 * PI - 2 * G) + 0.00083 * Math.sin(w2rad - w3rad) + 0.00053 * Math.sin(psi - w2rad);
    var Sigma2 = 1.06476 * Math.sin(2 * (l2rad - l3rad)) + 0.04256 * Math.sin(l1rad - 2 * l2rad + pi3) + 0.03581 * Math.sin(l2rad - pi3) + 0.02395 * Math.sin(l1rad - 2 * l2rad + pi4) + 0.01984 * Math.sin(l2rad - pi4) + -0.01778 * Math.sin(philambda) + 0.01654 * Math.sin(l2rad - pi2) + 0.01334 * Math.sin(l2rad - 2 * l3rad + pi2) + 0.01294 * Math.sin(pi3 - pi4) + -0.01142 * Math.sin(l2rad - l3rad) + -0.01057 * Math.sin(G) + -0.00775 * Math.sin(2 * (psi - PI)) + 0.00524 * Math.sin(2 * (l1rad - l2rad)) + -0.0046 * Math.sin(l1rad - l3rad) + 0.00316 * Math.sin(psi - 2 * G + w3rad - 2 * PI) + -0.00203 * Math.sin(pi1 + pi3 - 2 * PI - 2 * G) + 0.00146 * Math.sin(psi - w3rad) + -0.00145 * Math.sin(2 * G) + 0.00125 * Math.sin(psi - w4rad) + -0.00115 * Math.sin(l1rad - 2 * l3rad + pi3) + -0.00094 * Math.sin(2 * (l2rad - w2rad)) + 0.00086 * Math.sin(2 * (l1rad - 2 * l2rad + w2rad)) + -0.00086 * Math.sin(5 * Gdash - 2 * G + CT.d2R(52.225)) + -0.00078 * Math.sin(l2rad - l4rad) + -0.00064 * Math.sin(3 * l3rad - 7 * l4rad + 4 * pi4) + 0.00064 * Math.sin(pi1 - pi4) + -0.00063 * Math.sin(l1rad - 2 * l3rad + pi4) + 0.00058 * Math.sin(w3rad - w4rad) + 0.00056 * Math.sin(2 * (psi - PI - G)) + 0.00056 * Math.sin(2 * (l2rad - l4rad)) + 0.00055 * Math.sin(2 * (l1rad - l3rad)) + 0.00052 * Math.sin(3 * l3rad - 7 * l4rad + pi3 + 3 * pi4) + -0.00043 * Math.sin(l1rad - pi3) + 0.00041 * Math.sin(5 * (l2rad - l3rad)) + 0.00041 * Math.sin(pi4 - PI) + 0.00032 * Math.sin(w2rad - w3rad) + 0.00032 * Math.sin(2 * (l3rad - G - PI));
    var Sigma3 = 0.1649 * Math.sin(l3rad - pi3) + 0.09081 * Math.sin(l3rad - pi4) + -0.06907 * Math.sin(l2rad - l3rad) + 0.03784 * Math.sin(pi3 - pi4) + 0.01846 * Math.sin(2 * (l3rad - l4rad)) + -0.0134 * Math.sin(G) + -0.01014 * Math.sin(2 * (psi - PI)) + 0.00704 * Math.sin(l2rad - 2 * l3rad + pi3) + -0.0062 * Math.sin(l2rad - 2 * l3rad + pi2) + -0.00541 * Math.sin(l3rad - l4rad) + 0.00381 * Math.sin(l2rad - 2 * l3rad + pi4) + 0.00235 * Math.sin(psi - w3rad) + 0.00198 * Math.sin(psi - w4rad) + 0.00176 * Math.sin(philambda) + 0.0013 * Math.sin(3 * (l3rad - l4rad)) + 0.00125 * Math.sin(l1rad - l3rad) + -0.00119 * Math.sin(5 * Gdash - 2 * G + CT.d2R(52.225)) + 0.00109 * Math.sin(l1rad - l2rad) + -0.001 * Math.sin(3 * l3rad - 7 * l4rad + 4 * pi4) + 0.00091 * Math.sin(w3rad - w4rad) + 0.0008 * Math.sin(3 * l3rad - 7 * l4rad + pi3 + 3 * pi4) + -0.00075 * Math.sin(2 * l2rad - 3 * l3rad + pi3) + 0.00072 * Math.sin(pi1 + pi3 - 2 * PI - 2 * G) + 0.00069 * Math.sin(pi4 - PI) + -0.00058 * Math.sin(2 * l3rad - 3 * l4rad + pi4) + -0.00057 * Math.sin(l3rad - 2 * l4rad + pi4) + 0.00056 * Math.sin(l3rad + pi3 - 2 * PI - 2 * G) + -0.00052 * Math.sin(l2rad - 2 * l3rad + pi1) + -0.0005 * Math.sin(pi2 - pi3) + 0.00048 * Math.sin(l3rad - 2 * l4rad + pi3) + -0.00045 * Math.sin(2 * l2rad - 3 * l3rad + pi4) + -0.00041 * Math.sin(pi2 - pi4) + -0.00038 * Math.sin(2 * G) + -0.00037 * Math.sin(pi3 - pi4 + w3rad - w4rad) + -0.00032 * Math.sin(3 * l3rad - 7 * l4rad + 2 * pi3 + 2 * pi4) + 0.0003 * Math.sin(4 * (l3rad - l4rad)) + 0.00029 * Math.sin(l3rad + pi4 - 2 * PI - 2 * G) + -0.00028 * Math.sin(w3rad + psi - 2 * PI - 2 * G) + 0.00026 * Math.sin(l3rad - PI - G) + 0.00024 * Math.sin(l2rad - 3 * l3rad + 2 * l4rad) + 0.00021 * Math.sin(l3rad - PI - G) + -0.00021 * Math.sin(l3rad - pi2) + 0.00017 * Math.sin(2 * (l3rad - pi3));
    var Sigma4 = 0.84287 * Math.sin(l4rad - pi4) + 0.03431 * Math.sin(pi4 - pi3) + -0.03305 * Math.sin(2 * (psi - PI)) + -0.03211 * Math.sin(G) + -0.01862 * Math.sin(l4rad - pi3) + 0.01186 * Math.sin(psi - w4rad) + 0.00623 * Math.sin(l4rad + pi4 - 2 * G - 2 * PI) + 0.00387 * Math.sin(2 * (l4rad - pi4)) + -0.00284 * Math.sin(5 * Gdash - 2 * G + CT.d2R(52.225)) + -0.00234 * Math.sin(2 * (psi - pi4)) + -0.00223 * Math.sin(l3rad - l4rad) + -0.00208 * Math.sin(l4rad - PI) + 0.00178 * Math.sin(psi + w4rad - 2 * pi4) + 0.00134 * Math.sin(pi4 - PI) + 0.00125 * Math.sin(2 * (l4rad - G - PI)) + -0.00117 * Math.sin(2 * G) + -0.00112 * Math.sin(2 * (l3rad - l4rad)) + 0.00107 * Math.sin(3 * l3rad - 7 * l4rad + 4 * pi4) + 0.00102 * Math.sin(l4rad - G - PI) + 0.00096 * Math.sin(2 * l4rad - psi - w4rad) + 0.00087 * Math.sin(2 * (psi - w4rad)) + -0.00085 * Math.sin(3 * l3rad - 7 * l4rad + pi3 + 3 * pi4) + 0.00085 * Math.sin(l3rad - 2 * l4rad + pi4) + -0.00081 * Math.sin(2 * (l4rad - psi)) + 0.00071 * Math.sin(l4rad + pi4 - 2 * PI - 3 * G) + 0.00061 * Math.sin(l1rad - l4rad) + -0.00056 * Math.sin(psi - w3rad) + -0.00054 * Math.sin(l3rad - 2 * l4rad + pi3) + 0.00051 * Math.sin(l2rad - l4rad) + 0.00042 * Math.sin(2 * (psi - G - PI)) + 0.00039 * Math.sin(2 * (pi4 - w4rad)) + 0.00036 * Math.sin(psi + PI - pi4 - w4rad) + 0.00035 * Math.sin(2 * Gdash - G + CT.d2R(188.37)) + -0.00035 * Math.sin(l4rad - pi4 + 2 * PI - 2 * psi) + -0.00032 * Math.sin(l4rad + pi4 - 2 * PI - G) + 0.0003 * Math.sin(2 * Gdash - 2 * G + CT.d2R(149.15)) + 0.00029 * Math.sin(3 * l3rad - 7 * l4rad + 2 * pi3 + 2 * pi4) + 0.00028 * Math.sin(l4rad - pi4 + 2 * psi - 2 * PI) + -0.00028 * Math.sin(2 * (l4rad - w4rad)) + -0.00027 * Math.sin(pi3 - pi4 + w3rad - w4rad) + -0.00026 * Math.sin(5 * Gdash - 3 * G + CT.d2R(188.37)) + 0.00025 * Math.sin(w4rad - w3rad) + -0.00025 * Math.sin(l2rad - 3 * l3rad + 2 * l4rad) + -0.00023 * Math.sin(3 * (l3rad - l4rad)) + 0.00021 * Math.sin(2 * l4rad - 2 * PI - 3 * G) + -0.00021 * Math.sin(2 * l3rad - 3 * l4rad + pi4) + 0.00019 * Math.sin(l4rad - pi4 - G) + -0.00019 * Math.sin(2 * l4rad - pi3 - pi4) + -0.00018 * Math.sin(l4rad - pi4 + G) + -0.00016 * Math.sin(l4rad + pi3 - 2 * PI - 2 * G);
    details.satellite1.meanLongitude = CT.m360(l1);
    details.satellite1.trueLongitude = CT.m360(l1 + Sigma1);
    var L1 = CT.d2R(details.satellite1.trueLongitude);
    details.satellite2.meanLongitude = CT.m360(l2);
    details.satellite2.trueLongitude = CT.m360(l2 + Sigma2);
    var L2 = CT.d2R(details.satellite2.trueLongitude);
    details.satellite3.meanLongitude = CT.m360(l3);
    details.satellite3.trueLongitude = CT.m360(l3 + Sigma3);
    var L3 = CT.d2R(details.satellite3.trueLongitude);
    details.satellite4.meanLongitude = CT.m360(l4);
    details.satellite4.trueLongitude = CT.m360(l4 + Sigma4);
    var L4 = CT.d2R(details.satellite4.trueLongitude);
    var B1 = Math.atan(0.0006393 * Math.sin(L1 - w1rad) + 0.0001825 * Math.sin(L1 - w2rad) + 3.29E-05 * Math.sin(L1 - w3rad) + -3.11E-05 * Math.sin(L1 - psi) + 9.3E-06 * Math.sin(L1 - w4rad) + 7.5E-06 * Math.sin(3 * L1 - 4 * l2rad - 1.9927 * Sigma1 + w2rad) + 4.6E-06 * Math.sin(L1 + psi - 2 * PI - 2 * G));
    details.satellite1.equatorialLatitude = CT.r2D(B1);
    var B2 = Math.atan(0.0081004 * Math.sin(L2 - w2rad) + 0.0004512 * Math.sin(L2 - w3rad) + -0.0003284 * Math.sin(L2 - psi) + 0.000116 * Math.sin(L2 - w4rad) + 2.72E-05 * Math.sin(l1rad - 2 * l3rad + 1.0146 * Sigma2 + w2rad) + -1.44E-05 * Math.sin(L2 - w1rad) + 1.43E-05 * Math.sin(L2 + psi - 2 * PI - 2 * G) + 3.5E-06 * Math.sin(L2 - psi + G) + -2.8E-06 * Math.sin(l1rad - 2 * l3rad + 1.0146 * Sigma2 + w3rad));
    details.satellite2.equatorialLatitude = CT.r2D(B2);
    var B3 = Math.atan(0.0032402 * Math.sin(L3 - w3rad) + -0.0016911 * Math.sin(L3 - psi) + 0.0006847 * Math.sin(L3 - w4rad) + -0.0002797 * Math.sin(L3 - w2rad) + 3.21E-05 * Math.sin(L3 + psi - 2 * PI - 2 * G) + 5.1E-06 * Math.sin(L3 - psi + G) + -4.5E-06 * Math.sin(L3 - psi - G) + -4.5E-06 * Math.sin(L3 + psi - 2 * PI) + 3.7E-06 * Math.sin(L3 + psi - 2 * PI - 3 * G) + 3E-06 * Math.sin(2 * l2rad - 3 * L3 + 4.03 * Sigma3 + w2rad) + -2.1E-06 * Math.sin(2 * l2rad - 3 * L3 + 4.03 * Sigma3 + w3rad));
    details.satellite3.equatorialLatitude = CT.r2D(B3);
    var B4 = Math.atan(-0.0076579 * Math.sin(L4 - psi) + 0.0044134 * Math.sin(L4 - w4rad) + -0.0005112 * Math.sin(L4 - w3rad) + 7.73E-05 * Math.sin(L4 + psi - 2 * PI - 2 * G) + 1.04E-05 * Math.sin(L4 - psi + G) + -1.02E-05 * Math.sin(L4 - psi - G) + 8.8E-06 * Math.sin(L4 + psi - 2 * PI - 3 * G) + -3.8E-06 * Math.sin(L4 + psi - 2 * PI - G));
    details.satellite4.equatorialLatitude = CT.r2D(B4);
    details.satellite1.r = 5.90569 * (1 + (-0.0041339 * Math.cos(2 * (l1rad - l2rad)) + -3.87E-05 * Math.cos(l1rad - pi3) + -2.14E-05 * Math.cos(l1rad - pi4) + 1.7E-05 * Math.cos(l1rad - l2rad) + -1.31E-05 * Math.cos(4 * (l1rad - l2rad)) + 1.06E-05 * Math.cos(l1rad - l3rad) + -6.6E-06 * Math.cos(l1rad + pi3 - 2 * PI - 2 * G)));
    details.satellite2.r = 9.39657 * (1 + (0.0093848 * Math.cos(l1rad - l2rad) + -0.0003116 * Math.cos(l2rad - pi3) + -0.0001744 * Math.cos(l2rad - pi4) + -0.0001442 * Math.cos(l2rad - pi2) + 5.53E-05 * Math.cos(l2rad - l3rad) + 5.23E-05 * Math.cos(l1rad - l3rad) + -2.9E-05 * Math.cos(2 * (l1rad - l2rad)) + 1.64E-05 * Math.cos(2 * (l2rad - w2rad)) + 1.07E-05 * Math.cos(l1rad - 2 * l3rad + pi3) + -1.02E-05 * Math.cos(l2rad - pi1) + -9.1E-06 * Math.cos(2 * (l1rad - l3rad))));
    details.satellite3.r = 14.98832 * (1 + (-0.0014388 * Math.cos(l3rad - pi3) + -0.0007919 * Math.cos(l3rad - pi4) + 0.0006342 * Math.cos(l2rad - l3rad) + -0.0001761 * Math.cos(2 * (l3rad - l4rad)) + 2.94E-05 * Math.cos(l3rad - l4rad) + -1.56E-05 * Math.cos(3 * (l3rad - l4rad)) + 1.56E-05 * Math.cos(l1rad - l3rad) + -1.53E-05 * Math.cos(l1rad - l2rad) + 7E-06 * Math.cos(2 * l2rad - 3 * l3rad + pi3) + -5.1E-06 * Math.cos(l3rad + pi3 - 2 * PI - 2 * G)));
    details.satellite4.r = 26.36273 * (1 + (-0.0073546 * Math.cos(l4rad - pi4) + 0.0001621 * Math.cos(l4rad - pi3) + 9.74E-05 * Math.cos(l3rad - l4rad) + -5.43E-05 * Math.cos(l4rad + pi4 - 2 * PI - 2 * G) + -2.71E-05 * Math.cos(2 * (l4rad - pi4)) + 1.82E-05 * Math.cos(l4rad - PI) + 1.77E-05 * Math.cos(2 * (l3rad - l4rad)) + -1.67E-05 * Math.cos(2 * l4rad - psi - w4rad) + 1.67E-05 * Math.cos(psi - w4rad) + -1.55E-05 * Math.cos(2 * (l4rad - PI - G)) + 1.42E-05 * Math.cos(2 * (l4rad - psi)) + 1.05E-05 * Math.cos(l1rad - l4rad) + 9.2E-06 * Math.cos(l2rad - l4rad) + -8.9E-06 * Math.cos(l4rad - PI - G) + -6.2E-06 * Math.cos(l4rad + pi4 - 2 * PI - 3 * G) + 4.8E-06 * Math.cos(2 * (l4rad - w4rad))));
    var T0 = (JD - 2433282.423) / 36525;
    var P = CT.d2R(1.3966626 * T0 + 0.0003088 * T0 * T0);
    L1 += P;
    details.satellite1.tropicalLongitude = CT.m360(CT.r2D(L1));
    L2 += P;
    details.satellite2.tropicalLongitude = CT.m360(CT.r2D(L2));
    L3 += P;
    details.satellite3.tropicalLongitude = CT.m360(CT.r2D(L3));
    L4 += P;
    details.satellite4.tropicalLongitude = CT.m360(CT.r2D(L4));
    psi += P;
    var T = (JD - 2415020.5) / 36525;
    var I = 3.120262 + 0.0006 * T;
    var Irad = CT.d2R(I);
    var X1 = details.satellite1.r * Math.cos(L1 - psi) * Math.cos(B1);
    var X2 = details.satellite2.r * Math.cos(L2 - psi) * Math.cos(B2);
    var X3 = details.satellite3.r * Math.cos(L3 - psi) * Math.cos(B3);
    var X4 = details.satellite4.r * Math.cos(L4 - psi) * Math.cos(B4);
    var X5 = 0;
    var Y1 = details.satellite1.r * Math.sin(L1 - psi) * Math.cos(B1);
    var Y2 = details.satellite2.r * Math.sin(L2 - psi) * Math.cos(B2);
    var Y3 = details.satellite3.r * Math.sin(L3 - psi) * Math.cos(B3);
    var Y4 = details.satellite4.r * Math.sin(L4 - psi) * Math.cos(B4);
    var Y5 = 0;
    var Z1 = details.satellite1.r * Math.sin(B1);
    var Z2 = details.satellite2.r * Math.sin(B2);
    var Z3 = details.satellite3.r * Math.sin(B3);
    var Z4 = details.satellite4.r * Math.sin(B4);
    var Z5 = 1;
    var omega = CT.d2R(EPO.jupiterLongitudeAscendingNode(JD));
    var i = CT.d2R(EPO.jupiterInclination(JD));
    var A6 = 0;
    var B6 = 0;
    var C6 = 0;
    var north = new C3D();
    var abc = GM.rotations(X5, Y5, Z5, Irad, psi, i, omega, lambda0, beta0, north);
    A6 = abc[0];
    B6 = abc[1];
    C6 = abc[2];
    var D = Math.atan2(A6, C6);
    abc = GM.rotations(X1, Y1, Z1, Irad, psi, i, omega, lambda0, beta0, details.satellite1.eclipticRectangularCoordinates);
    A6 = abc[0];
    B6 = abc[1];
    C6 = abc[2];
    details.satellite1.trueRectangularCoordinates.x = A6 * Math.cos(D) - C6 * Math.sin(D);
    details.satellite1.trueRectangularCoordinates.y = A6 * Math.sin(D) + C6 * Math.cos(D);
    details.satellite1.trueRectangularCoordinates.z = B6;
    abc = GM.rotations(X2, Y2, Z2, Irad, psi, i, omega, lambda0, beta0, details.satellite2.eclipticRectangularCoordinates);
    A6 = abc[0];
    B6 = abc[1];
    C6 = abc[2];
    details.satellite2.trueRectangularCoordinates.x = A6 * Math.cos(D) - C6 * Math.sin(D);
    details.satellite2.trueRectangularCoordinates.y = A6 * Math.sin(D) + C6 * Math.cos(D);
    details.satellite2.trueRectangularCoordinates.z = B6;
    abc = GM.rotations(X3, Y3, Z3, Irad, psi, i, omega, lambda0, beta0, details.satellite3.eclipticRectangularCoordinates);
    A6 = abc[0];
    B6 = abc[1];
    C6 = abc[2];
    details.satellite3.trueRectangularCoordinates.x = A6 * Math.cos(D) - C6 * Math.sin(D);
    details.satellite3.trueRectangularCoordinates.y = A6 * Math.sin(D) + C6 * Math.cos(D);
    details.satellite3.trueRectangularCoordinates.z = B6;
    abc = GM.rotations(X4, Y4, Z4, Irad, psi, i, omega, lambda0, beta0, details.satellite4.eclipticRectangularCoordinates);
    A6 = abc[0];
    B6 = abc[1];
    C6 = abc[2];
    details.satellite4.trueRectangularCoordinates.x = A6 * Math.cos(D) - C6 * Math.sin(D);
    details.satellite4.trueRectangularCoordinates.y = A6 * Math.sin(D) + C6 * Math.cos(D);
    details.satellite4.trueRectangularCoordinates.z = B6;
    details.satellite1.apparentRectangularCoordinates.x = details.satellite1.trueRectangularCoordinates.x + Math.abs(details.satellite1.trueRectangularCoordinates.z) / 17295 * Math.sqrt(1 - (details.satellite1.trueRectangularCoordinates.x / details.satellite1.r) * (details.satellite1.trueRectangularCoordinates.x / details.satellite1.r));
    details.satellite1.apparentRectangularCoordinates.y = details.satellite1.trueRectangularCoordinates.y;
    details.satellite1.apparentRectangularCoordinates.z = details.satellite1.trueRectangularCoordinates.z;
    details.satellite2.apparentRectangularCoordinates.x = details.satellite2.trueRectangularCoordinates.x + Math.abs(details.satellite2.trueRectangularCoordinates.z) / 21819 * Math.sqrt(1 - (details.satellite2.trueRectangularCoordinates.x / details.satellite2.r) * (details.satellite2.trueRectangularCoordinates.x / details.satellite2.r));
    details.satellite2.apparentRectangularCoordinates.y = details.satellite2.trueRectangularCoordinates.y;
    details.satellite2.apparentRectangularCoordinates.z = details.satellite2.trueRectangularCoordinates.z;
    details.satellite3.apparentRectangularCoordinates.x = details.satellite3.trueRectangularCoordinates.x + Math.abs(details.satellite3.trueRectangularCoordinates.z) / 27558 * Math.sqrt(1 - (details.satellite3.trueRectangularCoordinates.x / details.satellite3.r) * (details.satellite3.trueRectangularCoordinates.x / details.satellite3.r));
    details.satellite3.apparentRectangularCoordinates.y = details.satellite3.trueRectangularCoordinates.y;
    details.satellite3.apparentRectangularCoordinates.z = details.satellite3.trueRectangularCoordinates.z;
    details.satellite4.apparentRectangularCoordinates.x = details.satellite4.trueRectangularCoordinates.x + Math.abs(details.satellite4.trueRectangularCoordinates.z) / 36548 * Math.sqrt(1 - (details.satellite4.trueRectangularCoordinates.x / details.satellite4.r) * (details.satellite4.trueRectangularCoordinates.x / details.satellite4.r));
    details.satellite4.apparentRectangularCoordinates.y = details.satellite4.trueRectangularCoordinates.y;
    details.satellite4.apparentRectangularCoordinates.z = details.satellite4.trueRectangularCoordinates.z;
    var W = DELTA / (DELTA + details.satellite1.trueRectangularCoordinates.z / 2095);
    details.satellite1.apparentRectangularCoordinates.x *= W;
    details.satellite1.apparentRectangularCoordinates.y *= W;
    W = DELTA / (DELTA + details.satellite2.trueRectangularCoordinates.z / 2095);
    details.satellite2.apparentRectangularCoordinates.x *= W;
    details.satellite2.apparentRectangularCoordinates.y *= W;
    W = DELTA / (DELTA + details.satellite3.trueRectangularCoordinates.z / 2095);
    details.satellite3.apparentRectangularCoordinates.x *= W;
    details.satellite3.apparentRectangularCoordinates.y *= W;
    W = DELTA / (DELTA + details.satellite4.trueRectangularCoordinates.z / 2095);
    details.satellite4.apparentRectangularCoordinates.x *= W;
    details.satellite4.apparentRectangularCoordinates.y *= W;
    return details;
};

GM.rotations = function (X, Y, Z, I, psi, i, omega, lambda0, beta0, eclipticCoord) {
    var A6;
    var B6;
    var C6;
    var phi = psi - omega;
    var A1 = X;
    var B1 = Y * Math.cos(I) - Z * Math.sin(I);
    var C1 = Y * Math.sin(I) + Z * Math.cos(I);
    var A2 = A1 * Math.cos(phi) - B1 * Math.sin(phi);
    var B2 = A1 * Math.sin(phi) + B1 * Math.cos(phi);
    var C2 = C1;
    var A3 = A2;
    var B3 = B2 * Math.cos(i) - C2 * Math.sin(i);
    var C3 = B2 * Math.sin(i) + C2 * Math.cos(i);
    var A4 = A3 * Math.cos(omega) - B3 * Math.sin(omega);
    var B4 = A3 * Math.sin(omega) + B3 * Math.cos(omega);
    var C4 = C3;
    var JupiterRadiiToAU = 1 / 2095;
    eclipticCoord.x = A4 * JupiterRadiiToAU;
    eclipticCoord.y = B4 * JupiterRadiiToAU;
    eclipticCoord.z = C4 * JupiterRadiiToAU;
    var A5 = A4 * Math.sin(lambda0) - B4 * Math.cos(lambda0);
    var B5 = A4 * Math.cos(lambda0) + B4 * Math.sin(lambda0);
    var C5 = C4;
    A6 = A5;
    B6 = C5 * Math.sin(beta0) + B5 * Math.cos(beta0);
    C6 = C5 * Math.cos(beta0) - B5 * Math.sin(beta0);
    return [A6, B6, C6];
};

GM.fillInPhenomenaDetails = function (detail) {
    var Y1 = 1.071374 * detail.apparentRectangularCoordinates.y;
    var r = Y1 * Y1 + detail.apparentRectangularCoordinates.x * detail.apparentRectangularCoordinates.x;
    if (r < 1) {
        if (detail.apparentRectangularCoordinates.z < 0) {
            detail.bInTransit = true;
            detail.bInOccultation = false;
        }
        else {
            detail.bInTransit = false;
            detail.bInOccultation = true;
        }
    }
    else {
        detail.bInTransit = false;
        detail.bInOccultation = false;
    }
};

var GM$ = {};

registerType("GM", [GM, GM$, null]);
