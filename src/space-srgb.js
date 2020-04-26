import Color, {util} from "./color.js";

Color.defineSpace({
	id: "srgb",
	name: "sRGB",
	coords: {
		red: [0, 1],
		green: [0, 1],
		blue: [0, 1]
	},
	ε: .000005,
	inGamut(coords) {
		return coords.every(c => c >= -this.ε && c <= 1 + this.ε);
	},
	white: Color.D65,

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
			let coords = this.to("srgb").coordsInGamut();

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
			// ISSUE force in gamut?
			return this.toHex();
		}
	},
	// Properties present only on sRGB colors
	instance: {
		toString ({precision, inGamut, commas, format = "%"} = {}) {
			if (format === 255) {
				format = c => c * 255;
			}

			return Color.prototype.toString.call(this, {
				precision, inGamut, commas, format,
				name: "rgb" + (commas && this.alpha < 1? "a" : "")
			});
		}
	}
});

export default Color;
export {util};
