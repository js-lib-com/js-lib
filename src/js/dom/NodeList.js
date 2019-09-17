$package('js.dom');

/**
 * Node list.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct node list.
 * 
 * @param Array array
 */
js.dom.NodeList = function (array) {
    var nodeList = typeof array !== 'undefined' ? array : [];

    nodeList.item = function (index) {
        return this[index];
    };

    return nodeList;
};
$extends(js.dom.NodeList, Object);