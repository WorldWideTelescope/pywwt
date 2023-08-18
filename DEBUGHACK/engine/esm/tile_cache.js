// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The cache of tiles and associated download queue.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import {
    set_tileCacheAddTileToQueue,
    set_tileCacheGetCachedTile,
    set_tileCacheGetTile,
    set_tileCacheRemoveFromQueue,
} from "./render_globals.js";
import { getTileKey } from "./util.js";
import { Tile } from "./tile.js";
import { Imageset, ProjectionType } from "./imageset.js";


// wwtlib.TileCache

export function TileCache() { }

TileCache._queue = {};
TileCache._tiles = {};
TileCache.openThreads = 8;
TileCache.readyToRenderCount = 0;
TileCache.maxTileCacheSize = 800;
TileCache.maxReadyToRenderSize = 200;
TileCache._maxTotalToPurge = 0;

TileCache.get_queueCount = function () {
    return ss.keyCount(TileCache._queue);
};

// This name is no longer used internally, but preserve it
// for API compatibility.
TileCache.getTile = function (level, x, y, dataset, parent) {
    var retTile = null;
    var tileKey = getTileKey(dataset, level, x, y, parent);
    if (!ss.keyExists(TileCache._tiles, tileKey)) {
        retTile = Imageset.getNewTile(dataset, level, x, y, parent);
        if (retTile != null) {
            TileCache._tiles[tileKey] = retTile;
        }
    }
    else {
        retTile = TileCache._tiles[tileKey];
    }
    var p = 0;
    return retTile;
};

set_tileCacheGetTile(TileCache.getTile);

// This name is no longer used internally, but preserve it
// for API compatibility.
TileCache.getCachedTile = function (level, x, y, dataset, parent) {
    if (level < dataset.get_baseLevel()) {
        return null;
    }
    var retTile = null;
    var tileKey = getTileKey(dataset, level, x, y, parent);
    try {
        if (!ss.keyExists(TileCache._tiles, tileKey)) {
            return null;
        } else {
            retTile = TileCache._tiles[tileKey];
        }
    }
    catch ($e1) { }
    return retTile;
};

set_tileCacheGetCachedTile(TileCache.getCachedTile);

TileCache.getReadyToRenderTileCount = function () {
    var notReadyCullList = [];
    var readyCullList = [];
    try {
        try {
            var $enum1 = ss.enumerate(ss.keys(TileCache._tiles));
            while ($enum1.moveNext()) {
                var key = $enum1.current;
                var tile = TileCache._tiles[key];
                if (tile.renderedGeneration < (Tile.currentRenderGeneration - 10) && !(tile.requestPending || tile.downloading)) {
                    if (tile.readyToRender) {
                        readyCullList.push(tile);
                    }
                    else {
                        notReadyCullList.push(tile);
                    }
                }
            }
        }
        catch ($e2) {
        }
        return readyCullList.length;
    }
    catch ($e3) {
        return -1;
    }
};

TileCache.processQueue = function (renderContext) {
    while (ss.keyCount(TileCache._queue) > 0 && TileCache.openThreads > 0) {
        var minDistance = 100000;
        var overlayTile = false;
        var maxKey = null;
        var level = 1000;
        var $enum1 = ss.enumerate(ss.keys(TileCache._queue));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var t = TileCache._queue[key];
            if (!t.requestPending && t.inViewFrustum) {
                var vectTemp = Vector3d.makeCopy(t.get_sphereCenter());
                vectTemp._transformByMatrics(renderContext.get_world());
                if (renderContext.space) {
                    vectTemp.subtract(Vector3d.create(0, 0, -1));
                }
                else {
                    vectTemp.subtract(renderContext.cameraPosition);
                }
                var distTemp = Math.max(0, vectTemp.length() - t.get_sphereRadius());
                var thisIsOverlay = (t.get_dataset().get_projection() === ProjectionType.tangent) || (t.get_dataset().get_projection() === ProjectionType.skyImage);
                if (distTemp < minDistance && (!overlayTile || thisIsOverlay)) {
                    minDistance = distTemp;
                    maxKey = t.get_key();
                    level = t.level;
                    overlayTile = thisIsOverlay;
                }
            }
        }
        if (maxKey != null) {
            var workTile = TileCache._queue[maxKey];
            workTile.requestPending = true;
            TileCache.openThreads--;
            if (TileCache.openThreads < 0) {
                TileCache.openThreads = 0;
            }
            workTile.requestImage();
            if (workTile.get_dataset().get_elevationModel()) {
                workTile.requestDem();
            }
        } else {
            return;
        }
    }
};

