import { ScaleTypes } from "@wwtelescope/engine-types";
import { EngineSetting, Folder, Imageset, ImageSetLayer, ImageSetLayerSetting, InViewReturnMessage, LayerManagerObject, Place, ScriptInterface, SpaceTimeControllerObject, TourPlayer, WWTControl, SpreadSheetLayerSetting } from "@wwtelescope/engine";
export { applyAnnotationSetting, copyAnnotationSettings, extractAnnotationSettings, isAnnotationSetting, AnnotationState, } from "./annotation";
export { applyCircleAnnotationSetting, copyCircleAnnotationSettings, extractCircleAnnotationSettings, isCircleAnnotationSetting, CircleAnnotationState, } from "./circleannotation";
export { applyEngineSetting, copyEngineSettings, extractEngineSettings, isEngineSetting, EngineState, } from "./engine";
export { applyImageSetLayerSetting, copyImageSetLayerSettings, extractImageSetLayerSettings, isImageSetLayerSetting, ImageSetLayerState, } from "./imagesetlayer";
export { applyLayerSetting, copyLayerSettings, extractLayerSettings, isLayerSetting, LayerState, } from "./layer";
export { applyPolyAnnotationSetting, copyPolyAnnotationSettings, extractPolyAnnotationSettings, isPolyAnnotationSetting, PolyAnnotationState, } from "./polyannotation";
export { applyPolyLineAnnotationSetting, copyPolyLineAnnotationSettings, extractPolyLineAnnotationSettings, isPolyLineAnnotationSetting, PolyLineAnnotationState, } from "./polylineannotation";
export { applySpreadSheetLayerSetting, copySpreadSheetLayerSettings, extractSpreadSheetLayerSettings, isSpreadSheetLayerSetting, SpreadSheetLayerState, } from "./spreadsheetlayer";
export { applyVoTableLayerSetting, copyVoTableLayerSettings, extractVoTableLayerSettings, isVoTableLayerSetting, VoTableLayerState, } from "./votablelayer";
export declare const enum InitControlViewType {
    Sky = "Sky",
    Earth = "earth"
}
/** Options for the [[WWTInstance]] constructor. */
export interface InitControlSettings {
    /** The identifier of the DOM element to which to attach the control. If
     * unspecified, defaults to `"wwt"`. */
    elId?: string;
    /** Whether to immediately launch the WWT engine's internal rendering loop. If
     * unspecified, defaults to `false`. */
    startInternalRenderLoop?: boolean;
    /** This controls whether the engine is launched in "freestanding" mode, where
     * no core `worldwidetelescope.org` APIs are relied upon. The initial view
     * will consist of only black sky, and the 3D solar system mode will be
     * unavailable. This value is a base URL for locating various engine static
     * assets. The default used by WWT is
     * `https://web.wwtassets.org/engine/assets`. You can use that value here to
     * activate freestanding mode if you are comfortable depending on the
     * existence of the `wwtassets.org` domain. Otherwise, you can provide your
     * own asset baseurl here.*/
    freestandingAssetBaseurl?: string;
    /** The starting latitude (or declination) of the WWT view, in degrees. */
    startLatDeg?: number;
    /** The starting longitude (or right ascension) of the WWT view, in degrees. */
    startLngDeg?: number;
    /** The starting zoom level of the WWT view, in degrees. */
    startZoomDeg?: number;
    /** The starting mode of the WWT view. */
    startMode?: InitControlViewType;
}
/** Options for [[WWTInstance.gotoTarget]]. */
export interface GotoTargetOptions {
    /** The destination of the view. */
    place: Place;
    /** If true, the zoom, angle, and rotation of the target camera position will
     * be set to match the current camera position. Otherwise, these parameters
     * will be reset to reasonable defaults. */
    noZoom: boolean;
    /** If true, the view camera will immediately snap to the destination
     * position. Otherwise, it will gradually move. */
    instant: boolean;
    /** If true, the camera will continue tracking the view target as it moves
     * with the progression of the WWT internal clock. */
    trackObject: boolean;
}
/** Deprecated, use AddImageSetLayerOptions instead.
 *  Options for [[WWTInstance.addImageSetLayer]]. */
