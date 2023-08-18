// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A graphical overlay shown inside a tour.

import { ss } from "../ss.js";
import { registerType, registerEnum, Enums } from "../typesystem.js";
import { Vector2d, Vector3d, Matrix2d, Matrix3d, PositionColoredTextured } from "../double3d.js";
import { globalRenderContext, useGl } from "../render_globals.js";
import { Texture } from "../graphics/texture.js";
import { Sprite2d } from "../graphics/sprite2d.js";
import { Util } from "../baseutil.js";
import { Color, Colors } from "../color.js";
import { Coordinates } from "../coordinates.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { UiTools } from "../ui_tools.js";
import { Rectangle } from "../util.js";
import { TextObject } from "./text_object.js";


// wwtlib.OverlayAnchor

export var OverlayAnchor = {
    sky: 0,
    screen: 1
};

registerType("OverlayAnchor", OverlayAnchor);
registerEnum("OverlayAnchor", OverlayAnchor);


// wwtlib.AudioType

export var AudioType = {
    music: 0,
    voice: 1
};

registerType("AudioType", AudioType);
registerEnum("AudioType", AudioType);


// wwtlib.ShapeType

export var ShapeType = {
    circle: 0,
    rectagle: 1,
    star: 2,
    donut: 3,
    arrow: 4,
    line: 5,
    openRectagle: 6
};

registerType("ShapeType", ShapeType);
registerEnum("ShapeType", ShapeType);


// wwtlib.LoopTypes

export var LoopTypes = {
    loop: 0,
    upDown: 1,
    down: 2,
    upDownOnce: 3,
    once: 4,
    begin: 5,
    end: 6
};

registerType("LoopTypes", LoopTypes);
registerEnum("LoopTypes", LoopTypes);


// wwtlib.Overlay

export function Overlay() {
    this.isDynamic = false;
    this.isDesignTimeOnly = false;
    this._name = '';

    // this used to be a GUID and should become that again now that we have
    // proper support for them in the web engine.
    this.id = (Overlay.nextId++).toString();
    this._owner = null;
    this._url = '';
    this._linkID = '';
    this._domeMatrix = Matrix3d.get_identity();
    this._domeMatX = 0;
    this._domeMatY = 0;
    this._domeAngle = 0;
    this.points = null;
    this._animate = false;
    this._tweenFactor = 0;
    this._endX = 0;
    this._endY = 0;
    this._endOpacity = 0;
    this._endColor = new Color();
    this._endWidth = 0;
    this._endHeight = 0;
    this._endRotationAngle = 0;
    this._anchor = 1;
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;
    this._color = Colors.get_white();
    this._opacity = 0.5;
    this._rotationAngle = 0;
    this.currentRotation = 0;
    this.texture = null;
    this.texture2d = null;
    this._interpolationType = 5;
}

Overlay.defaultAnchor = 1;
Overlay.clipboardFormat = 'WorldWideTelescope.Overlay';
Overlay.nextId = 11231;
Overlay.RC = 3.1415927 / 180;

Overlay._fromXml = function (owner, overlay) {
    if (overlay.attributes == null) {
        return null;
    }
    if (overlay.attributes.getNamedItem('Type') == null) {
        return null;
    }
    var overlayClassName = overlay.attributes.getNamedItem('Type').nodeValue;
    var overLayType = ss.replaceString(overlayClassName, 'TerraViewer.', '');
    var newOverlay = null;
    switch (overLayType) {
        case 'AudioOverlay':
            newOverlay = new AudioOverlay();
            break;
        case 'BitmapOverlay':
            newOverlay = new BitmapOverlay();
            break;
        case 'FlipBookOverlay':
            newOverlay = new FlipbookOverlay();
            break;
        case 'ShapeOverlay':
            newOverlay = new ShapeOverlay();
            break;
        case 'TextOverlay':
            newOverlay = new TextOverlay();
            break;
        default:
            return null;
    }
    newOverlay._owner = owner;
    newOverlay._initOverlayFromXml(overlay);
    return newOverlay;
};

