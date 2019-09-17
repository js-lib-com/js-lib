__js_debug__ = true;

TestCase =
{
    /**
     * Test case run-time context.
     */
    Context: function() {
        this._stack = [];

        /**
         * Save function on stack.
         *
         * @param String functionQualifiedName
         */
        this.push = function(functionQualifiedName) {
            var i = functionQualifiedName.lastIndexOf('.');
            var objectName = (i !== -1) ? functionQualifiedName.substring(0, i) : 'window';
            this._stack.push(
            {
                object: eval(objectName),
                functionName: functionQualifiedName.substring(i + 1),
                saved: eval(functionQualifiedName)
            });
        };

        /**
         * Restore function from stack.
         */
        this.pop = function() {
            for (var i = 0, el; i < this._stack.length; ++i) {
                el = this._stack[i];
                el.object[el.functionName] = el.saved;
            }
        };

        /**
         * Context destroy. Called by tests engine after test case execution.
         */
        this.destroy = function() {
            // restore altered functions from stack
            this.pop();
        };
    },

    /**
     * j(s)-suite exception. Thrown on a failing test to actually abort running
     * test case.
     */
    Exception: function(message) {
        this.message = message;
    },

    /**
     * Registered test units.
     * @type Array
     */
    _testUnits: [],

    /**
     * Register test unit.
     *
     * @param String testUnit test unit class name.
     */
    register: function(testUnit) {
        this._testUnits.push(testUnit);
    },

    _testsIndex: 0,

    _testsCount: 0,

    _passedTestsCount: 0,

    /**
     * Run tests session. This is the core of j(s)-lib unit tests. It executes all
     * registered unit tests and complete a report.
     */
    runTestsSession: function() {
        // main tests loop: traverse all registered test units and execute one by one
        var startTime = new Date().getTime();
        for (var i = 0; i < TestCase._testUnits.length; i++) {
            TestCase.runTestUnit(TestCase._testUnits[i]);
        }
        var elapsedTime = new Date().getTime() - startTime;

        // prepare and display conclusion
        var node = document.getElementById('scratch-area');
        if (!node) {
            if (TestCase._testsCount != TestCase._passedTestsCount) {
                alert('Tests suite fail!\r\nTotal Tests: ' + TestCase._testsCount + '\r\nPassed Tests: ' + TestCase._passedTestsCount);
            }
            return;
        }

        var report = '' +
        '<table class="report">' +
        '	<tr><td>Total tests</td><td>:</td><td id="total-tests"></td></tr>' +
        '	<tr><td>Ran tests</td><td>:</td><td id="run-tests"></td></tr>' +
        '	<tr><td>Elapsed time (ms)</td><td>:</td><td id="elapsed-time"></td></tr>' +
        '	<tr><td></td><td>:</td><td></td></tr>' +
        '	<tr><td>Passed tests</td><td>:</td><td id="passed-tests"></td></tr>' +
        '	<tr><td>Failed tests</td><td>:</td><td id="failed-tests"></td></tr>' +
        '	<tr><td>Tests to be written</td><td>:</td><td id="tests-to-be-written"></td></tr>' +
        '</table>';
        node.innerHTML = report;

        function write(id, text) {
            document.getElementById(id).innerHTML = text;
        }

        elapsedTime = elapsedTime.toString(10);
        var rex = /(\d+)(\d{3})/;
        while (rex.test(elapsedTime)) {
            elapsedTime = elapsedTime.replace(rex, '$1,$2');
        }

        write('total-tests', TestCase._testsIndex);
        write('run-tests', TestCase._testsCount);
        write('elapsed-time', elapsedTime);
        write('passed-tests', TestCase._passedTestsCount);
        write('failed-tests', (TestCase._testsCount - TestCase._passedTestsCount));
        write('tests-to-be-written', (TestCase._testsIndex - TestCase._testsCount));
    },

    /**
     * Run test unit. Execute all test cases from given test unit.
     *
     * @param String className test unit class name.
     */
    runTestUnit: function(className) {
        this._println('Unit Tests: ' + className, 'color', 'blue');
        var testUnit = eval(className);
        if (typeof testUnit === 'undefined') {
            this._println('Test class not found. Unit tests aborted!', 'color', 'red');
            this._println();
            return;
        }

        if (typeof testUnit.beforeClass === 'function') {
            try {
                testUnit.beforeClass();
            }
            catch (e) {
                this._println('Initialization failed: ' + e.message);
                this._println('Unit Tests aborted', 'color', 'red');
                this._println();
                return;
            }
        }

        var testContext, context;
        for (var testCase in testUnit) {
            if (testCase.indexOf('test') !== 0) {
                continue;
            }
            this._print(this._testsIndex++ + '. ' + this._format(testCase) + '... ');

            if (typeof testUnit.before === 'function') {
                try {
                    testUnit.before();
                }
                catch (e) {
                    this._println(e.message, 'color', 'red');
                    continue;
                }
            }

            var fail = false;
            try {
                if (typeof $assert !== 'undefined') {
                    $assert.enable();
                }
                context = new TestCase.Context();
                if (testUnit[testCase].call(testUnit, context) === false) {
                    this._println('not implemented', 'color', 'blue');
                    continue;
                }
            }
            catch (e) {
                fail = true;
                if (!e.message) {
                    e.message = 'Test assertion fails.';
                }
                this._println(e.message, 'color', 'red');
            }
            context.destroy();

            this._testsCount++;
            if (!fail) {
                this._printPass();
                this._passedTestsCount++;
            }

            if (typeof testUnit.after === 'function') {
                try {
                    testUnit.after();
                }
                catch (e) {
                    this._println(e.message, 'color', 'red');
                }
            }
        }

        if (typeof testUnit.afterClass === 'function') {
            try {
                testUnit.afterClass();
            }
            catch (e) {
                this._println(e.message, 'color', 'red');
            }
        }

        this._println();
    },

    /**
     * Test case fail.
     *
     * @param String message fail reason.
     */
    fail: function(message) {
        throw new TestCase.Exception(message);
    },

    _printPass: function() {
        this._println('pass', 'color', 'green');
    },

    _println: function(s, attr, value) {
        this._print(s, attr, value);
        var br = document.createElement('br');
        document.body.appendChild(br);
    },

    _print: function(s, attr, value) {
        if (s) {
            var span = document.createElement('span');
            span.innerHTML = s;
            document.body.appendChild(span);
            if (attr && value) {
                span.style[attr] = value;
            }
        }
    },

    _format: function(s) {
        var r = '';
        for (var i = 4; i < s.length; i++) {
            var c = s.charAt(i);
            if (c >= 'A' && c <= 'Z') {
                c = c.toLowerCase();
                r += ' ';
            }
            r += c;
        }
        return r;
    }
};

