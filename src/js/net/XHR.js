$package("js.net");

/**
 * XML HTTP Request. This class name is a little misleading: it actually encapsulates both request and related server
 * response. Takes care to prepare HTTP request package with application data, serialized as string, send it to server
 * and wait for response package. Deserialize server data accordingly response content type.
 * 
 * <p>
 * This class is a wrapper for built-in {@link XMLHttpRequest} closely following its usage pattern:
 * <ol>
 * <li>create instance
 * <li>add event listeners
 * <li>open connection
 * <li>set request headers
 * <li>send data
 * </ol>
 * <p>
 * Steps 2 and 4 are optionally but order is mandatory. This class tracks its internal state and assert if trying to
 * abuse it in any way. An usage sample follows:
 * 
 * <pre>
 * // do not resuse js.net.XHR instances; create new instance for every transaction 
 * var xhr = new js.net.XHR();
 * 
 * xhr.on("progress", this._onProgress, this);
 * xhr.on("load", this._onLoad, this);
 * xhr.open("POST", "form-processor.xsp");
 * xhr.setHeader("X-Application", "j(s)-app");
 * xhr.send(form);
 * </pre>
 * 
 * <a id="events-description">
 * <h6>XHR Events</h6>
 * </a>
 * <p>
 * XHR transaction events is a subset of XMLHttpRequest Level 2. This implementation doesn't consider <b>loadstart</b>
 * and <b>abort</b> since they are triggered by user code actions.
 * 
 * <p>
 * <table>
 * <tr>
 * <td><b>progress</b>
 * <td>Triggered periodically if current XHR transaction sends a form. It has only one argument: a progress object that
 * is an extension of W3C Progress Event interface.
 * <tr>
 * <td><b>error</b>
 * <td>Fired on server side and networking failures. Note that this event is not triggered when application code from
 * server throws exception.
 * <tr>
 * <td><b>timeout</b>
 * <td>Fired if transaction is not completed in specified amount of time. Because form transfer duration can vary from
 * seconds to minutes timeout mechanism is actually enabled only when send objects and XML documents. Also if user code
 * set this XHR transaction timeout value to zero this event is not triggered. Timeout event has no argument.
 * <tr>
 * <td><b>load</b>
 * <td>Fired when request successfully completed. This event has only one argument, namely the object arrived from
 * server.
 * <tr>
 * <td><b>loadend</b>
 * <td>Request aborted or completed, either in error, timeout or successfully. This event has no argument. </table>
 * 
 * <h6>Self-destruction</h6>
 * <p>
 * This class releases used resources after loadend event was fired. User code must be aware of this feature and don't
 * try to access this XHR response attributes outside load event handler. Also, this class is not reentrant. Do not try
 * to reuse XHR instances; create a new one for every transaction.
 * 
 * @constructor Construct HTTP request transaction.
 */
js.net.XHR = function() {
	$assert(this instanceof js.net.XHR, "js.net.XHR#XHR", "Invoked as function.");

	/**
	 * Remote resource URL.
	 * 
	 * @type String
	 */
	this._url = null;

	/**
	 * Asynchronous request worker.
	 * 
	 * @type XMLHttpRequest
	 */
	this._request = new XMLHttpRequest();

	/**
	 * This request instance state machine.
	 * 
	 * @type js.net.XHR.StateMachine
	 */
	this._state = js.net.XHR.StateMachine.CREATED;

	/**
	 * Synchronous mode flag. All XHR transaction are asynchronous, i.e. {@link #send} returns immediately and user code
	 * should use events to acquire server response. So this flag is false by default. Anyway, there are marginal use
	 * cases where a synchronous response is more appropriate.
	 * 
	 * @type Boolean
	 */
	this._synchronousMode = false;

	/**
	 * Request timeout in milliseconds.
	 * 
	 * @type js.util.Timeout
	 */
	this._timeout = new js.util.Timeout(0);
	this._timeout.setCallback(this._onTimeout, this);

	/**
	 * Asynchronous request events.
	 * 
	 * @type js.event.CustomEvents
	 */
	this._events = new js.event.CustomEvents();
	this._events.register("progress", "error", "timeout", "load", "loadend");
};

/**
 * Default synchronous mode timeout.
 * 
 * @type Number
 */
js.net.XHR.SYNC_TIMEOUT = 4000;

/**
 * Valid header name and value.
 * 
 * @type RegExp
 */
js.net.XHR.VALID_HEADER = /^[A-Z0-9\-\/\s,\.]+$/gi;

