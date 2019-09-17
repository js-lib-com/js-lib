$package("js.net");

/**
 * HTTP-RMI client. Invoke requested method on remote server. Remote class and method names should target and existing
 * server method declared as remote. Parameters are processed by position so their names is not important. Missing
 * parameters are send as null.
 * 
 * <pre>
 * var rmi = new js.net.RMI();
 * rmi.setMethod("comp.prj.Service", "remoteMethod");
 * rmi.setParameters(transactionID, remoteSpace);
 * rmi.exec(callback, scope);
 * </pre>
 * 
 * <p>
 * This class provides an error hook usable when special clean-up logic should be executed if RMI transaction fails. For
 * example it can be used to hide a progress or loading indicator as in snippet below. Please note that user defined
 * error handler got error message and is handler responsibility to display it, if desirable.
 * 
 * <pre>
 *  rmi.setErrorHandler(function(er) {
 *      loadingMessage.hide();
 *  }, this);
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct RMI transaction instance. This constructor allows for two optional arguments. First,
 * <code>remoteContextURL</code> is used when this RMI instance is used cross domain, i.e. server is CORS. The second,
 * <code>forceSynchronousMode</code> forces internal request transaction to work synchronously, if is true.
 * <p>
 * If no arguments supplied uses default values, that is, null for remote context URL and false for force synchronous
 * mode. If a single argument, process it by type: remote context URL is a {@link String} whereas force synchronous mode
 * is a {@link Boolean}; if two arguments process them by order.
 * @param String... remoteContextURL optional remote context URL for cross domain RMI, default to null,
 * @param Boolean... forceSynchronousMode force synchronous mode, optional, default to false.
 * @assert the number of arguments is at most two and are of proper types and order.
 */
js.net.RMI = function() {
	$assert(this instanceof js.net.RMI, "js.net.RMI#RMI", "Invoked as function.");

	/**
	 * Remote context URL used when RMI is performed cross domain. It is initialized from optional constructor
	 * arguments. Default to null.
	 * 
	 * @type String
	 */
	this._remoteContextURL = null;

	/**
	 * Force XHR synchronous mode flag. Initialized from optional constructor arguments. Default to false.
	 * 
	 * @type Boolean
	 */
	this._forceSynchronousMode = false;

	if (arguments.length > 0) {
		if (arguments.length === 1) {
			if (js.lang.Types.isString(arguments[0])) {
				this._remoteContextURL = arguments[0];
			}
			else {
				$assert(js.lang.Types.isBoolean(arguments[0]), "js.net.RMI#RMI", "Invalid argument type |%s|. Expected String or Boolean.", typeof arguments[0]);
				this._forceSynchronousMode = arguments[0];
			}
		}
		else {
			$assert(arguments.length < 3, "js.net.RMI#RMI", "Invalid number of arguments |%d|.", arguments.length);

			$assert(js.lang.Types.isString(arguments[0]), "js.net.RMI#RMI", "Invalid remote context URL argument type |%s|.", typeof arguments[0]);
			this._remoteContextURL = arguments[0];

			$assert(js.lang.Types.isBoolean(arguments[1]), "js.net.RMI#RMI", "Invalid force synchronous mode argument type |%s|.", typeof arguments[1]);
			this._forceSynchronousMode = arguments[1];
		}
	}

	/**
	 * Remote class name.
	 * 
	 * @type String
	 */
	this._className = null;

	/**
	 * Remote method name.
	 * 
	 * @type String
	 */
	this._methodName = null;

	/**
	 * Remote method parameter(s).
	 * 
	 * @type Object
	 */
	this._parameters = null;

	/**
	 * Callback function executed at RMI completion.
	 * 
	 * @type Function
	 */
	this._callback = null;

	/**
	 * Callback run-time execution scope.
	 * 
	 * @type Object
	 */
	this._scope = null;

	/**
	 * Callback function executed on RMI transaction error.
	 * 
	 * @type Function
	 */
	this._errorHandler = null;

	/**
	 * Error handler run-time execution scope.
	 * 
	 * @type Object
	 */
	this._errorHandlerScope = null;

	/**
	 * Server asynchronous request.
	 * 
	 * @type js.net.XHR
	 */
	this._xhr = null;

	/**
	 * Remote method parameters, possible empty.
	 * 
	 * @type Array
	 */
	this._parameters = [];
};

