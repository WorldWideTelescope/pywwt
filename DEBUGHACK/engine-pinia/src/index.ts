// Copyright 2020 the .NET Foundation
// Licensed under the MIT License

import { createPinia } from 'pinia';

export { SetupForImagesetOptions } from "@wwtelescope/engine-helpers";

export {
  CatalogLayerInfo,
  CreateTableLayerParams,
  GotoRADecZoomParams,
  ImagesetInfo,
  ImageSetLayerState,
  LoadImageCollectionParams,
  LoadTourParams,
  SpreadSheetLayerInfo,
  WWTEnginePiniaState,
  engineStore
} from "./store";

export { WWTAwareComponent } from "./wwtaware";

import WWTComponent from "./Component.vue";
import { WWTGlobalState } from './store';
export { WWTComponent }

export const wwtPinia = createPinia();
wwtPinia.use(({ store }) => {
  store.$wwt = new WWTGlobalState();
});
