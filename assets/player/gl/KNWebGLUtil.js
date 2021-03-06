var KNWebGLUtil = {};
KNWebGLUtil.setupProgram = function (h, k) {
	var j = KNWebGLShader[k];
	var m = this.loadShader(h, h.VERTEX_SHADER, j.vertex);
	var e = this.loadShader(h, h.FRAGMENT_SHADER, j.fragment);
	var a = this.createShaderProgram(h, m, e);
	var b = {};
	var n = {};
	for (var g = 0, c = j.uniformNames.length; g < c; g++) {
		var l = j.uniformNames[g];
		n[l] = h.getUniformLocation(a, l);
	}
	for (var g = 0, c = j.attribNames.length; g < c; g++) {
		var d = j.attribNames[g];
		b[d] = h.getAttribLocation(a, d);
	}
	var f = { shaderProgram: a, uniforms: n, attribs: b };
	h.useProgram(a);
	return f;
};
KNWebGLUtil.loadShader = function (e, b, f) {
	var c = e.createShader(b);
	e.shaderSource(c, f);
	e.compileShader(c);
	var d = e.getShaderParameter(c, e.COMPILE_STATUS);
	if (!d) {
		var a = e.getShaderInfoLog(c);
		console.log("*** Error compiling shader '" + c + "':" + a);
		e.deleteShader(c);
		return null;
	}
	return c;
};
KNWebGLUtil.createShaderProgram = function (d, c, a) {
	var f = d.createProgram();
	d.attachShader(f, c);
	d.attachShader(f, a);
	d.linkProgram(f);
	var e = d.getProgramParameter(f, d.LINK_STATUS);
	if (!e) {
		var b = d.getProgramInfoLog(f);
		console.log("Error in program linking:" + b);
		d.deleteProgram(f);
	}
	return f;
};
KNWebGLUtil.createTexture = function (c, b) {
	var a = c.createTexture();
	c.bindTexture(c.TEXTURE_2D, a);
	c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, true);
	c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, b);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
	c.bindTexture(c.TEXTURE_2D, null);
	return a;
};
KNWebGLUtil.bindTextureWithImage = function (c, b) {
	var a = c.createTexture();
	c.bindTexture(c.TEXTURE_2D, a);
	c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL, false);
	c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, b);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE);
	c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
	c.bindTexture(c.TEXTURE_2D, null);
	return a;
};
KNWebGLUtil.bindDynamicBufferWithData = function (e, d, a, c, b) {
	e.bindBuffer(e.ARRAY_BUFFER, a);
	e.bufferData(e.ARRAY_BUFFER, new Float32Array(c), e.DYNAMIC_DRAW);
	e.enableVertexAttribArray(d);
	e.vertexAttribPointer(d, b, e.FLOAT, false, 0, 0);
};
KNWebGLUtil.bindBufferWithData = function (f, e, a, d, b, c) {
	f.bindBuffer(f.ARRAY_BUFFER, a);
	f.bufferData(f.ARRAY_BUFFER, new Float32Array(d), c);
	f.enableVertexAttribArray(e);
	f.vertexAttribPointer(e, b, f.FLOAT, false, 0, 0);
};
KNWebGLUtil.setPoint2DAtIndexForAttribute = function (a, b, c) {
	c[b * 2] = a.x;
	c[b * 2 + 1] = a.y;
	c.size = 2;
};
KNWebGLUtil.setPoint3DAtIndexForAttribute = function (a, b, c) {
	c[b * 3] = a.x;
	c[b * 3 + 1] = a.y;
	c[b * 3 + 2] = a.z;
	c.size = 3;
};
KNWebGLUtil.setPoint4DAtIndexForAttribute = function (a, b, c) {
	c[b * 4] = a.x;
	c[b * 4 + 1] = a.y;
	c[b * 4 + 2] = a.z;
	c[b * 4 + 3] = a.w;
	c.size = 4;
};
KNWebGLUtil.setFloatAtIndexForAttribute = function (c, a, b) {
	b[a] = c;
};
KNWebGLUtil.getPoint2DForArrayAtIndex = function (c, b) {
	var a = {};
	a.x = c[b * 2];
	a.y = c[b * 2 + 1];
	return a;
};
KNWebGLUtil.getPoint3DForArrayAtIndex = function (c, b) {
	var a = {};
	a.x = c[b * 3];
	a.y = c[b * 3 + 1];
	a.z = c[b * 3 + 2];
	return a;
};
KNWebGLUtil.getPoint4DForArrayAtIndex = function (c, b) {
	var a = {};
	a.x = c[b * 4];
	a.y = c[b * 4 + 1];
	a.z = c[b * 4 + 2];
	a.w = c[b * 4 + 3];
	return a;
};
KNWebGLUtil.bindAllAvailableAttributesToBuffers = function (h, g, d, b, a, c) {
	for (var f in g) {
		var e = g[f];
		if (a[f] == undefined) {
			a[f] = h.createBuffer();
		}
		KNWebGLUtil.bindBufferWithData(h, e, a[f], d[f], b[f], c);
	}
};
KNWebGLUtil.enableAttribs = function (d, a) {
	var c = a.attribs;
	d.useProgram(a.shaderProgram);
	for (var b in c) {
		d.enableVertexAttribArray(c[b]);
	}
};
var WebGraphics = {};
WebGraphics.makePoint = function (a, c) {
	var b = {};
	b.x = a;
	b.y = c;
	return b;
};
WebGraphics.makePoint3D = function (a, d, c) {
	var b = {};
	b.x = a;
	b.y = d;
	b.z = c;
	return b;
};
WebGraphics.makePoint4D = function (a, e, d, b) {
	var c = {};
	c.x = a;
	c.y = e;
	c.z = d;
	c.w = b;
	return c;
};
WebGraphics.makeRect = function (b, e, c, a) {
	var d = {};
	d.x = b;
	d.y = e;
	d.width = c;
	d.height = a;
	return d;
};
WebGraphics.makeSize = function (b, a) {
	var c = {};
	c.width = b;
	c.height = a;
	return c;
};
WebGraphics.setOrigin = function (b, a) {
	b.x = a.x;
	b.y = a.y;
	return b;
};
WebGraphics.multiplyPoint3DByScalar = function (a, b) {
	var c = {};
	c.x = a.x * b;
	c.y = a.y * b;
	c.z = a.z * b;
	return c;
};
WebGraphics.multiplyPoint4DByScalar = function (a, b) {
	var c = {};
	c.x = a.x * b;
	c.y = a.y * b;
	c.z = a.z * b;
	c.w = a.w * b;
	return c;
};
WebGraphics.addPoint3DToPoint3D = function (d, c) {
	var e = {};
	e.x = d.x + c.x;
	e.y = d.y + c.y;
	e.z = d.z + c.z;
	return e;
};
WebGraphics.point3DNormalize = function (a) {
	var b = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
	var c = {};
	c.z = a.z / b;
	c.y = a.y / b;
	c.x = a.x / b;
	return c;
};
WebGraphics.randomBetween = function (c, b) {
	var a = Math.random();
	a *= b - c;
	a += c;
	return a;
};
WebGraphics.doubleBetween = function (f, b) {
	var a = 0;
	var c, h;
	if (f < b) {
		c = f;
		h = b;
	} else {
		c = b;
		h = f;
	}
	var e = Math.random();
	var g = h * e;
	var d = c * e;
	if (c >= 0 == h >= 0) {
		a = g - d;
		a = a + c;
	} else {
		a = g + c;
		a = a - d;
	}
	return a;
};
WebGraphics.mix = function (b, d, c) {
	return b * (1 - c) + d * c;
};
WebGraphics.clamp = function (b, a, c) {
	return Math.min(Math.max(b, a), c);
};
WebGraphics.sineMap = function (a) {
	return (Math.sin(a * Math.PI - Math.PI / 2) + 1) * 0.5;
};
WebGraphics.createMatrix4 = function () {
	var a = new Float32Array(16);
	a[0] = 1;
	a[1] = 0;
	a[2] = 0;
	a[3] = 0;
	a[4] = 0;
	a[5] = 1;
	a[6] = 0;
	a[7] = 0;
	a[8] = 0;
	a[9] = 0;
	a[10] = 1;
	a[11] = 0;
	a[12] = 0;
	a[13] = 0;
	a[14] = 0;
	a[15] = 1;
	return a;
};
WebGraphics.makeIdentityMatrix4 = function () {
	return WebGraphics.createMatrix4();
};
WebGraphics.makeOrthoMatrix4 = function (b, j, a, h, e, d) {
	var i = new Float32Array(16);
	var f = j - b;
	var c = h - a;
	var g = d - e;
	i[0] = 2 / f;
	i[1] = 0;
	i[2] = 0;
	i[3] = 0;
	i[4] = 0;
	i[5] = 2 / c;
	i[6] = 0;
	i[7] = 0;
	i[8] = 0;
	i[9] = 0;
	i[10] = -2 / g;
	i[11] = 0;
	i[12] = -(j + b) / f;
	i[13] = -(h - a) / c;
	i[14] = -(d + e) / g;
	i[15] = 1;
	return i;
};
WebGraphics.makeFrustumMatrix4 = function (c, j, a, i, f, e) {
	var g = j - c;
	var d = i - a;
	var h = e - f;
	var b = new Float32Array(16);
	b[0] = (f * 2) / g;
	b[1] = 0;
	b[2] = 0;
	b[3] = 0;
	b[4] = 0;
	b[5] = (f * 2) / d;
	b[6] = 0;
	b[7] = 0;
	b[8] = (j + c) / g;
	b[9] = (i + a) / d;
	b[10] = -(e + f) / h;
	b[11] = -1;
	b[12] = 0;
	b[13] = 0;
	b[14] = (-2 * e * f) / h;
	b[15] = 0;
	return b;
};
WebGraphics.makePerspectiveMatrix4 = function (c, b, e, a) {
	var f = e * Math.tan((c * Math.PI) / 360);
	var d = f * b;
	return WebGraphics.makeFrustumMatrix4(-d, d, -f, f, e, a);
};
WebGraphics.multiplyMatrix4 = function (I, G) {
	var x = new Float32Array(16);
	var l = I[0],
		k = I[4],
		i = I[8],
		g = I[12],
		w = I[1],
		v = I[5],
		u = I[9],
		t = I[13],
		L = I[2],
		K = I[6],
		J = I[10],
		H = I[14],
		o = I[3],
		n = I[7],
		j = I[11],
		h = I[15];
	var E = G[0],
		C = G[4],
		A = G[8],
		y = G[12],
		f = G[1],
		e = G[5],
		d = G[9],
		c = G[13],
		s = G[2],
		r = G[6],
		q = G[10],
		p = G[14],
		F = G[3],
		D = G[7],
		B = G[11],
		z = G[15];
	x[0] = l * E + k * f + i * s + g * F;
	x[4] = l * C + k * e + i * r + g * D;
	x[8] = l * A + k * d + i * q + g * B;
	x[12] = l * y + k * c + i * p + g * z;
	x[1] = w * E + v * f + u * s + t * F;
	x[5] = w * C + v * e + u * r + t * D;
	x[9] = w * A + v * d + u * q + t * B;
	x[13] = w * y + v * c + u * p + t * z;
	x[2] = L * E + K * f + J * s + H * F;
	x[6] = L * C + K * e + J * r + H * D;
	x[10] = L * A + K * d + J * q + H * B;
	x[14] = L * y + K * c + J * p + H * z;
	x[3] = o * E + n * f + j * s + h * F;
	x[7] = o * C + n * e + j * r + h * D;
	x[11] = o * A + n * d + j * q + h * B;
	x[15] = o * y + n * c + j * p + h * z;
	return x;
};
WebGraphics.scaleMatrix4 = function (b, e, d, c) {
	var a = WebGraphics.createMatrix4();
	a[0] = e;
	a[5] = d;
	a[10] = c;
	return WebGraphics.multiplyMatrix4(b, a);
};
WebGraphics.translateMatrix4 = function (c, d, b, e) {
	var a = WebGraphics.createMatrix4();
	a[12] = d;
	a[13] = b;
	a[14] = e;
	return WebGraphics.multiplyMatrix4(c, a);
};
WebGraphics.rotateMatrix4AboutXYZ = function (k, d, j, i, h) {
	var b = WebGraphics.makePoint3D(j, i, h);
	b = WebGraphics.point3DNormalize(b);
	var c = b.x;
	var a = b.y;
	var n = b.z;
	var l = Math.cos(d);
	var f = 1 - l;
	var g = Math.sin(d);
	var e = WebGraphics.createMatrix4();
	e[0] = l + c * c * f;
	e[1] = c * a * f + n * g;
	e[2] = n * c * f - a * g;
	e[4] = c * a * f - n * g;
	e[5] = l + a * a * f;
	e[6] = n * a * f + c * g;
	e[8] = c * a * f + a * g;
	e[9] = a * n * f - c * g;
	e[10] = l + n * n * f;
	return WebGraphics.multiplyMatrix4(k, e);
};
WebGraphics.colorWithHSBA = function (h, g, i, d) {
	var f, a, m, l, k, b, j, c;
	var e = { hue: h, saturation: g, brightness: i, alpha: d };
	if (h == 1) {
		h = 0;
	}
	f = h * 6;
	a = f - Math.floor(f);
	m = i * (1 - g);
	l = i * (1 - g * a);
	k = i * (1 - g * (1 - a));
	switch (parseInt(f)) {
		case 0:
			b = i;
			c = k;
			j = m;
			break;
		case 1:
			b = l;
			c = i;
			j = m;
			break;
		case 2:
			b = m;
			c = i;
			j = k;
			break;
		case 3:
			b = m;
			c = l;
			j = i;
			break;
		case 4:
			b = k;
			c = m;
			j = i;
			break;
		case 5:
			b = i;
			c = m;
			j = l;
			break;
	}
	e.red = b;
	e.blue = j;
	e.green = c;
	return e;
};
WebGraphics.makeMat3WithAffineTransform = function (a) {
	var b = new Float32Array(9);
	b[0] = a[0];
	b[1] = a[1];
	b[2] = 0;
	b[3] = a[2];
	b[4] = a[3];
	b[5] = 0;
	b[6] = a[4];
	b[7] = a[5];
	b[8] = 1;
	return b;
};
vector3 = function (a) {
	this.create(a);
};
vector3.prototype = {
	create: function (b) {
		var a = (this.$matrix = {});
		if (!b) {
			a.m11 = 0;
			a.m12 = 0;
			a.m13 = 0;
		} else {
			a.m11 = b[0];
			a.m12 = b[1];
			a.m13 = b[2];
		}
	},
	subtract: function (b) {
		var a = this.$matrix;
		var c = b.$matrix;
		a.m11 -= c.m11;
		a.m12 -= c.m12;
		a.m13 -= c.m13;
	},
	add: function (b) {
		var a = this.$matrix;
		var c = b.$matrix;
		a.m11 += c.m11;
		a.m12 += c.m12;
		a.m13 += c.m13;
	},
	normalize: function () {
		var a = this.$matrix;
		var b = Math.sqrt(a.m11 * a.m11 + a.m12 * a.m12 + a.m13 * a.m13);
		if (b > 0) {
			a.m11 /= b;
			a.m12 /= b;
			a.m13 /= b;
		}
	},
	scale: function (b) {
		var a = this.$matrix;
		a.m11 *= b;
		a.m12 *= b;
		a.m13 *= b;
	},
	cross: function (d) {
		var e = this.$matrix;
		var f = d.$matrix;
		var c = f.m11,
			b = f.m12,
			a = f.m13;
		var i = e.m11,
			h = e.m12,
			g = e.m13;
		e.m11 = h * a - g * b;
		e.m12 = g * c - i * a;
		e.m13 = i * b - h * c;
	},
	getArray: function () {
		var a = this.$matrix;
		return [a.m11, a.m12, a.m13];
	},
};
Matrix3 = function () {
	this.identity();
};
Matrix3.prototype = {
	identity: function () {
		this.$matrix = {
			m11: 1,
			m12: 0,
			m13: 0,
			m21: 0,
			m22: 1,
			m23: 0,
			m31: 0,
			m32: 0,
			m33: 1,
		};
	},
	affineScale: function (c, b) {
		var a = this.$matrix;
		a.m11 = c;
		a.m22 = b;
	},
	affineTranslate: function (c, b) {
		var a = this.$matrix;
		a.m13 = c;
		a.m23 = b;
	},
	transformTranslate: function (b, a) {
		var c = new Matrix3();
		c.affineTranslate(b, a);
		this.multiply(c.getArray());
	},
	multiply: function (h) {
		var a = this.$matrix;
		var k = a.m11,
			j = a.m12,
			i = a.m13,
			g = a.m21,
			f = a.m22,
			e = a.m23,
			d = a.m31,
			c = a.m32,
			b = a.m33;
		a.m11 = k * h[0] + j * h[3] + i * h[6];
		a.m12 = k * h[1] + j * h[4] + i * h[7];
		a.m13 = k * h[2] + j * h[5] + i * h[8];
		a.m21 = g * h[0] + f * h[3] + e * h[6];
		a.m22 = g * h[1] + f * h[4] + e * h[7];
		a.m23 = g * h[2] + f * h[5] + e * h[8];
		a.m31 = d * h[0] + c * h[3] + b * h[6];
		a.m32 = d * h[1] + c * h[4] + b * h[7];
		a.m33 = d * h[2] + c * h[5] + b * h[8];
	},
	getArray: function () {
		var a = this.$matrix;
		return [a.m11, a.m12, a.m13, a.m21, a.m22, a.m23, a.m31, a.m32, a.m33];
	},
	getFloat32Array: function () {
		return new Float32Array(this.getArray());
	},
	getColumnMajorArray: function () {
		var a = this.$matrix;
		return [a.m11, a.m21, a.m31, a.m12, a.m22, a.m32, a.m13, a.m23, a.m33];
	},
	getColumnMajorFloat32Array: function () {
		return new Float32Array(this.getColumnMajorArray());
	},
};
Matrix4 = function () {
	this.identity();
};
Matrix4.prototype = {
	identity: function () {
		this.$matrix = {
			m11: 1,
			m12: 0,
			m13: 0,
			m14: 0,
			m21: 0,
			m22: 1,
			m23: 0,
			m24: 0,
			m31: 0,
			m32: 0,
			m33: 1,
			m34: 0,
			m41: 0,
			m42: 0,
			m43: 0,
			m44: 1,
		};
	},
	translate: function (b, e, d) {
		var c = new Matrix4();
		var a = c.$matrix;
		a.m14 = b;
		a.m24 = e;
		a.m34 = d;
		this.multiply(c);
	},
	scale: function (b, e, d) {
		var c = new Matrix4();
		var a = c.$matrix;
		a.m11 = b;
		a.m22 = e;
		a.m33 = d;
		this.multiply(c);
	},
	multiply: function (k) {
		var i = this.$matrix;
		var j = k.$matrix;
		var r = j.m11 * i.m11 + j.m21 * i.m12 + j.m31 * i.m13 + j.m41 * i.m14;
		var q = j.m12 * i.m11 + j.m22 * i.m12 + j.m32 * i.m13 + j.m42 * i.m14;
		var o = j.m13 * i.m11 + j.m23 * i.m12 + j.m33 * i.m13 + j.m43 * i.m14;
		var l = j.m14 * i.m11 + j.m24 * i.m12 + j.m34 * i.m13 + j.m44 * i.m14;
		var d = j.m11 * i.m21 + j.m21 * i.m22 + j.m31 * i.m23 + j.m41 * i.m24;
		var c = j.m12 * i.m21 + j.m22 * i.m22 + j.m32 * i.m23 + j.m42 * i.m24;
		var b = j.m13 * i.m21 + j.m23 * i.m22 + j.m33 * i.m23 + j.m43 * i.m24;
		var a = j.m14 * i.m21 + j.m24 * i.m22 + j.m34 * i.m23 + j.m44 * i.m24;
		var h = j.m11 * i.m31 + j.m21 * i.m32 + j.m31 * i.m33 + j.m41 * i.m34;
		var g = j.m12 * i.m31 + j.m22 * i.m32 + j.m32 * i.m33 + j.m42 * i.m34;
		var f = j.m13 * i.m31 + j.m23 * i.m32 + j.m33 * i.m33 + j.m43 * i.m34;
		var e = j.m14 * i.m31 + j.m24 * i.m32 + j.m34 * i.m33 + j.m44 * i.m34;
		var t = j.m11 * i.m41 + j.m21 * i.m42 + j.m31 * i.m43 + j.m41 * i.m44;
		var s = j.m12 * i.m41 + j.m22 * i.m42 + j.m32 * i.m43 + j.m42 * i.m44;
		var p = j.m13 * i.m41 + j.m23 * i.m42 + j.m33 * i.m43 + j.m43 * i.m44;
		var n = j.m14 * i.m41 + j.m24 * i.m42 + j.m34 * i.m43 + j.m44 * i.m44;
		i.m11 = r;
		i.m12 = q;
		i.m13 = o;
		i.m14 = l;
		i.m21 = d;
		i.m22 = c;
		i.m23 = b;
		i.m24 = a;
		i.m31 = h;
		i.m32 = g;
		i.m33 = f;
		i.m34 = e;
		i.m41 = t;
		i.m42 = s;
		i.m43 = p;
		i.m44 = n;
	},
	perspective: function (c, b, e, a) {
		var f = e * Math.tan((c * Math.PI) / 360);
		var d = f * b;
		return this.frustum(-d, d, -f, f, e, a);
	},
	ortho: function (c, j, a, i, f, e) {
		var g = j - c;
		var d = i - a;
		var h = e - f;
		var b = this.$matrix;
		b.m11 = 2 / g;
		b.m12 = 0;
		b.m13 = 0;
		b.m14 = -(j + c) / g;
		b.m21 = 0;
		b.m22 = 2 / d;
		b.m23 = 0;
		b.m24 = -(i + a) / d;
		b.m31 = 0;
		b.m32 = 0;
		b.m33 = -2 / h;
		b.m34 = -(e + f) / h;
		b.m41 = 0;
		b.m42 = 0;
		b.m43 = 0;
		b.m44 = 1;
	},
	frustum: function (c, j, a, i, f, e) {
		var g = j - c;
		var d = i - a;
		var h = e - f;
		var b = this.$matrix;
		b.m11 = (f * 2) / g;
		b.m12 = 0;
		b.m13 = (j + c) / g;
		b.m14 = 0;
		b.m21 = 0;
		b.m22 = (f * 2) / d;
		b.m23 = (i + a) / d;
		b.m24 = 0;
		b.m31 = 0;
		b.m32 = 0;
		b.m33 = -(e + f) / h;
		b.m34 = (-2 * e * f) / h;
		b.m41 = 0;
		b.m42 = 0;
		b.m43 = -1;
		b.m44 = 0;
	},
	getArray: function () {
		var a = this.$matrix;
		return [
			a.m11,
			a.m12,
			a.m13,
			a.m14,
			a.m21,
			a.m22,
			a.m23,
			a.m24,
			a.m31,
			a.m32,
			a.m33,
			a.m34,
			a.m41,
			a.m42,
			a.m43,
			a.m44,
		];
	},
	getFloat32Array: function () {
		return new Float32Array(this.getArray());
	},
	getColumnMajorArray: function () {
		var a = this.$matrix;
		return [
			a.m11,
			a.m21,
			a.m31,
			a.m41,
			a.m12,
			a.m22,
			a.m32,
			a.m42,
			a.m13,
			a.m23,
			a.m33,
			a.m43,
			a.m14,
			a.m24,
			a.m34,
			a.m44,
		];
	},
	getColumnMajorFloat32Array: function () {
		return new Float32Array(this.getColumnMajorArray());
	},
};
function TSUMix(e, d, c) {
	return e + (d - e) * c;
}
function TSUSineMap(a) {
	return (Math.sin(a * Math.PI - Math.PI / 2) + 1) * 0.5;
}
function TwistFX(b, c) {
	var d = 4 / 10.25;
	var a = (1 + d) * c - d * b;
	if (a < 0) {
		return 0;
	} else {
		if (a > 1) {
			return 1;
		} else {
			return TSUSineMap(a);
		}
	}
}
function CGAffineTransformMakeRotation(c) {
	var a, b;
	a = Math.sin(c);
	cosine = Math.cos(c);
	return [cosine, a, -a, cosine, 0, 0];
}
function CGAffineTransformEqualToTransform(b, a) {
	return (
		b.a === a.a &&
		b.b === a.b &&
		b.c === a.c &&
		b.d === a.d &&
		b.tx === a.tx &&
		b.ty === a.ty
	);
}
function CATransform3DEqualToTransform(e, d) {
	var c =
		e[0] === d[0] &&
		e[1] === d[1] &&
		e[2] === d[2] &&
		e[3] === d[3] &&
		e[4] === d[4] &&
		e[5] === d[5] &&
		e[6] === d[6] &&
		e[7] === d[7] &&
		e[8] === d[8] &&
		e[9] === d[9] &&
		e[10] === d[10] &&
		e[11] === d[11] &&
		e[12] === d[12] &&
		e[13] === d[13] &&
		e[14] === d[14] &&
		e[15] === d[15];
	return c;
}
function CGPointMake(a, c) {
	var b = { x: a, y: c };
	return b;
}
function CGRectIntersection(c, a) {
	var g = { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
	var d, b, f, e;
	d = Math.max(c.origin.x, a.origin.x);
	b = Math.min(c.origin.x + c.size.width, a.origin.x + a.size.width);
	if (d > b) {
		return g;
	}
	f = Math.max(c.origin.y, a.origin.y);
	e = Math.min(c.origin.y + c.size.height, a.origin.y + a.size.height);
	if (f > e) {
		return g;
	}
	g.origin.x = d;
	g.size.width = b - d;
	g.origin.y = f;
	g.size.height = e - f;
	return g;
}
function CGRectIntegral(b) {
	var a = { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
	a.origin.x = Math.floor(b.origin.x);
	a.origin.y = Math.floor(b.origin.y);
	a.size.width = Math.ceil(b.origin.x + b.size.width) - a.origin.x;
	a.size.height = Math.ceil(b.origin.y + b.size.height) - a.origin.y;
	return a;
}
function CGRectGetMinX(a) {
	return a.origin.x;
}
function CGRectGetMinY(a) {
	return a.origin.y;
}
function CGRectGetMidX(a) {
	return a.origin.x + a.size.width / 2;
}
function CGRectGetMidY(a) {
	return a.origin.y + a.size.height / 2;
}
function CGRectGetMaxX(a) {
	return a.origin.x + a.size.width;
}
function CGRectGetMaxY(a) {
	return a.origin.y + a.size.height;
}
function CGRectEqualToRect(b, a) {
	return (
		b.origin.x == a.origin.x &&
		b.origin.y == a.origin.y &&
		b.size.width == a.size.width &&
		b.size.height == a.size.height
	);
}
function CGRectMake(b, e, c, a) {
	var d = { origin: { x: b, y: e }, size: { width: c, height: a } };
	return d;
}
function CGSizeMake(c, b) {
	var a = {};
	a.width = c;
	a.height = b;
	return a;
}
function CGSizeEqualToSize(b, a) {
	return b.width === a.width && b.height === a.height;
}
var CGSizeZero = { width: 0, height: 0 };
var CGRectZero = { origin: { x: 0, y: 0 }, size: { width: 0, height: 0 } };
var TSDRectUnit = { origin: { x: 0, y: 0 }, size: { width: 1, height: 1 } };
function TSDMixFloats(d, c, e) {
	return d * (1 - e) + c * e;
}
function TSDCenterOfRect(a) {
	return WebGraphics.makePoint(CGRectGetMidX(a), CGRectGetMidY(a));
}
function TSDPointFromNormalizedRect(b, a) {
	return WebGraphics.makePoint(
		a.origin.x + b.x * a.size.width,
		a.origin.y + b.y * a.size.height
	);
}
function TSDRectWithPoints(e, d) {
	var c = Math.min(e.x, d.x);
	var g = Math.max(e.x, d.x);
	var h = Math.min(e.y, d.y);
	var f = Math.max(e.y, d.y);
	return CGRectMake(c, h, g - c, f - h);
}
function TSDGLColor(h, f, c, d) {
	var e = { r: h, g: f, b: c, a: d };
	return e;
}
var TSD8bitColorDenominator = 0.003906402593851;
function TSDGLColor4fMakeWithUInt(b) {
	var a = WebGraphics.makePoint4D(
		((b & 16711680) >> 16) * TSD8bitColorDenominator,
		((b & 65280) >> 8) * TSD8bitColorDenominator,
		(b & 255) * TSD8bitColorDenominator,
		((b & 4278190080) >> 24) * TSD8bitColorDenominator
	);
	return a;
}
function TSUReverseSquare(a) {
	var b = 1 - a;
	return 1 - b * b;
}
function mvpMatrixWithInitialStateAffineTransform(b, h) {
	var e = b.width;
	var a = b.height;
	var g = { x: e / 2, y: a / 2 };
	var f = b.anchorPoint;
	if (f.pointX !== 0.5 || f.pointY !== 0.5) {
		g.x = f.pointX * e;
		g.y = (1 - f.pointY) * a;
	}
	h = WebGraphics.translateMatrix4(h, g.x, g.y, 0);
	var c = b.rotation;
	if (c !== 0) {
		h = WebGraphics.rotateMatrix4AboutXYZ(h, -c, 0, 0, 1);
	}
	var d = b.scale;
	if (d !== 1) {
		h = WebGraphics.scaleMatrix4(h, d, d, 1);
	}
	h = WebGraphics.translateMatrix4(h, -g.x, -g.y, 0);
	return h;
}
window.requestAnimFrame = (function () {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (b, a) {
			window.setTimeout(b, 1000 / 60);
		}
	);
})();
