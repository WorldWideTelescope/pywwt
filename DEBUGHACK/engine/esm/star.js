// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Information about catalogued objects.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Util } from "./baseutil.js";
import { Color } from "./color.js";
import { Coordinates } from "./coordinates.js";


// wwtlib.Star

export function Star(input) {
    this.magnitude = 0;
    this.RA = 0;
    this.dec = 0;
    this.BMV = 0;
    this.id = 0;
    this.absoluteMagnitude = 0;
    this.par = 0;
    this.distance = 0;
    var sa = input.split('\t');
    this.id = parseInt(ss.replaceString(sa[0], 'HIP', ''));
    this.dec = parseFloat(sa[3]);
    this.RA = parseFloat(sa[2]) / 15;
    if (sa.length > 4) {
        try {
            if (sa[4].toUpperCase() !== 'NULL' && !!sa[4]) {
                this.magnitude = parseFloat(sa[4]);
            }
        }
        catch ($e1) {
        }
    }
    if (sa.length > 5) {
        try {
            this.BMV = parseFloat(sa[5]);
            this._makeColor(this.BMV);
        }
        catch ($e2) {
        }
    }
    if (sa.length > 6) {
        this.par = parseFloat(sa[6]);
        this._makeDistanceAndMagnitude();
    }
}

var Star$ = {
    get_name: function () {
        return 'HIP' + this.id.toString();
    },

    get_coordinates: function () {
        return Coordinates.fromRaDec(this.RA, this.dec);
    },

    stars: function (input, newish) {
        var sa = input.split('\t');
        this.id = parseInt(sa[0]);
        this.RA = parseFloat(sa[1]) / 15;
        this.dec = parseFloat(sa[2]);
        if (sa.length > 3) {
            try {
                this.magnitude = parseFloat(sa[3]);
            }
            catch ($e1) {
            }
        }
        if (sa.length > 4) {
            try {
                this.col = Color.load(sa[4]);
            }
            catch ($e2) {
            }
        }
    },

    _makeDistanceAndMagnitude: function () {
        this.distance = 1 / (this.par / 1000);
        this.absoluteMagnitude = this.magnitude - 5 * (Util.logN(this.distance, 10) - 1);
        //Convert to AU
        this.distance *= 206264.806;
    },

    _makeColor: function (bmv) {
        var c = 0xFFFFFFFF;

        if (bmv <= -0.32) {
            c = 0xFFA2B8FF;
        } else if (bmv <= -0.31) {
            c = 0xFFA3B8FF;
        } else if (bmv <= -0.3) {
            c = 0xFFA4BAFF;
        }
        // mistake in original source. Should this be "<= -0.29" or something?
        // else if (bmv <= -0.3) {
        //   c = 0xFFA5BAFF;
        // }
        else if (bmv <= -0.28) {
            c = 0xFFA7BCFF;
        } else if (bmv <= -0.26) {
            c = 0xFFA9BDFF;
        } else if (bmv <= -0.24) {
            c = 0xFFABBFFF;
        } else if (bmv <= -0.2) {
            c = 0xFFAFC2FF;
        } else if (bmv <= -0.16) {
            c = 0xFFB4C6FF;
        } else if (bmv <= -0.14) {
            c = 0xFFB6C8FF;
        } else if (bmv <= -0.12) {
            c = 0xFFB9CAFF;
        } else if (bmv <= -0.09) {
            c = 0xFFBCCDFF;
        } else if (bmv <= -0.06) {
            c = 0xFFC1D0FF;
        } else if (bmv <= 0) {
            c = 0xFFCAD6FF;
        } else if (bmv <= 0.06) {
            c = 0xFFD2DCFF;
        } else if (bmv <= 0.14) {
            c = 0xFFDDE4FF;
        } else if (bmv <= 0.19) {
            c = 0xFFE3E8FF;
        } else if (bmv <= 0.31) {
            c = 0xFFF2F2FF;
        } else if (bmv <= 0.36) {
            c = 0xFFF9F6FF;
        } else if (bmv <= 0.43) {
            c = 0xFFFFF9FC;
        } else if (bmv <= 0.54) {
            c = 0xFFFFF6F3;
        } else if (bmv <= 0.59) {
            c = 0xFFFFF3EB;
        } else if (bmv <= 0.63) {
            c = 0xFFFFF1E7;
        } else if (bmv <= 0.66) {
            c = 0xFFFFEFE1;
        } else if (bmv <= 0.74) {
            c = 0xFFFFEEDD;
        } else if (bmv <= 0.82) {
            c = 0xFFFFEAD5;
        } else if (bmv <= 0.92) {
            c = 0xFFFFE4C4;
        } else if (bmv <= 1.15) {
            c = 0xFFFFFDFB8;
        } else if (bmv <= 1.3) {
            c = 0xFFFFDDB4;
        } else if (bmv <= 1.41) {
            c = 0xFFFFD39D;
        } else if (bmv <= 1.48) {
            c = 0xFFFFCD91;
        } else if (bmv <= 1.52) {
            c = 0xFFFFC987;
        } else if (bmv <= 1.55) {
            c = 0xFFFFC57F;
        } else if (bmv <= 1.56) {
            c = 0xFFFFC177;
        } else if (bmv <= 1.61) {
            c = 0xFFFFBD71;
        } else if (bmv <= 1.72) {
            c = 0xFFFFB866;
        } else if (bmv <= 1.84) {
            c = 0xFFFFB25B;
        } else if (bmv <= 2) {
            c = 0xFFFFAD51;
        }

        this.col = Color.fromInt(c);
    }
};

registerType("Star", [Star, Star$, null]);


// wwtlib.Galaxy

export function Galaxy(br) {
    this.RA = 0;
    this.dec = 0;
    this.distance = 0;
    this.type = 0;
    this.eTypeBucket = 0;
    this.size = 5;
    this.sdssID = 0;
    this.sdssID = br.readInt64();
    this.RA = br.readSingle();
    this.dec = br.readSingle();
    this.distance = br.readSingle();
    this.eTypeBucket = br.readByte();
    this.size = br.readSingle();
}

Galaxy._eTypeBuckets = [-3, -0.186, -0.168, -0.158, -0.15, -0.143, -0.137, -0.13, -0.123, -0.115, -0.104, -0.089, -0.068, -0.042, -0.011, 0.024, 0.064, 0.111, 0.169, 0.252, 3];

Galaxy.getEType = function (value) {
    var a = 0;
    var b = Galaxy._eTypeBuckets.length - 1;
    while (b - a > 1) {
        var m = (a + b) / 2;
        if (value > Galaxy._eTypeBuckets[m]) {
            a = m;
        } else {
            b = m;
        }
    }
    return a;
};

var Galaxy$ = {};

registerType("Galaxy", [Galaxy, Galaxy$, null]);
