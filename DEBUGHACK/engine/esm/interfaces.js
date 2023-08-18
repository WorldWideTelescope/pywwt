// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// "Classes" corresponding to C# interfaces
//
// In our current JS translation, these classes don't declare anything
// themselves. They can in principle be used in `canCast()` calls for dynamic
// type checking, but it appears that we don't use this functionality in the
// current codebase.
//
// If/when we translate to TypeScript, these could become TypeScript interfaces
// that are more useful.
//
// Files in this module used to be in
// `I{Folder,IThumbnail,Place,UIController,ViewMover,Tours/ISettings}.cs`. Note
// that the source file was indeed (incorrectly) named `IIThumbnail.cs`.

import { registerType } from "./typesystem.js";


// wwtlib.IFolder

export function IFolder() { }

registerType("IFolder", [IFolder]);


// wwtlib.IThumbnail

export function IThumbnail() { }

registerType("IThumbnail", [IThumbnail]);


// wwtlib.IPlace

export function IPlace() { }

registerType("IPlace", [IPlace]);


// wwtlib.IUiController

export function IUiController() { }

registerType("IUiController", [IUiController]);


// wwtlib.IViewMover

export function IViewMover() { }

registerType("IViewMover", [IViewMover]);


// wwtlib.IUIServicesCallbacks

export function IUIServicesCallbacks() { }

registerType("IUIServicesCallbacks", [IUIServicesCallbacks]);


// wwtlib.ISettings

export function ISettings() { }

registerType("ISettings", [ISettings]);


// wwtlib.IUndoStep

export function IUndoStep() { }

registerType("IUndoStep", [IUndoStep]);
