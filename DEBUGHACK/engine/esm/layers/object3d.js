// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer adding a 3D object model, and supporting code.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Color, Colors } from "../color.js";
import {
    Vector2d,
    Vector3d,
    Matrix3d,
    PositionNormalTextured,
    PositionNormalTexturedTangent,
    SphereHull,
    ConvexHull,
} from "../double3d.js";
import { globalRenderContext } from "../render_globals.js";
import { WEBGL } from "../graphics/webgl_constants.js";
import { Dates, LineList, TriangleList } from "../graphics/primitives3d.js";
import { IndexBuffer, PositionNormalTexturedVertexBuffer, PositionNormalTexturedTangentVertexBuffer } from "../graphics/gl_buffers.js";
import { ModelShader } from "../graphics/shaders.js";
import { BinaryReader } from "../utilities/binary_reader.js";
import { BasePlanets } from "../baseplanets.js";
import { IUiController } from "../interfaces.js";
import { Settings } from "../settings.js";
import { Cursor, Cursors } from "../util.js";
import { Layer } from "./layer.js";
import { LayerUI, LayerUITreeNode } from "./layer_ui.js";


// wwtlib.Material
//
// This was defined in `RenderContext.cs` in the C# code, but that really didn't
// make any sense, so we've moved it here.

export function Material() {
    this.specularSharpness = 0;
    this.opacity = 0;
    this.isDefault = false;
}

var Material$ = {};

registerType("Material", [Material, Material$, null]);


// wwtlib.Object3dLayer

export function Object3dLayer() {
    this._primaryUI$1 = null;
    this._heading$1 = 0;
    this._flipV$1 = true;
    this._flipHandedness$1 = false;
    this._smooth$1 = true;
    this._twoSidedGeometry$1 = false;
    this._pitch$1 = 0;
    this._roll$1 = 0;
    this._scale$1 = Vector3d.create(1, 1, 1);
    this._translate$1 = Vector3d.create(0, 0, 0);
    this._lightID$1 = 0;
    this._dirty$1 = false;
    this.objType = false;
    this._xHandle$1 = new Vector2d();
    this._yHandle$1 = new Vector2d();
    this._zHandle$1 = new Vector2d();
    this._hprHandles$1 = new Array(6);
    this._uiScale$1 = 1;
    this._showEditUi$1 = false;
    this._dragMode$1 = 0;
    this._pntDown$1 = new Vector2d();
    this._valueOnDown$1 = 0;
    this._valueOnDown2$1 = 0;
    this._hitDist$1 = 20;
    this._lockPreferedAxis$1 = false;
    this._preferY$1 = false;
    Layer.call(this);
}

Object3dLayer._translateUI$1 = null;
Object3dLayer._translateUILines$1 = null;
Object3dLayer._scaleUI$1 = null;
Object3dLayer._rotateUi$1 = null;

Object3dLayer._initTranslateUI$1 = function () {
    Object3dLayer._translateUILines$1 = new LineList();
    Object3dLayer._translateUILines$1.timeSeries = false;
    Object3dLayer._translateUILines$1.set_depthBuffered(false);
    Object3dLayer._translateUILines$1.showFarSide = true;
    Object3dLayer._translateUI$1 = new TriangleList();
    Object3dLayer._translateUI$1.depthBuffered = false;
    Object3dLayer._translateUI$1.timeSeries = false;
    Object3dLayer._translateUI$1.writeZbuffer = false;
    var twoPi = Math.PI * 2;
    var step = twoPi / 45;
    var rad = 0.05;

    // X

    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(1 - rad * 4, 0, 0);
        var pnt2 = Vector3d.create(1 - rad * 4, Math.cos(a) * rad, Math.sin(a) * rad);
        var pnt3 = Vector3d.create(1 - rad * 4, Math.cos(a + step) * rad, Math.sin(a + step) * rad);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Colors.get_red(), Dates.empty());
    }
    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(1, 0, 0);
        var pnt3 = Vector3d.create(1 - rad * 4, Math.cos(a) * rad, Math.sin(a) * rad);
        var pnt2 = Vector3d.create(1 - rad * 4, Math.cos(a + step) * rad, Math.sin(a + step) * rad);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Color.fromArgb(255, 255, Math.max(0, (Math.sin(a) * 128)), Math.max(0, (Math.sin(a) * 128))), Dates.empty());
    }
    Object3dLayer._translateUILines$1.addLine(Vector3d.create(0, 0, 0), Vector3d.create(1, 0, 0), Colors.get_red(), Dates.empty());

    // Y

    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(0, 1 - rad * 4, 0);
        var pnt3 = Vector3d.create(Math.cos(a) * rad, 1 - rad * 4, Math.sin(a) * rad);
        var pnt2 = Vector3d.create(Math.cos(a + step) * rad, 1 - rad * 4, Math.sin(a + step) * rad);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Colors.get_green(), Dates.empty());
    }
    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(0, 1, 0);
        var pnt2 = Vector3d.create(Math.cos(a) * rad, 1 - rad * 4, Math.sin(a) * rad);
        var pnt3 = Vector3d.create(Math.cos(a + step) * rad, 1 - rad * 4, Math.sin(a + step) * rad);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Color.fromArgb(255, Math.max(0, (Math.sin(a) * 128)), 255, Math.max(0, (Math.sin(a) * 128))), Dates.empty());
    }
    Object3dLayer._translateUILines$1.addLine(Vector3d.create(0, 0, 0), Vector3d.create(0, 1, 0), Colors.get_green(), Dates.empty());

    // Z

    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(0, 0, 1 - rad * 4);
        var pnt2 = Vector3d.create(Math.cos(a) * rad, Math.sin(a) * rad, 1 - rad * 4);
        var pnt3 = Vector3d.create(Math.cos(a + step) * rad, Math.sin(a + step) * rad, 1 - rad * 4);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Colors.get_blue(), Dates.empty());
    }
    for (var a = 0; a < twoPi; a += step) {
        var pnt1 = Vector3d.create(0, 0, 1);
        var pnt3 = Vector3d.create(Math.cos(a) * rad, Math.sin(a) * rad, 1 - rad * 4);
        var pnt2 = Vector3d.create(Math.cos(a + step) * rad, Math.sin(a + step) * rad, 1 - rad * 4);
        Object3dLayer._translateUI$1.addTriangle(pnt1, pnt2, pnt3, Color.fromArgb(255, Math.max(0, (Math.sin(a) * 128)), Math.max(0, (Math.sin(a) * 128)), 255), Dates.empty());
    }
    Object3dLayer._translateUILines$1.addLine(Vector3d.create(0, 0, 0), Vector3d.create(0, 0, 1), Colors.get_blue(), Dates.empty());
    Object3dLayer._initRotateUI$1();
    Object3dLayer._initScaleUI$1();
};

Object3dLayer._initScaleUI$1 = function () {
    Object3dLayer._scaleUI$1 = new TriangleList();
    Object3dLayer._scaleUI$1.depthBuffered = false;
    Object3dLayer._scaleUI$1.timeSeries = false;
    Object3dLayer._scaleUI$1.writeZbuffer = false;
    var twoPi = Math.PI * 2;
    var step = twoPi / 45;
    var rad = 0.05;
    Object3dLayer._makeCube$1(Object3dLayer._scaleUI$1, Vector3d.create(1 - rad * 2, 0, 0), rad * 2, Colors.get_red());
    Object3dLayer._makeCube$1(Object3dLayer._scaleUI$1, Vector3d.create(0, 1 - rad * 2, 0), rad * 2, Colors.get_green());
    Object3dLayer._makeCube$1(Object3dLayer._scaleUI$1, Vector3d.create(0, 0, 1 - rad * 2), rad * 2, Colors.get_blue());
};

Object3dLayer._makeCube$1 = function (tl, center, size, color) {
    var dark = Color.fromArgb(255, ss.truncate((color.r * 0.6)), color.g, ss.truncate((color.b * 0.6)));
    var med = Color.fromArgb(255, ss.truncate((color.r * 0.8)), ss.truncate((color.g * 0.8)), ss.truncate((color.b * 0.8)));
    tl.addQuad(Vector3d.create(center.x + size, center.y + size, center.z + size), Vector3d.create(center.x + size, center.y + size, center.z - size), Vector3d.create(center.x - size, center.y + size, center.z + size), Vector3d.create(center.x - size, center.y + size, center.z - size), color, Dates.empty());
    tl.addQuad(Vector3d.create(center.x + size, center.y - size, center.z + size), Vector3d.create(center.x - size, center.y - size, center.z + size), Vector3d.create(center.x + size, center.y - size, center.z - size), Vector3d.create(center.x - size, center.y - size, center.z - size), color, Dates.empty());
    tl.addQuad(Vector3d.create(center.x - size, center.y + size, center.z + size), Vector3d.create(center.x - size, center.y + size, center.z - size), Vector3d.create(center.x - size, center.y - size, center.z + size), Vector3d.create(center.x - size, center.y - size, center.z - size), dark, Dates.empty());
    tl.addQuad(Vector3d.create(center.x + size, center.y + size, center.z + size), Vector3d.create(center.x + size, center.y - size, center.z + size), Vector3d.create(center.x + size, center.y + size, center.z - size), Vector3d.create(center.x + size, center.y - size, center.z - size), dark, Dates.empty());
    tl.addQuad(Vector3d.create(center.x + size, center.y + size, center.z + size), Vector3d.create(center.x - size, center.y + size, center.z + size), Vector3d.create(center.x + size, center.y - size, center.z + size), Vector3d.create(center.x - size, center.y - size, center.z + size), med, Dates.empty());
    tl.addQuad(Vector3d.create(center.x + size, center.y + size, center.z - size), Vector3d.create(center.x + size, center.y - size, center.z - size), Vector3d.create(center.x - size, center.y + size, center.z - size), Vector3d.create(center.x - size, center.y - size, center.z - size), med, Dates.empty());
};

Object3dLayer._initRotateUI$1 = function () {
    Object3dLayer._rotateUi$1 = new TriangleList();
    Object3dLayer._rotateUi$1.depthBuffered = false;
    Object3dLayer._rotateUi$1.timeSeries = false;
    Object3dLayer._rotateUi$1.writeZbuffer = false;
    var twoPi = Math.PI * 2;
    var step = twoPi / 40;
    var rad = 0.05;
    var index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.cos(a), Math.sin(a));
        var pnt2 = Vector3d.create(-rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.cos(a), Math.sin(a));
        var pnt3 = Vector3d.create(rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.cos(a + step), Math.sin(a + step));
        var pnt4 = Vector3d.create(-rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.cos(a + step), Math.sin(a + step));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt3, pnt2, pnt4, Color._fromArgbColor(192, Colors.get_red()), Dates.empty());
        index++;
    }
    index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(Math.cos(a), Math.sin(a), rad * ((start) ? 0 : ((end) ? 1.5 : 1)));
        var pnt2 = Vector3d.create(Math.cos(a), Math.sin(a), -rad * ((start) ? 0 : ((end) ? 1.5 : 1)));
        var pnt3 = Vector3d.create(Math.cos(a + step), Math.sin(a + step), rad * ((start) ? 1.5 : ((end) ? 0 : 1)));
        var pnt4 = Vector3d.create(Math.cos(a + step), Math.sin(a + step), -rad * ((start) ? 1.5 : ((end) ? 0 : 1)));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt3, pnt2, pnt4, Color._fromArgbColor(192, Colors.get_blue()), Dates.empty());
        index++;
    }
    index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(Math.cos(a), rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.sin(a));
        var pnt2 = Vector3d.create(Math.cos(a), -rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.sin(a));
        var pnt3 = Vector3d.create(Math.cos(a + step), rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.sin(a + step));
        var pnt4 = Vector3d.create(Math.cos(a + step), -rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.sin(a + step));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt2, pnt3, pnt4, Color._fromArgbColor(192, Colors.get_green()), Dates.empty());
        index++;
    }

    // X

    index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(-rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.cos(a), Math.sin(a));
        var pnt2 = Vector3d.create(rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.cos(a), Math.sin(a));
        var pnt3 = Vector3d.create(-rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.cos(a + step), Math.sin(a + step));
        var pnt4 = Vector3d.create(rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.cos(a + step), Math.sin(a + step));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt3, pnt2, pnt4, Colors.get_red(), Dates.empty());
        index++;
    }

    // Y

    index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(Math.cos(a), Math.sin(a), -rad * ((start) ? 0 : ((end) ? 1.5 : 1)));
        var pnt2 = Vector3d.create(Math.cos(a), Math.sin(a), rad * ((start) ? 0 : ((end) ? 1.5 : 1)));
        var pnt3 = Vector3d.create(Math.cos(a + step), Math.sin(a + step), -rad * ((start) ? 1.5 : ((end) ? 0 : 1)));
        var pnt4 = Vector3d.create(Math.cos(a + step), Math.sin(a + step), rad * ((start) ? 1.5 : ((end) ? 0 : 1)));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt3, pnt2, pnt4, Colors.get_blue(), Dates.empty());
        index++;
    }

    // Z

    index = 0;
    for (var a = 0; a < twoPi; a += step) {
        var start = !(index % 10);
        var end = !((index + 1) % 10);
        var pnt1 = Vector3d.create(Math.cos(a), -rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.sin(a));
        var pnt2 = Vector3d.create(Math.cos(a), rad * ((start) ? 0 : ((end) ? 1.5 : 1)), Math.sin(a));
        var pnt3 = Vector3d.create(Math.cos(a + step), -rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.sin(a + step));
        var pnt4 = Vector3d.create(Math.cos(a + step), rad * ((start) ? 1.5 : ((end) ? 0 : 1)), Math.sin(a + step));
        Object3dLayer._rotateUi$1.addQuad(pnt1, pnt2, pnt3, pnt4, Colors.get_green(), Dates.empty());
        index++;
    }
};

