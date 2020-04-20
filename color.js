{

let _  = self.Color = class Color {
	// Signatures:
	// new Color(stringToParse)
	// new Color(otherColor)
	// new Color(coords, alpha) // defaults to sRGB
	constructor(colorSpaceId, coords, alpha = 1) {
		if (arguments.length === 1) {
			let color = arguments[0];
			if (typeof arguments[0] === "string") {
				// Just a string provided, parse
				color = Color.parse(arguments[0]);
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

			this.colorSpaceId = colorSpaceId.toLowerCase();
			this.coords = coords;
			this.alpha = alpha;
		}

		this.alpha = this.alpha < 1? this.alpha : 1; // this also deals with NaN etc
	}

	get colorSpace() {
		return _.spaces[this.colorSpaceId.toLowerCase()];
	}

	get white() {
		return this.colorSpace.white || _.D50;
	}

	set white(value) {
		// Custom white point
		Object.defineProperty(this, "white", {value, writable: true});
		// FIXME Should we do color adaptation of the current coords?
	}

	get XYZ() {
		if (this.colorSpaceId.toLowerCase() === "xyz") {
			return this.coords;
		}
		else {
			return this.colorSpace.toXYZ(this.coords);
		}
	}

	set XYZ(coords) {
		if (this.colorSpaceId.toLowerCase() === "xyz") {
			this.coords = coords;
		}
		else {
			this.coords = this.colorSpace.fromXYZ(coords);
		}
	}

	// 1976 DeltaE. 2.3 is the JND
	deltaE(color) {
		let lab1 = this.lab;
		let lab2 = color.lab;
		return Math.sqrt([0, 1, 2].reduce((a, i) => a + (lab2[i] - lab1[i]) ** 2, 0));
	}

	luminance() {
		return this.Y / this.white.Y;
	}

	contrast(color) {
		return this.luminance / color.luminance;
	}

	// Adapt XYZ from white point W1 to W2
	static chromaticAdaptation(W1, W2, XYZ) {
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

	toString() {
		let strAlpha = this.alpha < 1? ` / ${this.alpha}` : "";
		return `color(${this.colorSpaceId} ${this.coords.join(" ")}${strAlpha})`;
	}

	// CSS color to Color object
	static parse(str) {
		// First try colorspace-specific parsing
		for (let id in _.spaces) {
			let space = _.spaces[id];

			if (space.parse) {
				let color = space.parse(str);

				if (color) {
					return color;
				}
			}
		}

		// Parse generic color() function
		// TODO
	}

	static space({id, coords}) {
		let space = _.spaces[id] = arguments[0];

		if (space.fromLab && space.toLab && !space.fromXYZ && !space.toXYZ) {
			// Using Lab as connection space, define from/to XYZ functions
			Object.assign(space, {
				// FIXME do we need white point adaptation here?
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

		// Make certain properties non-enumerable so that when other spaces extend this space they don't inherit them too
		for (let prop of ["parse"]) {
			Object.defineProperty(space, prop, {
				value: space[prop],
				writable: true,
				enumerable: false,
				configurable: true
			});
		}

		Object.defineProperty(_.prototype, id, {
			// Convert coords to coords from id
			get() {
				// Do we have a more specific conversion function?
				// Avoids round-tripping to & from XYZ
				let Id = this.colorSpaceId[0].toUpperCase() + this.colorSpaceId.slice(1);

				if ("from" + Id in space) {
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
			set(coords) {
				if ("toLab" in space) {
					return space.fromLab(this.lab);
				}

				this.XYZ = space[id].toXYZ(coords);
			},
			configurable: true,
			enumerable: true
		});

		_.defineCoordGetters(id, Object.keys(coords));
	}

	static defineCoordGetters(id, coordNames) {
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

_.defineCoordGetters("XYZ", ["X", "Y", "Z"]);

_.spaces = {};
_.D50 = new Color("XYZ", [0.96422, 1.00000, 0.82521]);
_.D65 = new Color("XYZ", [0.95047, 1.00000, 1.08883]);

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
	fromLab(Lab) {
		// Convert to polar form
		let hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;

		return [
			Lab[0], // L is still L
			Math.sqrt(Lab[1] ** 2 + Lab[2] ** 2), // Chroma
			(hue + 360) % 360 // Hue, in degrees [0 to 360)
		];
	},
	toLab(LCH) {
		// Convert from polar form
		return [
			LCH[0], // L is still L
			LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
			LCH[1] * Math.sin(LCH[2] * Math.PI / 180)  // b
		];
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

	parse: str => {
		let previousColor = document.head.style.color;
		document.head.style.color = "";
		document.head.style.color = str;
		let computed = getComputedStyle(document.head).color;
		document.head.style.color = previousColor;

		if (computed && /^rgba?(.+?)$/.test(computed)) {
			let rgba = computed.match(/-?[\d.]+/g);

			if (rgba) {
				// Convert r, g, b to 0-1 range
				rgba = rgba.map((c, i) => i < 3? c / 255 : +c);

				return {
					colorSpaceId: "srgb",
					coords: rgba.slice(0, 3),
					alpha: rgba[3]
				};
			}
		}
	}
});

Color.space(Object.assign({}, Color.spaces.srgb, {
	id: "p3",
	name: "P3",
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
}));

Color.space(Object.assign({}, Color.spaces.srgb, {
	id: "prophoto",
	name: "ProPhoto",
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
}));

Color.space(Object.assign({}, Color.spaces.srgb, {
	id: "a98rgb",
	name: "Adobe 98 RGB",
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
}));

Color.space(Object.assign({}, Color.spaces.srgb, {
	id: "rec2020",
	name: "REC.2020",
	α: 1.09929682680944,
	β: 0.018053968510807,
	toLinear(RGB) {
		const α = this.α, β = this.β;

		return RGB.map(function (val) {
			if (val < β * 4.5 ) {
				return val / 4.5;
			}

			return Math.pow((val + α -1 ) / α, 2.4);
		});
	},
	toGamma(RGB) {
		const α = this.α, β = this.β;

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
}));

}
