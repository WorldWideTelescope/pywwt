// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A WTML folder of different kinds of WWT content.

import { ss } from "./ss.js";
import { registerType, registerEnum } from "./typesystem.js";
import { set_makeNewFolder } from "./data_globals.js";
import { Util } from "./baseutil.js";
import { IThumbnail } from "./interfaces.js";
import { URLHelpers } from "./url_helpers.js";
import { FolderUp } from "./folder_up.js";
import { Imageset } from "./imageset.js";
import { Place } from "./place.js";
import { Tour } from "./tour.js";
import { WebFile } from "./web_file.js";


// wwtlib.FolderGroup

export var FolderGroup = {
    explorer: 0,
    tour: 1,
    search: 2,
    constellation: 3,
    view: 4,
    goTo: 5,
    community: 6,
    context: 7,
    voTable: 8,
    imageStack: 9
};

registerType("FolderGroup", FolderGroup);
registerEnum("FolderGroup", FolderGroup);


// wwtlib.FolderRefreshType

export var FolderRefreshType = {
    interval: 0,
    conditionalGet: 1,
    viewChange: 2
};

registerType("FolderRefreshType", FolderRefreshType);
registerEnum("FolderRefreshType", FolderRefreshType);


// wwtlib.FolderType

export var FolderType = {
    earth: 0,
    planet: 1,
    sky: 2,
    panorama: 3
};

registerType("FolderType", FolderType);
registerEnum("FolderType", FolderType);


// wwtlib.Folder

export function Folder() {
    this.parent = null;
    this.isProxy = false;
    this._versionDependent = false;
    this._readOnly = true;
    this._dirty = false;
    this._thumbnail = null;
    this._proxyFolder = null;
    this._lastUpdate = new Date();
    this._childList = [];
    this._itemsField = [];
    this._imagesets = [];
    this._tours = [];
    this._folders = [];
    this._places = [];
    this._groupField = 0;
    this._refreshTypeField = 0;
    this._refreshTypeFieldSpecified = false;
    this._browseableField = true;
    this._browseableFieldSpecified = false;
    this._searchableField = false;
    this._typeField = 0;
    this._communityIdField = 0;
    this._componentIdField = 0;
    this._permissionField = 0;
}

