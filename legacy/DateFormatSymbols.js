$package('js.format');

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
        fullDate : "EEEE, MMMM dd, yyyy",
        fullTime : "hh:mm:ss a Z",
        longDate : "MMMM dd, yyyy",
        longTime : "hh:mm:ss a Z",
        mediumDate : "MMM dd, yyyy",
        mediumTime : "hh:mm:ss a",
        shortDate : "M/d/yy",
        shortTime : "hh:mm a"
    },

    fullMonths : [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths : [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
    fullWeekDays : [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortWeekDays : [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    tinyWeekDays : [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
};
