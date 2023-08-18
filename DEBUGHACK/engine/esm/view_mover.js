// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Moving the view around.
//
// These types were originally implemented in `IViewMover.cs`, but we merged the
// `IViewMover` interface into `interfaces.js`, since currently in the JS
// implementation the interfaces don't contain any content.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Util } from "./baseutil.js";
import { CameraParameters } from "./camera_parameters.js";
import { IViewMover } from "./interfaces.js";
import { globalRenderContext } from "./render_globals.js";
import { Settings } from "./settings.js";
import { SpaceTimeController } from "./space_time_controller.js";


// wwtlib.ViewMoverKenBurnsStyle
//
// This was defined in `IViewMover.cs`, which we've folded into `interfaces.js`.

export function ViewMoverKenBurnsStyle(from, to, time, fromDateTime, toDateTime, type) {
    this.interpolationType = 0;
    this.fastDirectionMove = false;
    this._toTargetTime = 0;
    this._dateTimeSpan = 0;
    this._complete = false;
    this._midpointFired = false;
    this.interpolationType = type;
    if (Math.abs(from.lng - to.lng) > 180) {
        if (from.lng > to.lng) {
            from.lng -= 360;
        } else {
            from.lng += 360;
        }
    }
    this._fromDateTime = fromDateTime;
    this._toDateTime = toDateTime;
    this._dateTimeSpan = toDateTime - fromDateTime;
    this._from = from.copy();
    this._to = to.copy();
    this._fromTime = SpaceTimeController.get_metaNow();
    this._toTargetTime = time;
}

var ViewMoverKenBurnsStyle$ = {
    get_complete: function () {
        return this._complete;
    },

    get_currentPosition: function () {
        var elapsed = SpaceTimeController.get_metaNow() - this._fromTime;
        var elapsedSeconds = (elapsed) / 1000;
        var alpha = elapsedSeconds / this._toTargetTime;
        if (!this._midpointFired && alpha >= 0.5) {
            this._midpointFired = true;
            if (this._midpoint != null) {
                this._midpoint();
            }
        }
        if (alpha >= 1) {
            alpha = 1;
            this._complete = true;
            return this._to.copy();
        }
        if (Settings.get_active().get_galacticMode() && globalRenderContext.space) {
            return CameraParameters.interpolateGreatCircle(this._from, this._to, alpha, this.interpolationType, this.fastDirectionMove);
        }
        return CameraParameters.interpolate(this._from, this._to, alpha, this.interpolationType, this.fastDirectionMove);
    },

    get_currentDateTime: function () {
        var elapsed = SpaceTimeController.get_metaNow() - this._fromTime;
        var elapsedSeconds = (elapsed) / 1000;
        var alpha = elapsedSeconds / this._toTargetTime;
        var delta = this._dateTimeSpan * alpha;
        var retDate = new Date(this._fromDateTime.getTime() + ss.truncate(delta));
        return retDate;
    },

    get_midpoint: function () {
        return this._midpoint;
    },

    set_midpoint: function (value) {
        this._midpoint = value;
        return value;
    },

    get_moveTime: function () {
        return this._toTargetTime;
    }
};

registerType("ViewMoverKenBurnsStyle", [ViewMoverKenBurnsStyle, ViewMoverKenBurnsStyle$, null, IViewMover]);


// wwtlib.ViewMoverSlew
//
// This was defined in `IViewMover.cs`, which we've folded into `interfaces.js`.

export function ViewMoverSlew() {
    this._upTargetTime = 0;
    this._downTargetTime = 0;
    this._toTargetTime = 0;
    this._upTimeFactor = 0.6;
    this._downTimeFactor = 0.6;
    this._travelTimeFactor = 7;
    this._midpointFired = false;
    this._complete = false;
}

ViewMoverSlew.create = function (from, to) {
    var temp = new ViewMoverSlew();
    temp.init(from, to);
    return temp;
};

ViewMoverSlew.createUpDown = function (from, to, upDowFactor) {
    var temp = new ViewMoverSlew();
    temp._upTimeFactor = temp._downTimeFactor = upDowFactor;
    temp.init(from.copy(), to.copy());
    return temp;
};

