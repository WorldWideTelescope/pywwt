// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// An icon for a "move up one folder" item.

import { registerType } from "./typesystem.js";
import { IThumbnail } from "./interfaces.js";
import { URLHelpers } from "./url_helpers.js";
import { Rectangle } from "./util.js";


// wwtlib.FolderUp

export function FolderUp() {
    this.parent = null;
    this._bounds = new Rectangle();
}

var FolderUp$ = {
    get_name: function () {
        return 'Up Level';
    },

    get_thumbnail: function () {
        return this._thumbnail;
    },

    set_thumbnail: function (value) {
        this._thumbnail = value;
        return value;
    },

    get_thumbnailUrl: function () {
        return URLHelpers.singleton.engineAssetUrl('thumb_folderup.jpg');
    },

    set_thumbnailUrl: function (value) {
        return value;
    },

    get_bounds: function () {
        return this._bounds;
    },

    set_bounds: function (value) {
        this._bounds = value;
        return value;
    },

    get_isImage: function () {
        return false;
    },

    get_isTour: function () {
        return false;
    },

    get_isFolder: function () {
        return false;
    },

    get_isCloudCommunityItem: function () {
        return false;
    },

    get_readOnly: function () {
        return false;
    },

    get_children: function () {
        if (this.parent == null) {
            return [];
        } else {
            return this.parent.get_children();
        }
    }
};

registerType("FolderUp", [FolderUp, FolderUp$, null, IThumbnail]);
