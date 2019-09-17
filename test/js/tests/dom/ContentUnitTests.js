$package('js.tests.dom');

js.tests.dom.Content = {
	testConstructor : function() {
		assertClass('js.dom.Content');

		var model = {};
		var content = new js.dom.Content(model);

		assertEquals(model, content._model);
		assertAssertion(js.dom, 'Content');
		assertAssertion(js.dom, 'Content', null);

		$assert.disable();
		content = new js.dom.Content();
		assertDefined(content._model);
		content = new js.dom.Content(null);
		assertDefined(content._model);
	},

	testGetObjectProperty : function() {
		var content = new js.dom.Content({});

		var object = {
			name : 'value',
			nullValue : null,
			undefinedValue : undefined
		};
		var array = [ 12.34, 'value' ];

		assertEquals('value', content._getObjectProperty(object, 'name'));
		assertEquals('value', content._getObjectProperty(array, '1'));
		assertNull(content._getObjectProperty(object, 'nullValue'));
		assertUndefined(content._getObjectProperty(object, 'undefinedValue'));
		assertUndefined(content._getObjectProperty(object, 'fakeName'));

		content.getFakeName = function(_object) {
			assertEquals(object, _object);
			return 'fake-value';
		};
		assertEquals('fake-value', content._getObjectProperty(object, 'fakeName'));

		assertAssertion(content, '_getObjectProperty');
		assertAssertion(content, '_getObjectProperty', object);
		assertAssertion(content, '_getObjectProperty', array);
		assertAssertion(content, '_getObjectProperty', object, true);
		assertAssertion(content, '_getObjectProperty', array, {});
	},

	testGetRelativeValue : function() {
		var content = new js.dom.Content({});

		var context = {
			array : [ 12.34, {
				name : 'value',
				nullValue : null,
				undefinedValue : undefined
			} ]
		};
		assertEquals('value', content._getRelativeValue(context, 'array.1.name'));
		assertNull(content._getRelativeValue(context, 'array.1.nullValue'));
		assertUndefined(content._getRelativeValue(context, 'array.1.undefinedValue'));
		assertUndefined(content._getRelativeValue(context, 'array.0.name'));
		assertUndefined(content._getRelativeValue(context, 'array.1.fakeName'));
		assertUndefined(content._getRelativeValue(context, 'fakeArray.1.name'));

		assertAssertion(content, '_getRelativeValue');
		assertAssertion(content, '_getRelativeValue', null);
		assertAssertion(content, '_getRelativeValue', 12.34);
		assertAssertion(content, '_getRelativeValue', context);
		assertAssertion(content, '_getRelativeValue', context, null);
		assertAssertion(content, '_getRelativeValue', context, 12.34);

		$assert.disable();
		assertUndefined(content._getRelativeValue());
		assertUndefined(content._getRelativeValue(null));
		assertUndefined(content._getRelativeValue(12.34));
		assertUndefined(content._getRelativeValue(context));
		assertUndefined(content._getRelativeValue(context, null));
		assertUndefined(content._getRelativeValue(context, 12.34));
	},

	testGetAbsoluteValue : function() {
		var model = {
			array : [ 12.34, {
				name : 'value',
				nullValue : null,
				undefinedValue : undefined
			} ]
		};
		var content = new js.dom.Content(model);

		assertEquals(model, content._getAbsoluteValue('.'));
		assertEquals('value', content._getAbsoluteValue('.array.1.name'));
		assertNull(content._getAbsoluteValue('.array.1.nullValue'));
		assertUndefined(content._getAbsoluteValue('.array.1.undefinedValue'));
		assertUndefined(content._getAbsoluteValue('.array.0.name'));
		assertUndefined(content._getAbsoluteValue('.array.1.fakeName'));
		assertUndefined(content._getAbsoluteValue('.fakeArray.1.name'));

		assertAssertion(content, '_getAbsoluteValue');
		assertAssertion(content, '_getAbsoluteValue', null);
		assertAssertion(content, '_getAbsoluteValue', 12.34);
		assertAssertion(content, '_getAbsoluteValue', 'array.1.name');

		$assert.disable();
		assertUndefined(content._getAbsoluteValue());
		assertUndefined(content._getAbsoluteValue(null));
		assertUndefined(content._getAbsoluteValue(12.34));
		assertUndefined(content._getAbsoluteValue('array.1.name'));
	},

	testGetValue : function(context) {
		context.push('js.dom.Content.prototype._getRelativeValue');
		context.push('js.dom.Content.prototype._getAbsoluteValue');

		var model = {};
		var object = {};
		var propertyPath = 'opp';

		js.dom.Content.prototype._getRelativeValue = function(_object, _propertyPath) {
			assertEquals(object, _object);
			assertEquals(propertyPath, _propertyPath);
			return 'relative-value';
		};
		js.dom.Content.prototype._getAbsoluteValue = function(_propertyPath) {
			assertEquals(propertyPath, _propertyPath);
			return 'absolute-value';
		};

		var content = new js.dom.Content(model);
		assertEquals('relative-value', content.getValue(object, propertyPath));
		assertEquals('absolute-value', content.getValue(propertyPath));
		assertAssertion(content, 'getValue');
		$assert.disable();
		assertAssertion(content, 'getValue');
	}
};
TestCase.register('js.tests.dom.Content');
