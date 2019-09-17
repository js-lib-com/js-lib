// refrain to use $package operator since is not yet defined
(function () {
    if (typeof js === "undefined") {
        js = {};
    }
    if (typeof js.ua === "undefined") {
        js.ua = {};
    }
})();

/**
 * System IO. This utility class provides standard system dialogs and the global {@link #error(Object) error handler}
 * used to report erroneous conditions. System dialogs resemble built-in dialogs provided by {@link Window} object, but
 * they are asynchronous. User space code may override system dialogs and supply dialog boxes based on HTML template.
 * 
 * <pre>
 *  js.ua.System.alert = function(message) {
 *      // open dialog box based on HTML template  
 *  }
 * </pre>
 * 
 * Please note that all system dialogs provided by this utility are asynchronous. For this reason dialogs that should
 * return a value require callback and optional scope arguments. Also be aware that {@link #alert(String, Object...)}
 * will not block running thread, i.e. script engine will continue executing lines of source code after alert
 * invocation; this is in contrast with built-in {@link Window#alert(String)} function supplied by host environment.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.ua.System = {
    /**
     * Generic error message used in production code. Note that if debug is active detailed error message is used
     * instead of this one.
     * 
     * @type String
     */
    _ERROR_MESSAGE : "Temporary failure. Please refresh the page.",

    /**
     * Print message to system console.
     * 
     * @param String message message to print.
     */
    print : function (message) {
        if (typeof console !== "undefined") {
            console.log(message.replace(/<br \/>/g, " "));
        }
    },

    /**
     * Global error handler. Because a JavaScript application is basically event driven almost all its code is executed
     * in event listeners, timer or asynchronous requests callbacks. This global error handler is the point were all
     * errors are treated. It is fairy unsophisticated, just log the error and {@link #alert}; it uses
     * {@link #_getErrorMessage} to format alert message. Application layers may override this handler and offer more
     * robust error management.
     * 
     * @param Object er error object or formatted string.
     */
    error : function (er) {
        js.ua.System.print(js.ua.System._getErrorMessage(arguments));
        js.ua.System.alert(this._ERROR_MESSAGE);
    },

    /**
     * Displays an asynchronous alert box with the specified formatted message. Given message may be formatted as
     * supported by {@link js.lang.Operator#$format(String,Object...)} operator.
     * 
     * <pre>
     * 	js.ua.System.alert("Formatted %s.", "message");
     * 	// above code display alert dialog and return immediately
     * </pre>
     * 
     * Please note system alert is asynchronous, it returns immediately after alert dialog display. Finally, this method
     * is NOP if invoked with no arguments.
     * 
     * @param String message alert message,
     * @param Object... args optional values, if message is formatted.
     */
    alert : function (message) {
        if (arguments.length > 0) {
            if (arguments.length > 1) {
                message = $format(arguments);
            }
            window.setTimeout(function () {
                window.alert(message);
            }, 1);
        }
    },

    /**
     * Alias for {@link #alert(String,Object...)}. If user space code overrides system dialogs it should display the
     * <em>toast</em> with no button, for a limited period of time. Anyway, this library implementation delegates
     * standard {@link Window#alert(String)}.
     * 
     * <pre>
     * 	js.ua.System.toast("Formatted %s.", "message");
     * 	// above code display toast dialog and return immediately
     * </pre>
     * 
     * Please note system toast is asynchronous, it returns immediately after dialog display. Finally, this method is
     * NOP if invoked with no arguments.
     * 
     * @param String message toast message,
     * @param Object... args optional values, if message is formatted.
     */
    toast : function (message) {
        if (arguments.length > 0) {
            if (arguments.length > 1) {
                message = $format(arguments);
            }
            window.setTimeout(function () {
                window.alert(message);
            }, 1);
        }
    },

    /**
     * Displays a prompt dialog box with given message and callback and returns immediately.
     * 
     * <pre>
     * 	js.ua.System.prompt("Please enter a value.", function(value) {
     * 		if(value === undefined) {
     * 			// some action on user cancel
     * 		}
     * 		if(value === null) {
     * 			// some action on user ok but no text input
     * 		}
     * 		if(value) {
     * 			// value is not null and OK button was pressed
     * 		}
     * 	});
     * </pre>
     * 
     * Please note system toast is asynchronous, it returns immediately after dialog display.
     * <p>
     * Prompt dialog has two buttons: OK and cancel. On OK callback is invoked with the text input value, or null if
     * user enter no text. On cancel callback is invoked with undefined value. This way, a true boolean test on value
     * means user enter some text and OK button was pressed. Finally, this method is NOP if invoked with no arguments.
     * 
     * @param String message prompt message,
     * @param Function callback prompt value handler,
     * @param Object scope optional callback run-time scope, default to global scope.
     * @assert Message is not undefined, null or empty, callback argument is a function and scope argument is an object,
     *         if present.
     */
    prompt : function (message, callback, scope) {
        if (arguments.length > 0) {
            if (arguments.length > 1) {
                message = $format(arguments);
            }
            window.setTimeout(function () {
                var prompt = window.prompt(message);
                if (prompt === null) {
                    // user cancel; convert to undefined
                    prompt = undefined;
                }
                else {
                    // user pressed OK
                    if (prompt.length === 0) {
                        // user OK but no input; convert to null
                        prompt = null;
                    }
                }
                callback.call(scope || window, prompt);
            }, 1);
        }
    },

    /**
     * Displays a confirmation dialog with given message and callback then returns immediately.
     * 
     * <pre>
     * 	js.ua.System.confirm("Please confirm action...", function(ok) {
     * 		if(ok) {
     * 			// perform critical action
     * 		}
     * 	}); 
     * </pre>
     * 
     * Please note that confirm dialog is asynchronous, it returns immediately after dialog display. Since confirm is
     * asynchronous it has a callback function invoked with boolean true if user press OK button or false on cancel.
     * Finally, this method is NOP if invoked with no arguments.
     * 
     * @param String message ask for confirmation message,
     * @param Function callback confirmation handler,
     * @param Object scope optional callback run-time scope, default to global scope.
     * @assert Message is not undefined, null or empty, callback argument is a function and scope argument is an object,
     *         if present.
     */
    confirm : function (message, callback, scope) {
        if (arguments.length > 0) {
            if (arguments.length > 1) {
                message = $format(arguments);
            }
            window.setTimeout(function () {
                callback.call(scope || window, window.confirm(message));
            }, 1);
        }
    },

    /**
     * Get formatted error message. Prepare error message for displaying based on array of arguments. If array"s first
     * item is an error object uses its name and message to compile returned error message; otherwise array can contains
     * a variable number of items but first should be a string, possible formatted as accepted by
     * {@link js.lang.Operator#$format} pseudo-operator.
     * 
     * @param Array args arguments list.
     * @return String error message.
     */
    _getErrorMessage : function (args) {
        if (args[0] instanceof Error) {
            var er = args[0];
            var s = er.name;
            if (er.message) {
                s += ("\r\n" + er.message);
            }
            if(er.stack) {
            	s += ("\r\n\r\n" + er.stack);
            }
            return s;
        }
        return $format(args);
    }
};

(function () {
    // Replace global error handler with with a more explicit one, if debugging active.
    if (typeof __js_debug__ !== "undefined") {
        js.ua.System.error = function (er) {
            var s = js.ua.System._getErrorMessage(arguments);
            js.ua.System.print(s);
            js.ua.System.alert(s);
        };
    }
})();
