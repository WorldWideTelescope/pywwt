// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that renders an orbit.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Vector3d } from "../double3d.js";
import { Color, Colors } from "../color.js";
import { Layer } from "./layer.js";
import { LayerUI, LayerUITreeNode } from "./layer_ui.js";
import { Orbit } from "./orbit.js";
import { ReferenceFrame } from "./reference_frame.js";


// wwtlib.OrbitLayer

export function OrbitLayer() {
    this._frames$1 = [];
    this._primaryUI$1 = null;
    this._pointOpacity$1 = 1;
    this._pointColor$1 = Colors.get_yellow();
    this._filename$1 = '';
    this._dataFile$1 = '';
    Layer.call(this);
}

var OrbitLayer$ = {
    get_frames: function () {
        return this._frames$1;
    },

    set_frames: function (value) {
        this._frames$1 = value;
        return value;
    },

    getPrimaryUI: function () {
        if (this._primaryUI$1 == null) {
            this._primaryUI$1 = new OrbitLayerUI(this);
        }
        return this._primaryUI$1;
    },

    cleanUp: function () {
        var $enum1 = ss.enumerate(this._frames$1);
        while ($enum1.moveNext()) {
            var frame = $enum1.current;
            if (frame.get_orbit() != null) {
                frame.get_orbit().cleanUp();
                frame.set_orbit(null);
            }
        }
    },

    writeLayerProperties: function (xmlWriter) {
        xmlWriter._writeAttributeString('PointOpacity', this.get_pointOpacity().toString());
        xmlWriter._writeAttributeString('PointColor', this._pointColor$1.save());
    },

    get_pointOpacity: function () {
        return this._pointOpacity$1;
    },

    set_pointOpacity: function (value) {
        if (this._pointOpacity$1 !== value) {
            this.version++;
            this._pointOpacity$1 = value;
        }
        return value;
    },

    get_pointColor: function () {
        return this._pointColor$1;
    },

    set_pointColor: function (value) {
        if (this._pointColor$1 !== value) {
            this.version++;
            this._pointColor$1 = value;
        }
        return value;
    },

    getParams: function () {
        var paramList = new Array(6);
        paramList[0] = this._pointOpacity$1;
        paramList[1] = this.get_color().r / 255;
        paramList[2] = this.get_color().g / 255;
        paramList[3] = this.get_color().b / 255;
        paramList[4] = this.get_color().a / 255;
        paramList[5] = this.get_opacity();
        return paramList;
    },

    getParamNames: function () {
        return ['PointOpacity', 'Color.Red', 'Color.Green', 'Color.Blue', 'Color.Alpha', 'Opacity'];
    },

    setParams: function (paramList) {
        if (paramList.length === 6) {
            this._pointOpacity$1 = paramList[0];
            this.set_opacity(paramList[5]);
            var color = Color.fromArgb(ss.truncate((paramList[4] * 255)), ss.truncate((paramList[1] * 255)), ss.truncate((paramList[2] * 255)), ss.truncate((paramList[3] * 255)));
            this.set_color(color);
        }
    },

    initializeFromXml: function (node) {
        this.set_pointOpacity(parseFloat(node.attributes.getNamedItem('PointOpacity').nodeValue));
        this.set_pointColor(Color.load(node.attributes.getNamedItem('PointColor').nodeValue));
    },

    draw: function (renderContext, opacity, flat) {
        var matSaved = renderContext.get_world();
        renderContext.set_world(renderContext.get_worldBaseNonRotating());
        var $enum1 = ss.enumerate(this._frames$1);
        while ($enum1.moveNext()) {
            var frame = $enum1.current;
            if (frame.showOrbitPath) {
                if (frame.get_orbit() == null) {
                    frame.set_orbit(new Orbit(frame.get_elements(), 360, this.get_color(), 1, renderContext.get_nominalRadius()));
                }
                frame.get_orbit().draw3D(renderContext, opacity * this.get_opacity(), new Vector3d());
            }
        }
        renderContext.set_world(matSaved);
        return true;
    },

    addFilesToCabinet: function (fc) {
        this._filename$1 = fc.tempDirectory + ss.format('{0}\\{1}.txt', fc.get_packageID(), this.id.toString());
        var dir = this._filename$1.substring(0, this._filename$1.lastIndexOf('\\'));
        var blob = new Blob([this._dataFile$1]);
        fc.addFile(this._filename$1, blob);
        Layer.prototype.addFilesToCabinet.call(this, fc);
    },

    loadData: function (tourDoc, filename) {
        var $this = this;

        var blob = tourDoc.getFileBlob(filename);
        var doc = new FileReader();
        doc.onloadend = function (ee) {
            $this._dataFile$1 = ss.safeCast(doc.result, String);
            $this.loadString($this._dataFile$1);
        };
        doc.readAsText(blob);
    },

    loadString: function (dataFile) {
        var data = dataFile.split('\n');
        this._frames$1.length = 0;
        for (var i = 0; i < data.length; i += 2) {
            var line1 = i;
            var line2 = i + 1;
            if (data[i].length > 0) {
                var frame = new ReferenceFrame();
                if (data[i].substring(0, 1) !== '1') {
                    line1++;
                    line2++;
                    frame.name = ss.trim(data[i]);
                    i++;
                }
                else if (data[i].substring(0, 1) === '1') {
                    frame.name = data[i].substring(2, 5);
                }
                else {
                    i -= 2;
                    continue;
                }
                frame.reference = 18;
                frame.oblateness = 0;
                frame.showOrbitPath = true;
                frame.showAsPoint = true;
                frame.referenceFrameType = 1;
                frame.scale = 1;
                frame.semiMajorAxisUnits = 1;
                frame.meanRadius = 10;
                frame.oblateness = 0;
                frame.fromTLE(data[line1], data[line2], 398600441800000);
                this._frames$1.push(frame);
            }
            else {
                i -= 1;
            }
        }
    }
};

