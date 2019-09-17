$package("js.dom.template");

/**
 * Ordered variant of {@link MapOperator}. Ordered map operator works in tandem with {@link NumberingOperator} to
 * create a ordered map, i.e. every map key/value pairs has an index with specified {@link NumberingFormat format}.
 * This class takes care of index creation, increment index before every key/value pair processing while numbering
 * operators deals only with format. If numbering operator is missing this operator acts exactly as unordered map;
 * anyway, validation tool warns this condition.
 * 
 * <pre>
 *  &lt;dl&gt;
 *      &lt;dt&gt;&lt;span data-numbering="%n."&gt;&lt;/span&gt; &lt;span data-text="term"&gt;&lt;/span&gt;&lt;/dt&gt;
 *      &lt;dd data-text="definition"&gt;&lt;/dd&gt;
 *  &lt;/dl&gt;
 * </pre>
 * 
 * Note that this operator belongs to CONTENT group and only one content operator is allowed per element. See the
 * {@link Type#CONTENT the list} of mutually excluding content operators.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct OMAP operator instance.
 * @param js.dom.template.Template template parent template,
 * @param Object content dynamic content.
 */
js.dom.template.OMapOperator = function(template, content) {
	/**
	 * Parent template.
	 * 
	 * @type js.dom.template.Template
	 */
	this._template = template;

	this.$super(content);
};

js.dom.template.OMapOperator.prototype = {
	/**
	 * Key template user data key. Used to store and retrieve this map key template to/from element user data.
	 * 
	 * @type String
	 */
	_KEY_TEMPLATE : "key-template",

	/**
	 * Value template user data key. Used to store and retrieve this map value template to/from element user data.
	 * 
	 * @type String
	 */
	_VALUE_TEMPLATE : "value-template",

	/**
	 * Execute OMAP operator. Behaves like {@link js.dom.template.MapOperator#_exec(js.dom.Element, Object, String)}
	 * counterpart but takes care to create index and increment it before every key / value pair processing.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return always returns null to signal full processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element has at least two children used as key/value pairs.
	 */
	_exec : function(element, scope, propertyPath) {
		var keyTemplate = element.getUserData(this._KEY_TEMPLATE);
		var valueTemplate = element.getUserData(this._VALUE_TEMPLATE);
		element.removeChildren();
		if (scope === null) {
			// on a null scope returns but after preparing key and value templates and removing children
			return null;
		}

		var indexes = this._template._indexes;
		var index = new js.dom.template.Index();
		indexes.push(index);

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.OMapOperator#exec", "Operand is property path but scope is not an object.");
		$debug("js.dom.template.OMapOperator#_exec", "Process element |%s| for property |%s|.", element, propertyPath);

		var map = this._content.getMap(scope, propertyPath), keyElement, valueElement;
		for ( var key in map) {
			index.increment();
			keyElement = keyTemplate.clone(true);
			valueElement = valueTemplate.clone(true);
			element.addChild(keyElement, valueElement);
			this._template.injectItem(keyElement, key);
			this._template.injectItem(valueElement, map[key]);
		}
		indexes.pop();
		return undefined;
	},

	_reset : function(element) {
		this._getKeyTemplate(element);
		element.removeChildren();
	},

	_getKeyTemplate : function(element) {
		var keyTemplate = element.getUserData(this._KEY_TEMPLATE), valueTemplate;
		if (keyTemplate === null) {
			keyTemplate = element.getFirstChild();
			$assert(keyTemplate !== null, "js.dom.template.OMapOperator#_exec", "Invalid map element |%s|. Missing key template.", element);
			keyTemplate.remove(false);
			element.setUserData(this._KEY_TEMPLATE, keyTemplate);

			valueTemplate = element.getFirstChild();
			$assert(valueTemplate !== null, "js.dom.template.OMapOperator#_exec", "Invalid MAP element |%s|. Missing value template.", element);
			valueTemplate.remove(false);
			element.setUserData(this._VALUE_TEMPLATE, valueTemplate);
		}
		return keyTemplate;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.OMapOperator";
	}
};
$extends(js.dom.template.OMapOperator, js.dom.template.Operator);
