import ColorSpace from "../space.js";
import Luv from "./luv.js";
import {constrain as constrainAngle} from "../angles.js";

export default new ColorSpace({
	id: "lchuv",
	name: "LChuv",
	coords: {
		l: {
			refRange: [0, 100],
			name: "Lightness",
		},
		c: {
			refRange: [0, 220],
			name: "Chroma",
		},
		h: {
			refRange: [0, 360],
			type: "angle",
			name: "Hue",
		},
	},

	base: Luv,
	fromBase (Luv) {
		// Convert to polar form
		let [L, u, v] = Luv;
		let hue;
		const ε = 0.02;

		if (Math.abs(u) < ε && Math.abs(v) < ε) {
			hue = NaN;
		}
		else {
			hue = Math.atan2(v, u) * 180 / Math.PI;
		}

		return [
			L, // L is still L
			Math.sqrt(u ** 2 + v ** 2), // Chroma
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
			Chroma * Math.cos(Hue * Math.PI / 180), // u
			Chroma * Math.sin(Hue * Math.PI / 180),  // v
		];
	},

	formats: {
		color: {
			id: "--lchuv",
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
