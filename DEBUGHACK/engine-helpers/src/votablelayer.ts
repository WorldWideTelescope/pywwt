// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling "spreadsheet" layer settings. */

import {
  AltTypes,
  AltUnits,
  CoordinatesType,
  isBaseVoTableLayerSetting,
  MarkerScales,
  PlotTypes,
  PointScaleTypes,
  RAUnits,
} from "@wwtelescope/engine-types";

import {
  VoTableLayerSetting,
  VoTableLayerSettingsInterface,
  VoTableLayerSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  copyLayerSettings,
  extractLayerSettings,
  isLayerSetting,
  layerSettingNames,
  LayerState,
} from "./layer";

const justVoTableLayerSettingNames = [
  "altColumn",
  "altType",
  "altUnit",
  "autoUpdate",
  "beginRange",
  "cartesianCustomScale",
  "cartesianScale",
  "colorMapColumn",
  "coordinatesType",
  "dataSourceUrl",
  "decay",
  "dynamicData",
  "endDateColumn",
  "endRange",
  "hyperlinkColumn",
  "hyperlinkFormat",
  "latColumn",
  "lngColumn",
  "markerColumn",
  "markerIndex",
  "markerScale",
  "nameColumn",
  "plotType",
  "pointScaleType",
  "raUnits",
  "scaleFactor",
  "showFarSide",
  "sizeColumn",
  "startDateColumn",
  "timeSeries",
  "xAxisColumn",
  "xAxisReverse",
  "yAxisColumn",
  "yAxisReverse",
  "zAxisColumn",
  "zAxisReverse",
];

/** A list of the names of the available settings for `VoTableLayer`
 * instances and their equivalents (things implementing
 * [[VoTableLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export const voTableLayerSettingNames = layerSettingNames.concat(justVoTableLayerSettingNames);

/** Type guard function for `VoTableLayerSetting`. */
export function isVoTableLayerSetting(obj: [string, any]): obj is VoTableLayerSetting {  // eslint-disable-line @typescript-eslint/no-explicit-any
  // No special settings specific to non-base VoTableLayerSetting.
  return isLayerSetting(obj) || isBaseVoTableLayerSetting(obj);
}

/** Apply a setting to a `VoTableLayer` or equivalent. */
export function applyVoTableLayerSetting(layer: VoTableLayerSettingsInterface, setting: VoTableLayerSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];  // eslint-disable-line @typescript-eslint/no-explicit-any
  (layer as any)[funcName](value);  // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Extract all of the current settings of a `VoTableLayer` or equivalent. */
export function extractVoTableLayerSettings(layer: VoTableLayerSettingsInterfaceRO): VoTableLayerSetting[] {
  const s: [string, any][] = extractLayerSettings(layer);

  for (const n of justVoTableLayerSettingNames) {
    s.push([n, (layer as any)["get_" + n]()]);
  }

  return s as VoTableLayerSetting[];
}

