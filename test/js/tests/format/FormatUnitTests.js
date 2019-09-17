$package('js.tests.format');

js.tests.format.FormatUnitTests =
{
    testDateFormat: function() {
        var f = js.format.DateFormat;
        assertEquals('30-12-2008', f.format(new Date(2008, 11, 30)));
        var d = f.parse('30-12-2008');
        // date parsing leave time part unspecified
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        assertTheSame(new Date(2008, 11, 30), d);
        assertNull(f.parse(''));

        assertAssertion(f, 'format');
        assertAssertion(f, 'format', null);
        assertAssertion(f, 'format', '');
        assertAssertion(f, 'format', {});
        assertAssertion(f, 'parse');
        assertAssertion(f, 'parse', null);
    },

    testTimeFormat: function() {
        var f = js.util.TimeFormat;
        assertEquals('13:46:55', f.format(new Date(0, 0, 0, 13, 46, 55)));
        var d = f.parse('13:46:55');
        // time parsing leave date part unspecified
        assertEquals(13, d.getHours());
        assertEquals(46, d.getMinutes());
        assertEquals(55, d.getSeconds());
        assertNull(f.parse(''));

        assertAssertion(f, 'format');
        assertAssertion(f, 'format', null);
        assertAssertion(f, 'format', '');
        assertAssertion(f, 'format', {});
        assertAssertion(f, 'parse');
        assertAssertion(f, 'parse', null);
    },

    testDateTimeFormat: function() {
        var f = js.util.DateTimeFormat;
        assertEquals('30-12-2008 13:46:55', f.format(new Date(2008, 11, 30, 13, 46, 55)));
        assertTheSame(new Date(2008, 11, 30, 13, 46, 55), f.parse('30-12-2008 13:46:55'));
        assertNull(f.parse(''));

        assertAssertion(f, 'format');
        assertAssertion(f, 'format', null);
        assertAssertion(f, 'format', '');
        assertAssertion(f, 'format', {});
        assertAssertion(f, 'parse');
        assertAssertion(f, 'parse', null);
    },

    testUrlFormat: function() {
        var f = js.util.UrlFormat;

        assertEquals('http://bbnet.ro', f.format(f.parse('http://bbnet.ro')));
        assertEquals('http://bbnet.ro', f.format(f.parse(' http://bbnet.ro ')));
        assertEquals('http://bbnet.xx', f.format(f.parse('http://bbnet.xx')));
        assertEquals('https://bbnet.ro', f.format(f.parse('https://bbnet.ro')));
        assertEquals('http://bbnet.ro/get?id=1', f.format(f.parse('http://bbnet.ro/get?id=1')));
        assertEquals('http://bbnet.ro/get?id=1&type=string', f.format(f.parse('http://bbnet.ro/get?id=1&type=string')));

        var invalidUrls = ['', ' ', 'ftp://bbnet.ro', 'http://bbnet.xxx', 'http://bbnet.con', 'http://bbnet.ro/get?id=1&type=string!'];
        for (i = 0; i < invalidUrls.length; i++) {
            assertNull(f.parse(invalidUrls[i]));
        }
    },

    testEmailFormat: function() {
        var f = js.util.EmailFormat;

        assertTrue(f.test('iuli@bbnet.ro'));
        assertFalse(f.test('iuli@bbnetro'));
        assertEquals('iuli@bbnet.ro', f.format(f.parse('iuli@bbnet.ro')));
        assertEquals('iuli@bbnet.ro', f.format(f.parse(' iuli@bbnet.ro ')));
        assertEquals('mr.iulianrotaru@yahoo.com', f.format(f.parse('mr.iulianrotaru@yahoo.com')));
        assertEquals('mr-iulianrotaru@yahoo.com', f.format(f.parse('mr-iulianrotaru@yahoo.com')));

        var invalidEmails = ['', ' ', 'iuli@bbnet', 'iuli bbnet.ro', 'mr.iulian.rotaru@yahoo.com', 'mr*iulian@yahoo.com', 'iuli@bbnet.xxx'];
        for (i = 0; i < invalidEmails.length; i++) {
            assertNull(f.parse(invalidEmails[i]));
        }
    },

    testPhoneFormat: function() {
        var f = js.util.PhoneFormat;

        var validPhones = ['0232 260314', '0232260314', '232260314', '232-260314', '0232.260.314'];
        for (var i = 0; i < validPhones.length; i++) {
            assertEquals('0232 - 260314', f.format(f.parse(validPhones[i])));
        }

        var invalidPhones = ['+40 (232) 211251', '0232,211251', '0232 21125A', '821556677', '921'];
        for (i = 0; i < invalidPhones.length; i++) {
            assertNull(f.parse(invalidPhones[i]));
        }
    },

    testUserDefinedDateFormatInstance: function() {
        var df1 = new js.util.DatesFormat(
        {
            format: '%4M %2d, %2y',
            pattern: /^\s*(\w+) (\d{2}), (\d{4})\s*$/g
        });
        var df2 = new js.util.DatesFormat('%4M %2d, %2y', /^\s*(\w+) (\d{2}), (\d{4})\s*$/g);

        [df1, df2].forEach(function(df) {
            assertEquals('December 30, 2008', df.format(new Date(2008, 11, 30)));
            assertTrue(df.test('December 30, 2008'));
            assertFalse(df.test('December 30. 2008'));
            var d = df.parse('December 30, 2008');
            // date parsing leave time part unspecified
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            assertTheSame(new Date(2008, 11, 30), d);
        }, this);
    },

    testWriteOnlyUserDefinedDateFormatInstance: function() {
        var df = new js.util.DatesFormat('%4M %2d, %2y');
        assertEquals('December 30, 2008', df.format(new Date(2008, 11, 30)));
    }
};
TestCase.register('js.tests.format.FormatUnitTests');
