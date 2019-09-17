$package("js.format");

/**
 * Medium date and medium time separated by space, <em>Mar 15, 1964 11:40:00 AM</em>.
 * 
 * @author Iulian Rotaru
 * @constructor Construct medium date and time format instance.
 */
js.format.MediumDateTime = function () {
    this.$super(js.format.DateFormat.getDateTimeInstance(js.format.DateFormat.MEDIUM, js.format.DateFormat.MEDIUM));
};
$extends(js.format.MediumDateTime, js.format.AbstractDateTime);
