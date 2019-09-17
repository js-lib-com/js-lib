$package('js.tests.util');

js.tests.util.StringsUnitTests = {
	testTrim : function() {
		var whitespaces = [ ' ', '  ', '\t', '\r', '\n', '\r\n', '\f', ' \t\r\n\f' ];
		for ( var i = 0; i < whitespaces.length; ++i) {
			assertEquals('string', js.util.Strings.trim(whitespaces[i] + 'string'));
			assertEquals('string', js.util.Strings.trim('string' + whitespaces[i]));
			assertEquals('string', js.util.Strings.trim(whitespaces[i] + 'string' + whitespaces[i]));
		}
		assertAssertion(js.util.Strings, 'trim');
		assertAssertion(js.util.Strings, 'trim', null);
		assertAssertion(js.util.Strings, 'trim', '');
	},

	testEscapeRegExp : function() {
		assertEquals('\\/\\.\\*\\?\\|\\(\\)\\[\\]\\{\\}\\\\\\^\\$', js.util.Strings.escapeRegExp('/.*?|()[]{}\\^$'));

		assertAssertion(js.util.Strings, 'escapeRegExp');
		assertAssertion(js.util.Strings, 'escapeRegExp', null);
		assertAssertion(js.util.Strings, 'escapeRegExp', '');
	},

	testEqualsIgnoreCase : function() {
		assertTrue(js.util.Strings.equalsIgnoreCase('abcdefghijklmnoprstuvxz', 'ABCDEFGHIJKLMNOPRSTUVXZ'));
		assertTrue(js.util.Strings.equalsIgnoreCase('αβψδεφγηιξκλμνοπρστθωχζ', 'ΑΒΨΔΕΦΓΗΙΞΚΛΜΝΟΠΡΣΤΘΩΧΖ'));
		assertTrue(js.util.Strings.equalsIgnoreCase('ăîâşţ', 'ĂÎÂŞŢ'));

		assertTrue(js.util.Strings.equalsIgnoreCase('', ''));
		assertTrue(js.util.Strings.equalsIgnoreCase(null, null));
		assertFalse(js.util.Strings.equalsIgnoreCase(null, ''));
		assertFalse(js.util.Strings.equalsIgnoreCase('', null));

		assertAssertion(js.util.Strings, 'equalsIgnoreCase');
		assertAssertion(js.util.Strings, 'equalsIgnoreCase', 'reference');
		assertAssertion(js.util.Strings, 'equalsIgnoreCase', undefined, 'target');

		assertTrue(js.util.Strings.equalsIgnoreCase('multipart/form-data', 'MULTIPART/FORM-DATA'));
	},

	testStartsWith : function() {
		assertTrue(js.util.Strings.startsWith('abcdefghijklmnoprstuvxz', 'abc'));
		assertTrue(js.util.Strings.startsWith('abcdefghijklmnoprstuvxz', 'abcdefghijklmnoprstuvxz'));
		assertTrue(js.util.Strings.startsWith('αβψδεφγηιξκλμνοπρστθωχζ', 'αβψ'));
		assertTrue(js.util.Strings.startsWith('ĂÎÂŞŢ', 'ĂÎ'));
		assertTrue(js.util.Strings.startsWith('ăîâşţ', 'ăîâşţ'));

		assertFalse(js.util.Strings.startsWith('abcdefghijklmnoprstuvxz', 'ABC'));
		assertFalse(js.util.Strings.startsWith('ABC', 'ABCD'));
	},

	testEndsWith : function() {
		assertTrue(js.util.Strings.endsWith('abcdefghijklmnoprstuvxz', 'vxz'));
		assertTrue(js.util.Strings.endsWith('abcdefghijklmnoprstuvxz', 'abcdefghijklmnoprstuvxz'));
		assertTrue(js.util.Strings.endsWith('αβψδεφγηιξκλμνοπρστθωχζ', 'ωχζ'));
		assertTrue(js.util.Strings.endsWith('ĂÎÂŞŢ', 'ŞŢ'));
		assertTrue(js.util.Strings.endsWith('ăîâşţ', 'ăîâşţ'));

		assertFalse(js.util.Strings.endsWith('abcdefghijklmnoprstuvxz', 'VXZ'));
		assertFalse(js.util.Strings.endsWith('ABC', 'ABCD'));
	},

	testContains : function() {
		assertTrue(js.util.Strings.contains('abcdefghijklmnopqrstuvxz', 'ghij'));
		assertFalse(js.util.Strings.contains('abcdefghijklmnopqrstuvxz', 'GHIJ'));

		assertAssertion(js.util.Strings, 'contains');
		assertAssertion(js.util.Strings, 'contains', null);
		assertAssertion(js.util.Strings, 'contains', '');
		assertAssertion(js.util.Strings, 'contains', 'abcd');
		assertAssertion(js.util.Strings, 'contains', 'abcd', null);
		assertAssertion(js.util.Strings, 'contains', 'abcd', '');
	},

	testToTitleCase : function() {
		assertEquals('Titlecase', js.util.Strings.toTitleCase('titlecase'));
		assertEquals('Titlecase', js.util.Strings.toTitleCase('TITLECASE'));
		assertEquals('Titlecase', js.util.Strings.toTitleCase('TitleCase'));

		assertAssertion(js.util.Strings, 'toTitleCase');
		assertAssertion(js.util.Strings, 'toTitleCase', null);
		assertAssertion(js.util.Strings, 'toTitleCase', '');

		$assert.disable();
		assertEmpty(js.util.Strings.toTitleCase());
		assertEmpty(js.util.Strings.toTitleCase(null));
		assertEmpty(js.util.Strings.toTitleCase(''));
	},

	testToHyphenCase : function() {
		assertEquals('to-title-case', js.util.Strings.toHyphenCase('toTitleCase'));
		assertEquals('to-title-case', js.util.Strings.toHyphenCase('ToTitleCase'));
		assertEquals('to-title-case', js.util.Strings.toHyphenCase('to-title-case'));
		assertEquals('to--title--case', js.util.Strings.toHyphenCase('To-Title-Case'));
		assertEquals('totitlecase', js.util.Strings.toHyphenCase('totitlecase'));

		assertAssertion(js.util.Strings, 'toHyphenCase');
		assertAssertion(js.util.Strings, 'toHyphenCase', null);
		assertAssertion(js.util.Strings, 'toHyphenCase', '');

		$assert.disable();
		assertEmpty(js.util.Strings.toHyphenCase());
		assertEmpty(js.util.Strings.toHyphenCase(null));
		assertEmpty(js.util.Strings.toHyphenCase(''));
	},

	testToScriptCase : function() {
		assertEquals('backgroundColor', js.util.Strings.toScriptCase('background-color'));
		assertEquals('fontSize', js.util.Strings.toScriptCase('font-size'));
		if (js.ua.Engine.TRIDENT) {
			assertEquals('styleFloat', js.util.Strings.toScriptCase('float'));
		}
		else {
			assertEquals('cssFloat', js.util.Strings.toScriptCase('float'));
		}

		assertAssertion(js.util.Strings, 'toScriptCase');
		assertAssertion(js.util.Strings, 'toScriptCase', null);
		assertAssertion(js.util.Strings, 'toScriptCase', '');

		$assert.disable();
		assertEmpty(js.util.Strings.toScriptCase());
		assertEmpty(js.util.Strings.toScriptCase(null));
		assertEmpty(js.util.Strings.toScriptCase(''));
	},

	testCharsCount : function() {
		assertEquals(2, js.util.Strings.charsCount('abcdAbCD', 'b'));
		assertEquals(0, js.util.Strings.charsCount('abcdAbCD', 'B'));

		assertAssertion(js.util.Strings, 'charsCount');
		assertAssertion(js.util.Strings, 'charsCount', null);
		assertAssertion(js.util.Strings, 'charsCount', '');

		$assert.disable();
		assertZero(js.util.Strings.charsCount());
		assertZero(js.util.Strings.charsCount(null));
		assertZero(js.util.Strings.charsCount(''));
	},

	testNameValuesParser : function() {
		[ "title:description;", "title:description" ].forEach(function(expression) {
			items = js.util.Strings.parseNameValues(expression);
			assertEquals(1, items.length);
			assertEquals("title", items[0].name);
			assertEquals("description", items[0].value);
		});

		[ "title:description;id:1234;", "title:description;id:1234" ].forEach(function(expression) {
			items = js.util.Strings.parseNameValues(expression);
			assertEquals(2, items.length);
			assertEquals("title", items[0].name);
			assertEquals("description", items[0].value);
			assertEquals("id", items[1].name);
			assertEquals("1234", items[1].value);
		});
	},

	testToString : function() {
		return 'js.util.Strings';
	}
};
TestCase.register('js.tests.util.StringsUnitTests');
