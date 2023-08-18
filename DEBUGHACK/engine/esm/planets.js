// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The main planet-related code.
//
// This does not include the 3D planet-rendering code, which has been separated
// into `planets_3d.js`.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d, Matrix3d, PositionColoredTextured } from "./double3d.js";
import { CAAEarth } from "./astrocalc/earth.js";
import { CAAMercury } from "./astrocalc/mercury.js";
import { CAAVenus } from "./astrocalc/venus.js";
import { CAAMars } from "./astrocalc/mars.js";
import { CAAJupiter } from "./astrocalc/jupiter.js";
import { CAASaturn } from "./astrocalc/saturn.js";
import { CAAUranus } from "./astrocalc/uranus.js";
import { CAANeptune } from "./astrocalc/neptune.js";
import { CAAPluto } from "./astrocalc/pluto.js";
import { GM } from "./astrocalc/galilean_moons.js";
import { CAAMoon } from "./astrocalc/moon.js";
import { AstroCalc } from "./astrocalc.js";
import { Texture } from "./graphics/texture.js";
import { Sprite2d } from "./graphics/sprite2d.js";
import { BasePlanets } from "./baseplanets.js";
import { SolarSystemObjects } from "./camera_parameters.js";
import { Color, Colors } from "./color.js";
import { Coordinates } from "./coordinates.js";
import { Settings } from "./settings.js";
import { SpaceTimeController } from "./space_time_controller.js";
import { URLHelpers } from "./url_helpers.js";


// wwtlib.KeplerianElements
//
// Keplerian elements defined here use eccentric anomaly instead of mean anomaly
// and have all orbital plane angles converted to a rotation matrix.
export function KeplerianElements() {
    this.a = 0;
    this.e = 0;
    this.ea = 0;
}

var KeplerianElements$ = {};

registerType("KeplerianElements", [KeplerianElements, KeplerianElements$, null]);


// wwtlib.BodyAngles

export function BodyAngles(poleRa, poleDec, primeMeridian, rotationRate) {
    this.poleDec = 0;
    this.poleRa = 0;
    this.primeMeridian = 0;
    this.rotationRate = 0;
    this.poleDec = poleDec;
    this.poleRa = poleRa;
    this.primeMeridian = primeMeridian;
    this.rotationRate = rotationRate;
}

var BodyAngles$ = {};

registerType("BodyAngles", [BodyAngles, BodyAngles$, null]);


// wwtlib.Planets

export function Planets() { }

Planets.RC = (Math.PI / 180);
Planets._jNow = 0;

// Values taken from version 10 of the SPICE planetary constants file, updated
// October 21, 2011: ftp://naif.jpl.nasa.gov/pub/naif/generic_kernels/pck/pck00010.tpc
//
// Precession rates for rotation angles are currently not stored.
//
// All angles are in degrees.
Planets._planetAngles = [
    new BodyAngles(286.13, 63.87, 84.176, 14.1844),
    new BodyAngles(281.0097, 61.4143, 329.548, 6.1385025),
    new BodyAngles(272.76, 67.16, 160.2, -1.4813688),
    new BodyAngles(317.68143, 52.8865, 176.63, 350.89198226),
    new BodyAngles(268.056595, 64.495303, 284.95, 870.536),
    new BodyAngles(40.589, 83.537, 38.9, 810.7939024),
    new BodyAngles(257.311, -15.175, 203.81, 501.1600928),
    new BodyAngles(299.36, 43.46, 253.18, 536.3128492),
    new BodyAngles(132.993, -6.163, 302.695, 56.3625225),
    new BodyAngles(269.9949, 66.5392, 38.3213, 13.17635815),
    new BodyAngles(268.05, 64.5, 200.39, 203.4889538),
    new BodyAngles(268.08, 64.51, 36.022, 101.3747235),
    new BodyAngles(268.2, 64.57, 44.064, 50.3176081),
    new BodyAngles(268.72, 64.83, 259.51, 21.5710715),
    new BodyAngles(0, 0, 0, 0),
    new BodyAngles(0, 0, 0, 0),
    new BodyAngles(0, 0, 0, 0),
    new BodyAngles(0, 0, 0, 0),
    new BodyAngles(0, 0, 0, 0),
    new BodyAngles(0, 90, 190.147, 360.9856235)
];
Planets._lastPlanetCenterID = -2;
Planets._orbitalSampleRate = 256;
Planets._obliquity = 23.5 * Planets.RC;
Planets._drawOrder = {};
Planets.earthMatrix = new Matrix3d();
Planets.earthMatrixInv = new Matrix3d();
Planets._lastUpdate = new Date();
Planets._planetSprite = new Sprite2d();
Planets._planetPoints = null;
Planets._planet3dLocations = null;

// This function is equivalent to `Texture.from_url` and not specific to the
// Planets infrastructure at all. It should go away. But at the moment, we
// preserve it so as not to break API.
Planets.loadPlanetTexture = function (url) {
    var texture = new Texture();
    texture.load(url);
    return texture;
};

Planets.getPlanet3dLocation = function (target) {
    try {
        if (target < 21) {
            return Planets._planet3dLocations[target].copy();
        }
    }
    catch ($e1) { }
    return Vector3d.create(0, 0, 0);
};

Planets.getPlanet3dSufaceAltitude = function (target) {
    try {
        if (target < 21) {
            return Planets.getAdjustedPlanetRadius(target);
        }
    }
    catch ($e1) { }
    return 0;
};

Planets.getPlanetTargetPoint = function (target, lat, lng, jNow) {
    var temp;
    if (!jNow) {
        temp = Planets.getPlanet3dLocation(target);
    }
    else {
        temp = Planets.getPlanet3dLocationJD(target, jNow);
    }
    temp.add(Coordinates.raDecTo3dAu((lng / 15) + 6, lat, Planets.getPlanet3dSufaceAltitude(target)));
    return temp;
};

