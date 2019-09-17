$package("js.format");

/**
 * File size formatter has a numeric part with two fraction digits and file size units, separated by space,
 * <em>756.43 KB</em>. Supported units are listed on {@link js.format.FileSize.Unit}.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct file size formatter instance.
 */
js.format.FileSize = function () {
    /**
     * Number format. Used to handle numeric part of this file size format instance.
     * 
     * @type js.format.NumberFormat
     */
    this._numberFormat = new js.format.NumberFormat();
    this._numberFormat.setGroupingUsed(true);
    this._numberFormat.setMinimumFractionDigits(2);
    this._numberFormat.setMaximumFractionDigits(2);

    var units = [];
    for ( var t in js.format.FileSize.Unit) {
        units.push(js.format.FileSize.Unit[t]);
    }
    /**
     * Valid input expression.
     * 
     * @type RegExp
     */
    this._validInput = new RegExp("^([^ ]+)\\s+(" + units.join("|") + ")$", "gi");
};

/**
 * File size measurement units.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.format.FileSize.Unit = {
    /**
     * Bytes, displayed as <em>B</em>.
     * 
     * @type String
     */
    1 : "B",

    /**
     * Kilobytes, displayed as <em>KB</em>. A kilobyte has 1024 bytes.
     * 
     * @type String
     */
    1024 : "KB",

    /**
     * Megabytes, displayed as <em>MB</em>. A megabyte has 1024 kilobytes.
     * 
     * @type String
     */
    1048576 : "MB",

    /**
     * Gigabytes, displayed as <em>GB</em>. A gigabyte has 1024 megabytes.
     * 
     * @type String
     */
    1073741824 : "GB",

    /**
     * Terabytes, displayed as <em>TB</em>. A terabyte has 1024 gigabytes.
     * 
     * @type String
     */
    1099511627776 : "TB"
};

js.format.FileSize.prototype = {
    /**
     * Valid input expression.
     * 
     * @type RegExp
     */
    _VALID_INPUT : function () {
        var units = [];
        for ( var u in js.format.FileSize.Unit) {
            units.push(js.format.FileSize.Unit[u]);
        }
        return new RegExp("^([^ ]+)\\s+(" + units.join("|") + ")$", "gi");
    }(),

    /**
     * Format file size.
     * 
     * @param Number fileSize file size to format.
     * @return String formatted file size.
     * @assert file size argument is a positive number.
     */
    format : function (fileSize) {
        $assert(js.lang.Types.isNumber(fileSize), "js.format.FileSize#format", "File size is not a number.");
        $assert(fileSize >= 0, "js.format.FileSize#format", "File size is not positive.");
        if (!fileSize) {
            return this._format(0, "1");
        }

        var threshold = 0, t = 0;
        for (t in js.format.FileSize.Unit) {
            if (fileSize < t) {
                break;
            }
            threshold = t;
        }
        if (threshold === 0) {
            // threshold is zero if file size is greater or equals largest threshold
            // uses that largest threshold to format file size
            threshold = t;
        }
        return this._format(fileSize / Number(threshold), threshold);
    },

    /**
     * Internal format helper.
     * 
     * @param Number fileSize file size to format.
     * @param Number threshold unit threshold value.
     * @return String formatted file size.
     */
    _format : function (fileSize, threshold) {
        return this._numberFormat.format(fileSize) + " " + js.format.FileSize.Unit[threshold];
    },

    /**
     * Parse file size string representation. Parse file size source string and convert resulted value to standard
     * units.
     * 
     * @param String string source file size.
     * @return Number file size value in standard <em>B</em> units.
     * @assert source argument is well formatted.
     */
    parse : function (string) {
        this._VALID_INPUT.lastIndex = 0;
        var m = this._VALID_INPUT.exec(string);
        $assert(m !== null && m.length === 3, "js.format.FileSize#parse", "Invalid file size format.");

        var value = this._numberFormat.parse(m[1]);
        var unit = m[2].toUpperCase();
        for ( var t in js.format.FileSize.Unit) {
            if (js.format.FileSize.Unit[t] === unit) {
                return value * Number(t);
            }
        }
    },

    /**
     * Test if string is a valid file size.
     * 
     * @param String string input to test.
     * @return Boolean true if string value is a valid file size.
     */
    test : function (string) {
        this._VALID_INPUT.lastIndex = 0;
        var m = this._VALID_INPUT.exec(string);
        return (m !== null && typeof m[1] !== "undefined") ? this._numberFormat.test(m[1]) : false;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.format.FileSize";
    }
};
$extends(js.format.FileSize, Object);
$implements(js.format.FileSize, js.format.Format);
