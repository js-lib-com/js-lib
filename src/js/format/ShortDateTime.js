$package('js.format');

/**
 * Short date and short time separated by space, <em>3/15/64 11:40 AM</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct short date and time format instance.
 */
js.format.ShortDateTime = function() {
    this.$super(js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.SHORT, js.format.DateFormat.SHORT));
};
$extends(js.format.ShortDateTime, js.format.AbstractDateTime);
