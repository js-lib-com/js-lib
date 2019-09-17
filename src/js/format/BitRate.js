$package("js.format");

/**
 * Bit rate has a number with two fraction digits and BPS unit separated by space like <em>23.56 Kbps</em>. Supported
 * units are listed on {@link js.format.BitRate.Unit}.
 * 
 * @author Iulian Rotaru
 * @since 1.1
 * @constructor Construct bit rate formatter instance.
 */
js.format.BitRate = function () {
    /**
     * Number format. Used to handle numeric part of this bit rate format instance.
     * 
     * @type js.format.NumberFormat
     */
    this._numberFormat = new js.format.NumberFormat();
    this._numberFormat.setGroupingUsed(true);
    this._numberFormat.setMinimumFractionDigits(2);
    this._numberFormat.setMaximumFractionDigits(2);
};

/**
 * Bit rate measurement units.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.format.BitRate.Unit = {
    /**
     * Bytes per second, displayed as <em>bit/s</em>.
     * 
     * @type String
     */
    1 : "bit/s",

    /**
     * Kilobytes per second, displayed as <em>Kbit/s</em>. A kilobyte has 1000 bytes.
     * 
     * @type String
     */
    1000 : "Kbit/s",

    /**
     * Megabytes per second, displayed as <em>Mbit/s</em>. A megabyte has 1000 kilobytes.
     * 
     * @type String
     */
    1000000 : "Mbit/s",

    /**
     * Gigabytes per second, displayed as <em>Gbit/s</em>. A gigabyte has 1000 megabytes.
     * 
     * @type String
     */
    1000000000 : "Gbit/s",

    /**
     * Terabytes per second, displayed as <em>Tbit/s</em>. A terabyte has 1000 gigabytes.
     * 
     * @type String
     */
    1000000000000 : "Tbit/s"
};

js.format.BitRate.prototype = {
    /**
     * Valid input expression.
     * 
     * @type RegExp
     */
    _VALID_INPUT : function () {
        var units = [];
        for ( var u in js.format.BitRate.Unit) {
            units.push(js.format.BitRate.Unit[u]);
        }
        return new RegExp("^([^ ]+)\\s+(" + units.join("|") + ")$", "gi");
    }(),

    /**
     * Format bit rate.
     * 
     * @param Number bitRate bit rate value to format.
     * @return String formatted bit rate.
     * @assert bit rate argument is a non strict positive number.
     */
    format : function (bitRate) {
        $assert(js.lang.Types.isNumber(bitRate), "js.format.BitRate#format", "Bit rate is not a number.");
        $assert(bitRate >= 0, "js.format.BitRate#format", "Bit rate is not positive or zero.");
        if (!bitRate) {
            return this._format(0, "1");
        }

        // workaround for precision to 5 digits
        // maximum numeric part value is 999.99 in current number format settings
        // if bitrate is 999995 is reasonable to expect 1.0 Mbps but because bitrate < Mbps threshold
        // selected unit is Kbps and after numeric part rounding formatted string is 1,000.00 Kbps
        // which is correct but not as expected; the same is true for Gbps and Tbps
        // next logic takes care to choose next units if round increases value, so Kbps -> Mbps

        var adjustToNextUnit = false;
        if (bitRate.toString().indexOf("99999") !== -1) {
            adjustToNextUnit = Math.round("0." + bitRate.toString().substr(5)) === 1;
        }

        var threshold = 0, t = 0;
        for (t in js.format.BitRate.Unit) {
            if (bitRate < t) {
                if (!adjustToNextUnit) {
                    break;
                }
                adjustToNextUnit = false;
            }
            threshold = t;
        }
        if (threshold === 0) {
            // threshold is zero if bit rate is greater or equals largest threshold
            // uses that largest threshold to format bit rate
            threshold = t;
        }
        return this._format(bitRate / Number(threshold), threshold);
    },

    /**
     * Internal format helper.
     * 
     * @param Number bitRate bit rate value,
     * @param Number threshold unit threshold value.
     * @return String bit rate string representation.
     */
    _format : function (bitRate, threshold) {
        return this._numberFormat.format(bitRate) + " " + js.format.BitRate.Unit[threshold];
    },

    /**
     * Parse bit rate string representation. Parse bit rate source string and convert resulted value to standard units.
     * 
     * @param String string source bit rate.
     * @return Number bit rate value in standard <em>bps</em> units.
     * @assert source argument is well formatted.
     */
    parse : function (string) {
        this._VALID_INPUT.lastIndex = 0;
        var m = this._VALID_INPUT.exec(string);
        $assert(m !== null && m.length === 3, "js.format.BitRate#parse", "Invalid bit rate format.");

        var value = this._numberFormat.parse(m[1]);
        var unit = m[2].toLowerCase();
        if (unit.length > 3) {
            unit = js.util.Strings.toTitleCase(unit);
        }
        for ( var t in js.format.BitRate.Unit) {
            if (js.format.BitRate.Unit[t] === unit) {
                return value * Number(t);
            }
        }
    },

    /**
     * Test if string is a valid bit rate value.
     * 
     * @param String string input to test.
     * @return Boolean true if string argument is a valid bit rate value.
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
        return "js.format.BitRate";
    }
};
$extends(js.format.BitRate, Object);
$implements(js.format.BitRate, js.format.Format);
