var wwtInitialState;

var wwt;

function initialize() {
    // The true enables WebGL
    wwt = wwtlib.WWTControl.initControlParam("wwt-canvas", true);
    wwt.add_ready(loadWwtFigure);
    wwt.add_ready(keyScroll);
}

$.getJSON('wwt_figure.json')
    .done(function (data) { wwtInitialState = data; })
    .error(function (err) {
        wwtInitialState = null;
        handleConfigLoadError();
    });

function keyScroll() {

    i = 0;
    var canvas = document.body.getElementsByTagName("canvas")[0];

    function newEvent(action, attributes, deprecated) {
        if (!deprecated)
            var event = new CustomEvent(action);
        else {
            var event = document.createEvent("CustomEvent");
            event.initEvent(action, false, false);
        }
        if (attributes)
            for (var attr in attributes)
                event[attr] = attributes[attr];

        return event;
    }


    var wheelUp = newEvent("wwt-zoom", { deltaY: 53, delta: 53 }, true);
    var wheelDn = newEvent("wwt-zoom", { deltaY: -53, delta: -53 }, true);

    var mouseLf = newEvent("wwt-move", { movementX: 53, movementY: 0 }, true);
    var mouseUp = newEvent("wwt-move", { movementX: 0, movementY: 53 }, true);
    var mouseRg = newEvent("wwt-move", { movementX: -53, movementY: 0 }, true);
    var mouseDn = newEvent("wwt-move", { movementX: 0, movementY: -53 }, true);

    zoomCodes = {
        "KeyZ": wheelUp, "KeyX": wheelDn,
        90: wheelUp, 88: wheelDn
    };
    moveCodes = {
        "KeyJ": mouseLf, "KeyI": mouseUp,
        "KeyL": mouseRg, "KeyK": mouseDn,
        74: mouseLf, 73: mouseUp, 76: mouseRg, 75: mouseDn
    };

    window.addEventListener("keydown", function (event) {
        if (zoomCodes.hasOwnProperty(event.code) ||
            zoomCodes.hasOwnProperty(event.keyCode)) {
            var action = zoomCodes.hasOwnProperty(event.code) ?
                         zoomCodes[event.code] : zoomCodes[event.keyCode];
            if (event.shiftKey) { action.shiftKey = 1; }
            else { action.shiftKey = 0; }
            canvas.dispatchEvent(action);
        }

        if (moveCodes.hasOwnProperty(event.code) ||
            moveCodes.hasOwnProperty(event.keyCode)) {
            var action = moveCodes.hasOwnProperty(event.code) ?
                         moveCodes[event.code] : moveCodes[event.keyCode];
            if (event.shiftKey) { action.shiftKey = 1; }
            else { action.shiftKey = 0; }
            if (event.altKey) { action.altKey = 1; }
            else { action.altKey = 0; }
            canvas.dispatchEvent(action);
        }
    });

    canvas.addEventListener("wwt-move", (function (proceed) {
        return function (event) {
            if (!proceed) { return false; }
            proceed = false;

            if (event.shiftKey) { delay = 500; }
            else { delay = 100; }
            setTimeout(function () { proceed = true }, delay);
            if (event.altKey)
                wwtlib.WWTControl.singleton._tilt(event.movementX, event.movementY);
            else
                wwtlib.WWTControl.singleton.move(event.movementX, event.movementY);
        }
    })(true));

    canvas.addEventListener("wwt-zoom", (function (proceed) {
        return function (event) {
            if (!proceed) { return false; }
            proceed = false;

            if (event.shiftKey) { delay = 500; } // milliseconds
            else { delay = 100; }
            setTimeout(function () { proceed = true }, delay);

            if (event.deltaY < 0) { wwtlib.WWTControl.singleton.zoom(1.43); }
            else { wwtlib.WWTControl.singleton.zoom(0.7); }
        }
    })(true));
}