var Object3dLayer$ = {
    getPrimaryUI: function () {
        if (this._primaryUI$1 == null) {
            this._primaryUI$1 = new Object3dLayerUI(this);
        }
        return this._primaryUI$1;
    },

    get_flipV: function () {
        return this._flipV$1;
    },

    set_flipV: function (value) {
        if (this._flipV$1 !== value) {
            this._flipV$1 = value;
            if (this.object3d != null) {
                this.object3d.flipV = this._flipV$1;
                this.object3d._reload();
            }
            this.version++;
        }
        return value;
    },

    get_flipHandedness: function () {
        return this._flipHandedness$1;
    },

    set_flipHandedness: function (value) {
        if (this._flipHandedness$1 !== value) {
            this._flipHandedness$1 = value;
            if (this.object3d != null) {
                this.object3d.flipHandedness = this._flipHandedness$1;
                this.object3d._reload();
            }
            this.version++;
        }
        return value;
    },

    get_smooth: function () {
        return this._smooth$1;
    },

    set_smooth: function (value) {
        if (this._smooth$1 !== value) {
            this._smooth$1 = value;
            if (this.object3d != null) {
                this.object3d.smooth = this._smooth$1;
                this.object3d._reload();
            }
            this.version++;
        }
        return value;
    },

    get_twoSidedGeometry: function () {
        return this._twoSidedGeometry$1;
    },

    set_twoSidedGeometry: function (value) {
        if (this._twoSidedGeometry$1 !== value) {
            this._twoSidedGeometry$1 = value;
            this.version++;
        }
        return value;
    },

    get_heading: function () {
        return this._heading$1;
    },

    set_heading: function (value) {
        if (this._heading$1 !== value) {
            this.version++;
            this._heading$1 = value;
        }
        return value;
    },

    get_pitch: function () {
        return this._pitch$1;
    },

    set_pitch: function (value) {
        if (this._pitch$1 !== value) {
            this.version++;
            this._pitch$1 = value;
        }
        return value;
    },

    get_roll: function () {
        return this._roll$1;
    },

    set_roll: function (value) {
        if (this._roll$1 !== value) {
            this.version++;
            this._roll$1 = value;
        }
        return value;
    },

    get_scale: function () {
        return this._scale$1;
    },

    set_scale: function (value) {
        if (this._scale$1 !== value) {
            this.version++;
            this._scale$1 = value;
        }
        return value;
    },

    get_translate: function () {
        return this._translate$1;
    },

    set_translate: function (value) {
        if (this._translate$1 !== value) {
            this.version++;
            this._translate$1 = value;
        }
        return value;
    },

    get_lightID: function () {
        return this._lightID$1;
    },

    set_lightID: function (value) {
        this._lightID$1 = value;
        return value;
    },

    cleanUp: function () {
        this._dirty$1 = true;
    },

    colorChanged: function () {
        if (this.object3d != null) {
            this.object3d.color = this.get_color();
        }
    },

    writeLayerProperties: function (xmlWriter) {
        xmlWriter._writeAttributeString('FlipV', this.get_flipV().toString());
        xmlWriter._writeAttributeString('FlipHandedness', this.get_flipHandedness().toString());
        xmlWriter._writeAttributeString('Smooth', this.get_smooth().toString());
        xmlWriter._writeAttributeString('TwoSidedGeometry', this.get_twoSidedGeometry().toString());
        xmlWriter._writeAttributeString('Heading', this.get_heading().toString());
        xmlWriter._writeAttributeString('Pitch', this.get_pitch().toString());
        xmlWriter._writeAttributeString('Roll', this.get_roll().toString());
        xmlWriter._writeAttributeString('Scale', this.get_scale().toString());
        xmlWriter._writeAttributeString('Translate', this.get_translate().toString());
        xmlWriter._writeAttributeString('LightID', this.get_lightID().toString());
        xmlWriter._writeAttributeString('Obj', this.objType.toString());
    },

    getParams: function () {
        var paramList = new Array(14);
        paramList[0] = this._heading$1;
        paramList[1] = this._pitch$1;
        paramList[2] = this._roll$1;
        paramList[3] = this._scale$1.x;
        paramList[4] = this._scale$1.y;
        paramList[5] = this._scale$1.z;
        paramList[6] = this._translate$1.x;
        paramList[7] = this._translate$1.y;
        paramList[8] = this._translate$1.z;
        paramList[9] = this.get_color().r / 255;
        paramList[10] = this.get_color().g / 255;
        paramList[11] = this.get_color().b / 255;
        paramList[12] = this.get_color().a / 255;
        paramList[13] = this.get_opacity();
        return paramList;
    },

    getParamNames: function () {
        return ['Heading', 'Pitch', 'Roll', 'Scale.X', 'Scale.Y', 'Scale.Z', 'Translate.X', 'Translate.Y', 'Translate.Z', 'Colors.Red', 'Colors.Green', 'Colors.Blue', 'Colors.Alpha', 'Opacity'];
    },

    setParams: function (paramList) {
        if (paramList.length === 14) {
            this._heading$1 = paramList[0];
            this._pitch$1 = paramList[1];
            this._roll$1 = paramList[2];
            this._scale$1.x = paramList[3];
            this._scale$1.y = paramList[4];
            this._scale$1.z = paramList[5];
            this._translate$1.x = paramList[6];
            this._translate$1.y = paramList[7];
            this._translate$1.z = paramList[8];
            this.set_opacity(paramList[13]);
            var color = Color.fromArgb(ss.truncate((paramList[12] * 255)), ss.truncate((paramList[9] * 255)), ss.truncate((paramList[10] * 255)), ss.truncate((paramList[11] * 255)));
            this.set_color(color);
        }
    },

    add_propertiesChanged: function (value) {
        this.__propertiesChanged$1 = ss.bindAdd(this.__propertiesChanged$1, value);
    },

    remove_propertiesChanged: function (value) {
        this.__propertiesChanged$1 = ss.bindSub(this.__propertiesChanged$1, value);
    },

    fireChanged: function () {
        if (this.__propertiesChanged$1 != null) {
            this.__propertiesChanged$1(this, new ss.EventArgs());
        }
    },

    getEditUI: function () {
        return ss.safeCast(this, IUiController);
    },

    initializeFromXml: function (node) {
        this.set_flipV(ss.boolean(node.attributes.getNamedItem('FlipV').nodeValue));
        if (node.attributes.getNamedItem('FlipHandedness') != null) {
            this.set_flipHandedness(ss.boolean(node.attributes.getNamedItem('FlipHandedness').nodeValue));
        } else {
            this.set_flipHandedness(false);
        }
        if (node.attributes.getNamedItem('Smooth') != null) {
            this.set_smooth(ss.boolean(node.attributes.getNamedItem('Smooth').nodeValue));
        } else {
            this.set_smooth(true);
        }
        if (node.attributes.getNamedItem('TwoSidedGeometry') != null) {
            this.set_twoSidedGeometry(ss.boolean(node.attributes.getNamedItem('TwoSidedGeometry').nodeValue));
        } else {
            this.set_twoSidedGeometry(false);
        }
        if (node.attributes.getNamedItem('Obj') != null) {
            this.objType = ss.boolean(node.attributes.getNamedItem('Obj').nodeValue);
        } else {
            this.objType = false;
        }
        this.set_heading(parseFloat(node.attributes.getNamedItem('Heading').nodeValue));
        this.set_pitch(parseFloat(node.attributes.getNamedItem('Pitch').nodeValue));
        this.set_roll(parseFloat(node.attributes.getNamedItem('Roll').nodeValue));
        this.set_scale(Vector3d.parse(node.attributes.getNamedItem('Scale').nodeValue));
        this.set_translate(Vector3d.parse(node.attributes.getNamedItem('Translate').nodeValue));
        if (node.attributes.getNamedItem('LightID') != null) {
            this.set_lightID(parseInt(node.attributes.getNamedItem('LightID').nodeValue));
        }
    },

    draw: function (renderContext, opacity, flat) {
        var oldWorld = renderContext.get_world();
        var rotation = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(Matrix3d._rotationZ(-this._roll$1 / 180 * Math.PI), Matrix3d._rotationX(-this._pitch$1 / 180 * Math.PI)), Matrix3d._rotationY(this._heading$1 / 180 * Math.PI));
        renderContext.set_world(Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(rotation, Matrix3d._scaling(this._scale$1.x, this._scale$1.y, this._scale$1.z)), Matrix3d.translation(this._translate$1)), oldWorld));
        renderContext.set_twoSidedLighting(this.get_twoSidedGeometry());
        BasePlanets.drawPointPlanet(renderContext, new Vector3d(), 1, Colors.get_red(), false);
        if (this._lightID$1 > 0) {
            // draw light
        } else {
            if (this.object3d != null) {
                this.object3d.color = this.get_color();
                this.object3d.render(renderContext, opacity * this.get_opacity());
            }
        }

        // todo enable edit UI

        renderContext.set_twoSidedLighting(false);
        renderContext.set_world(oldWorld);
        return true;
    },

    addFilesToCabinet: function (fc) {
        // todo: implement
    },

    loadData: function (doc, filename) {
        if (ss.endsWith(filename.toLowerCase(), '.obj')) {
            this.objType = true;
        }
        if (!this._lightID$1) {
            if (this.objType) {
                this.object3d = new Object3d(doc, ss.replaceString(filename, '.txt', '.obj'), this.get_flipV(), this._flipHandedness$1, true, this.get_color());
            }
            else {
                this.object3d = new Object3d(doc, ss.replaceString(filename, '.txt', '.3ds'), this.get_flipV(), this._flipHandedness$1, true, this.get_color());
            }
        }
    },

    pointToView: function (pnt) {
        var clientHeight = globalRenderContext.height;
        var clientWidth = globalRenderContext.width;
        var viewWidth = (globalRenderContext.width / globalRenderContext.height) * 1116;
        var x = ((pnt.x) / (clientWidth) * viewWidth) - ((viewWidth - 1920) / 2);
        var y = (pnt.y) / clientHeight * 1116;
        return Vector2d.create(x, y);
    },

    render: function (renderEngine) {
        this._showEditUi$1 = true;
        return;
    },

    preRender: function (renderEngine) {
        this._showEditUi$1 = true;
        return;
    },

    mouseDown: function (sender, e) {
        var location = this.pointToView(Vector2d.create(e.offsetX, e.offsetY));
        this._pntDown$1 = location;
        var pnt = location;
        if (e.shiftKey) {
            if (Vector2d.subtract(pnt, this._xHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 10;
                this._valueOnDown$1 = this._scale$1.x;
                return true;
            }
            if (Vector2d.subtract(pnt, this._yHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 10;
                this._valueOnDown$1 = this._scale$1.y;
                return true;
            }
            if (Vector2d.subtract(pnt, this._zHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 10;
                this._valueOnDown$1 = this._scale$1.z;
                return true;
            }
        } else {
            if (Vector2d.subtract(pnt, this._xHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 1;
                this._valueOnDown$1 = this._translate$1.x;
                return true;
            }
            if (Vector2d.subtract(pnt, this._yHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 2;
                this._valueOnDown$1 = this._translate$1.y;
                return true;
            }
            if (Vector2d.subtract(pnt, this._zHandle$1).get_length() < this._hitDist$1) {
                this._dragMode$1 = 3;
                this._valueOnDown$1 = this._translate$1.z;
                return true;
            }
        }
        for (var i = 0; i < this._hprHandles$1.length; i++) {
            if (Vector2d.subtract(pnt, this._hprHandles$1[i]).get_length() < this._hitDist$1) {
                switch (i) {
                    case 0:
                        this._dragMode$1 = 4;
                        this._valueOnDown$1 = this._heading$1;
                        this._valueOnDown2$1 = this._pitch$1;
                        return true;
                    case 1:
                        this._dragMode$1 = 7;
                        this._valueOnDown$1 = this._heading$1;
                        this._valueOnDown2$1 = this._pitch$1;
                        return true;
                    case 2:
                        this._dragMode$1 = 5;
                        this._valueOnDown$1 = this._pitch$1;
                        this._valueOnDown2$1 = this._roll$1;
                        return true;
                    case 3:
                        this._dragMode$1 = 8;
                        this._valueOnDown$1 = this._pitch$1;
                        this._valueOnDown2$1 = this._roll$1;
                        return true;
                    case 4:
                        this._dragMode$1 = 6;
                        this._valueOnDown$1 = this._roll$1;
                        this._valueOnDown2$1 = this._heading$1;
                        return true;
                    case 5:
                        this._dragMode$1 = 9;
                        this._valueOnDown$1 = this._roll$1;
                        this._valueOnDown2$1 = this._heading$1;
                        return true;
                    default:
                        break;
                }
            }
        }
        return false;
    },

    mouseUp: function (sender, e) {
        if (!!this._dragMode$1) {
            this._dragMode$1 = 0;
            this._lockPreferedAxis$1 = false;
            return true;
        }
        return false;
    },

    mouseMove: function (sender, e) {
        var location = this.pointToView(Vector2d.create(e.offsetX, e.offsetY));
        if (!!this._dragMode$1) {
            var dist = 0;
            var distX = location.x - this._pntDown$1.x;
            var distY = -(location.y - this._pntDown$1.y);
            if (this._lockPreferedAxis$1) {
                if (this._preferY$1) {
                    dist = distY;
                    this._preferY$1 = true;
                    Cursor.set_current(Cursors.get_sizeNS());
                }
                else {
                    dist = distX;
                    this._preferY$1 = false;
                    Cursor.set_current(Cursors.get_sizeWE());
                }
            }
            else {
                if (Math.abs(distX) > Math.abs(distY)) {
                    dist = distX;
                    this._preferY$1 = false;
                }
                else {
                    dist = distY;
                    this._preferY$1 = true;
                }
                if (dist > 5) {
                    this._lockPreferedAxis$1 = true;
                }
            }
            switch (this._dragMode$1) {
                case 0:
                    break;
                case 1:
                    this._translate$1.x = this._valueOnDown$1 + (12 * this._uiScale$1 * (dist / globalRenderContext.width));
                    break;
                case 2:
                    this._translate$1.y = this._valueOnDown$1 + (12 * this._uiScale$1 * (dist / globalRenderContext.width));
                    break;
                case 3:
                    this._translate$1.z = this._valueOnDown$1 + (12 * this._uiScale$1 * (dist / globalRenderContext.width));
                    break;
                case 4:
                    this._heading$1 = this._valueOnDown$1 - distX / 4;
                    this._pitch$1 = this._valueOnDown2$1 + distY / 4;
                    break;
                case 5:
                    this._pitch$1 = this._valueOnDown$1 + distY / 4;
                    this._roll$1 = this._valueOnDown2$1 - distX / 4;
                    break;
                case 6:
                    this._roll$1 = this._valueOnDown$1 + distY / 4;
                    this._heading$1 = this._valueOnDown2$1 - distX / 4;
                    break;
                case 7:
                    this._heading$1 = this._valueOnDown$1 - distX / 4;
                    this._pitch$1 = this._valueOnDown2$1 - distY / 4;
                    break;
                case 8:
                    this._pitch$1 = this._valueOnDown$1 + distY / 4;
                    this._roll$1 = this._valueOnDown2$1 + distX / 4;
                    break;
                case 9:
                    this._roll$1 = this._valueOnDown$1 - distY / 4;
                    this._heading$1 = this._valueOnDown2$1 - distX / 4;
                    break;
                case 10:
                    this._scale$1.x = this._scale$1.y = this._scale$1.z = this._valueOnDown$1 * Math.pow(2, (dist / 100));
                    break;
                default:
                    break;
            }
            this.fireChanged();
            return true;
        } else {
            var pnt = location;
            if (Vector2d.subtract(pnt, this._xHandle$1).get_length() < this._hitDist$1) {
                Cursor.set_current(Cursors.get_sizeAll());
                return true;
            }
            if (Vector2d.subtract(pnt, this._yHandle$1).get_length() < this._hitDist$1) {
                Cursor.set_current(Cursors.get_sizeAll());
                return true;
            }
            if (Vector2d.subtract(pnt, this._zHandle$1).get_length() < this._hitDist$1) {
                Cursor.set_current(Cursors.get_sizeAll());
                return true;
            }
            for (var i = 0; i < this._hprHandles$1.length; i++) {
                if (Vector2d.subtract(pnt, this._hprHandles$1[i]).get_length() < this._hitDist$1) {
                    Cursor.set_current(Cursors.get_sizeAll());
                    return true;
                }
            }
        }
        return false;
    },

    mouseClick: function (sender, e) {
        return false;
    },

    click: function (sender, e) {
        return false;
    },

    mouseDoubleClick: function (sender, e) {
        return false;
    },

    keyDown: function (sender, e) {
        return false;
    },

    keyUp: function (sender, e) {
        return false;
    },

    hover: function (pnt) {
        return false;
    }
};

registerType("Object3dLayer", [Object3dLayer, Object3dLayer$, Layer, IUiController]);


// wwtlib.Group

export function Group() {
    this.startIndex = 0;
    this.indexCount = 0;
    this.materialIndex = 0;
}

var Group$ = {};

registerType("Group", [Group, Group$, null]);

// wwtlib.Mesh

export function Mesh() {
    this.boundingSphere = new SphereHull();
}

Mesh.create = function (vertices, indices) {
    var mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.indices = indices;
    var points = new Array(vertices.length);
    for (var i = 0; i < vertices.length; ++i) {
        points[i] = vertices[i].get_position();
    }
    mesh.boundingSphere = ConvexHull.findEnclosingSphereFast(points);
    return mesh;
};

Mesh.createTangent = function (vertices, indices) {
    var mesh = new Mesh();
    mesh.tangentVertices = vertices;
    mesh.indices = indices;
    var points = new Array(mesh.tangentVertices.length);
    for (var i = 0; i < mesh.tangentVertices.length; ++i) {
        points[i] = mesh.tangentVertices[i].get_position();
    }
    mesh.boundingSphere = ConvexHull.findEnclosingSphereFast(points);
    return mesh;
};

var Mesh$ = {
    dispose: function () {
        if (this.vertexBuffer != null) {
            this.vertexBuffer.dispose();
            this.vertexBuffer = null;
        }
        if (this.tangentVertexBuffer != null) {
            this.tangentVertexBuffer.dispose();
            this.tangentVertexBuffer = null;
        }
        if (this.indexBuffer != null) {
            this.indexBuffer.dispose();
            this.indexBuffer = null;
        }
    },

    setObjects: function (objects) {
        this._objects = objects;
    },

    // Convert the vertex data to a GPU vertex buffer
    commitToDevice: function () {
        if (this.vertices != null) {
            this.vertexBuffer = PositionNormalTexturedVertexBuffer.create(this.vertices);
        } else if (this.tangentVertices != null) {
            this.tangentVertexBuffer = PositionNormalTexturedTangentVertexBuffer.create(this.tangentVertices);
        }
        this.indexBuffer = new IndexBuffer(new Uint32Array(this.indices));
    },

    beginDrawing: function (renderContext) {
        if (this.vertexBuffer != null) {
            renderContext._setVertexBuffer(this.vertexBuffer);
        } else if (this.tangentVertexBuffer != null) {
            renderContext._setVertexBuffer(this.tangentVertexBuffer);
        }
        if (this.indexBuffer != null) {
            renderContext._setIndexBuffer(this.indexBuffer);
        }
    },

    drawSubset: function (renderContext, materialIndex) {
        if (this.indexBuffer == null || this._objects == null) {
            return;
        }
        this.drawHierarchy(this._objects, materialIndex, renderContext, 0);
    },

    drawHierarchy: function (nodes, materialIndex, renderContext, depth) {
        if (depth > 1212) {
            return;
        }
        var $enum1 = ss.enumerate(nodes);
        while ($enum1.moveNext()) {
            var node = $enum1.current;
            if (node.drawGroup != null && node.enabled) {
                var $enum2 = ss.enumerate(node.drawGroup);
                while ($enum2.moveNext()) {
                    var group = $enum2.current;
                    if (group.materialIndex === materialIndex) {
                        renderContext.gl.drawElements(WEBGL.TRIANGLES, group.indexCount, WEBGL.UNSIGNED_INT, group.startIndex * 4);
                    }
                }
            }
            this.drawHierarchy(node.children, materialIndex, renderContext, depth + 1);
        }
    },

    get_objects: function () {
        return this._objects;
    },

    set_objects: function (value) {
        this._objects = value;
        return value;
    }
};

registerType("Mesh", [Mesh, Mesh$, null, ss.IDisposable]);


// wwtlib.VertexPosition

export function VertexPosition() {
    this.index = 0;
}

var VertexPosition$ = {};

registerType("VertexPosition", [VertexPosition, VertexPosition$, null]);


// wwtlib.Object3d

export function Object3d(tourDoc, filename, flipV, flipHandedness, smooth, color) {
    this.flipHandedness = false;
    this.flipV = true;
    this.smooth = true;
    this._mesh = null; // Our mesh object in sysmem
    this._meshMaterials = [];
    this._meshTextures = [];
    this._meshSpecularTextures = [];
    this._meshNormalMaps = [];
    this.meshFilenames = [];
    this.color = Colors.get_white();
    this._textureCache = {};
    this._matFiles = new Array(0);
    this._matFileIndex = 0;
    this.objects = [];
    this._matLib = {};
    this._textureLib = {};
    this._tourDocument = null;
    this.issLayer = false;
    this._readyToRender = false;
    this.useCurrentAmbient = false;
    this._dirty = true;
    this.color = color;
    this.smooth = smooth;
    this.flipV = flipV;
    this.flipHandedness = flipHandedness;
    this.filename = filename;
    if (ss.endsWith(this.filename.toLowerCase(), '.obj')) {
        this._loadMeshFromObj(tourDoc, this.filename);
    }
    else {
        this._loadMeshFrom3ds(tourDoc, this.filename, 1);
    }
}

Object3d._compareVector3 = function (v0, v1) {
    if (v0.x < v1.x) {
        return -1;
    }
    else if (v0.x > v1.x) {
        return 1;
    }
    else if (v0.y < v1.y) {
        return -1;
    }
    else if (v0.y > v1.y) {
        return 1;
    }
    else if (v0.z < v1.z) {
        return -1;
    }
    else if (v0.z > v1.z) {
        return 1;
    }
    else {
        return 0;
    }
};

Object3d._compareVector = function (v0, v1) {
    if (v0.x < v1.x) {
        return -1;
    }
    else if (v0.x > v1.x) {
        return 1;
    }
    else if (v0.y < v1.y) {
        return -1;
    }
    else if (v0.y > v1.y) {
        return 1;
    }
    else {
        return 0;
    }
};

Object3d._getMaterialID = function (material, materialNames) {
    var index = 0;
    var $enum1 = ss.enumerate(materialNames);
    while ($enum1.moveNext()) {
        var mat = $enum1.current;
        if (mat === material) {
            return index;
        }
        index++;
    }
    return -1;
};

Object3d._disposeTextureList = function (textures) {
    if (textures != null) {
        for (var i = 0; i < textures.length; ++i) {
            if (textures[i] != null) {
                textures[i].dispose();
                textures[i] = null;
            }
        }
        textures.length = 0;
    }
};

var Object3d$ = {
    _reload: function () {
        if (!this.issLayer) {
            this.dispose();
            if (ss.endsWith(this.filename.toLowerCase(), '.obj')) {
                this._loadMeshFromObj(this._tourDocument, this.filename);
            }
            else {
                this._loadMeshFrom3ds(this._tourDocument, this.filename, 1);
            }
        }
    },

    // Calculate per-vertex normals by averaging face normals. Normals of adjacent faces with an
    // angle of greater than crease angle are not included in the average. CalculateVertexNormalsMerged
    // is slower than the other normal generation method, CalculateVertexNormals, but it produces better
    // results. Vertices with identical positions (bot possibly different texture coordinates) are treated
    // as the same vertex for purposes of normal calculation. This allows smooth normals across texture
    // wrap seams.
    //
    // This method returns an array of vertex normals, one for each index in the index list
    _calculateVertexNormalsMerged: function (vertexList, indexList, creaseAngleRad) {
        if (!vertexList.length) {
            return null;
        }
        var vertexCount = vertexList.length;
        var triangleCount = Math.floor(indexList.length / 3);

        // Create a list of vertices sorted by their positions. This will be used to
        // produce a list of vertices with unique positions.
        var vertexPositions = [];
        for (var vertexIndex = 0; vertexIndex < vertexList.length; ++vertexIndex) {
            var vp = new VertexPosition();
            vp.position = vertexList[vertexIndex].get_position();
            vp.index = vertexIndex;
            vertexPositions.push(vp);
        }
        vertexPositions.sort(function (v0, v1) {
            return Object3d._compareVector3(v0.position, v1.position);
        });

        // vertexMap will map a vertex index to the index of a vertex with a unique position
        var vertexMap = new Array(vertexPositions.length);
        var uniqueVertexCount = 0;
        for (var vertexIndex = 0; vertexIndex < vertexPositions.length; vertexIndex++) {
            if (!vertexIndex || !!Object3d._compareVector3(vertexPositions[vertexIndex].position, vertexPositions[vertexIndex - 1].position)) {
                ++uniqueVertexCount;
            }
            vertexMap[vertexPositions[vertexIndex].index] = uniqueVertexCount - 1;
        }
        var vertexInstanceCounts = new Array(uniqueVertexCount);
        for (var i = 0; i < uniqueVertexCount; i++) {
            vertexInstanceCounts[i] = 0;
        }
        var $enum1 = ss.enumerate(indexList);
        while ($enum1.moveNext()) {
            var vertexIndex = $enum1.current;
            var uniqueIndex = vertexMap[vertexIndex];
            vertexInstanceCounts[uniqueIndex]++;
        }

        // vertexInstances contains the list of faces each vertex is referenced in
        var vertexInstances = new Array(uniqueVertexCount);
        for (var i = 0; i < uniqueVertexCount; ++i) {
            var count = vertexInstanceCounts[i];
            if (count > 0) {
                vertexInstances[i] = new Array(count);
                for (var j = 0; j < count; j++) {
                    vertexInstances[i][j] = 0;
                }
            }
        }

        // For each vertex, record all faces which include it
        for (var i = 0; i < indexList.length; ++i) {
            var faceIndex = Math.floor(i / 3);
            var uniqueIndex = vertexMap[indexList[i]];
            vertexInstances[uniqueIndex][--vertexInstanceCounts[uniqueIndex]] = faceIndex;
        }

        // At this point, vertexInstanceCounts should contain nothing but zeroes

        // Compute normals for all faces
        var faceNormals = new Array(triangleCount);
        for (var i = 0; i < triangleCount; ++i) {
            // The face normal is just the cross product of the two edge vectors
            var i0 = indexList[i * 3 + 0];
            var i1 = indexList[i * 3 + 1];
            var i2 = indexList[i * 3 + 2];
            var edge0 = Vector3d.subtractVectors(vertexList[i1].get_position(), vertexList[i0].get_position());
            var edge1 = Vector3d.subtractVectors(vertexList[i2].get_position(), vertexList[i1].get_position());
            faceNormals[i] = Vector3d.cross(edge0, edge1);
            faceNormals[i].normalize();
        }

        // Finally, average the face normals
        var newVertexCount = triangleCount * 3;
        var vertexNormals = new Array(newVertexCount);
        var cosCreaseAngle = Math.min(0.9999, Math.cos(creaseAngleRad));
        for (var i = 0; i < newVertexCount; ++i) {
            var vertexIndex = indexList[i];
            var uniqueIndex = vertexMap[vertexIndex];
            var faceNormal = faceNormals[Math.floor(i / 3)];
            var sum = new Vector3d();
            var $enum2 = ss.enumerate(vertexInstances[uniqueIndex]);
            while ($enum2.moveNext()) {
                var faceIndex = $enum2.current;
                var n = faceNormals[faceIndex];
                if (Vector3d.dot(faceNormal, n) > cosCreaseAngle) {
                    sum.add(n);
                }
            }
            vertexNormals[i] = sum;
            vertexNormals[i].normalize();
        }
        return vertexNormals;
    },

    // Calculate tangent vectors at each vertex. The 'face tangent' is a direction in the plane of the
    // triangle and parallel to the direction of increasing tex coord u, i.e. the partial derivative
    // with respect to u of the triangle's plane equation expressed in terms of the texture coordinate
    // (u, v). Partial derivatives of the triangles containing a vertex are averaged to compute the
    // vertex tangent. Faces are not included in the when the angle formed with the test face is
    // greater than the crease angle, or when the texture texture coordinates are not continuous.
    //
    // This method returns an array of vertex normals, one for each index in the index list
    _calculateVertexTangents: function (vertexList, indexList, creaseAngleRad) {
        if (!vertexList.length) {
            return null;
        }
        var vertexCount = vertexList.length;
        var triangleCount = Math.floor(indexList.length / 3);

        // Create a list of vertices sorted by their positions. This will be used to
        // produce a list of vertices with unique positions.
        var vertexPositions = [];
        for (var vertexIndex = 0; vertexIndex < vertexList.length; ++vertexIndex) {
            var vp = new VertexPosition();
            vp.position = vertexList[vertexIndex].get_position();
            vp.index = vertexIndex;
            vertexPositions.push(vp);
        }
        vertexPositions.sort(function (v0, v1) {
            return Object3d._compareVector3(v0.position, v1.position);
        });

        // vertexMap will map a vertex index to the index of a vertex with a unique position
        var vertexMap = new Array(vertexPositions.length);
        var uniqueVertexCount = 0;
        for (var vertexIndex = 0; vertexIndex < vertexPositions.length; vertexIndex++) {
            if (!vertexIndex || !!Object3d._compareVector3(vertexPositions[vertexIndex].position, vertexPositions[vertexIndex - 1].position)) {
                ++uniqueVertexCount;
            }
            vertexMap[vertexPositions[vertexIndex].index] = (uniqueVertexCount - 1);
        }
        var vertexInstanceCounts = new Array(uniqueVertexCount);
        for (var i = 0; i < uniqueVertexCount; i++) {
            vertexInstanceCounts[i] = 0;
        }
        var $enum1 = ss.enumerate(indexList);
        while ($enum1.moveNext()) {
            var vertexIndex = $enum1.current;
            var uniqueIndex = vertexMap[vertexIndex];
            vertexInstanceCounts[uniqueIndex]++;
        }

        // vertexInstances contains the list of faces each vertex is referenced in
        var vertexInstances = new Array(uniqueVertexCount);
        for (var i = 0; i < uniqueVertexCount; ++i) {
            var count = vertexInstanceCounts[i];
            if (count > 0) {
                vertexInstances[i] = new Array(count);
                for (var j = 0; j < count; j++) {
                    vertexInstances[i][j] = 0;
                }
            }
        }

        // For each vertex, record all faces which include it
        for (var i = 0; i < indexList.length; ++i) {
            var faceIndex = Math.floor(i / 3);
            var uniqueIndex = vertexMap[indexList[i]];
            vertexInstances[uniqueIndex][--vertexInstanceCounts[uniqueIndex]] = faceIndex;
        }

        // At this point, vertexInstanceCounts should contain nothing but zeroes

        // Compute partial derivatives for all faces
        var partials = new Array(triangleCount);
        for (var i = 0; i < triangleCount; ++i) {
            var v0 = vertexList[indexList[i * 3 + 0]];
            var v1 = vertexList[indexList[i * 3 + 1]];
            var v2 = vertexList[indexList[i * 3 + 2]];
            var edge0 = Vector3d.subtractVectors(v1.get_position(), v0.get_position());
            var edge1 = Vector3d.subtractVectors(v2.get_position(), v0.get_position());
            var m00 = v1.tu - v0.tu;
            var m01 = v1.tv - v0.tv;
            var m10 = v2.tu - v0.tu;
            var m11 = v2.tv - v0.tv;
            var determinant = m00 * m11 - m01 * m10;
            if (Math.abs(determinant) < 1E-06) {
                if (edge0.lengthSq() > 0) {
                    // No unique vector; just select one of the edges
                    partials[i] = edge0;
                    partials[i].normalize();
                }
                else {
                    // Degenerate edge; just use the unit x vector
                    partials[i] = Vector3d.create(1, 0, 0);
                }
            }
            else {
                // Matrix n is the inverse of m
                var invDeterminant = 1 / determinant;
                var n00 = m11 * invDeterminant;
                var n01 = -m01 * invDeterminant;
                var n10 = -m10 * invDeterminant;
                var n11 = m00 * invDeterminant;
                partials[i] = Vector3d.addVectors(Vector3d.multiplyScalar(edge0, n00), Vector3d.multiplyScalar(edge1, n01));
                partials[i].normalize();
            }
        }

        // Finally, average the partial derivatives
        var newVertexCount = triangleCount * 3;
        var tangents = new Array(newVertexCount);
        var cosCreaseAngle = Math.min(0.9999, Math.cos(creaseAngleRad));
        for (var i = 0; i < newVertexCount; ++i) {
            var vertexIndex = indexList[i];
            var uniqueIndex = vertexMap[vertexIndex];
            var du = partials[Math.floor(i / 3)];
            var sum = new Vector3d();
            var $enum2 = ss.enumerate(vertexInstances[uniqueIndex]);
            while ($enum2.moveNext()) {
                var faceIndex = $enum2.current;
                var T = partials[faceIndex];
                if (Vector3d.dot(du, T) > cosCreaseAngle) {
                    sum.add(T);
                }
            }
            var N = vertexList[vertexIndex].get_normal();

            // Make the tangent orthogonal to the vertex normal
            tangents[i] = Vector3d.subtractVectors(sum, Vector3d.multiplyScalar(N, Vector3d.dot(N, sum)));
            tangents[i].normalize();
        }
        return tangents;
    },

    // Calculate per-vertex normals by averaging face normals. Normals of adjacent faces with an
    // angle of greater than crease angle are not included in the average.
    //
    // This method returns an array of vertex normals, one for each index in the index list
    _calculateVertexNormals: function (vertexList, indexList, creaseAngleRad) {
        var vertexCount = vertexList.length;
        var triangleCount = Math.floor(indexList.length / 3);

        // vertexInstanceCounts contains the number of times each vertex is referenced in the mesh
        var vertexInstanceCounts = new Array(vertexCount);
        var $enum1 = ss.enumerate(indexList);
        while ($enum1.moveNext()) {
            var vertexIndex = $enum1.current;
            vertexInstanceCounts[vertexIndex]++;
        }

        // vertexInstances contains the list of faces each vertex is referenced in
        var vertexInstances = new Array(vertexCount);
        for (var i = 0; i < vertexCount; ++i) {
            var count = vertexInstanceCounts[i];
            if (count > 0) {
                vertexInstances[i] = new Array(count);
            }
        }

        // For each vertex, record all faces which include it
        for (var i = 0; i < indexList.length; ++i) {
            var faceIndex = Math.floor(i / 3);
            var vertexIndex = indexList[i];
            vertexInstances[vertexIndex][--vertexInstanceCounts[vertexIndex]] = faceIndex;
        }

        // At this point, vertexInstanceCounts should contain nothing but zeroes

        // Compute normals for all faces
        var faceNormals = new Array(triangleCount);
        for (var i = 0; i < triangleCount; ++i) {
            // The face normal is just the cross product of the two edge vectors
            var i0 = indexList[i * 3 + 0];
            var i1 = indexList[i * 3 + 1];
            var i2 = indexList[i * 3 + 2];
            var edge0 = Vector3d.subtractVectors(vertexList[i1].get_position(), vertexList[i0].get_position());
            var edge1 = Vector3d.subtractVectors(vertexList[i2].get_position(), vertexList[i1].get_position());
            faceNormals[i] = Vector3d.cross(edge0, edge1);
            faceNormals[i].normalize();
        }

        // Finally, average the face normals
        var newVertexCount = triangleCount * 3;
        var vertexNormals = new Array(newVertexCount);
        var cosCreaseAngle = Math.min(0.9999, Math.cos(creaseAngleRad));
        for (var i = 0; i < newVertexCount; ++i) {
            var vertexIndex = indexList[i];
            var faceNormal = faceNormals[Math.floor(i / 3)];
            var sum = new Vector3d();
            var $enum2 = ss.enumerate(vertexInstances[vertexIndex]);
            while ($enum2.moveNext()) {
                var faceIndex = $enum2.current;
                var n = faceNormals[faceIndex];
                if (Vector3d.dot(faceNormal, n) > cosCreaseAngle) {
                    sum.add(n);
                }
            }
            vertexNormals[i] = sum;
            vertexNormals[i].normalize();
        }
        return vertexNormals;
    },

    // Add textures to ensure that we have as many textures as [...]
    _addMaterial: function (material) {
        this._meshMaterials.push(material);
        while (this._meshTextures.length < this._meshMaterials.length) {
            this._meshTextures.push(null);
        }
        while (this._meshSpecularTextures.length < this._meshMaterials.length) {
            this._meshSpecularTextures.push(null);
        }
        while (this._meshNormalMaps.length < this._meshMaterials.length) {
            this._meshNormalMaps.push(null);
        }
    },

    // Load a color chunk from a 3ds file`
    // Colors may be stored in a 3ds file either as 3 floats or 3 bytes
    _loadColorChunk: function (br) {
        var chunkID = br.readUInt16();
        var chunkLength = br.readUInt32();
        var color = Colors.get_black();
        if ((chunkID === 16 || chunkID === 19) && chunkLength === 18) {
            // Need to guard against values outside of [0, 1], otherwise Colors.FromArgb
            // will throw an exception.
            var r = Math.max(0, Math.min(1, br.readSingle()));
            var g = Math.max(0, Math.min(1, br.readSingle()));
            var b = Math.max(0, Math.min(1, br.readSingle()));
            color = Color.fromArgb(255, ss.truncate((255 * r)), ss.truncate((255 * g)), ss.truncate((255 * b)));
        } else if ((chunkID === 17 || chunkID === 18) && chunkLength === 9) {
            color = Color.fromArgb(255, br.readByte(), br.readByte(), br.readByte());
        } else {
            // Unknown color block; ignore it
            br.readBytes(chunkLength - 6);
        }
        return color;
    },

    // Load a percentage chunk from a 3ds file
    // A percentage may be stored as either a float or a 16-bit integer
    _loadPercentageChunk: function (br) {
        var chunkID = br.readUInt16();
        var chunkLength = br.readUInt32();
        var percentage = 0;
        if (chunkID === 48 && chunkLength === 8) {
            percentage = br.readUInt16();
        } else if (chunkID === 49 && chunkLength === 10) {
            percentage = br.readSingle();
        } else {
            // Unknown percentage block; ignore it
            br.readBytes(chunkLength - 6);
        }
        return percentage;
    },

    _loadMeshFromObj: function (doc, filename) {
        var $this = this;

        this.filename = filename;
        this._tourDocument = doc;
        var blob = doc.getFileBlob(filename);
        var chunck = new FileReader();
        chunck.onloadend = function (e) {
            $this._matFiles = $this._readObjMaterialsFromBin(ss.safeCast(chunck.result, String));
            $this._matFileIndex = 0;

            // pass data to LoadMatLib. It will chain load all the material
            // files, then load the obj from this data - hack for having no
            // synchronous blob reading in javascript
            $this._loadMatLib(ss.safeCast(chunck.result, String));
        };
        chunck.readAsText(blob);
    },

    _readObjMaterialsFromBin: function (data) {
        var matFiles = [];
        var lines = data.split('\n');
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var lineraw = $enum1.current;
            var line = ss.replaceString(lineraw, '  ', ' ');
            var parts = ss.trim(line).split(' ');
            if (parts.length > 0) {
                switch (parts[0]) {
                    case 'mtllib':
                        var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                        var matFile = path + parts[1];
                        matFiles.push(matFile);
                        break;
                }
            }
        }
        return matFiles;
    },

    _readObjFromBin: function (data) {
        var objectFound = false;
        var objects = [];
        var currentObject = new ObjectNode();
        currentObject.name = 'Default';
        var triangleCount = 0;
        var vertexCount = 0;
        var vertexList = [];
        var vertList = [];
        var normList = [];
        var uvList = [];
        vertList.push(new Vector3d());
        normList.push(new Vector3d());
        uvList.push(new Vector2d());
        var indexList = [];
        var attribList = [];
        var applyLists = [];
        var applyListsIndex = [];
        var materialNames = [];
        var currentMaterialIndex = -1;
        var currentMaterial = new Material();
        var currentGroup = new Group();
        var currentIndex = 0;

        // initialize the default material
        currentMaterial = new Material();
        currentMaterial.diffuse = this.color;
        currentMaterial.ambient = this.color;
        currentMaterial.specular = Colors.get_white();
        currentMaterial.specularSharpness = 30;
        currentMaterial.opacity = 1;
        currentMaterial.isDefault = true;

        // initialize the group
        currentGroup.startIndex = 0;
        currentGroup.indexCount = 0;
        currentGroup.materialIndex = 0;
        var lines = data.split('\n');
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var lineraw = $enum1.current;
            var line = ss.replaceString(lineraw, '  ', ' ');
            var parts = ss.trim(line).split(' ');
            if (parts.length > 0) {
                switch (parts[0]) {
                    case 'mtllib':
                        // We have to pre-load these now in JavaScript, since we
                        // can't synchronously load the file and we need file
                        // contents to interpret the rest of this file
                        break;
                    case 'usemtl':
                        var materialName = parts[1];
                        if (ss.keyExists(this._matLib, materialName)) {
                            if (currentMaterialIndex === -1 && currentIndex > 0) {
                                this._addMaterial(currentMaterial);
                                currentMaterialIndex++;
                            }
                            if (currentMaterialIndex > -1) {
                                currentGroup.indexCount = currentIndex - currentGroup.startIndex;
                                currentObject.drawGroup.push(currentGroup);
                            }
                            currentMaterialIndex++;
                            if (ss.keyExists(this._matLib, materialName)) {
                                currentMaterial = this._matLib[materialName];
                                if (ss.keyExists(this._textureLib, materialName)) {
                                    try {
                                        if (!ss.keyExists(this._textureCache, this._textureLib[materialName])) {
                                            var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                                            var tex = this._tourDocument.getCachedTexture2d(path + this._textureLib[materialName]);
                                            if (tex != null) {
                                                this.meshFilenames.push(this._textureLib[materialName]);
                                                this._textureCache[this._textureLib[materialName]] = tex;
                                            }
                                        }
                                        this._meshTextures.push(this._textureCache[this._textureLib[materialName]]);
                                    }
                                    catch ($e2) {
                                    }
                                }
                                this._addMaterial(currentMaterial);
                                currentGroup = new Group();
                                currentGroup.startIndex = currentIndex;
                                currentGroup.indexCount = 0;
                                currentGroup.materialIndex = currentMaterialIndex;
                            }
                        }
                        break;
                    case 'v':
                        vertexCount++;
                        if (this.flipHandedness) {
                            vertList.push(Vector3d.create(-parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                        }
                        else {
                            vertList.push(Vector3d.create(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                        }
                        break;
                    case 'vn':
                        if (this.flipHandedness) {
                            normList.push(Vector3d.create(-parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                        }
                        else {
                            normList.push(Vector3d.create(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                        }
                        break;
                    case 'vt':
                        uvList.push(Vector2d.create(parseFloat(parts[1]), (this.flipV) ? (1 - parseFloat(parts[2])) : parseFloat(parts[2])));
                        break;
                    case 'g':
                    case 'o':
                        if (objectFound) {
                            if (currentMaterialIndex > -1) {
                                currentGroup.indexCount = currentIndex - currentGroup.startIndex;
                                currentObject.drawGroup.push(currentGroup);
                                currentGroup = new Group();
                                currentGroup.startIndex = currentIndex;
                                currentGroup.indexCount = 0;
                                currentGroup.materialIndex = currentMaterialIndex;
                            }
                            currentObject = new ObjectNode();
                        }
                        objectFound = true;
                        if (parts.length > 1) {
                            currentObject.name = parts[1];
                        }
                        else {
                            currentObject.name = 'Unnamed';
                        }
                        objects.push(currentObject);
                        break;
                    case 'f':
                        var indexiesA = this._getIndexies(parts[1]);
                        var indexiesB = this._getIndexies(parts[2]);
                        var indexiesC = this._getIndexies(parts[3]);
                        vertexList.push(PositionNormalTextured.createUV(vertList[indexiesA[0]], normList[indexiesA[2]], uvList[indexiesA[1]]));
                        vertexList.push(PositionNormalTextured.createUV(vertList[indexiesB[0]], normList[indexiesB[2]], uvList[indexiesB[1]]));
                        vertexList.push(PositionNormalTextured.createUV(vertList[indexiesC[0]], normList[indexiesC[2]], uvList[indexiesC[1]]));
                        if (this.flipHandedness) {
                            indexList.push(currentIndex);
                            indexList.push(currentIndex + 2);
                            indexList.push(currentIndex + 1);
                        }
                        else {
                            indexList.push(currentIndex);
                            indexList.push(currentIndex + 1);
                            indexList.push(currentIndex + 2);
                        }
                        triangleCount++;
                        currentIndex += 3;
                        if (parts.length > 4) {
                            var partIndex = 4;
                            while (partIndex < parts.length) {
                                if (this.flipHandedness) {
                                    indexiesA = this._getIndexies(parts[1]);
                                    indexiesC = this._getIndexies(parts[partIndex]);
                                    indexiesB = this._getIndexies(parts[partIndex - 1]);
                                }
                                else {
                                    indexiesA = this._getIndexies(parts[1]);
                                    indexiesB = this._getIndexies(parts[partIndex - 1]);
                                    indexiesC = this._getIndexies(parts[partIndex]);
                                }
                                vertexList.push(PositionNormalTextured.createUV(vertList[indexiesA[0]], normList[indexiesA[2]], uvList[indexiesA[1]]));
                                vertexList.push(PositionNormalTextured.createUV(vertList[indexiesB[0]], normList[indexiesB[2]], uvList[indexiesB[1]]));
                                vertexList.push(PositionNormalTextured.createUV(vertList[indexiesC[0]], normList[indexiesC[2]], uvList[indexiesC[1]]));
                                indexList.push(currentIndex);
                                indexList.push(currentIndex + 1);
                                indexList.push(currentIndex + 2);
                                triangleCount++;
                                currentIndex += 3;
                                partIndex++;
                            }
                        }
                        break;
                }
            }
        }

        if (!objectFound) {
            // add the default object
            objects.push(currentObject);
        }

        if (currentMaterialIndex === -1 && currentIndex > 0) {
            this._addMaterial(currentMaterial);
            currentMaterialIndex++;
        }

        if (currentMaterialIndex > -1) {
            currentGroup.indexCount = (currentIndex - currentGroup.startIndex);
            currentObject.drawGroup.push(currentGroup);
        }

        if (normList.length < 2) {
            var degtorag = Math.PI / 180;
            var creaseAngleRad = ((this.smooth) ? 170 * degtorag : 45 * degtorag);
            var vertexNormals = this._calculateVertexNormalsMerged(vertexList, indexList, creaseAngleRad);
            var newVertexList = [];
            var newVertexCount = indexList.length;
            for (var vertexIndex = 0; vertexIndex < newVertexCount; ++vertexIndex) {
                var v = vertexList[indexList[vertexIndex]];
                v.set_normal(vertexNormals[vertexIndex]);
                newVertexList.push(v);
            }
            vertexList = newVertexList;
        }
        this._mesh = Mesh.create(vertexList, indexList);
        var rootDummy = new ObjectNode();
        rootDummy.name = 'Root';
        rootDummy.parent = null;
        rootDummy.level = -1;
        rootDummy.drawGroup = null;
        rootDummy.children = objects;
        this.objects = [];
        this.objects.push(rootDummy);
        this._mesh.setObjects(this.objects);
        this._mesh.commitToDevice();
        this._dirty = false;
        this._readyToRender = true;
    },

    _loadMatLib: function (data) {
        var $this = this;

        if (this._matFileIndex < this._matFiles.length) {
            var filename = this._matFiles[this._matFileIndex++];
            var blob = this._tourDocument.getFileBlob(filename);
            var chunck = new FileReader();
            chunck.onloadend = function (e) {
                $this._readMatLibFromBin(ss.safeCast(chunck.result, String));
                $this._loadMatLib(data);
            };
            chunck.readAsText(blob);
        } else {
            this._readObjFromBin(data);
        }
    },

    _readMatLibFromBin: function (data) {
        try {
            var currentMaterial = new Material();
            var materialName = '';
            this._matLib = {};
            this._textureLib = {};
            var lines = data.split('\n');
            var $enum1 = ss.enumerate(lines);
            while ($enum1.moveNext()) {
                var lineraw = $enum1.current;
                var line = lineraw;
                var parts = ss.trim(line).split(' ');
                if (parts.length > 0) {
                    switch (parts[0]) {
                        case 'newmtl':
                            if (!ss.emptyString(materialName)) {
                                this._matLib[materialName] = currentMaterial;
                            }
                            currentMaterial = new Material();
                            currentMaterial.diffuse = Colors.get_white();
                            currentMaterial.ambient = Colors.get_white();
                            currentMaterial.specular = Colors.get_black();
                            currentMaterial.specularSharpness = 30;
                            currentMaterial.opacity = 1;
                            materialName = parts[1];
                            break;
                        case 'Ka':
                            currentMaterial.ambient = Color.fromArgb(255, Math.min(parseFloat(parts[1]) * 255, 255), Math.min(parseFloat(parts[2]) * 255, 255), Math.min(parseFloat(parts[3]) * 255, 255));
                            break;
                        case 'map_Kd':
                            //ENDURE TEXTURES ARE NOT BLACK!
                            currentMaterial.diffuse = Colors.get_white();
                            var textureFilename = parts[1];
                            for (var i = 2; i < parts.length; i++) {
                                textureFilename += ' ' + parts[i];
                            }
                            var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                            textureFilename = ss.replaceString(textureFilename, '/', '\\');
                            if (textureFilename.indexOf('\\') !== -1) {
                                textureFilename = textureFilename.substring(textureFilename.lastIndexOf('\\') + 1);
                            }
                            this._textureLib[materialName] = textureFilename;
                            break;
                        case 'Kd':
                            currentMaterial.diffuse = Color.fromArgb(255, Math.min(parseFloat(parts[1]) * 255, 255), Math.min(parseFloat(parts[2]) * 255, 255), Math.min(parseFloat(parts[3]) * 255, 255));
                            break;
                        case 'Ks':
                            currentMaterial.specular = Color.fromArgb(255, Math.min(parseFloat(parts[1]) * 255, 255), Math.min(parseFloat(parts[2]) * 255, 255), Math.min(parseFloat(parts[3]) * 255, 255));
                            break;
                        case 'd':
                            // Where does this map?
                            currentMaterial.opacity = parseFloat(parts[1]);
                            break;
                        case 'Tr':
                            // Where does this map?
                            currentMaterial.opacity = 1 - parseFloat(parts[1]);
                            break;
                        case 'illum':
                            // Where does this map?
                            var illuminationMode = parseInt(parts[1]);
                            break;
                        case 'sharpness':
                            currentMaterial.specularSharpness = parseFloat(parts[1]);
                            break;
                        case 'Ns':
                            currentMaterial.specularSharpness = 1 + 2 * parseFloat(parts[1]);
                            currentMaterial.specularSharpness = Math.max(10, currentMaterial.specularSharpness);
                            break;
                    }
                }
            }
            if (!ss.emptyString(materialName)) {
                this._matLib[materialName] = currentMaterial;
            }
        }
        catch ($e2) {
        }
    },

    _getIndexies: function (data) {
        var parts = ss.trim(data).split('/');
        var indecies = new Array(3);
        if (ss.emptyString(data)) {
            return indecies;
        }
        if (parts.length > 0) {
            indecies[0] = parseInt(parts[0]);
        }
        if (parts.length > 1) {
            if (ss.emptyString(parts[1])) {
                indecies[1] = 0;
            }
            else {
                indecies[1] = parseInt(parts[1]);
            }
        }
        if (parts.length > 2) {
            indecies[2] = parseInt(parts[2]);
        }
        return indecies;
    },

    _loadMeshFrom3ds: function (doc, filename, scale) {
        var $this = this;

        this._tourDocument = doc;
        var blob = doc.getFileBlob(filename);
        var chunck = new FileReader();
        chunck.onloadend = function (e) {
            $this._read3dsFromBin(new BinaryReader(new Uint8Array(chunck.result)), scale);
        };
        chunck.readAsArrayBuffer(blob);
    },

    _read3dsFromBin: function (br, scale) {
        var i;
        var sectionID;
        var sectionLength;
        var name = '';
        var material = '';
        var triangleCount = 0;
        var vertexCount = 0;
        var vertexList = [];
        var indexList = [];
        var attribList = [];
        var materialNames = [];
        var currentMaterialIndex = -1;
        var currentMaterial = new Material();
        var attributeID = 0;
        var count = 0;
        var lastID = 0;
        var exit = false;
        var normalMapFound = false;
        var offsetX = 0;
        var offsetY = 0;
        var offsetZ = 0;
        var objects = [];
        var currentObject = null;
        var objHierarchy = [];
        var objNames = [];
        var objectTable = {};
        var dummyCount = 0;
        var length = br.get_length() - 1;
        var startMapIndex = 0;
        var startTriangleIndex = 0;

        // Loop to scan the whole file
        while (br.get_position() < length && !exit) {
            sectionID = br.readUInt16();
            sectionLength = br.readUInt32();
            switch (sectionID) {
                //This section the begining of the file
                case 0x4D4D:
                    break;

                // This section marks the edit section containing the 3d models (3d3d get it? very punny!)
                case 0x3D3D:
                    break;

                // Object section contains meshes, etc.
                case 0x4000:
                    name = '';
                    var b;
                    do {
                        b = br.readByte();
                        if (b > 0) {
                            name += String.fromCharCode(b);
                        }
                    } while (!!b);
                    currentObject = new ObjectNode();
                    currentObject.name = name;
                    objects.push(currentObject);
                    if (!ss.keyExists(objectTable, currentObject.name)) {
                        objectTable[currentObject.name] = currentObject;
                    }
                    break;

                // Marks the start of a mesh section
                case 0x4100:
                    startMapIndex = vertexList.length;
                    startTriangleIndex = Math.floor(indexList.length / 3);
                    break;

                // This section has the vertex list.. Maps to Vertext buffer in Direct3d
                case 0x4110:
                    vertexCount = br.readUInt16();
                    for (i = 0; i < vertexCount; i++) {
                        var x = br.readSingle() - offsetX;
                        var y = br.readSingle() - offsetY;
                        var z = br.readSingle() - offsetZ;
                        var vert = PositionNormalTextured._create(x * scale, z * scale, y * scale, 0, 0, 0, 0, 0);
                        vertexList.push(vert);
                    }
                    break;

                // This section is a triangle index list. Maps to Index Buffer in Direct3d
                case 0x4120:
                    var triCount = br.readUInt16();
                    triangleCount += triCount;
                    for (i = 0; i < triCount; i++) {
                        var aa = br.readUInt16() + startMapIndex;
                        var bb = br.readUInt16() + startMapIndex;
                        var cc = br.readUInt16() + startMapIndex;
                        indexList.push(cc);
                        indexList.push(bb);
                        indexList.push(aa);
                        var flags = br.readUInt16();
                    }
                    break;

                // Material for face from start face to triCount
                case 0x4130:
                    material = '';
                    i = 0;
                    var b1;
                    do {
                        b1 = br.readByte();
                        if (b1 > 0) {
                            material += String.fromCharCode(b1);
                        }
                        i++;
                    } while (!!b1);
                    var triCount = br.readUInt16();
                    var applyList = new Array(triCount);
                    attributeID = Object3d._getMaterialID(material, materialNames);
                    for (i = 0; i < triCount; i++) {
                        applyList[i] = br.readUInt16() + startTriangleIndex;
                    }
                    currentObject.applyLists.push(applyList);
                    currentObject.applyListsIndex.push(attributeID);
                    break;

                // Section for UV texture maps
                case 0x4140:
                    count = br.readUInt16();
                    for (i = 0; i < count; i++) {
                        var vert = vertexList[startMapIndex + i];
                        var texCoord = Vector2d.create(br.readSingle(), (this.flipV) ? (1 - br.readSingle()) : br.readSingle());
                        vertexList[startMapIndex + i] = PositionNormalTextured.createUV(vert.get_position(), new Vector3d(), texCoord);
                    }
                    break;

                // Section for Smoothing Groups ??
                case 0x4160:
                    var mat = new Array(12);
                    for (i = 0; i < 12; i++) {
                        mat[i] = br.readSingle();
                    }
                    if (ss.keyExists(objectTable, name)) {
                        objectTable[name].localMat = Matrix3d.create(mat[0], mat[1], mat[2], 0, mat[3], mat[4], mat[5], 0, mat[6], mat[7], mat[8], 0, mat[9], mat[10], mat[11], 1);
                        objectTable[name].localMat.invert();
                    }
                    break;

                // Materials library section
                case 0xAFFF:
                    break;

                // Material Name
                case 0xA000:
                    var matName = '';
                    i = 0;
                    var b2;
                    do {
                        b2 = br.readByte();
                        if (b2 > 0) {
                            matName += String.fromCharCode(b2);
                        }
                        i++;
                    } while (!!b2);
                    materialNames.push(matName);
                    if (currentMaterialIndex > -1) {
                        this._addMaterial(currentMaterial);
                    }
                    currentMaterialIndex++;
                    currentMaterial = new Material();
                    currentMaterial.diffuse = Colors.get_white();
                    currentMaterial.ambient = Colors.get_white();
                    currentMaterial.specular = Colors.get_black();
                    currentMaterial.specularSharpness = 30;
                    currentMaterial.opacity = 1;
                    break;

                // Ambient color
                case 0xA010:
                    currentMaterial.ambient = this._loadColorChunk(br);
                    break;

                // Diffuse color
                case 0xA020:
                    currentMaterial.diffuse = this._loadColorChunk(br);
                    break;

                // Specular color
                case 0xA030:
                    currentMaterial.specular = this._loadColorChunk(br);
                    break;

                // Specular power
                case 0xA040:
                    // This is just a reasonable guess at the mapping from percentage to
                    // specular exponent used by 3D Studio.
                    currentMaterial.specularSharpness = 1 + 2 * this._loadPercentageChunk(br);

                    // Minimum sharpness of 10 enforced here because of bad specular exponents
                    // in ISS model.
                    // TODO: Fix ISS and permit lower specular exponents here
                    currentMaterial.specularSharpness = Math.max(10, currentMaterial.specularSharpness);
                    break;

                //Texture map file
                case 0xA200:
                    break;

                // Texture file name
                case 0xA300:
                    var textureFilename = '';
                    i = 0;
                    var b2;
                    do {
                        b2 = br.readByte();
                        if (b2 > 0) {
                            textureFilename += String.fromCharCode(b2);
                        }
                        i++;
                    } while (!!b2);
                    var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                    try {
                        var tex = this._tourDocument.getCachedTexture2d(path + textureFilename);
                        if (tex != null) {
                            this._meshTextures.push(tex);
                            this.meshFilenames.push(textureFilename);
                            // The ISS model has black for the diffuse color; to work around this
                            // we'll set the diffuse color to white when there's a texture present.
                            // The correct fix is to modify the 3ds model of ISS.
                            currentMaterial.diffuse = Colors.get_white();
                        }
                        else {
                            this._meshTextures.push(null);
                        }
                    }
                    catch ($e1) {
                        this._meshTextures.push(null);
                    }
                    break;

                // Bump map
                case 0xA230:
                    var percentage = this._loadPercentageChunk(br);
                    var nameId = br.readUInt16();
                    var nameBlockLength = br.readUInt32();
                    var textureFilename = '';
                    i = 0;
                    var b2;
                    do {
                        b2 = br.readByte();
                        if (b2 > 0) {
                            textureFilename += String.fromCharCode(b2);
                        }
                        i++;
                    } while (!!b2);
                    var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                    try {
                        var tex = this._tourDocument.getCachedTexture2d(path + textureFilename);
                        if (tex != null) {
                            this._meshNormalMaps.push(tex);
                            this.meshFilenames.push(textureFilename);
                            // Indicate that we have a normal map so that we know to generate tangent vectors for the mesh
                            normalMapFound = true;
                        }
                        else {
                            this._meshNormalMaps.push(null);
                        }
                    }
                    catch ($e2) {
                        this._meshNormalMaps.push(null);
                    }
                    break;

                // Specular map
                case 0xA204:
                    var strength = this._loadPercentageChunk(br);
                    var nameId = br.readUInt16();
                    var nameBlockLength = br.readUInt32();
                    var textureFilename = '';
                    i = 0;
                    var b2;
                    do {
                        b2 = br.readByte();
                        if (b2 > 0) {
                            textureFilename += String.fromCharCode(b2);
                        }
                        i++;
                    } while (!!b2);
                    var path = this.filename.substring(0, this.filename.lastIndexOf('\\') + 1);
                    try {
                        var tex = this._tourDocument.getCachedTexture2d(path + textureFilename);
                        if (tex != null) {
                            this._meshSpecularTextures.push(tex);
                            this.meshFilenames.push(textureFilename);
                            // Set the current specular color from the specular texture strength
                            var gray = ss.truncate((255.99 * strength / 100));
                            currentMaterial.specular = Color.fromArgb(255, gray, gray, gray);
                        }
                        else {
                            this._meshSpecularTextures.push(null);
                        }
                    }
                    catch ($e3) {
                        this._meshSpecularTextures.push(null);
                    }
                    break;

                case 0xB000:
                    break;
                case 0xB002:
                    break;
                case 0xB010:
                    name = '';
                    i = 0;
                    var b1;
                    do {
                        b1 = br.readByte();
                        if (b1 > 0) {
                            name += String.fromCharCode(b1);
                        }
                        i++;
                    } while (!!b1);
                    var dum1 = br.readUInt16();
                    var dum2 = br.readUInt16();
                    var level = br.readUInt16();
                    if (level === 65535) {
                        level = -1;
                    }
                    if (ss.startsWith(name, '$')) {
                        dummyCount++;
                    }
                    else {
                        objNames.push(name);
                    }
                    objHierarchy.push(level);
                    if (ss.keyExists(objectTable, name)) {
                        objectTable[name].level = level;
                    }
                    break;

                case 0xB011:
                    name = '';
                    i = 0;
                    var b1;
                    do {
                        b1 = br.readByte();
                        if (b1 > 0) {
                            name += String.fromCharCode(b1);
                        }
                        i++;
                    } while (!!b1);
                    objNames.push('$$$' + name);
                    break;

                case 0xB013:
                    // pivot point
                    var points = new Array(3);
                    for (i = 0; i < 3; i++) {
                        points[i] = br.readSingle();
                    }
                    if (ss.keyExists(objectTable, name)) {
                        objectTable[name].pivotPoint = Vector3d.create(-points[0], -points[1], -points[2]);
                    }
                    break;

                case 0xB020:
                    var pos = new Array(8);
                    for (i = 0; i < 8; i++) {
                        pos[i] = br.readSingle();
                    }
                    break;

                // If we don't recognize a section then jump over it. Subract the header from the section length
                default:
                    br.seekRelative((sectionLength - 6));
                    break;
            }

            lastID = sectionID;
        }

        br.close();
        if (currentMaterialIndex > -1) {
            this._addMaterial(currentMaterial);
        }

        // Generate vertex normals

        // Vertex normals are computed by averaging the normals of all faces
        // with an angle between them less than the crease angle. By setting
        // the crease angle to 0 degrees, the model will have a faceted appearance.
        // Right now, the smooth flag selects between one of two crease angles,
        // but some smoothing is always applied.

        var degtorag = Math.PI / 180;
        var creaseAngleRad = ((this.smooth) ? 70 * degtorag : 45 * degtorag);
        var vertexNormals = this._calculateVertexNormalsMerged(vertexList, indexList, creaseAngleRad);
        var newVertexList = [];
        var newVertexCount = triangleCount * 3;
        for (var vertexIndex = 0; vertexIndex < newVertexCount; ++vertexIndex) {
            var v = vertexList[indexList[vertexIndex]];
            v.set_normal(vertexNormals[vertexIndex]);
            newVertexList.push(v);
        }

        // Use the triangle mesh and material assignments to create a single
        // index list for the mesh.
        var newIndexList = [];
        var $enum4 = ss.enumerate(objects);
        while ($enum4.moveNext()) {
            var node = $enum4.current;
            var materialGroups = [];
            for (i = 0; i < node.applyLists.length; i++) {
                var matId = node.applyListsIndex[i];
                var startIndex = newIndexList.length;
                var $enum5 = ss.enumerate(node.applyLists[i]);
                while ($enum5.moveNext()) {
                    var triangleIndex = $enum5.current;
                    newIndexList.push((triangleIndex * 3));
                    newIndexList.push((triangleIndex * 3 + 1));
                    newIndexList.push((triangleIndex * 3 + 2));
                }
                var group = new Group();
                group.startIndex = startIndex;
                group.indexCount = node.applyLists[i].length * 3;
                group.materialIndex = matId;
                materialGroups.push(group);
            }
            node.drawGroup = materialGroups;
        }

        // Turn objects into tree
        var nodeStack = new ss.Stack();
        var nodeTreeRoot = [];
        var rootDummy = new ObjectNode();
        rootDummy.name = 'Root';
        rootDummy.parent = null;
        rootDummy.level = -1;
        rootDummy.drawGroup = null;
        var currentLevel = -1;
        nodeStack.push(rootDummy);
        nodeTreeRoot.push(rootDummy);
        for (i = 0; i < objHierarchy.length; i++) {
            var level = objHierarchy[i];
            if (level <= currentLevel) {
                // pop out all the nodes to intended parent
                while (level <= nodeStack.peek().level && nodeStack.count > 1) {
                    nodeStack.pop();
                }
                currentLevel = level;
            }
            if (ss.startsWith(objNames[i], '$$$')) {
                var dummy = new ObjectNode();
                dummy.name = ss.replaceString(objNames[i], '$$$', '');
                dummy.parent = nodeStack.peek();
                dummy.parent.children.push(dummy);
                dummy.level = currentLevel = level;
                dummy.drawGroup = null;
                nodeStack.push(dummy);
            }
            else {
                objectTable[objNames[i]].level = currentLevel = level;
                objectTable[objNames[i]].parent = nodeStack.peek();
                objectTable[objNames[i]].parent.children.push(objectTable[objNames[i]]);
                nodeStack.push(objectTable[objNames[i]]);
            }
        }
        if (!objHierarchy.length) {
            var $enum6 = ss.enumerate(objects);
            while ($enum6.moveNext()) {
                var node = $enum6.current;
                rootDummy.children.push(node);
                node.parent = rootDummy;
            }
        }
        if (normalMapFound) {
            // If we've got a normal map, we want to generate tangent vectors for the mesh

            // Mapping of vertices to geometry is extremely straightforward now, but this could
            // change when a mesh optimization step is introduced.
            var tangentIndexList = [];
            for (var tangentIndex = 0; tangentIndex < newVertexCount; ++tangentIndex) {
                tangentIndexList.push(tangentIndex);
            }
            var tangents = this._calculateVertexTangents(newVertexList, tangentIndexList, creaseAngleRad);

            // Copy the tangents in the vertex data list
            var vertices = new Array(newVertexList.length);
            var vertexIndex = 0;
            var $enum7 = ss.enumerate(newVertexList);
            while ($enum7.moveNext()) {
                var v = $enum7.current;
                var tvertex = new PositionNormalTexturedTangent(v.get_position(), v.get_normal(), Vector2d.create(v.tu, v.tv), tangents[vertexIndex]);
                vertices[vertexIndex] = tvertex;
                ++vertexIndex;
            }
            this._mesh = Mesh.createTangent(vertices, newIndexList);
        } else {
            this._mesh = Mesh.create(newVertexList, newIndexList);
        }
        this.objects = nodeTreeRoot;
        this._mesh.setObjects(nodeTreeRoot);
        this._mesh.commitToDevice();
        this._dirty = false;
        this._readyToRender = true;
    },

    _offsetObjects: function (vertList, objects, offsetMat, offsetPoint) {
        var $enum1 = ss.enumerate(objects);
        while ($enum1.moveNext()) {
            var node = $enum1.current;
            var matLoc = node.localMat;
            this._offsetObjects(vertList, node.children, matLoc, Vector3d.addVectors(node.pivotPoint, offsetPoint));
            var $enum2 = ss.enumerate(node.drawGroup);
            while ($enum2.moveNext()) {
                var group = $enum2.current;
                var end = group.startIndex + group.indexCount;
                for (var i = group.startIndex; i < end; i++) {
                    var vert = vertList[i];
                    vert.set_position(Vector3d.addVectors(vert.get_position(), Vector3d.addVectors(node.pivotPoint, offsetPoint)));
                    vertList[i] = vert;
                }
            }
        }
    },

    // Set up lighting state to account for:
    //   - Light reflected from a nearby planet
    //   - Shadows cast by nearby planets
    setupLighting: function (renderContext) {
        var objPosition = Vector3d.create(renderContext.get_world().get_offsetX(), renderContext.get_world().get_offsetY(), renderContext.get_world().get_offsetZ());
        var objToLight = Vector3d.subtractVectors(objPosition, renderContext.get_reflectedLightPosition());
        var sunPosition = Vector3d.subtractVectors(renderContext.get_sunPosition(), renderContext.get_reflectedLightPosition());
        var cosPhaseAngle = (sunPosition.length() <= 0) ? 1 : Vector3d.dot(objToLight, sunPosition) / (objToLight.length() * sunPosition.length());
        var reflectedLightFactor = Math.max(0, cosPhaseAngle);
        reflectedLightFactor = Math.sqrt(reflectedLightFactor); // Tweak falloff of reflected light
        var hemiLightFactor = 0;

        // 1. Reduce the amount of sunlight when the object is in the shadow of a planet
        // 2. Introduce some lighting due to scattering by the planet's atmosphere if it's
        //    close to the surface.
        var sunlightFactor = 1;
        if (renderContext.get_occludingPlanetRadius() > 0) {
            var objAltitude = Vector3d.subtractVectors(objPosition, renderContext.get_occludingPlanetPosition()).length() - renderContext.get_occludingPlanetRadius();
            hemiLightFactor = Math.max(0, Math.min(1, 1 - (objAltitude / renderContext.get_occludingPlanetRadius()) * 300));
            reflectedLightFactor *= (1 - hemiLightFactor);

            // Compute the distance from the center of the object to the line between the sun and occluding planet
            // We're assuming that the radius of the object is very small relative to Earth;
            // for large objects the amount of shadow will vary, and we should use circular
            // eclipse shadows.
            var sunToPlanet = Vector3d.subtractVectors(renderContext.get_occludingPlanetPosition(), renderContext.get_sunPosition());
            var objToPlanet = Vector3d.subtractVectors(renderContext.get_occludingPlanetPosition(), objPosition);
            var hemiLightDirection = Vector3d.create(-objToPlanet.x, -objToPlanet.y, -objToPlanet.z);
            hemiLightDirection.normalize();
            renderContext.set_hemisphereLightUp(hemiLightDirection);
            var objToSun = Vector3d.subtractVectors(renderContext.get_sunPosition(), objPosition);
            var sunPlanetDistance = sunToPlanet.length();
            var t = -Vector3d.dot(objToSun, sunToPlanet) / (sunPlanetDistance * sunPlanetDistance);
            if (t > 1) {
                // Object is on the side of the planet opposite the sun, so a shadow is possible

                // Compute the position of the object projected onto the shadow axis
                var shadowAxisPoint = Vector3d.addVectors(renderContext.get_sunPosition(), Vector3d.multiplyScalar(sunToPlanet, t));

                // d is the distance to the shadow axis
                var d = Vector3d.subtractVectors(shadowAxisPoint, objPosition).length();

                // s is the distance from the sun along the shadow axis
                var s = Vector3d.subtractVectors(shadowAxisPoint, renderContext.get_sunPosition()).length();

                // Use the sun's radius to accurately compute the penumbra and umbra cones
                var solarRadius = 0.004645784;
                var penumbraRadius = renderContext.get_occludingPlanetRadius() + (t - 1) * (renderContext.get_occludingPlanetRadius() + solarRadius);
                var umbraRadius = renderContext.get_occludingPlanetRadius() + (t - 1) * (renderContext.get_occludingPlanetRadius() - solarRadius);
                if (d < penumbraRadius) {
                    // The object is inside the penumbra, so it is at least partly shadowed
                    var minimumShadow = 0;
                    if (umbraRadius < 0) {
                        // No umbra at this point; degree of shadowing is limited because the
                        // planet doesn't completely cover the sun even when the object is positioned
                        // exactly on the shadow axis.
                        var occlusion = Math.pow(1 / (1 - umbraRadius), 2);
                        umbraRadius = 0;
                        minimumShadow = 1 - occlusion;
                    }

                    // Approximate the amount of shadow with linear interpolation. The accurate
                    // calculation involves computing the area of the intersection of two circles.
                    var u = Math.max(0, umbraRadius);
                    sunlightFactor = Math.max(minimumShadow, (d - u) / (penumbraRadius - u));
                    var gray = ss.truncate((255.99 * sunlightFactor));
                    renderContext.set_sunlightColor(Color.fromArgb(255, gray, gray, gray));

                    // Reduce sky-scattered light as well
                    hemiLightFactor *= sunlightFactor;
                }
            }
        }
        renderContext.set_reflectedLightColor(Color.fromArgb(255, ss.truncate((renderContext.get_reflectedLightColor().r * reflectedLightFactor)), ss.truncate((renderContext.get_reflectedLightColor().g * reflectedLightFactor)), ss.truncate((renderContext.get_reflectedLightColor().b * reflectedLightFactor))));
        renderContext.set_hemisphereLightColor(Color.fromArgb(255, ss.truncate((renderContext.get_hemisphereLightColor().r * hemiLightFactor)), ss.truncate((renderContext.get_hemisphereLightColor().g * hemiLightFactor)), ss.truncate((renderContext.get_hemisphereLightColor().b * hemiLightFactor))));
    },

    render: function (renderContext, opacity) {
        if (!this._readyToRender) {
            return;
        }
        if (this._dirty && !this.issLayer) {
            this._reload();
        }
        var oldWorld = renderContext.get_world();
        var offset = this._mesh.boundingSphere.center;
        var unitScale = 1;
        if (this._mesh.boundingSphere.radius > 0) {
            unitScale = 1 / this._mesh.boundingSphere.radius;
        }
        renderContext.set_world(Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(Matrix3d.translation(Vector3d.create(-offset.x, -offset.y, -offset.z)), Matrix3d._scaling(unitScale, unitScale, unitScale)), oldWorld));
        var worldView = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        var v = worldView.transform(Vector3d.get_empty());
        var scaleFactor = Math.sqrt(worldView.get_m11() * worldView.get_m11() + worldView.get_m22() * worldView.get_m22() + worldView.get_m33() * worldView.get_m33()) / unitScale;
        var dist = v.length();
        var radius = scaleFactor;

        // Calculate pixelsPerUnit which is the number of pixels covered
        // by an object 1 AU at the distance of the planet center from
        // the camera. This calculation works regardless of the projection
        // type.
        var viewportHeight = ss.truncate(renderContext.height);
        var p11 = renderContext.get_projection().get_m11();
        var p34 = renderContext.get_projection().get_m34();
        var p44 = renderContext.get_projection().get_m44();
        var w = Math.abs(p34) * dist + p44;
        var pixelsPerUnit = (p11 / w) * viewportHeight;
        var radiusInPixels = (radius * pixelsPerUnit);
        if (radiusInPixels < 0.5) {
            // Too small to be visible; skip rendering
            return;
        }

        // These colors can be modified by shadows, distance from planet, etc. Restore
        // the original values after rendering.
        var savedSunlightColor = renderContext.get_sunlightColor();
        var savedReflectedColor = renderContext.get_reflectedLightColor();
        var savedHemiColor = renderContext.get_hemisphereLightColor();
        if (Settings.get_current().get_solarSystemLighting()) {
            this.setupLighting(renderContext);
            if (!this.useCurrentAmbient) {
                renderContext.set_ambientLightColor(Color.fromArgb(255, 11, 11, 11));
            }
        } else {
            // No lighting: set ambient light to white and turn off all other light sources
            renderContext.set_sunlightColor(Colors.get_black());
            renderContext.set_reflectedLightColor(Colors.get_black());
            renderContext.set_hemisphereLightColor(Colors.get_black());
            renderContext.set_ambientLightColor(Colors.get_white());
        }
        if (this._mesh == null) {
            return;
        }
        ModelShader.minLightingBrightness = 0.1;
        var count = this._meshMaterials.length;
        this._mesh.beginDrawing(renderContext);
        if (count > 0) {
            for (var i = 0; i < this._meshMaterials.length; i++) {
                if (this._meshMaterials[i].isDefault) {
                    var mat = this._meshMaterials[i];
                    mat.diffuse = this.color;
                    mat.ambient = this.color;
                    this._meshMaterials[i] = mat;
                }

                // Set the material and texture for this subset
                renderContext.setMaterial(this._meshMaterials[i], this._meshTextures[i], this._meshSpecularTextures[i], this._meshNormalMaps[i], opacity);
                if (this._mesh.vertexBuffer != null) {
                    ModelShader.use(renderContext, this._mesh.vertexBuffer.vertexBuffer, this._mesh.indexBuffer.buffer, (this._meshTextures[i] != null) ? this._meshTextures[i].texture2d : null, opacity, false, 32);
                }
                else {
                    ModelShader.use(renderContext, this._mesh.tangentVertexBuffer.vertexBuffer, this._mesh.indexBuffer.buffer, (this._meshTextures[i] != null) ? this._meshTextures[i].texture2d : null, opacity, false, 44);
                }
                renderContext.preDraw();
                this._mesh.drawSubset(renderContext, i);
            }
        } else {
            renderContext.preDraw();
            for (var i = 0; i < this._meshTextures.length; i++) {
                if (this._meshTextures[i] != null) {
                    renderContext.set_mainTexture(this._meshTextures[i]);
                    if (this._mesh.vertexBuffer != null) {
                        ModelShader.use(renderContext, this._mesh.vertexBuffer.vertexBuffer, this._mesh.indexBuffer.buffer, (this._meshTextures[i] != null) ? this._meshTextures[i].texture2d : null, opacity, false, 32);
                    }
                    else {
                        ModelShader.use(renderContext, this._mesh.tangentVertexBuffer.vertexBuffer, this._mesh.indexBuffer.buffer, (this._meshTextures[i] != null) ? this._meshTextures[i].texture2d : null, opacity, false, 44);
                    }
                }
                renderContext.preDraw();
                this._mesh.drawSubset(renderContext, i);
            }
        }
        renderContext.set_world(oldWorld);
        renderContext.set_sunlightColor(savedSunlightColor);
        renderContext.set_reflectedLightColor(savedReflectedColor);
        renderContext.set_hemisphereLightColor(savedHemiColor);
        renderContext.set_ambientLightColor(Colors.get_black());
    },

    dispose: function () {
        if (this._mesh != null) {
            this._mesh.dispose();
            this._mesh = null;
        }
        var $enum1 = ss.enumerate(ss.keys(this._textureCache));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var tex = this._textureCache[key];
            if (tex != null) {
                tex.dispose();
            }
        }
        ss.clearKeys(this._textureCache);
        Object3d._disposeTextureList(this._meshTextures);
        Object3d._disposeTextureList(this._meshSpecularTextures);
        Object3d._disposeTextureList(this._meshNormalMaps);
        this._meshMaterials.length = 0;
        this._dirty = true;
    }
};

registerType("Object3d", [Object3d, Object3d$, null]);


// wwtlib.ObjectNode

export function ObjectNode() {
    this.level = -1;
    this.children = [];
    this.enabled = true;
    this.drawGroup = [];
    this.applyLists = [];
    this.applyListsIndex = [];
}

var ObjectNode$ = {};

registerType("ObjectNode", [ObjectNode, ObjectNode$, null]);


// wwtlib.Object3dLayerUI

export function Object3dLayerUI(layer) {
    this._layer$1 = null;
    this._opened$1 = true;
    this._callbacks$1 = null;
    LayerUI.call(this);
    this._layer$1 = layer;
}

var Object3dLayerUI$ = {
    setUICallbacks: function (callbacks) {
        this._callbacks$1 = callbacks;
    },

    get_hasTreeViewNodes: function () {
        return true;
    },

    getTreeNodes: function () {
        var nodes = [];
        if (this._layer$1.object3d.objects.length > 0 && this._layer$1.object3d.objects[0].children != null) {
            this._loadTree$1(nodes, this._layer$1.object3d.objects[0].children);
        }
        return nodes;
    },
    _loadTree$1: function (nodes, children) {
        var $enum1 = ss.enumerate(children);
        while ($enum1.moveNext()) {
            var child = $enum1.current;
            var node = new LayerUITreeNode();
            node.set_name(child.name);
            node.set_tag(child);
            node.set_checked(child.enabled);
            node.add_nodeSelected(ss.bind('_node_NodeSelected$1', this));
            node.add_nodeChecked(ss.bind('_node_NodeChecked$1', this));
            nodes.push(node);
            this._loadTree$1(node.get_nodes(), child.children);
        }
    },
    _node_NodeChecked$1: function (node, newState) {
        var child = node.get_tag();
        if (child != null) {
            child.enabled = newState;
        }
    },
    _node_NodeSelected$1: function (node) {
        if (this._callbacks$1 != null) {
            var child = node.get_tag();
            var rowData = {};
            rowData['Name'] = child.name;
            rowData['Pivot.X'] = child.pivotPoint.x.toString();
            rowData['Pivot.Y'] = child.pivotPoint.y.toString();
            rowData['Pivot.Z'] = child.pivotPoint.z.toString();
            this._callbacks$1.showRowData(rowData);
        }
    },

    getNodeContextMenu: function (node) {
        return LayerUI.prototype.getNodeContextMenu.call(this, node);
    }
};

registerType("Object3dLayerUI", [Object3dLayerUI, Object3dLayerUI$, LayerUI]);
