$package('js.dom');

/**
 * Anchor element. This simple anchor wrapper only adds specialized setter and getter for hyper-reference taking care
 * not to set empty values.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct anchor element instance.
 * 
 * 
 * @param js.dom.Document ownerDoc, element owner document,
 * @param Node node, native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document}. Also
 * <em>node</em> argument should be of <em>a</em> type.
 */
js.dom.Anchor = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Anchor, 'js.dom.Anchor#Anchor', 'Invoked as function.');
	this.$super(ownerDoc, node);
};

js.dom.Anchor.prototype = {
	/**
	 * Set link hyper-reference. Set this link HREF attribute but takes care about empty values. If argument is
	 * undefined, null or empty this setter does nothing.
	 * 
	 * @param String href hyperlink reference.
	 * @return js.dom.Anchor this object.
	 * @assert <em>href</em> argument is not undefined, null or empty.
	 */
	setHref : function(href) {
		$assert(href, 'js.dom.Anchor#setHref', 'HREF is undefined, null or empty.');
		if (href) {
			this.setAttr('href', href);
		}
		return this;
	},

	/**
	 * Get hyper-reference. Returns null if <code>href</code> attribute is not defined or empty string if
	 * <code>href</code> exist but has no value.
	 * 
	 * @return String this anchor hyper-reference.
	 */
	getHref : function() {
		return this.getAttr('href');
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.Anchor';
	}
};
$extends(js.dom.Anchor, js.dom.Element);
