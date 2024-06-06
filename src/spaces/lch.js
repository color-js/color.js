import ColorSpace from "../ColorSpace.js";
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
		// These methods are used for other polar forms as well, so we can't hardcode the ε
		if (this.ε === undefined) {
			let range = Object.values(this.base.coords)[1].refRange;
			let extent = range[1] - range[0];
			this.ε = extent / 100000;
		}

		// Convert to polar form
		let [L, a, b] = Lab;
		let isAchromatic = Math.abs(a) < this.ε && Math.abs(b) < this.ε;
		let h = isAchromatic ? null : constrainAngle(Math.atan2(b, a) * 180 / Math.PI);
		let C = isAchromatic ? 0 : Math.sqrt(a ** 2 + b ** 2);

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
			coords: ["<percentage> | <number>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
