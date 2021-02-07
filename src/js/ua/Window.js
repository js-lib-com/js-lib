$package("js.ua");

$include("js.net.URL");
$include("js.event.CustomEvents");

/**
 * User agent window. This class is a thin wrapper for {@link window.Window native window} object. There are two major
 * types: main window - global <b>WinMain</b>, created by bootstrap script and child windows. Every window has a parent
 * that create it via open method; since WinMain is on top of food chain its parent is null.
 * <p>
 * This class generates events related to window life-cycle like <code>dom-ready</code> and orientation change for
 * mobile user agents, see below. Window life-cycle related events have the window instance as only argument whereas
 * orientation change send a {@link js.ua.Orientation orientation} constant.
 * <p>
 * <table border="1" style="border-collapse:collapse;">
 * <tr>
 * <td width=140><b>dom-ready</b>
 * <td>Script is completely loaded and parsed into user agent DOM. All classes are guaranteed to be fully initialized
 * when this event is triggered.
 * <tr>
 * <td><b>load</b>
 * <td>Entire page is loaded completely, including all images.
 * <tr>
 * <td><b>pre-unload</b>
 * <td>Fired before unload event. Listeners to this event may return boolean false to prevent unload process. If this
 * is the case a system dialog is opened asking for user confirmation; user can choose to continue unload or to stop it,
 * in which case <b>unload</b> event will not fire at all.
 * <tr>
 * <td><b>unload</b>
 * <td>This event is generated when page is unloaded due to moving to another URL, browser back, refresh or closing.
 * May be used for example to synchronously flush all application data back to server.
 * <tr>
 * <td><b>orientation-change</b>
 * <td>Generated when user agent device orientation is changed - available only for mobile devices equipped with
 * accelerometer. </table>
 * 
 * <p>
 * Note that due to security constraints above events are not generated for child window created with {@link #open},
 * unless if the same domain.
 * <p>
 * This utility class provides also methods for window reload, go back to previous page and loading from given URL.
 * <p>
 * <b>Developers note:</b> public life cycle is a subset, that is, there are couple internal steps. For a full
 * description of window initialization process see {@link #_fireDomReady} description.
 * 
 * <p>
 * Sample usage.
 * 
 * <pre>
 * WinMain.on("dom-ready", function () {
 * ...
 * });
 * </pre>
 * 
 * @author Iulian Rotaru
 * 
 * @constructor Construct window instance. Because, main window is instantiated in global scope, in order to avoid hard
 * dependencies this constructor just declare instance fields. Actual initialization is performed on DOM ready, see
 * {@link #_fireDomReady}.
 * 
 * Class initialization. Create window life-cycle events and attach listeners to DOM content loaded, page loaded, before
 * unload and unload events. Takes care to fire life-cycle events in the proper order.
 * @param Window nativeWindow native window,
 * @param Object... properties optional properties used for child configuration.
 * @assert native window is not undefined or null.
 */
