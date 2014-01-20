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
    def __init__(self, name, id, wwt):
        self.name = name
        self.id = id
        self.wwt = wwt

    def set_property(self, property_name, property_value, **kwargs):
        r"""
        Set a single property. For a list of properties see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        Parameters
        ----------
        property_name : string
            Name of the property to be set.
        property_value : string
            Value the property should take.

        Also takes the standard keyword arguments.
        """
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
        r"""
        Set the properties of the layer. For a list of properties
        see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        Parameters
        ----------
        props_dict : dict
            Dictionary of {property_name, property_value} pairs.

        Also takes the standard keyword arguments.
        """
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
        r"""
        Return a property. For a list of properties see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        Parameters
        ----------
        property_name : string
            The name of the property to be returned.

        Returns
        -------
        The value of the property specified by *property_name*.
        """
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
        r"""
        Return all the properties of the layer. For a list of properties
        see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#Table_of_Properties

        Returns
        -------
        All of the properties in a dict of key, value pairs.
        """
        params = {}
        params["cmd"] = "getprops"
        params["id"] = self.id
        u = requests.post(self.wwt.wwt_url, params=params)
        props_str = u.text
        _handle_response(props_str)
        soup = BeautifulSoup(props_str)
        return soup.layer.attrs

    def update(self, data=None, name=None,
               no_purge=False, purge_all=False,
               show=True, **kwargs):
        r"""
        Update the layer.

        Parameters
        ----------
        data : dict of NumPy arrays, optional
            New data to be added to the layer. Default is None.
        name : string, optional
            Rename the layer. Default is None.
        no_purge : boolean, optional
            The sending of an update command will delete events
            that occur before the start time of any events in the
            update and that have already decayed. Set this flag
            if the event data should not be deleted. Defaults to
            False.
        purge_all : boolean, optional
            Delete all data. Default is False.
        show : boolean, optional
            Whether to show or hide the layer. Default is True.

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
        _parse_kwargs(params, kwargs)
        if data is not None:
            fields = data.keys()
            data_string = "\t".join(fields)+"\n"
            nevents = len(data[fields[0]])
            for i in xrange(nevents):
                data_string += "\t".join([str(data[k][i]) for k in fields])+"\n"
        u = requests.post(self.wwt.wwt_url, params=params, data=data_string)
        update_str = u.text
        _handle_response(update_str)

    def activate(self, **kwargs):
        r"""
        Highlight this layer in the layer manager.

        Also takes the standard keyword arguments.
        """
        params = {}
        params["cmd"] = "activate"
        params["id"] = self.id
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)

    def delete(self):
        r"""
        Delete the layer.
        """
        params = {}
        params["cmd"] = "delete"
        params["id"] = self.id
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.text
        _handle_response(layer_str)

    def __repr__(self):
        return "<WWTLayer \"%s\" with ID %s on client at %s>" % (
            self.name, self.id, self.wwt.host)

    def __str__(self):
        return self.name

class WWTController(object):
    r"""
    Initialize a WWTController, connecting to a WWT client.

    Parameters
    ----------
    host : string
        String representing the hostname or IP address where
        the WWT client is being run. Defaults to "127.0.0.1".
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

        Parameters
        ----------
        mode : string
            The mode to change to.

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

        Parameters
        ----------
        parameter : string
            The parameter used to set the view.

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

        Parameters
        ----------
        frame : string
            The reference frame of the layer.
        name : string
            The name of the layer.
        color : hex string, optional
            ARBG hex value of the color to be used when rendering
            the events of the layer. Defaults to "FFFFFFFF" (white).
        start_date : string, optional
            With time series data, the date and time to start the
            visualization for this layer. This could for example
            be slightly earlier than the date of the first event
            in the actual data. Defaults to the system minimum
            date value.
            Formats (month/day/year):
            "1/1/2010 11:00:00 PM"
            "1/1/2010 11:30 AM"
            "1/1/2010 11 am"
            "1/1/2000"
            "1/2000"
        end_date : string, optional
            With time series data, the date and time to end the
            visualization for this layer. Defaults to the system
            maximum date value.
        fade_type : string, optional
            Fades the data visualization. One of: "In", "Out", "Both",
            or "None". Defaults to "None".
        fade_range : int, optional
            Fade time in days. Defaults to 0.

        Also accepts the default keyword arguments.

        Returns
        -------
        A `WWTLayer` object corresponding to the layer just created.
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
        Initialize a new layer in the layer manager and load data
        from a file into it.

        Parameters
        ----------
        filename : string
            The full path of the file to load.
        frame : string
            The reference frame of the layer.
        name : string
            The name of the layer.
        color : hex string, optional
            ARBG hex value of the color to be used when rendering
            the events of the layer. Defaults to "FFFFFFFF" (white).
        start_date : string, optional
            With time series data, the date and time to start the
            visualization for this layer. This could for example
            be slightly earlier than the date of the first event
            in the actual data. Defaults to the system minimum
            date value.
            Formats (month/day/year):
            "1/1/2010 11:00:00 PM"
            "1/1/2010 11:30 AM"
            "1/1/2010 11 am"
            "1/1/2000"
            "1/2000"
        end_date : string, optional
            With time series data, the date and time to end the
            visualization for this layer. Defaults to the system
            maximum date value.
        fade_type : string, optional
            Fades the data visualization. One of: "In", "Out", "Both",
            or "None". Defaults to "None".
        fade_range : int, optional
            Fade time in days. Defaults to 0.

        Also accepts the default keyword arguments.

        Returns
        -------
        A `WWTLayer` object corresponding to the layer just created.
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

    def new_layer_group(self, frame, name, **kwargs):
        r"""
        Specifies that a layer group should be added.

        Parameters
        ----------
        frame : string
            The reference frame of the layer group.
        name : string
            The name of the layer group.

        Also accepts the standard keyword arguments.
        """
        params = {"cmd":"group",
                  "frame":frame,
                  "name":name}
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        group_str = u.text
        _handle_response(group_str)

    def ui_settings(self, setting_name, setting_val, **kwargs):
        r"""
        Change user interface settings, without altering the
        layer data. For the settings list see:

        http://www.worldwidetelescope.org/Developers/?LayerControlAPI#uisettings

        Parameters
        ----------
        setting_name : string
            The name of the setting to be changed.
        setting_val : string
            The value to set the setting to.

        Also takes the standard keyword arguments.
        """
        params = {"cmd":"uisettings",
                  setting_name:setting_val}
        _parse_kwargs(params, kwargs)
        u = requests.get(self.wwt_url, params=params)
        ui_str = u.text
        _handle_response(ui_str)

    def get_state(self):
        r"""
        Requests some details of the current view.

        Returns
        -------
        The state information as a dict of key, value pairs.
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

        Parameters
        ----------
        layers_only : boolean, optional
            Indicates that only layers, and not reference frames
            or group names, should be returned.

        Returns
        -------
        A BeautifulSoup representation of the XML-formatted layer list.
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
        return "WWTController(host=\"%s\")" % (self.host)

    
