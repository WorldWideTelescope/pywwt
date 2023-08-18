// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Infrastructure for playing back tours.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Vector2d } from "../double3d.js";
import { Util } from "../baseutil.js";
import { BlendState } from "../blend_state.js";
import { CameraParameters } from "../camera_parameters.js";
import { IUiController } from "../interfaces.js";
import { globalScriptInterface, globalWWTControl, setManagerVisibleLayerList } from "../data_globals.js";
import { Settings } from "../settings.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { ViewMoverKenBurnsStyle } from "../view_mover.js";
import { TextOverlay } from "./overlay.js";


// wwtlib.TourPlayer

export function TourPlayer() {
    this._overlayBlend = BlendState.create(false, 1000);
    this._tour = null;
    this._onTarget = false;
    this._currentMasterSlide = null;
    this._callStack = new ss.Stack();
    this._leaveSettingsWhenStopped = false;
}

TourPlayer._playing = false;
TourPlayer._switchedToFullScreen = false;
TourPlayer.noRestoreUIOnStop = false;

TourPlayer.get_playing = function () {
    return TourPlayer._playing;
};

TourPlayer.set_playing = function (value) {
    TourPlayer._playing = value;
    return value;
};

TourPlayer.add_tourEnded = function (value) {
    TourPlayer.__tourEnded = ss.bindAdd(TourPlayer.__tourEnded, value);
};

TourPlayer.remove_tourEnded = function (value) {
    TourPlayer.__tourEnded = ss.bindSub(TourPlayer.__tourEnded, value);
};

