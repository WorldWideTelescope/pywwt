// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A FITS image with a pure JavaScript implementation.
//
// This class is used when WebGL 2 is not available, as in Safari.

import { ss } from "../ss.js";
import { registerType, registerEnum } from "../typesystem.js";
import { BinaryReader } from "../utilities/binary_reader.js";
import { Bitmap } from "../utilities/bitmap.js";
import { ColorMapContainer } from "./color_map_container.js";
import { FitsImage } from "./fits_image.js";


// wwtlib.DataTypes

export var DataTypes = {
    byteT: 0,
    int16T: 1,
    int32T: 2,
    floatT: 3,
    doubleT: 4,
    none: 5
};

registerType("DataTypes", DataTypes);
registerEnum("DataTypes", DataTypes);


// wwtlib.ScaleMap

export function ScaleMap() { }

var ScaleMap$ = {};

registerType("ScaleMap", [ScaleMap, ScaleMap$, null]);


// wwtlib.ScaleLinear

export function ScaleLinear(min, max) {
    this._min$1 = 0;
    this._max$1 = 0;
    this._factor$1 = 0;
    this._logFactor$1 = 0;
    ScaleMap.call(this);
    this._min$1 = min;
    this._max$1 = max;
    this._factor$1 = max - min;
}

var ScaleLinear$ = {
    map: function (val) {
        return Math.min(255, Math.max(0, ss.truncate(((val - this._min$1) / this._factor$1 * 255))));
    }
};

registerType("ScaleLinear", [ScaleLinear, ScaleLinear$, ScaleMap]);


// wwtlib.ScaleLog

export function ScaleLog(min, max) {
    this._min$1 = 0;
    this._max$1 = 0;
    this._factor$1 = 0;
    this._logFactor$1 = 0;
    ScaleMap.call(this);
    this._min$1 = min;
    this._max$1 = max;
    this._factor$1 = max - min;
    this._logFactor$1 = 255 / Math.log(255);
}

var ScaleLog$ = {
    map: function (val) {
        return Math.min(255, Math.max(0, ss.truncate((Math.log((val - this._min$1) / this._factor$1 * 255) * this._logFactor$1))));
    }
};

registerType("ScaleLog", [ScaleLog, ScaleLog$, ScaleMap]);


// wwtlib.ScalePow

export function ScalePow(min, max) {
    this._min$1 = 0;
    this._max$1 = 0;
    this._factor$1 = 0;
    this._powFactor$1 = 0;
    ScaleMap.call(this);
    this._min$1 = min;
    this._max$1 = max;
    this._factor$1 = max - min;
    this._powFactor$1 = 255 / Math.pow(255, 2);
}

var ScalePow$ = {
    map: function (val) {
        return Math.min(255, Math.max(0, ss.truncate((Math.pow((val - this._min$1) / this._factor$1 * 255, 2) * this._powFactor$1))));
    }
};

registerType("ScalePow", [ScalePow, ScalePow$, ScaleMap]);


// wwtlib.ScaleSqrt

export function ScaleSqrt(min, max) {
    this._min$1 = 0;
    this._max$1 = 0;
    this._factor$1 = 0;
    this._sqrtFactor$1 = 0;
    ScaleMap.call(this);
    this._min$1 = min;
    this._max$1 = max;
    this._factor$1 = max - min;
    this._sqrtFactor$1 = 255 / Math.sqrt(255);
}

var ScaleSqrt$ = {
    map: function (val) {
        return Math.min(255, Math.max(0, ss.truncate((Math.sqrt((val - this._min$1) / this._factor$1 * 255) * this._sqrtFactor$1))));
    }
};

registerType("ScaleSqrt", [ScaleSqrt, ScaleSqrt$, ScaleMap]);


// wwtlib.HistogramEqualization

export function HistogramEqualization(image, min, max) {
    this._min$1 = 0;
    this._max$1 = 0;
    this._factor$1 = 0;
    this._maxHistogramValue$1 = 1;
    ScaleMap.call(this);
    this._min$1 = min;
    this._max$1 = max;
    this._factor$1 = max - min;
    this._histogram$1 = image.computeHistogram(10000);
    this._maxHistogramValue$1 = this._histogram$1[10000];
    this._lookup$1 = new Array(10000);
    var totalCounts = ss.truncate((image.get_sizeX() * image.get_sizeY()));
    var sum = 0;
    for (var i = 0; i < 10000; i++) {
        sum += this._histogram$1[i];
        this._lookup$1[i] = (Math.min(255, (sum * 255) / totalCounts) + 0.5);
    }
}

