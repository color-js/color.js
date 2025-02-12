import ColorSpace from "../ColorSpace.js";
import sRGB from "./srgb.js";

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

	base: sRGB,
	// https://en.wikipedia.org/wiki/HSL_and_HSV#Formal_derivation
	fromBase (rgb) {
		let max = Math.max(...rgb);
		let min = Math.min(...rgb);
		let [r, g, b] = rgb;
		let [h, s, v] = [null, 0, max];
		let d = max - min;

		if (d !== 0) {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
			}

			h = h * 60;
		}

		if (v) {
			s = d / v;
		}

		if (h >= 360) {
			h -= 360;
		}

		return [h, s * 100, v * 100];
	},
	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative
	toBase (hsv) {
		let [h, s, v] = hsv;
		h = h % 360;

		if (h < 0) {
			h += 360;
		}

		s /= 100;
		v /= 100;

		function f (n) {
			let k = (n + h / 60) % 6;
			return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
		}

		return [f(5), f(3), f(1)];
	},

	formats: {
		color: {
			id: "--hsv",
			coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"],
		},
	},
});
