import ColorSpace from "../space.js";
import HSL from "./hsl.js";

// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.

export default new ColorSpace({
	id: "hsv",
	name: "HSV",
	coords: {
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
		s: {
			range: [0, 100],
			name: "Saturation",
		},
		v: {
			range: [0, 100],
			name: "Value",
		},
	},

	base: HSL,
	// https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
	fromBase (hsl) {
		let [h, s, l] = hsl;
		s /= 100;
		l /= 100;

		let v = l + s * Math.min(l, 1 - l);

		return [
			h, // h is the same
			v === 0 ? 0 : 200 * (1 - l / v), // s
			100 * v,
		];
	},
	// https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
	toBase (hsv) {
		let [h, s, v] = hsv;

		s /= 100;
		v /= 100;

		let l = v * (1 - s / 2);

		return [
			h, // h is the same
			(l === 0 || l === 1) ? 0 : ((v - l) / Math.min(l, 1 - l)) * 100,
			l * 100,
		];
	},

	formats: {
		color: {
			id: "--hsv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
