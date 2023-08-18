// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Various grids that can overlay the sky view.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { URLHelpers } from "./url_helpers.js";
import { Vector3d, Matrix3d, PositionTexture } from "./double3d.js";
import { DT } from "./astrocalc/date.js";
import { CT } from "./astrocalc/coordinate_transformation.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { PointList, SimpleLineList, Dates } from "./graphics/primitives3d.js";
import { PositionTextureVertexBuffer } from "./graphics/gl_buffers.js";
import { Texture } from "./graphics/texture.js";
import { ImageShader } from "./graphics/shaders.js";
import { Colors } from "./color.js";
import { freestandingMode } from "./data_globals.js";
import { globalRenderContext, tilePrepDevice } from "./render_globals.js";
import { BinaryReader } from "./utilities/binary_reader.js";
import { Coordinates } from "./coordinates.js";
import { Text3d, Text3dBatch } from "./sky_text.js";
import { Planets } from "./planets.js";
import { SpaceTimeController } from "./space_time_controller.js";
import { Star, Galaxy } from "./star.js";
import { WebFile } from "./web_file.js";


// wwtlib.Grids

export function Grids() { }

Grids._galaxyImageIndexBuffer = null;
Grids._galaxyImageTriangleCount = 0;
Grids._milkyWayImage = null;
Grids._starSprites = null;
Grids._starCount = 0;
Grids._starsDownloading = false;
Grids._stars = null;
Grids._hipparcosIndex = {};
Grids._limitingMagnitude = 16;
Grids._galaxyTextures = null;
Grids._galaxyVertexCounts = null;
Grids._largeSet = true;
Grids._cosmosReady = false;
Grids._cosmos = null;
Grids._downloadingGalaxy = false;
Grids._eclipticCount = 0;
Grids._eclipticYear = 0;
Grids._monthDays = [31, 28.2421, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Grids._monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Grids._eclipticTextYear = 0;

Grids._createGalaxyImage = function (renderContext) {
    if (Grids._milkyWayImage == null) {
        Grids._milkyWayImage = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('milkywaybar.jpg'));
    }
    var subdivs = 50;
    var lat, lng;
    var index = 0;
    var latMin = 64;
    var latMax = -64;
    var lngMin = -64;
    var lngMax = 64;
    Grids._galaxyImageVertexBuffer = new PositionTextureVertexBuffer((subdivs + 1) * (subdivs + 1));
    var verts = Grids._galaxyImageVertexBuffer.lock();
    var x1, y1;
    var latDegrees = latMax - latMin;
    var lngDegrees = lngMax - lngMin;
    var scaleFactor = 60800000;
    var ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;
    var point;
    var textureStepX = 1 / subdivs;
    var textureStepY = 1 / subdivs;
    for (y1 = 0; y1 <= subdivs; y1++) {
        if (y1 !== subdivs) {
            lat = latMax - (textureStepY * latDegrees * y1);
        } else {
            lat = latMin;
        }
        for (x1 = 0; x1 <= subdivs; x1++) {
            if (x1 !== subdivs) {
                lng = lngMin + (textureStepX * lngDegrees * x1);
            }
            else {
                lng = lngMax;
            }
            index = y1 * (subdivs + 1) + x1;
            point = Vector3d.create(lng * scaleFactor, 0, (lat - 28) * scaleFactor);
            point.rotateY(213 / 180 * Math.PI);
            point.rotateZ((-62.87175) / 180 * Math.PI);
            point.rotateY((-192.8595083) / 180 * Math.PI);
            point.rotateX(ecliptic);
            verts[index] = PositionTexture.createPosRaw(point, (1 - x1 * textureStepX), (y1 * textureStepY));
        }
    }
    Grids._galaxyImageVertexBuffer.unlock();
    Grids._galaxyImageTriangleCount = subdivs * subdivs * 2;
    var ui16array = new Uint16Array(subdivs * subdivs * 6);
    var indexArray = ui16array;
    for (y1 = 0; y1 < subdivs; y1++) {
        for (x1 = 0; x1 < subdivs; x1++) {
            index = (y1 * subdivs * 6) + 6 * x1;

            // First triangle in quad
            indexArray[index] = (y1 * (subdivs + 1) + x1);
            indexArray[index + 2] = ((y1 + 1) * (subdivs + 1) + x1);
            indexArray[index + 1] = (y1 * (subdivs + 1) + (x1 + 1));

            // Second triangle in quad
            indexArray[index + 3] = (y1 * (subdivs + 1) + (x1 + 1));
            indexArray[index + 5] = ((y1 + 1) * (subdivs + 1) + x1);
            indexArray[index + 4] = ((y1 + 1) * (subdivs + 1) + (x1 + 1));
        }
    }
    Grids._galaxyImageIndexBuffer = tilePrepDevice.createBuffer();
    tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, Grids._galaxyImageIndexBuffer);
    tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, ui16array, WEBGL.STATIC_DRAW);
};

