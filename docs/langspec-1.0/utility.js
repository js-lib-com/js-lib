$package('comp.prj');

/**
 * Utility.
 */
comp.prj.Utility =
{
    /**
     * Initializer.
     */
    init: function() {
    },

    /**
     * Field.
     * @type
     */
    field: 'expression',

    /**
     * Constant.
     */
    CONSTANT: 'expression',

    /**
     * Method.
     */
    method: function() {
    }
};
$init(comp.prj.Utility);

$legacy('expression', function() {
});

comp.prj.Utility.field = null;
comp.prj.Utility.CONSTANT = null; // compiler error
comp.prj.Utility.method(comp.prj.Utility.CONSTANT);
