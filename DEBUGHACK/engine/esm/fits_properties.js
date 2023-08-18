// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Properties about FITS data.

import { registerType, registerEnum } from "./typesystem.js";


// wwtlib.ScaleTypes

export var ScaleTypes = {
    linear: 0,
    log: 1,
    power: 2,
    squareRoot: 3,
    histogramEqualization: 4
};

registerType("ScaleTypes", ScaleTypes);
registerEnum("ScaleTypes", ScaleTypes);


// wwtlib.FitsProperties

export function FitsProperties() {
    this.bZero = 0;
    this.bScale = 1;
    this.containsBlanks = false;
    this.blankValue = Number.MIN_VALUE;
    this.maxVal = Number.MIN_VALUE;
    this.minVal = Number.MAX_VALUE;
    this.upperCut = Number.MIN_VALUE;
    this.lowerCut = Number.MAX_VALUE;
    this.transparentBlack = false;
    this.colorMapName = 'viridis';
    this.scaleType = 0;

    // This field exists to support non-HiPS tiled FITS imagesets. We need a
    // mechanism to notify callers when the top-level tile is loaded,
    // because only after that has happened is it possible to set up
    // trustworthy values for properties like LowerCut here. *HiPS* tiled
    // FITS imagesets don't need this because they have a separate top-level
    // "properties" file that can be used to trigger a callback.
    //
    // We need to load the top-level tile to properly set up the properties
    // here because (1) they can't be determined well from the level-0 tile
    // data alone, (2) we want to give the dataset author a chance to
    // customize them, and (3) the tiled FITS data-loaders don't calculate
    // min/max from the data for performance reasons. And we'd prefer not to
    // add the relevant values to the ImageSet XML definition.
    //
    // Anyway, the tangent tile image loading code will cause this action to
    // be triggered when the level-0 tile loads successfully. It would make
    // sense to also trigger this action for when a non-tiled FITS file is
    // loaded, but in that use case the existing WcsLoaded callback
    // suffices. The tiling framework already uses WcsLoaded so for that
    // case we need to add this extra hook.
    this.onMainImageLoaded = null;
    this.mainImageLoadedEventHasFired = false;
}

var FitsProperties$ = {
    // See description of the onMainImageLoaded field. This method exists to
    // help non-HiPS tiled FITS datasets notify callers when the initial
    // data have loaded and these FitsProperties can be trusted.
    _fireMainImageLoaded: function (image) {
        if (this.onMainImageLoaded != null && !this.mainImageLoadedEventHasFired) {
            this.mainImageLoadedEventHasFired = true;
            this.onMainImageLoaded(image);
        }
    }
};

registerType("FitsProperties", [FitsProperties, FitsProperties$, null]);
