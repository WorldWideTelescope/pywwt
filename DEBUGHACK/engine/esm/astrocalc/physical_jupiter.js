// Originally `AAPHYSICALJUPITER.CPP`
// "Purpose: Implementation for the algorithms which obtain the physical parameters of the Jupiter"
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
import { CAANutation } from "./nutation.js";
import { CAAEarth } from "./earth.js";
import { CAAJupiter } from "./jupiter.js";


// CAAPhysicalJupiterDetails

export function CAAPhysicalJupiterDetails() {
    this.DE = 0;
    this.DS = 0;
    this.geometricw1 = 0;
    this.geometricw2 = 0;
    this.apparentw1 = 0;
    this.apparentw2 = 0;
    this.p = 0;
    this.DE = 0;
    this.DS = 0;
    this.geometricw1 = 0;
    this.geometricw2 = 0;
    this.apparentw1 = 0;
    this.apparentw2 = 0;
    this.p = 0;
}

var CAAPhysicalJupiterDetails$ = {};

registerType("CAAPhysicalJupiterDetails", [CAAPhysicalJupiterDetails, CAAPhysicalJupiterDetails$, null]);


// CAAPhysicalJupiter

export function CAAPhysicalJupiter() { }

CAAPhysicalJupiter.calculate = function (JD) {
    var details = new CAAPhysicalJupiterDetails();
    var d = JD - 2433282.5;
    var T1 = d / 36525;
    var alpha0 = 268 + 0.1061 * T1;
    var alpha0rad = CT.d2R(alpha0);
    var delta0 = 64.5 - 0.0164 * T1;
    var delta0rad = CT.d2R(delta0);
    var W1 = CT.m360(17.71 + 877.90003539 * d);
    var W2 = CT.m360(16.838 + 870.27003539 * d);
    var l0 = CAAEarth.eclipticLongitude(JD);
    var l0rad = CT.d2R(l0);
    var b0 = CAAEarth.eclipticLatitude(JD);
    var b0rad = CT.d2R(b0);
    var R = CAAEarth.radiusVector(JD);
    var l = CAAJupiter.eclipticLongitude(JD);
    var lrad = CT.d2R(l);
    var b = CAAJupiter.eclipticLatitude(JD);
    var brad = CT.d2R(b);
    var r = CAAJupiter.radiusVector(JD);
    var x = r * Math.cos(brad) * Math.cos(lrad) - R * Math.cos(l0rad);
    var y = r * Math.cos(brad) * Math.sin(lrad) - R * Math.sin(l0rad);
    var z = r * Math.sin(brad) - R * Math.sin(b0rad);
    var DELTA = Math.sqrt(x * x + y * y + z * z);
    l -= 0.01299 * DELTA / (r * r);
    lrad = CT.d2R(l);
    x = r * Math.cos(brad) * Math.cos(lrad) - R * Math.cos(l0rad);
    y = r * Math.cos(brad) * Math.sin(lrad) - R * Math.sin(l0rad);
    z = r * Math.sin(brad) - R * Math.sin(b0rad);
    DELTA = Math.sqrt(x * x + y * y + z * z);
    var e0 = CAANutation.meanObliquityOfEcliptic(JD);
    var e0rad = CT.d2R(e0);
    var alphas = Math.atan2(Math.cos(e0rad) * Math.sin(lrad) - Math.sin(e0rad) * Math.tan(brad), Math.cos(lrad));
    var deltas = Math.asin(Math.cos(e0rad) * Math.sin(brad) + Math.sin(e0rad) * Math.cos(brad) * Math.sin(lrad));
    details.DS = CT.r2D(Math.asin(-Math.sin(delta0rad) * Math.sin(deltas) - Math.cos(delta0rad) * Math.cos(deltas) * Math.cos(alpha0rad - alphas)));
    var u = y * Math.cos(e0rad) - z * Math.sin(e0rad);
    var v = y * Math.sin(e0rad) + z * Math.cos(e0rad);
    var alpharad = Math.atan2(u, x);
    var alpha = CT.r2D(alpharad);
    var deltarad = Math.atan2(v, Math.sqrt(x * x + u * u));
    var delta = CT.r2D(deltarad);
    var xi = Math.atan2(Math.sin(delta0rad) * Math.cos(deltarad) * Math.cos(alpha0rad - alpharad) - Math.sin(deltarad) * Math.cos(delta0rad), Math.cos(deltarad) * Math.sin(alpha0rad - alpharad));
    details.DE = CT.r2D(Math.asin(-Math.sin(delta0rad) * Math.sin(deltarad) - Math.cos(delta0rad) * Math.cos(deltarad) * Math.cos(alpha0rad - alpharad)));
    details.geometricw1 = CT.m360(W1 - CT.r2D(xi) - 5.07033 * DELTA);
    details.geometricw2 = CT.m360(W2 - CT.r2D(xi) - 5.02626 * DELTA);
    var C = 57.2958 * (2 * r * DELTA + R * R - r * r - DELTA * DELTA) / (4 * r * DELTA);
    if (Math.sin(lrad - l0rad) > 0) {
        details.apparentw1 = CT.m360(details.geometricw1 + C);
        details.apparentw2 = CT.m360(details.geometricw2 + C);
    }
    else {
        details.apparentw1 = CT.m360(details.geometricw1 - C);
        details.apparentw2 = CT.m360(details.geometricw2 - C);
    }
    var NutationInLongitude = CAANutation.nutationInLongitude(JD);
    var NutationInObliquity = CAANutation.nutationInObliquity(JD);
    e0 += NutationInObliquity / 3600;
    e0rad = CT.d2R(e0);
    alpha += 0.005693 * (Math.cos(alpharad) * Math.cos(l0rad) * Math.cos(e0rad) + Math.sin(alpharad) * Math.sin(l0rad)) / Math.cos(deltarad);
    alpha = CT.m360(alpha);
    alpharad = CT.d2R(alpha);
    delta += 0.005693 * (Math.cos(l0rad) * Math.cos(e0rad) * (Math.tan(e0rad) * Math.cos(deltarad) - Math.sin(alpharad) * Math.sin(deltarad)) + Math.cos(alpharad) * Math.sin(deltarad) * Math.sin(l0rad));
    deltarad = CT.d2R(delta);
    var NutationRA = CAANutation.nutationInRightAscension(alpha / 15, delta, e0, NutationInLongitude, NutationInObliquity);
    var alphadash = alpha + NutationRA / 3600;
    var alphadashrad = CT.d2R(alphadash);
    var NutationDec = CAANutation.nutationInDeclination(alpha / 15, delta, e0, NutationInLongitude, NutationInObliquity);
    var deltadash = delta + NutationDec / 3600;
    var deltadashrad = CT.d2R(deltadash);
    NutationRA = CAANutation.nutationInRightAscension(alpha0 / 15, delta0, e0, NutationInLongitude, NutationInObliquity);
    var alpha0dash = alpha0 + NutationRA / 3600;
    var alpha0dashrad = CT.d2R(alpha0dash);
    NutationDec = CAANutation.nutationInDeclination(alpha0 / 15, delta0, e0, NutationInLongitude, NutationInObliquity);
    var delta0dash = delta0 + NutationDec / 3600;
    var delta0dashrad = CT.d2R(delta0dash);
    details.p = CT.m360(CT.r2D(Math.atan2(Math.cos(delta0dashrad) * Math.sin(alpha0dashrad - alphadashrad), Math.sin(delta0dashrad) * Math.cos(deltadashrad) - Math.cos(delta0dashrad) * Math.sin(deltadashrad) * Math.cos(alpha0dashrad - alphadashrad))));
    return details;
};

var CAAPhysicalJupiter$ = {};

registerType("CAAPhysicalJupiter", [CAAPhysicalJupiter, CAAPhysicalJupiter$, null]);
