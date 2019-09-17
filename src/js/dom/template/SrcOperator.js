$package("js.dom.template");

/**
 * Set <em>src</em> attribute value.
 * 
 * <pre>
 *  &lt;img data-src="picture" /&gt;
 * </pre>
 * 
 * Operand is the property path used to get content value.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct SRC operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.SrcOperator = function(content) {
	this.$super(content);
};

js.dom.template.SrcOperator.prototype = {
	/**
	 * Execute SRC operator. Uses property path to extract content value, convert it to string and set <em>src</em>
	 * attribute. If context element has <em>setSrc</em> method uses it, otherwise uses generic attribute setter.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert <code>element</code> has no <code>src</code> attribute, <code>element</code> is of type supporting
	 * <code>src</code> attribute and <code>scope</code> is an {@link Object}.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert((function() {
			var elementsWithSrc = [ "iframe", "script", "img", "input", "textarea", "video", "audio" ];
			return elementsWithSrc.indexOf(element.getTag()) !== -1;
		})(), "js.dom.template.SrcOperator#exec", "SRC operator is not supported on element |%s|.", element);
		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.SrcOperator#exec", "Operand is property path but scope is not an object.");

		var value = this._content.getValue(scope, propertyPath);
		if (value === null) {
			if (typeof element.hasDefault === "function") {
				element.setSrc(value);
			}
			else {
				$warn("js.dom.template.SrcOperator#_exec", "Null property |%s|. Remove src attribute from element |%s|.", propertyPath, element);
				element.removeAttr("src");
			}
		}
		else {
			$assert(js.lang.Types.isString(value), "js.dom.template.SrcOperator#_exec", "Content value is not a string.");
			$debug("js.dom.template.SrcOperator#_exec", "Set element |%s| src attribute from property |%s|.", element, propertyPath);
			if (typeof element.reload === "function") {
				element.reload(value);
			}
			else if (typeof element.setSrc === "function") {
				element.setSrc(value);
			}
			else {
				element.setAttr("src", value);
			}
		}
	},

	_reset : function(element) {
		element.removeAttr("src");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.SrcOperator";
	}
};
$extends(js.dom.template.SrcOperator, js.dom.template.Operator);
