$package("js.format");

/**
 * Encapsulate regional sensitive date-time formatting data.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct symbols instance.
 */
js.format.DateFormatSymbols = function () {
    return js.format.DateFormatSymbols._symbols;
};
$extends(js.format.DateFormatSymbols, Object);

js.format.DateFormatSymbols._symbols = {
    patterns : {
        fullDate : "@string/full-date",
        fullTime : "@string/full-time",
        longDate : "@string/long-date",
        longTime : "@string/long-time",
        mediumDate : "@string/medium-date",
        mediumTime : "@string/medium-time",
        shortDate : "@string/short-date",
        shortTime : "@string/short-time"
    },

    fullMonths : [ "@string/full-jan", "@string/full-feb", "@string/full-mar", "@string/full-apr", "@string/full-may", "@string/full-jun", "@string/full-jul", "@string/full-aug", "@string/full-sep", "@string/full-oct", "@string/full-nov", "@string/full-dec" ],
    shortMonths : [ "@string/short-jan", "@string/short-feb", "@string/short-mar", "@string/short-apr", "@string/short-may", "@string/short-jun", "@string/short-jul", "@string/short-aug", "@string/short-sep", "@string/short-oct", "@string/short-nov", "@string/short-dec" ],
    fullWeekDays : [ "@string/full-su", "@string/full-mo", "@string/full-tu", "@string/full-we", "@string/full-th", "@string/full-fr", "@string/full-sa" ],
    shortWeekDays : [ "@string/short-su", "@string/short-mo", "@string/short-tu", "@string/short-we", "@string/short-th", "@string/short-fr", "@string/short-sa" ],
    tinyWeekDays : [ "@string/tiny-su", "@string/tiny-mo", "@string/tiny-tu", "@string/tiny-we", "@string/tiny-th", "@string/tiny-fr", "@string/tiny-sa" ]
};
