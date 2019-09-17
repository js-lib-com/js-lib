$package('js.dom.template');

/**
 * Upper case Roman number index. Transform index into its Roman number representation. Its format code is <b>I</b>.
 * 
 * <pre>
 *  &lt;ul data-olist="."&gt;
 *      &lt;li data-numbering="%I)"&gt;&lt;/li&gt;
 *  &lt;/ul&gt;
 * </pre>
 * 
 * After templates rendering <em>li</em> elements text content will be I), II) ... . See {@link NumberingOperator} for
 * details about numbering format syntax.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct upper case Roman numeric formatter instance.
 */
js.dom.template.UpperCaseRomanNumbering = function () {
};

js.dom.template.UpperCaseRomanNumbering.prototype = {
    /**
     * Roman numerals constants.
     * 
     * @type Array
     */
    Numeral : [ {
        roman : 'I',
        decimal : 1
    }, {
        roman : 'IV',
        decimal : 4
    }, {
        roman : 'V',
        decimal : 5
    }, {
        roman : 'IX',
        decimal : 9
    }, {
        roman : 'X',
        decimal : 10
    }, {
        roman : 'XL',
        decimal : 40
    }, {
        roman : 'L',
        decimal : 50
    }, {
        roman : 'XC',
        decimal : 90
    }, {
        roman : 'C',
        decimal : 100
    }, {
        roman : 'CD',
        decimal : 400
    }, {
        roman : 'D',
        decimal : 500
    }, {
        roman : 'CM',
        decimal : 900
    }, {
        roman : 'M',
        decimal : 1000
    } ],

    /**
     * Format index as upper case Roman numeral.
     * 
     * @param Number index index value.
     * @return String formatted index.
     */
    format : function (index) {
        var s = '';
        for ( var i = this.Numeral.length - 1; i >= 0; i--) {
            while (index >= this.Numeral[i].decimal) {
                s += this.Numeral[i].roman;
                index -= this.Numeral[i].decimal;
            }
        }
        return s;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return 'js.dom.template.UpperCaseRomanNumbering';
    }
};
$extends(js.dom.template.UpperCaseRomanNumbering, Object);
