$package("js.dom.template");

/**
 * Set <em>id</em> attribute value.
 * 
 * <pre>
 *  &lt;section data-id="id" /&gt;
 * </pre>
 * 
 * Operand is the property path used to get content value.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct ID operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.IdOperator = function(content) {
	this.$super(content);
};

js.dom.template.IdOperator.prototype = {
	/**
	 * Execute ID operator. Uses property path to extract content value, convert it to string and set <em>id</em>
	 * attribute.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert <code>element</code> has no <code>id</code> attribute, content value is string or number and
	 * <code>scope</code> is an {@link Object}.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.IdOperator#exec", "Operand is property path but scope is not an object.");

		var id = this._content.getValue(scope, propertyPath);
		if (id === null) {
			$warn("js.dom.template.IdOperator#_exec", "Null property |%s|. Remove id attribute from element |%s|.", propertyPath, element);
			element.removeAttr("id");
		}
		else {
			if (js.lang.Types.isNumber(id)) {
				id = id.toString();
			}
			$assert(js.lang.Types.isString(id), "js.dom.template.IdOperator#_exec", "ID operand should be string or numeric.");
			$debug("js.dom.template.IdOperator#_exec", "Set element |%s| id attribute from property |%s|.", element, propertyPath);
			element.setAttr("id", id);
		}
	},

	_reset : function(element) {
		element.removeAttr("id");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.IdOperator";
	}
};
$extends(js.dom.template.IdOperator, js.dom.template.Operator);
