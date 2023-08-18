// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Sprites.

import { registerType } from "../typesystem.js";
import { ss } from "../ss.js";
import { tilePrepDevice } from "../render_globals.js";
import { SpriteShader, ShapeSpriteShader } from "./shaders.js";
import { WEBGL } from "./webgl_constants.js";


// wwtlib.Sprite2d

export function Sprite2d() {
    this.vertCount = 0;
}

var Sprite2d$ = {
    draw: function (renderContext, points, count, texture, triangleStrips, opacity) {
        if (this.vertexBuffer == null) {
            this.create(points);
        } else {
            this.update(points);
        }
        if (texture == null) {
            ShapeSpriteShader.use(renderContext, this.vertexBuffer);
            renderContext.gl.drawArrays(triangleStrips ? WEBGL.TRIANGLE_STRIP : WEBGL.TRIANGLES, 0, points.length);
        } else {
            SpriteShader.use(renderContext, this.vertexBuffer, (texture != null) ? texture.texture2d : null);
            renderContext.gl.drawArrays(triangleStrips ? WEBGL.TRIANGLE_STRIP : WEBGL.TRIANGLES, 0, points.length);
        }
    },

    create: function (verts) {
        this.vertexBuffer = tilePrepDevice.createBuffer();
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(verts.length * 9);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(verts);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.color.r / 255;
            buffer[index++] = pt.color.g / 255;
            buffer[index++] = pt.color.b / 255;
            buffer[index++] = pt.color.a / 255;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferData(WEBGL.ARRAY_BUFFER, f32array, WEBGL.DYNAMIC_DRAW);
    },

    update: function (verts) {
        if (this.vertCount < verts.length) {
            tilePrepDevice.deleteBuffer(this.vertexBuffer);
            this.create(verts);
            return;
        }
        tilePrepDevice.bindBuffer(WEBGL.ARRAY_BUFFER, this.vertexBuffer);
        var f32array = new Float32Array(verts.length * 9);
        var buffer = f32array;
        var index = 0;
        var $enum1 = ss.enumerate(verts);
        while ($enum1.moveNext()) {
            var pt = $enum1.current;
            buffer[index++] = pt.position.x;
            buffer[index++] = pt.position.y;
            buffer[index++] = pt.position.z;
            buffer[index++] = pt.color.r / 255;
            buffer[index++] = pt.color.g / 255;
            buffer[index++] = pt.color.b / 255;
            buffer[index++] = pt.color.a / 255;
            buffer[index++] = pt.tu;
            buffer[index++] = pt.tv;
        }
        tilePrepDevice.bufferSubData(WEBGL.ARRAY_BUFFER, 0, f32array);
    }
};

registerType("Sprite2d", [Sprite2d, Sprite2d$, null]);