export interface LoadFitsLayerOptions {
    /** The URL of the FITS file. */
    url: string;
    /** A name to use for the new layer. */
    name: string;
    /** Whether to seek the view to the positon of the FITS file on the sky,
     * if/when it successfully loads. */
    gotoTarget: boolean;
}
/** Options for [[WWTInstance.addImageSetLayer]]. */
export interface AddImageSetLayerOptions {
    /** The URL of the FITS file *or* the URL of the desired image set.
     *
     * This should match an image set URL previously loaded with
     * [[WWTInstance.loadImageCollection]]. */
    url: string;
    /** Indicates what type of layer you are adding.
     *
     * If "fits", the [[url]] will be taken to point to a single FITS File that
     * should be added. If "preloaded", it will be taken to match the URL
     * associated with an imageset that has already been added to WWT's internal
     * catalogs via [[WWTInstance.loadImageCollection]]. If "autodetect", WWT will
     * guess: if the URL ends with a FITS-like extension, "fits" mode will be
     * activated; otherwise it will use "preloaded" mode. */
    mode: "autodetect" | "fits" | "preloaded";
    /** A name to use for the new layer. */
    name: string;
    /** Whether to seek the view to the positon of the FITS file on the sky,
     * if/when it successfully loads. */
    goto: boolean;
}
/** Options for [[WWTInstance.setImageSetLayerOrder]]. */
export interface SetLayerOrderOptions {
    /** The ID of the layer. */
    id: string;
    /** The prefered position of the layer in the draw cycle.
     * 0 being the first layer to be drawn. */
    order: number;
}
/** Options for [[WWTInstance.stretchFitsLayer]]. */
export interface StretchFitsLayerOptions {
    /** The ID of the FITS layer. */
    id: string;
    /** The kind of stretch type to use. */
    stretch: ScaleTypes;
    /** The data value to use for the minimum stretch bound. */
    vmin: number;
    /** The data value to use for the maximum stretch bound. */
    vmax: number;
}
/** Options for [[WWTInstance.setFitsLayerColormap]]. */
export interface SetFitsLayerColormapOptions {
    /** The ID of the FITS layer. */
    id: string;
    /** The name of the colormap.
     *
     * The available options are extracted from Matplotlib and defined
     * [here](../../engine/modules/colormapcontainer.html#fromnamedcolormap).
     */
    name: string;
}
export interface ApplyFitsLayerSettingsOptions {
    /** The ID of the FITS layer. */
    id: string;
    /** The settings to apply. */
    settings: ImageSetLayerSetting[];
}
export interface UpdateTableLayerOptions {
    /** The ID of the table ("spreadsheet") layer. */
    id: string;
    /** The new data, as CSV text. */
    dataCsv: string;
}
export interface ApplyTableLayerSettingsOptions {
    /** The ID of the table ("spreadsheet") layer. */
    id: string;
    /** The settings to apply. */
    settings: SpreadSheetLayerSetting[];
}
export interface AddCatalogHipsByNameOptions {
    /** The name of the HiPS catalog imageset to load. */
    name: string;
}
export interface GetCatalogHipsDataInViewOptions {
    /** The HiPS catalog to query, expressed as an imageset. */
    imageset: Imageset;
    /** Whether to limit the amount of data returned.
     *
     * It is *strongly* recommended to apply a limit, since the total size of HiPS
     * catalogs can reach terabytes of data.
     */
    limit: boolean;
}
/** Options for [[setupForImageset]]. */
export interface SetupForImagesetOptions {
    /** The imageset to foreground. */
    foreground: Imageset;
    /** The background imageset to use. If unspecified, a sensible default is
     * chosen. */
    background?: Imageset;
}
/** Options for [CaptureFrame] */
export interface CaptureFrameOptions {
    /** The desired image width, in pixels. */
    width: number;
    /** The desired image height, in pixels. */
    height: number;
    /** The MIME type for the desired image format (e.g. `"image/jpeg"`). */
    format: string;
}
export interface CaptureVideoOptions {
    /** The desired image width, in pixels. */
    width: number;
    /** The desired image height, in pixels. */
    height: number;
    /** The number of frames per second */
    framesPerSecond: number;
    /** The total number of frames to capture */
    totalFrames: number;
    /** The MIME type for the desired image format of output frames (e.g. `"image/jpeg"`). */
    format: string;
}
export declare class WWTInstance {
    readonly ctl: WWTControl;
    readonly lm: LayerManagerObject;
    readonly si: ScriptInterface;
    readonly stc: SpaceTimeControllerObject;
    /** Create a WWT control, attaching it to a DOM element.
     *
     * @param options Options to apply to the control.
     *
     * Compared to the underlying library, this class provides a more JavaScript-y
     * API.
     */
    constructor(options?: InitControlSettings);
    private readyPromises;
    private readyFired;
    waitForReady(): Promise<void>;
    private arrivePromises;
    private arriveSeqnum;
    private makeArrivePromise;
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
    gotoRADecZoom(raRad: number, decRad: number, zoomDeg: number, instant: boolean, rollRad?: number): Promise<void>;
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
    timeToRADecZoom(raRad: number, decRad: number, zoomDeg: number, rollRad?: number): number;
    /** Command the view to show a Place.
     *
     * @param options The options for the goto command.
     */
    gotoTarget(options: GotoTargetOptions): Promise<void>;
    /** Add an imageset directly into the engine's database.
     *
     * If an imageset with the same URL has already been loaded, this is a no-op.
     *
     * @param imgset The imageset to add
     * @returns Either the input argument, if it was added to the engine's
     *   database, or the pre-existing imageset. The pre-existing imageset will
     *   have the same URL but might differ in other respects, such as its name.
     */
    addImagesetToRepository(imgset: Imageset): Imageset;
    private collectionLoadedPromises;
    private collectionRequests;
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
    loadImageCollection(url: string, loadChildFolders?: boolean): Promise<Folder>;
    /** Load an image set or a remote FITS file into a data layer and display it.
     *
     * The FITS file must be downloaded and processed, so this API is
     * asynchronous, and is not appropriate for files that might be large.
     *
     * The image set must have previously been created with [[loadImageCollection]]
     */
    addImageSetLayer(options: AddImageSetLayerOptions): Promise<ImageSetLayer>;
    /** Change the ImageSetLayer position in the layer stack. */
    setImageSetLayerOrder(options: SetLayerOrderOptions): void;
    /** Change the "stretch" settings of a FITS image layer. */
    stretchFitsLayer(options: StretchFitsLayerOptions): void;
    /** Change the colormap settings of a FITS image layer. */
    setFitsLayerColormap(options: SetFitsLayerColormapOptions): void;
    /** Apply settings to a FITS image layer. */
    applyFitsLayerSettings(options: ApplyFitsLayerSettingsOptions): void;
    /** Update the data within a tabular data layer. */
    updateTableLayer(options: UpdateTableLayerOptions): void;
    /** Apply settings to a tabular data layer. */
    applyTableLayerSettings(options: ApplyTableLayerSettingsOptions): void;
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
    addCatalogHipsByName(options: AddCatalogHipsByNameOptions): Promise<Imageset>;
    /** Fetch the subset of catalog HiPS data contained within the current view.
     *
     * The imageset should have been loaded with the [[addCatalogHipsByName]]
     * call. The *limit* option should almost always be true, since if it is false
     * the data-fetch operation can potentially attempt to download and return
     * gigabytes of data.
     * */
    getCatalogHipsDataInView(options: GetCatalogHipsDataInViewOptions): Promise<InViewReturnMessage>;
    applySetting(setting: EngineSetting): void;
    setBackgroundImageByName(imagesetName: string): void;
    setForegroundImageByName(imagesetName: string): void;
    /** Set the opacity with which the foreground imageset is rendered.
     *
     * @param opacity The opacity, between 0 (invisible) and 100 (fully opaque).
     */
    setForegroundOpacity(opacity: number): void;
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
    setupForImageset(options: SetupForImagesetOptions): void;
    /** If the tour playback mode is active, get the active TourPlayer object. */
    getActiveTourPlayer(): TourPlayer | null;
    /** Find out whether a tour is playing.
     *
     * For obscure reasons, this is a static method in WWT that is not attached to
     * a TourPlayer instance. We take one as an argument for future-proofiness.
     */
    getIsTourPlaying(_player: TourPlayer): boolean;
    private tourReadyPromises;
    private tourReadySeqnum;
    /** A callback to be invoked when a tour completes playing. */
    tourEndedCallback: ((tp: TourPlayer) => void) | null;
    /** Load a tour from a URL.
     *
     * Once the tour has loaded, you can use [[getActiveTourPlayer]] to get the
     * tour player controller and the underlying tour document.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded.
     */
    loadTour(url: string): Promise<void>;
    /** Load a tour from a URL and start playing it.
     *
     * @param url The URL of the tour to load and play.
     * @returns A promise that resolves when the tour has loaded and started
     * playing.
     */
    loadAndPlayTour(url: string): Promise<void>;
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
    getEffectiveTourTimecode(): number;
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
    seekToTourTimecode(value: number): void;
    /** Capture the current frame as an image.
     *
     * This function returns a Promise whose resolved value is the image
     * represented as a `Blob`.
    */
    captureFrame(options: CaptureFrameOptions): Promise<Blob | null>;
    /** Capture a video as a sequence of frames using the given parameters
     *
     * This function returns a readable stream whose values are the exported frames.
    */
    captureVideo(options: CaptureVideoOptions): ReadableStream<Blob | null>;
}
