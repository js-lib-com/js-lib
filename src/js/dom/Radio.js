$package('js.dom');

/**
 * Radio option.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct radio option instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document} and
 *         <em>node</em> is an input of type checkbox.
 */
js.dom.Radio = function(ownerDoc, node) {
	$assert(this instanceof js.dom.Radio, 'js.dom.Radio#Radio', 'Invoked as function.');
	this.$super(ownerDoc, node);
	$assert(node.nodeName.toLowerCase() === 'input', 'js.dom.Radio#Radio', 'Node is not an input.');
	$assert(node.getAttribute('type') === 'radio', 'js.dom.Radio#Radio', 'Node is not a checkbox.');
};

js.dom.Radio.prototype = {
	setValue : function(value) {
		this._node.checked = (this._node.value === value);
		return this;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.Radio';
	}
};
$extends(js.dom.Radio, js.dom.Checkbox);
