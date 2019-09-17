// refrain to use $package operator since is not yet defined
(function() {
	if (typeof js === "undefined") {
		js = {};
	}
	if (typeof js.lang === "undefined") {
		js.lang = {};
	}
})();

/**
 * Language pseudo-operators. This utility class implements language operators extension, globally accessible. It
 * supplies support for package declaration and class extension, hard dependencies declaration, global <b>C</b> like
 * string formatter, static and legacy blocks, assertion and logging.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.lang.Operator = {
	/**
	 * Valid class name pattern.
	 * 
	 * @type RegExp
	 */
	_CLASS_NAME_REX : /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*(\.[A-Z][a-zA-Z0-9_]*)+$/,

	/**
	 * Valid package name pattern.
	 * 
	 * @type RegExp
	 */
	_PACKAGE_NAME_REX : /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/,

	/**
	 * Assert expression is true. Evaluate expression and if false throws {@link js.lang.AssertException}. If assertion
	 * is disabled, by calling $assert.disable(), this operator does nothing, i.e. is replaced with an empty function.
	 * Is possible to disable assertions for block of code like in snippet below:
	 * 
	 * <pre>
	 * 	$assert.disable();
	 * 	...
	 * 	block of code executed with assertions disabled
	 * 	...
	 * 	$assert.enable();
	 * </pre>
	 * 
	 * @param Boolean expression expression to evaluate,
	 * @param String method method qualified name,
	 * @param String message assertion failure reason,
	 * @param Object... args optional message arguments, if formatted.
	 * @note j(s)-lib building tool can be instructed to remove assertion statements all together from created archive.
	 */
	$assert : function(expression, method, message) {
		if (Boolean(expression)) {
			return;
		}

		switch (arguments.length) {
		case 1:
			message = "Assertion fails";
			break;

		case 2:
			message = "Assertion fails on " + method;
			break;

		case 3:
			message = method + ": " + message;
			break;

		default:
			var args = [ message ];
			for (var i = 3; i < arguments.length; ++i) {
				args.push(arguments[i]);
			}
			message = method + ": " + $format.apply(this, args);
		}
		throw new js.lang.AssertException(message);
	},

	/**
	 * Static initializer. Classically, static fields initialization logic is executed at script loading phase. A buggy
	 * initialization code may lead to uncaught exception and entire script loading failure. This operator takes care to
	 * execute initialization logic in a safe context: any exceptions are caught and logged. Given static initializer
	 * code should require no arguments and return void.
	 * 
	 * <p>
	 * Note that initializer code is actually executed by {@link js.ua.Window} after DOM ready but before triggering
	 * related events. This way static initialization occur after all classes completely loaded but before launching
	 * application logic.
	 * 
	 * <p>
	 * If asynchronous mode is not convenient one may force immediate execution but keep in mind user code is
	 * responsible for dependency resolution using {@link #$include} operator.
	 * 
	 * <p>
	 * Finally, static initializer code is executed in global scope.
	 * 
	 * @param Function code static initializer code,
	 * @param Boolean... sync force synchronous mode, default to false.
	 */
	$static : function(code, sync) {
		if (sync === true) {
			try {
				code();
			} catch (er) {
				js.ua.System.error("Static initialization fails. %s", er);
			}
		}
		else {
			js.lang.Operator.$static._initializers.push(code);
		}
	},

	/**
	 * Preload DOM element class identified by given comma separated list of selectors. If given <code>selectors</code>
	 * argument is a class constructor create a selector based on class qualified name like below:
	 * 
	 * <pre>
	 * 	[data-class="comp.prj.ClassName"]
	 * </pre>
	 * 
	 * Please note that this method just register selector into internal list. The actual preload operation is executed
	 * from {@link js.ua.Window#_fireDomReady()}, just before return, but after <code>dom-ready</code> event was
	 * fired.
	 * 
	 * @param Object selectors target element selectors or class constructor.
	 * @note If given argument is a class constructor that class should implement <code>toString</code> method
	 * returning class qualified name.
	 */
	$preload : function(selectors) {
		if (typeof selectors === "function") {
			selectors = "[data-class='" + selectors.prototype.toString() + "']";
		}
		js.lang.Operator.$preload._selectors.push(selectors);
	},

	/**
	 * Package declaration. Every package should be declared before creating children classes. The notion of package is
	 * not yet implemented in JavaScript and j(s)-script solution is actually a name space emulation using object
	 * scopes. So, when one creates js.util package next code sequence is actually empowered:
	 * 
	 * <pre>
	 * 	js = {};
	 *	js.util = {};
	 * </pre>
	 * 
	 * Note that behavior is not defined if user code corrupts package name space by assign a different value to
	 * constituent objects, e.g. <code>js = value;</code>. Also do not declare local variable with packages root name
	 * like <code>var js = value;</code>. This is known limitation with no solution for now and care must be taken to
	 * avoid it. Finally, trying to declare a package already existing is ignored.
	 * 
	 * <pre>
	 * $package("comp.prj");
	 * 
	 * comp.prj.Class = function() {
	 *  // do not assign values to package component even if 3pty libraries
	 *  js.util = "value";
	 * 
	 *  // do not declare local variable with package root name even if 3pty libraries
	 *  var js = "value"; 
	 * 
	 *  // otherwise next call will fail
	 *  js.lang.Types();
	 * }
	 * </pre>
	 * 
	 * Running j(s)-lint in build phase ensure above condition is early caught.
	 * 
	 * @param String name package name. A valid package name must contains only lower case letter and decimal digits but
	 * starts with letter.
	 */
	$package : function(name) {
		var names, scope, i, j;

		if (!name || !js.lang.Operator._PACKAGE_NAME_REX.test(name)) {
			js.ua.System.error("Invalid package name |%s|.", name);
			return;
		}

		names = name.split(".");
		for (i = 0; i < names.length; i++) {
			scope = window;
			for (j = 0; j <= i; j++) {
				if (typeof scope[names[j]] === "undefined") {
					scope[names[j]] = {
						__package__ : names.slice(0, j + 1).join(".")
					};
				}
				scope = scope[names[j]];
			}
		}
	},

	/**
	 * Ensure class is declared, that is, create empty if missing. Class name should be fully qualified and this method
	 * takes care to create package, if not already created. Both static and instantiable declaration styles are
	 * supported, depending on supplied <em>staticDeclaration</em> parameter.
	 * 
	 * @param String className fully qualified class name,
	 * @param Boolean staticDeclaration optional declaration style, static of instantiable, default to static.
	 */
	$declare : function(className, staticDeclaration) {
		var names, name, scope, packageName, i;

		if (!className || !js.lang.Operator._CLASS_NAME_REX.test(className)) {
			js.ua.System.error("Invalid class name |%s|.", className);
			return;
		}
		if (typeof staticDeclaration === "undefined") {
			staticDeclaration = true;
		}

		names = className.split(".");
		for (i = 0; i < names.length; i++) {
			if (names[i].charAt(0) === names[i].charAt(0).toUpperCase()) {
				break;
			}
			scope = window;
			for (j = 0; j <= i; j++) {
				if (typeof scope[names[j]] === "undefined") {
					scope[names[j]] = {
						__package__ : names.slice(0, j + 1).join(".")
					};
				}
				scope = scope[names[j]];
			}
		}

		for (; i < names.length; i++) {
			name = names[i];
			if (typeof scope[name] === "undefined") {
				if (staticDeclaration) {
					scope[name] = {};
				}
				else {
					scope[name] = function() {
					};
				}
			}
			scope = scope[name];
		}
	},

	/**
	 * Include class. This directive is used by builder tool to declare strong dependencies.
	 * 
	 * @param String className qualified class name.
	 */
	$include : function(className) {
		if (!className || !js.lang.Operator._CLASS_NAME_REX.test(className)) {
			js.ua.System.error("Invalid class name |%s|.", className);
		}
	},

	/**
	 * Class extension. This operator adds inheritance flavor using JavaScript prototype support. It actually adds
	 * superclass prototype properties to subclass prototype but subclass takes priority, that is, subclass overrides
	 * properties with the same name.
	 * 
	 * <pre>
	 *	Control = function() {};
	 *	Control.prototype = {};
	 *	. . .
	 *	Select = function() {};
	 *	Select.prototype = {};
	 . . .
	 *	$extends(Select, Control);
	 * </pre>
	 * 
	 * In above snippet Select class extends Control, i.e. copy Control prototype properties to Select prototype. Note
	 * that at the moment $extends is executed both sub and super classes must have prototypes defined. Any change in
	 * superclass prototype after extension is not reflected in subclasses.
	 * <p>
	 * Extension logic enhance subclass with <code>$super</code> operator; can be used to invoke super constructor or
	 * overridden methods, see snippet below. Is not mandatory to call <code>$super</code> as first statement in
	 * function body. Also <code>$super</code> method searches for specified overridden method on entire hierarchy up
	 * to built-in Object. Silently log the event as error if super method not found. Finally <code>$super</code>
	 * operator behavior is not specified if try to invoke not overridden methods.
	 * 
	 * <pre>
	 *	phoenix.hc.EventInfoView = function(ownerDoc, node) {
	 *		this.$super(ownerDoc, node);
	 *		. . .
	 *		this.set = function(info) {
	 *			this.$super("set", info);
	 *		};
	 *	};
	 * </pre>
	 * 
	 * First <code>$super</code> invokes super class constructor with <code>onwerDoc</code> and <code>node</code>
	 * arguments, whereas the second invokes <code>set</code> method with <code>info</code> argument.
	 * <code>$extends</code> operator is intended for behavior inheritance exposed via prototype. All properties
	 * declared into super constructor remain private to superclass, unless <code>$super</code> constructor is
	 * explicitly invoked.
	 * <p>
	 * Note that there is a convenient way to invoke super with actual arguments, like:
	 * 
	 * <pre>
	 *	phoenix.hc.EventInfoView = function(ownerDoc, node) {
	 *		this.$super(arguments);
	 *		. . .
	 *		this.set = function(info) {
	 *			this.$super("set", arguments);
	 *		};
	 *	};
	 * </pre>
	 * 
	 * @param Function subClass constructor function to be extended,
	 * @param Function superClass inherited class.
	 * @note <strong>Best practice:</strong> always prefer composition instead inheritance.
	 */
	$extends : function(subClass, superClass) {
		if (typeof subClass === "undefined") {
			js.ua.System.error("Trying to extend undefined subclass.");
			return;
		}
		if (typeof subClass !== "function") {
			js.ua.System.error("Trying to extend invalid subclass %s.", subClass);
			return;
		}
		if (typeof superClass === "undefined") {
			js.ua.System.error("Undefined superclass when trying to extend %s.", subClass);
			return;
		}
		if (typeof superClass !== "function") {
			js.ua.System.error("Invalid superclass %s when trying to extend %s.", superClass, subClass);
			return;
		}

		var subClassPrototype = subClass.prototype;
		function F() {
		}
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		for ( var p in subClassPrototype) {
			subClass.prototype[p] = subClassPrototype[p];
		}

		if (navigator.userAgent.indexOf("MSIE") !== -1) {
			// IE refuses to list toString and valueOf in above for-each loop
			// so we need to add then manually
			if (subClassPrototype.hasOwnProperty("toString")) {
				subClass.prototype.toString = subClassPrototype.toString;
			}
			if (subClassPrototype.hasOwnProperty("valueOf")) {
				subClass.prototype.valueOf = subClassPrototype.valueOf;
			}
		}

		// there are rumors that constructor property is not reliable; just to be on safe side take care to properly
		// initialize it, in the case of prototype overwrite, but internally uses j(s)-lib specific __ctor__ property
		// NOTE: it is important to use $extends even declared class has no superclass; uses Object
		// if $extends is not used constructor properties are not properly initialized
		subClass.prototype.constructor = subClass;
		subClass.prototype.__ctor__ = subClass;
		subClass.__super__ = superClass;

		// if superclass function has a function named $extends it is called at this moment giving superclass
		// opportunity to execute some logic whenever it is extended
		if (typeof superClass.$extends === "function") {
			superClass.$extends.call(superClass, subClass);
		}

		/**
		 * Arguments internal helper. If given <em>args</em> has only one item of "actual arguments" type just returns
		 * it; otherwise returns given args. This pre-processing allows for passing actual arguments when invoke super
		 * constructor or method, like below:
		 * 
		 * <pre>
		 * 	this.$super(arguments);
		 * 	. . .
		 * 	this.$super("method", arguments);
		 * </pre>
		 */
		function getArguments(args) {
			if (args.length === 1 && args[0] && typeof args[0] !== "string" && typeof args[0].length !== "undefined" && typeof args[0].push === "undefined") {
				// if caller supplies its own actual arguments, that is, passes 'arguments' keyword
				// given args contains only one 'array like' item, i.e. it has length property but no built-in method
				// like push; in such case returns caller actual 'arguments'

				// the second test from above if() checks for both undefined and null

				return args[0];
			}
			return args;
		}

		// enhance subclass with $super accessor
		subClass.prototype.$super = function() {
			var caller, methodName, args, ctor, method, value;

			caller = subClass.prototype.$super.caller;
			if (typeof caller.__super__ === "function") {
				// if __super__, the secret link to superclass, is present the caller is a constructor
				caller.__super__.apply(this, getArguments(arguments));
				return;
			}

			// if __super__ is missing the caller should be an instance method
			// and first argument should be the method name
			methodName = arguments[0];
			args = getArguments($args(arguments, 1));

			if (this.hasOwnProperty(methodName)) {
				// special case: allow subclass to declare method in constructor
				ctor = this.__ctor__;
			}
			else {
				// search caller up on prototypes chain
				for (ctor = this.__ctor__; ctor; ctor = ctor.__super__) {
					if (ctor.prototype.hasOwnProperty(methodName) && ctor.prototype[methodName] === caller) {
						break;
					}
				}
			}

			// here ctor variable holds a reference to constructor of caller method, no
			// matter method is declared in constructor or in prototype
			if (!(ctor && ctor.__super__)) {
				js.ua.System.error("Super method |%s| does not override a subclass method.", methodName);
				return;
			}
			method = ctor.__super__.prototype[methodName];
			if (typeof method === "undefined") {
				js.ua.System.error("Super method |%s| not found.", methodName);
				return;
			}
			if (typeof method !== "function") {
				js.ua.System.error("Super method |%s| is not a function.", methodName);
				return;
			}
			method.__super_call__ = true;
			value = method.apply(this, args);
			method.__super_call__ = false;
			return value;
		};
	},

	/**
	 * Class implementation. This pseudo-operator is used by tools. It helps on documentation generation and to check
	 * implementation consistency.
	 * 
	 * @param Function subClass
	 * @param Object superInterface
	 */
	$implements : function(subClass, superInterface) {
		for ( var methodName in superInterface) {
			if (typeof subClass.prototype[methodName] === "undefined") {
				js.ua.System.error("Missing method |%s| implementation from class |%s|.", methodName, subClass);
			}
		}
	},

	/**
	 * Add functionality to target class but no related semantic. This method simply inject members, both public and
	 * private for <code>mixin</code> into class prototype but takes care to not override existing target members.
	 * 
	 * @param Function targetClass target class to add functionality to,
	 * @param Object mixin object storing reusable logic.
	 */
	$mixin : function(targetClass, mixin) {
		if (typeof targetClass !== "function") {
			js.ua.System.error("Mixin target is not a class.");
			return;
		}
		if (typeof mixin !== "object") {
			js.ua.System.error("Mixin source is not an object.");
			return;
		}
		var target = targetClass.prototype;
		for ( var p in mixin) {
			if (mixin.hasOwnProperty(p) && typeof target[p] === "undefined") {
				target[p] = mixin[p];
			}
		}
	},

	/**
	 * Convert function actual arguments to {@link Array}. Return a sub-array from given start index to arguments end.
	 * If no start index supplied all arguments are included. Returns undefined if supplied <em>args</em> is not a
	 * valid function arguments object.
	 * 
	 * @param Object args caller function arguments,
	 * @param Number startIdx optional starting index.
	 * @return Array array of given arguments, possible empty or undefined.
	 */
	$args : function(args, startIdx) {
		// function arguments is actually an array like object having callee property
		if (typeof args === "undefined" || args === null || typeof args.callee !== "function") {
			js.ua.System.error("Invalid function call arguments: undefined, null or callee function missing.");
			return;
		}
		if (typeof startIdx === "undefined") {
			startIdx = 0;
		}
		var a = [];
		for (var i = startIdx; i < args.length; i++) {
			a.push(args[i]);
		}
		return a;
	},

	/**
	 * Legacy code variant. This operator offers means for code portability whenever user agents depart from W3C specs.
	 * It evaluates expression - relevant for non-standard functionality and if true execute legacy code. This legacy
	 * code align user agent implementation to standard, mostly using an emulation. Function to be executed should
	 * required no arguments and return nothing; log to error if given legacy code is not a function or its execution
	 * rise exceptions.
	 * 
	 * <pre>
	 * 	$legacy(js.ua.Engine.TRIDENT, function() {
	 * 		js.dom.Node.firstElementChild = function(node) {
	 * 			. . .
	 * 		}
	 * 	});
	 * </pre>
	 * 
	 * This operator is primarily for library benefits; user space code need not to concern about low level
	 * compatibility issues.
	 * 
	 * @param Boolean expression expression to evaluate,
	 * @param Function legacyCode legacy code.
	 */
	$legacy : function(expression, legacyCode) {
		if (!expression) {
			return;
		}
		try {
			legacyCode();
		} catch (er) {
			js.ua.System.error("Legacy code execution fail. %s", er);
		}
	},

	// Refrain to use the same characters for flags and conversion. Current implementation may confuse them.
	// _FORMAT_PATTERN : /%%|%(?:(\d+)\$)?([-#a-zA-Z]+)?(\d+)?(?:\.(\d+))?([a-zA-Z])/g,

	/**
	 * Format pattern.
	 * 
	 * @type RegExp
	 */
	_FORMAT_PATTERN : /%%|%(?:(\d+)\$)?([-])?(\d+)?(?:\.(\d+))?([sSdeEoxX])/g,

	/**
	 * Simple string formatter. It is a rather quick approach for unsophisticated formatting and is not regional aware;
	 * is not intended to replace specialized format classes. This operator produces formatted output requiring a format
	 * string and an argument list. The format string is a String which may contain fixed text and one or more embedded
	 * format specifiers.
	 * 
	 * <pre>
	 * 	$format("%s is %d years old.", "John Doe", 48);
	 * </pre>
	 * 
	 * The format specifiers have the following syntax:
	 * 
	 * <pre>
	 * 	%[index$][flags][width][.precision]conversion
	 * </pre>
	 * 
	 * <ul>
	 * <li>index, optional, is a integer indicating the position of the argument in the argument list. The first
	 * argument is referenced by <b>1$</b>, the second by <b>2$</b>, etc.
	 * 
	 * <li>flags, optional, is a set of characters that modify the output format. The set of valid flags depends on the
	 * conversion.
	 * 
	 * <li>width, optional, is a non-negative integer indicating the minimum number of characters to be written to the
	 * output.
	 * 
	 * <li>precision, optional, is a non-negative integer usually used to restrict the number of characters. The
	 * specific behavior depends on the conversion.
	 * 
	 * <li>conversion is a character indicating how the argument should be formatted. The set of valid conversions for
	 * a given argument depends on the argument"s data type.
	 * </ul>
	 * 
	 * <p>
	 * Current implementation recognizes next conversion characters: <table>
	 * <tr>
	 * <td width=40><b>s,S</b>
	 * <td width=90>string
	 * <td>If argument is not a String convert it via toString(). Truncate output string to width, if defined; add
	 * spaces to complete to precision length. If flag is "-" spaces are inserted at beginning.
	 * <tr>
	 * <td><b>d</b>
	 * <td>integer
	 * <td>If argument is a Number returns its rounded value as a String. Otherwise try first to convert argument to
	 * Number. If fail returns NaN.
	 * <tr>
	 * <td><b>e,E</b>
	 * <td>real
	 * <td>If argument is a Number returns its value as a String. Otherwise try first to convert argument to Number. If
	 * fail returns NaN.
	 * <tr>
	 * <td><b>o</b>
	 * <td>octal
	 * <td>If argument is a Number returns its value as a String using radix 8. Otherwise try first to convert argument
	 * to Number. If fail returns NaN.
	 * <tr>
	 * <td><b>x,X</b>
	 * <td>hexadecimal
	 * <td>If argument is a Number returns its value as a String using radix 16. Otherwise try first to convert
	 * argument to Number. If fail returns NaN. </table>
	 * <p>
	 * Upper case variants uses the lower case handler followed by toUpperCase(). If conversion is the percent character
	 * just returns its value. i.e. <b>%%</b> produces a single <b>%</b>.
	 * 
	 * <p>
	 * Argument from arguments list is identified by indices. There are two kind: explicit using "$" syntax and ordinary
	 * index. Each format specifier which uses ordinary indexing is assigned a sequential implicit value which is
	 * independent of the indices used by explicit indexing.
	 * 
	 * <p>
	 * Format first argument should be a String. If not, returns immediately given argument value, after applying
	 * toString(). Finally, this operator can be call with a function actual arguments, as below:
	 * 
	 * <pre>
	 * 	function fn(format, args) {
	 * 		$format(arguments);
	 * 	}
	 * </pre>
	 * 
	 * This allows for creation of functions with format like signature.
	 * 
	 * @param String format string format,
	 * @param Object... args variable numbers of values.
	 * @return String formatted string.
	 */
	$format : function(format) {
		if (typeof format === "undefined") {
			return "undefined";
		}
		if (format === null) {
			return "null";
		}

		if (typeof format.callee === "function") {
			// if format is a function actual arguments, concluded by callee, it may be
			// followed by start index, which determine format string position in arguments list
			var args = [];
			var startIdx = arguments.length > 1 ? arguments[1] : 0;
			var endIdx = arguments.length > 2 ? arguments[2] : arguments[0].length;
			for (var i = startIdx; i < endIdx; i++) {
				args.push(arguments[0][i]);
			}
			return this.$format.apply(this, args);
		}

		if (typeof format !== "string" && !(format instanceof String)) {
			return format.toString();
		}

		function string(value, flag, width, precision) {
			if (typeof value === "undefined") {
				return "undefined";
			}
			if (value === null) {
				return "null";
			}
			if (typeof value !== "string" && !(value instanceof String)) {
				if (typeof value === "function") {
					if (typeof value.prototype !== "undefined" && typeof value.prototype.toString === "function") {
						value = value.prototype.toString();
					}
					else {
						value = "unknown";
					}
				}
				else if (value instanceof Array) {
					value = "Array[" + value.length + "]";
				}
				else if (value instanceof Error && typeof value.message !== "undefined") {
					value = value.message;
				}
				else if (typeof value.trace === "function") {
					value = value.trace();
				}
				else {
					value = typeof value.toString === "function" ? value.toString() : "unknown";
				}
			}
			if (typeof width !== "undefined") {
				var i = value.length;
				if (flag === "-") {
					for (; i < width; ++i) {
						value = " " + value;
					}
				}
				else {
					for (; i < width; ++i) {
						value = value + " ";
					}
				}
			}
			if (typeof precision !== "undefined") {
				value = value.substr(0, precision);
			}
			return value;
		}

		function STRING(value, flag, width, precision) {
			if (value === null) {
				return "null";
			}
			return string(value, flag, width, precision).toUpperCase();
		}

		function integer(value, flag, width, precision, radix, noround) {
			if (value === null) {
				return "0";
			}
			if (typeof value !== "number" && !(value instanceof Number)) {
				js.ua.System.print("Expected number but get " + typeof value + " when trying to format integer value.");
				value = Number(value);
			}
			if (!noround) {
				value = Math.round(value);
			}
			var s = value.toString(radix ? radix : 10);
			for (var i = s.length; i < width; ++i) {
				s = "0" + s;
			}
			return s;
		}

		function real(value, flag, width, precision) {
			return integer(value, flag, width, precision, 10, true);
		}

		function octal(value, flag, width, precision) {
			return integer(value, flag, width, precision, 8);
		}

		function hexadecimal(value, flag, width, precision) {
			return integer(value, flag, width, precision, 16);
		}

		function HEXADECIMAL(value, flag, width, precision) {
			return hexadecimal(value, flag, width, precision).toUpperCase();
		}

		var handlers = {
			s : string,
			S : STRING,
			d : integer,
			e : real,
			E : real,
			o : octal,
			x : hexadecimal,
			X : HEXADECIMAL
		};

		var args = [];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}

		var ordinaryIndex = 0;
		js.lang.Operator._FORMAT_PATTERN.lastIndex = 0;
		return format.replace(js.lang.Operator._FORMAT_PATTERN, function(match, index, flag, width, precision, conversion, offset, format) {
			if (match === "%%") {
				return "%";
			}

			// there are browsers returning empty string instead of undefined for optional capture
			// example would be FF and IE8
			if (index === "") {
				index = undefined;
			}
			if (flag === "") {
				flag = undefined;
			}
			if (width === "") {
				width = undefined;
			}
			if (precision === "") {
				precision = undefined;
			}

			index = typeof index !== "undefined" ? Number(index) - 1 : ordinaryIndex++;
			if (typeof width !== "undefined") {
				width = Number(width);
			}
			if (typeof precision !== "undefined") {
				precision = Number(precision);
			}
			var handler = handlers[conversion];
			if (typeof handler === "undefined") {
				js.ua.System.print("No handler for conversion of <" + conversion + ">. Use string handler.");
				handler = handlers.s;
			}
			var value = args[index];
			if (typeof value === "undefined") {
				value = null;
			}
			return handler(value, flag, width, precision);
		});
	},

	/**
	 * Get element by name. Search for element with requested name, into the given search scope or the main window
	 * document, if <code>context</code> parameter is missing. If there are more elements with the given name returns
	 * the first one, first into depth-first order. Returns null is no element found.
	 * 
	 * @param Object... context element searching context,
	 * @param String name element name.
	 * @return js.dom.Element found element or null.
	 */
	$name : function(context, name) {
		return this._searchWorker("getByName", arguments);
	},

	/**
	 * Get element by CSS selector. Search for element identified by CSS selector, into the given search scope or the
	 * main window document, if <code>context</code> parameter is missing. If there are more elements identified by
	 * given CSS selector, returns the first one, first into depth-first order. Returns null if no element found.
	 * 
	 * @param Object... context element searching context,
	 * @param String selector CSS selector.
	 * @return js.dom.Element found element or null.
	 */
	$element : function(context, selector) {
		return this._searchWorker("getByCss", arguments);
	},

	/**
	 * Find elements by CSS selector. Search for elements identified by CSS selector, into the given search scope or the
	 * main window document, if <code>context</code> parameter is missing. Returns empty list if no element found.
	 * 
	 * @param Object... context element searching context,
	 * @param String name element name.
	 * @return js.dom.EList list of elements, possbile empty.
	 */
	$list : function(context, selector) {
		return this._searchWorker("findByCss", arguments);
	},

	/**
	 * Implements the actual search for {@link #$name}, {@link #$element} and {@link #$list} operators. The second
	 * parameter are the actual arguments used for invoker.
	 * 
	 * @param String functionName function name to actualy use for search,
	 * @param Array args search arguments.
	 * @return Object found element instance, possible null, or elements list, possible empty.
	 */
	_searchWorker : function(functionName, args) {
		// this implementation introduce hard dependency on js.dom package that is a circular dependency
		// for now is acceptable

		if (args.length == 2) {
			$assert(js.lang.Types.isFunction(args[0][functionName]), "js.lang.Operator#$name", "Invalid searching context |%s|. Missing |%s| function.", args[0], functionName);
			$assert(js.lang.Types.isString(args[1]), "js.lang.Operator#$name", "Search criterion parameter is not a string.");
			return args[0][functionName](args[1]);
		}
		$assert(js.lang.Types.isString(args[0]), "js.lang.Operator#$name", "Search criterion parameter is not a string.");
		return WinMain.doc[functionName](args[0]);
	},

	/**
	 * Send TRACE messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$trace : function(sourceName, message) {
		$log("TRACE", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Send DEBUG messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$debug : function(sourceName, message) {
		$log("DEBUG", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Send INFO messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$info : function(sourceName, message) {
		$log("INFO", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Send WARN messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$warn : function(sourceName, message) {
		$log("WARN", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Send ERROR messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$error : function(sourceName, message) {
		$log("ERROR", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Send FATAL messsage to logger. This pseudo-operator format given message and delegates
	 * {@link js.lang.Operator#$log(String,String,String)}.
	 * 
	 * @param String sourceName message source name,
	 * @param String message message to log,
	 * @param Object... args optional arguments if message is formatted.
	 */
	$fatal : function(sourceName, message) {
		$log("FATAL", sourceName, arguments.length > 2 ? $format(arguments, 1) : message);
	},

	/**
	 * Javascript engine instance start-up time.
	 * 
	 * @type Date
	 */
	_timestamp : new Date().getTime(),

	/**
	 * Low level logger. Consolidate log message from given arguments and current time and print it to system console.
	 * If console does not exists this function does nothing. If message instance of {@link Error} try to extract error
	 * message. Note that message could miss if, for example, log a TRACE message where we are interested in message
	 * source only.
	 * <p>
	 * Source name argument identify the context generating logging event and usualy is the method qualified name, but
	 * not limited to. Cross cutting sources, spread over many methods are also supported and encouraged.
	 * 
	 * @param String level message priority level,
	 * @param String sourceName message source name,
	 * @param String... message optional message to print on logger.
	 */
	$log : function(level, sourceName, message) {
		if (typeof console === "undefined") {
			return;
		}
		var t = new Date().getTime() - js.lang.Operator._timestamp;
		var text = t + " " + level + " " + sourceName;
		if (message instanceof Error) {
			message = typeof message.message !== "undefined" ? message.message : message.toString();
		}
		if (typeof message !== "undefined") {
			text += (' ' + message);
		}
		console.log(text);
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.lang.Operator";
	}
};

