$package('js.format');

/**
 * Standard time contains hours in 24 format, minutes and seconds separated by colon, <em>11:40:00</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct standard time format instance.
 */
js.format.StandardTime = function () {
    this.$super(new js.format.DateFormat("HH:mm:ss"));
};
$extends(js.format.StandardTime, js.format.AbstractDateTime);
