$package("js.dom.template");

/**
 * Add or remove element CSS class considering conditional expression value. In sample code there are two class
 * expressions evaluated in natural order. If conditional expression is true add related class otherwise remove it. In
 * example, if <code>type</code> value is <code>DIRECTORY</code> add CSS class <code>directory</code> to
 * <code>div</code> element otherwise add <code>file</code> class.
 * <p>
 * 
 * <pre>
 *  &lt;div data-css-class="type=DIRECTORY:directory;!type=DIRECTORY:file;" /&gt;
 * </pre>
 * 
 * Operand is a list of semicolon separated CSS class expressions, see syntax below. A class expression has a
 * conditional expression as described by {@link ConditionalExpression} class description and a CSS class name separated
 * by colon.
 * <p>
 * 
 * <pre>
 *    operand = class-expression *( ';' class-expression ) [ ';' ]
 *    class-expression = ['!']OPP | conditional-class
 *    conditional-class = conditional-expression ':' class-name
 *    
 *    ; OPP = object property path to value used as CSS class; remove CSS class if OPP is prefixed with '!'
 *    ; conditional-expression = see conditional expression class description
 *    ; class-name = CSS class name
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.2
 * 
 * @constructor Construct CSS_CLASS operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.CssClassOperator = function(content) {
	this.$super(content);
};

js.dom.template.CssClassOperator.prototype = {
	/**
	 * Execute ID operator. Uses property path to extract content value, convert it to string and set <em>id</em>
	 * attribute.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String expression CSS class expression.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert content value is string or number.
	 */
	_exec : function(element, scope, expression) {
		js.util.Strings.parseNameValues(expression).forEach(function(pair) {
			// there are two accepted syntaxes: object property path and conditional CSS class expression
			// on object property path syntax pair.value is missing
			// current implementation uses missing pair.name as flag for property path syntax

			if (!pair.value) {
				// here pair.name is object property path
				// if pair.name starts with ! remove CSS class denoted by property value

				var propertyPath, enabled;
				if (pair.name.charAt(0) === '!') {
					propertyPath = pair.name.substr(1);
					enabled = false;
				}
				else {
					propertyPath = pair.name;
					enabled = true;
				}

				var cssClass = this._getValue(scope, propertyPath);
				element.addCssClass(cssClass, enabled);
				return;
			}

			// here we have a CSS class conditional expression

			var expression = pair.name;
			var cssClass = pair.value;

			var conditionalExpression = new js.dom.template.ConditionalExpression(this._content, scope, expression);
			if (conditionalExpression.value()) {
				$debug("js.dom.template.CssClassOperator#_exec", "Add CSS class |%s| to element |%s|.", cssClass, element);
				element.addCssClass(cssClass);
			}
			else {
				$debug("js.dom.template.CssClassOperator#_exec", "Remove CSS class |%s| from element |%s|.", cssClass, element);
				element.removeCssClass(cssClass);
			}
		}, this);
	},

	_getValue : function(scope, propertyPath) {
		var value = this._content.getValue(scope, propertyPath);
		if (value === value.toUpperCase()) {
			// if all upper case value is a constant that may contain underscore
			return value.toLowerCase().replace(/_/gi, '-');
		}
		return js.util.Strings.toHyphenCase(value);
	},

	_reset : function(element, expression) {
		js.util.Strings.parseNameValues(expression).forEach(function(pair) {
			// pair.value is the CSS class name
			element.removeCssClass(pair.value);
		}, this);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.CssClassOperator";
	}
};
$extends(js.dom.template.CssClassOperator, js.dom.template.Operator);
