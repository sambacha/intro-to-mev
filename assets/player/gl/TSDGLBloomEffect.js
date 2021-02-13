var kShaderUniformBloomAmount = "BloomAmount";
var kShaderUniformBlurTexture = "BlurTexture";
var TSDGLBloomEffect = Class.create({
	initialize: function (a) {
		this.gl = a;
	},
	initWithEffectSize: function (a, b) {
		this._effectSize = a;
		this._blurBufferSize = CGSizeMake(
			Math.max(16, Math.ceil(a.width / b)),
			Math.max(16, Math.ceil(a.height / b))
		);
		this.p_setupShaders();
		this.p_setupBuffers();
	},
	p_setupShaders: function () {
		var f = this.gl;
		var e = this._blurBufferSize;
		var b = WebGraphics.makePoint(1 / e.width, 1 / e.height);
		var c = WebGraphics.makeOrthoMatrix4(0, e.width, 0, e.height, -1, +1);
		var a = (this._blurHorizontalShader = new TSDGLShader(f));
		a.initWithDefaultHorizontalBlurShader();
		a.setMat4WithTransform3D(c, kTSDGLShaderUniformMVPMatrix);
		a.setPoint2D(b, kTSDGLShaderUniformTextureSize);
		var d = (this._blurVerticalShader = new TSDGLShader(f));
		d.initWithDefaultVerticalBlurShader();
		d.setMat4WithTransform3D(c, kTSDGLShaderUniformMVPMatrix);
		d.setPoint2D(b, kTSDGLShaderUniformTextureSize);
		var h = (this._fboTransferShader = new TSDGLShader(f));
		h.initWithDefaultTextureShader();
		h.setMat4WithTransform3D(c, kTSDGLShaderUniformMVPMatrix);
		var g = (this._bloomShader = new TSDGLShader(f));
		g.initWithShaderFileNames("bloom", "bloom");
		g.setGLint(0, kTSDGLShaderUniformTexture);
		g.setGLint(1, kShaderUniformBlurTexture);
	},
	p_setupBuffers: function () {
		var f = this.gl;
		var i = this._effectSize;
		var c = this._blurBufferSize;
		var h = CGSizeMake(2, 2);
		var e = CGRectMake(0, 0, i.width, i.height);
		var a = CGRectMake(0, 0, c.width, c.height);
		var d = (this._dataBuffer = new TSDGLDataBuffer(f));
		d.initWithVertexRect(e, TSDRectUnit, h, false, false);
		var b = (this._blurDataBuffer = new TSDGLDataBuffer(f));
		b.initWithVertexRect(a, CGRectZero, h, true, false);
		var g = (this._blurTransferDataBuffer = new TSDGLDataBuffer(f));
		g.initWithVertexRect(a, TSDRectUnit, h, false, false);
		this._colorFramebuffer = new TSDGLFrameBuffer(f, i, 1);
		this._blurFramebuffer = new TSDGLFrameBuffer(f, c, 2);
	},
	bindFramebuffer: function () {
		this._colorFramebuffer.bindFramebuffer();
	},
	unbindFramebufferAndBindGLFramebuffer: function (a) {
		this._colorFramebuffer.unbindFramebufferAndBindGLFramebuffer(a);
	},
	p_blurColorBufferWithPreviousFramebuffer: function (a) {
		var e = this.gl;
		var c = this._blurFramebuffer;
		var b = this._blurBufferSize;
		c.bindFramebuffer();
		e.clear(e.COLOR_BUFFER_BIT);
		e.viewport(0, 0, b.width, b.height);
		e.bindTexture(e.TEXTURE_2D, this._colorFramebuffer.currentGLTexture());
		this._blurTransferDataBuffer.drawWithShader(this._fboTransferShader, true);
		var d = c.currentGLTexture();
		c.setCurrentTextureToNext();
		e.clear(e.COLOR_BUFFER_BIT);
		e.bindTexture(e.TEXTURE_2D, d);
		this._blurDataBuffer.drawWithShader(this._blurHorizontalShader, true);
		e.bindTexture(e.TEXTURE_2D, null);
		d = c.currentGLTexture();
		c.setCurrentTextureToNext();
		e.clear(e.COLOR_BUFFER_BIT);
		e.bindTexture(e.TEXTURE_2D, d);
		this._blurDataBuffer.drawWithShader(this._blurVerticalShader, true);
		c.unbindFramebufferAndBindGLFramebuffer(a);
		e.bindTexture(e.TEXTURE_2D, null);
	},
	drawBloomEffectWithMVPMatrix: function (g, a, b) {
		var d = this.gl;
		var f = this._effectSize;
		var c = d.getParameter(d.VIEWPORT);
		this.p_blurColorBufferWithPreviousFramebuffer(b);
		d.viewport(0, 0, f.width, f.height);
		d.activeTexture(d.TEXTURE1);
		d.bindTexture(d.TEXTURE_2D, this._blurFramebuffer.currentGLTexture());
		d.activeTexture(d.TEXTURE0);
		d.bindTexture(d.TEXTURE_2D, this._colorFramebuffer.currentGLTexture());
		var e = this._bloomShader;
		e.setMat4WithTransform3D(g, kTSDGLShaderUniformMVPMatrix);
		e.setGLFloat(a, kShaderUniformBloomAmount);
		this._dataBuffer.drawWithShader(e, true);
		d.activeTexture(d.TEXTURE1);
		d.bindTexture(d.TEXTURE_2D, null);
		d.activeTexture(d.TEXTURE0);
		d.bindTexture(d.TEXTURE_2D, null);
		d.viewport(c[0], c[1], c[2], c[3]);
	},
});
