$package("js.dom");

/**
 * Phone number control. This class is assigned by document to inputs with type set to <code>tel</code>.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct generic control instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native node instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.Phone = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
};

js.dom.Phone.prototype = {
    /**
     * Regular expression for phone validation. Below are samples of supported formats.
     * 
     * <pre>
     * (123) 456-7890
     * 123-456-7890
     * 123.456.7890
     * 1234567890
     * +31636363634
     * 075-63546725
     * </pre>
     * 
     * @type RegExp
     */
    PHONE_REX : /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/im,

    /**
     * Implements phone number validation. This validation specialization respects the general contract of control
     * validation, see {@link js.dom.Control#isValid()}.
     * 
     * @returns Boolean true if phone number is valid.
     * @see #PHONE_REX
     */
    isValid : function () {
        var value = this._getValue();
        var valid = false;

        if (this.hasCssClass(this.CSS_OPTIONAL) && !value) {
            // an optional and empty control is always valid
            return valid = true;
        }
        else {
            valid = this.PHONE_REX.test(value);
        }

        this.addCssClass(this.CSS_INVALID, !valid);
        return valid;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Phone";
    }
};
$extends(js.dom.Phone, js.dom.Control);
