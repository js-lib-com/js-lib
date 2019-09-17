$package("js.format");

/**
 * Format instances factory. Because regional settings are immutable on client, format instances are singletons, that
 * is, a single instance for given format class. This factory takes care to not instantiate more.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.format.Factory = {
	/**
	 * Format instances pool.
	 * 
	 * @type Object
	 */
	_pool : {},

	/**
	 * Get format instance for class. Instance to retrieve is identified by given class name argument which designates a
	 * class that may implement <em>format</em>, <em>parse</em> and <em>test</em> methods. Returns null if class
	 * name argument is null.
	 * 
	 * @param String className the name of format class.
	 * @return Object format instance of requested class or null.
	 */
	getFormat : function(className) {
		if (className === null) {
			return null;
		}
		var instance = this._pool[className];
		if (typeof instance !== "undefined") {
			return instance;
		}

		var clazz = js.lang.Class.forName(className);
		$assert(js.lang.Types.isFunction(clazz), "js.format.Factory#getFormat", "Formatter class is not a function.");

		instance = new clazz();
		this._pool[className] = instance;
		return instance;
	}
};
