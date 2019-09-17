$package('js.tests.lang');

js.tests.lang.TypesUnitTests =
{
    beforeClass: function() {
        this._dataset = [ //
[], // 0: array, object
 [1, 2], // 1: array, object
 new Array(), // 2: array, object
 new Array(2), // 3: array, object
 new Array(1, 2), // 4: array, object
 true, // 5: boolean, primitive
 new Boolean(true), // 6: boolean, object, primitive
 new Boolean(true).valueOf(), // 7: boolean, primitive
 new Boolean('true').valueOf(), // 8:  boolean, primitive
 function() {
        }, // 9: function, object
 new Function('return arguments;'), // 10: function, object
 12.34, // 11: number, primitive
 new Number(12.34), // 12: number, object, primitive
 new Number(12.34).valueOf(), // 13: number, primitive
 Infinity, // 14: number, primitive
 NaN, // 15: number, primitive
         {
            name: 'object'
        }, // 16: object
 new Object(), // 17: object
 'string', // 18: string, primitive
 new String('string'), // 19: string, object, primitive
 new String('string').valueOf(), // 20: string, primitive
 new Date(), // 21: date, object
 null, // 22: null value
 undefined // 23: undefined value
];
    },

    testIsArray: function() {
        this._runTest('isArray', 0, 1, 2, 3, 4);
    },

    testIsBoolean: function() {
        this._runTest('isBoolean', 5, 6, 7, 8);
    },

    testIsDate: function() {
        this._runTest('isDate', 21);
    },

    testIsFunction: function() {
        this._runTest('isFunction', 9, 10);
    },

    testIsNumber: function() {
        this._runTest('isNumber', 11, 12, 13, 14, 15);
    },

    testIsObject: function() {
        this._runTest('isObject', 0, 1, 2, 3, 4, 6, 9, 10, 12, 16, 17, 19, 21);
    },

    testIsPrimitive: function() {
        this._runTest('isPrimitive', 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 20, 21);
    },

    testIsString: function() {
        this._runTest('isString', 18, 19, 20);
    },

    _runTest: function(methodUnderTest) {
        for (var i = 0, j, b; i < this._dataset.length; ++i) {
            b = false;
            for (j = 1; j < arguments.length; ++j) {
                if (i === arguments[j]) {
                    b = true;
                    break;
                }
            }
            window['assert' + (b ? 'True' : 'False')](js.lang.Types[methodUnderTest](this._dataset[i]));
        }
    },

    testIsKindOf: function() {
        assertFalse(js.lang.Types.isElement(js.format.FullDateTime));
        assertTrue(js.lang.Types.isElement(js.dom.Control));
        assertTrue(js.lang.Types.isElement(js.dom.FileInput));
    },

    testIsNodeList: function() {
        var html = '' +
        '<form action="add-form">' +
        '	<input type="text" />' +
        '	<input type="password" />' +
        '	<textarea></textarea>' +
        '	<select>' +
        '		<option>value</option>' +
        '	</select>' +
        '</form>';
        document.getElementById('scratch-area').innerHTML = html;

        var nodeList = document.querySelectorAll('input,textarea,select');
        assertTrue(js.lang.Types.isNodeList(nodeList));
        assertFalse(js.lang.Types.isNodeList(nodeList.item(0)));
        assertFalse(js.lang.Types.isNodeList(nodeList.item(2)));
        assertFalse(js.lang.Types.isNodeList(nodeList.item(3)));

        var n = document.getElementById('scratch-area');
        while (n.firstChild) {
            n.removeChild(n.firstChild);
        }
        this._doc = null;
    }
};
TestCase.register('js.tests.lang.TypesUnitTests');
