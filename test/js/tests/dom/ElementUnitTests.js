$package("js.tests.dom");

$include("js.format.FullDateTime");

js.tests.dom.ElementUnitTests = {
    _doc : null,

    _setUp : function (html) {
        document.getElementById("scratch-area").innerHTML = html;
        // on build tests suite document is tested before element so is safe to use it in this unit tests
        this._doc = new js.dom.Document(document);
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        this._doc = null;
    },

    testConstructor : function () {
        assertClass("js.dom.Element");

        var html = "<div id='constructor'></div>";
        this._setUp(html);

        var node = document.getElementById("constructor");
        var el = new js.dom.Element(this._doc, node);
        assertNotNull(el);
        assertEquals(this._doc, el._ownerDoc);
        assertEquals(node, el._node);
        assertEquals(el, node[js.dom.Node._BACK_REF]);
        assertTrue(el.style instanceof js.dom.Style);
        assertTrue(el._domEvents instanceof js.event.DomEvents);
        assertTrue(typeof el._customEvents === "undefined");

        var textNode = document.createTextNode("text");
        assertAssertion(js.dom, "Element");
        assertAssertion(js.dom, "Element", null);
        assertAssertion(js.dom, "Element", this._doc);
        assertAssertion(js.dom, "Element", this._doc, null);
        assertAssertion(js.dom, "Element", {}, node);
        assertAssertion(js.dom, "Element", this._doc, textNode);
    },

    testGetNode : function () {
        this._setUp("<p id='get-node'></p>");
        var node = document.getElementById("get-node");
        var el = this._doc.getById("get-node");
        assertEquals(node, el.getNode());
    },

    testGetOwnerDoc : function () {
        this._setUp("<p id='get-node'></p>");
        var el = this._doc.getById("get-node");
        assertEquals(this._doc, el.getOwnerDoc());
    },

    testAddChild : function () {
        var html = "" + //
        "<div id='add-child'>" + //
        "	<div id='add-child-source'>" + //
        "		<h1 id='add-child-h1'>header 1</h1>" + //
        "		<h2 id='add-child-h2'>header 2</h2>" + //
        "		<h3 id='add-child-h3'>header 3</h3>" + //
        "	</div>" + //
        "	<div id='add-child-target'></div>" + //
        "</div>";
        this._setUp(html);

        var h1 = this._doc.getById("add-child-h1");
        var h2 = this._doc.getById("add-child-h2");
        var h3 = this._doc.getById("add-child-h3");
        var h4 = this._doc.createElement("h4");
        var source = this._doc.getById("add-child-source");
        var target = this._doc.getById("add-child-target");

        $assert.disable();
        // disable assertion for node to add not already in document tree
        assertEquals(0, this._elementsCount(target._node));
        target.addChild(h1);
        assertEquals(1, this._elementsCount(target._node));
        target.addChild(h2, h3);
        assertEquals(0, this._elementsCount(source._node));
        assertEquals(3, this._elementsCount(target._node));
        $assert.enable();
        target.addChild(h4);
        assertEquals(4, this._elementsCount(target._node));

        assertAssertion(target, "addChild");
        assertAssertion(target, "addChild", null);
        assertAssertion(target, "addChild", "");
        assertAssertion(target, "addChild", new js.tests.dom.FakeElement());
        assertEquals(4, this._elementsCount(target._node));

        $assert.disable();
        target.addChild();
        target.addChild(null);
        target.addChild("");
        target.addChild(new js.tests.dom.FakeElement());
        assertEquals(4, this._elementsCount(target._node));
    },

    testAddChildFromDifferentDocument : function () {
        var foreignHtml = "" + //
        "<body>" + //
        "	<h1 id='name'>header 1</h1>" + //
        "</body>";
        var foreignDoc = js.dom.Builder.parseHTML(foreignHtml);
        var foreignEl = foreignDoc.getByTag("h1");

        var html = "<div id='add-child'></div>";
        this._setUp(html);

        var el = this._doc.getById("add-child");
        assertNull(el._node.firstChild);
        el.addChild(foreignEl);
        assertEquals("h1", el._node.firstChild.tagName.toLowerCase());
        assertEquals("header 1", el._node.firstChild.firstChild.nodeValue);
    },

    testReplaceChildWithDetachedElement : function () {
        var html = "" + //
        "<div id='replace-child'>" + //
        "	<h1 class='existing'>header 1</h1>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("replace-child");
        var h1 = this._doc.getByCss("#replace-child h1");
        var h2 = this._doc.createElement("h2").addCssClass("replacement").addText("header 2");

        assertNull(this._doc.getByTag("h2"));
        div.replaceChild(h2, h1);
        assertNotNull(this._doc.getByTag("h2"));
        assertEquals("header 2", this._doc.getByTag("h2").getText());
        assertEquals("replacement", this._doc.getByTag("h2").getAttr("class"));
    },

    testReplaceChildWithAtachedElement : function () {
        var html = "" + //
        "<div id='replace-child'>" + //
        "	<h1 class='existing'>header 1</h1>" + //
        "</div>" + //
        "<h2 class='replacement'>header 2</h2>";
        this._setUp(html);

        var div = this._doc.getById("replace-child");
        var h1 = this._doc.getByCss("#replace-child h1");
        var h2 = this._doc.getByCss("#scratch-area h2");

        assertNotNull(this._doc.getByCss("#replace-child > h1"));
        assertNotNull(this._doc.getByCss("#scratch-area > h2"));
        div.replaceChild(h2, h1);
        assertNull(this._doc.getByCss("#replace-child > h1"));
        assertNull(this._doc.getByCss("#scratch-area > h2"));
        assertNotNull(this._doc.getByCss("#replace-child > h2"));
        assertEquals(h2, this._doc.getByCss("#replace-child > h2"));
        assertEquals("header 2", this._doc.getByCss("#replace-child > h2")._node.firstChild.nodeValue);
        assertEquals("replacement", this._doc.getByCss("#replace-child > h2")._node.getAttribute("class"));
    },

    testInsertBefore : function () {
        var html = "" + //
        "<div id='insert-before'>" + //
        "	<h1 id='insert-before-h1'>header 1</h1>" + //
        "</div>" + //
        "<h2 id='insert-before-h2'>header 2</h2>";
        this._setUp(html);

        var div = this._doc.getById("insert-before");
        var h1 = this._doc.getById("insert-before-h1");
        var h2 = this._doc.getById("insert-before-h2");

        assertNotNull(this._doc.getByCss("#scratch-area > h2"));
        h1.insertBefore(h2);
        assertEquals(h2._node, this._firstElement(div._node));
        assertEquals(h1._node, this._nextElement(this._firstElement(div._node)));
        assertNull(this._doc.getByCss("#scratch-area > h2"));

        var h3 = this._doc.createElement("h3");
        assertNull(this._doc.getByCss("#insert-before > h3"));
        h2.insertBefore(h3);
        assertNotNull(this._doc.getByCss("#insert-before > h3"));
        assertEquals("H3", this._firstElement(div._node).tagName);
    },

    testClone : function () {
        var html = "" + //
        "<div id='clone'>" + //
        "	<h1 id='header-id'>header 1</h1>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("clone");

        var clone = div.clone();
        assertNotNull(clone);
        assertInstanceof(clone, js.dom.Element);
        assertEquals(clone, js.dom.Node.getElement(clone._node));
        assertEquals(this._doc, clone._ownerDoc);
        assertEquals("clone", clone.getAttr("id"));
        assertNull(clone.getFirstChild());
        assertNull(clone._node.parentNode);
        assertNull(clone.getParent());
        assertEquals(0, this._elementsCount(clone._node));

        clone = div.clone(true);
        assertNotNull(clone);
        assertInstanceof(clone, js.dom.Element);
        assertEquals(clone, js.dom.Node.getElement(clone._node));
        assertEquals(this._doc, clone._ownerDoc);
        assertEquals(1, this._elementsCount(clone._node));
        assertEquals("clone", clone.getAttr("id"));
        assertEquals("header-id", clone.getFirstChild().getAttr("id"));
        assertEquals("header 1", clone.getFirstChild().getText());
        assertTrue(clone._node.parentNode === null || clone._node.parentNode.nodeType !== Node.ELEMENT_NODE);
        assertNull(clone.getParent());
    },

    testReplace : function () {
        var html = "" + //
        "<div id='replace'>" + //
        "	<h1 class='existing'>header 1</h1>" + //
        "</div>" + //
        "<h2 class='replacement'>header 2</h2>";
        this._setUp(html);

        var div = this._doc.getById("replace");
        var h1 = this._doc.getByCss("#replace h1");
        var h2 = this._doc.getByCss("#scratch-area h2");
        var h3 = this._doc.createElement("h3");

        assertNotNull(this._doc.getByCss("#replace > h1"));
        assertNotNull(this._doc.getByCss("#scratch-area > h2"));
        h1.replace(h2);
        assertNull(this._doc.getByCss("#replace > h1"));
        assertNull(this._doc.getByCss("#scratch-area > h2"));
        assertNotNull(this._doc.getByCss("#replace > h2"));
        assertEquals(h2, this._doc.getByCss("#replace > h2"));
        assertEquals("header 2", this._doc.getByCss("#replace > h2")._node.firstChild.nodeValue);
        assertEquals("replacement", this._doc.getByCss("#replace > h2")._node.getAttribute("class"));
    },

    testRemove : function () {
        var html = "" + //
        "<div id='remove'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("remove");
        var h1 = this._doc.getByCss("#remove h1");
        var h2 = this._doc.getByCss("#remove h2");

        h1.remove();
        assertNull(this._doc.getByCss("#remove h1"));
        assertEquals(1, this._elementsCount(div._node));
        assertTrue(typeof h1._ownerDoc === "undefined");
        assertTrue(typeof h1._node === "undefined");
        assertTrue(typeof h1.style === "undefined");
        assertNull(h1._format);
        assertTrue(typeof h1._domEvents === "undefined");
        assertTrue(typeof h1._customEvents === "undefined");
        assertTrue(typeof h1._userData === "undefined");

        h2.remove(false);
        assertNull(this._doc.getByCss("#remove h2"));
        assertEquals(0, this._elementsCount(div._node));
        assertTrue(typeof h2._ownerDoc !== "undefined");
        assertTrue(typeof h2._node !== "undefined");
        assertTrue(typeof h2.style !== "undefined");
        assertNull(h2._format);
        assertTrue(typeof h2._domEvents !== "undefined");
    },

    testRemoveChildren : function () {
        var html = "" + //
        "<div id='remove-children'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("remove-children");
        var hs = [];
        hs[0] = this._doc.getByCss("#remove-children h1");
        hs[1] = this._doc.getByCss("#remove-children h2");

        div.removeChildren();
        assertEquals(0, this._elementsCount(div._node));
        for ( var i = 0; i < hs.length; ++i) {
            assertTrue(typeof hs[i]._ownerDoc === "undefined");
            assertTrue(typeof hs[i]._node === "undefined");
            assertTrue(typeof hs[i].style === "undefined");
            assertNull(hs[i]._format);
            assertTrue(typeof hs[i]._domEvents === "undefined");
            assertTrue(typeof hs[i]._customEvents === "undefined");
            assertTrue(typeof hs[i]._userData === "undefined");
        }
    },

    testRemoveTextChildren : function () {
        var html = "<div id='remove-text-children'></div>";
        this._setUp(html);
        var node = document.getElementById("remove-text-children");
        node.appendChild(document.createTextNode("first"));
        node.appendChild(document.createTextNode("second"));

        var div = this._doc.getById("remove-text-children");
        assertSize(2, node.childNodes);
        div.removeChildren();
        assertSize(0, node.childNodes);
    },

    testGetByXpath : function () {
        var xml = "" + //
        "<person>" + //
        "   <name>Iulian</name>" + //
        "   <address>" + //
        "       <city>Jassy</city>" + //
        "   </address>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        var person = doc.getRoot();
        assertNotNull(person);

        assertEquals("Iulian", person.getByXPath("name").getText());
        assertEquals("Iulian", person.getByXPath("/person/name").getText());

        var address = person.getByXPath("address");
        assertNotNull(address);
        assertEquals("Jassy", address.getByXPath("city").getText());
        assertEquals("Jassy", address.getByXPath("child::city").getText());
        assertEquals("Jassy", address.getByXPath("/person/address/city").getText());
    },

    testGetByXpathBadArguments : function () {
        var doc = js.dom.Builder.parseXML("<person></person>");
        var el = doc.getRoot();
        assertNotNull(el);

        assertAssertion(el, "getByXPath");
        assertAssertion(el, "getByXPath", null);
        assertAssertion(el, "getByXPath", "");

        $assert.disable();
        assertNull(el.getByXPath());
        assertNull(el.getByXPath(null));
        assertNull(el.getByXPath(""));
    },

    testFindByXpath : function () {
        var xml = "" + //
        "<person>" + //
        "   <name>Iulian</name>" + //
        "   <name>Rotaru</name>" + //
        "   <address>" + //
        "       <city>" + //
        "           <name>Jassy</name>" + //
        "       </city>" + //
        "   </address>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        var person = doc.getRoot();
        assertNotNull(person);

        var names = person.findByXPath("descendant::name");
        assertEquals(3, names.size());
        assertEquals("Iulian", names.item(0).getText());
        assertEquals("Rotaru", names.item(1).getText());
        assertEquals("Jassy", names.item(2).getText());
    },

    testGetByCss : function () {
        var html = "" + //
        "<div id='get-by-css'>" + //
        "	<h1 class='name'>header 1</h1>" + //
        "	<h2 class='surname'>header 2</h2>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("get-by-css");

        assertEquals("header 1", div.getByCss("h1").getText());
        assertEquals("header 1", div.getByCss("[class='%s']", "name").getText());
        assertEquals("header 2", div.getByCss("h2[class='surname']").getText());

        assertAssertion(div, "getByCss");
        assertAssertion(div, "getByCss", null);
        assertAssertion(div, "getByCss", "");

        $assert.disable();
        assertNull(div.getByCss());
        assertNull(div.getByCss(null));
        assertNull(div.getByCss(""));
    },

    testFindByCss : function () {
        var html = "" + //
        "<div id='find-by-css'>" + //
        "	<h1 class='name'>header 1</h1>" + //
        "	<h2 class='surname'>header 2</h2>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("find-by-css");

        assertEquals(1, div.findByCss("h1").size());
        assertEquals("header 1", div.findByCss("h1").item(0).getText());
        assertEquals(2, div.findByCss("[class]").size());
        assertEquals(1, div.findByCss("[class='%s']", "name").size());
        assertEquals("header 2", div.findByCss("[class='%s']", "surname").item(0).getText());
        assertEquals(2, div.findByCss("h1,h2").size());

        assertAssertion(div, "findByCss");
        assertAssertion(div, "findByCss", null);
        assertAssertion(div, "findByCss", "");

        $assert.disable();
        assertSize(0, div.findByCss());
        assertSize(0, div.findByCss(null));
        assertSize(0, div.findByCss(""));
    },

    testGetByTag : function () {
        var html = "" + //
        "<div id='get-by-tag'>" + //
        "	<h1>header 1</h1>" + //
        "	<div>" + //
        "		<h2>header 2</h2>" + //
        "	</div>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("get-by-tag");

        var h1 = div.getByTag("h1");
        assertNotNull(h1);
        var h2 = div.getByTag("h2");
        assertNotNull(h2);
        assertNull(div.getByTag("fake"));

        assertAssertion(div, "getByTag");
        assertAssertion(div, "getByTag", null);
        assertAssertion(div, "getByTag", "");

        $assert.disable();
        assertNull(div.getByTag());
        assertNull(div.getByTag(null));
        assertNull(div.getByTag(""));
    },

    testFindByTag : function () {
        var html = "" + //
        "<div id='find-by-tag'>" + //
        "	<h1>header</h1>" + //
        "	<div>" + //
        "		<h1>sub-header</h1>" + //
        "	</div>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("find-by-tag");

        var elist = div.findByTag("h1");
        assertInstanceof(elist, js.dom.EList);
        assertSize(2, elist);
        assertEquals("header", elist.item(0)._node.firstChild.nodeValue);
        assertEquals("sub-header", elist.item(1)._node.firstChild.nodeValue);
        assertEmpty(div.findByTag("fake"));

        assertAssertion(div, "findByTag");
        assertAssertion(div, "findByTag", null);
        assertAssertion(div, "findByTag", "");

        $assert.disable();
        assertEmpty(div.findByTag());
        assertEmpty(div.findByTag(null));
        assertEmpty(div.findByTag(""));
    },

    testGetByCssClass : function () {
        var html = "" + //
        "<div id='get-by-css-class'>" + //
        "	<h1 class='name'>header</h1>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("get-by-css-class");

        assertEquals("header", div.getByCssClass("name")._node.firstChild.nodeValue);

        assertAssertion(div, "getByCssClass");
        assertAssertion(div, "getByCssClass", null);
        assertAssertion(div, "getByCssClass", "");

        $assert.disable();
        assertNull(div.getByCssClass());
        assertNull(div.getByCssClass(null));
        assertNull(div.getByCssClass(""));
    },

    testFindByCssClass : function () {
        var html = "" + //
        "<div id='find-by-css-class'>" + //
        "	<h1 class='header'>header 1</h1>" + //
        "	<h2 class='header'>header 2</h2>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getById("find-by-css-class");

        assertEquals("header 1", div.findByCssClass("header").item(0)._node.firstChild.nodeValue);
        assertEquals("header 2", div.findByCssClass("header").item(1)._node.firstChild.nodeValue);

        assertAssertion(div, "findByCssClass");
        assertAssertion(div, "findByCssClass", null);
        assertAssertion(div, "findByCssClass", "");

        $assert.disable();
        assertSize(0, div.findByCssClass());
        assertSize(0, div.findByCssClass(null));
        assertSize(0, div.findByCssClass(""));
    },

    testGetParent : function () {
        var html = "" + //
        "<div id='get-parent'>" + //
        "   <h1>header</h1>" + //
        "</div>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#get-parent > h1");
        var div = h1.getParent();
        assertNotNull(div);
        assertEquals(h1._node, this._firstElement(div._node));
    },

    testGetParentByTag : function () {
        var html = "" + //
        "<div id='div'>" + //
        "   <div id='section'>" + //
        "       <h1 id='h1'><span><span></h1>" + //
        "   </div>" + //
        "</div>";
        this._setUp(html);

        var span = this._doc.getByCss("#h1 > span");
        assertEquals("section", span.getParentByTag("div").getAttr("id"));
        assertEquals("section", span.getParentByTag("div").getAttr("id"));
        assertEquals("h1", span.getParentByTag("h1").getAttr("id"));
    },

    testGetParentByCssClass : function () {
        var html = "" + //
        "<div class='div'>" + //
        "   <div class='section'>" + //
        "       <h1 class='h1'><span><span></h1>" + //
        "   </div>" + //
        "</div>";
        this._setUp(html);

        var span = this._doc.getByCss(".h1 > span");
        assertEquals("div", span.getParentByCssClass("div").getTag());
        assertEquals("div", span.getParentByCssClass("section").getTag());
        assertEquals("h1", span.getParentByCssClass("h1").getTag());
    },

    testGetChildren : function () {
        var html = "" + //
        "<div id='get-children'>\r\n" + //
        "	<h1>header 1</h1>\r\n" + //
        "	<h2>header <b>numero</b> 2</h2>\r\n" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("get-children");
        var nodeList = div.getChildren()._nodeList;
        assertEquals(2, nodeList.length);

        var h1 = this._doc.getByCss("#get-children h1");
        nodeList = h1.getChildren()._nodeList;
        assertEquals(0, nodeList.length);

        var h2 = this._doc.getByCss("#get-children h2");
        nodeList = h2.getChildren()._nodeList;
        assertEquals(1, nodeList.length);
    },

    testHasChildren : function () {
        var html = "" + //
        "<div id='get-children'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header <b>numero</b> 2</h2>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("get-children");
        assertTrue(div.hasChildren());
        var h1 = this._doc.getByCss("#get-children h1");
        assertFalse(h1.hasChildren());
        var h2 = this._doc.getByCss("#get-children h2");
        assertTrue(h2.hasChildren());
    },

    testGetFirstChild : function () {
        var html = "" + //
        "<div id='get-first-child'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("get-first-child");
        assertEquals("H1", div.getFirstChild()._node.tagName);
        var h1 = this._doc.getByCss("#get-first-child h1");
        assertNull(h1.getFirstChild());
    },

    testGetLastChild : function () {
        var html = "" + //
        "<div id='get-last-child'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "</div>";
        this._setUp(html);

        var div = this._doc.getById("get-last-child");
        assertEquals("H2", div.getLastChild()._node.tagName);
        var h1 = this._doc.getByCss("#get-last-child h1");
        assertNull(h1.getLastChild());
    },

    testGetNextSibling : function () {
        var html = "" + //
        "<div id='get-next-sibling'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header <b>numero</b> 2</h2>" + //
        "</div>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#get-next-sibling h1");
        assertEquals("H2", h1.getNextSibling()._node.tagName);
        var b = this._doc.getByCss("#get-next-sibling b");
        assertNull(b.getNextSibling());
    },

    testGetPreviousSibling : function () {
        var html = "" + //
        "<div id='get-previous-sibling'>" + //
        "	<h1>header <b>numbero</b> 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "</div>";
        this._setUp(html);

        var h2 = this._doc.getByCss("#get-previous-sibling h2");
        assertEquals("H1", h2.getPreviousSibling()._node.tagName);
        var b = this._doc.getByCss("#get-previous-sibling b");
        assertNull(b.getPreviousSibling());
    },

    testGetTag : function () {
        var html = "" + //
        "<div id='get-tag'>" + //
        "	<h1>header 1</h1>" + //
        "	<H2>header 2</H2>" + //
        "</div>";
        this._setUp(html);
        assertEquals("h1", this._doc.getByCss("#get-tag h1").getTag());
        assertEquals("h2", this._doc.getByCss("#get-tag h2").getTag());
    },

    testSetAttr : function () {
        var html = "" + //
        "<div id='set-attr'>" + //
        "	<h1>header 1</h1>" + //
        "	<h2>header 2</h2>" + //
        "	<h3>header 3</h3>" + //
        "</div>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#set-attr h1");
        var h2 = this._doc.getByCss("#set-attr h2");
        var h3 = this._doc.getByCss("#set-attr h3");

        h1.setAttr("title", "h1 description");
        assertEquals("h1 description", h1._node.getAttribute("title"));

        h2.setAttr("id", "h2-id", "class", "header2", "title", "h2 description");
        assertEquals("h2-id", h2._node.getAttribute("id"));
        assertEquals("header2", h2._node.getAttribute("class"));
        assertEquals("h2 description", h2._node.getAttribute("title"));

        assertAssertion(h2, "setAttr");
        assertAssertion(h2, "setAttr", "id", "h2-id", "class", "header2", "title");

        $assert.disable();
        h3.setAttr("id", "h3-id", "class", "header3", "title");
        assertEquals("h3-id", h3._node.getAttribute("id"));
        assertEquals("header3", h3._node.getAttribute("class"));
        assertFalse(h3._node.getAttribute("title"));
    },

    testGetAttr : function () {
        var html = "<h1 id='h1-id' class=''>header 1</h1>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#scratch-area h1");
        assertEquals("h1-id", h1.getAttr("id"));
        assertEquals("", h1.getAttr("class"));
        assertNull(h1.getAttr("fake"));

        assertAssertion(h1, "getAttr");
        assertAssertion(h1, "getAttr", null);
        assertAssertion(h1, "getAttr", "");

        $assert.disable();
        assertNull(h1.getAttr());
        assertNull(h1.getAttr(null));
        assertNull(h1.getAttr(""));
    },

    testRemoveAttr : function () {
        var html = "<h1 title='h1 - id' class=''>header 1</h1>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#scratch-area h1");
        h1.removeAttr("title");
        h1.removeAttr("class");
        h1.removeAttr("fake-attribute");
        assertNull(h1._node.attributes.getNamedItem("title"));
        assertNull(h1._node.attributes.getNamedItem("class"));

        assertAssertion(h1, "removeAttr");
        assertAssertion(h1, "removeAttr", null);
        assertAssertion(h1, "removeAttr", "");

        $assert.disable();
        try {
            h1.removeAttr();
            h1.removeAttr(null);
            h1.removeAttr("");
            h1.removeAttr("fake");
        } catch (e) {
            TestCase.fail("Remove attribute with invalid or fake name should not rise exception.");
        }
    },

    testHasAttr : function () {
        var html = "<h1 id='h1-id' class=''>header 1</h1>";
        this._setUp(html);

        var h1 = this._doc.getByCss("#scratch-area h1");
        assertTrue(h1.hasAttr("id"));
        assertTrue(h1.hasAttr("class"));
        assertFalse(h1.hasAttr("fake"));
    },

    testAddText : function () {
        this._setUp("<p id='add-text'>one <b>two</b></p>");
        var node = document.getElementById("add-text");
        var el = this._doc.getById("add-text");

        assertEquals(el, el.addText(" three"));
        assertEquals("one <b>two</b> three", node.innerHTML.toLowerCase());

        var object = {
            toString : function () {
                return " four";
            }
        };
        el.addText(object);
        assertEquals("one <b>two</b> three four", node.innerHTML.toLowerCase());

        assertAssertion(el, "addText");
        assertAssertion(el, "addText", null);
        assertAssertion(el, "addText", "");

        $assert.disable();
        el.addText();
        el.addText(null);
        el.addText("");
        assertEquals("one <b>two</b> three four", node.innerHTML.toLowerCase());
    },

    testSetText : function () {
        this._setUp("<p id='set-text'>one <b>two</b></p>");
        var node = document.getElementById("set-text");
        var el = this._doc.getById("set-text");

        assertEquals(el, el.setText("three"));
        assertEquals("three<b>two</b>", node.innerHTML.toLowerCase());

        var object = {
            toString : function () {
                return "four";
            }
        };
        el.setText(object);
        assertEquals("four<b>two</b>", node.innerHTML.toLowerCase());

        node.innerHTML = "one <b>two</b> three";
        el.setText("four");
        assertEquals("four<b>two</b>", node.innerHTML.toLowerCase());

        node.innerHTML = "";
        el.setText("four");
        assertEquals("four", node.innerHTML.toLowerCase());

        node.innerHTML = "";
        el.setText(0);
        assertEquals("0", node.innerHTML.toLowerCase());

        // undefined text should assert, if assertion enabled or remove text otherwise
        assertAssertion(el, "setText");

        $assert.disable();
        var invalidText = [ undefined, null, "" ];
        for ( var i = 0; i < invalidText.length; ++i) {
            node.innerHTML = "one <b>two</b>";
            el.setText(invalidText[i]);
            assertEquals("<b>two</b>", node.innerHTML.toLowerCase());
        }
    },

    testGetText : function () {
        this._setUp("<p id='get-text'></p>");
        var node = document.getElementById("get-text");
        var el = this._doc.getById("get-text");

        assertEmpty(el.getText());
        node.innerHTML = "one <b>two</b> three <b>four</b>";
        assertEquals("one  three ", el.getText());
        assertEquals("one <b>two</b> three <b>four</b>", node.innerHTML.toLowerCase());
        node.innerHTML = "one two";
        assertEquals("one two", el.getText());
    },

    testRemoveText : function () {
        this._setUp("<p id='remove-text'></p>");
        var node = document.getElementById("remove-text");
        var el = this._doc.getById("remove-text");

        assertEquals(el, el.removeText());
        node.innerHTML = "one <b>two</b> three <b>four</b>";
        el.removeText();
        assertSize(2, node.childNodes);
        assertEquals("<b>two</b><b>four</b>", node.innerHTML.toLowerCase());

        // test internal extension - remove all but first text node
        node.innerHTML = "one <b>two</b> three <b>four</b>";
        el.removeText(true);
        assertSize(3, node.childNodes);
        assertEquals("one <b>two</b><b>four</b>", node.innerHTML.toLowerCase());
    },

    testAddCssClass : function () {
        this._setUp("<p id='add-css-class'></p>");
        var node = document.getElementById("add-css-class");
        var el = this._doc.getById("add-css-class");

        assertEquals(el, el.addCssClass("test", false));
        assertFalse(node.getAttribute("class"));
        assertEquals(el, el.addCssClass("test"));
        assertEquals("test", node.getAttribute("class"));

        el.addCssClass("test", false);
        assertFalse(node.getAttribute("class"));
        el.addCssClass("test", true);
        assertTrue(node.getAttribute("class"));

        el.addCssClass("t\"es\"t");
        assertEquals("test t\"es\"t", node.getAttribute("class"));
        el.addCssClass("t'es't");
        assertEquals("test t\"es\"t t'es't", node.getAttribute("class"));
        el.addCssClass("t&es&t");
        assertEquals("test t\"es\"t t'es't t&es&t", node.getAttribute("class"));

        assertAssertion(el, "addCssClass");
        assertAssertion(el, "addCssClass", null);
        assertAssertion(el, "addCssClass", "");

        $assert.disable();
        el.addCssClass();
        el.addCssClass(null);
        el.addCssClass("");
        assertEquals("test t\"es\"t t'es't t&es&t", node.getAttribute("class"));
    },

    testRemoveCssClass : function () {
        this._setUp("<p id='remove-css-class'></p>");
        var node = document.getElementById("remove-css-class");
        var el = this._doc.getById("remove-css-class");

        assertEquals(el, el.removeCssClass("test"));
        node.setAttribute("class", "test1 test2 test3");
        el.removeCssClass("test");
        assertEquals("test1 test2 test3", node.getAttribute("class"));
        el.removeCssClass("test2");
        assertEquals("test1 test3", node.getAttribute("class"));

        assertAssertion(el, "removeCssClass");
        assertAssertion(el, "removeCssClass", null);
        assertAssertion(el, "removeCssClass", "");

        $assert.disable();
        el.removeCssClass();
        el.removeCssClass(null);
        el.removeCssClass("");
        assertEquals("test1 test3", node.getAttribute("class"));
    },

    testToggleCssClass : function () {
        this._setUp("<p id='toggle-css-class'></p>");
        var node = document.getElementById("toggle-css-class");
        var el = this._doc.getById("toggle-css-class");

        assertEquals(el, el.toggleCssClass("test"));
        assertEquals("test", node.getAttribute("class"));
        el.toggleCssClass("test");
        assertEmpty(node.getAttribute("class"));
        node.setAttribute("class", "test1 test test2");
        el.toggleCssClass("test");
        assertEquals("test1 test2", node.getAttribute("class"));
        el.toggleCssClass("test");
        assertEquals("test1 test2 test", node.getAttribute("class"));

        assertAssertion(el, "toggleCssClass");
        assertAssertion(el, "toggleCssClass", null);
        assertAssertion(el, "toggleCssClass", "");

        $assert.disable();
        el.toggleCssClass();
        el.toggleCssClass(null);
        el.toggleCssClass("");
        assertEquals("test1 test2 test", node.getAttribute("class"));
    },

    testHasCssClass : function () {
        this._setUp("<p id='has-css-class'></p>");
        var node = document.getElementById("has-css-class");
        var el = this._doc.getById("has-css-class");

        assertFalse(el.hasCssClass("test"));
        node.setAttribute("class", "test");
        assertTrue(el.hasCssClass("test"));
        node.setAttribute("class", "test1 test test2");
        assertTrue(el.hasCssClass("test"));

        node.setAttribute("class", "te'st");
        assertTrue(el.hasCssClass("te'st"));
        node.setAttribute("class", "te\"st");
        assertTrue(el.hasCssClass("te\"st"));
        node.setAttribute("class", "te&st");
        assertTrue(el.hasCssClass("te&st"));

        assertAssertion(el, "hasCssClass");
        assertAssertion(el, "hasCssClass", null);
        assertAssertion(el, "hasCssClass", "");

        $assert.disable();
        el.hasCssClass();
        el.hasCssClass(null);
        el.hasCssClass("");
    },

    testSetValue : function () {
        this._setUp("<div id='set-value'></div>");
        var node = document.getElementById("set-value");
        var el = this._doc.getById("set-value");

        assertEquals(el, el.setValue("test"));
        assertEquals("test", node.firstChild.nodeValue);
        el.setValue(new String("string"));
        assertEquals("string", node.firstChild.nodeValue);
        el.setValue(null);
        assertSize(0, node.childNodes);

        node.style.display = "none";
        assertAssertion(el, "setValue");
        assertAssertion(el, "setValue", {});
        $assert.disable();
        el.setValue("test");
        assertEquals("test", node.firstChild.nodeValue);
    },

    testAddHtml : function () {
        this._setUp("<div id='add-html'><h1></h1></div>");
        var node = document.getElementById("add-html");
        var el = this._doc.getById("add-html");

        el.addHTML("<h2></h2>");
        assertSize(2, node.childNodes);
        assertEquals("h1", node.childNodes.item(0).nodeName.toLowerCase());
        assertEquals("h2", node.childNodes.item(1).nodeName.toLowerCase());

        assertAssertion(el, "addHTML");
        assertAssertion(el, "addHTML", null);
        assertAssertion(el, "addHTML", "");
        assertSize(2, node.childNodes);
        assertEquals("h1", node.childNodes.item(0).nodeName.toLowerCase());
        assertEquals("h2", node.childNodes.item(1).nodeName.toLowerCase());

        $assert.disable();
        var invalidHTML = [ undefined, null, "" ];
        for ( var i = 0; i < invalidHTML.length; ++i) {
            node.innerHTML = "<h1></h1><h2></h2>";
            assertSize(2, node.childNodes);
            el.addHTML(invalidHTML[i]);
            assertSize(2, node.childNodes);
            assertEquals("h1", node.childNodes.item(0).nodeName.toLowerCase());
            assertEquals("h2", node.childNodes.item(1).nodeName.toLowerCase());
        }
    },

    testSetHtml : function () {
        this._setUp("<div id='set-html'></div>");
        var node = document.getElementById("set-html");
        var el = this._doc.getById("set-html");

        var html = "<h1></h1><h2></h2>";
        el.setHTML(html);
        assertSize(2, node.childNodes);
        assertEquals("h1", node.childNodes.item(0).nodeName.toLowerCase());
        assertEquals("h2", node.childNodes.item(1).nodeName.toLowerCase());

        assertAssertion(el, "setHTML");
        assertAssertion(el, "setHTML", null);
        assertAssertion(el, "setHTML", "");
        assertSize(2, node.childNodes);
        assertEquals("h1", node.childNodes.item(0).nodeName.toLowerCase());
        assertEquals("h2", node.childNodes.item(1).nodeName.toLowerCase());

        $assert.disable();
        var invalidHTML = [ undefined, null, "" ];
        for ( var i = 0; i < invalidHTML.length; ++i) {
            node.innerHTML = html;
            assertSize(2, node.childNodes);
            el.setHTML(invalidHTML[i]);
            assertSize(0, node.childNodes);
        }
    },

    testGetHtml : function () {
        var html = "" + //
        "<h1 data-value=\"name\"></h1>" + //
        "<h2 data-value=\"profession\"></h2>";
        this._setUp(html);
        var node = document.getElementById("scratch-area");
        var el = this._doc.getById("scratch-area");
        assertEquals(html, el.getHTML());

        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        assertEmpty(el.getHTML());
    },

    testAddListener : function (context) {
        context.push("js.event.DomEvents.prototype.addListener");
        context.push("js.event.CustomEvents.prototype.addListener");
        var domEventProbe = 0;
        var customEventProbe = 0;

        var domType = "click";
        var customType = "custom-type";
        var listener = function () {
        };
        var scope = {};

        js.event.DomEvents.prototype.addListener = function (_type, _listener, _scope) {
            domEventProbe++;
            assertEquals(domType, _type);
            assertEquals(listener, _listener);
            assertEquals(scope, _scope);
        };
        js.event.CustomEvents.prototype.addListener = function (_type, _listener, _scope) {
            customEventProbe++;
            assertEquals(customType, _type);
            assertEquals(listener, _listener);
            assertEquals(scope, _scope);
        };

        this._setUp("<div id='add-listener'></div>");
        var el = this._doc.getById("add-listener");

        assertEquals(el, el.on(domType, listener, scope));
        el.getCustomEvents().register(customType);
        assertEquals(el, el.on(customType, listener, scope));
        assertEquals(1, domEventProbe);
        assertEquals(1, customEventProbe);
    },

    testRemoveListener : function (context) {
        context.push("js.event.DomEvents.prototype.removeListener");
        context.push("js.event.CustomEvents.prototype.removeListener");
        var domEventProbe = 0;
        var customEventProbe = 0;

        var domType = "click";
        var customType = "custom-type";
        var listener = function () {
        };

        js.event.DomEvents.prototype.removeListener = function (_type, _listener) {
            domEventProbe++;
            assertEquals(domType, _type);
            assertEquals(listener, _listener);
        };
        js.event.CustomEvents.prototype.removeListener = function (_type, _listener) {
            customEventProbe++;
            assertEquals(customType, _type);
            assertEquals(listener, _listener);
        };

        this._setUp("<div id='add-listener'></div>");
        var el = this._doc.getById("add-listener");

        assertEquals(el, el.un(domType, listener));
        el.getCustomEvents().register(customType);
        assertEquals(el, el.un(customType, listener));
        assertEquals(1, domEventProbe);
        assertEquals(1, customEventProbe);
    },

    testUserData : function () {
        this._setUp("<div id='user-data'></div>");
        var node = document.getElementById("user-data");
        var el = this._doc.getById("user-data");

        assertNull(el.setUserData("key", "value"));
        assertEquals("value", el.getUserData("key"));
        assertEquals("value", el.removeUserData("key"));
        assertNull(el.getUserData("key"));

        el.setUserData("value", "default value");
        assertEquals("default value", el.getUserData());

        var invalidKeys = [ undefined, null, "" ];
        for ( var i = 0; i < invalidKeys.length; ++i) {
            assertAssertion(el, "setUserData", invalidKeys[i]);
            if (invalidKeys[i] !== undefined) {
                assertAssertion(el, "getUserData", invalidKeys[i]);
            }
            assertAssertion(el, "removeUserData", invalidKeys[i]);
        }
        $assert.disable();
        for ( var i = 0; i < invalidKeys.length; ++i) {
            assertNull(el.setUserData(invalidKeys[i]));
            assertNull(el.removeUserData(invalidKeys[i]));
        }
    },

    testGetCustomEvents : function () {
        this._setUp("<div id='get-custom-events'></div>");
        var el = this._doc.getById("get-custom-events");
        assertUndefined(el._customEvents);
        assertInstanceof(el.getCustomEvents(), js.event.CustomEvents);
        assertDefined(el._customEvents);
    },

    testClean : function (context) {
        context.push("js.dom.Node.removeBackRef");

        var trace = "";
        js.dom.Node.removeBackRef = function (node) {
            trace += node.attributes.getNamedItem("id").value;
        };

        var html = "" + //
        "<div id='1'>" + //
        "	<div id='2'>" + //
        "		<div id='3'></div>" + //
        "		<div id='4'></div>" + //
        "	</div>" + //
        "	<div id='5'>" + //
        "		<div id='6'></div>" + //
        "		<div id='7'></div>" + //
        "	</div>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getByCss("#scratch-area > div");

        // only div1 is created so finalize trace contains only its id
        div._clean(div._node, true);
        assertEquals("1", trace);

        // create all divs so that finalize is invoked for every one in the depth-first order
        this._setUp(html);
        var divs = [];
        for ( var i = 1; i < 8; ++i) {
            divs.push(this._doc.getById(i.toString()));
        }
        trace = "";
        divs[0]._clean(divs[0]._node);
        assertEquals("3426751", trace);
    },

    testTrace : function () {
        var html = "" + //
        "<div>" + //
        "	<ul>" + //
        "		<li></li>" + //
        "		<li></li>" + //
        "	</ul>" + //
        "</div>";
        this._setUp(html);
        var div = this._doc.getByCss("#scratch-area > div");

        var elist = this._doc.findByCss("#scratch-area > div li");
        assertEquals("/html/body/div/div/ul/li[0]", elist.item(0).trace());
        assertEquals("/html/body/div/div/ul/li[1]", elist.item(1).trace());
    },

    _elementsCount : function (node) {
        var count = 0;
        for ( var i = 0; i < node.childNodes.length; ++i) {
            if (node.childNodes.item(i).nodeType === Node.ELEMENT_NODE) {
                ++count;
            }
        }
        return count;
    },

    _firstElement : function (node) {
        for ( var i = 0; i < node.childNodes.length; ++i) {
            if (node.childNodes.item(i).nodeType === Node.ELEMENT_NODE) {
                return node.childNodes.item(i);
            }
        }
        return null;
    },

    _nextElement : function (node) {
        node = node.nextSibling;
        while (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                return node;
            }
            node = node.nextSibling;
        }
        return null;
    }
};
TestCase.register("js.tests.dom.ElementUnitTests");

js.tests.dom.FakeElement = function () {
};

js.tests.dom.MockWidget = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
};
js.tests.dom.MockWidget.prototype = {
    toString : function () {
        return "js.tests.dom.MockWidget";
    }
};
$extends(js.tests.dom.MockWidget, js.dom.Element);

$legacy(js.ua.Engine.IE8, function () {
    js.tests.dom.ElementUnitTests.testGetHtml = function () {
        var html = "" + //
        "<H1 data-value=\"name\"></H1>\r\n" + //
        "<H2 data-value=\"profession\"></H2>";
        this._setUp(html);
        var node = document.getElementById("scratch-area");
        var el = this._doc.getById("scratch-area");
        assertEquals(html, el.getHTML());

        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        assertEmpty(el.getHTML());
    };
});