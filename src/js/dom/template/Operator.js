$package('js.dom.template');

/**
 * Templates operator. A X(HT)ML template define operators in an element context; an element may have none, one or more
 * declared operators. An operator declaration consist of operator code, its opcode, and exactly one operand - more
 * formally, all operators arity is one. In example below {@link js.dom.template.Opcode#SRC} is first operator opcode
 * and <em>picture</em> its operand.
 * 
 * <pre>
 *  &lt;img data-src="picture" data-title="description" /&gt;
 * </pre>
 * 
 * DOM is traversed using depth-first algorithm and every element operator executed, if any. All operators are fully
 * defined, that is, they do not depends on a context created by another operator. In a sense they are context free:
 * yields always the same result no matter evaluation context.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.Operator = function(content) {
	/**
	 * Dynamic content reference.
	 * 
	 * @type js.dom.template.Content
	 */
	this._content = content;
};

js.dom.template.Operator.prototype = {
	_OBJECT_SETTER : "setObject",

	/**
	 * Execute operator. Execute operator logic into element context and returns a value, possible undefined. Depending
	 * on specific operator implementation not all declared parameters may be used and returned type may vary or return
	 * value missing. Operand string can denote a property path, an expression or a qualified class name, see every
	 * operator description.
	 * <p>
	 * A property path is used to access content values and can be absolute, prefixed with dot or relative to scope
	 * object. An expression is operator specific and should contain also some means to identify a content values. The
	 * point is, <em>scope</em>, <em>operand</em> tuple is used to somehow identify the content value(s) that will
	 * be injected by operator.
	 * <p>
	 * This method delegates {@link #_exec(js.dom.Element, Object, String)} but intercepts
	 * {@link js.dom.template.ContentException} logging a warning. All other errors are re-thrown. Note that on any
	 * error processed element state is not defined, that is, best effort approach. Anyway, errors are expected only for
	 * template bad syntax or improper value type and should be caught by building tools or vigilant coder.
	 * 
	 * @param js.dom.Element element element on which operator is declared,
	 * @param Object scope scope object, used when operand is a property path,
	 * @param String operand declared operand.
	 * @return Object operator execution value, possible null, or undefined.
	 * @assert all arguments are not undefined, null and are of proper type.
	 */
	exec : function(element, scope, operand) {
		// precondition - only js.dom.Element has method setObject; all others from hierarchy inherit it
		// if a user defined type implements its own object setter templates operator is not longer executed
		// is the method implementor responsibility to call super or take what ever measure to initialize its sub-graph

		// if element is not js.dom.Element and if has its own object setter delegates operator execution to element
		// this logic is implemented here because can be more operators using it, e.g. data-object, data-list, etc.
		// note that it uses private access to class construction implementation
		if ((!!element.__ctor__ && element.__ctor__ !== js.dom.Element && element.__ctor__.prototype.hasOwnProperty(this._OBJECT_SETTER)) || (!!element.constructor && element.constructor !== js.dom.Element && element.constructor.prototype.hasOwnProperty(this._OBJECT_SETTER))) {
			$assert(typeof this._content !== "undefined", "js.dom.template.Operator#exec", "User defined object setter for operator |%s| with no content.", this);
			$trace("js.dom.template.Operator#exec", "User defined |%s| object setter for operator |%s|.", element, this);
			$debug("js.dom.template.Operator#exec", "User defined object setter |%s#setObject(%s)|.", element.toString(), operand);
			try {
				element.setObject(this._content.getValue(scope, operand));
			} catch (er) {
				this._error(element, scope, operand, er);
			}
			return;
		}

		$assert(element instanceof js.dom.Element, "js.dom.template.Operator#exec", "Element is undefined, null or not of proper type.");
		$assert(js.lang.Types.isString(operand), "js.dom.template.Operator#exec", "Operand is undefined, null or not a string.");

		try {
			return this._exec(element, scope, operand);
		} catch (er) {
			this._error(element, scope, operand, er);
		}
	},

	reset : function(element, operand) {
		this._reset(element, operand);
	},

	_error : function(element, scope, operand, er) {
		var message = $format("%%s:\r\n" + //
		"\t- element: %s\r\n" + //
		"\t- class: %s\r\n" + //
		"\t- operator: %s\r\n" + //
		"\t- operand: %s\r\n" + // " +
		"\t- scope: %s\r\n" + // " +
		"\t- cause: %%s", element, element.toString(), this, operand, scope);

		if (er instanceof js.dom.template.ContentException) {
			$warn("js.dom.template.Operator#exec", message, "Undefined or invalid property", er.message);
			return;
		}

		if (er instanceof js.lang.AssertException) {
			$warn("js.dom.template.Operator#exec", message, "Assertion fails", er.message);
			throw er;
		}

		$error("js.dom.template.Operator#exec", message, "Fatal error", er.message);
		js.ua.System.error(er);
	},

	/**
	 * Operator internal workhorse. Delegated by {@link #exec(Element, Object, String)}; it has the same parameters
	 * list.
	 * 
	 * @param js.dom.Element element element on which operator is declared,
	 * @param Object scope scope object, used when operand is a property path,
	 * @param String operand declared operand.
	 * @return Object operator execution value, possible null, or undefined.
	 * @throws js.dom.template.ContentException if operator tries to access an undefined value.
	 */
	_exec : function(element, scope, operand) {
	},

	_reset : function(element, operand) {
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.Operator";
	}
};
$extends(js.dom.template.Operator, Object);