js.ua.Window = function(nativeWindow, properties) {
	$assert(this instanceof js.ua.Window, "js.ua.Window#Window", "Invoked as function.");
	$assert(typeof nativeWindow !== "undefined" && nativeWindow !== null, "js.ua.Window#Window", "Native window is undefined or null.");

	if (typeof properties === "undefined") {
		properties = {};
	}

	/**
	 * Window ID. Used internally for logging purposes.
	 * 
	 * @type String
	 */
	this._id = "js-window#" + js.ua.Window._index++;

	/**
	 * Native window.
	 * 
	 * @type Window
	 */
	this._window = nativeWindow;

	/**
	 * Parent window or null for WinMain.
	 * 
	 * @type js.ua.Window
	 */
	this._parent = properties.parent || null;
	$assert(this._parent === null || this._parent instanceof js.ua.Window, "js.ua.Window#Window", "Parent is not of proper type.");

	/**
	 * Window URL. This is the web reference of this window content, that is, the URL of source file.
	 * 
	 * @type js.net.URL
	 */
	this.url = null;
	if (properties.crossDomain) {
		this.url = new js.net.URL(properties.url);
	}

	/**
	 * Window document. An window has a {@link js.dom.Document document} containing the tree of
	 * {@link js.dom.Element elements}. On window close document is disposed.
	 * 
	 * @type js.dom.Document
	 */
	this.doc = null;

	/**
	 * Main window page or null if not WinMain.
	 * 
	 * @type js.ua.Page
	 */
	this.page = null;

	/**
	 * Child windows list. All child windows created with {@link #open} are dependent, that is, they are automatically
	 * closed when parent window closes. This array keep track of created child windows.
	 * 
	 * @type Array
	 */
	this._dependentChildWindows = null;

	/**
	 * Window state. Keep track of window life-cycle and assert methods are executed in proper state.
	 * 
	 * @type js.ua.Window.State
	 */
	this._state = js.ua.Window.State.CREATED;
	$debug("js.ua.Window#Window", "Window %s has been created.", this._id);

	if (properties.crossDomain) {
		$debug("js.ua.Window#Window", "Cross domain child window: parent domain |%s| different from child |%s|.", this._parent.url.host, this.url.host);
		return;
	}

	/**
	 * Window events. Note that because of security constraints these custom events are not defined for cross domain
	 * child window.
	 * 
	 * @type js.event.CustomEvents
	 */
	this._events = new js.event.CustomEvents();
	this._events.register("pre-dom-ready", "dom-ready", "load", "pre-unload", "unload", "orientation-change");

	this._addEventListener("DOMContentLoaded", this._domContentLoadedHandler, this);
	this._addEventListener("load", this._loadHandler, this);
	this._addEventListener("beforeunload", this._beforeUnloadHandler, this);
	this._addEventListener("unload", this._unloadHandler, this);
	if (typeof this._window.onorientationchange !== "undefined") {
		this._addEventListener("orientationchange", this._orientationChangeHandler, this);
	}
};

/**
 * Window index.
 * 
 * @type Number
 */
js.ua.Window._index = 0;

