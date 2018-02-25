import re

class ImageryLayers():

    def __init__(self, layer_list):
        self._layers = {}
        self._spectrum = ['gamma', 'x', 'uv', 'visible', 'ir', 'micro', 'radio', 'other']
        for band in self._spectrum:
            self._layers[band] = {}
        
        self._list2dict(layer_list)

    def _list2dict(self, og_list):
        for layer in og_list:
            ind = 0

            if(re.search(r'(?i)gamma',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue # automatically advance to next iteration

            ind += 1
            if(re.search(r'(?i)x(-|\s)?ray',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1
            if(re.search(r'(?i)ultra(-|\s)?violet',layer) != None or 
                 re.search(r'(?i)[^\d\w]+uv|uv[^\d\w]+',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1
            if(re.search(r'(?i)optical',layer) != None or 
                 re.search(r'(?i)visible',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1    
            if(re.search(r'(?i)infrared',layer) != None or 
                 re.search(r'(?i)[^\d\w]+ir|ir[^\d\w]+',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1
            if(re.search(r'(?i)microwave',layer) != None or 
                 re.search(r'(?i)[^\d\w]+cmb|cmb[^\d\w]+',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1
            if(re.search(r'(?i)radio',layer) != None):
                self._add2dict(self._layers, layer, ind)
                continue

            ind += 1
            self._add2dict(self._layers, layer, ind)

    def _add2dict(self, diction, full_layer, ind):
        abbr = self._shorten(full_layer)

        # check if abbr already exists in diction
        j = 2
        while(abbr in diction[self._spectrum[ind]]):
            if(str(j-1) in abbr):
                abbr = abbr[:-1]

            abbr += str(j)
            j += 1

        diction[self._spectrum[ind]][abbr] = {}
        diction[self._spectrum[ind]][abbr]['full_name'] = full_layer
        diction[self._spectrum[ind]][abbr]['thumbnail'] = None

    def _shorten(self, string):
        first = string[:re.search(r'[\W]', string).start()].lower()

        # just for 2MASS; use num2words to standardize process?
        check = re.search(r'2', first)
        if(check != None):
            first = first[:check.start()] + 'two' + first[check.start()+1:]

        return first

    def __dir__(self):
        return sorted(self._layers.keys())

    def __getattr__(self, band):
        return Bandpass(self._layers[band])


class Bandpass():

    def __init__(self, band):
        self._band = band

    def __dir__(self):
        return sorted(self._band.keys())

    def __getattr__(self, name):
        return self._band[name]['full_name']
