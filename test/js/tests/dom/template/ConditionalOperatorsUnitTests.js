$package("js.tests.template");

js.tests.template.ConditionalOperatorUnitTests = {
    testIfOperatorOnTrue : function () {
        var html = "<div data-if='flag'></div>";
        var model = {
            flag : true
        };
        var doc = this.run(html, model);
        assertFalse(doc.getByTag("div").hasCssClass("hidden"));
    },

    testIfOperatorOnFalse : function () {
        var html = "<div data-if='flag'></div>";
        var model = {
            flag : false
        };
        var doc = this.run(html, model);
        assertTrue(doc.getByTag("div").hasCssClass("hidden"));
    },

    testIfOperatorWithEmptyOperand : function () {
        var html = "<div data-if=''></div>";
        var model = {};
        try {
            run(bodyFragment, model);
            fail("Empty operand should rise templates exception.");
        } catch (e) {
            assertTrue("Invalid error message.", e.message.indexOf("Empty operand") !== -1);
        }
    },

    testNullIfValue : function () {
        var html = "<div data-if='fruit=APPLE'>apple</div>";
        var model = {
            fruit : null
        };
        var doc = this.run(html, model);
        assertTrue(doc.getByTag("div").hasCssClass("hidden"));
    },

    testNotIfOperatorOnTrue : function () {
        var html = "<div data-if='!flag'></div>";
        var model = {
            flag : true
        };
        var doc = this.run(html, model);
        assertTrue(doc.getByTag("div").hasCssClass("hidden"));
    },

    testNotIfOperatorOnFalse : function () {
        var html = "<div data-if='!flag'></div>";
        var model = {
            flag : false
        };
        var doc = this.run(html, model);
        assertFalse(doc.getByTag("div").hasCssClass("hidden"));
    },

    testIfElseEmulation : function () {
        var html = "" + //
        "<div data-if='flag'>IF</div>" + //
        "<div data-if='!flag'>ELSE</div>";
        var model = {};

        model.flag = true;
        var doc = this.run(html, model);
        var elist = doc.findByTag("div");
        assertFalse(elist.item(0).hasCssClass("hidden"));
        assertTrue(elist.item(1).hasCssClass("hidden"));

        model.flag = false;
        doc = this.run(html, model);
        elist = doc.findByTag("div");
        assertTrue(elist.item(0).hasCssClass("hidden"));
        assertFalse(elist.item(1).hasCssClass("hidden"));
    },

    testCaseEmulation : function () {
        var html = "" + //
        "<div data-if='fruit=APPLE'>apple</div>" + //
        "<div data-if='fruit=BANANA'>banana</div>";
        var model = {};

        model.fruit = "APPLE";
        var doc = this.run(html, model);
        var elist = doc.findByTag("div");
        assertFalse(elist.item(0).hasCssClass("hidden"));
        assertTrue(elist.item(1).hasCssClass("hidden"));

        model.fruit = "NONE";
        doc = this.run(html, model);
        elist = doc.findByTag("div");
        assertTrue(elist.item(0).hasCssClass("hidden"));
        assertTrue(elist.item(1).hasCssClass("hidden"));
    },

    testExcludeOperatorOnTrue : function () {
        var html = "" + //
        "<div data-exclude='true'>" + //
        "   <p data-text='fruit'></p>" + //
        "</div>";
        var model = {
            fruit : "APPLE"
        };
        var doc = this.run(html, model);
        assertEmpty(doc.getByCss("div p").getText());
    },

    testExcludeOperatorOnFalse : function () {
        var html = "" + //
        "<div class='hidden' data-exclude='false'>" + //
        "   <p data-text='fruit'></p>" + //
        "</div>";
        var model = {
            fruit : "APPLE"
        };
        var doc = this.run(html, model);
        assertEquals("APPLE", doc.getByCss("div p").getText());
    },

    testGotoOperator : function () {
        var html = "" + //
        "<div data-goto='section-one-id'>" + //
        "   <div>" + //
        "       <h1 data-text='fruit'></h1>" + //
        "   </div>" + //
        "   <div>" + //
        "       <div id='section-one-id'>" + //
        "           <h2 data-text='fruit'></h2>" + //
        "       </div>" + //
        "       <div>" + //
        "           <h3 data-text='fruit'></h3>" + //
        "       </div>" + //
        "   </div>" + //
        "</div>";

        var model = {
            fruit : "APPLE"
        };
        var doc = this.run(html, model);

        assertNotNull(new js.dom.Document(document).getById("section-one-id"));
        assertTrue(doc.getByTag("h1").getText().length === 0);
        assertEquals("APPLE", doc.getByTag("h2").getText());
        assertTrue(doc.getByTag("h3").getText().length === 0);
    },

    // ------------------------------------------------------
    // fixture initialization and helpers

    run : function (html, value) {
        document.getElementById("scratch-area").innerHTML = html;
        var doc = new js.dom.Document(document);
        var template = js.dom.template.Template.getInstance(doc);
        template.inject(value);
        return doc.getById("scratch-area");
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    }
};
TestCase.register("js.tests.template.ConditionalOperatorUnitTests");
