// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Text rendered on the sky.

import { ss } from "./ss.js";
import { registerType, registerEnum } from "./typesystem.js";
import { Vector2d, Vector3d, Matrix3d, PositionTexture } from "./double3d.js";
import { Util } from "./baseutil.js";
import { Colors } from "./color.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { PositionTextureVertexBuffer } from "./graphics/gl_buffers.js";
import { Texture } from "./graphics/texture.js";
import { TextShader } from "./graphics/shaders.js";
import { TextObject } from "./tours/text_object.js";
import { URLHelpers } from "./url_helpers.js";
import { Rectangle } from "./util.js";
import { WebFile } from "./web_file.js";


// wwtlib.Alignment

export var Alignment = {
    center: 0,
    left: 1
};

registerType("Alignment", Alignment);
registerEnum("Alignment", Alignment);


// wwtlib.Text3dBatch

export function Text3dBatch(height) {
    this.height = 128;
    this.items = [];
    this._glyphVersion = -1;
    this.viewTransform = Matrix3d.get_identity();
    this._textObject = new TextObject();
    this._vertCount = 0;
    this.height = (height * 3);
}

var Text3dBatch$ = {
    add: function (newItem) {
        this.items.push(newItem);
    },

    draw: function (renderContext, opacity, color) {
        if (renderContext.gl == null) {
            var viewPoint = Vector3d._transformCoordinate(renderContext.get_viewPoint(), this.viewTransform);
            var drawHeight = (this.height / renderContext.get_fovAngle()) * renderContext.height / 180;
            var $enum1 = ss.enumerate(this.items);
            while ($enum1.moveNext()) {
                var t3d = $enum1.current;
                var screenSpacePnt = renderContext.WVP.transform(t3d.center);
                if (screenSpacePnt.z < 0) {
                    continue;
                }
                if (Vector3d.dot(viewPoint, t3d.center) < 0.55) {
                    continue;
                }
                var screenSpaceTop = renderContext.WVP.transform(t3d.top);
                var rotation = Math.atan2(screenSpacePnt.x - screenSpaceTop.x, screenSpacePnt.y - screenSpaceTop.y);
                var ctx = renderContext.device;
                ctx.save();
                ctx.translate(screenSpacePnt.x, screenSpacePnt.y);
                ctx.rotate(-rotation); // todo update with up vector
                ctx.globalAlpha = opacity;
                ctx.fillStyle = color.toString();
                ctx.font = 'normal' + ' ' + ((false) ? 'bold' : 'normal') + ' ' + Math.round(drawHeight * 1.2).toString() + 'px ' + 'Arial';
                ctx.textBaseline = 'top';
                var tm = ctx.measureText(t3d.text);
                ctx.fillText(t3d.text, -tm.width / 2, -drawHeight / 2);
                ctx.restore();
            }
        } else {
            if (this._glyphCache == null || this._glyphCache.get_version() > this._glyphVersion) {
                this.prepareBatch();
            }
            if (!this._glyphCache.ready) {
                return;
            }
            TextShader.use(renderContext, this._vertexBuffer.vertexBuffer, this._glyphCache.get_texture().texture2d);
            renderContext.gl.drawArrays(WEBGL.TRIANGLES, 0, this._vertexBuffer.count);
        }
    },

    prepareBatch: function () {
        if (this._glyphCache == null) {
            this._glyphCache = GlyphCache.getCache(this.height);
        }
        if (!this._glyphCache.ready) {
            return;
        }
        this._textObject.text = '';
        this._textObject.fontSize = this.height * 0.5;
        var verts = [];
        var $enum1 = ss.enumerate(this.items);
        while ($enum1.moveNext()) {
            var t3d = $enum1.current;
            var text = t3d.text;
            var left = 0;
            var top = 0;
            var fntAdjust = this._textObject.fontSize / 128;
            var factor = 0.6666;
            var width = 0;
            var height = 0;
            for (var i = 0; i < text.length; i++) {
                var item = this._glyphCache.getGlyphItem(text.substr(i, 1));
                if (item != null) {
                    width += item.extents.x;
                    height = Math.max(item.extents.y, height);
                }
            }
            var size = Vector2d.create(width, height);
            t3d.width = size.x * t3d.scale * factor * fntAdjust;
            t3d.height = size.y * t3d.scale * factor * fntAdjust;
            var charsLeft = text.length;
            for (var i = 0; i < charsLeft; i++) {
                var item = this._glyphCache.getGlyphItem(text.substr(i, 1));
                if (item != null) {
                    var position = Rectangle.create(left * t3d.scale * factor, 0 * t3d.scale * factor, item.extents.x * fntAdjust * t3d.scale * factor, item.extents.y * fntAdjust * t3d.scale * factor);
                    left += (item.extents.x * fntAdjust);
                    t3d.addGlyphPoints(verts, item.size, position, item.uvRect);
                }
            }
        }
        this._vertCount = verts.length;
        this._vertexBuffer = new PositionTextureVertexBuffer(this._vertCount);
        var vertBuf = this._vertexBuffer.lock();
        for (var i = 0; i < this._vertCount; i++) {
            vertBuf[i] = verts[i];
        }
        this._vertexBuffer.unlock();
        this._glyphVersion = this._glyphCache.get_version();
    },

    cleanUp: function () {
        if (this._vertexBuffer != null) {
            this._vertexBuffer = null;
        }
        this.items.length = 0;
    }
};