Planets.getPlanet3dLocationJD = function (target, jNow) {
    try {
        var result = new Vector3d();
        var centerRaDec = AstroCalc.getPlanet(jNow, 0, 0, 0, -6378149);
        var center = Coordinates.raDecTo3dAu(centerRaDec.RA, centerRaDec.dec, centerRaDec.distance);
        if (target === SolarSystemObjects.earth) {
            result = Vector3d.create(-center.x, -center.y, -center.z);
        } else {
            var planet = AstroCalc.getPlanet(jNow, target, 0, 0, -6378149);
            result = Coordinates.raDecTo3dAu(planet.RA, planet.dec, planet.distance);
            result.subtract(center);
        }
        result.rotateX(Coordinates.meanObliquityOfEcliptic(jNow) * Planets.RC);
        if (Settings.get_active().get_solarSystemScale() !== 1) {
            switch (target) {
                case SolarSystemObjects.moon:
                    var parent = Planets.getPlanet3dLocationJD(SolarSystemObjects.earth, jNow);
                    result.subtract(parent);
                    result.multiply(Settings.get_active().get_solarSystemScale() / 2);
                    result.add(parent);
                    break;
                case SolarSystemObjects.io:
                case SolarSystemObjects.europa:
                case SolarSystemObjects.ganymede:
                case SolarSystemObjects.callisto:
                    var parent = Planets.getPlanet3dLocationJD(SolarSystemObjects.jupiter, jNow);
                    result.subtract(parent);
                    result.multiply(Settings.get_active().get_solarSystemScale());
                    result.add(parent);
                    break;
                default:
                    break;
            }
        }
        return result;
    }
    catch ($e1) {
        return Vector3d.create(0, 0, 0);
    }
};

Planets.getPlanetLocation = function (name) {
    var id = Planets.getPlanetIDFromName(name);
    if (Planets._planetLocations != null) {
        return Planets._planetLocations[id];
    }
    else {
        return AstroCalc.getPlanet(SpaceTimeController.get_jNow(), id, SpaceTimeController.get_location().get_lat(), SpaceTimeController.get_location().get_lng(), SpaceTimeController.get_altitude());
    }
};

Planets.getPlanetLocationJD = function (name, jNow) {
    var id = Planets.getPlanetIDFromName(name);
    return AstroCalc.getPlanet(jNow, id, SpaceTimeController.get_location().get_lat(), SpaceTimeController.get_location().get_lng(), SpaceTimeController.get_altitude());
};

Planets.getPlanetIDFromName = function (planetName) {
    switch (planetName) {
        case 'Sun':
            return SolarSystemObjects.sun;
        case 'Mercury':
            return SolarSystemObjects.mercury;
        case 'Venus':
            return SolarSystemObjects.venus;
        case 'Mars':
            return SolarSystemObjects.mars;
        case 'Jupiter':
            return SolarSystemObjects.jupiter;
        case 'Saturn':
            return SolarSystemObjects.saturn;
        case 'Uranus':
            return SolarSystemObjects.uranus;
        case 'Neptune':
            return SolarSystemObjects.neptune;
        case 'Pluto':
            return SolarSystemObjects.pluto;
        case 'Moon':
            return SolarSystemObjects.moon;
        case 'Io':
            return SolarSystemObjects.io;
        case 'Europa':
            return SolarSystemObjects.europa;
        case 'Ganymede':
            return SolarSystemObjects.ganymede;
        case 'Callisto':
            return SolarSystemObjects.callisto;
        case 'Earth':
            return SolarSystemObjects.earth;
        case 'IoShadow':
            return SolarSystemObjects.ioShadow;
        case 'EuropaShadow':
            return SolarSystemObjects.europaShadow;
        case 'GanymedeShadow':
            return SolarSystemObjects.ganymedeShadow;
        case 'CallistoShadow':
            return SolarSystemObjects.callistoShadow;
        case 'SunEclipsed':
            return SolarSystemObjects.sunEclipsed;
        case 'Custom':
            return SolarSystemObjects.custom;
        case 'Undefined':
            return SolarSystemObjects.undefined;
        default:
            return -1;
    }
};

Planets.getNameFrom3dId = function (id) {
    switch (id) {
        case SolarSystemObjects.sun:
            return 'Sun';
        case SolarSystemObjects.mercury:
            return 'Mercury';
        case SolarSystemObjects.venus:
            return 'Venus';
        case SolarSystemObjects.mars:
            return 'Mars';
        case SolarSystemObjects.jupiter:
            return 'Jupiter';
        case SolarSystemObjects.saturn:
            return 'Saturn';
        case SolarSystemObjects.uranus:
            return 'Uranus';
        case SolarSystemObjects.neptune:
            return 'Neptune';
        case SolarSystemObjects.pluto:
            return 'Pluto';
        case SolarSystemObjects.moon:
            return 'Moon';
        case SolarSystemObjects.io:
            return 'Io';
        case SolarSystemObjects.europa:
            return 'Europa';
        case SolarSystemObjects.ganymede:
            return 'Ganymede';
        case SolarSystemObjects.callisto:
            return 'Callisto';
        case SolarSystemObjects.earth:
            return 'Earth';
        default:
            return '';
    }
};

