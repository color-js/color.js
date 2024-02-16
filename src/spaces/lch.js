import ColorSpace from "../space.js";
import Lab from "./lab.js";
import {constrain as constrainAngle} from "../angles.js";

export default new ColorSpace({
	id: "lch",
	name: "LCH",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness",
		},
		c: {
			refRange: [0, 150],
			name: "Chroma",
		},
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},

	base: Lab,
	fromBase (Lab) {
		// Convert to polar form
		let [L, a, b] = Lab;
		let hue;
		const ε = 0.02;

		if (Math.abs(a) < ε && Math.abs(b) < ε) {
			hue = NaN;
		}
		else {
			hue = Math.atan2(b, a) * 180 / Math.PI;
		}

		return [
			L, // L is still L
			Math.sqrt(a ** 2 + b ** 2), // Chroma
			constrainAngle(hue), // Hue, in degrees [0 to 360)
		];
	},
	toBase (LCH) {
		// Convert from polar form
		let [Lightness, Chroma, Hue] = LCH;
		// Clamp any negative Chroma
		if (Chroma < 0) {
			Chroma = 0;
		}
		// Deal with NaN Hue
		if (isNaN(Hue)) {
			Hue = 0;
		}
		return [
			Lightness, // L is still L
			Chroma * Math.cos(Hue * Math.PI / 180), // a
			Chroma * Math.sin(Hue * Math.PI / 180),  // b
		];
	},

	formats: {
		"lch": {
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
