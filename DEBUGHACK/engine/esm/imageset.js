// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// An image tile pyramid.

import { ss } from "./ss.js";
import { registerType, registerEnum, Enums } from "./typesystem.js";
import { freestandingMode, makeNewHipsProperties } from "./data_globals.js";
import { Matrix3d } from "./double3d.js";
import { Util } from "./baseutil.js";
import { IThumbnail } from "./interfaces.js";
import { URLHelpers } from "./url_helpers.js";
import { Coordinates } from "./coordinates.js";
import { FitsProperties } from "./fits_properties.js";
import { FitsImage } from "./layers/fits_image.js";
import { EquirectangularTile } from "./equirectangular_tile.js";
import { HealpixTile } from "./healpix_tile.js";
import { MercatorTile } from "./mercator_tile.js";
import { PlotTile } from "./plot_tile.js";
import { TangentTile } from "./tangent_tile.js";
import { SkyImageTile } from "./sky_image_tile.js";
import { ToastTile } from "./toast_tile.js";


// wwtlib.ProjectionType
//
// This was originally defined in `IImageset.cs`, not `Imageset.cs`, but we've
// folded it into this file.

export var ProjectionType = {
    mercator: 0,
    equirectangular: 1,
    tangent: 2,
    tan: 2,
    toast: 3,
    spherical: 4,
    skyImage: 5,
    plotted: 6,
    healpix: 7
};

registerType("ProjectionType", ProjectionType);
registerEnum("ProjectionType", ProjectionType);


// wwtlib.ImageSetType
//
// This was originally defined in `IImageset.cs`, not `Imageset.cs`, but we've
// folded it into this file.

export var ImageSetType = {
    earth: 0,
    planet: 1,
    sky: 2,
    panorama: 3,
    solarSystem: 4,
    sandbox: 5
};

registerType("ImageSetType", ImageSetType);
registerEnum("ImageSetType", ImageSetType);


// wwtlib.BandPass
//
// This was originally defined in `IImageset.cs`, not `Imageset.cs`, but we've
// folded it into this file.

export var BandPass = {
    gamma: 0,
    xRay: 1,
    ultraviolet: 2,
    visible: 3,
    hydrogenAlpha: 4,
    IR: 4,
    microwave: 5,
    radio: 6,
    visibleNight: 6
};

registerType("BandPass", BandPass);
registerEnum("BandPass", BandPass);


// wwtlib.Imageset

export function Imageset() {
    this._projection = 0;
    this._imageSetID = 0;
    this._baseTileDegrees = 0;
    this._widthFactor = 1;
    this.demUrl = '';
    this._levels = 0;
    this._mercator = false;
    this._bottomsUp = false;
    this._baseLevel = 1;
    this._quadTreeTileMap = '0123';
    this._centerX = 0;
    this._centerY = 0;
    this._rotation = 0;
    this._meanRadius = 0;
    this._dataSetType = 0;
    this._bandPass = 3;
    this._altUrl = '';
    this._singleImage = false;
    this._fitsProperties = new FitsProperties();
    this._matrixComputed = false;
    this._name = '';
    this._sparse = false;
    this._thumbnailUrl = '';
    this._generic = false;
    this._defaultSet = false;
    this._elevationModel = false;
    this._offsetX = 0;
    this._offsetY = 0;
}

Imageset.getNewTile = function (imageset, level, x, y, parent) {
    // Note: "spherical" projection type not handled in the WebGL engine.
    switch (imageset.get_projection()) {
        case ProjectionType.mercator:
            var newTile = MercatorTile.create(level, x, y, imageset, parent);
            return newTile;
        case ProjectionType.equirectangular:
            return EquirectangularTile.create(level, x, y, imageset, parent);
        case ProjectionType.toast:
        default:
            return ToastTile.create(level, x, y, imageset, parent);
        case ProjectionType.skyImage:
            return new SkyImageTile(level, x, y, imageset, parent);
        case ProjectionType.plotted:
            return PlotTile.create(level, x, y, imageset, parent);
        case ProjectionType.healpix:
            if (imageset.get_hipsProperties() == null) {
                imageset.set_hipsProperties(makeNewHipsProperties(imageset));
            }
            if (imageset.get_hipsProperties().get_downloadComplete()) {
                return new HealpixTile(level, x, y, imageset, parent);
            }
            else {
                return null;
            }
        case ProjectionType.tangent:
            var newTile = new TangentTile(level, x, y, imageset, parent);
            return newTile;
    }
};