js.ua.Window.prototype = {
	/**
	 * Create new child window. This method accept optional parameters used to build URL query and optional window
	 * features as described by {@link js.ua.Window.Features}.
	 * 
	 * <pre>
	 *  WinMain.open("partners.htm", {
	 *      id : this._scenarioId
	 *  }, {
	 *      width : 600,
	 *      height : 400
	 *  });
	 * </pre>
	 * 
	 * In above example add <code>id</code> to URL using {@link js.net.URL#formatQuery} resulting
	 * <code>partners.htm?id=1234</code>. The second supplied object is used to configure the window about to be
	 * created. Note that both absolute and relative URLs are accepted. Also, if features are present parameters are
	 * mandatory even if null or undefined.
	 * 
	 * @param String url window document web reference,
	 * @param Object... parameters optional URL query parameters, mandatory if <code>features</code> should be
	 * present,
	 * @param Object... features optional windows features.
	 * @return js.ua.Window created child window or null if native window creation fails.
	 */
	open : function(url, parameters, features) {
		if (parameters) { // if parameters are not undefined or null
			url += js.net.URL.formatQuery(parameters);
		}

		var name, value;
		if (typeof features === "undefined") {
			features = {};
		}
		var defaults = js.ua.Window.Features;
		for (name in defaults) {
			if (typeof features[name] === "undefined" && typeof defaults[name] !== "undefined") {
				features[name] = defaults[name];
			}
		}

		if (features.fullscreen) {
			delete features.top;
			delete features.left;
			delete features.width;
			delete features.height;
		}

		var specs = [];
		for (name in features) {
			value = features[name];
			if (name === "name" || name === "dependent" || typeof value === "undefined") {
				continue;
			}
			if (js.lang.Types.isBoolean(value)) {
				value = value ? "yes" : "no";
			}
			specs.push(name + "=" + value);
		}

		var childWindow, childNativeWindow;
		try {
			childNativeWindow = this._window.open(url, features.name, specs.join(","), false);
			if (childNativeWindow === null) {
				$error("js.ua.Window#open", "Fail to create native window:\r\n" + //
				"\t- url: %s\r\n" + //
				"\t- name: %s\r\n" + //
				"\t- specs: %s", url, features.name, specs.join(","));
				return null;
			}
			childWindow = new js.ua.Window(childNativeWindow, {
				parent : this,
				url : url,
				crossDomain : WinMain.url.isCrossDomain(url)
			});
			if (features.dependent) {
				if (this._dependentChildWindows === null) {
					this._dependentChildWindows = [];
				}
				this._dependentChildWindows.push(childWindow);
			}
		} catch (er) {
			childWindow = null;
			js.ua.System.error(er);
		}
		return childWindow;
	},

	/**
	 * Close this window.
	 */
	close : function() {
		$debug("js.ua.Window#close", "Close window |%s|", this._id);
		if (this._window.closed) {
			$debug("js.ua.Window#close", "Attempt to close already closed window |%s|", this._id);
			return;
		}
		this._window.close();
		// unload event is fired when native window closes
	},

	/**
	 * Navigate this window to new location. This method loads window from the source identified by given web reference.
	 * Takes care to properly serialize URL query parameters, if any.
	 * 
	 * <pre>
	 * 	js.ua.Window.assign("http://www.youtube.com/video/watch/files.avi",
	 *	{
	 *		v: "p6K_VT6tcvs",
	 *		feature: "relmfu"
	 *	});
	 * </pre>
	 * 
	 * Note that relative URL is accepted.
	 * 
	 * @param String url source file web reference,
	 * @param Object... parameters optional URL query parameters hash.
	 */
	assign : function(url, parameters) {
		if (typeof parameters !== "undefined") {
			url += js.net.URL.formatQuery(parameters);
		}
		this._window.location.assign(url);
	},

	/**
	 * Like {@link #assign} but current window URL is replaced. Current window URL is replaced by the new one into
	 * history, that is, user is not able to back to current page after replacing it.
	 * 
	 * <pre>
	 *  js.ua.Window.replace("http://www.youtube.com/video/watch/files.avi",
	 *  {
	 *      v: "p6K_VT6tcvs",
	 *      feature: "relmfu"
	 *  });
	 * </pre>
	 * 
	 * Note that relative URL is accepted.
	 * 
	 * @param String url source file web reference,
	 * @param Object... parameters optional URL query parameters hash.
	 */
	replace : function(url, parameters) {
		if (typeof parameters !== "undefined") {
			url += js.net.URL.formatQuery(parameters);
		}
		this._window.location.replace(url);
	},

	/**
	 * Reload this window from its web source.
	 */
	reload : function() {
		this._window.location.reload();
	},

	/**
	 * Loads the previous URL in the history list.
	 */
	back : function() {
		this._window.history.back();
	},

	download : function() {

	},

	/**
	 * Get window title.
	 * 
	 * @return String this window title.
	 */
	getTitle : function() {
		$assert(this.doc !== null, "js.ua.Window#getTitle", "Window document is null.");
		return document.title || "Untitled";
	},

	/**
	 * Get this window client width.
	 * 
	 * @return Number this window width.
	 */
	getWidth : function() {
		return Number(this._window.innerWidth);
	},

	/**
	 * Get this window client height.
	 * 
	 * @return Number this window height.
	 */
	getHeight : function() {
		return Number(this._window.innerHeight);
	},

	/**
	 * Move child element to viewport top, with optional offset. Element should belong to this window document. Offset
	 * is an integer with sign and is added to page top reference, that is, after scrolling child vertical position
	 * relative to viewport equals given <code>offset</code>.
	 * <p>
	 * Scroll move is animated with fixed duration predefined to half second. If <code>callback</code> is supplied it
	 * is invoked at animation end.
	 * 
	 * @param js.dom.Element child element belonging to this window document,
	 * @param Number... offset optional offset relative to viewport top, default to 0,
	 * @param Function... callback optional scroll complete callback,
	 * @param Object... scope optional callback runtime scope, default to this global scope.
	 * @assert arguments are of proper type and child element belongs to window document.
	 */
	scrollTo : function(child, offset, callback, scope) {
		$assert(js.lang.Types.isElement(child), "js.ua.Window.scrollTo", "Child argument is not a document element.");
		$assert(child.getOwnerDoc().equals(this.doc), "js.ua.Window.scrollTo", "Child argument does not belong to window document.");
		$assert(!offset || js.lang.Types.isNumber(offset), "js.ua.Window.scrollTo", "Offset argument is not a number.");

		if (typeof offset === "undefined") {
			offset = 0;
		}

		var fromYOffset = this._window.pageYOffset;
		var toYOffset = child.style.getPageTop() - offset;

		if (fromYOffset === toYOffset) {
			if (callback) {
				callback.call(scope || window);
			}
			return;
		}

		var anim = new js.fx.Anim({
			duration : 500,
			from : this._window.pageYOffset,
			to : child.style.getPageTop() - offset,
			ttf : js.fx.TTF.Logarithmic,
			render : function(top) {
				this._window.scrollTo(0, top);
			}.bind(this)
		});
		if (typeof callback !== "undefined") {
			$assert(js.lang.Types.isFunction(callback), "js.ua.Window.scrollTo", "Callback argument is not a function.");
			anim.on("anim-stop", callback, scope || window);
		}
		anim.start();
	},

	/**
	 * Event type to window state map.
	 * 
	 * @type Object
	 */
	_EVENT_STATES : null,

	/**
	 * Attach event listener. Window utility class generates custom events related to window life cycle. Here is the
	 * list of registered events:
	 * <ul>
	 * <li>dom-ready
	 * <li>load
	 * <li>pre-unload
	 * <li>unload
	 * <li>orientation-change
	 * </ul>
	 * For a complete events description see {@link js.ua.Window class description}.
	 * 
	 * @param String type event type,
	 * @param Function listener listener to register,
	 * @param Object scope listener run-time scope.
	 * @return js.ua.Window this object.
	 * @assert requested event type is registered, listener is a {@link Function} and scope is an {@link Object}, if
	 * present.
	 */
	on : function(type, listener, scope) {
		$assert(this._state < js.ua.Window.State.FINALIZED, "js.ua.Window#on", "Can't add event listener after instance finalization.");
		if (this._EVENT_STATES === null) {
			this._EVENT_STATES = {
				"dom-ready" : js.ua.Window.State.DOM_READY,
				"load" : js.ua.Window.State.LOADED,
				"pre-unload" : js.ua.Window.State.BEFORE_UNLOADED,
				"unload" : js.ua.Window.State.UNLOADED
			};
		}
		if (this._state >= this._EVENT_STATES[type]) {
			// if related native event was already triggered execute listener right now
			listener.call(scope, this);
			return this;
		}
		this._events.addListener(type, listener, scope || js.ua.Window);
		return this;
	},

	/**
	 * Detach event listener. Event type to remove must be a registered one, see {@link js.ua.Window class description}
	 * for valid types.
	 * 
	 * @param String type event type,
	 * @param Function listener attached event listener.
	 * @return js.ua.Window this object.
	 * @assert given event type is registered and listener is a {@link Function}.
	 */
	un : function(type, listener) {
		$assert(this._state < js.ua.Window.State.FINALIZED, "js.ua.Window#un", "Can't remove event listener after instance finalization.");
		this._events.removeListener(type, listener);
		return this;
	},

	/**
	 * Get orientation.
	 * 
	 * @return js.ua.Orientation
	 */
	getOrientation : function() {
		return (this._window.orientation % 180 === 0) ? js.ua.Orientation.PORTRAIT : js.ua.Orientation.LANDSCAPE;
	},

	/**
	 * DOM content loaded event listener. Remove itself then invoke {@link #_fireDomReady()}.
	 */
	_domContentLoadedHandler : function() {
		$trace("js.ua.Window#_domContenLoadedHandler", this._id);
		this._removeEventListener("DOMContentLoaded", js.ua.Window.prototype._domContentLoadedHandler);
		this._fireDomReady();
	},

	/**
	 * Window load event handler.
	 */
	_loadHandler : function() {
		// DOM ready and page loaded events are registered to different triggers and I do not found and explicit
		// specification regarding their order; so it seems we are at user agent implementation mercy
		// also we have a potential race condition here if implementation uses different threads of execution for
		// 'DOMContentLoaded' and 'load' triggers
		// for theses reasons is possible this method to be enacted before _fireDomReady() set this._state to DOM_READY

		$assert(this._state === js.ua.Window.State.CREATED || this._state === js.ua.Window.State.DOM_READY, "js.ua.Window#_loadHandler", "Invalid state. Expected CREATED or DOM_READY but got %s.", this._stateName());
		$trace("js.ua.Window#_loadHandler", this._id);
		this._removeEventListener("load", js.ua.Window.prototype._loadHandler);

		// we need to ensure DOM ready event is fired, even at this lately stage
		// in other words: better later than never
		// anyway, if _fireDomReady was already executes next statement is NOP
		this._fireDomReady();

		$debug("js.ua.Window#_loadHandler", "Fire load event for %s.", this._id);
		this._events.fire("load", this);
		this._state = js.ua.Window.State.LOADED;
	},

	/**
	 * Window before unload event handler.
	 * <p>
	 * Implementation note: in most use cases unload occurs after page load completes. Anyway, for a very heavy page and
	 * no browser cache it can happen user to leave the page before load completes. For such at edge condition this
	 * method takes care to execute {@link #_loadHandler()} so that {@link js.ua.Window} life cycle is respected.
	 * 
	 * @return String unload notification.
	 */
	_beforeUnloadHandler : function() {
		if (this._state !== js.ua.Window.State.LOADED) {
			// takes care to fire page load event if unload comes before actual page loading completes
			this._loadHandler();
		}

		$assert(this._state === js.ua.Window.State.LOADED, "js.ua.Window#_beforeUnloadHandler", "Invalid state. Expected LOADED but got %s.", this._stateName());
		$debug("js.ua.Window#_beforeUnloadHandler", "Fire pre-unload event for %s.", this._id);
		this._removeEventListener("beforeunload", js.ua.Window.prototype._beforeUnloadHandler);

		var results = this._events.fire("pre-unload", this);
		var message = "";
		var preventUnload = false;
		for (var i = 0; i < results.length; ++i) {
			if(typeof results[i] === "string") {
				preventUnload = true;
				message += results[i];
				message += "\r\n";
			}
		}

		this._state = js.ua.Window.State.BEFORE_UNLOADED;
		if (preventUnload) {
			return message;
		}
	},

	/**
	 * Window unload event handler.
	 */
	_unloadHandler : function() {
		// there is a strange behavior on creating new window with open
		// on new created window unload event is triggered immediately after window creation
		if (this._state === js.ua.Window.State.CREATED) {
			$debug("js.ua.Window#_unloadHandler", "Ignore strange unload event on window creation.");
			return;
		}

		$assert(this._state === js.ua.Window.State.BEFORE_UNLOADED, "js.ua.Window#_unloadHandler", "Invalid state. Expected BEFORE_UNLOADED but got %s.", this._stateName());
		this._removeEventListener("unload", js.ua.Window.prototype._unloadHandler);

		$debug("js.ua.Window#_unloadHandler", "Fire unload event for %s.", this._id);
		this._events.fire("unload", this);

		if (this._dependentChildWindows !== null) {
			this._dependentChildWindows.forEach(function(childWindow) {
				$debug("js.ua.Window#finalize", "Force child window %s closing on parent finalization.", childWindow._id);
				childWindow.close();
			});
		}
		this._state = js.ua.Window.State.FINALIZED;
	},

	/**
	 * Device orientation change event handler.
	 */
	_orientationChangeHandler : function() {
		$debug("js.ua.Window#_orientationChangeHandler", "Fire orientation-change event for %s.", this._id);
		this._events.fire("orientation-change", this.getOrientation());
	},

	/**
	 * Add window event listener.
	 * 
	 * @param String type event type,
	 * @param Function listener event listener,
	 * @param Object scope listener runtime scope.
	 */
	_addEventListener : function(type, listener, scope) {
		var target = (type === "DOMContentLoaded") ? this._window.document : this._window;
		target.addEventListener(type, listener.bind(scope), false);
	},

	/**
	 * Remove window event listener.
	 * 
	 * @param String type event type,
	 * @param Function listener event listener.
	 */
	_removeEventListener : function(type, listener) {
		var target = (type === "DOMContentLoaded") ? this._window.document : this._window;
		target.removeEventListener(type, listener, false);
	},

	/**
	 * Finalize window loading process and generates document ready events. This method disable itself by replacing with
	 * {@link js.lang.NOP} then execute next steps:
	 * <ul>
	 * <li>initialize this window instance URL, document and document body,
	 * <li>add engine class to document body allowing for CSS hacking, see
	 * {@link js.ua.Engine#cssClass browser specific CSS class},
	 * <li>if main window, define global selectors <code>js.dom.Element $E(String selectors)</code> and
	 * <code>js.dom.EList $L(String selectors)</code>,
	 * <li>if main window, execute classes static initializers, see {@link js.lang.Operator $static pseudo-operator},
	 * <li>fires <code>pre-dom-ready</code> event,
	 * <li>if main window, create page instance,
	 * <li>fires <code>dom-ready</code> event,
	 * <li>if main window, preload requested element instances, see {@link js.lang.Operator $preload pseudo-operator},
	 * <li>set this window instance state to {@link js.ua.Window.State DOM_READY}.
	 * </ul>
	 * 
	 * @assert this window state is {@link js.ua.Window.State CREATED}.
	 */
	_fireDomReady : function() {
		$assert(this._state === js.ua.Window.State.CREATED, "js.ua.Window#_fireDomReady", "Invalid state. Expected CREATED but got %s.", this._stateName());

		// do not use js.ua.Window.prototype._fireDomReady in order to avoid NOP-ing all window instances
		this._fireDomReady = js.lang.NOP;

		// complete this instance fields initialization, postponed by constructor in order to avoid hard dependencies
		$assert(this.url === null, "js.ua.Window#_fireDomReady", "Window URL is not null.");
		this.url = new js.net.URL(this._window.location.toString());
		this.doc = new js.dom.Document(this._window.document);

		// as early as possible add engine class used to CSS hacking
		var body = this.doc.getByTag("body");
		if (body !== null) {
			body.addCssClass(js.ua.Engine.cssClass);
			js.dom.Node.removeBackRef(body.getNode());
		}
		var isWinMain = (this === WinMain);

		if (isWinMain) {
			$assert(typeof $E === "undefined", "js.ua.Window#_fireDomReady", "Global selector for first element already defined.");
			$assert(typeof $L === "undefined", "js.ua.Window#_fireDomReady", "Global selector for list of elements already defined.");

			/**
			 * Global selector for first element identified by given CSS selector. Multiple comma separated selectors
			 * are allowed in which case every selector is tested for match in the order from list till first element
			 * found. Return null if no element found. Selectors argument can be formatted as supported by $format
			 * operator in which case <code>args</code> should be supplied.
			 * 
			 * @param String selectors comma separated list of CSS selectors,
			 * @param Object... args optional arguments if selectors is formatted.
			 * @return js.dom.Element found element or null.
			 * @assert <code>selectors</code> argument is not undefined, null or empty.
			 */
			$E = function(selectors) {
				$assert(selectors, 'js.ua.Page#$E', 'Selectors is undefined, null or empty.');
				if (arguments.length > 1) {
					selectors = $format(arguments);
				}
				return WinMain.doc.getElement(js.dom.Node.querySelector(window.document, selectors));
			};

			/**
			 * Global selector for list of elements identified by given CSS selector. Multiple comma separated selectors
			 * are allowed in which case every selector is tested for match in the order from list and results merged.
			 * Return empty list if no element found. Selectors argument can be formatted as supported by $format
			 * operator in which case <code>args</code> should be supplied.
			 * 
			 * @param String selectors comma separated list of CSS selectors,
			 * @param Object... args optional arguments if selectors is formatted.
			 * @return js.dom.EList found element list, possible empty.
			 * @assert <code>selectors</code> argument is not undefined, null or empty.
			 */
			$L = function(selectors) {
				$assert(selectors, 'js.ua.Page#$L', 'Selectors is undefined, null or empty.');
				if (arguments.length > 1) {
					selectors = $format(arguments);
				}
				return WinMain.doc.getEList(js.dom.Node.querySelectorAll(window.document, selectors));
			};

			// run classes static initializers before firing any DOM ready related events
			$static.execute();
		}

		$debug("js.ua.Window#_fireDomReady", "Fire pre-dom-ready event for %s.", this._id);
		this._events.fire("pre-dom-ready", this);

		if (isWinMain) {
			// if user space code does not declare a subclass for page uses base page class, but only if this is WinMain
			if (this === WinMain && this.page === null) {
				$debug("js.ua.Window#_fireDomReady", "No user space page. Uses js.ua.Page instead.");
				this.page = new js.ua.Page();
			}
		}

		$debug("js.ua.Window#_fireDomReady", "Fire dom-ready event for for %s.", this._id);
		this._events.fire("dom-ready", this);

		if (isWinMain) {
			// after all classes are properly initialized preload requested element instances
			$preload.execute();
		}

		this._state = js.ua.Window.State.DOM_READY;
	},

	/**
	 * Create page instance and save it to {@link WinMain.page}.
	 * 
	 * @param Class pageClass page class.
	 */
	createPage : function(pageClass) {
		WinMain.on("load", function() {
			WinMain.page = new pageClass();
		});
	},

	/**
	 * Get state name.
	 * 
	 * @return String state name.
	 */
	_stateName : function() {
		if (typeof js.ua.Window.STATE_NAMES === "undefined") {
			/**
			 * Window state names. Mainly for debugging purposes.
			 * 
			 * @type Array
			 */
			js.ua.Window.STATE_NAMES = [ "NONE", "CREATED", "DOM_READY", "LOADED", "BEFORE_UNLOADED", "UNLOADED", "FINALIZED" ];
		}
		return js.ua.Window.STATE_NAMES[this._state];
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.ua.Window";
	}
};
$extends(js.ua.Window, Object);

