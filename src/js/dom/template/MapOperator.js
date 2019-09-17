$package("js.dom.template");

/**
 * Populate element using first two children as key/value templates. Extract content map designated by declared property
 * path then uses first two elements as key/value templates and repeat them for every map entry. Missing child element
 * templates is fatal error so context element should have at least two child elements. If more, they are simple
 * ignored. When processing map entries this operator does a temporary scope object switch. Every child element is
 * processed into respective object scope. Map key/value pair can be primitives, arbitrary complex object or nested
 * lists or maps. There is no restriction on nesting level.
 * 
 * <pre>
 *  &lt;dl data-map="map"&gt;
 *      &lt;dt data-text="."&gt;&lt;/dt&gt;
 *      &lt;dd data-text="."&gt;&lt;/dd&gt;
 *  &lt;/dl&gt;
 *  
 *  Map&lt;String, String&gt; map;
 * </pre>
 * 
 * This operator operand is the property path designating the map.
 * <p>
 * Map entry templates operators are processed recursively by engine logic. Anyway, child element operator can miss, in
 * which case default is applied as follows: if template element has children is assumed to have {@link Opcode#OBJECT}
 * operator, otherwise {@link Opcode#TEXT}. So above sample can be rewritten:
 * 
 * <pre>
 *  &lt;dl data-map="map"&gt;
 *      &lt;dt&gt;&lt;/dt&gt;
 *      &lt;dd&gt;&lt;/dd&gt;
 *  &lt;/dl&gt;
 * </pre>
 * 
 * <p>
 * Note that this operator belongs to {@link Type#CONTENT} group and only one content operator is allowed per element.
 * See the {@link Type#CONTENT the list} of mutually excluding content operators.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct MAP operator instance.
 * @param js.dom.template.Template template parent template,
 * @param Object content dynamic content.
 */
js.dom.template.MapOperator = function(template, content) {
	/**
	 * Parent template.
	 * 
	 * @type js.dom.template.Template
	 */
	this._template = template;

	this.$super(content);
};

js.dom.template.MapOperator.prototype = {
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
	 * Execute MAP operator. Extract content map using given property path and serialize every map entry using first two
	 * child elements as key/value templates.
	 * 
	 * @param js.dom.Element element context element,
	 * @param Object scope scope object,
	 * @param String propertyPath property path.
	 * @return always returns null to signal full processing.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 * @assert element has at least two children used as key/value pairs.
	 */
	_exec : function(element, scope, propertyPath) {
		var keyTemplate = this._getKeyTemplate(element);
		var valueTemplate = element.getUserData(this._VALUE_TEMPLATE);
		element.removeChildren();
		if (scope === null) {
			// on a null scope returns but after preparing key and value templates and removing children
			return null;
		}

		$assert(propertyPath === "." || js.lang.Types.isObject(scope), "js.dom.template.MapOperator#exec", "Operand is property path but scope is not an object.");
		$debug("js.dom.template.MapOperator#_exec", "Process element |%s| for property |%s|.", element, propertyPath);

		var map = this._content.getMap(scope, propertyPath), keyElement, valueElement;
		for ( var key in map) {
			keyElement = keyTemplate.clone(true);
			valueElement = valueTemplate.clone(true);
			element.addChild(keyElement, valueElement);
			this._template.injectItem(keyElement, key);
			this._template.injectItem(valueElement, map[key]);
		}
		return undefined;
	},

	_reset : function(element) {
		// takes care to initialize key and value templates in case they are not already initialized
		this._getKeyTemplate(element);
		element.removeChildren();
	},

	_getKeyTemplate : function(element) {
		var keyTemplate = element.getUserData(this._KEY_TEMPLATE);
		if (keyTemplate === null) {
			keyTemplate = element.getFirstChild();
			$assert(keyTemplate !== null, "js.dom.template.MapOperator#_exec", "Invalid map element |%s|. Missing key template.", element);
			keyTemplate.remove(false);
			element.setUserData(this._KEY_TEMPLATE, keyTemplate);

			var valueTemplate = element.getFirstChild();
			$assert(valueTemplate !== null, "js.dom.template.MapOperator#_exec", "Invalid MAP element |%s|. Missing value template.", element);
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
		return "js.dom.template.MapOperator";
	}
};
$extends(js.dom.template.MapOperator, js.dom.template.Operator);
