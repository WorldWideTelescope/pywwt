/** Helpers for handling generic annotation settings. */
import { AnnotationSetting, AnnotationSettingsInterface, AnnotationSettingsInterfaceRO } from "@wwtelescope/engine";
/** A list of the names of the available settings for annotations. */
export declare const annotationSettingNames: string[];
/** Type guard function for `AnnotationSetting`. */
export declare function isAnnotationSetting(obj: [string, any]): obj is AnnotationSetting;
/** Apply a setting to a generic `Annotation` or equivalent. */
export declare function applyAnnotationSetting(annotation: AnnotationSettingsInterface, setting: AnnotationSetting): void;
/** Extract all of the current settings of a `Annotation` or equivalent. */
export declare function extractAnnotationSettings(annotation: AnnotationSettingsInterfaceRO): AnnotationSetting[];
/** Copy settings from one `Annotation`, or equivalent, to another. */
export declare function copyAnnotationSettings(source: AnnotationSettingsInterfaceRO, dest: AnnotationSettingsInterface): void;
/** A plain-old-data class implementing `AnnotationSettingsInterface`. */
export declare class AnnotationState implements AnnotationSettingsInterface {
    constructor(source: AnnotationSettingsInterfaceRO);
    id: string;
    get_id(): string;
    set_id(v: string): string;
    label: string;
    get_label(): string;
    set_label(v: string): string;
    opacity: number;
    get_opacity(): number;
    set_opacity(v: number): number;
    showHoverLabel: boolean;
    get_showHoverLabel(): boolean;
    set_showHoverLabel(v: boolean): boolean;
    tag: string;
    get_tag(): string;
    set_tag(v: string): string;
}
