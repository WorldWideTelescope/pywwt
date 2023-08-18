// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The 3D planet-related code.
//
// This does not include the 3D planet-rendering code, which has been separated
// into `planets_3d.js`.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d, Vector4d, Matrix3d, PositionTexture } from "./double3d.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { PositionTextureVertexBuffer } from "./graphics/gl_buffers.js";
import { OrbitLineList } from "./graphics/primitives3d.js";
import { Texture } from "./graphics/texture.js";
import { TileShader } from "./graphics/shaders.js";
import { Util } from "./baseutil.js";
import { BasePlanets } from "./baseplanets.js";
import { globalWWTControl } from "./data_globals.js";
import { Color, Colors } from "./color.js";
import { Planets } from "./planets.js";
import { RenderTriangle } from "./render_triangle.js";
import { Settings } from "./settings.js";
import { Triangle } from "./triangle.js";
import { UiTools } from "./ui_tools.js";
import { URLHelpers } from "./url_helpers.js";
import { EllipseRenderer } from "./layers/orbit.js";
import { LayerManager } from "./layers/layer_manager.js";


// 3D planet code. This used to live in `Planets.cs` with the 2D planet.

export function Planets3d() { }

Planets3d._ringsTriangleLists = new Array(2);
Planets3d._ringImage = null;
Planets3d._triangleCountRings = 192 + 1 * 2;
Planets3d._ringsVertexBuffer = null;

Planets3d.getImageSetNameNameFrom3dId = function (id) {
    switch (id) {
        case 0:
            return 'Sun';
        case 1:
            return 'Mercury';
        case 2:
            return 'Venus';
        case 3:
            return 'Visible Imagery';
        case 4:
            return 'Jupiter';
        case 5:
            return 'Saturn';
        case 6:
            return 'Uranus';
        case 7:
            return 'Neptune';
        case 8:
            return 'Pluto';
        case 9:
            return 'Moon';
        case 10:
            return 'Io (Jupiter)';
        case 11:
            return 'Europa (Jupiter)';
        case 12:
            return 'Ganymede (Jupiter)';
        case 13:
            return 'Callisto (Jupiter)';
        case 19:
            return 'Bing Maps Aerial';
        default:
            return '';
    }
};

Planets3d.initPlanetResources = function (renderContext) { };

Planets3d.drawPlanets3D = function (renderContext, opacity, centerPoint) {
    Planets3d.initPlanetResources(renderContext);
    var distss = UiTools.solarSystemToMeters(renderContext.get_solarSystemCameraDistance());
    var moonFade = Math.min(1, Math.max(Util.log10(distss) - 7.3, 0));
    var fade = Math.min(1, Math.max(Util.log10(distss) - 8.6, 0));
    if (Settings.get_active().get_solarSystemOrbits() && fade > 0) {
        for (var ii = 1; ii < 10; ii++) {
            var id = ii;
            if (ii === 9) {
                id = 19;
            }
            var angle = Math.atan2(Planets._planet3dLocations[id].z, Planets._planet3dLocations[id].x);
            Planets3d._drawSingleOrbit(renderContext, Planets.planetColors[id], id, centerPoint, angle, Planets._planet3dLocations[id], fade);
        }
        var mid = 9;
        Planets3d._drawSingleOrbit(renderContext, Planets.planetColors[mid], mid, centerPoint, 0, Planets._planet3dLocations[mid], fade);
    }
    ss.clearKeys(Planets._drawOrder);
    var camera = renderContext.cameraPosition.copy();
    for (var planetId = 0; planetId < 14; planetId++) {
        // If we're using realistic lighting and this is an eclipsed
        // moon, don't draw it at all. This is slightly suboptimal
        // since, if you're looking at the moon, you'll suddenly be able
        // to see the stars through it. In principle we should do
        // something like keep on drawing it, but as an all-black
        // sphere.
        if (!(Settings.get_active().get_solarSystemLighting() && Planets._planetLocations[planetId].eclipsed)) {
            var distVector = Vector3d.subtractVectors(camera, Vector3d.subtractVectors(Planets._planet3dLocations[planetId], centerPoint));
            if (!ss.keyExists(Planets._drawOrder, distVector.length())) {
                Planets._drawOrder[distVector.length()] = planetId;
            }
        }
    }
    var distVectorEarth = Vector3d.subtractVectors(camera, Vector3d.subtractVectors(Planets._planet3dLocations[19], centerPoint));
    if (!ss.keyExists(Planets._drawOrder, distVectorEarth.length())) {
        Planets._drawOrder[distVectorEarth.length()] = 19;
    }
    var $enum1 = ss.enumerate(ss.keys(Planets._drawOrder));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var planetId = Planets._drawOrder[key];
        Planets3d._drawPlanet3d(renderContext, planetId, centerPoint);
    }
    return true;
};