/**
 * Local loop value.
 * 
 * @type Object
 */
js.net.RMI._loopValues = {};

/**
 * Activate local loop.
 * 
 * @param String remoteClass remote class name,
 * @param String remoteMethod remote method name,
 * @param Object value emulated return value.
 */
js.net.RMI.setLoop = function(remoteClass, remoteMethod, value) {
	this._loopValues[remoteClass + "$" + remoteMethod] = value;
};

/**
 * Remove local loop.
 * 
 * @param String remoteClass remote class name,
 * @param String remoteMethod remote method name.
 */
js.net.RMI.removeLoop = function(remoteClass, remoteMethod) {
	delete this._loopValues[remoteClass + "$" + remoteMethod];
};

/**
 * Loop state. Check if there is a configured local loop for given request.
 * 
 * @param js.net.RMI rmi RMI instance.
 * @return Boolean true if this request has local loop active.
 */
js.net.RMI._hasLoop = function(rmi) {
	return typeof this._loopValues[rmi._className + "$" + rmi._methodName] !== "undefined";
};

/**
 * Get local loop value. Return the loop value associated with given request or undefined if there is no configured.
 * 
 * @param js.net.RMI rmi RMI instance.
 * @return Object request loop value or undefined.
 */
js.net.RMI._getLoopValue = function(rmi) {
	return this._loopValues[rmi._className + "$" + rmi._methodName];
};