// This name is no longer used internally, but preserve it
// for API compatibility.
TileCache.addTileToQueue = function (tile) {
    var hitValue;
    hitValue = 256;
    if (!tile.downloading && !tile.readyToRender) {
        if (ss.keyExists(TileCache._queue, tile.get_key())) {
            TileCache._queue[tile.get_key()].requestHits += hitValue;
        } else {
            tile.requestHits = hitValue;
            TileCache._queue[tile.get_key()] = tile;
        }
    }
    return true;
};

set_tileCacheAddTileToQueue(TileCache.addTileToQueue);

// This name is no longer used internally, but preserve it
// for API compatibility.
TileCache.removeFromQueue = function (key, complete) {
    if (complete) {
        var workTile = TileCache._queue[key];
        if (workTile != null) {
            workTile.requestPending = false;
            delete TileCache._queue[workTile.get_key()];
        }
        TileCache.openThreads++;
    }
    delete TileCache._queue[key];
};

set_tileCacheRemoveFromQueue(TileCache.removeFromQueue);

TileCache.clearCache = function () {
    ss.clearKeys(TileCache._tiles);
};

TileCache.purgeQueue = function () {
    ss.clearKeys(TileCache._queue);
};

TileCache.purgeLRU = function () {
    if (ss.keyCount(TileCache._tiles) < TileCache.maxReadyToRenderSize) {
        return;
    }
    var notReadyCullList = [];
    var readyCullList = [];
    try {
        try {
            var $enum1 = ss.enumerate(ss.keys(TileCache._tiles));
            while ($enum1.moveNext()) {
                var key = $enum1.current;
                var tile = TileCache._tiles[key];
                if (tile.renderedGeneration < (Tile.currentRenderGeneration - 10) && !(tile.requestPending || tile.downloading)) {
                    if (tile.readyToRender) {
                        readyCullList.push(tile);
                    }
                    else {
                        notReadyCullList.push(tile);
                    }
                }
            }
        }
        catch ($e2) {
        }
        TileCache.readyToRenderCount = readyCullList.length;
        if (readyCullList.length > TileCache.maxReadyToRenderSize) {
            readyCullList.sort(function (t1, t2) {
                return (t2.accessCount < t1.accessCount) ? 1 : ((t2.accessCount === t1.accessCount) ? 0 : -1);
            });
            var totalToPurge = readyCullList.length - TileCache.maxReadyToRenderSize;
            var $enum3 = ss.enumerate(readyCullList);
            while ($enum3.moveNext()) {
                var tile = $enum3.current;
                if (totalToPurge < 1) {
                    break;
                }
                tile.cleanUp(false);
                totalToPurge--;
            }
        }
        if (ss.keyCount(TileCache._tiles) < TileCache.maxTileCacheSize) {
            return;
        }
        if (notReadyCullList.length > TileCache.maxTileCacheSize) {
            notReadyCullList.sort(function (t1, t2) {
                return (t2.accessCount < t1.accessCount) ? 1 : ((t2.accessCount === t1.accessCount) ? 0 : -1);
            });
            var totalToPurge = notReadyCullList.length - TileCache.maxTileCacheSize;
            if (totalToPurge > 20) {
                totalToPurge = 20;
            }
            var $enum4 = ss.enumerate(notReadyCullList);
            while ($enum4.moveNext()) {
                var tile = $enum4.current;
                if (totalToPurge < 1) {
                    break;
                }
                tile.cleanUp(true);
                delete TileCache._tiles[tile.get_key()];
                totalToPurge--;
            }
        }
    }
    catch ($e5) { }
    finally { }
    return;
};

// Age things in queue. If they are not visible they will go away in time
TileCache.decimateQueue = function () {
    var list = [];
    var $enum1 = ss.enumerate(ss.keys(TileCache._queue));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var t = TileCache._queue[key];
        if (!t.requestPending) {
            t.requestHits = t.requestHits / 2;
            try {
                if (t.requestHits < 2) {
                    list.push(t);
                }
                else if (!t.inViewFrustum) {
                    list.push(t);
                }
            }
            catch ($e2) {
            }
        }
    }
    var $enum3 = ss.enumerate(list);
    while ($enum3.moveNext()) {
        var t = $enum3.current;
        delete TileCache._queue[t.get_key()];
    }
};

var TileCache$ = {};

registerType("TileCache", [TileCache, TileCache$, null]);

