$package("js.dom");

/**
 * Generic user input control. This interface is implemented by all standard and user defined controls.
 * 
 * @author Iulian Rotaru
 * @since 1.3
 */
js.dom.ControlInterface = {
	/**
	 * Get this control name, both standard and user defined are supported. This getter supports both standard controls
	 * using <code>name</code> attribute or user defined controls that use <code>data-name</code>, in this order.
	 * <p>
	 * It is not legal to have both <code>name</code> and <code>data-name</code> attributes or neither; assertion is
	 * thrown. If assertions are disabled returns null if none or value of <code>name</code> attribute if both are
	 * present.
	 * 
	 * @return String this control name.
	 * @assert this control has no both <code>name</code> and <code>data-name</code> attributes.
	 */
	getName : function() {
	},

	/**
	 * Set this control value. If this control has a format class uses it to convert given value into a string suitable
	 * for user interface. If has multiple values - as returned by {@link isMultiple()}, <code>value</code> argument
	 * should be an array; concatenates all array items using comma as separator applying formatter, if present, for
	 * every item. If given value is null this method clear control value. Also takes care to remove
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
	 * @return js.dom.ControlInterface this object.
	 */
	setValue : function(value) {
	},

	/**
	 * Get this control value. Returns this control formatted value or null if no user input at all. If this control has
	 * a format class uses it to parse the control value returning the resulted object. If no, control returns value as
	 * string or null if empty.
	 * <p>
	 * If control has multiple values, split node raw value using comma as separator and returns values as {@link Array}.
	 * If this control has a format class apply parse method to every item from array. If value is empty returns empty
	 * array.
	 * 
	 * @return Object this element value, null or empty array.
	 */
	getValue : function() {
	},

	/**
	 * Reset this control value to initial state. Try to reload control value from default value attribute. If no
	 * default value attribute found set this control value to empty. Also ensure <em>invalid</em> state is
	 * cleaned-up.
	 * 
	 * @return js.dom.ControlInterface this object.
	 */
	reset : function() {
	},

	/**
	 * Check this control is valid and update <em>validity</em> state accordingly. A control is valid if it has a non
	 * empty raw value; if this control has formatter, validity check is delegated to {@link js.format.Format#test}
	 * method. Anyway, control is always considered valid if is optional and its raw value is empty.
	 * <p>
	 * This predicate has side effects: it updates control <em>validity</em> state before returning.
	 * 
	 * @return Boolean true if this control is valid.
	 */
	isValid : function() {
	},

	/**
	 * Set focus on this control and clean-up <em>validity</em> state, that is, reset to <code>valid</code>.
	 * 
	 * @return js.dom.ControlInterface this object.
	 */
	focus : function() {
	},

	/**
	 * Test if this control has multiple values.
	 * 
	 * @return Boolean true if this control has multiple values.
	 */
	isMultiple : function() {
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
	 */
	forEachItem : function(callback, scope) {
	}
};
