<template>
  <div id="app">
    <WorldWideTelescope
      :wwt-namespace="wwtComponentNamespace"
      :class="['wwt', { pointer: lastClosePt !== null }]"
      @pointermove="wwtOnPointerMove"
      @pointerup="wwtOnPointerUp"
      @pointerdown="wwtOnPointerDown"
    ></WorldWideTelescope>

    <!-- keydown.stops here and below prevent any keynav presses from reaching
      the toplevel UI handlers -->
    <div id="ui-elements">
      <div class="element-box" id="display-panel-box">
        <div id="display-panel" v-if="!hideAllChrome" @keydown.stop>
          <transition name="catalog-transition">
            <div id="overlays">
              <p>{{ coordText }}</p>
            </div>
          </transition>
          <div id="imagery-container" v-if="haveImagery">
            <div class="display-section-header">
              <label>Imagery</label>
            </div>
            <imageset-item
              v-for="imageset of activeImagesetLayerStates"
              v-bind:key="imageset.guidText"
              v-bind:imageset="imageset"
            />
          </div>
          <div id="spreadsheets-container" v-if="haveTableLayers">
            <div class="display-section-header">
              <label>Data Tables</label>
            </div>
            <spreadsheet-item
              v-for="layer of spreadsheetLayers"
              v-bind:key="layer.name"
              v-bind:layer="layer"
              v-bind:defaultColor="defaultColor"
            />
          </div>
          <div id="sources-container" v-if="haveSources">
            <div class="display-section-header">
              <label>Sources</label>
            </div>
            <source-item
              v-for="source of sources"
              v-bind:key="source.name"
              v-bind:source="source"
            />
          </div>
        </div>
      </div>

      <div class="element-box" id="tools-box" v-if="!hideAllChrome">
        <div id="tools" v-if="!hideAllChrome" @keydown.stop>
          <div class="tool-container">
            <template v-if="currentTool == 'crossfade'">
              <span>Foreground opacity:</span>
              <input
                class="opacity-range"
                type="range"
                v-model="foregroundOpacity"
              />
            </template>

            <template v-else-if="currentTool == 'choose-background'">
              <div id="bg-select-container" class="item-select-container">
                <span id="bg-select-title" class="item-select-title"
                  >Background imagery:</span
                >
                <v-select
                  v-model="curBackgroundImagesetName"
                  id="bg-select"
                  class="item-selector"
                  :searchable="true"
                  :clearable="false"
                  :options="curAvailableImagesets"
                  :filter="filterImagesets"
                  :close-on-select="true"
                  :reduce="(bg) => bg.name"
                  :getOptionKey="JSON.stringify"
                  label="name"
                  placeholder="Background"
                >
                  <template #option="option">
                    <div class="item-option">
                      <h4 class="ellipsize">{{ option.name }}</h4>
                      <p class="ellipsize">
                        <em>{{ option.description }}</em>
                      </p>
                    </div>
                  </template>
                  <template #selected-option="option">
                    <div class="ellipsize">{{ option.name }}</div>
                  </template>
                </v-select>
              </div>
            </template>

            <template v-else-if="currentTool == 'add-imagery-layer'">
              <div class="item-select-container">
                <span class="item-select-title">Add imagery layer:</span>
                <v-select
                  class="item-selector"
                  :searchable="true"
                  :clearable="false"
                  :options="curAvailableImageryData"
                  :filter="filterImagesets"
                  :getOptionKey="JSON.stringify"
                  @update:modelValue="addImagery"
                  label="name"
                  placeholder=""
                >
                  <template #option="option">
                    <div class="item-option">
                      <h4 class="ellipsize">{{ option.name }}</h4>
                      <p class="ellipsize">
                        <em>{{ option.description }}</em>
                      </p>
                    </div>
                  </template>
                  <template #selected-option="option">
                    <div class="ellipsize">{{ option.name }}</div>
                  </template>
                  <template #no-options="{ search, searching }">
                    <template v-if="searching">
                      No datasets matching <em>{{ search }}</em
                      >.
                    </template>
                    <em v-else
                      >No datasets available. Load a WTML collection?</em
                    >
                  </template>
                </v-select>
              </div>
            </template>

            <template v-else-if="showCatalogChooser">
              <div
                id="catalog-select-container-tool"
                class="item-select-container"
              >
                <span class="item-select-title">Add catalog:</span>
                <v-select
                  id="catalog-select-tool"
                  class="item-selector"
                  :searchable="true"
                  :clearable="false"
                  :options="curAvailableCatalogs"
                  :filter="filterCatalogs"
                  @update:modelValue="addHips"
                  label="name"
                  placeholder=""
                >
                  <template #option="option">
                    <div class="item-option">
                      <h4 class="ellipsize">{{ option.name }}</h4>
                      <p class="ellipsize">
                        <em>{{ option.description }}</em>
                      </p>
                    </div>
                  </template>
                  <template #selected-option-container="{}">
                    <div></div>
                  </template>
                </v-select>
              </div>
            </template>

            <template v-else-if="currentTool == 'load-collection'">
              <div class="load-collection-container">
                <div class="load-collection-label">
                  Load
                  <a
                    href="https://docs.worldwidetelescope.org/data-guide/1/data-file-formats/collections/"
                    target="_blank"
                    >WTML</a
                  >
                  data collection:
                </div>
                <div class="load-collection-row">
                  <label>URL:</label>
                  <input
                    type="url"
                    v-model="wtmlCollectionUrl"
                    @keyup.enter="submitWtmlCollectionUrl"
                  />
                  <font-awesome-icon
                    icon="arrow-circle-right"
                    size="lg"
                    class="load-collection-icon"
                    @keyup.enter="submitWtmlCollectionUrl"
                    @click="submitWtmlCollectionUrl"
                    tabindex="0"
                  ></font-awesome-icon>
                </div>
              </div>
            </template>

            <template v-else-if="currentTool == 'save-state'">
              <div class="save-state-container">
                <label class="save-state-title"
                  >The current view can be restored using:</label
                >
                <div class="save-state-content">
                  <span class="save-state-url">
                    {{ this.stateAsUrl() }}
                  </span>
                  <font-awesome-icon
                    icon="copy"
                    size="lg"
                    class="pointer"
                    @click="copyStateURL"
                    @keyup.enter="copyStateURL"
                    tabindex="0"
                  ></font-awesome-icon>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="element-box" id="controls-box">
        <ul id="controls" v-if="!hideAllChrome" @keydown.stop>
          <li v-show="showToolMenu">
            <Popper
              placement="left"
              :arrow="true"
              :interactive="true"
            >
              <font-awesome-icon
                class="tooltip-target tooltip-icon"
                icon="sliders-h"
                size="lg"
                tabindex="0"
              ></font-awesome-icon>
              <template #content="props">
                <ul class="tooltip-content tool-menu" tabindex="-1">
                  <li v-show="showBackgroundChooser">
                    <a
                      href="#"
                      @click="
                        selectTool('choose-background');
                        props.close();
                      "
                      tabindex="0"
                      ><font-awesome-icon icon="mountain" /> Choose
                      background</a
                    >
                  </li>
                  <li v-show="showAddImageryTool">
                    <a
                      href="#"
                      @click="
                        selectTool('add-imagery-layer');
                        props.close();
                      "
                      tabindex="0"
                      ><font-awesome-icon icon="image" /> Add imagery as
                      layer</a
                    >
                  </li>
                  <li v-show="showCatalogTool">
                    <a
                      href="#"
                      @click="
                        selectTool('choose-catalog');
                        props.close();
                      "
                      tabindex="0"
                      ><font-awesome-icon icon="map-marked-alt" /> Add HiPS
                      catalogs</a
                    >
                  </li>
                  <li v-show="showCollectionLoader">
                    <a
                      href="#"
                      @click="
                        selectTool('load-collection');
                        props.close();
                      "
                      tabindex="0"
                      ><font-awesome-icon icon="photo-video" /> Load WTML
                      collection</a
                    >
                  </li>
                  <li>
                    <a
                      href="#"
                      @click="
                        selectTool('save-state');
                        props.close();
                      "
                      tabindex="0"
                      ><font-awesome-icon icon="save" /> Create link to current
                      view</a
                    >
                  </li>
                </ul>
              </template>
            </Popper>
          </li>
          <li v-show="!wwtIsTourPlaying">
            <font-awesome-icon
              icon="search-plus"
              size="lg"
              class="tooltip-icon"
              @keyup.enter="doZoom(true)"
              @click="doZoom(true)"
              tabindex="0"
            ></font-awesome-icon>
          </li>
          <li v-show="!wwtIsTourPlaying">
            <font-awesome-icon
              icon="search-minus"
              size="lg"
              class="tooltip-icon"
              @keyup.enter="doZoom(false)"
              @click="doZoom(false)"
              tabindex="0"
            ></font-awesome-icon>
          </li>
          <li v-show="fullscreenAvailable">
            <font-awesome-icon
              v-bind:icon="fullscreenModeActive ? 'compress' : 'expand'"
              size="lg"
              class="nudgeright1 tooltip-icon"
              @keyup.enter="toggleFullscreen()"
              @click="toggleFullscreen()"
              tabindex="0"
            ></font-awesome-icon>
          </li>
        </ul>
      </div>
    </div>

    <notifications group="load-collection" position="top right" />
    <notifications group="copy-url" position="top right" />

    <div
      id="webgl2-popup"
      v-show="wwtShowWebGl2Warning"
      v-if="!hideAllChrome"
      @keydown.stop
    >
      To get the full AAS WWT experience, consider using the latest version of
      Chrome, Firefox or Edge. In case you would like to use Safari, we
      recommend that you
      <a href="https://discussions.apple.com/thread/8655829">enable WebGL 2.0</a
      >.
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as moment from "moment";
import * as screenfull from "screenfull";
import "vue-select/dist/vue-select.css";
import { Buffer } from "buffer";
import { mapActions, mapState } from "pinia";

import { distance, fmtDegLat, fmtDegLon, fmtHours } from "@wwtelescope/astro";

import { Source, researchAppStore } from "./store";
import { wwtEngineNamespace } from "./namespaces";

import { ImageSetType, SolarSystemObjects } from "@wwtelescope/engine-types";

interface Message {
  event?: string;
  type?: string;
}

import {
  Annotation,
  Circle,
  Color,
  Guid,
  Imageset,
  ImageSetLayer,
  ImageSetLayerSetting,
  Poly,
  PolyLine,
  SpreadSheetLayer,
} from "@wwtelescope/engine";

import {
  applyCircleAnnotationSetting,
  applyPolyAnnotationSetting,
  applyPolyLineAnnotationSetting,
  extractCircleAnnotationSettings,
  extractPolyAnnotationSettings,
  extractPolyLineAnnotationSettings,
  extractSpreadSheetLayerSettings,
  extractImageSetLayerSettings,
  isCircleAnnotationSetting,
  isEngineSetting,
  isImageSetLayerSetting,
  isPolyAnnotationSetting,
  isPolyLineAnnotationSetting,
  SpreadSheetLayerState
} from "@wwtelescope/engine-helpers";

import {
  WWTAwareComponent,
  CatalogLayerInfo,
  ImagesetInfo,
  SpreadSheetLayerInfo,
} from "@wwtelescope/engine-pinia";

import {
  classicPywwt,
  isPingPongMessage,
  layers,
  selections,
  settings,
  tours,
  ApplicationStateMessage,
  PointerMoveMessage,
  PointerUpMessage,
  ViewStateMessage,
} from "@wwtelescope/research-app-messages";

import {
  convertEngineSetting,
  isResearchAppEngineSetting,
  convertPywwtSpreadSheetLayerSetting,
  convertSpreadSheetLayerSetting,
} from "./settings";
import { defineComponent, isProxy, toRaw } from "vue";

const D2R = Math.PI / 180.0;
const R2D = 180.0 / Math.PI;