registerType("Text3dBatch", [Text3dBatch, Text3dBatch$, null]);

// wwtlib.GlyphItem

export function GlyphItem(glyph) {
    this.referenceCount = 0;
    this.glyph = glyph;
    this.uvRect = new Rectangle();
    this.size = new Vector2d();
    this.referenceCount = 1;
}

GlyphItem.create = function (glyph, uv, size, extents) {
    var temp = new GlyphItem(glyph);
    temp.glyph = glyph;
    temp.uvRect = uv;
    temp.size = size;
    temp.extents = extents;
    temp.referenceCount = 1;
    return temp;
};

GlyphItem._fromXML = function (node) {
    var glyph = node.attributes.getNamedItem('Glyph').nodeValue;
    var item = new GlyphItem(glyph);
    item.uvRect = Rectangle.create(parseFloat(node.attributes.getNamedItem('UVLeft').nodeValue), parseFloat(node.attributes.getNamedItem('UVTop').nodeValue), parseFloat(node.attributes.getNamedItem('UVWidth').nodeValue), parseFloat(node.attributes.getNamedItem('UVHeight').nodeValue));
    item.size = Vector2d.create(parseFloat(node.attributes.getNamedItem('SizeWidth').nodeValue), parseFloat(node.attributes.getNamedItem('SizeHeight').nodeValue));
    item.extents = Vector2d.create(parseFloat(node.attributes.getNamedItem('ExtentsWidth').nodeValue), parseFloat(node.attributes.getNamedItem('ExtentsHeight').nodeValue));
    return item;
};

var GlyphItem$ = {
    addRef: function () {
        this.referenceCount++;
    },

    release: function () {
        this.referenceCount--;
    }
};

registerType("GlyphItem", [GlyphItem, GlyphItem$, null]);

// wwtlib.GlyphCache

export function GlyphCache(height) {
    this._cellHeight = 128;
    this._gridSize = 8;
    this.ready = false;
    this._glyphItems = {};
    this.textObject = new TextObject();
    this._dirty = true;
    this._textureDirty = true;
    this._version = 0;
    this._cellHeight = height;
    this._texture = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('glyphs1.png'));
    this._webFile = new WebFile(URLHelpers.singleton.engineAssetUrl('glyphs1.xml'));
    this._webFile.onStateChange = ss.bind('_glyphXmlReady', this);
    this._webFile.send();
}

GlyphCache._caches = {};
GlyphCache._allGlyphs = '';

GlyphCache.getCache = function (height) {
    if (!ss.keyExists(GlyphCache._caches, height)) {
        GlyphCache._caches[height] = new GlyphCache(height);
    }
    return GlyphCache._caches[height];
};

GlyphCache.cleanUpAll = function () {
    ss.clearKeys(GlyphCache._caches);
};

var GlyphCache$ = {
    get_height: function () {
        return this._cellHeight;
    },

    _glyphXmlReady: function () {
        if (this._webFile.get_state() === 2) {
            alert(this._webFile.get_message());
        } else if (this._webFile.get_state() === 1) {
            this._loadXmlGlyph(this._webFile.getXml());
        }
    },

    _loadXmlGlyph: function (xml) {
        var nodes = Util.selectSingleNode(xml, 'GlyphItems');
        var $enum1 = ss.enumerate(nodes.childNodes);
        while ($enum1.moveNext()) {
            var glyphItem = $enum1.current;
            if (glyphItem.nodeName === 'GlyphItem') {
                var item = GlyphItem._fromXML(glyphItem);
                this._glyphItems[item.glyph] = item;
                GlyphCache._allGlyphs = GlyphCache._allGlyphs + item.glyph;
            }
        }
        this.ready = true;
    },

    get_texture: function () {
        return this._texture;
    },

    _makeTexture: function () {
        this._calcOrMake(true);
    },

    getGlyphItem: function (glyph) {
        if (this._dirty) {
            this._calculateGlyphDetails();
        }
        return this._glyphItems[glyph];
    },

    _calculateGlyphDetails: function () {
        this._calcOrMake(false);
    },

    _calcOrMake: function (makeTexture) { },

    get_version: function () {
        return this._version;
    },

    set_version: function (value) {
        this._version = value;
        return value;
    },

    addGlyph: function (glyph) {
        if (!ss.keyExists(this._glyphItems, glyph)) {
            var item = new GlyphItem(glyph);
            this._glyphItems[glyph] = item;
            this._dirty = true;
            this._textureDirty = true;
            this._version++;
            GlyphCache._allGlyphs = GlyphCache._allGlyphs + glyph;
        } else {
            this._glyphItems[glyph].addRef();
        }
    },

    cleanUp: function () {
        this._dirty = true;
        this._texture = null;
    },

    dispose: function () {
        this.cleanUp();
    },

    get_dirty: function () {
        return this._dirty;
    },

    set_dirty: function (value) {
        this._dirty = value;
        return value;
    }
};