Planets3d._drawSingleOrbit = function (renderContext, eclipticColor, id, centerPoint, startAngle, planetNow, opacity) {
    // mu is the standard gravitational parameter GM, where G
    // is the gravitational constant and M is the mass of the
    // central body.
    const muSun = 1.327124400188e11; // km^3/s^2
    const muEarth = 3.9860044189e5;
    const muMoon = 4.9027779e3;
    const muJupiter = 1.26686534e8;

    if (opacity < 0.01) {
        return;
    }
    if (renderContext.gl == null) {
        var count = Planets._orbitalSampleRate;
        var planetDropped = false;
        var viewPoint = renderContext.get_viewPoint();
        var ctx = renderContext.device;
        ctx.save();
        ctx.strokeStyle = eclipticColor.toString();
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        var point = new Vector3d();
        var pointTest = new Vector3d();
        var lastPoint = new Vector3d();
        var firstPoint = true;
        var translate = Matrix3d.translation(Vector3d.negate(centerPoint));
        var mat = Matrix3d.multiplyMatrix(translate, renderContext.WVP);
        var matWV = Matrix3d.multiplyMatrix(translate, renderContext.WV);
        for (var i = 0; i < count; i++) {
            var pnt = Planets._orbits[id][i];
            var angle = (Math.atan2(Planets._orbits[id][i].z, Planets._orbits[id][i].x) + Math.PI * 2 - startAngle) % (Math.PI * 2);
            var alpha = ss.truncate((angle / (Math.PI * 2) * 255));
            var alphaD = alpha / 255;
            if (alpha < 2 && !planetDropped) {
                pnt = planetNow;
                alphaD = 1;
            }
            pointTest = matWV.transform(pnt);
            point = mat.transform(pnt);
            if (pointTest.z > 0) {
                if (firstPoint) {
                    firstPoint = false;
                }
                else {
                    ctx.beginPath();
                    ctx.globalAlpha = alphaD * opacity;
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            }
            lastPoint = point;
        }
        ctx.restore();
    }
    else {
        if (id !== 9) {
            var count = Planets._orbitalSampleRate;
            var planetDropped = false;
            var viewPoint = renderContext.get_viewPoint();
            var point = new Vector3d();
            var pointTest = new Vector3d();
            var lastPoint = new Vector3d();
            var lastColor = new Color();
            var firstPoint = true;
            var list = new OrbitLineList();
            for (var i = 0; i < count; i++) {
                var pnt = Planets._orbits[id][i].copy();
                var angle = (Math.atan2(pnt.z, pnt.x) + Math.PI * 2 - startAngle) % (Math.PI * 2);
                var alpha = ss.truncate((angle / (Math.PI * 2) * 255));
                var alphaD = alpha / 255;
                var color = Color.fromArgb(alpha, eclipticColor.r, eclipticColor.g, eclipticColor.b);
                if (alpha < 2 && !planetDropped && !firstPoint) {
                    pnt = Vector3d.subtractVectors(planetNow, centerPoint);
                    alphaD = 1;
                    alpha = 255;
                    color.a = 255;
                    lastColor.a = 255;
                    list.addLine(lastPoint, pnt.copy(), lastColor._clone(), color._clone());
                    lastColor.a = 0;
                    color.a = 0;
                    pnt = Planets._orbits[id][i].copy();
                    planetDropped = true;
                }
                pnt = Vector3d.subtractVectors(pnt, centerPoint);
                if (firstPoint) {
                    firstPoint = false;
                }
                else {
                    list.addLine(lastPoint, pnt, lastColor, color);
                }
                lastPoint = pnt;
                lastColor = color._clone();
            }
            list.drawLines(renderContext, 1, Colors.get_white());
            list.clear();
        } else {
            var mu = 0;
            switch (id) {
                case 9:
                    mu = muEarth + muMoon;
                    break;
                case 10:
                case 11:
                case 12:
                case 13:
                    mu = muJupiter;
                    break;
                default:
                    mu = muSun;
                    break;
            }
            var deltaT = 1 / 1440 * 0.1;
            var r0 = Planets.getPlanetPositionDirect(id, Planets._jNow);
            var r1 = Planets.getPlanetPositionDirect(id, Planets._jNow - deltaT);
            var v = Vector3d.scale(Vector3d.subtractVectors(r0, r1), 1 / deltaT);
            var elements = Planets._stateVectorToKeplerian(r0, v, mu);
            Planets3d._drawSingleOrbitElements(renderContext, eclipticColor, id, centerPoint, startAngle, planetNow, elements);
        }
    }
};

Planets3d._drawSingleOrbitElements = function (renderContext, eclipticColor, id, centerPoint, xstartAngle, planetNow, el) {
    var scaleFactor;
    switch (id) {
        case 9:
            if (Settings.get_active().get_solarSystemScale() > 1) {
                scaleFactor = Settings.get_active().get_solarSystemScale() / 2;
            }
            else {
                scaleFactor = 1;
            }
            break;
        case 10:
        case 11:
        case 12:
        case 13:
            scaleFactor = Settings.get_active().get_solarSystemScale();
            break;
        default:
            scaleFactor = 1;
            break;
    }
    var translation = Vector3d.negate(centerPoint);
    if (id === 9) {
        translation.add(Planets._planet3dLocations[19]);
    }
    else if (id === 10 || id === 11 || id === 12 || id === 13) {
        translation.add(Planets._planet3dLocations[4]);
    }
    var currentPosition = Vector3d.subtractVectors(planetNow, centerPoint);
    var worldMatrix = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(el.orientation, Matrix3d.translation(translation)), renderContext.get_world());
    EllipseRenderer.drawEllipseWithPosition(renderContext, el.a / 149598000 * scaleFactor, el.e, el.ea, eclipticColor, worldMatrix, currentPosition);
};

