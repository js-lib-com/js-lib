$package("js.fx");

/**
 * Animation effect runtime structure. An effect is animation atom: it is a change in an element style from a start to
 * an end value, occurring in a given time interval. This class encapsulates data needed to run an effect. Effect
 * instance is updated by animation engine and is not meant to be reusable.
 * <p>
 * Effect class provides rendering logic. Default rendering logic set element style value using defined units. Value is
 * passed from animation engine, the others are from current effect properties. Rendering logic can be overwritten by
 * user code, see {@link js.fx.Descriptor#render}.
 * 
 * @constructor Create animation effect instance from given animation descriptor. Takes care to set proper default
 *              values for those not supplied by user code, via descriptor, as follows:
 *              <ul>
 *              <li>0 for offset,
 *              <li>{@link js.fx.Config DEF_DURATION} for duration,
 *              <li>{@link js.fx.TTF.Linear} for transform functions,
 *              <li><em>px</em> for units, if style qualifies, or empty.
 *              </ul>
 *              The rest of properties are mandatory and assert is rose if descriptor miss to include them:
 *              <em>element</em>, <em>style</em>, <em>from</em> and <em>to</em> values.
 * @param js.fx.Descriptor descriptor effect descriptor.
 * @assert mandatory properties are present on descriptor argument and start and end values are not equals.
 */
js.fx.Effect = function (descriptor) {
    $assert(!descriptor.el || js.lang.Types.isElement(descriptor.el), "js.fx.Effect#Effect", "Element argument is not a valid j(s)-lib element.");
    $assert(!descriptor.style || js.lang.Types.isString(descriptor.style), "js.fx.Effect#Effect", "Style argument should be a not empty string.");
    $assert(!descriptor.render || js.lang.Types.isFunction(descriptor.render), "js.fx.Effect#Effect", "Render argument should be a function.");
    $assert(js.lang.Types.isNumber(descriptor.from), "js.fx.Effect#Effect", "Not numeric start value.");
    $assert(js.lang.Types.isNumber(descriptor.to), "js.fx.Effect#Effect", "Not numeric end value.");
    $assert(descriptor.from !== descriptor.to, "js.fx.Effect#Effect", "Same value for start and end.");

    /**
     * Flag to indicate effect running state. Initial value is false.
     * 
     * @type Boolean
     */
    this.running = false;

    /**
     * Time interval from animation start with which effect start is delayed, measured in milliseconds. Default value is
     * 0.
     * 
     * @type Number
     */
    this.offset = descriptor.offset || 0;

    /**
     * Effect duration, in milliseconds. Default value is {@link js.fx.Config DEF_DURATION}.
     * 
     * @type Number
     */
    this.duration = descriptor.duration || js.fx.Config.DEF_DURATION;

    /**
     * Temporal transfer function, default to {@link js.fx.TTF.Linear}. This function controls the element style value
     * changes over the time.
     * 
     * @type js.fx.TTF
     */
    this.ttf = descriptor.ttf || js.fx.TTF.Linear;

    /**
     * Element style, subject of this effect. Only styles with numerical value are supported.
     * 
     * @type String
     */
    this.style = descriptor.style;

    /**
     * Style value measurement units. If missing uses pixels for styles declared in {@link js.fx.Config PX_UNITS}.
     * 
     * @type String
     */
    this.units = descriptor.units || (js.fx.Config.PX_UNITS.test(this.style) ? 'px' : '');

    /**
     * Effect origin, that is, initial value.
     * 
     * @type Number
     */
    this.origin = descriptor.from;

    /**
     * Effect magnitude is the difference between end and start values. It can be both positive or negative but not
     * zero.
     * 
     * @type Number
     */
    this.magnitude = descriptor.to - descriptor.from;

    /**
     * Element on with effect is applied.
     * 
     * @type js.dom.Element
     */
    this.el = descriptor.el;

    /**
     * Rendering logic executed for every computed value, on animation tick. Default rendering logic set element style
     * value using defined units. Value is passed from animation engine, the others are from current effect properties.
     * <p>
     * User defined rendering logic is accepted if configured into descriptor, see {@link js.fx.Descriptor#render}.
     * 
     * @type Function
     */
    this.render = descriptor.render ? descriptor.render : function (value, timestamp) {
        this.el.style.set(this.style, value + this.units);
    }
};
$extends(js.fx.Effect, Object);
