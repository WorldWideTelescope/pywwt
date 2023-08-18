// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A spherical triangle that can be subdivided.

import { registerType } from "./typesystem.js";
import { Vector2d, Vector3d, PositionTexture } from "./double3d.js";


// wwtlib.Triangle

export function Triangle() {
    // Vertex Indices
    this.a = -1;
    this.b = -1;
    this.c = -1;
}

Triangle.create = function (a, b, c) {
    var temp = new Triangle();
    temp.a = a;
    temp.b = b;
    temp.c = c;
    return temp;
};

var Triangle$ = {
    subDivide: function (triList, vertexList) {
        var a1 = Vector3d.lerp(vertexList[this.b].position, vertexList[this.c].position, 0.5);
        var b1 = Vector3d.lerp(vertexList[this.c].position, vertexList[this.a].position, 0.5);
        var c1 = Vector3d.lerp(vertexList[this.a].position, vertexList[this.b].position, 0.5);
        var a1uv = Vector2d.lerp(Vector2d.create(vertexList[this.b].tu, vertexList[this.b].tv), Vector2d.create(vertexList[this.c].tu, vertexList[this.c].tv), 0.5);
        var b1uv = Vector2d.lerp(Vector2d.create(vertexList[this.c].tu, vertexList[this.c].tv), Vector2d.create(vertexList[this.a].tu, vertexList[this.a].tv), 0.5);
        var c1uv = Vector2d.lerp(Vector2d.create(vertexList[this.a].tu, vertexList[this.a].tv), Vector2d.create(vertexList[this.b].tu, vertexList[this.b].tv), 0.5);
        a1.normalize();
        b1.normalize();
        c1.normalize();
        var aIndex = vertexList.length;
        var bIndex = vertexList.length + 1;
        var cIndex = vertexList.length + 2;
        vertexList.push(PositionTexture.createPosRaw(a1, a1uv.x, a1uv.y));
        vertexList.push(PositionTexture.createPosRaw(b1, b1uv.x, b1uv.y));
        vertexList.push(PositionTexture.createPosRaw(c1, c1uv.x, c1uv.y));
        triList.push(Triangle.create(this.a, cIndex, bIndex));
        triList.push(Triangle.create(this.b, aIndex, cIndex));
        triList.push(Triangle.create(this.c, bIndex, aIndex));
        triList.push(Triangle.create(aIndex, bIndex, cIndex));
    },

    subDivideNoNormalize: function (triList, vertexList) {
        var a1 = Vector3d.lerp(vertexList[this.b].position, vertexList[this.c].position, 0.5);
        var b1 = Vector3d.lerp(vertexList[this.c].position, vertexList[this.a].position, 0.5);
        var c1 = Vector3d.lerp(vertexList[this.a].position, vertexList[this.b].position, 0.5);
        var a1uv = Vector2d.lerp(Vector2d.create(vertexList[this.b].tu, vertexList[this.b].tv), Vector2d.create(vertexList[this.c].tu, vertexList[this.c].tv), 0.5);
        var b1uv = Vector2d.lerp(Vector2d.create(vertexList[this.c].tu, vertexList[this.c].tv), Vector2d.create(vertexList[this.a].tu, vertexList[this.a].tv), 0.5);
        var c1uv = Vector2d.lerp(Vector2d.create(vertexList[this.a].tu, vertexList[this.a].tv), Vector2d.create(vertexList[this.b].tu, vertexList[this.b].tv), 0.5);
        var aIndex = vertexList.length;
        var bIndex = vertexList.length + 1;
        var cIndex = vertexList.length + 2;
        vertexList.push(PositionTexture.createPosRaw(a1, a1uv.x, a1uv.y));
        vertexList.push(PositionTexture.createPosRaw(b1, b1uv.x, b1uv.y));
        vertexList.push(PositionTexture.createPosRaw(c1, c1uv.x, c1uv.y));
        triList.push(Triangle.create(this.a, cIndex, bIndex));
        triList.push(Triangle.create(this.b, aIndex, cIndex));
        triList.push(Triangle.create(this.c, bIndex, aIndex));
        triList.push(Triangle.create(aIndex, bIndex, cIndex));
    }
};

registerType("Triangle", [Triangle, Triangle$, null]);
