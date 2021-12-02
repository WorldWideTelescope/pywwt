# Copyright 2021 the .NET Foundation
# Licensed under the three-clause BSD License

"""
Provides a helper class for managing a list of instrument fields-of-view (FOVs).

You don't need to use this module directly. Access instrumental FOV information
through your ``wwt`` variable with `~pywwt.core.BaseWWTWidget.instruments`.
"""

import requests


class Instruments():
    """
    A supplemental class that enables tab-completion for available
    instruments in FieldOfView().
    """
    def __init__(self):
        self.entry = requests.get('https://worldwidetelescope.github.io/pywwt/instruments.json').json()
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