js.net.RMI.prototype = {
	/**
	 * Set remote method. Every remote method belongs to a remote class so this setter actually sets both remote class
	 * and its method. If any argument is undefined, null or empty this setter does nothing.
	 * 
	 * @param String className remote class name,
	 * @param String methodName remote method name.
	 * @return js.net.RMI this object.
	 * @assert any argument is not undefined, null or empty and is a {@link String}.
	 */
	setMethod : function(className, methodName) {
		$assert(className && js.lang.Types.isString(className), "js.net.RMI#setMethod", "Class name is undefined, null, empty or not a string.");
		$assert(methodName && js.lang.Types.isString(methodName), "js.net.RMI#setMethod", "Method name is undefined, null, empty or not a string.");
		if (className && methodName) {
			this._className = className;
			this._methodName = methodName;
		}
		return this;
	},

	/**
	 * Set remote method parameter(s). Set one or more parameters for remote method. Note that parameters are processed
	 * by position so this setter arguments order should respect remote method signature. Is not legal to call this
	 * setter multiple times. Null value is accepted but undefined is considered bug indicator.
	 * 
	 * @param Object... parameters remote method parameter(s).
	 * @return js.net.RMI this object.
	 * @assert at least one argument is present and none is undefined.
	 */
	setParameters : function(parameters) {
		$assert(arguments.length > 0, "js.net.RMI#setParameters", "Missing argument.");
		$assert(typeof parameters !== "undefined", "js.net.RMI#setParameters", "Undefined parameter(s).");
		if (typeof parameters === "undefined") {
			return this;
		}

		if (parameters !== null && typeof parameters.callee === "function") {
			var startIdx = arguments.length > 1 ? arguments[1] : 0;
			if (startIdx >= arguments[0].length) {
				return this;
			}
			var args = [];
			for (var i = startIdx; i < arguments[0].length; i++) {
				args.push(arguments[0][i]);
			}
			this.setParameters.apply(this, args);
			return this;
		}

		// remote parameters are send using HTTP request message body encoded as JSON array
		// anyway, DOM documents and forms are special cases, they are encoded as XML or multipart
		// if last cases, parameters to send are actually an object but not an array
		if (arguments.length >= 1 && (arguments[0] instanceof js.dom.Document || arguments[0] instanceof js.dom.Form)) {
			this._parameters = arguments[0];
			return this;
		}

		for (var i = 0; i < arguments.length; ++i) {
			$assert(typeof arguments[i] !== "undefined", "js.net.RMI#addParameter", "Argument is undefined.");
			if (typeof arguments[i] !== "undefined") {
				this._parameters.push(arguments[i]);
			}
		}
		return this;
	},

	/**
	 * Set error handler executed if this RMI transaction fails.
	 * 
	 * @param Function errorHandler error handler,
	 * @param Object... errorHandlerScope optional error handler execution scope, default to global scope.
	 * @return js.net.RMI this object.
	 * @assert <code>errorHandler</code> parameter is a {@link Function} and <code>scope</code> is an {@link Object},
	 * if present.
	 */
	setErrorHandler : function(errorHandler, errorHandlerScope) {
		$assert(js.lang.Types.isFunction(errorHandler), "js.net.RMI#setErrorHandler", "Error handler parameter is not a function.");
		$assert(typeof errorHandlerScope === "undefined" || js.lang.Types.isObject(errorHandlerScope), "js.net.RMI#setErrorHandler", "Error handler scope parameter is not an object.");

		this._errorHandler = errorHandler;
		this._errorHandlerScope = errorHandlerScope;
		return this;
	},

	/**
	 * Execute this RMI transaction.
	 * 
	 * @param Function... callback optional callback function, no default value,
	 * @param Object... scope optional callback run-time execution scope, default to global scope.
	 * @return Object remote value if synchronous mode or undefined.
	 * @assert <code>callback</code> and <code>scope</code> parameters are or proper type, if exist.
	 */
	exec : function(callback, scope) {
		$assert(typeof callback === "undefined" || js.lang.Types.isFunction(callback), "js.net.RMI#exec", "Callback parameter is not a function.");
		$assert(typeof scope === "undefined" || js.lang.Types.isObject(scope), "js.net.RMI#exec", "Scope parameter is not an object.");

		this._callback = callback;
		this._scope = scope || window;
		if (js.net.RMI._hasLoop(this)) {
			try {
				return this._onLoad(js.net.RMI._getLoopValue(this));
			} catch (er) {
				js.ua.System.error(er);
				return null;
			}
		}

		// class and method names are conveyed using HTTP request URI
		// so, "comp.prj.Class" and "method" becomes "comp/prj/Class/method.rmi"
		// if this RMI is performed cross domain insert remote context at url begin
		// in this case request URI may be: http://host/context/comp/prj/Class/method.rmi
		var requestURI = "";
		if (this._remoteContextURL !== null) {
			requestURI += this._remoteContextURL;
			requestURI += '/';
		}
		requestURI += (this._className.replace(/\./g, "/") + "/" + this._methodName + ".rmi");
		$debug("js.net.RMI#exec", "RMI call on %s(%s).", requestURI, this._parameters !== null ? this._parameters.toString() : "");

		this._xhr = new js.net.XHR();
		this._xhr.on("load", this._onLoad, this);
		if (this._errorHandler !== null) {
			this._xhr.on("error", this._errorHandler, this._errorHandlerScope || window);
		}
		this._xhr.open(js.net.Method.POST, requestURI, !this._forceSynchronousMode);

		var remoteValue = null;
		if (this._parameters.length === 1 && this._parameters[0] instanceof FormData) {
			remoteValue = this._xhr.send(this._parameters[0]);
		}
		else {
			remoteValue = this._xhr.send(this._parameters);
		}
		return this._forceSynchronousMode ? remoteValue : undefined;
	},

	/**
	 * Server response handler.
	 * 
	 * @param Object value remote method return value.
	 */
	_onLoad : function(value) {
		if (this._callback) {
			this._callback.call(this._scope, value);
		}
		delete this._callback;
		delete this._scope;
		delete this._xhr;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.net.RMI";
	}
};
$extends(js.net.RMI, Object);
