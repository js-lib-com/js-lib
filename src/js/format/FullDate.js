$package("js.format");

/**
 * Full date contain year, month, day in the month and day name in full forms, <em>Sunday, March 15, 1964</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct full date format instance.
 */
js.format.FullDate = function () {
    this.$super(js.format.DateFormat.getDateInstance(js.format.DateFormat.FULL));
};
$extends(js.format.FullDate, js.format.AbstractDateTime);
