// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Constellations in the sky.

import { ss } from "./ss.js";
import { registerType, registerEnum } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { createPlace, makeNewFolder } from "./data_globals.js";
import { SimpleLineList } from "./graphics/primitives3d.js";
import { BlendState } from "./blend_state.js";
import { Color } from "./color.js";
import { ConstellationFilter } from "./constellation_filter.js";
import { Coordinates } from "./coordinates.js";
import { Settings } from "./settings.js";
import { Text3d, Text3dBatch } from "./sky_text.js";
import { URLHelpers } from "./url_helpers.js";
import { WebFile } from "./web_file.js";


// wwtlib.PointType

export var PointType = {
    move: 0,
    line: 1,
    dash: 2,
    start: 3
};

registerType("PointType", PointType);
registerEnum("PointType", PointType);


// wwtlib.Lineset

export function Lineset(name) {
    this._name = name;
    this.points = [];
}

var Lineset$ = {
    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        this._name = value;
        return value;
    },

    add: function (ra, dec, pointType, name) {
        this.points.push(new Linepoint(ra, dec, pointType, name));
    }
};

registerType("Lineset", [Lineset, Lineset$, null]);


// wwtlib.Linepoint

export function Linepoint(ra, dec, type, name) {
    this.RA = 0;
    this.dec = 0;
    this.pointType = 0;
    this.name = null;
    this.RA = ra;
    this.dec = dec;
    this.pointType = type;
    this.name = name;
}

var Linepoint$ = {
    toString: function () {
        if (ss.emptyString(this.name)) {
            return Coordinates.formatDMS((((this.RA / 360) * 24 + 12) % 24)) + ', ' + Coordinates.formatDMS(this.dec) + ', ' + this.pointType.toString();
        } else {
            return this.name + ', ' + this.pointType.toString();
        }
    }
};

registerType("Linepoint", [Linepoint, Linepoint$, null]);


// wwtlib.Constellations

export function Constellations() {
    this._pointCount = 0;
    this._boundry = false;
    this._noInterpollation = false;
    this.readOnly = false;
    this.radius = 1;
    this._drawCount = 0;
    this._constellationVertexBuffers = {};
}

Constellations.RC = 0.017453292519943;
Constellations._maxSeperation = 0.745;
Constellations.containment = null;  // initialized in InitializeConstellations
Constellations._constToDraw = '';
Constellations.selectedSegment = null;
Constellations._artFile = null;
Constellations.artwork = null;
Constellations.boundries = null;
Constellations.pictureBlendStates = {};

Constellations.createBasic = function (name) {
    var temp = new Constellations();
    temp._name = name;
    temp._url = null;
    temp.lines = [];
    var $enum1 = ss.enumerate(ss.keys(Constellations.fullNames));
    while ($enum1.moveNext()) {
        var abbrv = $enum1.current;
        temp.lines.push(new Lineset(abbrv));
    }
    return temp;
};

Constellations.create = function (name, url, boundry, noInterpollation, resource) {
    var temp = new Constellations();
    temp._noInterpollation = noInterpollation;
    temp._boundry = boundry;
    temp._name = name;
    temp._url = url;
    temp.getFile();
    return temp;
};

Constellations.drawConstellationNames = function (renderContext, opacity, drawColor) {
    if (Constellations._namesBatch == null) {
        Constellations.initializeConstellationNames();
        if (Constellations._namesBatch == null) {
            return;
        }
    }
    Constellations._namesBatch.draw(renderContext, opacity, drawColor);
};

Constellations.initializeConstellationNames = function () {
    if (Constellations.constellationCentroids == null) {
        return;
    }
    Constellations._namesBatch = new Text3dBatch(Settings.get_active().get_constellationLabelsHeight());
    var $enum1 = ss.enumerate(ss.keys(Constellations.constellationCentroids));
    while ($enum1.moveNext()) {
        var key = $enum1.current;
        var centroid = Constellations.constellationCentroids[key];
        var center = Coordinates.raDecTo3dAu(centroid.get_RA(), centroid.get_dec(), 1);
        var up = Vector3d.create(0, 1, 0);
        var name = centroid.get_name();
        if (centroid.get_name() === 'Triangulum Australe') {
            name = ss.replaceString(name, ' ', '\n   ');
        }
        Constellations._namesBatch.add(new Text3d(center, up, name, Settings.get_active().get_constellationLabelsHeight(), 0.000125));
    }
};

