import numpy as np
from astropy.io import fits
from astropy.coordinates import ICRS
from reproject import reproject_interp
from reproject.mosaicking import find_optimal_celestial_wcs

__all__ = ['sanitize_image']


def sanitize_image(image, output_file, overwrite=False):
    """
    Transform a FITS image so that it is in equatorial coordinates with a TAN
    projection and floating-point values, all of which are required to work
    correctly in WWT at the moment.

    Image can be a filename, an HDU, or a tuple of (array, WCS).
    """

    # The reproject package understands the different inputs to this function
    # so we can just transparently pass it through.

    wcs, shape_out = find_optimal_celestial_wcs([image], frame=ICRS(),
                                                projection='TAN')

    array, footprint = reproject_interp(image, wcs, shape_out=shape_out)

    fits.writeto(output_file, array.astype(np.float32),
                 wcs.to_header(), overwrite=overwrite)


def validate_traits(cls, traits):
    '''
    Helper function to ensure user-provided trait names match those of the
    class they're being used to instantiate
    '''
    mismatch = [key for key in traits if key not in cls.trait_names()]
    if mismatch:
        raise KeyError('Key{0} {1} do{2}n\'t match any layer trait name'
                       .format('s' if len(mismatch) > 1 else '',
                               mismatch,
                               '' if len(mismatch) > 1 else 'es'))
