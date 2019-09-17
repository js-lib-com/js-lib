$legacy(typeof FormData === "undefined", function () {
    /**
     * Add event listener.
     * 
     * @param String type
     * @param Function listener
     * @param Object scope
     * @return js.net.XHR
     */
    js.net.XHR.prototype.on = function (type, listener, scope) {
        $assert(this._state === js.net.XHR.StateMachine.CREATED, "js.net.XHR#on", "Illegal state.");
        this._events.addListener(type, listener, scope || window);
        return this;
    };

    js.net.XHR.prototype._open = js.net.XHR.prototype.open;

    /**
     * @param js.net.Method method
     * @param String url
     * @param Boolean async
     * @param String user
     * @param String password
     * @return js.net.XHR
     */
    js.net.XHR.prototype.open = function (method, url, async, user, password) {
        $assert(this._state === js.net.XHR.StateMachine.CREATED, "js.net.XHR#open", "Illegal state.");
        this._state = js.net.XHR.StateMachine.OPENED;

        $assert(method, "js.net.XHR#open", "Undefined or null method.");
        $assert(url, "js.net.XHR#open", "Undefined or null URL.");
        $assert(typeof async === "undefined" || js.lang.Types.isBoolean(async), "js.net.XHR#open", "Asynchronous flag is not boolean.");
        $assert(typeof user === "undefined" || js.lang.Types.isString(user), "js.net.XHR#open", "User is not string.");
        $assert(typeof password === "undefined" || js.lang.Types.isString(password), "js.net.XHR#open", "Password is not string.");

        this._method = method;
        this._url = url;
        this._async = async;
        this._user = user;
        this._password = password;
        this._headers = [];
        return this;
    };

    /**
     * @param String header
     * @param String value
     * @return js.net.XHR
     */
    js.net.XHR.prototype._setHeader = function (header, value) {
        this._headers.push({
            header : header,
            value : value
        });
        return this;
    };

    js.net.XHR.prototype._send = js.net.XHR.prototype.send;

    js.net.XHR.prototype.send = function (data) {
        var res = undefined;
        if (data instanceof js.dom.Form) {
            this._request.abort();
            delete this._requets;
            this._request = new js.net.XHR.Upload(this);

            var form = data;
            // refrain to add action setter to js.dom.Form class
            // form.setAction(this.url);
            form._node.action = this._url;
            this._request.send(form);

            // if form upload has progress indicate only start - here and end on transaction done
            // uses fictional numbers
            if (this._events.hasType("progress")) {
                this._events.fire("progress", {
                    total : 100,
                    loaded : 0
                });
            }
        }
        else {
            this._state = js.net.XHR.StateMachine.CREATED;
            this._open(this._method, this._url, this._async, this._user, this._password);
            for ( var i = 0, item; i < this._headers.length; ++i) {
                item = this._headers[i];
                this._request.setRequestHeader(item.header, item.value);
            }
            res = this._send(data);
        }
        return res;
    };

    js.net.XHR.prototype._done = function () {
        if (this._events.hasType("progress")) {
            this._events.fire("progress", {
                total : 100,
                loaded : 100
            });
        }
    };

    js.net.XHR.prototype._finalize = js.net.XHR.prototype.finalize;

    js.net.XHR.prototype.finalize = function () {
        delete this._method;
        delete this._url;
        delete this._async;
        delete this._user;
        delete this._password;
        delete this._headers;
        if (this._request instanceof js.net.XHR.Upload) {
            this._request.finalize();
        }
        this._finalize();
    };

    /**
     * Asynchronous upload handler. This private class is used by {@link js.net.XHR} class when data to be sent is a
     * {@link js.dom.Form} instance.
     * 
     * Important notes:
     * <ol>
     * <li>Because <i>asynchronous</i> feat is implemented with hidden iframe used as form target, server response
     * content type must be <b>text/html</b>; specifically do not use <b>application/json</b>. Otherwise browser will
     * try to open server response instead to pass it to the hidden iframe - as a consequence iframe on load event is
     * not triggered.
     * <li>Browser security doesn't allow accessing a child frame document if it"s loaded from a different domain. For
     * this reason do not try to set upload URI to different domain, our recommendation being to use relative path.
     * </ol>
     * 
     * @author Iulian Rotaru
     * @since 1.0
     * @constructor
     * 
     * @param js.net.XHR transaction parent XHR transaction.
     */
    js.net.XHR.Upload = function (transaction) {
        $assert(transaction instanceof js.net.XHR, "js.net.XHR.Upload#Upload", "Transaction is not instance of js.net.XHR");

        /** @type js.net.XHR */
        this._transaction = transaction;

        /** @type js.net.ReadyState */
        this.readyState = js.net.ReadyState.UNSET;
        /** @type Date */
        this._timestamp = null;
        /** @type Boolean */
        this._send = false;
        /** @type Number */
        this.status = null;
        /** @type String */
        this.statusText = null;
        /** @type String */
        this.responseText = null;
        /** @type Document */
        this.responseXML = null;

        /** @type js.dom.IFrame */
        this._iframe = null;
        /** @type Object */
        this._responseHeaders = null;
    };

    js.net.XHR.Upload.prototype = {
        /**
         * @param js.dom.Form form
         * @return js.net.XHR.Upload
         */
        send : function (form) {
            this.readyState = js.net.ReadyState.OPENED;
            form._node.encoding = "multipart/form-data";

            var doc = form.getOwnerDoc();
            var id = js.util.ID();
            this._iframe = doc.createElement("iframe", "id", id, "name", id, "src", "about:blank");
            this._iframe.style.set({
                "position" : "absolute",
                "top" : "-1000px",
                "left" : "-1000px"
            });
            this._iframe.on("load", this._onIFrameLoaded, this);
            doc.getByTag("body").addChild(this._iframe);
            form.setAttr("target", this._iframe.getAttr("id"));

            // access DOM native form node in order to avoid submit validation performed by js form classe(s)
            // also form send uses js.net.XHR.send which on its turn call this method... circular invocations
            form.getNode().submit();
            return this;
        },

        /**
         * Inner frame loaded.
         */
        _onIFrameLoaded : function () {
            $assert(this._iframe.getLocation() !== "about:blank", "js.net.XHR.Upload$_onIFrameLoaded", "Load event generated by blank iframe.");

            var doc = this._iframe.getInnerDoc();

            this._responseHeaders = {};
            var it = doc.findByTag("meta").it(), meta;
            while (it.hasNext()) {
                meta = it.next();
                if (meta.hasAttr("http-equiv")) {
                    this._responseHeaders[meta.getAttr("http-equiv")] = meta.getAttr("content");
                }
                else {
                    this[meta.getAttr("name")] = meta.getAttr("content");
                }
            }
            this.status = Number(this.status);

            this.responseText = doc.getByTag("body").getText();
            if (this.getResponseHeader("Content-Type") === "text/xml") {
                this.responseXML = js.dom.Builder.parseXML(this.responseText).getDocument();
            }
            this.readyState = js.net.ReadyState.DONE;
            this._transaction._done();
            this._transaction._onReadyStateChange();
        },

        /**
         * @param String header
         * @return String
         */
        getResponseHeader : function (header) {
            var h = this._responseHeaders[header];
            return h ? h : null;
        },

        /**
         * Abort.
         */
        abort : function () {
            this.status = 0;
            this.statusText = "USER ABORT";
            if (this._progressTimer) {
                this._progressTimer.stop();
            }
            this._iframe.reload(); // reload iframe to signal engine to stop upload
            this._iframe.remove();
            delete this._iframe;
        },

        /**
         * Finalize.
         */
        finalize : function () {
            this._iframe.remove();
            delete this._iframe;
            delete this._transaction;
        }
    };
});
