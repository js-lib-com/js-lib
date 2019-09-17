$package("js.dom.template");

/**
 * Set one or more element's attributes values. This operator is the main means to set element attributes value. There
 * are also specialized, convenient operators for common HTML attributes: id, value, src, href and title.
 * 
 * <pre>
 *  &lt;img data-attr="src:picture;title:description;" /&gt;
 * </pre>
 * 
 * Operand is an expression describing attribute name/property path, with next syntax:
 * 
 * <pre>
 *    expression := attrProperty (';' attrProperty)* ';'?
 *    attrProperty : = attrName ':' propertyPath
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct ATTR operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.AttrOperator = function(content) {
	this.$super(content);
};

js.dom.template.AttrOperator.prototype = {
	/**
	 * Execute ATTR operator. Expression argument is set of attribute name / property path pairs. Property path is used
	 * to retrieve content value that is converted to string and used as attribute value.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String expression set of attribute name / property path pairs.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert expression is well formed.
	 */
	_exec : function(element, scope, expression) {
		js.util.Strings.parseNameValues(expression).forEach(function(pair) {
			var propertyPath = pair.value;
			$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.AttrOperator#exec", "Operand is property path but scope is not an object.");
			var attrName = pair.name;
			var value = this._content.getValue(scope, propertyPath);

			if (value === null) {
				$warn("js.dom.template.AttrOperator#_exec", "Null property |%s|. Remove %s attribute from element |%s|.", propertyPath, attrName, element);
				element.removeAttr(attrName);
			}
			else {
				if (attrName === "id" && js.lang.Types.isNumber(value)) {
					value = value.toString();
				}
				$assert(js.lang.Types.isString(value), "js.dom.template.AttrOperator#_exec", "Content value is not a string.");
				$debug("js.dom.template.AttrOperator#_exec", "Set element |%s| %s attribute from property |%s|.", element, attrName, propertyPath);
				element.setAttr(attrName, value);
			}
		}, this);
	},

	_reset : function(element, expression) {
		js.util.Strings.parseNameValues(expression).forEach(function(pair) {
			// pair.name is the attribute name
			element.removeAttr(pairs.name);
		}, this);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.AttrOperator";
	}
};
$extends(js.dom.template.AttrOperator, js.dom.template.Operator);
