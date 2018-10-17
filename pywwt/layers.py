import uuid
from io import BytesIO
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

    longigude = Unicode(help='The column to use for the longitude')
    latitude = Unicode(help='The column to use for the latitude')
    altitude = Unicode(help='The column to use for the altitude')

    def __init__(self, parent=None, table=None, frame=None, **kwargs):

        # TODO: need to validate reference frame
        self.table = table
        self.frame = frame

        # This has to come after setting self.table and self.frame
        super(TableLayer, self).__init__(parent=parent, **kwargs)

    @property
    def _table_b64(self):
        b = BytesIO()
        self.table.write(b, format='votable')
        b.seek(0)
        return b64encode(b.read()).decode('ascii')

    def _initialize_layer(self):
        self.parent._send_msg(event='table_layer_create',
                              id=self.id, table=self._table_b64, frame=self.frame)
