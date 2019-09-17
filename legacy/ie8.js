// from MDN addEventListener APIDOC results that is not supported for IE8 
$legacy(!document.addEventListener, function () {
    js.ua.Engine.IE8 = true;

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    js.ua.Window.prototype.getWidth = function () {
        return this.doc._document.documentElement.offsetWidth;
    };

    js.ua.Window.prototype.getHeight = function () {
        return this.doc._document.documentElement.offsetHeight;
    };

    js.dom.Element.prototype.removeAttr = function (name) {
        $assert(name, "js.dom.Element#removeAttr", "Attribute name is undefined, null or empty.");
        var attr = this._node.attributes.getNamedItem(name);
        if (attr) {
            this._node.removeAttributeNode(attr);
        }
    };
});
