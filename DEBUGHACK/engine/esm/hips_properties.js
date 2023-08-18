// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Summary properties about HiPS datasets.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { set_makeNewHipsProperties } from "./data_globals.js";
import { WebFile } from "./web_file.js";
import { Guid } from "./util.js";
import { CatalogSpreadSheetLayer } from "./layers/spreadsheet_layer.js";
import { VoTable } from "./layers/vo_table.js";
import { LayerManager } from "./layers/layer_manager.js";


// wwtlib.HipsProperties

export function HipsProperties(dataset) {
    this._properties = {};
    this._catalogColumnInfo = null;
    this._catalogSpreadSheetLayer = new CatalogSpreadSheetLayer();
    this._downloadComplete = false;
    this.dataset = dataset;
    this._datasetName = dataset.get_name();
    this._url = dataset.get_url();
    if (this._url.toLowerCase().indexOf('norder') > -1) {
        this._url = this._url.substring(0, this._url.toLowerCase().indexOf('norder'));
    }
    this._url += 'properties';
    this._download();
}

var HipsProperties$ = {
    get_properties: function () {
        return this._properties;
    },

    get_catalogSpreadSheetLayer: function () {
        return this._catalogSpreadSheetLayer;
    },

    set_catalogSpreadSheetLayer: function (value) {
        this._catalogSpreadSheetLayer = value;
        return value;
    },

    get_catalogColumnInfo: function () {
        return this._catalogColumnInfo;
    },

    set_catalogColumnInfo: function (value) {
        this._catalogColumnInfo = value;
        return value;
    },

    get_downloadComplete: function () {
        return this._downloadComplete;
    },

    _download: function () {
        this._webFile = new WebFile(this._url);
        this._webFile.onStateChange = ss.bind('_onPropertiesDownloadComplete', this);
        this._webFile.send();
    },

    _onPropertiesDownloadComplete: function () {
        if (this._webFile.get_state() === 1) {
            this._parseProperties(this._webFile.getText());
            if (ss.keyExists(this.get_properties(), 'dataproduct_type') && this.get_properties()['dataproduct_type'].toLowerCase() === 'catalog') {
                this._catalogColumnInfo = VoTable.loadFromUrl(ss.replaceString(this._url, '/properties', '/metadata.xml'), ss.bind('_onCatalogMetadataDownloadComplete', this));
            }
            else {
                if (ss.keyExists(this.get_properties(), 'hips_data_range')) {
                    var hips_data_range = this.get_properties()['hips_data_range'];
                    this.dataset.get_fitsProperties().minVal = parseFloat(hips_data_range.split(' ')[0]);
                    this.dataset.get_fitsProperties().maxVal = parseFloat(hips_data_range.split(' ')[1]);
                    this.dataset.get_fitsProperties().lowerCut = this.dataset.get_fitsProperties().minVal;
                    this.dataset.get_fitsProperties().upperCut = this.dataset.get_fitsProperties().maxVal;
                }
                if (ss.keyExists(this.get_properties(), 'hips_pixel_cut')) {
                    var hips_pixel_cut = this.get_properties()['hips_pixel_cut'];
                    this.dataset.get_fitsProperties().lowerCut = parseFloat(hips_pixel_cut.split(' ')[0]);
                    this.dataset.get_fitsProperties().upperCut = parseFloat(hips_pixel_cut.split(' ')[1]);
                    if (!ss.keyExists(this.get_properties(), 'hips_data_range')) {
                        this.dataset.get_fitsProperties().minVal = this.dataset.get_fitsProperties().lowerCut;
                        this.dataset.get_fitsProperties().maxVal = this.dataset.get_fitsProperties().upperCut;
                    }
                }
                this._downloadComplete = true;
                if (this._onDownloadComplete != null) {
                    this._onDownloadComplete();
                }
            }
        }
    },

    _onCatalogMetadataDownloadComplete: function () {
        this._catalogSpreadSheetLayer.useHeadersFromVoTable(this._catalogColumnInfo);
        this._catalogSpreadSheetLayer.set_name(this._datasetName);
        this._catalogSpreadSheetLayer.id = Guid.createFrom(this._datasetName);
        LayerManager.addSpreadsheetLayer(this.get_catalogSpreadSheetLayer(), 'Sky');
        this._downloadComplete = true;
        if (this._onDownloadComplete != null) {
            this._onDownloadComplete();
        }
    },

    setDownloadCompleteListener: function (listener) {
        this._onDownloadComplete = listener;
    },

    _parseProperties: function (data) {
        var lines = data.split('\n');
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var line = $enum1.current;
            if (!ss.whitespace(line) && !ss.startsWith(line, '#')) {
                var parts = line.split('=');
                if (parts.length === 2) {
                    var key = ss.trim(parts[0]);
                    var val = ss.trim(parts[1]);
                    if (!ss.whitespace(key) && !ss.whitespace(val)) {
                        this.get_properties()[key] = val;
                    }
                }
            }
        }
    }
};

registerType("HipsProperties", [HipsProperties, HipsProperties$, null]);

set_makeNewHipsProperties(function (imageset) {
    return new HipsProperties(imageset);
});

