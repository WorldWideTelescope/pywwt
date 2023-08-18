// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A WWT Tour document.

import { ss } from "../ss.js";
import { registerType, registerEnum, Enums } from "../typesystem.js";
import {
    globalScriptInterface,
    globalWWTControl,
    layerManagerGetAllMaps,
    set_tourDocumentFromUrlRaw,
} from "../data_globals.js";
import { globalRenderContext } from "../render_globals.js";
import { Util } from "../baseutil.js";
import { Texture } from "../graphics/texture.js";
import { Guid } from "../util.js";
import { XmlTextWriter } from "../utilities/xml_text_writer.js";
import { ImageSetType, ProjectionType } from "../imageset.js";
import { ViewMoverSlew } from "../view_mover.js";
import { ReferenceFrame } from "../layers/reference_frame.js";
import { FileCabinet } from "./file_cabinet.js";
import { TourStop } from "./tour_stop.js";
import { MasterTime } from "./tour_player.js";
import { Layer } from "../layers/layer.js";
import { ImageSetLayer } from "../layers/imageset_layer.js";
import { LayerManager, LayerMap } from "../layers/layer_manager.js";


// wwtlib.UserLevel

export var UserLevel = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
    educator: 3,
    professional: 4
};

registerType("UserLevel", UserLevel);
registerEnum("UserLevel", UserLevel);


// wwtlib.TourDocument

export function TourDocument() {
    this._tourDirty = 0;
    this._workingDirectory = '';
    this.url = '';
    this._tagId = '';
    this._representativeThumbnailTourstop = 0;
    this._id = '';
    this._title = '';
    this._runTime = 0;
    this._lastDirtyCheck = 0;
    this._description = '';
    this._attributesAndCredits = '';
    this._authorEmailOther = '';
    this._authorEmail = '';
    this._authorUrl = '';
    this._authorPhone = '';
    this._authorContactText = '';
    this._orgName = 'None';
    this._orgUrl = '';
    this._author = '';
    this._authorImageUrl = '';
    this._authorImage = null;
    this._organizationUrl = '';
    this._filename = '';
    this._level = 0;
    this._type = 268435456;
    this._taxonomy = '';
    this._keywords = '';
    this._objects = '';
    this._editMode = false;
    this.explicitTourLinks = [];
    this.implicitTourLinks = [];
    this._tourStops = [];
    this._currentTourstopIndex = -1;
    this._textureList = {};
    this._textureList2d = {};

    // This handles new files added while editing a tour
    this._fileCache = {};
    this.dontCleanUpTempFiles = false;
    this._id = Guid.newGuid().toString();
}

TourDocument.get_baseWorkingDirectory = function () {
    return '';
};

TourDocument.fromUrl = function (url, callMe) {
    var temp = new TourDocument();
    temp.url = url;
    temp._callMe = callMe;
    temp._cabinet = FileCabinet.fromUrl(url, ss.bind('_loadXmlDocument', temp));
    return temp;
};

TourDocument.fromUrlRaw = function (url, callMe) {
    var temp = new TourDocument();
    temp.url = url;
    temp._callMe = callMe;
    temp._cabinet = FileCabinet.fromUrl(url, callMe);
    return temp;
};

set_tourDocumentFromUrlRaw(TourDocument.fromUrlRaw);

