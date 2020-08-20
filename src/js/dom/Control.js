$package("js.dom");

/**
 * Standard controls hierarchy root and base class for user defined controls. This class is a generic form control;
 * there are couple specializations supplied by this library like {@link FileInput} or {@link Checkbox}.
 * <p>
 * This class is also the base class for user defined controls. A user defined control is a generic block element, most
 * likely <code>div</code> that has <code>data-name</code> attribute. An example would be a geographical map used to
 * select localities. The value of such control would be locality name; on user interface locality is represented by
 * maps mark. If multiple is supported multiple marks are displayed and value is an {@link Array} of localities.
 * <p>
 * There are private low level access methods that subclass may override in order to supply specific functionalities. In
 * most cases subclass should not need to override other public, high level, methods. Here is the list:
 * <ul>
 * <li>{@link #_setValue(String)} - set this control raw value,
 * <li>{@link #_getValue()} - return control raw value,
 * <li>{@link #_getDefaultValue()} - return control default value or empty string,
 * <li>{@link #_clean()} - clean this control value,
 * <li>{@link #_focus()} - set focus on this control.
 * </ul>
 * <p>
 * A control has two CSS class marks: {@link #CSS_OPTIONAL} and {@link #CSS_INVALID}. By default, an empty control is
 * invalid; anyway if marked <code>optional</code> empty control is considered valid. A control becomes
 * <code>invalid</code> if {@link #isValid()} said so. On user interface it is marked using CSS styles, perhaps with a
 * red border. Please note that {@link #reset()} and {@link #focus()} methods clean-up <code>invalid</code> state.
 * <p>
 * There are two formatted value accessors: {@link #setValue(Object)}, respective {@link #getValue()}. If control has
 * a {@link js.format.Format} instance configured, it is delegated to pre/post process raw value control. If no
 * formatter, value should be convertible to {@link String}. Multiple values support is enabled if this control has an
 * attribute <code>multiple</code>. Subclass may override {@link #isMultiple()} to enable multiple values based on
 * specific conditions. If multiple values is enabled value accessors uses {@link Array} as value.
 * <p>
 * Finally, for multiple values traversal, control class provides items iterator - see
 * {@link #forEachItem(Function, Object...)}. It can be used in conjunction with {@link js.dom.ControlsIterable} to
 * uniformly traverse all values from a {@link js.dom.Form}. Control <code>forEachItem</code> method has consistent
 * behavior for both single and multiple values. If single value it invokes callback function only once.
 * 
 * <pre>
 *  var iterable = new js.dom.ControlsIterable(form);
 *  iterable.forEach(function (control) {
 *      control.forEachItem(function (item) {
 *          // do something with item.name and item.value
 *      }, this);
 *  });
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct generic control instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native node instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.Control = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Control, "js.dom.Control#Control", "Invoked as function.");
	this.$super(ownerDoc, node);

	/**
	 * Internal flag, true only for control instances. Used to detect that an element is a control.
	 * 
	 * @type Boolean
	 */
	this.__control__ = true;
};