js.net.XHR.prototype = {
	/**
	 * Add event listener. Listener function should have next signature:
	 * 
	 * <pre>
	 * 	void listener(Object... args)
	 * </pre>
	 * 
	 * where <em>args</em> are specific for every event type. See <a href="#events-description">events description</a>.
	 * 
	 * @param String type event type,
	 * @param Function listener event listener to register,
	 * @param Object scope listener run-time scope.
	 * @return js.net.XHR this object.
	 */
	on : function(type, listener, scope) {
		$assert(this._state === js.net.XHR.StateMachine.CREATED, "js.net.XHR#on", "Illegal state.");
		if (type === "progress") {
			this._request.upload.addEventListener("progress", function(ev) {
				this._events.fire("progress", ev);
			}.bind(this));
		}
		this._events.addListener(type, listener, scope || window);
		return this;
	},

	/**
	 * Set transaction timeout. A timeout value of zero disable transaction timeout that can hang indefinitely. If
	 * timeout value is not positive this method does nothing.
	 * 
	 * @param Number timeout transaction timeout in milliseconds.
	 * @return js.net.XHR this object.
	 * @assert given argument is a positive {@link Number}.
	 */
	setTimeout : function(timeout) {
		$assert(js.lang.Types.isNumber(timeout), "js.net.XHR#setTimeout", "Timeout is not a number.");
		$assert(timeout >= 0, "js.net.XHR#setTimeout", "Timeout is not strict positive.");
		this._timeout.set(timeout);
		return this;
	},

	/**
	 * Set request header. This setter is usable only after request is {@link #open opened} but before {@link #send}.
	 * Header name and value should be valid as described by {@link js.net.XHR#VALID_HEADER} pattern. Assert request is
	 * in proper state and arguments are valid. Anyway, if assert is disabled values are sent to native request as they
	 * are and rise exception if invalid.
	 * 
	 * @param String header header name,
	 * @param String value header value.
	 * @return js.net.XHR this object.
	 * @throws InvalidStateError if request is not in proper state.
	 * @throws SyntaxError if header or value is invalid.
	 * @assert request is in proper state and arguments are valid.
	 */
	setHeader : function(header, value) {
		/**
		 * @param String str
		 * @return Boolean
		 */
		function isValid(str) {
			js.net.XHR.VALID_HEADER.lastIndex = 0;
			return str && js.net.XHR.VALID_HEADER.test(str);
		}
		$assert(this._state === js.net.XHR.StateMachine.OPENED, "js.net.XHR#setHeader", "Illegal state.");
		$assert(isValid(header), "js.net.XHR#setHeader", "Header name is invalid.");
		$assert(isValid(value), "js.net.XHR#setHeader", "Header value is invalid.");
		return this._setHeader(header, value);
	},

	/**
	 * Request header setter.
	 * 
	 * @param String header header name,
	 * @param String value header value.
	 * @return js.net.XHR this object.
	 */
	_setHeader : function(header, value) {
		this._request.setRequestHeader(header, value);
		return this;
	},

	/**
	 * Get response header. Note that response header is valid only after request is successfully complete. Returns null
	 * if requested header is not found.
	 * 
	 * @param String header, header name to be retrieved.
	 * @return String the value of requested header or null.
	 */
	getHeader : function(header) {
		$assert(this._state === js.net.XHR.StateMachine.DONE, "js.net.XHR#getHeader", "Illegal state.");
		return this._request.getResponseHeader(header);
	},

	/**
	 * Get response status. Note that response status is valid only after request is successfully complete.
	 * 
	 * @return Number response status code as integer value.
	 */
	getStatus : function() {
		$assert(this._state === js.net.XHR.StateMachine.DONE, "js.net.XHR#getStatus", "Illegal state.");
		return window.parseInt(this._request.status, 10);
	},

	/**
	 * Get response status text. Useful only for debug; application developer is encouraged to use localized, less
	 * technically and meaningful messages. Note that response status text is valid only after request is successfully
	 * complete.
	 * 
	 * @return String response status English description.
	 */
	getStatusText : function() {
		$assert(this._state === js.net.XHR.StateMachine.DONE, "js.net.XHR#getStatusText", "Illegal state.");
		return this._request.statusText;
	},

	/**
	 * Open connection with server. Open connection with server and initialize default request header values. These
	 * values can be overridden by calling {@link #setHeader}.
	 * 
	 * @param js.net.Method method HTTP method,
	 * @param String url remote resource URL,
	 * @param Boolean... async optional asynchronous operation mode, default to true,
	 * @param String... user optional user name for authentication,
	 * @param String... password optional password, mandatory if user present.
	 * @return js.net.XHR this object.
	 * @assert all arguments are not undefined, null or empty and of proper type, if present.
	 */
	open : function(method, url, async, user, password) {
		$assert(this._state === js.net.XHR.StateMachine.CREATED, "js.net.XHR#open", "Illegal state.");
		this._state = js.net.XHR.StateMachine.OPENED;

		$assert(method, "js.net.XHR#open", "Undefined or null method.");
		$assert(url, "js.net.XHR#open", "Undefined or null URL.");
		$assert(typeof async === "undefined" || js.lang.Types.isBoolean(async), "js.net.XHR#open", "Asynchronous flag is not boolean.");
		$assert(typeof user === "undefined" || js.lang.Types.isString(user), "js.net.XHR#open", "User is not string.");
		$assert(typeof password === "undefined" || js.lang.Types.isString(password), "js.net.XHR#open", "Password is not string.");

		this._url = url;
		if (typeof async === "undefined") {
			async = true;
		}
		/**
		 * Synchronous mode flag. All XHR transaction are asynchronous, i.e. after send returns immediately and invoker
		 * should use events to acquire server response. So this flag is false by default. Anyway, there are marginal
		 * use cases where a synchronous response is more appropriate.
		 * 
		 * @type Boolean
		 */
		this._synchronousMode = !async;
		if (this._synchronousMode && this._timeout.get() === 0) {
			this._timeout.set(js.net.XHR.SYNC_TIMEOUT);
		}
		if (async) {
			this._request.onreadystatechange = this._onReadyStateChange.bind(this);
		}
		this._request.open(method, url, async, user, password);
		$trace("js.net.XHR#open", "Open connection with |%s|.", url);

		this._setRequestHeader();
		return this;
	},

	/**
	 * Helper method to set request headers after opening but before send. Currently set request-with header, disable
	 * cache and set accepted content type to JSON and plain text.
	 */
	_setRequestHeader : function() {
		this._request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		this._request.setRequestHeader("Cache-Control", "no-cache");
		this._request.setRequestHeader("Cache-Control", "no-store");
		this._request.setRequestHeader("Accept", "application/json, text/xml, text/plain");
	},

	/**
	 * Send request to server. This method takes specific preparation actions considering the type of given data, e.g.
	 * set proper request content type. Anyway, data is optional and can be undefined or null.
	 * 
	 * @param Object... optional data, undefined and null accepted.
	 * @return Object server response if this transaction is synchronously.
	 */
	send : function(data) {
		$assert(this._state === js.net.XHR.StateMachine.OPENED, "js.net.XHR#send", "Illegal state.");
		this._state = js.net.XHR.StateMachine.SENDING;

		// send void --------------------------------------
		if (typeof data === "undefined" || data === null) {
			// do not set Content-Type if data is null or undefined
			this._timeout.start();
			this._request.send();
		}

		// send string ------------------------------------
		else if (js.lang.Types.isString(data)) {
			this._request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
			this._timeout.start();
			this._request.send(data);
		}

		// send document ----------------------------------
		else if (data instanceof js.dom.Document) {
			this._request.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
			this._timeout.start();
			this._request.send(data.getDocument());
		}

		// send form --------------------------------------
		else if (data instanceof js.dom.Form) {
			// relies on browser to set the proper multipart content type and boundaries
			this._request.send(data.toFormData());
			// upload duration may naturally vary from seconds to minutes and is hardly predictable
			// for this reason sending forms doesn't use timeout but relies on abort and progress events
		}

		// send file --------------------------------------
		else if (data instanceof File) {
			var formData = new FormData();
			formData.append(data.name, data);
			this._request.send(formData);
		}

		// send form data----------------------------------
		else if (data instanceof FormData) {
			this._request.send(data);
		}

		// send object ------------------------------------
		else {
			this._request.setRequestHeader("Content-Type", "application/json");
			this._timeout.start();
			this._request.send(js.lang.JSON.stringify(data));
		}

		if (this._synchronousMode) {
			this._timeout.stop();
			return this._processResponse();
		}
	},

	/**
	 * Abort.
	 */
	abort : function() {
		// here we face a race condition
		// send has executed; as a consequence a separate thread is created for XHR transaction
		// we are in current thread executing abort but there is no guaranty meanwhile transaction
		// thread was not already executed finalization from ready state handler

		try {
			this._request.onreadystatechange = null;
			this._timeout.stop();
			this._request.abort();
			this._state = js.net.XHR.StateMachine.ABORTED;
			this._events.fire("loadend");
		} catch (er) {
			$error("js.net.XHR#abort", er);
		}
	},

	/**
	 * Ready state handler. Actually waits for {@link js.net.ReadyState DONE} and takes next actions:
	 * <ul>
	 * <li>stop timer, if this instance has one
	 * <li>if not on abort executes next 2 steps
	 * <li>invoke {@link #_processResponse}, responsible for server response processing
	 * <li>if server side is not in error fires <b>load</b> event
	 * <li>in any case fires <b>loadend</b> event and cleanup this instance
	 * </ul>
	 * Any raised exception, other than server side error is signaled via global error handler, which usually just
	 * alert.
	 */
	_onReadyStateChange : function() {
		if (this._request.readyState === js.net.ReadyState.DONE) {
			try {
				this._timeout.stop();
				var response = this._processResponse();
				if (typeof response !== "undefined") {
					this._events.fire("load", response);
				}
			} catch (er) {
				js.ua.System.error(er);
			} finally {
				try {
					this._events.fire("loadend");
				} catch (er) {
					$error("js.net.XHR#_onReadyStateChange", "Error on loadend listeners: %s.", er);
				}
			}
		}
	},

	/**
	 * Process server response. Is invoked by {@link #_onReadyStateChange ready state handler}; if request is
	 * synchronously ready state handler is not used and this method is invoked directly by {@link #send}. In any case
	 * server response is fully loaded, both headers and data.
	 * <p>
	 * First check server status; on server error fires <b>error</b> event and returns undefined. If there is no error
	 * event listener delegates {@link js.ua.Window#error global error handler}.
	 * <p>
	 * Then choose the proper logic to parse server data, based on received content type and return parser product. If
	 * content type is text/xml returned object is an instance of {@link js.dom.Document}; if application/json returns
	 * an application {@link Object}. Otherwise returns a {@link String}.
	 * <p>
	 * Finally, this method takes care about redirection, usually occurring on server side session timeout.
	 * XMLHttpRequest specs mandates that 301, 302, 303, 307, and 308 codes to be processed transparently by user agent.
	 * Excerpt from $4.6.7:
	 * <ol>
	 * <li>Set the request URL to the URL conveyed by the Location header.
	 * <li>If the source origin and the origin of request URL are same origin transparently follow the redirect while
	 * observing the same-origin request event rules.
	 * </ol>
	 * This means this method will never be invoked for redirection, if use HTTP standard redirect codes. Instead
	 * j(s)-lib uses 200 with X-JSLIB-Location header and does a {@link js.ua.Window#assign} on given location.
	 * 
	 * @return Object string, object or XML document sent back by server.
	 */
	_processResponse : function() {
		/**
		 * Extract plain text response from server HTML body.
		 * 
		 * @param String responseText server response text.
		 */
		function parseHtmlBody(responseText) {
			var matcher = responseText.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
			var body = matcher[1];
			if (!body) {
				return "";
			}
			return body.replace(/<[^>]*>/g, '');
		}

		var processError = function(er) {
			$debug("js.net.XHR#_processResponse", "Server side error on %s: %s: %s", this._url, er.cause, er.message);
			if (this._events.hasListener("error")) {
				this._events.fire("error", er);
			}
			else {
				WinMain.page.onServerFail(er);
			}
		}.bind(this);

		if (this._request.status === 0) {
			// improbable condition but need to be considered
			// status 0 is not valid HTTP response code and can occur on networking problem
			// e.g. response is dropped due to connection RST
			$debug("js.net.XHR#_processResponse", "Networking error on %s. Request abort.", this._url);
			throw new js.lang.Exception(this._url + "\nNetworking error.");
		}

		var contentType = this._request.getResponseHeader("Content-Type");

		var er;

		// j(s)-lib server side HTTP response status code can be only:
		// 200 - success, redirect with X-JSLIB-Location or text/html content
		// 204 - success with not content, that is, void remote method
		// 400 - client request fail to obey a business constrain, e.g. employee SSN is not unique
		// 500 - internal server error

		if (this._request.status === 500) {
			if (contentType.indexOf("application/json") !== -1) {
				er = JSON.parse(this._request.responseText);
			}
			else if (contentType.indexOf("text/html") !== -1) {
				er = {
					url : this._url,
					cause : "Internal Server Error",
					message : parseHtmlBody(this._request.responseText)
				};
			}
			else {
				throw new js.lang.Exception(this._url + "\nInvalid server response.");
			}

			processError(er);
			this._state = js.net.XHR.StateMachine.ERROR;
			return undefined;
		}

		if (this._request.status === 400) {
			if (contentType.indexOf("application/json") !== -1) {
				$assert(contentType.indexOf("json") !== -1, "js.net.XHR#_processResponse", "Bad content type for business constrain exception.");
				er = js.lang.JSON.parse(this._request.responseText);
				$debug("js.net.XHR#_processResponse", "Broken business constrain: 0x%4X", er.errorCode);
				WinMain.page.onBusinessFail(er);
			}
			else if (contentType.indexOf("text/html") !== -1) {
				processError({
					url : this._url,
					cause : "Not Found",
					message : parseHtmlBody(this._request.responseText)
				});
			}
			else {
				throw new js.lang.Exception(this._url + "\nNot found.");
			}

			this._state = js.net.XHR.StateMachine.ERROR;
			return undefined;
		}

		if (this._request.status < 200 || this._request.status >= 300) {
			$error("js.net.XHR#_processResponse", "Invalid server response status code |%s|.", this._request.status);
			throw new js.lang.Exception("Invalid server response.");
		}

		// at this point status code is in 200 range meaning loading with success

		// under normal use case response is an object, or array for that mater, encoded JSON, XML or plain text
		// anyway, if server application uses container provided security is possible, e.g. when session expires, to
		// have HTML page, perhaps a login form or an error page
		// if response content type is text/html reload the page to force redirect to login

		// using text/html to signal session end and to reload page prevents using HTML as valid response for XHR
		// anyway, for time being I do not see use case for HTML response; one may be layout loaded dynamically but
		// there one can use XML

		if (contentType === "text/html") {
			$error("js.net.XHR#_processResponse", "Got HTML page from server, most probably login form. Force page reload.");
			WinMain.reload();
			return undefined;
		}

		this._state = js.net.XHR.StateMachine.DONE;
		var redirect = this._request.getResponseHeader("X-JSLIB-Location");
		// XMLHttpRequest mandates null for not existing response header but there is at least one browser that returns
		// empty string; so we need to test for both conditions
		if (redirect) {
			$debug("js.net.XHR#_processResponse", "Server side redirect to |%s|.", redirect);
			WinMain.assign(redirect);
			return undefined;
		}

		// process server response considering its content type
		if (contentType && contentType.indexOf("xml") !== -1) {
			return new js.dom.Document(this._request.responseXML);
		}
		if (contentType && contentType.indexOf("json") !== -1) {
			return js.lang.JSON.parse(this._request.responseText);
		}
		// content type is neither JSON or XML; process it as text
		return this._request.responseText;
	},

	/**
	 * Timeout handler.
	 */
	_onTimeout : function() {
		this._events.fire("timeout");
		this.abort();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.net.XHR";
	}
};
$extends(js.net.XHR, Object);

