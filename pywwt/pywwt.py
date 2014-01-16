import requests
from requests import ConnectionError
from bs4 import BeautifulSoup
import logging
requests_log = logging.getLogger("requests")
requests_log.setLevel(logging.WARNING)

def _handle_response(resp_str):
    soup = BeautifulSoup(resp_str)
    success = soup.layerapi.status.string
    if success != "Success":
        raise WWTException(success)

def _parse_kwargs(params, kwargs):
    if "date_time" in kwargs:
        params["datetime"] = kwargs["date_time"]
    if "time_rate" in kwargs:
        params["timerate"] = kwargs["time_rate"]
    if "fly_to" in kwargs:
        params["flyto"] = ",".join([str(i) for i in kwargs["fly_to"]])
    if "instant" in kwargs:
        params["instant"] = str(kwargs["instant"])
    if "auto_loop" in kwargs:
        params["autoloop"] = str(kwargs["auto_loop"])

class WWTException(Exception):
    pass

class WWTLayer(object):
    def __init__(self, name, id, fields, wwt):
        self.name = name
        self.id = id
        self.fields = fields
        self.wwt = wwt

    def set_property(self, property_name, property_value, **kwargs):
        params = {}
        params["cmd"] = "setprop"
        params["id"] = self.id
        params["propname"] = property_name
        params["propvalue"] = property_value
        _parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params)
        prop_str = u.text
        _handle_response(prop_str)

    def set_properties(self, props_dict, **kwargs):
        props_string = "<?xml version='1.0' encoding='UTF-8'?><LayerApi><Layer "
        for key, value in props_dict.items():
            props_string += "%s=\"%s\" " % (key, value)
        props_string += " /></LayerApi>"
        params = {}
        params["cmd"] = "setprops"
        params["id"] = self.id
        _parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params, data=props_string)
        props_str = u.text
        _handle_response(props_str)

    def get_property(self, property_name):
        params = {}
        params["cmd"] = "getprop"
        params["id"] = self.id
        params["propname"] = property_name
        u = requests.post(self.wwt.wwt_url, params=params)
        prop_str = u.text
        _handle_response(prop_str)
        soup = BeautifulSoup(prop_str)
        return soup.layer.attrs[property_name.lower()]

    def get_properties(self):
        params = {}
        params["cmd"] = "getprops"
        params["id"] = self.id
        u = requests.post(self.wwt.wwt_url, params=params)
        props_str = u.text
        _handle_response(props_str)
        soup = BeautifulSoup(props_str)
        return soup.layer.attrs

    def update(self, data, no_purge=False, purge_all=False, **kwargs):
        params = {}
        params["cmd"] = "update"
        params["id"] = self.id
        params["purgeall"] = str(purge_all).lower()
        params["nopurge"] = str(no_purge).lower()
        _parse_kwargs(params, kwargs)
        fields = self.fields
        data_string = ""
        nevents = len(data[fields[0]])
        for i in xrange(nevents):
            data_string += "\t".join([str(data[k][i]) for k in fields])+"\n"
        u = requests.post(self.wwt.wwt_url, params=params, data=data_string)
        update_str = u.text
        _handle_response(update_str)

    def activate(self, **kwargs):
        params = {}
        params["cmd"] = "activate"
        params["id"] = self.id
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)

    def delete(self):
        params = {}
        params["cmd"] = "delete"
        params["id"] = self.id
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)

    def __str__(self):
        return self.name

class WWTController(object):
    def __init__(self, host=None):
        if host is None:
            self.host = "127.0.0.1"
        else:
            self.host = host
        self.wwt_url = "http://%s:5050/layerApi.aspx" % (self.host)
        self._check_for_server()

    def _check_for_server(self):
        params = {"cmd":"version"}
        try:
            u = requests.get(self.wwt_url, params=params)
        except ConnectionError:
            raise WWTException("World Wide Telescope has not been started " +
                               "on this host or is otherwise unreachable.")
        version_str = u.text
        soup = BeautifulSoup(version_str)
        if soup.layerapi.findChild("status") is not None:
            _handle_response(version_str)
        tag = soup.layerapi.version
        version_numbers = tag.string.split(".")
        if float(".".join(version_numbers[:2])) < 2.8:
            raise WWTException("World Wide Telescope is not the required version (>= 2.8)")

    def change_mode(self, mode, **kwargs):
        params = {}
        params["cmd"] = "mode"
        params["lookat"] = mode
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        mode_str = u.text
        _handle_response(mode_str)

    def move_view(self, parameter, **kwargs):
        params = {"cmd":"move", "move":parameter}
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        move_str = u.text
        _handle_response(move_str)

    def new_layer(self, frame, name, fields=None,
                  color=None, start_date=None,
                  end_date=None, fade_type=None,
                  fade_range=None, **kwargs):
        if fields is None:
            field_string = ""
        else:
            field_string = "\t".join(fields)
        params = {}
        params["cmd"] = "new"
        params["name"] = name
        params["frame"] = frame
        params["startdate"] = start_date
        params["enddate"] = end_date
        params["fadetype"] = fade_type
        params["faderange"] = fade_range
        _parse_kwargs(params, kwargs)
        u = requests.post(self.wwt_url, params=params, data=field_string)
        layer_str = u.text
        soup = BeautifulSoup(layer_str)
        layer_id = soup.layerapi.findChild(name="newlayerid").string
        if len(layer_id) != 36:
            raise WWTException("Invalid Layer ID received")
        return WWTLayer(name, layer_id, fields, self)

    def load(self, source, frame, name, color=None,
             start_date=None, end_date=None,
             fade_type=None, fade_range=None, **kwargs):
        filename = source
        f = open(filename, "r")
        line = f.readline()
        f.close()
        fields = line.strip("\n").split(",")
        params = {}
        params["cmd"] = "load"
        params["filename"] = filename
        params["frame"] = frame
        params["name"] = name
        params["color"] = color
        params["startdate"] = start_date
        params["enddate"] = end_date
        params["fadetype"] = fade_type
        params["faderange"] = fade_range
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        layer_str = u.text
        soup = BeautifulSoup(layer_str)
        layer_id = soup.layerapi.findChild(name="newlayerid").string
        if len(layer_id) != 36:
            raise WWTException("Invalid Layer ID received")
        return WWTLayer(name, layer_id, fields, self)

    def new_layer_group(self, frame, name, **kwargs):
        params = {"cmd":"group",
                  "frame":frame,
                  "name":name}
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        group_str = u.text
        _handle_response(group_str)

    def ui_settings(self, setting_name, setting_val, **kwargs):
        params = {"cmd":"uisettings",
                  setting_name:setting_val}
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        ui_str = u.text
        _handle_response(ui_str)

    def get_state(self):
        params = {"cmd":"state"}
        u = requests.get(self.wwt_url, params=params)
        state_str = u.text
        _handle_response(state_str)
        soup = BeautifulSoup(state_str)
        state = soup.layerapi.viewstate
        return state.attrs

    def get_layer_list(self, layers_only=True):
        params = {"cmd":"layerlist",
                  "layersonly":str(layers_only)}
        u = requests.get(self.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)
        soup = BeautifulSoup(layer_str)
        layer_list = soup.layerapi.layerlist
        return layer_list

    def __str__(self):
        return "WWT client at %s" % (self.host)

    
