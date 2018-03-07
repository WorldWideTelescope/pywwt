import re

class ImageryLayers():
    """
    A supplemental class that standardizes layer names, sorts them by 
    bandpass, and makes it possible to tab complete them.
    """

    def __init__(self, layer_list):
        self._layers = {}
        self._spectrum = ['gamma', 'x', 'uv', 'visible', 'ir', 'micro', 'radio', 'other']
        for band in self._spectrum:
            self._layers[band] = {}
        
        self._list2dict(layer_list)

    def _list2dict(self, og_list):
        # Helps turn the list of layer names used to initialize the class
        # (og_list) into a dict.
        for layer in og_list:
            ind = 0

            if re.search(r'(?i)gamma',layer) is not None:
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue # automatically advance to next iteration

            ind += 1
            if re.search(r'(?i)x(-|\s)?ray',layer) is not None:
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1
            if (re.search(r'(?i)ultra(-|\s)?violet',layer) is not None or
                re.search(r'(?i)[^\d\w]+uv|uv[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1
            if (re.search(r'(?i)optical',layer) is not None or
                re.search(r'(?i)visible',layer) is not None):
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1    
            if (re.search(r'(?i)infrared',layer) is not None or
                re.search(r'(?i)[^\d\w]+ir|ir[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1
            if (re.search(r'(?i)microwave',layer) is not None or
                re.search(r'(?i)[^\d\w]+cmb|cmb[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1
            if re.search(r'(?i)radio',layer) is not None:
                self._add2dict(self._layers, layer, self._spectrum[ind])
                continue

            ind += 1
            self._add2dict(self._layers, layer, self._spectrum[ind])

    def _add2dict(self, diction, full_layer, bandpass):
        # Handles a layer's (full_layer) actual addition to the master
        # dict of layers (diction) according to its bandpass.
        suffix = ''
        short = self._shorten(full_layer) + suffix
        
        while short in diction[bandpass]:
            if suffix:
                suffix += 1
                short += str(suffix)
            else:
                suffix = 1
                short += str(suffix)

        diction[bandpass][short] = {}
        diction[bandpass][short]['full_name'] = full_layer
        diction[bandpass][short]['thumbnail'] = None

    def _shorten(self, string):
        # Unlocks tab completion by shortening a full layer's name
        # (string) to a valid Python name based on its first word.
        first = string[:re.search(r'[\W]', string).start()].lower()

        # just for 2MASS; use num2words to standardize process?
        check = re.search(r'2', first)
        if check is not None:
            first = first[:check.start()] + 'two' + first[check.start()+1:]

        return first

    def __dir__(self):
        return sorted(self._layers.keys())

    def __getattr__(self, band):
        return Bandpass(self._layers[band])


class Bandpass():
    """
    Allows the __getattr__() method from ImageryLayers to reach into the
    inner dict corresponding to layers of a particular bandpass.
    """

    def __init__(self, band):
        self._band = band

    def __dir__(self):
        return sorted(self._band.keys())

    def __getattr__(self, name):
        return self._band[name]['full_name']
