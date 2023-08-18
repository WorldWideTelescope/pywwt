// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Types corresponding to popup dialog boxes.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";


// wwtlib.Dialog

export function Dialog() { }

var Dialog$ = {
    add_showDialogHook: function (value) {
        this.__showDialogHook = ss.bindAdd(this.__showDialogHook, value);
    },

    remove_showDialogHook: function (value) {
        this.__showDialogHook = ss.bindSub(this.__showDialogHook, value);
    },

    show: function (dialogArgs, e) {
        if (this.__showDialogHook != null) {
            this.__showDialogHook(dialogArgs, e);
        }
    }
};

registerType("Dialog", [Dialog, Dialog$, null]);
