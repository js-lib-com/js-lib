$package("js.tests.dom");

js.tests.dom.Select = {
    before : function (html) {
        if (!html) {
            html = "<select id='select'>" + //
            "	<option value='APPLE'>apple</option>" + //
            "	<option value='PEAR'>pear</option>" + //
            "	<option value='GRAPES'>grapes</option>" + //
            "</select>";
        }
        document.getElementById("scratch-area").innerHTML = html;
        this.doc = new js.dom.Document(document);
        this.node = document.getElementById("select");
        this.el = this.doc.getById("select");

        js.net.XHR.loop = {
            "load-select" : [ {
                value : "ZERO",
                text : "zero"
            }, {
                value : "ONE",
                text : "one"
            } ]
        };
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        delete js.net.XHR.loop;
    },

    testConstructor : function () {
        assertClass("js.dom.Select");

        var noSelectNode = document.getElementById("scratch-area");
        assertAssertion(js.dom, "Select", this.doc, noSelectNode);
        $assert.disable();
        var el = new js.dom.Select(this.doc, noSelectNode);
        assertEquals(noSelectNode, el._node);
    },

    testGetIndex : function () {
        assertEquals(0, this.el.getIndex());
        var optionNode = document.querySelector("option[value='PEAR']");
        optionNode.selected = true;
        assertEquals(1, this.el.getIndex());
        optionNode.selected = false;
    },

    testGetOption : function () {
        // if no selection explicitly made consider first option
        var option = this.el._getOption();
        assertEquals("APPLE", option.value);
        assertEquals("apple", option.text);
        assertEquals("APPLE", this.el.getValue());
        assertEquals("apple", this.el.getText());
        assertTrue(this.el.equals("APPLE"));

        var optionNode = document.querySelector("option[value='PEAR']");
        optionNode.selected = true;
        option = this.el._getOption();
        assertEquals("PEAR", option.value);
        assertEquals("pear", option.text);
        assertEquals("PEAR", this.el.getValue());
        assertEquals("pear", this.el.getText());
        assertTrue(this.el.equals("PEAR"));

        html = "<select id='select'>" + //
        "	<option>apple</option>" + //
        "	<option>pear</option>" + //
        "	<option>grapes</option>" + //
        "</select>";
        this.before(html);
        option = this.el._getOption();
        assertEquals("apple", option.value);
        assertEquals("apple", option.text);
        assertEquals("apple", this.el.getValue());
        assertEquals("apple", this.el.getText());
        assertTrue(this.el.equals("apple"));

        optionNode = document.querySelectorAll("#scratch-area option").item(1);
        optionNode.selected = true;
        option = this.el._getOption();
        assertEquals("pear", option.value);
        assertEquals("pear", option.text);
        assertEquals("pear", this.el.getValue());
        assertEquals("pear", this.el.getText());
        assertTrue(this.el.equals("pear"));

        html = "<select id='select'></select>";
        this.before(html);
        option = this.el._getOption();
        assertNull(option.value);
        assertNull(option.text);
        assertNull(this.el.getValue());
        assertNull(this.el.getText());
        assertTrue(this.el.equals(null));
    },

    testLoad : function () {
        $package("comp.prj");
        comp.prj.SelectDao = {
            getSelect : function (callback, scope) {
                callback.call(scope, [ {
                    value : "ZERO",
                    text : "zero"
                }, {
                    value : "ONE",
                    text : "one"
                } ]);
            }
        };

        this.el.load(comp.prj.SelectDao, "getSelect");
        assertSize(2, this.node.options);
        assertEquals("ZERO", this.node.options[0].value);
        assertEquals("zero", this.node.options[0].text);
        assertEquals("ONE", this.node.options[1].value);
        assertEquals("one", this.node.options[1].text);
    },

    testDefaultOptions : function () {
        html = "<select id='select'>" + //
        "   <option class='default-option'>apple</option>" + //
        "   <option>pear</option>" + //
        "   <option>grapes</option>" + //
        "</select>";
        this.before(html);

        $package("comp.prj");
        comp.prj.SelectDao = {
            getSelect : function (callback, scope) {
                callback.call(scope, [ {
                    value : "ZERO",
                    text : "zero"
                }, {
                    value : "ONE",
                    text : "one"
                } ]);
            }
        };

        this.el.load(comp.prj.SelectDao, "getSelect");
        assertSize(3, this.node.options);
        assertEquals("apple", this.node.options[0].value);
        assertEquals("apple", this.node.options[0].text);
        assertEquals("ZERO", this.node.options[1].value);
        assertEquals("zero", this.node.options[1].text);
        assertEquals("ONE", this.node.options[2].value);
        assertEquals("one", this.node.options[2].text);
    },

    testReset : function () {
        var optionNode = document.querySelectorAll("#scratch-area option").item(1);
        optionNode.selected = true;
        assertEquals(1, this.node.selectedIndex);
        this.el.reset();
        assertEquals(0, this.node.selectedIndex);
    },

    testSetValue : function () {
        assertEquals(this.el, this.el.setValue("GRAPES"));
        assertTrue(this.el.equals("GRAPES"));

        html = "<select id='select'>" + //
        "	<option>apple</option>" + //
        "	<option>pear</option>" + //
        "	<option>grapes</option>" + //
        "</select>";
        this.before(html);
        this.el.setValue("GRAPES");
        assertTrue(this.el.equals("apple"));
        this.el.setValue("grapes");
        assertTrue(this.el.equals("grapes"));
    }
};
TestCase.register("js.tests.dom.Select");
