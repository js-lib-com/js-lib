$package('js.util');

/**
 * Abstract timer. This class is the base for {@link js.util.Timeout one-shot} and {@link js.util.Timer periodic}
 * timers. Subclasses must implement {@link #_start} and {@link #_stop} methods.
 * 
 * @constructor Construct timer instance.
 * 
 * @param Number value timer value, default to 0,
 * @param Function callback optional callback function,
 * @param Object scope callback run-time scope.
 * @assert value is a positive {@link Number}.
 */
js.util.AbstractTimer = function(value, callback, scope) {
	$assert(typeof value === 'undefined' || (js.lang.Types.isNumber(value) && value >= 0), 'js.util.AbstractTimer#AbstractTimer', 'Value is not positive number.');

	if (typeof value === 'undefined') {
		value = 0;
	}

	/**
	 * Timer value, in milliseconds. This value controls when timer event(s) occur.
	 * 
	 * @type Number
	 */
	this._value = value;

	/**
	 * Timer ID. Provided by subclass on {@link #_start} call.
	 * 
	 * @type Object
	 */
	this._id = null;

	if (typeof callback !== 'undefined') {
		this.setCallback(callback, scope);
	}
};

js.util.AbstractTimer.prototype = {
	/**
	 * Set this timer value. Subclass uses this value as interval or timeout, accordingly. Stop this timer if given
	 * value is 0.
	 * 
	 * @param Number value this timer value expressed in milliseconds.
	 * @return js.util.AbstractTimer this object.
	 * @assert <em>value</em> argument is a positive {@link Number}.
	 */
	set : function(value) {
		$assert(js.lang.Types.isNumber(value), 'js.util.AbstractTimer#set', 'Value is not a number.');
		$assert(value >= 0, 'js.util.AbstractTimer#set', 'Value is not positive.');
		if (js.lang.Types.isString(value)) {
			value = Number(value);
		}
		if (value === 0) {
			this.stop();
		}
		if (value >= 0) {
			this._value = value;
		}
		return this;
	},

	/**
	 * Get this timer value.
	 * 
	 * @return Number this timer value, in milliseconds.
	 */
	get : function() {
		return this._value;
	},

	/**
	 * Set callback. Set this timer callback and optional run-time scope; if scope argument is missing uses global scope
	 * instead. Callback signature should be:
	 * 
	 * <pre>
	 * 	void callback();
	 * </pre>
	 * 
	 * If callback is not a function or scope is not an object this method behavior is not defined.
	 * 
	 * @param Function callback function to invoke when timeout expires or timer tick,
	 * @param Object scope optional callback execution scope.
	 * @return js.util.AbstractTimer this object.
	 * @assert <em>callback</em> argument is a function and <em>scope</em>, if present, is an object.
	 */
	setCallback : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), 'js.util.AbstractTimer#setCallback', 'Callback is not function.');
		$assert(typeof scope === 'undefined' || js.lang.Types.isObject(scope), 'js.util.AbstractTimer#setCallback', 'Scope is not object.');

		/**
		 * User space callback.
		 * 
		 * @type Function
		 */
		this._callback = callback;

		/**
		 * Callback execution scope. Optional, default to global scope.
		 * 
		 * @type Object
		 */
		this._scope = scope || window;

		return this;
	},

	/**
	 * Start this timer. If this timer is already started reset it, that is perform a fresh start. This method delegates
	 * subclass {@link #_start}, with {@link #_handler} as argument, to actually create native timer object. Anyway, if
	 * this timer value is zero this method does nothing.
	 * 
	 * @return js.util.AbstractTimer this object.
	 */
	start : function() {
		if (this._value > 0) {
			if (this._id !== null) {
				this._stop(this._id);
				this._id = null;
			}
			this._id = this._start(this._handler.bind(this), this._value);
		}
		return this;
	},

	/**
	 * Internal handler. Invoke registered callback in safe context. If something goes wrong invoke {@link #stop} and
	 * send caught error to {@link js.ua.System#error global error handler}. This handler is registered by subclass
	 * {@link #_start} with native timer objects.
	 */
	_handler : function() {
		try {
			if (this._callback) {
				this._callback.call(this._scope);
			}
			this._tick();
		} catch (er) {
			this.stop();
			js.ua.System.error(er);
		}
	},

	/**
	 * Stop this timer. Trying to stop an already stopped timer is NOP.
	 * 
	 * @return js.util.AbstractTimer this object.
	 */
	stop : function() {
		if (this._id !== null) {
			this._stop(this._id);
			this._id = null;
		}
		return this;
	},

	/**
	 * Is timer ticking?
	 * 
	 * @return Boolean true if this timer is working.
	 */
	isTicking : function() {
		return this._id !== null;
	},

	/**
	 * Abstract timer start. Subclass must create and start a new timer and return underlying ID, uniquely identifying
	 * newly created timer. It also register given internal handler to native timer object.
	 * 
	 * @param Function handler internal timer handler,
	 * @param Number value abstract time value, measured in milliseconds.
	 * @return Object started timer ID.
	 */
	_start : function(handler, value) {
	},

	/**
	 * Abstract timer stop. Subclass must stop the timer identified by <em>timerID</em> and release all used
	 * resources. This abstract class guarantees that <em>timerID</em> is the same provided by subclass on
	 * {@link #_start} call.
	 * 
	 * @param Object timerID ID of the timer to stop.
	 */
	_stop : function(timerID) {
	},

	/**
	 * Internal callback invoked after handler processing. Subclass may implement it to update internal state.
	 */
	_tick : function() {
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.util.AbstractTimer';
	}
};
$extends(js.util.AbstractTimer, Object);
