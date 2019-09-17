$package("js.lang");

/**
 * Handle properties for objects with not restricted complex graph. This utility class store or retrieve values to/from
 * objects. Using this class is straightforward: just invoke this utility {@link #get(Object, String) getter} or
 * {@link #set(Object, String, Object) setter}, as in sample code. First statement retrieve car second wheel pressure,
 * the second set engine first torque to 456. For details see methods description.
 * 
 * <pre>
 *  var pressure = js.lang.OPP.get(car, "wheels.1.pressure");
 *  js.lang.OPP.set(car, "engine.specs.torque.0", 456);
 * </pre>
 * 
 * At its core this class uses object property path abstraction, for short OPP. Basically, an object is considered as a
 * graph of value properties and OPP is the path to specific property; a value property is a primitive, that is, is not
 * an {@link Object} or an {@link Array}. An example may help:
 * 
 * <pre>
 *  var car = {
 *      model: 'Corsa 1.2',
 *      engine: {
 *          model: 'ECO',
 *          specs : {
 *              capacity : 1200,
 *              torque : [ 495, 656 ]
 *          }
 *      }
 *      wheels:[ {
 *              pressure: 1.2,
 *              radial: 14
 *          },  {
 *              pressure: 1.4,
 *              radial: 16
 *          }
 *      ]
 *  };
 * </pre>
 * 
 * Being above <code>car</code> object, the table below lists object property paths and related values. OPP is
 * hierarchical, following object structure. It is composed from all encountered property names separated by dot; for
 * arrays property name is the index. <table>
 * <tr>
 * <td><b>model
 * <td>Corsa 1.2
 * <tr>
 * <td><b>engine.model
 * <td>ECO
 * <tr>
 * <td><b>engine.specs.capacity
 * <td>1200
 * <tr>
 * <td><b>engine.specs.torque.0
 * <td>495
 * <tr>
 * <td><b>engine.specs.torque.1
 * <td>656
 * <tr>
 * <td><b>wheels.0.pressure
 * <td>1.2
 * <tr>
 * <td><b>wheels.0.radial
 * <td>14
 * <tr>
 * <td><b>wheels.1.pressure
 * <td>1.4
 * <tr>
 * <td><b>wheels.1.radial
 * <td>1.6 </table>
 */
js.lang.OPP = {
    /**
     * Get object property value. Return the value of object property identified by given object property path. Return
     * undefined if property not found; note that null is a valid value. Usually returned value is a terminal one, that
     * is, object tree leaf; anyway, if OPP is not full a sub-object can be returned.
     * 
     * @param Object obj object of which property value is to retrieve,
     * @param String opp object property path.
     * @return Object object property value or undefined.
     */
    get : function (obj, opp) {
        return this._get(obj, opp.split("."), 0);
    },

    /**
     * Helper for value getter. This method is the workhorse for {@link #get(Object, String)}. It uses OPP represented
     * as an array and traverse it recursively till completion. If, at some point, a path components is not found breaks
     * iteration prematurely returning undefined.
     * 
     * @param Object obj object of which property value to retrieve,
     * @param Array opp object property path as an array,
     * @param Number i path component index.
     * @return Object object property value or undefined.
     * @assert object is valid and property path is an {@link Array}.
     */
    _get : function (obj, opp, i) {
        $assert(i === opp.length || js.lang.Types.isObject(obj), "js.lang.OPP#_get", "Invalid property. Expected Object but got primitive.");
        $assert(js.lang.Types.isArray(opp), "js.lang.OPP#_get", "OPP argument is not an array.");
        if (typeof obj !== "undefined" && obj !== null && i < opp.length) {
            obj = this._get(obj[opp[i++]], opp, i);
        }
        return obj;
    },

    /**
     * Set object property value. Set object property, creating it if missing. Anyway, this method creates only terminal
     * object, that is, property designated by given full OPP. All other objects from path should exist, even empty.
     * This method just convert OPP into array and delegates {@link #_set} method for real work.
     * 
     * @param Object obj object to set property value to,
     * @param String opp object property path,
     * @param Object value value to set.
     * @assert see {@link #_set} assertions.
     */
    set : function (obj, opp, value) {
        this._set(obj, opp.split("."), 0, value);
    },

    /**
     * Helper for value setter. This method is delegated by {@link #set} method. It uses OPP represented as an array and
     * traverse it recursively till completion. Once the end of property path is reached just set the given value,
     * creating the property is missing.
     * <p>
     * Anyway, if a path component denotes an undefined or null property breaks iteration prematurely and rise
     * assertion. If assertion is disabled this method silently does nothing. In both cases target object is not
     * altered.
     * 
     * @param Object obj object to set value to,
     * @param Array opp object property path as an array,
     * @param Number i path component index,
     * @param Object value value to set.
     * @assert object is valid, property path argument is an {@link Array} and value is defined.
     */
    _set : function (obj, opp, i, value) {
        $assert(typeof obj === "object", "js.lang.OPP#_set", "Target object is undefined or not of Object type.");
        $assert(js.lang.Types.isArray(opp), "js.lang.OPP#_set", "OPP is not an array.");
        $assert(typeof value !== "undefined", "js.lang.OPP#_set", "Value is undefined for property path |%s|. Object dump: %s", opp.toString(), JSON.stringify(obj));

        // iterate till OPP right most element
        if (i === opp.length - 1) {
            obj[opp[i]] = value;
            return;
        }

        obj = obj[opp[i]];
        $assert(obj !== null && typeof obj === "object", "js.lang.OPP#_set", "Path component |%d| from |%s| points to undefined, null or not Object type.", i, opp.join('.'));
        if (obj === null || typeof obj !== "object") {
            return;
        }
        ++i;
        obj = this._set(obj, opp, i, value);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.lang.OPP";
    }
};
