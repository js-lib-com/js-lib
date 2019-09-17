$package("js.dom");

/**
 * List of elements. This class wraps a native {@link NodeList} instance and is returned by {@link js.dom.Document} and
 * {@link js.dom.Element} methods that need to return collection of elements. Be aware that native NodeList is a
 * <em>live
 * </em> object, that is, updated by JavaScript engine when DOM tree is changed, so refrain to cache this
 * objects. Also DO NOT alter its structure while iterating.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct list of elements. This constructor requires two arguments: owner document and native NodeList
 * instance to wrap. If given nodes list is empty or null created instance is empty. Note that <em>nodeList</em>
 * argument should be present even if null. User code should explicitly indicate its intention to create an empty list.
 * 
 * @param js.dom.Document ownerDoc document owning elements from this list,
 * @param NodeList nodeList native node list instance.
 * @assert <em>nodeList</em> argument is not undefined.
 */
js.dom.EList = function(ownerDoc, nodeList) {
	$assert(this instanceof js.dom.EList, "js.dom.EList#EList", "Invoked as function.");
	$assert(ownerDoc, "js.dom.EList#EList", "Undefined or null owner document.");
	$assert(ownerDoc instanceof js.dom.Document, "js.dom.EList#EList", "Owner document is not an instance of js.dom.Document.");

	$assert(typeof nodeList !== "undefined", "js.dom.EList#EList", "Node list is undefined.");
	if (nodeList === null) {
		nodeList = new js.dom.NodeList();
	}
	$assert(js.lang.Types.isNodeList(nodeList), "js.dom.EList#EList", "Argument supplied as node list does not implement NodeList interface.");
	$assert(this._containsOnlyElements(nodeList), "js.dom.EList#EList", "Argument supplied as node list does not contains only NODE_ELEMENT.");

	/**
	 * Owner document. Note that all elements from this list belongs to this document.
	 * 
	 * @type js.dom.Document
	 */
	this._ownerDoc = ownerDoc;

	/**
	 * Native NodeList <em>live</em> instance. If {@link #EList constructor} <em>nodeList</em> arguments was null
	 * this node list is empty.
	 * 
	 * @type NodeList
	 */
	this._nodeList = nodeList;
};

