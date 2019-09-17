$package('js.tests.dom');

$include('js.dom.Checkbox');

js.tests.dom.Checkbox =
{
    _setUp: function(html) {
        document.getElementById('scratch-area').innerHTML = html;
        this._doc = new js.dom.Document(document);
    },

    after: function() {
        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        this._doc = null;
    },

    testCheckbox: function() {
        assertClass('js.dom.Checkbox');

        this._setUp('<input id="checkbox" type="checkbox" />');
        var node = document.getElementById('checkbox');
        var el = this._doc.getById('checkbox');

        assertFalse(el.checked());
        assertEquals(el, el.check());
        assertTrue(node.checked);
        assertTrue(el.checked());
        assertEquals(el, el.uncheck());
        assertFalse(node.checked);
        assertFalse(el.checked());
        assertTrue(js.dom.Checkbox.prototype.isEmpty());
        assertTrue(js.dom.Checkbox.prototype.isValid());
    }
};
TestCase.register('js.tests.dom.Checkbox');
