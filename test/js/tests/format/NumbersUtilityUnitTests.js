$package('js.tests.format');

js.tests.format.NumbersUtilityUnitTests =
{
    before: function() {
        this._setRegional('en', 'US');
    },

    testFormat: function() {
        var nf = new js.format.NumberFormat();
        assertEquals('123.45', nf.format(123.45));

        nf.setGroupingUsed(true);
        assertEquals('12,345.67', nf.format(12345.67));

        nf.setMinimumFractionDigits(4);
        assertEquals('12,345.6700', nf.format(12345.67));

        nf.setMaximumFractionDigits(3);
        assertEquals('12,345.679', nf.format(12345.6789));

        nf.setMinimumIntegerDigits(4);
        assertEquals('0,123.450', nf.format(123.45));

        nf.setMinimumIntegerDigits(6);
        nf.setMaximumFractionDigits(0);
        assertEquals('000,123', nf.format(123.49));
        assertEquals('000,124', nf.format(123.5));
        assertEquals('000,124', nf.format(123.51));
        nf.setGroupingUsed(false);
        assertEquals('000123', nf.format(123.49));
        assertEquals('000124', nf.format(123.5));
        assertEquals('000124', nf.format(123.51));
    },

	testFixedNumberOfFractionDigits: function() {
        var nf = new js.format.NumberFormat();
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        assertEquals('123.00', nf.format(123.0049));
        assertEquals('123.01', nf.format(123.005));
        assertEquals('124.00', nf.format(123.995));
	},

    testSanityCheck: function() {
        var nf = new js.format.NumberFormat();
        assertTrue(nf.test('123'));
        assertTrue(nf.test('+123'));
        assertTrue(nf.test('-123'));

        assertTrue(nf.test('123000'));
        assertTrue(nf.test('123000.9'));
        nf.setGroupingUsed(true);
        assertTrue(nf.test('123,000'));
        assertTrue(nf.test('123,000.9'));

        nf = new js.format.NumberFormat('# km/h');
        assertTrue(nf.test('160 km/h'));
        assertTrue(nf.test('160 KM/H'));
        assertTrue(nf.test('160.55 km/h'));
        nf.setGroupingUsed(true);
        assertTrue(nf.test('0,160.55 km/h'));

        nf = new js.format.NumberFormat('bucăţi: #');
        assertTrue(nf.test('bucăţi: 45'));
        assertTrue(nf.test('BUCĂŢI: 45'));
        assertTrue(nf.test('bucăţi: 45.00'));
        nf.setGroupingUsed(true);
        assertTrue(nf.test('bucăţi: 12,345.00'));
    },

    testInsanityCheck: function() {
        var nf = new js.format.NumberFormat();
        assertFalse(nf.test(null));
        assertFalse(nf.test(''));
        // if grouping is not used locale specific grouping symbol is not allowed
        assertFalse(nf.test('123,000'));
        assertFalse(nf.test('123e+3'));
        assertFalse(nf.test('O1'));
    },

    testParse: function() {
        var nf = new js.format.NumberFormat();
        assertEquals(123, nf.parse('123'));
        assertEquals(123, nf.parse('123.0'));
        assertEquals(123, nf.parse('0123.0'));

        assertEquals(123, nf.parse('+123'));
        assertEquals(123, nf.parse('+123.0'));
        assertEquals(123, nf.parse('+0123.0'));

        assertEquals(-123, nf.parse('-123'));
        assertEquals(-123, nf.parse('-123.0'));
        assertEquals(-123, nf.parse('-0123.0'));

        assertEquals(123.45, nf.parse('123.45'));
        assertEquals(-123.45, nf.parse('-123.45'));
        assertEquals(123.45, nf.parse('+123.45'));

        nf.setGroupingUsed(true);
        assertEquals(1234567890, nf.parse('1234567890'));
        assertEquals(1234567890, nf.parse('1,234,567,890'));
    },

    testLocale: function() {
        var nf = new js.format.NumberFormat().setGroupingUsed(true);
        assertEquals('12,345.6789', nf.format(12345.6789));
        nf = new js.format.NumberFormat('# mile/h').setGroupingUsed(true);
        assertTrue(nf.test('0,160.55 mile/h'));

        this._setRegional('ro', 'RO');
        var nf = new js.format.NumberFormat().setGroupingUsed(true);
        assertEquals('12.345,6789', nf.format(12345.6789));
        nf = new js.format.NumberFormat('bucăţi: #').setGroupingUsed(true);
        assertTrue(nf.test('bucăţi: 12.345,00'));
    },

    testInjectNumericPart: function() {
        var nf = new js.format.NumberFormat('# mile/hour');
        assertEquals('0,123.45 mile/hour', nf._injectNumericPart('0,123.45'));
        nf = new js.format.NumberFormat('bucăţi: #');
        assertEquals('bucăţi: 123.00', nf._injectNumericPart('123.00'));
    },

    testExtractNumericPart: function() {
        var nf = new js.format.NumberFormat('# mile/hour');
        assertEquals('0,123.45', nf._extractNumericPart('0,123.45 mile/hour'));
        nf = new js.format.NumberFormat('bucăţi: #');
        assertEquals('123.00', nf._extractNumericPart('bucăţi: 123.00'));
    },

    testReusability: function() {
        var nf = new js.format.NumberFormat();
        for (var i = 0; i < 10; ++i) {
            assertEquals('123.45', nf.format(123.45));
            assertTrue(nf.test('123.45'));
            assertEquals(123.45, nf.parse('123.45'));
        }

        nf = new js.format.NumberFormat('pre # post');
        for (i = 0; i < 10; ++i) {
            assertEquals('pre 123.45 post', nf.format(123.45));
            assertTrue(nf.test('pre 123.45 post'));
            assertEquals(123.45, nf.parse('pre 123.45 post'));
		}
    },

    _setRegional: function(language, country) {
        js.ua.Regional.language = language;
        js.ua.Regional.country = country;
    }
};
TestCase.register('js.tests.format.NumbersUtilityUnitTests');
