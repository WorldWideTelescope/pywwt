var wwtIntialState;

var wwt;
var wwt_ready = 0;

function initialize() {
    // The true enables WebGL
    wwt = wwtlib.WWTControl.initControlParam("WWTCanvas", true);
    wwt.add_ready(loadWwtFigure);
    wwt.add_ready(keyScroll);
}

$.getJSON('wwt_figure.json')
    .done(function (data) { wwtIntialState = data; })
    .error(function (err) {
        wwtIntialState = null;
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
    if (wwtIntialState === undefined) { //JSON config file has not loaded yet, try again in 50 ms
        setTimeout(loadWwtFigure, 50);
        return;
    }
    else if (wwtIntialState === null) { //There was an error loading the config
        return;
    }
    //TODO allow loading more collections
    wwt.loadImageCollection('https://WorldWideTelescope.github.io/pywwt/surveys.xml')

    var viewSettings = wwtIntialState['view_settings'];
    wwt_apply_json_message(wwt, {
        event: 'set_viewer_mode',
        mode: viewSettings['mode']
    });

    if (viewSettings['mode'] == 'sky') {
        var foregroundState = wwtIntialState['foreground_settings'];
        wwt.setForegroundImageByName(foregroundState['foreground']);
        wwt.setBackgroundImageByName(foregroundState['background']);
        wwt.setForegroundOpacity(foregroundState['foreground_alpha']);
    }

    var miscSettings = wwtIntialState['wwt_settings'];
    wwtIntialState['wwt_settings'].forEach(function (setting) {
        wwt_apply_json_message(wwt, {
            event: 'setting_set',
            setting: setting['name'],
            value: setting['value']
        });
    });

    wwtIntialState['layers'].forEach(function (layerInfo) {
        if (layerInfo['layer_type'] == 'image') {
            loadImageLayer(layerInfo);
        }
        else if (layerInfo['layer_type'] == 'table') {
            loadTableLayer(layerInfo);
        }
    });

    if (!viewSettings['tracked_object_id']) { //Not tracking or trivially track sun (id=0)
        wwt.gotoRaDecZoom(viewSettings['ra'], viewSettings['dec'], viewSettings['fov'], true);
    }
    else {
        var targetCamera = wwtlib.CameraParameters.create(0, 0, viewSettings['fov'] * 6, 0, 0, wwtlib.WWTControl.singleton.renderContext.viewCamera.opacity);
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
        var stertchInfo = layerInfo['stretch_info'];
        wwtLayer.setImageScale(stertchInfo['stretch'],
                               stertchInfo['vmin'],
                               stertchInfo['vmax']);
        layer.getFitsImage().transparentBlack = false;

        layerInfo['settings'].forEach(function (setting) {
            wwt_apply_json_message(wwt, {
                event: 'image_layer_set',
                setting: setting['name'],
                value: setting['value'],
                id: id
            });
        });
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

        layerInfo['settings'].forEach(function (setting) {
            if (setting['value'] !== null) {
                wwt_apply_json_message(wwt, {
                    event: 'table_layer_set',
                    setting: setting['name'],
                    value: setting['value'],
                    id: id
                });
            }
        });
    };

    $.ajax(url, datatype = "text")
        .fail(function () {
            $("#WWTErrorText").append("<p>Unable to load data for layer with ID: " + id + "</p>"); //TODO replace with something nicer
        })
        .done(onCsvLoad);
}

function setHmtlSettings() {
    if (wwtIntialState === undefined) { //JSON config file has not loaded yet, try again in 50 ms
        setTimeout(setHmtlSettings, 50);
        return;
    }
    else if (wwtIntialState === null) {
        return;
    }
    var figHtmlSettings = wwtIntialState['html_settings'];

    var title = figHtmlSettings['title'] ? figHtmlSettings['title'] : "WWT Interactive Figure";
    $(document).attr("title", title);

    var settingsHeight = figHtmlSettings['max_height'];
    var settingsWidth = figHtmlSettings['max_width'];
    var htmlHeight = $("html").height();
    var htmlWidth = $("html").width();
    var newHeight = settingsHeight ? Math.min(settingsHeight, htmlHeight) : htmlHeight;
    var newWidth = settingsWidth ? Math.min(settingsWidth, htmlWidth) : htmlWidth;
    $("#WWTCanvas").css("height", newHeight + "px");
    $("#WWTCanvas").css("width", newWidth + "px");
}

function handleConfigLoadError() {
    //TODO replace with something a bit nicer before releasing this feature
    $("#WWTCanvas").hide;
    $("#WWTErrorText").append("<p>Unable to load configuration file wwt_figure.json</p>");
}