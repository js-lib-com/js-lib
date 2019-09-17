$package("js.tests.dom");

$include("js.dom.Control");

js.tests.dom.Control = {
    before : function (html) {
        this.scratchArea = document.getElementById("scratch-area");
        this.scratchArea.innerHTML = "<input type='text' id='control' />";
        this.node = document.getElementById("control");
        var doc = new js.dom.Document(document);
        this.control = doc.getById("control");
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testConstructor : function () {
        assertClass("js.dom.Control");
        assertEquals(this.node, this.control._node);
    },

    testGetName : function () {
        this.scratchArea.innerHTML = "<input name='user-name' type='text' id='control' />";
        var control = $E("#control");
        assertEquals("user-name", control.getName());
    },

    testGetDataName : function () {
        this.scratchArea.innerHTML = "<input data-name='user-name' type='text' id='control' />";
        var control = $E("#control");
        assertEquals("user-name", control.getName());
    },

    testGetMissingName : function () {
        this.scratchArea.innerHTML = "<input type='text' id='control' />";
        var control = $E("#control");
        assertAssertion(control, "getName");
        $assert.disable();
        assertNull(control.getName());
    },

    testGetBothNames : function () {
        this.scratchArea.innerHTML = "<input name='user-name' data-name='person-name' type='text' id='control' />";
        var control = $E("#control");
        assertAssertion(control, "getName");
        $assert.disable();
        assertEquals("user-name", control.getName());
    },

    testSetValue : function (context) {
        var MockFormat = {
            probe : 0,
            format : function (value) {
                this.probe++;
                return "formatted-value";
            }
        };

        assertEquals(this.control, this.control.setValue("value"));
        assertEquals("value", this.node.value);

        this.control._format = MockFormat;
        assertEquals(this.control, this.control.setValue("value"));
        assertEquals("formatted-value", this.node.value);
        assertEquals(1, MockFormat.probe);

        // format returning non-string should assert or call toString
        MockFormat.format = function () {
            return 3.14;
        };
        this.control.setValue("value");
        assertEquals("3.14", this.node.value);

        // set to undefined should assert or do nothing
        $assert.enable();
        assertAssertion(this.control, "setValue");
        assertEquals("3.14", this.node.value);
        $assert.disable();
        this.control.setValue();
        assertEquals("3.14", this.node.value);
    },

    testSetNonStringPrimitive : function () {
        // set non-string primitive should call toString, if formatter is missing
        this.control.setValue(1234.56);
        assertEquals("1234.56", this.node.value);
        this.control.setValue(true);
        assertEquals("true", this.node.value);
    },

    testSetNonPrimitive : function () {
        // set non-primitive should assert or call toString
        var object = {
            toString : function () {
                return "object";
            }
        };
        $assert.enable();
        assertAssertion(this.control, "setValue", object);
        $assert.disable();
        this.control.setValue(object);
        assertEquals("object", this.node.value);
    },

    testSetNullValue : function () {
        this.control.setValue("test-value");
        assertEquals("test-value", this.node.value);
        this.control.setValue(null);
        assertEmpty(this.node.value);
    },

    testSetMultipleValues : function () {
        this.control.setAttr("multiple", "multiple");
        assertEquals(this.control, this.control.setValue([ 1, 2, 3 ]));
        assertEquals("1,2,3", this.node.value);
        assertEquals(this.control, this.control.setValue([ "iulian@gnotis.ro", "mr.iulianrotaru@yahoo.com" ]));
        assertEquals("iulian@gnotis.ro,mr.iulianrotaru@yahoo.com", this.node.value);
    },

    testSetEmptyMultipleValues : function (context) {
        this.control.setAttr("multiple", "multiple");
        assertEquals(this.control, this.control.setValue([ 1, 2, 3 ]));
        assertEquals("1,2,3", this.node.value);
        this.control.setValue([]);
        assertEmpty(this.node.value);
    },

    testGetValue : function () {
        var MockFormat = {
            probe : 0,
            parse : function (value) {
                this.probe++;
                return "parsed-value";
            }
        };

        assertNull(this.control.getValue());
        this.control._format = MockFormat;
        assertEquals("parsed-value", this.control.getValue());
        assertEquals(1, MockFormat.probe);

        MockFormat.probe = 0;
        this.control._format = null;
        this.node.value = "value";
        assertEquals("value", this.control.getValue());
        this.control._format = MockFormat;
        assertEquals("parsed-value", this.control.getValue());
        assertEquals(1, MockFormat.probe);
    },

    testGetMultipleValues : function () {
        this.control.setAttr("multiple", "multiple");
        this.node.value = "iulian@gnotis.ro , mr.iulianrotaru@yahoo.com";

        var values = this.control.getValue();
        assertEquals(2, values.length);
        assertEquals("iulian@gnotis.ro", values[0]);
        assertEquals("mr.iulianrotaru@yahoo.com", values[1]);
    },

    testGetFormattedMultipleValues : function () {
        var MockFormat = {
            probe : 0,
            parse : function (value) {
                this.probe++;
                return "mailto:" + value;
            }
        };
        this.control._format = MockFormat;
        this.control.setAttr("multiple", "multiple");
        this.node.value = "iulian@gnotis.ro , mr.iulianrotaru@yahoo.com";

        var values = this.control.getValue();
        assertEquals(2, values.length);
        assertEquals("mailto:iulian@gnotis.ro", values[0]);
        assertEquals("mailto:mr.iulianrotaru@yahoo.com", values[1]);
        assertEquals(2, MockFormat.probe);
    },

    testReset : function () {
        assertEquals(this.control, this.control.reset());
        assertEmpty(this.node.value);
        this.node.value = "value";
        assertEquals(this.control, this.control.reset());
        assertEmpty(this.node.value);
    },

    testIsValid : function () {
        var MockFormat = {
            probe : 0,
            test : function (value) {
                this.probe++;
                return value === "value";
            }
        };

        assertFalse(this.control.isValid());
        assertTrue(this.control.hasCssClass("invalid"));

        this.control._format = MockFormat;
        assertFalse(this.control.isValid());
        assertTrue(this.control.hasCssClass("invalid"));
        assertEquals(1, MockFormat.probe);

        MockFormat.probe = 0;
        this.control._format = null;
        this.node.value = "value";

        assertTrue(this.control.isValid());
        assertFalse(this.control.hasCssClass("invalid"));

        this.control._format = MockFormat;
        assertTrue(this.control.isValid());
        assertFalse(this.control.hasCssClass("invalid"));
        assertEquals(1, MockFormat.probe);
    },

    testFocus : function () {
        this.control.addCssClass("invalid");
        assertEquals(this.control, this.control.focus());
        assertFalse(this.control.hasCssClass("invalid"));
        assertEquals(this.node, document.activeElement);
    },

    testForEachItem : function () {
        this.scratchArea.innerHTML = "<input name='fruits' value='apple,pear,banana' multiple='multiple' />";
        var control = $E("input[name=fruits]");

        var items = [];
        control.forEachItem(function (item) {
            items.push(item);
        });

        assertEquals(3, items.length);
        assertEquals("fruits.0", items[0].name);
        assertEquals("apple", items[0].value);
        assertEquals("fruits.1", items[1].name);
        assertEquals("pear", items[1].value);
        assertEquals("fruits.2", items[2].name);
        assertEquals("banana", items[2].value);
    },

    /**
     * Comma separated values but not multiple attribute. For each has a single iteration with control name and value,
     * value is as it is, including comma.
     */
    testForEachItemOnSingleValue : function () {
        this.scratchArea.innerHTML = "<input name='fruits' value='apple,pear,banana' />";
        var control = $E("input[name=fruits]");

        var items = [];
        control.forEachItem(function (item) {
            items.push(item);
        });

        assertEquals(1, items.length);
        assertEquals("fruits", items[0].name);
        assertEquals("apple,pear,banana", items[0].value);
    }
};
TestCase.register("js.tests.dom.Control");
