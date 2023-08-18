// Originally `AAELEMENTSPLANETARYORBIT.CPP`
// "Purpose: Implementation for the algorithms to calculate the elements of the planetary orbits"
// Last update of original: PJN / 29-12-2003
//
// Translated into C# and released by Microsoft, then transpiled into JavaScript
// by ScriptSharp, for the WorldWide Telescope project.
//
// The legal notices in the original code are as follows:
//
// Copyright (c) 2003 - 2007 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)
//
// All rights reserved.
//
// Copyright / Usage Details:
//
// You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise)
// when your product is released in binary form. You are allowed to modify the source code in any way you want
// except you cannot modify the copyright details at the top of each module. If you want to distribute source
// code with your application, then you are only allowed to distribute versions released by the author. This is
// to maintain a single distribution point for the source code.

import { registerType } from "../typesystem.js";
import { CT } from "./coordinate_transformation.js";


// EPO - was CAAElementsPlanetaryOrbit

export function EPO() { }

EPO.mercuryMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(252.250906 + 149474.0722491 * T + 0.0003035 * Tsquared + 1.8E-08 * Tcubed);
};

EPO.mercurySemimajorAxis = function (UnnamedParameter1) {
    return 0.38709831;
};

EPO.mercuryEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.20563175 + 2.0407E-05 * T - 2.83E-08 * Tsquared - 1.8E-10 * Tcubed;
};

EPO.mercuryInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(7.004986 + 0.0018215 * T - 1.81E-05 * Tsquared + 5.6E-08 * Tcubed);
};

EPO.mercuryLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(48.330893 + 1.1861883 * T + 0.00017542 * Tsquared + 2.15E-07 * Tcubed);
};

EPO.mercuryLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(77.456119 + 1.5564776 * T + 0.00029544 * Tsquared + 9E-09 * Tcubed);
};

EPO.venusMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(181.979801 + 58519.2130302 * T + 0.00031014 * Tsquared + 1.5E-08 * Tcubed);
};

EPO.venusSemimajorAxis = function (UnnamedParameter1) {
    return 0.72332982;
};

EPO.venusEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.00677192 - 4.7765E-05 * T + 9.81E-08 * Tsquared + 4.6E-10 * Tcubed;
};

EPO.venusInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(3.394662 + 0.0010037 * T - 8.8E-07 * Tsquared - 7E-09 * Tcubed);
};

EPO.venusLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(76.67992 + 0.9011206 * T + 0.00040618 * Tsquared - 9.3E-08 * Tcubed);
};

EPO.venusLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(131.563703 + 1.4022288 * T - 0.00107618 * Tsquared - 5.678E-06 * Tcubed);
};

EPO.earthMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(100.466457 + 36000.7698278 * T + 0.00030322 * Tsquared + 2E-08 * Tcubed);
};

EPO.earthSemimajorAxis = function (UnnamedParameter1) {
    return 1.000001018;
};

EPO.earthEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.01670863 - 4.2037E-05 * T - 1.267E-07 * Tsquared + 1.4E-10 * Tcubed;
};

EPO.earthInclination = function (UnnamedParameter1) {
    return 0;
};

EPO.earthLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(102.937348 + 1.17195366 * T + 0.00045688 * Tsquared - 1.8E-08 * Tcubed);
};

EPO.marsMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(355.433 + 19141.6964471 * T + 0.00031052 * Tsquared + 1.6E-08 * Tcubed);
};

EPO.marsSemimajorAxis = function (UnnamedParameter1) {
    return 1.523679342;
};

EPO.marsEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.09340065 + 9.0484E-05 * T - 8.06E-08 * Tsquared - 2.5E-10 * Tcubed;
};

EPO.marsInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(1.849726 - 0.0006011 * T + 1.276E-05 * Tsquared - 7E-09 * Tcubed);
};

EPO.marsLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(49.588093 + 0.7720959 * T + 1.557E-05 * Tsquared + 2.267E-06 * Tcubed);
};

EPO.marsLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(336.060234 + 1.8410449 * T + 0.00013477 * Tsquared + 5.36E-07 * Tcubed);
};

EPO.jupiterMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(34.351519 + 3036.3027748 * T + 0.0002233 * Tsquared + 3.7E-08 * Tcubed);
};

