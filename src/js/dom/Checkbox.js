$package('js.dom');

/**
 * Checkbox input. Form control that allows for one or many options to be selected.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct checkbox instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document} and
 * <em>node</em> is an input of type checkbox.
 */
js.dom.Checkbox = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Checkbox, 'js.dom.Checkbox#Checkbox', 'Invoked as function.');
	this.$super(ownerDoc, node);
};

js.dom.Checkbox.prototype = {
	/**
	 * Set checked state. Override {@link js.dom.Control#setValue}.
	 * 
	 * @param Boolean checked newly value to set.
	 * @return js.dom.Checkbox this pointer.
	 */
	setValue : function(checked) {
		this._node.checked = checked;
		return this;
	},

	/**
	 * Get checked state. Override {@link js.dom.Control#getValue}.
	 * 
	 * @return Boolean checked state.
	 */
	getValue : function() {
		return this._node.checked;
	},

	/**
	 * Set checked state to this checkbox. Checked state argument is optional and default to true.
	 * 
	 * @param Boolean... checked optional enabled state, default to true.
	 * @return js.dom.Checkbox this object.
	 */
	check : function(checked) {
		if (typeof checked === "undefined") {
			checked = true;
		}
		this._node.checked = checked;
		return this;
	},

	/**
	 * Uncheck this checkbox. After this method execution {@link #checked} returns false.
	 * 
	 * @return js.dom.Checkbox this object.
	 */
	uncheck : function() {
		this._node.checked = false;
		return this;
	},

	/**
	 * Test if this checkbox is selected. Returns true if this checkbox is selected or false otherwise.
	 * 
	 * @return Boolean this checkbox state.
	 */
	checked : function() {
		return this._node.checked;
	},

	/**
	 * Override control validation. Simply returns true since a checkbox is always valid.
	 * 
	 * @return Boolean always returns true.
	 */
	isValid : function() {
		return true;
	},

	/**
	 * Override control empty test. A checkbox is always considered empty so that form validation logic force it to
	 * valid if checkbox flagged as optional.
	 * 
	 * @return Boolean always returns true.
	 */
	isEmpty : function() {
		return true;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.Checkbox';
	}
};
$extends(js.dom.Checkbox, js.dom.Control);