Planets.updatePlanetLocations = function (threeDee) {
    Planets._jNow = SpaceTimeController.get_jNow();
    if (threeDee) {
        Planets.updateOrbits(0);
    }
    if (Planets._planetDiameters == null) {
        Planets._planetDiameters = new Array(20);
        Planets._planetDiameters[0] = 0.009291568;
        Planets._planetDiameters[1] = 3.25794793734425E-05;
        Planets._planetDiameters[2] = 8.08669220531394E-05;
        Planets._planetDiameters[3] = 4.53785605596396E-05;
        Planets._planetDiameters[4] = 0.000954501;
        Planets._planetDiameters[5] = 0.000802173;
        Planets._planetDiameters[6] = 0.000339564;
        Planets._planetDiameters[7] = 0.000324825;
        Planets._planetDiameters[8] = 1.52007379777805E-05;
        Planets._planetDiameters[9] = 2.32084653538149E-05;
        Planets._planetDiameters[10] = 2.43519298386342E-05;
        Planets._planetDiameters[11] = 2.08692629580609E-05;
        Planets._planetDiameters[12] = 3.51742670356556E-05;
        Planets._planetDiameters[13] = 3.22263666626559E-05;
        Planets._planetDiameters[14] = 2.43519298386342E-05;
        Planets._planetDiameters[15] = 2.08692629580609E-05;
        Planets._planetDiameters[16] = 3.51742670356556E-05;
        Planets._planetDiameters[17] = 3.22263666626559E-05;
        Planets._planetDiameters[18] = 0.009291568 * 2;
        Planets._planetDiameters[SolarSystemObjects.earth] = 8.55626412117809E-05;
    }
    if (Planets.planetColors == null) {
        var lightYellow = Color.fromArgb(255, 255, 255, 221);
        var orangeRed = Color.fromArgb(255, 255, 68, 0);
        Planets.planetColors = new Array(20);
        Planets.planetColors[0] = Colors.get_yellow();
        Planets.planetColors[1] = Colors.get_white();
        Planets.planetColors[2] = lightYellow;
        Planets.planetColors[3] = orangeRed;
        Planets.planetColors[4] = Color.fromArgb(255, 255, 165, 0);
        Planets.planetColors[5] = Color.fromArgb(255, 184, 134, 11);
        Planets.planetColors[6] = Color.fromArgb(255, 173, 216, 230);
        Planets.planetColors[7] = Colors.get_blue();
        Planets.planetColors[8] = Colors.get_white();
        Planets.planetColors[9] = Colors.get_white();
        Planets.planetColors[10] = Colors.get_white();
        Planets.planetColors[11] = Colors.get_white();
        Planets.planetColors[12] = Colors.get_white();
        Planets.planetColors[13] = Colors.get_white();
        Planets.planetColors[14] = Colors.get_black();
        Planets.planetColors[15] = Colors.get_black();
        Planets.planetColors[16] = Colors.get_black();
        Planets.planetColors[17] = Colors.get_black();
        Planets.planetColors[18] = Colors.get_white();
        Planets.planetColors[SolarSystemObjects.earth] = Color.fromArgb(255, 173, 216, 230);
    }
    if (Planets._planetTilts == null) {
        Planets._planetTilts = new Array(20);
        Planets._planetTilts[0] = 0;
        Planets._planetTilts[1] = 0.01;
        Planets._planetTilts[2] = 177.4;
        Planets._planetTilts[3] = 25.19;
        Planets._planetTilts[4] = 3.13;
        Planets._planetTilts[5] = 26.73;
        Planets._planetTilts[6] = 97.77;
        Planets._planetTilts[7] = 28.32;
        Planets._planetTilts[8] = 119.61;
        Planets._planetTilts[9] = 23.439;
        Planets._planetTilts[10] = 2.21;
        Planets._planetTilts[11] = 0;
        Planets._planetTilts[12] = -0.33;
        Planets._planetTilts[13] = 0;
        Planets._planetTilts[14] = 0;
        Planets._planetTilts[15] = 0;
        Planets._planetTilts[16] = 0;
        Planets._planetTilts[17] = 0;
        Planets._planetTilts[18] = 0;
        Planets._planetTilts[SolarSystemObjects.earth] = 23.5;
    }
    Planets._planetTilts[SolarSystemObjects.earth] = Planets._obliquity / Planets.RC;
    if (Planets.planetRotationPeriod == null) {
        Planets.planetRotationPeriod = new Array(20);
        Planets.planetRotationPeriod[0] = 25.37995;
        Planets.planetRotationPeriod[1] = 58.6462;
        Planets.planetRotationPeriod[2] = -243.0187;
        Planets.planetRotationPeriod[3] = 1.02595675;
        Planets.planetRotationPeriod[4] = 0.41007;
        Planets.planetRotationPeriod[5] = 0.426;
        Planets.planetRotationPeriod[6] = -0.71833;
        Planets.planetRotationPeriod[7] = 0.67125;
        Planets.planetRotationPeriod[8] = -6.38718;
        Planets.planetRotationPeriod[9] = 27.3;
        Planets.planetRotationPeriod[10] = 1.769137786;
        Planets.planetRotationPeriod[11] = 3.551;
        Planets.planetRotationPeriod[12] = 7.155;
        Planets.planetRotationPeriod[13] = 16.69;
        Planets.planetRotationPeriod[14] = 0;
        Planets.planetRotationPeriod[15] = 0;
        Planets.planetRotationPeriod[16] = 0;
        Planets.planetRotationPeriod[17] = 0;
        Planets.planetRotationPeriod[18] = 0;
        Planets.planetRotationPeriod[SolarSystemObjects.earth] = 0.99726968;
    }
    if (Planets._planetScales == null) {
        Planets._planetScales = new Array(20);
    }
    if (Planets._planet3dLocations == null) {
        Planets._planet3dLocations = new Array(20);
    }
    if (Settings.get_active().get_actualPlanetScale()) {
        Planets._planetScales[0] = 0.5;
        Planets._planetScales[1] = 0.25;
        Planets._planetScales[2] = 0.25;
        Planets._planetScales[3] = 0.25;
        Planets._planetScales[4] = 0.25;
        Planets._planetScales[5] = 0.5;
        Planets._planetScales[6] = 0.25;
        Planets._planetScales[7] = 0.25;
        Planets._planetScales[8] = 0.25;
        Planets._planetScales[9] = 0.25;
        Planets._planetScales[10] = 0.25;
        Planets._planetScales[11] = 0.25;
        Planets._planetScales[12] = 0.25;
        Planets._planetScales[13] = 0.25;
        Planets._planetScales[14] = 0.25;
        Planets._planetScales[15] = 0.25;
        Planets._planetScales[16] = 0.25;
        Planets._planetScales[17] = 0.25;
        Planets._planetScales[18] = 0.5;
        Planets._planetScales[SolarSystemObjects.earth] = 0.25;
    }
    else {
        for (var i = 0; i < 20; i++) {
            if (i < 10) {
                Planets._planetScales[i] = 0.25;
            }
            else {
                Planets._planetScales[i] = 0.1;
            }
        }

        // Make Sun and Saturn bigger
        Planets._planetScales[SolarSystemObjects.sun] = 0.5;
        Planets._planetScales[SolarSystemObjects.saturn] = 0.5;
        Planets._planetScales[SolarSystemObjects.sunEclipsed] = 0.5;
    }
    Planets._planetDrawOrder = {};
    Planets._planetLocations = new Array(20);
    var center = new Vector3d();
    var planetCenter = 0;
    if (planetCenter > -1) {
        var centerRaDec = AstroCalc.getPlanet(Planets._jNow, planetCenter, (threeDee) ? 0 : SpaceTimeController.get_location().get_lat(), (threeDee) ? 0 : SpaceTimeController.get_location().get_lng(), (threeDee) ? -6378149 : SpaceTimeController.get_altitude());
        center = Coordinates.raDecTo3dAu(centerRaDec.RA, centerRaDec.dec, centerRaDec.distance);
    }
    Planets._planet3dLocations[SolarSystemObjects.earth] = Vector3d.create(-center.x, -center.y, -center.z);
    Planets._planet3dLocations[SolarSystemObjects.earth].rotateX(Planets._obliquity);
    for (var i = 0; i < 18; i++) {
        Planets._planetLocations[i] = AstroCalc.getPlanet(Planets._jNow, i, (threeDee) ? 0 : SpaceTimeController.get_location().get_lat(), (threeDee) ? 0 : SpaceTimeController.get_location().get_lng(), (threeDee) ? -6378149 : SpaceTimeController.get_altitude());
        Planets._planet3dLocations[i] = Coordinates.raDecTo3dAu(Planets._planetLocations[i].RA, Planets._planetLocations[i].dec, Planets._planetLocations[i].distance);
        Planets._planet3dLocations[i].subtract(center);
        Planets._planet3dLocations[i].rotateX(Planets._obliquity);
        if (Settings.get_active().get_actualPlanetScale()) {
            Planets._planetScales[i] = (2 * Math.atan(0.5 * (Planets._planetDiameters[i] / Planets._planetLocations[i].distance))) / Math.PI * 180;
        }
        if (Settings.get_active().get_solarSystemScale() !== 1) {
            var id = i;
            switch (id) {
                case SolarSystemObjects.moon:
                    var parent = Planets._planet3dLocations[SolarSystemObjects.earth];
                    Planets._planet3dLocations[i].subtract(parent);
                    Planets._planet3dLocations[i].multiply(Settings.get_active().get_solarSystemScale() / 2);
                    Planets._planet3dLocations[i].add(parent);
                    break;
                case SolarSystemObjects.io:
                case SolarSystemObjects.europa:
                case SolarSystemObjects.ganymede:
                case SolarSystemObjects.callisto:
                    var parent = Planets._planet3dLocations[SolarSystemObjects.jupiter];
                    Planets._planet3dLocations[i].subtract(parent);
                    Planets._planet3dLocations[i].multiply(Settings.get_active().get_solarSystemScale());
                    Planets._planet3dLocations[i].add(parent);
                    break;
                default:
                    break;
            }
        }
        var finalDistance = -Planets._planetLocations[i].distance;
        while (ss.keyExists(Planets._planetDrawOrder, finalDistance)) {
            finalDistance += 1E-10;
        }
        Planets._planetDrawOrder[finalDistance] = i;
    }
    Planets._planetLocations[SolarSystemObjects.sunEclipsed] = Planets._planetLocations[SolarSystemObjects.sun];
    Planets._planetScales[SolarSystemObjects.sun] *= 2;
    Planets._planetScales[SolarSystemObjects.sunEclipsed] = Planets._planetScales[SolarSystemObjects.sun];
    Planets._planetScales[SolarSystemObjects.saturn] = Planets._planetScales[SolarSystemObjects.saturn] * 2;
    Planets._lastUpdate = SpaceTimeController.get_now();
};

