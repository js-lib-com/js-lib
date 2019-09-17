$package('js.fx');

/**
 * Animation global properties.
 */
js.fx.Config = {
    /**
     * Styles with values measured in pixels. Used by engine to add units to style value, if necessary.
     * 
     * @type RexExp
     */
    PX_UNITS : /width|height|top|bottom|left|right|margin|marginTop|marginRight|marginBottom|marginLeft|padding|paddingTop|paddingRight|paddingBottom|paddingLeft/i,

    /**
     * Default effect duration. Used whenever animation duration is not explicitly configured.
     * 
     * @type Number
     */
    DEF_DURATION : 1000
};
