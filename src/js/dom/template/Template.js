$package('js.dom.template');

/**
 * Templates engine. This is the interface of templates engine package. Using it is straightforward: get instance using
 * the {@link #getInstance factory method} and call {@link #inject(Object)}. Note that, since a templates engine
 * instance operates upon a {@link js.dom.Document j(s)-dom document}, factory method requires a document instance as
 * argument.
 * 
 * <pre>
 * var doc = Builder.parseHTML(...);
 * var template = js.dom.template.Template.getInstance(doc);
 * template.inject(value);
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct templates engine instance. Although this constructor is public it is not intended for user
 * space usage. Uses {@link js.dom.template.Template#getInstance(js.dom.Document)} instead.
 * 
 * @param js.dom.Document doc template document.
 * @assert given document is not undefined or null and is of proper type.
 */
js.dom.template.Template = function(doc) {
	$assert(doc, "js.dom.template.Template#Template", "Document is undefined or null.");
	$assert(doc instanceof js.dom.Document, "js.dom.template.Template#Template", "Document is not of proper type.");

	/**
	 * Template document.
	 * 
	 * @type js.dom.Document
	 */
	this._doc = doc;

	/**
	 * Operator factory.
	 * 
	 * @type js.dom.template.OperatorFactory
	 */
	this._operatorFactory = new js.dom.template.OperatorFactory(this);

	/**
	 * Operators list.
	 * 
	 * @type js.dom.template.OperatorsList
	 */
	this._operators = new js.dom.template.OperatorsList();

	/**
	 * Indexes stack for ordered lists. Every ordered list has its own index instance and in order to cope with nested
	 * lists we used this stack. For the same reason, although indexes are used only by {@link ListOperator}, indexes
	 * stack is global per template engine instance.
	 * 
	 * @type Array
	 */
	this._indexes = [];
};

/**
 * Templates engine factory.
 * 
 * @param js.dom.Document doc template document.
 * @return js.dom.template.Template templates engine instance.
 */
js.dom.template.Template.getInstance = function(doc) {
	return new js.dom.template.Template(doc);
};

