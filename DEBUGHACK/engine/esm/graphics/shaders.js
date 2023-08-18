// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Core WebGL shaders for the WWT engine.

import { registerType } from "../typesystem.js";
import { Matrix3d, Vector3d } from "../double3d.js";
import { Color } from "../color.js";
import { set_tileUvMultiple, set_tileDemEnabled } from "../render_globals.js";
import { WEBGL } from "./webgl_constants.js";
import { Texture } from "./texture.js";


// wwtlib.SimpleLineShader

export function SimpleLineShader() { }

SimpleLineShader.vertLoc = 0;
SimpleLineShader.initialized = false;
SimpleLineShader._prog = null;

SimpleLineShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision highp float;
        uniform vec4 lineColor;

        void main(void) {
            gl_FragColor = lineColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        }
    `;

    SimpleLineShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(SimpleLineShader._frag, fragShaderText);
    gl.compileShader(SimpleLineShader._frag);
    var stat = gl.getShaderParameter(SimpleLineShader._frag, WEBGL.COMPILE_STATUS);
    SimpleLineShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(SimpleLineShader._vert, vertexShaderText);
    gl.compileShader(SimpleLineShader._vert);
    var stat1 = gl.getShaderParameter(SimpleLineShader._vert, WEBGL.COMPILE_STATUS);
    SimpleLineShader._prog = gl.createProgram();
    gl.attachShader(SimpleLineShader._prog, SimpleLineShader._vert);
    gl.attachShader(SimpleLineShader._prog, SimpleLineShader._frag);
    gl.linkProgram(SimpleLineShader._prog);
    var errcode = gl.getProgramParameter(SimpleLineShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(SimpleLineShader._prog);
    SimpleLineShader.vertLoc = gl.getAttribLocation(SimpleLineShader._prog, 'aVertexPosition');
    SimpleLineShader.lineColorLoc = gl.getUniformLocation(SimpleLineShader._prog, 'lineColor');
    SimpleLineShader.projMatLoc = gl.getUniformLocation(SimpleLineShader._prog, 'uPMatrix');
    SimpleLineShader.mvMatLoc = gl.getUniformLocation(SimpleLineShader._prog, 'uMVMatrix');
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    SimpleLineShader.initialized = true;
};

SimpleLineShader.use = function (renderContext, vertex, lineColor, useDepth) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!SimpleLineShader.initialized) {
            SimpleLineShader.init(renderContext);
        }
        gl.useProgram(SimpleLineShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(SimpleLineShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(SimpleLineShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform4f(SimpleLineShader.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, 1);
        if (renderContext.space || !useDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.enableVertexAttribArray(SimpleLineShader.vertLoc);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.vertexAttribPointer(SimpleLineShader.vertLoc, 3, WEBGL.FLOAT, false, 0, 0);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var SimpleLineShader$ = {};

registerType("SimpleLineShader", [SimpleLineShader, SimpleLineShader$, null]);


// wwtlib.SimpleLineShader2D

export function SimpleLineShader2D() { }

SimpleLineShader2D.vertLoc = 0;
SimpleLineShader2D.initialized = false;
SimpleLineShader2D._prog = null;

SimpleLineShader2D.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
       precision highp float;
       uniform vec4 lineColor;

       void main(void) {
           gl_FragColor = lineColor;
       }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;

        void main(void) {
            gl_Position = vec4(aVertexPosition, 1.0);
        }
    `;

    SimpleLineShader2D._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(SimpleLineShader2D._frag, fragShaderText);
    gl.compileShader(SimpleLineShader2D._frag);
    var stat = gl.getShaderParameter(SimpleLineShader2D._frag, WEBGL.COMPILE_STATUS);
    SimpleLineShader2D._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(SimpleLineShader2D._vert, vertexShaderText);
    gl.compileShader(SimpleLineShader2D._vert);
    var stat1 = gl.getShaderParameter(SimpleLineShader2D._vert, WEBGL.COMPILE_STATUS);
    SimpleLineShader2D._prog = gl.createProgram();
    gl.attachShader(SimpleLineShader2D._prog, SimpleLineShader2D._vert);
    gl.attachShader(SimpleLineShader2D._prog, SimpleLineShader2D._frag);
    gl.linkProgram(SimpleLineShader2D._prog);
    var errcode = gl.getProgramParameter(SimpleLineShader2D._prog, WEBGL.LINK_STATUS);
    gl.useProgram(SimpleLineShader2D._prog);
    SimpleLineShader2D.vertLoc = gl.getAttribLocation(SimpleLineShader2D._prog, 'aVertexPosition');
    SimpleLineShader2D.lineColorLoc = gl.getUniformLocation(SimpleLineShader2D._prog, 'lineColor');
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    SimpleLineShader2D.initialized = true;
};

SimpleLineShader2D.use = function (renderContext, vertex, lineColor, useDepth) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!SimpleLineShader2D.initialized) {
            SimpleLineShader2D.init(renderContext);
        }
        gl.useProgram(SimpleLineShader2D._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform4f(SimpleLineShader2D.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, 1);
        if (renderContext.space || !useDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.enableVertexAttribArray(SimpleLineShader2D.vertLoc);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.vertexAttribPointer(SimpleLineShader2D.vertLoc, 3, WEBGL.FLOAT, false, 0, 0);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var SimpleLineShader2D$ = {};

registerType("SimpleLineShader2D", [SimpleLineShader2D, SimpleLineShader2D$, null]);


// wwtlib.OrbitLineShader

export function OrbitLineShader() { }

OrbitLineShader.vertLoc = 0;
OrbitLineShader.colorLoc = 0;
OrbitLineShader.initialized = false;
OrbitLineShader._prog = null;

OrbitLineShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision highp float;
        uniform vec4 lineColor;
        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor = lineColor * vColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        varying lowp vec4 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
        }
    `;

    OrbitLineShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(OrbitLineShader._frag, fragShaderText);
    gl.compileShader(OrbitLineShader._frag);
    var stat = gl.getShaderParameter(OrbitLineShader._frag, WEBGL.COMPILE_STATUS);
    OrbitLineShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(OrbitLineShader._vert, vertexShaderText);
    gl.compileShader(OrbitLineShader._vert);
    var stat1 = gl.getShaderParameter(OrbitLineShader._vert, WEBGL.COMPILE_STATUS);
    OrbitLineShader._prog = gl.createProgram();
    gl.attachShader(OrbitLineShader._prog, OrbitLineShader._vert);
    gl.attachShader(OrbitLineShader._prog, OrbitLineShader._frag);
    gl.linkProgram(OrbitLineShader._prog);
    var errcode = gl.getProgramParameter(OrbitLineShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(OrbitLineShader._prog);
    OrbitLineShader.vertLoc = gl.getAttribLocation(OrbitLineShader._prog, 'aVertexPosition');
    OrbitLineShader.colorLoc = gl.getAttribLocation(OrbitLineShader._prog, 'aVertexColor');
    OrbitLineShader.lineColorLoc = gl.getUniformLocation(OrbitLineShader._prog, 'lineColor');
    OrbitLineShader.projMatLoc = gl.getUniformLocation(OrbitLineShader._prog, 'uPMatrix');
    OrbitLineShader.mvMatLoc = gl.getUniformLocation(OrbitLineShader._prog, 'uMVMatrix');
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    OrbitLineShader.initialized = true;
};

OrbitLineShader.use = function (renderContext, vertex, lineColor) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!OrbitLineShader.initialized) {
            OrbitLineShader.init(renderContext);
        }
        gl.useProgram(OrbitLineShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(OrbitLineShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(OrbitLineShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform4f(OrbitLineShader.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, 1);
        if (renderContext.space) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(OrbitLineShader.vertLoc);
        gl.enableVertexAttribArray(OrbitLineShader.colorLoc);
        gl.vertexAttribPointer(OrbitLineShader.vertLoc, 3, WEBGL.FLOAT, false, 28, 0);
        gl.vertexAttribPointer(OrbitLineShader.colorLoc, 4, WEBGL.FLOAT, false, 28, 12);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var OrbitLineShader$ = {};

registerType("OrbitLineShader", [OrbitLineShader, OrbitLineShader$, null]);


// wwtlib.LineShaderNormalDates

export function LineShaderNormalDates() { }

LineShaderNormalDates.vertLoc = 0;
LineShaderNormalDates.colorLoc = 0;
LineShaderNormalDates.timeLoc = 0;
LineShaderNormalDates.initialized = false;
LineShaderNormalDates._prog = null;

LineShaderNormalDates.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision highp float;
        uniform vec4 lineColor;
        varying lowp vec4 vColor;

        void main(void)
        {
            gl_FragColor = lineColor * vColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec2 aTime;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform float jNow;
        uniform float decay;

        varying lowp vec4 vColor;

        void main(void)
        {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            float dAlpha = 1.0;

            if (decay > 0.0)
            {
                    dAlpha = 1.0 - ((jNow - aTime.y) / decay);
                    if (dAlpha > 1.0 )
                    {
                        dAlpha = 1.0;
                    }
            }

            if (jNow < aTime.x && decay > 0.0)
            {
                vColor = vec4(1, 1, 1, 1);
            }
            else
            {
                vColor = vec4(aVertexColor.r, aVertexColor.g, aVertexColor.b, dAlpha * aVertexColor.a);
            }
        }
    `;

    LineShaderNormalDates._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(LineShaderNormalDates._frag, fragShaderText);
    gl.compileShader(LineShaderNormalDates._frag);
    var stat = gl.getShaderParameter(LineShaderNormalDates._frag, WEBGL.COMPILE_STATUS);
    LineShaderNormalDates._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(LineShaderNormalDates._vert, vertexShaderText);
    gl.compileShader(LineShaderNormalDates._vert);
    var stat1 = gl.getShaderParameter(LineShaderNormalDates._vert, WEBGL.COMPILE_STATUS);
    LineShaderNormalDates._prog = gl.createProgram();
    gl.attachShader(LineShaderNormalDates._prog, LineShaderNormalDates._vert);
    gl.attachShader(LineShaderNormalDates._prog, LineShaderNormalDates._frag);
    gl.linkProgram(LineShaderNormalDates._prog);
    var errcode = gl.getProgramParameter(LineShaderNormalDates._prog, WEBGL.LINK_STATUS);
    gl.useProgram(LineShaderNormalDates._prog);
    LineShaderNormalDates.vertLoc = gl.getAttribLocation(LineShaderNormalDates._prog, 'aVertexPosition');
    LineShaderNormalDates.colorLoc = gl.getAttribLocation(LineShaderNormalDates._prog, 'aVertexColor');
    LineShaderNormalDates.timeLoc = gl.getAttribLocation(LineShaderNormalDates._prog, 'aTime');
    LineShaderNormalDates.lineColorLoc = gl.getUniformLocation(LineShaderNormalDates._prog, 'lineColor');
    LineShaderNormalDates.projMatLoc = gl.getUniformLocation(LineShaderNormalDates._prog, 'uPMatrix');
    LineShaderNormalDates.mvMatLoc = gl.getUniformLocation(LineShaderNormalDates._prog, 'uMVMatrix');
    LineShaderNormalDates.jNowLoc = gl.getUniformLocation(LineShaderNormalDates._prog, 'jNow');
    LineShaderNormalDates.decayLoc = gl.getUniformLocation(LineShaderNormalDates._prog, 'decay');
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    LineShaderNormalDates.initialized = true;
};

