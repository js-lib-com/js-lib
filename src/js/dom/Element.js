$package("js.dom");

/**
 * Document element. This class implements the element, central piece of document model. In fact a document is just a
 * tree of elements. An element have child elements and/or text and may poses attributes and {@link js.dom.Style styles}.
 * 
 * <p>
 * This class supplies methods for child nodes handling - add, replace, insert, clone and remove, navigation - first and
 * last child, next and previous sibling, searching by XPath, CSS selectors, tag name and CSS class. Also provides
 * methods for attribute, CSS classes and text handling. Finally there is support for {@link js.event.DomEvents DOM} and
 * {@link js.event.CustomEvents custom} events (de)registration and user defined data.
 * 
 * <p>
 * Navigation methods and children getter are working only on elements, text nodes are ignored. So, for example,
 * getChildren() return empty list if this element has only text. Searching is performed as described in
 * {@link js.dom.Document document object}.
 * 
 * <p>
 * Every element has a special {@link #setValue formatted value setter}. It accepts any value converted to a
 * {@link String} by this class {@link #_format formatter}. The general contract of this method is
 * <em>formatted value setter</em>. What a <em>value</em> means depends on every class; for this one value is
 * considered the element text content. A subclass can choose to consider as value an attribute by overriding value
 * setter.
 * 
 * <p>
 * Element supports five types of accessors:
 * <ol>
 * <li>s(g)etAttr - attribute value as string
 * <li>s(g)etText - text content
 * <li>s(g)etHTML - inner HTML
 * <li>s(g)etValue - formatted value
 * <li>s(g)etObject - aggregated object
 * </ol>
 * 
 * 
 * @author Iulian Rotaru
 * @constructor Construct document element. This constructor accept two mandatory and valid arguments: owner document
 * and native node to wrap. If any of them is undefined, null or not of proper type this instance construction can"t be
 * completed and exception is thrown.
 * 
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native {@link Node} instance.
 * @assert owner document argument is a not null or undefined {@link js.dom.Document}, native node is not null or
 * undefined and is of {@link Node ELEMENT_NODE} type.
 */
js.dom.Element = function(ownerDoc, node) {
	var dataCfg, pairs, value, i;

	$assert(this instanceof js.dom.Element, "js.dom.Element#Element", "Invoked as function.");
	$assert(ownerDoc, "js.dom.Element#Element", "Undefined or null owner document.");
	$assert(ownerDoc instanceof js.dom.Document, "js.dom.Element#Element", "Owner document is not an instance of js.dom.Document.");
	$assert(node, "js.dom.Element#Element", "Undefined or null node.");
	$assert(node.nodeType === Node.ELEMENT_NODE, "js.dom.Element#Element", "Invalid node type #%d", node.nodeType);

	/**
	 * Document this element belongs to.
	 * 
	 * @type js.dom.Document
	 */
	this._ownerDoc = ownerDoc;

	/**
	 * Wrapped native DOM node object. Note that wrapped node keeps a back-reference to this element.
	 * 
	 * @type Node
	 */
	this._node = node;
	js.dom.Node.setElement(node, this);

	/**
	 * This element styles.
	 * 
	 * @type js.dom.Style
	 */
	this.style = new js.dom.Style(this);

	/**
	 * Optional format instance or null. May be used by {@link #setValue} to prepare value for display on user
	 * interface. If this element is an input, format instance may be also used by {@link js.dom.Control#getValue} and
	 * {@link js.dom.Control#isValid} to parse and test input value.
	 * 
	 * @type js.format.Format
	 */
	this._format = js.format.Factory.getFormat(js.dom.Node.getFormatName(node));
	$assert(this._format === null || js.lang.Types.isObject(this._format), "js.dom.Element#Element", "Formatter is not an object.");

	/**
	 * Element configuration. Configuration data is formatted as name/value pairs separated by semicolon, like standard
	 * inline styles.
	 * 
	 * <pre>
	 * 	&lt;table data-class="js.widget.Table" data-cfg="multi-select:true;"&gt;
	 * </pre>
	 * 
	 * @type Object
	 */
	this._config = {};
	dataCfg = this.getAttr("data-cfg");
	if (dataCfg !== null) {
		pairs = js.util.Strings.parseNameValues(dataCfg);
		for (i = 0; i < pairs.length; i++) {
			value = pairs[i].value;
			if (value === "true") {
				value = true;
			}
			else if (value === "false") {
				value = false;
			}
			else if (!isNaN(value)) {
				value = Number(value);
			}
			this._config[js.util.Strings.toScriptCase(pairs[i].name)] = value;
		}
		this.removeAttr("data-cfg");
	}

	/**
	 * DOM events manager.
	 * 
	 * @type js.event.DomEvents
	 */
	this._domEvents = new js.event.DomEvents(this);

	/**
	 * Element hash code. Hash code is used when need an object key and is a string value guaranteed to be unique only
	 * on script engine session. Is not usable for object persistence between sessions.
	 * 
	 * @type String
	 */
	this._hashCode = js.util.ID();
};

