// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

// The high-level docs in `wwtaware.ts` contain the developer-friendly
// descriptions of pretty much everything in this file. Update those docs when
// adding new features here.

import { defineStore } from 'pinia';

import { D2R, H2R } from "@wwtelescope/astro";

import {
  AltUnits,
  ImageSetType,
  ScaleTypes,
  SolarSystemObjects,
} from "@wwtelescope/engine-types";

import {
  Annotation,
  EngineSetting,
  Folder,
  Guid,
  Imageset,
  ImageSetLayer,
  InViewReturnMessage,
  Layer,
  LayerMap,
  SpreadSheetLayer,
  SpreadSheetLayerSettingsInterfaceRO,
  WWTControl,
} from "@wwtelescope/engine";

import {
  AddCatalogHipsByNameOptions,
  AddImageSetLayerOptions,
  ApplyFitsLayerSettingsOptions,
  ApplyTableLayerSettingsOptions,
  applyImageSetLayerSetting,
  applySpreadSheetLayerSetting,
  CaptureFrameOptions,
  GetCatalogHipsDataInViewOptions,
  GotoTargetOptions,
  ImageSetLayerState as ImageSetLayerSettings,
  LoadFitsLayerOptions,
  SetFitsLayerColormapOptions,
  SetLayerOrderOptions,
  SetupForImagesetOptions,
  SpreadSheetLayerState,
  StretchFitsLayerOptions,
  UpdateTableLayerOptions,
  WWTInstance,
  CaptureVideoOptions,
} from "@wwtelescope/engine-helpers";

interface WWTLinkedCallback {
  (): void;
}

export class WWTGlobalState {
  inst: WWTInstance | null = null;
  onLinkedCallbacks: WWTLinkedCallback[] = [];

  link(inst: WWTInstance): void {
    if (this.inst !== null)
      throw new Error("must unlink WWT Pinia global state before relinking");

    this.inst = inst;

    for (const cb of this.onLinkedCallbacks) {
      cb();
    }

    this.onLinkedCallbacks = [];
  }

  unlink(): void {
    this.inst = null;
  }
}

/** This class holds basic information about an imageset.
 *
 * Discover imagesets through the [[WWTAwareComponent.wwtAvailableImagesets]]
 * state variable. In standard practice there will be hundreds of available
 * imagesets of many different kinds.
 *
 * Imagesets may be uniquely identified by their associated image data [[url]].
 * (If you really need to have multiple imagesets associated with the same URL,
 * add a `#fragment` to the end.)
 */
export class ImagesetInfo {
  /** The URL of the image data. */
  url: string;

  /** The user-facing name of the imageset. */
  name: string;

  /** The type of the imageset: panorama, sky, ... */
  type: ImageSetType;

  /** The internal GUID of the layer, if it is a HiPS layer */
  id: string | null;

  /** An (application-specific) string giving some additional information about
   * the imageset. */
  description: string;

  /** The image filename extension(s) associated with this imageset.
   *
   * May include multiple extensions separated by spaces. May also start with a
   * leading period.
   */
  extension: string;

  constructor(url: string, name: string, type: ImageSetType, description: string, extension: string, id: string | null = null) {
    this.url = url;
    this.name = name;
    this.type = type;
    this.description = description;
    this.extension = extension;
    this.id = id;
  }

  static fromImageset(imageset: Imageset): ImagesetInfo {
    return new ImagesetInfo(imageset.get_url(), imageset.get_name(), imageset.get_dataSetType(), imageset.get_creditsText(), imageset.get_extension(), imageset.get_hipsProperties()?.get_catalogSpreadSheetLayer().id.toString() ?? null);
  }
}

export class SpreadSheetLayerInfo {
  /** The user-facing name of the layer */
  name: string;

  /** The internal GUID of the layer */
  id: string;

  /** The reference frame in which the data are defined. */
  referenceFrame: string;

  setName(name: string) {
    this.name = name;
  }

  constructor(id: string, referenceFrame: string, name?: string) {
    this.id = id;
    this.referenceFrame = referenceFrame;
    this.name = name ?? id;
  }
}

/** This type defines the union of the various spreadsheet layers.
 *
 * Currently this includes standard spreadsheet layers, and HiPS catalog
 * layers, which are a sort of hybrid between spreadsheet and imageset
 * layers.
 */
export type CatalogLayerInfo = SpreadSheetLayerInfo | ImagesetInfo;

