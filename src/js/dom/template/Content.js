$package("js.dom.template");

/**
 * Model object adapter. Templates engine operates upon application model used as source for dynamic content. But model
 * object is, and must be, business oriented and is quite possible to have views with needs not covered directly by
 * model. This class is used exactly for that: it is an adapter for model used to synthesize properties not directly
 * supplied by it. So, strictly speaking, templates engine does not directly acts upon model object but on this content
 * adapter.
 * <p>
 * This class supplies getters for content values but all use {@link #getValue(Object, String)} which on its turn
 * retrieves properties from model. Now is the interesting part: if model property is missing this class searches for a
 * getter with a name synthesized from requested property name. And since this class does not offer per se any special
 * getter it relies on subclasses.
 * 
 * <pre>
 *  class Person {
 *      id;
 *  }
 * 
 *  class PersonContent extends Content {
 *      getLink() {
 *          return &quot;person-view.xsp?id&quot; + person.id;
 *      }
 *  }
 * 
 *  &lt;a data-href="link" /&gt;
 * </pre>
 * 
 * In above pseudo-code we have a link with <em>href</em> operator having <em>link</em> as operand, in this case a
 * property path. Operator requests from content instance a value with name <em>link</em>. Content adapter searches
 * person instance, the model in this case, and since link property is undefined tries a getter named <em>getLink</em>,
 * defined by subclass, this time with success.
 * <p>
 * Content adapter does use <em>property path</em> abstraction to denote a specific content value. This name hides two
 * concepts: property and path.
 * <ul>
 * <li>Property is used to designates a value inside an object. Is is more generic than object field since it covers
 * content synthetic getters too, as shown above. Also a property name can be a numeric index, if object instance is an
 * array. This way both object and array instances are accessible with the same property abstraction:
 * 
 * <pre>
 * content.getValue(object, &quot;id&quot;); // here object is an Object instance with a field named &quot;id&quot;
 * content.getValue(object, &quot;2&quot;); // object is an array or list and &quot;2&quot; is the index
 * </pre>
 * 
 * <li>In this class acception an object is a tree of values and property path is simply a list of path components
 * separated by dots. For example, in below snippet the property path <em>car.wheels.1.manufacturer</em> designates
 * the manufacturer of the second wheel from car while <em>car.model</em> designates, you guess, car model.
 * 
 * <pre>
 *  class Car {
 *      model;
 *      wheels[4];
 *  }
 *  class Wheel {
 *      manufacturer;
 *  }
 * </pre>
 * 
 * Property path can be absolute, when begin with dot, or relative. An absolute path refers to content adapter root,
 * that is, the wrapped model. A relative one uses a scope object; this scope object is always present where property
 * path is present too and there are operators that change this scope object.
 * </ul>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct template content.
 * @param Object model model object to inject.
 * @assert model argument is not undefined, null or empty.
 */
js.dom.template.Content = function(model) {
	$assert(model, "js.dom.template.Content#Content", "Model is undefined or null.");
	/**
	 * Model object.
	 * 
	 * @type Object
	 */
	this._model = model ? model : {};
};

$static(function() {
	/**
	 * Empty iterator returned when requested content value is null.
	 * 
	 * @type js.lang.Uniterator
	 */
	js.dom.template.Content._EMPTY_ITERATOR = new js.lang.Uniterator([]);

	/**
	 * Empty map returned whenever a valid map is not found.
	 * 
	 * @type Object
	 */
	js.dom.template.Content._EMPTY_MAP = {};
});

