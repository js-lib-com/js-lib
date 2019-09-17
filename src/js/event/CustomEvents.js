$package("js.event");

/**
 * Custom events manager. Working with custom events follows next three steps:
 * <ol>
 * <li>register custom event types using {@link #register}</li>
 * <li>events publisher clients adds / removes event listeners at will</li>
 * <li>publisher fires events with specific contextual information when internal state changes</li>
 * </ol>
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct custom events instance.
 * 
 * @param Object parent, optional parent publisher.
 * @assert if <em>parent</em> argument is present it should be an event publisher.
 */
js.event.CustomEvents = function (parent) {
    if (typeof parent !== "undefined") {
        parent._customEvents = this;
    }

    /**
     * Events storage. Map event type to registered handlers.
     * 
     * @type Object
     */
    this._events = {};
};

js.event.CustomEvents.prototype = {
    /**
     * Register user defined events. Register one or many event types to this custom events instance. Ignore the event
     * type(s) that are already registered.
     * 
     * @param String... type one or more event types to register.
     * @assert at least one event type argument is supplied and none is already registered.
     */
    register : function () {
        $assert(arguments, "js.event.CustomEvents#register", "Missing arguments.");
        for (var i = 0, type; i < arguments.length; ++i) {
            type = arguments[i];
            $assert(!(type in this._events), "js.event.CustomEvents#register", "Event type already registered.");
            if (!(type in this._events)) {
                this._events[type] = [];
            }
        }
    },

    /**
     * Unregister user defined events. Remove supplied types from registered events list. Ignore type argument(s) that
     * are not already registered.
     * 
     * @param String... type one or more event types to unregister.
     * @assert at least one event type argument is supplied and all are already registered.
     */
    unregister : function () {
        $assert(arguments, "js.event.CustomEvents#unregister", "Missing arguments.");
        for (var i = 0, type; i < arguments.length; ++i) {
            type = arguments[i];
            if (!(type in this._events)) {
                $assert(false, "js.event.CustomEvents#unregister", "Event type is not registered.");
                continue;
            }
            delete this._events[type];
        }
    },

    /**
     * Add event listener. Register event listener to this events publisher. Listener function should have next
     * signature:
     * 
     * <pre>
     * 	void listener(Object... args)
     * </pre>
     * 
     * Listener will be invoked whenever requested event type will be fired, with arguments provided by
     * {@link #_fireEvent}.
     * 
     * @param String type even type,
     * @param Function listener event listener to register,
     * @param Object scope listener run-time scope.
     * @assert requested event type is registered, listener is a {@link Function} and scope is an {@link Object}.
     */
    addListener : function (type, listener, scope) {
        $assert(type in this._events, "js.event.CustomEvents#addListener", "Invalid event type.");
        $assert(listener, "js.event.CustomEvents#addListener", "Listener is undefined or null.");
        $assert(js.lang.Types.isFunction(listener), "js.event.CustomEvents#addListener", "Listener is not a function.");
        $assert(js.lang.Types.isObject(scope), "js.event.CustomEvents#addListener", "Scope is not an object.");

        var handlers = this._events[type];
        if (handlers) {
            handlers.push({
                type : type,
                listener : listener,
                scope : scope
            });
        }
    },

    /**
     * Remove event listener. Remove registered event listener from this event target. Calling this method with
     * arguments that does not identify any currently registered event listener has no effect.
     * 
     * @param String type event type,
     * @param Function listener listener to be removed.
     * @return js.event.CustomEvents this pointer.
     * @assert given event type is registered and listener is a {@link Function}.
     */
    removeListener : function (type, listener) {
        $assert(type in this._events, "js.event.CustomEvents#removeListener", "Type %s is not defined.", type);
        $assert(js.lang.Types.isFunction(listener), "js.event.CustomEvents#removeListener", "Listener is not a function.");

        var handlers = this._events[type];
        if (handlers) {
            var i, handler;
            for (i = handlers.length - 1; i >= 0; i--) {
                handler = handlers[i];
                $assert(!handler.running, "js.event.CustomEvents#removeListener", "Attempt to remove running listener for %s event.", handler.type);
                if (!handler.running && handler.listener === listener) {
                    handlers.splice(i, 1);
                }
            }
        }
        return this;
    },

    /**
     * Remove all listeners from user defined event.
     * 
     * @param String type event type.
     * @return js.event.CustomEvents this pointer.
     * @assert given type is registered and has listeners that are not running.
     */
    removeAllListeners : function (type) {
        $assert(type in this._events, "js.event.CustomEvents#removeAllListeners", "Type %s is not defined.", type);
        $assert(this.hasListener(type), "js.event.CustomEvents#removeAllListeners", "Type %s has no listeners.", type);

        var handlers = this._events[type];
        if (handlers) {
            var i, handler;
            for (i = handlers.length - 1; i >= 0; i--) {
                handler = handlers[i];
                $assert(!handler.running, "js.event.CustomEvents#removeAllListener", "Attempt to remove running listener for %s event.", handler.type);
                if (!handler.running) {
                    handlers.splice(i, 1);
                }
            }
        }
        return this;
    },

    /**
     * Return true if requested type is registered.
     * 
     * @param String type type name.
     * @return Boolean true if named type is registered.
     */
    hasType : function (type) {
        return type in this._events;
    },

    /**
     * Test if event has listeners. Returns true if there is at least one listener for given event type.
     * 
     * @param String type, event type.
     * @return Boolean true if there is at least one listener registered for given event type.
     * @assert given event type is registered.
     */
    hasListener : function (type) {
        $assert(type in this._events, "js.event.CustomEvents#hasListener", "Invalid event type.");
        var handlers = this._events[type];
        return handlers ? handlers.length !== 0 : false;
    },

    /**
     * Fire user defined event. Invoke all listeners for given event type; if event type is not registered via
     * {@link #register} this method does nothing and returns false. Pass given optional arguments to every invoked
     * listener.
     * 
     * @param String type, event type,
     * @param Object... args, event arguments.
     * @return Array array filled with listeners invocation results. If listener does not return an explicit value
     *         corresponding array item is undefined.
     */
    fire : function (type) {
        $assert(type, "js.event.CustomEvents#fire", "Undefined, null or empty event type");

        var handlers = this._events[type];
        $assert(handlers, "js.event.CustomEvents#fire", "Trying to fire not registered event |%s|.", type);
        if (!handlers) {
            return;
        }

        var results = [];
        var it = new js.lang.Uniterator(handlers), h;
        while (it.hasNext()) {
            h = it.next();
            try {
                h.running = true;
                results.push(h.listener.apply(h.scope, $args(arguments, 1)));
                h.running = false;
            } catch (er) {
                js.ua.System.error(er);
            }
        }
        return results;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.event.CustomEvents";
    }
};
$extends(js.event.CustomEvents, Object);
