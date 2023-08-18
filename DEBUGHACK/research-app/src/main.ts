import Vue, { createApp } from "vue";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import vSelect from 'vue-select';
import { ColorPicker } from "vue-color-kit";
import 'vue-color-kit/dist/vue-color-kit.css'
import Popper from "vue3-popper";

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAdjust,
  faArrowCircleRight,
  faChevronDown,
  faChevronUp,
  faCircle,
  faCompress,
  faCopy,
  faCrosshairs,
  faExpand,
  faEye,
  faEyeSlash,
  faImage,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faMinusCircle,
  faMountain,
  faPencilAlt,
  faPhotoVideo,
  faPlus,
  faPlusCircle,
  faSave,
  faSearchMinus,
  faSearchPlus,
  faSlidersH,
  faTimes,
  faWindowClose,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import Notifications from '@kyvg/vue3-notification';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import App from "./App.vue";
import ImagesetItem from "./ImagesetItem.vue";
import SourceItem from "./SourceItem.vue";
import SpreadsheetItem from "./SpreadsheetItem.vue";
import TransitionExpand from "./TransitionExpand.vue";
import { wwtEngineNamespace } from "./namespaces";
import { wwtPinia, WWTComponent } from "@wwtelescope/engine-pinia";


library.add(faAdjust);
library.add(faArrowCircleRight);
library.add(faChevronDown);
library.add(faChevronUp);
library.add(faCircle);
library.add(faCompress);
library.add(faCrosshairs);
library.add(faExpand);
library.add(faEye);
library.add(faEyeSlash);
library.add(faImage);
library.add(faMapMarkedAlt);
library.add(faMapMarkerAlt);
library.add(faMinusCircle);
library.add(faMountain);
library.add(faPencilAlt);
library.add(faPhotoVideo);
library.add(faPlus);
library.add(faPlusCircle);
library.add(faSearchMinus);
library.add(faSearchPlus);
library.add(faSlidersH);
library.add(faTimes);
library.add(faWindowClose);
library.add(faSave);
library.add(faCopy);

/** v-hide directive take from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

// If postMessages are to be allowed, our creator has to tell us where they'll
// come from. This only trivially prevents unexpected messages; it of course
// does nothing about XSS where someone loads us up inside an iframe that they
// control. This is OK because right now this app has no sense of user logins or
// other credentials that can be abused.
const queryParams = new URLSearchParams(window.location.search);
let allowedOrigin = queryParams.get('origin');
const messages = queryParams.get('script');
if (messages !== null) {
  // The app has been given a startup script. For now, we override
  // allowedOrigin, and so subsequent external scripting won't be possible. This
  // seems OK, but we could make the behavior more sophisticated here if that
  // turns out to be limiting.
  allowedOrigin = window.location.origin;
  console.log("WWT embed: incoming messages allowed from current origin in order to restore state");
} else if (allowedOrigin === null) {
  console.log("WWT embed: no \"?origin=\" given, so no incoming messages will be allowed");
}

createApp(App, {
    wwtNamespace: wwtEngineNamespace,
    allowedOrigin: allowedOrigin
  })

  // Plugins
  .use(Notifications)
  .use(wwtPinia)
  
  // Directives
  .directive(
  /**
  * Hides an HTML element, keeping the space it would have used if it were visible (css: Visibility)
  */
  "hide", {
    // Run on initialisation (first render) of the directive on the element
    beforeMount(el, binding, _vnode, _prevVnode) {
      update(el, binding)
    },
    // Run on subsequent updates to the value supplied to the directive
    updated(el, binding, _vnode, _prevVnode) {
      update(el, binding)
    }
  })

  // Add our components here
  .component('WorldWideTelescope', WWTComponent)
  .component('Popper', Popper)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('color-picker', ColorPicker)
  .component('v-select', vSelect)
  .component('vue-slider', VueSlider)
  .component('spreadsheet-item', SpreadsheetItem)
  .component('imageset-item', ImagesetItem)
  .component('source-item', SourceItem)
  .component('transition-expand', TransitionExpand)

  // Mount the app
  .mount("#app");
