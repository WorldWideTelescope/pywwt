import uuid
from io import StringIO
from base64 import b64encode

from traitlets import HasTraits

from .traits import Unicode, Float, Color

__all__ = ['LayerManager', 'TableLayer']


class LayerManager(object):
    """
    A simple container for layers.
    """

    def __init__(self, parent=None):
        self._layers = []
        self._parent = parent

    def add_data_layer(self, table=None, frame='Sky', **kwargs):
        """
        Add a data layer to the current view

        Parameters
        ----------
        """
        if table is not None:
            layer = TableLayer(self._parent, table=table, frame=frame, **kwargs)
        else:
            # NOTE: in future we may allow different arguments such as e.g.
            # orbit=, hence why we haven't made this a positional argument.
            raise ValueError("The table argument is required")
        self._add_layer(layer)
        return layer

    def _add_layer(self, layer):
        if layer in self._layers:
            raise ValueError("layer already exists in layer manager")
        self._layers.append(layer)
        layer._manager = self

    def remove_layer(self, layer):
        if layer not in self._layers:
            raise ValueError("layer not in layer manager")
        layer.remove()
        # By this point, the call to remove() above may already have resulted
        # in the layer getting removed, so we check first if it's still present.
        if layer in self._layers:
            self._layers.remove(layer)

    def __len__(self):
        return len(self._layers)

    def __iter__(self):
        for layer in self._layers:
            yield layer

    def __getitem__(self, item):
        return self._layers[item]

    def __str__(self):
        if len(self) == 0:
            return 'Layer manager with no layers'
        else:
            s = 'Layer manager with {0} layers:\n\n'.format(len(self))
            for ilayer, layer in enumerate(self._layers):
                s += '  [{0}]: {1}\n'.format(ilayer, layer)
            return s

    __repr__ = __str__


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

        # Attribute to keep track of the manager, so that we can notify the
        # manager if a layer is removed.
        self._manager = None
        self._removed = False

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

    def remove(self):
        """
        Remove the layer.
        """
        if self._removed:
            return
        self.parent._send_msg(event='table_layer_remove', id=self.id)
        self._removed = True
        if self._manager is not None:
            self._manager.remove_layer(self)

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

    def __str__(self):
        return 'TableLayer with {0} markers'.format(len(self.table))

    def __repr__(self):
        return '<{0}>'.format(str(self))
