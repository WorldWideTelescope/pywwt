// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Global methods for dealing with WTML folders.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { globalRenderContext } from "./render_globals.js";
import { set_loadWtmlFile } from "./data_globals.js";
import { Imageset } from "./imageset.js";
import { Place } from "./place.js";
import { Folder } from "./folder.js";
import { WWTControl } from "./wwt_control.js";


// wwtlib.FolderDownloadAction

export function FolderDownloadAction(action, loadChildFolders) {
    this.loadChildFolders = false;
    this._numLoadingFolders = 0;
    this._onComplete = action;
    this.loadChildFolders = loadChildFolders;
}

var FolderDownloadAction$ = {
    _folderLoaded: function () {
        this._numLoadingFolders--;
        if (!this._numLoadingFolders) {
            this._onComplete();
        }
    },

    startingNewFolderLoad: function (folder) {
        var $this = this;

        this._numLoadingFolders++;
        folder.childLoadCallback(function () {
            Wtml.loadImagesets(folder, $this);
            $this._folderLoaded();
        });
    }
};

registerType("FolderDownloadAction", [FolderDownloadAction, FolderDownloadAction$, null]);


// wwtlib.Wtml

export function Wtml() { }

Wtml.getWtmlFile = function (url, complete, loadChildFolders) {
    if (loadChildFolders == null) {
        loadChildFolders = false;
    }
    var folder = new Folder();
    folder.set_url(url);
    var folderDownloadAction = new FolderDownloadAction(complete, loadChildFolders);
    folderDownloadAction.startingNewFolderLoad(folder);
    return folder;
};

set_loadWtmlFile(Wtml.getWtmlFile);

Wtml.loadImagesets = function (folder, folderDownloadAction) {
    var children = folder.get_children();
    var $enum1 = ss.enumerate(children);

    while ($enum1.moveNext()) {
        var child = $enum1.current;
        if (ss.canCast(child, Imageset)) {
            var imageSet = child;
            WWTControl.addImageSetToRepository(imageSet);
        }
        if (ss.canCast(child, Place)) {
            var place = child;
            if (place.get_studyImageset() != null) {
                WWTControl.addImageSetToRepository(place.get_studyImageset());
            }
            if (place.get_backgroundImageset() != null) {
                WWTControl.addImageSetToRepository(place.get_backgroundImageset());
            }
        }
        if (ss.canCast(child, Folder) && folderDownloadAction.loadChildFolders) {
            folderDownloadAction.startingNewFolderLoad((child));
        }
    }

    if (!ss.emptyString(WWTControl.imageSetName)) {
        var name = WWTControl.imageSetName.toLowerCase();
        var $enum2 = ss.enumerate(WWTControl.getImageSets());
        while ($enum2.moveNext()) {
            var imageset = $enum2.current;
            if (imageset.get_name().toLowerCase() === name) {
                globalRenderContext.set_backgroundImageset(imageset);
            }
        }
    }
};

var Wtml$ = {};

registerType("Wtml", [Wtml, Wtml$, null]);
