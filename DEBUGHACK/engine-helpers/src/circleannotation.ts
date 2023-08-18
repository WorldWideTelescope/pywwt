// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling circle annotation settings. */

import {
  CircleAnnotationSetting,
  CircleAnnotationSettingsInterface,
  CircleAnnotationSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  annotationSettingNames,
  AnnotationState,
  copyAnnotationSettings,
  extractAnnotationSettings,
  isAnnotationSetting,
} from './annotation';

const justCircleAnnotationSettingNames = [
  "fill",
  "fillColor",
  "lineColor",
  "lineWidth",
  "radius",
  "skyRelative",
];

/** A list of the names of the available settings for `CircleAnnotation`
 * instances and their equivalents (things implementing
 * [[CircleAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export const circleAnnotationSettingNames = annotationSettingNames.concat(justCircleAnnotationSettingNames);

const circleAnnotationSettingTypeInfo: { [ix: string]: boolean } = {
  "fill/boolean": true,
  "fillColor/string": true,
  "lineColor/string": true,
  "lineWidth/number": true,
  "radius/number": true,
  "skyRelative/boolean": true,
}

/** Type guard function for `CircleAnnotationSetting`. */
export function isCircleAnnotationSetting(obj: [string, any]): obj is CircleAnnotationSetting {
  const key = obj[0] + "/" + typeof obj[1];
  return (key in circleAnnotationSettingTypeInfo) || isAnnotationSetting(obj);
}

/** Apply a setting to a generic `CircleAnnotation` or equivalent. */
export function applyCircleAnnotationSetting(circle: CircleAnnotationSettingsInterface, setting: CircleAnnotationSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (circle as any)[funcName](value);
}

/** Extract all of the current settings of a `CircleAnnotation` or equivalent. */
export function extractCircleAnnotationSettings(circle: CircleAnnotationSettingsInterfaceRO): CircleAnnotationSetting[] {
  const s: [string, any][] = extractAnnotationSettings(circle);

  for (const n of justCircleAnnotationSettingNames) {
    s.push([n, (circle as any)["get_" + n]()]);
  }

  return s as CircleAnnotationSetting[];
}

/** Copy settings from one `CircleAnnotation`, or equivalent, to another. */
export function copyCircleAnnotationSettings(source: CircleAnnotationSettingsInterfaceRO, dest: CircleAnnotationSettingsInterface): void {
  copyAnnotationSettings(source, dest);

  for (const n of justCircleAnnotationSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `CircleAnnotationSettingsInterface`. */
export class CircleAnnotationState extends AnnotationState implements CircleAnnotationSettingsInterface {
  constructor(source: CircleAnnotationSettingsInterfaceRO) {
    super(source);
    copyCircleAnnotationSettings(source, this);
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

  radius!: number;

  get_radius(): number {
    return this.radius;
  }

  set_radius(v: number): number {
    this.radius = v;
    return v;
  }

  skyRelative!: boolean;

  get_skyRelative(): boolean {
    return this.skyRelative;
  }

  set_skyRelative(v: boolean): boolean {
    this.skyRelative = v;
    return v;
  }
}
