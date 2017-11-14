from traitlets import Bool, HasTraits


class WWTModel(HasTraits):

    # TODO: need to add all settings
    constellation_figures = Bool(False, help='Whether to show the constellations').tag(wwt='showConstellationFigures', sync=True)

    def __init__(self):
        super(WWTModel, self).__init__()
        self.observe(self._on_trait_change, type='change')

    def _on_trait_change(self, changed):
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        if wwt_name is not None:
            self.send_msg(event='setting_set',
                          setting=wwt_name,
                          value=changed['new'])

    def center_on_coordinates(self, ra, dec, fov, instant=True):
        self.send_msg(event='center_on_coordinates',
                      ra=ra, dec=dec, fov=fov, instant=instant)
