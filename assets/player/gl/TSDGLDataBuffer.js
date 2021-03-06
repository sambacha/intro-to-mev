var CHAR_MAX = 127;
var UCHAR_MAX = 255;
var SHRT_MAX = 32767;
var USHRT_MAX = 65535;
var GL_FALSE = 0;
var GL_TRUE = 1;
var GL_POINTS = 0;
var GL_LINES = 1;
var GL_LINE_LOOP = 2;
var GL_LINE_STRIP = 3;
var GL_TRIANGLES = 4;
var GL_TRIANGLE_STRIP = 5;
var GL_TRIANGLE_FAN = 6;
var GL_BYTE = 5120;
var GL_UNSIGNED_BYTE = 5121;
var GL_SHORT = 5122;
var GL_UNSIGNED_SHORT = 5123;
var GL_INT = 5124;
var GL_UNSIGNED_INT = 5125;
var GL_FLOAT = 5126;
var GL_DOUBLE = 5130;
var GL_STREAM_DRAW = 35040;
var GL_STATIC_DRAW = 35044;
var GL_DYNAMIC_DRAW = 35048;
var GL_FLOAT_VEC2 = 35664;
var GL_FLOAT_VEC3 = 35665;
var GL_FLOAT_VEC4 = 35666;
var GL_INT_VEC2 = 35667;
var GL_INT_VEC3 = 35668;
var GL_INT_VEC4 = 35669;
var GL_BOOL = 35670;
var GL_BOOL_VEC2 = 35671;
var GL_BOOL_VEC3 = 35672;
var GL_BOOL_VEC4 = 35673;
var GL_FLOAT_MAT2 = 35674;
var GL_FLOAT_MAT3 = 35675;
var GL_FLOAT_MAT4 = 35676;
var GL_SAMPLER_1D = 35677;
var GL_SAMPLER_2D = 35678;
var GL_SAMPLER_3D = 35679;
var GL_SAMPLER_CUBE = 35680;
var TSDGLDataBufferDataTypeUnknown = 0;
var TSDGLDataBufferDataTypeByte = GL_BYTE;
var TSDGLDataBufferDataTypeUnsignedByte = GL_UNSIGNED_BYTE;
var TSDGLDataBufferDataTypeShort = GL_SHORT;
var TSDGLDataBufferDataTypeUnsignedShort = GL_UNSIGNED_SHORT;
var TSDGLDataBufferDataTypeFloat = GL_FLOAT;
function TSDGLDataBufferDataTypeAsGLEnum(b) {
	var a = 0;
	switch (b) {
		case TSDGLDataBufferDataTypeByte:
			a = GL_BYTE;
			break;
		case TSDGLDataBufferDataTypeUnsignedByte:
			a = GL_UNSIGNED_BYTE;
			break;
		case TSDGLDataBufferDataTypeUnsignedShort:
			a = GL_UNSIGNED_SHORT;
			break;
		case TSDGLDataBufferDataTypeShort:
			a = GL_SHORT;
			break;
		case TSDGLDataBufferDataTypeFloat:
			a = GL_FLOAT;
			break;
		case TSDGLDataBufferDataTypeUnknown:
			console.log("Unknown TSDGLdataBufferDataType!");
			break;
	}
	return a;
}
function TSDGLDataBufferDataTypeSize(b) {
	var a = 0;
	switch (b) {
		case GL_BYTE:
			a = 1;
			break;
		case GL_UNSIGNED_BYTE:
			a = 1;
			break;
		case GL_SHORT:
			a = 2;
			break;
		case GL_UNSIGNED_SHORT:
			a = 2;
			break;
		case GL_FLOAT:
			a = 4;
			break;
		default:
			break;
	}
	return a;
}
function TSDGLPoint2DByteFromPoint2D(e, b) {
	var a = TSDGLbyteFromFloat(e.x, b);
	var d = TSDGLbyteFromFloat(e.y, b);
	var c = new Int8Array(2);
	c.set([a, d], 0);
	return c;
}
function TSDGLbyteFromFloat(b, a) {
	if (a) {
		b *= CHAR_MAX;
	}
	return b;
}
function TSDGLPoint2DUnsignedByteFromPoint2D(e, b) {
	var a = TSDGLubyteFromFloat(e.x, b);
	var d = TSDGLubyteFromFloat(e.y, b);
	var c = new Uint8Array(2);
	c.set([a, d], 0);
	return c;
}
function TSDGLubyteFromFloat(b, a) {
	if (a) {
		b *= UCHAR_MAX;
	}
	return b;
}
function TSDGLPoint2DShortFromPoint2D(e, b) {
	var a = TSDGLshortFromFloat(e.x, b);
	var d = TSDGLshortFromFloat(e.y, b);
	var c = new Int16Array(4);
	c.set([a, d], 0);
	return c;
}
function TSDGLshortFromFloat(b, a) {
	if (a) {
		b *= SHRT_MAX;
	}
	return b;
}
function TSDGLPoint2DUnsignedShortFromPoint2D(e, b) {
	var a = TSDGLushortFromFloat(e.x, b);
	var d = TSDGLushortFromFloat(e.y, b);
	var c = new Uint16Array(4);
	c.set([a, d], 0);
	return c;
}
function TSDGLushortFromFloat(b, a) {
	if (a) {
		b *= USHRT_MAX;
	}
	return b;
}
function TSDGLDataBufferSetGLPoint2DWithDataType(d, g, a, c, b) {
	switch (a) {
		case TSDGLDataBufferDataTypeByte:
			var e = TSDGLPoint2DByteFromPoint2D(b, c);
			var f = new Int8Array(d);
			f.set(e, g);
			break;
		case TSDGLDataBufferDataTypeUnsignedByte:
			var e = TSDGLPoint2DUnsignedByteFromPoint2D(b, c);
			var f = new Uint8Array(d);
			f.set(e, g);
			break;
		case TSDGLDataBufferDataTypeShort:
			var e = TSDGLPoint2DShortFromPoint2D(b, c);
			var f = new Int16Array(d);
			f.set(e, g / 2);
			break;
		case TSDGLDataBufferDataTypeUnsignedShort:
			var e = TSDGLPoint2DUnsignedShortFromPoint2D(b, c);
			var f = new Uint16Array(d);
			f.set(e, g / 2);
			break;
		case TSDGLDataBufferDataTypeFloat:
			var f = new Float32Array(d);
			f.set([b.x, b.y], g / 4);
			break;
		case TSDGLDataBufferDataTypeUnknown:
			console.log("Unknown data type!");
			break;
	}
}
var TSDGLDataBufferAttribute = Class.create({
	initialize: function (c, d, a, e, b) {
		this.locationInShader = -1;
		this.bufferOffset = null;
		this.dataArrayBuffer = null;
		this.dataBuffer = null;
		this.initWithName(c, d, a, e, b);
	},
	initWithName: function (c, d, a, e, b) {
		this.name = c;
		this.bufferUsage = d;
		this.dataType = a;
		if (this.dataType === GL_SHORT) {
			this.dataType = GL_FLOAT;
		}
		this.componentCount = b;
		this.isNormalized = e;
		this.locationInShader = -1;
	},
});
var TSDGLDataArrayBuffer = Class.create({
	initialize: function (a) {
		this.gl = a;
		this._vertexAttributes = null;
		this.mVertexCount = 0;
		this._dataTypeSizeInBytes = 0;
		this._bufferUsage = 0;
		this.mNeedsUpdateFirstIndex = [];
		this.mNeedsUpdateLastIndex = [];
		this.mGLData = null;
		this.mGLDataBufferHasBeenSetup = false;
		this.mGLDataBuffers = [];
		this.mAttributeOffsetsDictionary = null;
		this.GLDataBufferEntrySize = 0;
		this.bufferCount = 1;
		this.currentBufferIndex = 0;
	},
	initWithVertexAttributes: function (g, a, f) {
		this._vertexAttributes = g.slice();
		this.mVertexCount = a;
		this.mAttributeOffsetsDictionary = {};
		var b = 0;
		var e = 0;
		for (var h = 0, c = this._vertexAttributes.length; h < c; h++) {
			var d = this._vertexAttributes[h];
			d.dataArrayBuffer = this;
			var k = TSDGLDataBufferDataTypeSize(d.dataType);
			if (this._bufferUsage === 0) {
				this._bufferUsage = d.bufferUsage;
			}
			d.bufferOffset = e;
			var j = d.componentCount * k;
			j = (j + 3) & ~3;
			e += j;
			b += d.componentCount * 4;
		}
		this.GLDataBufferEntrySize = e;
		if (this.GLDataBufferEntrySize > 0) {
			this.mGLData = new ArrayBuffer(
				this.mVertexCount * this.GLDataBufferEntrySize
			);
		}
		this.bufferCount = f;
		this.mNeedsUpdateFirstIndex = [];
		this.mNeedsUpdateLastIndex = [];
		for (var h = 0; h < f; h++) {
			this.mNeedsUpdateFirstIndex[h] = -1;
			this.mNeedsUpdateLastIndex[h] = -1;
		}
	},
	p_setupGLDataBufferIfNecessary: function () {
		var b = this.gl;
		if (this.mGLDataBufferHasBeenSetup) {
			return;
		}
		for (var a = 0; a < this.bufferCount; a++) {
			this.mGLDataBuffers[a] = b.createBuffer();
			b.bindBuffer(b.ARRAY_BUFFER, this.mGLDataBuffers[a]);
			b.bufferData(b.ARRAY_BUFFER, this.mGLData, this._bufferUsage);
			this.mNeedsUpdateFirstIndex[a] = -1;
			this.mNeedsUpdateLastIndex[a] = -1;
		}
		this.mGLDataBufferHasBeenSetup = true;
	},
	updateDataBufferIfNecessary: function () {
		this.p_setupGLDataBufferIfNecessary();
		if (!this.hasUpdatedData()) {
			return;
		}
		if (this._bufferUsage == GL_STATIC_DRAW) {
			console.log(
				"We're GL_STATIC_DRAW but trying (and FAILING) to update the array after initial setup!"
			);
			return;
		}
		var g = this.gl;
		var b = Number.MAX_SAFE_INTEGER;
		var h = -1;
		for (var d = 0; d < this.bufferCount; d++) {
			var e = this.mNeedsUpdateFirstIndex[d];
			if (e !== -1) {
				b = Math.min(b, e);
			}
			var a = this.mNeedsUpdateLastIndex[d];
			if (a !== -1) {
				h = Math.max(h, this.mNeedsUpdateLastIndex[d]);
			}
		}
		var f = b;
		var c = h + 1 - b;
		f *= this.GLDataBufferEntrySize;
		c *= this.GLDataBufferEntrySize;
		g.bindBuffer(g.ARRAY_BUFFER, this.mGLDataBuffers[this.currentBufferIndex]);
		g.bufferSubData(g.ARRAY_BUFFER, f, this.mGLData);
		this.mNeedsUpdateFirstIndex[this.currentBufferIndex] = -1;
		this.mNeedsUpdateLastIndex[this.currentBufferIndex] = -1;
	},
	p_bufferOffsetOfAttribute: function (c, b, a) {
		var d = b * this.GLDataBufferEntrySize;
		d += c.bufferOffset;
		if (a !== 0) {
			d += TSDGLDataBufferDataTypeSize(c.dataType) * a;
		}
		return d;
	},
	setGLPoint2D: function (b, c, a) {
		var d = this.p_bufferOffsetOfAttribute(c, a, 0);
		TSDGLDataBufferSetGLPoint2DWithDataType(
			this.mGLData,
			d,
			c.dataType,
			c.isNormalized,
			b
		);
		this.addIndexNeedsUpdate(a);
	},
	enableVertexAttributeArrayBuffersWithShader: function (f) {
		var h = this.gl;
		this.updateDataBufferIfNecessary();
		h.bindBuffer(h.ARRAY_BUFFER, this.mGLDataBuffers[this.currentBufferIndex]);
		for (var c = 0, e = this._vertexAttributes.length; c < e; c++) {
			var d = this._vertexAttributes[c];
			var a = d.locationInShader;
			if (a === -1) {
				a = f.locationForAttribute(d.name);
				if (a === -1) {
					console.log("Could not find attribute " + d.name + "in shader!");
				}
				d.locationInShader = a;
			}
			var g = 0;
			if (this._vertexAttributes.length > 1) {
				g = this.GLDataBufferEntrySize;
			}
			var b = TSDGLDataBufferDataTypeAsGLEnum(d.dataType);
			h.enableVertexAttribArray(a);
			h.vertexAttribPointer(
				a,
				d.componentCount,
				b,
				d.isNormalized ? GL_TRUE : GL_FALSE,
				g,
				d.bufferOffset
			);
		}
	},
	disableVertexAttributeArrayBuffersWithShader: function (d) {
		var e = this.gl;
		for (var a = 0, c = this._vertexAttributes.length; a < c; a++) {
			var b = this._vertexAttributes[a];
			e.disableVertexAttribArray(b.locationInShader);
		}
		e.bindBuffer(e.ARRAY_BUFFER, null);
	},
	hasUpdatedData: function () {
		for (var a = 0; a < this.bufferCount; a++) {
			if (this.mNeedsUpdateFirstIndex[a] !== -1) {
				return true;
			}
		}
		return false;
	},
	addIndexNeedsUpdate: function (b) {
		var c = this.currentBufferIndex;
		var d = this.mNeedsUpdateFirstIndex;
		var a = this.mNeedsUpdateLastIndex;
		d[c] = d[c] == -1 ? b : Math.min(d[c], b);
		a[c] = a[c] == -1 ? b : Math.max(a[c], b);
	},
});
var TSDGLDataBuffer = Class.create({
	initialize: function (a) {
		this.gl = a;
		this.mCurrentBufferIndex = 0;
		this.mArrayBuffers = [];
		this.mAttributeToArrayBuffersDictionary = {};
		this.mElementArrayCount = 0;
		this.mGLElementData = null;
		this.mGLElementDataBufferWasSetup = false;
		this.mGLElementDataBuffer = null;
		this.mGLElementMeshSize = { width: 0, height: 0 };
		this.mGLElementQuadParticleCount = 0;
	},
	p_setupGLElementArrayBufferIfNecessary: function () {
		var e = this.gl;
		if (this.mGLElementDataBufferWasSetup) {
			return;
		}
		if (!this.mGLElementData) {
			this.mGLElementDataBufferWasSetup = true;
			return;
		}
		var b = false;
		var d = 0;
		if (!CGSizeEqualToSize(this.mGLElementMeshSize, CGSizeZero)) {
			b = true;
			for (var f = 0; f < this.mGLElementMeshSize.height - 1; ++f) {
				for (var a = 0; a < this.mGLElementMeshSize.width; ++a) {
					this.setGLushort((f + 0) * this.mGLElementMeshSize.width + a, d++);
					this.setGLushort((f + 1) * this.mGLElementMeshSize.width + a, d++);
				}
			}
		} else {
			if (this.mGLElementQuadParticleCount != 0) {
				b = true;
				this.drawMode = GL_TRIANGLES;
				for (var c = 0; c < this.mGLElementQuadParticleCount; ++c) {
					this.setGLushort(4 * c + 0, d++);
					this.setGLushort(4 * c + 1, d++);
					this.setGLushort(4 * c + 2, d++);
					this.setGLushort(4 * c + 0, d++);
					this.setGLushort(4 * c + 2, d++);
					this.setGLushort(4 * c + 3, d++);
				}
			}
		}
		this.mGLElementDataBuffer = e.createBuffer();
		e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.mGLElementDataBuffer);
		this.mGLElementDataBufferWasSetup = true;
	},
	newDataBufferWithVertexAttributes: function (b, d, a) {
		var c = d.width * d.height;
		var e = d.width * 2 * (d.height - 1);
		this.initWithVertexAttributesDesignated(b, c, e, a);
		this.mGLElementMeshSize = d;
	},
	initWithVertexAttributes: function (a, c) {
		var b = c.width * c.height;
		var d = c.width * 2 * (c.height - 1);
		this.initWithVertexAttributesDesignated(a, b, d, false);
		this.mGLElementMeshSize = c;
	},
	initWithVertexAttributesDesignated: function (f, a, l, j) {
		this._doubleBuffered = j;
		this.drawMode = GL_TRIANGLE_STRIP;
		this._vertexAttributes = f;
		this._vertexCount = a;
		this.mArrayBuffers = [];
		this.mAttributeToArrayBuffersDictionary = {};
		var n = f.slice();
		while (n.length > 0) {
			var d = n[0];
			var m = [];
			for (var h = 0, c = n.length; h < c; h++) {
				var b = n[h];
				if (b.bufferUsage == d.bufferUsage) {
					m.push(b);
				}
			}
			var e = j && d.bufferUsage !== GL_STATIC_DRAW ? 2 : 1;
			var k = new TSDGLDataArrayBuffer(this.gl);
			k.initWithVertexAttributes(m, a, e);
			for (var h = 0, c = m.length; h < c; h++) {
				var b = m[h];
				b.dataBuffer = this;
				this.mAttributeToArrayBuffersDictionary[b.name] = k;
			}
			this.mArrayBuffers.push(k);
			for (var h = 0, c = m.length; h < c; h++) {
				var g = m[h];
				n.splice(n.indexOf(g), 1);
			}
		}
		if (l > 0) {
			this.mElementArrayCount = l;
			this.mGLElementData = new ArrayBuffer(this.mElementArrayCount * 2);
		}
	},
	initWithVertexRect: function (u, p, k, m, s) {
		var q = this.gl;
		var j = !CGRectEqualToRect(p, CGRectZero);
		var f = [];
		var l = new TSDGLDataBufferAttribute(
			"Position",
			GL_STATIC_DRAW,
			GL_FLOAT,
			false,
			2
		);
		f.push(l);
		var e;
		if (j) {
			var o = GL_SHORT;
			if (
				CGRectEqualToRect(p, CGRectMake(0, 0, 1, 1)) &&
				CGSizeEqualToSize(k, CGSizeMake(2, 2))
			) {
				o = GL_UNSIGNED_BYTE;
			}
			e = new TSDGLDataBufferAttribute("TexCoord", GL_STATIC_DRAW, o, true, 2);
			f.push(e);
		}
		var c;
		if (s) {
			c = new TSDGLDataBufferAttribute(
				"Center",
				GL_STATIC_DRAW,
				GL_FLOAT,
				false,
				2
			);
			f.push(c);
		}
		this.initWithVertexAttributes(f, k);
		var h = 0;
		var t = TSDCenterOfRect(u);
		var i = parseInt(k.width - 1);
		var a = parseInt(k.height - 1);
		for (var g = 0; g <= a; ++g) {
			for (var d = 0; d <= i; ++d) {
				var n = WebGraphics.makePoint(d / i, g / a);
				var r = TSDPointFromNormalizedRect(n, u);
				this.setGLPoint2D(r, l, h);
				if (j) {
					var b = TSDPointFromNormalizedRect(n, p);
					if (m) {
						b = WebGraphics.makePoint(b.x, 1 - b.y);
					}
					this.setGLPoint2D(b, e, h);
				}
				if (s) {
					this.setGLPoint2D(t, c, h);
				}
				h++;
			}
		}
	},
	setGLPoint2D: function (b, c, a) {
		c.dataArrayBuffer.setGLPoint2D(b, c, a);
	},
	setGLushort: function (a, b) {
		var d = b;
		var c = new Uint16Array(this.mGLElementData);
		c.set([a], d);
	},
	enableElementArrayBuffer: function () {
		var a = this.gl;
		this.p_setupGLElementArrayBufferIfNecessary();
		if (this.mGLElementDataBufferWasSetup) {
			a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this.mGLElementDataBuffer);
		}
	},
	disableElementArrayBuffer: function () {
		var a = this.gl;
		if (this.mGLElementDataBufferWasSetup) {
			a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, null);
		}
	},
	enableDataBufferWithShader: function (d) {
		if (!d.isActive) {
			d.activate();
		}
		for (var b = 0, c = this.mArrayBuffers.length; b < c; b++) {
			var a = this.mArrayBuffers[b];
			a.enableVertexAttributeArrayBuffersWithShader(d);
		}
		this.enableElementArrayBuffer();
		this._enabledShader = d;
		this._isEnabled = true;
	},
	disableDataBufferWithShader: function (d) {
		if (!this._isEnabled) {
			return;
		}
		this.disableElementArrayBuffer();
		for (var b = 0, c = this.mArrayBuffers.length; b < c; b++) {
			var a = this.mArrayBuffers[b];
			a.disableVertexAttributeArrayBuffersWithShader(d);
		}
		this._enabledShader = null;
		this._isEnabled = false;
	},
	drawWithShader: function (h, b) {
		var f = this.gl;
		var g = {
			location: 0,
			length:
				this.mElementArrayCount > 0
					? this.mElementArrayCount
					: this._vertexCount,
		};
		this.enableDataBufferWithShader(h);
		if (this.mGLElementDataBufferWasSetup && this.mElementArrayCount > 0) {
			f.bufferData(f.ELEMENT_ARRAY_BUFFER, this.mGLElementData, f.STATIC_DRAW);
			if (!CGSizeEqualToSize(this.mGLElementMeshSize, CGSizeZero)) {
				var a = this.mGLElementMeshSize.width;
				for (var j = 0; j < this.mGLElementMeshSize.height - 1; ++j) {
					f.drawElements(this.drawMode, a * 2, f.UNSIGNED_SHORT, 2 * j * a * 2);
				}
			} else {
				f.drawElements(
					this.drawMode,
					g.length,
					f.UNSIGNED_SHORT,
					2 * g.location
				);
			}
		} else {
			f.drawArrays(this.drawMode, g.location, g.length);
		}
		this.disableDataBufferWithShader(h);
		if (this.isDoubleBuffered) {
			this.mCurrentBufferIndex = (this.mCurrentBufferIndex + 1) % 2;
			for (var e = 0, c = this.mArrayBuffers.length; e < c; e++) {
				var d = this.mArrayBuffers[e];
				if (d.bufferCount != 1) {
					d.currentBufferIndex = this.mCurrentBufferIndex;
				}
			}
		}
		if (b) {
			h.deactivate();
		}
	},
	vertexAttributeNamed: function (a) {
		for (var c in this._vertexAttributes) {
			var b = this._vertexAttributes[c];
			if (b.name === a) {
				return b;
			}
		}
		return null;
	},
});
