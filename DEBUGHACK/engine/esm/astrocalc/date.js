// Originally `AADATE.CPP`
// "Purpose: Implementation for the algorithms which convert between the
// Gregorian and Julian calendars and the Julian Day"
//
// Translated into C# and released by Microsoft, then transpiled into JavaScript
// by ScriptSharp, for the WorldWide Telescope project.
//
// The legal notices in the original code are as follows:
//
// Copyright (c) 2003 - 2007 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)
//
// All rights reserved.
//
// Copyright / Usage Details:
//
// You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise)
// when your product is released in binary form. You are allowed to modify the source code in any way you want
// except you cannot modify the copyright details at the top of each module. If you want to distribute source
// code with your application, then you are only allowed to distribute versions released by the author. This is
// to maintain a single distribution point for the source code.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";


// CalD

export function CalD() {
    this.year = 0;
    this.month = 0;
    this.day = 0;
    this.year = 0;
    this.month = 0;
    this.day = 0;
}

CalD.create = function (year, month, day) {
    var item = new CalD();
    item.year = year;
    item.month = month;
    item.day = day;
    return item;
};

var CalD$ = {};

registerType("CalD", [CalD, CalD$, null]);


// DAY_OF_WEEK

export var DAY_OF_WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
};

registerType("DAY_OF_WEEK", DAY_OF_WEEK);


// DT

export function DT() {
    this.m_dblJulian = 0;
    this.m_bGregorianCalendar = false;
    this.m_dblJulian = 0;
    this.m_bGregorianCalendar = false;
}

DT.create = function (Year, Month, Day, bGregorianCalendar) {
    var item = new DT();
    item.set(Year, Month, Day, 0, 0, 0, bGregorianCalendar);
    return item;
};

DT.createHMS = function (Year, Month, Day, Hour, Minute, Second, bGregorianCalendar) {
    var item = new DT();
    item.set(Year, Month, Day, Hour, Minute, Second, bGregorianCalendar);
    return item;
};

DT.createJD = function (JD, bGregorianCalendar) {
    var item = new DT();
    item.setJD(JD, bGregorianCalendar);
    return item;
};

DT.dateToJD = function (Year, Month, Day, bGregorianCalendar) {
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

DT.isLeap = function (Year, bGregorianCalendar) {
    if (bGregorianCalendar) {
        if (!(Year % 100)) {
            return (!(Year % 400)) ? true : false;
        }
        else {
            return (!(Year % 4)) ? true : false;
        }
    }
    else {
        return (!(Year % 4)) ? true : false;
    }
};

DT.afterPapalReform = function (Year, Month, Day) {
    return ((Year > 1582) || ((Year === 1582) && (Month > 10)) || ((Year === 1582) && (Month === 10) && (Day >= 15)));
};

DT.afterPapalReformJD = function (JD) {
    return (JD >= 2299160.5);
};

DT.dayOfYearJD = function (JD, Year, bGregorianCalendar) {
    return JD - DT.dateToJD(Year, 1, 1, bGregorianCalendar) + 1;
};

DT.daysInMonthForMonth = function (Month, bLeap) {
    console.assert(Month >= 1 && Month <= 12);
    var MonthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 0];
    if (bLeap) {
        MonthLength[1]++;
    }
    return MonthLength[Month - 1];
};

DT.INT = function (vvalue) {
    if (vvalue >= 0) {
        return ss.truncate(vvalue);
    }
    else {
        return ss.truncate((vvalue - 1));
    }
};

