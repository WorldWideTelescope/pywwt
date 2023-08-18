// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Planet-related code that can come lower in the dependency graph.

import { registerType, registerEnum } from "./typesystem.js";
import { Colors } from "./color.js";
import { ConstellationFilter } from "./constellation_filter.js";
import { ISettings } from "./interfaces.js";


// wwtlib.StockSkyOverlayTypes
//
// This was defined in `Tours/ISettings.cs`, which we've folded into `interfaces.js`.

export var StockSkyOverlayTypes = {
    empty: 0,
    equatorialGrid: 1,
    equatorialGridText: 2,
    galacticGrid: 3,
    galacticGridText: 4,
    eclipticGrid: 5,
    eclipticGridText: 6,
    eclipticOverview: 7,
    eclipticOverviewText: 8,
    precessionChart: 9,
    altAzGrid: 10,
    altAzGridText: 11,
    constellationFigures: 12,
    constellationBoundaries: 13,
    constellationFocusedOnly: 14,
    constellationNames: 15,
    constellationPictures: 16,
    fadeToBlack: 17,
    fadeToLogo: 18,
    fadeToGradient: 19,
    screenBroadcast: 20,
    fadeRemoteOnly: 21,
    skyGrids: 22,
    constellations: 23,
    solarSystemStars: 24,
    solarSystemMilkyWay: 25,
    solarSystemCosmos: 26,
    solarSystemOrbits: 27,
    solarSystemPlanets: 28,
    solarSystemAsteroids: 29,
    solarSystemLighting: 30,
    solarSystemMinorOrbits: 31,
    showEarthCloudLayer: 32,
    showElevationModel: 33,
    showAtmosphere: 34,
    multiResSolarSystemBodies: 35,
    auroraBorialis: 36,
    earthCutAway: 37,
    showSolarSystem: 38,
    clouds8k: 39,
    filedOfView: 40,
    showISSModel: 41,
    solarSystemCMB: 42,
    mpcZone1: 43,
    mpcZone2: 44,
    mpcZone3: 45,
    mpcZone4: 46,
    mpcZone5: 47,
    mpcZone6: 48,
    mpcZone7: 49,
    orbitFilters: 50
};

registerType("StockSkyOverlayTypes", StockSkyOverlayTypes);
registerEnum("StockSkyOverlayTypes", StockSkyOverlayTypes);


// wwtlib.SettingParameter
//
// This was defined in `Tours/ISettings.cs`, which we've folded into `interfaces.js`.

export function SettingParameter(edgeTrigger, opacity, targetState, filter) {
    this.targetState = false;
    this.edgeTrigger = false;
    this.opacity = 0;
    this.edgeTrigger = edgeTrigger;
    this.opacity = opacity;
    this.targetState = targetState;
    this.filter = filter;
}

var SettingParameter$ = {};

registerType("SettingParameter", [SettingParameter, SettingParameter$, null]);


// wwtlib.Settings

