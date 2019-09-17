$package("js.format");

/**
 * Standard number uses grouping and exactly two digits for fractional part.
 * 
 * @author Iulian Rotaru
 * @constructor Construct standard number format instance.
 */
js.format.Number = function () {
    /**
     * Number format used internally to render numeric values.
     * 
     * @type js.format.NumberFormat
     */
    this._numberFormat = new js.format.NumberFormat();
    this._numberFormat.setGroupingUsed(true);
    this._numberFormat.setMinimumFractionDigits(2);
    this._numberFormat.setMaximumFractionDigits(2);
};

js.format.Number.prototype = {
    format : function (number) {
        return this._numberFormat.format(number);
    },

    parse : function (string) {
        return this._numberFormat.parse(string);
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
        return "js.format.Number";
    }
};
$extends(js.format.Number, Object);
$implements(js.format.Number, js.format.Format);
