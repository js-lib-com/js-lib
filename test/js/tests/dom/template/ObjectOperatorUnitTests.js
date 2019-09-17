$package("js.tests.dom.template.template");

$include("js.dom.Image");
$include("js.dom.Anchor");

js.tests.dom.template.template.ObjectOperatorUnitTests = {
    testSupportedPrimitiveTypes : function () {
        var html = "" + //
        "<ul>" + //
        "   <li data-text='number'></li>" + //
        "   <li data-text='boolean'></li>" + //
        "   <li data-text='string'></li>" + //
        "</ul>";

        var model = {
            number : 22,
            boolean : true,
            string : "string"
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals("22", elist, 0);
        assertEquals("true", elist, 1);
        assertEquals("string", elist, 2);
    },

    testFlatObject : function () {
        var html = "" + //
        "<div>" + //
        "   <h1 data-text='title'></h1>" + //
        "   <img data-src='picture' data-title='title' />" + //
        "</div>";

        var model = {
            title : "title",
            picture : "picture.png"
        };
        var doc = this.run(html, model);

        assertEquals("title", doc.getByTag("h1").getText().trim());
        assertEquals("picture.png", doc.getByTag("img").getAttr("src"));
        assertEquals("title", doc.getByTag("img").getAttr("title"));

    },

    testNestedObject : function () {
        var html = "" + //
        "<h1 data-text='title'></h1>" + //
        "<div data-object='nested'>" + //
        "    <h2 data-text='title'></h2>" + //
        "    <div data-object='object'>" + //
        "        <h3 data-text='title'></h3>" + //
        "        <img data-src='picture' data-title='title' />" + //
        "    </div>" + //
        "</div>";

        var model = {
            title : "title1",
            nested : {
                title : "title2",
                object : {
                    title : "title3",
                    picture : "picture.png"
                }
            }
        };
        var doc = this.run(html, model);

        assertEquals("title1", doc.getByTag("h1").getText().trim());
        assertEquals("title2", doc.getByTag("h2").getText().trim());
        assertEquals("title3", doc.getByTag("h3").getText().trim());
        assertEquals("picture.png", doc.getByTag("img").getAttr("src"));
    },

    /**
     * Element subclass may overwrite setObject method. If subclass calls super.setObject a circular dependencies is
     * created. There is an assert preventing such condition and this test case check this assertion.
     */
    testSuperObject : function () {
        var model = {
            title : 'Personal File',
            description : 'person description',
            person : {
                name : 'John Doe',
                age : 40,
                profession : 'freelancer'
            }
        };

        // this html fragment has Person class that has setObject instructed to call super-element setObject
        // calling super.setObject create circular dependency and should be avoid
        // there is an assert that catch this condition
        var html = '' + //
        '<div data-object=".">' + //
        '   <h1 data-text="title"></h1>' + //
        '   <h2 data-text="description"></h2>' + //
        '   <div data-object="person" data-class="js.tests.dom.template.Person">' + //
        '       <h3 data-text="name"></h3>' + //
        '       <h4 data-text="age"></h4>' + //
        '       <h5 data-text="profession"></h5>' + //
        '   </div>' + //
        '</div>';
        assertAssertion(this, "run", html, model);

        // this html fragment has no Person class and no super.setObject so it should be working as usual
        html = '' + //
        '<div data-object=".">' + //
        '   <h1 data-text="title"></h1>' + //
        '   <h2 data-text="description"></h2>' + //
        '   <div data-object="person">' + //
        '       <h3 data-text="name"></h3>' + //
        '       <h4 data-text="age"></h4>' + //
        '       <h5 data-text="profession"></h5>' + //
        '   </div>' + //
        '</div>';
        this.run(html, model);
    },

    testInvalidOperatorsList : function () {
        var html = "<div data-object='nested' data-text='title'></div>";
        assertAssertion(this, "run", html, {});
    },

    testBadScope : function () {
        var html = "<div data-object='value'></div>";
        [ "string", 1234, true, function () {
        } ].forEach(function (value) {
            assertAssertion(this, "run", html, value);
        }, this);
    },

    testAbsolutePath : function () {
        var html = "" + //
        "<h1 data-text='title'></h1>" + //
        "<div data-object='nested'>" + //
        "    <h2 data-text='title'></h2>" + //
        "    <div data-object='.object'>" + //
        "        <h3 data-text='title'></h3>" + //
        "        <img data-src='picture' data-title='title' />" + //
        "    </div>" + //
        "</div>";

        var model = {
            title : "title1",
            nested : {
                title : "title2",
            },
            object : {
                title : "title3",
                picture : "picture.png"
            }
        };
        var doc = this.run(html, model);

        assertEquals("title1", doc.getByTag("h1").getText().trim());
        assertEquals("title2", doc.getByTag("h2").getText().trim());
        assertEquals("title3", doc.getByTag("h3").getText().trim());
        assertEquals("picture.png", doc.getByTag("img").getAttr("src"));
    },

    testSetObjectOnSubtree : function () {
        var html = "" + //
        "<div data-object='person'>" + //
        "	<h1 data-text='name'></h1>" + //
        "	<div id='cv-id' data-object='cv'>" + //
        "		<h2 data-text='age'></h2>" + //
        "		<h3 data-text='profession'></h3>" + //
        "	</div>" + //
        "</div>";

        document.getElementById("scratch-area").innerHTML = html;
        var doc = new js.dom.Document(document);
        var root = doc.getById("scratch-area");
        var template = new js.dom.template.Template(doc);

        var element = doc.getById("cv-id");
        var person = {
            name : "John Doe",
            cv : {
                age : 47,
                profession : "free lancer"
            }
        };
        template.injectElement(element, person.cv);

        assertEquals("", doc.getByTag("h1").getText());
        assertEquals("47", doc.getByTag("h2").getText());
        assertEquals("free lancer", doc.getByTag("h3").getText());
        template.injectElement(element, person.cv);

        var cv = {
            age : 48,
            profession : "CEO"
        };
        template.injectElement(element, cv);

        assertEquals("", doc.getByTag("h1").getText());
        assertEquals("48", doc.getByTag("h2").getText());
        assertEquals("CEO", doc.getByTag("h3").getText());
    },

    testComplexGraph : function () {
        var html = "" + //
        "<h1 data-text='title'></h1>" + //
        "<div id='nested' data-object='nested'>" + //
        "    <h2 data-text='title'></h2>" + //
        "    <ul data-list='list'>" + //
        "        <li>" + //
        "            <h3 data-text='title'></h3>" + //
        "            <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "        </li>" + //
        "    </ul>" + //
        "    <dl data-map='map'>" + //
        "        <dt></dt>" + //
        "        <dd>" + //
        "            <h3 data-text='title'></h3>" + //
        "            <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "        </dd>" + //
        "    </dl>" + //
        "</div>" + //
        "<ul data-list='list'>" + //
        "    <li>" + //
        "        <h2 data-text='title'></h2>" + //
        "        <ul data-list='list'>" + //
        "            <li>" + //
        "                <h3 data-text='title'></h3>" + //
        "                <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "            </li>" + //
        "        </ul>" + //
        "        <dl data-map='map'>" + //
        "            <dt></dt>" + //
        "            <dd>" + //
        "                <h3 data-text='title'></h3>" + //
        "                <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "            </dd>" + //
        "        </dl>" + //
        "    </li>" + //
        "</ul>" + //
        "<dl data-map='map'>" + //
        "    <dt></dt>" + //
        "    <dd>" + //
        "        <h2 data-text='title'></h2>" + //
        "        <ul data-list='list'>" + //
        "            <li>" + //
        "                <h3 data-text='title'></h3>" + //
        "                <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "            </li>" + //
        "        </ul>" + //
        "        <dl data-map='map'>" + //
        "            <dt></dt>" + //
        "            <dd>" + //
        "                <h3 data-text='title'></h3>" + //
        "                <a data-href='link'><img data-src='picture' data-title='title' /></a>" + //
        "            </dd>" + //
        "        </dl>" + //
        "    </dd>" + //
        "</dl>";

        var model = {
            title : "title",
            nested : {
                title : "nested-title",
                list : [ {
                    title : "nested-list-title",
                    picture : "nested-list-picture.png"
                } ],
                map : {
                    "nested-key" : {
                        title : "nested-map-title",
                        picture : "nested-map-picture.png"
                    }
                }
            },
            list : [ {
                title : "subtitle",
                list : [ {
                    title : "sublist-title",
                    picture : "sublist-picture.png"
                } ],
                map : {
                    subkey : {
                        title : "submap-title",
                        picture : "submap-picture.png"
                    }
                }
            } ],
            map : {
                key : {
                    title : "subtitle",
                    list : [ {
                        title : "sublist-title",
                        picture : "sublist-picture.png"
                    } ],
                    map : {
                        subkey : {
                            title : "submap-title",
                            picture : "submap-picture.png"
                        }
                    }
                }
            }
        };
        var doc = this.run(html, new js.tests.dom.template.template.ComplexGraphContent(model));

        assertEquals("title", doc.getByTag("h1").getText());

        var nestedObject = doc.getByCss("#nested");
        assertNotNull(nestedObject);
        assertEquals("nested-title", nestedObject.getByTag("h2").getText());

        var li = nestedObject.getByTag("li");
        assertNotNull(li);
        assertEquals("nested-list-title", li.getByTag("h3").getText());
        assertEquals("details.xsp?title=nested-list-title", li.getByTag("a").getAttr("href"));
        assertEquals("nested-list-picture.png", li.getByTag("img").getAttr("src"));
        assertEquals("nested-list-title", li.getByTag("img").getAttr("title"));

        var dt = nestedObject.getByTag("dt");
        assertNotNull(dt);
        assertEquals("nested-key", dt.getText().trim());

        var dd = nestedObject.getByTag("dd");
        assertNotNull(dd);
        assertEquals("nested-map-title", dd.getByTag("h3").getText());
        assertEquals("details.xsp?title=nested-map-title", dd.getByTag("a").getAttr("href"));
        assertEquals("nested-map-picture.png", dd.getByTag("img").getAttr("src"));
        assertEquals("nested-map-title", dd.getByTag("img").getAttr("title"));

        var nestedList = doc.getByCss("#scratch-area>ul");
        assertNotNull(nestedList);
        var nestedMap = doc.getByCss("#scratch-area>dl");
        assertNotNull(nestedMap);
        assertEquals("key", nestedMap.getByTag("dt").getText().trim());

        var nestedElements = [ nestedList, nestedMap ];
        for ( var i = 0; i < nestedElements.length; ++i) {
            var el = nestedElements[i];
            assertEquals("subtitle", el.getByTag("h2").getText());

            li = el.getByTag("li");
            assertNotNull(li);
            assertEquals("sublist-title", li.getByTag("h3").getText());
            assertEquals("details.xsp?title=sublist-title", li.getByTag("a").getAttr("href"));
            assertEquals("sublist-picture.png", li.getByTag("img").getAttr("src"));
            assertEquals("sublist-title", li.getByTag("img").getAttr("title"));

            dt = el.getByTag("dl").getByTag("dt");
            assertNotNull(dt);
            assertEquals("subkey", dt.getText().trim());

            dd = el.getByTag("dl").getByTag("dd");
            assertNotNull(dd);
            assertEquals("submap-title", dd.getByTag("h3").getText());
            assertEquals("details.xsp?title=submap-title", dd.getByTag("a").getAttr("href"));
            assertEquals("submap-picture.png", dd.getByTag("img").getAttr("src"));
            assertEquals("submap-title", dd.getByTag("img").getAttr("title"));
        }
    },

    testNullContentValue : function () {
        var html = "" + //
        "<div data-object='object'>" + //
        "   <h1>Heading One</h1>" + //
        "   <div data-object='subobject'>" + //
        "       <h2>Heading Two</h2>" + //
        "       <ul data-list='sublist'>" + //
        "           <li data-text='.'></li>" + //
        "       </ul>" + //
        "   </div>" + //
        "</div>";
        var model = {
            object : null
        };
        var doc = this.run(html, model);

        var h1 = doc.getByTag("h1");
        assertNotNull(h1);
        assertEquals("Heading One", h1.getText());
        var h2 = doc.getByTag("h2");
        assertNotNull(h2);
        assertEquals("Heading Two", h2.getText());
        assertNotNull(doc.getByTag("ul"));
        var li = doc.findByTag("li");
        assertEquals(0, li.size());
    },

    testBadType : function (context) {
        context.push("js.dom.template.ContentException");
        js.dom.template.ContentException = function (propertyPath, message) {
            assertEquals("value", propertyPath);
            assertEquals(0, message.indexOf("Invalid content type."));
            error = true;
        };

        var error;
        var html = "<div data-object='value'></div>";
        var badValues = [ {
            value : "string"
        }, {
            value : 1234
        }, {
            value : true
        }, {
            value : new String("string")
        }, {
            value : new Number("1234")
        }, {
            value : new Boolean("true")
        }, {
            value : function () {
            }
        } ];

        badValues.forEach(function (object) {
            var warn = $warn;
            var messageProbe;
            $warn = function (sourceName, format, text, error) {
                messageProbe = $format(format, text, error);
            }

            this.run(html, object);
            

            $warn = warn;
            assertTrue(messageProbe.indexOf("Undefined or invalid property") === 0);
        }, this);

        $assert.disable();
        var error;
        badValues.forEach(function (object) {
            error = false;
            this.run(html, object);
            assertTrue(error);
        }, this);
    },

    testBadTypeOnSelf : function (context) {
        context.push("js.dom.template.ContentException");
        js.dom.template.ContentException = function (propertyPath, message) {
            assertEquals(".", propertyPath);
            assertEquals(0, message.indexOf("Invalid content type."));
        };

        var html = "<div data-object='.'></div>";
        var model = function () {
        };
        
        var warn = $warn;
        var messageProbe;
        $warn = function (sourceName, format, text, error) {
            messageProbe = $format(format, text, error);
        }

        this.run(html, model);

        $warn = warn;
        assertTrue(messageProbe.indexOf("Undefined or invalid property") === 0);

        $assert.disable();
        this.run(html, model);
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
TestCase.register("js.tests.dom.template.template.ObjectOperatorUnitTests");

js.tests.dom.template.template.ComplexGraphContent = function (model) {
    this.$super(model);
};

js.tests.dom.template.template.ComplexGraphContent.prototype = {
    getLink : function (pojo) {
        return "details.xsp?title=" + pojo.title;
    }
};
$extends(js.tests.dom.template.template.ComplexGraphContent, js.dom.template.Content);

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

js.tests.dom.template.Person = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
};

js.tests.dom.template.Person.prototype = {
    setObject : function (person) {
        this.$super("setObject", person);
        return this;
    }
};
$extends(js.tests.dom.template.Person, js.dom.Element);
