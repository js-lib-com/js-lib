$package('js.tests.event');

js.tests.event.Custom =
{
    _test: function() {
        TestCase.fail();
    }
};
TestCase.register('js.tests.event.Custom');
