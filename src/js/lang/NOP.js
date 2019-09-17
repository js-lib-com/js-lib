$package('js.lang');

/**
 * No operation function. This is not only a fancy name, it allows for reusing of the same no operation anonymous
 * function.
 */
js.lang.NOP = function () {
};
$extends(js.lang.NOP, Object);
