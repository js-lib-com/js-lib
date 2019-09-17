$package("js.dom.template");

/**
 * Form control and generic value setter. Value operator is used to set value attribute, if context element is a form
 * control or as generic value setter if context element is a generic <em>div</em>. In both cases operand is the
 * property path used to get content value.
 * 
 * <h4>Form control value setter</h4>
 * Extract content value declared by this operator operand and set the element <em>value</em>. Note that this
 * operator uses element format, if one is declared. If this is the case, content value can be of any type, as long
 * declared formatter can deal with it; otherwise value should be a string.
 * 
 * <pre>
 *  &lt;input data-value="name" data-format="js.format.LongDate" /&gt;
 * </pre>
 * 
 * <h4>Generic value setter</h4>
 * Allows for generic extension, content value is simply passed to context element, which must implement a value setter
 * with next signature:
 * 
 * <pre>
 * 	Element setValue(Object value)
 * </pre>
 * 
 * Note that context element should be a generic <em>div</em> as in example below. Value processing is entirely under
 * element control and value can have any type, even null or undefined. A good example may be a chart using a collection
 * of scores: templates engine load scores from content but chart is created by element value setter.
 * 
 * <pre>
 * 	&lt;div class="chart" data-value="scores" data-class="appraisal.employee.ScoresChart"&gt;&lt;/div&gt;
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct VALUE operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.ValueOperator = function(content) {
	this.$super(content);
};

js.dom.template.ValueOperator.prototype = {
	/**
	 * Generic elements.
	 * 
	 * @type Array
	 */
	GENERIC_ELEMENTS : [ "div" ],

	/**
	 * Execute VALUE operator. Uses property path to extract content value, convert it to string and set element
	 * <em>value</em> attribute.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element is a form control or a generic <em>div</em>.
	 */
	_exec : function(element, scope, propertyPath) {
		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.ValueOperator#_exec", "Operand is property path but scope is not an object.");

		var value = this._content.getValue(scope, propertyPath);

		// if context element is a generic element just pass value to its value setter
		if (this.GENERIC_ELEMENTS.indexOf(element.getTag()) !== -1) {
			$assert(js.lang.Types.isFunction(element.setValue), "js.dom.template.ValueOperator#_exec", "Invalid generic element: missing value setter.");
			element.setValue(value);
			return;
		}

		$assert(element instanceof js.dom.Control, "js.dom.template.ValueOperator#_exec", "Element |%s| is not a control.", element);
		if (value === null) {
			$warn("js.dom.template.ValueOperator#_exec", "Null property |%s|. Reset value for element |%s|.", propertyPath, element);
			element.reset();
		}
		else {
			$assert(element._format !== null || js.lang.Types.isPrimitive(value), "js.dom.template.ValueOperator#_exec", "Formatter is null and content value is not a primitive.");
			$debug("js.dom.template.ValueOperator#_exec", "Set element |%s| value from property |%s|.", element, propertyPath);
			element.setValue(value);
		}
	},

	_reset : function(element) {
		element.reset();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.ValueOperator";
	}
};
$extends(js.dom.template.ValueOperator, js.dom.template.Operator);
