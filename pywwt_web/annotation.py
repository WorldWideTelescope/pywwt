import uuid
from traitlets import Bool, Unicode, Float, HasTraits

# The WWT web control API is described here:
# https://worldwidetelescope.gitbooks.io/worldwide-telescope-web-control-script-reference/content/


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
    line_width = Float(1, help='Assigns line width (in pixels)').tag(wwt='linewidth', sync=True)
    radius     = Float(10, help='Sets the radius for the circle').tag(wwt='radius', sync=True)
    sky_relative = Bool(False, help='Whether the size of the circle is absolute or relative').tag(wwt='skyRelative', sync=True)

    def set_center(self, coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='circle_set_center', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)


class Poly(Annotation):

    shape = 'poly'

    fill = Bool(False, help='Whether or not the polygon should be filled').tag(wwt='fill', sync=True)
    fill_color = Unicode('white', help='Assigns fill color for the polygon').tag(wwt='fillColor', sync=True)
    line_color = Unicode('white', help='Assigns line color for the polygon').tag(wwt='lineColor', sync=True)
    line_width = Float(1, help='Assigns line width (in pixels)').tag(wwt='linewidth', sync=True)

    def add_point(self,coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='poly_add_point', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)


class PolyLine(Annotation):

    shape = 'polyLine'

    line_color = Unicode('white', help='Assigns polyline color').tag(wwt='lineColor', sync=True)
    line_width = Float(1, help='Assigns polyline width (in pixels)').tag(wwt='linewidth', sync=True)

    def add_point(self,coord):
        coord_icrs = coord.icrs
        self.parent._send_msg(event='polyLine_add_point', id=self.id,
                              ra=coord_icrs.ra.degree,
                              dec=coord_icrs.dec.degree)