function loadWwtFigure() {
    if (wwtInitialState === undefined) { //JSON config file has not loaded yet, try again in 50 ms
        setTimeout(loadWwtFigure, 50);
        return;
    }
    else if (wwtInitialState === null) { //There was an error loading the config
        return;
    }
    //TODO allow loading more collections
    wwt.loadImageCollection('https://worldwidetelescope.github.io/pywwt/surveys.xml')

    var viewSettings = wwtInitialState['view_settings'];
    wwt_apply_json_message(wwt, {
        event: 'set_viewer_mode',
        mode: viewSettings['mode']
    });

    if (viewSettings['mode'] == 'sky') {
        var foregroundState = wwtInitialState['foreground_settings'];
        wwt.setForegroundImageByName(foregroundState['foreground']);
        wwt.setBackgroundImageByName(foregroundState['background']);
        wwt.setForegroundOpacity(foregroundState['foreground_alpha']);
    }

    var miscSettings = wwtInitialState['wwt_settings'];
    for (name in miscSettings) {
        wwt_apply_json_message(wwt, {
            event: 'setting_set',
            setting: name,
            value: miscSettings[name]
        });
    }

    wwtInitialState['layers'].forEach(function (layerInfo) {
        if (layerInfo['layer_type'] == 'image') {
            loadImageLayer(layerInfo);
        }
        else if (layerInfo['layer_type'] == 'table') {
            loadTableLayer(layerInfo);
        }
    });

    wwtInitialState['annotations'].forEach(loadAnnotation);

    if (!viewSettings['tracked_object_id']) { //Not tracking or trivially track sun (id=0)
        wwt.gotoRaDecZoom(viewSettings['ra'], viewSettings['dec'], viewSettings['fov'], true);
    }
    else {
        var targetCamera = wwtlib.CameraParameters.create(0, 0, viewSettings['fov'] * 6, 0, 0, wwtlib.WWTControl.singleton.renderContext.viewCamera.opacity); //Multiply fov by 6 to get zoom factor
        targetCamera.target = viewSettings['tracked_object_id'];
        targetCamera.set_RA(viewSettings['ra'] / 15.); //convert from degrees to hrs
        targetCamera.set_dec(viewSettings['dec']);
        wwtlib.WWTControl.singleton.gotoTarget3(targetCamera, false, true);
    }
}


function loadImageLayer(layerInfo) {
    var id = layerInfo['id'];
    var url = 'data/' + id + '.fits';
    var onFitsLoad = function (layer) {
        var stretchInfo = layerInfo['stretch_info'];
        wwtLayer.setImageScale(stretchInfo['stretch'],
                               stretchInfo['vmin'],
                               stretchInfo['vmax']);
        wwtLayer.set_colorMapperName(stretchInfo['cmap']);
        layer.getFitsImage().transparentBlack = false;
        var settings = layerInfo['settings'];
        for (name in settings) {
            wwt_apply_json_message(wwt, {
                event: 'image_layer_set',
                setting: name,
                value: settings[name],
                id: id
            });
        }
    };

    var wwtLayer = wwt.loadFitsLayer(url, '', false, onFitsLoad);
    wwt.layers[id] = wwtLayer;
}

function loadTableLayer(layerInfo) {
    var id = layerInfo['id'];
    var url = 'data/' + id + '.csv';
    var onCsvLoad = function (data) {
        wwt_apply_json_message(wwt, {
            event: 'table_layer_create',
            frame: layerInfo['frame'],
            id: id,
            table: btoa(data)
        });
        var settings = layerInfo['settings'];
        for (name in  settings) {
            if (settings[name] !== null) {
                wwt_apply_json_message(wwt, {
                    event: 'table_layer_set',
                    setting: name,
                    value: settings[name],
                    id: id
                });
            }
        }
    };

    $.ajax(url, datatype = "text")
        .fail(function () {
            $("#wwt-error-text").append("<p>Unable to load data for layer with ID: " + id + "</p>"); //TODO replace with something nicer
        })
        .done(onCsvLoad);
}

function loadAnnotation(annotation) {
    var shape = annotation['shape'];
    var id = annotation['id'];
    wwt_apply_json_message(wwt, {
        event: 'annotation_create',
        shape: shape,
        id: id
    });

    if (shape == "circle") {
        wwt_apply_json_message(wwt, {
            event: 'circle_set_center',
            id: id,
            ra: annotation['center']['ra'],
            dec: annotation['center']['dec']
        });
    }
    else {
        annotation['points'].forEach(function (point) {
            wwt_apply_json_message(wwt, {
                event: shape + '_add_point',
                id: id,
                ra: point['ra'],
                dec: point['dec']
            });

        });
    }
    var settings = annotation['settings'];
    for (name in  settings) {
        wwt_apply_json_message(wwt, {
            event: 'annotation_set',
            id: id,
            setting: name,
            value: settings[name]
        });

    }
}

function setHtmlSettings() {
    if (wwtInitialState === undefined) { //JSON config file has not loaded yet, try again in 50 ms
        setTimeout(setHtmlSettings, 50);
        return;
    }
    else if (wwtInitialState === null) {
        return;
    }
    var figHtmlSettings = wwtInitialState['html_settings'];

    var title = figHtmlSettings['title'] ? figHtmlSettings['title'] : "WWT Interactive Figure";
    $(document).attr("title", title);

    var settingsHeight = figHtmlSettings['max_height'];
    var settingsWidth = figHtmlSettings['max_width'];
    var htmlHeight = $("html").height();
    var htmlWidth = $("html").width();
    var newHeight = settingsHeight ? Math.min(settingsHeight, htmlHeight) : htmlHeight;
    var newWidth = settingsWidth ? Math.min(settingsWidth, htmlWidth) : htmlWidth;
    $("#wwt-canvas").css("height", newHeight + "px");
    $("#wwt-canvas").css("width", newWidth + "px");
}

function handleConfigLoadError() {
    //TODO replace with something a bit nicer before releasing this feature
    $("#wwt-canvas").hide;
    $("#wwt-error-text").append("<p>Unable to load configuration file wwt_figure.json</p>");
}
