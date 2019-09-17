$package('js.dom.template');

/**
 * Undefined property exception thrown when content instance can't find requested property.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct undefined property exception instance.
 * @param String propertyPath suspected content property path,
 * @param String message cause explanation,
 * @param Object... args optional arguments if message is formatted.
 */
js.dom.template.ContentException = function(propertyPath, message) {
	$assert(this instanceof js.dom.template.ContentException, 'js.dom.template.ContentException#ContentException', 'Invoked as function.');
	this.$super($format(arguments, 1));

	/**
	 * Exception name.
	 * 
	 * @type String
	 */
	this.name = 'Undefined property exception';

	/**
	 * Suspected content property path.
	 * 
	 * @type String
	 */
	this.propertyPath = propertyPath;
};

js.dom.template.ContentException.prototype = {
	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.template.ContentException';
	}
};
$extends(js.dom.template.ContentException, js.lang.Exception);
