import requests

class Instruments():
    """
    A supplemental class that enables tab-completion for available
    instruments in FieldOfView().
    """
     # change link once new gh-pages PR is accepted!
    
    def __init__(self):
        # instruments = requests.get('https://worldwidetelescope.github.io/pywwt/instruments.json').json()
        self.entry = requests.get('https://raw.githubusercontent.com/WorldWideTelescope/pywwt/d746d22562c79366ea9ddf3313c8ca3b95e1e1d7/instruments.json').json()
        self.available = list(self.entry.keys())

    def __dir__(self):
        # enable tab-completion of class attributes (sans entry) and instruments
        default = [key for key in self.__dict__.keys() if key != 'entry']
        instruments = [inst for inst in self.available]
        return default + instruments

    def __getattr__(self, inst):
        # disallow calls to invalid instrument names
        # (regular class attributes like available are still called normally)
        if inst in self.available:
            return inst
        else:
            raise ValueError('not a valid instrument')
