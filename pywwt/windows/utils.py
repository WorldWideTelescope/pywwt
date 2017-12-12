import numpy as np
import csv
import matplotlib.cm as mcm
from matplotlib.colors import LogNorm, Normalize
import struct
from astropy.utils.console import ProgressBar
from datetime import datetime, timedelta
from dateutil import tz, parser
import codecs
import sys

def map_array_to_colors(arr, cmap, scale="linear",
                        vmin=None, vmax=None):
    r"""
    Map a NumPy array to a colormap using Matplotlib.

    :param arr: The array to be mapped onto a colormap.
    :type arr: NumPy array of floats
    :param cmap: The name of a Matplotlib colormap.
    :type cmap: string
    :param scale: The scaling of the data as mapped to the
        colormap. Takes "linear" or "log". Default: "linear"
    :type scale: string
    :param vmin: The value associated with the low end of the colormap.
        Default: the minimum value of *arr*.
    :type vmin: float
    :param vmax: The value associated with the high end of the colormap.
        Default: the maximum value of *arr*.
    :type vmax: float
    :returns: A list of colors, encoded in ARGB hex values.
    """
    if vmin is None:
        vmin = arr.min()
    if vmax is None:
        vmax = arr.max()

    if scale == "linear":
        norm = Normalize(vmin=vmin, vmax=vmax)
    elif scale == "log":
        norm = LogNorm(vmin=vmin, vmax=vmax)

    my_cmap = mcm.ScalarMappable(norm=norm, cmap=cmap)
    colors = my_cmap.to_rgba(arr, bytes=True)

    hex_colors = []
    
    for color in colors:
        hex_color = codecs.getencoder('hex')(struct.pack('BBB',*color[:3]))[0]
        hex_colors.append("FF"+hex_color.decode().upper())

    return hex_colors

def generate_utc_times(num_steps, step_size, start_time=None):
    r"""
    Generate a series of equally linearly spaced times in UTC.

    :param num_steps: The number of times to generate.
    :type num_steps: int
    :param step_size: A dictionary corresponding to the step size between
        the times, with keys referring to the unit (seconds,
        minutes, days, etc.) and the values of the step in that unit.
    :type step_size: dict
    :param start_time: A string corresponding to a time in the local time zone
        at which to start the timesteps. Default: the current system time.
        Formats (month/day/year):
        "1/1/2010 11:00:00 PM"
        "1/1/2010 11:30 AM"
        "1/1/2010 11 am"
        "1/1/2000"
        "1/2000"
    :type start_time: string, optional
    :returns: A list of formatted date/time strings in UTC readable by World Wide Telescope.
    """
    if start_time is None:
        start_time = datetime.utcnow()
    else:
        start_time = parser.parse(start_time)
        utc_zone = tz.tzutc()
        local_zone = tz.tzlocal()
        # Tell the datetime object that it's in local time zone since
        # datetime objects are 'naive' by default
        local_time = start_time.replace(tzinfo=local_zone)
        # Convert time to UTC
        start_time = local_time.astimezone(utc_zone)

    time_arr = []
    new_time = start_time
    for i in range(num_steps):
        time_arr.append(new_time.strftime("%m/%d/%Y %I:%M:%S %p"))
        new_time += timedelta(**step_size)

    return time_arr

def convert_xyz_to_spherical(x, y, z, is_astro=True, ra_units="degrees"):
    r"""
    Convert rectangular coordinates (x,y,z) to spherical coordinates
    (Lat, Lon, Alt) or (RA, Dec, Alt).

    :param x: The x-coordinates of the data.
    :type x: NumPy array of floats
    :param y: The y-coordinates of the data.
    :type y: NumPy array of floats
    :param z: The z-coordinates of the data.
    :type z: NumPy array of floats
    :param is_astro: Is the coordinate system astronomical (RA, Dec)
        or geographical (Lat, Lon)? Default: True
    :type is_astro: boolean, optional
    :param ra_units: The unit of the RA/Lon coordinate, "degrees" or
        "hours". Default: "degrees"
    :type ra_units: string, optional
    :returns: A dict of NumPy arrays corresponding to the positions in spherical coordinates.
    """
    if ra_units == "degrees" or not is_astro:
        ra_scale = 1.
    elif ra_units == "hours":
        ra_scale = 24./360.
    if is_astro:
        ra_name = "RA"
        dec_name = "DEC"
    else:
        ra_name = "LON"
        dec_name = "LAT"
    coords = {}
    coords["ALT"] = np.sqrt(x*x+y*y+z*z)
    coords[ra_name] = (np.rad2deg(np.arctan2(y, x)) + 180.)*ra_scale
    coords[dec_name] = np.rad2deg(np.arccos(z/coords["ALT"])) - 90.
    return coords

def write_data_to_csv(data, filename, mode="new"):
    r"""
    Write a dataset to a CSV-formatted file with a data header.

    :param data: The data to be written.
    :type data: dictionary of NumPy arrays
    :param filename: The filename to write the data to.
    :type filename: string
    :param mode:  Write a "new" file or "append" to an existing file?
        Default: "new"
    :type mode: string, optional
    """
    if mode == "new":
        fmode = "w"
    elif mode == "append":
        fmode = "a+"
    if sys.version_info >= (3,0,0):
        f = open(filename, fmode, newline='')
    else:
        f = open(filename, fmode+'b')
    w = csv.DictWriter(f, list(data.keys()))
    if mode == "new": w.writeheader()
    num_points = len(list(data.values())[0])
    for i in ProgressBar(list(range(num_points))):
        row = dict([(k,v[i]) for k,v in list(data.items())])
        w.writerow(row)
    f.close()




