$package('js.format');

/**
 * Standard date contain year, month and day in numeric format separated by dash, <em>1964-03-15</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct standard date format instance.
 */
js.format.StandardDate = function () {
    this.$super(new js.format.DateFormat("yyyy-MM-dd"));
};
$extends(js.format.StandardDate, js.format.AbstractDateTime);