LineShaderNormalDates.use = function (renderContext, vertex, lineColor, zBuffer, jNow, decay) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!LineShaderNormalDates.initialized) {
            LineShaderNormalDates.init(renderContext);
        }
        gl.useProgram(LineShaderNormalDates._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(LineShaderNormalDates.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(LineShaderNormalDates.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform4f(LineShaderNormalDates.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, 1);
        gl.uniform1f(LineShaderNormalDates.jNowLoc, jNow);
        gl.uniform1f(LineShaderNormalDates.decayLoc, decay);
        if (zBuffer) {
            gl.enable(WEBGL.DEPTH_TEST);
        } else {
            gl.disable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(LineShaderNormalDates.vertLoc);
        gl.enableVertexAttribArray(LineShaderNormalDates.colorLoc);
        gl.vertexAttribPointer(LineShaderNormalDates.vertLoc, 3, WEBGL.FLOAT, false, 36, 0);
        gl.vertexAttribPointer(LineShaderNormalDates.colorLoc, 4, WEBGL.FLOAT, false, 36, 12);
        gl.vertexAttribPointer(LineShaderNormalDates.timeLoc, 2, WEBGL.FLOAT, false, 36, 28);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var LineShaderNormalDates$ = {};

registerType("LineShaderNormalDates", [LineShaderNormalDates, LineShaderNormalDates$, null]);


// wwtlib.TimeSeriesPointSpriteShader

export function TimeSeriesPointSpriteShader() { }

TimeSeriesPointSpriteShader.vertLoc = 0;
TimeSeriesPointSpriteShader.colorLoc = 0;
TimeSeriesPointSpriteShader.pointSizeLoc = 0;
TimeSeriesPointSpriteShader.timeLoc = 0;
TimeSeriesPointSpriteShader.initialized = false;
TimeSeriesPointSpriteShader._prog = null;

TimeSeriesPointSpriteShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;
        uniform vec4 lineColor;
        varying lowp vec4 vColor;
        uniform sampler2D uSampler;

        void main(void)
        {
            vec4 texColor;
            texColor = texture2D(uSampler, gl_PointCoord);
            gl_FragColor = lineColor * vColor * texColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec2 aTime;
        attribute float aPointSize;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform float jNow;
        uniform vec3 cameraPosition;
        uniform float decay;
        uniform float scale;
        uniform float minSize;
        uniform float sky;
        uniform float showFarSide;

        varying lowp vec4 vColor;

        void main(void)
        {
            float dotCam = dot( normalize(cameraPosition-aVertexPosition), normalize(aVertexPosition));
            float dist = distance(aVertexPosition, cameraPosition);
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            float dAlpha = 1.0;

            if ( decay > 0.0)
            {
                    dAlpha = 1.0 - ((jNow - aTime.y) / decay);
                    if (dAlpha > 1.0 )
                    {
                        dAlpha = 1.0;
                    }
            }

            if ( showFarSide == 0.0 && (dotCam * sky) < 0.0 || (jNow < aTime.x && decay > 0.0))
            {
                vColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
            else
            {
                vColor = vec4(aVertexColor.r, aVertexColor.g, aVertexColor.b, dAlpha);
            }

            float lSize = scale;

            if (scale < 0.0)
            {
                lSize = -scale;
                dist = 1.0;
            }

            gl_PointSize = max(minSize, (lSize * ( aPointSize ) / dist));
        }
    `;

    TimeSeriesPointSpriteShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(TimeSeriesPointSpriteShader._frag, fragShaderText);
    gl.compileShader(TimeSeriesPointSpriteShader._frag);
    var stat = gl.getShaderParameter(TimeSeriesPointSpriteShader._frag, WEBGL.COMPILE_STATUS);
    TimeSeriesPointSpriteShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(TimeSeriesPointSpriteShader._vert, vertexShaderText);
    gl.compileShader(TimeSeriesPointSpriteShader._vert);
    var stat1 = gl.getShaderParameter(TimeSeriesPointSpriteShader._vert, WEBGL.COMPILE_STATUS);
    var compilationLog = gl.getShaderInfoLog(TimeSeriesPointSpriteShader._vert);
    TimeSeriesPointSpriteShader._prog = gl.createProgram();
    gl.attachShader(TimeSeriesPointSpriteShader._prog, TimeSeriesPointSpriteShader._vert);
    gl.attachShader(TimeSeriesPointSpriteShader._prog, TimeSeriesPointSpriteShader._frag);
    gl.linkProgram(TimeSeriesPointSpriteShader._prog);
    var errcode = gl.getProgramParameter(TimeSeriesPointSpriteShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(TimeSeriesPointSpriteShader._prog);
    TimeSeriesPointSpriteShader.vertLoc = gl.getAttribLocation(TimeSeriesPointSpriteShader._prog, 'aVertexPosition');
    TimeSeriesPointSpriteShader.colorLoc = gl.getAttribLocation(TimeSeriesPointSpriteShader._prog, 'aVertexColor');
    TimeSeriesPointSpriteShader.pointSizeLoc = gl.getAttribLocation(TimeSeriesPointSpriteShader._prog, 'aPointSize');
    TimeSeriesPointSpriteShader.timeLoc = gl.getAttribLocation(TimeSeriesPointSpriteShader._prog, 'aTime');
    TimeSeriesPointSpriteShader.projMatLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'uPMatrix');
    TimeSeriesPointSpriteShader.mvMatLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'uMVMatrix');
    TimeSeriesPointSpriteShader.sampLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'uSampler');
    TimeSeriesPointSpriteShader.jNowLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'jNow');
    TimeSeriesPointSpriteShader.decayLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'decay');
    TimeSeriesPointSpriteShader.lineColorLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'lineColor');
    TimeSeriesPointSpriteShader.cameraPosLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'cameraPosition');
    TimeSeriesPointSpriteShader.scaleLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'scale');
    TimeSeriesPointSpriteShader.skyLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'sky');
    TimeSeriesPointSpriteShader.showFarSideLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'showFarSide');
    TimeSeriesPointSpriteShader.minSizeLoc = gl.getUniformLocation(TimeSeriesPointSpriteShader._prog, 'minSize');
    gl.enable(WEBGL.BLEND);
    TimeSeriesPointSpriteShader.initialized = true;
};

TimeSeriesPointSpriteShader.use = function (renderContext, vertex, texture, lineColor, zBuffer, jNow, decay, camera, scale, minSize, showFarSide, sky) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!TimeSeriesPointSpriteShader.initialized) {
            TimeSeriesPointSpriteShader.init(renderContext);
        }
        gl.useProgram(TimeSeriesPointSpriteShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(TimeSeriesPointSpriteShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(TimeSeriesPointSpriteShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(TimeSeriesPointSpriteShader.sampLoc, 0);
        gl.uniform1f(TimeSeriesPointSpriteShader.jNowLoc, jNow);
        gl.uniform1f(TimeSeriesPointSpriteShader.decayLoc, decay);
        gl.uniform4f(TimeSeriesPointSpriteShader.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, lineColor.a / 255);
        gl.uniform3f(TimeSeriesPointSpriteShader.cameraPosLoc, camera.x, camera.y, camera.z);
        gl.uniform1f(TimeSeriesPointSpriteShader.scaleLoc, scale);
        gl.uniform1f(TimeSeriesPointSpriteShader.minSizeLoc, minSize);
        gl.uniform1f(TimeSeriesPointSpriteShader.showFarSideLoc, (showFarSide) ? 1 : 0);
        gl.uniform1f(TimeSeriesPointSpriteShader.skyLoc, (sky) ? -1 : 1);
        if (zBuffer) {
            gl.enable(WEBGL.DEPTH_TEST);
        } else {
            gl.disable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(TimeSeriesPointSpriteShader.vertLoc);
        gl.enableVertexAttribArray(TimeSeriesPointSpriteShader.colorLoc);
        gl.enableVertexAttribArray(TimeSeriesPointSpriteShader.pointSizeLoc);
        gl.enableVertexAttribArray(TimeSeriesPointSpriteShader.timeLoc);
        gl.vertexAttribPointer(TimeSeriesPointSpriteShader.vertLoc, 3, WEBGL.FLOAT, false, 40, 0);
        gl.vertexAttribPointer(TimeSeriesPointSpriteShader.colorLoc, 4, WEBGL.FLOAT, false, 40, 12);
        gl.vertexAttribPointer(TimeSeriesPointSpriteShader.pointSizeLoc, 1, WEBGL.FLOAT, false, 40, 36);
        gl.vertexAttribPointer(TimeSeriesPointSpriteShader.timeLoc, 2, WEBGL.FLOAT, false, 40, 28);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
    }
};

var TimeSeriesPointSpriteShader$ = {};

registerType("TimeSeriesPointSpriteShader", [TimeSeriesPointSpriteShader, TimeSeriesPointSpriteShader$, null]);

// wwtlib.KeplerPointSpriteShader

export function KeplerPointSpriteShader() { }

KeplerPointSpriteShader.abcLoc = 0;
KeplerPointSpriteShader.abcLoc1 = 0;
KeplerPointSpriteShader.pointSizeLoc = 0;
KeplerPointSpriteShader.colorLoc = 0;
KeplerPointSpriteShader.weLoc = 0;
KeplerPointSpriteShader.nTLoc = 0;
KeplerPointSpriteShader.azLoc = 0;
KeplerPointSpriteShader.orbitLoc = 0;
KeplerPointSpriteShader.initialized = false;
KeplerPointSpriteShader._prog = null;

KeplerPointSpriteShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;
        uniform vec4 lineColor;
        varying lowp vec4 vColor;
        uniform sampler2D uSampler;

        void main(void)
        {
            vec4 texColor;
            texColor = texture2D(uSampler, gl_PointCoord);
            gl_FragColor = lineColor * vColor * texColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 ABC;
        attribute vec3 abc;
        attribute float PointSize;
        attribute vec4 Color;
        attribute vec2 we;
        attribute vec2 nT;
        attribute vec2 az;
        attribute vec2 orbit;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform float jNow;
        uniform vec3 cameraPosition;
        uniform float MM;
        uniform float scaling;
        uniform float minSize;
        uniform float opacity;
        varying lowp vec4 vColor;

        void main(void)
        {
            float M = nT.x * (jNow - nT.y) * 0.01745329251994;
            float e = we.y;
            float a = az.x;
            float PI = 3.1415926535897932384;
            float w = we.x* 0.01745329251994;
            float F = 1.0;

            if (M < 0.0)
                F = -1.0;

            M = abs(M) / (2.0 * PI);
            M = (M - float(int(M)))*2.0 *PI *F;

            if (MM != 0.0)
            {
                M = MM + (1.0- orbit.x) *2.0 *PI;
                if (M > (2.0*PI))
                    M = M - (2.0*PI);
            }

            if (M < 0.0)
                M += 2.0 *PI;

            F = 1.0;
            if (M > PI)
                F = -1.0;

            if (M > PI)
                M = 2.0 *PI - M;

            float E = PI / 2.0;
            float scale = PI / 4.0;

            for (int i =0; i<23; i++)
            {
                float R = E - e *sin(E);
                if (M > R)
                    E += scale;
                else
                    E -= scale;
                scale /= 2.0;
            }

            E = E * F;

            float v = 2.0 * atan(sqrt((1.0 + e) / (1.0 -e )) * tan(E/2.0));
            float r = a * (1.0-e * cos(E));

            vec4 pnt;
            pnt.x = r * abc.x * sin(ABC.x + w + v);
            pnt.z = r * abc.y * sin(ABC.y + w + v);
            pnt.y = r * abc.z * sin(ABC.z + w + v);
            pnt.w = 1.0;

            float dist = distance(pnt.xyz, cameraPosition.xyz);
            gl_Position = uPMatrix * uMVMatrix * pnt;
            vColor.a = opacity * (1.0-(orbit.x));
            vColor.r = Color.r;
            vColor.g = Color.g;
            vColor.b = Color.b;
            gl_PointSize = max(minSize, scaling * (PointSize / dist));
        }
    `;

    KeplerPointSpriteShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(KeplerPointSpriteShader._frag, fragShaderText);
    gl.compileShader(KeplerPointSpriteShader._frag);
    var stat = gl.getShaderParameter(KeplerPointSpriteShader._frag, WEBGL.COMPILE_STATUS);
    KeplerPointSpriteShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(KeplerPointSpriteShader._vert, vertexShaderText);
    gl.compileShader(KeplerPointSpriteShader._vert);
    var stat1 = gl.getShaderParameter(KeplerPointSpriteShader._vert, WEBGL.COMPILE_STATUS);
    var compilationLog = gl.getShaderInfoLog(KeplerPointSpriteShader._vert);
    KeplerPointSpriteShader._prog = gl.createProgram();
    gl.attachShader(KeplerPointSpriteShader._prog, KeplerPointSpriteShader._vert);
    gl.attachShader(KeplerPointSpriteShader._prog, KeplerPointSpriteShader._frag);
    gl.linkProgram(KeplerPointSpriteShader._prog);
    var errcode = gl.getProgramParameter(KeplerPointSpriteShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(KeplerPointSpriteShader._prog);
    KeplerPointSpriteShader.abcLoc1 = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'abc');
    KeplerPointSpriteShader.abcLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'ABC');
    KeplerPointSpriteShader.pointSizeLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'PointSize');
    KeplerPointSpriteShader.colorLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'Color');
    KeplerPointSpriteShader.weLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'we');
    KeplerPointSpriteShader.nTLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'nT');
    KeplerPointSpriteShader.azLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'az');
    KeplerPointSpriteShader.orbitLoc = gl.getAttribLocation(KeplerPointSpriteShader._prog, 'orbit');
    KeplerPointSpriteShader.projMatLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'uPMatrix');
    KeplerPointSpriteShader.mvMatLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'uMVMatrix');
    KeplerPointSpriteShader.jNowLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'jNow');
    KeplerPointSpriteShader.cameraPosLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'cameraPosition');
    KeplerPointSpriteShader.mmLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'MM');
    KeplerPointSpriteShader.scaleLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'scaling');
    KeplerPointSpriteShader.minSizeLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'minSize');
    KeplerPointSpriteShader.lineColorLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'lineColor');
    KeplerPointSpriteShader.opacityLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'opacity');
    KeplerPointSpriteShader.sampLoc = gl.getUniformLocation(KeplerPointSpriteShader._prog, 'uSampler');
    gl.enable(WEBGL.BLEND);
    KeplerPointSpriteShader.initialized = true;
};

