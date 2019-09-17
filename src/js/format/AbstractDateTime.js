$package("js.format");

/**
 * Date/time formatters base class. This is the base class for predefined date/time formatter classes supplied by this
 * library. If none is suitable one may decide to create his own class.
 * <p>
 * Here is a code snippet for creating user defined date format class:
 * 
 * <pre>
 * CustomDateFormat = function() {
 *  this.$super(new js.format.DateFormat("yyyy-MM-dd HH:mm:ss"));
 * };
 * $extends(CustomDateFormat, js.format.AbstractDateTime);
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct date/time format instance.
 * 
 * @param js.format.DateFormat dateFormat date/time format utility.
 */
js.format.AbstractDateTime = function (dateFormat) {
    $assert(dateFormat instanceof js.format.DateFormat, "js.format.AbstractDateTime#AbstractDateTime", "Argument is not a date format utility.");

    /**
     * Date format utility.
     * 
     * @type js.format.DateFormat
     */
    this._dateFormat = dateFormat;
};

js.format.AbstractDateTime.prototype = {
    /**
     * Format date. Format given date instance using internal {@link #_dateFormat} and return string date. Returns empty
     * string if <em>date</em> argument is null or is not a valid date instance or Unix Time Stamp.
     * 
     * @param Object date date instance or Unix Time Stamp.
     * @return String formated date or empty string.
     * @assert date argument is a date instance.
     */
    format : function (date) {
        if (date === null) {
            return "";
        }
        if(js.lang.Types.isNumber(date)) {
        	date = new Date(date);
        }
        $assert(js.lang.Types.isDate(date), "js.format.AbstractDateTime#format", "Argument is not a date.");
        if (!js.lang.Types.isDate(date)) {
            return "";
        }
        return this._dateFormat.format(date);
    },

    /**
     * Parse date string. Parse given date string and return newly created date instance. Returns null is argument is
     * not a no empty string.
     * 
     * @param String source date string to parse.
     * @return Date date instance.
     * @assert source argument is non empty string.
     */
    parse : function (source) {
        if (!source) {
            return null;
        }
        $assert(js.lang.Types.isString(source), "js.format.AbstractDateTime#parse", "Source is not a string.");
        if (!js.lang.Types.isString(source)) {
            return null;
        }
        return this._dateFormat.parse(source);
    },

    /**
     * Test if date string is well formatted.
     * 
     * @param String source date string.
     * @return Boolean true if given date string is well formatted.
     */
    test : function (source) {
        return this._dateFormat.test(source);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.format.AbstractDateTime";
    }
};
$extends(js.format.AbstractDateTime, Object);
$implements(js.format.AbstractDateTime, js.format.Format);
