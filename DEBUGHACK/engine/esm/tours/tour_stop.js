// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A stop on a tour.

import { ss } from "../ss.js";
import { registerType, registerEnum, Enums } from "../typesystem.js";
import { globalScriptInterface } from "../data_globals.js";
import { XmlTextWriter } from "../utilities/xml_text_writer.js";
import { Util } from "../baseutil.js";
import { Color, Colors } from "../color.js";
import { ConstellationFilter } from "../constellation_filter.js";
import { ISettings, IUndoStep } from "../interfaces.js";
import { Place } from "../place.js";
import { Settings, SettingParameter } from "../settings.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { Guid } from "../util.js";
import { Overlay } from "./overlay.js";


// wwtlib.TransitionType

export var TransitionType = {
    slew: 0,
    crossFade: 1,
    crossCut: 2,
    fadeOutIn: 3,
    fadeIn: 4,
    fadeOut: 5
};

registerType("TransitionType", TransitionType);
registerEnum("TransitionType", TransitionType);


// wwtlib.TourStop

export function TourStop() {
    this._tourStopType = 0;
    this._keyFramed = false;
    this._tweenPosition = 0;
    this.faderOpacity = 0;
    this._owner = null;
    this._transition = 0;
    this._transitionTime = 2;
    this._transitionHoldTime = 4;
    this._transitionOutTime = 2;
    this._nextSlide = 'Next';
    this._fadeInOverlays = false;
    this._masterSlide = false;
    this._id = '';
    this._description = '';
    this._name = '';
    this._duration = 10000;
    this._interpolationType = 0;
    this._hasLocation = true;
    this._hasTime = true;
    this._startTime = SpaceTimeController.get_now();
    this._endTime = SpaceTimeController.get_now();
    this._actualPlanetScale = Settings.get_current().get_actualPlanetScale();
    this._locationAltitude = Settings.get_current().get_locationAltitude();
    this._locationLat = Settings.get_current().get_locationLat();
    this._locationLng = Settings.get_current().get_locationLng();
    this._showClouds = Settings.get_current().get_showClouds();
    this._showConstellationBoundries = Settings.get_current().get_showConstellationBoundries();
    this._showConstellationFigures = Settings.get_current().get_showConstellationFigures();
    this._showConstellationSelection = Settings.get_current().get_showConstellationSelection();
    this._showEcliptic = Settings.get_current().get_showEcliptic();
    this._showElevationModel = Settings.get_current().get_showElevationModel();
    this._showFieldOfView = Settings.get_current().get_showFieldOfView();
    this._showGrid = Settings.get_current().get_showGrid();
    this._showHorizon = Settings.get_current().get_showHorizon();
    this._showHorizonPanorama = Settings.get_current().get_showHorizonPanorama();
    this._showMoonsAsPointSource = Settings.get_current().get_showMoonsAsPointSource();
    this._showSolarSystem = Settings.get_current().get_showSolarSystem();
    this._fovTelescope = Settings.get_current().get_fovTelescope();
    this._fovEyepiece = Settings.get_current().get_fovEyepiece();
    this._fovCamera = Settings.get_current().get_fovCamera();
    this._localHorizonMode = Settings.get_current().get_localHorizonMode();
    this._galacticMode = Settings.get_current().get_galacticMode();
    this._solarSystemStars = Settings.get_current().get_solarSystemStars();
    this._solarSystemMilkyWay = Settings.get_current().get_solarSystemMilkyWay();
    this._solarSystemCosmos = Settings.get_current().get_solarSystemCosmos();
    this._solarSystemOrbits = Settings.get_current().get_solarSystemOrbits();
    this._solarSystemOverlays = Settings.get_current().get_solarSystemOverlays();
    this._solarSystemLighting = Settings.get_current().get_solarSystemLighting();
    this._solarSystemScale = Settings.get_current().get_solarSystemScale();
    this._solarSystemMultiRes = Settings.get_current().get_solarSystemMultiRes();
    this._showEquatorialGridText = Settings.get_current().get_showEquatorialGridText();
    this._showGalacticGrid = Settings.get_current().get_showGalacticGrid();
    this._showGalacticGridText = Settings.get_current().get_showGalacticGridText();
    this._showEclipticGrid = Settings.get_current().get_showEclipticGrid();
    this._showEclipticGridText = Settings.get_current().get_showEclipticGridText();
    this._showEclipticOverviewText = Settings.get_current().get_showEclipticOverviewText();
    this._showAltAzGrid = Settings.get_current().get_showAltAzGrid();
    this._showAltAzGridText = Settings.get_current().get_showAltAzGridText();
    this._showPrecessionChart = Settings.get_current().get_showPrecessionChart();
    this._showConstellationPictures = Settings.get_current().get_showConstellationPictures();
    this._showConstellationLabels = Settings.get_current().get_showConstellationLabels();
    this._solarSystemCMB = Settings.get_current().get_solarSystemCMB();
    this._solarSystemMinorPlanets = Settings.get_current().get_solarSystemMinorPlanets();
    this._solarSystemPlanets = Settings.get_current().get_solarSystemPlanets();
    this._showEarthSky = Settings.get_current().get_showEarthSky();
    this._solarSystemMinorOrbits = Settings.get_current().get_solarSystemMinorOrbits();
    this._constellationsEnabled = '';
    this._constellationFiguresFilter = Settings.get_current().get_constellationFiguresFilter().clone();
    this._constellationBoundariesFilter = Settings.get_current().get_constellationBoundariesFilter().clone();
    this._constellationNamesFilter = Settings.get_current().get_constellationNamesFilter().clone();
    this._constellationArtFilter = Settings.get_current().get_constellationArtFilter().clone();
    this._showSkyOverlays = Settings.get_current().get_showSkyOverlays();
    this._showConstellations = Settings.get_current().get_showConstellations();
    this._showSkyNode = Settings.get_current().get_showSkyNode();
    this._showSkyGrids = Settings.get_current().get_showSkyGrids();
    this._showSkyOverlaysIn3d = Settings.get_current().get_showSkyOverlaysIn3d();
    this._earthCutawayView = Settings.get_current().get_earthCutawayView();
    this._showISSModel = Settings.get_current().get_showISSModel();
    this._milkyWayModel = Settings.get_current().get_milkyWayModel();
    this._minorPlanetsFilter = Settings.get_current().get_minorPlanetsFilter();
    this._planetOrbitsFilter = Settings.get_current().get_planetOrbitsFilter();
    this._thumbnailString = '';
    this._thumbnail = null;
    this.layers = {};
    this._overlays = [];
    this._musicTrack = null;
    this._voiceTrack = null;
    this._eclipticGridColor = Colors.get_green();
    this._galacticGridColor = Colors.get_cyan();
    this._altAzGridColor = Colors.get_magenta();
    this._precessionChartColor = Colors.get_orange();
    this._eclipticColor = Colors.get_blue();
    this._equatorialGridColor = Colors.get_white();
    this._constellationLabelsHeight = 80;
    this._id = Guid.newGuid().toString();
}

TourStop.clipboardFormat = 'WorldWideTelescope.Slide';

TourStop.create = function (target) {
    var ts = new TourStop();
    ts._target = target;
    return ts;
};

