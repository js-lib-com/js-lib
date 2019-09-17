$package("js.dom.template");

/**
 * Arabic numeral numbering format. It is the most simple numbering formatter and maybe the most common; it just
 * displays index value. Its format code is <b>n</b>.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="%n)"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * As with any numbering formatter this also allows for additional text; above example will render 1), 2) ... . See
 * {@link NumberingOperator} for details about numbering format syntax.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct Arabic numeral numbering format instance.
 */
js.dom.template.ArabicNumeralNumbering = function() {
};

js.dom.template.ArabicNumeralNumbering.prototype = {
	/**
	 * Format index as arabic numeral.
	 * 
	 * @param Number index index value.
	 * @return String formatted index.
	 */
	format : function(index) {
		return index.toString(10);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.ArabicNumeralNumbering";
	}
};
$extends(js.dom.template.ArabicNumeralNumbering, Object);
