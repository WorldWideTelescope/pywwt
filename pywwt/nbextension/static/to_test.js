// PYTHON: wwt.background = wwt.imagery.visible.tycho
// PYTHON: wwt.foreground_opacity = 0
wwt.setBackgroundImageByName("Tycho (Synthetic, Optical)");
wwt.setForegroundOpacity(80);
wwt.setForegroundOpacity(0);


// PYTHON: wwt.set_view('solar system')
// We need to set both the background and foreground layers
// otherwise when changing to planet view, there are weird
// artifacts due to the fact one of the layers is the sky.
wwt.setBackgroundImageByName("3D Solar System View");
wwt.setForegroundImageByName("3D Solar System View");
wwt.gotoRaDecZoom(0, 0, 50, false);


// PYTHON: wwt.solar_system.track_object('Earth')
var object = "Earth";
var ra = wwt.getRA();
var dec = wwt.getDec();
var classification = wwtlib.Classification.solarSystem;
var constellation = wwtlib.Place._constellation;
var imageType = wwtlib.ImageSetType.sky;
var scale = wwt.settings.get_solarSystemScale();
var zoom;

var place = wwtlib.Place.create(object, ra, dec, classification, constellation, imageType, zoom);
place.set_target(wwtlib.Planets.getPlanetIDFromName(object));
wwtlib.WWTControl.singleton.gotoTarget(place, false, true, true);


// PYTHON: wwt.layers.add_data_layer(table=japan, frame='Earth', lon_att='longitude', lat_att='latitude', size_scale=50, color='#ff0000', time_series=True, time_att='time', far_side_visible=True)

