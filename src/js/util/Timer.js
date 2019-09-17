$package('js.util');

/**
 * Periodic timer. Supports both instantiation with new operator and invocation like function. If used as function
 * creates a timer object, set its callback and return it after starting.
 * 
 * <p>
 * Usage with new operator:
 * 
 * <pre>
 * 	var t = new js.util.Timer(1000, this._onTimer, this);
 * 	t.setCallback(this._onTimer, this); // alternative callback setter
 * 	t.start();
 *	. . .
 *	t.stop(); // stop used to cancel pending timer
 * </pre>
 * 
 * <p>
 * Function invocation usage:
 * 
 * <pre>
 * 	var t = js.util.Timer(1000, this._onTimer, this);
 *	. . .
 *	t.stop(); // stop used to cancel pending timeout
 * </pre>
 * 
 * Please note that when used as a function timer is started automatically. If timer should start at some point in the
 * future use new operator.
 * 
 * @constructor
 * 
 * @param Number interval, timer interval, in milliseconds,
 * @param Function callback, function to invoke on every tick,
 * @param Object scope, callback execution scope.
 */
js.util.Timer = function(interval, callback, scope) {
	$assert(js.lang.Types.isNumber(interval), 'js.util.Timer#Timer', 'Interval is not a number.');

	if (!(this instanceof js.util.Timer)) {
		var t = new js.util.Timer(interval, callback, scope);
		t.start();
		return t;
	}

	this.$super(interval, callback, scope);
};

js.util.Timer.prototype = {
	/**
	 * Implements {@link js.util.AbstractTimer#_start}.
	 * 
	 * @param Function handler
	 * @param Number value
	 * @return Object
	 */
	_start : function(handler, value) {
		return window.setInterval(handler, value);
	},

	/**
	 * Implements {@link js.util.AbstractTimer#_stop}.
	 * 
	 * @param Object timerID
	 */
	_stop : function(timerID) {
		window.clearInterval(timerID);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.util.Timer';
	}
};
$extends(js.util.Timer, js.util.AbstractTimer);
