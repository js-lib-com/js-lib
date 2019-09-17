$package('js.tests.net');

js.tests.net.UrlUnitTests = {
    testFullUrlRegEx : function () {
        var rex = js.net.URL.prototype._FULL_URL_REX;
        rex.lastIndex = 0;
        var m = rex.exec('http://www.youtube.com:8080/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu#1234');

        assertNotNull(m);
        assertEquals(7, m.length);
        assertEquals('http', m[1]);
        assertEquals('www.youtube.com', m[2]);
        assertEquals('8080', m[3]);
        assertEquals('video/watch/files.avi', m[4]);
        assertEquals('v=p6K_VT6tcvs&feature=relmfu', m[5]);
        assertEquals('1234', m[6]);
    },

    testFullUrlWithQueryParametersSeparator : function () {
        var rex = js.net.URL.prototype._FULL_URL_REX;
        rex.lastIndex = 0;
        var m = rex.exec('http://www.youtube.com:8080/video/watch/files.avi?');

        assertNotNull(m);
        assertEquals(7, m.length);
        assertEquals('http', m[1]);
        assertEquals('www.youtube.com', m[2]);
        assertEquals('8080', m[3]);
        assertEquals('video/watch/files.avi', m[4]);
        assertEmpty(m[5]);
        // there are implementations that returns undefined and others returning empty string for optional capture
        assertTrue(typeof m[6] === "undefined" || m[6] === "");
    },

    testShortUrlRegEx : function () {
        var rex = js.net.URL.prototype._SHORT_URL_REX;
        rex.lastIndex = 0;
        var m = rex.exec('http://www.youtube.com:8080/video/watch/files.avi');

        assertNotNull(m);
        assertEquals(5, m.length);
        assertEquals('http', m[1]);
        assertEquals('www.youtube.com', m[2]);
        assertEquals('8080', m[3]);
        assertEquals('video/watch/files.avi', m[4]);
    },

    testGetHost : function () {
        assertEquals('js-lib.com', js.net.URL.getHost('http://js-lib.com/api/index.html'));
        assertEquals('js-lib.com', js.net.URL.getHost('ftp://js-lib.com'));
        assertEmpty(js.net.URL.getHost('file:///D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom'));

        assertAssertion(js.net.URL, 'getHost');
        assertAssertion(js.net.URL, 'getHost', null);
        assertAssertion(js.net.URL, 'getHost', '');

        $assert.disable();
        assertNull(js.net.URL.getHost());
        assertNull(js.net.URL.getHost(null));
        assertNull(js.net.URL.getHost(''));
    },

    testParseQuery : function () {
        var p = js.net.URL.parseQuery('v=p6K_VT6tcvs&feature=relmfu');
        assertEquals('p6K_VT6tcvs', p.v);
        assertEquals('relmfu', p.feature);

        assertAssertion(js.net.URL, 'parseQuery');
        assertAssertion(js.net.URL, 'parseQuery', null);
        assertAssertion(js.net.URL, 'parseQuery', '');

        $assert.disable();
        assertNull(js.net.URL.parseQuery());
        assertNull(js.net.URL.parseQuery(null));
        assertNull(js.net.URL.parseQuery(''));
    },

    testFormatQuery : function () {
        assertEquals('?v=p6K_VT6tcvs', js.net.URL.formatQuery({
            v : 'p6K_VT6tcvs'
        }));
        assertEquals('?v=p6K_VT6tcvs&feature=relmfu', js.net.URL.formatQuery({
            v : 'p6K_VT6tcvs',
            feature : 'relmfu'
        }));

        assertAssertion(js.net.URL, 'formatQuery');
        assertAssertion(js.net.URL, 'formatQuery', null);

        $assert.disable();
        assertEmpty(js.net.URL.formatQuery());
        assertEmpty(js.net.URL.formatQuery(null));
    },

    testConstructor : function () {
        assertClass('js.net.URL');
        var url = new js.net.URL('http://www.youtube.com/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu#ref1');
        this.assertURL(url);
        assertEquals('ref1', url.ref);
        assertEquals('http://www.youtube.com/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu#ref1', url.value);
    },

    testParameterizedConstructor : function () {
        var url = new js.net.URL('http://www.youtube.com/video/watch/files.avi', {
            v : 'p6K_VT6tcvs',
            feature : 'relmfu'
        });
        this.assertURL(url);
        assertNull(url.ref);
        assertEquals('http://www.youtube.com/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu', url.value);
    },

    testFile : function () {
        var url = new js.net.URL('file:///D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom');
        assertEquals('file', url.protocol);
        assertNull(url.host);
        assertEquals(80, url.port);
        assertEquals('D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom', url.path);
        assertNull(url.query);
        assertNull(url.ref);
        assertEquals('file:///D:/docs/workspaces/phoenix/js-lib/client.tests/build.dom', url.value);
    },

    testInvocationAsFunction : function () {
        var url = js.net.URL('http://www.youtube.com/video/watch/files.avi', {
            v : 'p6K_VT6tcvs',
            feature : 'relmfu'
        });
        assertEquals('http://www.youtube.com/video/watch/files.avi?v=p6K_VT6tcvs&feature=relmfu', url);

        try {
            js.net.URL('httpx://www.youtube.com/video/watch/files.avi');
            fail();
        } catch (er) {
            assertTrue(er instanceof js.lang.AssertException);
        }
    },

    testIsCrossDomain : function () {
        var url = new js.net.URL("http://api.bbnet.ro/client/index.html");
        assertTrue(url.isCrossDomain("http://apps.bbnet.ro/client/index.html"));
        assertFalse(url.isCrossDomain("http://api.bbnet.ro/server/index.html"));
    },

    assertURL : function (url) {
        assertEquals('http', url.protocol);
        assertEquals('www.youtube.com', url.host);
        assertEquals(80, url.port);
        assertEquals('video/watch/files.avi', url.path);
        assertEquals('v=p6K_VT6tcvs&feature=relmfu', url.query);
        assertEquals('p6K_VT6tcvs', url.parameters.v);
        assertEquals('relmfu', url.parameters.feature);
    }
};
TestCase.register('js.tests.net.UrlUnitTests');
