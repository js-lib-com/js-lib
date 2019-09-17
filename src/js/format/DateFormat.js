$package("js.format");

/**
 * Date/time format utility. DateFormat is a class for formatting and parsing dates in a locale-sensitive manner. Using
 * date format class is a two steps process: create date format instance supplying desired format patterns and call
 * {@link #format}, {@link #parse} or {@link #test} methods.
 * 
 * <pre>
 * var format = new js.format.DateFormat("yyyy-MM-dd HH:mm:ss");
 * var string = format.format(new Date());
 * </pre>
 * 
 * Anyway, is always a good practice to use one of predefined classes present into this package in order to have
 * applications with uniform date representation.
 * <p>
 * This class is a port of java.text.DateFormat class. There is an excellent documentation on API for Java class; here
 * we limit to couple examples: <table>
 * <tr>
 * <td><b>Date and Time Pattern
 * <td><b>Result
 * <tr>
 * <td>"yyyy.MM.dd 'at' HH:mm:ss z"
 * <td>2001.07.04 at 12:08:56 +0200
 * <tr>
 * <td>"EEE, MMM d, ''yy"
 * <td>Wed, Jul 4, '01
 * <tr>
 * <td>"h:mm a"
 * <td>12:08 PM
 * <tr>
 * <td>"hh 'o''clock' a, zzzz"
 * <td>12 o'clock PM, +0200
 * <tr>
 * <td>"yyyyy.MMMMM.dd hh:mm aaa"
 * <td>2001.July.04 12:08 PM
 * <tr>
 * <td>"EEE, d MMM yyyy HH:mm:ss Z"
 * <td>Wed, 4 Jul 2001 12:08:56 -0700
 * <tr>
 * <td>"yyMMddHHmmssZ"
 * <td>010704120856-0700
 * <tr>
 * <td>"yyyy-MM-dd'T'HH:mm:ss.SSSZ"
 * <td>2001-07-04T12:08:56.235-0700</table>
 * 
 * <p>
 * There are couple limitations on Java porting. Here are the known ones:
 * <ul>
 * <li>textual patterns can"t be adjacent
 * <li>z - short and full time zone is processed as RFC822 format
 * <li>G - era designator is not implemented
 * <li>w - week in year is not implemented
 * <li>W - week in month is not implemented
 * <li>D - day in year is not implemented
 * <li>F - day of week in month is not implemented
 * <li>u - day number of week
 * <li>k, K - hour in day in format (1-24) is not implemented
 * <li>X - ISO 8601 time zone is not implemented
 * </ul>
 * Also, time zone logic is based on {@link Date#getTimezoneOffset} and there are not confirmed rumors it is not dealing
 * well with daylight saving.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct date/time format instance.
 * 
 * @param String pattern date/time format pattern.
 */
js.format.DateFormat = function(pattern) {
	$assert(js.lang.Types.isString(pattern), "js.format.DateFormat#DateFormat", "Pattern is not a string.");

	/**
	 * Date format pattern. See class description for details.
	 * 
	 * @type String
	 */
	this._pattern = pattern;

	/**
	 * Locale-sensitive date format symbols. Stores date-time formatting data, such as the names of the months and the
	 * names of the days of the week.
	 * 
	 * @type js.format.DateFormatSymbols
	 */
	this._symbols = new js.format.DateFormatSymbols();

	/**
	 * Valid date input expression compiled from {@link #_pattern format pattern}.
	 * 
	 * @type RegExp
	 */
	this._validInput = null;
	this._compile();
};

/**
 * Short date format.
 * 
 * @type Number
 */
js.format.DateFormat.SHORT = 1;

/**
 * Medium date format.
 * 
 * @type Number
 */
js.format.DateFormat.MEDIUM = 2;

/**
 * Long date format.
 * 
 * @type Number
 */
js.format.DateFormat.LONG = 3;

/**
 * Full date format.
 * 
 * @type Number
 */
js.format.DateFormat.FULL = 4;

/**
 * Date format styles.
 */
