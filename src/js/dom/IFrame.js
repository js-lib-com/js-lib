$package('js.dom');

/**
 * Inner frame.
 * 
 * @author Iulian Rotaru
 * @constructor Construct inner frame instance.
 * 
 * @param js.dom.Document ownerDoc, element owner document,
 * @param Node node, native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document}.
 */
js.dom.IFrame = function(ownerDoc, node) {
	$assert(this instanceof js.dom.IFrame, 'js.dom.IFrame#IFrame', 'Invoked as function.');
	this.$super(ownerDoc, node);

	/**
	 * This inner frame window.
	 * 
	 * @type js.ua.Window
	 */
	this._window = null;

	/**
	 * This inner frame document.
	 * 
	 * @type js.dom.Document
	 */
	this._innerDoc = null;
};

js.dom.IFrame.prototype = {
	/**
	 * Set this inner frame source.
	 * 
	 * @return this pointer.
	 */
	setSrc : function(src) {
		this._node.src = src;
		return this;
	},

	/**
	 * Get this inner frame source.
	 * 
	 * @return this inner frame source.
	 */
	getSrc : function() {
		return this._node.src;
	},

	/**
	 * Get this inner frame window.
	 * 
	 * @return js.ua.Window this inner frame window.
	 */
	getWindow : function() {
		if (this._window === null) {
			this._window = new js.ua.Window(this._ownerDoc.getParentWindow(), this._node.contentWindow);
		}
		return this._window;
	},

	/**
	 * Get this inner frame document.
	 * 
	 * @return js.dom.Document this inner frame document.
	 */
	getInnerDoc : function() {
		if (this._innerDoc === null) {
			this._innerDoc = new js.dom.Document(this._node.contentWindow.document);
		}
		return this._innerDoc;
	},

	/**
	 * Get this inner frame location.
	 * 
	 * @return String this inner frame location.
	 */
	getLocation : function() {
		return this._node.contentWindow.location.toString();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.IFrame';
	}
};
$extends(js.dom.IFrame, js.dom.Element);
