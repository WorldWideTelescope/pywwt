// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// "Fast math" routines "from Healpix Java package"

import { registerType } from "./typesystem.js";


// wwtlib.FastMath

export function FastMath() { }

const pI4_A = 0.785398155450821;
const pI4_B = 7.94662735614793E-09;
const pI4_C = 3.06161699786838E-17;
const m_1_PI = 0.318309886183791;

FastMath._mulsign = function (x, y) {
    return FastMath._sign(y) * x;
};

FastMath._isnan = function (d) {
    return d !== d;
};

FastMath._isinf = function (d) {
    // TODO: this was documented as checking for negative infinity as well, and
    // almost surely should do that!
    return Math.abs(d) === Number.POSITIVE_INFINITY;
};

FastMath._sign = function (d) {
    if (!d) {
        return 0;
    }
    return (d > 0) ? 1 : -1;
};

FastMath._atanhelper = function (s) {
    var t = s * s;
    var u = -1.88796008463073E-05;
    u = u * t + (0.000209850076645817);
    u = u * t + (-0.00110611831486672);
    u = u * t + (0.00370026744188713);
    u = u * t + (-0.00889896195887655);
    u = u * t + (0.0165993297735292);
    u = u * t + (-0.0254517624932313);
    u = u * t + (0.0337852580001353);
    u = u * t + (-0.0407629191276837);
    u = u * t + (0.0466667150077841);
    u = u * t + (-0.0523674852303482);
    u = u * t + (0.0587666392926674);
    u = u * t + (-0.0666573579361081);
    u = u * t + (0.076921953831177);
    u = u * t + (-0.090908995008245);
    u = u * t + (0.111111105648261);
    u = u * t + (-0.142857142667713);
    u = u * t + (0.199999999996591);
    u = u * t + (-0.333333333333311);
    return u * t * s + s;
};

FastMath._atan2k = function (y, x) {
    var q = 0;
    if (x < 0) {
        x = -x;
        q = -2;
    }
    if (y > x) {
        var t = x;
        x = y;
        y = -t;
        q += 1;
    }
    return FastMath._atanhelper(y / x) + q * (Math.PI / 2);
};

// This method calculates the arc tangent of y/x in radians, using the signs of
// the two arguments to determine the quadrant of the result. The results may
// have maximum error of 2 ulps.
FastMath.atan2 = function (y, x) {
    var r = FastMath._atan2k(Math.abs(y), x);
    r = FastMath._mulsign(r, x);
    if (FastMath._isinf(x) || !x) {
        r = Math.PI / 2 - ((FastMath._isinf(x)) ? (FastMath._sign(x) * (Math.PI / 2)) : 0);
    }
    if (FastMath._isinf(y)) {
        r = Math.PI / 2 - ((FastMath._isinf(x)) ? (FastMath._sign(x) * (Math.PI * 1 / 4)) : 0);
    }
    if (!y) {
        r = ((FastMath._sign(x) === -1) ? Math.PI : 0);
    }
    return (FastMath._isnan(x) || FastMath._isnan(y)) ? Number.NaN : FastMath._mulsign(r, y);
};

// This method calculates the arc sine of x in radians. The return value is in
// the range [-pi/2, pi/2]. The results may have maximum error of 3 ulps.
FastMath.asin = function (d) {
    return FastMath._mulsign(FastMath._atan2k(Math.abs(d), Math.sqrt((1 + d) * (1 - d))), d);
};

// This method calculates the arc cosine of x in radians. The return value is in
// the range [0, pi]. The results may have maximum error of 3 ulps.
FastMath.acos = function (d) {
    return FastMath._mulsign(FastMath._atan2k(Math.sqrt((1 + d) * (1 - d)), Math.abs(d)), d) + ((d < 0) ? Math.PI : 0);
};

// Returns the arc tangent of an angle. The results may have maximum error of 2
// ulps.
FastMath.atan = function (s) {
    var q = 0;
    if (s < 0) {
        s = -s;
        q = 2;
    }
    if (s > 1) {
        s = 1 / s;
        q |= 1;
    }
    var t = FastMath._atanhelper(s);
    if (!!(q & 1)) {
        t = 1.5707963267949 - t;
    }
    if (!!(q & 2)) {
        t = -t;
    }
    return t;
};

FastMath._sincoshelper = function (d) {
    var s = d * d;
    var u = -7.97255955009038E-18;
    u = u * s + 2.81009972710863E-15;
    u = u * s - 7.64712219118159E-13;
    u = u * s + 1.60590430605665E-10;
    u = u * s - 2.50521083763502E-08;
    u = u * s + 2.75573192239199E-06;
    u = u * s - 0.000198412698412696;
    u = u * s + 0.00833333333333333;
    u = u * s - 0.166666666666667;
    return s * u * d + d;
};

// Returns the trigonometric sine of an angle. The results may have maximum
// error of 2 ulps.
FastMath.sin = function (d) {
    var u = d * m_1_PI;
    var q = Math.floor((u < 0) ? u - 0.5 : u + 0.5);
    var x = 4 * q;
    d -= x * pI4_A;
    d -= x * pI4_B;
    d -= x * pI4_C;
    if (!!(q & 1)) {
        d = -d;
    }
    return FastMath._sincoshelper(d);
};

// Returns the trigonometric cosine of an angle. The results may have maximum
// error of 2 ulps.
FastMath.cos = function (d) {
    var u = d * m_1_PI - 0.5;
    var q = 1 + 2 * Math.floor((u < 0) ? u - 0.5 : u + 0.5);
    var x = 2 * q;
    d -= x * pI4_A;
    d -= x * pI4_B;
    d -= x * pI4_C;
    if (!(q & 2)) {
        d = -d;
    }
    return FastMath._sincoshelper(d);
};

var FastMath$ = {};

registerType("FastMath", [FastMath, FastMath$, null]);
