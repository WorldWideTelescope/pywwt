// This file is a mini-library that translates JSON messages into actions
// on the WWT side. The reason for having this in its own file is that
// we can then use it for both the Jupyter widget and other front-ends such
// as the Qt one.

function wwt_apply_json_message(wwt, msg) {

  if (!wwt.hasOwnProperty('annotations')) {
    wwt.annotations = {};
  }

  switch(msg['event']) {

    case 'clear_annotations':
      return wwt.clearAnnotations();
      break;

    case 'get_dec':
      return wwt.getDec();
      break;

    case 'get_ra':
      return wwt.getRA();
      break;

    case 'load_tour':
      wwt.loadTour(msg['url']);
      break;

    case 'resume_tour':
      wwt.playTour();
      break;

    case 'pause_tour':
      wwt.stopTour();
      break;

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
          circle.set_skyRelative(true);
          circle.setCenter(wwt.getRA() * 15, wwt.getDec());
          wwt.addAnnotation(circle);
          wwt.annotations[msg['id']] = circle;
          break;

        case 'polygon':
          // same TODO as above
          polygon = wwt.createPolygon();
          polygon.set_id(msg['id']);
          wwt.addAnnotation(polygon);
          wwt.annotations[msg['id']] = polygon;
          break;

        case 'line':
          // same TODO as above
          line = wwt.createPolyLine();
          line.set_id(msg['id']);
          wwt.addAnnotation(line);
          wwt.annotations[msg['id']] = line;
          break;
      }
      break;

    case 'annotation_set':

      var name = msg['setting'];
      // TODO: nice error message if annotation doesn't exist
      annotation = wwt.annotations[msg['id']];
      annotation["set_" + name](msg['value']);
      break;

    case 'remove_annotation':

      var name = msg["setting"];
      // TODO: nice error message if annotation doesn't exist
      shape = wwt.annotations[msg['id']];
      wwt.removeAnnotation(shape);
      break;

    case 'circle_set_center':

      var name = msg["setting"];
      // TODO: nice error message if annotation doesn't exist
      circle = wwt.annotations[msg['id']];
      circle.setCenter(msg['ra'], msg['dec']);
      break;

    case 'polygon_add_point':

      var name = msg["setting"];
      // same TODO as above
      polygon = wwt.annotations[msg['id']];
      polygon.addPoint(msg['ra'], msg['dec']);
      break;

    case 'line_add_point':

      var name = msg["setting"];
      // same TODO as above
      line = wwt.annotations[msg['id']];
      line.addPoint(msg['ra'], msg['dec']);
      break;

    case 'set_datetime':

      var date = new Date(msg['year'], msg['month'], msg['day'],
                          msg['hour'], msg['minute'], msg['second'],
                          msg['millisecond']);

      stc = wwtlib.SpaceTimeController;
      stc.set_now(date);
      break;

    case 'set_viewer_mode':
      wwt.setBackgroundImageByName(msg['mode']);
      break;

  }

}

// We need to do this so that wwt_apply_json_message is available as a global
// function in the Jupyter widgets code.
window.wwt_apply_json_message = wwt_apply_json_message;
