import ColorSpace from "../ColorSpace.js";
import {rgbToHsl, hslToRgb} from "./hsl.js";
import sRGB from "./srgb.js";

// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.
//
// The current implementation of HSL normalizes negative saturation, and while
// the resultant values, if used as a base for HSV conversion, are compatible
// and will round trip well, it can often produce negative saturation in HSV for
// out of gamut colors in HSV just due to how the HSV algorithm is defined.
//
// Additionally, HWB currently uses HSV as a base for conversion and, if HSL
// negative saturation normalization is propagated through HSL -> HSV -> HWB,
// round trip can break down as the HWB algorithm does not mathematically
// account for such normalization. So HSV forces conversion directly through
// sRGB and will calculate an non-normalized HSL base for conversion. HSV can
// then be used safely as a base for HWB conversion.

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

	base: sRGB,
	// https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
	fromBase (rgb) {
		let [h, s, l] = rgbToHsl(rgb);
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

		const hsl = [
			h, // h is the same
			(l === 0 || l === 1) ? 0 : ((v - l) / Math.min(l, 1 - l)) * 100,
			l * 100,
		];

		return hslToRgb(hsl);
	},

	formats: {
		color: {
			id: "--hsv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
