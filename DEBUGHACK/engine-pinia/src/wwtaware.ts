// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { engineStore } from "./store";

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
export const WWTAwareComponent = defineComponent({
  props: {
    /** The namespace of the Pinia module used to track the WWT component’s state.
     * This prop should have the same value in all components in the app that
     * reference WWT.
     */
    wwtNamespace: { type: String, default: "wwt", required: true },
    wwtFreestandingAssetBaseurl: String,
  },

  computed: {
    ...mapState(engineStore, {

      /** The GUIDs of all rendered layers, in their draw order.
       *
       * This list gives the GUIDs of the layers that are currently candidates for
       * rendering. This list is determined by the hierarchy of "layer maps"
       * registered with the engine and its current rendering mode. Layers in this
       * list might not be actually rendered if their `enabled` flag is false, if
       * they are fully transparent, and so on.
       **/
      wwtActiveLayers: 'activeLayers',

      /** Information about the imagesets that are available to be used as a background.
         *
         * The info includes the name, which can then be used to set the background image
         * via the [[setBackgroundImageByName]] mutation.
         */
      wwtAvailableImagesets: 'availableImagesets',

      /** The current background [Imageset](../../engine/classes/imageset.html), or
       * null if it is undefined.
       *
       * You can cause this state variable to change using the
       * [[setBackgroundImageByName]] mutation.
       * **/
      wwtBackgroundImageset: 'backgroundImageset',

      /** The current time of WWT internal clock. In normal operation this variable
       * will change with every rendered WWT frame, or every 30 ms or so.
       */
      wwtCurrentTime: 'currentTime',

      /** The number of times that the progression of the WWT internal clock has
       * been changed discontinuously.
       *
       * The main use of this state variable is that you can
       * [watch](https://vuejs.org/api/reactivity-core.html#watch) for changes to it and be alerted
       * when the clock has been altered. */
      wwtClockDiscontinuities: 'clockDiscontinuities',

      /** The rate at which the WWT internal clock progresses compared to real time.
       * If the WWT clock is paused, this will be zero. Negative and fractional
       * values are both possible. */
      wwtClockRate: 'clockRate',

      /** The current declination of the center of the WWT view, in radians.
       *
       * TODO: define the meaning here for view modes other than "sky."
       */
      wwtDecRad: 'decRad',

      /** The current foreground [Imageset](../../engine/classes/imageset.html), or
       * null if it is undefined.
       *
       * You can cause this state variable to change using the
       * [[setForegroundImageByName]] mutation.
       * **/
      wwtForegroundImageset: 'foregroundImageset',

      /** The opacity of the foreground imageset. Values range between 0 (invisible)
        * and 100 (fully opaque). */
      wwtForegroundOpacity: 'foregroundOpacity',

      /** A table of activated imageset layers.
       *
       * Use [[imagesetStateForLayer]] to access information about a particular
       * layer.
       */
      wwtImagesetLayers: 'imagesetLayers',

      /** Whether a tour has been loaded up and is available for playback. */
      wwtIsTourPlayerActive: 'isTourPlayerActive',

      /** Whether a tour is actively playing back right now. This can spontaneously become
        * false if the tour completes playing. */
      wwtIsTourPlaying: 'isTourPlaying',

      /** The current right ascension of the center of the WWT view, in radians.
       *
       * TODO: define the meaning here for view modes other than "sky."
       */
      wwtRARad: 'raRad',

      /** The current mode of the WWT renderer.
       *
       * This is derived from the "type" of the active background imageset. To
       * change the mode, change the background imageset with
       * [[setBackgroundImageByName]].
       */
      wwtRenderType: 'renderType',

      /** The current roll of the view camera, in radians */
      wwtRollRad: 'rollRad',

      /** Whether or not to show a warning about recommending WebGL 2 */
      wwtShowWebGl2Warning: 'showWebGl2Warning',

      /** A table of activated imageset layers.
       *
       * Use [[imagesetStateForLayer]] to access information about a particular
       * layer.
       */
      wwtSpreadSheetLayers: 'spreadSheetLayers',

      /** The number of times that a WWT tour has completed playing.
       *
       * The main use of this state variable is that you can
       * [watch](https://vuejs.org/api/reactivity-core.html#watch) for changes to it and be alerted
       * when a tour finishes. Watching [[wwtIsTourPlaying]] doesn't suffice because
       * that will trigger when a tour is paused. */
      wwtTourCompletions: 'tourCompletions',

      /** The total runtime of the current tour, in seconds, if there is one. */
      wwtTourRunTime: 'tourRunTime',

      /** The timecodes at which the current tour’s "stops" begin, in seconds.
       *
       * Each WWT tour is composed of one or more "stops", each of which has a fixed
       * wall-clock duration. This variable gives the start times of the stops under
       * the assumption that they all follow one another in sequence. It is possible
       * to have nonlinear flow from one stop to the next.
       *
       * If no tour is loaded, this is an empty array.
       */
      wwtTourStopStartTimes: 'tourStopStartTimes',

      /** The "timecode" of the current tour playback progression.
       *
       * The "timecode" is approximately the number of seconds elapsed since tour
       * playback began. More precisely, however, it is the start time of the
       * current tour stop, plus however much wall-clock time has elapsed while at
       * that stop. Because it is possible for stops to link to each other
       * non-linearly, it is also possible for the timecode to progress non-linearly
       * even when the tour plays back without user interaction.
       *
       * In combination with [[wwtTourStopStartTimes]], you can use this value to
       * determine the index number of the currently active tour stop.
       *
       * If no tour is loaded, this is zero.
       */
      wwtTourTimecode: 'tourTimecode',

      /** The WWT zoom level, in degrees.
       *
       * TODO: define the semantics here in 3D and other modes.
       *
       * In 2D sky mode, the zoom level is the angular height of the viewport,
       * *times six*.
       */
      wwtZoomDeg: 'zoomDeg',
    }),

    ...mapState(engineStore, [
      /** Get the reactive state for the active imageset layers
       *
       * These layers are created using the [[addImageSetLayer]] action. The state
       * structures returned by this function are part of the reactive store, so
       * you can wire them up to your UI and they will update correctly. The list is
       * returned in the engine's render order.
       *
       * @returns The layer states
       */
      "activeImagesetLayerStates",

      /** Get the right ascension and declination, in degrees, for x, y coordinates on the screen */
      "findRADecForScreenPoint",

      /** Given an RA and Dec position, return the x, y coordinates of the screen point */
      "findScreenPointForRADec",

      /** Look up the WWT engine object for an active imageset layer.
       *
       * This getter gets the WWT `Imageset` object associated with an imageset
       * layer. The returned object is *not* part of the Vue(x) reactivity system,
       * so you shouldn't use it to set up UI elements, but you can obtain more
       * detailed information about the imageset than is stored in the state
       * management system. For UI purposes, use [[imagesetStateForLayer]].
       *
       * @param guidtext The GUID of the layer to query, as a string
       * @returns The layer's underlying imageset, or null if the GUID is
       * unrecognized
       */
      "imagesetForLayer",

      /** Look up the reactive state for an active imageset layer.
       *
       * These layers are created using the [[addImageSetLayer]] action. The state
       * returned by this function is part of the reactive store, so you can
       * wire it up to your UI and it will update as the layer settings are changed.
       * If you need "runtime" state not captured in the reactivity system, you may
       * need to use [[imagesetForLayer]] instead.
       *
       * @param guidtext The GUID of the layer to query, as a string
       * @returns The layer state, or null if the GUID is unrecognized
       */
      "imagesetStateForLayer",

      /** Get the actual WWT `SpreadSheetLayer` for the named HiPS catalog.
       *
       * Do not use this function for UI purposes -- the WWT layer object is not
       * integrated into the reactive state system, and so if you use it as a basis
       * for UI elements, those elements will not be updated properly if/when the
       * layer's settings change. Use [[spreadsheetStateForHipsCatalog]] instead.
       *
       * @param name The `datasetName` of the HiPS catalog
       */
      "layerForHipsCatalog",

      /** Look up an [Imageset](../../engine/classes/imageset.html) in the engine’s
       * table of ones with registered names.
       *
       * This delegates to
       * [WWTControl.getImagesetByName()](../../engine/wwtcontrol.html#getimagesetbyname),
       * which has very eager name-matching rules. But if nothing matches, null is
       * returned.
       *
       * Imagesets are not added to the engine’s list of names automatically. In
       * order for an imageset to be findable by this function, its containing
       * folder must have been loaded using the [[loadImageCollection]] action.
       */
      "lookupImageset",

      /** Get the actual WWT `SpreadSheetLayer` for the table layer with the given ID.
       *
       * Do not use this function for UI purposes -- the WWT layer object is not
       * integrated into the reactive state system, and so if you use it as a basis
       * for UI elements, those elements will not be updated properly if/when the
       * layer's settings change. Use [[spreadsheetState]] instead.
       *
       * @param id The table layer's identifier.
       */
      "spreadSheetLayerById",

      /** Get the actual WWT `SpreadSheetLayer` for the table layer corresponding
       * to the given CatalogLayerInfo.
       *
       * Do not use this function for UI purposes -- the WWT layer object is not
       * integrated into the reactive state system, and so if you use it as a basis
       * for UI elements, those elements will not be updated properly if/when the
       * layer's settings change. Use [[spreadsheetState]] instead.
       *
       * @param id The table layer's identifier.
       */
      "spreadSheetLayer",

      /** Get reactive `SpreadSheetLayer` settings for the table layer corresponding to
       * the given CatalogLayerInfo.
       *
       * The returned data structure is a component of the app's reactive state. You can
       * therefore use the settings to construct UI elements, and they will update
       * reactively as the state evolves. The actual data structures used by WWT are
       * separate, but the two mirror each other.
       *
       * @param catalog A CatalogLayerInfo object corresponding to the layer.
       */
      "spreadsheetState",

      /** Get reactive `SpreadSheetLayer` settings for the table layer with the given ID.
       *
       * The returned data structure is a component of the app's reactive state. You can
       * therefore use the settings to construct UI elements, and they will update
       * reactively as the state evolves. The actual data structures used by WWT are
       * separate, but the two mirror each other.
       *
       * @param id The identifier of the table layer.
       */
      "spreadsheetStateById",

      /** Get reactive `SpreadSheetLayer` settings for the named HiPS catalog.
       *
       * The returned data structure is a component of the app's reactive state. You can
       * therefore use the settings to construct UI elements, and they will update
       * reactively as the state evolves. The actual data structures used by WWT are
       * separate, but the two mirror each other.
       *
       * @param name The `datasetName` of the HiPS catalog
       */
      "spreadsheetStateForHipsCatalog",
    ]),
  },

  methods: {
    ...mapActions(engineStore, [

      /** Add a "catalog HiPS" dataset to the current view, by name.
       *
       * If the catalog name is not in the engine's registry, the promise rejects.
       */
      "addCatalogHipsByName",

      /** Request the creation of a tabular data layer.
       *
       * The action resolves to a new [SpreadSheetLayer](../../engine/classes/spreadsheetlayer.html) instance.
       */
      "createTableLayer",

      /** Request an export of the catalog HiPS data within the current viewport. */
      "getCatalogHipsDataInView",

      /** Command the view to steer to a specific configuration.
       *
       * The async action completes when the view arrives, or when
       * a subsequent view command overrides this one.
       *
       * TODO: document semantics when not in 2D sky mode!
       */
      "gotoRADecZoom",

      /** Returns the time it would take, in seconds, to navigate to the given target. */
      "timeToRADecZoom",

      /** Command the view to steer as specified in
       * [the options](../../engine-helpers/interfaces/gototargetoptions.html).
       *
       * The async action completes when the view arrives, or when
       * a subsequent view command overrides this one.
       */
      "gotoTarget",

      /** Request the engine to load the specified image collection.
       *
       * The image collection is a [WTML file](https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/)
       * Images in collections loaded this way become usable for name-based lookup
       * by interfaces such as [[setForegroundImageByName]].
       *
       * The action resolves to a [Folder](../../engine/classes/folder.html) instance.
       * It’s asynchronous because the specified WTML file has to be downloaded.
       */
      "loadImageCollection",

      /** Add an imageset directly into the engine's database.
       *
       * If an imageset with the same URL has already been loaded, this is a
       * no-op.
       *
       * This returns the imageset that ultimately resides in the engine's
       * database. It could either be the input argument, if it was newly added,
       * or a pre-existing imageset in the no-op condition.
       */
      "addImagesetToRepository",

      /** Deprecated. Use addImageSetLayer instead.
       * Request the creation of a FITS image layer.
       *
       * The action resolves to a new [ImageSetLayer](../../engine/classes/imagesetlayer.html) instance.
       * It’s asynchronous because the requested FITS file has to be downloaded.
       */
      "loadFitsLayer",

      /** Request the creation of a image layer. Either a single FITS or an image set.
       *
       * The action resolves to a new [ImageSetLayer](../../engine/classes/imagesetlayer.html) instance.
       * It’s asynchronous because the requested url has to be downloaded.
       */
      "addImageSetLayer",


      /** Request the engine to load a tour file.
       *
       * The action resolves when the load is complete. It’s asynchronous because
       * the full WTT tour file has to be downloaded.
      */
      "loadTour",

      /** Get the current view as a one-slide tour, serialized to XML */
      "viewAsTourXml",

      /** Wait for the WWT engine to become ready for usage.
       *
       * You should invoke this action and wait for is completion before trying to
       * do anything else with a WWT-aware component. The action resolves when the
       * WWT engine has completed its initialization, which involes the download of
       * some supporting data files.
       */
      "waitForReady",

      // Formerly mutations
      // TODO: Alphabetize this into one big list

      /** Add an [Annotation](../../engine/classes/annotation.html) to the view. */
      "addAnnotation",

      /** Alter one or more settings of the specified FITS image layer as specified
       * in [the options](../../engine-helpers/interfaces/applyfitslayersettingsoptions.html).
       */
      "applyFitsLayerSettings",

      /** Alter one or more settings of the specified tabular data layers as specified
       * in [the options](../../engine-helpers/interfaces/applytablelayersettingsoptions.html).
       */
      "applyTableLayerSettings",

      /** Alter one [WWT engine setting](../../engine/modules.html#enginesetting). */
      "applySetting",

      /** Capture the current frame as an image `Blob` with the desired width, height, and format.
       * The first argument is a callback function to execute on the created `Blob`. */
      'captureFrame',

      /** Capture a video as a stream of image `Blob`s with the desired width, height and format.
       * The number of frames per second and total frame count are specified as well. */
      'captureVideo',

      /** Clear all [Annotations](../../engine/classes/annotation.html) from the view. */
      "clearAnnotations",

      /** Delete the specified layer from the layer manager.
       *
       * A layer may be identified by either its name or its [id](../../engine/classes/layer.html#id).
       */
      "deleteLayer",

      /** Remove the specified [Annotation](../../engine/classes/annotation.html) from the view. */
      "removeAnnotation",

      /** Remove a "catalog HiPS" dataset to the current view, by name. */
      "removeCatalogHipsByName",

      /** Seek tour playback to the specified timecode.
       *
       * See [[wwtTourTimecode]] for a definition of the tour timecode.
       *
       * An important limitation is that the engine can only seek to the very
       * beginning of a tour stop. If you request a timecode in the middle of a
       * slide, the seek will actually occur to the start time of that slide.
       */
      "seekToTourTimecode",

      /** Set the current background [Imageset](../../engine/classes/imageset.html)
       * based on its name.
       *
       * The name lookup here is effectively done using [[lookupImageset]]. If
       * the name is not found, the current background imageset remains unchanged.
       *
       * Changing the background imageset may change the value of [[wwtRenderType]],
       * and the overall "mode" of the WWT renderer.
       */
      "setBackgroundImageByName",

      /** Set the rate at which the WWT clock progresses compared to wall-clock time.
       *
       * A value of 10 means that the WWT clock progresses ten times faster than
       * real time. A value of -0.1 means that the WWT clock moves backwards, ten
       * times slower than real time.
       *
       * Altering this causes an increment in [[wwtClockDiscontinuities]].
       */
      "setClockRate",

      /** Set whether the WWT clock should progress with real time.
       *
       * See
       * [SpaceTimeController.set_syncToClock()](../../engine/modules/spacetimecontroller.html#set_synctoclock).
       * This interface effectively allows you to pause the WWT clock.
       *
       * Altering this causes an increment in [[wwtClockDiscontinuities]].
       */
      "setClockSync",

      /** Set the colormap used for a FITS image layer according to
       * [the options](../../engine-helpers/interfaces/setfitslayercolormapoptions.html).
       */
      "setFitsLayerColormap",

      /** Set the current foreground [Imageset](../../engine/classes/imageset.html)
       * based on its name.
       *
       * The name lookup here is effectively done using [[lookupImageset]]. If
       * the name is not found, the current foreground imageset remains unchanged.
       */
      "setForegroundImageByName",

      /** Set the opacity of the foreground imageset.
       *
       * Valid values are between 0 (invisible) and 100 (fully opaque).
       */
      "setForegroundOpacity",

      /** Change the [ImageSetLayer](../../engine/classes/imagesetlayer.html)
       * position in the draw cycle.
       */
      "setImageSetLayerOrder",

      /** Set whether the renderer settings of tours should remain applied after
       * those tours finish playing back.
       *
       * This specialized option helps avoid jarring visual effects when tours
       * finish playing. If a tour activates a renderer option like "local horizon
       * mode", by default that option will turn off when the tour finishes, causing
       * the view to suddenly change. If this option is set to True, that setting
       * will remain active, preventing the sudden change.
       */
      "setTourPlayerLeaveSettingsWhenStopped",

      /** Set the current time of WWT's internal clock.
       *
       * Altering this causes an increment in [[wwtClockDiscontinuities]].
       */
      "setTime",

      /** Set the "tracked object" in the 3D solar system view.
       *
       * Allowed values are
       * [defined in @wwtelescope/engine-types](../../engine-types/enums/solarsystemobjects.html).
       */
      "setTrackedObject",

      /** Set up the background and foreground imagesets according to
       * [the options](../../engine-helpers/interfaces/setupforimagesetoptions.html)
       *
       * The main use of this interface is that it provides a mechanism to guess
       * the appropriate background imageset given a foreground imageset that you
       * want to show.
       */
      "setupForImageset",

      /** Start playback of the currently loaded tour.
       *
       * Nothing happens if no tour is loaded.
       */
      "startTour",

      /** Alter the "stretch" of a FITS image layer according to
       * [the options](../../engine-helpers/interfaces/stretchfitslayeroptions.html).
       */
      "stretchFitsLayer",

      /** Toggle the play/pause state of the current tour.
       *
       * Nothing happens if no tour is loaded.
       */
      "toggleTourPlayPauseState",

      /** Update the contents of a tabular data layer according to
       * [the options](../../engine-helpers/interfaces/updatetablelayeroptions.html).
       */
      "updateTableLayer",

      //"updateAvailableImagesets",

      /** Set the zoom level of the view.
       *
       * This action may result in an action that takes a perceptible amount of
       * time to resolve, if the "smooth pan" renderer option is enabled. To have
       * proper asynchronous feedback about when the zoom operation completes, use
       * [[gotoRADecZoom]].
       */
      "zoom",

      /** Moves the position of the view */
      "move",

      /** Tilts the position of the view */
      "tilt",
    ]),
  }

});
