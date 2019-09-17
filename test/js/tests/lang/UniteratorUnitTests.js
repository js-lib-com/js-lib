$package('js.tests.lang');

js.tests.lang.Uniterator =
{
    testConstructor: function() {
        assertClass('js.lang.Uniterator');
    },

    testUndefined: function() {
        var it = new js.lang.Uniterator(undefined);
        assertTrue(it.hasNext());
        assertTrue(typeof it.next() === 'undefined');
    },

    testNull: function() {
        var it = new js.lang.Uniterator(null);
        assertTrue(it.hasNext());
        assertNull(it.next());
    },

    testPrimitive: function() {
        var it = new js.lang.Uniterator('John Doe');
        assertTrue(it.hasNext());
        assertEquals('John Doe', it.next());
    },

    testObject: function() {
        var object =
        {
            toString: function() {
                return 'object';
            }
        };
        var it = new js.lang.Uniterator(object);
        assertTrue(it.hasNext());
        assertEquals('object', it.next().toString());
    },

    testArray: function() {
        var array = ['John Doe', 48];
        var it = new js.lang.Uniterator(array);
        assertTrue(it.hasNext());
        assertEquals('John Doe', it.next());
        assertTrue(it.hasNext());
        assertEquals(48, it.next());
    },

    testNodeList: function() {
        var html = '' +
        '<h1></h1>' +
        '<h2></h2>';
        document.getElementById('scratch-area').innerHTML = html;
        var nodeList = document.getElementById('scratch-area').childNodes;
        function clean() {
            var n = document.getElementById('scratch-area');
            while (n.firstChild) {
                n.removeChild(n.firstChild);
            }
        }

        try {
            var it = new js.lang.Uniterator(nodeList);
            assertTrue(it.hasNext());
            assertEquals('h1', it.next().nodeName.toLowerCase());
            assertTrue(it.hasNext());
            assertEquals('h2', it.next().nodeName.toLowerCase());
        }
        catch (er) {
            clean();
            throw er;
        }
        clean();
    },

    testIterable: function() {
        var object =
        {
            it: function() {
                return {
                    _items: ['John Doe', 48],
                    _index: 0,

                    hasNext: function() {
                        return this._index < this._items.length;
                    },

                    next: function() {
                        return this._items[this._index++];
                    }
                };
            }
        };
        var it = new js.lang.Uniterator(object);
        assertTrue(it.hasNext());
        assertEquals('John Doe', it.next());
        assertTrue(it.hasNext());
        assertEquals(48, it.next());
    },

    testMissingArgument: function() {
        try {
            new js.lang.Uniterator();
            TestCase.fail('Missing constructor argument should assert.');
        }
        catch (er) {
            assertTrue(er instanceof js.lang.AssertException);
        }
        $assert.disable();
        var it = new js.lang.Uniterator();
        assertFalse(it.hasNext());
        assertTrue(typeof it.next() === 'undefined');
    },

    testOutOfRange: function() {
        var it = new js.lang.Uniterator(1);
        assertTrue(it.hasNext());
        assertTrue(it.hasNext());
        assertEquals(1, it.next());
        assertFalse(it.hasNext());
        assertAssertion(it, 'next');
        $assert.disable();
        assertEquals(1, it._index);
        assertTrue(typeof it.next() === 'undefined');
        assertEquals(2, it._index);
        assertTrue(typeof it.next() === 'undefined');
        assertEquals(3, it._index);
    }
};
TestCase.register('js.tests.lang.Uniterator');
