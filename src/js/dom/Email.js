$package("js.dom");

/**
 * Control specialized for email address input. This class is assigned by document to inputs with type set to
 * <code>email</code>.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct generic control instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native node instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.Email = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
};

js.dom.Email.prototype = {
    /**
     * Email address pattern.
     * 
     * @type RegExp
     */
    EMAIL_REX : /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,

    /**
     * Implements email address validation. This validation specialization respects the general contract of control
     * validation, see {@link js.dom.Control#isValid()}.
     * 
     * @returns Boolean true if email address is valid.
     * @see #EMAIL_REX
     */
    isValid : function () {
        var value = this._getValue();
        var valid = false;

        if (this.hasCssClass(this.CSS_OPTIONAL) && !value) {
            // an optional and empty control is always valid
            return valid = true;
        }
        else {
            valid = this.EMAIL_REX.test(value);
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
        return "js.dom.Email";
    }
};
$extends(js.dom.Email, js.dom.Control);
