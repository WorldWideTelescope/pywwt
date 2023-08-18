// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// An interactive selection for the tour editor.

import { ss } from "../ss.js";
import { registerType, registerEnum } from "../typesystem.js";
import { Vector2d, Matrix2d, PositionColoredTextured } from "../double3d.js";
import { Sprite2d } from "../graphics/sprite2d.js";
import { Texture } from "../graphics/texture.js";
import { Colors } from "../color.js";
import { Rectangle } from "../util.js";


// wwtlib.SelectionAnchor

export var SelectionAnchor = {
    topLeft: 0,
    top: 1,
    topRight: 2,
    right: 3,
    bottomRight: 4,
    bottom: 5,
    bottomLeft: 6,
    left: 7,
    rotate: 8,
    move: 9,
    center: 10,
    none: 11
};

registerType("SelectionAnchor", SelectionAnchor);
registerEnum("SelectionAnchor", SelectionAnchor);


// wwtlib.Selection
//
// Note: this type is a bit dangerous because there is a built-in browser type
// of the same name. So if you forget to import this type into your module, your
// code will likely get the other one instead. As usual, we're reluctant to
// rename it because that would break API compatibility.

export function Selection() {
    this._singleSelectHandles = null;
    this._multiSelectHandles = null;
    this._focusHandles = null;
    this.selectionSet = [];
    this._focus = null;
    this._ratio = 1;
    this._sprite = new Sprite2d();
    this._centerX = 0;
    this._centerY = 0;
}

Selection._points = new Array(9 * 3 * 2);

