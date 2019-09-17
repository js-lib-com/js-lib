$package('js.lang');

/**
 * j(s)-lib generic exception. Thrown whenever a more specific exception is not available or suitable. This class is
 * also the root for exceptions hierarchy.
 * 
 * @constructor Construct a new exception instance. This class constructor accept a variable number of messages. It will
 *              display all of them joined by colon after converting to string, if necessarily. Note that null and
 *              functions are ignored.
 * 
 * @param Object... messages, variable number of messages.
 */
js.lang.Exception = function() {
	$assert(this instanceof js.lang.Exception, 'js.lang.Exception#Exception', 'Invoked as function.');

	/**
	 * Exception name.
	 * 
	 * @type String
	 */
	this.name = 'j(s)-lib exception';

	/**
	 * Exception message. Consolidated by joining all messages given as arguments. If no eligible arguments provided on
	 * constructor invocation message is empty string.
	 * 
	 * @type String
	 */
	this.message = js.lang.Types.isString(arguments[0]) ? $format(arguments) : "";
};

js.lang.Exception.prototype = {
	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.lang.Exception';
	}
};
$extends(js.lang.Exception, Error);
