var KNWebGLCoreAnimationWrapperProjectionTransformType = {
	Invalid: 0,
	Orthographic: 1,
	Perspective: 2,
	Custom: 3,
};
var KNWebGLCoreAnimationWrapperTextureDrawOptions = Class.create({
	initialize: function (a, b, c) {
		this.hidden = false;
		this.wantsBackFaceCulling = false;
		this.isBackground = false;
		this.isForeground = true;
		this.isMoving = true;
		this.isBlending = false;
		this.opacity = 1;
		this.textureInfo = a;
		this.effectDuration = b;
		this.baseTransform = c;
	},
});
var KNWebGLCoreAnimationWrapperProgram = Class.create({
	initialize: function (a) {
		this.name = "CoreAnimationWrapperBasedEffect";
		this.effect = a.effect;
		this.textures = a.textures;
		this.data = {
			name: this.name,
			programNames: [],
			effect: this.effect,
			textures: this.textures,
		};
	},
});
var KNWebGLCoreAnimationWrapper = Class.create({
	initialize: function (a) {
		this.gl = a;
		this.setupWithContext();
	},
	setupWithContext: function () {
		this.animParameterGroup = new KNAnimParameterGroup("timingFunction");
	},
	renderFrameWithContext: function (h, s, G) {
		var m = this.gl;
		var t = this.animParameterGroup;
		var e = G.textureInfo;
		var H = e.textureRect;
		var I = e.initialState;
		var V = G.effectDuration;
		var d = G.baseTransform;
		var a = G.percent;
		var k = G.isBlending;
		var J = { x: H.size.width / 2, y: H.size.height / 2 };
		var T = 0;
		var S = 0;
		var B = 0;
		var A = 0;
		var F = 0;
		var E = 0;
		var M = 1;
		var K = 1;
		var x = 1;
		var w = 1;
		var P = false;
		var C = 0;
		var o = 0;
		var L = 1;
		var Q = 1;
		var z = 0;
		var y = e.texture;
		var n;
		var l = e.animations;
		var U = l[0].animations;
		for (var O = 0, q = U.length; O < q; O++) {
			var W = U[O];
			var p = W.property;
			var u = W.from;
			var f = W.to;
			var g = a;
			var D = W.beginTime * 1000;
			var v = W.duration * 1000;
			if (W.timingFunction && W.timingFunction !== "Linear") {
				g = t.doubleForAnimationCurve(W.timingFunction, a);
			}
			switch (p) {
				case "transform.translation":
					T = u.pointX;
					S = u.pointY;
					B = f.pointX;
					A = f.pointY;
					F = (f.pointX - u.pointX) * g;
					E = (f.pointY - u.pointY) * g;
					break;
				case "transform.rotation.z":
					P = true;
					C = u.scalar;
					o = f.scalar;
					break;
				case "transform.scale.x":
					M = u.scalar;
					x = f.scalar;
					break;
				case "transform.scale.y":
					K = u.scalar;
					w = f.scalar;
					break;
				case "opacity":
					L = u.scalar;
					Q = f.scalar;
					if (V !== v) {
						var j = a * V;
						if (j < D) {
							z = 0;
						} else {
							if (j > D + v) {
								z = 1;
							} else {
								z = (j - D) / v;
							}
						}
						if (W.timingFunction && W.timingFunction !== "Linear") {
							z = t.doubleForAnimationCurve(W.timingFunction, z);
						}
					} else {
						z = g;
					}
					break;
				case "contents":
					n = e.toTexture;
					break;
				default:
					break;
			}
		}
		var N = I.hidden ? 0 : e.parentOpacity * I.opacity;
		if (L !== Q) {
			N = L + (Q - L) * z;
		}
		h.setGLFloat(N, kTSDGLShaderUniformOpacity);
		var c = WebGraphics.translateMatrix4(d, T, -S, 0);
		c = WebGraphics.translateMatrix4(c, F, -E, 0);
		var b = I.anchorPoint;
		if (b.pointX !== 0.5 || b.pointY !== 0.5) {
			J.x = b.pointX * H.size.width;
			J.y = (1 - b.pointY) * H.size.height;
		}
		c = WebGraphics.translateMatrix4(c, J.x, J.y, 0);
		var R = I.rotation;
		if (P) {
			if (C !== R) {
				R = C;
			}
			R = R + (o - C) * g;
		}
		if (R !== 0) {
			c = WebGraphics.rotateMatrix4AboutXYZ(c, -R, 0, 0, 1);
		}
		var r = I.scale;
		if (r !== 1) {
			c = WebGraphics.scaleMatrix4(c, r, r, 1);
		}
		if (M !== x || K !== w) {
			c = WebGraphics.scaleMatrix4(c, (x - M) * g + M, (w - K) * g + K, 1);
		}
		c = WebGraphics.translateMatrix4(c, -J.x, -J.y, 0);
		h.setMat4WithTransform3D(c, kTSDGLShaderUniformMVPMatrix);
		m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA);
		if (k) {
			m.activeTexture(m.TEXTURE1);
			m.bindTexture(m.TEXTURE_2D, n);
			m.activeTexture(m.TEXTURE0);
			m.bindTexture(m.TEXTURE_2D, y);
			h.setGLFloat(g, "mixFactor");
		} else {
			m.bindTexture(m.TEXTURE_2D, y);
		}
		s.drawWithShader(h, true);
	},
});
var KNWebGLCoreAnimationWrapperBasedEffect = Class.create({
	initialize: function (f, e, c, g, b, a, d, h, i, j) {
		this.renderer = f;
		this.gl = f.gl;
		this.program = e;
		this.slideRect = c;
		this.texture = g;
		this.frameRect = b;
		this.baseTransform = a;
		this.duration = d;
		this.direction = h;
		this.buildType = i;
		this.parentOpacity = j;
		this.animParameterGroup = new KNAnimParameterGroup("timingFunction");
		this.percentfinished = 0;
		this.prepareAnimationWithContext();
		this.animationWillBeginWithContext();
	},
	isOrthographicProjection: function () {
		return true;
	},
	prepareAnimationWithContext: function () {
		this.coreAnimationWrapper = this.renderer.coreAnimationWrapper;
		var a = (this.textureDrawOptions = new KNWebGLCoreAnimationWrapperTextureDrawOptions(
			this.texture,
			this.duration,
			this.baseTransform
		));
		a.isBlending = this.texture.toTexture ? true : false;
	},
	animationWillBeginWithContext: function () {
		var e = this.renderer;
		var d = this.gl;
		var a = this.frameRect;
		var g = CGSizeMake(2, 2);
		var f = this.texture;
		var i = (this.objectShader = new TSDGLShader(d));
		i.initWithContentsAndOpacityShader();
		i.setMat4WithTransform3D(this.baseTransform, kTSDGLShaderUniformMVPMatrix);
		i.setGLint(0, kTSDGLShaderUniformTexture2);
		i.setGLint(1, kTSDGLShaderUniformTexture);
		var h = this.texture.textureRect;
		var c = CGRectMake(0, 0, h.size.width, h.size.height);
		var b = (this.objectDataBuffer = new TSDGLDataBuffer(d));
		b.initWithVertexRect(c, TSDRectUnit, g, false, false);
	},
	drawFrame: function (f, n, g) {
		var l = this.renderer;
		var i = this.gl;
		var a = this.buildOut;
		var e = this.percentfinished;
		e += f / g;
		if (e >= 1) {
			e = 1;
			this.isCompleted = true;
		}
		this.percentfinished = e;
		i.blendFunc(i.ONE, i.ONE_MINUS_SRC_ALPHA);
		var h = this.texture;
		var d = h.initialState;
		var o = h.animations;
		var m = this.objectShader;
		var b = this.objectDataBuffer;
		if (h.animations.length > 0) {
			var k = e;
			var c = this.textureDrawOptions;
			c.percent = k;
			this.coreAnimationWrapper.renderFrameWithContext(m, b, c);
		} else {
			var j = h.initialState.hidden
				? 0
				: this.parentOpacity * h.initialState.opacity;
			m.setGLFloat(j, kTSDGLShaderUniformOpacity);
			i.blendFunc(i.ONE, i.ONE_MINUS_SRC_ALPHA);
			i.bindTexture(i.TEXTURE_2D, h.texture);
			b.drawWithShader(m, true);
		}
	},
});
