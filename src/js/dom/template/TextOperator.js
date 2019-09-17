$package("js.dom.template");

/**
 * Set element text content. Extract content value declared by this operator operand and set context element text
 * content. Content value type is not constrained to string, this operator taking care to convert it. Note that this
 * operator uses context element format instance, if one was declared.
 * 
 * <pre>
 *  &lt;span data-text="birthday" data-format="js.format.LongDate"&gt;&lt;/span&gt;
 * </pre>
 * 
 * Operand is the property path used to get content value.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct TEXT operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.TextOperator = function(content) {
	this.$super(content);
};

js.dom.template.TextOperator.prototype = {
	/**
	 * Execute TEXT operator. Uses property path to extract content value, convert it to string and set element text
	 * content. Note that this operator operates on element without children.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return always returns null to signal full processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 */
	_exec : function(element, scope, propertyPath) {
		if (scope === null) {
			$warn("js.dom.template.TextOperator#_exec", "Null scope on property |%s|. Remove element |%s| text content.", propertyPath, element);
			element.removeText();
			return null;
		}

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.TextOperator#exec", "Operand is property path but scope is not an object.");
		$assert(!element.hasChildren(), "js.dom.template.TextOperator#_exec", "Element |%s| has children.", element);

		var value = this._content.getValue(scope, propertyPath);
		if (value === null || value === '') {
			$warn("js.dom.template.TextOperator#_exec", "Null or empty property |%s|. Remove element |%s| text content.", propertyPath, element);
			element.removeText();
		}
		else {
			$debug("js.dom.template.TextOperator#_exec", "Set text content to element |%s| from property |%s|.", element, propertyPath);
			// do not use raw text setter, i.e. element.setText
			// uses value setter because it supports data-format
			element.setValue(value);
		}
		return undefined;
	},

	_reset : function(element) {
		element.removeText();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.TextOperator";
	}
};
$extends(js.dom.template.TextOperator, js.dom.template.Operator);