Imageset.fromXMLNode = function (node) {
    try {
        var type = 2;
        var projection = 2;
        if (node.attributes.getNamedItem('DataSetType') != null) {
            type = Enums.parse('ImageSetType', node.attributes.getNamedItem('DataSetType').nodeValue);
        }
        var bandPass = 3;
        bandPass = Enums.parse('BandPass', node.attributes.getNamedItem('BandPass').nodeValue);
        var wf = 1;
        if (node.attributes.getNamedItem('WidthFactor') != null) {
            wf = parseInt(node.attributes.getNamedItem('WidthFactor').nodeValue);
        }
        if (node.attributes.getNamedItem('Generic') == null || !ss.boolean(node.attributes.getNamedItem('Generic').nodeValue)) {
            projection = Enums.parse('ProjectionType', node.attributes.getNamedItem('Projection').nodeValue);
            var fileType = node.attributes.getNamedItem('FileType').nodeValue;
            if (!ss.startsWith(fileType, '.')) {
                fileType = '.' + fileType;
            }
            var thumbnailUrl = '';
            var thumbUrl = Util.selectSingleNode(node, 'ThumbnailUrl');
            if (thumbUrl != null) {
                if (ss.emptyString(thumbUrl.text)) {
                    var cn = thumbUrl;
                    thumbnailUrl = cn.textContent;
                }
                else {
                    thumbnailUrl = thumbUrl.text;
                }
            }
            var stockSet = false;
            var elevationModel = false;
            if (node.attributes.getNamedItem('StockSet') != null) {
                stockSet = ss.boolean(node.attributes.getNamedItem('StockSet').nodeValue);
            }
            if (node.attributes.getNamedItem('ElevationModel') != null) {
                elevationModel = ss.boolean(node.attributes.getNamedItem('ElevationModel').nodeValue);
            }
            var demUrl = '';
            if (node.attributes.getNamedItem('DemUrl') != null) {
                demUrl = node.attributes.getNamedItem('DemUrl').nodeValue;
            }
            var alturl = '';
            if (node.attributes.getNamedItem('AltUrl') != null) {
                alturl = node.attributes.getNamedItem('AltUrl').nodeValue;
            }
            var offsetX = 0;
            if (node.attributes.getNamedItem('OffsetX') != null) {
                offsetX = parseFloat(node.attributes.getNamedItem('OffsetX').nodeValue);
            }
            var offsetY = 0;
            if (node.attributes.getNamedItem('OffsetY') != null) {
                offsetY = parseFloat(node.attributes.getNamedItem('OffsetY').nodeValue);
            }
            var creditText = '';
            var credits = Util.selectSingleNode(node, 'Credits');
            if (credits != null) {
                creditText = Util.getInnerText(credits);
            }
            var creditsUrl = '';
            credits = Util.selectSingleNode(node, 'CreditsUrl');
            if (credits != null) {
                creditsUrl = Util.getInnerText(credits);
            }
            var meanRadius = 0;
            if (node.attributes.getNamedItem('MeanRadius') != null) {
                meanRadius = parseFloat(node.attributes.getNamedItem('MeanRadius').nodeValue);
            }
            var referenceFrame = null;
            if (node.attributes.getNamedItem('ReferenceFrame') != null) {
                referenceFrame = node.attributes.getNamedItem('ReferenceFrame').nodeValue;
            }
            var name = '';
            if (node.attributes.getNamedItem('Name') != null) {
                name = node.attributes.getNamedItem('Name').nodeValue;
            }
            var url = '';
            if (node.attributes.getNamedItem('Url') != null) {
                url = node.attributes.getNamedItem('Url').nodeValue;
            }
            var baseTileLevel = 0;
            if (node.attributes.getNamedItem('BaseTileLevel') != null) {
                baseTileLevel = parseInt(node.attributes.getNamedItem('BaseTileLevel').nodeValue);
            }
            var tileLevels = 0;
            if (node.attributes.getNamedItem('TileLevels') != null) {
                tileLevels = parseInt(node.attributes.getNamedItem('TileLevels').nodeValue);
            }
            var baseDegreesPerTile = 0;
            if (node.attributes.getNamedItem('BaseDegreesPerTile') != null) {
                baseDegreesPerTile = parseFloat(node.attributes.getNamedItem('BaseDegreesPerTile').nodeValue);
            }
            var bottomsUp = false;
            if (node.attributes.getNamedItem('BottomsUp') != null) {
                bottomsUp = ss.boolean(node.attributes.getNamedItem('BottomsUp').nodeValue);
            }
            var quadTreeMap = '';
            if (node.attributes.getNamedItem('QuadTreeMap') != null) {
                quadTreeMap = node.attributes.getNamedItem('QuadTreeMap').nodeValue;
            }
            var centerX = 0;
            if (node.attributes.getNamedItem('CenterX') != null) {
                centerX = parseFloat(node.attributes.getNamedItem('CenterX').nodeValue);
            }
            var centerY = 0;
            if (node.attributes.getNamedItem('CenterY') != null) {
                centerY = parseFloat(node.attributes.getNamedItem('CenterY').nodeValue);
            }
            var rotation = 0;
            if (node.attributes.getNamedItem('Rotation') != null) {
                rotation = parseFloat(node.attributes.getNamedItem('Rotation').nodeValue);
            }
            var sparse = false;
            if (node.attributes.getNamedItem('Sparse') != null) {
                sparse = ss.boolean(node.attributes.getNamedItem('Sparse').nodeValue);
            }
            return Imageset.create(name, url, type, bandPass, projection, Math.abs(Util.getHashCode(url)), baseTileLevel, tileLevels, 256, baseDegreesPerTile, fileType, bottomsUp, quadTreeMap, centerX, centerY, rotation, sparse, thumbnailUrl, stockSet, elevationModel, wf, offsetX, offsetY, creditText, creditsUrl, demUrl, alturl, meanRadius, referenceFrame);
        } else {
            return Imageset.createGeneric(type, bandPass);
        }
    }
    catch ($e1) {
        return null;
    }
};

