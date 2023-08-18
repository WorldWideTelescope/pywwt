// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling imageset layer settings. */

import {
  isBaseImageSetLayerSetting,
} from "@wwtelescope/engine-types";

import {
  ImageSetLayerSetting,
  ImageSetLayerSettingsInterface,
  ImageSetLayerSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  copyLayerSettings,
  extractLayerSettings,
  isLayerSetting,
  layerSettingNames,
  LayerState,
} from "./layer";

const justImageSetLayerSettingNames = [
  "colorMapperName",
  "overrideDefaultLayer",
];

/** A list of the names of the available settings for `ImageSetLayer`
 * instances and their equivalents (things implementing
 * [[ImageSetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export const imageSetLayerSettingNames = layerSettingNames.concat(justImageSetLayerSettingNames);

/** Type guard function for `ImageSetLayerSetting`. */
export function isImageSetLayerSetting(obj: [string, any]): obj is ImageSetLayerSetting {
  // No special settings specific to non-base ImageSetLayerSetting.
  return isLayerSetting(obj) || isBaseImageSetLayerSetting(obj);
}

/** Apply a setting to a `ImageSetLayer` or equivalent. */
export function applyImageSetLayerSetting(layer: ImageSetLayerSettingsInterface, setting: ImageSetLayerSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (layer as any)[funcName](value);
}

/** Extract all of the current settings of a `ImageSetLayer` or equivalent. */
export function extractImageSetLayerSettings(layer: ImageSetLayerSettingsInterfaceRO): ImageSetLayerSetting[] {
  const s: [string, any][] = extractLayerSettings(layer);

  for (const n of justImageSetLayerSettingNames) {
    s.push([n, (layer as any)["get_" + n]()]);
  }

  return s as ImageSetLayerSetting[];
}

/** Copy settings from one `ImageSetLayer`, or equivalent, to another. */
export function copyImageSetLayerSettings(source: ImageSetLayerSettingsInterfaceRO, dest: ImageSetLayerSettingsInterface): void {
  copyLayerSettings(source, dest);

  for (const n of justImageSetLayerSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `ImageSetLayerSettingsInterface`. */
export class ImageSetLayerState extends LayerState implements ImageSetLayerSettingsInterface {
  constructor(source: ImageSetLayerSettingsInterfaceRO) {
    // Here we redundantly copy the generic Layer settings, but TypeScript
    // requires the super() call. Oh well.
    super(source);
    copyImageSetLayerSettings(source, this);
  }

  colorMapperName!: string;

  get_colorMapperName(): string {
    return this.colorMapperName
  }

  set_colorMapperName(v: string): string {
    this.colorMapperName = v;
    return v;
  }

  overrideDefaultLayer!: boolean;

  get_overrideDefaultLayer(): boolean {
    return this.overrideDefaultLayer
  }

  set_overrideDefaultLayer(v: boolean): boolean {
    this.overrideDefaultLayer = v;
    return v;
  }
}
