$package('js.util');

/**
 * One-shot timer. Support both instantiation with new operator and invocation like function. If used as function
 * creates a timeout object, set its callback and return it after starting.
 * 
 * <p>
 * Usage with new operator:
 * 
 * <pre>
 * 	var t = new js.util.Timeout(1000, this._onTimeout, this);
 * 	t.setCallback(this._onTimeout, this); // alternative callback setter
 * 	t.start();
 *	. . .
 *	t.stop(); // stop used to cancel pending timeout
 * </pre>
 * 
 * <p>
 * Function invocation usage:
 * 
 * <pre>
 * 	var t = js.util.Timeout(1000, this._onTimeout, this);
 *	. . .
 *	t.stop(); // stop used to cancel pending timeout
 * </pre>
 * 
 * Please note that when used as a function timeout is started automatically. If timeout should start at some point in
 * the future use new operator.
 * 
 * @constructor Construct timer instance. If this constructor is used as function returns created timer instance.
 * 
 * @param Number timeout, timeout value, in milliseconds,
 * @param Function callback, function to be called when timeout expires,
 * @param Object scope, callback execution scope.
 * @assert <em>timeout</em> argument is present and is a Number.
 */
js.util.Timeout = function(timeout, callback, scope) {
	$assert(js.lang.Types.isNumber(timeout), 'js.util.Timeout#Timeout', 'Timeout is not a number.');
	if (!(this instanceof js.util.Timeout)) {
		// if constructor invoked as function this points to package scope
		var t = new js.util.Timeout(timeout, callback, scope);
		t.start();
		return t;
	}
	this.$super(timeout, callback, scope);
};

js.util.Timeout.prototype = {
	/**
	 * Implements {@link js.util.AbstractTimer#_start}.
	 * 
	 * @param Function handler
	 * @param Number value
	 * @return Object
	 */
	_start : function(handler, value) {
		return window.setTimeout(handler, value);
	},

	/**
	 * Implements {@link js.util.AbstractTimer#_stop}.
	 * 
	 * @param Object timerID
	 */
	_stop : function(timerID) {
		window.clearTimeout(timerID);
	},

	/**
	 * Implements {@link js.util.AbstractTimer#_tick}.
	 */
	_tick : function() {
		this._id = null;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.util.Timeout';
	}
};
$extends(js.util.Timeout, js.util.AbstractTimer);
