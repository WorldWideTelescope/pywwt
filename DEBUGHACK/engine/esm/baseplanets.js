// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Planet-related code that can come lower in the dependency graph.

import { registerType } from "./typesystem.js";
import { Vector3d } from "./double3d.js";
import { Dates, PointList } from "./graphics/primitives3d.js";


// BasePlanets

export function BasePlanets() { }

BasePlanets.drawPointPlanet = function (renderContext, location, size, color, zOrder) {
    var center = location;
    var rad = size / 2;
    if (renderContext.gl != null) {
        var ppList = new PointList(renderContext);
        ppList.minSize = 20;
        ppList.addPoint(location.copy(), color._clone(), new Dates(0, 1), size / 100);
        ppList.depthBuffered = true;
        ppList.draw(renderContext, 1, false);
    }
    else {
        var screenSpacePnt = renderContext.WVP.transform(center);
        if (screenSpacePnt.z < 0) {
            return;
        }
        if (!zOrder) {
            if (Vector3d.dot(renderContext.get_viewPoint(), center) < 0.55) {
                return;
            }
        }
        var ctx = renderContext.device;
        ctx.save();
        ctx.beginPath();
        ctx.arc(screenSpacePnt.x, screenSpacePnt.y, rad, 0, Math.PI * 2, true);
        ctx.lineWidth = 1;
        ctx.fillStyle = color.toString();
        if (true) {
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color.toString();
        ctx.stroke();
        ctx.restore();
    }
};

registerType("BasePlanets", [BasePlanets, {}, null]);
