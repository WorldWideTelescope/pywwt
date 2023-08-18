// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Kepler Vertex.

import { registerType } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { Colors } from "./color.js";


// wwtlib.KeplerVertex

export function KeplerVertex() {
    this.ABC = new Vector3d();
    this.abc1 = new Vector3d();
    this.pointSize = 0;
    this.w = 0;
    this.e = 0;
    this.n = 0;
    this.t = 0;
    this.a = 0;
    this.z = 0;
    this.orbitPos = 0;
    this.orbits = 0;
}

KeplerVertex._sine = 0;
KeplerVertex._cose = 1;
KeplerVertex._degrad = Math.PI / 180;

var KeplerVertex$ = {
    fill: function (ee) {
        var F = Math.cos(ee.omega * KeplerVertex._degrad);
        var sinOmega = Math.sin(ee.omega * KeplerVertex._degrad);
        var cosi = Math.cos(ee.i * KeplerVertex._degrad);
        var sini = Math.sin(ee.i * KeplerVertex._degrad);
        var G = sinOmega * KeplerVertex._cose;
        var H = sinOmega * KeplerVertex._sine;
        var P = -sinOmega * cosi;
        var Q = (F * cosi * KeplerVertex._cose) - (sini * KeplerVertex._sine);
        var R = (F * cosi * KeplerVertex._sine) + (sini * KeplerVertex._cose);
        var checkA = (F * F) + (G * G) + (H * H); // Should be 1.0
        var checkB = (P * P) + (Q * Q) + (R * R); // Should be 1.0 as well
        this.ABC.x = Math.atan2(F, P);
        this.ABC.y = Math.atan2(G, Q);
        this.ABC.z = Math.atan2(H, R);
        this.abc1.x = Math.sqrt((F * F) + (P * P));
        this.abc1.y = Math.sqrt((G * G) + (Q * Q));
        this.abc1.z = Math.sqrt((H * H) + (R * R));
        this.pointSize = 0.1;
        if (ee.a < 2.5) {
            this.color = Colors.get_white();
        } else if (ee.a < 2.83) {
            this.color = Colors.get_red();
        } else if (ee.a < 2.96) {
            this.color = Colors.get_green();
        } else if (ee.a < 3.3) {
            this.color = Colors.get_magenta();
        } else if (ee.a < 5) {
            this.color = Colors.get_cyan();
        } else if (ee.a < 10) {
            this.color = Colors.get_yellow();
            this.pointSize = 0.9;
        } else {
            this.color = Colors.get_white();
            this.pointSize = 8;
        }
        this.w = ee.w;
        this.e = ee.e;
        if (!ee.n) {
            this.n = (0.9856076686 / (ee.a * Math.sqrt(ee.a)));
        } else {
            this.n = ee.n;
        }
        this.t = (ee.t - KeplerVertex.baseDate);
        this.a = ee.a;
        this.z = 0;
        this.orbitPos = 0;
        this.orbits = 0;
    }
};

registerType("KeplerVertex", [KeplerVertex, KeplerVertex$, null]);

// KeplerVertex.baseDate is initialized at the bottom of the main module.