Grids.drawGalaxyImage = function (renderContext, opacity) {
    if (Grids._galaxyImageIndexBuffer == null) {
        Grids._createGalaxyImage(renderContext);
    }
    var zoom = renderContext.viewCamera.zoom;
    var log = Math.log(Math.max(1, zoom)) / Math.log(4);
    var distAlpha = (log - 14) * 128;
    var alpha = (Math.min(255, Math.max(0, distAlpha)) * opacity);
    ImageShader.use(renderContext, Grids._galaxyImageVertexBuffer.vertexBuffer, Grids._galaxyImageIndexBuffer, Grids._milkyWayImage.texture2d, opacity, true);
    renderContext.gl.drawElements(WEBGL.TRIANGLES, Grids._galaxyImageTriangleCount * 3, WEBGL.UNSIGNED_SHORT, 0);
};

Grids.drawStars3D = function (renderContext, opacity) {
    var zoom = renderContext.viewCamera.zoom;
    var distAlpha = Math.max(Math.min(255, (Math.log(zoom) - 15.5) * 40.8), 0);
    var alpha = Math.min(255, Math.max(0, ss.truncate(distAlpha)));
    if (alpha > 254) {
        return;
    }
    alpha = ((255 - alpha) * opacity);
    if (Grids._starSprites == null) {
        Grids.initStarVertexBuffer(renderContext);
    }
    if (Grids._starSprites != null) {
        Grids._starSprites.draw(renderContext, alpha / 255, false);
    }
};

Grids.initStarVertexBuffer = function (renderContext) {
    if (!Grids._starsDownloading && !freestandingMode) {
        Grids.getStarFile(URLHelpers.singleton.coreStaticUrl('wwtweb/catalog.aspx?Q=hipparcos'));
        Grids._starsDownloading = true;
    }
    if (Grids._starSprites == null && Grids._starCount > 0) {
        var ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;
        var count = Grids._stars.length;
        Grids._starCount = count;
        Grids._starSprites = new PointList(renderContext);
        Grids._starSprites.depthBuffered = false;
        Grids._starSprites.showFarSide = true;
        var $enum1 = ss.enumerate(Grids._stars);
        while ($enum1.moveNext()) {
            var star = $enum1.current;
            var pos = Coordinates.raDecTo3dAu(star.RA, star.dec, star.distance);
            pos.rotateX(ecliptic);
            star.position = pos;
            var radDec = (1200000) / Math.pow(1.6, star.absoluteMagnitude);
            Grids._starSprites.addPoint(pos, star.col, new Dates(0, 1), radDec * 100);
        }
    }
};

Grids.initializeStarDB = function (text) {
    if (Grids._stars == null) {
        if (Grids._stars == null) {
            Grids._stars = [];
            var rows = text.split('\r\n');
            var star;
            var $enum1 = ss.enumerate(rows);
            while ($enum1.moveNext()) {
                var row = $enum1.current;
                var line = row;
                star = new Star(line);
                if (star.magnitude < Grids._limitingMagnitude && star.par > 0.001) {
                    Grids._stars.push(star);
                    Grids._hipparcosIndex[star.id] = star;
                }
            }
            Grids._starCount = Grids._stars.length;
        }
    }
};

Grids.getStarFile = function (url) {
    Grids._webFileStar = new WebFile(url);
    Grids._webFileStar.onStateChange = Grids.starFileStateChange;
    Grids._webFileStar.send();
};

Grids.starFileStateChange = function () {
    if (Grids._webFileStar.get_state() === 2) {
        alert(Grids._webFileStar.get_message());
    }
    else if (Grids._webFileStar.get_state() === 1) {
        Grids.initializeStarDB(Grids._webFileStar.getText());
    }
};

Grids.getGalaxyFile = function (url) {
    Grids._webFileGalaxy = new WebFile(url);
    Grids._webFileGalaxy.responseType = 'blob';
    Grids._webFileGalaxy.onStateChange = Grids.galaxyFileStateChange;
    Grids._webFileGalaxy.send();
};

Grids.galaxyFileStateChange = function () {
    if (Grids._webFileGalaxy.get_state() === 2) {
        alert(Grids._webFileGalaxy.get_message());
    }
    else if (Grids._webFileGalaxy.get_state() === 1) {
        var mainBlob = Grids._webFileGalaxy.getBlob();
        var chunck = new FileReader();
        chunck.onloadend = function (e) {
            var br = new BinaryReader(new Uint8Array(chunck.result));
            Grids.initializeCosmos(br);
        };
        chunck.readAsArrayBuffer(mainBlob);
    }
};

