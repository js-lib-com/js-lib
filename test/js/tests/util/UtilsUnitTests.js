$package('js.tests.util');

js.tests.util.UtilsUnitTests = {
    testRandGeneration : function () {
        var rand = new js.util.Rand(100);
        assertInstanceof(rand, js.util.Rand);
        assertTrue(typeof rand.next() === 'number');
        assertFalse(rand.next() instanceof Number);
        assertUndefined(js.util.Rand.call({}, 100));
        assertTrue(typeof js.util.Rand() === 'number');
        assertFalse(js.util.Rand() instanceof Number);

        var TESTS_COUNT = 1000, i, r;
        for (i = 0; i < TESTS_COUNT; ++i) {
            r = rand.next();
            assertTrue(r >= 0 && r < 100);
        }

        rand = new js.util.Rand(100, 200);
        for (i = 0; i < TESTS_COUNT; ++i) {
            r = rand.next();
            assertTrue(r >= 100 && r < 300);
        }
    },

    testRandUniformDistribution : function () {
        var TESTS_COUNT = 10000;
        var rand = new js.util.Rand(4);
        var values = [ 0, 0, 0, 0 ];

        for ( var i = 0, r; i < TESTS_COUNT; ++i) {
            r = rand.next();
            ++values[r];
        }

        assertTrue(values[0] > 0.2 * TESTS_COUNT);
        assertTrue(values[1] > 0.2 * TESTS_COUNT);
        assertTrue(values[2] > 0.2 * TESTS_COUNT);
        assertTrue(values[3] > 0.2 * TESTS_COUNT);
    },

    /**
     * Integer random generator cannot generate unique values in given range, although distribution uniformity is
     * guaranteed - see {@link Rand#_next(Number,Number)}.
     */
    testRandNoUniqueness : function () {
        var TESTS_COUNT = 100;
        var rand = new js.util.Rand(TESTS_COUNT);
        var values = {}, i, r;

        for (i = 0, r; i < TESTS_COUNT; ++i) {
            r = rand.next();
            if (r.toString() in values) {
                break;
            }
            values[r.toString()] = r;
        }

        assertTrue(i < TESTS_COUNT);
    },

    testUuid : function () {
        var uuid = new js.util.UUID();
        assertInstanceof(uuid, js.util.UUID);
        assertTrue(typeof uuid.valueOf() === 'string');
        assertFalse(uuid.valueOf() instanceof String);
        assertUndefined(js.util.UUID.call({}));
        assertTrue(typeof js.util.UUID() === 'string');
        assertFalse(js.util.UUID() instanceof String);
    },

    callback : 'fake callback',
    DELAY : 400,

    _testCreateTimeoutWithNewOperator : function () {
        var counter = 0;
        var context = {
            run : function () {
                var t = new js.util.Timeout(100, this._onTimeout, this);
                t.start();
            },

            _onTimeout : function () {
                counter++;
            }
        };
        context.run();
        window.setTimeout(function () {
            assertEqualsAsync(1, counter);
        }, this.DELAY);
    },

    _testTimeoutInvokedAsFunction : function () {
        var counter = 0;
        var context = {
            run : function () {
                js.util.Timeout(100, this._onTimeout, this);
            },

            _onTimeout : function () {
                counter++;
            }
        };
        context.run();
        window.setTimeout(function () {
            assertEqualsAsync(1, counter);
        }, this.DELAY);
    },

    _testCancelTimeout : function () {
        var counter = 0;
        var t = new js.util.Timeout(100, function () {
            counter++;
        });
        t.start();
        assertTrue(t.isTicking());
        t.stop();
        assertFalse(t.isTicking());
        window.setTimeout(function () {
            assertEqualsAsync(0, counter);
        }, this.DELAY);
    },

    _testTimeoutWithUndefinedCallback : function () {
        var t = js.util.Timeout(100, this.callback);
        assertTrue(t.isTicking());
    },

    _testCreateTimerWithNewOperator : function () {
        var counter = 0;
        var context = {
            run : function () {
                var t = new js.util.Timer(20, this._onTimer, this);
                t.start();
            },

            _onTimer : function () {
                counter++;
            }
        };
        context.run();
        window.setTimeout(function () {
            assertTrueAsync('testCreateTimerWithNewOperator', counter >= 9);
        }, this.DELAY);
    },

    _testTimerInvokedAsFunction : function () {
        var counter = 0;
        var context = {
            run : function () {
                js.util.Timer(20, this._onTimer, this);
            },

            _onTimer : function () {
                counter++;
            }
        };
        context.run();
        window.setTimeout(function () {
            assertTrueAsync('testTimerInvokedAsFunction', counter >= 9);
        }, this.DELAY);
    },

    _testCancelTimer : function () {
        var counter = 0;
        var t = new js.util.Timer(100, function () {
            counter++;
        });
        t.start();
        assertTrue(t.isTicking());
        t.stop();
        assertFalse(t.isTicking());
        window.setTimeout(function () {
            assertEqualsAsync(0, counter);
        }, this.DELAY);
    },

    _testTimerWithUndefinedCallback : function () {
        try {
            js.util.Timer(100, this.callback);
            this.fail();
        } catch (e) {
            assertTrue(e instanceof js.lang.Exception);
            assertTrue(e.message.indexOf('assertion fail on') === 0);
        }
    }
};
TestCase.register('js.tests.util.UtilsUnitTests');
