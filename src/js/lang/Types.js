$package("js.lang");

/**
 * Dynamic typing support, aka duck typing. This utility class helps identifying variables types on run-time. It is a
 * collection of predicates testing for JavaScript basic types like array or string. It also offers support for
 * validating an object against an interface.
 */
js.lang.Types = {
    /**
     * Test if array type. Given value argument is qualify as an array if it is an object and instance of {@link Array}
     * class. Also, function <code>arguments</code> is considered array.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is an array.
     */
    isArray : function (value) {
        return (typeof value === "object" && value instanceof Array) ||
        // function arguments is actually an array like object, it does not
        // implement any Array methods like splice, but having instead callee
        // anyway, we want to treat it as an array not an object
        (typeof value !== "undefined" && value !== null && typeof value.callee === "function");
    },

    /**
     * Test if object. Pass the test if given argument is an object, an array or a function. Note that instances of
     * {@link Array}, {@link Function}, {@link Boolean}, {@link Number} and {@link String} classes qualify both as
     * objects and their respective types. Actually in JavaScript almost all values are objects, except boolean, number
     * and string primitives. Note that null is not considered an object.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is an object.
     */
    isObject : function (value) {
        return value !== null && (typeof value === "object" || typeof value === "function");
    },

    /**
     * Test if function.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is a function.
     */
    isFunction : function (value) {
        return typeof value === "function";
    },

    /**
     * Test if string. Returns true if given argument is a primitive string or an object instance of {@link String}
     * class. Note that this method deviates from language specification; instances of String class are considered both
     * strings and objects.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is a string.
     */
    isString : function (value) {
        return typeof value === "string" || value instanceof String;
    },

    /**
     * Test if number. Test pass if value to be tested is a primitive number or an object of {@link Number} class. Also
     * <code>NaN</code> and <code>Infinity</code> are considered numbers. Note that this method deviates from
     * language specification; instances of Number class are considered both numbers and objects.
     * 
     * @param Object value, value to test.
     * @return Boolean true only if argument is a number.
     */
    isNumber : function (value) {
        return typeof value === "number" || value instanceof Number;
    },

    /**
     * Test if boolean. This test is successfully if given value is a primitive boolean or an object of {@link Boolean}
     * class. Note that this utility class deviates from language specification; instances of Boolean class are
     * considered both boolean and objects. For the purpose of this predicate undefined and null values are not
     * considered boolean false.
     * 
     * @param Object value value to test.
     * @return Boolean true if <code>value</code> argument is a boolean.
     */
    isBoolean : function (value) {
        return typeof value === "boolean" || value instanceof Boolean;
    },

    /**
     * Test if primitive. A primitive value is either a string, number or boolean. Note that this method consider
     * {@link String}, {@link Number}, {@link Boolean} and {@link Date} instances as primitive and that undefined and
     * null does not qualify.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is a primitive value.
     */
    isPrimitive : function (value) {
        return this.isString(value) || this.isNumber(value) || this.isBoolean(value) || this.isDate(value);
    },

    /**
     * Test if {@link Date} instance. If value is anything else than a date instance, including null or undefined,
     * returns false.
     * 
     * @param Object value value to test.
     * @return Boolean true if <code>value</code> argument is a Date instance.
     */
    isDate : function (value) {
        return value instanceof Date;
    },

    /**
     * Test if value is element or inherits from {@link js.dom.Element}. This predicate can be used for both
     * constructors and instances.
     * <p>
     * If value is a constructor test if equals element constructor or continue recursively on super hierarchy.
     * <p>
     * If value is an instance get its constructor and continue with constructor test as above.
     * 
     * @param Object value to check, both constructor and instance accepted.
     * @return Boolean true if requested <code>value</code> is or inherits js.dom.Element.
     */
    isElement : function (value) {
        if (!value) {
            return false;
        }

        // if value is an instance get instance constructor and continue testing for constructor
        // uses library __ctor__ extension instead of standard <constructor> property because of next excerpt from MDN:
        // ... This example shows that it is not always safe to rely on the constructor property of an object.

        if (typeof value !== "function") {
            value = value.__ctor__;
            if (typeof value === "undefined") {
                return false;
            }
        }

        // here value is always constructor
        // next recursive call for testing super constructor stops when __super__ is not defined
        
        if (value === js.dom.Element) {
            return true;
        }
        if (this.isElement(value.__super__)) {
            return true;
        }
        return false;
    },

    /**
     * Test if {@link NodeList} instance. A value qualifies as native DOM node list if possess a numeric property
     * <code>length</code> and a method <code>item</code>.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument is a NodeList instance.
     */
    isNodeList : function (value) {
        // last condition is for <select> node which has both length and item method
        return value && typeof value.length === "number" && typeof value.item === "function" && typeof value.nodeName === "undefined";
    },

    /**
     * Test if value is strict object. A value qualifies as strict object if is not Array, Function, Boolean, Number or
     * String and of course not a primitive.
     * 
     * @param Object value, value to test.
     * @return Boolean true if <code>value</code> argument can be used as map.
     */
    isStrictObject : function (value) {
        if (this.isArray(value)) {
            return false;
        }
        if (this.isFunction(value)) {
            return false;
        }
        if (this.isBoolean(value)) {
            return false;
        }
        if (this.isNumber(value)) {
            return false;
        }
        if (this.isString(value)) {
            return false;
        }
        return this.isObject(value);
    },

    /**
     * Type name pattern constant.
     * 
     * @type RegExp
     */
    _TYPE_NAME_PATTERN : /\[object\s+(\w+)\]/,

    /**
     * Get string representation of the type of given value.
     * 
     * @param Object value value to return type name for.
     * @return String value type name or <code>Unknown</code>.
     */
    getTypeName : function (value) {
        if (value === null) {
            return "Null";
        }
        if (typeof value === "undefined") {
            return "Undefined";
        }
        var typeName = Object.prototype.toString.call(value);
        var type = this._TYPE_NAME_PATTERN.exec(typeName);
        if (type !== null) {
            return type[1];
        }
        $debug("js.lang.Types#getTypeName", "Invalid type name |%s|. Return 'Unknown'.", typeName);
        return "Unknown";
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.lang.Types";
    }
};

/**
 * It seems IE NodeList item property is an object instead of a function. Also, this predicate should return true for
 * array augmented with item method. Finally, when nodelist is returned by query selector - that is not a living
 * nodelist, item is a string and, for mess to be completed, Node objects possess length and item properties - use
 * nodeName to exclude them.
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.lang.Types.isNodeList = function (value) {
        return value && typeof value.length === "number" && typeof value.item !== "undefined" && typeof value.nodeName === "undefined";
    };
});
