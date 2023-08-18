// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that renders progress along a great circle.
//
// Yes, there is an egregious typo in the name of this class. But to maintain
// API compatibility, we're not fixing it.

import { registerType } from "../typesystem.js";
import { Vector3d } from "../double3d.js";
import { Dates, TriangleList } from "../graphics/primitives3d.js";
import { Coordinates } from "../coordinates.js";
import { Layer } from "./layer.js";


// wwtlib.GreatCirlceRouteLayer

export function GreatCirlceRouteLayer() {
    this._triangleList$1 = null;
    this._latStart$1 = 0;
    this._lngStart$1 = 0;
    this._latEnd$1 = 0;
    this._lngEnd$1 = 0;
    this._width$1 = 4;
    this._percentComplete$1 = 100;
    Layer.call(this);
}

var GreatCirlceRouteLayer$ = {
    // Even if we fix the typo in this class's name in an API break, we need to
    // maintain it here to maintain compatibility with existing data files and
    // older WWT clients.
    getTypeName: function () {
        return 'TerraViewer.GreatCirlceRouteLayer';
    },

    cleanUp: function () {
        if (this._triangleList$1 != null) {
            this._triangleList$1.clear();
        }
        this._triangleList$1 = null;
        Layer.prototype.cleanUp.call(this);
    },

    draw: function (renderContext, opacity, flat) {
        if (this._triangleList$1 == null) {
            this._initializeRoute$1(renderContext);
        }
        this._triangleList$1.jNow = this._percentComplete$1 / 100;
        this._triangleList$1.draw(renderContext, opacity * this.get_opacity(), 2);
        return true;
    },
    _initializeRoute$1: function (renderContext) {
        this._triangleList$1 = new TriangleList();
        this._triangleList$1.decay = 1000;
        this._triangleList$1.sky = this.get_astronomical();
        this._triangleList$1.timeSeries = true;
        this._triangleList$1.depthBuffered = false;
        this._triangleList$1.autoTime = false;
        var steps = 500;
        var start = Coordinates.geoTo3dDouble(this._latStart$1, this._lngStart$1);
        var end = Coordinates.geoTo3dDouble(this._latEnd$1, this._lngEnd$1);
        var dir = Vector3d.subtractVectors(end, start);
        dir.normalize();
        var startNormal = start;
        startNormal.normalize();
        var left = Vector3d.cross(startNormal, dir);
        var right = Vector3d.cross(dir, startNormal);
        left.normalize();
        right.normalize();
        left.multiply(0.001 * this._width$1);
        right.multiply(0.001 * this._width$1);
        var lastLeft = new Vector3d();
        var lastRight = new Vector3d();
        var firstTime = true;
        for (var i = 0; i <= steps; i++) {
            var v = Vector3d.lerp(start, end, i / steps);
            v.normalize();
            var cl = v;
            var cr = v;
            cl.add(left);
            cr.add(right);
            if (!firstTime) {
                this._triangleList$1.addQuad(lastRight, lastLeft, cr, cl, this.get_color(), new Dates(i / steps, 2));
            }
            else {
                firstTime = false;
            }
            lastLeft = cl;
            lastRight = cr;
        }
    },

    getParams: function () {
        return [this._percentComplete$1];
    },

    getParamNames: function () {
        return ['Percentage'];
    },

    setParams: function (paramList) {
        if (paramList.length > 0) {
            this._percentComplete$1 = paramList[0];
        }
    },

    get_latStart: function () {
        return this._latStart$1;
    },

    set_latStart: function (value) {
        if (this._latStart$1 !== value) {
            this._latStart$1 = value;
            this.version++;
        }
        return value;
    },

    get_lngStart: function () {
        return this._lngStart$1;
    },

    set_lngStart: function (value) {
        if (this._lngStart$1 !== value) {
            this._lngStart$1 = value;
            this.version++;
        }
        return value;
    },

    get_latEnd: function () {
        return this._latEnd$1;
    },

    set_latEnd: function (value) {
        if (this._latEnd$1 !== value) {
            this._latEnd$1 = value;
            this.version++;
        }
        return value;
    },

    get_lngEnd: function () {
        return this._lngEnd$1;
    },

    set_lngEnd: function (value) {
        if (this._lngEnd$1 !== value) {
            this._lngEnd$1 = value;
            this.version++;
        }
        return value;
    },

    get_width: function () {
        return this._width$1;
    },

    set_width: function (value) {
        if (this._width$1 !== value) {
            this._width$1 = value;
            this.version++;
        }
        return value;
    },

    get_percentComplete: function () {
        return this._percentComplete$1;
    },

    set_percentComplete: function (value) {
        if (this._percentComplete$1 !== value) {
            this._percentComplete$1 = value;
            this.version++;
        }
        return value;
    },

    writeLayerProperties: function (xmlWriter) {
        xmlWriter._writeAttributeString('LatStart', this.get_latStart().toString());
        xmlWriter._writeAttributeString('LngStart', this.get_lngStart().toString());
        xmlWriter._writeAttributeString('LatEnd', this.get_latEnd().toString());
        xmlWriter._writeAttributeString('LngEnd', this.get_lngEnd().toString());
        xmlWriter._writeAttributeString('Width', this.get_width().toString());
        xmlWriter._writeAttributeString('PercentComplete', this.get_percentComplete().toString());
    },

    initializeFromXml: function (node) {
        this._latStart$1 = parseFloat(node.attributes.getNamedItem('LatStart').nodeValue);
        this._lngStart$1 = parseFloat(node.attributes.getNamedItem('LngStart').nodeValue);
        this._latEnd$1 = parseFloat(node.attributes.getNamedItem('LatEnd').nodeValue);
        this._lngEnd$1 = parseFloat(node.attributes.getNamedItem('LngEnd').nodeValue);
        this._width$1 = parseFloat(node.attributes.getNamedItem('Width').nodeValue);
        this._percentComplete$1 = parseFloat(node.attributes.getNamedItem('PercentComplete').nodeValue);
    }
};

registerType("GreatCirlceRouteLayer", [GreatCirlceRouteLayer, GreatCirlceRouteLayer$, Layer]);