TourStop.getXmlText = function (ts) {
    var writer = new XmlTextWriter();
    writer._writeProcessingInstruction('xml', "version='1.0' encoding='UTF-8'");
    ts._saveToXml(writer, true);
    writer._close();
    return writer.body;
};

TourStop._fromXml = function (owner, tourStop) {
    try {
        var newTourStop = new TourStop();
        newTourStop._owner = owner;
        newTourStop.set_id(tourStop.attributes.getNamedItem('Id').nodeValue);
        newTourStop.set_name(tourStop.attributes.getNamedItem('Name').nodeValue);
        newTourStop.set_description(tourStop.attributes.getNamedItem('Description').nodeValue);
        newTourStop._thumbnailString = tourStop.attributes.getNamedItem('Thumbnail').nodeValue;
        newTourStop._duration = Util.parseTimeSpan(tourStop.attributes.getNamedItem('Duration').nodeValue);
        if (tourStop.attributes.getNamedItem('Master') != null) {
            newTourStop._masterSlide = ss.boolean(tourStop.attributes.getNamedItem('Master').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('NextSlide') != null) {
            newTourStop._nextSlide = tourStop.attributes.getNamedItem('NextSlide').nodeValue;
        }
        if (tourStop.attributes.getNamedItem('InterpolationType') != null) {
            newTourStop.set_interpolationType(Enums.parse('InterpolationType', tourStop.attributes.getNamedItem('InterpolationType').nodeValue));
        }
        newTourStop._fadeInOverlays = true;
        if (tourStop.attributes.getNamedItem('FadeInOverlays') != null) {
            newTourStop._fadeInOverlays = ss.boolean(tourStop.attributes.getNamedItem('FadeInOverlays').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('Transition') != null) {
            newTourStop._transition = Enums.parse('TransitionType', tourStop.attributes.getNamedItem('Transition').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('HasLocation') != null) {
            newTourStop._hasLocation = ss.boolean(tourStop.attributes.getNamedItem('HasLocation').nodeValue);
        }
        if (newTourStop._hasLocation) {
            if (tourStop.attributes.getNamedItem('LocationAltitude') != null) {
                newTourStop._locationAltitude = parseFloat(tourStop.attributes.getNamedItem('LocationAltitude').nodeValue);
            }
            if (tourStop.attributes.getNamedItem('LocationLat') != null) {
                newTourStop._locationLat = parseFloat(tourStop.attributes.getNamedItem('LocationLat').nodeValue);
            }
            if (tourStop.attributes.getNamedItem('LocationLng') != null) {
                newTourStop._locationLng = parseFloat(tourStop.attributes.getNamedItem('LocationLng').nodeValue);
            }
        }
        if (tourStop.attributes.getNamedItem('HasTime') != null) {
            newTourStop._hasTime = ss.boolean(tourStop.attributes.getNamedItem('HasTime').nodeValue);
            if (newTourStop._hasTime) {
                if (tourStop.attributes.getNamedItem('StartTime') != null) {
                    newTourStop._startTime = ss.date(tourStop.attributes.getNamedItem('StartTime').nodeValue + ' UTC');
                }
                if (tourStop.attributes.getNamedItem('EndTime') != null) {
                    newTourStop._endTime = ss.date(tourStop.attributes.getNamedItem('EndTime').nodeValue + ' UTC');
                }
            }
        }
        if (tourStop.attributes.getNamedItem('ActualPlanetScale') != null) {
            newTourStop._actualPlanetScale = ss.boolean(tourStop.attributes.getNamedItem('ActualPlanetScale').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowClouds') != null) {
            newTourStop._showClouds = ss.boolean(tourStop.attributes.getNamedItem('ShowClouds').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowConstellationBoundries') != null) {
            newTourStop._showConstellationBoundries = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellationBoundries').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowConstellationFigures') != null) {
            newTourStop._showConstellationFigures = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellationFigures').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowConstellationSelection') != null) {
            newTourStop._showConstellationSelection = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellationSelection').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEcliptic') != null) {
            newTourStop._showEcliptic = ss.boolean(tourStop.attributes.getNamedItem('ShowEcliptic').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('EclipticColor') != null) {
            newTourStop._eclipticColor = Color.load(tourStop.attributes.getNamedItem('EclipticColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowElevationModel') != null) {
            newTourStop._showElevationModel = ss.boolean(tourStop.attributes.getNamedItem('ShowElevationModel').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowFieldOfView') != null) {
            newTourStop._showFieldOfView = ss.boolean(tourStop.attributes.getNamedItem('ShowFieldOfView').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowGrid') != null) {
            newTourStop._showGrid = ss.boolean(tourStop.attributes.getNamedItem('ShowGrid').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowHorizon') != null) {
            newTourStop._showHorizon = ss.boolean(tourStop.attributes.getNamedItem('ShowHorizon').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowHorizonPanorama') != null) {
            newTourStop._showHorizonPanorama = ss.boolean(tourStop.attributes.getNamedItem('ShowHorizonPanorama').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowMoonsAsPointSource') != null) {
            newTourStop._showMoonsAsPointSource = ss.boolean(tourStop.attributes.getNamedItem('ShowMoonsAsPointSource').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowSolarSystem') != null) {
            newTourStop._showSolarSystem = ss.boolean(tourStop.attributes.getNamedItem('ShowSolarSystem').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('FovTelescope') != null) {
            newTourStop._fovTelescope = parseInt(tourStop.attributes.getNamedItem('FovTelescope').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('FovEyepiece') != null) {
            newTourStop._fovEyepiece = parseInt(tourStop.attributes.getNamedItem('FovEyepiece').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('FovCamera') != null) {
            newTourStop._fovCamera = parseInt(tourStop.attributes.getNamedItem('FovCamera').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('LocalHorizonMode') != null) {
            newTourStop._localHorizonMode = ss.boolean(tourStop.attributes.getNamedItem('LocalHorizonMode').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('GalacticMode') != null) {
            newTourStop._galacticMode = ss.boolean(tourStop.attributes.getNamedItem('GalacticMode').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemStars') != null) {
            newTourStop._solarSystemStars = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemStars').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemMilkyWay') != null) {
            newTourStop._solarSystemMilkyWay = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemMilkyWay').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemCosmos') != null) {
            newTourStop._solarSystemCosmos = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemCosmos').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemOrbits') != null) {
            newTourStop._solarSystemOrbits = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemOrbits').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemOverlays') != null) {
            newTourStop._solarSystemOverlays = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemOverlays').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemLighting') != null) {
            newTourStop._solarSystemLighting = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemLighting').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemScale') != null) {
            newTourStop._solarSystemScale = parseInt(tourStop.attributes.getNamedItem('SolarSystemScale').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemMultiRes') != null) {
            newTourStop._solarSystemMultiRes = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemMultiRes').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEquatorialGridText') != null) {
            newTourStop._showEquatorialGridText = ss.boolean(tourStop.attributes.getNamedItem('ShowEquatorialGridText').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('EquatorialGridColor') != null) {
            newTourStop._equatorialGridColor = Color.load(tourStop.attributes.getNamedItem('EquatorialGridColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowGalacticGrid') != null) {
            newTourStop._showGalacticGrid = ss.boolean(tourStop.attributes.getNamedItem('ShowGalacticGrid').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowGalacticGridText') != null) {
            newTourStop._showGalacticGridText = ss.boolean(tourStop.attributes.getNamedItem('ShowGalacticGridText').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('GalacticGridColor') != null) {
            newTourStop._galacticGridColor = Color.load(tourStop.attributes.getNamedItem('GalacticGridColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEclipticGrid') != null) {
            newTourStop._showEclipticGrid = ss.boolean(tourStop.attributes.getNamedItem('ShowEclipticGrid').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEclipticGridText') != null) {
            newTourStop._showEclipticGridText = ss.boolean(tourStop.attributes.getNamedItem('ShowEclipticGridText').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('EclipticGridColor') != null) {
            newTourStop._eclipticGridColor = Color.load(tourStop.attributes.getNamedItem('EclipticGridColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEclipticOverviewText') != null) {
            newTourStop._showEclipticOverviewText = ss.boolean(tourStop.attributes.getNamedItem('ShowEclipticOverviewText').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowAltAzGrid') != null) {
            newTourStop._showAltAzGrid = ss.boolean(tourStop.attributes.getNamedItem('ShowAltAzGrid').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowAltAzGridText') != null) {
            newTourStop._showAltAzGridText = ss.boolean(tourStop.attributes.getNamedItem('ShowAltAzGridText').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('AltAzGridColor') != null) {
            newTourStop._altAzGridColor = Color.load(tourStop.attributes.getNamedItem('AltAzGridColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowPrecessionChart') != null) {
            newTourStop._showPrecessionChart = ss.boolean(tourStop.attributes.getNamedItem('ShowPrecessionChart').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('PrecessionChartColor') != null) {
            newTourStop._precessionChartColor = Color.load(tourStop.attributes.getNamedItem('PrecessionChartColor').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowConstellationPictures') != null) {
            newTourStop._showConstellationPictures = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellationPictures').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowConstellationLabels') != null) {
            newTourStop._showConstellationLabels = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellationLabels').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemCMB') != null) {
            newTourStop._solarSystemCMB = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemCMB').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemMinorPlanets') != null) {
            newTourStop._solarSystemMinorPlanets = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemMinorPlanets').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemPlanets') != null) {
            newTourStop._solarSystemPlanets = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemPlanets').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowEarthSky') != null) {
            newTourStop._showEarthSky = ss.boolean(tourStop.attributes.getNamedItem('ShowEarthSky').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('SolarSystemMinorOrbits') != null) {
            newTourStop._solarSystemMinorOrbits = ss.boolean(tourStop.attributes.getNamedItem('SolarSystemMinorOrbits').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowSkyOverlays') != null) {
            newTourStop._showSkyOverlays = ss.boolean(tourStop.attributes.getNamedItem('ShowSkyOverlays').nodeValue);
        } else {
            newTourStop._showSkyOverlays = true;
        }
        if (tourStop.attributes.getNamedItem('ShowConstellations') != null) {
            newTourStop._showConstellations = ss.boolean(tourStop.attributes.getNamedItem('ShowConstellations').nodeValue);
        } else {
            newTourStop._showConstellations = true;
        }
        if (tourStop.attributes.getNamedItem('ShowSkyNode') != null) {
            newTourStop._showSkyNode = ss.boolean(tourStop.attributes.getNamedItem('ShowSkyNode').nodeValue);
        } else {
            newTourStop._showSkyNode = true;
        }
        if (tourStop.attributes.getNamedItem('ShowSkyGrids') != null) {
            newTourStop._showSkyGrids = ss.boolean(tourStop.attributes.getNamedItem('ShowSkyGrids').nodeValue);
        } else {
            newTourStop._showSkyGrids = true;
        }
        if (tourStop.attributes.getNamedItem('ShowSkyOverlaysIn3d') != null) {
            newTourStop._showSkyOverlaysIn3d = ss.boolean(tourStop.attributes.getNamedItem('ShowSkyOverlaysIn3d').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('EarthCutawayView') != null) {
            newTourStop._earthCutawayView = ss.boolean(tourStop.attributes.getNamedItem('EarthCutawayView').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ShowISSModel') != null) {
            newTourStop._showISSModel = ss.boolean(tourStop.attributes.getNamedItem('ShowISSModel').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('MilkyWayModel') != null) {
            newTourStop._milkyWayModel = ss.boolean(tourStop.attributes.getNamedItem('MilkyWayModel').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('ConstellationBoundariesFilter') != null) {
            newTourStop._constellationBoundariesFilter = ConstellationFilter.parse(tourStop.attributes.getNamedItem('ConstellationBoundariesFilter').nodeValue);
        } else {
            newTourStop._constellationBoundariesFilter = ConstellationFilter.get_allConstellation();
        }
        if (tourStop.attributes.getNamedItem('ConstellationBoundariesFilter') != null) {
            newTourStop._constellationFiguresFilter = ConstellationFilter.parse(tourStop.attributes.getNamedItem('ConstellationBoundariesFilter').nodeValue);
        } else {
            newTourStop._constellationFiguresFilter = new ConstellationFilter();
        }
        if (tourStop.attributes.getNamedItem('ConstellationNamesFilter') != null) {
            newTourStop._constellationNamesFilter = ConstellationFilter.parse(tourStop.attributes.getNamedItem('ConstellationNamesFilter').nodeValue);
        } else {
            newTourStop._constellationNamesFilter = new ConstellationFilter();
        }
        if (tourStop.attributes.getNamedItem('ConstellationArtFilter') != null) {
            newTourStop._constellationArtFilter = ConstellationFilter.parse(tourStop.attributes.getNamedItem('ConstellationArtFilter').nodeValue);
        } else {
            newTourStop._constellationArtFilter = new ConstellationFilter();
        }
        if (tourStop.attributes.getNamedItem('MinorPlanetsFilter') != null) {
            newTourStop._minorPlanetsFilter = parseInt(tourStop.attributes.getNamedItem('MinorPlanetsFilter').nodeValue);
        }
        if (tourStop.attributes.getNamedItem('PlanetOrbitsFilter') != null) {
            newTourStop._planetOrbitsFilter = parseInt(tourStop.attributes.getNamedItem('PlanetOrbitsFilter').nodeValue);
        }
        var place = Util.selectSingleNode(tourStop, 'Place');
        newTourStop._target = Place._fromXml(place);
        var endTarget = Util.selectSingleNode(tourStop, 'EndTarget');
        if (endTarget != null) {
            newTourStop._endTarget = Place._fromXml(endTarget);
        }
        var overlays = Util.selectSingleNode(tourStop, 'Overlays');
        var $enum1 = ss.enumerate(overlays.childNodes);
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            if (overlay.nodeName === 'Overlay') {
                newTourStop.addOverlay(Overlay._fromXml(newTourStop, overlay));
            }
        }
        var musicNode = Util.selectSingleNode(tourStop, 'MusicTrack');
        if (musicNode != null) {
            newTourStop._musicTrack = Overlay._fromXml(newTourStop, Util.selectSingleNode(musicNode, 'Overlay'));
        }
        var voiceNode = Util.selectSingleNode(tourStop, 'VoiceTrack');
        if (voiceNode != null) {
            newTourStop._voiceTrack = Overlay._fromXml(newTourStop, Util.selectSingleNode(voiceNode, 'Overlay'));
        }
        var layerNode = Util.selectSingleNode(tourStop, 'VisibleLayers');
        if (layerNode != null) {
            newTourStop._loadLayerList(layerNode);
        }
        newTourStop._thumbnail = owner.getCachedTexture(ss.format('{0}.thumb.png', newTourStop._id), function () {
            var c = 0;
        });
        return newTourStop;
    }
    catch (ex) {
        globalScriptInterface._fireTourError(ex);
        return null;
    }
};

var TourStop$ = {
    get_keyFramed: function () {
        return this._keyFramed;
    },

    get_tourStopType: function () {
        if (this._target.get_backgroundImageset() != null) {
            return this._target.get_backgroundImageset().get_dataSetType();
        } else {
            return this._tourStopType;
        }
    },

    set_tourStopType: function (value) {
        if (this._target.get_backgroundImageset() != null) {
            if (this._target.get_backgroundImageset().get_dataSetType() !== value) {
                this._target.set_backgroundImageset(null);
            }
        }
        this._tourStopType = value;
        return value;
    },

    get_tweenPosition: function () {
        return this._tweenPosition;
    },

    set_tweenPosition: function (value) {
        if (this._tweenPosition !== value) {
            this._tweenPosition = Math.max(0, Math.min(1, value));
            this.updateTweenPosition();
        }
        return value;
    },

    updateTweenPosition: function () {
        if (this.get_keyFramed()) {
        }
    },

    copy: function () {
        var writer = new XmlTextWriter();
        writer._writeProcessingInstruction('xml', "version='1.0' encoding='UTF-8'");
        this._saveToXml(writer, true);
        try {
            var xParser = new DOMParser();
            var doc = xParser.parseFromString(writer.body, 'text/xml');
            var node = Util.selectSingleNode(doc, 'TourStop');
            var ts = TourStop._fromXml(this.get_owner(), node);
            ts.set_id(Guid.newGuid().toString());
            return ts;
        }
        catch ($e1) {
        }
        return null;
    },

    get_owner: function () {
        return this._owner;
    },

    set_owner: function (value) {
        this._owner = value;
        return value;
    },

    get__transition: function () {
        return this._transition;
    },

    set__transition: function (value) {
        if (this._transition !== value) {
            this._transition = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get__transitionTime: function () {
        return this._transitionTime;
    },

    set__transitionTime: function (value) {
        if (this._transitionTime !== value) {
            this._transitionTime = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get__transitionHoldTime: function () {
        return this._transitionHoldTime;
    },

    set__transitionHoldTime: function (value) {
        if (this._transitionHoldTime !== value) {
            this._transitionHoldTime = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get__transitionOutTime: function () {
        return this._transitionOutTime;
    },

    set__transitionOutTime: function (value) {
        if (this._transitionOutTime !== value) {
            this._transitionOutTime = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_nextSlide: function () {
        return this._nextSlide;
    },

    set_nextSlide: function (value) {
        this._nextSlide = value;
        return value;
    },

    get_isLinked: function () {
        if (this._nextSlide == null || this._nextSlide === 'Next' || !this._nextSlide) {
            return false;
        }
        return true;
    },

    get_fadeInOverlays: function () {
        return this._fadeInOverlays;
    },

    set_fadeInOverlays: function (value) {
        this._fadeInOverlays = value;
        return value;
    },

    get_masterSlide: function () {
        return this._masterSlide;
    },

    set_masterSlide: function (value) {
        if (this._masterSlide !== value) {
            this._masterSlide = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_id: function () {
        return this._id;
    },

    set_id: function (value) {
        this._id = value;
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
        return value;
    },

    toString: function () {
        if (this._target != null) {
            return this.get_target().get_name();
        } else {
            return this._description;
        }
    },

    get_description: function () {
        return this._description;
    },

    set_description: function (value) {
        if (this._description !== value) {
            this._description = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_name: function () {
        if (this._target != null) {
            return this._target.get_name();
        }
        return this._name;
    },

    set_name: function (value) {
        if (this._name !== value) {
            this._name = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_duration: function () {
        return this._duration;
    },

    set_duration: function (value) {
        if (this._duration !== value) {
            this._duration = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_target: function () {
        return this._target;
    },

    set_target: function (value) {
        if (this._target !== value) {
            this._target = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_endTarget: function () {
        return this._endTarget;
    },

    set_endTarget: function (value) {
        if (this._endTarget !== value) {
            this._endTarget = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_interpolationType: function () {
        return this._interpolationType;
    },

    set_interpolationType: function (value) {
        this._interpolationType = value;
        return value;
    },

    get_hasLocation: function () {
        return this._hasTime;
    },

    set_hasLocation: function (value) {
        if (this._hasLocation !== value) {
            this._hasLocation = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_hasTime: function () {
        return this._hasTime;
    },

    set_hasTime: function (value) {
        if (this._hasTime !== value) {
            this._hasTime = this._hasLocation = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_startTime: function () {
        return this._startTime;
    },

    set_startTime: function (value) {
        this._startTime = value;
        if (!ss.compareDates(this._startTime, value)) {
            this._startTime = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_endTime: function () {
        return this._endTime;
    },

    set_endTime: function (value) {
        if (!ss.compareDates(this._endTime, value)) {
            this._endTime = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    captureSettings: function () {
        this._startTime = SpaceTimeController.get_now();
        this._actualPlanetScale = Settings.get_current().get_actualPlanetScale();
        this._locationAltitude = Settings.get_current().get_locationAltitude();
        this._locationLat = Settings.get_current().get_locationLat();
        this._locationLng = Settings.get_current().get_locationLng();
        this._showClouds = Settings.get_current().get_showClouds();
        this._showConstellationBoundries = Settings.get_current().get_showConstellationBoundries();
        this._showConstellationFigures = Settings.get_current().get_showConstellationFigures();
        this._showConstellationSelection = Settings.get_current().get_showConstellationSelection();
        this._showEcliptic = Settings.get_current().get_showEcliptic();
        this._showElevationModel = Settings.get_current().get_showElevationModel();
        this._showFieldOfView = Settings.get_current().get_showFieldOfView();
        this._showGrid = Settings.get_current().get_showGrid();
        this._showHorizon = Settings.get_current().get_showHorizon();
        this._showHorizonPanorama = Settings.get_current().get_showHorizonPanorama();
        this._showMoonsAsPointSource = Settings.get_current().get_showMoonsAsPointSource();
        this._showSolarSystem = Settings.get_current().get_showSolarSystem();
        this._fovTelescope = Settings.get_current().get_fovTelescope();
        this._fovEyepiece = Settings.get_current().get_fovEyepiece();
        this._fovCamera = Settings.get_current().get_fovCamera();
        this._localHorizonMode = Settings.get_current().get_localHorizonMode();
        this._galacticMode = Settings.get_current().get_galacticMode();
        this._solarSystemStars = Settings.get_current().get_solarSystemStars();
        this._solarSystemMilkyWay = Settings.get_current().get_solarSystemMilkyWay();
        this._solarSystemCosmos = Settings.get_current().get_solarSystemCosmos();
        this._solarSystemOrbits = Settings.get_current().get_solarSystemOrbits();
        this._solarSystemOverlays = Settings.get_current().get_solarSystemOverlays();
        this._solarSystemLighting = Settings.get_current().get_solarSystemLighting();
        this._solarSystemScale = Settings.get_current().get_solarSystemScale();
        this._solarSystemMultiRes = Settings.get_current().get_solarSystemMultiRes();
        this._showEquatorialGridText = Settings.get_current().get_showEquatorialGridText();
        this._showGalacticGrid = Settings.get_current().get_showGalacticGrid();
        this._showGalacticGridText = Settings.get_current().get_showGalacticGridText();
        this._showEclipticGrid = Settings.get_current().get_showEclipticGrid();
        this._showEclipticGridText = Settings.get_current().get_showEclipticGridText();
        this._showEclipticOverviewText = Settings.get_current().get_showEclipticOverviewText();
        this._showAltAzGrid = Settings.get_current().get_showAltAzGrid();
        this._showAltAzGridText = Settings.get_current().get_showAltAzGridText();
        this._showPrecessionChart = Settings.get_current().get_showPrecessionChart();
        this._showConstellationPictures = Settings.get_current().get_showConstellationPictures();
        this._showConstellationLabels = Settings.get_current().get_showConstellationLabels();
        this._solarSystemCMB = Settings.get_current().get_solarSystemCMB();
        this._solarSystemMinorPlanets = Settings.get_current().get_solarSystemMinorPlanets();
        this._solarSystemPlanets = Settings.get_current().get_solarSystemPlanets();
        this._showEarthSky = Settings.get_current().get_showEarthSky();
        this._solarSystemMinorOrbits = Settings.get_current().get_solarSystemMinorOrbits();
        this._constellationFiguresFilter = Settings.get_current().get_constellationFiguresFilter().clone();
        this._constellationBoundariesFilter = Settings.get_current().get_constellationBoundariesFilter().clone();
        this._constellationNamesFilter = Settings.get_current().get_constellationNamesFilter().clone();
        this._constellationArtFilter = Settings.get_current().get_constellationArtFilter().clone();
        this._showSkyOverlays = Settings.get_current().get_showSkyOverlays();
        this._showConstellations = Settings.get_current().get_showConstellations();
        this._showSkyNode = Settings.get_current().get_showSkyNode();
        this._showSkyGrids = Settings.get_current().get_showSkyGrids();
        this._showSkyOverlaysIn3d = Settings.get_current().get_showSkyOverlaysIn3d();
        this._earthCutawayView = Settings.get_current().get_earthCutawayView();
        this._showISSModel = Settings.get_current().get_showISSModel();
        this._milkyWayModel = Settings.get_current().get_milkyWayModel();
        this._minorPlanetsFilter = Settings.get_current().get_minorPlanetsFilter();
        this._planetOrbitsFilter = Settings.get_current().get_planetOrbitsFilter();
    },

    syncSettings: function () {
        Settings.get_globalSettings().set_actualPlanetScale(this._actualPlanetScale);
        Settings.get_globalSettings().set_locationAltitude(this._locationAltitude);
        Settings.get_globalSettings().set_locationLat(this._locationLat);
        Settings.get_globalSettings().set_locationLng(this._locationLng);
        Settings.get_globalSettings().set_earthCutawayView(this._earthCutawayView);
        Settings.get_globalSettings().set_showConstellationBoundries(this._showConstellationBoundries);
        Settings.get_globalSettings().set_showConstellationFigures(this._showConstellationFigures);
        Settings.get_globalSettings().set_showConstellationSelection(this._showConstellationSelection);
        Settings.get_globalSettings().set_showEcliptic(this._showEcliptic);
        Settings.get_globalSettings().set_showElevationModel(this._showElevationModel);
        Settings.get_globalSettings().set_showGrid(this._showGrid);
        Settings.get_globalSettings().set_showHorizon(this._showHorizon);
        Settings.get_globalSettings().set_showSolarSystem(this._showSolarSystem);
        Settings.get_globalSettings().set_localHorizonMode(this._localHorizonMode);
        Settings.get_globalSettings().set_galacticMode(this._galacticMode);
        Settings.get_globalSettings().set_solarSystemStars(this._solarSystemStars);
        Settings.get_globalSettings().set_solarSystemMilkyWay(this._solarSystemMilkyWay);
        Settings.get_globalSettings().set_solarSystemCosmos(this._solarSystemCosmos);
        Settings.get_globalSettings().set_solarSystemCMB(this._solarSystemCMB);
        Settings.get_globalSettings().set_solarSystemOrbits(this._solarSystemOrbits);
        Settings.get_globalSettings().set_solarSystemMinorOrbits(this._solarSystemMinorOrbits);
        Settings.get_globalSettings().set_solarSystemMinorPlanets(this._solarSystemMinorPlanets);
        Settings.get_globalSettings().set_solarSystemOverlays(this._solarSystemOverlays);
        Settings.get_globalSettings().set_solarSystemLighting(this._solarSystemLighting);
        Settings.get_globalSettings().set_showISSModel(this._showISSModel);
        Settings.get_globalSettings().set_solarSystemScale(this._solarSystemScale);
        Settings.get_globalSettings().set_solarSystemMultiRes(this._solarSystemMultiRes);
        Settings.get_globalSettings().set_showEarthSky(this._showEarthSky);
        Settings.get_globalSettings().set_minorPlanetsFilter(this._minorPlanetsFilter);
        Settings.get_globalSettings().set_planetOrbitsFilter(this._planetOrbitsFilter);
        Settings.get_globalSettings().set_showEquatorialGridText(this._showEquatorialGridText);
        Settings.get_globalSettings().set_showGalacticGrid(this._showGalacticGrid);
        Settings.get_globalSettings().set_showGalacticGridText(this._showGalacticGridText);
        Settings.get_globalSettings().set_showEclipticGrid(this._showEclipticGrid);
        Settings.get_globalSettings().set_showEclipticGridText(this._showEclipticGridText);
        Settings.get_globalSettings().set_showEclipticOverviewText(this._showEclipticOverviewText);
        Settings.get_globalSettings().set_showAltAzGrid(this._showAltAzGrid);
        Settings.get_globalSettings().set_showAltAzGridText(this._showAltAzGridText);
        Settings.get_globalSettings().set_showPrecessionChart(this._showPrecessionChart);
        Settings.get_globalSettings().set_showConstellationPictures(this._showConstellationPictures);
        Settings.get_globalSettings().set_constellationsEnabled(this._constellationsEnabled);
        Settings.get_globalSettings().set_showSkyOverlays(this._showSkyOverlays);
        Settings.get_globalSettings().set_constellations(this._showConstellations);
        Settings.get_globalSettings().set_showSkyNode(this._showSkyNode);
        Settings.get_globalSettings().set_showSkyGrids(this._showSkyGrids);
        Settings.get_globalSettings().set_constellationFiguresFilter(this._constellationFiguresFilter.clone());
        Settings.get_globalSettings().set_constellationBoundariesFilter(this._constellationBoundariesFilter.clone());
        Settings.get_globalSettings().set_constellationNamesFilter(this._constellationNamesFilter.clone());
        Settings.get_globalSettings().set_constellationArtFilter(this._constellationArtFilter.clone());
    },

    get_solarSystemStars: function () {
        return this._solarSystemStars;
    },

    get_solarSystemMultiRes: function () {
        return this._solarSystemMultiRes;
    },

    get_solarSystemMilkyWay: function () {
        return this._solarSystemMilkyWay;
    },

    get_solarSystemCosmos: function () {
        return this._solarSystemCosmos;
    },

    get_solarSystemOrbits: function () {
        return this._solarSystemOrbits;
    },

    get_solarSystemOverlays: function () {
        return this._solarSystemOverlays;
    },

    get_solarSystemLighting: function () {
        return this._solarSystemLighting;
    },

    get_solarSystemScale: function () {
        return this._solarSystemScale;
    },

    get_actualPlanetScale: function () {
        return this._actualPlanetScale;
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
        if (this._hasLocation) {
            return this._locationAltitude;
        } else {
            return Settings.get_current().get_locationAltitude();
        }
    },

    get_locationLat: function () {
        if (this._hasLocation) {
            return this._locationLat;
        } else {
            return Settings.get_current().get_locationLat();
        }
    },

    get_locationLng: function () {
        if (this._hasLocation) {
            return this._locationLng;
        } else {
            return Settings.get_current().get_locationLng();
        }
    },

    get_showClouds: function () {
        return this._showClouds;
    },

    get_showConstellationBoundries: function () {
        return this._showConstellationBoundries;
    },

    get_showConstellationFigures: function () {
        return this._showConstellationFigures;
    },

    get_showConstellationSelection: function () {
        return this._showConstellationSelection;
    },

    get_showEcliptic: function () {
        return this._showEcliptic;
    },

    get_showElevationModel: function () {
        return this._showElevationModel;
    },

    get_showFieldOfView: function () {
        return this._showFieldOfView;
    },

    get_showGrid: function () {
        return this._showGrid;
    },

    get_showHorizon: function () {
        return this._showHorizon;
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

    get_localHorizonMode: function () {
        return this._localHorizonMode;
    },

    get_galacticMode: function () {
        return this._galacticMode;
    },

    get_thumbnail: function () {
        if (this._target != null && this._thumbnail == null) {
            return null;
        }
        return this._thumbnail;
    },

    set_thumbnail: function (value) {
        this._thumbnail = value;
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
        return value;
    },

    get_overlays: function () {
        return this._overlays;
    },

    get_musicTrack: function () {
        return this._musicTrack;
    },

    set_musicTrack: function (value) {
        if (this._musicTrack !== value) {
            this._musicTrack = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    get_voiceTrack: function () {
        return this._voiceTrack;
    },

    set_voiceTrack: function (value) {
        if (this._voiceTrack !== value) {
            this._voiceTrack = value;
            if (this._owner != null) {
                this._owner.set_tourDirty(true);
            }
        }
        return value;
    },

    addOverlay: function (overlay) {
        if (overlay == null) {
            return;
        }
        overlay.set_owner(this);
        this._overlays.push(overlay);
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    removeOverlay: function (overlay) {
        ss.remove(this._overlays, overlay);
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    cleanUp: function () {
        // "todo this needs to be evaluated. Causes major pain in WebClient"
        var $enum1 = ss.enumerate(this.get_overlays());
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            overlay.cleanUp();
        }
        if (this._voiceTrack != null) {
            this._voiceTrack.cleanUp();
        }
        if (this._musicTrack != null) {
            this._musicTrack.cleanUp();
        }
    },

    sendToBack: function (target) {
        ss.remove(this._overlays, target);
        this._overlays.splice(0, 0, target);
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    bringToFront: function (target) {
        ss.remove(this._overlays, target);
        this._overlays.push(target);
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    bringForward: function (target) {
        var index = this._overlays.indexOf(target);
        if (index < this._overlays.length - 1) {
            ss.remove(this._overlays, target);
            this._overlays.splice(index + 1, 0, target);
        }
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    sendBackward: function (target) {
        var index = this._overlays.indexOf(target);
        if (index > 0) {
            ss.remove(this._overlays, target);
            this._overlays.splice(index - 1, 0, target);
        }
        if (this._owner != null) {
            this._owner.set_tourDirty(true);
        }
    },

    getNextOverlay: function (current) {
        if (current == null) {
            if (this._overlays.length > 0) {
                return this._overlays[0];
            }
            else {
                return null;
            }
        }
        var index = this._overlays.indexOf(current);
        if (index < this._overlays.length - 1) {
            return this._overlays[index + 1];
        } else {
            return this._overlays[0];
        }
    },

    getPerviousOverlay: function (current) {
        if (current == null) {
            if (this._overlays.length > 0) {
                return this._overlays[0];
            }
            else {
                return null;
            }
        }
        var index = this._overlays.indexOf(current);
        if (index > 0) {
            return this._overlays[index - 1];
        } else {
            return this._overlays[this._overlays.length - 1];
        }
    },

    getOverlayById: function (id) {
        var $enum1 = ss.enumerate(this._overlays);
        while ($enum1.moveNext()) {
            var ol = $enum1.current;
            if (ol.id === id) {
                return ol;
            }
        }
        return null;
    },

    get_tourStopThumbnailFilename: function () {
        return ss.format('{0}.thumb.png', this._id);
    },

    _saveToXml: function (xmlWriter, saveContent) {
        if (saveContent) {
            if (this._thumbnail != null) {
            }
        }
        xmlWriter._writeStartElement('TourStop');
        xmlWriter._writeAttributeString('Id', this._id);
        xmlWriter._writeAttributeString('Name', this._name);
        xmlWriter._writeAttributeString('Description', this._description);
        xmlWriter._writeAttributeString('Thumbnail', this._thumbnailString);
        xmlWriter._writeAttributeString('Duration', Util.xmlDuration(this._duration));
        xmlWriter._writeAttributeString('Master', this._masterSlide.toString());
        xmlWriter._writeAttributeString('TransitionType', Enums.toXml('TransitionType', this._transition));
        xmlWriter._writeAttributeString('TransitionTime', this._transitionTime.toString());
        xmlWriter._writeAttributeString('TransitionOutTime', this._transitionOutTime.toString());
        xmlWriter._writeAttributeString('TransitionHoldTime', this._transitionHoldTime.toString());
        xmlWriter._writeAttributeString('NextSlide', this._nextSlide);
        xmlWriter._writeAttributeString('InterpolationType', Enums.toXml('InterpolationType', this._interpolationType));
        xmlWriter._writeAttributeString('HasLocation', this._hasLocation.toString());
        if (this._hasLocation) {
            xmlWriter._writeAttributeString('LocationAltitude', this._locationAltitude.toString());
            xmlWriter._writeAttributeString('LocationLat', this._locationLat.toString());
            xmlWriter._writeAttributeString('LocationLng', this._locationLng.toString());
        }
        xmlWriter._writeAttributeString('HasTime', this._hasTime.toString());
        if (this._hasTime) {
            xmlWriter._writeAttributeString('StartTime', Util.xmlDate(this._startTime));
            xmlWriter._writeAttributeString('EndTime', Util.xmlDate(this._endTime));
        }
        xmlWriter._writeAttributeString('ActualPlanetScale', this._actualPlanetScale.toString());
        xmlWriter._writeAttributeString('ShowClouds', this._showClouds.toString());
        xmlWriter._writeAttributeString('EarthCutawayView', this._earthCutawayView.toString());
        xmlWriter._writeAttributeString('ShowConstellationBoundries', this._showConstellationBoundries.toString());
        xmlWriter._writeAttributeString('ShowConstellationFigures', this._showConstellationFigures.toString());
        xmlWriter._writeAttributeString('ShowConstellationSelection', this._showConstellationSelection.toString());
        xmlWriter._writeAttributeString('ShowEcliptic', this._showEcliptic.toString());
        xmlWriter._writeAttributeString('EclipticColor', this._eclipticColor.save());
        xmlWriter._writeAttributeString('ShowElevationModel', this._showElevationModel.toString());
        this._showFieldOfView = false;
        xmlWriter._writeAttributeString('ShowFieldOfView', this._showFieldOfView.toString());
        xmlWriter._writeAttributeString('ShowGrid', this._showGrid.toString());
        xmlWriter._writeAttributeString('ShowHorizon', this._showHorizon.toString());
        xmlWriter._writeAttributeString('ShowHorizonPanorama', this._showHorizonPanorama.toString());
        xmlWriter._writeAttributeString('ShowMoonsAsPointSource', this._showMoonsAsPointSource.toString());
        xmlWriter._writeAttributeString('ShowSolarSystem', this._showSolarSystem.toString());
        xmlWriter._writeAttributeString('FovTelescope', this._fovTelescope.toString());
        xmlWriter._writeAttributeString('FovEyepiece', this._fovEyepiece.toString());
        xmlWriter._writeAttributeString('FovCamera', this._fovCamera.toString());
        xmlWriter._writeAttributeString('LocalHorizonMode', this._localHorizonMode.toString());
        xmlWriter._writeAttributeString('GalacticMode', this._galacticMode.toString());
        xmlWriter._writeAttributeString('FadeInOverlays', this._fadeInOverlays.toString());
        xmlWriter._writeAttributeString('SolarSystemStars', this._solarSystemStars.toString());
        xmlWriter._writeAttributeString('SolarSystemMilkyWay', this._solarSystemMilkyWay.toString());
        xmlWriter._writeAttributeString('SolarSystemCosmos', this._solarSystemCosmos.toString());
        xmlWriter._writeAttributeString('SolarSystemCMB', this._solarSystemCMB.toString());
        xmlWriter._writeAttributeString('SolarSystemOrbits', this._solarSystemOrbits.toString());
        xmlWriter._writeAttributeString('SolarSystemMinorOrbits', this._solarSystemMinorOrbits.toString());
        xmlWriter._writeAttributeString('SolarSystemOverlays', this._solarSystemOverlays.toString());
        xmlWriter._writeAttributeString('SolarSystemLighting', this._solarSystemLighting.toString());
        xmlWriter._writeAttributeString('ShowISSModel', this._showISSModel.toString());
        xmlWriter._writeAttributeString('SolarSystemScale', this._solarSystemScale.toString());
        xmlWriter._writeAttributeString('MinorPlanetsFilter', this._minorPlanetsFilter.toString());
        xmlWriter._writeAttributeString('PlanetOrbitsFilter', this._planetOrbitsFilter.toString());
        xmlWriter._writeAttributeString('SolarSystemMultiRes', this._solarSystemMultiRes.toString());
        xmlWriter._writeAttributeString('SolarSystemMinorPlanets', this._solarSystemMinorPlanets.toString());
        xmlWriter._writeAttributeString('SolarSystemPlanets', this._solarSystemPlanets.toString());
        xmlWriter._writeAttributeString('ShowEarthSky', this._showEarthSky.toString());
        xmlWriter._writeAttributeString('ShowEquatorialGridText', this.get_showEquatorialGridText().toString());
        xmlWriter._writeAttributeString('EquatorialGridColor', this.get_equatorialGridColor().save());
        xmlWriter._writeAttributeString('ShowGalacticGrid', this.get_showGalacticGrid().toString());
        xmlWriter._writeAttributeString('ShowGalacticGridText', this.get_showGalacticGridText().toString());
        xmlWriter._writeAttributeString('GalacticGridColor', this.get_galacticGridColor().save());
        xmlWriter._writeAttributeString('ShowEclipticGrid', this.get_showEclipticGrid().toString());
        xmlWriter._writeAttributeString('ShowEclipticGridText', this.get_showEclipticGridText().toString());
        xmlWriter._writeAttributeString('EclipticGridColor', this.get_eclipticGridColor().save());
        xmlWriter._writeAttributeString('ShowEclipticOverviewText', this.get_showEclipticOverviewText().toString());
        xmlWriter._writeAttributeString('ShowAltAzGrid', this.get_showAltAzGrid().toString());
        xmlWriter._writeAttributeString('ShowAltAzGridText', this.get_showAltAzGridText().toString());
        xmlWriter._writeAttributeString('AltAzGridColor', this.get_altAzGridColor().save());
        xmlWriter._writeAttributeString('ShowPrecessionChart', this.get_showPrecessionChart().toString());
        xmlWriter._writeAttributeString('PrecessionChartColor', this.get_precessionChartColor().save());
        xmlWriter._writeAttributeString('ConstellationPictures', this.get_showConstellationPictures().toString());
        xmlWriter._writeAttributeString('ConstellationsEnabled', this.get_constellationsEnabled());
        xmlWriter._writeAttributeString('ShowConstellationLabels', this.get_showConstellationLabels().toString());
        xmlWriter._writeAttributeString('ShowSkyOverlays', this.get_showSkyOverlays().toString());
        xmlWriter._writeAttributeString('ShowConstellations', this.get_showConstellations().toString());
        xmlWriter._writeAttributeString('ShowSkyNode', this.get_showSkyNode().toString());
        xmlWriter._writeAttributeString('ShowSkyGrids', this.get_showSkyGrids().toString());
        xmlWriter._writeAttributeString('SkyOverlaysIn3d', this.get_showSkyOverlaysIn3d().toString());
        xmlWriter._writeAttributeString('ConstellationFiguresFilter', this._constellationFiguresFilter.toString());
        xmlWriter._writeAttributeString('ConstellationBoundariesFilter', this._constellationBoundariesFilter.toString());
        xmlWriter._writeAttributeString('ConstellationNamesFilter', this._constellationNamesFilter.toString());
        xmlWriter._writeAttributeString('ConstellationArtFilter', this._constellationArtFilter.toString());
        this._target._saveToXml(xmlWriter, 'Place');
        if (this._endTarget != null) {
            this._endTarget._saveToXml(xmlWriter, 'EndTarget');
        }
        xmlWriter._writeStartElement('Overlays');
        var $enum1 = ss.enumerate(this._overlays);
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            overlay.saveToXml(xmlWriter, false);
        }
        xmlWriter._writeEndElement();
        if (this._musicTrack != null) {
            xmlWriter._writeStartElement('MusicTrack');
            this._musicTrack.saveToXml(xmlWriter, false);
            xmlWriter._writeEndElement();
        }
        if (this._voiceTrack != null) {
            xmlWriter._writeStartElement('VoiceTrack');
            this._voiceTrack.saveToXml(xmlWriter, false);
            xmlWriter._writeEndElement();
        }
        this._writeLayerList(xmlWriter);
        xmlWriter._writeEndElement();
    },

    _writeLayerList: function (xmlWriter) {
        if (ss.keyCount(this.layers) > 0) {
            xmlWriter._writeStartElement('VisibleLayers');
            var $enum1 = ss.enumerate(ss.keys(this.layers));
            while ($enum1.moveNext()) {
                var key = $enum1.current;
                var info = this.layers[key];
                xmlWriter._writeStartElement('Layer');
                xmlWriter._writeAttributeString('StartOpacity', info.startOpacity.toString());
                xmlWriter._writeAttributeString('EndOpacity', info.endOpacity.toString());
                var len = info.startParams.length;
                xmlWriter._writeAttributeString('ParamCount', len.toString());
                for (var i = 0; i < len; i++) {
                    xmlWriter._writeAttributeString(ss.format('StartParam{0}', i), info.startParams[i].toString());
                    xmlWriter._writeAttributeString(ss.format('EndParam{0}', i), info.endParams[i].toString());
                }
                xmlWriter._writeValue(info.id.toString());
                xmlWriter._writeEndElement();
            }
            xmlWriter._writeEndElement();
        }
    },

    _addFilesToCabinet: function (fc, excludeAudio) {
        if (this._thumbnail != null) {
            var filename = ss.format('{0}.thumb.png', this._id);
            var blob = this._owner.getFileBlob(filename);
            fc.addFile(this._owner.get_workingDirectory() + filename, blob);
        }
        if (!excludeAudio) {
            if (this._musicTrack != null) {
                this._musicTrack.addFilesToCabinet(fc);
            }
            if (this._voiceTrack != null) {
                this._voiceTrack.addFilesToCabinet(fc);
            }
        }
        var $enum1 = ss.enumerate(this._overlays);
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            overlay.addFilesToCabinet(fc);
        }
    },

    getNextDefaultName: function (baseName) {
        var suffixId = 1;
        var $enum1 = ss.enumerate(this._overlays);
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            if (ss.startsWith(overlay.get_name(), baseName)) {
                var id = 0;
                try {
                    id = parseInt(overlay.get_name().substr(baseName.length));
                }
                catch ($e2) {
                }
                if (id >= suffixId) {
                    suffixId = id + 1;
                }
            }
        }
        return ss.format('{0} {1}', baseName, suffixId);
    },

    _loadLayerList: function (layersNode) {
        var $enum1 = ss.enumerate(layersNode.childNodes);
        while ($enum1.moveNext()) {
            var layer = $enum1.current;
            if (layer.nodeName === 'Layer') {
                var info = new LayerInfo();
                var id = layer.innerHTML;
                info.id = Guid.fromString(id);
                info.startOpacity = parseFloat(layer.attributes.getNamedItem('StartOpacity').nodeValue);
                info.endOpacity = parseFloat(layer.attributes.getNamedItem('EndOpacity').nodeValue);
                var len = 0;
                if (layer.attributes.getNamedItem('ParamCount') != null) {
                    len = parseInt(layer.attributes.getNamedItem('ParamCount').nodeValue);
                }
                info.startParams = new Array(len);
                info.endParams = new Array(len);
                info.frameParams = new Array(len);
                for (var i = 0; i < len; i++) {
                    info.startParams[i] = parseFloat(layer.attributes.getNamedItem(ss.format('StartParam{0}', i)).nodeValue);
                    info.endParams[i] = parseFloat(layer.attributes.getNamedItem(ss.format('EndParam{0}', i)).nodeValue);
                    info.frameParams[i] = info.startParams[i];
                }
                this.layers[info.id] = info;
            }
        }
    },

    _updateLayerOpacity: function () {
        if (!this.get_keyFramed()) {
        } else {
            this.updateTweenPosition();
        }
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

    getSetting: function (type) {
        if (type === 17) {
            return new SettingParameter(true, this.faderOpacity, !!this.faderOpacity, null);
        }
        return new SettingParameter(false, 1, false, null);
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

    get_constellationLabelsHeight: function () {
        return this._constellationLabelsHeight;
    },

    set_constellationLabelsHeight: function (value) {
        this._constellationLabelsHeight = value;
        return value;
    }
};

registerType("TourStop", [TourStop, TourStop$, null, ISettings]);


// wwtlib.LayerInfo

export function LayerInfo() {
    this.id = Guid.newGuid();
    this.startOpacity = 1;
    this.endOpacity = 1;
    this.frameOpacity = 1;
    this.startParams = new Array(0);
    this.endParams = new Array(0);
    this.frameParams = new Array(0);
}

var LayerInfo$ = {};

registerType("LayerInfo", [LayerInfo, LayerInfo$, null]);


// wwtlib.UndoTourStopChange

export function UndoTourStopChange(text, tour) {
    this._undoXml = '';
    this._redoXml = '';
    this._currentIndex = 0;
    this._actionText = '';
    this._targetTour = null;
    this._currentIndex = tour.get_currentTourstopIndex();
    this._actionText = text;
    this._targetTour = tour;
    this._undoXml = TourStop.getXmlText(tour.get_currentTourStop());
    this._targetTour.set_tourDirty(true);
}

var UndoTourStopChange$ = {
    get_actionText: function () {
        return this._actionText;
    },

    set_actionText: function (value) {
        this._actionText = value;
        return value;
    },

    undo: function () {
        var tsRedo = this._targetTour.get_tourStops()[this._currentIndex];
        var parser = new DOMParser();
        var doc = parser.parseFromString(this._undoXml, 'text/xml');
        var node = Util.selectSingleNode(doc, 'TourStop');
        this._targetTour.get_tourStops()[this._currentIndex] = TourStop._fromXml(this._targetTour, node);
        this._targetTour.set_currentTourstopIndex(this._currentIndex);
        if (ss.emptyString(this._redoXml)) {
            this._redoXml = TourStop.getXmlText(tsRedo);
        }
        this._targetTour.set_tourDirty(true);
    },

    redo: function () {
        var parser = new DOMParser();
        var doc = parser.parseFromString(this._redoXml, 'text/xml');
        var node = Util.selectSingleNode(doc, 'TourStop');
        this._targetTour.get_tourStops()[this._currentIndex] = TourStop._fromXml(this._targetTour, node);
        this._targetTour.set_currentTourstopIndex(this._currentIndex);
        this._targetTour.set_tourDirty(true);
    },

    toString: function () {
        return this._actionText;
    }
};

registerType("UndoTourStopChange", [UndoTourStopChange, UndoTourStopChange$, null, IUndoStep]);
