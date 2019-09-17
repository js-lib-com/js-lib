$package("js.dom.template");

/**
 * Set element inner HTML, useful for text formatted with HTML tags.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct HTML operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.HtmlOperator = function(content) {
	this.$super(content);
};

js.dom.template.HtmlOperator.prototype = {
	/**
	 * Execute HTML operator. Uses property path to retrieve content value, convert it to string and set element inner
	 * HTML.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return Object always returns null to indicate full content processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element has no children and content value is a string.
	 */
	_exec : function(element, scope, propertyPath) {
		if (scope === null) {
			$warn("js.dom.template.HtmlOperator#_exec", "Null scope for property |%s|. Remove children from element |%s|.", propertyPath, element);
			element.removeChildren();
			return null;
		}

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.HtmlOperator#_exec", "Operand is property path but scope is not an object.");
		$assert(!element.hasChildren(), "js.dom.template.HtmlOperator#_exec", "Element |%s| has children. Cannot set inner HTML.", element);
		var html = this._content.getValue(scope, propertyPath);

		if (html === null) {
			$warn("js.dom.template.HtmlOperator#_exec", "Null property |%s|. Remove children from element |%s|.", propertyPath, element);
			element.removeChildren();
		}
		else {
			$assert(js.lang.Types.isString(html), "js.dom.template.HtmlOperator#_exec", "Content value is not a string.");
			$debug("js.dom.template.HtmlOperator#_exec", "Set element |%s| inner HTML from property |%s|.", element, propertyPath);
			element.setHTML(html);
		}
		return undefined;
	},

	_reset : function(element) {
		element.removeChildren();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.HtmlOperator";
	}
};
$extends(js.dom.template.HtmlOperator, js.dom.template.Operator);
