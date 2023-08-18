// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Types defining UI elements associated with the layer manager.
//
// These don't do anything in the web client, but to preserve API compatibility,
// we keep them hanging around.

import { registerType } from "../typesystem.js";
import { Dialog } from "../utilities/dialog.js";
import { LayerManager } from "./layer_manager.js";


// wwtlib.FrameWizard
//
// This was originally defined in `Utilities/Dialog.cs`.

export function FrameWizard() {
    Dialog.call(this);
}

var FrameWizard$ = {
    OK: function (frame) {
        LayerManager.referenceFrameWizardFinished(frame);
    }
};

registerType("FrameWizard", [FrameWizard, FrameWizard$, Dialog]);


// wwtlib.ReferenceFrameProps
//
// This was originally defined in `Utilities/Dialog.cs`.

export function ReferenceFrameProps() {
    Dialog.call(this);
}

var ReferenceFrameProps$ = {
    OK: function (frame) {
        LayerManager.loadTree();
    }
};

registerType("ReferenceFrameProps", [ReferenceFrameProps, ReferenceFrameProps$, Dialog]);


// wwtlib.GreatCircleDialog
//
// This was originally defined in `Utilities/Dialog.cs`.

export function GreatCircleDialog() {
    Dialog.call(this);
}

var GreatCircleDialog$ = {
    OK: function (frame) { }
};

registerType("GreatCircleDialog", [GreatCircleDialog, GreatCircleDialog$, Dialog]);


// wwtlib.DataVizWizard
//
// This was originally defined in `Utilities/Dialog.cs`.

export function DataVizWizard() {
    Dialog.call(this);
}

var DataVizWizard$ = {
    OK: function () { }
};

registerType("DataVizWizard", [DataVizWizard, DataVizWizard$, Dialog]);


// Initialize:

LayerManager._frameWizardDialog = new FrameWizard();
LayerManager._dataVizWizardDialog = new DataVizWizard();
LayerManager._referenceFramePropsDialog = new ReferenceFrameProps();
LayerManager._greatCircleDialog = new GreatCircleDialog();
