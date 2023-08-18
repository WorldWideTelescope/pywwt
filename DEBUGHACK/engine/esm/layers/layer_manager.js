// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Managing the tree of renderer layers.

import { ss } from "../ss.js";
import { registerType, registerEnum, Enums } from "../typesystem.js";
import {
    freestandingMode,
    globalScriptInterface,
    globalWWTControl,
    set_layerManagerGetAllMaps,
    set_setManagerVisibleLayerList,
} from "../data_globals.js";
import { globalRenderContext } from "../render_globals.js";
import { Vector2d, Vector3d, Matrix3d } from "../double3d.js";
import { ELL } from "../astrocalc/elliptical.js";
import { Histogram } from "../utilities/histogram.js";
import { SimpleInput } from "../utilities/simple_input.js";
import { ColorPicker } from "../utilities/color_picker.js";
import { ContextMenuStrip, ToolStripMenuItem, ToolStripSeparator } from "../utilities/context_menu_strip.js";
import { Color } from "../color.js";
import { FitsImage } from "./fits_image.js";
import { ProjectionType } from "../imageset.js";
import { Planets } from "../planets.js";
import { Settings } from "../settings.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { URLHelpers } from "../url_helpers.js";
import { Cursor, Language } from "../util.js";
import { WebFile } from "../web_file.js";
import { Layer } from "./layer.js";
import { ReferenceFrame } from "./reference_frame.js";
import { GreatCirlceRouteLayer } from "./great_circle_route_layer.js";
import { GridLayer } from "./grid_layer.js";
import { ImageSetLayer } from "./imageset_layer.js";
import { ISSLayer } from "./iss_layer.js";
import { Orbit } from "./orbit.js";
import { OrbitLayer } from "./orbit_layer.js";
import { SpreadSheetLayer, PushPin } from "./spreadsheet_layer.js";
import { VoTableLayer } from "./vo_table_layer.js";
import { LayerInfo } from "../tours/tour_stop.js";
import { TourPlayer } from "../tours/tour_player.js";


// wwtlib.ReferenceFrames

export var ReferenceFrames = {
    sky: 0,
    ecliptic: 1,
    galactic: 2,
    sun: 3,
    mercury: 4,
    venus: 5,
    earth: 6,
    mars: 7,
    jupiter: 8,
    saturn: 9,
    uranus: 10,
    neptune: 11,
    pluto: 12,
    moon: 13,
    io: 14,
    europa: 15,
    ganymede: 16,
    callisto: 17,
    custom: 18,
    identity: 19,
    sandbox: 20
};

registerType("ReferenceFrames", ReferenceFrames);
registerEnum("ReferenceFrames", ReferenceFrames);


// wwtlib.LayerManager

export function LayerManager() { }

LayerManager._version = 0;
LayerManager._tourLayers = false;
LayerManager._layerMaps = {};
LayerManager._layerMapsTours = {};
LayerManager._allMaps = {};
LayerManager._allMapsTours = {};
LayerManager._currentMap = 'Earth';
LayerManager._layerList = {};
LayerManager._layerListTours = {};
LayerManager._moonfile = '';
LayerManager._selectedLayer = null;
LayerManager._lastMenuClick = new Vector2d();

LayerManager.get_version = function () {
    return LayerManager._version;
};

LayerManager.set_version = function (value) {
    LayerManager._version = value;
    return value;
};

LayerManager.get_frameWizardDialog = function () {
    return LayerManager._frameWizardDialog;
};

LayerManager.get_dataVizWizardDialog = function () {
    return LayerManager._dataVizWizardDialog;
};

LayerManager.get_referenceFramePropsDialog = function () {
    return LayerManager._referenceFramePropsDialog;
};

LayerManager.get_greatCircleDlg = function () {
    return LayerManager._greatCircleDialog;
};

LayerManager.get_tourLayers = function () {
    return LayerManager._tourLayers;
};

LayerManager.set_tourLayers = function (value) {
    if (LayerManager._tourLayers !== value && !value) {
        LayerManager._clearLayers();
        LayerManager._tourLayers = value;
        LayerManager.loadTree();
    }
    else if (LayerManager._tourLayers !== value && !!value) {
        LayerManager._tourLayers = value;
        LayerManager.initLayers();
    }
    return value;
};

LayerManager.loadTree = function () {
    if (globalScriptInterface != null) {
        globalScriptInterface.refreshLayerManagerNow();
    }
};

LayerManager.get_layerMaps = function () {
    if (LayerManager.get_tourLayers()) {
        return LayerManager._layerMapsTours;
    }
    else {
        return LayerManager._layerMaps;
    }
};

LayerManager.set_layerMaps = function (value) {
    if (LayerManager.get_tourLayers()) {
        LayerManager._layerMapsTours = value;
    }
    else {
        LayerManager._layerMaps = value;
    }
    return value;
};

LayerManager.get_allMaps = function () {
    if (LayerManager.get_tourLayers()) {
        return LayerManager._allMapsTours;
    }
    else {
        return LayerManager._allMaps;
    }
};

set_layerManagerGetAllMaps(LayerManager.get_allMaps);

LayerManager.set_allMaps = function (value) {
    if (LayerManager.get_tourLayers()) {
        LayerManager._allMapsTours = value;
    }
    else {
        LayerManager._allMaps = value;
    }
    return value;
};

LayerManager.get_currentMap = function () {
    return LayerManager._currentMap;
};

LayerManager.set_currentMap = function (value) {
    LayerManager._currentMap = value;
    return value;
};

LayerManager.get_layerList = function () {
    if (LayerManager.get_tourLayers()) {
        return LayerManager._layerListTours;
    }
    else {
        return LayerManager._layerList;
    }
};

LayerManager.set_layerList = function (value) {
    if (LayerManager.get_tourLayers()) {
        LayerManager._layerListTours = value;
    }
    else {
        LayerManager._layerList = value;
    }
    return value;
};

// This function *can* be called multiple times safely, but it only
// needs to be called once upon app startup. The `InitLayers` function
// can be called more than once, if/when the `TourLayers` setting is
// toggled.
LayerManager.oneTimeInitialization = function () {
    if (LayerManager._webFileMoons == null) {
        LayerManager.getMoonFile(URLHelpers.singleton.engineAssetUrl('moons.txt'));
    }
    PushPin.triggerLoadSprite();
};

LayerManager.initLayers = function () {
    LayerManager._clearLayers();
    var iss = null;
    var doISS = !LayerManager.get_tourLayers() && !freestandingMode;
    if (doISS) {
        iss = new LayerMap('ISS', 18);
        iss.frame.epoch = SpaceTimeController._twoLineDateToJulian('10184.51609218');
        iss.frame.semiMajorAxis = 6728829.41;
        iss.frame.referenceFrameType = 1;
        iss.frame.inclination = 51.6442;
        iss.frame.longitudeOfAscendingNode = 147.0262;
        iss.frame.eccentricity = 0.0009909;
        iss.frame.meanAnomolyAtEpoch = 325.5563;
        iss.frame.meanDailyMotion = 360 * 15.72172655;
        iss.frame.argumentOfPeriapsis = 286.4623;
        iss.frame.scale = 1;
        iss.frame.semiMajorAxisUnits = 1;
        iss.frame.meanRadius = 130;
        iss.frame.oblateness = 0;
        iss.frame.showOrbitPath = true;
        var isstle = new Array(0);

        //This is downloaded now on startup
        var url = URLHelpers.singleton.coreDynamicUrl('wwtweb/isstle.aspx');
        var webFile;
        webFile = new WebFile(url);
        webFile.onStateChange = function () {
            if (webFile.get_state() === 1) {
                var data = webFile.getText();
                isstle = data.split('\n');
                if (isstle.length > 1) {
                    iss.frame.fromTLE(isstle[0], isstle[1], 398600441800000);
                }
            }
        };
        webFile.send();
        iss.enabled = true;
    }
    LayerManager.get_layerMaps()['Sun'] = new LayerMap('Sun', 3);
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Mercury', 4));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Venus', 5));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Earth', 6));
    LayerManager.get_layerMaps()['Sun'].childMaps['Earth'].addChild(new LayerMap('Moon', 13));
    if (doISS) {
        LayerManager.get_layerMaps()['Sun'].childMaps['Earth'].addChild(iss);
    }
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Mars', 7));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Jupiter', 8));
    LayerManager.get_layerMaps()['Sun'].childMaps['Jupiter'].addChild(new LayerMap('Io', 14));
    LayerManager.get_layerMaps()['Sun'].childMaps['Jupiter'].addChild(new LayerMap('Europa', 15));
    LayerManager.get_layerMaps()['Sun'].childMaps['Jupiter'].addChild(new LayerMap('Ganymede', 16));
    LayerManager.get_layerMaps()['Sun'].childMaps['Jupiter'].addChild(new LayerMap('Callisto', 17));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Saturn', 9));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Uranus', 10));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Neptune', 11));
    LayerManager.get_layerMaps()['Sun'].addChild(new LayerMap('Pluto', 12));
    LayerManager._addMoons(LayerManager._moonfile);
    LayerManager.get_layerMaps()['Sky'] = new LayerMap('Sky', 0);
    LayerManager.get_layerMaps()['Sun'].open = true;
    LayerManager._allMaps = {};
    LayerManager._addAllMaps(LayerManager.get_layerMaps(), null);
    if (doISS) {
        LayerManager._addIss();
    }
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._addIss = function () {
    var layer = new ISSLayer();
    layer.set_name(Language.getLocalizedText(1314, 'ISS Model  (Toshiyuki Takahei)'));
    layer.enabled = Settings.get_active().get_showISSModel();
    LayerManager.get_layerList()[layer.id] = layer;
    layer.set_referenceFrame('ISS');
    LayerManager.get_allMaps()['ISS'].layers.push(layer);
    LayerManager.get_allMaps()['ISS'].open = true;
};

