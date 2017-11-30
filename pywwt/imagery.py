from io import BytesIO
from collections import OrderedDict
from xml.etree.ElementTree import ElementTree

import requests


def get_imagery_layers(url):
    """
    Get the list of available image layers that can be used as background
    or foreground based on the URL to a WTML (WorldWide Telescope image
    collection file).
    """

    available_layers = OrderedDict()

    # Get the XML describing the available surveys
    response = requests.get(url)
    assert response.ok
    b = BytesIO(response.content)
    e = ElementTree()
    t = e.parse(b)

    # For now only look at the ImageSets at the root of the
    # XML since these seem to be the main surveys.
    for survey in t.findall('ImageSet'):
        name = survey.attrib['Name']
        thumbnail_url = survey.find('ThumbnailUrl').text
        if not thumbnail_url:
            thumbnail_url = None
        available_layers[name] = {'thumbnail': thumbnail_url}

    return available_layers