/** Copy settings from one `VoTableLayer`, or equivalent, to another. */
export function copyVoTableLayerSettings(source: VoTableLayerSettingsInterfaceRO, dest: VoTableLayerSettingsInterface): void {
  copyLayerSettings(source, dest);

  for (const n of justVoTableLayerSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `VoTableLayerSettingsInterface`. */
export class VoTableLayerState extends LayerState implements VoTableLayerSettingsInterface {
  constructor(source: VoTableLayerSettingsInterfaceRO) {
    // Here we redundantly copy the generic Layer settings, but TypeScript
    // requires the super() call. Oh well.
    super(source);
    copyVoTableLayerSettings(source, this);
  }

  altColumn!: number;

  get_altColumn(): number {
    return this.altColumn
  }

  set_altColumn(v: number): number {
    this.altColumn = v;
    return v;
  }

  altType!: AltTypes;

  get_altType(): AltTypes {
    return this.altType
  }

  set_altType(v: AltTypes): AltTypes {
    this.altType = v;
    return v;
  }

  altUnit!: AltUnits;

  get_altUnit(): AltUnits {
    return this.altUnit
  }

  set_altUnit(v: AltUnits): AltUnits {
    this.altUnit = v;
    return v;
  }

  autoUpdate!: boolean;

  get_autoUpdate(): boolean {
    return this.autoUpdate
  }

  set_autoUpdate(v: boolean): boolean {
    this.autoUpdate = v;
    return v;
  }

  beginRange!: Date;

  get_beginRange(): Date {
    return this.beginRange
  }

  set_beginRange(v: Date): Date {
    this.beginRange = v;
    return v;
  }

  cartesianCustomScale!: number;

  get_cartesianCustomScale(): number {
    return this.cartesianCustomScale
  }

  set_cartesianCustomScale(v: number): number {
    this.cartesianCustomScale = v;
    return v;
  }

  cartesianScale!: AltUnits;

  get_cartesianScale(): AltUnits {
    return this.cartesianScale
  }

  set_cartesianScale(v: AltUnits): AltUnits {
    this.cartesianScale = v;
    return v;
  }

  colorMapColumn!: number;

  get_colorMapColumn(): number {
    return this.colorMapColumn
  }

  set_colorMapColumn(v: number): number {
    this.colorMapColumn = v;
    return v;
  }

  coordinatesType!: CoordinatesType;

  get_coordinatesType(): CoordinatesType {
    return this.coordinatesType
  }

  set_coordinatesType(v: CoordinatesType): CoordinatesType {
    this.coordinatesType = v;
    return v;
  }

  dataSourceUrl!: string;

  get_dataSourceUrl(): string {
    return this.dataSourceUrl
  }

  set_dataSourceUrl(v: string): string {
    this.dataSourceUrl = v;
    return v;
  }

  decay!: number;

  get_decay(): number {
    return this.decay
  }

  set_decay(v: number): number {
    this.decay = v;
    return v;
  }

  dynamicData!: boolean;

  get_dynamicData(): boolean {
    return this.dynamicData
  }

  set_dynamicData(v: boolean): boolean {
    this.dynamicData = v;
    return v;
  }

  endDateColumn!: number;

  get_endDateColumn(): number {
    return this.endDateColumn
  }

  set_endDateColumn(v: number): number {
    this.endDateColumn = v;
    return v;
  }

  endRange!: Date;

  get_endRange(): Date {
    return this.endRange
  }

  set_endRange(v: Date): Date {
    this.endRange = v;
    return v;
  }

  hyperlinkColumn!: number;

  get_hyperlinkColumn(): number {
    return this.hyperlinkColumn
  }

  set_hyperlinkColumn(v: number): number {
    this.hyperlinkColumn = v;
    return v;
  }

  hyperlinkFormat!: string;

  get_hyperlinkFormat(): string {
    return this.hyperlinkFormat
  }

  set_hyperlinkFormat(v: string): string {
    this.hyperlinkFormat = v;
    return v;
  }

  latColumn!: number;

  get_latColumn(): number {
    return this.latColumn
  }

  set_latColumn(v: number): number {
    this.latColumn = v;
    return v;
  }

  lngColumn!: number;

  get_lngColumn(): number {
    return this.lngColumn
  }

  set_lngColumn(v: number): number {
    this.lngColumn = v;
    return v;
  }

  markerColumn!: number;

  get_markerColumn(): number {
    return this.markerColumn
  }

  set_markerColumn(v: number): number {
    this.markerColumn = v;
    return v;
  }

  markerIndex!: number;

  get_markerIndex(): number {
    return this.markerIndex
  }

  set_markerIndex(v: number): number {
    this.markerIndex = v;
    return v;
  }

  markerScale!: MarkerScales;

  get_markerScale(): MarkerScales {
    return this.markerScale
  }

  set_markerScale(v: MarkerScales): MarkerScales {
    this.markerScale = v;
    return v;
  }

  nameColumn!: number;

  get_nameColumn(): number {
    return this.nameColumn
  }

  set_nameColumn(v: number): number {
    this.nameColumn = v;
    return v;
  }

  plotType!: PlotTypes;

  get_plotType(): PlotTypes {
    return this.plotType
  }

  set_plotType(v: PlotTypes): PlotTypes {
    this.plotType = v;
    return v;
  }

  pointScaleType!: PointScaleTypes;

  get_pointScaleType(): PointScaleTypes {
    return this.pointScaleType
  }

  set_pointScaleType(v: PointScaleTypes): PointScaleTypes {
    this.pointScaleType = v;
    return v;
  }

  raUnits!: RAUnits;

  get_raUnits(): RAUnits {
    return this.raUnits
  }

  set_raUnits(v: RAUnits): RAUnits {
    this.raUnits = v;
    return v;
  }

  scaleFactor!: number;

  get_scaleFactor(): number {
    return this.scaleFactor
  }

  set_scaleFactor(v: number): number {
    this.scaleFactor = v;
    return v;
  }

  showFarSide!: boolean;

  get_showFarSide(): boolean {
    return this.showFarSide
  }

  set_showFarSide(v: boolean): boolean {
    this.showFarSide = v;
    return v;
  }

  sizeColumn!: number;

  get_sizeColumn(): number {
    return this.sizeColumn
  }

  set_sizeColumn(v: number): number {
    this.sizeColumn = v;
    return v;
  }

  startDateColumn!: number;

  get_startDateColumn(): number {
    return this.startDateColumn
  }

  set_startDateColumn(v: number): number {
    this.startDateColumn = v;
    return v;
  }

  timeSeries!: boolean;

  get_timeSeries(): boolean {
    return this.timeSeries
  }

  set_timeSeries(v: boolean): boolean {
    this.timeSeries = v;
    return v;
  }

  xAxisColumn!: number;

  get_xAxisColumn(): number {
    return this.xAxisColumn
  }

  set_xAxisColumn(v: number): number {
    this.xAxisColumn = v;
    return v;
  }

  xAxisReverse!: boolean;

  get_xAxisReverse(): boolean {
    return this.xAxisReverse
  }

  set_xAxisReverse(v: boolean): boolean {
    this.xAxisReverse = v;
    return v;
  }

  yAxisColumn!: number;

  get_yAxisColumn(): number {
    return this.yAxisColumn
  }

  set_yAxisColumn(v: number): number {
    this.yAxisColumn = v;
    return v;
  }

  yAxisReverse!: boolean;

  get_yAxisReverse(): boolean {
    return this.yAxisReverse
  }

  set_yAxisReverse(v: boolean): boolean {
    this.yAxisReverse = v;
    return v;
  }

  zAxisColumn!: number;

  get_zAxisColumn(): number {
    return this.zAxisColumn
  }

  set_zAxisColumn(v: number): number {
    this.zAxisColumn = v;
    return v;
  }

  zAxisReverse!: boolean;

  get_zAxisReverse(): boolean {
    return this.zAxisReverse
  }

  set_zAxisReverse(v: boolean): boolean {
    this.zAxisReverse = v;
    return v;
  }
}
