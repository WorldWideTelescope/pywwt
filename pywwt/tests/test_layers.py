import pytest

from astropy.table import Table
from astropy import units as u

from ..qt import WWTQtClient
from .test_qt_widget import check_silent_output

from ..layers import TableLayer, guess_lon_lat_columns


class TestLayers:

    def setup_class(self):
        self.widget = WWTQtClient(block_until_ready=True)
        self.table = Table()
        self.table['flux'] = [2, 3, 4]
        self.table['dec'] = [4, 5, 6]
        self.table['ra'] = [1, 2, 3] * u.deg

    def test_add_and_remove_layer(self, capsys):

        assert len(self.widget.layers) == 0
        assert str(self.widget.layers) == 'Layer manager with no layers'
        layer1 = self.widget.layers.add_data_layer(table=self.table)
        assert len(self.widget.layers) == 1
        assert str(self.widget.layers) == ('Layer manager with 1 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n')

        layer2 = self.widget.layers.add_data_layer(table=self.table)

        assert len(self.widget.layers) == 2
        assert str(self.widget.layers) == ('Layer manager with 2 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n'
                                           '  [1]: TableLayer with 3 markers\n')

        assert self.widget.layers[0] is layer1
        assert self.widget.layers[1] is layer2

        # Test iteration
        for layer in self.widget.layers:
            assert isinstance(layer, TableLayer)

        layer1.remove()

        assert len(self.widget.layers) == 1
        assert str(self.widget.layers) == ('Layer manager with 1 layers:\n\n'
                                           '  [0]: TableLayer with 3 markers\n')

        self.widget.layers.remove_layer(layer2)

        assert len(self.widget.layers) == 0
        assert str(self.widget.layers) == 'Layer manager with no layers'

        self.widget.wait(1)
        # check_silent_output(capsys)

    def test_alt_unit(self):

        layer = self.widget.layers.add_data_layer(table=self.table)

        # Using a string
        layer.alt_unit = 'm'

        # Using a string of an imperial unit
        layer.alt_unit = 'inch'

        # Using an astropy unit
        layer.alt_unit = u.km

        # Using a unit that is equal but not identical to one of the accepted ones
        layer.alt_unit = u.def_unit('same_as_km', 1000 * u.m)

        # Using an invalid string
        with pytest.raises(ValueError) as exc:
            layer.alt_unit = 'banana'
        assert exc.value.args[0].strip() == "'banana' did not parse as unit: At col 0, banana is not a valid unit."

        # Using an unsupported unit
        with pytest.raises(ValueError) as exc:
            layer.alt_unit = u.kg
        assert exc.value.args[0].strip() == "alt_unit should be one of AU/Mpc/ft/inch/km/lyr/m/mi/pc"

        # Using a non-equal custom unit
        with pytest.raises(ValueError) as exc:
            layer.alt_unit = u.def_unit('same_as_half_km', 500 * u.m)
        assert exc.value.args[0].strip() == "alt_unit should be one of AU/Mpc/ft/inch/km/lyr/m/mi/pc"

    def test_lon_unit(self):

        layer = self.widget.layers.add_data_layer(table=self.table)

        # Using a string
        layer.lon_unit = 'deg'

        # Using an astropy unit
        layer.lon_unit = u.hourangle

        # Using a unit that is equal but not identical to one of the accepted ones
        layer.lon_unit = u.def_unit('same_as_deg', 3600 * u.arcsec)

        # Using an invalid string
        with pytest.raises(ValueError) as exc:
            layer.lon_unit = 'banana'
        assert exc.value.args[0].strip() == "'banana' did not parse as unit: At col 0, banana is not a valid unit."

        # Using an unsupported unit
        with pytest.raises(ValueError) as exc:
            layer.lon_unit = u.kg
        assert exc.value.args[0].strip() == "lon_unit should be one of deg/h/hourangle"

        # Using a non-equal custom unit
        with pytest.raises(ValueError) as exc:
            layer.lon_unit = u.def_unit('same_as_arcmin', 60 * u.arcsec)
        assert exc.value.args[0].strip() == "lon_unit should be one of deg/h/hourangle"

    def test_alt_type(self):

        layer = self.widget.layers.add_data_layer(table=self.table)

        layer.alt_type = 'depth'

        with pytest.raises(ValueError) as exc:
            layer.alt_type = 'time'
        assert exc.value.args[0].strip() == "alt_type should be one of depth/altitude/distance/seaLevel/terrain"

    def test_auto_alt_unit(self):

        self.table['altitude'] = [1, 4, 5] * u.au
        self.table['altitude2'] = [1, 4, 5] * u.def_unit('same_as_km', 1000 * u.m)
        self.table['flux'].unit = u.kg

        layer = self.widget.layers.add_data_layer(table=self.table)

        assert layer.alt_att == ''
        assert layer.alt_unit is None

        layer.alt_att = 'altitude'
        assert layer.alt_unit is u.au

        layer.alt_att = 'altitude2'
        assert layer.alt_unit is u.km

        expected_warning = ('Column flux has units of kg but this is not a '
                            'valid unit of altitude - set the unit directly with '
                            'alt_unit')

        with pytest.warns(UserWarning, match=expected_warning):
            layer.alt_att = 'flux'

    def test_auto_lon_unit(self):

        self.table['longitude'] = [1, 4, 5] * u.hour
        self.table['longitude2'] = [1, 4, 5] * u.def_unit('same_as_deg', 3600 * u.arcsec)
        self.table['flux'].unit = u.kg

        layer = self.widget.layers.add_data_layer(table=self.table)

        assert layer.lon_att == 'ra'
        assert layer.lon_unit is u.deg

        layer.lon_att = 'longitude'
        assert layer.lon_unit is u.hour

        layer.lon_att = 'longitude2'
        assert layer.lon_unit is u.deg

        expected_warning = ('Column flux has units of kg but this is not a '
                            'valid unit of longitude - set the unit directly with '
                            'lon_unit')

        with pytest.warns(UserWarning, match=expected_warning):
            layer.lon_att = 'flux'

    def test_update_data(self):

        self.table['flux'].unit = 'm'
        layer = self.widget.layers.add_data_layer(table=self.table,
                                                  lon_att='ra', lat_att='dec', alt_att='flux')

        assert layer.lon_att == 'ra'
        assert layer.lon_unit is u.deg
        assert layer.lat_att == 'dec'
        assert layer.alt_att == 'flux'
        assert layer.alt_unit is u.m

        # Replace with a table with the same column names but different units
        # for the lon and alt
        table = Table()
        table['ra'] = [1, 2, 3] * u.hourangle
        table['dec'] = [4, 5, 6]
        table['flux'] = [2, 3, 4] * u.km
        layer.update_data(table=table)

        assert layer.lon_att == 'ra'
        assert layer.lon_unit is u.hourangle
        assert layer.lat_att == 'dec'
        assert layer.alt_att == 'flux'
        assert layer.alt_unit is u.km

        # Replace with a table with different column names
        table = Table()
        table['a'] = [1, 2, 3] * u.deg
        table['b'] = [4, 5, 6]
        table['c'] = [2, 3, 4] * u.au
        layer.update_data(table=table)

        assert layer.lon_att == 'a'
        assert layer.lon_unit is u.deg
        assert layer.lat_att == 'b'
        assert layer.alt_att == ''


CASES = [[('flux', 'dec', 'ra'), ('ra', 'dec')],
         [('mass', 'lat', 'lon'), ('lon', 'lat')],
         [('a', 'lng', 'b', 'lat'), ('lng', 'lat')],
         [('flux', 'ra', 'radius', 'dec'), ('ra', 'dec')],
         [('FLUX', 'DECJ2000', 'RAJ2000'), ('RAJ2000', 'DECJ2000')],
         [('DISTANCE', 'LON1', 'LAT1'), ('LON1', 'LAT1')],
         [('flux', 'lng2', 'lat2', 'lng1', 'lat1'), (None, None)],
         [('ra', 'ra', 'dec'), (None, None)]]


@pytest.mark.parametrize(('colnames', 'expected'), CASES)
def test_guess_lon_lat_columns(colnames, expected):
    assert guess_lon_lat_columns(colnames) == expected
