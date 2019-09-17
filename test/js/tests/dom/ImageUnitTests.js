$package('js.tests.dom');

$include('js.dom.Image');

js.tests.dom.Image = {
	before : function(html) {
		document.getElementById('scratch-area').innerHTML = '<img src="http://img.js-lib.com/logo.png" id="image" />';
		this.doc = new js.dom.Document(document);
		this.node = document.getElementById('image');
		this.el = this.doc.getById('image');
	},

	after : function() {
		var n = document.getElementById('scratch-area');
		while (n.firstChild) {
			n.removeChild(n.firstChild);
		}
	},

	testConstructor : function() {
		assertClass('js.dom.Image');

		document.getElementById('scratch-area').innerHTML = '<input id="input" />';
		var node = document.getElementById('input');
		assertAssertion(js.dom, 'Image', this.doc, node);
	},

	testReset : function() {
		this.el.reset();
		assertTrue(js.util.Strings.startsWith(this.node.src, 'data:image'));
	},

	testGetSrc : function() {
		assertEquals('http://img.js-lib.com/logo.png', this.node.getAttribute('src'));
	},

	testSetSrc : function(context) {
		context.push('js.dom.Image.prototype.reset');
		var resetProbe = 0, node = this.node;
		js.dom.Image.prototype.reset = function() {
			++resetProbe;
			node.src = 'data:image';
		};

		var src = 'http://img.js-lib.com/blank.png';
		assertEquals(this.el, this.el.setSrc(src));
		assertEquals(src, this.node.getAttribute('src'));

		var invalidSources = [ undefined, null, '', ' ', '\r', '\n', '\t', '\f', '&nbsp;', '\t&nbsp;\r&nbsp;\n&nbsp;\f' ];
		for ( var i = 0; i < invalidSources.length; ++i) {
			this.node.src = src;
			this.el.setSrc(invalidSources[i]);
			assertEquals('data:image', this.node.src);
		}
		assertEquals(invalidSources.length, resetProbe);
	}
};
TestCase.register('js.tests.dom.Image');