js.dom.EList.prototype = {
	/**
	 * Get this list size.
	 * 
	 * @return Number this list size.
	 */
	size : function() {
		return this._nodeList.length;
	},

	/**
	 * Get element from index. Returns the element identified by given index or null if index is not valid.
	 * 
	 * @param Number index the index of element to retrieve.
	 * @return js.dom.Element element from requested index.
	 * @assert <em>index</em> argument does not exceed this list size.
	 */
	item : function(index) {
		if (typeof index === "undefined") {
			index = 0;
		}
		$assert(index < this._nodeList.length, "js.dom.EList#item", "Index out of range.");
		return this._ownerDoc.getElement(this._nodeList.item(index));
	},

	/**
	 * Is this list empty?
	 * 
	 * @return Boolean true if this elements list is empty.
	 */
	isEmpty : function() {
		return this._nodeList.length === 0;
	},

	/**
	 * Remove all elements. Remove this list elements from owner document using {@link js.dom.Element#remove}. Note
	 * that element cleanup is performed.
	 * 
	 * @assert every element from this list should be not undefined or null.
	 * @note because wrapped native node list is <em>live</em> after this method execution, {@link #isEmpty} returns
	 * true and {@link #it} returns an empty iterator.
	 */
	remove : function() {
		// because NodeList may be live we need to cache all elements references first
		// note that not all node lists are live, e.g. querySelect returns static NodeList
		// but I decided to play safe and cache both cases, even if sub-optimal

		var nodes = [], i, el;
		for (i = 0; i < this._nodeList.length; ++i) {
			nodes.push(this._nodeList.item(i));
		}

		for (i = 0; i < nodes.length; ++i) {
			el = this._ownerDoc.getElement(nodes[i]);
			$assert(el, "js.dom.EList#remove", "List element is undefined or null.");
			if (el) {
				el.remove();
			}
		}

		// if this._nodeList is a live NodeList, it is already empty because its elements
		// was removed from document tree and next statement does not harm
		// if node list is static, i.e. not live, clear it by setting its length to zero
		// to sum-up, after this method exit this._nodeList is empty
		nodes.length = 0;
	},

	/**
	 * Execute specified method for every element from this list. Traverse all this elements list and execute requested
	 * method with given arguments. Ignore elements that does not own specified method.
	 * 
	 * @param String methodName the name of element"s method to be invoked,
	 * @param Object... args optional runtime method arguments.
	 * @return js.dom.EList this pointer.
	 * @assert method name is not undefined, null or empty. Also every element from list should poses named method.
	 */
	call : function(methodName) {
		$assert(methodName, "js.dom.EList#call", "Method name is undefined, null or empty.");
		var it = this.it(), el;
		while (it.hasNext()) {
			el = it.next();
			$assert(js.lang.Types.isFunction(el[methodName]), "js.dom.EList#call", "Element property is no a function.");
			if (js.lang.Types.isFunction(el[methodName])) {
				el[methodName].apply(el, $args(arguments, 1));
			}
		}
		return this;
	},

	// ------------------------------------------------------------------------

	/**
	 * Execute callback function for every element from this list. This method traverses all elements from this list and
	 * execute callback.
	 * <p>
	 * Callback signature. First parameter is current item element, the second is item index relative to list and last
	 * one is the list itself.
	 * 
	 * <pre>
	 * void callback(js.dom.Element item, Number index, js.dom.EList list);
	 * </pre>
	 * 
	 * @param Function callback callback to be executed for every element from list.
	 * @param Object scope callback runtime scope.
	 */
	forEach : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.EList#forEach", "Callback is not a function.");
		if (typeof scope === "undefined") {
			scope = window;
		}
		for (var i = 0; i < this.size(); i++) {
			callback.call(scope, this.item(i), i, this);
		}
	},

	/**
	 * Create a new array with the results of calling provided callback on every element from this elist.
	 * <p>
	 * Callback signature has a single argument, the current element from elist.
	 * 
	 * <pre>
	 * void callback(js.dom.Element element);
	 * </pre>
	 * 
	 * @param Function callback callback to be executed for every element from list.
	 * @param Object scope callback runtime scope.
	 * @return Array newly created array.
	 */
	map : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.EList#map", "Callback is not a function.");
		if (typeof scope === "undefined") {
			scope = window;
		}
		var array = [];
		for (var i = 0; i < this.size(); i++) {
			array.push(callback.call(scope, this.item(i)));
		}
		return array;
	},

	/**
	 * Add CSS class to this list elements. If CSS class argument is undefined, null or empty this method does nothing.
	 * 
	 * @param String cssClass CSS class to add.
	 * @return js.dom.EList this object.
	 * @assert <em>cssClass</em> arguments is not undefined, null or empty.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	addCssClass : function(cssClass) {
		this.call("addCssClass", cssClass);
		return this;
	},

	/**
	 * Remove CSS class from this list elements. If CSS class argument is undefined, null or empty this method does
	 * nothing.
	 * 
	 * @param String cssClass CSS class to remove.
	 * @return js.dom.EList this object.
	 * @assert <em>cssClass</em> arguments is not undefined, null or epmty.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	removeCssClass : function(cssClass) {
		this.call("removeCssClass", cssClass);
		return this;
	},

	/**
	 * Toggle CSS class on this list elements. If CSS class argument is undefined, null or empty this method does
	 * nothing.
	 * 
	 * @param String cssClass CSS class to toggle.
	 * @return js.dom.EList this object.
	 * @assert <em>cssClass</em> arguments is not undefined, null or epmty.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	toggleCssClass : function(cssClass) {
		this.call("toggleCssClass", cssClass);
		return this;
	},

	/**
	 * Gets an iterator for this elist instance. Create and return a new instance of this class private iterator.
	 * 
	 * @return js.dom.EList.Iterator newly created iterator instance.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	it : function() {
		return new js.dom.EList.Iterator(this);
	},

	/**
	 * Add event listener to this list elements.
	 * 
	 * @param String type event type,
	 * @param Function listener event listener to register,
	 * @param Object scope listener run-time scope,
	 * @param Boolean... capture optional capture flag, default to false.
	 * @return js.dom.EList this object.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	on : function(type, listener, scope, capture) {
		this.call("on", type, listener, scope, capture);
		return this;
	},

	/**
	 * Remove event listener from this list elements.
	 * 
	 * @param String type event type,
	 * @param Function listener event listener to remove.
	 * @return js.dom.EList this object.
	 * @note j(s)-lib extensions to Baby DOM EList interface.
	 */
	un : function(type, listener) {
		this.call("un", type, listener);
		return this;
	},

	/**
	 * Debugging predicate that test the nodes list contains only Node.ELEMENT_NODE.
	 * 
	 * @param NodeList nodeList nodes list to test,
	 * @return Boolean true if <code>nodeList</code> contains only elements.
	 */
	_containsOnlyElements : function(nodeList) {
		for (var i = 0; i < nodeList.length; ++i) {
			if (nodeList.item(i).nodeType !== Node.ELEMENT_NODE) {
				return false;
			}
		}
		return true;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.EList";
	}
};
$extends(js.dom.EList, Object);

/**
 * EList iterator. {@link js.dom.EList} private implementation of iterator interface that iterate over EList"s
 * {@link js.dom.Element elements}.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct EList iterator.
 * 
 * @param js.dom.EList elist parent elist.
 */
js.dom.EList.Iterator = function(elist) {
	/**
	 * Parent EList instance on which this iterator operates.
	 * 
	 * @type js.dom.EList
	 */
	this._elist = elist;

	/**
	 * This iterator current index.
	 * 
	 * @type Number
	 */
	this._index = 0;
};

js.dom.EList.Iterator.prototype = {
	/**
	 * Returns true if the iteration has more {@link js.dom.Element elements}.
	 * 
	 * @return Boolean true if the iteration has more elements.
	 */
	hasNext : function() {
		return this._index < this._elist.size();
	},

	/**
	 * Get next element. Retrieve the next {@link js.dom.Element element} in the iteration.
	 * 
	 * @return js.dom.Element next element.
	 */
	next : function() {
		return this._elist.item(this._index++);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.EList.Iterator";
	}
};
$extends(js.dom.EList.Iterator, Object);
$implements(js.dom.EList.Iterator, js.lang.Iterator);
