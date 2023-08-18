<template>
  <div :id="uniqueId" class="wwtelescope-component"></div>
</template>

<script lang="ts">
import { defineComponent, markRaw, nextTick } from "vue";
import { mapActions } from "pinia";
import { engineStore } from "./store"

import { WWTInstance } from "@wwtelescope/engine-helpers";

let idCounter = 0;

interface ComponentData {
  uniqueId: string;
  wwt: WWTInstance | undefined;
  renderLoopId: number | undefined;
}

/** This is the component docstring. */
export default defineComponent({

  props: {
    wwtNamespace: { type: String, default: "wwt", required: true },
    wwtFreestandingAssetBaseurl: String,
  },

  data(): ComponentData {
    return {
      uniqueId: "",
      wwt: undefined,
      renderLoopId: undefined
    }
  },

  methods: {
    ...mapActions(engineStore, [
      "internalIncrementTourCompletions",
      "internalLinkToInstance",
      "internalUnlinkFromInstance",
      "internalUpdate",
      "waitForReady",
    ])
  },

  created() {
    // Create a globally unique ID for the div that the WWT engine can latch onto.
    const uid = `wwtcmpt${idCounter}`;
    Object.defineProperties(this, {
      uniqueId: { get() { return uid; } },
    });
    idCounter += 1;
  },

  mounted() {
    this.wwt = markRaw(new WWTInstance({
      elId: this.uniqueId,
      startInternalRenderLoop: false,

      // Start at the Galactic Center by default. RA of the GC ~= 266.4 deg; in WWT, lng = 360 - RA.
      startLatDeg: -28.9,
      startLngDeg: 93.6,

      freestandingAssetBaseurl: this.wwtFreestandingAssetBaseurl,
    }));

    // TODO: The build fails with a TypeScript error without "as WWTInstance"
    // Figure out why!
    this.internalLinkToInstance(this.wwt as WWTInstance);

    const render = () => {
      const wwt = this.wwt as WWTInstance;

      this.renderLoopId = window.requestAnimationFrame(render);
      wwt.ctl.renderOneFrame();
      this.internalUpdate();
    };

    // Wait for the WWT engine to signal readiness, then wait another tick, then
    // start the rendering loop. This way, if a user wants to do some
    // initialization that has to wait for the ready signal, we won't flash any
    // weirdly-initialized content.
    this.waitForReady().then(() => {
      nextTick().then(() => {
        this.renderLoopId = window.requestAnimationFrame(render);
      });
    });

    this.wwt.tourEndedCallback = ((_tp) => {
      this.internalIncrementTourCompletions();
    });
  },

  unmounted() {
    if (this.renderLoopId !== undefined) {
      window.cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = undefined;
    }

    if (this.wwt !== undefined) {
      this.wwt.tourEndedCallback = null;
    }

    this.internalUnlinkFromInstance();
  }

});
</script>
