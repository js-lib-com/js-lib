$package("js.event");

/**
 * Event handler. This private class encapsulates parameters for event management being used by attach and detach
 * methods from {@link js.event.DomEvents} class. It creates a wrapper for event listener that allows for scope
 * handling.
 * 
 * @author Iulian Rotaru
 * 
 * @constructor Construct event handler instance. If optional capture flag is supplied
 * 
 * @param js.event.TargetNode targetNode target node,
 * @param String type event type,
 * @param Function listener event listener,
 * @param Object scope listener run-time scope,
 * @param Boolean capture capture flag.
 */
js.event.Handler = function (targetNode, type, listener, scope, capture) {
    /**
     * DOM native node wrapped by this event handler.
     * 
     * @type Node
     */
    this.node = targetNode.node;

    /**
     * Event type.
     * 
     * @type String
     */
    this.type = type;

    /**
     * Event listener.
     * 
     * @type Function
     */
    this.listener = listener;

    /**
     * Event listener run-time scope.
     * 
     * @type Object
     */
    this._scope = scope;

    /**
     * Event capture propagation. If true event propagation occurs from surface to bottom, i.e. parent element first.
     * More specifically, consider the case o a form with and input, see below sample code. If capture is false, that
     * is, event propagation is <code>bubbling</code>, event will be dispatched to input first then to form element.
     * Otherwise, if capture is true form is first then its child input. This is handy for event delegation: register
     * the event to parent that uses capture to get fired event before children.
     * 
     * <pre>
     *  &lt;form&gt;
     *      &lt;input type="text" /&gt;
     *  &lt;/form&gt;
     * </pre>
     * 
     * @type Booolean
     */
    this.capture = capture;

    /**
     * Event context information.
     * 
     * @type js.event.Event
     */
    this._event = new js.event.Event(targetNode.ownerDoc, type);

    /**
     * Low level DOM event listener.
     * 
     * @type Function
     */
    this.domEventListener = this._handle.bind(this);
};

/**
 * Default idle timeout value, minutes.
 * 
 * @type Number
 */
js.event.Handler.DEF_IDLE_TIMEOUT = 10;

/**
 * Idle timeout. User idle state is detected via DOM events dispatcher: if no DOM event is generated into a given
 * interval user is considered idle.
 * 
 * @type js.util.Timeout
 */
js.event.Handler.idleTimeout = null;
$static(function () {
    js.event.Handler.idleTimeout = new js.util.Timeout(js.event.Handler.DEF_IDLE_TIMEOUT * 60 * 1000, function () {
        WinMain.page.onIdleTimeout();
    });
    js.event.Handler.idleTimeout.start();
});

js.event.Handler.prototype = {
    /**
     * Handle low level DOM event and reset idle timeout.
     * 
     * @param Event domEvent native DOM event.
     */
    _handle : function (domEvent) {
        if (js.event.Handler.idleTimeout !== null) {
            js.event.Handler.idleTimeout.start();
        }
        if (!this._preHandle(domEvent)) {
            return;
        }
        var ev = this._event.init(domEvent);
        try {
            this.listener.call(this._scope, ev);
        } catch (er) {
            js.ua.System.error(er);
        }
        if (ev.prevented === true) {
            this._prevent(domEvent);
        }
        if (ev.stopped === true) {
            this._stop(domEvent);
        }
    },

    /**
     * @param Event domEvent native DOM event.
     * @return Boolean false if this event should be canceled.
     */
    _preHandle : function (domEvent) {
        // if (domEvent.eventPhase !== js.event.Event.AT_TARGET) {
        // return false;
        // }
        return true;
    },

    /**
     * Prevent event default behavior.
     * 
     * @param Event domEvent, native DOM event.
     */
    _prevent : function (domEvent) {
        domEvent.preventDefault();
    },

    /**
     * Stop event propagation.
     * 
     * @param Event domEvent, native DOM event.
     */
    _stop : function (domEvent) {
        domEvent.stopPropagation();
    },

    /**
     * Equality test. Check whether or not supplied arguments equals this event handler. Two event handlers are
     * considered equals if they wrap the same native {@link Node} instance, have the same event type and event
     * listener.
     * 
     * @param js.event.Handler handler event handler to compare with.
     * @return Boolean true if given argument equals this event handler.
     * @assert given argument is instance of js.event.Handler
     */
    equals : function (handler) {
        $assert(handler instanceof js.event.Handler, "js.dom.Handler#equals", "Handler to compare is undefined or null.");
        return handler.node === this.node && handler.type === this.type && handler.listener === this.listener;
    },
    
    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.event.Handler";
    }
};
$extends(js.event.Handler, Object);

/**
 * IE prevent default and stop propagation is signaled differently.
 */
$legacy(js.ua.Engine.TRIDENT, function () {
    js.event.Handler.prototype._prevent = function (domEvent) {
        domEvent.returnValue = false;
    };

    js.event.Handler.prototype._stop = function (domEvent) {
        domEvent.cancelBubble = true;
    };
});

/**
 * It seems Opera IFrame and mobile WebKit trigger <b>load</b> event for blank location, i.e. source "about:blank".
 * Such condition is not for interest for application code and should be avoid.
 */
$legacy(js.ua.Engine.TRIDENT || js.ua.Engine.PRESTO || js.ua.Engine.MOBILE_WEBKIT, function () {
    js.event.Handler.prototype._preHandle = function (domEvent) {
        // if (domEvent.eventPhase !== js.event.Event.AT_TARGET) {
        // return false;
        // }
        if (this.type === "load" && this.node.nodeName.toLowerCase() === "iframe" && this.node.contentWindow.location.toString() === "about:blank") {
            return false;
        }
        return true;
    };
});
