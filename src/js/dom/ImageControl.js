$package("js.dom");

/**
 * Image element accessed via form control interface.
 * 
 * @author Iulian Rotaru
 * @constructor Construct an instance of ImageControl class.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.ImageControl = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
};

js.dom.ImageControl.prototype = {
	/**
	 * Set this image control source. This setter delegates {@link js.dom.Image#setSrc(String)} but takes care to add
	 * random value to source URL, to deal with caches. If image source argument is null delegates {@link #reset()}
	 * method.
	 * 
	 * @param String src image source to set, null accepted.
	 * @return js.dom.ImageControl this object.
	 */
	setValue : function(src) {
		if (!src) {
			return this.reset();
		}
		this._error = false;
		var random = Math.random().toString(36).substr(2);
		var i = src.indexOf('?');
		return this.setSrc(src + (i !== -1 ? '&__random__=' : '?') + random);
	},

	/**
	 * Get this control image source as was set by {@link #setValue(String)}. Returns null if there is no source value
	 * set or on loading error. Returned source value has any URL parameters removed.
	 * 
	 * @return String this image control source value or null.
	 */
	getValue : function() {
		if (this._error) {
			return null;
		}

		// use attributes interface to retrieve image source
		// node.src returns normalized URL, with protocol and server, even if set value was absolute path
		// do not confuse absolute path with absolute URL

		var attr = this._node.attributes.getNamedItem("src");
		if (attr == null) {
			return null;
		}

		var src = attr.value;
		if (src == null) {
			return null;
		}

		src = this._normalizeSrc(src);
		var argsIndex = src.indexOf('?');
		return argsIndex > 0 ? src.substr(0, argsIndex) : src;
	},

	/**
	 * Test this image control validity. An image control is valid if has a source value. A disabled control is always
	 * consider valid to not influence form validity test. Also, an optional and empty control is always valid. If this
	 * image control has formatter delegates its <code>test</code> predicate.
	 * 
	 * @return Boolean true if this image control is valid.
	 */
	isValid : function() {
		var valid = function(valid) {
			this.addCssClass(this.CSS_INVALID, !valid);
			return valid;
		}.bind(this);

		// a disabled control is always consider valid to not influence form validity test
		if (this._node.disabled) {
			return valid(true);
		}

		var value = this.getValue();
		if (this.hasCssClass(this.CSS_OPTIONAL) && !value) {
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
	 * Test if this control has multiple values. Returns always false since image control cannot have multiple source
	 * values.
	 * 
	 * @return Boolean always false.
	 */
	isMultiple : function() {
		return false;
	},

	/**
	 * Iterate this control multiple items. Since image control has not multiple source values this method just invoke
	 * callback with this object name and value.
	 */
	forEachItem : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.Control#forEachItem", "Callback argument is not a function.");
		$assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.Control#forEachItem", "Scope argument is not an object.");

		callback.call(scope || window, {
			name : this.getName(),
			value : this.getValue()
		});
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "js.dom.ImageControl";
	}
};
$extends(js.dom.ImageControl, js.dom.Image);
$implements(js.dom.Control, js.dom.ControlInterface);