/** Information about an active imageset layer. */
export class ImageSetLayerState {
  /** Layer parameters exposed in WWT's generic "settings" system.
   *
   * This field is an instance of the [@wwtelescope/engine-helpers]
   * [ImageSetLayerState] class (which has the same name as this class, but is
   * different).
   *
   * [@wwtelescope/engine-helpers]: ../../engine-helpers/
   * [ImageSetLayerState]: ../../engine-helpers/classes/imagesetlayerstate.html
  */
  settings: ImageSetLayerSettings;

  /** For FITS-like images, the "stretch" used for color-mapping the image data. */
  scaleType: ScaleTypes;

  /** For FITS-like images, the lower cutoff used for color-mapping the image data. */
  vmin: number;

  /** For FITS-like images, the upper cutoff used for color-mapping the image data. */
  vmax: number;

  /** For FITS-like images, the name of the color map used to render the image
   * data.
   *
   * See [here](../../engine/modules/colormapcontainer.html#fromnamedcolormap)
   * for the supported options. */
  colormapName: string;

  private guidText: string;

  constructor(source: ImageSetLayer) {
    this.guidText = source.id.toString();
    this.settings = new ImageSetLayerSettings(source);

    const fits = source.get_imageSet().get_fitsProperties();
    this.scaleType = fits.scaleType;
    this.vmin = fits.lowerCut;
    this.vmax = fits.upperCut;
    this.colormapName = fits.colorMapName;
  }

  getGuid(): string {
    return this.guidText;
  }
}

/** This interface expresses the properties exposed by the WWT Engine’s Pinia
 * store module.
 *
 * See [[WWTAwareComponent]] for an organized overview of the different aspects
 * of WWT state that are exposed in the Pinia framework, along with associated
 * getters and actions.
 *
 * Much of this interface duplicates state that is already stored within the WWT
 * engine itself (i.e., the `WWTInstance`). Due to the way that the Vue/Pinia
 * reactivity framework works, we need to mirror the engine state into Pinia. The
 * first reason to do this is that, as far as I can tell, there's no good way to
 * integrate the "external" state of the WWT instance into the reactivity
 * framework so that dependencies can be mapped correctly. And we can't just
 * integrate the WWT instance into the reactivity framework -- well, I haven't
 * tried, but I'm 99% sure that it won't work with all of the WebGL textures and
 * whatnot. I.e., the WWT types that hold state are not "plain old data".
 *
 * The second reason is that it is recommended for app state to be flattened and
 * normalized when expressed in a store, as in [this post]. The WWT engine
 * certainly does *not* express its state in such a manner.
 *
 * [this post]: https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143/2
 *
 * The duplication of WWT's data structures is annoying, but the actual amount
 * of mirrored data isn't very big.
 */
export interface WWTEnginePiniaState {
  // NOTE: We were orginally alphabetizing these all, but now I think it will be
  // better to group topically related fields.

  /** Info about the imagesets that are available in the engine to be used as backgrounds */
  availableImagesets: ImagesetInfo[];

  /** The current imageset acting as the background imagery, if defined. */
  backgroundImageset: Imageset | null;

  /** The number of times that the WWT engine clock has been changed in a
   * discontinuous manner.
   *
   * The point of this property is that one can watch() it and get alerted to
   * when this happens.
   */
  clockDiscontinuities: number;

  /** The rate at which the WWT engine clock progresses, compared to real time. */
  clockRate: number;

  /** The current WWT clock time of the view, as a UTC Date. */
  currentTime: Date;

  /** The current declination of the view, in radians.
   *
   * TODO: define this properly for planetary lat/lng views!
   */
  decRad: number;

  /** The current imageset acting as the foreground imagery, if defined. */
  foregroundImageset: Imageset | null;

  /** The opacity with which the foreground imageset is rendered; valid
   * values are between 0 and 100 (inclusive).
   */
  foregroundOpacity: number;

  /** Whether the tour playback mode is active.
   *
   * Specifically, this is true if the `WWTControl` has a `uiController` item
   * that is a `TourPlayer` item. See also [[isTourPlaying]].
   */
  isTourPlayerActive: boolean;

  /** Whether a tour is actively playing right now.
   *
   * It might be the case that a tour player is active, but the tour is paused.
   */
  isTourPlaying: boolean;

  /** The current right ascension of the view, in radians.
   *
   * TODO: define this properly for planetary lat/lng views!
   */
  raRad: number;

  /** The current mode of the renderer */
  renderType: ImageSetType;

  /** The current roll of the view camera, in radians */
  rollRad: number;

  /** The time when the state is created */
  timeAtStartup: number;

  /** The number of times that a tour has played through to the end.
   *
   * The point of this property is that one can watch() it and get alerted to
   * tour completion.
   */
  tourCompletions: number;

