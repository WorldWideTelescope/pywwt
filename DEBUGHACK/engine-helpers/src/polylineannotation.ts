// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling polyline annotation settings. */

import {
  PolyLineAnnotationSetting,
  PolyLineAnnotationSettingsInterface,
  PolyLineAnnotationSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  annotationSettingNames,
  AnnotationState,
  copyAnnotationSettings,
  extractAnnotationSettings,
  isAnnotationSetting,
} from './annotation';

const justPolyLineAnnotationSettingNames = [
  "lineColor",
  "lineWidth",
];

/** A list of the names of the available settings for `PolyLineAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyLineAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export const polyLineAnnotationSettingNames = annotationSettingNames.concat(justPolyLineAnnotationSettingNames);

const polyLineAnnotationSettingTypeInfo: { [ix: string]: boolean } = {
  "lineColor/string": true,
  "lineWidth/number": true,
}

/** Type guard function for `PolyLineAnnotationSetting`. */
export function isPolyLineAnnotationSetting(obj: [string, any]): obj is PolyLineAnnotationSetting {
  const key = obj[0] + "/" + typeof obj[1];
  return (key in polyLineAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}

/** Apply a setting to a generic `PolyLineAnnotation` or equivalent. */
export function applyPolyLineAnnotationSetting(poly: PolyLineAnnotationSettingsInterface, setting: PolyLineAnnotationSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (poly as any)[funcName](value);
}

/** Extract all of the current settings of a `PolyLineAnnotation` or equivalent. */
export function extractPolyLineAnnotationSettings(poly: PolyLineAnnotationSettingsInterfaceRO): PolyLineAnnotationSetting[] {
  const s: [string, any][] = extractAnnotationSettings(poly);

  for (const n of justPolyLineAnnotationSettingNames) {
    s.push([n, (poly as any)["get_" + n]()]);
  }

  return s as PolyLineAnnotationSetting[];
}

/** Copy settings from one `PolyLineAnnotation`, or equivalent, to another. */
export function copyPolyLineAnnotationSettings(source: PolyLineAnnotationSettingsInterfaceRO, dest: PolyLineAnnotationSettingsInterface): void {
  copyAnnotationSettings(source, dest);

  for (const n of justPolyLineAnnotationSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `PolyLineAnnotationSettingsInterface`. */
export class PolyLineAnnotationState extends AnnotationState implements PolyLineAnnotationSettingsInterface {
  constructor(source: PolyLineAnnotationSettingsInterfaceRO) {
    super(source);
    copyPolyLineAnnotationSettings(source, this);
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
