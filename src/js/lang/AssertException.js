$package('js.lang');

/**
 * Assertion exception. Thrown on a failing assertion.
 *
 * @constructor
 * Construct assertion exception.
 *
 * @param String message
 */
js.lang.AssertException = function() {
    $assert(this instanceof js.lang.AssertException, 'js.lang.AssertException#AssertException', 'Invoked as function.');
    this.$super(arguments);

    /**
     * Exception name.
     * @type String
     */
    this.name = 'j(s)-lib assertion';
};

js.lang.AssertException.prototype =
{
    /**
     * Returns a string representation of the object.
     *
     * @return String object string representation.
     */
    toString: function() {
        return 'js.lang.AssertException';
    }
};
$extends(js.lang.AssertException, js.lang.Exception);
