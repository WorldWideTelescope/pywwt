// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A layer that renders a coordinate grid on a planet.

import { registerType } from "../typesystem.js";
import { Grids } from "../grids.js";
import { Layer } from "./layer.js";


// wwtlib.GridLayer

export function GridLayer() {
    Layer.call(this);
}

var GridLayer$ = {
    draw: function (renderContext, opacity, flat) {
        Grids.drawPlanetGrid(renderContext, opacity * this.get_opacity(), this.get_color());
        Grids.drawPlanetGridText(renderContext, opacity * this.get_opacity(), this.get_color());
        return true;
    }
};

registerType("GridLayer", [GridLayer, GridLayer$, Layer]);
