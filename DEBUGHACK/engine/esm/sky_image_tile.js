// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A "tile" that is really a single image displayed using a tangential
// projection.

import { ss } from "./ss.js";
import { registerType } from "./typesystem.js";
import { useGl, useGlVersion2 } from "./render_globals.js";
import { WcsImage } from "./layers/wcs_image.js";
import { TangentTile, LatLngEdges } from "./tangent_tile.js";


// wwtlib.SkyImageTile

export function SkyImageTile(level, x, y, dataset, parent) {
    this.pixelCenterX = 0;
    this.pixelCenterY = 0;
    this.scaleX = 0.01;
    this.scaleY = 0.01;
    this.height = 0;
    this.width = 0;
    TangentTile.call(this, level, x, y, dataset, parent);
    this.pixelCenterX = dataset.get_offsetX();
    this.pixelCenterY = dataset.get_offsetY();
    this.scaleX = -(this.scaleY = dataset.get_baseTileDegrees());
    if (dataset.get_bottomsUp()) {
        this.scaleX = -this.scaleX;
    }
    this.sphereCenter = this.geoTo3dTan(0, 0);
    this.radius = 1.25;
    this.computeBoundingSphere();
}

var SkyImageTile$ = {
    getLatLngEdges: function () {
        var edges = new LatLngEdges();
        var wcsImage = ss.safeCast(this.dataset.get_wcsImage(), WcsImage);
        if (wcsImage != null && useGl) {
            if (useGlVersion2) {
                this.width = wcsImage.get_sizeX();
                this.height = wcsImage.get_sizeY();
            }
            else {
                this.height = this.bmp.height;
                this.width = this.bmp.width;
                if (this.bmp.height !== wcsImage.get_sizeY()) {
                    this.pixelCenterY += this.bmp.height - wcsImage.get_sizeY();
                }
            }
        } else if (this.texture != null) {
            this.height = this.texture.naturalHeight;
            this.width = this.texture.naturalWidth;
        } else {
            this.height = 256;
            this.width = 256;
        }
        edges.latMin = 0 + (this.scaleY * (this.height - this.pixelCenterY));
        edges.latMax = 0 - (this.scaleY * this.pixelCenterY);
        edges.lngMin = 0 + (this.scaleX * this.pixelCenterX);
        edges.lngMax = 0 - (this.scaleX * (this.width - this.pixelCenterX));
        return edges;
    }
};

registerType("SkyImageTile", [SkyImageTile, SkyImageTile$, TangentTile]);
