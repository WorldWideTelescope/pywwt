import { ImageSetLayerSetting, ImageSetLayerSettingsInterface, ImageSetLayerSettingsInterfaceRO } from "@wwtelescope/engine";
import { LayerState } from "./layer";
/** A list of the names of the available settings for `ImageSetLayer`
 * instances and their equivalents (things implementing
 * [[ImageSetLayerSettingsInterface]]).
 *
 * This is a superset of the names available for generic layers.
*/
export declare const imageSetLayerSettingNames: string[];
/** Type guard function for `ImageSetLayerSetting`. */
export declare function isImageSetLayerSetting(obj: [string, any]): obj is ImageSetLayerSetting;
/** Apply a setting to a `ImageSetLayer` or equivalent. */
export declare function applyImageSetLayerSetting(layer: ImageSetLayerSettingsInterface, setting: ImageSetLayerSetting): void;
/** Extract all of the current settings of a `ImageSetLayer` or equivalent. */
export declare function extractImageSetLayerSettings(layer: ImageSetLayerSettingsInterfaceRO): ImageSetLayerSetting[];
/** Copy settings from one `ImageSetLayer`, or equivalent, to another. */
export declare function copyImageSetLayerSettings(source: ImageSetLayerSettingsInterfaceRO, dest: ImageSetLayerSettingsInterface): void;
/** A plain-old-data class implementing `ImageSetLayerSettingsInterface`. */
export declare class ImageSetLayerState extends LayerState implements ImageSetLayerSettingsInterface {
    constructor(source: ImageSetLayerSettingsInterfaceRO);
    colorMapperName: string;
    get_colorMapperName(): string;
    set_colorMapperName(v: string): string;
    overrideDefaultLayer: boolean;
    get_overrideDefaultLayer(): boolean;
    set_overrideDefaultLayer(v: boolean): boolean;
}
