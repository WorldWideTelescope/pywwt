import os
import socket
import urllib
import urllib2
from bs4 import BeautifulSoup
from datetime import datetime, timedelta

class WWTLayer(object):
    def __init__(self, name, id, fields):
        self.name = name
        self.id = id
        self.fields = fields
        
class WWTController(object):
    
    def __init__(self, ip=None):
        if ip is None:
            self.ip = socket.gethostbyname(socket.gethostname())
        else:
            self.ip = ip
        if not self._check_for_server():
            raise Exception("WWT has not been started at this address, " +
                            "or is unreachable, or is not the required version.")
        self.layers = {}
        
    def _check_for_server(self):
        try:
            u = urllib2.urlopen("http://%s:5050/layerapi.aspx?cmd=version" % 
                                (self.ip))
            version_str = u.read()
            soup = BeautifulSoup(version_str)
            tag = soup.layerapi.version
            version_numbers = tag.string.split(".")
            if float(".".join(version_numbers[:2])) > 2.8:
                return True
        except:
            pass
        return False
    
    def change_mode(self, mode, **kwargs):
        my_url = "http://%s:5050/layerApi.aspx?cmd=mode&lookat=%s" % (self.ip, 
                                                                      mode)
        u = urllib2.urlopen(my_url)
        
    def new_layer(self, frame, name, fields=None,
                  color=None, start_date=None,
                  end_date=None, fade_type=None,
                  fade_range=None):
        if name in self.layers:
            raise Exception("Layer already exists with this name! Choose a different one.")
        if fields is None:
            field_string = ""
        else:
            field_string = "\t".join(fields)
        params_dict = {}
        params_dict["name"] = name
        params_dict["frame"] = frame
        if start_date is not None:
            params_dict["startdate"] = start_date
        if end_date is not None:
            params_dict["enddate"] = end_date
        if fade_type is not None:
            params_dict["fadetype"] = fade_type
        if fade_range is not None:
            params_dict["faderange"] = fade_range
        params = urllib.urlencode(params_dict)
        my_url = "http://%s:5050/layerApi.aspx?cmd=new&%s" % (self.ip, params)
        u = urllib2.urlopen(my_url, data=field_string)
        layer_str = u.read()
        soup = BeautifulSoup(layer_str)
        layer_id = soup.layerapi.findChild(name="newlayerid").string
        if len(layer_id) != 36:
            raise Exception("Invalid Layer ID received")
        self.layers[name] = WWTLayer(name, layer_id, fields)
          
    def update_layer(self, name, data,
                     no_purge=False, purge_all=False):
        layer_id = self.layers[name].id
        params_dict = {}
        params_dict["purgeall"] = str(purge_all).lower()
        params_dict["nopurge"] = str(no_purge).lower()
        params = urllib.urlencode(params_dict)
        my_url = "http://%s:5050/layerApi.aspx?cmd=update&id=%s&%s" % (self.ip, 
                                                                       layer_id,
                                                                       params)
        fields = self.layers[name].fields
        nevents = len(data[fields[0]])
        for i in xrange(nevents):
            data_string = "\t".join([str(data[k][i]) for k in fields])
            u = urllib2.urlopen(my_url, data=data_string)
            update_str = u.read()
        
    def set_properties(self, name, props_dict):
        layer_id = self.layers[name].id
        props_string = "<?xml version='1.0' encoding='UTF-8'?><LayerApi><Layer "
        for key, value in props_dict.items():
            props_string += "%s=\"%s\" " % (key, value)
        props_string += " /></LayerApi>"
        my_url = "http://%s:5050/layerApi.aspx?cmd=setprops&id=%s" % (self.ip, 
                                                                      layer_id)
        u = urllib2.urlopen(my_url, data=props_string)

    def delete_layer(self, name):
        layer_id = self.layers[name].id
        my_url = "http://%s:5050/layerApi.aspx?cmd=delete&id=%s" % (self.ip, 
                                                                    layer_id)
        u = urllib2.urlopen(my_url)
        self.layers.pop("name")
    