Grids.drawCosmos3D = function (renderContext, opacity) {
    var device = renderContext.gl;
    var zoom = renderContext.viewCamera.zoom;
    var distAlpha = ((Math.log(Math.max(1, zoom)) / Math.log(4)) - 15.5) * 90;
    var alpha = Math.min(255, Math.max(0, ss.truncate(distAlpha)));
    if (alpha < 3) {
        return;
    }
    Grids.initCosmosVertexBuffer();
    if (Grids._galaxyTextures == null) {
        if (Grids._largeSet) {
            Grids._galaxyTextures = new Array(256);
            for (var i = 0; i < 256; i++) {
                var num = i.toString();
                while (num.length < 4) {
                    num = '0' + num;
                }
                var name = ss.format(URLHelpers.singleton.engineAssetUrl('galimg/gal_{0}.jpg'), num);
                Grids._galaxyTextures[i] = Texture.fromUrl(name);
            }
        }
    }
    if (Grids._cosmosReady) {
        var count = 256;
        for (var i = 0; i < count; i++) {
            Grids._cosmosSprites[i].drawTextured(renderContext, Grids._galaxyTextures[i].texture2d, (alpha * opacity) / 255);
        }
    }
};

Grids.initCosmosVertexBuffer = function () {
    if (Grids._cosmosSprites == null) {
        Grids._downloadCosmosFile();
    }
};

Grids._createCosmosVertexBuffer = function (renderContext) {
    var device = tilePrepDevice;
    var bucketCount = 256;
    if (Grids._cosmosSprites != null) {
        for (var ij = 0; ij < bucketCount; ij++) {
            if (Grids._cosmosSprites[ij] != null) {
                Grids._cosmosSprites[ij] = null;
            }
        }
    }
    Grids._cosmosSprites = null;
    var ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;
    Grids._cosmosSprites = new Array(bucketCount);
    var indexList = new Array(bucketCount);
    for (var i = 0; i < bucketCount; i++) {
        var count = Grids._galaxyVertexCounts[i];
        Grids._cosmosSprites[i] = new PointList(renderContext);
        Grids._cosmosSprites[i].depthBuffered = false;
        Grids._cosmosSprites[i].showFarSide = true;
        indexList[i] = 0;
    }
    var $enum1 = ss.enumerate(Grids._cosmos);
    while ($enum1.moveNext()) {
        var galaxy = $enum1.current;
        var bucket = galaxy.eTypeBucket;
        var index = indexList[bucket];
        var pos = Coordinates.raDecTo3dAu(galaxy.RA, galaxy.dec, (galaxy.distance * 206264.806 * 1000000) / 0.73);
        pos.rotateX(ecliptic);
        galaxy.position = pos;
        Grids._cosmosSprites[bucket].addPoint(pos, Colors.get_white(), new Dates(0, 1), (1E+09 * galaxy.size * 100));
        indexList[bucket]++;
    }
    Grids._cosmosReady = true;
};

Grids.initializeCosmos = function (br) {
    var max = Math.pow(100, 2.849485002);
    if (Grids._cosmos == null) {
        Grids._galaxyVertexCounts = new Array((Grids._largeSet) ? 256 : 20);
        if (Grids._cosmos == null) {
            Grids._cosmos = [];
            var galaxy;
            try {
                var count = 0;
                while (br.get_position() < br.get_length()) {
                    galaxy = new Galaxy(br);
                    Grids._cosmos.push(galaxy);
                    Grids._galaxyVertexCounts[galaxy.eTypeBucket]++;
                    count++;
                }
            }
            catch ($e1) {
            }
            br.close();
        }
        Grids._createCosmosVertexBuffer(globalRenderContext);
    }
};

Grids._downloadCosmosFile = function () {
    if (!Grids._downloadingGalaxy && !freestandingMode) {
        Grids.getGalaxyFile(URLHelpers.singleton.coreStaticUrl('wwtweb/catalog.aspx?Q=cosmosnewbin'));
        Grids._downloadingGalaxy = true;
    }
    return false;
};

