$package('comp.prj');

/**
 * Class.
 * @constructor
 * Constructor.
 */
comp.prj.Class = function() {
    /**
     * Instance field.
     * @type
     * @public
     */
    this.field = 'expression';

    /**
     * Instance constant.
     * @public
     */
    this.CONSTANT = 'expression';

    /**
     * Instance method.
     * @public
     */
    this.method = function() {
    };
};

/**
 * Class field.
 * @type
 * @public
 */
comp.prj.Class.field = 'expression';

/**
 * Class constant.
 * @public
 */
comp.prj.Class.CONSTANT = 'expression';

/**
 * Class method.
 * @public
 */
comp.prj.Class.method = function() {
};

comp.prj.Class.prototype =
{
    /**
     * Field.
     * @type
     * @public
     */
    field: 'expression',

    /**
     * Constant.
     * @public
     */
    CONSTANT: 'expression',

    /**
     * Method.
     * @public
     */
    method: function() {
    }
};
$extends(comp.prj.Class, js.lang.Object);

$legacy('expression', function() {
});

comp.prj.Class.field = null;
comp.prj.Class.CONSTANT = null;
comp.prj.Class.method();

instance = new comp.prj.Class();
instance.field = null;
instance.CONSTANT = null;
instance.method();

