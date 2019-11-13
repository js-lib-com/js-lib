$package("js.event");

/**
 * Valid event types map.
 */
js.event.Types = {
	/**
	 * The action has been aborted.
	 */
	abort : "HTMLEvents",

	/**
	 * Before unload. Fired just before unload.
	 */
	beforeunload : "HTMLEvents",

	/**
	 * Focus has moved away from the target.
	 */
	blur : "HTMLEvents",

	/**
	 * The user agent can resume playback of the media data, but estimates that if playback were to be started now, the
	 * media resource could not be rendered at the current playback rate up to its end without having to stop for
	 * further buffering of content.
	 */
	canplay : "MediaEvents",

	/**
	 * The user agent estimates that if playback were to be started now, the media resource could be rendered at the
	 * current playback rate all the way to its end without having to stop for further buffering.
	 */
	canplaythrough : "MediaEvents",

	/**
	 * A value in a form has been changed.
	 */
	change : "HTMLEvents",

	/**
	 * Event raised when mouse is clicked.
	 */
	click : "MouseEvents",

	/**
	 * Event raised when right mouse is clicked.
	 */
	contextmenu : "MouseEvents",

	/**
	 * Mouse is double-clicked.
	 */
	dblclick : "MouseEvents",

	/**
	 * The <code>drag</code> event is fired every few hundred milliseconds as an element or text selection is being
	 * dragged by the user.
	 */
	drag : "DragEvent",

	/**
	 * The <code>dragend</code> event is fired when a drag operation is being ended (by releasing a mouse button or
	 * hitting the escape key).
	 */
	dragend : "DragEvent",

	/**
	 * The <code>dragenter</code> event is fired when a dragged element or text selection enters a valid drop target.
	 */
	dragenter : "DragEvent",

	/**
	 * The <code>dragexit</code> event is fired when an element is no longer the drag operation's immediate selection
	 * target.
	 */
	dragexit : "DragEvent",

	/**
	 * The <code>dragleave</code> event is fired when a dragged element or text selection leaves a valid drop target.
	 */
	dragleave : "DragEvent",

	/**
	 * The <code>dragover</code> event is fired when an element or text selection is being dragged over a valid drop
	 * target (every few hundred milliseconds). The event is fired on the drop target(s).
	 */
	dragover : "DragEvent",

	/**
	 * The <code>dragstart</code> event is fired when the user starts dragging an element or text selection.
	 */
	dragstart : "DragEvent",

	/**
	 * The <code>drop</code> event is fired when an element or text selection is dropped on a valid drop target.
	 */
	drop : "DragEvent",

	/**
	 * The duration attribute has just been updated.
	 */
	durationchange : "MediaEvents",

	/**
	 * A media element whose networkState was previously not in the NETWORK_EMPTY state has just switched to that state.
	 */
	emptied : "MediaEvents",

	/**
	 * Playback has stopped because the end of the media resource was reached.
	 */
	ended : "MediaEvents",

	/**
	 * There has been an error.
	 */
	error : "HTMLEvents",

	/**
	 * Focus has been set on the target.
	 */
	focus : "HTMLEvents",

	/**
	 * Fired synchronously when the value of an &lt;input&gt; or &lt;textarea&gt; element is changed.
	 */
	input : "HTMLEvents",

	/**
	 * The <code>keydown</code> event is fired when a key is pressed down. Unlike the <code>keypress</code> event,
	 * the <code>keydown</code> event is fired for all keys, not mater if produce or not a character, that is,
	 * includes keys like shift, ctrl or alt. Event key property, {@link js.event.Event#key}, contains pressed key
	 * code, see {@link js.event.Key} for recognized key codes.
	 * <p>
	 * Note that key code is not strictly character code used on <code>keypress</code> event. For example key code for
	 * 'A' key is always 65, no mater caps or shift is used. In contrast character code is 65 for 'A' and 97 for 'a'.
	 */
	keydown : "KeyboardEvent",

	/**
	 * The <code>keypress</code> event is fired when a key that produces a character value is pressed down. Event key
	 * property, {@link js.event.Event#key}, contains pressed key character code.
	 * <p>
	 * Note that character code is case sensitive, that is, 65 for 'A' and 97 for 'a'. This is different from key code
	 * used by <code>keydown</code> event. In order to convert character code to string one can use
	 * <code>String.fromCharCode(ev.key)</code>.
	 */
	keypress : "KeyboardEvent",

	/**
	 * Similar to <code>keydown</code> but fired when the key has been released.
	 */
	keyup : "KeyboardEvent",

	/**
	 * The element/window has loaded.
	 */
	load : "HTMLEvents",

	/**
	 * The user agent can render the media data at the current playback position for the first time.
	 */
	loadeddata : "MediaEvents",

	/**
	 * The user agent has just determined the duration and dimensions of the media resource.
	 */
	loadedmetadata : "MediaEvents",

	/**
	 * The user agent begins looking for media data, as part of the resource selection algorithm.
	 */
	loadstart : "MediaEvents",

	/**
	 * Mouse button is pressed down.
	 */
	mousedown : "MouseEvents",

	/**
	 * Mouse cursor moves.
	 */
	mousemove : "MouseEvents",

	/**
	 * Mouse cursor leaves target.
	 */
	mouseout : "MouseEvents",

	/**
	 * Mouse cursor moves over the target.
	 */
	mouseover : "MouseEvents",

	/**
	 * Mouse button is released.
	 */
	mouseup : "MouseEvents",

	/**
	 * Mouse wheel has been moved.
	 */
	mousewheel : "SyntheticEvents",

	/**
	 * Device orientation changed. This event applies only to mobile devices equipped with accelerometer.
	 */
	orientationchange : "HTMLEvents",

	/**
	 * Paste event.
	 */
	paste : "UIEvents",

	/**
	 * Playback has been paused. Fired after the pause() method has returned.
	 */
	pause : "MediaEvents",

	/**
	 * Playback has begun. Fired after the play() method has returned, or when the autoplay attribute has caused
	 * playback to begin.
	 */
	play : "MediaEvents",

	/**
	 * Playback has started.
	 */
	playing : "MediaEvents",

	/**
	 * The user agent is fetching media data.
	 */
	progress : "MediaEvents",

	/**
	 * Either the defaultPlaybackRate or the playbackRate attribute has just been updated.
	 */
	ratechange : "MediaEvents",

	/**
	 * A form has been reset.
	 */
	reset : "HTMLEvents",

	/**
	 * A element/window has been resized.
	 */
	resize : "HTMLEvents",

	/**
	 * Window/frame has been scrolled.
	 */
	scroll : "HTMLEvents",

	/**
	 * The seeking IDL attribute changed to false.
	 */
	seeked : "MediaEvents",

	/**
	 * The seeking IDL attribute changed to true and the seek operation is taking long enough that the user agent has
	 * time to fire the event.
	 */
	seeking : "MediaEvents",

	/**
	 * An element has been selected.
	 */
	select : "HTMLEvents",

	/**
	 * The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
	 */
	stalled : "MediaEvents",

	/**
	 * A form has been submitted.
	 */
	submit : "HTMLEvents",

	/**
	 * The user agent is intentionally not currently fetching media data, but does not have the entire media resource
	 * downloaded.
	 */
	suspend : "MediaEvents",

	/**
	 * The current playback position changed as part of normal playback or in an especially interesting way, for example
	 * discontinuously.
	 */
	timeupdate : "MediaEvents",

	/**
	 * The <code>touchcancel</code> event is fired when a touch point has been disrupted in an implementation-specific
	 * manner (for example, too many touch points are created).
	 */
	touchcancel : "TouchEvent",

	/**
	 * The <code>touchend</code> event is fired when a touch point is removed from the touch surface.
	 */
	touchend : "TouchEvent",

	/**
	 * Sent when the user moves a touch point along the surface. The event's target is the same element that received
	 * the <code>touchstart</code> event corresponding to the touch point, even if the touch point has moved outside
	 * that element.
	 */
	touchmove : "TouchEvent",

	/**
	 * The <code>touchstart</code> event is fired when a touch point is placed on the touch surface. Event parameter
	 * contains the element in which the touch occurred and page coordinates of the touch point.
	 */
	touchstart : "TouchEvent",

	/**
	 * Fired when a CSS transition has completed. This event is not triggered if transition is removed or element
	 * display none before transition end.
	 */
	transitionend : "TransitionEvent",

	/**
	 * The element/window has been unloaded.
	 */
	unload : "HTMLEvents",

	/**
	 * Either the volume attribute or the muted attribute has changed. Fired after the relevant attribute's setter has
	 * returned.
	 */
	volumechange : "MediaEvents",

	/**
	 * Playback has stopped because the next frame is not available, but the user agent expects that frame to become
	 * available in due course.
	 */
	waiting : "MediaEvents"
};
