<template>
  <div
    id="root-container"
    @mouseenter="hasFocus = true"
    @mouseleave="hasFocus = false"
    @focus="hasFocus = true"
    @blur="hasFocus = false"
  >
    <div
      id="main-container"
    >
      <label
        v-show="!editing"
        focusable="false"
        id="name-label"
        class="ellipsize"
        @click="isSelected = !isSelected"
        @keyup.enter="isSelected = !isSelected"
        >{{ layer.name }}</label
      >
      <input v-show="editing" class="name-input" @blur="editing = false" />
      <font-awesome-icon
        v-if="!isLayerHips"
        v-hide="!hasFocus"
        @click="handleEditClick"
        :class="['icon-button', { 'icon-active': editing }]"
        icon="pencil-alt"
      />
      <font-awesome-icon
        v-hide="!hasFocus"
        class="icon-button"
        :icon="visible ? 'eye' : 'eye-slash'"
        @click="handleToggle"
      />
      <font-awesome-icon
        v-hide="!hasFocus"
        class="icon-button"
        icon="times"
        @click="handleDelete"
      />
    </div>
    <transition-expand>
      <div v-if="isSelected" class="detail-container">
        <div class="detail-row" v-if="isLayerHips">
          <span class="prompt">URL:</span
          ><span class="ellipsize">{{ layer.url }}</span>
        </div>

        <div class="detail-row" v-if="isLayerHips && layer.description.length > 0">
          <span class="prompt">Description:</span
          ><span>{{ layer.description }}</span>
        </div>

        <div class="detail-row">
          <span class="prompt">Color:</span>
          <Popper
            :arrow="true"
            placement="right"
            >
            <font-awesome-icon
              icon="circle"
              size="lg"
              :style="{
                color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
              }"
            ></font-awesome-icon>
            <template #content>
              <color-picker
                class="app-color-picker"
                theme="dark"
                :color="colorString"
                :colors-default="[]"
                @changeColor="handleColorChange"
              ></color-picker>
            </template>
          </Popper>
        </div>

        <div class="detail-row">
          <span class="prompt">Marker:</span
          ><select v-model="plotType">
            <option
              v-for="pt in uiPlotTypes"
              v-bind:value="pt.wwt"
              v-bind:key="pt.desc"
            >
              {{ pt.desc }}
            </option>
          </select>
        </div>

        <div class="detail-row">
          <span class="prompt">Size adjust:</span>
          <div class="flex-row">
            <font-awesome-icon
              class="icon-button"
              size="lg"
              icon="minus-circle"
              @keyup.enter="doAdjustSize(false)"
              @click="doAdjustSize(false)"
              tabindex="0"
            />
            <input
              type="text"
              class="scale-factor-input"
              v-model.lazy="scaleFactorDbText"
            />
            <font-awesome-icon
              class="icon-button"
              size="lg"
              icon="plus-circle"
              @keyup.enter="doAdjustSize(true)"
              @click="doAdjustSize(true)"
              tabindex="0"
            />
          </div>
        </div>
      </div>
    </transition-expand>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mapActions, mapState } from "pinia";

import {
  Color,
  SpreadSheetLayerSetting,
  SpreadSheetLayerSettingsInterfaceRO,
} from "@wwtelescope/engine";
import { PlotTypes } from "@wwtelescope/engine-types";

import { CatalogLayerInfo, ImagesetInfo, engineStore } from "@wwtelescope/engine-pinia";
import { researchAppStore } from "./store";
import 'vue-color-kit/dist/vue-color-kit.css';

interface UiPlotTypes {
  wwt: PlotTypes;
  desc: string;
}

const uiPlotTypes: UiPlotTypes[] = [
  { wwt: PlotTypes.gaussian, desc: "Gaussian" },
  { wwt: PlotTypes.circle, desc: "Circle" },
  { wwt: PlotTypes.pushPin, desc: "Push-pin" },
  { wwt: PlotTypes.point, desc: "Point" },
  { wwt: PlotTypes.square, desc: "Square" },
  // "custom": handled same as push-pin in the engine
];

interface VueColorData {
  rgba: {
    a: number;
    r: number;
    g: number;
    b: number;
  };
  hex: string;
}