LayerManager._addAllMaps = function (maps, parent) {
    var $enum1 = ss.enumerate(ss.keys(maps));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var map = maps[key];
        map.frame.parent = parent;
        LayerManager.get_allMaps()[map.get_name()] = map;
        LayerManager._addAllMaps(map.childMaps, map.get_name());
    }
};

LayerManager._clearLayers = function () {
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_layerList()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var layer = LayerManager.get_layerList()[key];
        layer.cleanUp();
    }
    ss.clearKeys(LayerManager.get_layerList());
    ss.clearKeys(LayerManager.get_layerMaps());
};

LayerManager.getMoonFile = function (url) {
    LayerManager._webFileMoons = new WebFile(url);
    LayerManager._webFileMoons.onStateChange = LayerManager.moonFileStateChange;
    LayerManager._webFileMoons.send();
};

LayerManager.moonFileStateChange = function () {
    if (LayerManager._webFileMoons.get_state() === 2) {
        alert(LayerManager._webFileMoons.get_message());
    }
    else if (LayerManager._webFileMoons.get_state() === 1) {
        LayerManager._moonfile = LayerManager._webFileMoons.getText();
        LayerManager.initLayers();
    }
};

LayerManager._addMoons = function (file) {
    var data = file.split('\r\n');
    var first = true;
    var $enum1 = ss.enumerate(data);
    while ($enum1.moveNext()) {
        var line = $enum1.current;
        if (first) {
            first = false;
            continue;
        }
        var parts = line.split('\t');
        if (parts.length > 16) {
            var planet = parts[0];
            var frame = new LayerMap(parts[2], 18);
            frame.frame._systemGenerated = true;
            frame.frame.epoch = parseFloat(parts[1]);
            frame.frame.semiMajorAxis = parseFloat(parts[3]) * 1000;
            frame.frame.referenceFrameType = 1;
            frame.frame.inclination = parseFloat(parts[7]);
            frame.frame.longitudeOfAscendingNode = parseFloat(parts[8]);
            frame.frame.eccentricity = parseFloat(parts[4]);
            frame.frame.meanAnomolyAtEpoch = parseFloat(parts[6]);
            frame.frame.meanDailyMotion = parseFloat(parts[9]);
            frame.frame.argumentOfPeriapsis = parseFloat(parts[5]);
            frame.frame.scale = 1;
            frame.frame.semiMajorAxisUnits = 1;
            frame.frame.meanRadius = parseFloat(parts[16]) * 1000;
            frame.frame.rotationalPeriod = parseFloat(parts[17]);
            frame.frame.showAsPoint = false;
            frame.frame.showOrbitPath = true;
            frame.frame.set_representativeColor(Color.fromArgb(255, 175, 216, 230));
            frame.frame.oblateness = 0;
            LayerManager.get_layerMaps()['Sun'].childMaps[planet].addChild(frame);
        }
    }
};

LayerManager.addVoTableLayer = function (table, title) {
    return LayerManager.addVoTableLayerWithPlotType(table, title, 2);
};

LayerManager.addVoTableLayerWithPlotType = function (table, title, plotType) {
    var layer = VoTableLayer.create(table, plotType);
    layer.set_name(title);
    layer.set_astronomical(true);
    layer.set_referenceFrame('Sky');
    LayerManager.get_layerList()[layer.id] = layer;
    LayerManager.get_allMaps()['Sky'].layers.push(layer);
    LayerManager.get_allMaps()['Sky'].open = true;
    layer.enabled = true;
    LayerManager._version++;
    LayerManager.loadTree();
    return layer;
};

LayerManager.addImageSetLayer = function (imageset, title) {
    var layer = ImageSetLayer.create(imageset);
    return LayerManager.addFitsImageSetLayer(layer, title);
};

LayerManager.addImageSetLayerCallback = function (imageset, title, callback) {
    var layer = ImageSetLayer.create(imageset);

    // The tile rendering codepaths require that "Extension" is exactly
    // .fits -- multiple extensions are not currently supported.
    var isNonHipsTiledFits =
        imageset.get_extension() === '.fits' &&
        layer.getFitsImage() == null &&
        imageset.get_projection() !== ProjectionType.healpix;

    // The goal here is to fire the callback once the initial imageset
    // data have loaded. In particular, for FITS-type imagesets, we
    // inevitably need to download some data in order to figure out
    // parameters like FitsProperties.LowerCut.
    //
    // At the moment, this is only wired up correctly for non-HiPS tiled
    // FITS. In a pretty egregious hack, the OnMainImageLoaded callback
    // below will be fired once the level-0 FITS tile is loaded. We
    // basically needed to add this new callback hook because there
    // wasn't any other way to get something to fire when the level-0
    // tile data actually arrive.
    //
    // HiPS FITS datasets will *eventually* get the right FitsProperties
    // because the fetch of the HipsProperties data sets this up. (This
    // is triggered by the HipsProperties constructor, used in
    // Imageset.GetNewTile.) But the timing of the callback here is
    // uncorrelated with that process. The same is broadly true for
    // untiled FITS. This function should be improved to make sure that
    // the callback argument gets fired at the right time for such
    // datasets.

    if (isNonHipsTiledFits) {
        imageset.get_fitsProperties().onMainImageLoaded = function (image) {
            image.applyDisplaySettings();
            if (callback != null) {
                callback(layer);
            }
        };
    }
    LayerManager.addFitsImageSetLayer(layer, title);

    // For everything not yet handled, just trigger the callback now, if
    // needed.
    if (callback != null && (!isNonHipsTiledFits || imageset.get_fitsProperties().mainImageLoadedEventHasFired)) {
        callback(layer);
    }

    return layer;
};

// This method is somewhat misnamed - there's nothing FITS-specific about it.
LayerManager.addFitsImageSetLayer = function (layer, title) {
    layer.doneLoading(null);
    layer.set_name(title);
    layer.set_astronomical(true);
    layer.set_referenceFrame('Sky');
    LayerManager.get_layerList()[layer.id] = layer;
    LayerManager.get_allMaps()['Sky'].layers.push(layer);
    LayerManager.get_allMaps()['Sky'].open = true;
    layer.enabled = true;
    LayerManager._version++;
    LayerManager.loadTree();
    return layer;
};

LayerManager.getNextFitsName = function () {
    return LayerManager._getNextName('Fits Image');
};

LayerManager.getNextImageSetName = function () {
    return LayerManager._getNextName('Image Set');
};

LayerManager._getNextName = function (type) {
    var currentNumber = 0;
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_allMaps()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var $enum2 = ss.enumerate(LayerManager.get_allMaps()[key].layers);
        while ($enum2.moveNext()) {
            var layer = $enum2.current;
            if (ss.startsWith(layer.get_name(), type + ' ')) {
                var number = ss.replaceString(layer.get_name(), type + ' ', '');
                try {
                    var num = parseInt(number);
                    if (num > currentNumber) {
                        currentNumber = num;
                    }
                }
                catch ($e3) {
                }
            }
        }
    }
    return ss.format('{0} {1}', type, currentNumber + 1);
};

LayerManager._closeAllTourLoadedLayers = function () {
    var purgeTargets = [];
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_layerList()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var layer = LayerManager.get_layerList()[key];
        if (layer.loadedFromTour) {
            purgeTargets.push(layer.id);
        }
    }
    var $enum2 = ss.enumerate(purgeTargets);
    while ($enum2.moveNext()) {
        var guid = $enum2.current;
        LayerManager.deleteLayerByID(guid, true, false);
    }
    var purgeMapsNames = [];
    var $enum3 = ss.enumerate(ss.keys(LayerManager.get_allMaps()));
    while ($enum3.moveNext()) {
        var key = $enum3.current;
        var map = LayerManager.get_allMaps()[key];
        if (map.loadedFromTour && !map.layers.length) {
            purgeMapsNames.push(map.get_name());
        }
    }
    var $enum4 = ss.enumerate(purgeMapsNames);
    while ($enum4.moveNext()) {
        var name = $enum4.current;
        LayerManager.purgeLayerMapDeep(LayerManager.get_allMaps()[name], true);
    }
    LayerManager.set_version(LayerManager.get_version() + 1) - 1;
    LayerManager.loadTree();
};

