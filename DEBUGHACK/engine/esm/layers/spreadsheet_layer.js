// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that renders tabular data.

import { ss } from "../ss.js";
import { registerType, Enums } from "../typesystem.js";
import { Util } from "../baseutil.js";
import { Vector3d, Vector4d } from "../double3d.js";
import { layerManagerGetAllMaps } from "../data_globals.js";
import { globalRenderContext, tilePrepDevice } from "../render_globals.js";
import { WEBGL } from "../graphics/webgl_constants.js";
import { Dates, LineList, TriangleList, PointList } from "../graphics/primitives3d.js";
import { Texture } from "../graphics/texture.js";
import { Tessellator } from "../graphics/tessellator.js";
import { Color, Colors } from "../color.js";
import { Coordinates } from "../coordinates.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { UiTools } from "../ui_tools.js";
import { URLHelpers } from "../url_helpers.js";
import { ColorMapContainer } from "./color_map_container.js";
import { Layer } from "./layer.js";
import { Table } from "./table.js";


// wwtlib.KmlCoordinate

export function KmlCoordinate() {
    this.lat = 0;
    this.lng = 0;
    this.alt = 0;
}

var KmlCoordinate$ = {};

registerType("KmlCoordinate", [KmlCoordinate, KmlCoordinate$, null]);


// wwtlib.KmlLineList

export function KmlLineList() {
    this.extrude = false;
    this.astronomical = false;
    this.meanRadius = 6371000;
    this.pointList = [];
}

var KmlLineList$ = {
    parseWkt: function (geoText, option, alt, date) {
        var parts = UiTools.split(geoText, '(,)');
        var $enum1 = ss.enumerate(parts);
        while ($enum1.moveNext()) {
            var part = $enum1.current;
            var coordinates = ss.trim(part).split(' ');
            if (coordinates.length > 1) {
                var pnt = new KmlCoordinate();
                pnt.lng = parseFloat(coordinates[0]);
                if (this.astronomical) {
                    pnt.lng -= 180;
                }
                pnt.lat = parseFloat(coordinates[1]);
                if (coordinates.length > 2 && !alt) {
                    pnt.alt = parseFloat(coordinates[2]);
                }
                else {
                    pnt.alt = alt;
                }
                pnt.date = date;
                this.pointList.push(pnt);
            }
        }
    },

    getCenterPoint: function () {
        var point = new KmlCoordinate();
        point.lat = 0;
        point.lng = 0;
        point.alt = 0;
        var $enum1 = ss.enumerate(this.pointList);
        while ($enum1.moveNext()) {
            var pnt = $enum1.current;
            point.lat += pnt.lat;
            point.lng += pnt.lng;
            point.alt += pnt.alt;
        }
        point.lat /= this.pointList.length;
        point.lng /= this.pointList.length;
        point.alt /= this.pointList.length;
        return point;
    }
};

registerType("KmlLineList", [KmlLineList, KmlLineList$, null]);


// wwtlib.PushPin

export function PushPin() { }

PushPin._pinTextureCache = {};
PushPin._pins = null;

PushPin.triggerLoadSprite = function () {
    if (PushPin._pins == null) {
        PushPin._pins = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('pins.png'));
    }
};

PushPin.getPushPinTexture = function (pinId) {
    var texture = null;
    if (ss.keyExists(PushPin._pinTextureCache, pinId)) {
        return PushPin._pinTextureCache[pinId];
    }
    try {
        texture = tilePrepDevice.createTexture();
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, texture);
        var row = Math.floor(pinId / 16);
        var col = pinId % 16;
        var temp = document.createElement('canvas');
        temp.height = 32;
        temp.width = 32;
        var ctx = temp.getContext('2d');
        //Substitute the resized image
        ctx.drawImage(PushPin._pins.imageElement, (col * 32), (row * 32), 32, 32, 0, 0, 32, 32);
        var image = temp;
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_S, WEBGL.CLAMP_TO_EDGE);
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_WRAP_T, WEBGL.CLAMP_TO_EDGE);
        tilePrepDevice.texImage2D(WEBGL.TEXTURE_2D, 0, WEBGL.RGBA, WEBGL.RGBA, WEBGL.UNSIGNED_BYTE, image);
        tilePrepDevice.texParameteri(WEBGL.TEXTURE_2D, WEBGL.TEXTURE_MIN_FILTER, WEBGL.LINEAR_MIPMAP_NEAREST);
        tilePrepDevice.generateMipmap(WEBGL.TEXTURE_2D);
        tilePrepDevice.bindTexture(WEBGL.TEXTURE_2D, null);
        PushPin._pinTextureCache[pinId] = texture;
    }
    catch ($e1) { }
    return texture;
};

var PushPin$ = {};

registerType("PushPin", [PushPin, PushPin$, null]);


// wwtlib.SpreadSheetLayer

export function SpreadSheetLayer() {
    this._dataDirty$1 = false;
    this._lastNormalizeSizeColumnIndex$1 = -1;
    this._lastDynamicColorColumnIndex$1 = -1;
    this._table_backcompat$1 = null;
    this._barChartBitmask$1 = 0;
    this._barScaleFactor$1 = 20;
    this._meanRadius$1 = 6371000;
    this._table$1 = new Table();
    this.isLongIndex = false;
    this.shapeVertexCount = 0;
    this.lines = false;
    this.latColumn = -1;
    this.fixedSize = 1;
    this.decay = 16;
    this.timeSeries = false;
    this._dynamicData$1 = false;
    this._autoUpdate$1 = false;
    this._dataSourceUrl$1 = '';
    this._beginRange$1 = new Date('1/1/2100');
    this._endRange$1 = new Date('01/01/1800');
    this.markerDomainValues = {};
    this.colorDomainValues = {};
    this._coordinatesType$1 = 0;
    this.lngColumn = -1;
    this.geometryColumn = -1;
    this._xAxisColumn$1 = -1;
    this._yAxisColumn$1 = -1;
    this._zAxisColumn$1 = -1;
    this._xAxisReverse$1 = false;
    this._yAxisReverse$1 = false;
    this._zAxisReverse$1 = false;
    this._altType$1 = 3;
    this._markerMix$1 = 0;
    this._raUnits$1 = 0;
    this.colorMap = 3;
    this.colorMapperName = 'Greys';

    // The following attributes control whether and how to map values from
    // the ColorMapColumn to colors. The overall option DynamicColor
    // determines whether colors should be determined on-the-fly from column
    // values. In this case, first, if NormalizeColorMap is true, the values
    // are normalized to the range [0:1] using:
    //
    // new_value = (value - NormalizeColorMapMin) / (NormalizeColorMapMax - NormalizeColorMapMin)
    //
    // Whether or not the values are normalized, they are then mapped to colors using
    // the color map with the name given by ColorMapName.

    // Note that we use a hard-coded UUID since we need it to always be the same across
    // all WWT sessions so that we can remove it when it isn't needed.

    this._dynamicColorColumnName$1 = '2efc32e3-b9d9-47ff-8036-8cc344c585bd';
    this.dynamicColor = false;
    this.normalizeColorMap = false;
    this.normalizeColorMapMin = 0;
    this.normalizeColorMapMax = 1;
    this._markerColumn$1 = -1;
    this.colorMapColumn = -1;
    this._plotType$1 = 0;
    this._markerIndex$1 = 0;
    this._showFarSide$1 = false;
    this._markerScale$1 = 1;
    this._altUnit$1 = 1;
    this._cartesianScale$1 = 1;
    this._cartesianCustomScale$1 = 1;
    this.altColumn = -1;
    this.startDateColumn = -1;
    this.endDateColumn = -1;
    this.sizeColumn = -1;

    // The following attributes control whether the point sizes should be normalized before
    // being used. When NormalizeSize is true, the point sizes are scaled using
    //
    // new_size = (size - NormalizeSizeMin) / (NormalizeSizeMax - NormalizeSizeMin)
    //
    // The NormalizeSizeClip attribute can be used to determine whether the sizes should
    // be clipped to the range [0:1]. At this time, normalization is only applied if
    // PointScaleTypes is Linear or Power.

    // Note that we use a hard-coded UUID since we need it to always be the same across
    // all WWT sessions so that we can remove it when it isn't needed.

    this._normalizeSizeColumnName$1 = 'dfe78b4c-f972-4796-b04f-68c5efd4ecb0';
    this.normalizeSize = false;
    this.normalizeSizeClip = false;
    this.normalizeSizeMin = 0;
    this.normalizeSizeMax = 1;
    this.nameColumn = 0;
    this._hyperlinkFormat$1 = '';
    this._hyperlinkColumn$1 = -1;
    this.scaleFactor = 1;
    this.pointScaleType = 1;
    this.positions = [];
    this.bufferIsFlat = false;
    this.baseDate = new Date(2010, 0, 1, 12, 0, 0);
    this.dirty = true;
    this.lastVersion = 0;
    Layer.call(this);
}

