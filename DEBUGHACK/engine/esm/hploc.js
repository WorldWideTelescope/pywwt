// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A HEALPix location type.

import { registerType } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { FastMath } from "./fast_math.js";


// wwtlib.Hploc

export function Hploc() {
    this.z = 0;
    this.phi = 0;
    this.sth = 0;
    this.have_sth = false;
}

Hploc.create = function (v) {
    var temp = new Hploc();
    var xl = 1 / v.length();
    temp.z = v.z * xl;
    temp.phi = FastMath.atan2(v.y, v.x);
    if (Math.abs(temp.z) > 0.99) {
        temp.sth = Math.sqrt(v.x * v.x + v.y * v.y) * xl;
        temp.have_sth = true;
    }
    return temp;
};

var Hploc$ = {
    toVec3: function () {
        var st;
        if (this.have_sth) {
            st = this.sth;
        } else {
            st = Math.sqrt((1 - this.z) * (1 + this.z));
        }
        var x = st * FastMath.cos(this.phi);
        var y = st * FastMath.sin(this.phi);
        return Vector3d.create(x, this.z, y);
    }
};

registerType("Hploc", [Hploc, Hploc$, null]);
