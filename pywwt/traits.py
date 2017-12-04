from traitlets import (TraitType,
                       Bool as OriginalBool,
                       Float as OriginalFloat,
                       Unicode as OriginalUnicode)
from astropy import units as u


# We inherit the original trait classes to make sure that the docstrings are set


class Bool(OriginalBool):

    def __init__(self, *args, **kwargs):
        super(Bool, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


class Float(OriginalFloat):

    def __init__(self, *args, **kwargs):
        super(Float, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


class Unicode(OriginalUnicode):

    def __init__(self, *args, **kwargs):
        super(Unicode, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


class AstropyQuantity(TraitType):

    default = 0 * u.one
    info_text = '\'Custom trait to handle astropy quantities with units\''

    def __init__(self, *args, **kwargs):
        super(AstropyQuantity, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help

    def validate(self, obj, value):
        if isinstance(value, u.Quantity):
            return value
        self.error(obj, value)