// The WWTControl driver will not (and should not) call this function in
// "freestanding mode", because the functionality depends on a
// worldwidetelescope.org API.
Constellations.drawArtwork = function (renderContext) {
    if (Constellations.artwork == null) {
        if (Constellations._artFile == null) {
            Constellations._artFile = makeNewFolder();
            Constellations._artFile.loadFromUrl(URLHelpers.singleton.coreStaticUrl('wwtweb/catalog.aspx?W=hevelius'), Constellations._onArtReady);
        }
        return;
    }
    Constellations._maxSeperation = Math.max(0.5, Math.cos((renderContext.get_fovAngle() * 2) / 180 * Math.PI));
    var $enum1 = ss.enumerate(Constellations.artwork);
    while ($enum1.moveNext()) {
        var place = $enum1.current;
        var bs = Constellations.pictureBlendStates[place.get_constellation()];
        bs.set_targetState(Settings.get_active().get_constellationArtFilter().isSet(place.get_constellation()));
        if (bs.get_state()) {
            var reverse = false;
            var centroid = Constellations.constellationCentroids[place.get_constellation()];
            if (centroid != null) {
                var pos = Coordinates.raDecTo3d((reverse) ? -centroid.get_RA() - 6 : centroid.get_RA(), (reverse) ? centroid.get_dec() : centroid.get_dec());
                if (Vector3d.dot(renderContext.get_viewPoint(), pos) > Constellations._maxSeperation) {
                    renderContext.drawImageSet(place.get_studyImageset(), 100);
                }
            }
        }
    }
};

Constellations._onArtReady = function () {
    Constellations._artFile.childLoadCallback(Constellations._loadArtList);
};

Constellations._loadArtList = function () {
    Constellations.artwork = Constellations._artFile.get_places();
};

// Repeated invocations of this function are OK.
Constellations.initializeConstellations = function () {
    if (Constellations.containment == null) {
        var url = URLHelpers.singleton.engineAssetUrl('ConstellationNamePositions_EN.txt');
        Constellations._webFileConstNames = new WebFile(url);
        Constellations._webFileConstNames.onStateChange = Constellations._loadNames;
        Constellations._webFileConstNames.send();
        Constellations.containment = Constellations.create(
            'Constellations',
            URLHelpers.singleton.engineAssetUrl('constellations.txt'),
            true, // "boundry"
            true, // "noInterpollation"
            true, // "resource"
        );
    }
};

Constellations._loadNames = function () {
    if (Constellations._webFileConstNames.get_state() === 2) {
        alert(Constellations._webFileConstNames.get_message());
    }
    else if (Constellations._webFileConstNames.get_state() === 1) {
        Constellations._centroidsReady(Constellations._webFileConstNames.getText());
    }
};

Constellations._centroidsReady = function (file) {
    Constellations.constellationCentroids = {};
    Constellations.fullNames = {};
    Constellations.abbreviations = {};
    var rows = file.split('\r\n');
    var id = 0;
    var line;
    var $enum1 = ss.enumerate(rows);

    while ($enum1.moveNext()) {
        var row = $enum1.current;
        line = row;
        var data = line.split(',');
        Constellations.fullNames[data[1]] = data[0];
        Constellations.abbreviations[data[0]] = data[1];
        ConstellationFilter.bitIDs[data[1]] = id++;
        Constellations.pictureBlendStates[data[1]] = BlendState.create(true, 1000);
        Constellations.constellationCentroids[data[1]] = createPlace(data[0], parseFloat(data[3]), parseFloat(data[2]), 128, data[1], 2, 360);
    }

    ConstellationFilter.buildConstellationFilters();
};

Constellations.fullName = function (name) {
    if (ss.keyExists(Constellations.fullNames, name)) {
        return Constellations.fullNames[name];
    }
    return name;
};

Constellations.abbreviation = function (name) {
    if (Constellations.abbreviations != null && !ss.emptyString(name) && ss.keyExists(Constellations.abbreviations, name)) {
        return Constellations.abbreviations[name];
    }
    return name;
};

