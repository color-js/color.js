import Color, {util} from "./../color.js";

Color.defineSpace({
	id: "srgb",
	name: "sRGB",
	coords: {
		red: [0, 1],
		green: [0, 1],
		blue: [0, 1]
	},
	white: Color.whites.D65,

	// convert an array of sRGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	toLinear(RGB) {
		return RGB.map(function (val) {
			let sign = val < 0? -1 : 1;
			let abs = Math.abs(val);

			if (abs < 0.04045) {
				return val / 12.92;
			}

			return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
		});
	},
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	toGamma(RGB) {
		return RGB.map(function (val) {
			let sign = val < 0? -1 : 1;
			let abs = Math.abs(val);

			if (abs > 0.0031308) {
				return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
			}

			return 12.92 * val;
		});
	},

	// This matrix was calculated directly from the RGB and white chromaticities
	// when rounded to 8 decimal places, it agrees completely with the official matrix
	// see https://github.com/w3c/csswg-drafts/issues/5922
	toXYZ_M: [
		[ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
		[ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
		[ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ]
	],

	// This matrix is the inverse of the above;
	// again it agrees with the official definiton when rounded to 8 decimal places
	fromXYZ_M: [
		[  3.2409699419045226,  -1.537383177570094,   -0.4986107602930034  ],
		[ -0.9692436362808796,   1.8759675015077202,   0.04155505740717559 ],
		[  0.05563007969699366, -0.20397695888897652,  1.0569715142428786  ]
	],

	// convert an array of sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)
	toXYZ(rgb) {
		rgb = this.toLinear(rgb);

		return util.multiplyMatrices(this.toXYZ_M, rgb);
	},
	fromXYZ(XYZ) {
		return this.toGamma(util.multiplyMatrices(this.fromXYZ_M, XYZ));
	},
	// Properties added to Color.prototype
	properties: {
		toHex({
			alpha = true, // include alpha in hex?
			collapse = true // collapse to 3-4 digit hex when possible?
		} = {}) {
			let coords = this.to("srgb", {inGamut: true}).coords;

			if (this.alpha < 1 && alpha) {
				coords.push(this.alpha);
			}

			coords = coords.map(c => Math.round(c * 255));

			let collapsible = collapse && coords.every(c => c % 17 === 0);

			let hex = coords.map(c => {
				if (collapsible) {
					return (c/17).toString(16);
				}

				return c.toString(16).padStart(2, "0");
			}).join("");

			return "#" + hex;
		},

		get hex() {
			return this.toHex();
		}
	},
	// Properties present only on sRGB colors
	instance: {
		toString ({inGamut = true, commas, format = "%", ...rest} = {}) {
			if (format === 255) {
				format = c => c * 255;
			}
			else if (format === "hex") {
				return this.toHex(arguments[0]);
			}

			return Color.prototype.toString.call(this, {
				inGamut, commas, format,
				name: "rgb" + (commas && this.alpha < 1? "a" : ""),
				...rest
			});
		}
	},

	parseHex (str) {
		if (str.length <= 5) {
			// #rgb or #rgba, duplicate digits
			str = str.replace(/[a-f0-9]/gi, "$&$&");
		}

		let rgba = [];
		str.replace(/[a-f0-9]{2}/gi, component => {
			rgba.push(parseInt(component, 16) / 255);
		});

		return {
			spaceId: "srgb",
			coords: rgba.slice(0, 3),
			alpha: rgba.slice(3)[0]
		};
	}
});

Color.hooks.add("parse-start", env => {
	let str = env.str;

	if (/^#([a-f0-9]{3,4}){1,2}$/i.test(str)) {
		env.color = Color.spaces.srgb.parseHex(str);
	}
});

export default Color;
export {util};
