// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling poly annotation settings. */

import {
  PolyAnnotationSetting,
  PolyAnnotationSettingsInterface,
  PolyAnnotationSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  annotationSettingNames,
  AnnotationState,
  copyAnnotationSettings,
  extractAnnotationSettings,
  isAnnotationSetting,
} from './annotation';

const justPolyAnnotationSettingNames = [
  "fill",
  "fillColor",
  "lineColor",
  "lineWidth",
];

/** A list of the names of the available settings for `PolyAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export const polyAnnotationSettingNames = annotationSettingNames.concat(justPolyAnnotationSettingNames);

const polyAnnotationSettingTypeInfo: { [ix: string]: boolean } = {
  "fill/boolean": true,
  "fillColor/string": true,
  "lineColor/string": true,
  "lineWidth/number": true,
}

/** Type guard function for `PolyAnnotationSetting`. */
export function isPolyAnnotationSetting(obj: [string, any]): obj is PolyAnnotationSetting {
  const key = obj[0] + "/" + typeof obj[1];
  return (key in polyAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}

/** Apply a setting to a generic `PolyAnnotation` or equivalent. */
export function applyPolyAnnotationSetting(poly: PolyAnnotationSettingsInterface, setting: PolyAnnotationSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (poly as any)[funcName](value);
}

/** Extract all of the current settings of a `PolyAnnotation` or equivalent. */
export function extractPolyAnnotationSettings(poly: PolyAnnotationSettingsInterfaceRO): PolyAnnotationSetting[] {
  const s: [string, any][] = extractAnnotationSettings(poly);

  for (const n of justPolyAnnotationSettingNames) {
    s.push([n, (poly as any)["get_" + n]()]);
  }

  return s as PolyAnnotationSetting[];
}

/** Copy settings from one `PolyAnnotation`, or equivalent, to another. */
export function copyPolyAnnotationSettings(source: PolyAnnotationSettingsInterfaceRO, dest: PolyAnnotationSettingsInterface): void {
  copyAnnotationSettings(source, dest);

  for (const n of justPolyAnnotationSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `PolyAnnotationSettingsInterface`. */
export class PolyAnnotationState extends AnnotationState implements PolyAnnotationSettingsInterface {
  constructor(source: PolyAnnotationSettingsInterfaceRO) {
    super(source);
    copyPolyAnnotationSettings(source, this);
  }

  fill!: boolean;

  get_fill(): boolean {
    return this.fill;
  }

  set_fill(v: boolean): boolean {
    this.fill = v;
    return v;
  }
  fillColor!: string;

  get_fillColor(): string {
    return this.fillColor;
  }

  set_fillColor(v: string): string {
    this.fillColor = v;
    return v;
  }

  lineColor!: string;

  get_lineColor(): string {
    return this.lineColor;
  }

  set_lineColor(v: string): string {
    this.lineColor = v;
    return v;
  }

  lineWidth!: number;

  get_lineWidth(): number {
    return this.lineWidth;
  }

  set_lineWidth(v: number): number {
    this.lineWidth = v;
    return v;
  }
}
