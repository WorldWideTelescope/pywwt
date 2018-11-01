import uuid
from io import StringIO
from base64 import b64encode

from traitlets import HasTraits

from .traits import Unicode, Float, Color

__all__ = ['TableLayer']


class TableLayer(HasTraits):
    """
    A layer where the data is stored in an :class:`~astropy.table.Table`
    """

    column_lon = Unicode(help='The column to use for the longitude').tag(wwt='lngColumn')
    column_lat = Unicode(help='The column to use for the latitude').tag(wwt='latColumn')
    column_alt = Unicode(help='The column to use for the altitude').tag(wwt='altColumn')
    column_cmap = Unicode(help='The column to use for the colormap').tag(wwt='colorMapColumn')
    column_size = Unicode(help='The column to use for the size').tag(wwt='sizeColumn')

    size_scalefactor = Float(1, help='The factor by which to scale the size of the points').tag(wwt='scaleFactor')

    color = Color('white', help='The color of the markers').tag(wwt='color')

    # TODO: support:
    # altType
    # xAxisColumn
    # yAxisColumn
    # zAxisColumn
    # xAxisReverse
    # yAxisReverse
    # zAxisReverse
    # color (for fixed color)

    def __init__(self, parent=None, table=None, frame=None, **kwargs):

        # TODO: need to validate reference frame
        self.table = table
        self.frame = frame

        self.parent = parent
        self.id = str(uuid.uuid4())

        self._initialize_layer()

        self.observe(self._on_trait_change, type='change')

        if any(key not in self.trait_names() for key in kwargs):
            raise KeyError('a key doesn\'t match any layer trait name')

        super(TableLayer, self).__init__(**kwargs)

        if 'column_lon' not in kwargs:
            self.column_lon = self.table.colnames[0]

        if 'column_lat' not in kwargs:
            self.column_lat = self.table.colnames[1]

    @property
    def _table_b64(self):

        # TODO: We need to make sure that the table has ra/dec columns since
        # WWT absolutely needs that upon creation.

        s = StringIO()
        self.table.write(s, format='ascii.basic', delimiter=',', comment=False)
        s.seek(0)

        # Enforce Windows line endings
        # TODO: check if this needs to be different on Windows
        csv = s.read().replace('\n', '\r\n')

        return b64encode(csv.encode('ascii', errors='replace')).decode('ascii')

    def _initialize_layer(self):
        self.parent._send_msg(event='table_layer_create',
                              id=self.id, table=self._table_b64, frame=self.frame)

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            # TODO: need to generalize to not say table here
            self.parent._send_msg(event='table_layer_set',
                                  id=self.id,
                                  setting=wwt_name,
                                  value=changed['new'])
