$package("js.lang");

/**
 * Universal iterator. Offers unique interface for single and aggregated values. Iterates over any kind of values:
 * primitive, {@link Object}, {@link Array} or {@link NodeList}.
 * 
 * <pre>
 * 	var value; // undefined, null, primitive, Object, Array or NodeList
 *	var it = new js.lang.Uniterator(value);
 *	while(it.hasNext()) {
 *		// do something with it.next()
 *	}
 * </pre>
 * 
 * In above snippet there are couple conditions to mention:
 * <ul>
 * <li>undefined - single iteration with undefined value
 * <li>null - single iteration with null value
 * <li>primitive - single iteration with primitive value
 * <li>Object - single iteration with Object value
 * <li>Array - Array.length iterations with Array items values
 * <li>NodeList - NodeList.length iterations with NodeList items values
 * </ul>
 * 
 * <p>
 * Undefined values semantic is left to user code. j(s)-lib recommendation is to use undefined as a bug indicator, but
 * built-in array store and retrieve undefined as valid value. Uniterator follows Array behavior and iterates over
 * undefined values; for this reason never rely on {@link #next} to exit from iteration loop but use {@link #hasNext}
 * which is guaranteed to work properly even in the presence of undefined values.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct universal iterator. Value argument is mandatory; it should be present, even if undefined.
 *              Anyway, if argument is missing created iterator is empty.
 * 
 * @param Object value value to iterate over.
 * @assert argument is present, even if undefined.
 */
js.lang.Uniterator = function (value) {
    $assert(this instanceof js.lang.Uniterator, "js.lang.Uniterator#Uniterator", "Invoked as function.");
    $assert(arguments.length === 1, "js.lang.Uniterator#Uniterator", "Missing argument.");
    if (arguments.length !== 1) {
        value = js.lang.Uniterator._EMPTY_ARRAY;
    }
    else if (typeof value === "undefined") {
        value = js.lang.Uniterator._UNDEF_ARRAY;
    }
    else if (value === null) {
        value = js.lang.Uniterator._NULL_ARRAY;
    }
    else if (js.lang.Types.isFunction(value.it)) {
        return value.it();
    }

    if (!js.lang.Types.isNodeList(value)) {
        if (!js.lang.Types.isArray(value)) {
            value = [ value ];
        }
        value.item = function (index) {
            return this[index];
        };
    }

    /**
     * Internal storage.
     * 
     * @type Object
     */
    this._items = value;

    /**
     * Current item index.
     * 
     * @type Number
     */
    this._index = 0;
};

/**
 * Empty array. Array with no items, i.e. zero length.
 * 
 * @type Array
 */
js.lang.Uniterator._EMPTY_ARRAY = [];

/**
 * Undefined array. Array with a single, undefined item.
 * 
 * @type Array
 */
js.lang.Uniterator._UNDEF_ARRAY = [ undefined ];

/**
 * Null array. Array with a single, null item.
 * 
 * @type Array
 */
js.lang.Uniterator._NULL_ARRAY = [ null ];

js.lang.Uniterator.prototype = {
    /**
     * Returns true if the iteration has more elements. Always test for iteration end before invoking {@link #next},
     * which may return undefined, null, zero or even boolean false as valid values.
     * <p>
     * This predicate has no side effects so is legal to call it many times for a given iteration.
     * 
     * @return Boolean true if the iterator has more elements.
     */
    hasNext : function () {
        return this._index < this._items.length;
    },

    /**
     * Returns the next element in the iteration. Always call this method after testing for iteration out of range with
     * {@link #hasNext}. Failing to do so yields not specified results, most probably undefined.
     * 
     * @return Object the next element in the iteration.
     * @assert iteration index is not out of range.
     */
    next : function () {
        $assert(this._index < this._items.length, "js.lang.Uniterator#next", "Iteration out of range.");
        return this._items.item(this._index++);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.lang.Uniterator";
    }
};
$extends(js.lang.Uniterator, Object);
$implements(js.lang.Uniterator, js.lang.Iterator);
