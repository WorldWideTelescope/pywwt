// Originally `AASTELLARMAGNITUDES.CPP`
// "Purpose: Implementation for the algorithms which operate on the stellar magntidue system"
// Last update of original: PJN / 12-02-2004
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


// CAAStellarMagnitudes

export function CAAStellarMagnitudes() { }

CAAStellarMagnitudes.combinedMagnitude = function (m1, m2) {
    var x = 0.4 * (m2 - m1);
    return m2 - 2.5 * Util.log10(Math.pow(10, x) + 1);
};

CAAStellarMagnitudes.combinedMagnitude2 = function (Magnitudes, pMagnitudes) {
    var vvalue = 0;
    for (var i = 0; i < Magnitudes; i++) {
        vvalue += Math.pow(10, -0.4 * pMagnitudes[i]);
    }
    return -2.5 * Util.log10(vvalue);
};

CAAStellarMagnitudes.brightnessRatio = function (m1, m2) {
    var x = 0.4 * (m2 - m1);
    return Math.pow(10, x);
};

CAAStellarMagnitudes.magnitudeDifference = function (brightnessRatio) {
    return 2.5 * Util.log10(brightnessRatio);
};

var CAAStellarMagnitudes$ = {};

registerType("CAAStellarMagnitudes", [CAAStellarMagnitudes, CAAStellarMagnitudes$, null]);
