// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A filter that can match various sets of constellations.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { BlendState } from "./blend_state.js";


// wwtlib.ConstellationFilter
//
// This type was defined in `Constellations.js`, but we've moved it here to
// break circular dependencies.

export function ConstellationFilter() {
    this.bits = new Array(3);
    this.oldBits = new Array(3);
    this.blendState = BlendState.create(false, 1000);
    this.internal = false;
    this.settingsOwned = false;
    for (var i = 0; i < 3; i++) {
        this.bits[i] = ~this.bits[i];
        this.oldBits[i] = this.bits[i];
    }
}

ConstellationFilter.families = {};

// These are populated in `Constellations._centroidsReady()`.
ConstellationFilter.bitIDs = {};

ConstellationFilter.buildConstellationFilters = function () {
    var all = ConstellationFilter.get_allConstellation();
    all.internal = true;
    ConstellationFilter.families['AllConstellation'] = all;
    ConstellationFilter.families['Zodiacal'] = ConstellationFilter.get_zodiacal();
    ConstellationFilter.families['Ursa Major Family'] = ConstellationFilter.get_ursaMajorFamily();
    ConstellationFilter.families['Perseus Family'] = ConstellationFilter.get_perseusFamily();
    ConstellationFilter.families['Hercules Family'] = ConstellationFilter.get_herculesFamily();
    ConstellationFilter.families['Orion Family'] = ConstellationFilter.get_orionFamily();
    ConstellationFilter.families['Heavenly Waters'] = ConstellationFilter.get_heavenlyWaters();
    ConstellationFilter.families['Bayer Family'] = ConstellationFilter.get_bayerFamily();
    ConstellationFilter.families['La Caille Family'] = ConstellationFilter.get_laCaileFamily();
};

ConstellationFilter.saveCustomFilters = function () {
    var sb = new ss.StringBuilder();
    var $dict1 = ConstellationFilter.families;
    for (var $key2 in $dict1) {
        var kv = { key: $key2, value: $dict1[$key2] };
        if (!kv.value.internal) {
            sb.append(kv.key);
            sb.append(';');
            sb.appendLine(kv.value.toString());
        }
    }
};

ConstellationFilter.get_allConstellation = function () {
    var all = new ConstellationFilter();
    all.setAll(true);
    return all;
};

ConstellationFilter.get_zodiacal = function () {
    var zodiacal = new ConstellationFilter();
    zodiacal.set('ARI', true);
    zodiacal.set('TAU', true);
    zodiacal.set('GEM', true);
    zodiacal.set('CNC', true);
    zodiacal.set('LEO', true);
    zodiacal.set('VIR', true);
    zodiacal.set('LIB', true);
    zodiacal.set('SCO', true);
    zodiacal.set('SGR', true);
    zodiacal.set('CAP', true);
    zodiacal.set('AQR', true);
    zodiacal.set('PSC', true);
    zodiacal.internal = true;
    return zodiacal;
};

ConstellationFilter.get_ursaMajorFamily = function () {
    var uma = new ConstellationFilter();
    uma.set('UMA', true);
    uma.set('UMI', true);
    uma.set('DRA', true);
    uma.set('CVN', true);
    uma.set('BOO', true);
    uma.set('COM', true);
    uma.set('CRB', true);
    uma.set('CAM', true);
    uma.set('LYN', true);
    uma.set('LMI', true);
    uma.internal = true;
    return uma;
};

ConstellationFilter.get_perseusFamily = function () {
    var Perseus = new ConstellationFilter();
    Perseus.set('CAS', true);
    Perseus.set('CEP', true);
    Perseus.set('AND', true);
    Perseus.set('PER', true);
    Perseus.set('PEG', true);
    Perseus.set('CET', true);
    Perseus.set('AUR', true);
    Perseus.set('LAC', true);
    Perseus.set('TRI', true);
    Perseus.internal = true;
    return Perseus;
};

ConstellationFilter.get_herculesFamily = function () {
    var hercules = new ConstellationFilter();
    hercules.set('HER', true);
    hercules.set('SGE', true);
    hercules.set('AQL', true);
    hercules.set('LYR', true);
    hercules.set('CYG', true);
    hercules.set('VUL', true);
    hercules.set('HYA', true);
    hercules.set('SEX', true);
    hercules.set('CRT', true);
    hercules.set('CRV', true);
    hercules.set('OPH', true);
    hercules.set('SER1', true);
    hercules.set('SER2', true);
    hercules.set('SCT', true);
    hercules.set('CEN', true);
    hercules.set('LUP', true);
    hercules.set('CRA', true);
    hercules.set('ARA', true);
    hercules.set('TRA', true);
    hercules.set('CRU', true);
    hercules.internal = true;
    return hercules;
};

ConstellationFilter.get_orionFamily = function () {
    var orion = new ConstellationFilter();
    orion.set('ORI', true);
    orion.set('CMA', true);
    orion.set('CMI', true);
    orion.set('MON', true);
    orion.set('LEP', true);
    orion.internal = true;
    return orion;
};

