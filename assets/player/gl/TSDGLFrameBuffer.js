var TSDGLFrameBuffer = Class.create({
	initialize: function (c, b, a) {
		this.gl = c;
		this.size = b;
		this.textureCount = a;
		this.currentTextureIndex = 0;
		this.setupFramebuffer(c, b, a);
	},
	setupFramebuffer: function (g, e, c) {
		var b = (this.buffer = g.createFramebuffer());
		g.bindFramebuffer(g.FRAMEBUFFER, b);
		var a = (this.textures = []);
		for (var d = 0; d < c; d++) {
			var f = g.createTexture();
			g.bindTexture(g.TEXTURE_2D, f);
			g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
			g.texImage2D(
				g.TEXTURE_2D,
				0,
				g.RGBA,
				e.width,
				e.height,
				0,
				g.RGBA,
				g.UNSIGNED_BYTE,
				null
			);
			g.bindTexture(g.TEXTURE_2D, null);
			a.push(f);
		}
		g.framebufferTexture2D(
			g.FRAMEBUFFER,
			g.COLOR_ATTACHMENT0,
			g.TEXTURE_2D,
			a[this.currentTextureIndex],
			0
		);
		g.bindFramebuffer(g.FRAMEBUFFER, null);
	},
	currentGLTexture: function () {
		var a = this.textures[this.currentTextureIndex];
		return a;
	},
	setCurrentTextureToNext: function () {
		var b = this.textureCount;
		if (this.textureCount > 0) {
			var a = this.currentTextureIndex;
			var c = (a + 1) % b;
			this.currentTextureIndex = c;
			this.bindFramebuffer();
		}
	},
	bindFramebuffer: function () {
		var a = this.gl;
		a.bindFramebuffer(a.FRAMEBUFFER, this.buffer);
		a.framebufferTexture2D(
			a.FRAMEBUFFER,
			a.COLOR_ATTACHMENT0,
			a.TEXTURE_2D,
			this.textures[this.currentTextureIndex],
			0
		);
	},
	currentGLFramebuffer: function () {
		var b = this.gl;
		var a = b.getParameter(b.FRAMEBUFFER_BINDING);
		return a;
	},
	unbindFramebufferAndBindGLFramebuffer: function (a) {
		var b = this.gl;
		b.bindFramebuffer(b.FRAMEBUFFER, a);
	},
});
TSDGLFrameBuffer.currentGLFramebuffer = function (b) {
	var a = b.getParameter(b.FRAMEBUFFER_BINDING);
	return a;
};
