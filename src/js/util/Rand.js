$package('js.util');

/**
 * Convenient pseudo-random integer value generator. Create random generator instance then use {@link #next} method to
 * get pseudo-random integer values.
 * 
 * <pre>
 *	var rand = new js.util.Rand(100, 200);
 *	var n = rand.next(); // get a number in range [100...200)
 * </pre>
 * 
 * Alternatively, one can use this class constructor as a function to directly get a single random numeric integer
 * value.
 * 
 * <pre>
 * 	var n = js.util.Rand(10); // get a number in range [0...10)
 * </pre>
 * 
 * Although distribution uniformity is guaranteed this class cannot generate unique values in given range - see
 * {@link #_next(Number,Number)}. Do not use this class for unique integer values.
 * 
 * @constructor Construct random generator instance. If used as function returns next pseudo-random integer value.
 *              Generated values range is controlled by <code>start</code> and <code>length</code> arguments. Every
 *              value is guaranteed to be greater or equals with start and strictly less than sum of start and length,
 *              i.e. [start...start+length). If only argument is supplied is considered to be value range, and start is
 *              zero. If both arguments are missing start is 0 and length is Number.MAX_VALUE.
 * 
 * @param Number... start optional starting value, 0 if missing,
 * @param Number... length optional length of the values' range, maximum number value if missing.
 */
js.util.Rand = function () {
    var start, length;

    if (arguments.length === 0) {
        start = 0;
        length = Number.MAX_VALUE;
    }
    else if (arguments.length === 1) {
        length = arguments[0];
        start = 0;
    }
    else {
        start = arguments[0];
        length = arguments[1];
    }

    /**
     * Range start value.
     * 
     * @type Number
     */
    this._start = start;

    /**
     * Range length.
     * 
     * @type Number
     */
    this._length = length;

    if (this === js.util) {
        // if used as function this points to package scope
        return js.util.Rand.prototype._next(this._start, this._length);
    }
};

js.util.Rand.prototype = {
    /**
     * Get next pseudo-random integer value.
     * 
     * @return Number random integer value in range controlled by constructor arguments.
     */
    next : function () {
        return this._next(this._start, this._length);
    },

    /**
     * Utility method for random integer generation in given range. This method generates a random integer value in
     * interval [start, start+length). Internally, this method uses a logic like this:
     * 
     * <pre>
     *  start + Math.floor(Math.random() * length)
     * </pre>
     * 
     * Now, because <code>Math.random() * length</code> generates real numbers with infinite possible values -
     * implementation has a finite number of possible values but large enough, and rounding process has a far less
     * number of possible values uniqueness in given range is not possible.
     * 
     * @param Number start range start,
     * @param Number length range length
     * @return Number random integer value.
     */
    _next : function (start, length) {
        return start + Math.floor(Math.random() * length);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return 'js.util.Rand';
    }
};
$extends(js.util.Rand, Object);