var Constellations$ = {
    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        this._name = value;
        return value;
    },

    getFile: function () {
        this._webFile = new WebFile(this._url);
        this._webFile.onStateChange = ss.bind('fileStateChange', this);
        this._webFile.send();
    },

    fileStateChange: function () {
        if (this._webFile.get_state() === 2) {
            alert(this._webFile.get_message());
        } else if (this._webFile.get_state() === 1) {
            this._loadConstellationData(this._webFile.getText());
        }
    },

    _loadConstellationData: function (data) {
        if (this._boundry && !this._noInterpollation) {
            Constellations.boundries = {};
        }
        this.lines = [];
        var lineSet = null;
        try {
            var rows = data.split('\r\n');
            var abrv;
            var abrvOld = '';
            var ra;
            var dec;
            var lastRa = 0;
            var type = 0;
            var $enum1 = ss.enumerate(rows);
            while ($enum1.moveNext()) {
                var row = $enum1.current;
                var line = row;
                if (line.substr(11, 2) === '- ') {
                    line = line.substr(0, 11) + ' -' + line.substr(13, (line.length - 13));
                }
                if (line.substr(11, 2) === '+ ') {
                    line = line.substr(0, 11) + ' +' + line.substr(13, (line.length - 13));
                }
                dec = parseFloat(line.substr(11, 10));
                if (this._noInterpollation) {
                    ra = parseFloat(line.substr(0, 10));
                }
                else {
                    ra = parseFloat(line.substr(0, 10));
                }
                abrv = ss.trim(line.substr(23, 4));
                if (!this._boundry) {
                    if (!!ss.trim(line.substr(28, 1))) {
                        type = parseInt(line.substr(28, 1));
                    }
                }
                else {
                    if (this._noInterpollation && line.substr(28, 1) !== 'O') {
                        continue;
                    }
                }
                if (abrv !== abrvOld) {
                    type = 3;
                    lineSet = new Lineset(abrv);
                    this.lines.push(lineSet);
                    if (this._boundry && !this._noInterpollation) {
                        Constellations.boundries[abrv] = lineSet;
                    }
                    abrvOld = abrv;
                    lastRa = 0;
                }
                if (this._noInterpollation) {
                    if (Math.abs(ra - lastRa) > 12) {
                        ra = ra - (24 * (((ra - lastRa) < 0) ? -1 : 1));
                    }
                    lastRa = ra;
                }
                var starName = null;
                if (line.length > 30) {
                    starName = ss.trim(line.substr(30));
                }
                if (starName == null || starName !== 'Empty') {
                    lineSet.add(ra, dec, type, starName);
                }
                this._pointCount++;
                type = 1;
            }
        }
        catch ($e2) {
        }
    },

    draw: function (renderContext, showOnlySelected, focusConsteallation, clearExisting) {
        Constellations._maxSeperation = Math.max(0.6, Math.cos((renderContext.get_fovAngle() * 2) / 180 * Math.PI));
        this._drawCount = 0;
        var lsSelected = null;
        if (this.lines == null || Constellations.constellationCentroids == null) {
            return;
        }
        Constellations._constToDraw = focusConsteallation;
        var $enum1 = ss.enumerate(this.lines);
        while ($enum1.moveNext()) {
            var ls = $enum1.current;
            if (Constellations._constToDraw === ls.get_name() && this._boundry) {
                lsSelected = ls;
            }
            else if (!showOnlySelected || !this._boundry) {
                this._drawSingleConstellation(renderContext, ls, 1);
            }
        }
        if (lsSelected != null) {
            this._drawSingleConstellation(renderContext, lsSelected, 1);
        }
    },

    _drawSingleConstellation: function (renderContext, ls, opacity) {
        var reverse = false;
        var centroid = Constellations.constellationCentroids[ls.get_name()];
        if (centroid != null) {
            var pos = Coordinates.raDecTo3d((reverse) ? -centroid.get_RA() - 6 : centroid.get_RA(), (reverse) ? centroid.get_dec() : centroid.get_dec());
            if (Vector3d.dot(renderContext.get_viewPoint(), pos) < Constellations._maxSeperation) {
                return;
            }
        }
        if (!ss.keyExists(this._constellationVertexBuffers, ls.get_name())) {
            var count = ls.points.length;
            var linelist = new SimpleLineList();
            linelist.set_depthBuffered(false);
            this._constellationVertexBuffers[ls.get_name()] = linelist;
            var currentPoint = new Vector3d();
            var temp;
            for (var i = 0; i < count; i++) {
                if (!ls.points[i].pointType || !i) {
                    currentPoint = Coordinates.raDecTo3d(ls.points[i].RA, ls.points[i].dec);
                }
                else {
                    temp = Coordinates.raDecTo3d(ls.points[i].RA, ls.points[i].dec);
                    linelist.addLine(currentPoint, temp);
                    currentPoint = temp;
                }
            }
            if (this._boundry) {
                temp = Coordinates.raDecTo3d(ls.points[0].RA, ls.points[0].dec);
                linelist.addLine(currentPoint, temp);
            }
        }
        var col = 'red';
        if (this._boundry) {
            if (Constellations._constToDraw !== ls.get_name()) {
                col = Settings.get_globalSettings().get_constellationBoundryColor();
            }
            else {
                col = Settings.get_globalSettings().get_constellationSelectionColor();
            }
        } else {
            col = Settings.get_globalSettings().get_constellationFigureColor();
        }
        this._constellationVertexBuffers[ls.get_name()].drawLines(renderContext, opacity, Color.load(col));
    },

    _drawSingleConstellationOld: function (renderContext, ls) {
        var reverse = false;
        var centroid = Constellations.constellationCentroids[ls.get_name()];
        if (centroid != null) {
            var pos = Coordinates.raDecTo3d((reverse) ? -centroid.get_RA() - 6 : centroid.get_RA(), (reverse) ? centroid.get_dec() : centroid.get_dec());
            if (Vector3d.dot(renderContext.get_viewPoint(), pos) < Constellations._maxSeperation) {
                return;
            }
        }
        this._drawCount++;
        var col;
        if (this._boundry) {
            if (Constellations._constToDraw !== ls.get_name()) {
                col = Settings.get_globalSettings().get_constellationBoundryColor();
            }
            else {
                col = Settings.get_globalSettings().get_constellationSelectionColor();
            }
        } else {
            col = Settings.get_globalSettings().get_constellationFigureColor();
        }
        if (renderContext.gl == null) {
            var ctx = renderContext.device;
            var count = ls.points.length;
            var lastPoint = new Vector3d();
            ctx.save();
            var linePending = false;
            ctx.beginPath();
            ctx.strokeStyle = col;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.25;
            for (var i = 0; i < count; i++) {
                if (!ls.points[i].pointType || !i) {
                    if (linePending) {
                        ctx.stroke();
                    }
                    lastPoint = renderContext.WVP.transform(Coordinates.raDecTo3d(ls.points[i].RA, ls.points[i].dec));
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                }
                else {
                    var newPoint = renderContext.WVP.transform(Coordinates.raDecTo3d(ls.points[i].RA, ls.points[i].dec));
                    ctx.lineTo(newPoint.x, newPoint.y);
                    linePending = true;
                }
            }
            if (this._boundry) {
                ctx.closePath();
            }
            ctx.stroke();
            ctx.restore();
        } else {
            //todo add webgl method of drawing
        }
    },

    findConstellationForPoint: function (ra, dec) {
        if (dec > 88.402 || this.lines == null) {
            return 'UMI';
        }
        var $enum1 = ss.enumerate(this.lines);
        while ($enum1.moveNext()) {
            var ls = $enum1.current;
            var count = ls.points.length;
            var i;
            var j;
            var inside = false;
            for (i = 0, j = count - 1; i < count; j = i++) {
                if ((((ls.points[i].dec <= dec) && (dec < ls.points[j].dec)) || ((ls.points[j].dec <= dec) && (dec < ls.points[i].dec))) && (ra < (ls.points[j].RA - ls.points[i].RA) * (dec - ls.points[i].dec) / (ls.points[j].dec - ls.points[i].dec) + ls.points[i].RA)) {
                    inside = !inside;
                }
            }
            if (inside) {
                return ls.get_name();
            }
        }
        if (ra > 0) {
            return this.findConstellationForPoint(ra - 24, dec);
        }
        // Ursa Minor is tricky since it wraps around the poles. It can evade the point in rect test
        if (dec > 65.5) {
            return 'UMI';
        }
        if (dec < -65.5) {
            return 'OCT';
        }
        return 'Error';
    }
};

registerType("Constellations", [Constellations, Constellations$, null]);
