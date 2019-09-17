$package("js.format");

/**
 * Short time has all hours and minutes but no seconds, <em>11:40 AM</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct short time format instance.
 */
js.format.ShortTime = function() {
    this.$super(js.format.DateFormat.getTimeInstance(js.format.DateFormat.SHORT));
};
$extends(js.format.ShortTime, js.format.AbstractDateTime);