Grids.drawEquitorialGrid = function (renderContext, opacity, drawColor) {
    if (Grids._equLineList == null) {
        Grids._equLineList = new SimpleLineList();
        Grids._equLineList.set_depthBuffered(false);
        for (var hour = 0; hour < 24; hour++) {
            for (var dec = -80; dec < 80; dec += 2) {
                Grids._equLineList.addLine(Coordinates.raDecTo3dAu(hour, dec, 1), Coordinates.raDecTo3dAu(hour, dec + 2, 1));
            }
        }
        for (var dec = -80; dec <= 80; dec += 10) {
            for (var hour = 0; hour < 23.8; hour += 0.2) {
                Grids._equLineList.addLine(Coordinates.raDecTo3dAu(hour, dec, 1), Coordinates.raDecTo3dAu(hour + 0.2, dec, 1));
                //todo fix for color bright
            }
        }
        var counter = 0;
        for (var ra = 0; ra < 24; ra += 0.25) {
            var dec = 0.5;
            switch (counter % 4) {
                case 0:
                    counter++;
                    continue;
                case 3:
                case 1:
                    dec = 0.25;
                    break;
            }
            counter++;
            Grids._equLineList.addLine(Coordinates.raDecTo3dAu(ra, dec, 1), Coordinates.raDecTo3dAu(ra, -dec, 1));
        }
        counter = 0;
        for (var ra = 0; ra < 24; ra += 3) {
            counter = 0;
            for (var dec = -80; dec <= 80; dec += 1) {
                var width = 0.5 / 30;
                switch (counter % 10) {
                    case 0:
                        counter++;
                        continue;
                    case 5:
                        width = 0.5 / 15;
                        break;
                }
                counter++;
                Grids._equLineList.addLine(Coordinates.raDecTo3dAu(ra + width, dec, 1), Coordinates.raDecTo3dAu(ra - width, dec, 1));
            }
        }
    }
    Grids._equLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids.drawEquitorialGridText = function (renderContext, opacity, drawColor) {
    Grids._makeEquitorialGridText();
    Grids._equTextBatch.draw(renderContext, opacity, drawColor);
    return true;
};

Grids._makeEquitorialGridText = function () {
    if (Grids._equTextBatch == null) {
        Grids._equTextBatch = new Text3dBatch(30);
        var index = 0;
        for (var ra = 0; ra < 24; ra++) {
            var text = ra.toString() + ' hr';
            if (ra < 10) {
                text = '  ' + ra.toString() + ' hr';
            }
            Grids._equTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(ra + 0.005, 0.4, 1), Coordinates.raDecTo3dAu(ra + 0.005, 0.5, 1), text, 45, 0.00018));
        }
        index = 0;
        for (var ra = 0; ra < 24; ra += 3) {
            for (var dec = -80; dec <= 80; dec += 10) {
                if (!dec) {
                    continue;
                }
                var text = dec.toString();
                if (dec > 0) {
                    text = '  +' + dec.toString();
                    Grids._equTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(ra, dec - 0.4, 1), Coordinates.raDecTo3dAu(ra, dec - 0.3, 1), text, 45, 0.00018));
                }
                else {
                    text = '  - ' + text.substr(1);
                    Grids._equTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(ra, dec + 0.4, 1), Coordinates.raDecTo3dAu(ra, dec + 0.5, 1), text, 45, 0.00018));
                }
                index++;
            }
        }
    }
};

Grids.drawEcliptic = function (renderContext, opacity, drawColor) {
    var col = drawColor;
    var year = SpaceTimeController.get_now().getUTCFullYear();
    if (Grids._eclipticOverviewLineList == null || year !== Grids._eclipticYear) {
        if (Grids._eclipticOverviewLineList != null) {
            Grids._eclipticOverviewLineList.clear();
            Grids._eclipticOverviewLineList = null;
        }
        Grids._eclipticYear = year;
        var obliquity = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow());
        var mat = Matrix3d._rotationX((-obliquity / 360 * (Math.PI * 2)));
        var daysPerYear = 365.25;
        if (DT.isLeap(year, true)) {
            Grids._monthDays[1] = 29;
            daysPerYear = 366;
        } else {
            Grids._monthDays[1] = 28;
            daysPerYear = 365;
        }
        var count = 2 * ss.truncate(daysPerYear);
        Grids._eclipticCount = ss.truncate(daysPerYear);
        var jYear = SpaceTimeController.utcToJulian(new Date(year, 0, 1, 12, 0, 0));
        var index = 0;
        var d = 0;
        Grids._eclipticOverviewLineList = new SimpleLineList();
        Grids._eclipticOverviewLineList.set_depthBuffered(false);
        for (var m = 0; m < 12; m++) {
            var daysThisMonth = ss.truncate(Grids._monthDays[m]);
            for (var i = 0; i < daysThisMonth; i++) {
                var sunRaDec = Planets.getPlanetLocationJD('Sun', jYear);
                var sunEcliptic = CT.eq2Ec(sunRaDec.RA, sunRaDec.dec, obliquity);
                d = sunEcliptic.x;
                var width = 0.005;
                if (!i) {
                    width = 0.01;
                }
                var dd = d;
                Grids._eclipticOverviewLineList.addLine(Vector3d._transformCoordinate(Vector3d.create(Math.cos((dd * Math.PI * 2) / 360), width, Math.sin((dd * Math.PI * 2) / 360)), mat), Vector3d._transformCoordinate(Vector3d.create(Math.cos((dd * Math.PI * 2) / 360), -width, Math.sin((dd * Math.PI * 2) / 360)), mat));
                index++;
                jYear += 1;
            }
            d += Grids._monthDays[m];
        }
    }
    Grids._eclipticOverviewLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids.drawEclipticText = function (renderContext, opacity, drawColor) {
    Grids._makeEclipticText();
    Grids._eclipOvTextBatch.draw(renderContext, opacity, drawColor);
    return true;
};

