$package("js.dom");

/**
 * Document object. This class is a simplified morph of W3C DOM Document; basically is a tree of elements with a unique
 * root. It supplies getter for root element and methods for element creation, import and searching.
 * <p>
 * All search operations are performed using depth-first algorithm, i.e. starts from root and explores as far as
 * possible along each branch before backtracking. There are basically two kinds of search: <code>getBy</code> and
 * <code>findBy</code>. First always returns an {@link js.dom.Element} or null while the second returns
 * {@link js.dom.EList}, possible empty. One can use {@link js.dom.EList#isEmpty} to check if <code>findBy</code>
 * actually found something.
 * <p>
 * A document has a {@link js.dom.template.Template} instance used to inject dynamically content into the document's
 * elements. Method {@link #inject} is used just for that.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct document object wrapping native W3C DOM document.
 * 
 * @param Document document native document.
 */
js.dom.Document = function (document) {
    $assert(this instanceof js.dom.Document, "js.dom.Document#Document", "Invoked as function.");
    $assert(document, "js.dom.Document#Document", "Undefined or null native document.");
    $assert(document.nodeType === Node.DOCUMENT_NODE, "js.dom.Document#Document", "Invalid document type #%d", document.nodeType);

    /**
     * Wrapped W3C DOM document object.
     * 
     * @type Document
     */
    this._document = document;

    /**
     * Templates processor. Used to inject values into the elements from this document.
     * 
     * @type js.dom.template.Template
     */
    this._template = js.dom.template.Template.getInstance(this);

    /**
     * Manager for DOM events triggered by this document.
     * 
     * @type js.event.DomEvents
     */
    this._domEvents = new js.event.DomEvents(this);
};