js.dom.Element.prototype = {
	/**
	 * Low level access to W3C DOM Node interface.
	 * 
	 * @return Node wrapped native node.
	 */
	getNode : function() {
		return this._node;
	},

	/**
	 * Get owner document.
	 * 
	 * @return js.dom.Document this element owner document.
	 */
	getOwnerDoc : function() {
		return this._ownerDoc;
	},

	/**
	 * Add child element(s). Add child to this element children list end. If child to append is already part of document
	 * tree, i.e. it has a parent, it is first removed - in which case add becomes move. Supports a variable number of
	 * elements as arguments so is possible to add more than just one child in a single call. Child (children) to be
	 * added must belong to the same {@link js.dom.Document document} that owns this element. If not, this method
	 * performs {@link js.dom.Document#importElement} first. Note that import is always deep.
	 * 
	 * <p>
	 * If a child argument is undefined or null or is not instance of js.dom.Element this method ignores the culprit.
	 * 
	 * @param js.dom.Element... child, one or more child element(s) to be appended.
	 * @return js.dom.Element this element.
	 * @assert positive arguments count, every argument is not undefined or null and is instance of js.dom.Element.
	 */
	addChild : function() {
		$assert(arguments.length > 0, "js.dom.Element#addChild", "Missing element to add.");
		for (var i = 0, a; i < arguments.length; ++i) {
			a = arguments[i];
			$assert(a, "js.dom.Element#addChild", "Undefined or null argument.");
			if (a) {
				$assert(a instanceof js.dom.Element, "js.dom.Element#addChild", "Argument is not a js.dom.Element.");
				if (a instanceof js.dom.Element) {
					if (!this._ownerDoc.equals(a._ownerDoc)) {
						a = this._ownerDoc.importElement(a);
					}
					this._node.appendChild(a._node);
				}
			}
		}
		return this;
	},

	/**
	 * Add element as first child to this element.
	 * 
	 * @param Object children element or elist to add.
	 * @return js.dom.Element this element.
	 */
	addChildFirst : function(children) {
		$assert(children, "js.dom.Element#addChildFirst", "Undefined or null argument.");
		var firstChild = this.getFirstChild();

		if (children instanceof js.dom.Element) {
			if (firstChild !== null) {
				firstChild.insertBefore(children);
			}
			else {
				this.addChild(children);
			}
			return this;
		}

		if (children instanceof js.dom.EList) {
			var it = children.it();
			if (firstChild !== null) {
				while (it.hasNext()) {
					firstChild.insertBefore(it.next());
				}
			}
			else {
				while (it.hasNext()) {
					this.addChild(it.next());
				}
			}
			return this;
		}

		$assert(false, "js.dom.Element#addChildFirst", "Argument is not element or elist.");
		return this;
	},

	/**
	 * Replace child. Replace an existing child element with a new element. If <code>replacement</code> is part of the
	 * tree of document that own this element it is first removed. If <code>replacement</code> or
	 * <code>existing</code> are undefined or null this method does nothing. Perform
	 * {@link js.dom.Document#import import} if <code>replacement</code> does not belong to the same document. Please
	 * note that import is always deep.
	 * 
	 * @param js.dom.Element replacement element to be inserted,
	 * @param js.dom.Element existing existing child to be replaced.
	 * @return js.dom.Element this object.
	 * @assert both arguments are not undefined or null.
	 */
	replaceChild : function(replacement, existing) {
		$assert(replacement, "js.dom.Element#replaceChild", "Replacement element is undefined or null.");
		$assert(existing, "js.dom.Element#replaceChild", "Existing element is undefined or null.");
		if (replacement && existing) {
			if (!replacement._ownerDoc.equals(this._ownerDoc)) {
				replacement = this._ownerDoc.importElement(replacement);
			}
			this._node.replaceChild(replacement._node, existing._node);
		}
		return this;
	},

	/**
	 * Insert element. Insert element before this one, that is, inserted element becomes previous sibling. If inserted
	 * element already exist in owning document it is first removed. Perform {@link js.dom.Document#import import} if
	 * element to insert does not belong to the same document. Please note that import is always deep.
	 * 
	 * @param js.dom.Element el child element to be inserted
	 * @return js.dom.Element this element.
	 * @assert element to insert is not undefined or null and this element has a parent.
	 */
	insertBefore : function(el) {
		$assert(el, "js.dom.Element#insertBefore", "Element to insert is undefined or null.");
		if (el) {
			if (!el._ownerDoc.equals(this._ownerDoc)) {
				el = this._ownerDoc.importElement(el);
			}
			$assert(this._node.parentNode, "js.dom.Element#insertBefore", "This element has no parent.");
			if (this._node.parentNode) {
				this._node.parentNode.insertBefore(el._node, this._node);
			}
		}
		return this;
	},

	/**
	 * Clone this element. If deep flag is true clone this element descendants too, otherwise a shallow copy is
	 * performed. Returned clone has the same owning document but is not part of document tree till explicitly inserted.
	 * Note that source node, i.e. this node, registered events are not cloned. Event listeners must be attached to the
	 * newly created Element afterwards, if so desired. Finally, source user defined data is not cloned, even if deep
	 * cloning.
	 * 
	 * @param Boolean deep optional deep cloning flag, default to false.
	 * @return js.dom.Element the clone.
	 * @assert <code>deep</code> flag, if present, should be {@link js.lang.Types#isBoolean boolean}.
	 */
	clone : function(deep) {
		$assert(typeof deep === "undefined" || js.lang.Types.isBoolean(deep), "js.dom.Element#clone", "Deep flag is not boolean.");
		return this._ownerDoc.getElement(this._node.cloneNode(deep === true));
	},

	/**
	 * Replace this element with replacement. If <code>replacement</code> is part of the tree of document that own
	 * this element, removed it first. Perform {@link js.dom.Document#importElement import} if <code>replacement</code>
	 * does not belong to the same document. Please note that import is always deep.
	 * 
	 * @param js.dom.Element replacement element to replace this one.
	 * @assert replacement element is not undefined or null and this element has a parent.
	 */
	replace : function(replacement) {
		$assert(replacement, "js.dom.Element#replace", "Replacement element is undefined or null.");
		if (replacement) {
			if (!replacement._ownerDoc.equals(this._ownerDoc)) {
				replacement = this._ownerDoc.importElement(replacement);
			}
			$assert(this._node.parentNode, "js.dom.Element#replace", "This element have not a parent.");
			if (this._node.parentNode) {
				this._node.parentNode.replaceChild(replacement._node, this._node);
			}
		}
	},

	/**
	 * Self-remove. Remote itself from owner document tree ensuring all children back-references and event listener are
	 * deleted. Anyway, if optional <code>clear</code> flag is false clean-up is not performed.
	 * 
	 * @param Boolean... clear optional flag, default to true.
	 * @return js.dom.Element this object, but only if <code>clear</code> is false. Otherwise returns void since this
	 * element is not reusable once clean-up performed.
	 * @assert <code>clear</code> argument is strictly false, if present.
	 */
	remove : function(clear) {
		$assert(typeof clear === "undefined" || clear === false, "js.dom.Element#remove", "Clear flag is not false.");
		if (clear === false) {
			this._node.parentNode.removeChild(this._node);
			return this;
		}
		var tmpNodeRef = this._node;
		tmpNodeRef.parentNode.removeChild(tmpNodeRef);
		this._clean(this._node);
	},

	/**
	 * Remove all children. Traverse all this element children and execute remove with clean-up on each.
	 * 
	 * @return js.dom.Element this object.
	 */
	removeChildren : function() {
		var child, removed;
		while ((child = this._node.firstChild) !== null) {
			removed = false;
			if (child.nodeType === Node.ELEMENT_NODE) {
				var el = js.dom.Node.getElement(child);
				if (el !== null) {
					el.remove();
					removed = true;
				}
			}
			if (!removed) {
				this._node.removeChild(child);
			}
			child = this._node.firstChild;
		}
		return this;
	},

	/**
	 * Get this element index, relative to its parent children list.
	 * 
	 * @return this element index.
	 */
	getChildIndex : function() {
		return Array.prototype.indexOf.call(this._node.parentNode.children, this._node);
	},

	/**
	 * Return child accepted by given predicate or null if not found. Predicate function should have a single argument,
	 * that is, the child element, and return true if that child is accepted. Returns null if not child accepted or this
	 * element has no child at all.
	 * 
	 * @param Function predicate predicate executed for every child till return true,
	 * @param Object scope... optional predicate runtime scope, default to global object.
	 * @return child element or null if not found.
	 */
	findChild : function(predicate, scope) {
		scope = scope || window;
		var children = this.getChildren();
		for (var i = 0; i < children.size(); ++i) {
			if (predicate.call(scope, children.item(i))) {
				return children.item(i);
			}
		}
		return null;
	},

	/**
	 * Get child element by index. This getter is especially useful for child elements of the same type, e.g.
	 * <code>li</code> but there is no formal restriction on using with any types.
	 * 
	 * @param Number index index value.
	 * @return js.dom.Element child element from index.
	 * @assert <code>index</code> argument is in range.
	 */
	getByIndex : function(index) {
		var children = this._node.children;
		$assert(0 <= index && index < children.length, "js.dom.Element#getByIndex", "Index argument out of range.");
		return this._ownerDoc.getElement(children[index]);
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
	getByClass : function(clazz) {
		var node = js.dom.Node.getElementByClass(this._node, clazz);
		$assert(node !== null, "js.dom.Element#getByClass", "Class |%s| not found.", clazz);
		return this._ownerDoc.getElement(node);
	},

	/**
	 * Get this element descendant identified by XPath expression. Evaluate XPath expression and return first found
	 * descendant; please note that if given XPath expression is relative to entire document returned element is not
	 * necessarily this element descendant. Returns null if given <code>xpath</code> is not defined, null or empty or
	 * if XPath evaluation has no result.
	 * <p>
	 * XPath expression <code>xpath</code> can be formatted as supported by $format pseudo-operator in which case
	 * <code>args</code> arguments should be supplied.
	 * 
	 * @param String xpath XPath expression to evaluate,
	 * @param Object... args optional arguments if <code>xpath</code> is formatted.
	 * @return js.dom.Element first found descendant or null.
	 * @assert <code>xpath</code> argument is not undefined, null or empty.
	 * @note this method works only on XML documents.
	 */
	getByXPath : function(xpath) {
		$assert(xpath, "js.dom.Element#getByXPath", "XPath expression is undefined, null or empty.");
		return this._ownerDoc.evaluateXPathNode(this._node, $format(arguments));
	},

	/**
	 * Find this element descendants identified by XPath expression. Evaluate XPath expression and return found
	 * descendants; please note that if given XPath expression is relative to entire document returned elements are not
	 * necessarily this element descendants. Return empty list if given <code>xpath</code> is not defined, null or
	 * empty or if XPath evaluation has no result.
	 * <p>
	 * XPath expression <code>xpath</code> can be formatted as supported by $format pseudo-operator in which case
	 * <code>args</code> arguments should be supplied.
	 * 
	 * @param String xpath XPath expression to evaluate,
	 * @param Object... args optional arguments if <code>xpath</code> is formatted.
	 * @return js.dom.EList list of found descendants, possible empty.
	 * @assert <code>xpath</code> argument is not undefined, null or empty.
	 * @note this method works only on XML documents.
	 */
	findByXPath : function(xpath) {
		$assert(xpath, "js.dom.Element#findByXPath", "XPath expression is undefined, null or empty.");
		return this._ownerDoc.evaluateXPathNodeList(this._node, $format(arguments));
	},

	/**
	 * Get descendant by CSS selectors. Returns first descendant element identifiable by given CSS selector. Multiple
	 * comma separated selectors are allowed in which case every selector is tested for match in the order from list
	 * till first element found. Returns null if given <code>selectors</code> argument is not defined, null or empty
	 * or CSS evaluation has no results.
	 * <p>
	 * Selectors argument can be formatted as supported by $format pseudo-operator in which case optional arguments
	 * should be supplied.
	 * 
	 * @param String selectors CSS selectors to evaluate,
	 * @param Object... args optional arguments if <code>selectors</code> is formatted.
	 * @return js.dom.Element found element or null.
	 * @assert <code>selectors</code> argument is not undefined, null or empty.
	 */
	getByCss : function(selectors) {
		$assert(selectors, "js.dom.Element#getByCss", "CSS selectors is undefined, null or empty.");
		return this._ownerDoc.getElement(js.dom.Node.querySelector(this._node, $format(arguments)));
	},

	/**
	 * Find descendants by CSS selectors. Returns a list of descendant elements, every one identifiable by given CSS
	 * selector. Multiple comma separated selectors are allowed in which case every selector is tested for match in the
	 * order from list and results merged. Returns empty list if given <code>selectors</code> argument is not defined,
	 * null or empty or CSS evaluation has no results.
	 * <p>
	 * Selectors argument can be formatted as supported by $format pseudo-operator in which case optional arguments
	 * should be supplied.
	 * 
	 * @param String selectors CSS selectors to evaluate,
	 * @param Object... args optional arguments if selectors is formatted.
	 * @return js.dom.EList list of found elements, possible empty.
	 * @assert <code>selectors</code> argument is not undefined, null or empty.
	 */
	findByCss : function(selectors) {
		$assert(selectors, "js.dom.Element#findByCss", "CSS selectors is undefined, null or empty.");
		return this._ownerDoc.getEList(js.dom.Node.querySelectorAll(this._node, $format(arguments)));
	},

	/**
	 * Get descendant by tag. Search for descendants with given tag name and return the first found. Returns null if
	 * there is no descendant with desired tag name or if <code>tag</code> argument is not defined, null or empty.
	 * <p>
	 * On XML documents tag name is case sensitive whereas in HTML is not. For consistency sake is recommended to always
	 * consider tags name as case sensitive.
	 * 
	 * @param String tag tag name to search for.
	 * @return js.dom.Element first descendant with specified tag name or null.
	 * @assert <code>tag</code> argument is not undefined, null or empty.
	 */
	getByTag : function(tag) {
		$assert(tag, "js.dom.Element#getByTag", "Tag name is undefined, null or empty.");
		return this._ownerDoc.getElement(js.dom.Node.getElementsByTagName(this._node, tag));
	},

	/**
	 * Find descendants by tag. Return a {@link js.dom.EList list} of descendant elements with given tag name. If no
	 * descendant found or if <code>tag</code> argument is not defined, null or empty returned list is empty.
	 * <p>
	 * On XML documents tag name is case sensitive whereas in HTML is not. For consistency sake is recommended to always
	 * consider tags name as case sensitive.
	 * 
	 * @param String tag tag name to search for.
	 * @return js.dom.EList list of descendants with specified tag, possible empty.
	 * @assert <code>tag</code> argument is not undefined, null or empty.
	 */
	findByTag : function(tag) {
		$assert(tag, "js.dom.Element#findByTag", "Tag name is undefined, null or empty.");
		return this._ownerDoc.getEList(js.dom.Node.getElementsByTagName(this._node, tag));
	},

	/**
	 * Get descendant by CSS class. Search for descendants with given CSS class and return the first found. Returns null
	 * if there is no descendant with desired CSS class or if <code>cssClass</code> argument is not defined, null or
	 * empty.
	 * 
	 * @param String cssClass CSS class to search for.
	 * @return js.dom.Element first descendant element with specified CSS class or null.
	 * @assert <code>cssClass</code> is not undefined, null or empty.
	 * @note to avoid confusion with language class reserved word, throughout j(s)-lib, element <em>class attribute</em>
	 * is named CSS class.
	 */
	getByCssClass : function(cssClass) {
		$assert(cssClass, "js.dom.Element#getByCssClass", "CSS class is undefined, null or empty.");
		return this._ownerDoc.getElement(js.dom.Node.getElementsByClassName(this._node, cssClass));
	},

	/**
	 * Find descendants by CSS class. Searches all this element descendants and returns those possessing given CSS
	 * class. Returns empty list if there is no descendant with desired CSS class or if <code>cssClass</code> argument
	 * is not defined, null or empty.
	 * 
	 * @param String cssClass CSS class to search for.
	 * @return js.dom.EList a list of descendants with specified class, possible empty.
	 * @assert <code>cssClass</code> is not undefined, null or empty.
	 * @note to avoid confusion with language class reserved word, throughout j(s)-lib, element <em>class attribute</em>
	 * is named CSS class.
	 */
	findByCssClass : function(cssClass) {
		$assert(cssClass, "js.dom.Element#findByCssClass", "CSS class is undefined, null or empty.");
		return this._ownerDoc.getEList(js.dom.Node.getElementsByClassName(this._node, cssClass));
	},

	/**
	 * Get descendant by name. Returns first descendant element identifiable by given name. Returns null if there is no
	 * element with given <code>name</code> argument.
	 * 
	 * @param String name the name of the element to look for.
	 * @return js.dom.Element found element or null.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	getByName : function(name) {
		$assert(name, "js.dom.Element#getByName", "Name is undefined, null or empty.");
		return this._ownerDoc.getElement(js.dom.Node.querySelector(this._node, $format("[name='%s'],[data-name='%s']", name, name)));
	},

	/**
	 * Find descendants by name. Returns a list of descendant elements, every one identifiable by given name. Returns
	 * empty list if given <code>name</code> argument is not defined, null or empty or CSS evaluation has no results.
	 * 
	 * @param String name the name of the elements to look for.
	 * @return js.dom.EList list of found elements, possible empty.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	findByName : function(name) {
		$assert(name, "js.dom.Element#findByName", "Name is undefined, null or empty.");
		return this._ownerDoc.getEList(js.dom.Node.querySelectorAll(this._node, $format("[name='%s'],[data-name='%s']", name, name)));
	},

	/**
	 * Get this element parent. Return null if this element has no parent element. Note that <code>parentNode</code>
	 * property of underlying node can be document or document fragment in which case this method still return null.
	 * 
	 * @return js.dom.Element this element parent.
	 */
	getParent : function() {
		if (this._node.parentNode === null) {
			return null;
		}
		return this._node.parentNode.nodeType === Node.ELEMENT_NODE ? this._ownerDoc.getElement(this._node.parentNode) : null;
	},

	/**
	 * Get this element ancestor of given tag. Walk up through ancestor hierarchy till found one with specified tag.
	 * Returns null if none found.
	 * 
	 * @param String tag ancestor tag name.
	 * @return js.dom.Element ancestor of given tag or null.
	 */
	getParentByTag : function(tag) {
		var el = this;
		while (el.getTag() !== tag) {
			el = el.getParent();
			if (el === null) {
				return null;
			}
		}
		return el;
	},

	/**
	 * Get this element ancestor possessing requested CSS class. Walk up through ancestor hierarchy till found one
	 * possessing specified CSS class. Returns null if none found.
	 * 
	 * @param String cssClass ancestor CSS class.
	 * @return js.dom.Element ancestor of given CSS class or null.
	 */
	getParentByCssClass : function(cssClass) {
		var el = this;
		while (!el.hasCssClass(cssClass)) {
			el = el.getParent();
			if (el === null) {
				return null;
			}
		}
		return el;
	},

	/**
	 * Get child elements. Note this method returns a list of element objects, text nodes are not included. Return empty
	 * list if this element has only text.
	 * 
	 * @return js.dom.EList list of child elements, possible empty.
	 */
	getChildren : function() {
		return this._ownerDoc.getEList(this._node.children);
	},

	/**
	 * Get the number of direct child elements. Returned value does not count text nodes.
	 * 
	 * @returns children count.
	 */
	getChildrenCount : function() {
		return this._node.childElementCount;
	},

	/**
	 * Test for child elements presence. Return true if this element has child elements. Note that text nodes are not
	 * counted, so return false if this element has only text.
	 * 
	 * @return Boolean true only if this element has at least one child element.
	 */
	hasChildren : function() {
		return js.dom.Node.firstElementChild(this._node) !== null;
	},

	/**
	 * Get first child element. Return first child element but does not consider text nodes. If this element has only
	 * text returns null.
	 * 
	 * @return js.dom.Element first child element or null.
	 */
	getFirstChild : function() {
		return this._ownerDoc.getElement(js.dom.Node.firstElementChild(this._node));
	},

	/**
	 * Get last child element. Return last child element but does not consider text nodes. If this element has only text
	 * returns null.
	 * 
	 * @return js.dom.Element last child element or null.
	 */
	getLastChild : function() {
		return this._ownerDoc.getElement(js.dom.Node.lastElementChild(this._node));
	},

	/**
	 * Get previous sibling element. Return previous sibling element but does not count text nodes.
	 * 
	 * @return js.dom.Element previous sibling element or null.
	 */
	getPreviousSibling : function() {
		return this._ownerDoc.getElement(js.dom.Node.previousElementSibling(this._node));
	},

	/**
	 * Get next sibling element or null. Return next sibling element but does not count text nodes.
	 * 
	 * @return js.dom.Element next sibling element or null.
	 */
	getNextSibling : function() {
		return this._ownerDoc.getElement(js.dom.Node.nextElementSibling(this._node));
	},

	/**
	 * Get lower case tag name. Return this element tag name, also known as node name.
	 * 
	 * @return String this element tag name.
	 */
	getTag : function() {
		return this._node.tagName.toLowerCase();
	},

	/**
	 * Get this element name or null if name attribute not set. This getter supports both standard <code>name</code>
	 * 
	 * @return String this control name, possible null.
	 */
	getName : function() {
		var name = this.getAttr("name");
		if (name === null) {
			name = this.getAttr("data-name");
		}
		return name;
	},

	/**
	 * Set attribute(s). Set one or more attribute(s) values to this element. Arguments are supplied as name/value
	 * string pairs. It is the user code responsibility to supply names and values in the proper order. If the number of
	 * arguments is odd last name/value pair is ignored, being incomplete. If no name/value pair supplied - arguments
	 * count less than 2, this method does nothing.
	 * 
	 * @param String... nameValuePairs variable numbers of name/value pairs.
	 * @return js.dom.Element this object.
	 * @assert the number of arguments is even, greater or equals 2.
	 */
	setAttr : function() {
		$assert(arguments.length >= 2, "js.dom.Element#setAttr", "Missing attribute name and/or value.");
		$assert(arguments.length % 2 === 0, "js.dom.Element#setAttr", "Odd number of arguments.");
		if (arguments.length > 2) {
			for (var i = 0, l = arguments.length - 1; i < l;) {
				this.setAttr(arguments[i++], arguments[i++]);
			}
		}
		else if (arguments.length === 2) {
			$assert(js.lang.Types.isString(arguments[0]), "js.dom.Element#setAttr", "Attribute name is not a string.");
			$assert(js.lang.Types.isString(arguments[1]), "js.dom.Element#setAttr", "Attribute value is not a string.");
			this._node.setAttribute(arguments[0], arguments[1]);
		}
		return this;
	},

	/**
	 * Get attribute value. Return named attribute value as string, possible empty. If attribute with given name does
	 * not exist or <code>name</code> argument is undefined, null or empty this method returns null.
	 * 
	 * @param String name attribute name of which value to retrieve.
	 * @return String requested attribute value or null.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	getAttr : function(name) {
		$assert(name, "js.dom.Element#getAttr", "Attribute name is undefined, null or empty.");
		if (this._node.attributes.length > 0) {
			var attr = this._node.attributes.getNamedItem(name);
			if (attr !== null) {
				return attr.value;
			}
		}
		return null;
	},

	/**
	 * Remove attribute. If named attribute does not exist this method does nothing. If a default value for the removed
	 * attribute is defined in the DTD, a new attribute immediately appears with the default value.
	 * 
	 * @param String name the name of attribute to be removed,
	 * @return js.dom.Element this object.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	removeAttr : function(name) {
		$assert(name, "js.dom.Element#removeAttr", "Attribute name is undefined, null or empty.");
		if (name) {
			this._node.removeAttribute(name);
		}
		return this;
	},

	/**
	 * Test for attribute presence. Return true if this element has an attribute with specified name. This does not
	 * necessarily means that attribute should have a value. It can still contains empty strings.
	 * 
	 * @param String name the name of attribute.
	 * @return Boolean true if attribute is present.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	hasAttr : function(name) {
		if (this._node.attributes.length === 0) {
			return false;
		}
		$assert(name, "js.dom.Element#hasAttr", "Attribute name is undefined, null or empty.");
		return this._node.attributes.getNamedItem(name) !== null;
	},

	/**
	 * Add text. Create a text node and append it at this element children list end. If given text is undefined, null or
	 * empty this method does nothing. If text is not a string uses {@link Object#toString} to convert it.
	 * 
	 * @param String text text to add.
	 * @return js.dom.Element this object.
	 * @assert <code>text</code> argument is not undefined or null and is a non-empty {@link String}.
	 */
	addText : function(text) {
		$assert(text, "js.dom.Element#addText", "Text is undefined, null or empty.");
		if (text) {
			// W3C DOM Document interface mandates string for createTextNode argument
			if (!js.lang.Types.isString(text)) {
				text = text.toString();
			}
			this._node.appendChild(this._ownerDoc._document.createTextNode(text));
		}
		return this;
	},

	/**
	 * Set text. Replace this element text with given one. If this element has no text yet, create a new text node with
	 * given content and append it. If this element has its text scattered among many text nodes replace all of them
	 * with a single one and set its text. Be aware this method is a setter; all this element text, if any, will be
	 * replaced by given text. If given text is not a string uses {@link Object#toString} to convert it. Finally, if
	 * text is null or empty this method delegates {@link #removeText}.
	 * <p>
	 * Note that this method operates only on owned text, child elements text is not affected. So, in below example,
	 * emphasized text is not changed.
	 * 
	 * <pre>Some &lt;em&gt;emphasized&lt;/em&gt; text.</pre>
	 * 
	 * If in need to handle text with format one can use {@link #setHTML} instead.
	 * 
	 * @param String text text to set.
	 * @return js.dom.Element this element.
	 * @assert <code>text</code> argument is not undefined.
	 */
	setText : function(text) {
		$assert(typeof text !== "undefined", "js.dom.Element#setText", "Text argument is undefined.");

		// refrain to use if(!text) {...} since number 0 is included too
		if (!(typeof text !== "undefined" && text !== null && text !== "")) {
			return this.removeText();
		}
		if (!js.lang.Types.isString(text)) {
			text = text.toString();
		}

		// W3C DOM Text node interface requires text escaping and this method relies on user agent for that matter.

		// remove all text nodes but the first
		var textNode = this.removeText(true);
		if (textNode === null) {
			this._node.appendChild(this._ownerDoc._document.createTextNode(text));
		}
		else {
			textNode.nodeValue = text;
		}
		return this;
	},

	/**
	 * Get text. Return this element direct text but do not include child elements. If this element has no text returns
	 * an empty string.
	 * 
	 * @return String this element text, possible empty.
	 */
	getText : function() {
		var text = "";
		var nodelist = this._node.childNodes;
		for (var i = 0; i < nodelist.length; i++) {
			var node = nodelist.item(i);
			if (node.nodeType === Node.TEXT_NODE) {
				text += node.nodeValue;
			}
		}
		return text;
	},

	/**
	 * Remove text. Remove this element text; after this method execution {@link #getText} returns an empty string. Note
	 * that this method operates only on owned text, child elements text is not touched.
	 * 
	 * @return js.dom.Element this object.
	 */
	removeText : function() {
		// skip first text node, that is, remove all text nodes but first
		// this undocumented flag is for library internal use only
		var first = false, firstTextNode = null;
		if (arguments[0] === true) {
			first = true;
		}

		var nodelist = this._node.childNodes;
		for (var i = 0; i < nodelist.length; ++i) {
			var node = nodelist.item(i);
			if (node.nodeType === Node.TEXT_NODE) {
				if (first) {
					firstTextNode = node;
				}
				else {
					this._node.removeChild(node);
					--i;
				}
				first = false;
			}
		}
		// if used internally by library returns first text node found, may be null
		return arguments[0] === true ? firstTextNode : this;
	},

	/**
	 * Add CSS class. This method adds a new CSS class to this element; if class already exists just ignore it. If
	 * optional <code>enabled</code> flag is supplied and if is false this method behaves like {@link #removeCssClass}.
	 * This is handy indeed when in need to add or remove a CSS class based on an expression value, see below. Of
	 * course, in absence of optional argument this method does what his name suggest.
	 * 
	 * <pre>
	 *  // classic approach
	 *  if(value < lowWaterMark) {
	 *      el.addCssClass("low-water");
	 *  }
	 *  else {
	 *      el.removeCssClass("low-water");
	 *  }
	 *  
	 *  // add CSS class with enabled flag; same result as above verbose solution
	 *  el.addCssClass("low-water", value < lowWaterMark);
	 * </pre>
	 * 
	 * @param String cssClass, CSS class to be added,
	 * @param Boolean... enabled optional enabled, default to true.
	 * @return js.dom.Element this object.
	 * @assert <code>cssClass</code> argument is not undefined, null or empty.
	 */
	addCssClass : function(cssClass, enabled) {
		$assert(cssClass, "js.dom.Element#addCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			if (typeof enabled === "undefined") {
				enabled = true;
			}
			if (enabled) {
				this._node.classList.add(cssClass);
			}
			else {
				this._node.classList.remove(cssClass);
			}
		}
		return this;
	},

	/**
	 * Remove CSS class. This method removes given class from this element. If requested class is missing, null or empty
	 * this method does nothing.
	 * 
	 * @param String cssClass class to be removed.
	 * @return js.dom.Element this object.
	 * @assert <code>cssClass</code> argument is not undefined, null or empty.
	 */
	removeCssClass : function(cssClass) {
		$assert(cssClass, "js.dom.Element#removeCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			this._node.classList.remove(cssClass);
		}
		return this;
	},

	/**
	 * Toggle CSS class. This method add requested class if it is not present and remove it if already existing. If
	 * required CSS class argument is undefined, null or empty this method does nothing.
	 * 
	 * @param String cssClass class to be added or removed.
	 * @return js.dom.Element this object.
	 * @assert <code>cssClass</code> argument is not undefined, null or empty.
	 */
	toggleCssClass : function(cssClass) {
		$assert(cssClass, "js.dom.Element#toggleCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			this._node.classList.toggle(cssClass);
		}
		return this;
	},

	/**
	 * Test for CSS class presence. This method check if this element possesses specified CSS class. If argument is not
	 * supplied, null or empty this method returns false.
	 * 
	 * @param String cssClass CSS class to be tested.
	 * @return Boolean true if this element has specified class.
	 * @assert <code>cssClass</code> argument is not undefined, null or empty.
	 */
	hasCssClass : function(cssClass) {
		$assert(cssClass, "js.dom.Element#hasCssClass", "CSS class is undefined, null or empty.");
		if (!cssClass) {
			return false;
		}
		return this._node.classList.contains(cssClass);
	},

	/**
	 * Scroll this element so that to become visible into its parent container. Scrolling is always animated, that is,
	 * has <code>behavior</code> set to smooth.
	 */
	scrollIntoView : function() {
		this._node.scrollIntoView({
			behavior : "smooth"
		});
	},

	// ------------------------------------------------------------------------

	/**
	 * Set this element formatted value. The general contract of this method is <em>formatted value setter</em>. What
	 * a <code>value</code> means depends on every class; for this one value is considered the element text content,
	 * this method actually delegating {@link #setText}. Also note that, usually, value is a primitive but can also be
	 * an aggregate as time this class {@link #_format formatter} is able to convert it to a {@link String}. If given
	 * value is undefined this method does nothing and if null delegates {@link #removeText}. If this element has no
	 * formatter given <code>value</code> is used as it is.
	 * 
	 * @param Object value primitive or aggregated value suitable for this element.
	 * @return js.dom.Element this object pointer.
	 * @assert value argument is not undefined, is a primitive or supported by this class formatter and this element has
	 * no child.
	 * @see js.dom.Element#getValue
	 */
	setValue : function(value) {
		$assert(typeof value !== "undefined", "js.dom.Element#setValue", "Value is undefined.");
		$assert(!this.hasChildren(), "js.dom.Element#setValue", "Unsupported state: this element has children.");

		if (typeof value === "undefined") {
			return this;
		}
		if (value === null) {
			return this.removeText();
		}

		if (this._format !== null) {
			value = this._format.format(value);
		}
		$assert(js.lang.Types.isPrimitive(value), "js.dom.Element#setValue", "Expected primitive but got %s.", value);
		return this.setText(value);
	},

	/**
	 * Get this element formatted value. Retrieve this element value as {@link String} but if this class has a
	 * {@link #_format formatter} use it to convert string to whatever value type. This method consider as value element
	 * text content and use {@link #getText} to get it; of course subclass can change that.
	 * 
	 * @return Object formatted value.
	 * @assert this element has no child.
	 * @see js.dom.Element#setValue
	 */
	getValue : function() {
		$assert(!this.hasChildren(), "js.dom.Element#getValue", "Unsupported state: this element has children.");
		var v = this.getText();
		return this._format !== null ? this._format.parse(v) : v.length > 0 ? v : null;
	},

	/**
	 * Templates engine value setter. This object setter is the primary means for integrating user defined types with
	 * templates engine. Templates engine will pass control to this method and do not process any of this element
	 * descendants; therefore it is this method responsibility to update user interface. But be warned: to not dare to
	 * call $super. It will create a circular dependency because this method internally uses templates engine to
	 * {@link js.dom.template.Template#injectElement injectElement} given object value.
	 * <p>
	 * This method argument is constrained to aggregated values but subclasses are free to use any value type. Although
	 * this method is designed for templates engine integration there is no restriction in using it as general use
	 * setter, explicitly invoked by user code.
	 * 
	 * @param Object value non primitive value, be it {@link Object} or {@link Array}.
	 * @return js.dom.Element this object.
	 * @assert this method is not called by subclass via $super.
	 * @assert given argument is not primitive value and this element has children.
	 */
	setObject : function(value) {
		$assert(!arguments.callee.__super_call__, "js.dom.Element#setObject", "$super call on setObject from subclass is not allowed! It creates circular dependencies.");
		$assert(!js.lang.Types.isPrimitive(value), "js.dom.Element#setObject", "Primitive value not supported.");
		$assert(js.lang.Types.isArray(value) || this.hasChildren(), "js.dom.Element#setObject", "Unsupported state: this element has no child.");
		this._ownerDoc._template.injectElement(this, value);
		return this;
	},

	resetObject : function() {
		this._ownerDoc._template.reset(this);
		return this;
	},

	/**
	 * Add inner HTML. Add given HTML fragment at the end of current existing inner HTML, that is create and append
	 * elements denoted by argument. If <code>html</code> argument is undefined, null or empty this method is NOP.
	 * 
	 * @param String html HTML fragment.
	 * @return js.dom.Element this object.
	 * @assert HTML fragment is not undefined, null or empty.
	 */
	addHTML : function(html) {
		$assert(html, "js.dom.Element#setHTML", "HTML fragment is undefined, null or empty.");
		if (html) {
			var range = this._ownerDoc.getDocument().createRange();
			range.selectNode(this._node);
			var fragment = range.createContextualFragment(html);
			this._node.appendChild(fragment);
		}
		return this;
	},

	/**
	 * Set inner HTML. Set this element inner HTML but first remove all children, to ensure properly cleanup. If
	 * <code>html</code> argument is undefined, null or empty this method just remove children.
	 * 
	 * @param String html HTML fragment.
	 * @return js.dom.Element this object.
	 * @assert HTML fragment is not undefined, null or empty.
	 */
	setHTML : function(html) {
		$assert(html, "js.dom.Element#setHTML", "HTML fragment is undefined, null or empty.");
		// ensure all children are properly clean-up before set new HTML content
		this.removeChildren();
		if (html) {
			this._node.innerHTML = html;
		}
		return this;
	},

	/**
	 * Get inner HTML. Return this element inner HTML. If this element has no children returns empty string.
	 * 
	 * @return String this element inner HTML, possible empty.
	 */
	getHTML : function() {
		return this._node.innerHTML;
	},

	/**
	 * Set focus on this element.
	 * 
	 * @return js.dom.Element this pointer.
	 */
	focus : function() {
		this._node.focus();
		return this;
	},

	/**
	 * Add listeners to events fired by this element. Attach event listener to requested event type. If event type is a
	 * custom one delegates {@link js.event.CustomEvents} otherwise it should be a predefined DOM event and uses
	 * {@link js.event.DomEvents} to register the listener. Note that custom event is tested first, so if user override
	 * a predefined DOM event type custom event has priority.
	 * <p>
	 * This method also supports declarative events registration via events map. If supplied arguments are accepted by,
	 * events registration is delegated to {@link js.event.EventsMap#handle(Object, Array)}. For declarative events
	 * registration only two strict object arguments are necessary: first is <code>listeners scope</code> and the
	 * second is the actual <code>events map</code>.
	 * 
	 * @param String type DOM or custom event type,
	 * @param Function listener event listener to register,
	 * @param Object scope listener run-time scope,
	 * @param Boolean... capture optional capture flag, default to false.
	 * @return js.dom.Element this object.
	 * @assert see assertions enforced by {@link js.event.DomEvents#addListener} and
	 * {@link js.event.CustomEvents#addListener}.
	 * @see #_domEvents
	 * @see #_customEvents
	 */
	on : function(type, listener, scope, capture) {
		if (js.event.EventsMap.handle(this, arguments)) {
			return this;
		}

		if (typeof this._customEvents !== "undefined" && this._customEvents.hasType(type)) {
			this._customEvents.addListener(type, listener, scope);
			return this;
		}

		if (typeof capture === "undefined") {
			capture = false;
		}
		this._domEvents.addListener(type, listener, scope, capture);
		return this;
	},

	/**
	 * Remove event listener. Detach listener from requested event type. If event type is a custom one delegates
	 * {@link js.event.CustomEvents} otherwise it should be a predefined DOM event and uses {@link js.event.DomEvents}
	 * to actually remove the listener. Note that this method applies the same logic for priority as {@link #on}
	 * companion; custom event is tested first.
	 * 
	 * @param String type DOM or custom event type,
	 * @param Function listener event listener to remove,
	 * @param Boolean... capture optional capture flag, default to false.
	 * @return js.dom.Element this object.
	 * @assert see assertions enforced by {@link js.event.DomEvents} and {@link js.event.CustomEvents}.
	 */
	un : function(type, listener, capture) {
		if (typeof this._customEvents !== "undefined" && this._customEvents.hasType(type)) {
			this._customEvents.removeListener(type, listener);
			return this;
		}
		if (typeof capture === "undefined") {
			capture = false;
		}
		this._domEvents.removeListener(type, listener, capture);
		return this;
	},

	/**
	 * Set user defined data. Associate an object to a key on this node. The object can later be retrieved from this
	 * node by calling {@link #getUserData(String...)} with the same key. If key already exists its storage will be
	 * overridden.
	 * 
	 * @param String key key used to identified user defined data.
	 * @param Object data user defined data; if null remove existing piece of data.
	 * @return Object previous user data or null.
	 */
	setUserData : function(key, data) {
		$assert(key, "js.dom.Element#setUserData", "Key is undefined, null or empty.");
		if (!key) {
			return null;
		}
		if (typeof this._userData === "undefined") {
			/**
			 * User defined data storage. This is a map of {@link String} keys and {@link Object} values.
			 * 
			 * @type Object
			 */
			this._userData = {};
		}
		var previousData = this._userData[key];
		if (typeof previousData === "undefined") {
			previousData = null;
		}
		if (data === null) {
			delete this._userData[key];
		}
		else {
			this._userData[key] = data;
		}
		return previousData;
	},

	/**
	 * Get user data or null if none defined. Retrieves the data object associated to a key on a this element. The data
	 * object must first have been set to this element by calling {@link #setUserData(String,Object)} with the same key.
	 * If optional <code>key</code> is not supplied uses the string <em>value</em>.
	 * 
	 * @param String... key optional key attached to user defined data, default to <em>value</em>.
	 * @return Object used defined data or null.
	 */
	getUserData : function(key) {
		if (typeof key === "undefined") {
			key = "value";
		}
		$assert(key, "js.dom.Element#getUserData", "Key is null or empty.");
		if (!key) {
			return null;
		}
		if (typeof this._userData === "undefined") {
			return null;
		}
		var data = this._userData[key];
		return typeof data !== "undefined" ? data : null;
	},

	/**
	 * Remove user defined data. Remove user define data associated with given key. Returns user data previously
	 * associated with given key or null if there was none.
	 * 
	 * @param String key key used to identified user defined data.
	 * @return Object previous user data or null.
	 */
	removeUserData : function(key) {
		$assert(key, "js.dom.Element#removeUserData", "Key is undefined, null or empty.");
		if (!key) {
			return null;
		}
		if (typeof this._userData === "undefined") {
			return null;
		}
		var data = this._userData[key];
		if (typeof data === "undefined") {
			return null;
		}
		delete this._userData[key];
		return data;
	},

	/**
	 * Bind element class or format to selected descendants.
	 * 
	 * @param String selectors comma separated selectors,
	 * @param String typeName element class or format name.
	 * @return js.dom.Element this object.
	 * @assert both arguments are not undefined, null or empty and of proper type.
	 */
	bind : function(selectors, typeName) {
		js.dom.Node.bind(this._node, selectors, typeName);
		return this;
	},

	/**
	 * Get custom events.
	 * 
	 * @return js.event.CustomEvents this element custom events.
	 */
	getCustomEvents : function() {
		if (typeof this._customEvents === "undefined") {
			/**
			 * User defined events. By default are undefined, this custom events are lazy initialized when first
			 * accessed via {@link #getCustomEvents} getter.
			 * 
			 * @type js.event.CustomEvents
			 */
			this._customEvents = new js.event.CustomEvents(this);
		}
		return this._customEvents;
	},

	/**
	 * Show this element. Remove <em>hidden</em> CSS class, if any present. This method has an optional flag that is
	 * tested in order to decide if this element is actually displayed or hidden.
	 * 
	 * @param Boolean show optional showing flag, default to true.
	 * @return js.dom.Element this object.
	 */
	show : function(show) {
		if (typeof show === "undefined") {
			show = true;
		}
		return this[(show ? "remove" : "add") + "CssClass"]("hidden");
	},

	/**
	 * Hide this element. Add <em>hidden</em> CSS class to this element. This is a convenient method; it does exactly
	 * the same as {@link #show} with false argument.
	 * 
	 * @return js.dom.Element this object.
	 */
	hide : function() {
		return this.addCssClass("hidden");
	},

	/**
	 * Test if this element is visible, that is, it has not <em>hidden</em> CSS class. Note that this method only test
	 * for <em>hidden</em> CSS class; if element is covered or has, for example, <em>display = none</em> this method
	 * may still return true.
	 * 
	 * @return Boolean true if this element has not <em>hidden</em> CSS class.
	 */
	isVisible : function() {
		return !this.hasCssClass("hidden");
	},

	/**
	 * Cleanup all child elements. This cleaner deletes all children nodes backward references, event handlers and user
	 * defined data, if any. There are rumors DOM and JS engine have different garbage collectors and that is possible
	 * to generate memory leak if don"t explicitly delete references from DOM to JS. I don"t know if true but I don"t
	 * want to take that chance.
	 * <p>
	 * There is a guard argument used internally for recursive call counting. It is not used when invoke this method
	 * from this class; it has value only when this method invokes itself.
	 * 
	 * @param Node node native node,
	 * @param Number... guard optional, internal used recursivity guard.
	 */
	_clean : function(node, guard) {
		if (typeof guard === "undefined") {
			guard = 0;
		}
		$assert(guard < 8, "js.dom.Element#_clean", "Too many recursive iterations.");
		if (guard === 8) {
			return;
		}
		var it = new js.dom.Node.Iterator(node);
		while (it.hasNext()) {
			guard++;
			this._clean(it.next(), guard);
			guard--;
		}

		var el = js.dom.Node.getElement(node);
		if (el !== null) {
			delete el._ownerDoc;
			delete el._node;
			delete el.style;
			if (el._format !== null) {
				delete el._format;
			}
			// delete DOM events instance; this allows garbage collecting for event handlers
			// rely on browser to clean-up event listeners attached to a removed node
			delete el._domEvents;
			if (typeof el._customEvents !== "undefined") {
				delete el._customEvents;
			}
			if (typeof el._userData !== "undefined") {
				for ( var p in el._userData) {
					delete el._userData[p];
				}
				delete el._userData;
			}
			js.dom.Node.removeBackRef(node);
		}
	},

	/**
	 * Return element name and its attributes list. Listed attributes contain both name and value.
	 * 
	 * @return String this element dump.
	 */
	dump : function() {
		var sb = "";
		sb += this._node.tagName;

		var attributes = this._node.attributes;
		for (var i = 0; i < attributes.length; ++i) {
			sb += ' ';
			sb += attributes[i].name;
			sb += '='
			sb += attributes[i].value;
		}

		return sb;
	},

	/**
	 * Return the path through document tree from root to current element.
	 * 
	 * @return String this element trace.
	 */
	trace : function() {
		var sb = "";
		var el = this, index;
		while (el !== null) {
			index = el._index();
			if (index != -1) {
				sb = "[" + index + "]" + sb;
			}
			sb = "/" + el.getTag() + sb;
			el = el.getParent();
		}
		return sb;
	},

	/**
	 * Returns this element sibling index. Traverse all siblings and count only those with the same tag as this element.
	 * Returns -1 if this element has no parent or has no sibling of the same tag.
	 * 
	 * @return Number this element index or -1.
	 */
	_index : function() {
		var parent = this.getParent();
		if (parent === null) {
			return -1;
		}
		var n = parent._node.firstChild;
		var index = 0, twinsCount = 0, indexFound = false;
		while (n !== null) {
			if (n === this._node) {
				indexFound = true;
			}
			if (n.nodeType === Node.ELEMENT_NODE && n.nodeName === this._node.nodeName) {
				++twinsCount;
				if (!indexFound) {
					++index;
				}
			}
			n = n.nextSibling;
		}
		return twinsCount > 1 ? index : -1;
	},

	/**
	 * Return unique hash code string value usable for hash maps. Note that hash code has page session life and is not
	 * usable to persist objects between sessions.
	 * 
	 * @return String unique hash code.
	 */
	hashCode : function() {
		return this._hashCode;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.Element";
	}
};
// this $extends call may seem not neccesarylly but without it js.dom.Element.prototype.__ctor__ hidden property is not
// initialized and instance constructor retrieval like e.__ctor__ may be undefined; as a direct concequence
// js.util.Types#isElement can't recognize instances of js.dom.Element
$extends(js.dom.Element, Object);

