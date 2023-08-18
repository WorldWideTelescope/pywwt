// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Arbitrary orbits and how we render them.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Vector3d, Matrix3d } from "../double3d.js";
import { WEBGL } from "../graphics/webgl_constants.js";
import { EllipseShader } from "../graphics/shaders.js";
import { PositionVertexBuffer } from "../graphics/gl_buffers.js";
import { Color, Colors } from "../color.js";
import { Coordinates } from "../coordinates.js";
import { SpaceTimeController } from "../space_time_controller.js";


// wwtlib.Orbit

export function Orbit(elements, segments, color, thickness, scale) {
    this._elements = null;
    this._orbitColor = Colors.get_white();
    this._scale = 0;
    this._segmentCount = 0;
    this._elements = elements;
    this._segmentCount = segments;
    this._orbitColor = color;
    this._scale = scale;
}

// Convert from standard coordinate system with z normal to the orbital plane
// to WWT's system where y is the normal. Note that this transformation is not
// a pure rotation: it incorporates a reflection, because the two systems have
// different handedness.
Orbit._orbitalToWwt = Matrix3d.create(1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
Orbit._initBegun = false;

var Orbit$ = {
    cleanUp: function () { },

    // Get the radius of a sphere (centered at a focus of the ellipse) that is
    // large enough to contain the orbit. The value returned has units of the orbit scale.
    get_boundingRadius: function () {
        if (this._elements != null) {
            return (this._elements.a * (1 + this._elements.e)) / this._scale;
        } else {
            return 0;
        }
    },

    draw3D: function (renderContext, opacity, centerPoint) {
        // Extra transformation required because the ellipse shader uses the xy-plane, but WWT uses the
        // xz-plane as the reference.
        var orbitalPlaneOrientation = Matrix3d.multiplyMatrix(Matrix3d._rotationZ(Coordinates.degreesToRadians(this._elements.w)), Matrix3d.multiplyMatrix(Matrix3d._rotationX(Coordinates.degreesToRadians(this._elements.i)), Matrix3d._rotationZ(Coordinates.degreesToRadians(this._elements.omega))));
        orbitalPlaneOrientation = Matrix3d.multiplyMatrix(orbitalPlaneOrientation, Orbit._orbitalToWwt);

        var worldMatrix = Matrix3d.multiplyMatrix(Matrix3d.multiplyMatrix(orbitalPlaneOrientation, Matrix3d.translation(centerPoint)), renderContext.get_world());
        var M = this._elements.n * (SpaceTimeController.get_jNow() - this._elements.t);
        var F = 1;
        if (M < 0) {
            F = -1;
        }
        M = Math.abs(M) / 360;
        M = (M - ss.truncate(M)) * 360 * F;
        var color = Color._fromArgbColor(ss.truncate((opacity * 255)), this._orbitColor);

        // Newton-Raphson iteration to solve Kepler's equation.
        // This is faster than calling CAAKepler.Calculate(), and 5 steps
        // is more than adequate for draw the orbit paths of small satellites
        // (which are ultimately rendered using single-precision floating point.)
        M = Coordinates.degreesToRadians(M);
        var E = M;
        for (var i = 0; i < 5; i++) {
            E += (M - E + this._elements.e * Math.sin(E)) / (1 - this._elements.e * Math.cos(E));
        }
        EllipseRenderer.drawEllipse(renderContext, this._elements.a / this._scale, this._elements.e, E, color, worldMatrix);
    }
};

registerType("Orbit", [Orbit, Orbit$, null]);


// wwtlib.EllipseRenderer

export function EllipseRenderer() { }

// Draw an ellipse with the specified semi-major axis and eccentricity. The orbit is drawn over a single period,
// fading from full brightness at the given eccentric anomaly.
//
// In order to match exactly the position at which a planet is drawn, the planet's position at the current time
// must be passed as a parameter. positionNow is in the current coordinate system of the render context, not the
// translated and rotated system of the orbital plane.
EllipseRenderer.drawEllipseWithPosition = function (renderContext, semiMajorAxis, eccentricity, eccentricAnomaly, color, worldMatrix, positionNow) {
    if (EllipseRenderer._ellipseShader == null) {
        EllipseRenderer._ellipseShader = new EllipseShader();
    }
    if (EllipseRenderer._ellipseVertexBuffer == null) {
        EllipseRenderer._ellipseVertexBuffer = EllipseRenderer.createEllipseVertexBuffer(500);
    }
    var savedWorld = renderContext.get_world();
    renderContext.set_world(worldMatrix);
    renderContext.gl.bindBuffer(WEBGL.ARRAY_BUFFER, EllipseRenderer._ellipseVertexBuffer.vertexBuffer);
    renderContext.gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
    EllipseShader.use(renderContext, semiMajorAxis, eccentricity, eccentricAnomaly, color, 1, savedWorld, positionNow);
    renderContext.gl.drawArrays(WEBGL.LINE_STRIP, 0, EllipseRenderer._ellipseVertexBuffer.count);
    renderContext.set_world(savedWorld);
};

// This version of DrawEllipse works without a 'head' point
EllipseRenderer.drawEllipse = function (renderContext, semiMajorAxis, eccentricity, eccentricAnomaly, color, worldMatrix) {
    if (EllipseRenderer._ellipseShader == null) {
        EllipseRenderer._ellipseShader = new EllipseShader();
    }
    if (EllipseRenderer._ellipseWithoutStartPointVertexBuffer == null) {
        EllipseRenderer._ellipseWithoutStartPointVertexBuffer = EllipseRenderer.createEllipseVertexBufferWithoutStartPoint(360);
    }
    var savedWorld = renderContext.get_world();
    renderContext.set_world(worldMatrix);
    renderContext.gl.bindBuffer(WEBGL.ARRAY_BUFFER, EllipseRenderer._ellipseWithoutStartPointVertexBuffer.vertexBuffer);
    renderContext.gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
    EllipseShader.use(renderContext, semiMajorAxis, eccentricity, eccentricAnomaly, color, 1, savedWorld, Vector3d.create(0, 0, 0));
    renderContext.gl.drawArrays(WEBGL.LINE_STRIP, 0, EllipseRenderer._ellipseWithoutStartPointVertexBuffer.count - 1);
    renderContext.set_world(savedWorld);
};

EllipseRenderer.createEllipseVertexBuffer = function (vertexCount) {
    var vb = new PositionVertexBuffer(vertexCount);
    var verts = vb.lock();
    var index = 0;

    // Pack extra samples into the front of the orbit to avoid obvious segmentation
    // when viewed from near the planet or moon.
    for (var i = 0; i < vertexCount / 2; ++i) {
        verts[index++] = Vector3d.create(2 * i / vertexCount * 0.05, 0, 0);
    }
    for (var i = 0; i < vertexCount / 2; ++i) {
        verts[index++] = Vector3d.create(2 * i / vertexCount * 0.95 + 0.05, 0, 0);
    }
    vb.unlock();
    return vb;
};

EllipseRenderer.createEllipseVertexBufferWithoutStartPoint = function (vertexCount) {
    var vb = new PositionVertexBuffer(vertexCount);
    var verts = vb.lock();

    // Setting a non-zero value will prevent the ellipse shader from using the 'head' point
    verts[0] = Vector3d.create(1E-06, 0, 0);
    for (var i = 1; i < vertexCount; ++i) {
        verts[i] = Vector3d.create(2 * i / vertexCount, 0, 0);
    }
    vb.unlock();
    return vb;
};

var EllipseRenderer$ = {};

registerType("EllipseRenderer", [EllipseRenderer, EllipseRenderer$, null]);
