from astropy import units as u
from traitlets import HasTraits, validate

from .traits import Bool, Int

__all__ = ['SolarSystem']


class SolarSystem(HasTraits):
    """
    A supplemental class that enables tab-completion for settings
    associated with solar system mode.
    """

    def __init__(self, base_wwt_widget):
        super(SolarSystem, self).__init__()
        self.base_widget = base_wwt_widget
        self.observe(self._on_trait_change, type='change')
        self._tracked_obj_id = 0  # Default to tracking sun

    def _on_trait_change(self, changed):
        # This method gets called anytime a trait gets changed. Since this class
        # gets inherited by the Jupyter widgets class which adds some traits of
        # its own, we only want to react to changes in traits that have the wwt
        # metadata attribute (which indicates the name of the corresponding WWT
        # setting).
        wwt_name = self.trait_metadata(changed['name'], 'wwt')
        new_value = changed['new']
        if wwt_name is not None:
            if isinstance(new_value, u.Quantity):
                new_value = new_value.value

            self.base_widget._send_msg(event='setting_set',
                                       setting=wwt_name,
                                       value=new_value)

    # cmb = Bool(False, help='Whether to show the cosmic microwave background in solar system mode (`bool`)').tag(wwt='solarSystemCMB')
    cosmos = Bool(True, help='Whether to show data from the SDSS survey (`bool`)').tag(wwt='solarSystemCosmos')
    # display = Bool(False, help='Whether to show the solar system while in solar system mode (`bool`)').tag(wwt='solarSystemOverlays')
    lighting = Bool(True,
                    help='Whether to show the lighting effect of the Sun on the'
                         ' solar system (`bool`)').tag(wwt='solarSystemLighting')
    milky_way = Bool(True, help='Whether to show the galactic bulge in the '
                                'background in solar system mode '
                                '(`bool`)').tag(wwt='solarSystemMilkyWay')
    # multi_res = Bool(False, help='Whether to show the multi-resolution textures for planets where available (`bool`)').tag(wwt='solarSystemMultiRes')
    minor_orbits = Bool(False,
                        help='Whether to show the orbits of minor planets '
                             'in solar system mode (`bool`)').tag(wwt='solarSystemMinorOrbits')
    # minor_planets = Bool(False, help='Whether to show minor planets in solar system mode (`bool`)').tag(wwt='solarSystemMinorPlanets')
    orbits = Bool(True,
                  help='Whether to show orbit paths when the solar system is '
                       'displayed (`bool`)').tag(wwt='solarSystemOrbits')
    objects = Bool(True,
                   help='Whether to show the objects of the solar system in '
                        'solar system mode (`bool`)').tag(wwt='solarSystemPlanets')
    scale = Int(1, help='Specifies how to scale objects\' size in solar '
                        'system mode, with 1 as actual size and 100 as the '
                        'maximum (`int`)').tag(wwt='solarSystemScale')
    stars = Bool(True, help='Whether to show background stars in solar system '
                            'mode (`bool`)').tag(wwt='solarSystemStars')

    @validate('scale')
    def _validate_scale(self, proposal):
        if 1 <= proposal['value'] <= 100:
            return proposal['value']
        else:
            raise ValueError('scale takes integers from 1-100')

    def track_object(self, obj):
        """
        Focus the viewer on a particular object while in solar system mode.
        Available objects include the Sun, the planets, the Moon, Jupiter's
        Galilean moons, and Pluto.

        Parameters
        ----------
        obj : `str`
            The desired solar system object.
        """
        obj = obj.lower()
        mappings = {'sun': 0, 'mercury': 1, 'venus': 2, 'mars': 3, 'jupiter': 4,
                    'saturn': 5, 'uranus': 6, 'neptune': 7, 'pluto': 8,
                    'moon': 9, 'io': 10, 'europa': 11, 'ganymede': 12,
                    'callisto': 13, 'ioshadow': 14, 'europashadow': 15,
                    'ganymedeshadow': 16, 'callistoshadow': 17,
                    'suneclipsed': 18, 'earth': 19}

        if obj in mappings:
            self.base_widget._send_msg(event='track_object', code=mappings[obj])
            self._tracked_obj_id = mappings[obj]
        else:
            raise ValueError('the given object cannot be tracked')

    def _add_settings_to_serialization(self, wwt_state):

        for trait in self.traits().values():
            wwt_name = trait.metadata.get('wwt')
            if wwt_name:
                trait_val = trait.get(self)
                if isinstance(trait_val, u.Quantity):
                    trait_val = trait_val.value
                wwt_state['wwt_settings'][wwt_name] = trait_val

        wwt_state['view_settings']['tracked_object_id'] = self._tracked_obj_id
