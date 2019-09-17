$package("js.dom.template");

/**
 * Unconditional jump to element with ID specified by this operator literal value. This operator is not part of
 * j(s)-templates interface; it is an extension used for internal engine speed optimization. Usually is handled by
 * building tool, eliminating from scanning process document subtrees known to not have templates operators. For example
 * is used on building tests page into <code>html</code> tag to jump directly to scratch area resulting a speed gain
 * for running tests of about 300%.
 * 
 * <pre>
 *  &lt;div data-goto="templates-root-id"&gt;
 *      // document sections known to not have templates operators
 *      &lt;section id="templates-root-id"&gt;
 *          . . .
 *      &lt;/section&gt;
 *  &lt;/div&gt;
 * </pre>
 * 
 * Operand is a string literal representing the ID of the element to jump to. When templates engine executes above goto
 * operator it literally replace the <em>div</em> element with target <em>section</em>, into processing pipe. All
 * others descendants are ignored, even if they contain templates operators.
 * 
 * <pre>
 *       2 - 3                     6
 *      /                         /
 * 0 - 1       6      :=     0 - 5  
 *      \     /                   \
 *       4 - 5                     7
 *            \
 *             7
 * </pre>
 * 
 * In above example element <b>1</b> has a goto operator with <b>5</b> as target element. Equivalent processing tree
 * is shown in the right and one may note that only element <b>5</b> and its descendants are processed; all others are
 * skipped.
 * <p>
 * Please note that server side templates engine does not implement this operator and is natural since it needs to
 * serialize all template document.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct goto operator instance.
 */
js.dom.template.GotoOperator = function() {
};

js.dom.template.GotoOperator.prototype = {
	/**
	 * Execute GOTO operator. Just store return the target element ID.
	 * 
	 * @param js.dom.Element element context element, unused,
	 * @param Object scope scope object, unused,
	 * @param String elementID element ID to jump to.
	 * @return target element ID.
	 */
	_exec : function(element, scope, elementID) {
		return elementID;
	},

	_reset : function(element, elementID) {
		return elementID;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.GotoOperator";
	}
};
$extends(js.dom.template.GotoOperator, js.dom.template.Operator);
