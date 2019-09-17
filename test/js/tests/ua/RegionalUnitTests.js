$package('js.tests.ua');

js.tests.ua.Regional =
{
    beforeClass: function() {
        this._getUserAgentLocale = js.ua.Regional._getUserAgentLocale;
        this._cookieGetter = js.ua.Cookies.get;

        this._language = js.ua.Regional.language;
        this._country = js.ua.Regional.country;
        this._timeZone = js.ua.Regional.timeZone;
    },

    afterClass: function() {
        js.ua.Regional._getUserAgentLocale = this._getUserAgentLocale;
        js.ua.Cookies.get = this._cookieGetter;

        js.ua.Regional.language = this._language;
        js.ua.Regional.country = this._country;
        js.ua.Regional.timeZone = this._timeZone;
    },

    testInit: function() {
        assertEquals('en', js.ua.Regional.language);
        assertEquals('US', js.ua.Regional.country);
        assertEquals('UTC', js.ua.Regional.timeZone);

        var cookies = {};
        js.ua.Cookies.get = function(cookieName) {
            return cookies[cookieName];
        };

        var userAgentLocale;
        js.ua.Regional._getUserAgentLocale = function() {
            return userAgentLocale;
        };
        function assert(cookieLanguage, cookieCountry, cookieTimeZone, locale, expectedLanguage, expectedCountry, expectedTimeZone) {
            cookies['js.LANGUAGE'] = cookieLanguage;
            cookies['js.COUNTRY'] = cookieCountry;
            cookies['js.TIMEZONE'] = cookieTimeZone;
            userAgentLocale = locale;

            js.ua.Regional.language = 'en';
            js.ua.Regional.country = 'US';
            js.ua.Regional.timeZone = 'UTC';
            js.ua.Regional.init();

            assertEquals(expectedLanguage, js.ua.Regional.language);
            assertEquals(expectedCountry, js.ua.Regional.country);
            assertEquals(expectedTimeZone, js.ua.Regional.timeZone);
        }

        // null cookies and undefined locale should fallback to defaults
        assert(null, null, null, undefined, 'en', 'US', 'UTC');
        assert(null, null, null, null, 'en', 'US', 'UTC');
        assert(null, null, null, '', 'en', 'US', 'UTC');

        // load from user agent locale
        assert(null, null, null, 'ro-RO', 'ro', 'RO', 'UTC');
        assert(null, null, null, 'ro-ro', 'ro', 'RO', 'UTC');
        assert(null, null, null, 'RO-RO', 'ro', 'RO', 'UTC');

        assert(null, null, null, 'ro-RO', 'ro', 'RO', 'UTC');
        assert('de', null, null, 'ro-RO', 'de', 'RO', 'UTC');
        assert('DE', null, null, 'ro-RO', 'de', 'RO', 'UTC');
        assert(null, 'de', null, 'ro-RO', 'ro', 'DE', 'UTC');
        assert(null, 'DE', null, 'ro-RO', 'ro', 'DE', 'UTC');
        assert('de', 'DE', null, 'ro-RO', 'de', 'DE', 'UTC');
        assert('DE', 'de', null, 'ro-RO', 'de', 'DE', 'UTC');
        assert(null, null, 'CET', 'ro-RO', 'ro', 'RO', 'CET');
        assert('de', null, 'CET', 'ro-RO', 'de', 'RO', 'CET');
        assert('DE', null, 'CET', 'ro-RO', 'de', 'RO', 'CET');
        assert(null, 'DE', 'CET', 'ro-RO', 'ro', 'DE', 'CET');
        assert(null, 'de', 'CET', 'ro-RO', 'ro', 'DE', 'CET');
        assert('de', 'DE', 'CET', 'ro-RO', 'de', 'DE', 'CET');
        assert('DE', 'de', 'CET', 'ro-RO', 'de', 'DE', 'CET');
    },

    testToString: function() {
        assertEquals('js.ua.Regional', js.ua.Regional.toString());
    }
};
TestCase.register('js.tests.ua.Regional');
