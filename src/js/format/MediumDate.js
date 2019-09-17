$package("js.format");

/**
 * Medium date has year, short month name and day in the month, <em>Mar 15, 1964</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct medium date format instance.
 */
js.format.MediumDate = function () {
    this.$super(js.format.DateFormat.getDateInstance(js.format.DateFormat.MEDIUM));
};
$extends(js.format.MediumDate, js.format.AbstractDateTime);
