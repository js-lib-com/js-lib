$package('js.tests.dom');

js.tests.dom.StyleUnitTests = {
    before : function () {
        document.getElementById('scratch-area').innerHTML = '<div></div>';
        this.node = document.getElementById('scratch-area').firstChild;
        this.style = new js.dom.Style({
            _node : this.node
        });
    },

    after : function () {
        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        this._doc = null;
    },

    testConstructor : function () {
        assertClass('js.dom.Style');
    },

    testSet : function () {
        assertEquals(this.style, this.style.set('position', 'absolute'));
        assertEquals('absolute', this.node.style.position);

        assertEquals(this.style, this.style.set({
            'position' : 'relative',
            'top' : '100px'
        }));
        assertEquals('relative', this.node.style.position);
        assertEquals('100px', this.node.style.top);

        this.style.set('opacity', '0.82');
        assertEquals('0.82', this.node.style.opacity);
    },

    testGet : function () {
        assertEquals('static', this.style.get('position'));
        this.node.style.position = 'absolute';
        assertEquals('absolute', this.style.get('position'));
    },

    testGetComputedStyle: function() {
        this.node.style.position = 'absolute';
        assertEquals('absolute', this.style.getComputedStyle('position'));
    },
    
    testRemove : function () {
        this.node.style.position = 'absolute';
        assertEquals(this.style, this.style.remove('position'));
        assertEmpty(this.node.style.position);
    },

    testHas : function () {
        assertTrue(this.style.has('position'));
        this.node.style.position = 'absolute';
        assertTrue(this.style.has('position'));
        assertTrue(this.style.has('position', 'absolute'));
        assertTrue(this.style.has('position', 'absolute', 'fixed', 'relative'));
        assertFalse(this.style.has('position', 'inherit', 'static'));
    },

    testPositioningStyle : function () {
        assertEquals('static', this.style.getPosition());

        assertEquals(this.style, this.style.setPosition('absolute'));
        assertEquals('absolute', this.style.getPosition());
        assertTrue(this.style.isPositioned());

        assertEquals(this.style, this.style.setPosition('static'));
        assertEquals('static', this.style.getPosition());
        assertFalse(this.style.isPositioned());

        assertAssertion(this.style, 'setPosition');
        assertAssertion(this.style, 'setPosition', null);
    },

    testPositionSetters : function () {
        assertAssertion(this.style, 'setTop', 100);
        assertAssertion(this.style, 'setRight', 100);
        assertAssertion(this.style, 'setBottom', 100);
        assertAssertion(this.style, 'setLeft', 100);

        this.node.style.position = 'absolute';
        this.style.setTop(100);
        assertEquals('100px', this.node.style.top);
        this.style.setRight(110);
        assertEquals('110px', this.node.style.right);
        this.style.setBottom(120);
        assertEquals('120px', this.node.style.bottom);
        this.style.setLeft(130);
        assertEquals('130px', this.node.style.left);

        this.style.setTop(200.49);
        assertEquals('200px', this.node.style.top);
        this.style.setRight(210.49);
        assertEquals('210px', this.node.style.right);
        this.style.setBottom(220.49);
        assertEquals('220px', this.node.style.bottom);
        this.style.setLeft(230.49);
        assertEquals('230px', this.node.style.left);

        assertAssertion(this.style, 'setTop', '100');
        assertAssertion(this.style, 'setRight', '100');
        assertAssertion(this.style, 'setBottom', '100');
        assertAssertion(this.style, 'setLeft', '100');
    },

    testGetDimensions : function () {
        this.node.style.width = '100px';
        this.node.style.height = '100px';
        this.node.style.padding = '0';
        this.node.style.margin = '0';
        this.node.style.border = 'none';
        assertEquals(100, this.style.getWidth());
        assertEquals(100, this.style.getHeight());

        this.node.style.padding = '10px';
        assertEquals(100, this.style.getWidth());
        assertEquals(100, this.style.getHeight());

        this.node.style.margin = '10px';
        assertEquals(100, this.style.getWidth());
        assertEquals(100, this.style.getHeight());

        this.node.style.border = 'solid 1px';
        assertEquals(100, this.style.getWidth());
        assertEquals(100, this.style.getHeight());
    },

    testSetDimensions : function () {
        assertEquals(this.style, this.style.setWidth(100));
        assertEquals('100px', this.node.style.width);
        assertEquals(this.style, this.style.setHeight(100));
        assertEquals('100px', this.node.style.height);

        assertEquals(this.style, this.style.setWidth('auto'));
        assertEquals('auto', this.node.style.width);
        assertEquals(this.style, this.style.setHeight('auto'));
        assertEquals('auto', this.node.style.height);

        assertEquals(this.style, this.style.setWidth('inherit'));
        assertEquals('inherit', this.node.style.width);
        assertEquals(this.style, this.style.setHeight('inherit'));
        assertEquals('inherit', this.node.style.height);

        assertAssertion(this.style, 'setWidth');
        assertAssertion(this.style, 'setWidth', null);
        assertAssertion(this.style, 'setWidth', '100');
        assertAssertion(this.style, 'setHeight');
        assertAssertion(this.style, 'setHeight', null);
        assertAssertion(this.style, 'setHeight', '100');
    },

    testAbsolutePosition : function () {
        var html = "" + //
        "<div style='position:absolute;top:40px;left:50px;'>" + //
        "   <div id='element-id' style='position:absolute;top:50px;left:60px;' />" + //
        "</div>" + //
        "";
        document.getElementById('scratch-area').innerHTML = html;
        var doc = new js.dom.Document(document);
        var scratchArea = doc.getById("scratch-area");
        var scratchAreaPosition = scratchArea.style.getPosition();
        scratchArea.style.setPosition("static");
        var el = doc.getById("element-id");

        assertEquals(110, el.style.getPageLeft());
        assertEquals(90, el.style.getPageTop());
        scratchArea.style.setPosition(scratchAreaPosition);
    }
};
TestCase.register('js.tests.dom.StyleUnitTests');
