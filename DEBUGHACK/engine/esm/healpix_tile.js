// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses a HEALPix projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import {
    tileCacheAddTileToQueue,
    tileCacheGetTile,
    tileCacheRemoveFromQueue,
    tilePrepDevice,
    set_tileDemEnabled,
} from "./render_globals.js";
import { Vector3d, Matrix3d, ConvexHull, PositionTexture } from "./double3d.js";
import { DistanceCalc } from "./util.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { Coordinates } from "./coordinates.js";
import { Fxyf } from "./fxyf.js";
import { WebFile } from "./web_file.js";
import { UiTools } from "./ui_tools.js";
import { Tile } from "./tile.js";


// wwtlib.Xyf

export function Xyf() {
    this.ix = 0;
    this.iy = 0;
    this.face = 0;
}

Xyf.create = function (x, y, f) {
    var temp = new Xyf();
    temp.ix = x;
    temp.iy = y;
    temp.face = f;
    return temp;
};

var Xyf$ = {};

registerType("Xyf", [Xyf, Xyf$, null]);


// wwtlib.HealpixTile

export function HealpixTile(level, x, y, dataset, parent) {
    this.ipix = 0;
    this.indexBuffer = new Array(4);
    this._vertexList$1 = null;
    this._nside$1 = 0;
    this._tileIndex$1 = 0;
    this._face$1 = 0;
    this._faceX$1 = 0;
    this._faceY$1 = 0;
    this._step$1 = 0;
    this._subDivided$1 = false;
    this._catalogRows$1 = [];
    Tile.call(this);
    this.level = level;
    this.tileX = x;
    this.tileY = y;
    this.dataset = dataset;
    set_tileDemEnabled(false);

    if (!level) {
        this._nside$1 = 4;
    } else {
        this._nside$1 = Math.pow(2, level + 1);
    }

    if (parent == null) {
        this._face$1 = x * 4 + y;
        this.ipix = this._face$1;
    } else {
        this.parent = parent;
        var parentTile = parent;
        this._face$1 = parentTile._face$1;
        this._tileIndex$1 = parentTile._tileIndex$1 * 4 + y * 2 + x;
        this.ipix = this._face$1 * this._nside$1 * this._nside$1 / 4 + this._tileIndex$1;
        this._faceX$1 = parentTile._faceX$1 * 2 + x;
        this._faceY$1 = parentTile._faceY$1 * 2 + y;
    }
    this.isCatalogTile = ss.keyExists(dataset.get_hipsProperties().get_properties(), 'dataproduct_type') && dataset.get_hipsProperties().get_properties()['dataproduct_type'].toLowerCase() === 'catalog';
    this._computeBoundingSphere$1();
}

HealpixTile._galacticMatrix$1 = Matrix3d.create(-0.0548755604024359, -0.483835015526738, -0.873437090247923, 0, -0.867666148981161, 0.455983776232537, -0.198076373464674, 0, 0.494109427943568, 0.746982244476371, -0.444829629919504, 0, 0, 0, 0, 1);

