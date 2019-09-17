$package("js.tests.lang");

js.tests.lang.ClassUnitTests = {
    testForName : function (context) {
        var clazz = js.lang.Class.forName("js.tests.lang.MockClass");
        assertNotNull(clazz);
        assertEquals(clazz, js.lang.Class._cache["js.tests.lang.MockClass"]);
        var instance = new clazz();
        assertEquals("js.tests.lang.MockClass", instance.toString());

        context.push("js.lang.Class._loadClass");
        var probe = 0;
        js.lang.Class._loadClass = function () {
            ++probe;
            return null;
        };
        assertNull(js.lang.Class.forName("js.tests.fake.MockClass"));
        assertNull(js.lang.Class.forName("js.tests.lang.FakeClass"));
        assertEquals(2, probe);
    },

    testForNameAssertion : function () {
        [ undefined, null, "", true, 1234, new Date(), function () {
        } ].forEach(function (className) {
            assertAssertion(js.lang.Class, "forName", className);
        });
    },

    testLoad : function (context) {
        context.push("XMLHttpRequest");

        var xhr = {
            timeout : 0,
            method : null,
            url : null,
            async : null,
            headers : {},
            data : null,

            responseText : "$package('comp.prj');" + //
            "comp.prj.Class=function(){};" + //
            "comp.prj.Class.prototype={" + //
            "toString:function(){" + //
            "return 'comp.prj.Class'}};",

            open : function (method, url, async) {
                this.method = method;
                this.url = url;
                this.async = async;
            },

            setRequestHeader : function (name, value) {
                this.headers[name] = value;
            },

            send : function (data) {
                this.data = data;
            }
        };

        XMLHttpRequest = function () {
            return xhr;
        };

        var clazz = js.lang.Class.forName("comp.prj.Class");

        assertEquals(4000, xhr.timeout);
        assertEquals("POST", xhr.method);
        assertEquals("js/core/JsClassLoader/loadClass.rmi", xhr.url);
        assertFalse(xhr.async);
        assertEquals("application/json; charset=UTF-8", xhr.headers["Content-Type"]);
        assertEquals("text/javascript", xhr.headers["Accept"]);
        assertEquals('"comp.prj.Class"', xhr.data);

        assertNotNull(clazz);
        assertTrue(typeof clazz === "function");

        var instance = new comp.prj.Class();
        assertEquals("comp.prj.Class", instance.toString());
    },

    testToString : function () {
        assertEquals("js.lang.Class", js.lang.Class.toString());
    }
};
TestCase.register("js.tests.lang.ClassUnitTests");

js.tests.lang.MockClass = function () {
};

js.tests.lang.MockClass.prototype = {
    toString : function () {
        return "js.tests.lang.MockClass";
    }
};
