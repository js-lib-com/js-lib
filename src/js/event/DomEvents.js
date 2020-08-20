$package("js.event");

/**
 * DOM events manager. Provides methods for events listeners registering and removing to/from native DOM events.
 * 
 * @author Iulian Rotaru
 * @constructor Construct DOM events manager instance.
 * 
 * @param Object targetNode {@link js.dom.Element} or {@link js.dom.Document} to register events to.
 * @assert <code>targetNode</code> argument is not undefined nor null and is of proper type.
 */
js.event.DomEvents = function (targetNode) {
    $assert(targetNode, "js.event.DomEvents#DomEvents", "Target node is undefined or null.");
    $assert(targetNode instanceof js.dom.Element || targetNode instanceof js.dom.Document, "js.event.DomEvents#DomEvents", "Given argument is not of proper type.");

    /**
     * Associated target node.
     * 
     * @type js.event.TargetNode
     */
    this._targetNode = new js.event.TargetNode(targetNode);

    /**
     * Registered event handlers.
     * 
     * @type Array
     */
    this._handlers = [];
};

js.event.DomEvents.prototype = {
    /**
     * Check if event is a valid DOM event type.
     * 
     * @param String type event type to test.
     * @return Boolean true if event type is a valid DOM event.
     */
    hasType : function (type) {
        $assert(type, "js.event.DomEvents#hasType", "Event type is undefined, null or empty.");
        return type in js.event.Types;
    },

    /**
     * Get registered event handlers.
     * 
     * @return [] registered event handlers.
     */
    getHandlers : function () {
        return this._handlers;
    },

    /**
     * Add event listener. Register event listener to this event target. Listener function should have next signature:
     * 
     * <pre>
     * 	void listener(js.event.Event ev)
     * </pre>
     * 
     * It will be invoked whenever requested event type will be triggered on this event target with event contextual
     * information as only argument. If event type, listener and capture flag are defining an already registered event
     * this method rise assertion or silently does nothing if assertions are disabled.
     * 
     * @param String type event type,
     * @param Function listener event listener to register,
     * @param Object scope listener run-time scope,
     * @param Boolean capture capture flag.
     * @assert event <code>type</code> is valid - see {@link js.event.Types}, <code>listener</code> is a
     *         {@link Function}, <code>scope</code> is an {@link Object} and <code>capture</code> is a boolean
     *         value. Also current parameters are not defining an already registered event.
     */
    addListener : function (type, listener, scope, capture) {
        $assert(type in js.event.Types, "js.event.DomEvents#addListener", "Unrecognized event type #%s.", type);
        $assert(js.lang.Types.isFunction(listener), "js.event.DomEvents#addListener", "Event listener is not a function.");
        $assert(typeof scope === "undefined" || js.lang.Types.isObject(scope), "js.event.DomEvents#addListener", "Scope is not an object.");
        $assert(typeof scope === "undefined" || js.lang.Types.isBoolean(capture), "js.event.DomEvents#addListener", "Capture flag is not a boolean value.");
        if (!(type in js.event.Types)) {
            return;
        }

        var handler = new js.event.Handler(this._targetNode, type, listener, scope, capture);
        // standard browsers silently discard multiple registration for listeners with the same parameters but IE allows
        if (this._handlers.indexOf(handler) !== -1) {
            $assert("js.event.DomEvents#addListener", "Event |%s:%s| already registered.", type, capture ? "capture" : "bubbling");
            return;
        }
        this._addListener(handler);
        this._handlers.push(handler);
    },

    /**
     * Remove event listener. Remove registered event listener from this event target. Calling this method with
     * arguments that does not identify any currently registered event listener has no effect.
     * 
     * @param String type event type,
     * @param Function listener event listener to remove,
     * @param Boolean capture capture flag.
     * @assert event <code>type</code> is valid - see {@link js.event.Types}, <code>listener</code> is a function
     *         and <code>capture</code> is a boolean value.
     */
    removeListener : function (type, listener, capture) {
        $assert(type in js.event.Types, "js.event.DomEvents#removeListener", "Unrecognized event type #%s.", type);
        $assert(js.lang.Types.isFunction(listener), "js.event.DomEvents#removeListener", "Event listener is not a function.");
        $assert(js.lang.Types.isBoolean(capture), "js.event.DomEvents#removeListener", "Capture flag is not a boolean value.");
        if (!(type in js.event.Types)) {
            return;
        }

        var i, handler;
        for (i = this._handlers.length - 1; i >= 0; i--) {
            handler = this._handlers[i];
            if (handler.type === type && handler.listener === listener && handler.capture === capture) {
                this._handlers.splice(i, 1);
                this._removeListener(handler);
            }
        }
    },

    /**
     * Helper for add event listener.
     * 
     * @param js.event.Handler handler event handler.
     */
    _addListener : function (handler) {
        handler.node.addEventListener(handler.type, handler.domEventListener, handler.capture);
    },

    /**
     * Helper for remove event listener.
     * 
     * @param js.event.Handler handler event handler.
     */
    _removeListener : function (handler) {
        handler.node.removeEventListener(handler.type, handler.domEventListener, handler.capture);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.event.DomEvents";
    }
};
$extends(js.event.DomEvents, Object);

/**
 * Old IE add and remove event listeners are named attach, respective detach.
 */
$legacy(typeof document.addEventListener === "undefined", function () {
    js.event.DomEvents.prototype._addListener = function (handler) {
        // attach event allows for multiple registration of the same event but is handled before reaching this point
        handler.node.attachEvent("on" + handler.type, handler.domEventListener);
    };

    js.event.DomEvents.prototype._removeListener = function (handler) {
        handler.node.detachEvent("on" + handler.type, handler.domEventListener);
    };
});

/**
 * Firefox mouse wheel event is named DOMMouseScroll.
 */
$legacy(js.ua.Engine.GECKO, function () {
    js.event.DomEvents.prototype._addListener = function (handler) {
        var type = handler.type;
        if (type === "mousewheel") {
            type = "DOMMouseScroll";
        }
        handler.node.addEventListener(type, handler.domEventListener, handler.capture);
        return true;
    };
});
