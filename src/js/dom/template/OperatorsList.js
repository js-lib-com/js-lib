$package('js.dom.template');

/**
 * Element operators list. Scan an element attributes, looking for operators syntax and store meta-data about operators
 * found. There are semantic restrictions on element operators list, see below; this class takes care to enforce them
 * and throws templates exception if semantic restriction is broken. Operators are grouped into types, see
 * {@link js.dom.template.Opcode.Type}.
 * 
 * <h4>Operators list constrains</h4>
 * <ul>
 * <li>at most one conditional operator, see {@link js.dom.template.Opcode.Type#CONDITIONAL} for a list of mutually
 * excluding conditional operators,
 * <li>at most one content operator, see {@link js.dom.template.Opcode.Type#CONTENT} for a list of mutually excluding
 * content operators,
 * <li>at most one formatter instance declared; this constrain is actually enforced by XML syntax that does not allow
 * for multiple attributes with the same name,
 * <li>format instance mandates {@link js.dom.template.TextOperator} or {@link js.dom.template.ValueOperator} presence.
 * </ul>
 * 
 * @author Iulian Rotaru
 * 
 * @constructor Construct operators list instance.
 */
js.dom.template.OperatorsList = function () {
    /**
     * Jump operator meta-data.
     * 
     * @type js.dom.template.OperatorsList.Meta
     */
    this._jumpOperator = null;

    /**
     * Conditional operator meta-data.
     * 
     * @type js.dom.template.OperatorsList.Meta
     */
    this._conditionalOperator = null;

    /**
     * Formatting instance meta-data.
     * 
     * @type js.dom.template.OperatorsList.Meta
     */
    this._formattingOperator = null;

    /**
     * Content operator meta-data.
     * 
     * @type js.dom.template.OperatorsList.Meta
     */
    this._contentOperator = null;

    /**
     * Attribute operators meta-data list.
     * 
     * @type Array
     */
    this._attributeOperators = [];
};