/**
 * Alias for {@link #getByCss}.
 * 
 * @type js.dom.Element
 */
js.dom.Element.prototype.$E = js.dom.Element.prototype.getByCss;

/**
 * Alias for {@link #findByCss}.
 * 
 * @type js.dom.EList
 */
js.dom.Element.prototype.$L = js.dom.Element.prototype.findByCss;

$legacy(js.ua.Engine.TRIDENT, function() {
	js.dom.Element.prototype.clone = function(deep) {
		$assert(typeof deep === "undefined" || js.lang.Types.isBoolean(deep), "js.dom.Element#clone", "Deep flag is not boolean.");
		var clone = this._node.cloneNode(deep === true);
		this._ieCloneWorkaround(this, clone, 0);
		return this._ownerDoc.getElement(clone);
	};

	/**
	 * IE cloning workaround. IE does copy events listeners and augmented values on cloning so we need to traverse all
	 * clone tree and remove listeners and back-references.
	 * 
	 * @param js.dom.Element originalElement original element, source of clone operations,
	 * @param Node cloneNode native {@link Node}, resulted from original element cloning,
	 * @param Number guard recursive iteration guard.
	 */
	js.dom.Element.prototype._ieCloneWorkaround = function(originalElement, cloneNode, guard) {
		$assert(guard < 8, "js.dom.Element#_ieCloneWorkaround", "Too many recursive iterations.");
		if (guard === 8) {
			return;
		}

		// parallel traversal of original source elements and cloned nodes trees
		// uses cloned nodes as loop condition to cope with shallow cloning

		var originalElementsIt = originalElement.getChildren().it();
		var cloneNodesIt = new js.dom.Node.Iterator(cloneNode);
		while (cloneNodesIt.hasNext()) {
			++guard;
			this._ieCloneWorkaround(originalElementsIt.next(), cloneNodesIt.next(), guard);
			--guard;
		}

		// detach events copied by cloning operation
		originalElement._domEvents.getHandlers().forEach(function(handler) {
			cloneNode.detachEvent("on" + handler.type, handler.domEventListener);
		});

		// IE copy augmented values when cloning so we need to delete back-references manually
		js.dom.Node.removeBackRef(cloneNode);
	};

	js.dom.Element.prototype.addHTML = function(html) {
		$assert(html, "js.dom.Element#setHTML", "HTML fragment is undefined, null or empty.");
		if (html) {
			this._node.insertAdjacentHTML("beforeEnd", html);
		}
		return this;
	};

	js.dom.Element.prototype.getChildren = function() {
		var nodeList = this._node.children;
		if (typeof nodeList === "undefined") {
			nodeList = new js.dom.NodeList();
		}
		return this._ownerDoc.getEList(nodeList);
	};
});

