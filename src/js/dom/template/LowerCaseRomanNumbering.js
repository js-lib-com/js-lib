$package('js.dom.template');

/**
 * Roman numeric index, lower case. Lower case variant of {@link UpperCaseRomanNumbering}. Its format code is <b>i</b>.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="%i)"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * After templates rendering <em>li</em> elements text content will be i), ii) ... . See {@link NumberingOperator} for
 * details about numbering format syntax.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct lower case Roman numeric formatter instance.
 */
js.dom.template.LowerCaseRomanNumbering = function() {
};

js.dom.template.LowerCaseRomanNumbering.prototype = {
	/**
	 * Format index as lower case Roman numeral.
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
		return "js.dom.template.LowerCaseRomanNumbering";
	}
};
$extends(js.dom.template.LowerCaseRomanNumbering, js.dom.template.UpperCaseRomanNumbering);