/**
 * Window life-cycle states.
 */
js.ua.Window.State = {
	/**
	 * Neutral value.
	 */
	NONE : 0,

	/**
	 * Window created.
	 */
	CREATED : 1,

	/**
	 * DOM tree completely parsed.
	 */
	DOM_READY : 2,

	/**
	 * Window and all resources completely loaded.
	 */
	LOADED : 3,

	/**
	 * Just before unload.
	 */
	BEFORE_UNLOADED : 4,

	/**
	 * Unload process is about to finish.
	 */
	UNLOADED : 5,

	/**
	 * Window finalized. Window instance in this state can"t be used.
	 */
	FINALIZED : 6
};

/**
 * Child window configurable features. This enumeration lists all features - and their default value, used by
 * {@link js.ua.Window#open} to configure newly created child window.
 */
js.ua.Window.Features = {
	/**
	 * Window top position. Default undefined.
	 * 
	 * @type Number
	 */
	top : undefined,

	/**
	 * Window left position. Default undefined.
	 * 
	 * @type Number
	 */
	left : undefined,

	/**
	 * Window width. Default undefined.
	 * 
	 * @type Number
	 */
	width : undefined,

	/**
	 * Window height. Default undefined.
	 * 
	 * @type Number
	 */
	height : undefined,

	/**
	 * Is created window resizable? Default to false.
	 * 
	 * @type Boolean
	 */
	resizable : false,

	/**
	 * Is created window full screen? Default to false.
	 * 
	 * @type Boolean
	 */
	fullscreen : false,

	/**
	 * The menu bar is the main menu, usually on top of window window. Default to true.
	 * 
	 * @type Boolean
	 */
	menubar : true,

	/**
	 * Location is in fact address bar, that is, where the URL is displayed. Default to true.
	 * 
	 * @type Boolean
	 */
	location : true,

	/**
	 * The toolbar is the bar at the top of the window with buttons. Default to true.
	 * 
	 * @type Boolean
	 */
	toolbar : true,

	/**
	 * Directories bar holds a set of buttons for your favorite web sites. Default to true.
	 * 
	 * @type Boolean
	 */
	directories : true,

	/**
	 * Standard vertical and horizontal scroll bars. Default to true.
	 * 
	 * @type Boolean
	 */
	scrollbars : true,

	/**
	 * Status bar is where the browser displays messages for the user, usually on bottom of popup window. Default to
	 * true.
	 * 
	 * @type Boolean
	 */
	status : true,

	/**
	 * A dependent child window will automatically close on parent closing. Default to true.
	 * 
	 * @type Boolean
	 */
	dependent : true,

	/**
	 * Window name, usable as value of a form"s target attribute. Instead of user defined name one may choose from next
	 * predefined values:
	 * <ul>
	 * <li>_blank - URL is loaded into a new window; this is the default value,
	 * <li>_parent - URL is loaded into the parent frame,
	 * <li>_self - URL replaces the current page,
	 * <li>_top - URL replaces any frame sets that may be loaded.
	 * </ul>
	 * 
	 * @type String
	 */
	name : "_blank"
};

