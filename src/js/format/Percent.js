$package("js.format");

/**
 * Percent has a standard number followed by percent sign, <em>92.45%</em>.
 * 
 * @author Iulian Rotaru
 * @since 1.1
 * @constructor Construct percent formatter instance.
 */
js.format.Percent = function () {
    /**
     * Number format. Used to handle numeric part of this currency format instance.
     * 
     * @type js.format.NumberFormat
     */
    this._numberFormat = new js.format.NumberFormat("@string/percent-format");
    this._numberFormat.setGroupingUsed(true);
    this._numberFormat.setMinimumFractionDigits(2);
    this._numberFormat.setMaximumFractionDigits(2);
};

js.format.Percent.prototype = {
    format : function (percent) {
        $assert(js.lang.Types.isNumber(percent), "js.format.Percent#format", "Percent is not a number.");
        return this._numberFormat.format(100 * percent);
    },

    parse : function (string) {
        return this._numberFormat.parse(string) / 100;
    },

    test : function (string) {
        return this._numberFormat.test(string);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.format.Percent";
    }
};
$extends(js.format.Percent, Object);
$implements(js.format.Percent, js.format.Format);