js.dom.template.OperatorsList.prototype = {
    /**
     * Initialize element operators list. Scan element attributes looking for operators syntax and initialize internal
     * meta-data.
     * 
     * @param js.dom.Element element element to scan for operators.
     */
    initElement : function (element) {
        // reset this operators list content because instance is reused
        this._jumpOperator = null;
        this._conditionalOperator = null;
        this._formattingOperator = null;
        this._contentOperator = null;
        this._attributeOperators = [];

        var Opcode = js.dom.template.Opcode;
        var attrs = element.getNode().attributes;
        var attr, i, opcode, type, meta;

        for (i = 0; i < attrs.length; i++) {
            attr = attrs[i];

            opcode = Opcode.fromAttrName(attr.nodeName);
            if (opcode === Opcode.NONE) {
                continue;
            }
            $assert(attr.value.length !== 0, "js.dom.template.OperatorsList#initElement", "Empty operand on element |%s| for opcode |%s|.", element, opcode);

            meta = {
                opcode : opcode,
                operand : attr.value
            };

            type = Opcode.type(opcode);
            switch (type) {
            case Opcode.Type.JUMP:
                this._insanityCheck(element, this._jumpOperator, type);
                this._jumpOperator = meta;
                break;

            case Opcode.Type.CONDITIONAL:
                this._insanityCheck(element, this._conditionalOperator, type);
                this._conditionalOperator = meta;
                break;

            case Opcode.Type.FORMATTING:
                this._insanityCheck(element, this._formattingOperator, type);
                this._formattingOperator = meta;
                break;

            case Opcode.Type.CONTENT:
                this._insanityCheck(element, this._contentOperator, type);
                this._contentOperator = meta;
                break;

            case Opcode.Type.ATTRIBUTE:
                this._attributeOperators.push(meta);
                break;

            default:
                $assert(false, "js.dom.template.OperatorsList#initElement", "Invalid operators list on element |%s|. Unknown opcode type |%s|.", element, Opcode.Type.name(type));
            }
        }
    },

    /**
     * Initialize list item operators list. Delegates {@link #initElement(js.dom.Element)}. If item element has no
     * content operator chose one as follow: if element has children set content operator to
     * {@link js.dom.template.Opcode#OBJECT}, otherwise to {@link js.dom.template.Opcode#TEXT}.
     * 
     * @param js.dom.Element element element to scan for operators.
     */
    initItem : function (element) {
        this.initElement(element);
        if (this._contentOperator === null) {
            var opcode = element.hasChildren() ? js.dom.template.Opcode.OBJECT : js.dom.template.Opcode.TEXT;
            this._contentOperator = {
                opcode : opcode,
                operand : "."
            };
        }
    },

    /**
     * Initialize operators list for subtree root element. Delegates {@link #initElement(js.dom.Element)}. Subtree
     * child elements property path are relative to subtree root element. For this reason root property path must be
     * self, i.e. the dot. This initializer ensure this constrain.
     * <p>
     * In order to inject content into an element, target element should have a content operator - see
     * {@link js.dom.template.Opcode.Type#CONTENT} for a list of supported content operator but keep in mind that
     * {@link js.dom.template.Opcode#TEXT}, {@link js.dom.template.Opcode#HTML} or
     * {@link js.dom.template.Opcode#NUMBERING} are not allowed.
     * 
     * @param js.dom.Element element subtree root element.
     * @assert element has content operator; also, if content operator is present it cannot be
     *         {@link js.dom.template.Opcode#TEXT}, {@link js.dom.template.Opcode#HTML} or
     *         {@link js.dom.template.Opcode#NUMBERING}.
     */
    initSubtree : function (element) {
        this.initElement(element);

        // TODO hack for subtree injection
        if (this._contentOperator === null) {
            this._contentOperator = {
                opcode : js.dom.template.Opcode.OBJECT,
                operand : "."
            };
        }

        // TODO because of above hack this condition is always true 
        if (this._contentOperator !== null) {
            $assert(this._contentOperator.opcode !== js.dom.template.Opcode.TEXT, "js.dom.template.OperatorsList#initSubtree", "Subtree initializer forbids TEXT operator.");
            $assert(this._contentOperator.opcode !== js.dom.template.Opcode.HTML, "js.dom.template.OperatorsList#initSubtree", "Subtree initializer forbids HTML operator.");
            $assert(this._contentOperator.opcode !== js.dom.template.Opcode.NUMBERING, "js.dom.template.OperatorsList#initSubtree", "Subtree initializer forbids NUMBERING operator.");
            this._contentOperator.operand = ".";
            return;
        }

        // TODO because of above hack we never step here
        var message = $format("Missing content operator. Element not usable for template injection:\r\n" + //
        "\t- trace: %s\r\n" + //
        "\t- dump: %s\r\n" + //
        "Note that element attributes does not contain a content operator.\r\n" + //
        "See js.dom.template.Opcode.Type#CONTENT for a list of content operators.", element.trace(), element.dump());
        $error("js.dom.template.OperatorsList#initSubtree", message);

        $assert(false, "js.dom.template.OperatorsList#initSubtree", "Missing content operator. Element not usable for template injection. See error log.");
    },

    /**
     * Return true if this operators list contains a jump operator.
     * 
     * @return true if jump operator is present.
     */
    hasJumpOperator : function () {
        return this._jumpOperator !== null;
    },

    /**
     * Return true if this operators list contains a conditional operator.
     * 
     * @return true if conditional operator is present.
     */
    hasConditionalOperator : function () {
        return this._conditionalOperator !== null;
    },

    /**
     * Return true if this operators list contains a content operator.
     * 
     * @return true if content operator is present.
     */
    hasContentOperator : function () {
        return this._contentOperator !== null;
    },

    /**
     * Get jump operator meta-data.
     * 
     * @return jump operator meta-data.
     * @assert jump operator is not null.
     */
    getJumpOperatorMeta : function () {
        $assert(this._jumpOperator !== null, "js.dom.template.OperatorsList#getJumpOperatorMeta", "Jump operator is null.");
        return this._jumpOperator;
    },

    /**
     * Get conditional operator meta-data.
     * 
     * @return conditional operator meta-data.
     * @assert conditional operator is not null.
     */
    getConditionalOperatorMeta : function () {
        $assert(this._conditionalOperator !== null, "js.dom.template.OperatorsList#getConditionalOperatorMeta", "Conditional operator is null.");
        return this._conditionalOperator;
    },

    /**
     * Get content operator meta-data.
     * 
     * @return content operator meta-data.
     * @assert content operator is not null.
     */
    getContentOperatorMeta : function () {
        $assert(this._contentOperator !== null, "js.dom.template.OperatorsList#getContentOperatorMeta", "Content operator is null.");
        return this._contentOperator;
    },

    /**
     * Get attribute operators meta-data list, possible empty.
     * 
     * @return attribute operators meta-data.
     */
    getAttributeOperatorsMeta : function () {
        return this._attributeOperators;
    },

    /**
     * Throws assertion if operator of given type is already declared.
     * 
     * @param Element element context element,
     * @param Object meta operator meta-data,
     * @param Opcode.Type type operator type.
     * @assert meta is null.
     */
    _insanityCheck : function (element, meta, type) {
        $assert(meta === null, "js.dom.template.OperatorsList#_insanityCheck", "Invalid operators list on element |%s|. Only one %s operator is allowed.", element, js.dom.template.Opcode.Type.name(type));
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.template.OperatorsList";
    }
};
$extends(js.dom.template.OperatorsList, Object);

/**
 * Meta-data for operators list.
 * 
 * @author Iulian Rotaru
 * @constructor Construct meta-data instance.
 */
js.dom.template.OperatorsList.Meta = function () {
    /**
     * Operation code.
     * 
     * @type Number
     */
    this.opcode = null;

    /**
     * Operand is the argument for operator.
     * 
     * @type String
     */
    this.operand = null;
};
$extends(js.dom.template.OperatorsList.Meta, Object);
