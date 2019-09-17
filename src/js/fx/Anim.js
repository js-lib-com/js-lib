$package("js.fx");

/**
 * Animation instance. Animation is simply a collection of effects executed concurrently or sequential. Every effect
 * changes an {@link js.dom.Element} style from a starting to and ending value; for more details about animation
 * properties see {@link js.fx.Descriptor}. A classic use case is to create animation object giving effects descriptors
 * to constructor and start it when consider appropriate, like in snippet below:
 * 
 * <pre>
 * var anim = new js.fx.Anim({
 * 	el : image,
 * 	style : "opacity",
 * 	from : 1,
 * 	to : 0
 * });
 * anim.start();
 * </pre>
 * 
 * @constructor Construct animation object. Create and store effect instances for every given descriptor; uses sensible
 *              default value for descriptor missing properties.
 * 
 * @param js.fx.Descriptor... descriptors
 * @assert there is at least one descriptor argument.
 */
js.fx.Anim = function () {
    $assert(arguments.length >= 1, "js.fx.Anim#Anim", "Missing descriptors.");
    var i, descriptor, defaultProperties, property;

    /**
     * This animation effects queue.
     * 
     * @type Array
     */
    this._fxs = [];

    defaultProperties = {};
    for (i = 0; i < arguments.length; i++) {
        descriptor = arguments[i];
        $assert(descriptor, "js.fx.Anim#Anim", "Descriptor object is undefined or null.");
        if (descriptor.defaultProperties) {
            delete descriptor.defaultProperties;
            defaultProperties = descriptor;
            continue;
        }
        if (typeof descriptor.at !== "undefined") {
            continue;
        }

        for (property in defaultProperties) {
            if (typeof descriptor[property] === "undefined") {
                descriptor[property] = defaultProperties[property];
            }
        }
        $assert(descriptor.el || descriptor.render, "js.fx.Anim#Anim", "Descriptor <element> is undefined or null but no user defined render.");
        $assert(descriptor.style || descriptor.render, "js.fx.Anim#Anim", "Descriptor <style> is undefined or null but no user defined render.");
        $assert(typeof descriptor.from !== "undefined" && descriptor.from !== null, "js.fx.Anim#Anim", "Descriptor <from> is undefined or null.");
        $assert(typeof descriptor.to !== "undefined" && descriptor.to !== null, "js.fx.Anim#Anim", "Descriptor <to> is undefined or null.");

        this._fxs.push(new js.fx.Effect(descriptor));
    }

    /**
     * Callback for animation frame request. This constant is in fact {@link #_render} method bound to this instance.
     * 
     * @type Function
     */
    this._FRAME_REQUEST_CALLBACK = this._render.bind(this);

    /**
     * Animation frame request ID. It has not null value only while animation is running.
     * 
     * @type Number
     */
    this._animationFrameRequestId = null;

    /**
     * Animation start timestamp. This value marks the moment animation started as number of milliseconds from
     * navigation start. It has an accuracy of thousandth of a millisecond and has not null value only while animation
     * is running.
     * 
     * @type DOMHighResTimeStamp
     */
    this._startTimestamp = null;

    /**
     * Custom events. Current implementation supports two event types, namely <code>anim-render</code> and
     * <code>anim-stop</code>; both has current time stamp as only parameter.
     * 
     * @type js.event.CustomEvents
     */
    this._events = new js.event.CustomEvents();
    this._events.register("anim-render");
    this._events.register("anim-stop");
};

