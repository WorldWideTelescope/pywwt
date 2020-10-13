from traitlets import (TraitType, TraitError,
                       Any as OriginalAny,
                       Bool as OriginalBool,
                       CFloat as OriginalFloat,
                       Int as OriginalInt,
                       Unicode as OriginalUnicode)
from astropy import units as u

try:
    from matplotlib.colors import to_hex
except ImportError:
    from matplotlib.colors import colorConverter, rgb2hex
    def to_hex(input):  # noqa
        return rgb2hex(colorConverter.to_rgb(input))

__all__ = ['Any', 'Bool', 'Float', 'Int', 'Unicode', 'AstropyQuantity',
           'Color', 'ColorWithOpacity', 'to_hex']

# We inherit the original trait classes to make sure that the docstrings are set


class Any(OriginalAny):

    def __init__(self, *args, **kwargs):
        super(Any, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


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


class Int(OriginalInt):

    def __init__(self, *args, **kwargs):
        super(Int, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


class Unicode(OriginalUnicode):

    def __init__(self, *args, **kwargs):
        super(Unicode, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help


class AstropyQuantity(TraitType):

    default_value = 0 * u.one
    info_text = '\'Custom trait to handle astropy quantities with units\''

    def __init__(self, *args, **kwargs):
        super(AstropyQuantity, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help

    def validate(self, obj, value):
        if isinstance(value, u.Quantity):
            return value
        else:
            raise TraitError('This attribute must be an Astropy Quantity '
                             'with associated units')


class Color(TraitType):

    def __init__(self, *args, **kwargs):
        super(Color, self).__init__(*args, **kwargs)
        if self.help:
            self.__doc__ = self.help

        # Check if current Color instance was called from ColorWithOpacity
        self.from_cwo = False

    def validate(self, obj, value):
        if (isinstance(value, str) or
                (isinstance(value, tuple) and len(value) == 3)):
            return to_hex(value)
        else:
            if self.from_cwo:
                raise TraitError('This attribute\'s color must be a string '
                                 '(a recognized matplotlib color name or hex '
                                 'code) or an RGB(A) tuple of 3 or 4 floats '
                                 '(3 RGB colors and, optionally, 1 opacity)')
            else:
                raise TraitError('This attribute\'s color must be a string '
                                 '(a recognized matplotlib color name or hex '
                                 'code) or an RGB tuple of 3 floats')


class ColorWithOpacity(Color):

    def validate(self, obj, value):
        self.from_cwo = True
        if isinstance(value, tuple) and len(value) == 4:
            obj.opacity = value[-1]
            value = value[:3]
        return super(ColorWithOpacity, self).validate(obj, value)
