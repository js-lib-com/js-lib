$package("js.lang");

/**
 * JSON support. Extend native JSON object with support for {@link Date} object de-serialization.
 */
js.lang.JSON = {
    /**
     * Parse JSON constructs. This parser method accepts a string that conform with JSON grammar and produce a value.
     * 
     * @param String json string containing JSON constructs needed to be parsed.
     * @return Object value described by given <em>json</em> string.
     * @assert <em>json</em> argument is not undefined, null or empty.
     */
    parse : function (json) {
        $assert(json, "js.lang.JSON#parse", "JSON string is undefined, null or empty.");
        return JSON.parse(json, function (key, value) {
            if (js.lang.Types.isString(value)) {
                var d = js.lang.JSON._json2date(value);
                if (d !== null) {
                    return d;
                }
            }
            return value;
        });
    },

    /**
     * Serialize a given value to a string in JSON format. Value to stringify is usually an {@link Object} or
     * {@link Array} but it can also be a {@link String}, {@link Boolean}, {@link Number} or null. Note that
     * accordingly JSON specifications strings are double quoted. So, if one uses this method to stringify a date - that
     * is converted to a string, should take care to remove quotations.
     * 
     * @param Object value object to be serialized as JSON
     * @return String a string in JSON format representing given value.
     * @assert <em>value</em> argument is not undefined.
     */
    stringify : function (value) {
        $assert(typeof value !== "undefined", "js.lang.JSON#stringify", "Value is undefined.");
        return JSON.stringify(value);
    },

    /**
     * Load object from JSON remote file located by given URL.
     * 
     * @param String url remote file URL,
     * @param Function callback callback,
     * @param Object scope callback execution scope.
     * @assert arguments are of expected type.
     */
    load : function (url, callback, scope) {
        $assert(js.lang.Types.isString(url), "js.lang.JSON#load", "URL is not string.");
        $assert(js.lang.Types.isFunction(callback), "js.lang.JSON#load", "Callback is not a function.");
        $assert(js.lang.Types.isStrictObject(scope), "js.lang.JSON#load", "Scope is not strict object.");

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onreadystatechange = handler.bind(this);
        xhr.send();

        function handler (evtXHR) {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 || xhr.status < 300) {
                    callback.call(scope, JSON.parse(xhr.responseText));
                }
                else {
                    js.ua.System.alert("Invocation Errors Occured");
                }
            }
        }
    },

    /**
     * Regular expression describing the date format. It is based on ISO8601 date representation; e.g.
     * 1964-03-15T13:40:00.000Z
     * 
     * @type RegExp
     */
    _REX_DATE : /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z$/i,

    /**
     * Convert a ISO8601 date string into a {@link Date} object. j(s)-lib uses that format for conveying dates instances
     * between server and client. This method is used by {@link #parse} reviver to convert date strings.
     * 
     * @param String json date represented as a string in ISO8601 format.
     * @return Date date object initialized from given string representation.
     */
    _json2date : function (json) {
        // if given argument is not a valid json date it can have arbitrary length, including large
        // i"m pretty sure regexp#match is smart enough to quickly exit and i do not filter json argument by length

        this._REX_DATE.lastIndex = 0;
        var m = json.match(this._REX_DATE);
        if (m === null) {
            return null;
        }
        if (typeof m[7] === "undefined") {
            // WebKit and Presto doesn"t use milliseconds while Trident and Gecko does
            // defaults milliseconds to zero if missing
            m[7] = 0;
        }
        m.shift(); // m[0] is matched string, i.e. the ISO8601 date representation
        m[1] -= 1; // convert month ordinal into index

        // serialized JSON date is UTC date, that why ends with "Z"
        // first uses Date#UTC to get the UTC time - number of milliseconds from epoch
        // then create a local date instance
        // so, if UTC time is 0 create date instance if Thu Jan 01 1970 02:00:00 GMT+0200, in my case
        return new Date(Date.UTC.apply(Date.UTC, m));
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.lang.JSON";
    }
};

$legacy(js.ua.Engine.TRIDENT, function () {
    Date.prototype.toJSON = function () {
        function f (n) {
            return n < 10 ? "0" + n : n;
        }
        return this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z";
    };
});
