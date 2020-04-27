$package('js.dom');

/**
 * Image element. Wrapper for HTML <em>img</em> tag, this class takes care to properly handle empty image sources that
 * can lead to strange behavior on browser considering empty URL as current page. It also contains a
 * {@link #_TRANSPARENT_DOT} used to nullify image content and {@link js.dom.Element#_format} handy for relative source
 * translations.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct image element instance.
 * 
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native {@link Node} instance.
 * @assert <em>node</em> argument should be of <em>img</em> type.
 */
js.dom.Image = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Image, 'js.dom.Image#Image', 'Invoked as function.');
	this.$super(ownerDoc, node);
	$assert(node.nodeName.toLowerCase() === 'img', 'js.dom.Image#Image', 'Node is not an image.');

	/**
	 * Default value used by {@link #setSrc(String)} when given value is undefined, null or empty. Also this default
	 * value is used when configured source URL is failing to be loaded.
	 * <p>
	 * This property is initialized from <code>data-default</code> attribute. If attribute not present uses
	 * transparent dot, see {@link #_TRANSPARENT_DOT}.
	 * 
	 * @type String
	 */
	this._defaultSrc = this.getAttr("data-default");
	if (this._defaultSrc == null) {
		this._defaultSrc = this._TRANSPARENT_DOT;
	}

	this.on("error", this._onError, this);
};

js.dom.Image.prototype = {
	/**
	 * Transparent dot stored using data URI scheme.
	 * 
	 * @type String
	 */
	_TRANSPARENT_DOT : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',

	_SRC_REX : /^.+\/[^/_]+_\d+x\d+\..+$/,
		
	/**
	 * Set this image source. Set image source but takes care of empty values. There are browsers that consider empty
	 * <em>src</em> as current page. As a consequence browser tries to load as image content the current page
	 * resulting in multiple server side controller invocation for a single page. This may confuse server logic and
	 * increases resources consumption. If given <em>src</em> is undefined, null, empty or contains only white spaces
	 * delegates {@link #reset}; anyway, if this image is configured with default value, returns {@link #_defaultSrc}.
	 * <p>
	 * Also if this image has a {@link js.dom.Element#_format formatter} uses it to preproces image source. This may be
	 * handy when use relative sources and format add host part, but not limited to.
	 * 
	 * @param String src image source to set.
	 * @return js.html.Image this object.
	 */
	setSrc : function(src) {
		if (!src || /^\s+|(?:&nbsp;)+$/g.test(src)) {
			return this.reset();
		}

		if (this._format !== null) {
			src = this._format.format(src);
		}

		if(this.hasAttr("width") && this.hasAttr("height") && !this._SRC_REX.test(src)) {
			var argumentsIndex = src.lastIndexOf('?');
			if (argumentsIndex === -1) {
				argumentsIndex = src.length;
			}
			var extensionIndex = src.lastIndexOf('.', argumentsIndex);
			if (extensionIndex > 0) {
				src = src.substring(0, extensionIndex) + '_' + parseInt(this.getAttr("width")) + 'x' + parseInt(this.getAttr("height")) + src.substring(extensionIndex);
			}
		}

		this._node.src = src;
		return this;
	},

	/**
	 * Get image source. Please note that this method does not necessarily return the value of <em>src</em> attribute;
	 * full URL is reasonable to expect even if <em>src</em> attribute is relative.
	 * 
	 * @return String this image source.
	 */
	getSrc : function() {
		return this._node.src;
	},

	/**
	 * Reload image from server. Force image reloading. In order to circumvent user agent cache this method adds a
	 * random string to image source, like in snippet below:
	 * 
	 * <pre>
	 * 	img/users/default.png?q1w2e3r4
	 * </pre>
	 * 
	 * Please note that image source URL query part is overwritten, if exists.
	 * 
	 * @param String src image source URL to reload content from.
	 * @return js.html.Image this object.
	 * @assert image source is not undefined, null or empty.
	 */
	reload : function(src) {
		if (!src) {
			src = this._node.src;
		}
		$assert(src, "js.dom.Image#reload", "Image source is undefined, null or empty.");
		var random = Math.random().toString(36).substr(2);
		var i = src.indexOf('?');
		if (i !== -1) {
			return this.setSrc(src + '&__random__=' + random);
		}
		return this.setSrc(src + '?' + random);
	},

	/**
	 * Clear image. There are times when need to empty an image, e.g. when part of a form that is reset. But we can't
	 * simply erase image src because some browsers will display that missing image icon or worst will consider empty
	 * src as current page. In order to have an working image reset we use a {@link #_TRANSPARENT_DOT}.
	 * 
	 * @return js.html.Image this object.
	 */
	reset : function() {
		this._node.src = this._defaultSrc;
		return this;
	},

	/**
	 * Test if this image is valid. An image is valid if it has a source and that source is not the {@link #_defaultSrc}.
	 * 
	 * @return Boolean true is this image is valid.
	 */
	isValid : function() {
		return this._node.src && this._node.src !== this._defaultSrc;
	},

	/**
	 * Test if this image is configured with default value.
	 * 
	 * @return Boolean true if this iamge has default value.
	 */
	hasDefault : function() {
		return !!this._defaultSrc;
	},

	/**
	 * Set this image width, in pixels.
	 * 
	 * @param Number width image width in pixels.
	 * @return js.dom.Image this object.
	 */
	setWidth : function(width) {
		$assert(js.lang.Types.isNumber(width), "js.dom.Image#setWidth", "Width attribute is not a number.");
		return this.setAttr("width", width.toString());
	},

	/**
	 * Set this image height, in pixels.
	 * 
	 * @param Number height image height in pixels.
	 * @return js.dom.Image this object.
	 */
	setHeight : function(height) {
		$assert(js.lang.Types.isNumber(height), "js.dom.Image#setHeight", "Height attribute is not a number.");
		return this.setAttr("height", height.toString());
	},

	/**
	 * On image loading error uses default value. Note that this listener is registered only if {@link #_defaultSrc} is
	 * set.
	 * 
	 * @param js.event.Event ev error event.
	 */
	_onError : function(ev) {
		// at limit, there is the chance that error handler to be invoked after image object was removed and cleaned
		// in this case this._node was deleted by Element#_clean() and is undefined
		if (typeof this._node !== "undefined") {
			this._node.src = this._defaultSrc;
		}
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.Image';
	}
};
$extends(js.dom.Image, js.dom.Element);
