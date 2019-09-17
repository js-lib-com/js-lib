$package("js.format");

/**
 * Short date has year, month and day in numeric format, <em>3/15/64</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct short date format instance.
 */
js.format.ShortDate = function () {
    this.$super(js.format.DateFormat.getDateInstance(js.format.DateFormat.SHORT));
};
$extends(js.format.ShortDate, js.format.AbstractDateTime);
