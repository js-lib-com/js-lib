$package('js.net');

/**
 * XMLHttpRequest ready state. These are possible states a built-in {@link XMLHttpRequest}
 * may have; is not related to {@link js.net.XHR} state.
 *
 * @author Iulian Rotaru
 * @since 1.0
 */
js.net.ReadyState =
{
    /**
     * The object has been constructed.
     * @type Number
     */
    UNSENT: 0,

    /**
     * The open method has been successfully invoked.
     * @type Number
     */
    OPENED: 1,

    /**
     * All redirects (if any) have been followed and all HTTP headers of the final response have been received.
     * @type Number
     */
    HEADERS_RECEIVED: 2,

    /**
     * The response entity body is being received.
     * @type Number
     */
    LOADING: 3,

    /**
     * The data transfer has been completed or something went wrong during the transfer.
     * @type Number
     */
    DONE: 4
};