/**
 * Uses IE attach and detach event listeners functions and emulate DOMContentLoaded W3C event.
 */
$legacy(!document.addEventListener || !document.removeEventListener, function() {
	js.ua.Window.prototype._addEventListener = function(type, listener, scope) {
		var doc = this._window.document;
		var _this = this;

		if (typeof this.__window_load_complete__ === "undefined") {
			this.__window_load_complete__ = false;
		}
		if (typeof this.__dom_ready_fired__ === "undefined") {
			this.__dom_ready_fired__ = false;
		}

		if (type !== "DOMContentLoaded") {
			if (type === "load" && doc.readyState === "complete") {
				$debug("js.ua.Window#_addEventListener", "Trying to register window load event after ready state complete.");
				_this.__window_load_complete__ = true;
				if (_this.__dom_ready_fired__) {
					window.setTimeout(function() {
						_this.__window_load_complete__ = false;
						_this._loadHandler();
					}, 10);
				}
			}
			else {
				this._window.attachEvent("on" + type, listener.bind(scope));
			}
			return this;
		}

		function fireDomReady() {
			if (!_this.__dom_ready_fired__) {
				_this.__dom_ready_fired__ = true;
				_this._fireDomReady();
				if (_this.__window_load_complete__) {
					_this.__window_load_complete__ = false;
					_this._loadHandler();
				}
			}
		}

		var docReadyStateHandler = function() {
			if (doc.readyState === "complete") {
				doc.detachEvent("onreadystatechange", docReadyStateHandler);
				fireDomReady();
			}
		};
		doc.attachEvent("onreadystatechange", docReadyStateHandler);

		if (this._window.top === this._window.self) { // not inside of iframe
			(function doScroll() {
				try {
					doc.documentElement.doScroll("left");
				} catch (e) {
					window.setTimeout(doScroll, 10);
					return;
				}
				fireDomReady();
			})();
		}
		return this;
	};

	js.ua.Window.prototype._removeEventListener = function(type, listener) {
		if (type !== "DOMContentLoaded") {
			this._window.detachEvent(type, listener);
		}
		return this;
	};
});

/**
 * Fix for double invocation of before unload on IE. There are peculiar conditions related to page assign that lead to
 * double invocation of before unload handler. Sometimes Window.assign is on stack trace, suggesting that locatin.assign
 * invoke before unload and second invocation is on normal page unload process. This work around allows only first call,
 * hopefully is not called somewhere inside page session.
 */
$legacy(js.ua.Engine.TRIDENT, function() {
	js.ua.Window.__before_unload_handler__ = js.ua.Window.prototype._beforeUnloadHandler;
	js.ua.Window.prototype._beforeUnloadHandler = function() {
		if (this._state === js.ua.Window.State.LOADED) {
			js.ua.Window.__before_unload_handler__.call(this);
		}
	};
});