SpreadSheetLayer._circleTexture$1 = null;

SpreadSheetLayer._getDatafromFeed$1 = function (url) {
    return '';
};

SpreadSheetLayer._executeQuery$1 = function (url) {
    return '';
};

SpreadSheetLayer.parseDate = function (date) {
    var dt = ss.now();
    try {
        dt = new Date(date);
    }
    catch ($e1) {
        try {
            return SpreadSheetLayer.execlToDateTime(parseFloat(date));
        }
        catch ($e2) {
        }
    }
    return dt;
};

SpreadSheetLayer.execlToDateTime = function (excelDate) {
    if (excelDate > 59) {
        excelDate -= 1;
    }
    if (excelDate > 730000) {
        excelDate = 730000;
    }
    var es = new Date(1899, 12, 31);
    return new Date(es.getDate() + ss.truncate((excelDate * 24 * 60 * 60 * 1000)));
};

SpreadSheetLayer.get__circleTexture$1 = function () {
    if (SpreadSheetLayer._circleTexture$1 == null) {
        var url = URLHelpers.singleton.engineAssetUrl('circle.png');
        SpreadSheetLayer._circleTexture$1 = Texture.fromUrl(url);
    }
    return SpreadSheetLayer._circleTexture$1;
};

var SpreadSheetLayer$ = {
    getTypeName: function () {
        return 'TerraViewer.SpreadSheetLayer';
    },

    get_header: function () {
        return this._table$1.header;
    },

    canCopyToClipboard: function () {
        return true;
    },

    copyToClipboard: function () { },

    dynamicUpdate: function () {
        var data = SpreadSheetLayer._getDatafromFeed$1(this.get_dataSourceUrl());
        if (data != null) {
            this.updateData(data, false, true, true);
            this.guessHeaderAssignments();
            return true;
        }
        return false;
    },

    updateData: function (data, purgeOld, purgeAll, hasHeader) {
        this.loadFromString(ss.safeCast(data, String), true, purgeOld, purgeAll, hasHeader);
        this.computeDateDomainRange(-1, -1);
        this._dataDirty$1 = true;
        this.dirty = true;
        return true;
    },

    loadData: function (tourDoc, filename) {
        var $this = this;

        this._table$1 = new Table();
        var blob = tourDoc.getFileBlob(filename);
        this.getStringFromGzipBlob(blob, function (data) {
            $this._table$1.loadFromString(data, false, true, true);

            // The NormalizeSizeColumnName column is only present for backward-compatibility
            // and should be removed in this version of SpreadSheetLayer, otherwise we might
            // keep adding it several times if exporting to XML again.
            if ($this._table$1.header.indexOf($this._normalizeSizeColumnName$1) > -1) {
                $this._table$1.removeColumn($this._normalizeSizeColumnName$1);
            }
            $this.computeDateDomainRange(-1, -1);
            if ($this.get_dynamicData() && $this.get_autoUpdate()) {
                $this.dynamicUpdate();
            }
            $this._dataDirty$1 = true;
            $this.dirty = true;
        });
    },

    addFilesToCabinet: function (fc) {
        this._fileName$1 = fc.tempDirectory + ss.format('{0}\\{1}.txt', fc.get_packageID(), this.id.toString());
        var dir = this._fileName$1.substring(0, this._fileName$1.lastIndexOf('\\'));
        var data = '';

        // See PrepareBackCompatTable for an explanation of the
        // circumstances under which table_backcompat is used.
        if (this._table_backcompat$1 == null) {
            data = this._table$1.save();
        } else {
            data = this._table_backcompat$1.save();
        }
        var blob = new Blob([data]);
        fc.addFile(this._fileName$1, blob);
        Layer.prototype.addFilesToCabinet.call(this, fc);
    },
    _prepareBackCompatTable$1: function () {
        // In this this layer class we implement dynamic normalization of the
        // points based on one of the existing numerical columns. However, we
        // need to produce XML files that are backward-compatible with older
        // versions of WWT, so the approach we take is to add a column with
        // the computed sizes for versions of WWT that can't do the dynamic
        // scaling - while in newer versions we ignore this additional column
        // and use the dynamic scaling.

        // Take a shortcut to avoid copying the table if possible
        if ((this.sizeColumn === -1 || !this.get_normalizeSize()) && (this.colorMapColumn === -1 || !this.get_dynamicColor())) {
            this._lastNormalizeSizeColumnIndex$1 = -1;
            this._lastDynamicColorColumnIndex$1 = -1;
            return;
        }
        this._table_backcompat$1 = this._table$1.clone();
        if (this.sizeColumn > -1 && this.get_normalizeSize()) {
            var normalizedPointSize = [];
            var $enum1 = ss.enumerate(this._table_backcompat$1.rows);
            while ($enum1.moveNext()) {
                var row = $enum1.current;
                normalizedPointSize.push(this.normalizePointSize(parseFloat(row[this.sizeColumn])).toString());
            }
            this._table_backcompat$1.addColumn(this._normalizeSizeColumnName$1, normalizedPointSize);
            this._lastNormalizeSizeColumnIndex$1 = this._table_backcompat$1.header.length - 1;
        } else {
            this._lastNormalizeSizeColumnIndex$1 = -1;
        }
        if (this.colorMapColumn > -1 && this.get_dynamicColor()) {
            var pointColors = [];
            var $enum2 = ss.enumerate(this._table_backcompat$1.rows);
            while ($enum2.moveNext()) {
                var row = $enum2.current;
                pointColors.push(this.get_colorMapper().findClosestColor(this.normalizeColorMapValue(parseFloat(row[this.get_colorMapColumn()]))).toSimpleHex());
            }
            this._table_backcompat$1.addColumn(this._dynamicColorColumnName$1, pointColors);
            this._lastDynamicColorColumnIndex$1 = this._table_backcompat$1.header.length - 1;
        } else {
            this._lastDynamicColorColumnIndex$1 = -1;
        }
    },

    guessHeaderAssignments: function () {
        var index = 0;
        var $enum1 = ss.enumerate(this._table$1.header);
        while ($enum1.moveNext()) {
            var headerName = $enum1.current;
            this._guessHeaderAssignment$1(headerName, index++);
        }
        if (this._table$1.header.length > 0) {
            this.nameColumn = 0;
        }
    },

    guessHeaderAssignmentsFromVoTable: function (votable) {
        var decColumn = votable.getDecColumn();
        if (decColumn != null) {
            this.latColumn = decColumn.index;
            this.astronomical = true;
        }
        var raColumn = votable.getRAColumn();
        if (raColumn != null) {
            this.lngColumn = raColumn.index;
            this.astronomical = true;
            this.pointScaleType = 4;
        }
        var magColumn = votable.getMagColumn();
        if (magColumn != null) {
            this.sizeColumn = magColumn.index;
        }
        var index = 0;
        var $enum1 = ss.enumerate(votable.column);
        while ($enum1.moveNext()) {
            var column = $enum1.current;
            this._guessHeaderAssignment$1(column.name, index++);
        }
        if (this._table$1.header.length > 0) {
            this.nameColumn = 0;
        }
    },
    _guessHeaderAssignment$1: function (name, index) {
        name = name.toLowerCase();
        if (name.indexOf('lat') > -1 && this.latColumn === -1) {
            this.latColumn = index;
        }
        if ((name.indexOf('lon') > -1 || name.indexOf('lng') > -1) && this.lngColumn === -1) {
            this.lngColumn = index;
        }
        if (name.indexOf('dec') > -1 && this.latColumn === -1) {
            this.latColumn = index;
            this.astronomical = true;
        }
        if ((name.indexOf('ra') > -1 || name.indexOf('ascen') > -1) && this.lngColumn === -1) {
            this.lngColumn = index;
            this.astronomical = true;
            this.pointScaleType = 4;
        }
        if ((name.indexOf('mag') > -1 || name.indexOf('size') > -1) && this.sizeColumn === -1) {
            this.sizeColumn = index;
        }
        if ((name.indexOf('date') > -1 || name.indexOf('time') > -1 || name.indexOf('dt') > -1 || name.indexOf('tm') > -1)) {
            if (name.indexOf('end') > -1 && this.endDateColumn === -1) {
                this.endDateColumn = index;
            }
            else if (this.startDateColumn === -1) {
                this.startDateColumn = index;
            }
        }
        if ((name.indexOf('altitude') > -1 || name.indexOf('alt') > -1) && this.altColumn === -1) {
            this.altColumn = index;
            this.set_altType(1);
            this.set_altUnit(1);
        }
        if (name.indexOf('depth') > -1 && this.altColumn === -1) {
            this.altColumn = index;
            this.set_altType(0);
            this.set_altUnit(5);
        }
        if (ss.startsWith(name, 'x') && this.get_xAxisColumn() === -1) {
            this.set_xAxisColumn(index);
        }
        if (ss.startsWith(name, 'y') && this.get_yAxisColumn() === -1) {
            this.set_yAxisColumn(index);
        }
        if (ss.startsWith(name, 'z') && this.get_zAxisColumn() === -1) {
            this.set_zAxisColumn(index);
        }
        if (name.indexOf('color') > -1 && this.get_colorMapColumn() === -1) {
            this.set_colorMapColumn(index);
        }
        if ((name.indexOf('geometry') > -1 || name.indexOf('geography') > -1) && this.geometryColumn === -1) {
            this.geometryColumn = index;
        }
    },

    computeDateDomainRange: function (columnStart, columnEnd) {
        if (columnStart === -1) {
            columnStart = this.startDateColumn;
        }
        if (columnEnd === -1) {
            columnEnd = this.endDateColumn;
        }
        if (columnEnd === -1) {
            columnEnd = columnStart;
        }
        this.set_beginRange(new Date('12/31/2100'));
        this.set_endRange(new Date('12/31/1890'));
        var $enum1 = ss.enumerate(this._table$1.rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            try {
                if (columnStart > -1) {
                    var sucsess = true;
                    var dateTimeStart = new Date('12/31/2100');
                    try {
                        dateTimeStart = new Date(row[columnStart]);
                        if (dateTimeStart < this.get_beginRange()) {
                            this.set_beginRange(dateTimeStart);
                        }
                    }
                    catch ($e2) {
                    }
                    try {
                        var dateTimeEnd = new Date('12/31/1890');
                        if (columnEnd > -1) {
                            dateTimeEnd = new Date(row[columnEnd]);
                            if (sucsess && dateTimeEnd > this.get_endRange()) {
                                this.set_endRange(dateTimeEnd);
                            }
                        }
                    }
                    catch ($e3) {
                    }
                }
            }
            catch ($e4) {
            }
        }
    },

    checkState: function () { },

    getMaxValue: function (column) {
        var max = 0;
        this._table$1.lock();
        var $enum1 = ss.enumerate(this._table$1.rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            try {
                if (column > -1) {
                    var sucsess = true;
                    try {
                        var val = parseFloat(row[column]);
                        if (sucsess && val > max) {
                            max = val;
                        }
                    }
                    catch ($e2) {
                    }
                }
            }
            catch ($e3) {
            }
        }
        this._table$1.unlock();
        return max;
    },

    getDomainValues: function (column) {
        var domainValues = [];
        this._table$1.lock();
        var $enum1 = ss.enumerate(this._table$1.rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            try {
                if (column > -1) {
                    if (!(domainValues.indexOf(row[column]) >= 0)) {
                        domainValues.push(row[column]);
                    }
                }
            }
            catch ($e2) {
            }
        }
        domainValues.sort();
        this._table$1.unlock();
        return domainValues;
    },

    get_barChartBitmask: function () {
        return this._barChartBitmask$1;
    },

    set_barChartBitmask: function (value) {
        this._barChartBitmask$1 = value;
        return value;
    },
    _isPointInFrustum$1: function (position, frustum) {
        var centerV4 = new Vector4d(position.x, position.y, position.z, 1);
        for (var i = 0; i < 6; i++) {
            if (frustum[i].dot(centerV4) < 0) {
                return false;
            }
        }
        return true;
    },

    getTableDataInView: function () {
        var data = '';
        var first = true;
        var $enum1 = ss.enumerate(this.get_header());
        while ($enum1.moveNext()) {
            var col = $enum1.current;
            if (!first) {
                data += '\t';
            }
            else {
                first = false;
            }
            data += col;
        }
        data += '\r\n';
        var $enum2 = ss.enumerate(this.get__table().rows);
        while ($enum2.moveNext()) {
            var row = $enum2.current;
            var ra = parseFloat(row[this.get_lngColumn()]);
            var dec = parseFloat(row[this.get_latColumn()]);
            var position = Coordinates.geoTo3dDouble(dec, ra);
            if (!this._isPointInFrustum$1(position, globalRenderContext.get_frustum())) {
                continue;
            }
            first = true;
            var $enum3 = ss.enumerate(row);
            while ($enum3.moveNext()) {
                var col = $enum3.current;
                if (!first) {
                    data += '\t';
                }
                else {
                    first = false;
                }
                data += col;
            }
            data += '\r\n';
        }
        return data;
    },

    prepVertexBuffer: function (renderContext, opacity) {
        this._table$1.lock();
        if (this.lineList != null) {
            this.lineList.clear();
        }
        if (this.lineList2d != null) {
            this.lineList2d.clear();
        }
        if (this.triangleList != null) {
            this.triangleList.clear();
        }
        if (this.pointList != null) {
            this.pointList.clear();
        }
        if (this.triangleList2d != null) {
            this.triangleList2d.clear();
        }
        if (this.lineList == null) {
            this.lineList = new LineList();
        }
        if (this.pointList == null) {
            this.pointList = new PointList(renderContext);
        }
        this.lineList.timeSeries = this.timeSeries;
        if (this.lineList2d == null) {
            this.lineList2d = new LineList();
            this.lineList2d.set_depthBuffered(false);
        }
        this.lineList.timeSeries = this.timeSeries;
        if (this.triangleList == null) {
            this.triangleList = new TriangleList();
        }
        if (this.triangleList2d == null) {
            this.triangleList2d = new TriangleList();
            this.triangleList2d.depthBuffered = false;
        }
        this.positions.length = 0;
        var currentIndex = 0;
        var colorLocal = this.get_color();

        // for space 3d
        var ecliptic = Coordinates.meanObliquityOfEcliptic(SpaceTimeController.get_jNow()) / 180 * Math.PI;
        var selectDomain = {};
        var mr = layerManagerGetAllMaps()[this.get_referenceFrame()].frame.meanRadius;
        if (!!mr) {
            this._meanRadius$1 = mr;
        }
        var position = new Vector3d();
        var pointSize = 0.0002;
        var pointColor = Colors.get_white();
        var pointStartTime = 0;
        var pointEndTime = 0;
        var $enum1 = ss.enumerate(this._table$1.rows);
        while ($enum1.moveNext()) {
            var row = $enum1.current;
            try {
                if (this.geometryColumn > -1 || (!this.get_coordinatesType() && (this.lngColumn > -1 && this.latColumn > -1)) || ((this.get_coordinatesType() === 1) && (this.get_xAxisColumn() > -1 && this.get_yAxisColumn() > -1))) {
                    var Xcoord = 0;
                    var Ycoord = 0;
                    var Zcoord = 0;
                    var alt = 1;
                    var altitude = 0;
                    var distParces = 0;
                    var factor = this.getScaleFactor(this.get_altUnit(), 1);
                    if (this.altColumn === -1 || this.get_altType() === 3 || this.bufferIsFlat) {
                        alt = 1;
                        if ((this.astronomical & !this.bufferIsFlat) === 1) {
                            alt = 63239.6717 * 100;
                        }
                    }
                    else {
                        if (!this.get_altType()) {
                            factor = -factor;
                        }
                        alt = 0;
                        try {
                            alt = parseFloat(row[this.altColumn]);
                        }
                        catch ($e2) {
                        }
                        if (this.astronomical) {
                            factor = factor / (1000 * 149598000);
                            distParces = (alt * factor) / 206264.806;
                            altitude = (factor * alt);
                            alt = (factor * alt);
                        }
                        else if (this.get_altType() === 2) {
                            altitude = (factor * alt);
                            alt = (factor * alt / this._meanRadius$1);
                        }
                        else {
                            altitude = (factor * alt);
                            alt = 1 + (factor * alt / this._meanRadius$1);
                        }
                    }
                    if (!this.get_coordinatesType() && this.lngColumn > -1 && this.latColumn > -1) {
                        Xcoord = parseFloat(row[this.lngColumn]);
                        Ycoord = parseFloat(row[this.latColumn]);
                        if (this.astronomical) {
                            if (!this.get_raUnits()) {
                                Xcoord *= 15;
                            }
                            if (this.bufferIsFlat) {
                            }
                        }
                        else {
                            Xcoord += 180;
                        }
                        var pos = Coordinates.geoTo3dRad(Ycoord, Xcoord, alt);
                        if (this.astronomical && !this.bufferIsFlat) {
                            pos.rotateX(ecliptic);
                        }
                        position = pos;
                        this.positions.push(position);
                    }
                    else if (this.get_coordinatesType() === 1) {
                        var xyzScale = this.getScaleFactor(this.get_cartesianScale(), this.get_cartesianCustomScale());
                        if (this.astronomical) {
                            xyzScale /= (1000 * 149598000);
                        }
                        else {
                            xyzScale /= this._meanRadius$1;
                        }
                        if (this.get_zAxisColumn() > -1) {
                            Zcoord = parseFloat(row[this.get_zAxisColumn()]);
                        }
                        Xcoord = parseFloat(row[this.get_xAxisColumn()]);
                        Ycoord = parseFloat(row[this.get_yAxisColumn()]);
                        if (this.get_xAxisReverse()) {
                            Xcoord = -Xcoord;
                        }
                        if (this.get_yAxisReverse()) {
                            Ycoord = -Ycoord;
                        }
                        if (this.get_zAxisReverse()) {
                            Zcoord = -Zcoord;
                        }
                        position = Vector3d.create((Xcoord * xyzScale), (Zcoord * xyzScale), (Ycoord * xyzScale));
                        this.positions.push(position);
                    }
                    switch (this.get_colorMap()) {
                        case 0:
                            pointColor = colorLocal;
                            break;
                        case 3:
                            if (this.get_colorMapColumn() > -1) {
                                if (this.get_dynamicColor()) {
                                    pointColor = this.get_colorMapper().findClosestColor(this.normalizeColorMapValue(parseFloat(row[this.get_colorMapColumn()])));
                                }
                                else {
                                    pointColor = this._parseColor$1(row[this.get_colorMapColumn()], colorLocal);
                                }
                            }
                            else {
                                pointColor = colorLocal;
                            }
                            break;
                        default:
                            break;
                    }
                    if (pointColor == null) {
                        pointColor = Colors.get_transparent();
                    }
                    if (this.sizeColumn > -1) {
                        switch (this.pointScaleType) {
                            case 0:
                                pointSize = parseFloat(row[this.sizeColumn]);
                                pointSize = this.normalizePointSize(pointSize);
                                break;
                            case 2:
                                pointSize = parseFloat(row[this.sizeColumn]);
                                pointSize = Math.log(pointSize);
                                break;
                            case 1:
                                try {
                                    pointSize = parseFloat(row[this.sizeColumn]);
                                    pointSize = this.normalizePointSize(pointSize);
                                    pointSize = Math.pow(2, pointSize);
                                }
                                catch ($e3) {
                                    pointSize = 0;
                                }
                                break;
                            case 4:
                                var size = 0;
                                try {
                                    size = parseFloat(row[this.sizeColumn]);
                                    if (!this.bufferIsFlat) {
                                        size = size - 5 * (Util.logN(distParces, 10) - 1);
                                        pointSize = (120000000 / Math.pow(1.6, size));
                                    }
                                    else {
                                        pointSize = (40 / Math.pow(1.6, size));
                                    }
                                }
                                catch ($e4) {
                                    pointSize = 0;
                                }
                                break;
                            case 3:
                                pointSize = 1;
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        pointSize = 0.2;
                    }
                    if (this.get_plotType() === 1) {
                        pointSize = 1;
                    }
                    if ((this.astronomical & !this.bufferIsFlat) === 1) {
                    }
                    if (this.startDateColumn > -1) {
                        var dateTime = new Date(row[this.startDateColumn]);
                        pointStartTime = (SpaceTimeController.utcToJulian(dateTime) - SpaceTimeController.utcToJulian(this.baseDate));
                        if (this.endDateColumn > -1) {
                            dateTime = new Date(row[this.endDateColumn]);
                            pointEndTime = (SpaceTimeController.utcToJulian(dateTime) - SpaceTimeController.utcToJulian(this.baseDate));
                        }
                        else {
                            pointEndTime = pointStartTime;
                        }
                    }
                    this.pointList.addPoint(position, pointColor, new Dates(pointStartTime, pointEndTime), pointSize);
                    if (this.geometryColumn > -1) {
                        this._parseGeometry$1(row[this.geometryColumn], pointColor, pointColor, altitude, new Dates(pointStartTime, pointEndTime));
                    }
                    currentIndex++;
                }
            }
            catch ($e5) {
            }
            this.lines = false;
        }
        this._table$1.unlock();
        this._dataDirty$1 = false;
        this.dirty = false;
        return false;
    },
    _parseGeometry$1: function (gs, lineColor, polyColor, alt, date) {
        gs = ss.trim(gs).toLowerCase();
        var index = gs.indexOf('(');
        if (index < 0) {
            return;
        }
        if (!ss.endsWith(gs, ')')) {
            return;
        }
        var commandPart = ss.trim(gs.substring(0, index));
        var parens = gs.substr(index);
        var parts = commandPart.split(' ');
        var command = null;
        var mods = null;
        if (parts.length > 0) {
            var $enum1 = ss.enumerate(parts);
            while ($enum1.moveNext()) {
                var item = $enum1.current;
                if (ss.emptyString(command)) {
                    command = item;
                }
                else if (ss.emptyString(mods)) {
                    mods = item;
                }
            }
        }
        switch (command) {
            case 'multipolygon':
            case 'polygon':
                this._parsePolygon$1(parens, mods, lineColor, polyColor, alt, date);
                break;
            case 'multilinestring':
                this._parseLineString$1(parens, mods, lineColor, alt, false, date);
                break;
            case 'linestring':
                this._parseLineString$1(parens, mods, lineColor, alt, true, date);
                break;
            case 'geometrycollection':
                parens = parens.substring(1, parens.length - 2);
                var shapes = UiTools.splitString(parens, ',');
                var $enum2 = ss.enumerate(shapes);
                while ($enum2.moveNext()) {
                    var shape = $enum2.current;
                    this._parseGeometry$1(shape, lineColor, polyColor, alt, date);
                }
                break;
            default:
                break;
        }
    },
    _parsePolygon$1: function (parens, mods, lineColor, polyColor, alt, date) {
        if (!ss.startsWith(parens, '(') && ss.endsWith(parens, ')')) {
            return;
        }

        // string the top level of parens
        parens = parens.substring(1, parens.length - 2);
        var shapes = UiTools.splitString(parens, ',');
        var $enum1 = ss.enumerate(shapes);
        while ($enum1.moveNext()) {
            var shape = $enum1.current;
            var lineList = new KmlLineList();
            lineList.astronomical = this.astronomical;
            lineList.meanRadius = this._meanRadius$1;
            lineList.parseWkt(shape, mods, alt, date);
            if (!alt) {
                this._addPolygonFlat$1(false, lineList, 1, polyColor, lineColor, true, true, date);
            }
            else {
                this._addPolygon$1(false, lineList, 1, polyColor, lineColor, true, true, date);
            }
        }
    },
    _parseLineString$1: function (parens, mods, lineColor, alt, single, date) {
        if (!ss.startsWith(parens, '(') && ss.endsWith(parens, ')')) {
            return;
        }
        if (!single) {
            // string the top level of parens
            parens = parens.substring(1, parens.length - 2);
        }
        var shapes = UiTools.splitString(parens, ',');
        var $enum1 = ss.enumerate(shapes);
        while ($enum1.moveNext()) {
            var shape = $enum1.current;
            var lineList = new KmlLineList();
            lineList.astronomical = this.astronomical;
            lineList.meanRadius = this._meanRadius$1;
            lineList.parseWkt(shape, mods, alt, date);
            this._addPolygon$1(false, lineList, 1, Colors.get_white(), lineColor, false, false, date);
        }
    },
    _splitShapes$1: function (shapes) {
        var shapeList = [];
        var nesting = 0;
        var current = 0;
        while (current < shapes.length) {
            if (shapes.substr(current, 1) === '(') {
                nesting++;
            }
        }
        return shapeList;
    },
    _addPolygon$1: function (sky, geo, lineWidth, polyColor, lineColor, extrude, fill, date) {
        //todo can we save this work for later?
        var vertexList = [];
        var vertexListGround = [];
        for (var i = 0; i < geo.pointList.length; i++) {
            vertexList.push(Coordinates.geoTo3dRad(geo.pointList[i].lat, geo.pointList[i].lng, 1 + (geo.pointList[i].alt / this._meanRadius$1)));
            vertexListGround.push(Coordinates.geoTo3dRad(geo.pointList[i].lat, geo.pointList[i].lng, 1));
        }
        for (var i = 0; i < (geo.pointList.length - 1); i++) {
            if (sky) {
                // todo reenable this
            }
            else {
                if (extrude) {
                    this.triangleList.addQuad(vertexList[i], vertexList[i + 1], vertexListGround[i], vertexListGround[i + 1], polyColor, date);
                }
                if (lineWidth > 0) {
                    if (extrude) {
                        this.lineList.addLine(vertexList[i], vertexList[i + 1], lineColor, date);
                    }
                    else {
                        this.lineList2d.addLine(vertexList[i], vertexList[i + 1], lineColor, date);
                    }
                    if (extrude) {
                        this.lineList.addLine(vertexListGround[i], vertexListGround[i + 1], lineColor, date);
                        this.lineList.addLine(vertexList[i], vertexListGround[i], lineColor, date);
                        this.lineList.addLine(vertexList[i + 1], vertexListGround[i + 1], lineColor, date);
                    }
                }
            }
        }
        if (fill) {
            var indexes = Tessellator.tesselateSimplePoly(vertexList);
            for (var i = 0; i < indexes.length; i += 3) {
                this.triangleList.addTriangle(vertexList[indexes[i]], vertexList[indexes[i + 1]], vertexList[indexes[i + 2]], polyColor, date);
            }
        }
    },
    _addPolygonFlat$1: function (sky, geo, lineWidth, polyColor, lineColor, extrude, fill, date) {
        var vertexList = [];
        for (var i = 0; i < geo.pointList.length; i++) {
            vertexList.push(Coordinates.geoTo3dRad(geo.pointList[i].lat, geo.pointList[i].lng, 1 + (geo.pointList[i].alt / this._meanRadius$1)));
        }
        for (var i = 0; i < (geo.pointList.length - 1); i++) {
            if (sky) {
            }
            else {
                if (lineWidth > 0) {
                    this.lineList2d.addLine(vertexList[i], vertexList[i + 1], lineColor, date);
                }
            }
        }
        if (fill) {
            var indexes = Tessellator.tesselateSimplePoly(vertexList);
            for (var i = 0; i < indexes.length; i += 3) {
                this.triangleList2d.addSubdividedTriangles(vertexList[indexes[i]], vertexList[indexes[i + 1]], vertexList[indexes[i + 2]], polyColor, date, 2);
            }
        }
    },
    _parseColor$1: function (colorText, defaultColor) {
        return Color.load(colorText);
    },

    getScaleFactor: function (AltUnit, custom) {
        var factor = 1;
        switch (AltUnit) {
            case 1:
                factor = 1;
                break;
            case 2:
                factor = 1 * 0.3048;
                break;
            case 3:
                factor = (1 / 12) * 0.3048;
                break;
            case 4:
                factor = 5280 * 0.3048;
                break;
            case 5:
                factor = 1000;
                break;
            case 6:
                factor = 1000 * 149598000;
                break;
            case 7:
                factor = 1000 * 149598000 * 63239.6717;
                break;
            case 8:
                factor = 1000 * 149598000 * 206264.806;
                break;
            case 9:
                factor = 1000 * 149598000 * 206264.806 * 1000000;
                break;
            case 10:
                factor = custom;
                break;
            default:
                break;
        }
        return factor;
    },

    get__table: function () {
        return this._table$1;
    },

    set__table: function (value) {
        this._table$1 = value;
        return value;
    },

    useHeadersFromVoTable: function (voTable) {
        var $enum1 = ss.enumerate(voTable.column);
        while ($enum1.moveNext()) {
            var column = $enum1.current;
            this.get_header().push(column.name);
        }
        this.guessHeaderAssignmentsFromVoTable(voTable);
        if (voTable.getRAColumn() != null && voTable.getRAColumn().unit.toLowerCase() === 'deg') {
            this.set_raUnits(1);
        }
    },

    loadFromString: function (data, isUpdate, purgeOld, purgeAll, hasHeader) {
        if (!isUpdate) {
            this._table$1 = new Table();
        }
        this._table$1.lock();
        this._table$1.loadFromString(data, isUpdate, purgeAll, hasHeader);
        if (!isUpdate) {
            this.guessHeaderAssignments();
            if (this.astronomical && this.lngColumn > -1) {
                var max = this.getMaxValue(this.lngColumn);
                if (max > 24) {
                    this.set_raUnits(1);
                }
            }
        }
        if (purgeOld) {
            this.purgeByTime();
        }
        this._table$1.unlock();
    },

    purgeByTime: function () {
        if (this.startDateColumn < 0) {
            return;
        }
        var columnToUse = this.startDateColumn;
        if (this.endDateColumn > -1) {
            columnToUse = this.endDateColumn;
        }
        var threasholdTime = SpaceTimeController.get_now();
        var ts = ss.truncate(this.decay) * 24 * 60 * 60 * 1000;
        threasholdTime = new Date(threasholdTime.getDate() - ts);
        var count = this._table$1.rows.length;
        for (var i = 0; i < count; i++) {
            try {
                var row = this._table$1.rows[i];
                var colDate = new Date(row[columnToUse]);
                if (colDate < threasholdTime) {
                    this._table$1.rows.splice(i, 1);
                    count--;
                    i--;
                }
            }
            catch ($e1) {
            }
        }
    },

    cleanUp: function () {
        this.cleanUpBase();
        this._table$1.lock();
        Layer.prototype.cleanUp.call(this);
        this._table$1.unlock();
        this.dirty = true;
    },

    writeLayerProperties: function (xmlWriter) {
        xmlWriter._writeAttributeString('TimeSeries', this.get_timeSeries().toString());
        xmlWriter._writeAttributeString('BeginRange', Util.xmlDate(this.get_beginRange()));
        xmlWriter._writeAttributeString('EndRange', Util.xmlDate(this.get_endRange()));
        xmlWriter._writeAttributeString('Decay', this.get_decay().toString());
        xmlWriter._writeAttributeString('CoordinatesType', Enums.toXml('CoordinatesTypes', this.get_coordinatesType()));
        xmlWriter._writeAttributeString('LatColumn', this.get_latColumn().toString());
        xmlWriter._writeAttributeString('LngColumn', this.get_lngColumn().toString());
        xmlWriter._writeAttributeString('GeometryColumn', this.get_geometryColumn().toString());
        xmlWriter._writeAttributeString('AltType', Enums.toXml('AltTypes', this.get_altType()));
        xmlWriter._writeAttributeString('MarkerMix', Enums.toXml('MarkerMixes', this.get_markerMix()));
        xmlWriter._writeAttributeString('ColorMap', Enums.toXml('ColorMaps', this.get_colorMap()));
        xmlWriter._writeAttributeString('MarkerColumn', this.get_markerColumn().toString());
        xmlWriter._writeAttributeString('PlotType', Enums.toXml('PlotTypes', this.get_plotType()));
        xmlWriter._writeAttributeString('MarkerIndex', this.get_markerIndex().toString());
        xmlWriter._writeAttributeString('MarkerScale', Enums.toXml('MarkerScales', this.get_markerScale()));
        xmlWriter._writeAttributeString('AltUnit', Enums.toXml('AltUnits', this.get_altUnit()));
        xmlWriter._writeAttributeString('AltColumn', this.get_altColumn().toString());
        xmlWriter._writeAttributeString('StartDateColumn', this.get_startDateColumn().toString());
        xmlWriter._writeAttributeString('EndDateColumn', this.get_endDateColumn().toString());

        // In this layer class we implement dynamic scaling and coloring of the points
        // based on one of the existing numerical columns. However, we need to produce
        // XML files that are backward-compatible with older versions of WWT. If
        // dynamic scaling/coloring is used, we therefore point sizeColumn and/or
        // colorMapColumn to the hard-coded sizes/colors, and then if we detect
        // normalization arguments when reading in the XML, we switch sizeColumn
        // and/or colorMapColumn to the original one.

        // Note that we need to call this here since WriteLayerProperties
        // gets called before AddFilesToCabinet.
        this._prepareBackCompatTable$1();
        if (this._lastNormalizeSizeColumnIndex$1 > -1) {
            xmlWriter._writeAttributeString('SizeColumn', this._lastNormalizeSizeColumnIndex$1);
            xmlWriter._writeAttributeString('NormalizeSizeColumn', this.sizeColumn.toString());
        } else {
            xmlWriter._writeAttributeString('SizeColumn', this.get_sizeColumn().toString());
        }
        xmlWriter._writeAttributeString('NormalizeSize', this.get_normalizeSize().toString());
        xmlWriter._writeAttributeString('NormalizeSizeClip', this.get_normalizeSizeClip().toString());
        xmlWriter._writeAttributeString('NormalizeSizeMin', this.get_normalizeSizeMin().toString());
        xmlWriter._writeAttributeString('NormalizeSizeMax', this.get_normalizeSizeMax().toString());
        if (this._lastDynamicColorColumnIndex$1 > -1) {
            xmlWriter._writeAttributeString('ColorMapColumn', this._lastDynamicColorColumnIndex$1);
            xmlWriter._writeAttributeString('DynamicColorColumn', this.get_colorMapColumn().toString());
        } else {
            xmlWriter._writeAttributeString('ColorMapColumn', this.get_colorMapColumn().toString());
        }
        xmlWriter._writeAttributeString('DynamicColor', this.get_dynamicColor().toString());
        xmlWriter._writeAttributeString('ColorMapperName', this.get_colorMapperName());
        xmlWriter._writeAttributeString('NormalizeColorMap', this.get_normalizeColorMap().toString());
        xmlWriter._writeAttributeString('NormalizeColorMapMin', this.get_normalizeColorMapMin().toString());
        xmlWriter._writeAttributeString('NormalizeColorMapMax', this.get_normalizeColorMapMax().toString());
        xmlWriter._writeAttributeString('HyperlinkFormat', this.get_hyperlinkFormat());
        xmlWriter._writeAttributeString('HyperlinkColumn', this.get_hyperlinkColumn().toString());
        xmlWriter._writeAttributeString('ScaleFactor', this.get_scaleFactor().toString());
        xmlWriter._writeAttributeString('PointScaleType', Enums.toXml('PointScaleTypes', this.get_pointScaleType()));
        xmlWriter._writeAttributeString('ShowFarSide', this.get_showFarSide().toString());
        xmlWriter._writeAttributeString('RaUnits', Enums.toXml('RAUnits', this.get_raUnits()));
        xmlWriter._writeAttributeString('HoverTextColumn', this.get_nameColumn().toString());
        xmlWriter._writeAttributeString('XAxisColumn', this.get_xAxisColumn().toString());
        xmlWriter._writeAttributeString('XAxisReverse', this.get_xAxisReverse().toString());
        xmlWriter._writeAttributeString('YAxisColumn', this.get_yAxisColumn().toString());
        xmlWriter._writeAttributeString('YAxisReverse', this.get_yAxisReverse().toString());
        xmlWriter._writeAttributeString('ZAxisColumn', this.get_zAxisColumn().toString());
        xmlWriter._writeAttributeString('ZAxisReverse', this.get_zAxisReverse().toString());
        xmlWriter._writeAttributeString('CartesianScale', Enums.toXml('AltUnits', this.get_cartesianScale()));
        xmlWriter._writeAttributeString('CartesianCustomScale', this.get_cartesianCustomScale().toString());
        xmlWriter._writeAttributeString('DynamicData', this.get_dynamicData().toString());
        xmlWriter._writeAttributeString('AutoUpdate', this.get_autoUpdate().toString());
        xmlWriter._writeAttributeString('DataSourceUrl', this.get_dataSourceUrl());
    },

    get_dynamicData: function () {
        return this._dynamicData$1;
    },

    set_dynamicData: function (value) {
        this._dynamicData$1 = value;
        return value;
    },

    get_autoUpdate: function () {
        return this._autoUpdate$1;
    },

    set_autoUpdate: function (value) {
        this._autoUpdate$1 = value;
        return value;
    },

    get_dataSourceUrl: function () {
        return this._dataSourceUrl$1;
    },

    set_dataSourceUrl: function (value) {
        this._dataSourceUrl$1 = value;
        return value;
    },

    get_timeSeries: function () {
        return this.timeSeries;
    },

    set_timeSeries: function (value) {
        if (this.timeSeries !== value) {
            this.version++;
            this.timeSeries = value;
        }
        return value;
    },

    get_beginRange: function () {
        return this._beginRange$1;
    },

    set_beginRange: function (value) {
        if (!ss.compareDates(this._beginRange$1, value)) {
            this.version++;
            this._beginRange$1 = value;
        }
        return value;
    },

    get_endRange: function () {
        return this._endRange$1;
    },

    set_endRange: function (value) {
        if (!ss.compareDates(this._endRange$1, value)) {
            this.version++;
            this._endRange$1 = value;
        }
        return value;
    },

    initializeFromXml: function (node) {
        this.set_timeSeries(ss.boolean(node.attributes.getNamedItem('TimeSeries').nodeValue));
        this.set_beginRange(new Date(node.attributes.getNamedItem('BeginRange').nodeValue));
        this.set_endRange(new Date(node.attributes.getNamedItem('EndRange').nodeValue));
        this.set_decay(parseFloat(node.attributes.getNamedItem('Decay').nodeValue));
        this.set_coordinatesType(Enums.parse('CoordinatesTypes', node.attributes.getNamedItem('CoordinatesType').nodeValue));
        if (this.get_coordinatesType() < 0) {
            this.set_coordinatesType(0);
        }
        this.set_latColumn(parseInt(node.attributes.getNamedItem('LatColumn').nodeValue));
        this.set_lngColumn(parseInt(node.attributes.getNamedItem('LngColumn').nodeValue));
        if (node.attributes.getNamedItem('GeometryColumn') != null) {
            this.set_geometryColumn(parseInt(node.attributes.getNamedItem('GeometryColumn').nodeValue));
        }
        this.set_altType(Enums.parse('AltTypes', node.attributes.getNamedItem('AltType').nodeValue));
        this.set_markerMix(0);
        this.set_colorMap(Enums.parse('ColorMaps', node.attributes.getNamedItem('ColorMap').nodeValue));
        this.set_markerColumn(parseInt(node.attributes.getNamedItem('MarkerColumn').nodeValue));
        this.set_colorMapColumn(parseInt(node.attributes.getNamedItem('ColorMapColumn').nodeValue));
        this.set_plotType(Enums.parse('PlotTypes', node.attributes.getNamedItem('PlotType').nodeValue));
        this.set_markerIndex(parseInt(node.attributes.getNamedItem('MarkerIndex').nodeValue));
        this.set_markerScale(Enums.parse('MarkerScales', node.attributes.getNamedItem('MarkerScale').nodeValue));
        this.set_altUnit(Enums.parse('AltUnits', node.attributes.getNamedItem('AltUnit').nodeValue));
        this.set_altColumn(parseInt(node.attributes.getNamedItem('AltColumn').nodeValue));
        this.set_startDateColumn(parseInt(node.attributes.getNamedItem('StartDateColumn').nodeValue));
        this.set_endDateColumn(parseInt(node.attributes.getNamedItem('EndDateColumn').nodeValue));

        // In this layer class we implement dynamic scaling and coloring of the points
        // based on one of the existing numerical columns. However, we need to produce
        // XML files that are backward-compatible with older versions of WWT. Since we
        // can deal with size/color scaling here, we ignore SizeColumn and ColorMapColumn
        // and use NormalizeSizeColumn and DynamicColorColumn instead, if present.

        if (node.attributes.getNamedItem('NormalizeSizeColumn') != null) {
            this.set_sizeColumn(parseInt(node.attributes.getNamedItem('NormalizeSizeColumn').nodeValue));
        } else {
            this.set_sizeColumn(parseInt(node.attributes.getNamedItem('SizeColumn').nodeValue));
        }

        // Only recent files have normalization parameters

        if (node.attributes.getNamedItem('NormalizeSize') != null) {
            this.set_normalizeSize(ss.boolean(node.attributes.getNamedItem('NormalizeSize').nodeValue));
            this.set_normalizeSizeClip(ss.boolean(node.attributes.getNamedItem('NormalizeSizeClip').nodeValue));
            this.set_normalizeSizeMin(parseFloat(node.attributes.getNamedItem('NormalizeSizeMin').nodeValue));
            this.set_normalizeSizeMax(parseFloat(node.attributes.getNamedItem('NormalizeSizeMax').nodeValue));
        }
        if (node.attributes.getNamedItem('DynamicColorColumn') != null) {
            this.set_colorMapColumn(parseInt(node.attributes.getNamedItem('DynamicColorColumn').nodeValue));
        } else {
            this.set_colorMapColumn(parseInt(node.attributes.getNamedItem('ColorMapColumn').nodeValue));
        }

        // Only recent files have normalization parameters

        if (node.attributes.getNamedItem('DynamicColor') != null) {
            this.set_dynamicColor(ss.boolean(node.attributes.getNamedItem('DynamicColor').nodeValue));
            this.set_colorMapperName(node.attributes.getNamedItem('ColorMapperName').nodeValue);
            this.set_normalizeColorMap(ss.boolean(node.attributes.getNamedItem('NormalizeColorMap').nodeValue));
            this.set_normalizeColorMapMin(parseFloat(node.attributes.getNamedItem('NormalizeColorMapMin').nodeValue));
            this.set_normalizeColorMapMax(parseFloat(node.attributes.getNamedItem('NormalizeColorMapMax').nodeValue));
        }
        this.set_hyperlinkFormat(node.attributes.getNamedItem('HyperlinkFormat').nodeValue);
        this.set_hyperlinkColumn(parseInt(node.attributes.getNamedItem('HyperlinkColumn').nodeValue));
        this.set_scaleFactor(parseFloat(node.attributes.getNamedItem('ScaleFactor').nodeValue));
        this.set_pointScaleType(Enums.parse('PointScaleTypes', node.attributes.getNamedItem('PointScaleType').nodeValue));
        if (node.attributes.getNamedItem('ShowFarSide') != null) {
            this.set_showFarSide(ss.boolean(node.attributes.getNamedItem('ShowFarSide').nodeValue));
        }
        if (node.attributes.getNamedItem('RaUnits') != null) {
            this.set_raUnits(Enums.parse('RAUnits', node.attributes.getNamedItem('RaUnits').nodeValue));
        }
        if (node.attributes.getNamedItem('HoverTextColumn') != null) {
            this.set_nameColumn(parseInt(node.attributes.getNamedItem('HoverTextColumn').nodeValue));
        }
        if (node.attributes.getNamedItem('XAxisColumn') != null) {
            this.set_xAxisColumn(parseInt(node.attributes.getNamedItem('XAxisColumn').nodeValue));
            this.set_xAxisReverse(ss.boolean(node.attributes.getNamedItem('XAxisReverse').nodeValue));
            this.set_yAxisColumn(parseInt(node.attributes.getNamedItem('YAxisColumn').nodeValue));
            this.set_yAxisReverse(ss.boolean(node.attributes.getNamedItem('YAxisReverse').nodeValue));
            this.set_zAxisColumn(parseInt(node.attributes.getNamedItem('ZAxisColumn').nodeValue));
            this.set_zAxisReverse(ss.boolean(node.attributes.getNamedItem('ZAxisReverse').nodeValue));
            this.set_cartesianScale(Enums.parse('AltUnits', node.attributes.getNamedItem('CartesianScale').nodeValue));
            this.set_cartesianCustomScale(parseFloat(node.attributes.getNamedItem('CartesianCustomScale').nodeValue));
        }
        if (node.attributes.getNamedItem('DynamicData') != null) {
            this.set_dynamicData(ss.boolean(node.attributes.getNamedItem('DynamicData').nodeValue));
            this.set_autoUpdate(ss.boolean(node.attributes.getNamedItem('AutoUpdate').nodeValue));
            this.set_dataSourceUrl(node.attributes.getNamedItem('DataSourceUrl').nodeValue);
        }
    },

    get_decay: function () {
        return this.decay;
    },

    set_decay: function (value) {
        if (this.decay !== value) {
            this.version++;
            this.decay = value;
        }
        return value;
    },

    get_coordinatesType: function () {
        return this._coordinatesType$1;
    },

    set_coordinatesType: function (value) {
        if (this._coordinatesType$1 !== value) {
            this.version++;
            this._coordinatesType$1 = value;
        }
        return value;
    },

    get_latColumn: function () {
        return this.latColumn;
    },

    set_latColumn: function (value) {
        if (this.latColumn !== value) {
            this.version++;
            this.latColumn = value;
        }
        return value;
    },

    get_lngColumn: function () {
        return this.lngColumn;
    },

    set_lngColumn: function (value) {
        if (this.lngColumn !== value) {
            this.version++;
            this.lngColumn = value;
        }
        return value;
    },

    get_geometryColumn: function () {
        return this.geometryColumn;
    },

    set_geometryColumn: function (value) {
        if (this.geometryColumn !== value) {
            this.version++;
            this.geometryColumn = value;
        }
        return value;
    },

    get_xAxisColumn: function () {
        return this._xAxisColumn$1;
    },

    set_xAxisColumn: function (value) {
        if (this._xAxisColumn$1 !== value) {
            this.version++;
            this._xAxisColumn$1 = value;
        }
        return value;
    },

    get_yAxisColumn: function () {
        return this._yAxisColumn$1;
    },

    set_yAxisColumn: function (value) {
        if (this._yAxisColumn$1 !== value) {
            this.version++;
            this._yAxisColumn$1 = value;
        }
        return value;
    },

    get_zAxisColumn: function () {
        return this._zAxisColumn$1;
    },

    set_zAxisColumn: function (value) {
        if (this._zAxisColumn$1 !== value) {
            this.version++;
            this._zAxisColumn$1 = value;
        }
        return value;
    },

    get_xAxisReverse: function () {
        return this._xAxisReverse$1;
    },

    set_xAxisReverse: function (value) {
        if (this._xAxisReverse$1 !== value) {
            this.version++;
            this._xAxisReverse$1 = value;
        }
        return value;
    },

    get_yAxisReverse: function () {
        return this._yAxisReverse$1;
    },

    set_yAxisReverse: function (value) {
        if (this._yAxisReverse$1 !== value) {
            this.version++;
            this._yAxisReverse$1 = value;
        }
        return value;
    },

    get_zAxisReverse: function () {
        return this._zAxisReverse$1;
    },

    set_zAxisReverse: function (value) {
        if (this._zAxisReverse$1 !== value) {
            this.version++;
            this._zAxisReverse$1 = value;
        }
        return value;
    },

    get_altType: function () {
        return this._altType$1;
    },

    set_altType: function (value) {
        if (this._altType$1 !== value) {
            this.version++;
            this._altType$1 = value;
        }
        return value;
    },

    get_markerMix: function () {
        return this._markerMix$1;
    },

    set_markerMix: function (value) {
        if (this._markerMix$1 !== value) {
            this.version++;
            this._markerMix$1 = value;
        }
        return value;
    },

    get_raUnits: function () {
        return this._raUnits$1;
    },

    set_raUnits: function (value) {
        if (this._raUnits$1 !== value) {
            this.version++;
            this._raUnits$1 = value;
        }
        return value;
    },

    get_colorMap: function () {
        return this.colorMap;
    },

    set_colorMap: function (value) {
        if (this.colorMap !== value) {
            this.version++;
            this.colorMap = value;
        }
        return value;
    },

    get_colorMapperName: function () {
        return this.colorMapperName;
    },

    set_colorMapperName: function (value) {
        if (ColorMapContainer.fromNamedColormap(value) == null) {
            throw new Error('Invalid colormap name');
        }
        this.version++;
        this.colorMapperName = value;
        return value;
    },

    get_colorMapper: function () {
        return ColorMapContainer.fromNamedColormap(this.colorMapperName);
    },

    get_dynamicColor: function () {
        return this.dynamicColor;
    },

    set_dynamicColor: function (value) {
        this.version++;
        this.dynamicColor = value;
        return value;
    },

    get_normalizeColorMap: function () {
        return this.normalizeColorMap;
    },

    set_normalizeColorMap: function (value) {
        this.version++;
        this.normalizeColorMap = value;
        return value;
    },

    get_normalizeColorMapMin: function () {
        return this.normalizeColorMapMin;
    },

    set_normalizeColorMapMin: function (value) {
        this.version++;
        this.normalizeColorMapMin = value;
        return value;
    },

    get_normalizeColorMapMax: function () {
        return this.normalizeColorMapMax;
    },

    set_normalizeColorMapMax: function (value) {
        this.version++;
        this.normalizeColorMapMax = value;
        return value;
    },

    normalizeColorMapValue: function (value) {
        if (!this.get_normalizeColorMap()) {
            return value;
        }
        var new_value = (value - this.get_normalizeColorMapMin()) / (this.get_normalizeColorMapMax() - this.get_normalizeColorMapMin());
        if (new_value < 0) {
            new_value = 0;
        } else if (new_value > 1) {
            new_value = 1;
        }
        return new_value;
    },

    get_markerColumn: function () {
        return this._markerColumn$1;
    },

    set_markerColumn: function (value) {
        if (this._markerColumn$1 !== value) {
            this.version++;
            this._markerColumn$1 = value;
        }
        return value;
    },

    get_colorMapColumn: function () {
        return this.colorMapColumn;
    },

    set_colorMapColumn: function (value) {
        if (this.colorMapColumn !== value) {
            this.version++;
            this.colorMapColumn = value;
        }
        return value;
    },

    get_plotType: function () {
        return this._plotType$1;
    },

    set_plotType: function (value) {
        if (this._plotType$1 !== value) {
            this.version++;
            this._plotType$1 = value;
        }
        return value;
    },

    get_markerIndex: function () {
        return this._markerIndex$1;
    },

    set_markerIndex: function (value) {
        if (this._markerIndex$1 !== value) {
            this.version++;
            this._markerIndex$1 = value;
        }
        return value;
    },

    get_showFarSide: function () {
        return this._showFarSide$1;
    },

    set_showFarSide: function (value) {
        if (this._showFarSide$1 !== value) {
            this.version++;
            this._showFarSide$1 = value;
        }
        return value;
    },

    get_markerScale: function () {
        return this._markerScale$1;
    },

    set_markerScale: function (value) {
        if (this._markerScale$1 !== value) {
            this.version++;
            this._markerScale$1 = value;
        }
        return value;
    },

    get_altUnit: function () {
        return this._altUnit$1;
    },

    set_altUnit: function (value) {
        if (this._altUnit$1 !== value) {
            this.version++;
            this._altUnit$1 = value;
        }
        return value;
    },

    get_cartesianScale: function () {
        return this._cartesianScale$1;
    },

    set_cartesianScale: function (value) {
        if (this._cartesianScale$1 !== value) {
            this.version++;
            this._cartesianScale$1 = value;
        }
        return value;
    },

    get_cartesianCustomScale: function () {
        return this._cartesianCustomScale$1;
    },

    set_cartesianCustomScale: function (value) {
        if (this._cartesianCustomScale$1 !== value) {
            this.version++;
            this._cartesianCustomScale$1 = value;
        }
        return value;
    },

    get_altColumn: function () {
        return this.altColumn;
    },

    set_altColumn: function (value) {
        if (this.altColumn !== value) {
            this.version++;
            this.altColumn = value;
        }
        return value;
    },

    get_startDateColumn: function () {
        return this.startDateColumn;
    },

    set_startDateColumn: function (value) {
        if (this.startDateColumn !== value) {
            this.version++;
            this.startDateColumn = value;
        }
        return value;
    },

    get_endDateColumn: function () {
        return this.endDateColumn;
    },

    set_endDateColumn: function (value) {
        if (this.endDateColumn !== value) {
            this.version++;
            this.endDateColumn = value;
        }
        return value;
    },

    get_sizeColumn: function () {
        return this.sizeColumn;
    },

    set_sizeColumn: function (value) {
        if (this.sizeColumn !== value) {
            this.version++;
            this.sizeColumn = value;
        }
        return value;
    },

    get_normalizeSize: function () {
        return this.normalizeSize;
    },

    set_normalizeSize: function (value) {
        if (this.normalizeSize !== value) {
            this.version++;
            this.normalizeSize = value;
        }
        return value;
    },

    get_normalizeSizeClip: function () {
        return this.normalizeSizeClip;
    },

    set_normalizeSizeClip: function (value) {
        if (this.normalizeSizeClip !== value) {
            this.version++;
            this.normalizeSizeClip = value;
        }
        return value;
    },

    get_normalizeSizeMin: function () {
        return this.normalizeSizeMin;
    },

    set_normalizeSizeMin: function (value) {
        if (this.normalizeSizeMin !== value) {
            this.version++;
            this.normalizeSizeMin = value;
        }
        return value;
    },

    get_normalizeSizeMax: function () {
        return this.normalizeSizeMax;
    },

    set_normalizeSizeMax: function (value) {
        if (this.normalizeSizeMax !== value) {
            this.version++;
            this.normalizeSizeMax = value;
        }
        return value;
    },

    normalizePointSize: function (value) {
        if (!this.get_normalizeSize()) {
            return value;
        }
        var new_value = (value - this.get_normalizeSizeMin()) / (this.get_normalizeSizeMax() - this.get_normalizeSizeMin());
        if (this.get_normalizeSizeClip()) {
            if (new_value < 0) {
                new_value = 0;
            }
            else if (new_value > 1) {
                new_value = 1;
            }
        }
        return new_value;
    },

    get_nameColumn: function () {
        return this.nameColumn;
    },

    set_nameColumn: function (value) {
        if (this.nameColumn !== value) {
            this.version++;
            this.nameColumn = value;
        }
        return value;
    },

    get_hyperlinkFormat: function () {
        return this._hyperlinkFormat$1;
    },

    set_hyperlinkFormat: function (value) {
        if (this._hyperlinkFormat$1 !== value) {
            this.version++;
            this._hyperlinkFormat$1 = value;
        }
        return value;
    },

    get_hyperlinkColumn: function () {
        return this._hyperlinkColumn$1;
    },

    set_hyperlinkColumn: function (value) {
        if (this._hyperlinkColumn$1 !== value) {
            this.version++;
            this._hyperlinkColumn$1 = value;
        }
        return value;
    },

    get_scaleFactor: function () {
        return this.scaleFactor;
    },

    set_scaleFactor: function (value) {
        if (this.scaleFactor !== value) {
            this.version++;
            this.scaleFactor = value;
        }
        return value;
    },

    get_pointScaleType: function () {
        return this.pointScaleType;
    },

    set_pointScaleType: function (value) {
        if (this.pointScaleType !== value) {
            this.version++;
            this.pointScaleType = value;
        }
        return value;
    },

    draw: function (renderContext, opacity, flat) {
        var device = renderContext;
        if (this.version !== this.lastVersion) {
            this.cleanUp();
        }
        this.lastVersion = this.version;
        if (this.bufferIsFlat !== flat) {
            this.cleanUp();
            this.bufferIsFlat = flat;
        }
        if (this.dirty) {
            this.prepVertexBuffer(device, opacity);
        }
        var jNow = SpaceTimeController.get_jNow() - SpaceTimeController.utcToJulian(this.baseDate);
        var adjustedScale = this.scaleFactor * 3;
        if (flat && this.astronomical && (this._markerScale$1 === 1)) {
            adjustedScale = (this.scaleFactor / (renderContext.viewCamera.zoom / 360));
        }
        if (this.triangleList2d != null) {
            this.triangleList2d.decay = this.decay;
            this.triangleList2d.sky = this.get_astronomical();
            this.triangleList2d.timeSeries = this.timeSeries;
            this.triangleList2d.jNow = jNow;
            this.triangleList2d.draw(renderContext, opacity * this.get_opacity(), 1);
        }
        if (this.triangleList != null) {
            this.triangleList.decay = this.decay;
            this.triangleList.sky = this.get_astronomical();
            this.triangleList.timeSeries = this.timeSeries;
            this.triangleList.jNow = jNow;
            this.triangleList.draw(renderContext, opacity * this.get_opacity(), 1);
        }
        if (this.pointList != null) {
            this.pointList.depthBuffered = false;
            this.pointList.showFarSide = this.get_showFarSide();
            this.pointList.decay = (this.timeSeries) ? this.decay : 0;
            this.pointList.sky = this.get_astronomical();
            this.pointList.timeSeries = this.timeSeries;
            this.pointList.jNow = jNow;
            this.pointList.scale = (this._markerScale$1 === 1) ? adjustedScale : -adjustedScale;
            switch (this._plotType$1) {
                case 0:
                    this.pointList.draw(renderContext, opacity * this.get_opacity(), false);
                    break;
                case 2:
                    this.pointList.drawTextured(renderContext, SpreadSheetLayer.get__circleTexture$1().texture2d, opacity * this.get_opacity());
                    break;
                case 1:
                    this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(19), opacity * this.get_opacity());
                    break;
                case 3:
                    this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(35), opacity * this.get_opacity());
                    break;
                case 5:
                case 4:
                    this.pointList.drawTextured(renderContext, PushPin.getPushPinTexture(this._markerIndex$1), opacity * this.get_opacity());
                    break;
                default:
                    break;
            }
        }
        if (this.lineList != null) {
            this.lineList.sky = this.get_astronomical();
            this.lineList.decay = this.decay;
            this.lineList.timeSeries = this.timeSeries;
            this.lineList.jNow = jNow;
            this.lineList.drawLines(renderContext, opacity * this.get_opacity());
        }
        if (this.lineList2d != null) {
            this.lineList2d.sky = this.get_astronomical();
            this.lineList2d.decay = this.decay;
            this.lineList2d.timeSeries = this.timeSeries;
            this.lineList2d.showFarSide = this.get_showFarSide();
            this.lineList2d.jNow = jNow;
            this.lineList2d.drawLines(renderContext, opacity * this.get_opacity());
        }
        return true;
    },

    cleanUpBase: function () {
        if (this.lineList != null) {
            this.lineList.clear();
        }
        if (this.lineList2d != null) {
            this.lineList2d.clear();
        }
        if (this.triangleList2d != null) {
            this.triangleList2d.clear();
        }
        if (this.pointList != null) {
            this.pointList.clear();
        }
        if (this.triangleList != null) {
            this.triangleList.clear();
        }
    }
};

