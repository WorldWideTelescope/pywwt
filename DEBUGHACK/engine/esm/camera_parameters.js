// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Camera parameters.

import { registerType, registerEnum } from "./typesystem.js";
import { ss } from "./ss.js";
import { Vector3d } from "./double3d.js";
import { Coordinates } from "./coordinates.js";


// wwtlib.SolarSystemObjects

export var SolarSystemObjects = {
    sun: 0,
    mercury: 1,
    venus: 2,
    mars: 3,
    jupiter: 4,
    saturn: 5,
    uranus: 6,
    neptune: 7,
    pluto: 8,
    moon: 9,
    io: 10,
    europa: 11,
    ganymede: 12,
    callisto: 13,
    ioShadow: 14,
    europaShadow: 15,
    ganymedeShadow: 16,
    callistoShadow: 17,
    sunEclipsed: 18,
    earth: 19,
    custom: 20,
    undefined: 65536
};

registerType("SolarSystemObjects", SolarSystemObjects);
registerEnum("SolarSystemObjects", SolarSystemObjects);


// wwtlib.InterpolationType

export var InterpolationType = {
    linear: 0,
    easeIn: 1,
    easeOut: 2,
    easeInOut: 3,
    exponential: 4,
    defaultV: 5
};

registerType("InterpolationType", InterpolationType);
registerEnum("InterpolationType", InterpolationType);



// wwtlib.CameraParameters

export function CameraParameters() {
    this.lat = 0;
    this.lng = 0;
    this.zoom = 0;
    this.rotation = 0;
    this.angle = 0;
    this.raDec = false;
    this.opacity = 0;
    this.target = 0;
    this.zoom = 360;
    this.viewTarget = new Vector3d();
}

CameraParameters.create = function (lat, lng, zoom, rotation, angle, opactity) {
    var temp = new CameraParameters();
    temp.lat = lat;
    temp.lng = lng;
    temp.zoom = zoom;
    temp.rotation = rotation;
    temp.angle = angle;
    temp.raDec = false;
    temp.opacity = opactity;
    temp.viewTarget = Vector3d.create(0, 0, 0);
    temp.target = 20;
    temp.targetReferenceFrame = '';
    return temp;
};

CameraParameters.logN = function (num, b) {
    return Math.log(num) / Math.log(b);
};

CameraParameters.sinh = function (v) {
    return (Math.exp(v) - Math.exp(-v)) / 2;
};

CameraParameters.interpolate = function (from, to, alphaIn, type, fastDirectionMove) {
    var result = new CameraParameters();
    var alpha = CameraParameters.easeCurve(alphaIn, type);
    var alphaBIn = Math.min(1, alphaIn * 2);
    var alphaB = CameraParameters.easeCurve(alphaBIn, type);
    result.angle = to.angle * alpha + from.angle * (1 - alpha);
    result.rotation = to.rotation * alpha + from.rotation * (1 - alpha);
    if (fastDirectionMove) {
        result.lat = to.lat * alphaB + from.lat * (1 - alphaB);
        result.lng = to.lng * alphaB + from.lng * (1 - alphaB);
    }
    else {
        result.lat = to.lat * alpha + from.lat * (1 - alpha);
        result.lng = to.lng * alpha + from.lng * (1 - alpha);
    }
    result.zoom = Math.pow(2, CameraParameters.logN(to.zoom, 2) * alpha + CameraParameters.logN(from.zoom, 2) * (1 - alpha));
    result.opacity = (to.opacity * alpha + from.opacity * (1 - alpha));
    result.viewTarget = Vector3d.lerp(from.viewTarget, to.viewTarget, alpha);
    result.targetReferenceFrame = to.targetReferenceFrame;
    if (to.target === from.target) {
        result.target = to.target;
    }
    else {
        result.target = 20;
    }
    return result;
};

CameraParameters.interpolateGreatCircle = function (from, to, alphaIn, type, fastDirectionMove) {
    var result = new CameraParameters();
    var alpha = CameraParameters.easeCurve(alphaIn, type);
    var alphaBIn = Math.min(1, alphaIn * 2);
    var alphaB = CameraParameters.easeCurve(alphaBIn, type);
    result.angle = to.angle * alpha + from.angle * (1 - alpha);
    result.rotation = to.rotation * alpha + from.rotation * (1 - alpha);
    var left = Coordinates.geoTo3dDouble(from.lat, from.lng);
    var right = Coordinates.geoTo3dDouble(to.lat, to.lng);
    var mid = Vector3d.slerp(left, right, alpha);
    var midV2 = Coordinates.cartesianToLatLng(mid);
    result.lat = midV2.y;
    result.lng = midV2.x;
    result.zoom = Math.pow(2, CameraParameters.logN(to.zoom, 2) * alpha + CameraParameters.logN(from.zoom, 2) * (1 - alpha));
    result.opacity = (to.opacity * alpha + from.opacity * (1 - alpha));
    result.viewTarget = Vector3d.lerp(from.viewTarget, to.viewTarget, alpha);
    result.targetReferenceFrame = to.targetReferenceFrame;
    if (to.target === from.target) {
        result.target = to.target;
    }
    else {
        result.target = 20;
    }
    return result;
};

CameraParameters.easeCurve = function (alpha, type) {
    switch (type) {
        case 0:
            return alpha;
        case 4:
            return Math.pow(alpha, 2);
        case 1:
            return ((1 - alpha) * CameraParameters.sinh(alpha / (0.1085712344 * 2)) / 100) + alpha * alpha;
        case 2:
            return (alpha * (1 - CameraParameters.sinh((1 - alpha) / (0.1085712344 * 2)) / 100)) + (1 - alpha) * alpha;
        case 3:
            if (alpha < 0.5) {
                return CameraParameters.sinh(alpha / 0.1085712344) / 100;
            }
            else {
                return 1 - (CameraParameters.sinh((1 - alpha) / 0.1085712344) / 100);
            }
        default:
            return alpha;
    }
};

var CameraParameters$ = {
    copy: function () {
        var temp = new CameraParameters();
        temp.lat = this.lat;
        temp.lng = this.lng;
        temp.zoom = this.zoom;
        temp.rotation = this.rotation;
        temp.angle = this.angle;
        temp.raDec = this.raDec;
        temp.opacity = this.opacity;
        temp.viewTarget = this.viewTarget.copy();
        temp.target = this.target;
        temp.targetReferenceFrame = this.targetReferenceFrame;
        return temp;
    },

    get_RA: function () {
        return ((((180 - (this.lng - 180)) / 360) * 24) % 24);
    },

    set_RA: function (value) {
        this.lng = 180 - (value / 24 * 360) - 180;
        this.raDec = true;
        return value;
    },

    get_dec: function () {
        return this.lat;
    },

    set_dec: function (value) {
        this.lat = value;
        return value;
    },

    equals: function (obj) {
        if (ss.canCast(obj, CameraParameters)) {
            var cam = obj;
            if (Math.abs(cam.angle - this.angle) > 0.01 || Math.abs(cam.lat - this.lat) > (cam.zoom / 10000) || Math.abs(cam.get_RA() - this.get_RA()) > (cam.zoom / 1000) || Math.abs(cam.rotation - this.rotation) > 0.1 || Math.abs(cam.zoom - this.zoom) > (Math.abs(cam.zoom) / 1000)) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    }
};

registerType("CameraParameters", [CameraParameters, CameraParameters$, null]);
