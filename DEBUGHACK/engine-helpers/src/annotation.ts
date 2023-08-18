// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling generic annotation settings. */

import {
  AnnotationSetting,
  AnnotationSettingsInterface,
  AnnotationSettingsInterfaceRO,
} from "@wwtelescope/engine";

/** A list of the names of the available settings for annotations. */
export const annotationSettingNames = [
  "id",
  "label",
  "opacity",
  "showHoverLabel",
  "tag",
];

const annotationSettingTypeInfo: { [ix: string]: boolean } = {
  "id/string": true,
  "label/string": true,
  "opacity/number": true,
  "showHoverLabel/boolean": true,
  "tag/string": true,
}

/** Type guard function for `AnnotationSetting`. */
export function isAnnotationSetting(obj: [string, any]): obj is AnnotationSetting {
  const key = obj[0] + "/" + typeof obj[1];
  return key in annotationSettingTypeInfo;
}

/** Apply a setting to a generic `Annotation` or equivalent. */
export function applyAnnotationSetting(annotation: AnnotationSettingsInterface, setting: AnnotationSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];
  (annotation as any)[funcName](value);
}

/** Extract all of the current settings of a `Annotation` or equivalent. */
export function extractAnnotationSettings(annotation: AnnotationSettingsInterfaceRO): AnnotationSetting[] {
  const s: [string, any][] = [];

  for (const n of annotationSettingNames) {
    s.push([n, (annotation as any)["get_" + n]()]);
  }

  return s as AnnotationSetting[];
}

/** Copy settings from one `Annotation`, or equivalent, to another. */
export function copyAnnotationSettings(source: AnnotationSettingsInterfaceRO, dest: AnnotationSettingsInterface): void {
  for (const n of annotationSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `AnnotationSettingsInterface`. */
export class AnnotationState implements AnnotationSettingsInterface {
  constructor(source: AnnotationSettingsInterfaceRO) {
    copyAnnotationSettings(source, this);
  }

  id!: string;

  get_id(): string {
    return this.id;
  }

  set_id(v: string): string {
    this.id = v;
    return v;
  }

  label!: string;

  get_label(): string {
    return this.label;
  }

  set_label(v: string): string {
    this.label = v;
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

  showHoverLabel!: boolean;

  get_showHoverLabel(): boolean {
    return this.showHoverLabel;
  }

  set_showHoverLabel(v: boolean): boolean {
    this.showHoverLabel = v;
    return v;
  }

  tag!: string;

  get_tag(): string {
    return this.tag;
  }

  set_tag(v: string): string {
    this.tag = v;
    return v;
  }
}
