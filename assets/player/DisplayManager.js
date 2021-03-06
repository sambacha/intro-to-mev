var kStageSizeDidChangeEvent = "DisplayManager:StageSizeDidChangeEvent";
var kTimeoutValueForCursor = 1000;
var DisplayManager = Class.create({
	initialize: function () {
		document.observe(
			kShowSizeDidChangeEvent,
			this.handleShowSizeDidChangeEvent.bind(this)
		);
		document.observe(
			kOrientationChangedEvent,
			this.handleOrientationDidChangeEvent.bind(this)
		);
		this.body = document.getElementById("body");
		this.stageArea = document.getElementById("stageArea");
		this.stage = document.getElementById("stage");
		this.hyperlinkPlane = document.getElementById("hyperlinkPlane");
		this.waitingIndicator = document.getElementById("waitingIndicator");
		this.waitingIndicatorTimeout = null;
		this.orientation = kOrientationUnknown;
		this.showWidth = 0;
		this.showHeight = 0;
		this.stageAreaWidth = 0;
		this.stageAreaHeight = 0;
		this.stageAreaTop = 0;
		this.stageAreaLeft = 0;
		this.usableDisplayWidth = 0;
		this.usableDisplayHeight = 0;
		this.inLaunchMode = true;
		this.initialAddressBarScrollPerformed = false;
		this.updateUsableDisplayArea();
		this.positionWaitingIndicator();
		this.showWaitingIndicator();
		this.hyperlinksOnly = false;
		this.hasCacheEverGoneOverPixelLimit = false;
		this.hhasStageEverGoneOverPixelLimit = false;
		this.cacheHighWaterMark = 0;
		this.stageHighWaterMark = 0;
		Event.observe(this.body, "mousemove", this.handleMouseMove.bind(this));
		this.lastMouseX = -1;
		this.lastMouseY = -1;
		this.cursorTimeout = null;
		this.setTimeoutForCursor();
	},
	setHyperlinksOnlyMode: function () {
		this.hyperlinksOnly = true;
	},
	handleMouseMove: function (a) {
		a = a || window.event;
		var b =
			Math.abs(this.lastMouseX - a.clientX) +
			Math.abs(this.lastMouseY - a.clientY);
		if (b > 10) {
			if (this.cursorIsShowing === false) {
				this.showCursor();
			} else {
				if (!this.navigatorIsShowing) {
					this.setTimeoutForCursor();
				}
			}
		} else {
			if (!this.navigatorIsShowing) {
				this.setTimeoutForCursor();
			}
		}
		this.lastMouseX = a.clientX;
		this.lastMouseY = a.clientY;
	},
	handleShowSizeDidChangeEvent: function (a) {
		this.showWidth = a.memo.width;
		this.showHeight = a.memo.height;
		this.layoutDisplay();
	},
	handleOrientationDidChangeEvent: function (a) {
		this.orientation = a.memo.orientation;
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(
			this.handleOrientationDidChangeEvent_partTwo.bind(this),
			300
		);
	},
	handleOrientationDidChangeEvent_partTwo: function () {
		this.layoutDisplay();
		if (this.inLaunchMode === false) {
			this.showApplicableControls();
		}
	},
	showCursor: function () {
		if (this.inLaunchMode) {
			return;
		}
		this.body.style.cursor = "default";
		this.cursorIsShowing = true;
		this.setTimeoutForCursor();
	},
	hideCursor: function () {
		this.body.style.cursor = "none";
		this.cursorIsShowing = false;
	},
	setTimeoutForCursor: function () {
		if (this.cursorTimeout) {
			clearTimeout(this.cursorTimeout);
		}
		this.cursorTimeout = setTimeout(
			this.handleTimeoutForCursor.bind(this),
			kTimeoutValueForCursor
		);
	},
	clearTimeoutForCursor: function () {
		if (this.cursorTimeout) {
			clearTimeout(this.cursorTimeout);
		}
	},
	handleTimeoutForCursor: function () {
		this.hideCursor();
	},
	updateUsableDisplayArea: function () {
		this.usableDisplayWidth = window.innerWidth;
		this.usableDisplayHeight = window.innerHeight;
	},
	clearLaunchMode: function () {
		this.inLaunchMode = false;
		var a = this;
		runInNextEventLoop(this.showAll.bind(this));
	},
	positionWaitingIndicator: function () {
		var b = 110;
		var a = (this.usableDisplayWidth - b) / 2;
		var c = (this.usableDisplayHeight - b) / 2;
		setElementPosition(this.waitingIndicator, c, a, b, b);
	},
	hideWaitingIndicator: function () {
		this.waitingIndicator.style.display = "none";
	},
	showWaitingIndicator: function () {
		this.waitingIndicator.style.display = "block";
	},
	convertDisplayCoOrdsToShowCoOrds: function (d) {
		var b = {};
		var c = this.stageAreaLeft + this.stageAreaWidth;
		var a = this.stageAreaTop + this.stageAreaHeight;
		if (
			d.pointX < this.stageAreaLeft ||
			d.pointX > c ||
			d.pointY < this.stageAreaTop ||
			d.pointY > a
		) {
			b.pointX = -1;
			b.pointY = -1;
		} else {
			b.pointX =
				((d.pointX - this.stageAreaLeft) / this.stageAreaWidth) *
				this.showWidth;
			b.pointY =
				((d.pointY - this.stageAreaTop) / this.stageAreaHeight) *
				this.showHeight;
		}
		return b;
	},
	layoutDisplay: function () {
		this.updateUsableDisplayArea();
		var d = this.usableDisplayWidth;
		var e = this.usableDisplayHeight;
		if (!gShowController.isFullscreen) {
			if (d > this.showWidth || e > e) {
				d = this.showWidth;
				e = e;
			}
		}
		var f = scaleSizeWithinSize(this.showWidth, this.showHeight, d, e);
		this.stageAreaWidth = f.width;
		this.stageAreaHeight = f.height;
		this.stageAreaLeft = (this.usableDisplayWidth - this.stageAreaWidth) / 2;
		this.stageAreaTop = (e - this.stageAreaHeight) / 2;
		setElementPosition(
			this.stageArea,
			this.stageAreaTop,
			this.stageAreaLeft,
			this.stageAreaWidth,
			this.stageAreaHeight
		);
		var b = {
			x: 0,
			y: 0,
			width: this.usableDisplayWidth,
			height: this.stageAreaTop,
		};
		var g = {
			x: 0,
			y: this.stageAreaTop + this.stageAreaHeight,
			width: this.usableDisplayWidth,
			height:
				this.usableDisplayHeight - this.stageAreaTop - this.stageAreaHeight,
		};
		var c = {
			x: 0,
			y: this.stageAreaTop,
			width: this.stageAreaLeft,
			height: this.stageAreaHeight,
		};
		var a = {
			x: this.stageAreaLeft + this.stageAreaWidth,
			y: this.stageAreaTop,
			width: this.usableDisplayWidth - this.stageAreaWidth - c.width,
			height: this.stageAreaHeight,
		};
		this.positionWaitingIndicator();
		this.hideAddressBar();
		document.fire(kStageSizeDidChangeEvent, {
			left: this.stageAreaLeft,
			top: this.stageAreaTop,
			width: this.stageAreaWidth,
			height: this.stageAreaHeight,
		});
	},
	showApplicableControls: function () {
		this.hideAddressBar();
	},
	showAll: function () {
		this.hideWaitingIndicator();
		if (this.inLaunchMode === false) {
			this.showApplicableControls();
		}
		showElement(this.stageArea);
		showElement(this.hyperlinkPlane);
	},
	hideAddressBar: function () {
		if (this.inLaunchMode) {
			return;
		}
	},
});
