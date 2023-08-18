// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The WWT clock and related calculations.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { DT } from "./astrocalc/date.js";
import { AstroCalc } from "./astrocalc.js";
import { Coordinates } from "./coordinates.js";
import { Settings } from "./settings.js";


// wwtlib.SpaceTimeController

export function SpaceTimeController() { }

SpaceTimeController.framesPerSecond = 30;
SpaceTimeController.frameDumping = false;
SpaceTimeController.cancelFrameDump = false;
SpaceTimeController.currentFrameNumber = 0;
SpaceTimeController.totalFrames = 0;
SpaceTimeController._offset = 0;
SpaceTimeController._syncToClock = true;
SpaceTimeController._timeRate = 1;
SpaceTimeController._altitude = 0;

SpaceTimeController.updateClock = function () {
    if (SpaceTimeController._syncToClock) {
        var justNow = SpaceTimeController.get_metaNow();
        if (SpaceTimeController._timeRate !== 1) {
            var ts = justNow.getTime() - SpaceTimeController.last.getTime();
            var ticks = (ts * SpaceTimeController._timeRate);
            SpaceTimeController._offset += ticks;
        }
        SpaceTimeController.last = justNow;
        try {
            SpaceTimeController._now = new Date(justNow.getTime() + SpaceTimeController._offset);
        }
        catch ($e1) {
            SpaceTimeController._now = new Date(1, 12, 25, 23, 59, 59);
            SpaceTimeController._offset = SpaceTimeController._now - SpaceTimeController.get_metaNow();
        }
        if (SpaceTimeController._now.getFullYear() > 4000) {
            SpaceTimeController._now = new Date(4000, 12, 31, 23, 59, 59);
            SpaceTimeController._offset = SpaceTimeController._now - SpaceTimeController.get_metaNow();
        }
        if (SpaceTimeController._now.getFullYear() < 1) {
            SpaceTimeController._now = new Date(0, 12, 25, 23, 59, 59);
            SpaceTimeController._offset = SpaceTimeController._now - SpaceTimeController.get_metaNow();
        }
    }
};

SpaceTimeController.getTimeForFutureTime = function (delta) {
    try {
        if (SpaceTimeController._syncToClock) {
            var future = new Date((SpaceTimeController.get_now().getTime() + (delta * 1000) * SpaceTimeController._timeRate));
            return future;
        } else {
            return SpaceTimeController.get_now();
        }
    }
    catch ($e1) {
        return SpaceTimeController.get_now();
    }
};

SpaceTimeController.getJNowForFutureTime = function (delta) {
    try {
        if (SpaceTimeController._syncToClock) {
            var future = new Date(SpaceTimeController.get_now().getTime() + ss.truncate((delta * 1000 * SpaceTimeController._timeRate)));
            return SpaceTimeController.utcToJulian(future);
        } else {
            return SpaceTimeController.utcToJulian(SpaceTimeController.get_now());
        }
    }
    catch ($e1) {
        return SpaceTimeController.utcToJulian(SpaceTimeController.get_now());
    }
};

SpaceTimeController.get_now = function () {
    return SpaceTimeController._now;
};

SpaceTimeController.set_now = function (value) {
    SpaceTimeController._now = value;
    SpaceTimeController._offset = SpaceTimeController._now - SpaceTimeController.get_metaNow();
    SpaceTimeController.last = SpaceTimeController.get_metaNow();
    return value;
};

SpaceTimeController.get_metaNow = function () {
    return SpaceTimeController._metaNow;
};

SpaceTimeController.set_metaNow = function (value) {
    if (!SpaceTimeController.frameDumping) {
        SpaceTimeController._metaNow = value;
    }
    return value;
};

SpaceTimeController.nextFrame = function () {
    SpaceTimeController._metaNow.setMilliseconds(SpaceTimeController._metaNow.getMilliseconds() + Math.round(1000 / SpaceTimeController.framesPerSecond));
    SpaceTimeController.currentFrameNumber += 1;
};

SpaceTimeController.get_doneDumping = function () {
    return !SpaceTimeController.frameDumping || SpaceTimeController.cancelFrameDump || (SpaceTimeController.currentFrameNumber >= SpaceTimeController.totalFrames);
};

SpaceTimeController.syncTime = function () {
    SpaceTimeController._offset = 0;
    SpaceTimeController._now = ss.now();
    SpaceTimeController._syncToClock = true;
};

SpaceTimeController.get_jNow = function () {
    return SpaceTimeController.utcToJulian(SpaceTimeController.get_now());
};

SpaceTimeController.get_syncToClock = function () {
    return SpaceTimeController._syncToClock;
};

