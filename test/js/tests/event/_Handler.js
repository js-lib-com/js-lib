$package('js.tests.event');

js.tests.event._Handler =
{
    _test: function() {
        TestCase.fail();
    }
};
TestCase.register('js.tests.event._Handler');