Planets.planetsReady = function () { };

Planets.updateOrbits = function (planetCenter) {
    try {
        Planets._obliquity = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) * Planets.RC;
        if (planetCenter !== Planets._lastPlanetCenterID) {
            Planets._orbits = null;
        }
        Planets._lastPlanetCenterID = planetCenter;
        if (Planets._orbits == null) {
            if (planetCenter < 0) {
                Planets._eclipticTilt = Matrix3d.get_identity();
            }
            else {
                Planets._eclipticTilt = Matrix3d.get_identity();
                Planets._eclipticTilt = Matrix3d._rotationX(Planets._obliquity);
            }
            if (Planets.planetOrbitalYears == null) {
                Planets.planetOrbitalYears = new Array(20);
                Planets.planetOrbitalYears[0] = 1;
                Planets.planetOrbitalYears[1] = 0.241;
                Planets.planetOrbitalYears[2] = 0.615;
                Planets.planetOrbitalYears[3] = 1.881;
                Planets.planetOrbitalYears[4] = 11.87;
                Planets.planetOrbitalYears[5] = 29.45;
                Planets.planetOrbitalYears[6] = 84.07;
                Planets.planetOrbitalYears[7] = 164.9;
                Planets.planetOrbitalYears[8] = 248.1;
                Planets.planetOrbitalYears[9] = 27.3 / 365.25;
                Planets.planetOrbitalYears[10] = 16.6890184 / 365.25;
                Planets.planetOrbitalYears[11] = 3.551181 / 365.25;
                Planets.planetOrbitalYears[12] = 7.15455296 / 365.25;
                Planets.planetOrbitalYears[13] = 16.6890184 / 365.25;
                Planets.planetOrbitalYears[SolarSystemObjects.earth] = 1;
            }
            if (!Planets.readOrbits()) {
                Planets._orbits = new Array(20);
                for (var i = 1; i < 20; i++) {
                    Planets._orbits[i] = new Array(Planets._orbitalSampleRate);
                    if (i < 9 || i === SolarSystemObjects.earth) {
                        for (var j = 0; j < Planets._orbitalSampleRate; j++) {
                            var centerId = planetCenter;
                            var now = Planets._jNow + ((Planets.planetOrbitalYears[i] * 365.25 / Planets._orbitalSampleRate) * (j - (Planets._orbitalSampleRate / 2)));
                            var center = new Vector3d();
                            if (i === SolarSystemObjects.moone) {
                                centerId = -1;
                            }
                            else if (i > 9 && i < 14) {
                                centerId = 4;
                            }
                            if (centerId > -1) {
                                var centerRaDec = AstroCalc.getPlanet(now, centerId, 0, 0, -6378149);
                                center = Coordinates.raDecTo3dAu(centerRaDec.RA, centerRaDec.dec, centerRaDec.distance);
                            }
                            if (i !== SolarSystemObjects.earth) {
                                var planetRaDec = AstroCalc.getPlanet(now, i, 0, 0, -6378149);
                                Planets._orbits[i][j] = Coordinates.raDecTo3dAu(planetRaDec.RA, planetRaDec.dec, planetRaDec.distance);
                                Planets._orbits[i][j].subtract(center);
                            }
                            else {
                                Planets._orbits[i][j] = Vector3d.create(-center.x, -center.y, -center.z);
                            }
                            Planets._orbits[i][j].rotateX(Planets._obliquity);
                        }
                        Planets._orbits[i][Planets._orbitalSampleRate - 1] = Planets._orbits[i][0];
                    }
                }
                Planets.dumpOrbitsFile();
            }
        }
    }
    finally { }
};

