// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A tile that plots tabular data.
//
// This tile class is not implemented for the WebGL rendering backend!

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { tileCacheRemoveFromQueue, tileCacheGetTile, tileUvMultiple } from "./render_globals.js";
import { Vector2d, Vector3d, PositionTexture } from "./double3d.js";
import { BasePlanets } from "./baseplanets.js";
import { Coordinates } from "./coordinates.js";
import { Star } from "./star.js";
import { URLHelpers } from "./url_helpers.js";
import { WebFile } from "./web_file.js";
import { Tile } from "./tile.js";


// wwtlib.PlotTile

export function PlotTile() {
    this._topDown$1 = true;
    this.backslash = false;
    this._vertexList$1 = null;
    this._childTriangleList$1 = null;
    this._stars$1 = [];
    this._subDivisionLevel$1 = 4;
    this._subDivided$1 = false;
    Tile.call(this);
}

PlotTile.create = function (level, xc, yc, dataset, parent) {
    var temp = new PlotTile();
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

var PlotTile$ = {
    computeBoundingSphere: function () {
        this._initializeGrids$1();
        this.topLeft = this.bounds[0 + 3 * 0].position.copy();
        this.bottomRight = this.bounds[2 + 3 * 2].position.copy();
        this.topRight = this.bounds[2 + 3 * 0].position.copy();
        this.bottomLeft = this.bounds[0 + 3 * 2].position.copy();
        this.calcSphere();
    },

    renderPart: function (renderContext, part, opacity, combine) {
        if (renderContext.gl != null) {
            //todo draw in WebGL
        } else {
            if (!part) {
                var $enum1 = ss.enumerate(this._stars$1);
                while ($enum1.moveNext()) {
                    var star = $enum1.current;
                    var radDec = 25 / Math.pow(1.6, star.magnitude);
                    BasePlanets.drawPointPlanet(renderContext, star.position, radDec, star.col, false);
                }
            }
        }
    },

    requestImage: function () {
        if (!this.downloading && !this.readyToRender) {
            this.downloading = true;
            this._webFile$1 = new WebFile(URLHelpers.singleton.rewrite(this.get_URL(), 0));
            this._webFile$1.onStateChange = ss.bind('fileStateChange', this);
            this._webFile$1.send();
        }
    },

    fileStateChange: function () {
        if (this._webFile$1.get_state() === 2) {
            this.downloading = false;
            this.readyToRender = false;
            this.errored = true;
            this.requestPending = false;
            tileCacheRemoveFromQueue(this.get_key(), true);
        } else if (this._webFile$1.get_state() === 1) {
            this.texReady = true;
            this.downloading = false;
            this.errored = false;
            this.readyToRender = this.texReady && (this.demReady || !this.demTile);
            this.requestPending = false;
            tileCacheRemoveFromQueue(this.get_key(), true);
            this._loadData$1(this._webFile$1.getText());
        }
    },

    _loadData$1: function (data) {
        var rows = ss.replaceString(data, '\r\n', '\n').split('\n');
        var firstRow = true;
        var type = 0;
        var star = null;
        var $enum1 = ss.enumerate(rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            if (firstRow) {
                firstRow = false;
                continue;
            }
            if (ss.trim(row).length > 5) {
                star = new Star(row);
                star.position = Coordinates.raDecTo3dAu(star.RA, star.dec, 1);
                this._stars$1.push(star);
            }
        }
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
        return true;
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
    }
};

registerType("PlotTile", [PlotTile, PlotTile$, Tile]);
