$package("js.util");

/**
 * Application scope unique identifier. Returns an identifier guaranteed to be unique across application instance. This
 * class follows built-in objects usage pattern: if used with new operator construct an ID instance and when used as
 * function returns internal value as primitive.
 * 
 * <pre>
 * 	// used with new operator
 *	var id = new js.util.ID(); // create a new ID object, instance of js.util.ID
 *	var value = id.valueOf(); // ID value, primitive string value
 *
 *	// used as function
 *	var id = js.util.ID(); // ID value, primitive string value
 * </pre>
 * 
 * @constructor Construct ID instance. Initialize internal value to a new generated identifier value. If called as
 *              function initialized internal value is returned as a primitive string, the same value returned by
 *              {@link #valueOf()} method.
 */
js.util.ID = function () {
    ++js.util.ID._seed;

    /**
     * ID value. Note that it is a primitive string value not a {@link String} object.
     * 
     * @type String
     */
    this._value = js.util.ID._seed.toString(36);

    if (this === js.util) {
        // if used as function this points to package scope
        return this._value;
    }
};

/**
 * ID seed. ID values are generated in sequence using this seed as index.
 * 
 * @type Number
 */
js.util.ID._seed = 0;

js.util.ID.prototype = {
    /**
     * Get the primitive value of this ID instance.
     * 
     * @return String primitive value of this ID instance.
     */
    valueOf : function () {
        return this._value;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.util.ID";
    }
};
$extends(js.util.ID, Object);