Planets.readOrbits = function () {
    // This function ought to fetch wwtweb/catalog.aspx?Q=orbitsbin and set
    // `orbits`, see Windows client code.
    return false;
};

Planets.dumpOrbitsFile = function () { };

Planets.drawPlanets = function (renderContext, opacity) {
    if (Planets._planetTextures == null) {
        Planets._loadPlanetTextures();
    }

    // Get Moon Phase

    var elong = Planets._geocentricElongation(Planets._planetLocations[9].RA, Planets._planetLocations[9].dec, Planets._planetLocations[0].RA, Planets._planetLocations[0].dec);
    var raDif = Planets._planetLocations[9].RA - Planets._planetLocations[0].RA;
    if (Planets._planetLocations[9].RA < Planets._planetLocations[0].RA) {
        raDif += 24;
    }
    var phaseAngle = Planets._phaseAngle(elong, Planets._planetLocations[9].distance, Planets._planetLocations[0].distance);
    var limbAngle = Planets._positionAngle(Planets._planetLocations[9].RA, Planets._planetLocations[9].dec, Planets._planetLocations[0].RA, Planets._planetLocations[0].dec);
    if (raDif < 12) {
        phaseAngle += 180;
    }

    // Check for solar eclipse

    var dista = (Math.abs(Planets._planetLocations[9].RA - Planets._planetLocations[0].RA) * 15) * Math.cos(Coordinates.degreesToRadians(Planets._planetLocations[0].dec));
    var distb = Math.abs(Planets._planetLocations[9].dec - Planets._planetLocations[0].dec);
    var sunMoonDist = Math.sqrt(dista * dista + distb * distb);
    var eclipse = false;
    var coronaOpacity = 0;
    var moonEffect = (Planets._planetScales[9] / 2 - sunMoonDist);
    var darkLimb = Math.min(32, ss.truncate((sunMoonDist * 32)));
    if (moonEffect > (Planets._planetScales[0] / 4)) {
        eclipse = true;
        coronaOpacity = Math.min(1, (moonEffect - (Planets._planetScales[0] / 2)) / 0.001);
        Planets._drawPlanet(renderContext, 18, coronaOpacity);
    }
    var $enum1 = ss.enumerate(ss.keys(Planets._planetDrawOrder));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var planetId = Planets._planetDrawOrder[key];
        Planets._drawPlanet(renderContext, planetId, 1);
    }
    return true;
};

Planets._loadPlanetTextures = function () {
    // Note: these PNG files are fairly large and are loaded at
    // startup of the web client, adding nontrivially to the needed
    // network traffic. JPGs are a lot smaller, but unfortunately the
    // transparency support is important here since we don't want
    // black boxes surrounding all of our planets when they're viewed
    // in the sky.

    var baseUrl = URLHelpers.singleton.engineAssetUrl('');

    Planets._planetTextures = new Array(20);
    Planets._planetTextures[0] = Texture.fromUrl(baseUrl + 'sun.png');
    Planets._planetTextures[1] = Texture.fromUrl(baseUrl + 'mercury.png');
    Planets._planetTextures[2] = Texture.fromUrl(baseUrl + 'venus.png');
    Planets._planetTextures[3] = Texture.fromUrl(baseUrl + 'mars.png');
    Planets._planetTextures[4] = Texture.fromUrl(baseUrl + 'jupiter.png');
    Planets._planetTextures[5] = Texture.fromUrl(baseUrl + 'saturn.png');
    Planets._planetTextures[6] = Texture.fromUrl(baseUrl + 'uranus.png');
    Planets._planetTextures[7] = Texture.fromUrl(baseUrl + 'neptune.png');
    Planets._planetTextures[8] = Texture.fromUrl(baseUrl + 'pluto.png');
    Planets._planetTextures[9] = Texture.fromUrl(baseUrl + 'moon.png');
    Planets._planetTextures[10] = Texture.fromUrl(baseUrl + 'io.png');
    Planets._planetTextures[11] = Texture.fromUrl(baseUrl + 'europa.png');
    Planets._planetTextures[12] = Texture.fromUrl(baseUrl + 'ganymede.png');
    Planets._planetTextures[13] = Texture.fromUrl(baseUrl + 'callisto.png');
    Planets._planetTextures[14] = Texture.fromUrl(baseUrl + 'moonshadow.png');
    Planets._planetTextures[15] = Texture.fromUrl(baseUrl + 'moonshadow.png');
    Planets._planetTextures[16] = Texture.fromUrl(baseUrl + 'moonshadow.png');
    Planets._planetTextures[17] = Texture.fromUrl(baseUrl + 'moonshadow.png');
    Planets._planetTextures[18] = Texture.fromUrl(baseUrl + 'sunCorona.png');
    Planets._planetTextures[SolarSystemObjects.earth] = Texture.fromUrl(baseUrl + 'earth.png');
};

