// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses an equirectangular projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { tilePrepDevice } from "./render_globals.js";
import { PositionTexture } from "./double3d.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { RenderTriangle } from "./render_triangle.js";
import { Tile } from "./tile.js";


// wwtlib.EquirectangularTile

export function EquirectangularTile() {
    this._tileDegrees$1 = 0;
    this._topDown$1 = true;
    this._subDivisionLevel$1 = 1;
    Tile.call(this);
}

EquirectangularTile.create = function (level, x, y, dataset, parent) {
    var temp = new EquirectangularTile();
    temp.parent = parent;
    temp.level = level;
    temp.tileX = x;
    temp.tileY = y;
    temp.dataset = dataset;
    temp._topDown$1 = !dataset.get_bottomsUp();
    temp.computeBoundingSphere();
    return temp;
};

var EquirectangularTile$ = {
    computeBoundingSphere: function () {
        if (!this._topDown$1) {
            this.computeBoundingSphereBottomsUp();
            return;
        }
        this._tileDegrees$1 = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
        var latMin = (90 - ((this.tileY) * this._tileDegrees$1));
        var latMax = (90 - (((this.tileY + 1)) * this._tileDegrees$1));
        var lngMin = ((this.tileX * this._tileDegrees$1) - 180);
        var lngMax = ((((this.tileX + 1)) * this._tileDegrees$1) - 180);
        var latCenter = (latMin + latMax) / 2;
        var lngCenter = (lngMin + lngMax) / 2;
        this.sphereCenter = this.geoTo3d(latCenter, lngCenter, false);
        this.topLeft = this.geoTo3d(latMin, lngMin, false);
        this.bottomRight = this.geoTo3d(latMax, lngMax, false);
        this.topRight = this.geoTo3d(latMin, lngMax, false);
        this.bottomLeft = this.geoTo3d(latMax, lngMin, false);
        var distVect = this.geoTo3d(latMin, lngMin, false);
        distVect.subtract(this.sphereCenter);
        this.sphereRadius = distVect.length();
        this._tileDegrees$1 = lngMax - lngMin;
    },

    computeBoundingSphereBottomsUp: function () {
        var tileDegrees = this.dataset.get_baseTileDegrees() / (Math.pow(2, this.level));
        var latMin = (-90 + (((this.tileY + 1)) * tileDegrees));
        var latMax = (-90 + ((this.tileY) * tileDegrees));
        var lngMin = ((this.tileX * tileDegrees) - 180);
        var lngMax = ((((this.tileX + 1)) * tileDegrees) - 180);
        var latCenter = (latMin + latMax) / 2;
        var lngCenter = (lngMin + lngMax) / 2;
        this.sphereCenter = this.geoTo3d(latCenter, lngCenter, false);
        this.topLeft = this.geoTo3d(latMin, lngMin, false);
        this.bottomRight = this.geoTo3d(latMax, lngMax, false);
        this.topRight = this.geoTo3d(latMin, lngMax, false);
        this.bottomLeft = this.geoTo3d(latMax, lngMin, false);
        var distVect = this.topLeft;
        distVect.subtract(this.sphereCenter);
        this.sphereRadius = distVect.length();
        tileDegrees = lngMax - lngMin;
    },

    createGeometry: function (renderContext) {
        Tile.prototype.createGeometry.call(this, renderContext);
        if (renderContext.gl == null) {
            if (!this.dataset.get_dataSetType() || this.dataset.get_dataSetType() === 1) {
                this._subDivisionLevel$1 = Math.max(2, (4 - this.level) * 2);
            }
        } else {
            this._subDivisionLevel$1 = 32;
        }
        try {
            for (var i = 0; i < 4; i++) {
                this._renderTriangleLists[i] = [];
            }
            if (!this._topDown$1) {
                return this._createGeometryBottomsUp$1(renderContext);
            }
            var lat, lng;
            var index = 0;
            var tileDegrees = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
            var latMin = (90 - ((this.tileY) * tileDegrees));
            var latMax = (90 - (((this.tileY + 1)) * tileDegrees));
            var lngMin = ((this.tileX * tileDegrees) - 180);
            var lngMax = ((((this.tileX + 1)) * tileDegrees) - 180);
            var tileDegreesX = lngMax - lngMin;
            var tileDegreesY = latMax - latMin;
            this.topLeft = this.geoTo3d(latMin, lngMin, false);
            this.bottomRight = this.geoTo3d(latMax, lngMax, false);
            this.topRight = this.geoTo3d(latMin, lngMax, false);
            this.bottomLeft = this.geoTo3d(latMax, lngMin, false);

            // Create a vertex buffer
            var verts = new Array((this._subDivisionLevel$1 + 1) * (this._subDivisionLevel$1 + 1));
            var x, y;
            var textureStep = 1 / this._subDivisionLevel$1;
            for (y = 0; y <= this._subDivisionLevel$1; y++) {
                if (y !== this._subDivisionLevel$1) {
                    lat = latMin + (textureStep * tileDegreesY * y);
                }
                else {
                    lat = latMax;
                }
                for (x = 0; x <= this._subDivisionLevel$1; x++) {
                    if (x !== this._subDivisionLevel$1) {
                        lng = lngMin + (textureStep * tileDegreesX * x);
                    }
                    else {
                        lng = lngMax;
                    }
                    index = y * (this._subDivisionLevel$1 + 1) + x;
                    verts[index] = PositionTexture.createPos(this.geoTo3d(lat, lng, false), x * textureStep, y * textureStep);
                }
            }
            this.triangleCount = this._subDivisionLevel$1 * this._subDivisionLevel$1 * 2;
            var quarterDivisions = this._subDivisionLevel$1 / 2;
            var part = 0;
            if (renderContext.gl == null) {
                for (var y2 = 0; y2 < 2; y2++) {
                    for (var x2 = 0; x2 < 2; x2++) {
                        index = 0;
                        for (var y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                            for (var x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
                                var p1;
                                var p2;
                                var p3;

                                // First triangle in quad
                                p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + x1)];
                                p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                                p3 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                                this._renderTriangleLists[part].push(RenderTriangle.create(p1, p3, p2, this.texture, this.level));

                                // Second triangle in quad
                                p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                                p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                                p3 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                                this._renderTriangleLists[part].push(RenderTriangle.create(p1, p3, p2, this.texture, this.level));
                            }
                        }
                        part++;
                    }
                }
            } else {
                //process vertex list
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
                        for (var y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                            for (var x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
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
        }
        catch ($e2) {
        }
        return true;
    },

    _createGeometryBottomsUp$1: function (renderContext) {
        var lat, lng;
        var index = 0;
        var tileDegrees = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
        var latMin = (-90 + (((this.tileY + 1)) * tileDegrees));
        var latMax = (-90 + ((this.tileY) * tileDegrees));
        var lngMin = ((this.tileX * tileDegrees) - 180);
        var lngMax = ((((this.tileX + 1)) * tileDegrees) - 180);
        var tileDegreesX = lngMax - lngMin;
        var tileDegreesY = latMax - latMin;

        // Create a vertex buffer
        var verts = new Array((this._subDivisionLevel$1 + 1) * (this._subDivisionLevel$1 + 1));
        var x, y;
        var textureStep = 1 / this._subDivisionLevel$1;
        for (y = 0; y <= this._subDivisionLevel$1; y++) {
            if (y !== this._subDivisionLevel$1) {
                lat = latMin + (textureStep * tileDegreesY * y);
            }
            else {
                lat = latMax;
            }
            for (x = 0; x <= this._subDivisionLevel$1; x++) {
                if (x !== this._subDivisionLevel$1) {
                    lng = lngMin + (textureStep * tileDegreesX * x);
                }
                else {
                    lng = lngMax;
                }
                index = y * (this._subDivisionLevel$1 + 1) + x;
                verts[index] = PositionTexture.createPos(this.geoTo3d(lat, lng, false), x * textureStep, y * textureStep);
            }
        }
        this.triangleCount = this._subDivisionLevel$1 * this._subDivisionLevel$1 * 2;
        var quarterDivisions = this._subDivisionLevel$1 / 2;
        var part = 0;
        if (renderContext.gl == null) {
            for (var y2 = 0; y2 < 2; y2++) {
                for (var x2 = 0; x2 < 2; x2++) {
                    index = 0;
                    for (var y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                        for (var x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
                            var p1;
                            var p2;
                            var p3;

                            // First triangle in quad
                            p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + x1)];
                            p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                            p3 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            this._renderTriangleLists[part].push(RenderTriangle.create(p1, p3, p2, this.texture, this.level));

                            // Second triangle in quad
                            p1 = verts[(y1 * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            p2 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + x1)];
                            p3 = verts[((y1 + 1) * (this._subDivisionLevel$1 + 1) + (x1 + 1))];
                            this._renderTriangleLists[part].push(RenderTriangle.create(p1, p3, p2, this.texture, this.level));
                        }
                    }
                    part++;
                }
            }
        } else {
            //process vertex list
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
                    for (var y1 = (quarterDivisions * y2); y1 < (quarterDivisions * (y2 + 1)); y1++) {
                        for (var x1 = (quarterDivisions * x2); x1 < (quarterDivisions * (x2 + 1)); x1++) {
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
    }
};

registerType("EquirectangularTile", [EquirectangularTile, EquirectangularTile$, Tile]);
