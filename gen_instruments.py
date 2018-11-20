import json
import requests
from astropy import units as u

to_json = {}

def draw_rect(l, w, center):
    # get corners of a rectangle when given center plus its length and width
    ras = []; decs = []
    
    j = 0
    while(j < 4):
        # start from top right: (-+, ++, +-, --)
        if j % 3 != 0:
            ras.append(l/2. + center[0])
        else:
            ras.append(-l/2. + center[0])
        
        if j < 2:
            decs.append(w/2. + center[1])
        else:
            decs.append(-w/2. + center[1])

        j += 1

    return ras, decs

def draw_k2():
    # get file with k2 coordinates.
    # NOTE THAT THESE VALUES ARE IN DEGREES WHILE OTHER INSTS ARE IN ARCSECONDS
    ras = []; decs = []
    all_coords = []
    
    # navigation guide: https://keplerscience.arc.nasa.gov/k2-fields.html
    # footprint: the link below, or https://raw.githubusercontent.com/KeplerGO/K2FootprintFiles/master/json/k2-footprint.json
    json_file = requests.get('https://worldwidetelescope.github.io/pywwt/fov_files/k2-trimmed.json')
    diction = json_file.json()

    # check python version. sys.version_info.major > 3, OR:
    try:
        iter_diction = diction.items()
    except AttributeError:
        iter_diction = diction.iteritems()
        
    for key, value in iter_diction:
        channels = value['channels']
        for index in channels:
            ras = channels[str(index)]['corners_ra']
            decs = channels[str(index)]['corners_dec']
            all_coords.append([ras, decs])

    return all_coords


# dimensions here are in arcseconds for ease of entry (except for k2)
# they are converted to degrees in a later loop
instruments = {'hst_acs_wfc':   {'pos': 'relative', 'l': 202, 'w': 202,
                                 'build': 'curl', 'panels': 2, 'gap': [4, 0]},
               'hst_wfc3_uvis': {'pos': 'relative', 'l': 162, 'w': 162,
                                 'build': 'curl', 'panels': 2, 'gap': [4, 0]},
               'hst_wfc3_ir':   {'pos': 'relative', 'l': 136, 'w': 123,
                                 'build': 'curl', 'panels': 1, 'gap': None},
               'jwst_nircam':   {'pos': 'relative', 'l': 129, 'w': 129,
                                 'build': 'curl', 'panels': 1, 'gap': None},
               'nircam_small':  {'pos': 'relative', 'l': 64, 'w': 64,
                                 'build': 'curl', 'panels': 4, 'gap': [4.5, 4]},
               # confirm that the extra gaps added are correct
               'jwst_niriss':   {'pos': 'relative', 'l': 133, 'w': 133,
                                 'build': 'curl', 'panels': 1, 'gap': None},
               'spitzer_irac':  {'pos': 'relative', 'l': 312, 'w': 312,
                                 'build': 'stack', 'panels': 3, 'gap': [0, 91.2]
               },
               'k2':            {'pos': 'absolute'}
}

for inst, specs in instruments.items():
    # test that pos matches what the user entered
    if inst == 'k2':
        all_coords = draw_k2()
        to_json[inst] = [specs['pos'], all_coords]
        continue
        
    # convert measurements from arcseconds to degrees
    specs['l'] /= 3600.; specs['w'] /= 3600.
    if specs['gap']:
        specs['gap'] = [i/3600. for i in specs['gap']]
    
    all_coords = []
    center_x = 0; center_y = 0
    if specs['build'] == 'curl':
        # build the FOV in counter-clockwise 'C'-shape, beginning at top right
        # if there are only two points, leave center_y as 0
        if specs['panels'] == 2:
            center_x = specs['l']/2.
            if specs['gap']:
                center_x += specs['gap'][0]/2.

        # else, start with the coords for the center of the shape at top right
        # (standard number of shapes for 'curl' is 4)
        if specs['panels'] > 2:
            center_x = specs['l']/2.; center_y = specs['w']/2.
            if specs['gap']:
                center_x += specs['gap'][0]/2.; center_y += specs['gap'][1]/2.

    elif specs['build'] == 'stack':
        # build the FOV along the same vertical line from the bottom up,
        # adding vertical length and gap length to center_y with each iteration
        add = specs['l'] + specs['gap'][1]

        # the starting center changes based on whether there's an even or odd
        # number of panels and how many panels there are
        if specs['panels'] % 2 != 0:
            center_y = -add * (specs['panels'] % 2.)
        else:
            center_y = add/2. * (specs['panels'] % 2.)
            
    i = 0
    while i < specs['panels']:

        if specs['build'] == 'curl':
            if i % 3 != 0:
                center_x = abs(center_x)
            else:
                center_x = -abs(center_x)
        
            if i < 2:
                center_y = abs(center_y)
            else:
                center_y = -abs(center_y)
                if inst == 'nircam_small':
                    center_y -= .5

            coords = draw_rect(specs['l'], specs['w'], (center_x, center_y))
            all_coords.append([coords[0], coords[1]])
            # each set of coords for a shape should be a list within all_coords.
            # for a two-panel rectangular FOV, all_coords should contain
            # two len 2 lists. each of those should contain two len 4 lists.
            # in pyWWT, loop over interior lists instead of point-by-point!

        elif specs['build'] == 'stack':
            coords = draw_rect(specs['l'], specs['w'], (center_x, center_y))
            all_coords.append([coords[0], coords[1]])
            center_y += add

        i += 1

    to_json[inst] = [specs['pos'], all_coords]

#print(to_json['jwst_nircam'])
#print(to_json['nircam_small'])  # exemplars
#print(to_json['k2'])
with open('instruments.json', 'w') as output:
    json.dump(to_json, output, sort_keys=True)#, indent=2)
#full_json = json.dumps(to_json, sort_keys=True)#, indent=2)
#print(full_json)
