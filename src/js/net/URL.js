$package("js.net");

$include("js.lang.Types");

/**
 * Uniform Resource Locator. URL is a pointer to a <em>resource</em> on the World Wide Web. A resource can be
 * something as simple as a file or a directory, or it can be a reference to a more complicated object, such as a query
 * to a database or to a search engine. Recognized URL format is:
 * 
 * <pre>
 *	URL:= protocol "://" [host] [":" port] "/" path ["?" query] ["#" ref]
 *
 *	protocol:= "file" | "http" | "https" | "ftp"
 *	host:= host fully qualified domain name
 *	port:= optional port number - default to 80
 *	path:= resource name within host context
 *	query:= optional query parameters, name=value pairs separated by ampersand
 *	ref:= optional reference or fragment indicating resource part
 * </pre>
 * 
 * If a component is missing its value is null. Exception is port which defaults to 80. Following built-in objects
 * pattern there are two use cases: using with new operator create a new instance with all fields properly initialized
 * while when using as a function returns string value, useful for quick URL formatting, see snippet below:
 * 
 * <pre>
 * 	var url = new js.net.URL("http://www.youtube.com/video/watch/files.avi", {			
 * 		v : "p6K_VT6tcvs",			
 * 		feature : "relmfu"		
 * 	});
 * 	// here url is a js.net.URL instance with all fields properly initialized
 * </pre>
 * 
 * <pre>
 * 	var url = js.net.URL("http://www.youtube.com/video/watch/files.avi", {			
 * 		v : "p6K_VT6tcvs",			
 * 		feature : "relmfu"		
 * 	});
 * 	// here url is the string "http://www.youtube.com/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu"
 * </pre>
 * 
 * Note that relative URL are supported in which case URL is converted to absolute using current page location.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct URL instance. If only one argument is present it should be a fully formatted URL, as a string
 * with format as described by this class. If this constructor is invoked with two arguments first is URL, but without
 * query parameters. Second argument, if present should be an object used as name=value hash; it will be appended to URL
 * value as query part.
 * 
 * @param String url URL represented as a string,
 * @param Object parameters optional query parameters.
 */
js.net.URL = function() {
	$assert(js.lang.Types.isString(arguments[0]), "js.net.URL#URL", "URL is not a string.");
	var url;

	if (!(this instanceof js.net.URL)) {
		url = js.net.URL.normalize(arguments[0]);
		if (arguments.length > 1) {
			url += js.net.URL.formatQuery(arguments[1]);
		}
		$assert((function() {
			var rex = js.net.URL.prototype._FULL_URL_REX;
			rex.lastIndex = 0;
			var m = rex.exec(url);
			return m !== null && m.length === 7;
		})(), "js.net.URL#URL", "Malformed URL value: [%s]", url);
		return url;
	}

	if (arguments.length === 1) {
		url = js.net.URL.normalize(arguments[0]);
		this._FULL_URL_REX.lastIndex = 0;
		var m = this._FULL_URL_REX.exec(url);
		$assert(m !== null && m.length === 7, "js.net.URL#URL", "Malformed URL value |%s|", arguments[0]);
		this._init(m);

		/**
		 * Parsed query parameters or empty object. Object used as a hash of name=value pairs.
		 * 
		 * @type Object
		 */
		this.parameters = this.query ? js.net.URL.parseQuery(this.query) : {};

		/**
		 * URL string value.
		 * 
		 * @type String
		 */
		this.value = url;
		return;
	}

	if (arguments.length === 2) {
		$assert(js.lang.Types.isObject(arguments[1]), "js.net.URL#URL", "Parameters is not an object.");

		url = js.net.URL.normalize(arguments[0]);
		this.parameters = arguments[1];
		var query = js.net.URL.formatQuery(this.parameters);
		this.value = url + query;

		this._SHORT_URL_REX.lastIndex = 0;
		var m = this._SHORT_URL_REX.exec(url);
		$assert(m !== null && m.length === 5, "js.net.URL#URL", "Malformed URL value |%s|", arguments[0]);
		m[5] = query.substr(1);
		this._init(m);
	}
};

