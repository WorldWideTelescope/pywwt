/** Helpers for handling polyline annotation settings. */
import { PolyLineAnnotationSetting, PolyLineAnnotationSettingsInterface, PolyLineAnnotationSettingsInterfaceRO } from "@wwtelescope/engine";
import { AnnotationState } from './annotation';
/** A list of the names of the available settings for `PolyLineAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyLineAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export declare const polyLineAnnotationSettingNames: string[];
/** Type guard function for `PolyLineAnnotationSetting`. */
export declare function isPolyLineAnnotationSetting(obj: [string, any]): obj is PolyLineAnnotationSetting;
/** Apply a setting to a generic `PolyLineAnnotation` or equivalent. */
export declare function applyPolyLineAnnotationSetting(poly: PolyLineAnnotationSettingsInterface, setting: PolyLineAnnotationSetting): void;
/** Extract all of the current settings of a `PolyLineAnnotation` or equivalent. */
export declare function extractPolyLineAnnotationSettings(poly: PolyLineAnnotationSettingsInterfaceRO): PolyLineAnnotationSetting[];
/** Copy settings from one `PolyLineAnnotation`, or equivalent, to another. */
export declare function copyPolyLineAnnotationSettings(source: PolyLineAnnotationSettingsInterfaceRO, dest: PolyLineAnnotationSettingsInterface): void;
/** A plain-old-data class implementing `PolyLineAnnotationSettingsInterface`. */
export declare class PolyLineAnnotationState extends AnnotationState implements PolyLineAnnotationSettingsInterface {
    constructor(source: PolyLineAnnotationSettingsInterfaceRO);
    lineColor: string;
    get_lineColor(): string;
    set_lineColor(v: string): string;
    lineWidth: number;
    get_lineWidth(): number;
    set_lineWidth(v: number): number;
}
