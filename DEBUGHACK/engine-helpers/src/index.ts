// Copyright 2020-2023 the .NET Foundation
// Licensed under the MIT License

import { D2H, R2D, R2H } from "@wwtelescope/astro";

import {
  ImageSetType,
  ScaleTypes,
} from "@wwtelescope/engine-types";

import {
  EngineSetting,
  Folder,
  Imageset,
  ImageSetLayer,
  ImageSetLayerSetting,
  InViewReturnMessage,
  LayerManager,
  LayerManagerObject,
  Place,
  ScriptInterface,
  SpaceTimeControllerObject,
  TourPlayer,
  Wtml,
  WWTControl,
  WWTControlBuilder,
  SpaceTimeController,
  SpreadSheetLayer,
  SpreadSheetLayerSetting,
} from "@wwtelescope/engine";

import {
  applyImageSetLayerSetting,
} from "./imagesetlayer";

import {
  applySpreadSheetLayerSetting,
} from "./spreadsheetlayer";


// Settings-related re-exports

export {
  applyAnnotationSetting,
  copyAnnotationSettings,
  extractAnnotationSettings,
  isAnnotationSetting,
  AnnotationState,
} from "./annotation";

export {
  applyCircleAnnotationSetting,
  copyCircleAnnotationSettings,
  extractCircleAnnotationSettings,
  isCircleAnnotationSetting,
  CircleAnnotationState,
} from "./circleannotation";

export {
  applyEngineSetting,
  copyEngineSettings,
  extractEngineSettings,
  isEngineSetting,
  EngineState,
} from "./engine";

export {
  applyImageSetLayerSetting,
  copyImageSetLayerSettings,
  extractImageSetLayerSettings,
  isImageSetLayerSetting,
  ImageSetLayerState,
} from "./imagesetlayer";

export {
  applyLayerSetting,
  copyLayerSettings,
  extractLayerSettings,
  isLayerSetting,
  LayerState,
} from "./layer";

export {
  applyPolyAnnotationSetting,
  copyPolyAnnotationSettings,
  extractPolyAnnotationSettings,
  isPolyAnnotationSetting,
  PolyAnnotationState,
} from "./polyannotation";

export {
  applyPolyLineAnnotationSetting,
  copyPolyLineAnnotationSettings,
  extractPolyLineAnnotationSettings,
  isPolyLineAnnotationSetting,
  PolyLineAnnotationState,
} from "./polylineannotation";

export {
  applySpreadSheetLayerSetting,
  copySpreadSheetLayerSettings,
  extractSpreadSheetLayerSettings,
  isSpreadSheetLayerSetting,
  SpreadSheetLayerState,
} from "./spreadsheetlayer";

export {
  applyVoTableLayerSetting,
  copyVoTableLayerSettings,
  extractVoTableLayerSettings,
  isVoTableLayerSetting,
  VoTableLayerState,
} from "./votablelayer";


// The WWTInstance wrapper class and friends.

