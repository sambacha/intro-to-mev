var kOrientationChangedEvent = "OrientationController:OrientationChangedEvent";
var OrientationController = Class.create({
	initialize: function () {
		var a = navigator.platform;
		if (a === "iPad" || a === "iPhone" || a === "iPod") {
			Event.observe(
				window,
				"orientationchange",
				this.handleDeviceOrientationChangeEvent.bind(this)
			);
			this.handleDeviceOrientationChangeEvent();
		}
		this.orientation = kOrientationUnknown;
	},
	handleDeviceOrientationChangeEvent: function (b) {
		var c = window.orientation;
		var a = kOrientationUnknown;
		if (c === 90 || c === -90) {
			a = kOrientationLandscape;
		} else {
			a = kOrientationPortrait;
		}
		this.changeOrientation(a);
	},
	changeOrientation: function (a) {
		this.orientation = a;
		document.fire(kOrientationChangedEvent, { orientation: this.orientation });
	},
});
