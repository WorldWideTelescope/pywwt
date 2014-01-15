import numpy as np

def map_array_to_colors(arr, cmap, scale="linear",
                            vmin=None, vmax=None):
    import matplotlib.cm as mcm
    from matplotlib.colors import LogNorm, Normalize
    import struct

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

    colors = ["FF"+struct.pack('BBB',*color[:3]).encode('hex').upper()
              for color in colors]

    return colors

def generate_utc_times(num_steps, step_size, start_time=None):

    from datetime import datetime, timedelta
    from dateutil import tz

    if start_time is None:
        start_time = datetime.utcnow()
    else:
        utc_zone = tz.tzutc()
        local_zone = tz.tzlocal()
        # Tell the datetime object that it's in local time zone since
        # datetime objects are 'naive' by default
        local_time = start_time.replace(tzinfo=local_zone)
        # Convert time to UTC
        start_time = local_time.astimezone(utc_zone)

    time_arr = []
    new_time = start_time
    for i in xrange(num_steps):
        time_arr.append(new_time.strftime("%m/%d/%Y %I:%M:%S %p"))
        new_time += timedelta(**step_size)

    return time_arr

def convert_xyz_to_spherical(x, y, z, is_astro=True, ra_units="degrees"):
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
    coords[dec_name] = np.rad2deg(np.arccos(z/data["ALT"])) - 90.
    return coords



