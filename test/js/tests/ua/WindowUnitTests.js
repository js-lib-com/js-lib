$package("js.tests.ua");

js.tests.ua.WindowUnitTests = {
    testConstructor : function () {
        var mockNativeWindow = {
            onorientationchange : null,
            document : {
                nodeType : Node.DOCUMENT_NODE,
                getElementById : function (id) {
                    return {
                        onreadystatechange : null
                    };
                },
                getElementsByTagName : function (tagName) {
                    return null;
                },
                write : function (text) {
                },
                addEventListener : function () {
                }
            },
            location : {
                toString : function () {
                    return "http://js-lib.com";
                }
            },
            addEventListener : function () {
            }
        };

        if (!document.addEventListener) {
            mockNativeWindow.attachEvent = function () {
            };
            mockNativeWindow.document.attachEvent = function () {
            };
        }
        if (!document.documentElement) {
            mockNativeWindow.document.documentElement = {};
        }

        // first window initialization phase is on constructor
        var w = new js.ua.Window(mockNativeWindow);

        assertTrue(typeof w._id !== "undefined");
        assertNull(w._parent);
        assertEquals(w._window, mockNativeWindow);
        assertNull(w.doc);
        assertNull(w.page);
        assertNull(w._dependentChildWindows);
        assertEquals(js.ua.Window.State.CREATED, w._state);

        assertTrue(w._events instanceof js.event.CustomEvents);
        assertTrue("pre-dom-ready" in w._events._events);
        assertTrue("dom-ready" in w._events._events);
        assertTrue("load" in w._events._events);
        assertTrue("pre-unload" in w._events._events);
        assertTrue("unload" in w._events._events);
        assertTrue("orientation-change" in w._events._events);

        // trigger second phase of window initialization, on dom ready handler
        w._fireDomReady();

        assertTrue(w.url instanceof js.net.URL);
        assertEquals("http://js-lib.com", w.url.value);
        assertTrue(w.doc instanceof js.dom.Document);
        assertUndefined(w.doc.body);
    },

    testOpen : function (context) {
        var mockNativeWindow = {
            document : {
                addEventListener : function () {
                }
            },
            open : function (url, name, features) {
                this.url = url;
                this.name = name;
                this.features = features;
                return this;
            },
            addEventListener : function () {
            }
        };

        if (!document.addEventListener) {
            mockNativeWindow.attachEvent = function () {
            };
            mockNativeWindow.document.attachEvent = function () {
            };
        }
        if (!document.documentElement) {
            mockNativeWindow.document.documentElement = {};
        }

        var w = new js.ua.Window(mockNativeWindow);
        w = w.open("page.htm", {
            id : 1
        });

        assertEquals("page.htm?id=1", w._window.url);
        assertEquals("_blank", w._window.name);
        assertEquals("resizable=no,fullscreen=no,menubar=yes,location=yes,toolbar=yes,directories=yes,scrollbars=yes,status=yes", w._window.features);
    },

    testAssing : function (context) {
        var urlProbe;
        
        var mockNativeWindow = {
            document : {
                addEventListener : function () {
                }
            },
            location : {
                assign : function (url) {
                    urlProbe = url;
                }
            },
            addEventListener : function () {
            }
        };

        if (!document.addEventListener) {
            mockNativeWindow.attachEvent = function () {
            };
            mockNativeWindow.document.attachEvent = function () {
            };
        }
        if (!document.documentElement) {
            mockNativeWindow.document.documentElement = {};
        }

        var w = new js.ua.Window(mockNativeWindow);
        w = w.assign("page.htm", {
            id : 1
        });

        assertEquals("page.htm?id=1", urlProbe);
    },

    _testOn : function (context) {
        var type = "dom-ready";
        var listener = function () {
        };
        var scope = {};
        var arg = "arg";
        context.push("js.event.CustomEvents.prototype.addListener");
        js.event.CustomEvents.prototype.addListener = function (_type, _listener, _scope, _arg) {
            assertEquals(type, _type);
            assertEquals(listener, _listener);
            assertEquals(scope, _scope);
            assertEquals(arg, _arg);
        };
        js.ua.Window.init();
        js.ua.Window.on(type, listener, scope, arg);
    },

    _testDomReadyEvents : function (context) {
        context.push("js.lang.NOP");
        js.lang.NOP = js.ua.Window._fireDomReady;

        var domReadyProbe = 0;
        function preDomReady () {
            assertEquals(0, domReadyProbe);
            domReadyProbe += 11;
        }
        ;
        function domReady () {
            assertEquals(11, domReadyProbe);
            domReadyProbe += 37;
        }
        ;
        function postDomReady () {
            assertEquals(48, domReadyProbe);
        }
        ;
        js.ua.Window.on("pre-dom-ready", preDomReady);
        js.ua.Window.on("dom-ready", domReady);
        js.ua.Window._fireDomReady();

        js.ua.Window.un("pre-dom-ready", preDomReady);
        js.ua.Window.un("dom-ready", domReady);
    },

    _testLoadEvents : function (context) {
        var loadProbe = 1964;
        function load () {
            assertEquals(1964, loadProbe);
        }
        ;
        js.ua.Window.on("load", load);
        context.push("js.ua.Window._onLoadHandler");
        js.ua.Window._onLoadHandler = null;
        window.onload();

        js.ua.Window.un("load", load);
    },

    _testUnloadEvents : function (context) {
        var beforeunloadProbe = 0;
        function preUnload () {
            beforeunloadProbe++;
            // always returns true to allow for page unload
            // unfortunately false condition can"t be tested automatically
            return true;
        }
        ;
        js.ua.Window.on("pre-unload", preUnload);
        assertTrue(typeof window.onbeforeunload() === "undefined");
        assertEquals(1, beforeunloadProbe);
        js.ua.Window.un("pre-unload", preUnload);

        var unloadProbe = 0;
        function unload () {
            unloadProbe++;
        }
        ;
        js.ua.Window.on("unload", unload);
        window.onunload();
        assertEquals(1, unloadProbe);
        js.ua.Window.un("unload", unload);
    },

    _testAlert : function () {
        this._testSystemDialogs("alert");
    },

    _testPrompt : function () {
        this._testSystemDialogs("prompt");
    },

    _testConfirm : function () {
        this._testSystemDialogs("confirm");
    },

    _testSystemDialogs : function (dialog) {
        var a = window[dialog];
        var trace = null;
        window[dialog] = function (s) {
            trace = s;
        };

        js.ua.Window[dialog]("simple message");
        assertEquals("simple message", trace);
        js.ua.Window[dialog]("simple message?");
        assertEquals("simple message?", trace);
        js.ua.Window[dialog]("one %d, two %d", 1, 2);
        assertEquals("one 1, two 2", trace);
        js.ua.Window[dialog]("one %d, two %d, three", 1, 2);
        assertEquals("one 1, two 2, three", trace);

        window[dialog] = a;
    },

    _testToString : function () {
        assertEquals("js.ua.Window", js.ua.Window.toString());
    }
};
TestCase.register("js.tests.ua.WindowUnitTests");
