// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Rendering the minor planet database

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { Vector3d, Matrix3d } from "./double3d.js";
import { EOE } from "./astrocalc/elliptical.js";
import { Texture } from "./graphics/texture.js";
import { WEBGL } from "./graphics/webgl_constants.js";
import { KeplerVertexBuffer } from "./graphics/gl_buffers.js"
import { KeplerPointSpriteShader } from "./graphics/shaders.js";
import { BlendState } from "./blend_state.js";
import { Colors } from "./color.js";
import { freestandingMode } from "./data_globals.js";
import { KeplerVertex } from "./kepler_vertex.js";
import { SpaceTimeController } from "./space_time_controller.js";
import { URLHelpers } from "./url_helpers.js";
import { BinaryReader } from "./utilities/binary_reader.js";
import { WebFile } from "./web_file.js";


// wwtlib.MinorPlanets

export function MinorPlanets() { }

MinorPlanets.mpcList = [];
MinorPlanets._initBegun = false;
MinorPlanets._mpcBlendStates = new Array(7);
MinorPlanets.starTexture = null;
MinorPlanets._mpcVertexBuffer = null;
MinorPlanets._mpcCount = 0;

MinorPlanets.getMpcFile = function (url) {
    MinorPlanets._webMpcFile = new WebFile(url);
    MinorPlanets._webMpcFile.responseType = 'blob';
    MinorPlanets._webMpcFile.onStateChange = MinorPlanets.starFileStateChange;
    MinorPlanets._webMpcFile.send();
};

MinorPlanets.starFileStateChange = function () {
    if (MinorPlanets._webMpcFile.get_state() === 2) {
        alert(MinorPlanets._webMpcFile.get_message());
    }
    else if (MinorPlanets._webMpcFile.get_state() === 1) {
        var mainBlob = MinorPlanets._webMpcFile.getBlob();
        var chunck = new FileReader();
        chunck.onloadend = function (e) {
            MinorPlanets._readFromBin(new BinaryReader(new Uint8Array(chunck.result)));
            MinorPlanets.initMPCVertexBuffer();
        };
        chunck.readAsArrayBuffer(mainBlob);
    }
};

MinorPlanets._readFromBin = function (br) {
    MinorPlanets.mpcList = [];
    var len = br.get_length();
    var ee;
    try {
        while (br.get_position() < len) {
            ee = EOE._create(br);
            MinorPlanets.mpcList.push(ee);
        }
    }
    catch ($e1) { }
    br.close();
};

MinorPlanets.drawMPC3D = function (renderContext, opacity, centerPoint) {
    var zoom = renderContext.viewCamera.zoom;
    var distAlpha = ((Math.log(Math.max(1, zoom)) / Math.log(4)) - 15.5) * 90;
    var alpha = Math.min(255, Math.max(0, ss.truncate(distAlpha)));
    if (alpha > 254) {
        return;
    }
    if (MinorPlanets._mpcVertexBuffer == null) {
        if (MinorPlanets.starTexture == null) {
            MinorPlanets.starTexture = Texture.fromUrl(URLHelpers.singleton.engineAssetUrl('StarProfileAlpha.png'));
        }
        for (var i = 0; i < 7; i++) {
            MinorPlanets._mpcBlendStates[i] = BlendState.create(false, 1000);
        }
        if (!MinorPlanets._initBegun) {
            MinorPlanets._startInit();
            MinorPlanets._initBegun = true;
        }
        return;
    }
    var offset = Matrix3d.translation(Vector3d.negate(centerPoint));
    var world = Matrix3d.multiplyMatrix(renderContext.get_world(), offset);
    var matrixWV = Matrix3d.multiplyMatrix(world, renderContext.get_view());
    var cam = Vector3d._transformCoordinate(renderContext.cameraPosition, Matrix3d.invertMatrix(renderContext.get_world()));
    if (MinorPlanets._mpcVertexBuffer != null) {
        for (var i = 0; i < 7; i++) {
            MinorPlanets._mpcBlendStates[i].set_targetState(true);
            if (MinorPlanets._mpcBlendStates[i].get_state()) {
                KeplerPointSpriteShader.use(renderContext, matrixWV, MinorPlanets._mpcVertexBuffer[i].vertexBuffer, MinorPlanets.starTexture.texture2d, Colors.get_white(), opacity * MinorPlanets._mpcBlendStates[i].get_opacity(), false, (SpaceTimeController.get_jNow() - KeplerVertex.baseDate), 0, renderContext.cameraPosition, 200, 0.1);
                renderContext.gl.drawArrays(WEBGL.POINTS, 0, MinorPlanets._mpcVertexBuffer[i].count);
            }
        }
    }
};

MinorPlanets._startInit = function () {
    if (!freestandingMode) {
        MinorPlanets.getMpcFile(URLHelpers.singleton.coreStaticUrl('wwtweb/catalog.aspx?Q=mpcbin'));
    }
};

MinorPlanets.initMPCVertexBuffer = function () {
    try {
        if (MinorPlanets._mpcVertexBuffer == null) {
            var mpcVertexBufferTemp = new Array(7);
            MinorPlanets._mpcCount = MinorPlanets.mpcList.length;
            var lists = new Array(7);
            for (var i = 0; i < 7; i++) {
                lists[i] = [];
            }
            var $enum1 = ss.enumerate(MinorPlanets.mpcList);
            while ($enum1.moveNext()) {
                var ee = $enum1.current;
                var listID = 0;
                if (ee.a < 2.5) {
                    listID = 0;
                }
                else if (ee.a < 2.83) {
                    listID = 1;
                }
                else if (ee.a < 2.96) {
                    listID = 2;
                }
                else if (ee.a < 3.3) {
                    listID = 3;
                }
                else if (ee.a < 5) {
                    listID = 4;
                }
                else if (ee.a < 10) {
                    listID = 5;
                }
                else {
                    listID = 6;
                }
                var vert = new KeplerVertex();
                vert.fill(ee);
                lists[listID].push(vert);
            }
            for (var i = 0; i < 7; i++) {
                mpcVertexBufferTemp[i] = KeplerVertexBuffer.create(lists[i]);
                mpcVertexBufferTemp[i].unlock();
            }
            MinorPlanets._mpcVertexBuffer = mpcVertexBufferTemp;
        }
    }
    finally { }
};

var MinorPlanets$ = {};

registerType("MinorPlanets", [MinorPlanets, MinorPlanets$, null]);
