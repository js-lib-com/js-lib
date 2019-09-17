$package("js.format");

/**
 * Generic formatter with methods to format, parse and test values.
 * 
 * @author Iulian Rotaru
 * @since 1.3
 */
js.format.Format = {
    /**
     * Format value instance into a string representation suitable for user interface.
     * 
     * @param Object object value instance.
     * @return String value string representation.
     */
    format : function (object) {
    },

    /**
     * Parse value string representation and return value instance.
     * 
     * @param String string value string representation.
     * @return Object value instance.
     */
    parse : function (string) {
    },

    /**
     * Test if value string representation can be parsed without errors. If this predicate returns true parse is
     * guaranteed to run successfully.
     * 
     * @param String string value string representation.
     * @return Boolean if given <code>string</code> can be successfully parsed.
     */
    test : function (string) {
    }
};