Planets3d.isPlanetInFrustum = function (renderContext, rad) {
    var frustum = renderContext.get_frustum();
    var center = Vector3d.create(0, 0, 0);
    var centerV4 = new Vector4d(0, 0, 0, 1);
    for (var i = 0; i < 6; i++) {
        if (frustum[i].dot(centerV4) + rad < 0) {
            return false;
        }
    }
    return true;
};

Planets3d._drawPlanet3d = function (renderContext, planetID, centerPoint) {
    if (planetID === 0) {
        TileShader.minLightingBrightness = 1;
    }
    else {
        TileShader.minLightingBrightness = 0.025;
        if (planetID === 19) {
            TileShader.atmosphereColor = Color.fromArgb(255, 65, 157, 217);
        } else {
            TileShader.atmosphereColor = Color.fromArgb(0, 0, 0, 0);
        }
    }
    var matOld = renderContext.get_world();
    var matOldBase = renderContext.get_worldBase();
    var matOldNonRotating = renderContext.get_worldBaseNonRotating();
    var radius = Planets.getAdjustedPlanetRadius(planetID);
    Planets.setupPlanetMatrix(renderContext, planetID, centerPoint, true);
    var planetWidth = 1;
    if (planetID === 5) {
        planetWidth = 3;
    }
    if (Planets3d.isPlanetInFrustum(renderContext, planetWidth)) {
        // Save all matrices modified by SetupMatrix...
        var matOld2 = renderContext.get_world();
        var matOldBase2 = renderContext.get_worldBase();
        var matOldNonRotating2 = renderContext.get_worldBaseNonRotating();
        var sun = Planets._planet3dLocations[0].copy();
        var planet = Planets._planet3dLocations[planetID].copy();
        sun = matOld.transform(sun);
        planet = matOld.transform(planet);
        renderContext.set_world(matOld);
        renderContext.set_worldBase(matOldBase);
        renderContext.set_worldBaseNonRotating(matOldNonRotating);
        Planets._setupMatrixForPlanetGeometry(renderContext, planetID, centerPoint, true);
        var sunPosition = Vector3d.subtractVectors(sun, planet);
        sunPosition.normalize();
        renderContext.set_sunPosition(sunPosition);
        TileShader.sunPosition = Vector3d.subtractVectors(Planets._planet3dLocations[0], planet);
        var loc = Vector3d.subtractVectors(Planets._planet3dLocations[planetID], centerPoint);
        loc.subtract(renderContext.cameraPosition);
        var dist = loc.length();
        var sizeIndexParam = (2 * Math.atan(0.5 * (radius / dist))) / Math.PI * 180;
        var sizeIndex = 0;
        if (sizeIndexParam > 10.5) {
            sizeIndex = 0;
        } else if (sizeIndexParam > 3.9) {
            sizeIndex = 1;
        } else if (sizeIndexParam > 0.72) {
            sizeIndex = 2;
        } else if (sizeIndexParam > 0.05) {
            sizeIndex = 3;
        } else {
            sizeIndex = 4;
        }
        if (planetID === 19 && sizeIndex < 2) {
            var width = Settings.get_active().get_solarSystemScale() * 1E-05;
        }
        if (sizeIndex < 4) {
            var oldLighting = renderContext.lighting;
            if (planetID === 5) {
                if (renderContext.gl == null) {
                    renderContext.lighting = false;
                    // DRAW BACK HALF OF RINGS
                    Planets3d.drawSaturnsRings(renderContext, false, dist);
                    renderContext.lighting = oldLighting;
                }
            }
            if (!planetID) {
                renderContext.lighting = false;
            }
            Planets3d._drawSphere(renderContext, planetID);
            if (planetID === 5) {
                if (renderContext.gl == null) {
                    renderContext.lighting = false;
                    // DRAW FRONT HALF OF RINGS
                    Planets3d.drawSaturnsRings(renderContext, true, dist);
                }
                else {
                    renderContext.lighting = false;
                    Planets3d._drawRings(renderContext);
                    renderContext.lighting = oldLighting;
                }
            }
            renderContext.lighting = oldLighting;
        } else {
            if (!planetID) {
                BasePlanets.drawPointPlanet(renderContext, new Vector3d(), (10 * Planets._planetDiameters[planetID]), Planets.planetColors[planetID], true);
            }
            else if (planetID < 9 || planetID === 19) {
                var size = (800 * Planets._planetDiameters[planetID]);
                BasePlanets.drawPointPlanet(renderContext, new Vector3d(), Math.max(0.05, Math.min(0.1, size)), Planets.planetColors[planetID], true);
            }
            else if (sizeIndexParam > 0.002) {
                var size = (800 * Planets._planetDiameters[planetID]);
                BasePlanets.drawPointPlanet(renderContext, new Vector3d(), Math.max(0.05, Math.min(0.1, size)), Planets.planetColors[planetID], true);
            }
        }
    }
    LayerManager._draw(renderContext, 1, false, Planets.getNameFrom3dId(planetID), true, false);
    renderContext.set_world(matOld);
    renderContext.set_worldBase(matOldBase);
    renderContext.set_worldBaseNonRotating(matOldNonRotating);
};