var HealpixTile$ = {
    get_URL: function () {
        if (this._url$1 == null) {
            this._url$1 = this._getUrl$1(this.dataset, this.level, this.tileX, this.tileY);
            return this._url$1;
        } else {
            return this._url$1;
        }
    },

    _computeBoundingSphere$1: function () {
        this._setStep$1();
        this.createGeometry(null);
        var pointList = new Array(this._vertexList$1.length);
        for (var i = 0; i < this._vertexList$1.length; i++) {
            pointList[i] = this._vertexList$1[i].position;
        }
        this._calcSphere$1(pointList);
        this._setCorners$1();
    },

    createGeometry: function (renderContext) {
        if (this._vertexList$1 != null) {
            return true;
        }
        this._vertexList$1 = [];
        this._populateVertexList$1(this._vertexList$1, this._step$1);
        if (ss.keyExists(this.dataset.get_hipsProperties().get_properties(), 'hips_frame') && this.dataset.get_hipsProperties().get_properties()['hips_frame'] === 'galactic') {
            for (var i = 0; i < this._vertexList$1.length; i++) {
                var vert = this._vertexList$1[i];
                HealpixTile._galacticMatrix$1.multiplyVector(vert.position);
            }
        }
        this.triangleCount = this._step$1 * this._step$1 / 2;
        var ui16array = new Uint16Array(3 * this.triangleCount);
        var indexArray = ui16array;
        if (!this._subDivided$1) {
            try {
                this._vertexBuffer = tilePrepDevice.createBuffer();
                tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this._vertexBuffer);
                var f32array = new Float32Array(this._vertexList$1.length * 5);
                var buffer = f32array;
                var index = 0;
                var $enum1 = ss.enumerate(this._vertexList$1);
                while ($enum1.moveNext()) {
                    var vert = $enum1.current;
                    index = this.addVertex(buffer, index, vert);
                }
                tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
                index = 0;
                var offset = this._vertexList$1.length / (4 * this._step$1);

                //0 0 = left
                //1 0 = top
                //1 1 = right
                this._setIndexBufferForQuadrant$1(indexArray, 0, 1);
                if (this._step$1 > 1) {
                    this._setIndexBufferForQuadrant$1(indexArray, 0, 0);
                    this._setIndexBufferForQuadrant$1(indexArray, 1, 1);
                    this._setIndexBufferForQuadrant$1(indexArray, 1, 0);
                }
            }
            catch (exception) {
            }
        }
        return true;
    },

    _setIndexBufferForQuadrant$1: function (indexArray, x, y) {
        var index = 0;
        for (var i = x * this._step$1 / 2; i < (this._step$1 / 2) * (x + 1); i++) {
            for (var j = y * this._step$1 / 2; j < (this._step$1 / 2) * (y + 1); j++) {
                indexArray[index++] = (i * (this._step$1 + 1) + j);
                indexArray[index++] = (1 + i * (this._step$1 + 1) + j);
                indexArray[index++] = (this._step$1 + 1 + i * (this._step$1 + 1) + j);
                indexArray[index++] = (1 + i * (this._step$1 + 1) + j);
                indexArray[index++] = (this._step$1 + 1 + i * (this._step$1 + 1) + j);
                indexArray[index++] = (this._step$1 + 2 + i * (this._step$1 + 1) + j);
            }
        }
        this._processIndexBuffer$1(indexArray, x * 2 + y);
    },

    _getUrl$1: function (dataset, level, x, y) {
        var extension = this._getHipsFileExtension$1();
        var tileTextureIndex = -1;
        if (!level) {
            tileTextureIndex = this._face$1;
        } else {
            tileTextureIndex = this._face$1 * this._nside$1 * this._nside$1 / 4 + this._tileIndex$1;
        }
        var sb = new ss.StringBuilder();
        var subDirIndex = Math.floor(tileTextureIndex / 10000) * 10000;
        return ss.format(dataset.get_url(), level.toString(), subDirIndex.toString(), tileTextureIndex.toString() + extension);
    },

    _getHipsFileExtension$1: function () {
        // The extension will contain either a space-separated list of types
        // or a single type. We currently match preferred filetypes
        // greedily. The extension must be exactly ".fits" in order to
        // render correctly -- not only because of the greedy matching here,
        // but because there are other parts of the code that check for an
        // exact match.

        //prioritize transparent Png over other image formats
        if (this.dataset.get_extension().toLowerCase().indexOf('png') > -1) {
            return '.png';
        }
        if (this.dataset.get_extension().toLowerCase().indexOf('jpeg') > -1 || this.dataset.get_extension().toLowerCase().indexOf('jpg') > -1) {
            return '.jpg';
        }
        if (this.dataset.get_extension().toLowerCase().indexOf('tsv') > -1) {
            return '.tsv';
        }
        if (this.dataset.get_extension().toLowerCase().indexOf('fits') > -1) {
            return '.fits';
        }

        //default to most common
        return '.jpg';
    },

    isTileBigEnough: function (renderContext) {
        if (this.dataset.get_dataSetType() === 1) {
            var arcPixels = (180 / (Math.pow(2, this.level) * 4));
            return (renderContext.get_fovScale() < arcPixels);
        } else {
            var arcPixels = (3600 / (Math.pow(2, this.level) * 4));
            return (renderContext.get_fovScale() < arcPixels);
        }
    },

    _boundaries$1: function (x, y, step) {
        var nside = step * Math.pow(2, this.level);
        var points = new Array(4);
        var xyf = Xyf.create(x + this._faceX$1 * step, y + this._faceY$1 * step, this._face$1);
        var dc = 0.5 / nside;
        var xc = (xyf.ix + 0.5) / nside;
        var yc = (xyf.iy + 0.5) / nside;
        points[0] = Fxyf.create(xc + dc, yc + dc, xyf.face).toVec3();
        points[1] = Fxyf.create(xc - dc, yc + dc, xyf.face).toVec3();
        points[2] = Fxyf.create(xc - dc, yc - dc, xyf.face).toVec3();
        points[3] = Fxyf.create(xc + dc, yc - dc, xyf.face).toVec3();
        return points;
    },

    _setCorners$1: function () {
        var xyf = Xyf.create(this.tileX, this.tileY, this._face$1);
        var dc = 0.5 / this._nside$1;
        var xc = (xyf.ix + 0.5) / this._nside$1;
        var yc = (xyf.iy + 0.5) / this._nside$1;
        this.topLeft = Fxyf.create(xc + dc, yc + dc, xyf.face).toVec3();
        this.bottomLeft = Fxyf.create(xc - dc, yc + dc, xyf.face).toVec3();
        this.bottomRight = Fxyf.create(xc - dc, yc - dc, xyf.face).toVec3();
        this.topRight = Fxyf.create(xc + dc, yc - dc, xyf.face).toVec3();
    },

    draw3D: function (renderContext, opacity) {
        if (this.isCatalogTile) {
            this.drawCatalogTile(renderContext, opacity);
            return true;
        }
        this.renderedGeneration = Tile.currentRenderGeneration;
        Tile.tilesTouched++;
        this.inViewFrustum = true;
        var onlyDrawChildren = false;
        if (!this.readyToRender) {
            if (!this.errored) {
                tileCacheAddTileToQueue(this);
                return false;
            }
            if (this.errored && this.level < 3) {
                //Level 0-2 sometimes deleted in favor of allsky.jpg/tsv
                onlyDrawChildren = true;
            }
            else {
                return false;
            }
        }
        var partCount = this.triangleCount;
        Tile.trianglesRendered += partCount;
        var anythingToRender = false;
        var childRendered = false;
        var childIndex = 0;
        for (var y1 = 0; y1 < 2; y1++) {
            for (var x1 = 0; x1 < 2; x1++) {
                if (this.level < this.dataset.get_levels()) {
                    if (this.children[childIndex] == null) {
                        this.children[childIndex] = tileCacheGetTile(this.level + 1, x1, y1, this.dataset, this);
                    }
                    if (this.children[childIndex].isTileInFrustum(renderContext.get_frustum())) {
                        this.inViewFrustum = true;
                        if (this.children[childIndex].isTileBigEnough(renderContext) || onlyDrawChildren) {
                            this.renderChildPart[childIndex].set_targetState(!this.children[childIndex].draw3D(renderContext, opacity));
                            if (this.renderChildPart[childIndex].get_targetState()) {
                                childRendered = true;
                            }
                        }
                        else {
                            this.renderChildPart[childIndex].set_targetState(true);
                        }
                    }
                    else {
                        this.renderChildPart[childIndex].set_targetState(this.renderChildPart[childIndex].set_state(false));
                    }
                }
                else {
                    this.renderChildPart[childIndex].set_state(true);
                }
                if (!!this.renderChildPart[childIndex].get_state()) {
                    anythingToRender = true;
                }
                childIndex++;
            }
        }
        if (childRendered || anythingToRender) {
            this.renderedAtOrBelowGeneration = Tile.currentRenderGeneration;
            if (this.parent != null) {
                this.parent.renderedAtOrBelowGeneration = this.renderedAtOrBelowGeneration;
            }
        }
        if (!anythingToRender) {
            return true;
        }
        if (!this.createGeometry(renderContext)) {
            return false;
        }
        if (onlyDrawChildren) {
            return true;
        }
        Tile.tilesInView++;
        for (var i = 0; i < 4; i++) {
            if (this.renderChildPart[i].get_targetState()) {
                this.renderPart(renderContext, i, opacity / 100, false);
            }
        }
        return true;
    },

    drawCatalogTile: function (renderContext, opacity) {
        this.renderedGeneration = Tile.currentRenderGeneration;
        Tile.tilesTouched++;
        this.inViewFrustum = true;
        var onlyDrawChildren = false;
        if (!this.readyToRender) {
            if (!this.errored) {
                tileCacheAddTileToQueue(this);
                return;
            }
            if (this.errored && this.level < 3) {
                //Level 0-2 sometimes deleted in favor of allsky.jpg/tsv
                onlyDrawChildren = true;
            }
            else {
                return;
            }
        }
        var anyChildInFrustum = false;
        var childIndex = 0;
        for (var y1 = 0; y1 < 2; y1++) {
            for (var x1 = 0; x1 < 2; x1++) {
                if (this.level < this.dataset.get_levels()) {
                    if (this.children[childIndex] == null) {
                        this.children[childIndex] = tileCacheGetTile(this.level + 1, x1, y1, this.dataset, this);
                    }
                    if (this.children[childIndex].isTileInFrustum(renderContext.get_frustum())) {
                        this.inViewFrustum = true;
                        anyChildInFrustum = true;
                        if (this.children[childIndex].isTileBigEnough(renderContext) || onlyDrawChildren) {
                            (this.children[childIndex]).drawCatalogTile(renderContext, opacity);
                        }
                        else {
                            (this.children[childIndex]).removeCatalogTile();
                        }
                    }
                    else {
                        (this.children[childIndex]).removeCatalogTile();
                    }
                }
                childIndex++;
            }
        }
        if (!this.level && !anyChildInFrustum && !onlyDrawChildren) {
            this.removeCatalogTile();
        } else if (anyChildInFrustum) {
            Tile.tilesInView++;
            this._addCatalogTile$1();
        }
    },

    removeCatalogTile: function () {
        this.dataset.get_hipsProperties().get_catalogSpreadSheetLayer().removeTileRows(this.get_key(), this._catalogRows$1);
    },

    _addCatalogTile$1: function () {
        this.dataset.get_hipsProperties().get_catalogSpreadSheetLayer().addTileRows(this.get_key(), this._catalogRows$1);
    },

    _extractCatalogTileRows$1: function () {
        var headerRemoved = false;
        var $enum1 = ss.enumerate(this._catalogData$1.getText().split('\n'));
        while ($enum1.moveNext()) {
            var line = $enum1.current;
            if (!ss.startsWith(line, '#') && !headerRemoved) {
                headerRemoved = true;
                continue;
            }
            if (!ss.startsWith(line, '#')) {
                var rowData = UiTools.splitString(line, this.dataset.get_hipsProperties().get_catalogSpreadSheetLayer().get__table().delimiter);
                this._catalogRows$1.push(rowData);
            }
        }
    },

    getDataInView: function (renderContext, limit, catalogSpreadSheetLayer) {
        if (!this.readyToRender) {
            if (!this.errored) {
                this.requestImage();
                if (limit) {
                    return false;
                }
            }
            else if (this.level >= 3) {
                //Level 0-2 sometimes deleted in favor of allsky.jpg/tsv
                return true;
            }
        }
        var allChildrenReady = true;
        var anyChildInFrustum = false;
        var childIndex = 0;
        for (var y1 = 0; y1 < 2; y1++) {
            for (var x1 = 0; x1 < 2; x1++) {
                if (this.level < this.dataset.get_levels()) {
                    if (this.children[childIndex] == null) {
                        this.children[childIndex] = tileCacheGetTile(this.level + 1, x1, y1, this.dataset, this);
                    }
                    if (this.children[childIndex].isTileInFrustum(renderContext.get_frustum())) {
                        anyChildInFrustum = true;
                        allChildrenReady = allChildrenReady && (this.children[childIndex]).getDataInView(renderContext, limit, catalogSpreadSheetLayer);
                    }
                }
                childIndex++;
            }
        }
        if (anyChildInFrustum) {
            catalogSpreadSheetLayer.addTileRows(this.get_key(), this._catalogRows$1);
        }
        return allChildrenReady && !this.downloading;
    },

    _setStep$1: function () {
        if (this.isCatalogTile) {
            this._step$1 = 2;
        } else {
            switch (this.level) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    this._step$1 = 16;
                    break;
                case 5:
                    this._step$1 = 8;
                    break;
                case 6:
                    this._step$1 = 4;
                    break;
                default:
                    this._step$1 = 2;
                    break;
            }
        }
    },

    requestImage: function () {
        if (this.isCatalogTile) {
            if (!this.downloading && !this.readyToRender) {
                this.downloading = true;
                this._catalogData$1 = new WebFile(this.get_URL());
                this._catalogData$1.onStateChange = ss.bind('_loadCatalogData$1', this);
                this._catalogData$1.send();
            }
        } else {
            Tile.prototype.requestImage.call(this);
        }
    },

    _loadCatalogData$1: function () {
        if (this._catalogData$1.get_state() === 2) {
            this.requestPending = false;
            this.downloading = false;
            this.errored = true;
            tileCacheRemoveFromQueue(this.get_key(), true);
        } else if (this._catalogData$1.get_state() === 1) {
            this._extractCatalogTileRows$1();
            this.texReady = true;
            this.downloading = false;
            this.errored = false;
            this.readyToRender = true;
            this.requestPending = false;
            tileCacheRemoveFromQueue(this.get_key(), true);
        }
    },

    getIndexBuffer: function (index, accomidation) {
        return this.indexBuffer[index];
    },

    _calcSphere$1: function (list) {
        var result = ConvexHull.findEnclosingSphere(list);
        this.sphereCenter = result.center;
        this.sphereRadius = result.radius;
    },

    isPointInTile: function (lat, lng) {
        if (!this.level) {
            return true;
        }
        if (this.level === 1) {
            if ((lng >= 0 && lng <= 90) && (!this.tileX && this.tileY === 1)) {
                return true;
            }
            if ((lng > 90 && lng <= 180) && (this.tileX === 1 && this.tileY === 1)) {
                return true;
            }
            if ((lng < 0 && lng >= -90) && (!this.tileX && !this.tileY)) {
                return true;
            }
            if ((lng < -90 && lng >= -180) && (this.tileX === 1 && !this.tileY)) {
                return true;
            }
        }
        var testPoint = Coordinates.geoTo3dDouble(lat, lng);
        var top = this._isLeftOfHalfSpace$1(this.topLeft, this.topRight, testPoint);
        var right = this._isLeftOfHalfSpace$1(this.topRight, this.bottomRight, testPoint);
        var bottom = this._isLeftOfHalfSpace$1(this.bottomRight, this.bottomLeft, testPoint);
        var left = this._isLeftOfHalfSpace$1(this.bottomLeft, this.topLeft, testPoint);
        if (top && right && bottom && left) {
            return true;
        }
        return false;
    },

    _isLeftOfHalfSpace$1: function (pntA, pntB, pntTest) {
        pntA.normalize();
        pntB.normalize();
        var cross = Vector3d.cross(pntA, pntB);
        var dot = Vector3d.dot(cross, pntTest);
        return dot > 0;
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
        return this._getAltitudeFromLatLng$1(lat, lng, meters);
    },

    _getAltitudeFromLatLng$1: function (lat, lng, meters) {
        var testPoint = Coordinates.geoTo3dDouble(lat, lng);
        var uv = DistanceCalc.getUVFromInnerPoint(this.topLeft, this.topRight, this.bottomLeft, this.bottomRight, testPoint);

        // Get 4 samples and interpolate
        var uud = Math.max(0, Math.min(16, (uv.x * 16)));
        var vvd = Math.max(0, Math.min(16, (uv.y * 16)));
        var uu = Math.max(0, Math.min(15, ss.truncate((uv.x * 16))));
        var vv = Math.max(0, Math.min(15, ss.truncate((uv.y * 16))));
        var ha = uud - uu;
        var va = vvd - vv;
        if (this.demArray != null) {
            // 4 nearest neighbors
            var ul = this.demArray[uu + 17 * vv];
            var ur = this.demArray[(uu + 1) + 17 * vv];
            var ll = this.demArray[uu + 17 * (vv + 1)];
            var lr = this.demArray[(uu + 1) + 17 * (vv + 1)];
            var top = ul * (1 - ha) + ha * ur;
            var bottom = ll * (1 - ha) + ha * lr;
            var val = top * (1 - va) + va * bottom;
            return val / ((meters) ? 1 : this.get__demScaleFactor());
        }
        return this.demAverage / ((meters) ? 1 : this.get__demScaleFactor());
    },

    _processIndexBuffer$1: function (indexArray, part) {
        this.indexBuffer[part] = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, this.indexBuffer[part]);
        tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, indexArray, WEBGL.STATIC_DRAW);
    },

    cleanUp: function (removeFromParent) {
        Tile.prototype.cleanUp.call(this, removeFromParent);
        this._returnBuffers$1();
        this._subDivided$1 = false;
    },

    _returnBuffers$1: function () {
        if (this._vertexList$1 != null) {
            this._vertexList$1 = null;
        }
    },

    // Vertices distributed in a grid pattern like the example below
    // Example for pattern with step set to 4
    //            24
    //          19  23
    //       14   18  22
    //      9   13  17  21
    //    4   8   12  16  20
    //      3   7   11  15
    //        2   6   10
    //          1   5
    //            0
    _populateVertexList$1: function (vertexList, step) {
        for (var i = 0; i < step; i += 2) {
            for (var j = 0; j < step; j += 2) {
                var points = this._boundaries$1(j, i, step);
                vertexList[i * (step + 1) + j] = PositionTexture.createPos(points[2], (1 / step) * i, (1 / step) * j);
                vertexList[i * (step + 1) + j + 1] = PositionTexture.createPos(points[3], (1 / step) * i, (1 / step) + (1 / step) * j);
                vertexList[(i + 1) * (step + 1) + j] = PositionTexture.createPos(points[1], (1 / step) + (1 / step) * i, (1 / step) * j);
                vertexList[(i + 1) * (step + 1) + j + 1] = PositionTexture.createPos(points[0], (1 / step) + (1 / step) * i, (1 / step) + (1 / step) * j);
                if (j + 2 >= step && step > 1) {
                    j = step - 1;
                    points = this._boundaries$1(j, i, step);
                    vertexList[i * (step + 1) + step] = PositionTexture.createPos(points[3], (1 / step) * i, (1 / step) + (1 / step) * j);
                    vertexList[(i + 1) * (step + 1) + step] = PositionTexture.createPos(points[0], (1 / step) + (1 / step) * i, (1 / step) + (1 / step) * j);
                }
            }
        }
        if (step > 1) {
            this._vertexOfLastRow$1(vertexList, step);
        }
    },

    _vertexOfLastRow$1: function (vertexList, step) {
        var i = step - 1;
        for (var j = 0; j < step; j += 2) {
            var points = this._boundaries$1(j, i, step);
            vertexList[(i + 1) * (step + 1) + j] = PositionTexture.createPos(points[1], (1 / step) + (1 / step) * i, (1 / step) * j);
            vertexList[(i + 1) * (step + 1) + j + 1] = PositionTexture.createPos(points[0], (1 / step) + (1 / step) * i, (1 / step) + (1 / step) * j);
            if (j + 2 >= step) {
                j = step - 1;
                points = this._boundaries$1(j, i, step);
                vertexList[(i + 1) * (step + 1) + step] = PositionTexture.createPos(points[0], (1 / step) + (1 / step) * i, (1 / step) + (1 / step) * j);
            }
        }
    }
};

registerType("HealpixTile", [HealpixTile, HealpixTile$, Tile]);
