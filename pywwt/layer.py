import requests
from bs4 import BeautifulSoup
import logging
requests_log = logging.getLogger("requests")
requests_log.setLevel(logging.WARNING)
from .misc import WWTException, handle_response, parse_kwargs

def exists(func):
    def _exists(self, *args, **kwargs):
        if self.exists:
            return func(self, *args, **kwargs)
        else:
            raise WWTException("You deleted this layer already!")
    return _exists

class WWTLayer(object):
    def __init__(self, name, id, wwt):
        self.name = name
        self.id = id
        self.wwt = wwt
        self.exists = True

    @exists
    def set_property(self, property_name, property_value, **kwargs):
        r"""
        Set a single property. For a list of properties see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        :param property_name: Name of the property to be set.
        :type property_name: string
        :param property_value: Value the property should take.
        :type property_value: string

        Also takes the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "setprop"
        params["id"] = self.id
        params["propname"] = property_name
        params["propvalue"] = property_value
        parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params)
        prop_str = u.text
        handle_response(prop_str)

    @exists
    def set_properties(self, props_dict, **kwargs):
        r"""
        Set the properties of the layer. For a list of properties
        see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        :param props_dict: Dictionary of {property_name, property_value} pairs.
        :type props_dict: dict

        Also takes the standard keyword arguments.
        """
        props_string = "<?xml version='1.0' encoding='UTF-8'?><LayerApi><Layer "
        for key, value in props_dict.items():
            props_string += "%s=\"%s\" " % (key, value)
        props_string += " /></LayerApi>"
        params = {}
        params["cmd"] = "setprops"
        params["id"] = self.id
        parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params, data=props_string)
        props_str = u.text
        handle_response(props_str)

    @exists
    def get_property(self, property_name):
        r"""
        Return a property. For a list of properties see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        :param property_name: The name of the property to be returned.
        :type property_name: string
        :returns: The value of the property specified by *property_name*.
        """
        params = {}
        params["cmd"] = "getprop"
        params["id"] = self.id
        params["propname"] = property_name
        u = requests.post(self.wwt.wwt_url, params=params)
        prop_str = u.text
        handle_response(prop_str)
        soup = BeautifulSoup(prop_str)
        return soup.layer.attrs[property_name.lower()]

    @exists
    def get_properties(self):
        r"""
        Return all the properties of the layer. For a list of properties
        see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        :returns: All of the properties in a dict of key, value pairs.
        """
        params = {}
        params["cmd"] = "getprops"
        params["id"] = self.id
        u = requests.post(self.wwt.wwt_url, params=params)
        props_str = u.text
        handle_response(props_str)
        soup = BeautifulSoup(props_str)
        return soup.layer.attrs

    @exists
    def update(self, data=None, name=None,
               no_purge=False, purge_all=False,
               show=True, **kwargs):
        r"""
        Update the layer.

        :param data: New data to be added to the layer. Default: None
        :type data: dict of NumPy arrays, optional
        :param name: Rename the layer. Default: None
        :type name: string, optional
        :param no_purge: The sending of an update command will delete events
            that occur before the start time of any events in the
            update and that have already decayed. Set this flag
            if the event data should not be deleted. Default: False
        :type no_purge: boolean, optional
        :param purge_all: Delete all data. Default: False
        :type purge_all: boolean, optional
        :param show: Whether to show or hide the layer. Default: True
        :type show: boolean, optional

        Also takes the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "update"
        params["id"] = self.id
        if data is None:
            params["hasheader"] = "False"
        else:
            params["hasheader"] = "True"
        params["name"] = name
        params["purgeall"] = str(purge_all).lower()
        params["nopurge"] = str(no_purge).lower()
        params["show"] = str(show).lower()
        parse_kwargs(params, kwargs)
        if data is not None:
            fields = data.keys()
            data_string = "\t".join(fields)+"\n"
            nevents = len(data[fields[0]])
            for i in xrange(nevents):
                data_string += "\t".join([str(data[k][i]) for k in fields])+"\n"
        u = requests.post(self.wwt.wwt_url, params=params, data=data_string)
        update_str = u.text
        handle_response(update_str)

    @exists
    def activate(self, **kwargs):
        r"""
        Highlight this layer in the layer manager.

        Also takes the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "activate"
        params["id"] = self.id
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        handle_response(layer_str)

    @exists
    def delete(self):
        r"""
        Delete the layer.
        """
        params = {}
        params["cmd"] = "delete"
        params["id"] = self.id
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        handle_response(layer_str)
        self.exists = False

    def __repr__(self):
        return "<WWTLayer \"%s\" with ID %s on client at %s>" % (
            self.name, self.id, self.wwt.host)

    def __str__(self):
        return self.name

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
        r"""
        Changes the view to one of Earth, Planet, Sky, Panorama, SolarSystem.

        :param mode: The mode to change to.
        :type mode: string

        Also accepts the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "mode"
        params["lookat"] = mode
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        mode_str = u.text
        _handle_response(mode_str)

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
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        move_str = u.text
        _handle_response(move_str)

    def new_layer(self, frame, name,
                  color=None, start_date=None,
                  end_date=None, fade_type=None,
                  fade_range=None, **kwargs):
        r"""
        Initialize a new layer in the layer manager.

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

        :returns: A `WWTLayer` object corresponding to the layer just created.

        Also accepts the default keyword arguments.
        """
        params = {}
        params["cmd"] = "new"
        params["name"] = name
        params["frame"] = frame
        params["startdate"] = start_date
        params["enddate"] = end_date
        params["fadetype"] = fade_type
        params["faderange"] = fade_range
        _parse_kwargs(params, kwargs)
        u = requests.post(self.wwt_url, params=params)
        layer_str = u.text
        soup = BeautifulSoup(layer_str)
        layer_id = soup.layerapi.findChild(name="newlayerid").string
        if len(layer_id) != 36:
            raise WWTException("Invalid Layer ID received")
        return WWTLayer(name, layer_id, self)

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
        f = open(filename, "r")
        line = f.readline()
        f.close()
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
        return WWTLayer(name, layer_id, self)

    def get_existing_layer(self, name):
        r"""
        Return an existing layer as a `WWTLayer` object.

        :param name: The name of the layer to be highlighted.
        :type name: string
        :returns: A ``WWTLayer`` object corresponding to the named layer.

        Also takes the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "activate"
        params["id"] = self.id
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        print layer_str
        _handle_response(layer_str)

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
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        group_str = u.text
        _handle_response(group_str)

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
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        ui_str = u.text
        _handle_response(ui_str)

    def get_state(self):
        r"""
        Requests some details of the current view.

        :returns: The state information as a dict of key, value pairs.
        """
        params = {"cmd":"state"}
        u = requests.get(self.wwt_url, params=params)
        state_str = u.text
        _handle_response(state_str)
        soup = BeautifulSoup(state_str)
        state = soup.layerapi.viewstate
        return state.attrs

    def get_layer_list(self, layers_only=True):
        r"""
        Returns the structure of the layers and layer group names
        that are currently in the layer manager.

        :param layers_only: Indicates that only layers, and not reference frames
            or group names, should be returned.
        :type layers_only: boolean, optional
        :returns: A BeautifulSoup representation of the XML-formatted layer list.
        """
        params = {"cmd":"layerlist",
                  "layersonly":str(layers_only)}
        u = requests.get(self.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)
        soup = BeautifulSoup(layer_str)
        layer_list = soup.layerapi.layerlist
        return layer_list

    def __repr__(self):
        return "WWTClient(host=\"%s\")" % (self.host)

    def __str__(self):
        return self.host

    