// Compute the rotation of a planet at the J2000 epoch.
//
// The rotation at some instant in can be computed by multiplying the
// the returned matrix by Y(W * t)
Planets.getPlanetOrientationAtEpoch = function (planetID) {
    var m = Matrix3d.get_identity();

    // Rotational elements for the planets are in the form used by the
    // IAU Working Group on Cartographic Coordinates and Rotational Elements:
    //
    // a : Right ascension of north pole
    // d : Declination of north pole
    // W0 : Prime meridian angle at epoch J2000.0
    //
    // The canonical Euler angle sequence is: Z(a - 90) * X(90 - d) * Z(W0)
    //
    // The following transformations are required to convert it to a rotation for WWT:
    //    * WWT uses a coordinate system with +Y = ecliptic north, +X = equinox of J2000
    //      This system is rotated 90 degrees about the X axis from the standard ecliptic
    //      system based on the Earth Mean Equinox of J2000 (EMEJ2000)
    //    * WWT uses row vectors instead of column vectors, so the order of transformations
    //      is reversed
    //    * WWT has planet maps with longitude 0 at the edge rather than the middle. This
    //      requires an extra 180 degrees to be added to W0
    var obliquityOfEcliptic = 23.4392794;

    if (planetID === SolarSystemObjects.earth) {
        // Different calculation for Earth, since the meridian offset
        // is already included in the Mean Sidereal Time function.
        //
        // equatorial to ecliptic transformation
        m._multiply(Matrix3d._rotationX(obliquityOfEcliptic * Planets.RC));
    } else {
        // 90 degree rotation from WWT coord sys
        m._multiply(Matrix3d._rotationX(-90 * Planets.RC));

        m._multiply(Matrix3d._rotationZ((180 + Planets._planetAngles[planetID].primeMeridian) * Planets.RC));
        m._multiply(Matrix3d._rotationX((90 - Planets._planetAngles[planetID].poleDec) * Planets.RC));
        m._multiply(Matrix3d._rotationZ((Planets._planetAngles[planetID].poleRa - 90) * Planets.RC));
        m._multiply(Matrix3d._rotationX(obliquityOfEcliptic * Planets.RC)); // equatorial to ecliptic transformation

        // 90 degree rotation back to WWT coord sys
        m._multiply(Matrix3d._rotationX(90 * Planets.RC));
    }
    return m;
};

Planets.setupPlanetMatrix = function (renderContext, planetID, centerPoint, makeFrustum) {
    var matNonRotating = renderContext.get_world().clone();
    Planets._setupMatrixForPlanetGeometry(renderContext, planetID, centerPoint, makeFrustum);

    if (planetID === SolarSystemObjects.sun) {
        // Don't apply the Sun's orientation to its non-rotating frame; this means that
        // the Sun's reference frame will be the ecliptic frame.
        var radius = Planets.getAdjustedPlanetRadius(planetID);
        matNonRotating.scale(Vector3d.create(radius, radius, radius));
        var translation = Vector3d.subtractVectors(Planets._planet3dLocations[planetID], centerPoint);
        matNonRotating._multiply(Matrix3d.translation(translation));
        renderContext.set_worldBaseNonRotating(matNonRotating);
    }
};

Planets._setupMatrixForPlanetGeometry = function (renderContext, planetID, centerPoint, makeFrustum) {
    var radius = Planets.getAdjustedPlanetRadius(planetID);
    var rotationCurrent = 0;
    if (planetID === SolarSystemObjects.earth) {
        rotationCurrent = Math.PI + Coordinates.mstFromUTC2(SpaceTimeController.get_now(), 0) / 180 * Math.PI;
    }
    else {
        rotationCurrent = Math.PI + (((Planets._jNow - 2451545) / Planets.planetRotationPeriod[planetID]) * Math.PI * 2) % (Math.PI * 2);
    }
    if (planetID === 9) {
        rotationCurrent -= Math.PI / 2;
    }
    var matLocal = renderContext.get_world().clone();
    var matNonRotating = renderContext.get_world().clone();
    var translation = Vector3d.subtractVectors(Planets._planet3dLocations[planetID], centerPoint);
    var orientationAtEpoch = Planets.getPlanetOrientationAtEpoch(planetID);
    matLocal.scale(Vector3d.create(radius, radius, radius));
    matLocal._multiply(Matrix3d._rotationY(-rotationCurrent));
    matLocal._multiply(orientationAtEpoch);
    if (planetID === renderContext.viewCamera.target) {
        Planets.earthMatrix = Matrix3d.get_identity();
        Planets.earthMatrix._multiply(Matrix3d._rotationY(-rotationCurrent));
        Planets.earthMatrix._multiply(orientationAtEpoch);
        Planets.earthMatrixInv = Planets.earthMatrix.clone();
        Planets.earthMatrixInv.invert();
    }
    matLocal._multiply(Matrix3d.translation(translation));
    renderContext.set_world(matLocal);
    renderContext.set_worldBase(renderContext.get_world().clone());
    renderContext.set_nominalRadius(Planets.getPlanetRadiusInMeters(planetID));
    if (makeFrustum) {
        renderContext.makeFrustum();
    }
    matNonRotating.scale(Vector3d.create(radius, radius, radius));
    matNonRotating._multiply(orientationAtEpoch);
    matNonRotating._multiply(Matrix3d.translation(translation));
    renderContext.set_worldBaseNonRotating(matNonRotating);
    return rotationCurrent;
};

