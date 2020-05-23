import Color from "./hsl.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

Color.defineSpace({
	id: "hwb",
	name: "HWB",
	coords: {
		hue: [0, 360],
		whiteness: [0, 100],
		blackness: [0, 100]
	},
	inGamut (coords) {
		let rgb = this.to.srgb(coords);
		return Color.inGamut("srgb", rgb);
	},
	 white: Color.whites.D65,

	from: {
		srgb (rgb) {
			let h = Color.spaces.hsl.from.srgb(rgb)[0];
			// calculate white and black
			let w = Math.min(...rgb);
			let b = 1 - Math.max(...rgb);
			w *= 100;
			b *= 100;
			return [h, w, b];
		}
	},

	to: {
		srgb (hwb) {
			let [h, w, b] = hwb;

			// Now convert percentages to [0..1]
			w /=100;
			b /= 100;

			// Normalize so white plus black is no larger than 100
			let sum = w + b;
			if (sum > 1) {
				 w /= sum;
				 b /= sum;
			}

			// From https://drafts.csswg.org/css-color-4/#hwb-to-rgb
			let rgb = Color.spaces.hsl.to.srgb([h, 100, 50]);
			for (var i = 0; i < 3; i++) {
				rgb[i] *= (1 - w - b);
				rgb[i] += w;
			}
			return rgb;
		}
	},

	 parse (str, parsed = Color.parseFunction(str)) {
		  if (parsed && /^hwba?$/.test(parsed.name)) {
			let hwb = parsed.args;

			 // white and black percentages are converted to [0, 1] by parseFunction
			hwb[1] *= 100;
			hwb[2] *= 100;

			return {
				spaceId: "hwb",
				coords: hwb.slice(0, 3),
				alpha: hwb[3]
			};
		}
	 },

	 instance: {
		toString ({precision, format} = {}) {
				if (!format) {
				format = (c, i) => i > 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {
				inGamut: true, // hwb() out of gamut makes no sense
					 precision, commas: false,  // never commas
					 format,
				name: "hwb"
			});
		  }
	 }
});
