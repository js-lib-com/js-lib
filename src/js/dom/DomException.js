$package('js.dom');

/**
 * DOM exception. Thrown whenever somethig goes wrong on js.dom package logic.
 */
js.dom.DomException = function() {
    $assert(this instanceof js.dom.DomException, 'js.dom.DomException#DomException', 'Invoked as function.');
    this.$super(arguments);

    /**
     * Exception name.
     * @type String
     */
    this.name = 'j(s)-lib DOM exception';
};

js.dom.DomException.prototype =
{
    /**
     * Returns a string representation of the object.
     *
     * @return String object string representation.
     */
    toString: function() {
        return 'js.dom.DomException';
    }
};
$extends(js.dom.DomException, js.lang.Exception);