/**
 * Get URL host. Try to extract host name from given URL. Returns empty string if protocol is file and null if URL is
 * not properly formatted, e.g. protocol part is missing.
 * 
 * @param String url string representing the URL.
 * @return String host name, possible empty or null. $assert <em>url</em> argument is not undefined, null or empty.
 */
js.net.URL.getHost = function(url) {
	$assert(url, "js.net.URL#getHost", "URL is undefined, null or empty.");
	if (url) {
		var startIndex = url.indexOf("://");
		if (startIndex !== -1) {
			if (url.substring(0, startIndex).toLowerCase() === "file") {
				// if protocol is file host name is empty string
				return "";
			}
			startIndex += 3;
			var endIndex = url.indexOf("/", startIndex);
			if (endIndex === -1) {
				endIndex = url.length;
			}
			return url.substring(startIndex, endIndex);
		}
	}
	return null;
};

/**
 * Parse query string. Extract name=value pairs from query string and initialize an object used as a hash.
 * 
 * @param String query, query string.
 * @return Object parsed query parameters.
 */
js.net.URL.parseQuery = function(query) {
	$assert(query, "js.net.URL#parseQuery", "Query is undefined, null or empty.");
	if (query) {
		var parameters = {};
		var a = query.split("&");
		for (var i = 0, kv; i < a.length; i++) {
			kv = a[i].split("=");
			parameters[kv[0]] = kv[1];
		}
		return parameters;
	}
	return null;
};

/**
 * Format query string. This method takes a hash of name=value pairs and format it as query string, usable on URL query
 * part. Starting question mark is included. Every value from given parameters hash is converted to string using
 * JavaScript built-in conversion less boolean which is translated to 1 for true and 0 for false; please remember that
 * an array is converted into a comma separated string.
 * 
 * @param Object parameters, query parameters.
 * @return String formatted query string.
 * @assert parameters are not null or undefined.
 */
js.net.URL.formatQuery = function(parameters) {
	$assert(parameters, "js.net.URL#formatQuery", "Parameters hash is undefined or null.");
	var a = [], v;
	if (parameters) {
		for ( var p in parameters) {
			v = parameters[p];
			if (v === true) {
				v = 1;
			}
			else if (v === false) {
				v = 0;
			}
			a.push(p + "=" + encodeURIComponent(v));
		}
	}
	return a.length ? ("?" + a.join("&")) : "";
};

/**
 * Get absolute URL for given relative file path. This method compute absolute URL based on current loaded page
 * location.
 * 
 * @param String path relative file path.
 * @return String absolute URL of given relative file path.
 */
js.net.URL.absolute = function(path) {
	$assert(path, "js.net.URL#absolute", "Path is undefined, null or empty.");
	if (path.charAt(0) !== '/') {
		path = '/' + path;
	}
	return $format("%s://%s:%d%s", WinMain.url.protocol, WinMain.url.host, WinMain.url.port, path);
}

/**
 * Normalize URL. Return absolute URL, completing with parts from this page location if necessary. Uses next approach:
 * if given URL starts with schema just return it, since it is already absolute. Otherwise given URL should be a path.
 * If path is absolute, that is, starts with path separator, format a new URL using page location protocol, host, port
 * and the path. If given path is relative, uses location, remove file part - the part after last path separator and
 * append given relative path.
 * 
 * @param String url URL value to normalize.
 * @return String normalized URL.
 */
js.net.URL.normalize = function(url) {
	// first test against URL schema to see if absolute URL
	var rex = js.net.URL.prototype._SCHEMA_REX;
	rex.lastIndex = 0;
	if (rex.test(url)) {
		// if already absolute URL returns it as it is
		return url;
	}

	var ref = WinMain.url; // referrer

	if (url.charAt(0) === "/") {
		return $format("%s://%s:%d/%s", ref.protocol, ref.host, ref.port, url);
	}
	return ref.value.substring(0, ref.value.lastIndexOf("/") + 1) + url;
};

