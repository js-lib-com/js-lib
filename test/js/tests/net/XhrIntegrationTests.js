$package('js.tests.net');

js.tests.net.XhrIntegrationTests =
{
    beforeClass: function() {
        window.netAssertEquals = function(expected, concrete) {
            if (expected !== concrete) {
                alert(expected + ' !== ' + concrete);
            }
        };
    },

    testGetString: function() {
        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(string) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('text/plain;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('this is a string', string);
            loadInvoked = true;
        });
        xhr.open('POST', 'get-string.xsp');
        xhr.send();
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('get string... ', loadInvoked);
        });
    },

    testGetStringSynchronously: function() {
        var xhr = new js.net.XHR();
        xhr.open('POST', 'get-string.xsp', false);
        assertEquals('this is a string', xhr.send(null));
    },

    testSendString: function() {
        var probe = 'send string probe';
        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(string) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('text/plain;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals(probe, string);
            loadInvoked = true;
        });
        xhr.open('POST', 'send-string.xsp');
        xhr.send(probe);
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('send string... ', loadInvoked);
        });
    },

    testGetObject: function() {
        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(person) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('application/json;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('Maximus Decimus Deridius', person.name);
            netAssertEquals('gladiator', person.profession);
            netAssertEquals('Spanish', person.origin);
            loadInvoked = true;
        });
        xhr.open('POST', 'get-object.xsp');
        xhr.send();
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('get object... ', loadInvoked);
        });
    },

    testGetObjectSynchronously: function() {
        var xhr = new js.net.XHR('POST', 'get-object.xsp');
        xhr.open('POST', 'get-object.xsp', false);
        var person = xhr.send(null);
        assertEquals('Maximus Decimus Deridius', person.name);
        assertEquals('gladiator', person.profession);
        assertEquals('Spanish', person.origin);
    },

    testSendObject: function() {
        var hero =
        {
            name: 'Leonida',
            profession: 'king',
            origin: 'Spartan'
        };
        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(person) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('application/json;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('Leonida', person.name);
            netAssertEquals('king', person.profession);
            netAssertEquals('Spartan', person.origin);
            loadInvoked = true;
        });
        xhr.open('POST', 'send-object.xsp');
        xhr.send(hero);
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('send object... ', loadInvoked);
        });
    },

    testGetXml: function() {
        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(doc) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('text/xml;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('j(s)-lib 1.0.0', doc.getByTag('version').getText());
            netAssertEquals('SUCCESS', doc.getByTag('code').getText());
            var value = doc.getByTag('value');
            netAssertEquals('Maximus Decimus Deridius', value.getByTag('name').getText());
            netAssertEquals('gladiator', value.getByTag('profession').getText());
            netAssertEquals('Spanish', value.getByTag('origin').getText());
            loadInvoked = true;
        });
        xhr.open('POST', 'get-xml.xsp');
        xhr.send();
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('get xml... ', loadInvoked);
        });
    },

    testGetXmlSynchronously: function() {
        var xhr = new js.net.XHR();
        xhr.open('POST', 'get-xml.xsp', false);
        var doc = xhr.send(null);
        assertEquals('j(s)-lib 1.0.0', doc.getByTag('version').getText());
        assertEquals('SUCCESS', doc.getByTag('code').getText());
        var value = doc.getByTag('value');
        assertEquals('Maximus Decimus Deridius', value.getByTag('name').getText());
        assertEquals('gladiator', doc.getByTag('profession').getText());
        assertEquals('Spanish', doc.getByTag('origin').getText());
    },

    testSendXml: function() {
        var xml = '' +
        '<response>' +
        '	<version>j(s)-lib 1.0.0</version>' +
        '	<code>SUCCESS</code>' +
        '	<value>' +
        '		<name>Maximus Decimus Deridius</name>' +
        '		<profession>gladiator</profession>' +
        '		<origin>Spanish</origin>' +
        '	</value>' +
        '</response>';
        var doc = js.dom.Builder.parseXML(xml);

        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(doc) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('text/xml;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('j(s)-lib 1.0.0', doc.getByTag('version').getText());
            netAssertEquals('SUCCESS', doc.getByTag('code').getText());
            var value = doc.getByTag('value');
            netAssertEquals('Maximus Decimus Deridius', value.getByTag('name').getText());
            netAssertEquals('gladiator', value.getByTag('profession').getText());
            netAssertEquals('Spanish', value.getByTag('origin').getText());
            loadInvoked = true;
        });
        xhr.open('POST', 'send-xml.xsp');
        xhr.send(doc);
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('send xml... ', loadInvoked);
        });
    },

    testSendForm: function() {
        var html = '' +
        '<form method="post" action="form.xsp" enctype="multipart/form-data">' +
        '	<input type="text" name="name" value="Maximus Decimus Deridius" />' +
        '	<input type="text" name="profession" value="gladiator" />' +
        '	<input type="text" name="origin" value="Spanish" />' +
        '</form>';
        document.getElementById('scratch-area').innerHTML = html;

        var doc = new js.dom.Document(document);
        var form = doc.getByCss('#scratch-area form');

        var xhr = new js.net.XHR();
        var loadInvoked = false;
        xhr.on('load', function(person) {
            netAssertEquals(200, xhr.getStatus());
            netAssertEquals('OK', xhr.getStatusText());
            netAssertEquals('application/json;charset=UTF-8', xhr.getHeader('Content-Type'));
            netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

            netAssertEquals('Maximus Decimus Deridius', person.name);
            netAssertEquals('gladiator', person.profession);
            netAssertEquals('Spanish', person.origin);
            loadInvoked = true;
        });
        xhr.open('POST', 'send-form.xsp');
        xhr.send(form);
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('send form... ', loadInvoked);
        });
    },

    _testSendFormSynchronously: function() {
        var html = '' +
        '<form method="post" action="form.xsp" enctype="multipart/form-data">' +
        '	<input type="text" name="name" value="Maximus Decimus Deridius" />' +
        '	<input type="text" name="profession" value="gladiator" />' +
        '	<input type="text" name="origin" value="Spanish" />' +
        '</form>';
        document.getElementById('scratch-area').innerHTML = html;

        var doc = new js.dom.Document(document);
        var form = doc.getByCss('#scratch-area form');

        var xhr = new js.net.XHR();
        xhr.open('POST', 'send-form.xsp', false);
        var person = xhr.send(form);
        assertEquals('Maximus Decimus Deridius', person.name);
        assertEquals('gladiator', person.profession);
        assertEquals('Spanish', person.origin);
    },

    testAsyncUpload: function() {
        var doc = new js.dom.Document(document);
        var sendButton = doc.getByCss('#async-upload-form button');
        var index = 0;
        sendButton.on('click', function(ev) {
            var form = doc.getByCss('#async-upload-form');
            var xhr = new js.net.XHR();

            xhr.on('progress', function(progress) {
                doc.getById('aysn-upload-message').setText(index++ + ':' + progress.loaded);
            });

            xhr.on('load', function(person) {
                netAssertEquals(200, xhr.getStatus());
                netAssertEquals('OK', xhr.getStatusText());
                netAssertEquals('application/json;charset=UTF-8', xhr.getHeader('Content-Type'));
                netAssertEquals('j(s)-lib 1.0.0', xhr.getHeader('X-JSLIB-Version'));

                netAssertEquals('Maximus Decimus Deridius', person.name);
                netAssertEquals('gladiator', person.profession);
                netAssertEquals('Spanish', person.origin);

                doc.getById('aysn-upload-message').setText('upload completed');
            });

            xhr.open('POST', 'async-upload.xsp');
            xhr.send(form);
            doc.getById('aysn-upload-message').setText('upload started');
        });
    },

    testXhrBadStatus: function() {
        var xhr = new js.net.XHR();
        var flag = 0;
        xhr.on('progress', function(er) {
            //flag += 1;
        });
        xhr.on('error', function(er) {
            flag += 2;
        });
        xhr.on('timeout', function() {
            flag += 4;
        });
        xhr.on('load', function(res) {
            flag += 8;
        });
        xhr.on('loadend', function() {
            flag += 16;
        });
        xhr.open('POST', 'bad-xhr-status.xsp');
        xhr.send();
        js.util.Timeout(1000, function() {
            js.tests.net.XhrIntegrationTests._write('xhr bad status... ', flag === 18);
        });
    },

    testXhrTimeout: function() {
        var xhr = new js.net.XHR();
        xhr.setTimeout(1000);
        var flag = 0;
        xhr.on('progress', function(er) {
            //flag += 1;
        });
        xhr.on('error', function(er) {
            flag += 2;
        });
        xhr.on('timeout', function() {
            flag += 4;
        });
        xhr.on('load', function(res) {
            flag += 8;
        });
        xhr.on('loadend', function() {
            flag += 16;
        });
        xhr.open('POST', 'xhr-timeout.xsp');
        xhr.send();
        js.util.Timeout(1500, function() {
            js.tests.net.XhrIntegrationTests._write('xhr timeout... ', flag === 20);
        });
    },

    testXhrAbort: function() {
        var xhr = new js.net.XHR();
        var flag = 0;
        xhr.on('progress', function(er) {
            //flag += 1;
        });
        xhr.on('error', function(er) {
            flag += 2;
        });
        xhr.on('timeout', function() {
            flag += 4;
        });
        xhr.on('load', function(res) {
            flag += 8;
        });
        xhr.on('loadend', function() {
            flag += 16;
        });
        xhr.open('POST', 'xhr-timeout.xsp');
        xhr.send();
        xhr.abort();
        js.util.Timeout(1200, function() {
            js.tests.net.XhrIntegrationTests._write('xhr abort... ', flag === 16);
        });
    },

    /**
     * java(script) library asynchronous requests is based on browser native support
     * but there is an assumption we need to test. Is about many concurrent requests.
     * Is reasonable to believe that every request is processed in its own separate
     * execution thread and that requests from application code are synchronized
     * with some sort of mutex. Also if the maximum number of concurrent connection
     * is reached invoker thread is blocked till a connection become available.
     * This behavior is in conformance with java(script) library specs: delay is
     * acceptable but not data loss. Although this assumption seems naturally we
     * still need to test it... just to be sure.
     */
    _testStressedNativeRequests: function() {
        var COUNT = 1000;
        var src = [], dst = [], req = [];
        for (var i = 0; i < COUNT; i++) {
            src.push(Math.uuid());
        }

        var progressView = Doc.getById('progress');
        var countView = Doc.getById('count');

        var createXHR = function() {
            if (js.Engine.TRIDENT) {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
            return new XMLHttpRequest();
        };
        var checkResults = function() {
            var count = 0;
            for (i = 0; i < COUNT; i++) {
                if (src.contains(dst[i])) {
                    count++;
                }
            }
            assertEqualsAsync(COUNT, count);
            NetTest._write('stressed native requests... done');
        };

        for (i = 0; i < COUNT; i++) {
            req[i] = new function() {
                var r = createXHR();
                r.open('POST', 'loop.xsp');
                r.onreadystatechange = function() {
                    if (r.readyState === js.net.ReadyState.DONE) {
                        dst.push(r.responseText);
                        countView.set(dst.length);
                        if (dst.length === COUNT) {
                            NetTest._write('stressed native requests... reception complete');
                            checkResults();
                        }
                    }
                };
                r.send(src[i]);
            };
        }
        NetTest._write('stressed native requests... transmission complete');
    },

    _write: function(text, passed) {
        function add(node) {
            document.getElementById('scratch-area').appendChild(node);
        }
        add(document.createTextNode(text));
        var resolution = document.createElement('span');
        if (passed) {
            resolution.style.color = 'green';
            resolution.appendChild(document.createTextNode('pass'));
        }
        else {
            resolution.style.color = 'red';
            resolution.appendChild(document.createTextNode('fail'));
        }
        add(resolution);
        add(document.createElement('br'));
    }
};
TestCase.register('js.tests.net.XhrIntegrationTests');