var TourPlayer$ = {
    render: function (renderContext) {
        if (this._tour == null || this._tour.get_currentTourStop() == null || !TourPlayer._playing) {
            return;
        }
        renderContext.save();
        this.updateSlideStates();
        if (!this._onTarget) {
            this._slideStartTime = ss.now();
            if (renderContext.onTarget(this.get_tour().get_currentTourStop().get_target())) {
                this._onTarget = true;
                this._overlayBlend.set_state(!this.get_tour().get_currentTourStop().get_fadeInOverlays());
                this._overlayBlend.set_targetState(true);
                if (this._tour.get_currentTourStop().get_musicTrack() != null) {
                    this._tour.get_currentTourStop().get_musicTrack().seek(0);
                    this._tour.get_currentTourStop().get_musicTrack().play();
                }
                if (this._tour.get_currentTourStop().get_voiceTrack() != null) {
                    this._tour.get_currentTourStop().get_voiceTrack().seek(0);
                    this._tour.get_currentTourStop().get_voiceTrack().play();
                }
                var caption = '';
                var $enum1 = ss.enumerate(this._tour.get_currentTourStop().get_overlays());
                while ($enum1.moveNext()) {
                    var overlay = $enum1.current;
                    if (overlay.get_name().toLowerCase() === 'caption') {
                        var text = ss.safeCast(overlay, TextOverlay);
                        if (text != null) {
                            caption = text.textObject.text;
                        }
                    }
                    overlay.play();
                }
                setManagerVisibleLayerList(this._tour.get_currentTourStop().layers);
                if (this._tour.get_currentTourStop().get_endTarget() != null && this._tour.get_currentTourStop().get_endTarget().get_zoomLevel() !== -1) {
                    if (this._tour.get_currentTourStop().get_target().get_type() === 4) {
                        // TODO fix this when Planets are implemented
                        //tour.CurrentTourStop.Target.UpdatePlanetLocation(SpaceTimeController.UtcToJulian(tour.CurrentTourStop.StartTime));
                        //tour.CurrentTourStop.EndTarget.UpdatePlanetLocation(SpaceTimeController.UtcToJulian(tour.CurrentTourStop.EndTime));
                    }
                    renderContext.viewMover = new ViewMoverKenBurnsStyle(this._tour.get_currentTourStop().get_target().get_camParams(), this._tour.get_currentTourStop().get_endTarget().get_camParams(), this._tour.get_currentTourStop().get_duration() / 1000, this._tour.get_currentTourStop().get_startTime(), this._tour.get_currentTourStop().get_endTime(), this._tour.get_currentTourStop().get_interpolationType());
                }
                Settings.tourSettings = this._tour.get_currentTourStop();
                SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
                SpaceTimeController.set_syncToClock(false);
                globalScriptInterface._fireSlideChanged(caption);
            }
        }
        if (renderContext.gl != null) {
            renderContext.setupMatricesOverlays();
            if (this._currentMasterSlide != null) {
                var $enum2 = ss.enumerate(this._currentMasterSlide.get_overlays());
                while ($enum2.moveNext()) {
                    var overlay = $enum2.current;
                    overlay.set_tweenFactor(1);
                    overlay.draw3D(renderContext, false);
                }
            }
            if (this._onTarget) {
                var $enum3 = ss.enumerate(this._tour.get_currentTourStop().get_overlays());
                while ($enum3.moveNext()) {
                    var overlay = $enum3.current;
                    if (overlay.get_name().toLowerCase() !== 'caption' || globalScriptInterface.get_showCaptions()) {
                        overlay.set_tweenFactor(CameraParameters.easeCurve(this._tour.get_currentTourStop().get_tweenPosition(), (overlay.get_interpolationType() === 5) ? this._tour.get_currentTourStop().get_interpolationType() : overlay.get_interpolationType()));
                        overlay.draw3D(renderContext, false);
                    }
                }
            }
            renderContext.restore();

            // There used to be code to draw on-screen tour player controls here.
            // In the web engine, that kind of work is now taken care of at higher levels.
            //DrawPlayerControls(renderContext);
        } else {
            renderContext.device.scale(renderContext.height / 1116, renderContext.height / 1116);
            var aspectOrig = 1920 / 1116;
            var aspectNow = renderContext.width / renderContext.height;
            renderContext.device.translate(-((1920 - (aspectNow * 1116)) / 2), 0);
            if (this._currentMasterSlide != null) {
                var $enum4 = ss.enumerate(this._currentMasterSlide.get_overlays());
                while ($enum4.moveNext()) {
                    var overlay = $enum4.current;
                    overlay.set_tweenFactor(1);
                    overlay.draw3D(renderContext, false);
                }
            }
            if (this._onTarget) {
                var $enum5 = ss.enumerate(this._tour.get_currentTourStop().get_overlays());
                while ($enum5.moveNext()) {
                    var overlay = $enum5.current;
                    if (overlay.get_name().toLowerCase() !== 'caption' || globalScriptInterface.get_showCaptions()) {
                        overlay.set_tweenFactor(CameraParameters.easeCurve(this._tour.get_currentTourStop().get_tweenPosition(), (overlay.get_interpolationType() === 5) ? this._tour.get_currentTourStop().get_interpolationType() : overlay.get_interpolationType()));
                        overlay.draw3D(renderContext, false);
                    }
                }
            }
            else {
                var i = 0;
            }
            renderContext.restore();
        }
    },

    get_tour: function () {
        return this._tour;
    },

    set_tour: function (value) {
        this._tour = value;
        return value;
    },

    nextSlide: function () {
        if (this._tour.get_currentTourStop() != null) {
            if (!this._tour.get_currentTourStop().get_masterSlide()) {
                if (this._tour.get_currentTourStop().get_musicTrack() != null) {
                    this._tour.get_currentTourStop().get_musicTrack().stop();
                }
                if (this._tour.get_currentTourStop().get_voiceTrack() != null) {
                    this._tour.get_currentTourStop().get_voiceTrack().stop();
                }
                var $enum1 = ss.enumerate(this._tour.get_currentTourStop().get_overlays());
                while ($enum1.moveNext()) {
                    var overlay = $enum1.current;
                    overlay.stop();
                }
            }
            else {
                this._currentMasterSlide = this._tour.get_currentTourStop();
            }
        }
        if (this._tour.get_currentTourstopIndex() < (this._tour.get_tourStops().length - 1) || this._tour.get_currentTourStop().get_isLinked()) {
            if (this._tour.get_currentTourStop().get_endTarget() != null) {
                globalWWTControl.gotoTargetFull(false, true, this._tour.get_currentTourStop().get_endTarget().get_camParams(), this._tour.get_currentTourStop().get_target().get_studyImageset(), this._tour.get_currentTourStop().get_target().get_backgroundImageset());
                globalWWTControl.set__mover(null);
            }
            this._onTarget = false;
            if (this._tour.get_currentTourStop().get_isLinked()) {
                try {
                    switch (this._tour.get_currentTourStop().get_nextSlide()) {
                        case 'Return':
                            if (this._callStack.count > 0) {
                                this.playFromTourstop(this._tour.get_tourStops()[this._callStack.pop()]);
                            }
                            else {
                                this._tour.set_currentTourstopIndex(this._tour.get_tourStops().length - 1);
                            }
                            break;
                        default:
                            this.playFromTourstop(this._tour.get_tourStops()[this._tour.getTourStopIndexByID(this._tour.get_currentTourStop().get_nextSlide())]);
                            break;
                    }
                }
                catch ($e2) {
                    if (this._tour.get_currentTourstopIndex() < (this._tour.get_tourStops().length - 1)) {
                        this._tour.set_currentTourstopIndex(this._tour.get_currentTourstopIndex() + 1) - 1;
                    }
                }
            }
            else {
                this._tour.set_currentTourstopIndex(this._tour.get_currentTourstopIndex() + 1) - 1;
            }
            if (this._currentMasterSlide != null && this._tour.get_currentTourStop().get_masterSlide()) {
                this._stopCurrentMaster();
            }
            var instant = false;
            switch (this._tour.get_currentTourStop().get__transition()) {
                case 0:
                    break;
                case 1:
                    instant = true;
                    break;
                case 2:
                    instant = true;
                    break;
                case 3:
                    instant = true;
                    break;
                case 5:
                    instant = true;
                    break;
                case 4:
                    instant = true;
                    break;
                default:
                    break;
            }
            globalWWTControl.gotoTarget(this._tour.get_currentTourStop().get_target(), false, instant, false);
            this._slideStartTime = ss.now();
            // Move to new settings
            Settings.tourSettings = this._tour.get_currentTourStop();
            SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
            SpaceTimeController.set_syncToClock(false);
        } else {
            this._stopCurrentMaster();
            TourPlayer._playing = false;
            if (Settings.get_current().autoRepeatTour) {
                this._tour.set_currentTourstopIndex(-1);
                this.play();
            }
            else {
                globalWWTControl._freezeView();
                if (TourPlayer.__tourEnded != null) {
                    TourPlayer.__tourEnded(this, new ss.EventArgs());
                }
                globalWWTControl._hideUI(false);
                globalScriptInterface._fireTourEnded();
            }
        }
    },

    _stopCurrentMaster: function () {
        if (this._currentMasterSlide != null) {
            if (this._currentMasterSlide.get_musicTrack() != null) {
                this._currentMasterSlide.get_musicTrack().stop();
            }
            if (this._currentMasterSlide.get_voiceTrack() != null) {
                this._currentMasterSlide.get_voiceTrack().stop();
            }
            var $enum1 = ss.enumerate(this._currentMasterSlide.get_overlays());
            while ($enum1.moveNext()) {
                var overlay = $enum1.current;
                overlay.stop();
            }
            this._currentMasterSlide = null;
        }
    },

    get_leaveSettingsWhenStopped: function () {
        return this._leaveSettingsWhenStopped;
    },

    set_leaveSettingsWhenStopped: function (value) {
        this._leaveSettingsWhenStopped = value;
        return value;
    },

    play: function () {
        if (this._tour == null) {
            return;
        }
        if (TourPlayer._playing) {
            this.stop(true);
        } else {
            TourPlayer._playing = true;
        }
        globalWWTControl._hideUI(true);
        TourPlayer._playing = true;
        if (this._tour.get_tourStops().length > 0) {
            this._onTarget = false;
            if (this._tour.get_currentTourstopIndex() === -1) {
                this._tour.set_currentTourStop(this._tour.get_tourStops()[0]);
            }

            // Ensure that all multimedia elements are prepared. When
            // playing back a tour in a browser, restrictions on autoplay
            // mean that we have to ensure that all of our multimedia
            // elements are prepared for playback inside code that is
            // triggered by a user-initiated event. The PrepMultimedia
            // callback should do whatever's needed to make sure that media
            // files are all ready to go.

            var $enum1 = ss.enumerate(this._tour.get_tourStops());
            while ($enum1.moveNext()) {
                var stop = $enum1.current;
                if (stop.get_musicTrack() != null) {
                    stop.get_musicTrack().prepMultimedia();
                }
                if (stop.get_voiceTrack() != null) {
                    stop.get_voiceTrack().prepMultimedia();
                }
                var $enum2 = ss.enumerate(stop.get_overlays());
                while ($enum2.moveNext()) {
                    var overlay = $enum2.current;
                    overlay.prepMultimedia();
                }
            }
            if (this._tour.get_currentTourstopIndex() > 0) {
                this._playMasterForCurrent();
            }
            globalWWTControl.gotoTarget(this._tour.get_currentTourStop().get_target(), false, true, false);
        }
        this._slideStartTime = ss.now();
        TourPlayer._playing = true;
    },

    _playMasterForCurrent: function () {
        if (!this._tour.get_currentTourStop().get_masterSlide()) {
            var currentMaster = this._tour.elapsedTimeSinceLastMaster(this._tour.get_currentTourstopIndex());
            if (currentMaster != null) {
                var elapsed = currentMaster.duration;
                this._currentMasterSlide = currentMaster.master;
                if (this._currentMasterSlide.get_musicTrack() != null) {
                    this._currentMasterSlide.get_musicTrack().seek(elapsed);
                    this._currentMasterSlide.get_musicTrack().play();
                }
                if (this._currentMasterSlide.get_voiceTrack() != null) {
                    this._currentMasterSlide.get_voiceTrack().seek(elapsed);
                    this._currentMasterSlide.get_voiceTrack().play();
                }
                var $enum1 = ss.enumerate(this._currentMasterSlide.get_overlays());
                while ($enum1.moveNext()) {
                    var overlay = $enum1.current;
                    overlay.seek(elapsed);
                    overlay.play();
                }
            }
        }
    },

    stop: function (noSwitchBackFullScreen) {
        if (TourPlayer._switchedToFullScreen && !noSwitchBackFullScreen) {
        }

        // By default, when you stop (or pause) a tour, the main WWT
        // settings become active again. However, this can cause a jarring
        // jump if, say, the tour has localHorizonMode active and the main
        // settings don't. If you activate this option, we'll leave the tour
        // settings lingering, preventing any dramatic changes.
        if (!this._leaveSettingsWhenStopped) {
            Settings.tourSettings = null;
        }
        TourPlayer._playing = false;
        if (this._tour.get_currentTourStop() != null) {
            if (this._tour.get_currentTourStop().get_musicTrack() != null) {
                this._tour.get_currentTourStop().get_musicTrack().stop();
            }
            if (this._tour.get_currentTourStop().get_voiceTrack() != null) {
                this._tour.get_currentTourStop().get_voiceTrack().stop();
            }
            var $enum1 = ss.enumerate(this._tour.get_currentTourStop().get_overlays());
            while ($enum1.moveNext()) {
                var overlay = $enum1.current;
                overlay.stop();
            }
        }
        if (this._currentMasterSlide != null) {
            if (this._currentMasterSlide.get_musicTrack() != null) {
                this._currentMasterSlide.get_musicTrack().stop();
            }
            if (this._currentMasterSlide.get_voiceTrack() != null) {
                this._currentMasterSlide.get_voiceTrack().stop();
            }
            var $enum2 = ss.enumerate(this._currentMasterSlide.get_overlays());
            while ($enum2.moveNext()) {
                var overlay = $enum2.current;
                overlay.stop();
            }
        }
        globalWWTControl._hideUI(TourPlayer.noRestoreUIOnStop);
        globalScriptInterface._fireTourEnded();
    },

    updateSlideStates: function () {
        var slideChanging = false;
        var slideElapsedTime = ss.now() - this._slideStartTime;
        if (slideElapsedTime > this._tour.get_currentTourStop().get_duration() && TourPlayer._playing) {
            this.nextSlide();
            slideChanging = true;
        }
        slideElapsedTime = ss.now() - this._slideStartTime;
        if (this._tour.get_currentTourStop() != null) {
            this._tour.get_currentTourStop().set_tweenPosition(Math.min(1, (slideElapsedTime / this._tour.get_currentTourStop().get_duration())));
            this._tour.get_currentTourStop().faderOpacity = 0;
            var elapsedSeconds = this._tour.get_currentTourStop().get_tweenPosition() * this._tour.get_currentTourStop().get_duration() / 1000;
            if (slideChanging) {
                globalWWTControl.set_crossFadeFrame(false);
            }
            switch (this._tour.get_currentTourStop().get__transition()) {
                case 0:
                    this._tour.get_currentTourStop().faderOpacity = 0;
                    globalWWTControl.set_crossFadeFrame(false);
                    break;
                case 2:
                    if (slideChanging) {
                    }
                    if (elapsedSeconds < (elapsedSeconds - this._tour.get_currentTourStop().get__transitionHoldTime())) {
                        globalWWTControl.set_crossFadeFrame(true);
                        this._tour.get_currentTourStop().faderOpacity = 1;
                    }
                    else {
                        this._tour.get_currentTourStop().faderOpacity = 0;
                        globalWWTControl.set_crossFadeFrame(false);
                    }
                    break;
                case 1:
                    globalWWTControl.set_crossFadeFrame(true);
                    var opacity = Math.max(0, 1 - Math.min(1, (elapsedSeconds - this._tour.get_currentTourStop().get__transitionHoldTime()) / this._tour.get_currentTourStop().get__transitionTime()));
                    this._tour.get_currentTourStop().faderOpacity = opacity;
                    if (slideChanging) {
                    }
                    break;
                case 3:
                case 4:
                    globalWWTControl.set_crossFadeFrame(false);
                    var opacity = Math.max(0, 1 - Math.max(0, elapsedSeconds - this._tour.get_currentTourStop().get__transitionHoldTime()) / this._tour.get_currentTourStop().get__transitionTime());
                    this._tour.get_currentTourStop().faderOpacity = opacity;
                    break;
                case 5:
                    globalWWTControl.set_crossFadeFrame(false);
                    break;
                default:
                    break;
            }
            if (!this._tour.get_currentTourStop().get_isLinked() && this._tour.get_currentTourstopIndex() < (this._tour.get_tourStops().length - 1)) {
                var nextTrans = this._tour.get_tourStops()[this._tour.get_currentTourstopIndex() + 1].get__transition();
                var nextTransTime = this._tour.get_tourStops()[this._tour.get_currentTourstopIndex() + 1].get__transitionOutTime();
                switch (nextTrans) {
                    case 5:
                    case 3:
                        if (!this._tour.get_currentTourStop().faderOpacity) {
                            globalWWTControl.set_crossFadeFrame(false);
                            var opacity = Math.max(0, 1 - Math.min(1, ((this._tour.get_currentTourStop().get_duration() / 1000) - elapsedSeconds) / nextTransTime));
                            this._tour.get_currentTourStop().faderOpacity = opacity;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    },

    updateTweenPosition: function (tween) {
        var slideElapsedTime = ss.now() - this._slideStartTime;
        if (tween > -1) {
            return this._tour.get_currentTourStop().set_tweenPosition(Math.min(1, tween));
        } else {
            return this._tour.get_currentTourStop().set_tweenPosition(Math.min(1, (slideElapsedTime / this._tour.get_currentTourStop().get_duration())));
        }
    },

    close: function () {
        if (this._tour != null) {
            if (TourPlayer.get_playing()) {
                this.stop(TourPlayer._switchedToFullScreen);
            }
            this._tour = null;
        }
    },

    mouseDown: function (sender, e) {
        var location;
        location = this.pointToView(Vector2d.create(e.offsetX, e.offsetY));
        if (this._tour == null || this._tour.get_currentTourStop() == null) {
            return false;
        }
        for (var i = this._tour.get_currentTourStop().get_overlays().length - 1; i >= 0; i--) {
            if (this._tour.get_currentTourStop().get_overlays()[i].hitTest(location)) {
                if (!ss.emptyString(this._tour.get_currentTourStop().get_overlays()[i].get_url())) {
                    var linkItem = this._tour.get_currentTourStop().get_overlays()[i];
                    Util._openUrl(linkItem.get_url());
                    return true;
                }
                if (!ss.emptyString(this._tour.get_currentTourStop().get_overlays()[i].get_linkID())) {
                    this._callStack.push(this._tour.get_currentTourstopIndex());
                    this.playFromTourstop(this._tour.get_tourStops()[this._tour.getTourStopIndexByID(this._tour.get_currentTourStop().get_overlays()[i].get_linkID())]);
                    return true;
                }
            }
        }
        return false;
    },

    mouseUp: function (sender, e) {
        return false;
    },

    mouseMove: function (sender, e) {
        var location;
        try {
            location = this.pointToView(Vector2d.create(e.offsetX, e.offsetY));
        }
        catch ($e1) {
            return false;
        }
        if (this._tour == null || this._tour.get_currentTourStop() == null) {
            return false;
        }
        for (var i = this._tour.get_currentTourStop().get_overlays().length - 1; i >= 0; i--) {
            if (this._tour.get_currentTourStop().get_overlays()[i].hitTest(location) && (!ss.emptyString(this._tour.get_currentTourStop().get_overlays()[i].get_url()) || !ss.emptyString(this._tour.get_currentTourStop().get_overlays()[i].get_linkID()))) {
                return true;
            }
        }
        return false;
    },

    mouseClick: function (sender, e) {
        return false;
    },

    click: function (sender, e) {
        return false;
    },

    mouseDoubleClick: function (sender, e) {
        return false;
    },

    keyDown: function (sender, e) {
        switch (e.keyCode) {
            case 27: // escape
                this.stop(TourPlayer._switchedToFullScreen);
                globalWWTControl._closeTour();
                return true;
            case 32: // spacebar
                this.pauseTour();
                return true;
            case 39: // right arrow
                this._playNextSlide();
                return true;
            case 37: // left arrow
                this._playPreviousSlide();
                return true;
            case 35: // end key
                if (this._tour.get_tourStops().length > 0) {
                    this.playFromTourstop(this._tour.get_tourStops()[this._tour.get_tourStops().length - 1]);
                }
                return true;
            case 36: // home key
                if (this._tour.get_tourStops().length > 0) {
                    this.playFromTourstop(this._tour.get_tourStops()[0]);
                }
                return true;
        }
        return false;
    },

    _playNextSlide: function () {
        if ((this._tour.get_currentTourstopIndex() < this._tour.get_tourStops().length - 1) && this._tour.get_tourStops().length > 0) {
            this.playFromTourstop(this._tour.get_tourStops()[this._tour.get_currentTourstopIndex() + 1]);
        }
    },

    _playPreviousSlide: function () {
        if (this._tour.get_currentTourstopIndex() > 0) {
            this.playFromTourstop(this._tour.get_tourStops()[this._tour.get_currentTourstopIndex() - 1]);
        }
    },

    playFromTourstop: function (tourStop) {
        this.stop(true);
        this._tour.set_currentTourStop(tourStop);
        globalWWTControl.gotoTarget(this._tour.get_currentTourStop().get_target(), false, true, false);
        SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
        SpaceTimeController.set_syncToClock(false);
        this.play();
    },

    pauseTour: function () {
        if (TourPlayer._playing) {
            this.stop(TourPlayer._switchedToFullScreen);
            globalWWTControl._freezeView();
            globalScriptInterface._fireTourPaused();
        } else {
            this.play();
            globalScriptInterface._fireTourResume();
        }
    },

    keyUp: function (sender, e) {
        return false;
    },

    hover: function (pnt) {
        if (TourPlayer._playing) {
            return true;
        }
        return false;
    },

    pointToView: function (pnt) {
        var clientHeight = globalWWTControl.canvas.height;
        var clientWidth = globalWWTControl.canvas.width;
        var viewWidth = (clientWidth / clientHeight) * 1116;
        var x = ((pnt.x) / (clientWidth) * viewWidth) - ((viewWidth - 1920) / 2);
        var y = (pnt.y) / clientHeight * 1116;
        return Vector2d.create(x, y);
    }
};

registerType("TourPlayer", [TourPlayer, TourPlayer$, null, IUiController]);

// wwtlib.MasterTime

export function MasterTime(master, duration) {
    this.duration = 0;
    this.master = master;
    this.duration = duration;
}

var MasterTime$ = {};

registerType("MasterTime", [MasterTime, MasterTime$, null]);
