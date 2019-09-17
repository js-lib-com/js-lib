$package('js.dom');

/**
 * Document object builder. This utility class supplies factory methods for documents creation, parsing from string and
 * asynchronous loading from URL. Anyway, cross-domain security is applied so one can load documents only from current
 * domain.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.dom.Builder = {
	/**
	 * Create XML document. This method creates a new empty XML document and its root element. If given root tag is
	 * undefined, null or empty this method behavior is not defined.
	 * 
	 * @param String root document root tag.
	 * @return js.dom.Document newly created document object.
	 * @assert <em>root</em> argument is not undefined, null or empty.
	 */
	createXML : function(root) {
		$assert(root, 'js.dom.Builder#createXML', 'Root is undefined, null or empty.');
		return new js.dom.Document(window.document.implementation.createDocument('', root, null));
	},

	/**
	 * Parse XML string. Return a new document created by parsing given XML string. XML declaration is optional. If
	 * given XML string is undefined, null or empty this method behavior is not defined.
	 * 
	 * @param String xml XML content represented as a string.
	 * @return js.dom.Document newly created document object.
	 * @throws js.dom.DomException on missing DOM parser support or on parsing error.
	 * @assert <em>xml</em> argument is not undefined, null or empty.
	 */
	parseXML : function(xml) {
		$assert(xml, 'js.dom.Builder#parseXML', 'XML is undefined, null or empty.');
		return this._parse(xml, 'text/xml');
	},

	/**
	 * Parse HTML string. Return a new document created by parsing given HTML string. HTML DOCTYPE is optional. If given
	 * HTML string is undefined, null or empty this method behavior is not defined.
	 * 
	 * <p>
	 * Please note that DOM Parser is actually a XML parser and expect well formed source even if HTML. In fact content
	 * type used to parse HTML is <em>application/xhtml+xml</em> so this method may be better named
	 * <em>parseXHTML</em> but decided to stick with names from Baby DOM interface.
	 * 
	 * @param String html HTML content represented as a string.
	 * @return js.dom.Document newly created document object.
	 * @throws js.dom.DomException on missing DOM parser support or on parsing error.
	 * @assert <em>html</em> argument is not undefined, null or empty.
	 */
	parseHTML : function(html) {
		$assert(html, 'js.dom.Builder#parseHTML', 'HTML is undefined, null or empty.');
		return this._parse(html, 'application/xhtml+xml');
	},

	/**
	 * Helper for string parsing. Parse source string and return newly created document. Source should be well formed,
	 * even if HTML or exception will be thrown.
	 * 
	 * @param String source XML or HTML content source,
	 * @param String contentType content type.
	 * @return js.dom.Document newly created document object.
	 * @throws js.dom.DomException on missing XML parser support or on parsing error.
	 * @assert <em>source</em> argument is not undefined, null or empty.
	 */
	_parse : function(source, contentType) {
		$assert(source, 'js.dom.Builder#_parse', 'Source is undefined, null or empty.');
		var document = new DOMParser().parseFromString(source, contentType);
		if (typeof document === 'undefined') {
			throw new js.dom.DomException('Missing DOM parser support.');
		}
		var root = document.documentElement;
		// it seems there are browsers correctly using root node as parser error signal
		// and others using first child of root node
		// surprinsiglly chrome is in the second category
		if (root.nodeName === 'parsererror' || (root.firstChild && root.firstChild.nodeName === 'parsererror')) {
			throw new js.dom.DomException('Parse error.');
		}
		return new js.dom.Document(document);
	},

	/**
	 * Load XML document. Uses {@link #_load load helper} to perform XML loading.
	 * 
	 * @param String url source URL,
	 * @param Function callback call on document loaded,
	 * @param Object scope optional callback execution scope, default to global.
	 * @note cross-domain security is applied so one can load XML documents only from current domain.
	 */
	loadXML : function(url, callback, scope) {
		this._load(url, 'text/xml', callback, scope);
	},

	/**
	 * Load HTML document. Uses {@link #_load load helper} to perform HTML loading.
	 * 
	 * @param String url source URL,
	 * @param Function callback call on document loaded,
	 * @param Object scope optional callback execution scope, default to global.
	 * @note cross-domain security is applied so one can load HTML documents only from current domain.
	 */
	loadHTML : function(url, callback, scope) {
		this._load(url, 'application/xhtml+xml', callback, scope);
	},

	/**
	 * Helper for document loading. This method creates a new empty document and load asynchronously its content from
	 * specified URL, invoking callback with loaded document as argument, when ready. Callback signature should be
	 * 
	 * <pre>void callback(js.dom.Document)</pre>
	 * 
	 * If given URL is undefined, null or empty or callback is null or not a function this method behavior is not
	 * defined.
	 * 
	 * @param String url source URL,
	 * @param String contentType content type,
	 * @param Function callback call on document loaded,
	 * @param Object scope optional callback execution scope, default to global.
	 * @assert <em>url</em> argument is not undefined, null or empty and denote a hyper-reference that is not
	 *         cross-domain. Also <em>callback</em> should be not null and of type {@link Function}.
	 * @note cross-domain security is applied so one can load documents only from current domain.
	 */
	_load : function(url, contentType, callback, scope) {
		$assert(url, 'js.dom.Builder#_load', 'URL is undefined, null or empty.');
		$assert(js.lang.Types.isFunction(callback), 'js.dom.Builder#_load', 'Callback is not a function.');
		$assert(this._pageDomain === js.net.URL.getHost(url), 'js.dom.Builder#_load', 'Cross-domain URL.');
		if (!url || !js.lang.Types.isFunction(callback)) {
			return;
		}

		var xhr = new js.net.XHR();
		xhr.on('load', callback, scope);
		xhr.open('GET', url);
		xhr.send();
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.dom.Builder';
	}
};

/**
 * Builder static initialization. Initialize current page domain used for cross-domain check.
 */
$static(function() {
	js.dom.Builder._pageDomain = js.net.URL.getHost(window.location.toString());
});

/**
 * IE has its own way to create and parse XML documents and to handle parssing errors.
 */
$legacy(js.ua.Engine.TRIDENT, function() {
	js.dom.Builder.createXML = function(root) {
		var doc = new ActiveXObject('MSXML2.DOMDocument');
		doc.async = false;
		doc.loadXML('<' + root + '/>');
		return new js.dom.Document(doc);
	};

	js.dom.Builder._parse = function(source, contentType) {
		$assert(source, 'js.dom.Builder#_parse', 'Source is undefined, null or empty.');
		var doc = new ActiveXObject('MSXML2.DOMDocument');
		doc.async = false;
		doc.loadXML(source);
		if (typeof doc === 'undefined') {
			throw new js.dom.DomException('js.dom.Builder#_parse', 'Missing DOM parser support.');
		}
		if (Number(doc.parseError.errorCode) !== 0) {
			throw new js.dom.DomException('js.dom.Builder#_parse', 'Parse error.');
		}
		return new js.dom.Document(doc);
	};
});
