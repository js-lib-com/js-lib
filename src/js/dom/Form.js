$package("js.dom");

/**
 * Form element. There are couple uses cases this class tries to cover:
 * <ol>
 * <li>Post Data - Asynchronous post data from client to server - like posting a comment,
 * <li>File(s) Upload - Asynchronous upload single or multiple files,
 * <li>Mixed Form - Mix of post data and file(s) upload,
 * <li>Data Edit - Asynchronous load data from server, edit and save for standard CRUD operations.
 * </ol>
 * <p>
 * In the context of this class synchronous means server will return a resource and client need to render it, that is,
 * current page is replaced. The term is used in contrast with asynchronous {@link js.net.XHR}.
 * <p>
 * This class is specifically designed to be used with XHR for asynchronous form processing, see simplified sample code
 * below. Support to synchronous forms is almost not existent. This is not a limitation, is a conscious decision of good
 * practice. Page loading with all its chrome overhead is intrinsic not optimal and should be avoid. Anyway, if one
 * really needs to switch the page after form processing can simple use {@link js.ua.Window#assign(String, Object...)}.
 * 
 * <pre>
 *  var xhr = new js.net.XHR();
 *  xhr.on("progress", function(progress) {
 *      // uses progress.total and progress.loaded to update user interface
 *  });
 *  xhr.open("POST", "user-controller/upload-picture.xsp");
 *      
 *  var form = doc.getById("form");
 *  if(form.isValid()) {
 *      xhr.send(form);
 *  }
 * </pre>
 * 
 * Because XHR class uses browser support that properly encode the form using <code>multipart/form-data</code> it can
 * be used also to asynchronously upload files; it's enough to include {@link js.dom.FileInput} controls into the form.
 * Also XHR <code>progress</code> event is handy for form upload progress monitoring.
 * <p>
 * Form class also provides methods to initialize and retrieve control values from/to standard objects. This is useful
 * for data edit forms that loads form data from server, like in sample code below. On its turn getter can be handy for
 * form pre-processing before submit, see below.
 * 
 * <pre>
 *  comp.prj.Controller.getContract(contractId, function(contract) {
 *      form.setObject(contract);
 *  });
 * </pre>
 * 
 * <p>
 * There is an alternative way beside sending direct the form to server: retrieve form object using
 * {@link #getObject(Object...)} and send it as <code>application/json</code> using HTTP-RMI.
 * 
 * <pre>
 *  var contract = doc.getById("contract-form").getObject();
 *  // optional object pre-processing before sending on server
 *  comp.prj.Controller.saveContract(contract);
 * </pre>
 * 
 * Form validation - see {@link #isValid()}, delegates every control {@link js.dom.Control#isValid()} predicate that
 * updates its own <em>validity</em> state accordingly; after that, form uses event delegation to invoke
 * {@link js.dom.Control#focus()} which clean-up <em>validity</em> state when user focus on specific control.
 * 
 * <p>
 * This form always uses <code>multipart/form-data</code> encoding> and set method to <code>POST</code>. Also
 * disable browser control validation using <code>novalidate</code> attribute.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct form data instance. Call super class constructor, initialize HTTP method and encoding type
 *              then register <code>focus</code> event {@link #_onFocus(js.event.Event) listener}.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
js.dom.Form = function (ownerDoc, node) {
    $assert(this instanceof js.dom.Form, "js.dom.Form#Form", "Invoked as function.");
    this.$super(ownerDoc, node);
    this.setAttr("novalidate", "novalidate");
    this._node.method = js.net.Method.POST;
    this._setEnctype("multipart/form-data");

    // focus event does not bubble so we need to use capture to dispatch it first to this form element
    // on focus handler we take care to set focus on original target
    this.on("focus", this._onFocus, this, true);

    /**
     * This form controls iterable.
     * 
     * @type js.dom.ControlsIterable
     */
    this._iterable = new js.dom.ControlsIterable(this);
};

