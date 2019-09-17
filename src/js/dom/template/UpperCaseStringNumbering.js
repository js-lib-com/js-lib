$package('js.dom.template');

/**
 * Upper case string list index. This class uses the set of English upper case characters to represent given index. If
 * index overflow the {@link #dictionary} repeat the character, e.g. 1 is A, 27 is AA, 53 is AAA and so on, where 26 is
 * dictionary size. Its format code is <b>S</b>.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="%S)"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * After templates rendering <em>li</em> elements text content will be A), B) ... . See {@link NumberingOperator} for
 * details about numbering format syntax.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct upper case string index formatter instance.
 */
js.dom.template.UpperCaseStringNumbering = function () {
};

js.dom.template.UpperCaseStringNumbering.prototype = {
    /**
     * Set of English upper case letters.
     */
    _dictionary : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    /**
     * Format index as upper case string. Transform index into a upper case string following next rules:
     * <ul>
     * <li>be dictionary the set of English upper case characters,
     * <li>if index is smaller that dictionary length uses index directly to extract the character and return it,
     * <li>divide index by dictionary length,
     * <li>be chars count the quotient plus one,
     * <li>be index equals remainder,
     * <li>extract char from dictionary using index and return it repeated chars count times.
     * </ul>
     * 
     * @param Number index index value.
     * @return String formatted index.
     */
    format : function (index) {
        --index; // lists index value starts with 1
        var charsCount = Math.floor(index / this._dictionary.length) + 1;
        index = index % this._dictionary.length;
        var c = this._dictionary.charAt(index);
        var s = "";
        for ( var i = 0; i < charsCount; ++i) {
            s += c;
        }
        return s;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return 'js.dom.template.UpperCaseStringNumbering';
    }
};
$extends(js.dom.template.UpperCaseStringNumbering, Object);
