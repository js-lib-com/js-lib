$package('js.util');

/**
 * Handy methods for strings manipulations.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.util.Strings = {
    /**
     * Remove white spaces from string extremities. Recognized white spaces are: <table>
     * <tr>
     * <td>space</td>
     * <td>&nbsp;</td>
     * </tr>
     * <tr>
     * <td>tab</td>
     * <td>\t</td>
     * </tr>
     * <tr>
     * <td>carriage return</td>
     * <td>\r</td>
     * </tr>
     * <tr>
     * <td>new line</td>
     * <td>\n</td>
     * </tr>
     * <tr>
     * <td>form feed</td>
     * <td>\f</td>
     * </tr>
     * </table>
     * 
     * @param String str string to trim.
     * @return String trimed string.
     * @assert given string is not undefined, null or empty.
     */
    trim : function (str) {
        $assert(str, 'js.util.Strings#trim', 'String is undefined, null or empty.');
        return str.trim();
    },

    REGEXP_PATTERN : /([\/|\.|\*|\?|\||\(|\)|\[|\]|\{|\}|\\|\^|\$])/g,

    /**
     * Escape RegExp reserved characters. Prepare a string for usage with RegExp by prefixing all reserved characters
     * with backslash. Returns a string value derived from given string argument.
     * 
     * @param String str string to escape.
     * @return String a new string value usable in the context of a regular expression.
     * @assert given string is not undefined, null or empty.
     */
    escapeRegExp : function (str) {
        $assert(str, 'js.util.Strings#escapeRegExp', 'String is undefined, null or empty.');
        js.util.Strings.REGEXP_PATTERN.lastIndex = 0;
        return str.replace(js.util.Strings.REGEXP_PATTERN, '\\$1');
    },

    /**
     * Case insensitive strings equality test. If both string arguments are null or empty this predicate returns true
     * and false if even a single argument is undefined.
     * 
     * @param String reference string used as reference for comparison,
     * @param String target string to compare to.
     * @return Boolean only if string arguments are case insensitive equals.
     * @assert both arguments are not undefined.
     */
    equalsIgnoreCase : function (reference, target) {
        $assert(typeof reference !== 'undefined', 'js.util.Strings#equalsIgnoreCase', 'Undefined reference string.');
        if (typeof reference === 'undefined') {
            return false;
        }
        $assert(typeof target !== 'undefined', 'js.util.Strings#equalsIgnoreCase', 'Undefined target string.');
        if (typeof target === 'undefined') {
            return false;
        }

        if (reference === null && target === null) {
            return true;
        }
        if (reference === null || target === null) {
            return false;
        }
        return reference.toLocaleLowerCase() === target.toLocaleLowerCase();
    },

    /**
     * Prefix test. Test if given string starts with requested prefix. Comparison is case-sensitive. Returns false if
     * <em>str</em> is undefined, null or empty.
     * 
     * @param String str string to test for prefix presence,
     * @param String prefix string to test against.
     * @return Boolean true if <em>str</em> does start with <em>prefix</em>.
     * @assert <em>prefix</em> argument is not undefined, null or empty.
     */
    startsWith : function (str, prefix) {
        $assert(prefix, 'js.util.Strings#startsWith', 'Prefix is undefined, null or empty.');
        if (!str) {
            return false;
        }
        return str.indexOf(prefix) === 0;
    },

    /**
     * Suffix test. Test if string ends with given suffix. Comparison is case-sensitive. Returns false if <em>str</em>
     * is undefined, null or empty.
     * 
     * @param String str string to test for suffix presence,
     * @param String suffix string to test against.
     * @return Boolean true if <em>str</em> does end with <em>suffix</em>.
     * @assert <em>suffix</em> argument is not undefined, null or empty.
     */
    endsWith : function (str, suffix) {
        $assert(suffix, 'js.util.Strings#endsWith', 'Suffix is undefined, null or empty.');
        if (!str) {
            return false;
        }
        return (str.length >= suffix.length) && str.lastIndexOf(suffix) === str.length - suffix.length;
    },

    /**
     * Inclusion test. Test if string contains with given value. Comparison is case-sensitive. Returns false if
     * <em>str</em> is undefined, null or empty.
     * 
     * @param String str string to test for value inclusion,
     * @param String value string to test against.
     * @return Boolean true if <em>str</em> does include <em>value</em>.
     * @assert both arguments are not undefined, null or empty.
     */
    contains : function (str, value) {
        $assert(str, 'js.util.Strings#contains', 'String is undefined, null or empty.');
        $assert(value, 'js.util.Strings#contains', 'Value is undefined, null or empty.');
        return str ? str.indexOf(value) !== -1 : false;
    },

    /**
     * To title case. This string extension change the first letter to capital and the others to lower, i.e. title case.
     * Return empty string if given string argument is undefined, null or empty.
     * 
     * @param String str string to convert.
     * @return String the new converted string.
     * @assert given string is not undefined, null or empty.
     */
    toTitleCase : function (str) {
        $assert(str, 'js.util.Strings#toTitleCase', 'String is undefined, null or empty.');
        return str ? (str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()) : '';
    },

    /**
     * To hyphen case. Convert camel to hyphen case, that is replace upper case with hyphen followed by lower case.
     * Anyway, first character is forced to lower case and not prefixed by hyphen, see example below.
     * 
     * <pre>
     * 	toHyphenCase -> to-hyphen-case
     * 	ToHyphenCase -> to-hyphen-case
     * </pre>
     * 
     * Return empty string if given string argument is undefined, null or empty.
     * 
     * @param String str string to convert.
     * @return String newly created hyphen case string.
     * @assert given string is not undefined, null or empty.
     */
    toHyphenCase : function (str) {
        $assert(str, 'js.util.Strings#toHyphenCase', 'String is undefined, null or empty.');
        if (!str) {
            return '';
        }
        var s = str.charAt(0).toLowerCase();
        s += str.substr(1).replace(/([A-Z][^A-Z]*)/g, function ($0, $1) {
            return '-' + $1.toLowerCase();
        });
        return s;
    },

    /**
     * To script case. Convert hyphened CSS style names to camel case suitable for script, e.g. get-user-name become
     * getUserName. This method can also be used for CSS style names to script conversion; also takes care of float -
     * convert to cssFloat or styleFloat depending on layout engine. Return empty string if given string argument is
     * undefined, null or empty.
     * 
     * @param String str string to convert.
     * @return String the new converted string.
     * @assert given string is not undefined, null or empty.
     */
    toScriptCase : function (str) {
        $assert(str, 'js.util.Strings#toScriptCase', 'String is undefined, null or empty.');
        if (!str) {
            return '';
        }
        if (str.valueOf() == 'float') {
            return js.ua.Engine.TRIDENT ? 'styleFloat' : 'cssFloat';
        }
        if (str.indexOf('-') === -1) {
            return str.valueOf();
        }
        return str.replace(/\-(\w)/g, function ($0, $1) {
            return $1.toUpperCase();
        });
    },

    /**
     * Convert HTML formatted text to plain text. Current Implementation removes all tags and replace paragraphs with
     * CRLF. Return newly created plain text; formatted text parameter is not changed.
     * 
     * @param String text formatted source text,
     * @param Number... offset optional offset into source string, default to 0,
     * @param Number... length optional maximum length of returned plain text.
     * @return String newly created plain text.
     */
    toPlainText : function(text, offset, length) {
        $assert(typeof text !== "undefined" && text !== null, "js.util.Strings#toPlainText", "Text is undefined or null.");
        $assert(typeof offset === "undefined" || js.lang.Types.isNumber(offset), "js.util.Strings#toPlainText", "Offset is not a number.");
        $assert(typeof length === "undefined" || js.lang.Types.isNumber(length), "js.util.Strings#toPlainText", "Length is not a number.");

        if (typeof offset === "undefined") {
            offset = 0;
        }
        if (typeof length === "undefined") {
            length = Number.MAX_VALUE;
        }

        var TEXT = 0;
        var START_TAG = 1;
        var END_TAG = 2;
        var state = TEXT;

        var plainText = "";
        for (var i = offset, c; i < text.length && plainText.length <= length; ++i) {
            c = text.charAt(i);

            switch (state) {
            case TEXT:
                if (c === '<') {
                    state = START_TAG;
                    break;
                }
                plainText += c;
                break;

            case START_TAG:
                if (c === '/') {
                    state = END_TAG;
                    break;
                }
                if (c === '>') {
                    state = TEXT;
                }
                break;

            case END_TAG:
                if (c === 'p') {
                    plainText += "\r\n";
                }
                if (c === '>') {
                    state = TEXT;
                }
                break;
            }
        }
        return plainText;
    },

    /**
     * Chars count. Returns the number of occurrence of requested character. Returns 0 if string to scan is undefined,
     * null or empty.
     * 
     * @param String str string to scan for character occurrence,
     * @param String ch character to count.
     * @return Number the number of character occurrence in string.
     * @assert both arguments are not undefined, null or empty.
     */
    charsCount : function (str, ch) {
        $assert(str, 'js.util.Strings#charsCount', 'String is undefined, null or empty.');
        $assert(ch, 'js.util.Strings#charsCount', 'Character is undefined, null or empty.');
        if (!str) {
            return 0;
        }
        var count = 0;
        for ( var i = 0; i < str.length; ++i) {
            if (str.charAt(i) === ch) {
                ++count;
            }
        }
        return count;
    },

    /**
     * Get substring after separator.
     * 
     * @param String str source string,
     * @param String separator separator string.
     * @return String substring after separator.
     */
    last : function (str, separator) {
        return str.substr(str.lastIndexOf(separator) + 1);
    },

    /**
     * Valid package name pattern. Note that, in order to reuse code, this constant is an alias to
     * {@link js.lang.Operator._PACKAGE_NAME_REX}.
     * 
     * @type RexExp
     */
    _PACKAGE_NAME_REX : js.lang.Operator._PACKAGE_NAME_REX,

    /**
     * Test if name is a valid package name.
     * 
     * @param String name name to test.
     * @return Boolean true only if name is a valid package name.
     */
    isPackageName : function (name) {
        this._PACKAGE_NAME_REX.lastIndex = 0;
        return name && this._PACKAGE_NAME_REX.test(name);
    },

    /**
     * Valid class name pattern. Note that, in order to reuse code, this constant is an alias to
     * {@link js.lang.Operator._CLASS_NAME_REX}.
     * 
     * @type RexExp
     */
    _CLASS_NAME_REX : js.lang.Operator._CLASS_NAME_REX,

    /**
     * Test if string is a qualified class name.
     * 
     * @param String name name to test.
     * @return Boolean true only if name is a string and follows qualified class name pattern.
     */
    isQualifiedClassName : function (name) {
        this._CLASS_NAME_REX.lastIndex = 0;
        return name && this._CLASS_NAME_REX.test(name);
    },

    /**
     * Parse given string for name / value pairs separated by semicolon. Name and value are separated by colon.
     * 
     * @param String expression expression to parse.
     * @return Array array of name / value pairs.
     */
    parseNameValues : function (expression) {
        // sample expression: "name0:value0;name1:value1;"

        $assert(expression, "js.util.Strings#parseNameValues", "Expression argument is undefined, null or empty.");
        var pairs = [];
        if (!expression) {
            return pairs;
        }

        var semicolonIndex = 0, colonIndex, name;
        for (;;) {
            colonIndex = expression.indexOf(':', semicolonIndex);
            if (colonIndex === -1) {
                break;
            }
            name = expression.substring(semicolonIndex, colonIndex);

            ++colonIndex;
            semicolonIndex = expression.indexOf(';', colonIndex);
            if (semicolonIndex === -1) {
                semicolonIndex = expression.length;
            }
            $assert(colonIndex !== semicolonIndex, "js.util.Strings#parseNameValues", "Invalid name/value expression |%s|. Empty value near |%s|.", expression, name);

            pairs.push({
                name : name,
                value : expression.substring(colonIndex, semicolonIndex)
            });
            ++semicolonIndex;
        }

        $assert(pairs.length > 0, "js.util.Strings#parseNameValues", "Invalid name/value expression |%s|. Missing colon separator.", expression);
        return pairs;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return 'js.util.Strings';
    }
};

/**
 * IE miss trim support from built-in String.
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.util.Strings.TRIM_PATTERN = /^\s+|\s+$/g;

    js.util.Strings.trim = function (str) {
        $assert(str, 'js.util.Strings#trim', 'String is undefined, null or empty.');
        js.util.Strings.TRIM_PATTERN.lastIndex = 0;
        return str.replace(js.util.Strings.TRIM_PATTERN, '');
    };
});