Grids._makeEclipticText = function () {
    var year = SpaceTimeController.get_now().getUTCFullYear();
    if (Grids._eclipOvTextBatch == null) {
        Grids._eclipOvTextBatch = new Text3dBatch(80);
        Grids._eclipticTextYear = year;
        var obliquity = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow());
        var mat = Matrix3d._rotationX((-obliquity / 360 * (Math.PI * 2)));
        var daysPerYear = 365.25;
        if (DT.isLeap(year, true)) {
            Grids._monthDays[1] = 29;
            daysPerYear = 366;
        } else {
            Grids._monthDays[1] = 28;
            daysPerYear = 365;
        }
        var count = 2 * ss.truncate(daysPerYear);
        Grids._eclipticCount = ss.truncate(daysPerYear);
        var jYear = SpaceTimeController.utcToJulian(new Date(year, 0, 1, 12, 0, 0));
        var index = 0;
        var d = 0;
        for (var m = 0; m < 12; m++) {
            var daysThisMonth = ss.truncate(Grids._monthDays[m]);
            for (var i = 0; i < daysThisMonth; i++) {
                var sunRaDec = Planets.getPlanetLocationJD('Sun', jYear);
                var sunEcliptic = CT.eq2Ec(sunRaDec.RA, sunRaDec.dec, obliquity);
                d = sunEcliptic.x;
                var dd = d;
                if (i === Math.floor(daysThisMonth / 2)) {
                    var center = Vector3d._transformCoordinate(Vector3d.create(Math.cos((dd * Math.PI * 2) / 360), 0.025, Math.sin((dd * Math.PI * 2) / 360)), mat);
                    var up = Vector3d._transformCoordinate(Vector3d.create(Math.cos((dd * Math.PI * 2) / 360), 0.045, Math.sin((dd * Math.PI * 2) / 360)), mat);
                    up.subtract(center);
                    up.normalize();
                    Grids._eclipOvTextBatch.add(new Text3d(center, up, Grids._monthNames[m], 80, 0.000159375));
                }
                index++;
                index++;
                jYear += 1;
            }
            d += Grids._monthDays[m];
        }
    }
};

Grids.drawPrecessionChart = function (renderContext, opacity, drawColor) {
    Grids._makePrecessionChart();
    Grids._precTextBatch.draw(renderContext, opacity, drawColor);
    Grids._precLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids._makePrecessionChart = function () {
    var obliquity = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow());
    var mat = Matrix3d._rotationX((obliquity / 360 * (Math.PI * 2)));
    var col = Colors.get_white();
    if (Grids._precLineList == null) {
        Grids._precLineList = new SimpleLineList();
        Grids._precLineList.set_depthBuffered(false);
        for (var l = 0; l < 360; l++) {
            var b = 90 - obliquity;
            Grids._precLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu((l + 1) / 15, b, 1), mat));
        }
        for (var l = -12000; l < 13000; l += 2000) {
            var b = 90 - obliquity;
            var p = -((l - 2000) / 25772 * 24) - 6;
            Grids._precLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(p, b - 0.5, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(p, b + 0.5, 1), mat));
        }
    }
    if (Grids._precTextBatch == null) {
        Grids._precTextBatch = new Text3dBatch(50);
        for (var l = -12000; l < 13000; l += 2000) {
            var b = 90 - obliquity + 3;
            var p = -((l - 2000) / 25772 * 24) - 6;
            var text = l.toString();
            if (!l) {
                b = 90 - obliquity + 2;
                text = '1 CE';
            }
            else if (l < 0) {
                text = '  ' + Math.abs(l).toString() + ' BCE';
            }
            else {
                text = Math.abs(l).toString() + ' CE';
            }
            if (text.length === 9) {
                text = '   ' + text;
            }
            Grids._precTextBatch.add(new Text3d(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(p, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(p + 0.01, b, 1), mat), text, 75, 0.00015));
        }
    }
    return;
};

