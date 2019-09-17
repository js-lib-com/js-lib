$package("js.tests.ua");

js.tests.ua.Page = {
    testPageCreation : function () {
        assertClass("js.ua.Page");

        var html = "" + //
        "<div id='person-id' data-object='.' data-class='user.space.Person'>" + //
        "	<h1 data-value='name'></h1>" + //
        "	<h2 data-value='profession'></h2>" + //
        "	<h3 data-value='birthday' data-format='js.format.ShortDate'></h3>" + //
        "</div>";
        document.getElementById("scratch-area").innerHTML = html;

        if (WinMain._events.hasListener("pre-dom-ready")) {
            WinMain._events.removeAllListeners("pre-dom-ready");
        }
        js.ua.Page._ctor = js.ua.Page;
        $package("user.space");

        user.space.Person = function (ownerDoc, node) {
            this.$super(ownerDoc, node);
        };
        $extends(user.space.Person, js.dom.Element);

        user.space.Page = function () {
            this.$super();
        };
        user.space.Page.prototype = {
            bindings : function () {
                return {
                    "#person-id" : "user.space.Person",
                    "#person-id h3" : "js.format.ShortDate"
                };
            },
            userSpaceMethod : function () {
            },
            toString : function () {
                return "user.space.Page";
            }
        };
        $extends(user.space.Page, js.ua.Page);
        WinMain.page = null;
        WinMain._events.fire("pre-dom-ready");

        var page = WinMain.page;
        assertTrue(typeof page !== "undefined");
        assertTrue(page instanceof user.space.Page);
        assertEquals("user.space.Page", page.toString());
        assertTrue(typeof page.userSpaceMethod === "function");

        assertTrue(WinMain.doc.getById("person-id") instanceof user.space.Person);
        assertTrue(WinMain.doc.getById("person-id") instanceof js.dom.Element);
        assertEquals("js.format.ShortDate", document.querySelector("#person-id h3").getAttribute("data-format"));

        var n = document.getElementById("scratch-area");
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testPageInheritance : function () {
        if (WinMain._events.hasListener("pre-dom-ready")) {
            WinMain._events.removeAllListeners("pre-dom-ready");
        }
        js.ua.Page._ctor = js.ua.Page;
        var probe = 0;

        $package("user.space");

        user.space.BasePage = function () {
            this.$super();
            probe += 11;
        };
        user.space.BasePage.prototype = {
            baseMethod : function () {
            },
            toString : function () {
                return "user.space.BasePage";
            }
        };
        $extends(user.space.BasePage, js.ua.Page);

        user.space.Page = function () {
            this.$super();
            probe += 37;
        };
        user.space.Page.prototype = {
            method : function () {
            },
            toString : function () {
                return "user.space.Page";
            }
        };
        $extends(user.space.Page, user.space.BasePage);
        WinMain.page = null;
        WinMain._events.fire("pre-dom-ready");

        var page = WinMain.page;
        assertEquals(48, probe);
        assertTrue(typeof page !== "undefined");
        assertTrue(page instanceof user.space.Page);
        assertTrue(page instanceof user.space.BasePage);
        assertEquals("user.space.Page", page.toString());
        assertTrue(typeof page.baseMethod === "function");
        assertTrue(typeof page.method === "function");
    }
};
TestCase.register("js.tests.ua.Page");
