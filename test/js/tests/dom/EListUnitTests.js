$package("js.tests.dom");

$include("js.dom.Form");
$include("js.dom.Control");
$include("js.dom.Select");

js.tests.dom.EListUnitTests = {
	_doc : null,
	_nodeList : null,
	_elist : null,

	before : function(html) {
		var html = "" + //
		"<h1>header 1</h1>" + //
		"<h2>header 2</h2>" + //
		"<h3>header 3</h3>";
		document.getElementById("scratch-area").innerHTML = html;

		this._doc = new js.dom.Document(document);
		this._nodeList = document.getElementById("scratch-area").childNodes;
		this._elist = new js.dom.EList(this._doc, this._nodeList);
	},

	after : function() {
		var n = document.getElementById("scratch-area");
		while (n.firstChild) {
			n.removeChild(n.firstChild);
		}
		this._doc = null;
	},

	testConstructor : function() {
		assertClass("js.dom.EList");

		assertEquals(this._doc, this._elist._ownerDoc);
		assertEquals(this._nodeList, this._elist._nodeList);

		assertAssertion(js.dom, "EList", this._doc);
		assertAssertion(js.dom, "EList", null, this._nodeList);
		assertAssertion(js.dom, "EList", {}, this._nodeList);
		assertAssertion(js.dom, "EList", this._doc, {});
	},

	testSize : function() {
		assertEquals(3, this._elist.size());
	},

	testItem : function() {
		assertEquals("H1", this._elist.item(0)._node.tagName);
		assertEquals("H2", this._elist.item(1)._node.tagName);
		assertEquals("H3", this._elist.item(2)._node.tagName);

		var elist = new js.dom.EList(this._doc, null);
		assertAssertion(elist, "item", 0);
		$assert.disable();
		assertNull(elist.item(0));
	},

	testIsEmpty : function() {
		assertFalse(this._elist.isEmpty());
		this._elist = new js.dom.EList(this._doc, null);
		assertTrue(this._elist.isEmpty());
	},

	testRemove : function() {
		this._elist.remove();
		assertEquals(0, document.getElementById("scratch-area").children.length);
	},

	testCall : function() {
		this._elist.call("setText", "text");
		for ( var i = 0; i < this._nodeList.length; ++i) {
			assertEquals("text", this._nodeList.item(i).firstChild.nodeValue);
		}

		assertAssertion(this._elist, "call");
		assertAssertion(this._elist, "call", null);
		assertAssertion(this._elist, "call", "");
		assertAssertion(this._elist, "call", "fake");
	},

	testAddCssClass : function(context) {
		context.push("js.dom.Element.prototype.addCssClass");
		var index = 0, nodeList = this._nodeList;
		js.dom.Element.prototype.addCssClass = function(cssClass) {
			assertEquals(nodeList.item(index++), this._node);
			assertEquals("test", cssClass);
		};
		assertEquals(this._elist, this._elist.addCssClass("test"));
		assertEquals(3, index);
	},

	testRemoveCssClass : function(context) {
		context.push("js.dom.Element.prototype.removeCssClass");
		var index = 0, nodeList = this._nodeList;
		js.dom.Element.prototype.removeCssClass = function(cssClass) {
			assertEquals(nodeList.item(index++), this._node);
			assertEquals("test", cssClass);
		};
		assertEquals(this._elist, this._elist.removeCssClass("test"));
		assertEquals(3, index);
	},

	testToggleCssClass : function(context) {
		context.push("js.dom.Element.prototype.toggleCssClass");
		var index = 0, nodeList = this._nodeList;
		js.dom.Element.prototype.toggleCssClass = function(cssClass) {
			assertEquals(nodeList.item(index++), this._node);
			assertEquals("test", cssClass);
		};
		assertEquals(this._elist, this._elist.toggleCssClass("test"));
		assertEquals(3, index);
	},

	testIt : function() {
		var it = this._elist.it();
		assertNotNull(it);
		assertDefined(it.hasNext);
		assertDefined(it.next);
	},

	testCommaSeparatedSelectors : function() {
		var html = "" + //
		"<form action='add-form' data-class='js.dom.Form'>" + //
		"	<input type='text' />" + //
		"	<input type='password' />" + //
		"	<textarea></textarea>" + //
		"	<select>" + //
		"		<option>value</option>" + //
		"	</select>" + //
		"</form>";
		document.getElementById("scratch-area").innerHTML = html;
		var doc = new js.dom.Document(document);
		var form = doc.getByCss("#scratch-area form");
		var elist = form.findByCss("input,textarea,select");
		assertEquals(4, elist.size());
		assertEquals("input", elist.item(0).getTag());
		assertEquals("input", elist.item(1).getTag());
		assertEquals("textarea", elist.item(2).getTag());
		assertEquals("select", elist.item(3).getTag());
	},

	testOn : function(context) {
		context.push("js.dom.Element.prototype.on");

		var type = "click";
		var listener = function() {
		};
		var scope = {};
		var arg = "arg";

		var index = 0, nodeList = this._nodeList;
		js.dom.Element.prototype.on = function(_type, _listener, _scope, _arg) {
			assertEquals(nodeList.item(index++), this._node);
			assertEquals(type, _type);
			assertEquals(listener, _listener);
			assertEquals(scope, _scope);
			assertEquals(arg, _arg);
		};
		assertEquals(this._elist, this._elist.on(type, listener, scope, arg));
		assertEquals(3, index);
	},

	testUn : function(context) {
		context.push("js.dom.Element.prototype.un");

		var type = "click";
		var listener = function() {
		};

		var index = 0, nodeList = this._nodeList;
		js.dom.Element.prototype.un = function(_type, _listener) {
			assertEquals(nodeList.item(index++), this._node);
			assertEquals(type, _type);
			assertEquals(listener, _listener);
		};
		assertEquals(this._elist, this._elist.un(type, listener));
		assertEquals(3, index);
	},

	testIterationOnRemovedNode : function() {
		var it = this._elist.it(), el, probe = "";
		while (it.hasNext()) {
			el = it.next();
			if (el.getTag() === "h1") {
				this._doc.getByCss("#scratch-area h2").remove();
			}
			assertNotNull(el.getParent());
			probe += el.getTag();
		}
		assertEquals("h1h3", probe);
	},

	testIterationOnRemovedChild : function() {
		var scratchArea = this._doc.getById("scratch-area");
		var it = scratchArea.getChildren().it(), el, probe = "";
		while (it.hasNext()) {
			el = it.next();
			if (el.getTag() === "h1") {
				this._doc.getByCss("#scratch-area h2").remove(false);
			}
			assertNotNull(el.getParent());
			probe += el.getTag();
		}
		assertEquals("h1h3", probe);
	}
};
TestCase.register("js.tests.dom.EListUnitTests");
