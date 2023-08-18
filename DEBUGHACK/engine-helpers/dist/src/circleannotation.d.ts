/** Helpers for handling circle annotation settings. */
import { CircleAnnotationSetting, CircleAnnotationSettingsInterface, CircleAnnotationSettingsInterfaceRO } from "@wwtelescope/engine";
import { AnnotationState } from './annotation';
/** A list of the names of the available settings for `CircleAnnotation`
 * instances and their equivalents (things implementing
 * [[CircleAnnotationSettingsInterface]]).
 *
 * This is a superset of the names available for generic annotations.
*/
export declare const circleAnnotationSettingNames: string[];
/** Type guard function for `CircleAnnotationSetting`. */
export declare function isCircleAnnotationSetting(obj: [string, any]): obj is CircleAnnotationSetting;
/** Apply a setting to a generic `CircleAnnotation` or equivalent. */
export declare function applyCircleAnnotationSetting(circle: CircleAnnotationSettingsInterface, setting: CircleAnnotationSetting): void;
/** Extract all of the current settings of a `CircleAnnotation` or equivalent. */
export declare function extractCircleAnnotationSettings(circle: CircleAnnotationSettingsInterfaceRO): CircleAnnotationSetting[];
/** Copy settings from one `CircleAnnotation`, or equivalent, to another. */
export declare function copyCircleAnnotationSettings(source: CircleAnnotationSettingsInterfaceRO, dest: CircleAnnotationSettingsInterface): void;
/** A plain-old-data class implementing `CircleAnnotationSettingsInterface`. */
export declare class CircleAnnotationState extends AnnotationState implements CircleAnnotationSettingsInterface {
    constructor(source: CircleAnnotationSettingsInterfaceRO);
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
    radius: number;
    get_radius(): number;
    set_radius(v: number): number;
    skyRelative: boolean;
    get_skyRelative(): boolean;
    set_skyRelative(v: boolean): boolean;
}