KeplerPointSpriteShader.use = function (renderContext, worldView, vertex, texture, lineColor, opacity, zBuffer, jNow, MM, camera, scale, minSize) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!KeplerPointSpriteShader.initialized) {
            KeplerPointSpriteShader.init(renderContext);
        }
        gl.useProgram(KeplerPointSpriteShader._prog);
        gl.uniformMatrix4fv(KeplerPointSpriteShader.mvMatLoc, false, worldView.floatArray());
        gl.uniformMatrix4fv(KeplerPointSpriteShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(KeplerPointSpriteShader.sampLoc, 0);
        gl.uniform1f(KeplerPointSpriteShader.jNowLoc, jNow);
        gl.uniform1f(KeplerPointSpriteShader.mmLoc, MM);
        gl.uniform4f(KeplerPointSpriteShader.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, lineColor.a / 255);
        gl.uniform1f(KeplerPointSpriteShader.opacityLoc, opacity);
        gl.uniform3f(KeplerPointSpriteShader.cameraPosLoc, camera.x, camera.y, camera.z);
        gl.uniform1f(KeplerPointSpriteShader.scaleLoc, scale);
        gl.uniform1f(KeplerPointSpriteShader.minSizeLoc, minSize);
        if (zBuffer) {
            gl.enable(WEBGL.DEPTH_TEST);
        } else {
            gl.disable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.abcLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.abcLoc1);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.colorLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.pointSizeLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.weLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.nTLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.azLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.orbitLoc);
        gl.enableVertexAttribArray(KeplerPointSpriteShader.weLoc);
        gl.vertexAttribPointer(KeplerPointSpriteShader.abcLoc, 3, WEBGL.FLOAT, false, 76, 0);
        gl.vertexAttribPointer(KeplerPointSpriteShader.abcLoc1, 3, WEBGL.FLOAT, false, 76, 12);
        gl.vertexAttribPointer(KeplerPointSpriteShader.pointSizeLoc, 1, WEBGL.FLOAT, false, 76, 24);
        gl.vertexAttribPointer(KeplerPointSpriteShader.colorLoc, 4, WEBGL.FLOAT, false, 76, 28);
        gl.vertexAttribPointer(KeplerPointSpriteShader.weLoc, 2, WEBGL.FLOAT, false, 76, 44);
        gl.vertexAttribPointer(KeplerPointSpriteShader.nTLoc, 2, WEBGL.FLOAT, false, 76, 52);
        gl.vertexAttribPointer(KeplerPointSpriteShader.azLoc, 2, WEBGL.FLOAT, false, 76, 60);
        gl.vertexAttribPointer(KeplerPointSpriteShader.orbitLoc, 2, WEBGL.FLOAT, false, 76, 68);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
    }
};

