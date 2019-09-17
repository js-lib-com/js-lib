$package('js.tests.lang');

js.tests.lang.JsonUnitTests =
{
    // save and restore JSON built-in object since it will be altered by this unit tests
    before: function() {
        this.builtinJSON = JSON;
    },

    after: function() {
        JSON = this.builtinJSON;
    },

    testJson2date: function() {
        // normalized ISO8601 format
        var date = js.lang.JSON._json2date('1964-03-15T14:40:00.123Z');
        assertUTCDate(date, 1964, 2, 15, 14, 40, 0, 123);

        // lower case litteral are accepted
        date = js.lang.JSON._json2date('1964-03-15t14:40:00.123z');
        assertUTCDate(date, 1964, 2, 15, 14, 40, 0, 123);

        // milliseconds are optional
        date = js.lang.JSON._json2date('1964-03-15T14:40:00Z');
        assertUTCDate(date, 1964, 2, 15, 14, 40, 0, 0);

        assertNull(js.lang.JSON._json2date(''));
        assertNull(js.lang.JSON._json2date('1964-03-15T14:40:00.000'));
        assertNull(js.lang.JSON._json2date('1964 03-15T14:40:00.000Z'));
        assertNull(js.lang.JSON._json2date('1964 03-15T14:40:00.Z'));
        assertNull(js.lang.JSON._json2date('1964-03-15T14:40:00000Z'));

        assertException(TypeError, js.lang.JSON, '_json2date');
        assertException(TypeError, js.lang.JSON, '_json2date', null);
    },

    testParse: function() {
        var jsonSample = '{name:"Iulian Rotaru"}';
        JSON =
        {
            parse: function(json) {
                if (!json) {
                    return json;
                }
                assertEquals(jsonSample, json);
                return {
                    name: 'John Doe'
                };
            }
        };
        var obj = js.lang.JSON.parse(jsonSample);
        assertExists(obj);
        assertEquals('John Doe', obj.name);

        assertAssertion(js.lang.JSON, 'parse');
        assertAssertion(js.lang.JSON, 'parse', null);
        assertAssertion(js.lang.JSON, 'parse', '');

        $assert.disable();
        assertUndefined(js.lang.JSON.parse());
        assertNull(js.lang.JSON.parse(null));
        assertEmpty(js.lang.JSON.parse(''));
    },

    testParseArray: function() {
        var jsonArray = '[1,2]';
        var a = js.lang.JSON.parse(jsonArray);
        assertEquals(2, a.length);
        assertEquals(1, a[0]);
        assertEquals(2, a[1]);
    },

    testParseDate: function() {
        var jsonDate = '"1964-03-15T13:40:00.000Z"';
        var d = js.lang.JSON.parse(jsonDate);
        assertExists(d);
        assertEquals(Date.UTC(1964, 2, 15, 13, 40, 0, 0), d.getTime());
    },

    testStringify: function() {
        var objSample =
        {
            name: 'John Doe'
        };
        var jsonSample = '{name:"Iulian Rotaru"}';
        JSON =
        {
            stringify: function(obj) {
                if (!obj) {
                    return obj;
                }
                assertEquals(objSample, obj);
                return jsonSample;
            }
        };
        var json = js.lang.JSON.stringify(objSample);
        assertExists(json);
        assertEquals(jsonSample, json);

        assertNull(js.lang.JSON.stringify(null));
        assertEmpty(js.lang.JSON.stringify(''));

        assertAssertion(js.lang.JSON, 'stringify');

        $assert.disable();
        assertUndefined(js.lang.JSON.stringify());
    },

    testStringifyDates: function() {
        var date = new Date();
        date.setTime(Date.UTC(1964, 2, 15, 14, 20));
        if (js.ua.Engine.TRIDENT) {
            assertEquals('"1964-03-15T14:20:00Z"', js.lang.JSON.stringify(date));
        }
        else {
            assertEquals('"1964-03-15T14:20:00.000Z"', js.lang.JSON.stringify(date));
        }
    }
};
TestCase.register('js.tests.lang.JsonUnitTests');
