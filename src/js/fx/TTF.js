$package('js.fx');

/**
 * Temporal transform functions.
 * 
 * All TTF has the same formal parameters and return value:
 * 
 * <pre>
 *  Number ttf(Number timestamp, Number origin, Number magnitude, Number duration);
 * </pre>
 * 
 * where: <em>timestamp</em> is current time stamp value, that is, temporal reference, <em>origin</em> element style
 * initial value, <em>magnitude</em> element style start and end delta value and <em>duration</em> effect duration.
 * Returns the computed value dependent on timestamp but pondered by the other arguments.
 */
js.fx.TTF = {};

/**
 * Linear transform. Computed value varies proportional with timestamp value, that is, variation speed is constant.
 * 
 * @constructor
 * @param Number timestamp current time stamp value, that is, temporal reference,
 * @param Number origin element style initial value,
 * @param Number magnitude element style start and end delta value,
 * @param Number duration effect effective duration.
 */
js.fx.TTF.Linear = function (timestamp, origin, magnitude, duration) {
    var tgalpha = magnitude / duration;
    return origin + tgalpha * timestamp;
};
$extends(js.fx.TTF.Linear, Object);

/**
 * Exponential transform. Start slowly and accelerates to the effect end.
 * 
 * @constructor
 * @param Number timestamp current time stamp value, that is, temporal reference,
 * @param Number origin element style initial value,
 * @param Number magnitude element style start and end delta value,
 * @param Number duration effect effective duration.
 */
js.fx.TTF.Exponential = function (timestamp, origin, magnitude, duration) {
    timestamp /= duration;
    return origin + magnitude * timestamp * timestamp;
};
$extends(js.fx.TTF.Exponential, Object);

/**
 * Logarithmic transform. Start with great speed and decrease to 0 to effect end.
 * 
 * @constructor
 * @param Number timestamp current time stamp value, that is, temporal reference,
 * @param Number origin element style initial value,
 * @param Number magnitude element style start and end delta value,
 * @param Number duration effect effective duration.
 */
js.fx.TTF.Logarithmic = function (timestamp, origin, magnitude, duration) {
    return origin - magnitude * (timestamp /= duration) * (timestamp - 2);
};
$extends(js.fx.TTF.Logarithmic, Object);

/**
 * Swing transform. This is a cyclic transformation, repeated four times. It generates a sinusoidal path but with
 * decreasing amplitude.
 * 
 * @constructor
 * @param Number timestamp current time stamp value, that is, temporal reference,
 * @param Number origin element style initial value,
 * @param Number magnitude element style start and end delta value,
 * @param Number duration effect effective duration.
 */
js.fx.TTF.Swing = function (timestamp, origin, magnitude, duration) {
    var CYCLES = 4;
    var radians = CYCLES * 2 * Math.PI;
    var deltaR = radians / duration;
    var deltaM = magnitude / duration;
    return origin - Math.sin(timestamp * deltaR) * (magnitude - timestamp * deltaM);
};
$extends(js.fx.TTF.Swing, Object);
