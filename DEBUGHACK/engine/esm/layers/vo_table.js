// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The Virtual Observatory table (VOTable) format.

import { ss } from "../ss.js";
import { registerType, registerEnum } from "../typesystem.js";
import { Util } from "../baseutil.js";
import { URLHelpers } from "../url_helpers.js";
import { WebFile } from "../web_file.js";


// wwtlib.Primitives

export var Primitives = {
    voBoolean: 1,
    voBit: 2,
    voUnsignedByte: 3,
    voShort: 4,
    voInt: 5,
    voLong: 6,
    voChar: 7,
    voUnicodeChar: 8,
    voFloat: 9,
    voDouble: 10,
    voFloatComplex: 11,
    voDoubleComplex: 12,
    voUndefined: 13
};

registerType("Primitives", Primitives);
registerEnum("Primitives", Primitives);


// wwtlib.VoTable

export function VoTable() {
    this.columns = {};
    this.column = [];
    this.rows = [];
    this.loadFilename = '';
    this.sampId = '';
    this.selectedRow = null;
    this.error = false;
    this.errorText = '';
}

VoTable.loadFromUrl = function (url, complete) {
    var temp = new VoTable();
    temp._onComplete = complete;
    temp._webFile = new WebFile(URLHelpers.singleton.rewrite(url, 1));
    temp._webFile.onStateChange = ss.bind('_loadData', temp);
    temp._webFile.send();
    return temp;
};

VoTable.loadFromString = function (data) {
    var xParser = new DOMParser();
    var doc = xParser.parseFromString(data, 'text/xml');
    var table = new VoTable();
    table.loadFromXML(doc);
    return table;
};

var VoTable$ = {
    _loadData: function () {
        if (this._webFile.get_state() === 2) {
            alert(this._webFile.get_message());
        } else if (this._webFile.get_state() === 1) {
            this.loadFromXML(this._webFile.getXml());
            if (this._onComplete != null) {
                this._onComplete();
            }
        }
    },

    loadFromXML: function (xml) {
        var voTable = Util.selectSingleNode(xml, 'VOTABLE');
        if (voTable == null) {
            return;
        }
        var index = 0;
        try {
            var table = Util.selectSingleNode(Util.selectSingleNode(voTable, 'RESOURCE'), 'TABLE');
            if (table != null) {
                var $enum1 = ss.enumerate(table.childNodes);
                while ($enum1.moveNext()) {
                    var node = $enum1.current;
                    if (node.nodeName === 'FIELD') {
                        var col = new VoColumn(node, index++);
                        this.columns[col.name] = col;
                        this.column.push(col);
                    }
                }
            }
        }
        catch ($e2) {
            this.error = true;
            this.errorText = Util.selectSingleNode(voTable, 'DESCRIPTION').text;
        }
        try {
            var tableData = Util.selectSingleNode(Util.selectSingleNode(Util.selectSingleNode(Util.selectSingleNode(voTable, 'RESOURCE'), 'TABLE'), 'DATA'), 'TABLEDATA');
            if (tableData != null) {
                var $enum3 = ss.enumerate(tableData.childNodes);
                while ($enum3.moveNext()) {
                    var node = $enum3.current;
                    if (node.nodeName === 'TR') {
                        var row = new VoRow(this);
                        row.columnData = new Array(ss.keyCount(this.columns));
                        index = 0;
                        var $enum4 = ss.enumerate(node.childNodes);
                        while ($enum4.moveNext()) {
                            var child = $enum4.current;
                            if (child.nodeName === 'TD') {
                                row.columnData[index++] = ss.trim(Util.getInnerText(child));
                            }
                        }
                        this.rows.push(row);
                    }
                }
            }
        }
        catch ($e5) {
        }
    },

    save: function (filename) {
        return true;
    },

    getColumnByUcd: function (ucd) {
        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (ss.replaceString(col.ucd, '_', '.').toLocaleLowerCase().indexOf(ucd.toLocaleLowerCase()) > -1) {
                return col;
            }
        }
        return null;
    },

    getRAColumn: function () {
        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (col.ucd.toLocaleLowerCase().indexOf('pos.eq.ra') > -1 || col.ucd.toLocaleLowerCase().indexOf('pos_eq_ra') > -1) {
                return col;
            }
        }
        var $enum2 = ss.enumerate(ss.keys(this.columns));
        while ($enum2.moveNext()) {
            var key = $enum2.current;
            var col = this.columns[key];
            if (col.name.toLocaleLowerCase().indexOf('ra') > -1) {
                return col;
            }
        }
        return null;
    },

    getDecColumn: function () {
        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (col.ucd.toLowerCase().indexOf('pos.eq.dec') > -1 || col.ucd.toLowerCase().indexOf('pos_eq_dec') > -1) {
                return col;
            }
        }
        var $enum2 = ss.enumerate(ss.keys(this.columns));
        while ($enum2.moveNext()) {
            var key = $enum2.current;
            var col = this.columns[key];
            if (col.name.toLowerCase().indexOf('dec') > -1) {
                return col;
            }
        }
        return null;
    },

    getMagColumn: function () {
        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (col.ucd.toLowerCase().indexOf('phot.mag') > -1 || col.ucd.toLowerCase().indexOf('phot_mag') > -1) {
                return col;
            }
        }
        return null;
    },

    getDistanceColumn: function () {
        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (col.ucd.toLowerCase().indexOf('pos.distance') > -1 || col.ucd.toLowerCase().indexOf('pos_distance') > -1) {
                return col;
            }
        }
        return null;
    },

    toString: function () {
        var sb = new ss.StringBuilder();
        var first = true;

        // Copy header

        var $enum1 = ss.enumerate(ss.keys(this.columns));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var col = this.columns[key];
            if (first) {
                first = false;
            }
            else {
                sb.append('\t');
            }
            sb.append(col.name);
        }
        sb.appendLine('');

        // copy rows

        var $enum2 = ss.enumerate(this.rows);
        while ($enum2.moveNext()) {
            var row = $enum2.current;
            first = true;
            var $enum3 = ss.enumerate(row.columnData);
            while ($enum3.moveNext()) {
                var col = $enum3.current;
                if (first) {
                    first = false;
                }
                else {
                    sb.append('\t');
                }
                sb.append(col.toString());
            }
            sb.appendLine('');
        }
        return sb.toString();
    }
};

