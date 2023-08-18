// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that renders an arbitrary imageset

import { ss } from "../ss.js";
import { registerType, Enums } from "../typesystem.js";
import { Util } from "../baseutil.js";
import { useGlVersion2 } from "../render_globals.js";
import { Histogram } from "../utilities/histogram.js";
import { ColorMapContainer } from "./color_map_container.js";
import { FitsImage } from "./fits_image.js";
import { FitsImageJs } from "./fits_image_js.js";
import { Imageset } from "../imageset.js";
import { Layer } from "./layer.js";


// wwtlib.ImageSetLayer

export function ImageSetLayer() {
    this._imageSet$1 = null;
    this._extension$1 = '.txt';
    this._overrideDefaultLayer$1 = false;
    this._loaded$1 = false;
    Layer.call(this);
}

ImageSetLayer.create = function (set) {
    var isl = new ImageSetLayer();
    isl._imageSet$1 = set;
    return isl;
};

var ImageSetLayer$ = {
    get_imageSet: function () {
        return this._imageSet$1;
    },

    set_imageSet: function (value) {
        this._imageSet$1 = value;
        return value;
    },

    get_overrideDefaultLayer: function () {
        return this._overrideDefaultLayer$1;
    },

    set_overrideDefaultLayer: function (value) {
        this._overrideDefaultLayer$1 = value;
        return value;
    },

    getFitsImage: function () {
        return ss.safeCast(this._imageSet$1.get_wcsImage(), FitsImage);
    },

    // Test whether our underlying imagery is FITS based.
    //
    // This can come in two flavors: a single FITS image, or tiled FITS.
    // Note that even though the FileType/Extension field can currently
    // specify multiple file formats, the rendering code requires that the
    // extension is exactly ".fits" for FITS rendering to kick in.
    _isFitsImageset$1: function () {
        var hasFitsExt = this._imageSet$1.get_extension() === '.fits';
        return ss.canCast(this._imageSet$1.get_wcsImage(), FitsImage) || (this._imageSet$1.get_wcsImage() == null && hasFitsExt);
    },

    initializeFromXml: function (node) {
        var imageSetNode = Util.selectSingleNode(node, 'ImageSet');
        this._imageSet$1 = Imageset.fromXMLNode(imageSetNode);
        if (node.attributes.getNamedItem('Extension') != null) {
            this._extension$1 = node.attributes.getNamedItem('Extension').nodeValue;
        }
        if (node.attributes.getNamedItem('ScaleType') != null) {
            this.get_imageSet().get_fitsProperties().scaleType = Enums.parse('ScaleTypes', node.attributes.getNamedItem('ScaleType').nodeValue);
        }
        if (node.attributes.getNamedItem('MinValue') != null) {
            this.get_imageSet().get_fitsProperties().minVal = parseFloat(node.attributes.getNamedItem('MinValue').nodeValue);
            this.get_imageSet().get_fitsProperties().lowerCut = (node.attributes.getNamedItem('LowerCut') != null) ? parseFloat(node.attributes.getNamedItem('LowerCut').nodeValue) : this.get_imageSet().get_fitsProperties().minVal;
        }
        if (node.attributes.getNamedItem('MaxValue') != null) {
            this.get_imageSet().get_fitsProperties().maxVal = parseFloat(node.attributes.getNamedItem('MaxValue').nodeValue);
            this.get_imageSet().get_fitsProperties().upperCut = (node.attributes.getNamedItem('UpperCut') != null) ? parseFloat(node.attributes.getNamedItem('UpperCut').nodeValue) : this.get_imageSet().get_fitsProperties().maxVal;
        }
        if (node.attributes.getNamedItem('ColorMapperName') != null) {
            this.get_imageSet().get_fitsProperties().colorMapName = node.attributes.getNamedItem('ColorMapperName').nodeValue;
        }
        if (node.attributes.getNamedItem('OverrideDefault') != null) {
            this._overrideDefaultLayer$1 = ss.boolean(node.attributes.getNamedItem('OverrideDefault').nodeValue);
        }
    },

    draw: function (renderContext, opacity, flat) {
        if (!this._loaded$1) {
            return false;
        }
        renderContext.set_worldBase(renderContext.get_world());
        renderContext.set_viewBase(renderContext.get_view());
        renderContext.makeFrustum();
        renderContext.drawImageSet(this._imageSet$1, this.get_opacity() * opacity * 100);
        return true;
    },

    writeLayerProperties: function (xmlWriter) {
        if (this._imageSet$1.get_wcsImage() != null) {
            if (this._isFitsImageset$1()) {
                this._extension$1 = '.fit';
            }
            else {
                this._extension$1 = '.png';
            }
            xmlWriter._writeAttributeString('Extension', this._extension$1);
        }
        if (this._isFitsImageset$1()) {
            xmlWriter._writeAttributeString('ScaleType', Enums.toXml('ScaleTypes', this._imageSet$1.get_fitsProperties().scaleType));
            xmlWriter._writeAttributeString('MinValue', this._imageSet$1.get_fitsProperties().minVal.toString());
            xmlWriter._writeAttributeString('MaxValue', this._imageSet$1.get_fitsProperties().maxVal.toString());
            xmlWriter._writeAttributeString('LowerCut', this._imageSet$1.get_fitsProperties().lowerCut.toString());
            xmlWriter._writeAttributeString('UpperCut', this._imageSet$1.get_fitsProperties().upperCut.toString());
            if (this._imageSet$1.get_fitsProperties().colorMapName != null) {
                xmlWriter._writeAttributeString('ColorMapperName', this._imageSet$1.get_fitsProperties().colorMapName);
            }
        }
        xmlWriter._writeAttributeString('OverrideDefault', this._overrideDefaultLayer$1.toString());
        Imageset.saveToXml(xmlWriter, this._imageSet$1, '');
        Layer.prototype.writeLayerProperties.call(this, xmlWriter);
    },

    getTypeName: function () {
        return 'TerraViewer.ImageSetLayer';
    },

    cleanUp: function () {
        Layer.prototype.cleanUp.call(this);
    },

    addFilesToCabinet: function (fc) {
        if (ss.canCast(this._imageSet$1.get_wcsImage(), FitsImage)) {
            var fName = (this._imageSet$1.get_wcsImage()).get_filename();
            var fileName = fc.tempDirectory + ss.format('{0}\\{1}{2}', fc.get_packageID(), this.id.toString(), this._extension$1);
            fc.addFile(fileName, (this._imageSet$1.get_wcsImage()).sourceBlob);
        }
    },

    getParamNames: function () {
        return Layer.prototype.getParamNames.call(this);
    },

    getParams: function () {
        return Layer.prototype.getParams.call(this);
    },

    setParams: function (paramList) {
        Layer.prototype.setParams.call(this, paramList);
    },

    setImageScale: function (scaleType, min, max) {
        console.warn('SetImageScale is considered deprecated. Use setImageScaleRaw or setImageScalePhysical instead.');
        this.setImageScaleRaw(scaleType, min, max);
    },

    setImageScaleRaw: function (scaleType, min, max) {
        this.get_imageSet().get_fitsProperties().lowerCut = min;
        this.get_imageSet().get_fitsProperties().upperCut = max;
        this.get_imageSet().get_fitsProperties().scaleType = scaleType;
        if (ss.canCast(this._imageSet$1.get_wcsImage(), FitsImageJs)) {
            Histogram.updateScale(this, scaleType, min, max);
        }
    },

    setImageScalePhysical: function (scaleType, min, max) {
        var newMin = min;
        var newMax = max;
        if (this._isFitsImageset$1()) {
            newMin = (newMin - this._imageSet$1.get_fitsProperties().bZero) / this._imageSet$1.get_fitsProperties().bScale;
            newMax = (newMax - this._imageSet$1.get_fitsProperties().bZero) / this._imageSet$1.get_fitsProperties().bScale;
        }
        this.setImageScaleRaw(scaleType, newMin, newMax);
    },

    setImageZ: function (z) {
        if (this._isFitsImageset$1()) {
            Histogram.updateImage(this, z);
        }
    },

    get_colorMapperName: function () {
        return this.get_imageSet().get_fitsProperties().colorMapName;
    },

    set_colorMapperName: function (value) {
        if (ColorMapContainer.fromNamedColormap(value) == null) {
            throw new Error('Invalid colormap name');
        }
        this.version++;
        if (this._isFitsImageset$1()) {
            if (useGlVersion2) {
                this._imageSet$1.get_fitsProperties().colorMapName = value;
            }
            else {
                Histogram.updateColorMapper(this, value);
            }
        }
        return value;
    },

    get_colorMapper: function () {
        if (this.get_imageSet().get_fitsProperties().colorMapName == null) {
            return null;
        } else {
            return ColorMapContainer.fromNamedColormap(this.get_imageSet().get_fitsProperties().colorMapName);
        }
    },

    loadData: function (tourDoc, filename) {
        if (ss.startsWith(this._extension$1.toLowerCase(), '.fit')) {
            var blob = tourDoc.getFileBlob(ss.replaceString(filename, '.txt', this._extension$1));
            var fi;
            if (useGlVersion2) {
                fi = new FitsImage(this._imageSet$1, 'image.fit', blob, ss.bind('doneLoading', this));
            }
            else {
                fi = new FitsImageJs(this._imageSet$1, 'image.fit', blob, ss.bind('doneLoading', this));
            }
            this._imageSet$1.set_wcsImage(fi);
        } else {
            this._loaded$1 = true;
        }
    },

    doneLoading: function (wcsImage) {
        this._loaded$1 = true;
    }
};

registerType("ImageSetLayer", [ImageSetLayer, ImageSetLayer$, Layer]);