Grids.drawAltAzGrid = function (renderContext, opacity, drawColor) {
    var zenithAltAz = new Coordinates(0, 0);
    var zenith = Coordinates.horizonToEquitorial(zenithAltAz, SpaceTimeController.get_location(), SpaceTimeController.get_now());
    var raPart = -((zenith.get_RA() + 6) / 24 * (Math.PI * 2));
    var decPart = -(zenith.get_dec() / 360 * (Math.PI * 2));
    var raText = Coordinates.formatDMS(zenith.get_RA());
    var mat = Matrix3d._rotationY(-raPart);
    mat._multiply(Matrix3d._rotationX(decPart));
    mat.invert();
    if (Grids._altAzLineList == null) {
        Grids._altAzLineList = new SimpleLineList();
        Grids._altAzLineList.set_depthBuffered(false);
        for (var l = 0; l < 360; l += 10) {
            for (var b = -80; b < 80; b += 2) {
                Grids._altAzLineList.addLine(Coordinates.raDecTo3dAu(l / 15, b, 1), Coordinates.raDecTo3dAu(l / 15, b + 2, 1));
            }
        }
        for (var b = -80; b <= 80; b += 10) {
            for (var l = 0; l < 360; l += 5) {
                Grids._altAzLineList.addLine(Coordinates.raDecTo3dAu(l / 15, b, 1), Coordinates.raDecTo3dAu((l + 5) / 15, b, 1));
            }
        }
        var counter = 0;
        for (var l = 0; l < 360; l += 1) {
            var b = 0.25;
            switch (counter % 10) {
                case 0:
                    counter++;
                    continue;
                case 5:
                    b = 0.5;
                    break;
            }
            counter++;
            Grids._altAzLineList.addLine(Coordinates.raDecTo3dAu(l / 15, b, 1), Coordinates.raDecTo3dAu(l / 15, -b, 1));
        }
        counter = 0;
        for (var l = 0; l < 360; l += 90) {
            counter = 0;
            for (var b = -80; b <= 80; b += 1) {
                var width = 0.5 / 2;
                switch (counter % 10) {
                    case 0:
                        counter++;
                        continue;
                    case 5:
                        width = 0.5;
                        break;
                }
                counter++;
                Grids._altAzLineList.addLine(Coordinates.raDecTo3dAu((l + width) / 15, b, 1), Coordinates.raDecTo3dAu((l - width) / 15, b, 1));
            }
        }
    }
    var matOldWorld = renderContext.get_world().clone();
    var matOldWorldBase = renderContext.get_worldBase().clone();
    renderContext.set_worldBase(Matrix3d.multiplyMatrix(mat, renderContext.get_world()));
    renderContext.set_world(renderContext.get_worldBase().clone());
    renderContext.makeFrustum();
    Grids._altAzLineList.viewTransform = Matrix3d.invertMatrix(mat);
    Grids._altAzLineList.drawLines(renderContext, opacity, drawColor);
    renderContext.set_worldBase(matOldWorldBase);
    renderContext.set_world(matOldWorld);
    renderContext.makeFrustum();
    return true;
};

Grids.drawAltAzGridText = function (renderContext, opacity, drawColor) {
    var zenithAltAz = new Coordinates(0, 0);
    var zenith = Coordinates.horizonToEquitorial(zenithAltAz, SpaceTimeController.get_location(), SpaceTimeController.get_now());
    var raPart = -((zenith.get_RA() - 6) / 24 * (Math.PI * 2));
    var decPart = -(zenith.get_dec() / 360 * (Math.PI * 2));
    var raText = Coordinates.formatDMS(zenith.get_RA());
    var mat = Matrix3d._rotationY(-raPart - Math.PI);
    mat._multiply(Matrix3d._rotationX(decPart));
    mat.invert();
    Grids._makeAltAzGridText();
    var matOldWorld = renderContext.get_world().clone();
    var matOldWorldBase = renderContext.get_worldBase().clone();
    renderContext.set_worldBase(Matrix3d.multiplyMatrix(mat, renderContext.get_world()));
    renderContext.set_world(renderContext.get_worldBase().clone());
    renderContext.makeFrustum();
    Grids._altAzTextBatch.viewTransform = Matrix3d.invertMatrix(mat);
    Grids._altAzTextBatch.draw(renderContext, opacity, drawColor);
    renderContext.set_worldBase(matOldWorldBase);
    renderContext.set_world(matOldWorld);
    renderContext.makeFrustum();
    return true;
};

Grids._makeAltAzGridText = function () {
    var drawColor = Colors.get_white();
    var index = 0;
    if (Grids._altAzTextBatch == null) {
        Grids._altAzTextBatch = new Text3dBatch(30);
        for (var l = 0; l < 360; l += 10) {
            var text = '       ' + l.toString();
            if (l < 10) {
                text = '   ' + l.toString();
            }
            else if (l < 100) {
                text = '     ' + l.toString();
            }
            var lc = 360 - l;
            Grids._altAzTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(lc / 15 - 6, 0.4, 1), Coordinates.raDecTo3dAu(lc / 15 - 6, 0.5, 1), text, 75, 0.00018));
        }
        index = 0;
        for (var l = 0; l < 360; l += 90) {
            for (var b = -80; b <= 80; b += 10) {
                if (!b) {
                    continue;
                }
                var text = b.toString();
                if (b > 0) {
                    text = '  +' + b.toString();
                    Grids._altAzTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(l / 15, b - 0.4, 1), Coordinates.raDecTo3dAu(l / 15, b - 0.3, 1), text, 75, 0.00018));
                }
                else {
                    text = '  - ' + text.substr(1);
                    Grids._altAzTextBatch.add(new Text3d(Coordinates.raDecTo3dAu(l / 15, b + 0.4, 1), Coordinates.raDecTo3dAu(l / 15, b + 0.5, 1), text, 75, 0.00018));
                }
                index++;
            }
        }
    }
    return;
};

