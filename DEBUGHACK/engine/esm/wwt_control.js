// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The integrated WWT web engine application.
//
// This is named "WWTControl" due to its heritage of thinking of WWT as a "web
// control" in Microsoft-ese.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";

import {
    globalRenderContext,
    set_tilePrepDevice,
    set_useGl,
    set_useGlVersion2,
} from "./render_globals.js";

import {
    globalScriptInterface,
    globalWWTControl,
    loadWtmlFile,
    set_freestandingMode,
    set_globalScriptInterface,
} from "./data_globals.js";

import { BlendState } from "./blend_state.js";
import { Color, Colors } from "./color.js";
import { URLHelpers } from "./url_helpers.js";
import { Mouse } from "./util.js";

import {
    PositionColoredTextured,
    Vector3d,
    Vector2d,
    Matrix3d,
    DoubleUtilities,
} from "./double3d.js";

import { SimpleLineList } from "./graphics/primitives3d.js";
import { Sprite2d } from "./graphics/sprite2d.js";

import { Annotation } from "./annotation.js";
import { CameraParameters, SolarSystemObjects } from "./camera_parameters.js";
import { Constellations } from "./constellations.js";
import { Coordinates } from "./coordinates.js";
import { Grids } from "./grids.js";
import { BandPass, ProjectionType, ImageSetType, Imageset } from "./imageset.js";
import { MinorPlanets } from "./minor_planets.js";
import { Classification } from "./place.js";
import { Planets } from "./planets.js";
import { Settings } from "./settings.js";
import { SpaceTimeController } from "./space_time_controller.js";
import { RenderTriangle } from "./render_triangle.js";
import { Tile } from "./tile.js";
import { TileCache } from "./tile_cache.js";
import { VideoOutputType } from "./video_output_type.js";
import { UiTools } from "./ui_tools.js";
import { ViewMoverSlew, ViewMoverKenBurnsStyle } from "./view_mover.js";

import { TourPlayer } from "./tours/tour_player.js";

import { LayerManager } from "./layers/layer_manager.js";

import { TourDocument } from "./tours/tour_document.js";
import { TourEditTab } from "./tours/tour_edit.js";

import { Planets3d } from "./planets_3d.js";
import { ScriptInterface } from "./script_interface.js";


// wwtlib.WWTControl

export function WWTControl() {
    // In "freestanding" mode, no worldwidetelescope.org resources are
    // relied upon. The default screen is black sky, and the 3D solar system
    // mode is unavailable because it relies on so many built-in assets. If
    // you want to see anything, you need to load it in yourself.
    this.freestandingMode = false;

    this.uiController = null;
    this._annotations = [];
    this._hoverText = '';
    this._hoverTextPoint = new Vector2d();
    this._lastMouseMove = new Date(1900, 1, 0, 0, 0, 0, 0);
    this.layers = [];
    this._frameCount = 0;
    this._zoomMax = 360;
    this._zoomMaxSolarSystem = 10000000000000000;
    this._zoomMin = 0.001373291015625;
    this._zoomMinSolarSystem = 1E-08;
    this.constellation = 'UMA';
    this._fadePoints = null;
    this.fader = BlendState.create(true, 2000);
    this._crossFadeFrame = false;
    this._crossFadeTexture = null;
    this._sprite = new Sprite2d();
    this.renderType = 2;
    this._milkyWayBackground = null;
    this.capturingVideo = false;
    this._videoBlobReady = null;
    this.dumpFrameParams = null;
    this._videoBlobQueue = {};
    this._videoQueueIndex = 0;
    this._emptyFrames = [];

    // Mouse, touch, gesture controls -- lots of different event listeners for different
    // devices and browser support.
    this._beginZoom = 1;
    this._dragging = false;
    this._mouseDown = false;
    this._hasTwoTouches = false;
    this._lastX = 0;
    this._lastY = 0;
    this._pointerIds = new Array(2);
    this._pinchingZoomRect = new Array(2);
    this._moved = false;

    this._foregroundCanvas = null;
    this._fgDevice = null;
    this._tracking = false;
    this._trackingObject = null;
    this.sandboxMode = false;
    this._solarSystemTrack = 65536;
    this._moving = false;
    this._targetStudyImageset = null;
    this._targetBackgroundImageset = null;
    this.tour = null;
    this.tourEdit = null;
    this._crossHairs = null;
}

// Note: these fields must remain public because there is JS code in the
// wild that accesses `WWTControl.imageSets`.
WWTControl.imageSets = [];
WWTControl.imageSetName = '';
WWTControl.showDataLayers = false;
WWTControl._renderNeeded = false;
WWTControl.constellationsFigures = null;
WWTControl.constellationsBoundries = null;
WWTControl.solarSystemObjectsNames = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Moon', 'Io', 'Europa', 'Ganymede', 'Callisto', 'IoShadow', 'EuropaShadow', 'GanymedeShadow', 'CallistoShadow', 'SunEclipsed', 'Earth', 'Custom', 'Undefined'];

WWTControl.addImageSetToRepository = function (imagesetToAdd) {
    var $enum1 = ss.enumerate(WWTControl.imageSets);
    while ($enum1.moveNext()) {
        var imageset = $enum1.current;
        if (imageset.get_imageSetID() === imagesetToAdd.get_imageSetID()) {
            return imageset;
        }
    }
    WWTControl.imageSets.push(imagesetToAdd);
    return imagesetToAdd;
};

WWTControl.getImageSets = function () {
    return WWTControl.imageSets;
};

// This parameter does nothing. We keep it to maintain API compatibility.
WWTControl.get_renderNeeded = function () {
    return WWTControl._renderNeeded;
};

// This parameter does nothing. We keep it to maintain API compatibility.
WWTControl.set_renderNeeded = function (value) {
    WWTControl._renderNeeded = true;
    return value;
};

// Initialization

// For backwards compatibility, we preserve the semantics that calling
// this function kicks off the rendering loop.
WWTControl.initControl = function (DivId) {
    return WWTControl.initControl2(DivId, true);
};

// This function had a parameter to choose whether to use WebGL or HTML5
// canvas, but at some point the argument was defused. We preserve it
// for backwards compatibility.
WWTControl.initControlParam = function (DivId, webgl_ignored) {
    return WWTControl.initControl2(DivId, true);
};

// Prefer using WWTControlBuilder rather than this interface directly.
WWTControl.initControl2 = function (DivId, startRenderLoop) {
    return WWTControl.initControl6(DivId, startRenderLoop, 0, 0, 360, 'Sky');
};

// Prefer using WWTControlBuilder rather than this interface directly.
WWTControl.initControl6 = function (DivId, startRenderLoop, startLat, startLng, startZoom, startMode) {
    if (globalRenderContext.device == null) {
        WWTControl.scriptInterface = new ScriptInterface();
        WWTControl.scriptInterface.settings = Settings.get_current();
        set_globalScriptInterface(WWTControl.scriptInterface);
        var canvas = WWTControl._createCanvasElement(DivId);
        var gl = canvas.getContext('webgl2');

        if (gl != null) {
            set_useGlVersion2(true);
        } else {
            console.warn('This browser does not support WebGL 2.0. Some features will work suboptimally. To get the full AAS WWT experience, consider using the latest version of Chrome, Firefox or Edge. In case you would like to use Safari, we recommend that you enable WebGL 2.0');
            gl = canvas.getContext('webgl');
        }

        if (gl == null) {
            gl = canvas.getContext('experimental-webgl');
        }

        if (gl == null) {
            var ctx = canvas.getContext('2d');
            globalRenderContext.device = ctx;
        } else {
            set_tilePrepDevice(gl);
            globalRenderContext.gl = gl;
            set_useGl(true);
        }

        globalWWTControl.canvas = canvas;
        globalRenderContext.width = canvas.width;
        globalRenderContext.height = canvas.height;
        globalWWTControl.setup(canvas, startLat, startLng, startZoom);

        Constellations.initializeConstellations();
        LayerManager.oneTimeInitialization();

        if (startMode === 'earth') {
            globalRenderContext.set_backgroundImageset(
                Imageset.create(
                    'Blue Marble', // name
                    URLHelpers.singleton.coreStaticUrl('wwtweb/tiles.aspx?q={1},{2},{3},bm200407'),
                    ImageSetType.earth, // dataSetType
                    BandPass.visible, // bandPass
                    ProjectionType.toast, // projectionType
                    101, // imageSetID
                    0, // baseLevel
                    7, // levels
                    256, // tileSize (unused)
                    180, // basetileDegrees
                    '.png', // extension
                    false, // bottomsUp
                    '', // quadTreeMap
                    0, // centerX
                    0, // centerY
                    0, // rotation
                    false, // sparse
                    URLHelpers.singleton.coreStaticUrl('wwtweb/thumbnail.aspx?name=bm200407'),
                    true, // defaultSet
                    false, // elevationModel
                    0, // widthFactor
                    0, // offsetX
                    0, // offsetY
                    '', // creditsText
                    '', // creditsUrl
                    '', // demUrl
                    '', // altUrl
                    6371000, // meanRadius
                    'Earth' // referenceFrame
                )
            );
        } else if (startMode === 'black') {
            // Black sky init -- probably because we are in freestanding mode
            globalRenderContext.set_backgroundImageset(
                Imageset.create(
                    'Black Sky Background', // name
                    '', // url
                    ImageSetType.sky, // dataSetType
                    BandPass.visible, // bandPass
                    ProjectionType.toast, // projectionType
                    102, // imageSetID
                    0, // baseLevel
                    0, // levels
                    256, // tileSize (unused)
                    180, // baseTileDegrees
                    '.png', // extension
                    false, // bottomsUp
                    '0123', // quadTreeMap
                    0, // centerX
                    0, // centerY
                    0, // rotation
                    false, // sparse
                    '', // thumbnailUrl
                    false, // defaultSet
                    false, // elevationModel
                    2, // widthFactor
                    0, // offsetX
                    0, // offsetY
                    '', // creditsText
                    '', // creditsUrl
                    '', // demUrl
                    '', // altUrl
                    1, // meanRadius
                    'Sky' // referenceFrame
                )
            );
        } else {
            globalRenderContext.set_backgroundImageset(
                Imageset.create(
                    'DSS', // name
                    URLHelpers.singleton.coreStaticUrl('wwtweb/dss.aspx?q={1},{2},{3}'),
                    ImageSetType.sky, // dataSetTYpe
                    BandPass.visible, // bandPass
                    ProjectionType.toast, // projectionType
                    100, // imageSetId
                    0, // baseLevel
                    12, // levels
                    256, // tileSize (unused)
                    180, // baseTileDegrees
                    '.png', // extension
                    false, // bottomsUp
                    '', // quadTreeMap
                    0, // centerX
                    0, // centerY
                    0, // rotation
                    false, // sparse
                    URLHelpers.singleton.coreStaticUrl('thumbnails/DSS.png'),
                    true, // defaultSet
                    false, // elevationModel
                    0, // widthFactor
                    0, // offsetX
                    0, // offsetY
                    '', // creditsText
                    '', // creditsUrl
                    '', // demUrl
                    '', // altUrl
                    1, // meanRadius
                    'Sky' // referenceFrame
                )
            );
        }
    }
    globalRenderContext.viewCamera.lng += 0;
    globalRenderContext._initGL();
    if (startRenderLoop) {
        globalWWTControl.render();
    }
    return globalScriptInterface;
};

