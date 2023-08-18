/** Helpers for handling generic layers settings. */
import { FadeType } from "@wwtelescope/engine-types";
import { Color, LayerSetting, LayerSettingsInterface, LayerSettingsInterfaceRO } from "@wwtelescope/engine";
/** A list of the names of the available settings for generic layers. */
export declare const layerSettingNames: string[];
/** Type guard function for `LayerSetting`. */
export declare function isLayerSetting(obj: [string, any]): obj is LayerSetting;
/** Apply a setting to a generic `Layer` or equivalent. */
export declare function applyLayerSetting(layer: LayerSettingsInterface, setting: LayerSetting): void;
/** Extract all of the current settings of a `Layer` or equivalent. */
export declare function extractLayerSettings(layer: LayerSettingsInterfaceRO): LayerSetting[];
/** Copy settings from one `Layer`, or equivalent, to another. */
export declare function copyLayerSettings(source: LayerSettingsInterfaceRO, dest: LayerSettingsInterface): void;
/** A plain-old-data class implementing `LayerSettingsInterface`. */
export declare class LayerState implements LayerSettingsInterface {
    constructor(source: LayerSettingsInterfaceRO);
    astronomical: boolean;
    get_astronomical(): boolean;
    set_astronomical(v: boolean): boolean;
    color: Color;
    get_color(): Color;
    set_color(v: Color): Color;
    enabled: boolean;
    get_enabled(): boolean;
    set_enabled(v: boolean): boolean;
    endTime: Date;
    get_endTime(): Date;
    set_endTime(v: Date): Date;
    fadeSpan: number;
    get_fadeSpan(): number;
    set_fadeSpan(v: number): number;
    fadeType: FadeType;
    get_fadeType(): FadeType;
    set_fadeType(v: FadeType): FadeType;
    name: string;
    get_name(): string;
    set_name(v: string): string;
    opacity: number;
    get_opacity(): number;
    set_opacity(v: number): number;
    opened: boolean;
    get_opened(): boolean;
    set_opened(v: boolean): boolean;
    referenceFrame: string;
    get_referenceFrame(): string;
    set_referenceFrame(v: string): string;
    startTime: Date;
    get_startTime(): Date;
    set_startTime(v: Date): Date;
    version: number;
    get_version(): number;
    set_version(v: number): number;
}
