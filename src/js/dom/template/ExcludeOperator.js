$package("js.dom.template");

/**
 * Exclude element and its descendants from resulting document. What exclusion means is implementation dependent: one
 * may choose to hide somehow - maybe display:none, another to simple remove the branch completely from resulting
 * document. The point is, the marked branch must not be visible to end user. This operator is not so much a conditional
 * one since test is performed on a boolean literal rather than some content value. Branch exclusion is actually decided
 * on development phase. A good usage example may be email template: head meta is used for email initialization but not
 * included into delivery.
 * 
 * <pre>
 *  &lt;head data-exclude="true"&gt;
 *      &lt;meta name="from" content="from@server.com" /&gt;
 *      &lt;meta name="subject" content="subject" /&gt;
 *  &lt;/head&gt;
 * </pre>
 * 
 * Operand is a boolean literal. Nothing special: <em>true</em> or <em>false</em>.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct exclude operator instance.
 */
js.dom.template.ExcludeOperator = function() {
};

js.dom.template.ExcludeOperator.prototype = {
	/**
	 * Execute EXCLUDE operator. Returns branch enabled flag, that is, true to indicate branch is to be included in
	 * resulting document. Since exclude operator has opposite logic we need to negate given boolean expression; so, if
	 * operand is 'true' meaning the branch should be excluded this method returns false.
	 * 
	 * @param js.dom.Element element context element, unused,
	 * @param Object scope scope object, unused,
	 * @param Boolean booleanExpression boolean expression, 'true' or 'false'.
	 * @return branch enabled flag, that is, false if templates engine should continue processing the branch.
	 */
	_exec : function(element, scope, booleanExpression) {
		// returned value is interpreted as branch enabled
		// boolean expression argument is true if branch should be excluded, so we need to inverse it
		return !(booleanExpression.toLowerCase() === "true");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.ExcludeOperator";
	}
};
$extends(js.dom.template.ExcludeOperator, js.dom.template.Operator);
