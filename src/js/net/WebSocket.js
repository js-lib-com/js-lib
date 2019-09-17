$package("js.net");

/**
 * Web socket.
 * <pre>
 *  var websocket = new js.net.WebSocket("ws://bbs/bbs", "baby-socket");
 *  websocket.on("open", function() {
 *      websocket._sock.send(JSON.stringify({
 *          caller : "+40 (721) 556-070"
 *      }));
 *  });
 * </pre>
 * <p>
 * <a id="events-description" /> Web Socket transaction events. <table>
 * <tr>
 * <td><b>open</b>
 * <td>Fired after web socket is opened.
 * <tr>
 * <td><b>close</b>
 * <td>Fired after web socket is closed.
 * <tr>
 * <td><b>message</b>
 * <td>This event has a single argument: data object from server.
 * <tr>
 * <td><b>error</b>
 * <td>Fired on server side and networking failures. Note that this event is not triggered when application code from
 * server throws exception.</table>
 * 
 * @since 1.0
 * @constructor Construct web socket instance.
 * @param String url optional web socket URL,
 * @param String subProtocol.
 * @assert At least <em>subProtocol</em> argument is present and is not undefined, null or empty. The same for
 *         <em>url</em>, if present.
 */
js.net.WebSocket = function () {
    $assert(arguments.length, "js.net.WebSocket#WebSocket", "Missing argument(s).");
    var url, subProtocol;
    if (arguments.length === 2) {
        url = arguments[0];
        subProtocol = arguments[1];
    }
    else {
        var u = WinMain.url;
        url = $format("ws://%s:%d/%s/sock.wsp", u.host, u.port, u.path);
        subProtocol = arguments[0];
    }
    $assert(url, "js.net.WebSocket#WebSocket", "URL is undefined, null or empty.");
    $assert(subProtocol, "js.net.WebSocket#WebSocket", "Sub-protocol is undefined, null or empty.");

    /**
     * Web socket events.
     * 
     * @type js.event.CustomEvents
     */
    this._events = new js.event.CustomEvents();
    this._events.register("open", "close", "message", "error");

    /**
     * Built-in web socket instance.
     * 
     * @type WebSocket
     */
    this._sock = new WebSocket(url, subProtocol);
    this._sock.onopen = this._onopen.bind(this);
    this._sock.onclose = this._onclose.bind(this);
    this._sock.onmessage = this._onmessage.bind(this);
    this._sock.onerror = this._onerror.bind(this);
};

js.net.WebSocket.prototype = {
    /**
     * Add event listener. Listener function should have next signature:
     * 
     * <pre>
     * 	void listener(Object... args)
     * </pre>
     * 
     * where <em>args</em> are specific for every event type. See <a href="#events-description">events description</a>.
     * 
     * @param String type event type,
     * @param Function listener event listener to register,
     * @param Object scope listener run-time scope.
     * @return js.net.WebSocket this pointer.
     */
    on : function (type, listener, scope) {
        this._events.addListener(type, listener, scope || window);
        return this;
    },

    /**
     * Send data object to server.
     * 
     * @param Object data object to be sent.
     * @return js.net.WebSocket this pointer.
     */
    send : function (data) {
        this._sock.send(JSON.stringify(data));
        return this;
    },

    /**
     * Close this web socket instance.
     */
    close : function () {
        this._sock.close();
    },

    /**
     * Internal handler for open event.
     */
    _onopen : function () {
        this._events.fire("open");
    },

    /**
     * Internal handler for close event.
     */
    _onclose : function () {
        this._events.fire("close");
    },

    /**
     * Internal handler for message event.
     */
    _onmessage : function (message) {
        var data = JSON.parse(message.data);
        this._events.fire("message", data);
    },

    /**
     * Internal handler for error event.
     */
    _onerror : function () {
        this._events.fire("error");
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.net.WebSocket";
    }
};
$extends(js.net.WebSocket, Object);
