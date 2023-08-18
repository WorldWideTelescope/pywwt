// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses a Mercator projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { tilePrepDevice, tileUvMultiple } from "./render_globals.js";
import { Vector2d, Vector3d, PositionTexture } from "./double3d.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { RenderTriangle } from "./render_triangle.js";
import { Tile } from "./tile.js";


// wwtlib.MercatorTile

export function MercatorTile() {
    this._tileDegrees$1 = 0;
    this._latMin$1 = 0;
    this._latMax$1 = 0;
    this._lngMin$1 = 0;
    this._lngMax$1 = 0;
    this._subDivisionLevel$1 = 32;
    Tile.call(this);
}

MercatorTile.create = function (level, X, Y, dataset, parent) {
    var temp = new MercatorTile();
    temp.parent = parent;
    temp.level = level;
    temp.tileX = X;
    temp.tileY = Y;
    temp.dataset = dataset;
    temp.computeBoundingSphere();
    return temp;
};

MercatorTile.getCentrePointOffsetAsTileRatio = function (lat, lon, zoom) {
    var metersX = MercatorTile.absoluteLonToMetersAtZoom(lon, zoom);
    var relativeXIntoCell = (metersX / 256) - Math.floor(metersX / 256);
    var metersY = MercatorTile.absoluteLatToMetersAtZoom(lat, zoom);
    var relativeYIntoCell = (metersY / 256) - Math.floor(metersY / 256);
    return Vector2d.create(relativeXIntoCell, relativeYIntoCell);
};

MercatorTile.relativeMetersToLatAtZoom = function (Y, zoom) {
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    var metersY = Y * metersPerPixel;
    return MercatorTile._radToDeg$1(Math.PI / 2 - 2 * Math.atan(Math.exp(0 - metersY / 6378137)));
};

MercatorTile.relativeMetersToLonAtZoom = function (X, zoom) {
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    var metersX = X * metersPerPixel;
    return MercatorTile._radToDeg$1(metersX / 6378137);
};

MercatorTile.absoluteLatToMetersAtZoom = function (latitude, zoom) {
    var sinLat = Math.sin(MercatorTile._degToRad$1(latitude));
    var metersY = 6378137 / 2 * Math.log((1 + sinLat) / (1 - sinLat));
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    return ss.truncate((Math.round(20037508 - metersY) / metersPerPixel));
};

MercatorTile.absoluteMetersToLatAtZoom = function (Y, zoom) {
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    var metersY = 20037508 - Y * metersPerPixel;
    return MercatorTile._radToDeg$1(Math.PI / 2 - 2 * Math.atan(Math.exp(0 - metersY / 6378137)));
};

MercatorTile.absoluteLonToMetersAtZoom = function (longitude, zoom) {
    var metersX = 6378137 * MercatorTile._degToRad$1(longitude);
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    return ss.truncate(((metersX + 20037508) / metersPerPixel));
};

MercatorTile.absoluteMetersToLonAtZoom = function (X, zoom) {
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    var metersX = X * metersPerPixel - 20037508;
    return MercatorTile._radToDeg$1(metersX / 6378137);
};

MercatorTile.absoluteLonToMetersAtZoomTile = function (longitude, zoom, tileX) {
    var metersX = 6378137 * MercatorTile._degToRad$1(longitude);
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    return ss.truncate(((metersX + 20037508) / metersPerPixel));
};

MercatorTile.absoluteLatToMetersAtZoomTile = function (latitude, zoom, tileX) {
    var sinLat = Math.sin(MercatorTile._degToRad$1(latitude));
    var metersY = 6378137 / 2 * Math.log((1 + sinLat) / (1 - sinLat));
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    return ss.truncate((Math.round(20037508 - metersY) / metersPerPixel));
};

MercatorTile.absoluteMetersToLonAtZoomByTileY = function (X, zoom, tileY) {
    var metersPerPixel = MercatorTile.metersPerPixel2(zoom);
    var metersX = X * metersPerPixel - 20037508;
    return MercatorTile._radToDeg$1(metersX / 6378137);
};

MercatorTile._degToRad$1 = function (deg) {
    return (deg * Math.PI / 180);
};

MercatorTile.metersPerPixel2 = function (zoom) {
    return (156543 / (1 << zoom));
};

MercatorTile._radToDeg$1 = function (rad) {
    return (rad * 180 / Math.PI);
};

