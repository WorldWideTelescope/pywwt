import uuid
from traitlets import HasTraits, TraitError, validate
from astropy import units as u
from astropy.coordinates import concatenate, SkyCoord
import numpy as np

from .traits import (Color, ColorWithOpacity, Bool,
                     Float, Unicode, AstropyQuantity)
from .utils import validate_traits

__all__ = ['Annotation', 'Circle', 'Polygon', 'Line', 'FieldOfView']


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

        # Check that all kwargs are valid -- throws error if not
        validate_traits(self, kwargs)

        self.parent._send_msg(event='annotation_create',
                              id=self.id, shape=self.shape)
        super(Annotation, self).__init__(**kwargs)

        self.parent._annotation_set.add(self)

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

    def _serialize_state(self):
        state = {'shape': self.shape,
                 'id': self.id,
                 'settings': {}}
        for trait in self.traits().values():
            wwt_name = trait.metadata.get('wwt')
            if wwt_name:
                trait_val = trait.get(self)
                if isinstance(trait_val, u.Quantity):
                    trait_val = trait_val.value
                state['settings'][wwt_name] = trait_val
        return state

    def remove(self):
        """
        Removes the specified annotation from the current view.
        """
        self.parent._send_msg(event='remove_annotation', id=self.id)
        self.parent._annotation_set.discard(self)


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
    line_width = AstropyQuantity(1 * u.pixel,
                                 help='Assigns line width in pixels '
                                      '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')
    radius = AstropyQuantity(80 * u.pixel,
                             help='Sets the radius for the circle '
                                  '(:class:`~astropy.units.Quantity`)').tag(wwt='radius')

    def __init__(self, parent=None, center=None, **kwargs):
        super(Circle, self).__init__(parent, **kwargs)
        if center:
            self.set_center(center)
        else:
            self._center = parent.get_center().icrs

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
        self._center = coord_icrs

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

    def _serialize_state(self):
        state = super(Circle, self)._serialize_state()
        state['settings']['skyRelative'] = self.radius.unit.is_equivalent(u.degree)
        state['center'] = {'ra': self._center.ra.deg,
                           'dec': self._center.dec.deg}
        return state


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
    line_width = AstropyQuantity(1 * u.pixel,
                                 help='Assigns line width in pixels '
                                      '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

    def __init__(self, parent=None, **kwargs):
        self._points = []
        super(Polygon, self).__init__(parent, **kwargs)

    @validate('line_width')
    def _validate_linewidth(self, proposal):
        if proposal['value'].unit.is_equivalent(u.pixel):
            return proposal['value'].to(u.pixel)
        else:
            raise TraitError('line width must be in pixel equivalent unit')

    def add_point(self, coord):
        """
        Add one or more points to a polygon object.

        If you want to fill the polygon, you should ensure that the vertices
        form a counter-clockwise polygon.

        Parameters
        ----------
        coord : `~astropy.units.Quantity`
            The coordinates of the desired point(s).
        """
        coord_icrs = coord.icrs
        if coord_icrs.isscalar:  # if coord only has one point
            self.parent._send_msg(event='polygon_add_point', id=self.id,
                                  ra=coord_icrs.ra.degree,
                                  dec=coord_icrs.dec.degree)
            self._points.append(coord_icrs)
        else:
            for point in coord_icrs:
                self.parent._send_msg(event='polygon_add_point', id=self.id,
                                      ra=point.ra.degree,
                                      dec=point.dec.degree)
                self._points.append(point)

    def _on_trait_change(self, changed):
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Polygon, self)._on_trait_change(changed)

    def _serialize_state(self):
        state = super(Polygon, self)._serialize_state()
        state['points'] = []
        for point in self._points:
            state['points'].append({'ra': point.ra.degree,
                                    'dec': point.dec.degree})
        return state


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
    width = AstropyQuantity(1 * u.pixel,
                            help='Assigns width for the line in pixels '
                                 '(:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

    def __init__(self, parent=None, **kwargs):
        self._points = []
        super(Line, self).__init__(parent, **kwargs)

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
        if coord_icrs.isscalar:  # if coord only has one point
            self.parent._send_msg(event='line_add_point', id=self.id,
                                  ra=coord_icrs.ra.degree,
                                  dec=coord_icrs.dec.degree)
            self._points.append(coord_icrs)
        else:
            for point in coord_icrs:
                self.parent._send_msg(event='line_add_point', id=self.id,
                                      ra=point.ra.degree,
                                      dec=point.dec.degree)
                self._points.append(point)

    def _on_trait_change(self, changed):
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Line, self)._on_trait_change(changed)

    def _serialize_state(self):
        state = super(Line, self)._serialize_state()
        state['points'] = []
        for point in self._points:
            state['points'].append({'ra': point.ra.degree,
                                    'dec': point.dec.degree})
        return state


