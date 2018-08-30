import requests

class Instruments():
    """
    A supplemental class that enables tab-completion for available
    instruments in FieldOfView().
    """
    # remember to change commented out code in FieldOfView
    # AND self.telescopes addition to BaseWWTWidget class in core.py
    
    def __init__(self):
        # change link once new gh-pages PR is accepted
        # instruments = requests.get('https://worldwidetelescope.github.io/pywwt/instruments.json').json()
        self.dim = requests.get('https://raw.githubusercontent.com/WorldWideTelescope/pywwt/dcddfbd75def5a0d3621f522309586c43f9397c4/instruments.json').json()
        self.available = list(self.dim.keys())

    def __dir__(self):
        # exclude extra dimensions of certain instruments (e.g. jwst_nircam)
        shown = [inst for inst in self.available if inst[0] != '_']
        return shown

    def __getattr__(self, inst):
        return inst
