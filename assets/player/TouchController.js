var kTouchStartEventName = "touchstart";
var kTouchMoveEventName = "touchmove";
var kTouchEndEventName = "touchend";
var kTouchCancelEventName = "touchcancel";
var kGestureStartEventName = "gesturestart";
var kGestureEndEventName = "gestureend";
var kSwipeEvent = "TouchController:SwipeEvent";
var kTapEvent = "TouchController:TapeEvent";
var TouchController = Class.create({
	initialize: function () {
		document.observe(
			kTouchStartEventName,
			this.handleTouchStartEvent.bind(this)
		);
		document.observe(kTouchMoveEventName, this.handleTouchMoveEvent.bind(this));
		document.observe(kTouchEndEventName, this.handleTouchEndEvent.bind(this));
		document.observe(
			kTouchCancelEventName,
			this.handleTouchCancelEvent.bind(this)
		);
		document.observe(
			kGestureStartEventName,
			this.handleGestureStartEvent.bind(this)
		);
		document.observe(
			kGestureEndEventName,
			this.handleGestureEndEvent.bind(this)
		);
		this.swipeInProgress = false;
		this.swipeFingerCount = 0;
		this.swipeStartTime = 0;
		this.swipeStartX = 0;
		this.swipeStartY = 0;
		this.preventDefault = true;
		this.tapEventCallback = null;
		this.setTrackArea(0, 0, 0, 0);
		this.enableTouchTracking = true;
	},
	setTouchTrackingEnabled: function (a) {
		this.enableTouchTracking = a;
	},
	setTrackArea: function (d, c, b, a) {
		debugMessage(
			kDebugTouchController_SetTrackArea,
			"left: " + d + " top: " + c + " width: " + b + " height: " + a
		);
		this.trackAreaLeft = d;
		this.trackAreaTop = c;
		this.trackAreaRight = d + b;
		this.trackAreaBottom = c + a;
	},
	registerTapEventCallback: function (a) {
		this.tapEventCallback = a;
	},
	isTouchWithinTrackArea: function (a) {
		debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "checking...");
		if (this.enableTouchTracking === false) {
			debugMessage(
				kDebugTouchController_IsTouchWithinTrackArea,
				"- nope, tracking is disabled"
			);
			return false;
		}
		if (a.clientX < this.trackAreaLeft) {
			debugMessage(
				kDebugTouchController_IsTouchWithinTrackArea,
				"- nope, x < left"
			);
			return false;
		}
		if (a.clientX > this.trackAreaRight) {
			debugMessage(
				kDebugTouchController_IsTouchWithinTrackArea,
				"- nope, x > right"
			);
			return false;
		}
		if (a.clientY < this.trackAreaTop) {
			debugMessage(
				kDebugTouchController_IsTouchWithinTrackArea,
				"- nope, y < top"
			);
			return false;
		}
		if (a.clientY > this.trackAreaBottom) {
			debugMessage(
				kDebugTouchController_IsTouchWithinTrackArea,
				"- nope, y > bottom"
			);
			return false;
		}
		debugMessage(kDebugTouchController_IsTouchWithinTrackArea, "- yes it is!");
		return true;
	},
	handleTouchStartEvent: function (b) {
		debugMessage(
			kDebugTouchController_HandleTouchStartEvent,
			"touch event has " + b.touches.length + " fingers..."
		);
		if (this.swipeInProgress === false) {
			debugMessage(
				kDebugTouchController_HandleTouchStartEvent,
				"- this is the first finger down event..."
			);
			var a = b.touches[0];
			if (this.isTouchWithinTrackArea(a)) {
				debugMessage(
					kDebugTouchController_HandleTouchStartEvent,
					"- start tracking a swipt event..."
				);
				if (this.preventDefault) {
					b.preventDefault();
				}
				this.swipeInProgress = true;
				this.swipeFingerCount = b.touches.length;
				this.swipeStartTime = new Date();
				this.swipeStartX = a.clientX;
				this.swipeStartY = a.clientY;
			} else {
				debugMessage(
					kDebugTouchController_HandleTouchStartEvent,
					"- but it is outside of the track area"
				);
			}
		} else {
			debugMessage(
				kDebugTouchController_HandleTouchStartEvent,
				"- this is a subsequent finger down event. update finger count..."
			);
			if (b.touches.length > this.swipeFingerCount) {
				this.swipeFingerCount = b.touches.length;
				debugMessage(
					kDebugTouchController_HandleTouchStartEvent,
					"- this.swipeFingerCount:" + this.swipeFingerCount
				);
			}
		}
	},
	handleTouchMoveEvent: function (a) {
		if (this.preventDefault) {
			a.preventDefault();
		}
		debugMessage(kDebugTouchController_HandleTouchCancelEvent, "");
	},
	handleTouchEndEvent: function (k) {
		debugMessage(
			kDebugTouchController_HandleTouchEndEvent,
			"touch event has " + k.touches.length + " fingers..."
		);
		if (this.swipeInProgress) {
			if (this.preventDefault) {
				k.preventDefault();
			}
			if (k.touches.length === 0) {
				debugMessage(
					kDebugTouchController_HandleTouchEndEvent,
					"-  " + this.swipeFingerCount + " finger swipe is complete."
				);
				var b = k.changedTouches[0];
				var n = document.viewport.getDimensions();
				var a = n.width / 3;
				var h = n.height / 3;
				var i = n.width / 3;
				var r = b.clientX - this.swipeStartX;
				var q = b.clientY - this.swipeStartY;
				var m = Math.abs(r);
				var l = Math.abs(q);
				var o = new Date();
				var e = o - this.swipeStartTime;
				var d = false;
				var g = false;
				var j = 400;
				var c = 20;
				if (e < j) {
					debugMessage(
						kDebugTouchController_HandleTouchEndEvent,
						"-  elapsed time was short enough to be a tap, check its magnitude..."
					);
					if (m < c && l < c) {
						d = true;
					} else {
						debugMessage(
							kDebugTouchController_HandleTouchEndEvent,
							"-  magnitude time too big to be a tap, check if it's a swipe..."
						);
					}
				} else {
					debugMessage(
						kDebugTouchController_HandleTouchEndEvent,
						"-  elapsed time too long to be a tap, check if it's a swipe..."
					);
				}
				if (e > 800) {
					debugMessage(
						kDebugTouchController_HandleTouchEndEvent,
						"-  elapsed time too long to be a swipe, ignoring..."
					);
				} else {
					if (m > l) {
						if (l > h) {
							debugMessage(
								kDebugTouchController_HandleTouchEndEvent,
								"-  vertical magnitude too high, ignoring..."
							);
						} else {
							g = true;
						}
					} else {
						if (m > i) {
							debugMessage(
								kDebugTouchController_HandleTouchEndEvent,
								"-  horizontal magnitude too high, ignoring..."
							);
						} else {
							g = true;
						}
					}
				}
				if (d) {
					debugMessage(
						kDebugTouchController_HandleTouchEndEvent,
						"-  it's a " + this.swipeFingerCount + " finger tap"
					);
					if (this.tapEventCallback) {
						var f = {};
						f.memo = {};
						f.memo.fingers = this.swipeFingerCount;
						f.memo.pointX = b.clientX;
						f.memo.pointY = b.clientY;
						f.memo.target = k.target;
						debugMessage(
							kDebugTouchController_HandleTouchEndEvent,
							"- invoking callback with pointX: " +
								b.clientX +
								" pointY: " +
								b.clientY +
								"..."
						);
						this.tapEventCallback(f);
						debugMessage(
							kDebugTouchController_HandleTouchEndEvent,
							"- back from callback"
						);
					} else {
						debugMessage(
							kDebugTouchController_HandleTouchEndEvent,
							"- firing TapEvent..."
						);
						document.fire(kTapEvent, {
							fingers: this.swipeFingerCount,
							pointX: b.clientX,
							pointY: b.clientY,
						});
					}
				} else {
					if (g) {
						var p;
						if (m > l) {
							p = r < 0 ? "left" : "right";
						} else {
							p = q < 0 ? "up" : "down";
						}
						debugMessage(
							kDebugTouchController_HandleTouchEndEvent,
							"-  it's a " +
								this.swipeFingerCount +
								" finger swipe in the " +
								p +
								" direction"
						);
						document.fire(kSwipeEvent, {
							direction: p,
							fingers: this.swipeFingerCount,
							swipeStartX: this.swipeStartX,
						});
					}
				}
				this.swipeInProgress = false;
				this.swipeFingerCount = 0;
			}
		} else {
			debugMessage(
				kDebugTouchController_HandleTouchEndEvent,
				"-  false alarm. swipe has already ended."
			);
		}
	},
	handleTouchCancelEvent: function (a) {
		debugMessage(kDebugTouchController_HandleTouchCancelEvent, "");
		this.swipeInProgress = false;
	},
	handleGestureStartEvent: function (a) {
		debugMessage(kDebugTouchController_HandleGestureStartEvent, "");
		if (this.preventDefault) {
			a.preventDefault();
		}
	},
	handleGestureEndEvent: function (a) {
		debugMessage(kDebugTouchController_HandleGestureEndEvent, "");
		if (this.preventDefault) {
			a.preventDefault();
		}
	},
});
