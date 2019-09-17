$package("js.dom.template");

/**
 * Set <em>href</em> attribute value.
 * 
 * <pre>
 *  &lt;a data-href="url"&gt;Follow the link...&lt;/a&gt;
 * </pre>
 * 
 * Operand is the property path used to get content value.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct HREF operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.HrefOperator = function(content) {
	this.$super(content);
};

js.dom.template.HrefOperator.prototype = {
	/**
	 * Execute HREF operator. Uses property path to extract content value, convert it to string and set <em>href</em>
	 * attribute.
	 * 
	 * @param js.dom.Element element context element, unused,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert <code>element</code> has no <code>href</code> attribute.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.HrefOperator#exec", "Operand is property path but scope is not an object.");

		var href = this._content.getValue(scope, propertyPath);
		if (href === null) {
			$warn("js.dom.template.HrefOperator#_exec", "Null property |%s|. Remove href attribute from element |%s|.", propertyPath, element);
			element.removeAttr("href");
		}
		else {
			$assert(js.lang.Types.isString(href), "js.dom.template.HrefOperator#_exec", "Content value is not a string.");
			$debug("js.dom.template.HrefOperator#_exec", "Set element |%s| href attribute from property |%s|.", element, propertyPath);
			element.setAttr("href", href);
		}
	},

	_reset : function(element) {
		element.removeAttr("href");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.HrefOperator";
	}
};
$extends(js.dom.template.HrefOperator, js.dom.template.Operator);