/**
 * XHR state machine.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.net.XHR.StateMachine = {
	/**
	 * XHR instance just created.
	 */
	CREATED : 0,

	/**
	 * Open method was invoked.
	 */
	OPENED : 1,

	/**
	 * Sending pending.
	 */
	SENDING : 2,

	/**
	 * User abort.
	 */
	ABORTED : 3,

	/**
	 * Completed with success.
	 */
	DONE : 4,

	/**
	 * Completed with server error.
	 */
	ERROR : 5
};

/**
 * Convenient way to invoke REST resources via XHR POST.
 * 
 * @param String restPath REST path,
 * @param Function callback callback to be executed on result,
 * @param Object scope callback runtime execution scope.
 */
function $rest(restPath, callback, scope) {
	var xhr = new js.net.XHR();
	xhr.on("load", callback, scope);
	xhr.open("POST", restPath);
	xhr.send();
};

$legacy(js.ua.Engine.TRIDENT, function() {
	js.net.XHR.prototype._setRequestHeader = function() {
		this._request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		this._request.setRequestHeader("Cache-Control", "no-cache,must-revalidate,post-check=0,pre-check=0");
		this._request.setRequestHeader("Cache-Control", "max-age=0");
		this._request.setRequestHeader("Cache-Control", "no-store");
		this._request.setRequestHeader("Expires", "0");
		this._request.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
		this._request.setRequestHeader('Pragma', 'no-cache');
		this._request.setRequestHeader("Accept", "application/json, text/xml, text/plain");
	}
});
