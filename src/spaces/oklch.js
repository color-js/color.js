import ColorSpace from "../ColorSpace.js";
import OKLab from "./oklab.js";
import lch from "./lch.js";

export default new ColorSpace({
	id: "oklch",
	name: "Oklch",
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

	base: OKLab,
	fromBase: lch.fromBase,
	toBase: lch.toBase,

	formats: {
		"oklch": {
			coords: ["<percentage> | <number>", "<number> | <percentage>", "<number> | <angle>"],
		},
	},
});
