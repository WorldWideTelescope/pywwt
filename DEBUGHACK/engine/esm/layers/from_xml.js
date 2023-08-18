// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Set up the `Layer.fromXml()` function, which depends on a bunch of Layer
// subclasses.
//
// There are a variety of ways that we could set this up, possibly including
// just implementing this function in `layer.js`. This is a more conservating
// approach that tries to avoid circular module imports.

import { ss } from "../ss.js";
import { Layer } from "./layer.js";
import { GreatCirlceRouteLayer } from "./great_circle_route_layer.js";
import { GridLayer } from "./grid_layer.js";
import { ImageSetLayer } from "./imageset_layer.js";
import { Object3dLayer } from "./object3d.js";
import { OrbitLayer } from "./orbit_layer.js";
import { SpreadSheetLayer } from "./spreadsheet_layer.js";
import { VoTableLayer } from "./vo_table_layer.js";


// The `layerFromXml` function, which we also install as `Layer.fromXml()`. It
// needs to be aware of a bunch of layer subclasses.
export function layerFromXml(layerNode, someFlag) {
    var layerClassName = layerNode.attributes.getNamedItem('Type').nodeValue;

    var overLayType = ss.replaceString(layerClassName, 'TerraViewer.', '');
    if (overLayType == null) {
        return null;
    }

    var newLayer = null;
    switch (overLayType) {
        case 'SpreadSheetLayer':
            newLayer = new SpreadSheetLayer();
            break;
        case 'GreatCirlceRouteLayer':
            newLayer = new GreatCirlceRouteLayer();
            break;
        case 'GridLayer':
            newLayer = new GridLayer();
            break;
        case 'ImageSetLayer':
            newLayer = new ImageSetLayer();
            break;
        case 'Object3dLayer':
            newLayer = new Object3dLayer();
            break;
        case 'OrbitLayer':
            newLayer = new OrbitLayer();
            break;
        case 'VoTableLayer':
            newLayer = new VoTableLayer();
            break;
        default:
            return null;
    }

    newLayer.initFromXml(layerNode);
    return newLayer;
}

Layer.fromXml = layerFromXml;