js.dom.template.Template.prototype = {
	/**
	 * Inject value into template document. Parameter <code>value</code> is an object that has properties matching
	 * document element operators. It can be an instance of {@link js.dom.template.Content}. This method just delegates
	 * {@link #_injectElement(js.dom.Element, Object)} with document root element.
	 * <p>
	 * This method is used when content is to be injected into entire document, see sample code. For parts of document
	 * tree uses {@link #InjectElement(js.dom.Element, Object)}.
	 * 
	 * <pre>
	 * var template = js.dom.template.Template.getInstance(doc);
	 * template.inject(value);
	 * </pre>
	 * 
	 * @param Object value value or content instance, to inject.
	 */
	inject : function(value) {
		$assert(value, "js.dom.template.Template#inject", "Value is undefined or null.");
		var content = this._init(value);
		this._injectElement(this._doc.getRoot(), content.getModel());
	},

	/**
	 * Inject value into specified element subtree. Similar to {@link #inject(Object)} but uses given
	 * <code>element</code> instead of document root as injection point.
	 * <p>
	 * Is is primarily intended for library internals but there is no formal restriction. Anyway, recommend way to use
	 * this feature is {@link js.dom.Element#setObject(Object)}.
	 * 
	 * <pre>
	 * var template = js.dom.template.Template.getInstance(doc);
	 * Element element = doc.getBy...
	 * template.injectElement(element, value);
	 * 
	 * . . .
	 * 
	 * element.setObject(value);
	 * </pre>
	 * 
	 * <p>
	 * In order to inject content into an element, target element should have a content operator - see
	 * {@link js.dom.template.Opcode.Type#CONTENT} for a list of supported content operator.
	 * 
	 * @param js.dom.Element element injection point,
	 * @param Object value value to inject.
	 */
	injectElement : function(element, value) {
		$assert(element, "js.dom.template.Template#injectElement", "Element is undefined or null.");
		$assert(js.lang.Types.isElement(element), "js.dom.template.Template#injectElement", "Element is not of proper type.");
		$assert(typeof value !== "undefined", "js.dom.template.Template#injectElement", "Value argument is undefined.");
		if (value == null) {
			this.reset(element);
			return;
		}
		var content = this._init(value);
		this._operators.initSubtree(element);
		this._inject(element, content.getModel());
	},

	/**
	 * Variant for injecting value into an element that is part of a list or map. In this case the second element is the
	 * scope whereas values are defined by element operators.
	 * <p>
	 * Although this method is public it is designed for templates engine internal usage. It is used by list and map
	 * operators.
	 * 
	 * @param js.dom.Element element element to add values to,
	 * @param Object scope scope holds values identified by element operators.
	 */
	injectItem : function(element, scope) {
		this._operators.initItem(element);
		this._inject(element, scope);
	},

	reset : function(element) {
		$assert(element, "js.dom.template.Template#reset", "Element is undefined or null.");
		$assert(js.lang.Types.isElement(element), "js.dom.template.Template#reset", "Element is not of proper type.");
		this._operators.initElement(element);

		if (this._operators.hasJumpOperator()) {
			var id = this._resetOperator(element, this._operators.getJumpOperatorMeta());
			var gotoElement = this._doc.getById(id);
			if (gotoElement) {
				element = gotoElement;
				this._operators.initElement(element);
			}
		}

		// conditional operators are not processed on reset since all branches are scanned

		this._operators.getAttributeOperatorsMeta().forEach(function(meta) {
			this._resetOperator(element, meta);
		}, this);

		if (this._operators.hasContentOperator()) {
			this._resetOperator(element, this._operators.getContentOperatorMeta());
		}

		element.getChildren().forEach(function(element) {
			this.reset(element);
		}, this);
	},

	/**
	 * Initialize operator factory and convert value into content instance, if not already.
	 * 
	 * @param Object value value or content instance to inject.
	 * @return js.dom.template.Content content instance.
	 */
	_init : function(value) {
		var content = value instanceof js.dom.template.Content ? value : new js.dom.template.Content(value);
		this._operatorFactory.init(content);
		return content;
	},

	/**
	 * Initialize operators list from given element and invoke main injection method. This method is part of the
	 * recursive iteration together with {@link #_inject(js.dom.Element, Object)}.
	 * 
	 * @param js.dom.Element element element to set values to,
	 * @param Object scope object that hold values defined by element operators.
	 */
	_injectElement : function(element, scope) {
		this._operators.initElement(element);
		this._inject(element, scope);
	},

	/**
	 * Execute initialized operators list in given execution scope and update the document element. Operators list, see
	 * {@link #_operators}, should be properly initialized before invoking this method.
	 * <p>
	 * If element has children invoke {@link #_injectElement(js.dom.Element, Object)} on each of them, that on its turn
	 * re-invoke this method. This recursive iteration allows for all <code>element</code> descendants processing in
	 * depth-first order.
	 * 
	 * @param js.dom.Element element document element to inject values into,
	 * @param Object scope operators execution scope.
	 */
	_inject : function(element, scope) {
		$assert(element, "js.dom.template.Template#_inject", "Element is undefined or null.");
		$assert(js.lang.Types.isElement(element), "js.dom.template.Template#_inject", "Element is not of proper type.");

		if (this._operators.hasJumpOperator()) {
			var id = this._execOperator(element, scope, this._operators.getJumpOperatorMeta());
			// replace current element and its operators list with goto target element
			// but only if target element exists
			var gotoElement = this._doc.getById(id);
			if (gotoElement) {
				element = gotoElement;
				this._operators.initElement(element);
			}
		}

		if (scope !== null && this._operators.hasConditionalOperator()) {
			var branchEnabled = this._execOperator(element, scope, this._operators.getConditionalOperatorMeta());
			if (!branchEnabled) {
				$debug("js.dom.template.Template#_inject", "Element |%s| rejected by conditional operator.", element);
				element.hide();
				return;
			}
			element.show();
		}

		if (scope !== null) {
			this._operators.getAttributeOperatorsMeta().forEach(function(meta) {
				this._execOperator(element, scope, meta);
			}, this);
		}

		if (this._operators.hasContentOperator()) {
			scope = this._execOperator(element, scope, this._operators.getContentOperatorMeta());
			if (typeof scope === "undefined") {
				return;
			}
			if (scope === null && this._operators.getContentOperatorMeta().opcode !== js.dom.template.Opcode.OBJECT) {
				// content operator returns null if fully processed, that is, document tree branch is ended
				return;
			}
		}

		var it = element.getChildren().it(), el;
		while (it.hasNext()) {
			this._injectElement(it.next(), scope);
		}
	},

	/**
	 * Execute operator identified by meta opcode. This helper method just get operator instance from
	 * {@link #_operatorFactory} then delegates it.
	 * 
	 * @param js.dom.Element element element on which operator operates,
	 * @param Object scope operator execution scope,
	 * @param Object meta meta data contains opcode and operand.
	 * @return Object operator execution value, possible null, or undefined.
	 */
	_execOperator : function(element, scope, meta) {
		var operator = this._operatorFactory.getInstance(meta.opcode);
		return operator.exec(element, scope, meta.operand);
	},

	_resetOperator : function(element, meta) {
		var operator = this._operatorFactory.getResetOperator(meta.opcode);
		return operator.reset(element, meta.operand);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.Template";
	}
};
$extends(js.dom.template.Template, Object);