registerType("GlyphCache", [GlyphCache, GlyphCache$, null, ss.IDisposable]);

// wwtlib.Text3d

export function Text3d(center, up, text, fontsize, scale) {
    this.rotation = 0;
    this.tilt = 0;
    this.bank = 0;
    this._matInit = false;
    this.color = Colors.get_white();
    this.sky = true;
    this.scale = 0;
    this.opacity = 1;
    this.text = '';
    this.width = 1;
    this.height = 1;
    this.alignment = 0;
    this.text = text;
    this.up = up;
    this.center = center;
    this.scale = scale;
    this.top = Vector3d.addVectors(center, Vector3d.scale(up, scale));
    if (fontsize < 0) {
        this.sky = false;
    }
}

var Text3d$ = {
    addGlyphPoints: function (pointList, size, position, uv) {
        var points = new Array(6);
        for (var i = 0; i < 6; i++) {
            points[i] = new PositionTexture();
        }
        var left = Vector3d.cross(this.center, this.up);
        var right = Vector3d.cross(this.up, this.center);
        left.normalize();
        right.normalize();
        this.up.normalize();
        var upTan = Vector3d.cross(this.center, right);
        upTan.normalize();
        if (!this.alignment) {
            left.multiply(this.width - position.get_left() * 2);
            right.multiply(this.width - ((this.width * 2) - position.get_right() * 2));
        } else if (this.alignment === 1) {
            left.multiply(-position.get_left() * 2);
            right.multiply(position.get_right() * 2);
        }
        var top = upTan.copy();
        var bottom = Vector3d.subtractVectors(Vector3d.get_empty(), upTan);
        top.multiply(this.height - position.get_top() * 2);
        bottom.multiply(this.height - ((this.height * 2) - position.get_bottom() * 2));
        var ul = this.center.copy();
        ul.add(top);
        if (this.sky) {
            ul.add(left);
        } else {
            ul.subtract(left);
        }
        var ur = this.center.copy();
        ur.add(top);
        if (this.sky) {
            ur.add(right);
        } else {
            ur.subtract(right);
        }
        var ll = this.center.copy();
        if (this.sky) {
            ll.add(left);
        } else {
            ll.subtract(left);
        }
        ll.add(bottom);
        var lr = this.center.copy();
        if (this.sky) {
            lr.add(right);
        } else {
            lr.subtract(right);
        }
        lr.add(bottom);
        points[0].position = ul.copy();
        points[0].tu = uv.get_left();
        points[0].tv = uv.get_top();
        points[2].tu = uv.get_left();
        points[2].tv = uv.get_bottom();
        points[2].position = ll.copy();
        points[1].tu = uv.get_right();
        points[1].tv = uv.get_top();
        points[1].position = ur.copy();
        points[3].tu = uv.get_right();
        points[3].tv = uv.get_bottom();
        points[3].position = lr.copy();
        points[5].tu = uv.get_right();
        points[5].tv = uv.get_top();
        points[5].position = ur.copy();
        points[4].tu = uv.get_left();
        points[4].tv = uv.get_bottom();
        points[4].position = ll.copy();
        if (!!this.rotation || !!this.tilt || !!this.bank) {
            if (!this._matInit) {
                var lookAt = Matrix3d.lookAtLH(this.center, new Vector3d(), this.up);
                var lookAtInv = lookAt.clone();
                lookAtInv.invert();
                this._rtbMat = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(lookAt, Matrix3d._rotationZ(-this.rotation / 180 * Math.PI)), Matrix3d._rotationX(-this.tilt / 180 * Math.PI)), Matrix3d._rotationY(-this.bank / 180 * Math.PI)), lookAtInv);
                // "todo make this true after debug"
                this._matInit = true;
            }
            for (var i = 0; i < 6; i++) {
                points[i].position = Vector3d._transformCoordinate(points[i].position, this._rtbMat);
            }
        }
        var $enum1 = ss.enumerate(points);
        while ($enum1.moveNext()) {
            var pnt = $enum1.current;
            pointList.push(pnt);
        }
    }
};

registerType("Text3d", [Text3d, Text3d$, null]);
