import uuid
from traitlets import HasTraits, TraitError, validate
from astropy import units as u
from astropy.coordinates import concatenate, SkyCoord
#import json # OR
import requests

from .traits import (Color, ColorWithOpacity, Bool,
                     Float, Unicode, AstropyQuantity)

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

__all__ = ['Annotation', 'Circle', 'Polygon', 'Line']


class Annotation(HasTraits):
    """
    Base class for annotations which provides settings common to all shapes.
    """

    shape = None
    """
    To be specified in the individual shape classes.
    """

    label = Unicode('', help='Contains descriptive text '
                             'for the annotation (`str`)').tag(wwt='label')

    opacity = Float(1, help='Specifies the opacity to be applied to the '
                            'complete annotation (`int`)').tag(wwt='opacity')

    hover_label = Bool(False,
                       help='Specifies whether to render the label '
                            'if the mouse is hovering over the annotation '
                            '(`bool`)').tag(wwt='showHoverLabel')

    tag = Unicode(help='Contains a string for use by the web client '
                       '(`str`)').tag(wwt='tag')

    def __init__(self, parent=None, **kwargs):
        self.parent = parent
        self.observe(self._on_trait_change, type='change')
        self.id = str(uuid.uuid4())
        if all(key in self.trait_names() for key in kwargs):
            self.parent._send_msg(event='annotation_create',
                                  id=self.id, shape=self.shape)
            super(Annotation, self).__init__(**kwargs)
        else:
            raise KeyError('a key doesn\'t match any annotation trait name')

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            self.parent._send_msg(event='annotation_set',
                                  id=self.id,
                                  setting=wwt_name,
                                  value=changed['new'])


class Circle(Annotation):
    """
    A circular annotation.
    """

    shape = 'circle'
    """
    The name of the shape (:class:`str`).
    """

    fill = Bool(False, help='Whether or not the circle should be filled '
                            '(`bool`)').tag(wwt='fill')
    fill_color = ColorWithOpacity('white',
                                  help='Assigns fill color for the circle '
                                       '(`str` or `tuple`)').tag(wwt='fillColor')
    line_color = Color('white', help='Assigns line color for the circle '
                                     '(`str` or `tuple`)').tag(wwt='lineColor')
    line_width = AstropyQuantity(1*u.pixel,
                                 help='Assigns line width in pixels '
                                      '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')
    radius = AstropyQuantity(80*u.pixel,
                             help='Sets the radius for the circle '
                                  '(:class:`~astropy.units.Quantity`)').tag(wwt='radius')

    @validate('line_width')
    def _validate_linewidth(self, proposal):
        if proposal['value'].unit.is_equivalent(u.pixel):
            return proposal['value'].to(u.pixel)
        else:
            raise TraitError('line width must be in pixel equivalent unit')

    @validate('radius')
    def _validate_radius(self, proposal):
        if proposal['value'].unit.is_equivalent(u.pixel):
            return proposal['value'].to(u.pixel)
        elif proposal['value'].unit.is_equivalent(u.degree):
            return proposal['value'].to(u.degree)
        else:
            raise TraitError('radius must be in pixel or degree equivalent unit')

    def set_center(self, coord):
        """
        Set the center coordinates of the circle object.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The coordinates of the desired center of the circle.
        """
        coord_icrs = coord.icrs
        self.parent._send_msg(event='circle_set_center', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)

    def remove(self):
        """
        Removes the specified annotation from the current view.
        """
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if changed['name'] == 'radius':
            if changed['new'].unit.is_equivalent(u.pixel):
                self.parent._send_msg(event='annotation_set', id=self.id,
                                      setting='skyRelative', value=False)
            elif changed['new'].unit.is_equivalent(u.degree):
                self.parent._send_msg(event='annotation_set', id=self.id,
                                      setting='skyRelative', value=True)
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Circle, self)._on_trait_change(changed)


