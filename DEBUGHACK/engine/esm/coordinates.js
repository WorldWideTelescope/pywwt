// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Routines for coordinate transformations
//
// NB: these functions are redundant in the webclient because we don't have the
// single-precision `Vector3` type that's distinguished from `Vector3d`. To
// minimize the code delta from Windows, we keep both names for simplicity. But
// the `...Rad` functions are added because ScriptSharp can't deal with
// overloads.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { Util } from "./baseutil.js";
import { Vector2d, Vector3d } from "./double3d.js";


// wwtlib.Coordinates

export function Coordinates(ascention, declination) {
    // Held in radians
    this._ascention = 0;
    this._declination = 0;
    this._ascention = ascention + (Math.PI * 80) % (Math.PI * 2);
    this._declination = declination;
}

Coordinates.RC = (3.1415927 / 180);
Coordinates.RCRA = (3.1415927 / 12);
Coordinates.radius = 1;
Coordinates._rotationMatrix = null;

Coordinates.geoTo3d = function (lat, lng) {
    return Vector3d.create(Math.cos(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * 1, Math.sin(lat * Coordinates.RC) * 1, Math.sin(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * 1);
};

Coordinates.geoTo3dDouble = function (lat, lng) {
    return Vector3d.create(Math.cos(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * 1, Math.sin(lat * Coordinates.RC) * 1, Math.sin(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * 1);
};

Coordinates.geoTo3dRad = function (lat, lng, radius) {
    return Vector3d.create(Math.cos(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * radius, Math.sin(lat * Coordinates.RC) * radius, Math.sin(lng * Coordinates.RC) * Math.cos(lat * Coordinates.RC) * radius);
};

Coordinates.raDecTo3d = function (ra, dec) {
    return Vector3d.create(Math.cos(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * 1, Math.sin(dec * Coordinates.RC) * 1, Math.sin(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * 1);
};

Coordinates.raDecTo3dAu = function (ra, dec, au) {
    return Vector3d.create(Math.cos(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * au, Math.sin(dec * Coordinates.RC) * au, Math.sin(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * au);
};

Coordinates.raDecTo3dMat = function (ra, dec, mat) {
    return Vector3d._transformCoordinate(Vector3d.create((Math.cos(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * 1), (Math.sin(dec * Coordinates.RC) * 1), (Math.sin(ra * Coordinates.RCRA) * Math.cos(dec * Coordinates.RC) * 1)), mat);
};

Coordinates.raDecTo3dPointRad = function (point, radius) {
    point.set_dec(-point.get_dec());
    return Vector3d.create((Math.cos(point.get_RA() * Coordinates.RCRA) * Math.cos(point.get_dec() * Coordinates.RC) * radius), (Math.sin(point.get_dec() * Coordinates.RC) * radius), (Math.sin(point.get_RA() * Coordinates.RCRA) * Math.cos(point.get_dec() * Coordinates.RC) * radius));
};

Coordinates.sterographicTo3d = function (x, y, radius, standardLat, meridean, falseEasting, falseNorthing, scale, north) {
    var lat = 90;
    var lng = 0;
    x -= falseEasting;
    y -= falseNorthing;
    if (!!x || !!y) {
        var re = (1 + Math.sin(Math.abs(standardLat) / 180 * Math.PI)) * 6371000 / scale;
        var rere = re * re;
        var c1 = 180 / Math.PI;
        if (!x) {
            lng = (90 * y < 0) ? -1 : 1;
        } else {
            lng = Math.atan2(y, x) * c1;
        }
        var len = (x * x) + (y * y);
        lat = (rere - len) / (rere + len);
        lat = Math.asin(lat) * c1;
        if (!north) {
            lat = -lat;
            lng = -lng;
            meridean = -meridean;
        }
    }
    return Coordinates.geoTo3dRad(lat, 90 + lng + meridean, radius);
};

Coordinates.equitorialToHorizon = function (equitorial, location, utc) {
    var hourAngle = Coordinates.mstFromUTC2(utc, location.get_lng()) - (equitorial.get_RA() * 15);
    if (hourAngle < 0) {
        hourAngle += 360;
    }
    var ha = hourAngle * Coordinates.RC;
    var dec = equitorial.get_dec() * Coordinates.RC;
    var lat = location.get_lat() * Coordinates.RC;
    var sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
    var altitude = Math.asin(sinAlt);
    var cosAzimith = (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) / (Math.cos(altitude) * Math.cos(lat));
    var azimuth = Math.acos(cosAzimith);
    var altAz = new Coordinates(azimuth, altitude);
    if (Math.sin(ha) > 0) {
        altAz.set_az((360 - altAz.get_az()));
    }
    return altAz;
};

Coordinates.horizonToEquitorial = function (altAz, location, utc) {
    var hourAngle = Coordinates.mstFromUTC2(utc, location.get_lng());
    var haLocal;
    var declination;
    var raDec = Coordinates._altAzToRaDec(altAz.get_alt() * Coordinates.RC, altAz.get_az() * Coordinates.RC, location.get_lat() * Coordinates.RC);
    haLocal = raDec.x;
    declination = raDec.y;
    var ha = (haLocal / Coordinates.RC);
    hourAngle += ha;
    if (hourAngle < 0) {
        hourAngle += 360;
    }
    if (hourAngle > 360) {
        hourAngle -= 360;
    }
    return Coordinates.fromRaDec(hourAngle / 15, declination / Coordinates.RC);
};

Coordinates._altAzToRaDec = function (Altitude, Azimuth, Latitude) {
    var hrAngle = 0;
    var dec = 0;
    Azimuth = Math.PI - Azimuth;
    if (Azimuth < 0) {
        Azimuth += Math.PI * 2;
    }
    hrAngle = Math.atan2(Math.sin(Azimuth), Math.cos(Azimuth) * Math.sin(Latitude) + Math.tan(Altitude) * Math.cos(Latitude));
    if (hrAngle < 0) {
        hrAngle += Math.PI * 2;
    }
    dec = Math.asin(Math.sin(Latitude) * Math.sin(Altitude) - Math.cos(Latitude) * Math.cos(Altitude) * Math.cos(Azimuth));
    return Vector2d.create(hrAngle, dec);
};

Coordinates.mstFromUTC2 = function (utc, lng) {
    var year = utc.getUTCFullYear();
    var month = utc.getUTCMonth() + 1;
    var day = utc.getUTCDate();
    var hour = utc.getUTCHours();
    var minute = utc.getUTCMinutes();
    var second = utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000;
    if (month === 1 || month === 2) {
        year -= 1;
        month += 12;
    }
    var a = ss.truncate((year / 100));
    var b = 2 - a + Math.floor((a / 4));
    var c = Math.floor(365.25 * year);
    var d = Math.floor(30.6001 * (month + 1));
    var julianDays;
    var julianCenturies;
    var mst;
    julianDays = b + c + d - 730550.5 + day + (hour + minute / 60 + second / 3600) / 24;
    julianCenturies = julianDays / 36525;
    mst = 280.46061837 + 360.98564736629 * julianDays + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;
    if (mst > 0) {
        while (mst > 360) {
            mst = mst - 360;
        }
    }
    else {
        while (mst < 0) {
            mst = mst + 360;
        }
    }
    return mst;
};

Coordinates.cartesianToSpherical = function (vector) {
    var ascention;
    var declination;
    var radius = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    var XZ = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
    declination = Math.asin(vector.y / radius);
    if (0 < vector.x) {
        ascention = Math.asin(vector.z / XZ);
    }
    else if (0 > vector.x) {
        ascention = Math.PI - Math.asin(vector.z / XZ);
    }
    else {
        ascention = 0;
    }
    return new Coordinates(ascention, declination);
};

Coordinates.cartesianToSpherical2 = function (vector) {
    var rho = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    var longitude = Math.atan2(vector.z, vector.x);
    var latitude = Math.asin(vector.y / rho);
    return new Coordinates(longitude, latitude);
};

Coordinates.cartesianToSphericalSky = function (vector) {
    var rho = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    var ra = Math.atan2(vector.z, vector.x);
    var dec = Math.asin(-vector.y / rho);
    return Vector2d.create(ra / Math.PI * 12, dec / Math.PI * 180);
};

Coordinates.sphericalSkyToCartesian = function (vector) {
    var ra = vector.x * (Math.PI / 12);
    var dec = vector.y * (Math.PI / 180);
    var x = Math.cos(ra) * Math.cos(dec);
    var y = -Math.sin(dec);
    var z = Math.sin(ra) * Math.cos(dec);
    return Vector3d.create(x, y, z);
};

Coordinates.cartesianToLatLng = function (vector) {
    var rho = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    var longitude = Math.atan2(vector.z, vector.x);
    var latitude = Math.asin(vector.y / rho);
    return Vector2d.create(longitude * 180 / Math.PI, latitude * 180 / Math.PI);
};

Coordinates.cartesianToSpherical3 = function (vector) {
    var rho = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    var longitude = Math.atan2(vector.z, vector.x);
    var latitude = Math.asin(vector.y / rho);
    return new Coordinates(longitude, latitude);
};

Coordinates.sign = function (target) {
    return (target < 0) ? -1 : 1;
};

Coordinates.formatDMSSign = function (angle, sign) {
    try {
        angle += (Coordinates.sign(angle) * 0.0001388888888889);
        var degrees = ss.truncate(angle);
        var minutes = ((angle - ss.truncate(angle)) * 60);
        var seconds = ((minutes - ss.truncate(minutes)) * 60);
        if (sign) {
            var signString = (angle > 0) ? '+' : '-';
            return ss.format('{3}{0:00;00}:{1:00}:{2:00}', degrees, Math.abs(ss.truncate(minutes)), Math.abs(ss.truncate(seconds)), signString);
        } else {
            return ss.format('{0:00}:{1:00}:{2:00}', degrees, Math.abs(ss.truncate(minutes)), Math.abs(ss.truncate(seconds)));
        }
    }
    catch ($e1) {
        return '';
    }
};

Coordinates.twoPlaces = function (val) {
    var num = val.toString();
    if (num.length < 2) {
        num = '0' + num;
    }
    return num;
};

Coordinates.formatDMS = function (angle) {
    try {
        angle += (((angle < 0) ? -1 : 1) * 0.0001388888888889);
        var degrees = Math.abs(ss.truncate(angle));
        var minutes = ((angle - ss.truncate(angle)) * 60);
        var seconds = ((minutes - ss.truncate(minutes)) * 60);
        var sign = (angle < 0) ? '-' : '';
        return ss.format('{3}{0}:{1}:{2}', Math.abs(degrees), Coordinates.twoPlaces(Math.abs(ss.truncate(minutes))), Coordinates.twoPlaces(Math.abs(ss.truncate(seconds))), sign);
    }
    catch ($e1) {
        return '';
    }
};

Coordinates.formatDMSWide = function (angle) {
    try {
        angle += (Coordinates.sign(angle) * 0.0001388888888889);
        var degrees = Math.abs(ss.truncate(angle));
        var minutes = ((angle - ss.truncate(angle)) * 60);
        var seconds = ((minutes - ss.truncate(minutes)) * 60);
        var sign = (angle < 0) ? '-' : '';
        return ss.format('{3}{0:00} : {1:00} : {2:00}', degrees, Math.abs(ss.truncate(minutes)), Math.abs(ss.truncate(seconds)), sign);
    }
    catch ($e1) {
        return '';
    }
};

Coordinates.formatHMS = function (angle) {
    try {
        angle += (Coordinates.sign(angle) * 0.0001388888888889);
        var degrees = ss.truncate(angle);
        var minutes = ((angle - ss.truncate(angle)) * 60);
        var seconds = ((minutes - ss.truncate(minutes)) * 60);
        return ss.format('{0:00}h{1:00}m{2:00}s', degrees, Math.abs(ss.truncate(minutes)), Math.abs(ss.truncate(seconds)));
    }
    catch ($e1) {
        return '';
    }
};

Coordinates.parseRA = function (data, degrees) {
    data = ss.trim(data).toLowerCase();
    if (data.indexOf('d') > -1 || data.indexOf('\u00b0') > -1) {
        degrees = true;
    }
    if (data.indexOf('h') > -1 || data.indexOf(':') > -1) {
        degrees = false;
    }
    var ra = Coordinates.parse(data) / ((degrees) ? 15 : 1);
    return Math.max(Math.min(ra, 24), 0);
};

Coordinates.parseDec = function (data) {
    var dec = Coordinates.parse(data);
    return Math.max(Math.min(dec, 90), -90);
};

Coordinates.parse = function (data) {
    try {
        data = ss.trim(data).toLowerCase();
        data = ss.replaceString(ss.replaceString(ss.replaceString(ss.replaceString(ss.replaceString(ss.replaceString(data, 'd ', 'd'), 'h ', 'h'), 'm ', 'm'), 's ', 's'), "' ", "'"), '" ', '"');
        if (Util.stringContains(data, [':', ' ', 'd', 'h', 'm', 's', "'", '"', '\u00b0'])) {
            var hours = 0;
            var minutes = 0;
            var seconds = 0;
            var sign = 0;
            var parts = Util.splitString(data, [':', ' ', 'd', 'h', 'm', 's', "'", '"', '\u00b0']);
            if (parts.length > 0) {
                if (!ss.emptyString(parts[0])) {
                    hours = Math.abs(parseFloat(parts[0]));
                    sign = (parseFloat(parts[0]) < 0) ? -1 : 1;
                    if (parts[0].indexOf('-') > -1) {
                        sign = -1;
                    }
                }
            }
            if (parts.length > 1) {
                if (!ss.emptyString(parts[1])) {
                    minutes = parseFloat(parts[1]);
                }
            }
            if (parts.length > 2) {
                if (!ss.emptyString(parts[2])) {
                    seconds = parseFloat(parts[2]);
                }
            }
            if (!sign) {
                sign = 1;
            }
            return sign * (hours + minutes / 60 + seconds / 3600);
        } else {
            var val = 0;
            try {
                val = parseFloat(data);
            }
            catch ($e1) {
                val = 0;
            }
            return val;
        }
    }
    catch ($e2) {
        return 0;
    }
};

Coordinates.fromRaDec = function (ra, dec) {
    return new Coordinates((ra - 12) * 15 * Coordinates.RC, dec * Coordinates.RC);
};

Coordinates.fromLatLng = function (lat, lng) {
    return new Coordinates(lng * Coordinates.RC, lat * Coordinates.RC);
};

Coordinates.dmsToDegrees = function (Degrees, Minutes, Seconds) {
    return Degrees + Minutes / 60 + Seconds / 3600;
};

Coordinates.degreesToRadians = function (Degrees) {
    return Degrees * 0.0174532925199433;
};

Coordinates.radiansToDegrees = function (Radians) {
    return Radians * 57.2957795130823;
};

Coordinates.radiansToHours = function (Radians) {
    return Radians * 3.81971863420549;
};

Coordinates.hoursToRadians = function (Hours) {
    return Hours * 0.261799387799149;
};

Coordinates.hoursToDegrees = function (Hours) {
    return Hours * 15;
};

Coordinates.degreesToHours = function (Degrees) {
    return Degrees / 15;
};

Coordinates.PI = function () {
    return 3.14159265358979;
};

Coordinates.mapTo0To360Range = function (Degrees) {
    var Value = Degrees;
    while (Value < 0) {
        Value += 360;
    }
    while (Value > 360) {
        Value -= 360;
    }
    return Value;
};

Coordinates.mapTo0To24Range = function (HourAngle) {
    var Value = HourAngle;
    while (Value < 0) {
        Value += 24;
    }
    while (Value > 24) {
        Value -= 24;
    }
    return Value;
};

Coordinates.meanObliquityOfEcliptic = function (JD) {
    var U = (JD - 2451545) / 3652500;
    var Usquared = U * U;
    var Ucubed = Usquared * U;
    var U4 = Ucubed * U;
    var U5 = U4 * U;
    var U6 = U5 * U;
    var U7 = U6 * U;
    var U8 = U7 * U;
    var U9 = U8 * U;
    var U10 = U9 * U;
    return Coordinates.dmsToDegrees(23, 26, 21.448) - Coordinates.dmsToDegrees(0, 0, 4680.93) * U - Coordinates.dmsToDegrees(0, 0, 1.55) * Usquared + Coordinates.dmsToDegrees(0, 0, 1999.25) * Ucubed - Coordinates.dmsToDegrees(0, 0, 51.38) * U4 - Coordinates.dmsToDegrees(0, 0, 249.67) * U5 - Coordinates.dmsToDegrees(0, 0, 39.05) * U6 + Coordinates.dmsToDegrees(0, 0, 7.12) * U7 + Coordinates.dmsToDegrees(0, 0, 27.87) * U8 + Coordinates.dmsToDegrees(0, 0, 5.79) * U9 + Coordinates.dmsToDegrees(0, 0, 2.45) * U10;
};

Coordinates.j2000toGalactic = function (J2000RA, J2000DEC) {
    var J2000pos = [Math.cos(J2000RA / 180 * Math.PI) * Math.cos(J2000DEC / 180 * Math.PI), Math.sin(J2000RA / 180 * Math.PI) * Math.cos(J2000DEC / 180 * Math.PI), Math.sin(J2000DEC / 180 * Math.PI)];
    if (Coordinates._rotationMatrix == null) {
        Coordinates._rotationMatrix = new Array(3);
        Coordinates._rotationMatrix[0] = [-0.0548755604, -0.8734370902, -0.4838350155];
        Coordinates._rotationMatrix[1] = [0.4941094279, -0.44482963, 0.7469822445];
        Coordinates._rotationMatrix[2] = [-0.867666149, -0.1980763734, 0.4559837762];
    }
    var Galacticpos = new Array(3);
    for (var i = 0; i < 3; i++) {
        Galacticpos[i] = J2000pos[0] * Coordinates._rotationMatrix[i][0] + J2000pos[1] * Coordinates._rotationMatrix[i][1] + J2000pos[2] * Coordinates._rotationMatrix[i][2];
    }
    var GalacticL2 = Math.atan2(Galacticpos[1], Galacticpos[0]);
    if (GalacticL2 < 0) {
        GalacticL2 = GalacticL2 + 2 * Math.PI;
    }
    if (GalacticL2 > 2 * Math.PI) {
        GalacticL2 = GalacticL2 - 2 * Math.PI;
    }
    var GalacticB2 = Math.atan2(Galacticpos[2], Math.sqrt(Galacticpos[0] * Galacticpos[0] + Galacticpos[1] * Galacticpos[1]));
    return [GalacticL2 / Math.PI * 180, GalacticB2 / Math.PI * 180];
};

Coordinates.galacticTo3dDouble = function (l, b) {
    var result = Coordinates.galactictoJ2000(l, b);
    return Coordinates.raDecTo3dAu(result[0] / 15, result[1], 1);
};

Coordinates.galactictoJ2000 = function (GalacticL2, GalacticB2) {
    var Galacticpos = [Math.cos(GalacticL2 / 180 * Math.PI) * Math.cos(GalacticB2 / 180 * Math.PI), Math.sin(GalacticL2 / 180 * Math.PI) * Math.cos(GalacticB2 / 180 * Math.PI), Math.sin(GalacticB2 / 180 * Math.PI)];
    if (Coordinates._rotationMatrix == null) {
        Coordinates._rotationMatrix = new Array(3);
        Coordinates._rotationMatrix[0] = [-0.0548755604, -0.8734370902, -0.4838350155];
        Coordinates._rotationMatrix[1] = [0.4941094279, -0.44482963, 0.7469822445];
        Coordinates._rotationMatrix[2] = [-0.867666149, -0.1980763734, 0.4559837762];
    }
    var J2000pos = new Array(3);
    for (var i = 0; i < 3; i++) {
        J2000pos[i] = Galacticpos[0] * Coordinates._rotationMatrix[0][i] + Galacticpos[1] * Coordinates._rotationMatrix[1][i] + Galacticpos[2] * Coordinates._rotationMatrix[2][i];
    }
    var J2000RA = Math.atan2(J2000pos[1], J2000pos[0]);
    if (J2000RA < 0) {
        J2000RA = J2000RA + 2 * Math.PI;
    }
    if (J2000RA > 2 * Math.PI) {
        J2000RA = J2000RA - 2 * Math.PI;
    }
    var J2000DEC = Math.atan2(J2000pos[2], Math.sqrt(J2000pos[0] * J2000pos[0] + J2000pos[1] * J2000pos[1]));
    return [J2000RA / Math.PI * 180, J2000DEC / Math.PI * 180];
};

var Coordinates$ = {
    distance: function (pointB) {
        var y = this.get_lat();
        var x = this.get_lng() * Math.cos(y * Coordinates.RC);
        var y1 = pointB.get_lat();
        var x1 = pointB.get_lng() * Math.cos(y1 * Coordinates.RC);
        return Math.sqrt((y - y1) * (y - y1) + (x - x1) * (x - x1));
    },

    distance3d: function (pointB) {
        var pnt1 = Coordinates.geoTo3dDouble(pointB.get_lat(), pointB.get_lng());
        var pnt2 = Coordinates.geoTo3dDouble(this.get_lat(), this.get_lng());
        var pntDiff = Vector3d.subtractVectors(pnt1, pnt2);
        return pntDiff.length() / Coordinates.RC;
    },

    angle: function (pointB) {
        var y = this.get_lat();
        var x = this.get_lng() * Math.cos(y * Coordinates.RC);
        var y1 = pointB.get_lat();
        var x1 = pointB.get_lng() * Math.cos(y1 * Coordinates.RC);
        return Math.atan2((y1 - y), (x1 - x));
    },

    get_RA: function () {
        return (((this._ascention / Math.PI) * 12) + 12) % 24;
    },

    set_RA: function (value) {
        this._ascention = (value / 12) * Math.PI;
        return value;
    },

    get_dec: function () {
        return this._declination / Coordinates.RC;
    },

    set_dec: function (value) {
        this._declination = value * Coordinates.RC;
        return value;
    },

    get_lat: function () {
        return this._declination / Coordinates.RC;
    },

    set_lat: function (value) {
        this._declination = value * Coordinates.RC;
        return value;
    },

    get_lng: function () {
        var lng = this._ascention / Coordinates.RC;
        if (lng <= 180) {
            return lng;
        } else {
            return (-180 + (180 - lng));
        }
    },

    set_lng: function (value) {
        //todo This was broken check callers to see what effect it had.
        this._ascention = ((value * Coordinates.RC) + (Math.PI * 2) % (Math.PI * 2));
        return value;
    },

    get_alt: function () {
        return this._declination / Coordinates.RC;
    },

    set_alt: function (value) {
        this._declination = value * Coordinates.RC;
        return value;
    },

    get_az: function () {
        return this._ascention / Coordinates.RC;
    },

    set_az: function (value) {
        this._ascention = value * Coordinates.RC;
        return value;
    },

    toString: function () {
        return ss.format('Lat: {0}, Lng: {1}', this.get_lat(), this.get_lng());
    }
};

registerType("Coordinates", [Coordinates, Coordinates$, null]);
