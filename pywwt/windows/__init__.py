__version__ = "0.2.0"

import logging
requests_log = logging.getLogger("requests")
requests_log.setLevel(logging.WARNING)

from pywwt.client import WWTClient
from pywwt.layer import WWTLayer
from pywwt.utils import \
    map_array_to_colors, \
    convert_xyz_to_spherical, \
    generate_utc_times, \
    write_data_to_csv