js.dom.Form.prototype = {
    /**
     * Initialize this form controls from the given object. For each control, hidden inputs included, tries to get a
     * value from given <code>object</code> using property path returned by {@link #_getOPPath(js.dom.Control)} and,
     * if there is one, set the control value. If value is found but null reset the control.
     * <p>
     * Form data convention is to use control name as object property path. In snippet below, input name is used as
     * object property path for {@link js.lang.OPP} that return wheel pressure value; after this method execution input
     * value will be <code>1.8</code>.
     * 
     * <pre>
     *  &lt;input name="wheels.1.pressure" /&gt;
     *  . . .
     *  var car = {
     *      wheels: [ 
     *      . . .
     *      {
     *          pressure: 1.8    
     *      }
     *      . . .
     *      ]
     *  };
     * </pre>
     * 
     * Because this method uses {@link js.lang.OPP} to retrieve values, given <code>object</code> argument can have
     * arbitrary complex graph, though the usual case is to use flat objects.
     * <p>
     * Finally, this method takes care to focus on first child control before returning.
     * 
     * @param Object object to get data from.
     * @return js.dom.Form this object.
     */
    setObject : function (object) {
        this._iterable.forEachAll(function (control) {
            var opp = this._getOPPath(control), value;
            if (opp !== null) {
                value = js.lang.OPP.get(object, opp);
                if (typeof value !== "undefined") {
                    control.setValue(value);
                }
            }
        }, this);
        return this.focus();
    },

    /**
     * Load object properties from this form controls. For each control, hidden inputs included, retrieve object
     * property path using {@link #_getOPPath(js.dom.Control)} and delegate
     * {@link js.lang.OPP#set(Object, String, Object)} to actually store formatted control value into object property.
     * Control value is that returned by {@link js.dom.Control#getValue()}.
     * <p>
     * This method uses {@link js.dom.ControlsIterable} to scan for controls.
     * <p>
     * For a discussion about mapping convention please see {@link #setObject(Object)}. Finally, if optional
     * <code>object</code> argument is missing a new object is created.
     * 
     * @param Object... object optional object to store value into.
     * @return Object initialized object.
     */
    getObject : function (object) {
        if (typeof object === "undefined") {
            object = {};
        }
        this._iterable.forEachAll(function (control) {
            var opp = this._getOPPath(control);
            if (opp !== null) {
                js.lang.OPP.set(object, opp, control.getValue());
            }
        }, this);
        return object;
    },

    /**
     * Get object property path associated with control. OPP, short for object property path is used by
     * {@link js.lang.OPP} utility to retrieve or store value from/to specified object property. Form data convention is
     * to use control name as OPP and arbitrary OPP length is supported. See {@link js.dom.Control#getName()} for
     * control name retrieval logic.
     * <p>
     * This method also implements logic for name conversion from HTTP like names to script case, e.g.
     * <code>user-name</code> become <code>userName</code>. Of course, if name is already script case is not
     * changed.
     * 
     * @param js.dom.Control control control to retrieve OPP from.
     * @return String object property path or null.
     */
    _getOPPath : function (control) {
        var name = control.getName();
        return name !== null ? js.util.Strings.toScriptCase(name) : null;
    },

    /**
     * Controls validation. For each control, hidden inputs excluded, invoke {@link js.dom.Control#isValid} and add
     * <code>invalid</code> CSS class if control validation fails. An empty control with <code>optional</code> CSS
     * class is considered valid. Anyway, if optional control has value aforementioned validation takes place.
     * 
     * @return Boolean true only if every single child control is valid.
     */
    isValid : function () {
        var valid = true;
        this._iterable.forEach(function (control) {
            valid = control.isValid() && valid;
        });
        return valid;
    },

    /**
     * Focus on first <code>autofocus</code> descendant control. Try to locate first control that have
     * <code>autofocus</code> attribute and apply {@link js.dom.Control#focus()} on it. If there are more
     * <code>autofocus</code> controls select the first found - in standard depth-first order and ignore the rest. If
     * no <code>autofocus</code> control found this method silently does nothing.
     * 
     * @return js.dom.Form this object.
     */
    focus : function () {
        var autofocusControl = this.getByCss("[autofocus]");
        if (autofocusControl !== null) {
            autofocusControl.focus();
        }
        return this;
    },

    /**
     * Get this form action.
     * 
     * @return String this form action or null.
     */
    getAction : function () {
        return this._node.action || null;
    },

    /**
     * Send this form synchronously. This method is a thin wrapper, it just delegates native form submit function.
     */
    submit : function () {
        this._node.submit();
    },

    /**
     * Reset all controls, excluding hidden inputs. Traverse all controls and invoke {@link js.dom.Control#reset()} for
     * every one. Also remove <code>invalid</code> CSS class. Note that hidden inputs are not affected. This may
     * depart from W3C specifications but is the de facto behavior. Finally, before returning this method takes care to
     * {@link #focus}.
     * 
     * @return js.dom.Form this object.
     */
    reset : function () {
        this._iterable.forEach(function (control) {
            control.reset();
        });
        return this.focus();
    },

    /**
     * Return built-in form data object initialized from this form controls. Although public, this method is intended to
     * be used internally by this library {@link XHR} implementation, especially handy for files upload. If argument of
     * {@link XMLHttpRequest#send(Object...)} method is of type {@link FormData} the user agent knows to create an
     * asynchronous HTTP request encoded <code>multipart/form-data</code>.
     * <p>
     * Note that returned form data fields are normalized, i.e. converted to string representation acceptable by server
     * side logic. For example {@link Date} is represented as ISO8601 string.
     * 
     * @return FormData initialized native form data.
     */
    toFormData : function () {
        /**
         * Convert <code>value</code> to string representation acceptable by server side logic. For example date is
         * representation by ISO8601 string.
         * 
         * @param Object value to normalize.
         * @returns normalized value.
         */
        function normalize (value) {
            if (value instanceof Date) {
                value = js.lang.JSON.stringify(value);
                if (value.charAt(0) === '"') {
                    value = value.substr(1, value.length - 2);
                }
            }
            return value;
        }

        var formData = new FormData();
        this._iterable.forEachAll(function (control) {
            control.forEachItem(function (item) {
                if (typeof item.extra === "undefined") {
                    formData.append(item.name, normalize(item.value));
                }
                else {
                    // extra can be, for example, file name in case item is a File
                    formData.append(item.name, normalize(item.value), item.extra);
                }
            }, this);
        });
        return formData;
    },

    /**
     * Add hidden named value to this form. If child control with given <code>name</code> already exists just set its
     * value, overriding the existing one. Otherwise creates a hidden input with given <code>name</code> and
     * <code>value</code> and insert it as first child of this form.
     * 
     * @param String name control name,
     * @param String value control value.
     * @return js.dom.Control created or updated hidden control.
     */
    addHidden : function (name, value) {
        var hidden = this.getByCss("input[name='%s']", name);
        if (hidden !== null) {
            hidden.setValue(value);
            return hidden;
        }
        hidden = this._ownerDoc.createElement("input", "type", "hidden", "name", name, "value", value);
        var el = this.getFirstChild();
        if (el !== null) {
            el.insertBefore(hidden);
        }
        else {
            this.addChild(hidden);
        }
        return hidden;
    },

    /**
     * Remove named hidden control. Control to be removed, identified by <code>name</code> should exist and of type
     * hidden. Otherwise assertion is thrown; if assertions are disabled and mentioned conditions are not met this
     * method does nothing.
     * 
     * @param String name hidden control name.
     * @return js.dom.Form this object.
     * @assert named control exists and is of type hidden.
     */
    removeHidden : function (name) {
        var hidden = this.getByCss("input[name='%s']", name);
        $assert(hidden !== null, "js.dom.Form#removeHidden", "Hidden control |%s| not found.", name);
        if (hidden === null) {
            return this;
        }
        var type = hidden.getAttr("type");
        $assert(type === "hidden", "js.dom.Form#removeHidden", "Invalid control |%s| type. Expected hidden but got |%s|.", name, type);
        if (type !== "hidden") {
            return this;
        }
        hidden.remove();
        return this;
    },

    /**
     * This form event delegate for <code>focus</code> DOM event. Focus event listener registered to this form and
     * configured for <code>capture</code> propagation. Because <code>focus</code> event does not bubble we need to
     * use capture in order to dispatch event directly to this event listener. This method uses
     * {@link js.event.Event#target} to acquire a reference to focused child control then ensure <code>invalid</code>
     * CSS class is removed and takes care to set focus on original control.
     * 
     * @param js.event.Event ev focus event.
     */
    _onFocus : function (ev) {
        ev.target.focus();
    },

    /**
     * Form encoding setter. This method is for internal use only. Form data does not allows for encoding change since
     * always use <code>multipart/form-data</code>.
     * 
     * @param String enctype encoding type, always <code>multipart/form-data</code>.
     * @assert encoding type is <code>multipart/form-data</code>
     */
    _setEnctype : function (enctype) {
        $assert(enctype === "multipart/form-data", "js.dom.Form#_setEnctype", "Form supports only multipart/form-data.");
        this._node.enctype = enctype;
    },

    /**
     * Returns a string representation of the object.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.dom.Form";
    }
};
$extends(js.dom.Form, js.dom.Element);

$legacy(js.ua.Engine.TRIDENT, function () {
    js.dom.Form.prototype._setEnctype = function (enctype) {
        this._node.encoding = enctype;
        return this;
    };
});
