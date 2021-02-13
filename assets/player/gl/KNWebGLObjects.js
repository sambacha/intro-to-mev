var kShaderUniformGravity = "Gravity";
var kShaderUniformMaskTexture = "MaskTexture";
var kShaderUniformNoiseAmount = "NoiseAmount";
var kShaderUniformNoiseMax = "NoiseMax";
var kShaderUniformNoiseSeed = "NoiseSeed";
var kShaderUniformParticleBurstTiming = "ParticleBurstTiming";
var kShaderUniformPreviousParticleBurstTiming = "PreviousParticleBurstTiming";
var kShaderUniformPreviousPercent = "PreviousPercent";
var kShaderUniformShouldSparkle = "ShouldSparkle";
var kShaderUniformSparklePeriod = "SparklePeriod";
var kShaderUniformSparkleStartTime = "SparkleStartTime";
var kShaderUniformStartScale = "StartScale";
var kShimmerUniformParticleScalePercent = "ParticleScalePercent";
var kShimmerUniformRotationMatrix = "RotationMatrix";
var KNSparkleMaxParticleLife = 0.667;
var KNWebGLRenderer = Class.create({
	initialize: function (c) {
		var a = (this.canvas = c.canvas);
		this.canvasId = c.canvasId;
		this.textureAssets = c.textureAssets;
		this.durationMax = c.overallEndTime * 1000;
		this.glPrograms = [];
		this.elapsed = 0;
		var b = (this.gl =
			a.getContext("webgl") || a.getContext("experimental-webgl"));
		if (!b) {
			this.noGL = true;
			return;
		}
		this.animationStarted = false;
		b.viewportWidth = a.width;
		b.viewportHeight = a.height;
		this.initMVPMatrix();
		this.coreAnimationWrapper = new KNWebGLCoreAnimationWrapper(b);
	},
	initMVPMatrix: function () {
		var i = this.gl;
		var a = i.viewportWidth;
		var e = i.viewportHeight;
		var c = 20 * (Math.PI / 180);
		var b = e / (2 * Math.tan(c / 2));
		var d = b - a * 1.5;
		var f = b + a * 15;
		this.slideProjectionMatrix = WebGraphics.makePerspectiveMatrix4(
			20,
			a / e,
			Math.max(1, d),
			f
		);
		var g = WebGraphics.translateMatrix4(
			WebGraphics.createMatrix4(),
			-a / 2,
			-e / 2,
			-b
		);
		this.slideProjectionMatrix = WebGraphics.multiplyMatrix4(
			this.slideProjectionMatrix,
			g
		);
		this.slideOrthoMatrix = WebGraphics.makeOrthoMatrix4(0, a, 0, e, -1, 1);
	},
	setupTexture: function (e) {
		var a = [];
		this.textureInfoFromEffect(
			e.kpfLayer,
			e.name,
			{ pointX: 0, pointY: 0 },
			e.baseLayer.initialState.opacity,
			a
		);
		for (var d = 0, f = a.length; d < f; d++) {
			var h = a[d].textureId;
			var g = this.textureAssets[h];
			a[d].texture = KNWebGLUtil.createTexture(this.gl, g);
			var c = a[d].toTextureId;
			if (c) {
				var b = this.textureAssets[c];
				a[d].toTexture = KNWebGLUtil.createTexture(this.gl, b);
			}
		}
		return a;
	},
	textureInfoFromEffect: function (c, b, f, m, j) {
		var g = {};
		g.offset = {
			pointX: f.pointX + c.bounds.offset.pointX,
			pointY: f.pointY + c.bounds.offset.pointY,
		};
		g.parentOpacity = m * c.initialState.opacity;
		if (c.textureId) {
			g.textureId = c.textureId;
			g.width = c.bounds.width;
			g.height = c.bounds.height;
			g.initialState = c.initialState;
			g.hasHighlightedBulletAnimation = c.hasHighlightedBulletAnimation;
			g.texturedRectangle = c.texturedRectangle;
			var a = c.animations;
			if (a && a.length > 0) {
				var l = a[0];
				if (l.property === "contents") {
					g.toTextureId = l.to.texture;
				} else {
					if (!l.property) {
						var k = l.animations;
						if (k) {
							for (var h = 0, d = k.length; h < d; h++) {
								var e = k[h];
								if (e.property === "contents") {
									g.toTextureId = e.to.texture;
									break;
								}
							}
						}
					}
				}
			}
			g.animations = a;
			g.textureRect = {
				origin: { x: g.offset.pointX, y: g.offset.pointY },
				size: { width: g.width, height: g.height },
			};
			j.push(g);
		} else {
			for (var h = 0, d = c.layers.length; h < d; h++) {
				this.textureInfoFromEffect(
					c.layers[h],
					b,
					g.offset,
					g.parentOpacity,
					j
				);
			}
		}
	},
	draw: function (c) {
		var d = { effect: c, textures: this.setupTexture(c) };
		var b = c.type;
		var a;
		if (b === "transition") {
			switch (c.name) {
				case "apple:wipe-iris":
					a = new KNWebGLTransitionIris(this, d);
					break;
				case "com.apple.iWork.Keynote.BUKTwist":
					a = new KNWebGLTransitionTwist(this, d);
					break;
				case "com.apple.iWork.Keynote.KLNColorPlanes":
					a = new KNWebGLTransitionColorPlanes(this, d);
					break;
				case "com.apple.iWork.Keynote.BUKFlop":
					a = new KNWebGLTransitionFlop(this, d);
					break;
				case "com.apple.iWork.Keynote.KLNConfetti":
					a = new KNWebGLTransitionConfetti(this, d);
					break;
				case "apple:magic-move-implied-motion-path":
					a = new KNWebGLTransitionMagicMove(this, d);
					break;
				case "apple:ca-text-shimmer":
					a = new KNWebGLTransitionShimmer(this, d);
					break;
				case "apple:ca-text-sparkle":
					a = new KNWebGLTransitionSparkle(this, d);
					break;
				default:
					a = new KNWebGLDissolve(this, d);
					break;
			}
		} else {
			if (b === "buildIn" || b === "buildOut") {
				switch (c.name) {
					case "apple:wipe-iris":
						a = new KNWebGLBuildIris(this, d);
						break;
					case "com.apple.iWork.Keynote.BUKAnvil":
						a = new KNWebGLBuildAnvil(this, d);
						break;
					case "com.apple.iWork.Keynote.KLNFlame":
						a = new KNWebGLBuildFlame(this, d);
						break;
					case "com.apple.iWork.Keynote.KNFireworks":
						a = new KNWebGLBuildFireworks(this, d);
						break;
					case "com.apple.iWork.Keynote.KLNConfetti":
						a = new KNWebGLBuildConfetti(this, d);
						break;
					case "com.apple.iWork.Keynote.KLNDiffuse":
						a = new KNWebGLBuildDiffuse(this, d);
						break;
					case "com.apple.iWork.Keynote.KLNShimmer":
						a = new KNWebGLBuildShimmer(this, d);
						break;
					case "com.apple.iWork.Keynote.KLNSparkle":
						a = new KNWebGLBuildSparkle(this, d);
						break;
					default:
						a = new KNWebGLDissolve(this, d);
						break;
				}
			} else {
				if (b === "smartBuild") {
					switch (c.name) {
						case "apple:gallery-dissolve":
							a = new KNWebGLContents(this, d);
							break;
						default:
							a = new KNWebGLDissolve(this, d);
							break;
					}
				}
			}
		}
		this.removeProgram(c.objectID);
		this.glPrograms.push(a);
	},
	animate: function () {
		var f = new Date();
		var h = 0;
		if (this.time) {
			var b = f.getTime();
			h = b - this.time;
			this.time = b;
		} else {
			h = 0;
			this.time = f.getTime();
		}
		this.elapsed += h;
		var e = this.glPrograms;
		var d = e.length;
		if (this.elapsed <= this.durationMax) {
			this.animationRequest = window.requestAnimFrame(this.animate.bind(this));
		} else {
			for (var c = 0; c < d; c++) {
				var a = e[c];
				a.isCompleted = true;
			}
		}
		var g = this.gl;
		g.clearColor(0, 0, 0, 0);
		g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
		for (var c = 0; c < d; c++) {
			var a = e[c];
			a.drawFrame(h, this.elapsed, a.duration);
		}
	},
	removeProgram: function (d) {
		var b = this.glPrograms;
		var a = b.length;
		while (a--) {
			var c = b[a];
			if (c.effect.objectID === d) {
				b.splice(a, 1);
			}
		}
	},
	resize: function (a) {
		var d = this.gl;
		var b = a.width;
		var c = a.height;
		if (d.viewportWidth !== b || d.viewportHeight !== c) {
			d.viewport(0, 0, b, c);
			d.viewportWidth = b;
			d.viewportHeight = c;
		}
	},
});
var KNWebGLProgram = Class.create({
	initialize: function (d, a) {
		this.renderer = d;
		this.gl = d.gl;
		this.textures = a.textures;
		var c = (this.effect = a.effect);
		var b = (this.type = c.type);
		this.direction = c.attributes ? c.attributes.direction : null;
		this.duration = c.duration * 1000;
		this.buildOut = b === "buildOut";
		this.buildIn = b === "buildIn";
		this.program = {};
		this.isCompleted = false;
		if (a.programNames) {
			this.setupProgram(a);
		}
	},
	setupProgram: function (c) {
		var e = this.gl;
		for (var b = 0, d = c.programNames.length; b < d; b++) {
			var a = c.programNames[b];
			this.program[a] = KNWebGLUtil.setupProgram(e, a);
		}
		e.enable(e.BLEND);
		e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA);
	},
});
var KNWebGLContents = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, b) {
		this.programData = {
			name: "contents",
			effect: b.effect,
			textures: b.textures,
		};
		$super(a, this.programData);
		this.percentfinished = 0;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var e = this.renderer;
		var g = this.gl;
		var b = this.textures[0].textureRect;
		var a = CGRectMake(0, 0, b.size.width, b.size.height);
		var f = CGSizeMake(2, 2);
		var d = (this.contentsShader = new TSDGLShader(g));
		d.initWithContentsShader();
		d.setMat4WithTransform3D(
			e.slideProjectionMatrix,
			kTSDGLShaderUniformMVPMatrix
		);
		d.setGLint(0, kTSDGLShaderUniformTexture2);
		d.setGLint(1, kTSDGLShaderUniformTexture);
		var c = (this.contentsDataBuffer = new TSDGLDataBuffer(g));
		c.initWithVertexRect(a, TSDRectUnit, f, false, false);
	},
	drawFrame: function (f, a, d) {
		var c = this.renderer;
		var e = this.gl;
		var b = this.percentfinished;
		b += f / d;
		if (b >= 1) {
			b = 1;
			this.isCompleted = true;
		}
		this.percentfinished = b;
		this.p_drawContents(b);
	},
	p_drawContents: function (c) {
		var f = this.gl;
		var a = this.textures;
		var e = a[0].texture;
		var b = a[1].texture;
		var d = TSUSineMap(c);
		if (c >= 1) {
			d = 1;
		}
		f.activeTexture(f.TEXTURE1);
		f.bindTexture(f.TEXTURE_2D, e);
		f.activeTexture(f.TEXTURE0);
		f.bindTexture(f.TEXTURE_2D, b);
		this.contentsShader.setGLFloat(d, "mixFactor");
		f.blendFunc(f.ONE, f.ONE_MINUS_SRC_ALPHA);
		this.contentsDataBuffer.drawWithShader(this.contentsShader, true);
	},
});
var KNWebGLDrawable = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, b) {
		this.programData = {
			name: "WebDrawable",
			programNames: ["defaultTextureAndOpacity"],
			effect: b.effect,
			textures: b.textures,
		};
		$super(a, this.programData);
		this.Opacity = 1;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var h = this.renderer;
		var g = this.gl;
		var f = this.program.defaultTextureAndOpacity;
		var j = f.uniforms;
		var a = f.attribs;
		var e = this.textures[0];
		g.useProgram(f.shaderProgram);
		g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
		var c = (this.textureCoordinateBuffer = g.createBuffer());
		var d = (this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1]);
		g.bindBuffer(g.ARRAY_BUFFER, c);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
		var i = (this.positionBuffer = g.createBuffer());
		var b = (this.boxPosition = [
			0,
			0,
			0,
			0,
			e.height,
			0,
			e.width,
			0,
			0,
			e.width,
			e.height,
			0,
		]);
		g.bindBuffer(g.ARRAY_BUFFER, i);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
		this.MVPMatrix = WebGraphics.translateMatrix4(
			h.slideProjectionMatrix,
			e.offset.pointX,
			g.viewportHeight - e.offset.pointY - e.height,
			0
		);
	},
	drawFrame: function () {
		var e = this.renderer;
		var g = this.gl;
		var c = this.program.defaultTextureAndOpacity;
		var b = c.uniforms;
		var f = c.attribs;
		var a = this.textures;
		var d = a[0].texture;
		g.useProgram(c.shaderProgram);
		g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinateBuffer);
		g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
		g.enableVertexAttribArray(f.TexCoord);
		g.bindBuffer(g.ARRAY_BUFFER, this.positionBuffer);
		g.vertexAttribPointer(f.Position, 3, g.FLOAT, false, 0, 0);
		g.enableVertexAttribArray(f.Position);
		g.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
		g.uniform1f(b.Opacity, this.Opacity);
		g.activeTexture(g.TEXTURE0);
		g.uniform1i(b.Texture, 0);
		g.bindTexture(g.TEXTURE_2D, d);
		g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
	},
});
var KNWebGLFramebufferDrawable = Class.create(KNWebGLProgram, {
	initialize: function ($super, d, f) {
		var e = d.gl;
		var a = (this.frameRect = f.frameRect);
		var c = (this.texture = this.createFramebufferTexture(e, a));
		this.buffer = this.createFramebuffer(e, c);
		var b = {
			width: a.size.width,
			height: a.size.height,
			offset: { pointX: 0, pointY: 0 },
			texture: c,
		};
		this.programData = {
			name: "FramebufferDrawable",
			programNames: ["defaultTexture"],
			effect: f.effect,
			textures: [b],
		};
		$super(d, this.programData);
		this.drawableFrame = f.drawableFrame;
		this.animationWillBeginWithContext();
	},
	createFramebufferTexture: function (c, b) {
		var a = c.createTexture();
		c.bindTexture(c.TEXTURE_2D, a);
		c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, false);
		c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
		c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
		c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
		c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
		c.texImage2D(
			c.TEXTURE_2D,
			0,
			c.RGBA,
			b.size.width,
			b.size.height,
			0,
			c.RGBA,
			c.UNSIGNED_BYTE,
			null
		);
		c.bindTexture(c.TEXTURE_2D, null);
		return a;
	},
	createFramebuffer: function (c, b) {
		var a = c.createFramebuffer();
		c.bindFramebuffer(c.FRAMEBUFFER, a);
		c.framebufferTexture2D(
			c.FRAMEBUFFER,
			c.COLOR_ATTACHMENT0,
			c.TEXTURE_2D,
			b,
			0
		);
		return a;
	},
	animationWillBeginWithContext: function () {
		var h = this.renderer;
		var g = this.gl;
		var f = this.program.defaultTexture;
		var j = f.uniforms;
		var a = f.attribs;
		var e = this.textures[0];
		g.useProgram(f.shaderProgram);
		g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
		var c = (this.textureCoordinateBuffer = g.createBuffer());
		var d = (this.textureCoordinates = [0, 1, 0, 0, 1, 1, 1, 0]);
		g.bindBuffer(g.ARRAY_BUFFER, c);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
		var i = (this.positionBuffer = g.createBuffer());
		var b = (this.boxPosition = [
			0,
			0,
			0,
			0,
			e.height,
			0,
			e.width,
			0,
			0,
			e.width,
			e.height,
			0,
		]);
		g.bindBuffer(g.ARRAY_BUFFER, i);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
		this.MVPMatrix = WebGraphics.translateMatrix4(
			h.slideProjectionMatrix,
			e.offset.pointX,
			g.viewportHeight - e.offset.pointY - e.height,
			0
		);
	},
	drawFrame: function () {
		var e = this.renderer;
		var g = this.gl;
		var c = this.program.defaultTexture;
		var b = c.uniforms;
		var f = c.attribs;
		var a = this.textures;
		var d = a[0].texture;
		g.useProgram(c.shaderProgram);
		g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinateBuffer);
		g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
		g.enableVertexAttribArray(f.TexCoord);
		g.bindBuffer(g.ARRAY_BUFFER, this.positionBuffer);
		g.vertexAttribPointer(f.Position, 3, g.FLOAT, false, 0, 0);
		g.enableVertexAttribArray(f.Position);
		g.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
		g.activeTexture(g.TEXTURE0);
		g.uniform1i(b.Texture, 0);
		g.bindTexture(g.TEXTURE_2D, d);
		g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
	},
});
var KNWebGLDissolve = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, b) {
		this.programData = {
			name: "dissolve",
			programNames: ["defaultTextureAndOpacity"],
			effect: b.effect,
			textures: b.textures,
		};
		$super(a, this.programData);
		this.percentfinished = 0;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var h = this.renderer;
		var g = this.gl;
		var f = this.program.defaultTextureAndOpacity;
		var j = f.uniforms;
		var a = f.attribs;
		var e = this.textures[0];
		g.useProgram(f.shaderProgram);
		g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
		var c = (this.textureCoordinateBuffer = g.createBuffer());
		var d = (this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1]);
		g.bindBuffer(g.ARRAY_BUFFER, c);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
		var i = (this.positionBuffer = g.createBuffer());
		var b = (this.boxPosition = [
			0,
			0,
			0,
			0,
			e.height,
			0,
			e.width,
			0,
			0,
			e.width,
			e.height,
			0,
		]);
		g.bindBuffer(g.ARRAY_BUFFER, i);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
		this.MVPMatrix = WebGraphics.translateMatrix4(
			h.slideProjectionMatrix,
			e.offset.pointX,
			g.viewportHeight - (e.offset.pointY + e.height),
			0
		);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (e, a, d) {
		var b = this.percentfinished;
		b += e / d;
		b > 1 ? (b = 1) : 0;
		var c = TSUSineMap(b);
		if (b === 1) {
			c = 1;
		}
		if (this.buildOut) {
			c = 1 - c;
		}
		this.percentfinished = b;
		this.percentAlpha = c;
		this.draw();
	},
	draw: function () {
		var f = this.renderer;
		var h = this.gl;
		var c = this.program.defaultTextureAndOpacity;
		var b = c.uniforms;
		var g = c.attribs;
		var a = this.textures;
		var e = a[0].texture;
		var d;
		if (a.length > 1) {
			d = a[1].texture;
		}
		h.useProgram(c.shaderProgram);
		h.blendFunc(h.ONE, h.ONE_MINUS_SRC_ALPHA);
		h.bindBuffer(h.ARRAY_BUFFER, this.textureCoordinateBuffer);
		h.vertexAttribPointer(g.TexCoord, 2, h.FLOAT, false, 0, 0);
		h.enableVertexAttribArray(g.TexCoord);
		h.bindBuffer(h.ARRAY_BUFFER, this.positionBuffer);
		h.vertexAttribPointer(g.Position, 3, h.FLOAT, false, 0, 0);
		h.enableVertexAttribArray(g.Position);
		h.uniformMatrix4fv(b.MVPMatrix, false, this.MVPMatrix);
		h.activeTexture(h.TEXTURE0);
		h.uniform1i(b.Texture, 0);
		if (d) {
			h.bindTexture(h.TEXTURE_2D, d);
			h.uniform1f(b.Opacity, 1);
			h.drawArrays(h.TRIANGLE_STRIP, 0, 4);
		}
		h.bindTexture(h.TEXTURE_2D, e);
		h.uniform1f(b.Opacity, this.percentAlpha);
		h.drawArrays(h.TRIANGLE_STRIP, 0, 4);
	},
});
var KNWebGLTransitionIris = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, c) {
		this.programData = {
			name: "apple:wipe-iris",
			programNames: ["iris"],
			effect: c.effect,
			textures: c.textures,
		};
		$super(a, this.programData);
		var b = this.direction;
		var e = b === KNDirection.KNDirectionOut;
		var d = this.buildOut;
		if ((d && e) || (!d && !e)) {
			this.mix = 0;
			this.percentfinished = 1;
		} else {
			this.mix = 1;
			this.percentfinished = 0;
		}
		this.percentAlpha = 0;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var h = this.renderer;
		var g = this.gl;
		var f = this.program.iris;
		var a = f.attribs;
		var j = f.uniforms;
		var e = this.textures[0];
		g.useProgram(f.shaderProgram);
		g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
		this.scale = e.width / e.height;
		var c = (this.textureCoordinatesBuffer = g.createBuffer());
		var d = (this.textureCoordinates = [0, 0, 0, 1, 1, 0, 1, 1]);
		g.bindBuffer(g.ARRAY_BUFFER, c);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(d), g.STATIC_DRAW);
		var i = (this.positionBuffer = g.createBuffer());
		var b = (this.boxPosition = [
			0,
			0,
			0,
			0,
			e.height,
			0,
			e.width,
			0,
			0,
			e.width,
			e.height,
			0,
		]);
		g.bindBuffer(g.ARRAY_BUFFER, i);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(b), g.STATIC_DRAW);
		this.MVPMatrix = WebGraphics.translateMatrix4(
			h.slideProjectionMatrix,
			e.offset.pointX,
			g.viewportHeight - (e.offset.pointY + e.height),
			0
		);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (g, a, d) {
		var f = this.buildOut;
		var e = this.direction === KNDirection.KNDirectionOut;
		var b = this.percentfinished;
		if ((f && e) || (!f && !e)) {
			b -= g / d;
			b < 0 ? (b = 0) : 0;
		} else {
			b += g / d;
			b > 1 ? (b = 1) : 0;
		}
		var c = TSUSineMap(b);
		if (b === 1) {
			c = 1;
		}
		if (f) {
			c = 1 - c;
		}
		this.percentAlpha = c;
		this.percentfinished = b;
		this.draw();
	},
	draw: function () {
		var f = this.renderer;
		var e = this.gl;
		var d = this.program.iris;
		var a = d.attribs;
		var h = d.uniforms;
		var i = this.textures;
		var g = i[0].texture;
		var c = i[0];
		var j;
		var b = this.scale;
		if (i.length > 1) {
			j = i[1].texture;
		}
		e.useProgram(d.shaderProgram);
		e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA);
		e.bindBuffer(e.ARRAY_BUFFER, this.textureCoordinatesBuffer);
		e.vertexAttribPointer(a.TexCoord, 2, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(a.TexCoord);
		e.bindBuffer(e.ARRAY_BUFFER, this.positionBuffer);
		e.vertexAttribPointer(a.Position, 3, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(a.Position);
		e.uniformMatrix4fv(h.MVPMatrix, false, this.MVPMatrix);
		e.activeTexture(e.TEXTURE0);
		e.uniform1i(h.Texture, 0);
		e.uniform1f(h.Opacity, 1);
		if (j) {
			e.bindTexture(e.TEXTURE_2D, j);
			e.uniform1f(h.PercentForAlpha, 0);
			e.uniform1f(h.Scale, b);
			e.uniform1f(h.Mix, 0);
			e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
		}
		e.bindTexture(e.TEXTURE_2D, g);
		e.uniform1f(h.PercentForAlpha, this.percentAlpha);
		e.uniform1f(h.Scale, b);
		e.uniform1f(h.Mix, this.mix);
		e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
	},
});
var KNWebGLBuildIris = Class.create(KNWebGLProgram, {
	initialize: function ($super, j, d) {
		var l = d.effect;
		this.programData = {
			name: "apple:wipe-iris",
			programNames: ["iris"],
			effect: l,
			textures: d.textures,
		};
		$super(j, this.programData);
		var k = this.direction;
		var a = k === KNDirection.KNDirectionOut;
		var b = this.buildOut;
		if ((b && a) || (!b && !a)) {
			this.mix = 0;
			this.percentfinished = 1;
		} else {
			this.mix = 1;
			this.percentfinished = 0;
		}
		this.percentAlpha = 0;
		this.drawableObjects = [];
		for (var e = 0, c = this.textures.length; e < c; e++) {
			var h = d.textures[e];
			var g = { effect: l, textures: [h] };
			var f = new KNWebGLDrawable(j, g);
			this.drawableObjects.push(f);
		}
		this.parentOpacity = l.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var k = this.renderer;
		var o = this.gl;
		var d = this.program.iris;
		var g = d.attribs;
		var r = d.uniforms;
		o.useProgram(d.shaderProgram);
		o.blendFunc(o.ONE, o.ONE_MINUS_SRC_ALPHA);
		var m = o.createBuffer();
		var b = [0, 0, 0, 1, 1, 0, 1, 1];
		o.bindBuffer(o.ARRAY_BUFFER, m);
		o.bufferData(o.ARRAY_BUFFER, new Float32Array(b), o.STATIC_DRAW);
		var l = o.viewportWidth;
		var a = o.viewportHeight;
		this.irisSystems = [];
		for (var p = 0, c = this.textures.length; p < c; p++) {
			var e = this.textures[p];
			var j = e.width;
			var h = e.height;
			var t = e.width / e.height;
			var n = o.createBuffer();
			var f = [0, 0, 0, 0, e.height, 0, e.width, 0, 0, e.width, e.height, 0];
			o.bindBuffer(o.ARRAY_BUFFER, n);
			o.bufferData(o.ARRAY_BUFFER, new Float32Array(f), o.STATIC_DRAW);
			var s = WebGraphics.translateMatrix4(
				k.slideProjectionMatrix,
				e.offset.pointX,
				o.viewportHeight - (e.offset.pointY + e.height),
				0
			);
			var q = e.initialState;
			if (q.rotation !== 0 || q.scale !== 1) {
				s = mvpMatrixWithInitialStateAffineTransform(q, s);
			}
			this.irisSystems[p] = {
				textureCoordinatesBuffer: m,
				positionBuffer: n,
				MVPMatrix: s,
				scale: t,
			};
		}
	},
	drawFrame: function (x, b, a) {
		var n = this.renderer;
		var q = this.gl;
		var t = this.buildOut;
		var u = this.direction === KNDirection.KNDirectionOut;
		var m = this.percentfinished;
		if ((t && u) || (!t && !u)) {
			m -= x / a;
			if (m <= 0) {
				m = 0;
				this.isCompleted = true;
			}
		} else {
			m += x / a;
			if (m >= 1) {
				m = 1;
				this.isCompleted = true;
			}
		}
		var B = TSUSineMap(m);
		if (m === 1) {
			B = 1;
		}
		if (t) {
			B = 1 - B;
		}
		this.percentAlpha = B;
		this.percentfinished = m;
		q.blendFunc(q.ONE, q.ONE_MINUS_SRC_ALPHA);
		for (var r = 0, d = this.textures.length; r < d; r++) {
			var k = this.textures[r];
			var s = k.initialState;
			var h = k.animations;
			if (k.hasHighlightedBulletAnimation) {
				if (!s.hidden) {
					var c;
					if (h.length > 0 && h[0].property === "opacity") {
						var e = h[0].from.scalar;
						var g = h[0].to.scalar;
						var j = g - e;
						if (t) {
							c = e + j * (1 - this.percentfinished);
						} else {
							c = e + j * this.percentfinished;
						}
					} else {
						c = k.initialState.opacity;
					}
					this.drawableObjects[r].Opacity = this.parentOpacity * c;
					this.drawableObjects[r].drawFrame();
				}
			} else {
				if (k.animations.length > 0) {
					if (this.isCompleted) {
						if (!t) {
							this.drawableObjects[r].Opacity =
								this.parentOpacity * k.initialState.opacity;
							this.drawableObjects[r].drawFrame();
						}
						continue;
					}
					var f = this.program.iris;
					var l = f.attribs;
					var w = f.uniforms;
					var v = this.irisSystems[r];
					var A = v.scale;
					q.useProgram(f.shaderProgram);
					var o = v.textureCoordinatesBuffer;
					q.bindBuffer(q.ARRAY_BUFFER, o);
					q.vertexAttribPointer(l.TexCoord, 2, q.FLOAT, false, 0, 0);
					q.enableVertexAttribArray(l.TexCoord);
					var p = v.positionBuffer;
					q.bindBuffer(q.ARRAY_BUFFER, p);
					q.vertexAttribPointer(l.Position, 3, q.FLOAT, false, 0, 0);
					q.enableVertexAttribArray(l.Position);
					var z = v.MVPMatrix;
					q.uniformMatrix4fv(w.MVPMatrix, false, z);
					q.activeTexture(q.TEXTURE0);
					q.uniform1i(w.Texture, 0);
					q.uniform1f(w.Opacity, this.parentOpacity * k.initialState.opacity);
					q.bindTexture(q.TEXTURE_2D, k.texture);
					q.uniform1f(w.PercentForAlpha, this.percentAlpha);
					q.uniform1f(w.Scale, A);
					q.uniform1f(w.Mix, this.mix);
					q.drawArrays(q.TRIANGLE_STRIP, 0, 4);
				} else {
					if (!k.initialState.hidden) {
						this.drawableObjects[r].Opacity =
							this.parentOpacity * k.initialState.opacity;
						this.drawableObjects[r].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLTransitionTwist = Class.create(KNWebGLProgram, {
	initialize: function ($super, f, c) {
		this.programData = {
			name: "com.apple.iWork.Keynote.BUKTwist",
			programNames: ["twist"],
			effect: c.effect,
			textures: c.textures,
		};
		$super(f, this.programData);
		var d = this.gl;
		this.direction = this.effect.attributes.direction;
		this.percentfinished = 0;
		var g = (this.mNumPoints = 24);
		var n = d.viewportWidth / (g - 1);
		var m = d.viewportHeight / (g - 1);
		var k = 1 / (g - 1);
		var i, h;
		var a = (this.TexCoords = []);
		var j = (this.PositionCoords = []);
		var l = (this.NormalCoords = []);
		for (h = 0; h < g; h++) {
			for (i = 0; i < g; i++) {
				var e = h * g + i;
				j[e * 3] = i * n;
				j[e * 3 + 1] = h * m;
				j[e * 3 + 2] = 0;
				a.push(i * k);
				a.push(h * k);
				l.push(0);
				l.push(0);
				l.push(-1);
			}
		}
		var e = 0;
		var b = (this.elementArray = []);
		for (h = 0; h < g - 1; h++) {
			for (i = 0; i < g; i++) {
				b[e++] = h * g + i;
				b[e++] = (h + 1) * g + i;
			}
		}
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var c = this.renderer;
		var e = this.gl;
		var b = this.program.twist;
		var a = b.uniforms;
		var d = b.attribs;
		e.enable(e.CULL_FACE);
		this.buffers = {};
		this.buffers.TexCoord = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, this.buffers.TexCoord);
		e.bufferData(
			e.ARRAY_BUFFER,
			new Float32Array(this.TexCoords),
			e.STATIC_DRAW
		);
		e.vertexAttribPointer(d.TexCoord, 2, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(d.TexCoord);
		this.buffers.Position = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, this.buffers.Position);
		e.bufferData(
			e.ARRAY_BUFFER,
			new Float32Array(this.PositionCoords),
			e.DYNAMIC_DRAW
		);
		e.vertexAttribPointer(d.Position, 3, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(d.Position);
		this.buffers.Normal = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, this.buffers.Normal);
		e.bufferData(
			e.ARRAY_BUFFER,
			new Float32Array(this.NormalCoords),
			e.DYNAMIC_DRAW
		);
		e.vertexAttribPointer(d.Normal, 3, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(d.Normal);
		this.MVPMatrix = c.slideProjectionMatrix;
		e.uniformMatrix4fv(a.MVPMatrix, false, this.MVPMatrix);
		this.AffineTransform = new Matrix3();
		this.AffineTransform.affineScale(1, -1);
		this.AffineTransform.affineTranslate(0, 1);
		this.AffineIdentity = new Matrix3();
		this.elementIndicesBuffer = e.createBuffer();
		e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.elementIndicesBuffer);
		e.bufferData(
			e.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(this.elementArray),
			e.STATIC_DRAW
		);
		e.activeTexture(e.TEXTURE0);
		e.uniform1i(a.Texture, 0);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (A, c, a) {
		var v = this.gl;
		var i = this.program.twist;
		var n = i.attribs;
		var s = this.percentfinished;
		s += A / a;
		s > 1 ? (s = 1) : 0;
		this.specularcolor = TSUSineMap(s * 2) * 0.5;
		var j, k;
		var p = v.viewportHeight / 2;
		var u = this.mNumPoints;
		var h = this.TexCoords;
		var e = this.PositionCoords;
		var b = this.NormalCoords;
		for (j = 0; j < u; j++) {
			for (k = 0; k < u; k++) {
				var g = j * u + k;
				var d = {};
				d.x = h[g * 2];
				d.y = h[g * 2 + 1];
				var w =
					-Math.PI *
					TwistFX(
						this.direction === KNDirection.KNDirectionLeftToRight
							? d.x
							: 1 - d.x,
						s
					);
				var m = {};
				m.y = p - p * (1 - d.y * 2) * Math.cos(w);
				m.z = p * (1 - d.y * 2) * Math.sin(w);
				e[g * 3 + 1] = m.y;
				e[g * 3 + 2] = m.z;
			}
		}
		for (j = 0; j < u; j++) {
			for (k = 0; k < u; k++) {
				var z = new vector3();
				var g = j * u + k;
				for (var o = 0; o < 4; o++) {
					var t = 0,
						r = 0,
						D = 0,
						C = 0;
					switch (o) {
						case 0:
							t = 1;
							C = 1;
							break;
						case 1:
							r = 1;
							D = -1;
							break;
						case 2:
							t = -1;
							C = -1;
							break;
						case 3:
							r = -1;
							D = 1;
						default:
							break;
					}
					if (
						k + t < 0 ||
						k + D < 0 ||
						j + r < 0 ||
						j + C < 0 ||
						k + t >= u ||
						k + D >= u ||
						j + r >= u ||
						j + C >= u
					) {
						continue;
					}
					var l = new vector3([e[g * 3], e[g * 3 + 1], e[g * 3 + 2]]);
					var B = new vector3([
						e[((j + r) * u + (k + t)) * 3],
						e[((j + r) * u + (k + t)) * 3 + 1],
						e[((j + r) * u + (k + t)) * 3 + 2],
					]);
					var f = new vector3([
						e[((j + C) * u + (k + D)) * 3],
						e[((j + C) * u + (k + D)) * 3 + 1],
						e[((j + C) * u + (k + D)) * 3 + 2],
					]);
					B.subtract(l);
					f.subtract(l);
					B.cross(f);
					z.add(B);
				}
				z.normalize();
				z.scale(-1);
				z = z.getArray();
				b[g * 3] = z[0];
				b[g * 3 + 1] = z[1];
				b[g * 3 + 2] = z[2];
			}
		}
		v.bindBuffer(v.ARRAY_BUFFER, this.buffers.Position);
		v.bufferData(v.ARRAY_BUFFER, new Float32Array(e), v.DYNAMIC_DRAW);
		v.vertexAttribPointer(n.Position, 3, v.FLOAT, false, 0, 0);
		v.bindBuffer(v.ARRAY_BUFFER, this.buffers.Normal);
		v.bufferData(v.ARRAY_BUFFER, new Float32Array(b), v.DYNAMIC_DRAW);
		v.vertexAttribPointer(n.Normal, 3, v.FLOAT, false, 0, 0);
		this.percentfinished = s;
		this.draw();
	},
	draw: function () {
		var g = this.renderer;
		var e = this.gl;
		var d = this.program.twist;
		var j = d.uniforms;
		var k = this.textures;
		var h = k[0].texture;
		var l = k[1].texture;
		var i = this.mNumPoints;
		var f = this.specularcolor;
		var a = this.AffineTransform.getColumnMajorFloat32Array();
		var b = this.AffineIdentity.getColumnMajorFloat32Array();
		var c = this.elementIndicesBuffer;
		if (!f) {
			f = 0;
		}
		e.uniform1f(j.SpecularColor, f);
		if (this.percentfinished < 0.5) {
			e.cullFace(e.BACK);
			e.bindTexture(e.TEXTURE_2D, h);
			e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, c);
			e.uniformMatrix3fv(j.TextureMatrix, false, a);
			e.uniform1f(j.FlipNormals, 1);
			for (y = 0; y < i - 1; y++) {
				e.drawElements(
					e.TRIANGLE_STRIP,
					i * 2,
					e.UNSIGNED_SHORT,
					y * i * 2 * 2
				);
			}
			e.cullFace(e.FRONT);
			e.bindTexture(e.TEXTURE_2D, l);
			e.uniformMatrix3fv(j.TextureMatrix, false, b);
			e.uniform1f(j.FlipNormals, -1);
			for (y = 0; y < i - 1; y++) {
				e.drawElements(
					e.TRIANGLE_STRIP,
					i * 2,
					e.UNSIGNED_SHORT,
					y * i * 2 * 2
				);
			}
		} else {
			e.cullFace(e.FRONT);
			e.bindTexture(e.TEXTURE_2D, l);
			e.uniformMatrix3fv(j.TextureMatrix, false, b);
			e.uniform1f(j.FlipNormals, -1);
			for (y = 0; y < i - 1; y++) {
				e.drawElements(
					e.TRIANGLE_STRIP,
					i * 2,
					e.UNSIGNED_SHORT,
					y * i * 2 * 2
				);
			}
			e.cullFace(e.BACK);
			e.bindTexture(e.TEXTURE_2D, h);
			e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, c);
			e.uniformMatrix3fv(j.TextureMatrix, false, a);
			e.uniform1f(j.SpecularColor, f);
			e.uniform1f(j.FlipNormals, 1);
			for (y = 0; y < i - 1; y++) {
				e.drawElements(
					e.TRIANGLE_STRIP,
					i * 2,
					e.UNSIGNED_SHORT,
					y * i * 2 * 2
				);
			}
		}
	},
});
var KNWebGLTransitionColorPlanes = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, c) {
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNColorPlanes",
			programNames: ["colorPlanes"],
			effect: c.effect,
			textures: c.textures,
		};
		$super(a, this.programData);
		var b = this.effect.attributes.direction;
		if (
			b !== KNDirection.KNDirectionLeftToRight &&
			b !== KNDirection.KNDirectionRightToLeft &&
			b !== KNDirection.KNDirectionTopToBottom &&
			b !== KNDirection.KNDirectionBottomToTop
		) {
			b = KNDirection.KNDirectionLeftToRight;
		}
		this.direction = b;
		this.mNumColors = 3;
		this.percentfinished = 0;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var f = this.renderer;
		var e = this.gl;
		var d = this.program.colorPlanes;
		var g = d.uniforms;
		var a = d.attribs;
		var c = this.textures[0];
		e.disable(e.CULL_FACE);
		e.blendFunc(e.ONE, e.ONE);
		var i = (this.buffers = {});
		i.TexCoord = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, i.TexCoord);
		var b = (this.TexCoords = [0, 0, 0, 1, 1, 0, 1, 1]);
		e.bufferData(e.ARRAY_BUFFER, new Float32Array(b), e.STATIC_DRAW);
		e.vertexAttribPointer(a.TexCoord, 2, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(a.TexCoord);
		i.Position = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, i.Position);
		var h = (this.PositionCoords = [
			0,
			0,
			0,
			0,
			c.height,
			0,
			c.width,
			0,
			0,
			c.width,
			c.height,
			0,
		]);
		e.bufferData(e.ARRAY_BUFFER, new Float32Array(h), e.STATIC_DRAW);
		e.vertexAttribPointer(a.Position, 3, e.FLOAT, false, 0, 0);
		e.enableVertexAttribArray(a.Position);
		this.MVPMatrix = f.slideProjectionMatrix;
		e.uniformMatrix4fv(g.MVPMatrix, false, this.MVPMatrix);
		e.activeTexture(e.TEXTURE0);
		e.uniform1i(g.Texture, 0);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (B, e, a) {
		var s = this.renderer;
		var v = this.gl;
		var n = this.program.colorPlanes;
		var z = n.uniforms;
		var q = n.attribs;
		var g = this.textures;
		var p = g[0];
		var h = g[1];
		this.percentfinished += B / a;
		this.percentfinished > 1 ? (this.percentfinished = 1) : 0;
		var d = this.percentfinished;
		var A = this.direction;
		var t = 0.25;
		var o = 1;
		var w =
			A == KNDirection.KNDirectionRightToLeft ||
			A == KNDirection.KNDirectionBottomToTop;
		var b =
			A == KNDirection.KNDirectionLeftToRight ||
			A == KNDirection.KNDirectionRightToLeft;
		var c = 1 - (1 - d) * (1 - d);
		var m = b ? p.width : p.height;
		var i = TSUSineMap(d * 2);
		var C = i * m * t;
		var k = Math.sin(-c * 2 * Math.PI);
		k *= c * m * o;
		if (d < 0.5) {
			v.bindTexture(v.TEXTURE_2D, h.texture);
			v.uniform2fv(z.FlipTexCoords, new Float32Array([0, 0]));
		} else {
			v.bindTexture(v.TEXTURE_2D, p.texture);
			if (
				A == KNDirection.KNDirectionTopToBottom ||
				A == KNDirection.KNDirectionBottomToTop
			) {
				v.uniform2fv(z.FlipTexCoords, new Float32Array([0, 1]));
			} else {
				v.uniform2fv(z.FlipTexCoords, new Float32Array([1, 0]));
			}
		}
		for (var f = 0, l = this.mNumColors; f < l; f++) {
			var r = f / l;
			var u = WebGraphics.colorWithHSBA(r, 1, 1, 1 / l);
			v.uniform4fv(
				z.ColorMask,
				new Float32Array([u.red, u.green, u.blue, u.alpha])
			);
			var x = (Math.PI / 180) * (180 * TSUSineMap(d));
			var j = WebGraphics.translateMatrix4(
				this.MVPMatrix,
				p.width / 2,
				p.height / 2,
				k
			);
			j = WebGraphics.rotateMatrix4AboutXYZ(
				j,
				x,
				(w ? -1 : 1) * (b ? 0 : 1),
				(w ? -1 : 1) * (b ? 1 : 0),
				0
			);
			j = WebGraphics.translateMatrix4(
				j,
				-p.width / 2,
				-p.height / 2,
				C * (f - 1)
			);
			v.uniformMatrix4fv(z.MVPMatrix, false, j);
			v.drawArrays(v.TRIANGLE_STRIP, 0, 4);
		}
	},
});
var KNWebGLTransitionFlop = Class.create(KNWebGLProgram, {
	initialize: function ($super, m, p) {
		this.programData = {
			name: "com.apple.iWork.Keynote.BUKFlop",
			programNames: ["flop", "defaultTexture"],
			effect: p.effect,
			textures: p.textures,
		};
		$super(m, this.programData);
		var q = this.effect.attributes.direction;
		if (
			q !== KNDirection.KNDirectionLeftToRight &&
			q !== KNDirection.KNDirectionRightToLeft &&
			q !== KNDirection.KNDirectionTopToBottom &&
			q !== KNDirection.KNDirectionBottomToTop
		) {
			q = KNDirection.KNDirectionLeftToRight;
		}
		this.direction = q;
		this.percentfinished = 0;
		var i = (this.elementArray = []);
		var o = this.gl;
		var b = o.viewportWidth;
		var a = o.viewportHeight;
		var l = b;
		var j = a;
		if (
			q === KNDirection.KNDirectionTopToBottom ||
			q === KNDirection.KNDirectionBottomToTop
		) {
			j *= 0.5;
		} else {
			l *= 0.5;
		}
		var n = (this.mNumPoints = 8);
		var c = 0;
		for (e = 0; e < n - 1; e++) {
			for (f = 0; f < n; f++) {
				i[c++] = (e + 0) * n + f;
				i[c++] = (e + 1) * n + f;
			}
		}
		var h = l / (n - 1);
		var g = j / (n - 1);
		var d = q == KNDirection.KNDirectionTopToBottom ? j : (d = 0);
		var r = q == KNDirection.KNDirectionRightToLeft ? l : (r = 0);
		var k = (this.attributeBufferData = {
			Position: [],
			TexCoords: [],
			Normal: [],
			ShadowPosition: [],
			ShadowTexCoord: [],
			PreviousPosition: [],
			PreviousTexCoords: [],
			PreviousNormal: [],
		});
		for (var e = 0; e < n; e++) {
			for (var f = 0; f < n; f++) {
				c = e * n + f;
				KNWebGLUtil.setPoint3DAtIndexForAttribute(
					WebGraphics.makePoint3D(f * h + r, e * g, 0),
					c,
					k.Position
				);
				KNWebGLUtil.setPoint2DAtIndexForAttribute(
					WebGraphics.makePoint((f * h + r) / b, (e * g + d) / a),
					c,
					k.TexCoords
				);
				KNWebGLUtil.setPoint3DAtIndexForAttribute(
					WebGraphics.makePoint3D(0, 0, 1),
					c,
					k.Normal
				);
			}
		}
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		var m = this.gl;
		var d = this.program.flop;
		var g = d.attribs;
		var p = d.uniforms;
		var e = this.program.defaultTexture;
		var r = (this.MVPMatrix = l.slideProjectionMatrix);
		var k = m.viewportWidth;
		var h = m.viewportHeight;
		var q = this.direction;
		if (
			q === KNDirection.KNDirectionTopToBottom ||
			q === KNDirection.KNDirectionBottomToTop
		) {
			h *= 0.5;
		} else {
			k *= 0.5;
		}
		var b = [0, 0, 0, 0.5, 1, 0, 1, 0.5];
		var f = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0];
		var c = [0, 0.5, 0, 1, 1, 0.5, 1, 1];
		var a = [0, h, 0, 0, h * 2, 0, k, h, 0, k, h * 2, 0];
		KNWebGLUtil.enableAttribs(m, d);
		var j = this.attributeBufferData;
		var o = (this.buffers = {});
		var n = (this.Coordinates = {});
		o.TexCoord = m.createBuffer();
		m.bindBuffer(m.ARRAY_BUFFER, o.TexCoord);
		m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.TexCoords), m.DYNAMIC_DRAW);
		m.vertexAttribPointer(g.TexCoord, 2, m.FLOAT, false, 0, 0);
		o.Position = m.createBuffer();
		m.bindBuffer(m.ARRAY_BUFFER, o.Position);
		m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.Position), m.DYNAMIC_DRAW);
		m.vertexAttribPointer(g.Position, 3, m.FLOAT, false, 0, 0);
		o.Normal = m.createBuffer();
		m.bindBuffer(m.ARRAY_BUFFER, o.Normal);
		m.bufferData(m.ARRAY_BUFFER, new Float32Array(j.Normal), m.DYNAMIC_DRAW);
		m.vertexAttribPointer(g.Normal, 3, m.FLOAT, false, 0, 0);
		m.uniformMatrix4fv(p.MVPMatrix, false, r);
		var i = (this.AffineTransform = new Matrix3());
		if (q === KNDirection.KNDirectionTopToBottom) {
			i.affineScale(1, -1);
			i.affineTranslate(0, 1);
		} else {
			if (q == KNDirection.KNDirectionBottomToTop) {
				i.affineScale(1, -1);
				i.affineTranslate(0, 1);
				b = [0, 0.5, 0, 1, 1, 0.5, 1, 1];
				c = [0, 0, 0, 0.5, 1, 0, 1, 0.5];
				f = [0, h, 0, 0, h * 2, 0, k, h, 0, k, h * 2, 0];
				a = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0];
			} else {
				if (q == KNDirection.KNDirectionRightToLeft) {
					i.affineScale(-1, 1);
					i.affineTranslate(1, 0);
					b = [0, 0, 0, 1, 0.5, 0, 0.5, 1];
					c = [0.5, 0, 0.5, 1, 1, 0, 1, 1];
					a = [k, 0, 0, k, h, 0, k * 2, 0, 0, k * 2, h, 0];
				} else {
					if (q === KNDirection.KNDirectionLeftToRight) {
						i.affineScale(-1, 1);
						i.affineTranslate(1, 0);
						f = [k, 0, 0, k, h, 0, k * 2, 0, 0, k * 2, h, 0];
						b = [0.5, 0, 0.5, 1, 1, 0, 1, 1];
						c = [0, 0, 0, 1, 0.5, 0, 0.5, 1];
						a = [0, 0, 0, 0, h, 0, k, 0, 0, k, h, 0];
					}
				}
			}
		}
		this.AffineIdentity = new Matrix3();
		this.elementIndicesBuffer = m.createBuffer();
		m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, this.elementIndicesBuffer);
		m.bufferData(
			m.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(this.elementArray),
			m.STATIC_DRAW
		);
		n.DefaultTexture = b;
		n.DefaultTexture2 = c;
		n.DefaultPosition = f;
		n.DefaultPosition2 = a;
		KNWebGLUtil.enableAttribs(m, e);
		o.TextureCoordinates = m.createBuffer();
		o.PositionCoordinates = m.createBuffer();
		m.bindBuffer(m.ARRAY_BUFFER, o.TextureCoordinates);
		m.bindBuffer(m.ARRAY_BUFFER, o.PositionCoordinates);
		m.bufferData(m.ARRAY_BUFFER, new Float32Array(b), m.DYNAMIC_DRAW);
		m.vertexAttribPointer(e.attribs.TexCoord, 2, m.FLOAT, false, 0, 0);
		m.bufferData(m.ARRAY_BUFFER, new Float32Array(f), m.DYNAMIC_DRAW);
		m.vertexAttribPointer(e.attribs.Position, 3, m.FLOAT, false, 0, 0);
		m.uniform1i(e.uniforms.Texture, 0);
		m.uniformMatrix4fv(e.uniforms.MVPMatrix, false, r);
		m.useProgram(d.shaderProgram);
		m.activeTexture(m.TEXTURE0);
		m.uniform1i(d.uniforms.Texture, 0);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (c, a, b) {
		this.percentfinished += c / b;
		this.percentfinished > 1 ? (this.percentfinished = 1) : 0;
		this.updateFlopWithPercent();
		this.draw();
	},
	updateFlopWithPercent: function () {
		var r = this.gl;
		var u = this.direction;
		var c = r.viewportWidth;
		var b = r.viewportHeight;
		var g = this.percentfinished * Math.PI;
		var f =
			this.percentfinished *
			this.percentfinished *
			this.percentfinished *
			Math.PI;
		var m = b / 2;
		var o = c / 2;
		var a = 0;
		var q = this.mNumPoints;
		var n = this.attributeBufferData;
		for (var i = 0; i < q; i++) {
			for (var k = 0; k < q; k++) {
				var h = i * q + k;
				var e = KNWebGLUtil.getPoint2DForArrayAtIndex(n.TexCoords, h);
				e.x *= c;
				e.y *= b;
				if (u === KNDirection.KNDirectionBottomToTop) {
					a = e.y / m;
				} else {
					if (u === KNDirection.KNDirectionTopToBottom) {
						a = (m * 2 - e.y) / m;
					} else {
						if (u === KNDirection.KNDirectionLeftToRight) {
							a = e.x / o;
						} else {
							a = (o * 2 - e.x) / o;
						}
					}
				}
				var s = a * g + (1 - a) * f;
				if (
					u === KNDirection.KNDirectionLeftToRight ||
					u === KNDirection.KNDirectionTopToBottom
				) {
					s *= -1;
				}
				var d = Math.sin(s);
				var v = Math.cos(s);
				var j = KNWebGLUtil.getPoint3DForArrayAtIndex(n.Position, h);
				var l = KNWebGLUtil.getPoint3DForArrayAtIndex(n.Normal, h);
				if (
					u === KNDirection.KNDirectionTopToBottom ||
					u === KNDirection.KNDirectionBottomToTop
				) {
					var p = WebGraphics.makePoint3D(
						j.x,
						m - (m - e.y) * v,
						(m - e.y) * d
					);
					KNWebGLUtil.setPoint3DAtIndexForAttribute(p, h, n.Position);
					var t = WebGraphics.makePoint3D(l.x, -d, v);
					KNWebGLUtil.setPoint3DAtIndexForAttribute(t, h, n.Normal);
				} else {
					var p = WebGraphics.makePoint3D(
						o - (o - e.x) * v,
						j.y,
						-(o - e.x) * d
					);
					KNWebGLUtil.setPoint3DAtIndexForAttribute(p, h, n.Position);
					var t = WebGraphics.makePoint3D(-d, l.y, v);
					KNWebGLUtil.setPoint3DAtIndexForAttribute(t, h, n.Normal);
				}
			}
		}
	},
	draw: function () {
		var e = this.renderer;
		var d = this.gl;
		var c = this.program.flop;
		var b = this.program.defaultTexture;
		var h = this.textures;
		var l = h[1].texture;
		var j = h[0].texture;
		d.useProgram(b.shaderProgram);
		d.disable(d.CULL_FACE);
		d.bindTexture(d.TEXTURE_2D, l);
		var f = this.mNumPoints;
		var k = this.buffers;
		var a = this.Coordinates;
		var i = this.attributeBufferData;
		KNWebGLUtil.bindDynamicBufferWithData(
			d,
			b.attribs.Position,
			k.PositionCoordinates,
			a.DefaultPosition,
			3
		);
		KNWebGLUtil.bindDynamicBufferWithData(
			d,
			b.attribs.TexCoord,
			k.TextureCoordinates,
			a.DefaultTexture,
			2
		);
		d.drawArrays(d.TRIANGLE_STRIP, 0, 4);
		d.useProgram(b.shaderProgram);
		d.disable(d.CULL_FACE);
		d.bindTexture(d.TEXTURE_2D, j);
		KNWebGLUtil.bindDynamicBufferWithData(
			d,
			b.attribs.Position,
			k.PositionCoordinates,
			a.DefaultPosition2,
			3
		);
		KNWebGLUtil.bindDynamicBufferWithData(
			d,
			b.attribs.TexCoord,
			k.TextureCoordinates,
			a.DefaultTexture2,
			2
		);
		d.drawArrays(d.TRIANGLE_STRIP, 0, 4);
		d.enable(d.CULL_FACE);
		d.useProgram(c.shaderProgram);
		d.bindBuffer(d.ARRAY_BUFFER, k.Position);
		d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.Position), d.DYNAMIC_DRAW);
		d.vertexAttribPointer(c.attribs.Position, 3, d.FLOAT, false, 0, 0);
		d.bindBuffer(d.ARRAY_BUFFER, k.Normal);
		d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.Normal), d.DYNAMIC_DRAW);
		d.vertexAttribPointer(c.attribs.Normal, 3, d.FLOAT, false, 0, 0);
		d.bindBuffer(d.ARRAY_BUFFER, k.TexCoord);
		d.bufferData(d.ARRAY_BUFFER, new Float32Array(i.TexCoords), d.DYNAMIC_DRAW);
		d.vertexAttribPointer(c.attribs.TexCoord, 2, d.FLOAT, false, 0, 0);
		d.cullFace(d.BACK);
		d.bindTexture(d.TEXTURE_2D, j);
		d.uniformMatrix3fv(
			c.uniforms.TextureMatrix,
			false,
			this.AffineTransform.getColumnMajorFloat32Array()
		);
		d.uniform1f(c.uniforms.FlipNormals, -1);
		for (var g = 0; g < f - 1; g++) {
			d.drawElements(d.TRIANGLE_STRIP, f * 2, d.UNSIGNED_SHORT, g * f * 2 * 2);
		}
		d.bindTexture(d.TEXTURE_2D, l);
		d.cullFace(d.FRONT);
		d.uniformMatrix3fv(
			c.uniforms.TextureMatrix,
			false,
			this.AffineIdentity.getColumnMajorFloat32Array()
		);
		d.uniform1f(c.uniforms.FlipNormals, 1);
		for (var g = 0; g < f - 1; g++) {
			d.drawElements(d.TRIANGLE_STRIP, f * 2, d.UNSIGNED_SHORT, g * f * 2 * 2);
		}
	},
});
var KNWebGLBuildAnvil = Class.create(KNWebGLProgram, {
	initialize: function ($super, g, b) {
		var j = b.effect;
		this.programData = {
			name: "com.apple.iWork.Keynote.BUKAnvil",
			programNames: ["anvilsmoke", "anvilspeck"],
			effect: j,
			textures: b.textures,
		};
		$super(g, this.programData);
		var d = this.gl;
		this.smokeTexture = KNWebGLUtil.bindTextureWithImage(d, smokeImage);
		this.speckTexture = KNWebGLUtil.bindTextureWithImage(d, speckImage);
		this.percentfinished = 0;
		this.drawableObjects = [];
		for (var c = 0, a = this.textures.length; c < a; c++) {
			var h = b.textures[c];
			var f = { effect: j, textures: [h] };
			var e = new KNWebGLDrawable(g, f);
			this.drawableObjects.push(e);
		}
		this.objectY = 1;
		this.parentOpacity = j.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		var h = this.gl;
		this.smokeSystems = [];
		this.speckSystems = [];
		for (var e = 0, b = this.textures.length; e < b; e++) {
			var d = this.textures[e];
			var a = d.width;
			var m = d.height;
			var j = h.viewportWidth;
			var g = h.viewportHeight;
			var f = 300;
			var k = new KNWebGLBuildAnvilSmokeSystem(
				l,
				this.program.anvilsmoke,
				{ width: a, height: m },
				{ width: j, height: g },
				this.duration,
				{ width: f, height: 1 },
				{ width: kParticleSize, height: kParticleSize },
				this.smokeTexture
			);
			f = 40;
			var c = new KNWebGLBuildAnvilSpeckSystem(
				l,
				this.program.anvilspeck,
				{ width: a, height: m },
				{ width: j, height: g },
				this.duration,
				{ width: f, height: 1 },
				{ width: kParticleSize, height: kParticleSize },
				this.speckTexture
			);
			this.smokeSystems.push(k);
			this.speckSystems.push(c);
		}
	},
	drawFrame: function (a, h, r) {
		var w = this.renderer;
		var n = this.gl;
		this.percentfinished += a / r;
		if (this.percentfinished >= 1) {
			this.percentfinished = 1;
			this.isCompleted = true;
		}
		n.blendFunc(n.ONE, n.ONE_MINUS_SRC_ALPHA);
		for (var F = 0, p = this.textures.length; F < p; F++) {
			var e = this.textures[F];
			var C = e.initialState;
			var K = e.animations;
			if (e.hasHighlightedBulletAnimation) {
				if (!C.hidden) {
					var G;
					if (K.length > 0 && K[0].property === "opacity") {
						var L = K[0].from.scalar;
						var x = K[0].to.scalar;
						var t = x - L;
						G = L + t * this.percentfinished;
					} else {
						G = e.initialState.opacity;
					}
					this.drawableObjects[F].Opacity = this.parentOpacity * G;
					this.drawableObjects[F].drawFrame();
				}
			} else {
				if (e.animations.length > 0) {
					if (this.isCompleted) {
						this.drawableObjects[F].Opacity =
							this.parentOpacity * e.initialState.opacity;
						this.drawableObjects[F].drawFrame();
						continue;
					}
					var b = e.width;
					var d = e.height;
					var A = e.offset.pointX;
					var z = e.offset.pointY;
					var q = n.viewportWidth;
					var o = n.viewportHeight;
					r /= 1000;
					var E = Math.min(0.2, r * 0.4);
					var s = Math.min(0.25, r * 0.5);
					var B = this.cameraShakePointsWithRandomGenerator();
					var m = (this.percentfinished * r - E) / s;
					var v = WebGraphics.makePoint(0, 0);
					if (0 < m && m < 1) {
						var I = Math.floor(m * kNumCameraShakePoints);
						var g = Math.ceil(
							WebGraphics.clamp(m * kNumCameraShakePoints, 0, B.length - 1)
						);
						var J = B[I];
						var j = B[g];
						var f = m * kNumCameraShakePoints - I;
						v = WebGraphics.makePoint(
							WebGraphics.mix(J.x, j.x, f),
							WebGraphics.mix(J.y, j.y, f)
						);
					}
					var u = WebGraphics.clamp((this.percentfinished * r) / E, 0, 1);
					var k = WebGraphics.clamp(
						(this.percentfinished * r - E) / (r - E),
						0,
						1
					);
					var c = this.percentfinished;
					this.objectY = z + d;
					this.objectY *= 1 - u * u;
					this.drawableObjects[F].MVPMatrix = WebGraphics.translateMatrix4(
						w.slideOrthoMatrix,
						A + v.x * q,
						o - z - d + this.objectY + v.y * o,
						0
					);
					this.drawableObjects[F].Opacity =
						this.parentOpacity * e.initialState.opacity;
					this.drawableObjects[F].drawFrame();
					var D = WebGraphics.translateMatrix4(
						w.slideProjectionMatrix,
						A,
						o - (z + (d + 16)) * (1 - k * k * 0.02),
						0
					);
					var l = this.smokeSystems[F];
					l.setMVPMatrix(D);
					l.drawFrame(k, 1 - k * k);
					if (k < 0.5) {
						D = WebGraphics.translateMatrix4(
							w.slideOrthoMatrix,
							A,
							o - (z + d + 16),
							0
						);
						var H = this.speckSystems[F];
						H.setMVPMatrix(D);
						H.drawFrame(
							k,
							WebGraphics.clamp(1 - WebGraphics.sineMap(k) * 2, 0, 1)
						);
					}
				} else {
					if (!e.initialState.hidden) {
						this.drawableObjects[F].Opacity =
							this.parentOpacity * e.initialState.opacity;
						this.drawableObjects[F].drawFrame();
					}
				}
			}
		}
	},
	cameraShakePointsWithRandomGenerator: function () {
		var e = [];
		var c = 0.025;
		for (var a = 0; a < kNumCameraShakePoints; a++) {
			var d = 1 - a / kNumCameraShakePoints;
			d *= d;
			var b = WebGraphics.makePoint(
				WebGraphics.randomBetween(-1, 1) * c * d * 0.4,
				Math.pow(-1, a) * c * d
			);
			e[a] = b;
		}
		return e;
	},
});
var KNWebGLBuildFlame = Class.create(KNWebGLProgram, {
	initialize: function ($super, k, d) {
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNFlame",
			programNames: ["flame"],
			effect: d.effect,
			textures: d.textures,
		};
		$super(k, this.programData);
		var g = this.gl;
		this.flameTexture = KNWebGLUtil.bindTextureWithImage(g, flameImage);
		this.percentfinished = 0;
		this.drawableObjects = [];
		this.framebufferDrawableObjects = [];
		this.slideSize = { width: g.viewportWidth, height: g.viewportHeight };
		var n = this.effect;
		for (var f = 0, c = this.textures.length; f < c; f++) {
			var l = d.textures[f];
			var j = { effect: n, textures: [l] };
			var h = new KNWebGLDrawable(k, j);
			this.drawableObjects.push(h);
			var m = {
				size: { width: l.width, height: l.height },
				origin: { x: l.offset.pointX, y: l.offset.pointY },
			};
			var a = this.frameOfEffectWithFrame(m);
			var e = { effect: n, textures: [], drawableFrame: m, frameRect: a };
			var b = new KNWebGLFramebufferDrawable(k, e);
			this.framebufferDrawableObjects.push(b);
		}
		this.parentOpacity = n.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	frameOfEffectWithFrame: function (g) {
		var d = g.size;
		var f = this.slideSize;
		var i = 1.2 - Math.min(1, Math.sqrt(d.width / f.width)) + 1;
		var e = 1.25 - Math.min(1, Math.sqrt(d.height / f.height)) + 1;
		var h = {
			width: Math.round(d.width * i),
			height: Math.round(d.height * e),
		};
		if (d.width / d.height < 1) {
			h.width = Math.max(h.width, d.width + d.height);
		}
		var j = {
			size: h,
			origin: {
				x: g.origin.x + (d.width - h.width) / 2,
				y: g.origin.y + (d.height - h.height) / 2,
			},
		};
		j.origin.y -= (j.size.height - g.size.height) * 0.25;
		var c = this.gl;
		var b = {
			origin: { x: 0, y: 0 },
			size: { width: c.viewportWidth, height: c.viewportHeight },
		};
		var a = CGRectIntersection(j, b);
		a = CGRectIntegral(a);
		return a;
	},
	p_orthoTransformWithScale: function (f, e, d) {
		var c = { width: d.size.width * f, height: d.size.height * f };
		var b = WebGraphics.makeOrthoMatrix4(0, c.width, 0, c.height, -1, 1);
		var a = WebGraphics.translateMatrix4(b, e.x, -e.y, 0);
		return a;
	},
	animationWillBeginWithContext: function () {
		var j = this.renderer;
		var m = this.gl;
		var a = this.duration / 1000;
		this.flameSystems = [];
		for (var n = 0, c = this.textures.length; n < c; n++) {
			var f = this.textures[n];
			var h = f.width;
			var g = f.height;
			var l = m.viewportWidth;
			var b = m.viewportHeight;
			var e = this.framebufferDrawableObjects[n];
			var q = e.frameRect;
			var s = e.drawableFrame;
			var k = {
				x: f.offset.pointX - q.origin.x,
				y: f.offset.pointY + g - (q.origin.y + q.size.height),
			};
			var t = s.origin.y - q.origin.y;
			var o = q.origin.y + q.size.height - (s.origin.y + s.size.height);
			k.y += o - t;
			e.MVPMatrix = this.p_orthoTransformWithScale(1, k, q);
			var d = h / g;
			var p = Math.round(d * 150);
			p *= a + Math.max(0, 1 - a / 2);
			var r = new KNWebGLBuildFlameSystem(
				j,
				this.program.flame,
				{ width: h, height: g },
				{ width: l, height: b },
				Math.max(2, this.duration),
				p,
				this.flameTexture
			);
			r.p_setupParticleDataWithTexture(f);
			this.flameSystems.push(r);
		}
	},
	drawFrame: function (a, h, u) {
		var x = this.renderer;
		var m = this.gl;
		var c = this.program.flame;
		var n = c.uniforms;
		var g = this.buildOut;
		var l = this.percentfinished;
		l += a / u;
		if (l >= 1) {
			l = 1;
			this.isCompleted = true;
		}
		this.percentfinished = l;
		m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA);
		for (var K = 0, p = this.textures.length; K < p; K++) {
			var f = this.textures[K];
			var E = f.initialState;
			var N = f.animations;
			if (f.hasHighlightedBulletAnimation) {
				if (!E.hidden) {
					var L;
					if (N.length > 0 && N[0].property === "opacity") {
						var O = N[0].from.scalar;
						var z = N[0].to.scalar;
						var v = z - O;
						L = O + v * this.percentfinished;
					} else {
						L = f.initialState.opacity;
					}
					this.drawableObjects[K].Opacity = this.parentOpacity * L;
					this.drawableObjects[K].drawFrame();
				}
			} else {
				if (f.animations.length > 0) {
					if (this.isCompleted) {
						if (!g) {
							this.drawableObjects[K].Opacity =
								this.parentOpacity * f.initialState.opacity;
							this.drawableObjects[K].drawFrame();
						}
						continue;
					}
					var b = f.width;
					var e = f.height;
					var C = f.offset.pointX;
					var B = f.offset.pointY;
					var r = m.viewportWidth;
					var o = m.viewportHeight;
					u /= 1000;
					var d = l;
					if (g) {
						d = 1 - d;
					}
					var J = g ? 0.25 : 0.5;
					var t = Math.min(J, 1 / u);
					if (d > t) {
						var j = (d - t) / (1 - t);
						var H = TSUSineMap(Math.min(1, 2 * j));
						H *= this.parentOpacity * f.initialState.opacity;
						var D = this.drawableObjects[K];
						D.Opacity = H;
						D.drawFrame();
					}
					var w = this.framebufferDrawableObjects[K];
					var F = w.drawableFrame;
					var A = w.frameRect;
					var k = {
						x: f.offset.pointX - A.origin.x,
						y: f.offset.pointY + e - (A.origin.y + A.size.height),
					};
					var I = F.origin.y - A.origin.y;
					var M = A.origin.y + A.size.height - (F.origin.y + F.size.height);
					k.y += M - I;
					var G = this.p_orthoTransformWithScale(1, k, A);
					m.viewport(0, 0, A.size.width, A.size.height);
					m.bindFramebuffer(m.FRAMEBUFFER, w.buffer);
					m.clear(m.COLOR_BUFFER_BIT);
					m.enable(m.BLEND);
					m.blendFunc(m.SRC_ALPHA, m.ONE);
					var q = l == 0 || l == 1 ? 0 : 1;
					m.bindTexture(m.TEXTURE_2D, w.texture);
					var s = this.flameSystems[K];
					s.setMVPMatrix(G);
					m.uniform1f(n.SpeedMax, s._speedMax);
					s.drawFrame(l, q);
					m.bindFramebuffer(m.FRAMEBUFFER, null);
					m.bindTexture(m.TEXTURE_2D, null);
					m.viewport(0, 0, m.viewportWidth, m.viewportHeight);
					m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA);
					w.MVPMatrix = WebGraphics.translateMatrix4(
						x.slideProjectionMatrix,
						A.origin.x,
						m.viewportHeight - (A.origin.y + A.size.height),
						0
					);
					w.drawFrame();
				} else {
					if (!f.initialState.hidden) {
						this.drawableObjects[K].Opacity =
							this.parentOpacity * f.initialState.opacity;
						this.drawableObjects[K].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLTransitionConfetti = Class.create(KNWebGLProgram, {
	initialize: function ($super, a, b) {
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNConfetti",
			programNames: ["confetti", "defaultTexture"],
			effect: b.effect,
			textures: b.textures,
		};
		$super(a, this.programData);
		this.useGravity =
			this.direction === KNDirection.KNDirectionGravity ? true : false;
		this.percentfinished = 0;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var j = this.renderer;
		var g = this.gl;
		var k = this.textures;
		var d = k[0];
		var b = d.width;
		var l = d.height;
		var i = g.viewportWidth;
		var h = g.viewportHeight;
		var f = 10000;
		g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA);
		this.confettiSystem = new KNWebGLBuildConfettiSystem(
			j,
			this.program.confetti,
			{ width: b, height: l },
			{ width: i, height: h },
			this.duration,
			f,
			k[1].texture
		);
		this.confettiSystem.setMVPMatrix(j.slideProjectionMatrix);
		var e = this.program.defaultTexture;
		KNWebGLUtil.enableAttribs(g, e);
		var c = [0, 0, 0, 1, 1, 0, 1, 1];
		var a = [0, 0, -1, 0, h, -1, i, 0, -1, i, h, -1];
		this.textureCoordinatesBuffer = g.createBuffer();
		g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinatesBuffer);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(c), g.STATIC_DRAW);
		g.vertexAttribPointer(e.attribs.TexCoord, 2, g.FLOAT, false, 0, 0);
		this.positionBuffer = g.createBuffer();
		KNWebGLUtil.bindDynamicBufferWithData(
			g,
			e.attribs.Position,
			this.positionBuffer,
			a,
			3
		);
		g.uniformMatrix4fv(e.uniforms.MVPMatrix, false, j.slideOrthoMatrix);
		g.activeTexture(g.TEXTURE0);
		g.uniform1i(e.uniforms.Texture, 0);
		this.drawFrame(0, 0, 4);
	},
	drawFrame: function (b, p, e) {
		var g = this.gl;
		var j = g.viewportWidth;
		var h = g.viewportHeight;
		var a = this.percentfinished;
		a += b / e;
		if (a > 1) {
			a = 1;
			this.isCompleted = true;
		}
		if (this.isCompleted) {
			var f = this.program.defaultTexture;
			g.useProgram(f.shaderProgram);
			g.uniformMatrix4fv(
				f.uniforms.MVPMatrix,
				false,
				this.renderer.slideProjectionMatrix
			);
			this.draw();
			return;
		}
		var l = (this.percentfinished = a);
		var i = 1 - l;
		var k = 1 - i * i * i;
		k = k * (1 - l * l) + (1 - i * i) * (l * l) + l;
		k *= 0.5;
		k *= k;
		var d = 0.75 + (1 - Math.pow(i, 4)) * 0.25;
		var n = WebGraphics.translateMatrix4(
			this.renderer.slideProjectionMatrix,
			j / 2,
			h / 2,
			0
		);
		n = WebGraphics.scaleMatrix4(n, d, d, 1);
		n = WebGraphics.translateMatrix4(n, -j / 2, -h / 2, 0);
		var f = this.program.defaultTexture;
		g.useProgram(f.shaderProgram);
		g.uniformMatrix4fv(f.uniforms.MVPMatrix, false, n);
		this.draw();
		var o = 1 - l;
		o = WebGraphics.clamp(o, 0, 1);
		k = WebGraphics.clamp(k, 0, 1);
		if (this.useGravity) {
			var m = 1;
			var c = this.renderer.slideProjectionMatrix;
			c = WebGraphics.translateMatrix4(c, 0, -h * 2 * l * l * (1 - m * 0.5), 0);
			this.confettiSystem.setMVPMatrix(c);
		}
		this.confettiSystem.drawFrame(k, o);
	},
	draw: function () {
		var g = this.gl;
		var d = this.program.defaultTexture;
		var f = d.attribs;
		var b = g.viewportWidth;
		var c = g.viewportHeight;
		g.useProgram(d.shaderProgram);
		var a = [0, 0, 0, 1, 1, 0, 1, 1];
		var e = [0, 0, -1, 0, c, -1, b, 0, -1, b, c, -1];
		g.bindBuffer(g.ARRAY_BUFFER, this.textureCoordinatesBuffer);
		g.bufferData(g.ARRAY_BUFFER, new Float32Array(a), g.STATIC_DRAW);
		g.vertexAttribPointer(f.TexCoord, 2, g.FLOAT, false, 0, 0);
		KNWebGLUtil.bindDynamicBufferWithData(
			g,
			f.Position,
			this.positionBuffer,
			e,
			3
		);
		g.bindTexture(g.TEXTURE_2D, this.textures[0].texture);
		g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
	},
});
var KNWebGLBuildConfetti = Class.create(KNWebGLProgram, {
	initialize: function ($super, f, b) {
		var h = b.effect;
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNConfetti",
			programNames: ["confetti"],
			effect: h,
			textures: b.textures,
		};
		$super(f, this.programData);
		this.useGravity =
			this.direction === KNDirection.KNDirectionGravity ? true : false;
		this.percentfinished = 0;
		this.drawableObjects = [];
		for (var c = 0, a = this.textures.length; c < a; c++) {
			var g = b.textures[c];
			var e = { effect: h, textures: [g] };
			var d = new KNWebGLDrawable(f, e);
			this.drawableObjects.push(d);
		}
		this.parentOpacity = h.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		var g = this.gl;
		var j = g.viewportWidth;
		var h = g.viewportHeight;
		this.confettiSystems = [];
		for (var e = 0, b = this.textures.length; e < b; e++) {
			var d = this.textures[e];
			var a = d.width;
			var m = d.height;
			var k = ((m / h) * a) / j;
			k = Math.sqrt(Math.sqrt(k));
			var f = Math.round(k * 10000);
			var c = new KNWebGLBuildConfettiSystem(
				l,
				this.program.confetti,
				{ width: a, height: m },
				{ width: j, height: h },
				this.duration,
				f,
				d.texture
			);
			c.ratio = k;
			this.confettiSystems.push(c);
		}
	},
	drawFrame: function (C, c, a) {
		var v = this.renderer;
		var x = this.gl;
		var w = x.viewportWidth;
		var d = x.viewportHeight;
		var g = this.buildIn;
		var B = this.buildOut;
		var t = this.percentfinished;
		t += C / a;
		if (t > 1) {
			t = 1;
			this.isCompleted = true;
		}
		this.percentfinished = t;
		for (var z = 0, f = this.textures.length; z < f; z++) {
			var r = this.textures[z];
			var A = r.initialState;
			var n = r.animations;
			if (r.hasHighlightedBulletAnimation) {
				if (!A.hidden) {
					var e;
					if (n.length > 0 && n[0].property === "opacity") {
						var k = n[0].from.scalar;
						var m = n[0].to.scalar;
						var q = m - k;
						e = k + q * t;
					} else {
						e = r.initialState.opacity;
					}
					x.blendFunc(x.ONE, x.ONE_MINUS_SRC_ALPHA);
					this.drawableObjects[z].Opacity = this.parentOpacity * e;
					this.drawableObjects[z].drawFrame();
				}
			} else {
				if (r.animations.length > 0) {
					if (this.isCompleted) {
						if (g) {
							this.drawableObjects[z].Opacity =
								this.parentOpacity * r.initialState.opacity;
							this.drawableObjects[z].drawFrame();
						}
						continue;
					}
					var u = r.width;
					var s = r.height;
					var b = g ? 1 - t : t;
					var j = 1 - b;
					var p = 1 - j * j * j;
					p = p * (1 - b * b) + (1 - j * j) * (b * b) + b;
					p *= 0.5;
					if (g) {
						p *= p;
					}
					var h = this.confettiSystems[z];
					var D = WebGraphics.translateMatrix4(
						v.slideProjectionMatrix,
						r.offset.pointX,
						d - (r.offset.pointY + s),
						0
					);
					var A = r.initialState;
					if (A.rotation !== 0 || A.scale !== 1) {
						D = mvpMatrixWithInitialStateAffineTransform(A, D);
					}
					var o = 1 - b;
					o = WebGraphics.clamp(o, 0, 1);
					p = WebGraphics.clamp(p, 0, 1);
					if (this.useGravity) {
						var l = h.ratio;
						D = WebGraphics.translateMatrix4(
							D,
							0,
							-d * 2 * b * b * (1 - l * 0.5),
							0
						);
					}
					x.blendFunc(x.SRC_ALPHA, x.ONE_MINUS_SRC_ALPHA);
					h.setMVPMatrix(D);
					h.drawFrame(p, o);
				} else {
					if (!r.initialState.hidden) {
						x.blendFunc(x.ONE, x.ONE_MINUS_SRC_ALPHA);
						this.drawableObjects[z].Opacity =
							this.parentOpacity * r.initialState.opacity;
						this.drawableObjects[z].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLBuildDiffuse = Class.create(KNWebGLProgram, {
	initialize: function ($super, f, b) {
		var h = b.effect;
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNDiffuse",
			programNames: ["diffuse"],
			effect: h,
			textures: b.textures,
		};
		$super(f, this.programData);
		this.percentfinished = 0;
		this.drawableObjects = [];
		for (var c = 0, a = this.textures.length; c < a; c++) {
			var g = b.textures[c];
			var e = { effect: h, textures: [g] };
			var d = new KNWebGLDrawable(f, e);
			this.drawableObjects.push(d);
		}
		this.parentOpacity = h.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		var g = this.gl;
		var j = g.viewportWidth;
		var h = g.viewportHeight;
		this.diffuseSystems = [];
		for (var e = 0, b = this.textures.length; e < b; e++) {
			var d = this.textures[e];
			var a = d.width;
			var m = d.height;
			var k = ((m / h) * a) / j;
			k = Math.sqrt(Math.sqrt(k));
			var f = Math.round(k * 4000);
			var c = new KNWebGLBuildDiffuseSystem(
				l,
				this.program.diffuse,
				{ width: a, height: m },
				{ width: j, height: h },
				this.duration,
				f,
				d.texture,
				this.direction === KNDirection.KNDirectionRightToLeft
			);
			this.diffuseSystems.push(c);
		}
	},
	drawFrame: function (v, b, a) {
		var o = this.renderer;
		var q = this.gl;
		var p = q.viewportWidth;
		var c = q.viewportHeight;
		var m = this.percentfinished;
		m += v / a;
		if (m > 1) {
			m = 1;
			this.isCompleted = true;
		}
		this.percentfinished = m;
		q.blendFunc(q.ONE, q.ONE_MINUS_SRC_ALPHA);
		for (var r = 0, e = this.textures.length; r < e; r++) {
			var k = this.textures[r];
			var s = k.initialState;
			var h = k.animations;
			if (k.hasHighlightedBulletAnimation) {
				if (!s.hidden) {
					var d;
					if (h.length > 0 && h[0].property === "opacity") {
						var f = h[0].from.scalar;
						var g = h[0].to.scalar;
						var j = g - f;
						d = f + j * m;
					} else {
						d = k.initialState.opacity;
					}
					this.drawableObjects[r].Opacity = this.parentOpacity * d;
					this.drawableObjects[r].drawFrame();
				}
			} else {
				if (k.animations.length > 0) {
					var n = k.width;
					var l = k.height;
					var u = k.offset.pointX;
					var t = k.offset.pointY;
					var w = this.diffuseSystems[r];
					var x = WebGraphics.translateMatrix4(
						o.slideProjectionMatrix,
						u,
						c - (t + l),
						0
					);
					var s = k.initialState;
					if (s.rotation !== 0 || s.scale !== 1) {
						x = mvpMatrixWithInitialStateAffineTransform(s, x);
					}
					w.setMVPMatrix(x);
					w.drawFrame(this.percentfinished, 1);
				} else {
					if (!k.initialState.hidden) {
						this.drawableObjects[r].Opacity =
							this.parentOpacity * k.initialState.opacity;
						this.drawableObjects[r].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLBuildFireworks = Class.create(KNWebGLProgram, {
	initialize: function ($super, g, b) {
		this.programData = {
			name: "com.apple.iWork.Keynote.KNFireworks",
			programNames: ["fireworks"],
			effect: b.effect,
			textures: b.textures,
		};
		$super(g, this.programData);
		var d = this.gl;
		this.animParameterGroup = new KNAnimParameterGroup("Fireworks");
		this.fireworksTexture = KNWebGLUtil.bindTextureWithImage(d, fireworksImage);
		this.fireworksCenterBurstTexture = KNWebGLUtil.bindTextureWithImage(
			d,
			fireworksCenterBurstImage
		);
		this.percentfinished = 0;
		this.prevpercentfinished = 0;
		this.drawableObjects = [];
		this.frameRect = this.frameOfEffectWithFrame();
		this.slideSize = { width: d.viewportWidth, height: d.viewportHeight };
		var j = this.effect;
		for (var c = 0, a = this.textures.length; c < a; c++) {
			var h = b.textures[c];
			var f = { effect: j, textures: [h] };
			var e = new KNWebGLDrawable(g, f);
			this.drawableObjects.push(e);
		}
		this.parentOpacity = j.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	frameOfEffectWithFrame: function () {
		var b = this.gl;
		var a = {
			origin: { x: 0, y: 0 },
			size: { width: b.viewportWidth, height: b.viewportHeight },
		};
		return a;
	},
	p_orthoTransformWithScale: function (f, e, d) {
		var c = { width: d.size.width * f, height: d.size.height * f };
		var b = WebGraphics.makeOrthoMatrix4(0, c.width, 0, c.height, -1, 1);
		var a = WebGraphics.translateMatrix4(b, e.x, -e.y, 0);
		return a;
	},
	p_setupFBOWithSize: function (a) {
		this.framebuffer = new TSDGLFrameBuffer(this.gl, a, 2);
	},
	p_fireworksSystemsForTR: function (h) {
		var k = this.renderer;
		var o = this.gl;
		var l = o.viewportWidth;
		var b = o.viewportHeight;
		var a = this.duration / 1000;
		var s = this.animParameterGroup;
		var g = a * s.doubleForKey("FireworksCount");
		g = Math.max(2, g);
		var c = [];
		var t = 0;
		var q = 1;
		var m = parseInt(WebGraphics.randomBetween(0, g - 1));
		for (var p = 0; p < g; p++) {
			var r = s.doubleForKey("ParticleCount");
			var e = Math.min(l, b);
			var n =
				e *
				WebGraphics.doubleBetween(
					s.doubleForKey("FireworkSizeMin"),
					s.doubleForKey("FireworkSizeMax")
				);
			var d = new KNWebGLBuildFireworksSystem(
				k,
				this.program.fireworks,
				{ width: h.width, height: h.height },
				{ width: l, height: b },
				this.duration,
				{ width: r, height: 1 },
				{ width: 1, height: 1 },
				this.fireworksTexture
			);
			var f = WebGraphics.makeSize(
				s.doubleForKey("ParticleSizeMin"),
				s.doubleForKey("ParticleSizeMax")
			);
			f.width = (f.width * e) / 100;
			f.height = (f.height * e) / 100;
			d.randomParticleSizeMinMax = f;
			d.maxDistance = n;
			d.colorRandomness = s.doubleForKey("ParticleColorRandomness");
			d.lifeSpanMinDuration = s.doubleForKey("ParticleLifeSpanMinDuration");
			d.randomParticleSpeedMinMax = WebGraphics.makePoint(
				s.doubleForKey("FireworkSpeedMin"),
				s.doubleForKey("FireworkSpeedMax")
			);
			if (p % 2 === 0) {
				d.fireworkStartingPositionX = WebGraphics.randomBetween(0, 0.5);
			} else {
				if (p % 2 === 1) {
					d.fireworkStartingPositionX = WebGraphics.randomBetween(0.5, 1);
				}
			}
			if (p === t) {
				d.fireworkStartingPositionX = 0;
			}
			if (p === q) {
				d.fireworkStartingPositionX = 1;
			}
			var u = WebGraphics.randomBetween(
				s.doubleForKey("FireworkDurationMin"),
				s.doubleForKey("FireworkDurationMax")
			);
			u /= a;
			var j = WebGraphics.randomBetween(0, 1 - u);
			if (p === m) {
				j = 0;
			}
			j = Math.max(j, 0.001);
			d.lifeSpan = { start: j, duration: u };
			d.setupWithTexture(h);
			c.push(d);
		}
		return c;
	},
	animationWillBeginWithContext: function () {
		var p = this.renderer;
		var t = this.gl;
		var w = this.animParameterGroup;
		var z = CGRectMake(0, 0, 512, 512);
		var B = CGRectMake(0, 0, this.slideSize.width, this.slideSize.height);
		var s = CGRectMake(0, 0, 1, 1);
		var m = CGSizeMake(2, 2);
		var x = this.frameRect;
		this.fireworksSystems = [];
		for (var u = 0, d = this.textures.length; u < d; u++) {
			var n = this.textures[u];
			var q = {
				x: n.offset.pointX - x.origin.x,
				y: n.offset.pointY + n.height - (x.origin.y + x.size.height),
			};
			var l = WebGraphics.makeOrthoMatrix4(
				0,
				x.size.width,
				0,
				x.size.height,
				-1,
				1
			);
			var k = WebGraphics.translateMatrix4(l, q.x, -q.y, 0);
			var g = new TSDGLShader(t);
			g.initWithDefaultTextureAndOpacityShader();
			g.setMat4WithTransform3D(k, kTSDGLShaderUniformMVPMatrix);
			g.setGLint(0, kTSDGLShaderUniformTexture);
			var o = n.textureRect;
			var j = CGRectMake(0, 0, o.size.width, o.size.height);
			var h = new TSDGLDataBuffer(t);
			h.initWithVertexRect(j, TSDRectUnit, m, false, false);
			var a = p.slideProjectionMatrix;
			a = WebGraphics.translateMatrix4(a, q.x, -q.y, 0);
			var A = this.p_fireworksSystemsForTR(n);
			this.p_setupFBOWithSize(x.size);
			var f = (this.fboShader = new TSDGLShader(t));
			f.initWithShaderFileNames("fireworkstrails", "fireworkstrails");
			f.setMat4WithTransform3D(l, kTSDGLShaderUniformMVPMatrix);
			f.setGLint(0, kTSDGLShaderUniformTexture);
			var b = (this.fboDataBuffer = new TSDGLDataBuffer(t));
			b.initWithVertexRect(
				CGRectMake(0, 0, x.size.width, x.size.height),
				TSDRectUnit,
				m,
				false,
				false
			);
			var c = (this.centerBurstShader = new TSDGLShader(t));
			c.initWithDefaultTextureAndOpacityShader();
			c.setGLFloat(1, kTSDGLShaderUniformOpacity);
			var e = (this.centerBurstDataBuffer = new TSDGLDataBuffer(t));
			e.initWithVertexRect(z, TSDRectUnit, m, false, false);
			var r = (this._bloomEffect = new TSDGLBloomEffect(t));
			r.initWithEffectSize(x.size, w.doubleForKey("BloomBlurScale"));
			var v = {
				_baseOrthoTransform: l,
				_baseTransform: k,
				objectShader: g,
				objectDataBuffer: h,
				fireworksMVP: a,
				systems: A,
			};
			this.fireworksSystems.push(v);
			t.clearColor(0, 0, 0, 0);
			t.enable(t.BLEND);
			t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA);
			t.disable(t.DEPTH_TEST);
		}
	},
	drawFrame: function (a, j, z) {
		var C = this.renderer;
		var p = this.gl;
		var c = this.program.fireworks;
		var q = c.uniforms;
		var h = this.buildOut;
		var m = this.percentfinished;
		var w = this.animParameterGroup;
		var F = w.doubleForKey("ParticleTrailsDitherAmount");
		var n = w.doubleForKey("ParticleTrailsDitherMax");
		var f = w.doubleForKey("BloomPower");
		m += a / z;
		if (m >= 1) {
			m = 1;
			this.isCompleted = true;
		}
		this.percentfinished = m;
		p.blendFunc(p.ONE, p.ONE_MINUS_SRC_ALPHA);
		for (var R = 0, s = this.textures.length; R < s; R++) {
			var g = this.textures[R];
			var M = g.initialState;
			var V = g.animations;
			if (g.hasHighlightedBulletAnimation) {
				if (!M.hidden) {
					var S;
					if (V.length > 0 && V[0].property === "opacity") {
						var W = V[0].from.scalar;
						var D = V[0].to.scalar;
						var A = D - W;
						S = W + A * this.percentfinished;
					} else {
						S = g.initialState.opacity;
					}
					this.drawableObjects[R].Opacity = this.parentOpacity * S;
					this.drawableObjects[R].drawFrame();
				}
			} else {
				if (g.animations.length > 0) {
					if (this.isCompleted) {
						if (!h) {
							this.drawableObjects[R].Opacity =
								this.parentOpacity * g.initialState.opacity;
							this.drawableObjects[R].drawFrame();
						}
						continue;
					}
					var b = g.width;
					var e = g.height;
					var J = g.offset.pointX;
					var H = g.offset.pointY;
					var u = p.viewportWidth;
					var r = p.viewportHeight;
					z /= 1000;
					var d = m;
					var K = TSDGLFrameBuffer.currentGLFramebuffer(p);
					var U = this.fireworksSystems[R];
					var l = U.objectShader;
					var t = U.objectDataBuffer;
					this.p_drawObject(d, g, l, t);
					var N = this.framebuffer;
					var O = this.fboShader;
					var x = this.fboDataBuffer;
					var T = N.currentGLTexture();
					N.setCurrentTextureToNext();
					N.bindFramebuffer();
					p.clear(p.COLOR_BUFFER_BIT);
					p.viewport(0, 0, N.size.width, N.size.height);
					p.bindTexture(p.TEXTURE_2D, T);
					var o = w.doubleForKey("FireworkDurationMin") / z;
					o = Math.min(o / 2, 1);
					var I = WebGraphics.clamp((m - o) / (1 - o), 0, 1);
					var B =
						1 -
						WebGraphics.mix(
							w.doubleForKey("TrailsFadeOutMin"),
							w.doubleForKey("TrailsFadeOutMax"),
							Math.pow(I, 2)
						);
					O.setGLFloat(B, kTSDGLShaderUniformOpacity);
					O.setGLFloat(F, kShaderUniformNoiseAmount);
					O.setGLFloat(n, kShaderUniformNoiseMax);
					var Q = WebGraphics.makePoint(
						WebGraphics.randomBetween(0, 1),
						WebGraphics.randomBetween(0, 1)
					);
					O.setPoint2D(Q, kShaderUniformNoiseSeed);
					x.drawWithShader(this.fboShader, true);
					p.blendFunc(p.ONE, p.ONE_MINUS_SRC_ALPHA);
					p.useProgram(c.shaderProgram);
					var G = w.doubleForKey("Gravity");
					G *= Math.min(u, r) * 0.001;
					G *= z;
					p.uniform1f(q.Gravity, G);
					var E = Math.min(u, r);
					var v = (E * w.doubleForKey("ParticleSizeStart")) / 100;
					p.uniform1f(q.StartScale, v);
					p.uniform1f(q.SparklePeriod, w.doubleForKey("SparklePeriod"));
					this.drawParticleSystemsWithPercent(m, false, 1, U);
					p.viewport(0, 0, p.viewportWidth, p.viewportHeight);
					N.unbindFramebufferAndBindGLFramebuffer(K);
					var P = w.doubleForKey("FireworkDurationMax");
					P = Math.min(P, 0.999);
					var L = WebGraphics.clamp((m - P) / (1 - P), 0, 1);
					var k = 1 - w.doubleForAnimationCurve("ParticleTransparency", L);
					this._bloomEffect.bindFramebuffer();
					p.clear(p.COLOR_BUFFER_BIT);
					O.setGLFloat(k, kTSDGLShaderUniformOpacity);
					O.setGLFloat(0, kShaderUniformNoiseAmount);
					p.blendFunc(p.SRC_ALPHA, p.ONE_MINUS_SRC_ALPHA);
					p.bindTexture(p.TEXTURE_2D, N.currentGLTexture());
					x.drawWithShader(O, true);
					p.blendFunc(p.ONE, p.ONE_MINUS_SRC_ALPHA);
					p.useProgram(c.shaderProgram);
					this.drawParticleSystemsWithPercent(m, true, k, U);
					this._bloomEffect.unbindFramebufferAndBindGLFramebuffer(K);
					p.blendFunc(p.ONE, p.ONE);
					this._bloomEffect.drawBloomEffectWithMVPMatrix(
						U._baseOrthoTransform,
						f,
						K
					);
					p.blendFunc(p.ONE, p.ONE_MINUS_SRC_ALPHA);
				} else {
					if (!g.initialState.hidden) {
						this.drawableObjects[R].Opacity =
							this.parentOpacity * g.initialState.opacity;
						this.drawableObjects[R].drawFrame();
					}
				}
			}
		}
		this.prevpercentfinished = this.percentfinished;
	},
	p_drawObject: function (h, c, i, a) {
		var e = this.gl;
		var b = this.animParameterGroup;
		var d = b.doubleForKey("TextOpacityBeginTime");
		var f = b.doubleForKey("TextOpacityEndTime");
		h = WebGraphics.clamp((h - d) / (f - d), 0, 1);
		var g = this.parentOpacity * c.initialState.opacity;
		g *= b.doubleForAnimationCurve("TextOpacityTiming", h);
		i.setGLFloat(g, kTSDGLShaderUniformOpacity);
		e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA);
		e.bindTexture(e.TEXTURE_2D, c.texture);
		a.drawWithShader(i, true);
	},
	drawParticleSystemsWithPercent: function (a, v, l, u) {
		var p = this.renderer;
		var q = this.gl;
		var h = this.program.fireworks;
		var w = h.uniforms;
		var z = this.animParameterGroup;
		var e = u.systems;
		var n = u._baseTransform;
		var B = u.fireworksMVP;
		q.useProgram(h.shaderProgram);
		q.uniform1f(w.ShouldSparkle, v ? 1 : 0);
		for (var r = 0, d = e.length; r < d; r++) {
			var g = e[r];
			var j = g.lifeSpan;
			var f = (a - j.start) / j.duration;
			if (f <= 0 || f >= 1) {
				continue;
			}
			var f = WebGraphics.clamp(f, 0, 1);
			var c = (this.prevpercentfinished - j.start) / j.duration;
			c = WebGraphics.clamp(c, f / 2, 1);
			var b = l;
			if (v) {
				b = 1 - z.doubleForAnimationCurve("ParticleTransparency", f);
			}
			var s = z.doubleForAnimationCurve("ParticleBurstTiming", c);
			var k = z.doubleForAnimationCurve("ParticleBurstTiming", f);
			q.uniform1f(w.ParticleBurstTiming, k);
			q.uniform1f(w.PreviousParticleBurstTiming, s);
			q.uniform1f(w.PreviousPercent, c);
			if (!v) {
				if (!g.didDrawCenterBurst) {
					q.bindTexture(q.TEXTURE_2D, this.fireworksCenterBurstTexture);
					var A = q.viewportHeight / 512;
					A *= WebGraphics.randomBetween(
						z.doubleForKey("CenterBurstScaleMin"),
						z.doubleForKey("CenterBurstScaleMax")
					);
					var x = g._startingPoint;
					var m = WebGraphics.translateMatrix4(n, x.x, x.y, 0);
					var o = WebGraphics.makePoint(-((512 / 2) * A), -((512 / 2) * A));
					m = WebGraphics.translateMatrix4(m, o.x, o.y, 0);
					m = WebGraphics.scaleMatrix4(m, A, A, 1);
					this.centerBurstShader.setGLFloat(
						z.doubleForKey("CenterBurstOpacity"),
						kTSDGLShaderUniformOpacity
					);
					this.centerBurstShader.setMat4WithTransform3D(
						m,
						kTSDGLShaderUniformMVPMatrix
					);
					q.blendFunc(q.SRC_ALPHA, q.ONE_MINUS_SRC_ALPHA);
					this.centerBurstDataBuffer.drawWithShader(
						this.centerBurstShader,
						true
					);
					q.blendFunc(q.ONE, q.ONE_MINUS_SRC_ALPHA);
					g.didDrawCenterBurst = true;
				}
			}
			q.useProgram(h.shaderProgram);
			g.setMVPMatrix(B);
			g.drawFrame(f, b);
		}
	},
});
var KNWebGLBuildShimmer = Class.create(KNWebGLProgram, {
	initialize: function ($super, h, c) {
		var l = c.effect;
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNShimmer",
			programNames: ["shimmerObject", "shimmerParticle"],
			effect: l,
			textures: c.textures,
		};
		$super(h, this.programData);
		var e = this.gl;
		this.percentfinished = 0;
		this.drawableObjects = [];
		this.slideOrigin = { x: 0, y: 0 };
		this.slideSize = { width: e.viewportWidth, height: e.viewportHeight };
		this.slideRect = { origin: this.slideOrigin, size: this.slideSize };
		for (var d = 0, b = this.textures.length; d < b; d++) {
			var j = c.textures[d];
			var k = j.textureRect;
			var g = { effect: l, textures: [j] };
			var a = this.frameOfEffectWithFrame(k);
			var f = new KNWebGLDrawable(h, g);
			f.frameRect = a;
			this.drawableObjects.push(f);
		}
		this.parentOpacity = l.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	frameOfEffectWithFrame: function (e) {
		var d = this.gl;
		var c = { x: CGRectGetMinX(e), y: CGRectGetMinY(e) };
		var a = { x: CGRectGetMaxX(e), y: CGRectGetMaxY(e) };
		var f = Math.max(e.size.width, e.size.height);
		f = Math.max(f, this.slideSize.height / 3);
		c.y -= f;
		a.y += f;
		c.x -= f;
		a.x += f;
		var b = TSDRectWithPoints(c, a);
		b = CGRectIntersection(b, this.slideRect);
		b = CGRectIntegral(b);
		return b;
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		this.shimmerEffects = [];
		var j = this.program;
		var e = this.slideRect;
		var f = this.duration;
		var o = this.direction;
		var n = this.type;
		var q = this.parentOpacity;
		for (var h = 0, d = this.textures.length; h < d; h++) {
			var k = this.textures[h];
			var m = this.textures[h].textureRect;
			var c = this.drawableObjects[h].frameRect;
			var b = {
				x: k.offset.pointX - c.origin.x,
				y: k.offset.pointY + k.height - (c.origin.y + c.size.height),
			};
			var p = WebGraphics.makeOrthoMatrix4(
				0,
				c.size.width,
				0,
				c.size.height,
				-1,
				1
			);
			var a = WebGraphics.translateMatrix4(p, b.x, -b.y, 0);
			var g = new KNWebGLBuildShimmerEffect(l, j, e, k, c, a, f, o, n, q);
			this.shimmerEffects.push(g);
		}
	},
	drawFrame: function (w, c, a) {
		var p = this.renderer;
		var r = this.gl;
		var q = r.viewportWidth;
		var d = r.viewportHeight;
		var n = this.percentfinished;
		n += w / a;
		if (n > 1) {
			n = 1;
			this.isCompleted = true;
		}
		this.percentfinished = n;
		r.blendFunc(r.ONE, r.ONE_MINUS_SRC_ALPHA);
		for (var s = 0, f = this.textures.length; s < f; s++) {
			var l = this.textures[s];
			var t = l.initialState;
			var j = l.animations;
			if (l.hasHighlightedBulletAnimation) {
				if (!t.hidden) {
					var e;
					if (j.length > 0 && j[0].property === "opacity") {
						var g = j[0].from.scalar;
						var h = j[0].to.scalar;
						var k = h - g;
						e = g + k * n;
					} else {
						e = l.initialState.opacity;
					}
					this.drawableObjects[s].Opacity = this.parentOpacity * e;
					this.drawableObjects[s].drawFrame();
				}
			} else {
				if (l.animations.length > 0) {
					if (this.isCompleted) {
						if (this.buildIn) {
							this.drawableObjects[s].Opacity =
								this.parentOpacity * l.initialState.opacity;
							this.drawableObjects[
								s
							].MVPMatrix = mvpMatrixWithInitialStateAffineTransform(
								t,
								this.drawableObjects[s].MVPMatrix
							);
							this.drawableObjects[s].drawFrame();
						}
						continue;
					}
					var o = l.width;
					var m = l.height;
					var v = l.offset.pointX;
					var u = l.offset.pointY;
					var b = this.shimmerEffects[s];
					b.renderEffectAtPercent(this.percentfinished);
				} else {
					if (!l.initialState.hidden) {
						this.drawableObjects[s].Opacity =
							this.parentOpacity * l.initialState.opacity;
						this.drawableObjects[s].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLBuildShimmerEffect = Class.create({
	initialize: function (f, d, b, g, e, a, c, h, i, j) {
		this.renderer = f;
		this.gl = f.gl;
		this.program = d;
		this._slideRect = b;
		this._texture = g;
		this._destinationRect = e;
		this._translate = a;
		this._duration = c;
		this._direction = h;
		this._buildType = i;
		this._baseTransform = new Float32Array(16);
		this._isSetup = false;
		this.parentOpacity = j;
		this.shimmerTexture = KNWebGLUtil.bindTextureWithImage(
			this.gl,
			shimmerImage
		);
		this.setupEffectIfNecessary();
	},
	setupEffectIfNecessary: function () {
		if (this._isSetup) {
			return;
		}
		var h = this.gl;
		var e = this._texture;
		var f = CGSizeMake(2, 2);
		var c = {
			origin: { x: 0, y: 0 },
			size: { width: h.viewportWidth, height: h.viewportHeight },
		};
		var b = {
			x: e.offset.pointX - c.origin.x,
			y: e.offset.pointY + e.height - (c.origin.y + c.size.height),
		};
		var d = WebGraphics.makeOrthoMatrix4(
			0,
			c.size.width,
			0,
			c.size.height,
			-1,
			1
		);
		var g = WebGraphics.translateMatrix4(d, b.x, -b.y, 0);
		var a = e.initialState;
		if (a.rotation !== 0 || a.scale !== 1) {
			g = mvpMatrixWithInitialStateAffineTransform(a, g);
		}
		this._objectSystem = this.objectSystemForTR(
			this._texture,
			this._slideRect,
			this._duration
		);
		this._objectSystem.setMVPMatrix(g);
		if (this._objectSystem.shouldDraw) {
			this._particleSystem = this.particleSystemForTR(
				this._texture,
				this._slideRect,
				this._duration
			);
			this._particleSystem.setMVPMatrix(g);
		}
		this.baseTransform = g;
		this._isSetup = true;
	},
	p_numberOfParticlesForTR: function (e, d, f) {
		var g = this._destinationRect;
		var c = d.size;
		var h = ((g.size.width / c.width) * g.size.height) / c.height;
		var b = ((e.size.width / g.size.width) * e.size.height) / g.size.height;
		var a = parseInt(Math.min(h * b * 2000, 3276));
		return a;
	},
	objectSystemForTR: function (d, c, f) {
		var e = d.textureRect;
		var a = this.p_numberOfParticlesForTR(e, c, f);
		var b = new KNWebGLBuildShimmerObjectSystem(
			this.renderer,
			this.program.shimmerObject,
			{ width: e.size.width, height: e.size.height },
			{ width: c.size.width, height: c.size.height },
			f,
			a,
			d.texture,
			this._direction
		);
		return b;
	},
	particleSystemForTR: function (d, c, g) {
		var f = d.textureRect;
		var e = this.p_numberOfParticlesForTR(f, c, g);
		e = Math.max(2, e / 40);
		var h = this._objectSystem.particleCount;
		var a = h;
		a += e;
		a = Math.min(a, 3276);
		var b = new KNWebGLBuildShimmerParticleSystem(
			this.renderer,
			this.program.shimmerParticle,
			{ width: f.size.width, height: f.size.height },
			{ width: c.size.width, height: c.size.height },
			g,
			CGSizeMake(a, 1),
			this._objectSystem.particleSize,
			this._objectSystem,
			this.shimmerTexture,
			this._direction
		);
		return b;
	},
	p_drawObject: function (d, c, e, b) {
		var f = this.gl;
		var a = this.parentOpacity * c.initialState.opacity;
		a = a * TSUSineMap(d);
		e.setGLFloat(a, kTSDGLShaderUniformOpacity);
		f.bindTexture(f.TEXTURE_2D, c.texture);
		f.blendFunc(f.ONE, f.ONE_MINUS_SRC_ALPHA);
		b.drawWithShader(e, true);
	},
	renderEffectAtPercent: function (f) {
		var d = this.gl;
		var g = this._texture;
		if (this._buildType === "buildOut") {
			f = 1 - f;
		}
		var c = (1 - f) * (1 - f);
		var a = this._buildType === "buildIn";
		var i = (((TSUReverseSquare(f) * this._duration) / 1000 + f) * Math.PI) / 2;
		if (!a) {
			i *= -1;
		}
		var b = WebGraphics.makePoint(0.2, 0.4);
		var h = (f - b.x) / b.y;
		h = WebGraphics.clamp(h, 0, 1);
		h = TSUSineMap(h);
		var e = this.parentOpacity * g.initialState.opacity;
		h *= e;
		d.blendFunc(d.ONE, d.ONE_MINUS_SRC_ALPHA);
		d.useProgram(this.program.shimmerObject.shaderProgram);
		this._objectSystem.setMVPMatrix(this.baseTransform);
		this._objectSystem.drawGLSLWithPercent(c, h, i, a, g.texture);
		d.useProgram(this.program.shimmerParticle.shaderProgram);
		this._particleSystem.setMVPMatrix(this.baseTransform);
		this._particleSystem.drawGLSLWithPercent(
			c,
			e * 0.5,
			i,
			a,
			this.shimmerTexture
		);
	},
});
var KNWebGLBuildSparkle = Class.create(KNWebGLProgram, {
	initialize: function ($super, h, c) {
		var l = c.effect;
		this.programData = {
			name: "com.apple.iWork.Keynote.KLNSparkle",
			programNames: ["sparkle"],
			effect: l,
			textures: c.textures,
		};
		$super(h, this.programData);
		var e = this.gl;
		this.percentfinished = 0;
		this.drawableObjects = [];
		this.slideOrigin = { x: 0, y: 0 };
		this.slideSize = { width: e.viewportWidth, height: e.viewportHeight };
		this.slideRect = { origin: this.slideOrigin, size: this.slideSize };
		for (var d = 0, b = this.textures.length; d < b; d++) {
			var j = c.textures[d];
			var k = j.textureRect;
			var g = { effect: l, textures: [j] };
			var a = this.frameOfEffectWithFrame(k);
			var f = new KNWebGLDrawable(h, g);
			f.frameRect = a;
			this.drawableObjects.push(f);
		}
		this.parentOpacity = l.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	frameOfEffectWithFrame: function (d) {
		var c = WebGraphics.makePoint(CGRectGetMinX(d), CGRectGetMinY(d));
		var a = WebGraphics.makePoint(CGRectGetMaxX(d), CGRectGetMaxY(d));
		var e = Math.max(d.size.width, d.size.height);
		e = Math.max(e, 128);
		c.y = Math.max(CGRectGetMinY(this.slideRect), c.y - e);
		a.y = Math.min(CGRectGetMaxY(this.slideRect), a.y + e);
		c.x = Math.max(CGRectGetMinX(this.slideRect), c.x - e);
		a.x = Math.min(CGRectGetMaxX(this.slideRect), a.x + e);
		var b = TSDRectWithPoints(c, a);
		b = CGRectIntegral(b);
		return b;
	},
	animationWillBeginWithContext: function () {
		var l = this.renderer;
		this.sparkleEffects = [];
		var j = this.program;
		var f = this.slideRect;
		var g = this.duration;
		var o = this.direction;
		var n = this.type;
		var q = this.parentOpacity;
		for (var h = 0, d = this.textures.length; h < d; h++) {
			var k = this.textures[h];
			var o = this.direction;
			var m = this.textures[h].textureRect;
			var c = this.drawableObjects[h].frameRect;
			var b = {
				x: k.offset.pointX - c.origin.x,
				y: k.offset.pointY + k.height - (c.origin.y + c.size.height),
			};
			var p = WebGraphics.makeOrthoMatrix4(
				0,
				c.size.width,
				0,
				c.size.height,
				-1,
				1
			);
			var a = WebGraphics.translateMatrix4(p, b.x, -b.y, 0);
			var e = new KNWebGLBuildSparkleEffect(l, j, f, k, c, a, g, o, n, q);
			this.sparkleEffects.push(e);
		}
	},
	drawFrame: function (u, b, a) {
		var n = this.renderer;
		var p = this.gl;
		var o = p.viewportWidth;
		var c = p.viewportHeight;
		var f = this.buildIn;
		var s = this.buildOut;
		var m = this.percentfinished;
		m += u / a;
		if (m > 1) {
			m = 1;
			this.isCompleted = true;
		}
		this.percentfinished = m;
		p.blendFunc(p.ONE, p.ONE_MINUS_SRC_ALPHA);
		for (var q = 0, e = this.textures.length; q < e; q++) {
			var l = this.textures[q];
			var r = l.initialState;
			var j = l.animations;
			if (l.hasHighlightedBulletAnimation) {
				if (!r.hidden) {
					var d;
					if (j.length > 0 && j[0].property === "opacity") {
						var g = j[0].from.scalar;
						var h = j[0].to.scalar;
						var k = h - g;
						d = g + k * m;
					} else {
						d = l.initialState.opacity;
					}
					this.drawableObjects[q].Opacity = this.parentOpacity * d;
					this.drawableObjects[q].drawFrame();
				}
			} else {
				if (l.animations.length > 0) {
					if (this.isCompleted) {
						if (f) {
							this.drawableObjects[q].Opacity =
								this.parentOpacity * l.initialState.opacity;
							this.drawableObjects[
								q
							].MVPMatrix = mvpMatrixWithInitialStateAffineTransform(
								r,
								this.drawableObjects[q].MVPMatrix
							);
							this.drawableObjects[q].drawFrame();
						}
						continue;
					}
					var t = this.sparkleEffects[q];
					t.renderEffectAtPercent(this.percentfinished);
				} else {
					if (!l.initialState.hidden) {
						this.drawableObjects[q].Opacity =
							this.parentOpacity * l.initialState.opacity;
						this.drawableObjects[q].drawFrame();
					}
				}
			}
		}
	},
});
var KNWebGLBuildSparkleEffect = Class.create({
	initialize: function (f, d, b, g, e, a, c, h, i, j) {
		this.renderer = f;
		this.gl = f.gl;
		this.program = d;
		this._slideRect = b;
		this._texture = g;
		this._destinationRect = e;
		this._translate = a;
		this._duration = c;
		this._direction = h;
		this._buildType = i;
		this._baseTransform = new Float32Array(16);
		this._isSetup = false;
		this.parentOpacity = j;
		this.sparkleTexture = KNWebGLUtil.bindTextureWithImage(
			this.gl,
			sparkleImage
		);
		this.setupEffectIfNecessary();
	},
	setupEffectIfNecessary: function () {
		if (this._isSetup) {
			return;
		}
		var g = this.gl;
		var h = this._texture;
		var i = CGSizeMake(2, 2);
		var b = {
			origin: { x: 0, y: 0 },
			size: { width: g.viewportWidth, height: g.viewportHeight },
		};
		var c = {
			x: h.offset.pointX - b.origin.x,
			y: h.offset.pointY + h.height - (b.origin.y + b.size.height),
		};
		var k = WebGraphics.makeOrthoMatrix4(
			0,
			b.size.width,
			0,
			b.size.height,
			-1,
			1
		);
		var a = WebGraphics.translateMatrix4(k, c.x, -c.y, 0);
		var e = h.initialState;
		if (e.rotation !== 0 || e.scale !== 1) {
			a = mvpMatrixWithInitialStateAffineTransform(e, a);
		}
		var j = (this._objectShader = new TSDGLShader(g));
		j.initWithDefaultTextureAndOpacityShader();
		j.setMat4WithTransform3D(a, kTSDGLShaderUniformMVPMatrix);
		j.setGLint(0, kTSDGLShaderUniformTexture);
		var l = new TSDGLDataBufferAttribute(
			kTSDGLShaderAttributePosition,
			GL_STREAM_DRAW,
			GL_FLOAT,
			false,
			2
		);
		var f = new TSDGLDataBufferAttribute(
			kTSDGLShaderAttributeTexCoord,
			GL_STREAM_DRAW,
			GL_FLOAT,
			false,
			2
		);
		var d = (this._objectDataBuffer = new TSDGLDataBuffer(g));
		d.newDataBufferWithVertexAttributes([l, f], i, true);
		this.sparkleSystem = this.sparkleSystemForTR(
			this._texture,
			this._slideRect,
			this._duration
		);
		this.sparkleSystem.setMVPMatrix(a);
		this.sparkleSystem.setColor(new Float32Array([1, 1, 1, 1]));
		this.baseTransform = a;
		this._isSetup = true;
	},
	p_numberOfParticlesForTR: function (e, d, f) {
		var g = this._destinationRect;
		var c = d.size;
		var h = ((g.size.width / c.width) * g.size.height) / c.height;
		var b = ((e.size.width / g.size.width) * e.size.height) / g.size.height;
		var a = parseInt(Math.min(h * b * 2000, 3276));
		return a;
	},
	sparkleSystemForTR: function (g, b, d) {
		var h = g.textureRect;
		var f = this._slideRect.size;
		var a = this._destinationRect;
		var i =
			((Math.min(a.size.width, f.width) / f.width) *
				Math.min(a.size.height, f.height)) /
			f.height;
		var e = parseInt((((2 - Math.sqrt(i)) / 2) * 1500 * this._duration) / 1000);
		var c = new KNWebGLBuildSparkleSystem(
			this.renderer,
			this.program.sparkle,
			{ width: h.size.width, height: h.size.height },
			{ width: b.size.width, height: b.size.height },
			d,
			CGSizeMake(e, 1),
			{ width: 128, height: 128 },
			this.sparkleTexture,
			this._direction
		);
		return c;
	},
	p_drawObject: function (d, c, e, b) {
		var f = this.gl;
		var a = this.parentOpacity * c.initialState.opacity;
		a = a * TSUSineMap(d);
		e.setGLFloat(a, kTSDGLShaderUniformOpacity);
		f.bindTexture(f.TEXTURE_2D, c.texture);
		f.blendFunc(f.ONE, f.ONE_MINUS_SRC_ALPHA);
		b.drawWithShader(e, true);
	},
	renderEffectAtPercent: function (d) {
		var v = this.gl;
		var p = this._texture;
		var z = this._direction;
		var c = p.textureRect;
		var m =
			z == KNDirection.KNDirectionRightToLeft ||
			z == KNDirection.KNDirectionTopToBottom;
		var h =
			z == KNDirection.KNDirectionRightToLeft ||
			z == KNDirection.KNDirectionLeftToRight;
		var g = this._translate;
		var e = this.parentOpacity * p.initialState.opacity;
		var a = this._duration / 1000;
		var n = 0.2 / a;
		var t = c.size.width;
		var q = c.size.height;
		var u = KNSparkleMaxParticleLife / Math.max(0.75, a);
		var x = d / (1 - u);
		var f = 0,
			l = 0,
			i = 0,
			o = 0,
			w = 0,
			k = 0,
			s = 0,
			b = 0;
		if (this._buildType == "buildOut") {
			x -= n;
			f = h ? (m ? 0 : t) : 0;
			l = h ? 0 : m ? 0 : q;
			i = h
				? m
					? t - t * WebGraphics.clamp(x, 0, 1)
					: t * WebGraphics.clamp(x, 0, 1)
				: t;
			o = h
				? q
				: m
				? q - q * WebGraphics.clamp(x, 0, 1)
				: q * WebGraphics.clamp(x, 0, 1);
			w = h ? (m ? 0 : 1) : 0;
			k = h ? 0 : m ? 0 : 1;
			s = h
				? m
					? 1 - 1 * WebGraphics.clamp(x, 0, 1)
					: 1 * WebGraphics.clamp(x, 0, 1)
				: 1;
			b = h
				? 1
				: m
				? 1 - 1 * WebGraphics.clamp(x, 0, 1)
				: 1 * WebGraphics.clamp(x, 0, 1);
		} else {
			x -= n;
			f = h ? (m ? t : 0) : 0;
			l = h ? 0 : m ? q : 0;
			i = h
				? m
					? t - t * WebGraphics.clamp(x, 0, 1)
					: t * WebGraphics.clamp(x, 0, 1)
				: t;
			o = h
				? q
				: m
				? q - q * WebGraphics.clamp(x, 0, 1)
				: q * WebGraphics.clamp(x, 0, 1);
			w = h ? (m ? 1 : 0) : 0;
			k = h ? 0 : m ? 1 : 0;
			s = h
				? m
					? 1 - 1 * WebGraphics.clamp(x, 0, 1)
					: 1 * WebGraphics.clamp(x, 0, 1)
				: 1;
			b = h
				? 1
				: m
				? 1 - 1 * WebGraphics.clamp(x, 0, 1)
				: 1 * WebGraphics.clamp(x, 0, 1);
		}
		v.bindTexture(v.TEXTURE_2D, p.texture);
		this._objectShader.setGLFloat(e, kTSDGLShaderUniformOpacity);
		var j = this._objectDataBuffer;
		var A = j.vertexAttributeNamed(kTSDGLShaderAttributePosition);
		var r = j.vertexAttributeNamed(kTSDGLShaderAttributeTexCoord);
		j.setGLPoint2D(WebGraphics.makePoint(f, l), A, 0);
		j.setGLPoint2D(WebGraphics.makePoint(i, l), A, 1);
		j.setGLPoint2D(WebGraphics.makePoint(f, o), A, 2);
		j.setGLPoint2D(WebGraphics.makePoint(i, o), A, 3);
		j.setGLPoint2D(WebGraphics.makePoint(w, k), r, 0);
		j.setGLPoint2D(WebGraphics.makePoint(s, k), r, 1);
		j.setGLPoint2D(WebGraphics.makePoint(w, b), r, 2);
		j.setGLPoint2D(WebGraphics.makePoint(s, b), r, 3);
		j.drawWithShader(this._objectShader, true);
		v.blendFunc(v.ONE, v.ONE_MINUS_SRC_ALPHA);
		v.useProgram(this.program.sparkle.shaderProgram);
		this.sparkleSystem.setMVPMatrix(this.baseTransform);
		this.sparkleSystem.drawFrame(d, 1);
	},
});
var KNWebGLTransitionMagicMove = Class.create(KNWebGLProgram, {
	initialize: function ($super, b, d) {
		this.coreAnimationWrapperProgram = new KNWebGLCoreAnimationWrapperProgram(
			d
		);
		$super(b, this.coreAnimationWrapperProgram.data);
		var c = this.gl;
		this.percentfinished = 0;
		this.drawableObjects = [];
		this.slideOrigin = { x: 0, y: 0 };
		this.slideSize = { width: c.viewportWidth, height: c.viewportHeight };
		this.slideRect = { origin: this.slideOrigin, size: this.slideSize };
		this.frameRect = this.slideRect;
		var a = d.effect;
		this.parentOpacity = a.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var m = this.renderer;
		this.coreAnimationWrapperBasedEffects = [];
		var k = this.program;
		var e = this.slideRect;
		var h = this.duration;
		var o = this.direction;
		var p = this.type;
		var r = this.parentOpacity;
		var g = this.parameterGroupName;
		for (var j = 0, d = this.textures.length; j < d; j++) {
			var l = this.textures[j];
			var o = this.direction;
			var n = this.textures[j].textureRect;
			var c = this.frameRect;
			var b = {
				x: l.offset.pointX - c.origin.x,
				y: l.offset.pointY + l.height - (c.origin.y + c.size.height),
			};
			var q = WebGraphics.makeOrthoMatrix4(
				0,
				c.size.width,
				0,
				c.size.height,
				-1,
				1
			);
			var a = WebGraphics.translateMatrix4(q, b.x, -b.y, 0);
			var f = new KNWebGLCoreAnimationWrapperBasedEffect(
				m,
				k,
				e,
				l,
				c,
				a,
				h,
				o,
				p,
				r
			);
			this.coreAnimationWrapperBasedEffects.push(f);
		}
	},
	drawFrame: function (f, a, d) {
		var e = this.coreAnimationWrapperBasedEffects;
		for (var b = 0, c = e.length; b < c; b++) {
			e[b].drawFrame(f, a, d);
		}
	},
});
var KNWebGLTransitionContentAware = Class.create(KNWebGLProgram, {
	initialize: function ($super, b, d) {
		this.coreAnimationWrapperProgram = new KNWebGLCoreAnimationWrapperProgram(
			d
		);
		this.params = d;
		$super(b, this.coreAnimationWrapperProgram.data);
		var c = this.gl;
		this.percentfinished = 0;
		this.slideOrigin = { x: 0, y: 0 };
		this.slideSize = { width: c.viewportWidth, height: c.viewportHeight };
		this.slideRect = { origin: this.slideOrigin, size: this.slideSize };
		this.frameRect = this.slideRect;
		var a = d.effect;
		this.parentOpacity = a.baseLayer.initialState.opacity;
		this.animationWillBeginWithContext();
	},
	animationWillBeginWithContext: function () {
		var t = this.renderer;
		this.contentAwareEffects = [];
		var h = this.program;
		var A = this.slideRect;
		var a = this.duration;
		var D = this.direction;
		var s = this.type;
		var f = this.parentOpacity;
		var d = this.parameterGroupName;
		for (var w = 0, c = this.textures.length; w < c; w++) {
			var q = this.textures[w];
			var D = this.direction;
			var b = this.textures[w].textureRect;
			var e = this.frameRect;
			var u = {
				x: q.offset.pointX - e.origin.x,
				y: q.offset.pointY + q.height - (e.origin.y + e.size.height),
			};
			var p = WebGraphics.makeOrthoMatrix4(
				0,
				e.size.width,
				0,
				e.size.height,
				-1,
				1
			);
			var n = WebGraphics.translateMatrix4(p, u.x, -u.y, 0);
			var m = q.texturedRectangle;
			var B = m.textureType;
			var o = B === TSDTextureType.Object && m.shapePath ? true : false;
			if (B === TSDTextureType.Text || o) {
				var C = this.params;
				var r = C.effect;
				C.textures = [q];
				var x = q.animations;
				var h;
				if (x && x.length > 0) {
					var k = x[0].animations;
					for (var v = 0, g = k.length; v < g; v++) {
						var z = k[v];
						if (z.property === "hidden") {
							r.type = z.to.scalar ? "buildOut" : "buildIn";
							break;
						}
					}
				}
				switch (r.name) {
					case "apple:ca-text-shimmer":
						h = new KNWebGLBuildShimmer(t, C);
						break;
					case "apple:ca-text-sparkle":
						h = new KNWebGLBuildSparkle(t, C);
						break;
					default:
						h = new KNWebGLDissolve(t, C);
						break;
				}
				this.contentAwareEffects.push(h);
			} else {
				var l = new KNWebGLCoreAnimationWrapperBasedEffect(
					t,
					h,
					A,
					q,
					e,
					n,
					a,
					D,
					s,
					f
				);
				this.contentAwareEffects.push(l);
			}
		}
	},
	drawFrame: function (g, a, f) {
		var b = this.contentAwareEffects;
		for (var c = 0, e = b.length; c < e; c++) {
			var d = b[c];
			d.drawFrame(g, a, f);
		}
	},
});
var KNWebGLTransitionShimmer = Class.create(KNWebGLTransitionContentAware, {
	initialize: function ($super, a, b) {
		$super(a, b);
	},
});
var KNWebGLTransitionSparkle = Class.create(KNWebGLTransitionContentAware, {
	initialize: function ($super, a, b) {
		$super(a, b);
	},
});