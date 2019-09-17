$package("js.util");

/**
 * A class that represents an universally unique identifier. Produced value follows recommendation of RFC4122, version
 * 4. Uses an 3-pty algorithm.
 * 
 * <pre>
 *	Math.uuid.js (v1.4)
 *	http://www.broofa.com
 *	mailto:robert@broofa.com
 *	Copyright (c) 2010 Robert Kieffer
 *	Dual licensed under the MIT and GPL licenses.
 * </pre>
 * 
 * This class follows built-in objects usage pattern: if used with new operator construct an UUID instance and when used
 * as function returns internal value as primitive.
 * 
 * <pre>
 * 	// used with new operator
 *	var uuid = new js.util.UUID(); // create a new UUID object, instance of js.util.UUID
 *	var value = uuid.valueOf(); // UUID value, primitive string value
 *
 *	// used as function
 *	var uuid = js.util.UUID(); // UUID value, primitive string value
 * </pre>
 * 
 * @author Iulian Rotaru
 * 
 * @constructor Construct UUID object. Initialize its internal value to a new random generated UUID. If called as
 *              function initialized internal value is returned as a primitive string, the same value returned by
 *              {@link #valueOf} method.
 */
js.util.UUID = function () {
    var uuid = [], chars = js.util.UUID.CHARS;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // fill in random data
    // at i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
    for ( var i = 0, r; i < 36; i++) {
        if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }

    /**
     * Random UUID value. Note that it is a primitive string value not a {@link String} object.
     * 
     * @type String
     */
    this._value = uuid.join('');

    if (this === js.util) {
        // if used as function this points to package scope
        return this._value;
    }
};

/**
 * Symbols dictionary used for UUID generation.
 * 
 * @type Array
 */
js.util.UUID.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split('');

js.util.UUID.prototype = {
    /**
     * Get the primitive value of this UUID instance.
     * 
     * @return String primitive value of this UUID instance.
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
        return "js.util.UUID";
    }
};
$extends(js.util.UUID, Object);