var Selection$ = {
    clearSelection: function () {
        this.selectionSet.length = 0;
    },

    addSelection: function (overlay) {
        if (overlay != null) {
            if (!(this.selectionSet.indexOf(overlay) >= 0)) {
                this.selectionSet.push(overlay);
            }
        }
    },

    addSelectionRange: function (overlays) {
        var $enum1 = ss.enumerate(overlays);
        while ($enum1.moveNext()) {
            var ov = $enum1.current;
            this.selectionSet.push(ov);
        }
    },

    isOverlaySelected: function (overlay) {
        return (this.selectionSet.indexOf(overlay) >= 0);
    },

    setSelection: function (overlay) {
        this.selectionSet.length = 0;
        if (overlay != null) {
            this.selectionSet.push(overlay);
        }
    },

    get_multiSelect: function () {
        return this.selectionSet.length > 1;
    },

    setSelectionRange: function (overlays) {
        this.selectionSet.length = 0;
        var $enum1 = ss.enumerate(overlays);
        while ($enum1.moveNext()) {
            var ov = $enum1.current;
            this.selectionSet.push(ov);
        }
    },

    get_focus: function () {
        return this._focus;
    },

    set_focus: function (value) {
        this._focus = value;
        return value;
    },

    draw3D: function (renderContext, transparancy) {
        this._ratio = 1116 / renderContext.height;
        if (this._singleSelectHandles == null) {
            this._singleSelectHandles = Texture.fromUrl('images/Selhand.bmp');
        }
        if (this._multiSelectHandles == null) {
            this._multiSelectHandles = Texture.fromUrl('images/multiSelhand.bmp');
        }
        if (this._focusHandles == null) {
            this._focusHandles = Texture.fromUrl('images/FocusHandles.png');
        }
        if (this.selectionSet.length > 1) {
            var $enum1 = ss.enumerate(this.selectionSet);
            while ($enum1.moveNext()) {
                var overlay = $enum1.current;
                if (overlay === this._focus) {
                    this._drawSelectionHandles(renderContext, overlay, this._focusHandles);
                }
                else {
                    this._drawSelectionHandles(renderContext, overlay, this._multiSelectHandles);
                }
            }
        } else {
            var $enum2 = ss.enumerate(this.selectionSet);
            while ($enum2.moveNext()) {
                var overlay = $enum2.current;
                this._drawSelectionHandles(renderContext, overlay, this._singleSelectHandles);
            }
        }
    },

    _drawSelectionHandles: function (renderContext, overlay, handleTexture) {
        var handles = this.makeHandles(overlay);
        var angle = overlay.get_rotationAngle();
        var i = 0;
        var j = 0;
        var $enum1 = ss.enumerate(handles);
        while ($enum1.moveNext()) {
            var handle = $enum1.current;
            Selection._points[i + 0] = new PositionColoredTextured();
            Selection._points[i + 0].position = overlay.makePosition(this._centerX, this._centerY, handle.get_left() - this._centerX, handle.get_top() - this._centerY, angle);
            Selection._points[i + 0].tu = j * (1 / 9);
            Selection._points[i + 0].tv = 0;
            Selection._points[i + 0].color = Colors.get_white();
            Selection._points[i + 1] = new PositionColoredTextured();
            Selection._points[i + 1].position = overlay.makePosition(this._centerX, this._centerY, handle.get_right() - this._centerX, handle.get_top() - this._centerY, angle);
            Selection._points[i + 1].tu = (j + 1) * (1 / 9);
            Selection._points[i + 1].tv = 0;
            Selection._points[i + 1].color = Colors.get_white();
            Selection._points[i + 2] = new PositionColoredTextured();
            Selection._points[i + 2].position = overlay.makePosition(this._centerX, this._centerY, handle.get_left() - this._centerX, handle.get_bottom() - this._centerY, angle);
            Selection._points[i + 2].tu = j * (1 / 9);
            Selection._points[i + 2].tv = 1;
            Selection._points[i + 2].color = Colors.get_white();
            Selection._points[i + 3] = new PositionColoredTextured();
            Selection._points[i + 3].position = overlay.makePosition(this._centerX, this._centerY, handle.get_right() - this._centerX, handle.get_top() - this._centerY, angle);
            Selection._points[i + 3].tu = (j + 1) * (1 / 9);
            Selection._points[i + 3].tv = 0;
            Selection._points[i + 3].color = Colors.get_white();
            Selection._points[i + 4] = new PositionColoredTextured();
            Selection._points[i + 4].position = overlay.makePosition(this._centerX, this._centerY, handle.get_right() - this._centerX, handle.get_bottom() - this._centerY, angle);
            Selection._points[i + 4].tu = (j + 1) * (1 / 9);
            Selection._points[i + 4].tv = 1;
            Selection._points[i + 4].color = Colors.get_white();
            Selection._points[i + 5] = new PositionColoredTextured();
            Selection._points[i + 5].position = overlay.makePosition(this._centerX, this._centerY, handle.get_left() - this._centerX, handle.get_bottom() - this._centerY, angle);
            Selection._points[i + 5].tu = j * (1 / 9);
            Selection._points[i + 5].tv = 1;
            Selection._points[i + 5].color = Colors.get_white();
            i += 6;
            j++;
        }
        if (this.get_multiSelect()) {
            this._sprite.draw(renderContext, Selection._points, Selection._points.length - 6, handleTexture, false, 1);
        } else {
            this._sprite.draw(renderContext, Selection._points, Selection._points.length, handleTexture, false, 1);
        }
    },

    pointToSelectionSpace: function (pntIn) {
        var tempPoints = new Array(1);
        tempPoints[0] = Vector2d.create(pntIn.x, pntIn.y);
        var mat = Matrix2d.rotateAt(-this.selectionSet[0].get_rotationAngle() / 180 * Math.PI, Vector2d.create(this.selectionSet[0].get_x(), this.selectionSet[0].get_y()));
        mat._transformPoints(tempPoints);
        return tempPoints[0];
    },

    pointToScreenSpace: function (pntIn) {
        var tempPoints = new Array(1);
        tempPoints[0] = Vector2d.create(pntIn.x, pntIn.y);
        var mat = Matrix2d.rotateAt(this.selectionSet[0].get_rotationAngle() / 180 * Math.PI, Vector2d.create(this.selectionSet[0].get_x(), this.selectionSet[0].get_y()));
        mat._transformPoints(tempPoints);
        return tempPoints[0];
    },

    hitTest: function (position) {
        if (this.selectionSet.length === 1) {
            var $enum1 = ss.enumerate(this.selectionSet);
            while ($enum1.moveNext()) {
                var overlay = $enum1.current;
                var handles = this.makeHandles(overlay);
                var index = 0;
                var testPoint = this.pointToSelectionSpace(position);
                var $enum2 = ss.enumerate(handles);
                while ($enum2.moveNext()) {
                    var rectf = $enum2.current;
                    if (rectf.contains(testPoint)) {
                        return index;
                    }
                    index++;
                }
            }
        }
        return 11;
    },

    makeHandles: function (overlay) {
        var x = ss.truncate((overlay.get_x() - (overlay.get_width() / 2))) + 0.5;
        var y = (ss.truncate(overlay.get_y()) - (overlay.get_height() / 2)) + 0.5;
        this._centerX = overlay.get_x();
        this._centerY = overlay.get_y();
        var width = overlay.get_width();
        var height = overlay.get_height();
        var handleSize = 12 * this._ratio;
        var handles = new Array(9);
        handles[0] = Rectangle.create(x - handleSize, y - handleSize, handleSize, handleSize);
        handles[1] = Rectangle.create((x + (width / 2)) - (handleSize / 2), y - handleSize, handleSize, handleSize);
        handles[2] = Rectangle.create(x + width, y - handleSize, handleSize, handleSize);
        handles[3] = Rectangle.create(x + width, (y + (height / 2)) - (handleSize / 2), handleSize, handleSize);
        handles[4] = Rectangle.create(x + width, (y + height), handleSize, handleSize);
        handles[5] = Rectangle.create((x + (width / 2)) - (handleSize / 2), (y + height), handleSize, handleSize);
        handles[6] = Rectangle.create(x - handleSize, (y + height), handleSize, handleSize);
        handles[7] = Rectangle.create(x - handleSize, (y + (height / 2)) - (handleSize / 2), handleSize, handleSize);
        handles[8] = Rectangle.create((x + (width / 2)) - (handleSize / 2), y - 30 * this._ratio, handleSize, handleSize);
        return handles;
    }
};

registerType("Selection", [Selection, Selection$, null]);
