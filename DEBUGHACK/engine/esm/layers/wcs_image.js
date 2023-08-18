// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Information about an image with a World Coordinate System registration.

import { registerType } from "../typesystem.js";


// wwtlib.WcsImage

export function WcsImage() {
    this.copyright = '';
    this.creditsUrl = '';
    this._validWcs = false;
    this.keywords = [];
    this.description = '';
    this.scaleX = 0;
    this.scaleY = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.rotation = 0;
    this.referenceX = 0;
    this.referenceY = 0;
    this.sizeX = 0;
    this.sizeY = 0;
    this.cd1_1 = 0;
    this.cd1_2 = 0;
    this.cd2_1 = 0;
    this.cd2_2 = 0;
    this.hasRotation = false;
    this.hasSize = false;
    this.hasScale = false;
    this.hasLocation = false;
    this.hasPixel = false;
    this.filename = '';
    this._colorCombine = false;
}

var WcsImage$ = {
    get_copyright: function () {
        return this.copyright;
    },

    set_copyright: function (value) {
        this.copyright = value;
        return value;
    },

    get_creditsUrl: function () {
        return this.creditsUrl;
    },

    set_creditsUrl: function (value) {
        this.creditsUrl = value;
        return value;
    },

    get_validWcs: function () {
        return this._validWcs;
    },

    set_validWcs: function (value) {
        this._validWcs = value;
        return value;
    },

    get_keywords: function () {
        if (!this.keywords.length) {
            this.keywords.push('Image File');
        }
        return this.keywords;
    },

    set_keywords: function (value) {
        this.keywords = value;
        return value;
    },

    get_description: function () {
        return this.description;
    },

    set_description: function (value) {
        this.description = value;
        return value;
    },

    get_scaleX: function () {
        return this.scaleX;
    },

    set_scaleX: function (value) {
        this.scaleX = value;
        return value;
    },

    get_scaleY: function () {
        return this.scaleY;
    },

    set_scaleY: function (value) {
        this.scaleY = value;
        return value;
    },

    get_centerX: function () {
        return this.centerX;
    },

    set_centerX: function (value) {
        this.centerX = value;
        return value;
    },

    get_viewCenterX: function () {
        return this.centerX + (this.get_sizeX() / 2 - this.get_referenceX()) * this.get_scaleX();
    },

    get_centerY: function () {
        return this.centerY;
    },

    set_centerY: function (value) {
        this.centerY = value;
        return value;
    },

    get_viewCenterY: function () {
        return this.centerY + (this.get_sizeY() / 2 - this.get_referenceY()) * this.get_scaleY();
    },

    get_rotation: function () {
        return this.rotation;
    },

    set_rotation: function (value) {
        this.rotation = value;
        return value;
    },

    get_referenceX: function () {
        return this.referenceX;
    },

    set_referenceX: function (value) {
        this.referenceX = value;
        return value;
    },

    get_referenceY: function () {
        return this.referenceY;
    },

    set_referenceY: function (value) {
        this.referenceY = value;
        return value;
    },

    get_sizeX: function () {
        return this.sizeX;
    },

    set_sizeX: function (value) {
        this.sizeX = value;
        return value;
    },

    get_sizeY: function () {
        return this.sizeY;
    },

    set_sizeY: function (value) {
        this.sizeY = value;
        return value;
    },

    get_cd1_1: function () {
        return this.cd1_1;
    },

    set_cd1_1: function (value) {
        this.cd1_1 = value;
        return value;
    },

    get_cd1_2: function () {
        return this.cd1_2;
    },

    set_cd1_2: function (value) {
        this.cd1_2 = value;
        return value;
    },

    get_cd2_1: function () {
        return this.cd2_1;
    },

    set_cd2_1: function (value) {
        this.cd2_1 = value;
        return value;
    },

    get_cd2_2: function () {
        return this.cd2_2;
    },

    set_cd2_2: function (value) {
        this.cd2_2 = value;
        return value;
    },

    adjustScale: function (width, height) {
        //adjusts the actual height vs the reported height.
        if (width !== this.sizeX) {
            this.scaleX *= (this.sizeX / width);
            this.referenceX /= (this.sizeX / width);
            this.sizeX = width;
        }
        if (height !== this.sizeY) {
            this.scaleY *= (this.sizeY / height);
            this.referenceY /= (this.sizeY / height);
            this.sizeY = height;
        }
    },

    calculateScaleFromCD: function () {
        this.scaleX = (Math.sqrt(this.cd1_1 * this.cd1_1 + this.cd2_1 * this.cd2_1) * (this.cd1_1 * this.cd2_2 - this.cd1_2 * this.cd2_1) < 0) ? -1 : 1;
        this.scaleY = Math.sqrt(this.cd1_2 * this.cd1_2 + this.cd2_2 * this.cd2_2);
    },

    calculateRotationFromCD: function () {
        var sign = ((this.cd1_1 * this.cd2_2 - this.cd1_2 * this.cd2_1) < 0) ? -1 : 1;
        var rot2 = Math.atan2((-sign * this.cd1_2), this.cd2_2);
        this.rotation = rot2 / Math.PI * 180;
    },

    get_filename: function () {
        return this.filename;
    },

    set_filename: function (value) {
        this.filename = value;
        return value;
    },

    get_colorCombine: function () {
        return this._colorCombine;
    },

    set_colorCombine: function (value) {
        this._colorCombine = value;
        return value;
    },

    getBitmap: function () {
        return null;
    }
};

registerType("WcsImage", [WcsImage, WcsImage$, null]);
