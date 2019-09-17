$package('js.fx');

/**
 * Animation effect descriptor. An effect is the transition of an {@link js.dom.Element} style from a starting value to
 * an ending one, lasting for certain amount of time. Every effect has a temporal transfer function that controls style
 * value evolution over the time. Note that only style with numerical value are supported.
 * <p>
 * User defined rendering logic is allowed, see {@link #render}. If rendering logic is supplied element, style and
 * units are optional.
 */
js.fx.Descriptor = {
    /**
     * Element on with effect is applied. This property is optional if user defined rendering logic is defined, see
     * {@link #render}.
     * 
     * @type js.dom.Element
     */
    el : null,

    /**
     * Offset in milliseconds. This is the delay transition actually start, allowing for multiple effects executed
     * concurrently or sequential, depending on the value of this offset. Defaults to 0.
     * 
     * @type Number
     */
    offset : null,

    /**
     * Effect duration, in milliseconds. Default to 1000, that is, a second.
     * 
     * @type Number
     */
    duration : null,

    /**
     * Element style, subject of this effect. Only styles with numerical value are supported. This property is mandatory
     * only if element is defined, see {@link #el}.
     * 
     * @type String
     */
    style : null,

    /**
     * Style value measurement units. If missing uses pixels for styles declared in {@link js.fx.Config PX_UNITS}. This
     * property is mandatory only if element and style is defined.
     * 
     * @type String
     */
    units : null,

    /**
     * Style starting value.
     * 
     * @type Number
     */
    from : null,

    /**
     * Style ending value.
     * 
     * @type Number
     */
    to : null,

    /**
     * Temporal transfer function, default to {@link js.fx.TTF.Linear}. This function controls the element style value
     * changes over the time.
     * 
     * @type js.fx.TTF
     */
    ttf : null,

    /**
     * Optional user defined rendering logic. If defined, this function replaces default effect rendering, see
     * {@link js.fx.Effect#render}. If user defined rendering logic is defined, {@link #el} and {@link #style} are
     * optional.
     * <p>
     * Function has two parameters: animated value and current time stamp and returns nothing. Time stamp is the number
     * of millisecond from animation start.
     * 
     * <pre>
     * Void render(Number value, Number timestamp);
     * </pre>
     * 
     * @type Function
     */
    render : null
};
