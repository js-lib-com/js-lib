$package("js.tests.template");

js.tests.template.MapOperatorUnitTests = {
    testSupportedPrimitiveTypes : function () {
        var html = "" + //
        "<dl data-map='.'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-text='.'></dd>" + //
        "</dl>";

        var model = {
            key0 : 22,
            key1 : true,
            key2 : "string"
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        assertEquals("key2", elist, 2);

        elist = doc.findByTag("dd");
        assertEquals("22", elist, 0);
        assertEquals("true", elist, 1);
        assertEquals("string", elist, 2);
    },

    testSupportedValueTypes : function () {
        var html = "" + //
        "<dl data-map='.'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-text='.'></dd>" + //
        "</dl>";

        var model = {
            key0 : "string",
            key1 : 1234,
            key2 : true,
            key3 : new Date(1964, 2, 15, 14, 30)
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals(4, elist.size());
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        assertEquals("key2", elist, 2);
        assertEquals("key3", elist, 3);

        elist = doc.findByTag("dd");
        assertEquals(4, elist.size());
        assertEquals("string", elist, 0);
        assertEquals("1234", elist, 1);
        assertEquals("true", elist, 2);
        assertEquals(new Date(1964, 2, 15, 14, 30).toString(), elist, 3);
    },

    testMapOfObjects : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-object='.'>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : {
                    title : "title0"
                },
                key1 : {
                    title : "title1"
                }
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("h2");
        assertEquals("title0", elist, 0);
        assertEquals("title1", elist, 1);
    },

    testAnonymousMap : function () {
        var html = "" + //
        "<dl data-map='.'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-object='.'>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </dd>" + //
        "</dl>";

        var model = {
            key0 : {
                title : "title0"
            },
            key1 : {
                title : "title1"
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("h2");
        assertEquals("title0", elist, 0);
        assertEquals("title1", elist, 1);
    },

    testMapOfPrimitives : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-text='.'></dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : 0,
                key1 : 1
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("dd");
        assertEquals("0", elist, 0);
        assertEquals("1", elist, 1);
    },

    testMapOfLists : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "   <dt data-text='.'></dt>" + //
        "   <dd data-object='.'>" + //
        "       <ul data-list='.'>" + //
        "           <li data-object='.'>" + //
        "               <h2 data-text='title'></h2>" + //
        "           </li>" + //
        "       </ul>" + //
        "   </dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : [ {
                    title : "title00"
                }, {
                    title : "title01"
                } ],
                key1 : [ {
                    title : "title10"
                }, {
                    title : "title11"
                } ]
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("h2");
        assertEquals("title00", elist, 0);
        assertEquals("title01", elist, 1);
        assertEquals("title10", elist, 2);
        assertEquals("title11", elist, 3);
    },

    testNestedMaps : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "    <dt data-text='.'></dt>" + //
        "    <dd data-object='.'>" + //
        "        <h2 data-text='title'></h2>" + //
        "        <div data-map='map'>" + //
        "            <p data-text='.'></p>" + //
        "            <div data-object='.'>" + //
        "                <h3 data-text='title'></h3>" + //
        "            </div>" + //
        "        </div>" + //
        "    </dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : {
                    title : "title0",
                    map : {
                        key00 : {
                            title : "title00"
                        },
                        key01 : {
                            title : "title01"
                        }
                    }
                },
                key1 : {
                    title : "title1",
                    map : {
                        key10 : {
                            title : "title10"
                        },
                        key11 : {
                            title : "title11"
                        }
                    }
                }
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("h2");
        assertEquals("title0", elist, 0);
        assertEquals("title1", elist, 1);
        elist = doc.findByTag("p");
        assertEquals("key00", elist, 0);
        assertEquals("key01", elist, 1);
        assertEquals("key10", elist, 2);
        assertEquals("key11", elist, 3);
        elist = doc.findByTag("h3");
        assertEquals("title00", elist, 0);
        assertEquals("title01", elist, 1);
        assertEquals("title10", elist, 2);
        assertEquals("title11", elist, 3);
    },

    testMapOfDefaultPrimitives : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "   <dt></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : 0,
                key1 : 1
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("dd");
        assertEquals("0", elist, 0);
        assertEquals("1", elist, 1);
    },

    testMapOfDefaultObjects : function () {
        var html = "" + //
        "<dl data-map='map'>" + //
        "   <dt></dt>" + //
        "   <dd>" + //
        "       <h2 data-text='title'></h2>" + //
        "   </dd>" + //
        "</dl>";

        var model = {
            map : {
                key0 : {
                    title : "title0"
                },
                key1 : {
                    title : "title1"
                }
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals("key0", elist, 0);
        assertEquals("key1", elist, 1);
        elist = doc.findByTag("h2");
        assertEquals("title0", elist, 0);
        assertEquals("title1", elist, 1);
    },

    testReinjection : function () {
        var html, doc, root, template, elist;
        [ "map", "omap" ].forEach(function (mapType) {
            html = $format("<dl data-%s='.'><dt></dt><dd></dd></dl>", mapType);
            document.getElementById("scratch-area").innerHTML = html;
            doc = new js.dom.Document(document);
            root = doc.getById("scratch-area");
            template = js.dom.template.Template.getInstance(doc);

            template.inject({
                key0 : 1,
                key1 : 2
            });
            elist = root.findByTag("dd");
            assertEquals(2, elist.size());
            assertEquals("1", elist, 0);
            assertEquals("2", elist, 1);

            template.inject({});
            elist = root.findByTag("dd");
            assertEquals(0, elist.size());

            template.inject({
                key0 : 'a',
                key1 : 'b'
            });
            elist = root.findByTag("dd");
            assertEquals(2, elist.size());
            assertEquals("a", elist, 0);
            assertEquals("b", elist, 1);
        });
    },

    testMapWithoutChildren : function () {
        [ "map", "omap" ].forEach(function (mapType) {
            assertAssertion(this, "run", $format("<dl data-%s='.'></dl>", mapType), []);
        }, this);
    },

    testNullMapValue : function () {
        var doc;
        [ "map", "omap" ].forEach(function (mapType) {
            doc = this.run($format("<dl data-%s='items'><dt></dt><dd></dd></dl>", mapType), {
                items : null
            });
            assertEquals(0, doc.findByTag("dt").size());
            assertEquals(0, doc.findByTag("dd").size());
        }, this);
    },

    testBadMapValueTypes : function (context) {
        context.push("js.dom.template.ContentException");
        js.dom.template.ContentException = function (propertyPath, message) {
            assertEquals(".", propertyPath);
            assertEquals(0, message.indexOf("Invalid content type."));
        };

        var invalidValues = [ 123, "q", true, [], function () {
        } ];
        var html, i, doc;

        [ "map", "omap" ].forEach(function (mapType) {
            html = $format("<dl data-%s='.'><dt></dt><dd></dd></dl>", mapType);
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
        [ "map", "omap" ].forEach(function (mapType) {
            html = $format("<dl data-%s='.'><dt></dt><dd></dd></dl>", mapType);
            for (i = 0; i < invalidValues.length; ++i) {
                doc = this.run(html, invalidValues[i]);
                assertEquals(0, doc.findByTag("dt").size());
                assertEquals(0, doc.findByTag("dd").size());
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
TestCase.register("js.tests.template.MapOperatorUnitTests");

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