// --------------------------------------------------------
// Tests engine bootstrap
// --------------------------------------------------------

window.onload = function() {
    // take care to exit load event handler quickly and execute tests session asynchronously
    window.setTimeout(function() {
        TestCase.runTestsSession.call(TestCase);
    }, 10);
};

// --------------------------------------------------------
// Test assertions
// --------------------------------------------------------

/**
 * Assert value is true. This assertion fails if value to test is not true.
 *
 * @param Value value value to test if true,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertTrue(value, message) {
    if (!value) {
        TestCase.fail(_reason(arguments, 1, 'Assert true fails.'));
    }
};

/**
 * Assert value is false. This assertion fails if value to test is not false.
 *
 * @param Value value value to test if false,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertFalse(value) {
    assertTrue(!value, _reason(arguments, 1, 'Assert false fails.'));
};

/**
 * Assert value is undefined.
 *
 * @param Value value value to test if undefined,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertUndefined(value) {
    assertTrue(typeof value === 'undefined', _reason(arguments, 1, 'Assert undefined fails.'));
};

/**
 * Assert value is defined.
 *
 * @param Value value value to test if defined,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertDefined(value, message) {
    assertTrue(typeof value !== 'undefined', _reason(arguments, 1, 'Assert defined fails.'));
};

/**
 * Assert value is null.
 *
 * @param Value value value to test if null,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertNull(value, message) {
    assertTrue(value === null, _reason(arguments, 1, 'Assert null fails. Expected null but got [%s].', value));
};

/**
 * Assert value is not null.
 *
 * @param Value value value to test if not null,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertNotNull(value, message) {
    assertTrue(value !== null, _reason(arguments, 1, 'Assert not null fails.'));
};

/**
 * Assert value exists. This assertion fails if value is undefined or null.
 *
 * @param Value value value to test if exists,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertExists(value, message) {
    assertTrue(typeof value !== 'undefined', _reason(arguments, 1, 'Assert exists fails. Value is undefined.'));
    assertTrue(value !== null, _reason(arguments, 1, 'Assert exists fails. Value is null.'));
};

/**
 * Assert equals. This assertion fails if expected and concrete values are not strictly
 * equals.
 *
 * @param Value expected expected value,
 * @param Value concrete concrete value,
 * @param String... message failing reasons.
 */