Planets3d.drawSaturnsRings = function (renderContext, front, distance) {
    if (Planets3d._ringsTriangleLists[0] == null) {
        Planets3d._ringImage = document.createElement('img');
        var xdomimg = Planets3d._ringImage;
        xdomimg.crossOrigin = 'anonymous';
        Planets3d._ringImage.src = URLHelpers.singleton.engineAssetUrl('saturnringsshadow.png');
        Planets3d._ringsTriangleLists[0] = [];
        Planets3d._ringsTriangleLists[1] = [];
        var ringSize = 2.25;
        var TopLeft = Vector3d.create(-ringSize, 0, -ringSize);
        var TopRight = Vector3d.create(ringSize, 0, -ringSize);
        var BottomLeft = Vector3d.create(-ringSize, 0, ringSize);
        var BottomRight = Vector3d.create(ringSize, 0, ringSize);
        var center = Vector3d.create(0, 0, 0);
        var leftCenter = Vector3d.create(-ringSize, 0, 0);
        var topCenter = Vector3d.create(0, 0, -ringSize);
        var bottomCenter = Vector3d.create(0, 0, ringSize);
        var rightCenter = Vector3d.create(ringSize, 0, 0);
        var level = 6;
        var vertexList;
        vertexList = [];
        var Width = 1024;
        var Height = 1024;
        vertexList.push(PositionTexture.createPosSize(TopLeft, 0, 0, Width, Height));
        vertexList.push(PositionTexture.createPosSize(TopRight, 1, 0, Width, Height));
        vertexList.push(PositionTexture.createPosSize(BottomLeft, 0, 1, Width, Height));
        vertexList.push(PositionTexture.createPosSize(BottomRight, 1, 1, Width, Height));
        var childTriangleList = [];
        childTriangleList.push(Triangle.create(0, 2, 1));
        childTriangleList.push(Triangle.create(2, 3, 1));
        var count = 5;
        while (count-- > 1) {
            var newList = [];
            var $enum1 = ss.enumerate(childTriangleList);
            while ($enum1.moveNext()) {
                var tri = $enum1.current;
                tri.subDivideNoNormalize(newList, vertexList);
            }
            childTriangleList = newList;
        }
        var miter = 0.6 / (Width / 256);
        var $enum2 = ss.enumerate(childTriangleList);
        while ($enum2.moveNext()) {
            var tri = $enum2.current;
            var p1 = vertexList[tri.a];
            var p2 = vertexList[tri.b];
            var p3 = vertexList[tri.c];
            Planets3d._ringsTriangleLists[0].push(RenderTriangle.createWithMiter(p1, p2, p3, Planets3d._ringImage, level, miter));
        }
    }
    if (renderContext.gl == null) {
        var cam = renderContext.cameraPosition;
        var test = new Vector3d();
        var worldLocal = Matrix3d.multiplyMatrix(Matrix3d._rotationY(Math.atan2(renderContext.get_sunPosition().x, renderContext.get_sunPosition().z)), renderContext.get_worldBaseNonRotating());
        var wv = Matrix3d.multiplyMatrix(worldLocal, renderContext.get_view());
        var wvp = Matrix3d.multiplyMatrix(wv, renderContext.get_projection());
        var Width = renderContext.width;
        var Height = renderContext.height;
        wvp.scale(Vector3d.create(Width / 2, -Height / 2, 1));
        wvp.translate(Vector3d.create(Width / 2, Height / 2, 0));
        var td = 0;
        for (var i = 0; i < 2; i++) {
            var $enum3 = ss.enumerate(Planets3d._ringsTriangleLists[0]);
            while ($enum3.moveNext()) {
                var tri = $enum3.current;
                test = wv.transform(tri.a.position);
                td = test.length();
                var draw = td > distance;
                if (front) {
                    draw = !draw;
                }
                if (draw) {
                    tri.opacity = 1;
                    tri.draw(renderContext.device, wvp);
                }
            }
            RenderTriangle.cullInside = !RenderTriangle.cullInside;
        }
    }
    else { }
};

