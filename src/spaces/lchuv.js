import ColorSpace from "../ColorSpace.js";
import Luv from "./luv.js";
import lch from "./lch.js";

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
	fromBase: lch.fromBase,
	toBase: lch.toBase,

	formats: {
		color: {
			id: "--lchuv",
			coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
