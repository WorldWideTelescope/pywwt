/** Helpers for handling "spreadsheet" layer settings. */
import { AltTypes, AltUnits, CoordinatesType, MarkerScales, PlotTypes, PointScaleTypes, RAUnits } from "@wwtelescope/engine-types";
import { VoTableLayerSetting, VoTableLayerSettingsInterface, VoTableLayerSettingsInterfaceRO } from "@wwtelescope/engine";
import { LayerState } from "./layer";
/** A list of the names of the available settings for `VoTableLayer`
 * instances and their equivalents (things implementing
 * [[VoTableLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export declare const voTableLayerSettingNames: string[];
/** Type guard function for `VoTableLayerSetting`. */
export declare function isVoTableLayerSetting(obj: [string, any]): obj is VoTableLayerSetting;
/** Apply a setting to a `VoTableLayer` or equivalent. */
export declare function applyVoTableLayerSetting(layer: VoTableLayerSettingsInterface, setting: VoTableLayerSetting): void;
/** Extract all of the current settings of a `VoTableLayer` or equivalent. */
export declare function extractVoTableLayerSettings(layer: VoTableLayerSettingsInterfaceRO): VoTableLayerSetting[];
/** Copy settings from one `VoTableLayer`, or equivalent, to another. */
export declare function copyVoTableLayerSettings(source: VoTableLayerSettingsInterfaceRO, dest: VoTableLayerSettingsInterface): void;
/** A plain-old-data class implementing `VoTableLayerSettingsInterface`. */
export declare class VoTableLayerState extends LayerState implements VoTableLayerSettingsInterface {
    constructor(source: VoTableLayerSettingsInterfaceRO);
    altColumn: number;
    get_altColumn(): number;
    set_altColumn(v: number): number;
    altType: AltTypes;
    get_altType(): AltTypes;
    set_altType(v: AltTypes): AltTypes;
    altUnit: AltUnits;
    get_altUnit(): AltUnits;
    set_altUnit(v: AltUnits): AltUnits;
    autoUpdate: boolean;
    get_autoUpdate(): boolean;
    set_autoUpdate(v: boolean): boolean;
    beginRange: Date;
    get_beginRange(): Date;
    set_beginRange(v: Date): Date;
    cartesianCustomScale: number;
    get_cartesianCustomScale(): number;
    set_cartesianCustomScale(v: number): number;
    cartesianScale: AltUnits;
    get_cartesianScale(): AltUnits;
    set_cartesianScale(v: AltUnits): AltUnits;
    colorMapColumn: number;
    get_colorMapColumn(): number;
    set_colorMapColumn(v: number): number;
    coordinatesType: CoordinatesType;
    get_coordinatesType(): CoordinatesType;
    set_coordinatesType(v: CoordinatesType): CoordinatesType;
    dataSourceUrl: string;
    get_dataSourceUrl(): string;
    set_dataSourceUrl(v: string): string;
    decay: number;
    get_decay(): number;
    set_decay(v: number): number;
    dynamicData: boolean;
    get_dynamicData(): boolean;
    set_dynamicData(v: boolean): boolean;
    endDateColumn: number;
    get_endDateColumn(): number;
    set_endDateColumn(v: number): number;
    endRange: Date;
    get_endRange(): Date;
    set_endRange(v: Date): Date;
    hyperlinkColumn: number;
    get_hyperlinkColumn(): number;
    set_hyperlinkColumn(v: number): number;
    hyperlinkFormat: string;
    get_hyperlinkFormat(): string;
    set_hyperlinkFormat(v: string): string;
    latColumn: number;
    get_latColumn(): number;
    set_latColumn(v: number): number;
    lngColumn: number;
    get_lngColumn(): number;
    set_lngColumn(v: number): number;
    markerColumn: number;
    get_markerColumn(): number;
    set_markerColumn(v: number): number;
    markerIndex: number;
    get_markerIndex(): number;
    set_markerIndex(v: number): number;
    markerScale: MarkerScales;
    get_markerScale(): MarkerScales;
    set_markerScale(v: MarkerScales): MarkerScales;
    nameColumn: number;
    get_nameColumn(): number;
    set_nameColumn(v: number): number;
    plotType: PlotTypes;
    get_plotType(): PlotTypes;
    set_plotType(v: PlotTypes): PlotTypes;
    pointScaleType: PointScaleTypes;
    get_pointScaleType(): PointScaleTypes;
    set_pointScaleType(v: PointScaleTypes): PointScaleTypes;
    raUnits: RAUnits;
    get_raUnits(): RAUnits;
    set_raUnits(v: RAUnits): RAUnits;
    scaleFactor: number;
    get_scaleFactor(): number;
    set_scaleFactor(v: number): number;
    showFarSide: boolean;
    get_showFarSide(): boolean;
    set_showFarSide(v: boolean): boolean;
    sizeColumn: number;
    get_sizeColumn(): number;
    set_sizeColumn(v: number): number;
    startDateColumn: number;
    get_startDateColumn(): number;
    set_startDateColumn(v: number): number;
    timeSeries: boolean;
    get_timeSeries(): boolean;
    set_timeSeries(v: boolean): boolean;
    xAxisColumn: number;
    get_xAxisColumn(): number;
    set_xAxisColumn(v: number): number;
    xAxisReverse: boolean;
    get_xAxisReverse(): boolean;
    set_xAxisReverse(v: boolean): boolean;
    yAxisColumn: number;
    get_yAxisColumn(): number;
    set_yAxisColumn(v: number): number;
    yAxisReverse: boolean;
    get_yAxisReverse(): boolean;
    set_yAxisReverse(v: boolean): boolean;
    zAxisColumn: number;
    get_zAxisColumn(): number;
    set_zAxisColumn(v: number): number;
    zAxisReverse: boolean;
    get_zAxisReverse(): boolean;
    set_zAxisReverse(v: boolean): boolean;
}
