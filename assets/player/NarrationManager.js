var NarrationManager = Class.create({
	initialize: function (b) {
		this.movieSegments = b.movieSegments;
		this.duration = b.duration;
		this.eventTracks = b.eventTracks;
		this.currentNavigationEventIndex = 0;
		this.lastSceneIndex = 0;
		for (var c = 0, d = this.eventTracks.length; c < d; c++) {
			var a = this.eventTracks[c];
			if (a.type === "navigation") {
				this.navigationEvents = a.events;
			} else {
				if (a.type === "movie") {
					this.movieEvents = a.events;
				} else {
					if (a.type === "pause") {
						this.pauseEvents = a.events;
					}
				}
			}
		}
	},
	start: function () {
		var a = new Audio();
		a.src = "../" + this.movieSegments[0].url;
		Event.observe(a, "playing", this.handleAudioDidStart.bind(this));
		Event.observe(a, "ended", this.handleAudioDidEnd.bind(this, 0));
		a.play();
	},
	handleAudioDidStart: function () {
		setTimeout(this.navigate(this.navigationEvents[0], true), 100);
	},
	handleAudioDidEnd: function (b) {
		var a = b + 1;
		if (this.movieSegments[a]) {
			var c = new Audio();
			c.src = "../" + this.movieSegments[a].url;
			c.play();
			Event.stopObserving(c, "ended");
			Event.observe(c, "ended", this.handleAudioDidEnd.bind(this, a));
		}
	},
	navigate: function (a, h) {
		var l = this.sceneIndexFromNavigationEvent(a);
		if (a.animationPhase === "start") {
			var e = false;
			if (gShowController.script.loopSlideshow) {
				if (this.lastSceneIndex === gShowController.script.numScenes - 1) {
					if (l === 0) {
						e = true;
					}
				}
			} else {
				if (this.lastSceneIndex + 1 === l) {
					e = true;
				}
			}
			if (e) {
				if (gShowController.state === kShowControllerState_IdleAtInitialState) {
					gShowController.playCurrentScene();
				} else {
					if (gShowController.state === kShowControllerState_IdleAtFinalState) {
						gShowController.jumpToScene(this.lastSceneIndex, true);
					}
				}
			} else {
				var k = gShowController.scriptManager.slideIndexFromSceneIndex(l);
				var g = this.lastSceneIndex;
				var j = gShowController.script.events[g].hyperlinks;
				var m;
				var f;
				for (var d = 0, b = j.length; d < b; d++) {
					m = j[d];
					f = m.events[a.slide];
					if (f) {
						break;
					}
				}
				if (m) {
					gShowController.jumpToHyperlinkSlide(k, m);
				} else {
					gShowController.jumpToScene(l, false);
				}
			}
		} else {
			if (a.animationPhase === "none" && h == null) {
				gShowController.jumpToScene(l, false);
			}
		}
		var n = this.navigationEvents[this.currentNavigationEventIndex + 1];
		if (n == null) {
			return;
		}
		var c = n.startTime - a.startTime;
		setTimeout(this.navigate.bind(this, n), c * 1000);
		this.lastSceneIndex = l;
		this.currentNavigationEventIndex = this.currentNavigationEventIndex + 1;
	},
	handleCurrentSceneDidComplete: function (a) {
		gShowController.jumpToScene(a, false);
	},
	sceneIndexFromNavigationEvent: function (e) {
		var c = e.slide;
		var f = gShowController.script.slideList;
		var b = -1;
		for (var a = 0, d = f.length; a < d; a++) {
			if (f[a] === c) {
				b = a;
				break;
			}
		}
		var h = gShowController.scriptManager.sceneIndexFromSlideIndex(b);
		var g = e.eventIndex + h;
		return g;
	},
	slideIndexFromSlideId: function (b) {
		var d = gShowController.slideList;
		var e = -1;
		for (var a = 0, c = d.length; a < c; a++) {
			if (d[a] === b) {
				e = a;
				break;
			}
		}
		return e;
	},
});
