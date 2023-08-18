// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses a tangential (gnomonic) projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { tileCacheRemoveFromQueue, tilePrepDevice, useGlVersion2 } from "./render_globals.js";
import { Vector3d, PositionTexture } from "./double3d.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { RenderTriangle } from "./render_triangle.js";
import { FitsImage } from "./layers/fits_image.js";
import { Tile } from "./tile.js";


// wwtlib.LatLngEdges

export function LatLngEdges() {
    this.latMin = 0;
    this.latMax = 0;
    this.lngMin = 0;
    this.lngMax = 0;
}

var LatLngEdges$ = {};

registerType("LatLngEdges", [LatLngEdges, LatLngEdges$, null]);


// wwtlib.TangentTile

export function TangentTile(level, x, y, dataset, parent) {
    this._topDown$1 = true;
    Tile.call(this);
    this.parent = parent;
    this.level = level;
    this.tileX = x;
    this.tileY = y;
    this.dataset = dataset;
    this._topDown$1 = !dataset.get_bottomsUp();
    this.computeBoundingSphere();
}

var TangentTile$ = {
    computeBoundingSphere: function () {
        if (!this._topDown$1) {
            this.computeBoundingSphereBottomsUp();
            return;
        }
        var tileDegrees = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
        var latMin = (this.dataset.get_baseTileDegrees() / 2 - (this.tileY) * tileDegrees) + this.dataset.get_offsetY();
        var latMax = (this.dataset.get_baseTileDegrees() / 2 - ((this.tileY + 1)) * tileDegrees) + this.dataset.get_offsetY();
        var lngMin = ((this.tileX) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        var lngMax = (((this.tileX + 1)) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        var latCenter = (latMin + latMax) / 2;
        var lngCenter = (lngMin + lngMax) / 2;
        this.sphereCenter = this.geoTo3dTan(latCenter, lngCenter);
        this.topLeft = this.geoTo3dTan(latMin, lngMin);
        this.bottomRight = this.geoTo3dTan(latMax, lngMax);
        this.topRight = this.geoTo3dTan(latMin, lngMax);
        this.bottomLeft = this.geoTo3dTan(latMax, lngMin);
        var distVect = this.geoTo3dTan(latMin, lngMin);
        distVect.subtract(this.sphereCenter);
        this.sphereRadius = distVect.length();
    },

    computeBoundingSphereBottomsUp: function () {
        var tileDegrees = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
        var latMin = (this.dataset.get_baseTileDegrees() / 2 + ((this.tileY + 1)) * tileDegrees) + this.dataset.get_offsetY();
        var latMax = (this.dataset.get_baseTileDegrees() / 2 + (this.tileY) * tileDegrees) + this.dataset.get_offsetY();
        var lngMin = ((this.tileX) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        var lngMax = (((this.tileX + 1)) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        this.topLeft = this.geoTo3dTan(latMin, lngMin);
        this.bottomRight = this.geoTo3dTan(latMax, lngMax);
        this.topRight = this.geoTo3dTan(latMin, lngMax);
        this.bottomLeft = this.geoTo3dTan(latMax, lngMin);
    },

    getLatLngEdges: function () {
        var tileDegrees = this.dataset.get_baseTileDegrees() / Math.pow(2, this.level);
        var edges = new LatLngEdges();
        edges.latMin = (this.dataset.get_baseTileDegrees() / 2 - (this.tileY) * tileDegrees) + this.dataset.get_offsetY();
        edges.latMax = (this.dataset.get_baseTileDegrees() / 2 - ((this.tileY + 1)) * tileDegrees) + this.dataset.get_offsetY();
        edges.lngMin = ((this.tileX) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        edges.lngMax = (((this.tileX + 1)) * tileDegrees - this.dataset.get_baseTileDegrees() / this.dataset.get_widthFactor()) + this.dataset.get_offsetX();
        return edges;
    },

    geoTo3dTan: function (lat, lng) {
        lng = -lng;
        var fac1 = this.dataset.get_baseTileDegrees() / 2;
        var factor = Math.tan(fac1 * Tile.RC);
        return this.dataset.get_matrix().transform(Vector3d.create(1, (lat / fac1 * factor), (lng / fac1 * factor)));
    },

    requestImage: function () {
        this.fitsImage = ss.safeCast(this.dataset.get_wcsImage(), FitsImage);
        if (this.fitsImage != null) {
            this.texReady = true;
            this.downloading = false;
            this.errored = this.fitsImage.errored;
            this.requestPending = false;
            tileCacheRemoveFromQueue(this.get_key(), true);
            if (useGlVersion2) {
                this.makeTexture();
                this.readyToRender = true;
            }
            else {
                //Cached bitmap for performance reasons
                //Only used in legacy rendering of FITS (WebGL 1.0) inside SkyImageTile
                this.bmp = this.fitsImage.getBitmap();
                this.texture2d = this.bmp.getTexture();
                this.readyToRender = true;
            }
        } else {
            Tile.prototype.requestImage.call(this);
        }
    },

    createGeometry: function (renderContext) {
        if (this.geometryCreated) {
            return true;
        }
        this.geometryCreated = true;
        for (var i = 0; i < 4; i++) {
            this._renderTriangleLists[i] = [];
        }
        this.globalCenter = this.geoTo3dTan(0, 0);
        var edges = this.getLatLngEdges();
        this.topLeft = this.geoTo3dTan(edges.latMin, edges.lngMin).subtract(this.globalCenter);
        this.bottomRight = this.geoTo3dTan(edges.latMax, edges.lngMax).subtract(this.globalCenter);
        this.topRight = this.geoTo3dTan(edges.latMin, edges.lngMax).subtract(this.globalCenter);
        this.bottomLeft = this.geoTo3dTan(edges.latMax, edges.lngMin).subtract(this.globalCenter);
        var center = Vector3d.midPoint(this.topLeft, this.bottomRight);
        var leftCenter = Vector3d.midPoint(this.topLeft, this.bottomLeft);
        var rightCenter = Vector3d.midPoint(this.topRight, this.bottomRight);
        var topCenter = Vector3d.midPoint(this.topLeft, this.topRight);
        var bottomCenter = Vector3d.midPoint(this.bottomLeft, this.bottomRight);
        if (renderContext.gl == null) {
            this._renderTriangleLists[0].push(RenderTriangle.create(PositionTexture.createPos(this.topLeft, 0, 0), PositionTexture.createPos(leftCenter, 0, 0.5), PositionTexture.createPos(topCenter, 0.5, 0), this.texture, this.level));
            this._renderTriangleLists[0].push(RenderTriangle.create(PositionTexture.createPos(leftCenter, 0, 0.5), PositionTexture.createPos(center, 0.5, 0.5), PositionTexture.createPos(topCenter, 0.5, 0), this.texture, this.level));
            this._renderTriangleLists[1].push(RenderTriangle.create(PositionTexture.createPos(topCenter, 0.5, 0), PositionTexture.createPos(rightCenter, 1, 0.5), PositionTexture.createPos(this.topRight, 1, 0), this.texture, this.level));
            this._renderTriangleLists[1].push(RenderTriangle.create(PositionTexture.createPos(topCenter, 0.5, 0), PositionTexture.createPos(center, 0.5, 0.5), PositionTexture.createPos(rightCenter, 1, 0.5), this.texture, this.level));
            this._renderTriangleLists[2].push(RenderTriangle.create(PositionTexture.createPos(leftCenter, 0, 0.5), PositionTexture.createPos(bottomCenter, 0.5, 1), PositionTexture.createPos(center, 0.5, 0.5), this.texture, this.level));
            this._renderTriangleLists[2].push(RenderTriangle.create(PositionTexture.createPos(leftCenter, 0, 0.5), PositionTexture.createPos(this.bottomLeft, 0, 1), PositionTexture.createPos(bottomCenter, 0.5, 1), this.texture, this.level));
            this._renderTriangleLists[3].push(RenderTriangle.create(PositionTexture.createPos(center, 0.5, 0.5), PositionTexture.createPos(this.bottomRight, 1, 1), PositionTexture.createPos(rightCenter, 1, 0.5), this.texture, this.level));
            this._renderTriangleLists[3].push(RenderTriangle.create(PositionTexture.createPos(center, 0.5, 0.5), PositionTexture.createPos(bottomCenter, 0.5, 1), PositionTexture.createPos(this.bottomRight, 1, 1), this.texture, this.level));
            this.readyToRender = true;
        } else {
            //process vertex list
            this._vertexBuffer = tilePrepDevice.createBuffer();
            tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this._vertexBuffer);
            var f32array = new Float32Array(9 * 5);
            var buffer = f32array;
            var index = 0;
            index = this.addVertex(buffer, index, PositionTexture.createPos(bottomCenter, 0.5, 1));
            index = this.addVertex(buffer, index, PositionTexture.createPos(this.bottomLeft, 0, 1));
            index = this.addVertex(buffer, index, PositionTexture.createPos(this.bottomRight, 1, 1));
            index = this.addVertex(buffer, index, PositionTexture.createPos(center, 0.5, 0.5));
            index = this.addVertex(buffer, index, PositionTexture.createPos(leftCenter, 0, 0.5));
            index = this.addVertex(buffer, index, PositionTexture.createPos(rightCenter, 1, 0.5));
            index = this.addVertex(buffer, index, PositionTexture.createPos(topCenter, 0.5, 0));
            index = this.addVertex(buffer, index, PositionTexture.createPos(this.topLeft, 0, 0));
            index = this.addVertex(buffer, index, PositionTexture.createPos(this.topRight, 1, 0));
            tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);

            // process index buffers
            for (var i = 0; i < 4; i++) {
                index = 0;
                this.triangleCount = 2;
                var ui16array = new Uint16Array(this.triangleCount * 3);
                var indexArray = ui16array;
                switch (i) {
                    case 0:
                        indexArray[index++] = 7;
                        indexArray[index++] = 4;
                        indexArray[index++] = 6;
                        indexArray[index++] = 4;
                        indexArray[index++] = 3;
                        indexArray[index++] = 6;
                        break;
                    case 1:
                        indexArray[index++] = 6;
                        indexArray[index++] = 5;
                        indexArray[index++] = 8;
                        indexArray[index++] = 6;
                        indexArray[index++] = 3;
                        indexArray[index++] = 5;
                        break;
                    case 2:
                        indexArray[index++] = 4;
                        indexArray[index++] = 0;
                        indexArray[index++] = 3;
                        indexArray[index++] = 4;
                        indexArray[index++] = 1;
                        indexArray[index++] = 0;
                        break;
                    case 3:
                        indexArray[index++] = 3;
                        indexArray[index++] = 2;
                        indexArray[index++] = 5;
                        indexArray[index++] = 3;
                        indexArray[index++] = 0;
                        indexArray[index++] = 2;
                        break;
                }
                this._indexBuffers[i] = tilePrepDevice.createBuffer();
                tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, this._indexBuffers[i]);
                tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, ui16array, WEBGL.STATIC_DRAW);
            }
        }
        return true;
    }
};

registerType("TangentTile", [TangentTile, TangentTile$, Tile]);
