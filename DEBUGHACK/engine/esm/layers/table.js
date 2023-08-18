// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Tabular data.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Guid } from "../util.js";
import { UiTools } from "../ui_tools.js";


// wwtlib.Table

export function Table() {
    this.guid = new Guid();
    this.header = [];
    this.rows = [];
    this.delimiter = '\t';
    this.locked = false;
}

var Table$ = {
    lock: function () {
        this.locked = true;
    },

    unlock: function () {
        this.locked = false;
    },

    save: function () {
        var data = '';
        var first = true;
        var $enum1 = ss.enumerate(this.header);
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
        var $enum2 = ss.enumerate(this.rows);
        while ($enum2.moveNext()) {
            var row = $enum2.current;
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

    loadFromString: function (data, isUpdate, purge, hasHeader) {
        var count = 0;
        var lines = data.split('\r\n');
        if (!isUpdate || hasHeader) {
            if (lines.length > 0) {
                var headerLine = lines[0];
                count++;
                if (headerLine.indexOf('\t') === -1 && headerLine.indexOf(',') > -1) {
                    this.delimiter = ',';
                }
                if (!isUpdate) {
                    this.rows.length = 0;
                }
                this.header = UiTools.splitString(headerLine, this.delimiter);
            }
            else {
                this.header = [];
            }
        }
        var temp = [];
        if (!purge) {
            temp = this.rows;
        }
        while (count < lines.length) {
            var line = lines[count];
            var rowData = UiTools.splitString(line, this.delimiter);
            if (rowData.length < 1) {
                break;
            }
            temp.push(rowData);
            count++;
        }
        if (purge) {
            this.rows = temp;
        }
    },

    clone: function () {
        var cloned_table = new Table();
        for (var i = 0; i < this.header.length; i++) {
            cloned_table.header.push(this.header[i]);
        }
        for (var j = 0; j < this.rows.length; j++) {
            cloned_table.rows.push([]);
            for (var i = 0; i < this.rows[j].length; i++) {
                cloned_table.rows[j].push(this.rows[j][i]);
            }
        }
        return cloned_table;
    },

    addColumn: function (name, data) {
        this.header.push(name);
        for (var i = 0; i < data.length; i++) {
            this.rows[i].push(data[i]);
        }
    },

    removeColumn: function (name) {
        var remove_index = this.header.indexOf(name);
        if (remove_index > -1) {
            this.header.splice(remove_index, 1);
            for (var i = 0; i < this.rows.length; i++) {
                this.rows[i].splice(remove_index, 1);
            }
        }
    }
};

registerType("Table", [Table, Table$, null]);
