$package("js.ua");

/**
 * Layout engine. Note that while j(s)-lib recognizes browsers implementations differences as a natural process it
 * doesn't support backward compatibility, that is, always bases on the latest versions. Web related specs are highly
 * dynamic, almost fluid and it is strongly recommended to keep browser updated for new features and security patches.
 */
js.ua.Engine = {
    /**
     * Firefox browser layout engine.
     * 
     * @type Boolean
     */
    GECKO : false,

    /**
     * Opera browser layout engine.
     * 
     * @type Boolean
     */
    PRESTO : false,

    /**
     * Internet explorer browser layout engine.
     * 
     * @type Boolean
     */
    TRIDENT : false,

    /**
     * Safari and Chrome browsers layout engine.
     * 
     * @type Boolean
     */
    WEBKIT : false,

    /**
     * Mobile devices WebKit layout engine.
     * 
     * @type Boolean
     */
    MOBILE_WEBKIT : false,

    /**
     * Browser specific CSS class used to select browser specific styles. It is added on document body allowing for
     * rules like:
     * 
     * <pre>
     *  body.trident selector {
     *      // internet explorer specific styles 
     *  }
     * </pre>
     * 
     * Recognized styles are listed below: <table>
     * <tr>
     * <td>Internet Explorer
     * <td> :
     * <td><b>trident
     * <tr>
     * <td>Chrome and Safari
     * <td> :
     * <td><b>webkit
     * <tr>
     * <td>Android Chrome
     * <td> :
     * <td><b>mobile-webkit
     * <tr>
     * <td>Mozilla Firefox
     * <td> :
     * <td><b>gecko
     * <tr>
     * <td>Opera
     * <td> :
     * <td><b>presto </table>
     * 
     * @type String
     */
    cssClass : null
};

/**
 * Engine enumeration static initializer. Detect user agent and initialize {@link js.ua.Engine} enumeration. Executes it
 * synchronously since library relies on engine enumeration to select legacy code branches. Please remember that a
 * synchronous static initializer is executed at script load not after DOM ready.
 */
$static(function () {
    // user agent samples:
    // Internet Explorer: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; EmbeddedWB 14.52 from:
    // http://www.bsalsa.com/ EmbeddedWB 14.52; .NET CLR 1.1.4322; .NET CLR 2.0.50727)
    // Chrome: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/0.3.154.9
    // Safari/525.19
    // Safari: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Version/3.1.2
    // Safari/525.21
    // Firefox: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.17) Gecko/20080829 Firefox/2.0.0.17
    // Opera: Opera/9.62 (Windows NT 5.1; U; en) Presto/2.1.1

    // layout engines tests order matters; do not alter it! especially WebKit MUST precede Gecko
    if (navigator.userAgent.indexOf("MSIE") !== -1 || navigator.userAgent.indexOf("Trident") !== -1) { // IE
        js.ua.Engine.TRIDENT = true;
        js.ua.Engine.cssClass = "trident";
    }
    else if (navigator.userAgent.indexOf("WebKit") !== -1) {
        if (navigator.userAgent.indexOf("Mobile") !== -1 || navigator.userAgent.indexOf("Android") !== -1) {
            js.ua.Engine.MOBILE_WEBKIT = true; // mobile devices
            js.ua.Engine.cssClass = "mobile-webkit";
        }
        else {
            js.ua.Engine.WEBKIT = true; // Safari, Chrome
            js.ua.Engine.cssClass = "webkit";
        }
    }
    else if (navigator.userAgent.indexOf("Gecko") !== -1) { // Firefox
        js.ua.Engine.GECKO = true;
        js.ua.Engine.cssClass = "gecko";
    }
    else if (navigator.userAgent.indexOf("Presto") !== -1) { // Opera
        js.ua.Engine.PRESTO = true;
        js.ua.Engine.cssClass = "presto";
    }
}, true);