// Various input layouts used in 3D solar system mode
// TODO Replace with an input layout cache

Planets3d._drawRings = function (renderContext) {
    Planets3d._initRings();
    TileShader.use(renderContext, Planets3d._ringsVertexBuffer.vertexBuffer, null, Planets._ringsTexture.texture2d, 1, false, Vector3d.zero);
    renderContext.gl.drawArrays(WEBGL.TRIANGLE_STRIP, 0, Planets3d._triangleCountRings);
};

Planets3d._initRings = function () {
    if (Planets3d._ringsVertexBuffer != null) {
        return;
    }
    Planets._ringsTexture = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('saturnringsstrip.png'));
    var inner = 1.113;
    var outer = 2.25;
    Planets3d._ringsVertexBuffer = new PositionTextureVertexBuffer(((192 + 1) * 2));
    Planets3d._triangleCountRings = (192 + 1) * 2;
    var verts = Planets3d._ringsVertexBuffer.lock();
    var radStep = Math.PI * 2 / 192;
    var index = 0;
    for (var x = 0; x <= 192; x += 2) {
        var rads1 = x * radStep;
        var rads2 = (x + 1) * radStep;
        verts[index] = new PositionTexture();
        verts[index].position = Vector3d.create((Math.cos(rads1) * inner), 0, (Math.sin(rads1) * inner));
        verts[index].tu = 1;
        verts[index].tv = 0;
        index++;
        verts[index] = new PositionTexture();
        verts[index].position = Vector3d.create((Math.cos(rads1) * outer), 0, (Math.sin(rads1) * outer));
        verts[index].tu = 0;
        verts[index].tv = 0;
        index++;
        verts[index] = new PositionTexture();
        verts[index].position = Vector3d.create((Math.cos(rads2) * inner), 0, (Math.sin(rads2) * inner));
        verts[index].tu = 1;
        verts[index].tv = 1;
        index++;
        verts[index] = new PositionTexture();
        verts[index].position = Vector3d.create((Math.cos(rads2) * outer), 0, (Math.sin(rads2) * outer));
        verts[index].tu = 0;
        verts[index].tv = 1;
        index++;
    }
    Planets3d._ringsVertexBuffer.unlock();
};

Planets3d._drawSphere = function (renderContext, planetID) {
    var planetName = Planets3d.getImageSetNameNameFrom3dId(planetID);
    var planet = globalWWTControl.getImagesetByName(planetName);
    if (planet == null) {
        planet = globalWWTControl.getImagesetByName('Bing Maps Aerial');
    }
    if (planet != null) {
        renderContext.drawImageSet(planet, 100);
        if (planetID === 19) {
        }
        return;
    }
};

registerType("Planets3d", [Planets3d, {}, null]);
