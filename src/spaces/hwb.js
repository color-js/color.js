import ColorSpace from "../ColorSpace.js";
import HSV from "./hsv.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

export default new ColorSpace({
	id: "hwb",
	name: "HWB",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		w: {
			range: [0, 100],
			name: "Whiteness",
		},
		b: {
			range: [0, 100],
			name: "Blackness",
		},
	},

	base: HSV,
	fromBase (hsv) {
		let [h, s, v] = hsv;

		return [h, v * (100 - s) / 100, 100 - v];
	},
	toBase (hwb) {
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

	formats: {
		"hwb": {
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
