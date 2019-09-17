$package("js.tests.dom.template");

$include("js.dom.Control");
$include("js.dom.Image");
$include("js.dom.Anchor");

js.tests.dom.template.AttributeOperatorUnitTests = {
    testAddCssClass : function () {
        var html = "<div data-css-class='id=1964:birth-year'></div>";

        var model = {
            id : 1964
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("birth-year", el.getAttr("class"));
    },

    testRemoveCssClass : function () {
        var html = "<div class='birth-year' data-css-class='!id=1964:birth-year'></div>";

        var model = {
            id : 1964
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEmpty(el.getAttr("class"));
    },

    testAddRemoveCssClass : function () {
        var html = "<div class='birth-year' data-css-class='!id=1964:birth-year;id=1964:birth-day'></div>";

        var model = {
            id : 1964
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("birth-day", el.getAttr("class"));
    },

    testPreserveClassIfDataCssClassIsNotPresent : function () {
        var html = "<div class='birth-year'></div>";

        var model = {
            birthYear : 1964
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("birth-year", el.getAttr("class"));
    },

    testAttr : function () {
        var html = "<div data-attr='title:description;id:id;'></div>";

        var model = {
            id : 1964,
            description : "some description"
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("1964", el.getAttr("id"));
        assertEquals("some description", el.getAttr("title"));
    },

    testBadAttrExpression : function () {
        [ "", ";", ":", "title;description", "title:;", "title;description:" ].forEach(function (badExpression) {
            assertAssertion(this, "run", $format("<div data-attr='%s'></div>", badExpression), {});
        }, this);
    },

    testNullAttr : function () {
        var html = "<div data-attr='title:description' title='title'></div>";
        var model = {
            description : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertNull(el.getAttr("title"));
    },

    testUndefinedAttr : function (context) {
        context.push("js.dom.template.ContentException");

        js.dom.template.ContentException = function (propertyPath, message) {
            assertEquals("description", propertyPath);
            assertEquals("Undefined content value.", message);
        };
        var html = "<div data-attr='title:description' title='title'></div>";
        var model = {};

        var warn = $warn;
        var messageProbe;
        $warn = function (sourceName, format, text, error) {
            messageProbe = $format(format, text, error);
        }
        
        this.run(html, model);

        $warn = warn;
        assertTrue(messageProbe.indexOf("Undefined or invalid property") === 0);
        
        $assert.disable();
        var doc = this.run(html, model);
        var el = doc.getByTag("div");
        assertNotNull(el.getAttr("title"));
    },

    testId : function () {
        var html = "<div data-id='id' />";

        var model = {
            id : 1964
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("1964", el.getAttr("id"));
    },

    testBadIdType : function () {
        var models = [ true, {}, new Date(), function () {
        } ];
        var html = "<div data-id='.' />";
        for ( var i = 0; i < models.length; ++i) {
            assertAssertion(this, "run", html, models[i]);
        }
    },

    testNullId : function () {
        var html = "<div data-id='id' />";
        var model = {
            id : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertNull(el.getAttr("id"));
    },

    testSrc : function () {
        var html = "<img data-src='picture' />";

        var model = {
            picture : "images/user.png"
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("img");
        assertEquals("images/user.png", el.getAttr("src"));
    },

    testBadSrcType : function () {
        var models = [ true, 1234, {}, new Date(), function () {
        } ];
        var html = "<img data-src='.' />";
        for ( var i = 0; i < models.length; ++i) {
            assertAssertion(this, "run", html, models[i]);
        }
    },

    testNullSrc : function () {
        var html = "<img data-src='picture' />";
        var model = {
            picture : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("img");
        assertNull(el.getAttr("src"));
    },

    testHref : function () {
        var html = "<a data-href='link'>link</a>";

        var model = {
            link : "http://server.com/app/index.xsp"
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("a");
        assertEquals("http://server.com/app/index.xsp", el.getAttr("href"));
    },

    testBadHrefType : function () {
        var models = [ true, 1234, {}, new Date(), function () {
        } ];
        var html = "<a data-href='.' />";
        for ( var i = 0; i < models.length; ++i) {
            assertAssertion(this, "run", html, models[i]);
        }
    },

    testNullHref : function () {
        var html = "<a data-href='link'>link</a>";
        var model = {
            link : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("a");
        assertNull(el.getAttr("href"));
    },

    testTitle : function () {
        var html = "<div data-title='description' />";

        var model = {
            description : "some description"
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertEquals("some description", el.getAttr("title"));
    },

    testBadTitleType : function () {
        var models = [ true, 1234, {}, new Date(), function () {
        } ];
        var html = "<a data-title='.' />";
        for ( var i = 0; i < models.length; ++i) {
            assertAssertion(this, "run", html, models[i]);
        }
    },

    testNullTitle : function () {
        var html = "<div data-title='description' />";
        var model = {
            description : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("div");
        assertNull(el.getAttr("title"));
    },

    testValue : function () {
        var html = "<input data-value='description' />";

        var model = {
            description : "some description"
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("input");
        assertEquals("some description", el.getValue());
    },

    testNullValue : function () {
        var html = "<input data-value='description' />";

        var model = {
            description : null
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("input");
        assertNull(el.getValue());
    },

    testFormattedValue : function () {
        var html = "<input data-value='description' data-format='js.tests.dom.template.AttributeOperatorUnitTests.Format' />";

        var model = {
            description : {
                value : "VALUE"
            }
        };
        var doc = this.run(html, model);

        var el = doc.getByTag("input");
        assertEquals("value", el._node.value);
    },

    testBadTypeValueWithoutFormat : function () {
        var models = [ {}, [], function () {
        } ];
        var html = "<input data-value='.' />";
        for ( var i = 0; i < models.length; ++i) {
            assertAssertion(this, "run", html, models[i]);
        }
    },

    testAttrOnObject : function () {
        var html = "" + //
        "<div data-attr='title:description;'></div>" + //
        "<div data-attr='title:description;' data-object='inner'></div>" + //
        "<div data-attr='title:description;'></div>";

        var model = {
            description : "some description",
            inner : {
                description : "another desscription"
            }
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("div");
        assertEquals("some description", elist.item(0).getAttr("title"));
        assertEquals("some description", elist.item(1).getAttr("title"));
        assertEquals("some description", elist.item(2).getAttr("title"));
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
TestCase.register("js.tests.dom.template.AttributeOperatorUnitTests");

js.tests.dom.template.AttributeOperatorUnitTests.Format = function () {
    this.format = function (o) {
        return o.value.toLowerCase();
    };
};