function assertEquals(expected, concrete, message) {
    if (expected !== concrete) {
        TestCase.fail(_reason(arguments, 2, 'Assert equals fails. Expected [%s] but got [%s].', expected, concrete));
    }
};

/**
 * Assert the same. This assertion fails if expected and concrete values have not
 * the same value.
 *
 * @param Value expected expected value,
 * @param Value concrete value,
 * @param String... message optional fail reason,
 * @param Value... args optional message arguments, if message is formatted.
 */
function assertTheSame(expected, concrete, message) {
    if (expected instanceof Array) {
        assertEquals(expected.length, concrete.length);
        for (var i = 0, l = expected.length; i < l; i++) {
            assertTheSame(expected[i], concrete[i], _reason(arguments, 2));
        }
        return;
    }

    if (expected instanceof Date) {
        expected.setMilliseconds(0);
        concrete.setMilliseconds(0);
        assertEquals(expected.getTime(), concrete.getTime(), _reason(arguments, 2, 'Assert the same fails. Expected %s but got %s.', expected, concrete));
        return;
    }

    if (typeof expected === 'object') {
        for (var p in expected) {
            assertTheSame(expected[p], concrete[p], _reason(arguments, 2));
        }
        for (var p in concrete) {
            assertTheSame(expected[p], concrete[p], _reason(arguments, 2));
        }
        return;
    }

    assertTrue(expected == concrete, _reason(arguments, 2, 'Assert the same fails. Expected %s but got %s.', expected, concrete));
};

function _reason(callerArguments, offset, message) {
    function format(message) {
        if (typeof message.callee === 'function') {
            var args = [], startIdx = arguments.length > 1 ? arguments[1] : 0;
            for (var i = startIdx; i < arguments[0].length; i++) {
                args.push(arguments[0][i]);
            }
            return arguments.callee.apply(this, args);
        }

        function string(value) {
            if (typeof value === 'undefined') {
                return 'undefined';
            }
            if (value === null) {
                return 'null';
            }
            if (typeof value !== 'string' && !(value instanceof String)) {
                if (typeof value === 'function') {
                    if (typeof value.prototype !== 'undefined' && typeof value.prototype.toString === 'function') {
                        value = value.prototype.toString();
                    }
                    else {
                        value = 'unknown';
                    }
                }
                else {
                    value = typeof value.toString === 'function' ? value.toString() : 'unknown';
                }
            }
            return value;
        };

        function integer(value) {
            if (value === null) {
                return 0;
            }
            if (typeof value !== 'number' && !(value instanceof Number)) {
                value = Number(value);
            }
            return value.toString(10);
        };

        var handlers =
        {
            s: string,
            S: string,
            d: integer
        };
        var pattern = /%([sSd])/g, index = 0, args = _args(arguments, 1);
        return message.replace(pattern, function(match, conversion, offset, format) {
            var handler = handlers[conversion];
            return handler(args[index++]);
        });
    }

    if (typeof callerArguments === 'string') {
        return format(arguments, 0);
    }
    if (callerArguments.length > offset) {
        return format(callerArguments, offset);
    }
    return format(arguments, 2);
};

function _args(args, offset) {
    var a = [];
    for (var i = offset; i < args.length; ++i) {
        a.push(args[i]);
    }
    return a;
};

function _new(ctor, args) {
    switch (args.length) {
        case 0:
            new ctor();
            break;
        case 1:
            new ctor(args[0]);
            break;
        case 2:
            new ctor(args[0], args[1]);
            break;
        case 3:
            new ctor(args[0], args[1], args[2]);
            break;
        case 4:
            new ctor(args[0], args[1], args[2], args[3]);
            break;
        default:
            alert('TestCase#newInstance: Too many arguments: ' + args.length);
    }
};

/**
 * Assert assertion. Execute named function expecting assertion to be thrown.
 *
 * @param Object scope function execution scope, can be null for global,
 * @param String fname the name of function to invoke,
 * @param Object... args optional function arguments.
 */
