$package("js.format");

/**
 * Full date and full time separated by space, <em>Sunday, March 15, 1964 11:40:00 AM UTC</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct full date and time format instance.
 */
js.format.FullDateTime = function () {
    this.$super(js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.FULL, js.format.DateFormat.FULL));
};
$extends(js.format.FullDateTime, js.format.AbstractDateTime);
