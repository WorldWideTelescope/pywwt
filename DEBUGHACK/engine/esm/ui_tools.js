// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses a HEALPix projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";


// wwtlib.UiTools

export function UiTools() { }

UiTools.kilometersPerAu = 149598000;
UiTools.auPerParsec = 206264.806;
UiTools.auPerLightYear = 63239.6717;
UiTools.ssmUnitConversion = 370; // No idea where this fudge factor comes from

UiTools.gamma = function (val, gamma) {
    return Math.min(255, ss.truncate(((255 * Math.pow(val / 255, 1 / gamma)) + 0.5)));
};

UiTools.getNamesStringFromArray = function (array) {
    var names = '';
    var delim = '';
    var $enum1 = ss.enumerate(array);
    while ($enum1.moveNext()) {
        var name = $enum1.current;
        names += delim;
        names += name;
        delim = ';';
    }
    return names;
};

UiTools.solarSystemToMeters = function (SolarSystemCameraDistance) {
    return SolarSystemCameraDistance * 149598000 * 370;
};

UiTools.metersToSolarSystemDistance = function (meters) {
    return meters / 370 * 149598000;
};

UiTools.metersToZoom = function (meters) {
    return ((meters / 1000 / 370) - 1E-06) / 4 * 9;
};

// Distance is stored in AU in WWT but is displayed in KM AU, LY, MPC
UiTools.formatDistance = function (distance) {
    if (distance < 0.1) {
        var km = (distance * 149598000);
        if (km < 10) {
            var m = ss.truncate((km * 1000));
            return ss.format('{0} m', m);
        } else {
            km = ss.truncate(km);
            return ss.format('{0} km', km);
        }
    }
    else if (distance < (10)) {
        var au = ss.truncate((distance * 10)) / 10;
        return ss.format('{0} au', au);
    }
    else if (distance < (63239.6717 / 10)) {
        var au = ss.truncate(distance);
        return ss.format('{0} au', au);
    }
    else if (distance < (63239.6717 * 10)) {
        var ly = ss.truncate(((distance * 10) / 63239.6717)) / 10;
        return ss.format('{0} ly', ly);
    }
    else if (distance < (63239.6717 * 1000000)) {
        var ly = ss.truncate((distance / 63239.6717));
        return ss.format('{0} ly', ly);
    }
    else if (distance < (206264.806 * 10000000)) {
        var mpc = ss.truncate(((distance * 10) / (206264.806 * 1000000))) / 10;
        return ss.format('{0} Mpc', mpc);
    }
    else if (distance < (206264.806 * 1000000000)) {
        var mpc = ss.truncate((distance / (206264.806 * 1000000)));
        return ss.format('{0} Mpc', mpc);
    }
    else {
        var mpc = ss.truncate(((distance * 10) / (206264.806 * 1000000000))) / 10;
        return ss.format('{0} Gpc', mpc);
    }
};

UiTools.formatDecimalHours = function (dayFraction) {
    var today = ss.now();
    var ts = today.getTimezoneOffset() / 60;
    ts = 0;
    var day = (dayFraction - ts) + 0.0083333334;
    while (day > 24) {
        day -= 24;
    }
    while (day < 0) {
        day += 24;
    }
    var hours = ss.truncate(day);
    var minutes = ss.truncate(((day * 60) - (hours * 60)));
    var seconds = ss.truncate(((day * 3600) - ((hours * 3600) + (minutes * 60))));
    return ss.format('{0}:{1}', hours, minutes, seconds);
};

UiTools.splitString = function (data, delimiter) {
    var output = [];
    var nestingLevel = 0;
    var current = 0;
    var count = 0;
    var start = 0;
    while (current < data.length) {
        if (data.substr(current, 1) === '(') {
            nestingLevel++;
        }
        if (data.substr(current, 1) === ')') {
            nestingLevel--;
        }
        if (current === (data.length - 1)) {
            if (data.substr(current, 1) === delimiter) {
                output.push(data.substr(start, count));
                output.push('');
                return output;
            }
            else {
                count++;
            }
        }
        if (current === (data.length - 1) || (data.substr(current, 1) === delimiter && delimiter === '\t') || (!nestingLevel && data.substr(current, 1) === delimiter)) {
            output.push(data.substr(start, count));
            start = current + 1;
            count = 0;
        } else {
            count++;
        }
        current++;
    }
    return output;
};

UiTools.split = function (data, delimiters) {
    var output = [];
    var nestingLevel = 0;
    var current = 0;
    var count = 0;
    var start = 0;
    while (current < data.length) {
        if (current === (data.length - 1)) {
            count++;
        }
        if (current === (data.length - 1) || delimiters.indexOf(data.substr(current, 1)) > -1) {
            output.push(data.substr(start, count));
            start = current + 1;
            count = 0;
        } else {
            count++;
        }
        current++;
    }
    return output;
};

UiTools._beep = function () { };

var UiTools$ = {};

registerType("UiTools", [UiTools, UiTools$, null]);
