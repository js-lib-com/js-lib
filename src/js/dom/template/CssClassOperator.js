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
 *    class-expression = conditional-expression ':' class-name
 *    
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
