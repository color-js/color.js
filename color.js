{

let _  = self.Color = class Color {
	// Signatures:
	// new Color(stringToParse)
	// new Color(otherColor)
	// new Color(coords, alpha) // defaults to sRGB
	constructor (colorSpaceId, coords, alpha = 1) {
		if (arguments.length === 1) {
			let color = arguments[0];

			if (_.util.isString(color)) {
				// Just a string provided, parse
				color = Color.parse(color);

				if (!color) {
					throw new TypeError(`Cannot parse "${arguments[0]}" as a color`);
				}
			}

			if (color) {
				this.colorSpaceId = color.colorSpaceId;
				this.coords = color.coords;
				this.alpha = color.alpha;
			}
		}
		else {
			if (Array.isArray(colorSpaceId)) {
				// No colorSpace provided, default to sRGB
				[colorSpaceId, coords, alpha] = ["sRGB", colorSpaceId, coords];
			}

			this.colorSpaceId = colorSpaceId;
			this.coords = coords;
			this.alpha = alpha;
		}

		this.alpha = this.alpha < 1? this.alpha : 1; // this also deals with NaN etc
	}

	get colorSpace () {
		return _.spaces[this.colorSpaceId];
	}

	get colorSpaceId () {
		return this._colorSpaceId;
	}

	// Handle dynamic changes of color space
	set colorSpaceId (id) {
		id = id.toLowerCase();
		let newSpace = _.spaces[id];

		if (id !== "xyz" && !newSpace) {
			throw new TypeError(`No color space found with id = "${id}"`);
		}

		let previousColorSpaceId = this._colorSpaceId;

		if (previousColorSpaceId && this.colorSpace) {
			// We’re not setting this for the first time, need to:
			// a) Convert coords
			this.coords = this[id];

			// b) Remove instance properties from previous color space
			for (let prop in this.colorSpace.instance) {
				if (this.hasOwnProperty(prop)) {
					delete this[prop];
				}
			}
		}

		this._colorSpaceId = id;

		if (id !== "xyz") {
			// Add new instance properties from new color space
			_.util.extend(this, this.colorSpace.instance);
		}

	}

	get white () {
		return this.colorSpace.white || _.D50;
	}

	set white (value) {
		// Custom white point
		Object.defineProperty(this, "white", {value, writable: true});
		// ISSUE Should we do color adaptation of the current coords?
	}

	get XYZ () {
		if (this.colorSpaceId === "xyz") {
			return this.coords;
		}
		else {
			return this.colorSpace.toXYZ(this.coords);
		}
	}

	set XYZ (coords) {
		if (this.colorSpaceId === "xyz") {
			this.coords = coords;
		}
		else {
			this.coords = this.colorSpace.fromXYZ(coords);
		}
	}

	// 1976 DeltaE. 2.3 is the JND
	deltaE (color) {
		let lab1 = this.lab;
		let lab2 = color.lab;
		return Math.sqrt([0, 1, 2].reduce((a, i) => a + (lab2[i] - lab1[i]) ** 2, 0));
	}

	luminance () {
		return this.Y / this.white.Y;
	}

	contrast (color) {
		return (this.luminance + .05) / (color.luminance + .05);
	}

	// Convert to colorSpace and return a new color
	to (colorSpace) {
		let id = colorSpace;

		if (!_.util.isString(colorSpace)) {
			id = colorSpace.id;
		}

		return new Color(id, this[id], this.alpha);
	}

	// Adapt XYZ from white point W1 to W2
	static chromaticAdaptation (W1, W2, XYZ) {
		if (W1 === W2) {
			return XYZ;
		}

		let M;

		if (W1 === _.D65 && W2 === _.D50) {
			M = [
				[ 1.0478112,  0.0228866, -0.0501270],
				[ 0.0295424,  0.9904844, -0.0170491],
				[-0.0092345,  0.0150436,  0.7521316]
			];
		}
		else if (W1 === _.D50 && W2 === _.D65) {
			M = [
				[ 0.9555766, -0.0230393,  0.0631636],
				[-0.0282895,  1.0099416,  0.0210077],
				[ 0.0122982, -0.0204830,  1.3299098]
			];
		}

		if (M) {
			return multiplyMatrices(M, XYZ);
		}
		else {
			throw new TypeError("Only white points D50 and D65 supported for now.");
		}
	}

	/**
	 * Generic toString() method, outputs a color(spaceId ...coords) function
	 */
	toString ({precision, colorSpaceId, format, commas} = {}) {
		let strAlpha = this.alpha < 1? ` ${commas? "," : "/"} ${this.alpha}` : "";
		let coords = this.coords;
		let colorSpace = this.colorSpace;

		if (colorSpaceId && colorSpaceId !== this.colorSpaceId) {
			colorSpace = _.spaces[colorSpaceId];
			coords = this[colorSpaceId];
		}

		let id = colorSpace? colorSpace.cssId || colorSpace.id : "XYZ";

		if (precision !== undefined) {
			coords = coords.map(n => {
				let rounded = Math.round(n);
				let integerDigits = (rounded + "").length;
				return n.toPrecision(Math.max(integerDigits, precision));
			});
		}

		if (format) {
			coords = coords.map(format);
		}

		return `color(${id} ${this.coords.join(commas? ", " : " ")}${strAlpha})`;
	}

	// CSS color to Color object
	static parse (str) {
		let parsed = _.parseFunction(str);
		let isRGB = parsed && parsed.name.indexOf("rgb") === 0;

		if ((!parsed || !isRGB) && typeof document !== "undefined" && document.head) {
			// Use browser to parse when a DOM is available
			// this is how we parse #hex or color names, or RGB transformations like hsl()
			let previousColor = document.head.style.color;
			document.head.style.color = "";
			document.head.style.color = str;

			if (document.head.style.color !== previousColor) {
				let computed = getComputedStyle(document.head).color;
				document.head.style.color = previousColor;

				if (computed) {
					str = computed;
					parsed = _.parseFunction(computed);
				}
			}
		}

		// Try colorspace-specific parsing
		for (let space of Object.values(_.spaces)) {
			if (space.parse) {
				let color = space.parse(str, parsed);

				if (color) {
					return color;
				}
			}
		}

		// parsed might have changed, recalculate
		isRGB = parsed && parsed.name.indexOf("rgb") === 0;

		if (parsed) {
			// It's a function
			if (isRGB) {
				let args = parsed.args.map((c, i) => i < 3 && !c.percentage? c / 255 : +c);

				return {
					colorSpaceId: "srgb",
					coords: args.slice(0, 3),
					alpha: args[3]
				};
			}
			else if (parsed.name === "color") {
				let colorSpaceId = parsed.args.shift();
				let space = Object.values(_.spaces).find(space => (space.cssId || space.id) === colorSpaceId);

				if (space) {
					let argCount = Object.keys(space.coords).length;

					return {
						colorSpaceId: space.id,
						coords: parsed.args.slice(0, argCount),
						alpha: parsed.args.slice(argCount)[0]
					};
				}
				else {
					throw new TypeError(`Color space ${colorSpaceId} not found. Missing a plugin?`);
				}
			}
		}
	}

	/**
	 * Parse a CSS function, regardless of its name and arguments
	 * @param String str String to parse
	 * @return Object An object with {name, args, rawArgs}
	 */
	static parseFunction (str) {
		if (!str) {
			return;
		}

		str = str.trim();

		const isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
		const isNumberRegex = /^-?[\d.]+$/;
		let parts = str.match(isFunctionRegex);

		if (parts) {
			// It is a function, parse args
			let args = parts[2].match(/([-\w.]+(?:%|deg)?)/g);

			args = args.map(arg => {
				if (arg.indexOf("%") === arg.length - 1) {
					// Convert percentages to 0-1 numbers
					let n = new Number(+arg.slice(0, -1) / 100);
					n.percentage = true;
					return n;
				}
				else if (arg.indexOf("deg") === arg.length - 1) {
					// Drop deg from degrees and convert to number
					let n = new Number(+arg.slice(0, -3));
					n.deg = true;
					return n;
				}
				else if (isNumberRegex.test(arg)) {
					// Convert numerical args to numbers
					return +arg;
				}

				// Return everything else as-is
				return arg;
			});

			return {
				name: parts[1],
				rawArgs: parts[2],
				// An argument could be (as of css-color-4):
				// a number, percentage, degrees (hue), ident (in color())
				args
			};
		}
	}

	// Define a new color space
	static space ({id, inherits}) {
		let space = _.spaces[id] = arguments[0];

		if (inherits) {
			const except = ["id", "parse", "instance", "properties"];
			let parent = _.spaces[inherits];

			for (let prop in parent) {
				if (!except.includes(prop) && !(prop in space)) {
					_.util.copyDescriptor(space, parent, prop);
				}
			}
		}

		let coords = space.coords;

		if (space.poperties) {
			_.util.extend(_.prototype, space.properties);
		}

		if (space.fromLab && space.toLab && !space.fromXYZ && !space.toXYZ) {
			// Using Lab as connection space, define from/to XYZ functions
			Object.assign(space, {
				// ISSUE do we need white point adaptation here?
				fromXYZ(XYZ) {
					let Lab = Color.spaces.lab.fromXYZ(XYZ);
					return this.fromLab(Lab);
				},
				toXYZ(coords) {
					let Lab = this.toLab(coords);
					return Color.spaces.lab.toXYZ(Lab);
				}
			});
		}

		// Define getters and setters for color.colorSpaceId
		// e.g. color.lch on *any* color gives us the lch coords
		Object.defineProperty(_.prototype, id, {
			// Convert coords to coords in another colorspace and return them
			// Source colorspace: this.colorSpaceId
			// Target colorspace: id
			get() {
				// Do we have a more specific conversion function?
				// Avoids round-tripping to & from XYZ
				let Id = this.colorSpaceId[0].toUpperCase() + this.colorSpaceId.slice(1);

				if (("from" + Id) in space) {
					// No white point adaptation, we assume the custom function takes care of it
					return space["from" + Id](this.coords);
				}

				let XYZ = this.XYZ;

				if (space.white !== this.white) {
					// Different white point, perform white point adaptation
					XYZ = _.chromaticAdaptation(this.white, space.white, XYZ);
				}

				let coords = space.fromXYZ(XYZ);

				return coords;
			},
			// Convert coords in another colorspace to internal coords and set them
			// Target colorspace: this.colorSpaceId
			// Source colorspace: id
			set(coords) {
				let Id = this.colorSpaceId[0].toUpperCase() + this.colorSpaceId.slice(1);

				if (("to" + Id) in space) {
					this[id] = space["to" + Id](coords);
				}
				else {
					let XYZ = space.toXYZ(coords);

					if (space.white !== this.white) {
						// Different white point, perform white point adaptation
						XYZ = _.chromaticAdaptation(space.white, this.white, XYZ);
					}

					this.XYZ = XYZ;
				}

			},
			configurable: true,
			enumerable: true
		});

		_.defineCoordAccessors(id, Object.keys(coords));
	}

	static defineCoordAccessors(id, coordNames) {
		coordNames.forEach((coord, i) => {
			Object.defineProperty(_.prototype, coord, {
				get() {
					if (coord in this.colorSpace.coords) {
						return this.coords[i];
					}
					else {
						return this[id][i];
					}
				},
				set(value) {
					let coords = this[id];
					coords[i] = value;
					this[id] = coords;
				},
				configurable: true,
				enumerable: true
			});
		});
	}
};

_.defineCoordAccessors("XYZ", ["X", "Y", "Z"]);

_.spaces = {};
_.D50 = new Color("XYZ", [0.96422, 1.00000, 0.82521]);
_.D65 = new Color("XYZ", [0.95047, 1.00000, 1.08883]);
_.D65.white = _.D65;

_.util = {
	isString: str => Object.prototype.toString.call(str) === "[object String]",

	// Like Object.assign() but copies property descriptors (including symbols)
	extend (target, ...sources) {
		for (let source of sources) {
			if (source) {
				let descriptors = Object.getOwnPropertyDescriptors(source);
				Object.defineProperties(target, descriptors);
			}
		}

		return target;
	},

	copyDescriptor (target, source, prop) {
		let descriptor = Object.getOwnPropertyDescriptor(source, prop);
		Object.defineProperty(target, prop, descriptor);
	}
};


Color.space({
	id: "lab",
	name: "Lab",
	coords: {
		L: [0, 100],
		a: [],
		b: []
	},
	// Assuming XYZ is relative to D50, convert to CIE Lab
	// from CIE standard, which now defines these as a rational fraction
	white: _.D50,
	ε: 216/24389,  // 6^3/29^3
	κ: 24389/27,   // 29^3/3^3
	fromXYZ(XYZ) {
		const κ = this.κ, ε = this.ε, white = this.white.coords;

		// compute xyz, which is XYZ scaled relative to reference white
		let xyz = XYZ.map((value, i) => value / white[i]);

		// now compute f
		let f = xyz.map(value => value > ε ? Math.cbrt(value) : (κ * value + 16)/116);

		return [
			(116 * f[1]) - 16, 	 // L
			500 * (f[0] - f[1]), // a
			200 * (f[1] - f[2])  // b
		];
	},
	toXYZ(Lab) {
		// Convert Lab to D50-adapted XYZ
		// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
		const κ = this.κ, ε = this.ε, white = this.white.coords;

		// compute f, starting with the luminance-related term
		let f = [];
		f[1] = (Lab[0] + 16)/116;
		f[0] = Lab[1]/500 + f[1];
		f[2] = f[1] - Lab[2]/200;

		// compute xyz
		var xyz = [
			Math.pow(f[0], 3) > ε ?   Math.pow(f[0], 3)            : (116*f[0]-16)/κ,
			Lab[0] > κ * ε ?         Math.pow((Lab[0]+16)/116, 3) : Lab[0]/κ,
			Math.pow(f[2], 3)  > ε ?  Math.pow(f[2], 3)            : (116*f[2]-16)/κ
		];

		// Compute XYZ by scaling xyz by reference white
		return xyz.map((value, i) => value * white[i]);
	},
	parse (str, parsed = _.parseFunction(str)) {
		if (parsed && parsed.name === "lab") {
			let L = parsed.args[0];

			// Percentages in lab() don't translate to a 0-1 range, but a 0-100 range
			if (L.percentage) {
				parsed.args[0] = L * 100;
			}

			return {
				colorSpaceId: "lab",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString () {
			let strAlpha = this.alpha < 1? ` / ${this.alpha}` : "";
			return `lab(${this.coords[0]}% ${this.coords[1]} ${this.coords[2]}${strAlpha})`;
		}
	}
});

Color.space({
	id: "lch",
	name: "LCH",
	coords: {
		lightness: [0, 100],
		chroma: [0, ],
		hue: [],
	},
	white: _.D50,
	fromLab (Lab) {
		// Convert to polar form
		let hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;

		return [
			Lab[0], // L is still L
			Math.sqrt(Lab[1] ** 2 + Lab[2] ** 2), // Chroma
			(hue + 360) % 360 // Hue, in degrees [0 to 360)
		];
	},
	toLab (LCH) {
		// Convert from polar form
		return [
			LCH[0], // L is still L
			LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
			LCH[1] * Math.sin(LCH[2] * Math.PI / 180)  // b
		];
	},
	parse (str, parsed = _.parseFunction(str)) {
		if (parsed && parsed.name === "lch") {
			let L = parsed.args[0];

			// Percentages in lch() don't translate to a 0-1 range, but a 0-100 range
			if (L.percentage) {
				parsed.args[0] = L * 100;
			}

			return {
				colorSpaceId: "lch",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString() {
			let strAlpha = this.alpha < 1? ` / ${this.alpha}` : "";
			return `lch(${this.coords[0]}% ${this.coords[1]} ${this.coords[2]}${strAlpha})`;
		}
	}
});

Color.space({
	id: "srgb",
	name: "sRGB",
	coords: {
		red: [0, 1],
		green: [0, 1],
		blue: [0, 1]
	},
	white: _.D65,

	// convert an array of sRGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	toLinear(RGB) {
		return RGB.map(function (val) {
			if (val < 0.04045) {
				return val / 12.92;
			}

			return Math.pow((val + 0.055) / 1.055, 2.4);
		});
	},
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	toGamma(RGB) {
		return RGB.map(function (val) {
			if (val > 0.0031308) {
				return 1.055 * Math.pow(val, 1/2.4) - 0.055;
			}

			return 12.92 * val;
		});
	},

	toXYZ_M: [
		[0.4124564,  0.3575761,  0.1804375],
		[0.2126729,  0.7151522,  0.0721750],
		[0.0193339,  0.1191920,  0.9503041]
	],
	fromXYZ_M: [
		[ 3.2404542, -1.5371385, -0.4985314],
		[-0.9692660,  1.8760108,  0.0415560],
		[ 0.0556434, -0.2040259,  1.0572252]
	],
	// convert an array of sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// also
	// https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
	toXYZ(rgb) {
		rgb = this.toLinear(rgb);

		return multiplyMatrices(this.toXYZ_M, rgb);
	},
	fromXYZ(XYZ) {
		return this.toGamma(multiplyMatrices(this.fromXYZ_M, XYZ));
	},
	instance: {
		toString () {
			let strAlpha = this.alpha < 1? ` / ${this.alpha}` : "";
			return `rgb(${this.coords.map(c => c * 100 + "%").join(" ")}${strAlpha})`;
		}
	}
});

Color.space({
	inherits: "srgb",
	id: "p3",
	name: "P3",
	cssId: "display-p3",
	// Gamma correction is the same as sRGB
	// convert an array of display-p3 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// Functions are the same as sRGB, just with different matrices
	toXYZ_M: [
		[0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
		[0.2289745640697488, 0.6917385218365064,  0.079286914093745],
		[0.0000000000000000, 0.04511338185890264, 1.043944368900976]
	],
	fromXYZ_M: [
		[ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
		[-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
		[ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
	]
});

Color.space({
	inherits: "srgb",
	id: "prophoto",
	name: "ProPhoto",
	cssId: "prophoto-rgb",
	white: _.D50,
	toLinear(RGB) {
		// Transfer curve is gamma 1.8 with a small linear portion
		return RGB.map(function (val) {
			if (val < 0.031248) {
				return val / 16;
			}

			return Math.pow(val, 1.8);
		});
	},
	toGamma(RGB) {
		return RGB.map(function (val) {
			if (val > 0.001953) {
				return Math.pow(val, 1/1.8);
			}

			return 16 * val;
		});
	},
	// convert an array of  prophoto-rgb values to CIE XYZ
	// using  D50 (so no chromatic adaptation needed afterwards)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	toXYZ_M: [
		[ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
		[ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
		[ 0.0,                 0.0,                  0.8251046025104601     ]
	],
	fromXYZ_M: [
		[  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
		[ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
		[  0.0,                  0.0,                   1.2119675456389454  ]
	]
});

Color.space({
	inherits: "srgb",
	id: "a98rgb",
	name: "Adobe 98 RGB compatible",
	cssId: "a98-rgb",
	toLinear(RGB) {
		return RGB.map(val => Math.pow(val, 563/256));
	},
	toGamma(RGB) {
		return RGB.map(val => Math.pow(val, 256/563));
	},
	// convert an array of linear-light a98-rgb values to CIE XYZ
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// has greater numerical precision than section 4.3.5.3 of
	// https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
	// but the values below were calculated from first principles
	// from the chromaticity coordinates of R G B W
	toXYZ_M: [
		[ 0.5766690429101305,   0.1855582379065463,   0.1882286462349947  ],
		[ 0.29734497525053605,  0.6273635662554661,   0.07529145849399788 ],
		[ 0.02703136138641234,  0.07068885253582723,  0.9913375368376388  ]
	],
	fromXYZ_M: [
		[  2.0415879038107465,    -0.5650069742788596,   -0.34473135077832956 ],
		[ -0.9692436362808795,     1.8759675015077202,    0.04155505740717557 ],
		[  0.013444280632031142,  -0.11836239223101838,   1.0151749943912054  ]
	]
});

Color.space({
	inherits: "srgb",
	id: "rec2020",
	name: "REC.2020",
	α: 1.09929682680944,
	β: 0.018053968510807,
	toLinear(RGB) {
		const {α, β} = this;

		return RGB.map(function (val) {
			if (val < β * 4.5 ) {
				return val / 4.5;
			}

			return Math.pow((val + α -1 ) / α, 2.4);
		});
	},
	toGamma(RGB) {
		const {α, β} = this;

		return RGB.map(function (val) {
			if (val > β ) {
				return α * Math.pow(val, 1/2.4) - (α - 1);
			}

			return 4.5 * val;
		});
	},
	// convert an array of linear-light rec2020 values to CIE XYZ
	// using  D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// 0 is actually calculated as  4.994106574466076e-17
	toXYZ_M: [
		[0.6369580483012914, 0.14461690358620832,  0.1688809751641721],
		[0.2627002120112671, 0.6779980715188708,   0.05930171646986196],
		[0.000000000000000,  0.028072693049087428, 1.060985057710791]
	],
	fromXYZ_M: [
		[1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
		[-0.6666843518324892,   1.6164812366349395,   0.01576854581391113],
		[0.017639857445310783, -0.042770613257808524, 0.9421031212354738]
	]
});

}
