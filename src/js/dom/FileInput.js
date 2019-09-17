$package("js.dom");

/**
 * File input control. Form control that allows for files uploading.
 * 
 * @author Iulian Rotaru
 * @constructor Construct file input instance.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document}.
 */
js.dom.FileInput = function (ownerDoc, node) {
    $assert(this instanceof js.dom.FileInput, "js.dom.FileInput#FileInput", "Invoked as function.");
    this.$super(ownerDoc, node);
    $assert(node.nodeName.toLowerCase() === "input", "js.dom.FileInput#FileInput", "Node is not an input.");
    $assert(node.getAttribute("type") === "file", "js.dom.FileInput#FileInput", "Node is not a file.");
};

js.dom.FileInput.prototype = {
    /**
     * Disable file input value setter. Browsers forbid setting value for inputs of type file and for a good reason: a
     * malicious script can try to guess location on local filesystem and upload/overwrite sensitive files.
     * 
     * @param Object value unused value.
     * @assert always assert since this operation is not supported.
     */
    setValue : function (value) {
        $assert(false, "js.dom.FileInput#setValue", "Unsupported operation.");
    },

    /**
     * Overwrite form control item iterator to process files list. This method is a specialization of
     * {@link js.dom.Control#forEachItem(Function,Object...)}.
     * <p>
     * Callback is invoked with a single argument, that is an anonymous object with <code>name</code>,
     * <code>value</code> and <code>extra</code> public properties.
     * 
     * <pre>
     *  void callback(Item);
     *  Item {
     *      name,   // control name used as part name on the multi-part format
     *      value,  // the file itself 
     *      extra   // file name as is on local machine; note this is only file name not entire path
     *  };
     * </pre>
     * 
     * @param Function callback callback function to be executed for every item,
     * @param Object... scope optional callback runtime scope, default to global scope.
     * @assert <code>callback</code> is a {@link Function} and <code>scope</code> is an {@link Object}, if present.
     */
    forEachItem : function (callback, scope) {
        $assert(js.lang.Types.isFunction(callback), "js.dom.FileInput#forEachItem", "Callback argument is not a function.");
        $assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.FileInput#forEachItem", "Scope argument is not an object.");

        var files = this._node.files;
        for (var i = 0; i < files.length; ++i) {
            callback.call(scope || window, {
                name : this.getName(),
                value : files.item(i),
                extra : files.item(i).name
            });
        }
    },

    /**
     * Convenient files iterator. This method is a convenient alternative of {@link #forEachItem(Function,Object...)}
     * that uses {@link File} object as callback argument.
     * 
     * @param Function callback callback function to be executed for every file,
     * @param Object... scope optional callback runtime scope, default to global scope.
     * @assert <code>callback</code> is a {@link Function} and <code>scope</code> is an {@link Object}, if present.
     */
    forEachFile : function (callback, scope) {
        $assert(js.lang.Types.isFunction(callback), "js.dom.FileInput#forEachItem", "Callback argument is not a function.");
        $assert(typeof scope === "undefined" || js.lang.Types.isStrictObject(scope), "js.dom.FileInput#forEachItem", "Scope argument is not an object.");

        var files = this._node.files;
        for (var i = 0; i < files.length; ++i) {
            callback.call(scope || window, files.item(i));
        }
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.FileInput";
    }
};
$extends(js.dom.FileInput, js.dom.Control);
