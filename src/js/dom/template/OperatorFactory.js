$package('js.dom.template');

/**
 * Operator factory. There is a single operator factory on templates engine instance. It holds a pool of operator
 * instances that are reused in the context of templates engine instance.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct operator factory instance.
 * 
 * @param js.dom.template.Template template parent template instance.
 * @assert parent template is not undefined, null and is of proper type.
 */
js.dom.template.OperatorFactory = function(template) {
	$assert(template instanceof js.dom.template.Template, "js.dom.template.OperatorFactory#OperatorFactory", "Content is undefined, null or not of proper type.");

	/**
	 * Parent template.
	 * 
	 * @type js.dom.template.Template
	 */
	this._template = template;
};

js.dom.template.OperatorFactory.prototype = {
	/**
	 * Initialize operator factory instance. Create and cache all implemented operator instances.
	 * 
	 * @param js.dom.template.Content content dynamic content to inject into template.
	 * @assert content is not undefined, null and is of proper type.
	 */
	init : function(content) {
		$assert(content instanceof js.dom.template.Content, "js.dom.template.OperatorFactory#init", "Content is undefined, null or not of proepr type.");

		var Opcode = js.dom.template.Opcode;
		this[Opcode.GOTO] = new js.dom.template.GotoOperator(content);
		this[Opcode.EXCLUDE] = new js.dom.template.ExcludeOperator(content);
		this[Opcode.IF] = new js.dom.template.IfOperator(content);
		this[Opcode.ATTR] = new js.dom.template.AttrOperator(content);
		this[Opcode.ID] = new js.dom.template.IdOperator(content);
		this[Opcode.SRC] = new js.dom.template.SrcOperator(content);
		this[Opcode.HREF] = new js.dom.template.HrefOperator(content);
		this[Opcode.TITLE] = new js.dom.template.TitleOperator(content);
		this[Opcode.VALUE] = new js.dom.template.ValueOperator(content);
		this[Opcode.CSS_CLASS] = new js.dom.template.CssClassOperator(content);
		this[Opcode.OBJECT] = new js.dom.template.ObjectOperator(content);
		this[Opcode.TEXT] = new js.dom.template.TextOperator(content);
		this[Opcode.HTML] = new js.dom.template.HtmlOperator(content);
		this[Opcode.NUMBERING] = new js.dom.template.NumberingOperator(this._template, content);
		this[Opcode.LIST] = new js.dom.template.ListOperator(this._template, content);
		this[Opcode.OLIST] = new js.dom.template.OListOperator(this._template, content);
		this[Opcode.MAP] = new js.dom.template.MapOperator(this._template, content);
		this[Opcode.OMAP] = new js.dom.template.OMapOperator(this._template, content);
		this[Opcode.OPTIONS] = new js.dom.template.OptionsOperator(content);
	},

	/**
	 * Get operator instance.
	 * 
	 * @param js.dom.template.Opcode opcode requested opcode.
	 * @return Function operator instance.
	 */
	getInstance : function(opcode) {
		var operator = this[opcode];
		$assert(typeof operator !== "undefined", "js.dom.template.OperatorFactory#getInstance", "Operator |%s| is not implemented.", opcode);
		return operator;
	},

	// HACK
	getResetOperator : function(opcode) {
		var content = new js.dom.template.Content({});

		var Opcode = js.dom.template.Opcode;
		switch (opcode) {
		case Opcode.GOTO:
			return new js.dom.template.GotoOperator(content);
		case Opcode.EXCLUDE:
			return new js.dom.template.ExcludeOperator(content);
		case Opcode.IF:
			return new js.dom.template.IfOperator(content);
		case Opcode.ATTR:
			return new js.dom.template.AttrOperator(content);
		case Opcode.ID:
			return new js.dom.template.IdOperator(content);
		case Opcode.SRC:
			return new js.dom.template.SrcOperator(content);
		case Opcode.HREF:
			return new js.dom.template.HrefOperator(content);
		case Opcode.TITLE:
			return new js.dom.template.TitleOperator(content);
		case Opcode.VALUE:
			return new js.dom.template.ValueOperator(content);
		case Opcode.CSS_CLASS:
			return new js.dom.template.CssClassOperator(content);
		case Opcode.OBJECT:
			return new js.dom.template.ObjectOperator(content);
		case Opcode.TEXT:
			return new js.dom.template.TextOperator(content);
		case Opcode.HTML:
			return new js.dom.template.HtmlOperator(content);
		case Opcode.NUMBERING:
			return new js.dom.template.NumberingOperator(this._template, content);
		case Opcode.LIST:
			return new js.dom.template.ListOperator(this._template, content);
		case Opcode.OLIST:
			return new js.dom.template.OListOperator(this._template, content);
		case Opcode.MAP:
			return new js.dom.template.MapOperator(this._template, content);
		case Opcode.OMAP:
			return new js.dom.template.OMapOperator(this._template, content);
		case Opcode.OPTIONS:
			return new js.dom.template.OptionsOperator(content);
		}
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.OperatorFactory";
	}
};
$extends(js.dom.template.OperatorFactory, Object);
