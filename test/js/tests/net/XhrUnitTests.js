$package('js.tests.net');

$include('js.dom.Control');

js.tests.net.XHR = {
    testConstructor : function () {
        assertClass('js.net.XHR');
        var xhr = new js.net.XHR();
        assertInstanceof(xhr._request, XMLHttpRequest);
        assertEquals(js.net.XHR.StateMachine.CREATED, xhr._state);
        assertInstanceof(xhr._timeout, js.util.Timeout);
        assertZero(xhr._timeout.get());

        assertInstanceof(xhr._events, js.event.CustomEvents);
        assertTrue('progress' in xhr._events._events);
        assertTrue('error' in xhr._events._events);
        assertTrue('timeout' in xhr._events._events);
        assertTrue('load' in xhr._events._events);
        assertTrue('loadend' in xhr._events._events);
    },

    testAddEventListener : function (context) {
        context.push('XMLHttpRequest');

        function listener () {
        }
        var progressEvent = {};
        uploadEventInvoked = false;
        XMLHttpRequest = function () {
            this.upload = {
                addEventListener : function (type, listener) {
                    assertEquals('progress', type);
                    listener(progressEvent);
                    uploadEventInvoked = true;
                }
            };
            this.open = function () {
            };
            this.setRequestHeader = function () {
            };
        };

        context.push('js.event.CustomEvents.prototype.addListener');
        customEventInvoked = false;
        js.event.CustomEvents.prototype.addListener = function (type, _listener, scope) {
            assertEquals('progress', type);
            assertEquals(_listener, listener);
            assertEquals(window, scope);
            customEventInvoked = true;
        };

        context.push('js.event.CustomEvents.prototype.fire');
        customEventFired = false;
        js.event.CustomEvents.prototype.fire = function (type, arg) {
            assertEquals('progress', type);
            customEventFired = true;
        };

        var xhr = new js.net.XHR();
        xhr.on('progress', listener);
        assertTrue(uploadEventInvoked);
        assertTrue(customEventInvoked);
        assertTrue(customEventFired);

        xhr.open(js.net.Method.POST, 'http://js-lib.com/');
        assertAssertion(xhr, 'on');
    },

    testTimeout : function () {
        var xhr = new js.net.XHR();
        assertEquals(xhr, xhr.setTimeout(1000));
        assertEquals(1000, xhr._timeout.get());

        $assert.enable();
        assertAssertion(xhr, 'setTimeout');
        assertAssertion(xhr, 'setTimeout', -100);
        assertAssertion(xhr, 'setTimeout', '1000');

        $assert.disable();
        xhr.setTimeout();
        xhr.setTimeout(-100);
        assertEquals(1000, xhr._timeout.get());

        xhr.setTimeout(0);
        assertZero(xhr._timeout.get());

        xhr.setTimeout('2000');
        assertEquals(2000, xhr._timeout.get());

        // test _onTimeout
        var invocationProbe = 0;
        xhr._events = {
            fire : function (type) {
                assertEquals('timeout', type);
                invocationProbe += 1;
            }
        };
        xhr.abort = function () {
            invocationProbe += 2;
        };
        xhr._timeout._handler(); // emulate timeout event
        assertEquals(3, invocationProbe);
    },

    testRequestHeaders : function (context) {
        context.push('XMLHttpRequest');
        var setRequestHeaderInvoked = true, header, value;
        XMLHttpRequest = function () {
            this.setRequestHeader = function (_header, _value) {
                header = _header;
                value = _value;
                setRequestHeaderInvoked = true;
            };
        };

        var xhr = new js.net.XHR();
        xhr._state = js.net.XHR.StateMachine.OPENED;
        assertEquals(xhr, xhr.setHeader('Content-Type', 'text/html'));
        assertTrue(setRequestHeaderInvoked);
        assertEquals('Content-Type', header);
        assertEquals('text/html', value);

        assertAssertion(xhr, 'setHeader');
        assertAssertion(xhr, 'setHeader', null);
        assertAssertion(xhr, 'setHeader', '');
        assertAssertion(xhr, 'setHeader', '!@#');
        assertAssertion(xhr, 'setHeader', 'Content-Type');
        assertAssertion(xhr, 'setHeader', 'Content-Type', null);
        assertAssertion(xhr, 'setHeader', 'Content-Type', '');
        assertAssertion(xhr, 'setHeader', 'Content-Type', '!@#');

        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'setHeader', 'Content-Type', 'text/html');

        $assert.disable();
        xhr.setHeader();
        assertUndefined(header);
        assertUndefined(value);
    },

    testResponseHeaders : function (context) {
        context.push('XMLHttpRequest');
        var getResponseHeaderInvoked = true;
        XMLHttpRequest = function () {
            this.status = '200';
            this.statusText = 'OK';
            this.getResponseHeader = function (header) {
                switch (header) {
                case 'Content-Type':
                    return 'application/json';
                default:
                    return null;
                }
                getResponseHeaderInvoked = true;
            };
        };

        var xhr = new js.net.XHR();
        xhr._state = js.net.XHR.StateMachine.DONE;
        assertEquals(200, xhr.getStatus());
        assertEquals('OK', xhr.getStatusText());
        assertEquals('application/json', xhr.getHeader('Content-Type'));

        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'getStatus');
        assertAssertion(xhr, 'getStatusText');
        assertAssertion(xhr, 'getHeader');
    },

    testOpen : function (context) {
        context.push('XMLHttpRequest');

        var openInvoked = false;
        var setRequestHeaderInvoked = false;
        XMLHttpRequest = function () {
            this.onreadystatechange = null;
            this.open = function (method, url, async, user, password) {
                assertEquals('POST', method);
                assertEquals('url', url);
                assertTrue(async);
                assertEquals('user', user);
                assertEquals('password', password);
                openInvoked = true;
            };
            this.setRequestHeader = function (header, value) {
                switch (header) {
                case 'X-Requested-With':
                    assertEquals('XMLHttpRequest', value);
                    break;
                case js.net.XHR.VERSION_HEADER:
                    assertEquals(JSLIB_VERSION, value);
                    break;
                case js.net.XHR.REQUEST_TYPE_HEADER:
                    assertEquals('XHR', value);
                    break;
                case 'Cache-Control':
                    assertTrue(value === 'no-cache' || value === 'no-store');
                    break;
                case 'Accept':
                    assertEquals('application/json, text/xml, text/plain', value);
                    break;
                default:
                    TestCase.fail('Unknown header ' + header);
                }
                setRequestHeaderInvoked = true;
            };
        };

        var xhr = new js.net.XHR();

        xhr.open(js.net.Method.POST, 'url', true, 'user', 'password');
        assertTrue(openInvoked);
        assertTrue(setRequestHeaderInvoked);
        assertFalse(xhr._synchronousMode);
        assertZero(xhr._timeout.get());
        assertNotNull(xhr._request.onreadystatechange);

        // synchronous mode timeout
        xhr._state = js.net.XHR.StateMachine.CREATED;
        xhr._request.open = function () {
        };
        xhr.open(js.net.Method.POST, 'url', false);
        assertEquals(js.net.XHR.SYNC_TIMEOUT, xhr._timeout.get());

        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open');
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST);
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', 'true');
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', true, 123.45);
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', true, 'user', true);
    },

    testSend : function (context) {
        context.push('XMLHttpRequest');
        context.push('js.util.AbstractTimer.prototype.start');

        var data, requestType, contentType, setRequestHeaderInvoked, timerInvoked, sendInvoked;
        XMLHttpRequest = function () {
            this.open = function () {
            };

            this.setRequestHeader = function (header, value) {
                switch (header) {
                case 'Content-Type':
                    contentType = value;
                }
                ++setRequestHeaderInvoked;
            };

            this.send = function (_data) {
                data = _data;
                sendInvoked = true;
            };
        };
        js.util.AbstractTimer.prototype.start = function () {
            timerInvoked = true;
        };

        function reset () {
            xhr._state = js.net.XHR.StateMachine.OPENED;
            setRequestHeaderInvoked = 0;
            timerInvoked = false;
            sendInvoked = false;
            requestType = null;
            contentType = null;
        }

        var xhr = new js.net.XHR();

        // send void --------------------------------------
        reset();
        xhr.send();
        assertEquals(0, setRequestHeaderInvoked);
        assertTrue(timerInvoked);
        assertTrue(sendInvoked);
        assertNull(contentType);

        // send string ------------------------------------
        reset();
        xhr.send('string');
        assertEquals(1, setRequestHeaderInvoked);
        assertTrue(timerInvoked);
        assertTrue(sendInvoked);
        assertEquals('text/plain; charset=UTF-8', contentType);
        assertEquals('string', data);

        // send document ----------------------------------
        var xml = '' + //
        '<person>' + //
        '	<name>John Joe</name>' + //
        '	<age>48</age>' + //
        '</person>';
        var doc = js.dom.Builder.parseXML(xml);

        reset();
        xhr.send(doc);
        assertEquals(1, setRequestHeaderInvoked);
        assertTrue(timerInvoked);
        assertTrue(sendInvoked);
        assertEquals('text/xml; charset=UTF-8', contentType);
        assertEquals(Node.DOCUMENT_NODE, data.nodeType);

        // send form --------------------------------------
        var html = '' + //
        '<form id="send-form">' + //
        '	<input type="text" name="name" value="John Doe" />' + //
        '	<input type="text" name="age" value="48" />' + //
        '</form>';
        document.getElementById('scratch-area').innerHTML = html;
        var form = new js.dom.Document(document).getById('send-form');

        reset();
        xhr.send(form);
        assertEquals(0, setRequestHeaderInvoked);
        assertFalse(timerInvoked);
        assertTrue(sendInvoked);
        assertNull(contentType);
        assertInstanceof(data, FormData);

        // send object ------------------------------------
        var object = {
            name : 'John Doe',
            age : 48
        };

        reset();
        xhr.send(object);
        assertEquals(1, setRequestHeaderInvoked);
        assertTrue(timerInvoked);
        assertTrue(sendInvoked);
        assertEquals('application/json; charset=UTF-8', contentType);
        assertEquals('{"name":"John Doe","age":48}', data);

        // synchronous mode -------------------------------
        xhr._synchronousMode = true;
        xhr._processResponse = function () {
            return 'response';
        };
        reset();
        assertEquals('response', xhr.send('string'));

        xhr = new js.net.XHR();
        assertAssertion(xhr, 'send');
    },

    testReadyStateHandler : function (context) {
        context.push('XMLHttpRequest');
        context.push('js.util.AbstractTimer.prototype.stop');
        context.push('js.ua.System.error');

        var timeoutStopInvoked, loadFired, loadendFired, processResponseInvoked, globalErrorInvoked;
        function reset () {
            timeoutStopInvoked = 0;
            loadFired = 0;
            loadendFired = 0;
            processResponseInvoked = 0;
            globalErrorInvoked = 0;
        }

        XMLHttpRequest = function () {
            this.readyState = js.net.ReadyState.DONE;
        };
        js.util.AbstractTimer.prototype.stop = function () {
            ++timeoutStopInvoked;
        };
        js.ua.System.error = function (er) {
            assertEquals('error', er);
            ++globalErrorInvoked;
        };

        var xhr = new js.net.XHR();
        xhr._events = {
            fire : function (type, arg) {
                switch (type) {
                case 'load':
                    assertEquals('response', arg);
                    ++loadFired;
                    break;
                case 'loadend':
                    ++loadendFired;
                    break;
                default:
                    TestCase.fail('Bad event type ' + type);
                }
            }
        };
        xhr._processResponse = function () {
            ++processResponseInvoked;
            return 'response';
        };

        // successful response ----------------------------
        reset();
        xhr._onReadyStateChange();
        assertEquals(1, timeoutStopInvoked, 'Timeout stop not invoked.');
        assertEquals(1, processResponseInvoked, 'Process response not invoked.');
        assertEquals(1, loadFired, 'Load event not fired.');
        assertEquals(1, loadendFired, 'Loadend event not fired.');
        assertEquals(0, globalErrorInvoked, 'Unexpected global error handler invocation.');

        // server side error ------------------------------
        xhr._processResponse = function () {
            processResponseInvoked++;
        };
        reset();
        xhr._onReadyStateChange();
        assertEquals(1, timeoutStopInvoked, 'Timeout stop not invoked.');
        assertEquals(1, processResponseInvoked, 'Process response not invoked.');
        assertEquals(0, loadFired, 'Unexpected load event.');
        assertEquals(1, loadendFired, 'Loadend event not fired.');
        assertEquals(0, globalErrorInvoked, 'Unexpected global error handler invocation.');

        // exceptional or bogus condition -----------------
        xhr._processResponse = function () {
            processResponseInvoked++;
            throw 'error';
        };
        reset();
        xhr._onReadyStateChange();
        assertEquals(1, timeoutStopInvoked, 'Timeout stop not invoked.');
        assertEquals(1, processResponseInvoked, 'Process response not invoked.');
        assertEquals(0, loadFired, 'Unexpected load event.');
        assertEquals(1, loadendFired, 'Loadend event not fired.');
        assertEquals(1, globalErrorInvoked, 'Missing global error handler invocation.');
    },

    testProcessResponse : function (context) {
        context.push('XMLHttpRequest');

        var status, statusText, contentType, content;
        var redirect = null;
        XMLHttpRequest = function () {
            this.status = status;
            this.statusText = statusText;

            if (contentType !== null && contentType.indexOf('xml') !== -1) {
                this.responseXML = content;
            }
            else {
                this.responseText = content;
            }

            this.getResponseHeader = function (header) {
                switch (header) {
                case 'Content-Type':
                    return contentType;
                case 'X-JSLIB-Location':
                    return redirect;
                default:
                    alert("Unexpected header: " + header);
                    return null;
                }
            };
        };

        // XML content ------------------------------------
        var xml = '' + '<person>' + '	<name>John Joe</name>' + '	<age>48</age>' + '</person>';
        status = 200;
        statusText = 'OK';
        contentType = 'text/xml; charset=UTF-8';
        content = js.dom.Builder.parseXML(xml).getDocument();

        var xhr = new js.net.XHR();
        var doc = xhr._processResponse();
        assertExists(doc);
        assertInstanceof(doc, js.dom.Document);
        assertEquals(content, doc.getDocument());
        assertEquals(js.net.XHR.StateMachine.DONE, xhr._state);

        // JSON content -----------------------------------
        status = 200;
        statusText = 'OK';
        contentType = 'application/json; charset=UTF-8';
        content = '{"name":"John Doe","age":48}';

        xhr = new js.net.XHR();
        var object = xhr._processResponse();
        assertExists(object);
        assertEquals('John Doe', object.name);
        assertEquals(48, object.age);
        assertEquals(js.net.XHR.StateMachine.DONE, xhr._state);

        // string content ---------------------------------
        status = 200;
        statusText = 'OK';
        contentType = 'text/plain; charset=UTF-8';
        content = 'string';

        xhr = new js.net.XHR();
        var string = xhr._processResponse();
        assertEquals('string', string);
        assertEquals(js.net.XHR.StateMachine.DONE, xhr._state);

        // server error -----------------------------------
        context.push('js.ua.System.error');
        var globalErrorInvoked = false;
        js.ua.System.error = function (er) {
            assertEquals('java.lang.Exception\nServer error.', er);
            globalErrorInvoked = true;
        };

        status = 500;
        statusText = null;
        contentType = 'application/json; charset=UTF-8';
        content = '{"cause":"java.lang.Exception","message":"Server error."}';

        xhr = new js.net.XHR();
        assertUndefined(xhr._processResponse());
        assertEquals(js.net.XHR.StateMachine.ERROR, xhr._state);
        assertTrue(globalErrorInvoked);

        xhr = new js.net.XHR();
        var errorEventFired = false;
        xhr.on('error', function (er) {
            assertEquals('java.lang.Exception', er.cause);
            assertEquals('Server error.', er.message);
            errorEventFired = true;
        });
        assertUndefined(xhr._processResponse());
        assertEquals(js.net.XHR.StateMachine.ERROR, xhr._state);
        assertTrue(errorEventFired);

        // server redirect --------------------------------
        context.push('WinMain.assign');
        var redirectInvoked = 0;
        WinMain.assign = function (url) {
            assertEquals('redirect-page.html', url);
            ++redirectInvoked;
        };
        redirect = 'redirect-page.html';

        status = 200;
        statusText = null;
        contentType = null;
        content = null;

        xhr = new js.net.XHR();
        assertUndefined(xhr._processResponse());
        assertEquals(1, redirectInvoked);
        assertEquals(js.net.XHR.StateMachine.DONE, xhr._state);
    }
};
TestCase.register('js.tests.net.XHR');

