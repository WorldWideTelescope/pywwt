import uuid
from io import StringIO
from base64 import b64encode

from traitlets import HasTraits

from .traits import Unicode

__all__ = ['Layer', 'TableLayer']


class Layer(HasTraits):
    """
    Base class for layers which provides settings common to all layers.
    """

    def __init__(self, parent=None, **kwargs):

        super(Layer, self).__init__(**kwargs)

        self.parent = parent
        self.id = str(uuid.uuid4())

        if any(key not in self.trait_names() for key in kwargs):
            raise KeyError('a key doesn\'t match any layer trait name')

        self._initialize_layer()


class TableLayer(Layer):
    """
    A layer where the data is stored in an :class:`~astropy.table.Table`
    """

    longitude = Unicode(help='The column to use for the longitude')
    latitude = Unicode(help='The column to use for the latitude')
    altitude = Unicode(help='The column to use for the altitude')

    def __init__(self, parent=None, table=None, frame=None, **kwargs):

        # TODO: need to validate reference frame
        self.table = table
        self.frame = frame

        # Set default longitude/latitude column names
        self.longitude = self.table.colnames[0]
        self.latitude = self.table.colnames[0]

        # This has to come after setting self.table and self.frame
        super(TableLayer, self).__init__(parent=parent, **kwargs)

    @property
    def _table_b64(self):

        # TODO: We need to make sure that the table has ra/dec columns since
        # WWT absolutely needs that upon creation.

        s = StringIO()
        self.table.write(s, format='ascii.csv')
        s.seek(0)

        # Enforce Windows line endings
        # TODO: check if this needs to be different on Windows
        csv = s.read().replace('\n', '\r\n')

        return b64encode(csv.encode('ascii')).decode('ascii')

    def _initialize_layer(self):
        self.parent._send_msg(event='table_layer_create',
                              id=self.id, table=self._table_b64, frame=self.frame,
                              longitude=self.longitude, latitude=self.latitude,
                              altitude=self.altitude)
