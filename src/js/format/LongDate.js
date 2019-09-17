$package("js.format");

/**
 * Long date has year, month, day in the month but not day name, <em>March 15, 1964</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct long date format instance.
 */
js.format.LongDate = function() {
    this.$super(js.format.DateFormat.getDateInstance(js.format.DateFormat.LONG));
};
$extends(js.format.LongDate, js.format.AbstractDateTime);
