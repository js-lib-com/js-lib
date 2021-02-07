$package("js.dom");

/**
 * Standard select element. A select has variable number of options with <code>value</code> and displayed
 * <code>text</code>. If <code>value</code> is not explicitly set uses display <code>text</code> instead, see
 * {@link #getValue()}. Usually options are defined statically by HTML template but there is the option to load from
 * server, see section below.
 * <p>
 * <h3>Events</h3>
 * <p>
 * Select support standard <code>change</code> event fired when an option is selected, with standard
 * {@link js.event.Event} object. There is also a custom event - <code>updated</code>, that is fired on option
 * selected; the difference is that <code>updated</code> is fired also when options are loaded dynamically, see
 * {@link #load(Object, String, Object...)}.
 * 
 * <h3>Options Loading</h3>
 * <p>
 * Select can load it options from server using REST path. For this it has <code>data-load</code> operator that define
 * the REST path to retrieve options. Server returned list is simple passed to {@link #setOptions(Array)}. In example,
 * zones select is loaded from REST path <code>rest/zones</code>.
 * 
 * <pre>
 *  &lt;fieldset&gt;
 *      &lt;label&gt;Zone&lt;/label&gt;
 *      &lt;select data-load="rest/zones"&gt;&lt;/select&gt;
 *      ...
 *  &lt;/fieldset&gt;
 * </pre>
 * 
 * @author Iulian Rotaru
 * @constructor Construct select element instance.
 * 
 * @param js.dom.Document ownerDoc, element owner document,
 * @param Node node, native {@link Node} instance.
 * @assert <code>ownerDoc</code> argument is not undefined or null and is instance of {@link js.dom.Document}.
 */
js.dom.Select = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Select, "js.dom.Select#Select", "Invoked as function.");
	this.$super(ownerDoc, node);

	/**
	 * Object data map stores user defined object references associated with this select options. This map is
	 * initialized by {@link #setOptions(Array)} when invoked with objects and used by {@link #getObject()} to retrieve
	 * user defined object associated with current selected option.
	 * 
	 * @type Object
	 */
	this._dataMap = {};

	/**
	 * Custom events. Current implementation uses only a single custom event named <code>updated</code>. It is fired
	 * whenever this select is changed due to loading, set options or selected option changed. It has a single argument:
	 * currently selected option object with next properties: <code>value</code>, <code>text</code> and
	 * <code>data</code>.
	 * 
	 * <pre>
	 * data = {
	 * 	value: option-value,
	 * 	text: option-text,
	 * 	data: user-defined-object
	 * }
	 * </pre>
	 * 
	 * <p>
	 * First two are standard option properties whereas <code>data</code> is a reference to user defined object
	 * associated with option.
	 * 
	 * @type js.event.CustomEvents
	 */
	this._events = this.getCustomEvents();
	this._events.register("updated");

	var restPath = this.getAttr("data-load");
	if (restPath !== null) {
		$rest(restPath, this.setOptions, this);
	}

	this.on("change", this._onChange, this);
};

