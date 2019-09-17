$package('js.tests.dom');

$include('js.dom.Radio');

js.tests.dom.Radio =
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

    testRadio: function() {
        assertClass('js.dom.Radio');

        this._setUp('<input id="radio" type="radio" name="fruits" value="APPLE" />');
        var node = document.getElementById('radio');
        var el = this._doc.getById('radio');

        assertFalse(el.checked());
        assertEquals(el, el.check());
        assertTrue(node.checked);
        assertTrue(el.checked());
        assertEquals(el, el.uncheck());
        assertFalse(node.checked);
        assertFalse(el.checked());
        assertTrue(js.dom.Radio.prototype.isEmpty());
        assertTrue(js.dom.Radio.prototype.isValid());

		assertEquals(el, el.setValue('APPLE'));
        assertTrue(node.checked);
		assertEquals(el, el.setValue('PEAR'));
        assertFalse(node.checked);
    }
};
TestCase.register('js.tests.dom.Radio');
