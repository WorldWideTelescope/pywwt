// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Numerical routines supporting the Healpix implementation.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { HealpixTables } from "./healpix_tables.js";
import { HealpixUtils } from "./healpix_utils.js";
import { Hploc } from "./hploc.js";


// wwtlib.Fxyf

export function Fxyf() {
    // x-coordinate within the basis pixel, range [0.0;1.0]
    this.fx = 0;

    // y-coordinate within the basis pixel, range [0.0;1.0]
    this.fy = 0;

    // index of the HEALPix basis pixel, range [0;11]
    this.face = 0;
    HealpixTables.call(this);
}

Fxyf._halfpi$1 = Math.PI / 2;
Fxyf._inv_halfpi$1 = 2 / Math.PI;
Fxyf._twothird$1 = 2 / 3;

Fxyf.create = function (x, y, f) {
    var temp = new Fxyf();
    temp.fx = x;
    temp.fy = y;
    temp.face = f;
    return temp;
};

Fxyf._fromHploc$1 = function (loc) {
    var temp = new Fxyf();
    var z = loc.z, phi = loc.phi;
    var za = Math.abs(z);
    var tt = HealpixUtils.fmodulo((phi * Fxyf._inv_halfpi$1), 4); // in [0,4)

    if (za <= Fxyf._twothird$1) { // Equatorial region
        var temp1 = 0.5 + tt;
        var temp2 = z * 0.75;
        var jp = temp1 - temp2; // index of  ascending edge line
        var jm = temp1 + temp2; // index of descending edge line
        var ifp = jp; // in {0,4}
        var ifm = jm;
        var face_num = (ifp === ifm) ? (ifp | 4) : ((ifp < ifm) ? ifp : (ifm + 8));
        temp.fx = HealpixUtils.fmodulo(jm, 1);
        temp.fy = 1 - HealpixUtils.fmodulo(jp, 1);
        temp.face = face_num;
    } else { // polar region, za > 2/3
        var ntt = Math.min(3, ss.truncate(tt));
        var tp = tt - ntt;
        var tmp;
        if ((za < 0.99) || (!loc.have_sth)) {
            tmp = Math.sqrt(3 * (1 - za));
        } else {
            tmp = loc.sth / Math.sqrt((1 + za) / 3);
        }
        var jp = tp * tmp; // increasing edge line index
        var jm = (1 - tp) * tmp; // decreasing edge line index
        if (jp >= 1) {
            jp = 1; // for points too close to the boundary
        }
        if (jm >= 1) {
            jm = 1;
        }
        if (z >= 0) {
            temp.fx = 1 - jm;
            temp.fy = 1 - jp;
            temp.face = ntt;
        } else {
            temp.fx = jp;
            temp.fy = jm;
            temp.face = ntt + 8;
        }
    }
    return temp;
};

Fxyf.fromVector = function (v) {
    return Fxyf._fromHploc$1(Hploc.create(v));
};

var Fxyf$ = {
    toHploc: function () {
        var loc = new Hploc();
        var jr = HealpixTables.jrll[this.face] - this.fx - this.fy;
        var nr;
        var tmp;
        if (jr < 1) {
            nr = jr;
            tmp = nr * nr / 3;
            loc.z = 1 - tmp;
            if (loc.z > 0.99) {
                loc.sth = Math.sqrt(tmp * (2 - tmp));
                loc.have_sth = true;
            }
        } else if (jr > 3) {
            nr = 4 - jr;
            tmp = nr * nr / 3;
            loc.z = tmp - 1;
            if (loc.z < -0.99) {
                loc.sth = Math.sqrt(tmp * (2 - tmp));
                loc.have_sth = true;
            }
        } else {
            nr = 1;
            loc.z = (2 - jr) * 2 / 3;
        }
        tmp = HealpixTables.jpll[this.face] * nr + this.fx - this.fy;
        if (tmp < 0) {
            tmp += 8;
        }
        if (tmp >= 8) {
            tmp -= 8;
        }
        loc.phi = (nr < 1E-15) ? 0 : (0.5 * Fxyf._halfpi$1 * tmp) / nr;
        return loc;
    },

    toVec3: function () {
        return this.toHploc().toVec3();
    }
};

registerType("Fxyf", [Fxyf, Fxyf$, HealpixTables]);
