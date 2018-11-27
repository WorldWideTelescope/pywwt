import requests

class Instruments():
    """
    A supplemental class that enables tab-completion for available
    instruments in FieldOfView().
    """
     # change link once new gh-pages PR is accepted!
    
    def __init__(self):
        # instruments = requests.get('https://worldwidetelescope.github.io/pywwt/instruments.json').json()
        self.dim = requests.get('https://raw.githubusercontent.com/WorldWideTelescope/pywwt/60facd7120af5a9c3f372c72617db1fa94dceab3/instruments.json').json()
        self.available = list(self.dim.keys())

    def __dir__(self):
        # exclude extra dimensions of certain instruments (e.g. jwst_nircam)
        shown = [inst for inst in self.available if inst != 'nircam_short']
        return shown

    def __getattr__(self, inst):
        return inst