WWTControl._createCanvasElement = function (DivId) {
    var div = document.getElementById(DivId);
    var canvas = document.createElement('canvas');
    canvas.height = div.clientHeight;
    canvas.width = div.clientWidth;
    div.appendChild(canvas);
    return canvas;
};

WWTControl.useUserLocation = function () {
    navigator.geolocation.getCurrentPosition(WWTControl._getLocation, WWTControl._getLocationError);
};

WWTControl._getLocation = function (pos) {
    if (!!pos.coords.latitude) {
        Settings.get_globalSettings().set_locationLat(pos.coords.latitude);
    }
    if (!!pos.coords.longitude) {
        Settings.get_globalSettings().set_locationLng(pos.coords.longitude);
    }
    if (!!pos.coords.altitude) {
        Settings.get_globalSettings().set_locationAltitude(pos.coords.altitude);
    }
};

WWTControl._getLocationError = function (pos) {
    if (pos != null && pos.coords != null) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
    }
};

WWTControl.setBackgroundImageName = function (name) {
    WWTControl.imageSetName = name;
};

WWTControl.setForegroundImageName = function (name) {
    WWTControl.imageSetName = name;
};

WWTControl.showLayers = function (show) {
    WWTControl.showDataLayers = show;
};

var WWTControl$ = {
    _addAnnotation: function (annotation) {
        this._annotations.push(annotation);
        Annotation.batchDirty = true;
    },

    _removeAnnotation: function (annotation) {
        ss.remove(this._annotations, annotation);
        Annotation.batchDirty = true;
    },

    _clearAnnotations: function () {
        this._annotations.length = 0;
        Annotation.batchDirty = true;
    },

    _annotationclicked: function (ra, dec, x, y) {
        if (this._annotations != null && this._annotations.length > 0) {
            var index = 0;
            var $enum1 = ss.enumerate(this._annotations);
            while ($enum1.moveNext()) {
                var note = $enum1.current;
                if (note.hitTest(this.renderContext, ra, dec, x, y)) {
                    globalScriptInterface._fireAnnotationclicked(ra, dec, note.get_id());
                    return true;
                }
                index++;
            }
        }
        return false;
    },

    _annotationHover: function (ra, dec, x, y) {
        if (this._annotations != null && this._annotations.length > 0) {
            var index = 0;
            var $enum1 = ss.enumerate(this._annotations);
            while ($enum1.moveNext()) {
                var note = $enum1.current;
                if (note.hitTest(this.renderContext, ra, dec, x, y)) {
                    this._hoverText = note.get_label();
                    this._hoverTextPoint = Vector2d.create(x, y);
                    return true;
                }
                index++;
            }
        }
        return false;
    },

    get_zoomMax: function () {
        if (this.renderContext.get_backgroundImageset() != null && this.renderContext.get_backgroundImageset().get_dataSetType() == ImageSetType.solarSystem) {
            return this._zoomMaxSolarSystem;
        } else {
            return this._zoomMax;
        }
    },

    set_zoomMax: function (value) {
        this._zoomMax = value;
        return value;
    },

    setSolarSystemMaxZoom: function (value) {
        this._zoomMaxSolarSystem = value;
    },

    get_zoomMin: function () {
        if (this.renderContext.get_backgroundImageset() != null && this.renderContext.get_backgroundImageset().get_dataSetType() == ImageSetType.solarSystem) {
            return this._zoomMinSolarSystem;
        } else {
            return this._zoomMin;
        }
    },

    set_zoomMin: function (value) {
        this._zoomMin = value;
        return value;
    },

    setSolarSystemMinZoom: function (value) {
        this._zoomMinSolarSystem = value;
    },

    _notifyMoveComplete: function () { },

    get_crossFadeFrame: function () {
        return this._crossFadeFrame;
    },

    set_crossFadeFrame: function (value) {
        if (value && this._crossFadeFrame !== value) {
            if (this._crossFadeTexture != null) {
            }
            this._crossFadeTexture = this.renderContext._getScreenTexture();
        }
        this._crossFadeFrame = value;
        if (!value) {
            if (this._crossFadeTexture != null) {
                this._crossFadeTexture = null;
            }
        }
        return value;
    },

    _fadeFrame: function () {
        if (this.renderContext.gl != null) {
            var sp = Settings.get_active().getSetting(17);
            if ((sp.opacity > 0)) {
                var color = Color._fromArgbColor(255 - UiTools.gamma(255 - ss.truncate((sp.opacity * 255)), 1 / 2.2), Colors.get_black());
                if (!(sp.opacity > 0)) {
                    color = Color._fromArgbColor(255 - UiTools.gamma(255 - ss.truncate((sp.opacity * 255)), 1 / 2.2), Colors.get_black());
                }
                if (this._crossFadeFrame) {
                    color = Color._fromArgbColor(UiTools.gamma(ss.truncate((sp.opacity * 255)), 1 / 2.2), Colors.get_white());
                }
                else {
                    if (this._crossFadeTexture != null) {
                        this._crossFadeTexture = null;
                    }
                }
                if (this._fadePoints == null) {
                    this._fadePoints = new Array(4);
                    for (var i = 0; i < 4; i++) {
                        this._fadePoints[i] = new PositionColoredTextured();
                    }
                }
                this._fadePoints[0].position.x = -this.renderContext.width / 2;
                this._fadePoints[0].position.y = this.renderContext.height / 2;
                this._fadePoints[0].position.z = 1347;
                this._fadePoints[0].tu = 0;
                this._fadePoints[0].tv = 1;
                this._fadePoints[0].color = color;
                this._fadePoints[1].position.x = -this.renderContext.width / 2;
                this._fadePoints[1].position.y = -this.renderContext.height / 2;
                this._fadePoints[1].position.z = 1347;
                this._fadePoints[1].tu = 0;
                this._fadePoints[1].tv = 0;
                this._fadePoints[1].color = color;
                this._fadePoints[2].position.x = this.renderContext.width / 2;
                this._fadePoints[2].position.y = this.renderContext.height / 2;
                this._fadePoints[2].position.z = 1347;
                this._fadePoints[2].tu = 1;
                this._fadePoints[2].tv = 1;
                this._fadePoints[2].color = color;
                this._fadePoints[3].position.x = this.renderContext.width / 2;
                this._fadePoints[3].position.y = -this.renderContext.height / 2;
                this._fadePoints[3].position.z = 1347;
                this._fadePoints[3].tu = 1;
                this._fadePoints[3].tv = 0;
                this._fadePoints[3].color = color;
                this._sprite.draw(this.renderContext, this._fadePoints, 4, this._crossFadeTexture, true, 1);
            }
        }
    },

    captureVideo: function (VideoBlobReady, Width, Height, FramesPerSecond, TotalFrames, Format) {
        this.capturingVideo = true;
        this._videoBlobReady = VideoBlobReady;
        ss.clearKeys(this._videoBlobQueue);
        this._videoQueueIndex = 0;
        this._emptyFrames.length = 0;
        this.dumpFrameParams = new VideoOutputType(Width, Height, FramesPerSecond, Format, true);
        SpaceTimeController.frameDumping = true;
        SpaceTimeController.framesPerSecond = FramesPerSecond;
        SpaceTimeController.totalFrames = TotalFrames;
        SpaceTimeController.currentFrameNumber = 0;
    },

    // To preserve semantic backwards compatibility, this function must requeue itself
    // to be called again in a timeout.
    render: function () {
        var $this = this;

        this.renderOneFrame();
        setTimeout(function () {
            $this.render();
        }, 10);
    },

    renderOneFrame: function () {
        if (this.renderContext.get_backgroundImageset() != null) {
            this.renderType = this.renderContext.get_backgroundImageset().get_dataSetType();
        } else {
            this.renderType = 2;
        }
        var sizeChange = false;
        if (this.canvas.width !== this.canvas.parentNode.clientWidth) {
            this.canvas.width = this.canvas.parentNode.clientWidth;
            sizeChange = true;
        }
        if (this.canvas.height !== this.canvas.parentNode.clientHeight) {
            this.canvas.height = this.canvas.parentNode.clientHeight;
            sizeChange = true;
        }
        if (sizeChange && this.explorer != null) {
            this.explorer.refresh();
        }

        if (this.canvas.width < 1 || this.canvas.height < 1) {
            // This can happen during initialization if perhaps some
            // HTML/JavaScript interaction hasn't happened to set the canvas
            // size correctly. If we don't exit this function early, we get
            // NaNs in our transformation matrices that lead IsTileBigEnough
            // to say "no" for everything so that we spin out of control
            // downloading maximum-resolution DSS tiles for an enormous
            // viewport. That's bad!
            return;
        }

        if (sizeChange) {
            // In GL, the crosshairs are in viewport coordinates
            // ([0,1]x[0,1]), so a size change alters their perceived aspect
            // ratio.
            this._crossHairs = null;
        }

        Tile.lastDeepestLevel = Tile.deepestLevel;
        RenderTriangle.width = this.renderContext.width = this.canvas.width;
        RenderTriangle.height = this.renderContext.height = this.canvas.height;
        Tile.tilesInView = 0;
        Tile.tilesTouched = 0;
        Tile.deepestLevel = 0;
        SpaceTimeController.set_metaNow(ss.now());
        if (this.get__mover() != null) {
            SpaceTimeController.set_now(this.get__mover().get_currentDateTime());
            Planets.updatePlanetLocations(this.get_solarSystemMode());
            if (this.get__mover() != null) {
                var newCam = this.get__mover().get_currentPosition();
                this.renderContext.targetCamera = newCam.copy();
                this.renderContext.viewCamera = newCam.copy();
                if (this.renderContext.space && Settings.get_active().get_galacticMode()) {
                    var gPoint = Coordinates.j2000toGalactic(newCam.get_RA() * 15, newCam.get_dec());
                    this.renderContext.targetAlt = this.renderContext.alt = gPoint[1];
                    this.renderContext.targetAz = this.renderContext.az = gPoint[0];
                }
                else if (this.renderContext.space && Settings.get_active().get_localHorizonMode()) {
                    var currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(newCam.get_RA(), newCam.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
                    this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
                    this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
                }
                if (this.get__mover().get_complete()) {
                    globalScriptInterface._fireArrived(this.get__mover().get_currentPosition().get_RA(), this.get__mover().get_currentPosition().get_dec(), globalRenderContext.viewCamera.zoom);
                    this.set__mover(null);
                    this._notifyMoveComplete();
                }
            }
        } else {
            SpaceTimeController.updateClock();
            Planets.updatePlanetLocations(this.get_solarSystemMode());
            this._updateViewParameters();
        }
        this.renderContext.clear();
        if (this.renderType === 4) {
            if (this._solarSystemTrack < 20) {
                var radius = Planets.getAdjustedPlanetRadius(this._solarSystemTrack);
                var distance = this.renderContext.get_solarSystemCameraDistance();
                var camAngle = this.renderContext.get_fovLocal();
            }
            if (this._trackingObject == null) {
            }
            this.renderContext.setupMatricesSolarSystem(true);
            var zoom = this.renderContext.viewCamera.zoom;
            var milkyWayBlend = Math.min(1, Math.max(0, (Math.log(zoom) - 8.4)) / 4.2);
            var milkyWayBlendIn = Math.min(1, Math.max(0, (Math.log(zoom) - 17.9)) / 2.3);
            var matOldMW = this.renderContext.get_world();
            var matLocalMW = this.renderContext.get_world().clone();
            matLocalMW._multiply(Matrix3d._scaling(100000, 100000, 100000));
            matLocalMW._multiply(Matrix3d._rotationX(23.5 / 180 * Math.PI));
            matLocalMW._multiply(Matrix3d.translation(this.renderContext.cameraPosition));
            this.renderContext.set_world(matLocalMW);
            this.renderContext.set_worldBase(matLocalMW);
            this.renderContext.space = true;
            this.renderContext.makeFrustum();
            var lighting = this.renderContext.lighting;
            this.renderContext.lighting = false;
            if (Settings.get_active().get_solarSystemMilkyWay()) {
                if (milkyWayBlend < 1) {
                    if (this._milkyWayBackground == null) {
                        this._milkyWayBackground = this.getImagesetByName('Digitized Sky Survey (Color)');
                    }
                    if (this._milkyWayBackground != null) {
                        RenderTriangle.cullInside = true;
                        var c = (1 - milkyWayBlend) / 2;
                        this.renderContext.drawImageSet(this._milkyWayBackground, c * 100);
                        RenderTriangle.cullInside = false;
                    }
                }
            }
            this._drawSkyOverlays();
            this.renderContext.lighting = lighting;
            this.renderContext.space = false;
            this.renderContext.set_world(matOldMW);
            this.renderContext.set_worldBase(matOldMW);
            this.renderContext.makeFrustum();
            var oldCamera = this.renderContext.cameraPosition;
            var matOld = this.renderContext.get_world();
            var matLocal = this.renderContext.get_world();
            matLocal._multiply(Matrix3d.translation(this.renderContext.viewCamera.viewTarget));
            this.renderContext.cameraPosition = Vector3d.subtractVectors(this.renderContext.cameraPosition, this.renderContext.viewCamera.viewTarget);
            this.renderContext.set_world(matLocal);
            this.renderContext.makeFrustum();
            if (Settings.get_active().get_solarSystemCosmos()) {
                Grids.drawCosmos3D(this.renderContext, 1);
            }
            if (Settings.get_active().get_solarSystemMilkyWay() && milkyWayBlendIn > 0) {
                Grids.drawGalaxyImage(this.renderContext, milkyWayBlendIn);
            }
            if (Settings.get_active().get_solarSystemStars()) {
                Grids.drawStars3D(this.renderContext, 1);
            }
            matLocal = matOld;
            var pnt = this.renderContext.viewCamera.viewTarget;
            var vt = Vector3d.create(-pnt.x, -pnt.y, -pnt.z);
            this.renderContext.cameraPosition = oldCamera;
            matLocal._multiply(Matrix3d.translation(vt));
            this.renderContext.set_world(matLocal);
            this.renderContext.makeFrustum();
            LayerManager._draw(this.renderContext, 1, true, 'Sky', true, false);
            this.renderContext.set_world(matOld);
            this.renderContext.makeFrustum();
            if (this.renderContext.get_solarSystemCameraDistance() < 15000) {
                this.renderContext.setupMatricesSolarSystem(false);
                if (Settings.get_active().get_solarSystemMinorPlanets()) {
                    MinorPlanets.drawMPC3D(this.renderContext, 1, this.renderContext.viewCamera.viewTarget);
                }
                if (Settings.get_active().get_solarSystemPlanets()) {
                    Planets3d.drawPlanets3D(this.renderContext, 1, this.renderContext.viewCamera.viewTarget);
                }
            }
        } else {
            // RenderType is not SolarSystem
            if (!this.renderType || this.renderType === 1) {
                this.renderContext._setupMatricesLand3d();
            }
            else {
                this.renderContext.setupMatricesSpace3d(this.renderContext.width, this.renderContext.height);
            }
            this.renderContext.drawImageSet(this.renderContext.get_backgroundImageset(), 100);
            if (this.renderContext.get_foregroundImageset() != null) {
                if (this.renderContext.get_foregroundImageset().get_dataSetType() !== this.renderContext.get_backgroundImageset().get_dataSetType()) {
                    this.renderContext.set_foregroundImageset(null);
                }
                else {
                    if (this.renderContext.viewCamera.opacity !== 100 && this.renderContext.gl == null) {
                        if (this._foregroundCanvas.width !== this.renderContext.width || this._foregroundCanvas.height !== this.renderContext.height) {
                            this._foregroundCanvas.width = ss.truncate(this.renderContext.width);
                            this._foregroundCanvas.height = ss.truncate(this.renderContext.height);
                        }
                        var saveDevice = this.renderContext.device;
                        this._fgDevice.clearRect(0, 0, this.renderContext.width, this.renderContext.height);
                        this.renderContext.device = this._fgDevice;
                        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), 100);
                        this.renderContext.device = saveDevice;
                        this.renderContext.device.save();
                        this.renderContext.device.globalAlpha = this.renderContext.viewCamera.opacity / 100;
                        this.renderContext.device.drawImage(this._foregroundCanvas, 0, 0);
                        this.renderContext.device.restore();
                    }
                    else {
                        this.renderContext.drawImageSet(this.renderContext.get_foregroundImageset(), this.renderContext.viewCamera.opacity);
                    }
                }
            }
            if (this.renderType === 2) {
                var $enum1 = ss.enumerate(this.renderContext.get_catalogHipsImagesets());
                while ($enum1.moveNext()) {
                    var imageset = $enum1.current;
                    if (imageset.get_hipsProperties().get_catalogSpreadSheetLayer().enabled && imageset.get_hipsProperties().get_catalogSpreadSheetLayer().lastVersion === imageset.get_hipsProperties().get_catalogSpreadSheetLayer().get_version()) {
                        this.renderContext.drawImageSet(imageset, 100);
                    }
                }
            }
            if (this.renderType === 2 && Settings.get_active().get_showSolarSystem()) {
                Planets.drawPlanets(this.renderContext, 1);
                this.constellation = Constellations.containment.findConstellationForPoint(this.renderContext.viewCamera.get_RA(), this.renderContext.viewCamera.get_dec());
                this._drawSkyOverlays();
            }
            if (this.get_planetLike() || this.get_space()) {
                if (!this.get_space()) {
                    var angle = Coordinates.mstFromUTC2(SpaceTimeController.get_now(), 0) / 180 * Math.PI;
                    this.renderContext.set_worldBaseNonRotating(Matrix3d.multiplyMatrix(Matrix3d._rotationY(angle), this.renderContext.get_worldBase()));
                    if (this._targetBackgroundImageset != null) {
                        this.renderContext.set_nominalRadius(this._targetBackgroundImageset.get_meanRadius());
                    }
                }
                else {
                    this.renderContext.set_worldBaseNonRotating(this.renderContext.get_world());
                    if (this._targetBackgroundImageset != null) {
                        this.renderContext.set_nominalRadius(this._targetBackgroundImageset.get_meanRadius());
                    }
                }
                var referenceFrame = this.getCurrentReferenceFrame();
                LayerManager._draw(this.renderContext, 1, this.get_space(), referenceFrame, true, this.get_space());
            }
        }
        var worldSave = this.renderContext.get_world();
        var viewSave = this.renderContext.get_view();
        var projSave = this.renderContext.get_projection();
        if (Settings.get_current().get_showCrosshairs()) {
            this._drawCrosshairs(this.renderContext);
        }
        if (this.uiController != null) {
            this.uiController.render(this.renderContext);
        } else {
            var index = 0;
            Annotation.prepBatch(this.renderContext);
            var $enum2 = ss.enumerate(this._annotations);
            while ($enum2.moveNext()) {
                var item = $enum2.current;
                item.draw(this.renderContext);
                index++;
            }
            Annotation.drawBatch(this.renderContext);
            if ((ss.now() - this._lastMouseMove) > 400) {
                var raDecDown = this.getCoordinatesForScreenPoint(this._hoverTextPoint.x, this._hoverTextPoint.y);
                this._annotationHover(raDecDown.x, raDecDown.y, this._hoverTextPoint.x, this._hoverTextPoint.y);
                this._lastMouseMove = new Date(2100, 1, 1);
            }
            if (!ss.emptyString(this._hoverText)) {
                this._drawHoverText(this.renderContext);
            }
        }
        var tilesAllLoaded = !TileCache.get_queueCount();
        this.renderContext.setupMatricesOverlays();
        this._fadeFrame();
        this._frameCount++;
        TileCache.decimateQueue();
        TileCache.processQueue(this.renderContext);
        Tile.currentRenderGeneration++;
        if (!TourPlayer.get_playing()) {
            this.set_crossFadeFrame(false);
        }

        // Restore Matrices for Finder Scope and such to map points
        this.renderContext.set_world(worldSave);
        this.renderContext.set_view(viewSave);
        this.renderContext.set_projection(projSave);
        var now = ss.now();
        var ms = now - this._lastUpdate;
        if (ms > 1000) {
            this._lastUpdate = now;
            this._frameCount = 0;
            RenderTriangle.trianglesRendered = 0;
            RenderTriangle.trianglesCulled = 0;
        }
        if (this.capturingVideo) {
            if ((this.dumpFrameParams != null) && (!this.dumpFrameParams.waitDownload || tilesAllLoaded)) {
                this.captureFrameForVideo(this._videoBlobReady, this.dumpFrameParams.width, this.dumpFrameParams.height, this.dumpFrameParams.format);
                SpaceTimeController.nextFrame();
            }
            if (SpaceTimeController.get_doneDumping()) {
                SpaceTimeController.frameDumping = false;
                SpaceTimeController.cancelFrameDump = false;
                this.capturingVideo = false;
            }
        }
    },

    getCurrentReferenceFrame: function () {
        if (this.renderContext.get_backgroundImageset() == null) {
            return 'Sun';
        }
        if (!ss.emptyString(this.renderContext.get_backgroundImageset().get_referenceFrame())) {
            return this.renderContext.get_backgroundImageset().get_referenceFrame();
        }
        if (!this.renderContext.get_backgroundImageset().get_dataSetType()) {
            return 'Earth';
        }
        if (this.renderContext.get_backgroundImageset().get_name() === 'Visible Imagery' && this.renderContext.get_backgroundImageset().get_url().toLowerCase().indexOf('mars') > -1) {
            this.renderContext.get_backgroundImageset().set_referenceFrame('Mars');
            return this.renderContext.get_backgroundImageset().get_referenceFrame();
        }
        if (this.renderContext.get_backgroundImageset().get_dataSetType() === 1) {
            var $enum1 = ss.enumerate(WWTControl.solarSystemObjectsNames);
            while ($enum1.moveNext()) {
                var name = $enum1.current;
                if (this.renderContext.get_backgroundImageset().get_name().toLowerCase().indexOf(name.toLowerCase()) > -1) {
                    this.renderContext.get_backgroundImageset().set_referenceFrame(name);
                    return name;
                }
            }
        }
        if (this.renderContext.get_backgroundImageset().get_dataSetType() === 2) {
            return 'Sky';
        }
        return '';
    },

    get_planetLike: function () {
        if (this.renderContext.get_backgroundImageset() != null) {
            return !this.renderContext.get_backgroundImageset().get_dataSetType() || this.renderContext.get_backgroundImageset().get_dataSetType() === 1;
        } else {
            return true;
        }
    },

    get_space: function () {
        if (this.renderContext.get_backgroundImageset() != null) {
            return this.renderContext.get_backgroundImageset().get_dataSetType() === 2;
        } else {
            return true;
        }
    },

    _drawSkyOverlays: function () {
        if (Settings.get_active().get_showConstellationPictures() && !this.freestandingMode) {
            Constellations.drawArtwork(this.renderContext);
        }
        if (Settings.get_active().get_showConstellationFigures()) {
            if (WWTControl.constellationsFigures == null) {
                WWTControl.constellationsFigures = Constellations.create(
                    'Constellations',
                    URLHelpers.singleton.engineAssetUrl('figures.txt'),
                    false,  // "boundry"
                    false,  // "noInterpollation"
                    false,  // "resource"
                );
            }
            WWTControl.constellationsFigures.draw(this.renderContext, false, 'UMA', false);
        }
        if (Settings.get_active().get_showEclipticGrid()) {
            Grids.drawEclipticGrid(this.renderContext, 1, Settings.get_active().get_eclipticGridColor());
            if (Settings.get_active().get_showEclipticGridText()) {
                Grids.drawEclipticGridText(this.renderContext, 1, Settings.get_active().get_eclipticGridColor());
            }
        }
        if (Settings.get_active().get_showGalacticGrid()) {
            Grids.drawGalacticGrid(this.renderContext, 1, Settings.get_active().get_galacticGridColor());
            if (Settings.get_active().get_showGalacticGridText()) {
                Grids.drawGalacticGridText(this.renderContext, 1, Settings.get_active().get_galacticGridColor());
            }
        }
        if (Settings.get_active().get_showAltAzGrid()) {
            Grids.drawAltAzGrid(this.renderContext, 1, Settings.get_active().get_altAzGridColor());
            if (Settings.get_active().get_showAltAzGridText()) {
                Grids.drawAltAzGridText(this.renderContext, 1, Settings.get_active().get_altAzGridColor());
            }
        }
        if (Settings.get_active().get_showPrecessionChart()) {
            Grids.drawPrecessionChart(this.renderContext, 1, Settings.get_active().get_precessionChartColor());
        }
        if (Settings.get_active().get_showEcliptic()) {
            Grids.drawEcliptic(this.renderContext, 1, Settings.get_active().get_eclipticColor());
            if (Settings.get_active().get_showEclipticOverviewText()) {
                Grids.drawEclipticText(this.renderContext, 1, Settings.get_active().get_eclipticColor());
            }
        }
        if (Settings.get_active().get_showGrid()) {
            Grids.drawEquitorialGrid(this.renderContext, 1, Settings.get_active().get_equatorialGridColor());
            if (Settings.get_active().get_showEquatorialGridText()) {
                Grids.drawEquitorialGridText(this.renderContext, 1, Settings.get_active().get_equatorialGridColor());
            }
        }
        if (Settings.get_active().get_showConstellationBoundries()) {
            if (WWTControl.constellationsBoundries == null) {
                WWTControl.constellationsBoundries = Constellations.create(
                    'Constellations',
                    URLHelpers.singleton.engineAssetUrl('constellations.txt'),
                    true,   // "boundry"
                    false,  // "noInterpollation"
                    false,  // "resource"
                );
            }
            WWTControl.constellationsBoundries.draw(this.renderContext, Settings.get_active().get_showConstellationSelection(), this.constellation, false);
        }
        if (Settings.get_active().get_showConstellationLabels()) {
            Constellations.drawConstellationNames(this.renderContext, 1, Colors.get_yellow());
        }
    },

    _drawHoverText: function (RenderContext) {
        if (RenderContext.gl == null) {
            var ctx = RenderContext.device;
            ctx.save();
            ctx.fillStyle = 'White';
            ctx.font = '15px Arial';
            ctx.fillText(this._hoverText, this._hoverTextPoint.x, this._hoverTextPoint.y);
            ctx.restore();
        }
    },

    rAtoViewLng: function (ra) {
        return (((180 - (ra / 24 * 360) - 180) + 540) % 360) - 180;
    },

    _updateViewParameters: function () {
        if (this.renderContext.space && this._tracking && this._trackingObject != null) {
            if (Settings.get_active().get_galacticMode() && this.renderContext.space) {
                var gPoint = Coordinates.j2000toGalactic(this._trackingObject.get_RA() * 15, this._trackingObject.get_dec());
                this.renderContext.targetAlt = this.renderContext.alt = gPoint[1];
                this.renderContext.targetAz = this.renderContext.az = gPoint[0];
            }
            else if (this.renderContext.space && Settings.get_active().get_localHorizonMode()) {
                var currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(this._trackingObject.get_RA(), this._trackingObject.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
                this.renderContext.targetAlt = currentAltAz.get_alt();
                this.renderContext.targetAz = currentAltAz.get_az();
            }
            else {
                this.renderContext.viewCamera.lng = this.renderContext.targetCamera.lng = this.rAtoViewLng(this._trackingObject.get_RA());
                this.renderContext.viewCamera.lat = this.renderContext.targetCamera.lat = this._trackingObject.get_dec();
            }
        } else if (!this.get_solarSystemMode()) {
            this._tracking = false;
            this._trackingObject = null;
        }
        var oneMinusDragCoefficient = 1 - 0.8;
        var dc = 0.8;
        if (!this._tracking) {
            var minDelta = (this.renderContext.viewCamera.zoom / 4000);
            if (this.renderContext.viewCamera.zoom > 360) {
                minDelta = (360 / 40000);
            }
            if (this.renderContext.space && (Settings.get_active().get_localHorizonMode() || Settings.get_active().get_galacticMode())) {
                if ((((Math.abs(this.renderContext.targetAlt - this.renderContext.alt) >= minDelta) | (Math.abs(this.renderContext.targetAz - this.renderContext.az) >= minDelta)) === 1)) {
                    this.renderContext.alt += (this.renderContext.targetAlt - this.renderContext.alt) / 10;
                    if (Math.abs(this.renderContext.targetAz - this.renderContext.az) > 170) {
                        if (this.renderContext.targetAz > this.renderContext.az) {
                            this.renderContext.az += (this.renderContext.targetAz - (360 + this.renderContext.az)) / 10;
                        }
                        else {
                            this.renderContext.az += ((360 + this.renderContext.targetAz) - this.renderContext.az) / 10;
                        }
                    }
                    else {
                        this.renderContext.az += (this.renderContext.targetAz - this.renderContext.az) / 10;
                    }
                    this.renderContext.az = ((this.renderContext.az + 720) % 360);
                }
            }
            else {
                if ((((Math.abs(this.renderContext.targetCamera.lat - this.renderContext.viewCamera.lat) >= minDelta) | (Math.abs(this.renderContext.targetCamera.lng - this.renderContext.viewCamera.lng) >= minDelta)) === 1)) {
                    this.renderContext.viewCamera.lat += (this.renderContext.targetCamera.lat - this.renderContext.viewCamera.lat) / 10;
                    if (Math.abs(this.renderContext.targetCamera.lng - this.renderContext.viewCamera.lng) > 170) {
                        if (this.renderContext.targetCamera.lng > this.renderContext.viewCamera.lng) {
                            this.renderContext.viewCamera.lng += (this.renderContext.targetCamera.lng - (360 + this.renderContext.viewCamera.lng)) / 10;
                        }
                        else {
                            this.renderContext.viewCamera.lng += ((360 + this.renderContext.targetCamera.lng) - this.renderContext.viewCamera.lng) / 10;
                        }
                    }
                    else {
                        this.renderContext.viewCamera.lng += (this.renderContext.targetCamera.lng - this.renderContext.viewCamera.lng) / 10;
                    }
                    this.renderContext.viewCamera.lng = ((this.renderContext.viewCamera.lng + 720) % 360);
                }
                else {
                    if (this.renderContext.viewCamera.lat !== this.renderContext.targetCamera.lat || this.renderContext.viewCamera.lng !== this.renderContext.targetCamera.lng) {
                        this.renderContext.viewCamera.lat = this.renderContext.targetCamera.lat;
                        this.renderContext.viewCamera.lng = this.renderContext.targetCamera.lng;
                    }
                }
            }
        }
        this.renderContext.viewCamera.zoom = dc * this.renderContext.viewCamera.zoom + oneMinusDragCoefficient * this.renderContext.targetCamera.zoom;
        this.renderContext.viewCamera.rotation = dc * this.renderContext.viewCamera.rotation + oneMinusDragCoefficient * this.renderContext.targetCamera.rotation;
        this.renderContext.viewCamera.angle = dc * this.renderContext.viewCamera.angle + oneMinusDragCoefficient * this.renderContext.targetCamera.angle;
    },

    move: function (x, y) {
        // Emulate MoveView() in the Windows client -- rotate the x and y
        // offsets if the view is rotated. Our signs are the opposite of
        // the Windows client.

        var angle = Math.atan2(y, x);
        var distance = Math.sqrt(x * x + y * y);
        if (this.get_solarSystemMode() || this.get_planetLike()) {
            x = Math.cos(angle + this.renderContext.viewCamera.rotation) * distance;
            y = Math.sin(angle + this.renderContext.viewCamera.rotation) * distance;
        } else {
            x = Math.cos(angle - this.renderContext.viewCamera.rotation) * distance;
            y = Math.sin(angle - this.renderContext.viewCamera.rotation) * distance;
        }

        // Apply the rotated offsets. The following merges up GetPixelScale{X,Y}()
        // and MoveViewNative() of the Windows client.

        var scaleY = this.renderContext.get_fovScale() / 3600;
        if (this.renderContext.get_backgroundImageset().get_dataSetType() == ImageSetType.solarSystem) {
            scaleY = 0.06;
        }
        var scaleX = scaleY / Math.max(0.2, Math.cos(this.renderContext.viewCamera.lat / 180 * Math.PI));
        if (!this.renderContext.get_backgroundImageset().get_dataSetType() || this.renderContext.get_backgroundImageset().get_dataSetType() === 1 || this.renderContext.get_backgroundImageset().get_dataSetType() == ImageSetType.solarSystem) {
            scaleX *= 6.3;  // XXX don't know where this magic number comes from
            scaleY *= 6.3;
        }
        if (this.renderContext.space && (Settings.get_active().get_galacticMode() || Settings.get_active().get_localHorizonMode())) {
            x = (Settings.get_active().get_localHorizonMode()) ? -x : x;
            this.renderContext.targetAz += x * scaleX;
            this.renderContext.targetAz = ((this.renderContext.targetAz + 720) % 360);
            this.renderContext.targetAlt += y * scaleY;
            if (this.renderContext.targetAlt > 90) {
                this.renderContext.targetAlt = 90;
            }
            if (this.renderContext.targetAlt < -90) {
                this.renderContext.targetAlt = -90;
            }
        } else {
            this.renderContext.targetCamera.lng -= x * scaleX;
            this.renderContext.targetCamera.lng = ((this.renderContext.targetCamera.lng + 720) % 360);
            this.renderContext.targetCamera.lat += y * scaleY;
            if (this.renderContext.targetCamera.lat > 90) {
                this.renderContext.targetCamera.lat = 90;
            }
            if (this.renderContext.targetCamera.lat < -90) {
                this.renderContext.targetCamera.lat = -90;
            }
        }
        if (!Settings.get_globalSettings().get_smoothPan()) {
            this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
        }
        if (!!x && !!y) {
            this._tracking = false;
            this._trackingObject = null;
        }
    },

    zoom: function (factor) {
        this.renderContext.targetCamera.zoom *= factor;
        if (this.renderContext.targetCamera.zoom > this.get_zoomMax()) {
            this.renderContext.targetCamera.zoom = this.get_zoomMax();
        }
        if (!Settings.get_globalSettings().get_smoothPan()) {
            this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
        }
    },

    roll: function (angle) {
        this.renderContext.targetCamera.rotation += angle;
    },

    // Gesture events

    onGestureStart: function (e) {
        this._mouseDown = false;
        this._beginZoom = this.renderContext.viewCamera.zoom;
    },

    onGestureChange: function (e) {
        var g = e;
        this._mouseDown = false;
        this.renderContext.targetCamera.zoom = this.renderContext.viewCamera.zoom = Math.min(360, this._beginZoom * (1 / g.scale));
    },

    onGestureEnd: function (e) {
        var g = e;
        this._mouseDown = false;
    },

    // Touch events

    onTouchStart: function (e) {
        var ev = e;
        ev.preventDefault();
        ev.stopPropagation();
        this._lastX = ev.targetTouches[0].pageX;
        this._lastY = ev.targetTouches[0].pageY;
        if (ev.targetTouches.length === 2) {
            this._hasTwoTouches = true;
            return;
        }
        if (this.uiController != null) {
            var ee = new WWTElementEvent(this._lastX, this._lastY);
            if (this.uiController.mouseDown(this, ee)) {
                this._mouseDown = false;
                this._dragging = false;
                return;
            }
        }
        this._mouseDown = true;
    },

    onTouchMove: function (e) {
        var ev = e;
        if (this._hasTwoTouches) {
            var t0 = ev.touches[0];
            var t1 = ev.touches[1];
            var newRect = new Array(2);
            newRect[0] = Vector2d.create(t0.pageX, t0.pageY);
            newRect[1] = Vector2d.create(t1.pageX, t1.pageY);
            if (this._pinchingZoomRect[0] != null && this._pinchingZoomRect[1] != null) {
                var centerPoint = Vector2d.create(this.renderContext.width / 2, this.renderContext.height / 2);
                var delta1 = Vector2d.subtract(newRect[0], this._pinchingZoomRect[0]);
                var delta2 = Vector2d.subtract(newRect[1], this._pinchingZoomRect[1]);
                var radialDirection1 = Vector2d.subtract(this._pinchingZoomRect[0], centerPoint);
                var radialDirection2 = Vector2d.subtract(this._pinchingZoomRect[1], centerPoint);
                radialDirection1.normalize();
                radialDirection2.normalize();
                var radialDot1 = delta1.x * radialDirection1.x + delta1.y * radialDirection1.y;
                var radialDot2 = delta2.x * radialDirection2.x + delta2.y * radialDirection2.y;
                var radialComponent1 = Vector2d.create(radialDot1 * radialDirection1.x, radialDot1 * radialDirection1.y);
                var radialComponent2 = Vector2d.create(radialDot2 * radialDirection2.x, radialDot2 * radialDirection2.y);
                var angularComponent1 = Vector2d.subtract(delta1, radialComponent1);
                var angularComponent2 = Vector2d.subtract(delta2, radialComponent2);
                var radialMagnitude = radialComponent1.get_length() + radialComponent2.get_length();
                var angularMagnitude = angularComponent1.get_length() + angularComponent2.get_length();
                if (radialMagnitude >= angularMagnitude) {
                    var oldDist = this.getDistance(this._pinchingZoomRect[0], this._pinchingZoomRect[1]);
                    var newDist = this.getDistance(newRect[0], newRect[1]);
                    var ratio = oldDist / newDist;
                    this.zoom(ratio);
                }
                else {
                    var oldCenterDelta1 = Vector2d.subtract(this._pinchingZoomRect[0], centerPoint);
                    var oldCenterDelta2 = Vector2d.subtract(this._pinchingZoomRect[1], centerPoint);
                    var newCenterDelta1 = Vector2d.subtract(newRect[0], centerPoint);
                    var newCenterDelta2 = Vector2d.subtract(newRect[1], centerPoint);
                    var cross1 = this.crossProductZ(oldCenterDelta1, newCenterDelta1);
                    var cross2 = this.crossProductZ(oldCenterDelta2, newCenterDelta2);
                    var angle1 = Math.asin(cross1 / (oldCenterDelta1.get_length() * newCenterDelta1.get_length()));
                    var angle2 = Math.asin(cross2 / (oldCenterDelta2.get_length() * newCenterDelta2.get_length()));
                    if (angle1 * angle2 >= 0) {
                        var angle = angle1 + angle2;
                        if (this.get_planetLike() || this.get_solarSystemMode()) {
                            angle *= -1;
                        }
                        this.roll(angle);
                    }
                }
            }
            this._pinchingZoomRect = newRect;
            ev.stopPropagation();
            ev.preventDefault();
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        if (this._mouseDown) {
            this._dragging = true;
            var curX = ev.targetTouches[0].pageX - this._lastX;
            var curY = ev.targetTouches[0].pageY - this._lastY;
            this.move(curX, curY);
            this._lastX = ev.targetTouches[0].pageX;
            this._lastY = ev.targetTouches[0].pageY;
        } else {
            //todo fix this to use syntheszed touch events.
            if (this.uiController != null) {
                if (this.uiController.mouseMove(this, e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
        }
    },

    onTouchEnd: function (e) {
        var ev = e;
        ev.preventDefault();
        ev.stopPropagation();
        this._pinchingZoomRect[0] = null;
        this._pinchingZoomRect[1] = null;
        if (this._hasTwoTouches) {
            if (ev.touches.length < 2) {
                this._hasTwoTouches = false;
            }
            return;
        }
        if (this.uiController != null) {
            var ee = new WWTElementEvent(this._lastX, this._lastY);
            if (this.uiController.mouseUp(this, ee)) {
                this._mouseDown = false;
                this._dragging = false;
                return;
            }
        }
        this._mouseDown = false;
        this._dragging = false;
    },

    // Pointer events

    onPointerDown: function (e) {
        var pe = e;
        var index = 0;
        var evt = arguments[0], cnv = arguments[0].target; if (cnv.setPointerCapture) { cnv.setPointerCapture(evt.pointerId); } else if (cnv.msSetPointerCapture) { cnv.msSetPointerCapture(evt.pointerId); }

        // Check for this pointer already being in the list because as of July
        // 2020, Chrome/Mac sometimes fails to deliver the pointerUp event.

        if (this._pointerIds[0] === pe.pointerId) {
            index = 0;
        } else if (this._pointerIds[1] === pe.pointerId) {
            index = 1;
        } else if (!this._pointerIds[0]) {
            index = 0;
        } else if (!this._pointerIds[1]) {
            index = 1;
        } else {
            return;  // only attempt to track two pointers at once
        }
        this._pointerIds[index] = pe.pointerId;
        this._pinchingZoomRect[index] = Vector2d.create(e.offsetX, e.offsetY);
    },

    onPointerMove: function (e) {
        var pe = e;
        var index = 0;

        // Our pointerIds infrastructure is meant to track adjustments during a
        // pinch motion. However, as seen in Firefox circa v81 on Linux and
        // Android, in some cases the browser can just *lie* and swap pointerIds
        // for the two fingers during a pinch gesture, leading to catastrophic
        // failures. Therefore, ignore the pointerId information and infer which
        // location is being updated from whichever change is smaller.

        if (this._pointerIds[0] === pe.pointerId) {
            index = 0;
        } else if (this._pointerIds[1] === pe.pointerId) {
            index = 1;
        } else {
            return;
        }
        if (this._pinchingZoomRect[0] != null && this._pinchingZoomRect[1] != null) {
            var oldDist = this.getDistance(this._pinchingZoomRect[0], this._pinchingZoomRect[1]);
            var newRect = Vector2d.create(e.offsetX, e.offsetY);
            var newDist0 = this.getDistance(newRect, this._pinchingZoomRect[0]);
            var ratio0 = oldDist / newDist0;
            var abslog0 = Math.abs(Math.log(ratio0));
            if (!isFinite(abslog0)) {
                abslog0 = 1000;
            }
            var newDist1 = this.getDistance(newRect, this._pinchingZoomRect[1]);
            var ratio1 = oldDist / newDist1;
            var abslog1 = Math.abs(Math.log(ratio1));
            if (!isFinite(abslog1)) {
                abslog1 = 1000;
            }
            if (abslog1 < abslog0) {
                this._pinchingZoomRect[0] = newRect;
                this.zoom(ratio1);
            }
            else {
                this._pinchingZoomRect[1] = newRect;
                this.zoom(ratio0);
            }
        } else {
            // Before two fingers are available, just trust.
            this._pinchingZoomRect[index] = Vector2d.create(e.offsetX, e.offsetY);
        }

        // There doesn't seem to be a particular reason to call these
        // but there also doesn't seem to be a reason NOT to
        // and doing so hasn't caused any issues to this point
        e.stopPropagation();
        e.preventDefault();
    },

    // NOTE! As of July 2020, Chrome on Macs seems to sometimes fail to
    // deliver this event. So our pinch-detection code needs to be robust to
    // that.
    onPointerUp: function (e) {
        var pe = e;

        // The -2 here is intended to indicate "no pointer ID"
        // with the hope being that no browser will use this value.
        // Note that -1 is reserved by the W3 spec for
        // "events generated by something other than a pointing device"
        // which is why we don't use -1
        // (https://www.w3.org/TR/pointerevents3/#pointerevent-interface)

        if (this._pointerIds[0] === pe.pointerId) {
            this._pointerIds[0] = -2;
            this._pinchingZoomRect[0] = null;
        }

        if (this._pointerIds[1] === pe.pointerId) {
            this._pointerIds[1] = -2;
            this._pinchingZoomRect[1] = null;
        }
    },

    // Mouse events

    onMouseDown: function (e) {
        document.addEventListener('mousemove', ss.bind('onMouseMove', this), false);
        document.addEventListener('mouseup', ss.bind('onMouseUp', this), false);
        if (this.uiController != null) {
            if (this.uiController.mouseDown(this, e)) {
                return;
            }
        }
        this._mouseDown = true;
        this._lastX = Mouse.offsetX(this.canvas, e);
        this._lastY = Mouse.offsetY(this.canvas, e);
    },

    onMouseMove: function (e) {
        this._lastMouseMove = ss.now();
        this._hoverTextPoint = Vector2d.create(Mouse.offsetX(this.canvas, e), Mouse.offsetY(this.canvas, e));
        this._hoverText = '';
        if (this._mouseDown) {
            e.preventDefault();
            e.stopPropagation();
            this._moved = true;
            if (e.ctrlKey) {
                this._tilt(Mouse.offsetX(this.canvas, e) - this._lastX, Mouse.offsetY(this.canvas, e) - this._lastY);
            }
            else {
                this.move(Mouse.offsetX(this.canvas, e) - this._lastX, Mouse.offsetY(this.canvas, e) - this._lastY);
            }
            this._lastX = Mouse.offsetX(this.canvas, e);
            this._lastY = Mouse.offsetY(this.canvas, e);
        } else {
            if (this.uiController != null) {
                if (this.uiController.mouseMove(this, e)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
        }
    },

    onMouseUp: function (e) {
        document.removeEventListener('mousemove', ss.bind('onMouseMove', this), false);
        document.removeEventListener('mouseup', ss.bind('onMouseUp', this), false);
        if (this.uiController != null) {
            if (this.uiController.mouseUp(this, e)) {
                this._mouseDown = false;
                e.preventDefault();
                return;
            }
        }
        if (this._mouseDown && !this._moved) {
            var raDecDown = this.getCoordinatesForScreenPoint(Mouse.offsetX(this.canvas, e), Mouse.offsetY(this.canvas, e));
            if (!this._annotationclicked(raDecDown.x, raDecDown.y, Mouse.offsetX(this.canvas, e), Mouse.offsetY(this.canvas, e))) {
                globalScriptInterface._fireClick(raDecDown.x, raDecDown.y);
            }
        }
        this._mouseDown = false;
        this._moved = false;
    },

    // WheelEvent is a WWT-specific name that we use to abstract across the
    // different wheel-motion events that browsers provide: "wheel",
    // "mousewheel", "DOMMouseScroll".
    onMouseWheel: function (e) {
        var ev = e;
        var delta;
        if (!!ev.deltaY) {
            delta = -ev.deltaY;
        } else if (!!ev.detail) {
            delta = ev.detail * -1;
        } else {
            delta = ev.wheelDelta;
        }
        if (delta > 0) {
            this.zoom(0.9);
        } else {
            this.zoom(1.1);
        }
        e.stopPropagation();
        e.preventDefault();
    },

    onDoubleClick: function (e) {
        WWTControl.showDataLayers = true;
    },

    onKeyDown: function (e) {
        if (this.uiController != null) {
            this.uiController.keyDown(this, e);
        }
    },

    getDistance: function (a, b) {
        var x;
        var y;
        x = a.x - b.x;
        y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
    },

    crossProductZ: function (a, b) {
        return a.x * b.y - a.y * b.x;
    },

    onContextMenu: function (e) {
        e.preventDefault();
        e.stopPropagation();
    },

    _tilt: function (x, y) {
        this.renderContext.targetCamera.rotation += x * 0.001;
        this.renderContext.targetCamera.angle += y * 0.001;
        if (this.renderContext.targetCamera.angle < -1.52) {
            this.renderContext.targetCamera.angle = -1.52;
        }
        if (this.renderContext.targetCamera.angle > 0) {
            this.renderContext.targetCamera.angle = 0;
        }
    },

    getCoordinatesForScreenPoint: function (x, y) {
        var pt = Vector2d.create(x, y);
        var PickRayDir = this.transformPickPointToWorldSpace(pt, this.renderContext.width, this.renderContext.height);
        return Coordinates.cartesianToSphericalSky(PickRayDir);
    },

    transformPickPointToWorldSpace: function (ptCursor, backBufferWidth, backBufferHeight) {
        var vPickRayDir = new Vector3d();

        // It is possible for this function to be called before the RenderContext is
        // set up, in which case the Projection is null. In that case we'll leave the
        // vector at its 0,0,0 default.

        if (this.renderContext.get_projection() != null) {
            var v = new Vector3d();
            v.x = (((2 * ptCursor.x) / backBufferWidth) - 1) / this.renderContext.get_projection().get_m11();
            v.y = (((2 * ptCursor.y) / backBufferHeight) - 1) / this.renderContext.get_projection().get_m22();
            v.z = 1;
            var m = Matrix3d.multiplyMatrix(this.renderContext.get_view(), this.renderContext.get_world());

            m.invert();

            // Transform the screen space pick ray into 3D space
            vPickRayDir.x = v.x * m.get_m11() + v.y * m.get_m21() + v.z * m.get_m31();
            vPickRayDir.y = v.x * m.get_m12() + v.y * m.get_m22() + v.z * m.get_m32();
            vPickRayDir.z = v.x * m.get_m13() + v.y * m.get_m23() + v.z * m.get_m33();
            vPickRayDir.normalize();
        }
        return vPickRayDir;
    },

    transformWorldPointToPickSpace: function (worldPoint, backBufferWidth, backBufferHeight) {
        var m = Matrix3d.multiplyMatrix(this.renderContext.get_view(), this.renderContext.get_world());
        m.invert();
        var p = new Vector2d();
        var vz = worldPoint.x * m.get_m31() + worldPoint.y * m.get_m32() + worldPoint.z * m.get_m33();
        var vx = (worldPoint.x * m.get_m11() + worldPoint.y * m.get_m12() + worldPoint.z * m.get_m13()) / vz;
        var vy = (worldPoint.x * m.get_m21() + worldPoint.y * m.get_m22() + worldPoint.z * m.get_m23()) / vz;
        p.x = Math.round((1 + this.renderContext.get_projection().get_m11() * vx) * (backBufferWidth / 2));
        p.y = Math.round((1 + this.renderContext.get_projection().get_m22() * vy) * (backBufferHeight / 2));
        return p;
    },

    getScreenPointForCoordinates: function (ra, dec) {
        var pt = Vector2d.create(ra, dec);
        var cartesian = Coordinates.sphericalSkyToCartesian(pt);
        var result = this.transformWorldPointToPickSpace(cartesian, this.renderContext.width, this.renderContext.height);
        return result;
    },

    // Note that due to limitations of ScriptSharp, this method was public even
    // though it should really have been private.
    setup: function (canvas, startLat, startLng, startZoom) {
        var $this = this;

        window.addEventListener('contextmenu', ss.bind('onContextMenu', this), false);
        document.body.addEventListener('keydown', ss.bind('onKeyDown', this), false);
        canvas.addEventListener('dblclick', ss.bind('onDoubleClick', this), false);
        canvas.addEventListener('mousedown', ss.bind('onMouseDown', this), false);
        canvas.addEventListener('wheel', ss.bind('onMouseWheel', this), false);
        canvas.addEventListener('mousewheel', ss.bind('onMouseWheel', this), false);
        canvas.addEventListener('DOMMouseScroll', ss.bind('onMouseWheel', this), false);  // old Firefox
        canvas.addEventListener('touchstart', ss.bind('onTouchStart', this), false);
        canvas.addEventListener('touchmove', ss.bind('onTouchMove', this), false);
        canvas.addEventListener('touchend', ss.bind('onTouchEnd', this), false);
        canvas.addEventListener('gesturechange', ss.bind('onGestureChange', this), false);
        canvas.addEventListener('gesturestart', ss.bind('onGestureStart', this), false);
        canvas.addEventListener('gestureend', ss.bind('onGestureEnd', this), false);
        canvas.addEventListener('pointerdown', ss.bind('onPointerDown', this), false);
        canvas.addEventListener('pointermove', ss.bind('onPointerMove', this), false);
        canvas.addEventListener('pointerup', ss.bind('onPointerUp', this), false);
        this.renderContext.viewCamera.lat = startLat;
        this.renderContext.viewCamera.lng = startLng;
        this.renderContext.viewCamera.zoom = startZoom;
        this.renderContext.targetCamera = this.renderContext.viewCamera.copy();
        if (this.renderContext.gl == null) {
            this._foregroundCanvas = document.createElement('canvas');
            this._foregroundCanvas.width = canvas.width;
            this._foregroundCanvas.height = canvas.height;
            this._fgDevice = this._foregroundCanvas.getContext('2d');
        }
        if (this.freestandingMode) {
            setTimeout(function () {
                $this._setupComplete();
            }, 0);
        } else {
            // To line up with Windows client history, this uses `X=` when `W=`
            // would be more appropriate.
            loadWtmlFile(URLHelpers.singleton.coreDynamicUrl('wwtweb/catalog.aspx?X=ImageSets6'), ss.bind('_setupComplete', this), true);
        }
    },

    _setupComplete: function () {
        globalScriptInterface._fireReady();
    },

    gotoRADecZoom: function (ra, dec, zoom, instant, roll) {
        this._tracking = false;
        this._trackingObject = null;
        this.gotoTargetFull(
            false, // noZoom
            instant,
            this._cameraParametersFromRADecZoom(ra, dec, zoom, roll),
            globalRenderContext.get_foregroundImageset(),
            globalRenderContext.get_backgroundImageset()
        );
    },

    _cameraParametersFromRADecZoom: function (ra, dec, zoom, roll) {
        while (ra > 24) {
            ra -= 24;
        }
        while (ra < 0) {
            ra += 24;
        }
        dec = DoubleUtilities.clamp(dec, -90, 90);
        zoom = DoubleUtilities.clamp(zoom, this.get_zoomMin(), this.get_zoomMax());
        var rotation = (roll == null) ? globalRenderContext.viewCamera.rotation : roll;
        var cameraParams = CameraParameters.create(dec, globalRenderContext.rAtoViewLng(ra), zoom, rotation, globalRenderContext.viewCamera.angle, globalRenderContext.viewCamera.opacity);
        return cameraParams;
    },

    timeToRADecZoom: function (ra, dec, zoom, roll) {
        var cameraParams = this._cameraParametersFromRADecZoom(ra, dec, zoom, roll);
        return this.timeToTargetFull(cameraParams, false);
    },

    get_solarSystemMode: function () {
        if (this.renderContext.get_backgroundImageset() == null) {
            return false;
        }
        return this.renderContext.get_backgroundImageset().get_dataSetType() == ImageSetType.solarSystem;
    },

    gotoTarget: function (place, noZoom, instant, trackObject) {
        if (place == null) {
            return;
        }
        if ((trackObject && this.get_solarSystemMode())) {
            if ((place.get_classification() === 536870912 && place.get_type() !== 4) || (place.get_classification() === 1) || (place.get_classification() === 1048576) && place.get_distance() > 0) {
                var target = 65536;
                if (place.get_classification() === 1 || place.get_classification() === 1048576) {
                    target = 20;
                }
                else {
                    try {
                        if (place.get_target() !== 65536) {
                            target = place.get_target();
                        }
                        else {
                            target = Planets.getPlanetIDFromName(place.get_name());
                        }
                    }
                    catch ($e1) {
                    }
                }
                if (target !== 65536) {
                    this._trackingObject = place;
                    if (target === this._solarSystemTrack && !(place.get_classification() === 1 || place.get_classification() === 1048576)) {
                        this.gotoTarget3(place.get_camParams(), noZoom, instant);
                        return;
                    }
                    var jumpTime = 4;
                    if (target === 20) {
                        jumpTime = 17;
                    }
                    else {
                        jumpTime += 13 * (101 - Settings.get_active().get_solarSystemScale()) / 100;
                    }
                    if (instant) {
                        jumpTime = 1;
                    }
                    var camTo = this.renderContext.viewCamera.copy();
                    camTo.targetReferenceFrame = '';
                    camTo.target = target;
                    var zoom = 10;
                    if (target === 20) {
                        if (place.get_classification() === Classification.galaxy) {
                            zoom = 1404946007758;
                        }
                        else {
                            zoom = 63239.6717 * 100;
                        }

                        // Star or something outside of SS
                        var vect = Coordinates.raDecTo3dAu(place.get_RA(), place.get_dec(), place.get_distance());
                        var ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;
                        vect.rotateX(ecliptic);
                        camTo.viewTarget = Vector3d.negate(camTo.viewTarget);
                    }
                    else {
                        camTo.viewTarget = Planets.getPlanet3dLocationJD(target, SpaceTimeController.getJNowForFutureTime(jumpTime));
                        switch (target) {
                            case 0:
                                zoom = 0.6;
                                break;
                            case 1:
                                zoom = 0.0004;
                                break;
                            case 2:
                                zoom = 0.0004;
                                break;
                            case 3:
                                zoom = 0.0004;
                                break;
                            case 4:
                                zoom = 0.007;
                                break;
                            case 5:
                                zoom = 0.007;
                                break;
                            case 6:
                                zoom = 0.004;
                                break;
                            case 7:
                                zoom = 0.004;
                                break;
                            case 8:
                                zoom = 0.0004;
                                break;
                            case 9:
                                zoom = 0.0004;
                                break;
                            case 10:
                                zoom = 0.0004;
                                break;
                            case 11:
                                zoom = 0.0004;
                                break;
                            case 12:
                                zoom = 0.0004;
                                break;
                            case 13:
                                zoom = 0.0004;
                                break;
                            case 19:
                                zoom = 0.0004;
                                break;
                            case 20:
                                zoom = 10;
                                break;
                            default:
                                break;
                        }
                        zoom = zoom * Settings.get_active().get_solarSystemScale();
                    }
                    var fromParams = this.renderContext.viewCamera.copy();
                    if (this._solarSystemTrack === 20 && !ss.emptyString(this.renderContext.get_trackingFrame())) {
                        fromParams = this.renderContext.customTrackingParams;
                        this.renderContext.set_trackingFrame('');
                    }
                    camTo.zoom = zoom;
                    var toVector = camTo.viewTarget;
                    toVector.subtract(fromParams.viewTarget);
                    if (place.get_classification() === 1) {
                        toVector = Vector3d.negate(toVector);
                    }
                    if (!!toVector.length()) {
                        var raDec = toVector.toRaDec();
                        if (target === 20) {
                            camTo.lat = -raDec.y;
                        }
                        else {
                            camTo.lat = raDec.y;
                        }
                        camTo.lng = raDec.x * 15 - 90;
                    }
                    else {
                        camTo.lat = this.renderContext.viewCamera.lat;
                        camTo.lng = this.renderContext.viewCamera.lng;
                    }
                    if (target !== SolarSystemObjects.custom) {
                        // replace with planet surface
                        camTo.viewTarget = Planets.getPlanetTargetPoint(target, camTo.lat, camTo.lng, SpaceTimeController.getJNowForFutureTime(jumpTime));
                    }
                    var solarMover = new ViewMoverKenBurnsStyle(fromParams, camTo, jumpTime, SpaceTimeController.get_now(), SpaceTimeController.getTimeForFutureTime(jumpTime), 3);
                    solarMover.fastDirectionMove = true;
                    this.set__mover(solarMover);
                    return;
                }
            }
        }
        this._tracking = false;
        this._trackingObject = null;
        var camParams = place.get_camParams().copy();
        if (this.renderContext.get_backgroundImageset() != null && place.get_type() !== this.renderContext.get_backgroundImageset().get_dataSetType()) {
            this.renderContext.targetCamera = place.get_camParams().copy();
            this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
            this.renderContext.set_backgroundImageset(this.getDefaultImageset(place.get_type(), 3));
            instant = true;
        } else if (this.get_solarSystemMode() && place.get_target() !== this._solarSystemTrack) {
            this.renderContext.targetCamera = place.get_camParams().copy();
            this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
            this._solarSystemTrack = place.get_target();
            instant = true;
        }
        if (place.get_classification() === 128) {
            camParams.zoom = this.get_zoomMax();
            this.gotoTargetFull(false, instant, camParams, null, null);
        } else {
            this._solarSystemTrack = place.get_target();
            this.gotoTargetFull(noZoom, instant, camParams, place.get_studyImageset(), place.get_backgroundImageset());
            if (trackObject) {
                this._tracking = true;
                this._trackingObject = place;
            }
        }
    },

    gotoTarget3: function (camParams, noZoom, instant) {
        this._tracking = false;
        this._trackingObject = null;
        this.gotoTargetFull(noZoom, instant, camParams, this.renderContext.get_foregroundImageset(), this.renderContext.get_backgroundImageset());
    },

    _tooCloseForSlewMove: function (cameraParams) {
        return Math.abs(this.renderContext.viewCamera.lat - cameraParams.lat) < 1E-12 && Math.abs(this.renderContext.viewCamera.lng - cameraParams.lng) < 1E-12 && Math.abs(this.renderContext.viewCamera.zoom - cameraParams.zoom) < 1E-12 && Math.abs(this.renderContext.viewCamera.rotation - cameraParams.rotation) < 1E-12;
    },

    gotoTargetFull: function (noZoom, instant, cameraParams, studyImageSet, backgroundImageSet) {
        this._tracking = false;
        this._trackingObject = null;
        this._targetStudyImageset = studyImageSet;
        this._targetBackgroundImageset = backgroundImageSet;
        if (noZoom) {
            cameraParams.zoom = this.renderContext.viewCamera.zoom;
            cameraParams.angle = this.renderContext.viewCamera.angle;
            cameraParams.rotation = this.renderContext.viewCamera.rotation;
        } else {
            if (cameraParams.zoom === -1 || !cameraParams.zoom) {
                if (this.renderContext.space) {
                    cameraParams.zoom = 1.40625;
                }
                else {
                    cameraParams.zoom = 0.09;
                }
            }
        }
        if (instant || this._tooCloseForSlewMove(cameraParams)) {
            this.set__mover(null);
            this.renderContext.targetCamera = cameraParams.copy();
            this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
            if (this.renderContext.space && Settings.get_active().get_galacticMode()) {
                var gPoint = Coordinates.j2000toGalactic(this.renderContext.viewCamera.get_RA() * 15, this.renderContext.viewCamera.get_dec());
                this.renderContext.targetAlt = this.renderContext.alt = gPoint[1];
                this.renderContext.targetAz = this.renderContext.az = gPoint[0];
            }
            else if (this.renderContext.space && Settings.get_active().get_localHorizonMode()) {
                var currentAltAz = Coordinates.equitorialToHorizon(Coordinates.fromRaDec(this.renderContext.viewCamera.get_RA(), this.renderContext.viewCamera.get_dec()), SpaceTimeController.get_location(), SpaceTimeController.get_now());
                this.renderContext.targetAlt = this.renderContext.alt = currentAltAz.get_alt();
                this.renderContext.targetAz = this.renderContext.az = currentAltAz.get_az();
            }
            this._mover_Midpoint();
        } else {
            this.set__mover(ViewMoverSlew.create(this.renderContext.viewCamera, cameraParams));
            this.get__mover().set_midpoint(ss.bind('_mover_Midpoint', this));
        }
    },

    _slewTimeBetweenTargets: function (from, to) {
        var mover = ViewMoverSlew.create(from, to);
        return mover.get_moveTime();
    },

    timeToTargetFull: function (cameraParams, noZoom) {
        if (noZoom) {
            cameraParams.zoom = this.renderContext.viewCamera.zoom;
            cameraParams.angle = this.renderContext.viewCamera.angle;
            cameraParams.rotation = this.renderContext.viewCamera.rotation;
        }
        if (this._tooCloseForSlewMove(cameraParams)) {
            return 0;
        }
        return this._slewTimeBetweenTargets(globalRenderContext.viewCamera, cameraParams);
    },

    _freezeView: function () {
        this.renderContext.viewCamera = this.renderContext.targetCamera.copy();
        this.set__mover(null);
    },

    get__mover: function () {
        return this.renderContext.viewMover;
    },

    set__mover: function (value) {
        this.renderContext.viewMover = value;
        return value;
    },

    fadeInImageSet: function (newImageSet) {
        if (this.renderContext.get_backgroundImageset() != null && newImageSet.get_dataSetType() !== this.renderContext.get_backgroundImageset().get_dataSetType()) {
            TileCache.purgeQueue();
            TileCache.clearCache();
        }
        this.renderContext.set_backgroundImageset(newImageSet);
    },

    _mover_Midpoint: function () {
        if ((this._targetStudyImageset != null && this.renderContext.get_foregroundImageset() == null) || (this.renderContext.get_foregroundImageset() != null && !this.renderContext.get_foregroundImageset().equals(this._targetStudyImageset))) {
            this.renderContext.set_foregroundImageset(this._targetStudyImageset);
        }
        if (this.renderContext.get_backgroundImageset() != null && (this._targetBackgroundImageset != null && !this.renderContext.get_backgroundImageset().equals(this._targetBackgroundImageset))) {
            if (this._targetBackgroundImageset != null && this._targetBackgroundImageset.get_generic()) {
                this.fadeInImageSet(this._getRealImagesetFromGeneric(this._targetBackgroundImageset));
            }
            else {
                this.fadeInImageSet(this._targetBackgroundImageset);
            }
        }
    },

    getDefaultImageset: function (imageSetType, bandPass) {
        var $enum1 = ss.enumerate(WWTControl.imageSets);
        while ($enum1.moveNext()) {
            var imageset = $enum1.current;
            if (imageset.get_defaultSet() && imageset.get_bandPass() === bandPass && imageset.get_dataSetType() === imageSetType) {
                return imageset;
            }
        }
        var $enum2 = ss.enumerate(WWTControl.imageSets);
        while ($enum2.moveNext()) {
            var imageset = $enum2.current;
            if (imageset.get_bandPass() === bandPass && imageset.get_dataSetType() === imageSetType) {
                return imageset;
            }
        }
        var $enum3 = ss.enumerate(WWTControl.imageSets);
        while ($enum3.moveNext()) {
            var imageset = $enum3.current;
            if (imageset.get_dataSetType() === imageSetType) {
                return imageset;
            }
        }
        return WWTControl.imageSets[0];
    },

    _getRealImagesetFromGeneric: function (generic) {
        var $enum1 = ss.enumerate(WWTControl.imageSets);
        while ($enum1.moveNext()) {
            var imageset = $enum1.current;
            if (imageset.get_defaultSet() && imageset.get_bandPass() === generic.get_bandPass() && imageset.get_dataSetType() === generic.get_dataSetType()) {
                return imageset;
            }
        }
        var $enum2 = ss.enumerate(WWTControl.imageSets);
        while ($enum2.moveNext()) {
            var imageset = $enum2.current;
            if (imageset.get_bandPass() === generic.get_bandPass() && imageset.get_dataSetType() === generic.get_dataSetType()) {
                return imageset;
            }
        }
        return WWTControl.imageSets[0];
    },

    _hideUI: function (p) { },

    createTour: function (name) {
        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.stop(false);
        }
        this.tour = new TourDocument();
        this.tour.set_title(name);
        this.setupTour();
        this.tour.set_editMode(true);
        return this.tour;
    },

    setupTour: function () {
        this.tourEdit = new TourEditTab();
        this.tourEdit.set_tour(this.tour);
        this.tour.set_currentTourstopIndex(0);
        this.tour.set_editMode(false);
        this.uiController = this.tourEdit.tourEditorUI;
    },

    loadTour: function (url) {
        var $this = this;

        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.stop(false);
        }
        this.tour = TourDocument.fromUrl(url, function () {
            $this.setupTour();
            var player = new TourPlayer();
            player.set_tour($this.tour);
            globalWWTControl.uiController = player;
            globalScriptInterface._fireTourReady();
        });
    },

    playTour: function (url) {
        var $this = this;

        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.stop(false);
        }
        this.tour = TourDocument.fromUrl(url, function () {
            $this.setupTour();
            $this.tourEdit.playNow(true);  // fromStart
            globalScriptInterface._fireTourReady();
        });
    },

    playCurrentTour: function () {
        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.play();
        }
    },

    pauseCurrentTour: function () {
        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.pauseTour();
        }
    },

    stopCurrentTour: function () {
        if (ss.canCast(this.uiController, TourPlayer)) {
            var player = this.uiController;
            player.stop(false);
        }
    },

    _closeTour: function () { },

    getImagesetByName: function (name) {
        var $enum1 = ss.enumerate(WWTControl.imageSets);
        while ($enum1.moveNext()) {
            var imageset = $enum1.current;
            if (imageset.get_name().toLowerCase().indexOf(name.toLowerCase()) > -1) {
                return imageset;
            }
        }
        return null;
    },

    getImageSetByUrl: function (url) {
        var $enum1 = ss.enumerate(WWTControl.imageSets);
        while ($enum1.moveNext()) {
            var imageset = $enum1.current;
            if (imageset.get_url() === url) {
                return imageset;
            }
        }
        return null;
    },

    setBackgroundImageByName: function (name) {
        var newBackground = this.getImagesetByName(name);
        if (newBackground != null) {
            this.renderContext.set_backgroundImageset(newBackground);
        }
    },

    setForegroundImageByName: function (name) {
        var newForeground = this.getImagesetByName(name);
        if (newForeground != null) {
            this.renderContext.set_foregroundImageset(newForeground);
        }
    },

    addCatalogHips: function (catalogHips) {
        this.renderContext.addCatalogHips(catalogHips, null);
    },

    addCatalogHipsByName: function (name) {
        this.addCatalogHipsByNameWithCallback(name, null);
    },

    addCatalogHipsByNameWithCallback: function (name, onLoad) {
        var catalogHips = this.getImagesetByName(name);
        if (catalogHips != null) {
            this.renderContext.addCatalogHips(catalogHips, onLoad);
        }
    },

    removeCatalogHipsByName: function (name) {
        var catalogHips = this.getImagesetByName(name);
        if (catalogHips != null) {
            this.renderContext.removeCatalogHips(catalogHips);
        }
    },

    getCatalogHipsByName: function (name) {
        return this.renderContext.getCatalogHipsByName(name);
    },

    getCatalogHipsDataInView: function (name, limit, onComplete) {
        var catalogHips = this.getImagesetByName(name);
        if (catalogHips != null) {
            this.renderContext.getCatalogHipsDataInView(catalogHips, limit, onComplete);
        }
    },

    setCutsForFits: function (imagesetName, min, max) {
        var imageset = this.getImagesetByName(imagesetName);
        if (imageset != null && imageset.get_fitsProperties() != null) {
            imageset.get_fitsProperties().lowerCut = min;
            imageset.get_fitsProperties().upperCut = max;
        } else {
            console.log(imagesetName + ' not found');
        }
    },

    setColorMapForFits: function (imagesetName, colorMapName) {
        var imageset = this.getImagesetByName(imagesetName);
        if (imageset != null && imageset.get_fitsProperties() != null) {
            imageset.get_fitsProperties().colorMapName = colorMapName;
        } else {
            console.log(imagesetName + ' not found');
        }
    },

    setScaleTypeForFits: function (imagesetName, scaleType) {
        var imageset = this.getImagesetByName(imagesetName);
        if (imageset != null && imageset.get_fitsProperties() != null) {
            imageset.get_fitsProperties().scaleType = scaleType;
        } else {
            console.log(imagesetName + ' not found');
        }
    },

    _drawCrosshairs: function (context) {
        if (context.gl == null) {
            var ctx = context.device;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = Settings.get_current().get_crosshairsColor();
            ctx.lineWidth = 2;
            var x = context.width / 2, y = context.height / 2;
            var halfLength = 5;
            ctx.moveTo(x, y + halfLength);
            ctx.lineTo(x, y - halfLength);
            ctx.moveTo(x + halfLength, y);
            ctx.lineTo(x - halfLength, y);
            ctx.stroke();
            ctx.restore();
        } else {
            if (this._crossHairs == null) {
                // These coordinates are in clip space where the shape of the
                // viewport is 1x1, so to get the crosshairs to appear square on
                // the screen we have to apply the aspect ratio.
                var halfHeight = 0.03;
                var halfWidth = halfHeight * context.height / context.width;
                this._crossHairs = new SimpleLineList();
                this._crossHairs.set_depthBuffered(false);
                this._crossHairs.pure2D = true;
                this._crossHairs.addLine(Vector3d.create(-halfWidth, 0, 0), Vector3d.create(halfWidth, 0, 0));
                this._crossHairs.addLine(Vector3d.create(0, -halfHeight, 0), Vector3d.create(0, halfHeight, 0));
            }
            this._crossHairs.drawLines(context, 1, Color.load(Settings.get_current().get_crosshairsColor()));
        }
    },

    captureThumbnail: function (blobReady) {
        this.captureFrame(blobReady, 96, 45, 'image/jpeg', true);
    },

    captureCurrentFrame: function (blobReady, width, height, format) {
        this.captureFrame(blobReady, width, height, format, false);
    },

    captureFrameForVideo: function (blobReady, width, height, format) {
        var $this = this;

        var frameNumber = SpaceTimeController.currentFrameNumber;
        var forVideo = function (blob) {
            var containsIndex;
            if (frameNumber === $this._videoQueueIndex) {
                blobReady(blob);
                $this._videoQueueIndex += 1;

                // Keep moving forward until we hit the next index that we're still waiting on
                while ((containsIndex = ss.keyExists($this._videoBlobQueue, $this._videoQueueIndex)) || ($this._emptyFrames.indexOf($this._videoQueueIndex) >= 0)) {
                    if (containsIndex) {
                        blobReady($this._videoBlobQueue[$this._videoQueueIndex]);
                        $this._videoBlobQueue[$this._videoQueueIndex] = null;
                    }
                    else {
                        ss.remove($this._emptyFrames, $this._videoQueueIndex);
                    }
                    $this._videoQueueIndex += 1;
                }
            }
            else {
                if (blob != null) {
                    $this._videoBlobQueue[frameNumber] = blob;
                }
                else {
                    $this._emptyFrames.push(frameNumber);
                }
            }
            if ($this._videoQueueIndex >= SpaceTimeController.totalFrames) {
                $this._videoBlobReady = null;
                $this._videoBlobQueue = null;
                $this._videoQueueIndex = 0;
                $this._emptyFrames.length = 0;
            }
        };
        this.captureCurrentFrame(forVideo, width, height, format);
    },

    captureFrame: function (blobReady, width, height, format, needRender) {
        if (needRender) {
            this.renderOneFrame(); // NB: this used to be Render() but that was almost surely not what we want
        }
        var image = document.createElement('img');
        image.addEventListener('load', function (e) {
            var imageAspect = (image.width) / image.height;
            var clientAspect = width / height;
            var cw = width;
            var ch = height;
            if (imageAspect < clientAspect) {
                ch = ss.truncate((cw / imageAspect));
            }
            else {
                cw = ss.truncate((ch * imageAspect));
            }
            var cx = (width - cw) / 2;
            var cy = (height - ch) / 2;
            var temp = document.createElement('canvas');
            temp.height = height;
            temp.width = width;
            var ctx = temp.getContext('2d');
            ctx.drawImage(image, cx, cy, cw, ch);
            if (typeof temp.msToBlob == 'function') { var blob = temp.msToBlob(); blobReady(blob); } else { temp.toBlob(blobReady, format); }
        }, false);
        image.src = globalWWTControl.canvas.toDataURL();
    },

    clampZooms: function (rc) {
        rc.viewCamera.zoom = DoubleUtilities.clamp(rc.viewCamera.zoom, this.get_zoomMin(), this.get_zoomMax());
        rc.targetCamera.zoom = DoubleUtilities.clamp(rc.targetCamera.zoom, this.get_zoomMin(), this.get_zoomMax());
    }
};

registerType("WWTControl", [WWTControl, WWTControl$, null]);

// wwtlib.WWTControlBuilder

export function WWTControlBuilder(divId) {
    this._divId = null;
    this._startRenderLoop = false;
    this._startLat = 0;
    this._startLng = 0;
    this._startZoom = 360;
    this._freestandingAssetBaseurl = '';
    this._startMode = '';
    this._divId = divId;
}

var WWTControlBuilder$ = {
    startRenderLoop: function (value) {
        this._startRenderLoop = value;
    },

    initialView: function (lat, lng, zoom) {
        this._startLat = lat;
        this._startLng = lng;
        this._startZoom = zoom;
    },

    freestandingMode: function (asset_baseurl) {
        this._freestandingAssetBaseurl = asset_baseurl;
    },

    initialMode: function (value) {
        this._startMode = value;
    },

    create: function () {
        var freestandingMode = !!this._freestandingAssetBaseurl;
        var trueStartMode;
        if (!!this._startMode) {
            trueStartMode = this._startMode;
        } else if (freestandingMode) {
            trueStartMode = 'black';
        } else {
            trueStartMode = 'sky';
        }
        set_freestandingMode(freestandingMode);
        if (freestandingMode) {
            URLHelpers.singleton.overrideAssetBaseurl(this._freestandingAssetBaseurl);
        }
        return WWTControl.initControl6(this._divId, this._startRenderLoop, this._startLat, this._startLng, this._startZoom, trueStartMode);
    }
};

registerType("WWTControlBuilder", [WWTControlBuilder, WWTControlBuilder$, null]);

// wwtlib.WWTElementEvent

export function WWTElementEvent(x, y) {
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetX = x;
    this.offsetY = y;
}

var WWTElementEvent$ = {};

registerType("WWTElementEvent", [WWTElementEvent, WWTElementEvent$, null]);