var TourDocument$ = {
    get_tourDirty: function () {
        return this._tourDirty > 0;
    },

    set_tourDirty: function (value) {
        if (value) {
            this._tourDirty++;
        } else {
            this._tourDirty = 0;
        }
        return value;
    },

    get_workingDirectory: function () {
        if (ss.emptyString(this._workingDirectory)) {
            this._workingDirectory = TourDocument.get_baseWorkingDirectory() + this._id + '\\';
        }
        return this._workingDirectory;
    },

    set_workingDirectory: function (value) {
        this._workingDirectory = value;
        return value;
    },

    _loadXmlDocument: function () {
        var $this = this;

        try {
            var master = this._cabinet.get_masterFile();
            var doc = new FileReader();
            doc.onloadend = function (ee) {
                var data = ss.safeCast(doc.result, String);
                var xParser = new DOMParser();
                $this.fromXml(xParser.parseFromString(data, 'text/xml'));
                $this._callMe();
            };
            doc.readAsText(this._cabinet.getFileBlob(master));
        }
        catch (ex) {
            globalScriptInterface._fireTourError(ex);
        }
    },

    fromXml: function (doc) {
        var root = Util.selectSingleNode(doc, 'Tour');
        this._id = root.attributes.getNamedItem('ID').nodeValue;
        this.set_title(root.attributes.getNamedItem('Title').nodeValue);
        this.set_author(root.attributes.getNamedItem('Author').nodeValue);
        if (root.attributes.getNamedItem('Descirption') != null) {
            this.set_description(root.attributes.getNamedItem('Descirption').nodeValue);
        }
        if (root.attributes.getNamedItem('AuthorEmail') != null) {
            this._authorEmail = root.attributes.getNamedItem('AuthorEmail').nodeValue;
        }
        if (root.attributes.getNamedItem('Keywords') != null) {
            this.set_keywords(root.attributes.getNamedItem('Keywords').nodeValue);
        }
        if (root.attributes.getNamedItem('OrganizationName') != null) {
            this.set_orgName(root.attributes.getNamedItem('OrganizationName').nodeValue);
        }
        this._organizationUrl = root.attributes.getNamedItem('OrganizationUrl').nodeValue;
        this._level = Enums.parse('UserLevel', root.attributes.getNamedItem('UserLevel').nodeValue);
        this._type = Enums.parse('Classification', root.attributes.getNamedItem('Classification').nodeValue);
        this._taxonomy = root.attributes.getNamedItem('Taxonomy').nodeValue;
        var TourStops = Util.selectSingleNode(root, 'TourStops');
        var $enum1 = ss.enumerate(TourStops.childNodes);
        while ($enum1.moveNext()) {
            var tourStop = $enum1.current;
            if (tourStop.nodeName === 'TourStop') {
                this.addTourStop(TourStop._fromXml(this, tourStop));
            }
        }
        var Frames = Util.selectSingleNode(root, 'ReferenceFrames');
        if (Frames != null) {
            var $enum2 = ss.enumerate(Frames.childNodes);
            while ($enum2.moveNext()) {
                var frame = $enum2.current;
                if (frame.nodeName === 'ReferenceFrame') {
                    var newFrame = new ReferenceFrame();
                    newFrame.initializeFromXml(frame);
                    if (!ss.keyExists(layerManagerGetAllMaps(), newFrame.name)) {
                        var map = new LayerMap(newFrame.name, 18);
                        map.frame = newFrame;
                        map.loadedFromTour = true;
                        layerManagerGetAllMaps()[newFrame.name] = map;
                    }
                }
            }
            LayerManager.connectAllChildren();
            LayerManager.loadTree();
        }
        var Layers = Util.selectSingleNode(root, 'Layers');
        if (Layers != null) {
            var $enum3 = ss.enumerate(Layers.childNodes);
            while ($enum3.moveNext()) {
                var layer = $enum3.current;
                if (layer.nodeName === 'Layer') {
                    var newLayer = Layer.fromXml(layer, true);
                    if (newLayer != null) {
                        if (ss.canCast(newLayer, ImageSetLayer)) {
                            var imageSetLayer = newLayer;
                            var imageset = imageSetLayer.get_imageSet();
                            if (imageset.get_projection() === ProjectionType.healpix && imageset.get_extension() === '.tsv') {
                                globalWWTControl.addCatalogHips(imageset);
                                continue;
                            }
                        }
                        var fileName = ss.format('{0}.txt', newLayer.id.toString());
                        if (ss.keyExists(LayerManager.get_layerList(), newLayer.id)) {
                            LayerManager.deleteLayerByID(newLayer.id, true, false);
                        }
                        try {
                            newLayer.loadedFromTour = true;
                            newLayer.loadData(this, fileName);
                            LayerManager.add(newLayer, false);
                        }
                        catch ($e4) {
                        }
                    }
                }
            }
            LayerManager.loadTree();
        }
        this._tourDirty = 0;
    },

    saveToDataUrl: function () {
        return URL.createObjectURL(this.saveToBlob());
    },

    saveToBlob: function () {
        var excludeAudio = false;
        this.cleanUp();
        var tourXml = this.getTourXML();
        var fc = new FileCabinet();
        fc.set_packageID(this.get_id());
        fc.addFile('Tour.wwtxml', new Blob([tourXml]));
        if (this._authorImage != null) {
        }
        var $enum1 = ss.enumerate(this.get_tourStops());
        while ($enum1.moveNext()) {
            var stop = $enum1.current;
            stop._addFilesToCabinet(fc, excludeAudio);
        }
        var masterList = this._createLayerMasterList();
        var $enum2 = ss.enumerate(masterList);
        while ($enum2.moveNext()) {
            var id = $enum2.current;
            if (ss.keyExists(LayerManager.get_layerList(), id)) {
                LayerManager.get_layerList()[id].addFilesToCabinet(fc);
            }
        }
        this.set_tourDirty(false);
        return fc.packageFiles();
    },

    getTourXML: function () {
        var xmlWriter = new XmlTextWriter();
        xmlWriter.formatting = 1;
        xmlWriter._writeProcessingInstruction('xml', "version='1.0' encoding='UTF-8'");
        xmlWriter._writeStartElement('Tour');
        xmlWriter._writeAttributeString('ID', this._id);
        xmlWriter._writeAttributeString('Title', this._title);
        xmlWriter._writeAttributeString('Descirption', this.get_description());
        xmlWriter._writeAttributeString('Description', this.get_description());
        xmlWriter._writeAttributeString('RunTime', (this.get_runTime() / 1000).toString());
        xmlWriter._writeAttributeString('Author', this._author);
        xmlWriter._writeAttributeString('AuthorEmail', this._authorEmail);
        xmlWriter._writeAttributeString('OrganizationUrl', this._organizationUrl);
        xmlWriter._writeAttributeString('OrganizationName', this.get_orgName());
        xmlWriter._writeAttributeString('Keywords', this.get_keywords());
        xmlWriter._writeAttributeString('UserLevel', Enums.toXml('UserLevel', this._level));
        xmlWriter._writeAttributeString('Classification', Enums.toXml('Classification', this._type));
        xmlWriter._writeAttributeString('Taxonomy', this._taxonomy);
        var timeLineTour = this._isTimelineTour();
        xmlWriter._writeAttributeString('TimeLineTour', timeLineTour.toString());
        xmlWriter._writeStartElement('TourStops');
        var $enum1 = ss.enumerate(this.get_tourStops());
        while ($enum1.moveNext()) {
            var stop = $enum1.current;
            stop._saveToXml(xmlWriter, true);
        }
        xmlWriter._writeEndElement();
        var masterList = this._createLayerMasterList();

        // This will now save and sync emtpy frames...
        var referencedFrames = this._getReferenceFrameList();
        xmlWriter._writeStartElement('ReferenceFrames');
        var $enum2 = ss.enumerate(referencedFrames);
        while ($enum2.moveNext()) {
            var item = $enum2.current;
            item.saveToXml(xmlWriter);
        }
        xmlWriter._writeEndElement();
        xmlWriter._writeStartElement('Layers');
        var $enum3 = ss.enumerate(masterList);
        while ($enum3.moveNext()) {
            var id = $enum3.current;
            if (ss.keyExists(LayerManager.get_layerList(), id)) {
                var layer = LayerManager.get_layerList()[id];
                var name = layer.get_name();
                var imageset = globalRenderContext.getCatalogHipsByName(name);
                if (imageset != null) {
                    var imageSetLayer = ImageSetLayer.create(imageset);
                    imageSetLayer.id = id;
                    imageSetLayer.set_name(name);
                    imageSetLayer.set_referenceFrame('Sky');
                    imageSetLayer.saveToXml(xmlWriter);
                }
                else {
                    LayerManager.get_layerList()[id].saveToXml(xmlWriter);
                }
            }
        }
        xmlWriter._writeEndElement();
        xmlWriter._writeFullEndElement();
        xmlWriter._close();
        return xmlWriter.body;
    },

    _getReferenceFrameList: function () {
        var list = [];
        var $enum1 = ss.enumerate(ss.keys(layerManagerGetAllMaps()));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var lm = layerManagerGetAllMaps()[key];
            if ((lm.frame.reference === 18 || lm.frame.reference === 19) && !(list.indexOf(lm.frame) >= 0) && !lm.frame._systemGenerated) {
                list.push(lm.frame);
            }
        }
        return list;
    },

    _createLayerMasterList: function () {
        var masterList = [];
        var $enum1 = ss.enumerate(this.get_tourStops());
        while ($enum1.moveNext()) {
            var stop = $enum1.current;
            var $enum2 = ss.enumerate(ss.keys(stop.layers));
            while ($enum2.moveNext()) {
                var id = $enum2.current;
                if (!(masterList.indexOf(id) >= 0)) {
                    if (ss.keyExists(LayerManager.get_layerList(), id)) {
                        masterList.push(id);
                    }
                }
            }
        }
        return masterList;
    },

    _isTimelineTour: function () {
        return false;
    },

    get_tagId: function () {
        return this._tagId;
    },

    set_tagId: function (value) {
        this._tagId = value;
        return value;
    },

    get_authorThumbnailFilename: function () {
        return 'Author.Png';
    },

    get_tourThumbnailFilename: function () {
        if (this._representativeThumbnailTourstop < this._tourStops.length) {
            return this._tourStops[this._representativeThumbnailTourstop].get_tourStopThumbnailFilename();
        } else {
            return null;
        }
    },

    get_id: function () {
        return this._id;
    },

    set_id: function (value) {
        this._id = value;
        return value;
    },

    get_title: function () {
        return this._title;
    },

    set_title: function (value) {
        this._title = value;
        this.set_tourDirty(true);
        return value;
    },

    get_runTime: function () {
        if (!this._runTime || this._lastDirtyCheck !== this._tourDirty) {
            this._runTime = this._calculateRunTime();
            this._lastDirtyCheck = this._tourDirty;
        }
        return this._runTime;
    },

    get_description: function () {
        return this._description;
    },

    set_description: function (value) {
        this._description = value;
        this.set_tourDirty(true);
        return value;
    },

    get_attributesAndCredits: function () {
        return this._attributesAndCredits;
    },

    set_attributesAndCredits: function (value) {
        this._attributesAndCredits = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorEmailOther: function () {
        return this._authorEmailOther;
    },

    set_authorEmailOther: function (value) {
        this._authorEmailOther = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorEmail: function () {
        return this._authorEmail;
    },

    set_authorEmail: function (value) {
        this._authorEmail = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorUrl: function () {
        return this._authorUrl;
    },

    set_authorUrl: function (value) {
        this._authorUrl = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorPhone: function () {
        return this._authorPhone;
    },

    set_authorPhone: function (value) {
        this._authorPhone = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorContactText: function () {
        return this._authorContactText;
    },

    set_authorContactText: function (value) {
        this._authorContactText = value;
        this.set_tourDirty(true);
        return value;
    },

    get_orgName: function () {
        return this._orgName;
    },

    set_orgName: function (value) {
        this._orgName = value;
        this.set_tourDirty(true);
        return value;
    },

    get_orgUrl: function () {
        return this._orgUrl;
    },

    set_orgUrl: function (value) {
        this._orgUrl = value;
        this.set_tourDirty(true);
        return value;
    },

    get_author: function () {
        return this._author;
    },

    set_author: function (value) {
        this._author = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorImageUrl: function () {
        return this._authorImageUrl;
    },

    set_authorImageUrl: function (value) {
        this._authorImageUrl = value;
        this.set_tourDirty(true);
        return value;
    },

    get_authorImage: function () {
        return this._authorImage;
    },

    set_authorImage: function (value) {
        this._authorImage = value;
        this.set_tourDirty(true);
        return value;
    },

    get_organizationUrl: function () {
        return this._organizationUrl;
    },

    set_organizationUrl: function (value) {
        this._organizationUrl = value;
        this.set_tourDirty(true);
        return value;
    },

    get_fileName: function () {
        return this._filename;
    },

    set_fileName: function (value) {
        this._filename = value;
        return value;
    },

    get_level: function () {
        return this._level;
    },

    set_level: function (value) {
        this._level = value;
        this.set_tourDirty(true);
        return value;
    },

    get_type: function () {
        return this._type;
    },

    set_type: function (value) {
        this._type = value;
        this.set_tourDirty(true);
        return value;
    },

    get_taxonomy: function () {
        return this._taxonomy;
    },

    set_taxonomy: function (value) {
        this._taxonomy = value;
        this.set_tourDirty(true);
        return value;
    },

    get_keywords: function () {
        return this._keywords;
    },

    set_keywords: function (value) {
        this._keywords = value;
        this.set_tourDirty(true);
        return value;
    },

    get_objects: function () {
        return this._objects;
    },

    set_objects: function (value) {
        this._objects = value;
        this.set_tourDirty(true);
        return value;
    },

    get_editMode: function () {
        return this._editMode;
    },

    set_editMode: function (value) {
        this._editMode = value;
        return value;
    },

    get_tourStops: function () {
        return this._tourStops;
    },

    set_tourStops: function (value) {
        this._tourStops = value;
        return value;
    },

    get_currentTourstopIndex: function () {
        return this._currentTourstopIndex;
    },

    set_currentTourstopIndex: function (value) {
        this._currentTourstopIndex = value;
        return value;
    },

    addTourStop: function (ts) {
        ts.set_owner(this);
        this.get_tourStops().push(ts);
        this._currentTourstopIndex = this._tourStops.length - 1;
        this.set_tourDirty(true);
    },

    insertTourStop: function (ts) {
        ts.set_owner(this);
        if (this._currentTourstopIndex > -1) {
            this.get_tourStops().splice(this._currentTourstopIndex, 0, ts);
        } else {
            this.get_tourStops().push(ts);
            this._currentTourstopIndex = this._tourStops.length - 1;
        }
        this.set_tourDirty(true);
    },

    insertAfterTourStop: function (ts) {
        ts.set_owner(this);
        if (this._currentTourstopIndex > -1 || this._currentTourstopIndex < this.get_tourStops().length) {
            this.get_tourStops().splice(this._currentTourstopIndex + 1, 0, ts);
        } else {
            this.get_tourStops().push(ts);
            this._currentTourstopIndex = this._tourStops.length - 1;
        }
        this.set_tourDirty(true);
    },

    removeTourStop: function (ts) {
        ss.remove(this._tourStops, ts);
        if (this._currentTourstopIndex > this._tourStops.length - 1) {
            this._currentTourstopIndex--;
        }
        this.set_tourDirty(true);
    },

    _calculateRunTime: function () {
        var totalTime = 0;
        for (var i = 0; i < this._tourStops.length; i++) {
            totalTime += this._tourStops[i].get_duration();
            if (i > 0) {
                switch (this._tourStops[i].get__transition()) {
                    case 0:
                        if (this._tourStops[i].get_target().get_backgroundImageset() == null || (this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() === this._tourStops[i].get_target().get_backgroundImageset().get_dataSetType() && ((this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() != ImageSetType.solarSystem) || (this._tourStops[i - 1].get_target().get_target() === this._tourStops[i].get_target().get_target())))) {
                            var start = (this._tourStops[i - 1].get_endTarget() == null) ? this._tourStops[i - 1].get_target().get_camParams() : this._tourStops[i - 1].get_endTarget().get_camParams();
                            var slew = ViewMoverSlew.create(start, this._tourStops[i].get_target().get_camParams());
                            totalTime += slew.get_moveTime() * 1000;
                        }
                        break;
                    case 2:
                        break;
                    case 1:
                        break;
                    case 5:
                        break;
                    default:
                        break;
                }
            }
        }
        return ss.truncate(totalTime);
    },

    elapsedTimeTillTourstop: function (index) {
        if (!index && index >= this._tourStops.length) {
            return 0;
        }
        var totalTime = 0;
        for (var i = 0; i < index; i++) {
            totalTime += this._tourStops[i].get_duration();
            if (i > 0) {
                switch (this._tourStops[i].get__transition()) {
                    case 0:
                        var start = (this._tourStops[i - 1].get_endTarget() == null) ? this._tourStops[i - 1].get_target().get_camParams() : this._tourStops[i - 1].get_endTarget().get_camParams();
                        if (this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() === this._tourStops[i].get_target().get_backgroundImageset().get_dataSetType() && ((this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() != ImageSetType.solarSystem) || (this._tourStops[i - 1].get_target().get_target() === this._tourStops[i].get_target().get_target()))) {
                            var slew = ViewMoverSlew.create(start, this._tourStops[i].get_target().get_camParams());
                            totalTime += slew.get_moveTime() * 1000;
                        }
                        break;
                    case 2:
                        break;
                    case 1:
                        break;
                    case 5:
                        break;
                    default:
                        break;
                }
            }
        }
        return totalTime / 1000;
    },

    elapsedTimeSinceLastMaster: function (index) {
        var masterOut = null;
        if (!index && index >= this._tourStops.length) {
            return null;
        }
        var totalTime = 0;
        for (var i = 0; i < index; i++) {
            if (this._tourStops[i].get_masterSlide()) {
                totalTime = 0;
                masterOut = this._tourStops[i];
            }
            totalTime += this._tourStops[i].get_duration();
            if (i > 0) {
                switch (this._tourStops[i].get__transition()) {
                    case 0:
                        var start = (this._tourStops[i - 1].get_endTarget() == null) ? this._tourStops[i - 1].get_target().get_camParams() : this._tourStops[i - 1].get_endTarget().get_camParams();
                        if (this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() === this._tourStops[i].get_target().get_backgroundImageset().get_dataSetType() && ((this._tourStops[i - 1].get_target().get_backgroundImageset().get_dataSetType() != ImageSetType.solarSystem) || (this._tourStops[i - 1].get_target().get_target() === this._tourStops[i].get_target().get_target()))) {
                            var slew = ViewMoverSlew.create(start, this._tourStops[i].get_target().get_camParams());
                            totalTime += slew.get_moveTime() * 1000;
                        }
                        break;
                    case 2:
                        break;
                    case 1:
                        break;
                    case 5:
                        break;
                    default:
                        break;
                }
            }
        }
        return new MasterTime(masterOut, totalTime / 1000);
    },

    getMasterSlideForIndex: function (index) {
        var master = -1;
        for (var i = 0; i < index; i++) {
            if (this._tourStops[i].get_masterSlide()) {
                master = i;
            }
        }
        if (master === -1) {
            return null;
        }
        return this._tourStops[master];
    },

    getTourStopIndexByID: function (id) {
        if (!id || id === 'Next') {
            return this._currentTourstopIndex++;
        }
        var index = 0;
        var $enum1 = ss.enumerate(this._tourStops);
        while ($enum1.moveNext()) {
            var stop = $enum1.current;
            if (stop.get_id() === id) {
                return index;
            }
            index++;
        }
        return -1;
    },

    cleanUp: function () { },

    getCachedTexture: function (filename, callMe) {
        if (this._textureList == null) {
            this._textureList = {};
        }
        if (ss.keyExists(this._textureList, filename)) {
            callMe();
            return this._textureList[filename];
        }
        var url = this.getFileStream(filename);
        if (!ss.whitespace(url)) {
            var texture = document.createElement('img');
            texture.src = this.getFileStream(filename);
            texture.addEventListener('load', function () {
                callMe();
            }, false);
            this._textureList[filename] = texture;
            return texture;
        } else {
            return null;
        }
    },

    getCachedTexture2d: function (filename) {
        if (this._textureList2d == null) {
            this._textureList2d = {};
        }
        if (ss.keyExists(this._textureList2d, filename)) {
            return this._textureList2d[filename];
        }
        var texture = new Texture();
        texture.load(this.getFileStream(filename));
        this._textureList2d[filename] = texture;
        return texture;
    },

    addCachedFile: function (filename, file) {
        this._fileCache[filename] = file;

        //Clean up old Cached Textures if they are based on this file.

        if (ss.keyExists(this._textureList2d, filename)) {
            delete this._textureList2d[filename];
        }
        if (ss.keyExists(this._textureList, filename)) {
            delete this._textureList[filename];
        }
    },

    getFileStream: function (filename) {
        var blob = this.getFileBlob(filename);
        if (blob == null) {
            return null;
        }
        return URL.createObjectURL(blob);
    },

    getFileBlob: function (filename) {
        if (ss.keyExists(this._fileCache, filename)) {
            return this._fileCache[filename];
        } else if (this._cabinet != null) {
            return this._cabinet.getFileBlob(this.get_workingDirectory() + filename);
        } else {
            return null;
        }
    },

    get_currentTourStop: function () {
        if (this._currentTourstopIndex > -1) {
            return this.get_tourStops()[this._currentTourstopIndex];
        } else {
            return null;
        }
    },

    set_currentTourStop: function (value) {
        var i = 0;
        var $enum1 = ss.enumerate(this.get_tourStops());
        while ($enum1.moveNext()) {
            var stop = $enum1.current;
            if (stop === value) {
                if (this._currentTourstopIndex > -1) {
                }
                this._currentTourstopIndex = i;
                break;
            }
            i++;
        }
        return value;
    },

    clearTempFiles: function () { }
};

registerType("TourDocument", [TourDocument, TourDocument$, null]);
