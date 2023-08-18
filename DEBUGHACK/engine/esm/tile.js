// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The base class for tiles in image tile pyramids.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d, Vector4d, ConvexHull } from "./double3d.js";
import {
    tileCacheAddTileToQueue,
    tileCacheGetCachedTile,
    tileCacheGetTile,
    tileCacheRemoveFromQueue,
    tilePrepDevice,
    tileDemEnabled,
    useGlVersion2,
    inc_tileCacheAccessID,
    set_tileDemEnabled,
    set_tileUvMultiple,
} from "./render_globals.js";
import { freestandingMode } from "./data_globals.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { Texture } from "./graphics/texture.js";
import { FitsShader, TileShader } from "./graphics/shaders.js";
import { getTileKey } from "./util.js";
import { BlendState } from "./blend_state.js";
import { URLHelpers } from "./url_helpers.js";
import { ColorMapContainer } from "./layers/color_map_container.js";
import { FitsImageJs } from "./layers/fits_image_js.js";
import { FitsImageTile } from "./layers/fits_image_tile.js";


// wwtlib.Tile

export function Tile() {
    this._renderTriangleLists = new Array(4);
    this._indexBuffers = new Array(4);
    this.level = 0;
    this.tileX = 0;
    this.tileY = 0;
    this.texture = null;
    this.texture2d = null;
    this.isCatalogTile = false;
    this.readyToRender = false;
    this.inViewFrustum = true;
    this.globalCenter = Vector3d.zero;
    this.children = [null, null, null, null];
    this.parent = null;
    this.localCenter = new Vector3d();
    this.renderedAtOrBelowGeneration = 0;
    this._demScaleFactor = 6371000;
    this.demIndex = 0;
    this.demAverage = 0;
    this.demReady = false;
    this.texReady = false;
    this.demTile = false;
    this.demDownloading = false;
    this.renderedGeneration = 0;
    this.accomidation = 0;
    this.accessCount = 0;
    this.downloading = false;
    this.geometryCreated = false;
    this._isHdTile = false;
    this.demSize = 33 * 33;
    this._topLeftScreen = new Vector3d();
    this._bottomRightScreen = new Vector3d();
    this._topRightScreen = new Vector3d();
    this._bottomLeftScreen = new Vector3d();
    this.sphereRadius = 0;
    this.sphereCenter = new Vector3d();
    this.radius = 1;
    this.triangleCount = 0;
    this.requestHits = 0;
    this.requestPending = false;
    this.errored = false;
    this._key = null;
    this._tileId = null;
    this._vertexCount = 0;
    this.renderChildPart = null;
    this.renderChildPart = new Array(4);
    for (var i = 0; i < 4; i++) {
        this.renderChildPart[i] = BlendState.create(false, 500);
    }
}

Tile.currentRenderGeneration = 0;
Tile.tileTargetX = -1;
Tile.tileTargetY = -1;
Tile.tileTargetLevel = -1;
Tile.tilesInView = 0;
Tile.trianglesRendered = 0;
Tile.tilesTouched = 0;
Tile.frustumList = null;
set_tileUvMultiple(1);
Tile.callCount = 0;
Tile.useAccomidation = true;
set_tileDemEnabled(true);
Tile.maxLevel = 20;
Tile.meshComplexity = 50;
Tile.imageQuality = 50;
Tile.lastDeepestLevel = 0;
Tile.deepestLevel = 0;
Tile.RC = (3.1415927 / 180);

Tile.getFrustumList = function () {
    try {
        return Tile.frustumList;
    }
    catch ($e1) {
        return null;
    }
};

Tile.get_subDivisions = function () {
    return 32;
};