js.dom.Control.prototype = {
	/**
	 * Mark CSS class to identify optional control.
	 * 
	 * @type String
	 */
	CSS_OPTIONAL : "optional",

	/**
	 * Mark CSS class to identify invalid control.
	 * 
	 * @type String
	 */
	CSS_INVALID : "invalid",

	/**
	 * Set this control formatted value. If this control has a format class uses it to convert given value into a string
	 * suitable for user interface. If has multiple values - as returned by {@link isMultiple()}, <code>value</code>
	 * argument should be an array; concatenates all array items using comma as separator applying formatter, if
	 * present, for every item. If given value is null this method clear control value. Also takes care to remove
	 * <code>invalidate</code> flag, if exist.
	 * <p>
	 * User defined control may override this method. For example a geographical map will move the mark to newly address
	 * value.
	 * <p>
	 * It seems there are user agents that do not update user interface when an element become visible after
	 * <code>display:none</code>. As a consequence set values may not be reflected on user interface. This library
	 * recommendation is to ensure control is visible before using this setter.
	 * 
	 * @param Object value primitive value or array if this control supports multiple values.
	 * @return js.dom.Control this object.
	 * @assert <code>value</code> argument is not undefined or null and is of proper type and this control is visible.
	 */
	setValue : function(value) {
		this.removeCssClass(this.CSS_INVALID);

		$assert(typeof value !== "undefined", "js.dom.Control#setValue", "Value is undefined.");
		if (typeof value === "undefined") {
			return this;
		}

		$assert(this.getAttr("type") === "hidden" || this.style.get("display") !== "none", "js.dom.Control#setValue", "Control |%s| has display none.", this);
		if (value === null) {
			return this._clean();
		}

		if (!this.isMultiple()) {
			if (this._format !== null) {
				value = this._format.format(value);
			}
			$assert(js.lang.Types.isPrimitive(value), "js.dom.Control#setValue", "Expected primitive but got |%s|.", value);
			if (!js.lang.Types.isString(value)) {
				value = value.toString();
			}
		}
		else {
			$assert(js.lang.Types.isArray(value), "js.dom.Control#setValue", "Mutiple values control expected array but got |%s|.", value);
			if (value.length === 0) {
				return this._clean();
			}
			// here value is an array
			var array = value;
			value = "";
			for (var i = 0; i < array.length; ++i) {
				if (i > 0) {
					value += ',';
				}
				value += (this._format !== null ? this._format.format(array[i]) : array[i].toString());
			}
		}
		return this._setValue(value);
	},

	/**
	 * Get this control formatted value. Returns this control formatted value or null if no user input at all. If this
	 * control has a format class uses it to parse the control value returning the resulted object. If no, control
	 * returns value as string or null if empty.
	 * <p>
	 * If control has multiple values, split node raw value using comma as separator and returns values as {@link Array}.
	 * If this control has a format class apply parse method to every item from array. If value is empty returns empty
	 * array.
	 * 
	 * @return Object this element value, null or empty array.
	 */
	getValue : function() {
		var value = this._getValue();
		if (value) {
			value = value.trim();
		}
		if (!this.isMultiple()) {
			return this._format !== null ? this._format.parse(value) : value ? value : null;
		}

		// if multiple values supported and this control is empty returns an empty array
		if (!value) {
			return [];
		}

		var values = value.split(",");
		for (var i = 0; i < values.length; ++i) {
			values[i] = values[i].trim();
			if (this._format !== null) {
				values[i] = this._format.parse(values[i]);
			}
		}
		return values;
	},

	/**
	 * Reset this control value to initial state. Try to reload control value from default value attribute. If no
	 * default value attribute found set this control value to empty. Also ensure <code>validity</code> state is
	 * cleaned-up by removing {@link #CSS_INVALID} CSS class.
	 * 
	 * @return js.dom.Control this object.
	 */
	reset : function() {
		this.removeCssClass(this.CSS_INVALID);
		this._node.value = this._getDefaultValue();
		return this;
	},

	/**
	 * Check this control is valid and update <code>validity</code> state accordingly. A control is valid if it has a
	 * non empty raw, but trimmed, value; if this control has formatter, validity check is delegated to
	 * {@link js.format.Format#test} method. Anyway, control is always considered valid if it has {@link CSS_OPTIONAL}
	 * CSS class and its raw value is empty. Also, is always considered valid if is disabled.
	 * <p>
	 * Argument <code>includeOptional</code> is used to force validation even if this control is marked optional. It
	 * is optional, with default to false. If not provided, optional control is processed as described above.
	 * <p>
	 * As mentioned, if control is mandatory tested value is trimmed by white spaces at both ends. This means that a
	 * value containing only spaces is not valid.
	 * <p>
	 * This predicate has side effects: it updates control <code>validity</code> state. Before returning, this
	 * predicate takes care to remove/add {@link #CSS_INVALID} CSS class if this control is valid, respective not valid.
	 * 
	 * @param Bollean includeOptional optional flag to force validation even if this control optional, default to false.
	 * @return Boolean true if this control is valid.
	 */
	isValid : function(includeOptional) {
		if (typeof includeOptional === "undefined") {
			includeOptional = false;
		}

		var valid = function(valid) {
			this.addCssClass(this.CSS_INVALID, !valid);
			return valid;
		}.bind(this);

		// a disabled control is always consider valid to not influence form validity test
		if (!this.isEnabled()) {
			return valid(true);
		}

		var value = this._getValue();
		if (value) {
			value = value.trim();
		}

		if (!includeOptional && this.hasCssClass(this.CSS_OPTIONAL) && !value) {
			// an optional and empty control is always valid
			return valid(true);
		}

		// here value can still be empty
		if (this._format !== null) {
			// if have formatter class delegates its test predicate
			return valid(this._format.test(value));
		}

		// if no formatter class a control is valid if its value is not empty
		return valid(Boolean(value));
	},

	/**
	 * Set focus on this control and clean-up <code>validity</code> state, that is, reset to <code>valid</code>.
	 * Beside moving focus on this control remove {@link #CSS_INVALID} CSS class to ensure a clean <code>validity</code>
	 * state.
	 * 
	 * @return js.dom.Control this object.
	 */
	focus : function() {
		this.removeCssClass(this.CSS_INVALID);
		return this._focus();
	},

	/**
	 * Enable this control and reset <code>invalid</code> state. If optional <code>enabled</code> argument is
	 * supplied and is strict boolean false this method behaves like {@link #disable()}. Note that a disabled control
	 * is not tested for validity but its value is included in form data.
	 * 
	 * @param Boolean... enabled optional enabled state, default to true.
	 * @returns js.dom.Control this object.
	 */
	enable : function(enabled) {
		if (typeof enabled === "undefined") {
			enabled = true;
		}
		this.removeCssClass(this.CSS_INVALID);
		if (enabled) {
			this._node.disabled = false;
		}
		else {
			this._node.disabled = true;
		}
		return this;
	},

	/**
	 * Disable this control and reset <code>invalid</code> state. A disabled control is not tested for validity but
	 * its value is included in form data.
	 * 
	 * @returns js.dom.Control this object.
	 */
	disable : function() {
		this.removeCssClass(this.CSS_INVALID);
		this._node.disabled = true;
		return this;
	},

	/**
	 * Test if this control is enabled.
	 * 
	 * @returns Boolean true if this control is enabled.
	 */
	isEnabled : function() {
		return !this._node.disabled;
	},

	/**
	 * Test if this control has multiple values.
	 * 
	 * @return Boolean true if this control has multiple values.
	 */
	isMultiple : function() {
		return this._node.hasAttribute("multiple") || this._node.hasAttribute("data-multiple");
	},

	/**
	 * Iterate this control multiple items. A control may support <code>multiple</code> comma separated values; for
	 * example a list of email addresses separated by comma or multiple files selected from operating system dialog.
	 * This iterator allows for these values traversal, one by one, in sequence.
	 * <p>
	 * Callback is invoked with a single argument, that is an anonymous object with <code>name</code>,
	 * <code>value</code> public properties.
	 * 
	 * <pre>
	 *  void callback(Item);
	 *  Item {
	 *      name,
	 *      value
	 *  };
	 * </pre>
	 * 
	 * <p>
	 * If this control does not have <code>multiple</code> values <code>callback</code> is invoked once with this
	 * control name and value.
	 * 
	 * @param Function callback callback function to be executed for every item,
	 * @param Object... scope optional callback runtime scope, default to global scope.
	 * @assert <code>callback</code> is a {@link Function} and <code>scope</code> is an {@link Object}, if present.
	 */
	forEachItem : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.Control#forEachItem", "Callback argument is not a function.");
		$assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.Control#forEachItem", "Scope argument is not an object.");

		if (!this.isMultiple()) {
			callback.call(scope || window, {
				name : this.getName(),
				value : this.getValue()
			});
			return;
		}

		var items = this._getValue().split(",");
		for (var i = 0; i < items.length; ++i) {
			callback.call(scope || window, {
				name : this.getName() + "." + i,
				value : this._format !== null ? this._format.parse(items[i].trim()) : items[i].trim()
			});
		}
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.Control";
	},

	// -----------------------------------------------------
	// protected low level methods that should be overridden by user defined controls

	/**
	 * Set this control raw value.
	 * 
	 * @param String value raw value.
	 * @return js.dom.Control this object.
	 */
	_setValue : function(value) {
		this._node.value = value;
		return this;
	},

	/**
	 * Return control raw value exactly as it is, that is, not even trim performed.
	 * 
	 * @return String raw value, possible null, undefined, empty or only white spaces.
	 */
	_getValue : function() {
		return this._node.value;
	},

	/**
	 * Return control default value or empty string.
	 * 
	 * @return String default value or empty string.
	 */
	_getDefaultValue : function() {
		return this._node.defaultValue ? this._node.defaultValue : "";
	},

	/**
	 * Clean this control value.
	 * 
	 * @return js.dom.Control this object.
	 */
	_clean : function() {
		this._node.value = "";
		return this;
	},

	/**
	 * Set focus on this control.
	 * 
	 * @return js.dom.Control this object.
	 */
	_focus : function() {
		this._node.focus();
		return this;
	}
};
$extends(js.dom.Control, js.dom.Element);
$implements(js.dom.Control, js.dom.ControlInterface);
