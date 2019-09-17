$package('js.dom.template');

/**
 * Lower case string list index. Lower case variant of {@link UpperCaseStringNumbering}. Its format code is <b>s</b>.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="%s)"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * After templates rendering <em>li</em> elements text content will be a), b) ... . See {@link NumberingOperator} for
 * details about numbering format syntax.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct lower case string index formatter instance.
 */
js.dom.template.LowerCaseStringNumbering = function() {
};

js.dom.template.LowerCaseStringNumbering.prototype = {
	/**
	 * Format index as lower case string.
	 * 
	 * @param Number index index value.
	 * @return String formatted index.
	 */
	format : function(index) {
		return this.$super('format', index).toLowerCase();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.LowerCaseStringNumbering";
	}
};
$extends(js.dom.template.LowerCaseStringNumbering, js.dom.template.UpperCaseStringNumbering);