(function() {
	var i;

	var snippet = "js.lang.Operator.$level.disable = function() {" + //
	"	$level = js.lang.Operator.$level.NOP;" + //
	"};" + //
	"js.lang.Operator.$level.NOP = function() {" + //
	"};" + //
	"(js.lang.Operator.$level.NOP.enable = js.lang.Operator.$level.enable = function() {" + //
	"	$level = js.lang.Operator.$level;" + //
	"})();";

	var levels = [ "assert", "trace", "debug", "info", "warn", "error", "fatal" ];
	for (i = 0; i < levels.length; ++i) {
		eval(snippet.replace(/level/g, levels[i]));
	}

	/**
	 * Static blocks. Used by {@link js.lang.Operator#$static} pseudo-operator to keep track to self registered static
	 * initializers code.
	 */
	js.lang.Operator.$static._initializers = [];

	js.lang.Operator.$static.execute = function() {
		var staticBlocks = js.lang.Operator.$static._initializers;
		for (i = 0; i < staticBlocks.length; ++i) {
			try {
				staticBlocks[i]();
			} catch (er) {
				js.ua.System.error("Static block initialization fails. %s", er);
			}
		}
	};

	/**
	 * Selectors for element instances to preload.
	 */
	js.lang.Operator.$preload._selectors = [];

	// invoked from js.ua.Window#_fireDomReady, just before return, after dom-ready event was fired
	js.lang.Operator.$preload.execute = function() {
		var selectors = js.lang.Operator.$preload._selectors, it;
		for (i = 0; i < selectors.length; i++) {
			it = WinMain.doc.findByCss(selectors[i]).it();
			while (it.hasNext()) {
				try {
					it.next();
				} catch (er) {
					js.ua.System.error(er);
				}
			}
		}
	};
})();

$static = js.lang.Operator.$static;
$preload = js.lang.Operator.$preload;
$package = js.lang.Operator.$package;
$declare = js.lang.Operator.$declare;
$include = js.lang.Operator.$include;
$extends = js.lang.Operator.$extends;
$implements = js.lang.Operator.$implements;
$mixin = js.lang.Operator.$mixin;
$args = js.lang.Operator.$args;
$legacy = js.lang.Operator.$legacy;

$log = js.lang.Operator.$log;

$format = js.lang.Operator.$format;
$name = js.lang.Operator.$name;
$element = js.lang.Operator.$element;
$list = js.lang.Operator.$list;

$f = js.lang.Operator.$format;
$n = js.lang.Operator.$name;
$e = js.lang.Operator.$element;
$l = js.lang.Operator.$list;

// dollar name is used by jQuery; it can be configured to not but is not adviseable