export function Settings() {
    this.autoRepeatTour = false;
    this._localHorizonMode = false;
    this._galacticMode = false;
    this._constellationBoundryColor = 'blue';
    this._constellationSelectionColor = 'yellow';
    this._constellationFigureColor = 'red';
    this._showConstellationFigures = true;
    this._showConstellationBoundries = true;
    this._showConstellationSelection = true;
    this._showCrosshairs = true;
    this._crosshairsColor = 'white';
    this._showEcliptic = false;
    this._locationLat = 47.717;
    this._locationLng = -122.0858;
    this._locationAltitude = 100;
    this._showFiledOfView = false;
    this._actualPlanetScale = true;
    this._fovCamera = 0;
    this._fovEyepiece = 0;
    this._fovTelescope = 0;
    this._showClouds = false;
    this._showGrid = false;
    this._showHorizon = true;
    this._showHorizonPanorama = false;
    this._showMoonsAsPointSource = true;
    this._showSolarSystem = true;
    this._solarSystemStars = true;
    this._solarSystemMilkyWay = true;
    this._solarSystemCosmos = true;
    this._solarSystemOrbits = true;
    this._solarSystemOverlays = true;
    this._solarSystemLighting = true;
    this._solarSystemMultiRes = true;
    this._solarSystemScale = 1;
    this._smoothPan = true;
    this._showElevationModel = true;
    this._showEquatorialGridText = false;
    this._showGalacticGrid = false;
    this._showGalacticGridText = false;
    this._showEclipticGrid = false;
    this._showEclipticGridText = false;
    this._showEclipticOverviewText = false;
    this._showAltAzGrid = false;
    this._eclipticGridColor = Colors.get_green();
    this._galacticGridColor = Colors.get_cyan();
    this._altAzGridColor = Colors.get_magenta();
    this._precessionChartColor = Colors.get_orange();
    this._eclipticColor = Colors.get_blue();
    this._equatorialGridColor = Colors.get_white();
    this._showAltAzGridText = false;
    this._showPrecessionChart = false;
    this._showConstellationPictures = false;
    this._showConstellationLabels = false;
    this._constellationLabelsHeight = 80;
    this._solarSystemCMB = true;
    this._solarSystemMinorPlanets = false;
    this._solarSystemPlanets = true;
    this._showEarthSky = true;
    this._solarSystemMinorOrbits = false;
    this._constellationsEnabled = '';
    this._constellationFiguresFilter = new ConstellationFilter();
    this._constellationBoundariesFilter = new ConstellationFilter();
    this._constellationNamesFilter = new ConstellationFilter();
    this._constellationArtFilter = new ConstellationFilter();
    this._showSkyOverlays = true;
    this._showConstellations = true;
    this._showSkyNode = true;
    this._showSkyGrids = true;
    this._showSkyOverlaysIn3d = true;
    this._earthCutawayView = false;
    this._showISSModel = false;
    this._milkyWayModel = false;
    this._minorPlanetsFilter = 255;
    this._planetOrbitsFilter = 2147483647;
    this._constellations = true;
}

Settings._active = null;
Settings.tourSettings = null;

Settings.get_current = function () {
    if (Settings._active == null) {
        Settings._active = new Settings();
    }
    return Settings._active;
};

Settings.get_globalSettings = function () {
    if (Settings._active == null) {
        Settings._active = new Settings();
    }
    return Settings._active;
};

Settings.get_active = function () {
    if (Settings._active == null) {
        Settings._active = new Settings();
    }
    if (Settings.tourSettings != null) {
        return Settings.tourSettings;
    }
    return Settings._active;
};

