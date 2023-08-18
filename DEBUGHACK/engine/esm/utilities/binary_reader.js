// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Reading binary data from a stream.

import { registerType } from "../typesystem.js";


// wwtlib.BinaryReader

export function BinaryReader(arraybuf) {
    this.position = 0;
    this._data = null;
    this._data = arraybuf;
}

BinaryReader.id = 1;

var BinaryReader$ = {
    get_position: function () {
        return this.position;
    },

    seek: function (pos) {
        this.position = pos;
    },

    seekRelative: function (pos) {
        this.position += pos;
    },

    get_length: function () {
        return this._data.length;
    },

    get_endOfStream: function () {
        return this.position >= this.get_length();
    },

    readByte: function () {
        var result;
        result = this._data[this.position];
        this.position += 1;
        return result;
    },

    readSByte: function () {
        var result;
        result = this._data[this.position];
        this.position += 1;
        return result;
    },

    readBytes: function (count) {
        var buf = new Array(count);
        for (var i = 0; i < count; i++) {
            buf[i] = this._data[this.position + i];
        }
        this.position += count;
        return buf;
    },

    readRemainingI16: function (i16Remaining) {
        var data = new Float32Array(i16Remaining);
        for (var i = 0; i < i16Remaining; i++) {
            data[i] = this.readInt16(true);
        }
        return data;
    },

    readByteString: function (count) {
        var data = '';
        for (var i = 0; i < count; i++) {
            data += String.fromCharCode(this._data[this.position + i]);
        }
        this.position += count;
        return data;
    },

    readSingle: function () {
        var tmp = new Uint8Array(4);
        tmp[0] = this._data[this.position];
        tmp[1] = this._data[this.position + 1];
        tmp[2] = this._data[this.position + 2];
        tmp[3] = this._data[this.position + 3];
        var result = new Float32Array(tmp.buffer, 0, 1)[0];
        this.position += 4;
        return result;
    },

    readUInt32: function () {
        var result = (this._data[this.position] + (this._data[this.position + 1] << 8) + (this._data[this.position + 2] << 16) + (this._data[this.position + 3] << 24));
        this.position += 4;
        return result;
    },

    readUInt16: function () {
        var result = (this._data[this.position] + (this._data[this.position + 1] << 8));
        this.position += 2;
        return result;
    },

    readUInt16LittleEndian: function () {
        var result = ((this._data[this.position] << 8) + this._data[this.position + 1]);
        this.position += 2;
        return result;
    },

    readInt16: function (littleEndian) {
        var result = (littleEndian) ? this.readUInt16LittleEndian() : this.readUInt16();
        if (!!(result & 0x8000)) {
            return (-((result - 1) ^ 0xFFFF));
        }
        return result;
    },

    readInt32: function () {
        var result = this.readUInt32();
        if (!!(result & 0x80000000)) {
            return (-((result - 1) ^ 0xFFFFFFFF));
        }
        return result;
    },

    readInt64: function () {
        this.position += 8;
        return BinaryReader.id++;
    },

    close: function () { }
};

registerType("BinaryReader", [BinaryReader, BinaryReader$, null]);
