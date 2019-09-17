$package("js.dom.template");

/**
 * Set <em>title</em> attribute value.
 * 
 * <pre>
 *  &lt;section data-title="description" /&gt;
 * </pre>
 * 
 * Operand is the property path used to get content value.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct TITLE operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.TitleOperator = function(content) {
	this.$super(content);
};

js.dom.template.TitleOperator.prototype = {
	/**
	 * Execute TITLE operator. Uses property path to extract content value, convert it to string and set <em>title</em>
	 * attribute.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path,
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert <code>element</code> has no <code>title</code> attribute, <code>scope</code> is an {@link Object}
	 * and content value is a string.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.TitleOperator#exec", "Operand is property path but scope is not an object.");

		var value = this._content.getValue(scope, propertyPath);
		if (value === null) {
			$warn("js.dom.template.TitleOperator#_exec", "Null property |%s|. Remove title attribute from element |%s|.", propertyPath, element);
			element.removeAttr("title");
		}
		else {
			$assert(js.lang.Types.isString(value), "js.dom.template.TitleOperator#_exec", "Content value is not a string.");
			$debug("js.dom.template.TitleOperator#_exec", "Set element |%s| title attribute from property |%s|.", element, propertyPath);
			element.setAttr("title", value);
		}
	},

	_reset : function(element) {
		element.removeAttr("title");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.TitleOperator";
	}
};
$extends(js.dom.template.TitleOperator, js.dom.template.Operator);
