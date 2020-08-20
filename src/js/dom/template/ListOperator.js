$package("js.dom.template");

/**
 * Populate element using first child as item template. Extract content list designated by defined property path then
 * uses first element as item template and repeat it for every item from list. Assert if child is missing; if more
 * children, they are simple ignored. When processing items this operator does a temporary scope object switch. Every
 * child element is processed into list item object scope. List item can be primitives, arbitrary complex object or
 * nested lists or maps. There is no restriction on nesting level.
 * 
 * <pre>
 *  &lt;ul data-list="persons"&gt;
 *      &lt;li data-text="name"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 *  
 *  List&lt;Person&gt; persons;
 *  class Person {
 *      String name;
 *  }
 * </pre>
 * 
 * This operator operand is the property path designating the list.
 * <p>
 * Item template operators are processed recursively by engine logic. Anyway, child element operator can miss, in which
 * case default is applied as follows: if template element has children is assumed to have {@link Opcode#OBJECT}
 * operator, otherwise {@link Opcode#TEXT}.
 * 
 * <pre>
 *  &lt;ul data-list="."&gt;
 *      &lt;li&gt; . . . &lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * Note that this operator belongs to {@link Type#CONTENT} group and only one content operator is allowed per element.
 * See the {@link Type#CONTENT the list} of mutually excluding content operators.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct LIST operator instance.
 * @param js.dom.template.Template template parent template,
 * @param js.dom.template.Content content dynamic content instance.
 */
js.dom.template.ListOperator = function(template, content) {
	/**
	 * Parent template.
	 * 
	 * @type js.dom.template.Template
	 */
	this._template = template;

	this.$super(content);
};

js.dom.template.ListOperator.prototype = {
	/**
	 * Item template user data key. Used to store and retrieve this list template to/from element user data.
	 * 
	 * @type String
	 */
	_ITEM_TEMPLATE : "item-template",

	_ITEM_VALUE : "value",

	/**
	 * Execute LIST operator. Extract content list then repeat context element first child for every list item.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return always returns null to signal full processing.
	 * @assert parameters are not undefined or null and of proper type and element has at least one child.
	 */
	_exec : function(element, scope, propertyPath) {
		var itemTemplate = this._getItemTemplate(element);
		element.removeChildren();
		if (scope === null) {
			// on a null scope returns but after preparing item template and removing children
			return null;
		}

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.ListOperator#exec", "Operand is property path but scope is not an object.");
		$debug("js.dom.template.ListOperator#_exec", "Process element |%s| for property |%s|.", element, propertyPath);

		var it = this._content.getIterable(scope, propertyPath), itemElement, value;
		while (it.hasNext()) {
			value = it.next();
			itemElement = itemTemplate.clone(true);
			itemElement.setUserData(this._ITEM_VALUE, value);
			element.addChild(itemElement);
			// list item value become the scope for injecting element
			this._template.injectItem(itemElement, value);
		}
		return undefined;
	},

	_reset : function(element) {
		// take care to initialize item template in case is not already initialized
		// ignore returned value for next statement; it initializes element user data as side effect
		this._getItemTemplate(element);
		element.removeChildren();
	},

	_getItemTemplate : function(element) {
		var itemTemplate = element.getUserData(this._ITEM_TEMPLATE);
		if (itemTemplate === null) {
			itemTemplate = element.getFirstChild();
			$assert(itemTemplate !== null, "js.dom.template.ListOperator#exec", "Invalid list element |%s|. Missing item template.", element);
			itemTemplate.remove(false);
			element.setUserData(this._ITEM_TEMPLATE, itemTemplate);
		}
		return itemTemplate;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.ListOperator";
	}
};
$extends(js.dom.template.ListOperator, js.dom.template.Operator);
