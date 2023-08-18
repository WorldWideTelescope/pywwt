// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Specifications of a requested video output format.

import { registerType } from "./typesystem.js";


// wwtlib.VideoOutputType

export function VideoOutputType(width, height, fps, format, waitDownload) {
    this.fps = 0;
    this.width = 0;
    this.height = 0;
    this.totalFrames = 0;
    this.waitDownload = false;
    this.format = 'image/jpeg';
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.format = format;
    this.waitDownload = waitDownload;
}

var VideoOutputType$ = {};

registerType("VideoOutputType", [VideoOutputType, VideoOutputType$, null]);