Imageset.saveToXml = function (xmlWriter, imageset, alternateUrl) {
    xmlWriter._writeStartElement('ImageSet');
    xmlWriter._writeAttributeString('Generic', imageset.get_generic().toString());
    xmlWriter._writeAttributeString('DataSetType', Enums.toXml('ImageSetType', imageset.get_dataSetType()));
    xmlWriter._writeAttributeString('BandPass', Enums.toXml('BandPass', imageset.get_bandPass()));
    if (!imageset.get_generic()) {
        xmlWriter._writeAttributeString('Name', imageset.get_name());
        if (ss.emptyString(alternateUrl)) {
            xmlWriter._writeAttributeString('Url', imageset.get_url());
        } else {
            xmlWriter._writeAttributeString('Url', alternateUrl);
        }
        xmlWriter._writeAttributeString('DemUrl', imageset.get_demUrl());
        xmlWriter._writeAttributeString('BaseTileLevel', imageset.get_baseLevel().toString());
        xmlWriter._writeAttributeString('TileLevels', imageset.get_levels().toString());
        xmlWriter._writeAttributeString('BaseDegreesPerTile', imageset.get_baseTileDegrees().toString());
        xmlWriter._writeAttributeString('FileType', imageset.get_extension());
        xmlWriter._writeAttributeString('BottomsUp', imageset.get_bottomsUp().toString());
        xmlWriter._writeAttributeString('Projection', Enums.toXml('ProjectionType', imageset.get_projection()));
        xmlWriter._writeAttributeString('QuadTreeMap', imageset.get_quadTreeTileMap());
        xmlWriter._writeAttributeString('CenterX', imageset.get_centerX().toString());
        xmlWriter._writeAttributeString('CenterY', imageset.get_centerY().toString());
        xmlWriter._writeAttributeString('OffsetX', imageset.get_offsetX().toString());
        xmlWriter._writeAttributeString('OffsetY', imageset.get_offsetY().toString());
        xmlWriter._writeAttributeString('Rotation', imageset.get_rotation().toString());
        xmlWriter._writeAttributeString('Sparse', imageset.get_sparse().toString());
        xmlWriter._writeAttributeString('ElevationModel', imageset.get_elevationModel().toString());
        xmlWriter._writeAttributeString('StockSet', imageset.get_defaultSet().toString());
        xmlWriter._writeAttributeString('WidthFactor', imageset.get_widthFactor().toString());
        xmlWriter._writeAttributeString('MeanRadius', imageset.get_meanRadius().toString());
        xmlWriter._writeAttributeString('ReferenceFrame', imageset.get_referenceFrame());
        if (ss.emptyString(alternateUrl)) {
            xmlWriter._writeElementString('ThumbnailUrl', imageset.get_thumbnailUrl());
        } else {
            xmlWriter._writeElementString('ThumbnailUrl', imageset.get_url());
        }
    }
    xmlWriter._writeEndElement();
};