var HistogramEqualization$ = {
    map: function (val) {
        return this._lookup$1[Math.min(10000 - 1, Math.max(0, ss.truncate(((val - this._min$1) / this._factor$1 * (10000 - 1)))))];
    }
};

registerType("HistogramEqualization", [HistogramEqualization, HistogramEqualization$, ScaleMap]);


// wwtlib.FitsImageJs

export function FitsImageJs(dataset, file, blob, callMeBack) {
    this.dataType = DataTypes.none;
    this._color$2 = false;
    this.isTiledFits = false;
    FitsImage.call(this, dataset, file, blob, callMeBack);
}

FitsImageJs.createTiledFits = function (dataset, file, callMeBack) {
    var fits = new FitsImageJs(dataset, file, null, callMeBack);
    fits.isTiledFits = true;
    return fits;
};

var FitsImageJs$ = {
    readFromBin: function (dataView) {
        FitsImage.prototype.readFromBin.call(this, dataView);
        if (this.numAxis === 3) {
            if (this.axisSize[2] === 3) {
                this._color$2 = true;
            }
        }
    },

    readDataUnit: function (dataView, bitpix) {
        var br = new BinaryReader(new Uint8Array(dataView.buffer));
        br.position = this.position;
        switch (bitpix) {
            case -64:
                this.dataType = DataTypes.doubleT;
                this._readDataUnitFloat64$2(br);
                break;
            case -32:
                this.dataType = DataTypes.floatT;
                this._readDataUnitFloat32$2(br);
                break;
            case 8:
                this.dataType = DataTypes.byteT;
                this._readDataUnitUint8$2(br);
                break;
            case 16:
                this.dataType = DataTypes.int16T;
                this._readDataUnitInt16$2(br);
                break;
            case 32:
                this.dataType = DataTypes.int32T;
                this._readDataUnitInt32$2(br);
                break;
        }
        this.fitsProperties.lowerCut = this.fitsProperties.minVal;
        this.fitsProperties.upperCut = this.fitsProperties.maxVal;
    },
    _readDataUnitUint8$2: function (br) {
        var buffer = new Array(this.bufferSize);
        this._dataBuffer$2 = buffer;
        for (var i = 0; i < this.bufferSize; i++) {
            buffer[i] = br.readByte();
            if (this.fitsProperties.minVal > buffer[i]) {
                this.fitsProperties.minVal = buffer[i];
            }
            if (this.fitsProperties.maxVal < buffer[i]) {
                this.fitsProperties.maxVal = buffer[i];
            }
        }
    },
    _readDataUnitInt16$2: function (br) {
        var buffer = new Array(this.bufferSize);
        this._dataBuffer$2 = buffer;
        for (var i = 0; i < this.bufferSize; i++) {
            buffer[i] = ((br.readSByte() * 256) + br.readByte());
            if (this.fitsProperties.minVal > buffer[i]) {
                this.fitsProperties.minVal = buffer[i];
            }
            if (this.fitsProperties.maxVal < buffer[i]) {
                this.fitsProperties.maxVal = buffer[i];
            }
        }
    },
    _readDataUnitInt32$2: function (br) {
        var buffer = new Array(this.bufferSize);
        this._dataBuffer$2 = buffer;
        for (var i = 0; i < this.bufferSize; i++) {
            buffer[i] = (br.readSByte() << 24) + (br.readSByte() << 16) + (br.readSByte() << 8) + br.readByte();
            if (this.fitsProperties.minVal > buffer[i]) {
                this.fitsProperties.minVal = buffer[i];
            }
            if (this.fitsProperties.maxVal < buffer[i]) {
                this.fitsProperties.maxVal = buffer[i];
            }
        }
    },
    _readDataUnitFloat32$2: function (br) {
        var buffer = new Array(this.bufferSize);
        this._dataBuffer$2 = buffer;
        var part = new Uint8Array(4);
        for (var i = 0; i < this.bufferSize; i++) {
            part[3] = br.readByte();
            part[2] = br.readByte();
            part[1] = br.readByte();
            part[0] = br.readByte();
            buffer[i] = new Float32Array(part.buffer, 0, 1)[0];
            if (this.fitsProperties.minVal > buffer[i]) {
                this.fitsProperties.minVal = buffer[i];
            }
            if (this.fitsProperties.maxVal < buffer[i]) {
                this.fitsProperties.maxVal = buffer[i];
            }
        }
    },
    _readDataUnitFloat64$2: function (br) {
        var buffer = new Array(this.bufferSize);
        var part = new Uint8Array(8);
        this._dataBuffer$2 = buffer;
        for (var i = 0; i < this.bufferSize; i++) {
            part[7] = br.readByte();
            part[6] = br.readByte();
            part[5] = br.readByte();
            part[4] = br.readByte();
            part[3] = br.readByte();
            part[2] = br.readByte();
            part[1] = br.readByte();
            part[0] = br.readByte();
            buffer[i] = new Float64Array(part.buffer, 0, 1)[0];
            if (this.fitsProperties.minVal > buffer[i]) {
                this.fitsProperties.minVal = buffer[i];
            }
            if (this.fitsProperties.maxVal < buffer[i]) {
                this.fitsProperties.maxVal = buffer[i];
            }
        }
    },

    getBitmap: function () {
        if (!this.fitsProperties.upperCut && !this.fitsProperties.lowerCut) {
            this.fitsProperties.lowerCut = this.fitsProperties.minVal;
            this.fitsProperties.upperCut = this.fitsProperties.maxVal;
        }
        return this.getScaledBitmap(this.fitsProperties.lowerCut, this.fitsProperties.upperCut, this.fitsProperties.scaleType, 0, this.fitsProperties.colorMapName);
    },

    getScaledBitmap: function (min, max, scaleType, z, colorMapperName) {
        var scale;
        this.fitsProperties.scaleType = scaleType;
        this.fitsProperties.lowerCut = min;
        this.fitsProperties.upperCut = max;
        this.fitsProperties.colorMapName = colorMapperName;
        var colorMapper = ColorMapContainer.fromNamedColormap(colorMapperName);
        switch (scaleType) {
            case 0:
            default:
                scale = new ScaleLinear(min, max);
                break;
            case 1:
                scale = new ScaleLog(min, max);
                break;
            case 2:
                scale = new ScalePow(min, max);
                break;
            case 3:
                scale = new ScaleSqrt(min, max);
                break;
            case 4:
                scale = new HistogramEqualization(this, min, max);
                break;
        }
        try {
            switch (this.dataType) {
                case DataTypes.byteT:
                    return this._getBitmapByte$2(min, max, scale, 0, colorMapper);
                case DataTypes.int16T:
                    return this.getBitmapShort(min, max, scale, 0, colorMapper);
                case DataTypes.int32T:
                    return this._getBitmapInt$2(min, max, scale, 0, colorMapper);
                case DataTypes.floatT:
                    return this._getBitmapFloat$2(min, max, scale, 0, colorMapper);
                case DataTypes.doubleT:
                    return this._getBitmapDouble$2(min, max, scale, 0, colorMapper);
                case DataTypes.none:
                default:
                    return Bitmap.create(100, 100);
            }
        }
        catch ($e1) {
            return Bitmap.create(10, 10);
        }
    },
    _setPixelWithColorMap$2: function (bmp, x, y, val, colorMapper) {
        if (colorMapper == null) {
            bmp.setPixel(x, y, val, val, val, (this.fitsProperties.transparentBlack && !val) ? 0 : 255);
            return;
        }
        var pixel_value = val / 255;
        if (Number.isNaN(pixel_value)) {
            // This case "can't happen" in C#, but due to JavaScript's numerical
            // model, it can happen here.
            bmp.setPixel(x, y, 0, 0, 0, 0);
            return;
        }
        var pixel_color = colorMapper.findClosestColor(pixel_value);
        bmp.setPixel(x, y, ss.truncate(pixel_color.r), ss.truncate(pixel_color.g), ss.truncate(pixel_color.b), (this.fitsProperties.transparentBlack && !val) ? 0 : 255);
    },
    _getBitmapByte$2: function (min, max, scale, z, colorMapper) {
        var buf = this._dataBuffer$2;
        var factor = max - min;
        var stride = this.axisSize[0];
        var page = this.axisSize[0] * this.axisSize[1] * z;
        var bmp = Bitmap.create(this.axisSize[0], this.axisSize[1]);
        for (var y = 0; y < this.axisSize[1]; y++) {
            var indexY = ((this.axisSize[1] - 1) - y);
            for (var x = 0; x < this.axisSize[0]; x++) {
                if (this._color$2) {
                    var datR = buf[(x + indexY * stride)];
                    var datG = buf[(x + indexY * stride) + page];
                    var datB = buf[(x + indexY * stride) + page * 2];
                    if (this.fitsProperties.containsBlanks && datR === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var r = scale.map(datR);
                        var g = scale.map(datG);
                        var b = scale.map(datB);
                        bmp.setPixel(x, y, r, g, b, 255);
                    }
                }
                else {
                    var dataValue = buf[x + indexY * stride + page];
                    if (this.fitsProperties.containsBlanks && dataValue === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var val = scale.map(dataValue);
                        this._setPixelWithColorMap$2(bmp, x, y, val, colorMapper);
                    }
                }
            }
        }
        return bmp;
    },
    _getBitmapDouble$2: function (min, max, scale, z, colorMapper) {
        var buf = this._dataBuffer$2;
        var factor = max - min;
        var stride = this.axisSize[0];
        var page = this.axisSize[0] * this.axisSize[1] * z;
        var bmp = Bitmap.create(this.axisSize[0], this.axisSize[1]);
        for (var y = 0; y < this.axisSize[1]; y++) {
            var indexY = ((this.axisSize[1] - 1) - y);
            for (var x = 0; x < this.axisSize[0]; x++) {
                if (this._color$2) {
                    var datR = buf[(x + indexY * stride)];
                    var datG = buf[(x + indexY * stride) + page];
                    var datB = buf[(x + indexY * stride) + page * 2];
                    if (this.fitsProperties.containsBlanks && datR === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var r = scale.map(datR);
                        var g = scale.map(datG);
                        var b = scale.map(datB);
                        bmp.setPixel(x, y, r, g, b, 255);
                    }
                }
                else {
                    var dataValue = buf[x + indexY * stride + page];
                    if (this.fitsProperties.containsBlanks && dataValue === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var val = scale.map(dataValue);
                        this._setPixelWithColorMap$2(bmp, x, y, val, colorMapper);
                    }
                }
            }
        }
        return bmp;
    },
    _getBitmapFloat$2: function (min, max, scale, z, colorMapper) {
        var buf = this._dataBuffer$2;
        var factor = max - min;
        var stride = this.axisSize[0];
        var page = this.axisSize[0] * this.axisSize[1] * z;
        var bmp = Bitmap.create(this.axisSize[0], this.axisSize[1]);
        for (var y = 0; y < this.axisSize[1]; y++) {
            var indexY = ((this.axisSize[1] - 1) - y);
            for (var x = 0; x < this.axisSize[0]; x++) {
                if (this._color$2) {
                    var datR = buf[(x + indexY * stride)];
                    var datG = buf[(x + indexY * stride) + page];
                    var datB = buf[(x + indexY * stride) + page * 2];
                    if (this.fitsProperties.containsBlanks && datR === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var r = scale.map(datR);
                        var g = scale.map(datG);
                        var b = scale.map(datB);
                        bmp.setPixel(x, y, r, g, b, 255);
                    }
                }
                else {
                    var dataValue = buf[x + indexY * stride + page];
                    if (this.fitsProperties.containsBlanks && dataValue === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var val = scale.map(dataValue);
                        this._setPixelWithColorMap$2(bmp, x, y, val, colorMapper);
                    }
                }
            }
        }
        return bmp;
    },
    _getBitmapInt$2: function (min, max, scale, z, colorMapper) {
        var buf = this._dataBuffer$2;
        var factor = max - min;
        var stride = this.axisSize[0];
        var page = this.axisSize[0] * this.axisSize[1] * z;
        var bmp = Bitmap.create(this.axisSize[0], this.axisSize[1]);
        for (var y = 0; y < this.axisSize[1]; y++) {
            var indexY = ((this.axisSize[1] - 1) - y);
            for (var x = 0; x < this.axisSize[0]; x++) {
                if (this._color$2) {
                    var datR = buf[(x + indexY * stride)];
                    var datG = buf[(x + indexY * stride) + page];
                    var datB = buf[(x + indexY * stride) + page * 2];
                    if (this.fitsProperties.containsBlanks && datR === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var r = scale.map(datR);
                        var g = scale.map(datG);
                        var b = scale.map(datB);
                        bmp.setPixel(x, y, r, g, b, 255);
                    }
                }
                else {
                    var dataValue = buf[x + indexY * stride + page];
                    if (this.fitsProperties.containsBlanks && dataValue === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var val = scale.map(dataValue);
                        this._setPixelWithColorMap$2(bmp, x, y, val, colorMapper);
                    }
                }
            }
        }
        return bmp;
    },

    getBitmapShort: function (min, max, scale, z, colorMapper) {
        var buf = this._dataBuffer$2;
        var factor = max - min;
        var stride = this.axisSize[0];
        var page = this.axisSize[0] * this.axisSize[1] * z;
        var bmp = Bitmap.create(this.axisSize[0], this.axisSize[1]);
        for (var y = 0; y < this.axisSize[1]; y++) {
            var indexY = ((this.axisSize[1] - 1) - y);
            for (var x = 0; x < this.axisSize[0]; x++) {
                if (this._color$2) {
                    var datR = buf[(x + indexY * stride)];
                    var datG = buf[(x + indexY * stride) + page];
                    var datB = buf[(x + indexY * stride) + page * 2];
                    if (this.fitsProperties.containsBlanks && datR === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var r = scale.map(datR);
                        var g = scale.map(datG);
                        var b = scale.map(datB);
                        bmp.setPixel(x, y, r, g, b, 255);
                    }
                }
                else {
                    var dataValue = buf[x + indexY * stride + page];
                    if (this.fitsProperties.containsBlanks && dataValue === this.fitsProperties.blankValue) {
                        bmp.setPixel(x, y, 0, 0, 0, 0);
                    }
                    else {
                        var val = scale.map(dataValue);
                        this._setPixelWithColorMap$2(bmp, x, y, val, colorMapper);
                    }
                }
            }
        }
        return bmp;
    },

    computeWcs: function () {
        if (!this.isTiledFits) {
            FitsImage.prototype.computeWcs.call(this);
        }
    },

    populateHistogram: function (histogram) {
        switch (this.dataType) {
            case DataTypes.byteT:
                this._populateHistogramByte$2(histogram);
                break;
            case DataTypes.int16T:
                this._populateHistogramInt16$2(histogram);
                break;
            case DataTypes.int32T:
                this._populateHistogramInt32$2(histogram);
                break;
            case DataTypes.floatT:
                this._populateHistogramFloat$2(histogram);
                break;
            case DataTypes.doubleT:
                this._populateHistogramDouble$2(histogram);
                break;
        }
    },
    _populateHistogramDouble$2: function (histogram) {
        var buckets = histogram.length;
        var buf = this._dataBuffer$2;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        var $enum1 = ss.enumerate(buf);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            if (!Number.isNaN(val)) {
                histogram[Math.min(buckets - 1, ss.truncate(((val - this.fitsProperties.minVal) / factor)))]++;
            }
        }
    },
    _populateHistogramFloat$2: function (histogram) {
        var buckets = histogram.length;
        var buf = this._dataBuffer$2;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        var $enum1 = ss.enumerate(buf);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            if (!(val === FitsImage.naN)) {
                histogram[Math.min(buckets - 1, ss.truncate(((val - this.fitsProperties.minVal) / factor)))]++;
            }
        }
    },
    _populateHistogramInt32$2: function (histogram) {
        var buckets = histogram.length;
        var buf = this._dataBuffer$2;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        var $enum1 = ss.enumerate(buf);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            histogram[Math.min(buckets - 1, ss.truncate(((val - this.fitsProperties.minVal) / factor)))]++;
        }
    },
    _populateHistogramInt16$2: function (histogram) {
        var buckets = histogram.length;
        var buf = this._dataBuffer$2;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        var $enum1 = ss.enumerate(buf);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            histogram[Math.min(buckets - 1, ss.truncate(((val - this.fitsProperties.minVal) / factor)))]++;
        }
    },
    _populateHistogramByte$2: function (histogram) {
        var buckets = histogram.length;
        var buf = this._dataBuffer$2;
        var factor = (this.fitsProperties.maxVal - this.fitsProperties.minVal) / buckets;
        var $enum1 = ss.enumerate(buf);
        while ($enum1.moveNext()) {
            var val = $enum1.current;
            histogram[Math.min(buckets - 1, ss.truncate(((val - this.fitsProperties.minVal) / factor)))]++;
        }
    }
};

registerType("FitsImageJs", [FitsImageJs, FitsImageJs$, FitsImage]);
