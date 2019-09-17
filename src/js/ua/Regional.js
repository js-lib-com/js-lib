$package('js.ua');

/**
 * User regional settings. Global accessible, is used by regional-sensitive classes to adapt their own behavior. It is
 * initialized on {@link js.ua.Page} creation.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.ua.Regional = {
    /**
     * Language cookie name.
     * 
     * @type String
     */
    LANGUAGE_COOKIE : 'js.LANGUAGE',

    /**
     * Country cookie name.
     * 
     * @type String
     */
    COUNTRY_COOKIE : 'js.COUNTRY',

    /**
     * Time zone cookie name.
     * 
     * @type String
     */
    TIMEZONE_COOKIE : 'js.TIMEZONE',

    /**
     * User language, lower case two-letter ISO-639 code. Default to <em>en</em> when language can't be loaded from
     * cookie or browser locale.
     * 
     * @type String
     */
    language : 'en',

    /**
     * User country, upper case two-letter ISO-3166 code. Default to <em>US</em> when country can't be loaded from
     * cookie or browser locale.
     * 
     * @type String
     */
    country : 'US',

    /**
     * User time zone. Retrieved from server via cookie. Default to <em>UTC</em> when time zone cookie is missing.
     * 
     * @type String
     */
    timeZone : 'UTC',

    /**
     * Initialize regional properties. This method tries to load regional settings from server via cookie or browser
     * locale. If fails default values are preserved.
     */
    init : function () {
        var locale = this._getUserAgentLocale();
        if (!locale) {
            locale = this.language + '-' + this.country;
        }
        if (js.lang.Types.isString(locale)) {
            locale = locale.split('-');
            if (locale.length !== 2) {
                locale = [ this.language, this.country ];
            }
        }

        var language = js.ua.Cookies.get(this.LANGUAGE_COOKIE);
        if (language === null) {
            language = locale[0];
        }
        if (language) {
            this.language = language.toLowerCase();
        }

        var country = js.ua.Cookies.get(this.COUNTRY_COOKIE);
        if (country === null) {
            country = locale[1];
        }
        if (this.country) {
            this.country = country.toUpperCase();
        }

        var timeZone = js.ua.Cookies.get(this.TIMEZONE_COOKIE);
        if (timeZone !== null) {
            this.timeZone = timeZone;
        }
    },

    /**
     * Get user agent locale.
     * 
     * @return String user agent locale.
     */
    _getUserAgentLocale : function () {
        return navigator.language;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return 'js.ua.Regional';
    }
};

$legacy(js.ua.Engine.TRIDENT, function () {
    js.ua.Regional._getUserAgentLocale = function () {
        return navigator.userLanguage;
    };
});
