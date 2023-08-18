// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Some miscellaneous types relating to astronomy calculations.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { Util } from "./util.js";
import { CT } from "./astrocalc/coordinate_transformation.js";
import { DT } from "./astrocalc/date.js";
import { CAANutation } from "./astrocalc/nutation.js";
import { CAAParallax } from "./astrocalc/parallax.js";
import { CAAPhysicalJupiter, CAAPhysicalJupiterDetails } from "./astrocalc/physical_jupiter.js";
import { CAARiseTransitSet } from "./astrocalc/rise_transit_set.js";
import { ELL, EPD } from "./astrocalc/elliptical.js";
import { GM, GMDS } from "./astrocalc/galilean_moons.js";
import { CAAMoon } from "./astrocalc/moon.js";


// Global state

var galDetails = new GMDS();
var jupDetails = new EPD();
var jupPhisical = new CAAPhysicalJupiterDetails();
var jDateLast = 0;


// wwtlib.AstroRaDec

export function AstroRaDec(ra, dec, dist, shadow, eclipsed) {
    this.RA = 0;
    this.dec = 0;
    this.distance = 0;
    this.shadow = false;
    this.eclipsed = false;
    this.RA = ra;
    this.dec = dec;
    this.distance = dist;
    this.shadow = shadow;
    this.eclipsed = eclipsed;
}

var AstroRaDec$ = {};

registerType("AstroRaDec", [AstroRaDec, AstroRaDec$, null]);


// wwtlib.RiseSetDetails

export function RiseSetDetails(bValid, Rise, Transit, Set, neverRises) {
    this.bValid = false;
    this.rise = 0;
    this.transit = 0;
    this.set = 0;
    this.bNeverRises = false;
    this.bValid = bValid;
    this.rise = Rise;
    this.transit = Transit;
    this.set = Set;
    this.bNeverRises = neverRises;
}

var RiseSetDetails$ = {};

registerType("RiseSetDetails", [RiseSetDetails, RiseSetDetails$, null]);


// wwtlib.AstroCalc

export function AstroCalc() { }

