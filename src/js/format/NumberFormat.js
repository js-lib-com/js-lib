$package("js.format");

/**
 * Number format utility. Known limitations: lack of support for scientific notation.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor COnstruct number format instance.
 * 
 * @param String pattern optional number format pattern.
 */
js.format.NumberFormat = function (pattern) {
    var l = js.ua.Regional.language;
    var c = js.ua.Regional.country;
    var key = l.charAt(0).toUpperCase() + l.charAt(1) + "_" + c;

    var symbols = js.format.NumberFormat[key];
    if (typeof symbols === "undefined") {
        symbols = js.format.NumberFormat.En_US;
    }

    /**
     * Number format pattern.
     * 
     * @type String
     */
    this._pattern = pattern;

    /**
     * Decimal separator.
     * 
     * @type String
     */
    this._decimalSeparator = symbols.decimalSeparator;

    /**
     * Grouping separator.
     * 
     * @type String
     */
    this._groupingSeparator = symbols.groupingSeparator;

    /**
     * Grouping usage. Default to false.
     * 
     * @type Boolean
     */
    this._groupingUsed = false;

    /**
     * Minimum fraction digits.
     * 
     * @type Number
     */
    this._minimumFractionDigits = 0;

    /**
     * Maximum fraction digits.
     * 
     * @type Number
     */
    this._maximumFractionDigits = Number.POSITIVE_INFINITY;

    /**
     * Minimum integer digits.
     * 
     * @type Number
     */
    this._minimumIntegerDigits = 0;

    /**
     * Maximum integer digits.
     * 
     * @type Number
     */
    this._maximumIntegerDigits = Number.POSITIVE_INFINITY;

    /**
     * Valid input expression.
     * 
     * @type RegExp
     */
    this._validInput = null;
    this._compile();
};

