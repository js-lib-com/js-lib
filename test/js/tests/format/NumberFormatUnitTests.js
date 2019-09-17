$package('js.tests.format');

js.tests.format.NumberFormatUnitTests = {
    testNumber : function () {
        this._setRegional('en', 'US');
        var f = new js.format.Number();
        assertEquals('1,234.56', f.format(1234.56));
        assertTrue(f.test('1,234.56'));
        assertEquals(1234.56, f.parse('1,234.56'));

        this._setRegional('ro', 'RO');
        f = new js.format.Number();
        assertEquals('1.234,56', f.format(1234.56));
        assertTrue(f.test('1.234,56'));
        assertEquals(1234.56, f.parse('1.234,56'));
    },

    _testPercent : function () {
        this._setRegional('en', 'US');
        var f = new js.format.Percent();
        assertEquals('1,234.56%', f.format(12.3456));
        assertTrue(f.test('1,234.56%'));
        assertEquals(12.3456, f.parse('1,234.56%'));

        this._setRegional('ro', 'RO');
        f = new js.format.Percent();
        assertEquals('1.234,56%', f.format(12.3456));
        assertTrue(f.test('1.234,56%'));
        assertEquals(12.3456, f.parse('1.234,56%'));
    },

    testTestMissingPercent : function () {
        this._setRegional('en', 'US');
        var f = new js.format.Percent();
        assertFalse(f.test('1,234.56'));
        assertAssertion(f, 'parse', '1.234,56');
        $assert.disable();
        assertEquals(0, f.parse('1.234,56'));
    },

    _testCurrency : function () {
        this._setRegional('en', 'US');
        var f = new js.format.Currency();
        assertEquals('$1,234.56', f.format(1234.56));
        assertTrue(f.test('$1,234.56'));
        assertEquals(1234.56, f.parse('$1,234.56'));

        this._setRegional('ro', 'RO');
        f = new js.format.Currency();
        assertEquals('1.234,56 LEI', f.format(1234.56));
        assertTrue(f.test('1.234,56 LEI'));
        assertEquals(1234.56, f.parse('1.234,56 LEI'));
    },

    testFileSize : function () {
        this._setRegional('en', 'US');
        var f = new js.format.FileSize();

        assertEquals('0.00 B', f.format(0));
        assertEquals('1,023.00 B', f.format(1023));
        assertEquals('1.00 KB', f.format(1024));
        assertEquals('1.00 KB', f.format(1025));
        assertEquals('1.21 KB', f.format(1234));
        assertEquals('0.00 B', f.format(0));
        assertEquals('1,024.00 KB', f.format(1048575));
        assertEquals('1.00 MB', f.format(1048576));
        assertEquals('1.00 MB', f.format(1048577));
        assertEquals('1,024.00 MB', f.format(1073741823));
        assertEquals('1.00 GB', f.format(1073741824));
        assertEquals('1.00 GB', f.format(1073741825));
        assertEquals('1,024.00 GB', f.format(1099511627775));
        assertEquals('1.00 TB', f.format(1099511627776));
        assertEquals('1.00 TB', f.format(1099511627777));

        assertTrue(f.test('1.00 B'));
        assertTrue(f.test('1,023.00 b'));
        assertTrue(f.test('1.00 KB'));
        assertTrue(f.test('1,023.00 kb'));
        assertTrue(f.test('1.00 MB'));
        assertTrue(f.test('1,023.00 mb'));
        assertTrue(f.test('1.00 GB'));
        assertTrue(f.test('1,023.00 gb'));
        assertTrue(f.test('1.00 TB'));
        assertTrue(f.test('1,023.00 tb'));

        assertEquals(1, f.parse('1.00 B'));
        assertEquals(1023, f.parse('1,023.00 b'));
        assertEquals(1024, f.parse('1.00 KB'));
        assertEquals(1048576, f.parse('1.00 MB'));
        assertEquals(1073741824, f.parse('1.00 GB'));
        assertEquals(1099511627776, f.parse('1.00 TB'));
    },

    testBitRate : function () {
        this._setRegional('en', 'US');
        var f = new js.format.BitRate();

        assertEquals('0.00 bps', f.format(0));
        assertEquals('999.00 bps', f.format(999));
        assertEquals('1.00 Kbps', f.format(1000));
        assertEquals('1.00 Kbps', f.format(1001));
        assertEquals('1.23 Kbps', f.format(1234));
        assertEquals('999.00 Kbps', f.format(999000));
        assertEquals('999.90 Kbps', f.format(999900));
        assertEquals('999.99 Kbps', f.format(999990));
        assertEquals('999.99 Kbps', f.format(999994));
        assertEquals('1.00 Mbps', f.format(999995));
        assertEquals('1.00 Mbps', f.format(1000000));
        assertEquals('1.00 Mbps', f.format(1000001));
        assertEquals('1.00 Mbps', f.format(1004999));
        assertEquals('1.01 Mbps', f.format(1005000));
        assertEquals('999.00 Mbps', f.format(999000000));
        assertEquals('999.90 Mbps', f.format(999900000));
        assertEquals('999.99 Mbps', f.format(999990000));
        assertEquals('999.99 Mbps', f.format(999994999));
        assertEquals('1.00 Gbps', f.format(999995000));
        assertEquals('1.00 Gbps', f.format(1000000000));
        assertEquals('1.00 Tbps', f.format(999995000000));
        assertEquals('1.00 Tbps', f.format(1000000000000));

        assertTrue(f.test('1.00 bps'));
        assertTrue(f.test('1.00 BPS'));
        assertTrue(f.test('1,023.00 bps'));
        assertTrue(f.test('1.00 Kbps'));
        assertTrue(f.test('1,023.00 KBPS'));
        assertTrue(f.test('1.00 Mbps'));
        assertTrue(f.test('1,023.00 mBPS'));
        assertTrue(f.test('1.00 Gbps'));
        assertTrue(f.test('1,023.00 gbps'));
        assertTrue(f.test('1.00 Tbps'));
        assertTrue(f.test('1,023.00 Tbps'));

        assertEquals(1, f.parse('1.00 bps'));
        assertEquals(1000, f.parse('1.00 Kbps'));
        assertEquals(1000000, f.parse('1.00 Mbps'));
        assertEquals(1000000000, f.parse('1.00 Gbps'));
        assertEquals(1000000000000, f.parse('1.00 Tbps'));
        assertEquals(999, f.parse('999.00 bps'));
        assertEquals(990, f.parse('0.99 Kbps'));
        assertEquals(1230, f.parse('1.23 Kbps'));
    },

    _setRegional : function (language, country, timeZone) {
        js.ua.Regional.language = language;
        if (country) {
            js.ua.Regional.country = country;
        }
        if (timeZone) {
            js.ua.Regional.timeZone = timeZone;
        }
    }
};
TestCase.register('js.tests.format.NumberFormatUnitTests');
