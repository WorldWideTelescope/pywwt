from __future__ import print_function
import requests
from requests import ConnectionError
from bs4 import BeautifulSoup
from .misc import WWTException, handle_response, parse_kwargs, get_soup
from .layer import WWTLayer

class WWTClient(object):
    r"""
    Initialize a WWTClient, connecting to a WWT client.

    :param host: The hostname or IP address where
        the WWT client is being run. Default: "127.0.0.1"
    :type host: string, optional
    """
    def __init__(self, host=None):
        if host is None:
            self.host = "127.0.0.1"
        else:
            self.host = host
        print("Connecting to WWT on host %s." % self.host)
        self.wwt_url = "http://%s:5050/layerApi.aspx" % (self.host)
        self._check_for_server()

    def _check_for_server(self):
        params = {"cmd":"version"}
        try:
            u = requests.get(self.wwt_url, params=params)
        except ConnectionError:
            raise WWTException("World Wide Telescope has not been started " +
                               "on this host or is otherwise unreachable.")
        version_str = u.content
        soup = BeautifulSoup(version_str, "xml")
        if soup.LayerApi.findChild("Status") is not None:
            handle_response(version_str)
        tag = soup.LayerApi.Version
        version_numbers = tag.string.split(".")
        if float(".".join(version_numbers[:2])) < 2.8:
            raise WWTException("World Wide Telescope is not the required version (>= 2.8)")

    def change_mode(self, mode, **kwargs):
        r"""
        Changes the view to one of Earth, Planet, Sky, Panorama, SolarSystem.

        :param mode: The mode to change to.
        :type mode: string

        Also accepts the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "mode"
        params["lookat"] = mode
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        mode_str = u.content
        handle_response(mode_str)

    def move_view(self, parameter, **kwargs):
        r"""
        Changes the view depending on the supplied parameter.
        For a list of parameters see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#move

        :param parameter: The parameter used to set the view.
        :type parameter: string

        Also accepts the standard keyword arguments.
        """
        params = {"cmd":"move", "move":parameter}
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        move_str = u.content
        handle_response(move_str)

    def new_layer(self, frame, name, fields,
                  color=None, start_date=None,
                  end_date=None, fade_type=None,
                  fade_range=None, **kwargs):
        r"""
        Initialize a new layer in the layer manager.

        :param frame: The reference frame of the layer.
        :type frame: string
        :param name: The name of the layer.
        :type name: string
        :param fields: The names of the fields to be loaded in the layer.
        :type fields: list of strings
        :param color: ARBG hex value of the color to be used when rendering
            the events of the layer. Default: "FFFFFFFF" (white)
        :type color: string, optional
        :param start_date: With time series data, the date and time to start the
            visualization for this layer. This could for example
            be slightly earlier than the date of the first event
            in the actual data. Default: the system minimum date value.
            Formats (month/day/year):
            "1/1/2010 11:00:00 PM"
            "1/1/2010 11:30 AM"
            "1/1/2010 11 am"
            "1/1/2000"
            "1/2000"
        :type start_date: string, optional
        :param end_date: With time series data, the date and time to end the
            visualization for this layer. Default: the system maximum date value.
        :type end_date: string, optional
        :param fade_type:  Fades the data visualization. One of: "In", "Out", "Both",
            or "None". Default: "None"
        :type fade_type: string, optional
        :param fade_range: Fade time in days. Default: 0
        :type fade_range: int, optional

        :returns: A `WWTLayer` object corresponding to the layer just created.

        Also accepts the default keyword arguments.
        """
        params = {}
        params["cmd"] = "new"
        params["name"] = name
        params["frame"] = frame
        params["color"] = color
        params["startdate"] = start_date
        params["enddate"] = end_date
        params["fadetype"] = fade_type
        params["faderange"] = fade_range
        parse_kwargs(params, kwargs)
        field_string = "\t".join(fields)
        u = requests.post(self.wwt_url, params=params, data=field_string)
        layer_str = u.content
        soup = BeautifulSoup(layer_str, "xml")
        layer_id = soup.LayerApi.findChild(name="NewLayerID").string
        if len(layer_id) != 36:
            raise WWTException("Invalid Layer ID received")
        return WWTLayer(name, layer_id, fields, self)

    def load(self, filename, frame, name, color=None,
             start_date=None, end_date=None,
             fade_type=None, fade_range=None, **kwargs):
        r"""
        Initialize a new layer in the layer manager.

        :param filename: The name of the file to read the data from.
        :type filename: string
        :param frame: The reference frame of the layer.
        :type frame: string
        :param name: The name of the layer.
        :type name: string
        :param color: ARBG hex value of the color to be used when rendering
            the events of the layer. Default: "FFFFFFFF" (white)
        :type color: string, optional
        :param start_date: With time series data, the date and time to start the
            visualization for this layer. This could for example
            be slightly earlier than the date of the first event
            in the actual data. Default: the system minimum date value.
            Formats (month/day/year):
            "1/1/2010 11:00:00 PM"
            "1/1/2010 11:30 AM"
            "1/1/2010 11 am"
            "1/1/2000"
            "1/2000"
        :type start_date: string, optional
        :param end_date: With time series data, the date and time to end the
            visualization for this layer. Default: the system maximum date value.
        :type end_date: string, optional
        :param fade_type:  Fades the data visualization. One of: "In", "Out", "Both",
            or "None". Default: "None"
        :type fade_type: string, optional
        :param fade_range: Fade time in days. Default: 0
        :type fade_range: int, optional

        :returns: A ``WWTLayer`` object corresponding to the layer just created.

        Also accepts the default keyword arguments.
        """
        if self.host not in ["127.0.0.1", "localhost", "localhost.localdomain"]:
            raise WWTException("The 'load' method only works if you are on the same machine "
                               "as the WWT client.")
        if filename.endswith("csv"):
            f = open(filename, "r")
            line = f.readline()
            f.close()
            fields = line.replace("\t",",").strip("\n").split(",")
        else:
            fields = []
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
        parse_kwargs(params, kwargs)
        soup, resp = get_soup(self.wwt_url, params)
        layer_id = soup.LayerApi.findChild(name="NewLayerID").string
        if len(layer_id) != 36:
            raise WWTException("Invalid Layer ID received")
        return WWTLayer(name, layer_id, fields, self)

    def get_existing_layer(self, name):
        r"""
        Return an existing layer as a `WWTLayer` object.

        :param name: The name of the layer to be highlighted.
        :type name: string
        :returns: A ``WWTLayer`` object corresponding to the named layer.

        Also takes the standard keyword arguments.
        """
        layers = self.get_layer_list()
        layer_id = layers[name]["id"]
        fields = []
        return WWTLayer(name, layer_id, fields, self)

    def new_layer_group(self, frame, name, **kwargs):
        r"""
        Specifies that a layer group should be added.

        :param frame: The reference frame of the layer group.
        :type frame: string
        :param name: The name of the layer group.
        :type name: string

        Also accepts the standard keyword arguments.
        """
        params = {"cmd":"group",
                  "frame":frame,
                  "name":name}
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        group_str = u.content
        handle_response(group_str)

    def ui_settings(self, setting_name, setting_value, **kwargs):
        r"""
        Change user interface settings, without altering the
        layer data. For the settings list see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#uisettings

        :param setting_name: The name of the setting to be changed.
        :type setting_name: string
        :param setting_value: The value to set the setting to.
        :type setting_value: string

        Also takes the standard keyword arguments.
        """
        params = {"cmd":"uisettings",
                  setting_name:setting_value}
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        ui_str = u.content
        handle_response(ui_str)

    def get_state(self):
        r"""
        Requests some details of the current view.

        :returns: The state information as a dict of key, value pairs.
        """
        params = {"cmd":"state"}
        soup, resp = get_soup(self.wwt_url, params)
        handle_response(resp)
        state = soup.LayerApi.ViewState
        return state.attrs

    def get_layer_list(self):
        r"""
        Returns information about the layers that are
        currently in the layer manager.

        :returns: A dictionary of layers.
        """
        params = {"cmd":"layerlist",
                  "layersonly":"True"}
        soup, resp = get_soup(self.wwt_url, params)
        handle_response(resp)
        layer_list = soup.LayerApi.LayerList
        layers = {}
        for layer in layer_list.findAll("Layer"):
            layer_name = layer.attrs.pop("Name")
            layers[layer_name] = layer.attrs
        return layers

    def get_frame_list(self):
        r"""
        Returns information about the reference frames that are
        currently in the layer manager.

        :returns: A dictionary of reference frames.
        """
        params = {"cmd":"layerlist",
                  "layersonly":"False"}
        soup, resp = get_soup(self.wwt_url, params)
        handle_response(resp)
        layer_list = soup.LayerApi.LayerList
        frames = {}
        for frame in layer_list.findAll("ReferenceFrame"):
            frame_name = frame.attrs.pop("Name")
            frames[frame_name] = frame.attrs
        return frames

    def __repr__(self):
        return "WWTClient(host=\"%s\")" % self.host

    def __str__(self):
        return self.host

    