js.format.DateFormat.DATE_STYLES = {
	/**
	 * Short date format.
	 * 
	 * @type String
	 */
	1 : "shortDate",

	/**
	 * Medium date format.
	 * 
	 * @type String
	 */
	2 : "mediumDate",

	/**
	 * Long date format.
	 * 
	 * @type String
	 */
	3 : "longDate",

	/**
	 * Full date format.
	 * 
	 * @type String
	 */
	4 : "fullDate"
};

/**
 * Time format styles.
 */
js.format.DateFormat.TIME_STYLES = {
	/**
	 * Short time format.
	 * 
	 * @type String
	 */
	1 : "shortTime",

	/**
	 * Medium time format.
	 * 
	 * @type String
	 */
	2 : "mediumTime",

	/**
	 * Long time format.
	 * 
	 * @type String
	 */
	3 : "longTime",

	/**
	 * Full time format.
	 * 
	 * @type String
	 */
	4 : "fullTime"
};

js.format.DateFormat.getDateTimeInstance = function(dateStyle, timeStyle) {
	var symbols = new js.format.DateFormatSymbols();
	var datePattern = symbols.patterns[this.DATE_STYLES[dateStyle]];
	var timePattern = symbols.patterns[this.TIME_STYLES[timeStyle]];
	return new js.format.DateFormat(datePattern + " " + timePattern);
};

js.format.DateFormat.getDateInstance = function(style) {
	var symbols = new js.format.DateFormatSymbols();
	var datePattern = symbols.patterns[this.DATE_STYLES[style]];
	return new js.format.DateFormat(datePattern);
};

js.format.DateFormat.getTimeInstance = function(style) {
	var symbols = new js.format.DateFormatSymbols();
	var timePattern = symbols.patterns[this.TIME_STYLES[style]];
	return new js.format.DateFormat(timePattern);
};

/**
 * Pattern formatters. Utility class supplying formatters for every date pattern construct.
 */
