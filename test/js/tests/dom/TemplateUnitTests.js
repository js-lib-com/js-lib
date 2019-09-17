$package('js.tests.dom');

$include('js.dom.Image');
$include('js.dom.Anchor');
$include('js.dom.Checkbox');
$include('js.dom.Radio');

js.tests.dom.TemplateUnitTests = {
	setup : function(html) {
		document.getElementById('scratch-area').innerHTML = html;
		this._doc = new js.dom.Document(document);
		this._body = this._doc.getByTag('body');
		this._root = this._doc.getById('scratch-area');
	},

	after : function() {
		var n = document.getElementById('scratch-area');
		while (n.firstChild) {
			n.removeChild(n.firstChild);
		}
	},

	testFlatObject : function() {
		var html = '' + //
		'<div data-object="." data-id="id">' + //
		'	<h1 data-value="title"></h1>' + //
		'	<img data-src="picture" data-title="title" />' + //
		'</div>';
		this.setup(html);

		var value = {
			id : 1964,
			title : 'title',
			picture : 'picture.png'
		};
		var el = this._inject(value);

		assertEquals('1964', el.getFirstChild().getAttr('id'));
		assertEquals('title', el.getByTag('h1').getText());
		assertEquals('picture.png', el.getByTag('img').getAttr('src'));
		assertEquals('title', el.getByTag('img').getAttr('title'));
	},

	testNestedObjects : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<h1 data-value="title"></h1>' + //
		'	<div data-object="nested">' + //
		'   	<h2 data-value="title"></h2>' + //
		'    	<div data-object="object">' + //
		'       	<h3 data-value="title"></h3>' + //
		'       	<img data-src="picture" data-title="title" />' + // 
		'    	</div>' + //
		'    </div>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'title1',
			nested : {
				title : 'title2',
				object : {
					title : 'title3',
					picture : 'picture.png'
				}
			}
		};
		var el = this._inject(value);

		assertEquals('title1', el.getByTag('h1').getText());
		assertEquals('title2', el.getByTag('h2').getText());
		assertEquals('title3', el.getByTag('h3').getText());
		assertEquals('picture.png', el.getByTag('img').getAttr('src'));
	},

	testSubObject : function() {
		var html = '' + //
		'<div id="car" data-object=".">' + //
		'	<h1 data-value="model"></h1>' + //
		'	<div id="engine" data-object="engine" data-title="model">' + //
		'		<h2 data-value="model"></h2>' + //
		'		<h3 data-value="capacity"></h3>' + //
		'	</div>' + //
		'</div>';
		this.setup(html);

		var car = {
			model : 'Opel Corsa',
			engine : {
				model : 'ECO',
				capacity : 1.6
			}
		};

		function reset(root) {
			root.getByCss('div[id="engine"]').removeAttr('title');
			root.getByTag('h1').removeText();
			root.getByTag('h2').removeText();
			root.getByTag('h3').removeText();
		}

		function assert(root, full) {
			assertEquals(full ? 'Opel Corsa' : '', root.getByTag('h1').getText());
			assertEquals('ECO', root.getByCss('div[id="engine"]').getAttr('title'));
			assertEquals('ECO', root.getByTag('h2').getText());
			assertEquals('1.6', root.getByTag('h3').getText());
		}

		var tp = new js.dom.Template(this._doc);
		tp.inject(this._root, car);
		assert(this._root, true);

		var carEl = this._doc.getById('car');
		tp = new js.dom.Template(this._doc);
		reset(this._root);
		tp.inject(carEl, car);
		assert(this._root, true);

		var engineEl = this._doc.getById('engine');
		tp = new js.dom.Template(this._doc);
		reset(this._root);
		tp.inject(engineEl, car);
		assert(this._root);

		tp = new js.dom.Template(this._doc);
		reset(this._root);
		tp.inject(engineEl, car.engine, true);
		assert(this._root);
	},

	testListOfObjects : function() {
		var html = '' + //
		'<ul data-list="items">' + //
		'    <li>' + //
		'        <h2 data-value="title"></h2>' + //
		'        <img data-src="picture" data-title="title" />' + //
		'    </li>' + //
		'</ul>';
		this.setup(html);

		var value = {
			items : [ {
				title : 'title1',
				picture : 'picture1.png'
			}, {
				title : 'title2',
				picture : 'picture2.png'
			} ]
		};
		var el = this._inject(value);

		assertEquals('title1', el.findByTag('h2').item(0).getText());
		assertEquals('picture1.png', el.findByTag('img').item(0).getAttr('src'));
		assertEquals('title1', el.findByTag('img').item(0).getAttr('title'));
		assertEquals('title2', el.findByTag('h2').item(1).getText());
		assertEquals('picture2.png', el.findByTag('img').item(1).getAttr('src'));
		assertEquals('title2', el.findByTag('img').item(1).getAttr('title'));
	},

	testAnonymousList : function() {
		var html = '' + //
		'<ul data-list=".">' + //
		'    <li data-object=".">' + //
		'        <h2 data-value="title"></h2>' + //
		'        <img data-src="picture" data-title="title" />' + //
		'    </li>' + //
		'</ul>';
		this.setup(html);

		var value = [ {
			title : 'title1',
			picture : 'picture1.png'
		}, {
			title : 'title2',
			picture : 'picture2.png'
		} ];
		var el = this._inject(value);

		assertEquals('title1', el.findByTag('h2').item(0).getText());
		assertEquals('picture1.png', el.findByTag('img').item(0).getAttr('src'));
		assertEquals('title1', el.findByTag('img').item(0).getAttr('title'));
		assertEquals('title2', el.findByTag('h2').item(1).getText());
		assertEquals('picture2.png', el.findByTag('img').item(1).getAttr('src'));
		assertEquals('title2', el.findByTag('img').item(1).getAttr('title'));
	},

	testListOfPrimitives : function() {
		var html = '' + //
		'<ul data-list="items">' + //
		'    <li data-value=".">' + //
		'    </li>' + //
		'</ul>';
		this.setup(html);

		var value = {
			items : [ 1964, true, 'John Doe' ]
		};
		var el = this._inject(value);

		el = el.getByTag('ul');
		var elist = el.getChildren();
		assertEquals('1964', js.util.Strings.trim(elist.item(0).getText()));
		assertEquals('true', js.util.Strings.trim(elist.item(1).getText()));
		assertEquals('John Doe', js.util.Strings.trim(elist.item(2).getText()));
	},

	testListOfImages : function() {
		var html = '' + //
		'<div data-list=".">' + //
		'    <img data-src="." />' + //
		'</div>';
		this.setup(html);

		var values = [ 'picture1.png', 'picture2.png' ];
		var el = this._inject(values);

		assertEquals('picture1.png', el.findByTag('img').item(0).getAttr('src'));
		assertEmpty(el.findByTag('img').item(0).getText());
		assertEquals('picture2.png', el.findByTag('img').item(1).getAttr('src'));
		assertEmpty(el.findByTag('img').item(1).getText());
	},

	testListOfMaps : function() {
		var html = '' + //
		'<ul data-list="items">' + //
		'    <li>' + //
		'        <dl data-map=".">' + //
		'            <dt data-value=".">' + //
		'            </dt>' + //
		'            <dd data-object=".">' + //
		'                <h2 data-value="title"></h2>' + //
		'                <img data-src="picture" data-title="title" />' + //
		'            </dd>' + //
		'        </dl>' + //
		'    </li>' + //
		'</ul>';
		this.setup(html);

		var value = {
			items : [ {
				key0 : {
					title : 'title0',
					picture : 'picture0.png'
				},
				key1 : {
					title : 'title1',
					picture : 'picture1.png'
				}
			}, {
				key2 : {
					title : 'title2',
					picture : 'picture2.png'
				},
				key3 : {
					title : 'title3',
					picture : 'picture3.png'
				}
			} ]
		};
		var el = this._inject(value), dt, dd;

		for ( var i = 0; i < 4; ++i) {
			dt = this._getKeyElement(el, 'dt', $format('key%d', i));
			assertNotNull(dt);
			dd = dt.getNextSibling();
			assertNotNull(dd);
			assertEquals($format('title%d', i), dd.getByTag('h2').getText());
			assertEquals($format('picture%d.png', i), dd.getByTag('img').getAttr('src'));
			assertEquals($format('title%d', i), dd.getByTag('img').getAttr('title'));
		}
	},

	testNestedLists : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'<h1 data-value="title"></h1>' + //
		'<table>' + //
		'    <tbody data-list="list">' + //
		'        <tr>' + //
		'            <td>' + //
		'                <h2 data-value="title"></h2>' + //
		'                <ul data-list="list">' + //
		'                    <li>' + //
		'                        <h3 data-value="title"></h3>' + //
		'                        <img data-src="picture" data-title="title" />' + //
		'                    </li>' + //
		'                </ul>' + //
		'            </td>' + //
		'        </tr>' + //
		'    </tbody>' + //
		'</table>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'title',
			list : [ {
				title : 'title0',
				list : [ {
					title : 'title00',
					picture : 'picture00.png'
				}, {
					title : 'title01',
					picture : 'picture01.png'
				} ]
			}, {
				title : 'title1',
				list : [ {
					title : 'title10',
					picture : 'picture10.png'
				}, {
					title : 'title11',
					picture : 'picture11.png'
				} ]
			} ]
		};
		var el = this._inject(value);

		assertEquals('title', el.getByTag('h1').getText());
		assertEquals('title0', el.findByTag('h2').item(0).getText());
		assertEquals('title1', el.findByTag('h2').item(1).getText());
		assertEquals('title00', el.findByTag('h3').item(0).getText());
		assertEquals('title01', el.findByTag('h3').item(1).getText());
		assertEquals('title10', el.findByTag('h3').item(2).getText());
		assertEquals('title11', el.findByTag('h3').item(3).getText());
		assertEquals('picture00.png', el.findByTag('img').item(0).getAttr('src'));
		assertEquals('title00', el.findByTag('img').item(0).getAttr('title'));
		assertEquals('picture01.png', el.findByTag('img').item(1).getAttr('src'));
		assertEquals('title01', el.findByTag('img').item(1).getAttr('title'));
		assertEquals('picture10.png', el.findByTag('img').item(2).getAttr('src'));
		assertEquals('title10', el.findByTag('img').item(2).getAttr('title'));
		assertEquals('picture11.png', el.findByTag('img').item(3).getAttr('src'));
		assertEquals('title11', el.findByTag('img').item(3).getAttr('title'));
	},

	testMapOfObjects : function() {
		var html = '' + //
		'<dl data-map="map">' + //
		'    <dt data-value=".">' + //
		'    </dt>' + //
		'    <dd data-object=".">' + //
		'        <h2 data-value="title"></h2>' + //
		'        <img data-src="picture" data-title="title" />' + //
		'    </dd>' + //
		'</dl>';
		this.setup(html);

		var value = {
			map : {
				'key0' : {
					title : 'title0',
					picture : 'picture0.png'
				},
				'key1' : {
					title : 'title1',
					picture : 'picture1.png'
				}
			}
		};
		var el = this._inject(value), dt, dd;

		for ( var i = 0; i < 2; ++i) {
			dt = this._getKeyElement(el, 'dt', $format('key%d', i));
			assertNotNull(dt);
			dd = dt.getNextSibling();
			assertNotNull(dd);
			assertEquals($format('title%d', i), dd.getByTag('h2').getText());
			assertEquals($format('picture%d.png', i), dd.getByTag('img').getAttr('src'));
			assertEquals($format('title%d', i), dd.getByTag('img').getAttr('title'));
		}
	},

	testAnonymousMap : function() {
		var html = '' + //
		'<dl data-map=".">' + //
		'    <dt data-value=".">' + //
		'    </dt>' + //
		'    <dd data-object=".">' + //
		'        <h2 data-value="title"></h2>' + //
		'        <img data-src="picture" data-title="title" />' + //
		'    </dd>' + //
		'</dl>';
		this.setup(html);

		var value = {
			'key0' : {
				title : 'title0',
				picture : 'picture0.png'
			},
			'key1' : {
				title : 'title1',
				picture : 'picture1.png'
			}
		};
		var el = this._inject(value);

		for ( var i = 0; i < 2; ++i) {
			dt = this._getKeyElement(el, 'dt', $format('key%d', i));
			assertNotNull(dt);
			dd = dt.getNextSibling();
			assertNotNull(dd);
			assertEquals($format('title%d', i), dd.getByTag('h2').getText());
			assertEquals($format('picture%d.png', i), dd.getByTag('img').getAttr('src'));
			assertEquals($format('title%d', i), dd.getByTag('img').getAttr('title'));
		}
	},

	testMapOfPrimitives : function() {
		var html = '' + //
		'<dl data-map="map">' + //
		'    <dt data-value=".">' + //
		'    </dt>' + //
		'    <dd data-value=".">' + //
		'    </dd>' + //
		'</dl>';
		this.setup(html);

		var value = {
			map : {
				'number' : 1964,
				'boolean' : true,
				'string' : 'John Doe'
			}
		};
		var el = this._inject(value), dt;

		for ( var key in value.map) {
			dt = this._getKeyElement(el, 'dt', key);
			assertNotNull(dt);
			assertEquals(value.map[key].toString(), dt.getNextSibling().getText());
		}
	},

	testMapOfLists : function() {
		var html = '' + //
		'<dl data-map="map">' + //
		'    <dt data-value=".">' + //
		'    </dt>' + //
		'    <dd>' + //
		'        <ul data-list=".">' + //
		'            <li data-object=".">' + //
		'                <h2 data-value="title"></h2>' + //
		'                <img data-src="picture" data-title="title" />' + //
		'            </li>' + //
		'        </ul>' + //
		'    </dd>' + //
		'</dl>';
		this.setup(html);

		var value = {
			map : {
				'key0' : [ {
					title : 'title00',
					picture : 'picture00.png'
				}, {
					title : 'title01',
					picture : 'picture01.png'
				} ],

				'key1' : [ {
					title : 'title10',
					picture : 'picture10.png'
				}, {
					title : 'title11',
					picture : 'picture11.png'
				} ]
			}
		};
		var el = this._inject(value), dt, dd, lis;

		for ( var i = 0, j; i < 2; ++i) {
			dt = this._getKeyElement(el, 'dt', $format('key%d', i));
			assertNotNull(dt);
			dd = dt.getNextSibling();
			assertNotNull(dd);
			lis = dd.findByTag('li');
			for (j = 0; j < 2; ++j) {
				assertEquals('title' + i + j, lis.item(j).getByTag('h2').getText());
				assertEquals('picture' + i + j + '.png', lis.item(j).getByTag('img').getAttr('src'));
				assertEquals('title' + i + j, lis.item(j).getByTag('img').getAttr('title'));
			}
		}

	},

	testNestedMaps : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<h1 data-value="title"></h1>' + //
		'	<dl data-map="map">' + //
		'   	<dt data-value=".">' + //
		'   	</dt>' + //
		'   	<dd data-object=".">' + //
		'       	<h2 data-value="title"></h2>' + //
		'       	<div data-map="map">' + //
		'           	<p data-value=".">' + //
		'            	</p>' + // 
		'            	<div data-object=".">' + //
		'               	<h3 data-value="title"></h3>' + //
		'               	<img data-src="picture" data-title="title" />' + //
		'            	</div>' + //
		'        	</div>' + //
		'    	</dd>' + //
		'	</dl>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'title',
			map : {
				'key0' : {
					title : 'title0',
					map : {
						'key00' : {
							title : 'title00',
							picture : 'picture00.png'
						},
						'key01' : {
							title : 'title01',
							picture : 'picture01.png'
						}
					}
				},
				'key1' : {
					title : 'title1',
					map : {
						'key10' : {
							title : 'title10',
							picture : 'picture10.png'
						},
						'key11' : {
							title : 'title11',
							picture : 'picture11.png'
						}
					}
				}
			}
		};
		var el = this._inject(value), dt, dd, p, div;

		assertEquals('title', el.getByTag('h1').getText());
		for ( var i = 0, j; i < 2; ++i) {
			dt = this._getKeyElement(el, 'dt', 'key' + i);
			assertNotNull(dt);
			dd = dt.getNextSibling();
			assertNotNull(dd);
			assertEquals('title' + i, dd.getByTag('h2').getText());
			for (j = 0; j < 2; ++j) {
				p = this._getKeyElement(dd, 'p', 'key' + i + j);
				assertNotNull(p);
				div = p.getNextSibling();
				assertEquals('title' + i + j, div.getByTag('h3').getText());
				assertEquals('picture' + i + j + '.png', div.getByTag('img').getAttr('src'));
				assertEquals('title' + i + j, div.getByTag('img').getAttr('title'));
			}
		}
	},

	testComplexGraph : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<h1 data-value="title"></h1>' + //
		'	<div data-object="nested">' + //
		'   	<h2 data-value="title"></h2>' + //
		'   	<ul data-list="list">' + //
		'       	<li data-object=".">' + //
		'           	<h3 data-value="title"></h3>' + //
		'           	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'        	</li>' + //
		'    	</ul>' + //
		'    	<dl data-map="map">' + //
		'        	<dt data-value=".">' + //
		'        	</dt>' + //
		'        	<dd data-object=".">' + //
		'            	<h3 data-value="title"></h3>' + //
		'            	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'        	</dd>' + //
		'    	</dl>' + //
		'	</div>' + //
		'	<ul data-list="list">' + //
		'    	<li data-object=".">' + //
		'        	<h2 data-value="title"></h2>' + //
		'        	<ul data-list="list">' + //
		'            	<li data-object=".">' + //
		'                	<h3 data-value="title"></h3>' + //
		'                	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'            	</li>' + //
		'        	</ul>' + //
		'        	<dl data-map="map">' + //
		'            	<dt data-value=".">' + //
		'            	</dt>' + //
		'            	<dd data-object=".">' + //
		'                	<h3 data-value="title"></h3>' + //
		'                	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'            	</dd>' + //
		'        	</dl>' + //
		'    	</li>' + //
		'	</ul>' + //
		'	<dl data-map="map">' + //
		'    	<dt data-value=".">' + //
		'    	</dt>' + //
		'    	<dd data-object=".">' + //
		'        	<h2 data-value="title"></h2>' + //
		'        	<ul data-list="list">' + //
		'            	<li data-object=".">' + //
		'                	<h3 data-value="title"></h3>' + //
		'                	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'            	</li>' + //
		'        	</ul>' + //
		'        	<dl data-map="map">' + //
		'            	<dt data-value=".">' + //
		'            	</dt>' + //
		'            	<dd data-object=".">' + //
		'                	<h3 data-value="title"></h3>' + //
		'                	<a data-href="link"><img data-src="picture" data-title="title" /></a>' + //
		'            	</dd>' + //
		'        	</dl>' + //
		'    	</dd>' + //
		'	</dl>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'title',

			nested : {
				title : 'nested-title',
				list : [ {
					title : 'nested-list-title',
					picture : 'nested-list-picture.png'
				} ],
				map : {
					'nested-key' : {
						title : 'nested-map-title',
						picture : 'nested-map-picture.png'
					}
				}
			},

			list : [ {
				title : 'subtitle',
				list : [ {
					title : 'sublist-title',
					picture : 'sublist-picture.png'
				} ],
				map : {
					'subkey' : {
						title : 'submap-title',
						picture : 'submap-picture.png'
					}
				}
			} ],

			map : {
				'key' : {
					title : 'subtitle',
					list : [ {
						title : 'sublist-title',
						picture : 'sublist-picture.png'
					} ],
					map : {
						'subkey' : {
							title : 'submap-title',
							picture : 'submap-picture.png'
						}
					}
				}
			}
		};
		var content = new js.tests.dom.TestContent(value);
		var el = this._inject(content);

		assertEquals('title', el.getByTag('h1').getText());

		var nestedObject = el.getByCss('div[data-object="nested"]');
		assertNotNull(nestedObject);
		assertEquals('nested-title', nestedObject.getByTag('h2').getText());

		var li = nestedObject.getByTag('li');
		assertNotNull(li);
		assertEquals('nested-list-title', li.getByTag('h3').getText());
		assertEquals('details.xsp?title=nested-list-title', li.getByTag('a').getAttr('href'));
		assertEquals('nested-list-picture.png', li.getByTag('img').getAttr('src'));
		assertEquals('nested-list-title', li.getByTag('img').getAttr('title'));

		var dt = nestedObject.getByTag('dt');
		assertNotNull(dt);
		assertEquals('nested-key', js.util.Strings.trim(dt.getText()));

		var dd = nestedObject.getByTag('dd');
		assertNotNull(dd);
		assertEquals('nested-map-title', dd.getByTag('h3').getText());
		assertEquals('details.xsp?title=nested-map-title', dd.getByTag('a').getAttr('href'));
		assertEquals('nested-map-picture.png', dd.getByTag('img').getAttr('src'));
		assertEquals('nested-map-title', dd.getByTag('img').getAttr('title'));

		var nestedList = this._doc.getByCss('#scratch-area>div>ul');
		assertNotNull(nestedList);
		nestedMap = this._doc.getByCss('#scratch-area>div>dl');
		assertNotNull(nestedMap);
		assertEquals('key', nestedMap.getByTag('dt').getText());

		var scopes = [ nestedList, nestedMap ];
		for ( var i = 0; i < scopes.length; ++i) {
			el = scopes[i];
			assertEquals('subtitle', el.getByTag('h2').getText());

			li = el.getByTag('li');
			assertNotNull(li);
			assertEquals('sublist-title', li.getByTag('h3').getText());
			assertEquals('details.xsp?title=sublist-title', li.getByTag('a').getAttr('href'));
			assertEquals('sublist-picture.png', li.getByTag('img').getAttr('src'));
			assertEquals('sublist-title', li.getByTag('img').getAttr('title'));

			dt = el.getByTag('dl').getByTag('dt');
			assertNotNull(dt);
			assertEquals('subkey', js.util.Strings.trim(dt.getText()));

			dd = el.getByTag('dl').getByTag('dd');
			assertNotNull(dd);
			assertEquals('submap-title', dd.getByTag('h3').getText());
			assertEquals('details.xsp?title=submap-title', dd.getByTag('a').getAttr('href'));
			assertEquals('submap-picture.png', dd.getByTag('img').getAttr('src'));
			assertEquals('submap-title', dd.getByTag('img').getAttr('title'));
		}
	},

	testControlExpression : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<h1 data-if="trueValue"></h1>' + //
		'	<h2 data-if="falseValue"></h2>' + //
		'</div>';
		this.setup(html);

		var content = {
			trueValue : 'John Doe',
			falseValue : ''
		};
		var el = this._inject(content);

		assertFalse(el.getByCss('h1[data-if]').hasCssClass('hidden'));
		assertTrue(el.getByCss('h2[data-if]').hasCssClass('hidden'));
	},

	testControlExpressionOnChildren : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<div data-if="emptyString">' + //
		'		<h1 data-value="validString"></h1>' + //
		'		<p data-value="emptyString"></p>' + //
		'	</div>' + //
		'</div>';
		this.setup(html);

		var content = {
			emptyString : '',
			validString : 'valid string'
		};
		var el = this._inject(content);

		assertTrue(el.getByCss('div[data-if]').hasCssClass('hidden'));
		assertEmpty(el.getByTag('h1').getText());
		assertEmpty(el.getByTag('p').getText());
	},

	testInnerHtml : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<div data-html="html"></div>' + //
		'</div>';
		this.setup(html);

		var content = {
			html : '<h1>Heading 1</h1><h2>Headeing 2</h2>'
		};
		this._inject(content);

		var div = document.querySelector('div[data-html]');
		assertSize(2, div.childNodes);
		assertEquals('h1', div.childNodes.item(0).nodeName.toLowerCase());
		assertEquals('h2', div.childNodes.item(1).nodeName.toLowerCase());
	},

	testCheckbox : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<input type="checkbox" data-value="trueFlag" />' + //
		'	<input type="checkbox" data-value="falseFlag" checked="checked" />' + //
		'</div>';
		this.setup(html);

		var content = {
			trueFlag : true,
			falseFlag : false
		};

		var el = this._inject(content);
		assertTrue(document.querySelectorAll('#scratch-area input')[0].checked);
		assertFalse(document.querySelectorAll('#scratch-area input')[1].checked);
	},

	testRadioGroup : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<input type="radio" name="fruit" value="APPLE" data-value="fruit" />' + //
		'	<input type="radio" name="fruit" value="WATERMELON" data-value="fruit" />' + //
		'	<input type="radio" name="fruit" value="ORANGE" data-value="fruit" />' + //
		'</div>';
		this.setup(html);

		Fruit = {
			APPLE : 'APPLE',
			WATERMELON : 'WATERMELON',
			ORANGE : 'ORANGE'
		};
		var content = {
			fruit : Fruit.WATERMELON
		};

		var el = this._inject(content);
		assertFalse(document.querySelectorAll('#scratch-area input')[0].checked);
		assertTrue(document.querySelectorAll('#scratch-area input')[1].checked);
		assertFalse(document.querySelectorAll('#scratch-area input')[2].checked);
	},

	testBullets : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'<h1 data-value="title"></h1>' + //
		'<table>' + //
		'	<tbody data-list="list">' + //
		'		<tr>' + //
		'			<td>' + //
		'				<h2 data-bullet="D.2.%s)"></h2>' + //
		'				<p data-value="title"></p>' + //	
		'				<h3 data-bullet="%n"></h3>' + //
		'				<ul data-list="list">' + //
		'					<li>' + //
		'						<h4 data-bullet="%S.%I"></h4>' + //
		'						<p data-value="title"></p>' + //	
		'						<h5 data-bullet="[%n]%n"></h5>' + //
		'					</li>' + //
		'				</ul>' + //
		'			</td>' + //
		'		</tr>' + //
		'	</tbody>' + //
		'</table>' + //
		'</div>';
		this.setup(html);

		var content = {
			title : 'title',
			list : [ {
				title : 'title',
				list : [ {
					title : 'title'
				}, {
					title : 'title'
				} ]
			}, {
				title : 'title',
				list : [ {
					title : 'title'
				}, {
					title : 'title'
				}, {
					title : 'title'
				}, {
					title : 'title'
				} ]
			} ]
		};
		var el = this._inject(content);
		assertEquals('title', el.getByTag('h1').getText());
		assertEquals('D.2.a)', el.findByTag('h2').item(0).getText());
		assertEquals('D.2.b)', el.findByTag('h2').item(1).getText());
		assertEquals('1', el.findByTag('h3').item(0).getText());
		assertEquals('2', el.findByTag('h3').item(1).getText());
		assertEquals('A.I', el.findByTag('h4').item(0).getText());
		assertEquals('A.II', el.findByTag('h4').item(1).getText());
		assertEquals('B.I', el.findByTag('h4').item(2).getText());
		assertEquals('B.II', el.findByTag('h4').item(3).getText());
		assertEquals('B.III', el.findByTag('h4').item(4).getText());
		assertEquals('B.IV', el.findByTag('h4').item(5).getText());
		assertEquals('[1]1', el.findByTag('h5').item(0).getText());
		assertEquals('[1]2', el.findByTag('h5').item(1).getText());
		assertEquals('[2]1', el.findByTag('h5').item(2).getText());
		assertEquals('[2]2', el.findByTag('h5').item(3).getText());
		assertEquals('[2]3', el.findByTag('h5').item(4).getText());
		assertEquals('[2]4', el.findByTag('h5').item(5).getText());
	},

	_testSetValueOnUserDefinedClass : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<h1 data-value="title"></h1>' + //
		'	<h2 data-value="description"></h2>' + //
		'	<div data-value="person" data-class="js.tests.dom.Person">' + //
		'		<h3 data-value="name"></h3>' + //
		'		<h4 data-value="age"></h4>' + //
		'		<h5 data-value="profession"></h5>' + //
		'	</div>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'Personal File',
			description : 'person description',
			person : {
				name : 'John Doe',
				age : 40,
				profession : 'freelancer'
			}
		};
		var el = this._inject(value);

		assertEquals('Personal File', el.getByTag('h1').getText());
		assertEquals('person description', el.getByTag('h2').getText());
		assertEquals('Maximus Decimus Meridius', el.getByTag('h3').getText());
		assertEquals('30', el.getByTag('h4').getText());
		assertEquals('general', el.getByTag('h5').getText());
	},

	testSetObjectOnSubtree : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'<h1 data-value="title"></h1>' + //
		'<h2 data-value="description"></h2>' + //
		'<div id="person-container">' + //
		'	<div id="person" data-object="person">' + //
		'		<h3 data-value="name"></h3>' + //
		'		<h4 data-value="age"></h4>' + //
		'		<h5 data-value="profession"></h5>' + //
		'	</div>' + //
		'</div>' + //
		'</div>';
		this.setup(html);

		function assert(el) {
			assertEquals('Personal File', el.getByTag('h1').getText());
			assertEquals('person description', el.getByTag('h2').getText());
			assertEquals('John Doe', el.getByTag('h3').getText());
			assertEquals('40', el.getByTag('h4').getText());
			assertEquals('freelancer', el.getByTag('h5').getText());
		}

		var content = {
			title : 'Personal File',
			description : 'person description',
			person : {
				name : 'John Doe',
				age : 40,
				profession : 'freelancer'
			}
		};

		var template = new js.dom.Template(this._doc);
		template.inject(this._root, content);
		assert(this._root);

		var el = this._doc.getById('person-container');
		template.inject(el, content.person, true);
		assert(this._root);

		el = this._doc.getById('person');
		template.inject(el, content.person, true);
		assert(this._root);
	},

	testSetListOnSubtree : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'<h1 data-value="title"></h1>' + //
		'<h2 data-value="description"></h2>' + //
		'<div id="persons-container">' + //
		'	<ul id="persons" data-list="persons">' + //
		'		<li>' + //
		'			<h3 data-value="name"></h3>' + //
		'			<h4 data-value="age"></h4>' + //
		'			<h5 data-value="profession"></h5>' + //
		'		</li>' + //
		'	</ul>' + //
		'</div>' + //
		'</div>';
		this.setup(html);

		function assert(el) {
			assertEquals('Personal File', el.getByTag('h1').getText());
			assertEquals('person description', el.getByTag('h2').getText());
			assertEquals('John Doe', el.findByTag('li').item(0).getByTag('h3').getText());
			assertEquals('40', el.findByTag('li').item(0).getByTag('h4').getText());
			assertEquals('freelancer', el.findByTag('li').item(0).getByTag('h5').getText());
			assertEquals('Radesha', el.findByTag('li').item(1).getByTag('h3').getText());
			assertEquals('30', el.findByTag('li').item(1).getByTag('h4').getText());
			assertEquals('house keeper', el.findByTag('li').item(1).getByTag('h5').getText());
		}

		var content = {
			title : 'Personal File',
			description : 'person description',
			persons : [ {
				name : 'John Doe',
				age : 40,
				profession : 'freelancer'
			}, {
				name : 'Radesha',
				age : 30,
				profession : 'house keeper'

			} ]
		};

		var template = new js.dom.Template(this._doc);
		template.inject(this._root, content);
		assert(this._root);

		var el = this._doc.getById('persons-container');
		template.inject(el, content.persons, true);
		assert(this._root);

		el = this._doc.getById('persons');
		template.inject(el, content.persons, true);
		assert(this._root);
	},

	testSetId : function() {
		var html = '' + //
		'<div data-object="." data-id="id">' + //
		'	<h1 data-value="name"></h1>' + //
		'</div>';
		this.setup(html);

		function assert(el) {
			assertEquals('1964', el.getAttr('id'));
			assertEquals('John Doe', el.getByTag('h1').getText());
		}

		var content = {
			id : 1964,
			name : 'John Doe',
		};

		var template = new js.dom.Template(this._doc);
		template.inject(this._root, content);
		assert(this._root.getByTag('div'));

		template = new js.dom.Template(this._doc);
		var el = this._root.getByTag('div');
		template.inject(el, content);
		assert(el);
	},

	testFormat : function() {
		var html = '' + //
		'<div data-object=".">' + //
		'	<div>' + //
		'    	<h1 data-value="title" data-format="js.tests.dom.UpperFormat"></h1>' + //
		'    	<h2 data-value="title"></h2>' + //
		'    	<h3 data-value="logo"></h3>' + //
		'    	<img data-src="logo" data-title="title" />' + //
		'	</div>' + //
		'	<ul data-list="pictures">' + //
		'   	<li data-value=".">' + //
		'    	</li>' + //
		'	</ul>' + //
		'	<ol data-list="names">' + //
		'    	<li data-value="." data-format="js.tests.dom.UpperFormat">' + //
		'    	</li>' + //
		'	</ol>' + //
		'</div>';
		this.setup(html);

		var value = {
			title : 'title',
			logo : 'logo.png',
			pictures : [ 'spring.png', 'autumn.png' ],
			names : [ 'Joe', 'Black' ]
		};
		var el = this._inject(value);

		assertEquals('TITLE', el.getByTag('h1').getText());
		assertEquals('title', el.getByTag('h2').getText());
		assertEquals('logo.png', el.getByTag('h3').getText());
		assertEquals('logo.png', el.getByTag('img').getAttr('src'));
		assertEquals('title', el.getByTag('img').getAttr('title'));

		var ul = el.getByTag('ul');
		assertEquals('spring.png', ul.findByTag('li').item(0).getText());
		assertEquals('autumn.png', ul.findByTag('li').item(1).getText());

		var ol = el.getByTag('ol');
		assertEquals('JOE', ol.findByTag('li').item(0).getText());
		assertEquals('BLACK', ol.findByTag('li').item(1).getText());
	},

	_inject : function(content) {
		var templatesProcessor = new js.dom.Template(this._doc);
		templatesProcessor.inject(this._root, content);
		return this._root;
	},

	_getKeyElement : function(el, tag, text) {
		var children = el.findByTag(tag).it(), child;
		while (children.hasNext()) {
			child = children.next();
			if (child.getText() === text) {
				return child;
			}
		}
		return null;
	},

	set : function(value) {
		var template = this._ownerDoc.getTemplate();
		template.inject(this, value);
	}
};
TestCase.register('js.tests.dom.TemplateUnitTests');

js.tests.dom.TestContent = function(model) {
	this.$super(model);
};

js.tests.dom.TestContent.prototype = {
	getLink : function(flatObject) {
		return "details.xsp?title=" + flatObject.title;
	}
};
$extends(js.tests.dom.TestContent, js.dom.Content);

js.tests.dom.Person = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
};

js.tests.dom.Person.prototype = {
	setValue : function(person) {
		person.name = 'Maximus Decimus Meridius';
		person.age = 30;
		person.profession = 'general';

		var tp = new js.dom.Template(this._ownerDoc);
		tp.inject(this, person, true);
		return this;
	}
};
$extends(js.tests.dom.Person, js.dom.Element);

js.tests.dom.UpperFormat = function() {
};

js.tests.dom.UpperFormat.prototype = {
	format : function(s) {
		return s.toUpperCase();
	},

	parse : function() {
	},

	test : function() {
	}
};