Grids.drawEclipticGrid = function (renderContext, opacity, drawColor) {
    if (Grids._eclipticLineList == null) {
        Grids._eclipticLineList = new SimpleLineList();
        Grids._eclipticLineList.set_depthBuffered(false);
        var obliquity = Coordinates.meanObliquityOfEcliptic(2451545);
        var mat = Matrix3d._rotationX((-obliquity / 360 * (Math.PI * 2)));
        for (var l = 0; l < 360; l += 10) {
            for (var b = -80; b < 80; b += 2) {
                Grids._eclipticLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b + 2, 1), mat));
            }
        }
        for (var b = -80; b <= 80; b += 10) {
            for (var l = 0; l < 360; l += 5) {
                Grids._eclipticLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu((l + 5) / 15, b, 1), mat));
            }
        }
        var counter = 0;
        for (var l = 0; l < 360; l += 1) {
            var b = 0.25;
            switch (counter % 10) {
                case 0:
                    counter++;
                    continue;
                case 5:
                    b = 0.5;
                    break;
            }
            counter++;
            Grids._eclipticLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, -b, 1), mat));
        }
        counter = 0;
        for (var l = 0; l < 360; l += 90) {
            counter = 0;
            for (var b = -80; b <= 80; b += 1) {
                var width = 0.5 / 2;
                switch (counter % 10) {
                    case 0:
                        counter++;
                        continue;
                    case 5:
                        width = 0.5;
                        break;
                }
                counter++;
                Grids._eclipticLineList.addLine(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu((l + width) / 15, b, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu((l - width) / 15, b, 1), mat));
            }
        }
    }
    Grids._eclipticLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids.drawEclipticGridText = function (renderContext, opacity, drawColor) {
    Grids._makeEclipticGridText();
    Grids._eclipticTextBatch.draw(renderContext, opacity, drawColor);
    return true;
};

Grids._makeEclipticGridText = function () {
    var drawColor = Colors.get_white();
    var obliquity = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow());
    var mat = Matrix3d._rotationX((-obliquity / 360 * (Math.PI * 2)));
    if (Grids._eclipticTextBatch == null) {
        Grids._eclipticTextBatch = new Text3dBatch(30);
        for (var l = 0; l < 360; l += 10) {
            var text = '       ' + l.toString();
            if (l < 10) {
                text = '   ' + l.toString();
            }
            else if (l < 100) {
                text = '     ' + l.toString();
            }
            Grids._eclipticTextBatch.add(new Text3d(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, 0.4, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, 0.5, 1), mat), text, 75, 0.00018));
        }
        for (var l = 0; l < 360; l += 90) {
            for (var b = -80; b <= 80; b += 10) {
                if (!b) {
                    continue;
                }
                var text = b.toString();
                if (b > 0) {
                    text = '  +' + b.toString();
                    Grids._eclipticTextBatch.add(new Text3d(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b - 0.4, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b - 0.3, 1), mat), text, 75, 0.00018));
                }
                else {
                    text = '  - ' + text.substr(1);
                    Grids._eclipticTextBatch.add(new Text3d(Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b + 0.4, 1), mat), Vector3d._transformCoordinate(Coordinates.raDecTo3dAu(l / 15, b + 0.5, 1), mat), text, 75, 0.00018));
                }
            }
        }
    }
    return;
};

