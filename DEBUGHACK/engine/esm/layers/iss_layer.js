// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that adds the International Space Station (ISS) with an up-to-date orbit.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Guid } from "../util.js";
import { Matrix3d, Vector3d } from "../double3d.js";
import { freestandingMode, tourDocumentFromUrlRaw } from "../data_globals.js";
import { Colors } from "../color.js";
import { URLHelpers } from "../url_helpers.js";
import { Object3dLayer, Object3d } from "./object3d.js";


// wwtlib.ISSLayer

export function ISSLayer() {
    Object3dLayer.call(this);
    this.id = ISSLayer.issGuid;
}

ISSLayer.issGuid = Guid.fromString('00000001-0002-0003-0405-060708090a0b');
ISSLayer._loading$2 = false;
ISSLayer._issmodel$2 = null;
ISSLayer._doc$2 = null;

ISSLayer.loadBackground = function () {
    // The ISS frame cannot be created in freestanding mode, so I'm not
    // sure if this function will even get called, but just in case, we
    // make sure to noop if we're in freestanding mode.
    if (ISSLayer._loading$2 || freestandingMode) {
        return;
    }
    ISSLayer._loading$2 = true;
    var url = URLHelpers.singleton.coreStaticUrl('data/iss.wtt');
    ISSLayer._doc$2 = tourDocumentFromUrlRaw(url, function () {
        ISSLayer.createSpaceStation();
    });
};

ISSLayer.createSpaceStation = function () {
    ISSLayer._doc$2.set_id('28016047-97a9-4b33-a226-cd820262a151');
    var filename = '0c10ae54-b6da-4282-bfda-f34562d403bc.3ds';
    var o3d = new Object3d(ISSLayer._doc$2, filename, true, false, true, Colors.get_white());
    if (o3d != null) {
        o3d.issLayer = true;
        ISSLayer._issmodel$2 = o3d;
    }
};

var ISSLayer$ = {
    draw: function (renderContext, opacity, flat) {
        if (this.object3d == null && ISSLayer._issmodel$2 == null) {
            if (!ISSLayer._loading$2) {
                var worldView = Matrix3d.multiplyMatrix(renderContext.get_world(), renderContext.get_view());
                var v = worldView.transform(Vector3d.get_empty());
                var scaleFactor = Math.sqrt(worldView.get_m11() * worldView.get_m11() + worldView.get_m22() * worldView.get_m22() + worldView.get_m33() * worldView.get_m33());
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
                if (radiusInPixels > 0.5) {
                    ISSLayer.loadBackground();
                }
            }
        }
        this.object3d = ISSLayer._issmodel$2;
        return Object3dLayer.prototype.draw.call(this, renderContext, opacity, flat);
    },

    getPrimaryUI: function () {
        return null;
    },

    addFilesToCabinet: function (fc) {
        return;
    },

    loadData: function (doc, filename) {
        return;
    },

    cleanUp: function () { }
};

registerType("ISSLayer", [ISSLayer, ISSLayer$, Object3dLayer]);
