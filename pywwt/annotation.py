import uuid
from traitlets import HasTraits, TraitError
from astropy import units as u

from .traits import Bool, Float, Unicode, AstropyQuantity

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/

__all__ = ['Annotation', 'Circle', 'Polygon', 'Line']


class Annotation(HasTraits):

    shape = None

    label = Unicode(help='Contains descriptive text '
                         'for the annotation').tag(wwt='label')

    opacity = Float(help='Specifies the opacity to be applied to the '
                         'complete annotation').tag(wwt='opacity')

    hover_label = Bool(help='Specifies whether to render the label '
                            'if the mouse is hovering over the '
                            'annotation').tag(wwt='showHoverLabel')

    tag = Unicode(help='Contains a string for use by '
                       'the web client').tag(wwt='tag')

    def __init__(self, parent=None):
        super(Annotation, self).__init__()
        self.parent = parent
        self.observe(self._on_trait_change, type='change')
        self.id = str(uuid.uuid4())
        self.parent._send_msg(event='annotation_create', id=self.id, shape=self.shape)

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

    shape = 'circle'

    fill = Bool(False, help='Whether or not the circle should be filled').tag(wwt='fill', sync=True)
    fill_color = Unicode('white', help='Assigns fill color for the circle').tag(wwt='fillColor', sync=True)
    line_color = Unicode('white', help='Assigns line color for the circle').tag(wwt='lineColor', sync=True)
    line_width = AstropyQuantity(1 * u.pixel, help='Assigns line width (in pixels)').tag(wwt='lineWidth', sync=True)
    radius     = AstropyQuantity(10 * u.pixel, help='Sets the radius for the circle').tag(wwt='radius', sync=True)

    def set_center(self, coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='circle_set_center', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)

    def remove_annotation(self):
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if changed['name'] == 'radius':
            if changed['new'].unit.is_equivalent(u.pixel):
                self.parent._send_msg(event='annotation_set',
                                      id=self.id,
                                      setting='skyRelative',
                                      value=True)
                changed['new'] = changed['new'].to(u.pixel).value
            elif changed['new'].unit.is_equivalent(u.arcsec):
                self.parent._send_msg(event='annotation_set',
                                      id=self.id,
                                      setting='skyRelative',
                                      value=False)
                changed['new'] = changed['new'].to(u.arcsec).value
            else:
                raise TraitError('radius must be in pixel or arcsecond equivalent unit')
        if changed['name'] == 'line_width':
            if changed['new'].unit.is_equivalent(u.pixel):
                changed['new'] = changed['new'].to(u.pixel).value
            else:
                raise TraitError('line width must be in pixel equivalent unit')
        super(Circle, self)._on_trait_change(changed)


class Polygon(Annotation):

    shape = 'polygon'

    fill = Bool(False, help='Whether or not the polygon should be filled').tag(wwt='fill', sync=True)
    fill_color = Unicode('white', help='Assigns fill color for the polygon').tag(wwt='fillColor', sync=True)
    line_color = Unicode('white', help='Assigns line color for the polygon').tag(wwt='lineColor', sync=True)
    line_width = AstropyQuantity(1 * u.pixel, help='Assigns line width (in pixels)').tag(wwt='lineWidth', sync=True)

    def add_point(self,coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='polygon_add_point', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)

    def remove_annotation(self):
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if changed['name'] == 'line_width':
            if changed['new'].unit.is_equivalent(u.pixel):
                changed['new'] = changed['new'].to(u.pixel).value
            else:
                raise TraitError('line width must be in pixel equivalent unit')
        super(Polygon, self)._on_trait_change(changed)


class Line(Annotation):

    shape = 'line'

    line_color = Unicode('white', help='Assigns line color').tag(wwt='lineColor', sync=True)
    line_width = AstropyQuantity(1 * u.pixel, help='Assigns line width (in pixels)').tag(wwt='lineWidth', sync=True)

    def add_point(self,coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='line_add_point', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)

    def remove_annotation(self):
        self.parent._send_msg(event='remove_annotation', id=self.id)

    def _on_trait_change(self, changed):
        if changed['name'] == 'line_width':
            if changed['new'].unit.is_equivalent(u.pixel):
                changed['new'] = changed['new'].to(u.pixel).value
            else:
                raise TraitError('line width must be in pixel equivalent unit')
        super(Line, self)._on_trait_change(changed)
