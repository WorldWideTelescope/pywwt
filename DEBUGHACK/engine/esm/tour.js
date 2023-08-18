// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Top-level information about a tour.

import { ss } from "./ss.js";
import { registerType, Enums } from "./typesystem.js";
import { freestandingMode } from "./data_globals.js";
import { IThumbnail } from "./interfaces.js";
import { URLHelpers } from "./url_helpers.js";


// wwtlib.Tour

export function Tour() {
    this.userLevel = 0;
    this.classification = 0;
    this.averageRating = 0;
    this.lengthInSecs = 0;
    this._thumbnailUrlField = '';
}

Tour._fromXml = function (child) {
    var temp = new Tour();
    if (child.attributes.getNamedItem('ID') != null) {
        temp.id = child.attributes.getNamedItem('ID').nodeValue;
    }
    if (child.attributes.getNamedItem('TourUrl') != null) {
        temp._tourUrl = child.attributes.getNamedItem('TourUrl').nodeValue;
    }
    if (child.attributes.getNamedItem('Title') != null) {
        temp.title = child.attributes.getNamedItem('Title').nodeValue;
    }
    if (child.attributes.getNamedItem('Description') != null) {
        temp.description = child.attributes.getNamedItem('Description').nodeValue;
    }
    if (child.attributes.getNamedItem('Classification') != null) {
        temp.classification = Enums.parse('Classification', child.attributes.getNamedItem('Classification').nodeValue);
    }
    if (child.attributes.getNamedItem('AuthorEmail') != null) {
        temp.authorEmail = child.attributes.getNamedItem('AuthorEmail').nodeValue;
    }
    if (child.attributes.getNamedItem('Author') != null) {
        temp.author = child.attributes.getNamedItem('Author').nodeValue;
    }
    if (child.attributes.getNamedItem('AuthorURL') != null) {
        temp.authorURL = child.attributes.getNamedItem('AuthorURL').nodeValue;
    }
    if (child.attributes.getNamedItem('AuthorImageUrl') != null) {
        temp.authorImageUrl = child.attributes.getNamedItem('AuthorImageUrl').nodeValue;
    }
    if (child.attributes.getNamedItem('AverageRating') != null) {
        temp.averageRating = parseFloat(child.attributes.getNamedItem('AverageRating').nodeValue);
    }
    if (child.attributes.getNamedItem('LengthInSecs') != null) {
        temp.lengthInSecs = parseFloat(child.attributes.getNamedItem('LengthInSecs').nodeValue);
    }
    if (child.attributes.getNamedItem('OrganizationUrl') != null) {
        temp.organizationUrl = child.attributes.getNamedItem('OrganizationUrl').nodeValue;
    }
    if (child.attributes.getNamedItem('OrganizationName') != null) {
        temp.organizationName = child.attributes.getNamedItem('OrganizationName').nodeValue;
    }
    if (child.attributes.getNamedItem('RelatedTours') != null) {
        temp.relatedTours = child.attributes.getNamedItem('RelatedTours').nodeValue;
    }
    if (child.attributes.getNamedItem('Keywords') != null) {
        temp.keywords = child.attributes.getNamedItem('Keywords').nodeValue;
    }
    if (child.attributes.getNamedItem('ThumbnailUrl') != null) {
        temp.set_thumbnailUrl(child.attributes.getNamedItem('ThumbnailUrl').nodeValue);
    }
    return temp;
};

var Tour$ = {
    get_name: function () {
        return this.title;
    },

    get_thumbnail: function () {
        return this._thumbnail;
    },

    set_thumbnail: function (value) {
        this._thumbnail = value;
        return value;
    },

    get_thumbnailUrl: function () {
        if (!ss.emptyString(this._thumbnailUrlField)) {
            return this._thumbnailUrlField;
        } else if (freestandingMode) {
            return URLHelpers.singleton.engineAssetUrl('thumb_star.jpg');
        }
        return ss.format(URLHelpers.singleton.coreStaticUrl('wwtweb/GetTourThumbnail.aspx?GUID={0}'), this.id);
    },

    set_thumbnailUrl: function (value) {
        this._thumbnailUrlField = value;
        return value;
    },

    get_tourUrl: function () {
        if (ss.emptyString(this._tourUrl) && !freestandingMode) {
            return ss.format(URLHelpers.singleton.coreStaticUrl('wwtweb/GetTour.aspx?GUID={0}'), this.id);
        } else {
            return this._tourUrl;
        }
    },

    set_tourUrl: function (value) {
        this._tourUrl = value;
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
        return true;
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
        return [];
    }
};

registerType("Tour", [Tour, Tour$, null, IThumbnail]);
