// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A place to look at, potentially with associated imagesets.

import { ss } from "./ss.js";
import { registerType, registerEnum, Enums } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { freestandingMode, set_createPlace } from "./data_globals.js";
import { Util } from "./baseutil.js";
import { CameraParameters } from "./camera_parameters.js";
import { IPlace, IThumbnail } from "./interfaces.js";
import { UiTools } from "./ui_tools.js";
import { URLHelpers } from "./url_helpers.js";
import { Coordinates } from "./coordinates.js";
import { Imageset } from "./imageset.js";
import { Planets } from "./planets.js";


// wwtlib.Classification
//
// This was defined in `IPlace.cs`, which we've folded into `interfaces.js`.

export var Classification = {
    star: 1,
    supernova: 2,
    blackHole: 4,
    neutronStar: 8,
    doubleStar: 16,
    multipleStars: 32,
    asterism: 64,
    constellation: 128,
    openCluster: 256,
    globularCluster: 512,
    nebulousCluster: 1024,
    nebula: 2048,
    emissionNebula: 4096,
    planetaryNebula: 8192,
    reflectionNebula: 16384,
    darkNebula: 32768,
    giantMolecularCloud: 65536,
    supernovaRemnant: 131072,
    interstellarDust: 262144,
    quasar: 524288,
    galaxy: 1048576,
    spiralGalaxy: 2097152,
    irregularGalaxy: 4194304,
    ellipticalGalaxy: 8388608,
    knot: 16777216,
    plateDefect: 33554432,
    clusterOfGalaxies: 67108864,
    otherNGC: 134217728,
    unidentified: 268435456,
    solarSystem: 536870912,
    unfiltered: 1073741823,
    stellar: 63,
    stellarGroupings: 2032,
    nebulae: 523264,
    galactic: 133693440,
    other: 436207616
};

registerType("Classification", Classification);
registerEnum("Classification", Classification);


// wwtlib.Place

export function Place() {
    this._camParams = CameraParameters.create(0, 0, -1, 0, 0, 100);
    this._location3d = Vector3d.create(0, 0, 0);
    this.htmlDescription = '';
    this._constellation = '';
    this._classification = 1048576;
    this._type = 2;
    this._magnitude = 0;
    this._distnace = 0;
    this.angularSize = 60; // Angular size in arcseconds
    this.annotation = '';
    this._thumbNail = null;
    this._studyImageset = null;
    this._backgroundImageSet = null;
    this._searchDistance = 0;
    this._elevation = 50;
}

Place.create = function (name, lat, lng, classification, constellation, type, zoomFactor) {
    var temp = new Place();
    temp.set_zoomLevel(zoomFactor);
    temp._constellation = constellation;
    temp._name = name;
    if (type === 2 || type === 4) {
        temp._camParams.set_RA(lng);
    }
    else {
        temp.set_lng(lng);
    }
    temp.set_lat(lat);
    temp.set_classification(classification);
    temp.set_type(type);
    return temp;
};

Place.createCameraParams = function (name, camParams, classification, constellation, type, target) {
    var temp = new Place();
    temp._constellation = constellation;
    temp._name = name;
    temp.set_classification(classification);
    temp._camParams = camParams;
    temp.set_type(type);
    temp.set_target(target);
    return temp;
};

