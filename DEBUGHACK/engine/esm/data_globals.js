// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Various global variables associated with data assets.
//
// See `render_globals.js` for a general rationale for this kind of module.

// This used to be WWTControl(.singleton).freestandingMode. It sets whether the
// engine will avoid accessing the central WWT servers.
export var freestandingMode = false;

export function set_freestandingMode(value) {
    freestandingMode = !!value;
}

// This is equivalent to `new HipsProperties(imageset)`. We abstract
// the function to avoid circular dependencies in the type hierarchy.
export var makeNewHipsProperties = null;

export function set_makeNewHipsProperties(value) {
    makeNewHipsProperties = value;
}

// This is equivalent to `new Folder()`. We abstract
// the function to avoid circular dependencies in the type hierarchy.
export var makeNewFolder = null;

export function set_makeNewFolder(value) {
    makeNewFolder = value;
}

// This is equivalent to `Place.create(name, lat, lng, classification,
// constellation, type, zoomFactor)`. We abstract the function to avoid circular
// dependencies in the type hierarchy.
export var createPlace = null;

export function set_createPlace(value) {
    createPlace = value;
}

// This is another way to access `WWTControl.singleton`. It's the
// global singleton WWTControl instance.
export var globalWWTControl = null;

export function set_globalWWTControl(value) {
    globalWWTControl = value;
}

// This is another way to access the `WWTControl.scriptInterface` singleton. It's
// the global singleton ScriptInterface instance.
export var globalScriptInterface = null;

export function set_globalScriptInterface(value) {
    globalScriptInterface = value;
}

// This is another way to access `LayerManager.setVisibleLayerList()`. Once
// again, we need this to break some circular dependencies in the module
// structure.
export var setManagerVisibleLayerList = null;

export function set_setManagerVisibleLayerList(value) {
    setManagerVisibleLayerList = value;
}

// This is another way to access `TourDocument.fromUrlRaw()`.  Once again, we
// need this to break some circular dependencies in the module structure.

export var tourDocumentFromUrlRaw = null;

export function set_tourDocumentFromUrlRaw(value) {
    tourDocumentFromUrlRaw = value;
}

// This is another way to access `LayerManager.getAllMaps()`.  Once again, we
// need this to break some circular dependencies in the module structure.

export var layerManagerGetAllMaps = null;

export function set_layerManagerGetAllMaps(value) {
    layerManagerGetAllMaps = value;
}

// This is another way to access `Wtml.getWtmlFile()`.  Once again, we
// need this to break some circular dependencies in the module structure.

export var loadWtmlFile = null;

export function set_loadWtmlFile(value) {
    loadWtmlFile = value;
}
