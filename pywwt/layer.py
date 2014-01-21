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
    def __init__(self, name, id, fields, wwt):
        self.name = name
        self.id = id
        self.wwt = wwt
        self.exists = True
        self.fields = fields

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
        params["hasheader"] = "False"
        params["name"] = name
        params["purgeall"] = str(purge_all).lower()
        params["nopurge"] = str(no_purge).lower()
        params["show"] = str(show).lower()
        parse_kwargs(params, kwargs)
        data_string = ""
        if data is not None:
            nevents = len(data[self.fields[0]])
            for i in xrange(nevents):
                data_string += "\t".join([str(data[k][i]) for k in self.fields])+"\n"
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