var Settings$ = {
    get_constellationFigureColor: function () {
        return this._constellationFigureColor;
    },

    set_constellationFigureColor: function (value) {
        this._constellationFigureColor = value;
        return value;
    },

    get_constellationBoundryColor: function () {
        return this._constellationBoundryColor;
    },

    set_constellationBoundryColor: function (value) {
        this._constellationBoundryColor = value;
        return value;
    },

    get_constellationSelectionColor: function () {
        return this._constellationSelectionColor;
    },

    set_constellationSelectionColor: function (value) {
        this._constellationSelectionColor = value;
        return value;
    },

    get_showCrosshairs: function () {
        return this._showCrosshairs;
    },

    set_showCrosshairs: function (value) {
        this._showCrosshairs = value;
        return value;
    },

    get_smoothPan: function () {
        return this._smoothPan;
    },

    set_smoothPan: function (value) {
        this._smoothPan = value;
        return value;
    },

    get_crosshairsColor: function () {
        return this._crosshairsColor;
    },

    set_crosshairsColor: function (value) {
        this._crosshairsColor = value;
        return value;
    },

    get_actualPlanetScale: function () {
        return this._actualPlanetScale;
    },

    set_actualPlanetScale: function (value) {
        this._actualPlanetScale = value;
        return value;
    },

    get_fovCamera: function () {
        return this._fovCamera;
    },

    get_fovEyepiece: function () {
        return this._fovEyepiece;
    },

    get_fovTelescope: function () {
        return this._fovTelescope;
    },

    get_locationAltitude: function () {
        return this._locationAltitude;
    },

    set_locationAltitude: function (value) {
        this._locationAltitude = value;
        return value;
    },

    get_locationLat: function () {
        return this._locationLat;
    },

    set_locationLat: function (value) {
        this._locationLat = value;
        return value;
    },

    get_locationLng: function () {
        return this._locationLng;
    },

    set_locationLng: function (value) {
        this._locationLng = value;
        return value;
    },

    get_showClouds: function () {
        return this._showClouds;
    },

    get_showConstellationBoundries: function () {
        return this._showConstellationBoundries;
    },

    set_showConstellationBoundries: function (value) {
        this._showConstellationBoundries = value;
        return value;
    },

    get_showConstellationFigures: function () {
        return this._showConstellationFigures;
    },

    set_showConstellationFigures: function (value) {
        this._showConstellationFigures = value;
        return value;
    },

    get_showConstellationSelection: function () {
        return this._showConstellationSelection;
    },

    set_showConstellationSelection: function (value) {
        this._showConstellationSelection = value;
        return value;
    },

    get_showEcliptic: function () {
        return this._showEcliptic;
    },

    set_showEcliptic: function (value) {
        this._showEcliptic = value;
        return value;
    },

    get_showElevationModel: function () {
        return this._showElevationModel;
    },

    set_showElevationModel: function (value) {
        this._showElevationModel = value;
        return value;
    },

    get_showFieldOfView: function () {
        return this._showFiledOfView;
    },

    get_showGrid: function () {
        return this._showGrid;
    },

    set_showGrid: function (value) {
        this._showGrid = value;
        return value;
    },

    get_showHorizon: function () {
        return this._showHorizon;
    },

    set_showHorizon: function (value) {
        this._showHorizon = value;
        return value;
    },

    get_showHorizonPanorama: function () {
        return this._showHorizonPanorama;
    },

    get_showMoonsAsPointSource: function () {
        return this._showMoonsAsPointSource;
    },

    get_showSolarSystem: function () {
        return this._showSolarSystem;
    },

    set_showSolarSystem: function (value) {
        this._showSolarSystem = value;
        return value;
    },

    get_localHorizonMode: function () {
        return this._localHorizonMode;
    },

    set_localHorizonMode: function (value) {
        this._localHorizonMode = value;
        return value;
    },

    get_galacticMode: function () {
        return this._galacticMode;
    },

    set_galacticMode: function (value) {
        this._galacticMode = value;
        return value;
    },

    get_solarSystemStars: function () {
        return this._solarSystemStars;
    },

    set_solarSystemStars: function (value) {
        this._solarSystemStars = value;
        return value;
    },

    get_solarSystemMilkyWay: function () {
        return this._solarSystemMilkyWay;
    },

    set_solarSystemMilkyWay: function (value) {
        this._solarSystemMilkyWay = value;
        return value;
    },

    get_solarSystemCosmos: function () {
        return this._solarSystemCosmos;
    },

    set_solarSystemCosmos: function (value) {
        this._solarSystemCosmos = value;
        return value;
    },

    get_solarSystemOrbits: function () {
        return this._solarSystemOrbits;
    },

    set_solarSystemOrbits: function (value) {
        this._solarSystemOrbits = value;
        return value;
    },

    get_solarSystemOverlays: function () {
        return this._solarSystemOverlays;
    },

    set_solarSystemOverlays: function (value) {
        this._solarSystemOverlays = value;
        return value;
    },

    get_solarSystemLighting: function () {
        return this._solarSystemLighting;
    },

    set_solarSystemLighting: function (value) {
        this._solarSystemLighting = value;
        return value;
    },

    get_solarSystemMultiRes: function () {
        return true;
    },

    set_solarSystemMultiRes: function (value) {
        this._solarSystemMultiRes = value;
        return value;
    },

    get_solarSystemScale: function () {
        return this._solarSystemScale;
    },

    set_solarSystemScale: function (value) {
        this._solarSystemScale = value;
        return value;
    },

    get_showEquatorialGridText: function () {
        return this._showEquatorialGridText;
    },

    set_showEquatorialGridText: function (value) {
        this._showEquatorialGridText = value;
        return value;
    },

    get_showGalacticGrid: function () {
        return this._showGalacticGrid;
    },

    set_showGalacticGrid: function (value) {
        this._showGalacticGrid = value;
        return value;
    },

    get_showGalacticGridText: function () {
        return this._showGalacticGridText;
    },

    set_showGalacticGridText: function (value) {
        this._showGalacticGridText = value;
        return value;
    },

    get_showEclipticGrid: function () {
        return this._showEclipticGrid;
    },

    set_showEclipticGrid: function (value) {
        this._showEclipticGrid = value;
        return value;
    },

    get_showEclipticGridText: function () {
        return this._showEclipticGridText;
    },

    set_showEclipticGridText: function (value) {
        this._showEclipticGridText = value;
        return value;
    },

    get_showEclipticOverviewText: function () {
        return this._showEclipticOverviewText;
    },

    set_showEclipticOverviewText: function (value) {
        this._showEclipticOverviewText = value;
        return value;
    },

    get_showAltAzGrid: function () {
        return this._showAltAzGrid;
    },

    set_showAltAzGrid: function (value) {
        this._showAltAzGrid = value;
        return value;
    },

    get_eclipticGridColor: function () {
        return this._eclipticGridColor;
    },

    set_eclipticGridColor: function (value) {
        this._eclipticGridColor = value;
        return value;
    },

    get_galacticGridColor: function () {
        return this._galacticGridColor;
    },

    set_galacticGridColor: function (value) {
        this._galacticGridColor = value;
        return value;
    },

    get_altAzGridColor: function () {
        return this._altAzGridColor;
    },

    set_altAzGridColor: function (value) {
        this._altAzGridColor = value;
        return value;
    },

    get_precessionChartColor: function () {
        return this._precessionChartColor;
    },

    set_precessionChartColor: function (value) {
        this._precessionChartColor = value;
        return value;
    },

    get_eclipticColor: function () {
        return this._eclipticColor;
    },

    set_eclipticColor: function (value) {
        this._eclipticColor = value;
        return value;
    },

    get_equatorialGridColor: function () {
        return this._equatorialGridColor;
    },

    set_equatorialGridColor: function (value) {
        this._equatorialGridColor = value;
        return value;
    },

    get_showAltAzGridText: function () {
        return this._showAltAzGridText;
    },

    set_showAltAzGridText: function (value) {
        this._showAltAzGridText = value;
        return value;
    },

    get_showPrecessionChart: function () {
        return this._showPrecessionChart;
    },

    set_showPrecessionChart: function (value) {
        this._showPrecessionChart = value;
        return value;
    },

    get_showConstellationPictures: function () {
        return this._showConstellationPictures;
    },

    set_showConstellationPictures: function (value) {
        this._showConstellationPictures = value;
        return value;
    },

    get_showConstellationLabels: function () {
        return this._showConstellationLabels;
    },

    set_showConstellationLabels: function (value) {
        this._showConstellationLabels = value;
        return value;
    },

    get_constellationLabelsHeight: function () {
        return this._constellationLabelsHeight;
    },

    set_constellationLabelsHeight: function (value) {
        this._constellationLabelsHeight = value;
        return value;
    },

    get_solarSystemCMB: function () {
        return this._solarSystemCMB;
    },

    set_solarSystemCMB: function (value) {
        this._solarSystemCMB = value;
        return value;
    },

    get_solarSystemMinorPlanets: function () {
        return this._solarSystemMinorPlanets;
    },

    set_solarSystemMinorPlanets: function (value) {
        this._solarSystemMinorPlanets = value;
        return value;
    },

    get_solarSystemPlanets: function () {
        return this._solarSystemPlanets;
    },

    set_solarSystemPlanets: function (value) {
        this._solarSystemPlanets = value;
        return value;
    },

    get_showEarthSky: function () {
        return this._showEarthSky;
    },

    set_showEarthSky: function (value) {
        this._showEarthSky = value;
        return value;
    },

    get_solarSystemMinorOrbits: function () {
        return this._solarSystemMinorOrbits;
    },

    set_solarSystemMinorOrbits: function (value) {
        this._solarSystemMinorOrbits = value;
        return value;
    },

    get_constellationsEnabled: function () {
        return this._constellationsEnabled;
    },

    set_constellationsEnabled: function (value) {
        this._constellationsEnabled = value;
        return value;
    },

    get_constellationFiguresFilter: function () {
        return this._constellationFiguresFilter;
    },

    set_constellationFiguresFilter: function (value) {
        this._constellationFiguresFilter = value;
        return value;
    },

    get_constellationBoundariesFilter: function () {
        return this._constellationBoundariesFilter;
    },

    set_constellationBoundariesFilter: function (value) {
        this._constellationBoundariesFilter = value;
        return value;
    },

    get_constellationNamesFilter: function () {
        return this._constellationNamesFilter;
    },

    set_constellationNamesFilter: function (value) {
        this._constellationNamesFilter = value;
        return value;
    },

    get_constellationArtFilter: function () {
        return this._constellationArtFilter;
    },

    set_constellationArtFilter: function (value) {
        this._constellationArtFilter = value;
        return value;
    },

    get_showSkyOverlays: function () {
        return this._showSkyOverlays;
    },

    set_showSkyOverlays: function (value) {
        this._showSkyOverlays = value;
        return value;
    },

    get_showConstellations: function () {
        return this._showConstellations;
    },

    set_showConstellations: function (value) {
        this._showConstellations = value;
        return value;
    },

    get_showSkyNode: function () {
        return this._showSkyNode;
    },

    set_showSkyNode: function (value) {
        this._showSkyNode = value;
        return value;
    },

    get_showSkyGrids: function () {
        return this._showSkyGrids;
    },

    set_showSkyGrids: function (value) {
        this._showSkyGrids = value;
        return value;
    },

    get_showSkyOverlaysIn3d: function () {
        return this._showSkyOverlaysIn3d;
    },

    set_showSkyOverlaysIn3d: function (value) {
        this._showSkyOverlaysIn3d = value;
        return value;
    },

    get_earthCutawayView: function () {
        return this._earthCutawayView;
    },

    set_earthCutawayView: function (value) {
        this._earthCutawayView = value;
        return value;
    },

    get_showISSModel: function () {
        return this._showISSModel;
    },

    set_showISSModel: function (value) {
        this._showISSModel = value;
        return value;
    },

    get_milkyWayModel: function () {
        return this._milkyWayModel;
    },

    set_milkyWayModel: function (value) {
        this._milkyWayModel = value;
        return value;
    },

    get_minorPlanetsFilter: function () {
        return this._minorPlanetsFilter;
    },

    set_minorPlanetsFilter: function (value) {
        this._minorPlanetsFilter = value;
        return value;
    },

    get_planetOrbitsFilter: function () {
        return this._planetOrbitsFilter;
    },

    set_planetOrbitsFilter: function (value) {
        this._planetOrbitsFilter = value;
        return value;
    },

    get_constellations: function () {
        return this._constellations;
    },

    set_constellations: function (value) {
        this._constellations = value;
        return value;
    },

    getSetting: function (type) {
        if (type === 17) {
            return new SettingParameter(true, 0, !!0, null);
        }
        return new SettingParameter(false, 1, false, null);
    }
};

registerType("Settings", [Settings, Settings$, null, ISettings]);