export default defineComponent({

  props: {
    layer: { type: Object as PropType<CatalogLayerInfo>, required: true },
    defaultColor: { default: Color.fromArgb(1, 255, 255, 255), required: false }
  },

  data() {
    return {
      uiPlotTypes,
      editing: false,
      hasFocus: false,
      isSelected: false,
      isLayerHips: false,
    }
  },

  computed: {
    ...mapState(researchAppStore, ["researchAppTableLayerVisibility"]),
    ...mapState(engineStore, ["spreadsheetState"]),

    visible(): boolean {
      return this.researchAppTableLayerVisibility(this.layer);
    },

    layerId(): string {
      return this.layer.id ?? "";
    },

    layerState(): SpreadSheetLayerSettingsInterfaceRO | null {
      return this.spreadsheetState(this.layer);
    },

    color: {
      get(): Color {
        const state = this.layerState;

        if (state !== null) {
          return state.get_color();
        } else {
          return this.defaultColor;
        }
      },
      set(value: Color) {
        this.applySettings([
          ["color", value],
          ["opacity", value.a],
        ]);
      }
    },

    colorString(): string {
      return `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
    },

    enabled(): boolean {
      const state = this.layerState;

      if (state !== null) {
        return state.get_enabled();
      } else {
        return true;
      }
    },

    plotType: {
      get(): PlotTypes {
        const state = this.layerState;

        if (state !== null) {
          return state.get_plotType();
        }

        return PlotTypes.gaussian;
      },
      set(value: PlotTypes) {
        this.applySettings([["plotType", value]]);
      }
    },

    scaleFactorDb: {
      get(): number {
        const state = this.layerState;

        if (state !== null) {
          return 10 * Math.log10(state.get_scaleFactor());
        }

        return 0.0;
      },
      set(value: number) {
        this.applySettings([["scaleFactor", Math.pow(10, 0.1 * value)]]);
      }
    },

    scaleFactorDbText: {
      // I can't find a customizable Vue numeric input that has good TypeScript
      // support, so we just hand-roll the processing to give nice textual
      // presentation.
      get(): string {
        if (this.scaleFactorDb == 0) {
          return "0.00";
        } else if (this.scaleFactorDb < 0) {
          return this.scaleFactorDb.toFixed(2);
        } else {
          return "+" + this.scaleFactorDb.toFixed(2);
        }
      },
      set(value: string) {
        const n = Number(value);

        if (isFinite(n)) {
          this.scaleFactorDb = n;
        }
      }
    }
  },

  methods: {
    ...mapActions(engineStore, [
      "applyTableLayerSettings",
      "deleteLayer",
      "removeCatalogHipsByName",
    ]),
    ...mapActions(researchAppStore, [
      "removeResearchAppTableLayer",
      "setResearchAppTableLayerVisibility",
    ]),

    applySettings(settings: SpreadSheetLayerSetting[]) {
      this.applyTableLayerSettings({
        id: this.layerId,
        settings: settings,
      });
    },

    handleDelete() {
      this.removeResearchAppTableLayer(this.layer);
      if (this.layer instanceof ImagesetInfo) {
        this.removeCatalogHipsByName(this.layer.name);
      } else {
        this.deleteLayer(this.layer.id);
      }
    },

    handleToggle() {
      this.setResearchAppTableLayerVisibility({
        layer: this.layer,
        visible: !this.visible,
      });
    },

    handleColorChange(colorData: VueColorData) {
      const rgba = colorData.rgba;
      this.color = Color.fromArgb(rgba.a, rgba.r, rgba.g, rgba.b);
    },

    handleEditClick() {
      this.editing = !this.editing;
    },

    doAdjustSize(bigger: boolean) {
      if (bigger) {
        this.scaleFactorDb += 0.5;
      } else {
        this.scaleFactorDb -= 0.5;
      }
    }
  },

  mounted() {
    this.isLayerHips = this.layer instanceof ImagesetInfo;
  },

  watch: {
    visible(val: boolean) {
      this.applySettings([["enabled", val]]);
    },

    enabled(val: boolean) {
      this.setResearchAppTableLayerVisibility({
        layer: this.layer,
        visible: val,
      });
    },

    editing(val: boolean) {
      const input: HTMLInputElement = this.$el.getElementsByClassName(
        "name-input"
      )[0] as HTMLInputElement;
      if (val) {
        input.value = this.layer.name;
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        this.layer.name = input.value;
      }
    }
  }

});
</script>

<style scoped lang="less">
#root-container {
  color: white;
  font-weight: bold;
  font-size: 12pt;
  padding: 0px;
  /*overflow: hidden;*/

  &:hover {
    background: #999999;
  }
}

#main-container {
  width: calc(100% - 10px);
  padding: 5px;
  display: flex;
  justify-content: space-between;
  gap: 2px;
}

#name-label {
  display: inline-block;
  flex: 1;
  padding-right: 10px;

  &:hover {
    cursor: pointer;
  }
}

.detail-container {
  font-size: 9pt;
  margin: 0px 5px;
  padding-left: 15px;
}

.icon-active {
  color: darkred;
}

.icon-button {
  cursor: pointer;
  margin: 2px;
  width: 1em;
}

.name-input {
  display: inline-block;
  background: #999999;
}

.prompt {
  font-size: 11pt;
  font-weight: bold;
  padding-right: 5px;
}

.detail-row {
  padding: 1px 0px;

  // Get nice vertical alignment in individual rows
  display: flex;
  align-items: center;
  width: 100%;
}

.flex-row {
  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;
  flex: 50%;
}

.scale-factor-input {
  width: 50%;
  text-align: center;
}

:deep(*) {

  &.app-color-picker {

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    & .color-set {
      display: flex;
      gap: 3px;
    }

  }
}
</style>
