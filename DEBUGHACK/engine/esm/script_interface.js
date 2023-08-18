// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The quasi-legacy ScriptInterface control interface.
//
// I believe that this new class was created in the very early days of the WWT
// web control and was used as the interface point with the browser. In the
// modern WebGL engine, there's not need to put all this functionality in this
// separate module. But, as always, to preserve API compatibility, we maintain
// all of the interfaces that were added here.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Util } from "./util.js";
import { globalRenderContext, useGlVersion2 } from "./render_globals.js";
import { globalWWTControl, layerManagerGetAllMaps, loadWtmlFile } from "./data_globals.js";
import { Annotation, Circle, Poly, PolyLine } from "./annotation.js";
import { FitsImage } from "./layers/fits_image.js";
import { FitsImageJs } from "./layers/fits_image_js.js";
import { Imageset } from "./imageset.js";
import { ImageSetLayer } from "./layers/imageset_layer.js";
import { LayerManager } from "./layers/layer_manager.js";
import { Folder } from "./folder.js";


// wwtlib.SlideChangedEventArgs

export function SlideChangedEventArgs(caption) {
    ss.EventArgs.call(this);
    this.set_caption(caption);
}

var SlideChangedEventArgs$ = {
    get_caption: function () {
        return this._caption$2;
    },

    set_caption: function (value) {
        this._caption$2 = value;
        return value;
    }
};

registerType("SlideChangedEventArgs", [SlideChangedEventArgs, SlideChangedEventArgs$, ss.EventArgs]);


// wwtlib.ArrivedEventArgs

export function ArrivedEventArgs(ra, dec, zoom) {
    this._ra$2 = 0;
    this._dec$2 = 0;
    this._zoom$2 = 0;
    ss.EventArgs.call(this);
    this.set_RA(ra * 15);
    this.set_dec(dec);
    this.set_zoom(zoom / 6);
}

var ArrivedEventArgs$ = {
    get_RA: function () {
        return this._ra$2;
    },

    set_RA: function (value) {
        this._ra$2 = value;
        return value;
    },

    get_dec: function () {
        return this._dec$2;
    },

    set_dec: function (value) {
        this._dec$2 = value;
        return value;
    },

    get_zoom: function () {
        return this._zoom$2;
    },

    set_zoom: function (value) {
        this._zoom$2 = value;
        return value;
    }
};

registerType("ArrivedEventArgs", [ArrivedEventArgs, ArrivedEventArgs$, ss.EventArgs]);


// wwtlib.AnnotationClickEventArgs

export function AnnotationClickEventArgs(ra, dec, id) {
    this._ra$2 = 0;
    this._dec$2 = 0;
    ss.EventArgs.call(this);
    this.set_RA(ra * 15);
    this.set_dec(dec);
    this.set_id(id);
}

var AnnotationClickEventArgs$ = {
    get_RA: function () {
        return this._ra$2;
    },

    set_RA: function (value) {
        this._ra$2 = value;
        return value;
    },

    get_dec: function () {
        return this._dec$2;
    },

    set_dec: function (value) {
        this._dec$2 = value;
        return value;
    },

    get_id: function () {
        return this._id$2;
    },

    set_id: function (value) {
        this._id$2 = value;
        return value;
    }
};

registerType("AnnotationClickEventArgs", [AnnotationClickEventArgs, AnnotationClickEventArgs$, ss.EventArgs]);


// wwtlib.CollectionLoadedEventArgs

export function CollectionLoadedEventArgs(url) {
    ss.EventArgs.call(this);
    this._url$2 = url;
}

var CollectionLoadedEventArgs$ = {
    get_url: function () {
        return this._url$2;
    },

    set_url: function (value) {
        this._url$2 = value;
        return value;
    }
};

registerType("CollectionLoadedEventArgs", [CollectionLoadedEventArgs, CollectionLoadedEventArgs$, ss.EventArgs]);


// wwtlib.ScriptInterface

export function ScriptInterface() {
    this._missedReady = false;
    this.hideTourFeedback = false;
    this._smoothAnimation = false;
    this._showCaptions = true;
}

