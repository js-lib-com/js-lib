$package('js.tests.dom');

$include('js.dom.FileInput');

js.tests.dom.FileInput =
{
    testFileInput: function() {
        assertClass('js.dom.FileInput');

        // setValue is not allowed on file input: assert or do nothing
        assertAssertion(js.dom.FileInput.prototype, 'setValue');
        $assert.disable();
        js.dom.FileInput.prototype.setValue();
    }
};
TestCase.register('js.tests.dom.FileInput');
