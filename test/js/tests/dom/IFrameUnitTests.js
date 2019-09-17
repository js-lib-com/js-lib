$package('js.tests.dom');

$include('js.dom.IFrame');

js.tests.dom.IFrame = {
	testConstructor : function() {
		assertClass('js.dom.IFrame');
	},

	testAssign : function() {
		return false;
	},

	testReload : function() {
		return false;
	},

	testGetDoc : function() {
		return false;
	},

	testGetLocation : function() {
		return false;
	}
};
TestCase.register('js.tests.dom.IFrame');
