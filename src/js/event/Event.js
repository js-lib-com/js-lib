$package('js.event');

/**
 * Document event contextual information. Object passed to event listener when a particular event fires. It wraps
 * contextual information about an event in process.
 * 
 * @author Iulian Rotaru
 * @constructor Construct event instance.
 * 
 * @param js.dom.Document doc, document on which this event is processed,
 * @param String type, event type. One of events listed on {@link js.event.Types}.
 * @assert given arguments are not undefined, null or empty, <em>doc</em> is an instance of js.dom.Document and
 * <em>type</em> is a string.
 */
js.event.Event = function(doc, type) {
	$assert(doc, 'js.dom.Event#Event', 'Document is undefined or null.');
	$assert(doc instanceof js.dom.Document, 'js.dom.Event#Event', 'Document is not an instance of js.dom.Document');
	$assert(js.lang.Types.isString(type), 'js.dom.Event#Event', 'Invalid event type.');

	/**
	 * Owning document.
	 * 
	 * @type js.dom.Document
	 */
	this._doc = doc;

	/**
	 * Event type.
	 * 
	 * @type String
	 */
	this.type = type;
};

js.event.Event.prototype = {
	/**
	 * Initialize this event object state.
	 * 
	 * @param Event domEvent DOM native event.
	 * @return js.event.Event this object.
	 */
	init : function(domEvent) {
		/**
		 * Event timestamp.
		 * 
		 * @type Number
		 */
		this.timeStamp = domEvent.timeStamp;

		this._init(domEvent || window.event);

		/**
		 * <b>Shift</b> key pressed. True only if a Shift key was pressed while event occurs.
		 * 
		 * @type Boolean
		 */
		this.shiftKey = domEvent.shiftKey;

		/**
		 * <b>Alt</b> key pressed. True only if a Alt key was pressed while event occurs.
		 * 
		 * @type Boolean
		 */
		this.altKey = domEvent.altKey;

		/**
		 * <b>Ctrl</b> key pressed. True only if a Ctrl key was pressed while event occurs.
		 * 
		 * @type Boolean
		 */
		this.ctrlKey = domEvent.ctrlKey;

		if (this.type === 'mousewheel') {
			/**
			 * Wheel movement. Valid only for mousewheel event, otherwise not specified. A number with sign codifying
			 * both movement speed and direction: positive values means forward.
			 * 
			 * @type Number
			 */
			this.wheel = 0;
			if (domEvent.wheelDelta) {
				this.wheel = domEvent.wheelDelta / 120;
				if (js.ua.Engine.PRESTO) {
					this.wheel = -this.wheel;
				}
			}
			else if (domEvent.detail) {
				this.wheel = -domEvent.detail / 3;
			}
		}

		/**
		 * This event default behavior was prevented.
		 * 
		 * @type Boolean
		 */
		this.prevented = false;

		/**
		 * This event was stopped.
		 * 
		 * @type Boolean
		 */
		this.stopped = false;
		return this;
	},

	/**
	 * Internal initialization helper.
	 * 
	 * @param Event domEvent native DOM event.
	 */
	_init : function(domEvent) {
		$assert(typeof domEvent.srcElement !== "undefined" || typeof domEvent.originalTarget !== "undefined", "js.event.Event#_init", "Missing support for event original target.");

		/**
		 * Native event.
		 * 
		 * @type Event
		 */
		this._domEvent = domEvent;

		/**
		 * Target element. The element toward which the event is targeted.
		 * 
		 * @type js.dom.Element
		 */
		this.target = domEvent.target.nodeType === Node.ELEMENT_NODE ? this._doc.getElement(domEvent.target) : null;

		function getPageCoordinates(domEvents, axis) {
			var property = "page" + axis;
			if (typeof domEvents.touches !== "undefined" && domEvents.touches.length > 0) {
				return domEvents.touches[0][property];
			}
			return domEvents[property];
		}
		/**
		 * Page horizontal coordinates where event occurs. Event horizontal position relative to page, measured in
		 * pixels. In this context the <code>page</code> is entire area occupied by document, not only the visible
		 * viewport.
		 * 
		 * @type Number
		 */
		this.pageX = getPageCoordinates(domEvent, "X");

		/**
		 * Page vertical coordinates where event occurs. Event vertical position relative to page, measured in pixels.
		 * In this context the <code>page</code> is entire area occupied by document, not only the visible viewport.
		 * 
		 * @type Number
		 */
		this.pageY = getPageCoordinates(domEvent, "Y");

		/**
		 * Key number. Valid only for keyboard events, otherwise not specified.
		 * 
		 * @type Number
		 * @see js.event.Key Keyboard codes.
		 */
		this.key = Number(domEvent.keyCode) || Number(domEvent.which);
	},

	/**
	 * Prevent default event processing.
	 */
	prevent : function() {
		if (this._domEvent.cancelable) {
			this.prevented = true;
		}
	},

	/**
	 * Stop event propagation.
	 */
	stop : function() {
		this.stopped = true;
	},

	/**
	 * Halt event, that is, stop event propagation and prevent default event processing.
	 */
	halt : function() {
		this.stop();
		this.prevent();
	},

	/**
	 * Return true if this event is a mouse event and right button was pressed. This predicate returns meaningful data
	 * only if invoked for mouse events.
	 * 
	 * @return Boolean if this is a right mouse event.
	 */
	isRightClick : function() {
		return this._domEvent.button === 2;
	},

	/**
	 * Return true if this event is a mouse event and left button was pressed. This predicate returns meaningful data
	 * only if invoked for mouse events.
	 * 
	 * @return Boolean if this is a left mouse event.
	 */
	isLeftClick : function() {
		return this._domEvent.button === 0;
	},

	/**
	 * Return true if this event is a mouse event and wheel was pressed. This predicate returns meaningful data only if
	 * invoked for mouse events.
	 * 
	 * @return Boolean if this is a wheel mouse event.
	 */
	isMiddleClick : function() {
		return this._domEvent.button === 1;
	},

	/**
	 * Set event transfer data, if underlying DOM event support it. Otherwise this method does nothing. Override any
	 * existing data, if any. Data argument can be primitive or any object, of not restricted complexity.
	 * 
	 * @param Object value data value.
	 */
	setData : function(value) {
		if (typeof this._domEvent.dataTransfer !== "undefined") {
			this._domEvent.dataTransfer.setData("text/plain", js.lang.JSON.stringify(value));
		}
	},

	/**
	 * Get event transfer data, previous set by {@link #setData(Object)}. If underlying DOM event does not support
	 * event data this method returns undefined. Returns null if event data was not set.
	 * 
	 * @return event transfer data, null if not set or undefined if not supported.
	 */
	getData : function() {
		if (typeof this._domEvent.dataTransfer === "undefined") {
			return undefined;
		}
		var value = this._domEvent.dataTransfer.getData("text/plain");
		return value ? js.lang.JSON.parse(value) : null;
	},

	/**
	 * Returns a string representation of the object.
	 * 
	 * @return String object string representation.
	 */
	toString : function() {
		return 'js.event.Event';
	}
};
$extends(js.event.Event, Object);

/**
 * IE event target, page coordinates and key code are different. Also cancelable property is missing.
 */
$legacy(js.ua.Engine.TRIDENT, function() {
	js.event.Event.prototype._init = function(domEvent) {
		this.target = this._doc.getElement(domEvent.srcElement);
		this.pageX = domEvent.clientX + this._doc._document.body.scrollLeft + this._doc._document.documentElement.scrollLeft;
		this.pageY = domEvent.clientY + this._doc._document.body.scrollTop + this._doc._document.documentElement.scrollTop;
		this.key = domEvent.keyCode;
	};

	js.event.Event.prototype.prevent = function() {
		this.prevented = true;
	};
});