var MercatorTile$ = {
    computeBoundingSphere: function () {
        this._tileDegrees$1 = 360 / Math.pow(2, this.level);
        this._latMin$1 = MercatorTile.absoluteMetersToLatAtZoom(this.tileY * 256, this.level);
        this._latMax$1 = MercatorTile.absoluteMetersToLatAtZoom((this.tileY + 1) * 256, this.level);
        this._lngMin$1 = ((this.tileX * this._tileDegrees$1) - 180);
        this._lngMax$1 = ((((this.tileX + 1)) * this._tileDegrees$1) - 180);
        var latCenter = (this._latMin$1 + this._latMax$1) / 2;
        var lngCenter = (this._lngMin$1 + this._lngMax$1) / 2;
        this.sphereCenter = this.geoTo3d(latCenter, lngCenter, false);
        this.topLeft = this.geoTo3d(this._latMin$1, this._lngMin$1, false);
        this.bottomRight = this.geoTo3d(this._latMax$1, this._lngMax$1, false);
        this.topRight = this.geoTo3d(this._latMin$1, this._lngMax$1, false);
        this.bottomLeft = this.geoTo3d(this._latMax$1, this._lngMin$1, false);
        if (!this.tileY) {
            this.topLeft = Vector3d.create(0, 1, 0);
            this.topRight = Vector3d.create(0, 1, 0);
        }
        if (this.tileY === Math.pow(2, this.level) - 1) {
            this.bottomRight = Vector3d.create(0, -1, 0);
            this.bottomLeft = Vector3d.create(0, -1, 0);
        }
        var distVect = this.topLeft;
        distVect.subtract(this.sphereCenter);
        this.sphereRadius = distVect.length();
        distVect = this.bottomRight;
        distVect.subtract(this.sphereCenter);
        var len = distVect.length();
        if (this.sphereRadius < len) {
            this.sphereRadius = len;
        }
        this._tileDegrees$1 = Math.abs(this._latMax$1 - this._latMin$1);
    },

    isPointInTile: function (lat, lng) {
        if (!this.demReady || this.demData == null || lat < Math.min(this._latMin$1, this._latMax$1) || lat > Math.max(this._latMax$1, this._latMin$1) || lng < Math.min(this._lngMin$1, this._lngMax$1) || lng > Math.max(this._lngMin$1, this._lngMax$1)) {
            return false;
        }
        return true;
    },

    getSurfacePointAltitude: function (lat, lng, meters) {
        if (this.level < Tile.lastDeepestLevel) {
            var $enum1 = ss.enumerate(this.children);
            while ($enum1.moveNext()) {
                var child = $enum1.current;
                if (child != null) {
                    if (child.isPointInTile(lat, lng)) {
                        var retVal = child.getSurfacePointAltitude(lat, lng, meters);
                        if (!!retVal) {
                            return retVal;
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        var alt = this._getAltitudeAtLatLng$1(lat, lng, (meters) ? 1 : this.get__demScaleFactor());
        return alt;
    },

    _getAltitudeAtLatLng$1: function (lat, lng, scaleFactor) {
        var height = Math.abs(this._latMax$1 - this._latMin$1);
        var width = Math.abs(this._lngMax$1 - this._lngMin$1);
        var yy = ((lat - Math.min(this._latMax$1, this._latMin$1)) / height * 32);
        var xx = ((lng - Math.min(this._lngMax$1, this._lngMin$1)) / width * 32);
        var indexY = Math.min(31, ss.truncate(yy));
        var indexX = Math.min(31, ss.truncate(xx));
        var ha = xx - indexX;
        var va = yy - indexY;
        var ul = this.demData[indexY * 33 + indexX];
        var ur = this.demData[indexY * 33 + (indexX + 1)];
        var ll = this.demData[(indexY + 1) * 33 + indexX];
        var lr = this.demData[(indexY + 1) * 33 + (indexX + 1)];
        var top = ul * (1 - ha) + ha * ur;
        var bottom = ll * (1 - ha) + ha * lr;
        var val = top * (1 - va) + va * bottom;
        return val / scaleFactor;
    },

    createGeometry: function (renderContext) {
        Tile.prototype.createGeometry.call(this, renderContext);
        if (this.geometryCreated) {
            return true;
        }
        this.geometryCreated = true;
        if (tileUvMultiple == 256) {
            if (!this.dataset.get_dataSetType() || this.dataset.get_dataSetType() === 1) {
                this._subDivisionLevel$1 = Math.max(2, (6 - this.level) * 2);
            }
        }
        for (var i = 0; i < 4; i++) {
            this._renderTriangleLists[i] = [];
        }
        var lat, lng;
        var index = 0;
        var tileDegrees = 360 / Math.pow(2, this.level);
        this._latMin$1 = MercatorTile.absoluteMetersToLatAtZoom(this.tileY * 256, this.level);
        this._latMax$1 = MercatorTile.absoluteMetersToLatAtZoom((this.tileY + 1) * 256, this.level);
        this._lngMin$1 = ((this.tileX * tileDegrees) - 180);
        this._lngMax$1 = ((((this.tileX + 1)) * tileDegrees) - 180);
        var latCenter = MercatorTile.absoluteMetersToLatAtZoom(((this.tileY * 2) + 1) * 256, this.level + 1);
        this.topLeft = this.geoTo3d(this._latMin$1, this._lngMin$1, false);
        this.bottomRight = this.geoTo3d(this._latMax$1, this._lngMax$1, false);
        this.topRight = this.geoTo3d(this._latMin$1, this._lngMax$1, false);
        this.bottomLeft = this.geoTo3d(this._latMax$1, this._lngMin$1, false);
        var verts = new Array((this._subDivisionLevel$1 + 1) * (this._subDivisionLevel$1 + 1));
        tileDegrees = this._lngMax$1 - this._lngMin$1;
        var dGrid = (tileDegrees / this._subDivisionLevel$1);
        var x1, y1;
        var textureStep = 1 / this._subDivisionLevel$1;
        var latDegrees = this._latMax$1 - latCenter;
        for (y1 = 0; y1 < this._subDivisionLevel$1 / 2; y1++) {
            if (y1 !== this._subDivisionLevel$1 / 2) {
                lat = this._latMax$1 - (2 * textureStep * latDegrees * y1);
            }
            else {
                lat = latCenter;
            }
            for (x1 = 0; x1 <= this._subDivisionLevel$1; x1++) {
                if (x1 !== this._subDivisionLevel$1) {
                    lng = this._lngMin$1 + (textureStep * tileDegrees * x1);
                }
                else {
                    lng = this._lngMax$1;
                }
                index = y1 * (this._subDivisionLevel$1 + 1) + x1;
                verts[index] = new PositionTexture();
                verts[index].position = this.geoTo3dWithAlt(lat, lng, false, true);
                verts[index].tu = (x1 * textureStep) * tileUvMultiple;
                verts[index].tv = ((MercatorTile.absoluteLatToMetersAtZoom(lat, this.level) - (this.tileY * 256)) / 256) * tileUvMultiple;
                this.demIndex++;
            }
        }
        latDegrees = this._latMin$1 - latCenter;
        for (y1 = this._subDivisionLevel$1 / 2; y1 <= this._subDivisionLevel$1; y1++) {
            if (y1 !== this._subDivisionLevel$1) {
                lat = latCenter + (2 * textureStep * latDegrees * (y1 - (this._subDivisionLevel$1 / 2)));
            }
            else {
                lat = this._latMin$1;
            }
            for (x1 = 0; x1 <= this._subDivisionLevel$1; x1++) {
                if (x1 !== this._subDivisionLevel$1) {
                    lng = this._lngMin$1 + (textureStep * tileDegrees * x1);
                }
                else {
                    lng = this._lngMax$1;
                }
                index = y1 * (this._subDivisionLevel$1 + 1) + x1;
                verts[index] = new PositionTexture();
                verts[index].position = this.geoTo3dWithAlt(lat, lng, false, true);
                verts[index].tu = (x1 * textureStep) * tileUvMultiple;
                verts[index].tv = ((MercatorTile.absoluteLatToMetersAtZoom(lat, this.level) - (this.tileY * 256)) / 256) * tileUvMultiple;
                this.demIndex++;
            }
        }
        if (!this.tileY) {
            // Send the tops to the pole to fill in the Bing Hole
            y1 = this._subDivisionLevel$1;
            for (x1 = 0; x1 <= this._subDivisionLevel$1; x1++) {
                index = y1 * (this._subDivisionLevel$1 + 1) + x1;
                verts[index].position = Vector3d.create(0, 1, 0);
            }
        }
        if (this.tileY === Math.pow(2, this.level) - 1) {
            // Send the tops to the pole to fill in the Bing Hole
            y1 = 0;
            for (x1 = 0; x1 <= this._subDivisionLevel$1; x1++) {
                index = y1 * (this._subDivisionLevel$1 + 1) + x1;
                verts[index].position = Vector3d.create(0, -1, 0);
            }
        }
        this.triangleCount = this._subDivisionLevel$1 * this._subDivisionLevel$1 * 2;
        var quarterDivisions = this._subDivisionLevel$1 / 2;
        var part = 0;
        if (renderContext.gl == null) {
            for (var y2 = 0; y2 < 2; y2++) {
                for (var x2 = 0; x2 < 2; x2++) {
                    index = 0;
                    for (y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                        for (x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
                            var p1;
                            var p2;
                            var p3;

                            // First triangle in quad
                            p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + x1)];
                            p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                            p3 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            var tri = RenderTriangle.create(p1, p2, p3, this.texture, this.level);
                            this._renderTriangleLists[part].push(tri);

                            // Second triangle in quad
                            p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                            p3 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            tri = RenderTriangle.create(p1, p2, p3, this.texture, this.level);
                            this._renderTriangleLists[part].push(tri);
                        }
                    }
                    part++;
                }
            }
        } else {
            this._vertexBuffer = tilePrepDevice.createBuffer();
            tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this._vertexBuffer);
            var f32array = new Float32Array(verts.length * 5);
            var buffer = f32array;
            index = 0;
            var $enum1 = ss.enumerate(verts);
            while ($enum1.moveNext()) {
                var pt = $enum1.current;
                index = this.addVertex(buffer, index, pt);
            }
            tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
            for (var y2 = 0; y2 < 2; y2++) {
                for (var x2 = 0; x2 < 2; x2++) {
                    var ui16array = new Uint16Array(this.triangleCount * 3);
                    var indexArray = ui16array;
                    index = 0;
                    for (y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                        for (x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
                            // First triangle in quad
                            indexArray[index++] = (y1 * (this._subDivisionLevel$1 + 1) + x1);
                            indexArray[index++] = ((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1);
                            indexArray[index++] = (y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1));

                            // Second triangle in quad
                            indexArray[index++] = (y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1));
                            indexArray[index++] = ((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1);
                            indexArray[index++] = ((y1 + 1) * (this._subDivisionLevel$1 + 1) + (x1 + 1));
                        }
                    }
                    this._indexBuffers[part] = tilePrepDevice.createBuffer();
                    tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, this._indexBuffers[part]);
                    tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, ui16array, WEBGL.STATIC_DRAW);
                    part++;
                }
            }
        }
        return true;
    },

    _getDemSample$1: function (x, y) {
        return this.demData[(32 - y) * 33 + x];
    },

    createDemFromParent: function () {
        var parent = ss.safeCast(this.parent, MercatorTile);
        if (parent == null || parent.demData == null) {
            return false;
        }
        var offsetX = (((this.tileX % 2) === 1) ? 16 : 0);
        var offsetY = (((this.tileY % 2) === 1) ? 16 : 0);
        this.demData = new Array(this.demSize);

        // Interpolate across
        for (var y = 0; y < 33; y += 2) {
            var copy = true;
            for (var x = 0; x < 33; x++) {
                if (copy) {
                    this.demData[(32 - y) * 33 + x] = parent._getDemSample$1((x / 2) + offsetX, (y / 2) + offsetY);
                }
                else {
                    this.demData[(32 - y) * 33 + x] = ((parent._getDemSample$1((x / 2) + offsetX, (y / 2) + offsetY) + parent._getDemSample$1(((x / 2) + offsetX) + 1, (y / 2) + offsetY)) / 2);
                }
                copy = !copy;
            }
        }

        // Interpolate down
        for (var y = 1; y < 33; y += 2) {
            for (var x = 0; x < 33; x++) {
                this.demData[(32 - y) * 33 + x] = ((this._getDemSample$1(x, y - 1) + this._getDemSample$1(x, y + 1)) / 2);
            }
        }
        var $enum1 = ss.enumerate(this.demData);
        while ($enum1.moveNext()) {
            var sample = $enum1.current;
            this.demAverage += sample;
        }
        this.demAverage /= this.demData.length;
        this.demReady = true;
        return true;
    }
};

registerType("MercatorTile", [MercatorTile, MercatorTile$, Tile]);
