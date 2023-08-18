// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A FITS image.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { WebFile } from "../web_file.js";
import { Coordinates } from "../coordinates.js";
import { WcsImage } from "./wcs_image.js";


// wwtlib.FitsImage

export function FitsImage(dataset, file, blob, callMeBack) {
    this.errored = false;
    this.numAxis = 0;
    this.histogramMaxCount = 0;
    this.sourceBlob = null;
    this.header = {};
    this.position = 0;
    this.bufferSize = 1;
    this._parseSuccessful$1 = false;
    WcsImage.call(this);
    this.dataset = dataset;
    this.fitsProperties = dataset.get_fitsProperties();
    this._callBack$1 = callMeBack;
    this.filename = file;
    if (blob != null) {
        this._readFromBlob$1(blob);
    }
    else {
        this.getFile(file);
    }
}

FitsImage.naN = 0 / 0;

var FitsImage$ = {
    getFile: function (url) {
        this._webFile$1 = new WebFile(url);
        this._webFile$1.responseType = 'blob';
        this._webFile$1.onStateChange = ss.bind('fileStateChange', this);
        this._webFile$1.send();
    },

    fileStateChange: function () {
        if (this._webFile$1.get_state() === 2) {
            this.errored = true;
            if (this._callBack$1 != null) {
                this._callBack$1(this);
            }
        } else if (this._webFile$1.get_state() === 1) {
            var mainBlob = this._webFile$1.getBlob();
            this._readFromBlob$1(mainBlob);
        }
    },
    _readFromBlob$1: function (blob) {
        var $this = this;

        this.sourceBlob = blob;
        var chunck = new FileReader();
        chunck.onloadend = function (e) {
            $this.readFromBin(new DataView(chunck.result));
            $this.errored = !$this._parseSuccessful$1;
            if ($this._callBack$1 != null) {
                $this._callBack$1($this);
            }
        };
        chunck.readAsArrayBuffer(blob);
    },
    _readByteString$1: function (dataView, count) {
        var data = '';
        for (var i = 0; i < count; i++) {
            data += String.fromCharCode(dataView.getUint8(this.position));
            this.position++;
        }
        return data;
    },
    _validateFitsSimple$1: function (dataView) {
        var data = this._readByteString$1(dataView, 8);
        var keyword = ss.trimEnd(data);
        this.position -= 8;
        return keyword.toUpperCase() === 'SIMPLE';
    },

    readFromBin: function (dataView) {
        if (!this._validateFitsSimple$1(dataView)) {
            console.log('The requested file is not a valid FITS file.');
            return;
        }
        var foundEnd = false;
        while (!foundEnd) {
            for (var i = 0; i < 36; i++) {
                var data = this._readByteString$1(dataView, 80);
                if (!foundEnd) {
                    var keyword = ss.trimEnd(data.substring(0, 8));
                    var values = data.substring(10).split('/');
                    if (keyword.toUpperCase() === 'END') {
                        foundEnd = true;
                        // Check for XTENSION
                        i++;
                        data = this._readByteString$1(dataView, 80);
                        while (ss.whitespace(data)) {
                            i++;
                            data = this._readByteString$1(dataView, 80);
                        }
                        keyword = ss.trimEnd(data.substring(0, 8));
                        if (keyword.toUpperCase() === 'XTENSION') {
                            // We have additional headers
                            foundEnd = false;
                        }
                        else {
                            // Rewind these 80 bytes which could be data
                            this.position -= 80;
                        }
                    }
                    else {
                        this._addKeyword$1(keyword, values);
                    }
                }
            }
        }
        if (!foundEnd) {
            console.log('Unable to parse requested FITS file.');
            return;
        }
        this.numAxis = parseInt(this.header['NAXIS']);
        if (ss.keyExists(this.header, 'BLANK')) {
            this.fitsProperties.blankValue = parseFloat(this.header['BLANK']);
            this.fitsProperties.containsBlanks = true;
        }
        if (ss.keyExists(this.header, 'BZERO')) {
            this.fitsProperties.bZero = parseFloat(this.header['BZERO']);
        }
        if (ss.keyExists(this.header, 'BSCALE')) {
            this.fitsProperties.bScale = parseFloat(this.header['BSCALE']);
        }
        this.axisSize = new Array(this.numAxis);
        for (var axis = 0; axis < this.numAxis; axis++) {
            this.axisSize[axis] = parseInt(this.header[ss.format('NAXIS{0}', axis + 1)]);
            this.bufferSize *= this.axisSize[axis];
        }
        var bitpix = parseInt(this.header['BITPIX']);
        this.readDataUnit(dataView, bitpix);
        if (this.numAxis > 1) {
            this.sizeX = this.axisSize[0];
            this.sizeY = this.axisSize[1];
            this.histogram = this.computeHistogram(256);
            this.histogramMaxCount = this.histogram[256];
        }
        this.computeWcs();
        this._parseSuccessful$1 = true;
    },
    _addKeyword$1: function (keyword, values) {
        if (keyword !== 'CONTINUE' && keyword !== 'COMMENT' && keyword !== 'HISTORY' && !ss.emptyString(keyword)) {
            try {
                if (ss.keyExists(this.header, keyword)) {
                    this.header[keyword] = ss.trim(values[0]);
                }
                else {
                    this.header[keyword.toUpperCase()] = ss.trim(values[0]);
                }
            }
            catch ($e1) {
            }
        }
    },

    readDataUnit: function (dataView, bitpix) {
        this.dataUnit = new Float32Array(this.bufferSize);
        switch (bitpix) {
            case -64:
                this.readDataUnitFloat64(dataView);
                break;
            case -32:
                this.readDataUnitFloat32(dataView);
                break;
            case 8:
                this.readDataUnitUint8(dataView);
                break;
            case 16:
                this.readDataUnitInt16(dataView);
                break;
            case 32:
                this.readDataUnitInt32(dataView);
                break;
            case 64:
                // 64 bit integers not supported by Safari
                console.log('64 bit integer FITS are not yet supported');
                break;
        }
    },

    readDataUnitFloat64: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getFloat64(this.position, false);
            var physicalValue = this.dataUnit[i] * this.fitsProperties.bScale + this.fitsProperties.bZero;
            if (this.fitsProperties.minVal > physicalValue) {
                this.fitsProperties.minVal = physicalValue;
            }
            if (this.fitsProperties.maxVal < physicalValue) {
                this.fitsProperties.maxVal = physicalValue;
            }
            i++;
            this.position += 8;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },

    readDataUnitFloat32: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getFloat32(this.position, false);
            var physicalValue = this.dataUnit[i] * this.fitsProperties.bScale + this.fitsProperties.bZero;
            if (this.fitsProperties.minVal > physicalValue) {
                this.fitsProperties.minVal = physicalValue;
            }
            if (this.fitsProperties.maxVal < physicalValue) {
                this.fitsProperties.maxVal = physicalValue;
            }
            i++;
            this.position += 4;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },

    readDataUnitUint8: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getUint8(this.position);
            if (this.fitsProperties.minVal > this.dataUnit[i]) {
                this.fitsProperties.minVal = this.dataUnit[i];
            }
            if (this.fitsProperties.maxVal < this.dataUnit[i]) {
                this.fitsProperties.maxVal = this.dataUnit[i];
            }
            i++;
            this.position += 1;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },

    readDataUnitInt16: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getInt16(this.position, false);
            if (this.fitsProperties.minVal > this.dataUnit[i]) {
                this.fitsProperties.minVal = this.dataUnit[i];
            }
            if (this.fitsProperties.maxVal < this.dataUnit[i]) {
                this.fitsProperties.maxVal = this.dataUnit[i];
            }
            i++;
            this.position += 2;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },

    readDataUnitInt32: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getInt32(this.position, false);
            if (this.fitsProperties.minVal > this.dataUnit[i]) {
                this.fitsProperties.minVal = this.dataUnit[i];
            }
            if (this.fitsProperties.maxVal < this.dataUnit[i]) {
                this.fitsProperties.maxVal = this.dataUnit[i];
            }
            i++;
            this.position += 4;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },

    computeWcs: function () {
        if (ss.keyExists(this.header, 'CROTA2')) {
            this.rotation = parseFloat(ss.trim(this.header['CROTA2']));
            this.hasRotation = true;
        }
        if (ss.keyExists(this.header, 'CDELT1')) {
            this.scaleX = parseFloat(ss.trim(this.header['CDELT1']));
            if (ss.keyExists(this.header, 'CDELT2')) {
                this.scaleY = parseFloat(ss.trim(this.header['CDELT2']));
                this.hasScale = true;
            }
        }
        if (ss.keyExists(this.header, 'CRPIX1')) {
            // In FITS/ WCS, pixel coordinates are 1 - based and integer pixel
            // coordinates land on pixel centers. Therefore in standard FITS
            // orientation, where the "first" pixel is at the lower-left, the
            // lower-left corner of the image has pixel coordinate (0.5, 0.5). For
            // the WWT offset parameters, the lower-left corner of the image has
            // coordinate (0, 0).
            this.referenceX = parseFloat(ss.trim(this.header['CRPIX1'])) - 0.5;
            if (ss.keyExists(this.header, 'CRPIX2')) {
                this.referenceY = parseFloat(ss.trim(this.header['CRPIX2'])) - 0.5;
                this.hasPixel = true;
            }
        }
        var galactic = false;
        var tan = false;
        if (ss.keyExists(this.header, 'CTYPE1')) {
            if (this.header['CTYPE1'].indexOf('GLON-') > -1) {
                galactic = true;
                tan = true;
            }
            if (this.header['CTYPE2'].indexOf('GLAT-') > -1) {
                galactic = true;
                tan = true;
            }
            if (this.header['CTYPE1'].indexOf('-TAN') > -1) {
                tan = true;
            }
            if (this.header['CTYPE1'].indexOf('-SIN') > -1) {
                tan = true;
            }
        }
        if (!tan) {
            throw new Error('Only TAN projected images are supported: ');
        }
        this.hasSize = true;
        if (ss.keyExists(this.header, 'CRVAL1')) {
            this.centerX = parseFloat(ss.trim(this.header['CRVAL1']));
            if (ss.keyExists(this.header, 'CRVAL2')) {
                this.centerY = parseFloat(ss.trim(this.header['CRVAL2']));
                this.hasLocation = true;
            }
        }
        if (galactic) {
            var result = Coordinates.galactictoJ2000(this.centerX, this.centerY);
            this.centerX = result[0];
            this.centerY = result[1];
        }
        if (ss.keyExists(this.header, 'CD1_1') && ss.keyExists(this.header, 'CD1_2') && ss.keyExists(this.header, 'CD2_1') && ss.keyExists(this.header, 'CD2_2')) {
            this.cd1_1 = parseFloat(ss.trim(this.header['CD1_1']));
            this.cd1_2 = parseFloat(ss.trim(this.header['CD1_2']));
            this.cd2_1 = parseFloat(ss.trim(this.header['CD2_1']));
            this.cd2_2 = parseFloat(ss.trim(this.header['CD2_2']));
            if (!this.hasRotation) {
                this.calculateRotationFromCD();
            }
            if (!this.hasScale) {
                this.calculateScaleFromCD();
            }
            this.hasScale = true;
            this.hasRotation = true;
        }
        this.set_validWcs(this.hasScale && this.hasRotation && this.hasPixel && this.hasLocation);
    },

    // Modify the FitsProperties object to apply any settings stored in this
    // FITS image's header keywords. This mechanism gives us a way to set up
    // the rendering of a tiled FITS image through keywords set on its
    // level-0 tile file.
    //
    // I'm not aware of any standard, or even standard-ish, headers to
    // define these settings, so we'll roll our own here.
    applyDisplaySettings: function () {
        // TODO for tiled FITS: distinguish between datamin in this one tile,
        // and datamin across the full, un-downsampled original imagery.

        if (ss.keyExists(this.header, 'DATAMIN')) {
            this.fitsProperties.lowerCut = parseFloat(ss.trim(this.header['DATAMIN']));
            this.fitsProperties.minVal = this.fitsProperties.lowerCut;
        }
        if (ss.keyExists(this.header, 'DATAMAX')) {
            this.fitsProperties.upperCut = parseFloat(ss.trim(this.header['DATAMAX']));
            this.fitsProperties.maxVal = this.fitsProperties.upperCut;
        }
        if (ss.keyExists(this.header, 'PXCUTMIN')) {
            this.fitsProperties.lowerCut = parseFloat(ss.trim(this.header['PXCUTMIN']));
        }
        if (ss.keyExists(this.header, 'PXCUTMAX')) {
            this.fitsProperties.upperCut = parseFloat(ss.trim(this.header['PXCUTMAX']));
        }
    },

    computeHistogram: function (count) {
        var histogram = new Array(count + 1);
        for (var i = 0; i < count + 1; i++) {
            histogram[i] = 0;
        }
        this.populateHistogram(histogram);
        var maxCounter = 1;
        var $enum1 = ss.enumerate(histogram);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            if (val > maxCounter) {
                maxCounter = val;
            }
        }
        histogram[count] = maxCounter;
        return histogram;
    },

    populateHistogram: function (histogram) {
        var buckets = histogram.length;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        for (var i = 0; i < this.dataUnit.length; i++) {
            if (!(this.dataUnit[i] === FitsImage.naN)) {
                histogram[Math.min(buckets - 1, ss.truncate(((this.fitsProperties.bZero + this.fitsProperties.bScale * this.dataUnit[i] - this.fitsProperties.minVal) / factor)))]++;
            }
        }
    },

    drawHistogram: function (ctx) {
        ctx.clearRect(0, 0, 255, 150);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,255)';
        var logMax = Math.log(this.histogramMaxCount);
        for (var i = 0; i < this.histogram.length; i++) {
            var height = Math.log(this.histogram[i]) / logMax;
            if (height < 0) {
                height = 0;
            }
            ctx.moveTo(i, 150);
            ctx.lineTo(i, 150 - (height * 150));
            ctx.stroke();
        }
    }
};

registerType("FitsImage", [FitsImage, FitsImage$, WcsImage]);
