$package('js.tests.format');

js.tests.format.DatesUtilityUnitTests = {
    before : function () {
        js.format.DateFormatSymbols._symbols = {
            patterns : {
                fullDate : 'EEEE, MMMM dd, yyyy',
                fullTime : 'hh:mm:ss a Z',
                longDate : 'MMMM dd, yyyy',
                longTime : 'hh:mm:ss a Z',
                mediumDate : 'MMM dd, yyyy',
                mediumTime : 'hh:mm:ss a',
                shortDate : 'M/d/yy',
                shortTime : 'hh:mm a'
            },

            fullMonths : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            shortMonths : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
            fullWeekDays : [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            shortWeekDays : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
            tinyWeekDays : [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ]
        };
    },

    testSanityCheck : function () {
        var patterns = {
            'y' : '12',
            'yy' : '64',
            'yyy' : '1964',
            'yyyy' : '1964',

            'M' : '1',
            'MM' : '01',
            'MMM' : 'Jan',
            'MMMM' : 'January',

            'E' : 'Mon',
            'EE' : 'Mon',
            'EEE' : 'Mon',
            'EEEE' : 'Monday',

            'z' : '+0200',
            'zzz' : '-0200',
            'zzz' : '0000',
            'zzzz' : '+0200',
            'Z' : '-0200',

            'd' : '99',
            'dd' : '0',

            'EEEE, MMMM dd, yyyy' : 'Wednesday, August 23, 1945',
            'EEE, MMM dd, yyyy' : 'Wed, Aug 23, 1945',
            'hh:mm:ss a Z' : '11:45:23 AM +0200',
            'hh:mm:ss a zzz' : '11:45:23 PM 0000',
            'MMMM dd, yyyy' : 'December 21, 2012',
            'MMM dd, yyyy' : 'Dec 21, 2012',
            'hh:mm:ss a' : '1:2:3 am',
            'M/d/yy' : '1/21/12',
            'hh:mm a' : '12:00 pm',
            'dd MMMM yyyy' : '21 December 2012',
            'HH:mm:ss Z' : '23:45:12 -0200',
            'dd.MM.yyyy' : '21.12.2012',
            'HH:mm:ss' : '14:40:00',
            'HH:mm' : '14:40'
        };
        var df;
        for ( var p in patterns) {
            df = new js.format.DateFormat(p);
            assertTrue(df.test(patterns[p]));
        }

        df = new js.format.DateFormat('EEEE, MMMM dd, yyyy hh:mm:ss a zzz');
        for (var i = 0; i < 10; ++i) {
            assertTrue(df.test('Wednesday, August 23, 1945 11:45:23 AM +0200'));
        }
    },

    testInsanityCheck : function () {
        var patterns = {
            'y' : [ '1964', 'VI', '196', 'O1' ],
            'yy' : [ '', '2012', 'XYZ', '2O' ],
            'yyy' : [ '', '1964 AD' ]
        };
        var i;
        for ( var p in patterns) {
            df = new js.format.DateFormat(p);
            for (i = 0; i < patterns[p].length; ++i) {
                assertFalse(df.test(patterns[p][i]));
            }
        }
    },

    testFullFormat : function () {
        var df = new js.format.DateFormat('EEEE, MMMM dd, yyyy hh:mm:ss.SSS a Z');
        this._assertDate(df, 'Friday, Mar 15, 1964 02:30:00.123 PM +0200', 1964, 2, 15, 14, 30, 0, 123);
        this._assertDate(df, 'Tue, March 15, 1964 12:30:00.001 PM +0200', 1964, 2, 15, 0, 30, 0, 1);

        var d = new Date(2012, 0, 1, 14, 30, 0);
        assertEquals('Sunday, January 01, 2012 02:30:00 PM +0200', new js.format.DateFormat('EEEE, MMMM dd, yyyy hh:mm:ss a Z').format(d));
    },

    testShortFormat : function () {
        var d = new Date(2012, 0, 1, 14, 30, 0);
        assertEquals('1/1/12', new js.format.DateFormat('M/d/y').format(d));
        assertEquals('2:30 PM', new js.format.DateFormat('h:mm a').format(d));
    },

    testYear : function () {
        var d = new Date(1964, 2, 15, 14, 30, 0);
        assertEquals('1964', new js.format.DateFormat('yyyy').format(d));
        assertEquals('1964', new js.format.DateFormat('yyy').format(d));
        assertEquals('64', new js.format.DateFormat('yy').format(d));
        assertEquals('64', new js.format.DateFormat('y').format(d));

        function test (nowYear, pattern, source, year) {
            var builtinFullYear = Date.prototype.getFullYear;
            function getFullYear () {
                return nowYear;
            }

            try {
                var df = new js.format.DateFormat(pattern);

                Date.prototype.getFullYear = getFullYear;
                var date = df.parse(source);
                Date.prototype.getFullYear = builtinFullYear;

                assertEquals(year, date.getFullYear());
            } catch (e) {
                Date.prototype.getFullYear = builtinFullYear;
                throw e;
            }
        }

        test(2012, 'yyyy', '1964', 1964);
        test(2012, 'yyy', '1964', 1964);
        test(2012, 'yy', '33', 1933);
        test(2012, 'y', '33', 1933);
        test(2012, 'yy', '64', 1964);
        test(2012, 'y', '64', 1964);
        test(2012, 'yy', '99', 1999);
        test(2012, 'y', '99', 1999);
        test(2012, 'yy', '00', 2000);
        test(2012, 'y', '00', 2000);
        test(2012, 'yy', '12', 2012);
        test(2012, 'y', '12', 2012);
        test(2012, 'yy', '32', 2032);
        test(2012, 'y', '32', 2032);

        test(2089, 'yyyy', '1964', 1964);
        test(2089, 'yyy', '1964', 1964);
        test(2089, 'yy', '10', 2010);
        test(2089, 'y', '10', 2010);
        test(2089, 'yy', '64', 2064);
        test(2089, 'y', '64', 2064);
        test(2089, 'yy', '89', 2089);
        test(2089, 'y', '89', 2089);
        test(2089, 'yy', '99', 2099);
        test(2089, 'y', '99', 2099);
        test(2089, 'yy', '00', 2100);
        test(2089, 'y', '00', 2100);
        test(2089, 'yy', '09', 2109);
        test(2089, 'y', '09', 2109);
    },

    testBadYearTruncation : function () {
        assertEquals('1864', new js.format.DateFormat('yyyy').format(new Date(1864, 0, 1)));
        assertEquals('2164', new js.format.DateFormat('yyyy').format(new Date(2164, 0, 1)));

        var exception = false;
        try {
            new js.format.DateFormat('yy').format(new Date(2164, 0, 1));
        } catch (e) {
            exception = true;
        }
        if (!exception) {
            TestCase.fail('Trying to truncate years outside allowed range should rise exception.');
        }
    },

    testTimeZone : function () {
        var pattern = /^[+-]?\d{4}$/g;
        function assert (tz) {
            pattern.lastIndex = 0;
            assertTrue(pattern.test(tz));
        }
        assert(new js.format.DateFormat('z').format(new Date()));
        assert(new js.format.DateFormat('zz').format(new Date()));
        assert(new js.format.DateFormat('zzz').format(new Date()));
        assert(new js.format.DateFormat('zzzz').format(new Date()));
        assert(new js.format.DateFormat('Z').format(new Date()));
    },

    testAdjacentPatterns : function () {
        var d = new Date(2012, 11, 21, 14, 30, 45, 123);

        var df = new js.format.DateFormat('yyyyMMddHHmmssSSS');
        this._assertDate(df, '20120301234501234', 2012, 2, 1, 23, 45, 1, 234);
        assertEquals('20121221143045123', df.format(d));

        var df = new js.format.DateFormat('yyyyMMMM');
        this._assertDate(df, '2012March', 2012, 2, 1, 0, 0, 0, 0);
        assertEquals('2012December', df.format(d));
    },

    testDateTimeInstance : function () {
        var d = new Date(2012, 11, 21, 14, 30, 45, 123);

        var df = js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.SHORT, js.format.DateFormat.SHORT);
        assertEquals('12/21/12 02:30 PM', df.format(d));
        assertTheSame(new Date(2012, 11, 21, 14, 30), df.parse('12/21/12 02:30 PM'));

        df = js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.MEDIUM, js.format.DateFormat.MEDIUM);
        assertEquals('Dec 21, 2012 02:30:45 PM', df.format(d));
        assertTheSame(new Date(2012, 11, 21, 14, 30, 45), df.parse('Dec 21, 2012 02:30:45 PM'));

        df = js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.LONG, js.format.DateFormat.LONG);
        assertEquals('December 21, 2012 02:30:45 PM +0200', df.format(d));
        assertTheSame(new Date(2012, 11, 21, 14, 30, 45), df.parse('December 21, 2012 02:30:45 PM +0200'));

        df = js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.FULL, js.format.DateFormat.FULL);
        assertEquals('Friday, December 21, 2012 02:30:45 PM +0200', df.format(d));
        assertTheSame(new Date(2012, 11, 21, 14, 30, 45), df.parse('Friday, December 21, 2012 02:30:45 PM +0200'));
    },

    testDateInstance : function () {
        var d = new Date(2012, 11, 21);

        var df = js.format.DateFormat.getDateInstance(js.format.DateFormat.SHORT);
        assertEquals('12/21/12', df.format(d));
        assertTheSame(new Date(2012, 11, 21), df.parse('12/21/12'));

        df = js.format.DateFormat.getDateInstance(js.format.DateFormat.MEDIUM);
        assertEquals('Dec 21, 2012', df.format(d));
        assertTheSame(new Date(2012, 11, 21), df.parse('Dec 21, 2012'));

        df = js.format.DateFormat.getDateInstance(js.format.DateFormat.LONG);
        assertEquals('December 21, 2012', df.format(d));
        assertTheSame(new Date(2012, 11, 21), df.parse('December 21, 2012'));

        df = js.format.DateFormat.getDateInstance(js.format.DateFormat.FULL);
        assertEquals('Friday, December 21, 2012', df.format(d));
        assertTheSame(new Date(2012, 11, 21), df.parse('Friday, December 21, 2012'));
    },

    testTimeInstance : function () {
        var d = new Date(1970, 0, 1, 14, 30, 45);

        var df = js.format.DateFormat.getTimeInstance(js.format.DateFormat.SHORT);
        assertEquals('02:30 PM', df.format(d));
        assertTheSame(new Date(1970, 0, 1, 14, 30), df.parse('02:30 PM'));

        df = js.format.DateFormat.getTimeInstance(js.format.DateFormat.MEDIUM);
        assertEquals('02:30:45 PM', df.format(d));
        assertTheSame(new Date(1970, 0, 1, 14, 30, 45), df.parse('02:30:45 PM'));

        df = js.format.DateFormat.getTimeInstance(js.format.DateFormat.LONG);
        assertEquals('02:30:45 PM +0200', df.format(d));
        assertTheSame(new Date(1970, 0, 1, 14, 30, 45), df.parse('02:30:45 PM +0200'));

        df = js.format.DateFormat.getTimeInstance(js.format.DateFormat.FULL);
        assertEquals('02:30:45 PM +0200', df.format(d));
        assertTheSame(new Date(1970, 0, 1, 14, 30, 45), df.parse('02:30:45 PM +0200'));
    },

    testFullMonthNames : function () {
        var df = new js.format.DateFormat('MMMM');
        assertEquals('January', df.format(new Date(2012, 0)));
        assertEquals('February', df.format(new Date(2012, 1)));
        assertEquals('March', df.format(new Date(2012, 2)));
        assertEquals('April', df.format(new Date(2012, 3)));
        assertEquals('May', df.format(new Date(2012, 4)));
        assertEquals('June', df.format(new Date(2012, 5)));
        assertEquals('July', df.format(new Date(2012, 6)));
        assertEquals('August', df.format(new Date(2012, 7)));
        assertEquals('September', df.format(new Date(2012, 8)));
        assertEquals('October', df.format(new Date(2012, 9)));
        assertEquals('November', df.format(new Date(2012, 10)));
        assertEquals('December', df.format(new Date(2012, 11)));
    },

    testShortMonthNames : function () {
        var df = new js.format.DateFormat('MMM');
        assertEquals('Jan', df.format(new Date(2012, 0)));
        assertEquals('Feb', df.format(new Date(2012, 1)));
        assertEquals('Mar', df.format(new Date(2012, 2)));
        assertEquals('Apr', df.format(new Date(2012, 3)));
        assertEquals('May', df.format(new Date(2012, 4)));
        assertEquals('Jun', df.format(new Date(2012, 5)));
        assertEquals('Jul', df.format(new Date(2012, 6)));
        assertEquals('Aug', df.format(new Date(2012, 7)));
        assertEquals('Sep', df.format(new Date(2012, 8)));
        assertEquals('Oct', df.format(new Date(2012, 9)));
        assertEquals('Nov', df.format(new Date(2012, 10)));
        assertEquals('Dec', df.format(new Date(2012, 11)));
    },

    testFullWeekDayNames : function () {
        var df = new js.format.DateFormat('EEEE');
        assertEquals('Sunday', df.format(new Date(2012, 0, 1)));
        assertEquals('Monday', df.format(new Date(2012, 0, 2)));
        assertEquals('Tuesday', df.format(new Date(2012, 0, 3)));
        assertEquals('Wednesday', df.format(new Date(2012, 0, 4)));
        assertEquals('Thursday', df.format(new Date(2012, 0, 5)));
        assertEquals('Friday', df.format(new Date(2012, 0, 6)));
        assertEquals('Saturday', df.format(new Date(2012, 0, 7)));
    },

    testShortWeekDayNames : function () {
        var df = new js.format.DateFormat('EEE');
        assertEquals('Sun', df.format(new Date(2012, 0, 1)));
        assertEquals('Mon', df.format(new Date(2012, 0, 2)));
        assertEquals('Tue', df.format(new Date(2012, 0, 3)));
        assertEquals('Wed', df.format(new Date(2012, 0, 4)));
        assertEquals('Thu', df.format(new Date(2012, 0, 5)));
        assertEquals('Fri', df.format(new Date(2012, 0, 6)));
        assertEquals('Sat', df.format(new Date(2012, 0, 7)));
    },

    _assertDate : function (df, str, y, M, d, h, m, s, S) {
        var date = df.parse(str);
        assertEquals(date.getFullYear(), typeof y !== 'undefined' ? y : 1970);
        assertEquals(date.getMonth(), typeof M !== 'undefined' ? M : 0);
        assertEquals(date.getDate(), typeof d !== 'undefined' ? d : 1);
        assertEquals(date.getHours(), typeof h !== 'undefined' ? h : 0);
        assertEquals(date.getMinutes(), typeof m !== 'undefined' ? m : 0);
        assertEquals(date.getSeconds(), typeof s !== 'undefined' ? s : 0);
        assertEquals(date.getMilliseconds(), typeof S !== 'undefined' ? S : 0);
    }
};
TestCase.register('js.tests.format.DatesUtilityUnitTests');
