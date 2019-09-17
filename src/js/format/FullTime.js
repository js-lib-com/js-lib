$package("js.format");

/**
 * Full time has all hours, minutes, seconds and time zone, <em>11:40:00 AM UTC</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct full time format instance.
 */
js.format.FullTime = function() {
    this.$super(js.format.DateFormat.getTimeInstance(js.format.DateFormat.FULL));
};
$extends(js.format.FullTime, js.format.AbstractDateTime);