  /** The total run-time of the current tour, if there is one, measured in seconds. */
  tourRunTime: number | null;

  /** The start times of the stops in the tour, measured in seconds.
   *
   * It is possible for tour stops to be linked in a non-linear order, such that
   * actual playback won't proceed linearly in the way that this API would imply.
   */
  tourStopStartTimes: number[];

  /** How far we have progressed into the current tour, in seconds.
   *
   * This number does not necessarily progress monotonically due to the way that
   * WWT measures tour playback progress. We associate a start time with each
   * "stop" in the tour, and can measure progress through a stop, but stops do
   * not necessarily transition from one to another in linear fashion.
   *
   * That being said, this number should range between 0 and the runtime of the
   * current tour. If no tour is loaded, it will be zero.
   */
  tourTimecode: number;

  showWebGl2Warning: boolean;

  /** The current zoom level of the view, in degrees.
   *
   * The zoom level is the angular height of the viewport, times size.
   *
   * TODO: define this properly for 3D modes!
   */
  zoomDeg: number;

  // Layers and layer management

  /** The GUIDs of all rendered layers, in their draw order. */
  activeLayers: string[];

  /** Settings for all registered imageset layers. */
  imagesetLayers: { [guidtext: string]: ImageSetLayerState };

  /** Settings for all registered WWT spreadsheet layers. */
  spreadSheetLayers: { [guidtext: string]: SpreadSheetLayerState };

}

/** The parameters for the [[createTableLayer]] action. */
export interface CreateTableLayerParams {
  /** The name to assign the layer. TODO: understand where (if anywhere) this name is exposed. */
  name: string;

  /** The name of the reference frame to which this layer is attached. */
  referenceFrame: string;

  /** The table data, as big CSV string. */
  dataCsv: string;
}

export interface TimeToRADecZoomParams {
  /** The right ascension of the target, in radians. */
  raRad: number;

  /** The declination of the target, in radians. */
  decRad: number;

  /** The zoom level of the target, in *degrees*. */
  zoomDeg: number;

  /** Optional: The target roll of the target, in radians. */
  rollRad?: number;
}

/** The parameters for the [[gotoRADecZoom]] action. */
export interface GotoRADecZoomParams {
  /** The right ascension to go to, in radians. */
  raRad: number;

  /** The declination to go to, in radians. */
  decRad: number;

  /** The zoom level to go to, in *degrees*. This is the final angular height of
   * the WWT viewport. */
  zoomDeg: number;

  /** Whether the view should navigate instantly or pan smoothly.
   *
   * Smooth panning is generally preferable from a UX perspective because it
   * gives the engine time to download any data files that it may need to render
   * the view.
   */
  instant: boolean;

  /** Optional: The target roll of the camera, in radians. */
  rollRad?: number;
}

/** The parameters for the [[loadTour]] action.
 */
export interface LoadTourParams {
  /** The tour URL to load. */
  url: string;

  /** Whether to start playing it immediately. */
  play: boolean;
}

/** The parameters for the [[loadImageCollection]] action. */
export interface LoadImageCollectionParams {
  /** The WTML URL to load. */
  url: string;
  /** Optional, Recursively load any child folders. Defaults to false*/
  loadChildFolders?: boolean;
}

/** This function creates the list of currently active layers.
 * Keeping this functionality outside of the store allows us to use it from
 * inside either an action or a mutation.
 */
function activeLayersList(wwt: WWTGlobalState): string[] {
  if (wwt.inst === null)
    throw new Error('cannot get activeLayersList without linking to WWTInstance');

  const layers: string[] = [];

  function accum(lm: LayerMap) {
    for (const layer of lm.layers) {
      layers.push(layer.id.toString());
    }

    for (const [_mapname, sublm] of Object.entries(lm.childMaps)) {
      accum(sublm);
    }
  }

  const rootlm = wwt.inst.lm.get_allMaps()[wwt.inst.ctl.getCurrentReferenceFrame()];
  if (rootlm) {
    accum(rootlm);
  }

  return layers;
}


/** This function creates the list of currently available imagesets.
 * Keeping this functionality outside of the store allows us to use it from
 * inside either an action or a mutation.
 */
function availableImagesets(): ImagesetInfo[] {
  return WWTControl.getImageSets().map(ImagesetInfo.fromImageset);
}

/** The WWT Pinia implementation.
 *
 * See [[WWTAwareComponent]] for an organized overview of the state variables,
 * getters, and actions exposed by this module.
 */
