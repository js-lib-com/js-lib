if (typeof js === 'undefined') {
    js = {};
}
if (typeof js.tests === 'undefined') {
    js.tests = {};
}
if (typeof js.tests.lang === 'undefined') {
    js.tests.lang = {};
}

js.tests.lang.OperatorUnitTests = {
    testStatic : function (context) {
        context.push('js.lang.Operator.$static._initializers');

        var invocationCount = 0;
        function staticInitializer () {
            ++invocationCount;
        }

        js.lang.Operator.$static._initializers = [];
        $static(staticInitializer);
        assertEquals(1, js.lang.Operator.$static._initializers.length);
        assertEquals(staticInitializer, js.lang.Operator.$static._initializers[0]);
        assertEquals(0, invocationCount);

        $static(staticInitializer, true);
        assertEquals(1, js.lang.Operator.$static._initializers.length);
        assertEquals(1, invocationCount);
    },

    testPackage : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var concrete = null;
        $package('pack.q.name');
        assertNull(concrete);
        assertTrue(typeof pack !== 'undefined');
        assertEquals('pack', pack.__package__);
        assertTrue(typeof pack.q !== 'undefined');
        assertEquals('pack.q', pack.q.__package__);
        assertTrue(typeof pack.q.name !== 'undefined');
        assertEquals('pack.q.name', pack.q.name.__package__);

        // valid package names must contains only lower case letters and decimal
        // digits but starts with letter
        var invalidPackageNames = [ undefined, null, '', 'PackageName', '_package_name', 'Package.Name', 'package.0v' ];
        for ( var i = 0; i < invalidPackageNames.length; ++i) {
            concrete = null;
            $package(invalidPackageNames[i]);
            assertEquals('Invalid package name |%s|.', concrete);
        }
    },

    testDeclare : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var concrete = null;
        window.pack = undefined; // ensure pack is not already create by previous tests

        $declare('pack.q.name.ClassName.InnerClass');
        assertNull(concrete);
        assertTrue(typeof pack !== 'undefined');
        assertEquals('pack', pack.__package__);
        assertTrue(typeof pack.q !== 'undefined');
        assertEquals('pack.q', pack.q.__package__);
        assertTrue(typeof pack.q.name !== 'undefined');
        assertEquals('pack.q.name', pack.q.name.__package__);
        assertTrue(typeof pack.q.name.ClassName !== 'undefined');
        assertTrue(typeof pack.q.name.ClassName.InnerClass !== 'undefined');

        var invalidClassNames = [ undefined, null, '', 'PackageName', '_package_name', 'Package.Name', 'package.0v', 'comp.prj', 'comp.prj.className' ];
        for ( var i = 0; i < invalidClassNames.length; ++i) {
            concrete = null;
            $declare(invalidClassNames[i]);
            assertEquals('Invalid class name |%s|.', concrete);
        }
    },

    testExtends : function () {
        var A = function (name) {
            this._name = name;
        };
        A.prototype = {
            a : function () {
                return this._name;
            }
        };

        var B = function () {
            this.$super(arguments);
        };
        B.prototype = {
            b : function () {
            }
        };
        $extends(B, A);

        var b = new B('John Doe');
        assertTrue(typeof b.a === 'function');
        assertTrue(typeof b.b === 'function');
        assertEquals('John Doe', b.a());
        assertTrue(typeof b.b() === 'undefined');
        assertEquals('John Doe', b._name);
        assertEquals(B, b.__ctor__);
        assertEquals(A, B.__super__);
        assertTrue(typeof b.$super === 'function');
    },

    testOverrideUserDefinedMethods : function () {
        var A = function () {
        };
        A.prototype = {
            a : function () {
                return 'a';
            }
        };

        var B = function () {
        };
        B.prototype = {
            a : function () {
                return 'b';
            }
        };
        $extends(B, A);

        var a = new A();
        var b = new B();
        assertTrue(typeof a.a === 'function');
        assertTrue(typeof b.a === 'function');
        assertEquals('a', a.a());
        assertEquals('b', b.a());

        // changes to superclass prototype after extension are not reflected on subclass
        A.prototype.b = function () {
        };
        assertTrue(typeof a.b !== 'undefined');
        assertTrue(typeof b.b !== 'undefined');
    },

    testOverrideBuiltinMethods : function () {
        var A = function () {
        };
        A.prototype = {
            valueOf : function () {
                return 'a';
            },

            toString : function () {
                return 'A';
            }
        };
        $extends(A, Object);

        var a = new A();
        assertEquals('a', a.valueOf());
        assertEquals('A', a.toString());
    },

    testCallSuperMethod : function () {
        var A = function (name) {
            this._name = name;
        };
        A.prototype = {
            a : function (name) {
                return this._name + ':' + name;
            },

            alpha : function (name) {
                return this._name + '&' + name;
            }
        };

        var B = function (name) {
            this._name = name;
        };
        B.prototype = {
            a : function (name) {
                return this.$super('a', arguments);
            }
        };
        $extends(B, A);

        var C = function (name) {
            this._name = name;
        };
        C.prototype = {
            alpha : function (name) {
                return this.$super('alpha', arguments);
            }
        };
        $extends(C, B);

        var a = new A('foo');
        var b = new B('bar');
        var c = new C('car');
        assertEquals('foo:John Doe', a.a('John Doe'));
        assertEquals('bar:John Doe', b.a('John Doe'));
        assertEquals('car&John Doe', c.alpha('John Doe'));
    },

    testSuperFromMethodDefinedInConstructor : function () {
        var A = function () {
        };
        A.prototype = {
            a : function () {
                return 'supera';
            }
        };
        var B = function () {
            this.a = function () {
                return this.$super('a');
            };
        };
        $extends(B, A);
        var b = new B();
        assertEquals('supera', b.a());
    },

    testMissingSuperMethod : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var A = function () {
        };
        A.prototype = {
            d : 1964,
            a : function () {
            }
        };
        var B = function () {
        };
        B.prototype = {
            b : function () {
                // not overriden should be treated as missing method
                this.$super('a');
            },
            c : function () {
                // not defined method
                this.$super('c');
            },
            d : function () {
                // super is not a function
                this.$super('d');
            }
        };
        $extends(B, A);
        var b = new B();

        var concrete = null;
        b.b();
        assertEquals('Super method |%s| does not override a subclass method.', concrete);

        concrete = null;
        b.c();
        assertEquals('Super method |%s| not found.', concrete);

        concrete = null;
        b.d();
        assertEquals('Super method |%s| is not a function.', concrete);
    },

    /**
     * Superclass properties declared into constructor are not inherited unless $super operator is explictly invoked.
     */
    testConstructorDefinedProperties : function () {
        var A = function () {
            this._name = 'foo';
        };
        var B = function () {
        };
        $extends(B, A);
        var C = function () {
            this.$super();
        };
        $extends(C, A);

        var a = new A();
        var b = new B();
        var c = new C();
        assertTrue(typeof a._name !== 'undefined');
        assertTrue(typeof b._name === 'undefined');
        assertTrue(typeof c._name !== 'undefined');
    },

    testExtendsHandler : function () {
        var extendsInvoked = false;
        var A = function () {
        };
        A.prototype = {
            a : function () {
            }
        };
        // superclass extends handler
        A.$extends = function (subClass) {
            extendsInvoked = true;
            assertEquals(B, subClass);
            // extends handler is invoked after subclass augmentation
            assertTrue(typeof subClass.prototype.a === 'function');
        };
        var B = function () {
        };
        $extends(B, A);
        assertTrue(extendsInvoked);
    },

    testExtendsInvalidClasses : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var concrete = null;
        $extends();
        assertEquals('Trying to extend undefined subclass.', concrete);

        concrete = null;
        $extends({});
        assertEquals('Trying to extend invalid subclass %s.', concrete);

        concrete = null;
        $extends(function () {
        });
        assertEquals('Undefined superclass when trying to extend %s.', concrete);

        concrete = null;
        $extends(function () {
        }, {});
        assertEquals('Invalid superclass %s when trying to extend %s.', concrete);
    },

    testMixin : function () {
        var a = function () {
        };
        a.prototype = {
            an : 1964,
            bn : 1965,
            _cn : 1966,
            af : function () {
                return 'foo';
            },
            _cf : function () {
            }
        };
        var b = {
            bn : 2010,
            bf : function () {
                return 'bar';
            },
            _cf : function () {
                return 'car';
            }
        };
        $mixin(a, b);
        assertEquals(1964, a.prototype.an);
        assertEquals(1965, a.prototype.bn);
        assertEquals('foo', a.prototype.af());
        assertEquals('bar', a.prototype.bf());
        assertUndefined(a.prototype._cf());
        assertEquals(1966, a.prototype._cn);
    },

    testArgs : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var concrete = null;
        assertTrue(typeof $args() === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var concrete = null;
        assertTrue(typeof $args(null) === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var concrete = null;
        assertTrue(typeof $args({}) === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var concrete = null;
        assertTrue(typeof $args([]) === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var concrete = null;
        assertTrue(typeof $args(true) === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var concrete = null;
        assertTrue(typeof $args(function () {
        }) === 'undefined');
        assertEquals('Invalid function call arguments: undefined, null or callee function missing.', concrete);

        var array = null;
        function args () {
            array = $args(arguments);
        }
        args(true, 1964, 'John Doe');
        assertEquals(3, array.length);
        assertTrue(array[0]);
        assertEquals(1964, array[1]);
        assertEquals('John Doe', array[2]);

        array = null;
        args = function () {
            array = $args(arguments, 1);
        };
        args(true, 1964, 'John Doe');
        assertEquals(2, array.length);
        assertEquals(1964, array[0]);
        assertEquals('John Doe', array[1]);
    },

    testLegacy : function (context) {
        context.push('js.ua.System.error');
        js.ua.System.error = function (message) {
            concrete = message;
        };

        var legacyInvoked = false;
        $legacy(false, function () {
            legacyInvoked = true;
        });
        assertFalse(legacyInvoked);

        $legacy(true, function () {
            legacyInvoked = true;
        });
        assertTrue(legacyInvoked);

        var concrete = null;
        $legacy(true, function () {
            throw 'Unspecified Exception.';
        });
        assertEquals('Legacy code execution fail. %s', concrete);
    },

    testAssert : function () {
        try {
            $assert(true);
        } catch (er) {
            TestCase.fail('True assertion should not rise exception.');
        }

        function assertAssertion (expected) {
            try {
                var args = [ false ];
                for ( var i = 1; i < arguments.length; ++i) {
                    args.push(arguments[i]);
                }
                $assert.apply(this, args);
                TestCase.fail('False assertion should rise exception.');
            } catch (er) {
                assertTrue(er.message.indexOf(expected) === 0);
            }
        }
        assertAssertion('Assertion fails');
        assertAssertion('Assertion fails on null', null);
        assertAssertion('Assertion fails on js.net.RPC#send', 'js.net.RPC#send');
        assertAssertion('js.net.RPC#send: null', 'js.net.RPC#send', null);
        assertAssertion('js.net.RPC#send: Missing data.', 'js.net.RPC#send', 'Missing data.');
        assertAssertion('js.net.RPC#send: Missing data.', 'js.net.RPC#send', 'Missing %s.', 'data');
    },

    testFormat : function (context) {
        assertEquals('John Doe is UNEMPLOYED.', $format('%s is %S.', 'John Doe', 'unemployed'));
        assertEquals('JOHN DOE is unemployed.', $format('%1$S is %2$s.', 'John Doe', 'unemployed'));
        assertEquals('John is UN.', $format('%.4s is %.2S.', 'John Doe', 'unemployed'));
        assertEquals('John Doe   .', $format('%11s.', 'John Doe'));
        assertEquals('   John Doe.', $format('%-11s.', 'John Doe'));
        assertEquals('Price 1234 USD.', $format('Price %d USD.', 1234));
        assertEquals('Price 1235 USD.', $format('Price %d USD.', 1234.56));
        assertEquals('Price 1234 USD.', $format('Price %e USD.', 1234));
        assertEquals('Price 1234.56 USD.', $format('Price %e USD.', 1234.56));
        assertEquals('Price 1234 USD.', $format('Price %E USD.', 1234));
        assertEquals('Price 1234.56 USD.', $format('Price %E USD.', 1234.56));
        assertEquals('Octal number 10.', $format('Octal number %o.', 8));
        assertEquals('Hexadecimal number ff.', $format('Hexadecimal number %x.', 255));
        assertEquals('Hexadecimal number FF.', $format('Hexadecimal number %X.', 255));
        assertEquals('Percent is 123%.', $format('Percent is 123%%.'));
        assertEquals('Number is 123%.', $format('Number is %d%%.', 123));
        assertEquals('Number is %123%.', $format('Number is %%%d%%.', 123));
        assertEquals('%John Doe%123%.', $format('%%%s%%%d%%.', 'John Doe', 123));

        assertEquals('John Doe is null.', $format('%1$s is %2$s.', 'John Doe', null));
        assertEquals('Price 0 USD.', $format('Price %d USD.', null));
        // on missing argument uses null
        assertEquals('John Doe is null.', $format('%1$s is %2$s.', 'John Doe'));
        assertEquals('Price 0 USD.', $format('Price %d USD.'));

        function fn (message, args) {
            return $format(arguments);
        }
        assertEquals('John Doe is UNEMPLOYED.', fn('%s is %S.', 'John Doe', 'unemployed'));
        fn = function (level, message, args) {
            return level + ':' + $format(arguments, 1);
        };
        assertEquals('DEBUG:John Doe is UNEMPLOYED.', fn('DEBUG', '%s is %S.', 'John Doe', 'unemployed'));

        context.push('js.ua.System.print');
        js.ua.System.print = function (message) {
            concrete = message;
        };
        var concrete = null;
        assertEquals('John Doe is %q.', $format('%s is %q.', 'John Doe', 'unemployed'));
        assertNull(concrete);

        concrete = null;
        assertEquals('NaN.', $format('%d.', 'John Doe'));
        assertEquals('Expected number but get string when trying to format integer value.', concrete);

        concrete = null;
        assertEquals('123.', $format('%d.', '123.45'));
        assertEquals('Expected number but get string when trying to format integer value.', concrete);
    },

    /**
     * Pattern before fix was /%%|%(?:(\d+)\$)?([-#a-zA-Z]+)?(\d+)?(?:\.(\d+))?([a-zA-Z])/g
     * <p>
     * It was too tolerant accepting as flags conversion codes as a consequence next format is not interpreted
     * correctly:
     * 
     * <pre>'%s-id'</pre>
     * 
     * flags is 's-i' and should be empty and conversion is 'd' and should be 's'
     */
    testFormatFlagsRegression : function () {
        assertEquals('js-toast-id.', $format('js-%s-id.', 'toast'));
    }
};
TestCase.register('js.tests.lang.OperatorUnitTests');
