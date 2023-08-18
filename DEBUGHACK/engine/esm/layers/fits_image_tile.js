// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A FITS image used as a tile in a pyramid.

import { registerType } from "../typesystem.js";
import { FitsImage } from "./fits_image.js";


// wwtlib.FitsImageTile
//
// Min & Max are already known for pyramid FITS.
// To improve performance, the below per pixel methods are overriden

export function FitsImageTile(dataset, file, callMeBack) {
    FitsImage.call(this, dataset, file, null, callMeBack);
}

var FitsImageTile$ = {
    readDataUnitFloat64: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getFloat64(this.position, false);
            i++;
            this.position += 8;
        }
    },

    readDataUnitFloat32: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getFloat32(this.position, false);
            i++;
            this.position += 4;
        }
    },

    readDataUnitUint8: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getUint8(this.position);
            i++;
            this.position += 1;
        }
    },

    readDataUnitInt16: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getInt16(this.position, false);
            i++;
            this.position += 2;
        }
    },

    readDataUnitInt32: function (dataView) {
        var i = 0;
        while (this.position < dataView.byteLength) {
            this.dataUnit[i] = dataView.getInt32(this.position, false);
            i++;
            this.position += 4;
        }
    },

    computeWcs: function () { }
};

registerType("FitsImageTile", [FitsImageTile, FitsImageTile$, FitsImage]);
