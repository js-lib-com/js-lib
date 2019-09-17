/**
 * Bootstrap script. Build tool is configured to insert this script on top of all library classes, so is executed first.
 * Takes care to include and initialize library logger, pseudo-operators and main window, via its static initializer.
 * The rest of library is processed considering every class dependencies.
 */

/**
 * Fake $include used by bootstrap script till pseudo-operators load.
 */
$include = function () {
};

/**
 * Include global scripts and classes.
 */
$include("js.lang.Operator");
$include("js.ua.System");
$include("js.ua.Window");

(function () {
    try {
        /**
         * Create browser main window visible into global space.
         */
        WinMain = new js.ua.Window(window);
    } catch (er) {
        js.ua.System.error(er);
    }
})();