Imageset.createGeneric = function (dataSetType, bandPass) {
    var temp = new Imageset();
    temp._generic = true;
    temp._name = 'Generic';
    temp._sparse = false;
    temp._dataSetType = dataSetType;
    temp._bandPass = bandPass;
    temp._quadTreeTileMap = '';
    temp.url = '';
    temp._levels = 0;
    temp._baseTileDegrees = 0;
    temp._imageSetID = 0;
    temp._extension = '';
    temp._projection = 1;
    temp._bottomsUp = false;
    temp._baseLevel = 0;
    temp._mercator = (!temp._projection);
    temp._centerX = 0;
    temp._centerY = 0;
    temp._rotation = 0;
    temp._thumbnailUrl = '';
    temp._matrix = Matrix3d.get_identity();
    temp._matrix._multiply(Matrix3d._rotationX((temp.get_rotation() / 180 * Math.PI)));
    temp._matrix._multiply(Matrix3d._rotationZ((temp.get_centerY() / 180 * Math.PI)));
    temp._matrix._multiply(Matrix3d._rotationY((((360 - temp.get_centerX()) + 180) / 180 * Math.PI)));
    return temp;
};

Imageset.create = function (name, url, dataSetType, bandPass, projection, imageSetID, baseLevel, levels, tileSize, baseTileDegrees, extension, bottomsUp, quadTreeMap, centerX, centerY, rotation, sparse, thumbnailUrl, defaultSet, elevationModel, wf, offsetX, offsetY, credits, creditsUrl, demUrlIn, alturl, meanRadius, referenceFrame) {
    var temp = new Imageset();
    temp.setInitialParameters(name, url, dataSetType, bandPass, projection, imageSetID, baseLevel, levels, baseTileDegrees, extension, bottomsUp, quadTreeMap, centerX, centerY, rotation, sparse, thumbnailUrl, defaultSet, elevationModel, wf, offsetX, offsetY, credits, creditsUrl, demUrlIn, alturl, meanRadius, referenceFrame);
    return temp;
};

