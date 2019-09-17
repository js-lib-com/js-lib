$package("js.dom.template");

/**
 * Set element text content accordingly numbering format and item index. It is usable inside elements with ordered lists
 * and maps operators which are responsible for index creation and increment; this operators deals only with formatting.
 * Trying to use it outside index scope will rise exception.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="D.2.%s)"&gt&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * After template execution <em>li</em> elements text content will be: D.2.a) D.2.b) ... D.2.i). Operand is an format
 * describing numbering format with next syntax:
 * 
 * <pre>
 *  numberingFormat := character* (indexFormat character*)+
 *  character := any less "%"
 *  indexFormat := "%" formatCode
 *  formatCode := "s" | "S" | "i" | "I" | "n"
 * </pre>
 * 
 * As observe, syntax allows for multiple index formating usable for nested list. Below sample will expand in a series
 * like: A.1, A.2 ... , B.1, B.2 ... .
 * 
 * <pre>
 *  &lt;section data-olist="outer"&gt;
 *      &lt;ul data-olist="inner"&gt;
 *          &lt;li data-numbering="%S.%n"&gt;&lt;/li&gt;
 *      &lt;/ul&gt;
 *  &lt;/section&gt;
 * </pre>
 * 
 * Because only ordered list have index, mixing order and unordered list is supported, although not really a use case.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li&gt;
 *          &lt;h1 data-numbering="%I"&gt;&lt;/h1&gt;
 *          &lt;ul data-list="."&gt; // unordered list between two with numbering
 *              &lt;li&gt;
 *                  &lt;h2&gt;&lt;/h2&gt;
 *                  &lt;ul data-olist="."&gt;
 *                      &lt;li&gt;
 *                          &lt;h3 data-numbering="%I.%S"&gt;&lt;/h3&gt;
 *                      &lt;/li&gt;
 *                  &lt;/ul&gt;
 *              &lt;/li&gt;
 *          &lt;/ul&gt;
 *      &lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * Because of mixed unordered list, h3 elements will have a series like: I.A, I.B, I.A, I.B, II.A, II.B, II.A, II.B ... .
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct NUMBERING operator instance.
 * @param js.dom.template.Template template parent template,
 * @param js.dom.template.Content content dynamic content instance.
 */
js.dom.template.NumberingOperator = function (template, content) {
    /**
     * Parent template.
     * 
     * @type js.dom.template.Template
     */
    this._template = template;

    this.$super(content);
};

js.dom.template.NumberingOperator.prototype = {
    /**
     * Insert formatted numbering as element text content. This operator must run inside a context prepared by a
     * surrounding ordered list or map. For this reason template indexes stack must not be empty.
     * 
     * @param js.dom.Element element element declaring numbering operator,
     * @param Object scope unused scope object,
     * @param String format numbering format, see class description for syntax.
     * @return always returns null to signal full processing.
     * @assert parent template indexes stack is not empty and declared format code is valid.
     */
    _exec : function (element, scope, format) {
        // scope can be null but this operator doesnot use it

        var indexes = this._template._indexes;
        $assert(indexes.length > 0, "js.dom.template.NumberingOperator#_exec", "Required ordered collection index is missing. Numbering operator cancel execution.");
        element.setText(this._getNumbering(indexes, format));
        return undefined;
    },

    _reset : function(element) {
    	element.removeText();
    },
    
    /**
     * Parse numbering format and inject index values. First argument,the stack of indexes, is global per template
     * instance and format is the operand literal value. For nested numbering, format may contain more than one single
     * format code; this is the reason first argument is the entire indexes stack, not only current index. Given a stack
     * with four indexes those values are 1, 2, 3 and 4 and "%S - %I.%n-%s)" the format, resulting formatted string is
     * "A - II.3-d)".
     * 
     * @param Array indexes template global indexes storage,
     * @param String format numbering format.
     * @return String formatted numbering.
     */
    _getNumbering : function (indexes, format) {
        var sb = "";
        var i = format.length;
        var j = i;
        var indexPosition = indexes.length - 1;
        for (;;) {
            i = format.lastIndexOf('%', i);
            if (i === -1 && j > 0) {
                sb = format.substring(0, j) + sb;
                break;
            }
            if (i + 2 < format.length) {
                sb = format.substring(i + 2, j) + sb;
            }
            if (i + 1 === format.length) {
                continue;
            }

            var numberingFormat = this._getNumberingFormat(format.charAt(i + 1));
            sb = numberingFormat.format(indexes[indexPosition--].value) + sb;
            if (i === 0) {
                break;
            }
            j = i;
            i--;
        }
        return sb;
    },

    /**
     * Factory method for numbering format implementations. If format code is not recognized throws templates exception;
     * anyway validation tool catches this condition. See {@link NumberingFormat} for the list of valid format codes.
     * 
     * @param String formatCode single char format code.
     * @return Object requested numbering format instance.
     * @assert format code is valid.
     */
    _getNumberingFormat : function (formatCode) {
        switch (formatCode) {
        case 'n':
            return new js.dom.template.ArabicNumeralNumbering();
        case 's':
            return new js.dom.template.LowerCaseStringNumbering();
        case 'S':
            return new js.dom.template.UpperCaseStringNumbering();
        case 'i':
            return new js.dom.template.LowerCaseRomanNumbering();
        case 'I':
            return new js.dom.template.UpperCaseRomanNumbering();
        }
        $assert(false, "js.dom.template.NumberingOperator#_getNumberingFormat", "Invalid numbering format code |%s|.", formatCode);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.template.NumberingOperator";
    }
};
$extends(js.dom.template.NumberingOperator, js.dom.template.Operator);