Place._fromXml = function (place) {
    var newPlace = new Place();
    newPlace._name = place.attributes.getNamedItem('Name').nodeValue;
    if (place.attributes.getNamedItem('MSRComponentId') != null && place.attributes.getNamedItem('Permission') != null && place.attributes.getNamedItem('Url') != null) {
        //communities item
        newPlace.set_url(place.attributes.getNamedItem('Url').nodeValue);
        newPlace.set_thumbnailUrl(place.attributes.getNamedItem('Thumbnail').nodeValue);
        return newPlace;
    }
    if (place.attributes.getNamedItem('DataSetType') != null) {
        newPlace._type = Enums.parse('ImageSetType', place.attributes.getNamedItem('DataSetType').nodeValue);
    }
    if (newPlace.get_type() === 2) {
        newPlace._camParams.set_RA(parseFloat(place.attributes.getNamedItem('RA').nodeValue));
        newPlace._camParams.set_dec(parseFloat(place.attributes.getNamedItem('Dec').nodeValue));
    }
    else {
        newPlace.set_lat(parseFloat(place.attributes.getNamedItem('Lat').nodeValue));
        newPlace.set_lng(parseFloat(place.attributes.getNamedItem('Lng').nodeValue));
    }
    if (place.attributes.getNamedItem('Constellation') != null) {
        newPlace._constellation = place.attributes.getNamedItem('Constellation').nodeValue;
    }
    if (place.attributes.getNamedItem('Classification') != null) {
        newPlace._classification = Enums.parse('Classification', place.attributes.getNamedItem('Classification').nodeValue);
    }
    if (place.attributes.getNamedItem('Magnitude') != null) {
        newPlace._magnitude = parseFloat(place.attributes.getNamedItem('Magnitude').nodeValue);
    }
    if (place.attributes.getNamedItem('AngularSize') != null) {
        newPlace.angularSize = parseFloat(place.attributes.getNamedItem('AngularSize').nodeValue);
    }
    if (place.attributes.getNamedItem('ZoomLevel') != null) {
        newPlace.set_zoomLevel(parseFloat(place.attributes.getNamedItem('ZoomLevel').nodeValue));
    }
    if (place.attributes.getNamedItem('Rotation') != null) {
        newPlace._camParams.rotation = parseFloat(place.attributes.getNamedItem('Rotation').nodeValue);
    }
    if (place.attributes.getNamedItem('Annotation') != null) {
        newPlace.annotation = place.attributes.getNamedItem('Annotation').nodeValue;
    }
    if (place.attributes.getNamedItem('Angle') != null) {
        newPlace._camParams.angle = parseFloat(place.attributes.getNamedItem('Angle').nodeValue);
    }
    if (place.attributes.getNamedItem('Opacity') != null) {
        newPlace._camParams.opacity = parseFloat(place.attributes.getNamedItem('Opacity').nodeValue);
    }
    else {
        newPlace._camParams.opacity = 100;
    }
    newPlace.set_target(65536);
    if (place.attributes.getNamedItem('Target') != null) {
        newPlace.set_target(Enums.parse('SolarSystemObjects', place.attributes.getNamedItem('Target').nodeValue));
    }
    if (place.attributes.getNamedItem('ViewTarget') != null) {
        newPlace._camParams.viewTarget = Vector3d.parse(place.attributes.getNamedItem('ViewTarget').nodeValue);
    }
    if (place.attributes.getNamedItem('TargetReferenceFrame') != null) {
        newPlace._camParams.targetReferenceFrame = place.attributes.getNamedItem('TargetReferenceFrame').nodeValue;
    }
    var descriptionNode = Util.selectSingleNode(place, 'Description');
    if (descriptionNode != null) {
        newPlace.htmlDescription = Util.getInnerText(descriptionNode);
    }
    var backgroundImageSet = Util.selectSingleNode(place, 'BackgroundImageSet');
    if (backgroundImageSet != null) {
        var imageSet = Util.selectSingleNode(backgroundImageSet, 'ImageSet');
        newPlace._backgroundImageSet = Imageset.fromXMLNode(imageSet);
    }
    var study = Util.selectSingleNode(place, 'ForegroundImageSet');
    if (study != null) {
        var imageSet = Util.selectSingleNode(study, 'ImageSet');
        newPlace._studyImageset = Imageset.fromXMLNode(imageSet);
    }
    study = Util.selectSingleNode(place, 'ImageSet');
    if (study != null) {
        newPlace._studyImageset = Imageset.fromXMLNode(study);
    }
    return newPlace;
};

Place._properCaps = function (name) {
    var list = name.split(' ');
    var ProperName = '';
    var $enum1 = ss.enumerate(list);
    while ($enum1.moveNext()) {
        var part = $enum1.current;
        ProperName = ProperName + part.substr(0, 1).toUpperCase() + ((part.length > 1) ? part.substr(1).toLowerCase() : '') + ' ';
    }
    return ss.trim(ProperName);
};