LayerManager.purgeLayerMapDeep = function (target, topLevel) {
    var $enum1 = ss.enumerate(target.layers);
    while ($enum1.moveNext()) {
        var layer = $enum1.current;
        LayerManager.deleteLayerByID(layer.id, false, false);
    }
    target.layers.length = 0;
    var $enum2 = ss.enumerate(ss.keys(target.childMaps));
    while ($enum2.moveNext()) {
        var key = $enum2.current;
        var map = target.childMaps[key];
        LayerManager.purgeLayerMapDeep(map, false);
    }
    ss.clearKeys(target.childMaps);
    if (topLevel) {
        if (!ss.emptyString(target.frame.parent)) {
            if (ss.keyExists(LayerManager.get_allMaps(), target.frame.parent)) {
                delete LayerManager.get_allMaps()[target.frame.parent].childMaps[target.get_name()];
            }
        } else {
            if (ss.keyExists(LayerManager.get_layerMaps(), target.get_name())) {
                delete LayerManager.get_layerMaps()[target.get_name()];
            }
        }
    }
    delete LayerManager.get_allMaps()[target.get_name()];
    LayerManager._version++;
};

LayerManager._cleanAllTourLoadedLayers = function () {
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_layerList()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var layer = LayerManager.get_layerList()[key];
        if (layer.loadedFromTour) {
            layer.loadedFromTour = false;
        }
    }
};

// Merge layers from Tour Player Alternate universe into the real layer manager layers list
LayerManager.mergeToursLayers = function () {
    LayerManager._tourLayers = false;
    var OverWrite = false;
    var CollisionChecked = false;
    var $enum1 = ss.enumerate(ss.keys(LayerManager._allMapsTours));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var map = LayerManager._allMapsTours[key];
        if (!ss.keyExists(LayerManager._allMaps, map.get_name())) {
            var newMap = new LayerMap(map.get_name(), 18);
            newMap.frame = map.frame;
            newMap.loadedFromTour = true;
            LayerManager.get_allMaps()[newMap.get_name()] = newMap;
        }
    }
    LayerManager.connectAllChildren();
    var $enum2 = ss.enumerate(ss.keys(LayerManager._layerListTours));
    while ($enum2.moveNext()) {
        var key = $enum2.current;
        var layer = LayerManager._layerListTours[key];
        if (ss.keyExists(LayerManager.get_layerList(), layer.id)) {
            if (!CollisionChecked) {
                OverWrite = true;
                CollisionChecked = true;
            }
            if (OverWrite) {
                LayerManager.deleteLayerByID(layer.id, true, false);
            }
        }
        if (!ss.keyExists(LayerManager.get_layerList(), layer.id)) {
            if (ss.keyExists(LayerManager.get_allMaps(), layer.get_referenceFrame())) {
                LayerManager.get_layerList()[layer.id] = layer;
                LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.push(layer);
            }
        } else {
            layer.cleanUp();
        }
    }
    ss.clearKeys(LayerManager._layerListTours);
    ss.clearKeys(LayerManager._allMapsTours);
    ss.clearKeys(LayerManager._layerMapsTours);
    LayerManager.loadTree();
};

LayerManager.connectAllChildren = function () {
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_allMaps()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var map = LayerManager.get_allMaps()[key];
        if (ss.emptyString(map.frame.parent) && !ss.keyExists(LayerManager.get_layerMaps(), map.frame.name)) {
            LayerManager.get_layerMaps()[map.get_name()] = map;
        } else if (!ss.emptyString(map.frame.parent) && ss.keyExists(LayerManager.get_allMaps(), map.frame.parent)) {
            if (!ss.keyExists(LayerManager.get_allMaps()[map.frame.parent].childMaps, map.frame.name)) {
                LayerManager.get_allMaps()[map.frame.parent].childMaps[map.frame.name] = map;
                map.parent = LayerManager.get_allMaps()[map.frame.parent];
            }
        }
    }
};

LayerManager.deleteLayerByID = function (ID, removeFromParent, updateTree) {
    if (ss.keyExists(LayerManager.get_layerList(), ID)) {
        var layer = LayerManager.get_layerList()[ID];
        layer.cleanUp();
        if (removeFromParent) {
            ss.remove(LayerManager.get_allMaps()[layer.get_referenceFrame()].layers, layer);
        }
        delete LayerManager.get_layerList()[ID];
        LayerManager._version++;
        if (updateTree) {
            LayerManager.loadTree();
        }
        return true;
    }
    else {
        return false;
    }
};

