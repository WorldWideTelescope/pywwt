// This file is a mini-library that translates JSON messages into actions
// on the WWT side. The reason for having this in its own file is that
// we can then use it for both the Jupyter widget and other front-ends such
// as the Qt one.

function wwt_apply_json_message(wwt, msg) {

  if (!wwt.hasOwnProperty('annotations')) {
    wwt.annotations = {};
  }

  switch(msg['event']) {

    case 'load_image_collection':
      wwt.loadImageCollection(msg['url']);
      break;

    case 'set_foreground_by_name':
      wwt.setForegroundImageByName(msg['name']);
      break;

    case 'set_background_by_name':
      wwt.setBackgroundImageByName(msg['name']);
      break;

    case 'set_foreground_opacity':
      wwt.setForegroundOpacity(msg['value']);
      break;

    case 'center_on_coordinates':
      wwt.gotoRaDecZoom(msg['ra'], msg['dec'], msg['fov'], msg['instant']);
      break;

    case 'setting_set':
      var name = msg['setting'];
      wwt.settings["set_" + name](msg['value']);
      break;

    case 'annotation_create':

      switch(msg['shape']) {
        case 'circle':
          // TODO: check if ID already exists
          circle = wwt.createCircle();
          circle.set_id(msg['id']);
          wwt.addAnnotation(circle);
          wwt.annotations[msg['id']] = circle;

        case 'poly':
          // same TODO as above
          poly = wwt.createPolygon();
          poly.set_id(msg['id']);
          wwt.addAnnotation(poly);
          wwt.annotations[msg['id']] = poly;

        case 'polyLine':
          // same TODO as above
          polyLine = wwt.createPolyLine();
          polyLine.set_id(msg['id']);
          wwt.addAnnotation(polyLine);
          wwt.annotations[msg['id']] = polyLine;
      }
      break;

    case 'annotation_set':

      var name = msg['setting'];
      // TODO: nice error message if annotation doesn't exist
      annotation = wwt.annotations[msg['id']];
      annotation["set_" + name](msg['value']);
      break;

    case 'circle_set_center':

      var name = msg["setting"];
      // TODO: nice error message if annotation doesn't exist
      circle = wwt.annotations[msg['id']];
      circle.setCenter(msg['ra'], msg['dec']);
      break;

    case 'poly_add_point':

      var name = msg["setting"];
      // same TODO as above
      poly = wwt.annotations[msg['id']];
      poly.addPoint(msg['ra'], msg['dec']);
      break;

    case 'polyLine_add_point':

      var name = msg["setting"];
      // same TODO as above
      polyLine = wwt.annotations[msg['id']];
      polyLine.addPoint(msg['ra'], msg['dec']);
      break;

  }

}

// We need to do this so that wwt_apply_json_message is available as a global
// function in the Jupyter widgets code.
window.wwt_apply_json_message = wwt_apply_json_message