EPO.jupiterSemimajorAxis = function (JD) {
    var T = (JD - 2451545) / 36525;
    return 5.202603209 + 1.913E-07 * T;
};

EPO.jupiterEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.04849793 + 0.000163225 * T - 4.714E-07 * Tsquared - 2.01E-09 * Tcubed;
};

EPO.jupiterInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(1.303267 - 0.0054965 * T + 4.66E-06 * Tsquared - 2E-09 * Tcubed);
};

EPO.jupiterLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(100.464407 + 1.0209774 * T + 0.00040315 * Tsquared + 4.04E-07 * Tcubed);
};

EPO.jupiterLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(14.331207 + 1.6126352 * T + 0.00103042 * Tsquared - 4.464E-06 * Tcubed);
};

EPO.saturnMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(50.077444 + 1223.5110686 * T + 0.00051908 * Tsquared - 3E-08 * Tcubed);
};

EPO.saturnSemimajorAxis = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    return 9.554909192 - 2.139E-06 * T + 4E-09 * Tsquared;
};

EPO.saturnEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.05554814 - 0.0003446641 * T - 6.436E-07 * Tsquared + 3.4E-09 * Tcubed;
};

EPO.saturnInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(2.488879 - 0.0037362 * T - 1.519E-05 * Tsquared + 8.7E-08 * Tcubed);
};

EPO.saturnLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(113.665503 + 0.877088 * T - 0.00012176 * Tsquared - 2.249E-06 * Tcubed);
};

EPO.saturnLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(93.057237 + 1.19637613 * T + 0.00083753 * Tsquared + 4.928E-06 * Tcubed);
};

EPO.uranusMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(314.055005 + 429.8640561 * T + 0.0003039 * Tsquared + 2.6E-08 * Tcubed);
};

EPO.uranusSemimajorAxis = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    return 19.218446062 - 3.72E-08 * T + 9.8E-10 * Tsquared;
};

EPO.uranusEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.04638122 - 2.7293E-05 * T + 7.89E-08 * Tsquared + 2.4E-10 * Tcubed;
};

EPO.uranusInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(0.773197 + 0.0007744 * T + 3.749E-05 * Tsquared - 9.2E-08 * Tcubed);
};

EPO.uranusLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(74.005957 + 0.5211278 * T + 0.00133947 * Tsquared + 1.8484E-05 * Tcubed);
};

EPO.uranusLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(173.005291 + 1.486379 * T + 0.00021406 * Tsquared + 4.34E-07 * Tcubed);
};

EPO.neptuneMeanLongitude = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(304.348665 + 219.8833092 * T + 0.00030882 * Tsquared + 1.8E-08 * Tcubed);
};

EPO.neptuneSemimajorAxis = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    return 30.110386869 - 1.663E-07 * T + 6.9E-10 * Tsquared;
};

EPO.neptuneEccentricity = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tcubed = T * T * T;
    return 0.00945575 + 6.033E-06 * T - 5E-11 * Tcubed;
};

EPO.neptuneInclination = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(1.769953 - 0.0093082 * T - 7.08E-06 * Tsquared + 2.7E-08 * Tcubed);
};

EPO.neptuneLongitudeAscendingNode = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(131.784057 + 1.1022039 * T + 0.00025952 * Tsquared - 6.37E-07 * Tcubed);
};

EPO.neptuneLongitudePerihelion = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(48.120276 + 1.4262957 * T + 0.00038434 * Tsquared + 2E-08 * Tcubed);
};

EPO.mercuryMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(252.250906 + 149472.6746358 * T - 5.36E-06 * Tsquared + 2E-09 * Tcubed);
};

EPO.mercuryInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(7.004986 - 0.0059516 * T + 8E-07 * Tsquared + 4.3E-08 * Tcubed);
};

EPO.mercuryLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(48.330893 - 0.1254227 * T - 8.833E-05 * Tsquared - 2E-07 * Tcubed);
};

EPO.mercuryLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(77.456119 + 0.1588643 * T - 1.342E-05 * Tsquared - 7E-09 * Tcubed);
};

EPO.venusMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(181.979801 + 58517.815676 * T + 1.65E-06 * Tsquared - 2E-09 * Tcubed);
};