AstroCalc.getPlanet = function (jDate, planetIn, locLat, locLong, locHeight) {
    var planet = planetIn;
    locLong = -locLong;

    if (planet < 9) {
        var Details = ELL.calculate(jDate, planetIn);
        var corrected = CAAParallax.equatorial2Topocentric(Details.apparentGeocentricRA, Details.apparentGeocentricDeclination, Details.apparentGeocentricDistance, locLong, locLat, locHeight, jDate);
        return new AstroRaDec(corrected.x, corrected.y, Details.apparentGeocentricDistance, false, false);
    }
    else if (planet === 9) {
        var lat = CAAMoon.eclipticLatitude(jDate);
        var lng = CAAMoon.eclipticLongitude(jDate);
        var dis = CAAMoon.radiusVector(jDate) / 149598000;
        var epsilon = CAANutation.trueObliquityOfEcliptic(jDate);
        var d = CT.ec2Eq(lng, lat, epsilon);
        var corrected = CAAParallax.equatorial2Topocentric(d.x, d.y, dis, locLong, locLat, locHeight, jDate);
        return new AstroRaDec(corrected.x, corrected.y, dis, false, false);
    }
    else {
        if (jDate !== jDateLast) {
            jupDetails = ELL.calculate(jDate, 4);
            jupPhisical = CAAPhysicalJupiter.calculate(jDate);
            var corrected = CAAParallax.equatorial2Topocentric(jupDetails.apparentGeocentricRA, jupDetails.apparentGeocentricDeclination, jupDetails.apparentGeocentricDistance, locLong, locLat, locHeight, jDate);
            jupDetails.apparentGeocentricRA = corrected.x;
            jupDetails.apparentGeocentricDeclination = corrected.y;
            galDetails = GM.calculate(jDate);
            jDateLast = jDate;
        }
        var jupiterDiameter = 0.000954501;
        var scale = Math.atan(0.5 * (jupiterDiameter / jupDetails.apparentGeocentricDistance)) / 3.1415927 * 180;
        var raScale = (scale / Math.cos(jupDetails.apparentGeocentricDeclination / 180 * 3.1415927)) / 15;
        var xMoon = 0;
        var yMoon = 0;
        var zMoon = 0;
        var shadow = false;
        var eclipsed = false;
        switch (planet) {
            case 10: // IO
                xMoon = galDetails.satellite1.apparentRectangularCoordinates.x;
                yMoon = galDetails.satellite1.apparentRectangularCoordinates.y;
                zMoon = galDetails.satellite1.apparentRectangularCoordinates.z;
                eclipsed = galDetails.satellite1.bInEclipse;
                shadow = galDetails.satellite1.bInShadowTransit;
                break;
            case 11: // Europa
                xMoon = galDetails.satellite2.apparentRectangularCoordinates.x;
                yMoon = galDetails.satellite2.apparentRectangularCoordinates.y;
                zMoon = galDetails.satellite2.apparentRectangularCoordinates.z;
                eclipsed = galDetails.satellite2.bInEclipse;
                shadow = galDetails.satellite2.bInShadowTransit;
                break;
            case 12: // Ganymede
                xMoon = galDetails.satellite3.apparentRectangularCoordinates.x;
                yMoon = galDetails.satellite3.apparentRectangularCoordinates.y;
                zMoon = galDetails.satellite3.apparentRectangularCoordinates.z;
                eclipsed = galDetails.satellite3.bInEclipse;
                shadow = galDetails.satellite3.bInShadowTransit;
                break;
            case 13: // Callisto
                xMoon = galDetails.satellite4.apparentRectangularCoordinates.x;
                yMoon = galDetails.satellite4.apparentRectangularCoordinates.y;
                zMoon = galDetails.satellite4.apparentRectangularCoordinates.z;
                eclipsed = galDetails.satellite4.bInEclipse;
                shadow = galDetails.satellite4.bInShadowTransit;
                break;
            case 14: // Io shadow
                xMoon = galDetails.satellite1.apparentShadowRectangularCoordinates.x;
                yMoon = galDetails.satellite1.apparentShadowRectangularCoordinates.y;
                zMoon = galDetails.satellite1.apparentShadowRectangularCoordinates.z * 0.9;
                shadow = galDetails.satellite1.bInShadowTransit;
                break;
            case 15: // Europa shadow
                xMoon = galDetails.satellite2.apparentShadowRectangularCoordinates.x;
                yMoon = galDetails.satellite2.apparentShadowRectangularCoordinates.y;
                zMoon = galDetails.satellite2.apparentShadowRectangularCoordinates.z * 0.9;
                shadow = galDetails.satellite2.bInShadowTransit;
                break;
            case 16: // Ganymede shadow
                xMoon = galDetails.satellite3.apparentShadowRectangularCoordinates.x;
                yMoon = galDetails.satellite3.apparentShadowRectangularCoordinates.y;
                zMoon = galDetails.satellite3.apparentShadowRectangularCoordinates.z * 0.9;
                shadow = galDetails.satellite3.bInShadowTransit;
                break;
            case 17: // Callisto shadow
                xMoon = galDetails.satellite4.apparentShadowRectangularCoordinates.x;
                yMoon = galDetails.satellite4.apparentShadowRectangularCoordinates.y;
                zMoon = galDetails.satellite4.apparentShadowRectangularCoordinates.z * 0.9;
                shadow = galDetails.satellite4.bInShadowTransit;
                break;
        }
        var xTemp;
        var yTemp;
        var radians = jupPhisical.p / 180 * 3.1415927;
        xTemp = xMoon * Math.cos(radians) - yMoon * Math.sin(radians);
        yTemp = xMoon * Math.sin(radians) + yMoon * Math.cos(radians);
        xMoon = xTemp;
        yMoon = yTemp;
        return new AstroRaDec(jupDetails.apparentGeocentricRA - (xMoon * raScale), jupDetails.apparentGeocentricDeclination + yMoon * scale, jupDetails.apparentGeocentricDistance + (zMoon * jupiterDiameter / 2), shadow, eclipsed);
    }
};

AstroCalc.getJulianDay = function (year, month, day) {
    return DT.dateToJD(ss.truncate(year), ss.truncate(month), day, true);
};

AstroCalc.eclipticToJ2000 = function (l, b, jNow) {
    var radec = CT.ec2Eq(l, b, CAANutation.trueObliquityOfEcliptic(jNow));
    return new AstroRaDec(radec.x, radec.y, 0, false, false);
};

AstroCalc.galacticToJ2000 = function (l, b) {
    var radec = CT.g2Eq(l, b);
    return new AstroRaDec(radec.x, radec.y, 0, false, false);
};

AstroCalc.j2000ToGalactic = function (ra, dec) {
    var galactic = CT.eq2G(ra, dec);
    return new AstroRaDec(galactic.x, galactic.y, 0, false, false);
};

AstroCalc.getRiseTrinsitSet = function (jd, lat, lng, ra1, dec1, ra2, dec2, ra3, dec3, type) {
    var alt = -0.5667;

    switch (type) {
        case 0: // Planet or star
            alt = -0.5667;
            break;
        case 1: // Sun
            alt = -0.8333;
            break;
        case 2:
            alt = 0.125;
            break;
    }
    var RiseTransitSetTime = CAARiseTransitSet.rise(jd, ra1, dec1, ra2, dec2, ra3, dec3, lng, lat, alt);
    var neverRises = false;
    if (!RiseTransitSetTime.bValid) {
        neverRises = Util.sign(lat) !== Util.sign(dec2);
    }
    return new RiseSetDetails(RiseTransitSetTime.bValid, RiseTransitSetTime.rise, RiseTransitSetTime.transit, RiseTransitSetTime.set, neverRises);
};

var AstroCalc$ = {};

registerType("AstroCalc", [AstroCalc, AstroCalc$, null]);
