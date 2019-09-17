$package("js.dom");

/**
 * General push button.
 * 
 * @author Iulian Rotaru
 * @since 1.3
 * @constructor Construct button instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert <code>ownerDoc</code> argument is not undefined or null and is instance of {@link js.dom.Document} and
 *         <code>node</code> is a button.
 */
js.dom.Button = function (ownerDoc, node) {
    $assert(this instanceof js.dom.Button, "js.dom.Button#Button", "Invoked as function.");
    this.$super(ownerDoc, node);
    $assert(node.nodeName.toLowerCase() === "button", "js.dom.Button#Button", "Node is not an input.");
};

js.dom.Button.prototype = {
    /**
     * Set button name. Override {@link js.dom.Control#setValue}.
     * 
     * @param String name button name.
     * @return js.dom.Button this pointer.
     */
    setValue : function (name) {
        return this.setText(name);
    },

    /**
     * Get button name. Override {@link js.dom.Control#getValue}.
     * 
     * @returns button name.
     */
    getValue : function () {
        return this.getText();
    },

    /**
     * Override button validation. Simply returns true since a button is always valid.
     * 
     * @return Boolean always returns true.
     */
    isValid : function () {
        return true;
    },

    /**
     * Override control empty test. A button is never empty and this method always returns false.
     * 
     * @return Boolean always returns false.
     */
    isEmpty : function () {
        return false;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Button";
    }
};
$extends(js.dom.Button, js.dom.Control);
