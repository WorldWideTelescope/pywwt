import uuid
from traitlets import HasTraits, TraitError, validate
from astropy import units as u

from .traits import Color, ColorWithOpacity, Bool, Float, Unicode, AstropyQuantity

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

__all__ = ['Annotation', 'Circle', 'Polygon', 'Line']


class Annotation(HasTraits):
    """
    Base class for annotations which provides some settings common to all shapes.
    """

    shape = None

    label = Unicode('', help='Contains descriptive text '
                             'for the annotation').tag(wwt='label')

    opacity = Float(1, help='Specifies the opacity to be applied to the '
                            'complete annotation').tag(wwt='opacity')

    hover_label = Bool(False, help='Specifies whether to render the label '
                                   'if the mouse is hovering over the '
                                   'annotation').tag(wwt='showHoverLabel')

    tag = Unicode(help='Contains a string for use by '
                       'the web client').tag(wwt='tag')

    def __init__(self, parent=None, **kwargs):
        self.parent = parent
        self.observe(self._on_trait_change, type='change')
        self.id = str(uuid.uuid4())
        if all(key in self.trait_names() for key in kwargs):
            self.parent._send_msg(event='annotation_create', id=self.id, shape=self.shape)
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
    The name of the shape (:class:`str`)
    """

    fill = Bool(False, help='Whether or not the circle should be filled (:class:`bool`)').tag(wwt='fill')
    fill_color = ColorWithOpacity('white', help='Assigns fill color for the circle (:class:`str` or `tuple`)').tag(wwt='fillColor')
    line_color = Color('white', help='Assigns line color for the circle (:class:`str` or `tuple`)').tag(wwt='lineColor')
    line_width = AstropyQuantity(1 * u.pixel, help='Assigns line width in pixels (:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')
    radius     = AstropyQuantity(1 * u.pixel, help='Sets the radius for the circle (:class:`~astropy.units.Quantity`)').tag(wwt='radius')

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
            raise TraitError('radius must be in pixel or arcsec equivalent unit')

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
                self.parent._send_msg(event='annotation_set',
                                      id=self.id,
                                      setting='skyRelative',
                                      value=False)
            elif changed['new'].unit.is_equivalent(u.degree):
                self.parent._send_msg(event='annotation_set',
                                      id=self.id,
                                      setting='skyRelative',
                                      value=True)
        if isinstance(changed['new'], u.Quantity):
            changed['new'] = changed['new'].value

        super(Circle, self)._on_trait_change(changed)


class Polygon(Annotation):
    """
    A polygon annotation.
    """

    shape = 'polygon'
    """
    The name of the shape (:class:`str`)
    """

    fill = Bool(False, help='Whether or not the polygon should be filled (:class:`bool`)').tag(wwt='fill')
    fill_color = ColorWithOpacity('white', help='Assigns fill color for the polygon (:class:`str` or `tuple`)').tag(wwt='fillColor')
    line_color = Color('white', help='Assigns line color for the polygon (:class:`str` or `tuple`)').tag(wwt='lineColor')
    line_width = AstropyQuantity(1 * u.pixel, help='Assigns line width in pixels (:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

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
    The name of the shape (:class:`str`)
    """

    color = ColorWithOpacity('white', help='Assigns color for the line (:class:`str` or `tuple`)').tag(wwt='lineColor')
    width = AstropyQuantity(1 * u.pixel, help='Assigns width for the line in pixels (:class:`~astropy.units.Quantity`)').tag(wwt='lineWidth')

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
