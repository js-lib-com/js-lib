$package('js.tests.lang');

js.tests.lang.ExceptionUnitTests =
{
    testConstructor: function() {
		assertClass('js.lang.Exception');

        var e = new js.lang.Exception();
        assertTrue(e instanceof js.lang.Exception);
        assertTrue(e instanceof Error);
        assertEquals('j(s)-lib exception', e.name);
        var e = new js.lang.Exception('mes');
        assertEquals('mes', e.message);
        e = new js.lang.Exception('mes1: %s: %s', 'mes2', 'mes3');
        assertEquals('mes1: mes2: mes3', e.message);
        e = new js.lang.Exception();
        assertEquals('', e.message);
        e = new js.lang.Exception(null);
        assertEquals('', e.message);
        e = new js.lang.Exception(function() {
        });
        assertEquals('', e.message);
    }
};
TestCase.register('js.tests.lang.ExceptionUnitTests');
