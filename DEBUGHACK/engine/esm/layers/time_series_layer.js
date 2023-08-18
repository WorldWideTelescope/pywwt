// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer for rendering time-series data.
//
// This layer is essentially unimplemented in the WWT WebGL engine. See
// "spreadsheetlayer" and "votablelayer" for functionality that is actually
// available.

import { ss } from "../ss.js";
import { registerType, registerEnum, Enums } from "../typesystem.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { Layer } from "./layer.js";


// wwtlib.CoordinatesTypes

export var CoordinatesTypes = {
    spherical: 0,
    rectangular: 1,
    orbital: 2
};

registerType("CoordinatesTypes", CoordinatesTypes);
registerEnum("CoordinatesTypes", CoordinatesTypes);


// wwtlib.AltTypes

export var AltTypes = {
    depth: 0,
    altitude: 1,
    distance: 2,
    seaLevel: 3,
    terrain: 4
};

registerType("AltTypes", AltTypes);
registerEnum("AltTypes", AltTypes);


// wwtlib.MarkerMixes

export var MarkerMixes = {
    same_For_All: 0
};

registerType("MarkerMixes", MarkerMixes);
registerEnum("MarkerMixes", MarkerMixes);


// wwtlib.ColorMaps

export var ColorMaps = {
    same_For_All: 0,
    group_by_Values: 2,
    per_Column_Literal: 3
};

registerType("ColorMaps", ColorMaps);
registerEnum("ColorMaps", ColorMaps);


// wwtlib.PlotTypes

export var PlotTypes = {
    gaussian: 0,
    point: 1,
    circle: 2,
    square: 3,
    pushPin: 4,
    custom: 5
};

registerType("PlotTypes", PlotTypes);
registerEnum("PlotTypes", PlotTypes);


// wwtlib.MarkerScales

export var MarkerScales = {
    screen: 0,
    world: 1
};

registerType("MarkerScales", MarkerScales);
registerEnum("MarkerScales", MarkerScales);


// wwtlib.RAUnits

export var RAUnits = {
    hours: 0,
    degrees: 1
};

registerType("RAUnits", RAUnits);
registerEnum("RAUnits", RAUnits);


// wwtlib.TimeSeriesLayer