ConstellationFilter.get_heavenlyWaters = function () {
    var waters = new ConstellationFilter();
    waters.set('DEL', true);
    waters.set('EQU', true);
    waters.set('ERI', true);
    waters.set('PSA', true);
    waters.set('CAR', true);
    waters.set('PUP', true);
    waters.set('VEL', true);
    waters.set('PYX', true);
    waters.set('COL', true);
    waters.internal = true;
    return waters;
};

ConstellationFilter.get_bayerFamily = function () {
    var bayer = new ConstellationFilter();
    bayer.set('HYA', true);
    bayer.set('DOR', true);
    bayer.set('VOL', true);
    bayer.set('APS', true);
    bayer.set('PAV', true);
    bayer.set('GRU', true);
    bayer.set('PHE', true);
    bayer.set('TUC', true);
    bayer.set('IND', true);
    bayer.set('CHA', true);
    bayer.set('MUS', true);
    bayer.internal = true;
    return bayer;
};

ConstellationFilter.get_laCaileFamily = function () {
    var LaCaile = new ConstellationFilter();
    LaCaile.set('NOR', true);
    LaCaile.set('CIR', true);
    LaCaile.set('TEL', true);
    LaCaile.set('MIC', true);
    LaCaile.set('SCL', true);
    LaCaile.set('FOR', true);
    LaCaile.set('CAE', true);
    LaCaile.set('HOR', true);
    LaCaile.set('OCT', true);
    LaCaile.set('MEN', true);
    LaCaile.set('RET', true);
    LaCaile.set('PIC', true);
    LaCaile.set('ANT', true);
    LaCaile.internal = true;
    return LaCaile;
};

ConstellationFilter.parse = function (val) {
    var parts = (val).split(',');
    var cf = new ConstellationFilter();
    try {
        for (var i = 0; i < 3; i++) {
            cf.bits[i] = parseInt(parts[i]);
        }
    }
    catch ($e1) { }
    return cf;
};

var ConstellationFilter$ = {
    _saveBits: function () {
        for (var i = 0; i < 3; i++) {
            this.oldBits[i] = this.bits[i];
        }
    },

    _isChanged: function () {
        for (var i = 0; i < 3; i++) {
            if (this.oldBits[i] !== this.bits[i]) {
                return true;
            }
        }
        return false;
    },

    _checkChanged: function () {
        if (this._isChanged()) {
            this._fireChanged();
        }
    },

    isEnabled: function (abbrev) {
        var bitID = ConstellationFilter.bitIDs[abbrev];
        var index = bitID / 32;
        bitID = bitID % 32;
        return this.blendState.get_state() && !!((1 << bitID) & this.bits[index]);
    },

    isSet: function (abbrev) {
        this._saveBits();
        var bitID = ConstellationFilter.bitIDs[abbrev];
        var index = ss.truncate((bitID / 32));
        bitID = bitID % 32;
        return !!((1 << bitID) & this.bits[index]);
    },

    set: function (abbrev, state) {
        this._saveBits();
        var bitID = ConstellationFilter.bitIDs[abbrev];
        var index = bitID / 32;
        bitID = bitID % 32;
        if (state) {
            this.bits[index] = this.bits[index] | (1 << bitID);
        } else {
            this.bits[index] = this.bits[index] ^ (1 << bitID);
        }
        this._checkChanged();
    },

    setAll: function (state) {
        this._saveBits();
        for (var bitID = 0; bitID < 89; bitID++) {
            var index = bitID / 32;
            var bit = bitID % 32;
            if (state) {
                this.bits[index] = this.bits[index] | (1 << bit);
            }
            else {
                this.bits[index] = this.bits[index] ^ (1 << bit);
            }
        }
        this._checkChanged();
    },

    setBits: function (bits) {
        this._saveBits();
        for (var i = 0; i < 3; i++) {
            this.bits[i] = (bits[i * 4]) + ((bits[i * 4 + 1]) << 8) + ((bits[i * 4 + 2]) << 16) + ((bits[i * 4 + 3]) << 24);
        }
        this._checkChanged();
    },

    getBits: function () {
        var bits = new Array(12);
        var index = 0;
        for (var i = 0; i < 3; i++) {
            bits[index++] = this.bits[i];
            bits[index++] = (this.bits[i] >> 8);
            bits[index++] = (this.bits[i] >> 16);
            bits[index++] = (this.bits[i] >> 24);
        }
        return bits;
    },

    cloneFilter: function (filter) {
        this._saveBits();
        for (var i = 0; i < 3; i++) {
            this.bits[i] = filter.bits[i];
        }
        this._checkChanged();
    },

    clone: function () {
        var newFilter = new ConstellationFilter();
        newFilter.cloneFilter(this);
        return newFilter;
    },

    combine: function (filter) {
        this._saveBits();
        for (var i = 0; i < 3; i++) {
            this.bits[i] = this.bits[i] | filter.bits[i];
        }
        this._checkChanged();
    },

    remove: function (filter) {
        this._saveBits();
        for (var i = 0; i < 3; i++) {
            this.bits[i] = this.bits[i] & ~filter.bits[i];
        }
        this._checkChanged();
    },

    _fireChanged: function () {
        if (this.settingsOwned) {
        }
    },

    toString: function () {
        return ss.format('{0},{1},{2}', this.bits[0], this.bits[1], this.bits[2]);
    }
};

registerType("ConstellationFilter", [ConstellationFilter, ConstellationFilter$, null]);