Grids.drawGalacticGrid = function (renderContext, opacity, drawColor) {
    if (Grids._galLineList == null) {
        Grids._galLineList = new SimpleLineList();
        Grids._galLineList.set_depthBuffered(false);
        for (var l = 0; l < 360; l += 10) {
            for (var b = -80; b < 80; b += 2) {
                Grids._galLineList.addLine(Coordinates.galacticTo3dDouble(l, b), Coordinates.galacticTo3dDouble(l, b + 2));
            }
        }
        for (var b = -80; b <= 80; b += 10) {
            for (var l = 0; l < 360; l += 5) {
                Grids._galLineList.addLine(Coordinates.galacticTo3dDouble(l, b), Coordinates.galacticTo3dDouble(l + 5, b));
            }
        }
        var counter = 0;
        for (var l = 0; l < 360; l += 1) {
            var b = 0.25;
            switch (counter % 10) {
                case 0:
                    counter++;
                    continue;
                case 5:
                    b = 0.5;
                    break;
            }
            counter++;
            Grids._galLineList.addLine(Coordinates.galacticTo3dDouble(l, b), Coordinates.galacticTo3dDouble(l, -b));
        }
        counter = 0;
        for (var l = 0; l < 360; l += 90) {
            counter = 0;
            for (var b = -80; b <= 80; b += 1) {
                var width = 0.5 / 2;
                switch (counter % 10) {
                    case 0:
                        counter++;
                        continue;
                    case 5:
                        width = 0.5;
                        break;
                }
                counter++;
                Grids._galLineList.addLine(Coordinates.galacticTo3dDouble(l + width, b), Coordinates.galacticTo3dDouble(l - width, b));
            }
        }
    }
    Grids._galLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids.drawGalacticGridText = function (renderContext, opacity, drawColor) {
    Grids._makeGalacticGridText();
    Grids._galTextBatch.draw(renderContext, opacity, drawColor);
    return true;
};

Grids._makeGalacticGridText = function () {
    if (Grids._galTextBatch == null) {
        Grids._galTextBatch = new Text3dBatch(30);
        for (var l = 0; l < 360; l += 10) {
            var text = '       ' + l.toString();
            if (l < 10) {
                text = '   ' + l.toString();
            }
            else if (l < 100) {
                text = '     ' + l.toString();
            }
            Grids._galTextBatch.add(new Text3d(Coordinates.galacticTo3dDouble(l, 0.4), Coordinates.galacticTo3dDouble(l, 0.5), text, 75, 0.00018));
        }
        for (var l = 0; l < 360; l += 90) {
            for (var b = -80; b <= 80; b += 10) {
                if (!b) {
                    continue;
                }
                var text = b.toString();
                if (b > 0) {
                    text = '  +' + b.toString();
                    Grids._galTextBatch.add(new Text3d(Coordinates.galacticTo3dDouble(l, b - 0.4), Coordinates.galacticTo3dDouble(l, b - 0.3), text, 75, 0.00018));
                }
                else {
                    text = '  - ' + text.substr(1);
                    Grids._galTextBatch.add(new Text3d(Coordinates.galacticTo3dDouble(l, b + 0.4), Coordinates.galacticTo3dDouble(l, b + 0.5), text, 75, 0.00018));
                }
            }
        }
    }
};

Grids.drawPlanetGrid = function (renderContext, opacity, drawColor) {
    if (Grids._planetLineList == null) {
        Grids._planetLineList = new SimpleLineList();
        Grids._planetLineList.set_depthBuffered(true);
        var col = drawColor;
        for (var lng = 0; lng < 360; lng += 10) {
            for (var lat = -80; lat < 80; lat += 2) {
                Grids._planetLineList.addLine(Coordinates.geoTo3dDouble(lat, lng), Coordinates.geoTo3dDouble(lat + 2, lng));
            }
        }
        for (var lat = -80; lat <= 80; lat += 10) {
            for (var l = 0; l < 360; l += 5) {
                Grids._planetLineList.addLine(Coordinates.geoTo3dDouble(lat, l), Coordinates.geoTo3dDouble(lat, l + 5));
            }
        }
        var counter = 0;
        for (var lng = 0; lng < 360; lng += 1) {
            var lat = 0.25;
            switch (counter % 10) {
                case 0:
                    counter++;
                    continue;
                case 5:
                    lat = 0.5;
                    break;
            }
            counter++;
            Grids._planetLineList.addLine(Coordinates.geoTo3dDouble(lat, lng), Coordinates.geoTo3dDouble(-lat, lng));
        }
        counter = 0;
        for (var lng = 0; lng < 360; lng += 90) {
            counter = 0;
            for (var b = -80; b <= 80; b += 1) {
                var width = 0.5 / 2;
                switch (counter % 10) {
                    case 0:
                        counter++;
                        continue;
                    case 5:
                        width = 0.5;
                        break;
                }
                counter++;
                Grids._planetLineList.addLine(Coordinates.geoTo3dDouble(b, lng + width), Coordinates.geoTo3dDouble(b, lng - width));
            }
        }
    }
    Grids._planetLineList.aaFix = false;
    Grids._planetLineList.set_depthBuffered(true);
    Grids._planetLineList.sky = false;
    Grids._planetLineList.drawLines(renderContext, opacity, drawColor);
    return true;
};

Grids.drawPlanetGridText = function (renderContext, opacity, drawColor) {
    Grids._makePlanetGridText();
    Grids._planetTextBatch.draw(renderContext, opacity, drawColor);
    return true;
};

Grids._makePlanetGridText = function () {
    if (Grids._planetTextBatch == null) {
        Grids._planetTextBatch = new Text3dBatch(80);
        for (var lng = -180; lng < 180; lng += 10) {
            var text = '       ' + lng.toString();
            if (lng < 10) {
                text = '   ' + lng.toString();
            }
            else if (lng < 100) {
                text = '     ' + lng.toString();
            }
            Grids._planetTextBatch.add(new Text3d(Coordinates.geoTo3dDouble(0.4, lng), Coordinates.geoTo3dDouble(0.5, lng), text, -80, 6E-05));
        }
        for (var lng = 0; lng < 360; lng += 90) {
            for (var lat = -80; lat <= 80; lat += 10) {
                if (!lat) {
                    continue;
                }
                var text = lat.toString();
                if (lat > 0) {
                    text = '  +' + lat.toString();
                    Grids._planetTextBatch.add(new Text3d(Coordinates.geoTo3dDouble(lat - 0.4, lng), Coordinates.geoTo3dDouble(lat - 0.3, lng), text, -80, 6E-05));
                }
                else {
                    text = '  - ' + text.substring(1);
                    Grids._planetTextBatch.add(new Text3d(Coordinates.geoTo3dDouble(lat + 0.4, lng), Coordinates.geoTo3dDouble(lat + 0.5, lng), text, -80, 6E-05));
                }
            }
        }
    }
};

var Grids$ = {};

registerType("Grids", [Grids, Grids$, null]);
