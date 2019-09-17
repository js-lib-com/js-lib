$package('js.tests.ua');

js.tests.ua.Cookies =
{
    beforeClass: function() {
        this.savedSetter = js.ua.Cookies._setCookie;
        this.savedGetter = js.ua.Cookies._getCookies;
    },

    afterClass: function() {
        js.ua.Cookies._setCookie = this.savedSetter;
        js.ua.Cookies._getCookies = this.savedGetter;
    },

    testIsNameValid: function() {
        var invalideNames = [undefined, null, '', 'comment', 'expires', 'max-age', 'path', 'domain', 'secure', 'version', '$name', 'na me', 'na\tme', 'na\nme', 'na=me', 'na;me', 'name ', 'name\t', 'name\n', 'name\r'];
        for (var i = 0; i < invalideNames.length; ++i) {
            assertFalse(js.ua.Cookies.isValidName(invalideNames[i]));
        }
    },

    testIsValueValid: function() {
        var invalideValues = [undefined, null, '', 'value ; more', ';value', 'value;'];
        for (var i = 0; i < invalideValues.length; ++i) {
            assertFalse(js.ua.Cookies.isValidValue(invalideValues[i]));
        }
    },

    testSet: function() {
        var concrete;
        js.ua.Cookies._setCookie = function(cookie) {
            concrete = cookie;
        };
        var expires = new Date(2064, 2, 15, 13, 40, 0);
        function assert(expected, name, value, expires, path, domain, secure) {
            concrete = null;
            js.ua.Cookies.set(name, value, expires, path, domain, secure);
            if (js.ua.Engine.TRIDENT) {
                // IE uses UTC instead of GMT for Greenwich time zone
                expected = expected.replace('GMT', 'UTC');
            }
            assertEquals(expected, concrete);
        }
        assert('name=value; comment=j(s)-lib-s', 'name', 'value');
        assert('name=value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT', 'name', 'value', expires);
        assert('name=value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home', 'name', 'value', expires, '/home');
        assert('name=value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home; domain=js-lib.com', 'name', 'value', expires, '/home', 'js-lib.com');
        assert('name=value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home; domain=js-lib.com', 'name', 'value', expires, '/home', 'js-lib.com', false);
        assert('name=value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home; domain=js-lib.com; secure', 'name', 'value', expires, '/home', 'js-lib.com', true);

        assert('name=true; comment=j(s)-lib-b', 'name', true);
        assert('name=1234.56; comment=j(s)-lib-n', 'name', 1234.56);
        if (js.ua.Engine.TRIDENT) {
            // IE has no milliseconds
            assert('name=%221964-03-15T13%3A40%3A00Z%22; comment=j(s)-lib-d', 'name', new Date(Date.UTC(1964, 2, 15, 13, 40, 0, 0)));
        }
        else {
            assert('name=%221964-03-15T13%3A40%3A00.000Z%22; comment=j(s)-lib-d', 'name', new Date(Date.UTC(1964, 2, 15, 13, 40, 0, 0)));
        }
        assert('name=%7B%22name%22%3A%22John%20Doe%22%7D; comment=j(s)-lib-o', 'name',
        {
            name: 'John Doe'
        });
        assert('name=%5B1%2C2%5D; comment=j(s)-lib-a', 'name', [1, 2]);
    },

    testBadSet: function() {
        assertAssertion(js.ua.Cookies, 'set', '$name');
        assertAssertion(js.ua.Cookies, 'set', 'name', 'value;');
        assertAssertion(js.ua.Cookies, 'set', 'name', 'value', {});
        var expires = new Date(2064, 2, 15, 13, 40, 0);
        assertAssertion(js.ua.Cookies, 'set', 'name', 'value', expires, '/home;');
        assertAssertion(js.ua.Cookies, 'set', 'name', 'value', expires, '/home', 'js-lib.com;');
        assertAssertion(js.ua.Cookies, 'set', 'name', 'value', expires, '/home', 'js-lib.com', {});
    },

    testGet: function() {
        js.ua.Cookies._getCookies = function() {
            return 'name1=value1; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home; domain=js-lib.com; secure; name2 = value2; name3=value3';
        };
        assertEquals('value1', js.ua.Cookies.get('name1'));
        assertEquals('value2', js.ua.Cookies.get('name2'));
        assertEquals('value3', js.ua.Cookies.get('name3'));
        assertNull(js.ua.Cookies.get('fake-name'));
        var setInvoked = false;
        js.ua.Cookies._setCookie = function(cookie) {
            setInvoked = true;
            var expected = 'fake-name=fake-value; comment=j(s)-lib-s; expires=Sat, 15 Mar 2064 11:40:00 GMT';
            if (js.ua.Engine.TRIDENT) {
                // IE uses UTC instead of GMT for Greenwich time zone
                expected = expected.replace('GMT', 'UTC');
            }
            assertEquals(expected, cookie);
        };
        assertEquals('fake-value', js.ua.Cookies.get('fake-name', 'fake-value', new Date(2064, 2, 15, 13, 40, 0)));
        assertTrue(setInvoked);

        js.ua.Cookies._getCookies = function() {
            return ('boolean=true; comment=j(s)-lib-b; ') +
            ('number=1234.56; comment=j(s)-lib-n; ') +
            ('date=%221964-03-15T13%3A40%3A00.000Z%22; comment=j(s)-lib-d; ') +
            ('object=%7B%22name%22%3A%22John%20Doe%22%7D; comment=j(s)-lib-o; ') +
            ('array=%5B1%2C2%5D; comment=j(s)-lib-a');
        };
        assertEquals(true, js.ua.Cookies.get('boolean'));
        assertEquals(1234.56, js.ua.Cookies.get('number'));
        assertEquals(Date.UTC(1964, 2, 15, 13, 40, 0, 0), js.ua.Cookies.get('date').getTime());
        assertEquals('John Doe', js.ua.Cookies.get('object').name);
        assertEquals(1, js.ua.Cookies.get('array')[0]);
    },

    testBadGet: function() {
        js.ua.Cookies._getCookies = function() {
            return 'name=value';
        };
        assertAssertion(js.ua.Cookies, 'get', '$fake-name', null);
        assertAssertion(js.ua.Cookies, 'get', 'fake-name', 'fake;value');
        assertAssertion(js.ua.Cookies, 'get', 'fake-name', 'fake-value', {});
    },

    testHas: function() {
        js.ua.Cookies._getCookies = function() {
            return 'name1=value1; expires=Sat, 15 Mar 2064 11:40:00 GMT; path=/home; domain=js-lib.com; secure; name2 = value2; name3=value3';
        };
        assertTrue(js.ua.Cookies.has('name1'));
        assertTrue(js.ua.Cookies.has('name2'));
        assertTrue(js.ua.Cookies.has('name3'));
        assertFalse(js.ua.Cookies.has('fake-name'));
    },

    testRemove: function() {
        js.ua.Cookies._getCookies = function() {
            return 'name=value';
        };
        var setInvoked = false;
        js.ua.Cookies._setCookie = function(cookie) {
            setInvoked = true;
            assertEquals('name=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/', cookie);
        };

        js.ua.Cookies.remove('name');
        assertTrue(setInvoked);

        setInvoked = false;
        js.ua.Cookies.remove('fake-name');
        assertFalse(setInvoked);

        assertAssertion(js.ua.Cookies, 'remove');
        assertAssertion(js.ua.Cookies, 'remove', null);
        assertAssertion(js.ua.Cookies, 'remove', '');
    },

    testToString: function() {
        assertEquals('js.ua.Cookies', js.ua.Cookies.toString());
    }
};
TestCase.register('js.tests.ua.Cookies');
