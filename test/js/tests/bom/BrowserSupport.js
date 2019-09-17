BrowserSupportTestCase = {
	testFunctionBind : function() {
		var boundMethod;
		var packet = {};
		packet.Class = {
			init : function() {
				boundMethod = this.method.bind(this);
			},

			method : function() {
				assertEquals(packet.Class, this);
			}
		};
		packet.Class.init();
		boundMethod();
	},

	testBoundingClientRectSupport : function() {
		var scratch = document.getElementById('scratch-area-id');
		var rect = scratch.getBoundingClientRect();
		assertDefined(rect.top);
		assertDefined(rect.right);
		assertDefined(rect.bottom);
		assertDefined(rect.left);
		if (!this._isTrident()) {
			assertDefined(rect.width);
			assertDefined(rect.height);
		}
	},

	/**
	 * Is not allowed to invoke attribute getter on text node.
	 */
	testTextNodeAttributes : function() {
		var html = '<p>some text</p>';
		this._initContext(html);
		var scratch = document.getElementById('scratch-area-id');
		var textNode = document.getElementById('scratch-area-id').firstChild.firstChild;
		try {
			textNode.getAttribute('fake-attribute');
			TestCase.fail();
		} catch (er) {
			assertTrue(er instanceof TypeError);
		}
	},

	testListingToStringInForeachLoop : function() {
		var toString = false;
		var valueOf = false;
		var obj = {
			toString : function() {
			},
			valueOf : function() {
			}
		};
		for ( var p in obj) {
			if (p === 'toString') {
				toString = true;
			}
			if (p === 'valueOf') {
				valueOf = true;
			}
		}
		if (this._isTrident()) {
			// IE does not list toString and valueOf in foreach loop
			assertFalse(toString);
			assertFalse(valueOf);
		}
		else {
			assertTrue(toString);
			assertTrue(valueOf);
		}
	},

	testRexExpExec : function() {
		var trident = this._isTrident();
		function assertUndefined(value) {
			if (trident) {
				assertEquals('', value);
			}
			else {
				assertEquals(undefined, value);
			}
		}

		var rex = /^(file|http|https|ftp):\/\/([^:\/]+)?(?::([0-9]{1,5}))?(?:(?:\/?)|(?:\/([^\/?#][^?#]*)))?(?:\?([^?#]+))?(?:#(.+)?)?$/gi;
		var m = rex.exec('file:///D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom');
		assertNotNull(m);
		assertEquals('file:///D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom', m[0]);
		assertEquals('file', m[1]);
		assertUndefined(m[2]);
		assertUndefined(m[3]);
		assertEquals('D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom', m[4]);
		assertUndefined(m[5]);
		assertUndefined(m[6]);
	},

	/**
	 * On deep cloning IE clone has parentNode refering a document fragment instead of null.
	 */
	testNodeCloningParent : function() {
		var html = '' + '<div>' + '	<h1>header 1</h1>' + '</div>';
		this._initContext(html);
		var scratch = document.getElementById('scratch-area-id');
		var div = document.getElementById('scratch-area-id').firstChild;

		assertEquals(1, scratch.childNodes.length);
		var clone = div.cloneNode(false);
		assertNull(clone.parentNode);
		assertEquals(1, scratch.childNodes.length);

		clone = div.cloneNode(true);
		if (this._isTrident()) {
			assertNotNull(clone.parentNode);
			assertEquals(11, clone.parentNode.nodeType);
		}
		else {
			assertNull(clone.parentNode);
		}
		assertEquals(1, scratch.childNodes.length);

		this._clearContext();
	},

	/**
	 * IE XML node has not hasAttribute method.
	 */
	testNodeHasAttributes : function() {
		var node = document.createElement('p');
		assertTrue(typeof node.hasAttributes !== 'undefined');

		var html = '' + '<html>' + '	<head>' + '		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' + '	</head>' + '	<body>' + '		<p></p>' + '	</body>' + '</html>';

		var doc;
		if (this._isTrident()) {
			doc = new ActiveXObject('MSXML2.DOMDocument.6.0');
			doc.async = false;
			doc.loadXML(html);
			node = doc.getElementsByTagName('p')[0];
			assertFalse(typeof node.hasAttributes !== 'undefined');
		}
		else {
			var doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
			doc = new DOMParser().parseFromString(doctype + html, 'application/xhtml+xml');
			node = doc.getElementsByTagName('p')[0];
			assertTrue(typeof node.hasAttributes !== 'undefined');
		}
	},

	/**
	 * Node.style property for documents created with DomParser.parseFromString: undefined on Gecko and Trident, null on
	 * WebKit and valid value on Presto. This is true even document was created from valid (X)HTML and content type
	 * application/xhtml+xml
	 * 
	 * <p>
	 * Anyway, for window.document detached nodes, i.e. just created by window.document, style property does have valid
	 * value.
	 */
	testUndefinedNodeStyle : function() {
		var node = document.createElement('p');
		assertTrue(!!node.style);

		var html = '' + '<html>' + '	<head>' + '		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' + '	</head>' + '	<body>' + '		<p></p>' + '	</body>' + '</html>';

		var doc;
		if (this._isTrident()) {
			doc = new ActiveXObject('MSXML2.DOMDocument.6.0');
			doc.async = false;
			doc.loadXML(html);
		}
		else {
			var doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
			doc = new DOMParser().parseFromString(doctype + html, 'application/xhtml+xml');
		}
		node = doc.getElementsByTagName('p')[0];
		if (this._isWebKit()) {
			assertTrue(node.style === null);
		}
		else if (this._isPresto()) {
			assertTrue(!!node.style);
		}
		else {
			assertTrue(typeof node.style === 'undefined');
		}
	},

	/**
	 * W3C DOM Text interface requires escaping. Excerpt: ... depending on its[n.b. Text node] position in the document,
	 * some characters must be escaped during serialization using character references...
	 */
	testEscapeText : function() {
		var html = '<p id="escape-text"></p>';
		this._initContext(html);

		var text = document.createTextNode('<&]]>');
		var p = document.getElementById('escape-text');
		p.appendChild(text);
		assertEquals('&lt;&amp;]]&gt;', p.innerHTML);
		assertEquals('<&]]>', p.firstChild.nodeValue);

		this._clearContext();
	},

	testNodeConstants : function() {
		if (this._isTrident()) {
			assertTrue(typeof Node === 'undefined');
			Node = {
				ELEMENT_NODE : 1,
				TEXT_NODE : 3,
				COMMENT_NODE : 8
			};
		}
		else {
			assertTrue(typeof Node !== 'undefined');
			assertEquals(1, Node.ELEMENT_NODE);
			assertEquals(3, Node.TEXT_NODE);
			assertEquals(8, Node.COMMENT_NODE);
			assertEquals(9, Node.DOCUMENT_NODE);
		}
	},

	/**
	 * Add select options dynamically using append child. Works on all browsers less IE, that add option as child node
	 * to select but does not actually display it. Anyway standard for adding options to a select is to use
	 * Select.add(option, before) method.
	 */
	testAppendChildOptionElementToSelect : function() {
		var html = '' + '<h1>Append Child Option Element to Select</h1>' + '<form id="form-id">' + '	<select id="select-id"></select>' + '</form>';
		this._initContext(html);

		var select = document.getElementById('select-id');
		assertEmpty(select);

		var option = document.createElement('option');
		option.text = 'Male';
		option.value = 'MALE';
		select.appendChild(option);
		assertSize(1, select.childNodes);

		// NOTE tester should observe browser interface to see if option is actually displayed
		assertTrue(confirm('Is <male> options present?'));

		this._clearContext();
	},

	/**
	 * Add option to select. Uses standard Select.add(option, before) to dynamically add option to a select. It should
	 * work on all browsers.
	 */
	testAddOptionToSelect : function() {
		var html = '' + '<h1>Add Option to Select</h1>' + '<form id="form-id">' + '	<select id="select-id"></select>' + '</form>';
		this._initContext(html);

		var select = document.getElementById('select-id');
		assertEmpty(select);

		var option = document.createElement('option');
		option.text = 'Male';
		option.value = 'MALE';
		select.add(option, null);
		assertSize(1, select.childNodes);

		// NOTE tester should observe browser interface to see if option is actually displayed
		assertTrue(confirm('Is <male> options present?'));

		this._clearContext();
	},

	/**
	 * Reset a form with hidden input. W3C specs does say all controls should reset to initial value. I do not found any
	 * exception for hidden inputs but surprisingly enough only IE follows the spec.
	 */
	testHiddenInputReset : function() {
		var html = '' + '<h1>Hidden Input Reset</h1>' + '<form id="form-id">' + '	<input id="person-id" type="hidden" value="random value" name="person-id" />' + '</form>';
		this._initContext(html);

		var form = document.getElementById('form-id');
		var input = document.getElementById('person-id');
		var initialValue = input.value;
		var newValue = '5678';

		assertEquals('random value', initialValue);
		input.value = newValue;
		form.reset();
		if (this._isTrident()) {
			// only IE reset to initial value
			assertEquals(initialValue, input.value);
		}
		else {
			assertEquals(newValue, input.value);
		}

		this._clearContext();
	},

	/**
	 * Insert a span without end tag. All browsers should consider that HTML fragment valid and actually create child
	 * span.
	 */
	testInvalidInnerHtml : function() {
		var html = '' + '<h1>Invalid Inner HTML</h1>' + '<p id="paragraph-id"></p>';
		this._initContext(html);

		var p = document.getElementById('paragraph-id');
		assertEmpty(p);
		p.innerHTML = '<SPAN>span text';
		assertSize(1, p.childNodes);
		var span = p.getElementsByTagName('span')[0];
		assertEquals('SPAN', span.nodeName);
		assertEquals('span text', span.innerHTML);
		p.removeChild(span);

		p.innerHTML = '<span>span text';
		assertSize(1, p.childNodes);
		span = p.getElementsByTagName('span')[0];
		assertEquals('SPAN', span.nodeName);
		assertEquals('span text', span.innerHTML);

		this._clearContext();
	},

	/**
	 * Insert a block HTML fragment, i.e. a
	 * <p>, into another
	 * </p>. IE does validate HTML fragment against its future parent and generates 'Unknown runtime error'. Although
	 * is the only browser performing this validation we can consider it a reasonable approach. What is hardly to
	 * understand is why generated exception can't be caught!
	 */
	testBlockInnerHtml : function() {
		var html = '' + '<h1>Invalid Inner HTML</h1>' + '<p id="paragraph-id"></p>';
		this._initContext(html);

		var p = document.getElementById('paragraph-id');
		assertEmpty(p);
		var html = '<p>this is a <b>paragraph</b> test</p>';
		if (this._isTrident()) {
			try {
				p.innerHTML = html;
				this.fail();
			} catch (e) {
				// unfortunately this catch does not work on 'Unknown runtime error' generated by IE when try above code
				// alert(e);
			}
		}
		else {
			p.innerHTML = html;
			assertSize(1, p.childNodes);
			assertNotNull(p.firstChild);
			assertEquals('P', p.firstChild.tagName);
		}

		this._clearContext();
	},

	/**
	 * User data is not supported only by Gecko
	 */
	testUserData : function() {
		var html = '<p id="paragraph-id"></p>';
		this._initContext(html);
		var KEY = '__key__';
		var VALUE = '__value__';

		if (this._isGecko()) {
			var n1 = document.getElementById('paragraph-id');
			n1.setUserData(KEY, VALUE, null);
			var n2 = document.querySelector('#scratch-area-id p');
			assertEquals(VALUE, n2.getUserData(KEY));
		}
		else {
			try {
				var n = document.getElementById('paragraph-id');
				n.setUserData(KEY, VALUE, null);
				TestCase.fail('User data should rise exception on IE.');
			} catch (e) {
			}
		}
		this._clearContext();
	},

	/**
	 * HTML node augmentation is supported by all browsers. Very important: j(s)-lib element back reference is based on.
	 */
	testHtmlNodeAugmentation : function() {
		var html = '<p id="paragraph-id"></p>';
		this._initContext(html);
		var AUGMENT = '__augment__';
		var VALUE = '__value__';

		var n1 = document.getElementById('paragraph-id');
		n1[AUGMENT] = VALUE;
		var n2 = document.querySelector('#scratch-area-id p');
		assertEquals(VALUE, n2[AUGMENT]);

		this._clearContext();
	},

	/**
	 * XML node augmentation fails on IE.
	 */
	testXmlNodeAugmentation : function() {
		var xml = '' + '<?xml version="1.0" encoding="UTF-8"?>' + '<person>' + '	<name>Iulian</name>' + '</person>';
		var doc;
		if (typeof DOMParser !== 'undefined') {
			doc = new DOMParser().parseFromString(xml, 'text/xml');
		}
		else {
			doc = new ActiveXObject('MSXML2.DOMDocument');
			doc.async = 'false';
			doc.loadXML(xml);
		}
		var AUGMENT = '__augment__';
		var VALUE = '__value__';

		if (this._isTrident()) {
			try {
				var n = doc.getElementsByTagName('name')[0];
				n[AUGMENT] = VALUE;
				TestCase.fail('Augmenting XML node should rise exception on IE.');
			} catch (e) {
			}
		}
		else {
			var n1 = doc.getElementsByTagName('name')[0];
			n1[AUGMENT] = VALUE;
			var n2 = doc.querySelector('person name');
			assertEquals(VALUE, n2[AUGMENT]);
		}
	},

	/**
	 * Deep clone node does not copy augmented values. Deep clone a table with some elements augmented with random
	 * values. All browsers except IE does not copy augmented values.
	 */
	testClonningWithAugmentedNodes : function() {
		var html = '' + '<h1>Clonning With Augmented Nodes</h1>' + '<table id="table-id">' + '	<tbody>' + '		<tr>' + '			<td>Iulian Rotaru</td>' + '			<td>iuli@bbnet.ro</td>' + '		</tr>' + '	</tbody>' + '</table>';
		this._initContext(html);

		var AUGMENT = '_augmented_value_';
		var tableValue = Math.random();
		var tdValue = Math.random();

		var tableNode = document.getElementById('table-id');
		assertUndefined(tableNode[AUGMENT]);
		tableNode[AUGMENT] = tableValue;
		assertEquals(tableValue, tableNode[AUGMENT]);

		var tdNode = tableNode.getElementsByTagName('td')[0];
		assertUndefined(tdNode[AUGMENT]);
		tdNode[AUGMENT] = tdValue;
		assertEquals(tdValue, tdNode[AUGMENT]);

		var tableClone = tableNode.cloneNode(true);
		var tdClone = tableClone.getElementsByTagName('td')[0];
		if (this._isTrident()) {
			assertEquals(tableValue, tableClone[AUGMENT]);
			assertEquals(tdValue, tdClone[AUGMENT]);
		}
		else {
			assertUndefined(tableClone[AUGMENT]);
			assertUndefined(tdClone[AUGMENT]);
		}

		this._clearContext();
	},

	// there are browsers with nodes owned by documents created by DomParser.parseFromString having no style property
	// no style meaning undefined (Gecko and Trident) or null (WebKit) - Presto does have style
	// above is true even if parsing source is valid XHTML using content type application/xhtml+xml
	testXmlNodesStyle : function() {

	},

	/**
	 * Try to set a value for an input with display:none. While writing and reading input value is working I'm not sure
	 * if user interface is actually updated when input become visible with display:inherited.
	 */
	testSetInputValueOnDisplayNone : function() {
		var html = '' + '<h1>Set Value On Display None</h1>' + '<form>' + '	<input id="input-id" type="text" />' + '</form>';
		this._initContext(html);

		var input = document.getElementById('input-id');
		var value = 'random value';

		assertEmpty(input.value);
		input.style.display = 'none';
		input.value = value;
		assertEquals(value, input.value);
		input.style.display = 'inherit';

		// NOTE tester should observe browser interface to see if input value is actually displayed
		assertTrue(confirm('Is <random value> present in input?'));

		this._clearContext();
	},

	/**
	 * Global function as window property. Declare a global variable as window object property and assign a anonymous
	 * function that throws Error. Invoking that function using global variable name must throw mentioned Error. This is
	 * true in all browsers less IE that throws TypeError with <Object doesn't support property...>.
	 */
	testGlobalScopeFunctionCall : function() {
		window.fn = function() {
			throw new Error('fn');
		};
		try {
			(function() {
				// invoking fn function defined as above will throw TypeError with <Object doesn't support property...>
				fn();
			})();
		} catch (e) {
			if (!this._isTrident()) {
				assertEquals('fn', e.message);
			}
			else {
				assertInstanceof(e, TypeError);
			}
		}
	},

	/**
	 * Global <em>item</em> assignment. Trying to assign to a global variable named <em>item</em> would throw
	 * TypeError with <Object doesn't support property...> on IE.
	 */
	testGlobalItemAssignment : function() {
		try {
			item = null;
			if (this._isTrident()) {
				TestCase.fail('IE should throw exception when try to assign to global item!');
			}
		} catch (e) {
			assertInstanceof(e, TypeError);
		}
		if (!this._isTrident()) {
			// on all serious browsers global item should be null at this point
			assertNull(item);
		}
	},

	/**
	 * Get element by ID support is messy: IE throws exception, chrome and safari return valid node whereas firefox and
	 * opera return null. Of course, this is true for XML documents without declared ID attribute.
	 */
	testGetElementById : function() {
		var xml = '' + '<person>\r\n' + '	<name id="name">Iulian</name>\r\n' + '	<surname>Rotaru</surname>\r\n' + '</person>';
		var document;
		if (typeof window.DOMParser !== 'undefined') {
			document = new DOMParser().parseFromString(xml, 'text/xml');
		}
		else {
			document = new ActiveXObject('MSXML2.DOMDocument');
			document.async = 'false';
			document.loadXML(xml);
		}
		assertDefined(document);

		if (this._isTrident()) {
			assertException(TypeError, document, 'getElementById', 'name');
		}
		else if (this._isWebKit()) {
			assertEquals('Iulian', document.getElementById('name').firstChild.nodeValue);
		}
		else {
			assertNull(document.getElementById('name'));
		}
	},

	/**
	 * It seems IE returns comments node too when searching for wildcard tag name, i.e. '*'
	 */
	testGetElementsByWildcardTagName : function() {
		var html = '' + '<h1>Get Elements by Wildcard Tag Name</h1>' + '<form id="form-id">' + '	<input type="text" name="person" />' + '	<!--first comment-->' + '	<input type="text" name="address" />' + '	<!--second comment-->' + '	<input type="text" name="profession" />' + '</form>';
		this._initContext(html);

		var form = document.getElementById('form-id');
		var nodeList = form.getElementsByTagName('*');
		if (this._isTrident()) {
			assertSize(5, nodeList);
			assertEquals(Node.COMMENT_NODE, nodeList.item(1).nodeType);
			assertEquals('first comment', nodeList.item(1).nodeValue);
		}
		else {
			assertSize(3, nodeList);
			assertEquals(Node.ELEMENT_NODE, nodeList.item(1).nodeType);
			assertNull(nodeList.item(1).nodeValue);
		}

		this._clearContext();
	},

	testGetElementsByClassName : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.getElementsByClassName === 'undefined');
			return;
		}
		assertTrue(typeof document.body.getElementsByClassName !== 'undefined');

		var html = '' + '<h1>Get Elements by Wildcard Tag Name</h1>' + '<form id="form-id">' + '	<input type="text" name="person" class="control" />' + '	<!--first comment-->' + '	<input type="text" name="address" class="control address" />' + '	<!--second comment-->' + '	<input type="text" name="profession" class="control" />' + '</form>';
		this._initContext(html);

		var form = document.getElementById('form-id');

		var nodeList = form.getElementsByClassName('control');
		assertSize(3, nodeList);
		assertEquals('person', nodeList.item(0).getAttribute('name'));
		assertEquals('address', nodeList.item(1).getAttribute('name'));
		assertEquals('profession', nodeList.item(2).getAttribute('name'));

		nodeList = form.getElementsByClassName('address');
		assertSize(1, nodeList);
		assertEquals('address', nodeList.item(0).getAttribute('name'));

		nodeList = form.getElementsByClassName('control address');
		assertSize(1, nodeList);
		assertEquals('address', nodeList.item(0).getAttribute('name'));

		nodeList = form.getElementsByClassName('address control');
		assertSize(1, nodeList);
		assertEquals('address', nodeList.item(0).getAttribute('name'));

		nodeList = form.getElementsByClassName('fake');
		assertEmpty(nodeList);

		this._clearContext();
	},

	testGetElementsByClassNameSpecial : function() {
		var html = '' + '<span class="class.name">class name</span>\r\n' + '<span class="#user.defined.class">user defined class</span>\r\n' + '<span class="$property">property</span>\r\n' + '<span class="%formatter">formatter</span>\r\n' + '<span class="*animation">animation</span>\r\n' + '<span class="^operation">operation</span>';
		this._initContext(html);

		if (this._isTrident()) {
			// IE does not support special characters in getElementsByClassName function argument
			assertException(TypeError, document, 'getElementsByClassName', 'class.name');
			assertException(TypeError, document, 'getElementsByClassName', '#user.defined.class');
			assertException(TypeError, document, 'getElementsByClassName', '$property');
			assertException(TypeError, document, 'getElementsByClassName', '%formatter');
			assertException(TypeError, document, 'getElementsByClassName', '*animation');
			assertException(TypeError, document, 'getElementsByClassName', '^operation');
		}
		else {
			assertEquals('class name', document.getElementsByClassName('class.name')[0].innerHTML);
			assertEquals('user defined class', document.getElementsByClassName('#user.defined.class')[0].innerHTML);
			assertEquals('property', document.getElementsByClassName('$property')[0].innerHTML);
			assertEquals('formatter', document.getElementsByClassName('%formatter')[0].innerHTML);
			assertEquals('animation', document.getElementsByClassName('*animation')[0].innerHTML);
			assertEquals('operation', document.getElementsByClassName('^operation')[0].innerHTML);
		}

		this._clearContext();
	},

	testFirstElementChild : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.firstElementChild === 'undefined');
			return;
		}
		assertTrue(typeof document.body.firstElementChild !== 'undefined');

		var html = '' + '<form id="form-id">\r\n' + '	<!--comment-->\r\n' + '	<fieldset id="fieldset-id">\r\n' + '		<!--comment-->\r\n' + '		<input id="input-id" />\r\n' + '	</fieldset>\r\n' + '</form>';
		this._initContext(html);

		var form = document.getElementById('form-id');
		assertEquals(Node.ELEMENT_NODE, form.firstElementChild.nodeType);
		assertEquals(Node.TEXT_NODE, form.firstChild.nodeType);
		assertEquals('fieldset-id', form.firstElementChild.getAttribute('id'));
		assertEquals('input-id', form.firstElementChild.firstElementChild.getAttribute('id'));

		this._clearContext();
	},

	testLastElementChild : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.lastElementChild === 'undefined');
			return;
		}
		assertTrue(typeof document.body.lastElementChild !== 'undefined');

		var html = '' + '<form id="form-id">\r\n' + '	<fieldset id="fieldset-id">\r\n' + '		<input id="input-id" />\r\n' + '		<!--comment-->\r\n' + '	</fieldset>\r\n' + '	<!--comment-->\r\n' + '</form>';
		this._initContext(html);

		var form = document.getElementById('form-id');
		assertEquals(Node.ELEMENT_NODE, form.lastElementChild.nodeType);
		assertEquals(Node.TEXT_NODE, form.lastChild.nodeType);
		assertEquals('fieldset-id', form.lastElementChild.getAttribute('id'));
		assertEquals('input-id', form.lastElementChild.lastElementChild.getAttribute('id'));

		this._clearContext();
	},

	testNextElementSibling : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.nextElementSibling === 'undefined');
			return;
		}
		assertTrue(typeof document.body.nextElementSibling !== 'undefined');

		var html = '' + '<form>\r\n' + '	<!--comment-->\r\n' + '	<input id="first-input-id" />\r\n' + '	<!--comment-->\r\n' + '	<input id="second-input-id" />\r\n' + '	<!--comment-->\r\n' + '	<input id="third-input-id" />\r\n' + '</form>';
		this._initContext(html);

		var node = document.getElementById('first-input-id');
		assertEquals(Node.ELEMENT_NODE, node.nextElementSibling.nodeType);
		assertEquals(Node.TEXT_NODE, node.nextSibling.nodeType);
		assertEquals('second-input-id', node.nextElementSibling.getAttribute('id'));
		assertEquals('third-input-id', node.nextElementSibling.nextElementSibling.getAttribute('id'));

		this._clearContext();
	},

	testPreviousElementSibling : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.previousElementSibling === 'undefined');
			return;
		}
		assertTrue(typeof document.body.previousElementSibling !== 'undefined');

		var html = '' + '<form>\r\n' + '	<input id="first-input-id" />\r\n' + '	<!--comment-->\r\n' + '	<input id="second-input-id" />\r\n' + '	<!--comment-->\r\n' + '	<input id="third-input-id" />\r\n' + '	<!--comment-->\r\n' + '</form>';
		this._initContext(html);

		var node = document.getElementById('third-input-id');
		assertEquals(Node.ELEMENT_NODE, node.previousElementSibling.nodeType);
		assertEquals(Node.TEXT_NODE, node.previousSibling.nodeType);
		assertEquals('second-input-id', node.previousElementSibling.getAttribute('id'));
		assertEquals('first-input-id', node.previousElementSibling.previousElementSibling.getAttribute('id'));

		this._clearContext();
	},

	testChildElementCount : function() {
		if (this._isTrident()) {
			assertTrue(typeof document.body.childElementCount === 'undefined');
			return;
		}
		assertTrue(typeof document.body.childElementCount !== 'undefined');

		var html = '' + '<h1>Get Elements by Wildcard Tag Name</h1>' + '<form id="form-id">' + '	<!--first comment-->' + '	<fieldset>' + '		<input type="text" name="person" class="control" />' + '		<!--first comment-->' + '		<input type="text" name="address" class="control address" />' + '		<!--second comment-->' + '		<input type="text" name="profession" class="control" />' + '	</fieldset>' + '	<!--second comment-->' + '	<fieldset>' + '		<input type="text" name="person" class="control" />' + '	</fieldset>' + '</form>';
		this._initContext(html);

		assertEquals(2, document.getElementById('form-id').childElementCount);
		assertEquals(3, document.getElementsByTagName('fieldset')[0].childElementCount);
		assertEquals(1, document.getElementsByTagName('fieldset')[1].childElementCount);
		assertEquals(0, document.getElementsByTagName('h1')[0].childElementCount);
		assertEquals(0, document.getElementsByTagName('input')[0].childElementCount);

		this._clearContext();
	},

	testQuerySelector : function() {
		var html = '' + '<h1 class="title">Get Elements by Wildcard Tag Name</h1>\r\n' + '<form id="form-id" class="form">\r\n' + '	<!--first comment-->\r\n' + '	<fieldset class="first-set">\r\n' + '		<input type="text" name="person" class="person-input" />\r\n' + '		<!--first comment-->\r\n' + '		<input type="text" name="address" class="address-input" />\r\n' + '		<!--second comment-->\r\n' + '		<input type="text" name="profession" class="profession-input" />\r\n' + '	</fieldset>\r\n' + '	<!--second comment-->\r\n' + '	<fieldset class="second-set">\r\n' + '		<input type="text" name="profile" class="profile-input" />\r\n' + '	</fieldset>\r\n' + '</form>';
		this._initContext(html);

		assertEquals('person-input', document.querySelector('#form-id fieldset [name="person"]').getAttribute('class'));
		assertEquals('person-input', document.querySelector('#form-id').querySelector('fieldset [name="person"]').getAttribute('class'));
		assertEquals('person-input', document.querySelector('#form-id').querySelector('fieldset').querySelector('[name="person"]').getAttribute('class'));
		assertEquals('first-set', document.querySelector('fieldset:first-child').getAttribute('class'));
		assertEquals('person-input', document.querySelector('input:first-child').getAttribute('class'));
		assertNull(document.querySelector('span:first-child'));

		this._clearContext();
	},

	testQuerySelectorAll : function() {
		var html = '' + '<h1 class="title">Get Elements by Wildcard Tag Name</h1>\r\n' + '<form id="form-id" class="form">\r\n' + '	<!--first comment-->\r\n' + '	<fieldset class="first-set">\r\n' + '		<input type="text" name="person" class="person-input" />\r\n' + '		<!--first comment-->\r\n' + '		<input type="text" name="address" class="address-input" />\r\n' + '		<!--second comment-->\r\n' + '		<input type="text" name="profession" class="profession-input" />\r\n' + '	</fieldset>\r\n' + '	<!--second comment-->\r\n' + '	<fieldset class="second-set">\r\n' + '		<input type="text" name="profile" class="profile-input" />\r\n' + '		<select>\r\n' + '			<option>value</option>\r\n' + '		</select>\r\n' + '	</fieldset>\r\n' + '</form>';
		this._initContext(html);

		assertEquals('person-input', document.querySelectorAll('#form-id fieldset [name="person"]').item(0).getAttribute('class'));
		assertEquals('person-input', document.querySelectorAll('input:first-child')[0].getAttribute('class'));
		assertEquals(0, document.querySelectorAll('span:first-child').length);
		assertEquals(4, document.querySelectorAll('input').length);
		assertEquals(4, document.querySelectorAll('form fieldset input').length);
		assertEquals(3, document.querySelectorAll('form fieldset:first-child input').length);
		assertEquals(2, document.querySelectorAll('form input[name="address"],form select').length);

		this._clearContext();
	},

	testQuerySelectorEscapeCssClass : function() {
		var html = '' + '<div id="query-selector-escape">\r\n' + '	<span class="#user.defined.class">user defined class</span>\r\n' + '	<span class="$property">property</span>\r\n' + '	<span class="%formatter">formatter</span>\r\n' + '	<span class="*animation">animation</span>\r\n' + '	<span class="^operation">operation</span>\r\n' + '</div>';
		this._initContext(html);

		var ctxs = [ document, document.getElementById('query-selector-escape') ];
		var queries = [ function(selector) {
			return ctx.querySelector(selector).innerHTML;
		}, function(selector) {
			return ctx.querySelectorAll(selector)[0].innerHTML;
		} ];
		for ( var i = 0, j, ctx, query; i < 2; ++i) {
			ctx = ctxs[i];
			for (j = 0; j < 2; ++j) {
				query = queries[j];

				assertEquals('user defined class', query('.\\#user\\.defined\\.class'));
				assertEquals('property', query('.\\$property'));
				assertEquals('formatter', query('.\\%formatter'));
				assertEquals('animation', query('.\\*animation'));
				assertEquals('operation', query('.\\^operation'));
			}
		}

		this._clearContext();
	},

	/**
	 * There are algorithms based on depth-first order on query selector. This test ensure that assumption is respected.
	 */
	testQuerySelectorAllDepthFirstOrder : function() {
		var html = '' + '<div class="0">\r\n' + '	<div class="1"></div>\r\n' + '	<div class="2">\r\n' + '		<div class="3">\r\n' + '			<div class="4"></div>\r\n' + '			<div class="5"></div>\r\n' + '		</div>\r\n' + '		<div class="6">\r\n' + '			<div class="7"></div>\r\n' + '			<div class="8"></div>\r\n' + '		</div>\r\n' + '	</div>\r\n' + '	<div class="9">\r\n' + '		<div class="10">\r\n' + '			<div class="11"></div>\r\n' + '			<div class="12"></div>\r\n' + '		</div>\r\n' + '		<div class="13">\r\n' + '			<div class="14"></div>\r\n' + '			<div class="15"></div>\r\n' + '		</div>\r\n' + '	</div>\r\n' + '	<div class="16"></div>\r\n' + '</div>';
		this._initContext(html);

		var nodeList = document.querySelectorAll('div[class]');
		for ( var i = 0; i < nodeList.length; ++i) {
			assertEquals(i, Number(nodeList.item(i).getAttribute('class')));
		}
		this._clearContext();
	},

	testQuerySelectorSupportedSelectors : function() {
		var html = '' + '<h1 class="title">Get Elements by Wildcard Tag Name</h1>\r\n' + '<form id="form-id" class="form">\r\n' + '	<!--first comment-->\r\n' + '	<fieldset class="first-set">\r\n' + '		<input type="text" name="person" class="person-input" />\r\n' + '		<!--first comment-->\r\n' + '		<input type="text" name="address" class="address-input" />\r\n' + '		<!--second comment-->\r\n' + '		<input type="text" name="profession" class="profession-input" />\r\n' + '	</fieldset>\r\n' + '	<!--second comment-->\r\n' + '	<fieldset class="second-set">\r\n' + '		<input type="text" name="profile" class="profile-input" />\r\n' + '	</fieldset>\r\n' + '</form>';
		this._initContext(html);

		try {
			var selectors = [ '#form-id fieldset [name="person"]', 'span:first-child', 'input[disabled]' ];
			if (!this._isTrident()) {
				// :last-child and :not are not supported by ie8
				selectors.push('span:last-child', 'input:not([disabled])');
			}
			for ( var i = 0; i < selectors.length; ++i) {
				document.querySelector(selectors[i]);
			}
		} catch (e) {
			TestCase.fail('All selectors should pass.');
		}
		this._clearContext();
	},

	/**
	 * Register event listener on a detached node. Get a node from document, remove it and register a click event. Then
	 * reinsert node into document tree. Event handler should be invoked when fire the event, i.e. listener still
	 * registered.
	 */
	testRegisteredEventsOnDetachedNode : function() {
		var html = '<h1>Registered Events After Node Remove</h1>';
		this._initContext(html);
		var node = document.getElementById('scratch-area-id').getElementsByTagName('h1')[0];
		node.parentNode.removeChild(node);

		var hitCounter = 0;
		function listener(ev) {
			++hitCounter;
		}
		;

		this._addEventListener(node, listener);
		document.getElementById('scratch-area-id').appendChild(node);
		this._dispatchEvent(node);
		assertEquals(1, hitCounter);

		this._clearContext();
	},

	/**
	 * Double event registration. Register twice the same event listener for the same event type on the same node. Only
	 * one event should be trigered. Note: IE trigger twice.
	 * 
	 * Excerpt from DOM Level 3 Event Specifications: Invoking addEventListener or addEventListenerNS multiple times on
	 * the same EventTarget with the same parameters (namespaceURI, type, listener, and useCapture) is considered to be
	 * a no-op and thus independently of the event group. They do not cause the EventListener to be called more than
	 * once and do not cause a change in the triggering order. In order to guarantee that an event listener will be
	 * added to the event target for the specified event group, one needs to invoke removeEventListener or
	 * removeEventListenerNS first.
	 */
	testDoubleEventRegsitration : function() {
		var html = '<h1>Double Event Registration</h1>';
		this._initContext(html);
		var node = document.getElementById('scratch-area-id').getElementsByTagName('h1')[0];

		var hitCounter = 0;
		function listener(ev) {
			++hitCounter;
		}
		;

		this._addEventListener(node, listener);
		this._addEventListener(node, listener);
		this._dispatchEvent(node);
		if (this._isTrident()) {
			// IE trigger twice
			assertEquals(2, hitCounter);
		}
		else {
			assertEquals(1, hitCounter);
		}
		this._clearContext();
	},

	/**
	 * Clone node with event listener. Excerpt from DOM Level 3 Event Specifications: Copying a Node, with methods such
	 * as Node.cloneNode or Range.cloneContents, does not copy the event listeners attached to it. Event listeners must
	 * be attached to the newly created Node afterwards if so desired.
	 * 
	 * Note that IE DOES clone registered events, no mater cloning is deep or shallow.
	 */
	testEventCloning : function() {
		var html = '<h1>Double Event Registration</h1>';
		this._initContext(html);
		var node = document.getElementById('scratch-area-id').getElementsByTagName('h1')[0];

		var hitCounter = 0;
		function listener(ev) {
			++hitCounter;
		}
		;

		this._addEventListener(node, listener);
		var clone = node.cloneNode(true);
		document.getElementById('scratch-area-id').appendChild(clone);
		this._dispatchEvent(clone);
		if (this._isTrident()) {
			// IE DOES clone registered events
			assertEquals(1, hitCounter);
		}
		else {
			assertEquals(0, hitCounter);
		}
		this._clearContext();
	},

	testFileApi : function() {
		if (this._isTrident()) {
			assertFalse(typeof File !== 'undefined');
			assertFalse(typeof FileList !== 'undefined');
			assertFalse(typeof FileReader !== 'undefined');
		}
		else {
			assertTrue(typeof File !== 'undefined');
			assertTrue(typeof FileList !== 'undefined');
			assertTrue(typeof FileReader !== 'undefined');
		}
	},

	testFormApi : function() {
		if (this._isTrident()) {
			assertFalse(typeof FormData !== 'undefined');
		}
		else {
			assertTrue(typeof FormData !== 'undefined');
		}
	},

	_addEventListener : function(node, listener) {
		if (this._isTrident()) {
			node.attachEvent('onclick', listener);
		}
		else {
			node.addEventListener('click', listener, false);
		}
	},

	_dispatchEvent : function(node) {
		var ev;
		if (this._isTrident()) {
			ev = document.createEventObject();
			node.fireEvent('onclick', ev);
		}
		else {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			node.dispatchEvent(ev);
		}
	},

	_initContext : function(html) {
		document.getElementById('scratch-area-id').innerHTML = html;
	},

	_clearContext : function() {
		var n = document.getElementById('scratch-area-id');
		while (n.firstChild) {
			n.removeChild(n.firstChild);
		}
	},

	_isTrident : function() {
		return navigator.userAgent.indexOf('MSIE') !== -1;
	},

	_isWebKit : function() {
		return navigator.userAgent.indexOf('WebKit') !== -1;
	},

	_isPresto : function() {
		return navigator.userAgent.indexOf('Presto') !== -1;
	},

	_isGecko : function() {
		return navigator.userAgent.indexOf('Firefox') !== -1;
	}
};
TestCase.register('BrowserSupportTestCase');
