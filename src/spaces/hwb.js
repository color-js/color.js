import Color, {angles} from "./hsl.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

Color.defineSpace({
	id: "hwb",
	name: "HWB",
	coords: {
		hue: angles.range,
		whiteness: [0, 100],
		blackness: [0, 100]
	},
	inGamut (coords, epsilon) {
		let rgb = this.to.srgb(coords);
		return Color.inGamut("srgb", rgb, {epsilon: epsilon});
	},
	 white: Color.whites.D65,

	from: {
		srgb (rgb) {
			let hsl = Color.spaces.hsl.from.srgb(rgb);
			let h = hsl[0];
			// calculate white and black
			let w = Math.min(...rgb);
			let b = 1 - Math.max(...rgb);
			w *= 100;
			b *= 100;
			return [h, w, b];
		},

		hsv (hsv) {
			let [h, s, v] = hsv;

			return [h, v * (100 - s) / 100, 100 - v];
		},

		hsl (hsl) {
			let hsv = Color.spaces.hsv.from.hsl(hsl);
			return this.hsv(hsv);
		}
	},

	to: {
		srgb (hwb) {
			let [h, w, b] = hwb;

			// Now convert percentages to [0..1]
			w /= 100;
			b /= 100;

			// Achromatic check (white plus black >= 1)
			let sum = w + b;
			if (sum >= 1) {
				 let gray = w / sum;
				 return [gray, gray, gray];
			}

			// From https://drafts.csswg.org/css-color-4/#hwb-to-rgb
			let rgb = Color.spaces.hsl.to.srgb([h, 100, 50]);
			for (var i = 0; i < 3; i++) {
				rgb[i] *= (1 - w - b);
				rgb[i] += w;
			}
			return rgb;
		},

		hsv (hwb) {
			let [h, w, b] = hwb;

			// Now convert percentages to [0..1]
			w /= 100;
			b /= 100;

			// Achromatic check (white plus black >= 1)
			let sum = w + b;
			if (sum >= 1) {
				 let gray = w / sum;
				 return [h, 0, gray * 100];
			}

			let v = (1 - b);
			let s = (v === 0) ? 0 : 1 - w / v;
			return [h, s * 100, v * 100];
		},

		hsl (hwb) {
			let hsv = Color.spaces.hwb.to.hsv(hwb);
			return (Color.spaces.hsv.to.hsl(hsv));
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
		// eslint-disable-next-line no-unused-vars
		toString ({format, commas, inGamut, ...rest} = {}) {
				if (!format) {
				format = (c, i) => i > 0? c + "%" : c;
			}

			return Color.prototype.toString.call(this, {
				inGamut: true, // hwb() out of gamut makes no sense
				commas: false,  // never commas
				format,
				name: "hwb",
				...rest
			});
		  }
	 }
});
