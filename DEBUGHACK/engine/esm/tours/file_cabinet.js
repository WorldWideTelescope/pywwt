// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A simple XML-based file archive format.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Util } from "../baseutil.js";
import { XmlTextWriter } from "../utilities/xml_text_writer.js";
import { WebFile } from "../web_file.js";


// wwtlib.FileEntry

export function FileEntry(filename, size) {
    this.size = 0;
    this.offset = 0;
    this.filename = filename;
    this.size = size;
}

var FileEntry$ = {
    toString: function () {
        return this.filename;
    }
};

registerType("FileEntry", [FileEntry, FileEntry$, null]);


// wwtlib.FileCabinet

export function FileCabinet() {
    this.tempDirectory = '';
    this._currentOffset = 0;
    this._packageID = '';
    this.url = '';
    this.clearFileList();
}

FileCabinet.fromUrl = function (url, callMe) {
    var temp = new FileCabinet();
    temp.url = url;
    temp._callMe = callMe;
    temp._webFile = new WebFile(url);
    temp._webFile.responseType = 'blob';
    temp._webFile.onStateChange = ss.bind('_loadCabinet', temp);
    temp._webFile.send();
    return temp;
};

var FileCabinet$ = {
    get_packageID: function () {
        return this._packageID;
    },

    set_packageID: function (value) {
        this._packageID = value;
        return value;
    },

    addFile: function (filename, data) {
        if (data == null) {
            return;
        }
        if (!ss.keyExists(this._fileDirectory, filename)) {
            var fe = new FileEntry(filename, data.size);
            fe.offset = this._currentOffset;
            fe.blob = data;
            this.fileList.push(fe);
            this._fileDirectory[filename] = fe;
            this._currentOffset += fe.size;
        }
    },

    clearFileList: function () {
        if (this.fileList == null) {
            this.fileList = [];
        }
        if (this._fileDirectory == null) {
            this._fileDirectory = {};
        }
        this.fileList.length = 0;
        ss.clearKeys(this._fileDirectory);
        this._currentOffset = 0;
    },

    packageFiles: function () {
        var xmlWriter = new XmlTextWriter();
        xmlWriter.formatting = 1;
        xmlWriter._writeProcessingInstruction('xml', "version='1.0' encoding='UTF-8'");
        xmlWriter._writeStartElement('FileCabinet');
        xmlWriter._writeAttributeString('HeaderSize', '0x0BADFOOD');
        xmlWriter._writeStartElement('Files');
        var $enum1 = ss.enumerate(this.fileList);
        while ($enum1.moveNext()) {
            var entry = $enum1.current;
            xmlWriter._writeStartElement('File');
            xmlWriter._writeAttributeString('Name', entry.filename);
            xmlWriter._writeAttributeString('Size', entry.size.toString());
            xmlWriter._writeAttributeString('Offset', entry.offset.toString());
            xmlWriter._writeEndElement();
        }
        xmlWriter._writeEndElement();
        xmlWriter._writeFullEndElement();
        xmlWriter._close();
        var data = xmlWriter.body;
        var blob = new Blob([data]);
        var sizeText = ss.format('0x{0:x8}', blob.size);
        data = ss.replaceString(data, '0x0BADFOOD', sizeText);
        blob = new Blob([data]);
        var blobs = [];
        blobs.push(blob);
        var $enum2 = ss.enumerate(this.fileList);

        // add the blobs to array to append in order
        while ($enum2.moveNext()) {
            var entry = $enum2.current;
            blobs.push(entry.blob);
        }
        var cabBlob = new Blob(blobs, { type: 'application/x-wtt' });
        return cabBlob;
    },

    _loadCabinet: function () {
        var $this = this;

        if (this._webFile.get_state() === 2) {
            alert(this._webFile.get_message());
        } else if (this._webFile.get_state() === 1) {
            this._mainBlob = this._webFile.getBlob();
            var chunck = new FileReader();
            chunck.onloadend = function (e) {
                var offset = $this._getSize(chunck.result);
                var header = new FileReader();
                header.onloadend = function (ee) {
                    var data = ss.safeCast(header.result, String);
                    var xParser = new DOMParser();
                    $this.extract(xParser.parseFromString(data, 'text/xml'), offset);
                    $this._callMe();
                };
                header.readAsText($this._mainBlob.slice(0, offset));
            };
            chunck.readAsText(this._mainBlob.slice(0, 255));
        }
    },

    _getSize: function (data) {
        var start = data.indexOf('0x');
        if (start === -1) {
            return 0;
        }
        return parseInt(data.substring(start, start + 10), 16);
    },

    extract: function (doc, offset) {
        try {
            var cab = Util.selectSingleNode(doc, 'FileCabinet');
            var files = Util.selectSingleNode(cab, 'Files');
            this.fileList.length = 0;
            var $enum1 = ss.enumerate(files.childNodes);
            while ($enum1.moveNext()) {
                var child = $enum1.current;
                if (child.nodeName === 'File') {
                    var fe = new FileEntry(child.attributes.getNamedItem('Name').nodeValue, parseInt(child.attributes.getNamedItem('Size').nodeValue));
                    fe.offset = offset;
                    offset += fe.size;
                    this.fileList.push(fe);
                }
            }
        }
        catch ($e2) {
        }
    },

    getFileBlob: function (filename) {
        var fe = this.getFileEntry(filename);
        if (fe != null) {
            var ext = filename.substr(filename.lastIndexOf('.')).toLowerCase();
            var type = null;
            switch (ext) {
                case '.png':
                    type = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    type = 'image/jpeg';
                    break;
                case '.mp3':
                    type = 'audio/mpeg3';
                    break;
                case '.txt':
                    type = 'text/plain';
                    break;
                case '.fit':
                case '.fits':
                    type = 'application/octet-stream';
                    break;
            }
            return this._mainBlob.slice(fe.offset, fe.offset + fe.size, type);
        }
        return null;
    },

    getFileEntry: function (filename) {
        var $enum1 = ss.enumerate(this.fileList);
        while ($enum1.moveNext()) {
            var entry = $enum1.current;
            if (entry.filename === filename) {
                return entry;
            }
        }
        return null;
    },

    get_masterFile: function () {
        if (this.fileList.length > 0) {
            return this.fileList[0].filename;
        } else {
            return null;
        }
    },

    clearTempFiles: function () {
        var $enum1 = ss.enumerate(this.fileList);
        while ($enum1.moveNext()) {
            var entry = $enum1.current;
        }
    }
};

registerType("FileCabinet", [FileCabinet, FileCabinet$, null]);
