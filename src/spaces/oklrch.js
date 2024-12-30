import ColorSpace from "../ColorSpace.js";
import OKLrab from "./oklrab.js";
import lch from "./lch.js";

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
	fromBase: lch.fromBase,
	toBase: lch.toBase,

	formats: {
		color: {
			coords: [
				"<percentage> | <number>",
				"<number> | <percentage>[0,1]",
				"<number> | <angle>",
			],
		},
	},
});
