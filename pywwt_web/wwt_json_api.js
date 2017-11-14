// This file is a mini-library that translates JSON messages into actions
// on the WWT side. The reason for having this in it's own file is that
// we can then use it for both the Jupyter widget and other front-ends such
// as the Qt one.

function wwt_apply_json_message(wwt, msg) {

  switch(msg['event']) {

    case 'center_on_coordinates':
      wwt.gotoRaDecZoom(msg['ra'], msg['dec'], msg['fov'], msg['instant']);
      break;

    case 'setting_set':
      var name = msg['setting'];
      wwt.settings["set_" + name](msg['value']);

  }

}

window.wwt_apply_json_message = wwt_apply_json_message
