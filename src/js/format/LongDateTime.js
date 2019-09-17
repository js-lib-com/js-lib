$package("js.format");

/**
 * Long date and long time separated by space, <em>March 15, 1964 11:40:00 AM UTC</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct long date and time format instance.
 */
js.format.LongDateTime = function () {
    this.$super(js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.LONG, js.format.DateFormat.LONG));
};
$extends(js.format.LongDateTime, js.format.AbstractDateTime);