js.dom.Document.prototype = {
    /**
     * Low level access to W3C DOM Document interface.
     * 
     * @return Document wrapped native document.
     */
    getDocument : function () {
        return this._document;
    },

    /**
     * Determine if this document instance is XML, that is, not HTML document.
     * 
     * @return Boolean true if this document instance is XML.
     */
    isXML : function () {
        return false;
    },

    /**
     * Create element and set attributes. Create an element of requested tag owned by this document. Also set attributes
     * values if optional attribute name/value pairs are present; if a name/value is incomplete, i.e. odd number of
     * arguments, the last name without value is ignored. It is user code responsibility to supply attribute name and
     * value in proper order. Note that newly created element is not part of document tree until explicitly add or
     * insert it as a child to a parent. So, elements creation follows the same W3C DOM pattern: create the element then
     * add it as a child.
     * 
     * <pre>
     * var p = doc.createElement("p", "id", "paragraph-id", "title", "tooltip description");
     * body.addChild(p);
     * </pre>
     * 
     * <p>
     * Important note: if use this method to create subclasses of control MUST supply input type when calling this
     * method in order to return proper type. Otherwise generic control is returned.
     * 
     * <pre>
     * 	var checkbox = doc.createElement("input", "type", "checkbox");
     *	checkbox.check();
     * </pre>
     * 
     * @param String tag tag name for element to be created,
     * @param String... attrNameValuePairs optional pairs of attribute name followed by value.
     * @return js.dom.Element newly created element.
     * @assert <em>tag</em> argument is not undefined, null or empty and the number of <em>attrNameValuePairs</em>
     *         arguments is even.
     * @see js.dom.Element#setAttr
     */
    createElement : function (tag) {
        $assert(tag, "js.dom.Document#createElement", "Undefined, null or empty tag name.");
        $assert(arguments.length % 2 === 1, "js.dom.Document#createElement", "Invalid attributes name/value.");
        if (!tag) {
            return null;
        }
        var node = this._document.createElement(tag);
        if (arguments.length > 2) {
            var attrs = $args(arguments, 1);
            for (var i = 0, l = attrs.length - 1; i < l;) {
                node.setAttribute(attrs[i++], attrs[i++]);
            }
        }
        return this.getElement(node);
    },

    /**
     * Create element with specified class name.
     * 
     * @param String tag tag name for element to be created,
     * @param String className full qualified name for class.
     * @return js.dom.Element newly created element.
     */
    createElementForClass : function (tag, className) {
        $assert(tag, "js.dom.Document#createElementForClass", "Undefined, null or empty tag name.");
        $assert(className, "js.dom.Document#createElementForClass", "Undefined, null or empty class name.");
        if (!tag || !className) {
            return null;
        }

        var node = this._document.createElement(tag);
        js.dom.Node.setElementClassName(node, className);
        return this.getElement(node);
    },

    /**
     * Import element. Import an element that belongs to another document and return it. Note that the newly imported
     * element is not part of this document tree until explicitly appended or inserted to a parent element.
     * 
     * <pre>
     * 	var el = doc.importElement(foreignDoc.getByTag("Luke Skywalker"));
     * 	doc.getByTag("Darth Vader").addChild(el);
     * </pre>
     * 
     * Return null if element to be imported is not defined or null and just return it if already belong to this
     * document.
     * 
     * @param js.dom.Element el foreign element.
     * @return js.dom.Element newly imported element.
     * @assert element to be imported is not undefined or null and does not already belong to this document.
     */
    importElement : function (el) {
        $assert(el, "js.dom.Document#importElement", "Undefined or null foreign element.");
        if (!el) {
            return null;
        }
        $assert(!el._ownerDoc.equals(this), "js.dom.Document#importElement", "Element is not foreign.");
        if (el._ownerDoc.equals(this)) {
            return el;
        }
        return this.getElement(this._importNode(el._node));
    },

    /**
     * Utility method for foreign node importing. Create a new node into this document and deeply initialize it from
     * given foreign node. Please note that this method always perform a deep copy, that is, all foreign node
     * descendants and attributes are copied.
     * 
     * @param Node node foreign node.
     * @return Node this document node created from given foreign node.
     */
    _importNode : function (node) {
        return this._document.importNode(node, true);
    },

    /**
     * Retrieve the root of this document tree.
     * 
     * @return js.dom.Element this document root.
     */
    getRoot : function () {
        return this.getElement(this._document.documentElement);
    },

    /**
     * Get the element with specified ID. This method looks for an attribute with type ID, usually named <code>id</code>.
     * Attribute type is set at document validation using DTD or schema information. Trying to use this method on a
     * document without schema render not predictable results: there are implementations returning null but there are
     * some returning valid element.
     * 
     * @param String id element ID to look for.
     * @return js.dom.Element element with specified ID or null.
     * @assert <code>id</code> argument is not undefined, null or empty.
     */
    getById : function (id) {
        $assert(id, "js.dom.Document#getById", "ID is undefined or null.");
        var node = this._getNodeById(id);
        return node ? this.getElement(node) : null;
    },

    /**
     * Helper method for retrieving this document node identified by ID. If requested node does not exist this method
     * returns null or undefined, depending on browser implementation. Also if this document has no ID attribute
     * declaration, get node by ID support is messy: IE throws exception, Chrome and Safari return valid node whereas
     * Firefox and Opera return null.
     * 
     * @param String id the ID of desired node.
     * @return Node node identified by given <code>ID</code>.
     */
    _getNodeById : function (id) {
        return this._document.getElementById(id);
    },

    /**
     * Get descendant by object class. Returns first descendant element identifiable by given object class. Returns null
     * if given <code>clazz</code> argument is not defined, null or empty. Class not found is considered a flaw in
     * logic and throws assertion; if assertion is disabled returns null.
     * 
     * @param Object clazz class name or constructor for class to search for.
     * @return js.dom.Element found element or null.
     * @assert <code>clazz</code> argument is not undefined, null, is of proper type and requested class exists.
     */
    getByClass : function (clazz) {
        var node = js.dom.Node.getElementByClass(this._document, clazz);
        $assert(node !== null, "js.dom.Element#getByClass", "Class |%s| not found.", clazz);
        return this.getElement(node);
    },

    /**
     * Get the list, possible empty, of elements of given class.
     * 
     * @param Object clazz class name or constructor for class to search for.
     * @return EList list of elements of requested class, possible empty.
     * @assert <code>clazz</code> argument is not undefined or null and is {@link Function} or {@link String}.
     */
    findByClass : function (clazz) {
        return this.getEList(js.dom.Node.getElementsByClass(this._document, clazz));
    },

    /**
     * Get element by tag. Search entire document for elements with given tag name and return the first found. Returns
     * null if <em>tag</em> argument is undefined, null or empty or there is no element with requested tag name. Note
     * that wild card asterisk (*) matches all tags in which case root element is returned.
     * 
     * <p>
     * On XML documents tag name is case sensitive whereas in HTML is not. For consistency sake is recommended to always
     * consider tags name as case sensitive.
     * 
     * @param String tag tag name to search for.
     * @return js.dom.Element first element with specified tag or null.
     * @assert <em>tag</em> argument is not undefined, null or empty.
     */
    getByTag : function (tag) {
        return this.getElement(js.dom.Node.getElementsByTagName(this._document, tag));
    },

    /**
     * Find elements by tag. Return all elements from this document having specified tag name. Returns empty list if
     * <em>tag</em> argument is undefined, null or empty or there is no element with requested tag name. Note that
     * wild card asterisk (*) matches all tags in which case all elements are returned.
     * 
     * <p>
     * On XML documents tag name is case sensitive whereas in HTML is not. For consistency sake is recommended to always
     * consider tags name as case sensitive.
     * 
     * @param String tag tag name to search for.
     * @return js.dom.EList list of found elements, possible empty.
     * @assert <em>tag</em> argument is not undefined, null or empty.
     */
    findByTag : function (tag) {
        return this.getEList(js.dom.Node.getElementsByTagName(this._document, tag));
    },

    /**
     * Get this document element identified by formatted XPath expression. Evaluate XPath expression and return first
     * found element. Returns null if given <em>xpath</em> argument is not defined, null or empty or if XPath
     * evaluation has no result.
     * <p>
     * XPath expression <em>xpath</em> can be formatted as supported by $format pseudo-operator in which case
     * <em>args</em> arguments should be supplied.
     * 
     * @param String xpath XPath expression to evaluate,
     * @param Object... args optional arguments if <em>xpath</em> is formatted.
     * @return js.dom.Element first found element or null.
     * @assert <em>xpath</em> argument is not undefined, null or empty.
     * @note this method works only on XML documents.
     */
    getByXPath : function (xpath) {
        $assert(xpath, "js.dom.Document#getByXPath", "XPath is undefined, null or empty.");
        return this.evaluateXPathNode(this._document, $format(arguments));
    },

    /**
     * Find this document elements identified by formatted XPath expression. Evaluate XPath expression and return found
     * elements. Return empty list if given <em>xpath</em> argument is not defined, null or empty or if XPath
     * evaluation has no result.
     * <p>
     * XPath expression <em>xpath</em> can be formatted as supported by $format pseudo-operator in which case
     * <em>args</em> arguments should be supplied.
     * 
     * @param String xpath XPath expression to evaluate,
     * @param Object... args optional arguments if <em>xpath</em> is formatted.
     * @return js.dom.EList list of found elements, possible empty.
     * @assert <em>xpath</em> argument is not undefined, null or empty.
     * @note this method works only on XML documents.
     */
    findByXPath : function (xpath) {
        $assert(xpath, "js.dom.Document#findByXPath", "XPath is undefined, null or empty.");
        return this.evaluateXPathNodeList(this._document, $format(arguments));
    },

    /**
     * Get element by CSS selectors. Evaluate CSS selectors and return first found element. Multiple comma separated
     * selectors are allowed in which case every selector is tested for match in the order from list till first element
     * found. Returns null if given <em>selectors</em> argument is not defined, null or empty or CSS evaluation has no
     * results.
     * 
     * <p>
     * CSS <em>selectors</em> can be formatted as supported by $format pseudo-operator in which case <em>args</em>
     * arguments should be supplied.
     * 
     * @param String selectors CSS selectors to evaluate,
     * @param Object... args optional arguments if <em>selectors</em> is formatted.
     * @return js.dom.Element first found element or null.
     * @assert <em>selectors</em> argument is not undefined, null or empty.
     */
    getByCss : function (selectors) {
        if (arguments.length > 1) {
            selectors = $format(arguments);
        }
        return this.getElement(js.dom.Node.querySelector(this._document, selectors));
    },

    /**
     * Find elements by CSS selectors. Evaluate CSS selectors and return found elements. Multiple comma separated
     * selectors are allowed in which case every selector is tested for match in the order from list and results
     * cumulated. Returns empty list if given <em>selectors</em> argument is not defined, null or empty or CSS
     * evaluation has no results.
     * 
     * <p>
     * CSS <em>selectors</em> can be formatted as supported by $format pseudo-operator in which case <em>args</em>
     * arguments should be supplied.
     * 
     * @param String selectors CSS selectors to evaluate,
     * @param Object... args optional arguments if <em>selectors</em> is formatted.
     * @return js.dom.EList list of found elements, possible empty.
     * @assert <em>selectors</em> argument is not undefined, null or empty.
     */
    findByCss : function (selectors) {
        if (arguments.length > 1) {
            selectors = $format(arguments);
        }
        return this.getEList(js.dom.Node.querySelectorAll(this._document, selectors));
    },

    /**
     * Get element by CSS class. Retrieve first element possessing given CSS class. Returns null if given CSS class is
     * not defined, null or empty or there is no element with such CSS class.
     * 
     * @param String cssClass CSS class to search for.
     * @return js.dom.Element found element or null.
     * @assert <em>cssClass</em> argument is not undefined, null or empty.
     */
    getByCssClass : function (cssClass) {
        return this.getElement(js.dom.Node.getElementsByClassName(this._document, cssClass));
    },

    /**
     * Find elements by CSS class. Retrieve elements possessing given CSS class. Returns empty list if given CSS class
     * is not defined, null or empty or there is no element with such CSS class.
     * 
     * @param String cssClass CSS class to search for.
     * @return js.dom.EList list of found elements, possible empty.
     * @assert <em>cssClass</em> argument is not undefined, null or empty.
     */
    findByCssClass : function (cssClass) {
        return this.getEList(js.dom.Node.getElementsByClassName(this._document, cssClass));
    },

    /**
     * Get descendant by name. Returns first descendant element identifiable by given name. Returns null if there is no
     * element with given <code>name</code> argument.
     * 
     * @param String name the name of the element to look for.
     * @return js.dom.Element found element or null.
     * @assert <code>name</code> argument is not undefined, null or empty.
     */
    getByName : function (name) {
        $assert(name, "js.dom.Document#getByName", "Name is undefined, null or empty.");
        return this.getElement(js.dom.Node.querySelector(this._document, $format("[name='%s'],[data-name='%s']", name, name)));
    },

    /**
     * Find descendants by name. Returns a list of descendant elements, every one identifiable by given name. Returns
     * empty list if given <code>name</code> argument is not defined, null or empty or CSS evaluation has no results.
     * 
     * @param String name the name of the elements to look for.
     * @return js.dom.EList list of found elements, possible empty.
     * @assert <code>name</code> argument is not undefined, null or empty.
     */
    findByName : function (name) {
        $assert(name, "js.dom.Document#findByName", "Name is undefined, null or empty.");
        return this.getEList(js.dom.Node.querySelectorAll(this._document, $format("[name='%s'],[data-name='%s']", name, name)));
    },

    /**
     * Document tree string representation.
     * 
     * @return String document tree string representation.
     * @throws js.dom.DomException if serialization is not possible due to missing browser support.
     */
    serialize : function () {
        return new XMLSerializer().serializeToString(this._document);
    },

    // ------------------------------------------------------------------------
    // XPath evaluation utility methods

    /**
     * Constant for XPath result of type Node.
     */
    XPATH_NODE : 9,

    /**
     * Constant for XPath iterable collection of nodes.
     */
    XPATH_NODESET : 5,

    /**
     * Returns the element described by XPath expression in the given context node. This method delegates
     * {@link #_evaluate(Node,String,Number)}; if <code>xpath</code> expression is undefined, null or empty returns
     * null.
     * 
     * @param Node node native W3C DOM node, document or element,
     * @param String xpath XPath expression.
     * @return js.dom.Element the element described by XPath expression or null.
     * @note this method works only on XML documents.
     */
    evaluateXPathNode : function (node, xpath) {
        if (!xpath) {
            return null;
        }
        var node = this._evaluate(node, xpath, this.XPATH_NODE);
        return node ? this.getElement(node) : null;
    },

    /**
     * Returns the elements list described by XPath expression in the given context node. This method delegates
     * {@link #_evaluate(Node,String,Number)}; if <code>xpath</code> expression is undefined, null or empty returns
     * empty elements list.
     * 
     * @param Node node native W3C DOM node, document or element,
     * @param String xpath XPath expression.
     * @return js.dom.EList the elements list described by XPath expression, possible empty.
     * @note this method works only on XML documents.
     */
    evaluateXPathNodeList : function (node, xpath) {
        if (!xpath) {
            return this.getEList(null);
        }
        var xpathResult = this._evaluate(node, xpath, this.XPATH_NODESET);
        return this.getEList(xpathResult);
    },

    /**
     * Evaluate XPath expression in the context of given W3C DOM Node. DOM Node argument can be {@link Document} or
     * {@link Element} and type a numeric value standardized by W3C - see {@link #XPATH_NODE} and {@link #XPATH_NODESET}
     * constants. Returned value depends on requested type and is respectively {@link Node} or {@link NodeList}.
     * Returns null or empty node list if no element found.
     * <p>
     * Because of Internet Explorer non standard implementation HTML documents are not supported. There is assertion if
     * trying to use XPath evaluation on non XML documents. If assertions are disabled Internet Explorer rise exception
     * but all other standard compliant browsers will perform evaluation correctly.
     * 
     * @param Node node native W3C DOM node, document or element,
     * @param String xpath XPath expression,
     * @param Number type XPath result type.
     * @return Object evaluation result which can be {@link Node} or {@link NodeList}.
     * @assert this document is XML, document evaluate function exists, parameters are of right types and returned value
     *         is valid.
     * @note this method works only on XML documents.
     */
    _evaluate : function (node, xpath, type) {
        $assert(this.isXML(), "js.dom.Document#_evaluate", "XPath evaluation is working only on XML documents.");

        $assert(js.lang.Types.isFunction(this._document.evaluate), "js.dom.Document#_evaluate", "Missing XPath evaluation support.");
        $assert(node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.ELEMENT_NODE, "js.dom.Document#_evaluate", "Invalid node type #%d", node.nodeType);
        $assert(xpath, "js.dom.Document#_evaluate", "Undefined, null or empty XPath expression.");
        $assert(js.lang.Types.isNumber(type), "js.dom.Document#_evaluate", "Type argument is not a number.");

        var xpathResult = this._document.evaluate(xpath, node, null, type, null);
        $assert(xpathResult, "js.dom.Document#_evaluate", "Null or undefined XPathResult.");
        $assert(xpathResult instanceof XPathResult, "js.dom.Document#_evaluate", "Object returned by XPath evaluation is not instance of XPathResult.");
        $assert(xpathResult.resultType === type, "js.dom.Document#_evaluate", "Object returned by XPath evaluation has unexpected result type.");

        if (type === this.XPATH_NODE) {
            node = xpathResult.singleNodeValue;
            if (node === null) {
                return null;
            }
            $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Document#_evaluate", "Invalid result node type |%d|. Only NODE_ELEMENT supported.", node.nodeType);
            return node.nodeType === Node.ELEMENT_NODE ? node : null;
        }

        $assert(!xpathResult.invalidIteratorState, "js.dom.Document#evaluateXPathNodeList", "Invalid iterator state.");
        var elementsArray = [], node = xpathResult.iterateNext();
        // collect only element nodes from result; assert node type is element
        while (node !== null) {
            $assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Document#_evaluate", "Invalid result node type |%d|. Only NODE_ELEMENT supported.", node.nodeType);
            if (node.nodeType === Node.ELEMENT_NODE) {
                elementsArray.push(node);
            }
            node = xpathResult.iterateNext();
        }
        return new js.dom.NodeList(elementsArray);
    },

    // ------------------------------------------------------------------------
    // j(s)-lib extensions to Baby DOM Document interface

    /**
     * Add listeners to events triggered by this document. Uses {@link js.event.DomEvents DOM events manager} to
     * actually perform listeners registration.
     * <p>
     * This method also supports declarative events registration via events map. If supplied arguments are accepted by,
     * events registration is delegated to {@link js.event.EventsMap#handle(Object, Array)}. For declarative events
     * registration only two strict object arguments are necessary: first is <code>listeners scope</code> and the
     * second is the actual <code>events map</code>.
     * 
     * @param String type DOM event type,
     * @param Function listener event listener to register,
     * @param Object scope listener run-time scope,
     * @param Boolean... capture optional capture flag, default to false.
     * @return js.dom.Document this object.
     * @assert see assertions enforced by {@link js.event.DomEvents#addListener(String, Function, Object, Boolean)}.
     * @see #_domEvents
     */
    on : function (type, listener, scope, capture) {
        if (js.event.EventsMap.handle(this, arguments)) {
            return this;
        }

        if (typeof capture === "undefined") {
            capture = false;
        }
        this._domEvents.addListener(type, listener, scope, capture);
        return this;
    },

    /**
     * Remove event listener. Detach listener from requested DOM event type.
     * 
     * @param String type DOM event type,
     * @param Function listener event listener to remove,
     * @param Boolean... capture optional capture flag, default to false.
     * @return js.dom.Document this object.
     * @assert see assertions enforced by {@link js.event.DomEvents#removeListener(String, Function, Boolean)}.
     */
    un : function (type, listener, capture) {
        if (typeof capture === "undefined") {
            capture = false;
        }
        this._domEvents.removeListener(type, listener, capture);
        return this;
    },

    /**
     * Get the element associated to node. Returns the element bound to given node. If none found create a new
     * {@link js.dom.Element} wrapping the node then returns it. Returns null is given node is undefined or null.
     * <p>
     * Created element belongs to a class. There are standard element classes identified by node tag and type attribute,
     * e.g. for <em>input</em> of type <em>checkbox</em> uses {@link js.dom.Checkbox} class. User defined classes
     * are allowed and configured via <em>data-class</em> custom attribute.
     * 
     * <pre>
     *	&lt;select data-class="comp.prj.Select" /&gt;
     * </pre>
     * 
     * User defined classes take precedence so this factory method will use <code>comp.prj.Select</code> instead of
     * standard {@link js.dom.Select} to create above form element.
     * <p>
     * This method uses {@link js.lang.Class#forName} to actually obtain the class and note that it implements lazy
     * loading.
     * 
     * @param Node node native W3C DOM Node.
     * @return js.dom.Element element wrapping given node or null.
     */
    getElement : function (node) {
        // undocumented feat: if argument is node list extract first node
        if (js.lang.Types.isNodeList(node)) {
            node = node.item(0);
        }
        if (!node) {
            return null;
        }
        var el = js.dom.Node.getElement(node);
        if (el !== null) {
            return el;
        }

        var className = js.dom.Node.getElementClassName(node);
        if (className === null) {
            className = this._getStandardElementClassName(node);
        }
        $assert(js.lang.Types.isString(className), "js.dom.Document#getElement", "Class name |%s| is not a string.", className);

        // forName implements synchronous lazy loading so next call may block user interface
        var clazz = js.lang.Class.forName(className);
        $assert(clazz !== null, "js.dom.Document#getElement", "Undefined class |%s| for node |%s|.", className, js.dom.Node.toString(node));

        // HACK if clazz is a native class accept it without performing sanity check
        // TODO update js.lang.Types.isElement to deal with native classes
        if(/^(?:class|function (?:[A-Z]|_class))/.test(clazz)) {
        	return new clazz(this, node);
        }

        $assert(js.lang.Types.isElement(clazz), "js.dom.Document#getElement", "Element class |%s| must extend js.dom.Element.", className);
        return js.lang.Types.isElement(clazz) ? new clazz(this, node) : null;
    },

    /**
     * Create list of elements. Create a new list of elements wrapping native W3C DOM NodeList. If <em>nodeList</em>
     * argument has no items returned elist is empty. Also return an empty list if <em>nodeList</em> argument is
     * undefined or null.
     * 
     * @param NodeList nodeList native DOM nodes list.
     * @return js.dom.EList newly created elist, possible empty.
     * @assert <em>nodeList</em> argument is not undefined or null.
     */
    getEList : function (nodeList) {
        $assert(nodeList, "js.dom.Document#getEList", "Node list is undefined or null.");
        if (!nodeList) {
            nodeList = new js.dom.NodeList();
        }
        return new js.dom.EList(this, nodeList);
    },

    /**
     * Get standard element class name. Returns the name of the class suitable for element instantiation given the node
     * tag name and type attribute.
     * 
     * @param Node node native DOM node.
     * @return String standard element class name suitable for given node.
     */
    _getStandardElementClassName : function (node) {
        switch (node.nodeName.toLowerCase()) {
        case "a":
            return "js.dom.Anchor";

        case "img":
            return "js.dom.Image";

        case "form":
            return "js.dom.Form";

        case "input":
            switch (node.getAttribute("type")) {
            case "checkbox":
                return "js.dom.Checkbox";
            case "radio":
                return "js.dom.Radio";
            case "file":
                return "js.dom.FileInput";
            case "email":
                return "js.dom.Email";
            case "tel":
                return "js.dom.Phone";
            }
            // fall throw next case

        case "textarea":
            return "js.dom.Control";

        case "button":
            return "js.dom.Button";

        case "select":
        	if(node.hasAttribute("multiple")) {
        		return "js.dom.MultipleSelect";
        	}
            return "js.dom.Select";

        case "option":
            return "js.dom.Element";

        case "iframe":
            return "js.dom.IFrame";

        default:
            return "js.dom.Element";
        }
    },

    /**
     * Inject value into element denoted by given selector. This method locates selected document element then delegates
     * {@link js.dom.template.Template#injectElement}. If <code>selector</code> points to multiple elements this
     * method silently choose the first, considering depth-first order. If there is no element for given
     * <code>selector</code> this method does nothing without notice; anyway, if assertions are enabled, bad selector
     * assertion is thrown.
     * 
     * @param String selector selector used to located desired element,
     * @param Object value any primitive or aggregated value suitable for selected element.
     * @returns js.dom.Document this object.
     * @assert <code>selector</code> points to an existing element.
     */
    inject : function (selector, value) {
        var el = this.getByCss(selector);
        $assert(el !== null, "js.dom.Document#inject", "Bad selector.");
        if (el !== null) {
            this._template.injectElement(el, value);
        }
        return this;
    },

    /**
     * Test for document instances equality. Two documents are considered equals if wraps the same
     * {@link Document W3C native document}. Returns false if given argument is undefined, null or not a Document.
     * 
     * @param js.dom.Document doc document to match.
     * @return Boolean true if given document equals this one.
     * @assert given argument is not undefined or null and is a Document.
     */
    equals : function (doc) {
        $assert(doc, "js.dom.Document#equals", "Document is undefined or null.");
        $assert(doc instanceof js.dom.Document, "js.dom.Document#equals", "Bad argument type.");
        if (!(doc && doc instanceof js.dom.Document)) {
            return false;
        }
        return this._document === doc._document;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Document";
    }
};
$extends(js.dom.Document, Object);

