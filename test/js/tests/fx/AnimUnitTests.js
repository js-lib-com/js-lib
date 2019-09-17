$package('js.fx.test');

js.fx.test.AnimUnitTests = {
	testAnimConstructor : function() {
		var anim = new js.fx.Anim();
		TestCase.fail();
	}
};
TestCase.register('js.fx.test.AnimUnitTests');
