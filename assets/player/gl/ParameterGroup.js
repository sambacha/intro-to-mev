var KNAnimParameterGroup = Class.create({
	initialize: function (a) {
		this.parameterGroup = ParameterGroup[a];
		this.animationCurves = {};
	},
	doubleForKey: function (b) {
		var a = this.parameterGroup[b].dblValue;
		if (!a) {
			a = this.parameterGroup[b];
		}
		return a;
	},
	boolForKey: function (b) {
		var a = this.parameterGroup[b].dblValue;
		if (!a) {
			a = this.parameterGroup[b];
		}
		return a > 0;
	},
	doubleForAnimationCurve: function (b, c) {
		var d = this.pathForAnimationCurve(b);
		var a = d.yValueFromXValue(c);
		return a;
	},
	pathForAnimationCurve: function (b) {
		var a = this.animationCurves[b];
		if (!a) {
			var c = this.parameterGroup[b];
			a = new CubicBezierPath(c.controlPoints[0], c.controlPoints[1]);
			this.animationCurves[b] = a;
		}
		return a;
	},
});
var CubicBezierPath = Class.create({
	initialize: function (g, e) {
		var a = (this.cx = 3 * g.x);
		var f = (this.bx = 3 * (e.x - g.x) - a);
		var c = (this.ax = 1 - a - f);
		var h = (this.cy = 3 * g.y);
		var d = (this.by = 3 * (e.y - g.y) - h);
		var b = (this.ay = 1 - h - d);
		this.iteration = 5;
		this.epsilon = 0.0001;
	},
	bezierCurveX: function (a) {
		return a * (this.cx + a * (this.bx + a * this.ax));
	},
	bezierCurveY: function (a) {
		return a * (this.cy + a * (this.by + a * this.ay));
	},
	bezierCurveDerivativeX: function (a) {
		return this.cx + a * (2 * this.bx + 3 * this.ax * a);
	},
	solveXForT: function (d) {
		var f = this.epsilon;
		var c = d;
		var a;
		for (var b = 0, e = this.iteration; b < e; b++) {
			a = this.bezierCurveX(c) - d;
			if (Math.abs(a) < f) {
				break;
			}
			c = c - a / this.bezierCurveDerivativeX(c);
		}
		return c;
	},
	yValueFromXValue: function (a) {
		return this.bezierCurveY(this.solveXForT(a));
	},
});
var ParameterGroup = {
	Fireworks: {
		FireworkSizeMax: 0.3,
		FireworkDurationMax: 2,
		ParticleTrailsDitherMax: 2,
		SparkleStartTime: 0.5,
		TextOpacityEndTime: 0.6,
		ParticleTransparency: {
			dblValue: 0,
			controlPoints: [
				{ x: 1, y: 0 },
				{ x: 0.718446, y: 1 },
			],
		},
		TextOpacityTiming: {
			dblValue: 0,
			controlPoints: [
				{ x: 1, y: 0 },
				{ x: 0.825627, y: 1 },
			],
		},
		BloomBlurScale: 4,
		Gravity: 20,
		ParticleBurstTiming: {
			dblValue: 0,
			controlPoints: [
				{ x: 0, y: 1 },
				{ x: 0.551894, y: 0.993738 },
			],
		},
		ParticleSizeStart: 0.5,
		ParticleTrailsDitherAmount: 0.5,
		CenterBurstOpacity: 1,
		BloomPower: 3,
		ParticleSizeMax: 0.5,
		ParticleSizeMin: 3,
		CenterBurstScaleMin: 0.15,
		TrailsFadeOutMax: 0.1,
		CenterBurstScaleMax: 0.3,
		TrailsFadeOutMin: 0.03,
		TextOpacityBeginTime: 0.1,
		ParticleCount: 200,
		SparklePeriod: 13,
		ParticleColorRandomness: 0.09,
		FireworkSpeedMax: 1,
		FireworkDurationMin: 1,
		FireworkSizeMin: 0.15,
		ParticleLifeSpanMinDuration: 0.5,
		FireworkSpeedMin: 0.8,
		FireworksCount: 2,
	},
	timingFunction: {
		EaseIn: {
			controlPoints: [
				{ x: 0.42, y: 0 },
				{ x: 1, y: 1 },
			],
		},
		EaseOut: {
			controlPoints: [
				{ x: 0, y: 0 },
				{ x: 0.58, y: 1 },
			],
		},
		EaseInEaseOut: {
			controlPoints: [
				{ x: 0.42, y: 0 },
				{ x: 0.58, y: 1 },
			],
		},
	},
};