/**
 * IE and WebKit for mobiles have no support for class list.
 */
$legacy(js.ua.Engine.TRIDENT || js.ua.Engine.MOBILE_WEBKIT, function() {
	js.dom.Element.prototype.addCssClass = function(cssClass, enabled) {
		$assert(cssClass, "js.dom.Element#addCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			if (typeof enabled === "undefined") {
				enabled = true;
			}
			if (!enabled) {
				return this.removeCssClass(cssClass);
			}
			cssClass = js.util.Strings.trim(cssClass);
			if (!this.hasCssClass(cssClass)) {
				if (this._node.className.length === 0) {
					this._node.className = cssClass;
				}
				else {
					this._node.className = [ this._node.className, cssClass ].join(" ");
				}
			}
		}
		return this;
	};

	js.dom.Element.prototype.removeCssClass = function(cssClass) {
		$assert(cssClass, "js.dom.Element#removeCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			var re = new RegExp("(?:^|\\s+)" + js.util.Strings.escapeRegExp(cssClass) + "(?:\\s+|$)", "g");
			if (re.test(this._node.className)) {
				this._node.className = js.util.Strings.trim(this._node.className.replace(re, " "));
			}
		}
		return this;
	};

	js.dom.Element.prototype.toggleCssClass = function(cssClass) {
		$assert(cssClass, "js.dom.Element#toggleCssClass", "CSS class is undefined, null or empty.");
		if (cssClass) {
			this[this.hasCssClass(cssClass) ? "removeCssClass" : "addCssClass"](cssClass);
		}
		return this;
	};

	js.dom.Element.prototype.hasCssClass = function(cssClass) {
		$assert(cssClass, "js.dom.Element#hasCssClass", "CSS class is undefined, null or empty.");
		if (!cssClass) {
			return false;
		}
		var re = new RegExp("(?:^|\\s+)" + js.util.Strings.escapeRegExp(cssClass) + "(?:\\s+|$)", "g");
		return re.test(this._node.className);
	};
});