class Polygon(Annotation):
    """
    A polygon annotation.
    """

    shape = 'polygon'
    """
    The name of the shape (:class:`str`).
    """

    fill = Bool(False, help='Whether or not the polygon should be filled '
                            '(`bool`)').tag(wwt='fill')
    fill_color = ColorWithOpacity('white',
                                  help='Assigns fill color for the polygon '
                                       '(`str` or `tuple`)').tag(wwt='fillColor')
    line_color = Color('white', help='Assigns line color for the polygon '
                                     '(`str` or `tuple`)').tag(wwt='lineColor')
    line_width = AstropyQuantity(1*u.pixel,
                                 help='Assigns line width in pixels '
                                      '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

    @validate('line_width')
    def _validate_linewidth(self, proposal):
        if proposal['value'].unit.is_equivalent(u.pixel):
            return proposal['value'].to(u.pixel)
        else:
            raise TraitError('line width must be in pixel equivalent unit')

    def add_point(self, coord):
        """
        Add one or more points to a polygon object.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The coordinates of the desired point(s).
        """
        coord_icrs = coord.icrs
        if coord_icrs.isscalar: # if coord only has one point
            self.parent._send_msg(event='polygon_add_point', id=self.id,
                                  ra=coord_icrs.ra.degree,
                                  dec=coord_icrs.dec.degree)
        else:
            for point in coord_icrs:
                self.parent._send_msg(event='polygon_add_point', id=self.id,
                                      ra=point.ra.degree,
                                      dec=point.dec.degree)

    def remove(self):
        """
        Removes the specified annotation from the current view.
        """
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Polygon, self)._on_trait_change(changed)


class Line(Annotation):
    """
    A line annotation.
    """

    shape = 'line'
    """
    The name of the shape (:class:`str`).
    """

    color = ColorWithOpacity('white',
                             help='Assigns color for the line '
                                  '(`str` or `tuple`)').tag(wwt='lineColor')
    width = AstropyQuantity(1*u.pixel,
                            help='Assigns width for the line in pixels '
                                 '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

    @validate('width')
    def _validate_width(self, proposal):
        if proposal['value'].unit.is_equivalent(u.pixel):
            return proposal['value'].to(u.pixel)
        else:
            raise TraitError('width must be in pixel equivalent unit')

    def add_point(self, coord):
        """
        Add one or more points to a line object.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The coordinates of the desired point(s).
        """
        coord_icrs = coord.icrs
        if coord_icrs.isscalar: # if coord only has one point
            self.parent._send_msg(event='line_add_point', id=self.id,
                                  ra=coord_icrs.ra.degree,
                                  dec=coord_icrs.dec.degree)
        else:
            for point in coord_icrs:
                self.parent._send_msg(event='line_add_point', id=self.id,
                                      ra=point.ra.degree,
                                      dec=point.dec.degree)

    def remove(self):
        """
        Removes the specified annotation from the current view.
        """
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Line, self)._on_trait_change(changed)



class FieldOfView():
    """
    A collection of polygon annotations. Takes the name of a pre-loaded 
    telescope and displays its field of view.
    """
    # links for kepler. guide: https://keplerscience.arc.nasa.gov/k2-fields.html
    # footprint: https://raw.githubusercontent.com/KeplerGO/K2FootprintFiles/master/json/k2-footprint.json

    # should you be able to delete? change trait values?
    # should there be a list of polygons like in CircleCollection?
    # should self.available be an object so tab-completion is possible?
    def __init__(self, parent, telescope, **kwargs):
        self.parent = parent
        self.available = ['k2']
        self._gen_fov(telescope, **kwargs)

    def _gen_fov(self, telescope, **kwargs):
        telescope = telescope.lower()
        if telescope in self.available:
            if telescope == 'k2':
                # could also use requests.get if we don't want to store files:
                json_file = requests.get('https://github.com/KeplerGO/K2FootprintFiles/raw/master/json/k2-footprint.json')
                diction = json_file.json()
                #with open('fov_files/k2-footprint.json') as json_file:
                #    diction = json.load(json_file)
                # check python version. sys.version_info.major > 3, OR:
                try:
                    iter_diction = diction.items()
                except AttributeError:
                    iter_diction = diction.iteritems()
                for key, value in iter_diction:
                    channels = value['channels']
                    for index in channels:
                        #if index == '1':
                        ras = channels[str(index)]['corners_ra']
                        decs = channels[str(index)]['corners_dec']
                        corners = SkyCoord(ras, decs, unit=u.deg)

                        if self.parent.galactic_mode:
                            corners = corners.galctic
                        poly = Polygon(self.parent, **kwargs)
                        for coord in corners:
                            poly.add_point(coord)
        else:
            raise ValueError('the given telescope\'s field of view is unavailable at this time')
        

