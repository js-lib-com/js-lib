$package("js.ua");

/**
 * HTML page. The page is entire area where actual HTML rendering occurs; in CSS specs is named <em>canvas</em> but
 * j(s)-lib named it <em>page</em> in order to avoid name clash with synonymous HTML element. Do not confuse with CSS
 * page from for printing media; j(s)-lib page is a continuous, virtual space that may exceed screen dimensions - in
 * which case user agent provides means for scrolling.
 * 
 * <p>
 * Application code should create user defined page class extending this base class. Nothing special but this class
 * {@link #$extends extension handler} takes care to instantiate the page before actual DOM ready event. This way, user
 * defined class constructor is running in a properly initialized environment.
 * 
 * <pre>
 *	$package("comp.prj");
 *
 *	comp.prj.Page = function() {
 *		this.$super();
 *		// page initialization code
 *	}
 *
 * 	comp.prj.Page.prototype = {
 * 		// user page specific logic
 * 	}
 * 	$extends(comp.prj.Page, js.ua.Page);
 * </pre>
 * 
 * @author Iulian Rotaru
 * @constructor Construct page instance.
 */
js.ua.Page = function() {
	$assert(this instanceof js.ua.Page, "js.ua.Page#Page", "Invoked as function.");
	js.ua.Regional.init();
};

/**
 * Page constructor. Page specific constructor, i.e. the last, most specific page class, no matter how deep page classes
 * hierarchy is.
 * 
 * @type Function
 */
js.ua.Page._ctor = js.ua.Page;

/**
 * Hook executed just before main window page creation. Can be used to initialize application global state, perhaps
 * loaded from server, state that can be accessed on page constructor. Default value is null.
 * <p>
 * Next sample hook executes some user defined logic then invoke <code>callback</code> that will trigger page
 * creation.
 * 
 * <pre>
 *  js.ua.Page.preCreate = function(callback) {
 *      . . .
 *      callback();
 *  };
 * </pre>
 * 
 * @type Function
 */
js.ua.Page.preCreate = null;

/**
 * Extends handler for page subclasses executed when $extends operator is invoked. This mechanism allows for not limited
 * hierarchy of page sub-classing. When a class from hierarchy extends a super class this method takes care to update
 * {@link js.ua.Page#_ctor} and register this method itself to subclass extends handler.
 * 
 * @param Function pageSubClass user defined page subclass.
 */
js.ua.Page.extendsSubClass = function(pageSubClass) {
	$debug("js.ua.Page.$extends", "Subclass window page %s", pageSubClass);
	pageSubClass.$extends = js.ua.Page.extendsSubClass;
	js.ua.Page._ctor = pageSubClass;
};

/**
 * Page extension handler. Executed once by {@link js.lang.Operator#$extends} after user defined page extension is
 * actually performed. Prepare subclass extends handler, see {@link js.ua.Page#extendsSubClass} and register an
 * anonymous listener for DOM ready event; when fired, create main window page.
 * 
 * @param Function pageSubClass user defined page subclass.
 */
js.ua.Page.$extends = function(pageSubClass) {
	$debug("js.ua.Page.$extends", "Subclass window page %s", pageSubClass);
	pageSubClass.$extends = js.ua.Page.extendsSubClass;

	$assert(js.ua.Page._ctor === js.ua.Page, "js.ua.Page.$extends", "Only one user defined page supported.");
	js.ua.Page._ctor = pageSubClass;

	WinMain.on("pre-dom-ready", function() {
		$assert(WinMain.page === null, "js.ua.Page.$extends", "WinMain.page should be null.");

		function createMainPage() {
			$debug("js.ua.Page#pre-dom-ready", "Create main page %s.", js.ua.Page._ctor);
			WinMain.page = new js.ua.Page._ctor();
		}

		if (js.ua.Page.preCreate !== null) {
			$debug("js.ua.Page#pre-dom-ready", "Execute preCreate for main page %s.", js.ua.Page._ctor);
			js.ua.Page.preCreate.call(js.ua.Page._ctor.prototype, createMainPage);
		}
		else {
			createMainPage();
		}
	});
};

/**
 * Page manager. Utility class taking care about browser page life cycle. It tries to locate a global object named
 * <em>Page</em> and augments it with reference to page parameters, extracted from invoking URL and methods for user
 * alert, prompt and confirm. Also this class is the global error handler.
 */