type ToolType =
  | "add-imagery-layer"
  | "choose-background"
  | "choose-catalog"
  | "crossfade"
  | "load-collection"
  | "save-state"
  | null;

type AnyFitsLayerMessage =
  | classicPywwt.CreateImageSetLayerMessage
  | classicPywwt.SetFitsLayerColormapMessage
  | classicPywwt.SetLayerOrderMessage
  | classicPywwt.StretchFitsLayerMessage
  | classicPywwt.ModifyFitsLayerMessage
  | classicPywwt.RemoveImageSetLayerMessage
  | layers.MultiModifyFitsLayerMessage;

/** Helper for handling messages that mutate FITS / ImageSet layers. Because
 * FITS loading is asynchronous, and messages might arrive out of order, we need
 * some logic to smooth everything out.
 */
class ImageSetLayerMessageHandler {
  owner: AppType;
  created = false;
  internalId: string | null = null;
  colormapVersion = -1;
  stretchVersion = -1;
  orderVersion = -1;
  queuedStretch: classicPywwt.StretchFitsLayerMessage | null = null;
  queuedColormap: classicPywwt.SetFitsLayerColormapMessage | null =
    null;
  queuedSettings: ImageSetLayerSetting[] = [];
  queuedRemoval: classicPywwt.RemoveImageSetLayerMessage | null = null;
  queuedOrder: classicPywwt.SetLayerOrderMessage | null = null;

  constructor(owner: AppType) {
    this.owner = owner;
  }

  handleCreateMessage(msg: classicPywwt.CreateImageSetLayerMessage) {
    if (this.created) {
      return;
    }

    const mode = msg.mode || "autodetect";
    // Compatibility with older pywwt requires that if goto(Target) is
    // unspecified, we treat it as true.
    const gotoTarget = msg.goto == undefined ? true : msg.goto;

    const displayName = msg.name == undefined ? msg.id : msg.name;

    this.owner
      .addImageSetLayer({
        url: msg.url,
        mode: mode,
        name: displayName,
        goto: gotoTarget,
      })
      .then((layer: ImageSetLayer) => this.layerInitialized(layer));

    this.created = true;
  }

  layerInitialized(layer: ImageSetLayer) {
    this.internalId = layer.id.toString();

    if (this.queuedStretch !== null) {
      this.handleStretchMessage(this.queuedStretch);
      this.queuedStretch = null;
    }

    if (this.queuedColormap !== null) {
      this.handleSetColormapMessage(this.queuedColormap);
      this.queuedColormap = null;
    }

    this.owner.applyFitsLayerSettings({
      id: this.internalId,
      settings: this.queuedSettings,
    });
    this.queuedSettings = [];

    if (this.queuedRemoval !== null) {
      this.handleRemoveMessage(this.queuedRemoval);
      this.queuedRemoval = null;
    }
  }

  handleSetLayerOrderMessage(msg: classicPywwt.SetLayerOrderMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (this.queuedOrder === null || msg.version > this.queuedOrder.version) {
        this.queuedOrder = msg;
      }
    } else {
      if (msg.version > this.orderVersion) {
        this.owner.setImageSetLayerOrder({
          id: this.internalId,
          order: msg.order,
        });
        this.orderVersion = msg.version;
      }
    }
  }

  handleStretchMessage(msg: classicPywwt.StretchFitsLayerMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (
        this.queuedStretch === null ||
        msg.version > this.queuedStretch.version
      ) {
        this.queuedStretch = msg;
      }
    } else {
      // TODO: `msg.stretch` is just a number while `stretch` is a typed
      // ScaleTypes enum; TypeScript seems happy but we should validate!
      if (msg.version > this.stretchVersion) {
        this.owner.stretchFitsLayer({
          id: this.internalId,
          stretch: msg.stretch,
          vmin: msg.vmin,
          vmax: msg.vmax,
        });
        this.stretchVersion = msg.version;
      }
    }
  }

  handleSetColormapMessage(msg: classicPywwt.SetFitsLayerColormapMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (
        this.queuedColormap === null ||
        msg.version > this.queuedColormap.version
      ) {
        this.queuedColormap = msg;
      }
    } else {
      if (msg.version > this.colormapVersion) {
        this.owner.setFitsLayerColormap({
          id: this.internalId,
          name: msg.cmap,
        });
        this.colormapVersion = msg.version;
      }
    }
  }

  handleModifyMessage(msg: classicPywwt.ModifyFitsLayerMessage) {
    const setting: [string, any] = [msg.setting, msg.value];

    if (!isImageSetLayerSetting(setting)) {
      return;
    }

    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      this.queuedSettings.push(setting);
    } else {
      this.owner.applyFitsLayerSettings({
        id: this.internalId,
        settings: [setting],
      });
    }
  }

  handleMultiModifyMessage(msg: layers.MultiModifyFitsLayerMessage) {
    if (!layers.isMultiModifyFitsLayerMessage(msg)) return;
    if (msg.settings.length !== msg.values.length) return;

    const layerSettings: ImageSetLayerSetting[] = [];
    for (const [index, option] of msg.settings.entries()) {
      const setting: [string, any] = [option, msg.values[index]];
      if (isImageSetLayerSetting(setting)) {
        layerSettings.push(setting);
      }
    }

    if (this.internalId === null) {
      layerSettings.forEach((setting) => this.queuedSettings.push(setting));
    } else {
      this.owner.applyFitsLayerSettings({
        id: this.internalId,
        settings: layerSettings,
      });
    }
  }

  handleRemoveMessage(msg: classicPywwt.RemoveImageSetLayerMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (this.queuedRemoval === null) {
        this.queuedRemoval = msg;
      }
    } else {
      this.owner.deleteLayer(this.internalId);
      this.internalId = null;
      this.created = false;
    }
  }
}

type AnyTableLayerMessage =
  | classicPywwt.CreateTableLayerMessage
  | classicPywwt.UpdateTableLayerMessage
  | classicPywwt.ModifyTableLayerMessage
  | classicPywwt.RemoveTableLayerMessage
  | layers.MultiModifyTableLayerMessage;

/** Helper for handling messages that mutate tabular / "spreadsheet" layers. */
class TableLayerMessageHandler {
  owner: AppType;
  created = false;
  isHips = false;
  internalId: string | null = null;
  layer: SpreadSheetLayer | null = null; // hack for settings
  imageset: Imageset | null = null; // hack for HiPS catalogs
  queuedUpdate: classicPywwt.UpdateTableLayerMessage | null = null;
  queuedSettings: classicPywwt.PywwtSpreadSheetLayerSetting[] = [];
  queuedRemoval: classicPywwt.RemoveTableLayerMessage | null = null;
  queuedSelectability: selections.ModifySelectabilityMessage | null =
    null;

  constructor(owner: AppType) {
    this.owner = owner;
  }

  handleCreateMessage(msg: classicPywwt.CreateTableLayerMessage) {
    if (this.created) return;

    const data = atob(msg.table);

    this.owner
      .createTableLayer({
        name: msg.id,
        referenceFrame: msg.frame,
        dataCsv: data,
      })
      .then((layer) => {
        this.layerInitialized(layer);
        this.owner.addResearchAppTableLayer(
          new SpreadSheetLayerInfo(
            layer.id.toString(),
            layer.get_referenceFrame(),
            layer.get_name()
          )
        );
      });

    this.created = true;
  }

  setupHipsCatalog(imageset: Imageset, layer: SpreadSheetLayer) {
    this.created = true;
    this.isHips = true;
    this.imageset = imageset;
    this.layerInitialized(layer);
  }

  layerInitialized(layer: SpreadSheetLayer) {
    this.internalId = layer.id.toString();
    this.layer = layer;

    if (this.queuedUpdate !== null) {
      this.handleUpdateMessage(this.queuedUpdate);
      this.queuedUpdate = null;
    }

    // Settings need transformation from the pywwt JSON "wire protocol" to
    // what's used internally by the engine and our surrounding TypeScript
    // infrastructure. They're close, but some mapping is needed.

    const settings = [];

    for (const ps of this.queuedSettings) {
      const es = convertPywwtSpreadSheetLayerSetting(ps, layer);
      if (es !== null) {
        settings.push(es);
      }
    }

    this.owner.applyTableLayerSettings({
      id: this.internalId,
      settings,
    });
    this.queuedSettings = [];

    if (this.queuedRemoval !== null) {
      this.handleRemoveMessage(this.queuedRemoval);
      this.queuedRemoval = null;
    }

    if (this.queuedSelectability !== null) {
      this.handleSelectabilityMessage(this.queuedSelectability);
      this.queuedSelectability = null;
    }
  }

  handleUpdateMessage(msg: classicPywwt.UpdateTableLayerMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      this.queuedUpdate = msg;
    } else {
      if (!this.isHips) {
        this.owner.updateTableLayer({
          id: this.internalId,
          dataCsv: atob(msg.table),
        });
      }
    }
  }

  handleModifyMessage(msg: classicPywwt.ModifyTableLayerMessage) {
    // The messages sent by pywwt here do not map directly into internal WWT
    // settings - they are more transport-friendly versions, as expressed in the
    // PywwtSpreadSheetLayerSetting type.

    const setting: [string, any] = [msg.setting, msg.value];

    if (!classicPywwt.isPywwtSpreadSheetLayerSetting(setting)) {
      return;
    }

    // This `if` statement is over-conservative to make TypeScript happy:
    if (this.layer === null || this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      this.queuedSettings.push(setting);
    } else {
      const es = convertPywwtSpreadSheetLayerSetting(setting, this.layer);
      if (es !== null) {
        this.owner.applyTableLayerSettings({
          id: this.internalId,
          settings: [es],
        });
      }
    }
  }

  handleMultiModifyMessage(msg: layers.MultiModifyTableLayerMessage) {
    if (!layers.isMultiModifyTableLayerMessage(msg)) return;
    if (msg.settings.length !== msg.values.length) return;

    const layer = this.owner.spreadSheetLayerById(msg.id);
    if (layer) {
      const pywwtSettings: classicPywwt.PywwtSpreadSheetLayerSetting[] = [];
      for (const [index, option] of msg.settings.entries()) {
        const setting: [string, any] = [option, msg.values[index]];
        if (classicPywwt.isPywwtSpreadSheetLayerSetting(setting)) {
          pywwtSettings.push(setting);
        }
      }

      if (this.internalId === null) {
        pywwtSettings.forEach((setting) => this.queuedSettings.push(setting));
      } else {
        const layerSettings = pywwtSettings.flatMap((s) => {
          const pywwtSetting = convertPywwtSpreadSheetLayerSetting(s, layer);
          return pywwtSetting ? [pywwtSetting] : [];
        });
        this.owner.applyTableLayerSettings({
          id: this.internalId,
          settings: layerSettings,
        });
      }
    }
  }

  async handleGetHipsDataInViewMessage(
    msg: layers.GetHipsCatalogDataInViewMessage
  ): Promise<layers.GetHipsCatalogDataInViewReply | null> {
    if (
      this.imageset === null ||
      this.layer === null ||
      this.internalId === null
    )
      return null; // Sorry!

    if (!this.isHips) return null;

    return this.owner
      .getCatalogHipsDataInView({
        imageset: this.imageset,
        limit: msg.limit,
      })
      .then((info) => {
        return {
          event: "layer_hipscat_datainview_reply",
          threadId: msg.threadId,
          data: info.table,
          aborted: info.aborted,
        };
      });
  }

  handleRemoveMessage(msg: classicPywwt.RemoveTableLayerMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (this.queuedRemoval === null) {
        this.queuedRemoval = msg;
      }
    } else {
      if (this.isHips && this.imageset !== null) {
        // This is a little kludgey ...
        const name = this.imageset.get_name();

        for (const cat of this.owner.curAvailableCatalogs) {
          if (cat.name == name) {
            this.owner.removeResearchAppTableLayer(cat);
            this.owner.removeCatalogHipsByName(name);
          }
        }
      } else {
        this.owner.deleteLayer(this.internalId);
        if (this.layer !== null) {
          const info = new SpreadSheetLayerInfo(
            this.layer.id.toString(),
            this.layer.get_referenceFrame(),
            this.layer.get_name()
          );
          this.owner.removeResearchAppTableLayer(info);
        }
        this.internalId = null;
        this.created = false;
      }
    }
  }

  handleSelectabilityMessage(msg: selections.ModifySelectabilityMessage) {
    if (this.internalId === null) {
      // Layer not yet created or fully initialized. Queue up message for processing
      // once it's ready.
      if (this.queuedSelectability === null) {
        this.queuedSelectability = msg;
      }
    } else {
      const layer = this.owner.spreadsheetLayers.find((x) => x.name === msg.id);
      if (layer !== undefined) {
        this.owner.setResearchAppTableLayerSelectability({
          layer: layer,
          selectable: msg.selectable,
        });
      }
    }
  }
}

