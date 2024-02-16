import ColorSpace from "../space.js";
import sRGB from "./srgb.js";

export default new ColorSpace({
	id: "hsl",
	name: "HSL",
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
		l: {
			range: [0, 100],
			name: "Lightness",
		},
	},

	base: sRGB,

	// Adapted from https://drafts.csswg.org/css-color-4/better-rgbToHsl.js
	fromBase: rgb => {
		let max = Math.max(...rgb);
		let min = Math.min(...rgb);
		let [r, g, b] = rgb;
		let [h, s, l] = [NaN, 0, (min + max) / 2];
		let d = max - min;

		if (d !== 0) {
			s = (l === 0 || l === 1) ? 0 : (max - l) / Math.min(l, 1 - l);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4;
			}

			h = h * 60;
		}

		// Very out of gamut colors can produce negative saturation
		// If so, just rotate the hue by 180 and use a positive saturation
		// see https://github.com/w3c/csswg-drafts/issues/9222
		if (s < 0) {
			h += 180;
			s = Math.abs(s);
		}

		if (h >= 360) {
			h -= 360;
		}

		return [h, s * 100, l * 100];
	},

	// Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
	toBase: hsl => {
		let [h, s, l] = hsl;
		h = h % 360;

		if (h < 0) {
			h += 360;
		}

		s /= 100;
		l /= 100;

		function f (n) {
			let k = (n + h / 30) % 12;
			let a = s * Math.min(l, 1 - l);
			return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		}

		return [f(0), f(8), f(4)];
	},

	formats: {
		"hsl": {
			coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
		},
		"hsla": {
			coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
			commas: true,
			lastAlpha: true,
		},
	},
});