// NOTE: first, create the table
// Decode table from base64
csv = atob("dGltZSxsYXRpdHVkZSxsb25naXR1ZGUsZGVwdGgsbWFnLG1hZ1R5cGUsbnN0LGdhcCxkbWluLHJtcyxuZXQsaWQsdXBkYXRlZCxwbGFjZSx0eXBlLGhvcml6b250YWxFcnJvcixkZXB0aEVycm9yLG1hZ0Vycm9yLG1hZ05zdCxzdGF0dXMsbG9jYXRpb25Tb3VyY2UsbWFnU291cmNlDQoyMDEwLTAxLTAxIDAwOjAwOjA4Ljg5Miw0Mi4zMzgsMTQyLjk5MSw2MC4xLDUuMCxtd2MsMjA5LDYxLjQsLDAuNzcsdXMsdXNwMDAwaDY0NSwyMDE1LTAzLTI0VDAyOjA4OjM4LjMxN1osIkhva2thaWRvLCBKYXBhbiByZWdpb24iLGVhcnRocXVha2UsLCwsLHJldmlld2VkLHVzLGdjbXQNCjIwMTAtMDEtMDEgMDA6MDA6MDcuOTgxLDM2LjU3NSwxNDEuNDUzLDEwLjAsNC4wLG13ciwyMSwxMjcuNywsMC44Nyx1cyx1c3AwMDBoNjJnLDIwMTQtMTEtMDdUMDE6NDA6MjcuNDEyWiwibmVhciB0aGUgZWFzdCBjb2FzdCBvZiBIb25zaHUsIEphcGFuIixlYXJ0aHF1YWtlLCwsLCxyZXZpZXdlZCx1cyxuaWVkDQoyMDEwLTAxLTAxIDAwOjAwOjA3LjYzMSwzMy45NzIsMTM2Ljg2NywzNTIuMCw0LjIsbWIsNDEsMTIxLjIsLDAuODIsdXMsdXNwMDAwaDYwYywyMDE0LTExLTA3VDAxOjQwOjI2LjY2MlosIm5lYXIgdGhlIHNvdXRoIGNvYXN0IG9mIHdlc3Rlcm4gSG9uc2h1LCBKYXBhbiIsZWFydGhxdWFrZSwsNi4wLCwzNCxyZXZpZXdlZCx1cyx1cw0KMjAxMC0wMS0wMSAwMDowMDowNy4wOTEsNDMuMDE0LDE0NS4yNzIsMTAxLjQsMy44LG13ciwxNiwyMDIuNiwsMC40Nyx1cyx1c3AwMDBoNXpiLDIwMTQtMTEtMDdUMDE6NDA6MjYuNTMxWiwiSG9ra2FpZG8sIEphcGFuIHJlZ2lvbiIsZWFydGhxdWFrZSwsNi44LCwscmV2aWV3ZWQsdXMsbmllZA0KMjAxMC0wMS0wMSAwMDowMDowNi45MzIsMjIuMTExLDE0My4zNjIsMTc2LjgsNC41LG1iLDM1LDg1LjcsLDEuMDYsdXMsdXNwMDAwaDV5dywyMDE0LTExLTA3VDAxOjQwOjI2LjQ4MlosIlZvbGNhbm8gSXNsYW5kcywgSmFwYW4gcmVnaW9uIixlYXJ0aHF1YWtlLCwsLDcscmV2aWV3ZWQsdXMsdXMNCjIwMTAtMDEtMDEgMDA6MDA6MDQuNDQ1LDI5LjE2NywxNDIuMjM1LDIzLjQsNC4zLG13ciwyOSwxNTEuMywsMC43Nix1cyx1c3AwMDBoNXU1LDIwMTQtMTEtMDdUMDE6NDA6MjUuNzA0WiwiSXp1IElzbGFuZHMsIEphcGFuIHJlZ2lvbiIsZWFydGhxdWFrZSwsMTUuOCwsLHJldmlld2VkLHVzLG5pZWQNCjIwMTAtMDEtMDEgMDA6MDA6MDQuMjMxLDM2LjIzNSwxNDEuNzQ2LDM3LjYsNC4yLG13ciw0MiwxMTkuMSwsMS4xLHVzLHVzcDAwMGg1dHosMjAxNC0xMS0wN1QwMTo0MDoyNS42NzNaLCJuZWFyIHRoZSBlYXN0IGNvYXN0IG9mIEhvbnNodSwgSmFwYW4iLGVhcnRocXVha2UsLDEwLjIsLCxyZXZpZXdlZCx1cyxuaWVkDQoyMDEwLTAxLTAxIDAwOjAwOjAzLjkxNCwzNi4yOTQsMTQxLjc3NSwzNy41LDQuNCxtd3IsMzgsMTI3LjAsLDAuNzQsdXMsdXNwMDAwaDV0YywyMDE0LTExLTA3VDAxOjQwOjI1LjU5MFosIm5lYXIgdGhlIGVhc3QgY29hc3Qgb2YgSG9uc2h1LCBKYXBhbiIsZWFydGhxdWFrZSwsNi42LCwscmV2aWV3ZWQsdXMsbmllZA0KMjAxMC0wMS0wMSAwMDowMDowMy43ODEsNDIuMDE3LDE0Mi4yOTEsNzAuMiw0LjMsbXdyLDk3LDkwLjcsLDAuNzEsdXMsdXNwMDAwaDV0OCwyMDE0LTExLTA3VDAxOjQwOjI1LjU3M1osIkhva2thaWRvLCBKYXBhbiByZWdpb24iLGVhcnRocXVha2UsLCwsLHJldmlld2VkLHVzLG5pZWQNCjIwMTAtMDEtMDEgMDA6MDA6MDEuNjA1LDQ0LjAyMSwxNDguNDU1LDI3LjcsNC4zLG1iLDI0LDEzNy42LCwxLjE5LHVzLHVzcDAwMGg1bjEsMjAxNC0xMS0wN1QwMTo0MDoyMy45MTdaLEt1cmlsIElzbGFuZHMsZWFydGhxdWFrZSwsMjAuNywsNixyZXZpZXdlZCx1cyx1cw0KMjAxMC0wMS0wMSAwMDowMDowMC45NDQsMjIuMTI2LDE0Mi44MDYsMjUzLjcsNC43LG1iLDUzLDUwLjEsLDAuNzIsdXMsdXNwMDAwaDVtOCwyMDE0LTExLTA3VDAxOjQwOjIzLjYwMFosIlZvbGNhbm8gSXNsYW5kcywgSmFwYW4gcmVnaW9uIixlYXJ0aHF1YWtlLCw3LjksLDE3LHJldmlld2VkLHVzLHVzDQo=")