var Overlay$ = {
    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        this._name = value;
        return value;
    },

    get_owner: function () {
        return this._owner;
    },

    set_owner: function (value) {
        this._owner = value;
        return value;
    },

    get_zOrder: function () {
        var index = 0;
        var $enum1 = ss.enumerate(this._owner.get_overlays());
        while ($enum1.moveNext()) {
            var item = $enum1.current;
            if (item === this) {
                break;
            }
            index++;
        }
        return index;
    },

    get_url: function () {
        return this._url;
    },

    set_url: function (value) {
        this._url = value;
        return value;
    },

    get_linkID: function () {
        return this._linkID;
    },

    set_linkID: function (value) {
        this._linkID = value;
        return value;
    },

    play: function () { },

    pause: function () { },

    stop: function () { },

    seek: function (time) { },

    makePosition: function (centerX, centerY, offsetX, offsetY, angle) {
        centerX -= 960;
        centerY -= 558;
        var point = Vector3d.create(centerX + offsetX, centerY + offsetY, 1347);
        if (!!this._domeMatX || !!this._domeMatY || this._domeAngle !== angle) {
            this._domeMatX = centerX;
            this._domeMatY = centerY;
            this._domeMatrix = Matrix3d.translation(Vector3d.create(-centerX, -centerY, 0));
            this._domeMatrix._multiply(Matrix3d._rotationZ((angle / 180 * Math.PI)));
            this._domeMatrix._multiply(Matrix3d.translation(Vector3d.create(centerX, centerY, 0)));
        }
        point = Vector3d._transformCoordinate(point, this._domeMatrix);
        return point;
    },

    draw3D: function (renderContext, designTime) {
        if (useGl) {
            if (this.texture == null || this.isDynamic) {
                this.initializeTexture();
            }
            if (!this.isDesignTimeOnly || designTime) {
                this.initializeGeometry();
                this.updateRotation();
            }
        } else {
        }
    },

    cleanUp: function () {
        if (this.texture != null) {
            this.texture = null;
        }
        this.texture2d = null;
    },

    initializeTexture: function () { },

    // This hook exists to deal with web browser autoplay restrictions. In the
    // strictest case, we can't just start playing media files at will -- we
    // need to start playing them in response to a user-initiated event. But
    // there is a generally a scheme in which files are "unlocked" once they've
    // started to be played, and after that point we can control their playback
    // more precisely. So, this function should do any multimedia playback
    // initialization needed. It will be called when the user initiates tour
    // playback.
    //
    // Repeated calls should be idempotent.
    prepMultimedia: function () { },

    cleanUpGeometry: function () {
        this.currentRotation = 0;
        this.points = null;
    },

    initializeGeometry: function () {
        if (this.points == null) {
            this.currentRotation = 0;
            this.points = new Array(4);
            this.points[0] = new PositionColoredTextured();
            this.points[0].position = this.makePosition(this.get_x(), this.get_y(), -this.get_width() / 2, -this.get_height() / 2, this.get_rotationAngle());
            this.points[0].tu = 0;
            this.points[0].tv = 0;
            this.points[0].color = this.get_color();
            this.points[1] = new PositionColoredTextured();
            this.points[1].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 2, -this.get_height() / 2, this.get_rotationAngle());
            this.points[1].tu = 1;
            this.points[1].tv = 0;
            this.points[1].color = this.get_color();
            this.points[2] = new PositionColoredTextured();
            this.points[2].position = this.makePosition(this.get_x(), this.get_y(), -this.get_width() / 2, this.get_height() / 2, this.get_rotationAngle());
            this.points[2].tu = 0;
            this.points[2].tv = 1;
            this.points[2].color = this.get_color();
            this.points[3] = new PositionColoredTextured();
            this.points[3].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 2, this.get_height() / 2, this.get_rotationAngle());
            this.points[3].tu = 1;
            this.points[3].tv = 1;
            this.points[3].color = this.get_color();
        }
    },

    updateRotation: function () { },

    // Animation Support

    get_animate: function () {
        return this._animate;
    },

    set_animate: function (value) {
        if (this._animate !== value) {
            this._animate = value;
            if (this._animate) {
                this._endX = this._x;
                this._endY = this._y;
                this._endRotationAngle = this._rotationAngle;
                this._endColor = this._color;
                this._endWidth = this._width;
                this._endHeight = this._height;
                this.cleanUpGeometry();
            }
            else {
                this._endX = this._x = this.get_x();
                this._endY = this._y = this.get_y();
                this._endRotationAngle = this._rotationAngle = this.get_rotationAngle();
                this._endColor = this._color = this.get_color();
                this._endWidth = this._width = this.get_width();
                this._endHeight = this._height = this.get_height();
                this.cleanUpGeometry();
                this._tweenFactor = 0;
            }
        }
        return value;
    },

    get_tweenFactor: function () {
        return this._tweenFactor;
    },

    set_tweenFactor: function (value) {
        if (!this._animate) {
            this._tweenFactor = 0;
        } else {
            if (this._tweenFactor !== value) {
                this._tweenFactor = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_anchor: function () {
        return this._anchor;
    },

    set_anchor: function (value) {
        this._anchor = value;
        return value;
    },

    get_position: function () {
        return Vector2d.create(this.get_x(), this.get_y());
    },

    set_position: function (value) {
        this.set_x(value.x);
        this.set_y(value.y);
        return value;
    },

    get_x: function () {
        return (this._x * (1 - this._tweenFactor)) + (this._endX * this._tweenFactor);
    },

    set_x: function (value) {
        if (this._tweenFactor < 0.5) {
            if (this._x !== value) {
                this._x = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endX !== value) {
                this._endX = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_y: function () {
        return (this._y * (1 - this._tweenFactor)) + (this._endY * this._tweenFactor);
    },

    set_y: function (value) {
        if (this._tweenFactor < 0.5) {
            if (this._y !== value) {
                this._y = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endY !== value) {
                this._endY = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_width: function () {
        return (this._width * (1 - this._tweenFactor)) + (this._endWidth * this._tweenFactor);
    },

    set_width: function (value) {
        if (value < 5 && !!value) {
            value = 5;
        }
        if (this._tweenFactor < 0.5) {
            if (this._width !== value) {
                this._width = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endWidth !== value) {
                this._endWidth = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_height: function () {
        return (this._height * (1 - this._tweenFactor)) + (this._endHeight * this._tweenFactor);
    },

    set_height: function (value) {
        if (value < 5 && !!value) {
            value = 5;
        }
        if (this._tweenFactor < 0.5) {
            if (this._height !== value) {
                this._height = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endHeight !== value) {
                this._endHeight = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_color: function () {
        var red = ss.truncate(((this._color.r * (1 - this._tweenFactor)) + (this._endColor.r * this._tweenFactor)));
        var green = ss.truncate(((this._color.g * (1 - this._tweenFactor)) + (this._endColor.g * this._tweenFactor)));
        var blue = ss.truncate(((this._color.b * (1 - this._tweenFactor)) + (this._endColor.b * this._tweenFactor)));
        var alpha = ss.truncate(((this._color.a * (1 - this._tweenFactor)) + (this._endColor.a * this._tweenFactor)));
        return Color.fromArgb(Math.max(0, Math.min(255, alpha)), Math.max(0, Math.min(255, red)), Math.max(0, Math.min(255, green)), Math.max(0, Math.min(255, blue)));
    },

    set_color: function (value) {
        if (this._tweenFactor < 0.5) {
            if (this._color !== value) {
                this._color = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endColor !== value) {
                this._endColor = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    get_opacity: function () {
        return this.get_color().a / 255;
    },

    set_opacity: function (value) {
        var col = this.get_color();
        this.set_color(Color.fromArgb(Math.min(255, ss.truncate((value * 255))), col.r, col.g, col.b));
        this._opacity = value;
        return value;
    },

    get_rotationAngle: function () {
        return (this._rotationAngle * (1 - this._tweenFactor)) + (this._endRotationAngle * this._tweenFactor);
    },

    set_rotationAngle: function (value) {
        if (this._tweenFactor < 0.5) {
            if (this._rotationAngle !== value) {
                this._rotationAngle = value;
                this.cleanUpGeometry();
            }
        } else {
            if (this._endRotationAngle !== value) {
                this._endRotationAngle = value;
                this.cleanUpGeometry();
            }
        }
        return value;
    },

    hitTest: function (pntTest) {
        var tempPoints = new Array(1);
        tempPoints[0] = Vector2d.create(pntTest.x, pntTest.y);
        var mat = Matrix2d.rotateAt(-this.get_rotationAngle() / 180 * Math.PI, Vector2d.create(this.get_x(), this.get_y()));
        mat._transformPoints(tempPoints);
        var rect = Rectangle.create((this.get_x() - (this.get_width() / 2)), (this.get_y() - (this.get_height() / 2)), this.get_width(), this.get_height());
        return rect.contains(tempPoints[0]);
    },

    get_bounds: function () {
        return this._bounds;
    },

    set_bounds: function (value) {
        this._bounds = value;
        return value;
    },

    get_interpolationType: function () {
        return this._interpolationType;
    },

    set_interpolationType: function (value) {
        this._interpolationType = value;
        return value;
    },

    saveToXml: function (xmlWriter, saveKeys) {
        xmlWriter._writeStartElement('Overlay');
        xmlWriter._writeAttributeString('Id', this.id);
        xmlWriter._writeAttributeString('Type', this.getTypeName());
        xmlWriter._writeAttributeString('Name', this.get_name());
        xmlWriter._writeAttributeString('X', this._x.toString());
        xmlWriter._writeAttributeString('Y', this._y.toString());
        xmlWriter._writeAttributeString('Width', this._width.toString());
        xmlWriter._writeAttributeString('Height', this._height.toString());
        xmlWriter._writeAttributeString('Rotation', this._rotationAngle.toString());
        xmlWriter._writeAttributeString('Color', this._color.save());
        xmlWriter._writeAttributeString('Url', this._url);
        xmlWriter._writeAttributeString('LinkID', this._linkID);
        xmlWriter._writeAttributeString('Animate', this._animate.toString());
        if (this._animate) {
            xmlWriter._writeAttributeString('EndX', this._endX.toString());
            xmlWriter._writeAttributeString('EndY', this._endY.toString());
            xmlWriter._writeAttributeString('EndWidth', this._endWidth.toString());
            xmlWriter._writeAttributeString('EndHeight', this._endHeight.toString());
            xmlWriter._writeAttributeString('EndRotation', this._endRotationAngle.toString());
            xmlWriter._writeAttributeString('EndColor', this._endColor.save());
            xmlWriter._writeAttributeString('InterpolationType', Enums.toXml('InterpolationType', this._interpolationType));
        }
        xmlWriter._writeAttributeString('Anchor', Enums.toXml('OverlayAnchor', this._anchor));
        this.writeOverlayProperties(xmlWriter);
        xmlWriter._writeEndElement();
    },

    getTypeName: function () {
        return 'TerraViewer.Overlay';
    },

    addFilesToCabinet: function (fc) { },

    writeOverlayProperties: function (xmlWriter) { },

    _initOverlayFromXml: function (node) {
        this.id = node.attributes.getNamedItem('Id').nodeValue;
        this.set_name(node.attributes.getNamedItem('Name').nodeValue);
        this._x = parseFloat(node.attributes.getNamedItem('X').nodeValue);
        this._y = parseFloat(node.attributes.getNamedItem('Y').nodeValue);
        this._width = parseFloat(node.attributes.getNamedItem('Width').nodeValue);
        this._height = parseFloat(node.attributes.getNamedItem('Height').nodeValue);
        this._rotationAngle = parseFloat(node.attributes.getNamedItem('Rotation').nodeValue);
        this._color = Color.load(node.attributes.getNamedItem('Color').nodeValue);
        if (node.attributes.getNamedItem('Url') != null) {
            this.set_url(node.attributes.getNamedItem('Url').nodeValue);
        }
        if (node.attributes.getNamedItem('LinkID') != null) {
            this.set_linkID(node.attributes.getNamedItem('LinkID').nodeValue);
        }
        if (node.attributes.getNamedItem('Animate') != null) {
            this._animate = ss.boolean(node.attributes.getNamedItem('Animate').nodeValue);
            if (this._animate) {
                this._endX = parseFloat(node.attributes.getNamedItem('EndX').nodeValue);
                this._endY = parseFloat(node.attributes.getNamedItem('EndY').nodeValue);
                this._endColor = Color.load(node.attributes.getNamedItem('EndColor').nodeValue);
                this._endWidth = parseFloat(node.attributes.getNamedItem('EndWidth').nodeValue);
                this._endHeight = parseFloat(node.attributes.getNamedItem('EndHeight').nodeValue);
                this._endRotationAngle = parseFloat(node.attributes.getNamedItem('EndRotation').nodeValue);
                if (node.attributes.getNamedItem('InterpolationType') != null) {
                    this.set_interpolationType(Enums.parse('InterpolationType', node.attributes.getNamedItem('InterpolationType').nodeValue));
                }
            }
        }
        this.initializeFromXml(node);
    },

    initializeFromXml: function (node) { },

    toString: function () {
        return this.get_name();
    }
};

registerType("Overlay", [Overlay, Overlay$, null]);

// wwtlib.BitmapOverlay

export function BitmapOverlay() {
    this._textureReady$1 = false;
    this._sprite$1 = new Sprite2d();
    Overlay.call(this);
}

//todo figure out how to load local files into cloud and to cabinet
BitmapOverlay.create = function (owner, file) {
    var temp = new BitmapOverlay();
    temp.set_owner(owner);
    // to make directory and guid filename in tour temp dir.
    temp._filename$1 = file.name;
    temp.set_name(owner.getNextDefaultName('Image'));
    temp.set_x(0);
    temp.set_y(0);
    owner.get_owner().addCachedFile(file.name, file);
    return temp;
};

var BitmapOverlay$ = {
    getTypeName: function () {
        return 'TerraViewer.BitmapOverlay';
    },

    copy: function (owner) {
        var newBmpOverlay = new BitmapOverlay();
        newBmpOverlay.set_owner(owner);
        newBmpOverlay._filename$1 = this._filename$1;
        newBmpOverlay.set_x(this.get_x());
        newBmpOverlay.set_y(this.get_y());
        newBmpOverlay.set_width(this.get_width());
        newBmpOverlay.set_height(this.get_height());
        newBmpOverlay.set_color(this.get_color());
        newBmpOverlay.set_opacity(this.get_opacity());
        newBmpOverlay.set_rotationAngle(this.get_rotationAngle());
        newBmpOverlay.set_name(this.get_name() + ' - Copy');
        return newBmpOverlay;
    },

    cleanUp: function () {
        this.texture = null;
        if (this.texture2d != null) {
            this.texture2d.cleanUp();
            this.texture2d = null;
        }
    },

    initializeTexture: function () {
        var $this = this;

        try {
            if (useGl) {
                this.texture2d = this.get_owner().get_owner().getCachedTexture2d(this._filename$1);
                this._textureReady$1 = true;
            }
            else {
                this.texture = this.get_owner().get_owner().getCachedTexture(this._filename$1, function () {
                    $this._textureReady$1 = true;
                });
            }
        }
        catch ($e1) {
        }
    },

    draw3D: function (renderContext, designTime) {
        if (useGl) {
            if (this.texture2d == null) {
                this.initializeTexture();
            }
            if (!this.get_width() && !this.get_height()) {
                this.set_width(this.texture2d.imageElement.width);
                this.set_height(this.texture2d.imageElement.height);
            }
            this.initializeGeometry();
            this.updateRotation();
            this._sprite$1.draw(renderContext, this.points, this.points.length, this.texture2d, true, 1);
        } else {
            if (this.texture == null) {
                this.initializeTexture();
            }
            if (!this._textureReady$1) {
                return;
            }
            if (!this.get_width() && !this.get_height()) {
                this.set_width(this.texture.width);
                this.set_height(this.texture.height);
            }
            var ctx = renderContext.device;
            ctx.save();
            ctx.translate(this.get_x(), this.get_y());
            ctx.rotate(this.get_rotationAngle() * Overlay.RC);
            ctx.globalAlpha = this.get_opacity();
            ctx.drawImage(this.texture, -this.get_width() / 2, -this.get_height() / 2, this.get_width(), this.get_height());
            ctx.restore();
        }
    },

    addFilesToCabinet: function (fc) {
        fc.addFile(this.get_owner().get_owner().get_workingDirectory() + this._filename$1, this.get_owner().get_owner().getFileBlob(this._filename$1));
    },

    writeOverlayProperties: function (xmlWriter) {
        xmlWriter._writeStartElement('Bitmap');
        xmlWriter._writeAttributeString('Filename', this._filename$1);
        xmlWriter._writeEndElement();
    },

    initializeFromXml: function (node) {
        var bitmap = Util.selectSingleNode(node, 'Bitmap');
        this._filename$1 = bitmap.attributes.getNamedItem('Filename').nodeValue;
    }
};

registerType("BitmapOverlay", [BitmapOverlay, BitmapOverlay$, Overlay]);

// wwtlib.TextOverlay

export function TextOverlay() {
    this._sprite$1 = new Sprite2d();
    this._ctx$1 = null;
    this._ce$1 = null;
    Overlay.call(this);
}

TextOverlay.create = function (textObject) {
    var to = new TextOverlay();
    to.textObject = textObject;
    to._calculateTextSize$1();
    return to;
};

var TextOverlay$ = {
    getTypeName: function () {
        return 'TerraViewer.TextOverlay';
    },

    get_color: function () {
        return Overlay.prototype.get_color.call(this);
    },

    set_color: function (value) {
        if (this.textObject.foregroundColor !== value) {
            this.textObject.foregroundColor = value;
            Overlay.prototype.set_color.call(this, value);
            this.cleanUp();
        }
        return value;
    },

    draw3D: function (renderContext, designTime) {
        if (useGl) {
            this.initializeTexture();
            this.initializeGeometry();
            this.updateRotation();
            this._sprite$1.draw(renderContext, this.points, this.points.length, this.texture2d, true, 1);
        } else {
            var ctx = renderContext.device;
            ctx.save();
            ctx.translate(this.get_x(), this.get_y());
            ctx.rotate(this.get_rotationAngle() * Overlay.RC);
            ctx.globalAlpha = this.get_opacity();
            this._drawCanvasText$1(ctx);
            ctx.restore();
        }
    },
    _drawCanvasText$1: function (ctx) {
        ctx.fillStyle = this.textObject.foregroundColor.toString();
        ctx.font = ((this.textObject.italic) ? 'italic' : 'normal') + ' ' + ((this.textObject.bold) ? 'bold' : 'normal') + ' ' + Math.round(this.textObject.fontSize * 1.2).toString() + 'px ' + this.textObject.fontName;
        ctx.textBaseline = 'top';
        var text = this.textObject.text;
        if (text.indexOf('{$') > -1) {
            if (text.indexOf('{$DATE}') > -1) {
                var date = ss.format('{0:yyyy/MM/dd}', SpaceTimeController.get_now());
                text = ss.replaceString(text, '{$DATE}', date);
            }
            if (text.indexOf('{$TIME}') > -1) {
                var time = ss.format('{0:HH:mm:ss}', SpaceTimeController.get_now());
                text = ss.replaceString(text, '{$TIME}', time);
            }
            text = ss.replaceString(text, '{$DIST}', UiTools.formatDistance(globalRenderContext.get_solarSystemCameraDistance()));
            text = ss.replaceString(text, '{$LAT}', Coordinates.formatDMS(globalRenderContext.viewCamera.lat));
            text = ss.replaceString(text, '{$LNG}', Coordinates.formatDMS(globalRenderContext.viewCamera.lat));
            text = ss.replaceString(text, '{$RA}', Coordinates.formatDMS(globalRenderContext.viewCamera.get_RA()));
            text = ss.replaceString(text, '{$DEC}', Coordinates.formatDMS(globalRenderContext.viewCamera.get_dec()));
            text = ss.replaceString(text, '{$FOV}', Coordinates.formatDMS(globalRenderContext.get_fovAngle()));
        }
        var lines = text.split('\n');
        var baseline = -(this.get_height() / 2);
        var lineSpace = this.textObject.fontSize * 1.7;
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var line = $enum1.current;
            var parts = Util.getWrappedText(ctx, line, this.get_width());
            var $enum2 = ss.enumerate(parts);
            while ($enum2.moveNext()) {
                var part = $enum2.current;
                ctx.fillText(part, -this.get_width() / 2, baseline);
                baseline += lineSpace;
            }
        }
    },
    _calculateTextSize$1: function () {
        if (this._ctx$1 == null || this._ce$1 == null) {
            this._ce$1 = document.createElement('canvas');
            this._ce$1.height = 100;
            this._ce$1.width = 100;
            this._ctx$1 = this._ce$1.getContext('2d');
        }
        this._ctx$1.fillStyle = this.textObject.foregroundColor.toString();
        this._ctx$1.font = ((this.textObject.italic) ? 'italic' : 'normal') + ' ' + ((this.textObject.bold) ? 'bold' : 'normal') + ' ' + Math.round(this.textObject.fontSize * 1.2).toString() + 'px ' + this.textObject.fontName;
        this._ctx$1.textBaseline = 'top';
        var text = this.textObject.text;
        if (text.indexOf('{$') > -1) {
            if (text.indexOf('{$DATE}') > -1) {
                var date = ss.format('{0:yyyy/MM/dd}', SpaceTimeController.get_now());
                text = ss.replaceString(text, '{$DATE}', date);
            }
            if (text.indexOf('{$TIME}') > -1) {
                var time = ss.format('{0:HH:mm:ss}', SpaceTimeController.get_now());
                text = ss.replaceString(text, '{$TIME}', time);
            }
            text = ss.replaceString(text, '{$DIST}', UiTools.formatDistance(globalRenderContext.get_solarSystemCameraDistance()));
            text = ss.replaceString(text, '{$LAT}', Coordinates.formatDMS(globalRenderContext.viewCamera.lat));
            text = ss.replaceString(text, '{$LNG}', Coordinates.formatDMS(globalRenderContext.viewCamera.lat));
            text = ss.replaceString(text, '{$RA}', Coordinates.formatDMS(globalRenderContext.viewCamera.get_RA()));
            text = ss.replaceString(text, '{$DEC}', Coordinates.formatDMS(globalRenderContext.viewCamera.get_dec()));
            text = ss.replaceString(text, '{$FOV}', Coordinates.formatDMS(globalRenderContext.get_fovAngle()));
        }
        var lines = text.split('\n');
        var baseline = 0;
        var lineSpace = this.textObject.fontSize * 1.7;
        var maxWidth = 0;
        var $enum1 = ss.enumerate(lines);
        while ($enum1.moveNext()) {
            var line = $enum1.current;
            var width = this._ctx$1.measureText(line).width;
            maxWidth = Math.max(width, maxWidth);
            baseline += lineSpace;
        }

        //Width + fudge factor
        this.set_width(maxWidth * 1.01);
        this.set_height(baseline);
        this._ce$1 = null;
        this._ctx$1 = null;
    },

    initializeTexture: function () {
        if (this.texture2d == null || (this.textObject.text.indexOf('{$') > -1)) {
            if (!this.get_height() || !this.get_width()) {
                this._calculateTextSize$1();
            }
            if (this._ctx$1 == null || this._ce$1 == null) {
                this._ce$1 = document.createElement('canvas');
                this._ce$1.height = ss.truncate(this.get_height());
                this._ce$1.width = ss.truncate(this.get_width());
                this._ctx$1 = this._ce$1.getContext('2d');
            }
            this._ctx$1.translate(this.get_width() / 2, this.get_height() / 2);
            this._ctx$1.clearRect(0, 0, this.get_width(), this.get_height());
            this._drawCanvasText$1(this._ctx$1);
            this.texture2d = new Texture();
            this.texture2d.imageElement = this._ce$1;
            this.texture2d.makeTexture();
            this._ce$1 = null;
            this._ctx$1 = null;
        }
    },

    writeOverlayProperties: function (xmlWriter) {
        xmlWriter._writeStartElement('Text');
        this.textObject._saveToXml(xmlWriter);
        xmlWriter._writeEndElement();
    },

    initializeFromXml: function (node) {
        var text = Util.selectSingleNode(node, 'Text');
        this.textObject = TextObject._fromXml(Util.selectSingleNode(text, 'TextObject'));
    },

    initializeGeometry: function () {
        if (useGl) {
            Overlay.prototype.initializeGeometry.call(this);
        }
    }
};

registerType("TextOverlay", [TextOverlay, TextOverlay$, Overlay]);

// wwtlib.ShapeOverlay

export function ShapeOverlay() {
    this._shapeType$1 = 1;
    this._sprite$1 = new Sprite2d();
    this._triangleStrip$1 = true;
    Overlay.call(this);
}

ShapeOverlay._create = function (currentTourStop, shapeType) {
    var overlay = new ShapeOverlay();
    overlay._shapeType$1 = shapeType;
    overlay.set_owner(currentTourStop);
    return overlay;
};

var ShapeOverlay$ = {
    getTypeName: function () {
        return 'TerraViewer.ShapeOverlay';
    },

    get_shapeType: function () {
        return this._shapeType$1;
    },

    set_shapeType: function (value) {
        this._shapeType$1 = value;
        this.cleanUpGeometry();
        return value;
    },

    draw3D: function (renderContext, designTime) {
        if (useGl) {
            this.initializeGeometry();
            this._sprite$1.draw(renderContext, this.points, this.points.length, null, this._triangleStrip$1, this.get_opacity());
        } else {
            switch (this._shapeType$1) {
                case 0:
                    this._drawCircleGeometry$1(renderContext);
                    break;
                case 1:
                    this._drawRectGeometry$1(renderContext);
                    break;
                case 6:
                    this._drawOpenRectGeometry$1(renderContext);
                    break;
                case 2:
                    this._drawStarGeometry$1(renderContext);
                    break;
                case 3:
                    this._drawDonutGeometry$1(renderContext);
                    break;
                case 4:
                    this._drawArrowGeometry$1(renderContext);
                    break;
                case 5:
                    this._drawLineGeometry$1(renderContext);
                    break;
                default:
                    break;
            }
        }
    },

    initializeGeometry: function () {
        if (this.points == null) {
            switch (this._shapeType$1) {
                case 0:
                    this._createCircleGeometry$1();
                    break;
                case 1:
                    Overlay.prototype.initializeGeometry.call(this);
                    break;
                case 6:
                    this._createOpenRectGeometry$1();
                    break;
                case 2:
                    this._createStarGeometry$1();
                    break;
                case 3:
                    this._createDonutGeometry$1();
                    break;
                case 4:
                    this._createArrowGeometry$1();
                    break;
                case 5:
                    this._createLineGeometry$1();
                    break;
                default:
                    break;
            }
        }
    },
    _createLineGeometry$1: function () {
        var centerX = this.get_x();
        var centerY = this.get_y();
        var radius = this.get_width() / 2;
        var length = this.get_width();
        var segments = ss.truncate((length / 12)) + 1;
        var radiansPerSegment = (Math.PI * 2) / segments;
        if (this.points == null) {
            this.points = new Array(segments * 2 + 2);
        }
        for (var j = 0; j <= segments; j++) {
            var i = j * 2;
            this.points[i] = new PositionColoredTextured();
            this.points[i].position = this.makePosition(this.get_x(), this.get_y(), ((j / segments) * this.get_width() - (this.get_width() / 2)), 6, this.get_rotationAngle());
            this.points[i].tu = (j % 2);
            this.points[i].tv = 0;
            this.points[i].color = this.get_color();
            this.points[i + 1] = new PositionColoredTextured();
            this.points[i + 1].position = this.makePosition(this.get_x(), this.get_y(), ((j / segments) * this.get_width() - (this.get_width() / 2)), -6, this.get_rotationAngle());
            this.points[i + 1].tu = (j % 2);
            this.points[i + 1].tv = 1;
            this.points[i + 1].color = this.get_color();
        }
    },
    _createOpenRectGeometry$1: function () {
        var centerX = this.get_x();
        var centerY = this.get_y();
        var radius = this.get_width() / 2;
        var length = this.get_width();
        var segments = ss.truncate((length / 12)) + 1;
        var segmentsHigh = ss.truncate((this.get_height() / 12)) + 1;
        var totalPoints = (((segments + 1) * 2) + ((segmentsHigh + 1) * 2)) * 2;
        if (this.points == null) {
            this.points = new Array(totalPoints);
        }
        for (var j = 0; j <= segments; j++) {
            var i = j * 2;
            this.points[i] = new PositionColoredTextured();
            this.points[i].position = this.makePosition(centerX, centerY, (j / segments) * this.get_width() - (this.get_width() / 2), (this.get_height() / 2), this.get_rotationAngle());
            this.points[i].tu = (j % 2);
            this.points[i].tv = 0;
            this.points[i].color = this.get_color();
            this.points[i + 1] = new PositionColoredTextured();
            this.points[i + 1].position = this.makePosition(centerX, centerY, (j / segments) * this.get_width() - (this.get_width() / 2), ((this.get_height() / 2) - 12), this.get_rotationAngle());
            this.points[i + 1].tu = (j % 2);
            this.points[i + 1].tv = 1;
            this.points[i + 1].color = this.get_color();
            var k = (((segments + 1) * 4) + ((segmentsHigh + 1) * 2) - 2) - i;
            this.points[k] = new PositionColoredTextured();
            this.points[k].position = this.makePosition(centerX, centerY, (j / segments) * this.get_width() - (this.get_width() / 2), (-(this.get_height() / 2)) + 12, this.get_rotationAngle());
            this.points[k].tu = (j % 2);
            this.points[k].tv = 0;
            this.points[k].color = this.get_color();
            this.points[k + 1] = new PositionColoredTextured();
            this.points[k + 1].position = this.makePosition(centerX, centerY, (j / segments) * this.get_width() - (this.get_width() / 2), (-(this.get_height() / 2)), this.get_rotationAngle());
            this.points[k + 1].tu = (j % 2);
            this.points[k + 1].tv = 1;
            this.points[k + 1].color = this.get_color();
        }
        var offset = ((segments + 1) * 2);
        for (var j = 0; j <= segmentsHigh; j++) {
            var top = ((segmentsHigh + 1) * 2) + offset - 2;
            var i = j * 2;
            this.points[top - i] = new PositionColoredTextured();
            this.points[top - i].position = this.makePosition(centerX, centerY, (this.get_width() / 2), ((j / segmentsHigh) * this.get_height() - (this.get_height() / 2)), this.get_rotationAngle());
            this.points[top - i].tu = (j % 2);
            this.points[top - i].tv = 0;
            this.points[top - i].color = this.get_color();
            this.points[top - i + 1] = new PositionColoredTextured();
            this.points[top - i + 1].position = this.makePosition(centerX, centerY, ((this.get_width() / 2) - 12), ((j / segmentsHigh) * this.get_height() - (this.get_height() / 2)), this.get_rotationAngle());
            this.points[top - i + 1].tu = (j % 2);
            this.points[top - i + 1].tv = 1;
            this.points[top - i + 1].color = this.get_color();
            var k = i + ((segments + 1) * 4) + ((segmentsHigh + 1) * 2);
            this.points[k] = new PositionColoredTextured();
            this.points[k].position = this.makePosition(centerX, centerY, (-(this.get_width() / 2) + 12), ((j / segmentsHigh) * this.get_height() - (this.get_height() / 2)), this.get_rotationAngle());
            this.points[k].tu = (j % 2);
            this.points[k].tv = 0;
            this.points[k].color = this.get_color();
            this.points[k + 1] = new PositionColoredTextured();
            this.points[k + 1].position = this.makePosition(centerX, centerY, (-(this.get_width() / 2)), ((j / segmentsHigh) * this.get_height() - (this.get_height() / 2)), this.get_rotationAngle());
            this.points[k + 1].tu = (j % 2);
            this.points[k + 1].tv = 1;
            this.points[k + 1].color = this.get_color();
        }
    },
    _createStarGeometry$1: function () {
        var centerX = this.get_x();
        var centerY = this.get_y();
        var radius = this.get_width() / 2;
        var radiansPerSegment = (Math.PI * 2) / 5;
        if (this.points == null) {
            this.points = new Array(12);
        }
        if (this._pnts$1 == null) {
            this._pnts$1 = new Array(10);
        }
        for (var i = 0; i < 5; i++) {
            var rads = i * radiansPerSegment - (Math.PI / 2);
            this._pnts$1[i] = new PositionColoredTextured();
            this._pnts$1[i].position = this.makePosition(centerX, centerY, (Math.cos(rads) * (this.get_width() / 2)), (Math.sin(rads) * (this.get_height() / 2)), this.get_rotationAngle());
            this._pnts$1[i].tu = 0;
            this._pnts$1[i].tv = 0;
            this._pnts$1[i].color = this.get_color();
        }
        for (var i = 5; i < 10; i++) {
            var rads = i * radiansPerSegment + (radiansPerSegment / 2) - (Math.PI / 2);
            this._pnts$1[i] = new PositionColoredTextured();
            this._pnts$1[i].position = this.makePosition(centerX, centerY, (Math.cos(rads) * (this.get_width() / 5.3)), (Math.sin(rads) * (this.get_height() / 5.3)), this.get_rotationAngle());
            this._pnts$1[i].tu = 0;
            this._pnts$1[i].tv = 0;
            this._pnts$1[i].color = this.get_color();
        }
        this.points[0] = this._pnts$1[0];
        this.points[1] = this._pnts$1[5];
        this.points[2] = this._pnts$1[9];
        this.points[3] = this._pnts$1[1];
        this.points[4] = this._pnts$1[7];
        this.points[5] = this._pnts$1[4];
        this.points[6] = this._pnts$1[6];
        this.points[7] = this._pnts$1[2];
        this.points[8] = this._pnts$1[7];
        this.points[9] = this._pnts$1[7];
        this.points[10] = this._pnts$1[3];
        this.points[11] = this._pnts$1[8];
        this._triangleStrip$1 = false;
    },
    _createArrowGeometry$1: function () {
        if (this.points == null) {
            this.points = new Array(9);
        }
        this.points[0] = new PositionColoredTextured();
        this.points[0].position = this.makePosition(this.get_x(), this.get_y(), -this.get_width() / 2, -this.get_height() / 4, this.get_rotationAngle());
        this.points[0].tu = 0;
        this.points[0].tv = 0;
        this.points[0].color = this.get_color();
        this.points[1] = new PositionColoredTextured();
        this.points[1].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 4, -this.get_height() / 4, this.get_rotationAngle());
        this.points[1].tu = 1;
        this.points[1].tv = 0;
        this.points[1].color = this.get_color();
        this.points[2] = new PositionColoredTextured();
        this.points[2].position = this.makePosition(this.get_x(), this.get_y(), -this.get_width() / 2, this.get_height() / 4, this.get_rotationAngle());
        this.points[2].tu = 0;
        this.points[2].tv = 1;
        this.points[2].color = this.get_color();
        this.points[3] = new PositionColoredTextured();
        this.points[3].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 4, -this.get_height() / 4, this.get_rotationAngle());
        this.points[3].tu = 1;
        this.points[3].tv = 0;
        this.points[3].color = this.get_color();
        this.points[4] = new PositionColoredTextured();
        this.points[4].position = this.makePosition(this.get_x(), this.get_y(), -this.get_width() / 2, this.get_height() / 4, this.get_rotationAngle());
        this.points[4].tu = 0;
        this.points[4].tv = 1;
        this.points[4].color = this.get_color();
        this.points[5] = new PositionColoredTextured();
        this.points[5].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 4, this.get_height() / 4, this.get_rotationAngle());
        this.points[5].tu = 1;
        this.points[5].tv = 1;
        this.points[5].color = this.get_color();
        this.points[6] = new PositionColoredTextured();
        this.points[6].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 4, -this.get_height() / 2, this.get_rotationAngle());
        this.points[6].tu = 1;
        this.points[6].tv = 1;
        this.points[6].color = this.get_color();
        this.points[7] = new PositionColoredTextured();
        this.points[7].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 2, 0, this.get_rotationAngle());
        this.points[7].tu = 1;
        this.points[7].tv = 0.5;
        this.points[7].color = this.get_color();
        this.points[8] = new PositionColoredTextured();
        this.points[8].position = this.makePosition(this.get_x(), this.get_y(), this.get_width() / 4, this.get_height() / 2, this.get_rotationAngle());
        this.points[8].tu = 1;
        this.points[8].tv = 1;
        this.points[8].color = this.get_color();
        this._triangleStrip$1 = false;
    },
    _createDonutGeometry$1: function () {
        var centerX = this.get_x();
        var centerY = this.get_y();
        var radius = this.get_width() / 2;
        var circumference = Math.PI * 2 * radius;
        var segments = ss.truncate((circumference / 12)) + 1;
        var radiansPerSegment = (Math.PI * 2) / segments;
        if (this.points == null) {
            this.points = new Array(segments * 2 + 2);
        }
        for (var j = 0; j <= segments; j++) {
            var i = j * 2;
            this.points[i] = new PositionColoredTextured();
            this.points[i].position = this.makePosition(centerX, centerY, (Math.cos(j * radiansPerSegment) * (this.get_width() / 2)), (Math.sin(j * radiansPerSegment) * (this.get_height() / 2)), this.get_rotationAngle());
            this.points[i].tu = (j % 2);
            this.points[i].tv = 0;
            this.points[i].color = this.get_color();
            this.points[i + 1] = new PositionColoredTextured();
            this.points[i + 1].position = this.makePosition(centerX, centerY, (Math.cos(j * radiansPerSegment) * ((this.get_width() / 2) - 10)), (Math.sin(j * radiansPerSegment) * ((this.get_height() / 2) - 10)), this.get_rotationAngle());
            this.points[i + 1].tu = (j % 2);
            this.points[i + 1].tv = 1;
            this.points[i + 1].color = this.get_color();
        }
    },
    _createCircleGeometry$1: function () {
        var centerX = this.get_x();
        var centerY = this.get_y();
        var radius = this.get_width() / 2;
        var circumference = Math.PI * 2 * radius;
        var segments = ss.truncate((circumference / 12)) + 1;
        var radiansPerSegment = (Math.PI * 2) / segments;
        if (this.points == null) {
            this.points = new Array(segments * 2 + 2);
        }
        for (var j = 0; j <= segments; j++) {
            var i = j * 2;
            this.points[i] = new PositionColoredTextured();
            this.points[i].position = this.makePosition(centerX, centerY, (Math.cos(j * radiansPerSegment) * (this.get_width() / 2)), (Math.sin(j * radiansPerSegment) * (this.get_height() / 2)), this.get_rotationAngle());
            this.points[i].tu = (j % 2);
            this.points[i].tv = 0;
            this.points[i].color = this.get_color();
            this.points[i + 1] = new PositionColoredTextured();
            this.points[i + 1].position = this.makePosition(centerX, centerY, 0, 0, this.get_rotationAngle());
            this.points[i + 1].tu = (j % 2);
            this.points[i + 1].tv = 1;
            this.points[i + 1].color = this.get_color();
        }
    },

    initializeTexture: function () {
        switch (this.get_shapeType()) {
            case 5:
            case 3:
            case 6:
                break;
            case 0:
            case 1:
            case 2:
            case 4:
            default:
                this.texture = null;
                break;
        }
    },

    //todo this needs to be Dashed rounded lines..
    _drawLineGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        var radius = this.get_width() / 2;
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.moveTo(-radius, 0);
        ctx.lineTo(radius, 0);
        ctx.lineWidth = 9;
        ctx.strokeStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.stroke();
        ctx.restore();
    },

    _drawOpenRectGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        ctx.moveTo(-this.get_width() / 2, -this.get_height() / 2);
        ctx.lineTo(this.get_width() / 2, -this.get_height() / 2);
        ctx.lineTo(this.get_width() / 2, this.get_height() / 2);
        ctx.lineTo(-this.get_width() / 2, this.get_height() / 2);
        ctx.closePath();
        ctx.lineWidth = 9;
        ctx.strokeStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.stroke();
        ctx.restore();
    },

    _drawRectGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        ctx.moveTo(-this.get_width() / 2, -this.get_height() / 2);
        ctx.lineTo(this.get_width() / 2, -this.get_height() / 2);
        ctx.lineTo(this.get_width() / 2, this.get_height() / 2);
        ctx.lineTo(-this.get_width() / 2, this.get_height() / 2);
        ctx.closePath();
        ctx.lineWidth = 0;
        ctx.fillStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.fill();
        ctx.restore();
    },

    _drawStarGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        var centerX = 0;
        var centerY = 0;
        var radius = this.get_width() / 2;
        var radiansPerSegment = (Math.PI * 2) / 5;
        var first = true;
        for (var i = 0; i < 5; i++) {
            var rads = i * radiansPerSegment - (Math.PI / 2);
            if (first) {
                first = false;
                ctx.moveTo(centerX + Math.cos(rads) * (this.get_width() / 2), centerY + Math.sin(rads) * (this.get_height() / 2));
            }
            else {
                ctx.lineTo(centerX + Math.cos(rads) * (this.get_width() / 2), centerY + Math.sin(rads) * (this.get_height() / 2));
            }
            var rads2 = i * radiansPerSegment + (radiansPerSegment / 2) - (Math.PI / 2);
            ctx.lineTo(centerX + Math.cos(rads2) * (this.get_width() / 5.3), centerY + Math.sin(rads2) * (this.get_height() / 5.3));
        }
        ctx.closePath();
        ctx.lineWidth = 0;
        ctx.fillStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.fill();
        ctx.restore();
    },

    _drawArrowGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        ctx.moveTo((-(this.get_width() / 2)), (-(this.get_height() / 4)));
        ctx.lineTo((this.get_width() / 4), (-(this.get_height() / 4)));
        ctx.lineTo((this.get_width() / 4), (-(this.get_height() / 2)));
        ctx.lineTo((this.get_width() / 2), 0);
        ctx.lineTo((this.get_width() / 4), (this.get_height() / 2));
        ctx.lineTo((this.get_width() / 4), (this.get_height() / 4));
        ctx.lineTo((-(this.get_width() / 2)), (this.get_height() / 4));
        ctx.closePath();
        ctx.lineWidth = 0;
        ctx.fillStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.fill();
        ctx.restore();
    },

    //todo move to dashed lines in future
    _drawDonutGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.translate(this.get_x(), this.get_y());
        ctx.scale(1, this.get_height() / this.get_width());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        ctx.arc(0, 0, this.get_width() / 2, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.lineWidth = 9;
        ctx.strokeStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.stroke();
        ctx.restore();
    },

    _drawCircleGeometry$1: function (renderContext) {
        var ctx = renderContext.device;
        ctx.save();
        ctx.scale(1, this.get_width() / this.get_height());
        ctx.translate(this.get_x(), this.get_y());
        ctx.rotate(this.get_rotationAngle() * Overlay.RC);
        ctx.beginPath();
        ctx.arc(0, 0, this.get_width(), 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.lineWidth = 0;
        ctx.fillStyle = this.get_color().toString();
        ctx.globalAlpha = this.get_opacity();
        ctx.fill();
        ctx.restore();
    },

    cleanUpGeometry: function () {
        Overlay.prototype.cleanUpGeometry.call(this);
        this.cleanUp();
    },

    writeOverlayProperties: function (xmlWriter) {
        xmlWriter._writeStartElement('Shape');
        xmlWriter._writeAttributeString('ShapeType', Enums.toXml('ShapeType', this._shapeType$1));
        xmlWriter._writeEndElement();
    },

    initializeFromXml: function (node) {
        var shape = Util.selectSingleNode(node, 'Shape');
        this._shapeType$1 = Enums.parse('ShapeType', shape.attributes.getNamedItem('ShapeType').nodeValue);
    }
};

registerType("ShapeOverlay", [ShapeOverlay, ShapeOverlay$, Overlay]);

// wwtlib.AudioOverlay

export function AudioOverlay() {
    this._audio$1 = null;
    this._audioReady$1 = false;
    this._wantPlaying$1 = false;
    this._volume$1 = 100;
    this._mute$1 = false;
    this._position$1 = 0;
    this._trackType$1 = 0;
    Overlay.call(this);
    this.isDesignTimeOnly = true;
}

AudioOverlay.create = function (currentTourStop, file) {
    var ao = new AudioOverlay();
    ao.set_owner(currentTourStop);
    ao._filename$1 = file.name;
    ao.get_owner().get_owner().addCachedFile(file.name, file);
    return ao;
};

var AudioOverlay$ = {
    getTypeName: function () {
        return 'TerraViewer.AudioOverlay';
    },

    get_mute: function () {
        return this._mute$1;
    },

    set_mute: function (value) {
        this._mute$1 = value;
        this.set_volume(this.get_volume());
        return value;
    },

    get_volume: function () {
        return this._volume$1;
    },

    set_volume: function (value) {
        this._volume$1 = value;
        if (this._audio$1 != null) {
            this._audio$1.volume = (this._mute$1) ? 0 : (this._volume$1 / 100);
        }
        return value;
    },

    addFilesToCabinet: function (fc) {
        fc.addFile(this.get_owner().get_owner().get_workingDirectory() + this._filename$1, this.get_owner().get_owner().getFileBlob(this._filename$1));
    },

    play: function () {
        if (this._audio$1 == null) {
            this.prepMultimedia();
        }
        this._wantPlaying$1 = true;
        if (this._audio$1 != null && this._audioReady$1) {
            this._audio$1.play();
            this.set_volume(this.get_volume());
            this._audio$1.currentTime = this._position$1;
        }
    },

    pause: function () {
        if (this._audio$1 == null) {
            this.prepMultimedia();
        }
        this._wantPlaying$1 = false;
        if (this._audio$1 != null && this._audioReady$1) {
            this._audio$1.pause();
        }
    },

    stop: function () {
        this.pause();  // these operations are identical for audio
    },

    seek: function (time) {
        this._position$1 = time;
        if (this._audio$1 == null) {
            this.prepMultimedia();
        }
        if (this._audioReady$1) {
            if (this._audio$1.duration < time) {
                this._audio$1.pause();
            }
            else {
                this._audio$1.currentTime = this._position$1;
            }
        }
    },

    prepMultimedia: function () {
        var $this = this;

        if (this._audio$1 != null) {
            return;
        }
        this._audio$1 = document.createElement('audio');
        this._audio$1.addEventListener('canplaythrough', function () {
            if (!$this._audioReady$1) {
                $this._audioReady$1 = true;
                if ($this._wantPlaying$1) {
                    $this.play();
                }
            }
        }, false);

        // As of December 2020, on Safari, we need to use a <source>
        // sub-element for the audio to play. If we set src/type on the
        // parent element the playback breaks. This in turn breaks some
        // older browsers -- in a world of infinite developer time we'd
        // choose the behavior based on the browser version.
        var source = document.createElement('source');
        this._audio$1.appendChild(source);
        source.src = this.get_owner().get_owner().getFileStream(this._filename$1);
        source.type = 'audio/mp3';
        this._audio$1.load();
    },

    // TODO: understand better when/how this function is called. It ought to
    // be called for every frame by the generic Draw3D implementation since
    // we never set `texture`, I think. But note that the main music and
    // voice tracks aren't "rendered" in this way, so this function doesn't
    // get called for them, it looks.
    initializeTexture: function () {
        this.prepMultimedia();
    },

    cleanUp: function () {
        Overlay.prototype.cleanUp.call(this);
        this._wantPlaying$1 = false;
        if (this._audio$1 != null) {
            this._audio$1.pause();
            this._audio$1.src = null;
            this._audio$1 = null;
        }
    },

    get_trackType: function () {
        return this._trackType$1;
    },

    set_trackType: function (value) {
        this._trackType$1 = value;
        return value;
    },

    writeOverlayProperties: function (xmlWriter) {
        xmlWriter._writeStartElement('Audio');
        xmlWriter._writeAttributeString('Filename', this._filename$1);
        xmlWriter._writeAttributeString('Volume', this._volume$1.toString());
        xmlWriter._writeAttributeString('Mute', this._mute$1.toString());
        xmlWriter._writeAttributeString('TrackType', Enums.toXml('AudioType', this._trackType$1));
        xmlWriter._writeEndElement();
    },

    initializeFromXml: function (node) {
        var audio = Util.selectSingleNode(node, 'Audio');
        this._filename$1 = audio.attributes.getNamedItem('Filename').nodeValue;
        if (audio.attributes.getNamedItem('Volume') != null) {
            this._volume$1 = parseInt(audio.attributes.getNamedItem('Volume').nodeValue);
        }
        if (audio.attributes.getNamedItem('Mute') != null) {
            this._mute$1 = ss.boolean(audio.attributes.getNamedItem('Mute').nodeValue);
        }
        if (audio.attributes.getNamedItem('TrackType') != null) {
            this._trackType$1 = Enums.parse('AudioType', audio.attributes.getNamedItem('TrackType').nodeValue);
        }
    }
};

registerType("AudioOverlay", [AudioOverlay, AudioOverlay$, Overlay]);

// wwtlib.FlipbookOverlay

export function FlipbookOverlay() {
    this._loopType$1 = 1;
    this._startFrame$1 = 0;
    this._framesList$1 = [];
    this._frames$1 = 1;
    this._framesX$1 = 8;
    this._framesY$1 = 8;
    this._textureReady$1 = false;
    this._currentFrame$1 = 0;
    this._cellHeight$1 = 256;
    this._cellWidth$1 = 256;
    this._timeStart$1 = ss.now();
    this._playing$1 = true;
    Overlay.call(this);
}

var FlipbookOverlay$ = {
    getTypeName: function () {
        return 'TerraViewer.FlipbookOverlay';
    },

    get_loopType: function () {
        return this._loopType$1;
    },

    set_loopType: function (value) {
        this._loopType$1 = value;
        return value;
    },

    get_startFrame: function () {
        return this._startFrame$1;
    },

    set_startFrame: function (value) {
        this._startFrame$1 = value;
        return value;
    },

    get_frameSequence: function () {
        return this._frameSequence$1;
    },

    set_frameSequence: function (value) {
        if (this._frameSequence$1 !== value) {
            this._frameSequence$1 = value;
            this._framesList$1 = [];
            if (!ss.emptyString(this._frameSequence$1)) {
                try {
                    var parts = this._frameSequence$1.split(',');
                    var $enum1 = ss.enumerate(parts);
                    while ($enum1.moveNext()) {
                        var part = $enum1.current;
                        var x = parseInt(ss.trim(part));
                        this._framesList$1.push(x);
                    }
                }
                catch ($e2) {
                }
            }
        }
        return value;
    },

    get_frames: function () {
        return this._frames$1;
    },

    set_frames: function (value) {
        this._frames$1 = value;
        return value;
    },

    get_framesX: function () {
        return this._framesX$1;
    },

    set_framesX: function (value) {
        this._framesX$1 = value;
        return value;
    },

    get_framesY: function () {
        return this._framesY$1;
    },

    set_framesY: function (value) {
        this._framesY$1 = value;
        return value;
    },

    copy: function (owner) {
        var newFlipbookOverlay = new FlipbookOverlay();
        newFlipbookOverlay.set_owner(owner);
        newFlipbookOverlay._filename$1 = this._filename$1;
        newFlipbookOverlay.set_x(this.get_x());
        newFlipbookOverlay.set_y(this.get_y());
        newFlipbookOverlay.set_width(this.get_width());
        newFlipbookOverlay.set_height(this.get_height());
        newFlipbookOverlay.set_color(this.get_color());
        newFlipbookOverlay.set_opacity(this.get_opacity());
        newFlipbookOverlay.set_rotationAngle(this.get_rotationAngle());
        newFlipbookOverlay.set_name(this.get_name() + ' - Copy');
        newFlipbookOverlay.set_startFrame(this.get_startFrame());
        newFlipbookOverlay.set_frames(this.get_frames());
        newFlipbookOverlay.set_loopType(this.get_loopType());
        newFlipbookOverlay.set_frameSequence(this.get_frameSequence());
        newFlipbookOverlay.set_framesX(this.get_framesX());
        newFlipbookOverlay.set_framesY(this.get_framesY());
        return newFlipbookOverlay;
    },

    cleanUp: function () {
        this.texture = null;
    },

    initializeTexture: function () {
        var $this = this;

        try {
            var colorKey = ss.endsWith(this._filename$1.toLowerCase(), '.jpg');
            this.texture = this.get_owner().get_owner().getCachedTexture(this._filename$1, function () {
                $this._textureReady$1 = true;
            });
        }
        catch ($e1) {
        }
    },

    addFilesToCabinet: function (fc) {
        fc.addFile(this.get_owner().get_owner().get_workingDirectory() + this._filename$1, this.get_owner().get_owner().getFileBlob(this._filename$1));
    },

    writeOverlayProperties: function (xmlWriter) {
        xmlWriter._writeStartElement('Flipbook');
        xmlWriter._writeAttributeString('Filename', this._filename$1);
        xmlWriter._writeAttributeString('Frames', this._frames$1.toString());
        xmlWriter._writeAttributeString('Loop', Enums.toXml('LoopTypes', this._loopType$1));
        xmlWriter._writeAttributeString('FramesX', this._framesX$1.toString());
        xmlWriter._writeAttributeString('FramesY', this._framesY$1.toString());
        xmlWriter._writeAttributeString('StartFrame', this._startFrame$1.toString());
        if (!ss.emptyString(this._frameSequence$1)) {
            xmlWriter._writeAttributeString('FrameSequence', this._frameSequence$1);
        }
        xmlWriter._writeEndElement();
    },

    initializeFromXml: function (node) {
        var flipbook = Util.selectSingleNode(node, 'Flipbook');
        this._filename$1 = flipbook.attributes.getNamedItem('Filename').nodeValue;
        this._frames$1 = parseInt(flipbook.attributes.getNamedItem('Frames').nodeValue);
        this._loopType$1 = Enums.parse('LoopTypes', flipbook.attributes.getNamedItem('Loop').nodeValue);
        if (flipbook.attributes.getNamedItem('FramesX') != null) {
            this.set_framesX(parseInt(flipbook.attributes.getNamedItem('FramesX').nodeValue));
        }
        if (flipbook.attributes.getNamedItem('FramesY') != null) {
            this.set_framesY(parseInt(flipbook.attributes.getNamedItem('FramesY').nodeValue));
        }
        if (flipbook.attributes.getNamedItem('StartFrame') != null) {
            this.set_startFrame(parseInt(flipbook.attributes.getNamedItem('StartFrame').nodeValue));
        }
        if (flipbook.attributes.getNamedItem('FrameSequence') != null) {
            this.set_frameSequence(flipbook.attributes.getNamedItem('FrameSequence').nodeValue);
        }
    },

    play: function () {
        this._playing$1 = true;
        this._timeStart$1 = ss.now();
    },

    pause: function () {
        this._playing$1 = false;
    },

    stop: function () {
        this._playing$1 = false;
        this._currentFrame$1 = 0;
    },

    initializeGeometry: function () {
        var frameCount = this._frames$1;
        if (!ss.emptyString(this._frameSequence$1)) {
            frameCount = this._framesList$1.length;
        }
        if (this._playing$1) {
            var ts = ss.now() - this._timeStart$1;
            switch (this._loopType$1) {
                case 0:
                    this._currentFrame$1 = ss.truncate(((ts / 1000 * 24) % frameCount)) + this._startFrame$1;
                    break;
                case 1:
                    this._currentFrame$1 = Math.abs(ss.truncate(((ts / 1000 * 24 + frameCount) % (frameCount * 2 - 1))) - (frameCount - 1)) + this._startFrame$1;
                    if (this._currentFrame$1 < 0 || this._currentFrame$1 > frameCount - 1) {
                        var p = 0;
                    }
                    break;
                case 2:
                    this._currentFrame$1 = Math.max(0, frameCount - ss.truncate(((ts / 1000 * 24) % frameCount))) + this._startFrame$1;
                    break;
                case 3:
                    var temp = Math.min(ts / 1000 * 24, frameCount * 2 + 1) + frameCount;
                    this._currentFrame$1 = Math.abs((temp % (frameCount * 2 - 1)) - (frameCount - 1)) + this._startFrame$1;
                    break;
                case 4:
                    this._currentFrame$1 = Math.min(frameCount - 1, ss.truncate((ts / 1000 * 24)));
                    break;
                case 5:
                    this._currentFrame$1 = this._startFrame$1;
                    break;
                case 6:
                    this._currentFrame$1 = (frameCount - 1) + this._startFrame$1;
                    break;
                default:
                    this._currentFrame$1 = this._startFrame$1;
                    break;
            }
        }
        if (!ss.emptyString(this._frameSequence$1)) {
            if (this._currentFrame$1 < this._framesList$1.length && this._currentFrame$1 > -1) {
                this._currentFrame$1 = this._framesList$1[this._currentFrame$1];
            }
            else {
                this._currentFrame$1 = 0;
            }
        }
        this.currentRotation = 0;
    }
};

registerType("FlipbookOverlay", [FlipbookOverlay, FlipbookOverlay$, Overlay]);
