$package("js.dom");

/**
 * Image element accessed via form control interface.
 * 
 * @author Iulian Rotaru
 * @constructor Construct an instance of ImageControl class.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.ImageControl = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
	$assert(node.nodeName.toLowerCase() === 'img', 'js.dom.ImageControl#ImageControl', 'Node is not an image.');

	this._defaultSrc = this.getAttr("data-default");

	this.on("error", this._onError, this);
	this._error = false;
};

js.dom.ImageControl.prototype = {
	reset : function() {
		if (this._defaultSrc != null) {
			this._node.src = this._defaultSrc;
		}
		else {
			this._node.removeAttribute("src");
		}
		return this;
	},

	_setValue : function(src) {
		if (!src || /^\s+|(?:&nbsp;)+$/g.test(src)) {
			return this.reset();
		}
		this._node.src = "";
		this._node.src = src + '?' + Date.now();
		return this;
	},

	_getValue : function() {
		if (this._error) {
			return null;
		}
		var src = this._node.src;
		return src ? src.substr(0, src.indexOf('?')) : null;
	},

	/**
	 * Update error state if image fails to load.
	 * 
	 * @param js.event.Event ev error event.
	 */
	_onError : function(ev) {
		this._error = true;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "js.dom.ImageControl";
	}
};
$extends(js.dom.ImageControl, js.dom.Control);