var Tile$ = {
    getIndexBuffer: function (index, accomidation) {
        return this._indexBuffers[index];
    },

    isPointInTile: function (lat, lng) {
        return false;
    },

    getSurfacePointAltitude: function (lat, lng, meters) {
        return 0;
    },

    makeTexture: function () {
        if (tilePrepDevice != null) {
            try {
                this.texture2d = tilePrepDevice.createTexture();
                tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, this.texture2d);
                tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_S, WEBGL.CLAMP_TO_EDGE);
                tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_T, WEBGL.CLAMP_TO_EDGE);
                if (this.dataset.get_extension().toLowerCase().indexOf('fits') > -1 && useGlVersion2) {
                    tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.R32F, ss.truncate(this.fitsImage.get_sizeX()), ss.truncate(this.fitsImage.get_sizeY()), 0, WEBGL.RED, WEBGL.FLOAT, this.fitsImage.dataUnit);
                    tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MIN_FILTER, WEBGL.NEAREST);
                    tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MAG_FILTER, WEBGL.NEAREST);
                }
                else {
                    var image = this.texture;
                    // Before we bind resize to a power of two if nessesary so we can MIPMAP
                    if ((!Texture.isPowerOfTwo(this.texture.height) | !Texture.isPowerOfTwo(this.texture.width)) === 1) {
                        var temp = document.createElement('canvas');
                        temp.height = Texture.fitPowerOfTwo(image.height);
                        temp.width = Texture.fitPowerOfTwo(image.width);
                        var ctx = temp.getContext('2d');
                        ctx.drawImage(image, 0, 0, temp.width, temp.height);
                        //Substitute the resized image
                        image = temp;
                    }
                    tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.RGBA, WEBGL.RGBA, WEBGL.UNSIGNED_BYTE, image);
                    tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MIN_FILTER, WEBGL.LINEAR_MIPMAP_NEAREST);
                    tilePrepDevice.generateMipmap(WEBGL.TEXTURE_2D);
                }
                tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, null);
            }
            catch ($e1) {
                this.errored = true;
            }
        }
    },

    addVertex: function (buffer, index, p) {
        buffer[index++] = p.position.x;
        buffer[index++] = p.position.y;
        buffer[index++] = p.position.z;
        buffer[index++] = p.tu;
        buffer[index++] = p.tv;
        return index;
    },

    geoTo3dWithAlt: function (lat, lng, useLocalCenter, rev) {
        lat = Math.max(Math.min(90, lat), -90);
        lng = Math.max(Math.min(180, lng), -180);
        if (!tileDemEnabled || this.demData == null) {
            return this.geoTo3d(lat, lng, useLocalCenter);
        }
        if (rev) {
            lng -= 180;
        }
        var altitude = this.demData[this.demIndex];
        var retVal = this.geoTo3dWithAltitude(lat, lng, altitude, useLocalCenter);
        return retVal;
    },

    geoTo3dWithAltitude: function (lat, lng, altitude, useLocalCenter) {
        var radius = 1 + (altitude / this.get__demScaleFactor());
        var retVal = Vector3d.create((Math.cos(lng * Tile.RC) * Math.cos(lat * Tile.RC) * radius), (Math.sin(lat * Tile.RC) * radius), (Math.sin(lng * Tile.RC) * Math.cos(lat * Tile.RC) * radius));
        if (useLocalCenter) {
            retVal.subtract(this.localCenter);
        }
        return retVal;
    },

    get__demScaleFactor: function () {
        return this._demScaleFactor; // / Properties.Settings.Default.TerrainScaling;
    },

    set__demScaleFactor: function (value) {
        this._demScaleFactor = value;
        return value;
    },

    requestImage: function () {
        var $this = this;

        if (this.dataset.get_extension().toLowerCase().indexOf('fits') > -1) {
            if (!this.downloading && !this.readyToRender) {
                this.downloading = true;
                if (useGlVersion2) {
                    this.fitsImage = new FitsImageTile(this.dataset, this.get_URL(), function (wcsImage) {
                        $this.downloading = false;
                        $this.errored = $this.fitsImage.errored;
                        tileCacheRemoveFromQueue($this.get_key(), true);
                        if (!$this.fitsImage.errored) {
                            if (!$this.level) {
                                // For a non-HiPS tiled FITS, this is our
                                // mechanism for notifying the layer creator
                                // that the initial FITS data have loaded and
                                // the FitsProperties can be trusted.
                                $this.dataset.get_fitsProperties()._fireMainImageLoaded($this.fitsImage);
                                $this.fitsImage.applyDisplaySettings();
                            }
                            $this.texReady = true;
                            $this.readyToRender = $this.texReady && ($this.demReady || !$this.demTile);
                            $this.requestPending = false;
                            $this.makeTexture();
                        }
                    });
                }
                else {
                    this.fitsImage = FitsImageJs.createTiledFits(this.dataset, this.get_URL(), function (wcsImage) {
                        if (!$this.level) {
                            $this.dataset.get_fitsProperties()._fireMainImageLoaded($this.fitsImage);
                        }
                        $this.texReady = true;
                        $this.downloading = false;
                        $this.errored = $this.fitsImage.errored;
                        $this.readyToRender = $this.texReady && ($this.demReady || !$this.demTile);
                        $this.requestPending = false;
                        tileCacheRemoveFromQueue($this.get_key(), true);
                        $this.texture2d = wcsImage.getBitmap().getTexture();
                    });
                }
            }
        } else {
            if (this.get_dataset().get_wcsImage() != null) {
                this.texReady = true;
                this.downloading = false;
                this.errored = false;
                this.readyToRender = true;
                this.requestPending = false;
                tileCacheRemoveFromQueue(this.get_key(), true);
                return;
            }
            if (!this.downloading && !this.readyToRender) {
                this.downloading = true;
                this.texture = document.createElement('img');
                var xdomimg = this.texture;
                this.texture.addEventListener('load', function (e) {
                    $this.texReady = true;
                    $this.downloading = false;
                    $this.errored = false;
                    $this.readyToRender = $this.texReady && ($this.demReady || !$this.demTile);
                    $this.requestPending = false;
                    tileCacheRemoveFromQueue($this.get_key(), true);
                    $this.makeTexture();
                }, false);
                this.texture.addEventListener('error', function (e) {
                    if (!$this.texture.hasAttribute('proxyattempt')) {
                        $this.texture.setAttribute('proxyattempt', true);
                        // NOTE: `this.URL` is dynamically generated using
                        // URLHelpers.rewrite(). Say that we request tiles from
                        // example.com, which requires CORS proxying. Say also
                        // that this callback is called for a request to a tile
                        // that should in fact be available. If a different
                        // request fails before this callback is called,
                        // activateProxy() will be called on the example.com
                        // domain, making it so that `this.URL` in the following
                        // call goes through the proxy, making it so that
                        // `new_url` is null, making it so that this tile is
                        // erroneously marked as failed when it should not be.
                        // The solution: make sure to check proxy activation
                        // with the *original* request URL, `texture.Src`, not
                        // the one that may have been updated, `this.URL`.
                        var new_url = URLHelpers.singleton.activateProxy($this.texture.src);
                        if (new_url != null) {
                            // null => don't bother: we know that the proxy won't help
                            $this.texture.src = new_url;
                            return;
                        }
                    }
                    $this.downloading = false;
                    $this.readyToRender = false;
                    $this.errored = true;
                    $this.requestPending = false;
                    tileCacheRemoveFromQueue($this.get_key(), true);
                }, false);
                xdomimg.crossOrigin = 'anonymous';
                this.texture.src = this.get_URL();
            }
        }
    },

    createDemFromParent: function () {
        return false;
    },

    _loadDemData: function () {
        if (this.demFile == null) {
            return this.createDemFromParent();
        }
        this.demData = this.demFile;
        if (this.demFile.length !== 1089 && this.demFile.length !== 513) {
            return this.createDemFromParent();
        }
        var total = 0;
        var $enum1 = ss.enumerate(this.demData);
        while ($enum1.moveNext()) {
            var fv = $enum1.current;
            total += fv;
        }
        this.demAverage /= this.demData.length;
        return true;
    },

    requestDem: function () {
        var $this = this;

        if (!this.readyToRender && !this.demDownloading) {
            this.demTile = true;
            this.demDownloading = true;
            Tile.callCount++;
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', function (e) {
                $this.demReady = true;
                $this.demDownloading = false;
                $this.readyToRender = $this.texReady && ($this.demReady || !$this.demTile);
                $this.requestPending = false;
                try {
                    $this.demFile = new Float32Array(xhr.response);
                }
                catch ($e1) {
                }
                tileCacheRemoveFromQueue($this.get_key(), true);
            }, false);
            xhr.addEventListener('error', function (e) {
                $this.demDownloading = false;
                $this.demReady = false;
                $this.readyToRender = false;
                $this.errored = true;
                $this.requestPending = false;
                tileCacheRemoveFromQueue($this.get_key(), true);
            }, false);
            xhr.open('GET', this.get_demURL(), true);
            xhr.responseType = 'arraybuffer';
            xhr.send();
        }
    },

    draw3D: function (renderContext, opacity) {
        this.renderedGeneration = Tile.currentRenderGeneration;
        Tile.tilesTouched++;
        this.accessCount = inc_tileCacheAccessID();
        if (this.errored) {
            return false;
        }
        var xMax = 2;
        this.inViewFrustum = true;
        if (!this.readyToRender) {
            tileCacheAddTileToQueue(this);
            return false;
        }
        var transitioning = false;
        var childIndex = 0;
        var yOffset = 0;
        if (this.dataset.get_mercator() || this.dataset.get_bottomsUp()) {
            yOffset = 1;
        }
        var xOffset = 0;
        var anythingToRender = false;
        var childRendered = false;
        for (var y1 = 0; y1 < 2; y1++) {
            for (var x1 = 0; x1 < xMax; x1++) {
                if (this.level < this.dataset.get_levels()) {
                    // make children
                    if (this.children[childIndex] == null) {
                        this.children[childIndex] = tileCacheGetTile(this.level + 1, this.tileX * 2 + ((x1 + xOffset) % 2), this.tileY * 2 + ((y1 + yOffset) % 2), this.dataset, this);
                    }
                    if (this.children[childIndex].isTileInFrustum(renderContext.get_frustum())) {
                        this.inViewFrustum = true;
                        if (this.children[childIndex].isTileBigEnough(renderContext)) {
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
                    if (this.renderChildPart[childIndex].get_targetState() !== this.renderChildPart[childIndex].get_state()) {
                        transitioning = true;
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
        Tile.tilesInView++;
        this.accomidation = this._computeAccomidation();
        for (var i = 0; i < 4; i++) {
            if (this.renderChildPart[i].get_targetState()) {
                this.renderPart(renderContext, i, (opacity / 100), false);
            }
        }
        return true;
    },

    _computeAccomidation: function () {
        var accVal = 0;
        if (!Tile.useAccomidation) {
            return 0;
        }
        var top = tileCacheGetCachedTile(this.level, this.tileX, this.tileY + 1, this.dataset, this);
        if (top == null || top.renderedAtOrBelowGeneration < Tile.currentRenderGeneration - 2) {
            accVal += 1;
        }
        var right = tileCacheGetCachedTile(this.level, this.tileX + 1, this.tileY, this.dataset, this);
        if (right == null || right.renderedAtOrBelowGeneration < Tile.currentRenderGeneration - 2) {
            accVal += 2;
        }
        var bottom = tileCacheGetCachedTile(this.level, this.tileX, this.tileY - 1, this.dataset, this);
        if (bottom == null || bottom.renderedAtOrBelowGeneration < Tile.currentRenderGeneration - 2) {
            accVal += 4;
        }
        var left = tileCacheGetCachedTile(this.level, this.tileX - 1, this.tileY, this.dataset, this);
        if (left == null || left.renderedAtOrBelowGeneration < Tile.currentRenderGeneration - 2) {
            accVal += 8;
        }
        return accVal;
    },

    renderPart: function (renderContext, part, opacity, combine) {
        if (tilePrepDevice == null) {
            var lighting = renderContext.lighting && renderContext.get_sunPosition() != null;
            var $enum1 = ss.enumerate(this._renderTriangleLists[part]);
            while ($enum1.moveNext()) {
                var tri = $enum1.current;
                tri.opacity = opacity;
                if (lighting) {
                    // transform normal by WV
                    var norm = tri.normal.copy();
                    renderContext.get_world().multiplyVector(norm);
                    norm.normalize();

                    // Dot product from sun angle
                    var light = Vector3d.dot(norm, renderContext.get_sunPosition());
                    if (light < 0) {
                        light = 0;
                    }
                    else {
                        light = Math.min(1, (light * 1));
                    }

                    // set lighting
                    tri.lighting = light;
                }
                else {
                    tri.lighting = 1;
                }
                tri.draw(renderContext.device, renderContext.WVP);
            }
        } else {
            if (useGlVersion2 && this.fitsImage != null) {
                ColorMapContainer.bindColorMapTexture(tilePrepDevice, this.dataset.get_fitsProperties().colorMapName);
                FitsShader.min = this.dataset.get_fitsProperties().lowerCut;
                FitsShader.max = this.dataset.get_fitsProperties().upperCut;
                FitsShader.containsBlanks = this.dataset.get_fitsProperties().containsBlanks;
                FitsShader.blankValue = this.dataset.get_fitsProperties().blankValue;
                FitsShader.bZero = this.dataset.get_fitsProperties().bZero;
                FitsShader.bScale = this.dataset.get_fitsProperties().bScale;
                FitsShader.scaleType = this.dataset.get_fitsProperties().scaleType;
                FitsShader.transparentBlack = this.dataset.get_fitsProperties().transparentBlack;
                FitsShader.use(renderContext, this._vertexBuffer, this.getIndexBuffer(part, this.accomidation), this.texture2d, opacity, false, this.globalCenter);
            }
            else {
                TileShader.use(renderContext, this._vertexBuffer, this.getIndexBuffer(part, this.accomidation), this.texture2d, opacity, false, this.globalCenter);
            }
            renderContext.gl.drawElements(WEBGL.TRIANGLES, this.triangleCount * 3, WEBGL.UNSIGNED_SHORT, 0);
        }
    },

    cleanUp: function (removeFromParent) {
        this.readyToRender = false;
        this.demData = null;
        this.demFile = null;
        this.demDownloading = false;
        this.texReady = false;
        this.demReady = false;
        this.errored = false;
        if (this.texture != null) {
            this.texture = null;
        }
        this._renderTriangleLists = new Array(4);
        this.geometryCreated = false;
        if (removeFromParent && this.parent != null) {
            this.parent.removeChild(this);
            this.parent = null;
        }
        if (tilePrepDevice != null) {
            var $enum1 = ss.enumerate(this._indexBuffers);
            while ($enum1.moveNext()) {
                var buf = $enum1.current;
                tilePrepDevice.deleteBuffer(buf);
            }
            this._indexBuffers = new Array(4);
            if (this._vertexBuffer != null) {
                tilePrepDevice.deleteBuffer(this._vertexBuffer);
                this._vertexBuffer = null;
            }
            if (this.texture2d != null) {
                tilePrepDevice.deleteTexture(this.texture2d);
                this.texture2d = null;
            }
        }
    },

    removeChild: function (child) {
        for (var i = 0; i < 4; i++) {
            if (this.children[i] === child) {
                this.children[i] = null;
                return;
            }
        }
    },

    createGeometry: function (renderContext) {
        if (tileDemEnabled && this.demReady && this.demData == null) {
            if (!this._loadDemData()) {
                return false;
            }
        }
        if (tileDemEnabled && this.demData == null) {
            return false;
        }
        this.readyToRender = true;
        return true;
    },

    calcSphere: function () {
        var corners = new Array(4);
        corners[0] = this.topLeft;
        corners[1] = this.bottomRight;
        corners[2] = this.topRight;
        corners[3] = this.bottomLeft;
        var result = ConvexHull.findEnclosingSphere(corners);
        this.sphereCenter = result.center;
        this.sphereRadius = result.radius;
    },

    isTileBigEnough: function (renderContext) {
        if (this.level > 1) {
            // Test for tile scale in view.
            var wvp = renderContext.WVP;
            wvp._transformTo(this.topLeft, this._topLeftScreen);
            wvp._transformTo(this.bottomRight, this._bottomRightScreen);
            wvp._transformTo(this.topRight, this._topRightScreen);
            wvp._transformTo(this.bottomLeft, this._bottomLeftScreen);
            var top = this._topLeftScreen;
            top.subtract(this._topRightScreen);
            var topLength = top.length();
            var bottom = this._bottomLeftScreen;
            bottom.subtract(this._bottomRightScreen);
            var bottomLength = bottom.length();
            var left = this._bottomLeftScreen;
            left.subtract(this._topLeftScreen);
            var leftLength = left.length();
            var right = this._bottomRightScreen;
            right.subtract(this._topRightScreen);
            var rightLength = right.length();
            var lengthMax = Math.max(Math.max(rightLength, leftLength), Math.max(bottomLength, topLength));
            if (lengthMax < 300) {  // was 220
                return false;
            }
            else {
                Tile.deepestLevel = (this.level > Tile.deepestLevel) ? this.level : Tile.deepestLevel;
            }
        }
        return true;
    },

    isTileInFrustum: function (frustum) {
        if (this.level < 2 && (!this.dataset.get_projection() || this.dataset.get_projection() === 3)) {
            // return true;
        }
        this.inViewFrustum = false;
        var centerV4 = new Vector4d(this.sphereCenter.x, this.sphereCenter.y, this.sphereCenter.z, 1);
        for (var i = 0; i < 6; i++) {
            if (frustum[i].dot(centerV4) < -this.sphereRadius) {
                return false;
            }
        }
        this.inViewFrustum = true;
        return true;
    },

    get_sphereRadius: function () {
        return this.sphereRadius;
    },

    get_sphereCenter: function () {
        return this.sphereCenter;
    },

    geoTo3d: function (lat, lng, useLocalCenter) {
        if (this.dataset.get_dataSetType() === 3) {
            var retVal = Vector3d.create(-(Math.cos(lng * Tile.RC) * Math.cos(lat * Tile.RC) * this.radius), (Math.sin(lat * Tile.RC) * this.radius), (Math.sin(lng * Tile.RC) * Math.cos(lat * Tile.RC) * this.radius));
            return retVal;
        } else {
            lng -= 180;
            var retVal = Vector3d.create((Math.cos(lng * Tile.RC) * Math.cos(lat * Tile.RC) * this.radius), (Math.sin(lat * Tile.RC) * this.radius), (Math.sin(lng * Tile.RC) * Math.cos(lat * Tile.RC) * this.radius));
            return retVal;
        }
    },

    onCreateVertexBuffer: function (sender, e) { },

    get_dataset: function () {
        return this.dataset;
    },

    set_dataset: function (value) {
        this.dataset = value;
        return value;
    },

    get_key: function () {
        if (this._key == null) {
            this._key = getTileKey(this.dataset, this.level, this.tileX, this.tileY, this.parent);
        }
        return this._key;
    },

    // URL parameters
    //
    //{0} ImageSetID
    //{1} level
    //{2} x tile id
    //{3} y tile id
    //{4} quadtree address (VE style)
    //{5} quadtree address (Google maps style)
    //{6} top left corner RA
    //{7} top left corner Dec
    //{8} bottom right corner RA
    //{9} bottom right corner dec
    //{10} bottom left corner RA
    //{11} bottom left corner dec
    //{12} top right corner RA
    //{13} top right corner dec
    //{X} - Tile X value
    //{Y} - Tile Y value
    //{L} - Tile Level
    //{Q} - Quad Key ID
    //{S} - Last Digit of Quadkey
    get_URL: function () {
        var rewritten_url = URLHelpers.singleton.rewrite(this.dataset.get_url(), 0);
        var returnUrl = rewritten_url;
        if (rewritten_url.indexOf('{1}') > -1) {
            // Old style URL
            if (!this.dataset.get_projection() && !ss.emptyString(this.dataset.get_quadTreeTileMap())) {
                returnUrl = ss.format(rewritten_url, this.getServerID(), this.getTileID());
                if (returnUrl.indexOf('virtualearth.net') > -1) {
                    returnUrl += '&n=z';
                }
                return returnUrl;
            }
            else {
                return ss.format(rewritten_url, this.dataset.get_imageSetID(), this.level, this.tileX, this.tileY);
            }
        }
        returnUrl = ss.replaceString(returnUrl, '{X}', this.tileX.toString());
        returnUrl = ss.replaceString(returnUrl, '{Y}', this.tileY.toString());
        returnUrl = ss.replaceString(returnUrl, '{L}', this.level.toString());
        var hash = 0;
        if (returnUrl.indexOf('{S:0}') > -1) {
            hash = 0;
            returnUrl = ss.replaceString(returnUrl, '{S:0}', '{S}');
        }
        if (returnUrl.indexOf('{S:1}') > -1) {
            hash = 1;
            returnUrl = ss.replaceString(returnUrl, '{S:1}', '{S}');
        }
        if (returnUrl.indexOf('{S:2}') > -1) {
            hash = 2;
            returnUrl = ss.replaceString(returnUrl, '{S:2}', '{S}');
        }
        if (returnUrl.indexOf('{S:3}') > -1) {
            hash = 3;
            returnUrl = ss.replaceString(returnUrl, '{S:3}', '{S}');
        }
        if (returnUrl.indexOf('a{S}') > -1) {
            returnUrl = ss.replaceString(returnUrl, 'a{S}', 'r{S}');
        }
        if (returnUrl.indexOf('h{S}') > -1) {
            returnUrl = ss.replaceString(returnUrl, 'h{S}', 'r{S}');
        }
        if (returnUrl.indexOf('//r{S}.ortho.tiles.virtualearth.net') > -1) {
            returnUrl = ss.replaceString(returnUrl, '//r{S}.ortho.tiles.virtualearth.net', '//ecn.t{S}.tiles.virtualearth.net');
        }
        var id = this.getTileID();
        var server = '';
        if (!id.length) {
            server = hash.toString();
        } else {
            server = id.substr(id.length - 1, 1);
        }
        returnUrl = ss.replaceString(returnUrl, '{Q}', id);
        returnUrl = ss.replaceString(returnUrl, '{S}', server);
        if (returnUrl.indexOf('virtualearth.net') > -1) {
            returnUrl += '&n=z';
        }
        return returnUrl;
    },

    get_demURL: function () {
        var rewritten_url = URLHelpers.singleton.rewrite(this.dataset.get_demUrl(), 0);
        if (!this.dataset.get_projection() && !freestandingMode) {
            var baseUrl = URLHelpers.singleton.coreStaticUrl('wwtweb/demtile.aspx?q={0},{1},{2},M');
            if (!ss.emptyString(rewritten_url)) {
                baseUrl = rewritten_url;
            }
        }
        if (rewritten_url.indexOf('{1}') > -1) {
            return ss.format(rewritten_url + '&new', this.level, this.tileX, this.tileY);
        }
        var returnUrl = rewritten_url;
        returnUrl = ss.replaceString(returnUrl, '{X}', this.tileX.toString());
        returnUrl = ss.replaceString(returnUrl, '{Y}', this.tileY.toString());
        returnUrl = ss.replaceString(returnUrl, '{L}', this.level.toString());
        var hash = 0;
        if (returnUrl.indexOf('{S:0}') > -1) {
            hash = 0;
            returnUrl = ss.replaceString(returnUrl, '{S:0}', '{S}');
        }
        if (returnUrl.indexOf('{S:1}') > -1) {
            hash = 1;
            returnUrl = ss.replaceString(returnUrl, '{S:1}', '{S}');
        }
        if (returnUrl.indexOf('{S:2}') > -1) {
            hash = 2;
            returnUrl = ss.replaceString(returnUrl, '{S:2}', '{S}');
        }
        if (returnUrl.indexOf('{S:3}') > -1) {
            hash = 3;
            returnUrl = ss.replaceString(returnUrl, '{S:3}', '{S}');
        }
        var id = this.getTileID();
        var server = '';
        if (!id.length) {
            server = hash.toString();
        } else {
            server = id.substr(id.length - 1, 1);
        }
        returnUrl = ss.replaceString(returnUrl, '{Q}', id);
        returnUrl = ss.replaceString(returnUrl, '{S}', server);
        return returnUrl;
    },

    getServerID: function () {
        var server = (this.tileX & 1) + ((this.tileY & 1) << 1);
        return server;
    },

    getTileID: function () {
        if (this._tileId != null) {
            return this._tileId;
        }
        var netLevel = this.level;
        var netX = this.tileX;
        var netY = this.tileY;
        if (this.dataset.get_projection() === 1) {
            netLevel++;
        }
        var tileMap = this.dataset.get_quadTreeTileMap();
        if (!ss.emptyString(tileMap)) {
            var sb = new ss.StringBuilder();
            for (var i = netLevel; i > 0; --i) {
                var mask = 1 << (i - 1);
                var val = 0;
                if (!!(netX & mask)) {
                    val = 1;
                }
                if (!!(netY & mask)) {
                    val += 2;
                }
                sb.append(tileMap.substr(val, 1));
            }
            this._tileId = sb.toString();
            return this._tileId;
        } else {
            this._tileId = '0';
            return this._tileId;
        }
    },

    get_vertexCount: function () {
        return this._vertexCount;
    },

    set_vertexCount: function (value) {
        this._vertexCount = value;
        return value;
    }
};

registerType("Tile", [Tile, Tile$, null]);
