// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile in a pyramid that uses a TOAST projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { tileCacheGetTile, tilePrepDevice, tileUvMultiple } from "./render_globals.js";
import { Vector2d, Vector3d, PositionTexture, ConvexHull } from "./double3d.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { Coordinates } from "./coordinates.js";
import { RenderTriangle } from "./render_triangle.js";
import { Tile } from "./tile.js";
import { Triangle } from "./triangle.js";
import { DistanceCalc } from "./util.js";


// wwtlib.ToastTile

export function ToastTile() {
    this._topDown$1 = true;
    this.backslash = false;
    this._vertexList$1 = null;
    this._childTriangleList$1 = null;
    this._subDivisionLevel$1 = 4;
    this._subDivided$1 = false;
    Tile.call(this);
}

ToastTile.slashIndexBuffer = new Array(64);
ToastTile.backSlashIndexBuffer = new Array(64);
ToastTile.rootIndexBuffer = new Array(4);

ToastTile._cloneArray$1 = function (indexArray) {
    var count = indexArray.length;
    var ui16array = new Uint16Array(count);
    var indexArrayNew = ui16array;
    for (var i = 0; i < count; i++) {
        indexArrayNew[i] = indexArray[i];
    }
    return indexArrayNew;
};

ToastTile.create = function (level, xc, yc, dataset, parent) {
    var temp = new ToastTile();
    temp.parent = parent;
    temp.level = level;
    temp.tileX = xc;
    temp.tileY = yc;
    temp.dataset = dataset;
    temp._topDown$1 = !dataset.get_bottomsUp();
    if (temp.tileX !== xc) {
        alert('bad');
    }
    if (!!dataset.get_meanRadius()) {
        temp.set__demScaleFactor(dataset.get_meanRadius());
    }
    else {
        if (!dataset.get_dataSetType()) {
            temp.set__demScaleFactor(6371000);
        } else {
            temp.set__demScaleFactor(3396010);
        }
    }
    temp.computeBoundingSphere();
    return temp;
};

