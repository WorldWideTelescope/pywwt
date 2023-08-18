/** Helpers for handling poly annotation settings. */
import { PolyAnnotationSetting, PolyAnnotationSettingsInterface, PolyAnnotationSettingsInterfaceRO } from "@wwtelescope/engine";
import { AnnotationState } from './annotation';
/** A list of the names of the available settings for `PolyAnnotation`
 * instances and their equivalents (things implementing
 * [[PolyAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export declare const polyAnnotationSettingNames: string[];
/** Type guard function for `PolyAnnotationSetting`. */
export declare function isPolyAnnotationSetting(obj: [string, any]): obj is PolyAnnotationSetting;
/** Apply a setting to a generic `PolyAnnotation` or equivalent. */
export declare function applyPolyAnnotationSetting(poly: PolyAnnotationSettingsInterface, setting: PolyAnnotationSetting): void;
/** Extract all of the current settings of a `PolyAnnotation` or equivalent. */
export declare function extractPolyAnnotationSettings(poly: PolyAnnotationSettingsInterfaceRO): PolyAnnotationSetting[];
/** Copy settings from one `PolyAnnotation`, or equivalent, to another. */
export declare function copyPolyAnnotationSettings(source: PolyAnnotationSettingsInterfaceRO, dest: PolyAnnotationSettingsInterface): void;
/** A plain-old-data class implementing `PolyAnnotationSettingsInterface`. */
export declare class PolyAnnotationState extends AnnotationState implements PolyAnnotationSettingsInterface {
    constructor(source: PolyAnnotationSettingsInterfaceRO);
    fill: boolean;
    get_fill(): boolean;
    set_fill(v: boolean): boolean;
    fillColor: string;
    get_fillColor(): string;
    set_fillColor(v: string): string;
    lineColor: string;
    get_lineColor(): string;
    set_lineColor(v: string): string;
    lineWidth: number;
    get_lineWidth(): number;
    set_lineWidth(v: number): number;
}