ScriptInterface._containsFitsLikeExtentsion = function (url) {
    var lowerCaseUrl = url.toLowerCase();
    return (ss.endsWith(lowerCaseUrl, 'fits') || ss.endsWith(lowerCaseUrl, 'ftz') || ss.endsWith(lowerCaseUrl, 'fit') || ss.endsWith(lowerCaseUrl, 'fts'));
};

ScriptInterface._addImageSet = function (name, gotoTarget, loaded, imageset) {
    if (ss.whitespace(name)) {
        name = LayerManager.getNextImageSetName();
    }
    var imagesetLayer = LayerManager.addImageSetLayerCallback(imageset, name, loaded);
    if (gotoTarget) {
        var zoom = imageset._guessZoomSetting(globalRenderContext.viewCamera.zoom);
        globalWWTControl.gotoRADecZoom(imageset.get_viewCenterX() / 15, imageset.get_viewCenterY(), zoom, false, null);
    }
    return imagesetLayer;
};

ScriptInterface._addFitsLayer = function (url, name, gotoTarget, loaded) {
    if (ss.whitespace(name)) {
        name = LayerManager.getNextFitsName();
    }
    var imagesetLayer = new ImageSetLayer();
    var imageset = new Imageset();
    var wcsLoaded = function (wcsImage) {
        if ((wcsImage).errored) {
            return;
        }
        var width = ss.truncate(wcsImage.get_sizeX());
        var height = ss.truncate(wcsImage.get_sizeY());
        imageset.setInitialParameters(wcsImage.get_description(), wcsImage.get_filename(), 2, 3, 5, Util.getHashCode(wcsImage.get_filename()), 0, 0, wcsImage.get_scaleY(), '.fits', wcsImage.get_scaleX() > 0, '', wcsImage.get_centerX(), wcsImage.get_centerY(), wcsImage.get_rotation(), false, '', false, false, 1, wcsImage.get_referenceX(), wcsImage.get_referenceY(), wcsImage.get_copyright(), wcsImage.get_creditsUrl(), '', '', 0, '');
        imageset.set_wcsImage(wcsImage);
        imagesetLayer.set_imageSet(imageset);
        LayerManager.addFitsImageSetLayer(imagesetLayer, name);
        if (gotoTarget) {
            var zoom = imageset._guessZoomSetting(globalRenderContext.viewCamera.zoom);
            globalWWTControl.gotoRADecZoom(wcsImage.get_viewCenterX() / 15, wcsImage.get_viewCenterY(), zoom, false, null);
        }
        if (loaded != null) {
            loaded(imagesetLayer);
        }
    };
    if (ss.whitespace(name)) {
        name = LayerManager.getNextFitsName();
    }
    if (useGlVersion2) {
        new FitsImage(imageset, url, null, wcsLoaded);
    }
    else {
        new FitsImageJs(imageset, url, null, wcsLoaded);
    }
    return imagesetLayer;
};

