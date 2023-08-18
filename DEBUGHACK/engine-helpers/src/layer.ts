// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling generic layers settings. */

import {
  FadeType,
  isBaseLayerSetting,
} from "@wwtelescope/engine-types";

import {
  Color,
  LayerSetting,
  LayerSettingsInterface,
  LayerSettingsInterfaceRO,
} from "@wwtelescope/engine";

/** A list of the names of the available settings for generic layers. */
export const layerSettingNames = [
  "astronomical",
  "color",
  "enabled",
  "fadeSpan",
  "name",
  "opacity",
  "opened",
  "referenceFrame",
  "version",
];

const layerSettingTypeInfo = {
  "color/Color": true,
};

/** Type guard function for `LayerSetting`. */
export function isLayerSetting(obj: [string, any]): obj is LayerSetting {
  let typekey: string = typeof obj[1];

  if (obj[1] instanceof Color) {
    typekey = "Color";
  }

  const key = obj[0] + "/" + typekey;
  return (key in layerSettingTypeInfo) || isBaseLayerSetting(obj);
}

/** Apply a setting to a generic `Layer` or equivalent. */
export function applyLayerSetting(layer: LayerSettingsInterface, setting: LayerSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (layer as any)[funcName](value);
}

/** Extract all of the current settings of a `Layer` or equivalent. */
export function extractLayerSettings(layer: LayerSettingsInterfaceRO): LayerSetting[] {
  const s: [string, any][] = [];

  for (const n of layerSettingNames) {
    s.push([n, (layer as any)["get_" + n]()]);
  }

  return s as LayerSetting[];
}

/** Copy settings from one `Layer`, or equivalent, to another. */
export function copyLayerSettings(source: LayerSettingsInterfaceRO, dest: LayerSettingsInterface): void {
  for (const n of layerSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `LayerSettingsInterface`. */
export class LayerState implements LayerSettingsInterface {
  // Maybe possible to use remapped keys to create this type?:
  // https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
  // Don't think we can implement functions, though, and we're currently (Aug
  // 2021) on TypeScript 3.9, while the above requires 4.1.

  constructor(source: LayerSettingsInterfaceRO) {
    copyLayerSettings(source, this);
  }

  astronomical!: boolean;

  get_astronomical(): boolean {
    return this.astronomical;
  }

  set_astronomical(v: boolean): boolean {
    this.astronomical = v;
    return v;
  }

  color!: Color;

  get_color(): Color {
    return this.color;
  }

  set_color(v: Color): Color {
    this.color = v;
    return v;
  }

  enabled!: boolean;

  get_enabled(): boolean {
    return this.enabled;
  }

  set_enabled(v: boolean): boolean {
    this.enabled = v;
    return v;
  }

  endTime!: Date;

  get_endTime(): Date {
    return this.endTime;
  }

  set_endTime(v: Date): Date {
    this.endTime = v;
    return v;
  }

  fadeSpan!: number;

  get_fadeSpan(): number {
    return this.fadeSpan;
  }

  set_fadeSpan(v: number): number {
    this.fadeSpan = v;
    return v;
  }

  fadeType!: FadeType;

  get_fadeType(): FadeType {
    return this.fadeType;
  }

  set_fadeType(v: FadeType): FadeType {
    this.fadeType = v;
    return v;
  }

  name!: string;

  get_name(): string {
    return this.name;
  }

  set_name(v: string): string {
    this.name = v;
    return v;
  }

  opacity!: number;

  get_opacity(): number {
    return this.opacity;
  }

  set_opacity(v: number): number {
    this.opacity = v;
    return v;
  }

  opened!: boolean;

  get_opened(): boolean {
    return this.opened;
  }

  set_opened(v: boolean): boolean {
    this.opened = v;
    return v;
  }

  referenceFrame!: string;

  get_referenceFrame(): string {
    return this.referenceFrame;
  }

  set_referenceFrame(v: string): string {
    this.referenceFrame = v;
    return v;
  }

  startTime!: Date;

  get_startTime(): Date {
    return this.startTime;
  }

  set_startTime(v: Date): Date {
    this.startTime = v;
    return v;
  }

  version!: number;

  get_version(): number {
    return this.version;
  }

  set_version(v: number): number {
    this.version = v;
    return v;
  }
}