function assertAssertion(scope, fname) {
    var f = (scope || window)[fname];
    assertDefined(f, _reason('Assert assertion fails. Function %s#%s not found.', scope, fname));

    var args = _args(arguments, 2);
    var assert = false;
    try {
        if (typeof scope.__package__ !== 'undefined') {
            _new(f, args);
        }
        else {
            f.apply(scope, args);
        }
    }
    catch (e) {
        if (e instanceof js.lang.AssertException) {
            assert = true;
        }
    }

    if (!assert) {
        TestCase.fail(_reason('Assert assertion fails. Call on %s#%s with arguments [%s] does not rise assertion.', scope, fname, args));
    }
};

/**
 * Assert exception. Execute named function expecting exception to be thrown.
 *
 * @param Error exception expected exception,
 * @param Object scope function execution scope, can be null for global,
 * @param Function fname the name of function to invoke,
 * @param Object... args optional function arguments.
 */
function assertException(exception, scope, fname) {
    var f = (scope || window)[fname];
    assertDefined(f, _reason('Assert exception fails. Function %s#%s not found.', scope, fname));

    var args = _args(arguments, 3);
    var thrown = false;
    try {
        if (typeof scope.__package__ !== 'undefined') {
            _new(f, args);
        }
        else {
            f.apply(scope, args);
        }
    }
    catch (e) {
        if (e instanceof exception) {
            thrown = true;
        }
    }

    if (!thrown) {
        TestCase.fail(_reason('Assert exception fails. Call on %s#%s with arguments [%s] does not rise exception %s.', scope, fname, args, exception));
    }
};

function assertString(value) {
    assertTrue(typeof value === 'string' || value instanceof String, _reason(arguments, 1, 'Assert string fails. Expected string but got %s.', typeof value));
};

function assertNumber(value) {
    return assertTrue(typeof value === 'number' || value instanceof Number, _reason(arguments, 1, 'Assert number fails. Expected number but got %s.', typeof value));
};

function assertBoolean(value) {
    return assertTrue(typeof value === 'boolean' || value instanceof Boolean, _reason(arguments, 1, 'Assert boolean fails. Expected boolean but got %s.', typeof value));
};

function assertObject(value) {
    assertTrue(typeof value === 'object', _reason(arguments, 1, 'Assert object fails. Expected object but got %s.', typeof value));
};

function assertFunction(value) {
    assertTrue(typeof value === 'function', _reason(arguments, 1, 'Assert function fails. Expected function but got %s.', typeof value));
};

/**
 * Assert class. A function used as constructor throw assertion if trying to
 * invoke it as function instead with new operator. Also a constructor prototype
 * should have toString method returning class name.
 *
 * @param Value value
 */
function assertClass(value, message) {
    assertString(value, _reason(arguments, 1, 'Assert class fails. Class name is undefined, null or empty.'));
    assertTrue(/^(?:[a-z][a-z0-9]*\.)+(?:[A-Z][A-Za-z0-9_]*\.)*[A-Z][A-Za-z0-9_]*$/g.test(value), _reason(arguments, 1, 'Assert class fails. Class name [%s] is not well formatted.', value));
    var ctor = eval(value);
    assertDefined(ctor, _reason(arguments, 1, 'Assert class fails. Class [%s] not found.', value));
    assertEquals(value, ctor.prototype.toString(), _reason(arguments, 1, 'Assert class fails. Bad class [%s] prototype string representation [%s].', value, ctor.prototype.toString()));
    try {
        ctor();
    }
    catch (er) {
        assertTrue(er instanceof js.lang.AssertException, _reason(arguments, 1, 'Assert class fails. Using constructor [%s] as function throws exception %s.', value, er));
        return;
    }
    TestCase.fail(_reason(arguments, 1, 'Assert class fails. Trying to use a constructor [%s] as a function should assert.', value));
};

function assertArray(array) {
    if (!(array instanceof Array)) {
        TestCase.fail(_reason('Assert array fails. Bad array instanceof.'));
    }
    assertEquals(array.length, arguments.length - 1, _reason('Assert array fails. Array length does not match items count.'));
    for (var i = 0; i < array.length; ++i) {
        assertEquals(array[i], arguments[i + 1], _reason('Assert array fails. Array item #%d does not match. Expected [%s] but got [%s].', i, array[i], arguments[i + 1]));
    }
};

