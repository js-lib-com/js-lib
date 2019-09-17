$package("js.lang");

/**
 * Class utility.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.lang.Class = {
	/**
	 * Server side script class loader request URI.
	 * 
	 * @type String
	 */
	_CLASS_LOADER_URL : "js/core/JsClassLoader/loadClass.rmi",

	/**
	 * Loaded classes cache.
	 * 
	 * @type Object
	 */
	_cache : {},

	/**
	 * Returns the named class.
	 * 
	 * @param String className qualified class name.
	 * @return Function named class or null.
	 * @assert class name is not undefined, null or empty and is a {@link String}.
	 */
	forName : function(className) {
		$assert(className, "js.lang.Class#forName", "Undefined, null or empty class name.");
		$assert(js.lang.Types.isString(className), "js.lang.Class#forName", "Expected string but got %s.", js.lang.Types.getTypeName(className));

		var clazz = this._cache[className];
		if (typeof clazz !== "undefined") {
			return clazz;
		}

		try {
			clazz = eval(className);
			// if package exists but class from package is missing class is undefined
		} catch (er) {
			// because evaluation works on a well formed class name and only tries
			// to get a reference - i.e. does not execute any code, there is no
			// reason for exception beside not found, which is proceeded below
		}
		if (typeof clazz === "undefined") {
			$debug("js.lang.Class#forName", "Class %s not found. Try to load it from server.", className);
			clazz = this._loadClass(className);
		}
		this._cache[className] = clazz;
		return clazz;
	},

	/**
	 * Load class from server.
	 * 
	 * @param String className class name.
	 * @return Function loaded classes or null.
	 */
	_loadClass : function(className) {
		// do not use js.net package in order to avoid circular dependencies
		var xhr = new XMLHttpRequest();

		xhr.open("POST", this._CLASS_LOADER_URL, false);
		// xhr.timeout = 4000;
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.setRequestHeader("Accept", "text/javascript");

		try {
			xhr.send(js.lang.JSON.stringify(className));
			// we do not need sanity check since script comes from the same domain
			eval(xhr.responseText);
			return eval(className);
		} catch (er) {
			$error("js.lang.Class#loadClass", er);
		}
		return null;
	},

	/**
	 * Get class resource. Load named resources for class identified by its qualified name.
	 * 
	 * @param String className qualified class name,
	 * @param String resourceName resource name to retrieve.
	 * @return Object resource instance.
	 */
	getResource : function(className, resourceName) {

	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.lang.Class";
	}
};
