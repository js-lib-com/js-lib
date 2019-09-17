$package("js.tests.dom");

$include("js.dom.Form");
$include("js.format.ShortDate");

js.tests.dom.FormUnitTests = {
    _doc : null,
    _root : null,

    beforeClass : function () {
        this._doc = new js.dom.Document(document);
        this._root = this._doc.getById("scratch-area");

        js.format.DateFormatSymbols._symbols = {
            patterns : {
                fullDate : 'EEEE, MMMM dd, yyyy',
                fullTime : 'hh:mm:ss a Z',
                longDate : 'MMMM dd, yyyy',
                longTime : 'hh:mm:ss a Z',
                mediumDate : 'MMM dd, yyyy',
                mediumTime : 'hh:mm:ss a',
                shortDate : 'M/d/yy',
                shortTime : 'hh:mm a'
            },

            fullMonths : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
            shortMonths : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
            fullWeekDays : [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            shortWeekDays : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
            tinyWeekDays : [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ]
        };
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testConstructor : function () {
        assertClass("js.dom.Form");
    },

    testSetFlatObject : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' />" + //
        "   <input name='surname' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        form.setObject({
            firstName : "John",
            surname : "Doe"
        });
        var controls = form.getChildren();
        assertEquals("John", controls.item(0).getValue());
        assertEquals("Doe", controls.item(1).getValue());
    },

    testGetFlatObject : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' value='Doe' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        var object = form.getObject();
        assertEquals("John", object.firstName);
        assertEquals("Doe", object.surname);
    },

    testFormValidation : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' />" + //
        "   <input name='age' class='optional' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        assertFalse(form.isValid());

        var controls = form.findByTag("input");
        assertEquals(3, controls.size());
        assertFalse(controls.item(0).hasCssClass("invalid"));
        assertTrue(controls.item(1).hasCssClass("invalid"));
        assertFalse(controls.item(2).hasCssClass("invalid"));
    },

    testPositiveFocus : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' autofocus='autofocus' />" + //
        "   <input name='age' class='optional' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        assertEquals(form, form.focus());
        assertEquals("surname", this._doc.getDocument().activeElement.getAttribute("name"));
    },

    testNegativeFocus : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' />" + //
        "   <input name='age' class='optional' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        assertEquals(form, form.focus());
        if (js.ua.Engine.TRIDENT) {
            assertNull(this._doc.getDocument().activeElement);
        }
        else {
            assertEquals("body", this._doc.getDocument().activeElement.nodeName.toLowerCase());
        }
    },

    testReset : function (context) {
        context.push("js.dom.Control.prototype.reset");

        var probe = 0;
        js.dom.Control.prototype.reset = function () {
            ++probe;
        };

        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' autofocus='autofocus' />" + //
        "   <input name='age' class='optional' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");

        assertEquals(form, form.reset());
        assertEquals(3, probe);
        assertEquals("surname", this._doc.getDocument().activeElement.getAttribute("name"));
    },

    testToFormData : function (context) {
        if (typeof FormData === "undefined") {
            // there are browsers not supporting FormData
            return;
        }

        context.push("FormData.prototype.append");

        var map = {};
        FormData.prototype.append = function (name, value) {
            map[name] = value;
        };

        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "   <input name='surname' value='Doe' />" + //
        "   <input name='birthDate' value='3/15/64' data-format='js.format.ShortDate' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");
        form.addHidden("weight", 103);

        var formData = form.toFormData();
        assertTrue(formData instanceof FormData);
        assertEquals("John", map["firstName"]);
        assertEquals("Doe", map["surname"]);
        // some browsers include milliseconds some not
        assertEquals("1964-03-14T22:00:00", map["birthDate"].substr(0, 19));
        assertEquals("103", map["weight"]);
    },

    testAddHidden : function () {
        var html = "" + //
        "<form>" + //
        "   <input name='firstName' value='John' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");

        assertEquals(1, form.getChildren().size());
        var hidden = form.addHidden("weight", 103);
        assertNotNull(hidden);
        assertEquals("weight", hidden.getAttr("name"));
        assertEquals("103", hidden.getAttr("value"));

        assertEquals(2, form.getChildren().size());
        assertEquals(hidden, form.getFirstChild());
    },

    testAddExistingHidden : function () {
        var html = "" + //
        "<form>" + //
        "   <input type='hidden' name='weight' value='103' />" + //
        "   <input name='firstName' value='John' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");

        assertEquals(2, form.getChildren().size());
        var hidden = form.addHidden("weight", 99);
        assertNotNull(hidden);
        assertEquals("weight", hidden.getAttr("name"));
        assertEquals("99", hidden.getAttr("value"));

        assertEquals(2, form.getChildren().size());
        assertEquals(hidden, form.getFirstChild());
    },

    testRemoveHidden : function () {
        var html = "" + //
        "<form>" + //
        "   <input type='hidden' name='weight' value='103' />" + //
        "   <input name='firstName' value='John' />" + //
        "</form>";
        this._root.setHTML(html);
        var form = this._doc.getByCss("#scratch-area form");

        assertEquals(2, form.getChildren().size());
        assertEquals(form, form.removeHidden("weight"));
        assertEquals(1, form.getChildren().size());

        assertAssertion(form, "removeHidden", "weight");
        assertAssertion(form, "removeHidden", "firstName");

        $assert.disable();
        assertEquals(form, form.removeHidden("weight"));
        assertEquals(form, form.removeHidden("firstName"));
        assertEquals(1, form.getChildren().size());
    }
};
TestCase.register("js.tests.dom.FormUnitTests");
