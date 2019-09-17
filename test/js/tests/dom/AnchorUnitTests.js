$package('js.tests.dom');

$include('js.dom.Anchor');

js.tests.dom.Anchor =
{
    before: function(html) {
        document.getElementById('scratch-area').innerHTML = '<a id="anchor"></a>';
        var doc = new js.dom.Document(document);
        this.node = document.getElementById('anchor');
        this.el = doc.getById('anchor');
    },

    after: function() {
        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testAnchor: function() {
        assertClass('js.dom.Anchor');

        assertNull(this.el.getHref());
        assertEmpty(this.el.getText());
        assertEquals(this.el, this.el.setHref('http://js-lib.com'));
        assertEquals('http://js-lib.com', this.node.getAttribute('href'));
        this.el.setText('j(s)-lib');
        assertEquals('j(s)-lib', this.node.firstChild.nodeValue);

        assertAssertion(this.el, 'setHref');
        assertAssertion(this.el, 'setHref', null);
        assertAssertion(this.el, 'setHref', '');
        assertEquals('http://js-lib.com', this.node.getAttribute('href'));

        $assert.disable();
        this.el.setHref();
        this.el.setHref(null);
        this.el.setHref('');
        assertEquals('http://js-lib.com', this.node.getAttribute('href'));
    }
};
TestCase.register('js.tests.dom.Anchor');
