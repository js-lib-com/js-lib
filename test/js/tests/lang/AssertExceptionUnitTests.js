$package('js.tests.lang');

js.tests.lang.AssertExceptionUnitTests =
{
    testConstructor: function() {
		assertClass('js.lang.AssertException');

        var e = new js.lang.AssertException();
        assertTrue(e instanceof js.lang.AssertException);
        assertTrue(e instanceof Error);
        assertEquals('j(s)-lib assertion', e.name);
        var e = new js.lang.AssertException('mes');
        assertEquals('mes', e.message);
        e = new js.lang.AssertException('mes1: %s: %s', 'mes2', 'mes3');
        assertEquals('mes1: mes2: mes3', e.message);
        e = new js.lang.AssertException();
        assertEquals('', e.message);
        e = new js.lang.AssertException(null);
        assertEquals('', e.message);
        e = new js.lang.AssertException(function() {
        });
        assertEquals('', e.message);
    },

    testRiseException: function() {
        function fn() {
            throw new js.lang.AssertException('assertion');
        }
        try {
            fn();
            TestCase.fail();
        }
        catch (e) {
            assertTrue(e instanceof js.lang.AssertException);
            assertEquals('assertion', e.message);
            assertEquals('js.lang.AssertException', e.toString());
        }
    }
};
TestCase.register('js.tests.lang.AssertExceptionUnitTests');