$legacy(typeof FormData === 'undefined', function () {
    js.tests.net.XHR.testAddEventListener = function (context) {
        function listener () {
        }

        context.push('js.event.CustomEvents.prototype.addListener');
        customEventInvoked = false;
        js.event.CustomEvents.prototype.addListener = function (type, _listener, scope) {
            assertEquals('progress', type);
            assertEquals(_listener, listener);
            assertEquals(window, scope);
            customEventInvoked = true;
        };

        var xhr = new js.net.XHR();
        xhr.on('progress', listener);
        assertTrue(customEventInvoked);

        xhr.open(js.net.Method.POST, 'http://js-lib.com/');
        assertAssertion(xhr, 'on');
    };

    js.tests.net.XHR.testOpen = function () {
        var xhr = new js.net.XHR();
        xhr.open(js.net.Method.POST, 'url', true, 'user', 'password');

        assertEquals('POST', xhr._method);
        assertEquals('url', xhr._url);
        assertTrue(xhr._async);
        assertEquals('user', xhr._user);
        assertEquals('password', xhr._password);
        assertArray(xhr._headers);
        assertEmpty(xhr._headers);

        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open');
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST);
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', 'true');
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', true, 123.45);
        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'open', js.net.Method.POST, 'url', true, 'user', true);
    };

    js.tests.net.XHR.testRequestHeaders = function () {
        var xhr = new js.net.XHR();
        xhr.open(js.net.Method.POST, 'url');
        assertEquals(xhr, xhr.setHeader('Content-Type', 'text/html'));
        assertSize(1, xhr._headers);
        assertEquals('Content-Type', xhr._headers[0].header);
        assertEquals('text/html', xhr._headers[0].value);
        // assertEquals(js.net.XHR.REQUEST_TYPE_HEADER, xhr._headers[1].header);
        // assertEquals('RMI', xhr._headers[1].value);

        assertAssertion(xhr, 'setHeader');
        assertAssertion(xhr, 'setHeader', null);
        assertAssertion(xhr, 'setHeader', '');
        assertAssertion(xhr, 'setHeader', '!@#');
        assertAssertion(xhr, 'setHeader', 'Content-Type');
        assertAssertion(xhr, 'setHeader', 'Content-Type', null);
        assertAssertion(xhr, 'setHeader', 'Content-Type', '');
        assertAssertion(xhr, 'setHeader', 'Content-Type', '!@#');
        assertSize(1, xhr._headers);

        xhr._state = js.net.XHR.StateMachine.CREATED;
        assertAssertion(xhr, 'setHeader', 'Content-Type', 'text/html');
        assertSize(1, xhr._headers);

        $assert.disable();
        xhr.setHeader();
        assertSize(2, xhr._headers);
        assertUndefined(xhr._headers[1].header);
        assertUndefined(xhr._headers[1].value);
    };

    js.tests.net.XHR.testSend = function (context) {
        context.push('XMLHttpRequest');

        var abortInvoked = 0;
        XMLHttpRequest = function () {
            this.abort = function () {
                ++abortInvoked;
            };
        };

        var html = '' + '<form id="send-form">' + '	<input type="text" name="name" value="John Doe" />' + '	<input type="text" name="age" value="48" />' + '</form>';
        document.getElementById('scratch-area').innerHTML = html;
        var form = new js.dom.Document(document).getById('send-form');
        form.getNode = function () {
            return {
                submit : function () {
                }
            };
        };

        var xhr = new js.net.XHR();
        xhr._url = 'url';
        xhr.send(form);
        assertEquals(1, abortInvoked);
    };

    js.tests.net.XHR.testJsonIframeLoaded = function () {
        var xhr = new js.net.XHR();
        var upload = new js.net.XHR.Upload(xhr);
        upload._iframe = {
            getLocation : function () {
                return 'http://localhost/tests';
            },

            getInnerDoc : function () {
                var html = "" + //
                "<html>\r\n" + //
                "  <head>\r\n" + //
                "    <meta name='status' content='200' />\r\n" + //
                "    <meta name='statusText' content='OK' />\r\n" + //
                "    <meta http-equiv='X-JSLIB-Version' content='j(s)-lib 1.0.0' />\r\n" + //
                "    <meta http-equiv='Content-Type' content='application/json' />\r\n" + //
                "    <meta http-equiv='Location' content='' />\r\n" + //
                "  </head>\r\n" + //
                "  <body>{'name':'John Doe','profession':'freelancer','age':48}</body>\r\n" + //
                "</html>";
                return js.dom.Builder.parseHTML(html);
            }
        };

        upload._onIFrameLoaded();
        assertEquals(js.net.ReadyState.DONE, upload.readyState);
        assertEquals(200, upload.status);
        assertEquals('OK', upload.statusText);
        assertEquals('j(s)-lib 1.0.0', upload.getResponseHeader('X-JSLIB-Version'));
        assertEquals('application/json', upload.getResponseHeader('Content-Type'));
        assertNull(upload.getResponseHeader('Location'));
        assertEquals("{'name':'John Doe','profession':'freelancer','age':48}", upload.responseText);
        assertNull(upload.responseXML);
    };

    js.tests.net.XHR.testXmlIframeLoaded = function () {
        var xhr = new js.net.XHR();
        var upload = new js.net.XHR.Upload(xhr);
        upload._iframe = {
            getLocation : function () {
                return 'http://localhost/tests';
            },

            getInnerDoc : function () {
                var html = "" + //
                "<html>\r\n" + //
                "  <head>\r\n" + //
                "    <meta name='status' content='200' />\r\n" + //
                "    <meta name='statusText' content='OK' />\r\n" + //
                "    <meta http-equiv='X-JSLIB-Version' content='j(s)-lib 1.0.0' />\r\n" + //
                "    <meta http-equiv='Content-Type' content='text/xml' />\r\n" + //
                "    <meta http-equiv='Location' content='' />\r\n" + //
                "  </head>\r\n" + //
                "  <body>&lt;?xml version='1.0'?&gt;&lt;person&gt;&lt;name&gt;John Doe&lt;/name&gt;&lt;profession&gt;freelancer&lt;/profession&gt;&lt;age&gt;48&lt;/age&gt;&lt;/person&gt;</body>\r\n" + //
                "</html>";
                return js.dom.Builder.parseHTML(html);
            }
        };

        upload._onIFrameLoaded();
        assertEquals(js.net.ReadyState.DONE, upload.readyState);
        assertEquals(200, upload.status);
        assertEquals('OK', upload.statusText);
        assertEquals('j(s)-lib 1.0.0', upload.getResponseHeader('X-JSLIB-Version'));
        assertEquals('text/xml', upload.getResponseHeader('Content-Type'));
        assertNull(upload.getResponseHeader('Location'));
        var responseDoc = new js.dom.Document(upload.responseXML);
        assertEquals("John Doe", responseDoc.getByTag('name').getText());
        assertEquals("freelancer", responseDoc.getByTag('profession').getText());
        assertEquals("48", responseDoc.getByTag('age').getText());
    };

    js.tests.net.XHR.testRedirectionIframeLoaded = function () {
        var xhr = new js.net.XHR();
        var upload = new js.net.XHR.Upload(xhr);
        upload._iframe = {
            getLocation : function () {
                return 'http://localhost/tests';
            },

            getInnerDoc : function () {
                var html = "" + //
                "<html>\r\n" + //
                "  <head>\r\n" + //
                "    <meta name='status' content='307' />\r\n" + //
                "    <meta name='statusText' content='Temporary Redirect' />\r\n" + //
                "    <meta http-equiv='X-JSLIB-Version' content='j(s)-lib 1.0.0' />\r\n" + //
                "    <meta http-equiv='Content-Type' content='' />\r\n" + //
                "    <meta http-equiv='Location' content='login-form.xsp' />\r\n" + //
                "  </head>\r\n" + //
                "  <body></body>\r\n" + //
                "</html>";
                return js.dom.Builder.parseHTML(html);
            }
        };

        upload._onIFrameLoaded();
        assertEquals(js.net.ReadyState.DONE, upload.readyState);
        assertEquals(307, upload.status);
        assertEquals('Temporary Redirect', upload.statusText);
        assertEquals('j(s)-lib 1.0.0', upload.getResponseHeader('X-JSLIB-Version'));
        assertNull(upload.getResponseHeader('Content-Type'));
        assertEquals('login-form.xsp', upload.getResponseHeader('Location'));
        assertEquals('', upload.responseText);
        assertNull(upload.responseXML);
    };
});
