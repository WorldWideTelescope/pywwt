// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A lat/lon datatype. This is unused in the engine, but preserved for API
// compatibility.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { HealpixUtils } from "./healpix_utils.js";


// wwtlib.Pointing

export function Pointing() {
    // Colatitude in radians (0 is North Pole; Pi is South Pole)
    this.theta = 0;

    // Longitude in radians
    this.phi = 0;
}

Pointing.create = function (theta, phi) {
    var temp = new Pointing();
    temp.theta = theta;
    temp.phi = phi;
    return temp;
};

var Pointing$ = {
    normalizeTheta: function () {
        this.theta = HealpixUtils.fmodulo(this.theta, 2 * Math.PI);
        if (this.theta > Math.PI) {
            this.phi += Math.PI;
            this.theta = 2 * Math.PI - this.theta;
        }
    },

    normalize: function () {
        this.normalizeTheta();
        this.phi = HealpixUtils.fmodulo(this.phi, 2 * Math.PI);
    },

    toString: function () {
        var s = new ss.StringBuilder();
        s.append('ptg(');
        s.append(this.theta);
        s.append(',');
        s.append(this.phi);
        s.append(')');
        return s.toString();
    }
};

registerType("Pointing", [Pointing, Pointing$, null]);
