$package("js.format");

/**
 * Currency format has a numeric part with grouping and two fraction digits and a currency string separated by space,
 * like <em>12.35 LEI</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct currency format instance.
 */
js.format.Currency = function () {
    /**
     * Number format. Used to handle numeric part of this currency format instance.
     * 
     * @type js.format.NumberFormat
     */
    this._numberFormat = new js.format.NumberFormat("@string/currency-format");
    this._numberFormat.setGroupingUsed(true);
    this._numberFormat.setMinimumFractionDigits(2);
    this._numberFormat.setMaximumFractionDigits(2);
};

js.format.Currency.prototype = {
    /**
     * Format currency.
     * 
     * @param Number currency number to be formatted as currency.
     * @return String string representation.
     * @assert <em>currency</em> argument is a numeric value.
     */
    format : function (currency) {
        $assert(js.lang.Types.isNumber(currency), "js.format.Currency#format", "Currency is not a number.");
        return this._numberFormat.format(currency);
    },

    /**
     * Parse currency string.
     * 
     * @param String string currency string value.
     * @return Number numeric currency value.
     */
    parse : function (string) {
        return this._numberFormat.parse(string);
    },

    /**
     * Test if string value represent a valid currency.
     * 
     * @param String string currency string value to test.
     * @return Boolean true if argument is a valid currency.
     */
    test : function (string) {
        return this._numberFormat.test(string);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.format.Currency";
    }
};
$extends(js.format.Currency, Object);
$implements(js.format.Currency, js.format.Format);