var KeplerPointSpriteShader$ = {};

registerType("KeplerPointSpriteShader", [KeplerPointSpriteShader, KeplerPointSpriteShader$, null]);


// wwtlib.EllipseShader

export function EllipseShader() { }

EllipseShader.angleLoc = 0;
EllipseShader.initialized = false;
EllipseShader._prog = null;

EllipseShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;
        varying lowp vec4 vColor;

        void main(void)
        {
            gl_FragColor = vColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 Angle;
        uniform mat4 matWVP;
        uniform mat4 matPosition;
        uniform vec3 positionNow;
        uniform float semiMajorAxis;
        uniform float eccentricity;
        uniform vec4 color;
        uniform float eccentricAnomaly;
        varying lowp vec4 vColor;

        void main(void)
        {
            float fade = (1.0 - Angle.x);
            float PI = 3.1415927;
            float E = eccentricAnomaly - Angle.x * 2.0 * PI;
            vec2 semiAxes = vec2(1.0, sqrt(1.0 - eccentricity * eccentricity)) * semiMajorAxis;
            vec2 planePos = semiAxes * vec2(cos(E) - eccentricity, sin(E));

            if (Angle.x == 0.0)
                gl_Position =  matPosition * vec4(positionNow, 1.0);
            else
                gl_Position = matWVP * vec4(planePos.x, planePos.y, 0.0, 1.0);

            vColor = vec4(color.rgb, fade * color.a);
        }
    `;

    EllipseShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(EllipseShader._frag, fragShaderText);
    gl.compileShader(EllipseShader._frag);
    var stat = gl.getShaderParameter(EllipseShader._frag, WEBGL.COMPILE_STATUS);
    EllipseShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(EllipseShader._vert, vertexShaderText);
    gl.compileShader(EllipseShader._vert);
    var stat1 = gl.getShaderParameter(EllipseShader._vert, WEBGL.COMPILE_STATUS);
    var compilationLog = gl.getShaderInfoLog(EllipseShader._vert);
    EllipseShader._prog = gl.createProgram();
    gl.attachShader(EllipseShader._prog, EllipseShader._vert);
    gl.attachShader(EllipseShader._prog, EllipseShader._frag);
    gl.linkProgram(EllipseShader._prog);
    var errcode = gl.getProgramParameter(EllipseShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(EllipseShader._prog);
    EllipseShader.angleLoc = gl.getAttribLocation(EllipseShader._prog, 'Angle');
    EllipseShader.matWVPLoc = gl.getUniformLocation(EllipseShader._prog, 'matWVP');
    EllipseShader.matPositionLoc = gl.getUniformLocation(EllipseShader._prog, 'matPosition');
    EllipseShader.positionNowLoc = gl.getUniformLocation(EllipseShader._prog, 'positionNow');
    EllipseShader.colorLoc = gl.getUniformLocation(EllipseShader._prog, 'color');
    EllipseShader.semiMajorAxisLoc = gl.getUniformLocation(EllipseShader._prog, 'semiMajorAxis');
    EllipseShader.eccentricityLoc = gl.getUniformLocation(EllipseShader._prog, 'eccentricity');
    EllipseShader.eccentricAnomalyLoc = gl.getUniformLocation(EllipseShader._prog, 'eccentricAnomaly');
    gl.enable(WEBGL.BLEND);
    EllipseShader.initialized = true;
};

EllipseShader.use = function (renderContext, semiMajorAxis, eccentricity, eccentricAnomaly, lineColor, opacity, world, positionNow) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!EllipseShader.initialized) {
            EllipseShader.init(renderContext);
        }
        gl.useProgram(EllipseShader._prog);
        var WVPPos = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(world, renderContext.get_view()), renderContext.get_projection());
        var WVP = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view()), renderContext.get_projection());
        gl.uniformMatrix4fv(EllipseShader.matWVPLoc, false, WVP.floatArray());
        gl.uniformMatrix4fv(EllipseShader.matPositionLoc, false, WVPPos.floatArray());
        gl.uniform3f(EllipseShader.positionNowLoc, positionNow.x, positionNow.y, positionNow.z);
        gl.uniform4f(EllipseShader.colorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, lineColor.a / 255);
        gl.uniform1f(EllipseShader.semiMajorAxisLoc, semiMajorAxis);
        gl.uniform1f(EllipseShader.eccentricityLoc, eccentricity);
        gl.uniform1f(EllipseShader.eccentricAnomalyLoc, eccentricAnomaly);
        gl.disable(WEBGL.DEPTH_TEST);
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.enableVertexAttribArray(EllipseShader.angleLoc);
        gl.vertexAttribPointer(EllipseShader.angleLoc, 3, WEBGL.FLOAT, false, 0, 0);
        gl.lineWidth(1);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
    }
};

var EllipseShader$ = {};

registerType("EllipseShader", [EllipseShader, EllipseShader$, null]);


// wwtlib.ModelShader

export function ModelShader() { }

ModelShader.vertLoc = 0;
ModelShader.normalLoc = 0;
ModelShader.textureLoc = 0;
ModelShader.initialized = false;
ModelShader._prog = null;
ModelShader.sunPosition = Vector3d.create(-1, -1, -1);
ModelShader.minLightingBrightness = 1;
ModelShader.atmosphereColor = Color.fromArgb(0, 0, 0, 0);

ModelShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        uniform sampler2D uSampler;
        uniform float opacity;
        uniform vec3 uSunPosition;
        uniform float uMinBrightness;
        uniform vec3 uAtmosphereColor;

        void main(void) {
            vec3 normal = normalize(vNormal);
            vec3 camVN = normalize(vCamVector);
            vec3 cam = normalize(vec3(0.0,0.0,-1.0));
            float dt = uMinBrightness + pow(max(0.0,- dot(normal,uSunPosition)),0.5);
            float atm = max(0.0, 1.0 - 2.5 * dot(cam,camVN)) + 0.3 * dt;
            atm = (dt > uMinBrightness) ? atm : 0.0;
            if ( uMinBrightness == 1.0 ) { dt = 1.0; atm= 0.0; }
            vec4 col = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = col * opacity;
            gl_FragColor.rgb *= dt;
            gl_FragColor.rgb += atm * uAtmosphereColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec3 aNormal;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vCamVector = normalize((mat3(uMVMatrix) * aVertexPosition).xyz);
            vec3 normalT = normalize(mat3(uMVMatrix) * aNormal);
            vTextureCoord = aTextureCoord;
            vNormal = normalT;
        }
    `;

    ModelShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(ModelShader._frag, fragShaderText);
    gl.compileShader(ModelShader._frag);
    var stat = gl.getShaderParameter(ModelShader._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(ModelShader._frag);
    }
    ModelShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(ModelShader._vert, vertexShaderText);
    gl.compileShader(ModelShader._vert);
    var stat1 = gl.getShaderParameter(ModelShader._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(ModelShader._vert);
    }
    ModelShader._prog = gl.createProgram();
    gl.attachShader(ModelShader._prog, ModelShader._vert);
    gl.attachShader(ModelShader._prog, ModelShader._frag);
    gl.linkProgram(ModelShader._prog);
    var errcode = gl.getProgramParameter(ModelShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(ModelShader._prog);
    ModelShader.vertLoc = gl.getAttribLocation(ModelShader._prog, 'aVertexPosition');
    ModelShader.normalLoc = gl.getAttribLocation(ModelShader._prog, 'aNormal');
    ModelShader.textureLoc = gl.getAttribLocation(ModelShader._prog, 'aTextureCoord');
    ModelShader.projMatLoc = gl.getUniformLocation(ModelShader._prog, 'uPMatrix');
    ModelShader.mvMatLoc = gl.getUniformLocation(ModelShader._prog, 'uMVMatrix');
    ModelShader.sampLoc = gl.getUniformLocation(ModelShader._prog, 'uSampler');
    ModelShader.sunLoc = gl.getUniformLocation(ModelShader._prog, 'uSunPosition');
    ModelShader.minBrightnessLoc = gl.getUniformLocation(ModelShader._prog, 'uMinBrightness');
    ModelShader.opacityLoc = gl.getUniformLocation(ModelShader._prog, 'opacity');
    ModelShader.atmosphereColorLoc = gl.getUniformLocation(ModelShader._prog, 'uAtmosphereColor');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    ModelShader.initialized = true;
};

ModelShader.use = function (renderContext, vertex, index, texture, opacity, noDepth, stride) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!ModelShader.initialized) {
            ModelShader.init(renderContext);
        }
        gl.useProgram(ModelShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(ModelShader.opacityLoc, opacity);
        gl.uniform1f(ModelShader.minBrightnessLoc, (renderContext.lighting) ? ModelShader.minLightingBrightness : 1);
        if (renderContext.lighting) {
            gl.uniform3f(ModelShader.atmosphereColorLoc, ModelShader.atmosphereColor.r / 255, ModelShader.atmosphereColor.g / 255, ModelShader.atmosphereColor.b / 255);
        } else {
            gl.uniform3f(ModelShader.atmosphereColorLoc, 0, 0, 0);
        }
        gl.uniformMatrix4fv(ModelShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(ModelShader.projMatLoc, false, renderContext.get_projection().floatArray());
        ModelShader.sunPosition.normalize();
        var mvInv = renderContext.get_view().clone();
        mvInv.set_m41(0);
        mvInv.set_m42(0);
        mvInv.set_m43(0);
        mvInv.set_m44(1);
        var sp = Vector3d._transformCoordinate(ModelShader.sunPosition, mvInv);
        sp.normalize();
        gl.uniform3f(ModelShader.sunLoc, sp.x, sp.y, sp.z);
        gl.uniform1i(ModelShader.sampLoc, 0);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(ModelShader.vertLoc);
        gl.enableVertexAttribArray(ModelShader.normalLoc);
        gl.enableVertexAttribArray(ModelShader.textureLoc);
        gl.vertexAttribPointer(ModelShader.vertLoc, 3, WEBGL.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(ModelShader.normalLoc, 3, WEBGL.FLOAT, false, stride, 12);
        gl.vertexAttribPointer(ModelShader.textureLoc, 2, WEBGL.FLOAT, false, stride, stride - 8);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var ModelShader$ = {};

registerType("ModelShader", [ModelShader, ModelShader$, null]);


// wwtlib.ModelShaderTan

export function ModelShaderTan() { }

ModelShaderTan.vertLoc = 0;
ModelShaderTan.normalLoc = 0;
ModelShaderTan.textureLoc = 0;
ModelShaderTan.initialized = false;
ModelShaderTan._prog = null;
ModelShaderTan.sunPosition = Vector3d.create(-1, -1, -1);
ModelShaderTan.minLightingBrightness = 1;
ModelShaderTan.atmosphereColor = Color.fromArgb(0, 0, 0, 0);

ModelShaderTan.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        uniform sampler2D uSampler;
        uniform float opacity;
        uniform vec3 uSunPosition;
        uniform float uMinBrightness;
        uniform vec3 uAtmosphereColor;

        void main(void) {
            vec3 normal = normalize(vNormal);
            vec3 camVN = normalize(vCamVector);
            vec3 cam = normalize(vec3(0.0,0.0,-1.0));
            float dt = uMinBrightness + pow(max(0.0,- dot(normal,uSunPosition)),0.5);
            float atm = max(0.0, 1.0 - 2.5 * dot(cam,camVN)) + 0.3 * dt;
            atm = (dt > uMinBrightness) ? atm : 0.0;
            if ( uMinBrightness == 1.0 ) { dt = 1.0; atm= 0.0; }
            vec4 col = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = col * opacity;
            gl_FragColor.rgb *= dt;
            gl_FragColor.rgb += atm * uAtmosphereColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec3 aNormal;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vCamVector = normalize((mat3(uMVMatrix) * aVertexPosition).xyz);
            vec3 normalT = normalize(mat3(uMVMatrix) * aNormal);
            vTextureCoord = aTextureCoord;
            vNormal = normalT;
        }
    `;

    ModelShaderTan._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(ModelShaderTan._frag, fragShaderText);
    gl.compileShader(ModelShaderTan._frag);
    var stat = gl.getShaderParameter(ModelShaderTan._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(ModelShaderTan._frag);
    }
    ModelShaderTan._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(ModelShaderTan._vert, vertexShaderText);
    gl.compileShader(ModelShaderTan._vert);
    var stat1 = gl.getShaderParameter(ModelShaderTan._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(ModelShaderTan._vert);
    }
    ModelShaderTan._prog = gl.createProgram();
    gl.attachShader(ModelShaderTan._prog, ModelShaderTan._vert);
    gl.attachShader(ModelShaderTan._prog, ModelShaderTan._frag);
    gl.linkProgram(ModelShaderTan._prog);
    var errcode = gl.getProgramParameter(ModelShaderTan._prog, WEBGL.LINK_STATUS);
    gl.useProgram(ModelShaderTan._prog);
    ModelShaderTan.vertLoc = gl.getAttribLocation(ModelShaderTan._prog, 'aVertexPosition');
    ModelShaderTan.normalLoc = gl.getAttribLocation(ModelShaderTan._prog, 'aNormal');
    ModelShaderTan.textureLoc = gl.getAttribLocation(ModelShaderTan._prog, 'aTextureCoord');
    ModelShaderTan.projMatLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uPMatrix');
    ModelShaderTan.mvMatLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uMVMatrix');
    ModelShaderTan.sampLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uSampler');
    ModelShaderTan.sunLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uSunPosition');
    ModelShaderTan.minBrightnessLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uMinBrightness');
    ModelShaderTan.opacityLoc = gl.getUniformLocation(ModelShaderTan._prog, 'opacity');
    ModelShaderTan.atmosphereColorLoc = gl.getUniformLocation(ModelShaderTan._prog, 'uAtmosphereColor');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    ModelShaderTan.initialized = true;
};

ModelShaderTan.use = function (renderContext, vertex, index, texture, opacity, noDepth, stride) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!ModelShaderTan.initialized) {
            ModelShaderTan.init(renderContext);
        }
        gl.useProgram(ModelShaderTan._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(ModelShaderTan.opacityLoc, opacity);
        gl.uniform1f(ModelShaderTan.minBrightnessLoc, (renderContext.lighting) ? ModelShaderTan.minLightingBrightness : 1);
        if (renderContext.lighting) {
            gl.uniform3f(ModelShaderTan.atmosphereColorLoc, ModelShaderTan.atmosphereColor.r / 255, ModelShaderTan.atmosphereColor.g / 255, ModelShaderTan.atmosphereColor.b / 255);
        } else {
            gl.uniform3f(ModelShaderTan.atmosphereColorLoc, 0, 0, 0);
        }
        gl.uniformMatrix4fv(ModelShaderTan.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(ModelShaderTan.projMatLoc, false, renderContext.get_projection().floatArray());
        ModelShaderTan.sunPosition.normalize();
        var mvInv = renderContext.get_view().clone();
        mvInv.set_m41(0);
        mvInv.set_m42(0);
        mvInv.set_m43(0);
        mvInv.set_m44(1);
        var sp = Vector3d._transformCoordinate(ModelShaderTan.sunPosition, mvInv);
        sp.normalize();
        gl.uniform3f(ModelShaderTan.sunLoc, -sp.x, -sp.y, -sp.z);
        gl.uniform1i(ModelShaderTan.sampLoc, 0);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(ModelShaderTan.vertLoc);
        gl.enableVertexAttribArray(ModelShaderTan.normalLoc);
        gl.enableVertexAttribArray(ModelShaderTan.textureLoc);
        gl.vertexAttribPointer(ModelShaderTan.vertLoc, 3, WEBGL.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(ModelShaderTan.normalLoc, 3, WEBGL.FLOAT, false, stride, 12);
        gl.vertexAttribPointer(ModelShaderTan.textureLoc, 2, WEBGL.FLOAT, false, stride, stride - 8);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var ModelShaderTan$ = {};

registerType("ModelShaderTan", [ModelShaderTan, ModelShaderTan$, null]);


// wwtlib.TileShader

export function TileShader() { }

TileShader.vertLoc = 0;
TileShader.textureLoc = 0;
TileShader.initialized = false;
TileShader._prog = null;
TileShader.sunPosition = Vector3d.create(-1, -1, -1);
TileShader.minLightingBrightness = 1;
TileShader.atmosphereColor = Color.fromArgb(0, 0, 0, 0);

TileShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        uniform sampler2D uSampler;
        uniform float opacity;
        uniform vec3 uSunPosition;
        uniform float uMinBrightness;
        uniform vec3 uAtmosphereColor;

        void main(void) {
            vec3 normal = normalize(vNormal);
            vec3 camVN = normalize(vCamVector);
            vec3 cam = normalize(vec3(0.0,0.0,-1.0));
            float dt = uMinBrightness + pow(max(0.0,- dot(normal,uSunPosition)),0.5);
            float atm = max(0.0, 1.0 - 2.5 * dot(cam,camVN)) + 0.3 * dt;
            atm = (dt > uMinBrightness) ? atm : 0.0;
            if ( uMinBrightness == 1.0 ) { dt = 1.0; atm = 0.0; }
            vec4 col = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = col * opacity;
            gl_FragColor.rgb *= dt;
            gl_FragColor.rgb += atm * uAtmosphereColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform vec3 uCenterScreen;
        uniform vec3 uCenterWorld;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        void main(void) {
            vec3 normal;

            if (length(uCenterWorld) > 0.00001) {
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 0.0) + vec4(uCenterScreen, 1.0);
                vCamVector = normalize((mat3(uMVMatrix) * (aVertexPosition + uCenterWorld)).xyz);
                normal = normalize(aVertexPosition + uCenterWorld);
            } else {
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
                vCamVector = normalize((mat3(uMVMatrix) * aVertexPosition).xyz);
                normal = normalize(aVertexPosition);
            }

            vec3 normalT = normalize(mat3(uMVMatrix) * normal);
            vTextureCoord = aTextureCoord;
            vNormal = normalT;
        }
    `;

    TileShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(TileShader._frag, fragShaderText);
    gl.compileShader(TileShader._frag);
    var stat = gl.getShaderParameter(TileShader._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(TileShader._frag);
    }
    TileShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(TileShader._vert, vertexShaderText);
    gl.compileShader(TileShader._vert);
    var stat1 = gl.getShaderParameter(TileShader._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(TileShader._vert);
    }
    TileShader._prog = gl.createProgram();
    gl.attachShader(TileShader._prog, TileShader._vert);
    gl.attachShader(TileShader._prog, TileShader._frag);
    gl.linkProgram(TileShader._prog);
    var errcode = gl.getProgramParameter(TileShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(TileShader._prog);
    TileShader.vertLoc = gl.getAttribLocation(TileShader._prog, 'aVertexPosition');
    TileShader.textureLoc = gl.getAttribLocation(TileShader._prog, 'aTextureCoord');
    TileShader.projMatLoc = gl.getUniformLocation(TileShader._prog, 'uPMatrix');
    TileShader.mvMatLoc = gl.getUniformLocation(TileShader._prog, 'uMVMatrix');
    TileShader.sampLoc = gl.getUniformLocation(TileShader._prog, 'uSampler');
    TileShader.centerScreenLoc = gl.getUniformLocation(TileShader._prog, 'uCenterScreen');
    TileShader.centerWorldLoc = gl.getUniformLocation(TileShader._prog, 'uCenterWorld');
    TileShader.sunLoc = gl.getUniformLocation(TileShader._prog, 'uSunPosition');
    TileShader.minBrightnessLoc = gl.getUniformLocation(TileShader._prog, 'uMinBrightness');
    TileShader.opacityLoc = gl.getUniformLocation(TileShader._prog, 'opacity');
    TileShader.atmosphereColorLoc = gl.getUniformLocation(TileShader._prog, 'uAtmosphereColor');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    TileShader.initialized = true;
};

TileShader.use = function (renderContext, vertex, index, texture, opacity, noDepth, centerWorld) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!TileShader.initialized) {
            TileShader.init(renderContext);
        }
        gl.useProgram(TileShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(TileShader.opacityLoc, opacity);
        gl.uniform1f(TileShader.minBrightnessLoc, (renderContext.lighting) ? TileShader.minLightingBrightness : 1);
        if (renderContext.lighting) {
            gl.uniform3f(TileShader.atmosphereColorLoc, TileShader.atmosphereColor.r / 255, TileShader.atmosphereColor.g / 255, TileShader.atmosphereColor.b / 255);
        } else {
            gl.uniform3f(TileShader.atmosphereColorLoc, 0, 0, 0);
        }
        gl.uniform3f(TileShader.centerWorldLoc, centerWorld.x, centerWorld.y, centerWorld.z);

        // "This would be clearer by making the 'centerWorld' parameter optional. Unfortunately, that's not allowed in C# 2.0"
        if (centerWorld.lengthSq() > 0.001) {
            var wvp = Matrix3d.multiplyMatrix(mvMat, renderContext.get_projection());
            var centerScreen = wvp.transform(centerWorld);
            gl.uniform3f(TileShader.centerScreenLoc, centerScreen.x, centerScreen.y, centerScreen.z);
        } else {
            gl.uniform3f(TileShader.centerScreenLoc, 0, 0, 0);
        }
        gl.uniformMatrix4fv(TileShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(TileShader.projMatLoc, false, renderContext.get_projection().floatArray());
        TileShader.sunPosition.normalize();
        var mvInv = renderContext.get_view().clone();
        mvInv.set_m41(0);
        mvInv.set_m42(0);
        mvInv.set_m43(0);
        mvInv.set_m44(1);
        var sp = Vector3d._transformCoordinate(TileShader.sunPosition, mvInv);
        sp.normalize();
        gl.uniform3f(TileShader.sunLoc, -sp.x, -sp.y, -sp.z);
        gl.uniform1i(TileShader.sampLoc, 0);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(TileShader.vertLoc);
        gl.enableVertexAttribArray(TileShader.textureLoc);
        gl.vertexAttribPointer(TileShader.vertLoc, 3, WEBGL.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(TileShader.textureLoc, 2, WEBGL.FLOAT, false, 20, 12);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var TileShader$ = {};

registerType("TileShader", [TileShader, TileShader$, null]);


// wwtlib.FitsShader

export function FitsShader() { }

FitsShader.vertLoc = 0;
FitsShader.textureLoc = 0;
FitsShader.initialized = false;
FitsShader._prog = null;
FitsShader.blankValue = 0;
FitsShader.bScale = 1;
FitsShader.bZero = 0;
FitsShader.min = 0;
FitsShader.max = 0;
FitsShader.transparentBlack = false;
FitsShader.containsBlanks = false;
FitsShader.scaleType = 0;

FitsShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        #version 300 es

        precision mediump float;
        in vec2 vTextureCoord;
        in vec3 vNormal;
        in vec3 vCamVector;
        out vec4 fragmentColor;

        uniform sampler2D uSampler;
        uniform sampler2D colorSampler;
        uniform float blank;
        uniform float bzero;
        uniform float bscale;
        uniform float min;
        uniform float max;
        uniform bool containsBlanks;
        uniform bool transparentBlack;
        uniform int scaleType;
        uniform float opacity;

        bool isNaN(float value) {
            // See https://stackoverflow.com/questions/9446888/best-way-to-detect-nans-in-opengl-shaders
            // PKGW also finds that we need "value != value" on his Dell laptop running
            // Chrome on Linux.
            return (value != value) || !(value < 0.0 || 0.0 < value || value == 0.0);
        }

        void main(void) {
            //FITS images are flipped on the y axis
            vec4 color = texture(uSampler, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));

            if(isNaN(color.r) || (containsBlanks && abs(blank - color.r) < 0.00000001)){
                fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
            } else {
                float physicalValue = (bzero + bscale * color.r - min) / (max - min);
                if(transparentBlack && physicalValue <= 0.0){
                    fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
                    return;
                }

                physicalValue = clamp(physicalValue, 0.0, 1.0);

                switch(scaleType){
                    case 1:
                        physicalValue = log(physicalValue * 255.0 + 1.0 ) / log(256.0);
                        break;
                    case 2:
                        physicalValue = physicalValue * physicalValue;
                        break;
                    case 3:
                        physicalValue = sqrt(physicalValue);
                        break;
                }
                vec4 colorFromColorMapper = texture(colorSampler, vec2(physicalValue, 0.5));
                fragmentColor = vec4(colorFromColorMapper.rgb, opacity);
            }
        }
    `;

    const vertexShaderText = `\
        #version 300 es

        in vec3 aVertexPosition;
        in vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform vec3 uCenterScreen;

        out vec2 vTextureCoord;

        void main(void) {
            if(length(uCenterScreen) > 0.0000001) {
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 0.0) + vec4(uCenterScreen, 1.0);
            } else {
                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            }

            vTextureCoord = aTextureCoord;
        }
    `;

    FitsShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(FitsShader._frag, fragShaderText);
    gl.compileShader(FitsShader._frag);
    var stat = gl.getShaderParameter(FitsShader._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(FitsShader._frag);
        console.log(errorF);
    }
    FitsShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(FitsShader._vert, vertexShaderText);
    gl.compileShader(FitsShader._vert);
    var stat1 = gl.getShaderParameter(FitsShader._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(FitsShader._vert);
        console.log(errorV);
    }
    FitsShader._prog = gl.createProgram();
    gl.attachShader(FitsShader._prog, FitsShader._vert);
    gl.attachShader(FitsShader._prog, FitsShader._frag);
    gl.linkProgram(FitsShader._prog);
    var errcode = gl.getProgramParameter(FitsShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(FitsShader._prog);
    FitsShader.vertLoc = gl.getAttribLocation(FitsShader._prog, 'aVertexPosition');
    FitsShader.textureLoc = gl.getAttribLocation(FitsShader._prog, 'aTextureCoord');
    FitsShader.projMatLoc = gl.getUniformLocation(FitsShader._prog, 'uPMatrix');
    FitsShader.mvMatLoc = gl.getUniformLocation(FitsShader._prog, 'uMVMatrix');
    FitsShader.sampLoc = gl.getUniformLocation(FitsShader._prog, 'uSampler');
    FitsShader.colorLoc = gl.getUniformLocation(FitsShader._prog, 'colorSampler');
    FitsShader.centerScreenLoc = gl.getUniformLocation(FitsShader._prog, 'uCenterScreen');
    FitsShader.blank = gl.getUniformLocation(FitsShader._prog, 'blank');
    FitsShader.bzero = gl.getUniformLocation(FitsShader._prog, 'bzero');
    FitsShader.bscale = gl.getUniformLocation(FitsShader._prog, 'bscale');
    FitsShader.minLoc = gl.getUniformLocation(FitsShader._prog, 'min');
    FitsShader.maxLoc = gl.getUniformLocation(FitsShader._prog, 'max');
    FitsShader.transparentBlackLoc = gl.getUniformLocation(FitsShader._prog, 'transparentBlack');
    FitsShader.containsBlanksLoc = gl.getUniformLocation(FitsShader._prog, 'containsBlanks');
    FitsShader.scalingLocation = gl.getUniformLocation(FitsShader._prog, 'scaleType');
    FitsShader.opacityLoc = gl.getUniformLocation(FitsShader._prog, 'opacity');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    FitsShader.initialized = true;
};

FitsShader.use = function (renderContext, vertex, index, texture, opacity, noDepth, centerWorld) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!FitsShader.initialized) {
            FitsShader.init(renderContext);
        }
        gl.useProgram(FitsShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(FitsShader.opacityLoc, opacity);
        gl.uniformMatrix4fv(FitsShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(FitsShader.projMatLoc, false, renderContext.get_projection().floatArray());

        // "This would be clearer by making the 'centerWorld' parameter optional. Unfortunately, that's not allowed in C# 2.0"
        if (centerWorld.lengthSq() > 0.001) {
            var wvp = Matrix3d.multiplyMatrix(mvMat, renderContext.get_projection());
            var centerScreen = wvp.transform(centerWorld);
            gl.uniform3f(FitsShader.centerScreenLoc, centerScreen.x, centerScreen.y, centerScreen.z);
        } else {
            gl.uniform3f(FitsShader.centerScreenLoc, 0, 0, 0);
        }

        gl.uniform1i(FitsShader.sampLoc, 0);
        gl.uniform1i(FitsShader.colorLoc, 1);
        gl.uniform1f(FitsShader.blank, FitsShader.blankValue);
        gl.uniform1f(FitsShader.bzero, FitsShader.bZero);
        gl.uniform1f(FitsShader.bscale, FitsShader.bScale);
        gl.uniform1f(FitsShader.minLoc, FitsShader.min);
        gl.uniform1f(FitsShader.maxLoc, FitsShader.max);
        gl.uniform1i(FitsShader.transparentBlackLoc, FitsShader.transparentBlack);
        gl.uniform1i(FitsShader.containsBlanksLoc, FitsShader.containsBlanks);
        gl.uniform1i(FitsShader.scalingLocation, FitsShader.scaleType);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(FitsShader.vertLoc);
        gl.enableVertexAttribArray(FitsShader.textureLoc);
        gl.vertexAttribPointer(FitsShader.vertLoc, 3, WEBGL.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(FitsShader.textureLoc, 2, WEBGL.FLOAT, false, 20, 12);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var FitsShader$ = {};

registerType("FitsShader", [FitsShader, FitsShader$, null]);


// wwtlib.ImageShader

export function ImageShader() { }

ImageShader.vertLoc = 0;
ImageShader.textureLoc = 0;
ImageShader.initialized = false;
ImageShader._prog = null;

ImageShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform float opacity;

        void main(void) {
            vec4 col = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = col * opacity;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    ImageShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(ImageShader._frag, fragShaderText);
    gl.compileShader(ImageShader._frag);
    var stat = gl.getShaderParameter(ImageShader._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(ImageShader._frag);
    }
    ImageShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(ImageShader._vert, vertexShaderText);
    gl.compileShader(ImageShader._vert);
    var stat1 = gl.getShaderParameter(ImageShader._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(ImageShader._vert);
    }
    ImageShader._prog = gl.createProgram();
    gl.attachShader(ImageShader._prog, ImageShader._vert);
    gl.attachShader(ImageShader._prog, ImageShader._frag);
    gl.linkProgram(ImageShader._prog);
    var errcode = gl.getProgramParameter(ImageShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(ImageShader._prog);
    ImageShader.vertLoc = gl.getAttribLocation(ImageShader._prog, 'aVertexPosition');
    ImageShader.textureLoc = gl.getAttribLocation(ImageShader._prog, 'aTextureCoord');
    ImageShader.projMatLoc = gl.getUniformLocation(ImageShader._prog, 'uPMatrix');
    ImageShader.mvMatLoc = gl.getUniformLocation(ImageShader._prog, 'uMVMatrix');
    ImageShader.sampLoc = gl.getUniformLocation(ImageShader._prog, 'uSampler');
    ImageShader.opacityLoc = gl.getUniformLocation(ImageShader._prog, 'opacity');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    ImageShader.initialized = true;
};

ImageShader.use = function (renderContext, vertex, index, texture, opacity, noDepth) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!ImageShader.initialized) {
            ImageShader.init(renderContext);
        }
        gl.useProgram(ImageShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(ImageShader.opacityLoc, opacity);
        gl.uniformMatrix4fv(ImageShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(ImageShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(ImageShader.sampLoc, 0);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(ImageShader.vertLoc);
        gl.enableVertexAttribArray(ImageShader.textureLoc);
        gl.vertexAttribPointer(ImageShader.vertLoc, 3, WEBGL.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(ImageShader.textureLoc, 2, WEBGL.FLOAT, false, 20, 12);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var ImageShader$ = {};

registerType("ImageShader", [ImageShader, ImageShader$, null]);


// wwtlib.ImageShader2

export function ImageShader2() { }

ImageShader2.vertLoc = 0;
ImageShader2.textureLoc = 0;
ImageShader2.initialized = false;
ImageShader2._prog = null;

ImageShader2.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform float opacity;

        void main(void) {
            vec4 col = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            gl_FragColor = col * opacity;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        varying vec3 vCamVector;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    ImageShader2._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(ImageShader2._frag, fragShaderText);
    gl.compileShader(ImageShader2._frag);
    var stat = gl.getShaderParameter(ImageShader2._frag, WEBGL.COMPILE_STATUS);
    if (!stat) {
        var errorF = gl.getShaderInfoLog(ImageShader2._frag);
    }
    ImageShader2._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(ImageShader2._vert, vertexShaderText);
    gl.compileShader(ImageShader2._vert);
    var stat1 = gl.getShaderParameter(ImageShader2._vert, WEBGL.COMPILE_STATUS);
    if (!stat1) {
        var errorV = gl.getShaderInfoLog(ImageShader2._vert);
    }
    ImageShader2._prog = gl.createProgram();
    gl.attachShader(ImageShader2._prog, ImageShader2._vert);
    gl.attachShader(ImageShader2._prog, ImageShader2._frag);
    gl.linkProgram(ImageShader2._prog);
    var errcode = gl.getProgramParameter(ImageShader2._prog, WEBGL.LINK_STATUS);
    gl.useProgram(ImageShader2._prog);
    ImageShader2.vertLoc = gl.getAttribLocation(ImageShader2._prog, 'aVertexPosition');
    ImageShader2.textureLoc = gl.getAttribLocation(ImageShader2._prog, 'aTextureCoord');
    ImageShader2.projMatLoc = gl.getUniformLocation(ImageShader2._prog, 'uPMatrix');
    ImageShader2.mvMatLoc = gl.getUniformLocation(ImageShader2._prog, 'uMVMatrix');
    ImageShader2.sampLoc = gl.getUniformLocation(ImageShader2._prog, 'uSampler');
    ImageShader2.opacityLoc = gl.getUniformLocation(ImageShader2._prog, 'opacity');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    ImageShader2.initialized = true;
};

ImageShader2.use = function (renderContext, vertex, index, texture, opacity, noDepth) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!ImageShader2.initialized) {
            ImageShader2.init(renderContext);
        }
        gl.useProgram(ImageShader2._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniform1f(ImageShader2.opacityLoc, opacity);
        gl.uniformMatrix4fv(ImageShader2.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(ImageShader2.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(ImageShader2.sampLoc, 0);
        if (renderContext.space || noDepth) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(ImageShader2.vertLoc);
        gl.enableVertexAttribArray(ImageShader2.textureLoc);
        gl.vertexAttribPointer(ImageShader2.vertLoc, 3, WEBGL.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(ImageShader2.textureLoc, 2, WEBGL.FLOAT, false, 32, 24);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, index);
        gl.enable(WEBGL.BLEND);
        if (noDepth) {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE);
        } else {
            gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
        }
    }
};

var ImageShader2$ = {};

registerType("ImageShader2", [ImageShader2, ImageShader2$, null]);


// wwtlib.SpriteShader

export function SpriteShader() { }

SpriteShader.vertLoc = 0;
SpriteShader.textureLoc = 0;
SpriteShader.colorLoc = 0;
SpriteShader.initialized = false;
SpriteShader._prog = null;

SpriteShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;
        varying lowp vec4 vColor;
        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * vColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
        attribute lowp vec4 aColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec4 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
            vColor = aColor;
        }
    `;

    SpriteShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(SpriteShader._frag, fragShaderText);
    gl.compileShader(SpriteShader._frag);
    var stat = gl.getShaderParameter(SpriteShader._frag, WEBGL.COMPILE_STATUS);
    SpriteShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(SpriteShader._vert, vertexShaderText);
    gl.compileShader(SpriteShader._vert);
    var stat1 = gl.getShaderParameter(SpriteShader._vert, WEBGL.COMPILE_STATUS);
    SpriteShader._prog = gl.createProgram();
    gl.attachShader(SpriteShader._prog, SpriteShader._vert);
    gl.attachShader(SpriteShader._prog, SpriteShader._frag);
    gl.linkProgram(SpriteShader._prog);
    var errcode = gl.getProgramParameter(SpriteShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(SpriteShader._prog);
    SpriteShader.vertLoc = gl.getAttribLocation(SpriteShader._prog, 'aVertexPosition');
    SpriteShader.textureLoc = gl.getAttribLocation(SpriteShader._prog, 'aTextureCoord');
    SpriteShader.colorLoc = gl.getAttribLocation(SpriteShader._prog, 'aColor');
    SpriteShader.projMatLoc = gl.getUniformLocation(SpriteShader._prog, 'uPMatrix');
    SpriteShader.mvMatLoc = gl.getUniformLocation(SpriteShader._prog, 'uMVMatrix');
    SpriteShader.sampLoc = gl.getUniformLocation(SpriteShader._prog, 'uSampler');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    SpriteShader.initialized = true;
};

SpriteShader.use = function (renderContext, vertex, texture) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!SpriteShader.initialized) {
            SpriteShader.init(renderContext);
        }
        gl.useProgram(SpriteShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(SpriteShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(SpriteShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(SpriteShader.sampLoc, 0);
        gl.disable(WEBGL.DEPTH_TEST);
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(SpriteShader.vertLoc);
        gl.enableVertexAttribArray(SpriteShader.textureLoc);
        gl.enableVertexAttribArray(SpriteShader.colorLoc);
        gl.vertexAttribPointer(SpriteShader.vertLoc, 3, WEBGL.FLOAT, false, 36, 0);
        gl.vertexAttribPointer(SpriteShader.colorLoc, 4, WEBGL.FLOAT, false, 36, 12);
        gl.vertexAttribPointer(SpriteShader.textureLoc, 2, WEBGL.FLOAT, false, 36, 28);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var SpriteShader$ = {};

registerType("SpriteShader", [SpriteShader, SpriteShader$, null]);


// wwtlib.ShapeSpriteShader

export function ShapeSpriteShader() { }

ShapeSpriteShader.vertLoc = 0;
ShapeSpriteShader.textureLoc = 0;
ShapeSpriteShader.colorLoc = 0;
ShapeSpriteShader.initialized = false;
ShapeSpriteShader._prog = null;

ShapeSpriteShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying lowp vec4 vColor;

        void main(void) {
            gl_FragColor =  vColor;
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute lowp vec4 aColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;
        varying vec4 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aColor;
        }
    `;

    ShapeSpriteShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(ShapeSpriteShader._frag, fragShaderText);
    gl.compileShader(ShapeSpriteShader._frag);
    var stat = gl.getShaderParameter(ShapeSpriteShader._frag, WEBGL.COMPILE_STATUS);
    ShapeSpriteShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(ShapeSpriteShader._vert, vertexShaderText);
    gl.compileShader(ShapeSpriteShader._vert);
    var stat1 = gl.getShaderParameter(ShapeSpriteShader._vert, WEBGL.COMPILE_STATUS);
    ShapeSpriteShader._prog = gl.createProgram();
    gl.attachShader(ShapeSpriteShader._prog, ShapeSpriteShader._vert);
    gl.attachShader(ShapeSpriteShader._prog, ShapeSpriteShader._frag);
    gl.linkProgram(ShapeSpriteShader._prog);
    var errcode = gl.getProgramParameter(ShapeSpriteShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(ShapeSpriteShader._prog);
    ShapeSpriteShader.vertLoc = gl.getAttribLocation(ShapeSpriteShader._prog, 'aVertexPosition');
    ShapeSpriteShader.colorLoc = gl.getAttribLocation(ShapeSpriteShader._prog, 'aColor');
    ShapeSpriteShader.projMatLoc = gl.getUniformLocation(ShapeSpriteShader._prog, 'uPMatrix');
    ShapeSpriteShader.mvMatLoc = gl.getUniformLocation(ShapeSpriteShader._prog, 'uMVMatrix');
    gl.disable(WEBGL.DEPTH_TEST);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    ShapeSpriteShader.initialized = true;
};

ShapeSpriteShader.use = function (renderContext, vertex) {
    var gl = renderContext.gl;
    if (gl != null) {
        if (!ShapeSpriteShader.initialized) {
            ShapeSpriteShader.init(renderContext);
        }
        gl.useProgram(ShapeSpriteShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(ShapeSpriteShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(ShapeSpriteShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(ShapeSpriteShader.sampLoc, 0);
        gl.disable(WEBGL.DEPTH_TEST);
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(ShapeSpriteShader.vertLoc);
        gl.enableVertexAttribArray(ShapeSpriteShader.textureLoc);
        gl.enableVertexAttribArray(ShapeSpriteShader.colorLoc);
        gl.vertexAttribPointer(ShapeSpriteShader.vertLoc, 3, WEBGL.FLOAT, false, 36, 0);
        gl.vertexAttribPointer(ShapeSpriteShader.colorLoc, 4, WEBGL.FLOAT, false, 36, 12);
        gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var ShapeSpriteShader$ = {};

registerType("ShapeSpriteShader", [ShapeSpriteShader, ShapeSpriteShader$, null]);


// wwtlib.TextShader

export function TextShader() { }

TextShader.vertLoc = 0;
TextShader.textureLoc = 0;
TextShader.initialized = false;
TextShader._prog = null;

TextShader.init = function (renderContext) {
    var gl = renderContext.gl;

    const fragShaderText = `\
        precision mediump float;

        varying vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        }
    `;

    const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        varying vec2 vTextureCoord;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
        }
    `;

    TextShader._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
    gl.shaderSource(TextShader._frag, fragShaderText);
    gl.compileShader(TextShader._frag);
    var stat = gl.getShaderParameter(TextShader._frag, WEBGL.COMPILE_STATUS);
    TextShader._vert = gl.createShader(WEBGL.VERTEX_SHADER);
    gl.shaderSource(TextShader._vert, vertexShaderText);
    gl.compileShader(TextShader._vert);
    var stat1 = gl.getShaderParameter(TextShader._vert, WEBGL.COMPILE_STATUS);
    TextShader._prog = gl.createProgram();
    gl.attachShader(TextShader._prog, TextShader._vert);
    gl.attachShader(TextShader._prog, TextShader._frag);
    gl.linkProgram(TextShader._prog);
    var errcode = gl.getProgramParameter(TextShader._prog, WEBGL.LINK_STATUS);
    gl.useProgram(TextShader._prog);
    TextShader.vertLoc = gl.getAttribLocation(TextShader._prog, 'aVertexPosition');
    TextShader.textureLoc = gl.getAttribLocation(TextShader._prog, 'aTextureCoord');
    TextShader.projMatLoc = gl.getUniformLocation(TextShader._prog, 'uPMatrix');
    TextShader.mvMatLoc = gl.getUniformLocation(TextShader._prog, 'uMVMatrix');
    TextShader.sampLoc = gl.getUniformLocation(TextShader._prog, 'uSampler');
    set_tileUvMultiple(1);
    set_tileDemEnabled(true);
    gl.enable(WEBGL.BLEND);
    gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    TextShader.initialized = true;
};

TextShader.use = function (renderContext, vertex, texture) {
    if (texture == null) {
        texture = Texture.getEmpty();
    }
    var gl = renderContext.gl;
    if (gl != null) {
        if (!TextShader.initialized) {
            TextShader.init(renderContext);
        }
        gl.useProgram(TextShader._prog);
        var mvMat = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
        gl.uniformMatrix4fv(TextShader.mvMatLoc, false, mvMat.floatArray());
        gl.uniformMatrix4fv(TextShader.projMatLoc, false, renderContext.get_projection().floatArray());
        gl.uniform1i(TextShader.sampLoc, 0);
        if (renderContext.space) {
            gl.disable(WEBGL.DEPTH_TEST);
        } else {
            gl.enable(WEBGL.DEPTH_TEST);
        }
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
        gl.enableVertexAttribArray(TextShader.vertLoc);
        gl.enableVertexAttribArray(TextShader.textureLoc);
        gl.vertexAttribPointer(TextShader.vertLoc, 3, WEBGL.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(TextShader.textureLoc, 2, WEBGL.FLOAT, false, 20, 12);
        gl.activeTexture(WEBGL.TEXTURE0);
        gl.bindTexture(WEBGL.TEXTURE_2D, texture);
        gl.enable(WEBGL.BLEND);
        gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
    }
};

var TextShader$ = {};

registerType("TextShader", [TextShader, TextShader$, null]);
