$package("js.dom.template");

/**
 * Load select options.
 * 
 * @author Iulian Rotaru
 * @since 1.3.7
 * 
 * @constructor Construct options operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.OptionsOperator = function(content) {
	this.$super(content);
};

js.dom.template.OptionsOperator.prototype = {
	/**
	 * Uses property path to retrieve and load current element options. Current element should be a select and object
	 * property an array.
	 * <p>
	 * This method uses {@link js.dom.Select#setOptions(Array)} and will override all select options. Old options are
	 * lost, less those marked as {@link js.dom.Select#_DEF_OPTION_CSS}. Also object property array content is that
	 * described by mentioned select method.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return Object always returns null to indicate full content processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element is a select and content value is an array.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert(element.getTag() === "select", "js.dom.template.OptionsOperator#_exec", "Options operator is useable only on select element.");
		if (scope === null) {
			$warn("js.dom.template.OptionsOperator#_exec", "Null scope for property |%s|. Remove options from select element |%s|.", propertyPath, element);
			element.removeChildren();
			return null;
		}

		$assert(js.lang.Types.isObject(scope), "js.dom.template.OptionsOperator#_exec", "Operand is property path but scope is not an object.");
		var options = this._content.getValue(scope, propertyPath);

		if (options === null) {
			$warn("js.dom.template.OptionsOperator#_exec", "Null property |%s|. Remove options from select element |%s|.", propertyPath, element);
			element.removeChildren();
		}
		else {
			$assert(js.lang.Types.isArray(options), "js.dom.template.OptionsOperator#_exec", "Content value is not an array of strings.");
			$debug("js.dom.template.OptionsOperator#_exec", "Load select element |%s| options from property |%s|.", element, propertyPath);
			element.setOptions(options);
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
		return "js.dom.template.OptionsOperator";
	}
};
$extends(js.dom.template.OptionsOperator, js.dom.template.Operator);
