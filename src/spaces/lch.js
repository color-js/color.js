import ColorSpace from "../space.js";
import Lab from "./lab.js";
import {constrain as constrainAngle} from "../angles.js";
import {isNone} from "../util.js";

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
		const ε = Number.EPSILON * 3;
		let [L, a, b] = Lab;
		let isAchromatic = Math.abs(a) < ε && Math.abs(b) < ε;
		let h = isAchromatic ? null : constrainAngle(Math.atan2(b, a) * 180 / Math.PI);
		let C = Math.sqrt(a ** 2 + b ** 2);

		return [ L, C, h ];
	},
	toBase (lch) {
		// Convert from polar form
		let [L, C, h] = lch;
		let a = null, b = null;

		if (!isNone(h)) {
			C = C < 0 ? 0 : C; // Clamp negative Chroma
			a = C * Math.cos(h * Math.PI / 180);
			b = C * Math.sin(h * Math.PI / 180);
		}

		return [ L, a, b ];
	},

	formats: {
		"lch": {
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