js.format.DateFormat.PatternFormatters = {
	/**
	 * Locale sensitive date formatting symbols.
	 * 
	 * @type js.format.DateFormatSymbols
	 */
	symbols : null,

	/**
	 * Date instance to apply formats to.
	 * 
	 * @type Date
	 */
	date : null,

	/**
	 * Truncated year, alias for {@link #yy}.
	 * 
	 * @return String truncated year.
	 */
	y : function() {
		return this.truncateYear(this.date.getFullYear());
	},

	/**
	 * Truncated year, <em>14</em> for <em>2014</em>.
	 * 
	 * @return String truncated year.
	 */
	yy : function() {
		return this.truncateYear(this.date.getFullYear());
	},

	/**
	 * Full year, alias for {@link #yyyy}.
	 * 
	 * @return String full year.
	 */
	yyy : function() {
		return this.date.getFullYear().toString();
	},

	/**
	 * Full year, <em>2014</em>.
	 * 
	 * @return String full year.
	 */
	yyyy : function() {
		return this.date.getFullYear().toString();
	},

	/**
	 * Unformatted month ordinal, January is <em>1</em>.
	 * 
	 * @return String unformatted month ordinal.
	 */
	M : function() {
		return (this.date.getMonth() + 1).toString();
	},

	/**
	 * Two digits month ordinal, January is <em>01</em>.
	 * 
	 * @return String two digits month ordinal.
	 */
	MM : function() {
		return this.pad(this.date.getMonth() + 1, 2);
	},

	/**
	 * Locale sensitive month short name.
	 * 
	 * @return String month short name.
	 */
	MMM : function() {
		return this.symbols.shortMonths[this.date.getMonth()];
	},

	/**
	 * Locale sensitive month full name.
	 * 
	 * @return String month full name.
	 */
	MMMM : function() {
		return this.symbols.fullMonths[this.date.getMonth()];
	},

	/**
	 * Unformatted day of month ordinal, first day is <em>1</em>.
	 * 
	 * @return String day ordinal.
	 */
	d : function() {
		return this.date.getDate();
	},

	/**
	 * Two digits day of the month ordinal, first day is <em>01</em>
	 * 
	 * @return String day ordinal.
	 */
	dd : function() {
		return this.pad(this.date.getDate(), 2);
	},

	/**
	 * Locale sensitive short week day name, alias for {@link #EEE}.
	 * 
	 * @return String short week day.
	 */
	E : function() {
		return this.symbols.shortWeekDays[this.date.getDay()];
	},

	/**
	 * Locale sensitive short week day name, alias for {@link #EEE}.
	 * 
	 * @return String short week day.
	 */
	EE : function() {
		return this.symbols.shortWeekDays[this.date.getDay()];
	},

	/**
	 * Locale sensitive short week day name.
	 * 
	 * @return String short week day.
	 */
	EEE : function() {
		return this.symbols.shortWeekDays[this.date.getDay()];
	},

	/**
	 * Locale sensitive full week day name.
	 * 
	 * @return String full week day.
	 */
	EEEE : function() {
		return this.symbols.fullWeekDays[this.date.getDay()];
	},

	/**
	 * Unformatted half day hour, [0..11].
	 * 
	 * @return String half day hour.
	 */
	h : function() {
		var h = this.date.getHours() % 12;
		if (h === 0) {
			h = 12;
		}
		return h.toString();
	},

	/**
	 * Two digits half day hour, [00..11]
	 * 
	 * @return String half day hour.
	 */
	hh : function() {
		return this.pad(js.format.DateFormat.PatternFormatters["h"]());
	},

	/**
	 * Unformatted full day hour, [0..23].
	 * 
	 * @return String full day hour.
	 */
	H : function() {
		return this.date.getHours().toString();
	},

	/**
	 * Two digits full day hour, [00..23]
	 * 
	 * @return String full day hour.
	 */
	HH : function() {
		return this.pad(this.date.getHours(), 2);
	},

	/**
	 * Unformatted minute, [0..59]
	 * 
	 * @return String unformatted minute.
	 */
	m : function() {
		return this.date.getMinutes().toString();
	},

	/**
	 * Two digits minute, [00..59]
	 * 
	 * @return String two digits minute.
	 */
	mm : function() {
		return this.pad(this.date.getMinutes(), 2);
	},

	/**
	 * Unformatted second, [0..59]
	 * 
	 * @return String unformatted second.
	 */
	s : function() {
		return this.date.getSeconds().toString();
	},

	/**
	 * Two digits second, [00..59]
	 * 
	 * @return String two digits second.
	 */
	ss : function() {
		return this.pad(this.date.getSeconds(), 2);
	},

	/**
	 * Tenth of second, one single digit.
	 * 
	 * @return String tenth of second.
	 */
	S : function() {
		var S = this.date.getMilliseconds();
		return this.pad(S > 99 ? Math.round(S / 100) : S, 1);
	},

	/**
	 * Hundredth of second, two digits.
	 * 
	 * @return String hundredth of second.
	 */
	SS : function() {
		var S = this.date.getMilliseconds();
		return this.pad(S > 9 ? Math.round(S / 10) : S, 2);
	},

	/**
	 * Thousandth of second, three digits.
	 * 
	 * @return String thousandth of second.
	 */
	SSS : function() {
		return this.pad(this.date.getMilliseconds(), 3);
	},

	/**
	 * AM/PM marker.
	 * 
	 * @return String AM/PM marker.
	 */
	a : function() {
		return this.date.getHours() < 12 ? "AM" : "PM";
	},

	/**
	 * Short time zone, alias for {@link #zzz}.
	 * 
	 * @return String short time zone.
	 */
	z : function() {
		return this.shortTZ(this.date);
	},

	/**
	 * Short time zone, alias for {@link #zzz}.
	 * 
	 * @return String short time zone.
	 */
	zz : function() {
		return this.shortTZ(this.date);
	},

	/**
	 * Short time zone.
	 * 
	 * @return String short time zone.
	 */
	zzz : function() {
		return this.shortTZ(this.date);
	},

	/**
	 * Long time zone.
	 * 
	 * @return String long time zone.
	 */
	zzzz : function() {
		return this.fullTZ(this.date);
	},

	/**
	 * RFC822 time zone, <em>+0200</em>.
	 * 
	 * @return String RFC822 time zone.
	 */
	Z : function() {
		return this.rfc822TZ(this.date);
	},

	/**
	 * Convert numeric value to zero padded string of specified length. Convert given numeric value to string and insert
	 * '0' at start till resulting string length reaches desired length.
	 * 
	 * @param Number val numeric value,
	 * @param Number len desired padded string length.
	 * @return String given numeric value as padded string.
	 */
	pad : function(val, len) {
		val = String(val);
		len = len || 2;
		while (val.length < len) {
			val = "0" + val;
		}
		return val;
	},

	/**
	 * Truncate year value to two digits representation. Returns short year format; this is last the two digits, that
	 * is, decades and years, e.g. 14 for 2014 input.
	 * 
	 * @param Number fullYear full year value.
	 * @return String truncated year value.
	 * @assert year argument is in (current year - 80, current year + 20] range.
	 */
	truncateYear : function(fullYear) {
		var currentYear = new Date().getFullYear();
		$assert(currentYear - 80 < fullYear && fullYear <= currentYear + 20, "js.format.DateFormat#format", "Year is not in proper range.");
		return fullYear.toString().substr(2);
	},

	// i do not have a reliable algorithm to determine client time zone id or display name since it depends on country,
	// beside date time zone offset; also take care there are rumors time zone offset is not dealing well with daylight
	// saving; for now uses rfc822 format for all time zone format

	/**
	 * Return date value short time zone. Current implementation delegates {@link #rfc822TZ}.
	 * 
	 * @param Date date value.
	 * @return String short time zone.
	 */
	shortTZ : function(date) {
		return this.rfc822TZ(date);
	},

	/**
	 * Get date value full time zone. Current implementation delegates {@link #rfc822TZ}.
	 * 
	 * @param Date date value.
	 * @return String full time zone.
	 */
	fullTZ : function(date) {
		return this.rfc822TZ(date);
	},

	/**
	 * Get date value time zone in RFC822 format.
	 * 
	 * @param Date date value.
	 * @return String time zone in RFC822 format.
	 */
	rfc822TZ : function(date) {
		var tz = date.getTimezoneOffset();
		var s = tz < 0 ? "+" : "-";
		var h = Math.abs(Math.round(tz / 60));
		var m = Math.abs(Math.round(tz % 60));
		return s + this.pad(h) + this.pad(m);
	}
};