registerType("VoTable", [VoTable, VoTable$, null]);


// wwtlib.VoRow

export function VoRow(owner) {
    this.selected = false;
    this.owner = owner;
}

var VoRow$ = {
    getColumnData: function (key) {
        if (this.owner.columns[key] != null) {
            return this.columnData[this.owner.columns[key].index];
        }
        return null;
    },

    get_item: function (index) {
        if (index < 0 || index >= this.columnData.length) {
            return null;
        }
        return this.columnData[index];
    }
};

registerType("VoRow", [VoRow, VoRow$, null]);


// wwtlib.VoColumn

export function VoColumn(node, index) {
    this.id = '';
    this.type = 0;
    this.precision = 0;
    this.dimentions = 0;
    this.sizes = null;
    this.ucd = '';
    this.unit = '';
    this.name = '';
    this.index = 0;
    this.index = index;
    if (node.attributes.getNamedItem('datatype') != null) {
        this.type = VoColumn.getType(node.attributes.getNamedItem('datatype').nodeValue);
    }
    if (node.attributes.getNamedItem('ucd') != null) {
        this.ucd = node.attributes.getNamedItem('ucd').nodeValue;
    }
    if (node.attributes.getNamedItem('precision') != null) {
        try {
            this.precision = parseInt(node.attributes.getNamedItem('precision').nodeValue);
        }
        catch ($e1) {
        }
    }
    if (node.attributes.getNamedItem('ID') != null) {
        this.id = node.attributes.getNamedItem('ID').nodeValue;
    }
    if (node.attributes.getNamedItem('name') != null) {
        this.name = node.attributes.getNamedItem('name').nodeValue;
    }
    else {
        this.name = this.id;
    }
    if (node.attributes.getNamedItem('unit') != null) {
        this.unit = node.attributes.getNamedItem('unit').nodeValue;
    }
    if (node.attributes.getNamedItem('arraysize') != null) {
        var split = node.attributes.getNamedItem('arraysize').nodeValue.split('x');
        this.dimentions = split.length;
        this.sizes = new Array(split.length);
        var indexer = 0;
        var $enum2 = ss.enumerate(split);
        while ($enum2.moveNext()) {
            var dim = $enum2.current;
            if (!(dim.indexOf('*') > -1)) {
                this.sizes[indexer++] = parseInt(dim);
            }
            else {
                var len = 9999;
                var lenString = ss.replaceString(dim, '*', '');
                if (lenString.length > 0) {
                    len = parseInt(lenString);
                }
                this.sizes[indexer++] = len;
            }
        }
    }
}

VoColumn.getType = function (type) {
    var Type = 13;
    switch (type) {
        case 'boolean':
            Type = 1;
            break;
        case 'bit':
            Type = 2;
            break;
        case 'unsignedByte':
            Type = 3;
            break;
        case 'short':
            Type = 4;
            break;
        case 'int':
            Type = 5;
            break;
        case 'long':
            Type = 6;
            break;
        case 'char':
            Type = 7;
            break;
        case 'unicodeChar':
            Type = 8;
            break;
        case 'float':
            Type = 9;
            break;
        case 'double':
            Type = 10;
            break;
        case 'floatComplex':
            Type = 11;
            break;
        case 'doubleComplex':
            Type = 12;
            break;
        default:
            Type = 13;
            break;
    }
    return Type;
};

var VoColumn$ = {
    toString: function () {
        return this.name;
    }
};

registerType("VoColumn", [VoColumn, VoColumn$, null]);

