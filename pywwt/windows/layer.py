import requests

from .misc import WWTException, handle_response, parse_kwargs, get_soup

__all__ = ['WWTLayer']


class WWTLayer(object):
    """
    A ``WWTLayer`` object corresponding to a layer in WWT's Layer Manager.

    Parameters
    ----------
    name : `str`
        The name of the layer.
    id : `str`
        The ID of the layer.
    field : `list`
        The fields in the layer as a list of strings.
    wwt : `~pywwt.windows.WWTWindowsClient`
        The WWT client where this layer exists.
    """
    def __init__(self, name, id, fields, wwt):
        self.name = name
        self.id = id
        self.wwt = wwt
        self.exists = True
        self.fields = fields

    def _check_exists(self):
        if not self.exists:
            raise WWTException("This layer has been deleted!")

    def set_property(self, property_name, property_value, **kwargs):
        """
        Set a single property. For a list of properties see:

        https://docs.worldwidetelescope.org/lcapi-guide/1/properties/

        Parameters
        ----------
        property_name : `str`
            Name of the property to be set.
        property_value : `str`
            Value the property should take.
        kwargs
            Additional standard keyword arguments
        """
        self._check_exists()
        params = {}
        params["cmd"] = "setprop"
        params["id"] = self.id
        params["propname"] = property_name
        params["propvalue"] = property_value
        parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params)
        prop_str = u.content
        handle_response(prop_str)

    def set_properties(self, props_dict, **kwargs):
        """
        Set the properties of the layer. For a list of properties
        see:

        https://docs.worldwidetelescope.org/lcapi-guide/1/properties/

        Parameters
        ----------
        props_dict : `dict`
            Dictionary of property_name: property_value pairs.
        kwargs
            Additional standard keyword arguments
        """
        self._check_exists()
        props_string = "<?xml version='1.0' encoding='UTF-8'?><LayerApi><Layer "
        for key, value in list(props_dict.items()):
            props_string += "%s=\"%s\" " % (key, value)
        props_string += " /></LayerApi>"
        params = {}
        params["cmd"] = "setprops"
        params["id"] = self.id
        parse_kwargs(params, kwargs)
        u = requests.post(self.wwt.wwt_url, params=params, data=props_string)
        props_str = u.content
        handle_response(props_str)

    def get_property(self, property_name):
        """
        Return a property. For a list of properties see:

        https://docs.worldwidetelescope.org/lcapi-guide/1/properties/

        Parameters
        ----------
        property_name : `str`
            The name of the property to be returned.
        """
        self._check_exists()
        params = {}
        params["cmd"] = "getprop"
        params["id"] = self.id
        params["propname"] = property_name
        soup, resp = get_soup(self.wwt.wwt_url, params)
        handle_response(resp)
        return soup.Layer.attrs[property_name]

    def get_properties(self):
        """
        Return all the properties of the layer. For a list of properties
        see:

        https://docs.worldwidetelescope.org/lcapi-guide/1/properties/

        Returns
        -------
        properties : `dict`
            All of the properties in a dict of key: value pairs.
        """
        self._check_exists()
        params = {}
        params["cmd"] = "getprops"
        params["id"] = self.id
        soup, resp = get_soup(self.wwt.wwt_url, params)
        handle_response(resp)
        return soup.Layer.attrs

    def update(self, data=None, name=None,
               no_purge=False, purge_all=False,
               show=True, **kwargs):
        """
        Update the layer.

        Parameters
        ----------
        data : `dict`, optional
            New data to be added to the layer as a dictionary of Numpy arrays
        name : `str`, optional
            A new name for the layer, if it needs to be renamed
        no_purge : `bool`, optional
            The sending of an update command will delete events that occur
            before the start time of any events in the update and that have
            already decayed. Set this flag to `True` if the event data should
            not be deleted.
        purge_all : `bool`, optional
            Delete all data.
        show : `bool`, optional
            Whether to show or hide the layer.
        kwargs
            Additional standard keyword arguments
        """
        self._check_exists()
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
            for i in range(nevents):
                data_string += "\t".join([str(data[k][i]) for k in self.fields]) + "\n"
        u = requests.post(self.wwt.wwt_url, params=params, data=data_string)
        update_str = u.content
        handle_response(update_str)

    def activate(self, **kwargs):
        """
        Highlight this layer in the layer manager.

        Parameters
        ----------
        kwargs
            Additional standard keyword arguments
        """
        self._check_exists()
        params = {}
        params["cmd"] = "activate"
        params["id"] = self.id
        parse_kwargs(params, kwargs)
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.content
        handle_response(layer_str)

    def delete(self):
        """
        Delete the layer.
        """
        self._check_exists()
        params = {}
        params["cmd"] = "delete"
        params["id"] = self.id
        u = requests.get(self.wwt.wwt_url, params=params)
        layer_str = u.content
        handle_response(layer_str)
        self.exists = False

    def __repr__(self):
        return "<WWTLayer \"%s\" with ID %s on client at %s>" % (
            self.name, self.id, self.wwt.host)

    def __str__(self):
        return self.name
