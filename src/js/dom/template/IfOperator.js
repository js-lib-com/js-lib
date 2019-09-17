$package("js.dom.template");

/**
 * Include branch if content value is not empty. Operand is the property path; uses it to get content value and test if
 * is empty. If value is not empty, that is <em>if</em> content, branch is included. See {@link Content#isEmpty} for
 * definition of empty value.
 * 
 * <pre>
 *  &lt;div data-if="flag"&gt;  
 *  . . .
 *  &lt;/div&gt;
 * </pre>
 * 
 * If <em>flag</em> is empty div and all its descendants are excluded from resulting document. This operator is the
 * counterpart of {@link IfNotOperator} acting with opposite logic. These two operators can be combined to emulate
 * if/else:
 * 
 * <pre>
 *  &lt;div data-if="flag"&gt;  
 *      // this branch is included if flag is not empty
 *  &lt;/div&gt;
 *  &lt;div data-ifnot="flag"&gt;  
 *      // this branch is included if flag is empty
 *  &lt;/div&gt;
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct IF operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.IfOperator = function(content) {
	this.$super(content);
};

js.dom.template.IfOperator.prototype = {
	/**
	 * Execute IF operator. Uses property path to extract content value and return true if not empty. Returned value
	 * acts as branch enabled flag.
	 * 
	 * @param js.dom.Element element context element, unused,
	 * @param Object scope scope object,
	 * @param String expression conditional expression.
	 * @return true if content value is not empty.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 */
	_exec : function(element, scope, expression) {
		var conditionalExpression = new js.dom.template.ConditionalExpression(this._content, scope, expression);
		return conditionalExpression.value();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.IfOperator";
	}
};
$extends(js.dom.template.IfOperator, js.dom.template.Operator);
