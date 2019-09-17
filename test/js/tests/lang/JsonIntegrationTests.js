$package('js.tests.lang');

js.tests.lang.JsonIntegrationTests =
{
    testDateToJsonNativeSupport: function() {
        assertTrue(typeof Date.prototype.toJSON !== 'undefined');
        var d = new Date(2010, 10, 18, 21, 57, 16, 123);
        var json = '2010-11-18T19:57:16';
        if (js.ua.Engine.GECKO || js.ua.Engine.WEBKIT) {
            json += '.123';
        }
        json += 'Z';
        assertEquals(json, d.toJSON());

        for (var i = 0; i < 1000; i++) {
			var r = js.util.Rand;
            var args = [r(1964, 67), r(12), r(1, 28), r(24), r(60), r(60)];
            if (js.ua.Engine.GECKO || js.ua.Engine.WEBKIT) {
                args.push(r(1000));
            }
            d = new Date(Date.UTC.apply(Date.UTC, args));
            assertEquals(this._date2json.apply(this, args), d.toJSON());
        }

        d = new Date();
        // note that JSON.stringify return a string prepared for JSON serialziation
        // that is, surrounded by quotes, whereas Date.toJSON return a simple string
        assertEquals('"' + d.toJSON() + '"', JSON.stringify(d));
    },

    testJsonNativeSupport: function() {
        assertTrue(typeof JSON !== 'undefined');
        assertTrue(typeof JSON.parse !== 'undefined');
        assertTrue(typeof JSON.stringify !== 'undefined');
        assertTrue(js.lang.Types.isFunction(JSON.parse));
        assertTrue(js.lang.Types.isFunction(JSON.stringify));
    },

    testNativeJsonParse: function() {
        var obj = this._getObject();
        var d = obj.p4;
        obj.p4 = this._date2json(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        assertTheSame(obj, JSON.parse(this._getJson()));
    },

    testNativeJsonStringify: function() {
        assertEquals(this._getJson(), JSON.stringify(this._getObject()));
        // alert(JSON.stringify(this._getObject()));
    },

    testJsonComplexStringifyParse: function() {
        var car =
        {
            model: 'Opel Corsa 1.2',
            manufactureDate: new Date(Date.parse('January 15, 2001 13:40:35')),
            purchaseDate: new Date(Date.parse('July 24, 2005 16:40:15')),
            managerBirth: new Date(Date.parse('August 23, 1924')),
            engine:
            {
                model: 'ECO',
                specifications:
                {
                    capacity: 1200,
                    torque: [495, 1137]
                }
            },
            wheels: [
            {
                pressure: 1.8
            },
            {
                pressure: 1.8
            },
            {
                pressure: 2
            },
            {
                pressure: 2
            }],
            registered: true
        };

        var json = JSON.stringify(car);
        var error = false;
        try {
            // expect to fail as JSON.parse doesn't process Date objects
            assertTheSame(car, JSON.parse(json));
        }
        catch (er) {
            error = true;
        }
        assertTrue(error);

        json = js.lang.JSON.stringify(car);
        assertTheSame(car, js.lang.JSON.parse(json));
    },

    _date2json: function(year, month, date, hours, minutes, seconds, milliseconds) {
        var json = year + '-';
        json += this._padd(month + 1, 2) + '-';
        json += this._padd(date, 2) + 'T';
        json += this._padd(hours, 2) + ':';
        json += this._padd(minutes, 2) + ':';
        json += this._padd(seconds, 2);
        if (js.ua.Engine.GECKO || js.ua.Engine.WEBKIT) {
            json += ('.' + this._padd(milliseconds, 3));
        }
        json += 'Z';
        return json;
    },

    _getObject: function() {
        return {
            p1: 'string',
            p2: true,
            p3: 12.34,
            p4: new Date(Date.UTC(2001, 0, 15, 13, 40, 35, 123)),
            p5: {
                p1: 'p5 string',
                p2: false,
                p3: 1964
            }
        };
    },

    _getJson: function() {
        var date = '2001-01-15T13:40:35';
        if (js.ua.Engine.GECKO || js.ua.Engine.WEBKIT) {
            date += '.123';
        }
        date += 'Z';
        return '{"p1":"string","p2":true,"p3":12.34,"p4":"' + date + '","p5":{"p1":"p5 string","p2":false,"p3":1964}}';
    },

    _padd: function(n, w) {
        var s = String(n);
        while (w > s.length) {
            s = '0' + s;
        }
        return s;
    }
};
TestCase.register('js.tests.lang.JsonIntegrationTests');
