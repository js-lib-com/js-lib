$package("js.format");

/**
 * Time duration - in milliseconds, formatter has a numeric part with two fraction digits and duration units, separated by space,
 * <em>12.34 sec.</em>. Supported units are listed on {@link js.format.Duration.Unit}.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct file size formatter instance.
 */
js.format.Duration = function() {
	/**
	 * Number format. Used to handle numeric part of this duration format instance.
	 * 
	 * @type js.format.NumberFormat
	 */
	this._numberFormat = new js.format.NumberFormat();
	this._numberFormat.setGroupingUsed(true);
	this._numberFormat.setMinimumFractionDigits(2);
	this._numberFormat.setMaximumFractionDigits(2);

	var units = [];
	for ( var t in js.format.Duration.Unit) {
		units.push(js.format.Duration.Unit[t]);
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
js.format.Duration.Unit = {
	/**
	 * Milliseconds, duration base units..
	 * 
	 * @type String
	 */
	1 : "msec.",

	/**
	 * Seconds = 1,000 milliseconds.
	 * 
	 * @type String
	 */
	1000 : "sec.",

	/**
	 * Minutes = 60 seconds = 60,000 milliseconds.
	 * 
	 * @type String
	 */
	60000 : "min.",

	/**
	 * Hours = 60 minutes = 3,600,000 milliseconds.
	 * 
	 * @type String
	 */
	3600000 : "hr.",

	/**
	 * Days = 24 hours = 86,400,000 milliseconds.
	 * 
	 * @type String
	 */
	86400000 : "days",

	/**
	 * Month = 30 days = 2,592,000,000 milliseconds.
	 * 
	 * @type String
	 */
	2592000 : "months",

	/**
	 * Years = 365 days = 946,080,000,000 milliseconds.
	 * 
	 * @type String
	 */
	946080000000 : "years"
};

js.format.Duration.prototype = {
	/**
	 * Valid input expression.
	 * 
	 * @type RegExp
	 */
	_VALID_INPUT : function() {
		var units = [];
		for ( var u in js.format.Duration.Unit) {
			units.push(js.format.Duration.Unit[u]);
		}
		return new RegExp("^([^ ]+)\\s+(" + units.join("|") + ")$", "gi");
	}(),

	/**
	 * Format time duration.
	 * 
	 * @param Number duration duration value to format.
	 * @return String formatted duration.
	 * @assert duration argument is a positive number.
	 */
	format : function(duration) {
		$assert(js.lang.Types.isNumber(duration), "js.format.Duration#format", "Duration is not a number.");
		$assert(duration >= 0, "js.format.Duration#format", "Duration is not positive.");
		if (!duration) {
			return this._format(0, "1");
		}

		var threshold = 0, t = 0;
		for (t in js.format.Duration.Unit) {
			if (duration < t) {
				break;
			}
			threshold = t;
		}
		if (threshold === 0) {
			// threshold is zero if duration is greater or equals largest threshold
			// uses that largest threshold to format duration value
			threshold = t;
		}
		return this._format(duration / Number(threshold), threshold);
	},

	/**
	 * Internal format helper.
	 * 
	 * @param Number duration duration value to format.
	 * @param Number threshold unit threshold value.
	 * @return String formatted duration value.
	 */
	_format : function(duration, threshold) {
		return this._numberFormat.format(duration) + " " + js.format.Duration.Unit[threshold];
	},

	/**
	 * Parse time duration string representation. Parse duration source string and convert resulted value to standard
	 * units.
	 * 
	 * @param String string source duration.
	 * @return Number duration value in standard <em>milliseconds</em> units.
	 * @assert source argument is well formatted.
	 */
	parse : function(string) {
		this._VALID_INPUT.lastIndex = 0;
		var m = this._VALID_INPUT.exec(string);
		$assert(m !== null && m.length === 3, "js.format.Duration#parse", "Invalid duration format.");

		var value = this._numberFormat.parse(m[1]);
		var unit = m[2];
		for ( var t in js.format.Duration.Unit) {
			if (js.format.Duration.Unit[t] === unit) {
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
	test : function(string) {
		this._VALID_INPUT.lastIndex = 0;
		var m = this._VALID_INPUT.exec(string);
		return (m !== null && typeof m[1] !== "undefined") ? this._numberFormat.test(m[1]) : false;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.format.Duration";
	}
};
$extends(js.format.Duration, Object);
$implements(js.format.Duration, js.format.Format);
