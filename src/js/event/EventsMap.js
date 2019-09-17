$package("js.event");

/**
 * Declarative events registration. This utility class registers events declared into an events map. Basically, events
 * map uses event declaration as key and event listener as value. An event declaration has an event type and a CSS
 * selector; event listener is a function executed into a given scope. If CSS selector points to multiple elements all
 * are used for event registration.
 * <p>
 * This class is used by both document and document elements. Here are couple example using an element. First line
 * registers <code>click</code> event, to element descendants with name <code>create</code>, to event listener
 * <code>this._onCreate</code> that is executed into <code>this</code> scope.
 * 
 * <pre>
 *  element.on(this, {
 *      "click [name='create']" : this._onCreate,
 *      "click [name='edit']" : this._onEdit
 *  });
 * </pre>
 * 
 * <p>
 * In an event declaration, <code>click</code> mouse event is default and can miss.
 * 
 * <pre>
 *  element.on(this, {
 *      "[name='create']" : this._onCreate,
 *      "[name='edit']" : this._onEdit
 *  });
 * </pre>
 * 
 * <p>
 * It is a good practice to not bind script to elements using tags and CSS classes that should be used solely for
 * styling. Instead j(s)-lib uses element name, both <code>name</code> and <code>data-name</code> attributes are
 * accepted. Event declaration uses a proprietary syntax for selecting elements by name, namely, uses ampersand as
 * prefix.
 * 
 * <pre>
 *  element.on(this, {
 *      "&create" : this._onCreate,
 *      "&edit" : this._onEdit
 *  });
 * </pre>
 * 
 * @author Iulian Rotaru
 * @since 1.3
 */
js.event.EventsMap = {
    /**
     * Test if arguments designates an events map and process it, if the case. In order to qualifies for events map
     * <code>args</code> length should be at least 2 and first two items to be strict objects. First argument is event
     * listeners scope, the same for all listeners and the second is event declaration map. If condition is not
     * fulfilled this handler is NOP and returns false.
     * <p>
     * Events map has multiple event declaration. An event declaration assigns an event listener to an element
     * identified by CSS selector, for a specified event type. All event listeners are executed in the same listeners
     * scope that is the first argument from <code>args</code>. CSS selector from event declaration is executed into
     * the given <code>context</code>.
     * 
     * <pre>
     *  [
     *      listenersScope,                              // execution scope for event listeners 
     *      {                                            // events map                                                
     *          "click [name='create']" : this._onCreate // event declaration 
     *      }
     *  ]      
     * </pre>
     * 
     * 
     * @param Object context document or element used as search context for CSS selector,
     * @param Array args events map handler arguments, see above.
     * @return Boolean true if arguments describe and events map.
     */
    handle : function (context, args) {
        if (args.length < 2) {
            return false;
        }
        if (!js.lang.Types.isStrictObject(args[0])) {
            return false;
        }
        if (!js.lang.Types.isStrictObject(args[1])) {
            return false;
        }

        var listenersScope = args[0];
        var eventsMap = args[1];

        var eventSelector;
        var eventType;
        var eventListener;
        var selector;
        var name;
        var separatorIndex;

        // event declaration { "click [name='create']" : this._onCreate }
        // event selector click [name='create']
        // event type click
        // selector [name='create']
        // event listener this._onCreate

        for (eventSelector in eventsMap) {
            separatorIndex = eventSelector.indexOf(' ') + 1;
            eventType = separatorIndex > 0 ? eventDeclararion.substring(0, separatorIndex).trim() : "click";
            selector = eventSelector.substring(separatorIndex).trim();
            if (selector.charAt(0) === '&') {
                name = selector.substring(1);
                selector = $format("[name='%s'],[data-name='%s']", name, name);
            }

            eventListener = eventsMap[eventSelector];
            $assert(js.lang.Types.isFunction(eventListener), "js.event.EventsMap#handle", "Event listener for |%s| is not a function.", eventSelector);

            context.findByCss(selector).on(eventType, eventListener, listenersScope);
        }

        return true;
    }
};