js.format.DateFormat.prototype = {
	/**
	 * Format constructs patterns.
	 * 
	 * @type RegExp
	 */
	_FORMAT_PATTERNS : /y{1,4}|M{1,4}|d{1,2}|E{1,4}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|a|z{1,4}|Z/g,

	/**
	 * Pattern chars.
	 * 
	 * @type String
	 */
	_PATTERN_CHARS : "yMdEhHmsSazZ",

	/**
	 * Format date instance accordingly {@link #_pattern}.
	 * 
	 * @param Date date date instance to format.
	 * @return String formatted date.
	 * @assert date argument is a valid {@link Date} instance.
	 */
	format : function(date) {
		$assert(js.lang.Types.isDate(date), "js.format.DateFormat#format", "Date argument is not a valid Date instance.");
		var formatters = js.format.DateFormat.PatternFormatters;
		formatters.symbols = this._symbols;
		formatters.date = date;

		this._FORMAT_PATTERNS.lastIndex = 0;
		return this._pattern.replace(this._FORMAT_PATTERNS, function($0) {
			return formatters[$0]();
		});
	},

	/**
	 * Parse date string accordingly {@link #_pattern}.
	 * 
	 * @param String source date string source.
	 * @return Date newly created date instance.
	 * @assert source string is a valid {@link String} instance.
	 */
	parse : function(source) {
		$assert(js.lang.Types.isString(source), "js.format.DateFormat#parse", "Source is not a string.");
		var sourceIndex = 0;

		var pattern = this._pattern;
		var patternChars = this._PATTERN_CHARS;
		var patternIndex = 0;
		var symbols = this._symbols;

		function isDigit(c) {
			return c >= "0" && c <= "9";
		}
		function isPattern(c) {
			return patternChars.indexOf(c) !== -1;
		}
		function text() {
			skipPattern();
			return parseText();
		}
		function number() {
			return Number(parseNumber(skipPattern()));
		}
		function year() {
			var patternLength = skipPattern();
			var year = parseNumber(patternLength);
			if (patternLength > 2) {
				return year;
			}

			$assert(year < 100, "js.format.DateFormat#parse", "Year is greater than 99.");
			var nowFullYear = new Date().getFullYear();
			var nowYear = nowFullYear % 100;
			var century = Math.floor(nowFullYear / 100);
			if (nowYear >= 80) {
				if (year <= nowYear - 80) {
					++century;
				}
			}
			else {
				if (year > nowYear + 20) {
					--century;
				}
			}
			return 100 * century + year;
		}
		function month() {
			var patternLength = skipPattern();
			if (patternLength <= 2) {
				var m = parseNumber(patternLength);
				return m > 0 ? m - 1 : 0;
			}

			var rex = new RegExp(parseText(), "gi");
			var i = index(symbols.fullMonths, rex);
			if (i === -1) {
				i = index(symbols.shortMonths, rex);
			}
			$assert(i !== -1, "js.format.DateFormat#parse", "Invalid month name.");
			return i;
		}
		function weekDay() {
			var s = text();
			var rex = new RegExp(s, "gi");
			var i = index(symbols.fullWeekDays, rex);
			if (i === -1) {
				i = index(symbols.shortWeekDays, rex);
			}
			$assert(i !== -1, "js.format.DateFormat#parse", "Invalid week day.");
		}
		function ampmMarker() {
			++patternIndex;
			var ampm = source.substr(sourceIndex, 2).toLowerCase();
			// silently ignore index beyond source length
			sourceIndex += 2;
			return ampm;
		}

		function skipPattern() {
			var c = pattern.charAt(patternIndex);
			var patternLength = 1;
			while (patternIndex < pattern.length && c === pattern.charAt(++patternIndex)) {
				++patternLength;
			}
			return patternLength;
		}
		function parseNumber(patternLength) {
			var inputLengthHint = isPattern(pattern.charAt(patternIndex)) ? patternLength : Number.POSITIVE_INFINITY;
			if (patternIndex === pattern.length) {
				inputLengthHint = Number.POSITIVE_INFINITY;
			}
			var text = "";
			while (sourceIndex < source.length && isDigit(source.charAt(sourceIndex)) && inputLengthHint-- > 0) {
				text += source.charAt(sourceIndex++);
			}
			return Number(text);
		}
		function parseText() {
			var text = "";
			var endOfText = patternIndex < pattern.length ? pattern.charAt(patternIndex) : null;
			while (sourceIndex < source.length && source.charAt(sourceIndex) !== endOfText) {
				text += source.charAt(sourceIndex++);
			}
			return text;
		}
		function index(names, rex) {
			for (var i = 0; i < names.length; ++i) {
				// rex.lastIndex = 0;
				if (rex.test(names[i])) {
					return i;
				}
			}
			return -1;
		}

		// date components value initialized to epoch
		var y = 1970, M = 0, d = 1, h = 0, m = 0, s = 0, S = 0;
		var pm = false;
		for (; patternIndex < pattern.length;) {
			switch (pattern.charAt(patternIndex)) {
			case "y":
				y = year();
				break;
			case "M":
				M = month();
				break;
			case "d":
				d = number();
				break;
			case "H":
				h = number();
				break;
			case "h":
				h = number();
				break;
			case "m":
				m = number();
				break;
			case "s":
				s = number();
				break;
			case "S":
				S = number();
				break;
			case "a":
				pm = ampmMarker() === "pm";
				break;
			case "E":
				weekDay();
				break;
			case "z":
				text();
				break;
			case "Z":
				text();
				break;
			default:
				$assert(source.charAt(sourceIndex) === pattern.charAt(patternIndex), "js.format.DateFormat#parse", "Source and pattern does not match.");
				++patternIndex;
				++sourceIndex;
			}
		}
		if (pm) {
			h = (h + 12) % 24;
		}
		return new Date(y, M, d, h, m, s, S);
	},

	/**
	 * Test source string for valid date format, accordingly {@link #_pattern}. If this predicate returns true
	 * {@link #parse} is guaranteed to return valid date instance.
	 * 
	 * @param String source date string to test.
	 * @return Boolean true if source is a valid date format.
	 */
	test : function(source) {
		this._validInput.lastIndex = 0;
		return this._validInput.test(source);
	},

	/**
	 * Compile this formatter pattern. Process {@link #_pattern format pattern} and create a regular expression usable
	 * by {@link #test} predicate; resulted expression is stored into {@link #_validInput}.
	 */
	_compile : function() {
		// in order to avoid abusing garbage collector pattern handling procedures and pattern parsing loop use these
		// function global variables

		// makes this date format pattern available to skipSubPattern procedure
		var pattern = this._pattern;
		// index is updated by pattern parsing loop and used by skipSubPattern procedure
		var index = 0;
		// regualr expression builder is updated by pattern parsing loop
		var rex = "";

		// all pattern handling procedures update this object state instead of returning a value
		var match = {
			pattern : null,
			length : 0
		};

		function year() {
			match.length = skipSubPattern();
			$assert(match.length <= 4, "js.format.DateFormat#_compile", "Invalid year.");
			match.pattern = match.length > 2 ? "\\d{1,4}" : "\\d{2}";
		}
		function month() {
			match.length = skipSubPattern();
			$assert(match.length <= 4, "js.format.DateFormat#_compile", "Invalid month.");
			match.pattern = match.length <= 2 ? "\\d{1,2}" : match.length === 3 ? "\\w{3}" : "\\w{3,}";
		}
		function weekDay() {
			match.length = skipSubPattern();
			$assert(match.length <= 4, "js.format.DateFormat#_compile", "Invalid week day.");
			match.pattern = match.length === 3 ? "\\w{3}" : "\\w{3,}";
		}
		function number(maxDigitsCount) {
			match.length = skipSubPattern();
			if (typeof maxDigitsCount === "undefined") {
				maxDigitsCount = 2;
			}
			$assert(match.length <= maxDigitsCount, "js.format.DateFormat#_compile", "Invalid number format.");
			match.pattern = "\\d{1," + maxDigitsCount + "}";
		}
		function ampmMarker() {
			match.length = skipSubPattern();
			$assert(match.length === 1, "js.format.DateFormat#_compile", "Invalid AM/PM marker.");
			match.pattern = "am|pm";
		}
		function generalTZ() {
			match.length = skipSubPattern();
			$assert(match.length <= 4, "js.format.DateFormat#_compile", "Invalid time zone.");
			match.pattern = "[+-]?\\d{4}";
		}
		function rfc822TZ() {
			match.length = skipSubPattern();
			$assert(match.length === 1, "js.format.DateFormat#_compile", "Invalid time zone.");
			match.pattern = "[+-]?\\d{4}";
		}

		function skipSubPattern() {
			// skip over current sub-pattern; returns sub-pattern length
			var c = pattern.charAt(index);
			var subPatternLength = 1;
			var i = index;
			while (i < pattern.length && c === pattern.charAt(++i)) {
				++subPatternLength;
			}
			return subPatternLength;
		}

		// pattern parsing loop

		for (var c; index < pattern.length;) {
			c = pattern.charAt(index);
			match.length = 0;

			switch (c) {
			case "y":
				year();
				break;
			case "M":
				month();
				break;
			case "d":
			case "H":
			case "h":
			case "m":
			case "s":
				number();
				break;
			case "S":
				number(3);
				break;
			case "a":
				ampmMarker();
				break;
			case "E":
				weekDay();
				break;
			case "z":
				generalTZ();
				break;
			case "Z":
				rfc822TZ();
				break;

			default:
			}

			if (match.length > 0) {
				rex += match.pattern;
				index += match.length;
			}
			else {
				$assert(!/[a-zA-Z]/.test(c), "js.format.DateFormat#_compile", "Invalid pattern.");
				rex += js.util.Strings.escapeRegExp(c);
				++index;
			}
		}
		this._validInput = new RegExp("^" + rex + "$", "gi");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.format.DateFormat";
	}
};
$extends(js.format.DateFormat, Object);
$implements(js.format.DateFormat, js.format.Format);