function assertInstanceof(value) {
    for (var i = 1; i < arguments.length; ++i) {
        assertTrue(value instanceof arguments[i], _reason('Assert instanceof fails. Expected [%s] but got [%s].', arguments[i], value));
    }
};

function assertDate(date, y, M, d, h, m, s, ms, message) {
    assertEquals(y, date.getFullYear(), _reason(arguments, 8, 'Assert date fails. Year does not match. Expected %s but got %s.', y, date.getFullYear()));
    assertEquals(M, date.getMonth(), _reason(arguments, 8, 'Assert date fails. Month does not match. Expected %s but got %s.', M, date.getMonth()));
    assertEquals(d, date.getDate(), _reason(arguments, 8, 'Assert date fails. Date does not match. Expected %s but got %s.', d, date.getDate()));
    assertEquals(h, date.getHours(), _reason(arguments, 8, 'Assert date fails. Hours does not match. Expected %s but got %s.', h, date.getHours()));
    assertEquals(m, date.getMinutes(), _reason(arguments, 8, 'Assert date fails. Minutes does not match. Expected %s but got %s.', m, date.getMinutes()));
    assertEquals(s, date.getSeconds(), _reason(arguments, 8, 'Assert date fails. Seconds does not match. Expected %s but got %s.', s, date.getSeconds()));
    assertEquals(ms, date.getMilliseconds(), _reason(arguments, 8, 'Assert date fails. Milliseconds does not match. Expected %s but got %s.', ms, date.getMilliseconds()));
};

function assertUTCDate(date, y, M, d, h, m, s, ms, message) {
    assertEquals(y, date.getUTCFullYear(), _reason(arguments, 8, 'Assert date fails. Year does not match. Expected %s but got %s.', y, date.getFullYear()));
    assertEquals(M, date.getUTCMonth(), _reason(arguments, 8, 'Assert date fails. Month does not match. Expected %s but got %s.', M, date.getMonth()));
    assertEquals(d, date.getUTCDate(), _reason(arguments, 8, 'Assert date fails. Date does not match. Expected %s but got %s.', d, date.getDate()));
    assertEquals(h, date.getUTCHours(), _reason(arguments, 8, 'Assert date fails. Hours does not match. Expected %s but got %s.', h, date.getHours()));
    assertEquals(m, date.getUTCMinutes(), _reason(arguments, 8, 'Assert date fails. Minutes does not match. Expected %s but got %s.', m, date.getMinutes()));
    assertEquals(s, date.getUTCSeconds(), _reason(arguments, 8, 'Assert date fails. Seconds does not match. Expected %s but got %s.', s, date.getSeconds()));
    assertEquals(ms, date.getUTCMilliseconds(), _reason(arguments, 8, 'Assert date fails. Milliseconds does not match. Expected %s but got %s.', ms, date.getMilliseconds()));
};

function assertEmpty(value, message) {
    assertExists(value, _reason('Assert empty fails. Value is undefined or null.'));
    if (typeof value.childNodes !== 'undefined') {
        assertSize(0, value.childNodes, _reason(arguments, 1, 'Assert empty fails. Child nodes present.'));
    }
    else if (typeof value.isEmpty === 'function') {
        assertTrue(value.isEmpty(), _reason(arguments, 1, 'Assert empty fails.'));
    }
    else {
        assertSize(0, value, _reason(arguments, 1, 'Assert empty fails. Expected 0 but got %s.', value));
    }
};

function assertSize(expectedSize, collection, message) {
    if (typeof collection.size === 'function') {
        assertEquals(expectedSize, collection.size(), _reason(arguments, 2, 'Assert size fails. Expected [%d] but got [%d].', expectedSize, collection.size()));
    }
    else if (typeof collection.length !== 'undefined') {
        assertEquals(expectedSize, collection.length, _reason(arguments, 2, 'Assert size fails. Expected [%d] but got [%d].', expectedSize, collection.length));
    }
    else {
        TestCase.fail(_reason('Assert size fails. Given collection [%s] does not have size or length.', collection));
    }
};

/**
 * Assert zero. This assertion fails if value is not a Number equals with 0.
 *
 * @param Value value value to test for zero,
 * @param String... message optional fail reason,
 * @param Value... args optional arguments, if message is formatted.
 */
function assertZero(value, message) {
    return assertTrue(value === 0, _reason(arguments, 1, 'Assert zero fails. Expected 0 but got [%s].', value));
};
