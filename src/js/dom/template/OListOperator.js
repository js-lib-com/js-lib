$package("js.dom.template");

/**
 * Ordered variant of {@link ListOperator}. Ordered list operator works in tandem with {@link NumberingOperator} to
 * create a ordered list, i.e. every list item has an index with specified {@link NumberingFormat format}. This class
 * takes care of index creation, increment index before every item processing while numbering operators deals only with
 * format. If numbering operator is missing this operator acts exactly as unordered list; anyway, validation tool warns
 * this condition.
 * 
 * <pre>
 *  &lt;section data-olist="chapters"&gt;
 *      &lt;h1&gt;&lt;span data-numbering="%n."&gt;&lt;/span&gt; &lt;span data-text="title"&gt;&lt;/span&gt;&lt;/h1&gt;
 *      &lt;p data-text="content"&gt;&lt;/p&gt;
 *  &lt;/section&gt;
 * </pre>
 * 
 * Note that this operator belongs to {@link Type#CONTENT} group and only one content operator is allowed per element.
 * See the {@link Type#CONTENT the list} of mutually excluding content operators.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct OLIST operator instance.
 * @param js.dom.template.Template template parent template,
 * @param js.dom.template.Content content dynamic content instance.
 */
js.dom.template.OListOperator = function(template, content) {
	/**
	 * Parent template.
	 * 
	 * @type js.dom.template.Template
	 */
	this._template = template;

	this.$super(content);
};

js.dom.template.OListOperator.prototype = {
	/**
	 * Item template user data key. Used to store and retrieve this list template to/from element user data.
	 * 
	 * @type String
	 */
	_ITEM_TEMPLATE : "item-template",

	/**
	 * Execute OLIST operator. Behaves like {@link js.dom.template.ListOperator#_xec(js.dom.Element, Object, String)}
	 * counterpart but takes care to create index and increment it before every item processing.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path,
	 * @return always returns null to signal full processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element has at least one child.
	 */
	_exec : function(element, scope, propertyPath) {
		var itemTemplate = this._getItemTemplate(element);
		element.removeChildren();
		if (scope === null) {
			// on a null scope returns but after preparing item template and removing children
			return null;
		}

		var indexes = this._template._indexes;
		var index = new js.dom.template.Index();
		indexes.push(index);

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.OListOperator#exec", "Operand is property path but scope is not an object.");
		$debug("js.dom.template.OListOperator#_exec", "Process element |%s| with property |%s|.", element, propertyPath);

		var it = this._content.getIterable(scope, propertyPath), itemElement;
		while (it.hasNext()) {
			index.increment();
			itemElement = itemTemplate.clone(true);
			element.addChild(itemElement);
			this._template.injectItem(itemElement, it.next());
		}
		indexes.pop();
		return undefined;
	},

	_reset : function(element) {
		this._getItemTemplate(element);
		element.removeChildren();
	},

	_getItemTemplate : function(element) {
		var itemTemplate = element.getUserData(this._ITEM_TEMPLATE);
		if (itemTemplate === null) {
			itemTemplate = element.getFirstChild();
			$assert(itemTemplate !== null, "js.dom.template.OListOperator#exec", "Invalid list element |%s|. Missing item template.", element);
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
		return "js.dom.template.OListOperator";
	}
};
$extends(js.dom.template.OListOperator, js.dom.template.Operator);
