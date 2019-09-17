$package("js.format");

/**
 * Long time has all hours, minutes, seconds and time zone, <em>11:40:00 AM UTC</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct long time format instance.
 */
js.format.LongTime = function () {
    this.$super(js.format.DateFormat.getTimeInstance(js.format.DateFormat.LONG));
};
$extends(js.format.LongTime, js.format.AbstractDateTime);
