$package("js.dom");

/**
 * CSS styles bound to an element. This class is a companion for document elements encapsulating methods for style
 * handling. Note that j(s)-lib good practice guide does not recommend using styles directly. Uses instead meaningful
 * CSS classes and external stylesheets.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct CSS style instance for given element.
 * 
 * @param js.dom.Element el element to which this style is attached.
 */
js.dom.Style = function (el) {
    $assert(this instanceof js.dom.Style, "js.dom.Style#Style", "Invoked as function.");
    $assert(el, "js.dom.Style#Style", "Element is undefined or null.");

    /**
     * Native node to which style is attached.
     * 
     * @type Node
     */
    this._node = el._node;
};

js.dom.Style.prototype = {
    /**
     * Set style(s) value(s). This method set one or more style(s) value to this element. If set one single style both
     * name and value arguments must be supplied. Alternatively one may invoke this method with a single name/value
     * hash.
     * 
     * <pre>
     *	var styles = {
     *		"background-color":"blue",
     *		"border":"solid 1px green",
     *		"position":"relative"
     *	}
     *	el.style.set(styles);
     * </pre>
     * 
     * Note that style name must be a string, following the CSS notation. Both hyphened and camel style notations are
     * legal, e.g. <code>font-family</code> and <code>fontFamily</code>. Also value, if present must be a string
     * too, even for pure numerical values like opacity. When appropriate, value must contain the units, as
     * <code>100px</code>.
     * <p>
     * <strong>Best practice:</strong> do not abuse set style; uses instead meaningful classes and set styles using CSS
     * files.
     * 
     * @param String style name of style to be set or name/value hash,
     * @param String value the newly style value, ignored if first argument is a hash.
     * @return js.dom.Style this object.
     * @assert arguments are not undefined, null or empty.
     */
    set : function (style, value) {
        $assert(this._node.style, "js.dom.Style#set", "Element with no styles.");
        $assert(style, "js.dom.Style#set", "Style is undefined or null.");

        if (js.lang.Types.isObject(style)) {
            for ( var s in style) {
                this.set(s, style[s]);
            }
            return this;
        }
        $assert(js.lang.Types.isString(style), "js.dom.Style#set", "Style is undefined, null or empty.");
        $assert(js.lang.Types.isString(value), "js.dom.Style#set", "Value is undefined, null or empty.");
        this._node.style[js.util.Strings.toScriptCase(style)] = value;
        return this;
    },

    /**
     * Get element style. Style name must be a string, following the CSS notation. Both hyphened and camel style
     * notations are legal, e.g. <code>font-family</code> and <code>fontFamily</code>. Return null if style
     * argument is undefined, null or empty.
     * 
     * @param String style the name of the style to be retrieved.
     * @return String requested style value or null. Note that this method returns always a string, even for numerical
     *         style value like z-index.
     * @assert style argument is not undefined, null or empty.
     */
    get : function (style) {
        $assert(this._node.style, "js.dom.Style#get", "Element with no styles.");
        if (!this._node.style) {
            return null;
        }
        $assert(style, "js.dom.Style#get", "Style is undefined, null or empty.");
        if (!style) {
            return null;
        }

        style = js.util.Strings.toScriptCase(style);
        var v = this.getComputedStyle(style);
        var isNull = v === null;
        if (js.ua.Engine.TRIDENT && style === "zIndex" && v === 0) {
            isNull = true;
        }
        if (isNull) {
            return null;
        }
        if (!js.lang.Types.isString(v)) {
            v = v.toString();
        }
        return v;
    },

    /**
     * Get read-only value of computed style or null if style is missing. Return the actual style this element may have
     * including styles from linked stylesheets. Returned value is not normalized, that is, is returned as provided by
     * user agent. If requested style is missing this getter returns null.
     * <p>
     * Please note that returned value is a read-only style object.
     * 
     * @param String style name of the style to retrieve.
     * @return String requested style value or null.
     */
    getComputedStyle : function (style) {
        $assert(this._node.style, "js.dom.Style#getComputedStyle", "Element with no styles.");
        // n.b. computed style returns a read-only style object
        var value = window.getComputedStyle(this._node).getPropertyValue(style);
        return (typeof value === "undefined" || value.length === 0) ? null : value;
    },

    /**
     * Returns the size of element and its position relative to the viewport. Returned value is an object with
     * <code>top</code>, <code>right</code>, <code>bottom</code> and <code>left</code> properties. Measurement
     * unit is pixel.
     * <p>
     * The amount of scrolling that has been done of the viewport area is taken into account when computing the bounding
     * rectangle. This means that the top and left property change their values as soon as the scrolling position
     * changes (so their values are relative to the viewport and not absolute).
     * <p>
     * Note that returned value is a read-only DOMRect object.
     * 
     * @return Object client rectangle relative to viewport.
     */
    getClientRect : function () {
        return this._node.getBoundingClientRect();
    },

    /**
     * Remove element style. Remove specified style; further references to removed style return null. Style name must be
     * a string, following the CSS notation. Both dashed and camel style notations are legal, e.g.
     * <code>font-family</code> and <code>fontFamily</code>.
     * 
     * @param String style name of the style to be removed.
     * @return js.dom.Style this object.
     */
    remove : function (style) {
        $assert(this._node.style, "js.dom.Style#remove", "Element with no styles.");
        this._node.style[js.util.Strings.toScriptCase(style)] = "";
        return this;
    },

    /**
     * Check if element has a style. Returns true if element has requested style. If optional values list is given
     * compare each with style value and return true on first match; if none found return false.
     * <p>
     * Note that because this predicate uses {@link #get(String)} it considers computed styles, including default style
     * values, not only those explicitly declared.
     * 
     * @param String style the name of the style to check,
     * @param String... values optional values.
     * @return Boolean true if element has requested style and value, if given.
     * @assert style argument is not undefined, null or empty.
     */
    has : function (style) {
        var value = this.get(style);
        if (value === null) {
            return false;
        }
        if (arguments.length === 1) {
            return !!value;
        }
        for (var i = 1; i < arguments.length; ++i) {
            if (value === arguments[i]) {
                return true;
            }
        }
        return false;
    },

    /**
     * Determine if element is visible. Check elements and all ancestors up to body if display none and visibility
     * hidden. Return true if element is visible and false if element or one of its ancestors has display
     * <code>none</code> or visibility <code>hidden</code>.
     * 
     * @return Boolean true if element is visible.
     */
    isVisible : function () {
        var n = this._node;
        while (n) {
            if (n.style.display.toLowerCase() === "none") {
                return false;
            }
            if (n.style.visibility.toLowerCase() === "hidden") {
                return false;
            }
            if (n.nodeName.toLowerCase() === "body") {
                return true;
            }
            n = n.parentNode;
        }
        return false;
    },

    /**
     * Get element width. Element width does not includes padding, scroll, border or margins. Returned value is numeric
     * and consider only pixel units.
     * 
     * @return Number element width.
     * @note This method ignores old browsers and quirks mode.
     */
    getWidth : function () {
        return parseInt(this.getComputedStyle("width"), 10);
    },

    /**
     * Set element width. Accepted values for width are <code>auto</code>, <code>inherit</code> or a numeric one.
     * 
     * @param Object width element width.
     * @return js.dom.Style this object.
     * @assert <code>width</code> argument is valid.
     * @note This method ignores old browsers and quirks mode.
     */
    setWidth : function (width) {
        $assert(width === "auto" || width === "inherit" || js.lang.Types.isNumber(width), "js.dom.Style#setWidth", "Width is not a valid.");
        if (js.lang.Types.isNumber(width)) {
            width = width.toString(10) + "px";
        }
        return this.set("width", width);
    },

    /**
     * Get element height. Element height does not includes padding, scroll, border or margins. Returned value is
     * numeric and consider only pixel units.
     * 
     * @return Number element height.
     * @note This method ignores old browsers and quirks mode.
     */
    getHeight : function () {
        return parseInt(this.getComputedStyle("height"), 10);
    },

    /**
     * Set element height. Accepted values for height are <code>auto</code>, <code>inherit</code> or a numeric one.
     * 
     * @param Object height element height.
     * @return js.dom.Style this object.
     * @assert <code>height</code> argument is valid.
     * @note This method ignores old browsers and quirks mode.
     */
    setHeight : function (height) {
        $assert(height === "auto" || height === "inherit" || js.lang.Types.isNumber(height), "js.dom.Style#setHeight", "Height is not valid.");
        if (js.lang.Types.isNumber(height)) {
            height = height.toString(10) + "px";
        }
        return this.set("height", height);
    },

    /**
     * Get element border width. Returned value is an object with <code>top</code>, <code>right</code>,
     * <code>bottom</code> and <code>left</code> properties.
     * 
     * @return Object element border width.
     */
    getBorderWidth : function () {
        return {
            top : parseInt(this.getComputedStyle("border-top-width"), 10),
            right : parseInt(this.getComputedStyle("border-right-width"), 10),
            bottom : parseInt(this.getComputedStyle("border-bottom-width"), 10),
            left : parseInt(this.getComputedStyle("border-left-width"), 10)
        };
    },

    /**
     * Get element padding. Returned value is an object with <code>top</code>, <code>right</code>,
     * <code>bottom</code> and <code>left</code> properties.
     * 
     * @return Object element padding.
     */
    getPadding : function () {
        return {
            top : parseInt(this.getComputedStyle("padding-top"), 10),
            right : parseInt(this.getComputedStyle("padding-right"), 10),
            bottom : parseInt(this.getComputedStyle("padding-bottom"), 10),
            left : parseInt(this.getComputedStyle("padding-left"), 10)
        };
    },

    /**
     * Get element margin. Returned value is an object with <code>top</code>, <code>right</code>,
     * <code>bottom</code> and <code>left</code> properties.
     * 
     * @return Object element margin.
     */
    getMargin : function () {
        return {
            top : parseInt(this.getComputedStyle("margin-top"), 10),
            right : parseInt(this.getComputedStyle("margin-right"), 10),
            bottom : parseInt(this.getComputedStyle("margin-bottom"), 10),
            left : parseInt(this.getComputedStyle("margin-left"), 10)
        };
    },

    /**
     * Set element positioning style. Argument should be one of CSS2 positioning values:
     * <p>
     * <table>
     * <tr>
     * <td width=70><b>inherit</b>
     * <td>Inherit positioning style from parent.
     * <tr>
     * <td><b>static</b>
     * <td>A static positioned element is always positioned according to the normal flow of the page.
     * <tr>
     * <td><b>absolute</b>
     * <td>An absolute position element is positioned relative to the first parent element that has a position other
     * than static.
     * <tr>
     * <td><b>fixed</b>
     * <td>An element with fixed position is positioned relative to the viewport.
     * <tr>
     * <td><b>relative</b>
     * <td>A relative positioned element is positioned relative to its normal position. </table>
     * 
     * <p>
     * If <code>position</code> is undefined, null or empty this setter does nothing.
     * 
     * @param String position positioning style to set.
     * @return js.dom.Style this object.
     * @assert argument is not undefined, null or empty.
     */
    setPosition : function (position) {
        $assert(position, "js.dom.Style#setPosition", "Position is undefined, null or empty.");
        if (position) {
            this.set("position", position);
        }
        return this;
    },

    /**
     * Get element positioning style.
     * 
     * @return String element positioning style.
     */
    getPosition : function () {
        return this.get("position");
    },

    /**
     * Check if element is positioned. An element is positioned if has one of the next positioning styles:
     * <ul>
     * <li>absolute
     * <li>fixed
     * <li>relative
     * </ul>
     * Please remember that only positioned elements support position setters, like {@link #setTop}.
     * 
     * @return Boolean true if element positioned.
     */
    isPositioned : function () {
        var p = this.get("position");
        return p === "absolute" || p === "fixed" || p === "relative";
    },

    /**
     * Set element top position. Value to set should be a number; it will be rounded and <code>px</code> units used.
     * <p>
     * For absolutely positioned elements, position <code>absolute</code> or <code>fixed</code>, it specifies the
     * distance between the top margin edge of the element and the top edge of its containing block. For relatively
     * positioned elements, position <code>relative</code>, it specifies the amount the element is moved below its
     * normal position.
     * <p>
     * Assert if attempt to set position to a static element, i.e., not positioned element; if assertions are disabled
     * this setter has no effect.
     * 
     * @param Number top top value.
     * @return js.dom.Style this object.
     * @assert element is positioned and top argument is a {@link Number}.
     */
    setTop : function (top) {
        $assert(this.isPositioned(), "js.dom.Style#setTop", "Trying to set position on not positioned element.");
        $assert(js.lang.Types.isNumber(top), "js.dom.Style#setTop", "Top value is not numeric.");
        return this.set("top", Math.round(top).toString(10) + "px");
    },

    /**
     * Set element right position. Value to set should be a number; it will be rounded and <code>px</code> units used.
     * <p>
     * For absolutely positioned elements, position <code>absolute</code> or <code>fixed</code>, it specifies the
     * distance between the right margin edge of the element and the right edge of its containing block. For relatively
     * positioned elements, position <code>relative</code>, it specifies the amount the element is moved to the left
     * regarding its normal position.
     * <p>
     * Assert if attempt to set position to a static element, i.e., not positioned element; if assertions are disabled
     * this setter has no effect.
     * 
     * @param Number right right value.
     * @return js.dom.Style this object.
     * @assert element is positioned and right argument is a {@link Number}.
     */
    setRight : function (right) {
        $assert(this.isPositioned(), "js.dom.Style#setRight", "Trying to set position on not positioned element.");
        $assert(js.lang.Types.isNumber(right), "js.dom.Style#setRight", "Right value is not numeric.");
        return this.set("right", Math.round(right).toString(10) + "px");
    },

    /**
     * Set element bottom position. Value to set should be a number; it will be rounded and <code>px</code> units
     * used.
     * <p>
     * For absolutely positioned elements, position <code>absolute</code> or <code>fixed</code>, it specifies the
     * distance between the bottom margin edge of the element and the bottom edge of its containing block. For
     * relatively positioned elements, position <code>relative</code>, it specifies the amount the element is moved
     * above its normal position.
     * <p>
     * Assert if attempt to set position to a static element, i.e., not positioned element; if assertions are disabled
     * this setter has no effect.
     * 
     * @param Number bottom bottom value.
     * @return js.dom.Style this object.
     * @assert element is positioned and bottom argument is a {@link Number}.
     */
    setBottom : function (bottom) {
        $assert(this.isPositioned(), "js.dom.Style#setBottom", "Trying to set position on not positioned element.");
        $assert(js.lang.Types.isNumber(bottom), "js.dom.Style#setBottom", "Bottom value is not numeric.");
        return this.set("bottom", Math.round(bottom).toString(10) + "px");
    },

    /**
     * Set element left position. Value to set should be a number; it will be rounded and <code>px</code> units used.
     * <p>
     * For absolutely positioned elements, position <code>absolute</code> or <code>fixed</code>, it specifies the
     * distance between the left margin edge of the element and the left edge of its containing block. For relatively
     * positioned elements, position <code>relative</code>, it specifies the amount the element is moved to the right
     * regarding its normal position.
     * <p>
     * Assert if attempt to set position to a static element, i.e., not positioned element; if assertions are disabled
     * this setter has no effect.
     * 
     * @param Number left left value.
     * @return js.dom.Style this object.
     * @assert element is positioned and left argument is a {@link Number}.
     */
    setLeft : function (left) {
        $assert(this.isPositioned(), "js.dom.Style#setLeft", "Trying to set position on not positioned element.");
        $assert(js.lang.Types.isNumber(left), "js.dom.Style#setLeft", "Left value is not numeric.");
        return this.set("left", Math.round(left).toString(10) + "px");
    },

    /**
     * Get element left position absolute to page. Returns the number of pixels on horizontal axe from page left side to
     * element top/left corner.
     * <p>
     * This method uses page as reference, not viewport. Remember that viewport is only the extend of the page that is
     * visible on device screen while the page is all document rendered in a virtual surface. Page and viewport
     * references are the same only when there is no scroll on any axe.
     * 
     * @return Number element absolute left position, in pixels.
     */
    getPageLeft : function () {
        var left = 0;
        for (var n = this._node; n; n = n.offsetParent) {
            left += n.offsetLeft;
        }
        return left;
    },

    /**
     * Get element top position absolute to page. Returns the number of pixels on vertical axe from page top side to
     * element top/left corner.
     * <p>
     * See {@link #getPageLeft()} for a discussion about page vs. viewport.
     * 
     * @return Number element absolute top position, in pixels.
     */
    getPageTop : function () {
        var top = 0;
        for (var n = this._node; n; n = n.offsetParent) {
            top += n.offsetTop;
        }
        return top;
    },

    /**
     * Swap and execute. Swap element styles and execute given callback function then restore original styles. Returns
     * the value returned by given callback function.
     * 
     * @param Object styles styles to update before function execution,
     * @param Function fn function to b executed in swapped context,
     * @param Object scope callback function run-time execution scope,
     * @param Object... args function actual arguments.
     * @return Object value returned by callback function.
     */
    swap : function (styles, fn, scope) {
        $assert(this._node.style, "js.dom.Style#swap", "Element with no styles.");
        var old = {};
        for ( var name in styles) {
            old[name] = this._node.style[name];
            this._node.style[name] = styles[name];
        }
        var value = fn.apply(scope, $args(arguments, 3));
        for ( var name in styles) {
            this._node.style[name] = old[name];
        }
        return value;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Style";
    }
};
$extends(js.dom.Style, Object);

$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Style.prototype.getComputedStyle = function (style) {
        var value;
        if (window.getComputedStyle) {
            value = window.getComputedStyle(this._node).getPropertyValue(style);
        }
        else if (this._node.currentStyle) {
            value = this._node.currentStyle[js.util.Strings.toScriptCase(style)];
        }
        return (typeof value === "undefined" || value.length === 0) ? null : value;
    };
});
