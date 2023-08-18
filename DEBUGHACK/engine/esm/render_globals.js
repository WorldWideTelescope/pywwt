// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Various global variables associated with the rendering engine.
//
// In the original C# code these were generally static values associated with
// various classes, but since we want to avoid circular dependencies in our
// module structure, we gather some of those values in modules that contain
// minimal amounts of code (like this one) so that they can go early in the
// dependency graph.

// This used to be Tile.prepDevice. It's the global WebGL rendering context.
export var tilePrepDevice = null;

export function set_tilePrepDevice(value) {
    tilePrepDevice = value;
}

// This used to be Tile.uvMultiple. It's some GL rendering state variable.
export var tileUvMultiple = 256;

export function set_tileUvMultiple(value) {
    tileUvMultiple = value;
}

// This used to be Tile.demEnabled. It controls whether DEM rendering is
// enabled, hopefully?
export var tileDemEnabled = false;

export function set_tileDemEnabled(value) {
    tileDemEnabled = !!value;
}

// This used to be `RenderContext.useGl`. It sets whether we're using WebGL.
//
// Older versions of the engine used to support HTML Canvas rendering, but that
// mode is now deprecated. Uses where `useGl` is false may break at any time.
export var useGl = false;

export function set_useGl(value) {
    useGl = !!value;
}

// This used to be `RenderContext.useGlVersion2`. It sets whether we're
// using WebGL >= 2.
export var useGlVersion2 = false;

export function set_useGlVersion2(value) {
    useGlVersion2 = !!value;
}

// This used to be `TileCache.addTileToQueue()`. It's a function that
// adds a tile to the fetch queue.
export var tileCacheAddTileToQueue = null;

export function set_tileCacheAddTileToQueue(value) {
    tileCacheAddTileToQueue = value;
}

// This used to be `TileCache.removeFromQueue()`. It's a function that
// removes a tile from the fetch queue.
export var tileCacheRemoveFromQueue = null;

export function set_tileCacheRemoveFromQueue(value) {
    tileCacheRemoveFromQueue = value;
}

// This used to be `TileCache.accessID`.
var tileCacheAccessID = 0;

export function inc_tileCacheAccessID() {
    return tileCacheAccessID++;
}

// This used to be `TileCache.getTile()`. It gets a tile from the cache, unconditionally.
export var tileCacheGetTile = null;

export function set_tileCacheGetTile(value) {
    tileCacheGetTile = value;
}

// This used to be `TileCache.getCachedTile()`. It gets a tile from the cache.
export var tileCacheGetCachedTile = null;

export function set_tileCacheGetCachedTile(value) {
    tileCacheGetCachedTile = value;
}

// This is another way to access `WWTControl.singleton.renderContext`. It's the
// global singleton RenderContext instance.
export var globalRenderContext = null;

export function set_globalRenderContext(value) {
    globalRenderContext = value;
}
