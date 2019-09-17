$package("js.dom.template");

/**
 * Operators code enumeration. Operators are defined into template elements using standard attribute syntax. This
 * enumeration provides {@link #fromAttrName(String)} factory method just for that: extract opcode from attribute name.
 * Also every operator's code belongs to a {@link Type}; it can be retrieved using {@link Opcode#type()} getter.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.dom.template.Opcode = {
    /**
     * Neutral value.
     */
    NONE : 1,

    /**
     * Set one or more element's attributes values.
     */
    ATTR : 2,

    /**
     * Add or remove CSS class based on property value.
     */
    CSS_CLASS : 3,

    /**
     * Set element <em>id</em> attribute value.
     */
    ID : 4,

    /**
     * Set element <em>src</em> attribute value.
     */
    SRC : 5,

    /**
     * Set element <em>href</em> attribute value.
     */
    HREF : 6,

    /**
     * Set element <em>title</em> attribute value.
     */
    TITLE : 7,

    /**
     * Set element <em>value</em> attribute value.
     */
    VALUE : 8,

    /**
     * Set element text content.
     */
    TEXT : 9,

    /**
     * Set element inner HTML.
     */
    HTML : 10,

    /**
     * Set element descendants to content object properties.
     */
    OBJECT : 11,

    /**
     * Populate element using first child as item template.
     */
    LIST : 12,

    /**
     * Ordered variant of {@link #LIST}.
     */
    OLIST : 13,

    /**
     * Populate element using first two children as key/value templates.
     */
    MAP : 14,

    /**
     * Ordered variant of {@link #MAP}.
     */
    OMAP : 15,

    /**
     * Set element text content accordingly numbering format and item index.
     */
    NUMBERING : 16,

    /**
     * Include branch if content value is not empty.
     */
    IF : 17,

    /**
     * Exclude branch from resulting document based on boolean literal.
     */
    EXCLUDE : 18,

    /**
     * Unconditional jump to element with ID specified by this operator literal value.
     */
    GOTO : 19,

    /**
     * Prefix used to differentiate operators syntax from native.
     * 
     * @type String
     */
    _OPCODE_PREFIX : "data-",

    /**
     * Parse attribute name and return the operator's code. If attribute is not a valid operator returns {@link #NONE}.
     * 
     * @param String attrName attribute name.
     * @return js.dom.template.Opcode opcode extracted from attribute name or NONE.
     */
    fromAttrName : function (attrName) {
        if (attrName.indexOf(this._OPCODE_PREFIX) !== 0) {
            return this.NONE;
        }
        var opcode = attrName.substring(this._OPCODE_PREFIX.length).toUpperCase().replace(/-/g, '_');
        if (!(opcode in this)) {
            return this.NONE;
        }
        return this[opcode];
    },

    /**
     * Test if element has named operator.
     * 
     * @param js.dom.Element element element to test for operator presence,
     * @param String operatorName operator name to search for.
     * @return Boolean true if given element has requested operator.
     */
    hasOperator : function (element, operatorName) {
        return element.hasAttr(this._OPCODE_PREFIX + operatorName.toLowerCase());
    },

    type : function (opcode) {
        var t = this._types[opcode];
        return (typeof t === "undefined") ? js.dom.template.Opcode.Type.NONE : t;
    }
};

/**
 * An operator belongs to a given category, defined by this type. Templates engine algorithm does not use opcodes
 * directly. In order to keep it generic the algorithm uses groups of opcodes defined by this enumeration. This way,
 * adding new operators does not inflect on engine algorithm.
 * 
 * @author Iulian Rotaru
 */
js.dom.template.Opcode.Type = {
    /** Neutral value. */
    NONE : 1,

    /**
     * Jump operations.
     * <ul>
     * <li>{@link Opcode.GOTO}
     * </ul>
     */
    JUMP : 2,

    /**
     * Conditional operations.
     * <ul>
     * <li>{@link Opcode.IF},
     * <li>{@link Opcode.EXCLUDE}
     * </ul>
     */
    CONDITIONAL : 3,

    /**
     * Operations that change the element inner content or its descendants content.
     * <ul>
     * <li>{@link Opcode.TEXT},
     * <li>{@link Opcode.HTML},
     * <li>{@link Opcode.OBJECT},
     * <li>{@link Opcode.LIST},
     * <li>{@link Opcode.OLIST},
     * <li>{@link Opcode.MAP},
     * <li>{@link Opcode.OMAP},
     * <li>{@link Opcode.NUMBERING}
     * </ul>
     */
    CONTENT : 4,

    /**
     * Operations on element attributes.
     * <ul>
     * <li>{@link Opcode.ATTR},
     * <li>{@link Opcode.CSS_CLASS},
     * <li>{@link Opcode.ID},
     * <li>{@link Opcode.SRC},
     * <li>{@link Opcode.HREF},
     * <li>{@link Opcode.TITLE},
     * <li>{@link Opcode.VALUE}
     * </ul>
     */
    ATTRIBUTE : 5,

    name : function (type) {
        if (!this._names) {
            this._names = [ "NONE", "JUMP", "CONDITIONAL", "CONTENT", "ATTRIBUTE" ];
        }
        return this._names[type - 1] || this._names[0];
    }
};

$static(function () {
    // WARNING: take care to update opcode types hash table when add new operators
    var Opcode = js.dom.template.Opcode;

    Opcode._types = {};
    Opcode._types[Opcode.NONE] = Opcode.Type.NONE;
    Opcode._types[Opcode.ATTR] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.CSS_CLASS] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.ID] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.SRC] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.HREF] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.TITLE] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.VALUE] = Opcode.Type.ATTRIBUTE;
    Opcode._types[Opcode.TEXT] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.HTML] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.OBJECT] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.LIST] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.OLIST] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.MAP] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.OMAP] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.NUMBERING] = Opcode.Type.CONTENT;
    Opcode._types[Opcode.IF] = Opcode.Type.CONDITIONAL;
    Opcode._types[Opcode.EXCLUDE] = Opcode.Type.CONDITIONAL;
    Opcode._types[Opcode.GOTO] = Opcode.Type.JUMP;
});
