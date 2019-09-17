$package('js.format');

/**
 * Standard date and standard time separated by space, <em>1964-03-15 11:40:00</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct standard date and time format instance.
 */
js.format.StandardDateTime = function() {
    this.$super(new js.format.DateFormat("yyyy-MM-dd HH:mm:ss"));
};
$extends(js.format.StandardDateTime, js.format.AbstractDateTime);