// Get reference frame
frame = "Earth";

layer = wwtlib.LayerManager.createSpreadsheetLayer(frame, 'PyWWT Layer', csv);
layer.set_referenceFrame(frame);

// Override any guesses
layer.set_lngColumn(-1);
layer.set_latColumn(-1);
layer.set_altColumn(-1);
layer.set_sizeColumn(-1);
layer.set_colorMapColumn(-1);
layer.set_startDateColumn(-1);
layer.set_endDateColumn(-1);

// FIXME: at the moment WWT incorrectly sets the mean radius of the object
// in the frame to that of the Earth, so we need to override this here.
var ReferenceFramesRadius = {
  Sun: 696000000,
  Mercury: 2439700,
  Venus: 6051800,
  Earth: 6371000,
  Mars: 3390000,
  Jupiter: 69911000,
  Saturn: 58232000,
  Uranus: 25362000,
  Neptune: 24622000,
  Pluto: 1161000,
  Moon: 1737100,
  Io: 1821500,
  Europa: 1561000,
  Ganymede: 2631200,
  Callisto: 2410300
};

radius = ReferenceFramesRadius[frame];
if (radius != undefined) {
  layer._meanRadius$1 = radius;
}

// FIXME: for now, this doesn't have any effect because WWT should add a 180
// degree offset but it doesn't - see
// https://github.com/WorldWideTelescope/wwt-web-client/pull/182 for a
// possible fix.
if (frame == 'Sky') {
  layer.set_astronomical(true);
}

layer.set_altUnit(1);


// NOTE: then, set the attributes in the arguments of the python call one-by-one, beginning with defaults:
var name = "altType";
var value = wwtlib.AltTypes[""];
layer["set_" + name](value);

var name = "scaleFactor";
var value = 10;
layer["set_" + name](value);

var name = "color";
var value = wwtlib.Color.fromHex("#ffffff");
layer["set_" + name](value);

var name = "opacity";
var value = 1;
layer["set_" + name](value);

var name = "plotType";
var value = wwtlib.PlotTypes["gaussian"];
layer["set_" + name](value);

var name = "markerScale";
var value = wwtlib.MarkerScales["screen"];
layer["set_" + name](value);

var name = "showFarSide";
var value = false;
layer["set_" + name](value);

var name = "timeSeries";
var value = false;
layer["set_" + name](value);

// NOTE: then set the attributes specified in my python function call
var name = "lngColumn";
var value = layer.get__table().header.indexOf("longitude");
layer["set_" + name](value);

var name = "latColumn";
var value = layer.get__table().header.indexOf("latitude");
layer["set_" + name](value);

var name = "scaleFactor";
var value = 50;
layer["set_" + name](value);

var name = "color";
value = wwtlib.Color.fromHex("#c4d600");
layer["set_" + name](value);

var name = "timeSeries";
var value = true;
layer["set_" + name](value);

var name = "startDateColumn";
var value = layer.get__table().header.indexOf("time");
layer["set_" + name](value);

var name = "showFarSide";
var value = true;
layer["set_" + name](value);


// PYTHON: wwt.set_current_time(Time('2010-01-01'))
var date = new Date(2010, 0, 1, 0, 0, 0, 0);
stc = wwtlib.SpaceTimeController;
stc.set_timeRate(1);
stc.set_now(date);