// Get the position of a Solar System object using a 'direct' calculation that
// avoids including an aberration correction.
//
// The returned position is in ecliptic coordinate system with the origin at the center
// of the parent body (i.e. the Sun for planets, a planet for moons). The position of moons
// is _not_ modified by the SolarSystemScale, making it possible to use function to
// a calculate valid Keplerian elements.
Planets.getPlanetPositionDirect = function (id, jd) {
    var L = 0;
    var B = 0;
    var R = 0;
    switch (id) {
        case 1:
            L = CAAMercury.eclipticLongitude(jd);
            B = CAAMercury.eclipticLatitude(jd);
            R = CAAMercury.radiusVector(jd);
            break;
        case 2:
            L = CAAVenus.eclipticLongitude(jd);
            B = CAAVenus.eclipticLatitude(jd);
            R = CAAVenus.radiusVector(jd);
            break;
        case SolarSystemObjects.earth:
            L = CAAEarth.eclipticLongitude(jd);
            B = CAAEarth.eclipticLatitude(jd);
            R = CAAEarth.radiusVector(jd);
            break;
        case 3:
            L = CAAMars.eclipticLongitude(jd);
            B = CAAMars.eclipticLatitude(jd);
            R = CAAMars.radiusVector(jd);
            break;
        case 4:
            L = CAAJupiter.eclipticLongitude(jd);
            B = CAAJupiter.eclipticLatitude(jd);
            R = CAAJupiter.radiusVector(jd);
            break;
        case 5:
            L = CAASaturn.eclipticLongitude(jd);
            B = CAASaturn.eclipticLatitude(jd);
            R = CAASaturn.radiusVector(jd);
            break;
        case 6:
            L = CAAUranus.eclipticLongitude(jd);
            B = CAAUranus.eclipticLatitude(jd);
            R = CAAUranus.radiusVector(jd);
            break;
        case 7:
            L = CAANeptune.eclipticLongitude(jd);
            B = CAANeptune.eclipticLatitude(jd);
            R = CAANeptune.radiusVector(jd);
            break;
        case 8:
            L = CAAPluto.eclipticLongitude(jd);
            B = CAAPluto.eclipticLatitude(jd);
            R = CAAPluto.radiusVector(jd);
            break;
        case 9:
            L = CAAMoon.eclipticLongitude(jd);
            B = CAAMoon.eclipticLatitude(jd);
            R = CAAMoon.radiusVector(jd) / 149598000;
            break;
        case 10:
            var galileanInfo = GM.calculate(jd);
            var position = galileanInfo.satellite1.eclipticRectangularCoordinates;
            return Vector3d.create(position.x, position.z, position.y);
        case 11:
            var galileanInfo = GM.calculate(jd);
            var position = galileanInfo.satellite2.eclipticRectangularCoordinates;
            return Vector3d.create(position.x, position.z, position.y);
        case 12:
            var galileanInfo = GM.calculate(jd);
            var position = galileanInfo.satellite3.eclipticRectangularCoordinates;
            return Vector3d.create(position.x, position.z, position.y);
        case 13:
            var galileanInfo = GM.calculate(jd);
            var position = galileanInfo.satellite4.eclipticRectangularCoordinates;
            return Vector3d.create(position.x, position.z, position.y);
    }

    // Enabling this code transforms planet positions from the mean ecliptic/equinox of
    // date to the J2000 ecliptic. It is necessary because the VSOP87D series used
    // for planet positions is in the mean-of-date frame. The transformation is currently
    // disabled in order to better match planet positions calculated elsewhere in the code.
    //CAA2DCoordinate prec = CAAPrecession.PrecessEcliptic(L, B, jd, 2451545.0);
    //L = prec.X;
    //B = prec.Y;

    L = Coordinates.degreesToRadians(L);
    B = Coordinates.degreesToRadians(B);
    var eclPos = Vector3d.create(Math.cos(L) * Math.cos(B) * R, Math.sin(L) * Math.cos(B) * R, Math.sin(B) * R);


    // Transform from the ecliptic of date to the J2000 ecliptic; this transformation should be deleted
    // once the precession is turned on.
    var eclipticOfDateRotation = (Coordinates.meanObliquityOfEcliptic(jd) - Coordinates.meanObliquityOfEcliptic(2451545)) * Planets.RC;
    eclPos.rotateX(eclipticOfDateRotation);
    return Vector3d.create(eclPos.x, eclPos.z, eclPos.y);
};

Planets._stateVectorToKeplerian = function (position, velocity, mu) {
    // Work in units of km and seconds
    var r = Vector3d.scale(position, 149598000);
    var v = Vector3d.scale(Vector3d.scale(velocity, 1 / 86400), 149598000);
    var rmag = r.length();
    var vmag = v.length();
    var sma = 1 / (2 / rmag - vmag * vmag / mu);

    // h is the orbital angular momentum vector
    var h = Vector3d.cross(r, v);

    // ecc is the eccentricity vector, which points from the
    // planet at periapsis to the center point.
    var ecc = Vector3d.subtractVectors(Vector3d.scale(Vector3d.cross(v, h), 1 / mu), Vector3d.scale(r, 1 / rmag));
    var e = ecc.length();

    h.normalize();
    ecc.normalize();

    // h, s, and ecc are orthogonal vectors that define a coordinate
    // system. h is normal to the orbital plane.
    var s = Vector3d.cross(h, ecc);

    // Calculate the sine and cosine of the true anomaly
    r.normalize();
    var cosNu = Vector3d.dot(ecc, r);
    var sinNu = Vector3d.dot(s, r);

    // Compute the eccentric anomaly
    var E = Math.atan2(Math.sqrt(1 - e * e) * sinNu, e + cosNu);
    var elements = new KeplerianElements();

    // Create a rotation matrix given the three orthogonal vectors:
    //   ecc - eccentricity vector
    //   s   - in the orbital plane, perpendicular to ecc
    //   h   - angular momentum vector, normal to orbital plane
    elements.orientation = Matrix3d.create(ecc.x, ecc.y, ecc.z, 0, s.x, s.y, s.z, 0, h.x, h.y, h.z, 0, 0, 0, 0, 1);
    elements.a = sma;
    elements.e = e;
    elements.ea = E;
    return elements;
};

Planets.getAdjustedPlanetRadius = function (planetID) {
    if (planetID > Planets._planetDiameters.length - 1) {
        planetID = SolarSystemObjects.earth;
    }
    var diameter = Planets._planetDiameters[planetID];
    var radius = (diameter / 2);
    if (!!planetID) {
        radius = radius * (1 + (3 * (Settings.get_active().get_solarSystemScale() - 1)));
    }
    else {
        radius = radius * (1 + (0.3 * (Settings.get_active().get_solarSystemScale() - 1)));
    }
    return radius;
};