class CircleCollection():
    """
    A collection of circle annotations. Takes a set of several points
    (e.g. a column of SkyCoords from an astropy Table) to make generating
    several circles at once easier.
    """

    def __init__(self, parent, points, **kwargs):
        if len(points) <= 1e4:
            self.points = points
        else:
            raise IndexError('For performance reasons, only 10,000 '
                        'annotations can be added at once for the time being.')
        self.parent = parent
        self.collection = []
        self._gen_circles(self.points, **kwargs)

    def _set_all_attributes(self, name, value):
        for elem in self.collection:
            setattr(elem, name, value)

    def _get_all_attributes(self, name):
        values = []
        for elem in self.collection:
            attr = getattr(elem, name)
            if attr not in values:
                values.append(attr)
        if len(values) == 1:
            return values[0]
        else:
            return values

    def _gen_circles(self, points, **kwargs):
        for elem in points:
            circle = Circle(self.parent, **kwargs)
            circle.set_center(elem)
            self.collection.append(circle)

    def add_points(self, points, **kwargs):
        """
        Adds multiple points to the CircleCollection.
        """
        self._gen_circles(points, **kwargs)
        self.points = concatenate((self.points, points))

    def remove(self):
        """
        Removes all circles in the CircleCollection from view.
        """
        for elem in self.collection:
            elem.remove()

    # Circle.__dict__ attributes
    @property
    def fill(self):
        """
        Whether or not the circles in the CircleCollection have a fill.
        """
        return self._get_all_attributes('fill')

    @fill.setter
    def fill(self, value):
        return self._set_all_attributes('fill', value)

    @property
    def fill_color(self):
        """
        The fill color of the circles in the CircleCollection.
        """
        return self._get_all_attributes('fill_color')

    @fill_color.setter
    def fill_color(self, value):
        return self._set_all_attributes('fill_color', value)

    @property
    def line_color(self):
        """
        The line color of the circles in the CircleCollection.
        """
        return self._get_all_attributes('line_color')

    @line_color.setter
    def line_color(self, value):
        return self._set_all_attributes('line_color', value)

    @property
    def line_width(self):
        """
        The line width of the circles in the CircleCollection.
        """
        return self._get_all_attributes('line_width')

    @line_width.setter
    def line_width(self, value):
        return self._set_all_attributes('line_width', value)

    @property
    def radius(self):
        """
        The radii of the circles in the CircleCollection.
        """
        return self._get_all_attributes('radius')

    @radius.setter
    def radius(self, value):
        return self._set_all_attributes('radius', value)

    @property
    def shape(self):
        """
        The shapes comprising the CircleCollection (always 'circle').
        """
        return self._get_all_attributes('shape')

    # Annotation.__dict__ attributes
    @property
    def label(self):
        """
        Descriptive text for the CircleCollection.
        """
        return self._get_all_attributes('label')

    @label.setter
    def label(self, value):
        return self._set_all_attributes('label', value)

    @property
    def hover_label(self):
        """
        Whether to show a label when the mouse hovers over the CircleCollection.
        """
        return self._get_all_attributes('hover_label')

    @hover_label.setter
    def hover_label(self, value):
        return self._set_all_attributes('hover_label', value)

    @property
    def opacity(self):
        """
        The opacity of the circles in the CircleCollection.
        """
        return self._get_all_attributes('opacity')

    @opacity.setter
    def opacity(self, value):
        return self._set_all_attributes('opacity', value)

    @property
    def tag(self):
        """
        A string that can be used by the web client.
        """
        return self._get_all_attributes('tag')

    @tag.setter
    def tag(self, value):
        return self._set_all_attributes('tag', value)
