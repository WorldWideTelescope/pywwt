import numpy as np
import pytz
from astropy.io import fits
from astropy.coordinates import ICRS
from astropy.time import Time
from datetime import datetime
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
    class they're being used to instantiate.
    '''
    mismatch = [key for key in traits if key not in cls.trait_names()]
    if mismatch:
        raise KeyError('Key{0} {1} do{2}n\'t match any layer trait name'
                       .format('s' if len(mismatch) > 1 else '',
                               mismatch,
                               '' if len(mismatch) > 1 else 'es'))


def ensure_utc(tm, str_allowed):
    '''
    Helper function to convert a time object (Time, datetime, or UTC string
    if str_allowed == True) into UTC before passing it to WWT.
    str_allowed is True for wwt.set_current_time (core.py) and False for TableLayer's 'time_att' implementation (layers.py).
    '''

    if tm is None:
        utc_tm = datetime.utcnow().astimezone(pytz.UTC).isoformat()

    elif isinstance(tm, datetime):
        if tm.tzinfo is None:
            utc_tm = pytz.utc.localize(tm).isoformat()
        elif tm.tzinfo == pytz.UTC:
            utc_tm = tm.isoformat()
        else:  # has a non-UTC time zone
            utc_tm = tm.astimezone(pytz.UTC).isoformat()

    elif isinstance(tm, Time):
        utc_tm = tm.to_datetime(pytz.UTC).isoformat()

    else:
        if str_allowed:  # is an ISOT string
            dt = Time(tm, format='isot').to_datetime(pytz.UTC)
            utc_tm = dt.isoformat()
        else:
            raise ValueError('Time must be a datetime or astropy.Time object')

    return utc_tm
