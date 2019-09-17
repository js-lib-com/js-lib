$package("js.dom.template");

/**
 * Set element descendants to object properties. Being below snippet, templates engine loads person instance from
 * content, update h2 element text content to person name and img source to person picture.
 * 
 * <pre>
 *  &lt;section data-object="person"&gt;
 *      &lt;h1 data-text="name"&gt;&lt;/h1&gt;
 *      &lt;img data-src="picture" /&gt;
 *  &lt;/section&gt;
 *  
 *  var Person {
 *      name: "name",
 *      picture: "picture.png"
 *  }
 * </pre>
 * 
 * This operator's operand is a property path designating the object which properties are to be injected. One may notice
 * h1 and img elements operators uses property paths relative to person instance. This is because templates engine
 * temporarily changes scope object to person instance while processing element's descendants. Anyway, keep in mind that
 * only descendant's are processed in the person scope; if defining element has conditional or attribute operators they
 * are evaluated in currently existing scope. In below sample, section title is set to parent not child name.
 * 
 * <pre>
 *  &lt;section data-object="child" data-title="name"&gt;
 *      &lt;h1 data-text="name"&gt;&lt;/h1&gt;
 *  &lt;/section&gt;
 * 
 *  var Parent {
 *      name: "parent",
 *      child: child
 *  }
 *  var Child {
 *      name: "child"
 *  }
 * </pre>
 * 
 * Note that this operator belongs to {@link Type#CONTENT} group and only one content operator is allowed per element.
 * See the {@link Type#CONTENT the list} of mutually excluding content operators.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct OBJECT operator instance.
 * @param js.dom.template.Content content dynamic content.
 */
js.dom.template.ObjectOperator = function(content) {
	this.$super(content);
};

js.dom.template.ObjectOperator.prototype = {
	/**
	 * Execute object operator. This operator just returns the new object scope to be used by templates engine. If
	 * requested object is null warn the event and return the null value. Templates engine consider returned null as
	 * fully processed branch signal.
	 * 
	 * @param js.dom.Element element unused context element,
	 * @param Object scope scope object,
	 * @param String propertyPath object property path.
	 * @return Object new scope object or null.
	 * @throws js.dom.template.ContentException if requested content value is undefined.
	 */
	_exec : function(element, scope, propertyPath) {
		if (scope === null) {
			return null;
		}
		$assert(propertyPath === "." || js.lang.Types.isStrictObject(scope), "js.dom.template.ObjectOperator#exec", "Operand is property path but scope is not an object.");
		var value = this._content.getValue(scope, propertyPath);
		if (value === null) {
			$warn("js.dom.template.ObjectOperator#_exec", "Null scope for property |%s| on element |%s|.", propertyPath, element);
		}
		else if ((propertyPath === "." && js.lang.Types.isFunction(value)) || (propertyPath !== "." && !js.lang.Types.isStrictObject(value))) {
			throw new js.dom.template.ContentException(propertyPath, "Invalid content type. Expected strict object but got |%s|.", js.lang.Types.getTypeName(value));
		}
		element.setUserData("value", value);
		return value;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.dom.template.ObjectOperator";
	}
};
$extends(js.dom.template.ObjectOperator, js.dom.template.Operator);