LayerManager._getFrameTarget = function (renderContext, TrackingFrame) {
    var target = new FrameTarget();
    var targetPoint = Vector3d.get_empty();
    target.target = Vector3d.get_empty();
    target.matrix = Matrix3d.get_identity();
    if (!ss.keyExists(LayerManager.get_allMaps(), TrackingFrame)) {
        return target;
    }
    var mapList = [];
    var current = LayerManager.get_allMaps()[TrackingFrame];
    mapList.push(current);
    while (current.frame.reference === 18) {
        current = current.parent;
        mapList.splice(0, 0, current);
    }
    var matOld = renderContext.get_world().clone();
    var matOldNonRotating = renderContext.get_worldBaseNonRotating();
    var matOldBase = renderContext.get_worldBase();
    var oldNominalRadius = renderContext.get_nominalRadius();
    var $enum1 = ss.enumerate(mapList);
    while ($enum1.moveNext()) {
        var map = $enum1.current;
        if (map.frame.reference !== 18 && map.frame.reference !== 20) {
            Planets.setupPlanetMatrix(renderContext, Enums.parse('SolarSystemObjects', map.frame.name), Vector3d.get_empty(), false);
        } else {
            map.computeFrame(renderContext);
            if (map.frame.useRotatingParentFrame()) {
                renderContext.set_world(Matrix3d.multiplyMatrix(map.frame.worldMatrix, renderContext.get_world()));
            }
            else {
                renderContext.set_world(Matrix3d.multiplyMatrix(map.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
            }
            if (map.frame.referenceFrameType === 3) {
                renderContext.set_worldBaseNonRotating(renderContext.get_world().clone());
            }
            renderContext.set_nominalRadius(map.frame.meanRadius);
        }
    }
    targetPoint = renderContext.get_world().transform(targetPoint);
    var lookAt = renderContext.get_world().transform(Vector3d.create(0, 0, 1));
    var lookUp = Vector3d.subtractVectors(renderContext.get_world().transform(Vector3d.create(0, 1, 0)), targetPoint);
    lookUp.normalize();
    target.matrix = Matrix3d.lookAtLH(new Vector3d(), Vector3d.subtractVectors(lookAt, targetPoint), lookUp);
    renderContext.set_nominalRadius(oldNominalRadius);
    renderContext.set_world(matOld);
    renderContext.set_worldBaseNonRotating(matOldNonRotating);
    renderContext.set_worldBase(matOldBase);
    target.target = targetPoint;
    return target;
};

LayerManager._prepTourLayers = function () {
    if (TourPlayer.get_playing()) {
        var player = globalWWTControl.uiController;
        if (player != null) {
            var tour = player.get_tour();
            if (tour.get_currentTourStop() != null) {
                player.updateTweenPosition(-1);
                if (!tour.get_currentTourStop().get_keyFramed()) {
                    tour.get_currentTourStop()._updateLayerOpacity();
                    var $enum1 = ss.enumerate(ss.keys(tour.get_currentTourStop().layers));
                    while ($enum1.moveNext()) {
                        var key = $enum1.current;
                        var info = tour.get_currentTourStop().layers[key];
                        if (ss.keyExists(LayerManager.get_layerList(), info.id)) {
                            LayerManager.get_layerList()[info.id].set_opacity(info.frameOpacity);
                            LayerManager.get_layerList()[info.id].setParams(info.frameParams);
                        }
                    }
                }
            }
        }
    }
};

LayerManager._draw = function (renderContext, opacity, astronomical, referenceFrame, nested, cosmos) {
    if (!ss.keyExists(LayerManager.get_allMaps(), referenceFrame)) {
        return;
    }
    var thisMap = LayerManager.get_allMaps()[referenceFrame];
    if (!thisMap.enabled || (!ss.keyCount(thisMap.childMaps) && !thisMap.layers.length && !(thisMap.frame.showAsPoint || thisMap.frame.showOrbitPath))) {
        return;
    }
    if (TourPlayer.get_playing()) {
        var player = globalWWTControl.uiController;
        if (player != null) {
            var tour = player.get_tour();
            if (tour.get_currentTourStop() != null) {
                player.updateTweenPosition(-1);
                tour.get_currentTourStop()._updateLayerOpacity();
                var $enum1 = ss.enumerate(ss.keys(tour.get_currentTourStop().layers));
                while ($enum1.moveNext()) {
                    var key = $enum1.current;
                    var info = tour.get_currentTourStop().layers[key];
                    if (ss.keyExists(LayerManager.get_layerList(), info.id)) {
                        LayerManager.get_layerList()[info.id].set_opacity(info.frameOpacity);
                        LayerManager.get_layerList()[info.id].setParams(info.frameParams);
                    }
                }
            }
        }
    }
    var matOld = renderContext.get_world();
    var matOldNonRotating = renderContext.get_worldBaseNonRotating();
    var oldNominalRadius = renderContext.get_nominalRadius();
    if ((thisMap.frame.reference === 18 | thisMap.frame.reference === 18) === 1) {
        thisMap.computeFrame(renderContext);
        if (thisMap.frame.referenceFrameType !== 1 && thisMap.frame.referenceFrameType !== 2) {
            renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_world()));
        } else {
            renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
        }
        renderContext.set_nominalRadius(thisMap.frame.meanRadius);
    }
    if (thisMap.frame.showAsPoint) {
        // todo Draw point planet...
        // Planets.DrawPointPlanet(renderContext.Device, new Vector3d(0, 0, 0), (float).2, thisMap.Frame.RepresentativeColor, true);
    }
    for (var pass = 0; pass < 2; pass++) {
        var $enum2 = ss.enumerate(LayerManager.get_allMaps()[referenceFrame].layers);
        while ($enum2.moveNext()) {
            var layer = $enum2.current;
            if ((!pass && ss.canCast(layer, ImageSetLayer)) || (pass === 1 && !(ss.canCast(layer, ImageSetLayer)))) {
                var skipLayer = false;
                if (!pass) {
                    // Skip default image set layer so that it's not drawn twice
                    skipLayer = !astronomical && (layer).get_overrideDefaultLayer();
                }
                if (layer.enabled && !skipLayer) {
                    var layerStart = SpaceTimeController.utcToJulian(layer.get_startTime());
                    var layerEnd = SpaceTimeController.utcToJulian(layer.get_endTime());
                    var fadeIn = SpaceTimeController.utcToJulian(layer.get_startTime()) - ((layer.get_fadeType() === 1 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
                    var fadeOut = SpaceTimeController.utcToJulian(layer.get_endTime()) + ((layer.get_fadeType() === 2 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
                    if (SpaceTimeController.get_jNow() > fadeIn && SpaceTimeController.get_jNow() < fadeOut) {
                        var fadeOpacity = 1;
                        if (SpaceTimeController.get_jNow() < layerStart) {
                            fadeOpacity = ((SpaceTimeController.get_jNow() - fadeIn) / (layer.get_fadeSpan() / 864000000));
                        }
                        if (SpaceTimeController.get_jNow() > layerEnd) {
                            fadeOpacity = ((fadeOut - SpaceTimeController.get_jNow()) / (layer.get_fadeSpan() / 864000000));
                        }
                        layer.set_astronomical(astronomical);
                        if (ss.canCast(layer, SpreadSheetLayer)) {
                            var tsl = ss.safeCast(layer, SpreadSheetLayer);
                            tsl.draw(renderContext, opacity * fadeOpacity, cosmos);
                        }
                        else {
                            layer.draw(renderContext, opacity * fadeOpacity, cosmos);
                        }
                    }
                }
            }
        }
    }
    if (nested) {
        var $enum3 = ss.enumerate(ss.keys(LayerManager.get_allMaps()[referenceFrame].childMaps));
        while ($enum3.moveNext()) {
            var key = $enum3.current;
            var map = LayerManager.get_allMaps()[referenceFrame].childMaps[key];
            if (!(ss.canCast(map, LayerMap))) {
                continue;
            }
            if (map.enabled && map.frame.showOrbitPath && Settings.get_active().get_solarSystemOrbits() && Settings.get_active().get_solarSystemMinorOrbits()) {
                if (map.frame.referenceFrameType === 1) {
                    if (map.frame.get_orbit() == null) {
                        map.frame.set_orbit(new Orbit(map.frame.get_elements(), 360, map.frame.get_representativeColor(), 1, map.parent.frame.meanRadius));
                    }
                    var matSaved = renderContext.get_world();
                    renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
                    map.frame.get_orbit().draw3D(renderContext, 1 * 0.5, Vector3d.create(0, 0, 0));
                    renderContext.set_world(matSaved);
                }
                else if (map.frame.referenceFrameType === 2) {
                }
            }
            if ((map.frame.reference === 18 || map.frame.reference === 19)) {
                LayerManager._draw(renderContext, opacity, astronomical, map.get_name(), nested, cosmos);
            }
        }
    }
    renderContext.set_nominalRadius(oldNominalRadius);
    renderContext.set_world(matOld);
    renderContext.set_worldBaseNonRotating(matOldNonRotating);
};

LayerManager._getVisibleLayerList = function (previous) {
    var list = {};
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_layerList()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var layer = LayerManager.get_layerList()[key];
        if (layer.enabled) {
            var info = new LayerInfo();
            info.startOpacity = info.endOpacity = layer.get_opacity();
            info.id = layer.id;
            info.startParams = layer.getParams();
            if (ss.keyExists(previous, info.id)) {
                info.endOpacity = previous[info.id].endOpacity;
                info.endParams = previous[info.id].endParams;
            }
            else {
                info.endParams = layer.getParams();
            }
            list[layer.id] = info;
        }
    }
    return list;
};

LayerManager.setVisibleLayerList = function (list) {
    var $enum1 = ss.enumerate(ss.keys(LayerManager.get_layerList()));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var layer = LayerManager.get_layerList()[key];
        layer.enabled = ss.keyExists(list, layer.id);
        try {
            if (layer.enabled) {
                layer.set_opacity(list[layer.id].frameOpacity);
                layer.setParams(list[layer.id].frameParams);
            }
        }
        catch ($e2) {
        }
    }
};

set_setManagerVisibleLayerList(LayerManager.setVisibleLayerList);

LayerManager._preDraw = function (renderContext, opacity, astronomical, referenceFrame, nested) {
    if (!ss.keyExists(LayerManager.get_allMaps(), referenceFrame)) {
        return;
    }
    var thisMap = LayerManager.get_allMaps()[referenceFrame];
    if (!ss.keyCount(thisMap.childMaps) && !thisMap.layers.length) {
        return;
    }
    if (TourPlayer.get_playing()) {
        var player = ss.safeCast(globalWWTControl.uiController, TourPlayer);
        if (player != null) {
            var tour = player.get_tour();
            if (tour.get_currentTourStop() != null) {
                player.updateTweenPosition(-1);
                tour.get_currentTourStop()._updateLayerOpacity();
                var $enum1 = ss.enumerate(ss.keys(tour.get_currentTourStop().layers));
                while ($enum1.moveNext()) {
                    var key = $enum1.current;
                    var info = tour.get_currentTourStop().layers[key];
                    if (ss.keyExists(LayerManager.get_layerList(), info.id)) {
                        LayerManager.get_layerList()[info.id].set_opacity(info.frameOpacity);
                        LayerManager.get_layerList()[info.id].setParams(info.frameParams);
                    }
                }
            }
        }
    }
    var matOld = renderContext.get_world();
    var matOldNonRotating = renderContext.get_worldBaseNonRotating();
    var oldNominalRadius = renderContext.get_nominalRadius();
    if (thisMap.frame.reference === 18) {
        thisMap.computeFrame(renderContext);
        if (thisMap.frame.referenceFrameType !== 1) {
            renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_world()));
        } else {
            renderContext.set_world(Matrix3d.multiplyMatrix(thisMap.frame.worldMatrix, renderContext.get_worldBaseNonRotating()));
        }
        renderContext.set_nominalRadius(thisMap.frame.meanRadius);
    }
    for (var pass = 0; pass < 2; pass++) {
        var $enum2 = ss.enumerate(LayerManager.get_allMaps()[referenceFrame].layers);
        while ($enum2.moveNext()) {
            var layer = $enum2.current;
            if ((!pass && ss.canCast(layer, ImageSetLayer)) || (pass === 1 && !(ss.canCast(layer, ImageSetLayer)))) {
                if (layer.enabled) {
                    var layerStart = SpaceTimeController.utcToJulian(layer.get_startTime());
                    var layerEnd = SpaceTimeController.utcToJulian(layer.get_endTime());
                    var fadeIn = SpaceTimeController.utcToJulian(layer.get_startTime()) - ((layer.get_fadeType() === 1 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
                    var fadeOut = SpaceTimeController.utcToJulian(layer.get_endTime()) + ((layer.get_fadeType() === 2 || layer.get_fadeType() === 3) ? (layer.get_fadeSpan() / 864000000) : 0);
                    if (SpaceTimeController.get_jNow() > fadeIn && SpaceTimeController.get_jNow() < fadeOut) {
                        var fadeOpacity = 1;
                        if (SpaceTimeController.get_jNow() < layerStart) {
                            fadeOpacity = ((SpaceTimeController.get_jNow() - fadeIn) / (layer.get_fadeSpan() / 864000000));
                        }
                        if (SpaceTimeController.get_jNow() > layerEnd) {
                            fadeOpacity = ((fadeOut - SpaceTimeController.get_jNow()) / (layer.get_fadeSpan() / 864000000));
                        }
                        if (!thisMap.frame.reference) {
                            layer.set_astronomical(true);
                        }
                        layer.preDraw(renderContext, opacity * fadeOpacity);
                    }
                }
            }
        }
    }
    if (nested) {
        var $enum3 = ss.enumerate(ss.keys(LayerManager.get_allMaps()[referenceFrame].childMaps));
        while ($enum3.moveNext()) {
            var key = $enum3.current;
            var map = LayerManager.get_allMaps()[referenceFrame].childMaps[key];
            if ((map.frame.reference === 18 || map.frame.reference === 19)) {
                LayerManager._preDraw(renderContext, opacity, astronomical, map.get_name(), nested);
            }
        }
    }
    renderContext.set_nominalRadius(oldNominalRadius);
    renderContext.set_world(matOld);
    renderContext.set_worldBaseNonRotating(matOldNonRotating);
};

LayerManager.add = function (layer, updateTree) {
    if (!ss.keyExists(LayerManager.get_layerList(), layer.id)) {
        if (ss.keyExists(LayerManager.get_allMaps(), layer.get_referenceFrame())) {
            LayerManager.get_layerList()[layer.id] = layer;
            LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.push(layer);
            LayerManager._version++;
            if (updateTree) {
                LayerManager.loadTree();
            }
        }
    }
};

LayerManager.layerSelectionChanged = function (selected) {
    LayerManager._selectedLayer = selected;
    if (LayerManager._selectedLayer != null) {
        if (ss.canCast(LayerManager._selectedLayer, LayerMap)) {
            var map = ss.safeCast(LayerManager._selectedLayer, LayerMap);
            if (map != null) {
                LayerManager.set_currentMap(map.get_name());
            }
        } else {
            var layer = ss.safeCast(LayerManager._selectedLayer, ImageSetLayer);
            if (layer != null && ss.canCast(layer.get_imageSet().get_wcsImage(), FitsImage)) {
                return;
            }
        }
    }
    globalScriptInterface.setTimeSlider('left', '');
    globalScriptInterface.setTimeSlider('right', '');
    globalScriptInterface.setTimeSlider('title', Language.getLocalizedText(667, 'Time Scrubber'));
};

//Fits time slider not implemented for webgl engine (only Windows version)
LayerManager.setTimeSliderValue = function (pos) {
    var layer = ss.safeCast(LayerManager._selectedLayer, ImageSetLayer);
    if (layer != null && ss.canCast(layer.get_imageSet().get_wcsImage(), FitsImage)) { }
};

LayerManager.showLayerMenu = function (selected, x, y) {
    LayerManager._lastMenuClick = Vector2d.create(x, y);
    LayerManager._selectedLayer = selected;
    if (ss.canCast(selected, LayerMap)) {
        LayerManager.set_currentMap((selected).get_name());
    }
    else if (ss.canCast(selected, Layer)) {
        LayerManager.set_currentMap((selected).get_referenceFrame());
    }
    if (((ss.canCast(selected, Layer)) && !(ss.canCast(selected, SkyOverlays)))) {
        var selectedLayer = selected;
        LayerManager._contextMenu = new ContextMenuStrip();
        var renameMenu = ToolStripMenuItem.create(Language.getLocalizedText(225, 'Rename'));
        var Expand = ToolStripMenuItem.create(Language.getLocalizedText(981, 'Expand'));
        var Collapse = ToolStripMenuItem.create(Language.getLocalizedText(982, 'Collapse'));
        var copyMenu = ToolStripMenuItem.create(Language.getLocalizedText(428, 'Copy'));
        var deleteMenu = ToolStripMenuItem.create(Language.getLocalizedText(167, 'Delete'));
        var saveMenu = ToolStripMenuItem.create(Language.getLocalizedText(960, 'Save...'));
        var publishMenu = ToolStripMenuItem.create(Language.getLocalizedText(983, 'Publish to Community...'));
        var colorMenu = ToolStripMenuItem.create(Language.getLocalizedText(458, 'Color/Opacity'));
        var opacityMenu = ToolStripMenuItem.create(Language.getLocalizedText(305, 'Opacity'));
        var propertiesMenu = ToolStripMenuItem.create(Language.getLocalizedText(20, 'Properties'));
        var scaleMenu = ToolStripMenuItem.create(Language.getLocalizedText(1291, 'Scale/Histogram'));
        var lifeTimeMenu = ToolStripMenuItem.create(Language.getLocalizedText(683, 'Lifetime'));
        var spacer1 = new ToolStripSeparator();
        var top = ToolStripMenuItem.create(Language.getLocalizedText(684, 'Move to Top'));
        var up = ToolStripMenuItem.create(Language.getLocalizedText(685, 'Move Up'));
        var down = ToolStripMenuItem.create(Language.getLocalizedText(686, 'Move Down'));
        var bottom = ToolStripMenuItem.create(Language.getLocalizedText(687, 'Move to Bottom'));
        var showViewer = ToolStripMenuItem.create(Language.getLocalizedText(957, 'VO Table Viewer'));
        var spacer2 = new ToolStripSeparator();
        var defaultImageset = ToolStripMenuItem.create(Language.getLocalizedText(1294, 'Background Image Set'));
        top.click = LayerManager._top_Click;
        up.click = LayerManager._up_Click;
        down.click = LayerManager._down_Click;
        bottom.click = LayerManager._bottom_Click;
        saveMenu.click = LayerManager._saveMenu_Click;
        publishMenu.click = LayerManager._publishMenu_Click;
        Expand.click = LayerManager._expand_Click;
        Collapse.click = LayerManager._collapse_Click;
        copyMenu.click = LayerManager._copyMenu_Click;
        colorMenu.click = LayerManager._colorMenu_Click;
        deleteMenu.click = LayerManager._deleteMenu_Click;
        renameMenu.click = LayerManager._renameMenu_Click;
        propertiesMenu.click = LayerManager._propertiesMenu_Click;
        scaleMenu.click = LayerManager.scaleMenu_click;
        defaultImageset.click = LayerManager._defaultImageset_Click;
        opacityMenu.click = LayerManager._opacityMenu_Click;
        lifeTimeMenu.click = LayerManager._lifeTimeMenu_Click;
        showViewer.click = LayerManager._showViewer_Click;
        LayerManager._contextMenu.items.push(renameMenu);
        if (!selectedLayer.get_opened() && selectedLayer.getPrimaryUI() != null && selectedLayer.getPrimaryUI().get_hasTreeViewNodes()) {
            LayerManager._contextMenu.items.push(Expand);
        }
        if (selectedLayer.get_opened()) {
            LayerManager._contextMenu.items.push(Collapse);
        }
        if (selectedLayer.canCopyToClipboard()) {
        }
        LayerManager._contextMenu.items.push(deleteMenu);
        LayerManager._contextMenu.items.push(spacer2);
        LayerManager._contextMenu.items.push(colorMenu);
        if (ss.canCast(selected, ImageSetLayer)) {
            LayerManager._contextMenu.items.push(defaultImageset);
            var isl = ss.safeCast(selected, ImageSetLayer);
            defaultImageset.checked = isl.get_overrideDefaultLayer();
        }
        if (ss.canCast(selected, SpreadSheetLayer) || ss.canCast(selected, GreatCirlceRouteLayer)) {
            LayerManager._contextMenu.items.push(propertiesMenu);
        }
        if (ss.canCast(selected, VoTableLayer)) {
            LayerManager._contextMenu.items.push(showViewer);
        }
        if (ss.canCast(selected, ImageSetLayer)) {
            var isl = ss.safeCast(selected, ImageSetLayer);
            LayerManager._contextMenu.items.push(scaleMenu);
        }
        if (LayerManager.get_allMaps()[selectedLayer.get_referenceFrame()].layers.length > 1) {
            LayerManager._contextMenu.items.push(spacer1);
            LayerManager._contextMenu.items.push(top);
            LayerManager._contextMenu.items.push(up);
            LayerManager._contextMenu.items.push(down);
            LayerManager._contextMenu.items.push(bottom);
        }
        LayerManager._contextMenu._show(Vector2d.create(x, y));
    }
    else if (ss.canCast(selected, LayerMap)) {
        var map = ss.safeCast(selected, LayerMap);
        var sandbox = map.frame.reference.toString() === 'Sandbox';
        var Dome = map.frame.name === 'Dome';
        var Sky = map.frame.name === 'Sky';
        if (Dome) {
            return;
        }
        LayerManager._contextMenu = new ContextMenuStrip();
        var trackFrame = ToolStripMenuItem.create(Language.getLocalizedText(1298, 'Track this frame'));
        var goTo = ToolStripMenuItem.create(Language.getLocalizedText(1299, 'Fly Here'));
        var showOrbit = ToolStripMenuItem.create('Show Orbit');
        var newMenu = ToolStripMenuItem.create(Language.getLocalizedText(674, 'New Reference Frame'));
        var newLayerGroupMenu = ToolStripMenuItem.create(Language.getLocalizedText(675, 'New Layer Group'));
        var addMenu = ToolStripMenuItem.create(Language.getLocalizedText(166, 'Add'));
        var newLight = ToolStripMenuItem.create('Add Light');
        var addFeedMenu = ToolStripMenuItem.create(Language.getLocalizedText(956, 'Add OData/table feed as Layer'));
        var addWmsLayer = ToolStripMenuItem.create(Language.getLocalizedText(987, 'New WMS Layer'));
        var addGridLayer = ToolStripMenuItem.create(Language.getLocalizedText(1300, 'New Lat/Lng Grid'));
        var addGreatCircle = ToolStripMenuItem.create(Language.getLocalizedText(988, 'New Great Circle'));
        var importTLE = ToolStripMenuItem.create(Language.getLocalizedText(989, 'Import Orbital Elements'));
        var addMpc = ToolStripMenuItem.create(Language.getLocalizedText(1301, 'Add Minor Planet'));
        var deleteFrameMenu = ToolStripMenuItem.create(Language.getLocalizedText(167, 'Delete'));
        var pasteMenu = ToolStripMenuItem.create(Language.getLocalizedText(425, 'Paste'));
        var addToTimeline = ToolStripMenuItem.create(Language.getLocalizedText(1290, 'Add to Timeline'));
        var addKeyframe = ToolStripMenuItem.create(Language.getLocalizedText(1280, 'Add Keyframe'));
        var popertiesMenu = ToolStripMenuItem.create(Language.getLocalizedText(20, 'Properties'));
        var saveMenu = ToolStripMenuItem.create(Language.getLocalizedText(990, 'Save Layers'));
        var publishLayers = ToolStripMenuItem.create(Language.getLocalizedText(991, 'Publish Layers to Community'));
        var spacer1 = new ToolStripSeparator();
        var spacer0 = new ToolStripSeparator();
        var spacer2 = new ToolStripSeparator();
        var asReferenceFrame = ToolStripMenuItem.create('As Reference Frame');
        var asOrbitalLines = ToolStripMenuItem.create('As Orbital Line');
        trackFrame.click = LayerManager._trackFrame_Click;
        goTo.click = LayerManager._goTo_Click;
        asReferenceFrame.click = LayerManager._addMpc_Click;
        asOrbitalLines.click = LayerManager._asOrbitalLines_Click;

        // Add Sub Menus
        addMpc.dropDownItems.push(asReferenceFrame);
        addMpc.dropDownItems.push(asOrbitalLines);
        addMenu.click = LayerManager._addMenu_Click;
        newLayerGroupMenu.click = LayerManager._newLayerGroupMenu_Click;
        pasteMenu.click = LayerManager._pasteLayer_Click;
        newMenu.click = LayerManager._newMenu_Click;
        deleteFrameMenu.click = LayerManager._deleteFrameMenu_Click;
        popertiesMenu.click = LayerManager._framePropertiesMenu_Click;
        addGreatCircle.click = LayerManager._addGreatCircle_Click;
        addGridLayer.click = LayerManager._addGirdLayer_Click;
        var convertToOrbit = ToolStripMenuItem.create('Extract Orbit Layer');
        if (map.frame.reference !== 19) {
            if ((globalWWTControl.get_solarSystemMode() | globalWWTControl.sandboxMode) === 1) {
                var spacerNeeded = false;
                if (map.frame.reference !== 18 && !globalWWTControl.sandboxMode) {
                    // fly to
                    if (!Sky) {
                    }
                    try {
                        var name = map.frame.reference.toString();
                        if (name !== 'Sandbox') {
                            var ssObj = Enums.parse('SolarSystemObjects', name);
                            var id = ssObj;
                            var bit = Math.pow(2, id);
                            showOrbit.checked = !!(Settings.get_active().get_planetOrbitsFilter() & bit);
                            showOrbit.click = LayerManager._showOrbitPlanet_Click;
                            showOrbit.tag = bit.toString();
                        }
                    }
                    catch ($e1) {
                    }
                }
                else {
                    // track
                    if (!sandbox && !Sky) {
                        LayerManager._contextMenu.items.push(trackFrame);
                        spacerNeeded = true;
                    }
                    showOrbit.checked = map.frame.showOrbitPath;
                    showOrbit.click = LayerManager._showOrbit_Click;
                }
                if (spacerNeeded) {
                    LayerManager._contextMenu.items.push(spacer2);
                }
                if (!Sky && !sandbox) {
                    LayerManager._contextMenu.items.push(showOrbit);
                    LayerManager._contextMenu.items.push(spacer0);
                }
                if (map.frame.reference.toString() === 'Sandbox') {
                    LayerManager._contextMenu.items.push(newLight);
                }
            }
            if (!Sky) {
                LayerManager._contextMenu.items.push(newMenu);
            }
        }
        if (!Sky) {
            LayerManager._contextMenu.items.push(addGreatCircle);
            LayerManager._contextMenu.items.push(addGridLayer);
        }
        if ((map.frame.reference !== 19 && map.frame.name === 'Sun') || (map.frame.reference === 19 && map.parent != null && map.parent.frame.name === 'Sun')) {
            LayerManager._contextMenu.items.push(addMpc);
        }
        if (map.frame.reference === 18 && map.frame.referenceFrameType === 1 && map.parent != null && map.parent.frame.name === 'Sun') {
        }
        if (!Sky) {
        }
        LayerManager._contextMenu.items.push(pasteMenu);
        if (map.frame.reference === 19) {
            LayerManager._contextMenu.items.push(deleteFrameMenu);
        }
        if (map.frame.reference === 18) {
            LayerManager._contextMenu.items.push(deleteFrameMenu);
            LayerManager._contextMenu.items.push(popertiesMenu);
        }
        LayerManager._contextMenu.items.push(spacer1);
        LayerManager._contextMenu._show(Vector2d.create(x, y));
    }
};

LayerManager._publishMenu_Click = function (sender, e) { };

LayerManager._addGirdLayer_Click = function (sender, e) {
    var layer = new GridLayer();
    layer.enabled = true;
    layer.set_name('Lat-Lng Grid');
    LayerManager.get_layerList()[layer.id] = layer;
    layer.set_referenceFrame(LayerManager._currentMap);
    LayerManager.get_allMaps()[LayerManager._currentMap].layers.push(layer);
    LayerManager.get_allMaps()[LayerManager._currentMap].open = true;
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._trackFrame_Click = function (sender, e) {
    var target = LayerManager._selectedLayer;
    globalRenderContext.set_solarSystemTrack(20);
    globalRenderContext.set_trackingFrame(target.get_name());
    globalRenderContext.viewCamera.zoom = globalRenderContext.targetCamera.zoom = 1E-09;
};

LayerManager._goTo_Click = function (sender, e) { };

LayerManager._saveMenu_Click = function (sender, e) { };

LayerManager._expand_Click = function (sender, e) { };

LayerManager._collapse_Click = function (sender, e) { };

LayerManager._copyMenu_Click = function (sender, e) {
    if (LayerManager._selectedLayer != null && ss.canCast(LayerManager._selectedLayer, Layer)) {
        var node = LayerManager._selectedLayer;
        node.copyToClipboard();
    }
};

LayerManager._newLayerGroupMenu_Click = function (sender, e) { };

LayerManager._importTLEFile = function (filename) { };

LayerManager._makeLayerGroupNow = function (name) {
    var target = LayerManager._selectedLayer;
    LayerManager._makeLayerGroup(name, target);
};

LayerManager._makeLayerGroup = function (name, target) {
    var frame = new ReferenceFrame();
    frame.name = name;
    frame.reference = 19;
    var newMap = new LayerMap(frame.name, 19);
    newMap.frame = frame;
    newMap.frame._systemGenerated = false;
    target.addChild(newMap);
    newMap.frame.parent = target.get_name();
    LayerManager.get_allMaps()[frame.name] = newMap;
    LayerManager._version++;
};

LayerManager._lifeTimeMenu_Click = function (sender, e) { };

LayerManager._deleteFrameMenu_Click = function (sender, e) { };

LayerManager._framePropertiesMenu_Click = function (sender, e) {
    var target = LayerManager._selectedLayer;
    LayerManager.get_referenceFramePropsDialog().show(target.frame, e);
};

LayerManager._newMenu_Click = function (sender, e) {
    var frame = new ReferenceFrame();
    LayerManager.get_frameWizardDialog().show(frame, e);
};

LayerManager.referenceFrameWizardFinished = function (frame) {
    var target = LayerManager._selectedLayer;
    var newMap = new LayerMap(frame.name, 18);
    if (!ss.keyExists(LayerManager.get_allMaps(), frame.name)) {
        newMap.frame = frame;
        target.addChild(newMap);
        newMap.frame.parent = target.get_name();
        LayerManager.get_allMaps()[frame.name] = newMap;
        LayerManager._version++;
        LayerManager.loadTree();
    }
};

LayerManager.pasteFromTle = function (lines, frame) {
    var line1 = '';
    var line2 = '';
    for (var i = 0; i < lines.length; i++) {
        lines[i] = ss.trim(lines[i]);
        if (lines[i].length === 69 && ReferenceFrame.isTLECheckSumGood(lines[i])) {
            if (!line1.length && lines[i].substring(0, 1) === '1') {
                line1 = lines[i];
            }
            if (!line2.length && lines[i].substring(0, 1) === '2') {
                line2 = lines[i];
            }
        }
    }
    if (line1.length === 69 && line2.length === 69) {
        frame.fromTLE(line1, line2, 398600441800000);
        return true;
    }
    return false;
};

LayerManager._opacityMenu_Click = function (sender, e) { };

LayerManager._defaultImageset_Click = function (sender, e) {
    var isl = ss.safeCast(LayerManager._selectedLayer, ImageSetLayer);
    isl.set_overrideDefaultLayer(!isl.get_overrideDefaultLayer());
};

LayerManager._propertiesMenu_Click = function (sender, e) {
    if (ss.canCast(LayerManager._selectedLayer, SpreadSheetLayer)) {
        var target = LayerManager._selectedLayer;
        LayerManager.get_dataVizWizardDialog().show(target, e);
    }
    if (ss.canCast(LayerManager._selectedLayer, GreatCirlceRouteLayer)) {
        LayerManager.get_greatCircleDlg().show(LayerManager._selectedLayer, new ss.EventArgs());
    }
};

LayerManager._renameMenu_Click = function (sender, e) {
    var layer = LayerManager._selectedLayer;
    var input = new SimpleInput(Language.getLocalizedText(225, 'Rename'), Language.getLocalizedText(228, 'New Name'), layer.get_name(), 32);
    input.show(LayerManager._lastMenuClick, function () {
        if (!ss.emptyString(input.text)) {
            layer.set_name(input.text);
            LayerManager._version++;
            LayerManager.loadTree();
        }
    });
};

LayerManager._colorMenu_Click = function (sender, e) {
    var layer = LayerManager._selectedLayer;
    var picker = new ColorPicker();
    if (layer.get_color() != null) {
        picker.color = layer.get_color();
    }
    picker.callBack = function () {
        layer.set_color(picker.color);
    };
    picker.show(e);
};

LayerManager._addMenu_Click = function (sender, e) { };

LayerManager._deleteMenu_Click = function (sender, e) {
    LayerManager._deleteSelectedLayer();
};

LayerManager._deleteSelectedLayer = function () {
    if (LayerManager._selectedLayer != null && ss.canCast(LayerManager._selectedLayer, Layer)) {
        var node = LayerManager._selectedLayer;
        delete LayerManager.get_layerList()[node.id];
        ss.remove(LayerManager.get_allMaps()[LayerManager.get_currentMap()].layers, node);
        node.cleanUp();
        node.set_version(node.get_version() + 1) - 1;
        LayerManager.loadTree();
        LayerManager._version++;
    }
};

LayerManager.scaleMenu_click = function (sender, e) {
    var isl = ss.safeCast(LayerManager._selectedLayer, ImageSetLayer);
    if (isl != null) {
        var hist = new Histogram();
        hist.image = isl.getFitsImage();
        hist.layer = isl;
        hist.show(Vector2d.create(200, 200));
    }
};

LayerManager._showViewer_Click = function (sender, e) {
    if (ss.canCast(LayerManager._selectedLayer, VoTableLayer)) {
        var layer = ss.safeCast(LayerManager._selectedLayer, VoTableLayer);
        globalScriptInterface.displayVoTableLayer(layer);
    }
};

LayerManager._bottom_Click = function (sender, e) {
    var layer = ss.safeCast(LayerManager._selectedLayer, Layer);
    if (layer != null) {
        ss.remove(LayerManager.get_allMaps()[layer.get_referenceFrame()].layers, layer);
        LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.push(layer);
    }
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._down_Click = function (sender, e) {
    var layer = ss.safeCast(LayerManager._selectedLayer, Layer);
    if (layer != null) {
        var index = LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.lastIndexOf(layer);
        if (index < (LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.length - 1)) {
            ss.remove(LayerManager.get_allMaps()[layer.get_referenceFrame()].layers, layer);
            LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.splice(index + 1, 0, layer);
        }
    }
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._up_Click = function (sender, e) {
    var layer = ss.safeCast(LayerManager._selectedLayer, Layer);
    if (layer != null) {
        var index = LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.lastIndexOf(layer);
        if (index > 0) {
            ss.remove(LayerManager.get_allMaps()[layer.get_referenceFrame()].layers, layer);
            LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.splice(index - 1, 0, layer);
        }
    }
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._top_Click = function (sender, e) {
    var layer = ss.safeCast(LayerManager._selectedLayer, Layer);
    if (layer != null) {
        ss.remove(LayerManager.get_allMaps()[layer.get_referenceFrame()].layers, layer);
        LayerManager.get_allMaps()[layer.get_referenceFrame()].layers.splice(0, 0, layer);
    }
    LayerManager._version++;
    LayerManager.loadTree();
};

LayerManager._pasteLayer_Click = function (sender, e) {
    LayerManager.get_dataVizWizardDialog().show(LayerManager.get_currentMap(), e);
};

LayerManager.createSpreadsheetLayer = function (frame, name, data) {
    var layer = new SpreadSheetLayer();
    layer.loadFromString(data, false, false, false, true);
    layer.set_name(name);
    LayerManager.addSpreadsheetLayer(layer, frame);
    return layer;
};

LayerManager.addSpreadsheetLayer = function (layer, frame) {
    layer.enabled = true;
    layer.set_referenceFrame(frame);
    LayerManager.add(layer, true);
};

LayerManager._showOrbitPlanet_Click = function (sender, e) {
    try {
        var bit = parseInt((sender).tag.toString());
        // Flip the state
        if (!(Settings.get_globalSettings().get_planetOrbitsFilter() & bit)) {
            Settings.get_globalSettings().set_planetOrbitsFilter(Settings.get_globalSettings().get_planetOrbitsFilter() | bit);
        } else {
            Settings.get_globalSettings().set_planetOrbitsFilter(Settings.get_globalSettings().get_planetOrbitsFilter() & ~bit);
        }
    }
    catch ($e1) { }
};

LayerManager._showOrbit_Click = function (sender, e) {
    // Flip the state
    var map = ss.safeCast(LayerManager._selectedLayer, LayerMap);
    map.frame.showOrbitPath = !map.frame.showOrbitPath;
};

LayerManager._addGreatCircle_Click = function (sender, e) {
    LayerManager._addGreatCircleLayer();
};

LayerManager._addMpc_Click = function (sender, e) {
    var target = LayerManager._selectedLayer;
    var input = new SimpleInput(Language.getLocalizedText(1302, 'Minor planet name or designation'), Language.getLocalizedText(238, 'Name'), '', 32);
    var retry = false;
    do {
        if (input.showDialog() === 1) {
            if (ss.keyExists(target.childMaps, input.text)) {
                retry = true;
            }
            else {
                try {
                    LayerManager._getMpc(input.text, target);
                    retry = false;
                }
                catch ($e1) {
                    retry = true;
                }
            }
        } else {
            retry = false;
        }
    } while (retry);
    return;
};

LayerManager._asOrbitalLines_Click = function (sender, e) {
    var target = LayerManager._selectedLayer;
    var input = new SimpleInput(Language.getLocalizedText(1302, 'Minor planet name or designation'), Language.getLocalizedText(238, 'Name'), '', 32);
    input.show(Cursor.get_position(), function () {
        if (ss.keyExists(target.childMaps, input.text)) {
        } else {
            LayerManager._getMpcAsTLE(input.text, target);
        }
    });
};

LayerManager._getMpcAsTLE = function (id, target) {
    var file = new WebFile('https://www.minorplanetcenter.net/db_search/show_object?object_id=' + id);
    file.onStateChange = function () {
        if (file.get_state() !== 1) {
            return;
        }
        var data = file.getText();
        var startform = data.indexOf('show-orbit-button');
        var lastForm = data.indexOf('/form', startform);
        var formpart = data.substring(startform, lastForm);
        var name = id;
        var frame = new ReferenceFrame();
        frame.oblateness = 0;
        frame.showOrbitPath = true;
        frame.showAsPoint = true;
        frame.epoch = SpaceTimeController.utcToJulian(ss.date(LayerManager._getValueByID(formpart, 'epoch').substring(0, 10)));
        frame.semiMajorAxis = parseFloat(LayerManager._getValueByID(formpart, 'a')) * 149598000 * 1000;
        frame.referenceFrameType = 1;
        frame.inclination = parseFloat(LayerManager._getValueByID(formpart, 'incl'));
        frame.longitudeOfAscendingNode = parseFloat(LayerManager._getValueByID(formpart, 'node'));
        frame.eccentricity = parseFloat(LayerManager._getValueByID(formpart, 'e'));
        frame.meanAnomolyAtEpoch = parseFloat(LayerManager._getValueByID(formpart, 'm'));
        frame.meanDailyMotion = ELL.meanMotionFromSemiMajorAxis(parseFloat(LayerManager._getValueByID(formpart, 'a')));
        frame.argumentOfPeriapsis = parseFloat(LayerManager._getValueByID(formpart, 'peri'));
        frame.scale = 1;
        frame.semiMajorAxisUnits = 1;
        frame.meanRadius = 10;
        frame.oblateness = 0;
        var TLE = name + '\n' + frame.toTLE();
        LayerManager._loadOrbitsFile(id, TLE, target.get_name());
        LayerManager.loadTree();
    };
    file.send();
};

LayerManager._getMpc = function (id, target) {
    var file = new WebFile('https://www.minorplanetcenter.net/db_search/show_object?object_id=' + id);
    file.onStateChange = function () {
        var data = file.getText();
        var startform = data.indexOf('show-orbit-button');
        var lastForm = data.indexOf('/form', startform);
        var formpart = data.substring(startform, lastForm);
        var name = id;
        var orbit = new LayerMap(ss.trim(name), 18);
        orbit.frame.oblateness = 0;
        orbit.frame.showOrbitPath = true;
        orbit.frame.showAsPoint = true;
        orbit.frame.epoch = SpaceTimeController.utcToJulian(ss.date(LayerManager._getValueByID(formpart, 'epoch').substring(0, 10)));
        orbit.frame.semiMajorAxis = parseFloat(LayerManager._getValueByID(formpart, 'a')) * 149598000 * 1000;
        orbit.frame.referenceFrameType = 1;
        orbit.frame.inclination = parseFloat(LayerManager._getValueByID(formpart, 'incl'));
        orbit.frame.longitudeOfAscendingNode = parseFloat(LayerManager._getValueByID(formpart, 'node'));
        orbit.frame.eccentricity = parseFloat(LayerManager._getValueByID(formpart, 'e'));
        orbit.frame.meanAnomolyAtEpoch = parseFloat(LayerManager._getValueByID(formpart, 'm'));
        orbit.frame.meanDailyMotion = ELL.meanMotionFromSemiMajorAxis(parseFloat(LayerManager._getValueByID(formpart, 'a')));
        orbit.frame.argumentOfPeriapsis = parseFloat(LayerManager._getValueByID(formpart, 'peri'));
        orbit.frame.scale = 1;
        orbit.frame.semiMajorAxisUnits = 1;
        orbit.frame.meanRadius = 10;
        orbit.frame.oblateness = 0;
        if (!ss.keyExists(LayerManager.get_allMaps()[target.get_name()].childMaps, ss.trim(name))) {
            LayerManager.get_allMaps()[target.get_name()].addChild(orbit);
        }
        LayerManager.get_allMaps()[orbit.get_name()] = orbit;
        orbit.frame.parent = target.get_name();
        LayerManager._makeLayerGroup('Minor Planet', orbit);
        LayerManager.loadTree();
    };
};

LayerManager._getValueByID = function (data, id) {
    var valStart = data.indexOf('id="' + id + '"');
    valStart = data.indexOf('value=', valStart) + 7;
    var valEnd = data.indexOf('"', valStart);
    return data.substr(valStart, valEnd - valStart);
};

LayerManager._addGreatCircleLayer = function () {
    var layer = new GreatCirlceRouteLayer();
    var camera = globalRenderContext.viewCamera;
    layer.set_latStart(camera.lat);
    layer.set_latEnd(camera.lat - 5);
    layer.set_lngStart(camera.lng);
    layer.set_lngEnd(camera.lng + 5);
    layer.set_width(4);
    layer.enabled = true;
    layer.set_name(Language.getLocalizedText(1144, 'Great Circle Route'));
    LayerManager.get_layerList()[layer.id] = layer;
    layer.set_referenceFrame(LayerManager._currentMap);
    LayerManager.get_allMaps()[LayerManager._currentMap].layers.push(layer);
    LayerManager.get_allMaps()[LayerManager._currentMap].open = true;
    LayerManager._version++;
    LayerManager.loadTree();
    LayerManager.get_greatCircleDlg().show(layer, new ss.EventArgs());
};

LayerManager._loadOrbitsFile = function (name, data, currentMap) {
    var layer = new OrbitLayer();
    layer.loadString(data);
    layer.enabled = true;
    layer.set_name(name);
    LayerManager.get_layerList()[layer.id] = layer;
    layer.set_referenceFrame(currentMap);
    LayerManager.get_allMaps()[currentMap].layers.push(layer);
    LayerManager.get_allMaps()[currentMap].open = true;
    LayerManager._version++;
    LayerManager.loadTree();
    return layer;
};

var LayerManager$ = {};

registerType("LayerManager", [LayerManager, LayerManager$, null]);


// wwtlib.LayerMap

export function LayerMap(name, reference) {
    this.childMaps = {};
    this.parent = null;
    this.layers = [];
    this.open = false;
    this.enabled = true;
    this.loadedFromTour = false;
    this.frame = new ReferenceFrame();
    this.set_name(name);
    this.frame.reference = reference;
    var radius = 6371000;
    switch (reference) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            radius = 696000000;
            break;
        case 4:
            radius = 2439700;
            break;
        case 5:
            radius = 6051800;
            break;
        case 6:
            radius = 6371000;
            break;
        case 7:
            radius = 3390000;
            break;
        case 8:
            radius = 69911000;
            break;
        case 9:
            radius = 58232000;
            break;
        case 10:
            radius = 25362000;
            break;
        case 11:
            radius = 24622000;
            break;
        case 12:
            radius = 1161000;
            break;
        case 13:
            radius = 1737100;
            break;
        case 14:
            radius = 1821500;
            break;
        case 15:
            radius = 1561000;
            break;
        case 16:
            radius = 2631200;
            break;
        case 17:
            radius = 2410300;
            break;
        case 18:
            break;
        case 19:
            break;
        default:
            break;
    }
    this.frame.meanRadius = radius;
}

var LayerMap$ = {
    addChild: function (child) {
        child.parent = this;
        this.childMaps[child.get_name()] = child;
    },

    get_name: function () {
        return this.frame.name;
    },

    set_name: function (value) {
        this.frame.name = value;
        return value;
    },

    computeFrame: function (renderContext) {
        if (this.frame.reference === 18) {
            this.frame.computeFrame(renderContext);
        }
    },

    toString: function () {
        return this.get_name();
    }
};

registerType("LayerMap", [LayerMap, LayerMap$, null]);


// wwtlib.SkyOverlays

export function SkyOverlays() { }

var SkyOverlays$ = {};

registerType("SkyOverlays", [SkyOverlays, SkyOverlays$, null]);


// wwtlib.GroundOverlayLayer

export function GroundOverlayLayer() { }

var GroundOverlayLayer$ = {};

registerType("GroundOverlayLayer", [GroundOverlayLayer, GroundOverlayLayer$, null]);


// wwtlib.FrameTarget

export function FrameTarget() { }

var FrameTarget$ = {};

registerType("FrameTarget", [FrameTarget, FrameTarget$, null]);