js.net.URL.prototype = {
	/**
	 * Full URL pattern. Recognized format is described by this {@link js.net.URL class}.
	 * 
	 * @type RegExp
	 */
	_FULL_URL_REX : /^(http|https|ftp|file):\/\/([^:\/]+)?(?::([0-9]{1,5}))?(?:(?:\/?)|(?:\/([^\/?#][^?#]*)))?(?:\?([^?#]*))?(?:#(.+)?)?$/gi,

	/**
	 * Short URL pattern. Recognized format is protocol://host:port/path. This pattern is not usable if query or
	 * reference are present. Uses {@link #_FULL_URL_REX} instead.
	 * 
	 * @type RegExp
	 */
	_SHORT_URL_REX : /^(http|https|ftp|file):\/\/([^:\/]+)(?::([0-9]{1,5}))?(?:(?:\/?)|(?:\/([^\/?#][^?#]*)))?$/gi,

	/**
	 * URL schema pattern.
	 * 
	 * @type RegExp
	 */
	_SCHEMA_REX : /^[^:]+:\/\/.+$/gi,

	/**
	 * Initialize this URL components.
	 * 
	 * @param Array matches, values resulted from pattern matching.
	 */
	_init : function(matches) {
		/**
		 * Protocol or null. This implementation recognize only file, http, https, ftp and file.
		 * 
		 * @type String
		 */
		this.protocol = matches[1] ? matches[1] : null;

		/**
		 * Host fully qualified domain name or null.
		 * 
		 * @type String
		 */
		this.host = matches[2] ? matches[2] : null;

		/**
		 * Port number, default to 80 for HTTP or 443 for HTTPS.
		 * 
		 * @type Number
		 */
		this.port = Number(matches[3]) || (this.protocol.toLowerCase() === "https" ? 443 : 80);

		/**
		 * Resource name within host context or null. Given next URL
		 * 
		 * <pre>
		 * 	http://host:port/path/to/resource/file.ext?query#ref
		 * </pre>
		 * 
		 * path string is <em>path/to/resource/file.ext</em>, no trailing slash.
		 * 
		 * @type String
		 */
		this.path = matches[4] ? matches[4] : null;

		/**
		 * Raw query string or null. Given next URL
		 * 
		 * <pre>
		 * 	http://host:port/resource?name1=value1&name2=value2#ref
		 * </pre>
		 * 
		 * query string is <em>name1=value1&name2=value2</em>, trailing question mark not included.
		 * 
		 * @type String
		 */
		this.query = matches[5] ? matches[5] : null;

		/**
		 * Reference - fragment part or null. This is the last URL part, after sharp separator - not included.
		 * 
		 * @type String
		 */
		this.ref = matches[6] ? matches[6] : null;
	},

	/**
	 * Compare this URL instance with given url argument for cross domain condition. Two URLs are cross domain if have
	 * different protocol, host or port. Return true if given url argument is undefined or null. Note that this
	 * predicate consider complete host name, not only base domain, e.g. <em>api.bbnet.ro</em> is cross domain with
	 * <em>apps.bbnet.ro</em>.
	 * 
	 * @param String url url to test.
	 * @return Boolean true is this URL instance and <code>url</code> argument are not on same domain.
	 */
	isCrossDomain : function(url) {
		if (!url) {
			return true;
		}
		url = new js.net.URL(js.net.URL.normalize(url));
		if (this.protocol !== url.protocol) {
			return true;
		}
		if (this.host !== url.host) {
			return true;
		}
		if (this.port !== url.port) {
			return true;
		}
		return false;
	},

	download : function(fileName) {
		var link = document.createElement('a');
		link.href = this.value;
		link.download = fileName;
		link.onclick = function(ev) {
			ev.target.remove();
		}
		document.body.appendChild(link);
		link.click();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return "js.net.URL";
	}
};
$extends(js.net.URL, Object);
