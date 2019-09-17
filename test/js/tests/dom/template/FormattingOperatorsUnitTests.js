$package("js.tests.dom.template");

$include("js.dom.Control");

js.tests.dom.template.FormattingOperatorsUnitTests = {
    testArabicNumeralNumbering : function () {
        var indexFormatClass = js.dom.template.ArabicNumeralNumbering;
        var expectedValues = "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20";
        this._runNumberingFormatTest(indexFormatClass, expectedValues);
    },

    testLowerCaseRomanNumbering : function () {
        var indexFormatClass = js.dom.template.LowerCaseRomanNumbering;
        var expectedValues = "i ii iii iv v vi vii viii ix x xi xii xiii xiv xv xvi xvii xviii xix xx xxi xxii xxiii xxiv xxv xxvi xxvii xxviii xxix xxx";
        this._runNumberingFormatTest(indexFormatClass, expectedValues);

        var indexes = "49 50 51 99 100 101 399 400 401 499 500 501 899 900 901 999 1000 1001".split(" ");
        var values = "xlix l li xcix c ci cccxcix cd cdi cdxcix d di dcccxcix cm cmi cmxcix m mi".split(" ");
        var indexFormat = new indexFormatClass;
        for ( var i = 0; i < indexes.length; ++i) {
            assertEquals(values[i], indexFormat.format(indexes[i]));
        }
    },

    testUpperCaseRomanNumbering : function () {
        var indexFormatClass = js.dom.template.UpperCaseRomanNumbering;
        var expectedValues = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI XXVII XXVIII XXIX XXX";
        this._runNumberingFormatTest(indexFormatClass, expectedValues);

        var indexes = "49 50 51 99 100 101 399 400 401 499 500 501 899 900 901 999 1000 1001".split(" ");
        var values = "XLIX L LI XCIX C CI CCCXCIX CD CDI CDXCIX D DI DCCCXCIX CM CMI CMXCIX M MI".split(" ");
        var indexFormat = new indexFormatClass;
        for ( var i = 0; i < indexes.length; ++i) {
            assertEquals(values[i], indexFormat.format(indexes[i]));
        }
    },

    testLowerCaseStringNumbering : function () {
        var indexFormatClass = js.dom.template.LowerCaseStringNumbering;
        var expectedValues = "a b c d e f g h i j k l m n o p q r s t u v w x y z aa bb cc dd ee ff gg hh ii jj kk ll mm nn oo pp qq rr ss tt uu vv ww xx yy zz aaa bbb";
        this._runNumberingFormatTest(indexFormatClass, expectedValues);
    },

    testUpperCaseStringNumbering : function () {
        var indexFormatClass = js.dom.template.UpperCaseStringNumbering;
        var expectedValues = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z AA BB CC DD EE FF GG HH II JJ KK LL MM NN OO PP QQ RR SS TT UU VV WW XX YY ZZ AAA BBB";
        this._runNumberingFormatTest(indexFormatClass, expectedValues);
    },

    _runNumberingFormatTest : function (indexFormatClass, expectedValues) {
        var indexFormat = new indexFormatClass;
        expectedValues = expectedValues.split(" ");
        var index = 1;
        for ( var i = 0; i < expectedValues.length; ++i) {
            assertEquals(expectedValues[i], indexFormat.format(index++));
        }
    },

    testListNumberingWithArabicNumeral : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%n'></h1>" + //
        "       <h2 data-text='.'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ "item1", "item2", "item3" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h1");
        assertEquals(3, elist.size());
        assertEquals("1", elist, 0);
        assertEquals("2", elist, 1);
        assertEquals("3", elist, 2);
    },

    testMapNumberingWithArabicNumeral : function () {
        var html = "" + //
        "<dl data-omap='.'>" + //
        "   <dt><span data-numbering='%n.'></span> <span data-text='.'></span></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            key0 : "value0",
            key1 : "value1",
            key2 : "value2"
        };
        var doc = this.run(html, model);

        var elist = doc.findByCss("dt span:first-child");
        assertEquals(3, elist.size());
        assertEquals("1.", elist, 0);
        assertEquals("2.", elist, 1);
        assertEquals("3.", elist, 2);
    },

    testListNumberingWithLowerCaseRoman : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%i'></h1>" + //
        "       <h2 data-text='.'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ "item1", "item2", "item3" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h1");
        assertEquals(3, elist.size());
        assertEquals("i", elist, 0);
        assertEquals("ii", elist, 1);
        assertEquals("iii", elist, 2);
    },

    testMapNumberingWithLowerCaseRoman : function () {
        var html = "" + //
        "<dl data-omap='.'>" + //
        "   <dt><span data-numbering='%i'></span> <span data-text='.'></span></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            key0 : "value0",
            key1 : "value1",
            key2 : "value2"
        };
        var doc = this.run(html, model);

        var elist = doc.findByCss("dt span:first-child");
        assertEquals(3, elist.size());
        assertEquals("i", elist, 0);
        assertEquals("ii", elist, 1);
        assertEquals("iii", elist, 2);
    },

    testListNumberingWithUpperCaseRoman : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%I'></h1>" + //
        "       <h2 data-text='.'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ "item1", "item2", "item3" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h1");
        assertEquals(3, elist.size());
        assertEquals("I", elist, 0);
        assertEquals("II", elist, 1);
        assertEquals("III", elist, 2);
    },

    testMapNumberingWithUpperCaseRoman : function () {
        var html = "" + //
        "<dl data-omap='.'>" + //
        "   <dt><span data-numbering='%I'></span> <span data-text='.'></span></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            key0 : "value0",
            key1 : "value1",
            key2 : "value2"
        };
        var doc = this.run(html, model);

        var elist = doc.findByCss("dt span:first-child");
        assertEquals(3, elist.size());
        assertEquals("I", elist, 0);
        assertEquals("II", elist, 1);
        assertEquals("III", elist, 2);
    },

    testListNumberingWithLowerCaseString : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%s'></h1>" + //
        "       <h2 data-text='.'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ "item1", "item2", "item3" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h1");
        assertEquals(3, elist.size());
        assertEquals("a", elist, 0);
        assertEquals("b", elist, 1);
        assertEquals("c", elist, 2);
    },

    testMapNumberingWithLowerCaseString : function () {
        var html = "" + //
        "<dl data-omap='.'>" + //
        "   <dt><span data-numbering='%s'></span> <span data-text='.'></span></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            key0 : "value0",
            key1 : "value1",
            key2 : "value2"
        };
        var doc = this.run(html, model);

        var elist = doc.findByCss("dt span:first-child");
        assertEquals(3, elist.size());
        assertEquals("a", elist, 0);
        assertEquals("b", elist, 1);
        assertEquals("c", elist, 2);
    },

    testListNumberingWithUpperCaseString : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%S'></h1>" + //
        "       <h2 data-text='.'></h2>" + //
        "   </li>" + //
        "</ul>";

        var model = [ "item1", "item2", "item3" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("h1");
        assertEquals(3, elist.size());
        assertEquals("A", elist, 0);
        assertEquals("B", elist, 1);
        assertEquals("C", elist, 2);
    },

    testMapNumberingWithUpperCaseString : function () {
        var html = "" + //
        "<dl data-omap='.'>" + //
        "   <dt><span data-numbering='%S'></span> <span data-text='.'></span></dt>" + //
        "   <dd></dd>" + //
        "</dl>";

        var model = {
            key0 : "value0",
            key1 : "value1",
            key2 : "value2"
        };
        var doc = this.run(html, model);

        var elist = doc.findByCss("dt span:first-child");
        assertEquals(3, elist.size());
        assertEquals("A", elist, 0);
        assertEquals("B", elist, 1);
        assertEquals("C", elist, 2);
    },

    testThreeLevelsNestedNumbering : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%I'></h1>" + //
        "       <ul data-olist='.'>" + //
        "           <li>" + //
        "               <h2 data-numbering='%I.%S'></h2>" + //
        "               <ul data-olist='.'>" + //
        "                   <li>" + //
        "                       <h3 data-numbering='%I.%S.%n'></h3>" + //
        "                   </li>" + //
        "               </ul>" + //
        "           </li>" + //
        "       </ul>" + //
        "   </li>" + //
        "</ul>";

        var model = [ [ [ 0, 1 ], [ 2, 3 ] ], [ [ 4, 5 ], [ 6, 7 ] ] ];
        var doc = this.run(html, model);

        var elist = doc.findByCss("h1");
        assertEquals(2, elist.size());
        assertEquals("I", elist, 0);
        assertEquals("II", elist, 1);
        elist = doc.findByCss("h2");
        assertEquals(4, elist.size());
        assertEquals("I.A", elist, 0);
        assertEquals("I.B", elist, 1);
        assertEquals("II.A", elist, 2);
        assertEquals("II.B", elist, 3);
        elist = doc.findByCss("h3");
        assertEquals(8, elist.size());
        assertEquals("I.A.1", elist, 0);
        assertEquals("I.A.2", elist, 1);
        assertEquals("I.B.1", elist, 2);
        assertEquals("I.B.2", elist, 3);
        assertEquals("II.A.1", elist, 4);
        assertEquals("II.A.2", elist, 5);
        assertEquals("II.B.1", elist, 6);
        assertEquals("II.B.2", elist, 7);
    },

    testUnorderListBetweenOrdered : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li>" + //
        "       <h1 data-numbering='%I'></h1>" + //
        "       <ul data-list='.'>" + //
        "           <li>" + //
        "               <h2></h2>" + //
        "               <ul data-olist='.'>" + //
        "                   <li>" + //
        "                       <h3 data-numbering='%I.%S'></h3>" + //
        "                   </li>" + //
        "               </ul>" + //
        "           </li>" + //
        "       </ul>" + //
        "   </li>" + //
        "</ul>";

        var model = [ [ [ 0, 1 ], [ 2, 3 ] ], [ [ 4, 5 ], [ 6, 7 ] ] ];
        var doc = this.run(html, model);

        var elist = doc.findByCss("h1");
        assertEquals(2, elist.size());
        assertEquals("I", elist, 0);
        assertEquals("II", elist, 1);
        elist = doc.findByCss("h2");
        assertEquals(4, elist.size());
        elist = doc.findByCss("h3");
        assertEquals(8, elist.size());
        assertEquals("I.A", elist, 0);
        assertEquals("I.B", elist, 1);
        assertEquals("I.A", elist, 2);
        assertEquals("I.B", elist, 3);
        assertEquals("II.A", elist, 4);
        assertEquals("II.B", elist, 5);
        assertEquals("II.A", elist, 6);
        assertEquals("II.B", elist, 7);
    },

    testComplexNumbering : function () {
        var html = "" + //
        "<h1 data-text='title'></h1>" + //
        "<table>" + //
        "    <tbody data-olist='list'>" + //
        "        <tr>" + //
        "            <td>" + //
        "                <h2 data-numbering='D.2.%s)'></h2>" + //
        "                <p data-text='title'></p>" + //
        "                <ul data-olist='list'>" + //
        "                    <li>" + //
        "                        <h3 data-numbering='%S.%I'></h3>" + //
        "                        <p data-text='title'></p>" + //
        "                        <h4 data-numbering='%n'></h4>" + //
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
                }, {
                    title : "title12"
                }, {
                    title : "title13"
                } ]
            } ]
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("h2");
        assertEquals(2, elist.size());
        assertEquals("D.2.a)", elist, 0);
        assertEquals("D.2.b)", elist, 1);

        elist = doc.findByTag("h3");
        assertEquals(6, elist.size());
        assertEquals("A.I", elist, 0);
        assertEquals("A.II", elist, 1);
        assertEquals("B.I", elist, 2);
        assertEquals("B.II", elist, 3);
        assertEquals("B.III", elist, 4);
        assertEquals("B.IV", elist, 5);

        elist = doc.findByTag("h4");
        assertEquals(6, elist.size());
        assertEquals("1", elist, 0);
        assertEquals("2", elist, 1);
        assertEquals("1", elist, 2);
        assertEquals("2", elist, 3);
        assertEquals("3", elist, 4);
        assertEquals("4", elist, 5);
    },

    testTextFormat : function () {
        var html = "<div data-text='title' data-format='js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator'></div>";
        var model = {
            title : "John Doe"
        };
        var doc = this.run(html, model);
        assertEquals("JOHN DOE", doc.getByTag("div").getText());
    },

    testValueFormat : function () {
        var html = "<input data-value='title' data-format='js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator' />";
        var model = {
            title : "John Doe"
        };
        var doc = this.run(html, model);
        assertEquals("JOHN DOE", doc.getByTag("input")._node.value);
    },

    testListItemFormat : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "    <li data-format='js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator'></li>" + //
        "</ul>";

        var model = [ "John Doe", "Maximus Decimus Meridius" ];
        var doc = this.run(html, model);

        var elist = doc.findByTag("li");
        assertEquals(2, elist.size());
        assertEquals("JOHN DOE", elist, 0);
        assertEquals("MAXIMUS DECIMUS MERIDIUS", elist, 1);
    },

    testMapValueFormat : function () {
        var html = "" + //
        "<dl data-map='.'>" + //
        "   <dd></dd>" + //
        "   <dt data-format='js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator'></dt>" + //
        "</dl>";

        var model = {
            key0 : "John Doe",
            key1 : "Maximus Decimus Meridius"
        };
        var doc = this.run(html, model);

        var elist = doc.findByTag("dt");
        assertEquals(2, elist.size());
        assertEquals("JOHN DOE", elist, 0);
        assertEquals("MAXIMUS DECIMUS MERIDIUS", elist, 1);
    },

    testFormatClassNotFound : function () {
        var html = "<input data-value='title' data-format='js.test.dom.template.FakeFormat' />";
        try {
            run(bodyFragment, new Pojo("John Doe"));
            fail("Formatting class not found should rise templates exception.");
        } catch (e) {
            assertTrue("Unexpected error message", e.message.indexOf("not found") !== -1);
        }
    },

    testNumberingInsideUnorderedList : function () {
        var html = "" + //
        "<ul data-list='.'>" + //
        "   <li data-numbering='%n'></li>" + //
        "</ul>";
        assertAssertion(this, "run", html, [ 1, 2, 3 ]);
    },

    testNumberingOutsideList : function () {
        var html = "" + //
        "<ul>" + //
        "   <li data-numbering='%n'></li>" + //
        "</ul>";
        assertAssertion(this, "run", html, []);
    },

    testNumberingWithoutFormatCode : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li data-numbering='abc'></li>" + //
        "</ul>";
        var doc = this.run(html, [ 1, 2 ]);

        var elist = doc.findByTag("li");
        assertEquals(2, elist.size());
        assertEquals("abc", elist, 0);
        assertEquals("abc", elist, 1);
    },

    testInvalidNumberingFormatCode : function () {
        var html = "" + //
        "<ul data-olist='.'>" + //
        "   <li data-numbering='%Q'></li>" + //
        "</ul>";
        assertAssertion(this, "run", html, [ 1, 2, 3 ]);
    },

    // ------------------------------------------------------
    // fixture initialization and helpers

    run : function (html, content) {
        document.getElementById("scratch-area").innerHTML = html;
        var doc = new js.dom.Document(document);
        var template = js.dom.template.Template.getInstance(doc);
        template.inject(content);
        return doc.getById("scratch-area");
    },

    after : function () {
        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    }
};
TestCase.register("js.tests.dom.template.FormattingOperatorsUnitTests");

js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator = function () {
};

js.tests.dom.template.FormattingOperatorsUnitTests.UpperDecorator.prototype = {
    format : function (value) {
        return value.toUpperCase();
    },

    parse : function () {
    },

    test : function () {
    }
};

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
