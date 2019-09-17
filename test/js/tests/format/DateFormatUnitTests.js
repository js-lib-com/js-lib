$package('js.tests.format');

js.tests.format.DateFormatUnitTests = {
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

    testFullDate : function () {
        var df = new js.format.FullDate();
        assertEquals('Sunday, March 15, 1964', df.format(this._getDate()));
        assertTrue(df.test('Friday, December 21, 2012'));
        this._assertDate(df, 'Friday, December 21, 2012', 2012, 11, 21);
    },

    testFullDateTime : function () {
        var df = new js.format.FullDateTime();
        assertEquals('Sunday, March 15, 1964 02:40:00 PM +0200', df.format(this._getDate()));
        assertTrue(df.test('Friday, December 21, 2012 09:21:21 PM 0000'));
        this._assertDate(df, 'Friday, December 21, 2012 09:21:21 PM 0000', 2012, 11, 21, 21, 21, 21);
    },

    testFullTime : function () {
        var df = new js.format.FullTime();
        assertEquals('02:40:00 PM +0200', df.format(this._getDate()));
        assertTrue(df.test('09:21:21 PM 0000'));
        this._assertDate(df, '09:21:21 PM 0000', 1970, 0, 1, 21, 21, 21);
    },

    testLongDate : function () {
        var df = new js.format.LongDate();
        assertEquals('March 15, 1964', df.format(this._getDate()));
        assertTrue(df.test('December 21, 2012'));
        this._assertDate(df, 'December 21, 2012', 2012, 11, 21);
    },

    testLongDateTime : function () {
        var df = new js.format.LongDateTime();
        assertEquals('March 15, 1964 02:40:00 PM +0200', df.format(this._getDate()));
        assertTrue(df.test('December 21, 2012 09:21:21 PM 0000'));
        this._assertDate(df, 'December 21, 2012 09:21:21 PM 0000', 2012, 11, 21, 21, 21, 21);
    },

    testLongTime : function () {
        var df = new js.format.LongTime();
        assertEquals('02:40:00 PM +0200', df.format(this._getDate()));
        assertTrue(df.test('09:21:21 PM 0000'));
        this._assertDate(df, '09:21:21 PM 0000', 1970, 0, 1, 21, 21, 21);
    },

    testMediumDate : function () {
        var df = new js.format.MediumDate();
        assertEquals('Mar 15, 1964', df.format(this._getDate()));
        assertTrue(df.test('Dec 21, 2012'));
        this._assertDate(df, 'Dec 21, 2012', 2012, 11, 21);
    },

    testMediumDateTime : function () {
        var df = new js.format.MediumDateTime();
        assertEquals('Mar 15, 1964 02:40:00 PM', df.format(this._getDate()));
        assertTrue(df.test('Dec 21, 2012 09:21:21 PM'));
        this._assertDate(df, 'Dec 21, 2012 09:21:21 PM', 2012, 11, 21, 21, 21, 21);
    },

    testMediumTime : function () {
        var df = new js.format.MediumTime();
        assertEquals('02:40:00 PM', df.format(this._getDate()));
        assertTrue(df.test('09:21:21 PM'));
        this._assertDate(df, '09:21:21 PM', 1970, 0, 1, 21, 21, 21);
    },

    testShortDate : function () {
        var df = new js.format.ShortDate();
        assertEquals('3/15/64', df.format(this._getDate()));
        assertTrue(df.test('12/21/12'));
        this._assertDate(df, '12/21/12', 2012, 11, 21);
    },

    testShortDateTime : function () {
        var df = new js.format.ShortDateTime();
        assertEquals('3/15/64 02:40 PM', df.format(this._getDate()));
        assertTrue(df.test('12/21/12 09:21 PM'));
        this._assertDate(df, '12/21/12 09:21 PM', 2012, 11, 21, 21, 21);
    },

    testShortTime : function () {
        var df = new js.format.ShortTime();
        assertEquals('02:40 PM', df.format(this._getDate()));
        assertTrue(df.test('09:21 PM'));
        this._assertDate(df, '09:21 PM', 1970, 0, 1, 21, 21);
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
    },

    _getDate : function () {
        return new Date(1964, 2, 15, 14, 40, 0, 0);
    }
};
TestCase.register('js.tests.format.DateFormatUnitTests');
