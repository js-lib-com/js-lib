$package("js.ua");

/**
 * Client support for cookies. This implementation follows RFC2109 regarding cookie format but relies on user agent for
 * actual storage and retrieving. Supplies method to set, get, test for existence and remove cookies and handy names and
 * values sanity check.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @see RFC2109 RFC2109 - HTTP State Management Mechanism
 */
js.ua.Cookies = {
    /**
     * Formatted cookie maximum length. This refers to formatted cookie string, that is, including cookie value and all
     * optional attributes, if present.
     * 
     * @type Number
     */
    MAX_LENGTH : 4096,

    /**
     * Create or update a cookie. Create a formatted cookie string starting from given arguments and store it to user
     * agent cookies repository. If cookie already exists update its attributes. This setter tries to ensure given
     * arguments are proper and assert if not. Anyway, if assertions are disabled we are at the mercy of user agent
     * implementation.
     * <p>
     * Value is not limited to string; boolean, number, date and even object and array are allowed. This method
     * serialize given value storing also type informations so that it can be restored on {@link #get get cookie}.
     * Please keep in mind maximum cookie length is applied and refrain to store large arrays or objects, although there
     * is no restriction regarding the complexity of object graph.
     * 
     * @param String name cookie name,
     * @param Object value cookie value,
     * @param Date expires expiration date, if missing cookie will expire at session end,
     * @param String path cookie path, default to current document path,
     * @param String domain domain name, default to current document domain,
     * @param Boolean secure HTTPS required, default to false. If true cookie transmission requires HTTPS.
     * @assert all arguments should be valid, if present.
     */
    set : function (name, value, expires, path, domain, secure) {
        $assert(typeof name !== "undefined" && this.isValidName(name), "js.ua.Cookies#set", "Invalid cookie name |%s|.", name);
        $assert(typeof expires === "undefined" || js.lang.Types.isDate(expires), "js.ua.Cookies#set", "Expires is not date type.");
        $assert(typeof path === "undefined" || this.isValidValue(path), "js.ua.Cookies#set", "Path is not string.");
        $assert(typeof domain === "undefined" || this.isValidValue(domain), "js.ua.Cookies#set", "Domain is not string.");
        $assert(typeof secure === "undefined" || js.lang.Types.isBoolean(secure), "js.ua.Cookies#set", "Secure is not boolean.");

        // convert value to string and store type information as comments suffix
        // suffix is as follow:
        // -b boolean
        // -n number
        // -d date
        // -s string
        // -o object
        // -a array
        var comment = "j(s)-lib-";
        if (js.lang.Types.isBoolean(value)) {
            comment += "b";
            value = value ? "true" : "false";
        }
        else if (js.lang.Types.isNumber(value)) {
            comment += "n";
            value = value.toString();
        }
        else if (js.lang.Types.isDate(value)) {
            comment += "d";
            value = js.lang.JSON.stringify(value);
        }
        else if (js.lang.Types.isString(value)) {
            $assert(this.isValidValue(value), "js.ua.Cookies#set", "Invalid cookie value.");
            comment += "s";
        }
        else if (js.lang.Types.isArray(value)) {
            comment += "a";
            value = js.lang.JSON.stringify(value);
        }
        else {
            comment += "o";
            value = js.lang.JSON.stringify(value);
        }

        var cookie = name + "=" + escape(value) + ("; comment=" + comment) + (expires ? "; expires=" + expires.toGMTString() : "") + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (secure ? "; secure" : "");
        this._setCookie(cookie);
    },

    /**
     * Get cookie value. Return cookie value or null if cookie not found. If optional value is supplied and named cookie
     * is missing store that <em>value</em> then return it. Returning value type is determined by
     * {@link #set cookie setter}. User code should know the type associated with named cookie and use it accordingly.
     * 
     * <pre>
     *	js.ua.Cookies.set("date", new Date(...));
     *	...
     *	var d = js.ua.Cookies.get("date");
     *	// here d is of Date type
     * </pre>
     * 
     * @param String name the name of cookie to retrieve,
     * @param String value optional value returned on missing cookie,
     * @param Date expires optional expires date used only on missing cookie.
     * @return Object requested cookie value or null.
     * @assert <em>name</em> argument is not undefined, null or empty.
     */
    get : function (name, value, expires) {
        $assert(name, "js.ua.Cookies#get", "Name is undefined, null or empty.");
        $assert(typeof value === "undefined" || this.isValidValue(value), "js.ua.Cookies#get", "Invalid cookie value.");
        $assert(typeof expires === "undefined" || js.lang.Types.isDate(expires), "js.ua.Cookies#get", "Expires is not date type.");

        var cookies = this._getCookies();
        var rex = new RegExp("(?:^|.*;\\s*)" + name + "\\s*\\=\\s*([^;]+)(?:;\\s*comment=j\\(s\\)\\-lib\\-([bndsoa]))?.*");
        var match = rex.exec(cookies);
        if (match !== null && match.length > 1) {
            value = unescape(match[1]);
            switch (match[2]) {
            case "b":
                return value === "true" ? true : false;
            case "n":
                return Number(value);
            case "d":
            case "o":
            case "a":
                return js.lang.JSON.parse(value);
            }
            return value;
        }
        if (typeof value !== "undefined") {
            this.set(name, value, expires);
            return value;
        }
        return null;
    },

    /**
     * Test for named cookie presence. Search user agent cookies repository for a cookie with requested name and return
     * true if found.
     * 
     * @param String name the name of cookie to look for.
     * @return Boolean true if named cookie exists.
     */
    has : function (name) {
        $assert(name, "js.ua.Cookies#has", "Name is undefined, null or empty.");
        var cookies = this._getCookies();
        var rex = new RegExp("(?:^|;\\s*)" + name + "\\s*\\=");
        return rex.test(cookies);
    },

    /**
     * Delete a cookie. This method sets cookie"s expiration date to epoch. User agent cookies repository manager takes
     * care to actually remove expired cookies.
     * 
     * @param String name the name of cookie to remove.
     */
    remove : function (name) {
        if (this.has(name)) {
            var cookie = name + "=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/";
            this._setCookie(cookie);
        }
    },

    /**
     * Get user agent cookie support enabling state.
     * 
     * @return Boolean true if user agent has cookie enabled.
     */
    isEnabled : function () {
        return navigator.cookieEnabled;
    },

    /**
     * Invalid cookie name pattern.
     * 
     * @type RegExp
     */
    _INVALID_NAME : /^(?:comment|expires|max\-age|path|domain|secure|version)$|^\$|[;=\s]+/,

    /**
     * Cookie name (in)sanity check. Accordingly RFC2109 a cookie name can"t begin with dollar ($); this is in fact the
     * only restriction. Anyway, in practice we need to avoid confusing cookies parsers so a valid name can"t be a
     * reserved name nor contain semicolon (;), equals (=) or white spaces. All cookie"s attribute names are considered
     * reserved:
     * <ul>
     * <li>comment
     * <li>expires
     * <li>max-age
     * <li>path
     * <li>domain
     * <li>secure
     * <li>version
     * </ul>
     * Also, a cookie name can"t be undefined, null or empty and must be a {@link String}.
     * 
     * <p>
     * This predicate is mostly for internal use but is public. Application code may use it to check cookie names
     * provided by user input.
     * 
     * @param String name cookie name to test if valid.
     * @return Boolean true only if cookie name is valid.
     */
    isValidName : function (name) {
        if (!name || !js.lang.Types.isString(name)) {
            return false;
        }
        this._INVALID_NAME.lastIndex = 0;
        return !this._INVALID_NAME.test(name);
    },

    /**
     * Value (in)sanity check. This test applies not only to cookie value but also to all cookie attributes: none of
     * them can contain semicolon (;) used as key/value separator. Also, value can"t be undefined, null or empty and
     * must be a {@link String}.
     * 
     * <p>
     * This predicate is mostly for internal use but is public. Application code may use it to check values provided by
     * user input.
     * 
     * @param String value value to test for validity.
     * @return Boolean true only if value is valid.
     */
    isValidValue : function (value) {
        if (!value || !js.lang.Types.isString(value)) {
            return false;
        }
        return value.indexOf(";") === -1;
    },

    /**
     * Cookie setter. Stores given cookie on user agent repository. Argument should be a full formatted cookie, that is,
     * includes cookie value and all optional attributes, if present, properly separated by semicolon. RFC2109 imposes a
     * maximum value for cookie length, see {@link #MAX_LENGTH}; this method relies on user agent to deal with too
     * large cookies.
     * 
     * @param String cookie formatted cookie.
     * @assert cookie length does not exceed allowed value.
     */
    _setCookie : function (cookie) {
        $assert(cookie.length < this.MAX_LENGTH);
        document.cookie = cookie;
    },

    /**
     * Retrieve all cookies. Return all cookies from current session as a single {@link String} using <b>;\s*name</b>
     * as cookie separator and <b>;\s*</b> for key/value pairs separator.
     * 
     * @return String all cookies formatted as a single String.
     */
    _getCookies : function () {
        return document.cookie;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.ua.Cookies";
    }
};

/**
 * It seems Chrome has a bug related to cookie enabled state, at least this results from google closure library.
 */
$legacy(js.ua.Engine.WEBKIT, function () {
    js.ua.Cookies.isEnabled = function () {
        // use UUID to ensure name does not collide with some one used by application code
        var name = js.util.UUID();
        this.set(name, "fake-value");
        if (this.get(name) === null) {
            return false;
        }
        this.remove(name);
        return true;
    };
});
