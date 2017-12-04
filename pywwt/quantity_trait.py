from traitlets import TraitType
from astropy import units as u

class AstropyQuantity(TraitType):

    default = 0 * u.one
    info_text = '\'Custom trait to handle astropy quantities with units\''

    def validate(self, obj, value):
        if isinstance(value,u.Quantity):
            return value
        self.error(obj, value)