var ToastTile$ = {
    computeBoundingSphere: function () {
        this._initializeGrids$1();
        this.topLeft = this.bounds[0 + 3 * 0].position.copy();
        this.bottomRight = this.bounds[2 + 3 * 2].position.copy();
        this.topRight = this.bounds[2 + 3 * 0].position.copy();
        this.bottomLeft = this.bounds[0 + 3 * 2].position.copy();
        this.calcSphere();
    },

    getIndexBuffer: function (index, accomidation) {
        if (!this.level) {
            return ToastTile.rootIndexBuffer[index];
        }
        if (this.backslash) {
            return ToastTile.backSlashIndexBuffer[index * 16 + accomidation];
        } else {
            return ToastTile.slashIndexBuffer[index * 16 + accomidation];
        }
    },
    _processIndexBuffer$1: function (indexArray, part) {
        if (!this.level) {
            ToastTile.rootIndexBuffer[part] = tilePrepDevice.createBuffer();
            tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, ToastTile.rootIndexBuffer[part]);
            tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, indexArray, WEBGL.STATIC_DRAW);
            return;
        }
        for (var a = 0; a < 16; a++) {
            var partArray = ToastTile._cloneArray$1(indexArray);
            this._processAccomindations$1(partArray, a);
            if (this.backslash) {
                ToastTile.backSlashIndexBuffer[part * 16 + a] = tilePrepDevice.createBuffer();
                tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, ToastTile.backSlashIndexBuffer[part * 16 + a]);
                tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, partArray, WEBGL.STATIC_DRAW);
            }
            else {
                ToastTile.slashIndexBuffer[part * 16 + a] = tilePrepDevice.createBuffer();
                tilePrepDevice.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, ToastTile.slashIndexBuffer[part * 16 + a]);
                tilePrepDevice.bufferData(WEBGL.ELEMENT_ARRAY_BUFFER, partArray, WEBGL.STATIC_DRAW);
            }
        }
    },
    _processAccomindations$1: function (indexArray, a) {
        var map = {};
        var gridMap = {};
        var $enum1 = ss.enumerate(indexArray);
        while ($enum1.moveNext()) {
            var index = $enum1.current;
            var vert = this._vertexList$1[index];
            var arrayX = ss.truncate((vert.tu * 16 + 0.5));
            var arrayY = ss.truncate((vert.tv * 16 + 0.5));
            var ii = (arrayY << 8) + arrayX;
            if (!ss.keyExists(gridMap, ii)) {
                gridMap[ii] = index;
            }
        }
        var sections = 16;
        if ((a & 1) === 1) {
            for (var x = 1; x < sections; x += 2) {
                var y = sections;
                var key = (y << 8) + x;
                var val = (y << 8) + x + 1;
                if (ss.keyExists(gridMap, key)) {
                    map[gridMap[key]] = gridMap[val];
                }
            }
        }
        if ((a & 2) === 2) {
            for (var y = 1; y < sections; y += 2) {
                var x = sections;
                var key = (y << 8) + x;
                var val = ((y + 1) << 8) + x;
                if (ss.keyExists(gridMap, key)) {
                    map[gridMap[key]] = gridMap[val];
                }
            }
        }
        if ((a & 4) === 4) {
            for (var x = 1; x < sections; x += 2) {
                var y = 0;
                var key = (y << 8) + x;
                var val = (y << 8) + x + 1;
                if (ss.keyExists(gridMap, key)) {
                    map[gridMap[key]] = gridMap[val];
                }
            }
        }
        if ((a & 8) === 8) {
            for (var y = 1; y < sections; y += 2) {
                var x = 0;
                var key = (y << 8) + x;
                var val = ((y + 1) << 8) + x;
                if (ss.keyExists(gridMap, key)) {
                    map[gridMap[key]] = gridMap[val];
                }
            }
        }
        if (!ss.keyCount(map)) {
            //nothing to process
            return;
        }
        for (var i = 0; i < indexArray.length; i++) {
            if (ss.keyExists(map, indexArray[i])) {
                indexArray[i] = map[indexArray[i]];
            }
        }
    },

    calculateFullSphere: function (list) {
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
            return false;
        }
        if (!this.demReady || this.demData == null) {
            return false;
        }
        var testPoint = Coordinates.geoTo3dDouble(-lat, lng);
        var top = this._isLeftOfHalfSpace$1(this.topLeft.copy(), this.topRight.copy(), testPoint);
        var right = this._isLeftOfHalfSpace$1(this.topRight.copy(), this.bottomRight.copy(), testPoint);
        var bottom = this._isLeftOfHalfSpace$1(this.bottomRight.copy(), this.bottomLeft.copy(), testPoint);
        var left = this._isLeftOfHalfSpace$1(this.bottomLeft.copy(), this.topLeft.copy(), testPoint);
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
        return dot < 0;
    },

    getSurfacePointAltitude: function (lat, lng, meters) {
        if (this.level < Tile.lastDeepestLevel) {
            for (var ii = 0; ii < 4; ii++) {
                var child = this.children[ii];
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
        Tile.tileTargetLevel = this.level;
        Tile.tileTargetX = this.tileX;
        Tile.tileTargetY = this.tileY;
        var testPoint = Coordinates.geoTo3dDouble(-lat, lng);
        testPoint = Vector3d.subtractVectors(new Vector3d(), testPoint);
        var uv = DistanceCalc.getUVFromInnerPoint(this.topLeft.copy(), this.topRight.copy(), this.bottomLeft.copy(), this.bottomRight.copy(), testPoint.copy());

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
            return val / this.get__demScaleFactor();
        }
        return this.demAverage / this.get__demScaleFactor();
    },
    _initializeGrids$1: function () {
        this._vertexList$1 = [];
        this._childTriangleList$1 = new Array(4);
        this._childTriangleList$1[0] = [];
        this._childTriangleList$1[1] = [];
        this._childTriangleList$1[2] = [];
        this._childTriangleList$1[3] = [];
        this.bounds = new Array(9);
        if (this.level > 0) {
            if (this.parent == null) {
                this.parent = tileCacheGetTile(this.level - 1, this.tileX / 2, this.tileY / 2, this.dataset, null);
            }
            var parent = this.parent;
            var xIndex = this.tileX % 2;
            var yIndex = this.tileY % 2;
            if (this.level > 1) {
                this.backslash = parent.backslash;
            }
            else {
                this.backslash = (xIndex === 1 ^ yIndex === 1) === 1;
            }
            this.bounds[0 + 3 * 0] = parent.bounds[xIndex + 3 * yIndex].copy();
            this.bounds[1 + 3 * 0] = this._midpoint$1(parent.bounds[xIndex + 3 * yIndex], parent.bounds[xIndex + 1 + 3 * yIndex]);
            this.bounds[2 + 3 * 0] = parent.bounds[xIndex + 1 + 3 * yIndex].copy();
            this.bounds[0 + 3 * 1] = this._midpoint$1(parent.bounds[xIndex + 3 * yIndex], parent.bounds[xIndex + 3 * (yIndex + 1)]);
            if (this.backslash) {
                this.bounds[1 + 3 * 1] = this._midpoint$1(parent.bounds[xIndex + 3 * yIndex], parent.bounds[xIndex + 1 + 3 * (yIndex + 1)]);
            }
            else {
                this.bounds[1 + 3 * 1] = this._midpoint$1(parent.bounds[xIndex + 1 + 3 * yIndex], parent.bounds[xIndex + 3 * (yIndex + 1)]);
            }
            this.bounds[2 + 3 * 1] = this._midpoint$1(parent.bounds[xIndex + 1 + 3 * yIndex], parent.bounds[xIndex + 1 + 3 * (yIndex + 1)]);
            this.bounds[0 + 3 * 2] = parent.bounds[xIndex + 3 * (yIndex + 1)].copy();
            this.bounds[1 + 3 * 2] = this._midpoint$1(parent.bounds[xIndex + 3 * (yIndex + 1)], parent.bounds[xIndex + 1 + 3 * (yIndex + 1)]);
            this.bounds[2 + 3 * 2] = parent.bounds[xIndex + 1 + 3 * (yIndex + 1)].copy();
            this.bounds[0 + 3 * 0].tu = 0 * tileUvMultiple;
            this.bounds[0 + 3 * 0].tv = 0 * tileUvMultiple;
            this.bounds[1 + 3 * 0].tu = 0.5 * tileUvMultiple;
            this.bounds[1 + 3 * 0].tv = 0 * tileUvMultiple;
            this.bounds[2 + 3 * 0].tu = 1 * tileUvMultiple;
            this.bounds[2 + 3 * 0].tv = 0 * tileUvMultiple;
            this.bounds[0 + 3 * 1].tu = 0 * tileUvMultiple;
            this.bounds[0 + 3 * 1].tv = 0.5 * tileUvMultiple;
            this.bounds[1 + 3 * 1].tu = 0.5 * tileUvMultiple;
            this.bounds[1 + 3 * 1].tv = 0.5 * tileUvMultiple;
            this.bounds[2 + 3 * 1].tu = 1 * tileUvMultiple;
            this.bounds[2 + 3 * 1].tv = 0.5 * tileUvMultiple;
            this.bounds[0 + 3 * 2].tu = 0 * tileUvMultiple;
            this.bounds[0 + 3 * 2].tv = 1 * tileUvMultiple;
            this.bounds[1 + 3 * 2].tu = 0.5 * tileUvMultiple;
            this.bounds[1 + 3 * 2].tv = 1 * tileUvMultiple;
            this.bounds[2 + 3 * 2].tu = 1 * tileUvMultiple;
            this.bounds[2 + 3 * 2].tv = 1 * tileUvMultiple;
            this._vertexList$1.push(this.bounds[0 + 3 * 0]);
            this._vertexList$1.push(this.bounds[1 + 3 * 0]);
            this._vertexList$1.push(this.bounds[2 + 3 * 0]);
            this._vertexList$1.push(this.bounds[0 + 3 * 1]);
            this._vertexList$1.push(this.bounds[1 + 3 * 1]);
            this._vertexList$1.push(this.bounds[2 + 3 * 1]);
            this._vertexList$1.push(this.bounds[0 + 3 * 2]);
            this._vertexList$1.push(this.bounds[1 + 3 * 2]);
            this._vertexList$1.push(this.bounds[2 + 3 * 2]);
            if (this.backslash) {
                this._childTriangleList$1[0].push(Triangle.create(4, 1, 0));
                this._childTriangleList$1[0].push(Triangle.create(3, 4, 0));
                this._childTriangleList$1[1].push(Triangle.create(5, 2, 1));
                this._childTriangleList$1[1].push(Triangle.create(4, 5, 1));
                this._childTriangleList$1[2].push(Triangle.create(7, 4, 3));
                this._childTriangleList$1[2].push(Triangle.create(6, 7, 3));
                this._childTriangleList$1[3].push(Triangle.create(8, 5, 4));
                this._childTriangleList$1[3].push(Triangle.create(7, 8, 4));
            }
            else {
                this._childTriangleList$1[0].push(Triangle.create(3, 1, 0));
                this._childTriangleList$1[0].push(Triangle.create(4, 1, 3));
                this._childTriangleList$1[1].push(Triangle.create(4, 2, 1));
                this._childTriangleList$1[1].push(Triangle.create(5, 2, 4));
                this._childTriangleList$1[2].push(Triangle.create(6, 4, 3));
                this._childTriangleList$1[2].push(Triangle.create(7, 4, 6));
                this._childTriangleList$1[3].push(Triangle.create(7, 5, 4));
                this._childTriangleList$1[3].push(Triangle.create(8, 5, 7));
            }
        } else {
            this.bounds[0 + 3 * 0] = PositionTexture.create(0, -1, 0, 0, 0);
            this.bounds[1 + 3 * 0] = PositionTexture.create(0, 0, 1, 0.5, 0);
            this.bounds[2 + 3 * 0] = PositionTexture.create(0, -1, 0, 1, 0);
            this.bounds[0 + 3 * 1] = PositionTexture.create(-1, 0, 0, 0, 0.5);
            this.bounds[1 + 3 * 1] = PositionTexture.create(0, 1, 0, 0.5, 0.5);
            this.bounds[2 + 3 * 1] = PositionTexture.create(1, 0, 0, 1, 0.5);
            this.bounds[0 + 3 * 2] = PositionTexture.create(0, -1, 0, 0, 1);
            this.bounds[1 + 3 * 2] = PositionTexture.create(0, 0, -1, 0.5, 1);
            this.bounds[2 + 3 * 2] = PositionTexture.create(0, -1, 0, 1, 1);
            this._vertexList$1.push(this.bounds[0 + 3 * 0]);
            this._vertexList$1.push(this.bounds[1 + 3 * 0]);
            this._vertexList$1.push(this.bounds[2 + 3 * 0]);
            this._vertexList$1.push(this.bounds[0 + 3 * 1]);
            this._vertexList$1.push(this.bounds[1 + 3 * 1]);
            this._vertexList$1.push(this.bounds[2 + 3 * 1]);
            this._vertexList$1.push(this.bounds[0 + 3 * 2]);
            this._vertexList$1.push(this.bounds[1 + 3 * 2]);
            this._vertexList$1.push(this.bounds[2 + 3 * 2]);
            this._childTriangleList$1[0].push(Triangle.create(3, 1, 0));
            this._childTriangleList$1[0].push(Triangle.create(4, 1, 3));
            this._childTriangleList$1[1].push(Triangle.create(5, 2, 1));
            this._childTriangleList$1[1].push(Triangle.create(4, 5, 1));
            this._childTriangleList$1[2].push(Triangle.create(7, 4, 3));
            this._childTriangleList$1[2].push(Triangle.create(6, 7, 3));
            this._childTriangleList$1[3].push(Triangle.create(7, 5, 4));
            this._childTriangleList$1[3].push(Triangle.create(8, 5, 7));
        }
    },
    _midpoint$1: function (positionNormalTextured, positionNormalTextured_2) {
        var a1 = Vector3d.lerp(positionNormalTextured.position, positionNormalTextured_2.position, 0.5);
        var a1uv = Vector2d.lerp(Vector2d.create(positionNormalTextured.tu, positionNormalTextured.tv), Vector2d.create(positionNormalTextured_2.tu, positionNormalTextured_2.tv), 0.5);
        a1.normalize();
        return PositionTexture.createPos(a1, a1uv.x, a1uv.y);
    },

    createGeometry: function (renderContext) {
        if (this.geometryCreated) {
            return true;
        }
        this.geometryCreated = true;
        Tile.prototype.createGeometry.call(this, renderContext);
        if (!this._subDivided$1) {
            if (this._vertexList$1 == null) {
                this._initializeGrids$1();
            }
            if (tileUvMultiple == 256) {
                if (!this.dataset.get_dataSetType() || this.dataset.get_dataSetType() === 1) {
                    this._subDivisionLevel$1 = Math.min(5, Math.max(0, 5 - this.level));
                }
                else {
                    this._subDivisionLevel$1 = Math.min(5, Math.max(0, 5 - this.level));
                }
            }
            else {
                if (this.demTile && this.level > 1) {
                    this.demArray = new Array(17 * 17);
                    this.demSize = 17 * 17;
                    if (this.backslash) {
                        if (ToastTile._backslashYIndex$1 == null) {
                            this._tempBackslashYIndex$1 = new Array(this.demSize);
                            this._tempBackslashXIndex$1 = new Array(this.demSize);
                        }
                    }
                    else {
                        if (ToastTile._slashYIndex$1 == null) {
                            this._tempSlashYIndex$1 = new Array(this.demSize);
                            this._tempSlashXIndex$1 = new Array(this.demSize);
                        }
                    }
                }
            }
            for (var i = 0; i < 4; i++) {
                var count = this._subDivisionLevel$1;
                while (count-- > 1) {
                    var newList = [];
                    var $enum1 = ss.enumerate(this._childTriangleList$1[i]);
                    while ($enum1.moveNext()) {
                        var tri = $enum1.current;
                        tri.subDivide(newList, this._vertexList$1);
                    }
                    this._childTriangleList$1[i] = newList;
                }
            }
            if (renderContext.gl == null) {
                for (var i = 0; i < 4; i++) {
                    this._renderTriangleLists[i] = [];
                    var $enum2 = ss.enumerate(this._childTriangleList$1[i]);
                    while ($enum2.moveNext()) {
                        var tri = $enum2.current;
                        var p1 = this._vertexList$1[tri.c];
                        var p2 = this._vertexList$1[tri.b];
                        var p3 = this._vertexList$1[tri.a];
                        this._renderTriangleLists[i].push(RenderTriangle.create(p1, p2, p3, this.texture, this.level));
                    }
                }
            }
            else {
                this._vertexBuffer = tilePrepDevice.createBuffer();
                tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this._vertexBuffer);
                var f32array = new Float32Array(this._vertexList$1.length * 5);
                var buffer = f32array;
                var index = 0;
                var $enum3 = ss.enumerate(this._vertexList$1);
                while ($enum3.moveNext()) {
                    var pt = $enum3.current;
                    if (this.demTile) {
                        index = this.addVertex(buffer, index, this._getMappedVertex(pt));
                        this.demIndex++;
                    }
                    else {
                        index = this.addVertex(buffer, index, pt);
                    }
                }
                if (this.demTile) {
                    if (this.backslash) {
                        if (this._tempBackslashXIndex$1 != null) {
                            ToastTile._backslashXIndex$1 = this._tempBackslashXIndex$1;
                            ToastTile._backslashYIndex$1 = this._tempBackslashYIndex$1;
                            this._tempBackslashXIndex$1 = null;
                            this._tempBackslashYIndex$1 = null;
                        }
                    }
                    else {
                        if (this._tempSlashYIndex$1 != null) {
                            ToastTile._slashXIndex$1 = this._tempSlashXIndex$1;
                            ToastTile._slashYIndex$1 = this._tempSlashYIndex$1;
                            this._tempSlashYIndex$1 = null;
                            this._tempSlashXIndex$1 = null;
                        }
                    }
                }
                tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.STATIC_DRAW);
                for (var i = 0; i < 4; i++) {
                    this.triangleCount = this._childTriangleList$1[i].length;
                    if (this.getIndexBuffer(i, 0) == null) {
                        var ui16array = new Uint16Array(this.triangleCount * 3);
                        var indexArray = ui16array;
                        index = 0;
                        var $enum4 = ss.enumerate(this._childTriangleList$1[i]);
                        while ($enum4.moveNext()) {
                            var tri = $enum4.current;
                            indexArray[index++] = tri.c;
                            indexArray[index++] = tri.b;
                            indexArray[index++] = tri.a;
                        }
                        this._processIndexBuffer$1(indexArray, i);
                    }
                }
            }
            this._subDivided$1 = true;
        }
        return true;
    },

    _getMappedVertex: function (vert) {
        var vertOut = new PositionTexture();
        var latLng = Coordinates.cartesianToSpherical2(vert.position);
        if (latLng.get_lng() < -180) {
            latLng.set_lng(latLng.get_lng() + 360);
        }
        if (latLng.get_lng() > 180) {
            latLng.set_lng(latLng.get_lng() - 360);
        }
        if (this.level > 1) {
            var arrayX = ss.truncate((vert.tu * 16 + 0.5));
            var arrayY = ss.truncate((vert.tv * 16 + 0.5));
            this.demArray[arrayX + arrayY * 17] = this.demData[this.demIndex];
            if (this.backslash) {
                if (this._tempBackslashYIndex$1 != null) {
                    this._tempBackslashXIndex$1[this.demIndex] = arrayX;
                    this._tempBackslashYIndex$1[this.demIndex] = arrayY;
                }
            }
            else {
                if (this._tempSlashYIndex$1 != null) {
                    this._tempSlashXIndex$1[this.demIndex] = arrayX;
                    this._tempSlashYIndex$1[this.demIndex] = arrayY;
                }
            }
        }
        var pos = this.geoTo3dWithAlt(latLng.get_lat(), latLng.get_lng(), false, false);
        vertOut.tu = vert.tu;
        vertOut.tv = vert.tv;
        pos.subtract(this.localCenter);
        vertOut.position = pos;
        return vertOut;
    },

    cleanUp: function (removeFromParent) {
        Tile.prototype.cleanUp.call(this, removeFromParent);
        if (this._vertexList$1 != null) {
            this._vertexList$1 = null;
        }
        if (this._childTriangleList$1 != null) {
            this._childTriangleList$1 = null;
        }
        this._subDivided$1 = false;
        this.demArray = null;
    },
    _getDemSample$1: function (xc, yc) {
        return this.demArray[(16 - yc) * 17 + xc];
    },

    createDemFromParent: function () {
        var parent = ss.safeCast(this.parent, ToastTile);
        if (parent == null) {
            return false;
        }
        var offsetX = (((this.tileX % 2) === 1) ? 8 : 0);
        var offsetY = ((!(this.tileY % 2)) ? 8 : 0);
        this.demArray = new Array(17 * 17);

        // Interpolate across
        for (var yy1 = 0; yy1 < 17; yy1 += 2) {
            var copy = true;
            for (var xx1 = 0; xx1 < 17; xx1++) {
                if (copy) {
                    this.demArray[(16 - yy1) * 17 + xx1] = parent._getDemSample$1((xx1 / 2) + offsetX, (yy1 / 2) + offsetY);
                }
                else {
                    this.demArray[(16 - yy1) * 17 + xx1] = ((parent._getDemSample$1((xx1 / 2) + offsetX, (yy1 / 2) + offsetY) + parent._getDemSample$1(((xx1 / 2) + offsetX) + 1, (yy1 / 2) + offsetY)) / 2);
                }
                copy = !copy;
            }
        }

        // Interpolate down
        for (var yy2 = 1; yy2 < 17; yy2 += 2) {
            for (var xx2 = 0; xx2 < 17; xx2++) {
                this.demArray[(16 - yy2) * 17 + xx2] = ((this._getDemSample$1(xx2, yy2 - 1) + this._getDemSample$1(xx2, yy2 + 1)) / 2);
            }
        }

        // Convert the dem array back to the arranged DEM list thu slash/backslash mapping tables
        this.demData = new Array(this.demSize);
        for (var i = 0; i < this.demSize; i++) {
            if (this.backslash) {
                this.demData[i] = this.demArray[ToastTile._backslashXIndex$1[i] + ToastTile._backslashYIndex$1[i] * 17];
            }
            else {
                this.demData[i] = this.demArray[ToastTile._slashXIndex$1[i] + ToastTile._slashYIndex$1[i] * 17];
            }
            this.demAverage += this.demData[i];
        }

        // Get Average value for new DemData table
        this.demAverage /= this.demData.length;
        this.demReady = true;
        return true;
    }
};

registerType("ToastTile", [ToastTile, ToastTile$, Tile]);
