/** A class for Vue components that wish to interact with a [[WWTComponent]]
 * through the Pinia state management system.
 *
 * Skip to [The WWT Pinia Interface](#the-wwt-pinia-interface) for a quick summary
 * of how WWT's state is exposed and controlled in Pinia.
 *
 * ## Introduction
 *
 * Vue applications are composed of multiple [components]. In a WWT-powered app,
 * one of those components will be a `<WorldWideTelescope>` component containing
 * the actual WWT rendering window. The other components of the app will wish to
 * monitor or alter the state of the WWT rendering window. The
 * [[WWTAwareComponent]] class provides a convenient framework for doing so.
 *
 * [components]: https://vuejs.org/v2/guide/components.html
 *
 * In particular, if your component [extends] this class, it
 * will automatically be set up with fields and methods allowing you to interact
 * with the WWT engine’s state. A minimal example:
 *
 * [extends]: https://vuejs.org/api/options-composition.html#extends
 *
 * ```vue
 * <template>
 *   <div id="app">
 *     <WorldWideTelescope wwt-namespace="mywwt"></WorldWideTelescope>
 *     <p class="coord-overlay">{{ coordText }}</p>
 *   </div>
 * </template>
 *
 * <script lang="ts">
 *   import { defineComponent } from "vue";
 *   import { fmtDegLat, fmtHours } from "@wwtelescope/astro";
 *   import { WWTAwareComponent } from "@wwtelescope/engine-pinia";
 *
 *   export default App = defineComponent({
 *     extends: WWTAwareComponent,
 *
 *     computed: {
 *      coordText() {
 *        return `${fmtHours(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
 *      }
 *     }
 *   });
 * </script>
 * ```
 *
 * This simple `App` component will display the coordinates of the current center
 * of the WWT view, and the coordinate readout will update automagically as the
 * user interacts with the view.
 *
 * ## Props
 *
 * Classes inheriting from [[WWTAwareComponent]] automatically define a prop
 * named [[wwtNamespace]]. This should be set to the namespace of the [Pinia
 * module] used to track the `<WorldWideTelescope>` component’s state — that is,
 * it should have the same value as that component’s own `wwtNamespace` prop.
 * The default value is `"wwt"`.
 *
 * [Pinia module]: https://pinia.vuejs.org/core-concepts/
 *
 * ## The WWT Pinia Interface
 *
 * Your [[WWTAwareComponent]] can monitor or manipulate the state of the WWT
 * renderer using the following interfaces, grouped by category. As a reminder,
 * in the Pinia paradigm, state is expressed in [state variables] and [getters],
 * and modified either directly or through [actions] (which can be asynchronous).
 *
 * [state variables]: https://pinia.vuejs.org/core-concepts/state.html
 * [getters]: https://pinia.vuejs.org/core-concepts/getters.html
 * [actions]: https://pinia.vuejs.org/core-concepts/actions.html
 *
 * ### Initialization
 *
 * Actions:
 *
 * - [[waitForReady]]
 * - [[setupForImageset]]
 *
 * ### Basic View Information
 *
 * State:
 *
 * - [[wwtCurrentTime]]
 * - [[wwtClockDiscontinuities]]
 * - [[wwtClockRate]]
 * - [[wwtDecRad]]
 * - [[wwtRARad]]
 * - [[wwtZoomDeg]]
 *
 * Getters:
 *
 * - [[findRADecForScreenPoint]]
 *
 * Actions:
 *
 * - [[gotoRADecZoom]]
 * - [[gotoTarget]]
 * - [[setClockRate]]
 * - [[setClockSync]]
 * - [[setTime]]
 * - [[setTrackedObject]]
 * - [[zoom]]
 *
 * ### Image Sets
 *
 * State:
 *
 * - [[wwtAvailableImagesets]]
 * - [[wwtBackgroundImageset]]
 * - [[wwtForegroundImageset]]
 * - [[wwtForegroundOpacity]]
 * - [[wwtRenderType]]
 *
 * Getters:
 *
 * - [[lookupImageset]]
 *
 * Actions:
 *
 * - [[loadImageCollection]]
 * - [[setBackgroundImageByName]]
 * - [[setForegroundImageByName]]
 * - [[setForegroundOpacity]]
 * - [[setupForImageset]]
 * - [[updateAvailableImagesets]]
 *
 * ### Imageset Layers (including FITS imagery)
 *
 * State:
 *
 * - [[wwtActiveLayers]]
 * - [[wwtImagesetLayers]]
 *
 * Getters:
 *
 * - [[activeImagesetLayerStates]]
 * - [[imagesetForLayer]]
 * - [[imagesetStateForLayer]]
 *
 * Actions:
 *
 * - [[addImageSetLayer]]
 * - [[loadFitsLayer]] (deprecated)
 * - [[applyFitsLayerSettings]]
 * - [[setFitsLayerColormap]]
 * - [[stretchFitsLayer]]
 * - [[setImageSetLayerOrder]]
 * - [[deleteLayer]]
 *
 * ### Tabular Data Layers
 *
 * State:
 *
 * - [[wwtActiveLayers]]
 * - [[wwtSpreadSheetLayers]]
 *
 * Actions:
 *
 * - [[createTableLayer]]
 * - [[applyTableLayerSettings]]
 * - [[updateTableLayer]]
 * - [[deleteLayer]]
 *
 * ### Annotations
 *
 * Actions:
 *
 * - [[addAnnotation]]
 * - [[clearAnnotations]]
 * - [[removeAnnotation]]
 *
 * ### Progressive HiPS Catalogs
 *
 * These have some characteristics of both imagesets and tabular ("spreadsheet") data
 * layers.
 *
 * Getters:
 *
 * - [[layerForHipsCatalog]]
 * - [[spreadsheetStateForHipsCatalog]]
 *
 * Actions:
 *
 * - [[addCatalogHipsByName]]
 * - [[applyTableLayerSettings]]
 * - [[getCatalogHipsDataInView]]
 * - [[removeCatalogHipsByName]]
 *
 * ### Tours
 *
 * State:
 *
 * - [[wwtIsTourPlayerActive]]
 * - [[wwtIsTourPlaying]]
 * - [[wwtTourCompletions]]
 * - [[wwtTourRunTime]]
 * - [[wwtTourStopStartTimes]]
 * - [[wwtTourTimecode]]
 *
 * Actions:
 *
 * - [[loadTour]]
 * - [[seekToTourTimecode]]
 * - [[setTourPlayerLeaveSettingsWhenStopped]]
 * - [[startTour]]
 * - [[toggleTourPlayPauseState]]
 *
 * ### Miscellaneous
 *
 * State:
 *
 * - [[showWebGl2Warning]]
 *
 * Actions:
 *
 * - [[applySetting]]
 **/
