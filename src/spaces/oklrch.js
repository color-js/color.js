import ColorSpace from "../space.js";
import OKLrab from "./oklrab.js";
import {toe, toeInv} from "./okhsl.js";
import {constrain as constrainAngle} from "../angles.js";
import {isNone} from "../util.js";

export default new ColorSpace({
	id: "oklrch",
	name: "Oklrch",
	coords: {
		l: {
			refRange: [0, 1],
			name: "Lightness",
		},
		c: {
			refRange: [0, 0.4],
			name: "Chroma",
		},
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},
	white: "D65",

	base: OKLrab,
	fromBase (oklab) {
		// Convert to polar form
		let [L, a, b] = oklab;
		let h;
		const ε = 0.0002; // chromatic components much smaller than a,b

		if (Math.abs(a) < ε && Math.abs(b) < ε) {
			h = NaN;
		}
		else {
			h = Math.atan2(b, a) * 180 / Math.PI;
		}

		return [
			L, // OKLab L is still L
			Math.sqrt(a ** 2 + b ** 2), // Chroma
			constrainAngle(h), // Hue, in degrees [0 to 360)
		];
	},
	// Convert from polar form
	toBase (oklch) {
		let [L, C, h] = oklch;
		let a, b;

		// check for NaN hue
		if (isNone(h)) {
			a = 0;
			b = 0;
		}
		else {
			a = C * Math.cos(h * Math.PI / 180);
			b = C * Math.sin(h * Math.PI / 180);
		}

		return [ L, a, b ];
	},

	formats: {
		"color": {
			coords: ["<percentage> | <number>", "<number> | <percentage>[0,1]", "<number> | <angle>"],
		},
	},
});