var Folder$ = {
    toString: function () {
        return this._nameField;
    },

    get_versionDependent: function () {
        return this._versionDependent;
    },

    set_versionDependent: function (value) {
        this._versionDependent = value;
        var $enum1 = ss.enumerate(this._folders);
        while ($enum1.moveNext()) {
            var folder = $enum1.current;
            folder.set_versionDependent(this._versionDependent);
        }
        return value;
    },

    get_readOnly: function () {
        return this._readOnly;
    },

    set_readOnly: function (value) {
        this._readOnly = value;
        return value;
    },

    get_dirty: function () {
        return this._dirty;
    },

    set_dirty: function (value) {
        this._dirty = value;
        return value;
    },

    loadFromUrlWithErrorCallback: function (url, complete, onError) {
        this._onError = onError;
        this.loadFromUrl(url, complete);
    },

    loadFromUrl: function (url, complete) {
        this._onComplete = complete;
        this._webFile = new WebFile(URLHelpers.singleton.rewrite(url, 1));
        this._webFile.onStateChange = ss.bind('_loadData', this);
        this._webFile.send();
    },

    _loadData: function () {
        if (this._webFile.get_state() === 2) {
            console.error(this._webFile.get_message());
            if (this._onError != null) {
                this._onError();
            }
        } else if (this._webFile.get_state() === 1) {
            var node = Util.selectSingleNode(this._webFile.getXml(), 'Folder');
            if (node == null) {
                var doc = this._webFile.getXml();
                if (doc != null) {
                    node = Util.selectSingleNode(doc, 'Folder');
                }
            }
            if (node != null) {
                this._clearChildren();
                this._parseXML(node);
            }
            if (this._onComplete != null) {
                this._onComplete();
            }
        }
    },

    _clearChildren: function () {
        this._folders.length = 0;
        this._tours.length = 0;
        this._places.length = 0;
        this.get_imagesets().length = 0;
    },

    _parseXML: function (node) {
        if (node.attributes.getNamedItem('Name') != null) {
            this._nameField = node.attributes.getNamedItem('Name').nodeValue;
        } else {
            this._nameField = '';
        }
        if (node.attributes.getNamedItem('Url') != null) {
            this._urlField = node.attributes.getNamedItem('Url').nodeValue;
        }
        if (node.attributes.getNamedItem('Thumbnail') != null) {
            this._thumbnailUrlField = node.attributes.getNamedItem('Thumbnail').nodeValue;
        }

        // load Children

        var $enum1 = ss.enumerate(node.childNodes);
        while ($enum1.moveNext()) {
            var child = $enum1.current;
            switch (child.nodeName) {
                case 'Folder':
                    var temp = new Folder();
                    temp.parent = this;
                    temp._parseXML(child);
                    this._folders.push(temp);
                    break;
                case 'Place':
                    this._places.push(Place._fromXml(child));
                    break;
                case 'ImageSet':
                    this.get_imagesets().push(Imageset.fromXMLNode(child));
                    break;
                case 'Tour':
                    this.get_tours().push(Tour._fromXml(child));
                    break;
            }
        }
    },

    addChildFolder: function (child) {
        this._folders.push(child);
        this._dirty = true;
    },

    removeChildFolder: function (child) {
        ss.remove(this._folders, child);
        this._dirty = true;
    },

    addChildPlace: function (child) {
        this._places.push(child);
        this._dirty = true;
    },

    removeChildPlace: function (child) {
        ss.remove(this._places, child);
        this._dirty = true;
    },

    get_thumbnail: function () {
        return this._thumbnail;
    },

    set_thumbnail: function (value) {
        this._thumbnail = value;
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
        return true;
    },

    get_isCloudCommunityItem: function () {
        return !!this._communityIdField || this._permissionField > 0;
    },

    refresh: function () {
        if (this._proxyFolder == null) {
            this._proxyFolder = new Folder();
            this._proxyFolder.isProxy = true;
            this._proxyFolder.parent = this.parent;
        }

        //Also listening to errors, to make sure clients do not wait forever in
        //the case of a 404 or similar. Especially useful for recursive
        //downloads, where potentially dozens of URL's are downloaded. In case
        //of errors during downloads, the clients will have an empty folder
        //during the callback.
        this._proxyFolder.loadFromUrlWithErrorCallback(this._urlField, this._childReadyCallback, this._childReadyCallback);
        this._childReadyCallback = null;
    },

    childLoadCallback: function (callback) {
        this._childReadyCallback = callback;
        var temp = this.get_children();
        if (this._proxyFolder == null) {
            callback();
        }
    },

    get_children: function () {
        if (ss.emptyString(this._urlField)) {
            this._childList.length = 0;
            if (this.parent != null) {
                var folderUp = new FolderUp();
                folderUp.parent = this.parent;
                this._childList.push(folderUp);
            }
            if (this.get_folders() != null) {
                var $enum1 = ss.enumerate(this.get_folders());
                while ($enum1.moveNext()) {
                    var folder = $enum1.current;
                    this._childList.push(folder);
                }
            }
            if (this.get_imagesets() != null) {
                var $enum2 = ss.enumerate(this.get_imagesets());
                while ($enum2.moveNext()) {
                    var imset = $enum2.current;
                    this._childList.push(imset);
                }
            }
            if (this.get_places() != null) {
                var $enum3 = ss.enumerate(this.get_places());
                while ($enum3.moveNext()) {
                    var place = $enum3.current;
                    this._childList.push(place);
                }
            }
            if (this.get_tours() != null) {
                var $enum4 = ss.enumerate(this.get_tours());
                while ($enum4.moveNext()) {
                    var tour = $enum4.current;
                    this._childList.push(tour);
                }
            }
            return this._childList;
        } else {
            var ts = (this._lastUpdate - ss.now()) / 1000;
            if (this.get_refreshType() === 1 || this._proxyFolder == null || (!this.get_refreshType() && (parseInt(this._refreshIntervalField) < ts))) {
                this.refresh();
            }
            if (this._proxyFolder != null) {
                return this._proxyFolder.get_children();
            }
            else {
                return null;
            }
        }
    },

    get_msrCommunityId: function () {
        return this._communityIdField;
    },

    set_msrCommunityId: function (value) {
        this._communityIdField = value;
        return value;
    },

    get_msrComponentId: function () {
        return this._componentIdField;
    },

    set_msrComponentId: function (value) {
        this._componentIdField = value;
        return value;
    },

    get_permission: function () {
        return this._permissionField;
    },

    set_permission: function (value) {
        this._permissionField = value;
        return value;
    },

    get_folders: function () {
        return this._folders;
    },

    set_folders: function (value) {
        this._folders = value;
        return value;
    },

    get_places: function () {
        return this._places;
    },

    set_places: function (value) {
        this._places = value;
        return value;
    },

    get_imagesets: function () {
        return this._imagesets;
    },

    set_imagesets: function (value) {
        this._imagesets = value;
        return value;
    },

    get_tours: function () {
        return this._tours;
    },

    set_tours: function (value) {
        this._tours = value;
        return value;
    },

    get_name: function () {
        if (this._nameField == null) {
            return '';
        } else {
            return this._nameField;
        }
    },

    set_name: function (value) {
        this._nameField = value;
        return value;
    },

    get_group: function () {
        return this._groupField;
    },

    set_group: function (value) {
        this._groupField = value;
        return value;
    },

    get_url: function () {
        return this._urlField;
    },

    set_url: function (value) {
        this._urlField = value;
        return value;
    },

    get_thumbnailUrl: function () {
        if (ss.emptyString(this._thumbnailUrlField)) {
            return URLHelpers.singleton.engineAssetUrl('thumb_folder.jpg');
        }
        return this._thumbnailUrlField;
    },

    set_thumbnailUrl: function (value) {
        this._thumbnailUrlField = value;
        return value;
    },

    get_refreshType: function () {
        return this._refreshTypeField;
    },

    set_refreshType: function (value) {
        this._refreshTypeField = value;
        this.set_refreshTypeSpecified(true);
        return value;
    },

    get_refreshTypeSpecified: function () {
        return this._refreshTypeFieldSpecified;
    },

    set_refreshTypeSpecified: function (value) {
        this._refreshTypeFieldSpecified = value;
        return value;
    },

    get_refreshInterval: function () {
        return this._refreshIntervalField;
    },

    set_refreshInterval: function (value) {
        this._refreshIntervalField = value;
        return value;
    },

    get_browseable: function () {
        return this._browseableField;
    },

    set_browseable: function (value) {
        this._browseableField = value;
        this._browseableFieldSpecified = true;
        return value;
    },

    get_browseableSpecified: function () {
        return this._browseableFieldSpecified;
    },

    set_browseableSpecified: function (value) {
        this._browseableFieldSpecified = value;
        return value;
    },

    get_searchable: function () {
        return this._searchableField;
    },

    set_searchable: function (value) {
        this._searchableField = value;
        return value;
    },

    get_type: function () {
        return this._typeField;
    },

    set_type: function (value) {
        this._typeField = value;
        return value;
    },

    get_subType: function () {
        return this._subTypeField;
    },

    set_subType: function (value) {
        this._subTypeField = value;
        return value;
    }
};

registerType("Folder", [Folder, Folder$, null, IThumbnail]);

set_makeNewFolder(function () {
    return new Folder();
});