class FieldOfView():
    """
    A collection of polygon annotations. Takes the name of a pre-loaded
    telescope and displays its field of view.
    """

    # a more efficient method than CircleCollection of changing trait values?

    def __init__(self, parent, telescope, center, rot, **kwargs):
        # make sure rot is astropy quantity in proper units for self._rotate()
        try:
            if not rot.unit.is_equivalent(u.deg):
                raise AttributeError
        except AttributeError:
            raise ValueError('rotate argument must be Astropy quantity with '
                             'degree or radian-equivalent units')

        # get the JSON list of FOVs from parent BaseWWTWidget class
        self.parent = parent
        self._available = self.parent.instruments.available
        self._entry = self.parent.instruments.entry

        # list of IDs of annotations created in this FieldofView instance
        self.active = []
        self._gen_fov(telescope, center, rot, **kwargs)

    def _gen_fov(self, telescope, center, rot, **kwargs):
        # test if telescope is available
        if telescope not in self._available:
            raise ValueError('the given telescope\'s field of view is '
                             'unavailable at this time')

        position = self._entry[telescope][0]
        dimensions = self._entry[telescope][-1]
        # dimensions is a list of lists, i.e. [ [[ras], [decs]], '', ...]

        # test that pos matches what the user entered
        if center and position == 'absolute':
            raise ValueError('the given telescope does not take center '
                             'coordinates')
        elif not center and position == 'relative':
            raise ValueError('the given telescope requires center coordinates')

        for panel in dimensions:
            ras = (panel[0] * u.deg).value
            decs = (panel[1] * u.deg).value

            # rotate points if necessary
            if position == 'relative' and rot != 0:
                ras, decs = self._rotate(ras, decs, rot)

            # translate points to user-specified location if relative
            if position == 'relative':
                center_ra = center.ra.to(u.deg).value
                center_dec = center.dec.to(u.deg).value

                decs = center_dec + decs
                # scale RA by dec (due to polar contraction of spherical coords)
                ras = center_ra + ras / np.cos(decs * u.deg).value

                # check that abs(dec) < 90. if not, adjust it, and then
                # set the corresponding ra to be swapped by 180
                for i, dec in enumerate(decs):
                    if abs(dec) > 90:
                        if dec < -90:
                            decs[i] = -90. - (dec + 90.)
                        else:  # dec > 90
                            decs[i] = 90. - (dec - 90.)
                        ras[i] += 180.

            corners = SkyCoord(ras, decs, unit=u.deg)
            if self.parent.galactic_mode:
                corners = corners.galactic

            # draw the panel
            annot = self.parent.add_polygon(corners, **kwargs)
            self.active.append(annot)

    def _rotate(self, ras, decs, rot):
        cos, sin = np.cos(rot).value, np.sin(rot).value
        ra_rot = ras * cos - decs * sin
        dec_rot = ras * sin + decs * cos

        return ra_rot, dec_rot

    def remove(self):
        """
        Removes the specified field of view from the viewer.
        """
        for annot in self.active:
            annot.remove()


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
            circle = Circle(self.parent, elem, **kwargs)
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
