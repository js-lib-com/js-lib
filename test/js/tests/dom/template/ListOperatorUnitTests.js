$package("js.tests.dom.template");

$include("js.dom.Anchor");

js.tests.dom.template.ListOperatorUnitTests = {
    testSupportedPrimitiveTypes : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "   <li data-text='.'></li>" + //
        "</ul>";

        var model = [ 22, true, "string" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals("22", elist, 0);
        assertEquals("true", elist, 1);
        assertEquals("string", elist, 2);
    },

    testAnonymousListOfPrimitives : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "   <li data-text='.'></li>" + //
        "</ul>";

        var model = [ 1, 2 ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals("1", elist, 0);
        assertEquals("2", elist, 1);
    },

    testListOfPrimitives : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li data-text='.'></li>" + //
        "</ul>";

        var model = {
            items : [ 1, 2 ]
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals("1", elist, 0);
        assertEquals("2", elist, 1);
    },

    testListOfAttributeValues : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li data-id='.'></li>" + //
        "</ul>";

        var model = {
            items : [ 1, 2 ]
        };
        var doc = this.run(html, model);

        assertEquals("1", doc.findByTag("li").item(0).getAttr("id"));
        assertEquals("2", doc.findByTag("li").item(1).getAttr("id"));
    },

    testListOfLinks : function () {
        var html = "" + //
        "<div data-list='.'>" + //
        "   <a data-id='id' data-href='url' data-title='tooltip' data-text='display'></a>" + //
        "</div>";

        var model = [ {
            id : 1,
            url : "http://server.com/url1",
            tooltip : "tooltip1",
            display : "link1"
        }, {
            id : 2,
            url : "http://server.com/url2",
            tooltip : "tooltip2",
            display : "link2"
        } ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("a");
        var a = elist.item(0);
        assertEquals("1", a.getAttr("id"));
        assertEquals("http://server.com/url1", a.getAttr("href"));
        assertEquals("tooltip1", a.getAttr("title"));
        assertEquals("link1", a.getText());
        a = elist.item(1);
        assertEquals("2", a.getAttr("id"));
        assertEquals("http://server.com/url2", a.getAttr("href"));
        assertEquals("tooltip2", a.getAttr("title"));
        assertEquals("link2", a.getText());
    },

    testListOfObjects : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li data-object='.'>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = {
            items : [ {
                title : "title1"
            }, {
                title : "title2"
            } ]
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("h2");
        assertEquals("title1", elist, 0);
        assertEquals("title2", elist, 1);
    },

    testAnonymousListOfObjects : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "   <li data-object='.'>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ {
            title : "title1"
        }, {
            title : "title2"
        } ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h2");
        assertEquals("title1", elist, 0);
        assertEquals("title2", elist, 1);
    },

    testListOfMaps : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li>" + //
        "       <dl data-map='.'>" + //
        "           <dt></dt>" + //
        "           <dd>" + //
        "               <h2 data-text='title'></h2>" + //
        "           </dd>" + //
        "       </dl>" + //
        "   </li>" + //
        "</ul>";

        var model = {
            items : [ {
                "key0" : {
                    title : "title0"
                },
                "key1" : {
                    title : "title1"
                }
            }, {
                "key2" : {
                    title : "title2"
                },
                "key3" : {
                    title : "title3"
                }
            } ]
        };
        var doc = this.run(html, model);

        var dts = doc.findByCss("dt"), dt, dd;
        for ( var i = 0; i < 4; ++i) {
            dt = dts.item(i);
            assertNotNull(dt);
            dd = dt.getNextSibling();
            assertNotNull(dd);
            assertEquals("title" + i, dd.getByTag("h2").getText().trim());
        }
    },

    testNestedLists : function () {
        var html = "" + //
        "<h1 data-text='title'></h1>" + //
        "<table>" + //
        "   <tbody data-list='list'>" + //
        "       <tr data-object='.'>" + //
        "            <td>" + //
        "                <h2 data-text='title'></h2>" + //
        "                <ul data-list='list'>" + //
        "                    <li data-object='.'>" + //
        "                        <h3 data-text='title'></h3>" + //
        "                    </li>" + //
        "                </ul>" + //
        "            </td>" + //
        "        </tr>" + //
        "    </tbody>" + //
        "</table>";

        var model = {
            title : "title",
            list : [ {
                title : "title0",
                list : [ {
                    title : "title00"
                }, {
                    title : "title01"
                } ]
            }, {
                title : "title1",
                list : [ {
                    title : "title10"
                }, {
                    title : "title11"
                } ]
            } ]
        };
        var doc = this.run(html, model);

        assertEquals("title", doc.getByTag("h1").getText());
        var elist = doc.findByTag("h2");
        assertEquals(2, elist.size());
        assertEquals("title0", elist, 0);
        assertEquals("title1", elist, 1);
        elist = doc.findByTag("h3");
        assertEquals(4, elist.size());
        assertEquals("title00", elist, 0);
        assertEquals("title01", elist, 1);
        assertEquals("title10", elist, 2);
        assertEquals("title11", elist, 3);
    },

    testEmptyList : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "   <li data-text='.'></li>" + //
        "</ul>";

        var model = [];
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals(0, elist.size());
    },

    testListOfDefaultPrimitives : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li></li>" + //
        "</ul>";

        var model = {
            items : [ 1, 2 ]
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals("1", elist, 0);
        assertEquals("2", elist, 1);
    },

    testListOfDefaultObjects : function () {
        var html = "" + //
        "<ul data-list='items'>" + //
        "   <li>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = {
            items : [ {
                title : "title1"
            }, {
                title : "title2"
            } ]
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("h2");
        assertEquals("title1", elist, 0);
        assertEquals("title2", elist, 1);
    },

    testReinjection : function () {
        var html, doc, root, template, elist;
        [ "list", "olist" ].forEach(function (listType) {
            html = $format("<ul data-%s='.'><li></li></ul>", listType);
            document.getElementById("scratch-area").innerHTML = html;
            doc = new js.dom.Document(document);
            root = doc.getById("scratch-area");
            template = js.dom.template.Template.getInstance(doc);

            template.inject([ 1, 2 ]);
            elist = root.findByTag("li");
            assertEquals(2, elist.size());
            assertEquals("1", elist, 0);
            assertEquals("2", elist, 1);

            template.inject([]);
            elist = root.findByTag("li");
            assertEquals(0, elist.size());

            template.inject([ 'a', 'b' ]);
            elist = root.findByTag("li");
            assertEquals(2, elist.size());
            assertEquals("a", elist, 0);
            assertEquals("b", elist, 1);
        });
    },

    testListWithoutChildren : function () {
        [ "list", "olist" ].forEach(function (listType) {
            assertAssertion(this, "run", $format("<ul data-%s='.'></ul>", listType), []);
        }, this);
    },

    testNullListValue : function () {
        var doc;
        [ "list", "olist" ].forEach(function (listType) {
            doc = this.run($format("<ul data-%s='items'><li></li></ul>", listType), {
                items : null
            });
            assertEquals(0, doc.findByTag("li").size());
        }, this);
    },

    testBadListValueTypes : function (context) {
        context.push("js.dom.template.ContentException");
        js.dom.template.ContentException = function (propertyPath, message) {
            assertEquals(".", propertyPath);
            assertEquals(0, message.indexOf("Invalid content type."));
        };

        var invalidValues = [ 123, "q", true, {}, new Date(), function () {
        } ];
        var html, i;

        [ "list", "olist" ].forEach(function (listType) {
            html = $format("<ul data-%s='.'><li></li></ul>", listType);
            for (i = 0; i < invalidValues.length; ++i) {
                var warn = $warn;
                var messageProbe;
                $warn = function (sourceName, format, text, error) {
                    messageProbe = $format(format, text, error);
                }

                this.run(html, invalidValues[i]);

                $warn = warn;
                assertTrue(messageProbe.indexOf("Undefined or invalid property") === 0);
            }
        }, this);

        $assert.disable();
        [ "list", "olist" ].forEach(function (listType) {
            html = $format("<ul data-%s='.'><li></li></ul>", listType);
            for (i = 0; i < invalidValues.length; ++i) {
                assertEquals(0, this.run(html, invalidValues[i]).findByTag("li").size());
            }
        }, this);
    },

    // ------------------------------------------------------
    // fixture initialization and helpers

    run : function (html, content) {
        document.getElementById("scratch-area").innerHTML = html;
        var doc = new js.dom.Document(document);
        var root = doc.getById("scratch-area");
        var template = js.dom.template.Template.getInstance(doc);
        template.inject(content);
        return root;
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    }
};
TestCase.register("js.tests.dom.template.ListOperatorUnitTests");

function assertEquals (expected, elist, index) {
    // expected, elist, index
    if (arguments.length === 3 && typeof arguments[2] === "number") {
        assertEquals(expected, elist.item(index).getText().trim());
        return;
    }
    // expected, concrete, message
    var concrete = arguments[1];
    if (expected !== concrete) {
        TestCase.fail(_reason(arguments, 2, "Assert equals fails. Expected [%s] but got [%s].", expected, concrete));
    }
}
