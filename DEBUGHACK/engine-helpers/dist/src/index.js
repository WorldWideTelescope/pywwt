// Copyright 2020-2023 the .NET Foundation
// Licensed under the MIT License
import { __awaiter, __generator, __values } from "tslib";
import { D2H, R2D, R2H } from "@wwtelescope/astro";
import { ImageSetType, } from "@wwtelescope/engine-types";
import { ImageSetLayer, LayerManager, Place, TourPlayer, Wtml, WWTControl, WWTControlBuilder, SpaceTimeController, SpreadSheetLayer, } from "@wwtelescope/engine";
import { applyImageSetLayerSetting, } from "./imagesetlayer";
import { applySpreadSheetLayerSetting, } from "./spreadsheetlayer";
// Settings-related re-exports
export { applyAnnotationSetting, copyAnnotationSettings, extractAnnotationSettings, isAnnotationSetting, AnnotationState, } from "./annotation";
export { applyCircleAnnotationSetting, copyCircleAnnotationSettings, extractCircleAnnotationSettings, isCircleAnnotationSetting, CircleAnnotationState, } from "./circleannotation";
export { applyEngineSetting, copyEngineSettings, extractEngineSettings, isEngineSetting, EngineState, } from "./engine";
export { applyImageSetLayerSetting, copyImageSetLayerSettings, extractImageSetLayerSettings, isImageSetLayerSetting, ImageSetLayerState, } from "./imagesetlayer";
export { applyLayerSetting, copyLayerSettings, extractLayerSettings, isLayerSetting, LayerState, } from "./layer";
export { applyPolyAnnotationSetting, copyPolyAnnotationSettings, extractPolyAnnotationSettings, isPolyAnnotationSetting, PolyAnnotationState, } from "./polyannotation";
export { applyPolyLineAnnotationSetting, copyPolyLineAnnotationSettings, extractPolyLineAnnotationSettings, isPolyLineAnnotationSetting, PolyLineAnnotationState, } from "./polylineannotation";
export { applySpreadSheetLayerSetting, copySpreadSheetLayerSettings, extractSpreadSheetLayerSettings, isSpreadSheetLayerSetting, SpreadSheetLayerState, } from "./spreadsheetlayer";
export { applyVoTableLayerSetting, copyVoTableLayerSettings, extractVoTableLayerSettings, isVoTableLayerSetting, VoTableLayerState, } from "./votablelayer";
var SavedPromise = /** @class */ (function () {
    function SavedPromise(payload, resolve, reject) {
        this.payload = payload;
        this.resolve = resolve;
        this.reject = reject;
    }
    return SavedPromise;
}());
var WWTInstance = /** @class */ (function () {
    /** Create a WWT control, attaching it to a DOM element.
     *
     * @param options Options to apply to the control.
     *
     * Compared to the underlying library, this class provides a more JavaScript-y
     * API.
     */
    function WWTInstance(options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        // Ready promises
        this.readyPromises = [];
        this.readyFired = false;
        // Arrival promises
        this.arrivePromises = [];
        this.arriveSeqnum = 0;
        // Collection-loaded promises. To simplify the handling, we never load the
        // same URL more than once. Otherwise, all of the timing issues about multiple
        // requests for the same URL get gnarly to handle. And as far as the engine is
        // concerned, collection loads are idempotent.
        this.collectionLoadedPromises = [];
        this.collectionRequests = new Map();
        this.tourReadyPromises = [];
        this.tourReadySeqnum = 0;
        /** A callback to be invoked when a tour completes playing. */
        this.tourEndedCallback = null;
        var builder = new WWTControlBuilder(options.elId || "wwt");
        if (options.startInternalRenderLoop !== undefined) {
            builder.startRenderLoop(options.startInternalRenderLoop);
        }
        if (options.freestandingAssetBaseurl !== undefined) {
            builder.freestandingMode(options.freestandingAssetBaseurl);
        }
        if (options.startLatDeg !== undefined && options.startLngDeg !== undefined) {
            var zoom = options.startZoomDeg || 360;
            builder.initialView(options.startLatDeg, options.startLngDeg, zoom);
        }
        if (options.startMode !== undefined) {
            builder.initialMode(options.startMode);
        }
        // We pretend that these objects aren't all singletons. One day.
        this.si = builder.create();
        this.ctl = WWTControl.singleton;
        this.lm = LayerManager;
        this.stc = SpaceTimeController;
        // Override some defaults
        this.applySetting(["showConstellationBoundries", false]);
        this.applySetting(["showConstellationFigures", false]);
        this.applySetting(["showConstellationSelection", false]);
        this.applySetting(["showCrosshairs", false]);
        // Ready promise initialization:
        this.si.add_ready(function (_si) {
            var e_1, _a;
            try {
                for (var _b = __values(_this.readyPromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    p.resolve();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this.readyFired = true;
            _this.readyPromises = [];
        });
        // Arrival promise initialization:
        this.si.add_arrived(function (_si, _args) {
            var e_2, _a;
            try {
                for (var _b = __values(_this.arrivePromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    if (p.payload < _this.arriveSeqnum) {
                        p.reject("superseded");
                    }
                    else {
                        p.resolve();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            _this.arrivePromises = [];
        });
        // TourReady promise init:
        this.si.add_tourReady(function (_si) {
            var e_3, _a;
            try {
                for (var _b = __values(_this.tourReadyPromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var p = _c.value;
                    if (p.payload < _this.tourReadySeqnum) {
                        p.reject("superseded");
                    }
                    else {
                        p.resolve();
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            _this.tourReadyPromises = [];
        });
        // TourEnded event init:
        TourPlayer.add_tourEnded(function (_tpclass) {
            var tp = _this.getActiveTourPlayer();
            if (tp !== null && _this.tourEndedCallback !== null) {
                _this.tourEndedCallback(tp);
            }
        });
    }
    WWTInstance.prototype.waitForReady = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.readyFired) {
                            resolve();
                        }
                        else {
                            _this.readyPromises.push(new SavedPromise(null, resolve, reject));
                        }
                    })];
            });
        });
    };
    WWTInstance.prototype.makeArrivePromise = function (instantResolve) {
        var e_4, _a;
        var _this = this;
        this.arriveSeqnum += 1;
        var seq = this.arriveSeqnum;
        try {
            for (var _b = __values(this.arrivePromises), _c = _b.next(); !_c.done; _c = _b.next()) {
                var p = _c.value;
                p.reject("superseded");
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.arrivePromises = [];
        return new Promise(function (resolve, reject) {
            if (_this.arriveSeqnum > seq) {
                reject("superseded");
            }
            else if (instantResolve) {
                resolve();
            }
            else {
                _this.arrivePromises.push(new SavedPromise(seq, resolve, reject));
            }
        });
    };
    /** Navigate the camera to the specified position, asynchronously.
     *
     * This wraps the underlying engine function of the same name, but homogenizing some
     * of the angular arguments to use radians.
     *
     * @param raRad The RA to seek to, in radians
     * @param decRad The declination to seek to, in radians
     * @param zoomDeg The zoom setting, in *degrees*
     * @param instant Whether to snap the camera instantly, or pan it
     * @param rollRad If specified, the roll of the target camera position, in radians
     * @returns A void promise that resolves when the camera arrives at the target position.
     */
    WWTInstance.prototype.gotoRADecZoom = function (raRad, decRad, zoomDeg, instant, rollRad) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ctl.gotoRADecZoom(raRad * R2H, decRad * R2D, zoomDeg, instant, rollRad);
                return [2 /*return*/, this.makeArrivePromise(instant)];
            });
        });
    };
    /** Returns how long moving to a given position will take, in seconds.
     *
     * This wraps the underlying engine function of the same name, but homogenizing some
     * of the angular arguments to use radians.
     *
     * @param raRad The RA of the target position, in radians
     * @param decRad The declination of the target position, in radians
     * @param zoomDeg The zoom setting, in *degrees*
     * @param rollRad If specified, the roll of the target camera position, in radians
     * @returns The amount of time, in seconds, that moving to the given position would take.
     */
    WWTInstance.prototype.timeToRADecZoom = function (raRad, decRad, zoomDeg, rollRad) {
        var time = this.ctl.timeToRADecZoom(raRad * R2H, decRad * R2D, zoomDeg, rollRad);
        return time;
    };
    /** Command the view to show a Place.
     *
     * @param options The options for the goto command.
     */
    WWTInstance.prototype.gotoTarget = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ctl.gotoTarget(options.place, options.noZoom, options.instant, options.trackObject);
                return [2 /*return*/, this.makeArrivePromise(options.instant)];
            });
        });
    };
    /** Add an imageset directly into the engine's database.
     *
     * If an imageset with the same URL has already been loaded, this is a no-op.
     *
     * @param imgset The imageset to add
     * @returns Either the input argument, if it was added to the engine's
     *   database, or the pre-existing imageset. The pre-existing imageset will
     *   have the same URL but might differ in other respects, such as its name.
     */
    WWTInstance.prototype.addImagesetToRepository = function (imgset) {
        return WWTControl.addImageSetToRepository(imgset);
    };
    /** Load a WTML collection and the imagesets that it contains.
    *
    * This function triggers a download of the specified URL, which should return
    * an XML document in the [WTML collection][wtml] format. Any `ImageSet`
    * entries in the collection, or `Place` entries containing image sets, will
    * be added to the WWT instance’s list of available imagery. Subsequent calls
    * to functions like [[setForegroundImageByName]] will be able to locate the
    * new imagesets and display them to the user.
    *
    * Each unique URL is only requested once. Once a given URL has been
    * successfully loaded, the promise returned by additional calls will resolve
    * immediately. URL uniqueness is tested with simple string equality, so if
    * you really want to load the same URL more than once you could add a
    * fragment specifier.
    *
    * If the URL is not accessible due to CORS restrictions, the request will
    * automatically be routed through the WWT’s CORS proxying service.
    *
    * [wtml]: https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/
    *
    * @param url: The URL of the WTML collection file to load.
    * @param loadChildFolders When true, this method will recursively
    * download and unpack the content of all Folders contained in the WTML file.
    * @returns: A promise that resolves to an initialized Folder object.
    */
    WWTInstance.prototype.loadImageCollection = function (url, loadChildFolders) {
        return __awaiter(this, void 0, void 0, function () {
            var curState, holder_1;
            var _this = this;
            return __generator(this, function (_a) {
                curState = this.collectionRequests.get(url);
                // If we've already loaded the folder, insta-resolve to it.
                if (curState !== undefined && curState !== null) {
                    return [2 /*return*/, Promise.resolve(curState)];
                }
                // If we haven't even issued the request, do so.
                if (curState === undefined) {
                    // Mark this URL as having an in-flight request.
                    this.collectionRequests.set(url, null);
                    holder_1 = { f: null };
                    if (loadChildFolders === undefined) {
                        loadChildFolders = false;
                    }
                    holder_1.f = Wtml.getWtmlFile(url, function () {
                        // The folder at this URL is now fully loaded.
                        var f = holder_1.f;
                        _this.collectionRequests.set(url, f);
                        _this.collectionLoadedPromises = _this.collectionLoadedPromises.filter(function (p) {
                            if (p.payload == url) {
                                p.resolve(f);
                                return false;
                            }
                            // Don't filter out promises for other URLs.
                            return true;
                        });
                    }, loadChildFolders);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var curState = _this.collectionRequests.get(url);
                        // By the time this promise callback is called, maybe the Folder has fully
                        // loaded?
                        if (curState !== undefined && curState !== null) {
                            resolve(curState);
                        }
                        else {
                            // If not, queue ourselves up to be resolved when the data finally come
                            // through.
                            _this.collectionLoadedPromises.push(new SavedPromise(url, resolve, reject));
                        }
                    })];
            });
        });
    };
    // Layers
    /** Load an image set or a remote FITS file into a data layer and display it.
     *
     * The FITS file must be downloaded and processed, so this API is
     * asynchronous, and is not appropriate for files that might be large.
     *
     * The image set must have previously been created with [[loadImageCollection]]
     */
    WWTInstance.prototype.addImageSetLayer = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.si.addImageSetLayer(options.url, options.mode, options.name, options.goto, function (layer) {
                            resolve(layer);
                        });
                    })];
            });
        });
    };
    /** Change the ImageSetLayer position in the layer stack. */
    WWTInstance.prototype.setImageSetLayerOrder = function (options) {
        this.si.setImageSetLayerOrder(options.id, options.order);
    };
    /** Change the "stretch" settings of a FITS image layer. */
    WWTInstance.prototype.stretchFitsLayer = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof ImageSetLayer) {
            layer.setImageScalePhysical(options.stretch, options.vmin, options.vmax);
            // This is kind of random, but follows the pywwt API implementation.
            var fits = layer.getFitsImage();
            if (fits !== null) {
                layer.get_imageSet().get_fitsProperties().transparentBlack = false;
            }
        }
    };
    /** Change the colormap settings of a FITS image layer. */
    WWTInstance.prototype.setFitsLayerColormap = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof ImageSetLayer) {
            layer.set_colorMapperName(options.name);
        }
    };
    /** Apply settings to a FITS image layer. */
    WWTInstance.prototype.applyFitsLayerSettings = function (options) {
        var e_5, _a;
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof ImageSetLayer) {
            try {
                for (var _b = __values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var setting = _c.value;
                    applyImageSetLayerSetting(layer, setting);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    };
    /** Update the data within a tabular data layer. */
    WWTInstance.prototype.updateTableLayer = function (options) {
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof SpreadSheetLayer) {
            layer.updateData(options.dataCsv, true, true, true);
        }
    };
    /** Apply settings to a tabular data layer. */
    WWTInstance.prototype.applyTableLayerSettings = function (options) {
        var e_6, _a;
        var layer = this.lm.get_layerList()[options.id];
        if (layer && layer instanceof SpreadSheetLayer) {
            try {
                for (var _b = __values(options.settings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var setting = _c.value;
                    applySpreadSheetLayerSetting(layer, setting);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
    };
    /** Add a new HiPS catalog to the view, by name.
     *
     * The promise will resolve when the catalog metadata have fully downloaded.
     * It will reject if the name is unrecognized.
     *
     * HiPS catalogs are something of an awkward hybrid. They are managed like
     * imagesets, but rendered like spreadsheet layers. To get the
     * `SpreadSheetLayer` associated with a HiPS catalog imageset, access:
     *
     * ```
     * imgset.get_hipsProperties().get_catalogSpreadSheetLayer()
     * ```
     *
     * You can use methods like [[applyTableLayerSettings]] to modify the settings
     * of this layer by extracting its ID string with `layer.id.toString()`.
     *
     * The contents of this catalog will update dynamically as the user navigates
     * the WWT view.
     */
    WWTInstance.prototype.addCatalogHipsByName = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var imgset = _this.ctl.getImagesetByName(options.name);
                        if (imgset === null) {
                            reject();
                        }
                        else {
                            _this.ctl.renderContext.addCatalogHips(imgset, function () {
                                resolve(imgset);
                            });
                        }
                    })];
            });
        });
    };
    /** Fetch the subset of catalog HiPS data contained within the current view.
     *
     * The imageset should have been loaded with the [[addCatalogHipsByName]]
     * call. The *limit* option should almost always be true, since if it is false
     * the data-fetch operation can potentially attempt to download and return
     * gigabytes of data.
     * */
    WWTInstance.prototype.getCatalogHipsDataInView = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        _this.ctl.renderContext.getCatalogHipsDataInView(options.imageset, options.limit, function (msg) {
                            resolve(msg);
                        });
                    })];
            });
        });
    };
    // "Mutator" type operations -- not async.
    WWTInstance.prototype.applySetting = function (setting) {
        var funcName = "set_" + setting[0];
        var value = setting[1]; // eslint-disable-line @typescript-eslint/no-explicit-any
        this.si.settings[funcName](value); // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    WWTInstance.prototype.setBackgroundImageByName = function (imagesetName) {
        this.ctl.setBackgroundImageByName(imagesetName);
    };
    WWTInstance.prototype.setForegroundImageByName = function (imagesetName) {
        this.ctl.setForegroundImageByName(imagesetName);
    };
    /** Set the opacity with which the foreground imageset is rendered.
     *
     * @param opacity The opacity, between 0 (invisible) and 100 (fully opaque).
     */
    WWTInstance.prototype.setForegroundOpacity = function (opacity) {
        this.si.setForegroundOpacity(opacity);
    };
    /** Set up the view to instantaneously display the specified imageset.
     *
     * This function aspires to provide a one-stop shop for configuring the engine
     * to show one arbitrary imageset. It aims to automatically choose the right,
     * or at least justifiable, values for things like the background imageset,
     * the camera position, and the zoom level.
     *
     * Because this function makes instantaneous changes, it is not appropriate
     * for interactive use. It is intended to be used as a WWT view is being
     * initialized.
     *
     * @param imageset The imageset to display.
     */
    WWTInstance.prototype.setupForImageset = function (options) {
        var bkg;
        if (options.background) {
            bkg = options.background;
        }
        else {
            bkg = this.ctl.getDefaultImageset(options.foreground.get_dataSetType(), options.foreground.get_bandPass());
        }
        var imageHeightDeg;
        if (options.foreground.get_levels() > 0) {
            // For tiled images, baseTileDegrees gives the image angular height
            // directly, modulo a factor of two uncertainty depending on how the image
            // pixel height rounds up to a power of two.
            imageHeightDeg = options.foreground.get_baseTileDegrees();
        }
        else {
            // Unfortunately, for untiled images we don't have the information needed
            // to assess the image's angular height reliably. In many cases offsetY
            // will be about half of the pixel height, but it could be anything.
            imageHeightDeg = options.foreground.get_baseTileDegrees() * options.foreground.get_offsetY() * 2;
        }
        var place = new Place();
        place.set_type(options.foreground.get_dataSetType());
        place.set_backgroundImageset(bkg);
        place.set_studyImageset(options.foreground);
        var noZoom = false;
        switch (options.foreground.get_dataSetType()) {
            case ImageSetType.sky:
                if (imageHeightDeg == 180) {
                    // All-sky image -- special behavior
                    noZoom = true;
                }
                else {
                    place.set_RA(options.foreground.get_centerX() * D2H);
                    place.set_dec(options.foreground.get_centerY());
                    place.set_zoomLevel(imageHeightDeg * 6);
                }
                break;
            case ImageSetType.earth:
            case ImageSetType.planet:
                place.set_zoomLevel(120); // a pleasing default, according to me
                if (imageHeightDeg != 180) {
                    // need to verify that this is right
                    place.set_lng(options.foreground.get_centerX());
                    place.set_lat(options.foreground.get_centerY());
                }
                break;
            default:
                // TODO: more cases ...
                place.set_zoomLevel(360);
                break;
        }
        this.ctl.renderContext.set_backgroundImageset(bkg);
        this.ctl.gotoTarget(place, noZoom, true, // instant
        true // trackObject
        );
    };
    // Tours
    /** If the tour playback mode is active, get the active TourPlayer object. */
    WWTInstance.prototype.getActiveTourPlayer = function () {
        if (this.ctl.uiController === null)
            return null;
        if (this.ctl.uiController instanceof TourPlayer)
            return this.ctl.uiController;
        return null;
    };
    /** Find out whether a tour is playing.
     *
     * For obscure reasons, this is a static method in WWT that is not attached to
     * a TourPlayer instance. We take one as an argument for future-proofiness.
     */
    WWTInstance.prototype.getIsTourPlaying = function (_player) {
        return TourPlayer.get_playing();
    };
    /** Load a tour from a URL.
     *
     * Once the tour has loaded, you can use [[getActiveTourPlayer]] to get the
     * tour player controller and the underlying tour document.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded.
     */
    WWTInstance.prototype.loadTour = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, _a, _b, p;
            var e_7, _c;
            var _this = this;
            return __generator(this, function (_d) {
                this.ctl.loadTour(url);
                this.tourReadySeqnum += 1;
                seq = this.tourReadySeqnum;
                try {
                    for (_a = __values(this.tourReadyPromises), _b = _a.next(); !_b.done; _b = _a.next()) {
                        p = _b.value;
                        p.reject("superseded");
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                this.tourReadyPromises = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.tourReadySeqnum > seq) {
                            reject("superseded");
                        }
                        else {
                            _this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
                        }
                    })];
            });
        });
    };
    /** Load a tour from a URL and start playing it.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded and started
     * playing.
     */
    WWTInstance.prototype.loadAndPlayTour = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, _a, _b, p;
            var e_8, _c;
            var _this = this;
            return __generator(this, function (_d) {
                this.ctl.playTour(url);
                this.tourReadySeqnum += 1;
                seq = this.tourReadySeqnum;
                try {
                    for (_a = __values(this.tourReadyPromises), _b = _a.next(); !_b.done; _b = _a.next()) {
                        p = _b.value;
                        p.reject("superseded");
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                this.tourReadyPromises = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.tourReadySeqnum > seq) {
                            reject("superseded");
                        }
                        else {
                            _this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
                        }
                    })];
            });
        });
    };
    /** Find out how far we have progressed into the tour, in seconds.
     *
     * This number does not necessarily progress monotonically due to the way that
     * WWT measures tour playback progress. We associate a start time with each
     * "stop" in the tour, and can measure progress through a stop, but stops do
     * not necessarily transition from one to another in linear fashion.
     *
     * That being said, this number should range between 0 and the runtime of the
     * current tour. If no tour is loaded, it will be zero.
     */
    WWTInstance.prototype.getEffectiveTourTimecode = function () {
        var player = this.getActiveTourPlayer();
        if (player === null)
            return 0.0;
        var tour = player.get_tour();
        if (tour === null)
            return 0.0;
        var idx = tour.get_currentTourstopIndex();
        if (idx < 0)
            return 0.0;
        var base = tour.elapsedTimeTillTourstop(idx);
        var stop = tour.get_tourStops()[idx];
        var delta = stop.get_tweenPosition() * stop.get_duration() * 0.001; // ms => s
        var value = base + delta;
        // It's possible for our math to yield a value slightly larger than the
        // nominal tour runtime, which can upset code that expects the value to stay
        // rigorously within that bound. So, clamp it to be sure.
        if (value < 0)
            return 0.0;
        var runTime = tour.get_runTime() * 0.001; // ms => s
        if (value > runTime)
            return runTime;
        return value;
    };
    /** "Seek" tour playback to approximately the specified timecode (in seconds).
     *
     * The tour will start playing back.
     *
     * This operation is approximate because WWT can only resume playback from the
     * beginning of a "tour stop". So, if the desired timecode is in the middle of
     * such a stop, playback will start there, not at the exact value that was
     * commanded. This can be a little annoying when a slide is long.
     *
     * If no tour or tour player is active, nothing happens.
     */
    WWTInstance.prototype.seekToTourTimecode = function (value) {
        var player = this.getActiveTourPlayer();
        if (player === null)
            return;
        var tour = player.get_tour();
        if (tour === null)
            return;
        // Figure out the stop index that best matches the specified timecode.
        var stops = tour.get_tourStops();
        var index = stops.length - 1;
        for (var i = 0; i < stops.length; i++) {
            var tStart = tour.elapsedTimeTillTourstop(i);
            if (tStart >= value) {
                index = i - 1;
                break;
            }
        }
        if (index < 0) {
            index = 0;
        }
        // Apply the change.
        player.playFromTourstop(stops[index]);
    };
    /** Capture the current frame as an image.
     *
     * This function returns a Promise whose resolved value is the image
     * represented as a `Blob`.
    */
    WWTInstance.prototype.captureFrame = function (options) {
        var _this = this;
        return new Promise(function (resolve, _reject) {
            _this.ctl.captureFrame(function (blob) { return resolve(blob); }, options.width, options.height, options.format);
        });
    };
    /** Capture a video as a sequence of frames using the given parameters
     *
     * This function returns a readable stream whose values are the exported frames.
    */
    WWTInstance.prototype.captureVideo = function (options) {
        var wwtControl = this.ctl;
        var videoStream = new ReadableStream({
            start: function (controller) {
                function stream() {
                    var received = 0;
                    wwtControl.captureVideo(function (blob) {
                        received++;
                        controller.enqueue(blob);
                        if (received >= options.totalFrames) {
                            controller.close();
                        }
                    }, options.width, options.height, options.framesPerSecond, options.totalFrames, options.format);
                }
                return stream();
            }
        });
        return videoStream;
    };
    return WWTInstance;
}());
export { WWTInstance };
//# sourceMappingURL=index.js.map