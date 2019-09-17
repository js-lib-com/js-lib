$package('js.fx.test');

$include("js.dom.Image");

js.fx.test.AnimPreview = {
	_images : [],

	before : function() {
		for ( var i = 0; i < 3; i++) {
			this._images.push('i' + i + '.png');
		}
		this._doc = new js.dom.Document(document);
		this._image = this._doc.createElement('img').setSrc(this._images[js.util.Rand(this._images.length)]);
		this._image.style.set('position', 'absolute');
		this._doc.getByTag('body').addChild(this._image);
	},

	testFadeImage : function() {
		var anim = new js.fx.Anim({
			el : this._image,
			duration : 4000,
			style : 'opacity',
			from : 1,
			to : 0
		});
		anim.start();
	},

	_testSlideShowCreation : function() {
		var images = this.images;
		var d1 = Dom.getEl('div1');
		var d2 = Dom.getEl('div2');

		var fn = function() {
			var anim1 = new js.fx.Anim({
				el : d1,
				duration : 2000,
				style : 'opacity',
				from : 0,
				to : 1
			});
			anim1.start();
			var i = Math.floor(24 * Math.random());
			d1.firstChild.src = 'img/r/i' + i + '.png';

			var anim2 = new Anim({
				el : d2,
				duration : 2000,
				style : 'opacity',
				from : 1,
				to : 0
			});
			anim2.start();

			var d = d1;
			d1 = d2;
			d2 = d;
			setTimeout(fn, 4000);
		};
		setTimeout(fn, 1000);
	},

	_testImageShow : function() {
		var imageshow = new js.fx.ImageShow($E('.slideshow'));
		imageshow.images = this._images;
		imageshow.slideDuration = 2000;
		imageshow.transitionDuration = 3000;
		imageshow.start();
	},

	testSimpleImageMovement : function() {
		var anim = new js.fx.Anim({
			el : this._image,
			duration : 1500,
			style : 'opacity',
			from : 1,
			to : 0
		}, {
			el : this._image,
			duration : 1500,
			style : 'top',
			from : 0,
			to : 600,
			ttf : js.fx.TTF.Exponential
		});
		anim.start();
	},

	testHorizontalSwing : function() {
		// alternative configuration
		var anim = {
			el : this._image,
			duration : 4000,
			ttf : js.fx.TTF.Linear,
			set : [ {
				style : 'opacity',
				from : 1,
				to : 0
			}, {
				style : 'left',
				from : 0,
				to : this._doc.getByTag('body').style.getWidth() - this._image.style.getWidth(),
			}, {
				style : 'top',
				from : 250,
				to : 400,
				ttf : js.fx.TTF.Swing
			} ]
		};

		var anim = new js.fx.Anim({
			el : this._image,
			duration : 4000,
			style : 'opacity',
			from : 1,
			to : 0
		}, {
			el : this._image,
			duration : 4000,
			style : 'left',
			from : 0,
			to : this._doc.getByTag('body').style.getWidth() - this._image.style.getWidth(),
			ttf : js.fx.TTF.Linear
		}, {
			el : this._image,
			duration : 4000,
			style : 'top',
			from : 250,
			to : 400,
			ttf : js.fx.TTF.Swing
		});
		anim.start();
	},

	testComplexImageAnimation : function() {
		var img = this._image;
		var anim = new js.fx.Anim({
			el : img,
			duration : 6000,
			style : 'top',
			from : 0,
			to : 400,
			ttf : js.fx.TTF.Exponential
		}, {
			el : img,
			duration : 6000,
			style : 'left',
			from : 0,
			to : 600,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			offset : 6000,
			duration : 6000,
			style : 'top',
			from : 400,
			to : 0
		}, {
			el : img,
			offset : 12000,
			duration : 2000,
			style : 'width',
			from : 360,
			to : 0,
			ttf : js.fx.TTF.Exponential
		}, {
			el : img,
			offset : 12000,
			duration : 2000,
			style : 'height',
			from : 270,
			to : 0,
			ttf : js.fx.TTF.Exponential
		}, {
			el : img,
			offset : 16000,
			duration : 2000,
			style : 'width',
			from : 0,
			to : 360
		}, {
			el : img,
			offset : 16000,
			duration : 2000,
			style : 'height',
			from : 0,
			to : 270
		}, {
			el : img,
			offset : 18000,
			duration : 2000,
			style : 'opacity',
			from : 1,
			to : 0
		});
		anim.start();
	},

	testMultipleSimultanStyles : function() {
		var img = this._image;
		var anim = new js.fx.Anim({
			el : img,
			duration : 6000,
			style : 'top',
			from : 0,
			to : 400,
			ttf : js.fx.TTF.Linear
		}, {
			el : img,
			duration : 6000,
			style : 'left',
			from : 0,
			to : 600,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			duration : 6000,
			style : 'width',
			from : 36,
			to : 360,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			duration : 6000,
			style : 'height',
			from : 27,
			to : 270,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			offset : 6000,
			duration : 500,
			style : 'top',
			from : 400,
			to : 0,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			offset : 6000,
			duration : 500,
			style : 'left',
			from : 600,
			to : 0,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			offset : 6000,
			duration : 500,
			style : 'width',
			from : 360,
			to : 0,
			ttf : js.fx.TTF.Logarithmic
		}, {
			el : img,
			offset : 6000,
			duration : 500,
			style : 'height',
			from : 270,
			to : 0,
			ttf : js.fx.TTF.Logarithmic
		});
		anim.start();
	}
};
TestCase.register('js.fx.test.AnimPreview');