SpaceTimeController.set_syncToClock = function (value) {
    if (SpaceTimeController._syncToClock !== value) {
        SpaceTimeController._syncToClock = value;
        if (value) {
            SpaceTimeController.last = ss.now();
            SpaceTimeController._offset = SpaceTimeController._now - ss.now();
        } else {
            SpaceTimeController._now = new Date(ss.now().getTime() + SpaceTimeController._offset);
        }
    }
    return value;
};

SpaceTimeController.get_timeRate = function () {
    return SpaceTimeController._timeRate;
};

SpaceTimeController.set_timeRate = function (value) {
    SpaceTimeController._timeRate = value;
    return value;
};

SpaceTimeController.get_altitude = function () {
    return SpaceTimeController._altitude;
};

SpaceTimeController.set_altitude = function (value) {
    SpaceTimeController._altitude = value;
    return value;
};

SpaceTimeController.get_location = function () {
    SpaceTimeController._location = Coordinates.fromLatLng(Settings.get_active().get_locationLat(), Settings.get_active().get_locationLng());
    SpaceTimeController._altitude = Settings.get_active().get_locationAltitude();
    return SpaceTimeController._location;
};

SpaceTimeController.set_location = function (value) {
    if (Settings.get_globalSettings().get_locationLat() !== value.get_lat()) {
        Settings.get_globalSettings().set_locationLat(value.get_lat());
    }
    if (Settings.get_globalSettings().get_locationLng() !== value.get_lng()) {
        Settings.get_globalSettings().set_locationLng(value.get_lng());
    }
    SpaceTimeController._location = value;
    return value;
};

SpaceTimeController.julianToUtc = function (jDate) {
    var date = new DT();
    date.setJD(jDate, true);
    var ms = (date.second() - ss.truncate(date.second())) * 1000;
    return new Date(date.year(), date.month() - 1, date.day(), date.hour(), date.minute(), ss.truncate(date.second()), ss.truncate(ms));
};

SpaceTimeController._twoLineDateToJulian = function (p) {
    var pre1950 = parseInt(p.substring(0, 1)) < 6;
    var year = parseInt(((pre1950) ? ' 20' : '19') + p.substring(0, 2));
    var days = parseFloat(p.substring(2, 3));
    var fraction = parseFloat(p.substr(5));
    var date = new Date(year, 0, 1, 0, 0);
    return SpaceTimeController.utcToJulian(date) + (days - 1 + fraction);
};

SpaceTimeController.julianToTwoLineDate = function (jDate) {
    return SpaceTimeController.dateToTwoLineDate(SpaceTimeController.julianToUtc(jDate));
};

SpaceTimeController.dateToTwoLineDate = function (date) {
    var sb = new ss.StringBuilder();
    sb.append(date.getFullYear() % 100);
    var fullYear = new Date(date.getFullYear(), 0, 1, 0, 0);
    var dayofyear = Math.floor((date - fullYear) / (60 * 60 * 24 * 1000)) + 2;
    var day = dayofyear + date.getHours() / 24 + date.getMinutes() / 60 / 24 + date.getSeconds() / 60 / 60 / 24 + date.getMilliseconds() / 1000 / 60 / 60 / 24;
    var sDay = SpaceTimeController.tleDayString(day);
    sb.append(sDay);
    return sb.toString();
};

SpaceTimeController.tleDayString = function (day) {
    var formated = day.toString();
    var point = formated.indexOf('.');
    if (point === -1) {
        point = formated.length;
        formated += '.0';
    }
    var len = formated.length - point - 1;
    var fill = '00000000';
    formated = fill.substr(0, 3 - point) + formated + fill.substr(0, 8 - len);
    return formated;
};

SpaceTimeController.utcToJulian = function (utc) {
    var year = utc.getUTCFullYear();
    var month = utc.getUTCMonth() + 1;
    var day = utc.getUTCDate();
    var hour = utc.getUTCHours();
    var minute = utc.getUTCMinutes();
    var second = utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000;
    var dblDay = day + (hour / 24) + (minute / 1440) + (second / 86400);
    return AstroCalc.getJulianDay(year, month, dblDay);
};

SpaceTimeController.dateToJD = function (Year, Month, Day, bGregorianCalendar) {
    var Y = Year;
    var M = Month;
    if (M < 3) {
        Y = Y - 1;
        M = M + 12;
    }
    var A = 0;
    var B = 0;
    if (bGregorianCalendar) {
        A = ss.truncate((Y / 100));
        B = 2 - A + ss.truncate((A / 4));
    }
    return ss.truncate((365.25 * (Y + 4716))) + ss.truncate((30.6001 * (M + 1))) + Day + B - 1524.5;
};

var SpaceTimeController$ = {};

registerType("SpaceTimeController", [SpaceTimeController, SpaceTimeController$, null]);
