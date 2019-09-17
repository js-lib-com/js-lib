$package("js.format");

/**
 * Medium time has all hours, minutes, seconds but not time zone, <em>11:40:00 AM</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct medium time format instance.
 */
js.format.MediumTime = function () {
    this.$super(js.format.DateFormat.getTimeInstance(js.format.DateFormat.MEDIUM));
};
$extends(js.format.MediumTime, js.format.AbstractDateTime);
