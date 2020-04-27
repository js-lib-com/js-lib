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
		this._error = false;
		if (this._defaultSrc != null) {
			this._node.src = this._defaultSrc;
		}
		else {
			this._node.removeAttribute("src");
		}
		return this;
	},

	reload : function(src) {
		if(!src) {
			src = this._node.src;
		}
		$assert(src, "js.dom.ImageControl#reload", "Image source is undefined, null or empty.");
		return this._setValue(src);
	},

	_setValue : function(src) {
		if (!src || /^\s+|(?:&nbsp;)+$/g.test(src)) {
			return this.reset();
		}
		
		this._error = false;
		var random = Math.random().toString(36).substr(2);

		var i = src.indexOf('?');
		if (i !== -1) {
			this._node.src = src + '&__random__=' + random;
		}
		else {
			this._node.src = src + '?' + random;
		}
		return this;
	},

	_getValue : function() {
		if (this._error) {
			return null;
		}
		
		// use attributes interface to retrieve image source
		// node.src returns normalized URL, with protocol and server, even if set value was absolute path
		// do not confuse absolute path with absolute URL
		
		var attr = this._node.attributes.getNamedItem("src");
		if (attr == null) {
			return null;
		}
		
		var src = attr.value;
		if(src == null) {
			return null;
		}
		
		var argsIndex = src.indexOf('?');
		return argsIndex > 0 ? src.substr(0, argsIndex) : src;
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
