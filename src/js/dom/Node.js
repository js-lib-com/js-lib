$package("js.dom");

/**
 * Library private node utility. This utility class provides low level DOM nodes and back-reference handling methods.
 * Back-reference is the only augmentation j(s)-lib operates on native DOM {@link Node nodes} and is used to keep track
 * of associated {@link js.dom.Element}; this allows for bi-directional navigation between node and element.
 * 
 * <pre>
 * 	var el = getElement(); // retrieve an element from document tree
 *	var node = el.getNode(); // access underlying native node from j(s)-lib element
 *	. . .
 *	var el = js.dom.Node.getElement(node); // get node wrapper element, if any
 * </pre>
 * 
 * Although methods of this utility class are public it is designed for this library internal use and using it from user
 * space code is not recommended.
 */
js.dom.Node = {
    /**
     * Node's back-reference. Back reference is the only extension of native DOM {@link Node} used to identify the
     * element wrapping the node.
     * 
     * @type String
     */
    _BACK_REF : "__js_element__",

    /**
     * Custom attribute used to store element's class.
     * 
     * @type String
     */
    _DATA_CLASS : "data-class",

    /**
     * Custom attribute used to store element's format class.
     * 
     * @type String
     */
    _DATA_FORMAT : "data-format",

    /**
     * Set node element. This method is called from inside element constructor to create node-element binding, i.e. the
     * back-reference.
     * 
     * @param Node node native DOM node,
     * @param js.dom.Element el element to bind to node.
     * @throws TypeError if <code>node</code> argument is not defined or null.
     */
    setElement : function (node, el) {
        $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Node#setElement", "Node is not element.");
        node[js.dom.Node._BACK_REF] = el;
    },

    /**
     * Retrieve node element. Get given node attached element. This getter returns null if given node has no element
     * attached. Note that node-element binding is lazily performed on element creation via a getter or finder method
     * from {@link js.dom.Document} or {@link js.dom.Element} and persist for entire Node's life.
     * 
     * @param Node node native DOM node.
     * @return js.dom.Element element attached to given node or null.
     * @throws TypeError if <code>node</code> argument is not defined or null.
     */
    getElement : function (node) {
        $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Node#getElement", "Node is not element.");
        var el = node[js.dom.Node._BACK_REF];
        return el ? el : null;
    },

    /**
     * Remove back-reference. A back-reference is the binding from node to wrapping element; this method just delete it.
     * If given node has no element attached this method does nothing.
     * 
     * @param Node node native DOM node.
     * @throws TypeError if <code>node</code> argument is not defined or null.
     */
    removeBackRef : function (node) {
        $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Node#removeBackRef", "Node is not element.");
        if (node[js.dom.Node._BACK_REF]) {
            delete node[js.dom.Node._BACK_REF];
        }
    },

    /**
     * Set the class name for given node element.
     * 
     * @param Node node native DOM node to set class name to,
     * @param String className fully qualified class name.
     */
    setElementClassName : function (node, className) {
        node.setAttribute(this._DATA_CLASS, className);
    },

    /**
     * Retrieve node element class name or null.
     * 
     * @param Node node native DOM node to get element class name for.
     * @return element class name or null.
     */
    getElementClassName : function (node) {
        var className = node.getAttribute(this._DATA_CLASS);
        return className ? className : null;
    },

    /**
     * Get node format name. Return null if this node has no format configured.
     * 
     * @param Node node native DOM node to get format for.
     * @return format name or null.
     */
    getFormatName : function (node) {
        var formatName = node.getAttribute(this._DATA_FORMAT);
        return formatName ? formatName : null;
    },

    /**
     * Retrieve first Node's child of given type. Search for a child of specified type and return first encountered.
     * Returns null if no children of requested type found. Also returns null if <code>node</code> argument is not
     * defined or null.
     * 
     * @param Node node native DOM node to search for children,
     * @param Number nodeType node type constant.
     * @return Node first child of requested type or null.
     * @assert both arguments are not undefined or null.
     */
    firstChild : function (node, nodeType) {
        $assert(node, "js.dom.Node#firstChild", "Node is undefined or null.");
        $assert(nodeType, "js.dom.Node#firstChild", "Node type is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.firstChild, nodeType || Node.ELEMENT_NODE, "next") : null;
    },

    /**
     * Get first element child. Returns first child node of type Node.ELEMENT_NODE or null if none found. Also returns
     * null if <code>node</code> argument is not defined or null.
     * 
     * @param Node node native DOM node to search for elements.
     * @return Node first child element or null.
     * @assert <code>node</code> argument is not undefined or null.
     */
    firstElementChild : function (node) {
        $assert(node, "js.dom.Node#firstElementChild", "Node is undefined or null.");
        return node ? node.firstElementChild : null;
    },

    /**
     * Retrieve last Node's child of given type. Search for a child of specified type and return the last encountered.
     * Returns null if no children of requested type found or <code>node</code> argument is not defined or null.
     * 
     * @param Node node native DOM node to search for children.
     * @param Number nodeType node type constant.
     * @return Node last child of requested type or null.
     * @assert <code>node</code> argument is not undefined or null.
     */
    lastChild : function (node, nodeType) {
        $assert(node, "js.dom.Node#lastChild", "Node is undefined or null.");
        $assert(nodeType, "js.dom.Node#lastChild", "Node type is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.lastChild, nodeType || Node.ELEMENT_NODE, "previous") : null;
    },

    /**
     * Get last element child. Returns last child node of type ELEMENT_NODE or null if none found. Also returns null if
     * <code>node</code> argument is not defined or null.
     * 
     * @param Node node native DOM node to search for elements.
     * @return Node last child element or null.
     * @assert <code>node</code> argument is not undefined or null.
     */
    lastElementChild : function (node) {
        $assert(node, "js.dom.Node#lastElementChild", "Node is undefined or null.");
        return node ? node.lastElementChild : null;
    },

    /**
     * Retrieve next Node's sibling of given type. Search forward for a sibling of specified type and return the first
     * encountered. Returns null if no siblings of requested type found or <code>node</code> argument is not defined
     * or null.
     * 
     * @param Node node native DOM node to search siblings for.
     * @param Number nodeType optional node type constant, default to ELEMENT_NODE.
     * @return Node next sibling of requested type or null.
     * @assert <code>node</code> argument is not undefined or null.
     */
    nextSibling : function (node, nodeType) {
        $assert(node, "js.dom.Node#nextSibling", "Node is undefined or null.");
        $assert(nodeType, "js.dom.Node#nextSibling", "Node is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.nextSibling, nodeType || Node.ELEMENT_NODE, "next") : null;
    },

    /**
     * Get next sibling element.
     * 
     * @param Node node native DOM node to search siblings for.
     */
    nextElementSibling : function (node) {
        $assert(node, "js.dom.Node#nextElementSibling", "Node is undefined or null.");
        return node ? node.nextElementSibling : null;
    },

    /**
     * Retrieve previous Node's sibling of given type. Search backward for a sibling of specified type and return the
     * first encountered. Returns null if no siblings of requested type found or <code>node</code> argument is not
     * defined or null.
     * 
     * @param Node node native DOM node to search siblings for.
     * @param Number nodeType node type constant.
     * @return Node previous sibling of requested type or null.
     * @assert <code>node</code> argument is not undefined or null.
     */
    previousSibling : function (node, nodeType) {
        $assert(node, "js.dom.Node#previousSibling", "Node is undefined or null.");
        $assert(nodeType, "js.dom.Node#previousSibling", "Node type is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.previousSibling, nodeType || Node.ELEMENT_NODE, "previous") : null;
    },

    /**
     * Get previous sibling element or null.
     * 
     * @param Node node native DOM node to search siblings for.
     * @return Node previous element or null.
     */
    previousElementSibling : function (node) {
        $assert(node, "js.dom.Node#previousElementSibling", "Node is undefined or null.");
        return node ? node.previousElementSibling : null;
    },

    /**
     * Get child elements count for given node. Note that this method counts only node of element type.
     * 
     * @param Node node native DOM node.
     * @assert <code>node</code> argument is not undefined or null.
     * @return child elements count.
     */
    childElementCount : function (node) {
        $assert(node, "js.dom.Node#childElementCount", "Node is undefined or null.");
        return node.childElementCount;
    },

    /**
     * Test if node has children of specified type. Search for a child of specified type and return true at first
     * encountered. Returns false if no children of requested type or <code>node</code> argument is not defined or
     * null.
     * 
     * @param Node node native DOM node to test for children.
     * @param Number nodeType optional node type constant, default to Node.ELEMENT_NODE.
     * @return Boolean true if node has at least a child of specified type.
     * @assert <code>node</code> argument is not undefined or null.
     */
    hasChildren : function (node, nodeType) {
        $assert(node, "js.dom.Node#hasChildren", "Node is undefined or null.");
        if (!node) {
            return false;
        }
        return js.dom.Node.firstChild(node, nodeType || Node.ELEMENT_NODE) !== null;
    },

    /**
     * Get first descendant node element by object class. Returns first descendant node element identifiable by given
     * object class. Returns null if given <code>clazz</code> argument is not defined, null or empty.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param Object clazz class name or constructor for class to search for.
     * @return Node found native node element or null.
     * @assert both arguments are not undefined or null and <code>clazz</code> is {@link Function} or {@link String}.
     */
    getElementByClass : function (context, clazz) {
        $assert(context, "js.dom.Node#getElementByClass", "Context is undefined or null.");
        $assert(clazz, "js.dom.Node#getElementByClass", "Class is undefined or null.");
        $assert(js.lang.Types.isFunction(clazz) || js.lang.Types.isString(clazz), "js.dom.Node#getElementByClass", "Class is not function or string.");

        var className = js.lang.Types.isFunction(clazz) ? clazz.prototype.toString() : clazz;
        return js.dom.Node.querySelector(context, "[data-class='" + className + "']");
    },

    /**
     * Get the list, possible empty, of descendant node elements of given class.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param Object clazz class name or constructor for class to search for.
     * @return EList list of descendants of requested class, possible empty.
     * @assert both arguments are not undefined or null and <code>clazz</code> is {@link Function} or {@link String}.
     */
    getElementsByClass : function (context, clazz) {
        $assert(context, "js.dom.Node#getElementsByClass", "Context is undefined or null.");
        $assert(clazz, "js.dom.Node#getElementsByClass", "Class is undefined or null.");
        $assert(js.lang.Types.isFunction(clazz) || js.lang.Types.isString(clazz), "js.dom.Node#getElementsByClass", "Class is not function or string.");

        var className = js.lang.Types.isFunction(clazz) ? clazz.prototype.toString() : clazz;
        return js.dom.Node.querySelectorAll(context, "[data-class='" + className + "']");
    },

    /**
     * Get child nodes with given tag name. Returns a <em>live</em> nodes list filled with descendants of given tag.
     * Returned nodes list is empty if there is no descendant of given tag or <code>node</code> argument is not
     * defined or null.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param String tag tag name to search for.
     * @return NodeList node list, possible empty.
     * @assert both arguments are not undefined or null.
     */
    getElementsByTagName : function (context, tag) {
        $assert(context, "js.dom.Node#getElementsByTagName", "Context is undefined or null.");
        $assert(tag, "js.dom.Node#getElementsByTagName", "Tag is undefined, null or empty.");
        return context && tag ? context.getElementsByTagName(tag) : new js.dom.NodeList();
    },

    /**
     * Get elements with CSS class. Returns a list of elements possessing requested CSS class. Search is performed in a
     * given context, document or a root node. Return an empty list if <code>context</code> argument is undefined or
     * null or there is no element with requested class.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param String cssClass CSS class to search for.
     * @return NodeList list of found elements, possible empty.
     * @assert both arguments are not undefined, null or empty.
     */
    getElementsByClassName : function (context, cssClass) {
        $assert(context, "js.dom.Node#getElementsByClassName", "Context is undefined or null.");
        if (!context) {
            return new js.dom.NodeList();
        }
        $assert(cssClass, "js.dom.Node#getElementsByClassName", "CSS class is undefined, null or empty.");
        $assert(typeof context.getElementsByClassName === "function", "js.dom.Node#getElementsByClassName", "Get elements by class name not supported.");
        return context.getElementsByClassName(cssClass);
    },

    /**
     * Retrieve first node matching CSS selectors or null.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param String selectors comma separated list of selectors.
     * @return Node found node or null.
     */
    querySelector : function (context, selectors) {
        $assert(context, "js.dom.Node#querySelector", "Context is undefined or null.");
        if (!context) {
            return null;
        }
        $assert(selectors, "js.dom.Node#querySelector", "Selectors is undefined, null or empty.");
        if (!selectors) {
            return null;
        }
        $assert(typeof context.querySelector !== "undefined", "js.dom.Node#querySelector", "Unsupported query selector.");
        try {
            return context.querySelector(selectors);
        } catch (e) {
            // apparently querySelector throws exception only for syntax error on selectors
            // excerpt from MDN: Throws a SYNTAX_ERR exception if the specified group of selectors is invalid.
            $assert(false, "js.dom.Node#querySelector", "bad selectors: ", selectors);
            return null;
        }
    },

    /**
     * Retrieve all nodes matching CSS selectors, possible empty list.
     * 
     * @param Object context {@link Document} or {@link Node} used as search context,
     * @param String selectors comma separated list of selectors.
     * @return NodeList list of found nodes, possible empty.
     */
    querySelectorAll : function (context, selectors) {
        $assert(context, "js.dom.Node#querySelectorAll", "Context is undefined or null.");
        if (!context) {
            return new js.dom.NodeList();
        }
        $assert(selectors, "js.dom.Node#querySelectorAll", "Selectors is undefined, null or empty.");
        if (!selectors) {
            return new js.dom.NodeList();
        }
        $assert(typeof context.querySelectorAll !== "undefined", "js.dom.Node#querySelectorAll", "Unsupported query selector all.");
        try {
            return context.querySelectorAll(selectors);
        } catch (e) {
            // apparently querySelectorAll throws exception only for syntax error on selectors
            // excerpt from MDN: Throws a SYNTAX_ERR exception if the specified group of selectors is invalid.
            $assert(false, "js.dom.Node#querySelectorAll", "bad selectors: ", selectors);
            return new js.dom.NodeList();
        }
    },

    /**
     * Get neighbor sibling. Try to retrieve next or previous sibling of specified node type, searching in given
     * direction and starting from specified node. Starting node is considered as candidate. This means if it happens to
     * be of given type and predicate, if present, accept it then the <code>node</code> will be the returned value.
     * Returns null if <code>node</code> is undefined or null or no suitable siblings found in given direction.
     * 
     * <p>
     * If <code>predicate</code> is present is tested for every matching node and node actually accepted only if
     * predicate returns true. Predicate signature should be:
     * 
     * <pre>
     * 	Boolean predicate(Node node)
     * </pre>
     * 
     * @param Node node starting node,
     * @param Number nodeType node type constant,
     * @param String direction iteration direction, i.e. "next" or "previous",
     * @param Function predicate optional function returning a Boolean.
     * @return Node next or previous sibling of given node type or null.
     */
    _getNeighbor : function (node, nodeType, direction, predicate) {
        if (!predicate) {
            predicate = function () {
                return true;
            };
        }
        while (!!node) {
            if (node.nodeType === nodeType && predicate(node)) {
                return node;
            }
            node = node[direction + "Sibling"];
        }
        return null;
    },

    /**
     * Get node string representation.
     * 
     * @param Node node native DOM node.
     * @return String node string representation.
     */
    toString : function (node) {
        if (!node) {
            return "undefined node";
        }
        var s = node.nodeName.toLowerCase();
        if (s === "input") {
            s += ("[" + node.getAttribute("type") + "]");
        }
        return s;
    }
};

/**
 * Node's children iterator. Iterates child nodes of type {@link Node.ELEMENT_NODE}.
 * 
 * @constructor Construct {@link Node node}"s iterator.
 * 
 * @param Node node parent node.
 * @assert <code>node</code> argument is not undefined or null.
 */
js.dom.Node.Iterator = function (node) {
    $assert(node, "js.dom.Node.Iterator#Iterator", "Node is undefined or null.");

    /**
     * Current child node.
     * 
     * @type Node
     */
    this._child = js.dom.Node._getNeighbor(node ? node.firstChild : null, Node.ELEMENT_NODE, "next");
};

js.dom.Node.Iterator.prototype = {
    /**
     * Test if this iterator has more items to iterate. If this predicate returns true {@link #next()} is guaranteed to
     * return valid item.
     * 
     * @return Boolean true if there are more items to iterate.
     */
    hasNext : function () {
        return this._child !== null;
    },

    /**
     * Gets next item from this iterator and advances to the next.
     * 
     * @return Node node instance.
     */
    next : function () {
        if (this._child === null) {
            return null;
        }
        var node = this._child;
        this._child = js.dom.Node._getNeighbor(this._child.nextSibling, Node.ELEMENT_NODE, "next");
        return node;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Node.Iterator";
    }
};
$extends(js.dom.Node.Iterator, Object);
$implements(js.dom.Node.Iterator, js.lang.Iterator);

/**
 * Define Node constants, if missing.
 */
$legacy(typeof Node === "undefined", function () {
    Node = {
        ELEMENT_NODE : 1,
        ATTRIBUTE_NODE : 2,
        TEXT_NODE : 3,
        CDATA_SECTION_NODE : 4,
        ENTITY_REFERENCE_NODE : 5,
        ENTITY_NODE : 6,
        PROCESSING_INSTRUCTION_NODE : 7,
        COMMENT_NODE : 8,
        DOCUMENT_NODE : 9,
        DOCUMENT_TYPE_NODE : 10,
        DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE : 12
    };
});

/**
 * IE XML Node does not allow for augmentation so we cannot store j(s)-lib Element back reference as Node property. For
 * such condition we use a back references map that stores W3C DOM Node to j(s)-lib Element relation. Uses Node id as
 * hash code.
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Node._backRefs = {};

    js.dom.Node.setElement = function (node, el) {
        try {
            node[js.dom.Node._BACK_REF] = el;
        } catch (e) {
            var backRef = node.getAttribute("data-back-ref");
            if (!backRef) {
                backRef = js.util.ID();
                node.setAttribute("data-back-ref", backRef);
            }
            js.dom.Node._backRefs[backRef] = el;
        }
    };

    js.dom.Node.getElement = function (node) {
        var el = node[js.dom.Node._BACK_REF];
        if (typeof el !== "undefined") {
            return el;
        }
        $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Node#getElement", "Node is not element.");
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }
        var backRef = node.getAttribute("data-back-ref");
        if (!backRef) {
            return null;
        }
        el = js.dom.Node._backRefs[backRef];
        return el ? el : null;
    };

    js.dom.Node.removeBackRef = function (node) {
        if (node[js.dom.Node._BACK_REF]) {
            delete node[js.dom.Node._BACK_REF];
            return;
        }
        var backRef = node.getAttribute("data-back-ref");
        if (backRef && js.dom.Node._backRefs[backRef]) {
            delete js.dom.Node._backRefs[backRef];
        }
    };
});

/**
 * It seems IE returns comments node too when searching for wildcard tag name, i.e. "*" We need to avoid iterating over
 * comments node, n"est-ce pa?
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Node.getElementsByTagName = function (node, tag) {
        $assert(node, "js.dom.Node#getElementsByTagName", "Node is undefined or null.");
        $assert(tag, "js.dom.Node#getElementsByTagName", "Tag is undefined, null or empty.");
        if (!node || !tag) {
            return new js.dom.NodeList();
        }
        if (tag !== "*") {
            return node.getElementsByTagName(tag);
        }
        // it seems IE includes comment nodes when get elements by wild card
        var nodeList = node.getElementsByTagName("*"), result = new js.dom.NodeList();
        for (var i = 0; i < nodeList.length; i++) {
            node = nodeList.item(i);
            if (node.nodeType === Node.ELEMENT_NODE) {
                result.push(node);
            }
        }
        return nodeList;
    };
});

/**
 * IE8 does not support Node child element related methods and getter by CSS class.
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Node.firstElementChild = function (node) {
        $assert(node);
        return node ? js.dom.Node._getNeighbor(node.firstChild, Node.ELEMENT_NODE, "next") : null;
    };

    js.dom.Node.lastElementChild = function (node) {
        $assert(node, "js.dom.Node#lastElementChild", "Node is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.lastChild, Node.ELEMENT_NODE, "previous") : null;
    };

    js.dom.Node.nextElementSibling = function (node) {
        $assert(node, "js.dom.Node#nextElementSibling", "Node is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.nextSibling, Node.ELEMENT_NODE, "next") : null;
    };

    js.dom.Node.previousElementSibling = function (node) {
        $assert(node, "js.dom.Node#previousElementSibling", "Node is undefined or null.");
        return node ? js.dom.Node._getNeighbor(node.previousSibling, Node.ELEMENT_NODE, "previous") : null;
    };

    js.dom.Node.childElementCount = function (node) {
        $assert(node, "js.dom.Node#childElementCount", "Node is undefined or null.");
        var child = this.firstElementChild(node);
        var count = 0;
        while (child !== null) {
            ++count;
            child = this.nextElementSibling(child);
        }
        return count;
    };

    js.dom.Node.getElementsByClassName = function (node, cssClass) {
        $assert(node, "js.dom.Node#getElementsByClassName", "Node is undefined or null.");
        $assert(cssClass, "js.dom.Node#getElementByClassName", "CSS class is undefined, null or empty.");
        return node && cssClass ? node.querySelectorAll("." + cssClass) : new js.dom.NodeList();
    };
});