type AnyAnnotationMessage =
  | classicPywwt.AddLinePointMessage
  | classicPywwt.AddPolygonPointMessage
  | classicPywwt.CreateAnnotationMessage
  | classicPywwt.ModifyAnnotationMessage
  | classicPywwt.RemoveAnnotationMessage
  | classicPywwt.SetCircleCenterMessage
  | layers.MultiModifyAnnotationMessage;

/** Helper for handling messages that mutate annotations. These are actually
 * much simpler to deal with than image or data layers, but it doesn't hurt
 * to use the same sort of design.
 */
class AnnotationMessageHandler {
  owner: AppType;
  ann: Annotation;

  public static tryCreate(
    owner: AppType,
    msg: classicPywwt.CreateAnnotationMessage
  ): AnnotationMessageHandler | null {
    // defaults here track pywwt's
    if (msg.shape == "circle") {
      const circ = new Circle();
      circ.set_fill(false);
      circ.set_skyRelative(true);
      circ.setCenter(owner.wwtRARad * R2D, owner.wwtDecRad * R2D);
      return new AnnotationMessageHandler(owner, circ, msg.id);
    } else if (msg.shape == "polygon") {
      const poly = new Poly();
      poly.set_fill(false);
      return new AnnotationMessageHandler(owner, poly, msg.id);
    } else if (msg.shape == "line") {
      return new AnnotationMessageHandler(owner, new PolyLine(), msg.id);
    }

    return null;
  }

  constructor(owner: AppType, ann: Annotation, id: string) {
    this.owner = owner;
    this.ann = ann;
    ann.set_id(id);
    owner.addAnnotation(ann);
  }

  handleModifyAnnotationMessage(msg: classicPywwt.ModifyAnnotationMessage) {
    const setting: [string, any] = [msg.setting, msg.value];

    if (this.ann instanceof Circle && isCircleAnnotationSetting(setting)) {
      applyCircleAnnotationSetting(this.ann, setting);
    } else if (this.ann instanceof Poly && isPolyAnnotationSetting(setting)) {
      applyPolyAnnotationSetting(this.ann, setting);
    } else if (
      this.ann instanceof PolyLine &&
      isPolyLineAnnotationSetting(setting)
    ) {
      applyPolyLineAnnotationSetting(this.ann, setting);
    }
  }

  handleMultiModifyAnnotationMessage(msg: layers.MultiModifyAnnotationMessage) {
    for (const [index, option] of msg.settings.entries()) {
      const setting: [string, any] = [option, msg.values[index]];
      if (this.ann instanceof Circle && isCircleAnnotationSetting(setting)) {
        applyCircleAnnotationSetting(this.ann, setting);
      } else if (this.ann instanceof Poly && isPolyAnnotationSetting(setting)) {
        applyPolyAnnotationSetting(this.ann, setting);
      } else if (
        this.ann instanceof PolyLine &&
        isPolyLineAnnotationSetting(setting)
      ) {
        applyPolyLineAnnotationSetting(this.ann, setting);
      }
    }
  }

  handleRemoveAnnotationMessage(_msg: classicPywwt.RemoveAnnotationMessage) {
    this.owner.removeAnnotation(this.ann);
  }

  handleSetCircleCenterMessage(msg: classicPywwt.SetCircleCenterMessage) {
    if (this.ann instanceof Circle) {
      this.ann.setCenter(msg.ra, msg.dec);
    }
  }

  handleAddLinePointMessage(msg: classicPywwt.AddLinePointMessage) {
    if (this.ann instanceof PolyLine) {
      this.ann.addPoint(msg.ra, msg.dec);
    }
  }

  handleAddPolygonPointMessage(msg: classicPywwt.AddPolygonPointMessage) {
    if (this.ann instanceof Poly) {
      this.ann.addPoint(msg.ra, msg.dec);
    }
  }

  annotation(): Annotation {
    return this.ann;
  }
}

class KeyPressInfo {
  code: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;

  constructor(
    code: string,
    modifiers?: {
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }
  ) {
    this.code = code;
    this.ctrl = modifiers?.ctrl ?? false;
    this.alt = modifiers?.alt ?? false;
    this.shift = modifiers?.shift ?? false;
    this.meta = modifiers?.meta ?? false;
  }

  matches(event: KeyboardEvent): boolean {
    return (
      event.code === this.code &&
      event.ctrlKey === this.ctrl &&
      event.altKey === this.alt &&
      event.shiftKey === this.shift &&
      event.metaKey === this.meta
    );
  }
}

/** This simple class encapsulates how we handle key bindings */
class KeyboardControlSettings {
  zoomIn: KeyPressInfo[];
  zoomOut: KeyPressInfo[];
  moveUp: KeyPressInfo[];
  moveDown: KeyPressInfo[];
  moveLeft: KeyPressInfo[];
  moveRight: KeyPressInfo[];
  tiltUp: KeyPressInfo[];
  tiltDown: KeyPressInfo[];
  tiltLeft: KeyPressInfo[];
  tiltRight: KeyPressInfo[];
  bigMoveUp: KeyPressInfo[];
  bigMoveDown: KeyPressInfo[];
  bigMoveLeft: KeyPressInfo[];
  bigMoveRight: KeyPressInfo[];
  moveAmount: number;
  tiltAmount: number;
  bigMoveFactor: number;

  constructor({
    zoomIn = [new KeyPressInfo("KeyZ"), new KeyPressInfo("PageUp")],
    zoomOut = [new KeyPressInfo("KeyX"), new KeyPressInfo("PageDown")],
    moveUp = [new KeyPressInfo("KeyI"), new KeyPressInfo("ArrowUp")],
    moveDown = [new KeyPressInfo("KeyK"), new KeyPressInfo("ArrowDown")],
    moveLeft = [new KeyPressInfo("KeyJ"), new KeyPressInfo("ArrowLeft")],
    moveRight = [new KeyPressInfo("KeyL"), new KeyPressInfo("ArrowRight")],
    tiltUp = [
      new KeyPressInfo("KeyI", { alt: true }),
      new KeyPressInfo("ArrowUp", { alt: true }),
    ],
    tiltDown = [
      new KeyPressInfo("KeyK", { alt: true }),
      new KeyPressInfo("ArrowDown", { alt: true }),
    ],
    tiltLeft = [
      new KeyPressInfo("KeyJ", { alt: true }),
      new KeyPressInfo("ArrowLeft", { alt: true }),
    ],
    tiltRight = [
      new KeyPressInfo("KeyL", { alt: true }),
      new KeyPressInfo("ArrowRight", { alt: true }),
    ],
    bigMoveUp = [
      new KeyPressInfo("KeyI", { shift: true }),
      new KeyPressInfo("ArrowUp", { shift: true }),
    ],
    bigMoveDown = [
      new KeyPressInfo("KeyK", { shift: true }),
      new KeyPressInfo("ArrowDown", { shift: true }),
    ],
    bigMoveLeft = [
      new KeyPressInfo("KeyJ", { shift: true }),
      new KeyPressInfo("ArrowLeft", { shift: true }),
    ],
    bigMoveRight = [
      new KeyPressInfo("KeyL", { shift: true }),
      new KeyPressInfo("ArrowRight", { shift: true }),
    ],
    moveAmount = 20,
    tiltAmount = 20,
    bigMoveFactor = 6,
  }) {
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;
    this.moveUp = moveUp;
    this.moveDown = moveDown;
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.tiltUp = tiltUp;
    this.tiltDown = tiltDown;
    this.tiltLeft = tiltLeft;
    this.tiltRight = tiltRight;
    this.bigMoveUp = bigMoveUp;
    this.bigMoveDown = bigMoveDown;
    this.bigMoveLeft = bigMoveLeft;
    this.bigMoveRight = bigMoveRight;
    this.moveAmount = moveAmount;
    this.tiltAmount = tiltAmount;
    this.bigMoveFactor = bigMoveFactor;
  }

  // This is to make sure that we can't make a listener for an action type that doesn't exist
  readonly actionTypes = [
    "zoomIn",
    "zoomOut",
    "moveUp",
    "moveDown",
    "moveLeft",
    "moveRight",
    "tiltUp",
    "tiltDown",
    "tiltLeft",
    "tiltRight",
    "bigMoveUp",
    "bigMoveDown",
    "bigMoveLeft",
    "bigMoveRight",
  ] as const;

  makeListener(
    actionName: KeyboardControlSettings["actionTypes"][number],
    action: () => void
  ): (e: KeyboardEvent) => void {
    return (e) => {
      for (const keyPress of this[actionName]) {
        if (keyPress.matches(e)) {
          action();
        }
      }
    };
  }
}

interface RawSourceInfo {
  ra: number;
  dec: number;
  catalogLayer: CatalogLayerInfo;
  colNames: string[];
  values: string[];
}

/** Get the source of a MessageEvent as a Window, if it is one.
 *
 * The problem here is that on Chrome, if the event is a cross-origin message
 * event, `event.source instanceof Window` returns false even if the source is a
 * window, because that object comes from a different JS context than the one
 * that is currently executing, so its `Window` type is different than ours. On
 * other browsers, or same-origin events, the problem doesn't manifest.
 * Meanwhile, the ServiceWorker type is only defined on HTTPS connections and
 * localhost, so it's sometimes missing.
 *
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof#instanceof_and_multiple_context_e.g._frames_or_windows
 */
function eventSourceAsWindow(e: MessageEvent): Window | null {
  if (
    !(e.source instanceof MessagePort) &&
    (typeof ServiceWorker === "undefined" ||
      !(e.source instanceof ServiceWorker))
  ) {
    return e.source as Window;
  }

  return null;
}

