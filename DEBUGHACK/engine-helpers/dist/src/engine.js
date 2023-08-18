// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License
import { __values } from "tslib";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Helpers for handling core engine settings. */
import { isBaseEngineSetting, } from '@wwtelescope/engine-types';
import { Color, ConstellationFilter, } from "@wwtelescope/engine";
/** A list of the names of the core engine settings. */
export var engineSettingNames = [
    "actualPlanetScale",
    "altAzGridColor",
    "constellationArtFilter",
    "constellationBoundariesFilter",
    "constellationFigureColor",
    "constellationFiguresFilter",
    "constellationBoundryColor",
    "constellationNamesFilter",
    "constellationLabelsHeight",
    "constellations",
    "constellationSelectionColor",
    "constellationsEnabled",
    "crosshairsColor",
    "earthCutawayView",
    "eclipticColor",
    "eclipticGridColor",
    "equatorialGridColor",
    "galacticGridColor",
    "galacticMode",
    "localHorizonMode",
    "locationAltitude",
    "locationLat",
    "locationLng",
    "milkyWayModel",
    "minorPlanetsFilter",
    "planetOrbitsFilter",
    "precessionChartColor",
    "showAltAzGrid",
    "showAltAzGridText",
    "showConstellationBoundries",
    "showConstellationFigures",
    "showConstellationLabels",
    "showConstellationPictures",
    "showConstellations",
    "showConstellationSelection",
    "showCrosshairs",
    "showEarthSky",
    "showEcliptic",
    "showEclipticGrid",
    "showEclipticGridText",
    "showEclipticOverviewText",
    "showElevationModel",
    "showEquatorialGridText",
    "showGalacticGrid",
    "showGalacticGridText",
    "showGrid",
    "showHorizon",
    "showISSModel",
    "showPrecessionChart",
    "showSkyGrids",
    "showSkyOverlays",
    "showSkyOverlaysIn3d",
    "showSkyNode",
    "showSolarSystem",
    "smoothPan",
    "solarSystemCMB",
    "solarSystemCosmos",
    "solarSystemLighting",
    "solarSystemMilkyWay",
    "solarSystemMinorPlanets",
    "solarSystemMultiRes",
    "solarSystemOrbits",
    "solarSystemOverlays",
    "solarSystemPlanets",
    "solarSystemScale",
    "solarSystemStars",
    "solarSystemMinorOrbits",
];
var engineSettingTypeInfo = {
    "altAzGridColor/Color": true,
    "constellationArtFilter/ConstellationFilter": true,
    "constellationBoundariesFilter/ConstellationFilter": true,
    "constellationBoundryColor/Color": true,
    "constellationFigureColor/Color": true,
    "constellationFiguresFilter/ConstellationFilter": true,
    "constellationNamesFilter/ConstellationFilter": true,
    "constellationSelectionColor/Color": true,
    "crosshairsColor/Color": true,
    "eclipticColor/Color": true,
    "eclipticGridColor/Color": true,
    "equatorialGridColor/Color": true,
    "galacticGridColor/Color": true,
    "precessionChartColor/Color": true,
};
/** Type guard function for `EngineSetting`. */
export function isEngineSetting(obj) {
    var typekey = typeof obj[1];
    if (obj[1] instanceof Color) {
        typekey = "Color";
    }
    else if (obj[1] instanceof ConstellationFilter) {
        typekey = "ConstellationFilter";
    }
    var key = obj[0] + "/" + typekey;
    return isBaseEngineSetting(obj) || (key in engineSettingTypeInfo);
}
/** Apply a setting to the engine or an equivalent. */
export function applyEngineSetting(engine, setting) {
    var funcName = "set_" + setting[0];
    var value = setting[1];
    engine[funcName](value);
}
/** Extract all of the current settings of the engine or an equivalent. */
export function extractEngineSettings(engine) {
    var e_1, _a;
    var s = [];
    try {
        for (var engineSettingNames_1 = __values(engineSettingNames), engineSettingNames_1_1 = engineSettingNames_1.next(); !engineSettingNames_1_1.done; engineSettingNames_1_1 = engineSettingNames_1.next()) {
            var n = engineSettingNames_1_1.value;
            s.push([n, engine["get_" + n]()]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (engineSettingNames_1_1 && !engineSettingNames_1_1.done && (_a = engineSettingNames_1.return)) _a.call(engineSettingNames_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return s;
}
/** Copy settings from the engine, or an equivalent, to another. */
export function copyEngineSettings(source, dest) {
    var e_2, _a;
    try {
        for (var engineSettingNames_2 = __values(engineSettingNames), engineSettingNames_2_1 = engineSettingNames_2.next(); !engineSettingNames_2_1.done; engineSettingNames_2_1 = engineSettingNames_2.next()) {
            var n = engineSettingNames_2_1.value;
            dest["set_" + n](source["get_" + n]());
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (engineSettingNames_2_1 && !engineSettingNames_2_1.done && (_a = engineSettingNames_2.return)) _a.call(engineSettingNames_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
/** A plain-old-data class implementing `EngineSettingsInterface`. */
var EngineState = /** @class */ (function () {
    function EngineState(source) {
        copyEngineSettings(source, this);
    }
    EngineState.prototype.get_actualPlanetScale = function () {
        return this.actualPlanetScale;
    };
    EngineState.prototype.set_actualPlanetScale = function (v) {
        this.actualPlanetScale = v;
        return v;
    };
    EngineState.prototype.get_constellationArtFilter = function () {
        return this.constellationArtFilter;
    };
    EngineState.prototype.set_constellationArtFilter = function (v) {
        this.constellationArtFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationBoundariesFilter = function () {
        return this.constellationBoundariesFilter;
    };
    EngineState.prototype.set_constellationBoundariesFilter = function (v) {
        this.constellationBoundariesFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationFigureColor = function () {
        return this.constellationFigureColor;
    };
    EngineState.prototype.set_constellationFigureColor = function (v) {
        this.constellationFigureColor = v;
        return v;
    };
    EngineState.prototype.get_constellationFiguresFilter = function () {
        return this.constellationFiguresFilter;
    };
    EngineState.prototype.set_constellationFiguresFilter = function (v) {
        this.constellationFiguresFilter = v;
        return v;
    };
    EngineState.prototype.get_constellationBoundryColor = function () {
        return this.constellationBoundryColor;
    };
    EngineState.prototype.set_constellationBoundryColor = function (v) {
        this.constellationBoundryColor = v;
        return v;
    };
    EngineState.prototype.get_constellationNamesFilter = function () {
        return this.constellationNamesFilter;
    };
    EngineState.prototype.set_constellationNamesFilter = function (v) {
        this.constellationNamesFilter = v;
        return v;
    };
    EngineState.prototype.get_constellations = function () {
        return this.constellations;
    };
    EngineState.prototype.set_constellations = function (v) {
        this.constellations = v;
        return v;
    };
    EngineState.prototype.get_constellationSelectionColor = function () {
        return this.constellationSelectionColor;
    };
    EngineState.prototype.set_constellationSelectionColor = function (v) {
        this.constellationSelectionColor = v;
        return v;
    };
    EngineState.prototype.get_constellationsEnabled = function () {
        return this.constellationsEnabled;
    };
    EngineState.prototype.set_constellationsEnabled = function (v) {
        this.constellationsEnabled = v;
        return v;
    };
    EngineState.prototype.get_crosshairsColor = function () {
        return this.crosshairsColor;
    };
    EngineState.prototype.set_crosshairsColor = function (v) {
        this.crosshairsColor = v;
        return v;
    };
    EngineState.prototype.get_earthCutawayView = function () {
        return this.earthCutawayView;
    };
    EngineState.prototype.set_earthCutawayView = function (v) {
        this.earthCutawayView = v;
        return v;
    };
    EngineState.prototype.get_galacticMode = function () {
        return this.galacticMode;
    };
    EngineState.prototype.set_galacticMode = function (v) {
        this.galacticMode = v;
        return v;
    };
    EngineState.prototype.get_localHorizonMode = function () {
        return this.localHorizonMode;
    };
    EngineState.prototype.set_localHorizonMode = function (v) {
        this.localHorizonMode = v;
        return v;
    };
    EngineState.prototype.get_locationAltitude = function () {
        return this.locationAltitude;
    };
    EngineState.prototype.set_locationAltitude = function (v) {
        this.locationAltitude = v;
        return v;
    };
    EngineState.prototype.get_locationLat = function () {
        return this.locationLat;
    };
    EngineState.prototype.set_locationLat = function (v) {
        this.locationLat = v;
        return v;
    };
    EngineState.prototype.get_locationLng = function () {
        return this.locationLng;
    };
    EngineState.prototype.set_locationLng = function (v) {
        this.locationLng = v;
        return v;
    };
    EngineState.prototype.get_milkyWayModel = function () {
        return this.milkyWayModel;
    };
    EngineState.prototype.set_milkyWayModel = function (v) {
        this.milkyWayModel = v;
        return v;
    };
    EngineState.prototype.get_minorPlanetsFilter = function () {
        return this.minorPlanetsFilter;
    };
    EngineState.prototype.set_minorPlanetsFilter = function (v) {
        this.minorPlanetsFilter = v;
        return v;
    };
    EngineState.prototype.get_planetOrbitsFilter = function () {
        return this.planetOrbitsFilter;
    };
    EngineState.prototype.set_planetOrbitsFilter = function (v) {
        this.planetOrbitsFilter = v;
        return v;
    };
    EngineState.prototype.get_showAltAzGrid = function () {
        return this.showAltAzGrid;
    };
    EngineState.prototype.set_showAltAzGrid = function (v) {
        this.showAltAzGrid = v;
        return v;
    };
    EngineState.prototype.get_showAltAzGridText = function () {
        return this.showAltAzGridText;
    };
    EngineState.prototype.set_showAltAzGridText = function (v) {
        this.showAltAzGridText = v;
        return v;
    };
    EngineState.prototype.get_showConstellationBoundries = function () {
        return this.showConstellationBoundries;
    };
    EngineState.prototype.set_showConstellationBoundries = function (v) {
        this.showConstellationBoundries = v;
        return v;
    };
    EngineState.prototype.get_showConstellationFigures = function () {
        return this.showConstellationFigures;
    };
    EngineState.prototype.set_showConstellationFigures = function (v) {
        this.showConstellationFigures = v;
        return v;
    };
    EngineState.prototype.get_showConstellationLabels = function () {
        return this.showConstellationLabels;
    };
    EngineState.prototype.set_showConstellationLabels = function (v) {
        this.showConstellationLabels = v;
        return v;
    };
    EngineState.prototype.get_showConstellationPictures = function () {
        return this.showConstellationPictures;
    };
    EngineState.prototype.set_showConstellationPictures = function (v) {
        this.showConstellationPictures = v;
        return v;
    };
    EngineState.prototype.get_showConstellations = function () {
        return this.showConstellations;
    };
    EngineState.prototype.set_showConstellations = function (v) {
        this.showConstellations = v;
        return v;
    };
    EngineState.prototype.get_showConstellationSelection = function () {
        return this.showConstellationSelection;
    };
    EngineState.prototype.set_showConstellationSelection = function (v) {
        this.showConstellationSelection = v;
        return v;
    };
    EngineState.prototype.get_showCrosshairs = function () {
        return this.showCrosshairs;
    };
    EngineState.prototype.set_showCrosshairs = function (v) {
        this.showCrosshairs = v;
        return v;
    };
    EngineState.prototype.get_showEarthSky = function () {
        return this.showEarthSky;
    };
    EngineState.prototype.set_showEarthSky = function (v) {
        this.showEarthSky = v;
        return v;
    };
    EngineState.prototype.get_showEcliptic = function () {
        return this.showEcliptic;
    };
    EngineState.prototype.set_showEcliptic = function (v) {
        this.showEcliptic = v;
        return v;
    };
    EngineState.prototype.get_showEclipticGrid = function () {
        return this.showEclipticGrid;
    };
    EngineState.prototype.set_showEclipticGrid = function (v) {
        this.showEclipticGrid = v;
        return v;
    };
    EngineState.prototype.get_showEclipticGridText = function () {
        return this.showEclipticGridText;
    };
    EngineState.prototype.set_showEclipticGridText = function (v) {
        this.showEclipticGridText = v;
        return v;
    };
    EngineState.prototype.get_showEclipticOverviewText = function () {
        return this.showEclipticOverviewText;
    };
    EngineState.prototype.set_showEclipticOverviewText = function (v) {
        this.showEclipticOverviewText = v;
        return v;
    };
    EngineState.prototype.get_showElevationModel = function () {
        return this.showElevationModel;
    };
    EngineState.prototype.set_showElevationModel = function (v) {
        this.showElevationModel = v;
        return v;
    };
    EngineState.prototype.get_showEquatorialGridText = function () {
        return this.showEquatorialGridText;
    };
    EngineState.prototype.set_showEquatorialGridText = function (v) {
        this.showEquatorialGridText = v;
        return v;
    };
    EngineState.prototype.get_showGalacticGrid = function () {
        return this.showGalacticGrid;
    };
    EngineState.prototype.set_showGalacticGrid = function (v) {
        this.showGalacticGrid = v;
        return v;
    };
    EngineState.prototype.get_showGalacticGridText = function () {
        return this.showGalacticGridText;
    };
    EngineState.prototype.set_showGalacticGridText = function (v) {
        this.showGalacticGridText = v;
        return v;
    };
    EngineState.prototype.get_showGrid = function () {
        return this.showGrid;
    };
    EngineState.prototype.set_showGrid = function (v) {
        this.showGrid = v;
        return v;
    };
    EngineState.prototype.get_showHorizon = function () {
        return this.showHorizon;
    };
    EngineState.prototype.set_showHorizon = function (v) {
        this.showHorizon = v;
        return v;
    };
    EngineState.prototype.get_showISSModel = function () {
        return this.showISSModel;
    };
    EngineState.prototype.set_showISSModel = function (v) {
        this.showISSModel = v;
        return v;
    };
    EngineState.prototype.get_showPrecessionChart = function () {
        return this.showPrecessionChart;
    };
    EngineState.prototype.set_showPrecessionChart = function (v) {
        this.showPrecessionChart = v;
        return v;
    };
    EngineState.prototype.get_showSkyGrids = function () {
        return this.showSkyGrids;
    };
    EngineState.prototype.set_showSkyGrids = function (v) {
        this.showSkyGrids = v;
        return v;
    };
    EngineState.prototype.get_showSkyOverlays = function () {
        return this.showSkyOverlays;
    };
    EngineState.prototype.set_showSkyOverlays = function (v) {
        this.showSkyOverlays = v;
        return v;
    };
    EngineState.prototype.get_showSkyOverlaysIn3d = function () {
        return this.showSkyOverlaysIn3d;
    };
    EngineState.prototype.set_showSkyOverlaysIn3d = function (v) {
        this.showSkyOverlaysIn3d = v;
        return v;
    };
    EngineState.prototype.get_showSkyNode = function () {
        return this.showSkyNode;
    };
    EngineState.prototype.set_showSkyNode = function (v) {
        this.showSkyNode = v;
        return v;
    };
    EngineState.prototype.get_showSolarSystem = function () {
        return this.showSolarSystem;
    };
    EngineState.prototype.set_showSolarSystem = function (v) {
        this.showSolarSystem = v;
        return v;
    };
    EngineState.prototype.get_smoothPan = function () {
        return this.smoothPan;
    };
    EngineState.prototype.set_smoothPan = function (v) {
        this.smoothPan = v;
        return v;
    };
    EngineState.prototype.get_solarSystemCMB = function () {
        return this.solarSystemCMB;
    };
    EngineState.prototype.set_solarSystemCMB = function (v) {
        this.solarSystemCMB = v;
        return v;
    };
    EngineState.prototype.get_solarSystemCosmos = function () {
        return this.solarSystemCosmos;
    };
    EngineState.prototype.set_solarSystemCosmos = function (v) {
        this.solarSystemCosmos = v;
        return v;
    };
    EngineState.prototype.get_solarSystemLighting = function () {
        return this.solarSystemLighting;
    };
    EngineState.prototype.set_solarSystemLighting = function (v) {
        this.solarSystemLighting = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMilkyWay = function () {
        return this.solarSystemMilkyWay;
    };
    EngineState.prototype.set_solarSystemMilkyWay = function (v) {
        this.solarSystemMilkyWay = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMinorPlanets = function () {
        return this.solarSystemMinorPlanets;
    };
    EngineState.prototype.set_solarSystemMinorPlanets = function (v) {
        this.solarSystemMinorPlanets = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMultiRes = function () {
        return this.solarSystemMultiRes;
    };
    EngineState.prototype.set_solarSystemMultiRes = function (v) {
        this.solarSystemMultiRes = v;
        return v;
    };
    EngineState.prototype.get_solarSystemOrbits = function () {
        return this.solarSystemOrbits;
    };
    EngineState.prototype.set_solarSystemOrbits = function (v) {
        this.solarSystemOrbits = v;
        return v;
    };
    EngineState.prototype.get_solarSystemOverlays = function () {
        return this.solarSystemOverlays;
    };
    EngineState.prototype.set_solarSystemOverlays = function (v) {
        this.solarSystemOverlays = v;
        return v;
    };
    EngineState.prototype.get_solarSystemPlanets = function () {
        return this.solarSystemPlanets;
    };
    EngineState.prototype.set_solarSystemPlanets = function (v) {
        this.solarSystemPlanets = v;
        return v;
    };
    EngineState.prototype.get_solarSystemScale = function () {
        return this.solarSystemScale;
    };
    EngineState.prototype.set_solarSystemScale = function (v) {
        this.solarSystemScale = v;
        return v;
    };
    EngineState.prototype.get_solarSystemStars = function () {
        return this.solarSystemStars;
    };
    EngineState.prototype.set_solarSystemStars = function (v) {
        this.solarSystemStars = v;
        return v;
    };
    EngineState.prototype.get_solarSystemMinorOrbits = function () {
        return this.solarSystemMinorOrbits;
    };
    EngineState.prototype.set_solarSystemMinorOrbits = function (v) {
        this.solarSystemMinorOrbits = v;
        return v;
    };
    return EngineState;
}());
export { EngineState };
//# sourceMappingURL=engine.js.map