export const engineStore = defineStore('wwt-engine', {

  // NOTE: We were originally alphabetizing these all, but now I think it will be
  // better to group topically related fields.
  state: (): WWTEnginePiniaState => ({
    activeLayers: [],
    availableImagesets: [],
    backgroundImageset: null,
    clockDiscontinuities: 0,
    clockRate: 1.0,
    currentTime: new Date(),
    decRad: 0.0,
    foregroundImageset: null,
    foregroundOpacity: 100,
    imagesetLayers: {},
    isTourPlayerActive: false,
    isTourPlaying: false,
    raRad: 0.0,
    renderType: ImageSetType.sky,
    rollRad: 0,
    spreadSheetLayers: {},
    timeAtStartup: Date.now(),
    tourCompletions: 0,
    tourRunTime: null,
    tourStopStartTimes: [],
    tourTimecode: 0.0,
    showWebGl2Warning: false,
    zoomDeg: 0.0,
  }),

  getters: {
    lookupImageset(_state) {
      return (imagesetName: string) => {
        if (this.$wwt.inst === null)
          throw new Error('cannot lookupImageset without linking to WWTInstance');
        return this.$wwt.inst.ctl.getImagesetByName(imagesetName);
      }
    },

    findRADecForScreenPoint(_state) {
      return (pt: { x: number; y: number }): { ra: number; dec: number } => {
        if (this.$wwt.inst === null)
          throw new Error('cannot findRADecForScreenPoint without linking to WWTInstance');
        const coords = this.$wwt.inst.ctl.getCoordinatesForScreenPoint(pt.x, pt.y);
        return { ra: (15 * coords.x + 720) % 360, dec: coords.y };
      }
    },

    findScreenPointForRADec(_state) {
      return (pt: { ra: number; dec: number }): { x: number; y: number } => {
        if (this.$wwt.inst === null)
          throw new Error('cannot findScreenPointForRADec without linking to WWTInstance');
        return this.$wwt.inst.ctl.getScreenPointForCoordinates(pt.ra / 15, pt.dec);
      }
    },

    imagesetStateForLayer(state) {
      return (guidtext: string): ImageSetLayerState | null => {
        return state.imagesetLayers[guidtext] || null;
      }
    },

    activeImagesetLayerStates(): ImageSetLayerState[] {
      const states: ImageSetLayerState[] = [];

      for (const guid of this.activeLayers) {
        const layerState = this.imagesetLayers[guid];
        if (layerState) {
          states.push(layerState);
        }
      }

      return states;
    },

    catalogLayerKey(_state) {
      return (catalog: CatalogLayerInfo): string => {
        return catalog.id ?? "";
      }
    },

    imagesetForLayer(_state) {
      return (guidtext: string): Imageset | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get imagesetForLayer without linking to WWTInstance');

        const layer = this.$wwt.inst.lm.get_layerList()[guidtext];

        if (layer !== null && layer instanceof ImageSetLayer) {
          return layer.get_imageSet();
        } else {
          return null;
        }
      }
    },

    imagesetLayerById(_state) {
      return (id: string): ImageSetLayer | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get imagesetLayerById without linking to WWTInstance');
        const layer = this.layerById(id);
        if (layer !== null && layer instanceof ImageSetLayer) {
          return layer;
        } else {
          return null;
        }
      }
    },

    layerForHipsCatalog(_state) {
      return (name: string): SpreadSheetLayer | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get layerForHipsCatalog without linking to WWTInstance');

        const id = Guid.createFrom(name).toString();
        return this.spreadSheetLayerById(id);
      }
    },

    layerById(_state) {
      return (id: string): Layer | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get layerById without linking to WWTInstance');
        return this.$wwt.inst.lm.get_layerList()[id];
      }
    },

    spreadsheetStateForHipsCatalog(state) {
      return (name: string): SpreadSheetLayerSettingsInterfaceRO | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get spreadsheetStateForHipsCatalog without linking to WWTInstance');

        const id = Guid.createFrom(name).toString();
        return state.spreadSheetLayers[id] || null;
      }
    },

    spreadSheetLayerById(_state) {
      return (id: string): SpreadSheetLayer | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get spreadsheetLayerById without linking to WWTInstance');
        const layer = this.layerById(id);
        if (layer !== null && layer instanceof SpreadSheetLayer) {
          return layer;
        } else {
          return null;
        }
      }
    },

    spreadsheetStateById(state) {
      return (id: string): SpreadSheetLayerSettingsInterfaceRO | null => {
        return state.spreadSheetLayers[id] || null;
      }
    },

    spreadSheetLayer(_state) {
      return (catalog: CatalogLayerInfo): SpreadSheetLayer | null => {
        if (this.$wwt.inst === null)
          throw new Error('cannot get spreadSheetLayer without linking to WWTInstance');

        const key = this.catalogLayerKey(catalog);
        return this.spreadSheetLayerById(key);
      }
    },

    spreadsheetState(state) {
      return (catalog: CatalogLayerInfo): SpreadSheetLayerSettingsInterfaceRO | null => {
        const key = this.catalogLayerKey(catalog);
        return state.spreadSheetLayers[key] || null;
      }
    }

  },

  actions: {
    internalLinkToInstance(wwt: WWTInstance): void {
      this.$wwt.link(wwt);
    },

    internalUnlinkFromInstance(): void {
      this.$wwt.unlink();
    },

    internalUpdate(): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot internalUpdate without linking to WWTInstance');

      const wwt = this.$wwt.inst;

      const raRad = wwt.si.getRA() * H2R;
      if (this.raRad != raRad)
        this.raRad = raRad;

      const decRad = wwt.si.getDec() * D2R;
      if (this.decRad != decRad)
        this.decRad = decRad;

      const zoomDeg = wwt.ctl.renderContext.viewCamera.zoom;
      if (this.zoomDeg != zoomDeg)
        this.zoomDeg = zoomDeg;

      const rollRad = wwt.ctl.renderContext.viewCamera.rotation;
      if (this.rollRad != rollRad)
        this.rollRad = rollRad;

      const bg = wwt.ctl.renderContext.get_backgroundImageset() || null; // TEMP
      if (this.backgroundImageset != bg)
        this.backgroundImageset = bg;

      const time = wwt.stc.get_now();
      if (this.currentTime != time)
        this.currentTime = time;

      const fg = wwt.ctl.renderContext.get_foregroundImageset() || null; // TEMP
      if (this.foregroundImageset != fg)
        this.foregroundImageset = fg;

      if (this.foregroundOpacity != wwt.ctl.renderContext.viewCamera.opacity)
        this.foregroundOpacity = wwt.ctl.renderContext.viewCamera.opacity;

      if (this.renderType != wwt.ctl.renderType)
        this.renderType = wwt.ctl.renderType;

      const player = wwt.getActiveTourPlayer();
      this.tourTimecode = wwt.getEffectiveTourTimecode();

      if (player !== null) {
        this.isTourPlayerActive = true;
        this.isTourPlaying = wwt.getIsTourPlaying(player);
      } else {
        this.isTourPlayerActive = false;
        this.isTourPlaying = false;
      }

      const showWebGl2Warning = !wwt.si.isUsingWebGl2()
        && (Date.now() - this.timeAtStartup) < 15000;
      if (this.showWebGl2Warning != showWebGl2Warning) {
        this.showWebGl2Warning = showWebGl2Warning;
      }
    },

    internalIncrementTourCompletions(): void {
      this.tourCompletions += 1;
    },

    applySetting(setting: EngineSetting): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot applySetting without linking to WWTInstance');
      this.$wwt.inst.applySetting(setting);
    },

    setBackgroundImageByName(imagesetName: string): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setBackgroundImageByName without linking to WWTInstance');
      this.$wwt.inst.setBackgroundImageByName(imagesetName);
    },

    setForegroundImageByName(imagesetName: string): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setForegroundImageByName without linking to WWTInstance');
      this.$wwt.inst.setForegroundImageByName(imagesetName);
    },

    setForegroundOpacity(opacity: number): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setForegroundOpacity without linking to WWTInstance');
      this.$wwt.inst.setForegroundOpacity(opacity);
      this.foregroundOpacity = opacity;
    },

    setupForImageset(options: SetupForImagesetOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setupForImageset without linking to WWTInstance');
      this.$wwt.inst.setupForImageset(options);
    },

    zoom(factor: number): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot zoom without linking to WWTInstance');
      this.$wwt.inst.ctl.zoom(factor);
    },

    move(args: { x: number; y: number }): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot move without linking to WWTInstance');
      this.$wwt.inst.ctl.move(args.x, args.y);
    },

    tilt(args: { x: number; y: number }): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot tilt without linking to WWTInstance');
      this.$wwt.inst.ctl._tilt(args.x, args.y);
    },

    setTime(time: Date): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setTime without linking to WWTInstance');
      this.$wwt.inst.stc.set_now(time);
      this.clockDiscontinuities += 1;
    },

    setClockRate(rate: number): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setClockRate without linking to WWTInstance');

      if (this.$wwt.inst.stc.get_timeRate() != rate) {
        this.$wwt.inst.stc.set_timeRate(rate);
        this.clockRate = rate;
        this.clockDiscontinuities += 1;
      }
    },

    setClockSync(isSynced: boolean): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setClockSync without linking to WWTInstance');

      if (this.$wwt.inst.stc.get_syncToClock() != isSynced) {
        this.$wwt.inst.stc.set_syncToClock(isSynced);

        if (isSynced) {
          this.clockRate = this.$wwt.inst.stc.get_timeRate();
        } else {
          this.clockRate = 0;
        }

        this.clockDiscontinuities += 1;
      }
    },

    startTour(): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot start tour without linking to WWTInstance');

      const player = this.$wwt.inst.getActiveTourPlayer();
      if (player === null)
        throw new Error('no tour to start');

      player.play();
    },

    toggleTourPlayPauseState(): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot play/pause tour without linking to WWTInstance');

      const player = this.$wwt.inst.getActiveTourPlayer();
      if (player === null)
        throw new Error('no tour to play/pause');

      // Despite the unclear name, this function does toggle play/pause state.
      player.pauseTour();
    },

    setTourPlayerLeaveSettingsWhenStopped(value: boolean): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setTourPlayerLeaveSettingsWhenStopped without linking to WWTInstance');

      const player = this.$wwt.inst.getActiveTourPlayer();
      if (player === null)
        throw new Error('no tour player to control');

      player.set_leaveSettingsWhenStopped(value);
    },

    seekToTourTimecode(value: number): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot seekToTourTimecode without linking to WWTInstance');

      this.$wwt.inst.seekToTourTimecode(value);
    },

    async viewAsTourXml(name: string): Promise<string | null> {
      WWTControl.singleton.createTour(name || "");
      const editor = WWTControl.singleton.tourEdit;
      editor.addSlide(false);
      const tour = editor.get_tour();
      if (tour === null) {
        return Promise.resolve(null);
      }
      const blob = tour.saveToBlob();
      const reader = new FileReader();
      reader.readAsText(blob);

      let tourXml = "";
      return new Promise((resolve, _reject) => {
        reader.onloadend = () => {
          tourXml += reader.result;
          resolve(tourXml);
        }
      });
    },

    async waitForReady(): Promise<void> {
      if (this.$wwt.inst !== null) {
        return this.$wwt.inst.waitForReady();
      } else {
        return new Promise((resolve, _reject) => {
          const waitThenResolve = (): void => {
            (this.$wwt.inst as WWTInstance).waitForReady().then(resolve);
          };

          if (this.$wwt.inst !== null) {
            waitThenResolve();
          } else {
            this.$wwt.onLinkedCallbacks.push(waitThenResolve);
          }
        });
      }
    },

    async gotoRADecZoom(
      { raRad, decRad, zoomDeg, instant, rollRad }: GotoRADecZoomParams
    ): Promise<void> {
      if (this.$wwt.inst === null)
        throw new Error('cannot gotoRADecZoom without linking to WWTInstance');
      return this.$wwt.inst.gotoRADecZoom(raRad, decRad, zoomDeg, instant, rollRad);
    },

    timeToRADecZoom(
      { raRad, decRad, zoomDeg, rollRad }: TimeToRADecZoomParams
    ): number {
      if (this.$wwt.inst === null)
        throw new Error('cannot get timeToRADecZoom without linking to WWTInstance');
      return this.$wwt.inst.timeToRADecZoom(raRad, decRad, zoomDeg, rollRad);
    },

    async gotoTarget(options: GotoTargetOptions): Promise<void> {
      if (this.$wwt.inst === null)
        throw new Error('cannot gotoTarget without linking to WWTInstance');
      return this.$wwt.inst.gotoTarget(options);
    },

    setTrackedObject(obj: SolarSystemObjects): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setTrackedObject without linking to WWTInstance');
      this.$wwt.inst.ctl.renderContext.set_solarSystemTrack(obj);
    },

    async loadTour(
      { url, play }: LoadTourParams
    ) {
      if (this.$wwt.inst === null)
        throw new Error('cannot loadTour without linking to WWTInstance');

      if (play)
        await this.$wwt.inst.loadAndPlayTour(url);
      else
        await this.$wwt.inst.loadTour(url);

      let tourRunTime: number | null = null;
      const tourStopStartTimes: number[] = [];

      const player = this.$wwt.inst.getActiveTourPlayer();
      if (player !== null) {
        const tour = player.get_tour();
        if (tour !== null) {
          tourRunTime = tour.get_runTime() * 0.001; // ms => s
          const nStops = tour.get_tourStops().length;

          for (let i = 0; i < nStops; i++) {
            tourStopStartTimes.push(tour.elapsedTimeTillTourstop(i));
          }
        }
      }

      return { tourRunTime, tourStopStartTimes };
    },

    async loadImageCollection(
      { url, loadChildFolders }: LoadImageCollectionParams
    ): Promise<Folder> {
      if (this.$wwt.inst === null)
        throw new Error('cannot loadImageCollection without linking to WWTInstance');
      const result = await this.$wwt.inst.loadImageCollection(url, loadChildFolders);
      this.availableImagesets = availableImagesets();
      return result;
    },

    addImagesetToRepository(imgset: Imageset): Imageset {
      if (this.$wwt.inst === null)
        throw new Error('cannot addImagesetToRepository without linking to WWTInstance');

      return this.$wwt.inst.addImagesetToRepository(imgset);
    },

    // General layers

    deleteLayer(id: string | Guid): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot deleteLayer without linking to WWTInstance');

      let stringId = "";

      if (typeof id === "string") {
        stringId = id;
        const guid = Guid.fromString(id);
        this.$wwt.inst.lm.deleteLayerByID(guid, true, true);
      } else {
        stringId = id.toString();
        this.$wwt.inst.lm.deleteLayerByID(id, true, true);
      }

      // Mirror modification in the reactive system. Here we just
      // delete willy-nilly and ignore any missing cases.
      delete this.imagesetLayers[stringId];
      delete this.spreadSheetLayers[stringId];

      this.activeLayers = activeLayersList(this.$wwt);
    },

    // Imageset layers, including FITS layers

    async addImageSetLayer(
      options: AddImageSetLayerOptions
    ): Promise<ImageSetLayer> {
      if (this.$wwt.inst === null)
        throw new Error('cannot addImageSetLayer without linking to WWTInstance');

      // Mirror the layer state into the reactivity system.
      const wwtLayer = await this.$wwt.inst.addImageSetLayer(options);
      const guidText = wwtLayer.id.toString();
      this.imagesetLayers[guidText] = new ImageSetLayerState(wwtLayer);

      this.activeLayers = activeLayersList(this.$wwt);
      return wwtLayer;
    },

    // deprecated, but maintained for compatibility:
    async loadFitsLayer(
      options: LoadFitsLayerOptions
    ): Promise<ImageSetLayer> {
      if (this.$wwt.inst === null)
        throw new Error('cannot loadFitsLayer without linking to WWTInstance');

      const addImageSetLayerOptions: AddImageSetLayerOptions = {
        url: options.url,
        mode: "fits",
        name: options.name,
        goto: options.gotoTarget
      };

      return this.$wwt.inst.addImageSetLayer(addImageSetLayerOptions);
    },

    setImageSetLayerOrder(options: SetLayerOrderOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setImageSetLayerOrder without linking to WWTInstance');

      this.$wwt.inst.setImageSetLayerOrder(options);
      this.activeLayers = activeLayersList(this.$wwt);
    },

    stretchFitsLayer(options: StretchFitsLayerOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot stretchFitsLayer without linking to WWTInstance');

      this.$wwt.inst.stretchFitsLayer(options);

      // Update the reactive mirror.
      const state = this.imagesetLayers[options.id];
      if (state) {
        state.scaleType = options.stretch;
        state.vmin = options.vmin;
        state.vmax = options.vmax;
      }
    },

    setFitsLayerColormap(options: SetFitsLayerColormapOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot setFitsLayerColormap without linking to WWTInstance');

      this.$wwt.inst.setFitsLayerColormap(options);

      // Update the reactive mirror.
      const state = this.imagesetLayers[options.id];
      if (state) {
        state.colormapName = options.name;
      }
    },

    applyFitsLayerSettings(options: ApplyFitsLayerSettingsOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot applyFitsLayerSettings without linking to WWTInstance');

      this.$wwt.inst.applyFitsLayerSettings(options);

      // Update the reactive mirror.
      const state = this.imagesetLayers[options.id];
      if (state) {
        for (const s of options.settings) {
          applyImageSetLayerSetting(state.settings, s);
        }
      }
    },

    // Spreadsheet layers

    async createTableLayer(
      options: CreateTableLayerParams
    ): Promise<SpreadSheetLayer> {
      if (this.$wwt.inst === null)
        throw new Error('cannot createTableLayer without linking to WWTInstance');

      const layer = this.$wwt.inst.lm.createSpreadsheetLayer(
        options.referenceFrame,
        options.name,
        options.dataCsv
      );

      // Value-add init copied from the pywwt JS component.
      // Override any column guesses:
      layer.set_lngColumn(-1);
      layer.set_latColumn(-1);
      layer.set_altColumn(-1);
      layer.set_sizeColumn(-1);
      layer.set_colorMapColumn(-1);
      layer.set_startDateColumn(-1);
      layer.set_endDateColumn(-1);
      layer.set_xAxisColumn(-1);
      layer.set_yAxisColumn(-1);
      layer.set_zAxisColumn(-1);

      layer.set_altUnit(AltUnits.meters);
      layer.set_referenceFrame(options.referenceFrame);

      if (options.referenceFrame == 'Sky') {
        layer.set_astronomical(true);
      }

      // Currently, table creation is synchronous, but treat it as async
      // in case our API needs to get more sophisticated later.
      const prom = Promise.resolve(layer);

      // Mirror the layer state into the reactivity system.
      const wwtLayer = await prom;
      const guidText = wwtLayer.id.toString();
      this.spreadSheetLayers[guidText] = new SpreadSheetLayerState(wwtLayer);

      this.activeLayers = activeLayersList(this.$wwt);
      return wwtLayer;
    },

    applyTableLayerSettings(options: ApplyTableLayerSettingsOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot applyTableLayerSettings without linking to WWTInstance');

      this.$wwt.inst.applyTableLayerSettings(options);

      // Mirror changes in the reactive framework.
      const state = this.spreadSheetLayers[options.id];

      if (state !== undefined) {
        for (const s of options.settings) {
          applySpreadSheetLayerSetting(state, s);
        }
      }
    },

    updateTableLayer(options: UpdateTableLayerOptions): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot updateTableLayer without linking to WWTInstance');
      this.$wwt.inst.updateTableLayer(options);

      // Nothing to mirror in reactive-land -- this call affects the table data.
    },

    // Progressive HiPS catalogs.
    //
    // These have some characteristics of imagesets, and some characteristics
    // of spreadsheet layers.
    async addCatalogHipsByName(options: AddCatalogHipsByNameOptions): Promise<Imageset> {
      if (this.$wwt.inst == null)
        throw new Error('cannot addCatalogHipsByName without linking to WWTInstance');

      const imgset = await this.$wwt.inst.addCatalogHipsByName(options);

      // Mirror the spreadsheet layer aspect into the reactivity system.

      const hips = imgset.get_hipsProperties();

      if (hips !== null) {
        const wwtLayer = hips.get_catalogSpreadSheetLayer();
        const guidText = wwtLayer.id.toString();
        this.spreadSheetLayers[guidText] = new SpreadSheetLayerState(wwtLayer);
        const info = availableImagesets().find(x => x.name === options.name);
        if (info !== undefined) {
          info.id = guidText;
        }
      }

      this.activeLayers = activeLayersList(this.$wwt);
      return imgset;
    },

    getCatalogHipsDataInView(options: GetCatalogHipsDataInViewOptions): Promise<InViewReturnMessage> {
      if (this.$wwt.inst == null)
        throw new Error('cannot getCatalogHipsDataInView without linking to WWTInstance');
      return this.$wwt.inst.getCatalogHipsDataInView(options);
    },

    removeCatalogHipsByName(name: string): void {
      if (this.$wwt.inst == null)
        throw new Error('cannot removeCatalogHipsByName without linking to WWTInstance');

      this.$wwt.inst.ctl.removeCatalogHipsByName(name);

      const id = Guid.createFrom(name).toString();
      delete this.spreadSheetLayers[id];

      this.activeLayers = activeLayersList(this.$wwt);
    },

    // Annotations

    addAnnotation(ann: Annotation): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot addAnnotation without linking to WWTInstance');
      this.$wwt.inst.si.addAnnotation(ann);
    },

    removeAnnotation(ann: Annotation): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot removeAnnotation without linking to WWTInstance');
      this.$wwt.inst.si.removeAnnotation(ann);
    },

    clearAnnotations(): void {
      if (this.$wwt.inst === null)
        throw new Error('cannot clearAnnotations without linking to WWTInstance');
      this.$wwt.inst.si.clearAnnotations();
    },

    // Capturing the current display

    captureFrame(options: CaptureFrameOptions): Promise<Blob | null> {
      if (this.$wwt.inst === null)
        throw new Error('cannot captureThumbnail without linking to WWTInstance');
      return this.$wwt.inst.captureFrame(options);
    },

    // Capturing a video as a readable stream

    captureVideo(options: CaptureVideoOptions): ReadableStream<Blob | null> {
      if (this.$wwt.inst === null)
        throw new Error("cannot captureVideo without linking to WWTInstance");
      return this.$wwt.inst.captureVideo(options);
    }
  },
});