var Place$ = {
    get_tag: function () {
        return this._tag;
    },

    set_tag: function (value) {
        this._tag = value;
        return value;
    },

    get_url: function () {
        return this._url;
    },

    set_url: function (value) {
        this._url = value;
        return value;
    },

    get_thumbnail: function () {
        return this._thumbnail;
    },

    set_thumbnail: function (value) {
        this._thumbnail = value;
        return value;
    },

    get_name: function () {
        return this.get_names()[0];
    },

    get_names: function () {
        if (ss.emptyString(this._name)) {
            return ''.split(';');
        }
        return this._name.split(';');
    },

    set_names: function (value) {
        this._name = UiTools.getNamesStringFromArray(value);
        return value;
    },

    get_camParams: function () {
        if (this.get_classification() === 536870912 && this._camParams.target !== 20) {
            var raDec = Planets.getPlanetLocation(this.get_name());
            this._camParams.set_RA(raDec.RA);
            this._camParams.set_dec(raDec.dec);
            this._distnace = raDec.distance;
        }
        return this._camParams;
    },

    set_camParams: function (value) {
        this._camParams = value;
        return value;
    },

    updatePlanetLocation: function (jNow) {
        this._camParams.viewTarget = Planets.getPlanet3dLocationJD(this.get_target(), jNow);
        if (this.get_target() !== 65536 && this.get_target() !== 20) {
            this._camParams.viewTarget = Planets.getPlanetTargetPoint(this.get_target(), this.get_lat(), this.get_lng(), jNow);
        }
    },

    get_location3d: function () {
        if (this.get_classification() === 536870912 || (!this._location3d.x && !this._location3d.y && !this._location3d.z)) {
            this._location3d = Coordinates.raDecTo3d(this.get_RA(), this.get_dec());
        }
        return this._location3d;
    },

    get_lat: function () {
        return this.get_camParams().lat;
    },

    set_lat: function (value) {
        this._camParams.lat = value;
        return value;
    },

    get_lng: function () {
        return this.get_camParams().lng;
    },

    set_lng: function (value) {
        this._camParams.lng = value;
        return value;
    },

    get_opacity: function () {
        return this.get_camParams().opacity;
    },

    set_opacity: function (value) {
        this._camParams.opacity = value;
        return value;
    },

    get_constellation: function () {
        return this._constellation;
    },

    set_constellation: function (value) {
        this._constellation = value;
        return value;
    },

    get_classification: function () {
        return this._classification;
    },

    set_classification: function (value) {
        this._classification = value;
        return value;
    },

    get_type: function () {
        return this._type;
    },

    set_type: function (value) {
        this._type = value;
        return value;
    },

    get_magnitude: function () {
        return this._magnitude;
    },

    set_magnitude: function (value) {
        this._magnitude = value;
        return value;
    },

    get_distance: function () {
        return this._distnace;
    },

    set_distance: function (value) {
        this._distnace = value;
        return value;
    },

    get_zoomLevel: function () {
        return this.get_camParams().zoom;
    },

    set_zoomLevel: function (value) {
        this._camParams.zoom = value;
        return value;
    },

    get_annotation: function () {
        return this.annotation;
    },

    set_annotation: function (value) {
        this.annotation = value;
        return value;
    },

    get_studyImageset: function () {
        return this._studyImageset;
    },

    set_studyImageset: function (value) {
        this._studyImageset = value;
        return value;
    },

    get_backgroundImageset: function () {
        return this._backgroundImageSet;
    },

    set_backgroundImageset: function (value) {
        if (value != null) {
            this.set_type(value.get_dataSetType());
        }
        this._backgroundImageSet = value;
        return value;
    },

    get_searchDistance: function () {
        return this._searchDistance;
    },

    set_searchDistance: function (value) {
        this._searchDistance = value;
        return value;
    },

    get_elevation: function () {
        return this._elevation;
    },

    set_elevation: function (value) {
        this._elevation = value;
        return value;
    },

    get_thumbnailUrl: function () {
        if (ss.emptyString(this._thumbnailField)) {
            if (this._studyImageset != null && !ss.emptyString(this._studyImageset.get_thumbnailUrl())) {
                return this._studyImageset.get_thumbnailUrl();
            }
            if (this._backgroundImageSet != null && !ss.emptyString(this._backgroundImageSet.get_thumbnailUrl())) {
                return this._backgroundImageSet.get_thumbnailUrl();
            }
            var name = this.get_name();
            if (name.indexOf(';') > -1) {
                name = name.substr(0, name.indexOf(';'));
            }
            if (this.get_classification() === 1 || freestandingMode) {
                return URLHelpers.singleton.engineAssetUrl('thumb_star.jpg');
            }
            return URLHelpers.singleton.coreStaticUrl('wwtweb/thumbnail.aspx?name=' + name.toLowerCase());
        }
        return this._thumbnailField;
    },

    set_thumbnailUrl: function (value) {
        this._thumbnailField = value;
        return value;
    },

    get_RA: function () {
        return this.get_camParams().get_RA();
    },

    set_RA: function (value) {
        this._camParams.set_RA(value);
        return value;
    },

    get_dec: function () {
        return this.get_camParams().get_dec();
    },

    set_dec: function (value) {
        this._camParams.set_dec(value);
        return value;
    },

    toString: function () {
        return this._name;
    },

    _saveToXml: function (xmlWriter, elementName) {
        xmlWriter._writeStartElement(elementName);
        xmlWriter._writeAttributeString('Name', this._name);
        xmlWriter._writeAttributeString('DataSetType', Enums.toXml('ImageSetType', this._type));
        if (this.get_type() === 2) {
            xmlWriter._writeAttributeString('RA', this._camParams.get_RA().toString());
            xmlWriter._writeAttributeString('Dec', this._camParams.get_dec().toString());
        } else {
            xmlWriter._writeAttributeString('Lat', this.get_lat().toString());
            xmlWriter._writeAttributeString('Lng', this.get_lng().toString());
        }
        xmlWriter._writeAttributeString('Constellation', this._constellation);
        xmlWriter._writeAttributeString('Classification', Enums.toXml('Classification', this._classification));
        xmlWriter._writeAttributeString('Magnitude', this._magnitude.toString());
        xmlWriter._writeAttributeString('Distance', this._distnace.toString());
        xmlWriter._writeAttributeString('AngularSize', this.angularSize.toString());
        xmlWriter._writeAttributeString('ZoomLevel', this.get_zoomLevel().toString());
        xmlWriter._writeAttributeString('Rotation', this._camParams.rotation.toString());
        xmlWriter._writeAttributeString('Angle', this._camParams.angle.toString());
        xmlWriter._writeAttributeString('Opacity', this._camParams.opacity.toString());
        xmlWriter._writeAttributeString('Target', Enums.toXml('SolarSystemObjects', this.get_target()));
        xmlWriter._writeAttributeString('ViewTarget', this._camParams.viewTarget.toString());
        xmlWriter._writeAttributeString('TargetReferenceFrame', this._camParams.targetReferenceFrame);
        xmlWriter._writeStartElement('Description');
        xmlWriter._writeCData(this.htmlDescription);
        xmlWriter._writeEndElement();
        if (this._backgroundImageSet != null) {
            xmlWriter._writeStartElement('BackgroundImageSet');
            Imageset.saveToXml(xmlWriter, this._backgroundImageSet, '');
            xmlWriter._writeEndElement();
        }
        if (this._studyImageset != null) {
            Imageset.saveToXml(xmlWriter, this._studyImageset, '');
        }
        xmlWriter._writeEndElement();
    },

    get_bounds: function () {
        return this._bounds;
    },

    set_bounds: function (value) {
        this._bounds = value;
        return value;
    },

    get_isImage: function () {
        return this._studyImageset != null || this._backgroundImageSet != null;
    },

    get_isTour: function () {
        return false;
    },

    get_isFolder: function () {
        return false;
    },

    get_children: function () {
        return [];
    },

    get_readOnly: function () {
        return true;
    },

    get_target: function () {
        return this._camParams.target;
    },

    set_target: function (value) {
        this._camParams.target = value;
        return value;
    },

    get_isCloudCommunityItem: function () {
        return false;
    }
};

registerType("Place", [Place, Place$, null, IThumbnail, IPlace]);

set_createPlace(Place.create);