js.format.NumberFormat.prototype = {
    /**
     * Set whether or not grouping will be used in this format.
     * 
     * @param Boolean value
     * @return js.format.NumberFormat this object.
     * @assert value argument is not undefined or null and is a {@link Boolean}.
     */
    setGroupingUsed : function (value) {
        $assert(js.lang.Types.isBoolean(value), "js.format.NumberFormat#setGroupingUsed", "Value is not boolean.");
        this._groupingUsed = value;
        return this;
    },

    /**
     * Sets the minimum number of digits allowed in the fraction portion of a number. minimumFractionDigits must be <=
     * maximumFractionDigits. If the new value for minimumFractionDigits exceeds the current value of
     * maximumFractionDigits, then maximumIntegerDigits will also be set to the new value.
     * 
     * @param Number value the minimum number of fraction digits to be shown.
     * @return js.format.NumberFormat this object.
     * @assert value argument is not undefined or null and is a {@link Number}.
     */
    setMinimumFractionDigits : function (value) {
        $assert(js.lang.Types.isNumber(value), "js.format.NumberFormat#setMinimumFractionDigits", "Value is not a number.");
        this._minimumFractionDigits = value;
        if (this._minimumFractionDigits > this._maximumFractionDigits) {
            this._maximumFractionDigits = this._minimumFractionDigits;
        }
        return this;
    },

    /**
     * 
     * @param Number value
     * @return js.format.NumberFormat this object.
     * @assert value argument is not undefined or null and is a {@link Number}.
     */
    setMaximumFractionDigits : function (value) {
        $assert(js.lang.Types.isNumber(value), "js.format.NumberFormat#setMaximumFractionDigits", "Value is not a number.");
        this._maximumFractionDigits = value;
        if (this._maximumFractionDigits < this._minimumFractionDigits) {
            this._minimumFractionDigits = this._maximumFractionDigits;
        }
        return this;
    },

    /**
     * 
     * @param Number value
     * @return js.format.NumberFormat this object.
     * @assert value argument is not undefined or null and is a {@link Number}.
     */
    setMinimumIntegerDigits : function (value) {
        $assert(js.lang.Types.isNumber(value), "js.format.NumberFormat#setMinimumIntegerDigits", "Value is not a number.");
        this._minimumIntegerDigits = value;
        if (this._minimumIntegerDigits > this._maximumIntegerDigits) {
            this._maximumIntegerDigits = this._minimumIntegerDigits;
        }
        return this;
    },

    /**
     * 
     * @param Number value
     * @return js.format.NumberFormat this object.
     * @assert value argument is not undefined or null and is a {@link Number}.
     */
    setMaximumIntegerDigits : function (value) {
        $assert(js.lang.Types.isNumber(value), "js.format.NumberFormat#setMaximumIntegerDigits", "Value is not a number.");
        this._maximumIntegerDigits = value;
        if (this._maximumIntegerDigits < this._minimumIntegerDigits) {
            this._minimumIntegerDigits = this._maximumIntegerDigits;
        }
        return this;
    },

    /**
     * Format number.
     * 
     * @param Number number number to format.
     * @return String formatted number.
     */
    format : function (number) {
        var formattedNumber = this._formatNumericPart(number);
        return typeof this._pattern === "undefined" ? formattedNumber : this._injectNumericPart(formattedNumber);
    },

    _formatNumericPart : function (number) {
        $assert(js.lang.Types.isNumber(number), "js.format.NumberFormat#_formatNumericPart", "Argument is not a number.");

        var value = number.toString();
        var parts = value.split(".");
        var integerPart = parts[0], i;
        var fractionalPart = parts.length > 1 ? parts[1] : "";

        if (fractionalPart.length > this._maximumFractionDigits) {
            if (this._maximumFractionDigits === 0) {
                integerPart = (Number(integerPart) + Math.round("0." + fractionalPart)).toString();
                fractionalPart = "";
            }
            else {
                fractionalPart = this._round(fractionalPart, this._maximumFractionDigits);
                if (fractionalPart.length > this._maximumFractionDigits) {
                    fractionalPart = fractionalPart.substr(fractionalPart.length - this._maximumFractionDigits);
                    integerPart = (Number(integerPart) + 1).toString();
                }
            }
        }
        for (i = fractionalPart.length; i < this._minimumFractionDigits; ++i) {
            fractionalPart += "0";
        }

        for (i = integerPart.length; i < this._minimumIntegerDigits; ++i) {
            integerPart = "0" + integerPart;
        }
        if (integerPart.length > this._maximumIntegerDigits) {
            integerPart = this._round(integerPart, this._maximumIntegerDigits);
        }
        if (this._groupingUsed) {
            var rex = /(\d+)(\d{3})/;
            while (rex.test(integerPart)) {
                integerPart = integerPart.replace(rex, "$1" + this._groupingSeparator + "$2");
            }
        }

        value = integerPart;
        if (fractionalPart) {
            value += (this._decimalSeparator + fractionalPart);
        }
        return value;
    },

    /**
     * Parse numeric string. If given string is empty return 0 since is considered optional numeric value.
     * 
     * @param String string numeric string to parse.
     * @return Number number value extracted from given string.
     */
    parse : function (string) {
        if (string.length === 0) {
            return 0;
        }
        if (typeof this._pattern !== "undefined") {
            string = this._extractNumericPart(string);
        }
        return this._parseNumericPart(string);
    },

    _parseNumericPart : function (string) {
        $assert(string, "js.format.NumberFormat#_parseNumericPart", "Argument is not a string.");
        if (!string) {
            return null;
        }
        if (this._groupingUsed) {
            var rex = new RegExp(js.util.Strings.escapeRegExp(this._groupingSeparator), "g");
            string = string.replace(rex, "");
        }
        if (this._decimalSeparator !== ".") {
            string = string.replace(this._decimalSeparator, ".");
        }
        return Number(string);
    },

    /**
     * Check numeric string validity. If this number format has no pattern this method falls to
     * {@link #_testNumericPart}.
     * 
     * @param String text numeric string to check for validity.
     * @return Boolean true if given string is a valid numeric value.
     */
    test : function (text) {
        if (typeof this._pattern === "undefined") {
            return this._testNumericPart(text);
        }

        var patternIndex = 0;
        var pattern = this._pattern;
        var textIndex = 0;
        var c;

        function skipNumericPart () {
            c = pattern.charAt(++patternIndex);
            while (textIndex < text.length && c !== text.charAt(textIndex)) {
                ++textIndex;
            }
            return textIndex;
        }

        for (; patternIndex < pattern.length; ++patternIndex, ++textIndex) {
            if (pattern.charAt(patternIndex) === "#") {
                if (!this._testNumericPart(text.substring(textIndex, skipNumericPart()))) {
                    return false;
                }
            }
            if (!js.util.Strings.equalsIgnoreCase(pattern.charAt(patternIndex), text.charAt(textIndex))) {
                return false;
            }
        }
        return true;
    },

    _testNumericPart : function (text) {
        if (!js.lang.Types.isString(text) || text.length === 0) {
            return false;
        }
        function isDigit (c) {
            return c >= "0" && c <= "9";
        }
        var i = 0;
        if (text.charAt(0) === "+" || text.charAt(0) === "-") {
            ++i;
        }
        for ( var c; i < text.length; ++i) {
            c = text.charAt(i);
            if (isDigit(c) || c === this._decimalSeparator) {
                continue;
            }
            if (this._groupingUsed && c === this._groupingSeparator) {
                continue;
            }
            return false;
        }
        return true;
    },

    /**
     * Inject numeric part. Inject formatted numeric part into this number format pattern and return resulted string.
     * 
     * @param String numericPart formatted numeric part.
     * @return String formatted pattern with numeric part injected.
     */
    _injectNumericPart : function (numericPart) {
        return this._pattern.replace("#", numericPart);
    },

    /**
     * Extract numeric part. Extract numeric part from given source string. Source should be formatted accordingly this
     * number format pattern. For example, assuming pattern is <em># LEI</em> and if given source is
     * <em>123,45 LEI</em> this method returns <em>123,45</em>.
     * 
     * @param String source source string.
     * @return String numeric part from given source string or null if pattern does not match.
     */
    _extractNumericPart : function (source) {
        $assert(this._validInput !== null, "js.format.NumberFormat#_extractNumericPart", "Invalid input.");
        this._validInput.lastIndex = 0;
        var m = this._validInput.exec(source);
        $assert(m !== null, "js.format.NumberFormat#_extractNumericPart", "Source does not match.");
        if (m === null) {
            return null;
        }
        $assert(typeof m[1] !== "undefined", "js.format.NumberFormat#_extractNumericPart", "Source does not match.");
        if (typeof m[1] === "undefined") {
            return null;
        }
        return m[1];
    },

    _round : function (number, digitsCount) {
        if (digitsCount === 0) {
            return "";
        }
        var s = number.substr(0, digitsCount) + "." + number.substr(digitsCount);
        s = Math.round(Number(s)).toString();
        while (s.length < digitsCount) {
            s = "0" + s;
        }
        return s;
    },

    _compile : function () {
        if (typeof this._pattern !== "undefined") {
            var rex = "([0-9" + this._decimalSeparator + this._groupingSeparator + "]+)";
            this._validInput = new RegExp("^" + js.util.Strings.escapeRegExp(this._pattern).replace("#", rex) + "$", "g");
        }
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.format.NumberFormat";
    }
};
$extends(js.format.NumberFormat, Object);
$implements(js.format.NumberFormat, js.format.Format);

js.format.NumberFormat.En_US = {
    decimalSeparator : ".",
    groupingSeparator : ",",
    infinity : "infinity"
};

js.format.NumberFormat.De_CH = {
    decimalSeparator : "'",
    groupingSeparator : ".",
    infinity : "unendlich"
};

js.format.NumberFormat.Ro_RO = {
    decimalSeparator : ",",
    groupingSeparator : ".",
    infinity : "infinit"
};