var ViewMoverSlew$ = {
    init: function (from, to) {
        if (Math.abs(from.lng - to.lng) > 180) {
            if (from.lng > to.lng) {
                from.lng -= 360;
            }
            else {
                from.lng += 360;
            }
        }
        if (to.zoom <= 0) {
            to.zoom = 360;
        }
        if (from.zoom <= 0) {
            from.zoom = 360;
        }
        this._from = from;
        this._to = to;
        this._fromTime = SpaceTimeController.get_metaNow();
        var zoomUpTarget = 360;
        var travelTime;
        var lngDist = Math.abs(from.lng - to.lng);
        var latDist = Math.abs(from.lat - to.lat);
        var distance = Math.sqrt(latDist * latDist + lngDist * lngDist);
        zoomUpTarget = (distance / 3) * 20;
        if (zoomUpTarget > 360) {
            zoomUpTarget = 360;
        }
        if (zoomUpTarget < from.zoom) {
            zoomUpTarget = from.zoom;
        }
        travelTime = (distance / 180) * (360 / zoomUpTarget) * this._travelTimeFactor;
        var rotateTime = Math.max(Math.abs(from.angle - to.angle), Math.abs(from.rotation - to.rotation));
        var logDistUp = Math.max(Math.abs(Util.logN(zoomUpTarget, 2) - Util.logN(from.zoom, 2)), rotateTime);
        this._upTargetTime = this._upTimeFactor * logDistUp;
        this._downTargetTime = this._upTargetTime + travelTime;
        var logDistDown = Math.abs(Util.logN(zoomUpTarget, 2) - Util.logN(to.zoom, 2));
        this._toTargetTime = this._downTargetTime + Math.max((this._downTimeFactor * logDistDown), rotateTime);
        this._fromTop = from.copy();
        this._fromTop.zoom = zoomUpTarget;
        this._fromTop.angle = (from.angle + to.angle) / 2;
        this._fromTop.rotation = (from.rotation + to.rotation) / 2;
        this._toTop = to.copy();
        this._toTop.zoom = this._fromTop.zoom;
        this._toTop.angle = this._fromTop.angle;
        this._toTop.rotation = this._fromTop.rotation;
    },

    get_complete: function () {
        return this._complete;
    },

    get_currentPosition: function () {
        var elapsed = SpaceTimeController.get_metaNow() - this._fromTime;
        var elapsedSeconds = (elapsed) / 1000;
        if (elapsedSeconds < this._upTargetTime) {
            // Log interpolate from from to fromTop
            return CameraParameters.interpolate(this._from, this._fromTop, elapsedSeconds / this._upTargetTime, 3, false);
        } else if (elapsedSeconds < this._downTargetTime) {
            elapsedSeconds -= this._upTargetTime;
            if (Settings.get_active().get_galacticMode() && globalRenderContext.space) {
                return CameraParameters.interpolateGreatCircle(this._fromTop, this._toTop, elapsedSeconds / (this._downTargetTime - this._upTargetTime), 3, false);
            }
            // interpolate linear fromTop and toTop
            return CameraParameters.interpolate(this._fromTop, this._toTop, elapsedSeconds / (this._downTargetTime - this._upTargetTime), 3, false);
        } else {
            if (!this._midpointFired) {
                this._midpointFired = true;
                if (this._midpoint != null) {
                    this._midpoint();
                }
            }
            elapsedSeconds -= this._downTargetTime;
            // Interpolate log from toTop and to
            var alpha = elapsedSeconds / (this._toTargetTime - this._downTargetTime);
            if (alpha > 1) {
                alpha = 1;
                this._complete = true;
                return this._to.copy();
            }
            return CameraParameters.interpolate(this._toTop, this._to, alpha, 3, false);
        }
    },

    get_currentDateTime: function () {
        SpaceTimeController.updateClock();
        return SpaceTimeController.get_now();
    },

    get_midpoint: function () {
        return this._midpoint;
    },

    set_midpoint: function (value) {
        this._midpoint = value;
        return value;
    },

    get_moveTime: function () {
        return this._toTargetTime;
    }
};

registerType("ViewMoverSlew", [ViewMoverSlew, ViewMoverSlew$, null, IViewMover]);