$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Document.prototype._evaluate = function (node, xpath, type) {
        $assert(this.isXML(), "js.dom.Document#_evaluate", "XPath evaluation is working only on XML documents.");

        // select language compatibility; without it IE uses a private variant with couple differences
        this._document.setProperty("SelectionLanguage", "XPath");

        $assert(node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.ELEMENT_NODE, "js.dom.Document#_evaluate", "Invalid node type #%d", node.nodeType);
        $assert(xpath, "js.dom.Document#_evaluate", "Undefined, null or empty XPath expression.");
        $assert(js.lang.Types.isNumber(type), "js.dom.Document#_evaluate", "Type argument is not a number.");

        if (node.nodeType === Node.ELEMENT_NODE) {
            // prefix xpath expression with path to node from document root
        }

        var nodeList = node.selectNodes(xpath);
        if (type === this.XPATH_NODE) {
            return nodeList.item(0);
        }
        $assert(type === this.XPATH_NODESET, "js.dom.Document#_evaluate", "Type argument |%d| is not supported.", type);
        return nodeList;
    };

    js.dom.Document.prototype._importNode = function (foreignNode) {
        switch (foreignNode.nodeType) {
        case Node.ELEMENT_NODE:
            var node = this._document.createElement(foreignNode.nodeName);
            for (var i = 0, attr; i < foreignNode.attributes.length; ++i) {
                attr = foreignNode.attributes.item(i);
                if (attr.nodeName !== "data-back-ref") {
                    node.setAttribute(attr.nodeName, attr.value);
                }
            }
            for (i = 0; i < foreignNode.childNodes.length; ++i) {
                node.appendChild(this._importNode(foreignNode.childNodes.item(i)));
            }
            return node;

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
            return this._document.createTextNode(foreignNode.nodeValue);

        case Node.COMMENT_NODE:
            return this._document.createComment(foreignNode.nodeValue);
        }
    };

    js.dom.Document.prototype._getNodeById = function (id) {
        try {
            return this._document.getElementById(id);
        } catch (e) {
            return null;
        }
    };

    js.dom.Document.prototype.isXML = function () {
        return typeof this._document.xml !== "undefined";
    };

    js.dom.Document.prototype.serialize = function () {
        if (typeof this._document.xml !== "undefined") {
            return this._document.xml;
        }
        if (typeof this._document.html !== "undefined") {
            return this._document.html;
        }
        if (typeof XMLSerializer !== "undefined") {
            return new XMLSerializer().serializeToString(this._document);
        }
        throw new js.dom.DomException("js.dom.Document#serialize", "Missing DOM serializer support.");
    };
});

$legacy(js.ua.Engine.WEBKIT || js.ua.Engine.MOBILE_WEBKIT, function () {
    js.dom.Document.prototype.isXML = function () {
        return this._document.xmlVersion == true;
    };
});

$legacy(js.ua.Engine.GECKO, function () {
    js.dom.Document.prototype.isXML = function () {
        return this._document.contentType.indexOf("xml") !== -1;
    };
});

$legacy(js.ua.Engine.PRESTO, function () {
    js.dom.Document.prototype.isXML = function () {
        return typeof XMLDocument !== "undefined" && this._document instanceof XMLDocument;
    };
});