js.dom.template.Content.prototype = {
	/**
	 * Get content model.
	 * 
	 * @return Object model.
	 */
	getModel : function() {
		return this._model;
	},

	/**
	 * Get content value as iterable. Returns the value retrieved by {@link #getValue(Object,String)} as uniterator. If
	 * found value is null log a warning and returns empty iterator. Content value should be an {@link Array} otherwise
	 * this method rise content exception.
	 * 
	 * @param Object scope scope object, used if property path is relative,
	 * @param String propertyPath property path.
	 * @return js.lang.Uniterator iterator instance.
	 * @throws js.dom.template.ContentException if found content value is undefined or is not an array.
	 */
	getIterable : function(scope, propertyPath) {
		var value = this.getValue(scope, propertyPath);
		if (value === null) {
			$warn("js.dom.template.Content#getIterable", "Null content value for property |%s|. Returns empty iterator.", propertyPath);
			return js.dom.template.Content._EMPTY_ITERATOR;
		}
		if (!js.lang.Types.isArray(value)) {
			throw new js.dom.template.ContentException(propertyPath, "Invalid content type. Expected array but got |%s|.", value);
		}
		return new js.lang.Uniterator(value);
	},

	/**
	 * Get content value as map. Delegates {@link #getValue(Object,String)} to actually retrieve content value that
	 * should be an object, used by templates engine as hash. If value is not a pure object, usable as map, as defined
	 * by {@link js.lang.Types#isStrictObject(Object)} this method throws content exception. If found value is null log a
	 * warning and returns empty map.
	 * 
	 * @param Object scope scope object, used if property path is relative,
	 * @param String propertyPath property path.
	 * @return Object content value object, possible empty.
	 * @throws js.dom.template.ContentException if found content value undefined or is not usable as map.
	 */
	getMap : function(scope, propertyPath) {
		var value = this.getValue(scope, propertyPath);
		if (value === null) {
			$warn("js.dom.template.Content#getMap", "Null content value for property |%s|. Returns empty map.", propertyPath);
			return js.dom.template.Content._EMPTY_MAP;
		}
		if (!js.lang.Types.isStrictObject(value)) {
			throw new js.dom.template.ContentException(propertyPath, "Invalid content type. Expected map but got |%s|.", value);
		}
		return value;
	},

	/**
	 * Test if content value is empty. Delegates {@link #getValue(Object,String)} and returns true if found value
	 * fulfill one of the next conditions:
	 * <ul>
	 * <li>null
	 * <li>boolean false
	 * <li>number equals with 0
	 * <li>empty string
	 * <li>array of length 0
	 * </ul>
	 * Note that undefined value is suspected as bug and throws error; it is not considered empty value.
	 * 
	 * @param Object scope scope object, used if property path is relative,
	 * @param String propertyPath property path.
	 * @return true if value is empty.
	 * @throws js.dom.template.ContentException if found content value is undefined.
	 */
	isEmpty : function(scope, propertyPath) {
		var value = this.getValue(scope, propertyPath);
		if (value === null) {
			return true;
		}
		if (typeof value.length !== "undefined") {
			return value.length === 0;
		}
		if (js.lang.Types.isFunction(value.size)) {
			return value.size() === 0;
		}
		if (js.lang.Types.isFunction(value.isEmpty)) {
			return value.isEmpty();
		}
		return !value;
	},

	/**
	 * Get content value. This method supports both overloads: relative or absolute object property path. If property
	 * path is relative searching context should be present.
	 * 
	 * @param Object context optional search context, defaults to entire model,
	 * @param String propertyPath object property path, relative or absolute.
	 * @return Object requested value or null.
	 */
	getValue : function(context, propertyPath) {
		$assert(arguments.length === 1 || arguments.length === 2, "js.dom.template.Content#getValue", "Invalid arguments count.");

		if (propertyPath === ".") {
			return context;
		}
		if (propertyPath.charAt(0) === ".") {
			return this._getAbsoluteValue(propertyPath);
		}
		return this._getRelativeValue(context, propertyPath);
	},

	/**
	 * Get absolute value.
	 * 
	 * @param String propertyPath object property path.
	 * @assert argument is not undefined or null and is a {@link String}.
	 */
	_getAbsoluteValue : function(propertyPath) {
		$assert(propertyPath && js.lang.Types.isString(propertyPath), "js.dom.template.Content#_getAbsoluteValue", "Property path is undefined, null, empty or not string.");
		$assert(propertyPath.charAt(0) === ".", "js.dom.template.Content#_getAbsoluteValue", "Property path is not absolute.");
		return this._getRelativeValue(this._model, propertyPath.substr(1));
	},

	/**
	 * Retrieve value relative to given context.
	 * 
	 * @param Object context object on which value should be searched,
	 * @param String propertyPath object property path.
	 * @assert both arguments are not undefined or null and are of proper type.
	 * @throws js.dom.template.ContentException if requested value is undefined.
	 */
	_getRelativeValue : function(context, propertyPath) {
		$assert(context && js.lang.Types.isObject(context), "js.dom.template.Content#_getRelativeValue", "Context is undefined, null or not object.");
		$assert(propertyPath && js.lang.Types.isString(propertyPath), "js.dom.template.Content#_getRelativeValue", "Property path is undefined, null, empty or not string.");

		var o = context;
		var pathElements = propertyPath.split(".");
		for ( var i = 0;;) {
			o = this._getObjectProperty(o, pathElements[i]);
			if (++i === pathElements.length) {
				return o;
			}
			if (o === null) {
				return null;
			}
			if (!js.lang.Types.isObject(o)) {
				throw new js.dom.template.ContentException(propertyPath, "Undefined content value.");
			}
		}
		return o;
	},

	/**
	 * Get object property. Get identified property from object. If undefined try getter from this content adapter
	 * instance; getter name is concatenated from <em>get</em> and property name as title case.
	 * 
	 * @param Object object object to retrieve property from,
	 * @param String property property name.
	 * @throws js.dom.template.ContentException if requested property is undefined.
	 */
	_getObjectProperty : function(object, property) {
		$assert(js.lang.Types.isObject(object), "js.dom.template.Content#_getObjectProperty", "Object is not of proper type.");
		$assert(js.lang.Types.isString(property), "js.dom.template.Content#_getObjectProperty", "Property name is not a string.");
		
		// takes care to normalize property name since it can be CSS like hyphen case
		property = js.util.Strings.toScriptCase(property);
		var value = object[property];
		if (typeof value !== "undefined") {
			return value;
		}
		var getterName = "get" + property.charAt(0).toUpperCase() + property.substr(1);
		var getter = this[getterName];
		if (js.lang.Types.isFunction(getter)) {
			return getter.call(this, object);
		}
		throw new js.dom.template.ContentException(property, "Undefined content value.");
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.Content";
	}
};
$extends(js.dom.template.Content, Object);
