$package('js.tests.net');

js.tests.net.AbstractTimer =
{
    testConstructor: function() {
        assertEquals('js.util.AbstractTimer', js.util.AbstractTimer.prototype.toString());

        var timer = new js.util.AbstractTimer();
        assertZero(timer._value);
        assertNull(timer._id);
        assertFalse(timer._ticking);
    },

    testSetters: function(context) {
        var timer = new js.util.AbstractTimer();
        assertEquals(timer, timer.set(1000));
        assertEquals(1000, timer.get());

        function callback() {
        };
        assertEquals(timer, timer.setCallback(callback));
        assertEquals(callback, timer._callback);
        assertEquals(window, timer._scope);

        var scope =
        {
            callback: function() {
            }
        };
        timer.setCallback(scope.callback, scope);
        assertEquals(scope.callback, timer._callback);
        assertEquals(scope, timer._scope);

        assertFalse(timer._ticking);
        assertFalse(timer.isTicking());
        timer._id = 1;
        assertTrue(timer.isTicking());

        assertAssertion(timer, 'set');
        assertAssertion(timer, 'set', -100);
        assertAssertion(timer, 'set', '1000');
        assertEquals(1000, timer.get());
        assertAssertion(timer, 'setCallback');
        assertAssertion(timer, 'setCallback', null);
        assertAssertion(timer, 'setCallback', {});
        assertAssertion(timer, 'setCallback', callback, null);
        assertAssertion(timer, 'setCallback', callback, 123.45);

        $assert.disable();
        timer.set();
        timer.set(-100);
        assertEquals(1000, timer.get());
        timer.set('2000');
        assertEquals(2000, timer.get());

        context.push('js.util.AbstractTimer.prototype.stop');
        var stopInvoked = true;
        js.util.AbstractTimer.prototype.stop = function() {
            stopInvoked = true;
        };
        timer.set(0);
        assertTrue(stopInvoked);

        timer.setCallback(callback);
        assertEquals(window, timer._scope);
    },

    testStart: function(context) {
        context.push('js.util.AbstractTimer.prototype._handler');
        var handlerInvoked = false;
        js.util.AbstractTimer.prototype._handler = function() {
            assertEquals(timer, this);
            handlerInvoked = true;
        };

        context.push('js.util.AbstractTimer.prototype._start');
        var startInvoked = false;
        js.util.AbstractTimer.prototype._start = function(handler, value) {
            handler();
            assertTrue(handlerInvoked);
            assertEquals(1000, value);
            startInvoked = true;
            return 1234;
        };

        context.push('js.util.AbstractTimer.prototype.stop');
        var stopInvoked = false;
        js.util.AbstractTimer.prototype._stop = function() {
            stopInvoked = true;
        };

        var timer = new js.util.AbstractTimer();
        assertEquals(timer, timer.start());
        assertFalse(startInvoked);
        assertFalse(timer._ticking);

        timer.set(1000);
        timer.start();
        assertTrue(startInvoked);
        assertEquals(1234, timer._id);

        assertFalse(stopInvoked);
        timer.start();
        assertTrue(stopInvoked);
    },

    testHandler: function(context) {
        context.push('js.util.AbstractTimer.prototype.stop');

        var stopInvoked = false;
        js.util.AbstractTimer.prototype.stop = function() {
            stopInvoked = true;
        };

        var timer = new js.util.AbstractTimer();
        assertUndefined(timer._handler());
        assertFalse(stopInvoked);

        var callbackInvoked = false;
        timer._scope = window;
        timer._callback = function() {
            assertEquals(window, this);
            callbackInvoked = true;
        };
        timer._handler();
        assertTrue(callbackInvoked);
        assertFalse(stopInvoked);

        // if callback throws error, global error handler and timer stop should be invoked
        context.push('js.ua.System.error');
        var errorInvoked = false;
        js.ua.System.error = function(er) {
            assertEquals('error', er);
        };

        timer._callback = function() {
            callbackInvoked = true;
            throw 'error';
        };
        stopInvoked = false;
        callbackInvoked = false;
        timer._handler();
        assertTrue(callbackInvoked);
        assertTrue(stopInvoked);
    },

    testStop: function(context) {
        context.push('js.util.AbstractTimer.prototype._stop');

        var stopInvoked = false;
        js.util.AbstractTimer.prototype._stop = function() {
            stopInvoked = true;
        };

        var timer = new js.util.AbstractTimer();
        timer.stop();
        assertFalse(stopInvoked);
        timer.set(1000);
        assertNull(timer._id);
        assertFalse(timer.isTicking());
        timer.start();
        assertNotNull(timer._id);
        assertTrue(timer.isTicking());
        timer.stop();
        assertTrue(stopInvoked);
        assertNull(timer._id);
        assertFalse(timer.isTicking());
        assertEquals(1000, timer._value);
    }
};
TestCase.register('js.tests.net.AbstractTimer');
