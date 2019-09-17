$package("js.tests.dom");

js.tests.dom.BuilderUnitTests = {
    testCreateDocument : function () {
        var doc = js.dom.Builder.createXML("person");
        assertNotNull(doc);
        assertTrue(doc instanceof js.dom.Document);
        assertDefined(doc._document);
        assertNotNull(doc._document.documentElement);
        assertEquals("person", doc._document.documentElement.tagName);
        assertNull(doc._document.documentElement.firstChild);
        assertSize(0, doc._document.documentElement.childNodes);
    },

    testParseXml : function () {
        var xml = "" + //
        "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<person>" + //
        "	<name id='name'>Iulian</name>" + //
        "	<surname id='surname'>Rotaru</surname>" + //
        "</person>";
        var doc = js.dom.Builder.parseXML(xml);
        assertNotNull(doc);
        assertTrue(doc instanceof js.dom.Document);
        assertDefined(doc._document);
        assertNotNull(doc._document.documentElement);
        if (js.ua.Engine.TRIDENT) {
            // it seems IE does not consider tabs as text node so we have only 2 children
            assertSize(2, doc._document.documentElement.childNodes);
        }
        else {
            assertSize(4, doc._document.documentElement.childNodes);
        }
        assertSize(1, doc._document.getElementsByTagName("name"));
        assertSize(1, doc._document.getElementsByTagName("surname"));
        assertEquals("Iulian", doc._document.getElementsByTagName("name")[0].firstChild.nodeValue);
        assertEquals("Rotaru", doc._document.getElementsByTagName("surname")[0].firstChild.nodeValue);
    },

    /**
     * Parsing not well formatted XML should rise DOM exception.
     */
    testParseNotWellFormattedXml : function () {
        var xml = "" + //
        "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<person>" + //
        "	<name id='name'>Iulian" + //
        "	<surname id='surname'>Rotaru</surname>" + //
        "</person>";
        try {
            js.dom.Builder.parseXML(xml);
            TestCase.fail("Parsing not well formatted XML should rise DOM exception.");
        } catch (e) {
            assertTrue(e instanceof js.dom.DomException);
            assertTrue(e.message.indexOf("arse") !== -1);
        }
    },

    testParseHtml : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 id='name'>Iulian</h1>" + //
        "		<h2 id='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";
        var doc = js.dom.Builder.parseHTML(html);
        assertNotNull(doc);
        assertTrue(doc instanceof js.dom.Document);
        assertDefined(doc._document);
        assertNotNull(doc._document.documentElement);
        assertEquals("text/html; charset=utf-8", doc._document.getElementsByTagName("meta")[0].getAttribute("content"));
        assertEquals("Iulian", doc._document.getElementsByTagName("h1")[0].firstChild.nodeValue);
        assertEquals("Rotaru", doc._document.getElementsByTagName("h2")[0].firstChild.nodeValue);
    },

    /**
     * Parsing not well formatted HTML. DOM parser is actually XML parser and content type for HTML is
     * application/xhtml+xml. So passing not well formatted HTML should rise exception, even its DOCTYPE is HTML.
     */
    testParseNotWellFormattedHtml : function () {
        var html = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 id='name'>Iulian" + //
        "		<h2 id='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";
        try {
            js.dom.Builder.parseHTML(html);
            TestCase.fail("Parsing not well formatted HTML should rise DOM exception.");
        } catch (e) {
            assertTrue(e instanceof js.dom.DomException);
            assertTrue(e.message.indexOf("arse") !== -1);
        }
    },

    testParseHtmlWithDoctype : function () {
        if (js.ua.Engine.TRIDENT) {
            // .dtd files may contains in-element comments not supported by XML parsers
            // anyway only IE seems to be so strict
            return;
        }

        var HTML4_TRANSITIONAL = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>";
        var HTML4_STRICT = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>";
        var XHTML1_TRANSITIONAL = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>";
        var XHTML1_STRICT = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>";
        var XHTML11 = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.1//EN' 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'>";
        var XHTML_MOBILE = "<!DOCTYPE html PUBLIC '-//WAPFORUM//DTD XHTML Mobile 1.0//EN' 'http://www.wapforum.org/DTD/xhtml-mobile10.dtd'>";
        var HTML5 = "<!DOCTYPE HTML>";

        function html (DOCTYPE) {
            return DOCTYPE + "<html>" + //
            "	<head>" + //
            "	</head>" + //
            "	<body>" + //
            "	</body>" + //
            "</html>";
        }
        ;

        assertNotNull(js.dom.Builder.parseHTML(html(HTML4_TRANSITIONAL)));
        assertNotNull(js.dom.Builder.parseHTML(html(HTML4_STRICT)));
        assertNotNull(js.dom.Builder.parseHTML(html(XHTML1_TRANSITIONAL)));
        assertNotNull(js.dom.Builder.parseHTML(html(XHTML1_STRICT)));
        assertNotNull(js.dom.Builder.parseHTML(html(XHTML11)));
        assertNotNull(js.dom.Builder.parseHTML(html(XHTML_MOBILE)));
        assertNotNull(js.dom.Builder.parseHTML(html(HTML5)));
    },

    /**
     * Parse XML string with HTML parser is allowed.
     */
    testParseXmlWithHtmlParser : function () {
        var xml = "" + //
        "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<person>" + //
        "	<name id='name'>Iulian</name>" + //
        "	<surname id='surname'>Rotaru</surname>" + //
        "</person>";
        try {
            js.dom.Builder.parseHTML(xml);
        } catch (e) {
            TestCase.fail("Parsing XML with HTML parser should NOT rise exception.");
        }
    },

    /**
     * Parsing HTML with DOCTYPE with XML parser is allowed.
     */
    testParseHtmlWithXmlParser : function () {
        var html = "" + "<!DOCTYPE HTML>" + //
        "<html>" + //
        "	<head>" + //
        "	</head>" + //
        "	<body>" + //
        "	</body>" + //
        "</html>";
        if (js.ua.Engine.TRIDENT) {
            // it seems IE is strict and try to validate the html document
            var html = "" + //
            "<html>" + //
            "	<head>" + //
            "	</head>" + //
            "	<body>" + //
            "	</body>" + //
            "</html>";
        }

        try {
            js.dom.Builder.parseXML(html);
        } catch (e) {
            TestCase.fail("Parsing HTML with XML parser should NOT rise exception.");
        }
    },

    testCrossDomainLoadFromUrl : function () {
        var url = "http://test.bbnet.ro/utf.xml";
        assertAssertion(js.dom.Builder, "loadXML", url);
        $assert.disable();
        try {
            js.dom.Builder.loadXML(url);
            TestCase.fail("Cross domain loading attempt should raise exception.");
        } catch (e) {
        }
    },

    testLoadXmlFromUrl : function (context) {
        var url = "file:///test.xml";
        if (location.hostname) {
            url = location.protocol + "//" + location.hostname + location.pathname + "text.xml";
        }

        js.tests.dom.MockXHR.url = url;
        js.tests.dom.MockXHR.content = "" + "<?xml version='1.0' encoding='UTF-8'?>" + //
        "<person>" + //
        "	<name id='name'>Iulian</name>" + //
        "	<surname id='surname'>Rotaru</surname>" + //
        "</person>";

        context.push("js.net.XHR");
        js.net.XHR = js.tests.dom.MockXHR;

        var callbackInvoked = false;
        js.dom.Builder.loadXML(url, function (doc) {
            assertNotNull(doc);
            assertTrue(doc instanceof js.dom.Document);
            assertDefined(doc._document);
            assertNotNull(doc._document.documentElement);
            assertEquals("person", doc._document.documentElement.tagName);
            assertNotNull(doc._document.documentElement.firstChild);
            if (js.ua.Engine.TRIDENT) {
                // IE does not consider tabs as text node so we have only 2 children
                assertSize(2, doc._document.documentElement.childNodes);
            }
            else {
                assertSize(4, doc._document.documentElement.childNodes);
            }
            callbackInvoked = true;
        });
        assertTrue(callbackInvoked);
    },

    testLoadHtmlFromUrl : function (context) {
        var url = "file:///test.html";
        if (location.hostname) {
            url = location.protocol + "//" + location.hostname + location.pathname + "text.xml";
        }

        js.tests.dom.MockXHR.url = url;
        js.tests.dom.MockXHR.content = "" + //
        "<html>" + //
        "	<head>" + //
        "		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" + //
        "	</head>" + //
        "	<body>" + //
        "		<h1 id='name'>Iulian</h1>" + //
        "		<h2 id='surname'>Rotaru</h2>" + //
        "	</body>" + //
        "</html>";

        context.push("js.net.XHR");
        js.net.XHR = js.tests.dom.MockXHR;

        var callbackInvoked = false;
        js.dom.Builder.loadHTML(url, function (doc) {
            assertNotNull(doc);
            assertTrue(doc instanceof js.dom.Document);
            assertDefined(doc._document);
            assertNotNull(doc._document.documentElement);
            assertEquals("text/html; charset=utf-8", doc._document.getElementsByTagName("meta")[0].getAttribute("content"));
            assertEquals("Iulian", doc._document.getElementsByTagName("h1")[0].firstChild.nodeValue);
            assertEquals("Rotaru", doc._document.getElementsByTagName("h2")[0].firstChild.nodeValue);
            callbackInvoked = true;
        });
        assertTrue(callbackInvoked);
    },

    testLoadAssertions : function () {
        var loaders = [ "loadXML", "loadHTML" ];
        function callback () {
        }
        ;
        for ( var i = 0; i < 2; ++i) {
            assertAssertion(js.dom.Builder, loaders[i]);
            assertAssertion(js.dom.Builder, loaders[i], null);
            assertAssertion(js.dom.Builder, loaders[i], "");
            assertAssertion(js.dom.Builder, loaders[i], "file:///file.xml", null);
            assertAssertion(js.dom.Builder, loaders[i], "file:///file.xml", {});
            assertAssertion(js.dom.Builder, loaders[i], "http://cross.domain.ro/file.xml", callback);
        }
    }
};
TestCase.register("js.tests.dom.BuilderUnitTests");

js.tests.dom.MockXHR = function () {
    this.cfg = arguments.callee;

    this.on = function (type, listener, scope) {
        assertEquals("load", type);
        assertFunction(listener);
        assertUndefined(scope);
        this.listener = listener;
    };

    this.open = function (method, url, async) {
        assertEquals("GET", method);
        assertEquals(this.cfg.url, url);
        assertUndefined(async);
    };

    this.send = function (data) {
        assertUndefined(data);
        this.listener.call(window, js.dom.Builder.parseXML(this.cfg.content));
    };
};
