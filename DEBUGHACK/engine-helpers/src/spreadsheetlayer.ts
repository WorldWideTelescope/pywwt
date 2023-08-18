// Copyright 2020-2021 the .NET Foundation
// Licensed under the MIT License

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Helpers for handling "spreadsheet" layer settings. */

import {
  AltTypes,
  AltUnits,
  CoordinatesType,
  isBaseSpreadSheetLayerSetting,
  MarkerScales,
  PlotTypes,
  PointScaleTypes,
  RAUnits,
} from "@wwtelescope/engine-types";

import {
  SpreadSheetLayerSetting,
  SpreadSheetLayerSettingsInterface,
  SpreadSheetLayerSettingsInterfaceRO,
} from "@wwtelescope/engine";

import {
  copyLayerSettings,
  extractLayerSettings,
  isLayerSetting,
  layerSettingNames,
  LayerState,
} from "./layer";

const justSpreadSheetLayerSettingNames = [
  "altColumn",
  "altType",
  "altUnit",
  "barChartBitmask",
  "beginRange",
  "cartesianCustomScale",
  "cartesianScale",
  "colorMapColumn",
  "colorMapperName",
  "coordinatesType",
  "decay",
  "dynamicColor",
  "dynamicData",
  "endDateColumn",
  "endRange",
  "geometryColumn",
  "hyperlinkColumn",
  "hyperlinkFormat",
  "latColumn",
  "lngColumn",
  "markerColumn",
  "markerIndex",
  "markerScale",
  "nameColumn",
  "normalizeColorMap",
  "normalizeColorMapMax",
  "normalizeColorMapMin",
  "normalizeSize",
  "normalizeSizeClip",
  "normalizeSizeMax",
  "normalizeSizeMin",
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

/** A list of the names of the available settings for `SpreadSheetLayer`
 * instances and their equivalents (things implementing
 * [[SpreadSheetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export const spreadSheetLayerSettingNames = layerSettingNames.concat(justSpreadSheetLayerSettingNames);

/** Type guard function for `SpreadSheetLayerSetting`. */
export function isSpreadSheetLayerSetting(obj: [string, any]): obj is SpreadSheetLayerSetting {  // eslint-disable-line @typescript-eslint/no-explicit-any
  // No special settings specific to non-base SpreadSheetLayerSetting.
  return isLayerSetting(obj) || isBaseSpreadSheetLayerSetting(obj);
}

/** Apply a setting to a `SpreadSheetLayer` or equivalent. */
export function applySpreadSheetLayerSetting(layer: SpreadSheetLayerSettingsInterface, setting: SpreadSheetLayerSetting): void {
  const funcName = "set_" + setting[0];
  const value: any = setting[1];  // eslint-disable-line @typescript-eslint/no-explicit-any
  (layer as any)[funcName](value);  // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Extract all of the current settings of a `SpreadSheetLayer` or equivalent. */
export function extractSpreadSheetLayerSettings(layer: SpreadSheetLayerSettingsInterfaceRO): SpreadSheetLayerSetting[] {
  const s: [string, any][] = extractLayerSettings(layer);

  for (const n of justSpreadSheetLayerSettingNames) {
    s.push([n, (layer as any)["get_" + n]()]);
  }

  return s as SpreadSheetLayerSetting[];
}

/** Copy settings from one `SpreadSheetLayer`, or equivalent, to another. */
export function copySpreadSheetLayerSettings(source: SpreadSheetLayerSettingsInterfaceRO, dest: SpreadSheetLayerSettingsInterface): void {
  copyLayerSettings(source, dest);

  for (const n of justSpreadSheetLayerSettingNames) {
    (dest as any)["set_" + n]((source as any)["get_" + n]());
  }
}

/** A plain-old-data class implementing `SpreadSheetLayerSettingsInterface`. */
export class SpreadSheetLayerState extends LayerState implements SpreadSheetLayerSettingsInterface {
  constructor(source: SpreadSheetLayerSettingsInterfaceRO) {
    // Here we redundantly copy the generic Layer settings, but TypeScript
    // requires the super() call. Oh well.
    super(source);
    copySpreadSheetLayerSettings(source, this);
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

  barChartBitmask!: number;

  get_barChartBitmask(): number {
    return this.barChartBitmask
  }

  set_barChartBitmask(v: number): number {
    this.barChartBitmask = v;
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

  colorMapperName!: string;

  get_colorMapperName(): string {
    return this.colorMapperName
  }

  set_colorMapperName(v: string): string {
    this.colorMapperName = v;
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

  decay!: number;

  get_decay(): number {
    return this.decay
  }

  set_decay(v: number): number {
    this.decay = v;
    return v;
  }

  dynamicColor!: boolean;

  get_dynamicColor(): boolean {
    return this.dynamicColor
  }

  set_dynamicColor(v: boolean): boolean {
    this.dynamicColor = v;
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

  geometryColumn!: number;

  get_geometryColumn(): number {
    return this.geometryColumn
  }

  set_geometryColumn(v: number): number {
    this.geometryColumn = v;
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

  normalizeColorMap!: boolean;

  get_normalizeColorMap(): boolean {
    return this.normalizeColorMap
  }

  set_normalizeColorMap(v: boolean): boolean {
    this.normalizeColorMap = v;
    return v;
  }

  normalizeColorMapMax!: number;

  get_normalizeColorMapMax(): number {
    return this.normalizeColorMapMax
  }

  set_normalizeColorMapMax(v: number): number {
    this.normalizeColorMapMax = v;
    return v;
  }

  normalizeColorMapMin!: number;

  get_normalizeColorMapMin(): number {
    return this.normalizeColorMapMin
  }

  set_normalizeColorMapMin(v: number): number {
    this.normalizeColorMapMin = v;
    return v;
  }

  normalizeSize!: boolean;

  get_normalizeSize(): boolean {
    return this.normalizeSize
  }

  set_normalizeSize(v: boolean): boolean {
    this.normalizeSize = v;
    return v;
  }

  normalizeSizeClip!: boolean;

  get_normalizeSizeClip(): boolean {
    return this.normalizeSizeClip
  }

  set_normalizeSizeClip(v: boolean): boolean {
    this.normalizeSizeClip = v;
    return v;
  }

  normalizeSizeMax!: number;

  get_normalizeSizeMax(): number {
    return this.normalizeSizeMax
  }

  set_normalizeSizeMax(v: number): number {
    this.normalizeSizeMax = v;
    return v;
  }

  normalizeSizeMin!: number;

  get_normalizeSizeMin(): number {
    return this.normalizeSizeMin
  }

  set_normalizeSizeMin(v: number): number {
    this.normalizeSizeMin = v;
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