Planets.getPlanetRadiusInMeters = function (planetID) {
    if (planetID > Planets._planetDiameters.length - 1) {
        planetID = SolarSystemObjects.earth;
    }
    var diameter = Planets._planetDiameters[planetID];
    return (diameter / 2) * 149598000 * 1000;
};

Planets._drawPlanet = function (renderContext, planetID, opacity) {
    var planetPosition = Planets._planetLocations[planetID];
    if (((planetID < 14) && Planets._planetScales[planetID] < (renderContext.viewCamera.zoom / 6) / 400)) {
        if (planetID < 10 || ((planetID < 14) && Planets._planetScales[planetID] > (renderContext.viewCamera.zoom / 6) / 6400)) {
            var point = Coordinates.raDecTo3d(planetPosition.RA, planetPosition.dec);
            BasePlanets.drawPointPlanet(renderContext, point, 3, Planets.planetColors[planetID], false);
        }
        return;
    }
    var brush = null;
    if (planetID < 10 || planetID === 18) {
        brush = Planets._planetTextures[planetID];
    }
    else if (planetID < 14) {
        if (Planets._planetLocations[planetID].eclipsed) {
            brush = Planets._planetTextures[15];
        } else {
            if (Settings.get_active().get_showMoonsAsPointSource()) {
                brush = Planets._planetTextures[14];
            }
            else {
                brush = Planets._planetTextures[planetID];
            }
        }
    }
    else {
        if (!Planets._planetLocations[planetID].shadow) {
            return;
        }

        //Shadows of moons
        brush = Planets._planetTextures[15];
    }
    if (renderContext.gl != null) {
        if (Planets._planetPoints == null) {
            Planets._planetPoints = new Array(4);
            for (var i = 0; i < 4; i++) {
                Planets._planetPoints[i] = new PositionColoredTextured();
            }
        }
        var radius = (Planets._planetScales[planetID] / 2);
        var raRadius = (radius / Math.cos(planetPosition.dec / 180 * Math.PI));
        Planets._planetPoints[0].position = Coordinates.raDecTo3dAu((planetPosition.RA - (raRadius / 15)), planetPosition.dec + radius, 1);
        Planets._planetPoints[0].tu = 0;
        Planets._planetPoints[0].tv = 1;
        Planets._planetPoints[0].color = Colors.get_white();
        Planets._planetPoints[1].position = Coordinates.raDecTo3dAu((planetPosition.RA - (raRadius / 15)), planetPosition.dec - radius, 1);
        Planets._planetPoints[1].tu = 0;
        Planets._planetPoints[1].tv = 0;
        Planets._planetPoints[1].color = Colors.get_white();
        Planets._planetPoints[2].position = Coordinates.raDecTo3dAu((planetPosition.RA + (raRadius / 15)), planetPosition.dec + radius, 1);
        Planets._planetPoints[2].tu = 1;
        Planets._planetPoints[2].tv = 1;
        Planets._planetPoints[2].color = Colors.get_white();
        Planets._planetPoints[3].position = Coordinates.raDecTo3dAu((planetPosition.RA + (raRadius / 15)), planetPosition.dec - radius, 1);
        Planets._planetPoints[3].tu = 1;
        Planets._planetPoints[3].tv = 0;
        Planets._planetPoints[3].color = Colors.get_white();
        Planets._planetSprite.draw(renderContext, Planets._planetPoints, 4, brush, true, 1);
    }
    else {
        var center = Coordinates.raDecTo3d(planetPosition.RA, planetPosition.dec);
        var rad = Planets._planetScales[planetID] / (renderContext.get_fovScale() / 3600) / 2;
        var screenSpacePnt = renderContext.WVP.transform(center);
        if (screenSpacePnt.z < 0) {
            return;
        }
        if (Vector3d.dot(renderContext.get_viewPoint(), center) < 0.55) {
            return;
        }
        var ctx = renderContext.device;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(screenSpacePnt.x, screenSpacePnt.y, rad, 0, Math.PI * 2, true);
        ctx.lineWidth = 0;
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(brush.imageElement, screenSpacePnt.x - rad, screenSpacePnt.y - rad, rad * 2, rad * 2);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
};

Planets._drawPlanetPhase = function (renderContext, planetID, phase, angle, dark) { };

Planets._geocentricElongation = function (ObjectAlpha, ObjectDelta, SunAlpha, SunDelta) {
    //Convert the RA's to radians
    ObjectAlpha = Coordinates.degreesToRadians(ObjectAlpha * 15);
    SunAlpha = Coordinates.degreesToRadians(SunAlpha * 15);

    //Convert the declinations to radians
    ObjectDelta = Coordinates.degreesToRadians(ObjectDelta);
    SunDelta = Coordinates.degreesToRadians(SunDelta);
    return Coordinates.radiansToDegrees(Math.acos(Math.sin(SunDelta) * Math.sin(ObjectDelta) + Math.cos(SunDelta) * Math.cos(ObjectDelta) * Math.cos(SunAlpha - ObjectAlpha)));
};

Planets._phaseAngle = function (GeocentricElongation, EarthObjectDistance, EarthSunDistance) {
    //Convert from degrees to radians
    GeocentricElongation = Coordinates.degreesToRadians(GeocentricElongation);

    return Coordinates.mapTo0To360Range(Coordinates.radiansToDegrees(Math.atan2(EarthSunDistance * Math.sin(GeocentricElongation), EarthObjectDistance - EarthSunDistance * Math.cos(GeocentricElongation))));
};

Planets._positionAngle = function (Alpha0, Delta0, Alpha, Delta) {
    Alpha0 = Coordinates.hoursToRadians(Alpha0);
    Alpha = Coordinates.hoursToRadians(Alpha);
    Delta0 = Coordinates.degreesToRadians(Delta0);
    Delta = Coordinates.degreesToRadians(Delta);
    return Coordinates.mapTo0To360Range(Coordinates.radiansToDegrees(Math.atan2(Math.cos(Delta0) * Math.sin(Alpha0 - Alpha), Math.sin(Delta0) * Math.cos(Delta) - Math.cos(Delta0) * Math.sin(Delta) * Math.cos(Alpha0 - Alpha))));
};

var Planets$ = {};

registerType("Planets", [Planets, Planets$, null]);
