// Originally `AAMOONNODES.CPP`
// "Purpose: Implementation for the algorithms which obtain the dates when the Moon passes thro its nodes"
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


// CAAMoonNodes

export function CAAMoonNodes() { }

CAAMoonNodes.k = function (Year) {
    return 13.4223 * (Year - 2000.05);
};

CAAMoonNodes.passageThroNode = function (k) {
    var T = k / 1342.23;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    var T4 = Tcubed * T;
    var D = CT.m360(183.638 + 331.73735682 * k + 0.0014852 * Tsquared + 2.09E-06 * Tcubed - 1E-08 * T4);
    var M = CT.m360(17.4006 + 26.8203725 * k + 0.0001186 * Tsquared + 6E-08 * Tcubed);
    var Mdash = CT.m360(38.3776 + 355.52747313 * k + 0.0123499 * Tsquared + 1.4627E-05 * Tcubed - 6.9E-08 * T4);
    var omega = CT.m360(123.9767 - 1.44098956 * k + 0.0020608 * Tsquared + 2.14E-06 * Tcubed - 1.6E-08 * T4);
    var V = CT.m360(299.75 + 132.85 * T - 0.009173 * Tsquared);
    var P = CT.m360(omega + 272.75 - 2.3 * T);
    var E = 1 - 0.002516 * T - 7.4E-06 * Tsquared;
    D = CT.d2R(D);
    var D2 = 2 * D;
    var D4 = D2 * D2;
    M = CT.d2R(M);
    Mdash = CT.d2R(Mdash);
    var Mdash2 = 2 * Mdash;
    omega = CT.d2R(omega);
    V = CT.d2R(V);
    P = CT.d2R(P);
    var JD = 2451565.1619 + 27.212220817 * k + 0.0002762 * Tsquared + 2.1E-08 * Tcubed - 8.8E-11 * T4 - 0.4721 * Math.sin(Mdash) - 0.1649 * Math.sin(D2) - 0.0868 * Math.sin(D2 - Mdash) + 0.0084 * Math.sin(D2 + Mdash) - E * 0.0083 * Math.sin(D2 - M) - E * 0.0039 * Math.sin(D2 - M - Mdash) + 0.0034 * Math.sin(Mdash2) - 0.0031 * Math.sin(D2 - Mdash2) + E * 0.003 * Math.sin(D2 + M) + E * 0.0028 * Math.sin(M - Mdash) + E * 0.0026 * Math.sin(M) + 0.0025 * Math.sin(D4) + 0.0024 * Math.sin(D) + E * 0.0022 * Math.sin(M + Mdash) + 0.0017 * Math.sin(omega) + 0.0014 * Math.sin(D4 - Mdash) + E * 0.0005 * Math.sin(D2 + M - Mdash) + E * 0.0004 * Math.sin(D2 - M + Mdash) - E * 0.0003 * Math.sin(D2 - M * M) + E * 0.0003 * Math.sin(D4 - M) + 0.0003 * Math.sin(V) + 0.0003 * Math.sin(P);
    return JD;
};

var CAAMoonNodes$ = {};

registerType("CAAMoonNodes", [CAAMoonNodes, CAAMoonNodes$, null]);