var DT$ = {
    julian: function () {
        return this.m_dblJulian;
    },

    day: function () {
        var D = this.get();
        return ss.truncate(D[2]);
    },

    month: function () {
        var D = this.get();
        return ss.truncate(D[1]);
    },

    year: function () {
        var D = this.get();
        return ss.truncate(D[0]);
    },

    hour: function () {
        var D = this.get();
        return ss.truncate(D[3]);
    },

    minute: function () {
        var D = this.get();
        return ss.truncate(D[4]);
    },

    second: function () {
        var D = this.get();
        return ss.truncate(D[5]);
    },

    set: function (Year, Month, Day, Hour, Minute, Second, bGregorianCalendar) {
        var dblDay = Day + (Hour / 24) + (Minute / 1440) + (Second / 86400);
        this.setJD(DT.dateToJD(Year, Month, dblDay, bGregorianCalendar), bGregorianCalendar);
    },

    setJD: function (JD, bGregorianCalendar) {
        this.m_dblJulian = JD;
        this.setInGregorianCalendar(bGregorianCalendar);
    },

    setInGregorianCalendar: function (bGregorianCalendar) {
        var bAfterPapalReform = (this.m_dblJulian >= 2299160.5);
        this.m_bGregorianCalendar = bGregorianCalendar && bAfterPapalReform;
    },

    get: function () {
        var Year;
        var Month;
        var Day;
        var Hour;
        var Minute;
        var Second;
        var JD = this.m_dblJulian + 0.5;
        var tempZ = Math.floor(JD);
        var F = JD - tempZ;
        var Z = ss.truncate(tempZ);
        var A;
        if (this.m_bGregorianCalendar) {
            var alpha = ss.truncate(((Z - 1867216.25) / 36524.25));
            A = Z + 1 + alpha - ss.truncate((alpha / 4));
        }
        else {
            A = Z;
        }
        var B = A + 1524;
        var C = ss.truncate(((B - 122.1) / 365.25));
        var D = ss.truncate((365.25 * C));
        var E = ss.truncate(((B - D) / 30.6001));
        var dblDay = B - D - ss.truncate((30.6001 * E)) + F;
        Day = ss.truncate(dblDay);
        if (E < 14) {
            Month = E - 1;
        }
        else {
            Month = E - 13;
        }
        if (Month > 2) {
            Year = C - 4716;
        }
        else {
            Year = C - 4715;
        }
        tempZ = Math.floor(dblDay);
        F = dblDay - tempZ;
        Hour = ss.truncate((F * 24));
        Minute = ss.truncate(((F - Hour / 24) * 1440));
        Second = (F - (Hour / 24) - (Minute / 1440)) * 86400;
        return [Year, Month, Day, Hour, Minute, Second];
    },

    dayOfWeek: function () {
        return (ss.truncate((this.m_dblJulian + 1.5)) % 7);
    },

    dayOfYear: function () {
        var year = ss.truncate(this.get()[0]);
        return DT.dayOfYearJD(this.m_dblJulian, year, DT.afterPapalReform(year, 1, 1));
    },

    daysInMonth: function () {
        var D = this.get();
        var Year = ss.truncate(D[0]);
        var Month = ss.truncate(D[1]);
        return DT.daysInMonthForMonth(Month, DT.isLeap(Year, this.m_bGregorianCalendar));
    },

    daysInYear: function () {
        var D = this.get();
        var Year = ss.truncate(D[0]);
        if (DT.isLeap(Year, this.m_bGregorianCalendar)) {
            return 366;
        }
        else {
            return 365;
        }
    },

    leap: function () {
        return DT.isLeap(this.year(), this.m_bGregorianCalendar);
    },

    inGregorianCalendar: function () {
        return this.m_bGregorianCalendar;
    },

    fractionalYear: function () {
        var D = this.get();
        var Year = ss.truncate(D[0]);
        var Month = ss.truncate(D[1]);
        var Day = ss.truncate(D[2]);
        var Hour = ss.truncate(D[3]);
        var Minute = ss.truncate(D[4]);
        var Second = D[5];
        var DaysInYear;
        if (DT.isLeap(Year, this.m_bGregorianCalendar)) {
            DaysInYear = 366;
        }
        else {
            DaysInYear = 365;
        }
        return Year + ((this.m_dblJulian - DT.dateToJD(Year, 1, 1, DT.afterPapalReform(Year, 1, 1))) / DaysInYear);
    }
};

registerType("DT", [DT, DT$, null]);
