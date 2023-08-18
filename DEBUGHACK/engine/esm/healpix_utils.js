// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Utilities relating to HEALPix.

import { registerType } from "./typesystem.js";
import { FastMath } from "./fast_math.js";


// wwtlib.HealpixUtils

export function HealpixUtils() { }

HealpixUtils.check = function (cond, errtxt) {
    if (!cond) {
        throw new Error(errtxt);
    }
};

// Integer square root.
HealpixUtils.isqrt = function (arg) {
    var res = Math.sqrt((arg) + 0.5);
    if (arg < (1 << 50)) {
        return res;
    }
    if (res * res > arg) {
        --res;
    }
    else if ((res + 1) * (res + 1) <= arg) {
        ++res;
    }
    return res;
};

// Computes the cosine of the angular distance between two z, phi positions on
// the unit sphere
HealpixUtils.cosdist_zphi = function (z1, phi1, z2, phi2) {
    return z1 * z2 + FastMath.cos(phi1 - phi2) * Math.sqrt((1 - z1 * z1) * (1 - z2 * z2));
};

HealpixUtils.fmodulo = function (v1, v2) {
    if (v1 >= 0) {
        return (v1 < v2) ? v1 : v1 % v2;
    }
    var tmp = v1 % v2 + v2;
    return (tmp === v2) ? 0 : tmp;
};

var HealpixUtils$ = {};

registerType("HealpixUtils", [HealpixUtils, HealpixUtils$, null]);