js.dom.Select.prototype = {
	/**
	 * CSS mark class for default options, that is, options that are not removed by {@link #setOptions(Array)} or
	 * {@link #clearOptions()}. Options marked with this CSS class are persistent across clear and loading operations.
	 * 
	 * @type String
	 */
	_DEF_OPTION_CSS : "default-option",

	/**
	 * Load this select options from server. Options returned by server are passed as they are to
	 * {@link #setOptions(Array)}.
	 * 
	 * @param Object remoteClassStub remote class stub object,
	 * @param String remoteMethod remote method name,
	 * @param Object... args remote method invocation arguments.
	 * @return js.dom.Select this object.
	 */
	load : function(remoteClassStub, remoteMethod) {
		var args = $args(arguments, 2);
		args.push(this.setOptions); // callback
		args.push(this); // callback scope
		remoteClassStub[remoteMethod].apply(remoteClassStub, args);
		return this;
	},

	/**
	 * Initialize this select options from given items list. For every given item create a new select option and
	 * initialize it accordingly. This method is a setter and will override all select options. Old options are lost,
	 * less those marked as {@link #_DEF_OPTION_CSS}.
	 * <p>
	 * This method support three kind of items: value/text pair, full object and string value. First case is
	 * straightforward: just set option value and text from given value/text pair.
	 * 
	 * <pre>
	 * Item {
	 * 	text: option-text,
	 * 	value: option-value
	 * }
	 * </pre>
	 * 
	 * <p>
	 * The second is used to store objects on this select but object should have at least two properties:
	 * <code>id</code> - stored as option value and <code>name</code> stored as text.
	 * 
	 * <pre>
	 * Item {
	 * 	id: option-value,
	 * 	name: option-text,
	 * 	...
	 * }
	 * </pre>
	 * 
	 * Object reference is stored internally and passed to user code as argument to <code>updated</code> event, see
	 * {@link #_events} description. Also object reference can be retrieved using getter {@link #getObject}.
	 * <p>
	 * Finally, if given items are string values they are simple set to option display text.
	 * 
	 * @param Array items source array of items.
	 * @return js.dom.Select this pointer.
	 */
	setOptions : function(items) {
		this.clearOptions();

		for (var i = 0, item, option; i < items.length; i++) {
			item = items[i];
			option = this._ownerDoc._document.createElement("option");

			if (js.lang.Types.isString(item)) {
				option.text = item;
			}
			else if (typeof item.id !== "undefined") {
				$assert(typeof item.name !== "undefined", "js.dom.Select#_onLoad", "Item name is undefined.");
				option.text = item.name;
				option.value = item.id.toString();
				this._dataMap[option.value] = item;
			}
			else {
				$assert(typeof item.text !== "undefined", "js.dom.Select#_onLoad", "Item text is undefined.");
				option.text = item.text;
				option.value = typeof item.value !== "undefined" ? item.value : item.text;
			}
			this._node.add(option, null);
		}

		this._events.fire("updated", this._getOption());
		return this;
	},

	/**
	 * Remove all options from this select, less those marked as {@link #_DEF_OPTION_CSS}. Also remove all objects
	 * references from object data map and reset invalid state, if the case.
	 */
	clearOptions : function() {
		var child = this.getFirstChild(), nextSibling;
		while (child !== null) {
			nextSibling = child.getNextSibling();
			if (!child.hasCssClass(this._DEF_OPTION_CSS)) {
				child.remove();
			}
			child = nextSibling;
		}

		this._dataMap = {};
		this.removeCssClass(this.CSS_INVALID);
	},

	/**
	 * Select the option with requested value. Search for the given value and select the option that match. Given value
	 * argument is compared first with option <code>value</code> then with option <code>text</code>. If there is no
	 * match current selected option is not changed. Comparison is not strict; this method accepts numeric values, for
	 * example object ID.
	 * <p>
	 * If this select is updated ensure invalid state marker is removed, see {@link #CSS_INVALID}.
	 * 
	 * @param Object value new option value, if not string uses language type cast.
	 * @return js.dom.Select this object.
	 */
	setValue : function(value) {
		var i, opts, l;
		
		value = String(value);
		this._node.selectedIndex = 0;
		for (i = 0, opts = this._node.options, l = opts.length; i < l; i++) {
			if (opts[i].value == value || opts[i].text == value) {
				this._node.selectedIndex = i;
				this.removeCssClass(this.CSS_INVALID);
				break;
			}
		}
		return this;
	},

	/**
	 * Reset selected option to the first one. Also ensure <code>validity</code> state is cleaned-up by removing
	 * {@link #CSS_INVALID} CSS class.
	 * 
	 * @returns Select this object.
	 */
	reset : function() {
		this.removeCssClass(this.CSS_INVALID);
		this._node.selectedIndex = 0;
		return this;
	},

	/**
	 * Get selected option value. If no option was selected consider the first. If option has no value returns its text
	 * instead. Returns null if this select has no options at all.
	 * 
	 * @return String option value.
	 */
	getValue : function() {
		return this._getOption().value;
	},

	/**
	 * Get selected option text. If no option was selected consider the first. Returns null if this select has no
	 * options at all.
	 * 
	 * @return String option text.
	 */
	getText : function() {
		return this._getOption().text;
	},

	/**
	 * Get selected option user defined object or null. Returns user defined object associated with current selected
	 * option or null if this select was created without user defined data.
	 * 
	 * @return Object option user defined object.
	 * @assert this select was created with user defined data.
	 */
	getObject : function() {
		return this._getOption().data;
	},

	/**
	 * Test if this control is empty. A select is empty if no option was selected, that is, {@link #getIndex} returns
	 * -1.
	 * 
	 * @return Boolean true if this control is empty.
	 */
	isEmpty : function() {
		return this.getIndex() === -1;
	},

	/**
	 * Validity test. Select is valid if has options and selected value is not null or empty. If this select has options
	 * but currently selected one is empty string it is considered invalid. Anyway, if this select has
	 * {@link #CSS_OPTIONAL} CSS marker class it is always considered valid.
	 * <p>
	 * This predicate has side effects: it updates control <code>validity</code> state. Before returning, this
	 * predicate takes care to remove/add {@link #CSS_INVALID} CSS class if this control is valid, respective not valid.
	 * 
	 * @return Boolean true if a selection was made.
	 */
	isValid : function() {
		var value = this.getValue();
		var valid = this.hasCssClass(this.CSS_OPTIONAL) || (value !== null && value !== "");
		this.addCssClass(this.CSS_INVALID, !valid);
		return valid;
	},

	/**
	 * Return selected option index, zero based. Return -1 if no option was selected.
	 * 
	 * @return Number selected option index or -1.
	 */
	getIndex : function() {
		return this._node.selectedIndex;
	},

	/**
	 * Test selected option value.
	 * 
	 * @param String value
	 */
	equals : function(value) {
		return this._getOption().value == value;
	},

	/**
	 * Event handler for <code>change</code> DOM event. It just fires <code>updated</code> custom event with
	 * selected option as argument.
	 * 
	 * @param js.event.Event ev event instance.
	 */
	_onChange : function(ev) {
		this._events.fire("updated", this._getOption());
	},

	/**
	 * Get option value, text and user defined object, if any loaded. this method retrieves the selected option; if no
	 * selection was made consider the first option. Returned object is guaranteed to have <code>value</code> and
	 * <code>text</code> properties. If select option has only text returned object has both properties set to text
	 * value. If this select has no options at all returned object has both value and text set to null.
	 * <p>
	 * If this select has user defined objects returned value contain a reference on <code>data</code> property.
	 * Otherwise <code>data</code> property is undefined.
	 * 
	 * <pre>
	 * data = {
	 * 	value: option-value,
	 * 	text: option-text,
	 * 	data: user-defined-object
	 * }
	 * </pre>
	 * 
	 * @return Object selected option or first.
	 */
	_getOption : function() {
		var idx, option;

		// if this select is empty returns null option
		if (this._node.options.length === 0) {
			return {
				value : null,
				text : null,
				data : null
			};
		}

		idx = this._node.selectedIndex;
		// if no selection made consider the first option
		if (idx === -1) {
			idx = 0;
		}
		option = this._node.options[idx];
		return {
			value : option.value,
			text : option.text,
			data : this._dataMap[option.value]
		};
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.Select";
	}
};
$extends(js.dom.Select, js.dom.Control);
