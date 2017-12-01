from traitlets import TraitType
from astropy import units as u

class AstropyQuantity(TraitType):

    default = 0 * u.deg
    info_text = 'Custom trait to handle astropy quantities with units'

    def validate(self, obj, value):
        if hasattr(value, 'value') and hasattr(value, 'unit'):
            return value
        self.error(obj, value)