/** The main "research app" Vue component. */
const App = defineComponent({
  extends: WWTAwareComponent,

  props: {
    allowedOrigin: { type: String, default: null },
    kcs: { type: KeyboardControlSettings, default: new KeyboardControlSettings({}) }
  },

  data() {
    return {
      defaultColor: Color.fromArgb(1, 255, 255, 255),
      wwtComponentNamespace: wwtEngineNamespace,
      currentTool: null as ToolType,
      lastClosePt: null as RawSourceInfo | null,
      lastSelectedSource: null as Source | null,
      selectionProximity: 4,
      hideAllChrome: false,
      hipsUrl: `${window.location.protocol}//www.worldwidetelescope.org/wwtweb/catalog.aspx?W=hips`, // Temporary
      isPointerMoving: false,
      messageQueue: [] as Message[],
      pointerMoveThreshold: 6,
      pointerStartPosition: null as { x: number; y: number } | null,
      updateIntervalId: null as number | null,
      messageHandlers: new Map<string, (msg: any) => boolean>(),
      fitsLayers: new Map<string, ImageSetLayerMessageHandler>(),
      tableLayers: new Map<string, TableLayerMessageHandler>(),
      annotations: new Map<string, AnnotationMessageHandler>(),
      newSourceName: (function () {
        let count = 0;

        return function () {
          count += 1;
          return `Source ${count}`;
        };
      })(),
      
      statusMessageSessionId: "default",
      lastUpdatedRA: 0.0,
      lastUpdatedDec: 0.0,
      lastUpdatedFov: 1.0,
      lastUpdatedRoll: 0.0,
      lastUpdatedClockRate: 1.0,
      lastUpdatedTimestamp: 0, // `Date.now()` value
      
      fullscreenModeActive: false,

      wtmlCollectionUrl: "",
      loadedWtmlUrls: [] as string[],
    }
  },

  computed: {
    ...mapState(researchAppStore, [
      'catalogNameMappings',
      'hipsCatalogs',
      'selectableTableLayers',
      'sources',
      'visibleTableLayers'
    ]),
    ...mapState(researchAppStore, {
      appTableLayers: store => store.tableLayers,
      spreadsheetLayers: store => store.tableLayers()
    }),

    curAvailableImageryData(): ImagesetInfo[] {
      if (this.wwtAvailableImagesets == null) return [];

      // Currently (2021 August) the engine code requires that the
      // filetype/extension field of an imageset be exactly ".fits" if it will be
      // rendered with the FITS machinery. There are some datasets out there that
      // include multiple space-separated extensions in this attribute, and of
      // course there are different FITS-like extensions in use, so this might get
      // more sophisticated in the future. If so, this logic will need to be
      // updated.

      return this.wwtAvailableImagesets.filter(
        (info) => info.type == this.wwtRenderType && info.extension == ".fits"
      );
    },

    fullscreenAvailable(): boolean {
      return screenfull.isEnabled;
    },

    curAvailableImagesets(): ImagesetInfo[] {
      if (this.wwtAvailableImagesets == null) return [];
      return this.wwtAvailableImagesets.filter(
        (info) =>
          info.type == this.wwtRenderType && !info.extension.includes("tsv")
      );
    },

    curAvailableCatalogs(): ImagesetInfo[] {
      if (this.wwtAvailableImagesets == null) return [];
      return this.wwtAvailableImagesets.filter(
        (info) =>
          info.type == this.wwtRenderType && info.extension.includes("tsv")
      );
    },

    curBackgroundImagesetName: {
      get(): string {
        if (this.wwtBackgroundImageset == null) return "";
        return this.wwtBackgroundImageset.get_name();
      },
      set(name: string) {
        this.setBackgroundImageByName(name);
      }
    },

    foregroundOpacity: {
      get(): number {
        return this.wwtForegroundOpacity;
      },
      set(o: number) {
        this.setForegroundOpacity(o);
      }
    },

    // "Tools" menu

    showCrossfader() {
      if (this.wwtIsTourPlaying) return false; // maybe show this if tour player is active but not playing?

      if (
        this.wwtForegroundImageset == null ||
        this.wwtForegroundImageset === undefined
      )
        return false;

      return this.wwtForegroundImageset != this.wwtBackgroundImageset;
    },

    showAddImageryTool() {
      return !this.wwtIsTourPlaying;
    },

    showBackgroundChooser() {
      return !this.wwtIsTourPlaying;
    },

    showCatalogTool() {
      return !this.wwtIsTourPlaying;
    },

    showCatalogChooser() {
      return this.currentTool == "choose-catalog";
    },

    showCollectionLoader() {
      return !this.wwtIsTourPlaying;
    },

    haveImagery() {
      return this.activeImagesetLayerStates.length > 0;
    },

    haveTableLayers() {
      return this.spreadsheetLayers.length > 0;
    },

    haveSources() {
      return this.sources.length > 0;
    },

    showToolMenu() {
      // This should return true if there are any tools to show.
      return this.showCrossfader || this.showBackgroundChooser;
    },

    coordText() {
      if (this.wwtRenderType == ImageSetType.sky) {
        return `${fmtHours(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
      }

      return `${fmtDegLon(this.wwtRARad)} ${fmtDegLat(this.wwtDecRad)}`;
    }
  },

  methods: {
    ...mapActions(researchAppStore, [
      'addResearchAppTableLayer',
      'addSource',
      'removeResearchAppTableLayer',
      'setResearchAppTableLayerSelectability',
    ]),

    parseFloatParam(param: string | (string | null)[], fallback: number): number {
      if (typeof param === "string") {
        const value = parseFloat(param);
        return value || fallback;
      }
      return fallback;
    },

    encodeObjectBase64(obj: object): string {
      return Buffer.from(JSON.stringify(obj)).toString("base64");
    },

    decodeObjectBase64(data: string): object {
      try {
        return JSON.parse(Buffer.from(data, "base64").toString());
      } catch (error) {
        console.warn(`Error parsing messages: ${error}`);
        return {};
      }
    },

    /** NOTE: Currently, both pywwtSpreadSheetLayerSetting and SpreadSheetLayerSetting
     * expect dates as `Date` objects. However, these are serialized as strings
     * and thus we need to deserialize.
     */
    adjustSettingsForImport(names: string[], values: any[]): void {
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const value = values[i];
        if (
          (name === "beginRange" || name === "endRange") &&
          typeof value === "string"
        ) {
          values[i] = new Date(value);
        }
      }
    },

    getQueryScript(location: Location): string | null {
      if (!location) {
        return null;
      }
      const query = new URLSearchParams(location.search);
      return query.get("script");
    },

    handleQueryScript(script: string): void {
      const messageStrings = script.split(",");
      const messages: Message[] = messageStrings
        .map((str) => this.decodeObjectBase64(str))
        .filter((obj): obj is Message => "event" in obj || "type" in obj);

      /** See the note on adjustSettingsForImport
       * Some fields (i.e. dates) need to be properly deserialized
       */
      messages.forEach((msg) => {
        if (classicPywwt.isModifyTableLayerMessage(msg)) {
          this.adjustSettingsForImport([msg.setting], [msg.value]);
        } else if (layers.isMultiModifyTableLayerMessage(msg)) {
          this.adjustSettingsForImport(msg.settings, msg.values);
        }
      });

      // We need to handle messages in the correct order
      // Generally, let's assume that our message can be any
      // research app message
      // Even though some (i.e. removal messages) are unlikely
      // to come in a query string
      const messagesAdjList: { [event: string]: string[] | undefined } = {
        table_layer_create: [
          "table_layer_set",
          "table_layer_set_multi",
          "table_layer_remove",
          "table_layer_update",
          "add_source",
        ],
        load_image_collection: [
          "set_background_by_name",
          "set_foreground_by_name",
          "image_layer_create",
          "layer_hipscat_load",
        ],
        image_layer_create: [
          "image_layer_set",
          "image_layer_set_multi",
          "image_layer_stretch",
        ],
        set_foreground_by_name: ["set_foreground_opacity"],
        layer_hipscat_load: [
          "layer_hipscat_datainview",
          "table_layer_set",
          "table_layer_set_multi",
          "table_layer_update",
          "add_source",
        ],
        annotation_create: ["annotation_set", "annotation_set_multi"],
      };
      const completion: {
        [event: string]:
          | [string, (sent: Message, reply: Message) => boolean]
          | undefined;
      } = {
        load_image_collection: [
          "load_image_collection_completed",
          (sent, reply) => {
            if (
              !(
                classicPywwt.isLoadImageCollectionMessage(sent) &&
                classicPywwt.isLoadImageCollectionCompletedMessage(reply)
              )
            )
              return false;
            return sent.url === reply.url;
          },
        ],
        layer_hipscat_load: [
          "layer_hipscat_load_completed",
          (sent, reply) => {
            if (
              !(
                layers.isLoadHipsCatalogMessage(sent) &&
                layers.isLoadHipsCatalogCompletedMessage(reply)
              )
            )
              return false;
            for (const [option, value] of reply.spreadsheetInfo.settings) {
              if (option === "name") {
                return sent.name === value;
              }
            }
            return false;
          },
        ],
      };

      const getType: (msg: Message) => string = (msg) =>
        msg.event || msg.type || "";
      const messageTypes: string[] = messages.map(getType);
      const finishedMessageTypes: string[] = [];

      const prerequisites: { [type: string]: string[] | undefined } = {};
      messageTypes.forEach((t) => {
        const prereqs = [];
        for (const [typ, deps] of Object.entries(messagesAdjList)) {
          if (deps && deps.includes(t)) {
            prereqs.push(typ);
          }
        }
        prerequisites[t] = prereqs;
      });

      // The prerequisite to add messages of a type is
      // all of the types that it depends on have been finished
      // (this is trivially true are there aren't any of that type)
      const prerequisitesMet: (msgType: string) => boolean = (msgType) => {
        const prereqs = prerequisites[msgType];
        if (prereqs === undefined) {
          return true;
        }
        return prereqs.every(
          (t) => !messageTypes.includes(t) || finishedMessageTypes.includes(t)
        );
      };

      // We define "root" messages as messages that either
      // - Don't depend on another message type
      // - Might depend on another message type, but there aren't
      //    any of that type present.
      //    For instance, if a user has loaded an imageset via WTML and has
      //    that as a background image, we need to wait until the WTML has loaded.
      //    But they may also just have a built-in image as the background
      const isRoot = (t: string) => {
        const prereqs = prerequisites[t];
        return (
          prereqs === undefined ||
          prereqs.length === 0 ||
          prereqs.every((x) => !messageTypes.includes(x))
        );
      };
      const rootTypes = messageTypes.filter(isRoot);

      const addMessagesOfType: (msgType: string) => void = (msgType) => {
        const messagesOfType = messages.filter((msg) => getType(msg) === msgType);
        this.messageQueue = this.messageQueue.concat(messagesOfType);

        const nextTypes = messagesAdjList[msgType];
        const completionInfo = completion[msgType];
        if (!nextTypes) {
          return;
        }

        const nextTypesPresent = nextTypes.filter(
          (t) => messageTypes.indexOf(t) >= 0
        );

        if (completionInfo) {
          const [completedType, completedMatcher] = completionInfo;
          const handler: (msg: any) => boolean = (msg) => {
            const matchingMessages = messagesOfType.filter((x) =>
              completedMatcher(x, msg)
            );
            matchingMessages.forEach((m) => {
              messagesOfType.splice(messagesOfType.indexOf(m), 1);
            });
            if (messagesOfType.length === 0) {
              this.messageHandlers.delete(completedType);
              finishedMessageTypes.push(msgType);
              nextTypesPresent
                .filter(prerequisitesMet)
                .forEach(addMessagesOfType);
            }
            return true;
          };
          this.messageHandlers.set(completedType, handler);
        } else {
          finishedMessageTypes.push(msgType);
          nextTypesPresent.filter(prerequisitesMet).forEach(addMessagesOfType);
        }
      };

      rootTypes.forEach(addMessagesOfType);
    },

    stateAsUrl(): string {
      const coordinatesMessage: classicPywwt.CenterOnCoordinatesMessage = {
        event: "center_on_coordinates",
        ra: this.wwtRARad * R2D,
        dec: this.wwtDecRad * R2D,
        fov: this.wwtZoomDeg / 6,
        roll: this.wwtRollRad * R2D,
        instant: true,
      };

      let backgroundMessage: classicPywwt.SetBackgroundByNameMessage | null =
        null;
      if (this.wwtBackgroundImageset !== null) {
        let name = this.wwtBackgroundImageset.get_name();
        if (name === "DSS") {
          name = "Digitized Sky Survey (Color)";
        }
        backgroundMessage = {
          event: "set_background_by_name",
          name: name,
        };
      }

      let foregroundMessage: classicPywwt.SetForegroundByNameMessage | null =
        null;
      if (this.wwtForegroundImageset !== null) {
        foregroundMessage = {
          event: "set_foreground_by_name",
          name: this.wwtForegroundImageset.get_name(),
        };
      }

      const threadId = Guid.create();
      const catalogs = this.hipsCatalogs();
      const loadCatalogsMessages: layers.LoadHipsCatalogMessage[] = [];
      const catalogSettingsMessages: layers.MultiModifyTableLayerMessage[] = [];
      catalogs.forEach((catalog) => {
        const layer = this.layerForHipsCatalog(catalog.name);
        if (layer !== null) {
          const id = layer.id.toString();
          loadCatalogsMessages.push({
            event: "layer_hipscat_load",
            threadId: threadId, // We need this to get a response
            tableId: id,
            name: catalog.name,
          });

          const state: SpreadSheetLayerState = this.wwtSpreadSheetLayers[id];
          const layerSettings = extractSpreadSheetLayerSettings(state);
          const pywwtLayerSettings: classicPywwt.PywwtSpreadSheetLayerSetting[] =
            layerSettings.flatMap((s) => {
              const pywwtSetting = convertSpreadSheetLayerSetting(s);
              return pywwtSetting ? [pywwtSetting] : [];
            });

          catalogSettingsMessages.push({
            event: "table_layer_set_multi",
            id: id,
            settings: pywwtLayerSettings.map((s) => s[0]),
            values: pywwtLayerSettings.map((s) => s[1]),
          });
        }
      });

      const loadWtmlMessages: classicPywwt.LoadImageCollectionMessage[] =
        this.loadedWtmlUrls.map((url) => {
          return {
            event: "load_image_collection",
            url: url,
            loadChildFolders: true,
          };
        });

      const imageryLayerMessages: classicPywwt.CreateImageSetLayerMessage[] = [];
      const imagerySettingMessages: layers.MultiModifyFitsLayerMessage[] = [];
      const imageryStretchMessages: classicPywwt.StretchFitsLayerMessage[] = [];
      this.activeImagesetLayerStates.forEach((info) => {
        const id = info.getGuid();
        const imageset = this.imagesetForLayer(id);
        if (imageset !== null) {
          imageryLayerMessages.push({
            event: "image_layer_create",
            id: imageset.get_name(),
            url: imageset.get_url(),
            mode: "preloaded",
            goto: false,
          });

          const state = this.wwtImagesetLayers[id];
          const layerSettings = extractImageSetLayerSettings(state.settings);
          imagerySettingMessages.push({
            event: "image_layer_set_multi",
            id: imageset.get_name(),
            settings: layerSettings.map((s) => s[0]),
            values: layerSettings.map((s) => s[1]),
          });

          imageryStretchMessages.push({
            event: "image_layer_stretch",
            id: imageset.get_name(),
            version: 1, // Don't think that this should matter - we're only sending one per layer
            stretch: state.scaleType,
            vmin: state.vmin,
            vmax: state.vmax,
          });
        }
      });

      const sourceMessages: selections.AddSourceMessage[] = this.sources.map(
        (source) => {
          return {
            type: "add_source",
            source: this.prepareForMessaging(source),
          };
        }
      );

      const createAnnotationMessages: classicPywwt.CreateAnnotationMessage[] = [];
      const annotationSettingsMessages: layers.MultiModifyAnnotationMessage[] =
        [];
      for (const [id, handler] of this.annotations) {
        const annotation = handler.annotation();
        let shape: "circle" | "line" | "polygon" | undefined = undefined;
        if (annotation instanceof Circle) {
          shape = "circle";
        } else if (annotation instanceof Poly) {
          shape = "polygon";
        } else if (annotation instanceof PolyLine) {
          shape = "line";
        }
        if (shape == undefined) {
          continue;
        }
        createAnnotationMessages.push({
          event: "annotation_create",
          shape: shape,
          id: id,
        });

        let layerSettings: [string, any][] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (shape === "circle") {
          layerSettings = extractCircleAnnotationSettings(annotation as Circle);
        } else if (shape === "polygon") {
          layerSettings = extractPolyAnnotationSettings(annotation as Poly);
        } else if (shape === "line") {
          layerSettings = extractPolyLineAnnotationSettings(
            annotation as PolyLine
          );
        }
        annotationSettingsMessages.push({
          event: "annotation_set_multi",
          id: id,
          settings: layerSettings.map((s) => s[0]),
          values: layerSettings.map((s) => s[1]),
        });
      }

      const messageStrings = [
        coordinatesMessage,
        backgroundMessage,
        foregroundMessage,
        ...loadCatalogsMessages,
        ...catalogSettingsMessages,
        ...loadWtmlMessages,
        ...imageryLayerMessages,
        ...imagerySettingMessages,
        ...imageryStretchMessages,
        ...sourceMessages,
        ...createAnnotationMessages,
        ...annotationSettingsMessages,
      ].flatMap((s) => (s ? [this.encodeObjectBase64(s)] : []));

      const messageString = messageStrings.join(",");
      const outString = messageString;

      const params = {
        script: outString,
      };

      const url = new URL(window.location.href);
      url.search = new URLSearchParams(params).toString();
      return url.toString();
    },

    copyStateURL(): void {
      navigator.clipboard
        .writeText(this.stateAsUrl())
        .then(() =>
          this.$notify({
            group: "copy-url",
            type: "success",
            text: "URL successfully copied",
          })
        )
        .catch((_err) =>
          this.$notify({
            group: "copy-url",
            type: "error",
            text: "Failed to copy URL",
          })
        );
    },
    
    // Incoming message handling

    initializeHandlers() {
      // These handlers must take care to type-check that the input
      // message actually fully obeys the expected schema!

      this.messageHandlers.set(
        "load_image_collection",
        this.handleLoadImageCollection
      );

      this.messageHandlers.set(
        "set_background_by_name",
        this.handleSetBackgroundByName
      );
      this.messageHandlers.set(
        "set_foreground_by_name",
        this.handleSetForegroundByName
      );
      this.messageHandlers.set(
        "set_foreground_opacity",
        this.handleSetForegroundOpacity
      );
      this.messageHandlers.set("set_viewer_mode", this.handleSetViewerMode);

      this.messageHandlers.set(
        "center_on_coordinates",
        this.handleCenterOnCoordinates
      );
      this.messageHandlers.set("track_object", this.handleTrackObject);
      this.messageHandlers.set("set_datetime", this.handleSetDatetime);
      this.messageHandlers.set("pause_time", this.handlePauseTime);
      this.messageHandlers.set("resume_time", this.handleResumeTime);

      this.messageHandlers.set("modify_settings", this.handleModifySettings);
      this.messageHandlers.set("setting_set", this.handleModifyEngineSetting);

      this.messageHandlers.set(
        "image_layer_create",
        this.handleCreateImageSetLayer
      );
      this.messageHandlers.set("image_layer_order", this.handleSetLayerOrder);
      this.messageHandlers.set(
        "image_layer_stretch",
        this.handleStretchFitsLayer
      );
      this.messageHandlers.set(
        "image_layer_cmap",
        this.handleSetFitsLayerColormap
      );
      this.messageHandlers.set("image_layer_set", this.handleModifyFitsLayer);
      this.messageHandlers.set(
        "image_layer_set_multi",
        this.handleMultiModifyFitsLayer
      );
      this.messageHandlers.set(
        "image_layer_remove",
        this.handleRemoveImageSetLayer
      );

      this.messageHandlers.set("table_layer_create", this.handleCreateTableLayer);
      this.messageHandlers.set("table_layer_update", this.handleUpdateTableLayer);
      this.messageHandlers.set("table_layer_set", this.handleModifyTableLayer);
      this.messageHandlers.set("table_layer_remove", this.handleRemoveTableLayer);
      this.messageHandlers.set(
        "table_layer_set_multi",
        this.handleMultiModifyTableLayer
      );

      this.messageHandlers.set("layer_hipscat_load", this.handleLoadHipsCatalog);
      this.messageHandlers.set(
        "layer_hipscat_datainview",
        this.handleGetHipsCatalogDataInView
      );

      this.messageHandlers.set("annotation_create", this.handleCreateAnnotation);
      this.messageHandlers.set("annotation_set", this.handleModifyAnnotation);
      this.messageHandlers.set(
        "annotation_set_multi",
        this.handleMultiModifyAnnotation
      );
      this.messageHandlers.set("circle_set_center", this.handleSetCircleCenter);
      this.messageHandlers.set("line_add_point", this.handleAddLinePoint);
      this.messageHandlers.set("polygon_add_point", this.handleAddPolygonPoint);
      this.messageHandlers.set("remove_annotation", this.handleRemoveAnnotation);
      this.messageHandlers.set("clear_annotations", this.handleClearAnnotations);

      this.messageHandlers.set("load_tour", this.handleLoadTour);
      this.messageHandlers.set("pause_tour", this.handlePauseTour);
      this.messageHandlers.set("resume_tour", this.handleResumeTour);
      this.messageHandlers.set("get_view_as_tour", this.handleGetViewAsTour);

      this.messageHandlers.set("add_source", this.handleAddSource);
      this.messageHandlers.set(
        "modify_selectability",
        this.handleModifySelectability
      );
      this.messageHandlers.set(
        "modify_all_selectability",
        this.handleModifyAllSelectability
      );

      // Ignore incoming view_state messages. When testing the app, you might want
      // to launch it as (e.g.)
      // `http://localhost:8080/?origin=http://localhost:8080/` so that you can
      // manually send it messages using postMessage in the JS console. But in
      // this setup, the app also receives every message that it sends, because
      // its send and receive origins are the same! The resulting "unhandled
      // message" report can actually be useful for examining outgoing messages,
      // but it gets annoying for the view state messages that are sent so
      // frequently. So, ignore those.
      this.messageHandlers.set("wwt_view_state", this.ignoreMessage);
    },

    onMessage(msg: any) {
      const key = String(msg.type || msg.event);
      const handler = this.messageHandlers.get(key);
      let handled = false;

      if (handler !== undefined) {
        handled = handler(msg);
      }

      if (!handled) {
        console.warn(
          "WWT research app received unhandled message, as follows:",
          msg
        );
      }
    },

    ignoreMessage(_msg: any): boolean {
      return true;
    },

      // Various message handlers that don't comfortably fit elsewhere:

    handleLoadImageCollection(msg: any): boolean {
      if (!classicPywwt.isLoadImageCollectionMessage(msg)) return false;

      this.loadImageCollection({
        url: msg.url,
        loadChildFolders: msg.loadChildFolders,
      }).then(() => {
        if (this.$options.statusMessageDestination != null && this.allowedOrigin != null) {
          const completedMessage: classicPywwt.LoadImageCollectionCompletedMessage =
            {
              event: "load_image_collection_completed",
              threadId: msg.threadId,
              url: msg.url,
            };

          this.$options.statusMessageDestination.postMessage(
            completedMessage,
            this.allowedOrigin
          );
        }
        this.loadedWtmlUrls.push(msg.url);
      });
      return true;
    },

    handleCenterOnCoordinates(msg: any): boolean {
      if (!classicPywwt.isCenterOnCoordinatesMessage(msg)) return false;

      const rollRad = msg.roll == undefined ? undefined : msg.roll * D2R;
      this.gotoRADecZoom({
        raRad: msg.ra * D2R,
        decRad: msg.dec * D2R,
        zoomDeg: msg.fov * 6,
        instant: msg.instant,
        rollRad: rollRad,
      });
      return true;
    },

    handleModifyEngineSetting(msg: any): boolean {
      if (!classicPywwt.isModifySettingMessage(msg)) return false;

      const setting: [string, any] = [msg.setting, msg.value];

      if (!isResearchAppEngineSetting(setting)) return false;
      const convertedSetting = convertEngineSetting(setting);

      this.applySetting(convertedSetting);
      return true;
    },

    handleSetDatetime(msg: any): boolean {
      if (!classicPywwt.isSetDatetimeMessage(msg)) return false;

      this.setTime(moment.utc(msg.isot).toDate());
      return true;
    },

    handlePauseTime(msg: any): boolean {
      if (!classicPywwt.isPauseTimeMessage(msg)) return false;

      this.setClockSync(false);
      return true;
    },

    handleResumeTime(msg: any): boolean {
      if (!classicPywwt.isResumeTimeMessage(msg)) return false;

      this.setClockSync(true);
      this.setClockRate(msg.rate);
      return true;
    },

    handleTrackObject(msg: any): boolean {
      if (!classicPywwt.isTrackObjectMessage(msg)) return false;

      if (msg.code in SolarSystemObjects) {
        this.setTrackedObject(msg.code as SolarSystemObjects);
      }
      return true;
    },

    handleModifySettings(msg: any): boolean {
      const appModified = settings.maybeAsModifiedAppSettings(msg);

      if (appModified !== null) {
        for (const s of appModified) {
          if (s[0] == "hideAllChrome") this.hideAllChrome = s[1];
          if (s[0] == "selectionProximity") this.selectionProximity = s[1];
        }

        return true;
      }

      return false;
    },

    wwtOnPointerMove(event: PointerEvent) {
      // We would like to catch drag operations over wwt. Unfortunately we cannot
      // detect whether the primary button is pressed when the pointer move event
      // reaches us, because the ponterdown event can be triggered outside wwt.
      // Instead we check whether 1 button is pressed, and assumes that the
      // pressed button is the primary button.
      if (event.buttons == 1) {
        const message: PointerMoveMessage = {
          type: "wwt_pointer_move",
          clientX: event.clientX,
          clientY: event.clientY,
          sessionId: this.statusMessageSessionId,
        };
        if (this.$options.statusMessageDestination != null && this.allowedOrigin != null) {
          // NB: if we start allowing messages to go out to more destinations, we'll
          // need to become smarter about allowedOrigin here.
          this.$options.statusMessageDestination.postMessage(message, this.allowedOrigin);
        }
      }

      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }

      if (this.spreadsheetLayers.length == 0) {
        return;
      }
      this.updateLastClosePoint(event);
    },
    
    updateLastClosePoint(event: PointerEvent): void {
      const pt = { x: event.offsetX, y: event.offsetY };
      const closestPt = this.closestInView(pt, this.selectionProximity);
      if (closestPt == null && this.lastClosePt == null) {
        return;
      }
      const needsUpdate =
        closestPt == null ||
        this.lastClosePt == null ||
        this.lastClosePt.ra != closestPt.ra ||
        this.lastClosePt.dec != closestPt.dec;
      if (needsUpdate) {
        this.lastClosePt = closestPt;
      }
    },

    wwtOnPointerDown(event: PointerEvent) {
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
    },

    wwtOnPointerUp(event: PointerEvent) {
      const message: PointerUpMessage = {
        type: "wwt_pointer_up",
        clientX: event.clientX,
        clientY: event.clientY,
        sessionId: this.statusMessageSessionId,
      };
      if (this.$options.statusMessageDestination != null && this.allowedOrigin != null) {
        // NB: if we start allowing messages to go out to more destinations, we'll
        // need to become smarter about allowedOrigin here.
        this.$options.statusMessageDestination.postMessage(message, this.allowedOrigin);
      }

      if (!this.isPointerMoving) {
        this.updateLastClosePoint(event);
        if (this.lastClosePt !== null) {
          const source = this.sourceCreator(this.lastClosePt);
          this.addSource(source);
          this.lastSelectedSource = source;
        }
      }

      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },

    nameForSource(layerData: any, layerName: string): string {
      for (const [key, [from, to]] of Object.entries(this.catalogNameMappings)) {
        if (from in layerData && layerName === key) {
          return `${to}: ${layerData[from]}`;
        }
      }
      return this.newSourceName();
    },

    sourceCreator(sourceInfo: RawSourceInfo): Source {
      const obj: any = {};
      for (let i = 0; i < sourceInfo.values.length; i++) {
        obj[sourceInfo.colNames[i]] = sourceInfo.values[i];
      }
      return {
        ra: sourceInfo.ra,
        dec: sourceInfo.dec,
        catalogLayer: sourceInfo.catalogLayer,
        layerData: obj,
        name: this.nameForSource(obj, sourceInfo.catalogLayer.name),
      };
    },

    // ImageSet layers, including FITS layers:

    getFitsLayerHandler(
      msg: AnyFitsLayerMessage
    ): ImageSetLayerMessageHandler {
      let handler = this.fitsLayers.get(msg.id);

      if (handler === undefined) {
        handler = new ImageSetLayerMessageHandler(this);
        this.fitsLayers.set(msg.id, handler);
      }

      return handler;
    },

    handleCreateImageSetLayer(msg: any): boolean {
      if (classicPywwt.isCreateFitsLayerMessage(msg)) {
        const createImageSetMessage: classicPywwt.CreateImageSetLayerMessage = {
          event: msg.event,
          url: msg.url,
          id: msg.id,
          mode: "fits",
        };
        this.getFitsLayerHandler(createImageSetMessage).handleCreateMessage(
          createImageSetMessage
        );
        return true;
      }

      if (classicPywwt.isCreateImageSetLayerMessage(msg)) {
        this.getFitsLayerHandler(msg).handleCreateMessage(msg);
        return true;
      }

      return false;
    },

    handleSetLayerOrder(msg: any): boolean {
      if (!classicPywwt.isSetLayerOrderMessage(msg)) return false;

      this.getFitsLayerHandler(msg).handleSetLayerOrderMessage(msg);
      return true;
    },

    handleStretchFitsLayer(msg: any): boolean {
      if (!classicPywwt.isStretchFitsLayerMessage(msg)) return false;

      this.getFitsLayerHandler(msg).handleStretchMessage(msg);
      return true;
    },

    handleSetFitsLayerColormap(msg: any): boolean {
      if (!classicPywwt.isSetFitsLayerColormapMessage(msg)) return false;

      this.getFitsLayerHandler(msg).handleSetColormapMessage(msg);
      return true;
    },

    handleModifyFitsLayer(msg: any): boolean {
      if (!classicPywwt.isModifyFitsLayerMessage(msg)) return false;

      this.getFitsLayerHandler(msg).handleModifyMessage(msg);
      return true;
    },

    handleMultiModifyFitsLayer(msg: any): boolean {
      if (!layers.isMultiModifyFitsLayerMessage(msg)) return false;

      this.getFitsLayerHandler(msg).handleMultiModifyMessage(msg);
      return true;
    },

    handleMultiModifyTableLayer(msg: any): boolean {
      if (!layers.isMultiModifyTableLayerMessage(msg)) return false;

      this.getTableLayerHandler(msg).handleMultiModifyMessage(msg);
      return true;
    },

    handleRemoveImageSetLayer(msg: any): boolean {
      if (!classicPywwt.isRemoveImageSetLayerMessage(msg)) return false;

      // NB we never remove the handler! It's tricky due to async issues.
      this.getFitsLayerHandler(msg).handleRemoveMessage(msg);
      return true;
    },

    // Table layers:

    getTableLayerHandler(
      msg: AnyTableLayerMessage
    ): TableLayerMessageHandler {
      let handler = this.tableLayers.get(msg.id);

      if (handler === undefined) {
        handler = new TableLayerMessageHandler(this);
        this.tableLayers.set(msg.id, handler);
      }

      return handler;
    },

    handleCreateTableLayer(msg: any): boolean {
      if (!classicPywwt.isCreateTableLayerMessage(msg)) return false;

      this.getTableLayerHandler(msg).handleCreateMessage(msg);
      return true;
    },

    handleUpdateTableLayer(msg: any): boolean {
      if (!classicPywwt.isUpdateTableLayerMessage(msg)) return false;

      this.getTableLayerHandler(msg).handleUpdateMessage(msg);
      return true;
    },

    handleModifyTableLayer(msg: any): boolean {
      if (!classicPywwt.isModifyTableLayerMessage(msg)) return false;

      this.getTableLayerHandler(msg).handleModifyMessage(msg);
      return true;
    },

    handleRemoveTableLayer(msg: any): boolean {
      if (!classicPywwt.isRemoveTableLayerMessage(msg)) return false;

      // NB we never remove the handler! It's tricky due to async issues.
      this.getTableLayerHandler(msg).handleRemoveMessage(msg);
      return true;
    },

    // Annotations:

    createAnnotationHandler(
      msg: classicPywwt.CreateAnnotationMessage
    ): void {
      const handler = AnnotationMessageHandler.tryCreate(this, msg);

      if (handler !== null) {
        this.annotations.set(msg.id, handler);
      }
    },

    lookupAnnotationHandler(
      msg: AnyAnnotationMessage
    ): AnnotationMessageHandler | undefined {
      return this.annotations.get(msg.id);
    },

    handleCreateAnnotation(msg: any): boolean {
      if (!classicPywwt.isCreateAnnotationMessage(msg)) return false;

      this.createAnnotationHandler(msg);
      return true;
    },

    handleModifyAnnotation(msg: any): boolean {
      if (!classicPywwt.isModifyAnnotationMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleModifyAnnotationMessage(msg);
      }
      return true;
    },

    handleMultiModifyAnnotation(msg: any): boolean {
      if (!layers.isMultiModifyAnnotationMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleMultiModifyAnnotationMessage(msg);
      }
      return true;
    },

    handleSetCircleCenter(msg: any): boolean {
      if (!classicPywwt.isSetCircleCenterMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleSetCircleCenterMessage(msg);
      }
      return true;
    },

    handleAddLinePoint(msg: any): boolean {
      if (!classicPywwt.isAddLinePointMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleAddLinePointMessage(msg);
      }
      return true;
    },

    handleAddPolygonPoint(msg: any): boolean {
      if (!classicPywwt.isAddPolygonPointMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleAddPolygonPointMessage(msg);
      }
      return true;
    },

    handleRemoveAnnotation(msg: any): boolean {
      if (!classicPywwt.isRemoveAnnotationMessage(msg)) return false;

      const handler = this.lookupAnnotationHandler(msg);
      if (handler !== undefined) {
        handler.handleRemoveAnnotationMessage(msg);
      }
      this.annotations.delete(msg.id);
      return true;
    },

    handleClearAnnotations(msg: any): boolean {
      if (!classicPywwt.isClearAnnotationsMessage(msg)) return false;

      this.clearAnnotations();
      return true;
    },

    // Tours:

    handleLoadTour(msg: any): boolean {
      if (!classicPywwt.isLoadTourMessage(msg)) return false;

      this.loadTour({
        url: msg.url,
        play: true,
      });
      return true;
    },

    handlePauseTour(msg: any): boolean {
      if (!classicPywwt.isPauseTourMessage(msg)) return false;

      this.toggleTourPlayPauseState(); // note half-assed semantics here!
      return true;
    },

    handleResumeTour(msg: any): boolean {
      if (!classicPywwt.isResumeTourMessage(msg)) return false;

      this.toggleTourPlayPauseState(); // note half-assed semantics here!
      return true;
    },

    handleGetViewAsTour(msg: any): boolean {
      if (!tours.isGetViewAsTourMessage(msg)) return false;

      this.viewAsTourXml("tour").then((xml) => {
        if (xml !== null) {
          const reply: tours.GetViewAsTourReply = {
            type: "get_view_as_tour_reply",
            threadId: msg.threadId,
            tourXml: xml,
          };

          if (
            this.$options.statusMessageDestination !== null &&
            this.allowedOrigin !== null
          ) {
            this.$options.statusMessageDestination.postMessage(reply, this.allowedOrigin);
          }
        }
      });

      return true;
    },

    // Outgoing messages

    maybeUpdateStatus() {
      if (this.$options.statusMessageDestination === null || this.allowedOrigin === null)
        return;

      const ra = this.wwtRARad;
      const dec = this.wwtDecRad;
      const fov = this.wwtZoomDeg / 6; // WWT convention, zoom = 6*fov
      const roll = this.wwtRollRad * R2D;
      const clockRate = this.wwtClockRate;

      const needUpdate =
        ra != this.lastUpdatedRA ||
        dec != this.lastUpdatedDec ||
        fov != this.lastUpdatedFov ||
        roll != this.lastUpdatedRoll ||
        clockRate != this.lastUpdatedClockRate ||
        Date.now() - this.lastUpdatedTimestamp > 60000;

      if (!needUpdate) return;

      const message: ViewStateMessage = {
        type: "wwt_view_state",
        sessionId: this.statusMessageSessionId,
        raRad: ra,
        decRad: dec,
        fovDeg: fov,
        rollDeg: roll,
        engineClockISOT: this.wwtCurrentTime.toISOString(),
        systemClockISOT: new Date().toISOString(),
        engineClockRateFactor: clockRate,
      };

      // NB: if we start allowing messages to go out to more destinations, we'll
      // need to become smarter about allowedOrigin here.
      this.$options.statusMessageDestination.postMessage(message, this.allowedOrigin);

      this.lastUpdatedRA = ra;
      this.lastUpdatedDec = dec;
      this.lastUpdatedFov = fov;
      this.lastUpdatedRoll = roll;
      this.lastUpdatedClockRate = clockRate;
      this.lastUpdatedTimestamp = Date.now();
    },

    // Fullscreening

    toggleFullscreen() {
      if (screenfull.isEnabled) {
        screenfull.toggle();
      }
    },

    onFullscreenEvent() {
      // NB: we need the isEnabled check to make TypeScript happy even though it
      // is not necesary in practice here.
      if (screenfull.isEnabled) {
        this.fullscreenModeActive = screenfull.isFullscreen;
      }
    },

    // Background / foreground imagesets

    handleSetBackgroundByName(msg: any): boolean {
      if (!classicPywwt.isSetBackgroundByNameMessage(msg)) return false;

      this.setBackgroundImageByName(msg.name);
      return true;
    },

    handleSetForegroundByName(msg: any): boolean {
      if (!classicPywwt.isSetForegroundByNameMessage(msg)) return false;

      this.setForegroundImageByName(msg.name);
      return true;
    },

    handleSetForegroundOpacity(msg: any): boolean {
      if (!classicPywwt.isSetForegroundOpacityMessage(msg)) return false;

      this.setForegroundOpacity(msg.value);
      return true;
    },

    handleSetViewerMode(msg: any): boolean {
      if (!classicPywwt.isSetViewerModeMessage(msg)) return false;

      this.setBackgroundImageByName(msg.mode);
      this.setForegroundImageByName(msg.mode);
      return true;
    },

    // HiPS catalogs (see also the table layer support)

    addHips(catalog: ImagesetInfo): Promise<Imageset> {
      return this.addCatalogHipsByName({ name: catalog.name }).then((imgset) => {
        const hips = imgset.get_hipsProperties();

        if (hips !== null) {
          const catId = hips.get_catalogSpreadSheetLayer().id.toString();
          this.applyTableLayerSettings({
            id: catId,
            settings: [
              ["color", this.defaultColor],
              ["opacity", this.defaultColor.a],
            ],
          });
          catalog.id = catId;
          this.addResearchAppTableLayer(catalog);
        }
        return imgset;
      });
    },

    prepareForMessaging(source: Source): selections.Source {
      let layer: selections.CatalogLayerInfo;
      const sourceLayer = source.catalogLayer;
      if (sourceLayer instanceof ImagesetInfo) {
        layer = {
          ...sourceLayer,
          type: selections.ImageSetTypes[sourceLayer.type],
        };
      } else {
        layer = sourceLayer;
      }

      const rawSource = isProxy(source) ? toRaw(source) : source;
      const rawLayer = isProxy(layer) ? toRaw(layer): layer;
      return {
        ...rawSource,
        catalogLayer: rawLayer,
      };
    },

    // A client has requested that we load a HiPS catalog. Once it's loaded we
    // reply to the client with the details of the catalog-as-spreadsheet-layer,
    // so that it can know what the catalog's characteristics are.
    handleLoadHipsCatalog(msg: any): boolean {
      if (!layers.isLoadHipsCatalogMessage(msg)) return false;

      for (const cat of this.curAvailableCatalogs) {
        if (cat.name == msg.name) {
          this.addHips(cat).then((imgset) => {
            const hips = imgset.get_hipsProperties();
            if (hips === null) throw new Error("internal consistency failure");

            const layer = hips.get_catalogSpreadSheetLayer();

            // Register in the table-layer framework

            let handler = this.tableLayers.get(msg.tableId);

            if (handler === undefined) {
              handler = new TableLayerMessageHandler(this);
              this.tableLayers.set(msg.tableId, handler);
            }

            handler.setupHipsCatalog(imgset, layer);

            // Reply?

            if (msg.threadId === undefined) return;

            if (
              this.$options.statusMessageDestination === null ||
              this.allowedOrigin === null
            )
              return;

            const settings = extractSpreadSheetLayerSettings(layer);
            const pysettings: classicPywwt.PywwtSpreadSheetLayerSetting[] = [];

            for (const s of settings) {
              const ps = convertSpreadSheetLayerSetting(s);
              if (ps !== null) pysettings.push(ps);
            }

            const ssli: layers.SpreadSheetLayerInfo = {
              header: layer.get_header(),
              settings: pysettings,
            };

            const reply: layers.LoadHipsCatalogCompletedMessage = {
              event: "layer_hipscat_load_completed",
              threadId: msg.threadId,
              spreadsheetInfo: ssli,
            };

            this.$options.statusMessageDestination.postMessage(reply, this.allowedOrigin);
          });

          break;
        }
      }

      return true;
    },

    handleGetHipsCatalogDataInView(msg: any): boolean {
      if (!layers.isGetHipsCatalogDataInViewMessage(msg)) return false;

      // Unlike most table-layer messages, here we don't bother to try to work
      // well when messages are out-of-order or what have you.

      const handler = this.tableLayers.get(msg.tableId);
      if (handler !== undefined) {
        handler.handleGetHipsDataInViewMessage(msg).then((reply) => {
          if (reply !== null) {
            if (
              this.$options.statusMessageDestination !== null &&
              this.allowedOrigin !== null
            )
              this.$options.statusMessageDestination.postMessage(
                reply,
                this.allowedOrigin
              );
          }
        });
      }

      return true;
    },

    isMessageSpreadsheetLayer(
      layer: selections.CatalogLayerInfo
    ): layer is selections.SpreadSheetLayerInfo {
      return "referenceFrame" in layer;
    },

    isMessageImagesetInfo(
      layer: selections.CatalogLayerInfo
    ): layer is selections.ImagesetInfo {
      return "url" in layer;
    },

    deserializeSource(src: selections.Source): Source {
      const msgLayer = src.catalogLayer;
      let layer: CatalogLayerInfo | undefined = this.appTableLayers().find(
        (x) => x.name === msgLayer.name
      );

      // If the layer corresponding to the source doesn't exist
      // we create a new CatalogLayerInfo object for the source to use
      if (layer === undefined) {
        if (this.isMessageSpreadsheetLayer(msgLayer)) {
          layer = new SpreadSheetLayerInfo(
            msgLayer.id,
            msgLayer.referenceFrame,
            msgLayer.name
          );
        } else {
          layer = new ImagesetInfo(
            msgLayer.url,
            msgLayer.name,
            ImageSetType[msgLayer.type],
            msgLayer.description,
            msgLayer.extension
          );
        }
      }
      return {
        ...src,
        catalogLayer: layer,
      };
    },

    handleAddSource(msg: selections.AddSourceMessage): boolean {
      if (!selections.isAddSourceMessage(msg)) return false;

      const source = this.deserializeSource(msg.source);
      this.addSource(source);
      return true;
    },

    handleModifySelectability(
      msg: selections.ModifySelectabilityMessage
    ): boolean {
      if (!selections.isModifySelectabilityMessage(msg)) return false;

      const handler = this.tableLayers.get(msg.id);
      if (handler !== undefined) {
        handler.handleSelectabilityMessage(msg);
      }
      return true;
    },

    handleModifyAllSelectability(
      msg: selections.ModifyAllSelectabilityMessage
    ): boolean {
      if (!selections.isModifyAllSelectabilityMessage(msg)) return false;

      this.spreadsheetLayers.forEach((layer) =>
        this.setResearchAppTableLayerSelectability({
          layer: layer,
          selectable: msg.selectable,
        })
      );
      return true;
    },

    selectTool(name: ToolType) {
      if (this.currentTool == name) {
        this.currentTool = null;
      } else {
        this.currentTool = name;
      }
    },

    // Add Imagery As Layer tool

    addImagery(iinfo: ImagesetInfo) {
      console.log(iinfo);
      const msg: classicPywwt.CreateImageSetLayerMessage = {
        event: "image_layer_create",
        url: iinfo.url,
        id: iinfo.name,
        mode: "preloaded",
      };

      this.getFitsLayerHandler(msg).handleCreateMessage(msg);
    },

      // Load WTML Collection tool

    loadWtml(url: string) {
      this.loadImageCollection({
        url: url,
        loadChildFolders: true,
      }).then((_folder) => {
        this.$notify({
          group: "load-collection",
          type: "success",
          text: "WTML collection successfully loaded",
        });
        this.loadedWtmlUrls.push(url);
      });
    },

    submitWtmlCollectionUrl() {
      if (this.wtmlCollectionUrl) {
        this.loadWtml(this.wtmlCollectionUrl);
        this.wtmlCollectionUrl = "";
      }
    },

    doZoom(zoomIn: boolean) {
      if (zoomIn) {
        this.zoom(1 / 1.3);
      } else {
        this.zoom(1.3);
      }
    },

    doMove(x: number, y: number) {
      this.move({ x: x, y: y });
    },

    doTilt(x: number, y: number) {
      this.tilt({ x: x, y: y });
    },

    // For filtering imagesets
    filterImagesets(imagesets: ImagesetInfo[], searchText: string) {
      return imagesets.filter(
        (iset) =>
          iset.name.toLowerCase().includes(searchText) ||
          iset.description.toLowerCase().includes(searchText)
      );
    },

    filterCatalogs(imagesets: ImagesetInfo[], searchText: string) {
      return imagesets.filter(
        (iset) =>
          iset.name.toLowerCase().includes(searchText) ||
          iset.description.toLowerCase().includes(searchText)
      );
    },

    closestInView(
      point: { x: number; y: number },
      threshold?: number
    ): RawSourceInfo | null {
      let minDist = Infinity;
      let closestPt = null;

      const rowSeparator = "\r\n";
      const colSeparator = "\t";

      const raDecDeg = this.findRADecForScreenPoint(point);
      const target = { ra: D2R * raDecDeg.ra, dec: D2R * raDecDeg.dec };

      for (const layerInfo of this.selectableTableLayers()) {
        const layer = this.spreadSheetLayer(layerInfo);
        if (layer == null) {
          continue;
        }
        const hipsStr = layer.getTableDataInView();
        const rows = hipsStr.split(rowSeparator);
        const header = rows.shift();
        if (!header) {
          return null;
        }
        const colNames = header.split(colSeparator);

        const lngCol = layer.get_lngColumn();
        const latCol = layer.get_latColumn();

        for (const row of rows) {
          const values = row.split(colSeparator);
          const ra = D2R * Number(values[lngCol]);
          const dec = D2R * Number(values[latCol]);
          const pt = { ra: ra, dec: dec };
          const dist = distance(target.ra, target.dec, pt.ra, pt.dec);
          if (dist < minDist) {
            closestPt = {
              ra: ra,
              dec: dec,
              colNames: colNames,
              values: values,
              catalogLayer: layerInfo,
            };
            minDist = dist;
          }
        }
      }

      if (closestPt !== null) {
        const closestRADecDeg = { ra: closestPt.ra * R2D, dec: closestPt.dec * R2D };
        const closestScreenPoint = this.findScreenPointForRADec(closestRADecDeg);
        const pixelDist = Math.sqrt((point.x - closestScreenPoint.x) ** 2 + (point.y - closestScreenPoint.y) ** 2);
        if (!threshold || pixelDist < threshold) {
          return closestPt;
        }
      }
      return null;
    }
  },

  // Lifecycle management

  created() {
    this.$options.statusMessageDestination = null;
    this.initializeHandlers();
  },

  mounted() {
    if (screenfull.isEnabled) {
      screenfull.on("change", this.onFullscreenEvent);
    }

    this.waitForReady().then(() => {
      const script = this.getQueryScript(window.location);
      if (script !== null) {
        this.$options.statusMessageDestination = window;
      }

      // This returns a promise but I don't think that we need to wait for that
      // to resolve before going ahead and starting to listen for messages.
      this.loadImageCollection({
        url: this.hipsUrl,
        loadChildFolders: true,
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        // Handle the query script
        // We (potentially) need the catalogs to have finished loading for this
        if (script !== null) {
          this.handleQueryScript(script);
        }
      });

      // Don't start listening for messages until the engine is ready to go.
      // There's no point in returning a "not ready yet" error or anything since
      // the client has to handle the "app isn't yet listening for messages"
      // state anyway.
      //
      // For now let's just not worry about removing this listener ...
      window.addEventListener(
        "message",
        (event) => {
          // We have to be careful with event.source -- see this function's docs.
          const sourceAsWindow = eventSourceAsWindow(event);

          if (
            this.allowedOrigin !== null &&
            event.origin == this.allowedOrigin
          ) {
            // You could imagine wanting to send status updates to multiple
            // destinations, but let's start simple.
            if (this.$options.statusMessageDestination === null) {
              if (sourceAsWindow !== null) {
                this.$options.statusMessageDestination = sourceAsWindow;
                // Hardcode the status update rate to max out at 5 Hz.
                this.updateIntervalId = window.setInterval(
                  () => this.maybeUpdateStatus(),
                  200
                );
              }
            }

            const message = event.data;

            // Special handling for ping-pong to specifically reply to the pinger --
            // one day we should get better about talking to multiple clients.
            if (isPingPongMessage(message)) {
              if (sourceAsWindow !== null) {
                if (message.sessionId !== undefined) {
                  this.statusMessageSessionId = message.sessionId;
                }

                sourceAsWindow.postMessage(message, event.origin);
              } else if (event.source instanceof Window) {
                /* can't-happen, but needed to make TypeScript happy */
              } else if (event.source !== null) {
                event.source.postMessage(message);
              }
            } else {
              this.onMessage(message);
            }
          }
        },
        false
      );
    });

    // Handling key presses
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("zoomIn", () => this.doZoom(true))
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("zoomOut", () => this.doZoom(false))
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveUp", () =>
        this.doMove(0, this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveDown", () =>
        this.doMove(0, -this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveLeft", () =>
        this.doMove(this.kcs.moveAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("moveRight", () =>
        this.doMove(-this.kcs.moveAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("tiltLeft", () =>
        this.doTilt(this.kcs.tiltAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("tiltRight", () =>
        this.doTilt(-this.kcs.tiltAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("tiltUp", () =>
        this.doTilt(0, this.kcs.tiltAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("tiltDown", () =>
        this.doTilt(0, -this.kcs.tiltAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("bigMoveUp", () =>
        this.doMove(0, this.kcs.bigMoveFactor * this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("bigMoveDown", () =>
        this.doMove(0, this.kcs.bigMoveFactor * -this.kcs.moveAmount)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("bigMoveLeft", () =>
        this.doMove(this.kcs.bigMoveFactor * this.kcs.moveAmount, 0)
      )
    );
    window.addEventListener(
      "keydown",
      this.kcs.makeListener("bigMoveRight", () =>
        this.doMove(this.kcs.bigMoveFactor * -this.kcs.moveAmount, 0)
      )
    );
  },

  unmounted() {
    if (screenfull.isEnabled) {
      screenfull.off("change", this.onFullscreenEvent);
    }

    if (this.updateIntervalId !== null) {
      window.clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  },

  watch: {
    messageQueue(queue: Message[]): void {
      while (queue.length > 0) {
        const message = queue.shift();
        this.onMessage(message);
      }
    },

    wwtClockDiscontinuities(_count: number) {
      // Force a clock update message.
      this.lastUpdatedTimestamp = 0;
    },

    curAvailableCatalogs(catalogs: ImagesetInfo[]) {
      // Notify clients about the new catalogs

      if (this.$options.statusMessageDestination === null || this.allowedOrigin === null)
        return;

      const msg: ApplicationStateMessage = {
        type: "wwt_application_state",
        sessionId: this.statusMessageSessionId,
        hipsCatalogNames: catalogs.map((img) => img.name),
      };

      this.$options.statusMessageDestination.postMessage(msg, this.allowedOrigin);
    },

    lastSelectedSource(source: Source) {
      // Notify clients when a source is selected

      if (this.$options.statusMessageDestination === null || this.allowedOrigin === null)
        return;

      const msg: selections.SelectionStateMessage = {
        type: "wwt_selection_state",
        sessionId: this.statusMessageSessionId,
        mostRecentSource: this.prepareForMessaging(source),
      };

      this.$options.statusMessageDestination.postMessage(msg, this.allowedOrigin);
    },

    sources: {
      handler(sources: Source[]) {
        // Notify clients when the list of selected sources is changed
        // By making this a deep watcher, it keeps of track of any change
        // in the list - even events like a property of a list entry changing

        if (this.$options.statusMessageDestination === null || this.allowedOrigin === null)
          return;

        const msg: selections.SelectionStateMessage = {
          type: "wwt_selection_state",
          sessionId: this.statusMessageSessionId,
          selectedSources: sources.map((source) =>
            this.prepareForMessaging(source)
          ),
        };

        this.$options.statusMessageDestination.postMessage(msg, this.allowedOrigin);
      },
      deep: true
    }
  },

  // we need to declare this variable specially to make sure that Vue doesn't
  // try to make it reactive, which would cause it to try to read fields that
  // are prohibited in cross-origin situations:
  statusMessageDestination: null as Window | null,
  

});

type AppType = InstanceType<typeof App>;
export default App;
</script>

<style lang="less">
/** Note: the CSS is designed to keep the tools element (which contains the various dropdown selectors)
  * centered at all times. This is done by using nested flexbox containers, based on the first answer
  * from https://stackoverflow.com/questions/32378953/keep-the-middle-item-centered-when-side-items-have-different-widths
*/

:root {
  --popper-theme-background-color: black;
  --popper-theme-background-color-hover: black;
  --popper-theme-border-color: white;
  --popper-theme-padding: 5px;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-box-shadow: none;
  --popper-theme-text-color: white;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;

  // Activated in cases like interactive FITS stretch adjustment:
  &.pointer-tracking {
    cursor: crosshair;
  }
}

body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;

  .wwtelescope-component {
    position: relative;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}

#overlays {
  margin: 5px;
}

#ui-elements {
  position: absolute;
  display: flex;
  align-items: flex-start;
  top: 0.5rem;
  left: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
}

.element-box {
  display: flex;
}

.element-box:first-child {
  margin-right: auto;
}
.element-box:last-child {
  margin-left: auto;
}

#display-panel-box {
  flex: 2;
  order: 1;
}

#tools-box {
  flex: 3;
  order: 2;
  justify-content: center;
}

#controls-box {
  flex: 2;
  order: 3;
  justify-content: flex-end;
}

#controls {
  pointer-events: auto;
  z-index: 10;
  color: #fff;

  list-style-type: none;
  margin: 0;
  padding: 0;

  li {
    padding: 3px;
    height: 22px;
    cursor: pointer;

    .nudgeright1 {
      padding-left: 3px;
    }
  }
}

#webgl2-popup {
  position: absolute;
  z-index: 10;
  bottom: 3rem;
  left: 50%;
  color: #fff;
  transform: translate(-50%, -50%);

  a {
    color: #5588ff;
  }
}

#tools {
  order: 2;
  color: #fff;
  display: flex;
  justify-content: center;

  .tool-container {
    z-index: 10;
  }

  .opacity-range {
    width: 50vw;
  }

  a {
    text-decoration: none;
    color: #9bf;

    &:hover {
      text-decoration: underline;
    }
  }

  input,
  .load-collection-icon,
  .v-select {
    pointer-events: auto;
  }
}

#display-panel {
  pointer-events: auto;
  order: 1;
  min-width: 200px;
  max-width: 25vw;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  background: rgba(65, 65, 65, 0.6);

  p {
    margin: 0;
  }
}

.display-section-header {
  font-size: 70%;
  padding: 2px 5px;

  /* Some tomfoolery to give a little strikethrough effect
  * in the section header presentation */

  display: flex;
  align-items: center;

  &::before,
  &::after {
    content: "";
    height: 2px;
    background-color: white;
  }

  &::before {
    margin-right: 0.5rem;
    width: 1rem;
  }

  &::after {
    margin-left: 0.5rem;
    flex-grow: 1;
  }
}

.last-row {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.icon {
  padding: 0px 5px;
  color: white;
}

.load-collection-container {
  width: 100%;

  .load-collection-label {
    width: 100%;
    font-size: 120%;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .load-collection-row {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    width: 100%;
    margin-top: 0.2rem;
    justify-content: center;

    label {
      margin-right: 0.5rem;
    }

    input {
      width: 80%;
      min-width: 100px;
    }
  }

  .load-collection-icon {
    cursor: pointer;
    color: #9bf;

    &:hover {
      color: #88f;
    }
  }
}

.vue-notification-group {
  margin-right: 2.5rem;
  margin-top: 0.75rem;
}


.ellipsize {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Specialized styling for popups */

ul.tool-menu {
  list-style-type: none;
  margin: 0px;
  padding: 0px;

  li {
    padding: 3px;

    a {
      text-decoration: none;
      color: inherit;
      display: block;
      width: 100%;
    }

    svg.svg-inline--fa {
      width: 1.5em;
    }

    &:hover {
      background-color: #000;
      color: #fff;
    }
  }
}

.item-selector {
  width: 25vw;
  min-width: 175px;
  vertical-align: middle;
  padding: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  // Note: `overflow: hidden` breaks the dropdown
}

.item-select-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  flex-direction: row;
}

.item-select-title {
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 19px;
  background: none;
  float: left;
  height: 100%;
  margin: auto;
  padding: 0px 10px 0px 0px;
}

.item-selector * {
  background: #cccccc;

  .vs__dropdown-option--highlight {
    color: red;
  }

  .vs__selected-options {
    margin: 0;
    flex-wrap: nowrap;
    flex-grow: 1;
    overflow: hidden;
  }

  .vs__selected {
    overflow: hidden;
  }
}

.item-option {
  & h4 {
    margin: 0;
    width: 100%;
  }

  & p {
    margin: 0;
    font-size: small;
    width: 100%;
  }
}

.save-state-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}

.save-state-title {
  font-size: 16pt;
  text-align: center;
}

.save-state-content {
  display: flex;
  gap: 10px;
  align-items: center;
  pointer-events: auto;
}

.save-state-url {
  white-space: nowrap;
  overflow: scroll;
  max-width: 25vw;
  min-width: 150px;
  font-family: monospace;
  padding: 4px;
  border: 1px solid white;
  border-radius: 7px;
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // Edge, IE

  // Chrome, Safari, Opera
  &::-webkit-scrollbar {
    display: none;
  }
}

.pointer {
  cursor: pointer;
}

@media all and (max-width: 425px) {
  #ui-elements {
    flex-wrap: wrap;
    gap: 15px 1px;
  }

  #controls-box {
    order: 2;
  }

  #tools-box {
    order: 3;
    flex-grow: 0;
  }

  .item-select-container {
    align-items: center;
  }

  .item-selector {
    width: 75vw;
    min-width: 75vw;
  }

  .element-box:last-child {
    margin-right: auto;
  }
}

@media all and (max-width: 250px) {
  #display-panel {
    width: 100%;
    min-width: 100%;
  }

  #controls-box {
    flex: 0;
  }
}

/**
This makes the last element of the last list item in the
display panel have the rounded bottom edge
The alternative to this is to have Vue bind a class to the last element
*/
#display-panel > *:last-child > *:last-child {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