registerType("OrbitLayer", [OrbitLayer, OrbitLayer$, Layer]);


// wwtlib.OrbitLayerUI

export function OrbitLayerUI(layer) {
    this._layer$1 = null;
    this._opened$1 = true;
    this._callbacks$1 = null;
    LayerUI.call(this);
    this._layer$1 = layer;
}

var OrbitLayerUI$ = {
    setUICallbacks: function (callbacks) {
        this._callbacks$1 = callbacks;
    },

    get_hasTreeViewNodes: function () {
        return true;
    },

    getTreeNodes: function () {
        var nodes = [];
        var $enum1 = ss.enumerate(this._layer$1.get_frames());
        while ($enum1.moveNext()) {
            var frame = $enum1.current;
            var node = new LayerUITreeNode();
            node.set_name(frame.name);
            node.set_tag(frame);
            node.set_checked(frame.showOrbitPath);
            node.add_nodeSelected(ss.bind('_node_NodeSelected$1', this));
            node.add_nodeChecked(ss.bind('_node_NodeChecked$1', this));
            nodes.push(node);
        }
        return nodes;
    },
    _node_NodeChecked$1: function (node, newState) {
        var frame = node.get_tag();
        if (frame != null) {
            frame.showOrbitPath = newState;
        }
    },
    _node_NodeSelected$1: function (node) {
        if (this._callbacks$1 != null) {
            var frame = node.get_tag();
            var rowData = {};
            rowData['Name'] = frame.name;
            rowData['SemiMajor Axis'] = frame.semiMajorAxis.toString();
            rowData['SMA Units'] = frame.semiMajorAxisUnits.toString();
            rowData['Inclination'] = frame.inclination.toString();
            rowData['Eccentricity'] = frame.eccentricity.toString();
            rowData['Long of Asc. Node'] = frame.longitudeOfAscendingNode.toString();
            rowData['Argument Of Periapsis'] = frame.argumentOfPeriapsis.toString();
            rowData['Epoch'] = frame.epoch.toString();
            rowData['Mean Daily Motion'] = frame.meanDailyMotion.toString();
            rowData['Mean Anomoly at Epoch'] = frame.meanAnomolyAtEpoch.toString();
            this._callbacks$1.showRowData(rowData);
        }
    },

    getNodeContextMenu: function (node) {
        return LayerUI.prototype.getNodeContextMenu.call(this, node);
    }
};

registerType("OrbitLayerUI", [OrbitLayerUI, OrbitLayerUI$, LayerUI]);