registerType("SpreadSheetLayer", [SpreadSheetLayer, SpreadSheetLayer$, Layer]);


// wwtlib.CatalogSpreadSheetLayer

export function CatalogSpreadSheetLayer() {
    this._addedTiles$2 = {};
    SpreadSheetLayer.call(this);
}

var CatalogSpreadSheetLayer$ = {
    addTileRows: function (tileKey, catalogRows) {
        if (!ss.keyExists(this._addedTiles$2, tileKey)) {
            var $enum1 = ss.enumerate(catalogRows);
            while ($enum1.moveNext()) {
                var row = $enum1.current;
                this.get__table().rows.push(row);
            }
            this.dirty = true;
            this._addedTiles$2[tileKey] = true;
        }
    },

    removeTileRows: function (tileKey, catalogRows) {
        if (ss.keyExists(this._addedTiles$2, tileKey)) {
            var $enum1 = ss.enumerate(catalogRows);
            while ($enum1.moveNext()) {
                var row = $enum1.current;
                ss.remove(this.get__table().rows, row);
            }
            this.dirty = true;
            delete this._addedTiles$2[tileKey];
        }
    },

    cleanUp: function () {
        SpreadSheetLayer.prototype.cleanUp.call(this);
        ss.clearKeys(this._addedTiles$2);
        this.get__table().rows.length = 0;
    }
};

registerType("CatalogSpreadSheetLayer", [CatalogSpreadSheetLayer, CatalogSpreadSheetLayer$, SpreadSheetLayer]);
