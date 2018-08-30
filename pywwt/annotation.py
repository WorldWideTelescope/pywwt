import uuid
from traitlets import HasTraits, TraitError, validate
from astropy import units as u
from astropy.coordinates import concatenate, SkyCoord
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

    # more efficient method than CircleCollection of changing trait values?
    # should self.available be an object so tab-completion is possible?
    def __init__(self, parent, telescope, center, **kwargs):
        self.parent = parent
        # once the new gh-pages PR is accepted, uncomment replace what avail/dim
        # instruments = requests.get('https://worldwidetelescope.github.io/pywwt/instruments.json').json()
        # self.available = list(instruments.keys())
        # self.dim = list(instruments.values())
        
        self.available = ['k2', 'hst_acs_wfc', 'hst_wfc3_ir', 'hst_wfc3_uvis',
                          'jwst_nircam', 'jwst_niriss', 'spitzer_irac']
        # dimensions in arcsec, # of panels
        self.dim = {'_wfc3_uvis': [(162, 162), 2],
                    '_wfc3_ir': [(136, 123), 1], '_acs_wfc': [(202, 202), 2],
                    'jwst_nircam': [(129, 129), 1],
                    'jwst_nircam_small': [(64, 64), 4],
                    'jwst_niriss': [(133, 133), 1],
                    'spitzer_irac': [(312, 312), 3]}

        # list of IDs of annotations created in this FieldofView instance
        self.active = []
        self._gen_fov(telescope, center, **kwargs)

    def _gen_fov(self, telescope, center, **kwargs):
        # large footprints (e.g. k2) don't need center, so we confirm it exists
        if hasattr(center, 'ra'):
            # then save coords to variables
            ra = center.ra.value
            dec = center.dec.value
            
        telescope = telescope.lower()
        if telescope in self.available:
            if telescope[:3] == 'hst':
                instr = telescope[3:]
                instr_h = self.dim[instr][0][0]
                instr_w = self.dim[instr][0][1]
                panels = self.dim[instr][1]

                h = (instr_h * u.arcsec).to(u.deg).value / 2.
                w = (instr_w * u.arcsec).to(u.deg).value / 2.
                
                if panels > 1:
                    gap = (4 * u.arcsec).to(u.deg).value / 2.
                    w -= gap/2.
                else:
                    gap = -w/2.
                
                i = 0
                while i < panels:
                    if i == 1:
                        ra += w + gap

                    swap1 = 0.; swap2 = 0.
                    dec_pl = dec + h; dec_mn = dec - h
                    
                    # accounting for abs(dec +/- h) above 90 degrees
                    if abs(dec_pl) > 90:
                        dec_pl = 90. - (dec_pl - 90.)
                        swap1 = 180.
                    if abs(dec_mn) > 90:
                        dec_mn = -90. - (dec_mn + 90.)
                        swap2 = 180.

                    corners = concatenate((
                        SkyCoord(ra - gap + swap1,     dec_pl, unit='deg'),
                        SkyCoord(ra - gap - w + swap1, dec_pl, unit='deg'),
                        SkyCoord(ra - gap - w + swap2, dec_mn, unit='deg'),
                        SkyCoord(ra - gap + swap2,     dec_mn, unit='deg')))

                    annot = self.parent.add_polygon(corners, **kwargs)
                    self.active.append(annot)
                    i += 1
            elif telescope == 'k2':
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
                        #if index == '1':
                        ras = channels[str(index)]['corners_ra']
                        decs = channels[str(index)]['corners_dec']
                        corners = SkyCoord(ras, decs, unit=u.deg)

                        if self.parent.galactic_mode:
                            corners = corners.galactic

                        annot = self.parent.add_polygon(corners, **kwargs)
                        self.active.append(annot)
            elif telescope[:4] == 'jwst':
                side = self.dim[telescope][0][0]
                small = telescope + '_small'
                mid = (side * u.arcsec).to(u.deg).value / 2.

                swap1 = 0.; swap2 = 0.
                dec_mn = dec - mid; dec_pl = dec + mid                
                if abs(dec_mn) > 90:
                    dec_mn = -90. - (dec_mn + 90.)
                    swap2 = 180.
                if abs(dec_pl) > 90:
                    dec_pl = 90. - (dec_pl - 90.)
                    swap1 = 180.
                    
                corners = concatenate((
                        SkyCoord(ra - mid + swap2, dec_mn, unit='deg'),
                        SkyCoord(ra + mid + swap2, dec_mn, unit='deg'),
                        SkyCoord(ra + mid + swap1, dec_pl, unit='deg'),
                        SkyCoord(ra - mid + swap1, dec_pl, unit='deg')))

                annot = self.parent.add_polygon(corners, **kwargs)
                self.active.append(annot)
                
                if telescope[5:] == 'nircam':
                    self._small_recs(ra, dec, small, **kwargs)
            elif telescope[:7] == 'spitzer':
                side = (self.dim[telescope][0][0] * u.arcsec).to(u.deg).value
                panels = self.dim[telescope][1]
                mid = side / 2.
                gap = (1.52 * u.arcmin).to(u.deg).value / 2.

                y_panel = side + gap
                i = 0
                while(i < panels):
                    swap1 = 0.; swap2 = 0.
                    dec_mn = dec + y_panel - mid; dec_pl = dec + y_panel + mid
                    if abs(dec_mn) > 90:
                        # must check both cases for each dec b/c some panels
                        # can be entirely above/below a pole, in which case
                        # abs(dec) > 90 for both decs
                        if dec_mn < -90:
                            dec_mn = -90. - (dec_mn + 90.)
                        else: # dec_mn > 90
                            dec_mn = 90. - (dec_mn - 90.)
                        swap2 = 180.
                    if abs(dec_pl) > 90:
                        if dec_pl > 90:
                            dec_pl = 90. - (dec_pl - 90.)
                        else: # dec_pl < -90
                            dec_pl = -90. - (dec_mn + 90.)
                        swap1 = 180.
                    
                    corners = concatenate((
                        SkyCoord(ra - mid + swap2, dec_mn, unit='deg'),
                        SkyCoord(ra + mid + swap2, dec_mn, unit='deg'),
                        SkyCoord(ra + mid + swap1, dec_pl, unit='deg'),
                        SkyCoord(ra - mid + swap1, dec_pl, unit='deg')))

                    annot = self.parent.add_polygon(corners, **kwargs)
                    self.active.append(annot)

                    y_panel -= side + gap
                    i += 1
        else:
            raise ValueError('the given telescope\'s field of view is unavailable at this time')
        
    def _small_recs(self, ra, dec, telescope, **kwargs):
        side = self.dim[telescope][0][0]
        panels = self.dim[telescope][1]
        side = (side * u.arcsec).to(u.deg).value
        gap = (4 * u.arcsec).to(u.deg).value / 2.
        ex2 = (1 * u.arcsec).to(u.deg).value # for bottom
        ex1 = ex2 / 2. # for left and right

        i = 0
        while i <= 3:
            # top left corner for (ra, dec), tl, tr, br, bl
            # top left corner is reference point for each polygon
            if i % 2 == 0:
                tl_ra = ra + side + gap + ex1
            else:
                tl_ra = ra - gap - ex1
                
            if i <= 1:
                tl_dec = dec - gap
            else:
                tl_dec = dec + side + gap - ex2

            swap1 = 0.; swap2 = 0.
            dec_pl = tl_dec; dec_mn = tl_dec - side
            if abs(dec_pl) > 90:
                if dec_pl > 90:
                    dec_pl = 90. - (dec_pl - 90.)
                else: # dec_pl < -90
                    dec_pl = -90. - (dec_mn + 90.)
                    swap1 = 180.
            if abs(dec_mn) > 90:
                if dec_mn < -90:
                    dec_mn = -90. - (dec_mn + 90.)
                else: # dec_mn > 90
                    dec_mn = 90. - (dec_mn - 90.)
                    swap2 = 180.

            corners = concatenate((
                SkyCoord(tl_ra + swap1,        dec_pl, unit='deg'),
                SkyCoord(tl_ra - side + swap1, dec_pl, unit='deg'),
                SkyCoord(tl_ra - side + swap2, dec_mn, unit='deg'),
                SkyCoord(tl_ra + swap2,        dec_mn, unit='deg')))

            annot = self.parent.add_polygon(corners, **kwargs)
            self.active.append(annot)
            
            i += 1

    def remove(self):
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
