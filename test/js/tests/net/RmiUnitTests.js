$package('js.tests.net');

js.tests.net.RMI = {
	testConstructor : function() {
		assertClass('js.net.RMI');

		var rmi = new js.net.RMI();
		assertNull(rmi._className);
		assertNull(rmi._methodName);
		assertNull(rmi._parameters);
		assertNull(rmi._callback);
		assertNull(rmi._scope);
		assertNull(rmi._xhr);
	},

	testSetters : function() {
		var rmi = new js.net.RMI();
		rmi.setMethod('comp.prj.RemoteService', 'remoteMethod');
		assertEquals('comp.prj.RemoteService', rmi._className);
		assertEquals('remoteMethod', rmi._methodName);

		rmi.setParameters(true, 123.45);
		assertSize(2, rmi._parameters);
		assertTrue(rmi._parameters[0]);
		assertEquals(123.45, rmi._parameters[1]);

		rmi.setParameters('string');
		assertSize(1, rmi._parameters);
		assertEquals('string', rmi._parameters[0]);

		assertAssertion(rmi, 'setMethod');
		assertAssertion(rmi, 'setMethod', null);
		assertAssertion(rmi, 'setMethod', '');
		assertAssertion(rmi, 'setMethod', {});
		assertAssertion(rmi, 'setMethod', 'comp.prj.Class');
		assertAssertion(rmi, 'setMethod', 'comp.prj.Class', null);
		assertAssertion(rmi, 'setMethod', 'comp.prj.Class', '');
		assertAssertion(rmi, 'setMethod', 'comp.prj.Class', {});
		assertEquals('comp.prj.RemoteService', rmi._className);
		assertEquals('remoteMethod', rmi._methodName);

		assertAssertion(rmi, 'setParameters');
		assertSize(1, rmi._parameters);

		$assert.disable();
		rmi.setMethod();
		rmi.setMethod(null);
		rmi.setMethod('');
		rmi.setMethod('comp.prj.Class');
		rmi.setMethod('comp.prj.Class', null);
		rmi.setMethod('comp.prj.Class', '');
		assertEquals('comp.prj.RemoteService', rmi._className);
		assertEquals('remoteMethod', rmi._methodName);

		rmi.setParameters();
		assertSize(1, rmi._parameters);
	},

	testArgumentsParameter : function() {
		var rmi, offset, params;
		function fn() {
			rmi.setParameters(arguments, offset);
		}
		function param(index) {
			return params[index - offset];
		}
		for (offset = 0; offset < 4; ++offset) {
			rmi = new js.net.RMI();
			fn('string', true, 123.45, [ 'array' ]);
			params = rmi._parameters;
			assertSize(4 - offset, params);
			if (offset < 1) {
				assertEquals('string', param(0));
			}
			if (offset < 2) {
				assertTrue(param(1));
			}
			if (offset < 3) {
				assertEquals(123.45, param(2));
			}
			if (offset < 4) {
				assertEquals('array', param(3)[0]);
			}
		}
	},

	testParameterType : function() {
		var doc = new js.dom.Document(document);
		var form = doc.createElement('form');

		var rmi = new js.net.RMI();
		rmi.setParameters(doc);
		assertInstanceof(rmi._parameters, js.dom.Document);
		rmi.setParameters(form);
		assertInstanceof(rmi._parameters, js.dom.Form);
	},

	testNoParameter : function(context) {
		context.push('js.net.XHR');
		js.net.XHR = function() {
			this.on = function(type, listener, scope) {
			};
			this.open = function(method, url, async) {
			};
			this.setRequestType = function(requestType) {
			};
			this.send = function(data) {
			};
		};

		var rmi = new js.net.RMI();
		assertNull(rmi._parameters);
		rmi.setMethod('comp.prj.RemoteClass', 'remoteMethod');
		rmi.exec();
	},

	testExec : function(context) {
		context.push('js.net.XHR');
		js.net.XHR = function() {
			this.on = function(type, listener, scope) {
				assertEquals('load', type);
				assertEquals(rmi._onLoad, listener);
				assertEquals(rmi, scope);
				this._listener = listener;
				this._scope = scope;
			};

			this.open = function(method, url, async) {
				assertEquals('POST', method);
				assertEquals('comp/prj/RemoteClass/remoteMethod.rmi', url);
				assertTrue(async);
			};

			this.send = function(data) {
				assertEquals(123.45, data[0]);
				assertEquals('string', data[1]);
				this._listener.call(this._scope, response);
			};
		};

		var response = {
			name : 'John Doe',
			age : 48
		};
		var callbackInvoked = false;
		var callback = function(person) {
			assertEquals('John Doe', person.name);
			assertEquals(48, person.age);
			callbackInvoked = true;
		};

		var rmi = new js.net.RMI();
		rmi.setMethod('comp.prj.RemoteClass', 'remoteMethod');
		rmi.setParameters(123.45, 'string');
		rmi.exec(callback, window);
		assertTrue(callbackInvoked);
	},

	testResponseHandler : function() {
		var rmi = new js.net.RMI();
		var callbackInvoked = false;
		rmi._callback = function(person) {
			assertEquals('John Doe', person.name);
			assertEquals(48, person.age);
			callbackInvoked = true;
		};
		rmi._scope = window;

		rmi._onLoad({
			name : 'John Doe',
			age : 48
		});
		assertTrue(callbackInvoked);
		assertUndefined(rmi._callback);
		assertUndefined(rmi._scope);
		assertUndefined(rmi._request);
		assertUndefined(rmi._xhr);
	},

	testLoop : function() {
		var loopValue = {
			name : 'John Doe',
			age : 48
		};
		var className = 'comp.prj.RemoteClass';
		var methodName = 'remoteMethod';

		js.net.RMI.setLoop(className, methodName, loopValue);
		assertTrue(js.net.RMI._hasLoop({
			_className : className,
			_methodName : methodName
		}));
		assertEquals(loopValue, js.net.RMI._getLoopValue({
			_className : className,
			_methodName : methodName
		}));

		var rmi = new js.net.RMI();
		rmi.setMethod('comp.prj.RemoteClass', 'remoteMethod');
		var callbackInvoked = false;
		rmi.exec(function(person) {
			assertEquals('John Doe', person.name);
			assertEquals(48, person.age);
			callbackInvoked = true;
		}, window);
		assertTrue(callbackInvoked);

		js.net.RMI.removeLoop(className, methodName);
		assertFalse(js.net.RMI._hasLoop({
			_className : className,
			_methodName : methodName
		}));
		assertUndefined(js.net.RMI._getLoopValue({
			_className : className,
			_methodName : methodName
		}));
	}
};
TestCase.register('js.tests.net.RMI');
