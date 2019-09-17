$package('js.tests.dom');

js.tests.dom.NodeUnitTests =
{
    _setUp: function(html) {
        document.getElementById('scratch-area').innerHTML = html;
    },

    after: function() {
        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testBackReference: function() {
        var html = '<div id="back-reference"></div>';
        this._setUp(html);

        var node = document.getElementById('back-reference');
        assertNull(js.dom.Node.getElement(node));
        assertUndefined(js.dom.Node.removeBackRef(node));

        var el = {};
        assertUndefined(js.dom.Node.setElement(node, el));
        assertEquals(el, js.dom.Node.getElement(node));
        assertUndefined(js.dom.Node.removeBackRef(node));
        assertNull(js.dom.Node.getElement(node));

        assertException(TypeError, js.dom.Node, 'setElement');
        assertException(TypeError, js.dom.Node, 'setElement', null);
        assertException(TypeError, js.dom.Node, 'getElement');
        assertException(TypeError, js.dom.Node, 'getElement', null);
        assertException(TypeError, js.dom.Node, 'removeBackRef');
        assertException(TypeError, js.dom.Node, 'removeBackRef', null);
    },

    testFirstChild: function() {
        var xml = '<person>text#1<!--comment#1-->text#2<!--comment#2--><name>name#1</name></person>';
        var doc = js.dom.Builder.parseXML(xml)._document;
        var root = doc.getElementsByTagName('person')[0];

        var node = js.dom.Node.firstChild(root, Node.ELEMENT_NODE);
        assertNotNull(node);
        assertEquals(Node.ELEMENT_NODE, node.nodeType);
        assertEquals('name#1', node.firstChild.nodeValue);

        node = js.dom.Node.firstChild(root, Node.COMMENT_NODE);
        assertNotNull(node);
        assertEquals(Node.COMMENT_NODE, node.nodeType);
        assertEquals('comment#1', node.nodeValue);

        node = js.dom.Node.firstChild(root, Node.TEXT_NODE);
        assertNotNull(node);
        assertEquals(Node.TEXT_NODE, node.nodeType);
        assertEquals('text#1', node.nodeValue);

        assertAssertion(js.dom.Node, 'firstChild');
        assertAssertion(js.dom.Node, 'firstChild', null);
    },

    testFirstElementChild: function() {
        return false;
    },

    testLastChild: function() {
        var xml = '<person><name>name#1</name><!--comment#1-->text#1<!--comment#2-->text#2</person>';
        var doc = js.dom.Builder.parseXML(xml)._document;
        var root = doc.getElementsByTagName('person')[0];

        var node = js.dom.Node.lastChild(root, Node.ELEMENT_NODE);
        assertNotNull(node);
        assertEquals(Node.ELEMENT_NODE, node.nodeType);
        assertEquals('name#1', node.firstChild.nodeValue);

        node = js.dom.Node.lastChild(root, Node.COMMENT_NODE);
        assertNotNull(node);
        assertEquals(Node.COMMENT_NODE, node.nodeType);
        assertEquals('comment#2', node.nodeValue);

        node = js.dom.Node.lastChild(root, Node.TEXT_NODE);
        assertNotNull(node);
        assertEquals(Node.TEXT_NODE, node.nodeType);
        assertEquals('text#2', node.nodeValue);

        assertAssertion(js.dom.Node, 'lastChild');
        assertAssertion(js.dom.Node, 'lastChild', null);
    },

    testLastElementChild: function() {
        return false;
    },

    testNextSibling: function() {
        var xml = '<person>text#1<!--comment#1--><name>name#1</name>text#2<!--comment#2--><name>name#2</name></person>';
        var doc = js.dom.Builder.parseXML(xml)._document;
        var nodes = doc.documentElement.childNodes;

        var node = nodes.item(2);
        var sibling = js.dom.Node.nextSibling(node, Node.ELEMENT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.ELEMENT_NODE, sibling.nodeType);
        assertEquals('name#2', sibling.firstChild.nodeValue);

        var node = nodes.item(1);
        var sibling = js.dom.Node.nextSibling(node, Node.COMMENT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.COMMENT_NODE, sibling.nodeType);
        assertEquals('comment#2', sibling.nodeValue);

        var node = nodes.item(0);
        var sibling = js.dom.Node.nextSibling(node, Node.TEXT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.TEXT_NODE, sibling.nodeType);
        assertEquals('text#2', sibling.nodeValue);

        assertAssertion(js.dom.Node, 'nextSibling');
        assertAssertion(js.dom.Node, 'nextSibling', null);
    },

    testNextElementSibling: function() {
        return false;
    },

    testPreviousSibling: function() {
        var xml = '<person>text#1<!--comment#1--><name>name#1</name>text#2<!--comment#2--><name>name#2</name></person>';
        var doc = js.dom.Builder.parseXML(xml)._document;
        var nodes = doc.documentElement.childNodes;

        var node = nodes.item(5);
        var sibling = js.dom.Node.previousSibling(node, Node.ELEMENT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.ELEMENT_NODE, sibling.nodeType);
        assertEquals('name#1', sibling.firstChild.nodeValue);

        var node = nodes.item(4);
        var sibling = js.dom.Node.previousSibling(node, Node.COMMENT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.COMMENT_NODE, sibling.nodeType);
        assertEquals('comment#1', sibling.nodeValue);

        var node = nodes.item(3);
        var sibling = js.dom.Node.previousSibling(node, Node.TEXT_NODE);
        assertNotNull(sibling);
        assertEquals(Node.TEXT_NODE, sibling.nodeType);
        assertEquals('text#1', sibling.nodeValue);

        assertAssertion(js.dom.Node, 'previousSibling');
        assertAssertion(js.dom.Node, 'previousSibling', null);
    },

    testPreviousElementSibling: function() {
        return false;
    },

    testHasChildren: function() {
        var xml = '' +
        '<person>' +
        '	<name>Iulian</name>' +
        '	<!--comment-->' +
        '	<name></name>' +
        '</person>';
        var doc = js.dom.Builder.parseXML(xml)._document;

        var node = doc.getElementsByTagName('person')[0];
        assertTrue(js.dom.Node.hasChildren(node));
        assertTrue(js.dom.Node.hasChildren(node, Node.ELEMENT_NODE));
        assertTrue(js.dom.Node.hasChildren(node, Node.COMMENT_NODE));

        if (js.ua.Engine.TRIDENT) {
            // it seems IE ignores tabs so person element has no text nodes
            assertFalse(js.dom.Node.hasChildren(node, Node.TEXT_NODE));
        }
        else {
            assertTrue(js.dom.Node.hasChildren(node, Node.TEXT_NODE));
        }

        node = doc.getElementsByTagName('name')[0];
        assertTrue(js.dom.Node.hasChildren(node, Node.TEXT_NODE));

        node = doc.getElementsByTagName('name')[1];
        assertFalse(js.dom.Node.hasChildren(node));
        assertFalse(js.dom.Node.hasChildren(node, Node.ELEMENT_NODE));
        assertFalse(js.dom.Node.hasChildren(node, Node.COMMENT_NODE));
        assertFalse(js.dom.Node.hasChildren(node, Node.TEXT_NODE));

        assertAssertion(js.dom.Node, 'hasChildren');
        assertAssertion(js.dom.Node, 'hasChildren', null);
    },

    testGetElementsByClassName: function() {
        var html = '' +
        '<form id="form-id">' +
        '	<input type="text" name="name" />' +
        '	<!--comment-->' +
        '	<input type="text" name="surname" class="author surname" value="value" />' +
        '</form>';
        document.getElementById('scratch-area').innerHTML = html;
        var form = document.getElementById('form-id');

        var nodeList = js.dom.Node.getElementsByClassName(form, 'surname');
        assertNotNull(nodeList);
        assertSize(1, nodeList);
        var node = nodeList.item(0);
        assertNotNull(node);
        assertEquals('INPUT', node.tagName);
        assertEquals('value', node.value);

        assertEmpty(js.dom.Node.getElementsByClassName(form, 'fake'));

        assertAssertion(js.dom.Node, 'getElementsByClassName');
        assertAssertion(js.dom.Node, 'getElementsByClassName', null);
        assertAssertion(js.dom.Node, 'getElementsByClassName', form);
        assertAssertion(js.dom.Node, 'getElementsByClassName', form, null);

        $assert.disable();
        assertEmpty(js.dom.Node.getElementsByClassName());
        assertEmpty(js.dom.Node.getElementsByClassName(null));

        nodeList = js.dom.Node.getElementsByClassName(form);
        assertNotNull(nodeList);
        assertEmpty(nodeList);

        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
    },

    testGetElementsByTagName: function() {
        var xml = '' +
        '<person>' +
        '	<name>Iulian</name>' +
        '	<!--comment-->' +
        '	<name>Rotaru</name>' +
        '	<email>iuli@bbnet.ro</email>' +
        '</person>';
        var doc = js.dom.Builder.parseXML(xml)._document;

        var node = doc.getElementsByTagName('person')[0];
        assertSize(2, js.dom.Node.getElementsByTagName(node, 'name'));

        assertAssertion(js.dom.Node, 'getElementsByTagName');
        assertAssertion(js.dom.Node, 'getElementsByTagName', null);
        assertAssertion(js.dom.Node, 'getElementsByTagName', node);
        assertAssertion(js.dom.Node, 'getElementsByTagName', node, null);
        assertAssertion(js.dom.Node, 'getElementsByTagName', node, '');

        $assert.disable();
        assertEmpty(js.dom.Node.getElementsByTagName(node));
        assertEmpty(js.dom.Node.getElementsByTagName(node, null));
        assertEmpty(js.dom.Node.getElementsByTagName(node, ''));
    },

    testNodeIterator: function() {
        var xml = '' +
        '<person>' +
        '	<name>Iulian</name>' +
        '	<!--comment-->' +
        '	<surname>Rotaru</surname>' +
        '	<email>iuli@bbnet.ro</email>' +
        '</person>';
        var doc = js.dom.Builder.parseXML(xml)._document;

        var node = doc.getElementsByTagName('person')[0];
        var it = new js.dom.Node.Iterator(node);
        var tags = ['name', 'surname', 'email'], tagsIndex = 0;
        while (it.hasNext()) {
            assertEquals(tags[tagsIndex++], it.next().tagName);
        }
    }
};
TestCase.register('js.tests.dom.NodeUnitTests');