export function TimeSeriesLayer() {
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
    this._colorMap$1 = 3;
    this._markerColumn$1 = -1;
    this._colorMapColumn$1 = -1;
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

TimeSeriesLayer._circleTexture$1 = null;

TimeSeriesLayer.get__circleTexture$1 = function () {
    return TimeSeriesLayer._circleTexture$1;
};

var TimeSeriesLayer$ = {
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

    get_header: function () {
        return null;
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
        switch (node.attributes.getNamedItem('AltType').nodeValue) {
            case 'Depth':
                this.set_altType(0);
                break;
            case 'Altitude':
                this.set_altType(1);
                break;
            case 'Distance':
                this.set_altType(2);
                break;
            case 'SeaLevel':
                this.set_altType(3);
                break;
            case 'Terrain':
                this.set_altType(4);
                break;
            default:
                break;
        }
        this.set_markerMix(0);
        switch (node.attributes.getNamedItem('ColorMap').nodeValue) {
            case 'Same_For_All':
                this.set__colorMap(0);
                break;
            case 'Group_by_Values':
                this.set__colorMap(2);
                break;
            case 'Per_Column_Literal':
                this.set__colorMap(3);
                break;
            default:
                break;
        }
        this.set_markerColumn(parseInt(node.attributes.getNamedItem('MarkerColumn').nodeValue));
        this.set_colorMapColumn(parseInt(node.attributes.getNamedItem('ColorMapColumn').nodeValue));
        switch (node.attributes.getNamedItem('PlotType').nodeValue) {
            case 'Gaussian':
                this.set_plotType(0);
                break;
            case 'Point':
                this.set_plotType(1);
                break;
            case 'Circle':
                this.set_plotType(2);
                break;
            case 'PushPin':
                this.set_plotType(4);
                break;
            default:
                break;
        }
        this.set_markerIndex(parseInt(node.attributes.getNamedItem('MarkerIndex').nodeValue));
        switch (node.attributes.getNamedItem('MarkerScale').nodeValue) {
            case 'Screen':
                this.set_markerScale(0);
                break;
            case 'World':
                this.set_markerScale(1);
                break;
            default:
                break;
        }
        switch (node.attributes.getNamedItem('AltUnit').nodeValue) {
            case 'Meters':
                this.set_altUnit(1);
                break;
            case 'Feet':
                this.set_altUnit(2);
                break;
            case 'Inches':
                this.set_altUnit(3);
                break;
            case 'Miles':
                this.set_altUnit(4);
                break;
            case 'Kilometers':
                this.set_altUnit(5);
                break;
            case 'AstronomicalUnits':
                this.set_altUnit(6);
                break;
            case 'LightYears':
                this.set_altUnit(7);
                break;
            case 'Parsecs':
                this.set_altUnit(8);
                break;
            case 'MegaParsecs':
                this.set_altUnit(9);
                break;
            case 'Custom':
                this.set_altUnit(10);
                break;
            default:
                break;
        }
        this.set_altColumn(parseInt(node.attributes.getNamedItem('AltColumn').nodeValue));
        this.set_startDateColumn(parseInt(node.attributes.getNamedItem('StartDateColumn').nodeValue));
        this.set_endDateColumn(parseInt(node.attributes.getNamedItem('EndDateColumn').nodeValue));
        this.set_sizeColumn(parseInt(node.attributes.getNamedItem('SizeColumn').nodeValue));
        this.set_hyperlinkFormat(node.attributes.getNamedItem('HyperlinkFormat').nodeValue);
        this.set_hyperlinkColumn(parseInt(node.attributes.getNamedItem('HyperlinkColumn').nodeValue));
        this.set_scaleFactor(parseFloat(node.attributes.getNamedItem('ScaleFactor').nodeValue));
        switch (node.attributes.getNamedItem('PointScaleType').nodeValue) {
            case 'Linear':
                this.set_pointScaleType(0);
                break;
            case 'Power':
                this.set_pointScaleType(1);
                break;
            case 'Log':
                this.set_pointScaleType(2);
                break;
            case 'Constant':
                this.set_pointScaleType(3);
                break;
            case 'StellarMagnitude':
                this.set_pointScaleType(4);
                break;
            default:
                break;
        }
        if (node.attributes.getNamedItem('ShowFarSide') != null) {
            this.set_showFarSide(ss.boolean(node.attributes.getNamedItem('ShowFarSide').nodeValue));
        }
        if (node.attributes.getNamedItem('RaUnits') != null) {
            switch (node.attributes.getNamedItem('RaUnits').nodeValue) {
                case 'Hours':
                    this.set_raUnits(0);
                    break;
                case 'Degrees':
                    this.set_raUnits(1);
                    break;
            }
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
            switch (node.attributes.getNamedItem('CartesianScale').nodeValue) {
                case 'Meters':
                    this.set_cartesianScale(1);
                    break;
                case 'Feet':
                    this.set_cartesianScale(2);
                    break;
                case 'Inches':
                    this.set_cartesianScale(3);
                    break;
                case 'Miles':
                    this.set_cartesianScale(4);
                    break;
                case 'Kilometers':
                    this.set_cartesianScale(5);
                    break;
                case 'AstronomicalUnits':
                    this.set_cartesianScale(6);
                    break;
                case 'LightYears':
                    this.set_cartesianScale(7);
                    break;
                case 'Parsecs':
                    this.set_cartesianScale(8);
                    break;
                case 'MegaParsecs':
                    this.set_cartesianScale(9);
                    break;
                case 'Custom':
                    this.set_cartesianScale(10);
                    break;
                default:
                    break;
            }
            this.set_cartesianCustomScale(parseFloat(node.attributes.getNamedItem('CartesianCustomScale').nodeValue));
        }
        if (node.attributes.getNamedItem('DynamicData') != null) {
            this.set_dynamicData(ss.boolean(node.attributes.getNamedItem('DynamicData').nodeValue));
            this.set_autoUpdate(ss.boolean(node.attributes.getNamedItem('AutoUpdate').nodeValue));
            this.set_dataSourceUrl(node.attributes.getNamedItem('DataSourceUrl').nodeValue);
        }
    },

    computeDateDomainRange: function (columnStart, columnEnd) { },

    getDomainValues: function (column) {
        return [];
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

    get__colorMap: function () {
        return this._colorMap$1;
    },

    set__colorMap: function (value) {
        if (this._colorMap$1 !== value) {
            this.version++;
            this._colorMap$1 = value;
        }
        return value;
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
        return this._colorMapColumn$1;
    },

    set_colorMapColumn: function (value) {
        if (this._colorMapColumn$1 !== value) {
            this.version++;
            this._colorMapColumn$1 = value;
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

    prepVertexBuffer: function (renderContext, opacity) {
        return true;
    },

    draw: function (renderContext, opacity, flat) {
        var device = renderContext;
        if (this.version !== this.lastVersion) {
            this.cleanUp();
        }
        if (this.bufferIsFlat !== flat) {
            this.cleanUp();
            this.bufferIsFlat = flat;
        }
        if (this.dirty) {
            this.prepVertexBuffer(device, opacity);
        }
        var jNow = SpaceTimeController.get_jNow() - SpaceTimeController.utcToJulian(this.baseDate);
        var adjustedScale = this.scaleFactor;
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
            this.pointList.decay = this.decay;
            this.pointList.sky = this.get_astronomical();
            this.pointList.timeSeries = this.timeSeries;
            this.pointList.jNow = jNow;
            this.pointList.scale = (this._markerScale$1 === 1) ? adjustedScale : -adjustedScale;
            this.pointList.draw(renderContext, opacity * this.get_opacity(), false);
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

    initFromXml: function (node) {
        Layer.prototype.initFromXml.call(this, node);
    },

    cleanUp: function () {
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
    },

    dynamicUpdate: function () {
        return false;
    }
};

registerType("TimeSeriesLayer", [TimeSeriesLayer, TimeSeriesLayer$, Layer]);