var Imageset$ = {
    get_wcsImage: function () {
        return this._wcsImage;
    },

    set_wcsImage: function (value) {
        this._wcsImage = value;
        return value;
    },

    get_projection: function () {
        return this._projection;
    },

    set_projection: function (value) {
        this._projection = value;
        return value;
    },

    get_referenceFrame: function () {
        return this._referenceFrame;
    },

    set_referenceFrame: function (value) {
        this._referenceFrame = value;
        return value;
    },

    get_imageSetID: function () {
        return this._imageSetID;
    },

    set_imageSetID: function (value) {
        this._imageSetID = value;
        return value;
    },

    get_baseTileDegrees: function () {
        return this._baseTileDegrees;
    },

    set_baseTileDegrees: function (value) {
        this._baseTileDegrees = value;
        return value;
    },

    get_widthFactor: function () {
        return this._widthFactor;
    },

    set_widthFactor: function (value) {
        this._widthFactor = value;
        return value;
    },

    getHashCode: function () {
        return Util.getHashCode(this.get_url());
    },

    get_url: function () {
        return this.url;
    },

    set_url: function (value) {
        this.url = value;
        return value;
    },

    get_demUrl: function () {
        if (ss.emptyString(this.demUrl) && !this._projection && !freestandingMode) {
            return URLHelpers.singleton.coreStaticUrl('wwtweb/BingDemTile.aspx?Q={0},{1},{2}');
        }
        return this.demUrl;
    },

    set_demUrl: function (value) {
        this.demUrl = value;
        return value;
    },

    get_extension: function () {
        return this._extension;
    },

    set_extension: function (value) {
        this._extension = value;
        return value;
    },

    get_levels: function () {
        return this._levels;
    },

    set_levels: function (value) {
        this._levels = value;
        return value;
    },

    get_bottomsUp: function () {
        return this._bottomsUp;
    },

    set_bottomsUp: function (value) {
        this._bottomsUp = value;
        return value;
    },

    get_mercator: function () {
        return this._mercator;
    },

    set_mercator: function (value) {
        this._mercator = value;
        return value;
    },

    get_baseLevel: function () {
        return this._baseLevel;
    },

    set_baseLevel: function (value) {
        this._baseLevel = value;
        return value;
    },

    get_quadTreeTileMap: function () {
        return this._quadTreeTileMap;
    },

    set_quadTreeTileMap: function (value) {
        this._quadTreeTileMap = value;
        return value;
    },

    get_centerX: function () {
        return this._centerX;
    },

    set_centerX: function (value) {
        if (this._centerX !== value) {
            this._centerX = value;
            this._computeMatrix();
        }
        return value;
    },

    get_centerY: function () {
        return this._centerY;
    },

    set_centerY: function (value) {
        if (this._centerY !== value) {
            this._centerY = value;
            this._computeMatrix();
        }
        return value;
    },

    get_rotation: function () {
        return this._rotation;
    },

    set_rotation: function (value) {
        if (this._rotation !== value) {
            this._rotation = value;
            this._computeMatrix();
        }
        return value;
    },

    get_meanRadius: function () {
        return this._meanRadius;
    },

    set_meanRadius: function (value) {
        this._meanRadius = value;
        return value;
    },

    get_bandPass: function () {
        return this._bandPass;
    },

    set_bandPass: function (value) {
        this._bandPass = value;
        return value;
    },

    get_dataSetType: function () {
        return this._dataSetType;
    },

    set_dataSetType: function (value) {
        this._dataSetType = value;
        return value;
    },

    get_altUrl: function () {
        return this._altUrl;
    },

    set_altUrl: function (value) {
        this._altUrl = value;
        return value;
    },

    get_singleImage: function () {
        return this._singleImage;
    },

    set_singleImage: function (value) {
        this._singleImage = value;
        return value;
    },

    get_hipsProperties: function () {
        return this._hipsProperties;
    },

    set_hipsProperties: function (value) {
        this._hipsProperties = value;
        return value;
    },

    get_fitsProperties: function () {
        return this._fitsProperties;
    },

    set_fitsProperties: function (value) {
        this._fitsProperties = value;
        return value;
    },

    toString: function () {
        if (this.get_defaultSet()) {
            return this._name + ' *';
        } else {
            return this._name;
        }
    },

    get_stockImageSet: function () {
        if (this._generic || !this._defaultSet) {
            return this;
        } else {
            return Imageset.createGeneric(this.get_dataSetType(), this.get_bandPass());
        }
    },

    equals: function (obj) {
        if (obj == null) {
            return false;
        }
        if (!(ss.canCast(obj, Imageset))) {
            return false;
        }
        var b = obj;
        return (Util.getHashCode(b.get_url()) === Util.getHashCode(this.get_url()) && b.get_dataSetType() === this.get_dataSetType() && b.get_bandPass() === this.get_bandPass() && b.get_generic() === this.get_generic());
    },

    get_matrix: function () {
        if (!this._matrixComputed) {
            this._computeMatrix();
        }
        return this._matrix;
    },

    set_matrix: function (value) {
        this._matrix = value;
        return value;
    },

    _computeMatrix: function () {
        this._matrixComputed = true;
        this._matrix = Matrix3d.get_identity();
        this._matrix._multiply(Matrix3d._rotationX((this.get_rotation() / 180 * Math.PI)));
        this._matrix._multiply(Matrix3d._rotationZ((this.get_centerY() / 180 * Math.PI)));
        this._matrix._multiply(Matrix3d._rotationY(((360 - this.get_centerX()) / 180 * Math.PI)));
    },

    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        this._name = value;
        return value;
    },

    get_sparse: function () {
        return this._sparse;
    },

    set_sparse: function (value) {
        this._sparse = value;
        return value;
    },

    get_thumbnailUrl: function () {
        return this._thumbnailUrl;
    },

    set_thumbnailUrl: function (value) {
        this._thumbnailUrl = value;
        return value;
    },

    get_generic: function () {
        return this._generic;
    },

    set_generic: function (value) {
        this._generic = value;
        return value;
    },

    get_elevationModel: function () {
        return this._elevationModel;
    },

    set_elevationModel: function (value) {
        this._elevationModel = value;
        return value;
    },

    get_defaultSet: function () {
        return this._defaultSet;
    },

    set_defaultSet: function (value) {
        this._defaultSet = value;
        return value;
    },

    get_offsetX: function () {
        return this._offsetX;
    },

    set_offsetX: function (value) {
        this._offsetX = value;
        return value;
    },

    get_offsetY: function () {
        return this._offsetY;
    },

    set_offsetY: function (value) {
        this._offsetY = value;
        return value;
    },

    get_creditsText: function () {
        return this._creditsText;
    },

    set_creditsText: function (value) {
        this._creditsText = value;
        return value;
    },

    get_creditsUrl: function () {
        return this._creditsUrl;
    },

    set_creditsUrl: function (value) {
        this._creditsUrl = value;
        return value;
    },

    get_isMandelbrot: function () {
        return false;
    },

    // Calculate either the X or Y coordinate of the estimated image center.
    //
    // This estimate has some important limitations. First, because images
    // might contain transparent regions, the "center" of the image that a
    // user will perceive might have nothing to do with the center of the
    // image bitmap. For instance, imagine that the bitmap is 100x100 but
    // that everything is transparent except for 10x10 pixels in the
    // top-left corner. We don't know anything about the "barycenter" of the
    // image here, so we can't account for that.
    //
    // Second, for untiled SkyImage imagesets, to properly compute the
    // bitmap center we need its dimensions, which simply aren't available
    // here. All we can do is guess a "reasonable" image size.
    //
    // For these reasons, this method should be avoided when possible. The
    // preferred way to "know" the location of an image's center is to wrap
    // the image in a Place object, which can just specify the exact
    // coordinates and zoom level too.
    //
    // Even disregarding the above, it's non-trivial to locate the image
    // center because of the OffsetX/Y parameters and potential rotation of
    // the image's coordinate system relative to the sky.
    _calcViewCenterCoordinate: function (isX) {
        var rot = Coordinates.degreesToRadians(this._rotation);
        var crot = Math.cos(rot);
        var srot = Math.sin(rot);
        var dx = 0, dy = 0;
        if (this.get_levels() > 0) {
            dx = -this._offsetX;
            dy = this._offsetY;
        } else {
            // This is the part where we need the image's dimensions to
            // be able to compute the center coordinate correctly. Since
            // we don't have that information, we just guess :-(
            var effWidth = 800;
            var effHeight = 800;
            dx = (this._offsetX - effWidth / 2) * this._baseTileDegrees;
            dy = (effHeight / 2 - this._offsetY) * this._baseTileDegrees;
        }
        if (this._bottomsUp) {
            dx = -dx;
        }
        if (isX) {
            return this._centerX + dx * crot + dy * srot;
        } else {
            return this._centerY - dx * srot + dy * crot;
        }
    },

    get_viewCenterX: function () {
        if (this.get_wcsImage() != null) {
            return (this.get_wcsImage()).get_viewCenterX();
        } else {
            return this._calcViewCenterCoordinate(true);
        }
    },

    get_viewCenterY: function () {
        if (this.get_wcsImage() != null) {
            return (this.get_wcsImage()).get_viewCenterY();
        } else {
            return this._calcViewCenterCoordinate(false);
        }
    },

    setInitialParameters: function (name, url, dataSetType, bandPass, projection, imageSetID, baseLevel, levels, baseTileDegrees, extension, bottomsUp, quadTreeMap, centerX, centerY, rotation, sparse, thumbnailUrl, defaultSet, elevationModel, wf, offsetX, offsetY, credits, creditsUrl, demUrlIn, alturl, meanRadius, referenceFrame) {
        this.set_referenceFrame(referenceFrame);
        this.set_meanRadius(meanRadius);
        this._altUrl = alturl;
        this.demUrl = demUrlIn;
        this._creditsText = credits;
        this._creditsUrl = creditsUrl;
        this._offsetY = offsetY;
        this._offsetX = offsetX;
        this._widthFactor = wf;
        this._elevationModel = elevationModel;
        this._defaultSet = defaultSet;
        this._name = name;
        this._sparse = sparse;
        this._dataSetType = dataSetType;
        this._bandPass = bandPass;
        this._quadTreeTileMap = quadTreeMap;
        this.url = url;
        this._levels = levels;
        this._baseTileDegrees = baseTileDegrees;
        this._imageSetID = imageSetID;
        this._extension = extension;
        this._projection = projection;
        this._bottomsUp = bottomsUp;
        this._baseLevel = baseLevel;
        this._mercator = (!projection);
        this._centerX = centerX;
        this._centerY = centerY;
        this._rotation = rotation;
        this._thumbnailUrl = thumbnailUrl;
        this._computeMatrix();
    },

    // Ideally, imagesets will be associated with Places that specify
    // exactly how the view should be set up when "going to" them, but
    // sometimes (especially research datasets) we're interested in deriving
    // a reasonable zoom setting without that extra information. The returned value
    // isn't going to be perfect but it should hopefully be OK.
    _guessZoomSetting: function (currentZoom) {
        const FOV_FACTOR = 1.7;
        var zoom = currentZoom;
        var aswcs = ss.safeCast(this._wcsImage, FitsImage);
        if (this.get_projection() === ProjectionType.skyImage) {
            // Untiled SkyImage: basetiledegrees is degrees per pixel
            if (aswcs != null) {
                zoom = this.get_baseTileDegrees() * aswcs.get_sizeY() * 6 * FOV_FACTOR;
            }
        } else if (aswcs != null) {
            zoom = aswcs.get_scaleY() * aswcs.get_sizeY() * 6 * FOV_FACTOR;
        } else {
            // Tiled. basetiledegrees is angular height of whole image after
            // power-of-2 padding.
            zoom = this.get_baseTileDegrees() * 6 * FOV_FACTOR;
        }

        // Only zoom in, not out. Usability-wise this tends to make the most
        // sense.
        if (zoom > currentZoom) {
            zoom = currentZoom;
        }
        return zoom;
    },

    // URL parameters
    //{0} ImageSetID
    //{1} level
    //{2} x tile id
    //{3} y tile id
    //{4} quadtree address (VE style)
    //{5} quadtree address (Google maps style)
    //{6} top left corner RA
    //{7} top left corner Dec
    //{8} bottom right corner RA
    //{9} bottom right corner dec
    //{10} bottom left corner RA
    //{11} bottom left corner dec
    //{12} top right corner RA
    //{13} top right corner dec

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
        return true;
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
        return [];
    }
};

registerType("Imageset", [Imageset, Imageset$, null, IThumbnail]);