export const enum InitControlViewType {
  Sky = "Sky",
  Earth = "earth",
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

interface ResolveFunction<T> {
  (value: T): void;
}

interface RejectFunction {
  (reason?: any): void;  // eslint-disable-line @typescript-eslint/no-explicit-any
}

class SavedPromise<P, T> {
  readonly payload: P;
  readonly resolve: ResolveFunction<T>;
  readonly reject: RejectFunction;

  constructor(payload: P, resolve: ResolveFunction<T>, reject: RejectFunction) {
    this.payload = payload;
    this.resolve = resolve;
    this.reject = reject;
  }
}

export class WWTInstance {
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
  constructor(
    options: InitControlSettings = {}
  ) {
    const builder = new WWTControlBuilder(options.elId || "wwt");

    if (options.startInternalRenderLoop !== undefined) {
      builder.startRenderLoop(options.startInternalRenderLoop);
    }

    if (options.freestandingAssetBaseurl !== undefined) {
      builder.freestandingMode(options.freestandingAssetBaseurl);
    }

    if (options.startLatDeg !== undefined && options.startLngDeg !== undefined) {
      const zoom = options.startZoomDeg || 360;
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
    this.si.add_ready((_si) => {
      for (const p of this.readyPromises) {
        p.resolve();
      }

      this.readyFired = true;
      this.readyPromises = [];
    });

    // Arrival promise initialization:
    this.si.add_arrived((_si, _args) => {
      for (const p of this.arrivePromises) {
        if (p.payload < this.arriveSeqnum) {
          p.reject("superseded");
        } else {
          p.resolve();
        }
      }

      this.arrivePromises = [];
    });

    // TourReady promise init:
    this.si.add_tourReady((_si) => {
      for (const p of this.tourReadyPromises) {
        if (p.payload < this.tourReadySeqnum) {
          p.reject("superseded");
        } else {
          p.resolve();
        }
      }

      this.tourReadyPromises = [];
    });

    // TourEnded event init:
    TourPlayer.add_tourEnded((_tpclass) => {
      const tp = this.getActiveTourPlayer();

      if (tp !== null && this.tourEndedCallback !== null) {
        this.tourEndedCallback(tp);
      }
    });
  }

  // Ready promises

  private readyPromises: SavedPromise<null, void>[] = [];
  private readyFired = false;

  async waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.readyFired) {
        resolve();
      } else {
        this.readyPromises.push(new SavedPromise(null, resolve, reject));
      }
    });
  }

  // Arrival promises

  private arrivePromises: SavedPromise<number, void>[] = [];
  private arriveSeqnum = 0;

  private makeArrivePromise(instantResolve: boolean): Promise<void> {
    this.arriveSeqnum += 1;
    const seq = this.arriveSeqnum;

    for (const p of this.arrivePromises) {
      p.reject("superseded");
    }

    this.arrivePromises = [];

    return new Promise((resolve, reject) => {
      if (this.arriveSeqnum > seq) {
        reject("superseded");
      } else if (instantResolve) {
        resolve();
      } else {
        this.arrivePromises.push(new SavedPromise(seq, resolve, reject));
      }
    });
  }

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
  async gotoRADecZoom(raRad: number, decRad: number, zoomDeg: number, instant: boolean, rollRad?: number): Promise<void> {
    this.ctl.gotoRADecZoom(
      raRad * R2H,
      decRad * R2D,
      zoomDeg,
      instant,
      rollRad
    );
    return this.makeArrivePromise(instant);
  }

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
  timeToRADecZoom(raRad: number, decRad: number, zoomDeg: number, rollRad?: number): number {
    const time = this.ctl.timeToRADecZoom(
      raRad * R2H,
      decRad * R2D,
      zoomDeg,
      rollRad
    );
    return time;
  }

  /** Command the view to show a Place.
   *
   * @param options The options for the goto command.
   */
  async gotoTarget(options: GotoTargetOptions): Promise<void> {
    this.ctl.gotoTarget(
      options.place,
      options.noZoom,
      options.instant,
      options.trackObject
    );
    return this.makeArrivePromise(options.instant);
  }

  /** Add an imageset directly into the engine's database.
   *
   * If an imageset with the same URL has already been loaded, this is a no-op.
   *
   * @param imgset The imageset to add
   * @returns Either the input argument, if it was added to the engine's
   *   database, or the pre-existing imageset. The pre-existing imageset will
   *   have the same URL but might differ in other respects, such as its name.
   */
  addImagesetToRepository(imgset: Imageset): Imageset {
    return WWTControl.addImageSetToRepository(imgset);
  }

  // Collection-loaded promises. To simplify the handling, we never load the
  // same URL more than once. Otherwise, all of the timing issues about multiple
  // requests for the same URL get gnarly to handle. And as far as the engine is
  // concerned, collection loads are idempotent.

  private collectionLoadedPromises: SavedPromise<string, Folder>[] = [];
  private collectionRequests: Map<string, Folder | null> = new Map();

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
  async loadImageCollection(url: string, loadChildFolders?: boolean): Promise<Folder> {
    const curState = this.collectionRequests.get(url);

    // If we've already loaded the folder, insta-resolve to it.
    if (curState !== undefined && curState !== null) {
      return Promise.resolve(curState);
    }

    // If we haven't even issued the request, do so.
    if (curState === undefined) {
      // Mark this URL as having an in-flight request.
      this.collectionRequests.set(url, null);

      // We need some internal mutability here to allow the getWtmlFile callback
      // to find the Folder variable, which we only get as a return value from
      // the function.
      const holder: { f: Folder | null } = { f: null };

      if (loadChildFolders === undefined) {
        loadChildFolders = false;
      }

      holder.f = Wtml.getWtmlFile(url, () => {
        // The folder at this URL is now fully loaded.
        const f = holder.f as Folder;
        this.collectionRequests.set(url, f);

        this.collectionLoadedPromises = this.collectionLoadedPromises.filter((p) => {
          if (p.payload == url) {
            p.resolve(f);
            return false;
          }

          // Don't filter out promises for other URLs.
          return true;
        });
      }, loadChildFolders);
    }

    return new Promise((resolve, reject) => {
      const curState = this.collectionRequests.get(url);

      // By the time this promise callback is called, maybe the Folder has fully
      // loaded?
      if (curState !== undefined && curState !== null) {
        resolve(curState);
      } else {
        // If not, queue ourselves up to be resolved when the data finally come
        // through.
        this.collectionLoadedPromises.push(new SavedPromise(url, resolve, reject));
      }
    });
  }

  // Layers

  /** Load an image set or a remote FITS file into a data layer and display it.
   *
   * The FITS file must be downloaded and processed, so this API is
   * asynchronous, and is not appropriate for files that might be large.
   *
   * The image set must have previously been created with [[loadImageCollection]]
   */
  async addImageSetLayer(options: AddImageSetLayerOptions): Promise<ImageSetLayer> {
    return new Promise((resolve, _reject) => {
      this.si.addImageSetLayer(options.url, options.mode, options.name, options.goto, (layer) => {
        resolve(layer);
      })
    });
  }

  /** Change the ImageSetLayer position in the layer stack. */
  setImageSetLayerOrder(options: SetLayerOrderOptions): void {
    this.si.setImageSetLayerOrder(options.id, options.order);
  }

  /** Change the "stretch" settings of a FITS image layer. */
  stretchFitsLayer(options: StretchFitsLayerOptions): void {
    const layer = this.lm.get_layerList()[options.id];
    if (layer && layer instanceof ImageSetLayer) {
      layer.setImageScalePhysical(options.stretch, options.vmin, options.vmax);

      // This is kind of random, but follows the pywwt API implementation.
      const fits = layer.getFitsImage();
      if (fits !== null) {
        layer.get_imageSet().get_fitsProperties().transparentBlack = false;
      }
    }
  }

  /** Change the colormap settings of a FITS image layer. */
  setFitsLayerColormap(options: SetFitsLayerColormapOptions): void {
    const layer = this.lm.get_layerList()[options.id];
    if (layer && layer instanceof ImageSetLayer) {
      layer.set_colorMapperName(options.name);
    }
  }

  /** Apply settings to a FITS image layer. */
  applyFitsLayerSettings(options: ApplyFitsLayerSettingsOptions): void {
    const layer = this.lm.get_layerList()[options.id];
    if (layer && layer instanceof ImageSetLayer) {
      for (const setting of options.settings) {
        applyImageSetLayerSetting(layer, setting);
      }
    }
  }

  /** Update the data within a tabular data layer. */
  updateTableLayer(options: UpdateTableLayerOptions): void {
    const layer = this.lm.get_layerList()[options.id];
    if (layer && layer instanceof SpreadSheetLayer) {
      layer.updateData(options.dataCsv, true, true, true);
    }
  }

  /** Apply settings to a tabular data layer. */
  applyTableLayerSettings(options: ApplyTableLayerSettingsOptions): void {
    const layer = this.lm.get_layerList()[options.id];
    if (layer && layer instanceof SpreadSheetLayer) {
      for (const setting of options.settings) {
        applySpreadSheetLayerSetting(layer, setting);
      }
    }
  }

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
  async addCatalogHipsByName(options: AddCatalogHipsByNameOptions): Promise<Imageset> {
    return new Promise((resolve, reject) => {
      const imgset = this.ctl.getImagesetByName(options.name);

      if (imgset === null) {
        reject();
      } else {
        this.ctl.renderContext.addCatalogHips(imgset, () => {
          resolve(imgset);
        });
      }
    });
  }

  /** Fetch the subset of catalog HiPS data contained within the current view.
   *
   * The imageset should have been loaded with the [[addCatalogHipsByName]]
   * call. The *limit* option should almost always be true, since if it is false
   * the data-fetch operation can potentially attempt to download and return
   * gigabytes of data.
   * */
  async getCatalogHipsDataInView(options: GetCatalogHipsDataInViewOptions): Promise<InViewReturnMessage> {
    return new Promise((resolve, _reject) => {
      this.ctl.renderContext.getCatalogHipsDataInView(options.imageset, options.limit, (msg) => {
        resolve(msg);
      });
    });
  }

  // "Mutator" type operations -- not async.

  applySetting(setting: EngineSetting): void {
    const funcName = "set_" + setting[0];
    const value: any = setting[1];  // eslint-disable-line @typescript-eslint/no-explicit-any
    (this.si.settings as any)[funcName](value);  // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  setBackgroundImageByName(imagesetName: string): void {
    this.ctl.setBackgroundImageByName(imagesetName);
  }

  setForegroundImageByName(imagesetName: string): void {
    this.ctl.setForegroundImageByName(imagesetName);
  }

  /** Set the opacity with which the foreground imageset is rendered.
   *
   * @param opacity The opacity, between 0 (invisible) and 100 (fully opaque).
   */
  setForegroundOpacity(opacity: number): void {
    this.si.setForegroundOpacity(opacity);
  }

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
  setupForImageset(options: SetupForImagesetOptions): void {
    let bkg;

    if (options.background) {
      bkg = options.background;
    } else {
      bkg = this.ctl.getDefaultImageset(options.foreground.get_dataSetType(), options.foreground.get_bandPass())
    }

    let imageHeightDeg;

    if (options.foreground.get_levels() > 0) {
      // For tiled images, baseTileDegrees gives the image angular height
      // directly, modulo a factor of two uncertainty depending on how the image
      // pixel height rounds up to a power of two.
      imageHeightDeg = options.foreground.get_baseTileDegrees();
    } else {
      // Unfortunately, for untiled images we don't have the information needed
      // to assess the image's angular height reliably. In many cases offsetY
      // will be about half of the pixel height, but it could be anything.
      imageHeightDeg = options.foreground.get_baseTileDegrees() * options.foreground.get_offsetY() * 2;
    }

    const place = new Place();
    place.set_type(options.foreground.get_dataSetType());
    place.set_backgroundImageset(bkg);
    place.set_studyImageset(options.foreground);

    let noZoom = false;

    switch (options.foreground.get_dataSetType()) {
      case ImageSetType.sky:
        if (imageHeightDeg == 180) {
          // All-sky image -- special behavior
          noZoom = true;
        } else {
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

    this.ctl.gotoTarget(
      place,
      noZoom,
      true, // instant
      true // trackObject
    );
  }

  // Tours

  /** If the tour playback mode is active, get the active TourPlayer object. */
  getActiveTourPlayer(): TourPlayer | null {
    if (this.ctl.uiController === null)
      return null;

    if (this.ctl.uiController instanceof TourPlayer)
      return this.ctl.uiController;

    return null;
  }

  /** Find out whether a tour is playing.
   *
   * For obscure reasons, this is a static method in WWT that is not attached to
   * a TourPlayer instance. We take one as an argument for future-proofiness.
   */
  getIsTourPlaying(_player: TourPlayer): boolean {
    return TourPlayer.get_playing();
  }

  private tourReadyPromises: SavedPromise<number, void>[] = [];
  private tourReadySeqnum = 0;

  /** A callback to be invoked when a tour completes playing. */
  public tourEndedCallback: ((tp: TourPlayer) => void) | null = null;

  /** Load a tour from a URL.
   *
   * Once the tour has loaded, you can use [[getActiveTourPlayer]] to get the
   * tour player controller and the underlying tour document.
   *
   * @param url The URL of the tour to load and play.
   * @returns A promise that resolves when the tour has loaded.
   */
  async loadTour(url: string): Promise<void> {
    this.ctl.loadTour(url);

    this.tourReadySeqnum += 1;
    const seq = this.tourReadySeqnum;

    for (const p of this.tourReadyPromises) {
      p.reject("superseded");
    }

    this.tourReadyPromises = [];

    return new Promise((resolve, reject) => {
      if (this.tourReadySeqnum > seq) {
        reject("superseded");
      } else {
        this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
      }
    });
  }

  /** Load a tour from a URL and start playing it.
   *
   * @param url The URL of the tour to load and play.
   * @returns A promise that resolves when the tour has loaded and started
   * playing.
   */
  async loadAndPlayTour(url: string): Promise<void> {
    this.ctl.playTour(url);

    this.tourReadySeqnum += 1;
    const seq = this.tourReadySeqnum;

    for (const p of this.tourReadyPromises) {
      p.reject("superseded");
    }

    this.tourReadyPromises = [];

    return new Promise((resolve, reject) => {
      if (this.tourReadySeqnum > seq) {
        reject("superseded");
      } else {
        this.tourReadyPromises.push(new SavedPromise(seq, resolve, reject));
      }
    });
  }

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
  getEffectiveTourTimecode(): number {
    const player = this.getActiveTourPlayer();
    if (player === null)
      return 0.0;

    const tour = player.get_tour();
    if (tour === null)
      return 0.0;

    const idx = tour.get_currentTourstopIndex();
    if (idx < 0)
      return 0.0;

    const base = tour.elapsedTimeTillTourstop(idx);
    const stop = tour.get_tourStops()[idx];
    const delta = stop.get_tweenPosition() * stop.get_duration() * 0.001; // ms => s
    const value = base + delta;

    // It's possible for our math to yield a value slightly larger than the
    // nominal tour runtime, which can upset code that expects the value to stay
    // rigorously within that bound. So, clamp it to be sure.

    if (value < 0)
      return 0.0;

    const runTime = tour.get_runTime() * 0.001; // ms => s

    if (value > runTime)
      return runTime;

    return value;
  }

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
  seekToTourTimecode(value: number): void {
    const player = this.getActiveTourPlayer();
    if (player === null)
      return;

    const tour = player.get_tour();
    if (tour === null)
      return;

    // Figure out the stop index that best matches the specified timecode.
    const stops = tour.get_tourStops()
    let index = stops.length - 1;

    for (let i = 0; i < stops.length; i++) {
      const tStart = tour.elapsedTimeTillTourstop(i);

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
  }

  /** Capture the current frame as an image.
   *
   * This function returns a Promise whose resolved value is the image
   * represented as a `Blob`.
  */
  captureFrame(options: CaptureFrameOptions): Promise<Blob | null> {
    return new Promise((resolve, _reject) => {
      this.ctl.captureFrame(blob => resolve(blob),
        options.width,
        options.height,
        options.format);
    });
  }

  /** Capture a video as a sequence of frames using the given parameters
   *
   * This function returns a readable stream whose values are the exported frames.
  */
  captureVideo(options: CaptureVideoOptions): ReadableStream<Blob | null> {
    const wwtControl = this.ctl;
    const videoStream = new ReadableStream<Blob | null>({
      start(controller: ReadableStreamDefaultController) {
        function stream() {
          let received = 0;
          wwtControl.captureVideo(blob => {
            received++;
            controller.enqueue(blob);
            if (received >= options.totalFrames) {
              controller.close();
            }
          },
            options.width,
            options.height,
            options.framesPerSecond,
            options.totalFrames,
            options.format
          );
        }
        return stream();
      }
    });
    return videoStream;
  }
}
