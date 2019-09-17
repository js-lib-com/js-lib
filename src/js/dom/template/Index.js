$package('js.dom.template');

/**
 * Index used by ordered lists and maps to keep items track for numbering. It is created before entering list or map
 * iteration and incremented before every item processing. Note that first item index value is 1, not zero; also every
 * ordered list or map has its own index. All indexes are kept into a stack to allows for nesting.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct index instance.
 */
js.dom.template.Index = function() {
	/**
	 * Index value. First item is 1.
	 * 
	 * @type Number
	 */
	this.value = 0;
};

js.dom.template.Index.prototype = {
	/**
	 * Increment this index value.
	 */
	increment : function() {
		++this.value;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.Index";
	}
};
$extends(js.dom.template.Index, Object);
