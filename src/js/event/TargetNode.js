$package('js.event');

/**
 * Target node. Event listeners can be registered on both {@link js.dom.Element elements} - and
 * {@link js.dom.Document documents}, collectively named target nodes.
 * 
 * @param Object node element or document.
 */
js.event.TargetNode = function (node) {
    /**
     * Native node.
     * 
     * @type Node
     */
    this.node = node instanceof js.dom.Document ? node._document : node._node;

    /**
     * Owner document.
     * 
     * @type js.dom.Document
     */
    this.ownerDoc = node instanceof js.dom.Document ? node : node._ownerDoc;
};

js.event.TargetNode.prototype = {
    /**
     * Returns a string representation of the object.
     * 
     * @return String target node string representation.
     */
    toString : function () {
        return 'js.event.TargetNode';
    }
};
$extends(js.event.TargetNode, Object);