export declare const WWTAwareComponent: import("vue").DefineComponent<{
    /** The namespace of the Pinia module used to track the WWT component’s state.
     * This prop should have the same value in all components in the app that
     * reference WWT.
     */
    wwtNamespace: {
        type: StringConstructor;
        default: string;
        required: true;
    };
    wwtFreestandingAssetBaseurl: StringConstructor;
}, unknown, unknown, {
    lookupImageset: () => (imagesetName: string) => import("@wwtelescope/engine").Imageset | null;
    findRADecForScreenPoint: () => (pt: {
        x: number;
        y: number;
    }) => {
        ra: number;
        dec: number;
    };
    findScreenPointForRADec: () => (pt: {
        ra: number;
        dec: number;
    }) => {
        x: number;
        y: number;
    };
    imagesetStateForLayer: () => (guidtext: string) => import("./store").ImageSetLayerState | null;
    activeImagesetLayerStates: () => import("./store").ImageSetLayerState[];
    imagesetForLayer: () => (guidtext: string) => import("@wwtelescope/engine").Imageset | null;
    layerForHipsCatalog: () => (name: string) => import("@wwtelescope/engine").SpreadSheetLayer | null;
    spreadsheetStateForHipsCatalog: () => (name: string) => import("@wwtelescope/engine").SpreadSheetLayerSettingsInterfaceRO | null;
    spreadSheetLayerById: () => (id: string) => import("@wwtelescope/engine").SpreadSheetLayer | null;
    spreadsheetStateById: () => (id: string) => import("@wwtelescope/engine").SpreadSheetLayerSettingsInterfaceRO | null;
    spreadSheetLayer: () => (catalog: import("./store").CatalogLayerInfo) => import("@wwtelescope/engine").SpreadSheetLayer | null;
    spreadsheetState: () => (catalog: import("./store").CatalogLayerInfo) => import("@wwtelescope/engine").SpreadSheetLayerSettingsInterfaceRO | null;
    wwtActiveLayers: () => string[];
    wwtAvailableImagesets: () => {
        url: string;
        name: string;
        type: import("@wwtelescope/engine-types").ImageSetType;
        id: string | null;
        description: string;
        extension: string;
    }[];
    wwtBackgroundImageset: () => {
        get_altUrl: () => string;
        set_altUrl: (url: string) => string;
        get_bandPass: () => import("@wwtelescope/engine-types").BandPass;
        set_bandPass: (bp: import("@wwtelescope/engine-types").BandPass) => import("@wwtelescope/engine-types").BandPass;
        get_baseLevel: () => number;
        set_baseLevel: (bl: number) => number;
        get_baseTileDegrees: () => number;
        set_baseTileDegrees: (v: number) => number;
        get_bottomsUp: () => boolean;
        set_bottomsUp: (bu: boolean) => boolean;
        get_centerX: () => number;
        set_centerX: (cx: number) => number;
        get_centerY: () => number;
        set_centerY: (cy: number) => number;
        get_children: () => import("@wwtelescope/engine-types").Thumbnail[];
        get_creditsText: () => string;
        set_creditsText: (ct: string) => string;
        get_creditsUrl: () => string;
        set_creditsUrl: (cu: string) => string;
        get_dataSetType: () => import("@wwtelescope/engine-types").ImageSetType;
        set_dataSetType: (st: import("@wwtelescope/engine-types").ImageSetType) => import("@wwtelescope/engine-types").ImageSetType;
        get_defaultSet: () => boolean;
        set_defaultSet: (ds: boolean) => boolean;
        get_demUrl: () => string;
        set_demUrl: (url: string) => string;
        get_elevationModel: () => boolean;
        set_elevationModel: (em: boolean) => boolean;
        get_extension: () => string;
        set_extension: (ext: string) => string;
        get_fitsProperties: () => import("@wwtelescope/engine").FitsProperties;
        get_generic: () => boolean;
        set_generic: (g: boolean) => boolean;
        get_hipsProperties: () => import("@wwtelescope/engine").HipsProperties | null;
        get_imageSetID: () => number;
        set_imageSetID: (id: number) => number;
        get_isCloudCommunityItem: () => boolean;
        get_isFolder: () => boolean;
        get_isImage: () => boolean;
        get_isTour: () => boolean;
        get_levels: () => number;
        set_levels: (levels: number) => number;
        get_meanRadius: () => number;
        set_meanRadius: (mr: number) => number;
        get_mercator: () => boolean;
        set_mercator: (m: boolean) => boolean;
        get_name: () => string;
        set_name: (name: string) => string;
        get_offsetX: () => number;
        set_offsetX: (ox: number) => number;
        get_offsetY: () => number;
        set_offsetY: (oy: number) => number;
        get_projection: () => import("@wwtelescope/engine-types").ProjectionType;
        set_projection: (pt: import("@wwtelescope/engine-types").ProjectionType) => import("@wwtelescope/engine-types").ProjectionType;
        get_readOnly: () => boolean;
        get_referenceFrame: () => string;
        set_referenceFrame: (rf: string) => string;
        get_rotation: () => number;
        set_rotation: (r: number) => number;
        get_quadTreeTileMap: () => string;
        set_quadTreeTileMap: (qttm: string) => string;
        get_singleImage: () => boolean;
        set_singleImage: (si: boolean) => boolean;
        get_sparse: () => boolean;
        set_sparse: (s: boolean) => boolean;
        get_thumbnailUrl: () => string;
        set_thumbnailUrl: (url: string) => string;
        get_url: () => string;
        set_url: (url: string) => string;
        get_wcsImage: () => import("@wwtelescope/engine").WcsImage | null;
        set_wcsImage: (w: import("@wwtelescope/engine").WcsImage | null) => import("@wwtelescope/engine").WcsImage | null;
        get_widthFactor: () => number;
        set_widthFactor: (f: number) => number;
        getHashCode: () => number;
    } | null;
    wwtCurrentTime: () => {
        toString: () => string;
        toDateString: () => string;
        toTimeString: () => string;
        toLocaleString: {
            (): string;
            (locales?: string | string[] | undefined, options?: Intl.DateTimeFormatOptions | undefined): string;
            (locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions | undefined): string;
        };
        toLocaleDateString: {
            (): string;
            (locales?: string | string[] | undefined, options?: Intl.DateTimeFormatOptions | undefined): string;
            (locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions | undefined): string;
        };
        toLocaleTimeString: {
            (): string;
            (locales?: string | string[] | undefined, options?: Intl.DateTimeFormatOptions | undefined): string;
            (locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions | undefined): string;
        };
        valueOf: () => number;
        getTime: () => number;
        getFullYear: () => number;
        getUTCFullYear: () => number;
        getMonth: () => number;
        getUTCMonth: () => number;
        getDate: () => number;
        getUTCDate: () => number;
        getDay: () => number;
        getUTCDay: () => number;
        getHours: () => number;
        getUTCHours: () => number;
        getMinutes: () => number;
        getUTCMinutes: () => number;
        getSeconds: () => number;
        getUTCSeconds: () => number;
        getMilliseconds: () => number;
        getUTCMilliseconds: () => number;
        getTimezoneOffset: () => number;
        setTime: (time: number) => number;
        setMilliseconds: (ms: number) => number;
        setUTCMilliseconds: (ms: number) => number;
        setSeconds: (sec: number, ms?: number | undefined) => number;
        setUTCSeconds: (sec: number, ms?: number | undefined) => number;
        setMinutes: (min: number, sec?: number | undefined, ms?: number | undefined) => number;
        setUTCMinutes: (min: number, sec?: number | undefined, ms?: number | undefined) => number;
        setHours: (hours: number, min?: number | undefined, sec?: number | undefined, ms?: number | undefined) => number;
        setUTCHours: (hours: number, min?: number | undefined, sec?: number | undefined, ms?: number | undefined) => number;
        setDate: (date: number) => number;
        setUTCDate: (date: number) => number;
        setMonth: (month: number, date?: number | undefined) => number;
        setUTCMonth: (month: number, date?: number | undefined) => number;
        setFullYear: (year: number, month?: number | undefined, date?: number | undefined) => number;
        setUTCFullYear: (year: number, month?: number | undefined, date?: number | undefined) => number;
        toUTCString: () => string;
        toISOString: () => string;
        toJSON: (key?: any) => string;
        getVarDate: () => VarDate;
        [Symbol.toPrimitive]: {
            (hint: "default"): string;
            (hint: "string"): string;
            (hint: "number"): number;
            (hint: string): string | number;
        };
    };
    wwtClockDiscontinuities: () => number;
    wwtClockRate: () => number;
    wwtDecRad: () => number;
    wwtForegroundImageset: () => {
        get_altUrl: () => string;
        set_altUrl: (url: string) => string;
        get_bandPass: () => import("@wwtelescope/engine-types").BandPass;
        set_bandPass: (bp: import("@wwtelescope/engine-types").BandPass) => import("@wwtelescope/engine-types").BandPass;
        get_baseLevel: () => number;
        set_baseLevel: (bl: number) => number;
        get_baseTileDegrees: () => number;
        set_baseTileDegrees: (v: number) => number;
        get_bottomsUp: () => boolean;
        set_bottomsUp: (bu: boolean) => boolean;
        get_centerX: () => number;
        set_centerX: (cx: number) => number;
        get_centerY: () => number;
        set_centerY: (cy: number) => number;
        get_children: () => import("@wwtelescope/engine-types").Thumbnail[];
        get_creditsText: () => string;
        set_creditsText: (ct: string) => string;
        get_creditsUrl: () => string;
        set_creditsUrl: (cu: string) => string;
        get_dataSetType: () => import("@wwtelescope/engine-types").ImageSetType;
        set_dataSetType: (st: import("@wwtelescope/engine-types").ImageSetType) => import("@wwtelescope/engine-types").ImageSetType;
        get_defaultSet: () => boolean;
        set_defaultSet: (ds: boolean) => boolean;
        get_demUrl: () => string;
        set_demUrl: (url: string) => string;
        get_elevationModel: () => boolean;
        set_elevationModel: (em: boolean) => boolean;
        get_extension: () => string;
        set_extension: (ext: string) => string;
        get_fitsProperties: () => import("@wwtelescope/engine").FitsProperties;
        get_generic: () => boolean;
        set_generic: (g: boolean) => boolean;
        get_hipsProperties: () => import("@wwtelescope/engine").HipsProperties | null;
        get_imageSetID: () => number;
        set_imageSetID: (id: number) => number;
        get_isCloudCommunityItem: () => boolean;
        get_isFolder: () => boolean;
        get_isImage: () => boolean;
        get_isTour: () => boolean;
        get_levels: () => number;
        set_levels: (levels: number) => number;
        get_meanRadius: () => number;
        set_meanRadius: (mr: number) => number;
        get_mercator: () => boolean;
        set_mercator: (m: boolean) => boolean;
        get_name: () => string;
        set_name: (name: string) => string;
        get_offsetX: () => number;
        set_offsetX: (ox: number) => number;
        get_offsetY: () => number;
        set_offsetY: (oy: number) => number;
        get_projection: () => import("@wwtelescope/engine-types").ProjectionType;
        set_projection: (pt: import("@wwtelescope/engine-types").ProjectionType) => import("@wwtelescope/engine-types").ProjectionType;
        get_readOnly: () => boolean;
        get_referenceFrame: () => string;
        set_referenceFrame: (rf: string) => string;
        get_rotation: () => number;
        set_rotation: (r: number) => number;
        get_quadTreeTileMap: () => string;
        set_quadTreeTileMap: (qttm: string) => string;
        get_singleImage: () => boolean;
        set_singleImage: (si: boolean) => boolean;
        get_sparse: () => boolean;
        set_sparse: (s: boolean) => boolean;
        get_thumbnailUrl: () => string;
        set_thumbnailUrl: (url: string) => string;
        get_url: () => string;
        set_url: (url: string) => string;
        get_wcsImage: () => import("@wwtelescope/engine").WcsImage | null;
        set_wcsImage: (w: import("@wwtelescope/engine").WcsImage | null) => import("@wwtelescope/engine").WcsImage | null;
        get_widthFactor: () => number;
        set_widthFactor: (f: number) => number;
        getHashCode: () => number;
    } | null;
    wwtForegroundOpacity: () => number;
    wwtImagesetLayers: () => {
        [guidtext: string]: import("./store").ImageSetLayerState;
    };
    wwtIsTourPlayerActive: () => boolean;
    wwtIsTourPlaying: () => boolean;
    wwtRARad: () => number;
    wwtRenderType: () => import("@wwtelescope/engine-types").ImageSetType;
    wwtRollRad: () => number;
    wwtShowWebGl2Warning: () => boolean;
    wwtSpreadSheetLayers: () => {
        [guidtext: string]: import("@wwtelescope/engine-helpers").SpreadSheetLayerState;
    };
    wwtTourCompletions: () => number;
    wwtTourRunTime: () => number | null;
    wwtTourStopStartTimes: () => number[];
    wwtTourTimecode: () => number;
    wwtZoomDeg: () => number;
}, {
    internalLinkToInstance: (wwt: import("@wwtelescope/engine-helpers").WWTInstance) => void;
    internalUnlinkFromInstance: () => void;
    internalUpdate: () => void;
    internalIncrementTourCompletions: () => void;
    applySetting: (setting: import("@wwtelescope/engine").EngineSetting) => void;
    setBackgroundImageByName: (imagesetName: string) => void;
    setForegroundImageByName: (imagesetName: string) => void;
    setForegroundOpacity: (opacity: number) => void;
    setupForImageset: (options: import("@wwtelescope/engine-helpers").SetupForImagesetOptions) => void;
    zoom: (factor: number) => void;
    move: (args: {
        x: number;
        y: number;
    }) => void;
    tilt: (args: {
        x: number;
        y: number;
    }) => void;
    setTime: (time: Date) => void;
    setClockRate: (rate: number) => void;
    setClockSync: (isSynced: boolean) => void;
    startTour: () => void;
    toggleTourPlayPauseState: () => void;
    setTourPlayerLeaveSettingsWhenStopped: (value: boolean) => void;
    seekToTourTimecode: (value: number) => void;
    viewAsTourXml: (name: string) => Promise<string | null>;
    waitForReady: () => Promise<void>;
    gotoRADecZoom: ({ raRad, decRad, zoomDeg, instant, rollRad }: import("./store").GotoRADecZoomParams) => Promise<void>;
    timeToRADecZoom: ({ raRad, decRad, zoomDeg, rollRad }: import("./store").TimeToRADecZoomParams) => number;
    gotoTarget: (options: import("@wwtelescope/engine-helpers").GotoTargetOptions) => Promise<void>;
    setTrackedObject: (obj: import("@wwtelescope/engine-types").SolarSystemObjects) => void;
    loadTour: ({ url, play }: import("./store").LoadTourParams) => Promise<{
        tourRunTime: number | null;
        tourStopStartTimes: number[];
    }>;
    loadImageCollection: ({ url, loadChildFolders }: import("./store").LoadImageCollectionParams) => Promise<import("@wwtelescope/engine").Folder>;
    addImagesetToRepository: (imgset: import("@wwtelescope/engine").Imageset) => import("@wwtelescope/engine").Imageset;
    deleteLayer: (id: string | import("@wwtelescope/engine").Guid) => void;
    addImageSetLayer: (options: import("@wwtelescope/engine-helpers").AddImageSetLayerOptions) => Promise<import("@wwtelescope/engine").ImageSetLayer>;
    loadFitsLayer: (options: import("@wwtelescope/engine-helpers").LoadFitsLayerOptions) => Promise<import("@wwtelescope/engine").ImageSetLayer>;
    setImageSetLayerOrder: (options: import("@wwtelescope/engine-helpers").SetLayerOrderOptions) => void;
    stretchFitsLayer: (options: import("@wwtelescope/engine-helpers").StretchFitsLayerOptions) => void;
    setFitsLayerColormap: (options: import("@wwtelescope/engine-helpers").SetFitsLayerColormapOptions) => void;
    applyFitsLayerSettings: (options: import("@wwtelescope/engine-helpers").ApplyFitsLayerSettingsOptions) => void;
    createTableLayer: (options: import("./store").CreateTableLayerParams) => Promise<import("@wwtelescope/engine").SpreadSheetLayer>;
    applyTableLayerSettings: (options: import("@wwtelescope/engine-helpers").ApplyTableLayerSettingsOptions) => void;
    updateTableLayer: (options: import("@wwtelescope/engine-helpers").UpdateTableLayerOptions) => void;
    addCatalogHipsByName: (options: import("@wwtelescope/engine-helpers").AddCatalogHipsByNameOptions) => Promise<import("@wwtelescope/engine").Imageset>;
    getCatalogHipsDataInView: (options: import("@wwtelescope/engine-helpers").GetCatalogHipsDataInViewOptions) => Promise<import("@wwtelescope/engine").InViewReturnMessage>;
    removeCatalogHipsByName: (name: string) => void;
    addAnnotation: (ann: import("@wwtelescope/engine").Annotation) => void;
    removeAnnotation: (ann: import("@wwtelescope/engine").Annotation) => void;
    clearAnnotations: () => void;
    captureFrame: (options: import("@wwtelescope/engine-helpers").CaptureFrameOptions) => Promise<Blob | null>;
    captureVideo: (options: import("@wwtelescope/engine-helpers").CaptureVideoOptions) => ReadableStream<Blob | null>;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    /** The namespace of the Pinia module used to track the WWT component’s state.
     * This prop should have the same value in all components in the app that
     * reference WWT.
     */
    wwtNamespace: {
        type: StringConstructor;
        default: string;
        required: true;
    };
    wwtFreestandingAssetBaseurl: StringConstructor;
}>>, {
    wwtNamespace: string;
}, {}>;