EPO.venusInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(3.394662 - 0.0008568 * T - 3.244E-05 * Tsquared + 9E-09 * Tcubed);
};

EPO.venusLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(76.67992 - 0.2780134 * T - 0.00014257 * Tsquared - 1.64E-07 * Tcubed);
};

EPO.venusLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(131.563703 + 0.0048746 * T - 0.00138467 * Tsquared - 5.695E-06 * Tcubed);
};

EPO.earthMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(100.466457 + 35999.3728565 * T - 5.68E-06 * Tsquared - 1E-09 * Tcubed);
};

EPO.earthInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return 0.0130548 * T - 9.31E-06 * Tsquared - 3.4E-08 * Tcubed;
};

EPO.earthLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(174.873176 - 0.241098 * T + 4.262E-05 * Tsquared + 1E-09 * Tcubed);
};

EPO.earthLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(102.937348 + 0.3225654 * T + 0.00014799 * Tsquared - 3.9E-08 * Tcubed);
};

EPO.marsMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(355.433 + 19140.2993039 * T + 2.62E-06 * Tsquared - 3E-09 * Tcubed);
};

EPO.marsInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(1.849726 - 0.0081477 * T - 2.255E-05 * Tsquared - 2.9E-08 * Tcubed);
};

EPO.marsLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(49.588093 - 0.295025 * T - 0.00064048 * Tsquared - 1.964E-06 * Tcubed);
};

EPO.marsLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(336.060234 + 0.4439016 * T - 0.00017313 * Tsquared + 5.18E-07 * Tcubed);
};

EPO.jupiterMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(34.351519 + 3034.9056606 * T - 8.501E-05 * Tsquared + 1.6E-08 * Tcubed);
};

EPO.jupiterInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(1.303267 - 0.0019877 * T + 3.32E-05 * Tsquared + 9.7E-08 * Tcubed);
};

EPO.jupiterLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(100.464407 + 0.1767232 * T + 0.000907 * Tsquared - 7.272E-06 * Tcubed);
};

EPO.jupiterLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(14.331207 + 0.2155209 * T + 0.00072211 * Tsquared - 4.485E-06 * Tcubed);
};

EPO.saturnMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(50.077444 + 1222.1138488 * T + 0.00021004 * Tsquared - 4.6E-08 * Tcubed);
};

EPO.saturnInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(2.488879 + 0.0025514 * T - 4.906E-05 * Tsquared + 1.7E-08 * Tcubed);
};

EPO.saturnLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(113.665503 - 0.2566722 * T - 0.00018399 * Tsquared + 4.8E-07 * Tcubed);
};

EPO.saturnLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(93.057237 + 0.5665415 * T + 0.0005285 * Tsquared + 4.912E-06 * Tcubed);
};

EPO.uranusMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(314.055005 + 428.4669983 * T - 4.86E-06 * Tsquared + 6E-09 * Tcubed);
};

EPO.uranusInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(0.773197 - 0.0016869 * T + 3.49E-06 * Tsquared + 1.6E-08 * Tcubed);
};

EPO.uranusLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(74.005957 + 0.0741431 * T + 0.00040539 * Tsquared + 1.19E-07 * Tcubed);
};

EPO.uranusLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(173.005291 + 0.0893212 * T - 9.47E-05 * Tsquared + 4.14E-07 * Tcubed);
};

EPO.neptuneMeanLongitudeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(304.348665 + 218.4862002 * T + 5.9E-07 * Tsquared - 2E-09 * Tcubed);
};

EPO.neptuneInclinationJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    return CT.m360(1.769953 + 0.0002256 * T + 2.3E-07 * Tsquared);
};

EPO.neptuneLongitudeAscendingNodeJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    var Tcubed = Tsquared * T;
    return CT.m360(131.784057 - 0.0061651 * T - 2.19E-06 * Tsquared - 7.8E-08 * Tcubed);
};

EPO.neptuneLongitudePerihelionJ2000 = function (JD) {
    var T = (JD - 2451545) / 36525;
    var Tsquared = T * T;
    return CT.m360(48.120276 + 0.0291866 * T + 7.61E-05 * Tsquared);
};

var EPO$ = {};

registerType("EPO", [EPO, EPO$, null]);
