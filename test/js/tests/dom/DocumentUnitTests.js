$package("js.tests.dom");

$include("js.dom.Form");
$include("js.dom.IFrame");
$include("js.format.FullDateTime");

js.tests.dom.DocumentUnitTests = {
    _doc : null,

    _setUp : function (html) {
        document.getElementById("scratch-area").innerHTML = html;
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
        var doc = new js.dom.Document(document);
        assertEquals(document, doc._document);

        assertAssertion(js.dom, "Document");
        assertAssertion(js.dom, "Document", null);
    },

    testCreateXmlElement : function () {
        var doc = js.dom.Builder.createXML("person");
        assertFalse(doc.getRoot().hasChildren());
        this._assertCreateElement(doc);
    },

    testCreateHtmlElement : function () {
        var doc = new js.dom.Document(document);
        this._assertCreateElement(doc);
    },

    testCreateIframe : function () {
        var html = "" + //
        "<form method='post' action='process-form.xsp' enctype='multipart/form-data'>" + //
        "</form>";
        this._setUp(html);

        var form = this._doc.getByCss("#scratch-area form");
        var id = js.util.ID();
        var iframe = form.getOwnerDoc().createElement("iframe", "id", id, "name", id, "src", "about:blank");
        iframe.style.set({
            "position" : "absolute",
            "top" : "-1000px",
            "left" : "-1000px"
        });
        form.setAttr("target", iframe.getAttr("id"));
        iframe.on("load", function () {
        }, this);
        form.getOwnerDoc().getByTag("body").addChild(iframe);

        assertEquals("IFRAME", iframe._node.nodeName);
        assertEquals(id, iframe._node.getAttribute("id"));
        assertEquals(id, iframe._node.getAttribute("name"));
        assertEquals("about:blank", iframe._node.getAttribute("src"));
    },

    _assertCreateElement : function (doc) {
        var el = doc.createElement("info", "name", "John Doe", "age", "47");
        assertNotNull(el);

        // after creation element is not part of document tree
        var node = doc._document.getElementsByTagName("info")[0];
        if (js.ua.Engine.TRIDENT && typeof doc._document.xml !== "undefined") {
            // IE XML document returns null instead of undefined for not found node
            assertNull(node);
        }
        else {
            assertTrue(typeof node === "undefined");
        }

        // although element node is not on DOM tree it has all properties
        assertEquals("info", el._node.nodeName.toLowerCase());
        assertEquals("John Doe", el._node.getAttribute("name"));
        assertEquals("47", el._node.getAttribute("age"));

        $assert.disable();
        var el = doc.createElement("p", "name");
        assertNotNull(el);
        assertEquals("p", el._node.nodeName.toLowerCase());
        // although W3C DOM Core Specification mandates an empty string it seems browsers
        // returns null if an attribute has no value set
        assertNull(el._node.getAttribute("name"));
    },

    testCreateElementAssertions : function () {
        var doc = new js.dom.Document(document);
        assertAssertion(doc, "createElement");
        assertAssertion(doc, "createElement", null);
        assertAssertion(doc, "createElement", "");
        assertAssertion(doc, "createElement", "info", "name");
        $assert.disable();
        // create element returns null if tag name is undefined, null or empty
        assertNull(doc.createElement());
        assertNull(doc.createElement(null));
        assertNull(doc.createElement(""));
    },

    testImportElementOnXmlDocument : function () {
        var foreignDoc = js.dom.Builder.createXML("foreign-root");
        var foreignEl = foreignDoc.createElement("p", "id", "p-id", "title", "p-title");

        var doc = js.dom.Builder.createXML("root");
        var el = doc.importElement(foreignEl);
        assertNotNull(el);
        assertEquals("p", el._node.tagName);
        assertEquals("p-id", el._node.getAttribute("id"));
        assertEquals("p-title", el._node.getAttribute("title"));
    },

    testImportElementOnHtmlDocument : function () {
        var foreignDoc = js.dom.Builder.createXML("root");
        var foreignEl = foreignDoc.createElement("p", "id", "p-id", "title", "p-title");

        var doc = new js.dom.Document(document);
        var el = doc.importElement(foreignEl);
        assertNotNull(el);
        assertEquals("p", el._node.tagName.toLowerCase());
        assertEquals("p-id", el._node.getAttribute("id"));
        assertEquals("p-title", el._node.getAttribute("title"));
    },

    testImportElementAssertions : function () {
        var doc = new js.dom.Document(document);
        var ownElement = doc.createElement("p");
        assertAssertion(doc, "importElement");
        assertAssertion(doc, "importElement", null);
        assertAssertion(doc, "importElement", ownElement);
        $assert.disable();
        assertNull(doc.importElement());
        assertNull(doc.importElement(null));
        assertEquals(ownElement, doc.importElement(ownElement));
    },

    testImportNode : function () {
        var xml = "" + //
        "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<root>" + //
        "	<empty />" + //
        "	<attr id='attr-id' title='attr-title' />" + //
        "	<parent>" + //
        "		<!-- comment -->" + //
        "		<child id='child-id' title='child-title'>text</child>" + //
        "	</parent>" + //
        "</root>";
        var foreignDoc = js.dom.Builder.parseXML(xml)._document;
        var emptyNode = foreignDoc.getElementsByTagName("empty")[0];
        var nodeWithAttributes = foreignDoc.getElementsByTagName("attr")[0];
        var nodeWithChildren = foreignDoc.getElementsByTagName("parent")[0];

        var doc = js.dom.Builder.createXML("root");
        var node = doc._importNode(emptyNode);
        assertNotNull(node);
        assertFalse(node.attributes.length);
        assertEquals(0, node.childNodes.length);

        node = doc._importNode(nodeWithAttributes);
        assertNotNull(node);
        assertEquals("attr-id", node.getAttribute("id"));
        assertEquals("attr-title", node.getAttribute("title"));
        assertEquals(0, node.childNodes.length);

        node = doc._importNode(nodeWithChildren);
        assertNotNull(node);
        assertFalse(node.attributes.length);
        if (js.ua.Engine.TRIDENT) {
            assertEquals(2, node.childNodes.length);
            assertEquals(Node.COMMENT_NODE, node.childNodes.item(0).nodeType);
            node = node.childNodes.item(1);
        }
        else {
            assertEquals(5, node.childNodes.length);
            assertEquals(Node.TEXT_NODE, node.childNodes.item(0).nodeType);
            assertEquals(Node.COMMENT_NODE, node.childNodes.item(1).nodeType);
            assertEquals(Node.TEXT_NODE, node.childNodes.item(2).nodeType);
            assertEquals(Node.TEXT_NODE, node.childNodes.item(4).nodeType);
            node = node.childNodes.item(3);
        }
        assertNotNull(node);
        assertEquals(Node.ELEMENT_NODE, node.nodeType);
        assertEquals("child-id", node.getAttribute("id"));
        assertEquals("child-title", node.getAttribute("title"));
        assertEquals(1, node.childNodes.length);
        node = node.childNodes.item(0);
        assertNotNull(node);
        assertEquals(Node.TEXT_NODE, node.nodeType);
    },

    testGetRoot : function () {
        var xml = "" + //
        "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<person>" + //
        "	<name id='name'>Iulian</name>" + //
        "	<surname id='surname'>Rotaru</surname>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        var root = doc.getRoot();
        assertNotNull(root);
        assertEquals("person", root.getTag());
    },

    testGetById : function () {
        var xml = "" + //
        "<person>" + //
        "	<name id='name'>Iulian</name>" + //
        "	<surname>Rotaru</surname>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        if (js.ua.Engine.WEBKIT || js.ua.Engine.GECKO) {
            // SURPRISE! WEBKIT and GECKO get by ID works without ID attribute declaration
            assertEquals("Iulian", doc.getById("name").getText());
        }
        else {
            assertNull(doc.getById("name"));
        }

        assertAssertion(doc, "getById");
        assertAssertion(doc, "getById", null);
        assertAssertion(doc, "getById", "");

        $assert.disable();
        assertNull(doc.getById());
        assertNull(doc.getById(null));
        assertNull(doc.getById(""));
    },

    testGetByIdOnHtml : function () {
        var html = "" + //
        "<div>" + //
        "   <div id='section-one-id'>" + //
        "       <h2 data-text='fruit'></h2>" + //
        "   </div>" + //
        "</div>";
        this._setUp(html);

        assertNotNull(this._doc.getById("scratch-area"));
        assertNotNull(this._doc.getById("section-one-id"));
    },

    testGetByTagOnXmlDocument : function () {
        var xml = "" + //
        "<person>" + //
        "	<name>Iulian</name>" + //
        "	<SURNAME>Rotaru</SURNAME>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);

        // on XML tag name is case sensitive
        assertNotNull(doc.getByTag("name"));
        assertNull(doc.getByTag("NAME"));
        assertInstanceof(doc.getByTag("name"), js.dom.Element);
        assertNull(doc.getByTag("surname"));
        assertNotNull(doc.getByTag("SURNAME"));
        assertEquals("Iulian", doc.getByTag("name").getText());
        assertEquals("Rotaru", doc.getByTag("SURNAME").getText());
        assertNull(doc.getByTag("fake"));
        assertEquals(doc.getRoot(), doc.getByTag("*"));

        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 id='name'>Iulian</h1>" + //
        "		<H2 id='surname'>Rotaru</H2>" + //
        "	</body>" + //
        "</html>";
        doc = js.dom.Builder.parseHTML(html);
        // HTML created by browser parser is in fact XML and tag IS case sensitive
        assertNotNull(doc.getByTag("h1"));
        assertNull(doc.getByTag("H1"));
        assertNull(doc.getByTag("h2"));
        assertNotNull(doc.getByTag("H2"));

        assertAssertion(doc, "getByTag");
        assertAssertion(doc, "getByTag", "");
        assertAssertion(doc, "getByTag", null);

        $assert.disable();
        assertNull(doc.getByTag());
        assertNull(doc.getByTag(""));
        assertNull(doc.getByTag(null));
    },

    /**
     * Tag name on HTML is not case sensitive.
     */
    testGetByTagOnHtmlDocument : function () {
        var html = "" + //
        "<h1 id='name'>Iulian</h1>" + //
        "<H2 id='surname'>Rotaru</H2>";
        this._setUp(html);

        assertNotNull(this._doc.getByTag("h1"));
        assertNotNull(this._doc.getByTag("H1"));
        assertNotNull(this._doc.getByTag("h2"));
        assertNotNull(this._doc.getByTag("H2"));
    },

    testFindByTag : function () {
        var xml = "" + //
        "<person>" + //
        "	<name>Iulian</name>" + //
        "	<name>Rotaru</name>" + //
        "	<NAME>Sr.</NAME>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);

        var elist = doc.findByTag("name");
        assertNotNull(elist);
        assertInstanceof(elist, js.dom.EList);
        assertSize(2, elist);
        assertEquals("Iulian", elist.item(0).getText());
        assertEquals("Rotaru", elist.item(1).getText());

        elist = doc.findByTag("NAME");
        assertNotNull(elist);
        assertInstanceof(elist, js.dom.EList);
        assertSize(1, elist);
        assertEquals("Sr.", elist.item(0).getText());

        this._assertEmpty(doc.findByTag("fake"));

        assertAssertion(doc, "findByTag");
        assertAssertion(doc, "findByTag", "");
        assertAssertion(doc, "findByTag", null);

        $assert.disable();
        this._assertEmpty(doc.findByTag());
        this._assertEmpty(doc.findByTag(""));
        this._assertEmpty(doc.findByTag(null));
    },

    testGetByXpathOnXmlDocument : function () {
        var xml = "" + //
        "<person>" + //
        "	<name>Iulian</name>" + //
        "	<name>Rotaru</name>" + //
        "	<NAME>IULIAN</NAME>" + //
        "   <address>" + //
        "       <city>Jassy</city>" + //
        "   </address>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);

        assertEquals("Iulian", doc.getByXPath("/person/name").getText());
        assertEquals("IULIAN", doc.getByXPath("/person/NAME").getText());
        assertNull(doc.getByXPath("/person/fake-name"));
        assertEquals("Jassy", doc.getByXPath("//city").getText());
    },

    testGetByXpathOnXhtmlDocument : function () {
        var html = "" + //
        "<html>" + //
        "   <head>" + //
        "       <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "   </head>" + //
        "   <body>" + //
        "       <h1 id='name'>Iulian</h1>" + //
        "       <H2 id='surname'>Rotaru</H2>" + //
        "   </body>" + //
        "</html>";
        doc = js.dom.Builder.parseHTML(html);

        assertEquals("Iulian", doc.getByXPath("/html/body/h1").getText());
        assertEquals("Rotaru", doc.getByXPath("/html/body/H2").getText());
    },

    /**
     * IE does not support XPath evaluation on HTML documents and there is assertion if attempt to use it. If assertions
     * engine is disabled all browsers less IE are expected to work properly.
     */
    testGetByXpathSupportOnHtmlDocument : function () {
        this._setUp("<h1></h1>");
        assertAssertion(this._doc, "getByXPath", "/html/body/div/h1");

        $assert.disable();
        assertNotNull(this._doc.getByXPath("/html/body/div/h1"));
    },

    testGetByXpathBadArguments : function () {
        var doc = js.dom.Builder.parseXML("<person></person>");

        assertAssertion(doc, "getByXPath");
        assertAssertion(doc, "getByXPath", null);
        assertAssertion(doc, "getByXPath", "");

        $assert.disable();
        assertNull(doc.getByXPath());
        assertNull(doc.getByXPath(null));
        assertNull(doc.getByXPath(""));
    },

    testFindByXpathOnXmlDocument : function () {
        var xml = "" + //
        "<person>" + //
        "	<name>Iulian</name>" + //
        "	<name>Rotaru</name>" + //
        "	<NAME>IULIAN</NAME>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);

        var elist = doc.findByXPath("/person/name");
        assertNotNull(elist);
        assertEquals(2, elist.size());
        assertEquals("Iulian", elist.item(0).getText());
        assertEquals("Rotaru", elist.item(1).getText());

        elist = doc.findByXPath("/person/NAME");
        assertNotNull(elist);
        assertEquals(1, elist.size());
        assertEquals("IULIAN", elist.item(0).getText());

        elist = doc.findByXPath("/person/fake-name");
        assertNotNull(elist);
        assertEmpty(elist);

        assertAssertion(doc, "findByXPath");
        assertAssertion(doc, "findByXPath", null);
        assertAssertion(doc, "findByXPath", "");

        $assert.disable();
        this._assertEmpty(doc.findByXPath());
        this._assertEmpty(doc.findByXPath(null));
        this._assertEmpty(doc.findByXPath(""));
    },

    testGetByCssOnXmlDocument : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 title='name'>Iulian</h1>" + //
        "		<h2 title='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";
        var doc = js.dom.Builder.parseHTML(html);
        if (js.ua.Engine.TRIDENT && doc.isXML()) {
            // XML document on IE has no support for query selector
            assertTrue(typeof doc._document.querySelector === "undefined");
            return;
        }

        assertNotNull(doc.getByCss("meta[content]"));
        assertEquals("Iulian", doc.getByCss("h1").getText());
        assertEquals("Iulian", doc.getByCss("[title='%s']", "name").getText());
        assertEquals("Rotaru", doc.getByCss("h2[title='surname']").getText());
    },

    testGetByCssOnHtmlDocument : function () {
        var html = "" + //
        "<h1 id='name'>Iulian</h1>" + //
        "<h2 id='surname'>Rotaru</h2>";
        this._setUp(html);

        assertNotNull(this._doc.getByCss("meta[content]"));
        assertEquals("Iulian", this._doc.getByCss("h1").getText());
        assertEquals("Iulian", this._doc.getByCss("[id='%s']", "name").getText());
        assertEquals("Rotaru", this._doc.getByCss("h2[id='surname']").getText());
    },

    testGetByClass: function() {
        var html = "" + //
        "<h1 id='name'>Iulian</h1>" + //
        "<div data-class='js.tests.dom.MockWidget'></div>";
        this._setUp(html);

        var img = this._doc.getByClass(js.tests.dom.MockWidget);
        assertNotNull(img);
        assertEquals("div", img.getTag());
        assertEquals("js.tests.dom.MockWidget", img.getAttr("data-class"));
    },
    
    testGetByCssAssertions : function () {
        var doc = new js.dom.Document(document);
        assertAssertion(doc, "getByCss");
        assertAssertion(doc, "getByCss", null);
        assertAssertion(doc, "getByCss", "");
        $assert.disable();
        assertNull(doc.getByCss());
        assertNull(doc.getByCss(null));
        assertNull(doc.getByCss(""));
    },

    testFindByCssOnXmlDocument : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 title='name'>Iulian</h1>" + //
        "		<h2 title='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";
        var doc = js.dom.Builder.parseXML(html);
        if (js.ua.Engine.TRIDENT && doc.isXML()) {
            // XML document on IE has no support for query selector all
            assertTrue(typeof doc._document.querySelectorAll === "undefined");
            return;
        }

        assertEquals(1, doc.findByCss("h1").size());
        assertEquals("Iulian", doc.findByCss("h1").item(0).getText());
        assertEquals(2, doc.findByCss("[title]").size());
        assertEquals(1, doc.findByCss("[title='%s']", "name").size());
        assertEquals("Rotaru", doc.findByCss("[title='%s']", "surname").item(0).getText());
        assertEquals(2, doc.findByCss("h1,h2").size());
    },

    testFindByCssOnHtmlDocument : function () {
        var html = "" + //
        "<h1 id='name'>Iulian</h1>" + //
        "<h2 id='surname'>Rotaru</h2>";
        this._setUp(html);

        assertEquals(1, this._doc.findByCss("#scratch-area h1").size());
        assertEquals("Iulian", this._doc.findByCss("h1").item(0).getText());
        assertEquals(2, this._doc.findByCss("#scratch-area [id]").size());
        assertEquals(1, this._doc.findByCss("#scratch-area [id='%s']", "name").size());
        assertEquals("Rotaru", this._doc.findByCss("[id='%s']", "surname").item(0).getText());
        assertEquals(2, this._doc.findByCss("#scratch-area h1,#scratch-area h2").size());
    },

    testFindByCssAssertions : function () {
        var doc = new js.dom.Document(document);
        assertAssertion(doc, "findByCss");
        assertAssertion(doc, "findByCss", null);
        assertAssertion(doc, "findByCss", "");
        $assert.disable();
        this._assertEmpty(doc.findByCss());
        this._assertEmpty(doc.findByCss(null));
        this._assertEmpty(doc.findByCss(""));
    },

    testGetByCssClass : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 class='name'>Iulian</h1>" + //
        "		<h2 class='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";
        this._setUp(html);

        assertEquals("Iulian", this._doc.getByCssClass("name").getText());
        assertEquals("Rotaru", this._doc.getByCssClass("surname").getText());

        assertAssertion(this._doc, "getByCssClass");
        assertAssertion(this._doc, "getByCssClass", null);
        assertAssertion(this._doc, "getByCssClass", "");

        $assert.disable();
        assertNull(this._doc.getByCssClass());
        assertNull(this._doc.getByCssClass(null));
        assertNull(this._doc.getByCssClass(""));
    },

    testFindByCssClass : function () {
        var html = "" + //
        "<h1 class='name'>Iulian</h1>" + //
        "<h2 class='name'>Rotaru</h2>";
        this._setUp(html);

        assertEquals("Iulian", this._doc.findByCssClass("name").item(0).getText());
        assertEquals("Rotaru", this._doc.findByCssClass("name").item(1).getText());

        assertAssertion(this._doc, "findByCssClass");
        assertAssertion(this._doc, "findByCssClass", null);
        assertAssertion(this._doc, "findByCssClass", "");

        $assert.disable();
        this._assertEmpty(this._doc.findByCssClass());
        this._assertEmpty(this._doc.findByCssClass(null));
        this._assertEmpty(this._doc.findByCssClass(""));
    },

    testSerialize : function () {
        var xml = "" + //
        "<person>" + //
        "	<name id=\"name\">Iulian</name>" + //
        "	<surname id=\"surname\">Rotaru</surname>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        xml = xml.replace(/\s+/g, "");
        var ser = doc.serialize().replace(/\s+/g, "");

        if (js.ua.Engine.PRESTO) {
            assertEquals("<?xmlversion='1.0'?>" + xml, ser);
        }
        else {
            assertEquals(xml, ser);
        }
    },

    testGetElement : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1>Iulian</h1>" + //
        "		<h2 data-class='js.tests.dom.MockWidget' data-format='js.tests.dom.MockFormat'>Rotaru</h2>" + //
        "		<h3 data-class='js.tests.dom.MockFormat'>Sotware Developer</h3>" + //
        "		<h4 data-format='js.tests.dom.MockWidget'>http://js-lib.com</h4>" + //
        "		<h5 data-class='fakeWidget'>Iasi</h5>" + //
        "		<h6 data-format='fakeFormat'>Romania</h6>" + //
        "	</body>" + //
        "</html>";
        var doc = js.dom.Builder.parseHTML(html);

        var node = doc._document.getElementsByTagName("h1")[0];
        assertNull(js.dom.Node.getElement(node));
        var el = doc.getElement(node);
        assertNotNull(el);
        assertInstanceof(el, js.dom.Element);
        assertEquals(el, js.dom.Node.getElement(node));
        assertNull(el._format);

        node = doc._document.getElementsByTagName("h2")[0];
        el = doc.getElement(node);
        assertNotNull(el);
        assertTrue(el instanceof js.tests.dom.MockWidget);
        assertTrue(el._format instanceof js.tests.dom.MockFormat);

        assertNull(doc.getElement());
        assertNull(doc.getElement(null));

        assertAssertion(doc, "getElement", doc._document.getElementsByTagName("h3")[0]);
        // assertAssertion(doc, "getElement", doc._document.getElementsByTagName("h5")[0]);
        // assertAssertion(doc, "getElement", doc._document.getElementsByTagName("h6")[0]);
    },

    testGetElist : function () {
        var xml = "" + //
        "<person>" + //
        "	<name>Iulian</name>" + //
        "	<name>Rotaru</name>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);

        var nodeList = doc._document.getElementsByTagName("name");
        var elist = doc.getEList(nodeList);
        assertNotNull(elist);
        assertInstanceof(elist, js.dom.EList);
        assertSize(2, elist);

        nodeList = doc._document.getElementsByTagName("fake");
        elist = doc.getEList(nodeList);
        assertNotNull(elist);
        assertInstanceof(elist, js.dom.EList);
        assertEmpty(elist);

        assertAssertion(doc, "getEList");
        assertAssertion(doc, "getEList", null);

        $assert.disable();
        this._assertEmpty(doc.getEList());
        this._assertEmpty(doc.getEList(null));
    },

    testGetStandardElementClassName : function () {
        var clsMap = {
            "a" : "js.dom.Anchor",
            "img" : "js.dom.Image",
            "form" : "js.dom.Form",
            "textarea" : "js.dom.Control",
            "select" : "js.dom.Select",
            "option" : "js.dom.Element",
            "iframe" : "js.dom.IFrame",
            "input.default" : "js.dom.Control",
            "input.text" : "js.dom.Control",
            "input.checkbox" : "js.dom.Checkbox",
            "input.radio" : "js.dom.Radio",
            "input.file" : "js.dom.FileInput",
            "default" : "js.dom.Element"
        };

        var doc = new js.dom.Document(document);
        var mockNode = {
            type : null,
            getAttribute : function () {
                return this.type;
            }
        };
        var i;
        for ( var nodeName in clsMap) {
            i = nodeName.indexOf(".");
            if (i !== -1) {
                mockNode.type = nodeName.substring(i + 1);
                mockNode.nodeName = "input";
            }
            else {
                mockNode.type = null;
                mockNode.nodeName = nodeName;
            }
            assertEquals(clsMap[nodeName], doc._getStandardElementClassName(mockNode));
        }
    },

    testCreateStandardClassElement : function () {
        var html = "<form id='create-standard-class-element' data-class='js.dom.Form'></form>";
        this._setUp(html);

        var node = document.getElementById("create-standard-class-element");
        var el = this._doc.getElement(node);

        assertInstanceof(el, js.dom.Form);
        assertEquals(node, el._node);
        assertEquals(js.dom.Node.getElement(node), el);
    },

    /**
     * Create element using user defined class. Declare user defined class into node class name as
     * "#js.tests.dom.MockWidget".
     */
    testCreateUserDefinedElementClass : function () {
        var html = "<form id='create-user-class-element'></form>";
        this._setUp(html);

        var node = document.getElementById("create-user-class-element");
        node.setAttribute(js.dom.Node._DATA_CLASS, "js.tests.dom.MockWidget");
        var el = this._doc.getElement(node);

        assertInstanceof(el, js.tests.dom.MockWidget);
        assertEquals(node, el._node);
        assertEquals(js.dom.Node.getElement(node), el);
    },

    testEquals : function () {
        this._setUp("<h1></h1>");
        var doc = js.dom.Builder.parseXML("<h1></h1>");
        assertTrue(WinMain.doc.equals(new js.dom.Document(document)));
        assertFalse(WinMain.doc.equals(doc));

        assertAssertion(WinMain.doc, "equals", null);
        assertAssertion(WinMain.doc, "equals", undefined);
        assertAssertion(WinMain.doc, "equals", {});
        assertAssertion(WinMain.doc, "equals", []);

        $assert.disable();
        assertFalse(WinMain.doc.equals(null));
        assertFalse(WinMain.doc.equals(undefined));
        assertFalse(WinMain.doc.equals({}));
        assertFalse(WinMain.doc.equals([]));
    },

    testIsXml : function () {
        this._setUp("<h1></h1>");
        assertFalse(this._doc.isXML());
        var doc = js.dom.Builder.parseXML("<h1></h1>");
        assertTrue(doc.isXML());
        assertFalse(WinMain.doc.isXML());
    },

    _assertEmpty : function (elist) {
        assertNotNull(elist);
        assertInstanceof(elist, js.dom.EList);
        assertEmpty(elist);
    }
};
TestCase.register("js.tests.dom.DocumentUnitTests");

js.tests.dom.MockWidget = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
};
js.tests.dom.MockWidget.prototype = {
    toString : function () {
        return "js.tests.dom.MockWidget";
    }
};
$extends(js.tests.dom.MockWidget, js.dom.Element);

js.tests.dom.MockFormat = function () {
};
js.tests.dom.MockFormat.prototype = {
    format : function () {
    },
    parse : function () {
    },
    test : function () {
    }
};

$legacy(js.ua.Engine.TRIDENT, function () {
    /**
     * IE does not support XPath evaluation on HTML documents. Unfortunatelly we need to disable this XPath on HTML for
     * all browsers. When assertions engine is active there is assert if trying to parse HTML document. With assertions
     * disabled there is error.
     */
    js.tests.dom.DocumentUnitTests.testGetByXpathSupportOnHtmlDocument = function () {
        this._setUp("<h1></h1>");
        assertAssertion(this._doc, "getByXPath", "/html/body/div/h1");

        $assert.disable();
        try {
            this._doc.getByXPath("/html/body/div/h1");
        } catch (e) {
            assertTrue("Object doesn't support property or method 'setProperty'", e.message);
            return;
        }
        assertTrue(false, "Internet Exporer should rise exception when trying to use XPath on HTML document.");
    };
});