js.ua.Page.prototype = {
	/**
	 * Request browser to display this page on full-screen. This method should be invoked from a user interaction or
	 * device orientation change.
	 */
	requestFullScreen : function() {
		// request full-screen API is implemented on element, not on document
		var el = WinMain.doc._document.documentElement;
		var requestFullScreen = el.requestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullScreen || el.msRequestFullscreen;
		requestFullScreen.call(el);
	},

	/**
	 * Restore page display inside browser chrome, that is, exit full-screen mode.
	 */
	exitFullScreen : function() {
		var doc = WinMain.doc._document;
		var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
		cancelFullScreen.call(doc);
	},

	/**
	 * Detect if this page is displayed on full-screen.
	 * 
	 * @return Boolean true if this page is displayed on full-screen.
	 */
	isFullScreen : function() {
		var doc = WinMain.doc._document;
		return doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
	},

	/**
	 * Set idle timeout value. Given value is measured in minutes and a value of 0 disable idle state watch dog.
	 * 
	 * @param Number value idle timeout value, minutes.
	 * @assert idle timeout value is a positive number.
	 */
	setIdleTimeout : function(value) {
		$assert(js.lang.Types.isNumber(value), "js.ua.Page#setIdleTimeout", "Value is not a number.");
		$assert(value >= 0, "js.ua.Page#setIdleTimeout", "Value is not a positive number.");
		js.event.Handler.idleTimeout.set(value * 60 * 1000);
	},

	/**
	 * Default idle timeout handler. This method does nothing but record the event to debug logger. Subclasses may
	 * override this method and take appropriate actions, e.g. logout or alert the user.
	 */
	onIdleTimeout : function() {
		$debug("js.ua.Page#onIdleTimeout", "Idle timeout detected.");
	},

	/**
	 * Default handler for error on server method invocation. This handler just display system error dialog with server
	 * exception message. Application code may override this handler, perhaps for logging exception and display a more
	 * generic, locale sensitive, error message.
	 * 
	 * @param Object er server exception.
	 */
	onServerFail : function(er) {
		var text = "";
		if (er.url) {
			text += er.url;
			text += "\n";
		}
		text += er.cause;
		text += "\n";
		text += er.message;
		js.ua.System.error(text);
	},

	/**
	 * Business constrains exception handler. This handler just display business constrain hexadecimal code. Application
	 * code may override this handler and provide a more descriptive, perhaps locale sensitive, message.
	 * 
	 * @param Object er business constraints exception.
	 */
	onBusinessFail : function(er) {
		js.ua.System.error("Broken business constrain: 0x%4X", er.errorCode);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getById(String)}.
	 * 
	 * @param String id element ID to search for.
	 * @return js.dom.Element element with specified id or null.
	 */
	getById : function(id) {
		return WinMain.doc.getById(id);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getByTag(String)}.
	 * 
	 * @param String tag tag name to search for.
	 * @return js.dom.Element first element with specified tag or null.
	 */
	getByTag : function(tag) {
		return WinMain.doc.getByTag(tag);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getByCss(String, Object...)}.
	 * 
	 * @param String selectors CSS selectors to evaluate,
	 * @param Object... args optional arguments if <em>selectors</em> is formatted.
	 * @return js.dom.Element first found element or null.
	 */
	getByCss : function(selectors, args) {
		return WinMain.doc.getByCss(selectors, args);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getByCssClass(String)}.
	 * 
	 * @param String cssClass CSS class to search for.
	 * @return js.dom.Element found element or null.
	 */
	getByCssClass : function(cssClass) {
		return WinMain.doc.getByCssClass(cssClass);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getByClass(Object)}.
	 * 
	 * @param Object clazz class name or constructor for class to search for.
	 * @return js.dom.Element found element or null.
	 */
	getByClass : function(clazz) {
		return WinMain.doc.getByClass(clazz);
	},

	/**
	 * Shortcut for {@link js.dom.Document#getByName(String)}.
	 * 
	 * @param String name the name of the element to look for.
	 * @return js.dom.Element found element or null.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	getByName : function(name) {
		return WinMain.doc.getByName(name);
	},

	/**
	 * Shortcut for {@link js.dom.Document#findByTag(String)}.
	 * 
	 * @param String tag tag name to search for.
	 * @return js.dom.EList list of found elements, possible empty.
	 */
	findByTag : function(tag) {
		return WinMain.doc.findByTag(tag);
	},

	/**
	 * Shortcut for {@link js.dom.Document#findByCss(String, Object...)}.
	 * 
	 * @param String selectors CSS selectors to evaluate,
	 * @param Object... args optional arguments if <em>selectors</em> is formatted.
	 * @return js.dom.EList list of found elements, possible empty.
	 */
	findByCss : function(selectors) {
		return WinMain.doc.findByCss(selectors);
	},

	/**
	 * Shortcut for {@link js.dom.Document#findByCssClass(String)}.
	 * 
	 * @param String cssClass CSS class to search for.
	 * @return js.dom.EList list of found elements, possible empty.
	 */
	findByCssClass : function(cssClass) {
		return WinMain.doc.findByCssClass(cssClass);
	},

	/**
	 * Shortcut for {@link js.dom.Document#findByClass(Object)}.
	 * 
	 * @param Object clazz class name or constructor for class to search for.
	 * @return EList list of elements of requested class, possible empty.
	 */
	findByClass : function(clazz) {
		return WinMain.doc.findByClass(clazz);
	},

	/**
	 * Shortcut for {@link js.dom.Document#findByName(String)}.
	 * 
	 * @param String name the name of the elements to look for.
	 * @return js.dom.EList list of found elements, possible empty.
	 * @assert <code>name</code> argument is not undefined, null or empty.
	 */
	findByName : function(name) {
		return WinMain.doc.findByName(name);
	},

	/**
	 * Register event listeners to main window document. This method is alias for
	 * {@link js.dom.Document#on(String, Function, Object, Boolean...)}.
	 * 
	 * @param String type DOM event type,
	 * @param Function listener event listener to register,
	 * @param Object scope listener run-time scope,
	 * @param Boolean... capture optional capture flag, default to false.
	 */
	on : function(type, listener, scope, capture) {
		WinMain.doc.on(type, listener, scope, capture);
	},

	/**
	 * Work in progress. This is an experimental feature: Alt key shortcuts for buttons.
	 */
	_registerButtonKeys : function() {
		var buttonKeys = {};
		var it = $L("button[data-key]").it(), button;
		while (it.hasNext()) {
			button = it.next();
			buttonKeys[button.getAttr("data-key").charCodeAt(0)] = button.getNode();
		}

		$E("body").focus().on("keydown", function(ev) {
			if (ev.altKey && ev.key !== 18) {
				if (ev.key in buttonKeys) {
					var evt = document.createEvent("MouseEvents");
					evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					buttonKeys[ev.key].dispatchEvent(evt);
				}
				ev.halt();
			}
		});
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.ua.Page";
	}
};
$extends(js.ua.Page, Object);
