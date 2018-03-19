import re

class ImageryLayers():
    """
    A supplemental class that standardizes layer names, sorts them by 
    bandpass, and makes it possible to tab complete them.
    """

    def __init__(self, layer_list):
        self._layers = {}
        self._spectrum = ['gamma', 'x', 'uv', 'visible',
                          'ir', 'micro', 'radio', 'other']
        self.integers = ['zero', 'one', 'two', 'three', 'four',
                         'five', 'six', 'seven', 'eight', 'nine']
        for band in self._spectrum:
            self._layers[band] = {}
        
        self._list2dict(layer_list)

    def _list2dict(self, og_list):
        # Helps turn the list of layer names used to initialize the class
        # (og_list) into a dict.
        for layer in og_list:
            ind = 0

            if re.search(r'(?i)gamma',layer) is not None:
                self._add2dict(self._layers, layer, 'gamma')
                continue # automatically advance to next iteration

            ind += 1
            if re.search(r'(?i)x(-|\s)?ray',layer) is not None:
                self._add2dict(self._layers, layer, 'x')
                continue

            ind += 1
            if (re.search(r'(?i)ultra(-|\s)?violet',layer) is not None or
                re.search(r'(?i)[^\d\w]+uv|uv[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, 'uv')
                continue

            ind += 1
            if (re.search(r'(?i)optical',layer) is not None or
                re.search(r'(?i)visible',layer) is not None):
                self._add2dict(self._layers, layer, 'visible')
                continue

            ind += 1    
            if (re.search(r'(?i)infrared',layer) is not None or
                re.search(r'(?i)[^\d\w]+ir|ir[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, 'ir')
                continue

            ind += 1
            if (re.search(r'(?i)microwave',layer) is not None or
                re.search(r'(?i)[^\d\w]+cmb|cmb[^\d\w]+',layer) is not None):
                self._add2dict(self._layers, layer, 'micro')
                continue

            ind += 1
            if re.search(r'(?i)radio',layer) is not None:
                self._add2dict(self._layers, layer, 'radio')
                continue

            ind += 1
            self._add2dict(self._layers, layer, 'other')

    def _add2dict(self, diction, full_layer, bandpass):
        # Handles a layer's (full_layer) actual addition to the master
        # dict of layers (diction) according to its bandpass.
        suffix = ''
        short = self._shorten(full_layer) + suffix
        
        while short in diction[bandpass]:
            if suffix:
                suffix += 1
            else:
                suffix = 1
                
            short += str(suffix)

        diction[bandpass][short] = {}
        diction[bandpass][short]['full_name'] = full_layer

    def _shorten(self, string):
        # Unlocks tab completion by shortening a full layer's name
        # (string) to a valid Python name based on its first word.        
        cut_left = re.search(r'^[_\W]+', string)
        if cut_left is not None:
            string = string[cut_left.end():]

        cut_right = re.search(r'[_\W]', string)
        if cut_right is not None:
            string = string[:cut_right.start()].lower()
        
        digit = re.search(r'^\d', string)
        if digit is not None:
            for i, num in enumerate(self.integers, 0):
                if str(i) == digit.group(0):
                    string = string[:digit.start()] + num + string[digit.end():]
                    break

        return string

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
