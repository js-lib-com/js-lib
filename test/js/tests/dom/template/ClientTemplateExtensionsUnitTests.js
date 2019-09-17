$package("js.tests.template");

js.tests.template.ClientTemplateExtensionsUnitTests = {
    testPrimitiveCaseOperator : function () {
        var html = "" + //
        "<div data-if='.=APPLE'>apple</div>" + //
        "<div data-if='.=BANANA'>banana</div>";

        var doc = this.run(html, "APPLE");
        var elist = doc.findByTag("div");
        assertFalse(elist.item(0).hasCssClass("hidden"));
        assertTrue(elist.item(1).hasCssClass("hidden"));

        doc = this.run(html, "NONE");
        elist = doc.findByTag("div");
        assertTrue(elist.item(0).hasCssClass("hidden"));
        assertTrue(elist.item(1).hasCssClass("hidden"));
    },

    // ------------------------------------------------------
    // fixture initialization and helpers

    run : function (html, value) {
        document.getElementById("scratch-area").innerHTML = html;
        var doc = new js.dom.Document(document);
        var root = doc.getById("scratch-area");
        var template = js.dom.template.Template.getInstance(doc);
        template.inject(value);
        return root;
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    }
};
TestCase.register("js.tests.template.ClientTemplateExtensionsUnitTests");