var ScriptInterface$ = {
    add_ready: function (value) {
        this.__ready = ss.bindAdd(this.__ready, value);
    },

    remove_ready: function (value) {
        this.__ready = ss.bindSub(this.__ready, value);
    },

    _fireReady: function () {
        if (this.__ready != null) {
            this.__ready(this, new ss.EventArgs());
        } else {
            this._missedReady = true;
        }
    },

    add_collectionLoaded: function (value) {
        this.__collectionLoaded = ss.bindAdd(this.__collectionLoaded, value);
    },

    remove_collectionLoaded: function (value) {
        this.__collectionLoaded = ss.bindSub(this.__collectionLoaded, value);
    },

    _fireCollectionLoaded: function (url) {
        if (this.__collectionLoaded != null) {
            this.__collectionLoaded(this, new CollectionLoadedEventArgs(url));
        }
    },

    add_colorPickerDisplay: function (value) {
        this.__colorPickerDisplay = ss.bindAdd(this.__colorPickerDisplay, value);
    },

    remove_colorPickerDisplay: function (value) {
        this.__colorPickerDisplay = ss.bindSub(this.__colorPickerDisplay, value);
    },

    add_voTableDisplay: function (value) {
        this.__voTableDisplay = ss.bindAdd(this.__voTableDisplay, value);
    },

    remove_voTableDisplay: function (value) {
        this.__voTableDisplay = ss.bindSub(this.__voTableDisplay, value);
    },

    add_refreshLayerManager: function (value) {
        this.__refreshLayerManager = ss.bindAdd(this.__refreshLayerManager, value);
    },

    remove_refreshLayerManager: function (value) {
        this.__refreshLayerManager = ss.bindSub(this.__refreshLayerManager, value);
    },

    add_arrived: function (value) {
        this.__arrived = ss.bindAdd(this.__arrived, value);
    },

    remove_arrived: function (value) {
        this.__arrived = ss.bindSub(this.__arrived, value);
    },

    add_clicked: function (value) {
        this.__clicked = ss.bindAdd(this.__clicked, value);
    },

    remove_clicked: function (value) {
        this.__clicked = ss.bindSub(this.__clicked, value);
    },

    add_annotationClicked: function (value) {
        this.__annotationClicked = ss.bindAdd(this.__annotationClicked, value);
    },

    remove_annotationClicked: function (value) {
        this.__annotationClicked = ss.bindSub(this.__annotationClicked, value);
    },

    add_imageryLoaded: function (value) {
        this.__imageryLoaded = ss.bindAdd(this.__imageryLoaded, value);
    },

    remove_imageryLoaded: function (value) {
        this.__imageryLoaded = ss.bindSub(this.__imageryLoaded, value);
    },

    add_tourReady: function (value) {
        this.__tourReady = ss.bindAdd(this.__tourReady, value);
    },

    remove_tourReady: function (value) {
        this.__tourReady = ss.bindSub(this.__tourReady, value);
    },

    add_tourError: function (value) {
        this.__tourError = ss.bindAdd(this.__tourError, value);
    },

    remove_tourError: function (value) {
        this.__tourError = ss.bindSub(this.__tourError, value);
    },

    add_tourPaused: function (value) {
        this.__tourPaused = ss.bindAdd(this.__tourPaused, value);
    },

    remove_tourPaused: function (value) {
        this.__tourPaused = ss.bindSub(this.__tourPaused, value);
    },

    add_tourResumed: function (value) {
        this.__tourResumed = ss.bindAdd(this.__tourResumed, value);
    },

    remove_tourResumed: function (value) {
        this.__tourResumed = ss.bindSub(this.__tourResumed, value);
    },

    add_tourEnded: function (value) {
        this.__tourEnded = ss.bindAdd(this.__tourEnded, value);
    },

    remove_tourEnded: function (value) {
        this.__tourEnded = ss.bindSub(this.__tourEnded, value);
    },

    add_slideChanged: function (value) {
        this.__slideChanged = ss.bindAdd(this.__slideChanged, value);
    },

    remove_slideChanged: function (value) {
        this.__slideChanged = ss.bindSub(this.__slideChanged, value);
    },

    //UI will set this to a function that takes 2 string properties (prop,val)
    //("title", "left", or "right" for the labels, "pos" for the slider pos)
    //Pass a 0-1 float to set the slider position (stringify it if you need to for strong typing)

    add_timeScrubberHook: function (value) {
        this.__timeScrubberHook = ss.bindAdd(this.__timeScrubberHook, value);
    },

    remove_timeScrubberHook: function (value) {
        this.__timeScrubberHook = ss.bindSub(this.__timeScrubberHook, value);
    },

    setTimeScrubberPosition: function (posLeft) {
        LayerManager.setTimeSliderValue(posLeft);
    },

    setTimeSlider: function (name, value) {
        this.__timeScrubberHook(name, value);
    },

    showColorPicker: function (pickerInstance, e) {
        if (this.__colorPickerDisplay != null) {
            this.__colorPickerDisplay(pickerInstance, e);
        }
    },

    displayVoTableLayer: function (layer) {
        if (this.__voTableDisplay != null) {
            this.__voTableDisplay(layer, new ss.EventArgs());
        }
    },

    refreshLayerManagerNow: function () {
        if (this.__refreshLayerManager != null) {
            this.__refreshLayerManager(null, new ss.EventArgs());
        }
    },

    _fireTourReady: function () {
        if (this.__tourReady != null) {
            this.__tourReady(this, new ss.EventArgs());
        }
    },

    _fireTourError: function (ex) {
        if (this.__tourError != null) {
            this.__tourError(ex, new ss.EventArgs());
        }
    },

    _fireTourPaused: function () {
        if (this.__tourPaused != null) {
            this.__tourPaused(this, new ss.EventArgs());
        }
    },

    _fireTourResume: function () {
        if (this.__tourResumed != null) {
            this.__tourResumed(this, new ss.EventArgs());
        }
    },

    _fireTourEnded: function () {
        if (this.__tourEnded != null) {
            this.__tourEnded(this, new ss.EventArgs());
        }
    },

    _fireImageryLoaded: function () {
        if (this.__imageryLoaded != null) {
            this.__imageryLoaded(this, new ss.EventArgs());
        }
    },

    _fireClick: function (ra, dec) {
        if (this.__clicked != null) {
            this.__clicked(this, new ArrivedEventArgs(ra, dec, globalRenderContext.viewCamera.zoom));
        }
    },

    _fireArrived: function (ra, dec, zoom) {
        if (this.__arrived != null) {
            this.__arrived(this, new ArrivedEventArgs(ra, dec, zoom));
        }
    },

    _fireAnnotationclicked: function (RA, Dec, id) {
        try {
            if (this.__annotationClicked != null) {
                this.__annotationClicked(this, new AnnotationClickEventArgs(RA, Dec, id));
            }
        }
        catch ($e1) {
        }
    },

    _fireSlideChanged: function (caption) {
        try {
            if (this.__slideChanged != null) {
                this.__slideChanged(this, new SlideChangedEventArgs(caption));
            }
        }
        catch ($e1) {
        }
    },

    endInit: function () {
        if (this._missedReady) {
            this._fireReady();
        }
    },

    gotoRaDecZoom: function (ra, dec, zoom, instant, roll) {
        if (globalWWTControl != null) {
            globalWWTControl.gotoRADecZoom(ra / 15, dec, zoom * 6, instant, roll);
        }
    },

    setBackgroundImageByName: function (name) {
        if (globalWWTControl != null) {
            globalWWTControl.setBackgroundImageByName(name);
        }
    },

    // Call this to add a VOTable to layers
    addVoTableLayer: function (table) {
        return LayerManager.addVoTableLayer(table, 'Vo Table');
    },

    getLayers: function () {
        return LayerManager.get_layerList();
    },

    setForegroundImageByName: function (name) {
        if (globalWWTControl != null) {
            globalWWTControl.setForegroundImageByName(name);
            globalRenderContext.viewCamera.opacity = 100;
        }
    },

    setForegroundOpacity: function (opacity) {
        if (globalWWTControl != null) {
            globalRenderContext.viewCamera.opacity = opacity;
        }
    },

    addCatalogHipsByName: function (name) {
        if (globalWWTControl != null) {
            globalWWTControl.addCatalogHipsByName(name);
        }
    },

    addCatalogHipsByNameWithCallback: function (name, onLoad) {
        if (globalWWTControl != null) {
            globalWWTControl.addCatalogHipsByNameWithCallback(name, onLoad);
        }
    },

    removeCatalogHipsByName: function (name) {
        if (globalWWTControl != null) {
            globalWWTControl.removeCatalogHipsByName(name);
        }
    },

    getCatalogHipsDataInView: function (name, limit, onComplete) {
        if (globalWWTControl != null) {
            globalWWTControl.getCatalogHipsDataInView(name, limit, onComplete);
        }
    },

    setCutsForFits: function (imagesetName, min, max) {
        if (globalWWTControl != null) {
            globalWWTControl.setCutsForFits(imagesetName, min, max);
        }
    },

    setColorMapForFits: function (imagesetName, colorMapName) {
        if (globalWWTControl != null) {
            globalWWTControl.setColorMapForFits(imagesetName, colorMapName);
        }
    },

    setScaleTypeForFits: function (imagesetName, scaleType) {
        if (globalWWTControl != null) {
            globalWWTControl.setScaleTypeForFits(imagesetName, scaleType);
        }
    },

    hideUI: function (hide) { },

    loadTour: function (url) {
        if (globalWWTControl != null) {
            globalWWTControl.playTour(url);
        }
    },

    loadFits: function (url) {
        return this.loadFitsLayer(url, '', true, null);
    },

    loadFitsLayer: function (url, name, gotoTarget, loaded) {
        return this.addImageSetLayer(url, 'fits', name, gotoTarget, loaded);
    },

    addImageSetLayer: function (url, mode, name, gotoTarget, loaded) {
        if (mode != null && mode.toLowerCase() === 'fits') {
            return ScriptInterface._addFitsLayer(url, name, gotoTarget, loaded);
        } else if (mode != null && mode.toLowerCase() === 'preloaded') {
            var imageset = globalWWTControl.getImageSetByUrl(url);
            if (imageset != null) {
                return ScriptInterface._addImageSet(name, gotoTarget, loaded, imageset);
            }
        } else {
            var imageset = globalWWTControl.getImageSetByUrl(url);
            if (imageset != null) {
                return ScriptInterface._addImageSet(name, gotoTarget, loaded, imageset);
            }
            else if (ScriptInterface._containsFitsLikeExtentsion(url)) {
                return ScriptInterface._addFitsLayer(url, name, gotoTarget, loaded);
            }
        }
        return null;
    },

    setImageSetLayerOrder: function (id, order) {
        var layer = LayerManager.get_layerList()[id];
        if (ss.canCast(layer, ImageSetLayer) && order >= 0) {
            ss.remove(layerManagerGetAllMaps()[layer.get_referenceFrame()].layers, layer);

            //In case of order > Layers.length, the layer is properly put at the end of the list
            layerManagerGetAllMaps()[layer.get_referenceFrame()].layers.splice(order, 0, layer);
        }
    },

    isUsingWebGl2: function () {
        return useGlVersion2;
    },

    get_hideTourFeedback: function () {
        return this.hideTourFeedback;
    },

    set_hideTourFeedback: function (value) {
        this.hideTourFeedback = value;
        return value;
    },

    playTour: function () {
        if (globalWWTControl != null) {
            globalWWTControl.playCurrentTour();
        }
    },

    stopTour: function () {
        if (globalWWTControl != null) {
            globalWWTControl.stopCurrentTour();
        }
    },

    loadImageCollection: function (url, loadChildFolders) {
        var $this = this;

        this._imageUrl = url;
        loadWtmlFile(url, function () {
            $this._fireCollectionLoaded(url);
        }, loadChildFolders);
    },

    _imageFileLoaded: function () {
        this._fireCollectionLoaded(this._imageUrl);
    },

    zoom: function (factor) {
        if (globalWWTControl != null) {
            globalWWTControl.zoom(factor);
        }
        return;
    },

    getRA: function () {
        if (globalWWTControl != null) {
            return globalRenderContext.get_RA();
        }
        return 0;
    },

    getDec: function () {
        if (globalWWTControl != null) {
            return globalRenderContext.get_dec();
        }
        return 0;
    },

    createFolder: function () {
        var folder = new Folder();
        return folder;
    },

    createPolygon: function (fill) {
        var p = new Poly();
        p.set_fill(fill);
        return p;
    },

    createPolyLine: function (fill) {
        return new PolyLine();
    },

    createCircle: function (fill) {
        var c = new Circle();
        c.set_fill(fill);
        return c;
    },

    addAnnotation: function (annotation) {
        if (annotation != null && ss.canCast(annotation, Annotation)) {
            if (globalWWTControl != null) {
                globalWWTControl._addAnnotation(annotation);
            }
        }
    },

    removeAnnotation: function (annotation) {
        if (annotation != null) {
            if (globalWWTControl != null) {
                globalWWTControl._removeAnnotation(annotation);
            }
        }
    },

    clearAnnotations: function () {
        if (globalWWTControl != null) {
            globalWWTControl._clearAnnotations();
        }
    },

    get_smoothAnimation: function () {
        return this._smoothAnimation;
    },

    set_smoothAnimation: function (value) {
        this._smoothAnimation = value;
        return value;
    },

    get_showCaptions: function () {
        return this._showCaptions;
    },

    set_showCaptions: function (value) {
        this._showCaptions = value;
        return value;
    },

    loadVOTable: function (url, useCurrentView) { },

    get_fov: function () {
        if (globalWWTControl != null) {
            return globalRenderContext.viewCamera.zoom / 6;
        }
        return 60;
    }
};

registerType("ScriptInterface", [ScriptInterface, ScriptInterface$, null]);