js.fx.Anim.prototype = {
    /**
     * Add event listener.
     * 
     * @param String type custom event type,
     * @param Function listener event listener to register,
     * @param Object... scope optional listener run-time scope, default to global scope.
     * @return js.fx.Anim this object.
     */
    on : function (type, listener, scope) {
        this._events.addListener(type, listener, scope || window);
        return this;
    },

    /**
     * Remove event listener.
     * 
     * @param String type custom event type,
     * @param Function listener event listener to remove,
     * @return js.fx.Anim this object.
     */
    un : function (type, listener) {
        this._events.removeListener(type, listener);
        return this;
    },

    /**
     * Start animation. Set all this animation effects to running state and request for animation frame. This is the
     * kicking point; rendering logic will keep requesting additional animation frames as time there are running
     * effect(s).
     */
    start : function () {
        this._fxs.forEach(function (fx) {
            fx.running = true;
        });
        this._startTimestamp = null;
        this._animationFrameRequestId = this._requestAnimationFrame(this._FRAME_REQUEST_CALLBACK);
    },

    /**
     * Stop animation. Force all this animation effects running state to false and cancel pending animation frame
     * request, if any. This method is here for completion; is not expected to be used too often.
     */
    stop : function () {
        if (this._animationFrameRequestId !== null) {
            this._fxs.forEach(function (fx) {
                fx.running = false;
            });
            if (this._animationFrameRequestId !== null) {
                this._cancelAnimationFrame(this._animationFrameRequestId);
            }
            this._animationFrameRequestId = null;
        }
    },

    /**
     * Request from animation frame.
     * 
     * @param Function frameRequestCallback rendering logic implementation.
     */
    _requestAnimationFrame : function (frameRequestCallback) {
        return window.requestAnimationFrame(frameRequestCallback);
    },

    /**
     * Cancel previous registered animation frame request.
     * 
     * @param Number animationFrameRequestId ID returned by previous call to {@link _requestAnimationFrame}.
     */
    _cancelAnimationFrame : function (animationFrameRequestId) {
        window.cancelAnimationFrame(animationFrameRequestId);
    },

    /**
     * Render animation effects, active at this particular time stamp. This is animation engine core: for every
     * animation effect compute style value using transform function, depending on current time stamp. If relative time
     * stamp exceed duration effect running state is set to false; if there is at least one still running effect request
     * for a new animation frame. When all effect done fires <em>anim-stop</em> event.
     * 
     * @param Number timestamp current time stamp.
     */
    _render : function (timestamp) {
        var runningFxs;

        if (this._startTimestamp === null) {
            this._startTimestamp = timestamp;
        }
        timestamp -= this._startTimestamp;

        runningFxs = 0;
        this._fxs.forEach(function (fx) {
            var t, value;
            if (!fx.running) {
                return;
            }

            t = timestamp - fx.offset;
            if (t < 0) {
                return;
            }
            
            value = Math.round(fx.ttf(t, fx.origin, fx.magnitude, fx.duration));
            fx.render(value, timestamp);
            
            if (t > fx.duration) {
                fx.running = false;
            }
            else {
                runningFxs++;
            }
        }, this);

        if (runningFxs > 0) {
            this._events.fire("anim-render", timestamp);
            this._requestAnimationFrame(this._FRAME_REQUEST_CALLBACK);
            return;
        }

        // ensure every effect reach final value to cope with frame loss
        this._fxs.forEach(function (fx) {
            fx.render(fx.magnitude + fx.origin, timestamp);
        });
        this._events.fire("anim-stop", timestamp);
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.fx.Anim";
    }
};
$extends(js.fx.Anim, Object);

$legacy(typeof window.requestAnimationFrame !== "function", function () {
    if (typeof webkitRequestAnimationFrame === "function") {
        js.fx.Anim.prototype._requestAnimationFrame = function (frameRequestCallback) {
            return window.webkitRequestAnimationFrame(frameRequestCallback);
        };

        js.fx.Anim._cancelAnimationFrame = function (animationFrameRequestId) {
            window.webkitCancelAnimationFrame(animationFrameRequestId);
        };
    }
    else {
        js.fx.Anim.prototype._requestAnimationFrame = function (callback) {
            // since we are in degraded mode uses only 30 FPS
            return window.setTimeout(function () {
                callback(new Date().getTime() - js.lang.Operator._timestamp);
            }, 33);
        };

        js.fx.Anim._cancelAnimationFrame = function (timeoutId) {
            window.clearTimeout(timeoutId);
        };
    }
});
