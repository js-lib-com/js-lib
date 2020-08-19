$package("js.dom");

/**
 * Iterate named controls present into a given elements tree. This class scan in depth-first order the descendants tree
 * of a given controls container and invoke a callback function for every {@link js.dom.Control} found. Descendants tree
 * is arbitrary large.
 * <p>
 * If a tree branch is excluded, that is, marked with CSS class <code>exclude</code>, is not included into scanning
 * process. All excluded element descendants are excluded.
 * <p>
 * Please note that from this class perspective an {@link js.dom.Element} is considered control if has one of
 * <code>name</code> or <code>data-name</code> attributes.
 * 
 * @author Iulian Rotaru
 * @since 1.8
 * 
 * @constructor Construct controls iterable instance.
 * @param js.dom.Element controlsContainer controls container.
 */
js.dom.ControlsIterable = function(controlsContainer) {
	$assert(js.lang.Types.isElement(controlsContainer), "js.dom.ControlsIterable#ControlsIterable", "Controls container parameter is not a document element.");

	/**
	 * Owner document for this controls collection.
	 * 
	 * @type js.dom.Document
	 */
	this._ownerDoc = controlsContainer.getOwnerDoc();

	/**
	 * Controls collection root native node is from where scanning starts.
	 * 
	 * @type Node
	 */
	this._rootNode = controlsContainer.getNode();
};

js.dom.ControlsIterable.prototype = {
	/**
	 * Execute callback function for each control but do not include hidden. Uses
	 * {@link #_scan(Node, Boolean, Function, Object)} method to scan root node descendants in depth-first order and if
	 * found a {@link js.dom.Control} invoke given <code>callback</code>. Callback function should have next
	 * signature:
	 * 
	 * <pre>
	 *  void callback(js.dom.Control);
	 * </pre>
	 * 
	 * A descendant is considered control if has <code>name</code> or <code>data-name</code> attribute.
	 * 
	 * @param Function callback callback function invoked for every control,
	 * @param Object... scope optional callback runtime execution scope, default to global scope.
	 * @assert <code>callback</code> parameter is a {@link Function} and <code>scope</code> is an {@link Object},
	 * if present.
	 */
	forEach : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.ControlsIterable#forEach", "Callback parameter is not a function.");
		$assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.ControlsIterable#forEach", "Scope parameter is not an object.");
		this._scan(this._rootNode, false, callback, scope || window);
	},

	/**
	 * Execute callback function for each control and do include hidden. The same as
	 * {@link #forEach(Function, Object...)} but include hidden controls.
	 * 
	 * @param Function callback callback function invoked for every control,
	 * @param Object... scope optional callback runtime execution scope, default to global scope.
	 * @assert <code>callback</code> parameter is a {@link Function} and <code>scope</code> is an {@link Object},
	 * if present.
	 */
	forEachAll : function(callback, scope) {
		$assert(js.lang.Types.isFunction(callback), "js.dom.ControlsIterable#forEachAll", "Callback parameter is not a function.");
		$assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.ControlsIterable#forEachAll", "Scope parameter is not an object.");
		this._scan(this._rootNode, true, callback, scope || window);
	},

	/**
	 * Scan node for named controls, both standard and user defined. It is empowered by
	 * {@link #forEach(Function, Object...)} or {@link #forEachAll(Function, Object...)} methods and scan recursively in
	 * depth-first order for named controls. For every control found invoke <code>callback</code> in given
	 * <code>scope</code> with control as argument.
	 * <p>
	 * If given node is an element that happen to have <code>exclude</code> CSS class this method returns immediately
	 * aborting scanning process.
	 * 
	 * @param Node node native node,
	 * @param Boolean includeHidden flag to include hidden inputs,
	 * @param Function callback function to execute for each control,
	 * @param Object scope callback runtime execution scope.
	 */
	_scan : function(node, includeHidden, callback, scope) {
		if (node.nodeType === Node.ELEMENT_NODE && node !== this._rootNode && node.classList.contains("exclude")) {
			return;
		}

		// in order to avoid creating j(s)-element for every single traversed node this scanner uses native nodes

		// a node is a control if has 'name' or 'data-name' attribute and wrapping element has __control__ property
		// __control__ property is library private and used to flag control instances
		// if includeHidden argument is not true hidden nodes are not accepted as controls

		var isControl = function(node) {
			if (!includeHidden && node.attributes.getNamedItem("type") === "hidden") {
				return null;
			}
			if (!node.hasAttribute("name") && !node.hasAttribute("data-name")) {
				return null;
			}
			var element = this._ownerDoc.getElement(node);
			$assert(element != null, "js.dom.ControlsIterable#_scan", "Null j(s)-element for node |%s|. Probably missing custom class.", js.dom.Node.toString(node));
			return element.__control__ ? element : null;
		}.bind(this);

		var nodeList = node.children;
		if (typeof nodeList === "undefined") {
			// IE node.children is undefined if node has no children at all
			return;
		}
		// standard browsers have empty nodes list, in which case for loop is never executed

		for (var i = 0, n, e; i < node.children.length; i++) {
			n = node.children.item(i);
			// if is control invoke callback, otherwise continue branch depth-first scanning
			// next if uses side effect: testing for control also assign element value
			if ((e = isControl(n)) !== null) {
				callback.call(scope, e);
			}
			else {
				this._scan(n, includeHidden, callback, scope);
			}
		}
	},

	/**
	 * This class string representation.
	 * 
	 * @return String this class string representation.
	 */
	toString : function() {
		return "js.dom.ControlsIterable";
	}
};
$extends(js.dom.ControlsIterable, Object);
